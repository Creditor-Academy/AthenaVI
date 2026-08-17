/**
 * Client-side fallback brand guideline PDF (style-sheet layout).
 * Primary path is backend GET .../guidelines/pdf (Puppeteer template).
 */

import { resolveButtonStyle } from '../../../../utils/brandKitHelpers'

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
    'with-name-adjacent-dark': 'With name (adjacent, dark)',
    'with-name-below-dark': 'With name (below, dark)',
  }
  return map[role] || String(role || 'Logo').replace(/-/g, ' ')
}

const LOGO_ROLE_ALIASES = {
  primary: ['primary', 'main'],
  'with-name-below': ['with-name-below'],
  'with-name-adjacent': ['with-name-adjacent'],
  'with-name-below-dark': ['with-name-below-dark'],
  'with-name-adjacent-dark': ['with-name-adjacent-dark'],
  dark: ['dark', 'dark-mode'],
  light: ['light', 'light-mode'],
  white: ['white'],
  black: ['black'],
}

function findLogoMedia(media = [], roles = []) {
  const wanted = new Set(roles.map((r) => String(r).toLowerCase()))
  return (
    media.find((m) => {
      const kind = String(m.kind || m.type || '').toLowerCase()
      const role = String(m.role || '').toLowerCase()
      return kind === 'logo' && wanted.has(role)
    }) || null
  )
}

