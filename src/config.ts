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
  appsScriptUrl: string
}

export const CONFIG: Config = {
  bebe: 'Marianne',
  saudacao: 'Bonjour,',
  anfitrioes: 'Mamãe & Papai',
  mensagem:
    'Uma pequena parisiense está a caminho! Venha celebrar com a gente a chegada da nossa princesinha.',

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

  // URL do Google Apps Script (veja LEIAME.md).
  // Vazio = modo demonstração: respostas e reservas ficam salvas só no navegador de quem respondeu.
  appsScriptUrl: '',
}
