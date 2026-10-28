const express = require('express');
const https = require('https');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'taskpane.html'));
});

// Endpoint de diagnóstico del servidor
app.get('/api/status', (req, res) => {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;

    res.json({
        status: 'online',
        providerSupport: ['gemini', 'openai', 'claude', 'local_ollama'],
        hasEnvKeys: {
            gemini: hasGeminiKey,
            openai: hasOpenAIKey,
            claude: hasClaudeKey
        },
        supportedModels: {
            gemini: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
            openai: ['gpt-4o', 'gpt-4o-mini'],
            claude: ['claude-3-5-sonnet-20241022']
        }
    });
});

// ---------------------------------------------------------------------
// Multi-Provider AI Dispatcher
// ---------------------------------------------------------------------
async function callAiProvider({
    provider = 'gemini',
    model = 'gemini-3.8-flash',
    systemPrompt = '',
    messages = [],
    apiKey = '',
    customEndpoint = '',
    temperature = 0.4,
    useWebSearch = false
}) {
    // 1. PROVIDER: GOOGLE GEMINI
    if (provider === 'gemini') {
        const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
        if (!effectiveKey) {
            throw new Error('No se encontró la Gemini API Key. Configúrala en la pestaña de Ajustes o en el archivo .env.');
        }

        // Normalizar modelo
        let normalizedModel = model;
        if (model.includes('pro')) {
            normalizedModel = 'gemini-3.1-pro-preview';
        } else {
            normalizedModel = 'gemini-3.8-flash';
        }

        const candidateModels = normalizedModel === 'gemini-3.1-pro-preview' 
            ? ['gemini-3.1-pro-preview', 'gemini-3.8-flash']
            : ['gemini-3.8-flash', 'gemini-3.1-pro-preview'];

        // Construir contenido para Gemini
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const reqBody = {
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            contents: contents,
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: 4096
            }
        };

        if (useWebSearch) {
            reqBody.tools = [{ googleSearch: {} }];
        }

        let lastError = null;
        for (const currentModel of candidateModels) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${effectiveKey}`;
                try {
                    const resp = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(reqBody)
                    });

                    if (resp.ok) {
                        const data = await resp.json();
                        const candidate = data.candidates?.[0];
                        const text = candidate?.content?.parts?.map(p => p.text || '').join('\n') || '';

                        let sources = [];
                        if (candidate?.groundingMetadata?.groundingChunks) {
                            sources = candidate.groundingMetadata.groundingChunks
                                .filter(c => c.web?.uri && c.web?.title)
                                .map(c => ({ title: c.web.title, url: c.web.uri }));
                        }

                        return { text, sources, modelUsed: currentModel, provider: 'gemini' };
                    }

                    const errData = await resp.json().catch(() => ({}));
                    lastError = errData.error?.message || `HTTP ${resp.status}: ${resp.statusText}`;

                    if (resp.status === 503 || resp.status === 429) {
                        await new Promise(r => setTimeout(r, attempt * 1500));
                    } else {
                        break;
                    }
                } catch (e) {
                    lastError = e.message;
                    await new Promise(r => setTimeout(r, attempt * 1000));
                }
            }
        }
        throw new Error(lastError || 'Error al comunicarse con Gemini');
    }

    // 2. PROVIDER: OPENAI O COMPATIBLE (Ollama / Local / LM Studio)
    if (provider === 'openai' || provider === 'local_ollama') {
        const effectiveKey = apiKey || (provider === 'openai' ? process.env.OPENAI_API_KEY : 'ollama');
        const defaultBase = provider === 'openai' ? 'https://api.openai.com/v1' : 'http://localhost:11434/v1';
        const baseUrl = customEndpoint || defaultBase;

        const openAiMessages = [];
        if (systemPrompt) {
            openAiMessages.push({ role: 'system', content: systemPrompt });
        }
        for (const m of messages) {
            openAiMessages.push({ role: m.role, content: m.content });
        }

        const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveKey}`
            },
            body: JSON.stringify({
                model: model || (provider === 'openai' ? 'gpt-4o' : 'llama3'),
                messages: openAiMessages,
                temperature: temperature,
                max_tokens: 4096
            })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error?.message || `Error HTTP ${resp.status}: ${resp.statusText}`);
        }

        const data = await resp.json();
        const text = data.choices?.[0]?.message?.content || '';
        return { text, sources: [], modelUsed: model, provider };
    }

    // 3. PROVIDER: ANTHROPIC CLAUDE
    if (provider === 'claude') {
        const effectiveKey = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!effectiveKey) {
            throw new Error('No se encontró la Anthropic API Key.');
        }

        const claudeMessages = messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
        }));

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': effectiveKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model || 'claude-3-5-sonnet-20241022',
                system: systemPrompt,
                messages: claudeMessages,
                max_tokens: 4096,
                temperature: temperature
            })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error?.message || `Error HTTP ${resp.status}: ${resp.statusText}`);
        }

        const data = await resp.json();
        const text = data.content?.map(c => c.text || '').join('\n') || '';
        return { text, sources: [], modelUsed: model, provider: 'claude' };
    }

    throw new Error(`Proveedor de IA desconocido: ${provider}`);
}

