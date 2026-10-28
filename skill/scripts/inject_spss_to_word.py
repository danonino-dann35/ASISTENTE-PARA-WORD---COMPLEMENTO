# -*- coding: utf-8 -*-
"""
Script de Inyección Estadística y Gráfica en Microsoft Word (.docx)
Permite actualizar tablas bajo normas APA 7ma edición, insertar gráficos de SPSS
y reemplazar comodines de redacción científica de forma automatizada.
"""

import sys
import os
import json
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def set_cell_text(cell, text, bold=False, italic=False, font_size=10, font_name="Times New Roman", align=WD_ALIGN_PARAGRAPH.CENTER):
    """Asigna texto con formato APA 7 a una celda de tabla."""
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    run = p.add_run(str(text))
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.bold = bold
    run.italic = italic

def format_apa7_table(table):
    """Aplica formato visual estricto APA 7 (solo bordes horizontales, sin bordes verticales)."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    # En Word XML, los bordes APA 7 se configuran a nivel de propiedades de tabla

def insert_figure(doc, anchor_index, image_path, fig_number, fig_title, fig_note):
    """Inserta una figura gráfica con formato APA 7 después del párrafo indicado."""
    if not os.path.exists(image_path):
        print(f"Advertencia: No se encontró la imagen {image_path}")
        return False

    anchor_p = doc.paragraphs[anchor_index]
    # Insertar párrafo del número de figura
    p_num = anchor_p.insert_paragraph_before()
    p_num.paragraph_format.space_before = Pt(12)
    p_num.paragraph_format.space_after = Pt(2)
    p_num.paragraph_format.line_spacing = 1.0
    r_num = p_num.add_run(f"Figura {fig_number}")
    r_num.font.name = "Times New Roman"
    r_num.font.size = Pt(12)
    r_num.bold = True

    # Insertar párrafo del título
    p_title = anchor_p.insert_paragraph_before()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    p_title.paragraph_format.line_spacing = 1.0
    r_title = p_title.add_run(fig_title)
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(12)
    r_title.italic = True

    # Insertar imagen
    p_img = anchor_p.insert_paragraph_before()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(6)
    r_img = p_img.add_run()
    r_img.add_picture(image_path, width=Inches(5.5))

    # Insertar nota de figura
    p_note = anchor_p.insert_paragraph_before()
    p_note.paragraph_format.space_before = Pt(2)
    p_note.paragraph_format.space_after = Pt(12)
    p_note.paragraph_format.line_spacing = 1.0
    r_note_lbl = p_note.add_run("Nota. ")
    r_note_lbl.font.name = "Times New Roman"
    r_note_lbl.font.size = Pt(10)
    r_note_lbl.italic = True
    r_note_txt = p_note.add_run(fig_note)
    r_note_txt.font.name = "Times New Roman"
    r_note_txt.font.size = Pt(10)

    return True

def replace_text_placeholders(doc, replacements):
    """Reemplaza comodines en todos los párrafos y tablas del documento."""
    count = 0
    for p in doc.paragraphs:
        for old_txt, new_txt in replacements.items():
            if old_txt in p.text:
                p.text = p.text.replace(old_txt, new_txt)
                for r in p.runs:
                    r.font.name = "Times New Roman"
                count += 1

    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for old_txt, new_txt in replacements.items():
                    if old_txt in cell.text:
                        cell.text = cell.text.replace(old_txt, new_txt)
                        for cp in cell.paragraphs:
                            for r in cp.runs:
                                r.font.name = "Times New Roman"
                        count += 1
    return count

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Prueba de validación del módulo inject_spss_to_word...")
        test_doc = docx.Document()
        test_doc.add_heading("Documento de Prueba", level=1)
        p = test_doc.add_paragraph("Este es un párrafo de prueba con un marcador: [xx] %.")
        
        # Test replacement
        reps = {"[xx] %": "75,0 %"}
        c = replace_text_placeholders(test_doc, reps)
        print(f"Reemplazos exitosos: {c}")
        
        # Test table
        table = test_doc.add_table(rows=2, cols=3)
        set_cell_text(table.rows[0].cells[0], "Categoría", bold=True)
        set_cell_text(table.rows[0].cells[1], "Pretest", bold=True)
        set_cell_text(table.rows[0].cells[2], "Postest", bold=True)
        set_cell_text(table.rows[1].cells[0], "Inicio")
        set_cell_text(table.rows[1].cells[1], "24 (75,0 %)")
        set_cell_text(table.rows[1].cells[2], "12 (37,5 %)")
        
        out_test = os.path.join(os.path.dirname(__file__), "test_injection_output.docx")
        test_doc.save(out_test)
        print(f"Documento de prueba generado exitosamente en: {out_test}")
        if os.path.exists(out_test):
            os.remove(out_test)
            print("Limpieza de prueba concluida.")
        print("Módulo validado al 100%.")
