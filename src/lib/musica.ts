/* =====================================================================
   Música de fundo: toca o arquivo de áudio colocado em src/assets/musica/
   (mp3, m4a, ogg ou wav). Sem arquivo, não há música nem botão.
   Use só um arquivo com licença para uso (veja src/assets/musica/LEIAME.md).
   ===================================================================== */

const ARQUIVOS = import.meta.glob<string>('../assets/musica/*.{mp3,m4a,ogg,wav}', {
  eager: true,
  import: 'default',
  query: '?url',
})
const ARQUIVO = Object.values(ARQUIVOS)[0] as string | undefined

/** Há uma música configurada? */
export const TEM_MUSICA = !!ARQUIVO

const VOLUME = 0.5
const CHAVE = 'cha-marianne:musica-v2'

let audio: HTMLAudioElement | null = null
let tocando = false
let fade = 0
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((f) => f())

function gravar(v: 'on' | 'off') {
  try {
    localStorage.setItem(CHAVE, v)
  } catch {
    /* ignora */
  }
}

/** Sobe ou desce o volume suavemente (no iPhone o volume é fixo; aí só toca/pausa) */
function rampa(alvo: number, ms: number, depois?: () => void) {
  if (!audio) return
  clearInterval(fade)
  const a = audio
  const inicio = a.volume
  const t0 = performance.now()
  fade = window.setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / ms)
    a.volume = Math.max(0, Math.min(1, inicio + (alvo - inicio) * p))
    if (p >= 1) {
      clearInterval(fade)
      depois?.()
    }
  }, 40)
}

function aoMudarVisibilidade() {
  if (!audio || !tocando) return
  if (document.hidden) audio.pause()
  else void audio.play().catch(() => {})
}

/** Chamar dentro de um clique/toque (o navegador só libera áudio assim) */
export function tocar() {
  if (!ARQUIVO || tocando) return
  if (!audio) {
    audio = new Audio(ARQUIVO)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
  }
  tocando = true
  gravar('on')
  avisar()
  audio.play().then(
    () => rampa(VOLUME, 1800),
    () => {
      // navegador bloqueou (sem toque do usuário): volta ao estado parado
      tocando = false
      avisar()
    },
  )
}

export function pausar() {
  if (!audio || !tocando) return
  tocando = false
  gravar('off')
  avisar()
  const a = audio
  rampa(0, 500, () => {
    if (!tocando) a.pause()
  })
}

export const alternar = () => (tocando ? pausar() : tocar())
export const estaTocando = () => tocando

/** A pessoa desligou a música antes? (então não começa sozinha) */
export function musicaDesligada() {
  try {
    return localStorage.getItem(CHAVE) === 'off'
  } catch {
    return false
  }
}

export function assinar(f: () => void) {
  ouvintes.add(f)
  return () => {
    ouvintes.delete(f)
  }
}
