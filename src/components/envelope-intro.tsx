import { useEffect, useState, type PointerEvent } from 'react'
import { motion, useAnimate, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type AnimationSequence } from 'motion/react'
import { CONFIG } from '@/config'
import { DATA_CURTA } from '@/lib/evento'
import { musicaDesligada, TEM_MUSICA, tocar } from '@/lib/musica'
import { ARTE } from './jardim'
import { Lacre } from './ornaments'

const BOLSO_LATERAIS = 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)'
const BOLSO_FUNDO = 'polygon(0 100%, 50% 47%, 100% 100%)'
const ABA = 'polygon(0 0, 100% 0, 50% 100%)'

/* curvas */
const SUAVE = [0.22, 1, 0.36, 1] as const
const MOLA = [0.34, 1.32, 0.5, 1] as const // passa um pouquinho e volta
const ENTRA_SAI = [0.65, 0, 0.35, 1] as const

/* pseudo-aleatório determinístico (mesmo desenho a cada visita) */
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* faíscas que saem do lacre quando ele se rompe */
const FAISCAS = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2 + rnd(i, 1) * 0.4
  const dist = 70 + rnd(i, 2) * 70
  return {
    x: Math.cos(ang) * dist,
    y: Math.sin(ang) * dist * 0.85 - 10,
    s: 0.7 + rnd(i, 3) * 0.8,
    r: (rnd(i, 4) - 0.5) * 160,
    coracao: i % 3 === 0,
    cor: ['#e6aaa8', '#d9b77a', '#b0585f', '#f2cbc7'][i % 4],
  }
})

/* pétalas e pontinhos de luz subindo ao fundo */
const PETALAS = Array.from({ length: 16 }, (_, i) => ({
  left: `${rnd(i, 5) * 100}%`,
  tamanho: 5 + rnd(i, 6) * 9,
  duracao: 11 + rnd(i, 7) * 9,
  atraso: -rnd(i, 8) * 18,
  balanco: 14 + rnd(i, 9) * 26,
  cor: ['#f2cbc7', '#e6aaa8', '#ecd8a8', '#fbe3e7'][i % 4],
  petala: i % 2 === 0,
}))

