/**
 * Grid Device Mockups Layout Engine:
 *  1) Dual-Bento Cards (`grid_device_mockups_v1`)
 *  2) Feature Single-Surface Layout (`grid_device_mockups_feature_v1`)
 */

export const GDM_CANVAS = {
  w: 1920,
  h: 1080,
}

export const GDM_COLORS = {
  cardBg: '#F8FAFC',
  cardBorder: '#E2E8F0',
  titleColor: '#0F172A',
  bodyColor: '#64748B',
  frameColor: '#0F172A',
  frameBorder: '#334155',
  islandFill: '#020617',
  homeBarFill: 'rgba(15, 23, 42, 0.45)',
}

export const GDM_DEFAULTS = {
  FEATURE_1_TITLE: 'Describe this feature',
  FEATURE_1_BODY: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
  FEATURE_2_TITLE: 'Describe this feature',
  FEATURE_2_BODY: 'Supporting paragraph with three to four lines of scannable copy that explains the key idea without overwhelming the slide.',
}

export function isGridDeviceMockupsLayout(layoutId) {
  const id = String(layoutId || '').trim().toLowerCase()
  return (
    id === 'grid_device_mockups_v1' ||
    id === 'grid_device_mockups' ||
    id === 'grid_device_mockups_feature_v1'
  )
}

export function isGridDeviceMockupsFeatureLayout(layoutId, schema = {}) {
  const id = String(layoutId || schema?.layout_id || schema?.id || '').trim().toLowerCase()
  return id === 'grid_device_mockups_feature_v1' || schema?.gridVariant === 'feature'
}

export function isGridDeviceMockupsSlot(slotId) {
  const sid = String(slotId || '').replace(/^slot-/, '').toUpperCase()
  return (
    sid === 'FEATURE_1_TITLE' ||
    sid === 'FEATURE_1_BODY' ||
    sid === 'FEATURE_TITLE' ||
    sid === 'FEATURE_BODY' ||
    sid === 'LAPTOP_FRAME_1' ||
    sid === 'LAPTOP_FRAME' ||
    sid === 'DEVICE_L_1' ||
    sid === 'DEVICE_L' ||
    sid === 'FEATURE_2_TITLE' ||
    sid === 'FEATURE_2_BODY' ||
    sid === 'PHONE_FRAME' ||
    sid === 'DEVICE_R' ||
    sid === 'GDM_CARD_1_BG' ||
    sid === 'GDM_CARD_2_BG' ||
    sid === 'GDM_PHONE_ISLAND' ||
    sid === 'GDM_PHONE_HOME_BAR'
  )
}

