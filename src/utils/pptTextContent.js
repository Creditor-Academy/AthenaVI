import { resolveFillCss, resolveThemeColor } from './presentationHelpers'

export function joinedRunText(content) {
  const runs = content?.runs
  if (!Array.isArray(runs) || !runs.length) return ''
  return runs.map((run) => run?.text || '').join('')
}

/** Longest of stored text vs joined rich runs — never drop hero copy. */
export function contentPlainText(content) {
  const c = content || {}
  const fromText = String(c.text || '')
  const fromRuns = joinedRunText(c)
  return fromRuns.length > fromText.length ? fromRuns : fromText
}

export function contentUsesFullRuns(content) {
  const c = content || {}
  const fromText = String(c.text || '')
  const fromRuns = joinedRunText(c)
  return Boolean(c.runs?.length) && fromRuns.length >= fromText.length
}

export function cssColorToHex(value, fallback = '#0F172A') {
  if (typeof value !== 'string') return fallback
  const raw = value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) {
    if (raw.length === 4) {
      const [, r, g, b] = raw
      return `#${r}${r}${g}${g}${b}${b}`
    }
    return raw.slice(0, 7)
  }
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgb) {
    const hex = (n) => Number(n).toString(16).padStart(2, '0')
    return `#${hex(rgb[1])}${hex(rgb[2])}${hex(rgb[3])}`
  }
  return fallback
}

