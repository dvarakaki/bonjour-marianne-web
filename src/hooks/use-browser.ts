import { useEffect, useState, useSyncExternalStore } from 'react'

export function useMediaQuery(consulta: string) {
  return useSyncExternalStore(
    (avisar) => {
      const m = matchMedia(consulta)
      m.addEventListener('change', avisar)
      return () => m.removeEventListener('change', avisar)
    },
    () => matchMedia(consulta).matches,
    () => false,
  )
}

export function useHash() {
  return useSyncExternalStore(
    (avisar) => {
      addEventListener('hashchange', avisar)
      return () => removeEventListener('hashchange', avisar)
    },
    () => location.hash,
    () => '',
  )
}

export type Fase = 'antes' | 'agora' | 'passou'

export function useContagem(inicio: Date, fim: Date) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = inicio.getTime() - agora
  if (diff <= 0) {
    const fase: Fase = agora < fim.getTime() ? 'agora' : 'passou'
    return { fase, dias: 0, horas: 0, minutos: 0, segundos: 0 }
  }
  const s = Math.floor(diff / 1000)
  return {
    fase: 'antes' as Fase,
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    minutos: Math.floor((s % 3600) / 60),
    segundos: s % 60,
  }
}
