import { THREADS, THEME } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";

export function PosterVertical({ mode, seed = 42, width = 220 }) {
  const t = THEME[mode];
  const height = Math.round(width * (16 / 9));
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <WeaveCanvas width={width} height={height} seed={seed} interactive={false} mode={mode} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: width * 0.06, display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 25%, transparent 55%, ${t.bg}ee 100%)`,
      }}>
        <div>
          <div style={{ fontSize: width * 0.03, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase" }}>iade · 2025</div>
        </div>
        <div>
          <div style={{
            fontSize: width * 0.22, fontWeight: 700, lineHeight: 0.85,
            color: t.wordmark, letterSpacing: "-0.03em",
          }}>trama</div>
          <div style={{ height: 1, width: width * 0.15, background: THREADS[0], margin: "8px 0 10px" }} />
          <div style={{ fontSize: width * 0.04, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textMuted }}>
            jornadas de design
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {["15 maio", "online", "entrada livre"].map((tag, i) => (
              <span key={i} style={{
                fontSize: width * 0.028, padding: "2px 6px",
                border: `1px solid ${t.border}`, color: t.textMuted,
                letterSpacing: "0.08em",
              }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
            {THREADS.map((c, i) => (
              <div key={i} style={{ width: width * 0.05, height: 2, background: c, opacity: 0.4, borderRadius: 1 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PosterHorizontal({ mode, seed = 42, width = 384 }) {
  const t = THEME[mode];
  const height = Math.round(width * (9 / 16));
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <WeaveCanvas width={width} height={height} seed={seed} interactive={false} mode={mode} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: height * 0.1, display: "flex", alignItems: "flex-end",
        background: `linear-gradient(90deg, ${t.bg}dd 0%, ${t.bg}88 40%, transparent 100%)`,
      }}>
        <div>
          <div style={{ fontSize: height * 0.04, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>iade · 2025</div>
          <div style={{
            fontSize: height * 0.28, fontWeight: 700, lineHeight: 0.85,
            color: t.wordmark, letterSpacing: "-0.03em",
          }}>trama</div>
          <div style={{ height: 1, width: 32, background: THREADS[0], margin: "6px 0 8px" }} />
          <div style={{ fontSize: height * 0.055, letterSpacing: "0.15em", textTransform: "uppercase", color: t.textMuted }}>
            jornadas de design
          </div>
          <div style={{ fontSize: height * 0.04, color: t.textDim, marginTop: 6 }}>
            15 maio · online · entrada livre
          </div>
        </div>
      </div>
    </div>
  );
}

export function SeparatorCard({ title, mode, seed = 42, width = 384, color }) {
  const t = THEME[mode];
  const height = Math.round(width * (9 / 16));
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <WeaveCanvas width={width} height={height} seed={seed} interactive={false} mode={mode} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: `radial-gradient(ellipse at center, ${t.bg}cc 0%, transparent 100%)`,
      }}>
        <div style={{ width: 20, height: 1, background: color || THREADS[0], marginBottom: 10 }} />
        <div style={{
          fontSize: height * 0.1, fontWeight: 700, textAlign: "center",
          color: t.wordmark, lineHeight: 1.2, maxWidth: "70%",
        }}>
          {title}
        </div>
        <div style={{ width: 20, height: 1, background: color || THREADS[0], marginTop: 10 }} />
      </div>
    </div>
  );
}
