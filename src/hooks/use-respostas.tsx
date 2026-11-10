import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CONVIDADOS } from '@/lib/guests'
import { carregarRespostas, salvarResposta, type NovaResposta, type Respostas } from '@/lib/store'

type Estado = 'carregando' | 'pronto' | 'erro'

type Valor = {
  respostas: Respostas
  estado: Estado
  recarregar: () => Promise<void>
  salvar: (p: NovaResposta) => Promise<void>
  resumo: { pessoas: number; sim: number; nao: number; pendentes: number }
}

const Contexto = createContext<Valor | null>(null)

export function RespostasProvider({ children }: { children: ReactNode }) {
  const [respostas, setRespostas] = useState<Respostas>({})
  const [estado, setEstado] = useState<Estado>('carregando')

  const recarregar = useCallback(async () => {
    try {
      const r = await carregarRespostas()
      setRespostas(r)
      setEstado('pronto')
    } catch (err) {
      console.error(err)
      setEstado((e) => (e === 'pronto' ? 'pronto' : 'erro'))
    }
  }, [])

  useEffect(() => {
    void recarregar()
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') void recarregar()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => document.removeEventListener('visibilitychange', aoVoltar)
  }, [recarregar])

  const salvar = useCallback(async (p: NovaResposta) => {
    await salvarResposta(p)
    setRespostas((r) => ({ ...r, [p.id]: { status: p.status, pessoas: p.pessoas } }))
  }, [])

  const resumo = useMemo(() => {
    let pessoas = 0
    let sim = 0
    let nao = 0
    for (const c of CONVIDADOS) {
      const r = respostas[c.id]
      if (!r) continue
      if (r.status === 'sim') {
        sim++
        pessoas += r.pessoas || 1
      } else nao++
    }
    return { pessoas, sim, nao, pendentes: CONVIDADOS.length - sim - nao }
  }, [respostas])

  const valor = useMemo(
    () => ({ respostas, estado, recarregar, salvar, resumo }),
    [respostas, estado, recarregar, salvar, resumo],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useRespostas() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useRespostas precisa estar dentro de <RespostasProvider>')
  return v
}
