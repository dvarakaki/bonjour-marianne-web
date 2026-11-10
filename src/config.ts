/* =====================================================================
   CONFIGURAÇÃO DO CHÁ DE BEBÊ
   Edite só este arquivo para trocar textos, data, local e convidados.
   ===================================================================== */

export type ConvidadoConfig = {
  /** Nome exatamente como deve aparecer na lista */
  nome: string
  /** Quantas pessoas o convite cobre (padrão: 1) */
  pessoas?: number
  /** WhatsApp do convidado, só dígitos com DDI + DDD (opcional — usado no painel) */
  telefone?: string
}

export type Config = {
  bebe: string
  saudacao: string
  anfitrioes: string
  mensagem: string
  inicio: string
  fim: string
  fusoHorario: string
  local: { nome: string; endereco: string; mapsUrl?: string }
  presente: { texto: string; itens: string[] }
  confirmarAte: string
  whatsapp: string
  appsScriptUrl: string
  convidados: ConvidadoConfig[]
}

export const CONFIG: Config = {
  bebe: 'Marianne',
  saudacao: 'Bonjour,',
  anfitrioes: 'Mamãe & Papai',
  mensagem:
    'Uma pequena parisiense está a caminho! Venha celebrar com a gente a chegada da nossa princesinha.',

  // Data e hora com fuso (−03:00 = horário de Brasília)
  inicio: '2026-12-13T15:00:00-03:00',
  fim: '2026-12-13T19:00:00-03:00',
  fusoHorario: 'America/Sao_Paulo',

  local: {
    nome: 'Salão de Festas Jardim',
    endereco: 'Rua das Flores, 123 — Bairro, Cidade',
    // Link do Google Maps (opcional). Vazio = busca automática pelo endereço.
    mapsUrl: '',
  },

  presente: {
    texto: 'Que tal uma fralda P ou M acompanhada de um mimo para a Marianne?',
    itens: ['Fralda P', 'Fralda M', 'Um mimo com carinho'],
  },

  // Prazo para responder (AAAA-MM-DD). Vazio = não mostra prazo.
  confirmarAte: '2026-12-01',

  // WhatsApp dos anfitriões (só dígitos, com DDI + DDD) para quem não achar o nome. Vazio = esconde.
  whatsapp: '5511999999999',

  // URL do Google Apps Script (veja LEIAME.md).
  // Vazio = modo demonstração: as respostas ficam salvas só no navegador de quem respondeu.
  appsScriptUrl: '',

  // Lista de convidados. "pessoas" = quantas pessoas o convite cobre.
  convidados: [
    { nome: 'Ana Paula Ribeiro' },
    { nome: 'Beatriz Castro', pessoas: 2 },
    { nome: 'Bruno e Larissa Mendes', pessoas: 2 },
    { nome: 'Camila Nogueira' },
    { nome: 'Carolina Albuquerque', pessoas: 3 },
    { nome: 'Daniela Freitas' },
    { nome: 'Família Oliveira', pessoas: 4 },
    { nome: 'Fernanda Lima' },
    { nome: 'Gabriela Souza', pessoas: 2 },
    { nome: 'Helena Martins' },
    { nome: 'Isabela Rocha' },
    { nome: 'Júlia Carvalho', pessoas: 2 },
    { nome: 'Letícia Araújo' },
    { nome: 'Mariana Teixeira' },
    { nome: 'Patrícia e João Pereira', pessoas: 3 },
    { nome: 'Renata Duarte' },
    { nome: 'Tia Cida' },
    { nome: 'Vovó Lúcia e Vovô Antônio', pessoas: 2 },
  ],
}