const hexLum = (hex) => {
  const s = String(hex || '').replace('#', '')
  if (s.length !== 6) return 1
  const r = parseInt(s.slice(0, 2), 16) / 255
  const g = parseInt(s.slice(2, 4), 16) / 255
  const b = parseInt(s.slice(4, 6), 16) / 255
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const isDarkPalette = (palette = {}) => {
  const bg = palette.bg || palette.background || palette.slideBg || '#ffffff'
  return hexLum(bg) < 0.45
}

const headingInk = (palette = {}) => {
  if (isDarkPalette(palette)) return palette.text || '#F8FAFC'
  return palette.text || GDM_COLORS.titleColor
}

const bodyInk = (palette = {}) => {
  if (isDarkPalette(palette)) return palette.muted || '#94A3B8'
  return palette.muted || GDM_COLORS.bodyColor
}

const cardBgColor = (palette = {}) => {
  if (isDarkPalette(palette)) return palette.cardBg || 'rgba(30, 41, 59, 0.75)'
  return palette.cardBg || GDM_COLORS.cardBg
}

const cardBorderColor = (palette = {}) => {
  if (isDarkPalette(palette)) return palette.cardBorder || 'rgba(51, 65, 85, 0.6)'
  return palette.cardBorder || GDM_COLORS.cardBorder
}

const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

/**
 * Feature Variant: Single unified slide surface with left-side narrative & laptop,
 * and a tall, prominent mobile phone mockup vertically centered on the right.
 */
function layoutGridDeviceMockupsFeature(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || GDM_CANVAS.w
  const canvasH = canvas.height || GDM_CANVAS.h
  const sx = canvasW / GDM_CANVAS.w
  const sy = canvasH / GDM_CANVAS.h

  const bySlot = new Map(
    elements.map((el) => {
      const raw = String(el.slotId || el.id || '')
      const clean = raw.replace(/^slot-/, '').toUpperCase()
      return [clean, el]
    })
  )

  // 1. Left Column: Executive Title & Supporting Paragraph
  const leftX = Math.round(108 * sx)
  const leftW = Math.round(920 * sx)
  const titleY = Math.round(128 * sy)
  const titleH = Math.round(48 * sy)
  const bodyY = titleY + titleH + Math.round(18 * sy)
  const bodyH = Math.round(104 * sy)

  const prevTitle = bySlot.get('FEATURE_1_TITLE') || bySlot.get('FEATURE_TITLE')
  const f1TitleEl = {
    id: prevTitle?.id || newId('txt-gdmf-title'),
    type: 'text',
    slotId: 'FEATURE_1_TITLE',
    role: 'heading',
    layer: 10,
    placement: {
      x: leftX,
      y: titleY,
      width: leftW,
      height: titleH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevTitle?.content?.text || GDM_DEFAULTS.FEATURE_1_TITLE,
      align: 'left',
      verticalAlign: 'center',
      fontSize: Math.round(38 * sy),
      fontWeight: 800,
      color: headingInk(palette),
      lineHeight: 1.15,
      wrap: 'nowrap',
      clipToSlot: false,
    },
  }

  const prevBody = bySlot.get('FEATURE_1_BODY') || bySlot.get('FEATURE_BODY')
  const f1BodyEl = {
    id: prevBody?.id || newId('txt-gdmf-body'),
    type: 'text',
    slotId: 'FEATURE_1_BODY',
    role: 'body',
    layer: 10,
    placement: {
      x: leftX,
      y: bodyY,
      width: leftW,
      height: bodyH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevBody?.content?.text || GDM_DEFAULTS.FEATURE_1_BODY,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(18 * sy),
      fontWeight: 400,
      color: bodyInk(palette),
      lineHeight: 1.55,
      wrap: 'wrap',
      clipToSlot: false,
    },
  }

  // 2. Left Column Bottom: Laptop Mockup (baseline at y: 970px)
  const laptopW = Math.round(936 * sx)
  const laptopH = Math.round(492 * sy)
  const laptopX = leftX
  const laptopY = Math.round(478 * sy)

  const prevLaptopFrame = bySlot.get('LAPTOP_FRAME_1') || bySlot.get('LAPTOP_FRAME')
  const laptopFrameEl = {
    id: prevLaptopFrame?.id || 'slot-LAPTOP_FRAME_1',
    type: 'shape',
    slotId: 'LAPTOP_FRAME_1',
    role: 'device_frame',
    layer: 6,
    placement: {
      x: laptopX,
      y: laptopY,
      width: laptopW,
      height: laptopH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      deviceFrame: 'laptop',
      layoutSurface: true,
      fill: GDM_COLORS.frameColor,
      stroke: GDM_COLORS.frameBorder,
      strokeWidth: 1,
      borderRadius: Math.round(14 * sx),
      boxShadow: '0 16px 36px rgba(15,23,42,0.18)',
    },
  }

  const prevLaptopImg = bySlot.get('DEVICE_L_1') || bySlot.get('DEVICE_IMAGE')
  const laptopScreenX = laptopX + Math.round(12 * sx)
  const laptopScreenY = laptopY + Math.round(24 * sy)
  const laptopScreenW = laptopW - Math.round(24 * sx)
  const laptopScreenH = laptopH - Math.round(46 * sy)
  const laptopImgEl = {
    id: prevLaptopImg?.id || 'slot-DEVICE_L_1',
    type: 'image',
    slotId: 'DEVICE_L_1',
    role: 'image',
    layer: 8,
    placement: {
      x: laptopScreenX,
      y: laptopScreenY,
      width: laptopScreenW,
      height: laptopScreenH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(prevLaptopImg?.content || {}),
      fit: prevLaptopImg?.content?.fit || 'cover',
      borderRadius: Math.round(8 * sx),
      isDeviceScreen: true,
      shadow: undefined,
      boxShadow: undefined,
    },
  }

  // 3. Right Column: Tall Phone Mockup (centered in right area, baseline at y: 970px, top at y: 174px)
  const phoneW = Math.round(366 * sx)
  const phoneH = Math.round(796 * sy)
  const phoneX = Math.round(1300 * sx)
  const phoneY = Math.round(174 * sy)

  const prevPhoneFrame = bySlot.get('PHONE_FRAME')
  const phoneFrameEl = {
    id: prevPhoneFrame?.id || 'slot-PHONE_FRAME',
    type: 'shape',
    slotId: 'PHONE_FRAME',
    role: 'device_frame',
    layer: 6,
    placement: {
      x: phoneX,
      y: phoneY,
      width: phoneW,
      height: phoneH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      deviceFrame: 'phone',
      layoutSurface: true,
      fill: GDM_COLORS.frameColor,
      stroke: GDM_COLORS.frameBorder,
      strokeWidth: 1,
      borderRadius: Math.round(38 * sx),
      boxShadow: '0 20px 48px rgba(15,23,42,0.2), 0 4px 12px rgba(15,23,42,0.1)',
    },
  }

  const prevPhoneImg = bySlot.get('DEVICE_R') || bySlot.get('PHONE_IMAGE')
  const phoneScreenX = phoneX + Math.round(12 * sx)
  const phoneScreenY = phoneY + Math.round(12 * sy)
  const phoneScreenW = phoneW - Math.round(24 * sx)
  const phoneScreenH = phoneH - Math.round(24 * sy)
  const phoneImgEl = {
    id: prevPhoneImg?.id || 'slot-DEVICE_R',
    type: 'image',
    slotId: 'DEVICE_R',
    role: 'image',
    layer: 8,
    placement: {
      x: phoneScreenX,
      y: phoneScreenY,
      width: phoneScreenW,
      height: phoneScreenH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(prevPhoneImg?.content || {}),
      fit: prevPhoneImg?.content?.fit || 'cover',
      borderRadius: Math.round(28 * sx),
      isDeviceScreen: true,
      shadow: undefined,
      boxShadow: undefined,
    },
  }

  // Dynamic Island
  const islandW = Math.round(phoneScreenW * 0.32)
  const islandH = Math.max(12, Math.round(phoneScreenH * 0.026))
  const islandX = phoneScreenX + Math.round((phoneScreenW - islandW) / 2)
  const islandY = phoneScreenY + Math.round(14 * sy)
  const phoneIslandEl = {
    id: newId('shp-gdmf-island'),
    type: 'graphic',
    slotId: 'GDM_PHONE_ISLAND',
    role: 'decoration',
    layer: 12,
    placement: {
      x: islandX,
      y: islandY,
      width: islandW,
      height: islandH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${islandW} ${islandH}" width="100%" height="100%"><rect width="${islandW}" height="${islandH}" rx="${islandH / 2}" fill="${GDM_COLORS.islandFill}"/></svg>`,
      fill: GDM_COLORS.islandFill,
      alt: 'Dynamic Island',
    },
  }

  // Home Bar
  const homeW = Math.round(phoneScreenW * 0.34)
  const homeH = Math.max(5, Math.round(phoneScreenH * 0.007))
  const homeX = phoneScreenX + Math.round((phoneScreenW - homeW) / 2)
  const homeY = phoneScreenY + phoneScreenH - Math.round(18 * sy)
  const phoneHomeBarEl = {
    id: newId('shp-gdmf-homebar'),
    type: 'graphic',
    slotId: 'GDM_PHONE_HOME_BAR',
    role: 'decoration',
    layer: 12,
    placement: {
      x: homeX,
      y: homeY,
      width: homeW,
      height: homeH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${homeW} ${homeH}" width="100%" height="100%"><rect width="${homeW}" height="${homeH}" rx="${homeH / 2}" fill="${GDM_COLORS.homeBarFill}"/></svg>`,
      fill: GDM_COLORS.homeBarFill,
      alt: 'Home Indicator',
    },
  }

  return [
    f1TitleEl,
    f1BodyEl,
    laptopFrameEl,
    laptopImgEl,
    phoneFrameEl,
    phoneImgEl,
    phoneIslandEl,
    phoneHomeBarEl,
  ]
}

/**
 * Standard Dual-Bento Cards Variant (`grid_device_mockups_v1`)
 */
function layoutGridDeviceMockupsDualCards(elements, schema, palette = {}, canvas = {}) {
  const canvasW = canvas.width || GDM_CANVAS.w
  const canvasH = canvas.height || GDM_CANVAS.h
  const sx = canvasW / GDM_CANVAS.w
  const sy = canvasH / GDM_CANVAS.h

  const bySlot = new Map(
    elements.map((el) => {
      const raw = String(el.slotId || el.id || '')
      const clean = raw.replace(/^slot-/, '').toUpperCase()
      return [clean, el]
    })
  )

  // 1. Container Cards Geometry (Symmetric top & bottom 70px margin, 80px side margins)
  const padX = Math.round(80 * sx)
  const padY = Math.round(70 * sy)
  const cardGap = Math.round(32 * sx)
  const cardH = Math.round(940 * sy)
  const cardRadius = Math.round(20 * sx)

  const card1W = Math.round(1040 * sx)
  const card1X = padX

  const card2W = Math.round(688 * sx)
  const card2X = card1X + card1W + cardGap

  // --- Card 1 Background (Desktop/Laptop Container) ---
  const prevCard1 = bySlot.get('GDM_CARD_1_BG')
  const card1El = {
    id: prevCard1?.id || newId('shp-gdm-card1'),
    type: 'shape',
    slotId: 'GDM_CARD_1_BG',
    role: 'card',
    layer: 1,
    placement: {
      x: card1X,
      y: padY,
      width: card1W,
      height: cardH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      fill: cardBgColor(palette),
      stroke: cardBorderColor(palette),
      strokeWidth: 1.2,
      borderRadius: cardRadius,
      boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    },
  }

  // --- Card 2 Background (Mobile/Phone Container) ---
  const prevCard2 = bySlot.get('GDM_CARD_2_BG')
  const card2El = {
    id: prevCard2?.id || newId('shp-gdm-card2'),
    type: 'shape',
    slotId: 'GDM_CARD_2_BG',
    role: 'card',
    layer: 1,
    placement: {
      x: card2X,
      y: padY,
      width: card2W,
      height: cardH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      fill: cardBgColor(palette),
      stroke: cardBorderColor(palette),
      strokeWidth: 1.2,
      borderRadius: cardRadius,
      boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    },
  }

  // 2. Header Texts: Compact, crisp single-line headings + 2-line scannable copy
  const titleY = padY + Math.round(40 * sy)
  const titleH = Math.round(36 * sy)
  const bodyY = titleY + titleH + Math.round(8 * sy)
  const bodyH = Math.round(48 * sy)

  // Card 1 Text
  const f1TextX = card1X + Math.round(48 * sx)
  const f1TextW = card1W - Math.round(96 * sx)
  const prevF1Title = bySlot.get('FEATURE_1_TITLE')
  const f1TitleEl = {
    id: prevF1Title?.id || newId('txt-gdm-f1-title'),
    type: 'text',
    slotId: 'FEATURE_1_TITLE',
    role: 'heading',
    layer: 10,
    placement: {
      x: f1TextX,
      y: titleY,
      width: f1TextW,
      height: titleH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevF1Title?.content?.text || GDM_DEFAULTS.FEATURE_1_TITLE,
      align: 'left',
      verticalAlign: 'center',
      fontSize: Math.round(26 * sy),
      fontWeight: 800,
      color: headingInk(palette),
      lineHeight: 1.15,
      wrap: 'nowrap',
      clipToSlot: false,
    },
  }

  const prevF1Body = bySlot.get('FEATURE_1_BODY')
  const f1BodyEl = {
    id: prevF1Body?.id || newId('txt-gdm-f1-body'),
    type: 'text',
    slotId: 'FEATURE_1_BODY',
    role: 'body',
    layer: 10,
    placement: {
      x: f1TextX,
      y: bodyY,
      width: f1TextW,
      height: bodyH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevF1Body?.content?.text || GDM_DEFAULTS.FEATURE_1_BODY,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(14.5 * sy),
      fontWeight: 400,
      color: bodyInk(palette),
      lineHeight: 1.4,
      wrap: 'wrap',
      clipToSlot: false,
    },
  }

  // Card 2 Text
  const f2TextX = card2X + Math.round(40 * sx)
  const f2TextW = card2W - Math.round(80 * sx)
  const prevF2Title = bySlot.get('FEATURE_2_TITLE')
  const f2TitleEl = {
    id: prevF2Title?.id || newId('txt-gdm-f2-title'),
    type: 'text',
    slotId: 'FEATURE_2_TITLE',
    role: 'heading',
    layer: 10,
    placement: {
      x: f2TextX,
      y: titleY,
      width: f2TextW,
      height: titleH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevF2Title?.content?.text || GDM_DEFAULTS.FEATURE_2_TITLE,
      align: 'left',
      verticalAlign: 'center',
      fontSize: Math.round(26 * sy),
      fontWeight: 800,
      color: headingInk(palette),
      lineHeight: 1.15,
      wrap: 'nowrap',
      clipToSlot: false,
    },
  }

  const prevF2Body = bySlot.get('FEATURE_2_BODY')
  const f2BodyEl = {
    id: prevF2Body?.id || newId('txt-gdm-f2-body'),
    type: 'text',
    slotId: 'FEATURE_2_BODY',
    role: 'body',
    layer: 10,
    placement: {
      x: f2TextX,
      y: bodyY,
      width: f2TextW,
      height: bodyH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      text: prevF2Body?.content?.text || GDM_DEFAULTS.FEATURE_2_BODY,
      align: 'left',
      verticalAlign: 'top',
      fontSize: Math.round(14.5 * sy),
      fontWeight: 400,
      color: bodyInk(palette),
      lineHeight: 1.4,
      wrap: 'wrap',
      clipToSlot: false,
    },
  }

  // 3. Device Mockups Zone: Shifted lower to y: 356px (height: 480px) for generous ~140px clearance below text
  const deviceY = Math.round(356 * sy)
  const deviceH = Math.round(480 * sy)

  // --- Laptop Mockup (Card 1) ---
  const laptopH = deviceH
  const laptopW = Math.round(laptopH * (16 / 10.5))
  const laptopX = card1X + Math.round((card1W - laptopW) / 2)
  const prevLaptopFrame = bySlot.get('LAPTOP_FRAME_1') || bySlot.get('LAPTOP_FRAME')
  const laptopFrameEl = {
    id: prevLaptopFrame?.id || 'slot-LAPTOP_FRAME_1',
    type: 'shape',
    slotId: 'LAPTOP_FRAME_1',
    role: 'device_frame',
    layer: 6,
    placement: {
      x: laptopX,
      y: deviceY,
      width: laptopW,
      height: laptopH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      deviceFrame: 'laptop',
      layoutSurface: true,
      fill: GDM_COLORS.frameColor,
      stroke: GDM_COLORS.frameBorder,
      strokeWidth: 1,
      borderRadius: Math.round(12 * sx),
      boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
    },
  }

  // Laptop Screen Image (inside frame cutout)
  const prevLaptopImg = bySlot.get('DEVICE_L_1') || bySlot.get('DEVICE_IMAGE')
  const laptopScreenX = laptopX + Math.round(10 * sx)
  const laptopScreenY = deviceY + Math.round(20 * sy)
  const laptopScreenW = laptopW - Math.round(20 * sx)
  const laptopScreenH = laptopH - Math.round(38 * sy)
  const laptopImgEl = {
    id: prevLaptopImg?.id || 'slot-DEVICE_L_1',
    type: 'image',
    slotId: 'DEVICE_L_1',
    role: 'image',
    layer: 8,
    placement: {
      x: laptopScreenX,
      y: laptopScreenY,
      width: laptopScreenW,
      height: laptopScreenH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(prevLaptopImg?.content || {}),
      fit: prevLaptopImg?.content?.fit || 'cover',
      borderRadius: Math.round(6 * sx),
      shadow: undefined,
      boxShadow: undefined,
    },
  }

  // --- Phone Mockup (Card 2) ---
  const phoneH = deviceH
  const phoneW = Math.round(phoneH * (9 / 19.5))
  const phoneX = card2X + Math.round((card2W - phoneW) / 2)
  const prevPhoneFrame = bySlot.get('PHONE_FRAME')
  const phoneFrameEl = {
    id: prevPhoneFrame?.id || 'slot-PHONE_FRAME',
    type: 'shape',
    slotId: 'PHONE_FRAME',
    role: 'device_frame',
    layer: 6,
    placement: {
      x: phoneX,
      y: deviceY,
      width: phoneW,
      height: phoneH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      shape: 'rounded-rect',
      deviceFrame: 'phone',
      layoutSurface: true,
      fill: GDM_COLORS.frameColor,
      stroke: GDM_COLORS.frameBorder,
      strokeWidth: 1,
      borderRadius: Math.round(28 * sx),
      boxShadow: '0 12px 28px rgba(15,23,42,0.2), 0 2px 6px rgba(15,23,42,0.1)',
    },
  }

  // Phone Screen Image (inside frame cutout)
  const prevPhoneImg = bySlot.get('DEVICE_R') || bySlot.get('PHONE_IMAGE')
  const phoneScreenX = phoneX + Math.round(8 * sx)
  const phoneScreenY = deviceY + Math.round(8 * sy)
  const phoneScreenW = phoneW - Math.round(16 * sx)
  const phoneScreenH = phoneH - Math.round(16 * sy)
  const phoneImgEl = {
    id: prevPhoneImg?.id || 'slot-DEVICE_R',
    type: 'image',
    slotId: 'DEVICE_R',
    role: 'image',
    layer: 8,
    placement: {
      x: phoneScreenX,
      y: phoneScreenY,
      width: phoneScreenW,
      height: phoneScreenH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(prevPhoneImg?.content || {}),
      fit: prevPhoneImg?.content?.fit || 'cover',
      borderRadius: Math.round(20 * sx),
      shadow: undefined,
      boxShadow: undefined,
    },
  }

  // Dynamic Island Pill
  const prevIsland = bySlot.get('GDM_PHONE_ISLAND')
  const islandW = Math.round(phoneScreenW * 0.32)
  const islandH = Math.max(8, Math.round(phoneScreenH * 0.024))
  const islandX = phoneScreenX + Math.round((phoneScreenW - islandW) / 2)
  const islandY = phoneScreenY + Math.round(10 * sy)
  const phoneIslandEl = {
    id: prevIsland?.id || newId('shp-gdm-island'),
    type: 'graphic',
    slotId: 'GDM_PHONE_ISLAND',
    role: 'decoration',
    layer: 12,
    placement: {
      x: islandX,
      y: islandY,
      width: islandW,
      height: islandH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${islandW} ${islandH}" width="100%" height="100%"><rect width="${islandW}" height="${islandH}" rx="${islandH / 2}" fill="${GDM_COLORS.islandFill}"/></svg>`,
      fill: GDM_COLORS.islandFill,
      alt: 'Dynamic Island',
    },
  }

  // Home Indicator Bar
  const prevHomeBar = bySlot.get('GDM_PHONE_HOME_BAR')
  const homeW = Math.round(phoneScreenW * 0.34)
  const homeH = Math.max(4, Math.round(phoneScreenH * 0.008))
  const homeX = phoneScreenX + Math.round((phoneScreenW - homeW) / 2)
  const homeY = phoneScreenY + phoneScreenH - Math.round(14 * sy)
  const phoneHomeBarEl = {
    id: prevHomeBar?.id || newId('shp-gdm-homebar'),
    type: 'graphic',
    slotId: 'GDM_PHONE_HOME_BAR',
    role: 'decoration',
    layer: 12,
    placement: {
      x: homeX,
      y: homeY,
      width: homeW,
      height: homeH,
      rotation: 0,
      opacity: 1,
    },
    content: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${homeW} ${homeH}" width="100%" height="100%"><rect width="${homeW}" height="${homeH}" rx="${homeH / 2}" fill="${GDM_COLORS.homeBarFill}"/></svg>`,
      fill: GDM_COLORS.homeBarFill,
      alt: 'Home Indicator',
    },
  }

  return [
    card1El,
    f1TitleEl,
    f1BodyEl,
    laptopFrameEl,
    laptopImgEl,
    card2El,
    f2TitleEl,
    f2BodyEl,
    phoneFrameEl,
    phoneImgEl,
    phoneIslandEl,
    phoneHomeBarEl,
  ]
}

/**
 * Main entry point: dispatches either Dual-Cards variant or Feature variant.
 */
export function layoutGridDeviceMockups(elements, schema, palette = {}, canvas = {}) {
  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId
  if (isGridDeviceMockupsFeatureLayout(layoutId, schema)) {
    return layoutGridDeviceMockupsFeature(elements, schema, palette, canvas)
  }
  return layoutGridDeviceMockupsDualCards(elements, schema, palette, canvas)
}
