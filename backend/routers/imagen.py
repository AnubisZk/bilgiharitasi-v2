# backend/routers/imagen.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.imagen_service import generate_concept_image

router = APIRouter()

class ImagenRequest(BaseModel):
    kavram: str
    aciklama: str = ""
    style: str = "educational"

@router.post("/generate")
async def generate_image(req: ImagenRequest):
    if not req.kavram:
        raise HTTPException(status_code=400, detail="Kavram boş olamaz")
    result = await generate_concept_image(req.kavram, req.aciklama, req.style)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Görsel üretilemedi"))
    return result
