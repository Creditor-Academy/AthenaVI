/**
 * Custom canvas layout for section_with_image_v1 (Section With Image).
 *
 * Implements 55/45 split layout:
 *  - Left content cluster (55%):
 *      - Eyebrow ("OUR APPROACH") in uppercase accent color with horizontal accent line
 *      - Bold heading ("Section title") 
 *      - Body copy with balanced line-height
 *      - 3 highlight feature badges ("Clarity", "Alignment", "Momentum") with circular colored icons
 *  - Right visual (45%):
 *      - Clean vertical split at 55% mark (no curves)
 *      - Vibrant gradient placeholder landscape
 *      - Simple and modern design
 */

export function isSectionWithImageLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').trim()
  return id === 'section_with_image_v1' || id === 'section_with_image'
}

/**
 * Geometry definitions on a 1920×1080 canvas.
 */
export function sectionWithImageGeom(canvasW = 1920, canvasH = 1080) {
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const s = Math.min(sx, sy)

  const contentX = Math.round(100 * sx)
  const contentW = Math.round(750 * sx)

  // Eyebrow at top
  const eyebrowY = Math.round(120 * sy)
  const eyebrowW = Math.round(180 * sx)
  const eyebrowH = Math.round(30 * sy)

  const lineX = Math.round(contentX + 190 * sx)
  const lineY = Math.round(eyebrowY + 12 * sy)
  const lineW = Math.round(70 * sx)
  const lineH = Math.max(2, Math.round(2 * s))

  // Heading: centered vertically in the left half
  const headingY = Math.round(300 * sy)  // Centered at ~450px (middle of 1080)
  const headingH = Math.round(300 * sy)  // Large box for vertical centering

  // No body or badges needed

  // Image: Right half
  const imgX = Math.round(960 * sx)
  const imgY = 0
  const imgW = Math.round(960 * sx)
  const imgH = Math.round(1080 * sy)

  return {
    canvasW, canvasH, sx, sy, s,
    contentX, contentW,
    eyebrow: { x: contentX, y: eyebrowY, w: eyebrowW, h: eyebrowH },
    eyebrowLine: { x: lineX, y: lineY, w: lineW, h: lineH },
    heading: { x: contentX, y: headingY, w: contentW, h: headingH },
    image: { x: imgX, y: imgY, w: imgW, h: imgH },
  }
}

/**
 * Decorative SVG artwork:
 *  - Eyebrow horizontal accent rule only
 *  (Removed badges for simplified layout)
 */
