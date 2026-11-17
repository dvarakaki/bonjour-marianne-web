import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Copy, Download, Gift, KeyRound, LoaderCircle, LogOut, Mail, MessageCircle, RefreshCw, Search, Send, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FRALDAS, PRESENTES } from '@/data/presentes'
import { linkConvite, mensagemConvite, whatsLink } from '@/lib/evento'
import {
  carregarPainel,
  entrarPainel,
  ErroServidor,
  excluirConfirmacao,
  excluirReserva,
  MODO_DEMO,
  painelLogado,
  sairPainel,
  totalPessoas,
  type DadosPainel,
} from '@/lib/store'
import { filtrarPorTexto, plural, whatsDoTelefone } from '@/lib/texto'
import { cn } from '@/lib/utils'
import { Avatar, NumeroAnimado } from './primitives'

type Filtro = 'todos' | 'sim' | 'nao'
type Aba = 'confirmacoes' | 'presentes'

async function copiar(texto: string, aviso: string) {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success(aviso)
  } catch {
    toast.error('Não foi possível copiar')
  }
}

const quando = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d)
}

export function PainelAnfitrioes() {
  const [logado, setLogado] = useState<boolean | null>(null)
  const [dados, setDados] = useState<DadosPainel | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      setDados(await carregarPainel())
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar. Confira a internet e tente de novo.')
    } finally {
      setCarregando(false)
    }
  }, [])

  // já entrou antes neste aparelho? (o login fica guardado)
  useEffect(() => {
    void painelLogado().then((ok) => {
      setLogado(ok)
      if (ok) void carregar()
    })
  }, [carregar])

  async function entrar(senha: string) {
    setCarregando(true)
    setErro(null)
    try {
      await entrarPainel(senha)
      setLogado(true)
      await carregar()
    } catch (err) {
      console.error(err)
      setErro(err instanceof ErroServidor ? err.message : 'Não foi possível entrar. Confira a internet e tente de novo.')
      setCarregando(false)
    }
  }

  async function sair() {
    await sairPainel()
    setDados(null)
    setLogado(false)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.32em] text-gold-ink uppercase">Painel dos anfitriões</p>
          <h1 className="mt-2 font-serif text-4xl font-medium sm:text-5xl">
            Chá da <span className="font-script text-[1.25em] font-normal text-primary">{CONFIG.bebe}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="#">
              <ArrowLeft /> Ver convite
            </a>
          </Button>
          {dados && (
            <Button variant="soft" onClick={() => void carregar()} disabled={carregando}>
              <RefreshCw className={cn(carregando && 'animate-spin')} /> Atualizar
            </Button>
          )}
          {dados && !MODO_DEMO && (
            <Button variant="ghost" onClick={() => void sair()}>
              <LogOut /> Sair
            </Button>
          )}
        </div>
      </header>

      {MODO_DEMO && (
        <p className="mt-6 rounded-2xl bg-gold-soft px-4 py-3 text-sm text-gold-ink">
          Modo demonstração: este painel mostra só as respostas dadas neste navegador. Configure o{' '}
          <code className="font-semibold">firebase</code> em <code className="font-semibold">src/config.ts</code> para ver as
          respostas de todos.
        </p>
      )}

      {dados ? (
        <Conteudo dados={dados} onMudou={() => void carregar()} />
      ) : logado === false ? (
        <Entrar carregando={carregando} erro={erro} onEntrar={entrar} />
      ) : (
        <div className="mt-16 flex justify-center text-muted-foreground" aria-live="polite">
          {erro ? (
            <p className="rounded-2xl bg-destructive/8 px-4 py-3 text-sm text-destructive">{erro}</p>
          ) : (
            <LoaderCircle className="size-7 animate-spin" aria-label="Carregando" />
          )}
        </div>
      )}
    </main>
  )
}

