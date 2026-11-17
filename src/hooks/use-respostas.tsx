import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  carregarPublico,
  gravarMinhaConfirmacao,
  gravarMinhaReserva,
  lerMinhaConfirmacao,
  lerMinhasReservas,
  salvarConfirmacao,
  salvarReserva,
  totalPessoas,
  type Confirmacao,
  type Publico,
  type Reserva,
} from '@/lib/store'

type Estado = 'carregando' | 'pronto' | 'erro'

type Valor = {
  publico: Publico
  estado: Estado
  recarregar: () => Promise<void>
  /** resposta dada neste aparelho (para editar depois) */
  minha: Confirmacao | null
  confirmar: (c: Confirmacao) => Promise<void>
  /** reservas feitas neste aparelho: itemId → quantidade */
  minhasReservas: Record<string, number>
  reservar: (r: Reserva) => Promise<void>
}

const VAZIO: Publico = { pessoas: 0, confirmacoes: 0, reservas: {} }
const Contexto = createContext<Valor | null>(null)

export function RespostasProvider({ children }: { children: ReactNode }) {
  const [publico, setPublico] = useState<Publico>(VAZIO)
  const [estado, setEstado] = useState<Estado>('carregando')
  const [minha, setMinha] = useState<Confirmacao | null>(lerMinhaConfirmacao)
  const [minhasReservas, setMinhasReservas] = useState(lerMinhasReservas)

  const recarregar = useCallback(async () => {
    try {
      setPublico(await carregarPublico())
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

  const confirmar = useCallback(
    async (c: Confirmacao) => {
      await salvarConfirmacao(c)
      // atualiza o contador na hora, sem esperar o servidor
      setPublico((p) => {
        const antes = minha?.id === c.id ? minha : null
        const delta = totalPessoas(c) - (antes ? totalPessoas(antes) : 0)
        const deltaConf = (c.status === 'sim' ? 1 : 0) - (antes?.status === 'sim' ? 1 : 0)
        return { ...p, pessoas: Math.max(0, p.pessoas + delta), confirmacoes: Math.max(0, p.confirmacoes + deltaConf) }
      })
      gravarMinhaConfirmacao(c)
      setMinha(c)
    },
    [minha],
  )

  const reservar = useCallback(async (r: Reserva) => {
    try {
      await salvarReserva(r)
    } catch (err) {
      void recarregar() // o item pode ter acabado: mostra o número certo
      throw err
    }
    setPublico((p) => ({ ...p, reservas: { ...p.reservas, [r.itemId]: (p.reservas[r.itemId] ?? 0) + r.qtd } }))
    setMinhasReservas(gravarMinhaReserva(r.itemId, r.qtd))
  }, [recarregar])

  const valor = useMemo(
    () => ({ publico, estado, recarregar, minha, confirmar, minhasReservas, reservar }),
    [publico, estado, recarregar, minha, confirmar, minhasReservas, reservar],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useRespostas() {
  const v = useContext(Contexto)
  if (!v) throw new Error('useRespostas precisa estar dentro de <RespostasProvider>')
  return v
}
