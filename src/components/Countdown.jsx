import { useState, useEffect, useRef, useCallback } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import WeaveCanvas from "./WeaveCanvas";
import ExportButton from "./ExportButton";
import { generateCountdownSVG, downloadSVG } from "../utils/exportSVG";

const FPS = 25;

function formatTC(totalMs) {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  const f = String(Math.floor((totalMs % 1000) / (1000 / FPS)) % FPS).padStart(2, "0");
  return { h, m, s, f, full: `${h}:${m}:${s}:${f}` };
}

function CountdownDisplay({ session, mode, width, height, remainMs }) {
  const t = THEME[mode];
  const tc = formatTC(remainMs);

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <WeaveCanvas width={width} height={height} seed={session?.seed || 42} interactive={false} mode={mode} speed={2} animated={true} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 30%, transparent 70%, ${t.overlay} 100%)`,
      }}>
        <div style={{ fontSize: Math.min(width * 0.022, 12), color: session?.color || THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
          a começar em
        </div>
        <div style={{
          fontSize: Math.min(width * 0.12, 72), fontWeight: 700, letterSpacing: "0.08em",
          color: t.wordmark, fontFamily: "'Roboto Mono', monospace",
          textShadow: mode === "dark" ? "0 0 40px rgba(0,0,0,0.8)" : "0 0 40px rgba(255,255,255,0.8)",
        }}>
          {tc.h}:{tc.m}:{tc.s}<span style={{ fontSize: "0.55em", opacity: 0.5 }}>:{tc.f}</span>
        </div>
        <div style={{ width: 40, height: 1, background: session?.color || THREADS[0], margin: "16px 0" }} />
        <div style={{
          fontSize: Math.min(width * 0.035, 22), fontWeight: 700, textAlign: "center", maxWidth: width * 0.7,
          color: t.wordmark, lineHeight: 1.3,
          textShadow: mode === "dark" ? "0 0 30px rgba(0,0,0,0.7)" : "0 0 30px rgba(255,255,255,0.7)",
        }}>
          {session?.title || "Sessão"}
        </div>
        <div style={{ fontSize: Math.min(width * 0.02, 11), color: t.textMuted, marginTop: 8 }}>
          {session?.speaker || "Convidado"}
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

function generateStandaloneHTML({ session, mode, hours, minutes, seconds }) {
  const t = THEME[mode];
  const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const color = session?.color || THREADS[0];
  const title = session?.title || "Sessão";
  const speaker = session?.speaker || "Convidado";
  const seed = session?.seed || 42;

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TRAMA Countdown — ${title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:${t.bg};font-family:'Roboto Mono',monospace}
canvas{position:absolute;top:0;left:0;width:100%;height:100%}
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;
  background:linear-gradient(180deg,${t.overlay} 0%,transparent 30%,transparent 70%,${t.overlay} 100%)}
.label{font-size:clamp(10px,1.5vw,14px);letter-spacing:0.3em;text-transform:uppercase;margin-bottom:12px;transition:color 0.3s}
.tc{font-size:clamp(32px,10vw,120px);font-weight:700;letter-spacing:0.08em;color:${t.wordmark};
  text-shadow:${mode==="dark"?"0 0 40px rgba(0,0,0,0.8)":"0 0 40px rgba(255,255,255,0.8)"}}
.tc .frames{font-size:0.55em;opacity:0.5}
.line{width:40px;height:1px;margin:16px 0;transition:background 0.3s}
.title{font-size:clamp(14px,3vw,28px);font-weight:700;text-align:center;color:${t.wordmark};line-height:1.3;max-width:70%;
  text-shadow:${mode==="dark"?"0 0 30px rgba(0,0,0,0.7)":"0 0 30px rgba(255,255,255,0.7)"}}
.speaker{font-size:clamp(9px,1.2vw,13px);color:${t.textMuted};margin-top:8px}
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
  padding:5px 6px;font-size:10px;font-family:'Roboto Mono',monospace;border-radius:2px;width:50px;outline:none}
.ctrl-group{display:flex;flex-direction:column;gap:3px}
.ctrl-row{display:flex;align-items:center;gap:6px}
.ctrl-btn{background:transparent;border:1px solid ${t.border};color:${t.textMuted};
  padding:4px 10px;font-size:8px;letter-spacing:0.08em;text-transform:uppercase;
  font-family:'Roboto Mono',monospace;cursor:pointer}
.ctrl-btn:hover{border-color:${t.text};color:${t.text}}
.ctrl-btn.active{background:${THREADS[0]}15;border-color:${THREADS[0]};color:${THREADS[0]}}
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
    <label>título sessão</label>
    <input type="text" id="inp-title" value="${title}" oninput="updateTitle(this.value)" style="width:200px">
  </div>
  <div class="ctrl-group">
    <label>convidado</label>
    <input type="text" id="inp-speaker" value="${speaker}" oninput="updateSpeaker(this.value)" style="width:180px">
  </div>
  <div class="ctrl-group">
    <label>cor</label>
    <input type="color" id="inp-color" value="${color}" oninput="updateColor(this.value)">
  </div>
  <div class="ctrl-group">
    <label>tempo</label>
    <div class="ctrl-row">
      <input type="number" id="inp-h" value="${hours}" min="0" max="23" style="width:40px" onchange="resetTimer()">
      <span style="color:${t.textDim};font-size:8px">h</span>
      <input type="number" id="inp-m" value="${minutes}" min="0" max="59" style="width:40px" onchange="resetTimer()">
      <span style="color:${t.textDim};font-size:8px">m</span>
      <input type="number" id="inp-s" value="${seconds}" min="0" max="59" style="width:40px" onchange="resetTimer()">
      <span style="color:${t.textDim};font-size:8px">s</span>
    </div>
  </div>
  <div class="ctrl-group">
    <label>&nbsp;</label>
    <div class="ctrl-row">
      <button class="ctrl-btn" id="btn-play" onclick="togglePlay()">■ pausa</button>
      <button class="ctrl-btn" onclick="resetTimer()">↻ reset</button>
    </div>
  </div>
</div>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="label" id="el-label">a começar em</div>
  <div class="tc" id="tc">00:00:00<span class="frames">:00</span></div>
  <div class="line" id="el-line"></div>
  <div class="title" id="el-title">${title}</div>
  <div class="speaker" id="el-speaker">${speaker}</div>
  <div class="bars">
    ${THREADS.map(c=>`<div class="bar" style="background:${c}"></div>`).join("")}
  </div>
</div>
<script>
const THREADS=${JSON.stringify(THREADS)};
const FPS=25;
let accentColor="${color}";
let endTime=Date.now()+${totalMs};
let running=true;
let pausedRemain=0;
const seed=${seed};
function rng(s,i){let x=Math.sin(s*9301+i*4973)*49297;return x-Math.floor(x)}

// Controls
function toggleControls(){document.getElementById("controls").classList.toggle("open")}
function updateTitle(v){document.getElementById("el-title").textContent=v;document.title="TRAMA Countdown — "+v}
function updateSpeaker(v){document.getElementById("el-speaker").textContent=v}
function updateColor(v){accentColor=v;document.getElementById("el-label").style.color=v;document.getElementById("el-line").style.background=v}
function resetTimer(){
  const h=parseInt(document.getElementById("inp-h").value)||0;
  const m=parseInt(document.getElementById("inp-m").value)||0;
  const s=parseInt(document.getElementById("inp-s").value)||0;
  const total=(h*3600+m*60+s)*1000;
  endTime=Date.now()+total;
  running=true;
  document.getElementById("btn-play").textContent="■ pausa";
  document.getElementById("btn-play").classList.add("active");
}
function togglePlay(){
  if(running){running=false;pausedRemain=Math.max(0,endTime-Date.now());
    document.getElementById("btn-play").textContent="▶ play";document.getElementById("btn-play").classList.remove("active");
  }else{running=true;endTime=Date.now()+pausedRemain;
    document.getElementById("btn-play").textContent="■ pausa";document.getElementById("btn-play").classList.add("active");
  }
}
// Init accent color
document.getElementById("el-label").style.color=accentColor;
document.getElementById("el-line").style.background=accentColor;
// Keyboard: Escape toggles controls, Space play/pause, F11 fullscreen
document.addEventListener("keydown",e=>{
  if(e.target.tagName==="INPUT")return;
  if(e.key==="Escape")toggleControls();
  if(e.key===" "){e.preventDefault();togglePlay()}
  if(e.key==="F11"){e.preventDefault();document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}
});

// Canvas weave
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

  // Countdown
  const remain=running?Math.max(0,endTime-Date.now()):pausedRemain;
  const totalSec=Math.floor(remain/1000);
  const hh=String(Math.floor(totalSec/3600)).padStart(2,"0");
  const mm=String(Math.floor((totalSec%3600)/60)).padStart(2,"0");
  const ss=String(totalSec%60).padStart(2,"0");
  const ff=String(Math.floor((remain%1000)/(1000/FPS))%FPS).padStart(2,"0");
  document.getElementById("tc").innerHTML=hh+":"+mm+":"+ss+'<span class="frames">:'+ff+'</span>';

  requestAnimationFrame(draw);
}
draw();
<\/script>
</body>
</html>`;
}

