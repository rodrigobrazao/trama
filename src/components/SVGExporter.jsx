import { useState } from "react";
import { THREADS, THEME } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import { generateTramaSVG, downloadSVG } from "../utils/exportSVG";

export default function SVGExporter({ mode }) {
  const [seed, setSeed] = useState(42);
  const [format, setFormat] = useState("horizontal");
  const [exportMode, setExportMode] = useState("dark");
  const t = THEME[mode];

  const dims = {
    horizontal: { w: 1920, h: 1080, label: "1920 × 1080" },
    vertical: { w: 1080, h: 1920, label: "1080 × 1920" },
  };

  const current = dims[format];
  const previewScale = format === "horizontal" ? 0.18 : 0.1;

  const handleExport = () => {
    const svg = generateTramaSVG({ width: current.w, height: current.h, seed, mode: exportMode });
    downloadSVG(svg, `trama-${format}-${exportMode}-seed${seed}.svg`);
  };

  const handleRandom = () => setSeed(Math.floor(Math.random() * 9999));

  return (
    <div>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 20, lineHeight: 1.7 }}>
        Mini-app para gerar fundos aleatórios e exportar SVG com layers para Adobe Illustrator.
        Cada export contém layers separados: background, warp-threads, weft-threads, intersection-glows.
      </p>

      {/* Controls row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {Object.entries(dims).map(([key, val]) => (
          <button key={key} onClick={() => setFormat(key)} style={{
            background: key === format ? `${THREADS[4]}15` : "transparent",
            border: `1px solid ${key === format ? THREADS[4] : t.border}`,
            color: key === format ? THREADS[4] : t.textMuted,
            padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
          }}>{val.label}</button>
        ))}

        <div style={{ width: 1, height: 20, background: t.border }} />

        {["dark", "light"].map(m => (
          <button key={m} onClick={() => setExportMode(m)} style={{
            background: m === exportMode ? `${THREADS[1]}15` : "transparent",
            border: `1px solid ${m === exportMode ? THREADS[1] : t.border}`,
            color: m === exportMode ? THREADS[1] : t.textMuted,
            padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
          }}>{m}</button>
        ))}

        <div style={{ width: 1, height: 20, background: t.border }} />

        <button onClick={handleRandom} style={{
          background: "none", border: `1px solid ${t.border}`, color: t.textMuted,
          padding: "6px 14px", fontFamily: "'Roboto Mono', monospace", fontSize: 9,
          letterSpacing: "0.1em", cursor: "pointer",
        }}>↻ random</button>

        <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.08em" }}>seed #{seed}</span>
      </div>

      {/* Big export button */}
      <button onClick={handleExport} style={{
        background: `${THREADS[2]}15`, border: `1px solid ${THREADS[2]}`,
        color: THREADS[2], padding: "10px 24px", fontFamily: "'Roboto Mono', monospace",
        fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
        cursor: "pointer", marginBottom: 24, transition: "all 0.3s",
      }}>↓ exportar svg com layers</button>

      {/* Preview */}
      <div style={{ border: `1px solid ${t.border}`, overflow: "hidden", display: "inline-block" }}>
        <WeaveCanvas
          width={Math.round(current.w * previewScale)}
          height={Math.round(current.h * previewScale)}
          seed={seed} interactive={false} mode={exportMode}
        />
      </div>
      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 6, letterSpacing: "0.1em" }}>
        preview — resolução final: {current.w} × {current.h}
      </div>

      {/* Quick variations */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, marginTop: 24, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>
        variações rápidas
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[seed, seed + 7, seed + 23, seed + 99, seed + 137, seed + 256].map(s => (
          <div key={s} style={{
            border: `1px solid ${s === seed ? THREADS[4] : t.border}`, overflow: "hidden",
            position: "relative", cursor: "pointer", transition: "border 0.3s",
          }} onClick={() => setSeed(s)}>
            <WeaveCanvas
              width={format === "horizontal" ? 96 : 54}
              height={format === "horizontal" ? 54 : 96}
              seed={s} interactive={false} mode={exportMode}
            />
            <div style={{ position: "absolute", bottom: 2, left: 4, fontSize: 6, color: THEME[exportMode].textDim }}>#{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
