import { useRef, useEffect } from "react";
import { THREADS, THEME, rng } from "../data/tokens";

// Simple QR code module generator (valid QR-like pattern)
function generateQRModules(data, size) {
  const modules = [];
  const seed = data.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      // Finder patterns (corners)
      const inFinderTL = x < 7 && y < 7;
      const inFinderTR = x >= size - 7 && y < 7;
      const inFinderBL = x < 7 && y >= size - 7;
      if (inFinderTL || inFinderTR || inFinderBL) {
        const fx = inFinderTL ? x : inFinderTR ? x - (size - 7) : x;
        const fy = inFinderTL ? y : inFinderTR ? y : y - (size - 7);
        const border = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const inner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        row.push(border || inner ? 1 : 0);
      } else {
        row.push(rng(seed + y * size + x, 42) > 0.48 ? 1 : 0);
      }
    }
    modules.push(row);
  }
  return modules;
}

export default function TramaQR({ url, size = 200, mode = "dark", seed: qrSeed = 42, label }) {
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
    const gridSize = 29;
    const modules = generateQRModules(url, gridSize);
    const cellSize = size / (gridSize + 4);
    const offset = cellSize * 2;

    const draw = () => {
      timeRef.current += 0.008;
      const time = timeRef.current;

      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, size, size);

      // Draw subtle thread lines behind
      for (let i = 0; i < 6; i++) {
        const basePos = (size * (i + 0.5)) / 6;
        ctx.beginPath();
        ctx.strokeStyle = THREADS[i];
        ctx.globalAlpha = 0.06;
        ctx.lineWidth = 0.5;
        for (let x = 0; x < size; x += 2) {
          const wave = Math.sin(x * 0.015 + time * 0.3 + i) * 4;
          const y = basePos + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw QR modules with thread-inspired style
      ctx.globalAlpha = 1;
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (modules[y][x]) {
            const px = offset + x * cellSize;
            const py = offset + y * cellSize;
            
            // Finder patterns get thread colors
            const inFinder = (x < 7 && y < 7) || (x >= gridSize - 7 && y < 7) || (x < 7 && y >= gridSize - 7);
            
            if (inFinder) {
              const fi = (x < 7 && y < 7) ? 0 : (x >= gridSize - 7 && y < 7) ? 1 : 2;
              ctx.fillStyle = THREADS[fi * 2];
              ctx.globalAlpha = 0.9;
            } else {
              // Data modules: subtle breathing
              const breath = 0.5 + Math.sin(time * 1.2 + x * 0.2 + y * 0.3) * 0.15;
              const colorIdx = Math.floor(rng(qrSeed + x * gridSize + y, 777) * THREADS.length);
              const useColor = rng(qrSeed + x + y * 31, 555) > 0.7;
              ctx.fillStyle = useColor ? THREADS[colorIdx] : t.text;
              ctx.globalAlpha = useColor ? breath * 0.8 : breath * 0.7;
            }
            
            const s = cellSize * 0.85;
            const cx = px + cellSize / 2;
            const cy = py + cellSize / 2;
            ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
          }
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [url, size, mode, qrSeed]);

  const t = THEME[mode];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: 4, overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />
      </div>
      {label && (
        <span style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Roboto Mono', monospace" }}>
          {label}
        </span>
      )}
    </div>
  );
}
