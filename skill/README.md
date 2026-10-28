# Suite Metodológica y Estadística Pretest-Postest (Método Tandazo 2026)

Esta Skill y conjunto de herramientas proporciona las capacidades científicas completas para el procesamiento psicométrico, contraste de hipótesis preexperimental/cuasi-experimental y auditoría editorial directa en Microsoft Word con normas APA 7ma edición.

---

## Estructura del Módulo

```
skill/
├── SKILL.md                          <- Instrucciones y flujo operativo principal
├── README.md                         <- Esta guía de instalación y uso
├── references/
│   ├── manual_operativo_auditoria.md <- Manual maestro de auditoría metodológica y editorial
│   ├── metodo_tandazo.md             <- Fundamentos psicométricos y principio de normalidad
│   └── apa7_format_rules.md          <- Estándares editoriales estrictos de tablas y figuras APA 7
└── scripts/
    ├── analyze_pipeline.py           <- Motor estadístico de alta precisión en Python puro
    ├── inject_spss_to_word.py        <- Inyector de tablas APA 7 y gráficos en documentos .docx
    ├── iniciar_localhost_3000.ps1    <- Lanzador automatizado del servidor para Word
    ├── detect_spss.ps1               <- Detección de ejecutables de IBM SPSS y Python SPSS
    ├── ensure_environment.ps1        <- Instalador automático de dependencias (pandas, scipy, docx)
    ├── export_word_apa7.ps1          <- Generador independiente de informe de resultados en Word
    ├── export_excel_report.ps1       <- Exportador de reportes estructurados en Excel
    └── generate_spss_syntax.py       <- Generador de sintaxis oficial de IBM SPSS (.sps)
```

---

## Cómo Instalar la Skill

### Opción 1: En Entornos de Línea de Comandos / Asistentes CLI
Copia la carpeta de la skill a tu directorio global de skills:

* **En Windows:**
  Copia la carpeta a:
  `%USERPROFILE%\.gemini\config\skills\spss-tesis-prepost`
* **En Linux / macOS:**
  Copia la carpeta a:
  `~/.gemini/config\skills\spss-tesis-prepost`

Una vez copiada, el entorno la detectará automáticamente. Puedes activarla en el chat con solicitudes como:
* *"Analiza mis datos de pretest y postest bajo el Método Tandazo"*
* *"Audita mi documento de tesis en Word y completa los resultados de SPSS"*

### Opción 2: En Entornos de Desarrollo (IDE / Editores)
Agrega la ruta de la carpeta `skill` en las directivas de tu proyecto indicando que se consulte `skill/SKILL.md` y `skill/references/manual_operativo_auditoria.md` al procesar tesis o análisis estadísticos cuantitativos.

---

## Scripts Disponibles

* **Procesar datos desde la consola:**
  ```powershell
  python scripts/analyze_pipeline.py --test
  ```
* **Inyectar tablas y gráficos en una tesis de Word:**
  ```powershell
  python scripts/inject_spss_to_word.py --docx "mi_tesis.docx" --test
  ```
* **Activar el servidor local para Word en 1 segundo:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/iniciar_localhost_3000.ps1
  ```
* **Verificar si la máquina tiene IBM SPSS Statistics:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/detect_spss.ps1
  ```
