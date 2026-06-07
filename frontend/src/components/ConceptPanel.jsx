import { useState } from 'react'
import { api } from '../lib/api'

const TIP_ICON = { '3d_model': '🔷', animasyon: '🎬', formul: '∑', grafik: '📈', kaynak: '📚' }

export default function ConceptPanel({ concepts, docId, provider }) {
  const [selected, setSelected] = useState(null)
  const [vizSpec, setVizSpec] = useState(null)
  const [loadingViz, setLoadingViz] = useState(false)
  const [filter, setFilter] = useState('hepsi')

  async function loadViz(c) {
    setSelected(c); setVizSpec(null); setLoadingViz(true)
    try {
      const spec = await api.getVizSpec(docId, c.kavram, c.tip, c.aciklama, provider)
      setVizSpec(spec)
    } catch { setVizSpec({ kod: '', aciklama: 'Görselleştirme yüklenemedi.' }) }
    finally { setLoadingViz(false) }
  }

  const filtered = filter === 'hepsi' ? concepts : concepts.filter(c => c.tip === filter)
  const tips = ['hepsi', ...new Set(concepts.map(c => c.tip))]

  if (concepts.length === 0) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--ink2)' }}>Henüz analiz yapılmadı</div>
        <div style={{ fontSize: '0.85rem' }}>"Analiz Et" butonuna tıkla</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Concept list */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border)', overflow: 'auto', padding: '1rem', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
          {tips.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '0.18rem 0.65rem', borderRadius: '100px',
              border: `1px solid ${filter === t ? 'var(--accent)' : 'var(--border2)'}`,
              background: filter === t ? 'var(--accent-light)' : 'transparent',
              color: filter === t ? 'var(--accent)' : 'var(--ink3)',
              fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}>
              {t === 'hepsi' ? `Hepsi (${concepts.length})` : `${TIP_ICON[t] || ''} ${t}`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {filtered.map((c, i) => (
            <div key={i} onClick={() => loadViz(c)} style={{
              padding: '0.75rem 0.9rem', borderRadius: '8px',
              background: selected?.kavram === c.kavram ? 'var(--accent-light)' : 'var(--bg)',
              border: `1px solid ${selected?.kavram === c.kavram ? 'var(--accent)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--ink)' }}>{c.kavram}</span>
                <span className={`tag tag-${c.tip}`}>{TIP_ICON[c.tip]} {c.tip}</span>
              </div>
              <div style={{ color: 'var(--ink3)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                {c.aciklama?.slice(0, 75)}{c.aciklama?.length > 75 ? '...' : ''}
              </div>
              {c.sayfa && (
                <div style={{ color: 'var(--ink3)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginTop: '0.3rem' }}>
                  Sayfa {c.sayfa} · {c.zorluk}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Viz panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', background: 'var(--bg)' }}>
        {!selected ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👈</div>
              <div style={{ fontSize: '0.9rem' }}>Bir kavrama tıklayarak görselleştirmesini yükle</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)' }}>{selected.kavram}</h2>
                <span className={`tag tag-${selected.tip}`}>{TIP_ICON[selected.tip]} {selected.tip}</span>
              </div>
              <p style={{ color: 'var(--ink2)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selected.aciklama}</p>
              {selected.baglam && (
                <blockquote style={{
                  marginTop: '0.75rem', padding: '0.7rem 1rem',
                  borderLeft: '3px solid var(--accent)', background: 'var(--surface)',
                  borderRadius: '0 8px 8px 0', color: 'var(--ink2)',
                  fontSize: '0.85rem', fontStyle: 'italic',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  "{selected.baglam}"
                </blockquote>
              )}
            </div>

            {loadingViz ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink3)', padding: '2rem' }}>
                <div className="loading-dots"><span /><span /><span /></div>
                Görselleştirme oluşturuluyor...
              </div>
            ) : vizSpec ? (
              <VizRenderer spec={vizSpec} kavram={selected.kavram} tip={selected.tip} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function VizRenderer({ spec, kavram, tip }) {
  if (!spec) return null

  if (tip === 'formul' && spec.kod) return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '1rem', overflowX: 'auto' }}>
        {spec.kod}
      </div>
      <p style={{ color: 'var(--ink2)', fontSize: '0.9rem' }}>{spec.aciklama}</p>
    </div>
  )

  if ((tip === 'animasyon' || tip === '3d_model') && spec.kod) return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink3)', background: 'var(--surface2)' }}>
        {tip === '3d_model' ? '⬛ Three.js' : '🎬 Animasyon'} — {kavram}
      </div>
      <iframe
        srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;background:#fff;color:#1a1814;font-family:system-ui}</style></head><body>${spec.kod}</body></html>`}
        style={{ width: '100%', height: '380px', border: 'none' }}
        sandbox="allow-scripts" title={kavram}
      />
      {spec.aciklama && <p style={{ padding: '0.9rem 1rem', color: 'var(--ink2)', fontSize: '0.85rem', borderTop: '1px solid var(--border)' }}>{spec.aciklama}</p>}
    </div>
  )

  return (
    <div className="card">
      <p style={{ color: 'var(--ink2)', lineHeight: 1.6 }}>{spec.aciklama || 'Görselleştirme yüklendi.'}</p>
    </div>
  )
}
