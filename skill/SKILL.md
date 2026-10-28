---
name: word-document-copilot
description: >-
  Usa esta skill para cualquier tarea avanzada de ingeniería documental en Microsoft Word:
  lectura integral de manuscritos extensos, control de cambios nativo (Track Changes),
  edición y reescritura de selecciones, inserción de párrafos y conclusiones,
  gestión de comentarios e hilos de revisión, búsqueda web en vivo con citas,
  cruce de datos con Excel (.xlsx) y presentaciones (.pptx), comprobación de coherencia
  lógica y estilo, generación e inserción de gráficos nativos, maquetación avanzada
  (márgenes APA 7, saltos de sección, orientación), manipulación avanzada de tablas
  (APA 7, celdas combinadas), y procesamiento por lotes multiarchivo en carpetas.
---

# Suite Universal de Ingeniería Documental y Asistente Editorial para Microsoft Word

Esta Skill dota a cualquier asistente inteligente o evaluador humano de capacidades profesionales completas para interactuar, auditar, reescribir, maquetar, cruzar datos y transformar documentos en Microsoft Word (`.docx`), tanto a través del panel lateral interactivo en tiempo real como mediante scripts automatizados en consola o Antigravity.

---

## 📋 Catálogo Completo de Capacidades Operativas

```mermaid
flowchart TD
    subgraph INGESTA["1. Ingesta y Diagnóstico"]
        I1["Lectura Integral de Manuscritos (cientos de páginas)"]
        I2["Cruce de Datos con Excel (.xlsx), PPTX y CSV"]
        I3["Búsqueda Web en Vivo con Citas (Grounding)"]
    end

    subgraph DIALOGO["2. Diálogo Colaborativo (Pregunta antes de Modificar)"]
        D1["Diagnóstico Conciso de Errores o Vacíos"]
        D2["Preguntas Cortas y Claras al Autor"]
        D3["Generación de Tarjetas de Acción [Aplicar en Word]"]
    end

    subgraph EDICION["3. Edición e Inyección en Word"]
        E1["Control de Cambios Nativo (Track Changes ON/OFF)"]
        E2["Reescritura de Estilo y Corrección Gramatical"]
        E3["Gestión de Comentarios e Hilos de Revisión"]
        E4["Tablas Avanzadas APA 7 y Celdas Combinadas"]
        E5["Generación de Gráficos Nativos y Visuales"]
        E6["Maquetación: Márgenes APA 7, Secciones y Orientación"]
    end

    subgraph MASIVO["4. Automatización y Procesamiento Masivo"]
        M1["Edición y Auditoría por Lotes Multiarchivo"]
        M2["Scripts de Procesamiento Estadístico (Método Tandazo)"]
        M3["Cero Metadatos de IA (Autoría Humana Estandarizada)"]
    end

    INGESTA --> DIALOGO
    DIALOGO --> EDICION
    EDICION --> MASIVO
```

---

## 🛠️ Las 14 Capacidades Detalladas y Cómo Ejecutarlas

### 1. Lectura Integral del Documento
* **Función:** Extrae y procesa el cuerpo completo de manuscritos de más de 200 páginas sin límites de selección manual.
* **En el Add-in:** Botón `📖 Leer documento completo` en la pestaña Documento.
* **Por Script:** `doc = docx.Document(path); full_text = "\n".join(p.text for p in doc.paragraphs)`.

### 2. Control de Cambios Nativo (Track Changes)
* **Función:** Activa el modo de revisión para que cada adición o supresión quede registrada como marca formal de control de cambios, permitiendo aceptar o rechazar individualmente.
* **En el Add-in:** Botón `📝 Control de cambios: Activo / Inactivo` (`Word.ChangeTrackingMode.trackAll`).
* **Por Script:** Utilizar nodos OpenXML `<w:ins>` y `<w:del>` o el comando de aceptación `accept_all_changes`.

### 3. Edición y Reescritura de Selección
* **Función:** Modifica el tono (formal, académico, ejecutivo, persuasivo), resume, expande o reformula fragmentos específicos marcados con el cursor en Word.
* **En el Add-in:** Pestaña Selección $\rightarrow$ `✦ Procesar Selección` $\rightarrow$ `Reemplazar en Word`.