export function EnvelopeIntro({ onAberto }: { onAberto: () => void }) {
  const [escopo, animar] = useAnimate()
  const [abrindo, setAbrindo] = useState(false)
  const reduzir = useReducedMotion()

  /* inclinação 3D que acompanha o mouse */
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const molaGiro = { stiffness: 140, damping: 16, mass: 0.6 }
  const giroY = useSpring(useTransform(px, [-1, 1], [-10, 10]), molaGiro)
  const giroX = useSpring(useTransform(py, [-1, 1], [8, -8]), molaGiro)
  const luzX = useSpring(useTransform(px, [-1, 1], [15, 85]), molaGiro)
  const luzY = useSpring(useTransform(py, [-1, 1], [10, 90]), molaGiro)
  const luz = useMotionTemplate`radial-gradient(circle at ${luzX}% ${luzY}%, rgb(255 255 255 / 0.42), transparent 55%)`

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  function mover(e: PointerEvent) {
    if (abrindo || reduzir || e.pointerType !== 'mouse') return
    px.set((e.clientX / innerWidth) * 2 - 1)
    py.set((e.clientY / innerHeight) * 2 - 1)
  }
  function centralizar() {
    px.set(0)
    py.set(0)
  }

  async function abrir() {
    if (abrindo) return
    setAbrindo(true)
    // o toque no envelope libera o áudio: a musiquinha começa junto com a abertura
    if (TEM_MUSICA && !musicaDesligada()) tocar()
    centralizar()
    if (reduzir) {
      onAberto()
      return
    }

    const faiscas: AnimationSequence = FAISCAS.map((f, i) => [
      `[data-faisca="${i}"]`,
      { x: [0, f.x], y: [0, f.y], scale: [0, f.s, 0], opacity: [1, 1, 0], rotate: [0, f.r] },
      { duration: 1.05, at: 0.3, ease: SUAVE },
    ])

    const ctl = animar([
      // 1. textos saem, envelope "afunda" com o toque
      ['[data-texto]', { opacity: 0, y: -14, filter: 'blur(6px)' }, { duration: 0.45, at: 0, ease: SUAVE }],
      ['[data-dica]', { opacity: 0, y: 10 }, { duration: 0.3, at: 0 }],
      ['[data-anel]', { opacity: 0 }, { duration: 0.2, at: 0 }],
      ['[data-brilho]', { opacity: 0 }, { duration: 0.3, at: 0 }],
      ['[data-envelope]', { scale: [1, 0.95, 1.015, 1] }, { duration: 0.7, at: 0, times: [0, 0.3, 0.7, 1], ease: 'easeOut' }],
      // 2. lacre se rompe em faíscas
      ['[data-selo]', { scale: [1, 1.2, 0.2], rotate: [0, -10, 30], opacity: [1, 1, 0] }, { duration: 0.6, at: 0.08, times: [0, 0.45, 1], ease: ENTRA_SAI }],
      ['[data-clarao]', { scale: [0.2, 2.4], opacity: [0.9, 0] }, { duration: 0.7, at: 0.3, ease: SUAVE }],
      ...faiscas,
      // 3. aba abre com balanço e sombra
      ['[data-aba]', { rotateX: 180 }, { duration: 0.95, at: 0.42, ease: MOLA }],
      ['[data-sombra-aba]', { opacity: [0, 0.45, 0] }, { duration: 0.6, at: 0.42, ease: 'easeInOut' }],
      ['[data-forro]', { opacity: 1 }, { duration: 0.01, at: 0.7 }],
      ['[data-aba]', { zIndex: 1 }, { duration: 0.01, at: 0.72 }],
      // 4. carta sobe
      ['[data-carta]', { y: '-60%', rotate: [0, -2, 0.6, 0] }, { duration: 1.05, at: 0.9, ease: MOLA }],
      ['[data-corpo]', { y: 22 }, { duration: 1, at: 0.9, ease: SUAVE }],
      // 5. carta vem para a frente e cresce; envelope desce
      ['[data-carta]', { zIndex: 9 }, { duration: 0.01, at: 1.75 }],
      ['[data-bolso]', { y: '45%', opacity: 0 }, { duration: 0.75, at: 1.78, ease: ENTRA_SAI }],
      ['[data-aba]', { opacity: 0 }, { duration: 0.4, at: 1.78 }],
      ['[data-forro-fundo]', { opacity: 0, y: '45%' }, { duration: 0.75, at: 1.78, ease: ENTRA_SAI }],
      ['[data-sombra-chao]', { opacity: 0, scaleX: 0.5 }, { duration: 0.6, at: 1.78 }],
      ['[data-carta]', { y: '-22%', scale: innerWidth < 640 ? 1.08 : 1.28 }, { duration: 0.85, at: 1.78, ease: SUAVE }],
      ['[data-petalas]', { opacity: 0 }, { duration: 0.8, at: 1.6 }],
    ])
    await ctl
    onAberto()
  }

  return (
    <motion.div
      ref={escopo}
      role="dialog"
      aria-modal="true"
      aria-label={`Convite para o chá de bebê da ${CONFIG.bebe}`}
      onPointerMove={mover}
      onPointerLeave={centralizar}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-9 overflow-hidden px-6 py-10"
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,#fffbf6_0%,#f7e6dc_55%,#efd2c6_100%)]" />
      <div aria-hidden="true" className="bg-grain absolute inset-0" />
      <motion.div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-[min(120vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff6f0_0%,transparent_65%)]"
        animate={reduzir ? undefined : { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* pétalas */}
      {!reduzir && (
        <div data-petalas aria-hidden="true" className="pointer-events-none absolute inset-0">
          {PETALAS.map((p, i) => (
            <motion.span
              key={i}
              className="absolute -bottom-6 block"
              style={{
                left: p.left,
                width: p.tamanho,
                height: p.petala ? p.tamanho * 1.3 : p.tamanho,
                background: p.cor,
                borderRadius: p.petala ? '80% 0 80% 0' : '50%',
                filter: p.petala ? undefined : 'blur(1px)',
              }}
              animate={{
                y: [0, -1100],
                x: [0, p.balanco, -p.balanco * 0.6, p.balanco * 0.4],
                rotate: [0, 220],
                opacity: [0, 0.85, 0.85, 0],
              }}
              transition={{ duration: p.duracao, delay: p.atraso, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.8, 1] }}
            />
          ))}
        </div>
      )}

      {/* título */}
      <div data-texto className="relative text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.7em' }}
          animate={{ opacity: 1, letterSpacing: '0.42em' }}
          transition={{ duration: 1.2, ease: SUAVE, delay: 0.15 }}
          className="text-foil animate-foil text-xs font-medium uppercase"
        >
          Chá de bebê
        </motion.p>
        <p className="mt-3 font-serif text-[28px] leading-tight text-foreground italic sm:text-4xl">
          {['Você', 'recebeu', '\n', 'um', 'convite', 'especial'].map((p, i) =>
            p === '\n' ? (
              <br key={i} />
            ) : (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: SUAVE, delay: 0.35 + i * 0.08 }}
              >
                {p}&nbsp;
              </motion.span>
            ),
          )}
        </p>
      </div>

      {/* envelope */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={
          abrindo || reduzir
            ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
            : { opacity: 1, scale: 1, y: [0, -10, 0], rotate: [-0.6, 0.6, -0.6] }
        }
        transition={
          abrindo || reduzir
            ? { duration: 0.35, ease: SUAVE }
            : {
                opacity: { duration: 0.9, delay: 0.5 },
                scale: { duration: 1, delay: 0.5, ease: SUAVE },
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
              }
        }
        style={{ perspective: 900 }}
      >
        <motion.button
          type="button"
          onClick={abrir}
          disabled={abrindo}
          aria-label="Abrir o convite"
          style={{ rotateX: giroX, rotateY: giroY, transformStyle: 'preserve-3d' }}
          whileHover={abrindo ? undefined : { scale: 1.02 }}
          whileTap={abrindo ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="group relative block w-[min(84vw,400px)] cursor-pointer rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-8 focus-visible:ring-offset-[#f7e6dc] disabled:cursor-default"
        >
          <div data-envelope className="relative aspect-[1.5] w-full" style={{ perspective: 1200 }}>
            <div
              data-sombra-chao
              aria-hidden="true"
              className="absolute -bottom-8 left-1/2 h-8 w-[84%] -translate-x-1/2 rounded-[50%] bg-[#96484f]/25 blur-xl"
            />

            <div data-corpo className="absolute inset-0">
              {/* forro interno */}
              <div data-forro-fundo className="bg-liner absolute inset-0 rounded-[10px]" />

              {/* carta */}
              <div
                data-carta
                className="absolute inset-x-[5%] top-[5%] z-[2] h-[88%] origin-bottom rounded-[6px] bg-card shadow-[0_2px_8px_rgb(74_34_48/0.1),0_30px_60px_-30px_rgb(110_40_60/0.45)]"
              >
                <div className="bg-grain absolute inset-0 rounded-[6px] opacity-50" />
                <div className="absolute inset-[7px] rounded-[3px] border border-gold/45" />
                <div className="absolute inset-[10px] rounded-[2px] border border-gold/20" />
                <div className="relative flex h-full flex-col items-center pt-[5%]">
                  <img src={ARTE.guirlanda} alt="" className="w-[58%] opacity-90" />
                  <span className="-mt-1 text-[9px] font-medium tracking-[0.36em] text-gold-ink uppercase">chá de bebê</span>
                  <span className="font-script text-[clamp(2.2rem,10vw,3.2rem)] leading-tight text-primary">{CONFIG.bebe}</span>
                  <span className="text-[10px] tracking-[0.3em] text-muted-foreground">{DATA_CURTA}</span>
                </div>
              </div>

              {/* bolso */}
              <div data-bolso className="absolute inset-0 z-[3]">
                <div className="absolute inset-0 drop-shadow-[0_-1px_2px_rgb(110_40_60/0.14)]">
                  <div className="absolute inset-0 rounded-[10px] bg-[linear-gradient(150deg,#fbe3e7,#f2c9d1)]" style={{ clipPath: BOLSO_LATERAIS }} />
                </div>
                <div className="absolute inset-0 drop-shadow-[0_-2px_3px_rgb(110_40_60/0.16)]">
                  <div className="absolute inset-0 rounded-[10px] bg-[linear-gradient(0deg,#edbdc7,#f7d9de)]" style={{ clipPath: BOLSO_FUNDO }} />
                </div>
              </div>

              {/* aba */}
              <motion.div
                data-aba
                className="absolute inset-x-0 top-0 z-[4] h-[60%] drop-shadow-[0_3px_4px_rgb(110_40_60/0.2)]"
                style={{ transformOrigin: 'top center' }}
              >
                <div className="absolute inset-0 rounded-t-[10px] bg-[linear-gradient(180deg,#f8d8de,#e9b2bd)]" style={{ clipPath: ABA }}>
                  <div data-forro className="bg-liner absolute inset-0 opacity-0" />
                  <div data-sombra-aba className="absolute inset-0 bg-[#6f2539] opacity-0" />
                </div>
              </motion.div>

              {/* brilho do papel: luz que segue o mouse + reflexo que passa */}
              <div data-brilho aria-hidden="true" className="pointer-events-none absolute inset-0 z-[6] overflow-hidden rounded-[10px] mix-blend-soft-light">
                <motion.div className="absolute inset-0" style={{ backgroundImage: luz }} />
                {!reduzir && (
                  <motion.div
                    className="absolute inset-y-0 w-1/2 bg-[linear-gradient(105deg,transparent_20%,rgb(255_255_255/0.75)_50%,transparent_80%)]"
                    initial={{ x: '-120%' }}
                    animate={{ x: ['-120%', '260%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut', delay: 1.6 }}
                  />
                )}
              </div>
            </div>

            {/* lacre + faíscas */}
            <div className="absolute top-[60%] left-1/2 z-[7] size-0">
              <span data-clarao aria-hidden="true" className="absolute -top-10 -left-10 size-20 rounded-full bg-white opacity-0 blur-md" />
              {FAISCAS.map((f, i) => (
                <span key={i} data-faisca={i} aria-hidden="true" className="absolute -top-1.5 -left-1.5 size-3 opacity-0" style={{ color: f.cor }}>
                  {f.coracao ? (
                    <svg viewBox="0 0 24 24" className="size-full" fill="currentColor">
                      <path d="M12 21s-7.5-4.6-9.6-9.3C.8 8 3 4 6.8 4c2.2 0 3.7 1.2 5.2 3 1.5-1.8 3-3 5.2-3C21 4 23.2 8 21.6 11.7 19.5 16.4 12 21 12 21z" />
                    </svg>
                  ) : (
                    <span className="block size-full rounded-full bg-current" />
                  )}
                </span>
              ))}
            </div>
            <div data-selo className="absolute top-[60%] left-1/2 z-[8] size-[clamp(66px,19vw,86px)] -translate-x-1/2 -translate-y-1/2">
              <motion.span
                data-anel
                aria-hidden="true"
                className="absolute -inset-2 rounded-full border-2 border-white/80"
                animate={reduzir ? undefined : { scale: [1, 1.45], opacity: [0.75, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <Lacre
                inicial={CONFIG.bebe.charAt(0)}
                className="size-full drop-shadow-[0_5px_8px_rgb(110_37_57/0.38)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6"
              />
            </div>
          </div>
        </motion.button>
      </motion.div>

      <motion.p
        data-dica
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.3, ease: SUAVE }}
        className="relative flex items-center gap-2.5 rounded-full bg-card/60 px-4 py-2 text-xs font-medium tracking-[0.32em] text-rose-ink uppercase shadow-soft ring-1 ring-border/60 backdrop-blur-sm"
      >
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
          <span className="relative size-2 rounded-full bg-primary" />
        </span>
        Toque para abrir
      </motion.p>
    </motion.div>
  )
}