// ---------------------------------------------------------------------
// Endpoints de la API
// ---------------------------------------------------------------------

// 1. Chat Interactivo en Tiempo Real (Conversación Continua y Confirmación)
app.post('/api/chat/conversation', async (req, res) => {
    try {
        const {
            messages = [],
            documentContext = '',
            selectionContext = '',
            crossFileContext = '',
            trackChangesMode = false,
            provider = 'gemini',
            model = 'gemini-3.8-flash',
            apiKey = '',
            customEndpoint = '',
            useWebSearch = false
        } = req.body;

        const systemPrompt = `Eres el Asistente Editorial y Copiloto de Ingeniería Documental para Microsoft Word.
Tu objetivo es colaborar de forma cercana, precisa y profesional con el autor para perfeccionar su documento.

DIRECTIVAS OBLIGATORIAS DE INTERACCIÓN:
1. DIÁLOGO COLABORATIVO ("PREGUNTA ANTES DE MODIFICAR"):
   - Antes de lanzar reescrituras masivas o alteraciones profundas, explica brevemente el motivo de la mejora y formula preguntas directas, claras y cortas para confirmar la intención del usuario.
   - Permite que el autor opine o elija entre opciones cuando proceda.
2. ESTRUCTURA DE RESPUESTA:
   - Sé claro, conciso y cordial.
   - Cuando entregues texto listo para insertarse en Word, enmárcalo claramente en un bloque con triple tilde:
     \`\`\`word_text
     [Texto final que se insertará en el documento]
     \`\`\`
   - Si propones una tabla para insertar en Word:
     \`\`\`json_table
     {
       "headers": ["Columna 1", "Columna 2"],
       "rows": [["Dato 1", "Dato 2"]]
     }
     \`\`\`
   - Si sugieres un comentario para el documento:
     \`\`\`word_comment
     [Texto conciso del comentario]
     \`\`\`
3. CONTEXTO CRUZADO:
   - Si el usuario adjunta datos de Excel, presentaciones o archivos externos, analiza las cifras con exactitud matemática y cita la fuente del archivo.
4. ESTILO Y PRIVACIDAD:
   - Jamás incluyas firmas de bot, metadatos artificiales ni menciones a sistemas de IA. Todo debe ser redactado con estilo académico o profesional formal humano.`;

        // Construir historial de mensajes con contexto enriquecido
        const finalMessages = [];

        if (documentContext || selectionContext || crossFileContext) {
            let contextNote = "--- CONTEXTO ACTIVO DE MICROSOFT WORD ---";
            if (selectionContext) {
                contextNote += `\n[TEXTO SELECCIONADO ACTUALMENTE CON EL CURSOR]:\n"""\n${selectionContext}\n"""`;
            }
            if (documentContext) {
                contextNote += `\n[DOCUMENTO COMPLETO ABIERTO]:\n"""\n${documentContext.substring(0, 150000)}\n"""`;
            }
            if (crossFileContext) {
                contextNote += `\n[DATOS ADJUNTADOS DE ARCHIVO EXTERNO (Excel/PPTX/CSV)]:\n"""\n${crossFileContext}\n"""`;
            }
            if (trackChangesMode) {
                contextNote += `\n[MODO CONTROL DE CAMBIOS]: ACTIVO. Sugiere adiciones y eliminaciones explícitas.`;
            }
            contextNote += "\n--- FIN CONTEXTO ---";

            finalMessages.push({ role: 'user', content: contextNote });
            finalMessages.push({ role: 'assistant', content: 'Entendido. Tengo cargado el contexto del documento y los datos externos para interactuar contigo. ¿En qué sección o tarea deseas que nos enfoquemos primero?' });
        }

        // Agregar los mensajes de la conversación
        for (const m of messages) {
            finalMessages.push(m);
        }

        const result = await callAiProvider({
            provider,
            model,
            systemPrompt,
            messages: finalMessages,
            apiKey,
            customEndpoint,
            temperature: 0.35,
            useWebSearch
        });

        res.json(result);
    } catch (err) {
        console.error('Error en /api/chat/conversation:', err.message);
        res.status(500).json({ error: err.message || 'Error interno en la conversación' });
    }
});

