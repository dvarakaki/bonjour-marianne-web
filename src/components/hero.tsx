import type { Ref } from 'react'
import { motion, type Variants } from 'motion/react'
import { CircleCheck, Gift, Heart, PartyPopper } from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { useContagem } from '@/hooks/use-browser'
import { useRespostas } from '@/hooks/use-respostas'
import { ANO, DIA, DIA_SEMANA, FIM, HORA_INICIO, INICIO, MES } from '@/lib/evento'
import { ARTE, Borboleta, VOOS } from './jardim'
import { Brilho, Divisor } from './ornaments'
import { CartaoPapel, Digitos, EASE_OUT } from './primitives'

const cartao: Variants = {
  oculto: { opacity: 0, y: 32, scale: 0.985 },
  visivel: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_OUT, staggerChildren: 0.085, delayChildren: 0.2 },
  },
}
const item: Variants = {
  oculto: { opacity: 0, y: 16 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}
const guirlanda: Variants = {
  oculto: { opacity: 0, y: -18, scale: 1.04 },
  visivel: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.1, ease: EASE_OUT } },
}
const ursinhos: Variants = {
  oculto: { opacity: 0, y: 24, scale: 0.96 },
  visivel: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: EASE_OUT } },
}
const nome: Variants = {
  oculto: { clipPath: 'inset(0% 100% 0% 0%)' },
  visivel: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.15 } },
}

type Props = {
  pronto: boolean
  onConfirmar: () => void
  ctaRef: Ref<HTMLDivElement>
}

export function Hero({ pronto, onConfirmar, ctaRef }: Props) {
  const { minha } = useRespostas()

  return (
    <section aria-labelledby="titulo-convite" className="relative px-4 pt-10 pb-10 sm:pt-16 sm:pb-16">
      <motion.div initial="oculto" animate={pronto ? 'visivel' : 'oculto'} variants={cartao} className="relative mx-auto max-w-[580px]">
        {VOOS.hero.map((v, i) => (
          <Borboleta key={i} voo={v} visivel={pronto} />
        ))}
        <CartaoPapel className="overflow-hidden px-6 pb-12 text-center sm:px-14 sm:pb-14">
          {/* guirlanda de rosas no topo, desbotando para o papel */}
          <motion.img
            variants={guirlanda}
            src={ARTE.guirlanda}
            alt=""
            width={900}
            height={191}
            className="pointer-events-none relative -mx-6 block w-[calc(100%+3rem)] max-w-none select-none [mask-image:linear-gradient(#000_55%,transparent)] sm:-mx-14 sm:w-[calc(100%+7rem)]"
          />


          <motion.p variants={item} className="text-foil animate-foil text-[13px] font-medium tracking-[0.42em] uppercase">
            Chá de bebê
          </motion.p>

          <h1 id="titulo-convite" tabIndex={-1} className="relative mt-3 outline-none">
            <motion.span variants={item} className="block font-serif text-[26px] leading-tight text-muted-foreground italic sm:text-[32px]">
              {CONFIG.saudacao}
            </motion.span>
            <motion.span
              variants={nome}
              className="-mx-6 block bg-gradient-to-b from-[#c47a74] to-[#8f4a4b] bg-clip-text px-6 pb-3 font-script text-[clamp(4.6rem,21vw,7.6rem)] leading-[1.08] text-transparent"
            >
              {CONFIG.bebe}
            </motion.span>
            <Brilhos pronto={pronto} />
          </h1>

          <motion.figure variants={ursinhos} className="relative -mx-2 mt-1 sm:-mx-6">
            <img
              src={ARTE.ursinhos}
              alt="Dois ursinhos sentados num jardim florido, com regador e cesta de flores"
              width={900}
              height={499}
              className="block aspect-[900/499] w-full rounded-[26px] object-cover shadow-soft ring-1 ring-border/70"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[26px] shadow-[inset_0_0_40px_rgb(251_244_236/0.55)]" />
          </motion.figure>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-[30ch] font-serif text-[22px] leading-snug text-foreground sm:text-[26px]"
          >
            {CONFIG.mensagem}
          </motion.p>
          <motion.p variants={item} className="mt-4 font-serif text-lg text-muted-foreground italic">
            Com amor, <span className="font-semibold text-rose-ink not-italic">{CONFIG.anfitrioes}</span>
          </motion.p>

          <motion.div variants={item}>
            <Divisor className="my-8" />
          </motion.div>

          <motion.div variants={item}>
            <BlocoData />
          </motion.div>

          <motion.div variants={item} className="mt-8">
            <Contagem />
          </motion.div>

          <motion.div variants={item} ref={ctaRef} className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={onConfirmar} className="sm:min-w-56">
              {minha?.status === 'sim' ? <CircleCheck /> : <Heart />}
              {minha ? 'Ver minha resposta' : 'Confirmar presença'}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#presentes">
                <Gift />
                Lista de presentes
              </a>
            </Button>
          </motion.div>
        </CartaoPapel>
      </motion.div>
    </section>
  )
}

