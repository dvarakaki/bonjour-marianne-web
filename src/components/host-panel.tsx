import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Copy, MessageCircle, RefreshCw, Search, Send } from 'lucide-react'
import { toast } from 'sonner'
import { CONFIG } from '@/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRespostas } from '@/hooks/use-respostas'
import { linkConvite, linkPessoal, mensagemConvite, whatsLink } from '@/lib/evento'
import { CONVIDADOS, filtrar, primeiroNome, TOTAL_PESSOAS } from '@/lib/guests'
import { MODO_DEMO } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Avatar, NumeroAnimado } from './primitives'

type Filtro = 'todos' | 'pendentes' | 'sim' | 'nao'

async function copiar(texto: string, aviso: string) {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success(aviso)
  } catch {
    toast.error('Não foi possível copiar')
  }
}

export function PainelAnfitrioes() {
  const { respostas, resumo, estado, recarregar } = useRespostas()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lista = useMemo(
    () =>
      filtrar(CONVIDADOS, busca).filter((c) => {
        const s = respostas[c.id]?.status
        if (filtro === 'pendentes') return !s
        if (filtro === 'sim') return s === 'sim'
        if (filtro === 'nao') return s === 'nao'
        return true
      }),
    [busca, filtro, respostas],
  )

  const cartoes = [
    { rotulo: 'Pessoas confirmadas', valor: resumo.pessoas, extra: `de até ${TOTAL_PESSOAS}` },
    { rotulo: 'Convites confirmados', valor: resumo.sim },
    { rotulo: 'Não poderão ir', valor: resumo.nao },
    { rotulo: 'Aguardando', valor: resumo.pendentes },
  ]
  const filtros: [Filtro, string, number][] = [
    ['todos', 'Todos', CONVIDADOS.length],
    ['pendentes', 'Aguardando', resumo.pendentes],
    ['sim', 'Confirmados', resumo.sim],
    ['nao', 'Não vão', resumo.nao],
  ]

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.32em] text-gold-ink uppercase">Painel dos anfitriões</p>
          <h1 className="mt-2 font-serif text-4xl font-medium sm:text-5xl">
            Chá da <span className="font-script text-[1.25em] font-normal text-primary">{CONFIG.bebe}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="#">
              <ArrowLeft /> Ver convite
            </a>
          </Button>
          <Button variant="soft" onClick={() => void recarregar()}>
            <RefreshCw className={cn(estado === 'carregando' && 'animate-spin')} /> Atualizar
          </Button>
        </div>
      </header>

      {MODO_DEMO && (
        <p className="mt-6 rounded-2xl bg-gold-soft px-4 py-3 text-sm text-gold-ink">
          Modo demonstração: este painel mostra só as respostas dadas neste navegador. Configure o{' '}
          <code className="font-semibold">appsScriptUrl</code> para ver as respostas de todos.
        </p>
      )}

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
        <h2 className="font-medium">Link geral do convite</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Serve para todos. Os links pessoais abaixo já abrem o convite com o nome do convidado.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <code className="flex min-h-11 flex-1 items-center overflow-x-auto rounded-2xl bg-muted px-4 text-sm whitespace-nowrap">
            {linkConvite()}
          </code>
          <Button variant="outline" onClick={() => void copiar(linkConvite(), 'Link copiado')}>
            <Copy /> Copiar
          </Button>
          <Button asChild>
            <a href={whatsLink(mensagemConvite(null, linkConvite()))} target="_blank" rel="noopener noreferrer">
              <Send /> Enviar
            </a>
          </Button>
        </div>
      </section>

      <section aria-label="Convidados" className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Filtrar" className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1">
            {filtros.map(([valor, rotulo, n]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={cn(
                  'h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors',
                  filtro === valor ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {rotulo} <span className="ml-1 text-muted-foreground tabular-nums">{n}</span>
              </button>
            ))}
          </div>
          <label className="relative sm:w-64">
            <span className="sr-only">Buscar convidado</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar…"
              className="h-11 rounded-full bg-card pl-10 text-base md:text-sm"
            />
          </label>
        </div>

        <ul className="mt-4 divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-soft">
          {lista.map((c) => {
            const r = respostas[c.id]
            const link = linkPessoal(c.id)
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                <Avatar convidado={c} status={r?.status} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {r?.status === 'sim'
                      ? `Confirmado · ${r.pessoas} ${r.pessoas === 1 ? 'pessoa' : 'pessoas'}`
                      : r?.status === 'nao'
                        ? 'Não poderá ir'
                        : c.pessoas > 1
                          ? `Aguardando · convite para ${c.pessoas}`
                          : 'Aguardando resposta'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Copiar link pessoal de ${c.nome}`}
                    title="Copiar link pessoal"
                    onClick={() => void copiar(link, `Link de ${primeiroNome(c.nome)} copiado`)}
                  >
                    <Copy />
                  </Button>
                  <Button variant="soft" size="sm" asChild>
                    <a
                      href={whatsLink(mensagemConvite(primeiroNome(c.nome), link), c.telefone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Enviar convite para ${c.nome} pelo WhatsApp`}
                    >
                      <MessageCircle /> WhatsApp
                    </a>
                  </Button>
                </div>
              </li>
            )
          })}
          {lista.length === 0 && <li className="px-4 py-10 text-center text-muted-foreground">Ninguém por aqui.</li>}
        </ul>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Os recadinhos ficam guardados na planilha do Google (aba “Confirmações”).
        </p>
      </section>
    </main>
  )
}