export function normalizeFillValue(value, fallbackHex = '#0F172A') {
  if (value == null || value === '') return { type: 'solid', color: fallbackHex }
  if (typeof value === 'string') {
    if (/gradient/i.test(value)) {
      const hexes = value.match(/#[0-9a-fA-F]{3,8}/g) || [fallbackHex]
      const stops = hexes.slice(0, 4).map((color, i, all) => ({
        color: cssColorToHex(color, fallbackHex),
        at: all.length <= 1 ? 0 : i / (all.length - 1),
      }))
      if (stops.length === 1) stops.push({ color: stops[0].color, at: 1 })
      return {
        type: 'gradient',
        kind: /radial/i.test(value) ? 'radial' : 'linear',
        angle: 135,
        stops,
      }
    }
    return { type: 'solid', color: cssColorToHex(value, fallbackHex) }
  }
  if (typeof value === 'object') {
    if (value.type === 'gradient' || value.kind === 'radial' || Array.isArray(value.stops)) {
      const stops = (Array.isArray(value.stops) ? value.stops : [])
        .map((stop, i, all) => ({
          color: cssColorToHex(stop?.color || stop, fallbackHex),
          at: stop?.at != null ? Number(stop.at) : all.length <= 1 ? 0 : i / (all.length - 1),
        }))
      if (stops.length < 2) {
        const start = cssColorToHex(value.from || value.start || fallbackHex, fallbackHex)
        const end = cssColorToHex(value.to || value.end || '#8B5CF6', '#8B5CF6')
        return {
          type: 'gradient',
          kind: value.kind === 'radial' ? 'radial' : 'linear',
          angle: value.angle != null ? Number(value.angle) : 135,
          stops: [
            { color: start, at: 0 },
            { color: end, at: 1 },
          ],
        }
      }
      return {
        type: 'gradient',
        kind: value.kind === 'radial' ? 'radial' : 'linear',
        angle: value.angle != null ? Number(value.angle) : 135,
        stops,
      }
    }
    if (value.color != null && value.color !== '') {
      return { type: 'solid', color: cssColorToHex(String(value.color), fallbackHex) }
    }
  }
  return { type: 'solid', color: fallbackHex }
}

export function isGradientFill(fill) {
  return Boolean(fill && typeof fill === 'object' && fill.type === 'gradient')
}

export function textPaintStyle(fill, palette, fallback = '#0F172A') {
  const css = resolveFillCss(fill, palette, fallback)
  if (typeof css === 'string' && /gradient/i.test(css)) {
    return {
      backgroundImage: css,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
    }
  }
  return {
    color: css || fallback,
    WebkitTextFillColor: css || fallback,
    backgroundImage: 'none',
    WebkitBackgroundClip: 'unset',
    backgroundClip: 'unset',
  }
}

export function runFill(run, fallbackFill) {
  if (run?.fill) return normalizeFillValue(run.fill)
  if (run?.color) return normalizeFillValue(run.color)
  if (run?.colorRole) return { type: 'solid', colorRole: run.colorRole, color: run.colorRole }
  return fallbackFill || null
}

function styleKey(run) {
  const fill = run?.fill
  const fillKey = isGradientFill(fill)
    ? JSON.stringify(fill)
    : String(run?.color || run?.colorRole || '')
  return [
    fillKey,
    run?.fontWeight ?? '',
    run?.bold ? '1' : '',
    run?.italic ? '1' : '',
    run?.fontFamily || '',
  ].join('|')
}

function cloneRunStyle(run) {
  const next = {}
  if (run?.fill) next.fill = run.fill
  if (run?.color) next.color = run.color
  if (run?.colorRole) next.colorRole = run.colorRole
  if (run?.fontWeight != null) next.fontWeight = run.fontWeight
  if (run?.bold) next.bold = run.bold
  if (run?.italic) next.italic = run.italic
  if (run?.fontFamily) next.fontFamily = run.fontFamily
  return next
}

export function mergeAdjacentRuns(runs) {
  const out = []
  for (const run of runs || []) {
    const text = run?.text || ''
    if (!text) continue
    const last = out[out.length - 1]
    if (last && styleKey(last) === styleKey(run)) last.text += text
    else out.push({ ...run, text })
  }
  return out
}

export function expandRuns(content) {
  const c = content || {}
  const text = contentPlainText(c)
  if (contentUsesFullRuns(c)) {
    return c.runs.map((run) => ({ ...run, text: run?.text || '' }))
  }
  const fill = c.fill || (c.color ? { type: 'solid', color: c.color } : null)
  return [
    {
      text,
      ...(fill && isGradientFill(fill) ? { fill } : {}),
      ...(c.color && !isGradientFill(fill) ? { color: c.color } : {}),
      ...(c.colorRole ? { colorRole: c.colorRole } : {}),
      ...(c.bold ? { bold: c.bold } : {}),
      ...(c.italic ? { italic: c.italic } : {}),
      ...(c.fontWeight ? { fontWeight: c.fontWeight } : {}),
      ...(c.fontFamily ? { fontFamily: c.fontFamily } : {}),
    },
  ]
}

function applyFillToRun(run, fill) {
  const next = { ...run }
  delete next.colorRole
  if (isGradientFill(fill)) {
    next.fill = fill
    delete next.color
  } else {
    next.color = fill?.color || fill
    delete next.fill
  }
  return next
}

function splitRunsByOffsets(runs, start, end) {
  const pieces = []
  let cursor = 0
  for (const run of runs) {
    const text = run.text || ''
    const runStart = cursor
    const runEnd = cursor + text.length
    cursor = runEnd
    if (runEnd <= start || runStart >= end) {
      pieces.push({ ...run })
      continue
    }
    const localStart = Math.max(0, start - runStart)
    const localEnd = Math.min(text.length, end - runStart)
    if (localStart > 0) pieces.push({ ...run, text: text.slice(0, localStart) })
    pieces.push({ ...run, text: text.slice(localStart, localEnd), _hit: true })
    if (localEnd < text.length) pieces.push({ ...run, text: text.slice(localEnd) })
  }
  return pieces
}

export function applyFillToWholeContent(content, fill) {
  const c = content || {}
  const runs = expandRuns(c).map((run) => applyFillToRun(run, fill))
  const next = { ...c, colorRole: null, runs: mergeAdjacentRuns(runs), text: contentPlainText(c) }
  if (isGradientFill(fill)) {
    next.fill = fill
    next.color = null
  } else {
    next.color = fill?.color || fill
    next.fill = null
  }
  return next
}

export function applyFillToTextRange(content, start, end, fill) {
  const c = content || {}
  const text = contentPlainText(c)
  const a = Math.max(0, Math.min(Number(start) || 0, Number(end) || 0, text.length))
  const b = Math.min(text.length, Math.max(Number(start) || 0, Number(end) || 0))
  if (a === b || !text) return applyFillToWholeContent(c, fill)
  const pieces = splitRunsByOffsets(expandRuns(c), a, b).map((run) => {
    if (!run._hit) return run
    const next = applyFillToRun(run, fill)
    delete next._hit
    return next
  })
  return {
    ...c,
    text,
    colorRole: null,
    runs: mergeAdjacentRuns(pieces.map(({ _hit, ...run }) => run)),
  }
}

export function applyTextColor(content, hex) {
  return applyFillToWholeContent(content, { type: 'solid', color: hex })
}

export function applyTextFill(content, fill, range) {
  if (range && range.end > range.start) {
    return applyFillToTextRange(content, range.start, range.end, fill)
  }
  return applyFillToWholeContent(content, fill)
}

/** Apply a solid/gradient fill to the live selection, or the whole text box. */
export function applyElementTextFill(element, fill) {
  const content = element?.content || {}
  const id = element?.id
  let base = content
  if (typeof document !== 'undefined' && id) {
    const editable = document.querySelector(
      `[data-element-id="${id}"] .ppt-text-editable`
    )
    if (editable) {
      const liveRuns = serializeEditableRuns(editable)
      if (liveRuns.length) {
        base = {
          ...content,
          text: editable.innerText ?? contentPlainText(content),
          runs: liveRuns,
        }
      }
    }
  }
  const range = getPptTextSelection()
  const scoped = range && range.elementId === id ? range : null
  return applyTextFill(base, fill, scoped)
}

export function remapRunsToText(runs, oldText, newText) {
  const nextText = String(newText ?? '')
  if (!nextText) return []
  if (!Array.isArray(runs) || !runs.length) return [{ text: nextText }]
  if (String(oldText ?? '') === nextText) return runs
  const styles = []
  for (const run of runs) {
    const chunk = run.text || ''
    const style = cloneRunStyle(run)
    for (let i = 0; i < chunk.length; i += 1) styles.push(style)
  }
  const fallback = styles[styles.length - 1] || {}
  const next = []
  for (let i = 0; i < nextText.length; i += 1) {
    const style = styles[i] || fallback
    const last = next[next.length - 1]
    if (last && styleKey(last) === styleKey(style)) last.text += nextText[i]
    else next.push({ ...style, text: nextText[i] })
  }
  return mergeAdjacentRuns(next)
}

export function contentWithSyncedText(content, text, runsFromDom) {
  const c = content || {}
  const nextText = text ?? ''
  if (Array.isArray(runsFromDom) && runsFromDom.length) {
    return { ...c, text: nextText, runs: mergeAdjacentRuns(runsFromDom) }
  }
  const oldText = contentPlainText(c)
  const runs = remapRunsToText(c.runs, oldText, nextText)
  const next = { ...c, text: nextText }
  if (runs.length) next.runs = runs
  else delete next.runs
  return next
}

function fillFromDataset(el, inherited) {
  if (el?.dataset?.fill) {
    try {
      return normalizeFillValue(JSON.parse(el.dataset.fill))
    } catch {
      /* ignore */
    }
  }
  return inherited
}

function runFromFill(fill) {
  if (!fill) return {}
  if (isGradientFill(fill)) return { fill }
  if (fill.colorRole && !fill.color?.startsWith?.('#')) return { colorRole: fill.colorRole }
  return { color: fill.color }
}

export function serializeEditableRuns(node) {
  if (!node) return []
  const runs = []
  const walk = (n, inherited) => {
    if (!n) return
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.nodeValue || ''
      if (text) runs.push({ text, ...runFromFill(inherited) })
      return
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return
    if (n.tagName === 'BR') {
      runs.push({ text: '\n', ...runFromFill(inherited) })
      return
    }
    if (n !== node && n.tagName === 'DIV' && runs.length) {
      const last = runs[runs.length - 1]
      if (last && !String(last.text).endsWith('\n')) {
        runs.push({ text: '\n', ...runFromFill(inherited) })
      }
    }
    const next = fillFromDataset(n, inherited)
    n.childNodes.forEach((child) => walk(child, next))
  }
  walk(node, null)
  return mergeAdjacentRuns(runs)
}

export function seedEditableNode(node, content, palette) {
  if (!node) return
  node.replaceChildren()
  const runs = expandRuns(content)
  const fallback = normalizeFillValue(content?.fill || content?.color || '#0F172A')
  for (const run of runs) {
    const span = document.createElement('span')
    const fill = runFill(run, fallback) || fallback
    const paint = textPaintStyle(fill, palette, fallback.color || '#0F172A')
    Object.assign(span.style, paint)
    try {
      span.dataset.fill = JSON.stringify(fill)
    } catch {
      /* ignore */
    }
    span.textContent = run.text || ''
    node.appendChild(span)
  }
}

export function getTextOffsetsInNode(root) {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || !root) return null
  const range = sel.getRangeAt(0)
  const ancestor = range.commonAncestorContainer
  if (ancestor !== root && !root.contains(ancestor)) return null
  const pre = document.createRange()
  pre.selectNodeContents(root)
  pre.setEnd(range.startContainer, range.startOffset)
  const start = pre.toString().length
  const end = start + range.toString().length
  return { start, end }
}

