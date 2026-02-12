import { useState, useEffect, useRef, useCallback } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import ExportButton from "./ExportButton";
import { generateLogoSVG, downloadSVG, generateAnimationSequenceSVGs, downloadAllSVGs } from "../utils/exportSVG";
import { generateLogoHTML, downloadHTML } from "../utils/exportHTML";
import { exportLogoPNGSequence } from "../utils/exportPNGSequence";

/* ─── Logo Canvas: WeaveCanvas + tipografia sobreposta ─── */
function LogoCanvas({
  width = 640,
  height = 320,
  seed = 42,
  mode = "dark",
  density = "normal",   // "normal" | "dense"
  animate = true,
  showLabels = true,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  // Density multipliers
  const densityMap = {
    normal: { hBase: 8, hExtra: 10, vBase: 8, vExtra: 10 },
    dense:  { hBase: 18, hExtra: 14, vBase: 18, vExtra: 14 },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const t = THEME[mode];
    const d = densityMap[density] || densityMap.normal;

    // Generate threads based on density
    const hCount = d.hBase + Math.floor(rng(seed, 0) * d.hExtra);
    const vCount = d.vBase + Math.floor(rng(seed, 100) * d.vExtra);
    const hThreads = [], vThreads = [];

    for (let i = 0; i < hCount; i++) {
      hThreads.push({
        baseY: (height * (i + 0.5)) / hCount,
        thickness: 0.6 + rng(seed, i + 200) * 2.2,
        color: THREADS[Math.floor(rng(seed, i + 300) * THREADS.length)],
        speed: 0.1 + rng(seed, i + 400) * 0.5,
        phase: rng(seed, i + 500) * Math.PI * 2,
        amplitude: 3 + rng(seed, i + 600) * 16,
        opacity: 0.2 + rng(seed, i + 700) * 0.55,
      });
    }
    for (let i = 0; i < vCount; i++) {
      vThreads.push({
        baseX: (width * (i + 0.5)) / vCount,
        thickness: 0.6 + rng(seed, i + 800) * 2.2,
        color: THREADS[Math.floor(rng(seed, i + 900) * THREADS.length)],
        speed: 0.1 + rng(seed, i + 1000) * 0.5,
        phase: rng(seed, i + 1100) * Math.PI * 2,
        amplitude: 3 + rng(seed, i + 1200) * 16,
        opacity: 0.2 + rng(seed, i + 1300) * 0.55,
      });
    }

    const draw = () => {
      timeRef.current += 0.018;
      const time = timeRef.current;

      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, width, height);

      // Vertical threads
      vThreads.forEach((th) => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity;
        ctx.lineWidth = th.thickness;
        for (let y = 0; y < height; y += 2) {
          const w = Math.sin(y * 0.007 + time * th.speed + th.phase) * th.amplitude;
          const x = th.baseX + w;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Horizontal threads
      hThreads.forEach((th) => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity;
        ctx.lineWidth = th.thickness;
        for (let x = 0; x < width; x += 2) {
          const w = Math.sin(x * 0.007 + time * th.speed + th.phase) * th.amplitude;
          const y = th.baseY + w;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Intersection glows (subtle)
      ctx.globalAlpha = 1;
      hThreads.forEach((h) => {
        vThreads.forEach((v) => {
          if (rng(Math.floor(v.baseX) * 100 + Math.floor(h.baseY), seed) < 0.012) {
            const g = 0.08 + rng(v.baseX + h.baseY, seed + 1) * 0.1;
            const r2 = 2 + g * 5;
            const grad = ctx.createRadialGradient(v.baseX, h.baseY, 0, v.baseX, h.baseY, r2);
            grad.addColorStop(0, `rgba(${t.glow},${g * 0.6})`);
            grad.addColorStop(1, `rgba(${t.glow},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(v.baseX, h.baseY, r2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // ── Typography overlay ──
      ctx.globalAlpha = 1;

      // "trama" wordmark
      const fontSize = Math.min(width * 0.2, height * 0.5);
      ctx.font = `700 ${fontSize}px 'Roboto Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = t.wordmark || t.text;
      ctx.fillText("trama", width / 2, height * 0.48);

      if (showLabels) {
        // "IADE · 1ª EDIÇÃO · 2026" above
        ctx.font = `400 ${Math.max(8, fontSize * 0.08)}px 'Roboto Mono', monospace`;
        ctx.fillStyle = THREADS[0];
        ctx.letterSpacing = "0.3em";
        ctx.globalAlpha = 0.85;
        ctx.fillText("IADE  ·  1ª EDIÇÃO  ·  2026", width / 2, height * 0.48 - fontSize * 0.55);

        // Line + "JORNADAS DE DESIGN" below
        ctx.globalAlpha = 0.5;
        const labelY = height * 0.48 + fontSize * 0.5;
        const lineW = fontSize * 0.25;
        ctx.strokeStyle = THREADS[0];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2 - fontSize * 1.1, labelY);
        ctx.lineTo(width / 2 - fontSize * 1.1 + lineW, labelY);
        ctx.stroke();

        ctx.font = `400 ${Math.max(8, fontSize * 0.09)}px 'Roboto Mono', monospace`;
        ctx.fillStyle = t.textMuted || t.text;
        ctx.globalAlpha = 0.45;
        ctx.textAlign = "left";
        ctx.fillText("JORNADAS DE DESIGN", width / 2 - fontSize * 1.1 + lineW + 10, labelY);
      }

      ctx.globalAlpha = 1;
      ctx.textAlign = "center";

      if (animate) animRef.current = requestAnimationFrame(draw);
    };

    if (animate) animRef.current = requestAnimationFrame(draw);
    else draw();

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [width, height, seed, mode, density, animate, showLabels]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

/* ─── Main LogoGenerator section ─── */
export default function LogoGenerator({ mode }) {
  const [seed, setSeed] = useState(42);
  const [pngSeqProgress, setPngSeqProgress] = useState("");
  const t = THEME[mode];

  const densities = [
    { key: "normal", label: "normal", desc: "8–18 fios" },
  ];

  return (
    <div>
      {/* Three density versions */}
      {densities.map((d, di) => (
        <div key={d.key} style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{
              fontSize: 11, color: THREADS[di], letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>
              densidade {d.label}
            </span>
            <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em" }}>
              ({d.desc})
            </span>
          </div>

          {/* Dark only */}
          <div style={{ border: `1px solid ${t.border}`, overflow: "hidden", position: "relative" }}>
            <LogoCanvas
              width={480}
              height={240}
              seed={seed}
              mode="dark"
              density={d.key}
              animate={di === 0}
              showLabels={true}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
            <ExportButton mode={mode} label="svg dark" onClick={() => downloadSVG(generateLogoSVG({ width: 1920, height: 960, seed, mode: "dark", density: d.key, showLabels: true }), `trama-logo-${d.key}-dark-${seed}.svg`)} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateLogoHTML({ seed, mode: "dark", density: d.key, showLabels: true }), `trama-logo-${d.key}-dark-${seed}.html`)} />
            <ExportButton mode={mode} label="png seq · 25fps · zip" style={{ opacity: pngSeqProgress ? 0.5 : 1 }} onClick={() => {
              if (pngSeqProgress) return;
              setPngSeqProgress("0%");
              exportLogoPNGSequence({ seed, mode: "dark", showLabels: true, onProgress: (f, total) => setPngSeqProgress(`${Math.round(f / total * 100)}%`) }).then(() => setPngSeqProgress("")).catch(() => setPngSeqProgress(""));
            }} />
            {pngSeqProgress && <span style={{ fontSize: 8, color: t.textMuted, letterSpacing: "0.08em" }}>{pngSeqProgress}</span>}
          </div>
        </div>
      ))}

      {/* Seed control */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <button onClick={() => setSeed(Math.floor(Math.random() * 9999))} style={{
          background: "none", border: `1px solid ${t.border}`, color: t.textMuted,
          padding: "5px 12px", fontFamily: "'Roboto Mono', monospace", fontSize: 9,
          letterSpacing: "0.1em", cursor: "pointer",
        }}>↻ #{seed}</button>
        <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em" }}>
          cada seed gera uma composição única
        </span>
      </div>

      {/* Scale variants (normal density) */}
      <div style={{
        fontSize: 11, color: t.textMuted, letterSpacing: "0.15em",
        textTransform: "uppercase", marginBottom: 16,
        borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10,
      }}>escala</div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap" }}>
        {[{ w: 480, h: 240 }, { w: 320, h: 160 }, { w: 200, h: 100 }].map(s => (
          <div key={s.w} style={{ textAlign: "center" }}>
            <div style={{
              border: `1px solid ${t.border}`, display: "inline-block",
              overflow: "hidden",
            }}>
              <LogoCanvas
                width={s.w} height={s.h} seed={seed}
                mode={mode} density="normal" animate={false} showLabels={s.w > 250}
              />
            </div>
            <div style={{ fontSize: 8, color: t.textDim, marginTop: 6, letterSpacing: "0.1em" }}>
              {s.w}×{s.h}
            </div>
          </div>
        ))}
      </div>

      {/* Wordmark only (no labels, clean) */}
      <div style={{
        fontSize: 11, color: t.textMuted, letterSpacing: "0.15em",
        textTransform: "uppercase", marginBottom: 16,
        borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10,
      }}>wordmark isolado</div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
          <LogoCanvas
            width={480} height={180} seed={seed}
            mode="dark" density="normal" animate={false} showLabels={false}
          />
        </div>
      </div>

      {/* Generative variations grid */}
      <div style={{
        fontSize: 11, color: t.textMuted, letterSpacing: "0.15em",
        textTransform: "uppercase", marginBottom: 16,
        borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10,
      }}>variações generativas</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {[seed, seed + 7, seed + 23, seed + 99].map(s => (
          <div key={s} style={{
            border: `1px solid ${t.border}`, overflow: "hidden",
            position: "relative", cursor: "pointer",
          }} onClick={() => setSeed(s)}>
            <LogoCanvas
              width={240} height={120} seed={s}
              mode={mode} density="normal" animate={false} showLabels={false}
            />
            <div style={{
              position: "absolute", bottom: 3, left: 6,
              fontSize: 7, color: t.textDim,
            }}>#{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
