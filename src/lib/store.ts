import { CONFIG } from '@/config'
import { autenticacao, banco, EMAIL_PAINEL } from '@/lib/firebase'
import { novoId } from '@/lib/texto'

export type Status = 'sim' | 'nao'

export type Dependente = { nome: string; idade: string }

export type Confirmacao = {
  /** id privado (dados pessoais); reenviar com o mesmo id atualiza a resposta */
  id: string
  /** id público (só status e nº de pessoas) — diferente do privado de propósito */
  publico: string
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
  /** quantidade sugerida do item (0 = livre), para não passar do limite */
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

/** Sem Firebase configurado, tudo fica só no navegador (para testar). */
export const MODO_DEMO = !CONFIG.firebase

export const totalPessoas = (c: Pick<Confirmacao, 'status' | 'dependentes'>) =>
  c.status === 'sim' ? 1 + c.dependentes.length : 0

export class ErroServidor extends Error {}

/* ---------------- armazenamento local ---------------- */

const CHAVE_DEMO = 'cha-marianne:demo'
const CHAVE_MINHA = 'cha-marianne:minha-confirmacao'
const CHAVE_MINHAS_RESERVAS = 'cha-marianne:minhas-reservas'

function safeLocal() {
  try {
    return localStorage
  } catch {
    return null
  }
}

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = safeLocal()?.getItem(chave)
    return v ? (JSON.parse(v) as T) : padrao
  } catch {
    return padrao
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    safeLocal()?.setItem(chave, JSON.stringify(valor))
  } catch {
    /* navegação privada: segue sem salvar */
  }
}

const lerDemo = () => ler<DadosPainel>(CHAVE_DEMO, { confirmacoes: [], reservas: [] })

export function lerMinhaConfirmacao() {
  const c = ler<Confirmacao | null>(CHAVE_MINHA, null)
  // respostas salvas antes do id público existir
  return c && !c.publico ? { ...c, publico: novoId() } : c
}
export const gravarMinhaConfirmacao = (c: Confirmacao) => gravar(CHAVE_MINHA, c)

/** Reservas feitas neste aparelho: itemId → quantidade */
export const lerMinhasReservas = () => ler<Record<string, number>>(CHAVE_MINHAS_RESERVAS, {})
export function gravarMinhaReserva(itemId: string, qtd: number) {
  const atuais = lerMinhasReservas()
  atuais[itemId] = (atuais[itemId] ?? 0) + qtd
  gravar(CHAVE_MINHAS_RESERVAS, atuais)
  return atuais
}

function resumirDemo(d: DadosPainel): Publico {
  const reservas: Record<string, number> = {}
  for (const r of d.reservas) reservas[r.itemId] = (reservas[r.itemId] ?? 0) + r.qtd
  const sim = d.confirmacoes.filter((c) => c.status === 'sim')
  return { pessoas: sim.reduce((s, c) => s + totalPessoas(c), 0), confirmacoes: sim.length, reservas }
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Converte Timestamp do Firestore (ou nada, enquanto o servidor não confirmou) em ISO */
function iso(v: unknown) {
  const t = v as { toDate?: () => Date } | null
  return t?.toDate ? t.toDate().toISOString() : new Date().toISOString()
}

/* ---------------- público, em tempo real ---------------- */

/**
 * Acompanha os números públicos (pessoas confirmadas e itens reservados).
 * No Firebase a atualização é ao vivo: quando alguém confirma, todo mundo vê na hora.
 * Devolve a função para parar de acompanhar.
 */
export function observarPublico(aoMudar: (p: Publico) => void, aoErrar: (e: unknown) => void): () => void {
  if (MODO_DEMO) {
    aoMudar(resumirDemo(lerDemo()))
    return () => {}
  }
  let parado = false
  const paradas: (() => void)[] = []
  let presencas: { status: Status; pessoas: number }[] | null = null
  let reservas: { itemId: string; qtd: number }[] | null = null

  const emitir = () => {
    if (!presencas || !reservas) return
    const sim = presencas.filter((p) => p.status === 'sim')
    const porItem: Record<string, number> = {}
    for (const r of reservas) porItem[r.itemId] = (porItem[r.itemId] ?? 0) + r.qtd
    aoMudar({ pessoas: sim.reduce((s, p) => s + (p.pessoas || 0), 0), confirmacoes: sim.length, reservas: porItem })
  }

  void (async () => {
    try {
      const [db, { collection, onSnapshot }] = await Promise.all([banco(), import('firebase/firestore')])
      if (parado) return
      paradas.push(
        onSnapshot(
          collection(db, 'presencas'),
          (s) => {
            presencas = s.docs.map((d) => d.data() as { status: Status; pessoas: number })
            emitir()
          },
          aoErrar,
        ),
        onSnapshot(
          collection(db, 'reservas'),
          (s) => {
            reservas = s.docs.map((d) => d.data() as { itemId: string; qtd: number })
            emitir()
          },
          aoErrar,
        ),
      )
    } catch (e) {
      aoErrar(e)
    }
  })()

  return () => {
    parado = true
    paradas.forEach((f) => f())
  }
}

/* ---------------- gravações dos convidados ---------------- */

async function comLimite<T>(tarefa: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>
  const limite = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error('Tempo esgotado')), ms)
  })
  try {
    return await Promise.race([tarefa, limite])
  } finally {
    clearTimeout(t!)
  }
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
  const [db, { doc, writeBatch, serverTimestamp }] = await Promise.all([banco(), import('firebase/firestore')])
  const lote = writeBatch(db)
  lote.set(doc(db, 'presencas', c.publico), {
    status: c.status,
    pessoas: totalPessoas(c),
    atualizadoEm: serverTimestamp(),
  })
  lote.set(doc(db, 'confirmacoes', c.id), {
    publico: c.publico,
    nome: c.nome,
    sobrenome: c.sobrenome,
    telefone: c.telefone,
    email: c.email,
    status: c.status,
    dependentes: c.dependentes.map((x) => ({ nome: x.nome, idade: x.idade })),
    recado: c.recado,
    atualizadoEm: serverTimestamp(),
  })
  await comLimite(lote.commit(), 20000)
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
  const [db, { collection, doc, getDocs, query, where, writeBatch, serverTimestamp }] = await Promise.all([
    banco(),
    import('firebase/firestore'),
  ])
  // confere no servidor quanto já foi reservado, para não passar do que a família pediu
  if (r.limite > 0) {
    const s = await comLimite(getDocs(query(collection(db, 'reservas'), where('itemId', '==', r.itemId))), 15000)
    const ja = s.docs.reduce((t, d) => t + ((d.data().qtd as number) || 0), 0)
    if (ja >= r.limite) throw new ErroServidor('Este item já foi todo reservado. Que tal outro da lista?')
    if (ja + r.qtd > r.limite) throw new ErroServidor(`Só restam ${r.limite - ja} unidade(s) deste item.`)
  }
  const lote = writeBatch(db)
  lote.set(doc(db, 'reservas', r.id), { itemId: r.itemId, qtd: r.qtd, criadoEm: serverTimestamp() })
  lote.set(doc(db, 'reservasNomes', r.id), {
    itemId: r.itemId,
    item: r.item.slice(0, 200),
    qtd: r.qtd,
    nome: r.nome.slice(0, 120),
    criadoEm: serverTimestamp(),
  })
  await comLimite(lote.commit(), 20000)
}