function Entrar({ carregando, erro, onEntrar }: { carregando: boolean; erro: string | null; onEntrar: (s: string) => Promise<void> }) {
  const [valor, setValor] = useState('')
  function enviar(e: FormEvent) {
    e.preventDefault()
    if (valor.trim()) void onEntrar(valor.trim())
  }
  return (
    <form onSubmit={enviar} className="mx-auto mt-12 max-w-sm rounded-[28px] border border-border/80 bg-card p-6 text-center shadow-card sm:p-8">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-blush-100 text-primary">
        <KeyRound className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-serif text-3xl font-medium">Área dos papais</h2>
      <p className="mt-1 text-[15px] text-muted-foreground">Os dados de contato dos convidados ficam protegidos por senha.</p>
      <label className="mt-6 block text-left">
        <span className="text-sm font-medium">Senha do painel</span>
        <Input
          type="password"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          autoComplete="current-password"
          aria-invalid={!!erro}
          className="mt-2 h-12 rounded-2xl bg-card px-4 text-base md:text-base"
        />
      </label>
      {erro && (
        <p role="alert" className="mt-3 text-left text-sm text-destructive">
          {erro}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-5 w-full" disabled={carregando || !valor.trim()}>
        {carregando ? <LoaderCircle className="animate-spin" /> : <KeyRound />} Entrar
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        A senha está no arquivo <code>.senha-painel.txt</code>, na pasta do projeto.
      </p>
    </form>
  )
}

const NOMES_ITENS = new Map<string, string>([
  ...FRALDAS.map((f) => [f.id, `${f.rotulo} (pacotes)`] as [string, string]),
  ...PRESENTES.map((p) => [p.id, p.nome] as [string, string]),
])

function Conteudo({ dados, onMudou }: { dados: DadosPainel; onMudou: () => void }) {
  const [apagando, setApagando] = useState<string | null>(null)
  const [confirmarApagar, setConfirmarApagar] = useState<string | null>(null)

  async function apagar(chave: string, acao: () => Promise<void>, aviso: string) {
    if (confirmarApagar !== chave) {
      setConfirmarApagar(chave)
      setTimeout(() => setConfirmarApagar((c) => (c === chave ? null : c)), 4000)
      return
    }
    setApagando(chave)
    try {
      await acao()
      toast.success(aviso)
      onMudou()
    } catch (e) {
      console.error(e)
      toast.error('Não foi possível apagar agora')
    } finally {
      setApagando(null)
      setConfirmarApagar(null)
    }
  }

  const [aba, setAba] = useState<Aba>('confirmacoes')
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')

  const { confirmacoes, reservas } = dados
  const resumo = useMemo(() => {
    const sim = confirmacoes.filter((c) => c.status === 'sim')
    return {
      pessoas: sim.reduce((s, c) => s + totalPessoas(c), 0),
      sim: sim.length,
      dependentes: sim.reduce((s, c) => s + c.dependentes.length, 0),
      nao: confirmacoes.length - sim.length,
      presentes: reservas.reduce((s, r) => s + r.qtd, 0),
    }
  }, [confirmacoes, reservas])

  const lista = useMemo(
    () =>
      filtrarPorTexto(
        [...confirmacoes].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)),
        busca,
        (c) => `${c.nome} ${c.sobrenome} ${c.email} ${c.telefone} ${c.dependentes.map((d) => d.nome).join(' ')}`,
      ).filter((c) => filtro === 'todos' || c.status === filtro),
    [confirmacoes, busca, filtro],
  )
  const listaReservas = useMemo(
    () =>
      filtrarPorTexto(
        [...reservas].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
        busca,
        (r) => `${r.nome} ${r.item} ${NOMES_ITENS.get(r.itemId) ?? ''}`,
      ),
    [reservas, busca],
  )

  const cartoes = [
    { rotulo: 'Pessoas confirmadas', valor: resumo.pessoas, extra: resumo.dependentes ? `incluindo ${plural(resumo.dependentes, 'dependente', 'dependentes')}` : undefined },
    { rotulo: 'Respostas “vou”', valor: resumo.sim },
    { rotulo: 'Não poderão ir', valor: resumo.nao },
    { rotulo: 'Presentes reservados', valor: resumo.presentes, extra: plural(reservas.length, 'reserva', 'reservas') },
  ]
  const filtros: [Filtro, string, number][] = [
    ['todos', 'Todas', confirmacoes.length],
    ['sim', 'Vão', resumo.sim],
    ['nao', 'Não vão', resumo.nao],
  ]

  return (
    <>
      <section aria-label="Resumo" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className="rounded-3xl border border-border/80 bg-card p-5 shadow-soft">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">{c.rotulo}</p>
            <p className="mt-2 font-serif text-5xl leading-none font-medium text-primary">
              <NumeroAnimado valor={c.valor} />
            </p>
            {c.extra && <p className="mt-1 text-sm text-muted-foreground">{c.extra}</p>}
          </div>
        ))}
      </section>

      <section aria-label="Link do convite" className="mt-6 rounded-3xl border border-border/80 bg-card p-5 shadow-soft sm:p-6">
        <h2 className="font-medium">Link do convite</h2>
        <p className="mt-1 text-sm text-muted-foreground">Envie para todos: cada pessoa preenche os próprios dados ao confirmar.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <code className="flex min-h-11 flex-1 items-center overflow-x-auto rounded-2xl bg-muted px-4 text-sm whitespace-nowrap">
            {linkConvite()}
          </code>
          <Button variant="outline" onClick={() => void copiar(linkConvite(), 'Link copiado')}>
            <Copy /> Copiar
          </Button>
          <Button asChild>
            <a href={whatsLink(mensagemConvite(linkConvite()))} target="_blank" rel="noopener noreferrer">
              <Send /> Enviar
            </a>
          </Button>
        </div>
      </section>

      <section aria-label="Respostas e presentes" className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Ver" className="flex gap-1 rounded-full bg-muted p-1">
            {(
              [
                ['confirmacoes', 'Confirmações', Users, confirmacoes.length],
                ['presentes', 'Presentes', Gift, reservas.length],
              ] as const
            ).map(([valor, rotulo, Icone, n]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={aba === valor}
                onClick={() => setAba(valor)}
                className={cn(
                  'flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none',
                  aba === valor ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icone className="size-4" aria-hidden="true" />
                {rotulo} <span className="text-muted-foreground tabular-nums">{n}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 sm:w-56">
              <span className="sr-only">Buscar</span>
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar…"
                className="h-11 rounded-full bg-card pl-10 text-base md:text-sm"
              />
            </label>
            <Button variant="outline" onClick={() => baixarCsv(dados)} title="Baixar planilha (CSV)">
              <Download /> CSV
            </Button>
          </div>
        </div>

        {aba === 'confirmacoes' ? (
          <>
            <div role="group" aria-label="Filtrar" className="mt-4 flex gap-1.5">
              {filtros.map(([valor, rotulo, n]) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={filtro === valor}
                  onClick={() => setFiltro(valor)}
                  className={cn(
                    'h-9 cursor-pointer rounded-full px-3.5 text-sm font-medium transition-colors',
                    filtro === valor ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground ring-1 ring-border hover:text-foreground',
                  )}
                >
                  {rotulo} <span className="ml-0.5 opacity-70 tabular-nums">{n}</span>
                </button>
              ))}
            </div>
            <ul className="mt-4 divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft">
              {lista.map((c) => {
                const nomeCompleto = `${c.nome} ${c.sobrenome}`.trim()
                return (
                  <li key={c.id} className="flex gap-3 px-4 py-4">
                    <Avatar nome={nomeCompleto} status={c.status} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-medium">{nomeCompleto}</p>
                        <p className="text-xs text-muted-foreground">{quando(c.atualizadoEm)}</p>
                      </div>
                      <p className={cn('text-sm', c.status === 'sim' ? 'font-medium text-success' : 'text-muted-foreground')}>
                        {c.status === 'sim' ? `Vai · ${plural(totalPessoas(c), 'pessoa', 'pessoas')}` : 'Não poderá ir'}
                      </p>
                      {c.dependentes.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Dependentes">
                          {c.dependentes.map((d, i) => (
                            <li key={i} className="rounded-full bg-blush-50 px-2.5 py-0.5 text-[13px] text-rose-ink ring-1 ring-blush-100">
                              {d.nome}
                              {d.idade && <span className="text-muted-foreground"> · {d.idade}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {c.recado && <p className="mt-2 font-serif text-[17px] text-foreground/80 italic">“{c.recado}”</p>}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {c.telefone && (
                          <Button variant="soft" size="xs" asChild>
                            <a href={`https://wa.me/${whatsDoTelefone(c.telefone)}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle /> {c.telefone}
                            </a>
                          </Button>
                        )}
                        {c.email && (
                          <Button variant="outline" size="xs" asChild>
                            <a href={`mailto:${c.email}`}>
                              <Mail /> {c.email}
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          className="ml-auto hover:text-destructive"
                          disabled={apagando === c.id}
                          onClick={() => void apagar(c.id, () => excluirConfirmacao(c), 'Resposta removida')}
                        >
                          <Trash2 /> {confirmarApagar === c.id ? 'Toque de novo para apagar' : 'Apagar'}
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
              {lista.length === 0 && (
                <li className="px-4 py-10 text-center text-muted-foreground">
                  {confirmacoes.length ? 'Ninguém por aqui.' : 'Ainda não chegou nenhuma resposta.'}
                </li>
              )}
            </ul>
          </>
        ) : (
          <ul className="mt-4 divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft">
            {listaReservas.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-50 font-serif text-lg font-semibold text-primary tabular-nums">
                  {r.qtd}×
                </span>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug font-medium">{NOMES_ITENS.get(r.itemId) ?? r.item}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.nome} · {quando(r.criadoEm)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="shrink-0 hover:text-destructive"
                  disabled={apagando === r.id}
                  onClick={() => void apagar(r.id, () => excluirReserva(r.id), 'Reserva cancelada — o item voltou para a lista')}
                >
                  <Trash2 /> {confirmarApagar === r.id ? 'Confirmar' : 'Cancelar'}
                </Button>
              </li>
            ))}
            {listaReservas.length === 0 && (
              <li className="px-4 py-10 text-center text-muted-foreground">
                {reservas.length ? 'Nada encontrado.' : 'Nenhum presente reservado ainda.'}
              </li>
            )}
          </ul>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Os dados ficam guardados no Firebase (projeto “bonjour-marianne-cha”). Baixe o CSV para abrir no Excel ou no Google Planilhas.
        </p>
      </section>
    </>
  )
}

function baixarCsv({ confirmacoes, reservas }: DadosPainel) {
  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const L: string[] = []
  L.push(q('CONFIRMAÇÕES'))
  L.push(['Nome', 'Sobrenome', 'Telefone', 'E-mail', 'Resposta', 'Total de pessoas', 'Dependentes', 'Recado', 'Atualizado em'].map(q).join(';'))
  for (const c of confirmacoes) {
    L.push(
      [
        c.nome,
        c.sobrenome,
        c.telefone,
        c.email,
        c.status === 'sim' ? 'Vou' : 'Não vou',
        totalPessoas(c),
        c.dependentes.map((d) => (d.idade ? `${d.nome} (${d.idade})` : d.nome)).join('; '),
        c.recado,
        quando(c.atualizadoEm),
      ]
        .map(q)
        .join(';'),
    )
  }
  L.push('')
  L.push(q('PRESENTES'))
  L.push(['Item', 'Quantidade', 'Nome', 'Reservado em'].map(q).join(';'))
  for (const r of reservas) L.push([NOMES_ITENS.get(r.itemId) ?? r.item, r.qtd, r.nome, quando(r.criadoEm)].map(q).join(';'))

  const url = URL.createObjectURL(new Blob(['﻿' + L.join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `cha-de-bebe-${CONFIG.bebe.toLowerCase()}.csv`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
