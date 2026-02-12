// ═══════════════════════════════════════════
// TRAMA — SVG Export with Layers for Adobe Illustrator
// ═══════════════════════════════════════════

import { THREADS, THEME, SPEAKERS, PROGRAMME, rng } from "../data/tokens";

// ─── Helpers ───

function escXML(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function svgText(text, x, y, { size = 12, color = "#fff", weight = 400, family = "'Roboto Mono', monospace", anchor = "start", spacing = "0", transform = "", opacity = 1 } = {}) {
  const displayText = transform === "uppercase" ? String(text).toUpperCase() : text;
  const style = `font-family:${family};font-size:${size}px;font-weight:${weight};fill:${color};opacity:${opacity}`;
  const extra = anchor !== "start" ? ` text-anchor="${anchor}"` : "";
  const ls = spacing !== "0" ? ` letter-spacing="${spacing}"` : "";
  return `    <text x="${x}" y="${y}" style="${style}"${extra}${ls}>${escXML(displayText)}</text>`;
}

export function svgGradient(id, { type = "linear", x1 = 0, y1 = 0, x2 = 0, y2 = 1, stops = [] } = {}) {
  const stopTags = stops.map(s => `      <stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity ?? 1}" />`).join("\n");
  if (type === "linear") {
    return `    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">\n${stopTags}\n    </linearGradient>`;
  }
  return `    <radialGradient id="${id}" cx="${x1}" cy="${y1}" r="${x2}">\n${stopTags}\n    </radialGradient>`;
}

// ─── Core: Generate weave layers (no <svg> wrapper) ───

export function generateWeaveLayersSVG({ width, height, seed, mode = "dark", density = "normal", time = 0 }) {
  const t = THEME[mode];
  const densityMap = {
    normal: { hBase: 8, hExtra: 10, vBase: 8, vExtra: 10 },
    dense: { hBase: 18, hExtra: 14, vBase: 18, vExtra: 14 },
    ultra: { hBase: 32, hExtra: 20, vBase: 32, vExtra: 20 },
  };
  const d = densityMap[density] || densityMap.normal;

  const hCount = d.hBase + Math.floor(rng(seed, 0) * d.hExtra);
  const vCount = d.vBase + Math.floor(rng(seed, 100) * d.vExtra);

  const hThreads = [], vThreads = [];
  for (let i = 0; i < hCount; i++) {
    hThreads.push({
      baseY: (height * (i + 0.5)) / hCount,
      thickness: 0.6 + rng(seed, i + 200) * 2.2,
      color: THREADS[Math.floor(rng(seed, i + 300) * THREADS.length)],
      phase: rng(seed, i + 500) * Math.PI * 2,
      amplitude: 3 + rng(seed, i + 600) * 16,
      opacity: 0.2 + rng(seed, i + 700) * 0.55,
      speed: 0.1 + rng(seed, i + 400) * 0.5,
    });
  }
  for (let i = 0; i < vCount; i++) {
    vThreads.push({
      baseX: (width * (i + 0.5)) / vCount,
      thickness: 0.6 + rng(seed, i + 800) * 2.2,
      color: THREADS[Math.floor(rng(seed, i + 900) * THREADS.length)],
      phase: rng(seed, i + 1100) * Math.PI * 2,
      amplitude: 3 + rng(seed, i + 1200) * 16,
      opacity: 0.2 + rng(seed, i + 1300) * 0.55,
      speed: 0.1 + rng(seed, i + 1000) * 0.5,
    });
  }

  // Vertical thread paths (warp)
  const vPaths = vThreads.map(th => {
    let d = "";
    for (let y = 0; y < height; y += 2) {
      const wave = Math.sin(y * 0.007 + time * th.speed + th.phase) * th.amplitude;
      const x = th.baseX + wave;
      d += y === 0 ? `M ${x.toFixed(2)} ${y}` : ` L ${x.toFixed(2)} ${y}`;
    }
    return `    <path d="${d}" stroke="${th.color}" stroke-width="${th.thickness.toFixed(2)}" fill="none" opacity="${th.opacity.toFixed(2)}" />`;
  });

  // Horizontal thread paths (weft)
  const hPaths = hThreads.map(th => {
    let d = "";
    for (let x = 0; x < width; x += 2) {
      const wave = Math.sin(x * 0.007 + time * th.speed + th.phase) * th.amplitude;
      const y = th.baseY + wave;
      d += x === 0 ? `M ${x} ${y.toFixed(2)}` : ` L ${x} ${y.toFixed(2)}`;
    }
    return `    <path d="${d}" stroke="${th.color}" stroke-width="${th.thickness.toFixed(2)}" fill="none" opacity="${th.opacity.toFixed(2)}" />`;
  });

  // Glows — match canvas: probability ~1.2%, radial gradient, theme glow color
  const glowDefs = [];
  const glows = [];
  let glowIdx = 0;
  hThreads.forEach(h => {
    vThreads.forEach(v => {
      if (rng(Math.floor(v.baseX) * 100 + Math.floor(h.baseY), seed) < 0.012) {
        const g = 0.08 + Math.sin(v.baseX * 0.01 + h.baseY * 0.01) * 0.06;
        const r2 = (2 + g * 5).toFixed(1);
        const gid = `glow-${seed}-${glowIdx++}`;
        glowDefs.push(`    <radialGradient id="${gid}" cx="50%" cy="50%" r="50%">\n      <stop offset="0%" stop-color="rgb(${t.glow})" stop-opacity="${(g * 0.6).toFixed(3)}" />\n      <stop offset="100%" stop-color="rgb(${t.glow})" stop-opacity="0" />\n    </radialGradient>`);
        glows.push(`    <circle cx="${v.baseX.toFixed(1)}" cy="${h.baseY.toFixed(1)}" r="${r2}" fill="url(#${gid})" />`);
      }
    });
  });

  const defsBlock = glowDefs.length > 0 ? `  <defs>\n${glowDefs.join("\n")}\n  </defs>\n\n` : "";

  return {
    bg: `  <g id="background">\n    <rect width="${width}" height="${height}" fill="${t.bg}" />\n  </g>`,
    warp: `  <g id="warp-threads">\n${vPaths.join("\n")}\n  </g>`,
    weft: `  <g id="weft-threads">\n${hPaths.join("\n")}\n  </g>`,
    glows: `  <g id="intersection-glows">\n${glows.join("\n")}\n  </g>`,
    defs: defsBlock,
    all() { return `${this.defs}${this.bg}\n\n${this.warp}\n\n${this.weft}\n\n${this.glows}`; },
  };
}

// ─── Custom weave with explicit params (for InteractiveBackground) ───

export function generateCustomWeaveLayersSVG({ width, height, seed, mode = "dark", hCount, vCount, thickness, amplitude, hSpeed, vSpeed, time = 0, colors }) {
  const t = THEME[mode];
  const threadColors = colors || THREADS;

  const hThreads = [], vThreads = [];
  for (let i = 0; i < hCount; i++) {
    hThreads.push({
      baseY: (height * (i + 0.5)) / hCount,
      thickness,
      color: threadColors[Math.floor(rng(seed, i + 300) * threadColors.length)],
      phase: rng(seed, i + 500) * Math.PI * 2,
      amplitude,
      opacity: 0.2 + rng(seed, i + 700) * 0.55,
      speed: hSpeed,
    });
  }
  for (let i = 0; i < vCount; i++) {
    vThreads.push({
      baseX: (width * (i + 0.5)) / vCount,
      thickness,
      color: threadColors[Math.floor(rng(seed, i + 900) * threadColors.length)],
      phase: rng(seed, i + 1100) * Math.PI * 2,
      amplitude,
      opacity: 0.2 + rng(seed, i + 1300) * 0.55,
      speed: vSpeed,
    });
  }

  const vPaths = vThreads.map(th => {
    let d = "";
    for (let y = 0; y < height; y += 2) {
      const wave = Math.sin(y * 0.007 + time * th.speed + th.phase) * th.amplitude;
      const x = th.baseX + wave;
      d += y === 0 ? `M ${x.toFixed(2)} ${y}` : ` L ${x.toFixed(2)} ${y}`;
    }
    return `    <path d="${d}" stroke="${th.color}" stroke-width="${th.thickness.toFixed(2)}" fill="none" opacity="${th.opacity.toFixed(2)}" />`;
  });

  const hPaths = hThreads.map(th => {
    let d = "";
    for (let x = 0; x < width; x += 2) {
      const wave = Math.sin(x * 0.007 + time * th.speed + th.phase) * th.amplitude;
      const y = th.baseY + wave;
      d += x === 0 ? `M ${x} ${y.toFixed(2)}` : ` L ${x} ${y.toFixed(2)}`;
    }
    return `    <path d="${d}" stroke="${th.color}" stroke-width="${th.thickness.toFixed(2)}" fill="none" opacity="${th.opacity.toFixed(2)}" />`;
  });

  // Glows — match canvas: probability ~1.2%, radial gradient, theme glow color
  const glowDefs = [];
  const glows = [];
  let glowIdx = 0;
  hThreads.forEach(h => {
    vThreads.forEach(v => {
      if (rng(Math.floor(v.baseX) * 100 + Math.floor(h.baseY), seed) < 0.012) {
        const g = 0.08 + Math.sin(v.baseX * 0.01 + h.baseY * 0.01) * 0.06;
        const r2 = (2 + g * 5).toFixed(1);
        const gid = `cglow-${seed}-${glowIdx++}`;
        glowDefs.push(`    <radialGradient id="${gid}" cx="50%" cy="50%" r="50%">\n      <stop offset="0%" stop-color="rgb(${t.glow})" stop-opacity="${(g * 0.6).toFixed(3)}" />\n      <stop offset="100%" stop-color="rgb(${t.glow})" stop-opacity="0" />\n    </radialGradient>`);
        glows.push(`    <circle cx="${v.baseX.toFixed(1)}" cy="${h.baseY.toFixed(1)}" r="${r2}" fill="url(#${gid})" />`);
      }
    });
  });

  const defsBlock = glowDefs.length > 0 ? `  <defs>\n${glowDefs.join("\n")}\n  </defs>\n\n` : "";

  return {
    bg: `  <g id="background">\n    <rect width="${width}" height="${height}" fill="${t.bg}" />\n  </g>`,
    warp: `  <g id="warp-threads">\n${vPaths.join("\n")}\n  </g>`,
    weft: `  <g id="weft-threads">\n${hPaths.join("\n")}\n  </g>`,
    glows: `  <g id="intersection-glows">\n${glows.join("\n")}\n  </g>`,
    defs: defsBlock,
    all() { return `${this.defs}${this.bg}\n\n${this.warp}\n\n${this.weft}\n\n${this.glows}`; },
  };
}

// ─── Wrap content in <svg> tag ───

export function wrapSVG(innerContent, width, height, label = "background", seed = 0, mode = "dark") {
  const safeLabel = String(label).replace(/--/g, "—");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- TRAMA — ${safeLabel} — Seed #${seed} — ${mode} mode -->

${innerContent}
</svg>`;
}

// ─── Existing (kept for backwards compat) ───

export function generateTramaSVG({ width, height, seed, mode = "dark" }) {
  const layers = generateWeaveLayersSVG({ width, height, seed, mode });
  return wrapSVG(layers.all(), width, height, "Background", seed, mode);
}

// ─── Logo SVG ───

export function generateLogoSVG({ width, height, seed, mode = "dark", density = "normal", showLabels = true }) {
  const t = THEME[mode];
  const layers = generateWeaveLayersSVG({ width, height, seed, mode, density });

  const fontSize = Math.min(width * 0.2, height * 0.5);
  let typo = [];

  typo.push(svgText("trama", width / 2, height * 0.48 + fontSize * 0.35, {
    size: fontSize, color: t.wordmark || t.text, weight: 700, anchor: "middle",
  }));

  if (showLabels) {
    typo.push(svgText("IADE  ·  1ª EDIÇÃO  ·  2026", width / 2, height * 0.48 - fontSize * 0.55 + fontSize * 0.03, {
      size: Math.max(8, fontSize * 0.08), color: THREADS[0], weight: 400, anchor: "middle", spacing: "0.3em", opacity: 0.85,
    }));
    const labelY = height * 0.48 + fontSize * 0.5;
    const lineX = width / 2 - fontSize * 1.1;
    const lineW = fontSize * 0.25;
    typo.push(`    <line x1="${lineX}" y1="${labelY}" x2="${lineX + lineW}" y2="${labelY}" stroke="${THREADS[0]}" stroke-width="1" opacity="0.5" />`);
    typo.push(svgText("JORNADAS DE DESIGN", lineX + lineW + 10, labelY + fontSize * 0.03, {
      size: Math.max(8, fontSize * 0.09), color: t.textMuted || t.text, weight: 400, opacity: 0.45, spacing: "0.2em",
    }));
  }

  const inner = `${layers.all()}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, `Logo-${density}`, seed, mode);
}

