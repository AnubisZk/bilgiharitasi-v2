import { useEffect, useRef, useState } from 'react'

const COLORS = { temel: '#3d5af1', destekleyici: '#0f7a5a', uygulama: '#b45309' }
const LIGHT = { temel: '#eef0fe', destekleyici: '#ecfdf5', uygulama: '#fffbeb' }

export default function KnowledgeGraph({ kg }) {
  const canvasRef = useRef()
  const [selected, setSelected] = useState(null)
  const animRef = useRef()

  useEffect(() => {
    if (!kg?.dugumler?.length) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W; canvas.height = H

    const nodes = kg.dugumler.map((d, i) => {
      const angle = (i / kg.dugumler.length) * Math.PI * 2
      const r = Math.min(W, H) * 0.28
      return { ...d, x: W/2 + Math.cos(angle)*r + (Math.random()-0.5)*50, y: H/2 + Math.sin(angle)*r + (Math.random()-0.5)*50, vx: 0, vy: 0, radius: 26 + Math.random()*12 }
    })

    let dragging = null
    const rect = () => canvas.getBoundingClientRect()
    canvas.onmousedown = e => { const r = rect(); const n = nodes.find(n => Math.hypot(n.x-(e.clientX-r.left), n.y-(e.clientY-r.top)) < n.radius+4); if(n){dragging=n; setSelected(n)} }
    canvas.onmousemove = e => { if(!dragging) return; const r = rect(); dragging.x=e.clientX-r.left; dragging.y=e.clientY-r.top; dragging.vx=dragging.vy=0 }
    canvas.onmouseup = () => { dragging = null }

    function sim() {
      for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++) {
        const dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y, d=Math.hypot(dx,dy)||1, f=3500/(d*d)
        nodes[i].vx-=dx/d*f; nodes[i].vy-=dy/d*f; nodes[j].vx+=dx/d*f; nodes[j].vy+=dy/d*f
      }
      for(const e of (kg.kenarlar||[])) {
        const a=nodes.find(n=>n.id===e.kaynak), b=nodes.find(n=>n.id===e.hedef); if(!a||!b) continue
        const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1, f=(d-130)*0.01
        a.vx+=dx/d*f; a.vy+=dy/d*f; b.vx-=dx/d*f; b.vy-=dy/d*f
      }
      for(const n of nodes) { n.vx+=(W/2-n.x)*0.002; n.vy+=(H/2-n.y)*0.002 }
      for(const n of nodes) {
        if(n===dragging) continue
        n.vx*=0.85; n.vy*=0.85; n.x+=n.vx; n.y+=n.vy
        n.x=Math.max(n.radius,Math.min(W-n.radius,n.x)); n.y=Math.max(n.radius,Math.min(H-n.radius,n.y))
      }
    }

    function draw() {
      ctx.clearRect(0,0,W,H)
      // edges
      for(const e of (kg.kenarlar||[])) {
        const a=nodes.find(n=>n.id===e.kaynak), b=nodes.find(n=>n.id===e.hedef); if(!a||!b) continue
        const d=Math.hypot(b.x-a.x,b.y-a.y); if(d>350) continue
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
        ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=1.5; ctx.stroke()
        ctx.fillStyle='#a09990'; ctx.font='9px JetBrains Mono,monospace'; ctx.textAlign='center'
        ctx.fillText(e.iliski||'',(a.x+b.x)/2,(a.y+b.y)/2)
      }
      // nodes
      for(const n of nodes) {
        const color=COLORS[n.tip]||'#3d5af1', light=LIGHT[n.tip]||'#eef0fe'
        const isSel=selected?.id===n.id
        // shadow
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius+4,0,Math.PI*2)
        ctx.fillStyle=isSel ? color+'22' : 'rgba(0,0,0,0.05)'; ctx.fill()
        // fill
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius,0,Math.PI*2)
        ctx.fillStyle=light; ctx.fill()
        ctx.strokeStyle=color; ctx.lineWidth=isSel?2:1.5; ctx.stroke()
        // text
        ctx.fillStyle=color; ctx.font=`${isSel?'600 ':'500 '}${Math.min(11,9+n.radius/10)}px Inter,system-ui`
        ctx.textAlign='center'; ctx.textBaseline='middle'
        const words=n.ad.split(' ')
        if(words.length===1||ctx.measureText(n.ad).width<n.radius*1.7) { ctx.fillText(n.ad,n.x,n.y) }
        else { ctx.fillText(words[0],n.x,n.y-6); ctx.fillText(words.slice(1).join(' '),n.x,n.y+7) }
      }
      sim(); animRef.current=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animRef.current); canvas.onmousedown=canvas.onmousemove=canvas.onmouseup=null }
  }, [kg])

  if (!kg) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕸️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--ink2)' }}>Bilgi grafiği henüz oluşturulmadı</div>
        <div style={{ fontSize: '0.85rem' }}>"Analiz Et" butonuna tıkla</div>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}>
      <canvas ref={canvasRef} style={{ flex: 1, cursor: 'grab' }} />
      {selected && (
        <div style={{ width: '240px', borderLeft: '1px solid var(--border)', padding: '1.25rem', overflow: 'auto', background: 'var(--surface)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--ink)' }}>{selected.ad}</div>
            <span style={{ display:'inline-block', padding:'0.15rem 0.6rem', borderRadius:'100px', fontSize:'0.72rem', fontFamily:'var(--font-mono)', background: LIGHT[selected.tip]||'#eef0fe', color: COLORS[selected.tip]||'#3d5af1', border:`1px solid ${COLORS[selected.tip]||'#3d5af1'}44` }}>{selected.tip}</span>
          </div>
          <p style={{ color:'var(--ink2)', fontSize:'0.85rem', lineHeight:1.6 }}>{selected.aciklama}</p>
          {kg.genel_not && (
            <div style={{ marginTop:'1.25rem', padding:'0.75rem', background:'var(--surface2)', borderRadius:'8px', fontSize:'0.78rem', color:'var(--ink3)', border:'1px solid var(--border)' }}>
              <div style={{ fontWeight:500, marginBottom:'0.3rem', color:'var(--ink2)' }}>Genel Değerlendirme</div>
              {kg.genel_not}
            </div>
          )}
          <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ marginTop:'1rem', width:'100%', fontSize:'0.8rem' }}>Kapat</button>
        </div>
      )}
    </div>
  )
}
