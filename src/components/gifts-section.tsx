import { useDeferredValue, useMemo, useRef, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, ExternalLink, Gift, Heart, LoaderCircle, Minus, Plus, Search, SearchX, X } from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORIAS, FRALDAS, NOTA_FRALDAS, PRESENTES, TEXTO_PRESENTES, type Categoria } from '@/data/presentes'
import { useRespostas } from '@/hooks/use-respostas'
import { ErroServidor, MODO_DEMO } from '@/lib/store'
import { filtrarPorTexto, novoId, plural } from '@/lib/texto'
import { cn } from '@/lib/utils'
import { SeloCoracao, soltarConfete } from './celebracao'
import { ModalResponsivo, type TextoComp } from './modal'
import { EASE_OUT, Revelar, TituloSecao } from './primitives'

type Item = {
  id: string
  nome: string
  desc?: string
  /** 0 = quantidade livre */
  qtd: number
  emoji: string
  link?: string
  unidade: [string, string]
}

const ITENS: (Item & { cat: Categoria })[] = PRESENTES.map((p) => ({ ...p, unidade: ['unidade', 'unidades'] }))
const POR_PAGINA = 6
const MAX_LIVRE = 10

const LOJAS: [RegExp, string][] = [
  [/mercadolivre/, 'Mercado Livre'],
  [/shp\.ee|shopee/, 'Shopee'],
  [/shein/, 'Shein'],
  [/toitoiloja/, 'Toi Toi'],
  [/(^|\.)a\.co$|amazon/, 'Amazon'],
  [/tetilookinhos/, 'Téti Lookinhos'],
  [/lojapapi/, 'Papi'],
  [/aimebabykids/, 'Aimé'],
  [/irmassampaio/, 'Irmãs Sampaio'],
  [/sipetit/, 'Si Petit'],
  [/phitobe/, 'Phitobe'],
]

function loja(link: string) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '')
    return LOJAS.find(([re]) => re.test(host))?.[1] ?? host
  } catch {
    return 'loja'
  }
}

/** Primeira frase vira subtítulo; o resto vai para o parágrafo */
const [FRASE_ABERTURA, ...RESTO] = TEXTO_PRESENTES.split(/(?<=!)\s+/)

