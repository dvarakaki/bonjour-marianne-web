export const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export const slug = (s: string) =>
  normalizar(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const CONECTIVOS = new Set(['e', 'de', 'da', 'do', 'das', 'dos'])

export function iniciais(nome: string) {
  const partes = nome.split(/\s+/).filter((p) => p && !CONECTIVOS.has(normalizar(p)))
  if (!partes.length) return '?'
  const primeira = partes[0].charAt(0)
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : ''
  return (primeira + ultima).toUpperCase()
}

export function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

/** Mantém só os dígitos */
export const digitos = (s: string) => s.replace(/\D/g, '')

/** "11987654321" → "(11) 98765-4321" (formata enquanto a pessoa digita) */
export function formatarTelefone(valor: string) {
  const d = digitos(valor).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const telefoneValido = (valor: string) => {
  const n = digitos(valor).length
  return n === 10 || n === 11
}

export const emailValido = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim())

/** Número para wa.me: acrescenta o DDI 55 quando vier só DDD + número */
export function whatsDoTelefone(valor: string) {
  const d = digitos(valor)
  return d.length <= 11 ? `55${d}` : d
}

export function filtrarPorTexto<T>(lista: T[], termo: string, texto: (item: T) => string) {
  const termos = normalizar(termo).split(/\s+/).filter(Boolean)
  if (!termos.length) return lista
  return lista.filter((item) => {
    const alvo = normalizar(texto(item))
    return termos.every((t) => alvo.includes(t))
  })
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

export function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
