# Método Metodológico Tandazo (2026) - Análisis Estadístico Pretest y Postest

Esta guía documenta los estándares metodológicos y psicométricos basados en el **Método Tandazo** para investigaciones con diseño pre-experimental ($O_1 - X - O_2$) y cuasi-experimental con medidas repetidas.

---

## 1. Confiabilidad Psicométrica (Alfa de Cronbach)

1. **Requisitos de la matriz:**
   - La matriz debe contener los puntajes ítem por ítem (por ejemplo: escala Likert 1 a 3, o 1 a 5).
   - Se debe verificar que ningún ítem tenga varianza nula (donde todos los participantes respondieron idéntico) ni correlación ítem-total negativa grave.
2. **Fórmula:**
   $$\alpha = \frac{K}{K - 1} \left(1 - \frac{\sum_{i=1}^K \sigma_{Y_i}^2}{\sigma_X^2}\right)$$
   Donde $K$ es el número de ítems, $\sigma_{Y_i}^2$ es la varianza del ítem $i$, y $\sigma_X^2$ es la varianza del puntaje total.
3. **Criterios de interpretación:**
   - $\alpha \ge .90$: Excelente consistencia interna.
   - $.80 \le \alpha < .90$: Buena / Muy alta consistencia interna.
   - $.70 \le \alpha < .80$: Aceptable para investigación diagnóstica.
   - $\alpha < .70$: Cuestionable o deficiente.
4. **Regla metodológica Tandazo:** Se reporta tanto el Alfa del Pretest (diagnóstico basal) como el Alfa del Postest (evaluación final de salida), junto con el número de casos válidos ($N$) y el número de ítems ($K$).

---

## 2. Supuesto de Normalidad (Principio Estricto - Unidad 5)

> **Regla de Oro Tandazo:**
> En diseños con observaciones apareadas o muestras relacionadas (Pretest vs. Postest en los mismos sujetos), la prueba de normalidad **NUNCA** debe calcularse a las variables Pretest y Postest por separado. Debe evaluarse **estrictamente sobre la distribución de las diferencias o ganancias individuales**:
> $$\text{Diferencia}_i = \text{Postest}_i - \text{Pretest}_i$$

1. **Criterio de selección del estadístico:**
   - Si la muestra es **$N < 50$ casos:** Se aplica la prueba de **Shapiro-Wilk** ($W$).
   - Si la muestra es **$N \ge 50$ casos:** Se aplica la prueba de **Kolmogorov-Smirnov** con corrección de significación de Lilliefors.
2. **Criterio de decisión:**
   - Si $p \ge .05$: Se acepta la hipótesis nula de normalidad ($H_0$). Las diferencias se distribuyen normalmente. Corresponde la prueba paramétrica $t$ de Student para muestras relacionadas.
   - Si $p < .05$: Se rechaza $H_0$. Las diferencias no siguen una distribución normal estricta. Corresponde la prueba no paramétrica de Rangos con Signo de Wilcoxon.
3. **Criterio de Doble Vía Método Tandazo:** Para garantizar máxima solidez metodológica ante jurados de tesis, se recomienda reportar la prueba paramétrica ($t$) con sus intervalos de confianza y, en paralelo, el contraste no paramétrico robusto de Wilcoxon como verificación de consistencia.

---

## 3. Contraste de Hipótesis y Tamaño del Efecto

### A. Prueba Paramétrica: $t$ de Student para Muestras Relacionadas
* **Estadístico:**
  $$t = \frac{\bar{D}}{s_D / \sqrt{N}}$$
  donde $\bar{D}$ es la media de las diferencias, $s_D$ es la desviación estándar de las diferencias y $gl = N - 1$.
* **Intervalo de Confianza (IC 95 %):** Reportar siempre los límites inferior y superior de la ganancia media: $[\bar{D} - t_{crit} \cdot SE, \ \bar{D} + t_{crit} \cdot SE]$.
* **Tamaño del Efecto ($d_z$ de Cohen para muestras apareadas):**
  $$d_z = \frac{\bar{D}}{s_D} = \frac{t}{\sqrt{N}}$$
  * Escala: $0.20$ (pequeño), $0.50$ (mediano), $0.80$ (grande), $> 1.20$ (muy grande / enorme).

### B. Prueba No Paramétrica: Rangos con Signo de Wilcoxon
* **Estadístico:** Suma de rangos positivos vs. negativos ($T$), tipificado a estadístico asintótico $Z$.
* **Tamaño del efecto no paramétrico ($r$ de Rosenthal):**
  $$r = \frac{|Z|}{\sqrt{2N}}$$ (o $\frac{|Z|}{\sqrt{N}}$ según convención del reporte).
  * Escala: $0.10$ (bajo), $0.30$ (moderado), $\ge 0.50$ (alto).

---

## 4. Baremos y Movilidad Pedagógica (Niveles de Logro)

Para evidenciar la efectividad pedagógica del programa de intervención, se definen los puntos de corte de los niveles (ejemplo típico en escala Likert de 1 a 3 para 18 ítems: puntaje mínimo 18, máximo 54):
* **Inicio:** $[Min, \ P_1]$ (ej. 18 a 29 puntos)
* **En Proceso:** $[P_1 + 1, \ P_2]$ (ej. 30 a 41 puntos)
* **Logrado / Destacado:** $[P_2 + 1, \ Max]$ (ej. 42 a 54 puntos)

Se calculan las frecuencias absolutas ($f$) y relativas ($\%$) en el Pretest y en el Postest, evidenciando la reducción porcentual del nivel Inicio y el incremento del nivel Logrado.

---

## 5. Sintaxis Oficial Reproducible en IBM SPSS Statistics

```spss
* 1. CONFIABILIDAD.
RELIABILITY
  /VARIABLES=PRE_ITEM_1 TO PRE_ITEM_K
  /SCALE('Pretest') ALL
  /MODEL=ALPHA
  /SUMMARY=TOTAL.

RELIABILITY
  /VARIABLES=POST_ITEM_1 TO POST_ITEM_K
  /SCALE('Postest') ALL
  /MODEL=ALPHA
  /SUMMARY=TOTAL.

* 2. NORMALIDAD DE LAS DIFERENCIAS (UNIDAD 5 TANDAZO).
COMPUTE DIFERENCIA = POST_TOTAL - PRE_TOTAL.
EXECUTE.

EXAMINE VARIABLES=DIFERENCIA
  /PLOT NPPLOT HISTOGRAM
  /STATISTICS DESCRIPTIVES
  /CINTERVAL 95.

* 3. CONTRASTES DE HIPOTESIS.
T-TEST PAIRS=POST_TOTAL WITH PRE_TOTAL (PAIRED)
  /CRITERIA=CI(.95).

NPAR TESTS
  /WILCOXON=POST_TOTAL WITH PRE_TOTAL (PAIRED)
  /STATISTICS DESCRIPTIVES.

* 4. FRECUENCIAS Y NIVELES DE LOGRO.
FREQUENCIES VARIABLES=NIVEL_PRE NIVEL_POST
  /BARCHART PERCENT.
```
