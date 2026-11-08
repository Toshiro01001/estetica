/* Dados fictícios da Ocre Estética. Nada aqui é real: procedimentos, preços,
   profissionais e agendas foram inventados para a demonstração. */
"use strict";

const AREAS = [
  { id: "rosto", nome: "Rosto" },
  { id: "pescoco", nome: "Pescoço e colo" },
  { id: "abdomen", nome: "Abdômen" },
  { id: "pernas", nome: "Pernas e glúteos" },
  { id: "bracos", nome: "Braços e mãos" }
];

const OBJETIVOS = [
  { id: "hidratar", nome: "Hidratar" },
  { id: "firmar", nome: "Firmar" },
  { id: "manchas", nome: "Uniformizar manchas" },
  { id: "medidas", nome: "Reduzir medidas" },
  { id: "linhas", nome: "Suavizar linhas" },
  { id: "relaxar", nome: "Relaxar" }
];

/* invasivo: true = exige avaliação prévia; só pode ser agendado como avaliação. */
const PROCEDIMENTOS = [
  { id: "limpeza", nome: "Limpeza de pele profunda", areas: ["rosto"], objetivos: ["hidratar", "manchas"], preco: 180, minutos: 75, sessoes: 1, invasivo: false, profissionais: ["helena", "juliana"],
    texto: "Higienização, extração e máscara calmante. Indicada para quem sente a pele pesada ou com poros marcados. Costuma deixar a pele mais lisa ao toque por algumas semanas." },
  { id: "hidrafacial", nome: "Hidratação facial intensiva", areas: ["rosto", "pescoco"], objetivos: ["hidratar"], preco: 220, minutos: 60, sessoes: 3, invasivo: false, profissionais: ["helena", "juliana"],
    texto: "Esfoliação suave, sérum com ácido hialurônico e máscara. Boa para pele ressecada ou sem viço, principalmente no tempo seco de Cuiabá." },
  { id: "peeling-leve", nome: "Peeling químico superficial", areas: ["rosto", "pescoco", "bracos"], objetivos: ["manchas", "linhas"], preco: 260, minutos: 45, sessoes: 4, invasivo: false, profissionais: ["juliana"],
    texto: "Ácidos em baixa concentração que renovam a camada mais externa da pele. Pode ajudar em manchas leves e textura. O resultado varia e aparece ao longo das sessões." },
  { id: "peeling-medio", nome: "Peeling químico médio", areas: ["rosto"], objetivos: ["manchas", "linhas"], preco: 480, minutos: 50, sessoes: 2, invasivo: true, profissionais: ["juliana"],
    texto: "Renovação mais profunda, com descamação visível por alguns dias. Exige avaliação da pele e do histórico antes de qualquer sessão." },
  { id: "microagulhamento", nome: "Microagulhamento", areas: ["rosto", "pescoco"], objetivos: ["linhas", "firmar", "manchas"], preco: 420, minutos: 60, sessoes: 3, invasivo: true, profissionais: ["juliana"],
    texto: "Microperfurações controladas que estimulam colágeno. Indicado para cicatrizes de acne, linhas finas e flacidez leve. Exige avaliação prévia." },
  { id: "toxina", nome: "Toxina botulínica", areas: ["rosto"], objetivos: ["linhas"], preco: 950, minutos: 40, sessoes: 1, invasivo: true, profissionais: ["juliana"],
    texto: "Aplicação em pontos de expressão da testa e ao redor dos olhos. Procedimento injetável, feito só por profissional habilitada, sempre depois de avaliação e anamnese." },
  { id: "preenchimento", nome: "Preenchimento com ácido hialurônico", areas: ["rosto"], objetivos: ["linhas", "firmar"], preco: 1400, minutos: 50, sessoes: 1, invasivo: true, profissionais: ["juliana"],
    texto: "Reposição de volume em lábios, olheiras ou sulcos. Injetável, com avaliação obrigatória e orientações de cuidado antes e depois." },
  { id: "radiofrequencia-rosto", nome: "Radiofrequência facial", areas: ["rosto", "pescoco"], objetivos: ["firmar", "linhas"], preco: 240, minutos: 45, sessoes: 6, invasivo: false, profissionais: ["helena", "juliana"],
    texto: "Aquecimento controlado das camadas profundas para estimular firmeza. Sensação de calor agradável, sem recuperação. Os efeitos costumam ser graduais." },
  { id: "radiofrequencia-corpo", nome: "Radiofrequência corporal", areas: ["abdomen", "pernas", "bracos"], objetivos: ["firmar"], preco: 260, minutos: 50, sessoes: 8, invasivo: false, profissionais: ["camila"],
    texto: "Mesmo princípio da facial, em áreas maiores. Ajuda na firmeza da pele do abdômen, da parte interna dos braços e das coxas." },
  { id: "drenagem", nome: "Drenagem linfática", areas: ["abdomen", "pernas", "bracos"], objetivos: ["relaxar", "medidas"], preco: 150, minutos: 60, sessoes: 10, invasivo: false, profissionais: ["camila", "helena"],
    texto: "Massagem leve e ritmada que ajuda a reduzir inchaço e sensação de peso nas pernas. Muito pedida no pós-operatório e em dias quentes." },
  { id: "modeladora", nome: "Massagem modeladora", areas: ["abdomen", "pernas"], objetivos: ["medidas", "firmar"], preco: 170, minutos: 60, sessoes: 10, invasivo: false, profissionais: ["camila"],
    texto: "Manobras mais firmes que trabalham a circulação local. Pode ajudar no contorno junto com alimentação e movimento. Não substitui nenhum dos dois." },
  { id: "criolipolise", nome: "Criolipólise", areas: ["abdomen", "pernas", "bracos"], objetivos: ["medidas"], preco: 690, minutos: 70, sessoes: 2, invasivo: true, profissionais: ["camila"],
    texto: "Resfriamento controlado de gordura localizada. Exige avaliação para saber se a área e a pele são adequadas. Resultado aparece em semanas e varia de pessoa para pessoa." },
  { id: "pedras", nome: "Massagem relaxante com pedras quentes", areas: ["pescoco", "pernas", "bracos", "abdomen"], objetivos: ["relaxar"], preco: 190, minutos: 70, sessoes: 1, invasivo: false, profissionais: ["camila", "helena"],
    texto: "Pedras de basalto aquecidas em pontos de tensão. Não tem objetivo estético direto; é para parar e respirar por uma hora." },
  { id: "maos", nome: "Hidratação de mãos e colo", areas: ["bracos", "pescoco"], objetivos: ["hidratar", "manchas"], preco: 120, minutos: 35, sessoes: 3, invasivo: false, profissionais: ["helena"],
    texto: "Esfoliação, sérum clareador suave e máscara em áreas que o sol de Mato Grosso castiga mais. Complementa bem qualquer procedimento facial." }
];

