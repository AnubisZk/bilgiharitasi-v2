# BilgiHaritası 🗺️

> PDF'ini yükle. Kavramlarını keşfet. Öğrendiğini kanıtla.

Claude ve Gemini ile güçlendirilmiş, tamamen Türkçe çalışan interaktif öğrenme platformu.

## Özellikler

- 📄 **PDF Analizi** — Metin tabanlı PDF'lerden kavram tespiti
- 🏷️ **Kavram Etiketleri** — Her kavram için tip belirleme (3D, animasyon, formül, grafik)
- 🎨 **Görselleştirme** — Three.js 3D modeller, Canvas animasyonlar, KaTeX formüller
- 🕸️ **Bilgi Grafiği** — İnteraktif force-directed graph, kavramlar arası ilişkiler
- ✅ **Quiz** — Çoktan seçmeli sorular, anında geri bildirim
- 🎴 **Flashcard** — Spaced repetition kartları
- 💬 **Sohbet** — Döküman üzerinden soru-cevap
- 💡 **Feynman** — AI meraklı çocuk rolünde, sen anlat
- ↓ **Export** — DOCX, PDF, PPTX formatında indirme
- 🟠🔵 **Çift AI** — Claude ve Gemini arasında geçiş

## Hızlı Başlangıç

### 1. Supabase Kurulumu

1. [supabase.com](https://supabase.com) → Yeni proje oluştur
2. SQL Editor → `backend/schema.sql` içeriğini çalıştır
3. Settings → API → URL ve anon key'i kopyala

### 2. Backend (Railway)

```bash
cd backend
cp ../.env.example .env
# .env dosyasını düzenle
pip install -r requirements.txt
uvicorn main:app --reload
```

Railway deploy:
1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Root directory: `backend`
3. Environment Variables ekle (SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY)

### 3. Frontend (Netlify)

```bash
cd frontend
cp ../.env.example .env
# VITE_ değişkenlerini düzenle
npm install
npm run dev
```

Netlify deploy:
1. GitHub'a push et
2. [netlify.com](https://netlify.com) → New site from Git
3. Build settings: `frontend/` base, `npm run build`, `dist` publish
4. Environment Variables ekle (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL)

## API Keys

| Servis | Nereden Alınır |
|--------|---------------|
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com) |
| Google (Gemini) | [aistudio.google.com](https://aistudio.google.com) |
| Supabase | Proje ayarları → API |

## Mimari

```
frontend/ (Vite + React → Netlify)
  ├── AuthPage      → Supabase auth
  ├── LibraryPage   → Döküman listesi + upload
  └── ViewerPage    → Ana görüntüleyici
      ├── ConceptPanel  → Kavramlar + görselleştirme
      ├── KnowledgeGraph → İnteraktif bilgi grafiği
      ├── QuizPanel     → Çoktan seçmeli
      ├── FlashcardPanel → Kartlar
      ├── ChatPanel     → Sohbet
      └── FeynmanPanel  → Feynman tekniği

backend/ (FastAPI → Railway)
  ├── /documents    → PDF upload, liste, silme
  ├── /analyze      → Kavram tespiti, KG, quiz, flashcard, chat
  └── /export       → DOCX, PDF, PPTX üretimi

services/
  ├── ai_service.py  → Claude + Gemini entegrasyonu
  └── pdf_service.py → PyMuPDF metin çıkarma
```

## Lisans

MIT
