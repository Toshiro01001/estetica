# Identidade visual: Ocre Estética

Estudo curto feito antes de qualquer linha de código. Tudo aqui é fictício: a clínica, as profissionais, o endereço, os preços e os resultados mostrados.

## Nome e posicionamento

**Ocre Estética.** Clínica de estética e beleza de bairro, com procedimentos faciais e corporais, em Cuiabá.

Frase de posicionamento: **"Cuidado para a pele que você já tem."**

A ideia que guia tudo: uma clínica que trata beleza como cuidado, não como transformação milagrosa. Ocre é o pigmento de terra que acompanha a pele humana em todos os tons. Por isso a marca é quente, terrosa e madura, sem a cor-de-rosa de perfumaria nem o dourado de promessa. Nenhuma frase do site promete resultado garantido; procedimentos invasivos são sempre apresentados com a etapa de avaliação antes.

## Paleta

A base é escura e quente (um preto fuligem, não um preto puro), as superfícies claras são tom de pele e o único ponto de cor forte é uma argila queimada. O verde-oliva entra como apoio de "saúde": etiquetas, estado positivo e o controle do comparador. O ocre propriamente dito aparece só em ilustrações e na foto do hero, nunca como texto.

| Nome | Hex | Papel |
|---|---|---|
| Fuligem | `#1E1A17` | Fundo do hero, do cabeçalho, do simulador de pacote e do rodapé. Texto sobre superfícies claras. |
| Areia | `#E9DCCF` | Fundo das seções claras. Tom de pele, não creme. |
| Linho | `#F6EFE7` | Superfícies: cartões, formulários, calendário. Texto sobre Fuligem. |
| Argila | `#8C3A24` | Destaque. Botão principal, item selecionado, preço do pacote. Também como texto sobre Areia e Linho. |
| Oliva | `#5C6136` | Apoio: etiquetas de área e objetivo, estado positivo, cabo do comparador. |
| Ocre | `#C68B59` | Decoração: ilustrações, foto do hero, traço fino. Nunca texto. |

Tons derivados, só onde indicado: **Grafite** `#4A423C` para legendas sobre fundo claro; **Argila clara** `#D9B6A6` e **Ocre claro** `#E0B48E` para texto de apoio e links sobre Fuligem; **Oliva claro** `#A6AA7A` para etiquetas sobre Fuligem.

Regra de uso do destaque: **a Argila aparece em um só lugar por tela**: o botão principal da seção ou o número que importa (o total do pacote). Nunca dois botões Argila na mesma dobra. No hero, a Argila aparece uma única vez, no botão principal. Nas demais seções escuras (pacote, agendamento), o botão principal usa Ocre claro com texto Fuligem, e a Argila fica reservada ao que se destaca na seção clara seguinte.

Contrastes verificados (WCAG): Fuligem sobre Areia 12,8:1; Fuligem sobre Linho 15,2:1; Argila sobre Areia 5,7:1; Linho sobre Argila 6,7:1; Oliva sobre Areia 4,9:1; Grafite sobre Areia 7,3:1; Linho sobre Fuligem 15,2:1; Ocre claro sobre Fuligem 9,1:1; Argila clara sobre Fuligem 9,2:1; Oliva claro sobre Fuligem 7,1:1; Fuligem sobre Ocre claro 9,1:1.

## Tipografia

Duas famílias, ambas locais em `fonts/` (licença SIL OFL, arquivo de licença ao lado).

- **Fraunces** (variável, eixos peso, tamanho óptico, SOFT e WONK): títulos e números grandes. Serifa "velha e macia", de personalidade forte, com o eixo SOFT em 100 (terminais arredondados, como barro) e WONK ligado nos títulos (a perna do "n" e do "m" sai torta de propósito). É a letra da marca: nenhum outro site da série usa.
- **Instrument Sans** (variável, 400 a 700): texto corrente, formulários, botões e etiquetas. Grotesca com desenho um pouco quadrado, muito legível em tela pequena, discreta para não competir com a Fraunces.

Escala tipográfica (fluida, com `clamp`):

| Papel | Família | Tamanho | Entrelinha | Peso |
|---|---|---|---|---|
| Título da página (h1) | Fraunces | 2,5rem a 4,5rem | 1,0 | 500 |
| Título de seção (h2) | Fraunces | 1,875rem a 2,75rem | 1,08 | 500 |
| Subtítulo (h3) | Fraunces | 1,25rem a 1,375rem | 1,25 | 600 |
| Número grande (total do pacote) | Fraunces | 2,5rem a 3,5rem | 1,0 | 500 |
| Corpo | Instrument Sans | 1,0625rem (17px) | 1,6 | 400 |
| Interface (botões, rótulos) | Instrument Sans | 0,9375rem | 1,3 | 600 |
| Legenda | Instrument Sans | 0,875rem | 1,45 | 400 |

