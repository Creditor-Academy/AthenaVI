/**
 * Client-side fallback brand guideline PDF (style-sheet layout).
 * Primary path is backend GET .../guidelines/pdf (Puppeteer template).
 */

function normalizeHex(hex, fallback = '#64748B') {
  const raw = String(hex || '').trim()
  if (!raw) return fallback
  let clean = raw.startsWith('#') ? raw.slice(1) : raw
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback
  return `#${clean.toUpperCase()}`
}

function hexToRgb(hex) {
  const h = normalizeHex(hex).slice(1)
  const n = Number.parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function resolveRoleHex(data, role, fallback) {
  const id = data?.colorRoles?.[role]
  const color = (data?.colors || []).find((c) => c.id === id)
  return normalizeHex(color?.hex || fallback, fallback)
}

function roleLabel(data, colorId) {
  const roles = data?.colorRoles || {}
  const preferred = ['primary', 'accent', 'bg', 'text', 'secondary', 'muted']
  const hits = Object.entries(roles)
    .filter(([, id]) => id === colorId)
    .map(([role]) => role)
  hits.sort((a, b) => {
    const ai = preferred.indexOf(a)
    const bi = preferred.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  return hits[0] || ''
}

async function loadImageAsDataUrl(url) {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function formatLogoRole(role) {
  const map = {
    primary: 'Primary',
    secondary: 'Secondary',
    icon: 'Icon',
    main: 'Main',
    light: 'Light',
    'light-mode': 'Light mode',
    dark: 'Dark',
    'dark-mode': 'Dark mode',
    black: 'Black',
    white: 'White',
    'with-name-adjacent': 'With name (adjacent)',
    'with-name-below': 'With name (below)',
  }
  return map[role] || String(role || 'Logo').replace(/-/g, ' ')
}

const FONT_ROLE_ORDER = ['heading', 'subheading', 'body', 'tertiary']
const FONT_ROLE_LABELS = {
  heading: 'Heading',
  subheading: 'Subheading',
  body: 'Body',
  tertiary: 'Tertiary',
}
const FONT_ROLE_SAMPLES = {
  heading: 'The quick brown fox jumps over the lazy dog',
  subheading: 'Clear hierarchy for titles, decks, and section leads',
  body: 'Body copy stays readable across presentations, guidelines, and product UI.',
  tertiary: 'Supporting labels, captions, and compact UI text',
}

function collectFontRoles(fonts = {}) {
  const roles = []
  const seen = new Set()
  for (const key of FONT_ROLE_ORDER) {
    const face = fonts[key]
    if (!face || typeof face !== 'object') continue
    const family = String(face.family || '').trim()
    if (!family) continue
    seen.add(key)
    roles.push({
      key,
      label: FONT_ROLE_LABELS[key] || key,
      family,
      weight: Number(face.weight) || (key === 'heading' ? 700 : key === 'subheading' ? 600 : 400),
      sizePx: Number(face.sizePx) || (key === 'heading' ? 40 : key === 'subheading' ? 20 : 14),
      lineHeight: Number(face.lineHeight) || (key === 'heading' ? 1.2 : key === 'subheading' ? 1.4 : 1.6),
      sample: FONT_ROLE_SAMPLES[key] || FONT_ROLE_SAMPLES.body,
    })
  }
  for (const [key, face] of Object.entries(fonts)) {
    if (seen.has(key) || !face || typeof face !== 'object') continue
    const family = String(face.family || '').trim()
    if (!family) continue
    roles.push({
      key,
      label: String(key)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      family,
      weight: Number(face.weight) || 400,
      sizePx: Number(face.sizePx) || 14,
      lineHeight: Number(face.lineHeight) || 1.4,
      sample: FONT_ROLE_SAMPLES.body,
    })
  }
  return roles
}

export async function downloadBrandGuidelinePdf({
  kitName,
  kitData,
  kitMedia = [],
  setGeneratingGuideline,
  setError,
}) {
  try {
    setGeneratingGuideline?.(true)
    const { jsPDF } = await import('jspdf')

    const name = kitName || 'Brand Kit'
    const data = kitData || {}
    const primary = resolveRoleHex(data, 'primary', '#2563EB')
    const pageBg = resolveRoleHex(data, 'bg', '#F7F8FC')
    const text = resolveRoleHex(data, 'text', '#0F172A')
    const muted = resolveRoleHex(data, 'muted', '#64748B')
    const fontRoles = collectFontRoles(data.fonts || {})
    const headingFamily = fontRoles.find((r) => r.key === 'heading')?.family || fontRoles[0]?.family || 'Inter'
    const tagline = data.meta?.tagline || ''

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    // Content inset only — page background is full-bleed
    const MARGIN_X = 40
    const MARGIN_TOP = 0
    const MARGIN_BOTTOM = 44
    const CONTENT_PAD_TOP = 36
    const contentW = pageW - MARGIN_X * 2

    const fill = (hex) => {
      const [r, g, b] = hexToRgb(hex)
      doc.setFillColor(r, g, b)
    }
    const ink = (hex) => {
      const [r, g, b] = hexToRgb(hex)
      doc.setTextColor(r, g, b)
    }

    const paintPageBg = () => {
      fill(pageBg)
      doc.rect(0, 0, pageW, pageH, 'F')
    }

    let y = MARGIN_TOP

    const ensureSpace = (needed) => {
      if (y + needed <= pageH - MARGIN_BOTTOM) return
      doc.addPage()
      paintPageBg()
      y = CONTENT_PAD_TOP
    }

    paintPageBg()

    // Hero — rounded accent card with logo + brand name
    const heroH = 168
    ensureSpace(heroH + 24)
    y = CONTENT_PAD_TOP
    fill(primary)
    doc.roundedRect(MARGIN_X, y, contentW, heroH, 18, 18, 'F')

    const primaryLogo =
      (kitMedia || []).find((m) => {
        const kind = String(m.kind || m.type || '').toLowerCase()
        const role = String(m.role || '').toLowerCase()
        return kind === 'logo' && (role === 'primary' || role === 'main')
      }) ||
      (kitMedia || []).find((m) => String(m.kind || m.type || '').toLowerCase() === 'logo')

    let textLeft = MARGIN_X + 24
    if (primaryLogo) {
      const url = primaryLogo.url || primaryLogo.src || primaryLogo.presignedUrl
      const dataUrl = await loadImageAsDataUrl(url)
      if (dataUrl) {
        try {
          const fmt =
            dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG'
          doc.addImage(dataUrl, fmt, MARGIN_X + 24, y + 22, 44, 44, undefined, 'FAST')
          textLeft = MARGIN_X + 24 + 44 + 14
        } catch {
          // ignore
        }
      }
    }

    ink('#FFFFFF')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(String(name).toUpperCase(), textLeft, y + 42, {
      maxWidth: pageW - textLeft - MARGIN_X - 20,
    })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`accent · ${primary}`, MARGIN_X + 24, y + 88)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(32)
    doc.text(headingFamily, MARGIN_X + 24, y + 128, { maxWidth: contentW - 48 })
    if (tagline) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(tagline, MARGIN_X + 24, y + 152, { maxWidth: contentW - 48 })
    }
    y += heroH + 28

    // Palette
    const colors = data.colors || []
    const sw = 64
    const gap = 12
    const paletteRows = Math.ceil(Math.max(colors.length, 1) / 6)
    ensureSpace(28 + paletteRows * (sw + 36))
    ink(muted)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('PALETTE', MARGIN_X, y)
    y += 16

    colors.forEach((c, idx) => {
      const col = idx % 6
      const row = Math.floor(idx / 6)
      if (col === 0 && row > 0) y += sw + 36
      const x = MARGIN_X + col * (sw + gap)
      fill(normalizeHex(c.hex))
      doc.roundedRect(x, y, sw, sw, 10, 10, 'F')
      ink(text)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      const role = roleLabel(data, c.id)
      if (role) doc.text(role, x, y + sw + 12)
      ink(muted)
      doc.setFont('helvetica', 'normal')
      doc.text(normalizeHex(c.hex), x, y + sw + (role ? 24 : 12))
    })
    y += sw + 44

    // Typography — all roles
    ensureSpace(28)
    ink(muted)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('TYPOGRAPHY', MARGIN_X, y)
    y += 14

    if (!fontRoles.length) {
      ensureSpace(20)
      ink(muted)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('No typography roles defined.', MARGIN_X, y + 12)
      y += 28
    } else {
      for (const role of fontRoles) {
        const cardH = 96
        ensureSpace(cardH + 12)
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(MARGIN_X, y, contentW, cardH, 8, 8, 'FD')

        ink(primary)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text(String(role.label).toUpperCase(), MARGIN_X + 14, y + 18)

        ink(muted)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(
          `${role.family} · ${role.weight} · ${role.sizePx}px · LH ${role.lineHeight}`,
          MARGIN_X + 90,
          y + 18
        )

        ink(text)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(28)
        doc.text('Aa', MARGIN_X + 14, y + 52)

        doc.setFont('helvetica', Number(role.weight) >= 600 ? 'bold' : 'normal')
        doc.setFontSize(Math.min(16, Math.max(10, role.sizePx * 0.45)))
        doc.text(role.sample, MARGIN_X + 70, y + 48, { maxWidth: contentW - 90 })

        ink(muted)
        doc.setFontSize(10)
        doc.text('AaBbCcDdEeFf · 0123456789', MARGIN_X + 70, y + 72)

        y += cardH + 10
      }
    }

    // Tokens
    ensureSpace(70)
    ink(muted)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('SHAPE & TOKENS', MARGIN_X, y)
    y += 16

    fill(primary)
    doc.roundedRect(MARGIN_X, y, 78, 28, 14, 14, 'F')
    ink('#FFFFFF')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Button', MARGIN_X + 22, y + 18)

    const pills = [
      `SCALE ×1.333`,
      `GRID 8px`,
      `RADIUS 12px`,
      `CLEAR ${data.usage?.logoClearSpace || '1.5×'}`,
      `LOGO MIN ${data.usage?.logoMinSizePx || 24}px`,
    ]
    let px = MARGIN_X + 92
    let rowY = y
    pills.forEach((label) => {
      const tw = doc.getTextWidth(label) + 18
      if (px + tw > pageW - MARGIN_X) {
        px = MARGIN_X
        rowY += 36
        ensureSpace(36)
      }
      doc.setDrawColor(...hexToRgb(muted))
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(px, rowY, tw, 28, 14, 14, 'FD')
      ink(text)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(label, px + 9, rowY + 18)
      px += tw + 8
    })
    y = rowY + 44

    // Logos
    ensureSpace(28)
    ink(muted)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('LOGO VARIANTS', MARGIN_X, y)
    y += 14

    const logos = (kitMedia || []).filter(
      (m) => String(m.kind || m.type || '').toLowerCase() === 'logo'
    )
    if (!logos.length) {
      ensureSpace(24)
      ink(muted)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('No logo variants uploaded yet.', MARGIN_X, y + 12)
      y += 28
    } else {
      const cardW = (contentW - 24) / 3
      const cardH = 110
      for (let i = 0; i < logos.length; i += 1) {
        const logo = logos[i]
        const col = i % 3
        if (col === 0) ensureSpace(cardH + 16)
        const x = MARGIN_X + col * (cardW + 12)
        const darkBg = ['light', 'light-mode', 'white'].includes(String(logo.role || '').toLowerCase())

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(x, y, cardW, cardH, 8, 8, 'FD')

        if (darkBg) doc.setFillColor(15, 23, 42)
        else doc.setFillColor(248, 250, 252)
        doc.roundedRect(x + 1, y + 1, cardW - 2, 72, 8, 8, 'F')

        const url = logo.url || logo.src || logo.presignedUrl
        const dataUrl = await loadImageAsDataUrl(url)
        if (dataUrl) {
          try {
            const fmt =
              dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG'
            doc.addImage(dataUrl, fmt, x + 16, y + 12, cardW - 32, 50, undefined, 'FAST')
          } catch {
            // ignore
          }
        }

        ink(text)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(formatLogoRole(logo.role), x + 10, y + cardH - 14)

        if (col === 2 || i === logos.length - 1) y += cardH + 12
      }
    }

    ensureSpace(20)
    ink(muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(
      `Generated by Athena Brand Kits · ${new Date().toLocaleDateString()}`,
      MARGIN_X,
      Math.min(y + 8, pageH - MARGIN_BOTTOM + 16)
    )

    doc.save(`${String(name).replace(/\s+/g, '_')}_Brand_Guidelines.pdf`)
  } catch (err) {
    console.error('Error generating PDF guideline:', err)
    setError?.('Failed to generate PDF. Please try again.')
    throw err
  } finally {
    setGeneratingGuideline?.(false)
  }
}
