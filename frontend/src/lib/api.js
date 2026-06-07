const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const supabase = { auth: { getSession: async () => ({ data: { session: null } }) } }

export const api = {
  async uploadDocument(file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_URL}/documents/upload`, { method: 'POST', body: formData })
    return res.json()
  },
  async listDocuments() {
    const res = await fetch(`${API_URL}/documents/`)
    return res.json()
  },
  async getDocument(docId) {
    const res = await fetch(`${API_URL}/documents/${docId}`)
    return res.json()
  },
  async deleteDocument(docId) {
    const res = await fetch(`${API_URL}/documents/${docId}`, { method: 'DELETE' })
    return res.json()
  },
  async detectConcepts(docId, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/concepts`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ provider }) })
    return res.json()
  },
  async buildKG(docId, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/knowledge-graph`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ provider }) })
    return res.json()
  },
  async getKG(docId) {
    const res = await fetch(`${API_URL}/analyze/${docId}/knowledge-graph`)
    return res.json()
  },
  async generateQuiz(docId, sayi = 5, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/quiz`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ sayi, provider }) })
    return res.json()
  },
  async generateFlashcards(docId, sayi = 10, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/flashcards`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ sayi, provider }) })
    return res.json()
  },
  async chat(docId, soru, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/chat`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ soru, provider }) })
    return res.json()
  },
  async feynman(docId, kavram, aciklama, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/feynman`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ kavram, aciklama, provider }) })
    return res.json()
  },
  async getVizSpec(docId, kavram, tip, aciklama, provider = 'claude') {
    const res = await fetch(`${API_URL}/analyze/${docId}/viz-spec`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ kavram, tip, aciklama, provider }) })
    return res.json()
  },
}
