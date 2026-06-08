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
  { keys: ['dalga süperpozisyon', 'girişim', 'interferans', 'superposition'], Component: WaveSuperposition },
  { keys: ['fourier', 'harmonik', 'spektrum'], Component: FourierSeries },
  { keys: ['atom', 'elektron', 'yörünge', 'bohr', 'orbital'], Component: AtomModel },
  { keys: ['dna', 'sarmal', 'nükleotid', 'gen', 'kromatit'], Component: DNAHelix },
  { keys: ['fonksiyon', 'grafik', 'eğri', 'trigonometri', 'sinüs', 'kosinüs'], Component: FunctionPlotter },
  { keys: ['vektör', 'alan', 'kuvvet alanı', 'manyetik', 'elektrik alan'], Component: VectorField },
  { keys: ['kinetik', 'kinemati', 'mertebe', 'atış', 'parabol', 'projectile'], Component: Kinematics },
  { keys: ['ohm', 'devre', 'akım', 'direnç', 'gerilim'], Component: OhmCircuit },
]

export function AutoViz({ kavram = '', aciklama = '' }) {
  const lower = kavram.toLowerCase()
  const match = KEYWORD_MAP.find(m => m.keys.some(k => lower.includes(k)))
  const Component = match?.Component || BHMSpring
  return <Component kavram={kavram} aciklama={aciklama} />
}

export default AutoViz