function pointAtTextOffset(root, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let cursor = 0
  let node = walker.nextNode()
  while (node) {
    const len = node.nodeValue?.length || 0
    if (cursor + len >= offset) {
      return { node, offset: Math.max(0, offset - cursor) }
    }
    cursor += len
    node = walker.nextNode()
  }
  if (!root) return null
  return { node: root, offset: root.childNodes.length }
}

export function setTextOffsetsInNode(root, start, end) {
  if (!root || typeof window === 'undefined') return
  const sel = window.getSelection()
  if (!sel) return
  const a = Math.max(0, Number(start) || 0)
  const b = Math.max(a, Number(end) || 0)
  const from = pointAtTextOffset(root, a)
  const to = pointAtTextOffset(root, b)
  if (!from || !to) return
  const range = document.createRange()
  try {
    range.setStart(from.node, from.offset)
    range.setEnd(to.node, to.offset)
  } catch {
    return
  }
  sel.removeAllRanges()
  sel.addRange(range)
}

let lastTextRange = null

export function setPptTextSelection(range) {
  lastTextRange = range
}

export function getPptTextSelection() {
  return lastTextRange
}

export function resolveTextHex(content, palette, fallback = '#0F172A') {
  const c = content || {}
  const run = Array.isArray(c.runs)
    ? c.runs.find(
        (item) => item?.color || item?.fill || (item?.colorRole && !/muted/i.test(String(item.colorRole)))
      )
    : null
  const fromFill = c.fill || run?.fill
  if (isGradientFill(fromFill)) {
    const first = fromFill.stops?.[0]?.color
    if (first) return cssColorToHex(String(first), fallback)
  }
  const resolved =
    resolveThemeColor(c.color, palette, undefined) ||
    resolveThemeColor(c.colorRole, palette, undefined) ||
    resolveThemeColor(run?.color || run?.colorRole, palette, undefined) ||
    resolveThemeColor('text', palette, undefined) ||
    resolveThemeColor('textOnImage', palette, fallback) ||
    fallback
  return cssColorToHex(resolved, fallback)
}

export function contentFillValue(content, palette) {
  const c = content || {}
  if (isGradientFill(c.fill)) return c.fill
  const run = Array.isArray(c.runs) ? c.runs.find((item) => item?.fill || item?.color) : null
  if (isGradientFill(run?.fill)) return run.fill
  return { type: 'solid', color: resolveTextHex(c, palette) }
}
