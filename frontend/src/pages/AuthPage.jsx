import { useState } from 'react'
import { supabase } from '../lib/api'

export default function AuthPage() {
  const [mod, setMod] = useState('giris')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mesaj, setMesaj] = useState('')

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMesaj('')
    try {
      if (mod === 'giris') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMesaj('Kayıt başarılı! E-postanı doğrula.')
      }
    } catch (err) { setMesaj(err.message) }
    finally { setLoading(false) }
  }

  const inp = {
    width: '100%', padding: '0.6rem 0.9rem',
    background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: '8px', color: 'var(--ink)', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            BilgiHaritası
          </h1>
          <p style={{ color: 'var(--ink2)', fontSize: '0.9rem' }}>PDF'ini yükle. Kavramlarını keşfet.</p>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '8px', padding: '3px', marginBottom: '1.5rem' }}>
            {['giris','kayit'].map(m => (
              <button key={m} onClick={() => setMod(m)} style={{
                flex: 1, padding: '0.45rem', borderRadius: '6px', border: 'none',
                background: mod === m ? 'white' : 'transparent',
                color: mod === m ? 'var(--accent)' : 'var(--ink2)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                fontFamily: 'var(--font-body)',
                boxShadow: mod === m ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}>
                {m === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--ink2)', marginBottom: '0.35rem', fontWeight: 500 }}>E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--ink2)', marginBottom: '0.35rem', fontWeight: 500 }}>Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
            </div>
            {mesaj && (
              <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px',
                background: mesaj.includes('başarılı') ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${mesaj.includes('başarılı') ? '#a7f3d0' : '#fecaca'}`,
                color: mesaj.includes('başarılı') ? 'var(--green)' : 'var(--red)',
                fontSize: '0.85rem' }}>
                {mesaj}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
              {loading ? 'Bekleniyor...' : mod === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--ink3)', fontSize: '0.78rem' }}>
          Claude ve Gemini ile güçlendirilmiş Türkçe öğrenme platformu
        </p>
      </div>
    </div>
  )
}