export function renderSectionWithImageDecorSvg(g, palette = {}, labels = {}) {
  const { canvasW: W, canvasH: H, eyebrowLine } = g
  const accent = palette.accent || palette.primary || '#6366F1'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!-- Eyebrow accent rule -->
  <rect x="${eyebrowLine.x}" y="${eyebrowLine.y}" width="${eyebrowLine.w}" height="${eyebrowLine.h}" rx="${eyebrowLine.h}" fill="${accent}" opacity="0.85"/>
</svg>`
}

/**
 * Beautiful gradient image placeholder SVG for the organic wave section.
 * Creates a vibrant landscape scene with smooth gradients matching the wave cutout.
 */
const sectionImagePlaceholderSvg = (w, h) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="swiSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#818CF8;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#A5B4FC;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#DBEAFE;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="swiMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#6366F1;stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:#4338CA;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="swiHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#A78BFA;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="swiForegroundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#DB2777;stop-opacity:1" />
      </linearGradient>
      <radialGradient id="swiSunGlow" cx="50%" cy="50%">
        <stop offset="0%" style="stop-color:#FEF08A;stop-opacity:0.9" />
        <stop offset="50%" style="stop-color:#FDE047;stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:#FACC15;stop-opacity:0" />
      </radialGradient>
    </defs>
    
    <!-- Sky background -->
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#swiSkyGrad)"/>
    
    <!-- Sun with glow -->
    <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${Math.min(w, h) * 0.12}" fill="url(#swiSunGlow)"/>
    <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${Math.min(w, h) * 0.06}" fill="#FBBF24" opacity="0.95"/>
    
    <!-- Fluffy clouds -->
    <g opacity="0.85">
      <ellipse cx="${w * 0.15}" cy="${h * 0.18}" rx="${w * 0.08}" ry="${h * 0.06}" fill="white" opacity="0.9"/>
      <ellipse cx="${w * 0.2}" cy="${h * 0.16}" rx="${w * 0.06}" ry="${h * 0.05}" fill="white" opacity="0.9"/>
      <ellipse cx="${w * 0.17}" cy="${h * 0.2}" rx="${w * 0.05}" ry="${h * 0.04}" fill="white" opacity="0.8"/>
    </g>
    <g opacity="0.75">
      <ellipse cx="${w * 0.85}" cy="${h * 0.15}" rx="${w * 0.07}" ry="${h * 0.05}" fill="white" opacity="0.85"/>
      <ellipse cx="${w * 0.88}" cy="${h * 0.13}" rx="${w * 0.05}" ry="${h * 0.04}" fill="white" opacity="0.85"/>
    </g>
    <g opacity="0.7">
      <ellipse cx="${w * 0.45}" cy="${h * 0.12}" rx="${w * 0.06}" ry="${h * 0.045}" fill="white" opacity="0.8"/>
      <ellipse cx="${w * 0.48}" cy="${h * 0.1}" rx="${w * 0.04}" ry="${h * 0.035}" fill="white" opacity="0.8"/>
    </g>
    
    <!-- Distant mountains -->
    <path d="M0 ${h * 0.5} Q${w * 0.2} ${h * 0.35} ${w * 0.4} ${h * 0.42} Q${w * 0.6} ${h * 0.38} ${w * 0.8} ${h * 0.48} Q${w * 0.9} ${h * 0.45} ${w} ${h * 0.5} L${w} ${h} L0 ${h} Z" fill="url(#swiMountainGrad)" opacity="0.7"/>
    
    <!-- Mid-range hills -->
    <path d="M0 ${h * 0.6} Q${w * 0.25} ${h * 0.48} ${w * 0.5} ${h * 0.58} Q${w * 0.75} ${h * 0.5} ${w} ${h * 0.6} L${w} ${h} L0 ${h} Z" fill="url(#swiHillGrad)" opacity="0.85"/>
    
    <!-- Foreground hills -->
    <path d="M0 ${h * 0.72} Q${w * 0.3} ${h * 0.62} ${w * 0.6} ${h * 0.7} Q${w * 0.85} ${h * 0.65} ${w} ${h * 0.75} L${w} ${h} L0 ${h} Z" fill="url(#swiForegroundGrad)"/>
    
    <!-- Decorative accent shapes -->
    <circle cx="${w * 0.15}" cy="${h * 0.68}" r="${Math.min(w, h) * 0.025}" fill="#F472B6" opacity="0.6"/>
    <circle cx="${w * 0.35}" cy="${h * 0.75}" r="${Math.min(w, h) * 0.02}" fill="#F9A8D4" opacity="0.7"/>
    <circle cx="${w * 0.7}" cy="${h * 0.78}" r="${Math.min(w, h) * 0.018}" fill="#FBCFE8" opacity="0.6"/>
  </svg>`
}

/**
 * Layout entry-point for section_with_image_v1.
 */
