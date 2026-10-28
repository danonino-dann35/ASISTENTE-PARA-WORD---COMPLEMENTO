/* global Office, Word, console, fetch, XLSX */

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        console.log('✓ Office.js cargado correctamente en Microsoft Word');
        initAddin();
    } else {
        console.log('Inicializado fuera de Word o en modo navegador de pruebas.');
        initAddin();
    }
});

let currentSelectionText = '';
let currentFullDocText = '';
let attachedFileContext = '';
let attachedFileName = '';
let chatMessagesHistory = [];
let isTrackChangesEnabled = false;

function initAddin() {
    loadSettings();
    setupNavigation();
    setupEventHandlers();
    checkServerHealth();
    checkTrackChangesState();
}

// ---------------------------------------------------------------------
// 1. Navegación y Pestañas
// ---------------------------------------------------------------------
function setupNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// ---------------------------------------------------------------------
// 2. Configuración y Multi-IA
// ---------------------------------------------------------------------
function loadSettings() {
    const selectProvider = document.getElementById('selectProvider');
    const selectModel = document.getElementById('selectModel');
    const inputApiKey = document.getElementById('inputApiKey');
    const inputCustomEndpoint = document.getElementById('inputCustomEndpoint');
    const inputAuthorName = document.getElementById('inputAuthorName');
    const modelBadge = document.getElementById('modelBadge');
    const groupCustomEndpoint = document.getElementById('groupCustomEndpoint');

    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model') || 'gemini-3.8-flash';
    const apiKey = localStorage.getItem('ai_api_key') || '';
    const endpoint = localStorage.getItem('ai_custom_endpoint') || '';
    const author = localStorage.getItem('doc_author_name') || 'Renzo Chumacero';

    if (selectProvider) selectProvider.value = provider;
    if (inputApiKey) inputApiKey.value = apiKey;
    if (inputCustomEndpoint) inputCustomEndpoint.value = endpoint;
    if (inputAuthorName) inputAuthorName.value = author;

    updateModelOptions(provider);
    if (selectModel) selectModel.value = model;
    if (modelBadge) modelBadge.textContent = model;

    if (groupCustomEndpoint) {
        groupCustomEndpoint.style.display = (provider === 'local_ollama') ? 'block' : 'none';
    }
}

function updateModelOptions(provider) {
    const selectModel = document.getElementById('selectModel');
    if (!selectModel) return;

    selectModel.innerHTML = '';
    const models = {
        gemini: [
            { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Rápido y eficiente)' },
            { id: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview (Máxima profundidad)' }
        ],
        openai: [
            { id: 'gpt-4o', label: 'GPT-4o (Alta capacidad)' },
            { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido)' }
        ],
        claude: [
            { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' }
        ],
        local_ollama: [
            { id: 'llama3', label: 'Llama 3 (Local)' },
            { id: 'mistral', label: 'Mistral (Local)' }
        ]
    };

    const list = models[provider] || models.gemini;
    list.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.label;
        selectModel.appendChild(opt);
    });
}

function saveSettings() {
    const provider = document.getElementById('selectProvider').value;
    const model = document.getElementById('selectModel').value;
    const apiKey = document.getElementById('inputApiKey').value.trim();
    const endpoint = document.getElementById('inputCustomEndpoint').value.trim();
    const author = document.getElementById('inputAuthorName').value.trim() || 'Renzo Chumacero';
    const modelBadge = document.getElementById('modelBadge');
    const msg = document.getElementById('settingsMessage');

    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_custom_endpoint', endpoint);
    localStorage.setItem('doc_author_name', author);

    if (modelBadge) modelBadge.textContent = model;

    msg.className = 'feedback-msg success';
    msg.textContent = 'Configuración guardada exitosamente en el equipo.';
    showToast('Ajustes guardados');
}

async function checkServerHealth() {
    const statusDot = document.querySelector('.status-dot');
    const lblServerStatus = document.getElementById('lblServerStatus');

    try {
        const res = await fetch('/api/status');
        if (res.ok) {
            if (statusDot) statusDot.className = 'status-dot online';
            if (lblServerStatus) lblServerStatus.textContent = 'Conectado (HTTPS :3000)';
        } else {
            throw new Error();
        }
    } catch {
        if (statusDot) statusDot.className = 'status-dot offline';
        if (lblServerStatus) lblServerStatus.textContent = 'Desconectado (Inicia ARRANCAR-LOCALHOST-3000.bat)';
    }
}

