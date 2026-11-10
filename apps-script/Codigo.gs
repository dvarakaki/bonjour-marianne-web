/**
 * Backend do convite — Google Apps Script ligado a uma Planilha Google.
 * Cada resposta vira (ou atualiza) uma linha na aba "Confirmações".
 *
 * Como publicar: veja LEIAME.md na raiz do projeto.
 */
const ABA = 'Confirmações';
const CABECALHO = ['ID', 'Nome', 'Resposta', 'Pessoas', 'Recado', 'Atualizado em'];

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(CABECALHO);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, CABECALHO.length).setFontWeight('bold').setBackground('#fcecee');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Lista as respostas (só status e nº de pessoas — os recados ficam privados na planilha). */
function doGet() {
  const linhas = aba_().getDataRange().getValues().slice(1);
  const respostas = {};
  linhas.forEach(function (l) {
    if (!l[0]) return;
    respostas[l[0]] = { status: l[2] === 'Vou' ? 'sim' : 'nao', pessoas: Number(l[3]) || 0 };
  });
  return json_({ ok: true, respostas: respostas });
}

/** Grava ou atualiza a resposta de um convidado. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents || '{}');
    const id = String(d.id || '').slice(0, 120);
    const status = d.status === 'sim' ? 'sim' : d.status === 'nao' ? 'nao' : '';
    if (!id || !status) return json_({ ok: false, erro: 'Dados inválidos' });

    const linha = [
      id,
      String(d.nome || '').slice(0, 120),
      status === 'sim' ? 'Vou' : 'Não vou',
      status === 'sim' ? Math.max(1, Math.min(20, Number(d.pessoas) || 1)) : 0,
      String(d.recado || '').slice(0, 300),
      new Date(),
    ];

    const sh = aba_();
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(function (r) { return r[0]; });
    const i = ids.indexOf(id);
    if (i > 0) {
      // Mantém o recado anterior se a pessoa não escreveu um novo
      if (!linha[4]) linha[4] = sh.getRange(i + 1, 5).getValue();
      sh.getRange(i + 1, 1, 1, linha.length).setValues([linha]);
    } else {
      sh.appendRow(linha);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}
