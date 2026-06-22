import { buildScriptParagraphs } from './digitalTwinScript';

function safeFileName(displayName) {
  return (displayName?.trim() || 'recording').replace(/[^\w\-]+/g, '-').slice(0, 40);
}

function ensurePageSpace(doc, y, needed, margin) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - margin) return y;
  doc.addPage();
  return margin;
}

export async function downloadDigitalTwinScriptPdf(displayName = '') {
  const { jsPDF } = await import('jspdf');
  const paragraphs = buildScriptParagraphs(displayName);
  const doc = new jsPDF();
  const margin = 16;
  const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Digital Twin Recording Script', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Prepared for: ${displayName?.trim() || 'Your name'}`, margin, y);
  y += 6;
  doc.text('Read naturally · 2–5 minutes · face the camera · vary tone and expression', margin, y);
  y += 12;
  doc.setTextColor(0, 0, 0);

  paragraphs.forEach((part, index) => {
    y = ensurePageSpace(doc, y, 28, margin);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${part.label}`, margin, y);
    y += 6;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(26, 115, 232);
    const directionLines = doc.splitTextToSize(part.direction, contentWidth);
    y = ensurePageSpace(doc, y, directionLines.length * 5 + 4, margin);
    doc.text(directionLines, margin, y);
    y += directionLines.length * 5 + 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const bodyLines = doc.splitTextToSize(part.text, contentWidth);
    y = ensurePageSpace(doc, y, bodyLines.length * 5 + 8, margin);
    doc.text(bodyLines, margin, y);
    y += bodyLines.length * 5 + 10;
  });

  doc.save(`digital-twin-script-${safeFileName(displayName)}.pdf`);
}