export function layoutSectionWithImage(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements

  const canvasW = canvas.width  || 1920
  const canvasH = canvas.height || 1080
  const g = sectionWithImageGeom(canvasW, canvasH)

  const accent = palette.accent || palette.primary || '#6366F1'
  const textDark = '#0F172A'

  let headingEl = null
  let eyebrowEl = null
  let imageEl = null
  const otherEls = []

  elements.forEach((el) => {
    const slotId = String(el.slotId || '').toUpperCase()
    const role   = String(el.role || '').toLowerCase()

    if (slotId === 'HEADING' || role === 'heading' || role === 'title') {
      headingEl = el
    } else if (slotId === 'EYEBROW' || slotId === 'TRACKER' || slotId === 'CATEGORY' || role === 'subheading') {
      eyebrowEl = el
    } else if (slotId === 'HERO_IMAGE' || slotId === 'IMAGE' || role === 'image') {
      imageEl = el
    } else if (slotId !== 'DECOR' && slotId !== 'BODY' && !String(el.id || '').includes('decor') && !/^BADGE_\d+_LABEL$/i.test(slotId)) {
      // Skip body and badges
      otherEls.push(el)
    }
  })

  const out = []

  // 1. Decorative SVG layer (just eyebrow line now)
  out.push({
    id: 'shp-section-with-image-decor',
    type: 'graphic',
    layer: 1,
    role: 'decoration',
    slotId: 'DECOR',
    placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
    content: {
      svg: renderSectionWithImageDecorSvg(g, palette),
      colorMode: 'preserve',
    },
  })

  // 2. Eyebrow Text Element
  const eyebrowText = eyebrowEl?.content?.text || 'OUR APP'
  out.push({
    ...(eyebrowEl || {}),
    id: eyebrowEl?.id || 'slot-EYEBROW',
    slotId: 'EYEBROW',
    type: 'text',
    role: 'eyebrow',
    layer: 10,
    placement: {
      x: g.eyebrow.x,
      y: g.eyebrow.y,
      width: g.eyebrow.w,
      height: g.eyebrow.h,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(eyebrowEl?.content || {}),
      text: eyebrowText,
      fontSize: 16,
      fontWeight: 700,
      bold: true,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      align: 'left',
      verticalAlign: 'center',
      color: accent,
      colorRole: 'accent',
      wrap: 'nowrap',
      clipToSlot: true,
    },
  })

  // 3. Heading Text Element (centered vertically on canvas)
  const headingText = headingEl?.content?.text || 'Section title'
  out.push({
    ...(headingEl || {}),
    id: headingEl?.id || 'slot-HEADING',
    slotId: 'HEADING',
    type: 'text',
    role: 'heading',
    layer: 10,
    placement: {
      x: g.heading.x,
      y: g.heading.y,
      width: g.heading.w,
      height: g.heading.h,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(headingEl?.content || {}),
      text: headingText,
      fontSize: 72,
      fontWeight: 800,
      bold: true,
      align: 'left',
      verticalAlign: 'center',
      lineHeight: 1.1,
      color: textDark,
      wrap: 'normal',
      clipToSlot: true,
    },
  })

  // 4. Hero Image (Right side)
  const existingImgContent = imageEl?.content || {}
  const hasImage = !!(existingImgContent.url || existingImgContent.src)
  out.push({
    ...(imageEl || {}),
    id: imageEl?.id || 'slot-HERO_IMAGE',
    slotId: 'HERO_IMAGE',
    type: 'image',
    role: 'image',
    layer: 6,
    placement: {
      x: g.image.x,
      y: g.image.y,
      width: g.image.w,
      height: g.image.h,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...existingImgContent,
      url: existingImgContent.url || null,
      src: existingImgContent.src || null,
      fit: 'cover',
      ...(hasImage ? {} : {
        placeholderSvg: sectionImagePlaceholderSvg(g.image.w, g.image.h),
      }),
    },
  })

  otherEls.forEach((el) => out.push(el))

  return out
}

/**
 * High-fidelity SVG preview for template catalog card in LayoutPolishedPreview.jsx.
 */
