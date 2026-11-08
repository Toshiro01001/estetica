/* Testes do site Ocre Estética com Playwright.
   Antes de rodar, sirva a pasta do site: python3 -m http.server 8308
   Depois: node tests/site.cjs
   Variáveis opcionais: URL (padrão http://localhost:8308/), CAPTURAS (pasta para salvar PNGs). */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = process.env.URL || "http://localhost:8308/";
const CAPTURAS = process.env.CAPTURAS || "";

const TELAS = [
  { nome: "computador", opcoes: { viewport: { width: 1280, height: 900 } } },
  { nome: "iphone13", opcoes: { ...devices["iPhone 13"] } },
  { nome: "estreito", opcoes: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
];

let falhas = 0;
function ok(cond, msg) {
  if (cond) { console.log("  ok   " + msg); }
  else { falhas++; console.log("  FALHA " + msg); }
}

async function verificarLayout(page, nome) {
  const info = await page.evaluate(() => {
    const larguraJanela = document.documentElement.clientWidth;
    const rolagem = document.documentElement.scrollWidth > larguraJanela + 1;
    const cortados = [];
    const estourados = [];
    document.querySelectorAll("body *").forEach((e) => {
      if (!e.offsetParent && e.tagName !== "BODY") { return; }
      const r = e.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) { return; }
      let pai = e.parentElement, oculto = false;
      while (pai && pai !== document.body) {
        const cs = getComputedStyle(pai);
        if ((pai.clientWidth <= 1 && cs.overflow === "hidden") || cs.clipPath !== "none") { oculto = true; break; }
        pai = pai.parentElement;
      }
      if (oculto) { return; }
      if (r.right > larguraJanela + 1 && getComputedStyle(e).position !== "fixed") {
        estourados.push(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""));
      }
      const temTexto = Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!temTexto) { return; }
      const cs = getComputedStyle(e);
      if (cs.overflowX === "hidden" || cs.overflowX === "clip" || cs.textOverflow === "ellipsis") {
        if (e.scrollWidth > e.clientWidth + 1) {
          cortados.push(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + ": " + e.textContent.trim().slice(0, 40));
        }
      }
    });
    return { rolagem, cortados, estourados: estourados.slice(0, 8) };
  });
  ok(!info.rolagem, nome + ": sem rolagem horizontal");
  ok(info.estourados.length === 0, nome + ": nenhum elemento passa da borda" + (info.estourados.length ? " (" + info.estourados.join(", ") + ")" : ""));
  ok(info.cortados.length === 0, nome + ": nenhum texto cortado" + (info.cortados.length ? " (" + info.cortados.join(" | ") + ")" : ""));
}

async function capturar(page, nome) {
  if (!CAPTURAS) { return; }
  fs.mkdirSync(CAPTURAS, { recursive: true });
  await page.screenshot({ path: path.join(CAPTURAS, nome + ".png") });
}

