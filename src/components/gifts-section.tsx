import { useDeferredValue, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  Check,
  ChevronDown,
  Gift,
  Heart,
  LoaderCircle,
  Minus,
  MousePointerClick,
  Plus,
  Search,
  SearchX,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORIAS, FRALDAS, NOTA_FRALDAS, PRESENTES, TEXTO_PRESENTES, type Categoria } from '@/data/presentes'
import { FOTOS_ILUSTRATIVAS } from '@/data/fotos-ilustrativas'
import { useRespostas } from '@/hooks/use-respostas'
import { ErroServidor, MODO_DEMO } from '@/lib/store'
import { filtrarPorTexto, novoId, plural } from '@/lib/texto'
import { cn } from '@/lib/utils'
import { SeloCoracao, soltarConfete } from './celebracao'
import { CATEGORIA_VISUAL, fotoDoItem, iconeDoItem, Miniatura, SeloCategoria, TOM_FRALDAS, type Tom } from './gift-icon'
import { ModalResponsivo, type TextoComp } from './modal'
import { EASE_OUT, NumeroAnimado, Revelar, TituloSecao } from './primitives'

type Item = {
  id: string
  nome: string
  desc?: string
  /** 0 = quantidade livre */
  qtd: number
  Icone: LucideIcon
  tom: Tom
  foto?: string
  /** foto de banco de imagens, não é o produto exato */
  ilustrativa?: boolean
  link?: string
  loja?: string
  preco: number
  aprox?: boolean
  unidade: [string, string]
  cat?: Categoria
}

/* ---------------- lojas ---------------- */
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

function loja(link?: string) {
  if (!link) return undefined
  try {
    const host = new URL(link).hostname.replace(/^www\./, '')
    return LOJAS.find(([re]) => re.test(host))?.[1] ?? host
  } catch {
    return 'loja'
  }
}

/** "Fralda de Boca Floral – Toi Toi" → "Fralda de Boca Floral" (a loja aparece à parte) */
function semLoja(nome: string, nomeLoja?: string) {
  if (!nomeLoja) return nome
  const partes = nome.split(' – ')
  return partes.length > 1 && partes.at(-1)!.toLowerCase().startsWith(nomeLoja.toLowerCase().split(' ')[0])
    ? partes.slice(0, -1).join(' – ')
    : nome
}

/* ---------------- preços ---------------- */
type FaixaId = 'todas' | 'ate50' | '50a100' | '100a200' | 'mais200'
const FAIXAS: { id: FaixaId; rotulo: string; min: number; max: number }[] = [
  { id: 'todas', rotulo: 'Qualquer valor', min: 0, max: Infinity },
  { id: 'ate50', rotulo: 'Até R$ 50', min: 0, max: 50 },
  { id: '50a100', rotulo: 'R$ 50 a 100', min: 50.01, max: 100 },
  { id: '100a200', rotulo: 'R$ 100 a 200', min: 100.01, max: 200 },
  { id: 'mais200', rotulo: 'Acima de R$ 200', min: 200.01, max: Infinity },
]
type Ordem = 'sugestao' | 'menor' | 'maior'
const ORDENS: { id: Ordem; rotulo: string }[] = [
  { id: 'sugestao', rotulo: 'Sugestão' },
  { id: 'menor', rotulo: 'Menor preço' },
  { id: 'maior', rotulo: 'Maior preço' },
]

const reais = (v: number, aprox?: boolean) =>
  aprox
    ? `≈ R$ ${Math.round(v)}`
    : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? 2 : 0 })

function Preco({ item, className }: { item: Pick<Item, 'preco' | 'aprox'>; className?: string }) {
  return (
    <span
      className={cn(
        'font-serif text-[19px] leading-none font-semibold whitespace-nowrap tabular-nums lining-nums',
        item.aprox ? 'text-foreground/70' : 'text-rose-ink',
        className,
      )}
      title={item.aprox ? 'Valor aproximado' : 'Preço de referência na loja (nov/2026)'}
    >
      {reais(item.preco, item.aprox)}
      {item.aprox && <span className="sr-only"> (valor aproximado)</span>}
    </span>
  )
}

/* ---------------- dados ---------------- */
const ITENS: (Item & { cat: Categoria })[] = PRESENTES.map((p) => {
  const nomeLoja = loja(p.link)
  return {
    ...p,
    nome: semLoja(p.nome, nomeLoja),
    loja: nomeLoja,
    foto: fotoDoItem(p.id),
    ilustrativa: FOTOS_ILUSTRATIVAS.has(p.id),
    Icone: iconeDoItem(p.nome, p.cat),
    tom: CATEGORIA_VISUAL[p.cat].tom,
    unidade: ['unidade', 'unidades'],
  }
})
const ITENS_FRALDA: Item[] = FRALDAS.map((f) => ({
  id: f.id,
  nome: f.rotulo,
  qtd: f.qtd,
  preco: f.preco,
  aprox: true,
  Icone: Baby,
  tom: TOM_FRALDAS,
  unidade: ['pacote', 'pacotes'],
}))
const CONTAGEM = new Map<Categoria, number>()
for (const i of ITENS) CONTAGEM.set(i.cat, (CONTAGEM.get(i.cat) ?? 0) + 1)

