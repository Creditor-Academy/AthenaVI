/**
 * Client-side logo variant finishing:
 * - Strip solid/plate backgrounds so marks are true transparent PNGs
 * - Compose wordmark lockups with balanced mark/text size and tight spacing
 */

import { ensureGoogleFontLoaded, getFontRole } from './brandKitUtils'
import { resolveFontRoleTextColors } from '../../../../utils/brandKitHelpers'

function loadHtmlImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load logo image'))
    img.src = src
  })
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function samplePixel(data, width, x, y) {
  const i = (y * width + x) * 4
  return [data[i], data[i + 1], data[i + 2], data[i + 3]]
}

/**
 * Remove near-solid plate backgrounds (white / dark squares from AI variants).
 * Detects the plate from the opaque content box (not the canvas corners), because
 * AI often places a solid square on an already-transparent canvas.
 */
export function stripSolidBackgroundFromCanvas(sourceCanvas, { threshold = 48 } = {}) {
  const width = sourceCanvas.width
  const height = sourceCanvas.height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = data[(y * width + x) * 4 + 3]
      if (a > 12) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < minX) return canvas

  const inset = Math.max(1, Math.round(Math.min(maxX - minX, maxY - minY) * 0.02))
  const samplePoints = [
    [minX + inset, minY + inset],
    [maxX - inset, minY + inset],
    [minX + inset, maxY - inset],
    [maxX - inset, maxY - inset],
    [Math.floor((minX + maxX) / 2), minY + inset],
    [Math.floor((minX + maxX) / 2), maxY - inset],
  ]

  const samples = samplePoints
    .map(([x, y]) => samplePixel(data, width, x, y))
    .filter((c) => c[3] > 200)

  if (samples.length < 3) return canvas

  const [br, bgG, bb] = samples[0]
  const plateIsUniform = samples.every(
    ([r, g, b]) => colorDistance(r, g, b, br, bgG, bb) <= 30
  )
  if (!plateIsUniform) return canvas

  // Only strip light plates (light-mode) or dark plates (dark-mode)
  const luma = (0.299 * br + 0.587 * bgG + 0.114 * bb) / 255
  const looksLikePlate = luma > 0.82 || luma < 0.22
  if (!looksLikePlate) return canvas

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a === 0) continue
    const dist = colorDistance(r, g, b, br, bgG, bb)
    if (dist <= threshold) {
      data[i + 3] = 0
    } else if (dist <= threshold + 20) {
      data[i + 3] = Math.round(a * ((dist - threshold) / 20))
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/** Crop to non-transparent content with a small padding. */
export function trimTransparentCanvas(sourceCanvas, padding = 8) {
  const ctx = sourceCanvas.getContext('2d')
  const { width, height } = sourceCanvas
  const { data } = ctx.getImageData(0, 0, width, height)

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = data[(y * width + x) * 4 + 3]
      if (a > 8) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) return sourceCanvas

  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(width - 1, maxX + padding)
  maxY = Math.min(height - 1, maxY + padding)

  const tw = maxX - minX + 1
  const th = maxY - minY + 1
  const out = document.createElement('canvas')
  out.width = tw
  out.height = th
  out.getContext('2d').drawImage(sourceCanvas, minX, minY, tw, th, 0, 0, tw, th)
  return out
}

function imageToCanvas(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  canvas.getContext('2d').drawImage(img, 0, 0)
  return canvas
}

export async function canvasToPngFile(canvas, filename = 'logo.png') {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))), 'image/png')
  })
  return new File([blob], filename, { type: 'image/png' })
}

