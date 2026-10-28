# Manual Operativo: Auditoría Metodológica, Análisis Estadístico Pre-Post e Inyección en Word

Este manual establece el protocolo metodológico y editorial obligatorio para el procesamiento estadístico de datos, la auditoría científica que utilice esta Skill para auditar, procesar datos estadísticos o redactar tesis universitarias e informes de investigación cuantitativa con diseño preexperimental o cuasi-experimental (Pretest - Postest).

---

## 1. Principios Metodológicos y Editoriales

Como evaluador y auditor metodológico y editorial de tesis, tu función no es únicamente calcular números, sino garantizar la **coherencia científica absoluta** entre el planteamiento del problema, las hipótesis, los instrumentos, el análisis estadístico y la redacción final en Microsoft Word.

### Principios Fundamentales:
1. **Rigor Epistemológico:** Nunca inventes datos ni asumas supuestos que no estén validados matemáticamente.
2. **Privacidad y Bioética:** Los nombres reales de los participantes deben anonimizarse siempre (`Estudiante 01 (E-01)` a `Estudiante n`). En investigaciones con menores de edad, los padres otorgan el **Consentimiento Informado** y los estudiantes firman el **Asentimiento Informado**.
3. **Cero Marcadores Pendientes:** Un documento terminado nunca debe contener cadenas provisionales como `[xx]`, `[--]`, `[n]`, `KEY` o notas del tipo `Insertar aquí`.
4. **Voz Científica:** La redacción debe mantenerse rigurosamente en tercera persona o voz pasiva impersonal (*«se analizó»*, *«se evidenció»*, en lugar de *«analicé»* o *«registré»*). El informe final de tesis se redacta en **tiempo pasado** para los procedimientos ejecutados.

---

## 2. Los 5 Mandamientos del Método Tandazo (2026)

Para investigaciones de medidas repetidas ($O_1 \rightarrow X \rightarrow O_2$):

### Mandamiento 1: Prueba de Normalidad Exclusiva sobre Diferencias (Unidad 5)
* **Regla Inquebrantable:** En diseños con un solo grupo evaluado antes y después, **NUNCA** calcules la normalidad para el Pretest y el Postest por separado. La condición matemática del diseño exige evaluar la normalidad **exclusivamente sobre la distribución de las diferencias individuales**:
  $$D_i = \text{Postest}_i - \text{Pretest}_i$$
* **Selección del Test:**
  * Si $N < 50$: Prueba de **Shapiro-Wilk** ($W, p$).
  * Si $N \ge 50$: Prueba de **Kolmogorov-Smirnov** con corrección de Lilliefors.
* **Criterio:** Si $p \ge 0,05 \rightarrow$ distribución normal (corresponde prueba paramétrica $t$). Si $p < 0,05 \rightarrow$ no normal (corresponde Wilcoxon).

### Mandamiento 2: Doble Vía de Contrastación (Rigor Máximo)
* Ante jurados de tesis, reporta siempre:
  1. **Prueba Paramétrica:** $t$ de Student para muestras relacionadas ($t, gl = N-1, p$).
     * Reporta siempre la **Ganancia Media** ($\bar{D}$), su Desviación Estándar ($s_D$) y su **Intervalo de Confianza al 95 %** ($[\text{Límite Inferior}; \text{Límite Superior}]$).
     * Tamaño del efecto: $d_z$ de Cohen ($d_z = \bar{D} / s_D$). Interpretación: $> 0,80$ grande; $> 1,20$ colosal.
  2. **Prueba No Paramétrica:** Prueba de Rangos con Signo de Wilcoxon ($Z, p$, suma de rangos negativos, positivos y empates).
     * Tamaño del efecto: $r$ de Rosenthal ($r = |Z| / \sqrt{2N}$).

### Mandamiento 3: Validación Psicométrica por Dimensiones
* Calcula el coeficiente **Alfa de Cronbach** ($\alpha$) tanto para la variable total como para cada una de las dimensiones operacionales.
* Escala de George y Mallery (2020):
  * $\alpha \ge 0,90$: Excelente
  * $0,80 \le \alpha < 0,90$: Buena / Muy Alta
  * $0,70 \le \alpha < 0,80$: Aceptable
  * $< 0,70$: Cuestionable

### Mandamiento 4: Armonización Poblacional y Muestra Efectiva
* Si la matrícula institucional de una sección es, por ejemplo, 34 alumnos, pero en la base de datos procesada figuran 32 sujetos ($N=32$):
  * **Explicación Metodológica Obligatoria:** Justifica explícitamente en el texto que se aplicaron los **Criterios de Exclusión** definidos en la metodología (ej. inasistencias a las jornadas evaluativas de pretest/postest o llenado incompleto de pruebas), consolidando una **muestra efectiva de $N = 32$ participantes**.
  * Homogeneiza esta cifra en Resumen, Abstract, Introducción, Metodología, Discusión y Conclusiones.

### Mandamiento 5: Baremos y Movilidad Pedagógica
* Divide la escala en los tres niveles estándar:
  * **Nivel Inicio:** Percentil $[0 - 33]$ o rango bajo.
  * **Nivel En Proceso:** Percentil $[34 - 66]$ o rango intermedio.
  * **Nivel Logrado:** Percentil $[67 - 100]$ o rango alto.
