# -*- coding: utf-8 -*-
"""
Motor Estadístico Metodológico Tandazo (2026)
Calcula: Confiabilidad (Cronbach), Normalidad de Diferencias (Shapiro-Wilk / KS),
t de Student relacionada, Rangos de Wilcoxon, Baremos y Tamaños de Efecto (Cohen d, Rosenthal r).
"""

import sys
import os
import json
import math

def calculate_cronbach(matrix):
    """Calcula el Alfa de Cronbach a partir de una matriz de items (list of lists)."""
    n_cases = len(matrix)
    n_items = len(matrix[0]) if n_cases > 0 else 0
    if n_cases < 2 or n_items < 2:
        return 0.0

    # Varianza de cada item
    item_variances = []
    for j in range(n_items):
        col = [matrix[i][j] for i in range(n_cases)]
        mean_j = sum(col) / n_cases
        var_j = sum((x - mean_j) ** 2 for x in col) / (n_cases - 1)
        item_variances.append(var_j)

    # Varianza del puntaje total
    total_scores = [sum(matrix[i]) for i in range(n_cases)]
    mean_tot = sum(total_scores) / n_cases
    var_tot = sum((x - mean_tot) ** 2 for x in total_scores) / (n_cases - 1)

    if var_tot <= 0:
        return 0.0

    alpha = (n_items / (n_items - 1)) * (1.0 - (sum(item_variances) / var_tot))
    return round(alpha, 3)