// ─── Digital Panel SVG ───

export function generateDigitalPanelSVG({ width, height, seed, mode = "dark" }) {
  const t = THEME[mode];
  const layers = generateWeaveLayersSVG({ width, height, seed, mode });
  const isVert = height > width;
  const s = width / (isVert ? 1080 : 1920);

  const gradId = `overlay-grad-${seed}`;
  const defs = svgGradient(gradId, {
    type: "linear", x1: 0, y1: 0, x2: isVert ? 0 : 1, y2: isVert ? 1 : 0,
    stops: [
      { offset: "0%", color: t.bg, opacity: 0.9 },
      { offset: "40%", color: t.bg, opacity: 0.3 },
      { offset: "100%", color: t.bg, opacity: 0.0 },
    ],
  });

  const overlay = `  <g id="overlay">\n    <rect width="${width}" height="${height}" fill="url(#${gradId})" />\n  </g>`;
  const cx = isVert ? width * 0.1 : width * 0.05;
  const cy = isVert ? height * 0.35 : height * 0.3;

  const typo = [
    svgText("iade · 1ª edição · 2026", cx, cy, { size: 9 * s, color: THREADS[0], spacing: "0.3em", opacity: 0.85 }),
    svgText("trama", cx, cy + 100 * s, { size: 90 * s, color: t.wordmark || t.text, weight: 700 }),
    svgText("jornadas de design", cx + 4 * s, cy + 130 * s, { size: 11 * s, color: t.textMuted || t.text, spacing: "0.2em", opacity: 0.5 }),
  ];

  const inner = `  <defs>\n${defs}\n  </defs>\n\n${layers.all()}\n\n${overlay}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, "Digital-Panel", seed, mode);
}

// ─── Poster SVG ───

export function generatePosterSVG({ type = "vertical", width, height, seed, mode = "dark", title, color }) {
  const t = THEME[mode];
  const layers = generateWeaveLayersSVG({ width, height, seed, mode });

  let gradDir = { x1: 0, y1: 0, x2: 0, y2: 1 };
  if (type === "horizontal") gradDir = { x1: 0, y1: 0, x2: 1, y2: 0 };
  if (type === "separator") gradDir = { x1: 0.5, y1: 0.5, x2: 0.8, y2: 0 };

  const posterGradId = `poster-grad-${seed}`;
  const defs = svgGradient(posterGradId, {
    ...gradDir,
    stops: [
      { offset: "0%", color: t.bg, opacity: 0.85 },
      { offset: "50%", color: t.bg, opacity: 0.2 },
      { offset: "100%", color: t.bg, opacity: 0 },
    ],
  });

  const overlay = `  <g id="overlay">\n    <rect width="${width}" height="${height}" fill="url(#${posterGradId})" />\n  </g>`;

  let typo = [];
  if (type === "separator") {
    typo.push(svgText(title || "keynotes", width / 2, height / 2 + 6, {
      size: 16, color: color || THREADS[0], weight: 600, anchor: "middle", spacing: "0.25em",
    }));
    typo.push(`    <line x1="${width / 2 - 30}" y1="${height / 2 - 18}" x2="${width / 2 + 30}" y2="${height / 2 - 18}" stroke="${color || THREADS[0]}" stroke-width="0.5" opacity="0.3" />`);
    typo.push(svgText("trama · jornadas de design", width / 2, height / 2 + 26, {
      size: 7, color: t.textMuted || t.text, anchor: "middle", spacing: "0.15em", opacity: 0.4,
    }));
  } else {
    const s = type === "vertical" ? width / 400 : width / 700;
    typo.push(svgText("iade · 2026", width * 0.08, height * 0.15, { size: 8 * s, color: THREADS[0], spacing: "0.25em", opacity: 0.8 }));
    typo.push(svgText("trama", width * 0.08, height * 0.15 + 50 * s, { size: 42 * s, color: t.wordmark || t.text, weight: 700 }));
    typo.push(svgText("jornadas de design", width * 0.08, height * 0.15 + 70 * s, { size: 9 * s, color: t.textMuted || t.text, spacing: "0.15em", opacity: 0.5 }));
  }

  const inner = `  <defs>\n${defs}\n  </defs>\n\n${layers.all()}\n\n${overlay}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, `Poster-${type}`, seed, mode);
}

