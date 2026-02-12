// ═══════════════════════════════════════════
// TRAMA — Standalone HTML Generators
// Each function produces a complete self-contained HTML file
// with embedded CSS, Google Fonts, and canvas animation JS.
// ═══════════════════════════════════════════

import { THREADS, THEME, SPEAKERS, PROGRAMME, rng } from "../data/tokens";

// ─── Shared: inline weave animation script ───

function weaveScript({ bg, glowRGB, threadStep = 3 }) {
  return `
const THREADS=${JSON.stringify(THREADS)};
function rng(s,i){let x=Math.sin(s*9301+i*4973)*49297;return x-Math.floor(x)}
function initWeave(canvas,seed,opts){
  const ctx=canvas.getContext("2d");
  let time=0;
  const hCount=(opts&&opts.hCount)||8+Math.floor(rng(seed,0)*10);
  const vCount=(opts&&opts.vCount)||8+Math.floor(rng(seed,100)*10);
  const hT=[],vT=[];
  for(let i=0;i<hCount;i++)hT.push({thick:0.6+rng(seed,i+200)*2.2,color:THREADS[Math.floor(rng(seed,i+300)*6)],speed:0.1+rng(seed,i+400)*0.5,phase:rng(seed,i+500)*Math.PI*2,amp:3+rng(seed,i+600)*16,op:0.2+rng(seed,i+700)*0.55});
  for(let i=0;i<vCount;i++)vT.push({thick:0.6+rng(seed,i+800)*2.2,color:THREADS[Math.floor(rng(seed,i+900)*6)],speed:0.1+rng(seed,i+1000)*0.5,phase:rng(seed,i+1100)*Math.PI*2,amp:3+rng(seed,i+1200)*16,op:0.2+rng(seed,i+1300)*0.55});
  function draw(){
    time+=0.018;
    const w=canvas.width,h=canvas.height;
    ctx.fillStyle="${bg}";ctx.fillRect(0,0,w,h);
    vT.forEach((t,i)=>{const bx=(w*(i+0.5))/vCount;ctx.beginPath();ctx.strokeStyle=t.color;ctx.globalAlpha=t.op;ctx.lineWidth=t.thick;
      for(let y=0;y<h;y+=${threadStep}){const wave=Math.sin(y*0.007+time*t.speed+t.phase)*t.amp;const x=bx+wave;y===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
    hT.forEach((t,i)=>{const by=(h*(i+0.5))/hCount;ctx.beginPath();ctx.strokeStyle=t.color;ctx.globalAlpha=t.op;ctx.lineWidth=t.thick;
      for(let x=0;x<w;x+=${threadStep}){const wave=Math.sin(x*0.007+time*t.speed+t.phase)*t.amp;const y=by+wave;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
    ctx.globalAlpha=1;
    hT.forEach((h2,hi)=>{vT.forEach((v2,vi)=>{const bx=(w*(vi+0.5))/vCount;const by=(h*(hi+0.5))/hCount;
      if(rng(Math.floor(bx)*100+Math.floor(by),seed)<0.012){const g=0.08+rng(bx+by,seed+1)*0.1;const r=2+g*5;
        const grad=ctx.createRadialGradient(bx,by,0,bx,by,r);grad.addColorStop(0,"rgba(${glowRGB},"+g*0.6+")");grad.addColorStop(1,"rgba(${glowRGB},0)");ctx.fillStyle=grad;ctx.beginPath();ctx.arc(bx,by,r,0,Math.PI*2);ctx.fill()}})});
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight}
  if(opts&&opts.autoResize!==false){window.addEventListener("resize",resize);resize()}
  draw();
  return{ctx,hT,vT,getTime:()=>time};
}`;
}

function htmlHead(title, mode) {
  const t = THEME[mode];
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&family=Instrument+Serif&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:${t.bg};font-family:'Roboto Mono',monospace;color:${t.text}}
canvas{position:absolute;top:0;left:0;width:100%;height:100%}
</style>`;
}

function escHTML(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// ─── Download helper ───

export function downloadHTML(htmlContent, filename) {
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════
// 1. Weave Background (standalone animated pattern)
// ═══════════════════════════════════════════

export function generateWeaveHTML({ seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  return `${htmlHead("TRAMA — Weave Pattern #" + seed, mode)}
</head>
<body>
<canvas id="bg"></canvas>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 2. Logo
// ═══════════════════════════════════════════