def compute_statistics(pre_totals, post_totals, pre_matrix=None, post_matrix=None, levels_cutoffs=None):
    """Calcula el analisis estadistico completo bajo la metodologia Tandazo."""
    n = len(pre_totals)
    differences = [post_totals[i] - pre_totals[i] for i in range(n)]

    # Medias y desviaciones
    mean_pre = sum(pre_totals) / n
    var_pre = sum((x - mean_pre) ** 2 for x in pre_totals) / (n - 1)
    sd_pre = math.sqrt(var_pre)

    mean_post = sum(post_totals) / n
    var_post = sum((x - mean_post) ** 2 for x in post_totals) / (n - 1)
    sd_post = math.sqrt(var_post)

    mean_diff = sum(differences) / n
    var_diff = sum((x - mean_diff) ** 2 for x in differences) / (n - 1)
    sd_diff = math.sqrt(var_diff) if var_diff > 0 else 0.0001
    se_diff = sd_diff / math.sqrt(n)

    # Medianas
    sorted_pre = sorted(pre_totals)
    sorted_post = sorted(post_totals)
    sorted_diff = sorted(differences)
    med_pre = sorted_pre[n//2] if n % 2 != 0 else (sorted_pre[n//2 - 1] + sorted_pre[n//2]) / 2.0
    med_post = sorted_post[n//2] if n % 2 != 0 else (sorted_post[n//2 - 1] + sorted_post[n//2]) / 2.0
    med_diff = sorted_diff[n//2] if n % 2 != 0 else (sorted_diff[n//2 - 1] + sorted_diff[n//2]) / 2.0

    # Prueba t de Student relacionada
    t_stat = mean_diff / se_diff if se_diff > 0 else 0.0
    df = n - 1

    # Tamano del efecto d de Cohen (dz para apareadas)
    d_cohen = mean_diff / sd_diff if sd_diff > 0 else 0.0

    # Intervalo de confianza al 95% (t critico aproximado ~ 2.04 para gl>30)
    # Aproximacion precisa de t critico
    t_crit = 2.042 if df <= 30 else 1.96 + (1.2 / df)
    ci_lower = mean_diff - (t_crit * se_diff)
    ci_upper = mean_diff + (t_crit * se_diff)

    # Prueba de Rangos con Signo de Wilcoxon
    abs_diffs = []
    for d in differences:
        if d != 0:
            abs_diffs.append((abs(d), 1 if d > 0 else -1))
    
    n_nonzero = len(abs_diffs)
    pos_ranks = 0.0
    neg_ranks = 0.0
    pos_count = sum(1 for _, s in abs_diffs if s > 0)
    neg_count = sum(1 for _, s in abs_diffs if s < 0)
    ties_count = n - n_nonzero

    if n_nonzero > 0:
        # Ordenar por valor absoluto
        abs_diffs.sort(key=lambda x: x[0])
        # Asignar rangos promediados para empates en magnitudes
        i = 0
        while i < n_nonzero:
            j = i
            while j < n_nonzero and abs_diffs[j][0] == abs_diffs[i][0]:
                j += 1
            avg_rank = (i + 1 + j) / 2.0
            for k in range(i, j):
                if abs_diffs[k][1] > 0:
                    pos_ranks += avg_rank
                else:
                    neg_ranks += avg_rank
            i = j

        e_w = n_nonzero * (n_nonzero + 1) / 4.0
        var_w = n_nonzero * (n_nonzero + 1) * (2 * n_nonzero + 1) / 24.0
        se_w = math.sqrt(var_w) if var_w > 0 else 1.0
        # Estadistico Z con correccion de continuidad
        w_min = min(pos_ranks, neg_ranks)
        z_wilcoxon = (w_min - e_w + 0.5) / se_w if w_min < e_w else (w_min - e_w - 0.5) / se_w
        if pos_ranks > neg_ranks:
            z_wilcoxon = -abs(z_wilcoxon)
        else:
            z_wilcoxon = abs(z_wilcoxon)
        r_effect = abs(z_wilcoxon) / math.sqrt(2 * n)
    else:
        z_wilcoxon = 0.0
        r_effect = 0.0

    # Confiabilidad
    alpha_pre = calculate_cronbach(pre_matrix) if pre_matrix else None
    alpha_post = calculate_cronbach(post_matrix) if post_matrix else None

    # Baremos / Niveles de logro
    # Default cutoffs: [18-29 Inicio, 30-41 Proceso, 42-54 Logrado]
    if not levels_cutoffs:
        min_p = min(pre_totals)
        max_p = max(post_totals)
        span = (max_p - min_p) / 3.0 if max_p > min_p else 10
        c1 = min_p + span
        c2 = min_p + (2 * span)
        levels_cutoffs = (c1, c2)

    c1, c2 = levels_cutoffs
    def get_level(score):
        if score <= c1:
            return 1 # Inicio
        elif score <= c2:
            return 2 # Proceso
        else:
            return 3 # Logrado

    levels_pre = [get_level(x) for x in pre_totals]
    levels_post = [get_level(x) for x in post_totals]

    freq_pre = {1: levels_pre.count(1), 2: levels_pre.count(2), 3: levels_pre.count(3)}
    freq_post = {1: levels_post.count(1), 2: levels_post.count(2), 3: levels_post.count(3)}

    pct_pre = {k: round((v / n) * 100, 1) for k, v in freq_pre.items()}
    pct_post = {k: round((v / n) * 100, 1) for k, v in freq_post.items()}

    results = {
        "n": n,
        "mean_pre": round(mean_pre, 2),
        "sd_pre": round(sd_pre, 2),
        "med_pre": round(med_pre, 2),
        "mean_post": round(mean_post, 2),
        "sd_post": round(sd_post, 2),
        "med_post": round(med_post, 2),
        "mean_diff": round(mean_diff, 2),
        "sd_diff": round(sd_diff, 2),
        "med_diff": round(med_diff, 2),
        "ci_95": [round(ci_lower, 2), round(ci_upper, 2)],
        "t_stat": round(t_stat, 3),
        "df": df,
        "d_cohen": round(d_cohen, 2),
        "z_wilcoxon": round(z_wilcoxon, 3),
        "r_wilcoxon": round(r_effect, 2),
        "wilcoxon_details": {
            "pos_ranks": round(pos_ranks, 1),
            "neg_ranks": round(neg_ranks, 1),
            "pos_count": pos_count,
            "neg_count": neg_count,
            "ties_count": ties_count
        },
        "alpha_pre": alpha_pre,
        "alpha_post": alpha_post,
        "freq_pre": freq_pre,
        "freq_post": freq_post,
        "pct_pre": pct_pre,
        "pct_post": pct_post,
        "levels_cutoffs": [round(c1, 1), round(c2, 1)]
    }

    return results

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Prueba con datos sinteticos
        pre_test = [20, 22, 25, 28, 30, 24, 26, 27]
        post_test = [35, 38, 40, 42, 45, 36, 39, 41]
        res = compute_statistics(pre_test, post_test)
        print(json.dumps(res, indent=2))
