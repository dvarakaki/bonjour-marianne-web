import { useId } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const useSvgId = () => useId().replace(/[^a-zA-Z0-9_-]/g, '')
const EASE_DRAW = [0.65, 0, 0.35, 1] as const

/* ------------------------------------------------------------------ */
/* Laço                                                                */
/* ------------------------------------------------------------------ */
export function Laco({ className }: { className?: string }) {
  const id = useSvgId()
  return (
    <svg viewBox="0 0 140 92" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8d3da" />
          <stop offset="0.55" stopColor="#e79aac" />
          <stop offset="1" stopColor="#c86a81" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d97a90" />
          <stop offset="1" stopColor="#a9465e" />
        </linearGradient>
      </defs>
      {/* fitas */}
      <path d="M64 46C58 58 50 70 41 86L50 82L54 90C60 75 66 60 69 48Z" fill={`url(#${id}b)`} />
      <path d="M76 46C82 58 90 70 99 86L90 82L86 90C80 75 74 60 71 48Z" fill={`url(#${id}b)`} />
      {/* alças */}
      <path d="M70 42C56 22 30 7 16 15C3 23 8 47 25 52C39 57 56 52 70 42Z" fill={`url(#${id}a)`} />
      <path d="M70 42C84 22 110 7 124 15C137 23 132 47 115 52C101 57 84 52 70 42Z" fill={`url(#${id}a)`} />
      <path d="M70 42C58 31 40 25 29 29C40 30 55 36 66 45Z" fill="#a9465e" opacity=".22" />
      <path d="M70 42C82 31 100 25 111 29C100 30 85 36 74 45Z" fill="#a9465e" opacity=".22" />
      <path d="M24 21C35 16 49 23 59 32" stroke="#fff" strokeOpacity=".65" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M116 21C105 16 91 23 81 32" stroke="#fff" strokeOpacity=".65" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* nó */}
      <rect x="61" y="33" width="18" height="20" rx="7.5" fill={`url(#${id}b)`} />
      <path d="M64.5 37.5C67.5 35.5 72.5 35.5 75.5 37.5" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Torre Eiffel em traço, desenhada da base ao topo                    */
/* ------------------------------------------------------------------ */
const TORRE = [
  'M6 236H44', 'M76 236H114',
  'M12 236C24 210 33 184 36 160', 'M108 236C96 210 87 184 84 160',
  'M42 236C44 200 76 200 78 236',
  'M29 186H91',
  'M30 152H90V160H30Z',
  'M38 152C41 136 44 122 47 108', 'M82 152C79 136 76 122 73 108',
  'M40.9 138H79.1', 'M44.1 122H75.9',
  'M40.9 138L75.9 122', 'M79.1 138L44.1 122',
  'M42 102H78V108H42Z',
  'M50 102C52 76 54 52 56.5 30', 'M70 102C68 76 66 52 63.5 30',
  'M51.6 84H68.4', 'M53.3 66H66.7', 'M54.9 48H65.1',
  'M50.4 100L68.4 84M69.6 100L51.6 84',
  'M51.6 84L66.7 66M68.4 84L53.3 66',
  'M53.3 66L65.1 48M66.7 66L54.9 48',
  'M56 30H64V22H56Z', 'M58 22L60 14L62 22', 'M60 14V4',
]

export function TorreEiffel({
  className,
  desenhar = true,
  atraso = 0,
}: {
  className?: string
  desenhar?: boolean
  atraso?: number
}) {
  return (
    <svg
      viewBox="0 0 120 240"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {TORRE.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={desenhar ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: 1.1, delay: atraso + i * 0.045, ease: EASE_DRAW },
            opacity: { duration: 0.15, delay: atraso + i * 0.045 },
          }}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Ramo floral                                                         */
/* ------------------------------------------------------------------ */
const FOLHA = 'M0 0C4 -5 11 -7 17 -5C11 -1 5 2 0 0Z'
const FOLHAS: [number, number, number, string][] = [
  [91.3, 46, 228, '#b7ceba'],
  [71.9, 40.4, 168, '#cfe0d1'],
  [51.9, 33.2, 230, '#b7ceba'],
  [31.3, 24.4, 170, '#cfe0d1'],
  [62, 37, 214, '#c3d7c5'],
]

function Flor({ x, y, r = 3.2 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={x + Math.cos((a * Math.PI) / 180) * r * 1.1}
          cy={y + Math.sin((a * Math.PI) / 180) * r * 1.1}
          r={r}
          fill="#f3c4ce"
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.55} fill="#d9b77a" />
    </g>
  )
}

export function Ramo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 112 56" className={className} aria-hidden="true">
      <path d="M110 50Q64 42 10 14" stroke="#9db8a2" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {FOLHAS.map(([x, y, a, cor]) => (
        <path key={`${x}-${y}`} d={FOLHA} fill={cor} transform={`translate(${x} ${y}) rotate(${a})`} />
      ))}
      <ellipse cx="81" cy="42" rx="3" ry="2.2" fill="#f6d0d8" transform="rotate(-20 81 42)" />
      <Flor x={11} y={14} />
      <Flor x={42} y={27.5} r={2.3} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Divisor com losango dourado                                         */
/* ------------------------------------------------------------------ */
export function Divisor({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70 sm:w-24" />
      <svg viewBox="0 0 24 12" className="w-6 text-gold">
        <path d="M12 1L17 6L12 11L7 6Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="2.5" cy="6" r="1" fill="currentColor" />
        <circle cx="21.5" cy="6" r="1" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70 sm:w-24" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Brilho de 4 pontas                                                  */
/* ------------------------------------------------------------------ */
export function Brilho({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 0C12.6 6.5 17.5 11.4 24 12C17.5 12.6 12.6 17.5 12 24C11.4 17.5 6.5 12.6 0 12C6.5 11.4 11.4 6.5 12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Lacre de cera com borda orgânica                                    */
/* ------------------------------------------------------------------ */
const BORDA_LACRE = (() => {
  const n = 72
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const r = 44 * (1 + 0.04 * Math.sin(6 * t) + 0.024 * Math.sin(13 * t + 1.1) + 0.016 * Math.cos(19 * t + 0.4))
    pts.push([50 + r * Math.cos(t), 50 + r * Math.sin(t)])
  }
  const f = (p: [number, number]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`
  const meio = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${f(meio(pts[0], pts[1]))}`
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n]
    d += `Q${f(p)} ${f(meio(p, pts[(i + 1) % n]))}`
  }
  return `${d}Z`
})()

export function Lacre({ inicial, className }: { inicial: string; className?: string }) {
  const id = useSvgId()
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}c`} cx=".36" cy=".3" r=".85">
          <stop offset="0" stopColor="#dc8b9d" />
          <stop offset=".5" stopColor="#b44d64" />
          <stop offset="1" stopColor="#87354b" />
        </radialGradient>
      </defs>
      <path d={BORDA_LACRE} fill={`url(#${id}c)`} />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#6f2539" strokeOpacity=".4" strokeWidth="2.6" />
      <circle cx="49.3" cy="49.3" r="31" fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="1" />
      <text x="51" y="52" textAnchor="middle" dominantBaseline="central" fontFamily="Great Vibes, cursive" fontSize="44" fill="#6f2539" fillOpacity=".55">
        {inicial}
      </text>
      <text x="50" y="51" textAnchor="middle" dominantBaseline="central" fontFamily="Great Vibes, cursive" fontSize="44" fill="#fde8ec">
        {inicial}
      </text>
      <ellipse cx="35" cy="28" rx="11" ry="5.5" fill="#fff" opacity=".2" transform="rotate(-32 35 28)" />
    </svg>
  )
}
