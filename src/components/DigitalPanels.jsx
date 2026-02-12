import { THREADS, THEME } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import { generateDigitalPanelSVG, downloadSVG } from "../utils/exportSVG";
import { generateDigitalPanelHTML, downloadHTML } from "../utils/exportHTML";

// Shared overlay — works at any size (thumbnail or fullsize)
function PanelOverlay({ w, h, isVert, t }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      padding: w * 0.06,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: `linear-gradient(180deg, ${t.overlay || t.bg + "cc"} 0%, transparent 35%, transparent 60%, ${t.bg}ee 100%)`,
    }}>
      <div>
        <div style={{ fontSize: w * 0.025, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase" }}>
          iade · 1ª edição · 2026
        </div>
      </div>
      <div>
        <div style={{
          fontSize: isVert ? w * 0.2 : w * 0.12, fontWeight: 700, lineHeight: 0.85,
          color: t.wordmark, letterSpacing: "-0.03em",
        }}>trama</div>
        <div style={{ height: Math.max(1, w * 0.001), width: w * 0.12, background: THREADS[0], margin: `${w * 0.008}px 0 ${w * 0.01}px` }} />
        <div style={{
          fontSize: w * 0.035, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textMuted,
        }}>jornadas de design</div>
        <div style={{ display: "flex", gap: w * 0.006, marginTop: w * 0.01, flexWrap: "wrap" }}>
          {["15 maio", "online", "entrada livre"].map((tag, i) => (
            <span key={i} style={{
              fontSize: w * 0.025, padding: `${w * 0.002}px ${w * 0.005}px`,
              border: `1px solid ${t.border}`, color: t.textMuted, letterSpacing: "0.08em",
            }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: w * 0.003, marginTop: w * 0.012 }}>
          {THREADS.map((c, i) => (
            <div key={i} style={{ width: w * 0.04, height: Math.max(2, w * 0.002), background: c, opacity: 0.4, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DigitalPanel({ format, mode = "dark", seed = 42 }) {
  const t = THEME[mode];
  const isVert = format === "vertical";
  const w = isVert ? 180 : 340;
  const h = isVert ? 320 : 191;
  const fullW = isVert ? 1080 : 1920;
  const fullH = isVert ? 1920 : 1080;

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <WeaveCanvas width={w} height={h} seed={seed} interactive={false} mode={mode} />
      <PanelOverlay w={w} h={h} isVert={isVert} t={t} />
    </div>
  );
}

export default function DigitalPanels({ mode }) {
  const t = THEME[mode];

  return (
    <div>
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[5]}`, paddingLeft: 10 }}>
        painéis digitais · 1920 × 1080
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        <div>
          <DigitalPanel format="horizontal" mode="dark" seed={42} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark 16:9" onClick={() => downloadSVG(generateDigitalPanelSVG({ width: 1920, height: 1080, seed: 42, mode: "dark" }), "trama-panel-horizontal-dark-42.svg")} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateDigitalPanelHTML({ seed: 42, mode: "dark" }), "trama-panel-dark-42.html")} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[5]}`, paddingLeft: 10 }}>
        painéis digitais · 1080 × 1920
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
        <div>
          <DigitalPanel format="vertical" mode="dark" seed={42} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark 9:16 #42" onClick={() => downloadSVG(generateDigitalPanelSVG({ width: 1080, height: 1920, seed: 42, mode: "dark" }), "trama-panel-vertical-dark-42.svg")} />
            <ExportButton mode={mode} label="html #42" onClick={() => downloadHTML(generateDigitalPanelHTML({ seed: 42, mode: "dark" }), "trama-panel-v-dark-42.html")} />
          </div>
        </div>
        <div>
          <DigitalPanel format="vertical" mode="dark" seed={99} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <ExportButton mode={mode} label="svg dark 9:16 #99" onClick={() => downloadSVG(generateDigitalPanelSVG({ width: 1080, height: 1920, seed: 99, mode: "dark" }), "trama-panel-vertical-dark-99.svg")} />
            <ExportButton mode={mode} label="html #99" onClick={() => downloadHTML(generateDigitalPanelHTML({ seed: 99, mode: "dark" }), "trama-panel-v-dark-99.html")} />
          </div>
        </div>
      </div>
    </div>
  );
}
