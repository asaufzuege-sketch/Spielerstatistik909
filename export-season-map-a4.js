// export-season-map-a4.js
// Benötigt: html2canvas + jsPDF (UMD). Bindung: document.getElementById('exportSeasonMapBtn').addEventListener('click', exportSeasonMapAsA4PDF);

async function exportSeasonMapAsA4PDF() {
  const containerRoot = document.getElementById('seasonMapPage');
  if (!containerRoot) {
    alert('Season Map Bereich nicht gefunden.');
    return;
  }

  // Sammle die Boxen, die exportiert werden sollen (anpassen falls du andere Elemente willst)
  const boxes = Array.from(containerRoot.querySelectorAll('.goal-img-box, .field-box'));
  if (boxes.length === 0) {
    alert('Keine Boxen zum Exportieren gefunden.');
    return;
  }

  // Temporär UI ausblenden (Buttons, Inputs), damit sie nicht im Export landen
  const hidden = [];
  containerRoot.querySelectorAll('button, input, select, .no-export').forEach(el => {
    if (el.offsetParent !== null) {
      hidden.push({ el, display: el.style.display });
      el.style.display = 'none';
    }
  });

  try {
    // ensure jsPDF is available (umd)
    const { jsPDF } = window.jspdf || window.jspdf || window.jsPDF || {};
    if (!jsPDF) {
      alert('jsPDF nicht gefunden. Bitte binde jsPDF ein.');
      return;
    }

    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 8; // mm

    // Helper: convert px -> mm (assume 96 DPI baseline). html2canvas will create a canvas sized in px.
    const pxToMm = px => (px * 25.4) / 96;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];

      // render box -> canvas
      const canvas = await html2canvas(box, {
        scale: 2,         // increase for better quality (beware memory)
        useCORS: true,    // only helps if images allow CORS
        backgroundColor: '#ffffff' // ensure white background for PDF
      });

      // convert to image
      const imgData = canvas.toDataURL('image/jpeg', 0.92); // or 'image/png' (bigger)

      // calculate image size in mm and scale to fit A4 with margins
      const imgWmm = pxToMm(canvas.width);
      const imgHmm = pxToMm(canvas.height);

      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      const scale = Math.min(maxW / imgWmm, maxH / imgHmm, 1);

      const drawW = imgWmm * scale;
      const drawH = imgHmm * scale;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      // Add to PDF (new page for each image except first)
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH, undefined, 'FAST');
    }

    // save
    pdf.save('season-map-a4.pdf');
  } catch (err) {
    console.error('Export als PDF fehlgeschlagen:', err);
    alert('Fehler beim Erstellen des PDF (siehe Konsole).');
  } finally {
    // restore hidden UI
    hidden.forEach(h => { h.el.style.display = h.display; });
  }
}

// Beispiel-Bindung (sofern Button vorhanden)
const exportBtn = document.getElementById('exportSeasonMapBtn');
if (exportBtn) exportBtn.addEventListener('click', exportSeasonMapAsA4PDF);
