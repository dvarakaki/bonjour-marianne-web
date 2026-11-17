/* =====================================================================
   CONFIGURAÇÃO DO CHÁ DE BEBÊ
   Edite só este arquivo para trocar textos, data e local.
   A lista de presentes fica em src/data/presentes.ts.
   ===================================================================== */

export type Config = {
  bebe: string
  saudacao: string
  anfitrioes: string
  mensagem: string
  inicio: string
  fim: string
  fusoHorario: string
  local: { nome: string; endereco: string; mapsUrl?: string }
  presente: { texto: string }
  confirmarAte: string
  whatsapp: string
  /** Banco de dados (Firebase). null = modo demonstração, tudo fica só no navegador */
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  } | null
}

export const CONFIG: Config = {
  bebe: 'Marianne',
  saudacao: 'Bem-vindos ao jardim da',
  anfitrioes: 'Papai & Mamãe',
  mensagem:
    'Nosso jardim está florescendo e queremos celebrar, com muito amor, a chegada da nossa pequena!',

  // Data e hora com fuso (−03:00 = horário de Brasília)
  inicio: '2026-12-06T16:00:00-03:00',
  fim: '2026-12-06T20:00:00-03:00',
  fusoHorario: 'America/Sao_Paulo',

  local: {
    nome: 'Salão de Festas',
    endereco: 'Rua Adele, 95',
    // Link do Google Maps (opcional). Vazio = busca automática pelo endereço.
    mapsUrl: '',
  },

  presente: {
    texto: 'Fraldinhas são sempre bem-vindas! Se quiser mimar a Marianne com algo a mais, preparamos uma lista de sugestões.',
  },

  // Prazo para responder (AAAA-MM-DD). Vazio = não mostra prazo.
  confirmarAte: '2026-12-01',

  // WhatsApp dos anfitriões (só dígitos, com DDI + DDD) para dúvidas. Vazio = esconde.
  whatsapp: '5511963062840',

  // Banco de dados das confirmações e reservas (projeto Firebase "bonjour-marianne-cha").
  // Estes valores são públicos por natureza; quem protege os dados são as regras em firestore.rules.
  // Troque por null para voltar ao modo demonstração.
  firebase: {
    apiKey: 'AIzaSyD5uyyyhR5EcQFdEw7OP96dfL3JWBmHPz0',
    authDomain: 'bonjour-marianne-cha.firebaseapp.com',
    projectId: 'bonjour-marianne-cha',
    storageBucket: 'bonjour-marianne-cha.firebasestorage.app',
    messagingSenderId: '665907140136',
    appId: '1:665907140136:web:a58a55bad60f9abc3f471d',
  },
}
