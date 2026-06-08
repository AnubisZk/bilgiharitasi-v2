import { useState } from 'react'
import { api } from '../lib/api'
import AutoViz, {
  BHMSpring, Pendulum, WaveSuperposition, FourierSeries,
  AtomModel, DNAHelix, FunctionPlotter, VectorField, Kinematics, OhmCircuit
} from './VizTemplates'

const TIP_ICON = { '3d_model': '🔷', animasyon: '🎬', formul: '∑', grafik: '📈', kaynak: '📚' }

export default function ConceptPanel({ concepts, docId, provider }) {
  const [selected, setSelected] = useState(null)
  const [vizSpec, setVizSpec] = useState(null)
  const [loadingViz, setLoadingViz] = useState(false)
  const [filter, setFilter] = useState('hepsi')
  const [useTemplate, setUseTemplate] = useState(true)

  async function loadViz(c) {
    setSelected(c)
    setVizSpec(null)
    if (!useTemplate) {
      setLoadingViz(true)
      try {
        const spec = await api.getVizSpec(docId, c.kavram, c.tip, c.aciklama, provider)
        setVizSpec(spec)
      } catch { setVizSpec({ kod: '', aciklama: 'Görselleştirme yüklenemedi.' }) }
      finally { setLoadingViz(false) }
    }
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
      {/* Sol panel */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border)', overflow: 'auto', padding: '1rem', background: 'var(--surface)', flexShrink: 0 }}>
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

      {/* Sağ panel */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)' }}>{selected.kavram}</h2>
                <span className={`tag tag-${selected.tip}`}>{TIP_ICON[selected.tip]} {selected.tip}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setUseTemplate(true)}
                    style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', border: `1px solid ${useTemplate ? 'var(--accent)' : 'var(--border2)'}`, background: useTemplate ? 'var(--accent-light)' : 'transparent', color: useTemplate ? 'var(--accent)' : 'var(--ink3)', cursor: 'pointer' }}>
                    🎨 Şablon
                  </button>
                  <button onClick={() => { setUseTemplate(false); loadViz(selected) }}
                    style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', border: `1px solid ${!useTemplate ? 'var(--accent)' : 'var(--border2)'}`, background: !useTemplate ? 'var(--accent-light)' : 'transparent', color: !useTemplate ? 'var(--accent)' : 'var(--ink3)', cursor: 'pointer' }}>
                    🤖 AI Üret
                  </button>
                </div>
              </div>
              <p style={{ color: 'var(--ink2)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selected.aciklama}</p>
              {selected.baglam && (
                <blockquote style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', borderLeft: '3px solid var(--accent)', background: 'var(--surface)', borderRadius: '0 8px 8px 0', color: 'var(--ink2)', fontSize: '0.85rem', fontStyle: 'italic', boxShadow: 'var(--shadow-sm)' }}>
                  "{selected.baglam}"
                </blockquote>
              )}
            </div>

            {useTemplate ? (
              <AutoViz kavram={selected.kavram} aciklama={selected.aciklama} />
            ) : loadingViz ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink3)', padding: '2rem' }}>
                <div className="loading-dots"><span /><span /><span /></div>
                AI görselleştirme oluşturuluyor...
              </div>
            ) : vizSpec?.kod ? (
              <div style={{ borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;background:#fff;font-family:system-ui;}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script></head><body>${vizSpec.kod}</body></html>`}
                  style={{ width: '100%', height: '400px', border: 'none' }}
                  sandbox="allow-scripts allow-same-origin"
                  title={selected.kavram}
                />
                {vizSpec.aciklama && <div style={{ padding: '0.9rem 1rem', color: 'var(--ink2)', fontSize: '0.85rem', borderTop: '1px solid var(--border)' }}>{vizSpec.aciklama}</div>}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
