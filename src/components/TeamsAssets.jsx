import { useState, useEffect, useRef } from "react";
import { THREADS, THEME, PROGRAMME, SPEAKERS, rng } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import Countdown from "./Countdown";
import { generateTeamsSVG, downloadSVG } from "../utils/exportSVG";
import { exportTeamsSeparatorPNGSequence } from "../utils/exportPNGSequence";

// Safe area for HD content (Teams overlays ~ 10% margins)
const SAFE = { top: 0.08, bottom: 0.12, left: 0.05, right: 0.05 };

// ─── Standalone HTML generator for separators (with embedded editable controls) ───
function generateSeparatorHTML({ title, subtitle, color, mode, seed }) {
  const t = THEME[mode];
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TRAMA Separador — ${title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:${t.bg};font-family:'Roboto Mono',monospace}
canvas{position:absolute;top:0;left:0;width:100%;height:100%}
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;
  background:radial-gradient(ellipse at center,${t.bg}cc 0%,transparent 100%)}
.line{width:40px;height:1px;margin:10px 0;transition:background 0.3s}
.title{font-size:clamp(24px,5vw,64px);font-weight:700;text-align:center;color:${color};line-height:1.2;
  text-shadow:${mode === "dark" ? "0 0 40px rgba(0,0,0,0.8)" : "0 0 40px rgba(255,255,255,0.8)"}}
.subtitle{font-size:clamp(9px,1.2vw,14px);color:${t.textMuted};margin-top:10px;letter-spacing:0.15em;text-transform:uppercase}
.bars{position:absolute;bottom:16px;display:flex;gap:4px;justify-content:center;width:100%}
.bar{width:16px;height:2px;border-radius:1px;opacity:0.3}
/* ─── Controls panel ─── */
.controls{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;gap:12px;padding:10px 16px;
  background:${mode === "dark" ? "rgba(7,7,9,0.85)" : "rgba(226,222,216,0.85)"};backdrop-filter:blur(8px);
  border-bottom:1px solid ${t.border};align-items:center;flex-wrap:wrap;
  transform:translateY(-100%);transition:transform 0.3s ease;opacity:0.95}
.controls.open{transform:translateY(0)}
.controls label{font-size:8px;color:${t.textDim};letter-spacing:0.1em;text-transform:uppercase}
.controls input[type="text"]{background:${t.surface};border:1px solid ${t.border};color:${t.text};
  padding:5px 8px;font-size:11px;font-family:'Roboto Mono',monospace;border-radius:2px;outline:none}
.controls input[type="text"]:focus{border-color:${color}}
.controls input[type="color"]{width:28px;height:28px;border:1px solid ${t.border};cursor:pointer;background:transparent;padding:0}
.controls input[type="number"]{background:${t.surface};border:1px solid ${t.border};color:${t.text};
  padding:5px 6px;font-size:10px;font-family:'Roboto Mono',monospace;border-radius:2px;width:60px;outline:none}
.ctrl-group{display:flex;flex-direction:column;gap:3px}
.toggle-btn{position:fixed;top:8px;right:8px;z-index:101;background:${mode === "dark" ? "rgba(7,7,9,0.6)" : "rgba(226,222,216,0.6)"};
  border:1px solid ${t.border};color:${t.textMuted};padding:4px 10px;font-size:8px;letter-spacing:0.1em;
  font-family:'Roboto Mono',monospace;cursor:pointer;text-transform:uppercase;transition:opacity 0.3s}
.toggle-btn:hover{opacity:1}
</style>
</head>
<body>
<button class="toggle-btn" onclick="toggleControls()">⚙ editar</button>
<div class="controls" id="controls">
  <div class="ctrl-group">
    <label>título</label>
    <input type="text" id="inp-title" value="${title}" oninput="updateTitle(this.value)" style="width:200px">
  </div>
  <div class="ctrl-group">
    <label>subtítulo</label>
    <input type="text" id="inp-sub" value="${subtitle || "trama · jornadas de design"}" oninput="updateSubtitle(this.value)" style="width:260px">
  </div>
  <div class="ctrl-group">
    <label>cor</label>
    <input type="color" id="inp-color" value="${color}" oninput="updateColor(this.value)">
  </div>
  <div class="ctrl-group">
    <label>seed</label>
    <input type="number" id="inp-seed" value="${seed}" min="0" max="9999" onchange="location.reload()">
  </div>
