/**
 * Backend do convite — Google Apps Script ligado a uma Planilha Google.
 *
 *  - Aba "Confirmações": uma linha por pessoa que respondeu (nome, contato, dependentes…)
 *  - Aba "Presentes":    uma linha por presente reservado pela lista
 *
 * O site público só recebe NÚMEROS (pessoas confirmadas e itens reservados).
 * Nomes, telefones e e-mails ficam na planilha e no painel dos anfitriões,
 * que pede a senha definida em Configurações do projeto → Propriedades do script → SENHA_PAINEL.
 *
 * Como publicar: veja LEIAME.md na raiz do projeto.
 */
const ABA_CONF = 'Confirmações';
const CAB_CONF = ['ID', 'Nome', 'Sobrenome', 'Telefone', 'E-mail', 'Resposta', 'Dependentes', 'Total de pessoas', 'Recado', 'Atualizado em'];
const ABA_PRES = 'Presentes';
const CAB_PRES = ['ID', 'Código do item', 'Item', 'Quantidade', 'Nome', 'Reservado em'];

function aba_(nome, cabecalho) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.appendRow(cabecalho);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cabecalho.length).setFontWeight('bold').setBackground('#fcecee');
  }
  return sh;
}

function linhas_(sh) {
  return sh.getDataRange().getValues().slice(1).filter(function (l) { return l[0]; });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

const txt_ = function (v, max) { return String(v == null ? '' : v).trim().slice(0, max); };

/* -------- Dependentes: guardados como "Ana (5); João" -------- */
function dependentesParaTexto_(lista) {
  return (Array.isArray(lista) ? lista : []).slice(0, 15)
    .map(function (d) {
      const nome = txt_(d && d.nome, 80).replace(/[;()]/g, ' ');
      const idade = txt_(d && d.idade, 10).replace(/[;()]/g, ' ');
      return nome ? (idade ? nome + ' (' + idade + ')' : nome) : '';
    })
    .filter(String)
    .join('; ');
}

function textoParaDependentes_(texto) {
  return String(texto || '').split(';').map(function (p) {
    p = p.trim();
    const m = p.match(/^(.*?)\s*\(([^)]*)\)$/);
    return m ? { nome: m[1].trim(), idade: m[2].trim() } : { nome: p, idade: '' };
  }).filter(function (d) { return d.nome; });
}

/* -------- Público: só totais -------- */
function resumo_() {
  let pessoas = 0, confirmacoes = 0;
  linhas_(aba_(ABA_CONF, CAB_CONF)).forEach(function (l) {
    if (l[5] !== 'Vou') return;
    confirmacoes++;
    pessoas += Number(l[7]) || 1;
  });
  const reservas = {};
  linhas_(aba_(ABA_PRES, CAB_PRES)).forEach(function (l) {
    reservas[l[1]] = (reservas[l[1]] || 0) + (Number(l[3]) || 0);
  });
  return { pessoas: pessoas, confirmacoes: confirmacoes, reservas: reservas };
}

function doGet() {
  const r = resumo_();
  r.ok = true;
  return json_(r);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (d.acao === 'reservar') return json_(reservar_(d));
    if (d.acao === 'painel') return json_(painel_(d));
    return json_(confirmar_(d));
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Grava ou atualiza (mesmo ID) a resposta de uma pessoa. */
function confirmar_(d) {
  const id = txt_(d.id, 60);
  const status = d.status === 'sim' ? 'sim' : d.status === 'nao' ? 'nao' : '';
  const nome = txt_(d.nome, 80);
  if (!id || !status || !nome) return { ok: false, erro: 'Dados inválidos' };

  const dependentes = status === 'sim' ? dependentesParaTexto_(d.dependentes) : '';
  const qtdDep = dependentes ? dependentes.split(';').length : 0;
  const linha = [
    id,
    nome,
    txt_(d.sobrenome, 80),
    // apóstrofo: impede o Planilhas de transformar o telefone em número
    "'" + txt_(d.telefone, 30),
    txt_(d.email, 120),
    status === 'sim' ? 'Vou' : 'Não vou',
    dependentes,
    status === 'sim' ? 1 + qtdDep : 0,
    txt_(d.recado, 300),
    new Date(),
  ];

  const sh = aba_(ABA_CONF, CAB_CONF);
  const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(function (r) { return r[0]; });
  const i = ids.indexOf(id);
  if (i > 0) {
    // mantém o recado anterior se a pessoa não escreveu um novo
    if (!linha[8]) linha[8] = sh.getRange(i + 1, 9).getValue();
    sh.getRange(i + 1, 1, 1, linha.length).setValues([linha]);
  } else {
    sh.appendRow(linha);
  }
  return { ok: true };
}

/** Registra um presente reservado, sem passar da quantidade sugerida. */
function reservar_(d) {
  const itemId = txt_(d.itemId, 80);
  const qtd = Math.max(1, Math.min(50, Math.floor(Number(d.qtd) || 1)));
  const nome = txt_(d.nome, 120);
  const limite = Math.max(0, Math.floor(Number(d.limite) || 0));
  if (!itemId || !nome) return { ok: false, erro: 'Dados inválidos' };

  const sh = aba_(ABA_PRES, CAB_PRES);
  if (limite > 0) {
    const ja = linhas_(sh).reduce(function (s, l) { return l[1] === itemId ? s + (Number(l[3]) || 0) : s; }, 0);
    if (ja + qtd > limite) {
      return { ok: false, erro: ja >= limite ? 'Este item já foi todo reservado.' : 'Só restam ' + (limite - ja) + ' unidade(s) deste item.' };
    }
  }
  sh.appendRow([txt_(d.id, 60) || Utilities.getUuid(), itemId, txt_(d.item, 200), qtd, nome, new Date()]);
  return { ok: true };
}

/** Dados completos para o painel dos anfitriões (pede senha). */
function painel_(d) {
  const senha = PropertiesService.getScriptProperties().getProperty('SENHA_PAINEL');
  if (!senha) return { ok: false, erro: 'Defina a propriedade SENHA_PAINEL no Apps Script.' };
  if (String(d.senha || '') !== senha) return { ok: false, erro: 'Senha incorreta.' };

  const data_ = function (v) { return v instanceof Date ? v.toISOString() : String(v || ''); };
  const confirmacoes = linhas_(aba_(ABA_CONF, CAB_CONF)).map(function (l) {
    return {
      id: String(l[0]),
      nome: String(l[1]),
      sobrenome: String(l[2]),
      telefone: String(l[3]).replace(/^'/, ''),
      email: String(l[4]),
      status: l[5] === 'Vou' ? 'sim' : 'nao',
      dependentes: textoParaDependentes_(l[6]),
      recado: String(l[8]),
      atualizadoEm: data_(l[9]),
    };
  });
  const reservas = linhas_(aba_(ABA_PRES, CAB_PRES)).map(function (l) {
    return { id: String(l[0]), itemId: String(l[1]), item: String(l[2]), qtd: Number(l[3]) || 0, nome: String(l[4]), criadoEm: data_(l[5]) };
  });
  return { ok: true, confirmacoes: confirmacoes, reservas: reservas };
}