// ─── Speaker Base SVG ───

export function generateSpeakerSVG({ speaker, width, height, seed, mode = "dark" }) {
  const t = THEME[mode];
  const layers = generateWeaveLayersSVG({ width, height, seed, mode });
  const isVert = height > width;

  const speakerGradId = `speaker-grad-${seed}`;
  const defs = svgGradient(speakerGradId, {
    type: "linear", x1: isVert ? 0 : 0, y1: isVert ? 0 : 0, x2: isVert ? 0 : 1, y2: isVert ? 1 : 0,
    stops: [
      { offset: "0%", color: t.bg, opacity: 0.9 },
      { offset: "60%", color: t.bg, opacity: 0.3 },
      { offset: "100%", color: t.bg, opacity: 0 },
    ],
  });

  const overlay = `  <g id="overlay">\n    <rect width="${width}" height="${height}" fill="url(#${speakerGradId})" />\n  </g>`;
  const cx = width * 0.08;
  const cy = isVert ? height * 0.6 : height * 0.35;
  const s = width / (isVert ? 1080 : 1920);

  const typo = [
    svgText(speaker.icon || "●", cx, cy, { size: 20 * s, color: speaker.color }),
    svgText(speaker.name, cx, cy + 30 * s, { size: 22 * s, color: t.text, weight: 700 }),
    svgText(speaker.topic, cx, cy + 52 * s, { size: 14 * s, color: t.textMuted || t.text, family: "'Instrument Serif', serif", opacity: 0.7 }),
    svgText(`${speaker.role} · ${speaker.org}`, cx, cy + 72 * s, { size: 9 * s, color: t.textDim || t.textMuted || t.text, spacing: "0.1em", opacity: 0.5 }),
  ];

  const inner = `  <defs>\n${defs}\n  </defs>\n\n${layers.all()}\n\n${overlay}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, `Speaker-${speaker.name}`, seed, mode);
}

// ─── Programme Panel SVG ───

export function generateProgramSVG({ width, height, seed, mode = "dark" }) {
  const t = THEME[mode];
  const layers = generateWeaveLayersSVG({ width, height, seed, mode });
  const isVert = height > width;
  const s = width / 1080;

  const progGradId = `prog-grad-${seed}`;
  const defs = svgGradient(progGradId, {
    type: "linear", x1: 0, y1: 0, x2: isVert ? 0 : 1, y2: isVert ? 1 : 0,
    stops: [
      { offset: "0%", color: t.bg, opacity: 0.92 },
      { offset: "50%", color: t.bg, opacity: 0.5 },
      { offset: "100%", color: t.bg, opacity: 0 },
    ],
  });

  const overlay = `  <g id="overlay">\n    <rect width="${width}" height="${height}" fill="url(#${progGradId})" />\n  </g>`;
  const cx = width * 0.06;
  let cy = height * 0.08;

  const typo = [
    svgText("iade · 2026", cx, cy, { size: 8 * s, color: THREADS[0], spacing: "0.25em" }),
    svgText("trama", cx, cy + 40 * s, { size: 36 * s, color: t.wordmark || t.text, weight: 700 }),
    svgText("programa · jornadas de design", cx, cy + 60 * s, { size: 8 * s, color: t.textMuted || t.text, spacing: "0.15em", opacity: 0.5 }),
  ];

  cy = cy + 90 * s;
  PROGRAMME.forEach((item, i) => {
    const itemY = cy + i * 28 * s;
    typo.push(svgText(item.time, cx, itemY, { size: 10 * s, color: item.color, weight: 600 }));
    typo.push(svgText(item.title, cx + 60 * s, itemY, { size: 10 * s, color: item.type === "pausa" ? (t.textDim || "#555") : t.text }));
    if (item.speaker) {
      typo.push(svgText(item.speaker, cx + 400 * s, itemY, { size: 8 * s, color: t.textMuted || t.text, opacity: 0.6 }));
    }
  });

  const inner = `  <defs>\n${defs}\n  </defs>\n\n${layers.all()}\n\n${overlay}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, "Programme", seed, mode);
}

