// ═══════════════════════════════════════════
// TRAMA — Design Tokens
// ═══════════════════════════════════════════

export const THREADS = ["#ff3c00", "#00e5ff", "#c8ff00", "#ff00aa", "#ff8800", "#7b61ff"];

export const THEME = {
  dark: {
    bg: "#070709",
    surface: "#0c0c10",
    surfaceHover: "#111118",
    text: "#e2ded8",
    textMuted: "#e2ded8",
    textDim: "#8a8a8a",
    border: "rgba(255,255,255,0.06)",
    borderHover: "rgba(255,255,255,0.15)",
    wordmark: "#e2ded8",
    overlay: "rgba(7,7,9,0.5)",
    glow: "255,255,255",
    navBg: "rgba(7,7,9,0.92)",
  },
  light: {
    bg: "#f0ece6",
    surface: "#e8e4dd",
    surfaceHover: "#ddd9d2",
    text: "#1a1a1a",
    textMuted: "#777",
    textDim: "#bbb",
    border: "rgba(0,0,0,0.08)",
    borderHover: "rgba(0,0,0,0.2)",
    wordmark: "#1a1a1a",
    overlay: "rgba(240,236,230,0.5)",
    glow: "0,0,0",
    navBg: "rgba(240,236,230,0.92)",
  },
};

export const SPEAKERS = [
  { name: "Ana Moreira", role: "Design Lead", org: "Figma", topic: "Sistemas de Design à Escala", color: THREADS[0], icon: "◎" },
  { name: "Tomás Henriques", role: "Creative Director", org: "Sagmeister & Walsh", topic: "A Beleza como Função", color: THREADS[1], icon: "△" },
  { name: "Beatriz Costa", role: "Professora", org: "IADE", topic: "O Ensino do Design Generativo", color: THREADS[2], icon: "□" },
  { name: "Miguel Santos", role: "UX Researcher", org: "Google", topic: "Design Inclusivo e Acessibilidade", color: THREADS[3], icon: "◇" },
  { name: "Sofia Almeida", role: "Type Designer", org: "NDISCOVER", topic: "Tipografia Portuguesa Contemporânea", color: THREADS[4], icon: "○" },
  { name: "Diogo Ferreira", role: "Motion Designer", org: "Buck", topic: "Quando o Design se Move", color: THREADS[5], icon: "⬡" },
];

export const PROGRAMME = [
  { time: "09:30", title: "Abertura", speaker: "IADE", type: "abertura", color: THREADS[0] },
  { time: "10:00", title: "Sistemas de Design à Escala", speaker: "Ana Moreira", type: "keynote", color: THREADS[0] },
  { time: "11:00", title: "A Beleza como Função", speaker: "Tomás Henriques", type: "keynote", color: THREADS[1] },
  { time: "12:00", title: "Pausa", speaker: "", type: "pausa", color: THREADS[2] },
  { time: "13:30", title: "O Ensino do Design Generativo", speaker: "Beatriz Costa", type: "workshop", color: THREADS[2] },
  { time: "14:30", title: "Design Inclusivo e Acessibilidade", speaker: "Miguel Santos", type: "palestra", color: THREADS[3] },
  { time: "15:30", title: "Tipografia Portuguesa Contemporânea", speaker: "Sofia Almeida", type: "palestra", color: THREADS[4] },
  { time: "16:30", title: "Quando o Design se Move", speaker: "Diogo Ferreira", type: "workshop", color: THREADS[5] },
  { time: "17:30", title: "Debate de Encerramento", speaker: "Todos os convidados", type: "debate", color: THREADS[0] },
];

export const FORMATS = {
  horizontalHD: { width: 1920, height: 1080 },
  verticalStories: { width: 1080, height: 1920 },
  instagramFeed: { width: 1080, height: 1080 },
  facebookBanner: { width: 820, height: 312 },
};

export const rng = (s, i) => {
  let x = Math.sin(s * 9301 + i * 4973) * 49297;
  return x - Math.floor(x);
};