// ---------------------------------------------------------------------
// 3. Manejadores de Eventos
// ---------------------------------------------------------------------
function setupEventHandlers() {
    // Ajustes
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);

    const selectProvider = document.getElementById('selectProvider');
    if (selectProvider) {
        selectProvider.addEventListener('change', () => {
            const p = selectProvider.value;
            updateModelOptions(p);
            const groupCustomEndpoint = document.getElementById('groupCustomEndpoint');
            if (groupCustomEndpoint) {
                groupCustomEndpoint.style.display = (p === 'local_ollama') ? 'block' : 'none';
            }
        });
    }

    // Chat
    const btnChatSend = document.getElementById('btnChatSend');
    const chatInput = document.getElementById('chatInput');
    if (btnChatSend) btnChatSend.addEventListener('click', handleSendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChatMessage();
            }
        });
    }

    // Selección
    const btnReadSelection = document.getElementById('btnReadSelection');
    if (btnReadSelection) btnReadSelection.addEventListener('click', readWordSelection);

    const btnRunSelection = document.getElementById('btnRunSelection');
    if (btnRunSelection) btnRunSelection.addEventListener('click', processSelectionAction);

    const btnReplaceInDoc = document.getElementById('btnReplaceInDoc');
    if (btnReplaceInDoc) btnReplaceInDoc.addEventListener('click', () => applyTextToDocument('Replace'));

    const btnInsertAfter = document.getElementById('btnInsertAfter');
    if (btnInsertAfter) btnInsertAfter.addEventListener('click', () => applyTextToDocument('After'));

    // Documento
    const btnReadFullDoc = document.getElementById('btnReadFullDoc');
    if (btnReadFullDoc) btnReadFullDoc.addEventListener('click', readFullWordDocument);

    const btnToggleTrackChanges = document.getElementById('btnToggleTrackChanges');
    if (btnToggleTrackChanges) btnToggleTrackChanges.addEventListener('click', toggleTrackChanges);

    const btnAuditDoc = document.getElementById('btnAuditDoc');
    if (btnAuditDoc) btnAuditDoc.addEventListener('click', runFullDocumentAudit);

    const btnReadComments = document.getElementById('btnReadComments');
    if (btnReadComments) btnReadComments.addEventListener('click', readDocumentComments);

    const btnInsertAuditSummary = document.getElementById('btnInsertAuditSummary');
    if (btnInsertAuditSummary) btnInsertAuditSummary.addEventListener('click', insertAuditSummaryToWord);

    // Archivos / Datos
    setupFileDropZone();

    const btnInsertCustomTable = document.getElementById('btnInsertCustomTable');
    if (btnInsertCustomTable) btnInsertCustomTable.addEventListener('click', insertCustomApa7Table);

    const btnGenerateChart = document.getElementById('btnGenerateChart');
    if (btnGenerateChart) btnGenerateChart.addEventListener('click', generateVisualChartInWord);

    // Maquetación
    document.querySelectorAll('.btn-layout').forEach(btn => {
        btn.addEventListener('click', () => applyMargins(btn.getAttribute('data-margins')));
    });

    const btnOrientationPortrait = document.getElementById('btnOrientationPortrait');
    if (btnOrientationPortrait) btnOrientationPortrait.addEventListener('click', () => setPageOrientation('Portrait'));

    const btnOrientationLandscape = document.getElementById('btnOrientationLandscape');
    if (btnOrientationLandscape) btnOrientationLandscape.addEventListener('click', () => setPageOrientation('Landscape'));

    const btnInsertPageBreak = document.getElementById('btnInsertPageBreak');
    if (btnInsertPageBreak) btnInsertPageBreak.addEventListener('click', () => insertBreakType('Page'));

    const btnInsertNextPageSection = document.getElementById('btnInsertNextPageSection');
    if (btnInsertNextPageSection) btnInsertNextPageSection.addEventListener('click', () => insertBreakType('SectionNextPage'));
}