export function generateLogoHTML({ seed = 42, mode = "dark", density = "normal", showLabels = true }) {
  const t = THEME[mode];
  return `${htmlHead("TRAMA — Logo #" + seed, mode)}
<style>
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.wordmark{font-size:clamp(40px,15vw,200px);font-weight:700;color:${t.wordmark || t.text};text-align:center;line-height:1}
.label-top{position:absolute;top:50%;transform:translateY(calc(-50% - 0.55em - 0.3vw));font-size:clamp(6px,0.8vw,12px);color:${THREADS[0]};letter-spacing:0.3em;opacity:0.85;text-align:center;width:100%}
.label-bottom{position:absolute;top:50%;transform:translateY(calc(-50% + 0.5em + 1.5vw));font-size:clamp(6px,0.9vw,13px);color:${t.textMuted || t.text};letter-spacing:0.2em;opacity:0.45;display:flex;align-items:center;gap:10px}
.label-line{width:clamp(20px,3vw,60px);height:1px;background:${THREADS[0]};opacity:0.5}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="overlay">
  ${showLabels ? `<div class="label-top">IADE  ·  1ª EDIÇÃO  ·  2026</div>` : ""}
  <div class="wordmark">trama</div>
  ${showLabels ? `<div class="label-bottom" style="left:50%;transform:translateX(calc(-50% - 8vw)) translateY(calc(0.5em + 4vw))"><span class="label-line"></span><span>JORNADAS DE DESIGN</span></div>` : ""}
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 3. Speaker Base
// ═══════════════════════════════════════════

export function generateSpeakerBaseHTML({ speaker, seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  const sp = speaker || SPEAKERS[0];
  return `${htmlHead("TRAMA — " + sp.name, mode)}
<style>
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;
  background:linear-gradient(90deg,${t.bg}ee 0%,${t.bg}55 50%,transparent 100%);
  display:flex;flex-direction:column;justify-content:center;padding-left:8%}
.icon{font-size:clamp(16px,2vw,28px);margin-bottom:4px}
.name{font-size:clamp(16px,2.5vw,36px);font-weight:700;color:${t.text}}
.topic{font-size:clamp(11px,1.5vw,22px);font-family:'Instrument Serif',serif;color:${t.textMuted || t.text};opacity:0.7;margin-top:6px}
.role{font-size:clamp(7px,0.9vw,13px);color:${t.textDim || t.textMuted || t.text};letter-spacing:0.1em;opacity:0.5;margin-top:8px}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="icon" style="color:${sp.color}">${escHTML(sp.icon)}</div>
  <div class="name">${escHTML(sp.name)}</div>
  <div class="topic">${escHTML(sp.topic)}</div>
  <div class="role">${escHTML(sp.role)} · ${escHTML(sp.org)}</div>
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 4. Programme Panel
// ═══════════════════════════════════════════

