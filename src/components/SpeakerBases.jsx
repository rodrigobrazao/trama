import { useState, useRef, useEffect } from "react";
import { THREADS, THEME, SPEAKERS, rng } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import { generateSpeakerSVG, downloadSVG } from "../utils/exportSVG";
import { generateSpeakerBaseHTML, downloadHTML } from "../utils/exportHTML";
import { exportSpeakerBasePNGSequence } from "../utils/exportPNGSequence";

// ─── Animated canvas background for speaker bases ───
function AnimatedSpeakerCanvas({ width, height, seed, mode, speed = 0.3 }) {
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
    const hCount = 12, vCount = 12;
    const hThreads = [], vThreads = [];

    for (let i = 0; i < hCount; i++) {
      hThreads.push({
        baseY: (height * (i + 0.5)) / hCount,
        color: THREADS[Math.floor(rng(seed, i + 300) * THREADS.length)],
        phase: rng(seed, i + 500) * Math.PI * 2,
        amp: 3 + rng(seed, i + 600) * 15,
        opacity: 0.15 + rng(seed, i + 700) * 0.35,
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
        opacity: 0.1 + rng(seed, i + 1300) * 0.3,
        thick: 0.5 + rng(seed, i + 800) * 1.5,
        spd: 0.08 + rng(seed, i + 1000) * 0.25,
      });
    }

    const draw = () => {
      timeRef.current += 0.018 * speed;
      const time = timeRef.current;

      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, width, height);

      // H threads
      hThreads.forEach(th => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity;
        ctx.lineWidth = th.thick;
        for (let x = 0; x < width; x += 2) {
          const wave = Math.sin(x * 0.007 + time * th.spd + th.phase) * th.amp;
          const y = th.baseY + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // V threads
      vThreads.forEach(th => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity * 0.7;
        ctx.lineWidth = th.thick * 0.8;
        for (let y = 0; y < height; y += 2) {
          const wave = Math.sin(y * 0.007 + time * th.spd * 0.8 + th.phase + 1) * th.amp * 0.8;
          const x = th.baseX + wave;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Glows
      ctx.globalAlpha = 1;
      hThreads.forEach(h => {
        vThreads.forEach(v => {
          if (rng(Math.floor(v.baseX) * 100 + Math.floor(h.baseY), seed) < 0.012) {
            const g = 0.08 + Math.sin(time * 2 + v.baseX * 0.01 + h.baseY * 0.01) * 0.06;
            const r2 = 2 + g * 5;
            const grad = ctx.createRadialGradient(v.baseX, h.baseY, 0, v.baseX, h.baseY, r2);
            grad.addColorStop(0, `rgba(${t.glow},${g * 0.5})`);
            grad.addColorStop(1, `rgba(${t.glow},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(v.baseX, h.baseY, r2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [width, height, seed, mode, speed]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

function SpeakerBase({ speaker, format = "horizontal", mode = "dark", seed = 42, animated = false, speed = 1, width: propW }) {
  const t = THEME[mode];
  const isVert = format === "vertical";
  const w = propW || (isVert ? 180 : 340);
  const h = isVert ? Math.round(w * (16 / 9)) : Math.round(w * (9 / 16));
  const fullW = isVert ? 1080 : 1920;
  const fullH = isVert ? 1920 : 1080;

  const BgComponent = animated
    ? <AnimatedSpeakerCanvas width={w} height={h} seed={seed} mode={mode} speed={speed} />
    : <WeaveCanvas width={w} height={h} seed={seed} interactive={false} mode={mode} />;

  const FullBgComponent = animated
    ? <AnimatedSpeakerCanvas width={fullW} height={fullH} seed={seed} mode={mode} speed={speed} />
    : <WeaveCanvas width={fullW} height={fullH} seed={seed} interactive={false} mode={mode} />;

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", border: `1px solid ${t.border}` }}>
      {BgComponent}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: w * 0.06, display: "flex", flexDirection: "column",
        justifyContent: isVert ? "flex-end" : "center",
        background: isVert
          ? `linear-gradient(180deg, transparent 30%, ${t.bg}ee 100%)`
          : `linear-gradient(90deg, ${t.bg}dd 0%, ${t.bg}88 50%, transparent 100%)`,
      }}>
        <div>
          <div style={{ fontSize: w * 0.025, color: speaker.color, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
            convidado
          </div>
          <div style={{
            fontSize: isVert ? w * 0.11 : w * 0.065, fontWeight: 700,
            lineHeight: 1.1, color: t.wordmark, marginBottom: 8,
          }}>
            {speaker.name}
          </div>
          <div style={{ height: 1, width: w * 0.1, background: speaker.color, marginBottom: 8 }} />
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: isVert ? w * 0.065 : w * 0.04, color: speaker.color, marginBottom: 6, lineHeight: 1.3,
          }}>
            {speaker.topic}
          </div>
          <div style={{ fontSize: w * 0.028, color: t.textMuted, letterSpacing: "0.1em" }}>
            {speaker.role} · {speaker.org}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
            {THREADS.map((c, i) => (
              <div key={i} style={{ width: w * 0.04, height: 2, background: c, opacity: i === THREADS.indexOf(speaker.color) ? 0.8 : 0.2, borderRadius: 1 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpeakerBases({ mode }) {
  const t = THEME[mode];
  const [animated, setAnimated] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setAnimated(!animated)} style={{
          background: animated ? `${THREADS[2]}15` : "transparent",
          border: `1px solid ${animated ? THREADS[2] : t.border}`,
          color: animated ? THREADS[2] : t.textMuted,
          padding: "6px 14px", fontSize: 9, letterSpacing: "0.1em",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer", transition: "all 0.3s",
        }}>{animated ? "▶ animado" : "■ estático"}</button>
        {animated && (
          <>
            <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase" }}>velocidade</span>
            <input type="range" min="0.1" max="5" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
              style={{ width: 100, accentColor: THREADS[4], cursor: "pointer", height: 2 }} />
            <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 28 }}>{speed.toFixed(1)}×</span>
          </>
        )}
      </div>

      {/* Horizontal format */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[5]}`, paddingLeft: 10 }}>
        bases convidados — 16:9
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        {SPEAKERS.slice(0, 3).map((s, i) => (
          <div key={i}>
            <SpeakerBase speaker={s} format="horizontal" mode={mode} seed={i * 100 + 42} animated={animated} speed={speed} width={1280} />
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <ExportButton mode={mode} label={`svg ${s.name.split(" ")[0].toLowerCase()}`} onClick={() => downloadSVG(generateSpeakerSVG({ speaker: s, width: 1920, height: 1080, seed: i * 100 + 42, mode }), `trama-speaker-h-${s.name.replace(/\s+/g, "-").toLowerCase()}-${mode}.svg`)} />
              <ExportButton mode={mode} label={`html ${s.name.split(" ")[0].toLowerCase()}`} onClick={() => downloadHTML(generateSpeakerBaseHTML({ speaker: s, seed: i * 100 + 42, mode }), `trama-speaker-h-${s.name.replace(/\s+/g, "-").toLowerCase()}-${mode}.html`)} />
              <ExportButton mode={mode} label="png seq · zip" onClick={() => exportSpeakerBasePNGSequence({ speaker: s, seed: i * 100 + 42, mode, format: "horizontal" })} />
            </div>
          </div>
        ))}
      </div>

      {/* Vertical format */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[5]}`, paddingLeft: 10 }}>
        bases convidados — 9:16
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        {SPEAKERS.slice(0, 3).map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div>
              <SpeakerBase speaker={s} format="vertical" mode={mode} seed={i * 100 + 42} animated={animated} speed={speed} width={720} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <ExportButton mode={mode} label={`svg ${s.name.split(" ")[0].toLowerCase()}`} onClick={() => downloadSVG(generateSpeakerSVG({ speaker: s, width: 1080, height: 1920, seed: i * 100 + 42, mode }), `trama-speaker-v-${s.name.replace(/\s+/g, "-").toLowerCase()}-${mode}.svg`)} />
                <ExportButton mode={mode} label={`html ${s.name.split(" ")[0].toLowerCase()}`} onClick={() => downloadHTML(generateSpeakerBaseHTML({ speaker: s, seed: i * 100 + 42, mode }), `trama-speaker-v-${s.name.replace(/\s+/g, "-").toLowerCase()}-${mode}.html`)} />
                <ExportButton mode={mode} label="png seq · zip" onClick={() => exportSpeakerBasePNGSequence({ speaker: s, seed: i * 100 + 42, mode, format: "vertical" })} />
              </div>
            </div>
            <div>
              <SpeakerBase speaker={s} format="vertical" mode={mode} seed={i * 100 + 42} animated={animated} speed={speed} width={380} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
