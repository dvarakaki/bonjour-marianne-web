import { useEffect, useState } from 'react'
import { motion, useAnimate, useReducedMotion } from 'motion/react'
import { CONFIG } from '@/config'
import { primeiroNome, type Convidado } from '@/lib/guests'
import { DATA_CURTA } from '@/lib/evento'
import { Lacre } from './ornaments'

const BOLSO_LATERAIS = 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)'
const BOLSO_FUNDO = 'polygon(0 100%, 50% 47%, 100% 100%)'
const ABA = 'polygon(0 0, 100% 0, 50% 100%)'

export function EnvelopeIntro({ convidado, onAberto }: { convidado?: Convidado; onAberto: () => void }) {
  const [escopo, animar] = useAnimate()
  const [abrindo, setAbrindo] = useState(false)
  const reduzir = useReducedMotion()

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  async function abrir() {
    if (abrindo) return
    setAbrindo(true)
    if (reduzir) {
      onAberto()
      return
    }
    await animar([
      ['[data-texto]', { opacity: 0, y: -8 }, { duration: 0.3, at: 0 }],
      ['[data-anel]', { opacity: 0 }, { duration: 0.2, at: 0 }],
      ['[data-selo]', { scale: [1, 1.14, 0.4], opacity: [1, 1, 0] }, { duration: 0.5, at: 0, ease: 'easeInOut' }],
      ['[data-aba]', { rotateX: 180 }, { duration: 0.75, at: 0.3, ease: [0.65, 0, 0.35, 1] }],
      ['[data-forro]', { opacity: 1 }, { duration: 0.01, at: 0.66 }],
      ['[data-aba]', { zIndex: 1 }, { duration: 0.01, at: 0.67 }],
      ['[data-carta]', { y: '-58%' }, { duration: 0.95, at: 0.85, ease: [0.22, 1, 0.36, 1] }],
      ['[data-envelope]', { y: 28 }, { duration: 0.95, at: 0.85, ease: [0.22, 1, 0.36, 1] }],
    ])
    onAberto()
  }

  return (
    <motion.div
      ref={escopo}
      role="dialog"
      aria-modal="true"
      aria-label={`Convite para o chá de bebê da ${CONFIG.bebe}`}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-10 overflow-hidden px-6 py-10"
      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,#fffaf8_0%,#fbe8ec_55%,#f3cfd7_100%)]" />
      <div aria-hidden="true" className="bg-grain absolute inset-0" />

      <div data-texto className="relative text-center">
        <p className="text-foil text-xs font-medium tracking-[0.42em] uppercase">Chá de bebê</p>
        <p className="mt-3 font-serif text-[28px] leading-tight text-foreground italic sm:text-4xl">
          {convidado ? `${primeiroNome(convidado.nome)}, você recebeu` : 'Você recebeu'}
          <br />
          um convite especial
        </p>
      </div>

      <motion.div
        className="relative"
        animate={abrindo ? { y: 0 } : { y: [0, -10, 0] }}
        transition={abrindo ? { duration: 0.3 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <button
          type="button"
          onClick={abrir}
          disabled={abrindo}
          aria-label="Abrir o convite"
          className="group relative block w-[min(84vw,400px)] cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-8 focus-visible:ring-offset-[#fbe8ec]"
        >
          <div data-envelope className="relative aspect-[1.5] w-full" style={{ perspective: 1200 }}>
            <div aria-hidden="true" className="absolute -bottom-7 left-1/2 h-7 w-[82%] -translate-x-1/2 rounded-[50%] bg-[#9e4259]/25 blur-xl" />

            {/* forro interno */}
            <div className="bg-liner absolute inset-0 rounded-[10px]" />

            {/* carta */}
            <div
              data-carta
              className="absolute inset-x-[5%] top-[5%] z-[2] h-[88%] rounded-[6px] bg-card shadow-[0_2px_8px_rgb(74_34_48/0.1)]"
            >
              <div className="absolute inset-[7px] rounded-[3px] border border-gold/45" />
              <div className="flex h-full flex-col items-center pt-[8%]">
                <span className="text-[9px] font-medium tracking-[0.36em] text-gold-ink uppercase">chá de bebê</span>
                <span className="font-script text-[clamp(2.4rem,11vw,3.4rem)] leading-tight text-primary">
                  {CONFIG.bebe}
                </span>
                <span className="text-[10px] tracking-[0.3em] text-muted-foreground">{DATA_CURTA}</span>
              </div>
            </div>

            {/* bolso */}
            <div className="absolute inset-0 z-[3] drop-shadow-[0_-1px_2px_rgb(110_40_60/0.14)]">
              <div
                className="absolute inset-0 rounded-[10px] bg-[linear-gradient(150deg,#fbe3e7,#f2c9d1)]"
                style={{ clipPath: BOLSO_LATERAIS }}
              />
            </div>
            <div className="absolute inset-0 z-[3] drop-shadow-[0_-2px_3px_rgb(110_40_60/0.16)]">
              <div
                className="absolute inset-0 rounded-[10px] bg-[linear-gradient(0deg,#edbdc7,#f7d9de)]"
                style={{ clipPath: BOLSO_FUNDO }}
              />
            </div>

            {/* aba */}
            <motion.div
              data-aba
              className="absolute inset-x-0 top-0 z-[4] h-[60%] drop-shadow-[0_3px_4px_rgb(110_40_60/0.2)]"
              style={{ transformOrigin: 'top center' }}
            >
              <div
                className="absolute inset-0 rounded-t-[10px] bg-[linear-gradient(180deg,#f8d8de,#e9b2bd)]"
                style={{ clipPath: ABA }}
              >
                <div data-forro className="bg-liner absolute inset-0 opacity-0" />
              </div>
            </motion.div>

            {/* lacre */}
            <div
              data-selo
              className="absolute top-[60%] left-1/2 z-[5] size-[clamp(66px,19vw,86px)] -translate-x-1/2 -translate-y-1/2"
            >
              <motion.span
                data-anel
                aria-hidden="true"
                className="absolute -inset-2 rounded-full border-2 border-white/80"
                animate={{ scale: [1, 1.4], opacity: [0.75, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
              />
              <Lacre
                inicial={CONFIG.bebe.charAt(0)}
                className="size-full drop-shadow-[0_5px_8px_rgb(110_37_57/0.38)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </button>
      </motion.div>

      <p data-texto className="relative flex items-center gap-2.5 text-xs font-medium tracking-[0.32em] text-rose-ink uppercase">
        <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-primary" />
        Toque para abrir
      </p>
    </motion.div>
  )
}