/* ---------------- painel dos anfitriões ---------------- */

/** true se o painel já está logado neste aparelho */
export async function painelLogado(): Promise<boolean> {
  if (MODO_DEMO) return true
  const auth = await autenticacao()
  await auth.authStateReady()
  return auth.currentUser?.email === EMAIL_PAINEL
}

export async function entrarPainel(senha: string): Promise<void> {
  if (MODO_DEMO) return
  const [auth, { signInWithEmailAndPassword }] = await Promise.all([autenticacao(), import('firebase/auth')])
  try {
    await signInWithEmailAndPassword(auth, EMAIL_PAINEL, senha)
  } catch (e) {
    const codigo = (e as { code?: string }).code ?? ''
    if (/invalid-credential|wrong-password|user-not-found|invalid-password/.test(codigo)) throw new ErroServidor('Senha incorreta.')
    if (/too-many-requests/.test(codigo)) throw new ErroServidor('Muitas tentativas. Espere alguns minutos e tente de novo.')
    throw e
  }
}

export async function sairPainel(): Promise<void> {
  if (MODO_DEMO) return
  const [auth, { signOut }] = await Promise.all([autenticacao(), import('firebase/auth')])
  await signOut(auth)
}

export async function carregarPainel(): Promise<DadosPainel> {
  if (MODO_DEMO) {
    await espera(300)
    return lerDemo()
  }
  const [db, { collection, getDocs }] = await Promise.all([banco(), import('firebase/firestore')])
  const [conf, res] = await Promise.all([getDocs(collection(db, 'confirmacoes')), getDocs(collection(db, 'reservasNomes'))])
  return {
    confirmacoes: conf.docs.map((d) => {
      const x = d.data()
      return {
        id: d.id,
        publico: x.publico,
        nome: x.nome,
        sobrenome: x.sobrenome,
        telefone: x.telefone,
        email: x.email,
        status: x.status,
        dependentes: x.dependentes ?? [],
        recado: x.recado ?? '',
        atualizadoEm: iso(x.atualizadoEm),
      }
    }),
    reservas: res.docs.map((d) => {
      const x = d.data()
      return { id: d.id, itemId: x.itemId, item: x.item, qtd: x.qtd, nome: x.nome, criadoEm: iso(x.criadoEm) }
    }),
  }
}

/** Cancela uma reserva (libera o item na lista) */
export async function excluirReserva(id: string): Promise<void> {
  if (MODO_DEMO) {
    const d = lerDemo()
    d.reservas = d.reservas.filter((r) => r.id !== id)
    gravar(CHAVE_DEMO, d)
    return
  }
  const [db, { doc, writeBatch }] = await Promise.all([banco(), import('firebase/firestore')])
  const lote = writeBatch(db)
  lote.delete(doc(db, 'reservas', id))
  lote.delete(doc(db, 'reservasNomes', id))
  await lote.commit()
}

/** Remove uma resposta (ex.: teste ou duplicada) */
export async function excluirConfirmacao(c: Pick<Confirmacao, 'id' | 'publico'>): Promise<void> {
  if (MODO_DEMO) {
    const d = lerDemo()
    d.confirmacoes = d.confirmacoes.filter((x) => x.id !== c.id)
    gravar(CHAVE_DEMO, d)
    return
  }
  const [db, { doc, writeBatch }] = await Promise.all([banco(), import('firebase/firestore')])
  const lote = writeBatch(db)
  lote.delete(doc(db, 'confirmacoes', c.id))
  if (c.publico) lote.delete(doc(db, 'presencas', c.publico))
  await lote.commit()
}