### 4. Inserción de Texto Directo
* **Función:** Escribe párrafos, introducciones, conclusiones o secciones completas directamente en el cuerpo del documento, ya sea en la posición del cursor, después de un párrafo o al final del archivo.

### 5. Gestión de Comentarios e Hilos de Revisión
* **Función:** Lee los comentarios existentes insertados en el documento, responde dudas dentro de los hilos y propone correcciones en forma de comentarios nativos de Word (`selection.insertComment(text)`).

### 6. Búsqueda Web en Vivo (Grounding)
* **Función:** Consulta información actualizada en internet, contrasta citas bibliográficas y valida afirmaciones empíricas adjuntando los enlaces de las fuentes consultadas.

### 7. Contexto Cruzado con Otros Archivos (Excel / PPTX / CSV / TXT)
* **Función:** Zona de arrastre de archivos (*Drop Zone*) que lee libros de Excel (`.xlsx`), matrices de datos o presentaciones para validar cifras en el documento de Word y redactar párrafos analíticos precisos.

### 8. Comprobación de Coherencia y Estilo (Auditoría)
* **Función:** Detecta contradicciones lógicas entre capítulos, discrepancias en totales de población o muestras, rupturas de la persona gramatical y errores de puntuación.

### 9. Inserción de Gráficos Nativos y Visuales
* **Función:** Diseña y coloca gráficos de barras comparativas, líneas de tendencia o diagramas de sectores vinculados a datos empíricos, insertados con alta resolución y normas APA 7.
* **Por Script:** `python scripts/chart_generator.py`.

### 10. Control de Maquetación Avanzada
* **Función:** Configura márgenes (APA 7ma Edición 2.54 cm en los 4 lados, Normal o Estrecho), orientación de página (vertical u horizontal apaisada) y saltos de sección (*SectionNextPage* o *Continuous*).
* **Por Script:** `python scripts/layout_engine.py`.

### 11. Manipulación y Formateo Avanzado de Tablas
* **Función:** Construye estructuras tabulares con líneas horizontales formales, sin bordes verticales (estándar APA 7), sombreados personalizados, combinación de celdas (*merge*) y notas al pie.
* **Por Script:** `python scripts/advanced_table_engine.py`.

### 12. Inserción de Formas Vectoriales y Diagramas
* **Función:** Incorpora diagramas de flujo y esquemas visuales estructurados.

### 13. Automatización y Scripts de Procesamiento
* **Función:** Ejecución de rutinas automatizadas en Python o PowerShell para procesamientos masivos sin intervención manual.

### 14. Edición por Lotes Multiarchivo (Batch Processing)
* **Función:** Procesa carpetas enteras de documentos Word (`.docx`), ejecutando auditorías masivas, sustitución de términos o estandarización tipográfica sobre decenas de archivos simultáneamente.
* **Por Script:** `python scripts/batch_processor.py`.

---

## 🤝 Protocolo de Diálogo: "Pregunta Antes de Modificar"

Cuando interactúes con el usuario a través del chat del complemento o desde Antigravity:

1. **Escucha y Diagnostica:** Analiza la solicitud y el contexto del documento.
2. **Formula Preguntas Cortas y Claras:**
   * *Ejemplo:* «He detectado que en la justificación se menciona una muestra de 34 alumnas pero en la tabla de resultados figuran 32. ¿Deseas que armonicemos el texto explicando la exclusión por inasistencias o prefieres mantener la mención de 34?»
3. **Ofrece Opciones Concretas:** Presenta alternativas breves (Opción A vs. Opción B).
4. **Entrega Tarjetas de Acción:** Al acordar la modificación, entrega el resultado enmarcado en bloques ` ```word_text ` o ` ```json_table ` para que el usuario pueda aplicarlo a Word con un solo clic.

---

## 🛡️ Directiva de Cero Rastros de IA

* **Autoría Estandarizada:** Todas las revisiones, comentarios y ediciones en Word se realizan bajo el nombre del autor humano configurado (`Renzo Chumacero` o el nombre que el usuario asigne en Ajustes).
* **Sin Metadatos Residuales:** Queda estrictamente prohibido insertar firmas, marcas de agua o comentarios con nombres de bots, modelos o inteligencias artificiales.
* **Registro Formal Humano:** Redacción en tercera persona o voz pasiva impersonal propia de la comunicación científica y profesional.
