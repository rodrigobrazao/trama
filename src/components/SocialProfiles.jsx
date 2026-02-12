import { THREADS, THEME } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import { generateTramaSVG, downloadSVG } from "../utils/exportSVG";
import { generateSocialProfileHTML, downloadHTML } from "../utils/exportHTML";

function ProfileIcon({ size = 120, seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  const letterOverlay = (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <span style={{
        fontSize: size * 0.55, fontWeight: 700, color: "#ffffff",
        fontFamily: "'Roboto Mono', monospace", lineHeight: 1,
        textShadow: `0 0 ${size * 0.15}px rgba(255,255,255,0.4), 0 0 ${size * 0.3}px rgba(255,255,255,0.2)`,
        opacity: 0.95,
      }}>t</span>
    </div>
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      border: `2px solid ${t.border}`,
    }}>
      <WeaveCanvas width={size} height={size} seed={seed} interactive={false} mode={mode} overlay={letterOverlay} />
    </div>
  );
}

export default function SocialProfiles({ mode }) {
  const t = THEME[mode];

  return (
    <div>
      {/* Profile icons */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>
        icon profile
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "flex-end" }}>
        {[{ label: "instagram", size: 80 }, { label: "facebook", size: 80 }, { label: "tiktok", size: 80 }].map((item, i) => (
          <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <ProfileIcon size={item.size} seed={i * 50 + 42} mode={mode} />
            <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.1em" }}>{item.label}</span>
            <ExportButton mode={mode} label="svg" onClick={() => downloadSVG(generateTramaSVG({ width: 400, height: 400, seed: i * 50 + 42, mode }), `trama-profile-${item.label}-${mode}.svg`)} />
            <ExportButton mode={mode} label="html" onClick={() => downloadHTML(generateSocialProfileHTML({ seed: i * 50 + 42, mode }), `trama-profile-${item.label}-${mode}.html`)} />
          </div>
        ))}
      </div>

    </div>
  );
}
