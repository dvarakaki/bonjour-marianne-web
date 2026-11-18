import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { BotaoMusica } from '@/components/botao-musica'
import { BotaoFlutuante, Rodape } from '@/components/chrome'
import { Detalhes } from '@/components/details'
import { EnvelopeIntro } from '@/components/envelope-intro'
import { SecaoPresentes } from '@/components/gifts-section'
import { Hero } from '@/components/hero'
import { Revoada } from '@/components/jardim'
import { Fundo } from '@/components/primitives'
import { SecaoConfirmacao } from '@/components/rsvp-section'
import { useHash } from '@/hooks/use-browser'
import { useRespostas } from '@/hooks/use-respostas'

// o painel só é usado pelos anfitriões: carrega sob demanda
const PainelAnfitrioes = lazy(() =>
  import('@/components/host-panel').then((m) => ({ default: m.PainelAnfitrioes })),
)

const CHAVE_INTRO = 'cha-marianne:intro-vista'

function introJaVista() {
  try {
    return sessionStorage.getItem(CHAVE_INTRO) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const hash = useHash()
  return (
    <>
      <Fundo />
      {hash === '#painel' ? (
        <Suspense fallback={null}>
          <PainelAnfitrioes />
        </Suspense>
      ) : (
        <Convite />
      )}
    </>
  )
}

function Convite() {
  const { minha } = useRespostas()
  const [intro, setIntro] = useState(() => !introJaVista() && !location.hash)
  const heroCta = useRef<HTMLDivElement>(null)
  const secaoConfirmar = useRef<HTMLElement>(null)

  const irParaConfirmacao = useCallback(() => {
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('confirmar')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
  }, [])

  function aoAbrirIntro() {
    try {
      sessionStorage.setItem(CHAVE_INTRO, '1')
    } catch {
      /* ignora */
    }
    setIntro(false)
  }

  // depois do envelope, leva o foco para o título (leitores de tela)
  useEffect(() => {
    if (!intro) document.getElementById('titulo-convite')?.focus({ preventScroll: true })
  }, [intro])

  return (
    <>
      <AnimatePresence>{intro && <EnvelopeIntro key="intro" onAberto={aoAbrirIntro} />}</AnimatePresence>

      <main inert={intro}>
        <Hero pronto={!intro} onConfirmar={irParaConfirmacao} ctaRef={heroCta} />
        <Detalhes />
        <SecaoConfirmacao ref={secaoConfirmar} />
        <SecaoPresentes />
        <Rodape />
      </main>

      <Revoada visivel={!intro} />
      <BotaoMusica escondido={intro} />

      <BotaoFlutuante
        alvoHero={heroCta}
        alvoLista={secaoConfirmar}
        escondido={intro || !!minha}
        rotulo="Confirmar presença"
        onClick={irParaConfirmacao}
      />
    </>
  )
}
