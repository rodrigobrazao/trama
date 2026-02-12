import React, { useState, useEffect, useRef } from "react";
import { THREADS, THEME, SPEAKERS, PROGRAMME, rng } from "./data/tokens";
import WeaveCanvas from "./components/WeaveCanvas";
import SpeakerCard from "./components/SpeakerCard";
import TramaQR from "./components/TramaQR";

import InstagramCarousel from "./components/InstagramCarousel";
import LogoGenerator from "./components/LogoGenerator";
import IconSystem from "./components/IconSystem";
import SpeakerBases from "./components/SpeakerBases";
import ProgramPanels from "./components/ProgramPanels";
import SocialProfiles from "./components/SocialProfiles";
import ThreadStudio from "./components/ThreadStudio";
import TeamsAssets from "./components/TeamsAssets";
import DigitalPanels from "./components/DigitalPanels";
import DesignSystemPresentation from "./components/DesignSystemPresentation";
import ExportButton from "./components/ExportButton";
import PDFExport from "./components/PDFExport";
import { generatePaletteSVG, generateGradientSVG, downloadSVG } from "./utils/exportSVG";

function Section({ id, children, theme, noBorder }) {
  const t = THEME[theme];
  return (
    <section id={id} style={{
      padding: "80px 40px", borderBottom: noBorder ? "none" : `1px solid ${t.border}`,
      background: t.bg, color: t.text, transition: "background 0.4s, color 0.4s",
    }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%" }}>{children}</div>
    </section>
  );
}

function SectionLabel({ number, label, color, theme }) {
  const t = THEME[theme];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
      <span style={{ fontSize: 10, color: t.textDim, letterSpacing: "0.1em" }}>{number}</span>
      <div style={{ width: 28, height: 1, background: t.border }} />
      <span style={{ fontSize: 10, color, letterSpacing: "0.25em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function QRGenerator({ theme }) {
  const [qrUrl, setQrUrl] = useState("https://trama.rodrigobrazao.pt");
  const [qrLabel, setQrLabel] = useState("custom");
  const t = THEME[theme];
  const inputStyle = {
    background: t.surface, border: `1px solid ${t.border}`, color: t.text,
    padding: "8px 12px", fontSize: 11, fontFamily: "'Roboto Mono', monospace",
    borderRadius: 2, outline: "none", transition: "border 0.3s",
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Roboto Mono', monospace" }}>url / link</label>
          <input type="text" value={qrUrl} onChange={e => setQrUrl(e.target.value)} placeholder="https://..."
            style={{ ...inputStyle, width: "100%" }}
            onFocus={e => { e.target.style.borderColor = THREADS[2]; }}
            onBlur={e => { e.target.style.borderColor = t.border; }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Roboto Mono', monospace" }}>label</label>
          <input type="text" value={qrLabel} onChange={e => setQrLabel(e.target.value)} placeholder="label"
            style={{ ...inputStyle, width: 120 }}
            onFocus={e => { e.target.style.borderColor = THREADS[2]; }}
            onBlur={e => { e.target.style.borderColor = t.border; }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <TramaQR url={qrUrl} size={180} mode={theme} seed={42} label={qrLabel} realQR={true} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
          <p style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.7, maxWidth: 280, fontFamily: "'Roboto Mono', monospace" }}>
            QR code funcional com estilo trama.<br />
            Introduz qualquer URL e o código é gerado em tempo real, legível por qualquer leitor de QR.
          </p>
          <p style={{ fontSize: 9, color: t.textDim, fontFamily: "'Roboto Mono', monospace" }}>
            finder patterns · cores do sistema<br />
            dados · respiração animada<br />
            erro correction · medium
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Color conversion helpers ───
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, str: `rgb(${r}, ${g}, ${b})` };
}

function hexToHsl(hex) {
  const { r: r0, g: g0, b: b0 } = hexToRgb(hex);
  const r = r0 / 255, g = g0 / 255, b = b0 / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), str: `hsl(${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` };
}

function hexToLab(hex) {
  const { r: r0, g: g0, b: b0 } = hexToRgb(hex);
  // sRGB → linear
  let r = r0 / 255, g = g0 / 255, b = b0 / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  // linear RGB → XYZ (D65)
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
  let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;
  // XYZ → Lab
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + 16 / 116;
  x = f(x); y = f(y); z = f(z);
  const L = Math.round((116 * y - 16) * 10) / 10;
  const a = Math.round((500 * (x - y)) * 10) / 10;
  const bLab = Math.round((200 * (y - z)) * 10) / 10;
  return { L, a, b: bLab, str: `lab(${L}, ${a}, ${bLab})` };
}

function getColorCode(hex, format) {
  if (format === "hex") return hex;
  if (format === "rgb") return hexToRgb(hex).str;
  if (format === "hsl") return hexToHsl(hex).str;
  if (format === "lab") return hexToLab(hex).str;
  return hex;
}

function PresentationEmbed({ theme }) {
  const t = THEME[theme];
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div>
      <div ref={containerRef} style={{
        position: "relative",
        width: "100%",
        maxWidth: 1280,
        aspectRatio: "1280 / 720",
        background: "#000",
        border: `1px solid ${t.border}`,
        overflow: "hidden",
      }}>
        <iframe
          src="/apresentacao_slideshow.html"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          title="Apresentação trama"
          allowFullScreen
        />
        <button
          onClick={toggleFullscreen}
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            border: `1px solid rgba(255,255,255,0.15)`,
            color: "#fff",
            padding: "6px 14px",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'Roboto Mono', monospace",
            cursor: "pointer",
            transition: "all 0.3s",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={e => { e.target.style.background = "rgba(255,60,0,0.5)"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(0,0,0,0.6)"; }}
        >
          {isFullscreen ? "✕ sair" : "⛶ fullscreen"}
        </button>
      </div>
      <div style={{ fontSize: 7, color: t.textDim, letterSpacing: "0.06em", marginTop: 8 }}>
        1280 × 720 · slideshow interactivo
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "identidade", label: "identidade" },
  { id: "construtor", label: "construtor" },
  { id: "logo", label: "logo" },
  { id: "sistema", label: "sistema" },
  { id: "icones", label: "ícones" },
  { id: "oradores", label: "convidados" },
  { id: "bases", label: "bases" },
  { id: "programa", label: "programa" },
  { id: "paineis", label: "painéis" },
  { id: "social", label: "social" },
  { id: "qr", label: "qr" },
  { id: "teams", label: "teams" },
];

export default function App() {
  const theme = "dark";
  const [seed, setSeed] = useState(42);
  const [scrollY, setScrollY] = useState(0);
  const [cW, setCW] = useState(960);
  const [colorFormat, setColorFormat] = useState("hex");
  const [posterSpeed, setPosterSpeed] = useState(3);
  const [posterAnimated, setPosterAnimated] = useState(true);

  const t = THEME[theme];

  useEffect(() => {
    const update = () => setCW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroH = Math.min(560, cW * 0.5);

  const regen = () => setSeed(Math.floor(Math.random() * 9999));
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "'Roboto Mono', monospace", transition: "background 0.4s, color 0.4s", minHeight: "100vh" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${t.bg}; transition: background 0.4s; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${t.bg}; }
        ::-webkit-scrollbar-thumb { background: ${t.textDim}; }
        @media (max-width: 768px) {
          section { padding-left: 16px !important; padding-right: 16px !important; padding-top: 40px !important; padding-bottom: 40px !important; }
          nav { padding-left: 16px !important; padding-right: 16px !important; flex-wrap: wrap !important; gap: 8px !important; }
        }
        @media (max-width: 480px) {
          section { padding-left: 10px !important; padding-right: 10px !important; }
          nav { padding-left: 10px !important; padding-right: 10px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 40px",
        background: scrollY > 60 ? t.navBg : "transparent",
        backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
        borderBottom: scrollY > 60 ? `1px solid ${t.border}` : "1px solid transparent",
        transition: "all 0.4s",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", color: t.text }}>trama</span>
          <span style={{ fontSize: 8, color: t.textMuted, letterSpacing: "0.18em", textTransform: "uppercase" }}>design system v02</span>
        </div>
        <div style={{ display: "flex", gap: cW < 768 ? 8 : 14, alignItems: "center", flexWrap: "wrap", overflow: "auto", maxWidth: cW < 768 ? "100%" : "auto" }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)} style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase",
              color: t.textMuted, fontFamily: "'Roboto Mono', monospace",
            }}>{n.label}</button>
          ))}
          <PDFExport mode={theme} />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", marginTop: 44 }}>
        <WeaveCanvas width={cW} height={heroH} seed={seed} interactive={true} mode={theme} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: cW < 768 ? "0 16px" : "0 40px", pointerEvents: "none",
          background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 40%, ${t.overlay} 100%)`,
        }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", animation: "fadeInUp 1s ease-out" }}>
            <div style={{ fontSize: 9, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20 }}>iade · 1ª edição · 2026</div>
            <h1 style={{ fontSize: Math.min(cW * 0.12, 120), fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.85, margin: 0, color: t.wordmark }}>trama</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
              <div style={{ height: 1, width: 36, background: THREADS[0] }} />
              <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textMuted }}>jornadas de design</span>
            </div>
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: cW < 768 ? "10px 16px" : "10px 40px", background: `${t.bg}bb`, backdropFilter: "blur(6px)", borderTop: `1px solid ${t.border}`, flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ display: "flex", gap: 24, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {[{ c: THREADS[1], l: "15 maio 2026" }, { c: THREADS[2], l: "online" }, { c: THREADS[3], l: "entrada livre" }].map((item, i) => (
              <span key={i} style={{ color: t.textMuted }}><span style={{ color: item.c }}>●</span> {item.l}</span>
            ))}
          </div>
          <button onClick={regen} style={{
            background: "none", border: `1px solid ${t.border}`, color: t.textMuted,
            padding: "5px 12px", fontFamily: "'Roboto Mono', monospace", fontSize: 9, cursor: "pointer",
          }}>↻ #{seed}</button>
        </div>
      </section>

      {/* 01 IDENTIDADE */}
      <Section id="identidade" theme={theme}>
        <SectionLabel number="01" label="Identidade" color={THREADS[0]} theme={theme} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          {[
            { n: "01", title: "Cruzar", text: "Perspectivas que se encontram. Design gráfico, computacional, de produto, de experiência — todos os fios num mesmo tecido.", c: THREADS[0] },
            { n: "02", title: "Entrelaçar", text: "Workshops, palestras e debates que ligam teoria e prática, tradição e experimentação, academia e indústria.", c: THREADS[1] },
            { n: "03", title: "Gerar", text: "Novas ideias, novas conexões, novas formas. Uma trama que só existe quando todos os fios estão presentes.", c: THREADS[2] },
          ].map(item => (
            <div key={item.n}>
              <div style={{ fontSize: 9, color: item.c, letterSpacing: "0.2em", marginBottom: 12 }}>{item.n}</div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", marginBottom: 14 }}>{item.title}</h3>
              <p style={{ fontSize: 11, lineHeight: 1.8, color: t.textMuted }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* APRESENTAÇÃO */}
      <Section id="apresentacao" theme={theme}>
        <SectionLabel number="—" label="Apresentação" color={THREADS[0]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7, maxWidth: 560 }}>
          Apresentação animada de 60 segundos com o conceito, paleta, tipografia, sistema generativo, convidados e formatos do design system trama.
        </p>
        <PresentationEmbed theme={theme} />
      </Section>

      {/* 02 CONSTRUTOR */}
      <Section id="construtor" theme={theme}>
        <SectionLabel number="02" label="Construtor" color={THREADS[3]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
          Módulo de criação de linhas animadas. Controla espessura, quantidade, amplitude, velocidade e cores.
          Preview em tempo real com exportação para SVG, PNG, sequência de frames e vídeo WebM.
        </p>
        <ThreadStudio mode={theme} />
      </Section>

      {/* 03 LOGO */}
      <Section id="logo" theme={theme}>
        <SectionLabel number="03" label="Logo" color={THREADS[1]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
          Logótipo generativo: as hastes das letras funcionam como urdidura (warp), atravessadas por fios coloridos (trama/weft). Cada seed gera uma composição única.
        </p>
        <LogoGenerator mode={theme} />
      </Section>

      {/* 04 DESIGN SYSTEM */}
      <Section id="sistema" theme={theme}>
        <SectionLabel number="04" label="Design System" color={THREADS[2]} theme={theme} />
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>paleta cromática</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["hex", "rgb", "hsl", "lab"].map(fmt => (
                <button key={fmt} onClick={() => setColorFormat(fmt)} style={{
                  background: colorFormat === fmt ? `${THREADS[2]}15` : "transparent",
                  border: `1px solid ${colorFormat === fmt ? THREADS[2] : t.border}`,
                  color: colorFormat === fmt ? THREADS[2] : t.textDim,
                  padding: "3px 8px", fontSize: 7, letterSpacing: "0.08em",
                  fontFamily: "'Roboto Mono', monospace", cursor: "pointer", textTransform: "uppercase",
                  transition: "all 0.2s",
                }}>{fmt}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[...THREADS, THEME.dark.bg].map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 52, height: 52, borderRadius: 3, background: c, border: `1px solid ${t.borderHover}` }} />
                <span style={{ fontSize: 7, color: t.textMuted, maxWidth: 80, textAlign: "center", lineHeight: 1.3, wordBreak: "break-all" }}>{getColorCode(c, colorFormat)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <ExportButton mode={theme} label="svg paleta" onClick={() => downloadSVG(generatePaletteSVG({ mode: theme }), `trama-palette-${theme}.svg`)} />
          </div>

          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>gradiente cromático</div>
          <div style={{
            height: 32, borderRadius: 3, border: `1px solid ${t.borderHover}`,
            background: `linear-gradient(90deg, ${THREADS[0]} 0%, ${THREADS[1]} 20%, ${THREADS[2]} 40%, ${THREADS[3]} 60%, ${THREADS[4]} 80%, ${THREADS[5]} 100%)`,
            marginBottom: 8,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: t.textDim, letterSpacing: "0.08em", marginBottom: 12 }}>
            {THREADS.map((c, i) => <span key={i}>{getColorCode(c, colorFormat)}</span>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <ExportButton mode={theme} label="svg gradiente" onClick={() => downloadSVG(generateGradientSVG({ mode: theme }), `trama-gradient-${theme}.svg`)} />
          </div>

          {/* Tabela de conversão completa */}
          <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>conversão de cores</div>
          <div style={{ border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 1fr 1fr 1fr", gap: 0 }}>
              {/* Header */}
              {["", "hex", "rgb", "hsl", "lab"].map((h, i) => (
                <div key={i} style={{ padding: "6px 8px", fontSize: 7, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${t.border}`, background: t.surface }}>{h}</div>
              ))}
              {/* Rows */}
              {THREADS.map((c, i) => (
                <React.Fragment key={i}>
                  <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", borderBottom: i < THREADS.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 2, background: c }} />
                  </div>
                  {["hex", "rgb", "hsl", "lab"].map(fmt => (
                    <div key={`${i}-${fmt}`} style={{
                      padding: "6px 8px", fontSize: 7, color: t.textMuted,
                      borderBottom: i < THREADS.length - 1 ? `1px solid ${t.border}` : "none",
                      display: "flex", alignItems: "center", cursor: "pointer",
                    }}
                    onClick={() => navigator.clipboard?.writeText(getColorCode(c, fmt))}
                    title="clica para copiar"
                    >
                      {getColorCode(c, fmt)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 7, color: t.textDim, letterSpacing: "0.06em", fontStyle: "italic" }}>
            clica em qualquer valor para copiar
          </div>
        </div>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>tipografia</div>

          {/* ── Roboto Mono ── */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Roboto Mono</span>
              <span style={{ fontSize: 9, color: THREADS[1], letterSpacing: "0.2em", textTransform: "uppercase" }}>primária · monospace</span>
            </div>
            <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.08em", marginBottom: 20 }}>
              Google Fonts · 300 · 400 · 500 · 600 · 700
            </div>

            {/* Specimen */}
            <div style={{ marginBottom: 20, padding: "20px 24px", background: t.surface, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>
                Aa Bb Cc 0123
              </div>
              <div style={{ fontSize: 14, fontWeight: 400, color: t.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&*()
              </div>
              <div style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.08em" }}>
                — A fonte monospace reforça a ideia de código, sistema e construção. Cada caractere ocupa o mesmo espaço, como os fios numa teia.
              </div>
            </div>

            {/* Pesos */}
            <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>pesos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {[
                { w: 300, label: "Light 300", text: "trama · jornadas de design" },
                { w: 400, label: "Regular 400", text: "trama · jornadas de design" },
                { w: 500, label: "Medium 500", text: "trama · jornadas de design" },
                { w: 600, label: "SemiBold 600", text: "trama · jornadas de design" },
                { w: 700, label: "Bold 700", text: "trama · jornadas de design" },
              ].map(item => (
                <div key={item.w} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 8, color: t.textDim, minWidth: 80, letterSpacing: "0.08em" }}>{item.label}</span>
                  <span style={{ fontSize: 18, fontWeight: item.w, letterSpacing: "-0.01em" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Escala de tamanhos */}
            <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>escala de tamanhos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
              {[
                { size: 56, label: "56px", use: "wordmark", ls: "-0.03em", w: 700 },
                { size: 32, label: "32px", use: "título principal", ls: "-0.02em", w: 700 },
                { size: 18, label: "18px", use: "subtítulo", ls: "0em", w: 600 },
                { size: 12, label: "12px", use: "corpo / nomes", ls: "0em", w: 400 },
                { size: 11, label: "11px", use: "corpo secundário", ls: "0em", w: 400 },
                { size: 9, label: "9px", use: "labels / tags", ls: "0.15em", w: 400 },
                { size: 8, label: "8px", use: "captions", ls: "0.1em", w: 400 },
                { size: 7, label: "7px", use: "micro", ls: "0.08em", w: 400 },
              ].map(item => (
                <div key={item.size} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "4px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 7, color: THREADS[1], minWidth: 36, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: item.size, fontWeight: item.w, letterSpacing: item.ls, lineHeight: 1.2 }}>trama</span>
                  <span style={{ fontSize: 7, color: t.textDim, letterSpacing: "0.08em", marginLeft: "auto" }}>{item.use}</span>
                </div>
              ))}
            </div>

            {/* Letter spacing */}
            <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>espaçamento</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {[
                { ls: "-0.03em", label: "-0.03em", use: "wordmark", text: "trama" },
                { ls: "0em", label: "0em", use: "corpo", text: "jornadas de design" },
                { ls: "0.1em", label: "0.1em", use: "botões", text: "EXPORTAR SVG" },
                { ls: "0.15em", label: "0.15em", use: "labels", text: "PALETA CROMÁTICA" },
                { ls: "0.25em", label: "0.25em", use: "secções", text: "DESIGN SYSTEM" },
                { ls: "0.3em", label: "0.3em", use: "accent", text: "IADE · 2026" },
              ].map(item => (
                <div key={item.ls} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "4px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 7, color: THREADS[4], minWidth: 52, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 11, letterSpacing: item.ls, textTransform: item.ls !== "0em" && item.ls !== "-0.03em" ? "uppercase" : "none" }}>{item.text}</span>
                  <span style={{ fontSize: 7, color: t.textDim, letterSpacing: "0.08em", marginLeft: "auto" }}>{item.use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Instrument Serif ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, fontStyle: "italic" }}>Instrument Serif</span>
              <span style={{ fontSize: 9, color: THREADS[3], letterSpacing: "0.2em", textTransform: "uppercase" }}>decorativa · serif</span>
            </div>
            <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.08em", marginBottom: 20 }}>
              Google Fonts · Regular · Italic
            </div>

            {/* Specimen */}
            <div style={{ marginBottom: 20, padding: "20px 24px", background: t.surface, border: `1px solid ${t.border}` }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, fontStyle: "italic", lineHeight: 1.1, marginBottom: 8 }}>
                Aa Bb Cc 0123
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, fontStyle: "italic", color: t.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&*()
              </div>
              <div style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.08em" }}>
                — Contraste com a monospace. Traz humanidade, elegância e movimento — como a trama feita à mão.
              </div>
            </div>

            {/* Variações */}
            <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[3]}`, paddingLeft: 10 }}>variações</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {[
                { style: "normal", label: "Regular", text: "Cruzar, Entrelaçar, Gerar" },
                { style: "italic", label: "Italic", text: "Cruzar, Entrelaçar, Gerar" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 8, color: t.textDim, minWidth: 56, letterSpacing: "0.08em" }}>{item.label}</span>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontStyle: item.style }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Usos da Instrument Serif */}
            <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[3]}`, paddingLeft: 10 }}>uso no sistema</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { use: "Títulos de identidade", example: "Cruzar", size: 28 },
                { use: "Tópicos de convidados", example: "Sistemas de Design à Escala", size: 16 },
                { use: "Citações / destaques", example: "Todos os fios num mesmo tecido", size: 14 },
              ].map((item, i) => (
                <div key={i} style={{ padding: "10px 16px", background: t.surface, border: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 7, color: THREADS[3], letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{item.use}</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: item.size, fontStyle: "italic", color: t.text, lineHeight: 1.3 }}>{item.example}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Composição: as duas fontes juntas ── */}
          <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>composição tipográfica</div>
          <div style={{ padding: "24px 28px", background: t.surface, border: `1px solid ${t.border}`, marginBottom: 12 }}>
            <div style={{ fontSize: 8, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>iade · 2026</div>
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.9, marginBottom: 8 }}>trama</div>
            <div style={{ height: 1.5, width: 40, background: THREADS[0], marginBottom: 10 }} />
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textMuted, marginBottom: 14 }}>jornadas de design</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontStyle: "italic", color: THREADS[0], lineHeight: 1.4 }}>
              Cruzar, Entrelaçar, Gerar
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { font: "Roboto Mono 700", el: "wordmark", c: t.text },
              { font: "Roboto Mono 400", el: "labels", c: t.textMuted },
              { font: "Instrument Serif italic", el: "accent", c: THREADS[0] },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: 7, color: t.textDim, letterSpacing: "0.06em", padding: "4px 10px", border: `1px solid ${t.border}` }}>
                <span style={{ color: item.c }}>●</span> {item.font} → {item.el}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>variações generativas</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, cursor: "pointer" }} onClick={regen}>
            {[seed, seed + 7, seed + 23, seed + 99].map(s => (
              <div key={s} style={{ border: `1px solid ${t.border}`, overflow: "hidden", position: "relative" }}>
                <WeaveCanvas width={Math.floor((Math.min(cW, 1080) - 114) / 4)} height={120} seed={s} interactive={false} mode={theme} />
                <div style={{ position: "absolute", bottom: 4, left: 6, fontSize: 7, color: t.textDim }}>#{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>textura generativa</div>
          <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <WeaveCanvas width={Math.min(cW, 1080) - 130} height={200} seed={seed} interactive={false} mode="dark" />
          </div>
        </div>
      </Section>

      {/* 05 ÍCONES */}
      <Section id="icones" theme={theme}>
        <SectionLabel number="05" label="Sistema de Ícones" color={THREADS[3]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
          Ícones generativos construídos com a linguagem visual dos fios. Subtis fios de fundo animados reforçam a identidade em cada elemento da interface.
        </p>
        <IconSystem mode={theme} />
      </Section>

      {/* 06 ORADORES */}
      <Section id="oradores" theme={theme}>
        <SectionLabel number="06" label="Convidados" color={THREADS[4]} theme={theme} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 40 }}>
          {SPEAKERS.map((s, i) => <SpeakerCard key={i} speaker={s} mode={theme} index={i} />)}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>programa</div>
        {PROGRAMME.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 16, alignItems: "baseline",
            padding: "10px 0", borderBottom: `1px solid ${t.border}`,
            opacity: item.type === "pausa" ? 0.4 : 1,
          }}>
            <span style={{ fontSize: 11, color: item.color, fontWeight: 600, minWidth: 48 }}>{item.time}</span>
            <span style={{ fontSize: 11, flex: 1 }}>{item.title}</span>
            <span style={{ fontSize: 9, color: t.textMuted }}>{item.speaker}</span>
            <span style={{ fontSize: 7, padding: "2px 6px", border: `1px solid ${item.color}30`, color: item.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.type}</span>
          </div>
        ))}
      </Section>

      {/* 07 BASES ORADORES */}
      <Section id="bases" theme={theme}>
        <SectionLabel number="07" label="Bases Convidados" color={THREADS[5]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
          Templates individuais para cada convidado. Nome, título da sessão e instituição sobre fundo generativo com cor accent personalizada.
        </p>
        <SpeakerBases mode={theme} />
      </Section>

      {/* 08 PROGRAMA */}
      <Section id="programa" theme={theme}>
        <SectionLabel number="08" label="Painéis Programa" color={THREADS[0]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
          Programa completo em múltiplos formatos: vertical (stories), horizontal (16:9), quadrado (instagram) e banner (facebook).
        </p>
        <ProgramPanels mode={theme} />
      </Section>

      {/* 09 PAINÉIS DIGITAIS */}
      <Section id="paineis" theme={theme}>
        <SectionLabel number="09" label="Painéis Digitais" color={THREADS[5]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
          Painéis digitais estáticos em formatos horizontal (1920×1080) e vertical (1080×1920) com identidade generativa da trama.
        </p>
        <DigitalPanels mode={theme} />
      </Section>

      {/* 10 REDES SOCIAIS */}
      <Section id="social" theme={theme}>
        <SectionLabel number="10" label="Redes Sociais" color={THREADS[1]} theme={theme} />
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>motion — formatos animados</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 40, alignItems: "flex-end" }}>
          {[{ f: "Story 9:16", w: 120, h: 213 }, { f: "Post 1:1", w: 160, h: 160 }, { f: "Banner 16:9", w: 213, h: 120 }].map(item => (
            <div key={item.f} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
                <WeaveCanvas width={item.w} height={item.h} seed={seed} interactive={false} mode={theme} />
              </div>
              <span style={{ fontSize: 9, color: t.textDim }}>{item.f}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>carrossel instagram</div>
        <InstagramCarousel mode={theme} slideSize={200} />
        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>perfis & carrosseis expandidos</div>
          <SocialProfiles mode={theme} />
        </div>
      </Section>

      {/* 11 QR CODES */}
      <Section id="qr" theme={theme}>
        <SectionLabel number="11" label="QR Codes" color={THREADS[2]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
          QR codes generativos com a linguagem visual da trama. Finder patterns em cores do sistema, dados com respiração animada.
        </p>

        <QRGenerator theme={theme} />
      </Section>

      {/* 12 MICROSOFT TEAMS */}
      <Section id="teams" theme={theme} noBorder>
        <SectionLabel number="12" label="Microsoft Teams" color={THREADS[4]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 32, lineHeight: 1.7, maxWidth: 560 }}>
          Assets para transmissão via Microsoft Teams: separadores de sessão, countdowns e backgrounds virtuais. Todos respeitam a safe area HD (16:9).
        </p>
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setPosterAnimated(!posterAnimated)} style={{
            background: posterAnimated ? `${THREADS[2]}15` : "transparent",
            border: `1px solid ${posterAnimated ? THREADS[2] : t.border}`,
            color: posterAnimated ? THREADS[2] : t.textMuted,
            padding: "6px 14px", fontSize: 9, letterSpacing: "0.1em",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer", transition: "all 0.3s",
          }}>{posterAnimated ? "▶ animado" : "■ estático"}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase" }}>velocidade</span>
            <input type="range" min="0.5" max="15" step="0.5" value={posterSpeed} onChange={e => setPosterSpeed(parseFloat(e.target.value))}
              style={{ width: 100, accentColor: THREADS[4], cursor: "pointer", height: 2 }} />
            <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 28 }}>{posterSpeed}×</span>
          </div>
        </div>
        <TeamsAssets mode={theme} speed={posterSpeed} animated={posterAnimated} />
      </Section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 40px", background: t.bg, borderTop: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.08em" }}>trama</div>
            <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>jornadas de design · iade · 2026</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: t.textDim, letterSpacing: "0.1em" }}>
            <div>sistema de identidade visual · v02</div>
            <div style={{ marginTop: 2 }}>rodrigobrazao.pt</div>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: "16px auto 0", paddingTop: 12, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {THREADS.map((c, i) => <div key={i} style={{ width: 32, height: 2, background: c, opacity: 0.4, borderRadius: 1 }} />)}
          </div>
          <PDFExport mode={theme} />
        </div>
      </footer>
    </div>
  );
}