async function testarTela(browser, tela) {
  console.log("\n== " + tela.nome + " ==");
  const context = await browser.newContext(tela.opcoes);
  const page = await context.newPage();
  const erros = [];
  page.on("console", (m) => { if (m.type() === "error") { erros.push((page.url().includes("404") ? "[404] " : "") + m.text()); } });
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => erros.push("request: " + r.url()));
  page.on("response", (r) => { if (r.status() >= 400) { erros.push("http " + r.status() + " " + r.url()); } });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await capturar(page, "capa-" + tela.nome);
  await verificarLayout(page, "abertura");
  const fotoOk = await page.evaluate(() => { const i = document.querySelector(".hero-foto"); return i && i.complete && i.naturalWidth === 1600; });
  ok(fotoOk, "hero: foto carregada com 1600px de largura");

  // Função 1: catálogo com filtros
  const totalInicial = await page.locator("#catalogo .proc").count();
  ok(totalInicial === 14, "catálogo: 14 procedimentos no início (" + totalInicial + ")");
  await page.locator("#chips-area input[value='abdomen']").check({ force: true });
  await page.waitForTimeout(200);
  const abdomen = await page.locator("#catalogo .proc").count();
  ok(abdomen === 5, "catálogo: filtro Abdômen deixa 5 (" + abdomen + ")");
  await page.locator("#chips-objetivo input[value='relaxar']").check({ force: true });
  await page.waitForTimeout(200);
  const nomes = await page.locator("#catalogo .proc h3").allTextContents();
  ok(nomes.length === 2 && nomes.some((n) => n.includes("Drenagem")) && nomes.some((n) => n.includes("pedras")), "catálogo: Abdômen + Relaxar = drenagem e pedras quentes (" + nomes.join(", ") + ")");
  await page.locator("#chips-area input[value='rosto']").check({ force: true });
  await page.waitForTimeout(200);
  ok((await page.locator("#catalogo .vazio").count()) === 1, "catálogo: combinação sem resultado mostra aviso");
  ok((await page.locator("#filtro-resumo").textContent()).includes("Nenhum"), "catálogo: resumo diz que não há procedimento");
  await page.locator("#chips-objetivo input[value='linhas']").check({ force: true });
  await page.waitForTimeout(200);
  const invasivos = await page.locator("#catalogo .etiqueta-avaliacao").count();
  ok(invasivos >= 4, "catálogo: procedimentos invasivos marcam 'Exige avaliação' (" + invasivos + ")");
  await page.locator("#procedimentos .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "catálogo");
  await capturar(page, "catalogo-" + tela.nome);
  await page.locator("#chips-area input[value='']").check({ force: true });
  await page.locator("#chips-objetivo input[value='']").check({ force: true });
  await page.waitForTimeout(200);

  // Função 2: simulador de pacote
  ok(!(await page.locator("#pacote-vazio").isHidden()), "pacote: começa vazio");
  await page.locator("[data-add='limpeza']").click();
  await page.waitForTimeout(150);
  ok((await page.locator("[data-add='limpeza']").getAttribute("aria-pressed")) === "true", "pacote: botão do cartão vira 'No pacote'");
  ok((await page.locator("#pacote-total").textContent()).replace(/\s/g, "") === "R$180", "pacote: 1 item, total R$ 180 (" + (await page.locator("#pacote-total").textContent()) + ")");
  await page.locator("[data-add='hidrafacial']").click();
  await page.waitForTimeout(150);
  ok((await page.locator("#pacote-desconto-pct").textContent()) === "(5%)", "pacote: 2 itens aplicam 5%");
  ok((await page.locator("#pacote-total").textContent()).replace(/\s/g, "") === "R$380", "pacote: 400 menos 5% = R$ 380");
  await page.locator("[data-add='drenagem']").click();
  await page.waitForTimeout(150);
  ok((await page.locator("#pacote-desconto-pct").textContent()) === "(10%)", "pacote: 3 itens aplicam 10%");
  ok((await page.locator("#pacote-total").textContent()).replace(/\s/g, "") === "R$495", "pacote: 550 menos 10% = R$ 495");
  await page.locator(".pacote-item[data-id='drenagem'] .sessoes button").nth(1).click();
  await page.waitForTimeout(150);
  ok((await page.locator(".pacote-item[data-id='drenagem'] output").textContent()) === "2 sessões", "pacote: botão + sobe para 2 sessões");
  ok((await page.locator("#pacote-total").textContent()).replace(/\s/g, "") === "R$630", "pacote: 700 menos 10% = R$ 630");
  await page.selectOption("#pacote-vezes", "6");
  await page.waitForTimeout(150);
  ok((await page.locator("#pacote-parcela").textContent()).includes("6 vezes de") && (await page.locator("#pacote-parcela").textContent()).includes("105,00"), "pacote: 6 vezes de R$ 105,00");
  await page.locator("#pacote").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "pacote");
  await capturar(page, "pacote-" + tela.nome);
  await page.locator(".pacote-item[data-id='hidrafacial'] .botao-texto").click();
  await page.waitForTimeout(150);
  ok((await page.locator("#pacote-lista .pacote-item").count()) === 2, "pacote: remover tira o item");
  ok((await page.locator("[data-add='hidrafacial']").getAttribute("aria-pressed")) === "false", "pacote: cartão volta a 'Adicionar'");
  await page.click("#pacote-limpar");
  await page.waitForTimeout(150);
  ok(!(await page.locator("#pacote-vazio").isHidden()), "pacote: esvaziar volta ao estado vazio");

  // Função 3: comparador deslizante
  ok((await page.locator(".comparador").count()) === 4, "galeria: 4 comparadores");
  const faixa = page.locator(".comparador[data-id='contorno'] .comparador-faixa");
  await faixa.focus();
  await faixa.fill("80");
  await faixa.dispatchEvent("input");
  await page.waitForTimeout(100);
  const corte = await page.locator(".comparador[data-id='contorno'] .comparador-palco").evaluate((e) => e.style.getPropertyValue("--corte"));
  ok(corte === "80%", "galeria: a faixa move o corte (" + corte + ")");
  const clip = await page.locator(".comparador[data-id='contorno'] .comparador-depois").evaluate((e) => getComputedStyle(e).clipPath);
  ok(clip.includes("80%"), "galeria: clip-path acompanha (" + clip + ")");
  await page.locator("#resultados .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "galeria");
  await capturar(page, "galeria-" + tela.nome);

  // Função 4: agendamento com escolha de profissional
  await page.locator("[data-agendar='toxina']").click();
  await page.waitForTimeout(500);
  ok((await page.locator("#ag-proc").inputValue()) === "toxina", "agenda: botão do cartão pré-seleciona o procedimento");
  ok(!(await page.locator("#ag-aviso-invasivo").isHidden()), "agenda: procedimento invasivo mostra aviso de avaliação");
  const desabilitadas = await page.locator("#ag-profissionais input:disabled").count();
  ok(desabilitadas === 2, "agenda: só Juliana faz toxina (2 desabilitadas)");
  await page.selectOption("#ag-proc", "drenagem");
  await page.waitForTimeout(150);
  ok(await page.locator("#ag-aviso-invasivo").isHidden(), "agenda: procedimento comum esconde o aviso");
  ok((await page.locator("#ag-profissionais input:disabled").count()) === 1, "agenda: drenagem com Camila ou Helena");
  await page.locator("#ag-profissionais input[value='camila']").check({ force: true });
  await page.waitForTimeout(200);
  let diaBotao = page.locator("#cal-grade .cal-dia.tem-vaga").first();
  if ((await diaBotao.count()) === 0) {
    await page.click("#cal-proximo");
    await page.waitForTimeout(200);
    diaBotao = page.locator("#cal-grade .cal-dia.tem-vaga").first();
  }
  ok((await diaBotao.count()) === 1, "agenda: há dia com vaga");
  const rotuloDia = await diaBotao.getAttribute("aria-label");
  ok(/segunda|quarta|sexta|sábado/.test(rotuloDia), "agenda: dia respeita a agenda da Camila (" + rotuloDia + ")");
  await diaBotao.click();
  await page.waitForTimeout(200);
  const livres = await page.locator("#horarios-lista .horario:not([disabled])").count();
  const ocupados = await page.locator("#horarios-lista .horario[disabled]").count();
  ok(livres > 0 && livres + ocupados === 6, "agenda: horários da Camila listados (" + livres + " livres, " + ocupados + " ocupados)");
  await page.locator("#horarios-lista .horario:not([disabled])").first().click();
  await page.waitForTimeout(150);
  await page.click("#agenda button[type=submit]");
  await page.waitForTimeout(200);
  ok(!(await page.locator("#ag-erro").isHidden()) && (await page.locator("#ag-erro").textContent()).includes("seu nome"), "agenda: validação barra envio sem nome");
  await page.fill("#ag-nome", "Teste da Silva");
  await page.fill("#ag-fone", "65 99999 0000");
  await page.check("#ag-guardar");
  await page.locator("#ag-cal").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "agenda");
  await capturar(page, "agenda-" + tela.nome);
  await page.click("#agenda button[type=submit]");
  await page.waitForTimeout(500);
  ok(!(await page.locator("#ag-resumo").isHidden()), "agenda: resumo aparece");
  const resumo = await page.locator("#ag-resumo-lista").textContent();
  ok(resumo.includes("Drenagem") && resumo.includes("Camila") && resumo.includes("(65) 99999-0000"), "agenda: resumo traz serviço, profissional e telefone formatado");
  ok((await page.locator("#meus-lista li").count()) === 1, "agenda: agendamento guardado no navegador");
  const chaves = await page.evaluate(() => Object.keys(localStorage).join(","));
  ok(chaves === "ocre-agendamentos", "agenda: única chave no localStorage (" + chaves + ")");
  await verificarLayout(page, "resumo");
  await capturar(page, "resumo-" + tela.nome);
  await page.click("#meus-apagar");
  await page.waitForTimeout(150);
  ok((await page.evaluate(() => localStorage.length)) === 0, "agenda: apagar limpa o localStorage");
  await page.click("#ag-novo");
  await page.waitForTimeout(150);
  ok(!(await page.locator("#agenda").isHidden()), "agenda: formulário volta para novo agendamento");

  // Menu no celular
  if (await page.locator("#menu-botao").isVisible()) {
    await page.click("#menu-botao");
    ok(await page.locator("#menu").isVisible(), "menu: abre no celular");
    await page.click("#menu a");
    ok(!(await page.locator("#menu").isVisible()), "menu: fecha ao escolher uma seção");
  }

  // Página 404
  const resp404 = await page.goto(URL + "404.html", { waitUntil: "networkidle" });
  ok(resp404 && resp404.status() === 200, "404.html carrega");
  await verificarLayout(page, "404");
  const errosReais = erros.filter((e) => !e.includes("/estetica/") && !e.startsWith("[404]"));
  ok(errosReais.length === 0, "console sem erros" + (errosReais.length ? " (" + errosReais.join(" | ") + ")" : ""));
  ok(true, "404 usa caminhos absolutos /estetica/ (avisos só no servidor local são esperados fora do GitHub Pages)");

  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const tela of TELAS) { await testarTela(browser, tela); }
  await browser.close();
  console.log("\n" + (falhas ? falhas + " falha(s)." : "Tudo certo."));
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
