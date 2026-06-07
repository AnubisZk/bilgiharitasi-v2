import { useState } from 'react'
import { api, supabase } from '../lib/api'

const selectStyle = { padding:'0.5rem 0.8rem', background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:'8px', color:'var(--ink)', fontFamily:'var(--font-body)', fontSize:'0.875rem', outline:'none' }
const inputStyle = { width:'100%', padding:'0.6rem 0.9rem', background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:'8px', color:'var(--ink)', fontFamily:'var(--font-body)', fontSize:'0.9rem', outline:'none' }
const labelStyle = { display:'block', fontSize:'0.8rem', color:'var(--ink2)', marginBottom:'0.35rem', fontWeight:500 }

// ─── QuizPanel ───
export function QuizPanel({ docId, provider }) {
  const [sorular, setSorular] = useState([])
  const [cevaplar, setCevaplar] = useState({})
  const [gosterilen, setGosterilen] = useState({})
  const [loading, setLoading] = useState(false)
  const [sayi, setSayi] = useState(5)

  async function olustur() {
    setLoading(true); setSorular([]); setCevaplar({}); setGosterilen({})
    const res = await api.generateQuiz(docId, sayi, provider)
    setSorular(res.sorular || []); setLoading(false)
  }

  const dogru = Object.entries(cevaplar).filter(([i,c]) => sorular[i]?.dogru === c[0]).length

  return (
    <div style={{ height:'100%', overflow:'auto', padding:'1.5rem', maxWidth:'680px', margin:'0 auto' }}>
      <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.75rem', flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', flex:1, color:'var(--ink)' }}>✅ Quiz</h2>
        <select value={sayi} onChange={e => setSayi(+e.target.value)} style={selectStyle}>
          {[3,5,10,15].map(n => <option key={n} value={n}>{n} soru</option>)}
        </select>
        <button className="btn btn-primary" onClick={olustur} disabled={loading}>
          {loading ? 'Oluşturuluyor...' : 'Quiz Oluştur'}
        </button>
      </div>

      {sorular.length > 0 && (
        <div style={{ marginBottom:'1rem', padding:'0.6rem 0.9rem', background:'var(--surface2)', borderRadius:'8px', fontFamily:'var(--font-mono)', fontSize:'0.82rem', color:'var(--ink2)', border:'1px solid var(--border)' }}>
          Puan: {dogru} / {Object.keys(cevaplar).length} cevaplandı
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {sorular.map((s, i) => (
          <div key={i} className="card">
            <div style={{ fontWeight:500, marginBottom:'0.9rem', lineHeight:1.5, color:'var(--ink)' }}>
              <span style={{ color:'var(--ink3)', fontFamily:'var(--font-mono)', fontSize:'0.78rem', marginRight:'0.5rem' }}>{i+1}.</span>
              {s.soru}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {s.secenekler?.map((sec, j) => {
                const harf = sec[0], secildi = cevaplar[i]?.[0] === harf, goster = gosterilen[i], dogruCevap = s.dogru === harf
                let bg='var(--surface2)', border='var(--border)', color='var(--ink)'
                if(secildi && !goster) { bg='var(--accent-light)'; border='var(--accent)'; color='var(--accent)' }
                if(goster && dogruCevap) { bg='#ecfdf5'; border='#a7f3d0'; color='var(--green)' }
                if(goster && secildi && !dogruCevap) { bg='#fef2f2'; border='#fecaca'; color='var(--red)' }
                return (
                  <button key={j} onClick={() => { if(!goster) setCevaplar(p=>({...p,[i]:sec})) }}
                    style={{ textAlign:'left', padding:'0.6rem 0.9rem', borderRadius:'8px', border:`1px solid ${border}`, background:bg, color, cursor:goster?'default':'pointer', transition:'all 0.15s', fontFamily:'var(--font-body)', fontSize:'0.88rem' }}>
                    {sec}
                  </button>
                )
              })}
            </div>
            {cevaplar[i] && !gosterilen[i] && (
              <button className="btn btn-ghost" style={{ marginTop:'0.65rem', fontSize:'0.8rem' }}
                onClick={() => setGosterilen(p=>({...p,[i]:true}))}>Cevabı Göster</button>
            )}
            {gosterilen[i] && s.aciklama && (
              <div style={{ marginTop:'0.65rem', padding:'0.7rem', background:'#fffbeb', borderRadius:'8px', fontSize:'0.84rem', color:'var(--gold)', border:'1px solid #fcd34d' }}>
                💡 {s.aciklama}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FlashcardPanel ───
export function FlashcardPanel({ docId, provider }) {
  const [kartlar, setKartlar] = useState([])
  const [index, setIndex] = useState(0)
  const [cevrildi, setCevrildi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sayi, setSayi] = useState(10)

  async function olustur() {
    setLoading(true); setKartlar([]); setIndex(0); setCevrildi(false)
    const res = await api.generateFlashcards(docId, sayi, provider)
    setKartlar(res.kartlar || []); setLoading(false)
  }

  const kart = kartlar[index]
  const ilerleme = kartlar.length > 0 ? Math.round((index+1)/kartlar.length*100) : 0

  function sonraki() { if(index < kartlar.length-1){setIndex(i=>i+1); setCevrildi(false)} }

  return (
    <div style={{ height:'100%', overflow:'auto', padding:'1.5rem', maxWidth:'560px', margin:'0 auto' }}>
      <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.75rem', flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', flex:1, color:'var(--ink)' }}>🎴 Flashcard</h2>
        <select value={sayi} onChange={e => setSayi(+e.target.value)} style={selectStyle}>
          {[5,10,15,20].map(n => <option key={n} value={n}>{n} kart</option>)}
        </select>
        <button className="btn btn-primary" onClick={olustur} disabled={loading}>
          {loading ? 'Oluşturuluyor...' : 'Kart Oluştur'}
        </button>
      </div>

      {kartlar.length > 0 && (
        <>
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem', fontSize:'0.78rem', color:'var(--ink3)', fontFamily:'var(--font-mono)' }}>
              <span>{index+1} / {kartlar.length}</span><span>%{ilerleme}</span>
            </div>
            <div style={{ height:'3px', background:'var(--surface3)', borderRadius:'100px' }}>
              <div style={{ width:`${ilerleme}%`, height:'100%', background:'var(--accent)', borderRadius:'100px', transition:'width 0.3s' }} />
            </div>
          </div>

          {kart && (
            <div onClick={() => setCevrildi(!cevrildi)} style={{
              minHeight:'200px', padding:'2rem',
              background: cevrildi ? 'var(--accent-light)' : 'var(--surface)',
              border:`1px solid ${cevrildi ? 'var(--accent)' : 'var(--border2)'}`,
              borderRadius:'14px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              textAlign:'center', transition:'all 0.2s', userSelect:'none',
              boxShadow:'var(--shadow)',
            }}>
              <div>
                <div style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ink3)', marginBottom:'0.9rem' }}>
                  {cevrildi ? 'ARKA YÜZ (cevap)' : 'ÖN YÜZ — tıkla'}
                </div>
                <div style={{ fontFamily: cevrildi ? 'var(--font-body)' : 'var(--font-display)', fontSize:'1.2rem', lineHeight:1.5, color:'var(--ink)' }}>
                  {cevrildi ? kart.arka : kart.on}
                </div>
              </div>
            </div>
          )}

          {cevrildi && (
            <div style={{ display:'flex', gap:'0.6rem', marginTop:'1rem', justifyContent:'center' }}>
              {[['Tekrar','#c0392b','😰'],['Zor','#b45309','😓'],['İyi','#1a6fb5','🙂'],['Kolay','#0f7a5a','😄']].map(([l,c,e]) => (
                <button key={l} onClick={sonraki} style={{
                  padding:'0.45rem 0.9rem', borderRadius:'8px',
                  border:`1px solid ${c}33`, background:`${c}10`,
                  color:c, cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)',
                }}>
                  {e} {l}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── ChatPanel ───
export function ChatPanel({ docId, provider }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send(e) {
    e.preventDefault(); if(!input.trim()||loading) return
    const q = input.trim(); setInput('')
    setMessages(m => [...m, {rol:'user', mesaj:q}])
    setLoading(true)
    const res = await api.chat(docId, q, provider)
    setMessages(m => [...m, {rol:'assistant', mesaj:res.yanit||'Yanıt alınamadı.'}])
    setLoading(false)
  }

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', maxWidth:'680px', margin:'0 auto', width:'100%' }}>
      <div style={{ padding:'0.9rem 1.5rem', borderBottom:'1px solid var(--border)', background:'var(--surface)' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--ink)' }}>💬 Dökümanla Sohbet</h2>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.85rem', background:'var(--bg)' }}>
        {messages.length === 0 && (
          <div style={{ color:'var(--ink3)', fontSize:'0.88rem', textAlign:'center', marginTop:'2rem' }}>
            Döküman hakkında Türkçe soru sorabilirsin
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.rol==='user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth:'78%', padding:'0.7rem 1rem',
              borderRadius: m.rol==='user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: m.rol==='user' ? 'var(--accent)' : 'var(--surface)',
              color: m.rol==='user' ? 'white' : 'var(--ink)',
              fontSize:'0.9rem', lineHeight:1.6,
              border: m.rol==='user' ? 'none' : '1px solid var(--border)',
              boxShadow:'var(--shadow-sm)',
            }}>
              {m.mesaj}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex' }}>
            <div style={{ padding:'0.7rem 1rem', background:'var(--surface)', borderRadius:'12px 12px 12px 4px', border:'1px solid var(--border)' }}>
              <div className="loading-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={send} style={{ padding:'0.9rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.65rem', background:'var(--surface)' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Soru sor..."
          style={{ flex:1, padding:'0.6rem 0.9rem', background:'var(--bg)', border:'1px solid var(--border2)', borderRadius:'8px', color:'var(--ink)', fontFamily:'var(--font-body)', fontSize:'0.9rem', outline:'none' }} />
        <button type="submit" className="btn btn-primary" disabled={loading}>Gönder</button>
      </form>
    </div>
  )
}

// ─── FeynmanPanel ───
export function FeynmanPanel({ docId, provider, concepts }) {
  const [kavram, setKavram] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [yanit, setYanit] = useState('')
  const [loading, setLoading] = useState(false)

  async function gonder(e) {
    e.preventDefault(); if(!kavram||!aciklama) return
    setLoading(true); setYanit('')
    const res = await api.feynman(docId, kavram, aciklama, provider)
    setYanit(res.yanit||''); setLoading(false)
  }

  return (
    <div style={{ height:'100%', overflow:'auto', padding:'1.5rem', maxWidth:'620px', margin:'0 auto' }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', marginBottom:'0.4rem', color:'var(--ink)' }}>💡 Feynman Tekniği</h2>
      <p style={{ color:'var(--ink2)', fontSize:'0.88rem', marginBottom:'1.75rem', lineHeight:1.5 }}>
        AI meraklı bir 10 yaşında çocuk gibi davranır. Sen kavramı ona anlat.
      </p>
      <form onSubmit={gonder} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
        <div>
          <label style={labelStyle}>Kavram</label>
          <select value={kavram} onChange={e => setKavram(e.target.value)} style={{ ...selectStyle, width:'100%' }}>
            <option value="">Kavram seç...</option>
            {concepts.map((c,i) => <option key={i} value={c.kavram}>{c.kavram}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Kavramı kendi cümlelerinle açıkla</label>
          <textarea value={aciklama} onChange={e => setAciklama(e.target.value)} rows={5}
            placeholder="Bunu kendi kelimelerinle anlatmaya çalış..."
            style={{ ...inputStyle, resize:'vertical' }} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'AI yanıtlıyor...' : 'Anlat →'}
        </button>
      </form>
      {yanit && (
        <div style={{ marginTop:'1.5rem', padding:'1.1rem 1.25rem', background:'var(--accent-light)', border:'1px solid #c7cdfa', borderRadius:'12px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--accent)', marginBottom:'0.65rem' }}>🧒 AI (meraklı çocuk)</div>
          <div style={{ color:'var(--ink)', lineHeight:1.7, whiteSpace:'pre-wrap', fontSize:'0.92rem' }}>{yanit}</div>
        </div>
      )}
    </div>
  )
}

// ─── ExportMenu ───
export function ExportMenu({ docId }) {
  const [open, setOpen] = useState(false)

  async function indir(format) {
    setOpen(false)
    const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }))
    const url = `${import.meta.env.VITE_API_URL||'http://localhost:8000'}/export/${docId}/${format}`
    const headers = session ? { Authorization:`Bearer ${session.access_token}` } : {}
    const res = await fetch(url, { headers })
    const blob = await res.blob()
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `bilgiharitasi_${docId.slice(0,8)}.${format==='pdf-report'?'pdf':format}`; a.click()
  }

  return (
    <div style={{ position:'relative' }}>
      <button className="btn btn-ghost" onClick={() => setOpen(!open)} style={{ fontSize:'0.82rem' }}>↓ İndir</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, zIndex:99 }} />
          <div style={{ position:'absolute', right:0, top:'110%', zIndex:100, background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:'10px', padding:'0.4rem', minWidth:'160px', boxShadow:'var(--shadow)' }}>
            {[['docx','📝 Word (.docx)'],['pdf-report','📄 PDF Rapor'],['pptx','📊 PowerPoint']].map(([f,l]) => (
              <button key={f} onClick={() => indir(f)} style={{ width:'100%', textAlign:'left', padding:'0.55rem 0.85rem', borderRadius:'6px', border:'none', background:'transparent', color:'var(--ink)', cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)', transition:'background 0.1s' }}
                onMouseEnter={e => e.target.style.background='var(--surface2)'}
                onMouseLeave={e => e.target.style.background='transparent'}>
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
