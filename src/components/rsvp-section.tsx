import { useId, useRef, useState, type ComponentProps, type FormEvent, type ReactNode, type Ref } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  CalendarDays,
  CalendarPlus,
  CalendarX,
  Check,
  Download,
  Gift,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PartyPopper,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRespostas } from '@/hooks/use-respostas'
import { baixarIcs, DATA_EXTENSO, googleAgendaUrl, HORARIO, MAPS_URL, PRAZO, whatsLink } from '@/lib/evento'
import { MODO_DEMO, totalPessoas, type Confirmacao, type Dependente, type Status } from '@/lib/store'
import { emailValido, formatarTelefone, novoId, plural, telefoneValido } from '@/lib/texto'
import { cn } from '@/lib/utils'
import { SeloCoracao, SeloConfirmado, soltarConfete } from './celebracao'
import { EASE_OUT, NumeroAnimado, Revelar, TituloSecao } from './primitives'

const MAX_DEPENDENTES = 10

export function SecaoConfirmacao({ ref }: { ref?: Ref<HTMLElement> }) {
  const { minha, publico, estado } = useRespostas()
  const [editando, setEditando] = useState(!minha)
  const [acabouDeEnviar, setAcabouDeEnviar] = useState(false)
  const cartao = useRef<HTMLDivElement>(null)

  function rolarParaCartao() {
    const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = cartao.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
  }

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
            Preencha seus dados para a gente se organizar com carinho
            {PRAZO && (
              <>
                {' '}
                — responda até <strong className="font-medium text-rose-ink">{PRAZO}</strong>
              </>
            )}
            .
          </>
        }
      />

      <div className="mx-auto max-w-2xl">
        <AnimatePresence>
          {estado === 'pronto' && publico.pessoas > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-[15px] text-muted-foreground shadow-soft ring-1 ring-border/70"
            >
              <span className="flex -space-x-1.5" aria-hidden="true">
                {['bg-blush-200', 'bg-gold-soft', 'bg-success-soft'].map((c) => (
                  <span key={c} className={cn('grid size-6 place-items-center rounded-full ring-2 ring-card', c)}>
                    <Heart className="size-3 fill-primary text-primary" />
                  </span>
                ))}
              </span>
              <span>
                <strong className="font-semibold text-foreground">
                  <NumeroAnimado valor={publico.pessoas} />
                </strong>{' '}
                {publico.pessoas === 1 ? 'pessoa já confirmou' : 'pessoas já confirmaram'}
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        <Revelar>
          <div
            ref={cartao}
            className="relative isolate scroll-mt-6 overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-card"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(70%_100%_at_50%_0%,#fdecef_0%,transparent_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-2.5 rounded-[24px] border border-gold/30" />
            <AnimatePresence mode="wait" initial={false}>
              {editando || !minha ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <Formulario
                    anterior={minha}
                    onEnviado={(c) => {
                      setEditando(false)
                      setAcabouDeEnviar(true)
                      rolarParaCartao()
                      if (c.status === 'sim') void soltarConfete()
                    }}
                    onCancelar={minha ? () => setEditando(false) : undefined}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="feito"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <Resultado
                    confirmacao={minha}
                    novo={acabouDeEnviar}
                    onEditar={() => {
                      setAcabouDeEnviar(false)
                      setEditando(true)
                      rolarParaCartao()
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Revelar>

        {CONFIG.whatsapp && (
          <p className="mt-6 text-center text-[15px] text-muted-foreground">
            Alguma dúvida?{' '}
            <a
              href={whatsLink(`Oi! Tenho uma dúvida sobre o chá de bebê da ${CONFIG.bebe}.`, CONFIG.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
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

/* ------------------------------------------------------------------ */

type Erros = Partial<Record<'status' | 'nome' | 'sobrenome' | 'telefone' | 'email', string>>

function Formulario({
  anterior,
  onEnviado,
  onCancelar,
}: {
  anterior: Confirmacao | null
  onEnviado: (c: Confirmacao) => void
  onCancelar?: () => void
}) {
  const { confirmar } = useRespostas()
  const [status, setStatus] = useState<Status | null>(anterior?.status ?? null)
  const [nome, setNome] = useState(anterior?.nome ?? '')
  const [sobrenome, setSobrenome] = useState(anterior?.sobrenome ?? '')
  const [telefone, setTelefone] = useState(formatarTelefone(anterior?.telefone ?? ''))
  const [email, setEmail] = useState(anterior?.email ?? '')
  const [dependentes, setDependentes] = useState<(Dependente & { chave: string })[]>(
    () => anterior?.dependentes.map((d) => ({ ...d, chave: novoId() })) ?? [],
  )
  const [focar, setFocar] = useState<string | null>(null)
  const [recado, setRecado] = useState(anterior?.recado ?? '')
  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const vem = status === 'sim'
  const depValidos = dependentes.filter((d) => d.nome.trim())
  const total = 1 + depValidos.length

  function validar(): Erros {
    const e: Erros = {}
    if (!status) e.status = 'Conta pra gente se você vem.'
    if (!nome.trim()) e.nome = 'Escreva seu nome.'
    if (!sobrenome.trim()) e.sobrenome = 'Escreva seu sobrenome.'
    if (!telefone.trim()) e.telefone = 'Informe um telefone para contato.'
    else if (!telefoneValido(telefone)) e.telefone = 'Confira o número com DDD — ex.: (11) 98765-4321.'
    if (email.trim() && !emailValido(email)) e.email = 'Confira o e-mail — ex.: nome@gmail.com.'
    return e
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault()
    if (enviando) return
    const e = validar()
    setErros(e)
    if (Object.keys(e).length) {
      // leva o foco para o primeiro campo com problema
      const primeiro = (['status', 'nome', 'sobrenome', 'telefone', 'email'] as const).find((k) => e[k])
      const el = formRef.current?.querySelector<HTMLElement>(`[data-campo="${primeiro}"]`)
      if (el) {
        const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
        ;(el.closest('label') ?? el).scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'center' })
        el.focus({ preventScroll: true })
      }
      return
    }
    setEnviando(true)
    setErroEnvio(null)
    const c: Confirmacao = {
      id: anterior?.id ?? novoId(),
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      status: status!,
      dependentes: vem ? depValidos.map(({ nome, idade }) => ({ nome: nome.trim(), idade: idade.trim() })) : [],
      recado: recado.trim().slice(0, 300),
    }
    try {
      await confirmar(c)
      onEnviado(c)
    } catch (err) {
      console.error(err)
      setErroEnvio('Não conseguimos enviar sua resposta agora. Confira sua internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  function limparErro(k: keyof Erros) {
    if (erros[k]) setErros((e) => ({ ...e, [k]: undefined }))
  }

  const opcoes = [
    { valor: 'sim' as const, Icone: PartyPopper, titulo: 'Sim, estarei lá!', sub: 'Não perco por nada' },
    { valor: 'nao' as const, Icone: CalendarX, titulo: 'Não poderei ir', sub: 'Mas estarei torcendo de longe' },
  ]

  return (
    <form ref={formRef} onSubmit={enviar} noValidate className="px-5 pt-8 pb-7 sm:px-10 sm:pt-11 sm:pb-10">
      {anterior && (
        <p className="mx-auto mb-6 flex w-fit items-center gap-1.5 rounded-full bg-gold-soft px-3.5 py-1.5 text-[13px] text-gold-ink">
          <Pencil className="size-3.5" aria-hidden="true" />
          Editando sua resposta
        </p>
      )}

      <Etapa numero={1} titulo="Você vem?">
        <fieldset aria-describedby={erros.status ? 'erro-status' : undefined}>
          <legend className="sr-only">Você vem ao chá?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {opcoes.map(({ valor, Icone, titulo, sub }, i) => {
              const marcado = status === valor
              return (
                <label
                  key={valor}
                  className={cn(
                    'relative flex min-h-[76px] cursor-pointer items-center gap-3.5 rounded-2xl border bg-card p-4 transition-[border-color,background-color,box-shadow] duration-200',
                    'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                    marcado
                      ? 'border-primary bg-blush-50 shadow-[0_0_0_4px_rgb(251_231_235)]'
                      : erros.status
                        ? 'border-destructive/50'
                        : 'border-border hover:border-blush-300',
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={valor}
                    checked={marcado}
                    data-campo={i === 0 ? 'status' : undefined}
                    onChange={() => {
                      setStatus(valor)
                      limparErro('status')
                    }}
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
          </div>
          <MensagemErro id="erro-status">{erros.status}</MensagemErro>
        </fieldset>
      </Etapa>

      <Etapa numero={2} titulo="Seus dados">
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <Campo
            rotulo="Nome"
            campo="nome"
            erro={erros.nome}
            value={nome}
            onChange={(v) => {
              setNome(v)
              limparErro('nome')
            }}
            autoComplete="given-name"
            placeholder="Ex.: Ana"
          />
          <Campo
            rotulo="Sobrenome"
            campo="sobrenome"
            erro={erros.sobrenome}
            value={sobrenome}
            onChange={(v) => {
              setSobrenome(v)
              limparErro('sobrenome')
            }}
            autoComplete="family-name"
            placeholder="Ex.: Ribeiro"
          />
          <Campo
            rotulo="Telefone / WhatsApp"
            campo="telefone"
            erro={erros.telefone}
            value={telefone}
            onChange={(v) => {
              setTelefone(formatarTelefone(v))
              limparErro('telefone')
            }}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 98765-4321"
          />
          <Campo
            rotulo="E-mail"
            opcional
            campo="email"
            erro={erros.email}
            value={email}
            onChange={(v) => {
              setEmail(v)
              limparErro('email')
            }}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nome@email.com"
          />
        </div>
      </Etapa>

      <AnimatePresence initial={false}>
        {vem && (
          <motion.div
            key="dependentes"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="-mx-2 overflow-hidden px-2"
          >
            <Etapa
              numero={3}
              titulo="Dependentes"
              descricao="Filhos ou acompanhantes que vêm com você. Se vier sozinho(a), é só pular."
            >
              <ul className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {dependentes.map((d, i) => (
                    <motion.li
                      key={d.chave}
                      layout="position"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="flex items-center gap-2 rounded-2xl bg-blush-50/80 p-2 ring-1 ring-blush-100 sm:gap-2.5"
                    >
                      <span aria-hidden="true" className="hidden size-9 shrink-0 place-items-center rounded-full bg-card font-serif text-lg font-semibold text-primary sm:grid">
                        {i + 1}
                      </span>
                      <label className="min-w-0 flex-1">
                        <span className="sr-only">Nome do dependente {i + 1}</span>
                        <Input
                          value={d.nome}
                          onChange={(e) => setDependentes((l) => l.map((x) => (x.chave === d.chave ? { ...x, nome: e.target.value } : x)))}
                          placeholder="Nome"
                          autoComplete="off"
                          autoFocus={d.chave === focar}
                          className={estiloCampo('h-11 bg-card')}
                        />
                      </label>
                      <label className="w-[84px] shrink-0 sm:w-28">
                        <span className="sr-only">Idade do dependente {i + 1} (opcional)</span>
                        <Input
                          value={d.idade}
                          onChange={(e) =>
                            setDependentes((l) => l.map((x) => (x.chave === d.chave ? { ...x, idade: e.target.value.slice(0, 12) } : x)))
                          }
                          placeholder="Idade"
                          autoComplete="off"
                          className={estiloCampo('h-11 bg-card')}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover ${d.nome.trim() || `dependente ${i + 1}`}`}
                        onClick={() => setDependentes((l) => l.filter((x) => x.chave !== d.chave))}
                        className="shrink-0 hover:bg-card hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {dependentes.length < MAX_DEPENDENTES && (
                <button
                  type="button"
                  onClick={() => {
                    const chave = novoId()
                    setFocar(chave)
                    setDependentes((l) => [...l, { nome: '', idade: '', chave }])
                  }}
                  className={cn(
                    'flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-blush-300 px-4 text-[15px] font-medium text-rose-ink transition-colors hover:border-primary hover:bg-blush-50',
                    dependentes.length > 0 && 'mt-2.5',
                  )}
                >
                  <Plus className="size-[18px]" aria-hidden="true" />
                  {dependentes.length ? 'Adicionar outro dependente' : 'Adicionar dependente'}
                </button>
              )}

              <p className="mt-4 flex items-center gap-2 text-[15px] text-muted-foreground" aria-live="polite">
                <Users className="size-4 text-primary" aria-hidden="true" />
                Total: <strong className="font-semibold text-foreground">{plural(total, 'pessoa', 'pessoas')}</strong>
                {total > 1 && <span>(você + {plural(total - 1, 'dependente', 'dependentes')})</span>}
              </p>
            </Etapa>
          </motion.div>
        )}
      </AnimatePresence>

      <Etapa numero={vem ? 4 : 3} titulo="Recadinho" ultima>
        <label className="block">
          <span className="flex items-baseline justify-between text-sm font-medium">
            <span>
              Para a {CONFIG.bebe} ou para os papais <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <span className="text-xs font-normal text-muted-foreground tabular-nums">{recado.length}/300</span>
          </span>
          <Textarea
            value={recado}
            onChange={(e) => setRecado(e.target.value.slice(0, 300))}
            rows={3}
            maxLength={300}
            placeholder="Escreva algo com carinho…"
            className={estiloCampo('mt-2 min-h-24 resize-none py-3')}
          />
        </label>
      </Etapa>

      {erroEnvio && (
        <p role="alert" className="mt-5 rounded-2xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {erroEnvio}
        </p>
      )}

      <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancelar && (
          <Button type="button" variant="ghost" size="lg" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="lg" className="sm:min-w-64" disabled={enviando}>
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
      </div>
    </form>
  )
}

const estiloCampo = (extra?: string) =>
  cn(
    'h-12 rounded-2xl border-border bg-card px-4 text-base shadow-none placeholder:text-[#b09aa0] focus-visible:border-blush-400 focus-visible:ring-blush-200/70 md:text-base',
    'aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15',
    extra,
  )

function Etapa({
  numero,
  titulo,
  descricao,
  ultima,
  children,
}: {
  numero: number
  titulo: string
  descricao?: string
  ultima?: boolean
  children: ReactNode
}) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className={cn('relative', !ultima && 'pb-8')}>
      <div className="mb-4 flex items-center gap-3">
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/50 font-serif text-[17px] font-semibold text-gold-ink">
          {numero}
        </span>
        <h3 id={id} className="font-serif text-[26px] leading-none font-medium">
          {titulo}
        </h3>
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-gold/35 to-transparent" />
      </div>
      {descricao && <p className="-mt-1 mb-4 text-[15px] text-muted-foreground">{descricao}</p>}
      {children}
    </div>
  )
}

function Campo({
  rotulo,
  campo,
  erro,
  opcional,
  value,
  onChange,
  ...resto
}: {
  rotulo: string
  campo: string
  erro?: string
  opcional?: boolean
  value: string
  onChange: (v: string) => void
} & Omit<ComponentProps<'input'>, 'value' | 'onChange'>) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {rotulo} {opcional ? <span className="font-normal text-muted-foreground">(opcional)</span> : <span className="text-primary" aria-hidden="true">*</span>}
      </label>
      <Input
        id={id}
        data-campo={campo}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        aria-required={!opcional}
        className={estiloCampo()}
        {...resto}
      />
      <MensagemErro id={`${id}-erro`}>{erro}</MensagemErro>
    </div>
  )
}

function MensagemErro({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden text-sm text-destructive"
        >
          <span className="block pt-1.5">{children}</span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */

function Resultado({ confirmacao: c, novo, onEditar }: { confirmacao: Confirmacao; novo: boolean; onEditar: () => void }) {
  const vem = c.status === 'sim'
  const pessoas = totalPessoas(c)
  return (
    <div className="flex flex-col items-center px-5 pt-10 pb-8 text-center sm:px-12 sm:pt-12 sm:pb-10" aria-live="polite">
      {vem ? <SeloConfirmado /> : <SeloCoracao />}
      <h3 className="mt-6 font-serif text-[34px] leading-tight font-medium">
        {vem ? (novo ? 'Presença confirmada!' : 'Você já confirmou!') : novo ? 'Obrigado por avisar' : 'Você já respondeu'}
      </h3>
      <p className="mt-2 max-w-sm text-base text-muted-foreground">
        {vem
          ? `Que alegria, ${c.nome}! A ${CONFIG.bebe} mal pode esperar para ${pessoas > 1 ? 'conhecer vocês' : 'te conhecer'}.`
          : `Que pena, ${c.nome}! Vamos sentir sua falta — a ${CONFIG.bebe} manda um beijinho.`}
      </p>

      <ul className="mt-7 w-full max-w-md space-y-3 rounded-2xl bg-blush-50 p-4 text-left text-[15px]">
        {vem && (
          <>
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
          </>
        )}
        <li className="flex gap-3">
          <UserRound className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
          <span>
            {c.nome} {c.sobrenome} · {c.telefone}
          </span>
        </li>
        {vem && c.dependentes.length > 0 && (
          <li className="flex gap-3">
            <Users className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
            <span>
              {plural(pessoas, 'pessoa', 'pessoas')}: você,{' '}
              {c.dependentes.map((d) => (d.idade ? `${d.nome} (${d.idade})` : d.nome)).join(', ')}
            </span>
          </li>
        )}
      </ul>

      {vem && (
        <div className="mt-4 grid w-full max-w-md gap-2 sm:grid-cols-2">
          <Button asChild variant="outline">
            <a href={googleAgendaUrl()} target="_blank" rel="noopener noreferrer">
              <CalendarPlus /> Google Agenda
            </a>
          </Button>
          <Button variant="outline" onClick={baixarIcs}>
            <Download /> iPhone / Outlook
          </Button>
        </div>
      )}

      <div className="mt-3 grid w-full max-w-md gap-2">
        <Button asChild>
          <a href="#presentes">
            <Gift /> Ver lista de presentes
          </a>
        </Button>
        <Button variant="ghost" onClick={onEditar}>
          <Pencil /> Editar minha resposta
        </Button>
      </div>
    </div>
  )
}
