import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  gravarMinhaConfirmacao,
  gravarMinhaReserva,
  lerMinhaConfirmacao,
  lerMinhasReservas,
  MODO_DEMO,
  observarPublico,
  salvarConfirmacao,
  salvarReserva,
  type Confirmacao,
  type Publico,
  type Reserva,
} from '@/lib/store'

type Estado = 'carregando' | 'pronto' | 'erro'

type Valor = {
  publico: Publico
  estado: Estado
  recarregar: () => void
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
  // muda para reabrir a escuta (botão "tentar de novo" e modo demonstração)
  const [rodada, setRodada] = useState(0)

  useEffect(() => {
    return observarPublico(
      (p) => {
        setPublico(p)
        setEstado('pronto')
      },
      (err) => {
        console.error(err)
        setEstado((e) => (e === 'pronto' ? 'pronto' : 'erro'))
      },
    )
  }, [rodada])

  const recarregar = useCallback(() => setRodada((r) => r + 1), [])

  const confirmar = useCallback(
    async (c: Confirmacao) => {
      await salvarConfirmacao(c)
      gravarMinhaConfirmacao(c)
      setMinha(c)
      // no Firebase os números chegam sozinhos (tempo real); na demonstração, relê
      if (MODO_DEMO) recarregar()
    },
    [recarregar],
  )

  const reservar = useCallback(
    async (r: Reserva) => {
      await salvarReserva(r)
      setMinhasReservas(gravarMinhaReserva(r.itemId, r.qtd))
      if (MODO_DEMO) recarregar()
    },
    [recarregar],
  )

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
