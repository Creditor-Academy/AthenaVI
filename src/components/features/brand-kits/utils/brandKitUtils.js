/** Brand Kit pure helpers */
import brandKitService from '../../../../services/brandKitService'
import { FONT_WEIGHT_OPTIONS, FONT_ROLE_DEFAULTS } from './brandKitConstants'

export function listToLines(arr) {
  return (arr || []).join('\n')
}

export function linesToList(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function resolveRoleHex(data, role, fallback = '#94A3B8') {
  const id = data?.colorRoles?.[role]
  const match = (data?.colors || []).find((c) => c.id === id)
  return match?.hex || fallback
}

export function hexToRgb(hex) {
  let c = String(hex || '#000000').replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16) || 0
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r}, ${g}, ${b}`
}

export function hexToHsl(hex) {
  let c = String(hex || '#000000').replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16) || 0
  let r = ((num >> 16) & 255) / 255
  let g = ((num >> 8) & 255) / 255
  let b = (num & 255) / 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase()
}

export function extract4ColorsFromImage(imageSrc, callback, workspaceId, brandKitId, mediaId) {
  const defaultPalette = [
    { name: 'Primary (Light Mode)', hex: '#2563EB', role: 'primary' },
    { name: 'Background (Light Mode)', hex: '#F8FAFC', role: 'bg' },
    { name: 'Primary (Dark Mode)', hex: '#60A5FA', role: 'accent' },
    { name: 'Background (Dark Mode)', hex: '#0F172A', role: 'text' },
  ]

  if (!imageSrc) {
    callback(defaultPalette)
    return
  }

  const runExtraction = (srcToUse, isTemp = false) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = srcToUse
    img.onerror = () => {
      if (isTemp && srcToUse) URL.revokeObjectURL(srcToUse)
      callback(defaultPalette)
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 80
        canvas.height = 80
        ctx.drawImage(img, 0, 0, 80, 80)
        const data = ctx.getImageData(0, 0, 80, 80).data

        const hueBuckets = new Array(36).fill(null).map(() => ({
          totalSat: 0,
          totalLit: 0,
          count: 0,
        }))

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255
          const g = data[i + 1] / 255
          const b = data[i + 2] / 255
          const a = data[i + 3]

          if (a < 128) continue
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const d = max - min
          const l = (max + min) / 2

          if (l > 0.9 || l < 0.1) continue
          if (d < 0.08) continue

          const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          let h = 0
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          else if (max === g) h = ((b - r) / d + 2) / 6
          else h = ((r - g) / d + 4) / 6

          const hDeg = Math.round(h * 360)
          const bucketIdx = Math.floor(hDeg / 10) % 36

          const weight = s * (1 - Math.abs(l - 0.5) * 1.5)
          hueBuckets[bucketIdx].totalSat += weight
          hueBuckets[bucketIdx].totalLit += l
          hueBuckets[bucketIdx].count += 1
        }

        let bestBucket = hueBuckets[0]
        let bestIdx = 0
        hueBuckets.forEach((bucket, idx) => {
          if (bucket.totalSat > bestBucket.totalSat) {
            bestBucket = bucket
            bestIdx = idx
          }
        })

        let brandH = bestIdx * 10 + 5
        let brandS =
          bestBucket.count > 0
            ? Math.round((bestBucket.totalSat / bestBucket.count) * 100 * 1.5)
            : 70
        brandS = Math.max(50, Math.min(90, brandS))

        const lightPrimaryHex = hslToHex(brandH, brandS, 44)
        const lightBgHex = hslToHex(brandH, 18, 96)
        const darkPrimaryHex = hslToHex(brandH, Math.min(brandS + 10, 95), 66)
        const darkBgHex = hslToHex(brandH, 20, 8)

        if (isTemp && srcToUse) URL.revokeObjectURL(srcToUse)

        callback([
          { name: 'Primary (Light Mode)', hex: lightPrimaryHex, role: 'primary' },
          { name: 'Background (Light Mode)', hex: lightBgHex, role: 'bg' },
          { name: 'Primary (Dark Mode)', hex: darkPrimaryHex, role: 'accent' },
          { name: 'Background (Dark Mode)', hex: darkBgHex, role: 'text' },
        ])
      } catch {
        if (isTemp && srcToUse) URL.revokeObjectURL(srcToUse)
        callback(defaultPalette)
      }
    }
  }

  if (imageSrc.startsWith('blob:') || imageSrc.startsWith('data:')) {
    runExtraction(imageSrc, false)
  } else if (workspaceId && brandKitId && mediaId) {
    brandKitService
      .fetchMediaBlob(workspaceId, brandKitId, mediaId)
      .then((blob) => {
        const tempBlobUrl = URL.createObjectURL(blob)
        runExtraction(tempBlobUrl, true)
      })
      .catch(() => runExtraction(imageSrc, false))
  } else {
    runExtraction(imageSrc, false)
  }
}

export function getFontRole(fonts, role) {
  const defaults = FONT_ROLE_DEFAULTS[role] || FONT_ROLE_DEFAULTS.body
  const raw = fonts?.[role] || {}
  const tertiary = role === 'subheading' ? fonts?.tertiary || {} : {}
  const family = raw.family || tertiary.family || defaults.family
  const weight = raw.weight ?? tertiary.weight ?? defaults.weight
  const sizePxRaw = raw.sizePx ?? tertiary.sizePx ?? defaults.sizePx
  const size =
    raw.size ||
    tertiary.size ||
    (sizePxRaw != null ? `${sizePxRaw}px` : defaults.size)
  const lineHeight = raw.lineHeight ?? tertiary.lineHeight ?? defaults.lineHeight
  return {
    family,
    weight,
    size,
    sizePx:
      sizePxRaw != null
        ? sizePxRaw
        : Number.parseFloat(String(size).replace(/px$/i, '')) || defaults.sizePx,
    lineHeight,
  }
}

export function formatFontWeightLabel(weight) {
  const match = FONT_WEIGHT_OPTIONS.find((option) => option.value === String(weight))
  return match?.label || String(weight || '')
}

export function formatFontRoleGuideline(font) {
  return `${font.family} · ${formatFontWeightLabel(font.weight)} · ${font.size} · LH ${font.lineHeight}`
}

export function parseCssSize(value, fallback) {
  const parsed = parseFloat(String(value || '').replace(/px/i, ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function ensureGoogleFontLoaded(fontFamily) {
  if (!fontFamily) return
  const cleanName = String(fontFamily).trim().replace(/['"]/g, '')
  if (!cleanName || ['sans-serif', 'serif', 'monospace', 'system-ui'].includes(cleanName.toLowerCase())) return
  const id = `google-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
  document.head.appendChild(link)
}
