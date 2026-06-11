import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function LibraryPage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pwError, setPwError] = useState('')
  const fileRef = useRef()
  const nav = useNavigate()

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    setLoading(true)
    const data = await api.listDocuments()
    setDocs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function requestUpload(file) {
    if (!file?.name.endsWith('.pdf')) { alert('Lütfen PDF seçin.'); return }
    setPendingFile(file)
    setPassword('')
    setPwError('')
    setShowPasswordModal(true)
  }

  async function confirmUpload() {
    if (!password) { setPwError('Şifre boş olamaz'); return }
    setUploading(true)
    setPwError('')
    try {
      const result = await api.uploadDocument(pendingFile, password)
      if (result.doc_id) {
        setShowPasswordModal(false)
        await loadDocs()
        nav(`/goruntule/${result.doc_id}`)
      } else if (result.detail === 'Yükleme şifresi hatalı') {
        setPwError('❌ Hatalı şifre')
      } else {
        setPwError(result.detail || 'Yükleme başarısız')
      }
    } catch { setPwError('Bağlantı hatası') }
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
      <header style={{ padding: '0.9rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--ink)', letterSpacing: '-0.02em' }}>BilgiHaritası</h1>
        <span style={{ color: 'var(--ink3)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{docs.length} döküman</span>
      </header>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Upload zone */}
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); requestUpload(e.dataTransfer.files[0]) }}
          style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: '14px', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-light)' : 'var(--surface)', transition: 'all 0.2s', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--ink)' }}>
            PDF'ini buraya sürükle veya tıkla
          </div>
          <div style={{ color: 'var(--ink3)', fontSize: '0.82rem' }}>Yalnızca metin tabanlı PDF'ler desteklenir</div>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => requestUpload(e.target.files[0])} />
        </div>

        {/* Doc list */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--ink)' }}>Kütüphanem</h2>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--ink3)', padding: '3rem' }}>Yükleniyor...</div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ink3)', padding: '3rem' }}>Henüz döküman yok. İlk PDF'ini yükle!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {docs.map(doc => (
              <div key={doc.id} className="card" onClick={() => nav(`/goruntule/${doc.id}`)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>📖</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>{doc.filename}</div>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--ink3)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                    <span>{doc.page_count} sayfa</span>
                    {doc.concept_count > 0 && <span>{doc.concept_count} kavram</span>}
                    <span style={{ color: statusColor[doc.status] || 'var(--ink3)' }}>{statusLabel[doc.status] || doc.status}</span>
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

      {/* Şifre Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>
              🔐 Yükleme Şifresi
            </div>
            <p style={{ color: 'var(--ink2)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              <strong>{pendingFile?.name}</strong> yüklemek için şifreyi girin.
            </p>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwError('') }}
              onKeyDown={e => e.key === 'Enter' && confirmUpload()}
              placeholder="Şifre..."
              autoFocus
              style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'var(--surface2)', border: `1px solid ${pwError ? 'var(--red)' : 'var(--border2)'}`, borderRadius: '8px', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none', marginBottom: '0.5rem' }}
            />
            {pwError && (
              <div style={{ color: 'var(--red)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{pwError}</div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>İptal</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmUpload} disabled={uploading}>
                {uploading ? '⏳ Yükleniyor...' : '📤 Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
