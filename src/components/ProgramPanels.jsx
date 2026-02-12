import { useState, useRef, useEffect } from "react";
import { THREADS, THEME, PROGRAMME, rng } from "../data/tokens";
import ExportButton from "./ExportButton";
import { generateProgramSVG, downloadSVG } from "../utils/exportSVG";
import { generateProgramHTML, downloadHTML } from "../utils/exportHTML";

// ─── Animated canvas background for program panels ───
function AnimatedProgramCanvas({ width, height, seed, mode, speed = 1, opacity = 1, density = 12, animated = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const t = THEME[mode];
    const hCount = density, vCount = density;
    const hThreads = [], vThreads = [];

    for (let i = 0; i < hCount; i++) {
      hThreads.push({
        baseY: (height * (i + 0.5)) / hCount,
        color: THREADS[Math.floor(rng(seed, i + 300) * THREADS.length)],
        phase: rng(seed, i + 500) * Math.PI * 2,
        amp: 3 + rng(seed, i + 600) * 15,
        baseOpacity: 0.15 + rng(seed, i + 700) * 0.35,
        thick: 0.5 + rng(seed, i + 200) * 1.5,
        spd: 0.1 + rng(seed, i + 400) * 0.3,
      });
    }
    for (let i = 0; i < vCount; i++) {
      vThreads.push({
        baseX: (width * (i + 0.5)) / vCount,
        color: THREADS[Math.floor(rng(seed, i + 900) * THREADS.length)],
        phase: rng(seed, i + 1100) * Math.PI * 2,
        amp: 3 + rng(seed, i + 1200) * 15,
        baseOpacity: 0.1 + rng(seed, i + 1300) * 0.3,
        thick: 0.5 + rng(seed, i + 800) * 1.5,
        spd: 0.08 + rng(seed, i + 1000) * 0.25,
      });
    }

    const draw = () => {
      if (animated) timeRef.current += 0.018 * speed;
      const time = timeRef.current;

      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, width, height);

      hThreads.forEach(th => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = th.thick;
        for (let x = 0; x < width; x += 2) {
          const wave = Math.sin(x * 0.007 + time * th.spd + th.phase) * th.amp;
          const y = th.baseY + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      vThreads.forEach(th => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = opacity * 0.7;
        ctx.lineWidth = th.thick * 0.8;
        for (let y = 0; y < height; y += 2) {
          const wave = Math.sin(y * 0.007 + time * th.spd * 0.8 + th.phase + 1) * th.amp * 0.8;
          const x = th.baseX + wave;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [width, height, seed, mode, speed, opacity, density, animated]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

function ProgramPanelContent({ width, height, format, mode, seed, speed, bgOpacity, density, animated }) {
  const t = THEME[mode];
  const isCompact = format === "facebook" || format === "instagram";
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <AnimatedProgramCanvas width={width} height={height} seed={seed} mode={mode} speed={speed} opacity={bgOpacity} density={density} animated={animated} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: width * 0.04,
        display: "flex", flexDirection: "column",
        justifyContent: format === "vertical" ? "flex-start" : "center",
        background: format === "vertical"
          ? `linear-gradient(180deg, transparent 30%, ${t.bg}ee 100%)`
          : `linear-gradient(90deg, ${t.bg}dd 0%, ${t.bg}88 50%, transparent 100%)`,
      }}>
        {/* Header */}
        <div style={{ marginBottom: isCompact ? 4 : format === "vertical" ? 10 : 6, flexShrink: 0 }}>
          <div style={{ fontSize: Math.max(5, width * 0.025), color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase" }}>
            iade · 2026
          </div>
          <div style={{
            fontSize: Math.max(8, format === "vertical" ? width * 0.06 : width * 0.045), fontWeight: 700, lineHeight: 0.9,
            color: t.wordmark, letterSpacing: "-0.03em", marginTop: 3,
          }}>
            trama
          </div>
          <div style={{
            fontSize: Math.max(4, width * 0.02), letterSpacing: "0.15em", textTransform: "uppercase",
            color: t.textMuted, marginTop: 3,
          }}>
            programa · jornadas de design
          </div>
          <div style={{ height: 1, width: width * 0.08, background: THREADS[0], marginTop: 4 }} />
        </div>

        {/* Programme items */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {PROGRAMME.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: Math.max(3, width * 0.015), alignItems: "center",
              padding: `${Math.max(1, width * 0.003)}px 0`,
              borderBottom: `1px solid ${t.border}`,
              opacity: item.type === "pausa" ? 0.4 : 1,
            }}>
              <span style={{
                fontSize: Math.max(4, width * 0.022), color: item.color, fontWeight: 600,
                minWidth: Math.max(16, width * 0.08),
              }}>{item.time}</span>
              <span style={{
                fontSize: Math.max(4, width * 0.02), flex: 1, color: t.text,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{item.title}</span>
              {!isCompact && item.speaker && item.type !== "pausa" && (
                <span style={{
                  fontSize: Math.max(3, width * 0.016), color: t.text,
                  border: `1px solid ${item.color}60`,
                  padding: `${Math.max(1, width * 0.003)}px ${Math.max(2, width * 0.008)}px`,
                  whiteSpace: "nowrap",
                }}>
                  {item.speaker}
                </span>
              )}
              {!isCompact && item.speaker && item.type === "pausa" && (
                <span style={{ fontSize: Math.max(3, width * 0.016), color: t.textMuted }}>
                  {item.speaker}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer threads */}
        <div style={{ display: "flex", gap: 2, marginTop: 4, flexShrink: 0 }}>
          {THREADS.map((c, i) => (
            <div key={i} style={{ width: width * 0.04, height: 1.5, background: c, opacity: 0.4, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramPanel({ format, mode = "dark", seed = 42, animated = true, speed = 1, bgOpacity = 1, density = 12, width: propW }) {
  const t = THEME[mode];
  const ratios = { vertical: 16 / 9, horizontal: 9 / 16, instagram: 1, facebook: 312 / 820 };
  const defaultDims = {
    vertical: { w: 180, h: 320 },
    horizontal: { w: 340, h: 191 },
    instagram: { w: 200, h: 200 },
    facebook: { w: 280, h: 107 },
  };
  const w = propW || defaultDims[format].w;
  const h = propW ? Math.round(propW * ratios[format]) : defaultDims[format].h;
  const fullDims = { vertical: { w: 1080, h: 1920 }, horizontal: { w: 1920, h: 1080 }, instagram: { w: 1080, h: 1080 }, facebook: { w: 820, h: 312 } };
  const fullW = fullDims[format].w;
  const fullH = fullDims[format].h;

  return (
    <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
      <ProgramPanelContent width={w} height={h} format={format} mode={mode} seed={seed} speed={speed} bgOpacity={bgOpacity} density={density} animated={animated} />
    </div>
  );
}

export default function ProgramPanels({ mode }) {
  const t = THEME[mode];
  const [animated, setAnimated] = useState(true);
  const [speed, setSpeed] = useState(3);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [density, setDensity] = useState(12);
  const [seed, setSeed] = useState(42);

  const randomize = () => {
    setDensity(Math.floor(4 + Math.random() * 30));
    setSeed(Math.floor(Math.random() * 9999));
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setAnimated(!animated)} style={{
          background: animated ? `${THREADS[2]}15` : "transparent",
          border: `1px solid ${animated ? THREADS[2] : t.border}`,
          color: animated ? THREADS[2] : t.textMuted,
          padding: "6px 14px", fontSize: 9, letterSpacing: "0.1em",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer", transition: "all 0.3s",
        }}>{animated ? "▶ animado" : "■ estático"}</button>

        {/* Speed */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase" }}>velocidade</span>
          <input type="range" min="0.5" max="10" step="0.5" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: THREADS[4], cursor: "pointer", height: 2 }} />
          <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 28 }}>{speed}×</span>
        </div>

        <div style={{ width: 1, height: 16, background: t.border }} />

        {/* Opacity */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase" }}>opacidade</span>
          <input type="range" min="0" max="1" step="0.05" value={bgOpacity} onChange={e => setBgOpacity(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: THREADS[1], cursor: "pointer", height: 2 }} />
          <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 28 }}>{Math.round(bgOpacity * 100)}%</span>
        </div>

        {/* Density */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase" }}>densidade</span>
          <input type="range" min="2" max="40" step="1" value={density} onChange={e => setDensity(parseInt(e.target.value))}
            style={{ width: 80, accentColor: THREADS[3], cursor: "pointer", height: 2 }} />
          <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 20 }}>{density}</span>
        </div>

        {/* Seed */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase" }}>seed</span>
          <span style={{ fontSize: 9, color: t.text, fontFamily: "'Roboto Mono', monospace" }}>{seed}</span>
        </div>

        {/* Random */}
        <button onClick={randomize} style={{
          background: `${THREADS[2]}15`, border: `1px solid ${THREADS[2]}40`, color: THREADS[2],
          padding: "4px 12px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>↻ random</button>

        {/* Reset */}
        <button onClick={() => { setDensity(12); setSeed(42); setSpeed(3); setBgOpacity(1); setAnimated(true); }} style={{
          background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
          padding: "4px 12px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>reset</button>
      </div>

      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>
        painel vertical · 1080 × 1920
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        <div>
          <ProgramPanel format="vertical" mode="dark" seed={seed} animated={animated} speed={speed} bgOpacity={bgOpacity} density={density} width={720} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark" onClick={() => downloadSVG(generateProgramSVG({ width: 1080, height: 1920, seed, mode: "dark" }), "trama-program-vertical-dark.svg")} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateProgramHTML({ seed, mode: "dark" }), `trama-program-dark-${seed}.html`)} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>
        painel horizontal · 1920 × 1080
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        <div>
          <ProgramPanel format="horizontal" mode="dark" seed={seed} animated={animated} speed={speed} bgOpacity={bgOpacity} density={density} width={1280} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark" onClick={() => downloadSVG(generateProgramSVG({ width: 1920, height: 1080, seed, mode: "dark" }), "trama-program-horizontal-dark.svg")} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateProgramHTML({ seed, mode: "dark" }), `trama-program-h-dark-${seed}.html`)} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>
        versão instagram · 1080 × 1080
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        <div>
          <ProgramPanel format="instagram" mode="dark" seed={seed} animated={animated} speed={speed} bgOpacity={bgOpacity} density={density} width={540} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark" onClick={() => downloadSVG(generateProgramSVG({ width: 1080, height: 1080, seed, mode: "dark" }), "trama-program-instagram-dark.svg")} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateProgramHTML({ seed, mode: "dark" }), `trama-program-ig-dark-${seed}.html`)} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>
        banner facebook · 820 × 312
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        <div>
          <ProgramPanel format="facebook" mode="dark" seed={seed} animated={animated} speed={speed} bgOpacity={bgOpacity} density={density} width={820} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark" onClick={() => downloadSVG(generateProgramSVG({ width: 820, height: 312, seed, mode: "dark" }), "trama-program-facebook-dark.svg")} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateProgramHTML({ seed, mode: "dark" }), `trama-program-fb-dark-${seed}.html`)} />
          </div>
        </div>
      </div>
    </div>
  );
}
