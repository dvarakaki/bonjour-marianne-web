/* =====================================================================
   LISTA DE PRESENTES SUGERIDOS
   Importada do site "Chá de Bebê da Marianne". Edite à vontade:
   - qtd: quantas unidades a família gostaria (0 = quantidade livre)
   - link: loja de referência (opcional)
   - preco: valor unitário em R$ (coletado nas lojas em 16/11/2026); aprox: true = estimado
   - o ícone de cada item é escolhido pelo nome (src/components/gift-icon.tsx)
   - id: não mude depois que o site estiver no ar (as reservas usam o id)
   ===================================================================== */

export const TEXTO_PRESENTES =
  'O maior presente é ter você pertinho da gente nesse momento tão especial! Os itens abaixo são apenas sugestões, sem nenhuma obrigação. Se, além das fraldinhas, você quiser mimar nossa pequena com algum presentinho, esta lista pode ajudar na escolha. Tudo foi pensado com muito carinho!'

export const NOTA_FRALDAS = 'Para o tamanho RN, estamos usando Pampers Premium Care ou Huggies Natural Care.'

export const CATEGORIAS = [
  'Roupas',
  'Acessórios',
  'Fraldas e troca',
  'Banho',
  'Higiene',
  'Saúde',
  'Alimentação e amamentação',
  'Sono',
  'Quarto',
  'Passeio',
  'Maternidade',
  'Brinquedos e livros',
] as const
export type Categoria = (typeof CATEGORIAS)[number]

export type Fralda = { id: string; tamanho: string; rotulo: string; qtd: number; /** preço aproximado do pacote */ preco: number }
export type Presente = {
  id: string
  nome: string
  desc?: string
  /** 0 = quantidade livre */
  qtd: number
  /** preço unitário em R$ */
  preco: number
  /** true = valor estimado (loja sem preço público ou item sem link) */
  aprox?: boolean
  cat: Categoria
  link?: string
}

export const FRALDAS: Fralda[] = [
  { id: 'fralda-rn', tamanho: 'RN', rotulo: 'Fraldas RN', qtd: 9, preco: 60 },
  { id: 'fralda-p', tamanho: 'P', rotulo: 'Fraldas P', qtd: 12, preco: 65 },
  { id: 'fralda-m', tamanho: 'M', rotulo: 'Fraldas M', qtd: 30, preco: 70 },
  { id: 'fralda-g', tamanho: 'G', rotulo: 'Fraldas G', qtd: 45, preco: 75 },
]