// 2. Ejecución Directa de Acciones Rápidas (Reescritura, Auditoría, Resumen, etc.)
app.post('/api/chat', async (req, res) => {
    try {
        const {
            prompt = '',
            contextText = '',
            action = 'general',
            tone = 'formal',
            model = 'gemini-3.8-flash',
            provider = 'gemini',
            apiKey = '',
            customEndpoint = '',
            useWebSearch = false,
            tableFormat = false
        } = req.body;

        let systemPrompt = `Eres un asistente experto de redacción científica, metodología y edición para Microsoft Word.
Responde siempre con el más alto rigor profesional, respetando las normas gramaticales, estilísticas y académicas.`;

        let userPrompt = '';
        if (action === 'rewrite') {
            userPrompt = `Reescribe y perfecciona el siguiente texto seleccionado en Word.
Tono solicitado: ${tone}.
Mantén el significado central pero optimiza la cadencia, claridad y elegancia sintáctica.
Texto a reescribir:
"""
${contextText}
"""
${prompt ? `Instrucción particular: ${prompt}` : ''}
Entrega el texto reescrito en un bloque:
\`\`\`word_text
[Texto reescrito aquí]
\`\`\``;
        } else if (action === 'audit') {
            userPrompt = `Realiza una auditoría exhaustiva de coherencia, lógica interna, cifras y estilo sobre el siguiente documento de Word:
"""
${contextText}
"""
Evalúa detalladamente:
1. **Coherencia y consistencia lógica:** Detección de vacíos, saltos argumentales o contradicciones.
2. **Consistencia numérica y metodológica:** Validación de cifras, muestras, porcentajes o totales.
3. **Inconsistencias terminológicas:** Términos dispares para un mismo concepto o siglas sin definir.
4. **Estilo, fluidez y normas:** Persona gramatical, concordancia y redacción formal.
5. **Recomendaciones de mejora:** Puntos específicos y accionables para el autor.`;
        } else if (action === 'comment') {
            userPrompt = `Para el siguiente texto de Word:
"""
${contextText}
"""
Instrucción: ${prompt || 'Formula una sugerencia constructiva de mejora.'}
Redacta un COMENTARIO DE REVISIÓN profesional y conciso (máximo 2 a 3 oraciones):
\`\`\`word_comment
[Texto del comentario]
\`\`\``;
        } else if (action === 'summarize') {
            userPrompt = `Elabora un resumen ejecutivo de alta calidad del siguiente contenido de Word:
"""
${contextText}
"""
${prompt ? `Instrucción: ${prompt}` : ''}`;
        } else if (action === 'expand') {
            userPrompt = `Expande y fundamenta en profundidad el siguiente texto con argumentos sólidos y explicaciones claras:
"""
${contextText}
"""
Tono: ${tone}.
${prompt ? `Instrucción: ${prompt}` : ''}`;
        } else {
            userPrompt = prompt;
            if (contextText) {
                userPrompt += `\n\nContexto del documento:\n"""\n${contextText}\n"""`;
            }
        }

        const result = await callAiProvider({
            provider,
            model,
            systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            apiKey,
            customEndpoint,
            temperature: action === 'audit' ? 0.2 : 0.4,
            useWebSearch
        });

        res.json(result);
    } catch (err) {
        console.error('Error en /api/chat:', err.message);
        res.status(500).json({ error: err.message || 'Error en el procesamiento del texto' });
    }
});

// 3. Procesamiento por Lotes (Batch Multi-Document Processor)
app.post('/api/batch-process', async (req, res) => {
    try {
        const { folderPath, action = 'audit', fileExtension = '.docx' } = req.body;
        if (!folderPath || !fs.existsSync(folderPath)) {
            return res.status(400).json({ error: 'Ruta de directorio no válida o inaccesible.' });
        }

        const files = fs.readdirSync(folderPath)
            .filter(f => f.toLowerCase().endsWith(fileExtension.toLowerCase()) && !f.startsWith('~$'));

        res.json({
            folderPath,
            filesFound: files.length,
            fileList: files,
            status: 'ready'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------------------
// Carga de Certificados SSL y Arranque HTTPS
// ---------------------------------------------------------------------
const os = require('os');

async function getSslOptions() {
    const certDir = path.join(os.homedir(), '.office-addin-dev-certs');
    const certPath = path.join(certDir, 'localhost.crt');
    const keyPath = path.join(certDir, 'localhost.key');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        try {
            const cert = fs.readFileSync(certPath);
            const key = fs.readFileSync(keyPath);
            console.log('✓ Certificados SSL locales cargados desde', certDir);
            return { key, cert };
        } catch (e) {
            console.warn('! Error leyendo certificados existentes, generando temporales con selfsigned...');
        }
    }

    const selfsigned = require('selfsigned');
    const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 365 });
    console.log('✓ Certificados SSL generados automáticamente.');
    return { key: pems.private, cert: pems.cert };
}

async function startServer() {
    const sslOptions = await getSslOptions();
    const httpsServer = https.createServer(sslOptions, app);

    httpsServer.listen(PORT, () => {
        console.log(`===================================================================`);
        console.log(`  Asistente Editorial para Microsoft Word iniciado exitosamente`);
        console.log(`  Servidor Seguro: https://localhost:${PORT}`);
        console.log(`  Panel Word:      https://localhost:${PORT}/taskpane.html`);
        console.log(`  Multi-IA:        Gemini, OpenAI, Claude y Modelos Locales (Ollama)`);
        console.log(`===================================================================`);
    });
}

startServer();
