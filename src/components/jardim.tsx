import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import borboleta from '@/assets/jardim/borboleta.webp'
import guirlanda from '@/assets/jardim/guirlanda.webp'
import ursinhos from '@/assets/jardim/ursinhos.webp'

export const ARTE = { borboleta, guirlanda, ursinhos }

/* =====================================================================
   Borboletas em SVG: duas asas separadas que batem em 3D a partir do
   corpo (ritmo "bate-bate-plana"), voando em curvas pelo jardim.
   As animações são CSS (src/index.css) e rodam também com "reduzir
   movimento" ligado: são decorativas, pequenas e lentas.
   ===================================================================== */

type Cor = 'rosa' | 'pessego' | 'lilas' | 'dourado'
const CORES: Record<Cor, { claro: string; meio: string; borda: string; corpo: string }> = {
  rosa: { claro: '#fff1f3', meio: '#f2b6c0', borda: '#c76a7a', corpo: '#6f3a40' },
  pessego: { claro: '#fff6ee', meio: '#f6c7a5', borda: '#d48a5c', corpo: '#6a4130' },
  lilas: { claro: '#fbf7ff', meio: '#d9c6ef', borda: '#9a7cc2', corpo: '#4f3a5f' },
  dourado: { claro: '#fffaf0', meio: '#f1dba6', borda: '#c39a4f', corpo: '#5f4a2a' },
}

/** Uma asa (lado esquerdo; o direito é espelhado) */
function Asa({ cor, id }: { cor: Cor; id: string }) {
  const c = CORES[cor]
  return (
    <svg viewBox="0 0 52 72" className="block size-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}a`} cx="1" cy=".45" r="1.05">
          <stop offset="0" stopColor={c.claro} />
          <stop offset=".55" stopColor={c.meio} />
          <stop offset="1" stopColor={c.borda} />
        </radialGradient>
        <radialGradient id={`${id}b`} cx="1" cy=".2" r="1">
          <stop offset="0" stopColor={c.claro} />
          <stop offset=".6" stopColor={c.meio} />
          <stop offset="1" stopColor={c.borda} stopOpacity=".9" />
        </radialGradient>
      </defs>
      {/* asa traseira */}
      <path
        d="M52 36 C40 37 20 42 15 54 C11 64 21 72 32 64 C41 57 47 47 52 40 Z"
        fill={`url(#${id}b)`}
        stroke={c.borda}
        strokeOpacity=".55"
        strokeWidth=".8"
      />
      {/* asa dianteira */}
      <path
        d="M52 33 C43 10 17 -2 5 7 C-2 13 4 29 20 34 C33 38 44 37 52 36 Z"
        fill={`url(#${id}a)`}
        stroke={c.borda}
        strokeOpacity=".6"
        strokeWidth=".8"
      />
      {/* nervuras */}
      <path d="M50 33 C38 22 24 13 10 10 M50 34 C36 30 22 28 9 22 M50 38 C40 44 30 52 22 60" fill="none" stroke={c.borda} strokeOpacity=".28" strokeWidth=".7" />
      {/* pintinhas na borda */}
      <g fill="#fff" fillOpacity=".85">
        <circle cx="9" cy="11" r="1.6" />
        <circle cx="6" cy="18" r="1.2" />
        <circle cx="14" cy="6.5" r="1.1" />
        <circle cx="19" cy="62" r="1.3" />
        <circle cx="25" cy="66" r="1" />
      </g>
      {/* brilho */}
      <ellipse cx="30" cy="20" rx="10" ry="4" fill="#fff" opacity=".35" transform="rotate(28 30 20)" />
    </svg>
  )
}

export function BorboletaArte({ cor = 'rosa', tamanho = 40, ritmo = 1.5 }: { cor?: Cor; tamanho?: number; ritmo?: number }) {
  const id = useId().replace(/:/g, '')
  const c = CORES[cor]
  return (
    <span
      aria-hidden="true"
      className="borboleta relative block"
      style={{ width: tamanho, height: tamanho * 0.7, '--bater': `${ritmo}s` } as CSSProperties}
    >
      <span className="corpo-3d absolute inset-0">
        <span className="asa asa-esq absolute top-0 left-0 h-full w-1/2">
          <Asa cor={cor} id={`${id}e`} />
        </span>
        <span className="asa asa-dir absolute top-0 right-0 h-full w-1/2">
          <span className="block size-full -scale-x-100">
            <Asa cor={cor} id={`${id}d`} />
          </span>
        </span>
        {/* corpo e antenas */}
        <svg viewBox="0 0 10 72" className="absolute top-0 left-1/2 h-full w-[10%] -translate-x-1/2 overflow-visible" aria-hidden="true">
          <path d="M5 16 C3 8 1 4 -3 0 M5 16 C7 8 9 4 13 0" fill="none" stroke={c.corpo} strokeWidth=".9" strokeLinecap="round" />
          <circle cx="-3" cy="0" r="1.3" fill={c.corpo} />
          <circle cx="13" cy="0" r="1.3" fill={c.corpo} />
          <ellipse cx="5" cy="38" rx="2.6" ry="22" fill={c.corpo} />
          <circle cx="5" cy="15" r="3.2" fill={c.corpo} />
        </svg>
      </span>
    </span>
  )
}

