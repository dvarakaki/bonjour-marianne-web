import { CONFIG } from '@/config'

/**
 * O SDK do Firebase é carregado sob demanda (fica num pedaço separado do site),
 * para o convite abrir rápido mesmo em internet fraca.
 */
let app: Promise<import('firebase/app').FirebaseApp> | null = null

function iniciarApp() {
  if (!CONFIG.firebase) throw new Error('Firebase não configurado')
  const cfg = CONFIG.firebase
  app ??= import('firebase/app').then(({ initializeApp, getApps }) => getApps()[0] ?? initializeApp(cfg))
  return app
}

let db: Promise<import('firebase/firestore').Firestore> | null = null
export function banco() {
  db ??= Promise.all([iniciarApp(), import('firebase/firestore')]).then(([a, f]) => f.getFirestore(a))
  return db
}

let auth: Promise<import('firebase/auth').Auth> | null = null
export function autenticacao() {
  auth ??= Promise.all([iniciarApp(), import('firebase/auth')]).then(([a, f]) => f.getAuth(a))
  return auth
}

/** Conta única do painel dos anfitriões (a senha fica só com eles) */
export const EMAIL_PAINEL = 'painel@cha-da-marianne.app'