/* dias: 0 = domingo ... 6 = sábado. */
const PROFISSIONAIS = [
  { id: "helena", nome: "Helena Barros", titulo: "Esteticista facial", registro: "Registro fictício ET-0101",
    dias: [1, 2, 3, 4, 5], horarios: ["09:00", "10:30", "13:30", "15:00", "16:30"], cor: "ocre",
    texto: "Cuida das limpezas, hidratações e radiofrequência facial. Doze anos de cabine e paciência para ouvir." },
  { id: "juliana", nome: "Juliana Tavares", titulo: "Biomédica esteta", registro: "Registro fictício BM-2020",
    dias: [2, 4, 6], horarios: ["08:30", "10:00", "11:30", "14:00", "15:30"], cor: "argila",
    texto: "Responsável pelos procedimentos injetáveis e pelos peelings. Toda primeira visita com ela é uma avaliação." },
  { id: "camila", nome: "Camila Ferraz", titulo: "Esteticista corporal", registro: "Registro fictício ET-0344",
    dias: [1, 3, 5, 6], horarios: ["08:00", "09:30", "11:00", "14:30", "16:00", "17:30"], cor: "oliva",
    texto: "Drenagem, modeladora, radiofrequência corporal e criolipólise. Especialista em pós-operatório." }
];

/* Galeria: ilustrações abstratas, não fotos. Cada item tem o desenho do "antes" e do "depois". */
const GALERIA = [
  { id: "textura", titulo: "Textura da pele", legenda: "Ilustração do que uma sequência de limpezas e peelings superficiais costuma fazer com a textura: poros e relevo mais uniformes. Varia de pessoa para pessoa.", tipo: "textura" },
  { id: "luz", titulo: "Luminosidade", legenda: "Ilustração de pele opaca e pele hidratada. A hidratação intensiva devolve viço por algumas semanas; não é permanente.", tipo: "luz" },
  { id: "contorno", titulo: "Contorno corporal", legenda: "Ilustração do contorno do abdômen antes e depois de um ciclo de modeladora com radiofrequência. Depende também de alimentação e movimento.", tipo: "contorno" },
  { id: "manchas", titulo: "Manchas e tom", legenda: "Ilustração de manchas solares leves e do tom mais uniforme que peelings superficiais podem trazer, sempre com protetor solar diário.", tipo: "manchas" }
];
