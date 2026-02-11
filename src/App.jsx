import { useState, useEffect, useRef } from "react";
import { THREADS, THEME, SPEAKERS, PROGRAMME, rng } from "./data/tokens";
import WeaveCanvas from "./components/WeaveCanvas";
import SpeakerCard from "./components/SpeakerCard";
import TramaQR from "./components/TramaQR";
import Countdown from "./components/Countdown";
import InstagramCarousel from "./components/InstagramCarousel";
import { PosterVertical, PosterHorizontal, SeparatorCard } from "./components/Posters";
import InteractiveExperience from "./components/InteractiveExperience";

function Section({ id, children, theme, noBorder }) {
  const t = THEME[theme];
  return (
    <section id={id} style={{
      padding: "80px 40px", borderBottom: noBorder ? "none" : `1px solid ${t.border}`,
      background: t.bg, color: t.text, transition: "background 0.4s, color 0.4s",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function SectionLabel({ number, label, color, theme }) {
  const t = THEME[theme];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
      <span style={{ fontSize: 10, color: t.textDim, letterSpacing: "0.1em" }}>{number}</span>
      <div style={{ width: 28, height: 1, background: t.border }} />
      <span style={{ fontSize: 10, color, letterSpacing: "0.25em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [seed, setSeed] = useState(42);
  const [scrollY, setScrollY] = useState(0);
  const [cW, setCW] = useState(960);

  const t = THEME[theme];

  useEffect(() => {
    const update = () => setCW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroH = Math.min(560, cW * 0.5);
  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  const regen = () => setSeed(Math.floor(Math.random() * 9999));
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: "'Roboto Mono', monospace", transition: "background 0.4s, color 0.4s", minHeight: "100vh" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${t.bg}; transition: background 0.4s; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${t.bg}; }
        ::-webkit-scrollbar-thumb { background: ${t.textDim}; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 40px",
        background: scrollY > 60 ? t.navBg : "transparent",
        backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
        borderBottom: scrollY > 60 ? `1px solid ${t.border}` : "1px solid transparent",
        transition: "all 0.4s",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", color: t.text }}>trama</span>
          <span style={{ fontSize: 8, color: t.textMuted, letterSpacing: "0.18em", textTransform: "uppercase" }}>design system</span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          {["identidade", "sistema", "oradores", "social", "posters", "experiência"].map(s => (
            <button key={s} onClick={() => scrollTo(s)} style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
              color: t.textMuted, fontFamily: "'Roboto Mono', monospace",
            }}>{s}</button>
          ))}
          <button onClick={toggleTheme} style={{
            background: "none", border: `1px solid ${t.border}`, color: t.textMuted,
            padding: "5px 12px", fontFamily: "'Roboto Mono', monospace", fontSize: 9,
            letterSpacing: "0.1em", cursor: "pointer",
          }}>{theme === "dark" ? "☀ light" : "☽ dark"}</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", marginTop: 44 }}>
        <WeaveCanvas width={cW} height={heroH} seed={seed} interactive={true} mode={theme} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 40px", pointerEvents: "none",
          background: `linear-gradient(180deg, ${t.overlay} 0%, transparent 40%, ${t.overlay} 100%)`,
        }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", animation: "fadeInUp 1s ease-out" }}>
            <div style={{ fontSize: 9, color: THREADS[0], letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20 }}>iade · 1ª edição · 2025</div>
            <h1 style={{ fontSize: Math.min(cW * 0.12, 120), fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 0.85, margin: 0, color: t.wordmark }}>trama</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
              <div style={{ height: 1, width: 36, background: THREADS[0] }} />
              <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textMuted }}>jornadas de design</span>
            </div>
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 40px", background: `${t.bg}bb`, backdropFilter: "blur(6px)", borderTop: `1px solid ${t.border}`,
        }}>
          <div style={{ display: "flex", gap: 24, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {[{ c: THREADS[1], l: "15 maio 2025" }, { c: THREADS[2], l: "online" }, { c: THREADS[3], l: "entrada livre" }].map((item, i) => (
              <span key={i} style={{ color: t.textMuted }}><span style={{ color: item.c }}>●</span> {item.l}</span>
            ))}
          </div>
          <button onClick={regen} style={{
            background: "none", border: `1px solid ${t.border}`, color: t.textMuted,
            padding: "5px 12px", fontFamily: "'Roboto Mono', monospace", fontSize: 9, cursor: "pointer",
          }}>↻ #{seed}</button>
        </div>
      </section>

      {/* 01 IDENTIDADE */}
      <Section id="identidade" theme={theme}>
        <SectionLabel number="01" label="Identidade" color={THREADS[0]} theme={theme} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          {[
            { n: "01", title: "Cruzar", text: "Perspectivas que se encontram. Design gráfico, computacional, de produto, de experiência — todos os fios num mesmo tecido.", c: THREADS[0] },
            { n: "02", title: "Entrelaçar", text: "Workshops, palestras e debates que ligam teoria e prática, tradição e experimentação, academia e indústria.", c: THREADS[1] },
            { n: "03", title: "Gerar", text: "Novas ideias, novas conexões, novas formas. Uma trama que só existe quando todos os fios estão presentes.", c: THREADS[2] },
          ].map(item => (
            <div key={item.n}>
              <div style={{ fontSize: 9, color: item.c, letterSpacing: "0.2em", marginBottom: 12 }}>{item.n}</div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", marginBottom: 14 }}>{item.title}</h3>
              <p style={{ fontSize: 11, lineHeight: 1.8, color: t.textMuted }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 02 DESIGN SYSTEM */}
      <Section id="sistema" theme={theme}>
        <SectionLabel number="02" label="Design System" color={THREADS[1]} theme={theme} />
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>paleta cromática</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[...THREADS, THEME.dark.bg, THEME.light.bg].map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 52, height: 52, borderRadius: 3, background: c, border: `1px solid ${t.borderHover}` }} />
                <span style={{ fontSize: 8, color: t.textMuted }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>tipografia</div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8 }}>trama</div>
          <div style={{ fontSize: 28, fontWeight: 400, color: t.textMuted, marginBottom: 20 }}>jornadas de design</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontStyle: "italic", color: t.textMuted }}>Cruzar, Entrelaçar, Gerar</div>
        </div>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>versões dark / light</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["dark", "light"].map(m => (
              <div key={m} style={{ border: `1px solid ${t.border}`, overflow: "hidden", position: "relative" }}>
                <WeaveCanvas width={Math.floor((Math.min(cW, 1080) - 130) / 2)} height={200} seed={seed} interactive={false} mode={m} />
                <div style={{ position: "absolute", top: 8, left: 10, fontSize: 8, color: m === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{m}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Variations */}
        <div>
          <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>variações generativas</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, cursor: "pointer" }} onClick={regen}>
            {[seed, seed + 7, seed + 23, seed + 99].map(s => (
              <div key={s} style={{ border: `1px solid ${t.border}`, overflow: "hidden", position: "relative" }}>
                <WeaveCanvas width={Math.floor((Math.min(cW, 1080) - 114) / 4)} height={120} seed={s} interactive={false} mode={theme} />
                <div style={{ position: "absolute", bottom: 4, left: 6, fontSize: 7, color: t.textDim }}>#{s}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 03 ORADORES */}
      <Section id="oradores" theme={theme}>
        <SectionLabel number="03" label="Oradores" color={THREADS[2]} theme={theme} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 40 }}>
          {SPEAKERS.map((s, i) => <SpeakerCard key={i} speaker={s} mode={theme} index={i} />)}
        </div>
        <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>programa</div>
        {PROGRAMME.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 16, alignItems: "baseline",
            padding: "10px 0", borderBottom: `1px solid ${t.border}`,
            opacity: item.type === "pausa" ? 0.4 : 1,
          }}>
            <span style={{ fontSize: 11, color: item.color, fontWeight: 600, minWidth: 48 }}>{item.time}</span>
            <span style={{ fontSize: 11, flex: 1 }}>{item.title}</span>
            <span style={{ fontSize: 9, color: t.textMuted }}>{item.speaker}</span>
            <span style={{ fontSize: 7, padding: "2px 6px", border: `1px solid ${item.color}30`, color: item.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.type}</span>
          </div>
        ))}
      </Section>

      {/* 04 SOCIAL MEDIA */}
      <Section id="social" theme={theme}>
        <SectionLabel number="04" label="Redes Sociais" color={THREADS[3]} theme={theme} />
        <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>motion — formatos animados</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 40, alignItems: "flex-end" }}>
          {[{ f: "Story 9:16", w: 120, h: 213 }, { f: "Post 1:1", w: 160, h: 160 }, { f: "Banner 16:9", w: 213, h: 120 }].map(item => (
            <div key={item.f} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ border: `1px solid ${t.border}`, overflow: "hidden" }}>
                <WeaveCanvas width={item.w} height={item.h} seed={seed} interactive={false} mode={theme} />
              </div>
              <span style={{ fontSize: 9, color: t.textDim }}>{item.f}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>carrossel instagram</div>
        <InstagramCarousel mode={theme} slideSize={200} />
      </Section>

      {/* 05 QR CODES */}
      <Section id="qr" theme={theme}>
        <SectionLabel number="05" label="QR Codes" color={THREADS[4]} theme={theme} />
        <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
          QR codes generativos com a linguagem visual da trama. Finder patterns em cores do sistema, dados com respiração animada.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <TramaQR url="https://trama.rodrigobrazao.pt" size={150} mode={theme} seed={42} label="website" />
          <TramaQR url="https://trama.rodrigobrazao.pt/inscricao" size={150} mode={theme} seed={99} label="inscrição" />
          <TramaQR url="https://instagram.com/trama.iade" size={150} mode={theme} seed={137} label="instagram" />
          <TramaQR url="https://trama.rodrigobrazao.pt/programa" size={150} mode={theme} seed={256} label="programa" />
        </div>
      </Section>

      {/* 06 POSTERS & SEPARATORS */}
      <Section id="posters" theme={theme}>
        <SectionLabel number="06" label="Posters & Separadores" color={THREADS[5]} theme={theme} />

        <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>posters digitais</div>
        <div style={{ display: "flex", gap: 16, marginBottom: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
          <PosterVertical mode="dark" seed={seed} width={180} />
          <PosterVertical mode="light" seed={seed} width={180} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <PosterHorizontal mode="dark" seed={seed} width={340} />
            <PosterHorizontal mode="light" seed={seed} width={340} />
          </div>
        </div>

        <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>separadores online 16:9</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
          {["keynotes", "workshops", "debate", "pausa"].map((title, i) => (
            <SeparatorCard key={i} title={title} mode={theme} seed={seed + i * 50} width={220} color={THREADS[i]} />
          ))}
        </div>

        <div style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>countdown de sessão</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Countdown session={{ title: PROGRAMME[1].title, speaker: PROGRAMME[1].speaker, color: PROGRAMME[1].color, seed: seed + 200 }} mode="dark" width={340} height={200} />
          <Countdown session={{ title: PROGRAMME[1].title, speaker: PROGRAMME[1].speaker, color: PROGRAMME[1].color, seed: seed + 200 }} mode="light" width={340} height={200} />
        </div>
      </Section>

      {/* 07 INTERACTIVE EXPERIENCE */}
      <Section id="experiência" theme={theme} noBorder>
        <SectionLabel number="07" label="Experiência Interactiva" color={THREADS[0]} theme={theme} />
        <p style={{ fontSize: 12, lineHeight: 1.8, color: t.textMuted, maxWidth: 560, marginBottom: 32 }}>
          Experiência narrativa de ~1 minuto. Os fios aparecem um a um, cruzam-se, reagem ao toque e revelam a trama.
          Para dispositivos tácteis ou web. Clica para começar.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>dark · 9:16</div>
            <InteractiveExperience mode="dark" width={240} height={426} />
          </div>
          <div>
            <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>light · 9:16</div>
            <InteractiveExperience mode="light" width={240} height={426} />
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 40px", background: t.bg, borderTop: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.08em" }}>trama</div>
            <div style={{ fontSize: 8, color: t.textDim, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>jornadas de design · iade · 2025</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: t.textDim, letterSpacing: "0.1em" }}>
            <div>sistema de identidade visual</div>
            <div style={{ marginTop: 2 }}>rodrigobrazao.pt</div>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: "16px auto 0", paddingTop: 12, borderTop: `1px solid ${t.border}`, display: "flex", gap: 6 }}>
          {THREADS.map((c, i) => <div key={i} style={{ width: 32, height: 2, background: c, opacity: 0.4, borderRadius: 1 }} />)}
        </div>
      </footer>
    </div>
  );
}
