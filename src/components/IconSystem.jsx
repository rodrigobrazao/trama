import { useEffect, useRef } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import ExportButton from "./ExportButton";
import { generateIconSVG, downloadSVG, downloadAllSVGs } from "../utils/exportSVG";
import { generateIconHTML, downloadHTML } from "../utils/exportHTML";

function TramaIcon({ name, size = 32, color, mode = "dark", seed = 42 }) {
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
    const c = color || THREADS[0];
    const s = size;
    const p = s * 0.15; // padding

    const drawThreadBg = (time) => {
      for (let i = 0; i < 3; i++) {
        const baseY = (s * (i + 0.5)) / 3;
        ctx.beginPath();
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 0.3;
        for (let x = 0; x < s; x += 1.5) {
          const wave = Math.sin(x * 0.04 + time * 0.3 + i * 2) * 2;
          const y = baseY + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const icons = {
      play: (ctx, time) => {
        ctx.beginPath();
        ctx.moveTo(p + 2, p);
        ctx.lineTo(s - p, s / 2);
        ctx.lineTo(p + 2, s - p);
        ctx.closePath();
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
      },
      pause: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(s * 0.32, p);
        ctx.lineTo(s * 0.32, s - p);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.68, p);
        ctx.lineTo(s * 0.68, s - p);
        ctx.stroke();
      },
      mic: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s / 2, s * 0.35, s * 0.15, Math.PI, 0);
        ctx.lineTo(s / 2 + s * 0.15, s * 0.5);
        ctx.arc(s / 2, s * 0.5, s * 0.15, 0, Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, s * 0.45, s * 0.25, Math.PI * 0.85, Math.PI * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2, s * 0.7);
        ctx.lineTo(s / 2, s * 0.82);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.35, s * 0.82);
        ctx.lineTo(s * 0.65, s * 0.82);
        ctx.stroke();
      },
      camera: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.strokeRect(p, s * 0.3, s - p * 2, s * 0.45);
        ctx.beginPath();
        ctx.arc(s / 2, s * 0.52, s * 0.12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.35, s * 0.3);
        ctx.lineTo(s * 0.4, s * 0.2);
        ctx.lineTo(s * 0.6, s * 0.2);
        ctx.lineTo(s * 0.65, s * 0.3);
        ctx.stroke();
      },
      link: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s * 0.38, s * 0.38, s * 0.14, Math.PI * 0.75, Math.PI * 1.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s * 0.62, s * 0.62, s * 0.14, Math.PI * 1.75, Math.PI * 0.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.42, s * 0.58);
        ctx.lineTo(s * 0.58, s * 0.42);
        ctx.stroke();
      },
      download: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(s / 2, p);
        ctx.lineTo(s / 2, s * 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.35, s * 0.48);
        ctx.lineTo(s / 2, s * 0.65);
        ctx.lineTo(s * 0.65, s * 0.48);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p, s * 0.78);
        ctx.lineTo(p, s - p);
        ctx.lineTo(s - p, s - p);
        ctx.lineTo(s - p, s * 0.78);
        ctx.stroke();
      },
      share: (ctx, time) => {
        ctx.fillStyle = c;
        ctx.globalAlpha = 0.9;
        const dots = [{ x: s * 0.75, y: s * 0.22 }, { x: s * 0.25, y: s * 0.5 }, { x: s * 0.75, y: s * 0.78 }];
        dots.forEach(d => { ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, Math.PI * 2); ctx.fill(); });
        ctx.strokeStyle = c;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(dots[0].x - 2, dots[0].y + 1);
        ctx.lineTo(dots[1].x + 2, dots[1].y - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(dots[2].x - 2, dots[2].y - 1);
        ctx.lineTo(dots[1].x + 2, dots[1].y + 1);
        ctx.stroke();
      },
      arrow_right: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(p, s / 2);
        ctx.lineTo(s - p, s / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.6, s * 0.3);
        ctx.lineTo(s - p, s / 2);
        ctx.lineTo(s * 0.6, s * 0.7);
        ctx.stroke();
      },
      arrow_left: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(s - p, s / 2);
        ctx.lineTo(p, s / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.4, s * 0.3);
        ctx.lineTo(p, s / 2);
        ctx.lineTo(s * 0.4, s * 0.7);
        ctx.stroke();
      },
      clock: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2, s / 2);
        ctx.lineTo(s / 2, s * 0.28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2, s / 2);
        ctx.lineTo(s * 0.65, s * 0.55);
        ctx.stroke();
      },
      user: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s / 2, s * 0.32, s * 0.14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, s * 0.95, s * 0.3, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      },
      grid: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const x = p + i * (s - p * 2) / 2.5;
            const y = p + j * (s - p * 2) / 2.5;
            ctx.strokeRect(x, y, (s - p * 2) / 3.5, (s - p * 2) / 3.5);
          }
        }
      },
      search: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s * 0.42, s * 0.42, s * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s * 0.58, s * 0.58);
        ctx.lineTo(s - p, s - p);
        ctx.stroke();
      },
      settings: (ctx, time) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s * 0.16, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(s / 2 + Math.cos(a) * s * 0.22, s / 2 + Math.sin(a) * s * 0.22);
          ctx.lineTo(s / 2 + Math.cos(a) * s * 0.35, s / 2 + Math.sin(a) * s * 0.35);
          ctx.stroke();
        }
      },
      weave: (ctx, time) => {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = THREADS[i];
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.7;
          for (let x = 0; x < s; x += 1) {
            const y = (s * (i + 0.5)) / 3 + Math.sin(x * 0.08 + time * 0.5 + i * 2) * 4;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = THREADS[i + 3];
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5;
          for (let y = 0; y < s; y += 1) {
            const x = (s * (i + 0.5)) / 3 + Math.sin(y * 0.08 + time * 0.5 + i * 2) * 4;
            y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      },
    };

    const draw = () => {
      timeRef.current += 0.025;
      const time = timeRef.current;

      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, s, s);

      drawThreadBg(time);
      ctx.globalAlpha = 1;

      if (icons[name]) icons[name](ctx, time);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [name, size, color, mode, seed]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}

