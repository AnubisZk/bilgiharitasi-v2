-- BilgiHaritası Supabase Schema
-- Supabase SQL Editor'da çalıştır

-- Documents tablosu
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  page_count INTEGER DEFAULT 0,
  full_text TEXT,
  pages_json TEXT,
  concepts_json TEXT,
  concept_count INTEGER DEFAULT 0,
  kg_json TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concepts tablosu
CREATE TABLE IF NOT EXISTS concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kavram TEXT NOT NULL,
  aciklama TEXT,
  tip TEXT DEFAULT 'kaynak',
  zorluk TEXT DEFAULT 'orta',
  sayfa INTEGER DEFAULT 1,
  baglam TEXT,
  -- Mastery skorları (0-100, monoton artış)
  hafiza INTEGER DEFAULT 0,
  anlama INTEGER DEFAULT 0,
  yapi INTEGER DEFAULT 0,
  uygulama INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes tablosu
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sorular TEXT, -- JSON array
  tamamlandi BOOLEAN DEFAULT FALSE,
  skor INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards tablosu
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kartlar TEXT, -- JSON array
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat geçmişi
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rol TEXT NOT NULL, -- 'user' | 'assistant'
  mesaj TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kendi dökümanlarını gör" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kendi kavramlarını gör" ON concepts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kendi quizlerini gör" ON quizzes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kendi kartlarını gör" ON flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kendi sohbetlerini gör" ON chat_history FOR ALL USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Kendi dosyalarını yükle" ON storage.objects
  FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);
