import { useState, useEffect, useRef } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import { generateInteractiveSnapshotSVG, downloadSVG } from "../utils/exportSVG";

const PANEL_PHASES = [
  { id: "void", duration: 3000 },
  { id: "first", duration: 4000 },
  { id: "grow", duration: 4000 },
  { id: "cross", duration: 5000 },
  { id: "weave", duration: 5000 },
  { id: "reveal", duration: 5000 },
  { id: "info", duration: 4000 },
];

export default function InteractivePanel({ mode = "dark", format = "horizontal" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const t = THEME[mode];

  const isVert = format === "vertical";
  const w = isVert ? 180 : 340;
  const h = isVert ? 320 : 191;

  const [phase, setPhase] = useState(0);
  const [started, setStarted] = useState(false);
  const phaseStartRef = useRef(null);

  const handleClick = () => {
    if (!started) {
      setStarted(true);
      phaseStartRef.current = Date.now();
      setPhase(0);
    }
  };

  // Auto-advance
  useEffect(() => {
    if (!started) return;
    phaseStartRef.current = Date.now();
    const dur = PANEL_PHASES[phase].duration;
    const timeout = setTimeout(() => {
      if (phase < PANEL_PHASES.length - 1) setPhase(p => p + 1);
      else { setStarted(false); setPhase(0); }
    }, dur);
    return () => clearTimeout(timeout);
  }, [phase, started]);

  // Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    let time = 0;

    const draw = () => {
      time += 0.008;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, w, h);

      const phaseElapsed = phaseStartRef.current ? (Date.now() - phaseStartRef.current) / 1000 : 0;
      const phaseProgress = Math.min(1, phaseElapsed / (PANEL_PHASES[phase]?.duration / 1000 || 1));

      if (!started) {
        // Idle — pulsing dot
        const pulse = 0.3 + Math.sin(time * 2) * 0.15;
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 4);
        grad.addColorStop(0, `rgba(${t.glow},${pulse})`);
        grad.addColorStop(1, `rgba(${t.glow},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const maxH = phase >= 4 ? 12 : phase >= 2 ? 6 : phase >= 1 ? 2 : 0;
      const maxV = phase >= 3 ? 10 : 0;

      // H threads
      for (let i = 0; i < maxH; i++) {
        const threadFade = Math.min(1, (phaseProgress - i / maxH * 0.4) * 3);
        if (threadFade <= 0) continue;
        const baseY = (h * (i + 0.5)) / maxH;
        ctx.beginPath();
        ctx.strokeStyle = THREADS[i % THREADS.length];
        ctx.globalAlpha = (0.15 + rng(42, i + 700) * 0.4) * threadFade;
        ctx.lineWidth = 0.5 + rng(42, i + 200) * 1.8;
        for (let x = 0; x < w; x += 2) {
          const wave = Math.sin(x * 0.007 + time * (0.1 + rng(42, i + 400) * 0.4) + rng(42, i + 500) * Math.PI * 2) * (3 + rng(42, i + 600) * 12);
          const y = baseY + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // V threads
      for (let i = 0; i < maxV; i++) {
        const threadFade = Math.min(1, (phaseProgress - i / maxV * 0.3) * 3);
        if (threadFade <= 0) continue;
        const baseX = (w * (i + 0.5)) / maxV;
        ctx.beginPath();
        ctx.strokeStyle = THREADS[(i + 2) % THREADS.length];
        ctx.globalAlpha = (0.1 + rng(42, i + 1300) * 0.3) * threadFade;
        ctx.lineWidth = 0.5 + rng(42, i + 800) * 1.8;
        for (let y = 0; y < h; y += 2) {
          const wave = Math.sin(y * 0.007 + time * (0.1 + rng(42, i + 1000) * 0.4) + rng(42, i + 1100) * Math.PI * 2) * (3 + rng(42, i + 1200) * 12);
          const x = baseX + wave;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Intersection glows
      if (phase >= 3 && maxV > 0) {
        ctx.globalAlpha = 1;
        for (let hi = 0; hi < Math.min(maxH, 8); hi++) {
          for (let vi = 0; vi < Math.min(maxV, 8); vi++) {
            const hY = (h * (hi + 0.5)) / maxH;
            const vX = (w * (vi + 0.5)) / maxV;
            if (Math.random() < 0.015) {
              const g = 0.06 + Math.sin(time * 2 + vX * 0.01) * 0.04;
              const r = 2 + g * 4;
              const grad = ctx.createRadialGradient(vX, hY, 0, vX, hY, r);
              grad.addColorStop(0, `rgba(${t.glow},${g * 0.5})`);
              grad.addColorStop(1, `rgba(${t.glow},0)`);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(vX, hY, r, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [w, h, mode, phase, started]);

  // Progress
  const totalDur = PANEL_PHASES.reduce((a, p) => a + p.duration, 0);
  const completedDur = PANEL_PHASES.slice(0, phase).reduce((a, p) => a + p.duration, 0);
  const progressPct = started ? (completedDur / totalDur) * 100 : 0;

  const overlayText = () => {
    if (!started) return { title: "", sub: "toca para iniciar", dim: true };
    switch (PANEL_PHASES[phase]?.id) {
      case "void": return { title: "", sub: "" };
      case "first": return { title: "um fio", sub: "atravessa o vazio" };
      case "grow": return { title: "outros fios", sub: "surgem" };
      case "cross": return { title: "cruzam-se", sub: "nasce a trama" };
      case "weave": return { title: "entrelaçam-se", sub: "ganham forma" };
      case "reveal": return { title: "trama", sub: "jornadas de design", big: true };
      case "info": return { title: "15 maio · online", sub: "entrada livre" };
      default: return { title: "", sub: "" };
    }
  };

  const txt = overlayText();

  const fullW = isVert ? 1080 : 1920;
  const fullH = isVert ? 1920 : 1080;

  return (
    <div style={{
      position: "relative", width: w, height: h, overflow: "hidden",
      border: `1px solid ${t.border}`, cursor: "pointer",
    }} onClick={handleClick}>
      <canvas ref={canvasRef} style={{ width: w, height: h, display: "block" }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        pointerEvents: "none",
        background: phase >= 5 ? `linear-gradient(180deg, transparent 30%, ${t.bg}bb 100%)` : "transparent",
      }}>
        {txt.title && (
          <div style={{
            fontSize: txt.big ? w * 0.14 : w * 0.06, fontWeight: 700,
            color: t.wordmark, textAlign: "center", letterSpacing: txt.big ? "-0.03em" : "0.05em",
            animation: "fadeIn 0.8s ease-out",
            textShadow: `0 0 30px ${t.bg}`,
          }}>{txt.title}</div>
        )}
        {txt.sub && (
          <div style={{
            fontSize: w * 0.03, color: txt.dim ? t.textDim : t.textMuted,
            letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6,
          }}>{txt.sub}</div>
        )}
      </div>
      {started && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: t.border }}>
          <div style={{ height: "100%", background: THREADS[phase % THREADS.length], width: `${progressPct}%`, transition: "width 0.5s ease" }} />
        </div>
      )}
      <div style={{ position: "absolute", top: 6, left: 8 }}>
        <ExportButton mode={mode} label="svg" onClick={(e) => { e.stopPropagation(); downloadSVG(generateInteractiveSnapshotSVG({ width: w * 4, height: h * 4, seed: 42, mode, phase: "weave" }), `trama-interactive-panel-weave-${mode}.svg`); }} />
      </div>
    </div>
  );
}
