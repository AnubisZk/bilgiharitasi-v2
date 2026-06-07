import fitz  # PyMuPDF
import io
from typing import List, Dict

def extract_text_from_pdf(pdf_bytes: bytes) -> List[Dict]:
    """PDF'den sayfa sayfa metin ve pozisyon bilgisi çıkarır."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]
        text_blocks = []
        for block in blocks:
            if block.get("type") == 0:  # text block
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text_blocks.append({
                            "text": span["text"],
                            "bbox": span["bbox"],
                            "size": span["size"],
                            "flags": span["flags"],
                        })
        full_text = page.get_text("text")
        pages.append({
            "page_num": page_num + 1,
            "full_text": full_text,
            "blocks": text_blocks,
            "width": page.rect.width,
            "height": page.rect.height,
        })
    doc.close()
    return pages

def is_valid_pdf(pdf_bytes: bytes) -> bool:
    """PDF'in metin tabanlı olup olmadığını kontrol eder."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        total_text = ""
        for page in doc:
            total_text += page.get_text("text")
        doc.close()
        return len(total_text.strip()) > 100
    except Exception:
        return False
