import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function LibraryPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const nav = useNavigate()

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    setLoading(true)
    const data = await api.listDocuments()
    setDocs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleUpload(file) {
    if (!file?.name.endsWith('.pdf')) { alert('Lütfen PDF seçin.'); return }
    setUploading(true)
    try {
      const result = await api.uploadDocument(file)
      if (result.doc_id) { await loadDocs(); nav(`/goruntule/${result.doc_id}`) }
      else alert(result.detail || 'Yükleme başarısız')
    } catch { alert('Yükleme sırasında hata oluştu.') }
    finally { setUploading(false) }
  }

  async function deleteDoc(e, docId) {
    e.stopPropagation()
    if (!confirm('Bu dökümanı silmek istediğinize emin misiniz?')) return
    await api.deleteDocument(docId)
    setDocs(docs.filter(d => d.id !== docId))
  }

  const statusLabel = { uploaded: 'Yüklendi', analyzed: 'Analiz edildi', analyzing: 'Analiz ediliyor' }
  const statusColor = { uploaded: 'var(--ink3)', analyzed: 'var(--green)', analyzing: 'var(--gold)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '0.9rem 2rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)', boxShadow: 'var(--shadow-sm)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          BilgiHaritası
        </h1>
        <span style={{ color: 'var(--ink3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          {docs.length} döküman
        </span>
      </header>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Upload zone */}
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]) }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: '14px', padding: '2.5rem', textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            background: dragOver ? 'var(--accent-light)' : 'var(--surface)',
            transition: 'all 0.2s', marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
          {uploading ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--ink)' }}>Yükleniyor...</div>
              <div style={{ color: 'var(--ink3)', fontSize: '0.85rem' }}>Metin çıkarılıyor</div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--ink)' }}>
                PDF'ini buraya sürükle veya tıkla
              </div>
              <div style={{ color: 'var(--ink3)', fontSize: '0.82rem' }}>
                Yalnızca metin tabanlı PDF'ler desteklenir
              </div>
            </>
          )}
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files[0])} />
        </div>

        {/* Doc list */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--ink)' }}>
          Kütüphanem
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--ink3)', padding: '3rem' }}>Yükleniyor...</div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ink3)', padding: '3rem' }}>
            Henüz döküman yok. İlk PDF'ini yükle!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {docs.map(doc => (
              <div key={doc.id} className="card" onClick={() => nav(`/goruntule/${doc.id}`)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>📖</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                    {doc.filename}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--ink3)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                    <span>{doc.page_count} sayfa</span>
                    {doc.concept_count > 0 && <span>{doc.concept_count} kavram</span>}
                    <span style={{ color: statusColor[doc.status] || 'var(--ink3)' }}>
                      {statusLabel[doc.status] || doc.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button className="btn btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={e => { e.stopPropagation(); nav(`/goruntule/${doc.id}`) }}>Aç</button>
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={e => deleteDoc(e, doc.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
