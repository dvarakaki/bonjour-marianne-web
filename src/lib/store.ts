import { CONFIG } from '@/config'

export type Status = 'sim' | 'nao'

export type Dependente = { nome: string; idade: string }

export type Confirmacao = {
  /** gerado no aparelho de quem responde; reenviar com o mesmo id atualiza a resposta */
  id: string
  nome: string
  sobrenome: string
  telefone: string
  email: string
  status: Status
  dependentes: Dependente[]
  recado: string
}

export type Reserva = {
  id: string
  itemId: string
  item: string
  qtd: number
  nome: string
  /** quantidade sugerida do item (0 = livre), para o servidor não deixar passar do limite */
  limite: number
}

/** O que qualquer visitante pode ver: só números, nada de dados pessoais */
export type Publico = {
  /** pessoas confirmadas (contando dependentes) */
  pessoas: number
  /** respostas "vou" */
  confirmacoes: number
  /** unidades reservadas por item */
  reservas: Record<string, number>
}

export type ConfirmacaoSalva = Confirmacao & { atualizadoEm: string }
export type ReservaSalva = Omit<Reserva, 'limite'> & { criadoEm: string }
export type DadosPainel = { confirmacoes: ConfirmacaoSalva[]; reservas: ReservaSalva[] }

/** Sem URL do Apps Script, tudo fica só no navegador (para testar). */
export const MODO_DEMO = !CONFIG.appsScriptUrl

export const totalPessoas = (c: Pick<Confirmacao, 'status' | 'dependentes'>) =>
  c.status === 'sim' ? 1 + c.dependentes.length : 0

/* ---------------- armazenamento local ---------------- */

const CHAVE_DEMO = 'cha-marianne:demo'
const CHAVE_MINHA = 'cha-marianne:minha-confirmacao'
const CHAVE_MINHAS_RESERVAS = 'cha-marianne:minhas-reservas'

function ler<T>(chave: string, padrao: T, area: Storage | null = safeLocal()): T {
  try {
    const v = area?.getItem(chave)
    return v ? (JSON.parse(v) as T) : padrao
  } catch {
    return padrao
  }
}

function gravar(chave: string, valor: unknown, area: Storage | null = safeLocal()) {
  try {
    area?.setItem(chave, JSON.stringify(valor))
  } catch {
    /* navegação privada: segue sem salvar */
  }
}

function safeLocal() {
  try {
    return localStorage
  } catch {
    return null
  }
}

const lerDemo = () => ler<DadosPainel>(CHAVE_DEMO, { confirmacoes: [], reservas: [] })

export const lerMinhaConfirmacao = () => ler<Confirmacao | null>(CHAVE_MINHA, null)
export const gravarMinhaConfirmacao = (c: Confirmacao) => gravar(CHAVE_MINHA, c)

/** Reservas feitas neste aparelho: itemId → quantidade */
export const lerMinhasReservas = () => ler<Record<string, number>>(CHAVE_MINHAS_RESERVAS, {})
export function gravarMinhaReserva(itemId: string, qtd: number) {
  const atuais = lerMinhasReservas()
  atuais[itemId] = (atuais[itemId] ?? 0) + qtd
  gravar(CHAVE_MINHAS_RESERVAS, atuais)
  return atuais
}

function resumir(d: DadosPainel): Publico {
  const reservas: Record<string, number> = {}
  for (const r of d.reservas) reservas[r.itemId] = (reservas[r.itemId] ?? 0) + r.qtd
  const sim = d.confirmacoes.filter((c) => c.status === 'sim')
  return { pessoas: sim.reduce((s, c) => s + totalPessoas(c), 0), confirmacoes: sim.length, reservas }
}

/* ---------------- servidor (Google Apps Script) ---------------- */

async function comLimite<T>(tarefa: (sinal: AbortSignal) => Promise<T>, ms: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await tarefa(ctrl.signal)
  } finally {
    clearTimeout(t)
  }
}

type RespostaServidor = { ok: boolean; erro?: string }

async function postar<T extends RespostaServidor>(corpo: object): Promise<T> {
  return comLimite(async (signal) => {
    // text/plain evita o "preflight" de CORS que o Apps Script não responde
    const r = await fetch(CONFIG.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(corpo),
      signal,
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = (await r.json()) as T
    if (!j.ok) throw new ErroServidor(j.erro || 'Falha no servidor')
    return j
  }, 20000)
}

export class ErroServidor extends Error {}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function carregarPublico(): Promise<Publico> {
  if (MODO_DEMO) return resumir(lerDemo())
  return comLimite(async (signal) => {
    const r = await fetch(`${CONFIG.appsScriptUrl}?t=${Date.now()}`, { signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = (await r.json()) as RespostaServidor & Partial<Publico>
    if (!j.ok) throw new Error(j.erro || 'Falha ao carregar')
    return { pessoas: j.pessoas ?? 0, confirmacoes: j.confirmacoes ?? 0, reservas: j.reservas ?? {} }
  }, 15000)
}

export async function salvarConfirmacao(c: Confirmacao): Promise<void> {
  if (MODO_DEMO) {
    await espera(700)
    const d = lerDemo()
    const salva = { ...c, atualizadoEm: new Date().toISOString() }
    const i = d.confirmacoes.findIndex((x) => x.id === c.id)
    if (i >= 0) d.confirmacoes[i] = salva
    else d.confirmacoes.push(salva)
    gravar(CHAVE_DEMO, d)
    return
  }
  await postar({ acao: 'confirmar', ...c })
}

export async function salvarReserva(r: Reserva): Promise<void> {
  if (MODO_DEMO) {
    await espera(600)
    const d = lerDemo()
    const ja = d.reservas.filter((x) => x.itemId === r.itemId).reduce((s, x) => s + x.qtd, 0)
    if (r.limite > 0 && ja + r.qtd > r.limite) throw new ErroServidor('Alguém acabou de reservar este item.')
    const { limite: _, ...resto } = r
    d.reservas.push({ ...resto, criadoEm: new Date().toISOString() })
    gravar(CHAVE_DEMO, d)
    return
  }
  await postar({ acao: 'reservar', ...r })
}

export async function carregarPainel(senha: string): Promise<DadosPainel> {
  if (MODO_DEMO) {
    await espera(300)
    return lerDemo()
  }
  const j = await postar<RespostaServidor & DadosPainel>({ acao: 'painel', senha })
  return { confirmacoes: j.confirmacoes ?? [], reservas: j.reservas ?? [] }
}

/* senha do painel: fica só nesta aba */
const CHAVE_SENHA = 'cha-marianne:senha-painel'
export const lerSenhaPainel = () => ler<string>(CHAVE_SENHA, '', safeSession())
export const gravarSenhaPainel = (s: string) => gravar(CHAVE_SENHA, s, safeSession())

function safeSession() {
  try {
    return sessionStorage
  } catch {
    return null
  }
}
