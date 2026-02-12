import { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { THREADS, THEME, rng } from "../data/tokens";
import ExportButton from "./ExportButton";
import { downloadCanvasPNG, generateQRSVG, downloadSVG } from "../utils/exportSVG";
import { generateQRHTML, downloadHTML } from "../utils/exportHTML";

// Fallback decorative QR pattern (original)
function generateDecorativeModules(data, size) {
  const modules = [];
  const seed = data.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
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

// Get real QR matrix from qrcode library
async function getRealQRModules(text) {
  try {
    const qr = await QRCode.create(text, { errorCorrectionLevel: "M" });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const modules = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push(data[y * size + x] ? 1 : 0);
      }
      modules.push(row);
    }
    return { modules, size };
  } catch {
    return null;
  }
}

// Standalone canvas for fullscreen preview (no animation, static render)
function TramaQRCanvas({ url, size, mode, qrSeed, realQR, qrData }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    const t = THEME[mode];
    let modules, gridSize;
    if (realQR && qrData) {
      modules = qrData.modules;
      gridSize = qrData.size;
    } else {
      gridSize = 29;
      modules = generateDecorativeModules(url, gridSize);
    }

    const cellSize = size / (gridSize + 4);
    const offset = cellSize * 2;

    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, size, size);

    // Thread lines
    for (let i = 0; i < 6; i++) {
      const basePos = (size * (i + 0.5)) / 6;
      ctx.beginPath();
      ctx.strokeStyle = THREADS[i];
      ctx.globalAlpha = 0.06;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < size; x += 2) {
        const wave = Math.sin(x * 0.015 + i) * 4;
        const y = basePos + wave;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // QR modules
    ctx.globalAlpha = 1;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (modules[y][x]) {
          const px = offset + x * cellSize;
          const py = offset + y * cellSize;
          const inFinder = (x < 7 && y < 7) || (x >= gridSize - 7 && y < 7) || (x < 7 && y >= gridSize - 7);
          if (inFinder) {
            const fi = (x < 7 && y < 7) ? 0 : (x >= gridSize - 7 && y < 7) ? 1 : 2;
            ctx.fillStyle = THREADS[fi * 2];
            ctx.globalAlpha = 0.95;
          } else {
            ctx.fillStyle = t.text;
            ctx.globalAlpha = 0.9;
          }
          const s = cellSize * 0.85;
          const cx = px + cellSize / 2;
          const cy = py + cellSize / 2;
          ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [url, size, mode, qrSeed, realQR, qrData]);

  return <canvas ref={ref} style={{ width: size, height: size, display: "block" }} />;
}

export default function TramaQR({ url, size = 200, mode = "dark", seed: qrSeed = 42, label, realQR = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const pngCanvasRef = useRef(null);
  const [qrData, setQrData] = useState(null);

  // Generate real QR modules when realQR is true
  useEffect(() => {
    if (realQR && url) {
      getRealQRModules(url).then(setQrData);
    } else {
      setQrData(null);
    }
  }, [url, realQR]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const t = THEME[mode];

    let modules, gridSize;
    if (realQR && qrData) {
      modules = qrData.modules;
      gridSize = qrData.size;
    } else {
      gridSize = 29;
      modules = generateDecorativeModules(url, gridSize);
    }

    const cellSize = size / (gridSize + 4);
    const offset = cellSize * 2;

    const draw = () => {
      timeRef.current += 0.02;
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
              ctx.globalAlpha = 0.95;
            } else {
              // Data modules: high contrast for scanner readability
              // Subtle breathing on opacity but kept high enough for scanning
              const breath = 0.85 + Math.sin(time * 1.2 + x * 0.2 + y * 0.3) * 0.1;
              ctx.fillStyle = t.text;
              ctx.globalAlpha = breath;
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
  }, [url, size, mode, qrSeed, realQR, qrData]);

  const t = THEME[mode];

  const fullSize = 400;

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
      {realQR && (
        <span style={{ fontSize: 7, color: THREADS[2], letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace" }}>
          ● funcional
        </span>
      )}
      <ExportButton mode={mode} label="png" onClick={() => {
        // Render a high-res PNG from a temp canvas — matches actual visual output
        const expSize = 800;
        const c = document.createElement("canvas");
        c.width = expSize; c.height = expSize;
        const cx = c.getContext("2d");
        const tt = THEME[mode];
        let mods, gs;
        if (realQR && qrData) { mods = qrData.modules; gs = qrData.size; }
        else { gs = 29; mods = generateDecorativeModules(url, gs); }
        const cs = expSize / (gs + 4);
        const off = cs * 2;
        cx.fillStyle = tt.bg; cx.fillRect(0, 0, expSize, expSize);
        for (let i = 0; i < 6; i++) {
          const bp = (expSize * (i + 0.5)) / 6;
          cx.beginPath(); cx.strokeStyle = THREADS[i]; cx.globalAlpha = 0.06; cx.lineWidth = 0.5;
          for (let x = 0; x < expSize; x += 2) { const w = Math.sin(x * 0.015 + i) * 4; const y = bp + w; x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); }
          cx.stroke();
        }
        cx.globalAlpha = 1;
        for (let y = 0; y < gs; y++) {
          for (let x = 0; x < gs; x++) {
            if (mods[y][x]) {
              const px = off + x * cs, py = off + y * cs;
              const inF = (x < 7 && y < 7) || (x >= gs - 7 && y < 7) || (x < 7 && y >= gs - 7);
              if (inF) { const fi = (x < 7 && y < 7) ? 0 : (x >= gs - 7 && y < 7) ? 1 : 2; cx.fillStyle = THREADS[fi * 2]; cx.globalAlpha = 0.95; }
              else { cx.fillStyle = tt.text; cx.globalAlpha = 0.9; }
              const s = cs * 0.85; cx.fillRect(px + cs / 2 - s / 2, py + cs / 2 - s / 2, s, s);
            }
          }
        }
        cx.globalAlpha = 1;
        downloadCanvasPNG(c, `trama-qr-${mode}-${qrSeed}.png`);
      }} />
      <ExportButton mode={mode} label="svg" onClick={() => downloadSVG(generateQRSVG({ size: 800, seed: qrSeed, mode, label: url }), `trama-qr-${mode}-${qrSeed}.svg`)} />
      <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateQRHTML({ url, seed: qrSeed, mode }), `trama-qr-${mode}-${qrSeed}.html`)} />
    </div>
  );
}
