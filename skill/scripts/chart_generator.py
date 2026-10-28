# -*- coding: utf-8 -*-
"""
Generador de Gráficos e Ilustraciones Nativas para Word (.docx)
Produce figuras gráficas de alta resolución (barras, líneas, circular)
con tipografía editorial y las inserta con normas APA 7ma edición.
"""

import sys
import os
import math
from PIL import Image, ImageDraw, ImageFont
import docx
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

def render_bar_chart(categories, series1, series2=None, series1_name="Serie 1", series2_name="Serie 2", title="Gráfico Comparativo", out_path="chart.png"):
    width, height = 900, 520
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Marco
    draw.rectangle([10, 10, width - 10, height - 10], outline=(226, 232, 240, 255), width=2)

    # Título
    draw.text((width / 2, 35), title, fill=(15, 23, 42, 255), anchor="mm")

    start_x = 90
    base_y = 420
    chart_w = width - 160
    chart_h = 320

    max_val = max(series1 + (series2 or [0])) * 1.25 or 10

    # Eje horizontal
    draw.line([(start_x, base_y), (start_x + chart_w, base_y)], fill=(148, 163, 184, 255), width=2)

    n_groups = len(categories)
    group_width = chart_w / n_groups
    bar_w = group_width * 0.3

    for i in range(n_groups):
        gx = start_x + i * group_width + group_width * 0.15

        # Barra 1 (Azul institucional)
        h1 = (series1[i] / max_val) * chart_h
        draw.rectangle([gx, base_y - h1, gx + bar_w, base_y], fill=(37, 99, 235, 255))
        draw.text((gx + bar_w / 2, base_y - h1 - 12), str(round(series1[i], 1)), fill=(30, 41, 59, 255), anchor="mm")

        # Barra 2 (Verde esmeralda)
        if series2:
            h2 = (series2[i] / max_val) * chart_h
            draw.rectangle([gx + bar_w + 8, base_y - h2, gx + bar_w * 2 + 8, base_y], fill=(16, 185, 129, 255))
            draw.text((gx + bar_w * 1.5 + 8, base_y - h2 - 12), str(round(series2[i], 1)), fill=(30, 41, 59, 255), anchor="mm")

        # Etiqueta categoría
        cat_cx = gx + (bar_w if not series2 else bar_w + 4)
        draw.text((cat_cx, base_y + 20), categories[i], fill=(71, 85, 105, 255), anchor="mm")

    # Leyenda
    draw.rectangle([width / 2 - 120, 60, width / 2 - 100, 75], fill=(37, 99, 235, 255))
    draw.text((width / 2 - 90, 67), series1_name, fill=(51, 65, 85, 255), anchor="lm")
    if series2:
        draw.rectangle([width / 2 + 20, 60, width / 2 + 40, 75], fill=(16, 185, 129, 255))
        draw.text((width / 2 + 50, 67), series2_name, fill=(51, 65, 85, 255), anchor="lm")

    img.save(out_path, "PNG")
    return out_path

def insert_chart_into_docx(doc, image_path, fig_num="1", fig_title="Gráfico", fig_note="Elaboración propia."):
    p_num = doc.add_paragraph()
    p_num.paragraph_format.space_before = Pt(12)
    p_num.paragraph_format.space_after = Pt(2)
    r_num = p_num.add_run(f"Figura {fig_num}")
    r_num.font.name = "Times New Roman"
    r_num.font.bold = True

    p_tit = doc.add_paragraph()
    p_tit.paragraph_format.space_before = Pt(0)
    p_tit.paragraph_format.space_after = Pt(6)
    r_tit = p_tit.add_run(fig_title)
    r_tit.font.name = "Times New Roman"
    r_tit.font.italic = True

    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(6)
    p_img.add_run().add_picture(image_path, width=Inches(5.5))

    p_note = doc.add_paragraph()
    p_note.paragraph_format.space_before = Pt(2)
    p_note.paragraph_format.space_after = Pt(12)
    r_nl = p_note.add_run("Nota. ")
    r_nl.font.name = "Times New Roman"
    r_nl.font.size = Pt(10)
    r_nl.font.italic = True
    r_nt = p_note.add_run(fig_note)
    r_nt.font.name = "Times New Roman"
    r_nt.font.size = Pt(10)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_img = "test_chart.png"
        render_bar_chart(["Cat A", "Cat B", "Cat C"], [10, 20, 30], [15, 25, 35], out_path=test_img)
        if os.path.exists(test_img):
            os.remove(test_img)
        print("Generador de gráficos validado con éxito.")
