import anthropic
import google.generativeai as genai
import os
import json
from typing import Literal

AIProvider = Literal["claude", "gemini"]

CONCEPT_DETECTION_PROMPT = """Sen bir eğitim içeriği uzmanısın. Aşağıdaki PDF metnini analiz et ve görselleştirilmesi faydalı olacak kavramları tespit et.

Her kavram için şunları belirle:
- kavram: Kavramın adı
- aciklama: Kısa Türkçe açıklama  
- tip: "3d_model" | "animasyon" | "formul" | "grafik" | "kaynak"
- zorluk: "kolay" | "orta" | "zor"
- sayfa: Sayfa numarası
- baglam: Kavramın geçtiği cümle

Sadece JSON array döndür, başka hiçbir şey yazma.

Metin:
{text}"""

KG_BUILD_PROMPT = """Bu PDF metninden bir bilgi grafiği oluştur. 8-20 kavram düğümü, aralarındaki ilişkiler.

JSON formatında döndür:
{{
  "dugumler": [{{"id": "1", "ad": "kavram", "tip": "temel|destekleyici|uygulama", "aciklama": "..."}}],
  "kenarlar": [{{"kaynak": "1", "hedef": "2", "iliski": "içerir|gerektirir|örnekler"}}],
  "genel_not": "Doküman hakkında genel değerlendirme"
}}

Metin:
{text}"""

QUIZ_PROMPT = """Aşağıdaki metinden {sayi} adet çoktan seçmeli soru oluştur. Türkçe olsun.

JSON formatında döndür:
[{{"soru": "...", "secenekler": ["A) ...", "B) ...", "C) ...", "D) ..."], "dogru": "A", "aciklama": "..."}}]

Metin:
{text}"""

FLASHCARD_PROMPT = """Aşağıdaki metinden {sayi} adet flashcard oluştur. Türkçe olsun.

JSON formatında döndür:
[{{"on": "kavram veya soru", "arka": "açıklama veya cevap", "zorluk": "kolay|orta|zor"}}]

Metin:
{text}"""

CHAT_PROMPT = """Sen bir eğitim asistanısın. Aşağıdaki PDF dökümanı hakkında Türkçe olarak yardımcı oluyorsun.

Döküman içeriği:
{document_text}

Öğrenci sorusu: {question}

Kısa, net ve anlaşılır bir şekilde yanıtla."""

FEYNMAN_PROMPT = """Sen meraklı bir 10 yaşında çocuksun. Öğrenciden şu kavramı sana anlatmasını istiyorsun: {kavram}

Öğrencinin açıklaması: {aciklama}

Çocuk gibi davranarak anlamadığın yerleri sor, basit bir dille. Türkçe konuş."""
VIZ_SPEC_PROMPT = """Şu kavram için çalışan bir HTML/JavaScript görselleştirme oluştur.

Kavram: {kavram}
Tip: {tip}
Açıklama: {aciklama}

KURALLAR:
- Sadece <script> ve <canvas> veya <div> tagları kullan
- Three.js için: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js kullan
- Animasyon için: requestAnimationFrame kullan
- Kod direkt body içine yerleştirilecek, çalışır olmalı
- Türkçe etiketler ekle

JSON olarak döndür (başka hiçbir şey yazma):
{{"kod": "buraya html/js kodu", "aciklama": "kısa Türkçe açıklama"}}"""

async def call_claude(prompt: str, system: str = "") -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    messages = [{"role": "user", "content": prompt}]
    kwargs = {"model": "claude-opus-4-5", "max_tokens": 4096, "messages": messages}
    if system:
        kwargs["system"] = system
    response = client.messages.create(**kwargs)
    return response.content[0].text

async def call_gemini(prompt: str) -> str:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text

async def ai_call(prompt: str, provider: AIProvider = "claude", system: str = "") -> str:
    if provider == "claude":
        return await call_claude(prompt, system)
    else:
        return await call_gemini(prompt)

def safe_json(text: str):
    """JSON parse, markdown fence'leri temizler."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip().rstrip("```").strip()
    return json.loads(text)

async def detect_concepts(text: str, provider: AIProvider = "claude") -> list:
    prompt = CONCEPT_DETECTION_PROMPT.format(text=text[:8000])
    result = await ai_call(prompt, provider)
    return safe_json(result)

async def build_knowledge_graph(text: str, provider: AIProvider = "claude") -> dict:
    prompt = KG_BUILD_PROMPT.format(text=text[:12000])
    result = await ai_call(prompt, provider)
    return safe_json(result)

async def generate_quiz(text: str, sayi: int = 5, provider: AIProvider = "claude") -> list:
    prompt = QUIZ_PROMPT.format(text=text[:6000], sayi=sayi)
    result = await ai_call(prompt, provider)
    return safe_json(result)

async def generate_flashcards(text: str, sayi: int = 10, provider: AIProvider = "claude") -> list:
    prompt = FLASHCARD_PROMPT.format(text=text[:6000], sayi=sayi)
    result = await ai_call(prompt, provider)
    return safe_json(result)

async def chat_with_document(document_text: str, question: str, provider: AIProvider = "claude") -> str:
    prompt = CHAT_PROMPT.format(document_text=document_text[:8000], question=question)
    return await ai_call(prompt, provider)

async def feynman_session(kavram: str, aciklama: str, provider: AIProvider = "claude") -> str:
    prompt = FEYNMAN_PROMPT.format(kavram=kavram, aciklama=aciklama)
    return await ai_call(prompt, provider)

async def generate_viz_spec(kavram: str, tip: str, aciklama: str, provider: AIProvider = "claude") -> dict:
    prompt = VIZ_SPEC_PROMPT.format(kavram=kavram, tip=tip, aciklama=aciklama)
    result = await ai_call(prompt, provider)
    return safe_json(result)