</div>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="line" id="line1"></div>
  <div class="title" id="el-title">${title}</div>
  <div class="line" id="line2"></div>
  <div class="subtitle" id="el-sub">${subtitle || "trama · jornadas de design"}</div>
  <div class="bars">
    ${THREADS.map(c => `<div class="bar" style="background:${c}"></div>`).join("")}
  </div>
</div>
<script>
const THREADS=${JSON.stringify(THREADS)};
let accentColor="${color}";
const seed=${seed};
function rng(s,i){let x=Math.sin(s*9301+i*4973)*49297;return x-Math.floor(x)}

// Controls
function toggleControls(){document.getElementById("controls").classList.toggle("open")}
function updateTitle(v){document.getElementById("el-title").textContent=v;document.title="TRAMA Separador — "+v}
function updateSubtitle(v){document.getElementById("el-sub").textContent=v}
function updateColor(v){accentColor=v;document.getElementById("line1").style.background=v;document.getElementById("line2").style.background=v}
// Init accent color
document.getElementById("line1").style.background=accentColor;
document.getElementById("line2").style.background=accentColor;

// Keyboard: Escape toggles controls, F11 fullscreen
document.addEventListener("keydown",e=>{if(e.key==="Escape")toggleControls();if(e.key==="F11"){e.preventDefault();document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}});

