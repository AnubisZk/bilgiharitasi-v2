import { useEffect, useRef, useState, useCallback } from 'react'

// ─── SHARED STYLES ───────────────────────────────────────────────
const S = {
  wrap: { background: '#fff', borderRadius: '12px', border: '1px solid #e8e4dc', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" },
  topbar: { padding: '10px 16px', borderBottom: '1px solid #e8e4dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7f5f0' },
  title: { fontFamily: "'Lora', Georgia, serif", fontSize: '0.95rem', fontWeight: 500, color: '#1a1814' },
  badge: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#a09990', background: '#e8e4dc', padding: '2px 8px', borderRadius: '100px' },
  canvas: { display: 'block', background: '#fafaf8' },
  controls: { padding: '12px 16px', borderTop: '1px solid #e8e4dc', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: '#f7f5f0' },
  label: { fontSize: '0.75rem', color: '#6b6560', fontFamily: "'JetBrains Mono', monospace", marginBottom: '3px' },
  slider: { width: '120px', accentColor: '#3d5af1' },
  val: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#3d5af1', minWidth: '45px' },
  btn: { padding: '4px 12px', borderRadius: '6px', border: '1px solid #c7cdfa', background: '#eef0fe', color: '#3d5af1', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' },
  desc: { padding: '10px 16px', fontSize: '0.82rem', color: '#6b6560', lineHeight: 1.5, borderTop: '1px solid #e8e4dc' },
}

function Ctrl({ label, min, max, step = 0.01, value, onChange, unit = '' }) {
  return (
    <div>
      <div style={S.label}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)} style={S.slider} />
        <span style={S.val}>{value}{unit}</span>
      </div>
    </div>
  )
}

