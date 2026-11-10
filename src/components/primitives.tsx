import { useEffect, useRef, type ReactNode } from 'react'
import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import type { Convidado } from '@/lib/guests'
import type { Status } from '@/lib/store'
import { cn } from '@/lib/utils'

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/* Fundo fixo: manchas de aquarela + textura de papel */
export function Fundo() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-[#f8d5dc]/60 blur-3xl" />
      <div className="absolute top-1/3 -right-48 size-[30rem] rounded-full bg-[#fde3d5]/60 blur-3xl" />
      <div className="absolute -bottom-48 left-1/4 size-[32rem] rounded-full bg-[#e3eee4]/55 blur-3xl" />
      <div className="bg-grain absolute inset-0 opacity-80" />
    </div>
  )
}

/* Cartão de papel com moldura dourada dupla */
export function CartaoPapel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('relative isolate rounded-[32px] bg-card shadow-card', className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[32px]">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,#fdecef_0%,transparent_100%)]" />
        <div className="bg-grain absolute inset-0 opacity-60" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[24px] border border-gold/45" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[17px] rounded-[20px] border border-gold/20" />
      {children}
    </div>
  )
}

/* Revela o conteúdo ao entrar na tela */
export function Revelar({
  children,
  className,
  atraso = 0,
}: {
  children: ReactNode
  className?: string
  atraso?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay: atraso, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

export function TituloSecao({
  id,
  sobretitulo,
  titulo,
  subtitulo,
}: {
  id: string
  sobretitulo: string
  titulo: ReactNode
  subtitulo?: ReactNode
}) {
  return (
    <Revelar className="mx-auto mb-10 max-w-xl text-center sm:mb-12">
      <p className="text-xs font-medium tracking-[0.34em] text-gold-ink uppercase">{sobretitulo}</p>
      <h2 id={id} className="mt-3 font-serif text-[40px] leading-[1.05] font-medium text-foreground sm:text-5xl">
        {titulo}
      </h2>
      {subtitulo && <p className="mx-auto mt-4 max-w-md text-[17px] leading-relaxed text-muted-foreground">{subtitulo}</p>}
    </Revelar>
  )
}

/* Avatar com iniciais */
const TONS = [
  'bg-[#fbe7eb] text-[#9e4259]',
  'bg-[#fcebdf] text-[#99512f]',
  'bg-[#efe7f6] text-[#674a86]',
  'bg-[#e6f0e8] text-[#45704f]',
  'bg-[#f6ecd9] text-[#80612c]',
]

export function Avatar({
  convidado,
  status,
  tamanho = 'md',
  className,
}: {
  convidado: Convidado
  status?: Status
  tamanho?: 'md' | 'lg'
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full font-serif font-semibold',
        tamanho === 'lg' ? 'size-16 text-[26px]' : 'size-11 text-[17px]',
        TONS[convidado.tom % TONS.length],
        className,
      )}
    >
      {convidado.iniciais}
      {status === 'sim' && (
        <span className="absolute -right-0.5 -bottom-0.5 grid size-[18px] place-items-center rounded-full bg-success text-white ring-2 ring-card">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
    </span>
  )
}

/* Dígitos que trocam com blur + deslize (contagem regressiva) */
export function Digitos({ valor, casas = 2, className }: { valor: number; casas?: number; className?: string }) {
  const texto = String(valor).padStart(casas, '0')
  return (
    <span className={cn('inline-flex justify-center tabular-nums lining-nums', className)}>
      {texto.split('').map((d, i) => (
        <span key={`${texto.length}-${i}`} className="relative inline-flex overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={d}
              className="inline-block"
              initial={{ y: '-65%', opacity: 0, filter: 'blur(5px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '65%', opacity: 0, filter: 'blur(5px)' }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

/* Número que conta até o valor */
export function NumeroAnimado({ valor, className }: { valor: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const anterior = useRef(0)
  const reduzir = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduzir) {
      el.textContent = String(valor)
      anterior.current = valor
      return
    }
    const controle = animate(anterior.current, valor, {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    anterior.current = valor
    return () => controle.stop()
  }, [valor, reduzir])
  return (
    <span ref={ref} className={cn('tabular-nums lining-nums', className)}>
      0
    </span>
  )
}