export const PRESENTES: Presente[] = [
  // Roupas
  { id: 'e-body-manga-longa-p-0-3m', nome: 'Body manga longa – P (0-3M)', qtd: 2, preco: 35, aprox: true, cat: 'Roupas' },
  { id: 'e-body-manga-longa-m-3-6m', nome: 'Body manga longa – M (3-6M)', qtd: 4, preco: 35, aprox: true, cat: 'Roupas' },
  { id: 'e-body-manga-longa-g-6-9m', nome: 'Body manga longa – G (6-9M)', qtd: 1, preco: 35, aprox: true, cat: 'Roupas' },
  { id: 'e-macacao-sem-pe-p-0-3m', nome: 'Macacão sem pé – P (0-3M)', qtd: 2, preco: 55, aprox: true, cat: 'Roupas' },
  { id: 'e-macacao-sem-pe-m-3-6m', nome: 'Macacão sem pé – M (3-6M)', qtd: 1, preco: 55, aprox: true, cat: 'Roupas' },
  { id: 'e-casaco-de-la-p-0-3m', nome: 'Casaco de lã – P (0-3M)', qtd: 2, preco: 90, aprox: true, cat: 'Roupas' },
  { id: 'e-casaco-de-la-m-3-6m', nome: 'Casaco de lã – M (3-6M)', qtd: 2, preco: 90, aprox: true, cat: 'Roupas' },
  { id: 'n-conjunto-trico-casaquinho-shein', nome: 'Conjunto de tricô com casaquinho floral – M (3-6M) – Shein', desc: 'Casaquinho de crochê, body com babados e faixa de cabelo.', qtd: 1, preco: 168.68, cat: 'Roupas', link: 'https://onelink.shein.com/59/670nexn3aa08?shc=2_Rs3p4sHr4ZF' },
  { id: 'e-casaco-moletom-p-0-3m', nome: 'Casaco moletom – P (0-3M)', qtd: 1, preco: 70, aprox: true, cat: 'Roupas' },
  { id: 'e-pijama-rn', nome: 'Pijama – RN', qtd: 2, preco: 50, aprox: true, cat: 'Roupas' },
  { id: 'e-pijama-p-0-3m', nome: 'Pijama – P (0-3M)', qtd: 3, preco: 50, aprox: true, cat: 'Roupas' },
  { id: 'e-pijama-m-3-6m', nome: 'Pijama – M (3-6M)', qtd: 1, preco: 50, aprox: true, cat: 'Roupas' },
  // Acessórios
  { id: 'acessorios', nome: 'Acessórios para bebê', desc: 'Laços, tiaras, meias e outros detalhes.', qtd: 4, preco: 30, aprox: true, cat: 'Acessórios' },
  { id: 'e-saida-maternidade', nome: 'Saída de maternidade Trança Rose – Téti Lookinhos', qtd: 1, preco: 237, cat: 'Acessórios', link: 'https://www.tetilookinhos.com.br/produtos/saida-de-maternidade-tranca-rose/?variant=1495723853' },
  { id: 'n-luvinha-rose-teti', nome: 'Luvinha Rose – Téti Lookinhos', qtd: 1, preco: 29.9, cat: 'Acessórios', link: 'https://www.tetilookinhos.com.br/produtos/luvinha-rose-13xnf/' },
  { id: 'n-luvinha-branca-teti', nome: 'Luvinha Branca Unissex – Téti Lookinhos', qtd: 1, preco: 29.9, cat: 'Acessórios', link: 'https://www.tetilookinhos.com.br/produtos/luvinha-branca-unissex/' },
  { id: 'n-lacinhos-shopee', nome: 'Lacinhos – Shopee', qtd: 1, preco: 20, aprox: true, cat: 'Acessórios', link: 'https://br.shp.ee/SH8Pfho4' },
  { id: 'n-lacinhos-autocolantes-shopee', nome: 'Lacinhos autocolantes – Shopee', qtd: 1, preco: 15, aprox: true, cat: 'Acessórios', link: 'https://br.shp.ee/drgGkTLZ' },
  { id: 'n-kit-lacinhos-faixinha', nome: 'Kit com 5 lacinhos na faixinha (RN a 4 meses) – Shopee', desc: 'Cada kit vem com 5 laços.', qtd: 1, preco: 30, aprox: true, cat: 'Acessórios', link: 'https://br.shp.ee/zABs2tDh' },
  { id: 'e-kit-touca-luva', nome: 'Kit touca + luva', qtd: 3, preco: 35, aprox: true, cat: 'Acessórios' },
  { id: 'e-meias', nome: 'Meias', qtd: 10, preco: 15, aprox: true, cat: 'Acessórios' },
  { id: 'e-sapatinho-de-trico', nome: 'Sapatinho de tricô', qtd: 5, preco: 40, aprox: true, cat: 'Acessórios' },
  // Fraldas e troca
  { id: 'boca', nome: 'Fralda de boca – Shopee', desc: 'Para as mamadas e os sorrisos babados.', qtd: 6, preco: 15, aprox: true, cat: 'Fraldas e troca', link: 'https://br.shp.ee/22mGUKMn' },
  { id: 'pano', nome: 'Fraldinhas de pano', desc: 'Indispensáveis no dia a dia.', qtd: 6, preco: 12, aprox: true, cat: 'Fraldas e troca' },
  { id: 'e-fralda-comum', nome: 'Fralda Multiuso Viés Meu Nome – Toi Toi', qtd: 2, preco: 89.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-multiuso-vies-meu-nome/' },
  { id: 'n-fralda-multiuso-dots', nome: 'Fralda Multiuso Dots – Toi Toi', qtd: 2, preco: 86.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-multiuso-dots/' },
  { id: 'n-fralda-multiuso-raminho', nome: 'Fralda Multiuso Raminho – Toi Toi', qtd: 2, preco: 86.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-multiuso-raminho/' },
  { id: 'n-fralda-multiuso-coracoes-candy', nome: 'Fralda Multiuso Corações Candy – Toi Toi', qtd: 2, preco: 86.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-multiuso-coracoes-candy/' },
  { id: 'n-fralda-multiuso-branca', nome: 'Fralda Premium Multiuso Branca – Toi Toi', qtd: 4, preco: 68.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-multiuso-basica-branca/' },
  { id: 'e-fralda-maior', nome: 'Fralda maior', qtd: 6, preco: 25, aprox: true, cat: 'Fraldas e troca' },
  { id: 'e-fralda-cremer', nome: 'Fralda de pano Cremer (pacote com 5)', desc: 'Cada pacote vem com 5 fraldas.', qtd: 1, preco: 45, aprox: true, cat: 'Fraldas e troca', link: 'https://www.mercadolivre.com.br/p/MLB19777293?pdp_filters=item_id:MLB7797409966' },
  { id: 'e-fralda-de-boca', nome: 'Fralda de Boca Viés Meu Nome – Toi Toi', qtd: 2, preco: 36.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-vies-meu-nome/' },
  { id: 'n-fralda-boca-floral', nome: 'Fralda de Boca Floral – Toi Toi', qtd: 1, preco: 58.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-floral/' },
  { id: 'n-fralda-boca-raminhos-rosa', nome: 'Fralda de Boca Raminhos Rosa – Toi Toi', qtd: 1, preco: 58.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-raminhos-rosa/' },
  { id: 'n-fralda-boca-primavera', nome: 'Fralda de Boca Primavera – Toi Toi', qtd: 1, preco: 58.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-primavera/' },
  { id: 'n-fralda-boca-rose', nome: 'Fralda de Boca Rose – Toi Toi', qtd: 1, preco: 58.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-rose/' },
  { id: 'n-fralda-boca-coracoes-candy', nome: 'Fralda de Boca Corações Candy – Toi Toi', qtd: 1, preco: 58.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-coracoes-candy/' },
  { id: 'n-fralda-boca-coracoes-raminhos', nome: 'Fralda de Boca Corações e Raminhos – Toi Toi', qtd: 1, preco: 58.9, cat: 'Fraldas e troca', link: 'https://toitoiloja.com/produtos/fralda-de-boca-coracoes-e-raminhos/' },
  { id: 'e-fralda-de-ombro-estreita', nome: 'Fralda de ombro estreita', qtd: 6, preco: 30, aprox: true, cat: 'Fraldas e troca' },
  { id: 'e-fralda-de-ombro-normal', nome: 'Fralda de ombro normal', qtd: 10, preco: 35, aprox: true, cat: 'Fraldas e troca' },
  { id: 'e-aquecedor-de-lenco', nome: 'Aquecedor de lenço', qtd: 1, preco: 150, aprox: true, cat: 'Fraldas e troca' },
  { id: 'e-lencos-umedecidos', nome: 'Lenços umedecidos – opção 1', qtd: 0, preco: 25, aprox: true, cat: 'Fraldas e troca', link: 'https://www.mercadolivre.com.br/p/MLB19589548?pdp_filters=item_id:MLB4611049255' },
  { id: 'n-lencos-umedecidos-2', nome: 'Lenços umedecidos – opção 2', qtd: 0, preco: 25, aprox: true, cat: 'Fraldas e troca', link: 'https://www.mercadolivre.com.br/up/MLBU1114515124?pdp_filters=item_id:MLB2669677404' },
  { id: 'e-capa-extra-para-trocador', nome: 'Capa extra para trocador', qtd: 0, preco: 50, aprox: true, cat: 'Fraldas e troca' },
  { id: 'e-lixeira-com-tampa-para-fraldas', nome: 'Lixeira antiodor rosa para fralda descartável – Shein', qtd: 1, preco: 189.9, cat: 'Fraldas e troca', link: 'https://onelink.shein.com/59/674lneomklja?shc=2_Rs5FQJRvFKN' },
  // Banho
  { id: 'toalha', nome: 'Toalha de banho com capuz', desc: 'Macia e quentinha para depois do banho.', qtd: 3, preco: 60, aprox: true, cat: 'Banho' },
  { id: 'e-banheira', nome: 'Banheira – Shopee', qtd: 1, preco: 120, aprox: true, cat: 'Banho', link: 'https://br.shp.ee/D6sUahBH' },
  { id: 'n-termometro-banheira', nome: 'Termômetro de banheira', desc: 'Para conferir a temperatura da água do banho.', qtd: 1, preco: 30, aprox: true, cat: 'Banho', link: 'https://www.mercadolivre.com.br/up/MLBU4370273011?pdp_filters=item_id:MLB4924994011' },
  { id: 'e-toalha-de-banho-com-fralda', nome: 'Toalha Fralda Floral – Toi Toi', qtd: 2, preco: 159.9, cat: 'Banho', link: 'https://toitoiloja.com/produtos/toalha-fralda-floral/' },
  { id: 'n-toalha-fralda-flores-do-campo', nome: 'Toalha Fralda Flores do Campo – Toi Toi', qtd: 2, preco: 159.9, cat: 'Banho', link: 'https://toitoiloja.com/produtos/toalha-fralda-flores-do-campo/' },
  { id: 'n-toalha-fralda-ursinha', nome: 'Toalha Fralda Ursinha – Toi Toi', qtd: 1, preco: 159.9, cat: 'Banho', link: 'https://toitoiloja.com/produtos/toalha-fralda-ursinha-u19qr/' },
  // Higiene
  { id: 'higiene', nome: 'Itens de higiene', desc: 'Sabonete, shampoo e hidratante de bebê.', qtd: 3, preco: 60, aprox: true, cat: 'Higiene' },
  { id: 'e-kit-higiene', nome: 'Kit higiene', qtd: 1, preco: 90, aprox: true, cat: 'Higiene' },
  { id: 'e-kit-escova-e-pente', nome: 'Escova de cabelo para bebê – Shopee', qtd: 1, preco: 25, aprox: true, cat: 'Higiene', link: 'https://br.shp.ee/wePEtD4B' },
  { id: 'n-kit-escova-cabelo-shopee', nome: 'Kit escova de cabelo para bebê – Shopee', qtd: 1, preco: 35, aprox: true, cat: 'Higiene', link: 'https://br.shp.ee/H1fBmXyN' },
  { id: 'e-pomada-de-assadura', nome: 'Pomada de assadura Desitin roxa', qtd: 3, preco: 45, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/p/MLB19766972?pdp_filters=item_id:MLB5413569507' },
  { id: 'n-pomada-ad-prevent', nome: 'Pomada de assaduras A+D Prevent pote 454g', qtd: 5, preco: 90, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/p/MLB19541968?pdp_filters=item_id:MLB6144413524' },
  { id: 'e-alcool-70-e-cotonete-coto-umbilical', nome: 'Álcool 70% e cotonete (coto umbilical)', qtd: 0, preco: 20, aprox: true, cat: 'Higiene' },
  { id: 'e-cortador-tesourinha-de-unha', nome: 'Kit lixa de unha para bebê', qtd: 1, preco: 30, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/up/MLBU5631501189?pdp_filters=item_id:MLB7877344146' },
  { id: 'n-shampoo-bebe', nome: 'Shampoo de bebê', qtd: 0, preco: 30, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/p/MLB19567034?pdp_filters=item_id:MLB3629579527' },
  { id: 'n-sabonete-bebe', nome: 'Sabonete de bebê', qtd: 0, preco: 20, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/p/MLB19752363?pdp_filters=item_id:MLB7829459848' },
  { id: 'n-gel-lavante-bebe', nome: 'Gel lavante de bebê', qtd: 0, preco: 40, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/up/MLBU5307710867?pdp_filters=item_id:MLB5311982343' },
  { id: 'e-sabonete-shampoo-e-hidratante-de-bebe', nome: 'Loção hidratante de bebê', qtd: 0, preco: 40, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/p/MLB66463370?pdp_filters=item_id:MLB4903697078' },
  { id: 'n-alcool-gel', nome: 'Álcool em gel', qtd: 1, preco: 15, aprox: true, cat: 'Higiene', link: 'https://www.mercadolivre.com.br/p/MLB43771145?pdp_filters=item_id:MLB4065049259' },
  { id: 'n-sabao-neutro-para-lavar-as-roupinhas', nome: 'Sabão neutro para lavar as roupinhas', qtd: 0, preco: 30, aprox: true, cat: 'Higiene' },
  // Saúde
  { id: 'e-aspirador-nasal', nome: 'Aspirador nasal', qtd: 1, preco: 60, aprox: true, cat: 'Saúde', link: 'https://www.mercadolivre.com.br/p/MLB61692643?pdp_filters=item_id:MLB4456693769' },
  { id: 'e-termometro', nome: 'Termômetro de febre', qtd: 1, preco: 60, aprox: true, cat: 'Saúde', link: 'https://www.mercadolivre.com.br/p/MLB38806885?pdp_filters=item_id:MLB3911579285' },
  { id: 'e-bolsa-de-sementes', nome: 'Bolsa térmica Corações e Raminhos – Toi Toi', qtd: 1, preco: 46.9, cat: 'Saúde', link: 'https://toitoiloja.com/produtos/bolsa-termica-coracoes-e-raminhos/' },
  { id: 'e-oleos-essenciais', nome: 'Kit de óleos essenciais Baby (Hora de Dormir, Colic Zen e Respira) – Phitobe', qtd: 1, preco: 239, cat: 'Saúde', link: 'https://phitobe.com/products/kit-baby-hora-de-dormir-colic-zen-respira' },
  { id: 'n-oleo-massagem-bebe', nome: 'Óleo para massagem de bebê', qtd: 1, preco: 40, aprox: true, cat: 'Saúde', link: 'https://www.mercadolivre.com.br/p/MLB20994667?pdp_filters=item_id:MLB3440681867' },
  { id: 'n-creme-cicatrizante', nome: 'Creme cicatrizante', qtd: 1, preco: 60, aprox: true, cat: 'Saúde', link: 'https://www.mercadolivre.com.br/p/MLB38713737?pdp_filters=item_id:MLB5670881706' },
  // Alimentação e amamentação
  { id: 'e-mamadeira-petala-3-0-ppsu-330ml-philips-avent', nome: 'Mamadeira Pétala 3.0 PPSU 330ml – Philips Avent', qtd: 1, preco: 90, aprox: true, cat: 'Alimentação e amamentação', link: 'https://www.mercadolivre.com.br/mamadeira-petala-30-ppsu-330ml-decorada--philips-avent/up/MLBU4126723838?pdp_filters=item_id:MLB4789891853' },
  { id: 'e-mamadeira-petala-3-0-ppsu-260ml-philips-avent', nome: 'Mamadeira Pétala 3.0 PPSU 260ml – Philips Avent', qtd: 1, preco: 85, aprox: true, cat: 'Alimentação e amamentação', link: 'https://www.mercadolivre.com.br/mamadeira-petala-decorada-30-ppsu-260ml-philips-avent/up/MLBU4770256144' },
  { id: 'n-mamadeira-125ml', nome: 'Mamadeira Pétala PPSU 125ml 0m+ decorada azul e rosa – Philips Avent', desc: 'Bico nº 2.', qtd: 1, preco: 75, aprox: true, cat: 'Alimentação e amamentação', link: 'https://www.mercadolivre.com.br/p/MLB62909732?pdp_filters=item_id:MLB6400292888' },
  { id: 'e-chupetas', nome: 'Chupeta – opção 1', qtd: 0, preco: 45, aprox: true, cat: 'Alimentação e amamentação', link: 'https://www.mercadolivre.com.br/up/MLBU1403703177?pdp_filters=item_id:MLB1742486741' },
  { id: 'n-chupeta-2', nome: 'Chupeta – opção 2', qtd: 0, preco: 45, aprox: true, cat: 'Alimentação e amamentação', link: 'https://www.mercadolivre.com.br/up/MLBU1722241398?pdp_filters=item_id:MLB2619214341' },
  { id: 'n-chupeta-3', nome: 'Chupeta – opção 3 (Amazon)', qtd: 0, preco: 63.99, cat: 'Alimentação e amamentação', link: 'https://a.co/d/0efqPpi4' },
  { id: 'n-lenco-limpa-chupeta', nome: 'Lenços limpa-chupeta', qtd: 0, preco: 25, aprox: true, cat: 'Alimentação e amamentação', link: 'https://www.mercadolivre.com.br/p/MLB66272456?pdp_filters=item_id:MLB5033678043' },
  { id: 'e-porta-chupeta', nome: 'Porta-chupeta', qtd: 0, preco: 25, aprox: true, cat: 'Alimentação e amamentação' },
  { id: 'e-segurador-de-chupeta', nome: 'Segurador de chupeta', qtd: 0, preco: 25, aprox: true, cat: 'Alimentação e amamentação' },
  { id: 'e-bomba-tira-leite', nome: 'Extratora de leite (bomba tira-leite) – Shein', qtd: 1, preco: 207.95, cat: 'Alimentação e amamentação', link: 'https://onelink.shein.com/56/64ypx79yklku?ismg_ol=1JUEjcnZ5mz_01_KOC-C' },
  { id: 'n-bomba-mamijoy-vestivel', nome: 'Bomba de leite elétrica vestível 210ml Mamijoy – Shein', desc: '4 modos, baixo ruído e à prova de vazamento.', qtd: 1, preco: 207.95, cat: 'Alimentação e amamentação', link: 'https://onelink.shein.com/59/670nbr7ar3hs?shc=2_Rs3psNgWqIy' },
  { id: 'e-escova-para-mamadeira', nome: 'Escova para mamadeira', qtd: 1, preco: 30, aprox: true, cat: 'Alimentação e amamentação' },
  // Sono
  { id: 'e-capa-protetora-de-colchao', nome: 'Capa protetora de colchão Bordados – Papi', desc: 'Com elástico.', qtd: 1, preco: 69.44, cat: 'Sono', link: 'https://www.lojapapi.com.br/produto/837-capa-protetor-de-colchao-bordados-papi-com-elastico-contem-01-un' },
  { id: 'n-capa-colchao-impermeavel-aime', nome: 'Capa protetora de colchão impermeável para berço – Aimé Baby Kids', qtd: 1, preco: 104.25, cat: 'Sono', link: 'https://aimebabykids.com.br/products/capa-protetor-de-colchao-impermeavel-para-berco' },
  { id: 'e-kit-berco-maternidade', nome: 'Kit berço maternidade – Si Petit', desc: 'Enxoval personalizado em percal 400 fios.', qtd: 1, preco: 600, aprox: true, cat: 'Sono', link: 'https://sipetit.com/enxoval/kit-maternidade' },
  { id: 'e-cueiro', nome: 'Cueiro Corações Aquarela – Toi Toi', qtd: 2, preco: 69.9, cat: 'Sono', link: 'https://toitoiloja.com/produtos/cueiro-coracoes-aquarela/' },
  { id: 'n-cueiro-floral', nome: 'Cueiro Floral – Toi Toi', qtd: 2, preco: 69.9, cat: 'Sono', link: 'https://toitoiloja.com/produtos/cueiro-floral/' },
  { id: 'n-cueiro-flores-do-campo', nome: 'Cueiro Flores do Campo – Toi Toi', qtd: 1, preco: 69.9, cat: 'Sono', link: 'https://toitoiloja.com/produtos/cueiro-flores-do-campo/' },
  { id: 'n-cueiro-vies-poa-rosa', nome: 'Cueiro Viés Poá Rosa – Toi Toi', qtd: 1, preco: 76.9, cat: 'Sono', link: 'https://toitoiloja.com/produtos/cueiro-vies-poa-rosa/' },
  { id: 'n-cueiro-swaddle-bamboo-mami', nome: 'Cueiro Swaddle Soft Bamboo Mami 1,20 x 1,20 m (kit com 3)', desc: 'Cada kit vem com 3 cueiros.', qtd: 1, preco: 153.19, cat: 'Sono', link: 'https://www.lojapapi.com.br/produto/212-cueiro-swaddle-soft-bamboo-mami-120m-x-120m-contem-03-unidades' },
  { id: 'n-mantinha-carneirinho-coracoes', nome: 'Mantinha Carneirinho Corações Aquarela – Toi Toi', qtd: 1, preco: 179.9, cat: 'Sono', link: 'https://toitoiloja.com/produtos/mantinha-carneirinho-coracoes-aquarela-181pc/' },
  { id: 'e-coberta', nome: 'Cobertor Bubble Mami com microfibra 1,10 x 0,80 m – Papi', qtd: 1, preco: 65.22, cat: 'Sono', link: 'https://www.lojapapi.com.br/produto/1051-cobertor-bubble-mami-com-microfibra-110m-x-80-cm-contem-01-unidade' },
  { id: 'n-cobertor-bolha-shopee', nome: 'Cobertor bolha – Shopee', qtd: 1, preco: 60, aprox: true, cat: 'Sono', link: 'https://br.shp.ee/R8yhHvXD' },
  { id: 'e-manta-de-trico', nome: 'Manta Carneirinho Tricot Rosa Antigo – Toi Toi', qtd: 6, preco: 199.9, cat: 'Sono', link: 'https://toitoiloja.com/produtos/manta-carneirinho-tricot-rosa-antigo/' },
  { id: 'e-berco-portatil', nome: 'Berço portátil – Shopee', qtd: 1, preco: 350, aprox: true, cat: 'Sono', link: 'https://br.shp.ee/tMnFrDqM' },
  { id: 'e-ruido-branco', nome: 'Aparelho de ruído branco com luz vermelha', desc: 'Um só aparelho faz as duas funções.', qtd: 1, preco: 130, aprox: true, cat: 'Sono', link: 'https://www.mercadolivre.com.br/up/MLBU5202713868?pdp_filters=item_id:MLB7641068286' },
  { id: 'n-travesseiro-2', nome: 'Travesseiro', qtd: 1, preco: 50, aprox: true, cat: 'Sono', link: 'https://www.mercadolivre.com.br/up/MLBU2898909266?pdp_filters=item_id:MLB3932134313' },
  { id: 'n-travesseiro-antirrefluxo', nome: 'Travesseiro antirrefluxo', qtd: 1, preco: 90, aprox: true, cat: 'Sono', link: 'https://www.mercadolivre.com.br/up/MLBU3192280828?pdp_filters=item_id:MLB4070563111' },
  { id: 'e-lencois-com-elastico', nome: 'Jogo de lençol de berço 3 peças percal 300 fios personalizado branco com rose – Aimé Baby Kids', qtd: 1, preco: 200, aprox: true, cat: 'Sono', link: 'https://aimebabykids.com.br/products/jogo-de-lencol-de-berco-03-pecas-algodao-percal-300-fios-personalizado-branco-c-rose' },
  { id: 'n-lencol-berco-bordado-floral', nome: 'Lençol de berço bordado floral – Irmãs Sampaio', qtd: 1, preco: 185.25, cat: 'Sono', link: 'https://irmassampaio.com.br/p/lencol-de-berco-bordado-floral/' },
  // Quarto
  { id: 'e-mobile-berco-trocador', nome: 'Móbile (berço/trocador)', qtd: 1, preco: 150, aprox: true, cat: 'Quarto' },
  { id: 'n-almofada-flor-rosa', nome: 'Almofada de flor rosa claro – Irmãs Sampaio', qtd: 1, preco: 204.25, cat: 'Quarto', link: 'https://irmassampaio.com.br/p/almofada-de-flor-rosa-claro/' },
  { id: 'n-almofada-redonda-croche-rose', nome: 'Almofada redonda crochê rose – Irmãs Sampaio', qtd: 1, preco: 204.25, cat: 'Quarto', link: 'https://irmassampaio.com.br/p/almofada-redonda-croche-rose/' },
  { id: 'n-almofada-cabeceira-tricot-rose', nome: 'Almofada de cabeceira tricô rose – Irmãs Sampaio', qtd: 1, preco: 232.75, cat: 'Quarto', link: 'https://irmassampaio.com.br/p/almofada-de-cabeceira-tricot-rose/' },
  { id: 'n-almofada-cabeceira-tricot-ursinho', nome: 'Almofada de cabeceira tricô com ursinho – Irmãs Sampaio', qtd: 1, preco: 375.25, cat: 'Quarto', link: 'https://irmassampaio.com.br/p/almofada-de-cabeceira-tricot-com-ursinho-3/' },
  // Passeio
  { id: 'e-sling-ou-canguru', nome: 'Sling ou canguru', qtd: 1, preco: 180, aprox: true, cat: 'Passeio' },
  // Maternidade
  { id: 'e-mala-de-maternidade', nome: 'Mala de maternidade', qtd: 0, preco: 250, aprox: true, cat: 'Maternidade' },
  { id: 'e-bolsa-de-maternidade', nome: 'Bolsa de maternidade', qtd: 1, preco: 200, aprox: true, cat: 'Maternidade' },
  // Brinquedos e livros
  { id: 'livros', nome: 'Livrinhos infantis', desc: 'Para as primeiras histórias antes de dormir.', qtd: 4, preco: 40, aprox: true, cat: 'Brinquedos e livros' },
  { id: 'sensoriais', nome: 'Brinquedos', desc: 'Texturas, sons e cores para descobrir o mundo.', qtd: 3, preco: 50, aprox: true, cat: 'Brinquedos e livros' },
  { id: 'mordedores', nome: 'Mordedores', desc: 'Para aliviar a fase dos dentinhos.', qtd: 3, preco: 25, aprox: true, cat: 'Brinquedos e livros' },
  { id: 'e-chocalhos', nome: 'Chocalhos', qtd: 0, preco: 30, aprox: true, cat: 'Brinquedos e livros' },
]