export function SecaoPresentes() {
  const { publico, minhasReservas } = useRespostas()
  const { reservas } = publico
  const [cat, setCat] = useState<Categoria | 'todas'>('todas')
  const [busca, setBusca] = useState('')
  const termo = useDeferredValue(busca)
  const [aberto, setAberto] = useState<Item | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const topoLista = useRef<HTMLDivElement>(null)

  const faltam = (i: Pick<Item, 'id' | 'qtd'>) => Math.max(0, i.qtd - (publico.reservas[i.id] ?? 0))

  const filtrados = useMemo(() => {
    const base = cat === 'todas' ? ITENS : ITENS.filter((i) => i.cat === cat)
    return filtrarPorTexto(base, termo, (i) => `${i.nome} ${i.desc ?? ''} ${i.cat}`)
  }, [cat, termo])

  const grupos = useMemo(() => {
    const m = new Map<Categoria, typeof ITENS>()
    for (const i of filtrados) m.set(i.cat, [...(m.get(i.cat) ?? []), i])
    // o que já foi garantido vai para o fim de cada grupo
    const fim = (i: Item) => Number(i.qtd > 0 && (reservas[i.id] ?? 0) >= i.qtd)
    return CATEGORIAS.filter((c) => m.has(c)).map((c) => [c, [...m.get(c)!].sort((a, b) => fim(a) - fim(b))] as const)
  }, [filtrados, reservas])

  const contagem = useMemo(() => {
    const m = new Map<Categoria, number>()
    for (const i of ITENS) m.set(i.cat, (m.get(i.cat) ?? 0) + 1)
    return m
  }, [])

  function escolherCategoria(c: Categoria | 'todas') {
    setCat(c)
    const el = topoLista.current
    if (el && el.getBoundingClientRect().top < 0) {
      const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
    }
  }

  function abrir(item: Item) {
    setAberto(item)
    setModalAberto(true)
  }

  const resumindo = cat === 'todas' && !termo.trim()

  return (
    <section id="presentes" aria-labelledby="titulo-presentes" className="scroll-mt-4 px-4 py-14 sm:py-20">
      <TituloSecao
        id="titulo-presentes"
        sobretitulo="Com carinho"
        titulo={
          <>
            Lista de <span className="font-script text-[1.3em] leading-none font-normal text-primary">presentes</span>
          </>
        }
        subtitulo={FRASE_ABERTURA}
      />

      <div className="mx-auto max-w-5xl">
        <Revelar className="mx-auto max-w-2xl rounded-[28px] border border-border/70 bg-card/80 px-6 py-5 text-center text-[16px] leading-relaxed text-muted-foreground shadow-soft backdrop-blur-sm sm:px-8">
          {RESTO.join(' ')}
          <span className="mt-2 block text-sm">
            Toque em <strong className="font-medium text-rose-ink">“Vou presentear”</strong> para avisar e ninguém repetir o
            mesmo item. Os links são só referência — nada é cobrado por aqui.
          </span>
        </Revelar>

        {/* ---------------- Fraldas ---------------- */}
        <div className="mt-12">
          <CabecalhoBloco titulo="Fraldinhas" descricao={NOTA_FRALDAS} />
          <div role="list" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {FRALDAS.map((f, i) => {
              const item: Item = {
                id: f.id,
                nome: f.rotulo,
                qtd: f.qtd,
                emoji: '🧷',
                unidade: ['pacote', 'pacotes'],
              }
              const resta = faltam(f)
              const pct = f.qtd ? Math.min(1, (f.qtd - resta) / f.qtd) : 0
              const minhas = minhasReservas[f.id]
              return (
                <Revelar key={f.id} atraso={i * 0.06} className="h-full">
                  <div
                    role="listitem"
                    className={cn(
                      'flex h-full flex-col rounded-[24px] border bg-card p-4 shadow-soft sm:p-5',
                      resta ? 'border-border/80' : 'border-success/20 bg-success-soft/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif text-[44px] leading-none font-semibold text-primary">{f.tamanho}</span>
                      {minhas ? (
                        <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-medium tracking-wide text-gold-ink uppercase">
                          você: {minhas}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.rotulo}</p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-blush-100">
                      <motion.div
                        className={cn('h-full origin-left rounded-full', resta ? 'bg-gradient-to-r from-blush-300 to-primary' : 'bg-success')}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: pct }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
                      />
                    </div>
                    <p className="mt-2 text-[13px] text-muted-foreground tabular-nums">
                      {resta ? (
                        <>
                          Faltam <strong className="font-semibold text-foreground">{resta}</strong> de {f.qtd} pacotes
                        </>
                      ) : (
                        <span className="font-medium text-success">Já temos todos 💕</span>
                      )}
                    </p>
                    <div className="mt-auto pt-4">
                      <Button
                        size="sm"
                        variant={resta ? 'soft' : 'ghost'}
                        className="w-full"
                        disabled={!resta}
                        onClick={() => abrir(item)}
                      >
                        {resta ? (
                          <>
                            <Gift /> Vou levar
                          </>
                        ) : (
                          <>
                            <Check /> Completo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Revelar>
              )
            })}
          </div>
        </div>

        {/* ---------------- Mimos ---------------- */}
        <div className="mt-14" ref={topoLista} style={{ scrollMarginTop: 12 }}>
          <CabecalhoBloco
            titulo="Enxoval e mimos"
            descricao={`${ITENS.length} sugestões separadas por categoria. Escolha com o coração!`}
          />

          <div className="sticky top-3 z-20 -mx-4 px-4">
            <div className="rounded-[26px] border border-border/70 bg-card/92 p-2 shadow-soft backdrop-blur-md">
              <label className="relative block">
                <span className="sr-only">Buscar presente</span>
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-blush-400" />
                <Input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar: body, cueiro, mamadeira…"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="h-11 rounded-full border-transparent bg-blush-50/70 pr-12 pl-11 text-base shadow-none placeholder:text-[#a8888f] focus-visible:border-blush-300 focus-visible:bg-card focus-visible:ring-blush-200/70 md:text-base"
                />
                {busca && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => setBusca('')}
                    className="absolute top-1/2 right-0.5 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </label>
              <div
                role="group"
                aria-label="Categorias"
                className="mt-2 -mb-1 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <Chip ativo={cat === 'todas'} onClick={() => escolherCategoria('todas')} rotulo="Todas" n={ITENS.length} />
                {CATEGORIAS.map((c) => (
                  <Chip key={c} ativo={cat === c} onClick={() => escolherCategoria(c)} rotulo={c} n={contagem.get(c) ?? 0} />
                ))}
              </div>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {plural(filtrados.length, 'presente encontrado', 'presentes encontrados')}
          </p>

          <div className="mt-8 space-y-12">
            {grupos.map(([c, itens]) => {
              const visiveis = resumindo ? itens.slice(0, POR_PAGINA) : itens
              return (
                <section key={c} aria-label={c}>
                  <h4 className="mb-4 flex items-center gap-3 px-1 font-serif text-[28px] leading-none font-medium text-foreground italic">
                    {c}
                    <span className="font-sans text-sm font-normal text-muted-foreground not-italic">{itens.length}</span>
                    <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                  </h4>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visiveis.map((item, i) => (
                      <CartaoPresente
                        key={item.id}
                        item={item}
                        indice={i}
                        faltam={faltam(item)}
                        reservados={publico.reservas[item.id] ?? 0}
                        meus={minhasReservas[item.id] ?? 0}
                        onPresentear={() => abrir(item)}
                      />
                    ))}
                  </ul>
                  {resumindo && itens.length > POR_PAGINA && (
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={() => escolherCategoria(c)}>
                        Ver todos os {itens.length} itens de {c.toLowerCase()} <ArrowRight />
                      </Button>
                    </div>
                  )}
                </section>
              )
            })}
          </div>

          {filtrados.length === 0 && (
            <div className="mt-8 rounded-[28px] border border-dashed border-blush-200 bg-card/70 px-6 py-10 text-center">
              <SearchX className="mx-auto size-9 text-blush-400" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-3 font-serif text-2xl">Nada encontrado para “{busca.trim()}”</p>
              <p className="mt-1 text-[15px] text-muted-foreground">Tente outra palavra ou veja todas as categorias.</p>
              <Button
                variant="soft"
                className="mt-5"
                onClick={() => {
                  setBusca('')
                  setCat('todas')
                }}
              >
                Ver todos os presentes
              </Button>
            </div>
          )}

          {MODO_DEMO && (
            <p className="mx-auto mt-10 max-w-md rounded-2xl bg-gold-soft px-4 py-3 text-center text-xs leading-relaxed text-gold-ink">
              Modo demonstração: as reservas de presentes ficam salvas só neste navegador.
            </p>
          )}
        </div>
      </div>

      <ModalResponsivo aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        {({ Titulo, Descricao }) =>
          aberto && <FluxoReserva key={aberto.id} item={aberto} faltam={faltam(aberto)} Titulo={Titulo} Descricao={Descricao} onFechar={() => setModalAberto(false)} />
        }
      </ModalResponsivo>
    </section>
  )
}

function CabecalhoBloco({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <Revelar className="mb-5 flex flex-col items-center text-center">
      <h3 className="font-serif text-[34px] leading-tight font-medium">{titulo}</h3>
      <p className="mt-1 max-w-lg text-[15px] text-muted-foreground">{descricao}</p>
    </Revelar>
  )
}

function Chip({ ativo, rotulo, n, onClick }: { ativo: boolean; rotulo: string; n: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        'flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        ativo ? 'bg-primary text-primary-foreground shadow-[0_8px_16px_-10px_rgb(180_77_100/0.8)]' : 'text-muted-foreground hover:bg-blush-50 hover:text-rose-ink',
      )}
    >
      {rotulo}
      <span className={cn('text-xs tabular-nums', ativo ? 'text-white/75' : 'text-muted-foreground/70')}>{n}</span>
    </button>
  )
}

function CartaoPresente({
  item,
  indice,
  faltam,
  reservados,
  meus,
  onPresentear,
}: {
  item: Item
  indice: number
  faltam: number
  reservados: number
  meus: number
  onPresentear: () => void
}) {
  const completo = item.qtd > 0 && faltam === 0
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -30px 0px' }}
      transition={{ duration: 0.45, delay: Math.min(indice, 6) * 0.04, ease: EASE_OUT }}
      className={cn(
        'group flex flex-col rounded-[24px] border bg-card p-4 shadow-soft transition-[border-color,box-shadow,transform] duration-200',
        completo ? 'border-border/60 bg-card/70' : 'border-border/80 hover:-translate-y-0.5 hover:border-blush-200 hover:shadow-card',
      )}
    >
      <div className="flex gap-3.5">
        <span
          aria-hidden="true"
          className={cn(
            'grid size-14 shrink-0 place-items-center rounded-2xl text-[28px] transition-transform duration-300',
            completo ? 'bg-muted grayscale-[.6]' : 'bg-gradient-to-br from-blush-50 to-blush-100 group-hover:scale-105 group-hover:-rotate-3',
          )}
        >
          {item.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('leading-snug font-medium', completo && 'text-muted-foreground')}>{item.nome}</p>
          {item.desc && <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{item.desc}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px]">
        {completo ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 font-medium text-success">
            <Check className="size-3.5" aria-hidden="true" /> Já garantido
          </span>
        ) : item.qtd > 0 ? (
          <span className="rounded-full bg-blush-50 px-2.5 py-1 text-rose-ink tabular-nums">
            Faltam <strong className="font-semibold">{faltam}</strong> de {item.qtd}
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            Quantidade livre{reservados ? ` · ${reservados} já reservado${reservados > 1 ? 's' : ''}` : ''}
          </span>
        )}
        {meus > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 font-medium text-gold-ink">
            <Heart className="size-3 fill-current" aria-hidden="true" /> Você vai levar {meus}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {!completo && (
          <Button size="sm" variant="soft" className="flex-1" onClick={onPresentear}>
            <Gift /> Vou presentear
          </Button>
        )}
        {item.link && (
          <Button size="sm" variant="outline" className={cn(completo && 'flex-1')} asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${item.nome} na loja ${loja(item.link)} (abre em nova aba)`}>
              {loja(item.link)} <ExternalLink className="size-3.5" />
            </a>
          </Button>
        )}
      </div>
    </motion.li>
  )
}

/* ---------------- janela de reserva ---------------- */

function FluxoReserva({
  item,
  faltam,
  Titulo,
  Descricao,
  onFechar,
}: {
  item: Item
  faltam: number
  Titulo: TextoComp
  Descricao: TextoComp
  onFechar: () => void
}) {
  const { reservar, minha } = useRespostas()
  const max = item.qtd > 0 ? faltam : MAX_LIVRE
  const [qtd, setQtd] = useState(1)
  const [nome, setNome] = useState(minha ? `${minha.nome} ${minha.sobrenome}`.trim() : '')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [feito, setFeito] = useState(false)
  const [uni, unis] = item.unidade

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    if (!nome.trim()) {
      setErro('Escreva seu nome para os papais saberem de quem é o carinho.')
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      await reservar({ id: novoId(), itemId: item.id, item: item.nome, qtd, nome: nome.trim(), limite: item.qtd })
      setFeito(true)
      void soltarConfete('pequena')
    } catch (err) {
      console.error(err)
      setErro(err instanceof ErroServidor ? err.message : 'Não conseguimos salvar agora. Confira sua internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  if (feito) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="flex flex-col items-center pt-4 text-center"
      >
        <SeloCoracao presente />
        <Titulo className="mt-6 font-serif text-[32px] leading-tight font-medium text-foreground">Obrigada pelo carinho!</Titulo>
        <Descricao className="mt-2 max-w-xs text-base text-muted-foreground">
          Anotamos que você vai presentear{' '}
          <strong className="font-medium text-foreground">
            {qtd > 1 ? `${qtd} ${unis} de ` : ''}
            {item.nome}
          </strong>
          . A {CONFIG.bebe} agradece! 💕
        </Descricao>
        <div className="mt-6 grid w-full gap-2">
          {item.link && (
            <Button asChild>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Ver na {loja(item.link)}
              </a>
            </Button>
          )}
          <Button variant={item.link ? 'ghost' : 'default'} onClick={onFechar}>
            Voltar à lista
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={enviar}>
      <div className="flex flex-col items-center text-center">
        <span aria-hidden="true" className="grid size-20 place-items-center rounded-[26px] bg-gradient-to-br from-blush-50 to-blush-100 text-[40px] shadow-soft">
          {item.emoji}
        </span>
        <p className="mt-4 text-xs font-medium tracking-[0.3em] text-gold-ink uppercase">Vou presentear</p>
        <Titulo className="mt-1 px-6 font-serif text-[28px] leading-tight font-medium text-foreground">{item.nome}</Titulo>
        <Descricao className="mt-2 text-[15px] text-muted-foreground">
          {item.qtd > 0
            ? `Ainda faltam ${plural(faltam, uni, unis)} — avise quantas você vai levar.`
            : 'Quantidade livre — avise quantas você vai levar.'}
        </Descricao>
      </div>

      {max > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-blush-50 p-4">
          <p id="rotulo-qtd" className="font-medium">
            Quantidade
          </p>
          <div role="group" aria-labelledby="rotulo-qtd" className="flex items-center gap-2">
            <Button type="button" size="icon" variant="outline" aria-label="Diminuir" disabled={qtd <= 1} onClick={() => setQtd((q) => Math.max(1, q - 1))}>
              <Minus />
            </Button>
            <output aria-live="polite" className="w-9 text-center font-serif text-3xl font-semibold text-primary tabular-nums">
              {qtd}
            </output>
            <Button type="button" size="icon" variant="outline" aria-label="Aumentar" disabled={qtd >= max} onClick={() => setQtd((q) => Math.min(max, q + 1))}>
              <Plus />
            </Button>
          </div>
        </div>
      )}

      <label className="mt-5 block">
        <span className="text-sm font-medium">Seu nome</span>
        <Input
          value={nome}
          onChange={(e) => {
            setNome(e.target.value)
            setErro(null)
          }}
          autoComplete="name"
          placeholder="Ex.: Ana Ribeiro"
          aria-invalid={!!erro}
          className="mt-2 h-12 rounded-2xl border-border bg-card px-4 text-base shadow-none focus-visible:border-blush-400 focus-visible:ring-blush-200/70 md:text-base"
        />
      </label>

      {erro && (
        <p role="alert" className="mt-4 rounded-2xl bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-5 w-full" disabled={enviando || max < 1}>
        {enviando ? (
          <>
            <LoaderCircle className="animate-spin" /> Salvando…
          </>
        ) : (
          <>
            <Heart /> Confirmar presente
          </>
        )}
      </Button>
      {item.link && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Referência:{' '}
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
            ver na {loja(item.link)}
          </a>
        </p>
      )}
    </form>
  )
}