export function generateProgramHTML({ seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  const items = PROGRAMME.map(p => `
    <div style="display:flex;gap:clamp(12px,4vw,60px);align-items:baseline;padding:clamp(4px,0.6vw,10px) 0;border-bottom:1px solid ${t.border}">
      <span style="font-size:clamp(8px,1vw,14px);font-weight:600;color:${p.color};min-width:clamp(40px,5vw,70px)">${p.time}</span>
      <span style="font-size:clamp(8px,1vw,14px);color:${p.type === "pausa" ? (t.textDim || "#555") : t.text};flex:1">${escHTML(p.title)}</span>
      ${p.speaker ? `<span style="font-size:clamp(6px,0.8vw,11px);color:${t.textMuted || t.text};opacity:0.6">${escHTML(p.speaker)}</span>` : ""}
    </div>`).join("");

  return `${htmlHead("TRAMA — Programa", mode)}
<style>
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;
  background:linear-gradient(90deg,${t.bg}f0 0%,${t.bg}88 50%,transparent 100%);
  display:flex;flex-direction:column;padding:6% 6%;overflow-y:auto}
.header{margin-bottom:clamp(12px,2vw,30px)}
.header-tag{font-size:clamp(6px,0.8vw,10px);color:${THREADS[0]};letter-spacing:0.25em}
.header-title{font-size:clamp(20px,4vw,52px);font-weight:700;color:${t.wordmark || t.text};margin-top:4px}
.header-sub{font-size:clamp(6px,0.8vw,10px);color:${t.textMuted || t.text};letter-spacing:0.15em;opacity:0.5;margin-top:4px}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="header">
    <div class="header-tag">iade · 2026</div>
    <div class="header-title">trama</div>
    <div class="header-sub">programa · jornadas de design</div>
  </div>
  ${items}
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 5. Digital Panel
// ═══════════════════════════════════════════

export function generateDigitalPanelHTML({ seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  return `${htmlHead("TRAMA — Digital Panel #" + seed, mode)}
<style>
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;
  background:linear-gradient(90deg,${t.bg}ee 0%,${t.bg}55 40%,transparent 100%);
  display:flex;flex-direction:column;justify-content:center;padding-left:5%}
.tag{font-size:clamp(7px,1vw,12px);color:${THREADS[0]};letter-spacing:0.3em;opacity:0.85}
.title{font-size:clamp(40px,8vw,120px);font-weight:700;color:${t.wordmark || t.text};margin-top:8px}
.sub{font-size:clamp(8px,1.2vw,16px);color:${t.textMuted || t.text};letter-spacing:0.2em;opacity:0.5;margin-top:6px}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="tag">iade · 1ª edição · 2026</div>
  <div class="title">trama</div>
  <div class="sub">jornadas de design</div>
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 6. Icon
// ═══════════════════════════════════════════

export function generateIconHTML({ icon = "play", size = 256, color = "#e2ded8", mode = "dark" }) {
  const t = THEME[mode];
  // Minimal static canvas with thread background + icon SVG overlay
  return `${htmlHead("TRAMA — Icon: " + icon, mode)}
<style>
html,body{display:flex;align-items:center;justify-content:center;background:${t.bg}}
.icon-box{position:relative;width:${size}px;height:${size}px}
.icon-box canvas{width:100%;height:100%;position:absolute;top:0;left:0}
.icon-box svg{position:absolute;top:0;left:0;width:100%;height:100%}
</style>
</head>
<body>
<div class="icon-box">
  <canvas id="bg" width="${size}" height="${size}"></canvas>
</div>
<script>
const THREADS=${JSON.stringify(THREADS)};
const c=document.getElementById("bg");
const ctx=c.getContext("2d");
ctx.fillStyle="${t.bg}";ctx.fillRect(0,0,${size},${size});
for(let i=0;i<3;i++){const by=(${size}*(i+0.5))/3;ctx.beginPath();ctx.strokeStyle="${color}";ctx.lineWidth=0.3;ctx.globalAlpha=0.08;
  for(let x=0;x<${size};x+=1.5){const y=by+Math.sin(x*0.04+i*2)*2;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()}
ctx.globalAlpha=1;
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 7. Carousel Slide (Instagram / Social)
// ═══════════════════════════════════════════

export function generateCarouselSlideHTML({ slide, seed = 42, mode = "dark", slideIndex = 0 }) {
  const t = THEME[mode];
  const s = slide || { headline: "trama", sub: "jornadas de design", body: "" };
  return `${htmlHead("TRAMA — Slide " + (slideIndex + 1), mode)}
<style>
html,body{overflow:hidden}
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;
  background:linear-gradient(180deg,transparent 30%,${t.bg}dd 100%);
  display:flex;flex-direction:column;justify-content:flex-end;padding:8%}
.headline{font-size:clamp(20px,5vw,42px);font-weight:700;color:${t.text}}
.sub{font-size:clamp(10px,2vw,18px);font-family:'Instrument Serif',serif;color:${t.textMuted || t.text};opacity:0.7;margin-top:6px}
.body{font-size:clamp(8px,1.5vw,14px);color:${t.textMuted || t.text};opacity:0.5;margin-top:8px}
.footer{font-size:clamp(6px,0.8vw,10px);color:${t.textDim || t.textMuted || t.text};letter-spacing:0.15em;opacity:0.3;margin-top:auto;padding-top:16px}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="headline">${escHTML(s.headline)}</div>
  <div class="sub">${escHTML(s.sub)}</div>
  ${s.body ? `<div class="body">${escHTML(s.body)}</div>` : ""}
  <div class="footer">trama · jornadas de design</div>
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 8. Social Profile
// ═══════════════════════════════════════════

export function generateSocialProfileHTML({ seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  return `${htmlHead("TRAMA — Social Profile", mode)}
<style>
.overlay{position:absolute;top:0;left:0;right:0;bottom:0;
  background:linear-gradient(180deg,transparent 20%,${t.bg}dd 100%);
  display:flex;flex-direction:column;justify-content:flex-end;padding:8%;text-align:center;align-items:center}
.tag{font-size:clamp(6px,0.8vw,10px);color:${THREADS[0]};letter-spacing:0.3em;opacity:0.85}
.name{font-size:clamp(28px,6vw,80px);font-weight:700;color:${t.wordmark || t.text};margin:8px 0}
.desc{font-size:clamp(8px,1.2vw,14px);color:${t.textMuted || t.text};letter-spacing:0.15em;opacity:0.5}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="overlay">
  <div class="tag">IADE · 2026</div>
  <div class="name">trama</div>
  <div class="desc">jornadas de design</div>
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 9. QR Code
// ═══════════════════════════════════════════

export function generateQRHTML({ url = "https://trama.iade.pt", seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  return `${htmlHead("TRAMA — QR", mode)}
<style>
html,body{display:flex;align-items:center;justify-content:center;overflow:hidden}
.qr-wrap{position:relative;width:min(90vw,90vh);height:min(90vw,90vh)}
.qr-wrap canvas{width:100%;height:100%;position:absolute;top:0;left:0}
.qr-overlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;padding-bottom:2%}
.qr-label{font-size:clamp(6px,1vw,9px);color:${t.textDim || t.textMuted || t.text};letter-spacing:0.15em;opacity:0.5}
</style>
</head>
<body>
<div class="qr-wrap">
  <canvas id="bg"></canvas>
  <div class="qr-overlay"><span class="qr-label">${escHTML(url)}</span></div>
</div>
<script>
${weaveScript({ bg: t.bg, glowRGB: t.glow })}
initWeave(document.getElementById("bg"),${seed});
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 10. Speaker Card
// ═══════════════════════════════════════════

export function generateSpeakerCardHTML({ speaker, seed = 42, mode = "dark" }) {
  const t = THEME[mode];
  const sp = speaker || SPEAKERS[0];
  return `${htmlHead("TRAMA — Speaker " + sp.name, mode)}
<style>
html,body{display:flex;align-items:center;justify-content:center;overflow:hidden}
.card{position:relative;width:min(90vw,400px);background:${t.surface};border:1px solid ${t.border};overflow:hidden;border-radius:2px}
.card-canvas{height:120px;position:relative}
.card-canvas canvas{width:100%;height:100%}
.card-body{padding:20px 24px}
.card-icon{font-size:18px;margin-bottom:4px}
.card-name{font-size:16px;font-weight:700;color:${t.text}}
.card-topic{font-size:12px;font-family:'Instrument Serif',serif;color:${t.textMuted || t.text};opacity:0.7;margin-top:4px}
.card-role{font-size:8px;color:${t.textDim || t.textMuted || t.text};letter-spacing:0.1em;opacity:0.5;margin-top:8px}
</style>
</head>
<body>
<div class="card">
  <div class="card-canvas">
    <canvas id="bg"></canvas>
  </div>
  <div class="card-body">
    <div class="card-icon" style="color:${sp.color}">${escHTML(sp.icon)}</div>
    <div class="card-name">${escHTML(sp.name)}</div>
    <div class="card-topic">${escHTML(sp.topic)}</div>
    <div class="card-role">${escHTML(sp.role)} · ${escHTML(sp.org)}</div>
  </div>
</div>
<script>
const THREADS=${JSON.stringify(THREADS)};
function rng(s,i){let x=Math.sin(s*9301+i*4973)*49297;return x-Math.floor(x)}
const c=document.getElementById("bg");
c.width=400;c.height=120;
const ctx=c.getContext("2d");
const seed=${seed};
let time=0;
const hCount=6,vCount=6;
const hT=[],vT=[];
for(let i=0;i<hCount;i++)hT.push({thick:0.4+rng(seed,i+200)*1.5,color:THREADS[Math.floor(rng(seed,i+300)*6)],speed:0.1+rng(seed,i+400)*0.3,phase:rng(seed,i+500)*Math.PI*2,amp:2+rng(seed,i+600)*10,op:0.15+rng(seed,i+700)*0.35});
for(let i=0;i<vCount;i++)vT.push({thick:0.4+rng(seed,i+800)*1.5,color:THREADS[Math.floor(rng(seed,i+900)*6)],speed:0.1+rng(seed,i+1000)*0.3,phase:rng(seed,i+1100)*Math.PI*2,amp:2+rng(seed,i+1200)*10,op:0.15+rng(seed,i+1300)*0.35});
function draw(){
  time+=0.018;const w=c.width,h=c.height;
  ctx.fillStyle="${t.bg}";ctx.fillRect(0,0,w,h);
  vT.forEach((t,i)=>{const bx=(w*(i+0.5))/vCount;ctx.beginPath();ctx.strokeStyle=t.color;ctx.globalAlpha=t.op;ctx.lineWidth=t.thick;
    for(let y=0;y<h;y+=2){const x=bx+Math.sin(y*0.007+time*t.speed+t.phase)*t.amp;y===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
  hT.forEach((t,i)=>{const by=(h*(i+0.5))/hCount;ctx.beginPath();ctx.strokeStyle=t.color;ctx.globalAlpha=t.op;ctx.lineWidth=t.thick;
    for(let x=0;x<w;x+=2){const y=by+Math.sin(x*0.007+time*t.speed+t.phase)*t.amp;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
  ctx.globalAlpha=1;
  requestAnimationFrame(draw);
}
draw();
<\/script>
</body>
</html>`;
}

// ═══════════════════════════════════════════
// 11. Thread Studio (standalone weave explorer)
// ═══════════════════════════════════════════

export function generateThreadStudioHTML({ seed = 42, mode = "dark" }) {
  // Alias to weave — ThreadStudio is the base pattern explorer
  return generateWeaveHTML({ seed, mode });
}