/** Convert opaque pixels to pure black or white while keeping alpha. */
export function recolorOpaquePixels(sourceCanvas, hex = '#000000') {
  const canvas = document.createElement('canvas')
  canvas.width = sourceCanvas.width
  canvas.height = sourceCanvas.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const raw = String(hex).replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  const num = Number.parseInt(full, 16) || 0
  const tr = (num >> 16) & 255
  const tg = (num >> 8) & 255
  const tb = num & 255
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue
    data[i] = tr
    data[i + 1] = tg
    data[i + 2] = tb
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export async function loadLogoCanvasFromBlob(blob) {
  const objectUrl = URL.createObjectURL(blob)
  try {
    const img = await loadHtmlImage(objectUrl)
    return imageToCanvas(img)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function loadLogoCanvasFromUrl(url) {
  const img = await loadHtmlImage(url)
  return imageToCanvas(img)
}

/**
 * Finish an AI (or uploaded) mark: strip plate background + trim.
 */
export function finishTransparentMark(sourceCanvas) {
  const stripped = stripSolidBackgroundFromCanvas(sourceCanvas)
  return trimTransparentCanvas(stripped, 6)
}

async function waitForFont(family, weight = 700) {
  ensureGoogleFontLoaded(family)
  const face = `${weight} 64px "${family}"`
  try {
    if (document.fonts?.load) await document.fonts.load(face)
    if (document.fonts?.ready) await document.fonts.ready
  } catch {
    // Fall back to system metrics if webfont fails
  }
}

function fitTextWidth(ctx, text, maxWidth, startSize, minSize = 18) {
  let size = startSize
  ctx.font = ctx.font.replace(/\d+px/, `${size}px`)
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1
    ctx.font = ctx.font.replace(/\d+px/, `${size}px`)
  }
  return size
}

/**
 * Stacked lockup: mark above brand name.
 * Text height ~22% of mark, gap ~6% of mark (tight, balanced).
 */
export async function composeWordmarkBelow({
  markCanvas,
  name,
  fontFamily = 'Outfit',
  fontWeight = 700,
  textColor = '#0F172A',
}) {
  const mark = finishTransparentMark(markCanvas)
  const label = String(name || 'Brand').trim() || 'Brand'
  await waitForFont(fontFamily, fontWeight)

  const targetMarkH = 360
  const scale = targetMarkH / Math.max(mark.height, 1)
  const markW = Math.max(1, Math.round(mark.width * scale))
  const markH = Math.max(1, Math.round(mark.height * scale))
  const gap = Math.round(markH * 0.06)
  const startFont = Math.round(markH * 0.22)
  const sidePad = Math.round(Math.max(markW, startFont * label.length * 0.55) * 0.04)

  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `${fontWeight} ${startFont}px "${fontFamily}", system-ui, sans-serif`
  const fontSize = fitTextWidth(
    measure,
    label,
    Math.max(markW * 1.15, startFont * 8),
    startFont,
    Math.round(markH * 0.14)
  )
  measure.font = `${fontWeight} ${fontSize}px "${fontFamily}", system-ui, sans-serif`
  const textW = Math.ceil(measure.measureText(label).width)
  const textH = Math.ceil(fontSize * 1.15)

  const width = Math.ceil(Math.max(markW, textW) + sidePad * 2)
  const height = markH + gap + textH + sidePad * 2
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const markX = Math.round((width - markW) / 2)
  const markY = sidePad
  ctx.drawImage(mark, markX, markY, markW, markH)

  ctx.fillStyle = textColor
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(label, width / 2, markY + markH + gap)

  return canvas
}

/**
 * Horizontal lockup: mark left, name right.
 * Text size ~42% of mark height; gap ~8% of mark height; vertically centered.
 */
export async function composeWordmarkAdjacent({
  markCanvas,
  name,
  fontFamily = 'Outfit',
  fontWeight = 700,
  textColor = '#0F172A',
}) {
  const mark = finishTransparentMark(markCanvas)
  const label = String(name || 'Brand').trim() || 'Brand'
  await waitForFont(fontFamily, fontWeight)

  const targetMarkH = 280
  const scale = targetMarkH / Math.max(mark.height, 1)
  const markW = Math.max(1, Math.round(mark.width * scale))
  const markH = Math.max(1, Math.round(mark.height * scale))
  const gap = Math.round(markH * 0.08)
  const fontSize = Math.round(markH * 0.42)
  const pad = Math.round(markH * 0.08)

  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `${fontWeight} ${fontSize}px "${fontFamily}", system-ui, sans-serif`
  const textW = Math.ceil(measure.measureText(label).width)
  const textH = Math.ceil(fontSize * 1.1)

  const width = pad + markW + gap + textW + pad
  const height = Math.max(markH, textH) + pad * 2
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const markY = Math.round((height - markH) / 2)
  ctx.drawImage(mark, pad, markY, markW, markH)

  ctx.fillStyle = textColor
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, pad + markW + gap, height / 2)

  return canvas
}

export function resolveWordmarkTypeSpec(kitData) {
  const heading = getFontRole(kitData?.fonts, 'heading')
  return {
    fontFamily: heading.family || 'Outfit',
    fontWeight: Number(heading.weight) || 700,
  }
}

export function resolveWordmarkTextColorsFromKit(kitData) {
  return resolveFontRoleTextColors(kitData, 'heading')
}

export function isDarkWordmarkRole(role) {
  const r = String(role || '').trim().toLowerCase()
  return r === 'with-name-below-dark' || r === 'with-name-adjacent-dark'
}

export async function composeWordmarkForRole({
  role,
  markCanvas,
  name,
  fontFamily,
  fontWeight,
  textColors,
}) {
  const dark = isDarkWordmarkRole(role)
  const adjacent = String(role).includes('adjacent')
  const textColor = dark ? textColors.dark : textColors.light
  if (adjacent) {
    return composeWordmarkAdjacent({ markCanvas, name, fontFamily, fontWeight, textColor })
  }
  return composeWordmarkBelow({ markCanvas, name, fontFamily, fontWeight, textColor })
}
