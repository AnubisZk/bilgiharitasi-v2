from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import (
    detect_concepts, build_knowledge_graph, generate_quiz,
    generate_flashcards, chat_with_document, feynman_session, generate_viz_spec
)
from routers.documents import load_index, save_index, get_doc
import json

router = APIRouter()

class ProviderRequest(BaseModel):
    provider: str = "claude"

class ChatRequest(BaseModel):
    soru: str
    provider: str = "claude"

class FeynmanRequest(BaseModel):
    kavram: str
    aciklama: str
    provider: str = "claude"

class VizRequest(BaseModel):
    kavram: str
    tip: str
    aciklama: str
    provider: str = "claude"

class QuizRequest(BaseModel):
    sayi: int = 5
    provider: str = "claude"

class FlashcardRequest(BaseModel):
    sayi: int = 10
    provider: str = "claude"

def update_doc(doc_id: str, updates: dict):
    docs = load_index()
    for d in docs:
        if d["id"] == doc_id:
            d.update(updates)
    save_index(docs)

@router.post("/{doc_id}/concepts")
async def analyze_concepts(doc_id: str, req: ProviderRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    concepts = await detect_concepts(doc["full_text"], req.provider)
    update_doc(doc_id, {
        "concepts_json": json.dumps(concepts, ensure_ascii=False),
        "concept_count": len(concepts),
        "status": "analyzed"
    })
    return {"kavramlar": concepts, "toplam": len(concepts)}

@router.post("/{doc_id}/knowledge-graph")
async def build_kg(doc_id: str, req: ProviderRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    kg = await build_knowledge_graph(doc["full_text"], req.provider)
    update_doc(doc_id, {"kg_json": json.dumps(kg, ensure_ascii=False)})
    return kg

@router.get("/{doc_id}/knowledge-graph")
async def get_kg(doc_id: str):
    doc = get_doc(doc_id)
    if not doc or not doc.get("kg_json"):
        raise HTTPException(status_code=404, detail="Bilgi grafiği henüz oluşturulmadı")
    return json.loads(doc["kg_json"])

@router.post("/{doc_id}/quiz")
async def quiz(doc_id: str, req: QuizRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    questions = await generate_quiz(doc["full_text"], req.sayi, req.provider)
    return {"sorular": questions}

@router.post("/{doc_id}/flashcards")
async def flashcards(doc_id: str, req: FlashcardRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    cards = await generate_flashcards(doc["full_text"], req.sayi, req.provider)
    return {"kartlar": cards}

@router.post("/{doc_id}/chat")
async def chat(doc_id: str, req: ChatRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    yanit = await chat_with_document(doc["full_text"], req.soru, req.provider)
    return {"yanit": yanit}

@router.post("/{doc_id}/feynman")
async def feynman(doc_id: str, req: FeynmanRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    yanit = await feynman_session(req.kavram, req.aciklama, req.provider)
    return {"yanit": yanit}

@router.post("/{doc_id}/viz-spec")
async def viz_spec(doc_id: str, req: VizRequest):
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Döküman bulunamadı")
    spec = await generate_viz_spec(req.kavram, req.tip, req.aciklama, req.provider)
    return spec
