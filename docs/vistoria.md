# Vistoria de segurança: Ocre Estética

Data: 2026-11-08. Site estático de demonstração, publicado no GitHub Pages. Vistoria curta, feita antes do primeiro commit.

## Content-Security-Policy

Declarada por `<meta http-equiv="Content-Security-Policy">` em `index.html` e `404.html`:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'
```

- Nenhum script inline, nenhum `onclick` em HTML, nenhum `style=""` em HTML. Os únicos estilos dinâmicos (corte do comparador) são aplicados via CSSOM (`element.style.setProperty`), permitido sem `'unsafe-inline'`.
- `img-src` aceita `data:` só para os dois ícones SVG embutidos no CSS (seta do `select` e setas do cabo do comparador).
- `connect-src 'none'` impede qualquer `fetch`, `XMLHttpRequest` ou WebSocket.
- `form-action 'none'`: o formulário de agendamento nunca é submetido a lugar algum; o JavaScript trata o `submit` e mostra o resumo na tela.
- Na `404.html`, `script-src 'none'`: a página não tem JavaScript.

## Envio de dados

Nenhum. O site não tem backend, não chama APIs, não carrega fontes, imagens ou scripts externos e não tem analytics. O único link externo é https://mileumalinhas.com.br, como texto, na faixa de demonstração e no rodapé.

## O que fica no navegador

- `localStorage`, chave única `ocre-agendamentos`, só quando a pessoa marca a caixa "Guardar este agendamento neste navegador". Conteúdo: lista de objetos com data/horário, serviço, nome da profissional e o nome digitado. Nada de telefone. O botão "Apagar todos" remove a chave. A leitura e a escrita ficam em `try/catch` para navegadores sem armazenamento.
- Nenhum cookie, nenhum `sessionStorage`, nenhum IndexedDB.
- O pacote montado fica só em memória e some ao recarregar.

## Dependências

Nenhuma em tempo de execução. Fontes Fraunces e Instrument Sans são arquivos `woff2` locais, licença SIL OFL, com o texto da licença em `fonts/`. Os testes usam Playwright só no computador de quem desenvolve; nada dele vai para o site.

## Dados fictícios

Clínica, endereço, telefone, profissionais, registros profissionais, preços e agendas foram inventados. O telefone "(65) 3000-0000" e os registros "ET-0101", "BM-2020" e "ET-0344" não correspondem a ninguém de propósito. Não há senha, chave ou credencial em nenhum arquivo.

## Riscos residuais

- Se a pessoa marcar "guardar" em um computador compartilhado, o nome e o horário ficam visíveis para quem usar o mesmo navegador. O aviso ao lado da caixa diz isso e o botão de apagar está na mesma seção.
- A CSP por `<meta>` não cobre `frame-ancestors`; se alguém incorporar o site num `iframe`, o navegador não impede. Para um site estático de demonstração sem login nem dados reais, o impacto é nulo.
- Textos e preços são exemplos; uma clínica real precisaria revisar todas as descrições de procedimentos com a profissional responsável e com as normas do conselho de classe (publicidade de serviços de saúde) antes de publicar.

## Revisão de 08/11/2026 (leva final de design)

Revisão feita depois de aplicar os design systems da leva final e encaixar as fotos geradas por IA no Canva.

- **CSP:** a política do `index.html` é a mesma de antes da leva (conferida linha a linha). Continua sem `unsafe-inline`, sem `unsafe-eval` e sem origem externa.
- **Script e estilo inline:** nenhum `<script>` inline, nenhum `<style>` e nenhum atributo `style` nas páginas. Os efeitos novos mudam só classes, `textContent` e propriedades CSS pelo CSSOM, que a CSP permite.
- **Recursos externos:** nenhum script, fonte, imagem ou folha de estilo de fora. Os únicos links externos são de navegação comum (mileumalinhas.com.br e o perfil do GitHub).
- **Bibliotecas:** nenhuma entrou. Movimento, vidro, contadores e revelação ao rolar são CSS e JavaScript escritos à mão, desligados com `prefers-reduced-motion`.
- **innerHTML:** 1 uso(s) que já existiam antes da leva; nenhum foi acrescentado. Eles só limpam listas ou montam HTML com dados fixos do próprio site e números calculados, nunca com texto digitado pelo visitante.
- **eval e Function:** nenhum uso.
- **Armazenamento:** `localStorage` continua só com o que já existia (`ocre-agendamentos`), sem chave nova nesta leva.
- **Dados pessoais:** nenhum dado pessoal real entrou. Pessoas, empresas, telefones e endereços seguem fictícios. As fotos não retratam pessoas reais.
- **Imagens:** arquivos webp locais em `img/`, com `width`/`height`, `loading="lazy"` e `decoding="async"`. Nenhuma é carregada de outro domínio.
- **Testes:** `tests/site.cjs` passa em 1280x900, iPhone 13 e 320px, sem erro de console e sem rolagem horizontal.