// ─── 1. BASİT HARMONİK HAREKET ───────────────────────────────────
export function BHMSpring({ kavram = 'Basit Harmonik Hareket', aciklama }) {
  const canvasRef = useRef()
  const [A, setA] = useState(80)
  const [omega, setOmega] = useState(2)
  const [phi, setPhi] = useState(0)
  const [running, setRunning] = useState(true)
  const tRef = useRef(0)
  const rafRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = 180, cy = H / 2

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current
      const x = A * Math.cos(omega * t + phi)

      // Yay çiz (sol duvar → kütle)
      const wallX = 30
      const massX = cx + x
      ctx.strokeStyle = '#a09990'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(wallX, cy)
      const segments = 20
      for (let i = 0; i <= segments; i++) {
        const px = wallX + (massX - 40 - wallX) * (i / segments)
        const py = cy + (i % 2 === 0 ? 0 : 1) * 12 * (i > 0 && i < segments ? 1 : 0)
        ctx.lineTo(px, py)
      }
      ctx.stroke()

      // Duvar
      ctx.fillStyle = '#d4cfc8'
      ctx.fillRect(0, cy - 60, wallX, 120)
      for (let i = -6; i <= 6; i++) {
        ctx.strokeStyle = '#b8b0a8'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(wallX, cy + i * 18)
        ctx.lineTo(wallX - 10, cy + i * 18 + 10)
        ctx.stroke()
      }

      // Kütle
      const r = 22
      ctx.shadowColor = 'rgba(61,90,241,0.2)'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(massX, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = '#3d5af1'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#2d49e0'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Denge çizgisi
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = '#c7cdfa'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx, 20)
      ctx.lineTo(cx, H - 20)
      ctx.stroke()
      ctx.setLineDash([])

      // Grafik — sağda x(t)
      const gx = 380, gy = H / 2, gw = W - gx - 20, gh = 80
      ctx.strokeStyle = '#e8e4dc'
      ctx.lineWidth = 1
      ctx.strokeRect(gx, gy - gh, gw, gh * 2)
      ctx.fillStyle = '#f7f5f0'
      ctx.fillRect(gx, gy - gh, gw, gh * 2)

      ctx.strokeStyle = '#3d5af1'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let i = 0; i <= gw; i++) {
        const tt = t - (gw - i) * 0.025
        const y = gy - A * Math.cos(omega * tt + phi) * (gh / (A + 5))
        i === 0 ? ctx.moveTo(gx + i, y) : ctx.lineTo(gx + i, y)
      }
      ctx.stroke()

      // Anlık nokta
      ctx.beginPath()
      ctx.arc(gx + gw, gy - x * (gh / (A + 5)), 4, 0, Math.PI * 2)
      ctx.fillStyle = '#3d5af1'
      ctx.fill()

      // Etiketler
      ctx.fillStyle = '#6b6560'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText('x(t)', gx + 4, gy - gh + 14)
      ctx.fillText('t', gx + gw - 12, gy + 14)

      // x değeri
      ctx.fillStyle = '#3d5af1'
      ctx.font = 'bold 12px JetBrains Mono, monospace'
      ctx.fillText(`x = ${x.toFixed(1)} px`, cx - 30, H - 12)

      if (running) {
        tRef.current += 0.016
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [A, omega, phi, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>x(t) = A·cos(ωt + φ)</span>
      </div>
      <canvas ref={canvasRef} width={600} height={200} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Genlik A" min={20} max={100} value={A} onChange={setA} unit=" px" />
        <Ctrl label="Açısal frekans ω" min={0.5} max={6} value={omega} onChange={setOmega} unit=" r/s" />
        <Ctrl label="Faz φ" min={0} max={6.28} value={phi} onChange={setPhi} unit=" r" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Durdur' : '▶ Başlat'}
        </button>
        <button style={S.btn} onClick={() => { tRef.current = 0 }}>↺ Sıfırla</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 2. SARKAÇ ───────────────────────────────────────────────────
export function Pendulum({ kavram = 'Sarkaç (Basit Harmonik Hareket)', aciklama }) {
  const canvasRef = useRef()
  const [L, setL] = useState(150)
  const [theta0, setTheta0] = useState(0.5)
  const [g, setG] = useState(9.8)
  const [running, setRunning] = useState(true)
  const tRef = useRef(0)
  const rafRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const pivot = { x: W / 2, y: 30 }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current
      const omega = Math.sqrt(g / L) // radyal frekans
      const T = 2 * Math.PI / omega
      const theta = theta0 * Math.cos(omega * t)
      const bx = pivot.x + L * Math.sin(theta)
      const by = pivot.y + L * Math.cos(theta)

      // İp
      ctx.strokeStyle = '#a09990'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(pivot.x, pivot.y)
      ctx.lineTo(bx, by)
      ctx.stroke()

      // Pivot
      ctx.beginPath()
      ctx.arc(pivot.x, pivot.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#d4cfc8'
      ctx.fill()
      ctx.strokeStyle = '#a09990'
      ctx.lineWidth = 1
      ctx.stroke()

      // Sarkaç kütlesi
      ctx.shadowColor = 'rgba(61,90,241,0.25)'
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.arc(bx, by, 18, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 18)
      grad.addColorStop(0, '#818cf8')
      grad.addColorStop(1, '#3d5af1')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.shadowBlur = 0

      // Yay yolu (hayalet)
      ctx.setLineDash([3, 5])
      ctx.strokeStyle = '#c7cdfa'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(pivot.x, pivot.y, L, Math.PI / 2 - theta0, Math.PI / 2 + theta0)
      ctx.stroke()
      ctx.setLineDash([])

      // Bilgi kutusu
      const info = [
        `T = ${T.toFixed(2)} s`,
        `θ = ${(theta * 180 / Math.PI).toFixed(1)}°`,
        `ω = ${omega.toFixed(2)} r/s`,
        `L = ${L} px`,
      ]
      ctx.fillStyle = 'rgba(247,245,240,0.9)'
      ctx.strokeStyle = '#e8e4dc'
      ctx.lineWidth = 1
      const bw = 120, bh = info.length * 18 + 12
      ctx.fillRect(W - bw - 10, 10, bw, bh)
      ctx.strokeRect(W - bw - 10, 10, bw, bh)
      ctx.fillStyle = '#3d5af1'
      ctx.font = '11px JetBrains Mono, monospace'
      info.forEach((line, i) => ctx.fillText(line, W - bw, 24 + i * 18))

      if (running) {
        tRef.current += 0.016
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [L, theta0, g, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>T = 2π√(L/g)</span>
      </div>
      <canvas ref={canvasRef} width={600} height={260} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Uzunluk L" min={60} max={200} step={1} value={L} onChange={setL} unit=" px" />
        <Ctrl label="Başl. açı θ₀" min={0.1} max={1.2} value={theta0} onChange={setTheta0} unit=" r" />
        <Ctrl label="Yerçekimi g" min={1} max={20} value={g} onChange={setG} unit=" m/s²" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Durdur' : '▶ Başlat'}
        </button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 3. DALGA SÜPERPOZİSYONU ─────────────────────────────────────
export function WaveSuperposition({ kavram = 'Dalga Süperpozisyonu', aciklama }) {
  const canvasRef = useRef()
  const [A1, setA1] = useState(40)
  const [f1, setF1] = useState(1)
  const [A2, setA2] = useState(30)
  const [f2, setF2] = useState(1.5)
  const [running, setRunning] = useState(true)
  const tRef = useRef(0)
  const rafRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function drawWave(color, A, f, t, yOffset, alpha = 1) {
      ctx.globalAlpha = alpha
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let x = 0; x <= W; x++) {
        const y = yOffset - A * Math.sin(2 * Math.PI * f * x / W * 3 - t * 2)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current
      const row = H / 3

      // Eksen çizgileri
      ;[row * 0.8, row * 1.8, row * 2.8].forEach(y => {
        ctx.strokeStyle = '#e8e4dc'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 5])
        ctx.beginPath()
        ctx.moveTo(0, y); ctx.lineTo(W, y)
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Dalga 1
      drawWave('#3d5af1', A1, f1, t, row * 0.8)
      // Dalga 2
      drawWave('#0f7a5a', A2, f2, t, row * 1.8)
      // Bileşke
      ctx.strokeStyle = '#b45309'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      for (let x = 0; x <= W; x++) {
        const y1 = A1 * Math.sin(2 * Math.PI * f1 * x / W * 3 - t * 2)
        const y2 = A2 * Math.sin(2 * Math.PI * f2 * x / W * 3 - t * 2)
        const y = row * 2.8 - (y1 + y2)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Etiketler
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillStyle = '#3d5af1'; ctx.fillText(`y₁ (A=${A1}, f=${f1})`, 8, row * 0.8 - A1 - 4)
      ctx.fillStyle = '#0f7a5a'; ctx.fillText(`y₂ (A=${A2}, f=${f2})`, 8, row * 1.8 - A2 - 4)
      ctx.fillStyle = '#b45309'; ctx.fillText(`y₁ + y₂ (bileşke)`, 8, row * 2.8 - (A1 + A2) - 4)

      if (running) {
        tRef.current += 0.016
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [A1, f1, A2, f2, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>y = y₁ + y₂</span>
      </div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Genlik A₁" min={10} max={70} step={1} value={A1} onChange={setA1} unit="" />
        <Ctrl label="Frekans f₁" min={0.5} max={4} value={f1} onChange={setF1} unit="" />
        <Ctrl label="Genlik A₂" min={10} max={70} step={1} value={A2} onChange={setA2} unit="" />
        <Ctrl label="Frekans f₂" min={0.5} max={4} value={f2} onChange={setF2} unit="" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Durdur' : '▶ Başlat'}
        </button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 4. FOURİER SERİSİ ───────────────────────────────────────────
export function FourierSeries({ kavram = 'Fourier Serisi', aciklama }) {
  const canvasRef = useRef()
  const [N, setN] = useState(5)
  const [running, setRunning] = useState(true)
  const tRef = useRef(0)
  const rafRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = 160, cy = H / 2
    const trailRef = []

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current
      let x = cx, y = cy

      // Çemberleri çiz
      const colors = ['#c7cdfa', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3d5af1', '#2d3a8c']
      for (let k = 0; k < N; k++) {
        const n = 2 * k + 1
        const r = (4 / (Math.PI * n)) * 80
        const angle = n * t

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.strokeStyle = colors[k % colors.length]
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.5
        ctx.stroke()
        ctx.globalAlpha = 1

        const nx = x + r * Math.cos(angle)
        const ny = y + r * Math.sin(angle)

        ctx.strokeStyle = colors[k % colors.length]
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nx, ny)
        ctx.stroke()

        x = nx; y = ny
      }

      // Trail
      trailRef.push({ x, y })
      if (trailRef.length > 300) trailRef.shift()

      // Yatay çizgi
      ctx.strokeStyle = '#e8e4dc'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(W / 2 + 20, y)
      ctx.stroke()
      ctx.setLineDash([])

      // Dalga grafiği
      if (trailRef.length > 1) {
        ctx.strokeStyle = '#3d5af1'
        ctx.lineWidth = 2
        ctx.beginPath()
        trailRef.forEach((p, i) => {
          const px = W / 2 + 20 + (trailRef.length - 1 - i) * 0.8
          i === 0 ? ctx.moveTo(px, p.y) : ctx.lineTo(px, p.y)
        })
        ctx.stroke()
      }

      // Etiket
      ctx.fillStyle = '#3d5af1'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText(`N = ${N} harmonik`, 8, 20)
      ctx.fillStyle = '#6b6560'
      ctx.fillText('Kare dalga yaklaşımı', 8, 36)

      if (running) {
        tRef.current += 0.016
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [N, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>f(t) = Σ (4/nπ)·sin(nωt)</span>
      </div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Harmonik sayısı N" min={1} max={7} step={1} value={N} onChange={setN} unit="" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Durdur' : '▶ Başlat'}
        </button>
        <button style={S.btn} onClick={() => { tRef.current = 0 }}>↺ Sıfırla</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 5. ATOM MODELİ ──────────────────────────────────────────────
export function AtomModel({ kavram = 'Atom Modeli', aciklama }) {
  const canvasRef = useRef()
  const [orbits, setOrbits] = useState(3)
  const [speed, setSpeed] = useState(1)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    const orbitData = [
      { r: 50, electrons: 2, color: '#3d5af1', tilt: 0 },
      { r: 90, electrons: 8, color: '#0f7a5a', tilt: Math.PI / 4 },
      { r: 130, electrons: 18, color: '#b45309', tilt: Math.PI / 6 },
      { r: 170, electrons: 2, color: '#7c3aed', tilt: Math.PI / 3 },
    ]

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current

      // Çekirdek
      const nucGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 18)
      nucGrad.addColorStop(0, '#f87171')
      nucGrad.addColorStop(1, '#c0392b')
      ctx.shadowColor = 'rgba(192,57,43,0.4)'
      ctx.shadowBlur = 16
      ctx.beginPath()
      ctx.arc(cx, cy, 16, 0, Math.PI * 2)
      ctx.fillStyle = nucGrad
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('N', cx, cy)

      // Yörüngeler ve elektronlar
      for (let o = 0; o < Math.min(orbits, orbitData.length); o++) {
        const od = orbitData[o]
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(od.tilt)

        // Yörünge ellipsi
        ctx.beginPath()
        ctx.ellipse(0, 0, od.r, od.r * 0.4, 0, 0, Math.PI * 2)
        ctx.strokeStyle = od.color + '44'
        ctx.lineWidth = 1
        ctx.stroke()

        // Elektronlar
        for (let e = 0; e < Math.min(od.electrons, 4); e++) {
          const angle = (e / Math.min(od.electrons, 4)) * Math.PI * 2 + t * speed * (1 + o * 0.3)
          const ex = od.r * Math.cos(angle)
          const ey = od.r * 0.4 * Math.sin(angle)
          ctx.shadowColor = od.color + '88'
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(ex, ey, 5, 0, Math.PI * 2)
          ctx.fillStyle = od.color
          ctx.fill()
          ctx.shadowBlur = 0
        }
        ctx.restore()
      }

      // Etiket
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#6b6560'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText(`${Math.min(orbits, 4)} enerji seviyesi`, 8, H - 10)

      tRef.current += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [orbits, speed])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>Bohr Modeli</span>
      </div>
      <canvas ref={canvasRef} width={600} height={300} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Enerji seviyesi" min={1} max={4} step={1} value={orbits} onChange={setOrbits} unit="" />
        <Ctrl label="Hız" min={0.2} max={4} value={speed} onChange={setSpeed} unit="x" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 6. DNA SARMALI ──────────────────────────────────────────────
export function DNAHelix({ kavram = 'DNA Sarmalı', aciklama }) {
  const canvasRef = useRef()
  const [speed, setSpeed] = useState(1)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2

    const bases = [
      { a: '#3d5af1', b: '#c7cdfa', label: 'A-T' },
      { a: '#0f7a5a', b: '#a7f3d0', label: 'G-C' },
      { a: '#b45309', b: '#fcd34d', label: 'T-A' },
      { a: '#7c3aed', b: '#ddd6fe', label: 'C-G' },
    ]

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current * speed
      const step = 30
      const amp = 80

      const strand1 = [], strand2 = []
      for (let i = 0; i < H / step + 1; i++) {
        const y = i * step - (t * 20 % step)
        const x1 = cx + amp * Math.cos(i * 0.8 + t)
        const x2 = cx + amp * Math.cos(i * 0.8 + t + Math.PI)
        strand1.push({ x: x1, y })
        strand2.push({ x: x2, y })
      }

      // Bağlantı çubukları (bazlar)
      strand1.forEach((p, i) => {
        if (i >= strand2.length) return
        const q = strand2[i]
        const base = bases[i % bases.length]
        const mx = (p.x + q.x) / 2

        ctx.strokeStyle = base.a + 'cc'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(mx, p.y)
        ctx.stroke()

        ctx.strokeStyle = base.b + 'cc'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(mx, p.y)
        ctx.lineTo(q.x, q.y)
        ctx.stroke()

        // Baz çifti noktaları
        ctx.beginPath()
        ctx.arc(mx, p.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#e8e4dc'
        ctx.fill()
        ctx.strokeStyle = '#a09990'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // İskelet 1
      ctx.strokeStyle = '#3d5af1'
      ctx.lineWidth = 4
      ctx.lineJoin = 'round'
      ctx.beginPath()
      strand1.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.stroke()

      // İskelet 2
      ctx.strokeStyle = '#0f7a5a'
      ctx.lineWidth = 4
      ctx.beginPath()
      strand2.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.stroke()

      // Nükleotid noktaları
      ;[...strand1, ...strand2].forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fillStyle = i < strand1.length ? '#3d5af1' : '#0f7a5a'
        ctx.fill()
      })

      // Legend
      ctx.font = '10px JetBrains Mono, monospace'
      bases.forEach((b, i) => {
        ctx.fillStyle = b.a
        ctx.fillRect(W - 55, 10 + i * 18, 10, 10)
        ctx.fillStyle = '#6b6560'
        ctx.fillText(b.label, W - 42, 20 + i * 18)
      })

      tRef.current += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [speed])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>Çift Sarmal</span>
      </div>
      <canvas ref={canvasRef} width={600} height={320} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Dönüş hızı" min={0.2} max={4} value={speed} onChange={setSpeed} unit="x" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 7. FONKSİYON PLOTTER ────────────────────────────────────────
export function FunctionPlotter({ kavram = 'Fonksiyon Grafiği', aciklama }) {
  const canvasRef = useRef()
  const [funcIdx, setFuncIdx] = useState(0)
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)

  const funcs = [
    { label: 'sin(ax)', fn: (x, a, b) => Math.sin(a * x) },
    { label: 'cos(ax)·e^(-bx²)', fn: (x, a, b) => Math.cos(a * x) * Math.exp(-b * x * x * 0.1) },
    { label: 'a·x²+ b·x', fn: (x, a, b) => a * x * x * 0.1 + b * x },
    { label: 'sin(ax)/x', fn: (x, a, b) => x !== 0 ? Math.sin(a * x) / x : a },
    { label: 'a·sin(x)+b·sin(2x)', fn: (x, a, b) => a * Math.sin(x) + b * Math.sin(2 * x) },
    { label: 'tan(ax)', fn: (x, a, b) => Math.tan(a * x * 0.3) },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const scale = 40

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = '#e8e4dc'
    ctx.lineWidth = 1
    for (let x = cx % scale; x < W; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = cy % scale; y < H; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Eksenler
    ctx.strokeStyle = '#a09990'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()

    // Ok uçları
    ctx.fillStyle = '#a09990'
    ;[[W - 6, cy, 1, 0], [cx, 6, 0, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x + dx * 8, y + dy * 8)
      ctx.lineTo(x - dy * 4, y - dx * 4); ctx.lineTo(x + dy * 4, y + dx * 4)
      ctx.fill()
    })

    // Eksen etiketleri
    ctx.fillStyle = '#a09990'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    for (let i = -6; i <= 6; i++) {
      if (i === 0) continue
      ctx.fillText(i, cx + i * scale, cy + 14)
      ctx.fillText(i, cx - 18, cy - i * scale + 4)
    }
    ctx.fillText('x', W - 10, cy - 8)
    ctx.fillText('y', cx + 8, 12)

    // Fonksiyon
    const fn = funcs[funcIdx].fn
    ctx.strokeStyle = '#3d5af1'
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    let first = true
    for (let px = 0; px <= W; px++) {
      const x = (px - cx) / scale
      const y = fn(x, a, b)
      const py = cy - y * scale
      if (!isFinite(py) || Math.abs(py) > H * 2) { first = true; continue }
      first ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      first = false
    }
    ctx.stroke()

    // Fonksiyon etiketi
    ctx.fillStyle = '#3d5af1'
    ctx.font = 'bold 12px JetBrains Mono, monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`f(x) = ${funcs[funcIdx].label.replace('a', a).replace('b', b)}`, 8, 20)
  }, [funcIdx, a, b])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>İnteraktif</span>
      </div>
      <canvas ref={canvasRef} width={600} height={320} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Fonksiyon</div>
          <select value={funcIdx} onChange={e => setFuncIdx(+e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            {funcs.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        <Ctrl label="Parametre a" min={0.1} max={5} value={a} onChange={setA} unit="" />
        <Ctrl label="Parametre b" min={0.1} max={5} value={b} onChange={setB} unit="" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 8. VEKTÖR ALANI ─────────────────────────────────────────────
export function VectorField({ kavram = 'Vektör Alanı', aciklama }) {
  const canvasRef = useRef()
  const [fieldIdx, setFieldIdx] = useState(0)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const fields = [
    { label: 'Elektrik (+ yük)', fn: (x, y) => ({ vx: x / (x * x + y * y + 0.1), vy: y / (x * x + y * y + 0.1) }) },
    { label: 'Girdap', fn: (x, y) => ({ vx: -y, vy: x }) },
    { label: 'Gradyan', fn: (x, y) => ({ vx: Math.sin(y), vy: Math.cos(x) }) },
    { label: 'Manyetik', fn: (x, y, t) => ({ vx: Math.sin(y + t), vy: Math.cos(x + t) }) },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const rows = 16, cols = 20
    const dx = W / cols, dy = H / rows

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current
      const field = fields[fieldIdx].fn

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * dx
          const py = (r + 0.5) * dy
          const fx = (px - W / 2) / (W / 8)
          const fy = (py - H / 2) / (H / 8)
          const { vx, vy } = field(fx, fy, t)
          const mag = Math.sqrt(vx * vx + vy * vy)
          const len = Math.min(mag * 12, dx * 0.45)
          const nx = vx / (mag || 1)
          const ny = vy / (mag || 1)

          // Renk magnitude'a göre
          const hue = 220 + (1 - Math.min(mag, 1)) * 140
          ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.8)`
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.8)`
          ctx.lineWidth = 1.5

          const ex = px + nx * len
          const ey = py + ny * len
          ctx.beginPath()
          ctx.moveTo(px - nx * len * 0.3, py - ny * len * 0.3)
          ctx.lineTo(ex, ey)
          ctx.stroke()

          // Ok ucu
          const angle = Math.atan2(ny, nx)
          ctx.save()
          ctx.translate(ex, ey)
          ctx.rotate(angle)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(-5, -2.5)
          ctx.lineTo(-5, 2.5)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
      }

      ctx.fillStyle = '#3d5af1'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText(fields[fieldIdx].label, 8, 18)

      if (running && fieldIdx === 3) {
        tRef.current += 0.016
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [fieldIdx, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>F⃗(x,y)</span>
      </div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Alan tipi</div>
          <select value={fieldIdx} onChange={e => setFieldIdx(+e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            {fields.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        {fieldIdx === 3 && (
          <button style={S.btn} onClick={() => setRunning(r => !r)}>
            {running ? '⏸ Durdur' : '▶ Başlat'}
          </button>
        )}
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 9. KİNEMATİK ────────────────────────────────────────────────
export function Kinematics({ kavram = 'Kinematik', aciklama }) {
  const canvasRef = useRef()
  const [v0, setV0] = useState(15)
  const [angle, setAngle] = useState(45)
  const [g, setG] = useState(9.8)
  const [running, setRunning] = useState(false)
  const tRef = useRef(0)
  const rafRef = useRef()
  const trailRef = useRef([])

  useEffect(() => {
    trailRef.current = []
    tRef.current = 0
  }, [v0, angle, g])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const scale = 8
    const ox = 40, oy = H - 40
    const rad = angle * Math.PI / 180
    const vx = v0 * Math.cos(rad)
    const vy = v0 * Math.sin(rad)
    const T = 2 * vy / g
    const R = vx * T
    const Hmax = vy * vy / (2 * g)

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      // Zemin
      ctx.fillStyle = '#e8e4dc'
      ctx.fillRect(0, oy, W, H - oy)
      ctx.strokeStyle = '#a09990'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke()

      // Eksen
      ctx.strokeStyle = '#d4cfc8'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 6])
      for (let x = ox; x < W; x += scale * 5) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, oy); ctx.stroke() }
      for (let y = oy; y > 40; y -= scale * 5) { ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(W - 10, y); ctx.stroke() }
      ctx.setLineDash([])

      // Teorik yol
      ctx.strokeStyle = '#c7cdfa'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let t = 0; t <= T; t += 0.05) {
        const px = ox + vx * t * scale
        const py = oy - (vy * t - 0.5 * g * t * t) * scale
        t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.stroke()

      // Trail
      const t = tRef.current
      if (running && t <= T) {
        const px = ox + vx * t * scale
        const py = oy - (vy * t - 0.5 * g * t * t) * scale
        trailRef.current.push({ x: px, y: py })
        tRef.current += 0.016
      }

      // Trail çiz
      ctx.strokeStyle = '#3d5af1'
      ctx.lineWidth = 2
      ctx.beginPath()
      trailRef.current.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.stroke()

      // Top
      if (trailRef.current.length > 0) {
        const last = trailRef.current[trailRef.current.length - 1]
        ctx.shadowColor = 'rgba(61,90,241,0.3)'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(last.x, last.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#3d5af1'
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Bilgi
      ctx.font = '11px JetBrains Mono, monospace'
      const info = [
        `v₀ = ${v0} m/s, θ = ${angle}°`,
        `Menzil R = ${R.toFixed(1)} m`,
        `Max yükseklik = ${Hmax.toFixed(1)} m`,
        `Uçuş süresi T = ${T.toFixed(2)} s`,
        `t = ${Math.min(tRef.current, T).toFixed(2)} s`,
      ]
      ctx.fillStyle = 'rgba(247,245,240,0.95)'
      ctx.strokeStyle = '#e8e4dc'
      ctx.fillRect(W - 200, 10, 190, info.length * 17 + 10)
      ctx.strokeRect(W - 200, 10, 190, info.length * 17 + 10)
      info.forEach((line, i) => {
        ctx.fillStyle = i === 4 ? '#3d5af1' : '#6b6560'
        ctx.fillText(line, W - 196, 24 + i * 17)
      })

      if (running) rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [v0, angle, g, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>Mertebe atışı</span>
      </div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="İlk hız v₀" min={5} max={40} step={1} value={v0} onChange={setV0} unit=" m/s" />
        <Ctrl label="Açı θ" min={10} max={80} step={1} value={angle} onChange={setAngle} unit="°" />
        <Ctrl label="g" min={1} max={20} value={g} onChange={setG} unit=" m/s²" />
        <button style={S.btn} onClick={() => { setRunning(true); trailRef.current = []; tRef.current = 0 }}>
          ▶ Fırlat
        </button>
        <button style={S.btn} onClick={() => { setRunning(false); trailRef.current = []; tRef.current = 0 }}>
          ↺ Sıfırla
        </button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 10. OHM YASASI DEVRESİ ──────────────────────────────────────
export function OhmCircuit({ kavram = 'Ohm Yasası', aciklama }) {
  const canvasRef = useRef()
  const [V, setV] = useState(12)
  const [R, setR] = useState(4)
  const rafRef = useRef()
  const tRef = useRef(0)

  const I = V / R
  const P = V * I

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)

      const t = tRef.current

      // Devre çizimi
      const cx = W / 2, cy = H / 2
      const bx = cx - 120, bw = 40, bh = 70  // pil
      const rx = cx + 60, rw = 60, rh = 25   // direnç

      // Tel (devre döngüsü)
      ctx.strokeStyle = '#3d5af1'
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'
      ctx.strokeRect(cx - 150, cy - 80, 300, 160)

      // Pil
      ctx.fillStyle = '#eef0fe'
      ctx.strokeStyle = '#3d5af1'
      ctx.lineWidth = 1.5
      ctx.fillRect(bx - 15, cy - 30, 30, 60)
      ctx.strokeRect(bx - 15, cy - 30, 30, 60)
      // + ve - kutuplar
      ctx.fillStyle = '#3d5af1'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('+', bx, cy - 38)
      ctx.fillText('−', bx, cy + 48)
      ctx.fillStyle = '#6b6560'
      ctx.font = '10px JetBrains Mono'
      ctx.fillText(`${V}V`, bx, cy + 5)

      // Direnç (zikzak)
      ctx.strokeStyle = '#b45309'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(rx, cy - 80)
      for (let i = 0; i < 8; i++) {
        const zig = i % 2 === 0 ? 12 : -12
        ctx.lineTo(rx + zig, cy - 80 + (i + 0.5) * 20)
      }
      ctx.lineTo(rx, cy + 80)
      ctx.stroke()
      ctx.fillStyle = '#b45309'
      ctx.font = '10px JetBrains Mono'
      ctx.textAlign = 'left'
      ctx.fillText(`${R}Ω`, rx + 18, cy)

      // Elektron akışı (animasyonlu noktalar)
      const speed = I * 0.3
      const dots = 8
      ctx.fillStyle = '#f7c948'
      for (let d = 0; d < dots; d++) {
        const progress = ((t * speed + d / dots) % 1 + 1) % 1
        // Devre üzerinde dönen pozisyon
        const perim = 920 // yaklaşık çevre
        const pos = progress * perim
        let px, py
        if (pos < 300) { px = cx - 150 + pos; py = cy - 80 }
        else if (pos < 460) { px = cx + 150; py = cy - 80 + (pos - 300) }
        else if (pos < 760) { px = cx + 150 - (pos - 460); py = cy + 80 }
        else { px = cx - 150; py = cy + 80 - (pos - 760) }
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Bilgi kutusu
      const info = [
        `V = ${V} V`,
        `R = ${R} Ω`,
        `I = ${I.toFixed(2)} A`,
        `P = ${P.toFixed(1)} W`,
      ]
      ctx.fillStyle = 'rgba(247,245,240,0.95)'
      ctx.strokeStyle = '#e8e4dc'
      ctx.lineWidth = 1
      ctx.fillRect(8, 8, 110, info.length * 18 + 10)
      ctx.strokeRect(8, 8, 110, info.length * 18 + 10)
      info.forEach((line, i) => {
        ctx.fillStyle = '#3d5af1'
        ctx.font = '11px JetBrains Mono, monospace'
        ctx.textAlign = 'left'
        ctx.fillText(line, 14, 22 + i * 18)
      })

      tRef.current += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [V, R, I, P])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>V = I · R</span>
      </div>
      <canvas ref={canvasRef} width={600} height={260} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Gerilim V" min={1} max={30} step={1} value={V} onChange={setV} unit=" V" />
        <Ctrl label="Direnç R" min={1} max={20} step={1} value={R} onChange={setR} unit=" Ω" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#3d5af1' }}>
          I = {I.toFixed(2)} A &nbsp;|&nbsp; P = {P.toFixed(1)} W
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── SELECTOR — kavram tipine göre şablon seç ─────────────────────
const KEYWORD_MAP = [
  { keys: ['sarkaç', 'pendulum', 'salıngaç'], Component: Pendulum },
  { keys: ['yay', 'harmonik hareket', 'bhm', 'basit harmonik', 'osilatör'], Component: BHMSpring },
  { keys: ['dalga süperpozisyon', 'girişim', 'interferans'], Component: WaveSuperposition },
  { keys: ['fourier', 'spektrum'], Component: FourierSeries },
  { keys: ['atom', 'elektron', 'yörünge', 'bohr', 'orbital'], Component: AtomModel },
  { keys: ['dna', 'sarmal', 'nükleotid', 'gen', 'kromatit'], Component: DNAHelix },
  { keys: ['fonksiyon', 'eğri', 'trigonometri', 'sinüs', 'kosinüs'], Component: FunctionPlotter },
  { keys: ['vektör alan', 'kuvvet alanı'], Component: VectorField },
  { keys: ['kinemati', 'mertebe atış', 'parabol'], Component: Kinematics },
  { keys: ['ohm', 'elektrik devre', 'direnç'], Component: OhmCircuit },
  { keys: ['fotosentez', 'klorofil', 'bitki fotosentez'], Component: TreePhotosynthesis },
  { keys: ['güneş panel', 'solar panel', 'fotovoltaik'], Component: SolarPanel },
  { keys: ['rüzgar türbin', 'rüzgar enerjisi'], Component: WindTurbine },
  { keys: ['hidroelektrik', 'baraj', 'su döngüsü'], Component: WaterHydro },
  { keys: ['mitoz', 'hücre bölünme', 'mayoz', 'kromozom'], Component: CellDivision },
  { keys: ['kan dolaşım', 'kalp dolaşım', 'pulmoner dolaşım'], Component: BloodCirculation },
  { keys: ['lens', 'mercek', 'optik kırılma', 'konveks'], Component: LensRefraction },
  { keys: ['çarpışma', 'momentum korunumu', 'elastik çarpışma'], Component: Collision },
  { keys: ['türev', 'teğet çizgi', 'diferansiyel'], Component: Derivative },
  { keys: ['sera etkisi', 'küresel ısınma', 'iklim değişikliği'], Component: GreenhouseEffect },
  { keys: ['nükleer fisyon', 'fisyon', 'uranyum', 'nötron zincir'], Component: NuclearFission },
  { keys: ['elektromanyetik dalga', 'em dalga', 'ışık dalgası'], Component: EMWave },
  { keys: ['manyetik alan', 'mıknatıs', 'solenoid'], Component: MagneticField },
  { keys: ['aksiyon potansiyeli', 'sinir iletim', 'nöron', 'miyelin'], Component: ActionPotential },
  { keys: ['kinetik teori', 'ideal gaz', 'gaz molekül', 'termodinamik'], Component: GasMolecules },
  { keys: ['doppler', 'ses dalgası kaynak', 'doppler etkisi'], Component: DopplerEffect },
  { keys: ['periyodik tablo', 'element', 'kimyasal element'], Component: PeriodicTable },
  { keys: ['titrasyon', 'asit baz', 'ph eğrisi', 'nötralizasyon'], Component: Titration },
  { keys: ['av avcı', 'lotka volterra', 'ekosistem', 'popülasyon dinamiği'], Component: LotkaVolterra },
  { keys: ['riemann', 'integral alan', 'belirli integral'], Component: RiemannIntegral },
  { keys: ['güneş sistemi', 'gezegen', 'yörünge'], Component: SolarSystem },
  { keys: ['matris dönüşüm', 'doğrusal dönüşüm', 'rotasyon matris'], Component: MatrixTransform },
  { keys: ['levha tektoniği', 'kıta kayması', 'subdüksiyon', 'fay'], Component: PlateTectonics },
  { keys: ['dalga enerjisi', 'okyanus dalgası', 'dalga gücü'], Component: OceanWave },
  { keys: ['jeotermal', 'jeotermal enerji', 'yeraltı ısısı'], Component: GeothermalEnergy },
  { keys: ['ayıraç', 'lugol', 'benedict', 'biüret', 'ninhidrin', 'organik molekül ayıraç', 'sudan boyası'], Component: OrganicIndicators },
  { keys: ['limit yaklaşım', 'limit fonksiyon', 'epsilon delta'], Component: LimitApproach },
  { keys: ['birim çember', 'trigonometri çember', 'sin cos tan çember'], Component: UnitCircle },
  { keys: ['normal dağılım', 'gauss dağılımı', 'standart sapma dağılım'], Component: NormalDistribution },
  { keys: ['polar koordinat', 'polar eğri', 'kardiyoit', 'r=f(θ)'], Component: PolarCoordinates },
  { keys: ['eğim alanı', 'slope field', 'diferansiyel denklem görsel'], Component: SlopeField },
  { keys: ['seri yakınsama', 'dizi yakınsama', 'kısmi toplam'], Component: SequenceSeries },
]

// Tüm şablon adları → AI'a liste olarak göndermek için
const TEMPLATE_LIST = [
  { id: 'BHMSpring', label: 'Basit Harmonik Hareket (yay-kütle)', keys: ['harmonik', 'yay', 'osilatör', 'titreşim'] },
  { id: 'Pendulum', label: 'Sarkaç', keys: ['sarkaç', 'pendulum'] },
  { id: 'WaveSuperposition', label: 'Dalga Süperpozisyonu', keys: ['dalga süperpozisyon', 'girişim'] },
  { id: 'FourierSeries', label: 'Fourier Serisi', keys: ['fourier'] },
  { id: 'AtomModel', label: 'Atom Modeli (Bohr)', keys: ['atom', 'elektron yörünge'] },
  { id: 'DNAHelix', label: 'DNA Sarmalı', keys: ['dna', 'sarmal'] },
  { id: 'FunctionPlotter', label: 'Fonksiyon Grafiği', keys: ['fonksiyon', 'trigonometri'] },
  { id: 'VectorField', label: 'Vektör Alanı', keys: ['vektör alanı'] },
  { id: 'Kinematics', label: 'Kinematik (Mertebe Atışı)', keys: ['kinematik', 'atış', 'parabol'] },
  { id: 'OhmCircuit', label: 'Ohm Yasası Devresi', keys: ['ohm', 'devre', 'akım'] },
  { id: 'TreePhotosynthesis', label: 'Fotosentez', keys: ['fotosentez', 'bitki'] },
  { id: 'SolarPanel', label: 'Güneş Paneli', keys: ['güneş panel', 'solar'] },
  { id: 'WindTurbine', label: 'Rüzgar Türbini', keys: ['rüzgar türbin'] },
  { id: 'WaterHydro', label: 'Hidroelektrik / Su Döngüsü', keys: ['hidroelektrik', 'baraj'] },
  { id: 'CellDivision', label: 'Mitoz / Hücre Bölünmesi', keys: ['mitoz', 'hücre bölünme'] },
  { id: 'BloodCirculation', label: 'Kan Dolaşımı', keys: ['kan dolaşım', 'kalp dolaşım'] },
  { id: 'LensRefraction', label: 'Lens ve Işık Kırılması', keys: ['lens', 'mercek', 'optik'] },
  { id: 'Collision', label: 'Çarpışma / Momentum', keys: ['çarpışma', 'momentum'] },
  { id: 'Derivative', label: 'Türev (Geometrik Anlam)', keys: ['türev', 'teğet'] },
  { id: 'GreenhouseEffect', label: 'Sera Etkisi', keys: ['sera etkisi', 'küresel ısınma'] },
  { id: 'NuclearFission', label: 'Nükleer Fisyon', keys: ['fisyon', 'nükleer'] },
  { id: 'EMWave', label: 'Elektromanyetik Dalga', keys: ['elektromanyetik dalga'] },
  { id: 'MagneticField', label: 'Manyetik Alan', keys: ['manyetik alan', 'mıknatıs'] },
  { id: 'ActionPotential', label: 'Aksiyon Potansiyeli / Sinir İletimi', keys: ['aksiyon potansiyeli', 'sinir'] },
  { id: 'GasMolecules', label: 'İdeal Gaz / Kinetik Teori', keys: ['ideal gaz', 'kinetik teori'] },
  { id: 'DopplerEffect', label: 'Doppler Etkisi', keys: ['doppler'] },
  { id: 'PeriodicTable', label: 'Periyodik Tablo', keys: ['periyodik tablo', 'element'] },
  { id: 'Titration', label: 'Asit-Baz Titrasyonu', keys: ['titrasyon', 'asit baz'] },
  { id: 'LotkaVolterra', label: 'Av-Avcı Dengesi (Lotka-Volterra)', keys: ['av avcı', 'ekosistem'] },
  { id: 'RiemannIntegral', label: 'İntegral / Riemann Toplamı', keys: ['integral', 'riemann'] },
  { id: 'SolarSystem', label: 'Güneş Sistemi', keys: ['güneş sistemi', 'gezegen'] },
  { id: 'MatrixTransform', label: 'Matris Dönüşümleri', keys: ['matris dönüşüm'] },
  { id: 'PlateTectonics', label: 'Levha Tektoniği', keys: ['levha tektoniği', 'fay'] },
  { id: 'OceanWave', label: 'Dalga Enerjisi (Okyanus)', keys: ['dalga enerjisi', 'okyanus'] },
  { id: 'GeothermalEnergy', label: 'Jeotermal Enerji', keys: ['jeotermal'] },
  { id: 'OrganicIndicators', label: 'Organik Moleküllerin Ayıraçları', keys: ['ayıraç', 'lugol', 'benedict', 'biüret', 'ninhidrin', 'fehling', 'sudan', 'organik molekül ayıraç'] },
]

const COMPONENT_MAP = {
  BHMSpring, Pendulum, WaveSuperposition, FourierSeries, AtomModel, DNAHelix,
  FunctionPlotter, VectorField, Kinematics, OhmCircuit, TreePhotosynthesis,
  SolarPanel, WindTurbine, WaterHydro, CellDivision, BloodCirculation,
  LensRefraction, Collision, Derivative, GreenhouseEffect, NuclearFission,
  EMWave, MagneticField, ActionPotential, GasMolecules, DopplerEffect,
  PeriodicTable, Titration, LotkaVolterra, RiemannIntegral, SolarSystem,
  MatrixTransform, PlateTectonics, OceanWave, GeothermalEnergy, OrganicIndicators,
  LimitApproach, UnitCircle, NormalDistribution, PolarCoordinates, SlopeField, SequenceSeries,
}

async function aiSelectTemplate(kavram, aciklama) {
  const templateNames = TEMPLATE_LIST.map(t => `${t.id}: ${t.label}`).join('\n')
  const prompt = `Aşağıdaki eğitim kavramı için en uygun görselleştirme şablonunu seç.

Kavram: ${kavram}
Açıklama: ${aciklama?.slice(0, 300) || ''}

Mevcut şablonlar:
${templateNames}

SADECE şablon ID'sini döndür (örn: AtomModel). Başka hiçbir şey yazma.
Eğer hiçbiri uygun değilse: NONE`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || 'NONE'
    return text === 'NONE' ? null : text
  } catch {
    return null
  }
}

export function AutoViz({ kavram = '', aciklama = '' }) {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noMatch, setNoMatch] = useState(false)

  useEffect(() => {
    if (!kavram) { setLoading(false); setNoMatch(true); return }

    // Önce hızlı keyword eşleşmesi dene
    const lower = kavram.toLowerCase()
    const kwMatch = KEYWORD_MAP.find(m => m.keys.some(k => lower.includes(k)))
    if (kwMatch) {
      setComponent(() => kwMatch.Component)
      setLoading(false)
      return
    }

    // Keyword eşleşmesi yoksa AI'a sor
    setLoading(true)
    aiSelectTemplate(kavram, aciklama).then(templateId => {
      if (templateId && COMPONENT_MAP[templateId]) {
        setComponent(() => COMPONENT_MAP[templateId])
        setNoMatch(false)
      } else {
        setNoMatch(true)
      }
      setLoading(false)
    })
  }, [kavram, aciklama])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--ink3)', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'dotBounce 1.2s infinite', animationDelay: `${i*0.2}s` }} />
        ))}
      </div>
      <span style={{ fontSize: '0.88rem' }}>En uygun şablon seçiliyor...</span>
    </div>
  )

  if (noMatch) return (
    <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '12px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--ink2)', marginBottom: '0.5rem' }}>
        Bu kavram için uygun şablon bulunamadı
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink3)' }}>
        <b>🖼️ Imagen 4</b> ile görsel üretmeyi ya da <b>🤖 AI Kod</b> modunu dene
      </div>
    </div>
  )

  return <Component kavram={kavram} aciklama={aciklama} />
}

export default AutoViz

// ─── 11. AĞAÇ / FOTOSENTEz ───────────────────────────────────────
export function TreePhotosynthesis({ kavram = 'Fotosentez', aciklama }) {
  const canvasRef = useRef()
  const [light, setLight] = useState(80)
  const [co2, setCo2] = useState(60)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const particles = []
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        type: Math.random() > 0.5 ? 'co2' : 'h2o',
        vx: (Math.random() - 0.5) * 0.5, vy: -0.3 - Math.random() * 0.3,
        life: Math.random(),
      })
    }

    function drawTree(t) {
      // Zemin
      const grad = ctx.createLinearGradient(0, H * 0.75, 0, H)
      grad.addColorStop(0, '#a7f3d0')
      grad.addColorStop(1, '#6ee7b7')
      ctx.fillStyle = grad
      ctx.fillRect(0, H * 0.75, W, H * 0.25)

      // Gövde
      ctx.fillStyle = '#78350f'
      ctx.beginPath()
      ctx.moveTo(W/2 - 18, H * 0.75)
      ctx.lineTo(W/2 + 18, H * 0.75)
      ctx.lineTo(W/2 + 10, H * 0.35)
      ctx.lineTo(W/2 - 10, H * 0.35)
      ctx.closePath()
      ctx.fill()

      // Yapraklar (nefes alan)
      const breathe = 1 + Math.sin(t * 2) * 0.04 * (light / 100)
      const green = Math.floor(100 + (light / 100) * 55)
      ;[
        [W/2, H * 0.22, 90],
        [W/2 - 55, H * 0.38, 70],
        [W/2 + 55, H * 0.38, 70],
        [W/2 - 30, H * 0.3, 75],
        [W/2 + 30, H * 0.3, 75],
      ].forEach(([x, y, r]) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(breathe, breathe)
        ctx.beginPath()
        ctx.arc(0, 0, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${50}, ${green}, ${70})`
        ctx.fill()
        ctx.restore()
      })
    }

    function drawSun(t) {
      const sunX = W * 0.85, sunY = H * 0.12
      const rays = 12
      ctx.save()
      ctx.translate(sunX, sunY)
      ctx.rotate(t * 0.3)
      ctx.strokeStyle = `rgba(251,191,36,${0.4 + (light/100)*0.4})`
      ctx.lineWidth = 2
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22)
        ctx.lineTo(Math.cos(a) * 35, Math.sin(a) * 35)
        ctx.stroke()
      }
      ctx.restore()
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20)
      sunGrad.addColorStop(0, '#fef08a')
      sunGrad.addColorStop(1, '#f59e0b')
      ctx.beginPath()
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2)
      ctx.fillStyle = sunGrad
      ctx.fill()

      // Işın çizgileri ağaca doğru
      const beams = Math.floor(light / 25)
      for (let i = 0; i < beams; i++) {
        const tx = W/2 + (Math.random() - 0.5) * 60
        const ty = H * 0.25
        ctx.strokeStyle = `rgba(251,191,36,${0.15 + Math.sin(t*3+i)*0.1})`
        ctx.lineWidth = 1
        ctx.setLineDash([4,8])
        ctx.beginPath()
        ctx.moveTo(sunX, sunY + 20)
        ctx.lineTo(tx, ty)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    function drawParticles(t) {
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy * (light / 80)
        p.life += 0.005
        if (p.y < 0 || p.life > 1) {
          p.x = W/2 + (Math.random() - 0.5) * 80
          p.y = H * 0.5
          p.life = 0
          p.type = Math.random() > (co2 / 100) ? 'o2' : 'co2'
        }
        const alpha = Math.sin(p.life * Math.PI) * 0.8
        ctx.font = '11px Inter, sans-serif'
        ctx.globalAlpha = alpha
        if (p.type === 'co2') { ctx.fillStyle = '#6b7280'; ctx.fillText('CO₂', p.x, p.y) }
        else if (p.type === 'h2o') { ctx.fillStyle = '#3b82f6'; ctx.fillText('H₂O', p.x, p.y) }
        else { ctx.fillStyle = '#10b981'; ctx.fillText('O₂', p.x, p.y) }
        ctx.globalAlpha = 1
      })
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      // Gökyüzü
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75)
      sky.addColorStop(0, `hsl(${200 + light * 0.2}, ${50 + light * 0.3}%, ${60 + light * 0.2}%)`)
      sky.addColorStop(1, '#f0fdf4')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H * 0.75)

      const t = tRef.current
      drawSun(t)
      drawTree(t)
      drawParticles(t)

      // Bilgi
      const rate = ((light / 100) * (co2 / 100) * 100).toFixed(0)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.strokeStyle = '#a7f3d0'
      ctx.lineWidth = 1
      ctx.fillRect(8, 8, 160, 52)
      ctx.strokeRect(8, 8, 160, 52)
      ctx.fillStyle = '#0f7a5a'
      ctx.font = 'bold 11px JetBrains Mono, monospace'
      ctx.fillText(`6CO₂ + 6H₂O → C₆H₁₂O₆`, 12, 24)
      ctx.fillStyle = '#6b6560'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText(`Fotosentez hızı: ${rate}%`, 12, 42)
      ctx.fillText(`Işık: ${light}%  CO₂: ${co2}%`, 12, 56)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [light, co2, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</span>
      </div>
      <canvas ref={canvasRef} width={600} height={320} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Işık yoğunluğu" min={10} max={100} step={1} value={light} onChange={setLight} unit="%" />
        <Ctrl label="CO₂ konsantrasyonu" min={10} max={100} step={1} value={co2} onChange={setCo2} unit="%" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 12. GÜNEŞ PANELİ ────────────────────────────────────────────
export function SolarPanel({ kavram = 'Güneş Paneli', aciklama }) {
  const canvasRef = useRef()
  const [angle, setAngle] = useState(35)
  const [cloudiness, setCloudiness] = useState(0)
  const rafRef = useRef()
  const tRef = useRef(0)

  const efficiency = Math.max(0, Math.cos((angle - 35) * Math.PI / 180) * (1 - cloudiness / 100) * 100)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function drawCloud(x, y, t, alpha) {
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#f0f9ff'
      ;[[0,0,28],[25,-8,22],[50,0,28],[75,-5,20],[-20,0,20]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(x+dx, y+dy, r, 0, Math.PI*2); ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Gökyüzü
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      const brightness = Math.max(30, 70 - cloudiness * 0.4)
      sky.addColorStop(0, `hsl(210, 60%, ${brightness}%)`)
      sky.addColorStop(1, `hsl(200, 40%, ${brightness + 15}%)`)
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

      // Güneş
      const sunX = W * 0.15, sunY = H * 0.15
      const sunAlpha = 1 - cloudiness / 120
      ctx.globalAlpha = sunAlpha
      const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 30)
      sg.addColorStop(0, '#fef08a'); sg.addColorStop(1, '#f59e0b')
      ctx.beginPath(); ctx.arc(sunX, sunY, 28, 0, Math.PI*2)
      ctx.fillStyle = sg; ctx.fill()
      ctx.globalAlpha = 1

      // Bulutlar
      if (cloudiness > 0) {
        drawCloud(W*0.3 + Math.sin(t*0.2)*20, H*0.1, t, cloudiness/100*0.9)
        drawCloud(W*0.6 + Math.cos(t*0.15)*15, H*0.07, t, cloudiness/100*0.7)
        if (cloudiness > 40) drawCloud(W*0.5 + Math.sin(t*0.1)*25, H*0.18, t, cloudiness/120)
      }

      // Güneş ışınları (panele doğru)
      const panelCx = W/2, panelCy = H*0.55
      const beamCount = Math.floor((1 - cloudiness/100) * 6)
      for (let i = 0; i < beamCount; i++) {
        const bx = panelCx + (i - beamCount/2) * 30
        ctx.strokeStyle = `rgba(251,191,36,${0.3 + Math.sin(t*2+i)*0.1})`
        ctx.lineWidth = 1.5; ctx.setLineDash([6,10])
        ctx.beginPath(); ctx.moveTo(sunX, sunY+28); ctx.lineTo(bx, panelCy - 20); ctx.stroke()
        ctx.setLineDash([])
      }

      // Zemin
      ctx.fillStyle = '#d1fae5'; ctx.fillRect(0, H*0.8, W, H*0.2)

      // Panel standı
      ctx.fillStyle = '#6b7280'; ctx.fillRect(panelCx - 4, H*0.65, 8, H*0.15)
      ctx.fillStyle = '#9ca3af'; ctx.fillRect(panelCx - 40, H*0.8 - 5, 80, 8); ctx.borderRadius = 4

      // Panel (eğimli)
      const rad = (angle - 90) * Math.PI / 180
      const pw = 160, ph = 90
      ctx.save()
      ctx.translate(panelCx, panelCy)
      ctx.rotate(rad)

      // Panel çerçeve
      ctx.fillStyle = '#1e3a5f'
      ctx.fillRect(-pw/2 - 4, -ph/2 - 4, pw + 8, ph + 8)

      // Panel hücreleri
      const cols = 4, rows = 3
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx2 = -pw/2 + c * (pw/cols) + 2
          const cy2 = -ph/2 + r * (ph/rows) + 2
          const cw = pw/cols - 4, ch = ph/rows - 4
          const cellBright = Math.max(0, 1 - cloudiness/100) * (0.7 + Math.sin(t*3+r+c)*0.1)
          ctx.fillStyle = `rgba(${30 + cellBright*20}, ${60 + cellBright*40}, ${180 + cellBright*40}, ${0.7 + cellBright*0.3})`
          ctx.fillRect(cx2, cy2, cw, ch)
          // Yansıma
          ctx.fillStyle = `rgba(255,255,255,${cellBright * 0.2})`
          ctx.fillRect(cx2 + 2, cy2 + 2, cw * 0.4, ch * 0.3)
        }
      }
      ctx.restore()

      // Güç göstergesi
      const power = efficiency.toFixed(1)
      const barW = 140, barH = 12
      const bx2 = W - barW - 16, by = 16
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(bx2 - 8, by - 8, barW + 60, 80)
      ctx.strokeRect(bx2 - 8, by - 8, barW + 60, 80)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText('Güç çıkışı', bx2, by + 8)
      ctx.fillStyle = '#e8e4dc'
      ctx.fillRect(bx2, by + 14, barW, barH)
      ctx.fillStyle = efficiency > 60 ? '#10b981' : efficiency > 30 ? '#f59e0b' : '#ef4444'
      ctx.fillRect(bx2, by + 14, barW * efficiency / 100, barH)
      ctx.fillStyle = '#1a1814'; ctx.font = 'bold 16px JetBrains Mono, monospace'
      ctx.fillText(`${power}%`, bx2, by + 48)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText(`Açı: ${angle}° | Bulut: ${cloudiness}%`, bx2, by + 64)

      tRef.current += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [angle, cloudiness, efficiency])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>Fotovoltaik</span>
      </div>
      <canvas ref={canvasRef} width={600} height={300} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Panel açısı" min={0} max={90} step={1} value={angle} onChange={setAngle} unit="°" />
        <Ctrl label="Bulutluluk" min={0} max={100} step={1} value={cloudiness} onChange={setCloudiness} unit="%" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: efficiency > 60 ? 'var(--green)' : efficiency > 30 ? 'var(--gold)' : 'var(--red)' }}>
          Verim: {efficiency.toFixed(1)}%
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 13. RÜZGAR TÜRBİNİ ──────────────────────────────────────────
export function WindTurbine({ kavram = 'Rüzgar Türbini', aciklama }) {
  const canvasRef = useRef()
  const [windSpeed, setWindSpeed] = useState(8)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const power = Math.min(100, (windSpeed / 25) * (windSpeed / 25) * (windSpeed / 25) * 100 * 0.4)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current
      const rpm = windSpeed * 2.5
      const angSpeed = rpm / 60 * Math.PI * 2

      // Gökyüzü gradyanı
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75)
      sky.addColorStop(0, '#bfdbfe'); sky.addColorStop(1, '#eff6ff')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

      // Rüzgar çizgileri
      const windAlpha = windSpeed / 25
      for (let i = 0; i < 8; i++) {
        const y = 30 + i * 35 + Math.sin(t * 2 + i) * 5
        const len = 40 + windSpeed * 3
        const x = (W + (t * windSpeed * 8 + i * 80) % (W + 100)) % (W + 100) - 50
        ctx.strokeStyle = `rgba(147,197,253,${windAlpha * 0.6})`
        ctx.lineWidth = 2; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len, y); ctx.stroke()
      }

      // Tepe
      const grad = ctx.createLinearGradient(0, H*0.72, 0, H)
      grad.addColorStop(0, '#86efac'); grad.addColorStop(1, '#4ade80')
      ctx.fillStyle = grad; ctx.fillRect(0, H*0.75, W, H*0.25)
      // Tepe silüeti
      ctx.beginPath(); ctx.moveTo(0, H*0.75)
      for (let x = 0; x <= W; x += 20) {
        ctx.lineTo(x, H*0.75 - Math.sin(x*0.03)*12 - Math.sin(x*0.07)*6)
      }
      ctx.lineTo(W, H*0.75); ctx.closePath()
      ctx.fillStyle = '#4ade80'; ctx.fill()

      // Türbin kule
      const tx = W/2, ty = H*0.75
      ctx.fillStyle = '#d1d5db'
      ctx.beginPath()
      ctx.moveTo(tx - 14, ty); ctx.lineTo(tx + 14, ty)
      ctx.lineTo(tx + 6, H*0.25); ctx.lineTo(tx - 6, H*0.25)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1; ctx.stroke()

      // Göbek
      const hubY = H * 0.25
      ctx.beginPath(); ctx.arc(tx, hubY, 10, 0, Math.PI*2)
      ctx.fillStyle = '#6b7280'; ctx.fill()

      // Kanatlar
      const bladeAngle = t * angSpeed
      ;[0, 2*Math.PI/3, 4*Math.PI/3].forEach(offset => {
        const a = bladeAngle + offset
        ctx.save()
        ctx.translate(tx, hubY)
        ctx.rotate(a)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.bezierCurveTo(8, -20, 6, -60, 2, -110)
        ctx.bezierCurveTo(-2, -110, -8, -60, -4, -20)
        ctx.closePath()
        const bladeGrad = ctx.createLinearGradient(0, 0, 0, -110)
        bladeGrad.addColorStop(0, '#e5e7eb'); bladeGrad.addColorStop(1, '#f9fafb')
        ctx.fillStyle = bladeGrad; ctx.fill()
        ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1; ctx.stroke()
        ctx.restore()
      })

      // Güç paneli
      ctx.fillStyle = 'rgba(255,255,255,0.93)'
      ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(W - 170, 10, 158, 100)
      ctx.strokeRect(W - 170, 10, 158, 100)

      const barW = 120
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText(`Rüzgar: ${windSpeed} m/s`, W - 162, 28)
      ctx.fillText(`RPM: ${(rpm).toFixed(1)}`, W - 162, 44)

      ctx.fillStyle = '#e8e4dc'; ctx.fillRect(W - 162, 50, barW, 10)
      ctx.fillStyle = power > 60 ? '#10b981' : power > 30 ? '#f59e0b' : '#94a3b8'
      ctx.fillRect(W - 162, 50, barW * power / 100, 10)

      ctx.fillStyle = '#1a1814'; ctx.font = 'bold 22px JetBrains Mono, monospace'
      ctx.fillText(`${power.toFixed(0)}%`, W - 162, 90)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText('Güç çıkışı', W - 162, 105)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [windSpeed, running, power])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>P = ½ρAv³</span>
      </div>
      <canvas ref={canvasRef} width={600} height={310} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Rüzgar hızı" min={0} max={25} step={0.5} value={windSpeed} onChange={setWindSpeed} unit=" m/s" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: power > 60 ? 'var(--green)' : power > 30 ? 'var(--gold)' : 'var(--ink3)' }}>
          Güç: {power.toFixed(0)}% | RPM: {(windSpeed * 2.5).toFixed(1)}
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 14. SU / HİDROELEKTRİK ──────────────────────────────────────
export function WaterHydro({ kavram = 'Hidroelektrik / Su Döngüsü', aciklama }) {
  const canvasRef = useRef()
  const [flow, setFlow] = useState(60)
  const [height, setHeight] = useState(80)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)
  const particles = useRef([])

  useEffect(() => {
    particles.current = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 600, y: Math.random() * 100 + 20,
      vx: 0.5 + Math.random() * 0.5, vy: 0,
      phase: Math.random() * Math.PI * 2,
      size: 3 + Math.random() * 3,
    }))
  }, [])

  const power = ((flow / 100) * (height / 100) * 100).toFixed(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Gökyüzü
      ctx.fillStyle = '#eff6ff'; ctx.fillRect(0, 0, W, H * 0.15)

      // Bulut (buharlaşma)
      const clouds = [[80,30],[200,20],[350,35],[480,22]]
      clouds.forEach(([cx2, cy2]) => {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ;[[-20,0,18],[0,-8,22],[20,0,18],[38,-4,14]].forEach(([dx,dy,r]) => {
          ctx.beginPath(); ctx.arc(cx2+dx, cy2+dy, r, 0, Math.PI*2); ctx.fill()
        })
      })

      // Dağ
      ctx.fillStyle = '#6b7280'
      ctx.beginPath()
      ctx.moveTo(0, H); ctx.lineTo(0, H*0.45)
      ctx.lineTo(W*0.2, H*0.18); ctx.lineTo(W*0.35, H*0.38)
      ctx.lineTo(W*0.15, H); ctx.closePath()
      ctx.fill()

      // Kar
      ctx.fillStyle = '#f1f5f9'
      ctx.beginPath()
      ctx.moveTo(W*0.2, H*0.18); ctx.lineTo(W*0.12, H*0.3)
      ctx.lineTo(W*0.28, H*0.3); ctx.closePath(); ctx.fill()

      // Yağmur damlacıkları (buharlaşma döngüsü)
      const rainAlpha = flow / 150
      for (let i = 0; i < 15; i++) {
        const rx = ((t * 60 + i * 40) % (W + 20)) - 10
        const ry = (t * 100 * (flow/100) + i * 25) % (H * 0.5)
        ctx.strokeStyle = `rgba(96,165,250,${rainAlpha})`
        ctx.lineWidth = 1.5; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 8); ctx.stroke()
      }

      // Rezervuar (üst)
      const resY = H * 0.28
      ctx.fillStyle = '#1d4ed8'
      ctx.beginPath()
      for (let x = W*0.3; x <= W*0.7; x++) {
        const wy = resY + Math.sin(x*0.08 + t*2) * 3 * (flow/100)
        x === W*0.3 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy)
      }
      ctx.lineTo(W*0.7, H*0.42); ctx.lineTo(W*0.3, H*0.42); ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(147,197,253,0.4)'
      ctx.fillRect(W*0.3, resY, W*0.4, 6)

      // Baraj
      ctx.fillStyle = '#374151'
      ctx.fillRect(W*0.65, H*0.3, 18, H*0.2)

      // Su kanalı (düşüş)
      const chX = W*0.655
      const chTopY = H*0.35
      const chBotY = H*0.6
      const chHeight = (height / 100) * (chBotY - chTopY)

      ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(chX, chTopY); ctx.lineTo(chX, chTopY + chHeight); ctx.stroke()

      // Düşen su partikülleri
      particles.current.forEach(p => {
        if (running) {
          p.y += (flow / 100) * 3 + 0.5
          p.x += Math.sin(p.phase + t) * 0.5
          if (p.y > chTopY + chHeight + 10) {
            p.y = chTopY; p.x = chX + (Math.random() - 0.5) * 10
          }
        }
        if (p.y > chTopY && p.y < chTopY + chHeight + 5) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (flow/100), 0, Math.PI*2)
          ctx.fillStyle = `rgba(96,165,250,0.7)`; ctx.fill()
        }
      })

      // Türbin
      const turbX = W*0.655, turbY = chTopY + chHeight
      ctx.save(); ctx.translate(turbX, turbY); ctx.rotate(t * (flow/100) * 4)
      ;[0, Math.PI/2, Math.PI, 3*Math.PI/2].forEach(a => {
        ctx.save(); ctx.rotate(a)
        ctx.fillStyle = '#374151'
        ctx.fillRect(-4, 0, 8, 18)
        ctx.restore()
      })
      ctx.restore()
      ctx.beginPath(); ctx.arc(turbX, turbY, 8, 0, Math.PI*2)
      ctx.fillStyle = '#6b7280'; ctx.fill()

      // Alt nehir
      const riverY = H * 0.72
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(W*0.4, riverY)
      for (let x = W*0.4; x <= W; x++) {
        ctx.lineTo(x, riverY + Math.sin(x*0.04 - t*3) * 4 * (flow/100))
      }
      ctx.lineTo(W, riverY + 20); ctx.lineTo(W*0.4, riverY + 20); ctx.closePath()
      ctx.fill()

      // Zemin
      ctx.fillStyle = '#d1fae5'; ctx.fillRect(0, H*0.82, W, H*0.18)
      ctx.fillStyle = '#4ade80'; ctx.fillRect(W*0.4, H*0.72, W*0.6, H*0.1)

      // Güç
      ctx.fillStyle = 'rgba(255,255,255,0.93)'
      ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(8, H*0.6, 145, 80)
      ctx.strokeRect(8, H*0.6, 145, 80)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText(`Akış: ${flow}%  Yükseklik: ${height}%`, 12, H*0.6+16)
      ctx.fillText(`P = ρghQ`, 12, H*0.6+30)
      ctx.fillStyle = '#1a1814'; ctx.font = 'bold 22px JetBrains Mono, monospace'
      ctx.fillText(`${power}%`, 12, H*0.6+60)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono, monospace'
      ctx.fillText('Güç çıkışı', 12, H*0.6+74)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [flow, height, running, power])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <span style={S.badge}>P = ρghQ</span>
      </div>
      <canvas ref={canvasRef} width={600} height={320} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Su akışı" min={10} max={100} step={1} value={flow} onChange={setFlow} unit="%" />
        <Ctrl label="Düşüş yüksekliği" min={10} max={100} step={1} value={height} onChange={setHeight} unit="%" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--blue)' }}>
          Güç: {power}%
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 15. HÜCRE BÖLÜNMESİ (MİTOZ) ────────────────────────────────
export function CellDivision({ kavram = 'Mitoz Bölünme', aciklama }) {
  const canvasRef = useRef()
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const phases = ['İnterfaz', 'Profaz', 'Metafaz', 'Anafaz', 'Telofaz', 'Sitokinez']
    const phaseDur = 80

    function drawCell(cx, cy, rx, ry, color, alpha = 1) {
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = '#1e40af'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'
      ctx.fillRect(0, 0, W, H)
      const t = tRef.current * speed
      const totalCycle = phases.length * phaseDur
      const cycleT = t % totalCycle
      const phaseIdx = Math.floor(cycleT / phaseDur)
      const phaseT = (cycleT % phaseDur) / phaseDur
      const cx = W / 2, cy = H / 2

      if (phaseIdx === 0) {
        // İnterfaz - normal hücre, DNA kopyalanıyor
        drawCell(cx, cy, 90, 70, 'rgba(219,234,254,0.8)')
        // Çekirdek
        ctx.beginPath(); ctx.ellipse(cx, cy, 35, 28, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(147,197,253,0.6)'; ctx.fill()
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5; ctx.stroke()
        // DNA spiral
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 0.5
          ctx.beginPath()
          ctx.arc(cx + Math.cos(a) * 12, cy + Math.sin(a) * 10, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#1d4ed8'; ctx.fill()
        }
      } else if (phaseIdx === 1) {
        // Profaz - kromozomlar belirginleşiyor
        drawCell(cx, cy, 90 + phaseT * 10, 70, 'rgba(219,234,254,0.8)')
        const chromCount = 6
        for (let i = 0; i < chromCount; i++) {
          const a = (i / chromCount) * Math.PI * 2 + phaseT * Math.PI
          const r = 20 + phaseT * 15
          ctx.beginPath()
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6, 0, Math.PI * 2)
          ctx.fillStyle = `hsl(${220 + i * 20}, 70%, 50%)`; ctx.fill()
        }
      } else if (phaseIdx === 2) {
        // Metafaz - kromozomlar ortada hizalanmış
        drawCell(cx, cy, 100, 70, 'rgba(219,234,254,0.8)')
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(cx, cy - 60); ctx.lineTo(cx, cy + 60); ctx.stroke()
        ctx.setLineDash([])
        const chromCount = 6
        for (let i = 0; i < chromCount; i++) {
          const y = cy - 40 + i * 14
          ctx.beginPath()
          ctx.ellipse(cx, y, 10, 5, 0, 0, Math.PI * 2)
          ctx.fillStyle = `hsl(${220 + i * 20}, 70%, 50%)`; ctx.fill()
        }
      } else if (phaseIdx === 3) {
        // Anafaz - kromozomlar ayrılıyor
        drawCell(cx, cy, 110, 65, 'rgba(219,234,254,0.8)')
        const sep = phaseT * 40
        const chromCount = 6
        for (let i = 0; i < chromCount; i++) {
          const y = cy - 20 + i * 8
          ;[-1, 1].forEach(dir => {
            ctx.beginPath()
            ctx.ellipse(cx + dir * sep, y, 8, 4, 0, 0, Math.PI * 2)
            ctx.fillStyle = `hsl(${220 + i * 20}, 70%, 50%)`; ctx.fill()
          })
        }
      } else if (phaseIdx === 4) {
        // Telofaz - iki çekirdek oluşuyor
        const sep = 40 + phaseT * 20
        drawCell(cx, cy, 110, 60, 'rgba(219,234,254,0.6)')
        ;[-1, 1].forEach(dir => {
          ctx.beginPath()
          ctx.ellipse(cx + dir * sep, cy, 28, 22, 0, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(147,197,253,0.5)'; ctx.fill()
          ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.stroke()
        })
      } else {
        // Sitokinez - hücre ikiye bölünüyor
        const pinch = phaseT
        ;[-1, 1].forEach(dir => {
          const offx = dir * (20 + pinch * 55)
          drawCell(cx + offx, cy, 55 + pinch * 15, 55 - pinch * 10, 'rgba(219,234,254,0.85)')
          ctx.beginPath()
          ctx.ellipse(cx + offx, cy, 20, 16, 0, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(147,197,253,0.5)'; ctx.fill()
        })
        // Boğulma çizgisi
        if (pinch < 0.8) {
          ctx.strokeStyle = '#1e40af'; ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(cx, cy - 30 * (1 - pinch))
          ctx.lineTo(cx, cy + 30 * (1 - pinch))
          ctx.stroke()
        }
      }

      // Faz etiketi
      ctx.fillStyle = '#1e40af'
      ctx.font = 'bold 14px Lora, Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText(phases[phaseIdx], cx, 28)
      ctx.fillStyle = '#6b6560'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.fillText(`${Math.floor(phaseT * 100)}%`, cx, 44)

      // Faz göstergesi
      phases.forEach((p, i) => {
        const px = 30 + i * (W - 60) / (phases.length - 1)
        ctx.beginPath(); ctx.arc(px, H - 20, i === phaseIdx ? 6 : 4, 0, Math.PI * 2)
        ctx.fillStyle = i === phaseIdx ? '#3d5af1' : '#c7cdfa'; ctx.fill()
        ctx.fillStyle = i === phaseIdx ? '#3d5af1' : '#a09990'
        ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'
        ctx.fillText(p.slice(0, 3), px, H - 6)
      })

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [speed, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>6 Faz</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Hız" min={0.2} max={4} value={speed} onChange={setSpeed} unit="x" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 16. KAN DOLAŞIMI ─────────────────────────────────────────────
export function BloodCirculation({ kavram = 'Kan Dolaşımı', aciklama }) {
  const canvasRef = useRef()
  const [heartRate, setHeartRate] = useState(70)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const particles = Array.from({ length: 25 }, (_, i) => ({
      t: i / 25, path: Math.random() > 0.5 ? 'pulm' : 'sys'
    }))

    function heartbeat(t, bpm) {
      const period = 60 / bpm
      const phase = (t % period) / period
      if (phase < 0.1) return 1 + Math.sin(phase / 0.1 * Math.PI) * 0.15
      if (phase < 0.2) return 1 + Math.sin((phase - 0.1) / 0.1 * Math.PI) * 0.1
      return 1
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current
      const scale = heartbeat(t, heartRate)
      const cx = W / 2, cy = H / 2

      // Akciğerler
      ;[[-1, 1]].forEach(sides => sides.forEach(dir => {
        const lx = cx + dir * 120, ly = cy - 30
        ctx.beginPath()
        ctx.ellipse(lx, ly, 45, 55, dir * 0.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(252,165,165,0.3)'
        ctx.fill(); ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke()
        ctx.fillStyle = '#ef4444'; ctx.font = '11px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(dir > 0 ? 'Sağ\nAkciğer' : 'Sol\nAkciğer', lx, ly)
      }))

      // Kalp
      ctx.save()
      ctx.translate(cx, cy + 30)
      ctx.scale(scale, scale)
      ctx.beginPath()
      ctx.moveTo(0, 15)
      ctx.bezierCurveTo(0, 5, -30, -15, -30, -5)
      ctx.bezierCurveTo(-30, -20, -10, -25, 0, -10)
      ctx.bezierCurveTo(10, -25, 30, -20, 30, -5)
      ctx.bezierCurveTo(30, -15, 0, 5, 0, 15)
      const hg = ctx.createRadialGradient(-8, -8, 2, 0, 0, 30)
      hg.addColorStop(0, '#f87171'); hg.addColorStop(1, '#dc2626')
      ctx.fillStyle = hg; ctx.fill()
      ctx.restore()

      // Damlar (basit)
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.lineCap = 'round'
      // Pulmoner - mavi (oksijensiz)
      ctx.beginPath()
      ctx.moveTo(cx - 18, cy + 10)
      ctx.quadraticCurveTo(cx - 80, cy - 30, cx - 90, cy - 50)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + 18, cy + 10)
      ctx.quadraticCurveTo(cx + 80, cy - 30, cx + 90, cy - 50)
      ctx.stroke()

      ctx.strokeStyle = '#ef4444'
      // Pulmoner geri dön - kırmızı (oksijenli)
      ctx.beginPath()
      ctx.moveTo(cx - 75, cy - 70)
      ctx.quadraticCurveTo(cx - 40, cy - 80, cx - 15, cy + 5)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + 75, cy - 70)
      ctx.quadraticCurveTo(cx + 40, cy - 80, cx + 15, cy + 5)
      ctx.stroke()

      // Sistemik
      ctx.strokeStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(cx, cy + 45)
      ctx.quadraticCurveTo(cx - 160, cy + 60, cx - 160, cy + 120)
      ctx.quadraticCurveTo(cx - 160, cy + 160, cx, cy + 170)
      ctx.stroke()

      ctx.strokeStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(cx, cy + 170)
      ctx.quadraticCurveTo(cx + 160, cy + 160, cx + 160, cy + 100)
      ctx.quadraticCurveTo(cx + 160, cy + 60, cx, cy + 45)
      ctx.stroke()

      // Partiküller (kan hücreleri)
      particles.forEach(p => {
        p.t = (p.t + 0.004 * (heartRate / 70)) % 1
        let px, py, color
        if (p.path === 'pulm') {
          if (p.t < 0.5) {
            const pt = p.t / 0.5
            const side = p.t < 0.25 ? -1 : 1
            px = cx + side * 18 + Math.sin(pt * Math.PI) * side * 72
            py = cy + 10 - Math.sin(pt * Math.PI) * 60
            color = '#3b82f6'
          } else {
            const pt = (p.t - 0.5) / 0.5
            const side = p.t < 0.75 ? -1 : 1
            px = cx + side * 75 - Math.sin(pt * Math.PI) * side * 60
            py = cy - 70 + Math.sin(pt * Math.PI) * 75
            color = '#ef4444'
          }
        } else {
          if (p.t < 0.5) {
            const pt = p.t / 0.5
            px = cx - Math.sin(pt * Math.PI * 2) * 160
            py = cy + 45 + Math.sin(pt * Math.PI) * 125
            color = '#ef4444'
          } else {
            const pt = (p.t - 0.5) / 0.5
            px = cx + Math.sin(pt * Math.PI * 2) * 160
            py = cy + 170 - Math.sin(pt * Math.PI) * 125
            color = '#3b82f6'
          }
        }
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fillStyle = color; ctx.fill()
      })

      // BPM
      ctx.fillStyle = '#dc2626'; ctx.font = 'bold 16px JetBrains Mono'
      ctx.textAlign = 'left'
      ctx.fillText(`♥ ${heartRate} bpm`, 10, 24)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
      ctx.fillText('● Oksijenli  ● Oksijensiz', 10, 42)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [heartRate, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>Çift Dolaşım</span></div>
      <canvas ref={canvasRef} width={600} height={310} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Kalp hızı" min={40} max={180} step={1} value={heartRate} onChange={setHeartRate} unit=" bpm" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 17. LENS VE KIRILMA ──────────────────────────────────────────
export function LensRefraction({ kavram = 'Lens ve Işık Kırılması', aciklama }) {
  const canvasRef = useRef()
  const [focalLen, setFocalLen] = useState(120)
  const [objDist, setObjDist] = useState(200)
  const [lensType, setLensType] = useState('convex')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const f = lensType === 'convex' ? focalLen : -focalLen
    const imgDist = 1 / (1 / f - 1 / (-objDist)) // 1/v = 1/f - 1/u (ayna)
    const magnif = -imgDist / (-objDist)

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

    // Optik eksen
    ctx.strokeStyle = '#d4cfc8'; ctx.lineWidth = 1; ctx.setLineDash([6, 6])
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    ctx.setLineDash([])

    // Mercek
    const lx = cx
    if (lensType === 'convex') {
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(lx, cy - 80); ctx.lineTo(lx, cy + 80); ctx.stroke()
      // Çift ok
      ;[-80, 80].forEach(dy => {
        const dir = dy > 0 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(lx, cy + dy)
        ctx.lineTo(lx - 8, cy + dy - dir * 12)
        ctx.lineTo(lx + 8, cy + dy - dir * 12)
        ctx.closePath(); ctx.fillStyle = '#3b82f6'; ctx.fill()
      })
    } else {
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(lx, cy - 80); ctx.lineTo(lx, cy + 80); ctx.stroke()
      ;[-80, 80].forEach(dy => {
        const dir = dy > 0 ? -1 : 1
        ctx.beginPath()
        ctx.moveTo(lx, cy + dy)
        ctx.lineTo(lx - 8, cy + dy - dir * 12)
        ctx.lineTo(lx + 8, cy + dy - dir * 12)
        ctx.closePath(); ctx.fillStyle = '#ef4444'; ctx.fill()
      })
    }

    // Odak noktaları
    ;[-f, f].forEach(fd => {
      ctx.beginPath(); ctx.arc(lx + fd, cy, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#f59e0b'; ctx.fill()
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
      ctx.textAlign = 'center'; ctx.fillText('F', lx + fd, cy + 16)
    })

    // Nesne
    const ox = cx - objDist
    const objH = 50
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - objH); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(ox, cy - objH); ctx.lineTo(ox - 8, cy - objH + 12); ctx.lineTo(ox + 8, cy - objH + 12); ctx.closePath()
    ctx.fillStyle = '#10b981'; ctx.fill()
    ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
    ctx.textAlign = 'center'; ctx.fillText('Nesne', ox, cy + 16)

    // Görüntü
    if (isFinite(imgDist) && Math.abs(imgDist) < W) {
      const ix = lx + imgDist
      const imgH = objH * magnif
      ctx.strokeStyle = imgDist > 0 ? '#7c3aed' : 'rgba(124,58,237,0.4)'
      ctx.lineWidth = 2; ctx.setLineDash(imgDist < 0 ? [4, 4] : [])
      ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, cy - imgH); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#6b6560'; ctx.fillText(`Görüntü\n${imgDist.toFixed(0)}px`, ix, cy + 16)
    }

    // Işık ışınları
    const rays = [
      { color: '#f59e0b', startY: cy - objH },
      { color: '#3b82f6', startY: cy - objH * 0.6 },
      { color: '#ef4444', startY: cy - objH * 0.3 },
    ]
    rays.forEach(({ color, startY }) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.moveTo(ox, startY); ctx.lineTo(lx, startY); ctx.stroke()
      if (isFinite(imgDist)) {
        const ix = lx + imgDist, iy = cy - (startY - cy) * magnif
        ctx.beginPath(); ctx.moveTo(lx, startY); ctx.lineTo(ix, iy); ctx.stroke()
      }
      ctx.globalAlpha = 1
    })

    // Bilgi
    ctx.fillStyle = '#1a1814'; ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'left'
    const info = [
      `f = ${f.toFixed(0)} px`,
      `d_o = ${objDist} px`,
      `d_i = ${imgDist.toFixed(0)} px`,
      `m = ${magnif.toFixed(2)}x`,
      isFinite(imgDist) && imgDist > 0 ? 'Gerçek görüntü' : 'Sanal görüntü',
    ]
    ctx.fillStyle = 'rgba(247,245,240,0.93)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    ctx.fillRect(W - 140, 10, 130, info.length * 17 + 10)
    ctx.strokeRect(W - 140, 10, 130, info.length * 17 + 10)
    info.forEach((line, i) => {
      ctx.fillStyle = '#3d5af1'; ctx.fillText(line, W - 134, 24 + i * 17)
    })
  }, [focalLen, objDist, lensType])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>1/f = 1/d_o + 1/d_i</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Mercek tipi</div>
          <select value={lensType} onChange={e => setLensType(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            <option value="convex">Konveks (yakınsak)</option>
            <option value="concave">Konkav (ıraksak)</option>
          </select>
        </div>
        <Ctrl label="Odak uzaklığı f" min={50} max={200} step={5} value={focalLen} onChange={setFocalLen} unit=" px" />
        <Ctrl label="Nesne uzaklığı" min={60} max={260} step={5} value={objDist} onChange={setObjDist} unit=" px" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 18. ELASTİK ÇARPIŞMA ─────────────────────────────────────────
export function Collision({ kavram = 'Çarpışma', aciklama }) {
  const canvasRef = useRef()
  const [m1, setM1] = useState(2)
  const [m2, setM2] = useState(1)
  const [v1, setV1] = useState(5)
  const [elastic, setElastic] = useState(true)
  const [running, setRunning] = useState(false)
  const rafRef = useRef()
  const stateRef = useRef(null)

  function reset() {
    const e = elastic ? 1 : 0.3
    stateRef.current = {
      b1: { x: 100, y: 0, r: 15 + m1 * 8, vx: v1 * 20, m: m1 },
      b2: { x: 450, y: 0, r: 15 + m2 * 8, vx: 0, m: m2 },
      collided: false, e,
    }
    setRunning(false)
  }

  useEffect(() => { reset() }, [m1, m2, v1, elastic])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cy = H / 2

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

      // Zemin
      ctx.fillStyle = '#f0ece6'; ctx.fillRect(0, cy + 30, W, H - cy - 30)
      ctx.strokeStyle = '#d4cfc8'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, cy + 30); ctx.lineTo(W, cy + 30); ctx.stroke()

      if (!stateRef.current) return
      const { b1, b2 } = stateRef.current

      if (running) {
        b1.x += b1.vx * 0.016
        b2.x += b2.vx * 0.016

        const dist = Math.abs(b1.x - b2.x)
        if (!stateRef.current.collided && dist < b1.r + b2.r) {
          stateRef.current.collided = true
          const e = stateRef.current.e
          const u1 = b1.vx, u2 = b2.vx
          const M = b1.m + b2.m
          b1.vx = ((b1.m - e * b2.m) * u1 + (1 + e) * b2.m * u2) / M
          b2.vx = ((b2.m - e * b1.m) * u2 + (1 + e) * b1.m * u1) / M
        }

        if (b1.x < b1.r || b1.x > W - b1.r) b1.vx *= -1
        if (b2.x < b2.r || b2.x > W - b2.r) b2.vx *= -1
      }

      // Toplar
      ;[b1, b2].forEach((b, i) => {
        const grad = ctx.createRadialGradient(b.x - b.r * 0.3, cy - b.r * 0.3, b.r * 0.1, b.x, cy, b.r)
        grad.addColorStop(0, i === 0 ? '#93c5fd' : '#86efac')
        grad.addColorStop(1, i === 0 ? '#3d5af1' : '#10b981')
        ctx.beginPath(); ctx.arc(b.x, cy, b.r, 0, Math.PI * 2)
        ctx.fillStyle = grad; ctx.fill()
        ctx.strokeStyle = i === 0 ? '#2d49e0' : '#059669'; ctx.lineWidth = 1.5; ctx.stroke()

        // Hız oku
        if (Math.abs(b.vx) > 0.5) {
          const arrowLen = b.vx * 2
          ctx.strokeStyle = i === 0 ? '#3d5af1' : '#10b981'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(b.x, cy - b.r - 8); ctx.lineTo(b.x + arrowLen, cy - b.r - 8); ctx.stroke()
          ctx.beginPath()
          const dir = arrowLen > 0 ? 1 : -1
          ctx.moveTo(b.x + arrowLen, cy - b.r - 8)
          ctx.lineTo(b.x + arrowLen - dir * 8, cy - b.r - 14)
          ctx.lineTo(b.x + arrowLen - dir * 8, cy - b.r - 2)
          ctx.closePath(); ctx.fill()
        }

        ctx.fillStyle = 'white'; ctx.font = 'bold 10px Inter'; ctx.textAlign = 'center'
        ctx.fillText(`m=${b.m}`, b.x, cy + 4)
      })

      // Bilgi
      ctx.fillStyle = '#1a1814'; ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'left'
      const p_before = m1 * v1, p_after = b1.m * b1.vx + b2.m * b2.vx
      const ke_before = 0.5 * m1 * v1 * v1
      const ke_after = 0.5 * b1.m * (b1.vx/20) * (b1.vx/20) + 0.5 * b2.m * (b2.vx/20) * (b2.vx/20)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
      ctx.fillText(`p = ${p_after.toFixed(1)} kg·m/s`, 8, 20)
      ctx.fillText(`${elastic ? 'Elastik' : 'Esnek olmayan'}`, 8, 36)

      if (running) rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, m1, m2, v1, elastic])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>Momentum Korunumu</span></div>
      <canvas ref={canvasRef} width={600} height={200} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Kütle m₁" min={1} max={5} step={0.5} value={m1} onChange={setM1} unit=" kg" />
        <Ctrl label="Kütle m₂" min={1} max={5} step={0.5} value={m2} onChange={setM2} unit=" kg" />
        <Ctrl label="Hız v₁" min={1} max={10} step={0.5} value={v1} onChange={setV1} unit=" m/s" />
        <div>
          <div style={S.label}>Çarpışma tipi</div>
          <select value={elastic ? 'elastic' : 'inelastic'} onChange={e => setElastic(e.target.value === 'elastic')}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            <option value="elastic">Elastik</option>
            <option value="inelastic">Esnek olmayan</option>
          </select>
        </div>
        <button style={S.btn} onClick={() => { reset(); setTimeout(() => setRunning(true), 50) }}>▶ Başlat</button>
        <button style={S.btn} onClick={reset}>↺ Sıfırla</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 19. TÜREv GEOMETRİK ANLAM ────────────────────────────────────
export function Derivative({ kavram = 'Türev - Geometrik Anlam', aciklama }) {
  const canvasRef = useRef()
  const [xVal, setXVal] = useState(1)
  const [funcIdx, setFuncIdx] = useState(0)

  const funcs = [
    { label: 'x²', fn: x => x * x, deriv: x => 2 * x },
    { label: 'x³', fn: x => x * x * x * 0.5, deriv: x => 1.5 * x * x },
    { label: 'sin(x)', fn: x => Math.sin(x) * 2, deriv: x => Math.cos(x) * 2 },
    { label: 'e^(0.5x)', fn: x => Math.exp(x * 0.5) * 0.8, deriv: x => 0.5 * Math.exp(x * 0.5) * 0.8 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const scale = 50

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    for (let x = cx % scale; x < W; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = cy % scale; y < H; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Eksenler
    ctx.strokeStyle = '#a09990'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()

    const { fn, deriv } = funcs[funcIdx]

    // Fonksiyon
    ctx.strokeStyle = '#3d5af1'; ctx.lineWidth = 2.5
    ctx.beginPath()
    let first = true
    for (let px = 0; px <= W; px++) {
      const x = (px - cx) / scale
      const y = cy - fn(x) * scale
      if (!isFinite(y) || Math.abs(y - cy) > H) { first = true; continue }
      first ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
      first = false
    }
    ctx.stroke()

    // Teğet noktası
    const x0 = xVal
    const y0 = fn(x0)
    const slope = deriv(x0)
    const px0 = cx + x0 * scale
    const py0 = cy - y0 * scale

    // Teğet çizgisi
    const tx1 = -3, tx2 = 3
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(cx + tx1 * scale, cy - (y0 + slope * (tx1 - x0)) * scale)
    ctx.lineTo(cx + tx2 * scale, cy - (y0 + slope * (tx2 - x0)) * scale)
    ctx.stroke()

    // Nokta
    ctx.shadowColor = 'rgba(239,68,68,0.4)'; ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(px0, py0, 7, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'; ctx.fill()
    ctx.shadowBlur = 0

    // Dikey/yatay yardım çizgileri
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1; ctx.setLineDash([4, 6])
    ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(cx, py0); ctx.stroke()
    ctx.setLineDash([])

    // Bilgi kutusu
    ctx.fillStyle = 'rgba(247,245,240,0.95)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    ctx.fillRect(8, 8, 180, 70); ctx.strokeRect(8, 8, 180, 70)
    ctx.fillStyle = '#3d5af1'; ctx.font = '11px JetBrains Mono'
    ctx.fillText(`f(x) = ${funcs[funcIdx].label}`, 14, 24)
    ctx.fillText(`x₀ = ${x0.toFixed(2)}`, 14, 40)
    ctx.fillStyle = '#ef4444'
    ctx.fillText(`f'(x₀) = ${slope.toFixed(3)}`, 14, 56)
    ctx.fillText(`Eğim = ${slope.toFixed(3)}`, 14, 70)
  }, [xVal, funcIdx])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>f'(x) = lim Δf/Δx</span></div>
      <canvas ref={canvasRef} width={600} height={320} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Fonksiyon</div>
          <select value={funcIdx} onChange={e => setFuncIdx(+e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            {funcs.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        <Ctrl label="x₀ noktası" min={-3} max={3} step={0.05} value={xVal} onChange={setXVal} unit="" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 20. SERA ETKİSİ ──────────────────────────────────────────────
export function GreenhouseEffect({ kavram = 'Sera Etkisi', aciklama }) {
  const canvasRef = useRef()
  const [co2Level, setCo2Level] = useState(50)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const temp = (15 + co2Level * 0.3).toFixed(1)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const photons = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * W, y: -20 - Math.random() * 100,
      type: 'solar', speed: 1.5 + Math.random(),
      absorbed: false, bounced: false,
    }))

    const infrared = []

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Gökyüzü gradient
      const tempColor = Math.min(255, 150 + co2Level)
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65)
      sky.addColorStop(0, `rgb(30, ${100 - co2Level * 0.3}, ${200 - co2Level})`)
      sky.addColorStop(1, `rgb(${100 + co2Level}, ${150 - co2Level * 0.5}, ${180 - co2Level})`)
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

      // Zemin
      const ground = ctx.createLinearGradient(0, H * 0.65, 0, H)
      ground.addColorStop(0, `rgb(${80 + co2Level * 0.5}, ${120 - co2Level * 0.3}, 60)`)
      ground.addColorStop(1, `rgb(${60 + co2Level * 0.3}, 90, 40)`)
      ctx.fillStyle = ground; ctx.fillRect(0, H * 0.65, W, H * 0.35)

      // Atmosfer katmanları
      for (let i = 0; i < 3; i++) {
        const layerY = H * 0.15 + i * H * 0.12
        const alpha = (co2Level / 100) * 0.12
        ctx.fillStyle = `rgba(100, 200, 100, ${alpha})`
        ctx.fillRect(0, layerY, W, H * 0.1)
        ctx.fillStyle = `rgba(100, 200, 100, ${alpha * 0.5})`
        ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'left'
        ctx.fillText(`CO₂ katmanı ${i + 1}`, 8, layerY + 14)
      }

      // Güneş
      ctx.save(); ctx.translate(W * 0.85, H * 0.08); ctx.rotate(t * 0.2)
      ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 2
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18)
        ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.stroke()
      }
      ctx.restore()
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.08, 16, 0, Math.PI * 2)
      ctx.fillStyle = '#fef08a'; ctx.fill()

      // Fotonlar
      photons.forEach(p => {
        if (running) {
          if (!p.absorbed && !p.bounced) {
            p.y += p.speed
            if (p.y > H * 0.65) {
              p.absorbed = true
              infrared.push({ x: p.x, y: H * 0.65, vy: -1.2, vx: (Math.random() - 0.5) * 0.8 })
            }
          }
          if (p.absorbed && Math.random() < 0.01) {
            p.x = Math.random() * W; p.y = -20; p.absorbed = false; p.bounced = false
          }
        }
        if (!p.absorbed && !p.bounced) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
          ctx.fillStyle = '#fef08a'; ctx.fill()
        }
      })

      // Kızılötesi fotonlar
      for (let i = infrared.length - 1; i >= 0; i--) {
        const ir = infrared[i]
        if (running) {
          ir.y += ir.vy; ir.x += ir.vx
          // CO2 tarafından yansıtılma
          const layerY = H * 0.3
          if (ir.y < layerY && Math.random() < co2Level / 100 * 0.15) {
            ir.vy = Math.abs(ir.vy)
          }
          if (ir.y < 0 || ir.y > H || ir.x < 0 || ir.x > W) {
            infrared.splice(i, 1); continue
          }
        }
        ctx.beginPath(); ctx.arc(ir.x, ir.y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#f87171'; ctx.fill()
      }

      // Sıcaklık göstergesi
      ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(10, 10, 150, 65); ctx.strokeRect(10, 10, 150, 65)
      ctx.fillStyle = '#dc2626'; ctx.font = 'bold 18px JetBrains Mono'
      ctx.fillText(`${temp}°C`, 18, 38)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
      ctx.fillText(`CO₂: ${co2Level} ppm`, 18, 54)
      ctx.fillText(co2Level > 60 ? '⚠ Yüksek!' : '✓ Normal', 18, 68)

      // Legend
      ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(W - 100, H - 40, 5, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left'
      ctx.fillText('Güneş ışını', W - 90, H - 36)
      ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(W - 100, H - 22, 5, 0, Math.PI*2); ctx.fill()
      ctx.fillText('Kızılötesi', W - 90, H - 18)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [co2Level, running, temp])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>İklim Değişikliği</span></div>
      <canvas ref={canvasRef} width={600} height={320} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="CO₂ seviyesi" min={10} max={100} step={1} value={co2Level} onChange={setCo2Level} unit=" ppm" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: co2Level > 60 ? 'var(--red)' : 'var(--green)' }}>
          Sıcaklık: {temp}°C
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 21. NÜKLEER FİSYON ───────────────────────────────────────────
export function NuclearFission({ kavram = 'Nükleer Fisyon', aciklama }) {
  const canvasRef = useRef()
  const [running, setRunning] = useState(true)
  const [chainReaction, setChainReaction] = useState(false)
  const rafRef = useRef()
  const tRef = useRef(0)
  const particlesRef = useRef([])
  const nucleiRef = useRef([])

  useEffect(() => {
    nucleiRef.current = [{ x: 300, y: 160, split: false, r: 22, t: 0 }]
    if (chainReaction) {
      nucleiRef.current = [
        { x: 200, y: 120, split: false, r: 20, t: 0 },
        { x: 380, y: 100, split: false, r: 20, t: 0 },
        { x: 300, y: 200, split: false, r: 20, t: 0 },
      ]
    }
    particlesRef.current = [{ x: 20, y: 160, vx: 3, vy: 0, type: 'neutron', r: 5 }]
    tRef.current = 0
  }, [chainReaction])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function drawNucleus(n) {
      if (n.exploding) {
        const age = n.explodeAge || 0
        const r = n.r + age * 3
        ctx.globalAlpha = Math.max(0, 1 - age / 20)
        const eg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r)
        eg.addColorStop(0, '#fef08a'); eg.addColorStop(0.5, '#f59e0b'); eg.addColorStop(1, 'transparent')
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = eg; ctx.fill()
        ctx.globalAlpha = 1
        return
      }
      const g = ctx.createRadialGradient(n.x - 5, n.y - 5, 2, n.x, n.y, n.r)
      g.addColorStop(0, '#a78bfa'); g.addColorStop(1, '#7c3aed')
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
      // Nükleon parçacıkları
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + (n.t || 0)
        const pr = n.r * 0.55
        ctx.beginPath(); ctx.arc(n.x + Math.cos(a) * pr, n.y + Math.sin(a) * pr, 4, 0, Math.PI * 2)
        ctx.fillStyle = i % 2 === 0 ? '#f87171' : '#60a5fa'; ctx.fill()
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#07090f'; ctx.fillRect(0, 0, W, H)

      // Yıldız arka plan
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137 + 50) % W, sy = (i * 97 + 30) % H
        ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.1})`; ctx.fill()
      }

      const t = tRef.current
      nucleiRef.current.forEach(n => { n.t = t * 0.05 })

      // Partiküller
      particlesRef.current.forEach((p, pi) => {
        if (running) {
          p.x += p.vx; p.y += p.vy
          // Çekirdekle çarpışma
          nucleiRef.current.forEach((n, ni) => {
            if (!n.split && !n.exploding) {
              const dist = Math.hypot(p.x - n.x, p.y - n.y)
              if (dist < n.r + p.r) {
                n.split = true; n.exploding = true; n.explodeAge = 0
                particlesRef.current.splice(pi, 1)
                // Yeni nötronlar
                for (let k = 0; k < 3; k++) {
                  const a = (k / 3) * Math.PI * 2
                  particlesRef.current.push({ x: n.x, y: n.y, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, type: 'neutron', r: 5 })
                }
                // Enerji parçacıkları
                for (let k = 0; k < 8; k++) {
                  const a = Math.random() * Math.PI * 2
                  particlesRef.current.push({ x: n.x, y: n.y, vx: Math.cos(a) * (1 + Math.random() * 3), vy: Math.sin(a) * (1 + Math.random() * 3), type: 'energy', r: 4, life: 30 })
                }
              }
            }
          })
        }

        // Çiz
        if (p.type === 'neutron') {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = '#60a5fa'; ctx.fill()
          ctx.fillStyle = 'white'; ctx.font = 'bold 6px Inter'; ctx.textAlign = 'center'
          ctx.fillText('n', p.x, p.y + 2)
        } else {
          if (p.life !== undefined) p.life--
          if (p.life < 0) { particlesRef.current.splice(pi, 1); return }
          const alpha = (p.life || 30) / 30
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(251,191,36,${alpha})`; ctx.fill()
        }
      })

      // Çekirdekler
      nucleiRef.current.forEach(n => {
        if (n.exploding) {
          n.explodeAge = (n.explodeAge || 0) + 1
          if (n.explodeAge > 30) n.exploding = false
        }
        drawNucleus(n)
      })

      // Etiket
      ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 12px JetBrains Mono'
      ctx.textAlign = 'left'; ctx.fillText('²³⁵U + n → Fisyon + 3n + Enerji', 8, 20)
      ctx.fillStyle = '#60a5fa'; ctx.font = '10px JetBrains Mono'
      ctx.fillText(`E = Δm·c²`, 8, 36)

      if (running) { tRef.current += 1; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, chainReaction])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>E = Δm·c²</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{ ...S.canvas, width: '100%', background: '#07090f' }} />
      <div style={S.controls}>
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
        <button style={S.btn} onClick={() => { setChainReaction(false); setTimeout(() => setChainReaction(false), 10) }}>↺ Sıfırla</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input type="checkbox" checked={chainReaction} onChange={e => setChainReaction(e.target.checked)} id="chain" />
          <label htmlFor="chain" style={{ fontSize: '0.78rem', color: 'var(--ink2)', cursor: 'pointer' }}>Zincir reaksiyon</label>
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 22. ELEKTROMANYETİK DALGA ───────────────────────────────────
export function EMWave({ kavram = 'Elektromanyetik Dalga', aciklama }) {
  const canvasRef = useRef()
  const [freq, setFreq] = useState(1)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current

      // Z ekseni (yayılma yönü)
      ctx.strokeStyle = '#d4cfc8'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(W - 20, cy); ctx.stroke()
      ctx.fillStyle = '#a09990'; ctx.font = '11px JetBrains Mono'
      ctx.fillText('z (yayılma)', W - 80, cy - 6)

      // E alanı (dikey - mavi)
      ctx.strokeStyle = '#3d5af1'; ctx.lineWidth = 2.5
      ctx.beginPath()
      for (let x = 40; x < W - 20; x++) {
        const z = (x - 40) / (W - 60)
        const ey = cy - Math.sin(2 * Math.PI * freq * z - t * 2) * 60
        x === 40 ? ctx.moveTo(x, ey) : ctx.lineTo(x, ey)
      }
      ctx.stroke()

      // B alanı (yatay perspektif - yeşil, offset)
      ctx.strokeStyle = '#0f7a5a'; ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 40; x < W - 20; x++) {
        const z = (x - 40) / (W - 60)
        const bval = Math.sin(2 * Math.PI * freq * z - t * 2) * 35
        const bx = x + bval * 0.5
        const by = cy + bval * 0.8
        x === 40 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)
      }
      ctx.stroke()

      // Vektör okları
      for (let x = 40; x < W - 20; x += 60) {
        const z = (x - 40) / (W - 60)
        const ey = -Math.sin(2 * Math.PI * freq * z - t * 2) * 60
        if (Math.abs(ey) > 5) {
          ctx.strokeStyle = '#3d5af1'; ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + ey); ctx.stroke()
          ctx.beginPath()
          const dir = ey < 0 ? -1 : 1
          ctx.moveTo(x, cy + ey)
          ctx.lineTo(x - 4, cy + ey - dir * 8)
          ctx.lineTo(x + 4, cy + ey - dir * 8)
          ctx.closePath(); ctx.fillStyle = '#3d5af1'; ctx.fill()
        }
      }

      // Legend
      ctx.fillStyle = '#3d5af1'; ctx.font = 'bold 11px JetBrains Mono'
      ctx.fillText('E (elektrik alan)', 8, 20)
      ctx.fillStyle = '#0f7a5a'
      ctx.fillText('B (manyetik alan)', 8, 36)
      ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
      ctx.fillText(`f = ${freq} Hz | λ = ${(1/freq).toFixed(2)} m`, 8, 52)
      ctx.fillText('c = E × B yönü', 8, H - 10)

      if (running) { tRef.current += 0.025; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [freq, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>c = λf</span></div>
      <canvas ref={canvasRef} width={600} height={240} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Frekans" min={0.5} max={4} value={freq} onChange={setFreq} unit=" Hz" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 23. MANYETİK ALAN ÇİZGİLERİ ─────────────────────────────────
export function MagneticField({ kavram = 'Manyetik Alan', aciklama }) {
  const canvasRef = useRef()
  const [fieldType, setFieldType] = useState('dipole')
  const [strength, setStrength] = useState(50)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

    const scale = strength / 50

    function getBField(x, y) {
      if (fieldType === 'dipole') {
        const dx1 = x - (cx - 80), dy1 = y - cy
        const dx2 = x - (cx + 80), dy2 = y - cy
        const r1 = Math.hypot(dx1, dy1) || 0.1, r2 = Math.hypot(dx2, dy2) || 0.1
        const bx = dx1/(r1*r1*r1) - dx2/(r2*r2*r2)
        const by = dy1/(r1*r1*r1) - dy2/(r2*r2*r2)
        return { bx: bx * 2000 * scale, by: by * 2000 * scale }
      } else if (fieldType === 'uniform') {
        return { bx: scale * 2, by: 0 }
      } else {
        const dx = x - cx, dy = y - cy
        const r = Math.hypot(dx, dy) || 0.1
        return { bx: -dy / (r * r) * 5000 * scale, by: dx / (r * r) * 5000 * scale }
      }
    }

    // Alan çizgileri
    const lineColors = ['#3d5af1','#5b73f3','#7a8ef5','#3d5af1','#2d49e0']
    const startPoints = fieldType === 'dipole'
      ? Array.from({length: 16}, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return { x: cx - 80 + Math.cos(a) * 20, y: cy + Math.sin(a) * 20 }
        })
      : Array.from({length: 10}, (_, i) => ({
          x: fieldType === 'uniform' ? 20 : cx,
          y: 30 + i * (H - 60) / 9
        }))

    startPoints.forEach((sp, si) => {
      ctx.strokeStyle = lineColors[si % lineColors.length]
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      let x = sp.x, y = sp.y
      ctx.moveTo(x, y)
      for (let step = 0; step < 300; step++) {
        const { bx, by } = getBField(x, y)
        const mag = Math.hypot(bx, by) || 1
        x += bx / mag * 3
        y += by / mag * 3
        if (x < 0 || x > W || y < 0 || y > H) break
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    if (fieldType === 'dipole') {
      // Kuzey (kırmızı) ve Güney (mavi) kutuplar
      ;[['N', cx - 80, '#ef4444'], ['S', cx + 80, '#3d5af1']].forEach(([label, px, col]) => {
        ctx.beginPath(); ctx.arc(px, cy, 18, 0, Math.PI * 2)
        ctx.fillStyle = col; ctx.fill()
        ctx.fillStyle = 'white'; ctx.font = 'bold 13px Inter'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(label, px, cy)
      })
    } else if (fieldType === 'solenoid') {
      ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2)
      ctx.fillStyle = '#f59e0b'; ctx.fill()
      ctx.fillStyle = '#1a1814'; ctx.font = 'bold 10px Inter'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('I', cx, cy)
    }

    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
    ctx.fillText(`Alan tipi: ${fieldType} | Güç: ${strength}%`, 8, H - 10)
  }, [fieldType, strength])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>F = qv×B</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Alan tipi</div>
          <select value={fieldType} onChange={e => setFieldType(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            <option value="dipole">Mıknatıs (dipol)</option>
            <option value="uniform">Uniform alan</option>
            <option value="solenoid">Tel / solenoid</option>
          </select>
        </div>
        <Ctrl label="Güç" min={10} max={100} step={5} value={strength} onChange={setStrength} unit="%" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 24. SİNİR İLETİMİ / AKSİYON POTANSİYELİ ────────────────────
export function ActionPotential({ kavram = 'Aksiyon Potansiyeli', aciklama }) {
  const canvasRef = useRef()
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(1)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current * speed

      // Nöron gövdesi
      const neuronY = H * 0.35
      // Akson
      ctx.strokeStyle = '#d4cfc8'; ctx.lineWidth = 22; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(60, neuronY); ctx.lineTo(W - 40, neuronY); ctx.stroke()
      ctx.strokeStyle = '#f0ece6'; ctx.lineWidth = 18
      ctx.beginPath(); ctx.moveTo(60, neuronY); ctx.lineTo(W - 40, neuronY); ctx.stroke()

      // Miyelin kılıfları
      for (let i = 0; i < 7; i++) {
        const mx = 80 + i * 70
        ctx.fillStyle = '#fef9c3'
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.ellipse(mx + 25, neuronY, 28, 14, 0, 0, Math.PI * 2)
        ctx.fill(); ctx.stroke()
      }

      // Ranvier düğümleri (uyarı geçişi)
      const pulse = (t * 80) % (W - 100)
      for (let i = 0; i < 7; i++) {
        const nx = 80 + i * 70 + 50
        const dist = Math.abs(pulse - (nx - 60))
        const intensity = Math.max(0, 1 - dist / 40)
        if (intensity > 0) {
          ctx.beginPath(); ctx.arc(nx, neuronY, 8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239,68,68,${intensity})`; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(nx, neuronY, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'; ctx.fill()
        ctx.strokeStyle = '#d4cfc8'; ctx.lineWidth = 1; ctx.stroke()
      }

      // Soma (hücre gövdesi)
      const sg = ctx.createRadialGradient(52, neuronY - 5, 2, 55, neuronY, 22)
      sg.addColorStop(0, '#fde68a'); sg.addColorStop(1, '#f59e0b')
      ctx.beginPath(); ctx.arc(55, neuronY, 22, 0, Math.PI * 2)
      ctx.fillStyle = sg; ctx.fill()
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#78350f'; ctx.font = 'bold 9px Inter'
      ctx.textAlign = 'center'; ctx.fillText('Soma', 55, neuronY + 3)

      // Aksiyon potansiyeli grafiği (altta)
      const gx = 40, gy = H * 0.72, gw = W - 80, gh = 65
      ctx.fillStyle = '#f7f5f0'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(gx, gy - gh, gw, gh * 1.5)
      ctx.strokeRect(gx, gy - gh, gw, gh * 1.5)

      // Etiketler
      ctx.fillStyle = '#6b6560'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'left'
      ctx.fillText('+40mV', gx - 36, gy - gh + 8)
      ctx.fillText('  0mV', gx - 36, gy - gh / 2)
      ctx.fillText('-70mV', gx - 36, gy + 4)

      // Membran potansiyeli grafiği
      ctx.strokeStyle = '#3d5af1'; ctx.lineWidth = 2
      ctx.beginPath()
      for (let px = 0; px < gw; px++) {
        const xt = px / gw
        const phase = (xt - (t * 0.15) % 1 + 1) % 1
        let v
        if (phase < 0.1) v = -70 + phase / 0.1 * 110
        else if (phase < 0.2) v = 40 - (phase - 0.1) / 0.1 * 90
        else if (phase < 0.35) v = -50 - (phase - 0.2) / 0.15 * 25
        else v = -75 + (phase - 0.35) / 0.65 * 5
        const py = gy - (v + 70) / 110 * (gh * 1.4)
        px === 0 ? ctx.moveTo(gx + px, py) : ctx.lineTo(gx + px, py)
      }
      ctx.stroke()

      // Faz etiketleri
      const phases = [['Dinlenme', 0.05], ['Depolarizasyon', 0.15], ['Repolarizasyon', 0.28], ['Hiperpolar.', 0.42]]
      phases.forEach(([label, xf]) => {
        ctx.fillStyle = '#a09990'; ctx.font = '8px JetBrains Mono'; ctx.textAlign = 'center'
        ctx.fillText(label, gx + xf * gw, gy + gh * 0.6)
      })

      ctx.textAlign = 'left'
      ctx.fillStyle = '#3d5af1'; ctx.font = 'bold 11px JetBrains Mono'
      ctx.fillText('Aksiyon Potansiyeli', gx, gy - gh - 6)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, speed])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>-70mV → +40mV</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Hız" min={0.3} max={3} value={speed} onChange={setSpeed} unit="x" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 25. TERMODİNAMİK — GAZ MOLEKÜLLERİ ─────────────────────────
export function GasMolecules({ kavram = 'İdeal Gaz / Kinetik Teori', aciklama }) {
  const canvasRef = useRef()
  const [temp, setTemp] = useState(300)
  const [N, setN] = useState(40)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const particles = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const W = canvas.width, H = canvas.height * 0.75
    particles.current = Array.from({ length: N }, () => ({
      x: 20 + Math.random() * (W - 40),
      y: 20 + Math.random() * (H - 40),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      r: 6,
    }))
  }, [N])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const boxH = H * 0.72

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

      const speedFactor = Math.sqrt(temp / 300)

      // Kutu
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 2
      ctx.strokeRect(10, 10, W - 20, boxH - 10)
      ctx.fillStyle = 'rgba(239,246,255,0.3)'; ctx.fillRect(10, 10, W - 20, boxH - 10)

      // Partiküller
      particles.current.forEach(p => {
        if (running) {
          p.x += p.vx * speedFactor
          p.y += p.vy * speedFactor
          if (p.x < 10 + p.r || p.x > W - 10 - p.r) { p.vx *= -1; p.x = Math.max(10 + p.r, Math.min(W - 10 - p.r, p.x)) }
          if (p.y < 10 + p.r || p.y > boxH - 10 - p.r) { p.vy *= -1; p.y = Math.max(10 + p.r, Math.min(boxH - 10 - p.r, p.y)) }
        }
        const speed = Math.hypot(p.vx, p.vy) * speedFactor
        const hue = 240 - speed * 20
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.85)`; ctx.fill()
      })

      // Bilgi
      const P = (N * temp / 5000).toFixed(2)
      ctx.fillStyle = '#1a1814'; ctx.font = '11px JetBrains Mono'
      ctx.fillText(`T = ${temp} K  |  N = ${N}  |  P ∝ ${P}`, 16, H - 20)
      ctx.fillText(`PV = NkT`, 16, H - 6)

      // Termometre göstergesi
      const barH = boxH - 30
      const tRatio = (temp - 100) / 900
      ctx.fillStyle = '#e8e4dc'; ctx.fillRect(W - 28, 20, 14, barH)
      ctx.fillStyle = temp > 600 ? '#ef4444' : temp > 350 ? '#f59e0b' : '#3b82f6'
      ctx.fillRect(W - 28, 20 + barH * (1 - tRatio), 14, barH * tRatio)
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 1; ctx.strokeRect(W - 28, 20, 14, barH)
      ctx.fillStyle = '#6b6560'; ctx.font = '9px JetBrains Mono'
      ctx.textAlign = 'right'; ctx.fillText('1000K', W - 32, 26)
      ctx.fillText('100K', W - 32, boxH - 6)
      ctx.textAlign = 'left'

      if (running) rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [temp, N, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>PV = NkT</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Sıcaklık T" min={100} max={1000} step={10} value={temp} onChange={setTemp} unit=" K" />
        <Ctrl label="Molekül sayısı N" min={10} max={80} step={5} value={N} onChange={setN} unit="" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 26. DOPPLER ETKİSİ ───────────────────────────────────────────
export function DopplerEffect({ kavram = 'Doppler Etkisi', aciklama }) {
  const canvasRef = useRef()
  const [sourceSpeed, setSourceSpeed] = useState(0.4)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)
  const wavesRef = useRef([])
  const sourceRef = useRef({ x: 100 })

  useEffect(() => {
    wavesRef.current = []
    sourceRef.current = { x: 100 }
    tRef.current = 0
  }, [sourceSpeed])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cy = H / 2
    const soundSpeed = 120

    let lastWave = 0

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current

      if (running) {
        sourceRef.current.x += sourceSpeed * 2
        if (sourceRef.current.x > W + 20) sourceRef.current.x = -20

        if (t - lastWave > 0.4) {
          wavesRef.current.push({ cx: sourceRef.current.x, cy, r: 0 })
          lastWave = t
        }

        wavesRef.current.forEach(w => { w.r += soundSpeed * 0.016 })
        wavesRef.current = wavesRef.current.filter(w => w.r < W)
      }

      // Dalga daireleri
      wavesRef.current.forEach((w, i) => {
        ctx.beginPath(); ctx.arc(w.cx, w.cy, w.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(61,90,241,${0.6 - w.r / W * 0.5})`
        ctx.lineWidth = 1.5; ctx.stroke()
      })

      // Kaynak
      ctx.beginPath(); ctx.arc(sourceRef.current.x, cy, 14, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'; ctx.fill()
      ctx.fillStyle = 'white'; ctx.font = 'bold 9px Inter'
      ctx.textAlign = 'center'; ctx.fillText('🔊', sourceRef.current.x, cy + 3)

      // Gözlemciler
      ;[[60, '👂', 'Önde'], [W - 60, '👂', 'Arkada']].forEach(([ox, icon, label]) => {
        ctx.fillStyle = '#0f7a5a'; ctx.font = '20px serif'
        ctx.textAlign = 'center'; ctx.fillText(icon, ox, cy + 6)
        ctx.fillStyle = '#6b6560'; ctx.font = '9px JetBrains Mono'
        ctx.fillText(label, ox, cy + 24)
      })

      // Frekans hesabı
      const v = sourceSpeed * 100
      const fObs1 = (1 / (1 - v / soundSpeed)).toFixed(2)
      const fObs2 = (1 / (1 + v / soundSpeed)).toFixed(2)

      ctx.fillStyle = 'rgba(247,245,240,0.95)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(8, 8, 200, 55); ctx.strokeRect(8, 8, 200, 55)
      ctx.fillStyle = '#3d5af1'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left'
      ctx.fillText(`v_kaynak = ${v.toFixed(0)} m/s`, 14, 24)
      ctx.fillStyle = '#0f7a5a'; ctx.fillText(`f_önde = ${fObs1} f₀ (tiz)`, 14, 40)
      ctx.fillStyle = '#b45309'; ctx.fillText(`f_arkada = ${fObs2} f₀ (pes)`, 14, 56)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [sourceSpeed, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>f' = f·(v±v_o)/(v∓v_s)</span></div>
      <canvas ref={canvasRef} width={600} height={240} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Kaynak hızı" min={0} max={0.9} step={0.05} value={sourceSpeed} onChange={setSourceSpeed} unit="×c_ses" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 27. PERİYODİK TABLO ─────────────────────────────────────────
export function PeriodicTable({ kavram = 'Periyodik Tablo', aciklama }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const elements = [
    {n:1,sym:'H',name:'Hidrojen',mass:1.008,cat:'nonmetal',period:1,group:1},
    {n:2,sym:'He',name:'Helyum',mass:4.003,cat:'noble',period:1,group:18},
    {n:3,sym:'Li',name:'Lityum',mass:6.941,cat:'alkali',period:2,group:1},
    {n:4,sym:'Be',name:'Berilyum',mass:9.012,cat:'alkaline',period:2,group:2},
    {n:5,sym:'B',name:'Bor',mass:10.81,cat:'metalloid',period:2,group:13},
    {n:6,sym:'C',name:'Karbon',mass:12.011,cat:'nonmetal',period:2,group:14},
    {n:7,sym:'N',name:'Azot',mass:14.007,cat:'nonmetal',period:2,group:15},
    {n:8,sym:'O',name:'Oksijen',mass:15.999,cat:'nonmetal',period:2,group:16},
    {n:9,sym:'F',name:'Flor',mass:18.998,cat:'halogen',period:2,group:17},
    {n:10,sym:'Ne',name:'Neon',mass:20.18,cat:'noble',period:2,group:18},
    {n:11,sym:'Na',name:'Sodyum',mass:22.99,cat:'alkali',period:3,group:1},
    {n:12,sym:'Mg',name:'Magnezyum',mass:24.305,cat:'alkaline',period:3,group:2},
    {n:13,sym:'Al',name:'Alüminyum',mass:26.982,cat:'metal',period:3,group:13},
    {n:14,sym:'Si',name:'Silisyum',mass:28.086,cat:'metalloid',period:3,group:14},
    {n:15,sym:'P',name:'Fosfor',mass:30.974,cat:'nonmetal',period:3,group:15},
    {n:16,sym:'S',name:'Kükürt',mass:32.065,cat:'nonmetal',period:3,group:16},
    {n:17,sym:'Cl',name:'Klor',mass:35.453,cat:'halogen',period:3,group:17},
    {n:18,sym:'Ar',name:'Argon',mass:39.948,cat:'noble',period:3,group:18},
    {n:19,sym:'K',name:'Potasyum',mass:39.098,cat:'alkali',period:4,group:1},
    {n:20,sym:'Ca',name:'Kalsiyum',mass:40.078,cat:'alkaline',period:4,group:2},
    {n:26,sym:'Fe',name:'Demir',mass:55.845,cat:'transition',period:4,group:8},
    {n:29,sym:'Cu',name:'Bakır',mass:63.546,cat:'transition',period:4,group:11},
    {n:30,sym:'Zn',name:'Çinko',mass:65.38,cat:'transition',period:4,group:12},
    {n:47,sym:'Ag',name:'Gümüş',mass:107.87,cat:'transition',period:5,group:11},
    {n:79,sym:'Au',name:'Altın',mass:196.97,cat:'transition',period:6,group:11},
    {n:80,sym:'Hg',name:'Cıva',mass:200.59,cat:'transition',period:6,group:12},
    {n:82,sym:'Pb',name:'Kurşun',mass:207.2,cat:'metal',period:6,group:14},
    {n:92,sym:'U',name:'Uranyum',mass:238.03,cat:'actinide',period:7,group:3},
  ]

  const catColors = {
    alkali:'#fecaca', alkaline:'#fed7aa', transition:'#e9d5ff',
    metal:'#d1d5db', metalloid:'#a7f3d0', nonmetal:'#bfdbfe',
    halogen:'#fde68a', noble:'#fbcfe8', actinide:'#fef08a', lanthanide:'#ddd6fe'
  }

  const filtered = filter === 'all' ? elements : elements.filter(e => e.cat === filter)

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>28 Element</span></div>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {['all','alkali','alkaline','transition','nonmetal','noble','halogen','metalloid'].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '2px 8px', borderRadius: '100px', border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border2)'}`,
            background: filter === cat ? catColors[cat] || 'var(--accent-light)' : 'transparent',
            color: filter === cat ? '#1a1814' : 'var(--ink3)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-mono)'
          }}>{cat === 'all' ? 'Hepsi' : cat}</button>
        ))}
      </div>
      <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '240px', overflowY: 'auto' }}>
        {filtered.map(el => (
          <div key={el.n} onClick={() => setSelected(el)} style={{
            width: '52px', padding: '4px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center',
            background: selected?.n === el.n ? (catColors[el.cat] || '#eef0fe') : catColors[el.cat] + '88' || '#f7f5f0',
            border: `1px solid ${selected?.n === el.n ? '#3d5af1' : 'transparent'}`,
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: '0.6rem', color: '#a09990', fontFamily: 'var(--font-mono)' }}>{el.n}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1814', lineHeight: 1.1 }}>{el.sym}</div>
            <div style={{ fontSize: '0.55rem', color: '#6b6560', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.name}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: catColors[selected.cat] + '44', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1a1814', fontFamily: 'var(--font-display)', minWidth: '60px', textAlign: 'center' }}>{selected.sym}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1a1814' }}>{selected.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#6b6560', marginTop: '2px' }}>
              Z = {selected.n} | A = {selected.mass} | Periyot {selected.period} | Grup {selected.group}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#3d5af1', marginTop: '2px' }}>
              {selected.cat}
            </div>
          </div>
        </div>
      )}
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 28. ASİT-BAZ TİTRASYONU ─────────────────────────────────────
export function Titration({ kavram = 'Asit-Baz Titrasyonu', aciklama }) {
  const canvasRef = useRef()
  const [volume, setVolume] = useState(0)
  const [acidConc, setAcidConc] = useState(0.1)

  const pH = (() => {
    const eqV = 25
    if (volume < eqV) {
      const molesAcid = acidConc * (25 - volume) / 1000
      const totalV = (25 + volume) / 1000
      const H = molesAcid / totalV
      return Math.max(0, -Math.log10(H))
    } else if (volume === eqV) return 7
    else {
      const molesBase = 0.1 * (volume - eqV) / 1000
      const totalV = (25 + volume) / 1000
      const OH = molesBase / totalV
      const pOH = -Math.log10(OH)
      return Math.min(14, 14 - pOH)
    }
  })()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const gx = 50, gy = 20, gw = W - 80, gh = H - 60

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    for (let py = 0; py <= 14; py += 2) {
      const y = gy + gh - (py / 14) * gh
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke()
      ctx.fillStyle = '#a09990'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'right'
      ctx.fillText(py, gx - 4, y + 3)
    }

    // Eksenler
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke()

    // pH renk gradyanı arka plan
    for (let y = gy; y < gy + gh; y++) {
      const pHy = 14 * (1 - (y - gy) / gh)
      let color
      if (pHy < 3) color = `rgba(239,68,68,0.08)`
      else if (pHy < 5) color = `rgba(245,158,11,0.08)`
      else if (pHy < 9) color = `rgba(16,185,129,0.08)`
      else color = `rgba(59,130,246,0.08)`
      ctx.fillStyle = color
      ctx.fillRect(gx + 1, y, gw - 1, 1)
    }

    // pH eğrisi
    ctx.strokeStyle = '#3d5af1'; ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let v = 0; v <= 50; v++) {
      const x = gx + (v / 50) * gw
      let ph
      if (v < 25) {
        const molesA = acidConc * (25 - v) / 1000
        const totV = (25 + v) / 1000
        const H = molesA / totV
        ph = Math.max(0, -Math.log10(H))
      } else if (v === 25) ph = 7
      else {
        const molesB = 0.1 * (v - 25) / 1000
        const totV = (25 + v) / 1000
        const OH = molesB / totV
        ph = Math.min(14, 14 + Math.log10(OH))
      }
      const y = gy + gh - (ph / 14) * gh
      v === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Denklik noktası
    const eqX = gx + (25 / 50) * gw
    const eqY = gy + gh / 2
    ctx.beginPath(); ctx.arc(eqX, eqY, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'; ctx.fill()
    ctx.setLineDash([4, 6])
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(eqX, gy); ctx.lineTo(eqX, gy + gh); ctx.stroke()
    ctx.setLineDash([])

    // Mevcut nokta
    const curX = gx + (volume / 50) * gw
    const curY = gy + gh - (pH / 14) * gh
    ctx.beginPath(); ctx.arc(curX, curY, 7, 0, Math.PI * 2)
    ctx.fillStyle = '#3d5af1'; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke()

    // Etiketler
    ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center'
    ctx.fillText('V_baz (mL)', gx + gw / 2, gy + gh + 18)
    ctx.save(); ctx.translate(12, gy + gh / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText('pH', 0, 0); ctx.restore()
    ctx.fillText('Denklik', eqX, gy + 12)

    // pH göstergesi
    const phColor = pH < 3 ? '#ef4444' : pH < 5 ? '#f59e0b' : pH < 9 ? '#10b981' : '#3b82f6'
    ctx.fillStyle = 'rgba(247,245,240,0.95)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    ctx.fillRect(gx + gw - 90, gy + 4, 88, 36); ctx.strokeRect(gx + gw - 90, gy + 4, 88, 36)
    ctx.fillStyle = phColor; ctx.font = 'bold 18px JetBrains Mono'; ctx.textAlign = 'center'
    ctx.fillText(`pH = ${pH.toFixed(2)}`, gx + gw - 46, gy + 28)
    ctx.textAlign = 'left'
  }, [volume, acidConc])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>HCl + NaOH → NaCl + H₂O</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Eklenen baz (mL)" min={0} max={50} step={0.5} value={volume} onChange={setVolume} unit=" mL" />
        <Ctrl label="Asit konsantr." min={0.01} max={0.5} step={0.01} value={acidConc} onChange={setAcidConc} unit=" M" />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: pH < 7 ? 'var(--red)' : pH > 7 ? 'var(--blue)' : 'var(--green)' }}>
          pH = {pH.toFixed(2)} {pH < 7 ? '(Asit)' : pH > 7 ? '(Baz)' : '(Nötr)'}
        </div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 29. LOTKA-VOLTERRA (AVCI-AV) ────────────────────────────────
export function LotkaVolterra({ kavram = 'Av-Avcı Dengesi', aciklama }) {
  const canvasRef = useRef()
  const [alpha, setAlpha] = useState(0.4)
  const [delta, setDelta] = useState(0.3)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const stateRef = useRef({ prey: 40, pred: 10, t: 0, history: [] })

  useEffect(() => {
    stateRef.current = { prey: 40, pred: 10, t: 0, history: [] }
  }, [alpha, delta])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const gx = 50, gy = 10, gw = W - 60, gh = H - 50

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

      const s = stateRef.current
      if (running) {
        const dt = 0.05
        const beta = 0.01, gamma = 0.3
        const dPrey = (alpha * s.prey - beta * s.prey * s.pred) * dt
        const dPred = (delta * beta * s.prey * s.pred - gamma * s.pred) * dt
        s.prey = Math.max(0.1, s.prey + dPrey)
        s.pred = Math.max(0.1, s.pred + dPred)
        s.t += dt
        s.history.push({ prey: s.prey, pred: s.pred })
        if (s.history.length > 800) s.history.shift()
      }

      // Eksenler
      ctx.strokeStyle = '#d4cfc8'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke()

      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = gy + i * gh / 4
        ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke()
        ctx.fillStyle = '#a09990'; ctx.font = '8px JetBrains Mono'; ctx.textAlign = 'right'
        ctx.fillText(Math.round(100 * (1 - i / 4)), gx - 4, y + 3)
      }

      // Av eğrisi (yeşil)
      const maxVal = 150
      if (s.history.length > 1) {
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2
        ctx.beginPath()
        s.history.forEach((h, i) => {
          const x = gx + (i / s.history.length) * gw
          const y = gy + gh - Math.min(1, h.prey / maxVal) * gh
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Avcı eğrisi (kırmızı)
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2
        ctx.beginPath()
        s.history.forEach((h, i) => {
          const x = gx + (i / s.history.length) * gw
          const y = gy + gh - Math.min(1, h.pred / maxVal) * gh
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.stroke()
      }

      // Anlık değerler
      ctx.fillStyle = 'rgba(247,245,240,0.95)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(gx + 8, gy + 8, 160, 55); ctx.strokeRect(gx + 8, gy + 8, 160, 55)
      ctx.fillStyle = '#10b981'; ctx.font = 'bold 11px JetBrains Mono'; ctx.textAlign = 'left'
      ctx.fillText(`🐇 Av: ${s.prey.toFixed(1)}`, gx + 14, gy + 26)
      ctx.fillStyle = '#ef4444'
      ctx.fillText(`🦊 Avcı: ${s.pred.toFixed(1)}`, gx + 14, gy + 42)
      ctx.fillStyle = '#6b6560'; ctx.font = '9px JetBrains Mono'
      ctx.fillText(`t = ${s.t.toFixed(0)}`, gx + 14, gy + 56)

      ctx.fillStyle = '#6b6560'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'
      ctx.fillText('Zaman →', gx + gw / 2, gy + gh + 18)

      if (running) rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [alpha, delta, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>Lotka-Volterra</span></div>
      <canvas ref={canvasRef} width={600} height={260} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Av üreme hızı α" min={0.1} max={1} step={0.05} value={alpha} onChange={setAlpha} unit="" />
        <Ctrl label="Avcı verimlilik δ" min={0.1} max={0.8} step={0.05} value={delta} onChange={setDelta} unit="" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
        <button style={S.btn} onClick={() => { stateRef.current = { prey: 40, pred: 10, t: 0, history: [] } }}>↺</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 30. İNTEGRAL — RİEMANN TOPLAMI ─────────────────────────────
export function RiemannIntegral({ kavram = 'İntegral — Riemann Toplamı', aciklama }) {
  const canvasRef = useRef()
  const [n, setN] = useState(8)
  const [a, setA] = useState(0)
  const [b, setBParam] = useState(3)
  const [funcIdx, setFuncIdx] = useState(0)

  const funcs = [
    { label: 'x²', fn: x => x * x, exact: (a, b) => (b**3 - a**3) / 3 },
    { label: 'sin(x)', fn: x => Math.sin(x) * 2 + 2, exact: (a, b) => (-Math.cos(b) + Math.cos(a)) * 2 + 2*(b-a) },
    { label: '√x', fn: x => Math.sqrt(Math.max(0, x)) * 2, exact: (a, b) => (2/3 * (b**1.5 - a**1.5)) * 2 },
    { label: 'e^(0.3x)', fn: x => Math.exp(x * 0.3), exact: (a, b) => (Math.exp(b*0.3) - Math.exp(a*0.3)) / 0.3 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const padL = 50, padR = 20, padT = 20, padB = 40
    const gw = W - padL - padR, gh = H - padT - padB

    const fn = funcs[funcIdx].fn
    const range = b - a || 0.01
    const dx = range / n

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

    const maxY = Math.max(...Array.from({length: 100}, (_, i) => fn(a + i * range / 100))) * 1.2 || 1

    const toX = x => padL + (x - a) / range * gw
    const toY = y => padT + gh - (y / maxY) * gh

    // Riemann dikdörtgenleri
    let riemannSum = 0
    for (let i = 0; i < n; i++) {
      const xi = a + i * dx
      const yi = fn(xi + dx / 2)
      riemannSum += yi * dx
      const px = toX(xi), pw = gw / n
      ctx.fillStyle = 'rgba(61,90,241,0.2)'
      ctx.strokeStyle = '#3d5af1'; ctx.lineWidth = 1
      ctx.fillRect(px, toY(yi), pw, toY(0) - toY(yi))
      ctx.strokeRect(px, toY(yi), pw, toY(0) - toY(yi))
    }

    // Eksen
    ctx.strokeStyle = '#a09990'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + gh); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(padL, padT + gh); ctx.lineTo(W - padR, padT + gh); ctx.stroke()

    // Fonksiyon eğrisi
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const x = a + i / 200 * range
      const y = fn(x)
      const px = toX(x), py = toY(y)
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.stroke()

    // Etiketler
    const exact = funcs[funcIdx].exact(a, b)
    const error = Math.abs((riemannSum - exact) / exact * 100).toFixed(1)
    ctx.fillStyle = '#3d5af1'; ctx.font = 'bold 11px JetBrains Mono'; ctx.textAlign = 'left'
    ctx.fillText(`∫${funcs[funcIdx].label} dx ≈ ${riemannSum.toFixed(3)}`, padL + 4, padT + 18)
    ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
    ctx.fillText(`Gerçek: ${exact.toFixed(3)} | Hata: ${error}%`, padL + 4, padT + 34)
    ctx.fillText(`n = ${n} dikdörtgen`, padL + 4, padT + 50)
  }, [n, a, b, funcIdx])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>∫f(x)dx = lim Σf(xᵢ)Δx</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Fonksiyon</div>
          <select value={funcIdx} onChange={e => setFuncIdx(+e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            {funcs.map((f, i) => <option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        <Ctrl label="Dikdörtgen sayısı n" min={1} max={50} step={1} value={n} onChange={setN} unit="" />
        <Ctrl label="Alt sınır a" min={0} max={2} step={0.5} value={a} onChange={setA} unit="" />
        <Ctrl label="Üst sınır b" min={1} max={5} step={0.5} value={b} onChange={setBParam} unit="" />
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 31. GÜNEŞ SİSTEMİ ───────────────────────────────────────────
export function SolarSystem({ kavram = 'Güneş Sistemi', aciklama }) {
  const canvasRef = useRef()
  const [speed, setSpeed] = useState(1)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const planets = [
    { name: 'Merkür', r: 48, period: 0.24, size: 4, color: '#9ca3af' },
    { name: 'Venüs', r: 72, period: 0.62, size: 6, color: '#fbbf24' },
    { name: 'Dünya', r: 100, period: 1, size: 7, color: '#3b82f6' },
    { name: 'Mars', r: 130, period: 1.88, size: 5, color: '#ef4444' },
    { name: 'Jüpiter', r: 175, period: 11.86, size: 14, color: '#f59e0b' },
    { name: 'Satürn', r: 215, period: 29.5, size: 11, color: '#fde68a', ring: true },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#07090f'; ctx.fillRect(0, 0, W, H)

      // Yıldızlar
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137 + 20) % W, sy = (i * 97 + 15) % H
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 4) * 0.15})`; ctx.fill()
      }

      const t = tRef.current * speed

      // Güneş
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20)
      sg.addColorStop(0, '#fef08a'); sg.addColorStop(0.6, '#f59e0b'); sg.addColorStop(1, '#d97706')
      ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 20
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2)
      ctx.fillStyle = sg; ctx.fill()
      ctx.shadowBlur = 0

      planets.forEach(p => {
        // Yörünge
        ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke()

        const angle = (t / p.period) * Math.PI * 2
        const px = cx + Math.cos(angle) * p.r
        const py = cy + Math.sin(angle) * p.r

        // Satürn halkası
        if (p.ring) {
          ctx.save(); ctx.translate(px, py); ctx.rotate(0.3)
          ctx.beginPath(); ctx.ellipse(0, 0, p.size + 8, p.size * 0.35, 0, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(253,230,138,0.5)'; ctx.lineWidth = 3; ctx.stroke()
          ctx.restore()
        }

        // Gezegen
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.fill()

        // Dünya için ay
        if (p.name === 'Dünya') {
          const moonAngle = t * 12 * Math.PI * 2
          const mx = px + Math.cos(moonAngle) * 16
          const my = py + Math.sin(moonAngle) * 8
          ctx.beginPath(); ctx.arc(mx, my, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = '#d1d5db'; ctx.fill()
        }

        // Etiket
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '8px JetBrains Mono'
        ctx.textAlign = 'center'; ctx.fillText(p.name, px, py - p.size - 4)
      })

      ctx.textAlign = 'left'
      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [speed, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>6 Gezegen</span></div>
      <canvas ref={canvasRef} width={600} height={460} style={{ ...S.canvas, width: '100%', background: '#07090f' }} />
      <div style={S.controls}>
        <Ctrl label="Hız" min={0.1} max={5} value={speed} onChange={setSpeed} unit="x" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 32. MATRİS DÖNÜŞÜMÜ ─────────────────────────────────────────
export function MatrixTransform({ kavram = 'Matris Dönüşümleri', aciklama }) {
  const canvasRef = useRef()
  const [transformIdx, setTransformIdx] = useState(0)
  const [param, setParam] = useState(45)

  const transforms = [
    { label: 'Döndürme', fn: (x, y, t) => [x*Math.cos(t) - y*Math.sin(t), x*Math.sin(t) + y*Math.cos(t)] },
    { label: 'Ölçekleme', fn: (x, y, t) => [x*t, y*t] },
    { label: 'Yatay kaydırma', fn: (x, y, t) => [x + y*t, y] },
    { label: 'Dikey kaydırma', fn: (x, y, t) => [x, y + x*t] },
    { label: 'Yatay yansıma', fn: (x, y) => [x, -y] },
  ]

  const shapes = [
    { points: [[1,0],[0,1],[-1,0],[0,-1]], color: '#3d5af1', label: 'Kare' },
    { points: [[1.5,0],[0,1],[-1.5,0]], color: '#0f7a5a', label: 'Üçgen' },
    { points: [[1,0.5],[0.5,1],[-0.5,1],[-1,0.5],[-1,-0.5],[-0.5,-1],[0.5,-1],[1,-0.5]], color: '#b45309', label: 'Sekizgen' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const scale = 80
    const t = transformIdx === 0 ? param * Math.PI / 180 : (transformIdx === 1 ? param / 45 : param / 45)

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    for (let x = cx % scale; x < W; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = cy % scale; y < H; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Eksenler
    ctx.strokeStyle = '#a09990'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()

    const tf = transforms[transformIdx].fn

    shapes.forEach(shape => {
      // Orijinal (soluk)
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = shape.color; ctx.lineWidth = 1.5
      ctx.beginPath()
      shape.points.forEach(([x, y], i) => {
        const px = cx + x * scale, py = cy - y * scale
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      })
      ctx.closePath(); ctx.stroke()

      // Dönüştürülmüş
      ctx.globalAlpha = 1
      ctx.strokeStyle = shape.color; ctx.lineWidth = 2.5
      ctx.beginPath()
      shape.points.forEach(([x, y], i) => {
        const [tx, ty] = tf(x, y, t)
        const px = cx + tx * scale, py = cy - ty * scale
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      })
      ctx.closePath(); ctx.stroke()
    })

    // Matris gösterimi
    const labels = {
      0: `[cos${param}° -sin${param}°]\n[sin${param}°  cos${param}°]`,
      1: `[${(param/45).toFixed(1)}  0]\n[0  ${(param/45).toFixed(1)}]`,
      2: `[1  ${(param/45).toFixed(1)}]\n[0  1]`,
      3: `[1  0]\n[${(param/45).toFixed(1)}  1]`,
      4: `[1   0]\n[0  -1]`,
    }
    ctx.fillStyle = 'rgba(247,245,240,0.95)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
    ctx.fillRect(8, 8, 160, 50); ctx.strokeRect(8, 8, 160, 50)
    ctx.fillStyle = '#3d5af1'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left'
    labels[transformIdx].split('\n').forEach((line, i) => ctx.fillText(line, 14, 26 + i * 16))
  }, [transformIdx, param])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>Doğrusal Dönüşüm</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Dönüşüm</div>
          <select value={transformIdx} onChange={e => setTransformIdx(+e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            {transforms.map((t, i) => <option key={i} value={i}>{t.label}</option>)}
          </select>
        </div>
        {transformIdx !== 4 && <Ctrl label="Parametre" min={-90} max={90} step={5} value={param} onChange={setParam} unit={transformIdx === 0 ? '°' : ''} />}
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 33. LEVHA TEKTONİĞİ ─────────────────────────────────────────
export function PlateTectonics({ kavram = 'Levha Tektoniği', aciklama }) {
  const canvasRef = useRef()
  const [type, setType] = useState('convergent')
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => { tRef.current = 0 }, [type])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current
      const shift = running ? Math.min(t * 0.3, 60) : 0

      // Manto
      const mantle = ctx.createLinearGradient(0, H * 0.55, 0, H)
      mantle.addColorStop(0, '#fca5a5'); mantle.addColorStop(1, '#dc2626')
      ctx.fillStyle = mantle; ctx.fillRect(0, H * 0.55, W, H * 0.45)
      ctx.fillStyle = '#ef4444'; ctx.font = '11px JetBrains Mono'
      ctx.textAlign = 'center'; ctx.fillText('MANTO (magma)', W / 2, H * 0.75)

      if (type === 'convergent') {
        // Sol levha
        ctx.fillStyle = '#6b7280'
        ctx.beginPath()
        ctx.moveTo(0, H * 0.3)
        ctx.lineTo(W / 2 - shift, H * 0.3)
        ctx.lineTo(W / 2 - shift + 20, H * 0.55)
        ctx.lineTo(0, H * 0.55)
        ctx.closePath(); ctx.fill()
        // Sağ levha (batan)
        ctx.fillStyle = '#9ca3af'
        ctx.beginPath()
        ctx.moveTo(W, H * 0.3)
        ctx.lineTo(W / 2 + shift, H * 0.3)
        ctx.lineTo(W / 2 + shift + shift * 0.5, H * 0.55 + shift * 0.3)
        ctx.lineTo(W, H * 0.55)
        ctx.closePath(); ctx.fill()
        // Dağ
        if (shift > 10) {
          ctx.fillStyle = '#374151'
          ctx.beginPath()
          ctx.moveTo(W / 2 - shift - 20, H * 0.3)
          ctx.lineTo(W / 2 - shift + (shift * 0.3), H * 0.3 - shift * 0.6)
          ctx.lineTo(W / 2 - shift + shift * 0.6, H * 0.3)
          ctx.closePath(); ctx.fill()
        }
        ctx.fillStyle = '#1a1814'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center'
        ctx.fillText('← Yakınsak Sınır →', W / 2, 20)
        ctx.fillText('Okyanus levhası batar (subdüksiyon)', W / 2, 36)
      } else if (type === 'divergent') {
        const gap = shift
        ctx.fillStyle = '#6b7280'
        // Sol
        ctx.fillRect(0, H * 0.3, W / 2 - gap, H * 0.25)
        // Sağ
        ctx.fillRect(W / 2 + gap, H * 0.3, W / 2 - gap, H * 0.25)
        // Yeni magma
        if (gap > 5) {
          ctx.fillStyle = '#dc2626'
          ctx.fillRect(W / 2 - gap, H * 0.3, gap * 2, H * 0.25)
          ctx.fillStyle = '#fca5a5'; ctx.font = '9px JetBrains Mono'; ctx.textAlign = 'center'
          ctx.fillText('Yeni\nkabuk', W / 2, H * 0.42)
        }
        ctx.fillStyle = '#1a1814'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center'
        ctx.fillText('← Iraksak Sınır →', W / 2, 20)
        ctx.fillText('Levhalar ayrılır, yeni kabuk oluşur', W / 2, 36)
      } else {
        // Dönüşüm fayı
        ctx.fillStyle = '#6b7280'
        ctx.fillRect(0, H * 0.3 - 2, W, H * 0.25 + 4)
        // Üst yarı kayıyor
        ctx.fillStyle = '#4b5563'
        ctx.fillRect(shift, H * 0.3, W, H * 0.12)
        // Alt yarı sabit
        ctx.fillStyle = '#9ca3af'
        ctx.fillRect(-shift * 0.5, H * 0.42, W, H * 0.13)
        // Fay çizgisi
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([6, 6])
        ctx.beginPath(); ctx.moveTo(0, H * 0.42); ctx.lineTo(W, H * 0.42); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#1a1814'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center'
        ctx.fillText('Dönüşüm Fayı', W / 2, 20)
        ctx.fillText('San Andreas örn. — yatay kayma', W / 2, 36)
      }

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [type, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>Plaka Hareketi</span></div>
      <canvas ref={canvasRef} width={600} height={260} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <div>
          <div style={S.label}>Sınır tipi</div>
          <select value={type} onChange={e => { setType(e.target.value); tRef.current = 0 }}
            style={{ padding: '4px 8px', border: '1px solid #c7cdfa', borderRadius: '6px', background: '#eef0fe', color: '#3d5af1', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            <option value="convergent">Yakınsak (subdüksiyon)</option>
            <option value="divergent">Iraksak (sırtlar)</option>
            <option value="transform">Dönüşüm fayı</option>
          </select>
        </div>
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
        <button style={S.btn} onClick={() => { tRef.current = 0 }}>↺</button>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 34. DALGA ENERJİSİ (OKYANUS) ────────────────────────────────
export function OceanWave({ kavram = 'Dalga Enerjisi', aciklama }) {
  const canvasRef = useRef()
  const [waveHeight, setWaveHeight] = useState(50)
  const [period, setPeriod] = useState(8)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const power = (0.5 * waveHeight * waveHeight * period / 1000).toFixed(2)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Gökyüzü
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.4)
      sky.addColorStop(0, '#bfdbfe'); sky.addColorStop(1, '#eff6ff')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

      // Derin okyanus
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0, H * 0.4, W, H * 0.6)

      // Dalga
      const waveY = H * 0.5
      const amp = (waveHeight / 100) * 60
      const wavelength = period * 20

      ctx.beginPath()
      ctx.moveTo(0, waveY)
      for (let x = 0; x <= W; x++) {
        const y = waveY + amp * Math.sin(2 * Math.PI * x / wavelength - t * 2)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath()

      const wg = ctx.createLinearGradient(0, waveY - amp, 0, H)
      wg.addColorStop(0, '#60a5fa'); wg.addColorStop(0.3, '#2563eb'); wg.addColorStop(1, '#1e40af')
      ctx.fillStyle = wg; ctx.fill()

      // Köpük
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 0; x <= W; x++) {
        const y = waveY + amp * Math.sin(2 * Math.PI * x / wavelength - t * 2)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Enerji dönüştürücü
      const buoyX = W * 0.6, buoyY = waveY + amp * Math.sin(2 * Math.PI * buoyX / wavelength - t * 2)
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath(); ctx.arc(buoyX, buoyY, 14, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#78350f'; ctx.font = '8px Inter'; ctx.textAlign = 'center'
      ctx.fillText('⚡', buoyX, buoyY + 3)
      ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(buoyX, buoyY + 14); ctx.lineTo(buoyX, H * 0.85); ctx.stroke()
      ctx.setLineDash([])

      // Güç
      ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 1
      ctx.fillRect(8, 8, 165, 55); ctx.strokeRect(8, 8, 165, 55)
      ctx.fillStyle = '#1d4ed8'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left'
      ctx.fillText(`H = ${waveHeight} cm | T = ${period} s`, 14, 24)
      ctx.fillText(`P = ρg²H²T/32π`, 14, 40)
      ctx.fillStyle = '#1e40af'; ctx.font = 'bold 13px JetBrains Mono'
      ctx.fillText(`${power} kW/m`, 14, 56)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [waveHeight, period, running, power])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>P ∝ H²·T</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Dalga yüksekliği H" min={10} max={100} step={5} value={waveHeight} onChange={setWaveHeight} unit=" cm" />
        <Ctrl label="Periyot T" min={4} max={16} step={1} value={period} onChange={setPeriod} unit=" s" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--blue)' }}>{power} kW/m</div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 35. JEOTERMAl ENERJİ ────────────────────────────────────────
export function GeothermalEnergy({ kavram = 'Jeotermal Enerji', aciklama }) {
  const canvasRef = useRef()
  const [depth, setDepth] = useState(3)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const temp = (15 + depth * 30).toFixed(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Katmanlar
      const layers = [
        { y: 0, h: H * 0.15, color: '#86efac', label: 'Yüzey (15°C)' },
        { y: H * 0.15, h: H * 0.2, color: '#d97706', label: 'Sığ kabuk' },
        { y: H * 0.35, h: H * 0.2, color: '#b45309', label: 'Derin kabuk' },
        { y: H * 0.55, h: H * 0.2, color: '#dc2626', label: 'Üst manto' },
        { y: H * 0.75, h: H * 0.25, color: '#7f1d1d', label: 'Magma' },
      ]
      layers.forEach(l => {
        const grad = ctx.createLinearGradient(0, l.y, 0, l.y + l.h)
        grad.addColorStop(0, l.color + 'cc'); grad.addColorStop(1, l.color)
        ctx.fillStyle = grad; ctx.fillRect(0, l.y, W, l.h)
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px JetBrains Mono'
        ctx.textAlign = 'left'; ctx.fillText(l.label, 8, l.y + 16)
      })

      // Sıcaklık gradyanı göstergesi
      for (let y = 0; y < H; y++) {
        const ratio = y / H
        const temp_y = 15 + ratio * depth * 30 * 3
        const r = Math.min(255, temp_y * 0.8)
        ctx.fillStyle = `rgba(${r},${Math.max(0, 120-r/2)},0,0.03)`
        ctx.fillRect(0, y, W, 1)
      }

      // Jeotermal kuyu
      const wellX = W * 0.5
      const wellDepth = H * (depth / 10)
      ctx.strokeStyle = '#374151'; ctx.lineWidth = 6
      ctx.beginPath(); ctx.moveTo(wellX, 0); ctx.lineTo(wellX, wellDepth); ctx.stroke()
      ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(wellX, 0); ctx.lineTo(wellX, wellDepth); ctx.stroke()

      // Su pompası (sıcak su çıkışı)
      const particleY = wellDepth - (t * 80 % wellDepth)
      if (particleY > 0) {
        ctx.beginPath(); ctx.arc(wellX, particleY, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ef4444'; ctx.fill()
      }

      // Yüzey tesisi
      ctx.fillStyle = '#374151'; ctx.fillRect(wellX - 25, 0, 50, 25)
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath(); ctx.moveTo(wellX - 15, 0); ctx.lineTo(wellX, -15); ctx.lineTo(wellX + 15, 0); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'white'; ctx.font = 'bold 8px Inter'; ctx.textAlign = 'center'
      ctx.fillText('⚡', wellX, 16)

      // Buhar çıkışı
      for (let i = 0; i < 5; i++) {
        const sx = wellX + Math.sin(t * 2 + i) * 10
        const sy = -i * 12 - t * 30 % 60
        ctx.globalAlpha = Math.max(0, 0.6 - i * 0.1)
        ctx.fillStyle = 'rgba(200,200,200,0.8)'
        ctx.beginPath(); ctx.arc(sx, sy + 30, 6 + i * 2, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      }

      // Bilgi
      ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.strokeStyle = '#e8e4dc'; ctx.lineWidth = 1
      ctx.fillRect(W - 155, 8, 145, 65); ctx.strokeRect(W - 155, 8, 145, 65)
      ctx.fillStyle = '#374151'; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'left'
      ctx.fillText(`Derinlik: ${depth} km`, W - 148, 26)
      ctx.fillText(`Sıcaklık: ${temp}°C`, W - 148, 42)
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 13px JetBrains Mono'
      ctx.fillText(`${(depth * 15).toFixed(0)} kW/km²`, W - 148, 62)

      if (running) { tRef.current += 0.016; rafRef.current = requestAnimationFrame(draw) }
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [depth, running, temp])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>3°C / 100m</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{ ...S.canvas, width: '100%' }} />
      <div style={S.controls}>
        <Ctrl label="Kuyu derinliği" min={1} max={10} step={0.5} value={depth} onChange={setDepth} unit=" km" />
        <button style={S.btn} onClick={() => setRunning(r => !r)}>{running ? '⏸' : '▶'}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--red)' }}>{temp}°C</div>
      </div>
      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 36. ORGANİK MOLEKÜLLERİN AYIRAÇLARI ────────────────────────
export function OrganicIndicators({ kavram = 'Organik Moleküllerin Ayıraçları', aciklama }) {
  const [selected, setSelected] = useState(null)
  const [testMode, setTestMode] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [quizMolecule, setQuizMolecule] = useState(null)
  const [quizOptions, setQuizOptions] = useState([])
  const canvasRef = useRef()
  const rafRef = useRef()
  const tRef = useRef(0)

  const data = [
    { molekul: 'Nişasta', ayirac: 'İyot çözeltisi (Lugol)', renk: '#4a1a7a', renkAdi: 'Mavi-mor', emoji: '🔵', kategori: 'Karbonhidrat' },
    { molekul: 'Glikojen', ayirac: 'İyot çözeltisi (Lugol)', renk: '#8B4513', renkAdi: 'Kahverengi-kırmızı', emoji: '🟤', kategori: 'Karbonhidrat' },
    { molekul: 'Selüloz', ayirac: 'İyotlu çinko klorür', renk: '#7ec8c8', renkAdi: 'Açık mavi veya yeşil', emoji: '🩵', kategori: 'Karbonhidrat' },
    { molekul: 'Glikoz / Fruktoz', ayirac: 'Benedict çözeltisi', renk: '#c0392b', renkAdi: 'Kiremit kırmızısı', emoji: '🔴', kategori: 'Karbonhidrat' },
    { molekul: 'Glikoz / Fruktoz', ayirac: 'Fehling çözeltisi', renk: '#e07b39', renkAdi: 'Kiremit kırmızısı / Turuncu', emoji: '🟠', kategori: 'Karbonhidrat' },
    { molekul: 'Monosakkaritler', ayirac: 'Barfoed reaktifi', renk: '#c0392b', renkAdi: 'Kırmızı', emoji: '🔴', kategori: 'Karbonhidrat' },
    { molekul: 'Amino asitler', ayirac: 'Ninhidrin reaktifi', renk: '#8B008B', renkAdi: 'Sarı veya mor', emoji: '🟣', kategori: 'Protein' },
    { molekul: 'Proteinler', ayirac: 'Nitrik asit', renk: '#DAA520', renkAdi: 'Sarı', emoji: '🟡', kategori: 'Protein' },
    { molekul: 'Proteinler', ayirac: 'Fehling çözeltisi', renk: '#7B2D8B', renkAdi: 'Menekşe rengi', emoji: '🟣', kategori: 'Protein' },
    { molekul: 'Proteinler', ayirac: 'Biüret reaktifi', renk: '#6a0dad', renkAdi: 'Açık mavi veya mor', emoji: '🔵', kategori: 'Protein' },
    { molekul: 'Proteinler', ayirac: 'Commasie mavisi G-250', renk: '#1a5276', renkAdi: 'Mavi', emoji: '🔵', kategori: 'Protein' },
    { molekul: 'Yağlar', ayirac: 'Sudan III ve Sudan IV', renk: '#e74c3c', renkAdi: 'Kırmızı veya turuncu', emoji: '🔴', kategori: 'Yağ' },
    { molekul: 'Yağlar', ayirac: 'Sudan kırmızısı', renk: '#c0392b', renkAdi: 'Kırmızı', emoji: '🔴', kategori: 'Yağ' },
    { molekul: 'Doymamış yağlar', ayirac: 'Osmik asit', renk: '#1a1a1a', renkAdi: 'Siyah veya koyu kahverengi', emoji: '⚫', kategori: 'Yağ' },
  ]

  const kategoriler = ['Hepsi', 'Karbonhidrat', 'Protein', 'Yağ']
  const [kategori, setKategori] = useState('Hepsi')
  const filtered = kategori === 'Hepsi' ? data : data.filter(d => d.kategori === kategori)

  const katRenk = { Karbonhidrat: '#3d5af1', Protein: '#0f7a5a', Yağ: '#b45309' }
  const katBg = { Karbonhidrat: '#eef0fe', Protein: '#ecfdf5', Yağ: '#fffbeb' }

  // Deney tüpü canvas animasyonu
  useEffect(() => {
    if (!selected) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current

      // Deney tüpü şekli
      const tx = W / 2, ty = 30, tw = 60, th = 160

      // Tüp gövdesi
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(tx - tw/2, ty)
      ctx.lineTo(tx - tw/2, ty + th)
      ctx.arc(tx, ty + th, tw/2, Math.PI, 0)
      ctx.lineTo(tx + tw/2, ty)
      ctx.stroke()

      // Sıvı dolum animasyonu
      const fillLevel = Math.min(1, t / 60)
      const liquidH = th * 0.7 * fillLevel
      const liquidY = ty + th - liquidH

      if (fillLevel > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(tx - tw/2 + 3, liquidY)
        ctx.lineTo(tx - tw/2 + 3, ty + th)
        ctx.arc(tx, ty + th, tw/2 - 3, Math.PI, 0)
        ctx.lineTo(tx + tw/2 - 3, liquidY)
        ctx.closePath()
        ctx.clip()

        // Sıvı rengi — başta şeffaf, sonra ayıraç rengi
        const alpha = fillLevel
        const hex = selected.renk
        const r = parseInt(hex.slice(1,3), 16)
        const g = parseInt(hex.slice(3,5), 16)
        const b = parseInt(hex.slice(5,7), 16)

        // Dalgalı yüzey
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.85})`
        ctx.fillRect(tx - tw/2 + 3, liquidY, tw - 6, liquidH + tw/2)

        // Yüzey dalgası
        ctx.beginPath()
        for (let x = tx - tw/2 + 3; x <= tx + tw/2 - 3; x++) {
          const wave = liquidY + Math.sin((x - tx) * 0.2 + t * 0.15) * 3 * fillLevel
          x === tx - tw/2 + 3 ? ctx.moveTo(x, wave) : ctx.lineTo(x, wave)
        }
        ctx.lineTo(tx + tw/2 - 3, liquidY + liquidH)
        ctx.lineTo(tx - tw/2 + 3, liquidY + liquidH)
        ctx.closePath()
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.4})`
        ctx.fill()

        // Kabarcıklar (reaksiyon)
        if (fillLevel > 0.5) {
          for (let i = 0; i < 5; i++) {
            const bx = tx - 20 + i * 10
            const by = liquidY + liquidH * 0.7 - Math.sin(t * 0.1 + i * 1.2) * liquidH * 0.5
            if (by > liquidY) {
              ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(255,255,255,0.4)`; ctx.fill()
            }
          }
        }
        ctx.restore()
      }

      // Tüp üst açıklık
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(tx - tw/2 - 4, ty); ctx.lineTo(tx + tw/2 + 4, ty); ctx.stroke()

      // Renk etiketi
      if (fillLevel > 0.3) {
        ctx.fillStyle = selected.renk
        ctx.font = 'bold 13px Lora, Georgia, serif'
        ctx.textAlign = 'center'
        ctx.fillText(selected.renkAdi, tx, ty + th + 35)
        ctx.fillStyle = '#6b6560'; ctx.font = '10px JetBrains Mono'
        ctx.fillText(selected.emoji, tx, ty + th + 52)
      }

      // Ayıraç adı üstte
      ctx.fillStyle = '#3d5af1'; ctx.font = 'bold 11px JetBrains Mono'
      ctx.textAlign = 'center'
      ctx.fillText(selected.ayirac, tx, ty - 10)

      tRef.current += 1
      rafRef.current = requestAnimationFrame(draw)
    }
    tRef.current = 0
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [selected])

  // Quiz modu
  function startQuiz() {
    const idx = Math.floor(Math.random() * data.length)
    const mol = data[idx]
    setQuizMolecule(mol)
    // 4 seçenek
    const others = data.filter((_, i) => i !== idx)
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...shuffled, mol].sort(() => Math.random() - 0.5)
    setQuizOptions(options)
    setAnswer(null); setShowResult(false)
  }

  function checkAnswer(opt) {
    setAnswer(opt)
    setShowResult(true)
    setScore(s => ({
      correct: s.correct + (opt.ayirac === quizMolecule.ayirac ? 1 : 0),
      total: s.total + 1
    }))
  }

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={S.title}>{kavram}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => { setTestMode(false); setSelected(null) }}
            style={{ ...S.btn, background: !testMode ? '#eef0fe' : 'transparent', borderColor: !testMode ? 'var(--accent)' : undefined }}>
            📋 Tablo
          </button>
          <button onClick={() => { setTestMode(true); startQuiz() }}
            style={{ ...S.btn, background: testMode ? '#eef0fe' : 'transparent', borderColor: testMode ? 'var(--accent)' : undefined }}>
            🧪 Test Et
          </button>
        </div>
      </div>

      {!testMode ? (
        <div style={{ display: 'flex', height: '420px' }}>
          {/* Sol - liste */}
          <div style={{ width: '340px', borderRight: '1px solid var(--border)', overflow: 'auto', padding: '10px', flexShrink: 0 }}>
            {/* Kategori filtre */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {kategoriler.map(k => (
                <button key={k} onClick={() => setKategori(k)} style={{
                  padding: '2px 10px', borderRadius: '100px', fontSize: '0.72rem', cursor: 'pointer',
                  border: `1px solid ${kategori === k ? (katRenk[k] || 'var(--accent)') : 'var(--border2)'}`,
                  background: kategori === k ? (katBg[k] || 'var(--accent-light)') : 'transparent',
                  color: kategori === k ? (katRenk[k] || 'var(--accent)') : 'var(--ink3)',
                  fontFamily: 'var(--font-mono)',
                }}>{k}</button>
              ))}
            </div>
            {filtered.map((d, i) => (
              <div key={i} onClick={() => { setSelected(d); tRef.current = 0 }} style={{
                padding: '8px 10px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer',
                background: selected?.molekul === d.molekul && selected?.ayirac === d.ayirac ? katBg[d.kategori] : 'var(--bg)',
                border: `1px solid ${selected?.molekul === d.molekul && selected?.ayirac === d.ayirac ? katRenk[d.kategori] : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)' }}>{d.molekul}</span>
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: '100px', background: katBg[d.kategori], color: katRenk[d.kategori], border: `1px solid ${katRenk[d.kategori]}44`, fontFamily: 'var(--font-mono)' }}>
                    {d.kategori}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#3d5af1', fontFamily: 'var(--font-mono)' }}>{d.ayirac}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.renk, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{d.renkAdi}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ - deney tüpü */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            {!selected ? (
              <div style={{ textAlign: 'center', color: 'var(--ink3)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧪</div>
                <div style={{ fontSize: '0.9rem' }}>Bir molekül seç, reaksiyonu izle</div>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '2px' }}>{selected.molekul}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', fontFamily: 'var(--font-mono)' }}>+ {selected.ayirac}</div>
                </div>
                <canvas ref={canvasRef} width={200} height={230} style={{ background: 'transparent' }} />
                <div style={{ marginTop: '0.75rem', padding: '8px 16px', borderRadius: '8px', background: katBg[selected.kategori], border: `1px solid ${katRenk[selected.kategori]}44`, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink3)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>Sonuç rengi</div>
                  <div style={{ fontWeight: 600, color: selected.renk, fontSize: '0.95rem' }}>{selected.emoji} {selected.renkAdi}</div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Test modu */
        <div style={{ padding: '1.5rem', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--ink2)' }}>
              Puan: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{score.correct}</span> / {score.total}
            </div>
            <button onClick={() => setScore({ correct: 0, total: 0 })} style={S.btn}>↺ Sıfırla</button>
          </div>

          {quizMolecule && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink3)', marginBottom: '0.5rem' }}>Bu molekülün ayıracı hangisidir?</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '4px' }}>{quizMolecule.molekul}</div>
                <div style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '100px', display: 'inline-block', background: katBg[quizMolecule.kategori], color: katRenk[quizMolecule.kategori], border: `1px solid ${katRenk[quizMolecule.kategori]}44`, fontFamily: 'var(--font-mono)' }}>
                  {quizMolecule.kategori}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '480px', margin: '0 auto' }}>
                {quizOptions.map((opt, i) => {
                  let bg = 'var(--surface)', border = 'var(--border2)', color = 'var(--ink)'
                  if (showResult && answer) {
                    if (opt.ayirac === quizMolecule.ayirac) { bg = '#ecfdf5'; border = '#a7f3d0'; color = 'var(--green)' }
                    else if (opt.ayirac === answer.ayirac) { bg = '#fef2f2'; border = '#fecaca'; color = 'var(--red)' }
                  }
                  return (
                    <button key={i} onClick={() => !showResult && checkAnswer(opt)} style={{
                      padding: '0.75rem 1rem', borderRadius: '8px', border: `1px solid ${border}`,
                      background: bg, color, cursor: showResult ? 'default' : 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: '0.9rem', textAlign: 'left',
                      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: opt.renk, flexShrink: 0, display: 'inline-block' }} />
                      {opt.ayirac}
                      {showResult && opt.ayirac === quizMolecule.ayirac && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </button>
                  )
                })}
              </div>

              {showResult && (
                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                  <div style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: answer?.ayirac === quizMolecule.ayirac ? 'var(--green)' : 'var(--red)' }}>
                    {answer?.ayirac === quizMolecule.ayirac ? '✅ Doğru!' : `❌ Yanlış. Doğrusu: ${quizMolecule.ayirac} → ${quizMolecule.renkAdi}`}
                  </div>
                  <button onClick={startQuiz} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                    Sonraki Soru →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Alt özet çizgisi */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['Karbonhidrat', 'Protein', 'Yağ'].map(k => (
          <span key={k} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: katRenk[k] }}>
            ● {k}: {data.filter(d => d.kategori === k).length} ayıraç
          </span>
        ))}
      </div>

      {aciklama && <div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 37. LİMİT YAKLAŞIM ──────────────────────────────────────────
export function LimitApproach({ kavram = 'Limit', aciklama }) {
  const canvasRef = useRef()
  const [funcIdx, setFuncIdx] = useState(0)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const funcs = [
    { label: '(x²-4)/(x-2)', fn: x => Math.abs(x-2)<0.001 ? 4 : (x*x-4)/(x-2), limit: 4, target: 2 },
    { label: 'sin(x)/x', fn: x => Math.abs(x)<0.001 ? 1 : Math.sin(x)/x, limit: 1, target: 0 },
    { label: 'x·sin(1/x)', fn: x => Math.abs(x)<0.0001 ? 0 : x*Math.sin(1/x), limit: 0, target: 0 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W/2, cy = H/2, scale = 60

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, W, H)
      const t = tRef.current
      const f = funcs[funcIdx]

      for (let x = cx % scale; x < W; x += scale) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle='#e8e4dc'; ctx.lineWidth=1; ctx.stroke() }
      for (let y = cy % scale; y < H; y += scale) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.strokeStyle='#e8e4dc'; ctx.lineWidth=1; ctx.stroke() }
      ctx.strokeStyle='#a09990'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke()

      ctx.strokeStyle='#3d5af1'; ctx.lineWidth=2.5
      ctx.beginPath()
      let first=true
      for (let px=0; px<W; px++) {
        const x=(px-cx)/scale
        if (Math.abs(x-f.target)<0.05) { first=true; continue }
        const y=f.fn(x)
        if (!isFinite(y)||Math.abs(y)>4) { first=true; continue }
        const py=cy-y*scale
        first?ctx.moveTo(px,py):ctx.lineTo(px,py); first=false
      }
      ctx.stroke()

      const eps=Math.max(0.08, 2*(1-Math.min(1,t/100)))
      ;[-1,1].forEach(dir=>{
        const xA=f.target+dir*eps, yA=f.fn(xA)
        if (!isFinite(yA)) return
        const px=cx+xA*scale, py=cy-yA*scale
        ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2)
        ctx.fillStyle=dir>0?'#ef4444':'#10b981'; ctx.fill()
        ctx.strokeStyle=dir>0?'#fca5a5':'#6ee7b7'; ctx.lineWidth=1; ctx.setLineDash([4,6])
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,cy); ctx.stroke()
        ctx.setLineDash([])
      })

      const lpx=cx+f.target*scale, lpy=cy-f.limit*scale
      ctx.beginPath(); ctx.arc(lpx,lpy,7,0,Math.PI*2)
      ctx.fillStyle='white'; ctx.fill(); ctx.strokeStyle='#3d5af1'; ctx.lineWidth=2; ctx.stroke()
      ctx.strokeStyle='#fcd34d'; ctx.lineWidth=1; ctx.setLineDash([6,8])
      ctx.beginPath(); ctx.moveTo(0,lpy); ctx.lineTo(W,lpy); ctx.stroke(); ctx.setLineDash([])

      ctx.fillStyle='rgba(247,245,240,0.95)'; ctx.strokeStyle='#e8e4dc'; ctx.lineWidth=1
      ctx.fillRect(6,6,195,50); ctx.strokeRect(6,6,195,50)
      ctx.fillStyle='#3d5af1'; ctx.font='bold 11px JetBrains Mono'; ctx.textAlign='left'
      ctx.fillText(`f(x) = ${f.label}`, 12, 22)
      ctx.fillStyle='#0f7a5a'; ctx.fillText(`lim = ${f.limit.toFixed(4)}  x→${f.target}`, 12, 38)
      ctx.fillStyle='#6b6560'; ctx.font='9px JetBrains Mono'; ctx.fillText(`ε = ${eps.toFixed(3)}`, 12, 52)

      if (running) { tRef.current+=0.5; if(tRef.current>200)tRef.current=0; rafRef.current=requestAnimationFrame(draw) }
    }
    tRef.current=0; rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  }, [funcIdx, running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>lim f(x)</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{...S.canvas,width:'100%'}} />
      <div style={S.controls}>
        <div><div style={S.label}>Fonksiyon</div>
          <select value={funcIdx} onChange={e=>{setFuncIdx(+e.target.value);tRef.current=0}} style={{padding:'4px 8px',border:'1px solid #c7cdfa',borderRadius:'6px',background:'#eef0fe',color:'#3d5af1',fontFamily:'inherit',fontSize:'0.78rem'}}>
            {funcs.map((f,i)=><option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        <button style={S.btn} onClick={()=>setRunning(r=>!r)}>{running?'⏸':'▶'}</button>
        <button style={S.btn} onClick={()=>{tRef.current=0}}>↺</button>
      </div>
      {aciklama&&<div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 38. BİRİM ÇEMBERİ ───────────────────────────────────────────
export function UnitCircle({ kavram = 'Trigonometri — Birim Çemberi', aciklama }) {
  const canvasRef = useRef()
  const [speed, setSpeed] = useState(0.5)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W*0.38, cy = H/2, r = 105

    function draw() {
      ctx.clearRect(0,0,W,H); ctx.fillStyle='#fafaf8'; ctx.fillRect(0,0,W,H)
      const t = tRef.current
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.strokeStyle='#d4cfc8'; ctx.lineWidth=1.5; ctx.stroke()
      ctx.strokeStyle='#a09990'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(cx-r-20,cy); ctx.lineTo(cx+r+20,cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,cy-r-20); ctx.lineTo(cx,cy+r+20); ctx.stroke()

      const px=cx+r*Math.cos(t), py=cy-r*Math.sin(t)
      const sinV=Math.sin(t), cosV=Math.cos(t)

      ctx.strokeStyle='#6366f1'; ctx.lineWidth=2.5
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke()
      ctx.strokeStyle='#ef4444'; ctx.lineWidth=2
      ctx.beginPath(); ctx.moveTo(px,cy); ctx.lineTo(px,py); ctx.stroke()
      ctx.strokeStyle='#3b82f6'; ctx.lineWidth=2
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,cy); ctx.stroke()

      ctx.shadowColor='#6366f1'; ctx.shadowBlur=10
      ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fillStyle='#6366f1'; ctx.fill()
      ctx.shadowBlur=0

      ctx.beginPath(); ctx.arc(cx,cy,24,-t,0,t<0); ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2; ctx.stroke()
      ctx.fillStyle='#b45309'; ctx.font='bold 10px JetBrains Mono'; ctx.textAlign='left'
      ctx.fillText(`θ=${(t*180/Math.PI%360+360).toFixed(0)}°`, cx+28, cy-5)

      const gx=W*0.67, gw=W*0.3
      ;[{l:'sin θ',v:sinV,c:'#ef4444',y:cy-80},{l:'cos θ',v:cosV,c:'#3b82f6',y:cy},{l:'tan θ',v:Math.abs(cosV)>0.01?sinV/cosV:null,c:'#10b981',y:cy+80}].forEach(({l,v,c,y})=>{
        if(v===null) return
        const cl=Math.max(-1,Math.min(1,v))
        ctx.fillStyle='#f7f5f0'; ctx.strokeStyle='#e8e4dc'; ctx.lineWidth=1
        ctx.fillRect(gx,y-17,gw,34); ctx.strokeRect(gx,y-17,gw,34)
        ctx.fillStyle=c; ctx.font='bold 10px JetBrains Mono'; ctx.textAlign='left'
        ctx.fillText(l,gx+5,y+4)
        const bx=gx+48, bw=gw-56
        ctx.fillStyle='#e8e4dc'; ctx.fillRect(bx,y-5,bw,10)
        ctx.fillStyle=c
        if(cl>=0) ctx.fillRect(bx+bw/2,y-5,cl*bw/2,10); else ctx.fillRect(bx+bw/2+cl*bw/2,y-5,-cl*bw/2,10)
        ctx.fillStyle=c; ctx.font='bold 9px JetBrains Mono'; ctx.textAlign='right'
        ctx.fillText(v.toFixed(3),gx+gw-3,y+4)
      })

      if(running){tRef.current+=speed*0.016; rafRef.current=requestAnimationFrame(draw)}
    }
    rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  },[speed,running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>sin²θ+cos²θ=1</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{...S.canvas,width:'100%'}} />
      <div style={S.controls}>
        <Ctrl label="Hız" min={0.1} max={3} value={speed} onChange={setSpeed} unit="x"/>
        <button style={S.btn} onClick={()=>setRunning(r=>!r)}>{running?'⏸':'▶'}</button>
      </div>
      {aciklama&&<div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 39. NORMAL DAĞILIM ───────────────────────────────────────────
export function NormalDistribution({ kavram = 'Normal Dağılım', aciklama }) {
  const canvasRef = useRef()
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const [showAreas, setShowAreas] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const gx=40, gy=20, gw=W-60, gh=H-70
    const xMin=mu-4*sigma, xMax=mu+4*sigma
    const toX=x=>gx+(x-xMin)/(xMax-xMin)*gw
    const normal=x=>Math.exp(-0.5*((x-mu)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI))
    const maxY=normal(mu)
    const toY=y=>gy+gh-(y/maxY)*gh*0.9

    ctx.clearRect(0,0,W,H); ctx.fillStyle='#fafaf8'; ctx.fillRect(0,0,W,H)

    if(showAreas){
      [[mu-3*sigma,mu+3*sigma,'rgba(61,90,241,0.08)','99.7%',H-52],
       [mu-2*sigma,mu+2*sigma,'rgba(61,90,241,0.14)','95.4%',H-36],
       [mu-sigma,  mu+sigma,  'rgba(61,90,241,0.22)','68.3%',H-20],
      ].forEach(([from,to,color,label,ly])=>{
        ctx.beginPath(); ctx.moveTo(toX(from),toY(0))
        for(let x=from;x<=to;x+=(to-from)/200) ctx.lineTo(toX(x),toY(normal(x)))
        ctx.lineTo(toX(to),toY(0)); ctx.closePath(); ctx.fillStyle=color; ctx.fill()
        ctx.fillStyle='#3d5af1'; ctx.font='9px JetBrains Mono'; ctx.textAlign='center'
        ctx.fillText(label,toX((from+to)/2),ly)
      })
    }

    ctx.strokeStyle='#3d5af1'; ctx.lineWidth=2.5; ctx.beginPath()
    for(let i=0;i<=gw;i++){const x=xMin+i/gw*(xMax-xMin); i===0?ctx.moveTo(gx+i,toY(normal(x))):ctx.lineTo(gx+i,toY(normal(x)))}
    ctx.stroke()

    ctx.strokeStyle='#a09990'; ctx.lineWidth=1.5
    ctx.beginPath(); ctx.moveTo(gx,toY(0)); ctx.lineTo(gx+gw,toY(0)); ctx.stroke()

    for(let k=-3;k<=3;k++){
      const px=toX(mu+k*sigma)
      ctx.strokeStyle=k===0?'#3d5af1':'#d4cfc8'; ctx.lineWidth=k===0?1.5:1
      ctx.setLineDash(k===0?[]:[4,6]); ctx.beginPath(); ctx.moveTo(px,gy); ctx.lineTo(px,toY(0)); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle='#6b6560'; ctx.font='9px JetBrains Mono'; ctx.textAlign='center'
      ctx.fillText(k===0?'μ':`${k>0?'+':''}${k}σ`,px,toY(0)+14)
    }

    ctx.fillStyle='rgba(247,245,240,0.95)'; ctx.strokeStyle='#e8e4dc'; ctx.lineWidth=1
    ctx.fillRect(gx+gw-130,gy+4,125,45); ctx.strokeRect(gx+gw-130,gy+4,125,45)
    ctx.fillStyle='#3d5af1'; ctx.font='10px JetBrains Mono'; ctx.textAlign='left'
    ctx.fillText(`μ = ${mu.toFixed(1)}`,gx+gw-124,gy+20)
    ctx.fillText(`σ = ${sigma.toFixed(1)}`,gx+gw-124,gy+34)
    ctx.fillText(`σ² = ${(sigma*sigma).toFixed(2)}`,gx+gw-124,gy+48)
  },[mu,sigma,showAreas])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>N(μ,σ²)</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{...S.canvas,width:'100%'}} />
      <div style={S.controls}>
        <Ctrl label="Ortalama μ" min={-3} max={3} step={0.5} value={mu} onChange={setMu} unit=""/>
        <Ctrl label="Std sapma σ" min={0.3} max={3} step={0.1} value={sigma} onChange={setSigma} unit=""/>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <input type="checkbox" checked={showAreas} onChange={e=>setShowAreas(e.target.checked)} id="areas"/>
          <label htmlFor="areas" style={{fontSize:'0.78rem',color:'var(--ink2)',cursor:'pointer'}}>σ bölgeleri</label>
        </div>
      </div>
      {aciklama&&<div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 40. POLAR KOORDİNATLAR ──────────────────────────────────────
export function PolarCoordinates({ kavram = 'Polar Koordinatlar', aciklama }) {
  const canvasRef = useRef()
  const [funcIdx, setFuncIdx] = useState(0)
  const [running, setRunning] = useState(true)
  const rafRef = useRef()
  const tRef = useRef(0)

  const funcs = [
    { label: 'r=cos(3θ) Yaprak', fn: t => Math.cos(3*t) },
    { label: 'r=1+cos(θ) Kardiyoit', fn: t => 1+Math.cos(t) },
    { label: 'r=θ Spiral', fn: t => t/(2*Math.PI) },
    { label: 'r=cos(2θ) Gül', fn: t => Math.cos(2*t) },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W/2, cy = H/2, sc = 100
    const f = funcs[funcIdx].fn

    function draw() {
      ctx.clearRect(0,0,W,H); ctx.fillStyle='#fafaf8'; ctx.fillRect(0,0,W,H)
      const t = tRef.current

      for(let r=1;r<=2;r++){ctx.beginPath();ctx.arc(cx,cy,r*sc,0,Math.PI*2);ctx.strokeStyle='#e8e4dc';ctx.lineWidth=1;ctx.stroke()}
      for(let a=0;a<Math.PI*2;a+=Math.PI/6){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*sc*2,cy-Math.sin(a)*sc*2);ctx.strokeStyle='#e8e4dc';ctx.lineWidth=0.8;ctx.stroke()}
      ctx.strokeStyle='#a09990';ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke()
      ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke()

      const maxT=Math.min(t*0.04,4*Math.PI)
      ctx.strokeStyle='#3d5af1';ctx.lineWidth=2.5;ctx.beginPath()
      for(let i=0;i<=600;i++){
        const th=i/600*maxT
        const r=f(th)*sc
        const x=cx+r*Math.cos(th), y=cy-r*Math.sin(th)
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
      }
      ctx.stroke()

      if(maxT<4*Math.PI){
        const r=f(maxT)*sc
        ctx.beginPath();ctx.arc(cx+r*Math.cos(maxT),cy-r*Math.sin(maxT),6,0,Math.PI*2);ctx.fillStyle='#ef4444';ctx.fill()
      }

      ctx.fillStyle='#3d5af1';ctx.font='bold 11px JetBrains Mono';ctx.textAlign='left';ctx.fillText(funcs[funcIdx].label,8,20)

      if(running){tRef.current+=1;if(tRef.current>320)tRef.current=0;rafRef.current=requestAnimationFrame(draw)}
    }
    tRef.current=0;rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  },[funcIdx,running])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>r=f(θ)</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{...S.canvas,width:'100%'}} />
      <div style={S.controls}>
        <div><div style={S.label}>Eğri</div>
          <select value={funcIdx} onChange={e=>{setFuncIdx(+e.target.value);tRef.current=0}} style={{padding:'4px 8px',border:'1px solid #c7cdfa',borderRadius:'6px',background:'#eef0fe',color:'#3d5af1',fontFamily:'inherit',fontSize:'0.78rem'}}>
            {funcs.map((f,i)=><option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        <button style={S.btn} onClick={()=>setRunning(r=>!r)}>{running?'⏸':'▶'}</button>
        <button style={S.btn} onClick={()=>{tRef.current=0}}>↺</button>
      </div>
      {aciklama&&<div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 41. DİFERANSİYEL DENKLEM EĞİM ALANI ────────────────────────
export function SlopeField({ kavram = 'Diferansiyel Denklem — Eğim Alanı', aciklama }) {
  const canvasRef = useRef()
  const [funcIdx, setFuncIdx] = useState(0)
  const [showSolution, setShowSolution] = useState(true)

  const funcs = [
    { label: "y'=y", fn: (x,y)=>y },
    { label: "y'=-x/y", fn: (x,y)=>y!==0?-x/y:0 },
    { label: "y'=x+y", fn: (x,y)=>x+y },
    { label: "y'=sin(x)", fn: (x,y)=>Math.sin(x) },
    { label: "y'=x²-y", fn: (x,y)=>x*x-y },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W/2, cy = H/2, sc = 40
    const f = funcs[funcIdx].fn

    ctx.clearRect(0,0,W,H); ctx.fillStyle='#fafaf8'; ctx.fillRect(0,0,W,H)

    const step=28
    for(let px=step/2;px<W;px+=step){
      for(let py=step/2;py<H;py+=step){
        const x=(px-cx)/sc, y=-(py-cy)/sc
        const slope=f(x,y)
        if(!isFinite(slope)) continue
        const angle=Math.atan(slope), len=step*0.35
        const mag=Math.min(1,Math.abs(slope)/3)
        ctx.strokeStyle=`hsla(${220+mag*80},60%,55%,0.7)`;ctx.lineWidth=1.2
        ctx.beginPath()
        ctx.moveTo(px-Math.cos(angle)*len,py-Math.sin(angle)*len)
        ctx.lineTo(px+Math.cos(angle)*len,py+Math.sin(angle)*len)
        ctx.stroke()
      }
    }

    ctx.strokeStyle='#a09990';ctx.lineWidth=1.5
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke()
    ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke()

    if(showSolution){
      [-3,-2,-1,0,1,2,3].forEach(y0=>{
        ctx.strokeStyle='rgba(239,68,68,0.7)';ctx.lineWidth=1.8;ctx.beginPath()
        let x=-4, y=y0; ctx.moveTo(cx+x*sc,cy-y*sc)
        for(let i=0;i<200;i++){
          const s=f(x,y); if(!isFinite(s)) break
          y+=s*0.05; x+=0.05
          const px2=cx+x*sc, py2=cy-y*sc
          if(px2<0||px2>W||py2<0||py2>H) break
          ctx.lineTo(px2,py2)
        }
        ctx.stroke()
      })
    }

    ctx.fillStyle='#3d5af1';ctx.font='bold 12px JetBrains Mono';ctx.textAlign='left';ctx.fillText(funcs[funcIdx].label,8,20)
  },[funcIdx,showSolution])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>dy/dx=f(x,y)</span></div>
      <canvas ref={canvasRef} width={600} height={300} style={{...S.canvas,width:'100%'}} />
      <div style={S.controls}>
        <div><div style={S.label}>Denklem</div>
          <select value={funcIdx} onChange={e=>setFuncIdx(+e.target.value)} style={{padding:'4px 8px',border:'1px solid #c7cdfa',borderRadius:'6px',background:'#eef0fe',color:'#3d5af1',fontFamily:'inherit',fontSize:'0.78rem'}}>
            {funcs.map((f,i)=><option key={i} value={i}>{f.label}</option>)}
          </select>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <input type="checkbox" checked={showSolution} onChange={e=>setShowSolution(e.target.checked)} id="sol"/>
          <label htmlFor="sol" style={{fontSize:'0.78rem',color:'var(--ink2)',cursor:'pointer'}}>Çözüm eğrileri</label>
        </div>
      </div>
      {aciklama&&<div style={S.desc}>{aciklama}</div>}
    </div>
  )
}

// ─── 42. DİZİ YAKINSAMA ───────────────────────────────────────────
export function SequenceSeries({ kavram = 'Dizi ve Seri Yakınsaması', aciklama }) {
  const canvasRef = useRef()
  const [seriesIdx, setSeriesIdx] = useState(0)
  const [nTerms, setNTerms] = useState(15)

  const series = [
    { label: 'Σ 1/n²  → π²/6', fn: n=>1/(n*n), limit: Math.PI*Math.PI/6 },
    { label: 'Σ 1/2ⁿ  → 2', fn: n=>1/Math.pow(2,n), limit: 2 },
    { label: 'Σ (-1)ⁿ/n → ln2', fn: n=>Math.pow(-1,n+1)/n, limit: Math.log(2) },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const gx=50,gy=20,gw=W-70,gh=H-60
    const s = series[seriesIdx]

    const partials=[]
    let sum=0
    for(let n=1;n<=nTerms;n++){sum+=s.fn(n);partials.push({n,sum})}
    const allS=partials.map(p=>p.sum)
    const minS=Math.min(...allS,s.limit)*0.9, maxS=Math.max(...allS,s.limit)*1.15
    const range=maxS-minS||1
    const toX=n=>gx+(n-1)/(nTerms-1)*gw
    const toY=s=>gy+gh-(s-minS)/range*gh

    ctx.clearRect(0,0,W,H); ctx.fillStyle='#fafaf8'; ctx.fillRect(0,0,W,H)

    ctx.strokeStyle='#fbbf24';ctx.lineWidth=1.5;ctx.setLineDash([6,8])
    ctx.beginPath();ctx.moveTo(gx,toY(s.limit));ctx.lineTo(gx+gw,toY(s.limit));ctx.stroke();ctx.setLineDash([])
    ctx.fillStyle='#b45309';ctx.font='bold 10px JetBrains Mono';ctx.textAlign='right'
    ctx.fillText(`Limit=${s.limit.toFixed(4)}`,gx+gw,toY(s.limit)-5)

    partials.forEach(({n,sum},i)=>{
      const px=toX(n), py=toY(sum)
      if(i>0){ctx.strokeStyle='#3d5af1';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(toX(partials[i-1].n),toY(partials[i-1].sum));ctx.lineTo(px,py);ctx.stroke()}
      ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fillStyle='#3d5af1';ctx.fill()
      ctx.strokeStyle='rgba(239,68,68,0.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,toY(s.limit));ctx.stroke()
    })

    ctx.strokeStyle='#a09990';ctx.lineWidth=1.5
    ctx.beginPath();ctx.moveTo(gx,gy+gh);ctx.lineTo(gx+gw,gy+gh);ctx.stroke()
    for(let n=1;n<=nTerms;n+=Math.ceil(nTerms/8)){
      ctx.fillStyle='#6b6560';ctx.font='9px JetBrains Mono';ctx.textAlign='center';ctx.fillText(n,toX(n),gy+gh+14)
    }

    ctx.fillStyle='#3d5af1';ctx.font='bold 11px JetBrains Mono';ctx.textAlign='left';ctx.fillText(s.label,gx,16)
    const last=partials[nTerms-1]
    ctx.fillStyle='#6b6560';ctx.font='9px JetBrains Mono'
    ctx.fillText(`S${nTerms}=${last?.sum.toFixed(5)}  Hata:${Math.abs((last?.sum||0)-s.limit).toFixed(5)}`,gx,H-8)
  },[seriesIdx,nTerms])

  return (
    <div style={S.wrap}>
      <div style={S.topbar}><span style={S.title}>{kavram}</span><span style={S.badge}>Σaₙ yakınsar</span></div>
      <canvas ref={canvasRef} width={600} height={280} style={{...S.canvas,width:'100%'}} />
      <div style={S.controls}>
        <div><div style={S.label}>Seri</div>
          <select value={seriesIdx} onChange={e=>setSeriesIdx(+e.target.value)} style={{padding:'4px 8px',border:'1px solid #c7cdfa',borderRadius:'6px',background:'#eef0fe',color:'#3d5af1',fontFamily:'inherit',fontSize:'0.78rem'}}>
            {series.map((s,i)=><option key={i} value={i}>{s.label}</option>)}
          </select>
        </div>
        <Ctrl label="Terim sayısı n" min={3} max={50} step={1} value={nTerms} onChange={setNTerms} unit=""/>
      </div>
      {aciklama&&<div style={S.desc}>{aciklama}</div>}
    </div>
  )
}