function logoNeedsDarkBg(role) {
  const r = String(role || '').toLowerCase()
  return r === 'light' || r === 'light-mode' || r === 'white'
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
    // Always white / near-white — never brand bg role
    const pageBg = '#FFFFFF'
    const text = resolveRoleHex(data, 'text', '#0F172A')
    const muted = resolveRoleHex(data, 'muted', '#64748B')
    const fontRoles = collectFontRoles(data.fonts || {})
    const headingFamily = fontRoles.find((r) => r.key === 'heading')?.family || fontRoles[0]?.family || 'Inter'
    const tagline = data.meta?.tagline || ''

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const MARGIN_X = 40
    const MARGIN_TOP = 0
    const MARGIN_BOTTOM = 44
    const CONTENT_PAD_TOP = 36
    const contentW = pageW - MARGIN_X * 2
    const GAP = 10

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

    const drawSectionLabel = (label) => {
      ensureSpace(28)
      ink(muted)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(label, MARGIN_X, y)
      y += 14
    }

    const mediaUrl = (m) => m?.url || m?.src || m?.presignedUrl

    const drawLogoCell = async (x, cellY, frameW, frameH, logo, labelRole) => {
      const role = logo?.role || labelRole
      const darkBg = logoNeedsDarkBg(role) || logoNeedsDarkBg(labelRole)
      const labelH = 18

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(x, cellY, frameW, frameH + labelH, 10, 10, 'FD')

      if (darkBg) doc.setFillColor(15, 23, 42)
      else doc.setFillColor(250, 250, 250)
      doc.roundedRect(x + 1, cellY + 1, frameW - 2, frameH - 2, 9, 9, 'F')

      const url = mediaUrl(logo)
      const dataUrl = url ? await loadImageAsDataUrl(url) : null
      if (dataUrl) {
        try {
          const fmt =
            dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG'
          const padX = frameW * 0.14
          const padY = frameH * 0.14
          doc.addImage(
            dataUrl,
            fmt,
            x + padX,
            cellY + padY,
            frameW - padX * 2,
            frameH - padY * 2,
            undefined,
            'FAST'
          )
        } catch {
          // ignore
        }
      } else {
        ink(muted)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text('No image', x + frameW / 2, cellY + frameH / 2, { align: 'center' })
      }

      ink(text)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(formatLogoRole(labelRole || role), x + frameW / 2, cellY + frameH + 12, {
        align: 'center',
        maxWidth: frameW - 8,
      })

      return frameH + labelH
    }

    paintPageBg()

    // Hero
    const heroH = 168
    ensureSpace(heroH + 24)
    y = CONTENT_PAD_TOP
    fill(primary)
    doc.roundedRect(MARGIN_X, y, contentW, heroH, 18, 18, 'F')

    const primaryLogo = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES.primary) ||
      (kitMedia || []).find((m) => String(m.kind || m.type || '').toLowerCase() === 'logo')

    let textLeft = MARGIN_X + 24
    if (primaryLogo) {
      const dataUrl = await loadImageAsDataUrl(mediaUrl(primaryLogo))
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
    drawSectionLabel('PALETTE')

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

    // Typography — heading (tall) | two equal stacked roles
    drawSectionLabel('TYPOGRAPHY')
    if (!fontRoles.length) {
      ensureSpace(20)
      ink(muted)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('No typography roles defined.', MARGIN_X, y + 12)
      y += 28
    } else {
      const headingRole = fontRoles.find((r) => r.key === 'heading') || fontRoles[0]
      const restRoles = fontRoles.filter((r) => r !== headingRole)
      const rightRoles = restRoles.slice(0, 2)
      const extraRoles = restRoles.slice(2)

      const leftW = contentW * 0.58
      const rightW = contentW - leftW - GAP
      const leftH = 200
      const rowH = (leftH - GAP) / 2
      ensureSpace(leftH + 12)

      const drawTypeCard = (x, cardY, w, h, role, { watermark = false } = {}) => {
        doc.setFillColor(250, 250, 250)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(x, cardY, w, h, 10, 10, 'FD')

        if (watermark) {
          // Large faint "Aa" flush to bottom-right corner
          doc.setTextColor(200, 210, 220)
          doc.setFont('helvetica', Number(role.weight) >= 600 ? 'bold' : 'normal')
          doc.setFontSize(110)
          // Baseline at bottom edge; right-aligned to right edge (no inset)
          doc.text('Aa', x + w + 2, cardY + h + 6, { align: 'right' })
          ink(text)
        }

        ink(primary)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text(String(role.label).toUpperCase(), x + 12, cardY + 18)

        ink(muted)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(
          `${role.family} · ${role.weight} · ${role.sizePx}px · LH ${role.lineHeight}`,
          x + 12,
          cardY + 32,
          { maxWidth: w - 24 }
        )

        ink(text)
        doc.setFont('helvetica', Number(role.weight) >= 600 ? 'bold' : 'normal')
        doc.setFontSize(watermark ? 36 : 24)
        doc.text('Aa', x + 12, cardY + (watermark ? 72 : 58))

        doc.setFont('helvetica', Number(role.weight) >= 600 ? 'bold' : 'normal')
        doc.setFontSize(Math.min(14, Math.max(9, role.sizePx * 0.4)))
        doc.text(role.sample, x + 12, cardY + (watermark ? 96 : 78), {
          maxWidth: w - 24,
        })

        ink(muted)
        doc.setFontSize(9)
        doc.text('AaBbCcDdEeFf · 0123456789', x + 12, cardY + h - 14, {
          maxWidth: w - 24,
        })
      }

      const baseY = y
      drawTypeCard(MARGIN_X, baseY, leftW, leftH, headingRole, { watermark: true })

      rightRoles.forEach((role, idx) => {
        const ry = baseY + idx * (rowH + GAP)
        drawTypeCard(MARGIN_X + leftW + GAP, ry, rightW, rowH, role)
      })

      y = baseY + leftH + 14

      for (const role of extraRoles) {
        const cardH = 88
        ensureSpace(cardH + 10)
        drawTypeCard(MARGIN_X, y, contentW, cardH, role)
        y += cardH + 10
      }
    }

    // Buttons
    drawSectionLabel('BUTTONS')
    {
      const cardW = (contentW - GAP) / 2
      const cardH = 88
      ensureSpace(cardH + 12)
      ;['primary', 'secondary'].forEach((kind, idx) => {
        const resolved = resolveButtonStyle(data, kind)
        const x = MARGIN_X + idx * (cardW + GAP)
        doc.setFillColor(250, 250, 250)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(x, y, cardW, cardH, 8, 8, 'FD')

        ink(muted)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text(String(kind).toUpperCase(), x + 12, y + 18)

        const btnW = Math.min(140, cardW - 24)
        const btnH = 28
        const btnX = x + 12
        const btnY = y + 30
        fill(resolved.background)
        doc.setDrawColor(...hexToRgb(resolved.border))
        doc.setLineWidth(Math.max(0.5, Number(resolved.borderWidthPx) || 0))
        doc.roundedRect(btnX, btnY, btnW, btnH, Number(resolved.borderRadiusPx) || 8, Number(resolved.borderRadiusPx) || 8, 'FD')
        ink(resolved.text)
        doc.setFont('helvetica', Number(resolved.fontWeight) >= 600 ? 'bold' : 'normal')
        doc.setFontSize(10)
        doc.text(`${resolved.label} button`, btnX + btnW / 2, btnY + 18, { align: 'center' })

        ink(muted)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(
          `${resolved.background} · ${resolved.borderRadiusPx}px · ${resolved.fontWeight}/${resolved.fontSizePx}px`,
          x + 12,
          y + cardH - 12
        )
      })
      y += cardH + 16
    }

    // Tokens
    drawSectionLabel('SHAPE & TOKENS')
    ensureSpace(70)
    const pills = [
      `SCALE ×1.333`,
      `GRID 8px`,
      `RADIUS 12px`,
      `CLEAR ${data.usage?.logoClearSpace || '1.5×'}`,
      `LOGO MIN ${data.usage?.logoMinSizePx || 24}px`,
    ]
    let px = MARGIN_X
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

    // Logos — bento: large primary + stacked named, then 4 variants in a row
    drawSectionLabel('LOGO VARIANTS')
    {
      const LABEL_H = 18
      const namedW = (contentW - GAP) * (1 / 2.6)
      const primaryW = contentW - GAP - namedW
      const namedFrame = namedW
      const primaryFrameH = namedFrame * 2 + GAP + LABEL_H
      const topH = primaryFrameH + LABEL_H
      const bottomFrame = (contentW - GAP * 3) / 4
      const bottomH = bottomFrame + LABEL_H
      const blockH = topH + GAP + bottomH
      ensureSpace(blockH + 8)

      const primaryL = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES.primary)
      const nameBelow = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES['with-name-below'])
      const nameAdjacent = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES['with-name-adjacent'])
      const dark = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES.dark)
      const light = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES.light)
      const white = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES.white)
      const black = findLogoMedia(kitMedia, LOGO_ROLE_ALIASES.black)

      const baseY = y
      const xNamed = MARGIN_X + primaryW + GAP

      await drawLogoCell(MARGIN_X, baseY, primaryW, primaryFrameH, primaryL, 'primary')

      let yNamed = baseY
      const hBelow = await drawLogoCell(
        xNamed,
        yNamed,
        namedW,
        namedFrame,
        nameBelow,
        'with-name-below'
      )
      yNamed += hBelow + GAP
      await drawLogoCell(
        xNamed,
        yNamed,
        namedW,
        namedFrame,
        nameAdjacent,
        'with-name-adjacent'
      )

      const bottomY = baseY + topH + GAP
      const variants = [
        [dark, 'dark'],
        [light, 'light'],
        [white, 'white'],
        [black, 'black'],
      ]
      for (let i = 0; i < variants.length; i += 1) {
        const [logo, role] = variants[i]
        const vx = MARGIN_X + i * (bottomFrame + GAP)
        await drawLogoCell(vx, bottomY, bottomFrame, bottomFrame, logo, role)
      }

      y = baseY + blockH + 16
    }

    // Product mockups
    drawSectionLabel('PRODUCT PHOTOS WITH BRAND LOGO')
    const mockups = (kitMedia || []).filter(
      (m) => String(m.kind || m.type || '').toLowerCase() === 'mockup'
    )
    if (!mockups.length) {
      ensureSpace(24)
      ink(muted)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('No product photos with brand logo yet.', MARGIN_X, y + 12)
      y += 28
    } else {
      const cardW = (contentW - GAP) / 2
      const labelH = 18
      for (let i = 0; i < mockups.length; i += 1) {
        const col = i % 2
        if (col === 0) ensureSpace(cardW + labelH + 16)
        const x = MARGIN_X + col * (cardW + GAP)
        const mock = mockups[i]
        const label = mock.role || mock.templateId || mock.name || 'Mockup'

        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(x, y, cardW, cardW + labelH, 8, 8, 'FD')
        doc.setFillColor(250, 250, 250)
        doc.roundedRect(x + 1, y + 1, cardW - 2, cardW - 2, 7, 7, 'F')

        const dataUrl = await loadImageAsDataUrl(mediaUrl(mock))
        if (dataUrl) {
          try {
            const fmt =
              dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg') ? 'JPEG' : 'PNG'
            doc.addImage(dataUrl, fmt, x + 4, y + 4, cardW - 8, cardW - 8, undefined, 'FAST')
          } catch {
            // ignore
          }
        }

        ink(text)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text(String(label), x + cardW / 2, y + cardW + 12, {
          align: 'center',
          maxWidth: cardW - 8,
        })

        if (col === 1 || i === mockups.length - 1) y += cardW + labelH + 12
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
