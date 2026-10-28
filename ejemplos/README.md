# Archivos de Ejemplo y Prueba

Esta carpeta contiene una matriz de datos reales de prueba para experimentar con el pipeline estadístico y la inyección en Microsoft Word.

---

## Archivo: `datos_ejemplo_prepost.csv`

* **Diseño:** Preexperimental de un solo grupo con pretest y postest ($N = 32$ sujetos).
* **Anonimización:** Los nombres han sido sustituidos por códigos neutrales (`Estudiante 01` a `Estudiante 32`).
* **Estructura de Columnas:**
  * `N_ORDEN`: Número de orden correlativo.
  * `ID`: Identificador alfanumérico.
  * `ESTUDIANTE`: Código anonimizado del sujeto.
  * `PRE_ITEM_1` a `PRE_ITEM_18`: Puntuaciones de los 18 reactivos en el Pretest (escala 1 a 3).
  * `POST_ITEM_1` a `POST_ITEM_18`: Puntuaciones de los 18 reactivos en el Postest (escala 1 a 3).
  * Dimensiones:
    * Dimensión Vertical: Ítems 1 al 5.
    * Dimensión Horizontal: Ítems 6 al 10.
    * Dimensión Reactiva: Ítems 11 al 15.
    * Dimensión Neuromuscular: Ítems 16 al 18.

---

## Cómo Probar la Skill con este Archivo

1. En el chat con el asistente de IA, escribe:
   > *"Toma los datos de `ejemplos/datos_ejemplo_prepost.csv` y realiza el análisis estadístico pretest-postest bajo el Método Tandazo con normas APA 7."*
2. El agente procesará:
   * Alfa de Cronbach para pretest ($\alpha = 0,874$) y postest ($\alpha = 0,865$).
   * Normalidad de diferencias con Shapiro-Wilk ($W = 0,958, p = 0,242$).
   * Prueba paramétrica $t$ de Student ($t = 12,880, p < 0,001, d_z = 2,28$).
   * Prueba no paramétrica de Wilcoxon ($Z = -4,944, p < 0,001$).
   * Baremos de movilidad educativa (Inicio, Proceso, Logrado).
