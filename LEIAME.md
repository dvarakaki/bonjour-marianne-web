# Bonjour, Marianne — convite e confirmação de presença

Site do chá de bebê: o convidado abre um envelope animado, vê o convite (com contagem
regressiva e mapa), confirma a presença preenchendo nome, sobrenome, telefone, e-mail e
dependentes, e pode reservar um item da lista de presentes para ninguém repetir.

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
| `presente` | Texto curto do cartão "Sugestão de mimo" |
| `confirmarAte` | Prazo para responder (`AAAA-MM-DD`) |
| `whatsapp` | Seu WhatsApp, para dúvidas dos convidados |

A **lista de presentes** fica em **`src/data/presentes.ts`** (importada do site antigo):
fraldas por tamanho e os itens do enxoval com categoria, quantidade (`qtd: 0` = livre) e link da loja.
Não mude o `id` de um item depois que o site estiver no ar — as reservas são guardadas por ele.

## 3. Receber as confirmações e reservas (Google Planilhas)

Sem esta etapa o site funciona em **modo demonstração** (respostas e reservas ficam só no navegador de quem respondeu).

1. Crie uma planilha em <https://sheets.new>.
2. **Extensões → Apps Script**. Apague o conteúdo, cole o arquivo `apps-script/Codigo.gs` e salve.
3. **Implantar → Nova implantação → App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize e copie a **URL do app da Web** (termina em `/exec`).
5. Cole em `appsScriptUrl` no `src/config.ts`.
6. Defina a senha do painel: **Configurações do projeto (⚙️) → Propriedades do script →
   Adicionar** `SENHA_PAINEL` = a senha que quiser.

A planilha ganha duas abas:

- **Confirmações** — nome, sobrenome, telefone, e-mail, resposta, dependentes, total de pessoas, recado e data.
  Se a pessoa editar a resposta no mesmo aparelho, a linha é atualizada (não duplica).
- **Presentes** — item, quantidade, quem vai dar e quando. Para cancelar uma reserva, apague a linha.

O site público recebe **só números** (pessoas confirmadas e quantos de cada presente já foram reservados).
Nomes, telefones e e-mails ficam na planilha e no painel, que pede a senha.

> Mudou o `Codigo.gs` depois? **Implantar → Gerenciar implantações → Editar → Nova versão** (mantém a mesma URL).

## 4. Enviar os convites e acompanhar

- **Link do convite:** é um só para todos — cada pessoa preenche os próprios dados.
- **Painel dos anfitriões:** abra `seu-site/#painel` e entre com a `SENHA_PAINEL`. Ali você vê
  pessoas confirmadas (com dependentes), quem não vai, contatos (WhatsApp/e-mail com um toque),
  recados, presentes reservados e baixa tudo em CSV.
- Dicas: `seu-site/#confirmar` pula o envelope e vai direto para o formulário;
  `seu-site/#presentes` abre direto na lista de presentes.

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
    rsvp-section.tsx        formulário de confirmação (dados + dependentes)
    gifts-section.tsx       lista de presentes com categorias, busca e reserva
    modal.tsx               janela (desktop) / gaveta (celular)
    host-panel.tsx          painel dos anfitriões (com senha)
    ornaments.tsx           ilustrações SVG (laço, Torre Eiffel, ramos, lacre)
    ui/                     componentes shadcn/ui
  data/presentes.ts         ← lista de presentes
  lib/                      textos/telefone, datas/agenda, armazenamento
apps-script/Codigo.gs       backend da planilha
```

Acessibilidade: respeita "reduzir movimento" do sistema, foco visível, alvos de toque ≥ 44px,
leitores de tela (rótulos, regiões ao vivo).
