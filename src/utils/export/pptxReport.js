/**
 * What a PowerPoint export contains, in plain words for the export dialog. `report` is the
 * backend's summary (pptxReportSummary): editable objects, what became a picture and why, the
 * fonts inside the file, native groups and text boxes grown to show all their text.
 * No DOM, so it runs in node tests.
 */

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

function listCounts(items = []) {
  return items.map((p) => `${p.label} (${p.count})`).join(', ')
}

/**
 * @param {object|null} report
 * @param {'powerpoint'|'google-slides'} target
 * @returns {Array<{ tone: 'ok'|'info'|'warn', text: string }>}
 */
export function pptxReportLines(report, target = 'powerpoint') {
  if (!report || typeof report !== 'object') return []
  const app = target === 'google-slides' ? 'Google Slides' : 'PowerPoint'
  const lines = []
  const editable = Number(report.editable) || 0
  if (editable) lines.push({ tone: 'ok', text: `${plural(editable, 'item stays', 'items stay')} editable in ${app}` })
  const pictures = Array.isArray(report.pictures) ? report.pictures.filter((p) => p?.count > 0) : []
  if (pictures.length) {
    lines.push({ tone: 'info', text: `Kept as pictures, which ${app} can't edit: ${listCounts(pictures)}` })
  }
  const groups = Number(report.groups) || 0
  if (groups) lines.push({ tone: 'ok', text: `${plural(groups, 'group')} kept together` })
  const grown = Number(report.grownText) || 0
  if (grown) {
    lines.push({
      tone: 'info',
      text: grown === 1 ? '1 text box was made taller so all its text shows' : `${grown} text boxes were made taller so all their text shows`,
    })
  }
  if (target !== 'google-slides') {
    const fonts = Array.isArray(report.fonts) ? report.fonts : []
    if (fonts.length) lines.push({ tone: 'ok', text: `Fonts included: ${fonts.join(', ')}` })
    const missingFonts = Array.isArray(report.fontsMissing) ? report.fontsMissing : []
    if (missingFonts.length) {
      lines.push({ tone: 'warn', text: `Not included: ${missingFonts.join(', ')}. PowerPoint will use a similar font.` })
    }
  }
  const missing = Number(report.missing) || 0
  if (missing) {
    lines.push({ tone: 'warn', text: `${plural(missing, "picture couldn't", "pictures couldn't")} be loaded and ${missing === 1 ? 'was' : 'were'} left out` })
  }
  return lines
}
