import { useState, useRef, useEffect, useCallback } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import ExportButton from "./ExportButton";
import JSZip from "jszip";
import {
  generateCustomWeaveLayersSVG,
  generateCustomAnimationSequenceSVGs,
  wrapSVG,
  downloadSVG,
} from "../utils/exportSVG";
import { generateThreadStudioHTML, downloadHTML } from "../utils/exportHTML";

// ─── Presets ───
const PRESETS = {
  minimal: { hCount: 4, vCount: 4, thickness: 0.6, amplitude: 5, hSpeed: 0.15, vSpeed: 0.1, opacity: 0.5 },
  normal: { hCount: 12, vCount: 12, thickness: 1.5, amplitude: 10, hSpeed: 0.3, vSpeed: 0.2, opacity: 0.6 },
  denso: { hCount: 22, vCount: 22, thickness: 1.2, amplitude: 12, hSpeed: 0.25, vSpeed: 0.2, opacity: 0.5 },
  ultra: { hCount: 40, vCount: 40, thickness: 0.8, amplitude: 18, hSpeed: 0.15, vSpeed: 0.12, opacity: 0.4 },
};

// ─── Slider Control ───
function Slider({ label, value, min, max, step, onChange, color, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", minWidth: 70, textTransform: "uppercase" }}>
        {label}
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: color, cursor: "pointer", height: 2 }} />
      <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 32, textAlign: "right" }}>
        {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value}
      </span>
    </div>
  );
}