export type Voo = {
  className: string
  tamanho: number
  cor?: Cor
  /** amplitude do passeio (px) */
  ax: number
  ay: number
  duracao: number
  atraso: number
  /** inclinação base (graus) */
  giro?: number
  /** trajeto: 'a' ou 'b' */
  trajeto?: 'a' | 'b'
}

/** Borboleta que passeia em loop perto de um elemento (o pai precisa ser relative) */
export function Borboleta({ voo, visivel = true }: { voo: Voo; visivel?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-10 transition-[opacity,scale] duration-700 ease-out',
        visivel ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        voo.className,
      )}
      style={{ transitionDelay: visivel ? `${voo.atraso}s` : '0s' }}
    >
      <div
        className={voo.trajeto === 'b' ? 'voo-b' : 'voo-a'}
        style={
          {
            '--ax': `${voo.ax}px`,
            '--ay': `${voo.ay}px`,
            '--giro': `${voo.giro ?? 0}deg`,
            animationDuration: `${voo.duracao}s`,
            animationDelay: `${-voo.atraso * 2}s`,
          } as CSSProperties
        }
      >
        <div className="flutuar drop-shadow-[0_8px_8px_rgb(150_72_79/0.18)]">
          <BorboletaArte cor={voo.cor} tamanho={voo.tamanho} ritmo={1.3 + (voo.tamanho % 5) * 0.12} />
        </div>
      </div>
    </div>
  )
}

export const VOOS: Record<'hero' | 'secao', Voo[]> = {
  hero: [
    { className: '-left-3 top-[30%] sm:-left-12', tamanho: 44, cor: 'rosa', ax: 26, ay: 34, duracao: 9, atraso: 1.4, giro: -14 },
    { className: '-right-2 top-[56%] sm:-right-11', tamanho: 36, cor: 'pessego', ax: -24, ay: 26, duracao: 10.5, atraso: 1.9, giro: 16, trajeto: 'b' },
    { className: 'right-[12%] -top-3 hidden sm:block', tamanho: 28, cor: 'lilas', ax: -18, ay: 16, duracao: 8, atraso: 2.4, giro: 8 },
  ],
  secao: [
    { className: 'right-2 -top-4 sm:right-[12%]', tamanho: 36, cor: 'dourado', ax: -20, ay: 18, duracao: 8.5, atraso: 0.4, giro: 12 },
    { className: 'left-3 top-[30%] sm:left-[8%]', tamanho: 30, cor: 'rosa', ax: 22, ay: 20, duracao: 9.5, atraso: 0.8, giro: -10, trajeto: 'b' },
  ],
}

/* ---------------------------------------------------------------------
   Revoada: de tempos em tempos, borboletas atravessam a tela inteira.
   --------------------------------------------------------------------- */
const REVOADA: { cor: Cor; tamanho: number; topo: string; duracao: number; atraso: number; volta?: boolean }[] = [
  { cor: 'rosa', tamanho: 34, topo: '22%', duracao: 26, atraso: 6 },
  { cor: 'lilas', tamanho: 26, topo: '58%', duracao: 32, atraso: 17, volta: true },
  { cor: 'pessego', tamanho: 30, topo: '78%', duracao: 29, atraso: 30 },
  { cor: 'dourado', tamanho: 24, topo: '40%', duracao: 35, atraso: 44, volta: true },
]

export function Revoada({ visivel = true }: { visivel?: boolean }) {
  if (!visivel) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {REVOADA.map((b, i) => (
        <div
          key={i}
          className={cn('absolute left-0', b.volta ? 'atravessar-volta' : 'atravessar')}
          style={{ top: b.topo, animationDuration: `${b.duracao}s`, animationDelay: `${b.atraso}s` }}
        >
          <div className="flutuar-alto">
            <div style={{ rotate: b.volta ? '-72deg' : '72deg' }} className="drop-shadow-[0_10px_10px_rgb(150_72_79/0.16)]">
              <BorboletaArte cor={b.cor} tamanho={b.tamanho} ritmo={1.1 + i * 0.15} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
