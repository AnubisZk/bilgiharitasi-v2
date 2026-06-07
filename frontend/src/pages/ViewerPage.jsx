import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import ConceptPanel from '../components/ConceptPanel'
import KnowledgeGraph from '../components/KnowledgeGraph'
import { QuizPanel, FlashcardPanel, ChatPanel, FeynmanPanel, ExportMenu } from '../components/index.jsx'

const TABS = [
  { id: 'kavramlar', label: '🏷️ Kavramlar' },
  { id: 'grafik', label: '🕸️ Bilgi Grafiği' },
  { id: 'quiz', label: '✅ Quiz' },
  { id: 'kartlar', label: '🎴 Kartlar' },
  { id: 'sohbet', label: '💬 Sohbet' },
  { id: 'feynman', label: '💡 Feynman' },
]

export default function ViewerPage() {
  const { docId } = useParams()
  const nav = useNavigate()
  const [doc, setDoc] = useState(null)
  const [tab, setTab] = useState('kavramlar')
  const [provider, setProvider] = useState('claude')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [concepts, setConcepts] = useState([])
  const [kg, setKg] = useState(null)

  useEffect(() => { loadDoc() }, [docId])

  async function loadDoc() {
    setLoading(true)
    const data = await api.getDocument(docId)
    setDoc(data)
    if (data.concepts_json) try { setConcepts(JSON.parse(data.concepts_json)) } catch {}
    if (data.kg_json) try { setKg(JSON.parse(data.kg_json)) } catch {}
    setLoading(false)
  }

  async function runAnalysis() {
    setAnalyzing(true)
    try {
      const cResult = await api.detectConcepts(docId, provider)
      if (cResult.kavramlar) setConcepts(cResult.kavramlar)
      const kgResult = await api.buildKG(docId, provider)
      if (kgResult.dugumler) setKg(kgResult)
    } catch (err) { alert('Analiz hatası: ' + err.message) }
    finally { setAnalyzing(false) }
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', flexShrink: 0,
      }}>
        <button onClick={() => nav('/kutuphane')} className="btn btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
          ← Kütüphane
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem', color: 'var(--ink)' }}>
            {doc?.filename}
          </div>
          <div style={{ color: 'var(--ink3)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            {doc?.page_count} sayfa · {concepts.length} kavram
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['claude', 'gemini'].map(p => (
            <button key={p} onClick={() => setProvider(p)}
              className={`provider-badge ${provider === p ? `active-${p}` : ''}`}>
              {p === 'claude' ? '🟠 Claude' : '🔵 Gemini'}
            </button>
          ))}
        </div>

        {!analyzing ? (
          <button className="btn btn-primary" style={{ fontSize: '0.82rem' }} onClick={runAnalysis}>
            {concepts.length > 0 ? '🔄 Yeniden Analiz' : '✨ Analiz Et'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', fontSize: '0.82rem' }}>
            <div className="loading-dots" style={{ transform: 'scale(0.65)' }}><span /><span /><span /></div>
            Analiz ediliyor...
          </div>
        )}

        <ExportMenu docId={docId} />
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0, overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '0.65rem 1.1rem', border: 'none', background: 'transparent',
            color: tab === t.id ? 'var(--accent)' : 'var(--ink2)',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem',
            fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'kavramlar' && <ConceptPanel concepts={concepts} docId={docId} provider={provider} />}
        {tab === 'grafik' && <KnowledgeGraph kg={kg} />}
        {tab === 'quiz' && <QuizPanel docId={docId} provider={provider} />}
        {tab === 'kartlar' && <FlashcardPanel docId={docId} provider={provider} />}
        {tab === 'sohbet' && <ChatPanel docId={docId} provider={provider} />}
        {tab === 'feynman' && <FeynmanPanel docId={docId} provider={provider} concepts={concepts} />}
      </div>
    </div>
  )
}
