import { useState } from "react";
import { THREADS, THEME } from "../data/tokens";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PDFExport({ mode }) {
  const t = THEME[mode];
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState("");

  const handleExportPDF = async () => {
    if (exporting) return;
    setExporting(true);
    setProgress("a preparar…");

    try {
      // Collect all <section> elements on the page
      const sections = Array.from(document.querySelectorAll("section"));
      if (sections.length === 0) {
        setProgress("nenhuma secção encontrada");
        setTimeout(() => { setExporting(false); setProgress(""); }, 2000);
        return;
      }

      // A4 dimensions in mm and points
      const A4_W_MM = 297; // landscape width
      const A4_H_MM = 210; // landscape height
      const A4_W_PT = A4_W_MM * 2.835;
      const A4_H_PT = A4_H_MM * 2.835;

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const captureScale = 2;

      for (let i = 0; i < sections.length; i++) {
        setProgress(`a capturar secção ${i + 1} de ${sections.length}…`);

        const section = sections[i];

        // Temporarily hide export buttons and controls during capture
        const hideEls = section.querySelectorAll("button, [data-no-print]");
        hideEls.forEach(el => { el.dataset.wasDisplay = el.style.display; el.style.display = "none"; });

        const canvas = await html2canvas(section, {
          scale: captureScale,
          useCORS: true,
          backgroundColor: "#070709",
          logging: false,
          allowTaint: true,
          // Ensure canvas elements are captured
          onclone: (clonedDoc) => {
            // Copy canvas pixel data to cloned canvases
            const origCanvases = section.querySelectorAll("canvas");
            const clonedCanvases = clonedDoc.querySelectorAll("section")[i]?.querySelectorAll("canvas") || [];
            origCanvases.forEach((orig, ci) => {
              const cloned = clonedCanvases[ci];
              if (cloned && orig.width > 0 && orig.height > 0) {
                cloned.width = orig.width;
                cloned.height = orig.height;
                const clonedCtx = cloned.getContext("2d");
                if (clonedCtx) {
                  try { clonedCtx.drawImage(orig, 0, 0); } catch (e) { /* skip tainted */ }
                }
              }
            });
          },
        });

        // Restore hidden elements
        hideEls.forEach(el => { el.style.display = el.dataset.wasDisplay || ""; delete el.dataset.wasDisplay; });

        // Convert to JPEG for smaller file size
        const imgData = canvas.toDataURL("image/jpeg", 0.92);

        // Calculate dimensions to fit A4 landscape with padding
        const padding = 5; // mm
        const availW = A4_W_MM - padding * 2;
        const availH = A4_H_MM - padding * 2;
        const imgRatio = canvas.width / canvas.height;
        const availRatio = availW / availH;

        let imgW, imgH, imgX, imgY;
        if (imgRatio > availRatio) {
          // Image wider than available area — fit to width
          imgW = availW;
          imgH = availW / imgRatio;
        } else {
          // Image taller — fit to height
          imgH = availH;
          imgW = availH * imgRatio;
        }
        imgX = (A4_W_MM - imgW) / 2;
        imgY = (A4_H_MM - imgH) / 2;

        if (i > 0) pdf.addPage();

        // Dark background fill
        pdf.setFillColor(7, 7, 9);
        pdf.rect(0, 0, A4_W_MM, A4_H_MM, "F");

        // Add captured image
        pdf.addImage(imgData, "JPEG", imgX, imgY, imgW, imgH);
      }

      setProgress("a gerar ficheiro…");
      pdf.save("trama-design-system.pdf");
      setProgress("exportado ✓");
      setTimeout(() => { setExporting(false); setProgress(""); }, 2000);
    } catch (err) {
      console.error("PDF export error:", err);
      setProgress("erro na exportação");
      setTimeout(() => { setExporting(false); setProgress(""); }, 3000);
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={handleExportPDF}
        disabled={exporting}
        style={{
          background: "none",
          border: `1px solid ${exporting ? THREADS[2] : t.border}`,
          color: exporting ? THREADS[2] : t.textMuted,
          padding: "5px 12px",
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.1em",
          cursor: exporting ? "wait" : "pointer",
          textTransform: "uppercase",
          transition: "border-color 0.2s, color 0.2s",
          opacity: exporting ? 0.7 : 1,
        }}
        onMouseEnter={e => { if (!exporting) { e.target.style.borderColor = THREADS[2]; e.target.style.color = THREADS[2]; } }}
        onMouseLeave={e => { if (!exporting) { e.target.style.borderColor = t.border; e.target.style.color = t.textMuted; } }}
      >
        {exporting ? "⏳ a exportar…" : "↓ exportar pdf"}
      </button>
      {progress && (
        <span style={{
          fontSize: 8,
          color: progress.includes("✓") ? THREADS[2] : t.textMuted,
          letterSpacing: "0.08em",
        }}>
          {progress}
        </span>
      )}
    </div>
  );
}