const canvas=document.getElementById("bg");
const ctx=canvas.getContext("2d");
let time=0;
function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight}
window.addEventListener("resize",resize);resize();
const hCount=8+Math.floor(rng(seed,0)*10);
const vCount=8+Math.floor(rng(seed,100)*10);
const hT=[],vT=[];
for(let i=0;i<hCount;i++)hT.push({base:0,thick:0.6+rng(seed,i+200)*2.2,color:THREADS[Math.floor(rng(seed,i+300)*6)],speed:0.1+rng(seed,i+400)*0.5,phase:rng(seed,i+500)*Math.PI*2,amp:3+rng(seed,i+600)*16,op:0.2+rng(seed,i+700)*0.55});
for(let i=0;i<vCount;i++)vT.push({base:0,thick:0.6+rng(seed,i+800)*2.2,color:THREADS[Math.floor(rng(seed,i+900)*6)],speed:0.1+rng(seed,i+1000)*0.5,phase:rng(seed,i+1100)*Math.PI*2,amp:3+rng(seed,i+1200)*16,op:0.2+rng(seed,i+1300)*0.55});
function draw(){
  time+=0.018;
  const w=canvas.width,h=canvas.height;
  ctx.fillStyle="${t.bg}";ctx.fillRect(0,0,w,h);
  hT.forEach((t,i)=>{t.base=(h*(i+0.5))/hCount;ctx.beginPath();ctx.strokeStyle=t.color;ctx.globalAlpha=t.op;ctx.lineWidth=t.thick;
    for(let x=0;x<w;x+=3){const wave=Math.sin(x*0.007+time*t.speed+t.phase)*t.amp;const y=t.base+wave;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
  vT.forEach((t,i)=>{t.base=(w*(i+0.5))/vCount;ctx.beginPath();ctx.strokeStyle=t.color;ctx.globalAlpha=t.op;ctx.lineWidth=t.thick;
    for(let y=0;y<h;y+=3){const wave=Math.sin(y*0.007+time*t.speed+t.phase)*t.amp;const x=t.base+wave;y===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
  ctx.globalAlpha=1;
  requestAnimationFrame(draw);
}
draw();
<\/script>
</body>
</html>`;
}

// ─── Separator card with editable title/subtitle, animation, HTML export ───
function TeamsSeparator({ title: defaultTitle, subtitle: defaultSubtitle, color, mode = "dark", seed = 42, width = 384, speed = 1, animated = true }) {
  const t = THEME[mode];
  const height = Math.round(width * (9 / 16));
  const [title, setTitle] = useState(defaultTitle);
  const [subtitle, setSubtitle] = useState(defaultSubtitle || "trama · jornadas de design");
  const safe = {
    top: height * SAFE.top,
    bottom: height * SAFE.bottom,
    left: width * SAFE.left,
    right: width * SAFE.right,
  };

  // Sync with parent override
  useEffect(() => { setTitle(defaultTitle); }, [defaultTitle]);
  useEffect(() => { setSubtitle(defaultSubtitle || "trama · jornadas de design"); }, [defaultSubtitle]);

  const exportHTML = () => {
    const html = generateSeparatorHTML({ title, subtitle, color, mode, seed });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trama-separator-${title.replace(/\s/g, "-")}-${mode}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ position: "relative", width, height, overflow: "hidden", border: `1px solid ${t.border}` }}>
        <WeaveCanvas width={width} height={height} seed={seed} interactive={false} mode={mode} speed={speed} animated={animated} />
        <div style={{
          position: "absolute",
          top: safe.top, left: safe.left,
          right: safe.right, bottom: safe.bottom,
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          background: `radial-gradient(ellipse at center, ${t.bg}cc 0%, transparent 100%)`,
        }}>
          <div style={{ width: 20, height: 1, background: color, marginBottom: 10 }} />
          <div style={{
            fontSize: height * 0.1, fontWeight: 700, textAlign: "center",
            color: color, lineHeight: 1.2, maxWidth: "70%",
          }}>{title}</div>
          <div style={{ width: 20, height: 1, background: color, marginTop: 10 }} />
          <div style={{ fontSize: height * 0.03, color: t.textMuted, marginTop: 8, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {subtitle}
          </div>
        </div>
        {/* Safe area indicator (subtle) */}
        <div style={{
          position: "absolute", top: safe.top, left: safe.left,
          right: safe.right, bottom: safe.bottom,
          border: `1px dashed ${t.border}`, pointerEvents: "none",
        }} />
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <ExportButton mode={mode} label="svg" onClick={() => downloadSVG(generateTeamsSVG({ type: "separator", width: 1920, height: 1080, seed, mode, session: { title, color } }), `trama-teams-separator-${title}-${mode}.svg`)} />
        <button onClick={exportHTML} style={{
          background: `${THREADS[1]}15`, border: `1px solid ${THREADS[1]}40`, color: THREADS[1],
          padding: "3px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>↓ html</button>
        <ExportButton mode={mode} label="png seq · zip" onClick={() => exportTeamsSeparatorPNGSequence({ title, color, seed, mode })} />
      </div>
    </div>
  );
}


export default function TeamsAssets({ mode, speed = 3, animated = true }) {
  const t = THEME[mode];
  const [sepTitle, setSepTitle] = useState("");
  const [sepSubtitle, setSepSubtitle] = useState("");

  const inputStyle = {
    background: t.surface, border: `1px solid ${t.border}`, color: t.text,
    padding: "6px 10px", fontSize: 10, fontFamily: "'Roboto Mono', monospace",
    borderRadius: 2, outline: "none", transition: "border 0.3s",
  };

  return (
    <div>
      {/* Title/Subtitle editing */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Roboto Mono', monospace" }}>título (override)</label>
          <input type="text" value={sepTitle} onChange={e => setSepTitle(e.target.value)} placeholder="(usar default)"
            style={{ ...inputStyle, width: 180 }}
            onFocus={e => { e.target.style.borderColor = THREADS[4]; }}
            onBlur={e => { e.target.style.borderColor = t.border; }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Roboto Mono', monospace" }}>subtítulo (override)</label>
          <input type="text" value={sepSubtitle} onChange={e => setSepSubtitle(e.target.value)} placeholder="trama · jornadas de design"
            style={{ ...inputStyle, width: 240 }}
            onFocus={e => { e.target.style.borderColor = THREADS[4]; }}
            onBlur={e => { e.target.style.borderColor = t.border; }} />
        </div>
      </div>

      {/* Separators */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>
        separadores de sessão · safe area hd
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {["keynotes", "workshops", "debate", "pausa"].map((defaultTitle, i) => (
          <TeamsSeparator
            key={i}
            title={sepTitle || defaultTitle}
            subtitle={sepSubtitle || "trama · jornadas de design"}
            color={THREADS[i]}
            mode={mode}
            seed={42 + i * 50}
            width={1280}
            speed={speed}
            animated={animated}
          />
        ))}
      </div>

      {/* Countdown — uses the full Countdown component */}
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, borderLeft: `2px solid ${THREADS[4]}`, paddingLeft: 10 }}>
        countdown de sessão
      </div>
      <div style={{ marginBottom: 40 }}>
        <Countdown session={{ title: PROGRAMME[1].title, speaker: PROGRAMME[1].speaker, color: PROGRAMME[1].color, seed: 242 }} mode="dark" width={1280} height={720} />
      </div>

    </div>
  );
}
