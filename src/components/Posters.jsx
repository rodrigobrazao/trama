import { THREADS, THEME } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import { generatePosterSVG, downloadSVG } from "../utils/exportSVG";

function PosterContent({ mode, seed, speed, animated, width, height, isVertical }) {
  const t = THEME[mode];
  const W = width, H = height;
  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden" }}>
      <WeaveCanvas width={W} height={H} seed={seed} interactive={false} mode={mode} speed={speed} animated={animated} />
      {isVertical ? (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          padding: W * 0.06, display: "flex", flexDirection: "column", justifyContent: "space-between",
          background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 25%, transparent 55%, ${t.bg}ee 100%)`,
        }}>
          <div>
            <div style={{ fontSize: W * 0.03, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase" }}>iade · 2026</div>
          </div>
          <div>
            <div style={{ fontSize: W * 0.22, fontWeight: 700, lineHeight: 0.85, color: t.wordmark, letterSpacing: "-0.03em" }}>trama</div>
            <div style={{ height: 2, width: W * 0.15, background: THREADS[0], margin: `${W * 0.015}px 0 ${W * 0.02}px` }} />
            <div style={{ fontSize: W * 0.04, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textMuted }}>jornadas de design</div>
            <div style={{ display: "flex", gap: W * 0.015, marginTop: W * 0.02, flexWrap: "wrap" }}>
              {["15 maio", "online", "entrada livre"].map((tag, i) => (
                <span key={i} style={{ fontSize: W * 0.028, padding: `${W * 0.004}px ${W * 0.012}px`, border: `1px solid ${t.border}`, color: t.textMuted, letterSpacing: "0.08em" }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: W * 0.006, marginTop: W * 0.024 }}>
              {THREADS.map((c, i) => (
                <div key={i} style={{ width: W * 0.05, height: 3, background: c, opacity: 0.4, borderRadius: 1 }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          padding: H * 0.1, display: "flex", alignItems: "flex-end",
          background: `linear-gradient(90deg, ${t.bg}dd 0%, ${t.bg}88 40%, transparent 100%)`,
        }}>
          <div>
            <div style={{ fontSize: H * 0.04, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: H * 0.01 }}>iade · 2026</div>
            <div style={{ fontSize: H * 0.28, fontWeight: 700, lineHeight: 0.85, color: t.wordmark, letterSpacing: "-0.03em" }}>trama</div>
            <div style={{ height: 2, width: H * 0.06, background: THREADS[0], margin: `${H * 0.012}px 0 ${H * 0.016}px` }} />
            <div style={{ fontSize: H * 0.055, letterSpacing: "0.15em", textTransform: "uppercase", color: t.textMuted }}>jornadas de design</div>
            <div style={{ fontSize: H * 0.04, color: t.textDim, marginTop: H * 0.012 }}>15 maio · online · entrada livre</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PosterVertical({ mode, seed = 42, width = 180, speed = 1, animated = true }) {
  const t = THEME[mode];
  const h = Math.round(width * (1920 / 1080));
  return (
    <div>
        <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
          <PosterContent mode={mode} seed={seed} speed={speed} animated={animated} width={width} height={h} isVertical={true} />
        </div>
      <div style={{ marginTop: 6 }}>
        <ExportButton mode={mode} label="svg vertical" onClick={() => downloadSVG(generatePosterSVG({ type: "vertical", width: 1080, height: 1920, seed, mode }), `trama-poster-vertical-${mode}-${seed}.svg`)} />
      </div>
    </div>
  );
}

export function PosterHorizontal({ mode, seed = 42, width = 340, speed = 1, animated = true }) {
  const t = THEME[mode];
  const h = Math.round(width * (1080 / 1920));
  return (
    <div>
        <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
          <PosterContent mode={mode} seed={seed} speed={speed} animated={animated} width={width} height={h} isVertical={false} />
        </div>
      <div style={{ marginTop: 6 }}>
        <ExportButton mode={mode} label="svg horizontal" onClick={() => downloadSVG(generatePosterSVG({ type: "horizontal", width: 1920, height: 1080, seed, mode }), `trama-poster-horizontal-${mode}-${seed}.svg`)} />
      </div>
    </div>
  );
}