const PREVIA = 4
const POR_PAGINA = 12
const MAX_LIVRE = 10

/** Primeira frase vira subtítulo; o resto vai para o parágrafo */
const [FRASE_ABERTURA, ...RESTO] = TEXTO_PRESENTES.split(/(?<=!)\s+/)

const reduzirMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* =====================================================================
   Seção
   ===================================================================== */
export function SecaoPresentes() {
  const { publico, minhasReservas } = useRespostas()
  const { reservas } = publico
  const [cat, setCat] = useState<Categoria | 'todas'>('todas')
  const [busca, setBusca] = useState('')
  const [faixa, setFaixa] = useState<FaixaId>('todas')
  const [ordem, setOrdem] = useState<Ordem>('sugestao')
  const [soFaltam, setSoFaltam] = useState(false)
  const termo = useDeferredValue(busca)
  const [aberto, setAberto] = useState<Item | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const topoLista = useRef<HTMLDivElement>(null)
  const trilhaChips = useRef<HTMLDivElement>(null)

  const faltam = (i: Pick<Item, 'id' | 'qtd'>) => Math.max(0, i.qtd - (reservas[i.id] ?? 0))
  const completo = (i: Pick<Item, 'id' | 'qtd'>) => i.qtd > 0 && faltam(i) === 0

  // progresso geral da lista (só itens com quantidade definida)
  const progresso = useMemo(() => {
    let total = 0
    let garantidos = 0
    for (const i of [...ITENS_FRALDA, ...ITENS]) {
      if (!i.qtd) continue
      total += i.qtd
      garantidos += Math.min(i.qtd, reservas[i.id] ?? 0)
    }
    return { total, garantidos, pct: total ? garantidos / total : 0 }
  }, [reservas])

  // categoria + busca + disponibilidade (antes do preço, para contar cada faixa)
  const semFaixa = useMemo(() => {
    let base = cat === 'todas' ? ITENS : ITENS.filter((i) => i.cat === cat)
    if (soFaltam) base = base.filter((i) => !(i.qtd > 0 && (reservas[i.id] ?? 0) >= i.qtd))
    return filtrarPorTexto(base, termo, (i) => `${i.nome} ${i.desc ?? ''} ${i.cat} ${i.loja ?? ''}`)
  }, [cat, termo, soFaltam, reservas])

  const porFaixa = useMemo(() => {
    const m = new Map<FaixaId, number>()
    for (const f of FAIXAS) m.set(f.id, semFaixa.filter((i) => i.preco >= f.min && i.preco <= f.max).length)
    return m
  }, [semFaixa])

  const filtrados = useMemo(() => {
    const f = FAIXAS.find((x) => x.id === faixa)!
    const lista = semFaixa.filter((i) => i.preco >= f.min && i.preco <= f.max)
    // o que já foi garantido vai para o fim
    const fim = (i: Item) => Number(i.qtd > 0 && (reservas[i.id] ?? 0) >= i.qtd)
    if (ordem === 'sugestao') return [...lista].sort((a, b) => fim(a) - fim(b))
    return [...lista].sort((a, b) => fim(a) - fim(b) || (ordem === 'menor' ? a.preco - b.preco : b.preco - a.preco))
  }, [semFaixa, faixa, ordem, reservas])

  const agrupado = cat === 'todas' && !termo.trim() && ordem === 'sugestao'

  const grupos = useMemo(() => {
    const m = new Map<Categoria, typeof ITENS>()
    for (const i of filtrados) m.set(i.cat, [...(m.get(i.cat) ?? []), i])
    return CATEGORIAS.filter((c) => m.has(c)).map((c) => [c, m.get(c)!] as const)
  }, [filtrados])

  // paginação da lista corrida: volta ao início quando os filtros mudam
  const chave = `${cat}|${termo}|${faixa}|${ordem}|${soFaltam}`
  const [pagina, setPagina] = useState({ chave, n: POR_PAGINA })
  const limite = pagina.chave === chave ? pagina.n : POR_PAGINA

  const nFiltros = Number(faixa !== 'todas') + Number(ordem !== 'sugestao') + Number(soFaltam)

  function rolarParaLista() {
    const el = topoLista.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: reduzirMovimento() ? 'auto' : 'smooth', block: 'start' })
  }

  function escolherCategoria(c: Categoria | 'todas') {
    setCat(c)
    rolarParaLista()
    // centraliza o chip escolhido na trilha
    const trilha = trilhaChips.current
    const chip = trilha?.querySelector<HTMLElement>(`[data-cat="${c}"]`)
    if (trilha && chip) {
      trilha.scrollTo({
        left: chip.offsetLeft - trilha.clientWidth / 2 + chip.clientWidth / 2,
        behavior: reduzirMovimento() ? 'auto' : 'smooth',
      })
    }
  }

  function limparTudo() {
    setBusca('')
    setFaixa('todas')
    setOrdem('sugestao')
    setSoFaltam(false)
    escolherCategoria('todas')
  }

  function abrir(item: Item) {
    setAberto(item)
    setModalAberto(true)
  }

  const propsCartao = (item: Item, i: number) => ({
    item,
    indice: i,
    faltam: faltam(item),
    completo: completo(item),
    reservados: reservas[item.id] ?? 0,
    meus: minhasReservas[item.id] ?? 0,
    onPresentear: () => abrir(item),
  })

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

      <div className="mx-auto max-w-6xl">
        {/* ---------------- introdução ---------------- */}
        <Revelar className="mx-auto max-w-3xl">
          <p className="mx-auto max-w-xl text-center text-[15px] leading-relaxed text-muted-foreground sm:text-base">{RESTO.join(' ')}</p>

          <ol className="mt-7 grid grid-cols-3 gap-2 sm:gap-4">
            <Passo n={1} Icone={MousePointerClick} titulo="Escolha um mimo" texto="Fotos e valores são só referência" />
            <Passo n={2} Icone={Gift} titulo="Toque em Presentear" texto="Assim ninguém repete o item" />
            <Passo n={3} Icone={ShoppingBag} titulo="Compre onde preferir" texto="Nada é cobrado por aqui" />
          </ol>

          <div className="mt-5 flex items-center gap-4 rounded-[22px] border border-border/70 bg-card/80 px-4 py-3.5 shadow-soft backdrop-blur-sm sm:px-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <Sparkles className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm leading-tight text-muted-foreground">Itens já garantidos</p>
                <p className="shrink-0 text-sm whitespace-nowrap text-muted-foreground">
                  <NumeroAnimado valor={progresso.garantidos} className="font-serif text-[24px] leading-none font-semibold text-success" /> de{' '}
                  {progresso.total}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-[#9cc3a5] to-success"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: Math.max(0.015, progresso.pct) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </Revelar>

        {/* ---------------- Fraldas ---------------- */}
        <div className="mt-14">
          <CabecalhoBloco sobretitulo="O mais pedido" titulo="Fraldinhas" descricao={NOTA_FRALDAS} />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {ITENS_FRALDA.map((item, i) => (
              <CartaoFralda
                key={item.id}
                item={item}
                tamanho={FRALDAS[i].tamanho}
                indice={i}
                faltam={faltam(item)}
                meus={minhasReservas[item.id] ?? 0}
                onLevar={() => abrir(item)}
              />
            ))}
          </ul>
        </div>

        {/* ---------------- Enxoval ---------------- */}
        <div className="mt-16" ref={topoLista} style={{ scrollMarginTop: 8 }}>
          <CabecalhoBloco
            sobretitulo={`${ITENS.length} sugestões`}
            titulo="Enxoval e mimos"
            descricao="Busque, filtre por categoria ou por valor e escolha com o coração."
          />

          {/* barra de busca e filtros (fixa ao rolar) */}
          <div className="sticky top-2 z-30 -mx-2 sm:mx-0">
            <div className="rounded-[24px] border border-border/70 bg-card/90 p-2 shadow-[0_12px_32px_-18px_rgb(120_70_60/0.45)] backdrop-blur-xl backdrop-saturate-150">
              <div className="flex gap-2">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Buscar presente</span>
                  <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-blush-400" />
                  <Input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar body, cueiro, toalha…"
                    autoComplete="off"
                    enterKeyHint="search"
                    className="h-11 rounded-full border-transparent bg-blush-50/80 pr-11 pl-11 text-base shadow-none placeholder:text-[#a99389] focus-visible:border-blush-300 focus-visible:bg-card focus-visible:ring-blush-200/70 md:text-base"
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
                        className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </label>
                <button
                  type="button"
                  onClick={() => setFiltrosAbertos(true)}
                  aria-label={nFiltros ? `Filtros (${nFiltros} ativos)` : 'Filtros'}
                  className={cn(
                    'relative flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-4',
                    nFiltros ? 'border-primary/30 bg-blush-100 text-rose-ink' : 'border-border bg-card text-foreground hover:bg-blush-50',
                  )}
                >
                  <SlidersHorizontal className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  <span className="hidden min-[400px]:inline">Filtros</span>
                  <AnimatePresence>
                    {nFiltros > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white ring-2 ring-card"
                      >
                        {nFiltros}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div
                ref={trilhaChips}
                role="group"
                aria-label="Categorias"
                className="relative mt-2 -mb-0.5 flex gap-1 overflow-x-auto scroll-smooth px-0.5 pb-0.5 [mask-image:linear-gradient(90deg,transparent,#000_10px,#000_calc(100%-28px),transparent)] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible lg:[mask-image:none] [&::-webkit-scrollbar]:hidden"
              >
                <ChipCategoria ativo={cat === 'todas'} valor="todas" onClick={() => escolherCategoria('todas')} rotulo="Todas" n={ITENS.length} Icone={Sparkles} />
                {CATEGORIAS.map((c) => (
                  <ChipCategoria
                    key={c}
                    valor={c}
                    ativo={cat === c}
                    onClick={() => escolherCategoria(c)}
                    rotulo={CATEGORIA_VISUAL[c].curto}
                    titulo={c}
                    n={CONTAGEM.get(c) ?? 0}
                    Icone={CATEGORIA_VISUAL[c].Icone}
                  />
                ))}
                <span aria-hidden="true" className="w-4 shrink-0" />
              </div>
            </div>
          </div>

          {/* resumo do que está aplicado */}
          <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
            <p className="mr-1 text-sm text-muted-foreground" aria-live="polite">
              <strong className="font-semibold text-foreground tabular-nums">{filtrados.length}</strong>{' '}
              {filtrados.length === 1 ? 'presente' : 'presentes'}
              {cat !== 'todas' && <> em {cat.toLowerCase()}</>}
            </p>
            <AnimatePresence initial={false} mode="popLayout">
              {faixa !== 'todas' && (
                <PilulaFiltro key="faixa" onRemover={() => setFaixa('todas')}>
                  {FAIXAS.find((f) => f.id === faixa)!.rotulo}
                </PilulaFiltro>
              )}
              {ordem !== 'sugestao' && (
                <PilulaFiltro key="ordem" onRemover={() => setOrdem('sugestao')}>
                  {ORDENS.find((o) => o.id === ordem)!.rotulo}
                </PilulaFiltro>
              )}
              {soFaltam && (
                <PilulaFiltro key="faltam" onRemover={() => setSoFaltam(false)}>
                  Só o que falta
                </PilulaFiltro>
              )}
              {(nFiltros > 0 || cat !== 'todas' || busca) && (
                <motion.button
                  key="limpar"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  onClick={limparTudo}
                  className="cursor-pointer rounded-full px-2 py-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Limpar tudo
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* ---------------- lista ---------------- */}
          {filtrados.length > 0 &&
            (agrupado ? (
              <div className="mt-6 space-y-12">
                {grupos.map(([c, itens]) => (
                  <section key={c} aria-labelledby={`grupo-${c}`}>
                    <div className="mb-4 flex items-center gap-3 px-1">
                      <SeloCategoria cat={c} />
                      <h4 id={`grupo-${c}`} className="min-w-0 font-serif text-[25px] leading-tight font-medium text-foreground sm:text-[28px]">
                        {c}
                      </h4>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">{itens.length}</span>
                      <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent sm:block" />
                      {itens.length > PREVIA && (
                        <button
                          type="button"
                          onClick={() => escolherCategoria(c)}
                          className="ml-auto hidden shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-blush-50 sm:flex"
                        >
                          Ver todos <ArrowRight className="size-4" />
                        </button>
                      )}
                    </div>
                    <GradeCartoes>
                      {itens.slice(0, PREVIA).map((item, i) => (
                        <CartaoPresente key={item.id} {...propsCartao(item, i)} />
                      ))}
                    </GradeCartoes>
                    {itens.length > PREVIA && (
                      <button
                        type="button"
                        onClick={() => escolherCategoria(c)}
                        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[18px] border border-dashed border-blush-200 bg-card/50 py-3 text-sm font-medium text-rose-ink transition-colors hover:border-blush-300 hover:bg-blush-50 sm:hidden"
                      >
                        Ver todos os {itens.length} de {CATEGORIA_VISUAL[c].curto.toLowerCase()} <ArrowRight className="size-4" />
                      </button>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <GradeCartoes>
                  {filtrados.slice(0, limite).map((item, i) => (
                    <CartaoPresente key={item.id} {...propsCartao(item, i % POR_PAGINA)} mostrarCategoria={cat === 'todas'} />
                  ))}
                </GradeCartoes>
                {filtrados.length > limite && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <Button variant="outline" size="lg" onClick={() => setPagina({ chave, n: limite + POR_PAGINA })}>
                      Mostrar mais <ChevronDown />
                    </Button>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Mostrando {limite} de {filtrados.length}
                    </p>
                  </div>
                )}
              </div>
            ))}

          {filtrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-[28px] border border-dashed border-blush-200 bg-card/70 px-6 py-12 text-center"
            >
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-blush-50">
                <SearchX className="size-7 text-blush-400" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-4 font-serif text-2xl">{busca.trim() ? `Nada encontrado para “${busca.trim()}”` : 'Nenhum presente nessa combinação'}</p>
              <p className="mt-1 text-[15px] text-muted-foreground">Tente outra palavra, categoria ou faixa de preço.</p>
              <Button variant="soft" className="mt-5" onClick={limparTudo}>
                Limpar filtros
              </Button>
            </motion.div>
          )}

          <p className="mt-10 text-center text-xs leading-relaxed text-muted-foreground">
            Valores de referência das lojas em novembro de 2026 · os marcados com <strong className="font-semibold">≈</strong> são aproximados.
          </p>

          {MODO_DEMO && (
            <p className="mx-auto mt-4 max-w-md rounded-2xl bg-gold-soft px-4 py-3 text-center text-xs leading-relaxed text-gold-ink">
              Modo demonstração: as reservas de presentes ficam salvas só neste navegador.
            </p>
          )}
        </div>
      </div>

      <ModalResponsivo aberto={filtrosAbertos} onFechar={() => setFiltrosAbertos(false)}>
        {({ Titulo, Descricao }) => (
          <PainelFiltros
            Titulo={Titulo}
            Descricao={Descricao}
            faixa={faixa}
            setFaixa={setFaixa}
            ordem={ordem}
            setOrdem={setOrdem}
            soFaltam={soFaltam}
            setSoFaltam={setSoFaltam}
            porFaixa={porFaixa}
            total={filtrados.length}
            onLimpar={() => {
              setFaixa('todas')
              setOrdem('sugestao')
              setSoFaltam(false)
            }}
            onFechar={() => {
              setFiltrosAbertos(false)
              rolarParaLista()
            }}
          />
        )}
      </ModalResponsivo>

      <ModalResponsivo aberto={modalAberto} onFechar={() => setModalAberto(false)} semRespiro>
        {({ Titulo, Descricao }) =>
          aberto && (
            <FluxoReserva key={aberto.id} item={aberto} faltam={faltam(aberto)} Titulo={Titulo} Descricao={Descricao} onFechar={() => setModalAberto(false)} />
          )
        }
      </ModalResponsivo>
    </section>
  )
}

/* =====================================================================
   Peças
   ===================================================================== */
function Passo({ n, Icone, titulo, texto }: { n: number; Icone: LucideIcon; titulo: string; texto: string }) {
  return (
    <li className="relative flex flex-col items-center rounded-[20px] border border-border/60 bg-card/60 px-2 pt-4 pb-3.5 text-center sm:px-4 sm:pt-5 sm:pb-4">
      <span className="absolute top-2 left-3 font-serif text-sm text-gold-ink/70 italic">{n}</span>
      <span className="grid size-10 place-items-center rounded-full bg-blush-100 text-rose-ink sm:size-12">
        <Icone className="size-[18px] sm:size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="mt-2.5 text-[13px] leading-tight font-medium text-foreground sm:text-[15px]">{titulo}</p>
      <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground max-[359px]:hidden sm:text-[13px]">{texto}</p>
    </li>
  )
}

function CabecalhoBloco({ sobretitulo, titulo, descricao }: { sobretitulo: string; titulo: string; descricao: string }) {
  return (
    <Revelar className="mb-6 flex flex-col items-center text-center">
      <p className="text-[11px] font-medium tracking-[0.3em] text-gold-ink uppercase">{sobretitulo}</p>
      <h3 className="mt-2 font-serif text-[34px] leading-tight font-medium sm:text-[40px]">{titulo}</h3>
      <p className="mt-1 max-w-md text-[15px] text-muted-foreground">{descricao}</p>
    </Revelar>
  )
}

function ChipCategoria({
  ativo,
  valor,
  rotulo,
  titulo,
  n,
  Icone,
  onClick,
}: {
  ativo: boolean
  valor: string
  rotulo: string
  titulo?: string
  n: number
  Icone: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-cat={valor}
      aria-pressed={ativo}
      title={titulo}
      onClick={onClick}
      className={cn(
        'relative flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        ativo ? 'text-primary-foreground' : 'text-muted-foreground hover:bg-blush-50 hover:text-rose-ink',
      )}
    >
      {ativo && (
        <motion.span
          layoutId="chip-categoria-ativo"
          className="absolute inset-0 rounded-full bg-primary shadow-[0_8px_18px_-10px_rgb(176_88_95/0.9)]"
          transition={{ type: 'spring', stiffness: 520, damping: 40 }}
        />
      )}
      <Icone className="relative size-4" strokeWidth={1.75} aria-hidden="true" />
      <span className="relative">{rotulo}</span>
      <span className={cn('relative text-xs tabular-nums', ativo ? 'text-white/75' : 'text-muted-foreground/60')}>{n}</span>
    </button>
  )
}

function PilulaFiltro({ children, onRemover }: { children: ReactNode; onRemover: () => void }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onRemover}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blush-100 py-1 pr-2 pl-3 text-[13px] font-medium text-rose-ink transition-colors hover:bg-blush-200/80"
    >
      {children}
      <X className="size-3.5" aria-label="remover" />
    </motion.button>
  )
}

function GradeCartoes({ children }: { children: ReactNode }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </ul>
  )
}

/** Aviso discreto sobre a foto: imagem de referência, não o produto exato */
function SeloIlustrativa({ completo, className }: { completo?: boolean; className?: string }) {
  return (
    <span
      title="Foto ilustrativa: o produto pode ser diferente"
      className={cn(
        'pointer-events-none absolute rounded-full bg-[#3a2a24]/45 px-1.5 py-px text-[9px] font-medium tracking-wide text-white/95 backdrop-blur-sm sm:px-2 sm:py-0.5 sm:text-[10.5px]',
        className,
      )}
    >
      {completo ? (
        'Foto ilustrativa'
      ) : (
        <>
          <span className="sm:hidden">Ilustrativa</span>
          <span className="hidden sm:inline">Foto ilustrativa</span>
        </>
      )}
    </span>
  )
}

function BarraProgresso({ pct, completo, className }: { pct: number; completo?: boolean; className?: string }) {
  return (
    <div className={cn('h-1 overflow-hidden rounded-full bg-blush-100/80', className)}>
      <motion.div
        className={cn('h-full origin-left rounded-full', completo ? 'bg-success' : 'bg-gradient-to-r from-blush-300 to-primary')}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: pct }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
      />
    </div>
  )
}

