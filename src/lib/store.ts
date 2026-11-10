import { CONFIG } from '@/config'

export type Status = 'sim' | 'nao'
export type Resposta = { status: Status; pessoas: number }
export type Respostas = Record<string, Resposta>
export type NovaResposta = {
  id: string
  nome: string
  status: Status
  pessoas: number
  recado: string
}

/** Sem URL do Apps Script, as respostas ficam só no navegador (para testar). */
export const MODO_DEMO = !CONFIG.appsScriptUrl

const CHAVE_LOCAL = 'cha-marianne:respostas'

function lerLocal(): Respostas {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LOCAL) || '{}') as Respostas
  } catch {
    return {}
  }
}

function gravarLocal(r: Respostas) {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(r))
  } catch {
    /* navegação privada: segue sem salvar */
  }
}

async function comLimite<T>(tarefa: (sinal: AbortSignal) => Promise<T>, ms: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await tarefa(ctrl.signal)
  } finally {
    clearTimeout(t)
  }
}

export async function carregarRespostas(): Promise<Respostas> {
  if (MODO_DEMO) return lerLocal()
  return comLimite(async (signal) => {
    const r = await fetch(`${CONFIG.appsScriptUrl}?t=${Date.now()}`, { signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = (await r.json()) as { ok: boolean; erro?: string; respostas?: Respostas }
    if (!j.ok) throw new Error(j.erro || 'Falha ao carregar')
    return j.respostas ?? {}
  }, 15000)
}

export async function salvarResposta(p: NovaResposta): Promise<void> {
  if (MODO_DEMO) {
    await new Promise((r) => setTimeout(r, 700))
    const atuais = lerLocal()
    atuais[p.id] = { status: p.status, pessoas: p.pessoas }
    gravarLocal(atuais)
    return
  }
  await comLimite(async (signal) => {
    // text/plain evita o "preflight" de CORS que o Apps Script não responde
    const r = await fetch(CONFIG.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(p),
      signal,
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = (await r.json()) as { ok: boolean; erro?: string }
    if (!j.ok) throw new Error(j.erro || 'Falha ao salvar')
  }, 20000)
}

/* Quem respondeu neste aparelho (para destacar "você" na lista) */
const CHAVE_EU = 'cha-marianne:eu'
export function lerEu() {
  try {
    return localStorage.getItem(CHAVE_EU)
  } catch {
    return null
  }
}
export function gravarEu(id: string) {
  try {
    localStorage.setItem(CHAVE_EU, id)
  } catch {
    /* ignora */
  }
}
