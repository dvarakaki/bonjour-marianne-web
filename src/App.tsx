import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { BotaoFlutuante, Rodape } from '@/components/chrome'
import { Detalhes } from '@/components/details'
import { EnvelopeIntro } from '@/components/envelope-intro'
import { Hero } from '@/components/hero'
import { Fundo } from '@/components/primitives'
import { GavetaResposta, type Selecao } from '@/components/rsvp-sheet'
import { SecaoConfirmacao } from '@/components/rsvp-section'
import { useHash } from '@/hooks/use-browser'
import { porId, primeiroNome, type Convidado } from '@/lib/guests'
import { gravarEu, lerEu } from '@/lib/store'

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
  const convidadoUrl = useMemo(() => porId(new URLSearchParams(location.search).get('para')), [])
  const [eu, setEu] = useState<string | null>(() => convidadoUrl?.id ?? lerEu())
  const [intro, setIntro] = useState(() => !introJaVista() && !location.hash)
  const [selecao, setSelecao] = useState<Selecao | null>(null)
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const heroCta = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLElement>(null)

  const selecionar = useCallback((convidado: Convidado) => {
    setSelecao({ convidado, chave: Date.now() })
    setGavetaAberta(true)
  }, [])

  const irParaLista = useCallback(() => {
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('confirmar')?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
  }, [])

  const confirmar = useCallback(() => {
    if (convidadoUrl) selecionar(convidadoUrl)
    else irParaLista()
  }, [convidadoUrl, irParaLista, selecionar])

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
      <AnimatePresence>
        {intro && <EnvelopeIntro key="intro" convidado={convidadoUrl} onAberto={aoAbrirIntro} />}
      </AnimatePresence>

      <main inert={intro}>
        <Hero pronto={!intro} convidado={convidadoUrl} onConfirmar={confirmar} ctaRef={heroCta} />
        <Detalhes />
        <SecaoConfirmacao ref={lista} eu={eu} onSelecionar={selecionar} />
        <Rodape />
      </main>

      <BotaoFlutuante
        alvoHero={heroCta}
        alvoLista={lista}
        escondido={intro || gavetaAberta}
        rotulo={convidadoUrl ? `Responder, ${primeiroNome(convidadoUrl.nome)}` : 'Confirmar presença'}
        onClick={confirmar}
      />

      <GavetaResposta
        selecao={selecao}
        aberto={gavetaAberta}
        onFechar={() => setGavetaAberta(false)}
        onRespondido={(id) => {
          setEu(id)
          gravarEu(id)
        }}
      />
    </>
  )
}