function Brilhos({ pronto }: { pronto: boolean }) {
  const pontos = [
    { className: 'top-[46%] left-[6%] size-4 text-gold', atraso: 1.7 },
    { className: 'top-[30%] right-[8%] size-5 text-blush-300', atraso: 1.95 },
    { className: 'bottom-[6%] right-[20%] size-3 text-gold', atraso: 2.15 },
  ]
  return (
    <>
      {pontos.map((p) => (
        <motion.span
          key={p.className}
          aria-hidden="true"
          className={`absolute ${p.className}`}
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={pronto ? { opacity: [0, 1, 0.85], scale: [0, 1.25, 1], rotate: 0 } : undefined}
          transition={{ duration: 0.9, delay: p.atraso, ease: EASE_OUT }}
        >
          <Brilho className="size-full" />
        </motion.span>
      ))}
    </>
  )
}

function BlocoData() {
  return (
    <div className="mx-auto max-w-sm">
      <p className="sr-only">
        {DIA_SEMANA}, {DIA} de {MES} de {ANO}, às {HORA_INICIO}
      </p>
      <div aria-hidden="true" className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span className="border-y border-gold/45 py-2.5 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
          {DIA_SEMANA}
        </span>
        <span className="font-serif text-[76px] leading-[0.9] font-medium text-primary lining-nums">{DIA}</span>
        <span className="border-y border-gold/45 py-2.5 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
          às {HORA_INICIO}
        </span>
      </div>
      <p aria-hidden="true" className="mt-3 text-[13px] font-medium tracking-[0.42em] text-rose-ink uppercase">
        {MES} · {ANO}
      </p>
      <p className="mt-2 text-[15px] text-muted-foreground">{CONFIG.local.nome}</p>
    </div>
  )
}

function Contagem() {
  const t = useContagem(INICIO, FIM)
  if (t.fase === 'agora') {
    return (
      <p className="inline-flex items-center gap-2 rounded-full bg-blush-50 px-5 py-2.5 font-serif text-xl text-rose-ink">
        <PartyPopper className="size-5" aria-hidden="true" /> Está acontecendo agora!
      </p>
    )
  }
  if (t.fase === 'passou') {
    return <p className="font-serif text-xl text-muted-foreground italic">Obrigado por celebrar com a gente!</p>
  }
  const unidades: [string, number][] = [
    ['dias', t.dias],
    ['horas', t.horas],
    ['min', t.minutos],
    ['seg', t.segundos],
  ]
  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
        Contagem regressiva
      </p>
      <p className="sr-only">Faltam {t.dias} dias para o chá.</p>
      <div aria-hidden="true" className="flex justify-center gap-2 sm:gap-3">
        {unidades.map(([rotulo, v]) => (
          <div key={rotulo} className="w-[70px] rounded-2xl border border-blush-100 bg-blush-50/80 py-3 sm:w-20">
            <Digitos
              valor={v}
              casas={rotulo === 'dias' ? Math.max(2, String(v).length) : 2}
              className="font-serif text-[32px] leading-none font-medium text-foreground sm:text-4xl"
            />
            <span className="mt-1.5 block text-xs tracking-[0.16em] text-muted-foreground uppercase">{rotulo}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
