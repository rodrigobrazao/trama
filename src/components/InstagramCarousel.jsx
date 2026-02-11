import { useState, useRef, useEffect } from "react";
import { THREADS, THEME, rng } from "../data/tokens";

const NARRATIVES = [
  {
    id: "conceito",
    title: "O que é a trama?",
    color: THREADS[0],
    slides: [
      { headline: "trama", sub: "jornadas de design · iade · 2025", body: "" },
      { headline: "cruzar", sub: "", body: "Onde diferentes perspectivas do design se encontram. Gráfico, computacional, de produto, de experiência — todos os fios num mesmo tecido." },
      { headline: "entrelaçar", sub: "", body: "Workshops, palestras e debates que ligam teoria e prática, tradição e experimentação, academia e indústria." },
      { headline: "gerar", sub: "15 maio · online · entrada livre", body: "Novas ideias, novas conexões, novas formas. Uma trama que só existe quando todos os fios estão presentes." },
    ],
  },
  {
    id: "oradores",
    title: "Quem vem falar?",
    color: THREADS[1],
    slides: [
      { headline: "6 vozes", sub: "do design contemporâneo", body: "" },
      { headline: "Ana Moreira", sub: "Design Lead · Figma", body: "Sistemas de design à escala — como construir linguagens visuais que sobrevivem ao crescimento." },
      { headline: "Tomás Henriques", sub: "Creative Director · Sagmeister & Walsh", body: "A beleza como função — quando a estética não é decoração mas sim comunicação." },
      { headline: "e mais 4", sub: "15 maio · online · entrada livre", body: "Beatriz Costa (IADE), Miguel Santos (Google), Sofia Almeida (NDISCOVER), Diogo Ferreira (Buck)." },
    ],
  },
  {
    id: "generativo",
    title: "Design generativo",
    color: THREADS[2],
    slides: [
      { headline: "cada trama\né única", sub: "", body: "" },
      { headline: "seed #42", sub: "parâmetros: densidade, amplitude, velocidade", body: "Um sistema de fios horizontais e verticais que se cruzam, ondulam e reagem ao contexto." },
      { headline: "infinito", sub: "cada composição é irrepetível", body: "A mesma lógica gera milhões de variações. Nenhum cartaz é igual. Nenhum momento se repete." },
      { headline: "interactivo", sub: "move o cursor, deforma a trama", body: "trama.rodrigobrazao.pt\n15 maio · online · entrada livre" },
    ],
  },
  {
    id: "workshop",
    title: "Aprende na prática",
    color: THREADS[5],
    slides: [
      { headline: "workshops", sub: "mãos na trama", body: "" },
      { headline: "design\ngenerativo", sub: "Beatriz Costa · 13:30", body: "Introdução ao p5.js e Processing. Cria a tua primeira composição generativa em 90 minutos." },
      { headline: "motion\ndesign", sub: "Diogo Ferreira · 16:30", body: "Do estático ao dinâmico. Como dar vida a um sistema de identidade com After Effects e código." },
      { headline: "inscreve-te", sub: "15 maio · online · entrada livre", body: "trama.rodrigobrazao.pt" },
    ],
  },
];

function CarouselSlide({ slide, narrativeColor, slideIndex, mode, size }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const t = THEME[mode];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const seed = slideIndex * 100 + 42;
    const threadCount = 5 + slideIndex * 2;
    const threads = [];
    for (let i = 0; i < threadCount; i++) {
      threads.push({
        base: (size * (i + 0.5)) / threadCount,
        color: THREADS[Math.floor(rng(seed, i + 300) * THREADS.length)],
        speed: 0.08 + rng(seed, i + 400) * 0.3,
        phase: rng(seed, i + 500) * Math.PI * 2,
        amp: 2 + rng(seed, i + 600) * 12,
        opacity: 0.15 + rng(seed, i + 700) * 0.3,
        thick: 0.4 + rng(seed, i + 800) * 1.5,
      });
    }

    const draw = () => {
      timeRef.current += 0.005;
      const time = timeRef.current;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, size, size);

      // Horizontal threads
      threads.forEach(th => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity;
        ctx.lineWidth = th.thick;
        for (let x = 0; x < size; x += 2) {
          const wave = Math.sin(x * 0.008 + time * th.speed + th.phase) * th.amp;
          const y = th.base + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      // Vertical threads
      threads.forEach(th => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity * 0.7;
        ctx.lineWidth = th.thick * 0.8;
        for (let y = 0; y < size; y += 2) {
          const wave = Math.sin(y * 0.008 + time * th.speed * 0.7 + th.phase + 1) * th.amp * 0.8;
          const x = th.base + wave;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [slideIndex, mode, size]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: size * 0.08, display: "flex", flexDirection: "column", justifyContent: "flex-end",
        background: `linear-gradient(180deg, transparent 30%, ${t.bg}dd 100%)`,
      }}>
        {slide.headline && (
          <div style={{
            fontSize: size * 0.09, fontWeight: 700, lineHeight: 1.1,
            color: slideIndex === 0 ? t.wordmark : narrativeColor,
            whiteSpace: "pre-line", marginBottom: 6,
          }}>
            {slide.headline}
          </div>
        )}
        {slide.sub && (
          <div style={{ fontSize: size * 0.032, color: t.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>
            {slide.sub}
          </div>
        )}
        {slide.body && (
          <div style={{ fontSize: size * 0.035, color: t.textMuted, lineHeight: 1.6, maxWidth: "80%" }}>
            {slide.body}
          </div>
        )}
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: i === slideIndex ? 18 : 6, height: 3, borderRadius: 2,
              background: i === slideIndex ? narrativeColor : t.textDim,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InstagramCarousel({ mode, slideSize = 240 }) {
  const [activeNarrative, setActiveNarrative] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const t = THEME[mode];
  const narrative = NARRATIVES[activeNarrative];

  return (
    <div>
      {/* Narrative tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {NARRATIVES.map((n, i) => (
          <button key={n.id} onClick={() => { setActiveNarrative(i); setActiveSlide(0); }}
            style={{
              background: i === activeNarrative ? `${n.color}15` : "transparent",
              border: `1px solid ${i === activeNarrative ? n.color : t.border}`,
              color: i === activeNarrative ? n.color : t.textMuted,
              padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em",
              fontFamily: "'Roboto Mono', monospace", cursor: "pointer", transition: "all 0.3s",
            }}>
            {n.title}
          </button>
        ))}
      </div>

      {/* Slides */}
      <div style={{ display: "flex", gap: 8, overflow: "auto", paddingBottom: 8 }}>
        {narrative.slides.map((slide, i) => (
          <div key={i} onClick={() => setActiveSlide(i)}
            style={{ opacity: 1, cursor: "pointer", border: `1px solid ${i === activeSlide ? narrative.color : t.border}`, transition: "border 0.3s" }}>
            <CarouselSlide slide={slide} narrativeColor={narrative.color} slideIndex={i} mode={mode} size={slideSize} />
          </div>
        ))}
      </div>

      {/* Specs */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 9, color: t.textDim }}>
        <span>formato: 1080×1080</span>
        <span>4 slides por narrativa</span>
        <span>4 narrativas</span>
        <span>dark + light</span>
      </div>
    </div>
  );
}