/* ---------------- cartão do enxoval ---------------- */
function CartaoPresente({
  item,
  indice,
  faltam,
  completo,
  reservados,
  meus,
  onPresentear,
  mostrarCategoria,
}: {
  item: Item
  indice: number
  faltam: number
  completo: boolean
  reservados: number
  meus: number
  onPresentear: () => void
  mostrarCategoria?: boolean
}) {
  const pct = item.qtd > 0 ? Math.min(1, reservados / item.qtd) : 0
  const rotulo = mostrarCategoria && item.cat ? item.cat : item.loja
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      viewport={{ once: true, margin: '0px 0px -24px 0px' }}
      transition={{ duration: 0.45, delay: Math.min(indice, 8) * 0.035, ease: EASE_OUT }}
      className={cn(
        'group relative flex gap-3.5 rounded-[22px] border bg-card p-2.5 shadow-soft transition-[border-color,box-shadow,translate] duration-300',
        'sm:flex-col sm:gap-0 sm:overflow-hidden sm:p-0',
        completo ? 'border-border/50 bg-card/70' : 'border-border/80 hover:-translate-y-1 hover:border-blush-200 hover:shadow-card',
      )}
    >
      {/* imagem */}
      <div className="relative size-[96px] shrink-0 overflow-hidden rounded-[16px] sm:aspect-[5/4] sm:size-auto sm:w-full sm:rounded-none">
        <Miniatura foto={item.foto} Icone={item.Icone} tom={item.tom} apagado={completo} zoom={!completo} className="size-full sm:[&_svg]:w-[28%]" />
        {/* selos sobre a foto */}
        <div className="pointer-events-none absolute inset-x-1.5 top-1.5 flex flex-wrap gap-1 sm:inset-x-3 sm:top-3">
          {completo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" /> <span className="hidden sm:inline">Já garantido</span>
              <span className="sr-only sm:hidden">Já garantido</span>
            </span>
          )}
          {meus > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-rose-ink shadow-sm backdrop-blur sm:px-2.5 sm:py-1 sm:text-xs">
              <Heart className="size-3 fill-current" aria-hidden="true" /> {meus}
              <span className="hidden sm:inline">com você</span>
              <span className="sr-only sm:hidden">com você</span>
            </span>
          )}
        </div>
        {item.ilustrativa && <SeloIlustrativa className="bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5" />}
      </div>

      {/* conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col py-0.5 pr-1 sm:p-4 sm:pt-3.5">
        {rotulo && <p className="truncate text-[10.5px] font-semibold tracking-[0.14em] text-gold-ink uppercase">{rotulo}</p>}
        <h5 className="mt-0.5">
          {completo ? (
            <span className="line-clamp-2 text-[15px] leading-snug font-medium text-muted-foreground">{item.nome}</span>
          ) : (
            <button
              type="button"
              onClick={onPresentear}
              className="cursor-pointer text-left text-[15px] leading-snug font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-[22px] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
            >
              <span className="line-clamp-2">{item.nome}</span>
            </button>
          )}
        </h5>
        {item.desc && <p className="mt-0.5 hidden truncate text-[13px] text-muted-foreground sm:block">{item.desc}</p>}

        {/* andamento */}
        <div className="mt-2 sm:mt-3">
          {item.qtd > 0 ? (
            <>
              <BarraProgresso pct={pct} completo={completo} />
              <p className="mt-1.5 text-[12px] text-muted-foreground tabular-nums">
                {completo ? (
                  <span className="font-medium text-success">Completo, obrigada! 💕</span>
                ) : (
                  <>
                    Faltam <strong className="font-semibold text-foreground">{faltam}</strong> de {item.qtd}
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground/80">Quantidade livre</span>
              {reservados > 0 && ` · ${plural(reservados, 'reservado', 'reservados')}`}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5 sm:pt-4">
          <Preco item={item} className={cn('pb-1 text-[18px] sm:text-[20px]', completo && 'text-muted-foreground/70')} />
          <div className="relative z-10 flex shrink-0 items-center gap-1.5">
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver ${item.nome} na ${item.loja} (abre em nova aba)`}
                title={`Ver na ${item.loja}`}
                className="hidden size-9 place-items-center rounded-full border border-blush-200 text-rose-ink transition-colors hover:border-blush-300 hover:bg-blush-50 sm:grid"
              >
                <ArrowUpRight className="size-4" />
              </a>
            )}
            {!completo && (
              <Button size="xs" variant="soft" className="h-9 px-3.5 text-[13px] group-hover:bg-primary group-hover:text-primary-foreground" onClick={onPresentear} tabIndex={-1} aria-hidden="true">
                <Gift className="size-3.5" /> Presentear
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  )
}

/* ---------------- cartão das fraldas ---------------- */
function CartaoFralda({
  item,
  tamanho,
  indice,
  faltam,
  meus,
  onLevar,
}: {
  item: Item
  tamanho: string
  indice: number
  faltam: number
  meus: number
  onLevar: () => void
}) {
  const pct = item.qtd ? Math.min(1, (item.qtd - faltam) / item.qtd) : 0
  const R = 34
  const C = 2 * Math.PI * R
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -24px 0px' }}
      transition={{ duration: 0.5, delay: indice * 0.07, ease: EASE_OUT }}
      className={cn(
        'relative flex flex-col items-center rounded-[24px] border p-4 pt-5 text-center shadow-soft sm:p-5',
        faltam ? 'border-border/80 bg-card' : 'border-success/20 bg-success-soft/40',
      )}
    >
      {meus > 0 && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold-ink">
          <Heart className="size-3 fill-current" aria-hidden="true" /> {meus}
          <span className="sr-only">com você</span>
        </span>
      )}
      <div className="relative grid size-[84px] place-items-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={R} fill="none" strokeWidth="5" className="stroke-blush-100" />
          <motion.circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            className={faltam ? 'stroke-primary' : 'stroke-success'}
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            whileInView={{ strokeDashoffset: C * (1 - Math.max(pct, 0.001)) }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 + indice * 0.07 }}
          />
        </svg>
        <span className="grid size-[64px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fffaf6,#fbe6dc)] font-serif text-[30px] leading-none font-semibold text-primary">
          {tamanho}
        </span>
      </div>
      <p className="mt-3 text-[15px] font-medium">{item.nome}</p>
      <p className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">
        {faltam ? (
          <>
            Faltam <strong className="font-semibold text-foreground">{faltam}</strong> de {item.qtd}
          </>
        ) : (
          <span className="font-medium text-success">Já temos todos 💕</span>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        <Preco item={item} className="text-[15px]" /> o pacote
      </p>
      <div className="mt-auto w-full pt-4">
        <Button size="sm" variant={faltam ? 'soft' : 'ghost'} className="w-full" disabled={!faltam} onClick={onLevar}>
          {faltam ? (
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
    </motion.li>
  )
}

/* ---------------- painel de filtros ---------------- */
function PainelFiltros({
  Titulo,
  Descricao,
  faixa,
  setFaixa,
  ordem,
  setOrdem,
  soFaltam,
  setSoFaltam,
  porFaixa,
  total,
  onLimpar,
  onFechar,
}: {
  Titulo: TextoComp
  Descricao: TextoComp
  faixa: FaixaId
  setFaixa: (f: FaixaId) => void
  ordem: Ordem
  setOrdem: (o: Ordem) => void
  soFaltam: boolean
  setSoFaltam: (v: boolean) => void
  porFaixa: Map<FaixaId, number>
  total: number
  onLimpar: () => void
  onFechar: () => void
}) {
  return (
    <div>
      <Titulo className="pr-10 font-serif text-[28px] leading-tight font-medium text-foreground">Filtrar presentes</Titulo>
      <Descricao className="mt-1 text-[15px] text-muted-foreground">Ajuste do seu jeito e veja o resultado na hora.</Descricao>

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Faixa de preço</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {FAIXAS.map((f) => {
            const n = porFaixa.get(f.id) ?? 0
            const ativo = faixa === f.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={ativo}
                disabled={!n && !ativo}
                onClick={() => setFaixa(f.id)}
                className={cn(
                  'flex h-12 cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3.5 text-left text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40',
                  f.id === 'todas' && 'col-span-2',
                  ativo ? 'border-primary bg-blush-50 text-rose-ink ring-1 ring-primary' : 'border-border bg-card hover:border-blush-300',
                )}
              >
                {f.rotulo}
                <span className={cn('text-xs tabular-nums', ativo ? 'text-rose-ink/70' : 'text-muted-foreground')}>{n}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold tracking-[0.2em] text-gold-ink uppercase">Ordenar</legend>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
          {ORDENS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={ordem === o.id}
              onClick={() => setOrdem(o.id)}
              className={cn(
                'relative h-10 cursor-pointer rounded-full px-2 text-[13px] font-medium transition-colors',
                ordem === o.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {ordem === o.id && (
                <motion.span layoutId="ordem-ativa" className="absolute inset-0 rounded-full bg-card shadow-soft" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
              )}
              <span className="relative">{o.rotulo}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        role="switch"
        aria-checked={soFaltam}
        onClick={() => setSoFaltam(!soFaltam)}
        className="mt-6 flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-blush-300"
      >
        <span>
          <span className="block text-[15px] font-medium">Só o que ainda falta</span>
          <span className="block text-[13px] text-muted-foreground">Esconde os itens já garantidos</span>
        </span>
        <span className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', soFaltam ? 'bg-primary' : 'bg-blush-200')}>
          <motion.span
            className="absolute top-1 left-1 size-5 rounded-full bg-white shadow"
            animate={{ x: soFaltam ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          />
        </span>
      </button>

      <div className="mt-7 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onLimpar}>
          Limpar
        </Button>
        <Button className="flex-[2]" onClick={onFechar}>
          Ver {plural(total, 'presente', 'presentes')}
        </Button>
      </div>
    </div>
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
  const ehFralda = item.unidade[0] === 'pacote'

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

  const linkLoja = item.link && (
    <Button variant="outline" className="w-full" asChild>
      <a href={item.link} target="_blank" rel="noopener noreferrer">
        Ver na {item.loja} <ArrowUpRight />
      </a>
    </Button>
  )

  if (feito) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="flex flex-col items-center px-5 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:px-8 sm:pb-8"
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
                Ver na {item.loja} <ArrowUpRight />
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
      {/* cabeçalho com a foto */}
      {ehFralda ? (
        <div className="grid place-items-center bg-[radial-gradient(120%_90%_at_30%_15%,#fffbf7_0%,#fce8da_55%,#f6d4bd_100%)] pt-10 pb-8">
          <span className="grid size-24 place-items-center rounded-full bg-card/80 font-serif text-[44px] font-semibold text-primary shadow-soft">
            {item.nome.split(' ').at(-1)}
          </span>
        </div>
      ) : (
        <div className="relative">
          <Miniatura
            foto={item.foto}
            Icone={item.Icone}
            tom={item.tom}
            carregarJa
            className="aspect-[16/11] max-h-[30dvh] w-full sm:aspect-[16/10] [&_svg]:w-[22%]"
          />
          {item.ilustrativa && <SeloIlustrativa completo className="bottom-3 left-4 sm:left-6" />}
        </div>
      )}

      <div className="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-gold-ink uppercase">
          Vou presentear{item.loja ? ` · ${item.loja}` : ''}
        </p>
        <Titulo className="mt-1.5 font-serif text-[27px] leading-[1.1] font-medium text-foreground">{item.nome}</Titulo>
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Preco item={item} className="text-[22px]" />
          <span className="text-sm text-muted-foreground">{item.aprox ? 'valor aproximado' : 'na loja'}</span>
        </div>
        <Descricao className="mt-2 text-[15px] text-muted-foreground">
          {item.desc ? `${item.desc} ` : ''}
          {item.qtd > 0 ? `Ainda ${faltam === 1 ? 'falta' : 'faltam'} ${plural(faltam, uni, unis)}.` : 'Quantidade livre.'}
        </Descricao>

        {max > 1 && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-blush-50 py-2.5 pr-2.5 pl-4">
            <p id="rotulo-qtd" className="text-[15px] font-medium">
              Quantas vai levar?
            </p>
            <div role="group" aria-labelledby="rotulo-qtd" className="flex items-center gap-1.5">
              <Button type="button" size="icon-sm" variant="outline" aria-label="Diminuir" disabled={qtd <= 1} onClick={() => setQtd((q) => Math.max(1, q - 1))}>
                <Minus />
              </Button>
              <output aria-live="polite" className="w-9 text-center font-serif text-[28px] font-semibold text-primary tabular-nums">
                {qtd}
              </output>
              <Button type="button" size="icon-sm" variant="outline" aria-label="Aumentar" disabled={qtd >= max} onClick={() => setQtd((q) => Math.min(max, q + 1))}>
                <Plus />
              </Button>
            </div>
          </div>
        )}

        <label className="mt-4 block">
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

        <div className="mt-5 grid gap-2">
          <Button type="submit" size="lg" className="w-full" disabled={enviando || max < 1}>
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
          {linkLoja}
        </div>
      </div>
    </form>
  )
}
