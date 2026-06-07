from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_service import extract_text_from_pdf, is_valid_pdf
import os, uuid, json
from pathlib import Path

router = APIRouter()

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data"))
DATA_DIR.mkdir(exist_ok=True)
INDEX_FILE = DATA_DIR / "docs.json"

def load_index() -> list:
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text())
    return []

def save_index(docs: list):
    INDEX_FILE.write_text(json.dumps(docs, ensure_ascii=False, indent=2))

def get_doc(doc_id: str) -> dict | None:
    return next((d for d in load_index() if d["id"] == doc_id), None)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Sadece PDF dosyaları desteklenir")

    pdf_bytes = await file.read()

    if not is_valid_pdf(pdf_bytes):
        raise HTTPException(
            status_code=400,
            detail="Bu PDF taranmış veya görsel tabanlı. Metin içeren PDF yükleyin."
        )

    pages = extract_text_from_pdf(pdf_bytes)
    full_text = "\n\n".join([p["full_text"] for p in pages])
    doc_id = str(uuid.uuid4())

    # PDF'i diske kaydet
    pdf_path = DATA_DIR / f"{doc_id}.pdf"
    pdf_path.write_bytes(pdf_bytes)

    # Meta veriyi JSON index'e kaydet
    doc = {
        "id": doc_id,
        "filename": file.filename,
        "page_count": len(pages),
        "full_text": full_text[:50000],
        "concepts_json": None,
        "concept_count": 0,
        "kg_json": None,
        "status": "uploaded",
        "created_at": __import__("datetime").datetime.now().isoformat(),
    }
    docs = load_index()
    docs.insert(0, doc)
    save_index(docs)

    return {"doc_id": doc_id, "filename": file.filename, "page_count": len(pages)}

@router.get("/")
async def list_documents():
    docs = load_index()
    return [{"id": d["id"], "filename": d["filename"], "page_count": d["page_count"],
             "concept_count": d.get("concept_count", 0), "status": d["status"],
             "created_at": d.get("created_at")} for d in docs]

@router.get("/{doc_id}")
async def get_document(doc_id: str):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    return doc

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    docs = load_index()
    docs = [d for d in docs if d["id"] != doc_id]
    save_index(docs)
    pdf_path = DATA_DIR / f"{doc_id}.pdf"
    if pdf_path.exists():
        pdf_path.unlink()
    return {"status": "silindi"}
