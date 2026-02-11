import { useRef, useEffect } from "react";
import { THREADS, THEME, rng } from "../data/tokens";

function MiniWeave({ size, seed, color, mode }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const t = THEME[mode];

    const draw = () => {
      timeRef.current += 0.01;
      const time = timeRef.current;
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < 6; i++) {
        const baseY = (size * (i + 0.5)) / 6;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.15 + rng(seed, i + 50) * 0.3;
        ctx.lineWidth = 0.5 + rng(seed, i + 60) * 1;
        for (let x = 0; x < size; x += 1.5) {
          const wave = Math.sin(x * 0.02 + time * (0.3 + rng(seed, i) * 0.4) + i * 1.2) * (3 + rng(seed, i + 10) * 8);
          const y = baseY + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const baseX = (size * (i + 0.5)) / 6;
        ctx.beginPath();
        ctx.strokeStyle = THREADS[(Math.floor(rng(seed, i + 200) * THREADS.length))];
        ctx.globalAlpha = 0.1 + rng(seed, i + 70) * 0.2;
        ctx.lineWidth = 0.5 + rng(seed, i + 80) * 1;
        for (let y = 0; y < size; y += 1.5) {
          const wave = Math.sin(y * 0.02 + time * (0.3 + rng(seed, i + 20) * 0.4) + i * 0.8) * (3 + rng(seed, i + 30) * 8);
          const x = baseX + wave;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [size, seed, color, mode]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block", borderRadius: "50%" }} />;
}

export default function SpeakerCard({ speaker, mode, index }) {
  const t = THEME[mode];
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      padding: 20,
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = speaker.color;
      e.currentTarget.style.transform = "translateY(-3px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = t.border;
      e.currentTarget.style.transform = "translateY(0)";
    }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
        <MiniWeave size={48} seed={index * 100 + 42} color={speaker.color} mode={mode} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{speaker.name}</div>
          <div style={{ fontSize: 9, color: t.textMuted }}>{speaker.role} · {speaker.org}</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.7, marginBottom: 10 }}>
        {speaker.topic}
      </div>
      <div style={{
        position: "absolute", top: 12, right: 14,
        fontSize: 18, color: speaker.color, opacity: 0.25,
      }}>
        {speaker.icon}
      </div>
    </div>
  );
}
