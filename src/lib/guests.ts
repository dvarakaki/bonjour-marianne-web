import { CONFIG } from '@/config'

export type Convidado = {
  id: string
  nome: string
  pessoas: number
  telefone?: string
  /** nome normalizado, para busca sem acentos */
  busca: string
  iniciais: string
  /** letra do grupo alfabético */
  letra: string
  /** índice da cor do avatar */
  tom: number
}

export const TONS_AVATAR = 5

export const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export const slug = (s: string) =>
  normalizar(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const CONECTIVOS = new Set(['e', 'de', 'da', 'do', 'das', 'dos'])
const TRATAMENTOS = new Set(['familia', 'tia', 'tio', 'vovo', 'vo', 'dona', 'seu', 'dr.', 'dra.', 'madrinha', 'padrinho'])

export function iniciais(nome: string) {
  const partes = nome.split(/\s+/).filter((p) => p && !CONECTIVOS.has(normalizar(p)))
  if (!partes.length) return '?'
  const primeira = partes[0].charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return (primeira + ultima).toUpperCase()
}

/** "Ana Paula Ribeiro" → "Ana"; "Bruno e Larissa Mendes" → "Bruno e Larissa"; "Tia Cida" → "Tia Cida" */
export function primeiroNome(nome: string) {
  const p = nome.trim().split(/\s+/)
  if (p.length >= 3 && normalizar(p[1]) === 'e') return p.slice(0, 3).join(' ')
  if (p.length >= 2 && TRATAMENTOS.has(normalizar(p[0]))) return p.slice(0, 2).join(' ')
  return p[0]
}

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export const CONVIDADOS: Convidado[] = (() => {
  const vistos = new Map<string, number>()
  return CONFIG.convidados
    .filter((c) => c.nome.trim())
    .map((c) => {
      let id = slug(c.nome) || 'convidado'
      const n = (vistos.get(id) ?? 0) + 1
      vistos.set(id, n)
      if (n > 1) id = `${id}-${n}`
      const busca = normalizar(c.nome)
      return {
        id,
        nome: c.nome.trim(),
        pessoas: Math.max(1, Math.floor(c.pessoas ?? 1)),
        telefone: c.telefone,
        busca,
        iniciais: iniciais(c.nome),
        letra: busca.charAt(0).toUpperCase(),
        tom: hash(id) % TONS_AVATAR,
      }
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})()

export const TOTAL_PESSOAS = CONVIDADOS.reduce((s, c) => s + c.pessoas, 0)

export const porId = (id: string | null | undefined) =>
  id ? CONVIDADOS.find((c) => c.id === id) : undefined

export function filtrar(lista: Convidado[], termo: string) {
  const termos = normalizar(termo).split(/\s+/).filter(Boolean)
  if (!termos.length) return lista
  return lista.filter((c) => termos.every((t) => c.busca.includes(t)))
}

export function agrupar(lista: Convidado[]) {
  const grupos = new Map<string, Convidado[]>()
  for (const c of lista) {
    const g = grupos.get(c.letra)
    if (g) g.push(c)
    else grupos.set(c.letra, [c])
  }
  return [...grupos.entries()]
}
