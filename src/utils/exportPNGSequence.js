// ═══════════════════════════════════════════
// TRAMA — PNG Sequence Export (offscreen canvas → ZIP)
// Generates 125 frames (25fps × 5s) for each component.
// ═══════════════════════════════════════════

import JSZip from "jszip";
import { THREADS, THEME, rng } from "../data/tokens";

// ─── Helper: canvas to blob ───
function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

// ─── Helper: draw weave threads on a canvas context ───
function drawWeaveFrame(ctx, w, h, seed, mode, time) {
  const t = THEME[mode];
  const hCount = 8 + Math.floor(rng(seed, 0) * 10);
  const vCount = 8 + Math.floor(rng(seed, 100) * 10);

  const hThreads = [], vThreads = [];
  for (let i = 0; i < hCount; i++) {
    hThreads.push({
      baseY: (h * (i + 0.5)) / hCount,
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
      baseX: (w * (i + 0.5)) / vCount,
      thickness: 0.6 + rng(seed, i + 800) * 2.2,
      color: THREADS[Math.floor(rng(seed, i + 900) * THREADS.length)],
      speed: 0.1 + rng(seed, i + 1000) * 0.5,
      phase: rng(seed, i + 1100) * Math.PI * 2,
      amplitude: 3 + rng(seed, i + 1200) * 16,
      opacity: 0.2 + rng(seed, i + 1300) * 0.55,
    });
  }

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, w, h);

  // Vertical threads
  vThreads.forEach(th => {
    ctx.beginPath();
    ctx.strokeStyle = th.color;
    ctx.globalAlpha = th.opacity;
    ctx.lineWidth = th.thickness;
    for (let y = 0; y < h; y += 2) {
      const wave = Math.sin(y * 0.007 + time * th.speed + th.phase) * th.amplitude;
      const x = th.baseX + wave;
      y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Horizontal threads
  hThreads.forEach(th => {
    ctx.beginPath();
    ctx.strokeStyle = th.color;
    ctx.globalAlpha = th.opacity;
    ctx.lineWidth = th.thickness;
    for (let x = 0; x < w; x += 2) {
      const wave = Math.sin(x * 0.007 + time * th.speed + th.phase) * th.amplitude;
      const y = th.baseY + wave;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Intersection glows
  ctx.globalAlpha = 1;
  hThreads.forEach(hh => {
    vThreads.forEach(vv => {
      if (rng(Math.floor(vv.baseX) * 100 + Math.floor(hh.baseY), seed) < 0.012) {
        const g = 0.08 + rng(vv.baseX + hh.baseY, seed + 1) * 0.1;
        const r2 = 2 + g * 5;
        const grad = ctx.createRadialGradient(vv.baseX, hh.baseY, 0, vv.baseX, hh.baseY, r2);
        grad.addColorStop(0, `rgba(${t.glow},${g * 0.6})`);
        grad.addColorStop(1, `rgba(${t.glow},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(vv.baseX, hh.baseY, r2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
  ctx.globalAlpha = 1;

  return { hThreads, vThreads };
}

// ═══════════════════════════════════════════
// Logo PNG Sequence
// ═══════════════════════════════════════════

export async function exportLogoPNGSequence({ seed = 42, mode = "dark", showLabels = true, onProgress } = {}) {
  const W = 1920, H = 960;
  const FPS = 25, DURATION = 5;
  const FRAMES = FPS * DURATION;
  const t = THEME[mode];

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const zip = new JSZip();

  for (let f = 0; f < FRAMES; f++) {
    const time = (f / FPS) * 0.018 * FPS; // Match animation speed: 0.018 per frame at ~60fps, scaled to 25fps

    drawWeaveFrame(ctx, W, H, seed, mode, time);

    // Typography overlay
    const fontSize = Math.min(W * 0.2, H * 0.5);
    ctx.font = `700 ${fontSize}px 'Roboto Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = t.wordmark || t.text;
    ctx.fillText("trama", W / 2, H * 0.48);

    if (showLabels) {
      ctx.font = `400 ${Math.max(8, fontSize * 0.08)}px 'Roboto Mono', monospace`;
      ctx.fillStyle = THREADS[0];
      ctx.globalAlpha = 0.85;
      ctx.fillText("IADE  ·  1ª EDIÇÃO  ·  2026", W / 2, H * 0.48 - fontSize * 0.55);

      ctx.globalAlpha = 0.5;
      const labelY = H * 0.48 + fontSize * 0.5;
      const lineW = fontSize * 0.25;
      ctx.strokeStyle = THREADS[0];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - fontSize * 1.1, labelY);
      ctx.lineTo(W / 2 - fontSize * 1.1 + lineW, labelY);
      ctx.stroke();

      ctx.font = `400 ${Math.max(8, fontSize * 0.09)}px 'Roboto Mono', monospace`;
      ctx.fillStyle = t.textMuted || t.text;
      ctx.globalAlpha = 0.45;
      ctx.textAlign = "left";
      ctx.fillText("JORNADAS DE DESIGN", W / 2 - fontSize * 1.1 + lineW + 10, labelY);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";

    const blob = await canvasToBlob(canvas);
    zip.file(`trama-logo-${String(f + 1).padStart(4, "0")}.png`, blob);

    if (onProgress) onProgress(f + 1, FRAMES);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trama-logo-png-seq-${seed}-${mode}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════
// Speaker Base PNG Sequence
// ═══════════════════════════════════════════

export async function exportSpeakerBasePNGSequence({ speaker, seed = 42, mode = "dark", format = "horizontal", onProgress } = {}) {
  const isVert = format === "vertical";
  const W = isVert ? 1080 : 1920;
  const H = isVert ? 1920 : 1080;
  const FPS = 25, DURATION = 5;
  const FRAMES = FPS * DURATION;
  const t = THEME[mode];

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const zip = new JSZip();

  for (let f = 0; f < FRAMES; f++) {
    const time = (f / FPS) * 0.018 * FPS;

    drawWeaveFrame(ctx, W, H, seed, mode, time);

    // Overlay gradient
    const grad = ctx.createLinearGradient(0, 0, isVert ? 0 : W, isVert ? H : 0);
    grad.addColorStop(0, t.bg + "ee");
    grad.addColorStop(0.5, t.bg + "55");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Speaker info
    const s = W / (isVert ? 1080 : 1920);
    const cx = W * 0.08;
    const cy = isVert ? H * 0.6 : H * 0.35;

    ctx.globalAlpha = 1;
    ctx.font = `400 ${20 * s}px 'Roboto Mono', monospace`;
    ctx.fillStyle = speaker.color;
    ctx.textAlign = "left";
    ctx.fillText(speaker.icon || "●", cx, cy);

    ctx.font = `700 ${22 * s}px 'Roboto Mono', monospace`;
    ctx.fillStyle = t.text;
    ctx.fillText(speaker.name, cx, cy + 30 * s);

    ctx.font = `400 ${14 * s}px 'Instrument Serif', serif`;
    ctx.fillStyle = t.textMuted || t.text;
    ctx.globalAlpha = 0.7;
    ctx.fillText(speaker.topic, cx, cy + 52 * s);

    ctx.font = `400 ${9 * s}px 'Roboto Mono', monospace`;
    ctx.fillStyle = t.textDim || t.textMuted || t.text;
    ctx.globalAlpha = 0.5;
    ctx.fillText(`${speaker.role} · ${speaker.org}`, cx, cy + 72 * s);
    ctx.globalAlpha = 1;

    const blob = await canvasToBlob(canvas);
    const safeName = speaker.name.replace(/\s+/g, "-").toLowerCase();
    zip.file(`trama-speaker-${safeName}-${String(f + 1).padStart(4, "0")}.png`, blob);

    if (onProgress) onProgress(f + 1, FRAMES);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  const safeName = speaker.name.replace(/\s+/g, "-").toLowerCase();
  a.download = `trama-speaker-${safeName}-png-seq-${mode}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════
// Teams Separator PNG Sequence
// ═══════════════════════════════════════════

export async function exportTeamsSeparatorPNGSequence({ title = "keynotes", color = THREADS[0], seed = 42, mode = "dark", onProgress } = {}) {
  const W = 1920, H = 1080;
  const FPS = 25, DURATION = 5;
  const FRAMES = FPS * DURATION;
  const t = THEME[mode];

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const zip = new JSZip();

  for (let f = 0; f < FRAMES; f++) {
    const time = (f / FPS) * 0.018 * FPS;

    drawWeaveFrame(ctx, W, H, seed, mode, time);

    // Overlay: radial gradient for readability
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    grad.addColorStop(0, t.bg + "cc");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Typography
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Title
    ctx.font = `700 64px 'Roboto Mono', monospace`;
    ctx.fillStyle = color;
    ctx.fillText(title, W / 2, H / 2);

    // Lines above/below
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 30, H / 2 - 50);
    ctx.lineTo(W / 2 + 30, H / 2 - 50);
    ctx.stroke();

    // Subtitle
    ctx.font = `400 14px 'Roboto Mono', monospace`;
    ctx.fillStyle = t.textMuted || t.text;
    ctx.globalAlpha = 0.4;
    ctx.fillText("trama · jornadas de design", W / 2, H / 2 + 50);
    ctx.globalAlpha = 1;

    // Thread bars at bottom
    THREADS.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(W / 2 - THREADS.length * 10 + i * 20, H - 30, 16, 2);
    });
    ctx.globalAlpha = 1;

    const blob = await canvasToBlob(canvas);
    zip.file(`trama-teams-${title}-${String(f + 1).padStart(4, "0")}.png`, blob);

    if (onProgress) onProgress(f + 1, FRAMES);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trama-teams-${title.replace(/\s/g, "-")}-png-seq-${mode}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
