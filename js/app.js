/* Ocre Estética: lógica do site. Tudo roda no navegador; nada é enviado.
   Depende de js/dados.js (AREAS, OBJETIVOS, PROCEDIMENTOS, PROFISSIONAIS, GALERIA). */
"use strict";

(function () {
  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  const $$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));
  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const moedaCentavos = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  const CHAVE = "ocre-agendamentos";
  const nomeArea = (id) => (AREAS.find((a) => a.id === id) || {}).nome || id;
  const nomeObjetivo = (id) => (OBJETIVOS.find((o) => o.id === id) || {}).nome || id;
  const prof = (id) => PROFISSIONAIS.find((p) => p.id === id);
  const procedimento = (id) => PROCEDIMENTOS.find((p) => p.id === id);

  function el(tag, attrs, filhos) {
    const e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "class") { e.className = attrs[k]; }
        else if (k === "text") { e.textContent = attrs[k]; }
        else if (k === "html") { e.innerHTML = attrs[k]; }
        else if (k.startsWith("on")) { e.addEventListener(k.slice(2), attrs[k]); }
        else if (attrs[k] === false || attrs[k] === null || attrs[k] === undefined) { /* nada */ }
        else if (attrs[k] === true) { e.setAttribute(k, ""); }
        else { e.setAttribute(k, attrs[k]); }
      });
    }
    (filhos || []).forEach((f) => { if (f) { e.append(f); } });
    return e;
  }

  /* ---------- Movimento: revelação ao rolar, parallax do hero, contagem ---------- */
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pendentes = new Set();
  function mostrar(e) {
    e.classList.add("visivel"); pendentes.delete(e);
    if (observador) { observador.unobserve(e); }
    // terminada a entrada, a máscara sai de cena (menos trabalho de pintura e nenhum efeito colateral em capturas)
    setTimeout(() => e.classList.add("revelado"), 1100 + (parseInt(e.style.getPropertyValue("--atraso"), 10) || 0));
  }
  const observador = ("IntersectionObserver" in window) ? new IntersectionObserver((entradas) => {
    // revela ao entrar na tela ou se já passou dela (um pulo de âncora pode saltar o bloco)
    entradas.forEach((en) => { if (en.isIntersecting || en.boundingClientRect.bottom < 0) { mostrar(en.target); } });
  }, { threshold: 0, rootMargin: "0px 0px -12% 0px" }) : null;
  function revelar(lista) {
    if (!observador || semMovimento.matches) { return; }
    lista.forEach((e, i) => {
      if (e.classList.contains("revelar")) { return; }
      e.classList.add("revelar");
      e.style.setProperty("--atraso", (Math.min(i, 8) * 80) + "ms");
      pendentes.add(e);
      observador.observe(e);
    });
  }
  let varrendo = false;
  window.addEventListener("scroll", () => {
    if (varrendo || pendentes.size === 0) { return; }
    varrendo = true;
    requestAnimationFrame(() => {
      varrendo = false;
      pendentes.forEach((e) => { if (e.getBoundingClientRect().bottom < 0) { mostrar(e); } });
    });
  }, { passive: true });
  function parallaxHero() {
    const fig = $("#hero-figura");
    if (!fig || semMovimento.matches) { return; }
    let pedido = false;
    const mover = () => {
      pedido = false;
      const y = window.scrollY || 0;
      fig.style.setProperty("--parallax", (y < window.innerHeight * 1.5 ? Math.round(y * 0.15) : 0) + "px");
    };
    window.addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(mover); } }, { passive: true });
    mover();
  }
  function contarFatos() {
    const alvo = $("#hero-fatos .conta");
    if (!alvo) { return; }
    const fim = Number(alvo.getAttribute("data-conta")) || 0;
    if (semMovimento.matches || !observador) { alvo.textContent = String(fim); return; }
    const io = new IntersectionObserver((entradas) => {
      if (!entradas.some((en) => en.isIntersecting)) { return; }
      io.disconnect();
      const inicio = performance.now();
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / 900);
        alvo.textContent = String(Math.round(fim * (1 - Math.pow(1 - t, 3))));
        if (t < 1) { requestAnimationFrame(passo); }
      };
      requestAnimationFrame(passo);
    }, { threshold: 0.5 });
    io.observe($("#hero-fatos"));
  }

  /* ---------- Menu ---------- */
  const menuBotao = $("#menu-botao");
  const menu = $("#menu");
  menuBotao.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    menuBotao.setAttribute("aria-expanded", String(aberto));
  });
  $$("#menu a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("aberto");
    menuBotao.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Catálogo com filtros ---------- */
  const filtro = { area: "", objetivo: "" };
  const pacote = new Map(); // id -> sessões

  function chip(nome, valor, rotulo, marcado) {
    const input = el("input", { type: "radio", name: nome, value: valor });
    input.checked = !!marcado;
    return el("label", { class: "chip" }, [input, el("span", { text: rotulo })]);
  }
  const chipsArea = $("#chips-area");
  const chipsObjetivo = $("#chips-objetivo");
  chipsArea.append(chip("area", "", "Todas", true));
  AREAS.forEach((a) => chipsArea.append(chip("area", a.id, a.nome)));
  chipsObjetivo.append(chip("objetivo", "", "Todos", true));
  OBJETIVOS.forEach((o) => chipsObjetivo.append(chip("objetivo", o.id, o.nome)));

  $("#filtros").addEventListener("change", (ev) => {
    if (ev.target.name === "area") { filtro.area = ev.target.value; }
    if (ev.target.name === "objetivo") { filtro.objetivo = ev.target.value; }
    renderCatalogo();
  });
  $("#filtros").addEventListener("submit", (ev) => ev.preventDefault());

  function filtrados() {
    return PROCEDIMENTOS.filter((p) =>
      (!filtro.area || p.areas.includes(filtro.area)) &&
      (!filtro.objetivo || p.objetivos.includes(filtro.objetivo)));
  }

  function cartaoProc(p) {
    const noPacote = pacote.has(p.id);
    const add = el("button", {
      type: "button", class: "botao botao-pequeno proc-add" + (noPacote ? " ativo" : ""),
      "aria-pressed": String(noPacote), "data-add": p.id,
      onclick: () => alternarPacote(p.id)
    }, [el("span", { class: "proc-add-texto", text: noPacote ? "No pacote" : "Adicionar ao pacote" }), el("span", { class: "proc-seta", "aria-hidden": "true", text: "→" })]);
    const agendar = el("a", { class: "botao botao-pequeno botao-secundario", href: "#agendar", "data-agendar": p.id, text: p.invasivo ? "Marcar avaliação" : "Agendar", onclick: () => preSelecionar(p.id) });
    const etiquetas = el("div", { class: "etiquetas" }, [
      ...p.areas.map((a) => el("span", { class: "etiqueta", text: nomeArea(a) })),
      p.invasivo ? el("span", { class: "etiqueta etiqueta-avaliacao", text: "Exige avaliação" }) : null
    ]);
    return el("li", { class: "proc" + (noPacote ? " no-pacote" : ""), "data-id": p.id }, [
      el("div", { class: "proc-topo" }, [el("h3", { text: p.nome }), el("p", { class: "proc-preco", text: moeda.format(p.preco) })]),
      el("p", { class: "proc-meta" }, [
        el("span", { text: p.minutos + " min por sessão" }),
        el("span", { text: p.sessoes === 1 ? "Sessão única" : "Ciclo sugerido: " + p.sessoes + " sessões" }),
        el("span", { text: "Com " + p.profissionais.map((id) => prof(id).nome.split(" ")[0]).join(" ou ") })
      ]),
      el("p", { class: "proc-texto", text: p.texto }),
      etiquetas,
      el("div", { class: "proc-acoes" }, [add, agendar])
    ]);
  }

  function renderCatalogo() {
    const lista = $("#catalogo");
    lista.replaceChildren();
    const itens = filtrados();
    const partes = [];
    if (filtro.area) { partes.push(nomeArea(filtro.area)); }
    if (filtro.objetivo) { partes.push(nomeObjetivo(filtro.objetivo).toLowerCase()); }
    $("#filtro-resumo").textContent = itens.length === 0
      ? "Nenhum procedimento combina esses dois filtros."
      : itens.length + (itens.length === 1 ? " procedimento" : " procedimentos") + (partes.length ? " para " + partes.join(", ") : " no total") + ".";
    if (itens.length === 0) {
      lista.append(el("li", { class: "vazio" }, [el("p", { text: "Não temos um procedimento que una essa área e esse objetivo. Tente outra combinação ou fale com a gente na avaliação." })]));
      return;
    }
    if (["abdomen", "pernas", "bracos"].includes(filtro.area)) {
      lista.append(el("li", { class: "catalogo-destaque" }, [
        el("figure", { class: "foto destaque-foto" }, [el("img", { src: "img/procedimentos-corporal.webp", width: "1456", height: "816", loading: "lazy", decoding: "async",
          alt: "Toalhas de linho enroladas, óleo de massagem em frasco âmbar e pedras de basalto quentes sobre bancada de madeira escura, em luz quente de fim de tarde." })]),
        el("div", { class: "destaque-texto" }, [
          el("p", { class: "destaque-chapeu", text: "Cuidado corporal" }),
          el("h3", { text: "Para " + nomeArea(filtro.area).toLowerCase() + ", sessões de 50 a 70 minutos" }),
          el("p", { text: "Drenagem, modeladora e radiofrequência corporal são feitas pela Camila, em ciclos de 8 a 10 sessões. A criolipólise exige avaliação antes." })
        ])
      ]));
    }
    itens.forEach((p) => lista.append(cartaoProc(p)));
    // a revelação ao rolar só vale na primeira montagem; ao filtrar, a lista responde na hora
    if (!renderCatalogo.pronto) { revelar($$(":scope > li", lista)); renderCatalogo.pronto = true; }
  }

  /* ---------- Simulador de pacote ---------- */
  function alternarPacote(id) {
    if (pacote.has(id)) { pacote.delete(id); } else { pacote.set(id, 1); }
    atualizarCartao(id);
    renderPacote();
  }
  function atualizarCartao(id) {
    const li = $('#catalogo .proc[data-id="' + id + '"]');
    if (!li) { return; }
    const ativo = pacote.has(id);
    li.classList.toggle("no-pacote", ativo);
    const b = $(".proc-add", li);
    b.classList.toggle("ativo", ativo);
    b.setAttribute("aria-pressed", String(ativo));
    $(".proc-add-texto", b).textContent = ativo ? "No pacote" : "Adicionar ao pacote";
  }
  function calcularPacote() {
    let subtotal = 0, minutos = 0, sessoesTotal = 0;
    pacote.forEach((sessoes, id) => {
      const p = procedimento(id);
      subtotal += p.preco * sessoes;
      minutos += p.minutos * sessoes;
      sessoesTotal += sessoes;
    });
    const pct = pacote.size >= 3 ? 10 : pacote.size === 2 ? 5 : 0;
    const desconto = Math.round(subtotal * pct / 100);
    return { subtotal, pct, desconto, total: subtotal - desconto, minutos, sessoesTotal };
  }
  function renderPacote() {
    const vazio = $("#pacote-vazio"), lista = $("#pacote-lista"), totais = $("#pacote-totais");
    if (pacote.size === 0) {
      vazio.hidden = false; lista.hidden = true; totais.hidden = true;
      lista.replaceChildren();
      return;
    }
    vazio.hidden = true; lista.hidden = false; totais.hidden = false;
    lista.replaceChildren();
    pacote.forEach((sessoes, id) => {
      const p = procedimento(id);
      const saida = el("output", { text: sessoes + (sessoes === 1 ? " sessão" : " sessões"), "aria-live": "polite" });
      const menos = el("button", { type: "button", "aria-label": "Uma sessão a menos de " + p.nome, text: "−", onclick: () => mudarSessoes(id, -1) });
      const mais = el("button", { type: "button", "aria-label": "Uma sessão a mais de " + p.nome, text: "+", onclick: () => mudarSessoes(id, 1) });
      const remover = el("button", { type: "button", class: "botao botao-texto botao-pequeno", text: "Remover", onclick: () => alternarPacote(id) });
      lista.append(el("li", { class: "pacote-item", "data-id": id }, [
        el("div", {}, [el("p", { class: "pacote-item-nome", text: p.nome }), el("p", { class: "pacote-item-info", text: moeda.format(p.preco) + " por sessão, " + p.minutos + " min" + (p.sessoes > 1 ? ". Ciclo sugerido: " + p.sessoes : "") })]),
        el("p", { class: "pacote-item-valor", text: moeda.format(p.preco * sessoes) }),
        el("div", { class: "pacote-item-controles" }, [el("div", { class: "sessoes" }, [menos, saida, mais]), remover])
      ]));
    });
    const c = calcularPacote();
    $("#pacote-subtotal").textContent = moeda.format(c.subtotal);
    $("#pacote-desconto-pct").textContent = c.pct ? "(" + c.pct + "%)" : "";
    $("#pacote-desconto").textContent = c.desconto ? "− " + moeda.format(c.desconto) : "R$ 0";
    const total = $("#pacote-total");
    total.textContent = moeda.format(c.total);
    total.classList.remove("pulso");
    void total.offsetWidth;
    total.classList.add("pulso");
    const horas = Math.floor(c.minutos / 60), min = c.minutos % 60;
    $("#pacote-tempo").textContent = c.sessoesTotal + (c.sessoesTotal === 1 ? " sessão" : " sessões") + " no total, cerca de " + (horas ? horas + "h" : "") + (min ? (horas ? " " : "") + min + "min" : "") + " de cabine.";
    renderParcela();
  }
  function mudarSessoes(id, delta) {
    const atual = pacote.get(id) || 1;
    const novo = Math.min(12, Math.max(1, atual + delta));
    pacote.set(id, novo);
    renderPacote();
  }
  function renderParcela() {
    const vezes = Number($("#pacote-vezes").value);
    const c = calcularPacote();
    const alvo = $("#pacote-parcela");
    if (vezes <= 1) {
      alvo.replaceChildren(el("span", { text: "À vista: " }), el("strong", { text: moeda.format(c.total) }));
    } else {
      alvo.replaceChildren(el("span", { text: vezes + " vezes de " }), el("strong", { text: moedaCentavos.format(c.total / vezes) }), el("span", { text: " sem juros (simulação)." }));
    }
  }
  $("#pacote-vezes").addEventListener("change", renderParcela);
  $("#pacote-limpar").addEventListener("click", () => {
    const ids = Array.from(pacote.keys());
    pacote.clear();
    ids.forEach(atualizarCartao);
    renderPacote();
  });
  $("#pacote-agendar").addEventListener("click", () => {
    const primeiro = pacote.keys().next().value;
    if (primeiro) { preSelecionar(primeiro); }
  });

  /* ---------- Galeria com comparador ---------- */
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k]));
    return e;
  }
  // gerador pseudoaleatório fixo, para o desenho ser igual para todo mundo
  function rng(semente) {
    let s = semente >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function desenho(tipo, depois) {
    const svg = svgEl("svg", { viewBox: "0 0 400 300", "aria-hidden": "true", focusable: "false" });
    const r = rng(tipo.length * 97 + 13);
    const fundo = svgEl("rect", { width: 400, height: 300, fill: depois ? "#E6CDB7" : "#DCC0A8" });
    svg.append(fundo);
    if (tipo === "textura") {
      const g = svgEl("g", { fill: "#8C3A24", opacity: depois ? 0.18 : 0.5 });
      for (let i = 0; i < 160; i++) {
        const cx = r() * 400, cy = r() * 300;
        const raio = depois ? 1.2 + r() * 1.2 : 1.5 + r() * 4.5;
        g.append(svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: raio.toFixed(1) }));
      }
      svg.append(g);
      if (!depois) {
        const g2 = svgEl("g", { fill: "none", stroke: "#8C3A24", "stroke-width": 1.2, opacity: 0.35 });
        for (let i = 0; i < 14; i++) {
          const x = 20 + r() * 360, y = 20 + r() * 260;
          g2.append(svgEl("path", { d: "M" + x + " " + y + " q " + (10 + r() * 20) + " " + (r() * 30 - 15) + " " + (30 + r() * 40) + " " + (r() * 20 - 10) }));
        }
        svg.append(g2);
      }
    } else if (tipo === "luz") {
      const defs = svgEl("defs");
      const grad = svgEl("radialGradient", { id: "luz-" + (depois ? "d" : "a"), cx: "35%", cy: "30%", r: "70%" });
      grad.append(svgEl("stop", { offset: "0", "stop-color": depois ? "#F6EFE7" : "#E3CBB4", "stop-opacity": depois ? 0.95 : 0.35 }));
      grad.append(svgEl("stop", { offset: "1", "stop-color": "#C68B59", "stop-opacity": 0 }));
      defs.append(grad);
      svg.append(defs);
      svg.append(svgEl("ellipse", { cx: 200, cy: 150, rx: 150, ry: 115, fill: depois ? "#E0B48E" : "#C9A383" }));
      svg.append(svgEl("ellipse", { cx: 200, cy: 150, rx: 150, ry: 115, fill: "url(#luz-" + (depois ? "d" : "a") + ")" }));
      if (!depois) {
        const g = svgEl("g", { fill: "#9A7257", opacity: 0.25 });
        for (let i = 0; i < 40; i++) { g.append(svgEl("circle", { cx: (70 + r() * 260).toFixed(1), cy: (50 + r() * 200).toFixed(1), r: (2 + r() * 3).toFixed(1) })); }
        svg.append(g);
      }
    } else if (tipo === "contorno") {
      const d = depois
        ? "M110 20 C 95 90, 100 140, 120 180 C 135 215, 150 250, 150 300 L 250 300 C 250 250, 265 215, 280 180 C 300 140, 305 90, 290 20 Z"
        : "M110 20 C 85 90, 70 150, 95 190 C 118 228, 130 260, 135 300 L 265 300 C 270 260, 282 228, 305 190 C 330 150, 315 90, 290 20 Z";
      svg.append(svgEl("path", { d, fill: depois ? "#E0B48E" : "#D3A785" }));
      svg.append(svgEl("path", { d, fill: "none", stroke: "#5C6136", "stroke-width": 3, "stroke-dasharray": depois ? "0" : "8 6" }));
      svg.append(svgEl("line", { x1: 40, y1: 190, x2: 360, y2: 190, stroke: "#8C3A24", "stroke-width": 1.5, "stroke-dasharray": "4 6", opacity: 0.6 }));
    } else if (tipo === "manchas") {
      svg.append(svgEl("ellipse", { cx: 200, cy: 150, rx: 160, ry: 120, fill: depois ? "#E0B48E" : "#D8AC88" }));
      const g = svgEl("g", { fill: "#8C5A3C", opacity: depois ? 0.12 : 0.55 });
      for (let i = 0; i < 18; i++) {
        const cx = 90 + r() * 220, cy = 70 + r() * 160;
        const rx = depois ? 6 + r() * 8 : 8 + r() * 22, ry = depois ? 4 + r() * 6 : 6 + r() * 16;
        g.append(svgEl("ellipse", { cx: cx.toFixed(1), cy: cy.toFixed(1), rx: rx.toFixed(1), ry: ry.toFixed(1), transform: "rotate(" + (r() * 60 - 30).toFixed(0) + " " + cx.toFixed(1) + " " + cy.toFixed(1) + ")" }));
      }
      svg.append(g);
    }
    return svg;
  }
  function comparador(item) {
    const antes = desenho(item.tipo, false);
    antes.classList.add("comparador-antes");
    const depois = desenho(item.tipo, true);
    depois.classList.add("comparador-depois");
    const palco = el("div", { class: "comparador-palco" });
    const faixa = el("input", { type: "range", class: "comparador-faixa", min: "0", max: "100", step: "1", value: "50", "aria-label": "Comparar antes e depois: " + item.titulo + ". Esquerda mostra o antes, direita o depois." });
    faixa.addEventListener("input", () => palco.style.setProperty("--corte", faixa.value + "%"));
    palco.append(antes, depois, el("div", { class: "comparador-cabo", "aria-hidden": "true" }),
      el("div", { class: "comparador-rotulos", "aria-hidden": "true" }, [el("span", { text: "Antes" }), el("span", { text: "Depois" })]), faixa);
    return el("article", { class: "comparador", "data-id": item.id }, [
      palco,
      el("h3", { text: item.titulo }),
      el("details", { class: "comparador-detalhe pergunta" }, [
        el("summary", {}, [el("span", { text: "O que a ilustração mostra" }), el("span", { class: "mais", "aria-hidden": "true" })]),
        el("p", { class: "comparador-legenda", text: item.legenda })
      ])
    ]);
  }
  GALERIA.forEach((item) => $("#galeria").append(comparador(item)));
  revelar($$("#galeria > *"));

  /* ---------- Equipe ---------- */
  const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  function retrato(p, classe) {
    return el("figure", { class: "foto retrato " + (classe || "") }, [
      el("img", { src: p.foto, width: "1088", height: "1456", alt: p.fotoAlt, loading: "lazy", decoding: "async" })
    ]);
  }
  PROFISSIONAIS.forEach((p) => {
    $("#equipe").append(el("li", { class: "membro" }, [
      retrato(p, "membro-foto"),
      el("div", { class: "membro-texto-bloco" }, [
        el("p", { class: "membro-nome", text: p.nome }),
        el("p", { class: "membro-titulo", text: p.titulo }),
        el("p", { class: "membro-registro", text: p.registro }),
        el("p", { class: "membro-texto", text: p.texto }),
        el("p", { class: "membro-dias", text: "Atende " + p.dias.map((d) => DIAS_CURTOS[d]).join(", ") })
      ])
    ]));
  });
  revelar($$("#equipe > li"));

  /* ---------- Agendamento ---------- */
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const estado = { proc: null, prof: null, dia: null, hora: null, mes: new Date(hoje.getFullYear(), hoje.getMonth(), 1) };
  const selProc = $("#ag-proc");
  selProc.append(el("option", { value: "", text: "Escolha um procedimento" }));
  PROCEDIMENTOS.forEach((p) => selProc.append(el("option", { value: p.id, text: p.nome + (p.invasivo ? " (avaliação)" : "") })));

  function preSelecionar(id) {
    selProc.value = id;
    aoMudarProc();
  }
  function aoMudarProc() {
    const p = procedimento(selProc.value);
    estado.proc = p || null;
    $("#ag-aviso-invasivo").hidden = !(p && p.invasivo);
    renderProfissionais();
  }
  selProc.addEventListener("change", aoMudarProc);

  function renderProfissionais() {
    const caixa = $("#ag-profissionais");
    caixa.replaceChildren();
    const aptas = estado.proc ? estado.proc.profissionais : PROFISSIONAIS.map((p) => p.id);
    if (estado.prof && !aptas.includes(estado.prof)) { estado.prof = null; }
    $("#ag-prof-dica").textContent = estado.proc ? "Mostramos só quem faz " + estado.proc.nome.toLowerCase() + "." : "Escolha um procedimento para ver quem o faz, ou escolha direto a profissional.";
    PROFISSIONAIS.forEach((p) => {
      const apta = aptas.includes(p.id);
      const input = el("input", { type: "radio", name: "prof", value: p.id });
      input.checked = estado.prof === p.id;
      input.disabled = !apta;
      input.addEventListener("change", () => { estado.prof = p.id; estado.dia = null; estado.hora = null; renderCalendario(); renderHorarios(); });
      caixa.append(el("label", { class: "prof" }, [input, el("span", { class: "prof-cartao" }, [
        el("span", { class: "foto retrato prof-foto" }, [el("img", { src: p.foto, width: "1088", height: "1456", alt: "", loading: "lazy", decoding: "async" })]),
        el("span", {}, [el("span", { class: "prof-nome", text: p.nome }), el("br"), el("span", { class: "prof-titulo", text: p.titulo + ". Atende " + p.dias.map((d) => DIAS_CURTOS[d]).join(", ") + "." }), apta ? null : el("span", { class: "prof-indisponivel", text: " Não faz este procedimento." })])
      ])]));
    });
    renderCalendario();
    renderHorarios();
  }

  function hash(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967296;
  }
  const chaveDia = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  function ocupado(profId, dia, hora) { return hash(profId + chaveDia(dia) + hora) < 0.38; }
  function horariosLivres(profId, dia) {
    const p = prof(profId);
    if (!p || !p.dias.includes(dia.getDay()) || dia <= hoje) { return []; }
    return p.horarios.filter((h) => !ocupado(profId, dia, h));
  }

  function renderCalendario() {
    const grade = $("#cal-grade");
    grade.replaceChildren();
    const m = estado.mes;
    const nomeMes = m.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    $("#cal-mes").textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    $("#cal-anterior").disabled = m <= new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const primeiro = new Date(m.getFullYear(), m.getMonth(), 1);
    const dias = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let i = 0; i < primeiro.getDay(); i++) { grade.append(el("span", { "aria-hidden": "true" })); }
    for (let d = 1; d <= dias; d++) {
      const data = new Date(m.getFullYear(), m.getMonth(), d);
      const livres = estado.prof ? horariosLivres(estado.prof, data) : [];
      const temVaga = livres.length > 0;
      const b = el("button", { type: "button", class: "cal-dia" + (temVaga ? " tem-vaga" : "") + (estado.dia && chaveDia(estado.dia) === chaveDia(data) ? " escolhido" : "") + (chaveDia(data) === chaveDia(hoje) ? " hoje" : ""),
        text: String(d), "aria-label": data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) + (temVaga ? ", " + livres.length + " horários livres" : ", sem horário"),
        "aria-pressed": String(!!(estado.dia && chaveDia(estado.dia) === chaveDia(data))) });
      b.disabled = !temVaga;
      b.addEventListener("click", () => { estado.dia = data; estado.hora = null; renderCalendario(); renderHorarios(); });
      grade.append(b);
    }
  }
  $("#cal-anterior").addEventListener("click", () => { estado.mes = new Date(estado.mes.getFullYear(), estado.mes.getMonth() - 1, 1); renderCalendario(); });
  $("#cal-proximo").addEventListener("click", () => { estado.mes = new Date(estado.mes.getFullYear(), estado.mes.getMonth() + 1, 1); renderCalendario(); });

  function renderHorarios() {
    const lista = $("#horarios-lista");
    const rotulo = $("#horarios-rotulo");
    lista.replaceChildren();
    if (!estado.prof) { rotulo.textContent = "Escolha a profissional para ver a agenda."; return; }
    if (!estado.dia) { rotulo.textContent = "Escolha um dia com ponto para ver os horários."; return; }
    const p = prof(estado.prof);
    rotulo.textContent = "Horários de " + p.nome.split(" ")[0] + " em " + estado.dia.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) + ":";
    p.horarios.forEach((h) => {
      const livre = !ocupado(estado.prof, estado.dia, h);
      const b = el("button", { type: "button", class: "horario" + (estado.hora === h ? " escolhido" : ""), text: h, role: "radio", "aria-checked": String(estado.hora === h), "aria-label": h + (livre ? "" : ", ocupado") });
      b.disabled = !livre;
      b.addEventListener("click", () => { estado.hora = h; renderHorarios(); });
      lista.append(b);
    });
  }

  function lerGuardados() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || "[]"); } catch (e) { return []; }
  }
  function renderGuardados() {
    const itens = lerGuardados();
    const caixa = $("#meus");
    caixa.hidden = itens.length === 0;
    const ul = $("#meus-lista");
    ul.replaceChildren();
    itens.forEach((a) => ul.append(el("li", { text: a.quando + " · " + a.servico + " com " + a.profissional + " · " + a.nome })));
  }
  $("#meus-apagar").addEventListener("click", () => {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    renderGuardados();
  });

  $("#agenda").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const erro = $("#ag-erro");
    const nome = $("#ag-nome").value.trim();
    const fone = $("#ag-fone").value.replace(/\D/g, "");
    const faltas = [];
    if (!estado.proc) { faltas.push("o procedimento"); }
    if (!estado.prof) { faltas.push("a profissional"); }
    if (!estado.dia || !estado.hora) { faltas.push("o dia e o horário"); }
    if (nome.length < 3) { faltas.push("seu nome"); }
    if (fone.length < 10 || fone.length > 11) { faltas.push("um telefone com DDD"); }
    if (faltas.length) {
      erro.textContent = "Falta preencher: " + faltas.join(", ") + ".";
      erro.hidden = false;
      return;
    }
    erro.hidden = true;
    const p = prof(estado.prof);
    const servico = (estado.proc.invasivo ? "Avaliação para " : "") + estado.proc.nome;
    const quando = estado.dia.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) + " às " + estado.hora;
    const linhas = [
      ["Serviço", servico],
      ["Profissional", p.nome + " (" + p.titulo + ")"],
      ["Quando", quando],
      ["Duração", estado.proc.invasivo ? "30 min de avaliação, sem custo" : estado.proc.minutos + " min"],
      ["Valor", estado.proc.invasivo ? "Definido após a avaliação (preço de referência " + moeda.format(estado.proc.preco) + ")" : moeda.format(estado.proc.preco) + " por sessão"],
      ["Nome", nome],
      ["Telefone", fone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3")]
    ];
    const dl = $("#ag-resumo-lista");
    dl.replaceChildren();
    linhas.forEach(([t, d]) => dl.append(el("div", {}, [el("dt", { text: t }), el("dd", { text: d })])));
    if ($("#ag-guardar").checked) {
      try {
        const itens = lerGuardados();
        itens.push({ quando, servico, profissional: p.nome, nome });
        localStorage.setItem(CHAVE, JSON.stringify(itens));
      } catch (e) { /* sem armazenamento */ }
    }
    renderGuardados();
    const resumo = $("#ag-resumo");
    resumo.hidden = false;
    $("#agenda").hidden = true;
    resumo.focus();
    resumo.scrollIntoView({ block: "start" });
  });
  $("#ag-novo").addEventListener("click", () => {
    $("#ag-resumo").hidden = true;
    $("#agenda").hidden = false;
    estado.dia = null; estado.hora = null;
    renderCalendario(); renderHorarios();
    $("#ag-proc").focus();
  });

  /* ---------- Início ---------- */
  revelar($$(".agenda-passo"));
  parallaxHero();
  contarFatos();
  renderCatalogo();
  renderPacote();
  renderProfissionais();
  renderGuardados();
})();
