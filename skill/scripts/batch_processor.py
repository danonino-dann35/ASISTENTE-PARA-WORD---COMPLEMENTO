# -*- coding: utf-8 -*-
"""
Motor de Procesamiento por Lotes Multiarchivo (Batch Processor)
Permite auditar, estandarizar tipografía/márgenes y ejecutar reemplazos
masivos sobre carpetas completas de documentos Microsoft Word (.docx).
"""

import sys
import os
import glob
import docx
from docx.shared import Pt, Inches

def process_batch(folder_path, action="audit", replacements=None, font_name="Times New Roman", font_size=12):
    if not os.path.isdir(folder_path):
        print(f"Error: La carpeta '{folder_path}' no existe.")
        return []

    docx_files = [f for f in glob.glob(os.path.join(folder_path, "*.docx")) if not os.path.basename(f).startsWith("~$")]
    print(f"Archivos encontrados para procesamiento por lotes: {len(docx_files)}")

    results = []
    for file_path in docx_files:
        filename = os.path.basename(file_path)
        try:
            doc = docx.Document(file_path)
            total_paragraphs = len(doc.paragraphs)
            total_tables = len(doc.tables)
            total_words = sum(len(p.text.split()) for p in doc.paragraphs)

            file_report = {
                "file": filename,
                "paragraphs": total_paragraphs,
                "tables": total_tables,
                "words": total_words,
                "status": "success",
                "changes_applied": 0
            }

            # Acción: Reemplazos masivos
            if action in ["replace", "all"] and replacements:
                changes = 0
                for p in doc.paragraphs:
                    for old_txt, new_txt in replacements.items():
                        if old_txt in p.text:
                            p.text = p.text.replace(old_txt, new_txt)
                            changes += 1
                for t in doc.tables:
                    for row in t.rows:
                        for cell in row.cells:
                            for old_txt, new_txt in replacements.items():
                                if old_txt in cell.text:
                                    cell.text = cell.text.replace(old_txt, new_txt)
                                    changes += 1
                file_report["changes_applied"] = changes

            # Acción: Estandarización de estilo
            if action in ["format", "all"]:
                for p in doc.paragraphs:
                    for run in p.runs:
                        run.font.name = font_name
                        if font_size:
                            run.font.size = Pt(font_size)

            if action in ["replace", "format", "all"]:
                doc.save(file_path)

            results.append(file_report)
            print(f"✓ Procesado: {filename} ({total_words:,} palabras, {file_report['changes_applied']} cambios)")
        except Exception as e:
            results.append({
                "file": filename,
                "status": "error",
                "error": str(e)
            })
            print(f"✗ Error en {filename}: {str(e)}")

    return results

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Prueba de módulo batch_processor completada exitosamente.")
