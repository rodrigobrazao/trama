import { useState, useEffect, useRef } from "react";
import { THREADS, THEME, rng } from "../data/tokens";

const PHASES = [
  { id: "void", duration: 5000, title: "", sub: "", instruction: "toca para começar" },
  { id: "first-thread", duration: 6000, title: "um fio", sub: "sozinho, atravessa o vazio", instruction: "" },
  { id: "more-threads", duration: 6000, title: "outros fios", sub: "surgem, cada um com a sua direcção", instruction: "" },
  { id: "cross", duration: 7000, title: "cruzam-se", sub: "onde se encontram, nasce luz", instruction: "" },
  { id: "weave", duration: 7000, title: "entrelaçam-se", sub: "a trama começa a ganhar forma", instruction: "move o dedo" },
  { id: "interact", duration: 8000, title: "reagem", sub: "ao toque, à presença, ao gesto", instruction: "" },
  { id: "reveal", duration: 8000, title: "trama", sub: "jornadas de design", instruction: "" },
  { id: "info", duration: 8000, title: "", sub: "", instruction: "" },
  { id: "end", duration: 5000, title: "", sub: "", instruction: "toca para recomeçar" },
];

export default function InteractiveExperience({ mode, width = 400, height = 600 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: width / 2, y: height / 2 });
  const animRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const phaseStartRef = useRef(null);

  const t = THEME[mode];
  const currentPhase = PHASES[phase];

  const reset = () => {
    setPhase(0);
    setStarted(false);
    setElapsed(0);
    startTimeRef.current = null;
    phaseStartRef.current = null;
  };

  const handleInteract = () => {
    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
      phaseStartRef.current = Date.now();
      setPhase(1);
    } else if (phase === PHASES.length - 1) {
      reset();
    }
  };

  // Auto-advance phases
  useEffect(() => {
    if (!started || phase === 0 || phase === PHASES.length - 1) return;
    phaseStartRef.current = Date.now();
    const dur = PHASES[phase].duration;
    const timeout = setTimeout(() => {
      if (phase < PHASES.length - 1) setPhase(p => p + 1);
    }, dur);
    return () => clearTimeout(timeout);
  }, [phase, started]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onTouch = (e) => {
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch) mouseRef.current = { x: touch.clientX - r.left, y: touch.clientY - r.top };
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: true });

    let time = 0;

    const draw = () => {
      time += 0.008;
      const m = mouseRef.current;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, width, height);

      const phaseElapsed = phaseStartRef.current ? (Date.now() - phaseStartRef.current) / 1000 : 0;
      const phaseProgress = Math.min(1, phaseElapsed / (PHASES[phase]?.duration / 1000 || 1));

      if (!started || phase === 0) {
        // Void — single pulsing dot
        const pulse = 0.3 + Math.sin(time * 2) * 0.15;
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 6);
        grad.addColorStop(0, `rgba(${t.glow},${pulse})`);
        grad.addColorStop(1, `rgba(${t.glow},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const maxThreads = phase >= 7 ? 14 : phase >= 5 ? 12 : phase >= 3 ? 8 : phase >= 2 ? 4 : 1;
      const showVertical = phase >= 3;
      const showInteraction = phase >= 4;
      const showGlow = phase >= 3;
      const fadeIn = Math.min(1, phaseProgress * 2);

      // Horizontal threads
      for (let i = 0; i < maxThreads; i++) {
        const threadFade = Math.min(1, (phaseProgress - i / maxThreads * 0.5) * 4);
        if (threadFade <= 0) continue;

        const baseY = (height * (i + 0.5)) / maxThreads;
        const color = THREADS[i % THREADS.length];
        const speed = 0.1 + rng(42, i + 400) * 0.4;
        const amp = 3 + rng(42, i + 600) * 14;
        const thick = 0.5 + rng(42, i + 200) * 2;
        const opacity = (0.15 + rng(42, i + 700) * 0.45) * threadFade;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = thick;

        for (let x = 0; x < width; x += 2) {
          const d = showInteraction ? Math.sqrt((x - m.x) ** 2 + (baseY - m.y) ** 2) : 999;
          const mi = showInteraction ? Math.max(0, 1 - d / 140) : 0;
          const wave = Math.sin(x * 0.007 + time * speed + rng(42, i + 500) * Math.PI * 2) * amp;
          const md = mi * 30 * Math.sign(baseY - m.y);
          const y = baseY + wave * (1 + mi * 2) + md;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Vertical threads
      if (showVertical) {
        const vFade = Math.min(1, phaseProgress * 3);
        for (let i = 0; i < maxThreads; i++) {
          const threadFade = Math.min(1, (phaseProgress - i / maxThreads * 0.3) * 3) * vFade;
          if (threadFade <= 0) continue;

          const baseX = (width * (i + 0.5)) / maxThreads;
          const color = THREADS[(i + 2) % THREADS.length];
          const speed = 0.1 + rng(42, i + 1000) * 0.4;
          const amp = 3 + rng(42, i + 1200) * 14;
          const thick = 0.5 + rng(42, i + 800) * 2;
          const opacity = (0.12 + rng(42, i + 1300) * 0.35) * threadFade;

          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = thick;

          for (let y = 0; y < height; y += 2) {
            const d = showInteraction ? Math.sqrt((baseX - m.x) ** 2 + (y - m.y) ** 2) : 999;
            const mi = showInteraction ? Math.max(0, 1 - d / 140) : 0;
            const wave = Math.sin(y * 0.007 + time * speed + rng(42, i + 1100) * Math.PI * 2) * amp;
            const md = mi * 30 * Math.sign(baseX - m.x);
            const x = baseX + wave * (1 + mi * 2) + md;
            y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // Intersection glows
      if (showGlow && showVertical) {
        ctx.globalAlpha = 1;
        for (let h = 0; h < Math.min(maxThreads, 8); h++) {
          for (let v = 0; v < Math.min(maxThreads, 8); v++) {
            const hY = (height * (h + 0.5)) / maxThreads;
            const vX = (width * (v + 0.5)) / maxThreads;
            const d = showInteraction ? Math.sqrt((vX - m.x) ** 2 + (hY - m.y) ** 2) : 999;
            const mi = showInteraction ? Math.max(0, 1 - d / 150) : 0;
            if (mi > 0.08 || Math.random() < 0.008) {
              const g = showInteraction ? mi : 0.06 + Math.sin(time * 2 + vX * 0.01) * 0.04;
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
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouch);
    };
  }, [width, height, mode, phase, started]);

  // Progress bar
  const totalDuration = PHASES.reduce((a, p) => a + p.duration, 0);
  const completedDuration = PHASES.slice(0, phase).reduce((a, p) => a + p.duration, 0);
  const progressPct = (completedDuration / totalDuration) * 100;

  return (
    <div
      style={{
        position: "relative", width, height, overflow: "hidden",
        border: `1px solid ${t.border}`, cursor: "pointer",
        userSelect: "none", touchAction: "none",
      }}
      onClick={handleInteract}
    >
      <canvas ref={canvasRef} style={{ width, height, display: "block" }} />

      {/* Overlay text */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        pointerEvents: "none",
        background: phase >= 6 ? `linear-gradient(180deg, transparent 30%, ${t.bg}bb 100%)` : "transparent",
      }}>
        {currentPhase.title && (
          <div style={{
            fontSize: phase === 6 ? width * 0.16 : width * 0.065,
            fontWeight: 700, color: t.wordmark, textAlign: "center",
            letterSpacing: phase === 6 ? "-0.03em" : "0.05em",
            animation: "fadeIn 0.8s ease-out",
            textShadow: `0 0 40px ${t.bg}`,
          }}>
            {currentPhase.title}
          </div>
        )}
        {currentPhase.sub && (
          <div style={{
            fontSize: width * 0.032, color: t.textMuted,
            letterSpacing: "0.15em", textTransform: phase === 6 ? "uppercase" : "none",
            marginTop: 8, animation: "fadeIn 1s ease-out 0.3s both",
          }}>
            {currentPhase.sub}
          </div>
        )}
        {currentPhase.instruction && (
          <div style={{
            fontSize: width * 0.028, color: t.textDim,
            position: "absolute", bottom: height * 0.08,
            letterSpacing: "0.2em", textTransform: "uppercase",
            animation: "fadeIn 1s ease-out",
          }}>
            {currentPhase.instruction}
          </div>
        )}

        {/* Phase 7: info */}
        {phase === 7 && (
          <div style={{ textAlign: "center", animation: "fadeIn 1s ease-out" }}>
            <div style={{ fontSize: width * 0.035, color: t.textMuted, marginBottom: 4, letterSpacing: "0.1em" }}>15 maio 2025 · online · entrada livre</div>
            <div style={{ fontSize: width * 0.025, color: t.textDim, letterSpacing: "0.15em", textTransform: "uppercase" }}>iade · jornadas de design</div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 16 }}>
              {THREADS.map((c, i) => (
                <div key={i} style={{ width: 14, height: 2, background: c, opacity: 0.5, borderRadius: 1 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {started && phase < PHASES.length - 1 && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: t.border,
        }}>
          <div style={{
            height: "100%", background: THREADS[phase % THREADS.length],
            width: `${progressPct}%`, transition: "width 0.5s ease",
          }} />
        </div>
      )}

      {/* Phase indicator */}
      {started && (
        <div style={{
          position: "absolute", top: 10, right: 12,
          fontSize: 8, color: t.textDim, letterSpacing: "0.1em",
        }}>
          {phase}/{PHASES.length - 1}
        </div>
      )}
    </div>
  );
}
