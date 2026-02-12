import { useState, useRef, useEffect, useCallback } from "react";
import { THREADS, THEME, SPEAKERS, PROGRAMME, FORMATS, rng } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";

// ═══════════════════════════════════════════
// TRAMA — Design System Presentation (Slideshow)
// Faithful reproduction of each site block as slides
// Every screenshot from correcoes_apresentacao = 1 slide
// ═══════════════════════════════════════════

// ─── SectionLabel helper (matches site) ────────────────────
function SLabel({ number, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{number}</span>
      <div style={{ height: 1, width: 36, background: color }} />
      <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color }}>{label}</span>
    </div>
  );
}

// ─── Mini animated canvas for speaker bases ────────────────
function MiniWeaveCanvas({ width, height, seed, mode }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width = width * dpr; cv.height = height * dpr; ctx.scale(dpr, dpr);
    const t = THEME[mode];
    const hC = 12, vC = 12, hT = [], vT = [];
    for (let i = 0; i < hC; i++) hT.push({ baseY: (height * (i + 0.5)) / hC, color: THREADS[Math.floor(rng(seed, i + 300) * 6)], phase: rng(seed, i + 500) * Math.PI * 2, amp: 3 + rng(seed, i + 600) * 15, op: 0.15 + rng(seed, i + 700) * 0.35, thick: 0.5 + rng(seed, i + 200) * 1.5, spd: 0.1 + rng(seed, i + 400) * 0.3 });
    for (let i = 0; i < vC; i++) vT.push({ baseX: (width * (i + 0.5)) / vC, color: THREADS[Math.floor(rng(seed, i + 900) * 6)], phase: rng(seed, i + 1100) * Math.PI * 2, amp: 3 + rng(seed, i + 1200) * 15, op: 0.1 + rng(seed, i + 1300) * 0.3, thick: 0.5 + rng(seed, i + 800) * 1.5, spd: 0.08 + rng(seed, i + 1000) * 0.25 });
    const draw = () => {
      timeRef.current += 0.018;
      const time = timeRef.current;
      ctx.fillStyle = t.bg; ctx.fillRect(0, 0, width, height);
      hT.forEach(th => { ctx.beginPath(); ctx.strokeStyle = th.color; ctx.globalAlpha = th.op; ctx.lineWidth = th.thick; for (let x = 0; x < width; x += 2) { const y = th.baseY + Math.sin(x * 0.007 + time * th.spd + th.phase) * th.amp; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); });
      vT.forEach(th => { ctx.beginPath(); ctx.strokeStyle = th.color; ctx.globalAlpha = th.op * 0.7; ctx.lineWidth = th.thick * 0.8; for (let y = 0; y < height; y += 2) { const x = th.baseX + Math.sin(y * 0.007 + time * th.spd * 0.8 + th.phase + 1) * th.amp * 0.8; y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [width, height, seed, mode]);
  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

// ─── Speaker base with weave bg (16:9) — full-width single speaker ──
function SpeakerBaseH({ speaker, seed, mode, width }) {
  const t = THEME[mode];
  const h = Math.round(width * (9 / 16));
  return (
    <div style={{ position: "relative", width, height: h, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <MiniWeaveCanvas width={width} height={h} seed={seed} mode={mode} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: width * 0.06,
        display: "flex", flexDirection: "column", justifyContent: "center",
        background: `linear-gradient(90deg, ${t.bg}dd 0%, ${t.bg}88 50%, transparent 100%)`,
      }}>
        <div>
          <div style={{ fontSize: width * 0.018, color: speaker.color, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10 }}>convidado</div>
          <div style={{ fontSize: width * 0.055, fontWeight: 700, lineHeight: 1.1, color: t.wordmark, marginBottom: 12 }}>{speaker.name}</div>
          <div style={{ height: 2, width: width * 0.06, background: speaker.color, marginBottom: 12 }} />
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: width * 0.032, color: speaker.color, marginBottom: 8, lineHeight: 1.3 }}>{speaker.topic}</div>
          <div style={{ fontSize: width * 0.02, color: t.textMuted, letterSpacing: "0.1em" }}>{speaker.role} · {speaker.org}</div>
          <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
            {THREADS.map((c, i) => <div key={i} style={{ width: width * 0.03, height: 2, background: c, opacity: c === speaker.color ? 0.8 : 0.2, borderRadius: 1 }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Speaker base with weave bg (9:16) — large vertical + small variant ──
function SpeakerBaseV({ speaker, seed, mode, width }) {
  const t = THEME[mode];
  const mainW = Math.round(width * 0.55);
  const mainH = Math.round(mainW * (16 / 9));
  const smallW = Math.round(width * 0.35);
  const smallH = Math.round(smallW * (16 / 9));
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* Large vertical */}
      <div style={{ position: "relative", width: mainW, height: mainH, overflow: "hidden", border: `1px solid ${t.border}` }}>
        <MiniWeaveCanvas width={mainW} height={mainH} seed={seed} mode={mode} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: mainW * 0.06,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          background: `linear-gradient(180deg, transparent 30%, ${t.bg}ee 100%)`,
        }}>
          <div>
            <div style={{ fontSize: mainW * 0.03, color: speaker.color, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>convidado</div>
            <div style={{ fontSize: mainW * 0.09, fontWeight: 700, lineHeight: 1.1, color: t.wordmark, marginBottom: 10 }}>{speaker.name}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: mainW * 0.05, color: speaker.color, marginBottom: 6, lineHeight: 1.3 }}>{speaker.topic}</div>
            <div style={{ fontSize: mainW * 0.028, color: t.textMuted, letterSpacing: "0.1em" }}>{speaker.role} · {speaker.org}</div>
            <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
              {THREADS.map((c, i) => <div key={i} style={{ width: mainW * 0.04, height: 2, background: c, opacity: c === speaker.color ? 0.8 : 0.2, borderRadius: 1 }} />)}
            </div>
          </div>
        </div>
      </div>
      {/* Small variant */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ position: "relative", width: smallW, height: smallH, overflow: "hidden", border: `1px solid ${t.border}` }}>
          <MiniWeaveCanvas width={smallW} height={smallH} seed={seed + 7} mode={mode} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: smallW * 0.06,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            background: `linear-gradient(180deg, transparent 30%, ${t.bg}ee 100%)`,
          }}>
            <div>
              <div style={{ fontSize: smallW * 0.025, color: speaker.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>convidado</div>
              <div style={{ fontSize: smallW * 0.065, fontWeight: 700, lineHeight: 1.1, color: t.wordmark, marginBottom: 4 }}>{speaker.name}</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: smallW * 0.04, color: speaker.color, marginBottom: 3, lineHeight: 1.3 }}>{speaker.topic}</div>
              <div style={{ fontSize: smallW * 0.023, color: t.textMuted, letterSpacing: "0.08em" }}>{speaker.role} · {speaker.org}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Programme Panel (single format) ──────────────────────
function ProgramPanel({ format, width, height, seed, mode }) {
  const t = THEME[mode];
  const isCompact = format === "facebook" || format === "instagram";
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <MiniWeaveCanvas width={width} height={height} seed={seed} mode={mode} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: width * 0.04, display: "flex", flexDirection: "column",
        justifyContent: format === "vertical" ? "flex-start" : "center",
        background: format === "vertical"
          ? `linear-gradient(180deg, transparent 30%, ${t.bg}ee 100%)`
          : `linear-gradient(90deg, ${t.bg}dd 0%, ${t.bg}88 50%, transparent 100%)`,
      }}>
        <div style={{ marginBottom: isCompact ? 4 : 10, flexShrink: 0 }}>
          <div style={{ fontSize: Math.max(5, width * 0.025), color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase" }}>iade · 2026</div>
          <div style={{ fontSize: Math.max(8, format === "vertical" ? width * 0.06 : width * 0.045), fontWeight: 700, lineHeight: 0.9, color: t.wordmark, letterSpacing: "-0.03em", marginTop: 3 }}>trama</div>
          <div style={{ fontSize: Math.max(4, width * 0.02), letterSpacing: "0.15em", textTransform: "uppercase", color: t.textMuted, marginTop: 3 }}>programa · jornadas de design</div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {PROGRAMME.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: Math.max(3, width * 0.015), alignItems: "center",
              padding: `${Math.max(1, width * 0.003)}px 0`, borderBottom: `1px solid ${t.border}`,
              opacity: item.type === "pausa" ? 0.4 : 1,
            }}>
              <span style={{ fontSize: Math.max(4, width * 0.022), color: item.color, fontWeight: 600, minWidth: Math.max(16, width * 0.08) }}>{item.time}</span>
              <span style={{ fontSize: Math.max(4, width * 0.02), flex: 1, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
              {!isCompact && item.speaker && item.type !== "pausa" && (
                <span style={{ fontSize: Math.max(3, width * 0.016), color: t.text, border: `1px solid ${item.color}60`, padding: `${Math.max(1, width * 0.003)}px ${Math.max(2, width * 0.008)}px`, whiteSpace: "nowrap" }}>{item.speaker}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 4, flexShrink: 0 }}>
          {THREADS.map((c, i) => <div key={i} style={{ width: width * 0.04, height: 1.5, background: c, opacity: 0.4, borderRadius: 1 }} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Teams separator card ──────────────────────────────────
function TeamsSeparator({ title, titleColor, mode, seed, width, height }) {
  const t = THEME[mode];
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
      <MiniWeaveCanvas width={width} height={height} seed={seed} mode={mode} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: Math.max(28, width * 0.05), fontWeight: 700, color: titleColor || THREADS[0], letterSpacing: "-0.02em" }}>{title}</div>
        <div style={{ fontSize: Math.max(9, width * 0.014), letterSpacing: "0.2em", textTransform: "uppercase", color: t.wordmark, marginTop: 12 }}>trama · jornadas de design</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SLIDES DEFINITION — 28 content slides + 2 bookends = 30 total
// Matches 1:1 with screenshots in correcoes_apresentacao
// ═══════════════════════════════════════════
function buildSlides(t, mode) {
  return [
    // ── SLIDE 0: HERO / LOGO ──
    { id: "hero", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <WeaveCanvas width={W} height={H} seed={42} interactive={false} mode={mode} />
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 40%, ${t.overlay} 100%)` }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 11, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20 }}>iade · 1ª edição · 2026</div>
            <div style={{ fontSize: Math.min(W * 0.08, 96), fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.85, color: t.wordmark }}>trama</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
              <div style={{ height: 1, width: 36, background: THREADS[0] }} />
              <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: t.wordmark }}>jornadas de design</span>
            </div>
          </div>
        </div>
      </div>
    )},

    // ── SLIDE 1: 01 IDENTIDADE ──
    { id: "identidade", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px", display: "flex", flexDirection: "column" }}>
        <SLabel number="01" label="Identidade" color={THREADS[0]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, flex: 1, alignContent: "start" }}>
          {[
            { n: "01", title: "Cruzar", text: "Perspectivas que se encontram. Design gráfico, computacional, de produto, de experiência — todos os fios num mesmo tecido.", c: THREADS[0] },
            { n: "02", title: "Entrelaçar", text: "Workshops, palestras e debates que ligam teoria e prática, tradição e experimentação, academia e indústria.", c: THREADS[1] },
            { n: "03", title: "Gerar", text: "Novas ideias, novas conexões, novas formas. Uma trama que só existe quando todos os fios estão presentes.", c: THREADS[2] },
          ].map(item => (
            <div key={item.n}>
              <div style={{ fontSize: 9, color: item.c, letterSpacing: "0.2em", marginBottom: 12 }}>{item.n}</div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", marginBottom: 14, color: t.wordmark }}>{item.title}</h3>
              <p style={{ fontSize: 11, lineHeight: 1.8, color: t.textMuted, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    )},

    // ── SLIDE 2: 02 CONSTRUTOR ──
    { id: "construtor", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px", position: "relative", overflow: "hidden" }}>
        <SLabel number="02" label="Construtor" color={THREADS[3]} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7, maxWidth: 800 }}>
          Módulo de criação de linhas animadas. Controla espessura, quantidade, amplitude, velocidade e cores. Preview em tempo real com exportação para SVG, PNG, sequência de frames e vídeo WebM.
        </p>
        <div style={{ border: `1px solid ${t.border}`, overflow: "hidden", width: W - 120, height: H - 200 }}>
          <WeaveCanvas width={W - 120} height={H - 200} seed={42} interactive={false} mode={mode} />
        </div>
      </div>
    )},

    // ── SLIDE 3: 04 DESIGN SYSTEM — PALETA ──
    { id: "paleta", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px", display: "flex", flexDirection: "column" }}>
        <SLabel number="04" label="Design System" color={THREADS[2]} />
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>paleta cromática</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[...THREADS, "#070709"].map((c, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: 3, background: c, border: `1px solid ${t.borderHover}` }} />
              <span style={{ fontSize: 8, color: t.textMuted }}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>gradiente cromático</div>
        <div style={{ height: 32, borderRadius: 3, border: `1px solid ${t.borderHover}`, background: `linear-gradient(90deg, ${THREADS[0]} 0%, ${THREADS[1]} 20%, ${THREADS[2]} 40%, ${THREADS[3]} 60%, ${THREADS[4]} 80%, ${THREADS[5]} 100%)`, marginBottom: 8, width: W - 120 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: t.textDim, width: W - 120, marginBottom: 24 }}>
          {THREADS.map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>conversão de cores</div>
        <div style={{ border: `1px solid ${t.border}`, overflow: "hidden", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 1fr 1fr 1fr" }}>
            {["", "hex", "rgb", "hsl", "lab"].map((h, i) => (
              <div key={i} style={{ padding: "6px 8px", fontSize: 7, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${t.border}`, background: t.surface }}>{h}</div>
            ))}
            {THREADS.map((c, i) => [
              <div key={`s${i}`} style={{ padding: "6px 8px", display: "flex", alignItems: "center", borderBottom: `1px solid ${t.border}` }}><div style={{ width: 20, height: 20, borderRadius: 2, background: c }} /></div>,
              <div key={`h${i}`} style={{ padding: "6px 8px", fontSize: 8, color: t.textMuted, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center" }}>{c}</div>,
              <div key={`r${i}`} style={{ padding: "6px 8px", fontSize: 8, color: t.textMuted, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center" }}>{`rgb(${parseInt(c.slice(1,3),16)}, ${parseInt(c.slice(3,5),16)}, ${parseInt(c.slice(5,7),16)})`}</div>,
              <div key={`l${i}`} style={{ padding: "6px 8px", fontSize: 8, color: t.textMuted, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center" }}>—</div>,
              <div key={`b${i}`} style={{ padding: "6px 8px", fontSize: 8, color: t.textMuted, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center" }}>—</div>,
            ])}
          </div>
        </div>
      </div>
    )},

    // ── SLIDE 4: TIPOGRAFIA — ROBOTO MONO ──
    { id: "typo-roboto", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: t.wordmark }}>Roboto Mono</span>
          <span style={{ fontSize: 9, color: THREADS[1], letterSpacing: "0.2em", textTransform: "uppercase" }}>primária · monospace</span>
        </div>
        <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.08em", marginBottom: 16 }}>Google Fonts · 300 · 400 · 500 · 600 · 700</div>
        <div style={{ marginBottom: 16, padding: "16px 20px", background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4, color: t.wordmark }}>Aa Bb Cc 0123</div>
          <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 !@#$%&*()</div>
        </div>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>pesos</div>
        {[{ w: 300, l: "Light 300" }, { w: 400, l: "Regular 400" }, { w: 500, l: "Medium 500" }, { w: 600, l: "SemiBold 600" }, { w: 700, l: "Bold 700" }].map(item => (
          <div key={item.w} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "5px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 8, color: t.textDim, minWidth: 80 }}>{item.l}</span>
            <span style={{ fontSize: 16, fontWeight: item.w, color: t.wordmark }}>trama · jornadas de design</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 16, marginBottom: 8, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>escala de tamanhos</div>
        {[{ size: 48, label: "56px", use: "wordmark", w: 700 }, { size: 28, label: "32px", use: "título principal", w: 700 }, { size: 16, label: "18px", use: "subtítulo", w: 600 }, { size: 11, label: "11px", use: "corpo", w: 400 }, { size: 9, label: "9px", use: "labels", w: 400 }].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "3px 0", borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 7, color: THREADS[1], minWidth: 36, fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: item.size, fontWeight: item.w, color: t.wordmark, lineHeight: 1.2 }}>trama</span>
            <span style={{ fontSize: 7, color: t.textDim, marginLeft: "auto" }}>{item.use}</span>
          </div>
        ))}
      </div>
    )},

    // ── SLIDE 5: TIPOGRAFIA — INSTRUMENT SERIF ──
    { id: "typo-serif", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontStyle: "italic", color: t.wordmark }}>Instrument Serif</span>
          <span style={{ fontSize: 9, color: THREADS[3], letterSpacing: "0.2em", textTransform: "uppercase" }}>decorativa · serif</span>
        </div>
        <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.08em", marginBottom: 16 }}>Google Fonts · Regular · Italic</div>
        <div style={{ marginBottom: 16, padding: "16px 20px", background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontStyle: "italic", lineHeight: 1.1, marginBottom: 8, color: t.wordmark }}>Aa Bb Cc 0123</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 12, fontStyle: "italic", color: t.textMuted, lineHeight: 1.6 }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 !@#$%&*()</div>
        </div>
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, borderLeft: `2px solid ${THREADS[3]}`, paddingLeft: 10 }}>uso no sistema</div>
        {[
          { use: "títulos de identidade", ex: "Cruzar", size: 28 },
          { use: "tópicos de convidados", ex: "Sistemas de Design à Escala", size: 18 },
          { use: "citações / destaques", ex: "Todos os fios num mesmo tecido", size: 14 },
        ].map((item, i) => (
          <div key={i} style={{ padding: "10px 16px", background: t.surface, border: `1px solid ${t.border}`, marginBottom: 8 }}>
            <div style={{ fontSize: 7, color: THREADS[3], letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{item.use}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: item.size, fontStyle: "italic", color: t.text, lineHeight: 1.3 }}>{item.ex}</div>
          </div>
        ))}
        <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 16, marginBottom: 8, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>composição tipográfica</div>
        <div style={{ padding: "20px 24px", background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 8, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>iade · 2026</div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.9, marginBottom: 8, color: t.wordmark }}>trama</div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: t.wordmark, marginBottom: 10 }}>jornadas de design</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, fontStyle: "italic", color: THREADS[0], lineHeight: 1.4 }}>Cruzar, Entrelaçar, Gerar</div>
        </div>
      </div>
    )},

    // ── SLIDE 6: VARIAÇÕES GENERATIVAS ──
    { id: "variacoes", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>variações generativas</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
          {[42, 49, 65, 141].map(s => (
            <div key={s} style={{ border: `1px solid ${t.border}`, overflow: "hidden", position: "relative" }}>
              <WeaveCanvas width={Math.floor((W - 150) / 4)} height={140} seed={s} interactive={false} mode={mode} />
              <div style={{ position: "absolute", bottom: 4, left: 6, fontSize: 7, color: t.textDim }}>#{s}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[2]}`, paddingLeft: 10 }}>textura generativa</div>
        <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
          <WeaveCanvas width={W - 120} height={220} seed={42} interactive={false} mode={mode} />
        </div>
      </div>
    )},

    // ── SLIDE 7: 05 ÍCONES ──
    { id: "icones", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px" }}>
        <SLabel number="05" label="Sistema de Ícones" color={THREADS[3]} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7, maxWidth: 560 }}>
          Ícones generativos construídos com a linguagem visual dos fios. Subtis fios de fundo animados reforçam a identidade em cada elemento da interface.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 32 }}>
          {["play ▶", "pause ❚❚", "mic 🎙", "camera 📷", "link 🔗", "download ↓"].map((ico, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 28, color: THREADS[i] }}>{["▶", "❚❚", "◉", "⊡", "⤬", "↓"][i]}</div>
              <div style={{ fontSize: 8, color: t.textMuted, letterSpacing: "0.08em" }}>{ico.split(" ")[0]}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[3]}`, paddingLeft: 10 }}>escalas</div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {[64, 48, 32, 24, 16].map(sz => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: sz * 0.5, color: THREADS[0] }}>▶</div>
              <span style={{ fontSize: 8, color: t.textDim }}>{sz}px</span>
            </div>
          ))}
        </div>
      </div>
    )},

    // ── SLIDE 8: 06 CONVIDADOS ──
    { id: "convidados", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px" }}>
        <SLabel number="06" label="Convidados" color={THREADS[4]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {SPEAKERS.map((s, i) => (
            <div key={i} style={{ padding: "16px 20px", border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${t.border}`, overflow: "hidden", flexShrink: 0 }}>
                  <MiniWeaveCanvas width={40} height={40} seed={i * 7 + 10} mode={mode} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.wordmark }}>{s.name}</div>
                  <div style={{ fontSize: 9, color: t.textMuted }}>{s.role} · {s.org}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 14, color: s.color, lineHeight: 1.3 }}>{s.topic}</div>
              <div style={{ display: "flex", gap: 3 }}>
                {THREADS.map((c, j) => <div key={j} style={{ width: 20, height: 2, background: c, opacity: j === i ? 0.8 : 0.15, borderRadius: 1 }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // ── SLIDE 9: PROGRAMA ──
    { id: "programa", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>programa</div>
        {PROGRAMME.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline", padding: "10px 0", borderBottom: `1px solid ${t.border}`, opacity: item.type === "pausa" ? 0.4 : 1 }}>
            <span style={{ fontSize: 13, color: item.color, fontWeight: 600, minWidth: 52 }}>{item.time}</span>
            <span style={{ fontSize: 13, flex: 1, color: t.text }}>{item.title}</span>
            <span style={{ fontSize: 10, color: t.textMuted }}>{item.speaker}</span>
            <span style={{ fontSize: 8, padding: "2px 8px", border: `1px solid ${item.color}40`, color: item.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.type}</span>
          </div>
        ))}
      </div>
    )},

    // ── SLIDE 10: BASE ANA MOREIRA — 16:9 ──
    { id: "base-ana-h", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[5]}`, paddingLeft: 10 }}>bases convidados — 16:9</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SpeakerBaseH speaker={SPEAKERS[0]} seed={42} mode={mode} width={W - 80} />
        </div>
      </div>
    )},

    // ── SLIDE 11: BASE TOMÁS HENRIQUES — 16:9 ──
    { id: "base-tomas-h", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SpeakerBaseH speaker={SPEAKERS[1]} seed={43} mode={mode} width={W - 80} />
        </div>
      </div>
    )},

    // ── SLIDE 12: BASE BEATRIZ COSTA — 16:9 ──
    { id: "base-beatriz-h", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SpeakerBaseH speaker={SPEAKERS[2]} seed={44} mode={mode} width={W - 80} />
        </div>
      </div>
    )},

    // ── SLIDE 13: BASE ANA MOREIRA — 9:16 ──
    { id: "base-ana-v", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[5]}`, paddingLeft: 10 }}>bases convidados — 9:16</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SpeakerBaseV speaker={SPEAKERS[0]} seed={42} mode={mode} width={W - 80} />
        </div>
      </div>
    )},

    // ── SLIDE 14: BASE TOMÁS HENRIQUES — 9:16 ──
    { id: "base-tomas-v", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SpeakerBaseV speaker={SPEAKERS[1]} seed={43} mode={mode} width={W - 80} />
        </div>
      </div>
    )},

    // ── SLIDE 15: BASE BEATRIZ COSTA — 9:16 ──
    { id: "base-beatriz-v", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SpeakerBaseV speaker={SPEAKERS[2]} seed={44} mode={mode} width={W - 80} />
        </div>
      </div>
    )},

    // ── SLIDE 16: PAINEL PROGRAMA — VERTICAL 1080×1920 ──
    { id: "painel-vertical", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>painel vertical · 1080 × 1920</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProgramPanel format="vertical" width={Math.round((H - 80) * (9/16))} height={H - 80} seed={42} mode={mode} />
        </div>
      </div>
    )},

    // ── SLIDE 17: PAINEL PROGRAMA — HORIZONTAL 1920×1080 ──
    { id: "painel-horizontal", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>painel horizontal · 1920 × 1080</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProgramPanel format="horizontal" width={W - 80} height={Math.round((W - 80) * (9/16))} seed={42} mode={mode} />
        </div>
      </div>
    )},

    // ── SLIDE 18: PAINEL PROGRAMA — INSTAGRAM 1080×1080 ──
    { id: "painel-instagram", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>versão instagram · 1080 × 1080</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProgramPanel format="instagram" width={Math.min(H - 80, W - 80)} height={Math.min(H - 80, W - 80)} seed={42} mode={mode} />
        </div>
      </div>
    )},

    // ── SLIDE 19: PAINEL PROGRAMA — FACEBOOK 820×312 ──
    { id: "painel-facebook", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[0]}`, paddingLeft: 10 }}>banner facebook · 820 × 312</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProgramPanel format="facebook" width={W - 80} height={Math.round((W - 80) * (312/820))} seed={42} mode={mode} />
        </div>
      </div>
    )},

    // ── SLIDE 20: 09 PAINÉIS DIGITAIS ──
    { id: "paineis-digitais", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <SLabel number="09" label="Painéis Digitais" color={THREADS[5]} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
          Painéis digitais estáticos em formatos horizontal (1920×1080) e vertical (1080×1920) com identidade generativa da trama.
        </p>
        <div style={{ flex: 1, display: "flex", gap: 24, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 440, height: 248, overflow: "hidden", border: `1px solid ${t.border}` }}>
              <WeaveCanvas width={440} height={248} seed={42} interactive={false} mode={mode} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "center", background: `linear-gradient(90deg, ${t.bg}cc 0%, transparent 50%)` }}>
                <div style={{ fontSize: 7, color: THREADS[0], letterSpacing: "0.3em", marginBottom: 8 }}>IADE · 1ª EDIÇÃO · 2026</div>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: t.wordmark, lineHeight: 0.9 }}>trama</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}><div style={{ height: 1, width: 20, background: THREADS[0] }} /><span style={{ fontSize: 8, color: t.wordmark, letterSpacing: "0.2em" }}>JORNADAS DE DESIGN</span></div>
              </div>
            </div>
            <span style={{ fontSize: 8, color: t.textDim }}>1920 × 1080</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 140, height: 248, overflow: "hidden", border: `1px solid ${t.border}` }}>
              <WeaveCanvas width={140} height={248} seed={99} interactive={false} mode={mode} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: "12px", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: `linear-gradient(180deg, transparent 40%, ${t.bg}ee 100%)` }}>
                <div style={{ fontSize: 5, color: THREADS[0], letterSpacing: "0.3em" }}>IADE · 2026</div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.03em", color: t.wordmark }}>trama</div>
                <div style={{ fontSize: 5, color: t.wordmark, letterSpacing: "0.15em" }}>JORNADAS DE DESIGN</div>
              </div>
            </div>
            <span style={{ fontSize: 8, color: t.textDim }}>1080 × 1920</span>
          </div>
        </div>
      </div>
    )},

    // ── SLIDE 21: 10 REDES SOCIAIS ──
    { id: "social", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <SLabel number="10" label="Redes Sociais" color={THREADS[1]} />
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>motion — formatos animados</div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-end" }}>
          {[{ f: "Story 9:16", w: 100, h: 178 }, { f: "Post 1:1", w: 140, h: 140 }, { f: "Banner 16:9", w: 200, h: 112 }].map(item => (
            <div key={item.f} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}><WeaveCanvas width={item.w} height={item.h} seed={42} interactive={false} mode={mode} /></div>
              <span style={{ fontSize: 8, color: t.textDim }}>{item.f}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[1]}`, paddingLeft: 10 }}>carrossel instagram</div>
        <div style={{ display: "flex", gap: 12 }}>
          {["O que é a trama?", "Quem vem falar?", "Design generativo", "Aprende na prática"].map((title, i) => (
            <div key={i} style={{ width: 160, height: 160, position: "relative", overflow: "hidden", border: `1px solid ${t.border}` }}>
              <MiniWeaveCanvas width={160} height={160} seed={42 + i * 7} mode={mode} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, background: `linear-gradient(180deg, transparent 0%, ${t.bg}dd 100%)` }}>
                <div style={{ fontSize: i === 0 ? 10 : 9, fontWeight: 600, color: i === 0 ? THREADS[0] : t.wordmark, lineHeight: 1.3 }}>{title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )},

    // ── SLIDE 22: 11 QR CODES ──
    { id: "qr", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "40px 60px" }}>
        <SLabel number="11" label="QR Codes" color={THREADS[2]} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
          QR codes generativos com a linguagem visual da trama. Finder patterns em cores do sistema, dados com respiração animada.
        </p>
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          <div style={{ width: 200, height: 200, background: t.surface, border: `1px solid ${t.border}`, display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gridTemplateRows: "repeat(14, 1fr)", gap: 1, padding: 8 }}>
            {Array.from({ length: 196 }, (_, i) => {
              const r = Math.floor(i / 14), c = i % 14;
              const v = rng(42, r * 14 + c);
              const isOn = v > 0.4;
              const isColored = rng(42, r * 14 + c + 200) > 0.65;
              return <div key={i} style={{ background: isOn ? (isColored ? THREADS[Math.floor(rng(42, r + c * 3) * 6)] : t.wordmark) : "transparent", borderRadius: 1, opacity: isOn ? 0.75 : 0 }} />;
            })}
          </div>
          <div>
            <div style={{ fontSize: 11, color: t.wordmark, marginBottom: 8 }}>QR code funcional com estilo trama.</div>
            <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.7 }}>
              Introduz qualquer URL e o código é gerado em tempo real, legível por qualquer leitor de QR.<br /><br />
              finder patterns · cores do sistema<br />
              dados · respiração animada<br />
              erro correction · medium
            </div>
          </div>
        </div>
      </div>
    )},

    // ── SLIDE 23: 12 TEAMS — KEYNOTES ──
    { id: "teams-keynotes", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <SLabel number="12" label="Microsoft Teams" color={THREADS[4]} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
          Assets para transmissão via Microsoft Teams: separadores de sessão, countdowns e backgrounds virtuais.
        </p>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>separadores de sessão · safe area hd</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TeamsSeparator title="keynotes" titleColor={THREADS[0]} mode={mode} seed={42} width={W - 100} height={Math.floor((H - 200))} />
        </div>
      </div>
    )},

    // ── SLIDE 24: TEAMS — WORKSHOPS ──
    { id: "teams-workshops", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TeamsSeparator title="workshops" titleColor={THREADS[1]} mode={mode} seed={49} width={W - 100} height={Math.floor(H - 60)} />
        </div>
      </div>
    )},

    // ── SLIDE 25: TEAMS — DEBATE ──
    { id: "teams-debate", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TeamsSeparator title="debate" titleColor={THREADS[2]} mode={mode} seed={65} width={W - 100} height={Math.floor(H - 60)} />
        </div>
      </div>
    )},

    // ── SLIDE 26: TEAMS — PAUSA ──
    { id: "teams-pausa", duration: 4, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TeamsSeparator title="pausa" titleColor={THREADS[3]} mode={mode} seed={73} width={W - 100} height={Math.floor(H - 60)} />
        </div>
      </div>
    )},

    // ── SLIDE 27: TEAMS — COUNTDOWN ──
    { id: "teams-countdown", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, background: t.bg, padding: "30px 50px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>countdown de sessão</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: W - 100, height: H - 120, overflow: "hidden", border: `1px solid ${t.border}` }}>
            <WeaveCanvas width={W - 100} height={H - 120} seed={42} interactive={false} mode={mode} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 9, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>a começar em</div>
              <div style={{ fontSize: 64, fontWeight: 700, color: t.wordmark, letterSpacing: "-0.02em" }}>00:05:00</div>
              <div style={{ height: 2, width: 40, background: THREADS[0], margin: "12px 0" }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: t.wordmark }}>Sistemas de Design à Escala</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Ana Moreira</div>
            </div>
          </div>
        </div>
      </div>
    )},

    // ── SLIDE 28: CLOSING ──
    { id: "closing", duration: 5, render: (W, H) => (
      <div style={{ width: W, height: H, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <WeaveCanvas width={W} height={H} seed={42} interactive={false} mode={mode} />
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 40%, ${t.overlay} 100%)` }}>
          <div style={{ fontSize: 11, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>iade · 1ª edição · 2026</div>
          <div style={{ fontSize: Math.min(W * 0.08, 96), fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.85, color: t.wordmark, textAlign: "center" }}>trama</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, marginBottom: 32 }}>
            <div style={{ height: 1, width: 36, background: THREADS[0] }} />
            <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: t.wordmark }}>jornadas de design</span>
          </div>
          <div style={{ fontSize: 11, color: THREADS[1], letterSpacing: "0.15em", marginBottom: 16 }}>15 maio 2026 · online · entrada livre</div>
          <div style={{ display: "flex", gap: 6 }}>
            {THREADS.map((c, i) => <div key={i} style={{ width: 32, height: 3, background: c, borderRadius: 1 }} />)}
          </div>
          <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.1em", marginTop: 32 }}>sistema de identidade visual · v02 · rodrigobrazao.pt</div>
        </div>
      </div>
    )},
  ];
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function DesignSystemPresentation({ mode = "dark" }) {
  const t = THEME[mode];
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [curSlide, setCurSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [isFS, setIsFS] = useState(false);

  const W = 1280, H = 720;
  const slides = buildSlides(t, mode);
  const totalDuration = slides.reduce((s, sl) => s + sl.duration, 0);

  // Auto-advance
  useEffect(() => {
    if (!playing) return;
    setFadeIn(true);
    timerRef.current = setTimeout(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurSlide(prev => {
          if (prev >= slides.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 600);
    }, slides[curSlide].duration * 1000 - 600);
    return () => clearTimeout(timerRef.current);
  }, [playing, curSlide, slides]);

  const play = () => { setCurSlide(0); setFadeIn(true); setPlaying(true); };
  const stop = () => { setPlaying(false); setCurSlide(0); setFadeIn(true); if (timerRef.current) clearTimeout(timerRef.current); };
  const prev = () => { setCurSlide(c => Math.max(0, c - 1)); setFadeIn(true); };
  const next = () => { setCurSlide(c => Math.min(slides.length - 1, c + 1)); setFadeIn(true); };

  // Fullscreen
  const goFS = () => { const el = wrapRef.current; if (!el) return; const rfs = el.requestFullscreen || el.webkitRequestFullscreen; if (rfs) rfs.call(el); };
  const exitFS = () => { const d = document; const efs = d.exitFullscreen || d.webkitExitFullscreen; if (efs) efs.call(d); };
  useEffect(() => {
    const onFSChange = () => setIsFS(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("webkitfullscreenchange", onFSChange);
    return () => { document.removeEventListener("fullscreenchange", onFSChange); document.removeEventListener("webkitfullscreenchange", onFSChange); };
  }, []);
  const playFS = () => { goFS(); play(); };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape" && isFS) exitFS();
    };
    if (isFS || playing) { document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }
  }, [isFS, playing, curSlide]);

  const elapsed = slides.slice(0, curSlide).reduce((s, sl) => s + sl.duration, 0);
  const progress = elapsed / totalDuration;

  return (
    <div>
      <div ref={wrapRef} style={isFS ? { background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", flexDirection: "column" } : { border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <div style={isFS ? { width: "100vw", height: "calc(100vh - 32px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" } : { width: W, height: H, overflow: "hidden", position: "relative" }}>
          <div style={{
            width: W, height: H, overflow: "hidden",
            opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease-in-out",
            transform: isFS ? `scale(${Math.min(window.innerWidth / W, (window.innerHeight - 32) / H)})` : "none",
            transformOrigin: "center center",
          }}>
            {slides[curSlide].render(W, H)}
          </div>
        </div>
        {/* Progress bar */}
        {(playing || isFS) && (
          <div style={{ width: isFS ? "100vw" : W, height: 2, background: t.border, flexShrink: 0 }}>
            <div style={{ width: `${((curSlide + 1) / slides.length) * 100}%`, height: "100%", background: THREADS[0], transition: "width 0.3s" }} />
          </div>
        )}
        {/* FS controls */}
        {isFS && (
          <div style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12, alignItems: "center", opacity: 0.6, zIndex: 10 }}>
            <button onClick={prev} style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted, padding: "4px 12px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer" }}>← prev</button>
            <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", minWidth: 60, textAlign: "center" }}>{curSlide + 1} / {slides.length}</span>
            <button onClick={next} style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted, padding: "4px 12px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer" }}>next →</button>
            <button onClick={playing ? stop : play} style={{ background: `${playing ? THREADS[0] : THREADS[2]}15`, border: `1px solid ${playing ? THREADS[0] : THREADS[2]}`, color: playing ? THREADS[0] : THREADS[2], padding: "4px 12px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer" }}>{playing ? "■ parar" : "▶ auto"}</button>
            <button onClick={exitFS} style={{ background: `${THREADS[5]}15`, border: `1px solid ${THREADS[5]}`, color: THREADS[5], padding: "4px 12px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer" }}>✕ sair</button>
          </div>
        )}
      </div>
      {!isFS && (
        <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={playing ? stop : play} style={{
            background: playing ? `${THREADS[0]}15` : `${THREADS[2]}15`, border: `1px solid ${playing ? THREADS[0] : THREADS[2]}`,
            color: playing ? THREADS[0] : THREADS[2], padding: "6px 16px", fontSize: 9, letterSpacing: "0.1em",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer", transition: "all 0.3s",
          }}>{playing ? "■ parar" : "▶ apresentação"}</button>
          <button onClick={playFS} style={{
            background: `${THREADS[5]}15`, border: `1px solid ${THREADS[5]}`,
            color: THREADS[5], padding: "6px 16px", fontSize: 9, letterSpacing: "0.1em",
            fontFamily: "'Roboto Mono', monospace", cursor: "pointer", transition: "all 0.3s",
          }}>⛶ fullscreen</button>
          <button onClick={prev} style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted, padding: "6px 12px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer" }}>←</button>
          <button onClick={next} style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted, padding: "6px 12px", fontSize: 9, fontFamily: "'Roboto Mono', monospace", cursor: "pointer" }}>→</button>
          <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'Roboto Mono', monospace" }}>{curSlide + 1} / {slides.length}</span>
          <span style={{ fontSize: 8, color: THREADS[0], fontFamily: "'Roboto Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>{slides[curSlide].id}</span>
          {playing && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 120, height: 2, background: t.border, borderRadius: 1, overflow: "hidden" }}>
                <div style={{ width: `${progress * 100}%`, height: "100%", background: THREADS[0], transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 8, color: t.textDim, fontFamily: "'Roboto Mono', monospace" }}>{Math.round(totalDuration)}s total</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
