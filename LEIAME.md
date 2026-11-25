# Chá de Bebê da Marianne — convite, confirmação e lista de presentes

Site do chá de bebê (tema “Jardim Encantado”, com os ursinhos e as artes do convite): o convidado abre um envelope animado, vê o convite (com contagem
regressiva e mapa), confirma a presença preenchendo nome, sobrenome, telefone, e-mail e
acompanhantes, e pode reservar um item da lista de presentes para ninguém repetir.

**Stack:** Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui + Motion.
As respostas e reservas vão para um banco **Firebase (Firestore)**, no plano gratuito.

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
fraldas por tamanho e os itens do enxoval com categoria, quantidade (`qtd: 0` = livre), link da loja e
preço (`preco`, coletado nas lojas em nov/2026; `aprox: true` = valor estimado, mostrado com “≈”).
Os filtros por faixa de preço e a ordenação usam esse valor.
Não mude o `id` de um item depois que o site estiver no ar — as reservas são guardadas por ele.

## 3. Banco de dados (Firebase)

As confirmações e as reservas ficam no **Firestore**, no projeto Firebase **`bonjour-marianne-cha`**
(plano gratuito Spark, servidor em São Paulo). A configuração pública está em `firebase` no `src/config.ts`.

| Coleção | Quem lê | O que guarda |
| --- | --- | --- |
| `presencas` | todos | só status e nº de pessoas (alimenta "X pessoas já confirmaram") |
| `reservas` | todos | item e quantidade (alimenta "Faltam X de Y") |
| `confirmacoes` | só o painel | nome, sobrenome, telefone, e-mail, dependentes (acompanhantes), recado |
| `reservasNomes` | só o painel | quem vai dar cada presente |

As regras de segurança estão em **`firestore.rules`**. Mudou alguma coisa nelas? Publique com:

```bash
firebase deploy --only firestore
```

O **painel** (`seu-site/#painel`) entra com a conta `painel@cha-da-marianne.app`; a senha está no arquivo
**`.senha-painel.txt`** (fica só no seu computador, fora do Git). Ali dá para ver tudo, apagar respostas de
teste, cancelar reservas e baixar um CSV.

Para testar sem banco, troque `firebase` por `null` no `src/config.ts` (modo demonstração: tudo fica no navegador).

## 4. Enviar os convites e acompanhar

- **Link do convite:** é um só para todos — cada pessoa preenche os próprios dados.
- **Painel dos anfitriões:** abra `seu-site/#painel` e entre com a senha do `.senha-painel.txt`. Ali você vê
  pessoas confirmadas (com acompanhantes), quem não vai, contatos (WhatsApp/e-mail com um toque),
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
    rsvp-section.tsx        formulário de confirmação (dados + acompanhantes)
    gifts-section.tsx       lista de presentes com categorias, busca e reserva
    modal.tsx               janela (desktop) / gaveta (celular)
    host-panel.tsx          painel dos anfitriões (com senha)
    ornaments.tsx           ilustrações SVG (laço, ramos, lacre)
    jardim.tsx              artes do jardim (guirlanda, ursinhos, borboletas)
    ui/                     componentes shadcn/ui
  data/presentes.ts         ← lista de presentes
  lib/                      textos/telefone, datas/agenda, banco (store.ts, firebase.ts)
firestore.rules             regras de segurança do banco (Firebase)
```

Acessibilidade: respeita "reduzir movimento" do sistema, foco visível, alvos de toque ≥ 44px,
leitores de tela (rótulos, regiões ao vivo).
