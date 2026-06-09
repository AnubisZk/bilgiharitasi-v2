import { useState } from 'react'
import { api } from '../lib/api'
import AutoViz from './VizTemplates'

const TIP_ICON = { '3d_model': '🔷', animasyon: '🎬', formul: '∑', grafik: '📈', kaynak: '📚' }
const STYLES = ['educational', 'realistic', 'diagram', 'artistic']
const STYLE_LABELS = { educational: '📚 Eğitimsel', realistic: '📷 Gerçekçi', diagram: '📐 Diyagram', artistic: '🎨 Sanatsal' }
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ConceptPanel({ concepts, docId, provider }) {
  const [selected, setSelected] = useState(null)
  const [vizMode, setVizMode] = useState('template') // 'template' | 'imagen' | 'ai'
  const [imgStyle, setImgStyle] = useState('educational')
  const [generatedImg, setGeneratedImg] = useState(null)
  const [loadingImg, setLoadingImg] = useState(false)
  const [vizSpec, setVizSpec] = useState(null)
  const [loadingViz, setLoadingViz] = useState(false)
  const [filter, setFilter] = useState('hepsi')

  async function selectConcept(c) {
    setSelected(c)
    setGeneratedImg(null)
    setVizSpec(null)
  }

  async function generateImage() {
    if (!selected) return
    setLoadingImg(true)
    setGeneratedImg(null)
    try {
      const res = await fetch(`${API_URL}/imagen/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kavram: selected.kavram, aciklama: selected.aciklama, style: imgStyle })
      })
      const data = await res.json()
      if (data.image_b64) setGeneratedImg(data.image_b64)
      else alert(data.detail || 'Görsel üretilemedi')
    } catch (err) {
      alert('Bağlantı hatası: ' + err.message)
    } finally {
      setLoadingImg(false)
    }
  }

  async function loadAiViz() {
    if (!selected) return
    setLoadingViz(true)
    setVizSpec(null)
    try {
      const spec = await api.getVizSpec(docId, selected.kavram, selected.tip, selected.aciklama, provider)
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
      {/* Sol panel - kavram listesi */}
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
            <div key={i} onClick={() => selectConcept(c)} style={{
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

      {/* Sağ panel - görselleştirme */}
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
            {/* Başlık */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)' }}>{selected.kavram}</h2>
                <span className={`tag tag-${selected.tip}`}>{TIP_ICON[selected.tip]} {selected.tip}</span>
              </div>
              <p style={{ color: 'var(--ink2)', lineHeight: 1.6, fontSize: '0.95rem' }}>{selected.aciklama}</p>
              {selected.baglam && (
                <blockquote style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', borderLeft: '3px solid var(--accent)', background: 'var(--surface)', borderRadius: '0 8px 8px 0', color: 'var(--ink2)', fontSize: '0.85rem', fontStyle: 'italic', boxShadow: 'var(--shadow-sm)' }}>
                  "{selected.baglam}"
                </blockquote>
              )}
            </div>

            {/* Mod seçici */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { id: 'template', label: '🎨 Şablon', desc: 'Hazır animasyon' },
                { id: 'imagen', label: '🖼️ Imagen 4', desc: 'AI görsel üret' },
                { id: 'ai', label: '🤖 AI Kod', desc: 'Claude/Gemini kodu' },
              ].map(m => (
                <button key={m.id} onClick={() => setVizMode(m.id)} style={{
                  padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  border: `1px solid ${vizMode === m.id ? 'var(--accent)' : 'var(--border2)'}`,
                  background: vizMode === m.id ? 'var(--accent-light)' : 'var(--surface)',
                  color: vizMode === m.id ? 'var(--accent)' : 'var(--ink2)',
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                }}>
                  <span>{m.label}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{m.desc}</span>
                </button>
              ))}
            </div>

            {/* Şablon modu */}
            {vizMode === 'template' && (
              <AutoViz kavram={selected.kavram} aciklama={selected.aciklama} />
            )}

            {/* Imagen 4 modu */}
            {vizMode === 'imagen' && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {STYLES.map(s => (
                      <button key={s} onClick={() => setImgStyle(s)} style={{
                        padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem',
                        border: `1px solid ${imgStyle === s ? 'var(--accent)' : 'var(--border2)'}`,
                        background: imgStyle === s ? 'var(--accent-light)' : 'transparent',
                        color: imgStyle === s ? 'var(--accent)' : 'var(--ink3)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}>{STYLE_LABELS[s]}</button>
                    ))}
                  </div>
                  <button onClick={generateImage} disabled={loadingImg}
                    className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                    {loadingImg ? '⏳ Üretiliyor...' : '✨ Görsel Üret'}
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink3)', fontFamily: 'var(--font-mono)' }}>~$0.03 / görsel</span>
                </div>

                {loadingImg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink3)', padding: '2rem', justifyContent: 'center' }}>
                    <div className="loading-dots"><span /><span /><span /></div>
                    Imagen 4 görsel oluşturuyor...
                  </div>
                )}

                {generatedImg && (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🖼️ Imagen 4 — {selected.kavram} ({STYLE_LABELS[imgStyle]})</span>
                      <a href={`data:image/png;base64,${generatedImg}`} download={`${selected.kavram}.png`}
                        style={{ color: 'var(--accent)', fontSize: '0.72rem', textDecoration: 'none' }}>
                        ↓ İndir
                      </a>
                    </div>
                    <img src={`data:image/png;base64,${generatedImg}`} alt={selected.kavram}
                      style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain', background: '#fff' }} />
                    <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ink3)' }}>
                      Google Imagen 4 tarafından oluşturuldu. SynthID dijital filigranı içerir.
                    </div>
                  </div>
                )}

                {!generatedImg && !loadingImg && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink3)', border: '2px dashed var(--border)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
                    <div style={{ fontSize: '0.9rem' }}>Stil seç ve "Görsel Üret" butonuna tıkla</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--ink3)' }}>Imagen 4 ile {selected.kavram} görseli oluşturulacak</div>
                  </div>
                )}
              </div>
            )}

            {/* AI Kod modu */}
            {vizMode === 'ai' && (
              <div>
                {!vizSpec && !loadingViz && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <button onClick={loadAiViz} className="btn btn-primary">
                      🤖 {provider === 'claude' ? 'Claude' : 'Gemini'} ile Kod Üret
                    </button>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--ink3)' }}>
                      AI HTML/JS animasyon kodu üretir
                    </div>
                  </div>
                )}
                {loadingViz && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ink3)', padding: '2rem', justifyContent: 'center' }}>
                    <div className="loading-dots"><span /><span /><span /></div>
                    AI kod oluşturuyor...
                  </div>
                )}
                {vizSpec?.kod && (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink3)', background: 'var(--surface2)' }}>
                      🤖 {provider === 'claude' ? 'Claude' : 'Gemini'} — {selected.kavram}
                    </div>
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;background:#fff;font-family:system-ui;}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script></head><body>${vizSpec.kod}</body></html>`}
                      style={{ width: '100%', height: '400px', border: 'none' }}
                      sandbox="allow-scripts allow-same-origin"
                      title={selected.kavram}
                    />
                    {vizSpec.aciklama && <div style={{ padding: '0.9rem 1rem', color: 'var(--ink2)', fontSize: '0.85rem', borderTop: '1px solid var(--border)' }}>{vizSpec.aciklama}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