// ─── Teams Asset SVG ───

export function generateTeamsSVG({ type = "separator", width, height, seed, mode = "dark", session }) {
  const t = THEME[mode];
  const layers = generateWeaveLayersSVG({ width, height, seed, mode });

  const teamsGradId = `teams-grad-${seed}`;
  const defs = svgGradient(teamsGradId, {
    type: "linear", x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: "0%", color: t.bg, opacity: 0.7 },
      { offset: "50%", color: t.bg, opacity: 0.2 },
      { offset: "100%", color: t.bg, opacity: 0.7 },
    ],
  });

  const overlay = `  <g id="overlay">\n    <rect width="${width}" height="${height}" fill="url(#${teamsGradId})" />\n  </g>`;

  // Safe area indicator
  const safeArea = `  <g id="safe-area" opacity="0.15">\n    <rect x="${width * 0.05}" y="${height * 0.08}" width="${width * 0.9}" height="${height * 0.8}" fill="none" stroke="${t.text}" stroke-width="0.5" stroke-dasharray="4 4" />\n  </g>`;

  let typo = [];
  if (type === "separator") {
    typo.push(svgText(session?.title || "Sessão", width / 2, height / 2 + 6, { size: 18, color: session?.color || THREADS[0], weight: 600, anchor: "middle", spacing: "0.2em" }));
    typo.push(svgText("trama · jornadas de design", width / 2, height / 2 + 30, { size: 8, color: t.textMuted || t.text, anchor: "middle", spacing: "0.15em", opacity: 0.4 }));
  } else if (type === "countdown") {
    typo.push(svgText("a começar em", width / 2, height * 0.35, { size: 9, color: t.textMuted || t.text, anchor: "middle", spacing: "0.2em", opacity: 0.5 }));
    typo.push(svgText("05:00", width / 2, height * 0.5, { size: 48, color: session?.color || THREADS[0], weight: 700, anchor: "middle" }));
    typo.push(svgText(session?.title || "", width / 2, height * 0.62, { size: 11, color: t.text, anchor: "middle", weight: 600 }));
    typo.push(svgText(session?.speaker || "", width / 2, height * 0.68, { size: 9, color: t.textMuted || t.text, anchor: "middle", opacity: 0.6 }));
  } else {
    typo.push(svgText("trama", width * 0.06, height * 0.92, { size: 14, color: t.text, weight: 700, spacing: "0.08em" }));
    typo.push(svgText("jornadas de design · iade · 2026", width * 0.06, height * 0.96, { size: 7, color: t.textDim || t.textMuted || t.text, spacing: "0.12em", opacity: 0.4 }));
  }

  const inner = `  <defs>\n${defs}\n  </defs>\n\n${layers.all()}\n\n${overlay}\n\n${safeArea}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, `Teams-${type}`, seed, mode);
}

// ─── Countdown SVG (static snapshot) ───

export function generateCountdownSVG({ session, width, height, seed, mode = "dark" }) {
  return generateTeamsSVG({ type: "countdown", width, height, seed, mode, session });
}

// ─── QR Code SVG ───

export function generateQRSVG({ size = 200, seed, mode = "dark", label = "" }) {
  const t = THEME[mode];
  const gridSize = 29;
  const moduleSize = size / (gridSize + 4);
  const padding = moduleSize * 2;

  // Finder pattern colors — matches canvas: THREADS[fi * 2] where fi=0,1,2
  const finderColors = [THREADS[0], THREADS[2], THREADS[4]]; // TL, TR, BL

  // Helper: is this module ON in the finder pattern?
  function isFinderModule(fx, fy) {
    const border = fx === 0 || fx === 6 || fy === 0 || fy === 6;
    const inner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
    return border || inner;
  }

  let sections = [];
  sections.push(`  <g id="background">\n    <rect width="${size}" height="${size}" fill="${t.bg}" />\n  </g>`);

  // Background thread lines (matches canvas: 6 subtle horizontal wave lines)
  let bgThreads = [];
  for (let i = 0; i < 6; i++) {
    const basePos = (size * (i + 0.5)) / 6;
    let d = "";
    for (let x = 0; x < size; x += 2) {
      const wave = Math.sin(x * 0.015 + i) * 4;
      const y = basePos + wave;
      d += x === 0 ? `M ${x} ${y.toFixed(2)}` : ` L ${x} ${y.toFixed(2)}`;
    }
    bgThreads.push(`    <path d="${d}" stroke="${THREADS[i]}" stroke-width="0.5" fill="none" opacity="0.06" />`);
  }
  sections.push(`  <g id="background-threads">\n${bgThreads.join("\n")}\n  </g>`);

  let qrModules = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const inFinderTL = x < 7 && y < 7;
      const inFinderTR = x >= gridSize - 7 && y < 7;
      const inFinderBL = x < 7 && y >= gridSize - 7;
      const isFinder = inFinderTL || inFinderTR || inFinderBL;

      if (isFinder) {
        const fx = inFinderTL ? x : inFinderTR ? x - (gridSize - 7) : x;
        const fy = inFinderTL ? y : inFinderTR ? y : y - (gridSize - 7);
        if (isFinderModule(fx, fy)) {
          const fi = inFinderTL ? 0 : inFinderTR ? 1 : 2;
          const px = padding + x * moduleSize;
          const py = padding + y * moduleSize;
          const s = moduleSize * 0.9;
          qrModules.push(`    <rect x="${(px + (moduleSize - s) / 2).toFixed(1)}" y="${(py + (moduleSize - s) / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${finderColors[fi]}" opacity="0.90" />`);
        }
      } else {
        // Data modules: seeded random
        if (rng(seed + x * 100 + y, x * y + seed) > 0.48) {
          const colorIdx = Math.floor(rng(seed, x * 31 + y * 17) * THREADS.length);
          const useColor = rng(seed + x + y * 31, 555) > 0.7;
          const color = useColor ? THREADS[colorIdx] : t.text;
          const opacity = useColor ? (0.4 + rng(seed, x + y) * 0.3) : (0.35 + rng(seed, x + y) * 0.3);
          const px = padding + x * moduleSize;
          const py = padding + y * moduleSize;
          const s = moduleSize * 0.85;
          qrModules.push(`    <rect x="${(px + (moduleSize - s) / 2).toFixed(1)}" y="${(py + (moduleSize - s) / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" />`);
        }
      }
    }
  }

  let typo = [];
  if (label) {
    typo.push(svgText(label, size / 2, size - 4, { size: 7, color: t.textDim || t.textMuted || t.text, anchor: "middle", spacing: "0.15em", opacity: 0.5 }));
  }

  const inner = `${sections.join("\n")}\n\n  <g id="qr-modules">\n${qrModules.join("\n")}\n  </g>\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, size, size, `QR-${label}`, seed, mode);
}

