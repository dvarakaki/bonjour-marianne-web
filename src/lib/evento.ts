import { CONFIG } from '@/config'
import { slug } from '@/lib/guests'

export const INICIO = new Date(CONFIG.inicio)
export const FIM = new Date(CONFIG.fim)

const tz = CONFIG.fusoHorario
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: tz, ...o })
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function hora(d: Date) {
  const partes = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d)
  const h = Number(partes.find((p) => p.type === 'hour')?.value ?? 0)
  const m = partes.find((p) => p.type === 'minute')?.value ?? '00'
  return m === '00' ? `${h}h` : `${h}h${m}`
}

export const DIA_SEMANA = cap(fmt({ weekday: 'long' }).format(INICIO).replace('-feira', ''))
export const DIA_SEMANA_COMPLETO = cap(fmt({ weekday: 'long' }).format(INICIO))
export const DIA = fmt({ day: 'numeric' }).format(INICIO)
export const MES = cap(fmt({ month: 'long' }).format(INICIO))
export const ANO = fmt({ year: 'numeric' }).format(INICIO)
export const HORA_INICIO = hora(INICIO)
export const HORARIO = `das ${hora(INICIO)} às ${hora(FIM)}`
export const DATA_EXTENSO = `${DIA_SEMANA_COMPLETO}, ${DIA} de ${MES.toLowerCase()}`
export const DATA_CURTA = fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }).format(INICIO).replaceAll('/', '.')

export const PRAZO = (() => {
  if (!CONFIG.confirmarAte) return ''
  const d = new Date(`${CONFIG.confirmarAte}T12:00:00Z`)
  const dia = d.getUTCDate()
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(d)
  return `${dia === 1 ? '1º' : dia} de ${mes}`
})()

const enc = encodeURIComponent
const TITULO = `Chá de bebê da ${CONFIG.bebe}`
const LOCAL = `${CONFIG.local.nome} — ${CONFIG.local.endereco}`

export const MAPS_URL =
  CONFIG.local.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${enc(CONFIG.local.endereco)}`
export const WAZE_URL = `https://waze.com/ul?q=${enc(CONFIG.local.endereco)}&navigate=yes`
export const MAPS_EMBED = `https://maps.google.com/maps?q=${enc(CONFIG.local.endereco)}&z=15&output=embed`

/** Link base do convite (sem parâmetros) */
export const linkConvite = () => `${location.origin}${location.pathname}`
export const linkPessoal = (id: string) => `${linkConvite()}?para=${id}`

export const whatsLink = (texto: string, telefone?: string) =>
  `https://wa.me/${telefone ?? ''}?text=${enc(texto)}`

/* ---------------- Agenda ---------------- */
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function detalhes() {
  return `${CONFIG.mensagem}\n\nSugestão de mimo: ${CONFIG.presente.texto}\n\nConvite: ${linkConvite()}`
}

export function googleAgendaUrl() {
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${enc(TITULO)}` +
    `&dates=${utc(INICIO)}/${utc(FIM)}` +
    `&details=${enc(detalhes())}` +
    `&location=${enc(LOCAL)}`
  )
}

const escIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

export function baixarIcs() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bonjour Marianne//Convite//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${slug(TITULO)}-${utc(INICIO)}@convite`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(INICIO)}`,
    `DTEND:${utc(FIM)}`,
    `SUMMARY:${escIcs(TITULO)}`,
    `DESCRIPTION:${escIcs(detalhes())}`,
    `LOCATION:${escIcs(LOCAL)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escIcs(`Amanhã: ${TITULO}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(TITULO)}.ics`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function mensagemConvite(nome: string | null, link: string) {
  const saudacao = nome ? `Olá, ${nome}! 💕` : 'Olá! 💕'
  return [
    saudacao,
    `Com muito carinho, convidamos você para o chá de bebê da ${CONFIG.bebe}.`,
    '',
    `🗓️ ${DATA_EXTENSO} · ${HORARIO}`,
    `📍 ${CONFIG.local.nome}`,
    '',
    `Abra o convite e confirme sua presença: ${link}`,
  ].join('\n')
}
