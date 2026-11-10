import { useDeferredValue, useMemo, useState, type Ref } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, CircleCheck, CircleMinus, Clock3, MessageCircle, RefreshCw, Search, SearchX, X } from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRespostas } from '@/hooks/use-respostas'
import { PRAZO, whatsLink } from '@/lib/evento'
import { agrupar, CONVIDADOS, filtrar, TOTAL_PESSOAS, type Convidado } from '@/lib/guests'
import { MODO_DEMO, type Resposta } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Avatar, EASE_OUT, NumeroAnimado, Revelar, TituloSecao } from './primitives'

type Props = {
  ref?: Ref<HTMLElement>
  eu: string | null
  onSelecionar: (c: Convidado) => void
}

export function SecaoConfirmacao({ ref, eu, onSelecionar }: Props) {
  const { respostas, estado, recarregar } = useRespostas()
  const [busca, setBusca] = useState('')
  const termo = useDeferredValue(busca)
  const filtrados = useMemo(() => filtrar(CONVIDADOS, termo), [termo])
  const grupos = useMemo(() => agrupar(filtrados), [filtrados])
  const linkAjuda = whatsLink(`Oi! Não encontrei meu nome na lista do chá de bebê da ${CONFIG.bebe}. Meu nome é `, CONFIG.whatsapp)

  return (
    <section ref={ref} id="confirmar" aria-labelledby="titulo-confirmar" className="scroll-mt-4 px-4 py-14 sm:py-20">
      <TituloSecao
        id="titulo-confirmar"
        sobretitulo="R.S.V.P."
        titulo={
          <>
            Confirme sua <span className="font-script text-[1.3em] leading-none font-normal text-primary">presença</span>
          </>
        }
        subtitulo={
          <>
            Encontre seu nome na lista e toque nele para responder
            {PRAZO && (
              <>
                {' '}
                até <strong className="font-medium text-rose-ink">{PRAZO}</strong>
              </>
            )}
            .
          </>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Revelar>
          <Resumo />
        </Revelar>

        <div className="sticky top-3 z-20 mt-6">
          <label className="relative block">
            <span className="sr-only">Buscar seu nome na lista</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 z-10 size-5 -translate-y-1/2 text-blush-400" />
            <Input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite seu nome…"
              autoComplete="off"
              enterKeyHint="search"
              className="h-14 rounded-full border-blush-200 bg-card/95 pr-14 pl-13 text-base shadow-soft backdrop-blur-md placeholder:text-[#a8888f] focus-visible:border-blush-400 focus-visible:ring-blush-200/70 md:text-base"
            />
            <AnimatePresence>
              {busca && (
                <motion.button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setBusca('')}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </label>
        </div>

        <p className="mt-3 px-3 text-sm text-muted-foreground" aria-live="polite">
          {termo.trim()
            ? filtrados.length === 1
              ? '1 convite encontrado'
              : `${filtrados.length} convites encontrados`
            : `${CONVIDADOS.length} convites na lista`}
        </p>

        {estado === 'erro' && (
          <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-blush-50 px-4 py-3 text-sm text-rose-ink ring-1 ring-blush-100">
            <span>Não conseguimos carregar as confirmações agora, mas você pode responder normalmente.</span>
            <Button size="xs" variant="soft" onClick={() => void recarregar()}>
              <RefreshCw /> Tentar de novo
            </Button>
          </div>
        )}

        {estado === 'carregando' ? (
          <ul aria-hidden="true" className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="skeleton h-[70px] rounded-2xl" />
            ))}
          </ul>
        ) : (
          <div className="mt-5 space-y-7">
            {grupos.map(([letra, itens]) => (
              <section key={letra} aria-label={`Letra ${letra}`}>
                <h3 aria-hidden="true" className="mb-2.5 flex items-center gap-3 px-2 font-serif text-2xl text-gold-ink italic">
                  {letra}
                  <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                </h3>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  <AnimatePresence initial={false}>
                    {itens.map((c, i) => (
                      <LinhaConvidado
                        key={c.id}
                        convidado={c}
                        resposta={respostas[c.id]}
                        souEu={eu === c.id}
                        indice={i}
                        onClick={() => onSelecionar(c)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </div>
        )}

        <AnimatePresence>
          {estado !== 'carregando' && filtrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 rounded-[28px] border border-dashed border-blush-200 bg-card/70 px-6 py-10 text-center"
            >
              <SearchX className="mx-auto size-9 text-blush-400" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-3 font-serif text-2xl">Não encontramos “{busca.trim()}”</p>
              <p className="mt-1 text-[15px] text-muted-foreground">Tente só o primeiro nome ou confira a grafia.</p>
              {CONFIG.whatsapp && (
                <Button asChild variant="soft" className="mt-5">
                  <a href={linkAjuda} target="_blank" rel="noopener noreferrer">
                    <MessageCircle />
                    Falar com os anfitriões
                  </a>
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {CONFIG.whatsapp && filtrados.length > 0 && (
          <p className="mt-8 text-center text-[15px] text-muted-foreground">
            Não encontrou seu nome?{' '}
            <a href={linkAjuda} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
              Fale com a gente no WhatsApp
            </a>
          </p>
        )}

        {MODO_DEMO && (
          <p className="mx-auto mt-6 max-w-md rounded-2xl bg-gold-soft px-4 py-3 text-center text-xs leading-relaxed text-gold-ink">
            Modo demonstração: as respostas ficam salvas só neste navegador. Para receber as confirmações,
            configure <code className="font-semibold">appsScriptUrl</code> em <code className="font-semibold">src/config.ts</code>.
          </p>
        )}
      </div>
    </section>
  )
}

function Resumo() {
  const { resumo, estado } = useRespostas()
  const pct = TOTAL_PESSOAS ? Math.min(1, resumo.pessoas / TOTAL_PESSOAS) : 0
  const respondidos = resumo.sim + resumo.nao
  return (
    <div className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-soft backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Presenças confirmadas</p>
          <p className="mt-1.5 font-serif text-[56px] leading-none font-medium text-primary">
            {estado === 'carregando' ? <span className="text-blush-200">—</span> : <NumeroAnimado valor={resumo.pessoas} />}
          </p>
        </div>
        <div className="text-[15px] text-muted-foreground sm:text-right">
          <p>
            <strong className="font-medium text-foreground">{respondidos}</strong> de {CONVIDADOS.length} convites respondidos
          </p>
          <p>{resumo.pendentes} aguardando resposta</p>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-blush-100">
        <motion.div
          className="h-full origin-left rounded-full bg-gradient-to-r from-blush-300 via-blush-400 to-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
        />
      </div>
    </div>
  )
}

function LinhaConvidado({
  convidado: c,
  resposta,
  souEu,
  indice,
  onClick,
}: {
  convidado: Convidado
  resposta?: Resposta
  souEu: boolean
  indice: number
  onClick: () => void
}) {
  const status = resposta?.status
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -30px 0px' }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, delay: Math.min(indice, 8) * 0.04, ease: EASE_OUT }}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group flex min-h-[70px] w-full cursor-pointer items-center gap-3.5 rounded-2xl border bg-card/90 px-3.5 py-3 text-left shadow-soft outline-none',
          'transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-px hover:border-blush-300 hover:shadow-card active:scale-[0.985]',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          status === 'sim' ? 'border-[#d5e7d8] bg-[linear-gradient(90deg,#f5faf5,#fffdfb)]' : 'border-border/80',
          souEu && 'border-gold/60 ring-2 ring-gold/20',
        )}
      >
        <Avatar convidado={c} status={status} />
        <span className="min-w-0 flex-1">
          <span className={cn('block leading-snug font-medium', status === 'nao' && 'text-muted-foreground')}>
            {c.nome}
            {souEu && (
              <span className="ml-2 inline-block rounded-full bg-gold-soft px-2 py-px align-[2px] text-[11px] font-medium tracking-wider text-gold-ink uppercase">
                você
              </span>
            )}
          </span>
          <StatusLinha resposta={resposta} pessoas={c.pessoas} />
        </span>
        <ChevronRight
          aria-hidden="true"
          className="size-5 shrink-0 text-blush-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </button>
    </motion.li>
  )
}

function StatusLinha({ resposta, pessoas }: { resposta?: Resposta; pessoas: number }) {
  if (resposta?.status === 'sim') {
    return (
      <span className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium text-success">
        <CircleCheck className="size-3.5" aria-hidden="true" />
        {resposta.pessoas > 1 ? `Confirmado · ${resposta.pessoas} pessoas` : 'Presença confirmada'}
      </span>
    )
  }
  if (resposta?.status === 'nao') {
    return (
      <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <CircleMinus className="size-3.5" aria-hidden="true" />
        Não poderá ir
      </span>
    )
  }
  return (
    <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <Clock3 className="size-3.5" aria-hidden="true" />
      {pessoas > 1 ? `Aguardando resposta · ${pessoas} pessoas` : 'Aguardando resposta'}
    </span>
  )
}