export function sectionWithImagePreviewSvg(previewHints = {}, theme = {}) {
  const accent = theme.accent || '#6366F1'
  const accentSoft = theme.accentSoft || '#EEF2FF'
  const g = sectionWithImageGeom(1920, 1080)
  const decorSvg = renderSectionWithImageDecorSvg(g, { accent, accentSoft })

  // Extract inner decor elements from decorSvg
  const decorInner = decorSvg
    .replace(/^<svg[^>]*>/i, '')
    .replace(/<\/svg>$/i, '')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <clipPath id="swiCardWaveMask">
        <rect x="960" y="0" width="960" height="1080"/>
      </clipPath>
    </defs>

    <!-- Clean white canvas -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Decorative layer: eyebrow line and badges only (no backdrop curves) -->
    ${decorInner}

    <!-- Left Content -->
    <!-- Eyebrow text -->
    <text x="100" y="132" fill="${accent}" font-size="18" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="0.1em">OUR APPROACH</text>

    <!-- Heading text (Single line) -->
    <text x="100" y="228" fill="#0F172A" font-size="54" font-weight="800" font-family="system-ui, sans-serif" letter-spacing="-0.02em">Section title</text>

    <!-- Body text lines -->
    <text x="100" y="310" fill="#64748B" font-size="22" font-weight="400" font-family="system-ui, sans-serif" line-height="1.55">
      <tspan x="100" dy="0">We help teams turn complex ideas into clear narratives that</tspan>
      <tspan x="100" dy="36">drive decisions and build momentum across the</tspan>
      <tspan x="100" dy="36">organization.</tspan>
    </text>

    <!-- Right Side Image Placeholder (50% width - full half) -->
    <g clip-path="url(#swiCardWaveMask)">
      <!-- Sky gradient -->
      <defs>
        <linearGradient id="previewSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#818CF8"/>
          <stop offset="50%" stop-color="#A5B4FC"/>
          <stop offset="100%" stop-color="#DBEAFE"/>
        </linearGradient>
        <linearGradient id="previewMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#6366F1" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#4338CA"/>
        </linearGradient>
        <linearGradient id="previewHillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#A78BFA"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
        <linearGradient id="previewForeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#EC4899"/>
          <stop offset="100%" stop-color="#DB2777"/>
        </linearGradient>
        <radialGradient id="previewSunGlow" cx="50%" cy="50%">
          <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#FDE047" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#FACC15" stop-opacity="0"/>
        </radialGradient>
      </defs>
      
      <rect x="960" y="0" width="960" height="1080" fill="url(#previewSkyGrad)"/>

      <!-- Sun with glow -->
      <circle cx="1440" cy="237" r="130" fill="url(#previewSunGlow)"/>
      <circle cx="1440" cy="237" r="65" fill="#FBBF24" opacity="0.95"/>

      <!-- Fluffy clouds -->
      <g opacity="0.85">
        <ellipse cx="1080" cy="194" rx="84" ry="65" fill="white" opacity="0.9"/>
        <ellipse cx="1130" cy="173" rx="63" ry="54" fill="white" opacity="0.9"/>
        <ellipse cx="1097" cy="216" rx="52" ry="43" fill="white" opacity="0.8"/>
      </g>
      <g opacity="0.75">
        <ellipse cx="1747" cy="162" rx="74" ry="54" fill="white" opacity="0.85"/>
        <ellipse cx="1790" cy="140" rx="52" ry="43" fill="white" opacity="0.85"/>
      </g>
      <g opacity="0.7">
        <ellipse cx="1400" cy="130" rx="63" ry="49" fill="white" opacity="0.8"/>
        <ellipse cx="1438" cy="108" rx="42" ry="38" fill="white" opacity="0.8"/>
      </g>

      <!-- Distant mountains -->
      <path d="M 960 540 Q 1200 378 1440 453 Q 1680 410 1920 518 L 1920 1080 L 960 1080 Z" fill="url(#previewMountainGrad)" opacity="0.7"/>

      <!-- Mid-range hills -->
      <path d="M 960 648 Q 1260 518 1560 626 Q 1860 540 1920 648 L 1920 1080 L 960 1080 Z" fill="url(#previewHillGrad)" opacity="0.85"/>

      <!-- Foreground hills -->
      <path d="M 960 778 Q 1290 670 1620 756 Q 1820 702 1920 810 L 1920 1080 L 960 1080 Z" fill="url(#previewForeGrad)"/>

      <!-- Decorative accent shapes -->
      <circle cx="1104" cy="734" r="27" fill="#F472B6" opacity="0.6"/>
      <circle cx="1344" cy="810" r="22" fill="#F9A8D4" opacity="0.7"/>
      <circle cx="1692" cy="842" r="19" fill="#FBCFE8" opacity="0.6"/>
    </g>
  </svg>`
}
