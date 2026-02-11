import { useState, useEffect, useRef } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";

export default function Countdown({ session, mode, width = 640, height = 360 }) {
  const t = THEME[mode];
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Simulate countdown (5 minutes from now for demo)
  const totalSec = Math.max(0, 300 - Math.floor((now % 300000) / 1000));
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <WeaveCanvas width={width} height={height} seed={session?.seed || 42} interactive={false} mode={mode} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 30%, transparent 70%, ${t.overlay} 100%)`,
      }}>
        <div style={{ fontSize: 9, color: session?.color || THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
          a começar em
        </div>
        <div style={{
          fontSize: Math.min(width * 0.18, 80), fontWeight: 700, letterSpacing: "0.15em",
          color: t.wordmark, fontFamily: "'Roboto Mono', monospace",
          textShadow: mode === "dark" ? "0 0 40px rgba(0,0,0,0.8)" : "0 0 40px rgba(255,255,255,0.8)",
        }}>
          {min}:{sec}
        </div>
        <div style={{ width: 40, height: 1, background: session?.color || THREADS[0], margin: "16px 0" }} />
        <div style={{
          fontSize: 16, fontWeight: 700, textAlign: "center", maxWidth: width * 0.7,
          color: t.wordmark, lineHeight: 1.3,
          textShadow: mode === "dark" ? "0 0 30px rgba(0,0,0,0.7)" : "0 0 30px rgba(255,255,255,0.7)",
        }}>
          {session?.title || "Sessão"}
        </div>
        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 8 }}>
          {session?.speaker || "Orador"}
        </div>
        <div style={{
          position: "absolute", bottom: 16, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 4,
        }}>
          {THREADS.map((c, i) => (
            <div key={i} style={{ width: 16, height: 2, background: c, opacity: 0.3, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
