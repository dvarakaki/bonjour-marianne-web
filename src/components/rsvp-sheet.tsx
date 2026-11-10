import { useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  CalendarDays,
  CalendarPlus,
  CalendarX,
  Check,
  Download,
  Heart,
  LoaderCircle,
  MapPin,
  Minus,
  PartyPopper,
  Plus,
  Users,
  X,
} from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { Textarea } from '@/components/ui/textarea'
import { useMediaQuery } from '@/hooks/use-browser'
import { useRespostas } from '@/hooks/use-respostas'
import { baixarIcs, DATA_EXTENSO, googleAgendaUrl, HORARIO, MAPS_URL } from '@/lib/evento'
import { primeiroNome, type Convidado } from '@/lib/guests'
import type { Status } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Avatar, EASE_OUT } from './primitives'

type TextoComp = ComponentType<{ className?: string; children?: ReactNode }>

export type Selecao = { convidado: Convidado; chave: number }

/**
 * `selecao` continua definida depois de fechar (aberto = false),
 * para o conteúdo não sumir durante a animação de saída.
 */
export function GavetaResposta({
  selecao,
  aberto,
  onFechar,
  onRespondido,
}: {
  selecao: Selecao | null
  aberto: boolean
  onFechar: () => void
  onRespondido: (id: string) => void
}) {
  const desktop = useMediaQuery('(min-width: 768px)')
  const aoMudar = (o: boolean) => {
    if (!o) onFechar()
  }

  const conteudo = selecao && (
    <Fluxo
      key={selecao.chave}
      convidado={selecao.convidado}
      onFechar={onFechar}
      onRespondido={onRespondido}
      Titulo={desktop ? DialogTitle : DrawerTitle}
      Descricao={desktop ? DialogDescription : DrawerDescription}
    />
  )

  if (desktop) {
    return (
      <Dialog open={aberto} onOpenChange={aoMudar}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[28px] border-border/70 bg-card p-0 shadow-card sm:max-w-[460px]"
        >
          {conteudo}
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={aberto} onOpenChange={aoMudar}>
      <DrawerContent className="max-h-[92dvh] rounded-t-[28px] border-border/70 bg-card">
        <div className="overflow-y-auto overscroll-contain">{conteudo}</div>
      </DrawerContent>
    </Drawer>
  )
}

type Etapa = 'pergunta' | Status

function Fluxo({
  convidado,
  onFechar,
  onRespondido,
  Titulo,
  Descricao,
}: {
  convidado: Convidado
  onFechar: () => void
  onRespondido: (id: string) => void
  Titulo: TextoComp
  Descricao: TextoComp
}) {
  const { respostas, salvar } = useRespostas()
  const anterior = respostas[convidado.id]
  const plural = convidado.pessoas > 1
  const nome = primeiroNome(convidado.nome)

  const [etapa, setEtapa] = useState<Etapa>('pergunta')
  const [escolha, setEscolha] = useState<Status | null>(anterior?.status ?? null)
  const [pessoas, setPessoas] = useState(
    anterior?.status === 'sim' ? Math.min(convidado.pessoas, Math.max(1, anterior.pessoas)) : convidado.pessoas,
  )
  const [recado, setRecado] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!escolha || enviando) return
    setEnviando(true)
    setErro(null)
    try {
      await salvar({
        id: convidado.id,
        nome: convidado.nome,
        status: escolha,
        pessoas: escolha === 'sim' ? pessoas : 0,
        recado: recado.trim().slice(0, 300),
      })
      onRespondido(convidado.id)
      setEtapa(escolha)
      if (escolha === 'sim') void soltarConfete()
    } catch (err) {
      console.error(err)
      setErro('Não conseguimos enviar sua resposta agora. Confira sua internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  const opcoes = [
    {
      valor: 'sim' as const,
      Icone: PartyPopper,
      titulo: plural ? 'Sim, estaremos lá!' : 'Sim, estarei lá!',
      sub: plural ? 'Não perdemos por nada' : 'Não perco por nada',
    },
    {
      valor: 'nao' as const,
      Icone: CalendarX,
      titulo: plural ? 'Não poderemos ir' : 'Não poderei ir',
      sub: plural ? 'Mas estaremos torcendo de longe' : 'Mas estarei torcendo de longe',
    },
  ]

  return (
    <div className="relative px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-8 sm:pb-8">
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar"
        className="absolute top-2 right-2 z-10 grid size-11 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:top-4 sm:right-4"
      >
        <X className="size-5" />
      </button>

      <AnimatePresence mode="wait" initial={false}>
        {etapa === 'pergunta' ? (
          <motion.form
            key="pergunta"
            onSubmit={enviar}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <div className="flex flex-col items-center text-center">
              <Avatar convidado={convidado} status={anterior?.status} tamanho="lg" />
              <p className="mt-4 text-xs font-medium tracking-[0.3em] text-gold-ink uppercase">Convite para</p>
              <Titulo className="mt-1 px-8 font-serif text-[30px] leading-tight font-medium text-foreground">
                {convidado.nome}
              </Titulo>
              <Descricao className="mt-2 text-base text-muted-foreground">
                {plural ? 'Vocês vêm' : 'Você vem'} celebrar a chegada da {CONFIG.bebe}?
              </Descricao>
              {anterior && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3.5 py-1.5 text-[13px] text-gold-ink">
                  <Check className="size-3.5" aria-hidden="true" />
                  {anterior.status === 'sim' ? 'Você já confirmou' : 'Você já respondeu que não vai'} — pode alterar
                </p>
              )}
            </div>

            <fieldset className="mt-6 grid gap-3">
              <legend className="sr-only">Sua resposta</legend>
              {opcoes.map(({ valor, Icone, titulo, sub }) => {
                const marcado = escolha === valor
                return (
                  <label
                    key={valor}
                    className={cn(
                      'relative flex min-h-[76px] cursor-pointer items-center gap-4 rounded-2xl border bg-card p-4 transition-[border-color,background-color,box-shadow] duration-200',
                      'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                      marcado
                        ? 'border-primary bg-blush-50 shadow-[0_0_0_4px_rgb(251_231_235)]'
                        : 'border-border hover:border-blush-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="resposta"
                      value={valor}
                      checked={marcado}
                      onChange={() => setEscolha(valor)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-full transition-colors',
                        marcado ? 'bg-primary text-primary-foreground' : 'bg-blush-100 text-primary',
                      )}
                    >
                      <Icone className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">{titulo}</span>
                      <span className="block text-sm text-muted-foreground">{sub}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                        marcado ? 'border-primary bg-primary text-white' : 'border-blush-200',
                      )}
                    >
                      {marcado && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </label>
                )
              })}
            </fieldset>

            <AnimatePresence initial={false}>
              {escolha === 'sim' && convidado.pessoas > 1 && (
                <motion.div
                  key="pessoas"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-blush-50 p-4">
                    <div>
                      <p id="rotulo-pessoas" className="font-medium">
                        Quantas pessoas virão?
                      </p>
                      <p className="text-sm text-muted-foreground">Seu convite inclui até {convidado.pessoas}.</p>
                    </div>
                    <div role="group" aria-labelledby="rotulo-pessoas" className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="Menos uma pessoa"
                        disabled={pessoas <= 1}
                        onClick={() => setPessoas((p) => Math.max(1, p - 1))}
                      >
                        <Minus />
                      </Button>
                      <output aria-live="polite" className="w-8 text-center font-serif text-3xl font-semibold text-primary tabular-nums">
                        {pessoas}
                      </output>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="Mais uma pessoa"
                        disabled={pessoas >= convidado.pessoas}
                        onClick={() => setPessoas((p) => Math.min(convidado.pessoas, p + 1))}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="mt-5 block">
              <span className="flex items-baseline justify-between text-sm font-medium">
                <span>
                  Recadinho para a {CONFIG.bebe} <span className="font-normal text-muted-foreground">(opcional)</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{recado.length}/300</span>
              </span>
              <Textarea
                value={recado}
                onChange={(e) => setRecado(e.target.value.slice(0, 300))}
                rows={3}
                maxLength={300}
                placeholder="Escreva algo com carinho…"
                className="mt-2 min-h-24 resize-none rounded-2xl border-border bg-card px-4 py-3 text-base focus-visible:border-blush-400 focus-visible:ring-blush-200/70 md:text-base"
              />
            </label>

            {erro && (
              <p role="alert" className="mt-4 rounded-2xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {erro}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={!escolha || enviando}>
              {enviando ? (
                <>
                  <LoaderCircle className="animate-spin" /> Enviando…
                </>
              ) : (
                <>
                  <Heart /> {anterior ? 'Atualizar resposta' : 'Enviar resposta'}
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="fim"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="flex flex-col items-center pt-4 text-center"
          >
            {etapa === 'sim' ? <SeloConfirmado /> : <SeloCoracao />}
            <Titulo className="mt-6 font-serif text-[32px] leading-tight font-medium text-foreground">
              {etapa === 'sim' ? 'Presença confirmada!' : 'Obrigado por avisar'}
            </Titulo>
            <Descricao className="mt-2 max-w-xs text-base text-muted-foreground">
              {etapa === 'sim'
                ? `Que alegria, ${nome}! A ${CONFIG.bebe} mal pode esperar para ${plural ? 'conhecer vocês' : 'te conhecer'}.`
                : `Que pena, ${nome}! Vamos sentir ${plural ? 'a falta de vocês' : 'sua falta'} — a ${CONFIG.bebe} manda um beijinho.`}
            </Descricao>

            {etapa === 'sim' && (
              <>
                <ul className="mt-6 w-full space-y-3 rounded-2xl bg-blush-50 p-4 text-left text-[15px]">
                  <li className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {DATA_EXTENSO} · {HORARIO}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {CONFIG.local.nome}
                    </a>
                  </li>
                  {pessoas > 1 && (
                    <li className="flex gap-3">
                      <Users className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
                      <span>{pessoas} pessoas confirmadas</span>
                    </li>
                  )}
                </ul>
                <div className="mt-4 grid w-full gap-2 sm:grid-cols-2">
                  <Button asChild>
                    <a href={googleAgendaUrl()} target="_blank" rel="noopener noreferrer">
                      <CalendarPlus /> Google Agenda
                    </a>
                  </Button>
                  <Button variant="outline" onClick={baixarIcs}>
                    <Download /> iPhone / Outlook
                  </Button>
                </div>
              </>
            )}
            <Button variant="ghost" className="mt-3 w-full" onClick={onFechar}>
              Voltar ao convite
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SeloConfirmado() {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      className="grid size-24 place-items-center rounded-full bg-success-soft text-success ring-[10px] ring-success-soft/50"
    >
      <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}

function SeloCoracao() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: [0.5, 1.12, 1], opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="grid size-24 place-items-center rounded-full bg-blush-100 text-primary ring-[10px] ring-blush-50"
    >
      <Heart className="size-11 fill-current" aria-hidden="true" />
    </motion.div>
  )
}

const CORACAO = 'M12 21s-7.5-4.6-9.6-9.3C.8 8 3 4 6.8 4c2.2 0 3.7 1.2 5.2 3 1.5-1.8 3-3 5.2-3C21 4 23.2 8 21.6 11.7 19.5 16.4 12 21 12 21z'

async function soltarConfete() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { default: confetti } = await import('canvas-confetti')
  const coracao = confetti.shapeFromPath({ path: CORACAO })
  const base = {
    colors: ['#e08a9e', '#efb0be', '#b44d64', '#d9b77a', '#f6d0d8'],
    zIndex: 200,
    disableForReducedMotion: true,
  }
  confetti({ ...base, particleCount: 80, spread: 80, startVelocity: 45, origin: { y: 0.7 }, shapes: [coracao, 'circle'], scalar: 1.2 })
  setTimeout(() => confetti({ ...base, particleCount: 45, angle: 60, spread: 65, origin: { x: 0, y: 0.85 }, shapes: [coracao] }), 200)
  setTimeout(() => confetti({ ...base, particleCount: 45, angle: 120, spread: 65, origin: { x: 1, y: 0.85 }, shapes: [coracao] }), 350)
}
