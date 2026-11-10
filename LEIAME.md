# Bonjour, Marianne — convite e confirmação de presença

Site do chá de bebê: o convidado abre um envelope animado, vê o convite (com contagem
regressiva, mapa e sugestão de mimo), procura o próprio nome na lista e confirma.

**Stack:** Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui + Motion.
As respostas vão para uma **Planilha Google** (grátis, via Apps Script).

---

## 1. Rodar no computador

```bash
npm install
npm run dev
```

Abra <http://localhost:8642>.

## 2. Personalizar

Tudo fica em **`src/config.ts`**:

| Campo | O que é |
| --- | --- |
| `anfitrioes`, `mensagem` | Quem convida e o texto do convite |
| `inicio`, `fim` | Data/hora com fuso (`-03:00` = Brasília) |
| `local` | Nome, endereço e (opcional) link do Google Maps |
| `presente` | Sugestão de mimo e as "etiquetas" (ex.: Fralda P, Fralda M) |
| `confirmarAte` | Prazo para responder (`AAAA-MM-DD`) |
| `whatsapp` | Seu WhatsApp, para quem não achar o nome |
| `convidados` | Um item por convite. Use `pessoas: 3` para casal/família |

> O identificador de cada convidado vem do nome (ex.: `ana-paula-ribeiro`). Se você mudar o nome
> de alguém que já respondeu, a resposta antiga deixa de aparecer no site (continua na planilha).

## 3. Receber as confirmações (Google Planilhas)

Sem esta etapa o site funciona em **modo demonstração** (cada resposta fica só no navegador de quem respondeu).

1. Crie uma planilha em <https://sheets.new>.
2. **Extensões → Apps Script**. Apague o conteúdo, cole o arquivo `apps-script/Codigo.gs` e salve.
3. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize e copie a **URL do app da Web** (termina em `/exec`).
5. Cole em `appsScriptUrl` no `src/config.ts`.

As respostas aparecem na aba **Confirmações**: nome, resposta, nº de pessoas, recadinho e data.
O site mostra publicamente só quem confirmou; os **recadinhos ficam visíveis apenas na planilha**.

> Mudou o `Codigo.gs` depois? **Implantar → Gerenciar implantações → Editar → Nova versão** (mantém a mesma URL).

## 4. Enviar os convites

- **Painel dos anfitriões:** abra `seu-site/#painel`. Ali você vê o resumo (confirmados, pendentes…),
  copia o **link pessoal** de cada convidado e envia direto pelo **WhatsApp** com uma mensagem pronta.
- **Link pessoal** (`?para=ana-paula-ribeiro`): o envelope já cumprimenta a pessoa pelo nome
  e o botão principal abre a resposta dela direto.
- **Link geral:** serve para todos; cada um procura o próprio nome na lista.
- Dica: `seu-site/#confirmar` pula o envelope e vai direto para a lista.
- Quer mandar o WhatsApp direto para o número da pessoa? Adicione `telefone: '5511988887777'` no convidado.

## 5. Publicar

```bash
npm run build
```

Isso gera a pasta **`dist/`**, que é o site pronto. A forma mais rápida de publicar:

- **Netlify Drop:** abra <https://app.netlify.com/drop> e arraste a pasta `dist/`.

Também funciona em Vercel, Cloudflare Pages ou GitHub Pages (os caminhos são relativos).

**Prévia do link no WhatsApp:** depois de publicar, coloque a URL do site em `VITE_SITE_URL`
no arquivo `.env` (ex.: `VITE_SITE_URL=https://cha-da-marianne.netlify.app`) e rode `npm run build`
de novo. Assim a imagem `public/og.jpg` aparece quando o link for compartilhado.

## Estrutura

```
src/
  config.ts                 ← edite aqui
  App.tsx                   rotas (convite / #painel) e estado da página
  components/
    envelope-intro.tsx      envelope animado de abertura
    hero.tsx                convite, data e contagem regressiva
    details.tsx             quando / onde (mapa) / sugestão de mimo
    rsvp-section.tsx        resumo, busca e lista de convidados
    rsvp-sheet.tsx          gaveta (celular) / janela (desktop) de resposta
    host-panel.tsx          painel dos anfitriões
    ornaments.tsx           ilustrações SVG (laço, Torre Eiffel, ramos, lacre)
    ui/                     componentes shadcn/ui
  lib/                      convidados, datas/agenda, armazenamento
apps-script/Codigo.gs       backend da planilha
```

Acessibilidade: respeita "reduzir movimento" do sistema, foco visível, alvos de toque ≥ 44px,
leitores de tela (rótulos, regiões ao vivo).