// ─── Icon SVG ───

const ICON_PATHS = {
  play: (s) => `<polygon points="${s*0.3},${s*0.2} ${s*0.8},${s*0.5} ${s*0.3},${s*0.8}" fill="none" stroke="currentColor" stroke-width="${s*0.06}" stroke-linejoin="round" />`,
  pause: (s) => `<line x1="${s*0.35}" y1="${s*0.25}" x2="${s*0.35}" y2="${s*0.75}" stroke="currentColor" stroke-width="${s*0.08}" stroke-linecap="round" /><line x1="${s*0.65}" y1="${s*0.25}" x2="${s*0.65}" y2="${s*0.75}" stroke="currentColor" stroke-width="${s*0.08}" stroke-linecap="round" />`,
  mic: (s) => `<rect x="${s*0.38}" y="${s*0.15}" width="${s*0.24}" height="${s*0.4}" rx="${s*0.12}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><path d="M ${s*0.28} ${s*0.5} Q ${s*0.28} ${s*0.72} ${s*0.5} ${s*0.72} Q ${s*0.72} ${s*0.72} ${s*0.72} ${s*0.5}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><line x1="${s*0.5}" y1="${s*0.72}" x2="${s*0.5}" y2="${s*0.85}" stroke="currentColor" stroke-width="${s*0.05}" />`,
  camera: (s) => `<rect x="${s*0.15}" y="${s*0.3}" width="${s*0.7}" height="${s*0.45}" rx="${s*0.04}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><circle cx="${s*0.5}" cy="${s*0.52}" r="${s*0.12}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" />`,
  link: (s) => `<path d="M ${s*0.55} ${s*0.35} L ${s*0.65} ${s*0.25} Q ${s*0.8} ${s*0.1} ${s*0.85} ${s*0.35}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><path d="M ${s*0.45} ${s*0.65} L ${s*0.35} ${s*0.75} Q ${s*0.2} ${s*0.9} ${s*0.15} ${s*0.65}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" />`,
  download: (s) => `<line x1="${s*0.5}" y1="${s*0.2}" x2="${s*0.5}" y2="${s*0.6}" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" /><polyline points="${s*0.35},${s*0.5} ${s*0.5},${s*0.65} ${s*0.65},${s*0.5}" fill="none" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" stroke-linejoin="round" /><line x1="${s*0.25}" y1="${s*0.8}" x2="${s*0.75}" y2="${s*0.8}" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" />`,
  share: (s) => `<circle cx="${s*0.7}" cy="${s*0.25}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><circle cx="${s*0.3}" cy="${s*0.5}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><circle cx="${s*0.7}" cy="${s*0.75}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><line x1="${s*0.37}" y1="${s*0.45}" x2="${s*0.63}" y2="${s*0.3}" stroke="currentColor" stroke-width="${s*0.04}" /><line x1="${s*0.37}" y1="${s*0.55}" x2="${s*0.63}" y2="${s*0.7}" stroke="currentColor" stroke-width="${s*0.04}" />`,
  arrow_right: (s) => `<line x1="${s*0.2}" y1="${s*0.5}" x2="${s*0.75}" y2="${s*0.5}" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" /><polyline points="${s*0.6},${s*0.35} ${s*0.75},${s*0.5} ${s*0.6},${s*0.65}" fill="none" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" stroke-linejoin="round" />`,
  arrow_left: (s) => `<line x1="${s*0.8}" y1="${s*0.5}" x2="${s*0.25}" y2="${s*0.5}" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" /><polyline points="${s*0.4},${s*0.35} ${s*0.25},${s*0.5} ${s*0.4},${s*0.65}" fill="none" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" stroke-linejoin="round" />`,
  clock: (s) => `<circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.32}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><line x1="${s*0.5}" y1="${s*0.5}" x2="${s*0.5}" y2="${s*0.28}" stroke="currentColor" stroke-width="${s*0.05}" stroke-linecap="round" /><line x1="${s*0.5}" y1="${s*0.5}" x2="${s*0.65}" y2="${s*0.55}" stroke="currentColor" stroke-width="${s*0.04}" stroke-linecap="round" />`,
  user: (s) => `<circle cx="${s*0.5}" cy="${s*0.32}" r="${s*0.14}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><path d="M ${s*0.22} ${s*0.82} Q ${s*0.22} ${s*0.58} ${s*0.5} ${s*0.58} Q ${s*0.78} ${s*0.58} ${s*0.78} ${s*0.82}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" />`,
  grid: (s) => `<rect x="${s*0.18}" y="${s*0.18}" width="${s*0.24}" height="${s*0.24}" rx="${s*0.03}" fill="none" stroke="currentColor" stroke-width="${s*0.04}" /><rect x="${s*0.58}" y="${s*0.18}" width="${s*0.24}" height="${s*0.24}" rx="${s*0.03}" fill="none" stroke="currentColor" stroke-width="${s*0.04}" /><rect x="${s*0.18}" y="${s*0.58}" width="${s*0.24}" height="${s*0.24}" rx="${s*0.03}" fill="none" stroke="currentColor" stroke-width="${s*0.04}" /><rect x="${s*0.58}" y="${s*0.58}" width="${s*0.24}" height="${s*0.24}" rx="${s*0.03}" fill="none" stroke="currentColor" stroke-width="${s*0.04}" />`,
  search: (s) => `<circle cx="${s*0.42}" cy="${s*0.42}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><line x1="${s*0.58}" y1="${s*0.58}" x2="${s*0.78}" y2="${s*0.78}" stroke="currentColor" stroke-width="${s*0.06}" stroke-linecap="round" />`,
  settings: (s) => `<circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="${s*0.05}" /><circle cx="${s*0.5}" cy="${s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="${s*0.04}" stroke-dasharray="${s*0.08} ${s*0.1}" />`,
  weave: (s) => `<line x1="${s*0.1}" y1="${s*0.35}" x2="${s*0.9}" y2="${s*0.35}" stroke="currentColor" stroke-width="${s*0.04}" opacity="0.5" /><line x1="${s*0.1}" y1="${s*0.65}" x2="${s*0.9}" y2="${s*0.65}" stroke="currentColor" stroke-width="${s*0.04}" opacity="0.5" /><line x1="${s*0.35}" y1="${s*0.1}" x2="${s*0.35}" y2="${s*0.9}" stroke="currentColor" stroke-width="${s*0.04}" opacity="0.5" /><line x1="${s*0.65}" y1="${s*0.1}" x2="${s*0.65}" y2="${s*0.9}" stroke="currentColor" stroke-width="${s*0.04}" opacity="0.5" />`,
};