export default function Countdown({ session, mode, width = 640, height = 360, thumbWidth }) {
  const t = THEME[mode];
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [remainMs, setRemainMs] = useState(5 * 60 * 1000);
  const startRef = useRef(Date.now());
  const totalRef = useRef(5 * 60 * 1000);

  // Update total when time controls change
  useEffect(() => {
    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    totalRef.current = totalMs;
    startRef.current = Date.now();
    setRemainMs(totalMs);
  }, [hours, minutes, seconds]);

  // Timer tick — frame-accurate
  useEffect(() => {
    if (!running) return;
    let raf;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setRemainMs(Math.max(0, totalRef.current - elapsed));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const reset = () => {
    startRef.current = Date.now();
    setRemainMs(totalRef.current);
  };

  const exportHTML = () => {
    const html = generateStandaloneHTML({ session, mode, hours, minutes, seconds });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trama-countdown-${mode}-${hours}h${minutes}m${seconds}s.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tc = formatTC(remainMs);

  return (
    <div>
      {/* Time controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "h", value: hours, set: setHours, max: 23 },
          { label: "m", value: minutes, set: setMinutes, max: 59 },
          { label: "s", value: seconds, set: setSeconds, max: 59 },
        ].map(ctrl => (
          <div key={ctrl.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => ctrl.set(v => Math.min(ctrl.max, v + 1))} style={{
              background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
              width: 20, height: 20, fontSize: 10, cursor: "pointer", fontFamily: "'Roboto Mono', monospace",
            }}>+</button>
            <span style={{ fontSize: 12, color: t.text, fontFamily: "'Roboto Mono', monospace", minWidth: 20, textAlign: "center", fontWeight: 600 }}>
              {String(ctrl.value).padStart(2, "0")}
            </span>
            <button onClick={() => ctrl.set(v => Math.max(0, v - 1))} style={{
              background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
              width: 20, height: 20, fontSize: 10, cursor: "pointer", fontFamily: "'Roboto Mono', monospace",
            }}>−</button>
            <span style={{ fontSize: 7, color: t.textDim, letterSpacing: "0.08em", fontFamily: "'Roboto Mono', monospace" }}>{ctrl.label}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 16, background: t.border, margin: "0 4px" }} />
        <button onClick={() => setRunning(!running)} style={{
          background: running ? `${THREADS[0]}15` : `${THREADS[2]}15`,
          border: `1px solid ${running ? THREADS[0] : THREADS[2]}40`,
          color: running ? THREADS[0] : THREADS[2],
          padding: "4px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>{running ? "■ pausa" : "▶ play"}</button>
        <button onClick={reset} style={{
          background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
          padding: "4px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>↻ reset</button>
      </div>

      {/* Timecode readout */}
      <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'Roboto Mono', monospace", marginBottom: 10, letterSpacing: "0.15em" }}>
        TC {tc.full} · {FPS}fps
      </div>

      {/* Preview — thumbnail + click to expand 100% */}
        <div style={{ border: `1px solid ${t.border}` }}>
          <CountdownDisplay session={session} mode={mode} width={thumbWidth || width} height={thumbWidth ? Math.round(thumbWidth * (height / width)) : height} remainMs={remainMs} />
        </div>

      {/* Export row */}
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <ExportButton mode={mode} label="svg" onClick={() => downloadSVG(generateCountdownSVG({ session, width, height, seed: session?.seed || 42, mode }), `trama-countdown-${mode}.svg`)} />
        <button onClick={exportHTML} style={{
          background: `${THREADS[1]}15`, border: `1px solid ${THREADS[1]}40`, color: THREADS[1],
          padding: "3px 10px", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: "'Roboto Mono', monospace", cursor: "pointer",
        }}>↓ html standalone</button>
      </div>
    </div>
  );
}