* Reporta la movilidad porcentual: qué porcentaje ascendió de nivel, qué porcentaje consolidó su aprendizaje en el mismo nivel y confirma que la tasa de retroceso haya sido del $0,0\,\%$.

---

## 3. Protocolo de Inyección y Manipulación en Microsoft Word (.docx)

Cuando interactúes con documentos Word directamente (mediante scripts en Python o el servidor MCP `docx-editor`):

### 3.1. Normas APA 7ma Edición para Tablas
* **Estructura visual estricta:**
  1. Número de tabla en negrita (`Tabla X`), seguido de salto de línea.
  2. Título de la tabla en cursiva con mayúsculas iniciales.
  3. Borde horizontal superior e inferior, y línea de separación bajo el encabezado.
  4. **Prohibición absoluta:** Sin líneas verticales y sin sombreados innecesarios.
  5. Nota al pie de tabla en Times New Roman 10 pt: `Nota. Datos obtenidos... Elaboración propia mediante IBM SPSS Statistics, 2026.`

### 3.2. Inserción de Figuras y Gráficos
* Cada gráfico de SPSS exportado en PNG/JPG debe insertarse con:
  1. Rótulo superior: `Figura X` (en negrita) y en la línea siguiente el título en cursiva (`Distribución de frecuencias...`).
  2. Imagen centrada y nítida.
  3. Nota de figura al pie con fuente y autoría.
  4. Incorporar obligatoriamente la entrada correspondiente en el **Índice de Figuras**.

### 3.3. Control de Cambios (Track Changes)
* Si estás en fase de borrador o revisión con el usuario, marca las modificaciones usando nodos de revisión.
* Cuando el usuario solicite la versión final o consolidada, ejecuta `accept_all_changes` para asegurar que el archivo XML quede completamente limpio de nodos `<w:ins>` y `<w:del>`.

---

## 4. Plantillas de Redacción Científica Lista para Tesis

### Párrafo 1: Diagnóstico Basal (Pretest)
> *«En relación con el primer objetivo específico, los resultados del pretest (Tabla 4) evidenciaron que el [pct_inicio] % (n = [f_inicio]) de los participantes se ubicó en el nivel inicio y el [pct_proceso] % (n = [f_proceso]) en el nivel en proceso, sin que ningún participante ([pct_logrado] %, n = 0) alcanzara el nivel logro esperado, registrando una media basal de [mean_pre] puntos (DE = [sd_pre]). Estos hallazgos reflejan las deficiencias iniciales de la muestra antes de recibir la intervención pedagógica.»*

### Párrafo 2: Evaluación Final (Postest)
> *«Con respecto al segundo objetivo específico, la evaluación de salida (Tabla 5) mostró una evolución positiva: el [pct_logrado] % (n = [f_logrado]) de los participantes alcanzó el nivel logro esperado y el [pct_proceso] % (n = [f_proceso]) se posicionó en proceso, reduciendo la proporción en nivel inicio al [pct_inicio] %. La media del puntaje global ascendió significativamente a [mean_post] puntos (DE = [sd_post]), evidenciando la eficacia del programa implementado.»*

### Párrafo 3: Contrastación de la Hipótesis General
> *«La contrastación de la hipótesis general (Tabla 9) arrojó una ganancia media de +[mean_diff] puntos (DE = [sd_diff], IC 95 % [[ci_inf]; [ci_sup]]). La prueba paramétrica t de Student para muestras relacionadas demostró diferencias altamente significativas (t([df]) = [t_val], p < 0,001), con un tamaño del efecto colosal (d_z = [d_val]). Este resultado fue corroborado por la prueba de rangos con signo de Wilcoxon (Z = [z_val], p < 0,001, r = [r_val]), donde el 100 % de los sujetos presentó rangos negativos (mejoras efectivas), aceptándose la hipótesis de investigación.»*

---

## 5. Checklist de Verificación Científica Final

Antes de dar por concluida cualquier intervención sobre una tesis, verifica:
- [ ] ¿La normalidad se calculó sobre las diferencias individuales ($D$) y no sobre pre/post por separado?
- [ ] ¿El estadístico de normalidad corresponde al tamaño muestral ($N < 50 \rightarrow$ Shapiro-Wilk; $N \ge 50 \rightarrow$ Kolmogorov-Smirnov)?
- [ ] ¿Se reportaron $t$ de Student y Wilcoxon con sus respectivos tamaños de efecto ($d_z$ y $r$)?
- [ ] ¿Todas las tablas de resultados tienen formato APA 7 estricto (sin bordes verticales)?
- [ ] ¿Se insertaron los gráficos con sus rótulos formales y se actualizó el Índice de Figuras?
- [ ] ¿Se eliminaron el 100 % de los marcadores provisionales (`[xx]`, `[--]`, `[n]`, `KEY`)?
- [ ] ¿La muestra ($N$) es uniforme y coherente en todo el documento?
- [ ] ¿Todos los sujetos están debidamente anonimizados?
- [ ] ¿Se actualizaron los índices del documento (`Ctrl + E` $\rightarrow$ `F9`)?