export function generateIconSVG({ icon, size = 64, color = "#e2ded8", bgColor = "#070709" }) {
  const pathFn = ICON_PATHS[icon];
  if (!pathFn) return "";

  // Subtle thread background (matches canvas drawThreadBg)
  let bgThreads = [];
  for (let i = 0; i < 3; i++) {
    const baseY = (size * (i + 0.5)) / 3;
    let d = "";
    for (let x = 0; x < size; x += 1.5) {
      const wave = Math.sin(x * 0.04 + i * 2) * 2;
      const y = baseY + wave;
      d += x === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    bgThreads.push(`    <path d="${d}" stroke="${color}" stroke-width="0.3" fill="none" opacity="0.08" />`);
  }
  const threadBg = `  <g id="thread-bg">\n${bgThreads.join("\n")}\n  </g>`;

  const content = `  <rect width="${size}" height="${size}" fill="${bgColor}" />\n${threadBg}\n  <g style="color:${color}">\n    ${pathFn(size)}\n  </g>`;
  return wrapSVG(content, size, size, `Icon-${icon}`, 0, "dark");
}

// ─── Carousel Slide SVG ───
// Matches canvas rendering in InstagramCarousel/SocialProfiles:
// - Thread count: slideIndex-specific (5 + slideIndex*2 for Instagram, 4 + slideIndex*2 for Social)
// - Lower opacity, amplitude, speed than default weave
// - Vertical threads at 70-80% reduction
// - Overlay gradient: transparent 30% → bg+dd 100%

export function generateCarouselSlideSVG({ slide, width = 1080, height = 1080, seed, mode = "dark", slideIndex = 0 }) {
  const t = THEME[mode];

  // Carousel-specific thread generation (matches InstagramCarousel canvas)
  const threadCount = 5 + slideIndex * 2;
  const hPaths = [], vPaths = [];

  const threads = [];
  for (let i = 0; i < threadCount; i++) {
    threads.push({
      base: (height * (i + 0.5)) / threadCount,
      color: THREADS[Math.floor(rng(seed, i + 300) * THREADS.length)],
      speed: 0.08 + rng(seed, i + 400) * 0.3,
      phase: rng(seed, i + 500) * Math.PI * 2,
      amp: 2 + rng(seed, i + 600) * 12,
      opacity: 0.15 + rng(seed, i + 700) * 0.3,
      thick: 0.4 + rng(seed, i + 800) * 1.5,
    });
  }

  // Horizontal threads
  threads.forEach(th => {
    let d = "";
    for (let x = 0; x < width; x += 2) {
      const wave = Math.sin(x * 0.008 + th.phase) * th.amp;
      const y = th.base + wave;
      d += x === 0 ? `M ${x} ${y.toFixed(2)}` : ` L ${x} ${y.toFixed(2)}`;
    }
    hPaths.push(`    <path d="${d}" stroke="${th.color}" stroke-width="${th.thick.toFixed(2)}" fill="none" opacity="${th.opacity.toFixed(2)}" />`);
  });

  // Vertical threads (70% amplitude/speed reduction, 80% thickness, matching canvas)
  threads.forEach(th => {
    let d = "";
    for (let y = 0; y < height; y += 2) {
      const wave = Math.sin(y * 0.008 + th.phase + 1) * th.amp * 0.8;
      const x = th.base + wave;
      d += y === 0 ? `M ${x.toFixed(2)} ${y}` : ` L ${x.toFixed(2)} ${y}`;
    }
    vPaths.push(`    <path d="${d}" stroke="${th.color}" stroke-width="${(th.thick * 0.8).toFixed(2)}" fill="none" opacity="${(th.opacity * 0.7).toFixed(2)}" />`);
  });

  // Overlay gradient: matches CSS `linear-gradient(180deg, transparent 30%, ${t.bg}dd 100%)`
  // dd hex = ~87% opacity
  const slideGradId = `slide-grad-${seed}-${slideIndex}`;
  const defs = svgGradient(slideGradId, {
    type: "linear", x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: "0%", color: t.bg, opacity: 0 },
      { offset: "30%", color: t.bg, opacity: 0 },
      { offset: "100%", color: t.bg, opacity: 0.87 },
    ],
  });

  const bg = `  <g id="background">\n    <rect width="${width}" height="${height}" fill="${t.bg}" />\n  </g>`;
  const warp = `  <g id="warp-threads">\n${vPaths.join("\n")}\n  </g>`;
  const weft = `  <g id="weft-threads">\n${hPaths.join("\n")}\n  </g>`;
  const overlay = `  <g id="overlay">\n    <rect width="${width}" height="${height}" fill="url(#${slideGradId})" />\n  </g>`;

  const typo = [
    svgText(slide?.headline || "", width * 0.08, height * 0.4, { size: 32, color: t.text, weight: 700 }),
    svgText(slide?.sub || "", width * 0.08, height * 0.48, { size: 14, color: t.textMuted || t.text, family: "'Instrument Serif', serif", opacity: 0.7 }),
    svgText(slide?.body || "", width * 0.08, height * 0.56, { size: 11, color: t.textMuted || t.text, opacity: 0.5 }),
    svgText("trama · jornadas de design", width * 0.08, height * 0.92, { size: 8, color: t.textDim || t.textMuted || t.text, spacing: "0.15em", opacity: 0.3 }),
  ];

  const inner = `  <defs>\n${defs}\n  </defs>\n\n${bg}\n\n${warp}\n\n${weft}\n\n${overlay}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, "Carousel-Slide", seed, mode);
}

// ─── Interactive snapshot SVG (static frame) ───

export function generateInteractiveSnapshotSVG({ width, height, seed, mode = "dark", phase = "weave" }) {
  const t = THEME[mode];
  const density = phase === "reveal" ? "dense" : "normal";
  const layers = generateWeaveLayersSVG({ width, height, seed, mode, density });

  let typo = [];
  if (phase === "reveal" || phase === "info") {
    typo.push(svgText("trama", width / 2, height * 0.5, { size: Math.min(width * 0.15, 80), color: t.wordmark || t.text, weight: 700, anchor: "middle" }));
    typo.push(svgText("jornadas de design", width / 2, height * 0.5 + 30, { size: 10, color: t.textMuted || t.text, anchor: "middle", spacing: "0.2em", opacity: 0.5 }));
  }

  const inner = `${layers.all()}\n\n  <g id="typography">\n${typo.join("\n")}\n  </g>`;
  return wrapSVG(inner, width, height, `Interactive-${phase}`, seed, mode);
}

// ─── Animation Sequence Export ───

export function generateAnimationSequenceSVGs({ width, height, seed, mode = "dark", frames = 30, duration = 5.0 }) {
  const svgs = [];
  for (let i = 0; i < frames; i++) {
    const time = (i / frames) * duration;
    const layers = generateWeaveLayersSVG({ width, height, seed, mode, time });
    const svg = wrapSVG(layers.all(), width, height, `Frame-${i + 1}-of-${frames}`, seed, mode);
    svgs.push({ content: svg, filename: `trama-frame-${String(i + 1).padStart(4, "0")}.svg` });
  }
  return svgs;
}

export function generateCustomAnimationSequenceSVGs({ width, height, seed, mode, hCount, vCount, thickness, amplitude, hSpeed, vSpeed, colors, frames = 30, duration = 5.0 }) {
  const svgs = [];
  for (let i = 0; i < frames; i++) {
    const time = (i / frames) * duration;
    const layers = generateCustomWeaveLayersSVG({ width, height, seed, mode, hCount, vCount, thickness, amplitude, hSpeed, vSpeed, time, colors });
    const svg = wrapSVG(layers.all(), width, height, `Frame-${i + 1}-of-${frames}`, seed, mode);
    svgs.push({ content: svg, filename: `trama-frame-${String(i + 1).padStart(4, "0")}.svg` });
  }
  return svgs;
}

// ─── Palette SVG ───

export function generatePaletteSVG({ mode = "dark" }) {
  const t = THEME[mode];
  const allColors = [...THREADS, THEME.dark.bg, THEME.light.bg];
  const w = 800, h = 200;
  const swatchW = 80, swatchH = 80;
  const gap = 12;
  const startX = 20;
  const startY = 20;

  let swatches = [];
  allColors.forEach((c, i) => {
    const x = startX + i * (swatchW + gap);
    swatches.push(`    <rect x="${x}" y="${startY}" width="${swatchW}" height="${swatchH}" rx="3" fill="${c}" stroke="${t.borderHover}" stroke-width="1" />`);
    swatches.push(svgText(c, x + swatchW / 2, startY + swatchH + 16, { size: 8, color: t.textMuted || "#888", anchor: "middle", spacing: "0.06em" }));
  });

  const inner = `  <g id="background">\n    <rect width="${w}" height="${h}" fill="${t.bg}" />\n  </g>\n\n  <g id="swatches">\n${swatches.join("\n")}\n  </g>`;
  return wrapSVG(inner, w, h, "Palette", 0, mode);
}

export function generateGradientSVG({ mode = "dark" }) {
  const t = THEME[mode];
  const w = 800, h = 120;

  const stops = THREADS.map((c, i) => ({ offset: `${(i / (THREADS.length - 1) * 100).toFixed(0)}%`, color: c, opacity: 1 }));
  const defs = svgGradient("palette-grad", { type: "linear", x1: 0, y1: 0, x2: 1, y2: 0, stops });

  const labels = THREADS.map((c, i) => {
    const x = 20 + (i / (THREADS.length - 1)) * 760;
    return svgText(c, x, h - 10, { size: 7, color: t.textDim || "#666", anchor: "middle", spacing: "0.06em" });
  });

  const inner = `  <defs>\n${defs}\n  </defs>\n\n  <g id="background">\n    <rect width="${w}" height="${h}" fill="${t.bg}" />\n  </g>\n\n  <g id="gradient">\n    <rect x="20" y="20" width="760" height="52" rx="3" fill="url(#palette-grad)" stroke="${t.borderHover}" stroke-width="1" />\n  </g>\n\n  <g id="labels">\n${labels.join("\n")}\n  </g>`;
  return wrapSVG(inner, w, h, "Gradient", 0, mode);
}

// ─── Download Helpers ───

export function downloadSVG(svgContent, filename = "trama-background.svg") {
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAllSVGs(svgs) {
  // Sequential downloads with small delay to avoid browser blocking
  svgs.forEach((svg, i) => {
    setTimeout(() => downloadSVG(svg.content, svg.filename), i * 100);
  });
}

// ─── PNG download from canvas ───

export function downloadCanvasPNG(canvas, filename = "trama-export.png") {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, "image/png");
}