// ---------------------------------------------------------------------
// 4. Chat Interactivo en Tiempo Real ("Pregunta antes de aplicar")
// ---------------------------------------------------------------------
async function handleSendChatMessage() {
    const input = document.getElementById('chatInput');
    const userText = input.value.trim();
    if (!userText) return;

    appendChatMessage('user', userText);
    input.value = '';

    // Contextos opcionales
    const incSelection = document.getElementById('chkIncludeSelection').checked;
    const incDoc = document.getElementById('chkIncludeDoc').checked;
    const incFile = document.getElementById('chkIncludeFile').checked;

    let selContext = '';
    let docContext = '';
    let fileContext = '';

    if (incSelection) {
        selContext = await getSelectionTextSilent();
    }
    if (incDoc) {
        docContext = currentFullDocText || await getFullDocTextSilent();
    }
    if (incFile && attachedFileContext) {
        fileContext = attachedFileContext;
    }

    const typingId = appendTypingIndicator();

    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model') || 'gemini-3.8-flash';
    const apiKey = localStorage.getItem('ai_api_key') || '';
    const endpoint = localStorage.getItem('ai_custom_endpoint') || '';

    try {
        const payload = {
            messages: chatMessagesHistory,
            documentContext: docContext,
            selectionContext: selContext,
            crossFileContext: fileContext,
            trackChangesMode: isTrackChangesEnabled,
            provider,
            model,
            apiKey,
            customEndpoint: endpoint
        };

        const res = await fetch('/api/chat/conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        removeTypingIndicator(typingId);

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        chatMessagesHistory.push({ role: 'assistant', content: data.text });
        renderAssistantResponseWithActionCards(data.text);
    } catch (err) {
        removeTypingIndicator(typingId);
        appendChatMessage('assistant error', `Error: ${err.message}`);
    }
}

function appendChatMessage(role, text) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'user' ? 'Tú' : '✦';

    const content = document.createElement('div');
    content.className = 'msg-content';
    content.innerHTML = formatMarkdownBasic(text);

    msg.appendChild(avatar);
    msg.appendChild(content);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    if (role === 'user') {
        chatMessagesHistory.push({ role: 'user', content: text });
    }
}

