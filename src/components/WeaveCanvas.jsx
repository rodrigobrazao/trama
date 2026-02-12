import { useEffect, useRef, useCallback } from "react";
import { THREADS, THEME, rng } from "../data/tokens";

export default function WeaveCanvas({ width, height, seed, interactive, mode, style, overlay, speed = 1, animated = true }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: width / 2, y: height / 2 });
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

    const t = THEME[mode || "dark"];
    const hCount = 8 + Math.floor(rng(seed, 0) * 10);
    const vCount = 8 + Math.floor(rng(seed, 100) * 10);
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

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onTouch = (e) => {
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch) mouseRef.current = { x: touch.clientX - r.left, y: touch.clientY - r.top };
    };
    if (interactive) {
      canvas.addEventListener("mousemove", onMove);
      canvas.addEventListener("touchmove", onTouch, { passive: true });
    }

    const draw = () => {
      if (animated) timeRef.current += 0.018 * speed;
      const time = timeRef.current;
      const m = mouseRef.current;

      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, width, height);

      vThreads.forEach((th) => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity;
        ctx.lineWidth = th.thickness;
        for (let y = 0; y < height; y += 2) {
          const d = interactive ? Math.sqrt((th.baseX - m.x) ** 2 + (y - m.y) ** 2) : 999;
          const mi = interactive ? Math.max(0, 1 - d / 150) : 0;
          const w = Math.sin(y * 0.007 + time * th.speed + th.phase) * th.amplitude;
          const md = mi * 35 * Math.sign(th.baseX - m.x);
          const x = th.baseX + w * (1 + mi * 2.5) + md;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      hThreads.forEach((th) => {
        ctx.beginPath();
        ctx.strokeStyle = th.color;
        ctx.globalAlpha = th.opacity;
        ctx.lineWidth = th.thickness;
        for (let x = 0; x < width; x += 2) {
          const d = interactive ? Math.sqrt((x - m.x) ** 2 + (th.baseY - m.y) ** 2) : 999;
          const mi = interactive ? Math.max(0, 1 - d / 150) : 0;
          const w = Math.sin(x * 0.007 + time * th.speed + th.phase) * th.amplitude;
          const md = mi * 35 * Math.sign(th.baseY - m.y);
          const y = th.baseY + w * (1 + mi * 2.5) + md;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      hThreads.forEach((h) => {
        vThreads.forEach((v) => {
          const d = interactive ? Math.sqrt((v.baseX - m.x) ** 2 + (h.baseY - m.y) ** 2) : 999;
          const mi = interactive ? Math.max(0, 1 - d / 180) : 0;
          if (mi > 0.1 || (!interactive && rng(Math.floor(v.baseX) * 100 + Math.floor(h.baseY), seed) < 0.012)) {
            const g = interactive ? mi : 0.08 + rng(v.baseX + h.baseY, seed + 1) * 0.1;
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

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (interactive) {
        canvas.removeEventListener("mousemove", onMove);
        canvas.removeEventListener("touchmove", onTouch);
      }
    };
  }, [width, height, seed, interactive, mode, speed, animated]);

  return (
    <div style={{ position: "relative", width, height, ...style }}>
      <canvas ref={canvasRef} style={{ width, height, display: "block", cursor: interactive ? "crosshair" : "default" }} />
      {overlay}
    </div>
  );
}
