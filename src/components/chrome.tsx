import { useEffect, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { Heart } from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { DATA_CURTA } from '@/lib/evento'
import { ARTE, Borboleta, VOOS } from './jardim'
import { Divisor, Laco } from './ornaments'

/* Botão flutuante que aparece quando o convidado rola para longe do convite */
export function BotaoFlutuante({
  alvoHero,
  alvoLista,
  escondido,
  rotulo,
  onClick,
}: {
  alvoHero: RefObject<HTMLElement | null>
  alvoLista: RefObject<HTMLElement | null>
  escondido: boolean
  rotulo: string
  onClick: () => void
}) {
  const passouDoConvite = usePassouDe(alvoHero)
  const listaVisivel = useInView(alvoLista, { amount: 0.08 })
  const mostrar = !escondido && passouDoConvite && !listaVisivel

  return (
    <AnimatePresence>
      {mostrar && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <Button size="lg" onClick={onClick} className="pointer-events-auto shadow-float">
            <Heart className="fill-current" />
            {rotulo}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** true quando o elemento já ficou acima da tela (a pessoa rolou além dele) */
function usePassouDe(alvo: RefObject<HTMLElement | null>) {
  const [passou, setPassou] = useState(false)
  useEffect(() => {
    let quadro = 0
    const medir = () => {
      quadro = 0
      const el = alvo.current
      if (el) setPassou(el.getBoundingClientRect().bottom < 0)
    }
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir)
    }
    medir()
    addEventListener('scroll', agendar, { passive: true })
    addEventListener('resize', agendar)
    return () => {
      removeEventListener('scroll', agendar)
      removeEventListener('resize', agendar)
      cancelAnimationFrame(quadro)
    }
  }, [alvo])
  return passou
}

export function Rodape() {
  return (
    <footer className="relative px-4 pt-6 pb-32 text-center">
      <Divisor />
      <div className="relative mx-auto mt-10 max-w-3xl">
        <Borboleta voo={VOOS.secao[0]} />
        <img
          src={ARTE.ursinhos}
          alt="Dois ursinhos sentados num jardim florido"
          width={900}
          height={499}
          loading="lazy"
          className="block aspect-[900/499] w-full rounded-[32px] object-cover shadow-card [mask-image:linear-gradient(#000_70%,transparent)]"
        />
      </div>
      <p className="mx-auto -mt-6 max-w-md font-serif text-[22px] leading-snug text-foreground italic sm:-mt-10 sm:text-2xl">
        Algumas flores chegam para deixar nosso jardim mais bonito. A {CONFIG.bebe} chegou para transformar nossas vidas inteiras.
      </p>
      <Laco className="mx-auto mt-8 w-14 opacity-90" />
      <p className="mt-1 font-script text-6xl leading-tight text-primary">{CONFIG.bebe}</p>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Com amor, {CONFIG.anfitrioes} · {DATA_CURTA}
      </p>
    </footer>
  )
}