Regra de peso: a Fraunces nunca passa de 600; títulos pesados viram "padaria". Na Instrument Sans, 600 é o máximo, reservado a rótulos e botões; nada de 700 em texto corrente. Nada de caixa alta em rótulos sobre títulos: os títulos falam sozinhos.

## Layout

- Grade de 12 colunas, largura máxima de 1160px, margens laterais de 20px no celular e 40px no computador.
- Ritmo de espaçamento em múltiplos de 8px (8, 16, 24, 32, 48, 64, 96, 128).
- Seções alternam fundo Fuligem e Areia; a troca de fundo marca a troca de assunto. Sem linhas divisórias entre seções.
- Texto alinhado à esquerda em todo o site. Nada centralizado, exceto o conteúdo de botões.
- Cada seção abre com h2 e uma frase que diz o que é e o que fazer.
- Cantos: 20px nos cartões grandes e na foto do hero, 12px em cartões pequenos, 8px em campos, 999px só em etiquetas e nos botões de filtro.
- Sombras: nenhuma. A separação é feita por borda de 1px (Fuligem a 15% sobre Areia, Linho a 15% sobre Fuligem) ou por mudança de fundo.
- Celular primeiro: uma coluna a partir de 320px, duas colunas a partir de 720px, grade completa a partir de 1024px.

## Imagem forte

A imagem do hero é uma **fotografia** em contêiner 4:3 com cantos de 20px, à direita do título. Enquanto a foto definitiva não chega, `img/hero.webp` é uma composição abstrata gerada com Pillow nas cores da identidade (formas orgânicas em Ocre, Argila e Areia sobre Fuligem, com grão fino), 1600 por 1200 pixels, sem texto.

As ilustrações da galeria de resultados são SVG abstratos (texturas de pele, contorno, luminosidade) e dizem isso na legenda: são ilustrações, não fotos de pacientes.

## Foto do hero

Proporção esperada: **4:3** (por exemplo 1600 por 1200 pixels), em webp, salva em `img/hero.webp`. O lado direito da imagem pode ter um pouco mais de "ar", porque no celular a foto fica abaixo do título e no computador fica à direita.

Prompt em português para gerar no Canva:

> Fotografia editorial de natureza-morta para site premium de clínica de estética. Sobre uma superfície de pedra escura cor de fuligem quente (quase preto, com leve tom marrom), três objetos de cerâmica fosca cor de argila queimada e terracota escura: um pote baixo aberto com creme cor de linho, uma pedra de gua sha em quartzo verde-oliva e uma folha de eucalipto seca. Ao fundo, um pano de linho cor de areia rosada, desfocado. Luz natural lateral, de fim de tarde, suave, com sombras longas e douradas. Paleta: fuligem, argila, ocre, areia e oliva. Estilo minimalista, sofisticado e quente, textura de barro e tecido visível. Sem texto, sem pessoas, sem rostos, sem logotipos, sem rosa-claro, sem dourado brilhante. Enquadramento horizontal 4:3, objeto principal levemente à esquerda do centro.

## Movimento

- Um só momento orquestrado na abertura: o título do hero sobe 12px e aparece, e a foto surge com leve escala (1,03 para 1,0) em 700ms, uma após a outra.
- Respostas a ações: filtros do catálogo mudam de cor em 150ms; cartões adicionados ao pacote ganham borda Oliva; o cabo do comparador acompanha o dedo ou o mouse sem atraso; o total do pacote faz um pulso curto de opacidade ao mudar.
- Com `prefers-reduced-motion: reduce`, nenhuma animação roda: o hero já aparece pronto e as transições viram instantâneas.

## Cuidado ético (vale para todo o texto)

- Nenhuma frase promete resultado garantido. Usamos "pode ajudar", "costuma", "varia de pessoa para pessoa".
- Todo procedimento marcado como invasivo ou de maior risco (preenchimento, toxina botulínica, peelings profundos, criolipólise) traz o aviso de que exige avaliação prévia com profissional habilitada, e no agendamento só pode ser marcado como "avaliação".
- A galeria diz que são ilustrações, não fotos de pacientes, e que resultados variam.
- Preços são fictícios e o parcelamento é apenas uma simulação.

## O que evitamos de propósito

Rosa-millennial, dourado genérico, fundo creme com serif e laranja-terracota (a nossa base é escura e o terracota é escuro e único), preto com verde ácido, cartões iguais com sombra, rótulos em caixa alta sobre todo título, numeração 01/02/03 sem sequência real, setas em links, gradientes decorativos, fotos de banco de imagem e qualquer rosto.
