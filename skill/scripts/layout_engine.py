# -*- coding: utf-8 -*-
"""
Motor de Maquetación y Formato Avanzado de Documentos Word (.docx)
Configuración de márgenes, orientación de página, saltos de sección,
encabezados y pies de página correlativos.
"""

import sys
import docx
from docx.shared import Inches, Pt
from docx.enum.section import WD_SECTION, WD_ORIENT

def configure_margins(doc, preset="apa"):
    """Ajusta los márgenes de todas las secciones del documento."""
    for section in doc.sections:
        if preset == "apa":
            # 2.54 cm = 1 pulgada en los 4 costados
            section.top_margin = Inches(1.0)
            section.bottom_margin = Inches(1.0)
            section.left_margin = Inches(1.0)
            section.right_margin = Inches(1.0)
        elif preset == "narrow":
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)
        else:
            # Normal: 2.5 cm sup/inf, 3.0 cm izq/der
            section.top_margin = Inches(0.984)
            section.bottom_margin = Inches(0.984)
            section.left_margin = Inches(1.181)
            section.right_margin = Inches(1.181)

def set_orientation(doc, orientation="portrait"):
    """Configura la orientación de la página para la sección actual."""
    for section in doc.sections:
        if orientation.lower() == "landscape":
            section.orientation = WD_ORIENT.LANDSCAPE
            section.page_width = Inches(11.0)
            section.page_height = Inches(8.5)
        else:
            section.orientation = WD_ORIENT.PORTRAIT
            section.page_width = Inches(8.5)
            section.page_height = Inches(11.0)

def add_header_footer(doc, header_text=None, footer_text=None):
    """Agrega encabezado y pie de página formal al documento."""
    for section in doc.sections:
        if header_text:
            header = section.header
            p = header.paragraphs[0]
            p.text = header_text
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(9)
        if footer_text:
            footer = section.footer
            p = footer.paragraphs[0]
            p.text = footer_text
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(9)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        doc_test = docx.Document()
        configure_margins(doc_test, "apa")
        set_orientation(doc_test, "portrait")
        add_header_footer(doc_test, "Encabezado Formal", "Página 1")
        print("Motor de maquetación validado con éxito.")
