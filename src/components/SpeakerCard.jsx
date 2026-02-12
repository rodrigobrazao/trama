import { useRef, useEffect } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import ExportButton from "./ExportButton";
import { generateSpeakerSVG, downloadSVG } from "../utils/exportSVG";
import { generateSpeakerCardHTML, downloadHTML } from "../utils/exportHTML";

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
      timeRef.current += 0.025;
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
  const W = 1080, H = 608;
  return (
    <div>
      {/* Card visual — same as original design */}
      <div style={{
        border: `1px solid ${t.border}`, padding: 14, display: "flex",
        flexDirection: "column", gap: 10, transition: "border-color 0.3s",
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: "50%", overflow: "hidden" }}>
            <MiniWeave size={36} seed={index * 100 + 42} color={speaker.color} mode={mode} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{speaker.name}</div>
            <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.08em" }}>{speaker.role} · {speaker.org}</div>
          </div>
        </div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 13, color: speaker.color, lineHeight: 1.4 }}>
          {speaker.topic}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {THREADS.map((c, i) => (
            <div key={i} style={{ width: 16, height: 2, background: c, opacity: c === speaker.color ? 0.7 : 0.15, borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Full-size SVG preview — click to expand */}
        <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", marginTop: 6 }}>
          ▸ ver a 100% · {W}×{H}
        </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <ExportButton mode={mode} label="svg" onClick={() => downloadSVG(generateSpeakerSVG({ speaker, width: W, height: H, seed: index * 100 + 42, mode }), `trama-speaker-card-${speaker.name.replace(/\s+/g, "-").toLowerCase()}.svg`)} />
        <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateSpeakerCardHTML({ speaker, seed: index * 100 + 42, mode }), `trama-speaker-card-${speaker.name.replace(/\s+/g, "-").toLowerCase()}.html`)} />
      </div>
    </div>
  );
}
