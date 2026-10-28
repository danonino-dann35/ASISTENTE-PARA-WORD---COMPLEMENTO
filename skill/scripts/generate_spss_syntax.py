# -*- coding: utf-8 -*-
"""
Generador de Sintaxis Oficial SPSS (.sps) y Base de Datos (.sav)
Metodologia Tandazo (2026)
"""

import sys
import os

def generate_spss_syntax_content(sav_path, n_items, cutoffs=None):
    c1 = cutoffs[0] if cutoffs else 29
    c2 = cutoffs[1] if cutoffs else 41

    syntax = f"""* ====================================================================.
* SINTAXIS AUTOMATIZADA DE ANALISIS ESTADISTICO - METODO TANDAZO (2026).
* INVESTIGACION: PRETEST Y POSTEST EN DISENO PREEXPERIMENTAL / CUASIEXPERIMENTAL.
* ====================================================================.

GET FILE='{sav_path}'.
DATASET NAME BaseActiva WINDOW=FRONT.

* --------------------------------------------------------------------.
* 1. CONFIABILIDAD DEL INSTRUMENTO: ALFA DE CRONBACH (PRETEST Y POSTEST).
* --------------------------------------------------------------------.
RELIABILITY
  /VARIABLES=PRE_ITEM_1 TO PRE_ITEM_{n_items}
  /SCALE('Pretest Confiabilidad Diagnostica') ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE
  /SUMMARY=TOTAL.

RELIABILITY
  /VARIABLES=POST_ITEM_1 TO POST_ITEM_{n_items}
  /SCALE('Postest Confiabilidad Final') ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE
  /SUMMARY=TOTAL.

* --------------------------------------------------------------------.
* 2. SUPUESTO DE NORMALIDAD: CRITERIO UNIDAD 5 METODO TANDAZO.
*    (Evaluado sobre la variable Diferencia = Postest - Pretest).
* --------------------------------------------------------------------.
COMPUTE DIFERENCIA = POST_TOTAL - PRE_TOTAL.
EXECUTE.

EXAMINE VARIABLES=DIFERENCIA
  /PLOT NPPLOT HISTOGRAM
  /STATISTICS DESCRIPTIVES
  /CINTERVAL 95.

* --------------------------------------------------------------------.
* 3. CONTRASTE DE HIPOTESIS PARAMETRICO: T DE STUDENT RELACIONADA.
* --------------------------------------------------------------------.
T-TEST PAIRS=POST_TOTAL WITH PRE_TOTAL (PAIRED)
  /CRITERIA=CI(.95).

* --------------------------------------------------------------------.
* 4. CONTRASTE DE HIPOTESIS NO PARAMETRICO: RANGOS CON SIGNO DE WILCOXON.
* --------------------------------------------------------------------.
NPAR TESTS
  /WILCOXON=POST_TOTAL WITH PRE_TOTAL (PAIRED)
  /STATISTICS DESCRIPTIVES
  /MISSING ANALYSIS.

* --------------------------------------------------------------------.
* 5. MOVILIDAD PEDAGOGICA Y FRECUENCIAS POR NIVELES DE LOGRO.
* --------------------------------------------------------------------.
FREQUENCIES VARIABLES=NIVEL_PRE NIVEL_POST
  /BARCHART PERCENT
  /ORDER=ANALYSIS.

* --------------------------------------------------------------------.
* 6. TABLA DE CONTINGENCIA Y PRUEBA DE CAMBIO (MCNEMAR-BOWKER).
* --------------------------------------------------------------------.
CROSSTABS
  /TABLES=NIVEL_PRE BY NIVEL_POST
  /FORMAT=AVALUE TABLES
  /STATISTICS=MCNEMAR
  /CELLS=COUNT ROW COLUMN TOTAL.

EXECUTE.
"""
    return syntax

if __name__ == "__main__":
    if len(sys.argv) > 2:
        sav_target = sys.argv[1]
        sps_target = sys.argv[2]
        n_it = int(sys.argv[3]) if len(sys.argv) > 3 else 18
        sps_content = generate_spss_syntax_content(sav_target, n_it)
        with open(sps_target, "w", encoding="utf-8") as f:
            f.write(sps_content)
        print(f"[OK] Sintaxis SPSS generada exitosamente en: {sps_target}")
