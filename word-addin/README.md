# Asistente Editorial para Microsoft Word (Office Add-in)

Complemento oficial para **Microsoft Word** en Windows y Word en la Web desarrollado por **Renzo David Chumacero Yanayaco**, impulsado por la API de **Google Gemini** (`gemini-3.8-flash` y `gemini-3.1-pro-preview`).

---

## Características Principales

* ✍️ **Reescritura de Estilo:** Selecciona cualquier fragmento en Word y optimiza la sintaxis con tonos formales, académicos o ejecutivos.
* 📑 **Lectura Integral de Manuscritos:** Extrae y analiza documentos de cientos de páginas sin límites de selección manual.
* 🔍 **Auditoría Metodológica:** Detecta contradicciones lógicas, discordancias cuantitativas, errores de cálculo y sesgos muestrales.
* 💬 **Comentarios Nativos de Word:** Inserta revisiones pedagógicas directamente como comentarios del documento.
* 🌐 **Búsqueda Web en Vivo (Grounding):** Contrasta afirmaciones con fuentes y citas web en tiempo real gracias a Google Search.
* 📊 **Inyección de Datos y Tablas:** Transforma datos estructurados en tablas nativas de Word formateadas con normas APA 7ma edición.

---

## Instalación en Windows

1. **Paso 1:** Ejecuta `1-instalar-dependencias.bat` para instalar las librerías con Node.js.
2. **Paso 2:** Ejecuta `2-generar-certificados-ssl.bat` para generar los certificados de desarrollo seguros (`localhost`). Si Windows muestra una alerta de confirmación, selecciona **Sí**.
3. **Paso 3:** Ejecuta `3-registrar-en-word.bat` para registrar el complemento en Office.

---

## Cómo Iniciar el Servidor Local (`https://localhost:3000`)

Dispones de tres opciones:

* **Opción A (Recomendada con consola):**  
  Doble clic en `ARRANCAR-LOCALHOST-3000.bat`.
* **Opción B (Silencioso sin ventana negra):**  
  Doble clic en `ARRANCAR-SEGUNDO-PLANO.vbs`.
* **Opción C (Por comando / PowerShell):**  
  `powershell -ExecutionPolicy Bypass -File "iniciar_localhost_3000.ps1"`

---

## Configuración de la API Key

Para interactuar con el modelo:
1. Obtén tu clave en [Google AI Studio](https://aistudio.google.com/).
2. Puedes colocarla en el archivo `.env` (`GEMINI_API_KEY=tu_clave`) o ingresarla directamente en la pestaña **⚙️ Ajustes** dentro del panel lateral de Word.
