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
  { keys: ['fourier', 'spektrum'], Component: FourierSeries },
  { keys: ['atom', 'elektron', 'yörünge', 'bohr', 'orbital'], Component: AtomModel },
  { keys: ['dna', 'sarmal', 'nükleotid', 'gen', 'kromatit'], Component: DNAHelix },
  { keys: ['fonksiyon', 'eğri', 'trigonometri', 'sinüs', 'kosinüs'], Component: FunctionPlotter },
  { keys: ['vektör', 'kuvvet alanı', 'manyetik alan', 'elektrik alan'], Component: VectorField },
  { keys: ['kinetik', 'kinemati', 'mertebe', 'atış', 'parabol'], Component: Kinematics },
  { keys: ['ohm', 'devre', 'akım', 'direnç', 'gerilim'], Component: OhmCircuit },
  { keys: ['fotosentez', 'ağaç', 'yaprak', 'klorofil', 'bitki'], Component: TreePhotosynthesis },
  { keys: ['güneş panel', 'solar', 'fotovoltaik', 'güneş enerjisi'], Component: SolarPanel },
  { keys: ['rüzgar türbin', 'rüzgar enerjisi', 'yeldeğirmeni'], Component: WindTurbine },
  { keys: ['hidroelektrik', 'su enerjisi', 'baraj', 'su döngüsü', 'nehir'], Component: WaterHydro },
  { keys: ['mitoz', 'hücre bölünme', 'mayoz', 'kromozom', 'profaz', 'metafaz'], Component: CellDivision },
  { keys: ['kan dolaşım', 'kalp', 'damar', 'aort', 'pulmoner', 'sistol'], Component: BloodCirculation },
  { keys: ['lens', 'kırılma', 'mercek', 'odak', 'konveks', 'konkav', 'optik'], Component: LensRefraction },
  { keys: ['çarpışma', 'momentum', 'elastik', 'çarpma', 'kinetik enerji korunumu'], Component: Collision },
  { keys: ['türev', 'teğet', 'diferansiyel', 'eğim', 'limit'], Component: Derivative },
  { keys: ['sera etkisi', 'küresel ısınma', 'iklim', 'karbon'], Component: GreenhouseEffect },
  { keys: ['nükleer', 'fisyon', 'füzyon', 'radyoaktif', 'uranyum', 'nötron'], Component: NuclearFission },
]

export function AutoViz({ kavram = '', aciklama = '' }) {
  const lower = kavram.toLowerCase()
  const match = KEYWORD_MAP.find(m => m.keys.some(k => lower.includes(k)))
  const Component = match?.Component || BHMSpring
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