const ICON_NAMES = [
  "play", "pause", "mic", "camera", "link", "download",
  "share", "arrow_right", "arrow_left", "clock", "user",
  "grid", "search", "settings",
];

export default function IconSystem({ mode }) {
  const t = THEME[mode];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {ICON_NAMES.map((name, i) => (
          <div key={name} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
              <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
                <TramaIcon name={name} size={48} color={THREADS[i % THREADS.length]} mode={mode} />
              </div>
            <span style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.08em" }}>{name}</span>
            <ExportButton mode={mode} label="svg" onClick={() => downloadSVG(generateIconSVG({ icon: name, size: 64, color: THREADS[i % THREADS.length], bgColor: t.bg }), `trama-icon-${name}.svg`)} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateIconHTML({ icon: name, size: 256, color: THREADS[i % THREADS.length], mode }), `trama-icon-${name}.html`)} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 32 }}>
        <ExportButton mode={mode} label="export all icons" onClick={() => downloadAllSVGs(ICON_NAMES.map((name, i) => ({ content: generateIconSVG({ icon: name, size: 64, color: THREADS[i % THREADS.length], bgColor: t.bg }), filename: `trama-icon-${name}.svg` })))} />
      </div>

      {/* Size variations */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[3]}`, paddingLeft: 10 }}>
        escalas
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 32 }}>
        {[64, 48, 32, 24, 16].map(s => (
          <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
              <TramaIcon name="play" size={s} color={THREADS[0]} mode={mode} />
            </div>
            <span style={{ fontSize: 9, color: t.textMuted }}>{s}px</span>
          </div>
        ))}
      </div>

      {/* Color variations */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[3]}`, paddingLeft: 10 }}>
        variações cromáticas
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {THREADS.map((c, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <TramaIcon name="play" size={48} color={c} mode={mode} />
          </div>
        ))}
      </div>
    </div>
  );
}
