import { THEME } from "../data/tokens";

export function ExportBar({ children, mode = "dark" }) {
  const t = THEME[mode];
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 6,
      alignItems: "center",
    }}>
      {children}
    </div>
  );
}

export default function ExportButton({ onClick, label = "svg", mode = "dark", style = {} }) {
  const t = THEME[mode];
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: `1px solid ${t.border}`,
        color: t.textMuted,
        padding: "3px 10px",
        fontFamily: "'Roboto Mono', monospace",
        fontSize: 8,
        letterSpacing: "0.08em",
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "border-color 0.2s, color 0.2s",
        ...style,
      }}
      onMouseEnter={e => { e.target.style.borderColor = t.borderHover || "rgba(255,255,255,0.15)"; e.target.style.color = t.text; }}
      onMouseLeave={e => { e.target.style.borderColor = t.border; e.target.style.color = t.textMuted; }}
    >
      ↓ {label}
    </button>
  );
}

export function ExportSequenceButton({ onClick, label = "svg sequence", mode = "dark", style = {} }) {
  const t = THEME[mode];
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: `1px solid ${t.border}`,
        color: t.textMuted,
        padding: "3px 10px",
        fontFamily: "'Roboto Mono', monospace",
        fontSize: 8,
        letterSpacing: "0.08em",
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "border-color 0.2s, color 0.2s",
        ...style,
      }}
      onMouseEnter={e => { e.target.style.borderColor = t.borderHover || "rgba(255,255,255,0.15)"; e.target.style.color = t.text; }}
      onMouseLeave={e => { e.target.style.borderColor = t.border; e.target.style.color = t.textMuted; }}
    >
      ↓ {label}
    </button>
  );
}