export default function ThreadStudio({ mode }) {
  const t = THEME[mode];
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // ─── Parameters ───
  const [hCount, setHCount] = useState(12);
  const [vCount, setVCount] = useState(12);
  const [thickness, setThickness] = useState(1.5);
  const [amplitude, setAmplitude] = useState(10);
  const [hSpeed, setHSpeed] = useState(0.3);
  const [vSpeed, setVSpeed] = useState(0.2);
  const [opacity, setOpacity] = useState(0.6);
  const [seed, setSeed] = useState(42);
  const [format, setFormat] = useState("horizontal");
  const [studioMode, setStudioMode] = useState(mode);
  const [activeColors, setActiveColors] = useState(THREADS.map(() => true));
  const [recording, setRecording] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [animated, setAnimated] = useState(true);
  const [containerW, setContainerW] = useState(800);

  // Real output dimensions
  const W = format === "horizontal" ? 1920 : 1080;
  const H = format === "horizontal" ? 1080 : 1920;
  const aspect = W / H;

  // Responsive: canvas fills container width, height follows aspect ratio
  const displayW = containerW;
  const displayH = Math.round(containerW / aspect);

  const filteredColors = THREADS.filter((_, i) => activeColors[i]);
  const colors = filteredColors.length > 0 ? filteredColors : THREADS;

  // ─── Measure container width ───
  useEffect(() => {
    if (!wrapperRef.current) return;
    setContainerW(wrapperRef.current.clientWidth);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setContainerW(e.contentRect.width);
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // ─── Apply preset ───
  const applyPreset = (name) => {
    const p = PRESETS[name];
    if (!p) return;
    setHCount(p.hCount); setVCount(p.vCount);
    setThickness(p.thickness); setAmplitude(p.amplitude);
    setHSpeed(p.hSpeed); setVSpeed(p.vSpeed);
    setOpacity(p.opacity);
  };

  const randomize = () => {
    setHCount(Math.floor(Math.random() * 50) + 2);
    setVCount(Math.floor(Math.random() * 50) + 2);
    setThickness(+(0.3 + Math.random() * 5).toFixed(1));
    setAmplitude(+(Math.random() * 40).toFixed(1));
    setHSpeed(+(0.05 + Math.random() * 1.5).toFixed(2));
    setVSpeed(+(0.05 + Math.random() * 1.5).toFixed(2));
    setOpacity(+(0.15 + Math.random() * 0.85).toFixed(2));
    setSeed(Math.floor(Math.random() * 9999));
  };

  // ─── Canvas Animation (responsive) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayW < 10) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    const st = THEME[studioMode];
    const scaleX = displayW / W;
    const scaleY = displayH / H;

    // Generate threads
    const hThreads = [], vThreads = [];
    for (let i = 0; i < hCount; i++) {
      hThreads.push({
        baseY: (H * (i + 0.5)) / hCount * scaleY,
        thick: thickness * Math.min(scaleX, scaleY),
        color: colors[Math.floor(rng(seed, i + 300) * colors.length)],
        phase: rng(seed, i + 500) * Math.PI * 2,
        amp: amplitude * scaleY,
        op: Math.min(1, (0.2 + rng(seed, i + 700) * 0.55) * (opacity / 0.6)),
        spd: hSpeed,
      });
    }
    for (let i = 0; i < vCount; i++) {
      vThreads.push({
        baseX: (W * (i + 0.5)) / vCount * scaleX,
        thick: thickness * Math.min(scaleX, scaleY),
        color: colors[Math.floor(rng(seed, i + 900) * colors.length)],
        phase: rng(seed, i + 1100) * Math.PI * 2,
        amp: amplitude * scaleX,
        op: Math.min(1, (0.2 + rng(seed, i + 1300) * 0.55) * (opacity / 0.6)),
        spd: vSpeed,
      });
    }

    const draw = () => {
      if (animated) timeRef.current += 0.018;
      const time = timeRef.current;

      ctx.fillStyle = st.bg;
      ctx.fillRect(0, 0, displayW, displayH);

      // Vertical threads
      vThreads.forEach(th => {
        ctx.beginPath(); ctx.strokeStyle = th.color; ctx.globalAlpha = th.op; ctx.lineWidth = th.thick;
        for (let y = 0; y < displayH; y += 2) {
          const wave = Math.sin(y * 0.007 / scaleY + time * th.spd + th.phase) * th.amp;
          const x = th.baseX + wave;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Horizontal threads
      hThreads.forEach(th => {
        ctx.beginPath(); ctx.strokeStyle = th.color; ctx.globalAlpha = th.op; ctx.lineWidth = th.thick;
        for (let x = 0; x < displayW; x += 2) {
          const wave = Math.sin(x * 0.007 / scaleX + time * th.spd + th.phase) * th.amp;
          const y = th.baseY + wave;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Intersection glows
      ctx.globalAlpha = 1;
      hThreads.forEach(h => {
        vThreads.forEach(v => {
          if (rng(Math.floor(v.baseX) * 100 + Math.floor(h.baseY), seed) < 0.012) {
            const g = 0.08 + rng(v.baseX + h.baseY, seed + 1) * 0.1;
            const r2 = (2 + g * 4) * Math.min(scaleX, scaleY);
            const grad = ctx.createRadialGradient(v.baseX, h.baseY, 0, v.baseX, h.baseY, r2);
            grad.addColorStop(0, `rgba(${st.glow},${g * 0.5})`);
            grad.addColorStop(1, `rgba(${st.glow},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(v.baseX, h.baseY, r2, 0, Math.PI * 2); ctx.fill();
          }
        });
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [hCount, vCount, thickness, amplitude, hSpeed, vSpeed, opacity, seed, format, studioMode, activeColors, animated, displayW, displayH]);

  // ─── Export: SVG single ───
  const exportSVG = () => {
    const layers = generateCustomWeaveLayersSVG({ width: W, height: H, seed, mode: studioMode, hCount, vCount, thickness, amplitude, hSpeed, vSpeed, time: 0, colors });
    const svg = wrapSVG(layers.all(), W, H, "ThreadStudio", seed, studioMode);
    downloadSVG(svg, `trama-studio-${W}x${H}-${seed}.svg`);
  };

  // ─── Export: SVG sequence (25fps → ZIP) ───
  const exportSVGSequence = async () => {
    setExporting("svg-seq");
    const fps = 25;
    const duration = 5.0;
    const totalFrames = fps * duration;
    const svgs = generateCustomAnimationSequenceSVGs({ width: W, height: H, seed, mode: studioMode, hCount, vCount, thickness, amplitude, hSpeed, vSpeed, colors, frames: totalFrames, duration });
    const zip = new JSZip();
    svgs.forEach(svg => zip.file(svg.filename, svg.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `trama-svg-seq-${W}x${H}-${seed}-${totalFrames}f.zip`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExporting(null);
  };

  // ─── Export: PNG single (full resolution) ───
  const exportPNG = () => {
    const offscreen = document.createElement("canvas");
    offscreen.width = W; offscreen.height = H;
    const ctx = offscreen.getContext("2d");
    drawAtFullRes(ctx, W, H);
    offscreen.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `trama-studio-${W}x${H}-${seed}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }, "image/png");
  };

  // ─── Export: PNG sequence (25fps → ZIP) ───
  const exportPNGSequence = async () => {
    setExporting("png-seq");
    const fps = 25;
    const duration = 5.0;
    const totalFrames = fps * duration;
    const zip = new JSZip();

    for (let f = 0; f < totalFrames; f++) {
      const time = (f / totalFrames) * duration;
      const offscreen = document.createElement("canvas");
      offscreen.width = W; offscreen.height = H;
      const ctx = offscreen.getContext("2d");
      drawAtFullRes(ctx, W, H, time);
      const blob = await new Promise(resolve => offscreen.toBlob(resolve, "image/png"));
      zip.file(`trama-frame-${String(f + 1).padStart(4, "0")}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a"); a.href = url;
    a.download = `trama-png-seq-${W}x${H}-${seed}-${totalFrames}f.zip`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExporting(null);
  };

  // ─── Draw at full resolution (shared helper) ───
  const drawAtFullRes = useCallback((ctx, w, h, timeOverride) => {
    const st = THEME[studioMode];
    const time = timeOverride !== undefined ? timeOverride : timeRef.current;
    ctx.fillStyle = st.bg;
    ctx.fillRect(0, 0, w, h);

    const fullVThreads = [];
    for (let i = 0; i < vCount; i++) {
      fullVThreads.push({
        baseX: (w * (i + 0.5)) / vCount,
        color: colors[Math.floor(rng(seed, i + 900) * colors.length)],
        phase: rng(seed, i + 1100) * Math.PI * 2,
        op: Math.min(1, (0.2 + rng(seed, i + 1300) * 0.55) * (opacity / 0.6)),
      });
    }
    const fullHThreads = [];
    for (let i = 0; i < hCount; i++) {
      fullHThreads.push({
        baseY: (h * (i + 0.5)) / hCount,
        color: colors[Math.floor(rng(seed, i + 300) * colors.length)],
        phase: rng(seed, i + 500) * Math.PI * 2,
        op: Math.min(1, (0.2 + rng(seed, i + 700) * 0.55) * (opacity / 0.6)),
      });
    }

    fullVThreads.forEach(th => {
      ctx.beginPath(); ctx.strokeStyle = th.color; ctx.globalAlpha = th.op; ctx.lineWidth = thickness;
      for (let y = 0; y < h; y += 2) {
        const wave = Math.sin(y * 0.007 + time * vSpeed + th.phase) * amplitude;
        const x = th.baseX + wave;
        y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    fullHThreads.forEach(th => {
      ctx.beginPath(); ctx.strokeStyle = th.color; ctx.globalAlpha = th.op; ctx.lineWidth = thickness;
      for (let x = 0; x < w; x += 2) {
        const wave = Math.sin(x * 0.007 + time * hSpeed + th.phase) * amplitude;
        const y = th.baseY + wave;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Intersection glows
    ctx.globalAlpha = 1;
    fullHThreads.forEach(ht => {
      fullVThreads.forEach(vt => {
        if (rng(Math.floor(vt.baseX) * 100 + Math.floor(ht.baseY), seed) < 0.012) {
          const g = 0.08 + rng(vt.baseX + ht.baseY, seed + 1) * 0.1;
          const r2 = 2 + g * 4;
          const grad = ctx.createRadialGradient(vt.baseX, ht.baseY, 0, vt.baseX, ht.baseY, r2);
          grad.addColorStop(0, `rgba(${st.glow},${g * 0.5})`);
          grad.addColorStop(1, `rgba(${st.glow},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(vt.baseX, ht.baseY, r2, 0, Math.PI * 2); ctx.fill();
        }
      });
    });
    ctx.globalAlpha = 1;
  }, [hCount, vCount, thickness, amplitude, hSpeed, vSpeed, opacity, seed, studioMode, colors]);

  // ─── Export: Video (WebM) ───
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `trama-studio-${W}x${H}-${seed}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setRecording(false);
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    setTimeout(() => { if (recorderRef.current && recorderRef.current.state === "recording") recorderRef.current.stop(); }, 5000);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") recorderRef.current.stop();
  };

  // ─── Toggle color ───
  const toggleColor = (idx) => {
    setActiveColors(prev => { const n = [...prev]; n[idx] = !n[idx]; return n; });
  };

  const accentColor = THREADS[3];
  const pct = Math.round((displayW / W) * 100);

  return (
    <div ref={wrapperRef}>
      {/* Format + Mode */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "horizontal", label: "1920 × 1080" },
          { id: "vertical", label: "1080 × 1920" },
        ].map(f => (
          <button key={f.id} onClick={() => setFormat(f.id)} style={{
            background: format === f.id ? `${accentColor}15` : "transparent",
            border: `1px solid ${format === f.id ? accentColor : t.border}`,
            color: format === f.id ? accentColor : t.textMuted,
            padding: "6px 14px", fontSize: 9, letterSpacing: "0.1em",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
          }}>{f.label}</button>
        ))}
        <div style={{ width: 1, background: t.border, margin: "0 4px" }} />
        <button onClick={() => setAnimated(!animated)} style={{
          background: animated ? `${THREADS[2]}15` : "transparent",
          border: `1px solid ${animated ? THREADS[2] : t.border}`,
          color: animated ? THREADS[2] : t.textMuted,
          padding: "6px 14px", fontSize: 9, letterSpacing: "0.1em",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>{animated ? "▶ animado" : "■ estático"}</button>
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", fontFamily: "'Roboto Mono', monospace", alignSelf: "center", marginRight: 4, textTransform: "uppercase" }}>
          presets
        </span>
        {Object.keys(PRESETS).map(name => (
          <button key={name} onClick={() => applyPreset(name)} style={{
            background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
            padding: "4px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
          }}
            onMouseEnter={e => { e.target.style.borderColor = accentColor; e.target.style.color = accentColor; }}
            onMouseLeave={e => { e.target.style.borderColor = t.border; e.target.style.color = t.textMuted; }}
          >{name}</button>
        ))}
        <button onClick={randomize} style={{
          background: `${THREADS[2]}15`, border: `1px solid ${THREADS[2]}40`, color: THREADS[2],
          padding: "4px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>↻ random</button>
      </div>

      {/* Canvas — full width, responsive */}
      <div style={{ border: `1px solid ${t.border}`, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
        <canvas ref={canvasRef} style={{ width: displayW, height: displayH, display: "block" }} />
      </div>

      {/* Scale + recording indicators */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace" }}>
          {W}×{H}{pct < 100 && ` · ${pct}%`}
        </span>
        {recording && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3c00", animation: "pulse 1s infinite" }} />
            <span style={{ fontSize: 8, color: THREADS[0], fontFamily: "'Roboto Mono', monospace", letterSpacing: "0.1em" }}>
              gravando · 5s
            </span>
          </div>
        )}
        {exporting && (
          <span style={{ fontSize: 8, color: THREADS[2], fontFamily: "'Roboto Mono', monospace", letterSpacing: "0.1em" }}>
            exportando {exporting}...
          </span>
        )}
      </div>

      {/* Controls — sliders + colors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px", marginBottom: 16 }}>
        <div>
          <Slider label="linhas h" value={hCount} min={1} max={60} step={1} onChange={setHCount} color={THREADS[0]} t={t} />
          <Slider label="linhas v" value={vCount} min={1} max={60} step={1} onChange={setVCount} color={THREADS[1]} t={t} />
          <Slider label="espessura" value={thickness} min={0.3} max={8} step={0.1} onChange={setThickness} color={THREADS[2]} t={t} />
          <Slider label="amplitude" value={amplitude} min={0} max={50} step={0.5} onChange={setAmplitude} color={THREADS[3]} t={t} />
        </div>
        <div>
          <Slider label="vel. h" value={hSpeed} min={0} max={10} step={0.05} onChange={setHSpeed} color={THREADS[4]} t={t} />
          <Slider label="vel. v" value={vSpeed} min={0} max={10} step={0.05} onChange={setVSpeed} color={THREADS[5]} t={t} />
          <Slider label="opacidade" value={opacity} min={0.1} max={1} step={0.05} onChange={setOpacity} color={accentColor} t={t} />

          {/* Seed */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", minWidth: 70, textTransform: "uppercase" }}>
              seed
            </span>
            <span style={{ fontSize: 10, color: t.text, fontFamily: "'Roboto Mono', monospace" }}>{seed}</span>
            <button onClick={() => setSeed(Math.floor(Math.random() * 9999))} style={{
              background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
              padding: "2px 8px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
            }}>↻</button>
          </div>
        </div>
      </div>

      {/* Color toggles */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
          cores activas
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {THREADS.map((color, i) => (
            <button key={i} onClick={() => toggleColor(i)} style={{
              width: 22, height: 22, borderRadius: 3, cursor: "pointer",
              background: activeColors[i] ? color : "transparent",
              border: `2px solid ${activeColors[i] ? color : t.border}`,
              opacity: activeColors[i] ? 1 : 0.3,
              transition: "opacity 0.2s",
            }} />
          ))}
        </div>
      </div>

      {/* Export bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em", fontFamily: "'Roboto Mono', monospace", textTransform: "uppercase", marginRight: 4 }}>
          exportar
        </span>
        <ExportButton mode={mode} label="svg" onClick={exportSVG} />
        <ExportButton mode={mode} label="png" onClick={exportPNG} />
        <ExportButton mode={mode} label="svg seq · 25fps · zip" onClick={exportSVGSequence} style={{ opacity: exporting === "svg-seq" ? 0.5 : 1 }} />
        <ExportButton mode={mode} label="png seq · 25fps · zip" onClick={exportPNGSequence} style={{ opacity: exporting === "png-seq" ? 0.5 : 1 }} />
        <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateThreadStudioHTML({ seed, mode }), `trama-weave-${seed}-${mode}.html`)} />
        {!recording ? (
          <button onClick={startRecording} style={{
            background: `${THREADS[0]}15`, border: `1px solid ${THREADS[0]}40`, color: THREADS[0],
            padding: "3px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
          }}>● rec webm · 5s</button>
        ) : (
          <button onClick={stopRecording} style={{
            background: `${THREADS[0]}30`, border: `1px solid ${THREADS[0]}`, color: THREADS[0],
            padding: "3px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
          }}>■ parar</button>
        )}
      </div>

      {/* Info footer */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 10, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", flexWrap: "wrap" }}>
        <span>{W}×{H}</span>
        <span>{hCount}h + {vCount}v threads</span>
        <span>thick {thickness}</span>
        <span>amp {amplitude}</span>
        <span>seed #{seed}</span>
        <span>{studioMode}</span>
        <span>{colors.length} cores</span>
        <span>{animated ? "animado" : "estático"}</span>
      </div>
    </div>
  );
}
