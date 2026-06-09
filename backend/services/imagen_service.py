# backend/services/imagen_service.py
import google.generativeai as genai
from google.genai import types as gentypes
import os
import base64

async def generate_concept_image(kavram: str, aciklama: str, style: str = "educational") -> dict:
    """
    Kavram için Imagen 4 ile görsel üretir.
    style: educational | realistic | diagram | artistic
    """
    style_prompts = {
        "educational": "clean educational illustration, white background, labeled diagram style, scientific accuracy",
        "realistic": "photorealistic, high detail, professional photography style",
        "diagram": "technical diagram, vector illustration style, clean lines, infographic",
        "artistic": "artistic visualization, vibrant colors, creative interpretation",
    }

    prompt = (
        f"Create a high-quality {style_prompts.get(style, style_prompts['educational'])} "
        f"image of: {kavram}. {aciklama[:200]}. "
        f"No text or labels in the image. Scientific and educational context."
    )

    try:
        from google import genai as gai
        client = gai.Client(api_key=os.environ["GEMINI_API_KEY"])
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=prompt,
            config=gentypes.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="4:3",
            )
        )
        if response.generated_images:
            img_bytes = response.generated_images[0].image.image_bytes
            b64 = base64.b64encode(img_bytes).decode("utf-8")
            return {"success": True, "image_b64": b64, "prompt": prompt}
        return {"success": False, "error": "Görsel üretilemedi"}
    except Exception as e:
        return {"success": False, "error": str(e)}