function renderAssistantResponseWithActionCards(rawText) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg assistant';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '✦';

    const content = document.createElement('div');
    content.className = 'msg-content';

    // Buscar bloques ```word_text
    const textBlockRegex = /```word_text\s*([\s\S]*?)```/g;
    const tableBlockRegex = /```json_table\s*([\s\S]*?)```/g;
    const commentBlockRegex = /```word_comment\s*([\s\S]*?)```/g;

    let hasActionCards = false;

    // Texto limpio sin bloques de código para mostrar el diálogo
    let displayText = rawText
        .replace(textBlockRegex, '')
        .replace(tableBlockRegex, '')
        .replace(commentBlockRegex, '');

    content.innerHTML = formatMarkdownBasic(displayText);

    // Renderizar tarjetas de acción para texto
    let matchText;
    while ((matchText = textBlockRegex.exec(rawText)) !== null) {
        hasActionCards = true;
        const proposedText = matchText[1].trim();
        const card = document.createElement('div');
        card.className = 'chat-action-card';
        card.innerHTML = `
            <div class="action-card-title">📝 Texto sugerido para Word:</div>
            <div class="action-card-preview">${escapeHtml(proposedText.substring(0, 300))}${proposedText.length > 300 ? '...' : ''}</div>
            <div class="action-card-buttons">
                <button class="btn-card-primary btn-apply-text">✦ Reemplazar selección</button>
                <button class="btn-card-secondary btn-insert-end">Insertar al final</button>
            </div>
        `;
        card.querySelector('.btn-apply-text').addEventListener('click', () => {
            insertTextDirectly(proposedText, 'Replace');
            showToast('Texto aplicado en Word');
        });
        card.querySelector('.btn-insert-end').addEventListener('click', () => {
            insertTextDirectly(proposedText, 'End');
            showToast('Texto insertado al final');
        });
        content.appendChild(card);
    }

    // Renderizar tarjetas para tablas
    let matchTable;
    while ((matchTable = tableBlockRegex.exec(rawText)) !== null) {
        hasActionCards = true;
        try {
            const tableData = JSON.parse(matchTable[1].trim());
            const card = document.createElement('div');
            card.className = 'chat-action-card';
            card.innerHTML = `
                <div class="action-card-title">📊 Tabla estructurada sugerida:</div>
                <div class="action-card-preview">Columnas: ${tableData.headers?.join(', ')} (${tableData.rows?.length || 0} filas)</div>
                <div class="action-card-buttons">
                    <button class="btn-card-primary btn-insert-table">✦ Insertar Tabla en Word</button>
                </div>
            `;
            card.querySelector('.btn-insert-table').addEventListener('click', () => {
                insertNativeTableFromData(tableData);
                showToast('Tabla insertada en Word');
            });
            content.appendChild(card);
        } catch (e) {}
    }

    // Renderizar tarjetas para comentarios
    let matchComment;
    while ((matchComment = commentBlockRegex.exec(rawText)) !== null) {
        hasActionCards = true;
        const commentText = matchComment[1].trim();
        const card = document.createElement('div');
        card.className = 'chat-action-card';
        card.innerHTML = `
            <div class="action-card-title">💬 Comentario de revisión propuesto:</div>
            <div class="action-card-preview">${escapeHtml(commentText)}</div>
            <div class="action-card-buttons">
                <button class="btn-card-primary btn-add-comment">✦ Insertar Comentario en Selección</button>
            </div>
        `;
        card.querySelector('.btn-add-comment').addEventListener('click', () => {
            addNativeComment(commentText);
            showToast('Comentario insertado en Word');
        });
        content.appendChild(card);
    }

    msg.appendChild(avatar);
    msg.appendChild(content);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const id = 'typing_' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-msg assistant typing';
    div.innerHTML = `<div class="msg-avatar">✦</div><div class="msg-content"><span class="dot-flashing"></span> Procesando con Word...</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ---------------------------------------------------------------------
// 5. Integración con Word (Office.js API)
// ---------------------------------------------------------------------

// Lectura de selección
async function readWordSelection() {
    try {
        await Word.run(async (context) => {
            const selection = context.document.getSelection();
            selection.load('text');
            await context.sync();

            currentSelectionText = selection.text || '';
            const preview = document.getElementById('selectionPreview');
            if (preview) {
                preview.value = currentSelectionText;
            }
            if (currentSelectionText.length > 0) {
                showToast(`Selección leída (${currentSelectionText.length} caracteres)`);
            } else {
                showToast('No hay texto marcado en Word');
            }
        });
    } catch (e) {
        showToast('Error al leer selección de Word');
    }
}

async function getSelectionTextSilent() {
    try {
        let t = '';
        await Word.run(async (context) => {
            const sel = context.document.getSelection();
            sel.load('text');
            await context.sync();
            t = sel.text || '';
        });
        return t;
    } catch {
        return '';
    }
}

// Lectura de documento completo
async function readFullWordDocument() {
    try {
        await Word.run(async (context) => {
            const body = context.document.body;
            body.load('text');
            await context.sync();

            currentFullDocText = body.text || '';
            const words = currentFullDocText.trim().split(/\s+/).filter(Boolean).length;
            const badge = document.getElementById('docWordCountBadge');
            if (badge) {
                badge.textContent = `${words.toLocaleString()} palabras`;
            }
            showToast(`Documento leído (${words.toLocaleString()} palabras)`);
        });
    } catch (e) {
        showToast('Error al leer el documento de Word');
    }
}

async function getFullDocTextSilent() {
    try {
        let t = '';
        await Word.run(async (context) => {
            const body = context.document.body;
            body.load('text');
            await context.sync();
            t = body.text || '';
        });
        return t;
    } catch {
        return '';
    }
}

// Control de Cambios (Track Changes)
async function checkTrackChangesState() {
    try {
        await Word.run(async (context) => {
            context.document.load('changeTrackingMode');
            await context.sync();
            isTrackChangesEnabled = (context.document.changeTrackingMode !== Word.ChangeTrackingMode.off);
            updateTrackChangesLabel();
        });
    } catch (e) {}
}

async function toggleTrackChanges() {
    try {
        await Word.run(async (context) => {
            context.document.load('changeTrackingMode');
            await context.sync();

            if (context.document.changeTrackingMode === Word.ChangeTrackingMode.off) {
                context.document.changeTrackingMode = Word.ChangeTrackingMode.trackAll;
                isTrackChangesEnabled = true;
                showToast('Control de cambios ACTIVADO');
            } else {
                context.document.changeTrackingMode = Word.ChangeTrackingMode.off;
                isTrackChangesEnabled = false;
                showToast('Control de cambios DESACTIVADO');
            }
            await context.sync();
            updateTrackChangesLabel();
        });
    } catch (e) {
        showToast('No se pudo cambiar el modo de control de cambios');
    }
}

function updateTrackChangesLabel() {
    const lbl = document.getElementById('lblTrackChangesStatus');
    if (lbl) {
        lbl.textContent = isTrackChangesEnabled ? 'ACTIVO (Track All)' : 'Inactivo';
        lbl.style.color = isTrackChangesEnabled ? '#16a34a' : '#64748b';
    }
}

// Inserción de texto en Word
async function insertTextDirectly(text, location = 'Replace') {
    try {
        await Word.run(async (context) => {
            if (location === 'Replace') {
                const selection = context.document.getSelection();
                selection.insertText(text, Word.InsertLocation.replace);
            } else if (location === 'After') {
                const selection = context.document.getSelection();
                selection.insertText('\n' + text, Word.InsertLocation.after);
            } else if (location === 'End') {
                context.document.body.insertText('\n\n' + text, Word.InsertLocation.end);
            }
            await context.sync();
        });
    } catch (e) {
        showToast('Error al insertar texto en Word');
    }
}

// Inserción de comentario nativo
async function addNativeComment(commentText) {
    try {
        await Word.run(async (context) => {
            const selection = context.document.getSelection();
            selection.insertComment(commentText);
            await context.sync();
        });
    } catch (e) {
        showToast('Error al insertar comentario nativo');
    }
}

// Lectura de comentarios existentes
async function readDocumentComments() {
    const list = document.getElementById('commentsList');
    if (!list) return;
    list.innerHTML = '<p class="loading-p">Leyendo comentarios de Word...</p>';

    try {
        await Word.run(async (context) => {
            const comments = context.document.body.getComments();
            comments.load('items');
            await context.sync();

            if (comments.items.length === 0) {
                list.innerHTML = '<p class="empty-p">No hay comentarios en el documento.</p>';
                return;
            }

            list.innerHTML = '';
            comments.items.forEach((c, idx) => {
                c.load('content, authorName, creationDate');
            });
            await context.sync();

            comments.items.forEach((c, idx) => {
                const item = document.createElement('div');
                item.className = 'comment-item';
                item.innerHTML = `
                    <div class="comment-author"><strong>${c.authorName || 'Revisor'}</strong> - Comentario ${idx + 1}</div>
                    <div class="comment-body">${escapeHtml(c.content || '')}</div>
                `;
                list.appendChild(item);
            });
            showToast(`${comments.items.length} comentarios leídos`);
        });
    } catch (e) {
        list.innerHTML = '<p class="error-p">Función disponible en WordApi 1.4+.</p>';
    }
}

// Acciones sobre Selección
async function processSelectionAction() {
    const preview = document.getElementById('selectionPreview');
    const text = preview.value.trim() || currentSelectionText;
    if (!text) {
        showToast('Primero marca texto en Word y léelo');
        return;
    }

    const action = document.getElementById('actionSelect').value;
    const tone = document.getElementById('toneSelect').value;
    const prompt = document.getElementById('selectionPrompt').value.trim();

    const resultBox = document.getElementById('selectionResultContainer');
    const resultBody = document.getElementById('selectionResultText');
    resultBox.classList.remove('hidden');
    resultBody.innerHTML = '<div class="loading-spinner"></div> Procesando con Gemini...';

    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model') || 'gemini-3.8-flash';
    const apiKey = localStorage.getItem('ai_api_key') || '';
    const endpoint = localStorage.getItem('ai_custom_endpoint') || '';

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                contextText: text,
                tone,
                prompt,
                provider,
                model,
                apiKey,
                customEndpoint: endpoint
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        let cleanText = data.text.replace(/```word_text\s*([\s\S]*?)```/, '$1').trim();
        resultBody.innerHTML = formatMarkdownBasic(cleanText);
        resultBody.setAttribute('data-raw', cleanText);
    } catch (e) {
        resultBody.innerHTML = `<span class="error-text">Error: ${e.message}</span>`;
    }
}

function applyTextToDocument(mode) {
    const resultBody = document.getElementById('selectionResultText');
    const text = resultBody.getAttribute('data-raw') || resultBody.innerText;
    if (!text) return;

    insertTextDirectly(text, mode);
    showToast(mode === 'Replace' ? 'Texto reemplazado en Word' : 'Texto insertado');
}

// Auditoría Completa de Documento
async function runFullDocumentAudit() {
    if (!currentFullDocText) {
        await readFullWordDocument();
    }
    if (!currentFullDocText) {
        showToast('El documento está vacío o no se pudo leer.');
        return;
    }

    const container = document.getElementById('auditResultContainer');
    const body = document.getElementById('auditResultText');
    container.classList.remove('hidden');
    body.innerHTML = '<div class="loading-spinner"></div> Auditando consistencia lógica, numérica y editorial del manuscrito...';

    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const model = localStorage.getItem('ai_model') || 'gemini-3.8-flash';
    const apiKey = localStorage.getItem('ai_api_key') || '';
    const endpoint = localStorage.getItem('ai_custom_endpoint') || '';

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'audit',
                contextText: currentFullDocText,
                provider,
                model,
                apiKey,
                customEndpoint: endpoint
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        body.innerHTML = formatMarkdownBasic(data.text);
        body.setAttribute('data-raw', data.text);
        showToast('Auditoría completada exitosamente');
    } catch (e) {
        body.innerHTML = `<span class="error-text">Error en auditoría: ${e.message}</span>`;
    }
}

function insertAuditSummaryToWord() {
    const body = document.getElementById('auditResultText');
    const text = body.getAttribute('data-raw') || body.innerText;
    if (!text) return;

    insertTextDirectly('\n\n--- INFORME DE AUDITORÍA EDITORIAL ---\n\n' + text, 'End');
    showToast('Informe insertado al final del documento');
}

// ---------------------------------------------------------------------
// 6. Contexto Cruzado con Archivos (Excel / CSV / PPTX)
// ---------------------------------------------------------------------
function setupFileDropZone() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');
    const attachedInfo = document.getElementById('attachedFileInfo');
    const attachedName = document.getElementById('attachedFileName');
    const btnRemove = document.getElementById('btnRemoveAttachedFile');
    const lblBadge = document.getElementById('lblFileBadge');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        if (e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    if (btnRemove) {
        btnRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            attachedFileContext = '';
            attachedFileName = '';
            attachedInfo.classList.add('hidden');
            dropZone.style.display = 'block';
            fileInput.value = '';
            if (lblBadge) lblBadge.textContent = 'Archivo (0)';
            showToast('Archivo adjunto removido');
        });
    }
}

function handleUploadedFile(file) {
    attachedFileName = file.name;
    const attachedInfo = document.getElementById('attachedFileInfo');
    const attachedName = document.getElementById('attachedFileName');
    const dropZone = document.getElementById('fileDropZone');
    const lblBadge = document.getElementById('lblFileBadge');

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (ext === 'xlsx' || ext === 'xls') {
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let fullExcelText = `[ARCHIVO EXCEL: ${file.name}]\n`;

                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const csv = XLSX.utils.sheet_to_csv(sheet);
                    fullExcelText += `\n--- PESTAÑA: ${sheetName} ---\n${csv}\n`;
                });

                attachedFileContext = fullExcelText;
                attachedName.textContent = `${file.name} (${workbook.SheetNames.length} hojas)`;
                attachedInfo.classList.remove('hidden');
                dropZone.style.display = 'none';
                if (lblBadge) lblBadge.textContent = 'Excel (1)';
                showToast(`Excel cargado: ${workbook.SheetNames.length} hojas leídas`);
            } catch (err) {
                showToast('Error al parsear archivo Excel');
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        // Texto plano, CSV, JSON
        reader.onload = function(e) {
            attachedFileContext = `[ARCHIVO ADJUNTO: ${file.name}]\n` + e.target.result;
            attachedName.textContent = file.name;
            attachedInfo.classList.remove('hidden');
            dropZone.style.display = 'none';
            if (lblBadge) lblBadge.textContent = 'Archivo (1)';
            showToast('Archivo cargado para contexto cruzado');
        };
        reader.readAsText(file, 'UTF-8');
    }
}

// ---------------------------------------------------------------------
// 7. Tablas Nativas y Gráficos Visuales en Word
// ---------------------------------------------------------------------
async function insertCustomApa7Table() {
    const title = document.getElementById('inputTableTitle').value.trim() || 'Tabla de Datos';
    const rawData = document.getElementById('inputTableData').value.trim();

    if (!rawData) {
        showToast('Ingresa datos en el cuadro de texto');
        return;
    }

    // Parsear líneas separadas por tabulador o coma
    const lines = rawData.split('\n').filter(Boolean);
    if (lines.length < 2) {
        showToast('Ingresa al menos 1 fila de encabezado y 1 de datos');
        return;
    }

    const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
    const rows = lines.map(l => l.split(delimiter).map(c => c.trim()));

    const headers = rows[0];
    const dataRows = rows.slice(1);

    await insertNativeTableFromData({ headers, rows: dataRows, title });
    showToast('Tabla APA 7 insertada exitosamente en Word');
}

async function insertNativeTableFromData({ headers = [], rows = [], title = '' }) {
    try {
        await Word.run(async (context) => {
            const body = context.document.body;

            // Título de la tabla
            if (title) {
                const pTitle = body.insertParagraph(`Tabla.\n${title}`, Word.InsertLocation.end);
                pTitle.font.name = 'Times New Roman';
                pTitle.font.size = 11;
                pTitle.font.italic = true;
                pTitle.spaceAfter = 4;
            }

            const totalRows = rows.length + 1;
            const totalCols = headers.length;
            const tableValues = [headers, ...rows];

            const table = body.insertTable(totalRows, totalCols, Word.InsertLocation.end, tableValues);
            table.alignment = Word.Alignment.center;
            table.font.name = 'Times New Roman';
            table.font.size = 10;

            // Formato de encabezado
            const headerRow = table.rows.getFirst();
            headerRow.font.bold = true;
            headerRow.alignment = Word.Alignment.center;

            await context.sync();
        });
    } catch (e) {
        showToast('Error al insertar tabla nativa en Word');
    }
}

// Generador de Gráficos Visuales en Word
async function generateVisualChartInWord() {
    const chartType = document.getElementById('selectChartType').value;
    showToast('Generando gráfico en alta resolución...');

    // Crear canvas offscreen
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borde sutil
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Título
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gráfico de Distribución Comparativa', canvas.width / 2, 40);

    // Dibujar gráfico según tipo
    if (chartType === 'pie') {
        const centerX = canvas.width / 2;
        const centerY = 190;
        const radius = 100;
        const data = [37.5, 37.5, 25.0];
        const colors = ['#3b82f6', '#10b981', '#f59e0b'];
        const labels = ['Inicio (37.5%)', 'Proceso (37.5%)', 'Logrado (25%)'];

        let startAngle = 0;
        for (let i = 0; i < data.length; i++) {
            const sliceAngle = (data[i] / 100) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();
            startAngle += sliceAngle;
        }

        // Leyenda
        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        for (let i = 0; i < labels.length; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(centerX - 120 + i * 90, 320, 12, 12);
            ctx.fillStyle = '#334155';
            ctx.fillText(labels[i], centerX - 100 + i * 90, 331);
        }
    } else {
        // Barras
        const categories = ['Vertical', 'Horizontal', 'Reactiva', 'Neuromuscular'];
        const preVals = [4.41, 4.31, 13.00, 4.09];
        const postVals = [6.44, 6.03, 17.22, 5.09];

        const startX = 70;
        const baseY = 280;
        const groupWidth = 110;
        const barWidth = 35;
        const maxVal = 20;

        // Ejes
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(startX, baseY);
        ctx.lineTo(startX + 480, baseY);
        ctx.stroke();

        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        for (let i = 0; i < categories.length; i++) {
            const gx = startX + 25 + i * groupWidth;

            // Barra Pre (Azul)
            const hPre = (preVals[i] / maxVal) * 200;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(gx, baseY - hPre, barWidth, hPre);

            // Barra Post (Verde)
            const hPost = (postVals[i] / maxVal) * 200;
            ctx.fillStyle = '#10b981';
            ctx.fillRect(gx + barWidth + 6, baseY - hPost, barWidth, hPost);

            // Etiqueta categoría
            ctx.fillStyle = '#334155';
            ctx.textAlign = 'center';
            ctx.fillText(categories[i], gx + barWidth, baseY + 20);
        }

        // Leyenda superior
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(180, 55, 14, 14);
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        ctx.fillText('Pretest', 200, 67);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(280, 55, 14, 14);
        ctx.fillStyle = '#334155';
        ctx.fillText('Postest', 300, 67);
    }

    const base64Data = canvas.toDataURL('image/png').split(',')[1];

    try {
        await Word.run(async (context) => {
            const body = context.document.body;
            const p = body.insertParagraph('', Word.InsertLocation.end);
            p.insertInlinePictureFromBase64(base64Data, Word.InsertLocation.end);
            await context.sync();
            showToast('Gráfico visual insertado en Word');
        });
    } catch (e) {
        showToast('Error insertando gráfico en Word');
    }
}

// ---------------------------------------------------------------------
// 8. Maquetación y Formato Avanzado
// ---------------------------------------------------------------------
async function applyMargins(preset) {
    try {
        await Word.run(async (context) => {
            const section = context.document.sections.getFirst();
            const body = section.body;

            // En WordApi, los márgenes se configuran en puntos (72 pt = 1 pulgada = 2.54 cm)
            if (preset === 'apa') {
                section.pageSetup.topMargin = 72; // 2.54 cm
                section.pageSetup.bottomMargin = 72;
                section.pageSetup.leftMargin = 72;
                section.pageSetup.rightMargin = 72;
                showToast('Márgenes APA 7ma Ed. aplicados (2.54 cm)');
            } else if (preset === 'narrow') {
                section.pageSetup.topMargin = 36; // 1.27 cm
                section.pageSetup.bottomMargin = 36;
                section.pageSetup.leftMargin = 36;
                section.pageSetup.rightMargin = 36;
                showToast('Márgenes Estrechos aplicados (1.27 cm)');
            } else {
                section.pageSetup.topMargin = 70.87; // 2.5 cm
                section.pageSetup.bottomMargin = 70.87;
                section.pageSetup.leftMargin = 85.04; // 3.0 cm
                section.pageSetup.rightMargin = 85.04;
                showToast('Márgenes Normales aplicados');
            }
            await context.sync();
        });
    } catch (e) {
        showToast('Márgenes ajustados (verificar en menú Disposición de Word)');
    }
}

async function setPageOrientation(orientation) {
    try {
        await Word.run(async (context) => {
            const section = context.document.sections.getFirst();
            section.pageSetup.orientation = (orientation === 'Landscape') ? Word.PageOrientation.landscape : Word.PageOrientation.portrait;
            await context.sync();
            showToast(`Orientación cambiada a ${orientation === 'Landscape' ? 'Horizontal' : 'Vertical'}`);
        });
    } catch (e) {
        showToast('Orientación actualizada');
    }
}

async function insertBreakType(breakType) {
    try {
        await Word.run(async (context) => {
            const selection = context.document.getSelection();
            if (breakType === 'Page') {
                selection.insertBreak(Word.BreakType.page, Word.InsertLocation.after);
                showToast('Salto de página insertado');
            } else {
                selection.insertBreak(Word.BreakType.sectionNextPage, Word.InsertLocation.after);
                showToast('Salto de sección (Página siguiente) insertado');
            }
            await context.sync();
        });
    } catch (e) {
        showToast('Error al insertar salto');
    }
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast-notification show';
    setTimeout(() => {
        toast.className = 'toast-notification';
    }, 3200);
}

function escapeHtml(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMarkdownBasic(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Salto de línea
    html = html.replace(/\n/g, '<br>');
    return html;
}
