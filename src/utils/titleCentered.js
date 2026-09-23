/**
 * Title Centered, Title Minimal & Title Image Logo layout helpers and polished preview SVGs.
 * Keeps title slides confident, balanced, and readable with proper typography hierarchy.
 */

export function isTitleCenteredLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_centered_v1' || id === 'title_centered'
}

export function isTitleMinimalLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_minimal_v1' || id === 'title_minimal'
}

export function isTitleImageLogoLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_image_logo_v1' || id === 'title_image_logo'
}

export function isTitleHeroLeftBlobLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_hero_left_blob_v1' || id === 'title_hero_left_blob'
}

export function isTitleHeroLeftFadeLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_hero_left_fade_v1' || id === 'title_hero_left_fade'
}

export function isTitleHeroRightOvalLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_hero_right_oval_v1' || id === 'title_hero_right_oval'
}

export function isTitleHeroRightFadeLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_hero_right_fade_v1' || id === 'title_hero_right_fade'
}

export function isTitleFullbleedLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_fullbleed_v1' || id === 'title_fullbleed'
}

export function isTitleFullbleedOverlayLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').toLowerCase()
  return id === 'title_fullbleed_overlay_v1' || id === 'title_fullbleed_overlay'
}


function escapeXml(unsafe = '') {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function titleCenteredPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Presentation Title'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1

  // Dynamic vertical centering:
  const titleStartY = isMultiLine ? 470 : 510
  const subtitleY = isMultiLine ? 470 + (titleLines.length - 1) * 85 + 75 : 580

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="960" dy="${idx === 0 ? 0 : '1.15em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <!-- Clean canvas background -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Main Presentation Title -->
    <text
      x="960"
      y="${titleStartY}"
      text-anchor="middle"
      fill="#0F172A"
      font-size="76"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline -->
    ${
      subtitle
        ? `<text
      x="960"
      y="${subtitleY}"
      text-anchor="middle"
      fill="#64748B"
      font-size="32"
      font-weight="450"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.01em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function titleMinimalPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Minimal title slide'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Optional tagline'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1

  // Refined vertical centering for minimal layout:
  const titleStartY = isMultiLine ? 485 : 520
  const subtitleY = isMultiLine ? 485 + (titleLines.length - 1) * 75 + 68 : 582

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="960" dy="${idx === 0 ? 0 : '1.2em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <!-- Clean canvas background -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Main Title (Refined, minimal, elegant weight) -->
    <text
      x="960"
      y="${titleStartY}"
      text-anchor="middle"
      fill="#0F172A"
      font-size="62"
      font-weight="700"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.02em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline (Airy, subtle) -->
    ${
      subtitle
        ? `<text
      x="960"
      y="${subtitleY}"
      text-anchor="middle"
      fill="#64748B"
      font-size="28"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function titleImageLogoPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Presentation title'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Subtitle or company tagline'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1

  const titleStartY = isMultiLine ? 460 : 500
  const subtitleY = isMultiLine ? 460 + (titleLines.length - 1) * 65 + 60 : 570

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="180" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EEF2F6" />
        <stop offset="100%" stop-color="#E2E8F0" />
      </linearGradient>
    </defs>

    <!-- Left background -->
    <rect x="0" y="0" width="960" height="1080" fill="#FFFFFF"/>

    <!-- Right hero image background (one image only) -->
    <rect x="960" y="0" width="960" height="1080" fill="url(#heroGradient)"/>

    <!-- Subtle divider line between panels -->
    <line x1="960" y1="0" x2="960" y2="1080" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Hero image icon in center of right half (cx: 1440, cy: 540) -->
    <g transform="translate(1440, 540) scale(2.2)" opacity="0.45">
      <rect x="-36" y="-28" width="72" height="56" rx="8" fill="none" stroke="#64748B" stroke-width="3"/>
      <path d="M -22 14 L -8 -2 L 4 10 L 14 -1 L 26 14" fill="none" stroke="#64748B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="-16" cy="-10" r="4.5" fill="#64748B"/>
    </g>

    <!-- Main Title -->
    <text
      x="180"
      y="${titleStartY}"
      text-anchor="start"
      fill="#0F172A"
      font-size="52"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline -->
    ${
      subtitle
        ? `<text
      x="180"
      y="${subtitleY}"
      text-anchor="start"
      fill="#64748B"
      font-size="24"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export const FLUID_BLOB_POLYGON =
  'polygon(5% 54%, 5% 59%, 6% 64%, 8% 69%, 10% 73%, 13% 78%, 16% 81%, 20% 85%, 24% 87%, 29% 90%, 34% 92%, 39% 93%, 44% 94%, 49% 95%, 54% 95%, 60% 95%, 65% 94%, 70% 93%, 75% 92%, 80% 90%, 84% 88%, 87% 86%, 89% 83%, 91% 81%, 93% 77%, 95% 74%, 96% 70%, 97% 66%, 98% 61%, 98% 57%, 98% 52%, 98% 47%, 97% 42%, 96% 37%, 95% 32%, 93% 28%, 91% 23%, 88% 20%, 85% 17%, 82% 14%, 78% 12%, 73% 10%, 68% 9%, 63% 9%, 59% 9%, 54% 10%, 49% 12%, 45% 13%, 40% 15%, 36% 18%, 32% 20%, 28% 22%, 24% 25%, 20% 28%, 16% 31%, 13% 34%, 10% 37%, 8% 41%, 6% 45%, 5% 49%)'

export function titleHeroLeftBlobPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Title Hero\nLeft Blob'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || heading.length > 15

  const titleStartY = isMultiLine ? 340 : 390
  const subtitleY = isMultiLine ? 540 : 510

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="160" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <clipPath id="blobPreviewMask">
        <path d="M 1005 529 C 1005 658, 1104 759, 1266 802 C 1410 838, 1590 831, 1716 774 C 1806 730, 1842 630, 1842 514 C 1842 385, 1788 270, 1662 226 C 1518 176, 1365 226, 1248 284 C 1122 342, 1005 414, 1005 529 Z" />
      </clipPath>
      <linearGradient id="blobSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="blobHillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="blobHillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
      <radialGradient id="previewOrbTopGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#EDE9FE" />
        <stop offset="35%" stop-color="#A78BFA" />
        <stop offset="85%" stop-color="#7C3AED" />
        <stop offset="100%" stop-color="#6D28D9" />
      </radialGradient>
      <radialGradient id="previewOrbBotGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#F5F3FF" />
        <stop offset="40%" stop-color="#C084FC" />
        <stop offset="85%" stop-color="#9333EA" />
        <stop offset="100%" stop-color="#7E22CE" />
      </radialGradient>
      <filter id="previewOrbShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#7C3AED" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- Clean white canvas -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Top-left subtle soft corner blob -->
    <path d="M -60 -60 L 340 -60 C 320 80, 240 200, 130 240 C 20 270, -60 180, -60 -60 Z" fill="#EEF2FF" opacity="0.65" />

    <!-- Bottom-left subtle contour wave -->
    <path d="M -40 820 C 140 820, 160 1020, 420 1020 C 580 1020, 640 1080, 700 1140" fill="none" stroke="#DDD6FE" stroke-width="3" stroke-linecap="round" opacity="0.75" />

    <!-- Soft periwinkle/lavender aura blob sitting behind the hero blob -->
    <path d="M 975 520 C 975 670, 1085 790, 1265 835 C 1425 875, 1625 865, 1765 805 C 1865 755, 1910 645, 1910 515 C 1910 370, 1845 240, 1705 190 C 1545 135, 1375 195, 1245 260 C 1105 325, 975 405, 975 520 Z" fill="#E0E7FF" opacity="0.65" />

    <!-- 3 Playful radiant burst lines -->
    <line x1="995" y1="345" x2="1040" y2="360" stroke="#A5B4FC" stroke-width="8" stroke-linecap="round" />
    <line x1="1055" y1="290" x2="1085" y2="330" stroke="#A5B4FC" stroke-width="8" stroke-linecap="round" />
    <line x1="1120" y1="245" x2="1140" y2="295" stroke="#A5B4FC" stroke-width="8" stroke-linecap="round" />

    <!-- Main fluid blob shape filled with landscape placeholder -->
    <g clip-path="url(#blobPreviewMask)">
      <!-- Sky background -->
      <rect x="960" y="100" width="940" height="800" fill="url(#blobSkyGrad)" />

      <!-- Fluffy clouds -->
      <g fill="#FFFFFF" opacity="0.92">
        <ellipse cx="1190" cy="380" rx="90" ry="42" />
        <ellipse cx="1260" cy="380" rx="72" ry="36" />
        <ellipse cx="1120" cy="390" rx="55" ry="30" />
        <ellipse cx="1680" cy="340" rx="105" ry="48" />
        <ellipse cx="1750" cy="340" rx="80" ry="40" />
        <ellipse cx="1605" cy="348" rx="60" ry="34" />
      </g>

      <!-- Rolling green hills -->
      <path d="M 980 620 C 1160 550, 1320 600, 1480 570 C 1640 540, 1780 590, 1920 550 L 1920 900 L 980 900 Z" fill="url(#blobHillBackGrad)" />
      <path d="M 980 700 C 1140 640, 1300 680, 1460 640 C 1630 600, 1790 660, 1920 620 L 1920 900 L 980 900 Z" fill="url(#blobHillFrontGrad)" />
      <path d="M 980 780 C 1050 720, 1150 750, 1240 790 C 1320 830, 1400 810, 1480 780 C 1580 740, 1680 790, 1920 730 L 1920 900 L 980 900 Z" fill="#3D7A47" opacity="0.85" />
    </g>

    <!-- Top 3D glossy purple orb with highlight -->
    <circle cx="1200" cy="170" r="66" fill="url(#previewOrbTopGrad)" filter="url(#previewOrbShadow)" />
    <ellipse cx="1180" cy="148" rx="26" ry="14" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 1180 148)" />

    <!-- Bottom-right 3D glossy purple orb with highlight -->
    <circle cx="1860" cy="840" r="42" fill="url(#previewOrbBotGrad)" filter="url(#previewOrbShadow)" />
    <ellipse cx="1848" cy="828" rx="16" ry="9" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 1848 828)" />

    <!-- Main Title (left half) -->
    <text
      x="160"
      y="${titleStartY}"
      text-anchor="start"
      fill="#0F172A"
      font-size="56"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline (left half, positioned clearly below title) -->
    ${
      subtitle
        ? `<text
      x="160"
      y="${subtitleY}"
      text-anchor="start"
      fill="#64748B"
      font-size="26"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function buildTitleHeroLeftBlobCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Title Hero\nLeft Blob'
  const rawSubtitle = contentBySlotId.SUBTITLE || content.subtitle || content.subheading || 'Tagline or company name'
  const imageUrl =
    contentBySlotId.HERO_IMAGE__url ||
    contentBySlotId.HERO_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null

  const titleText = String(rawTitle).trim() || 'Title Hero\nLeft Blob'
  const subtitleText = String(rawSubtitle).trim() || 'Tagline or company name'

  // Dedicated decorative background artwork matching Reference Image 2
  const backgroundDecorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <clipPath id="heroFluidBlobMask" clipPathUnits="objectBoundingBox">
        <path d="M 0.05 0.54 C 0.05 0.72, 0.16 0.86, 0.34 0.92 C 0.50 0.97, 0.70 0.96, 0.84 0.88 C 0.94 0.82, 0.98 0.68, 0.98 0.52 C 0.98 0.34, 0.92 0.18, 0.78 0.12 C 0.62 0.05, 0.45 0.12, 0.32 0.20 C 0.18 0.28, 0.05 0.38, 0.05 0.54 Z" />
      </clipPath>
      <radialGradient id="heroOrbTopGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#EDE9FE" />
        <stop offset="35%" stop-color="#A78BFA" />
        <stop offset="85%" stop-color="#7C3AED" />
        <stop offset="100%" stop-color="#6D28D9" />
      </radialGradient>
      <radialGradient id="heroOrbBotGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#F5F3FF" />
        <stop offset="40%" stop-color="#C084FC" />
        <stop offset="85%" stop-color="#9333EA" />
        <stop offset="100%" stop-color="#7E22CE" />
      </radialGradient>
      <filter id="heroOrbShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#7C3AED" flood-opacity="0.28" />
      </filter>
    </defs>

    <!-- Top-left subtle soft corner blob -->
    <path d="M -60 -60 L 340 -60 C 320 80, 240 200, 130 240 C 20 270, -60 180, -60 -60 Z" fill="#EEF2FF" opacity="0.65" />

    <!-- Bottom-left subtle contour wave line -->
    <path d="M -40 820 C 140 820, 160 1020, 420 1020 C 580 1020, 640 1080, 700 1140" fill="none" stroke="#DDD6FE" stroke-width="3" stroke-linecap="round" opacity="0.75" />

    <!-- Soft periwinkle/lavender aura blob sitting behind the hero blob -->
    <path d="M 975 520 C 975 670, 1085 790, 1265 835 C 1425 875, 1625 865, 1765 805 C 1865 755, 1910 645, 1910 515 C 1910 370, 1845 240, 1705 190 C 1545 135, 1375 195, 1245 260 C 1105 325, 975 405, 975 520 Z" fill="#E0E7FF" opacity="0.65" />

    <!-- 3 Playful radiant burst lines -->
    <line x1="995" y1="345" x2="1040" y2="360" stroke="#A5B4FC" stroke-width="8" stroke-linecap="round" />
    <line x1="1055" y1="290" x2="1085" y2="330" stroke="#A5B4FC" stroke-width="8" stroke-linecap="round" />
    <line x1="1120" y1="245" x2="1140" y2="295" stroke="#A5B4FC" stroke-width="8" stroke-linecap="round" />

    <!-- Top 3D glossy purple orb with highlight -->
    <circle cx="1200" cy="170" r="66" fill="url(#heroOrbTopGrad)" filter="url(#heroOrbShadow)" />
    <ellipse cx="1180" cy="148" rx="26" ry="14" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 1180 148)" />

    <!-- Bottom-right 3D glossy purple orb with highlight -->
    <circle cx="1860" cy="840" r="42" fill="url(#heroOrbBotGrad)" filter="url(#heroOrbShadow)" />
    <ellipse cx="1848" cy="828" rx="16" ry="9" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 1848 828)" />
  </svg>`

  return [
    // 1. Background Graphic with Aura Blob, Corner Blob, Wave Line, 3D Orbs, and Radiant Burst Rays
    {
      id: 'slot-BLOB_GRAPHIC',
      slotId: 'BLOB_GRAPHIC',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: backgroundDecorSvg,
      },
    },
    // 2. Main Title Text (Safely positioned above subtitle, generous vertical height)
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: Math.round(290 * sy),
        width: Math.round(740 * sx),
        height: Math.round(210 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(56 * scale),
        fontWeight: 800,
        color: '#0F172A',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.15,
        wrap: 'pre-wrap',
      },
    },
    // 3. Subtitle Text (Positioned clearly beneath title with guaranteed 250px vertical clearance)
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: Math.round(540 * sy),
        width: Math.round(740 * sx),
        height: Math.round(100 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(26 * scale),
        fontWeight: 400,
        color: '#64748B',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        wrap: 'pre-wrap',
      },
    },
    // 4. Hero Image (Covering the smooth organic fluid blob shape directly)
    {
      id: 'slot-HERO_IMAGE',
      slotId: 'HERO_IMAGE',
      type: 'image',
      role: 'image',
      layer: 6,
      placement: {
        x: Math.round(960 * sx),
        y: Math.round(150 * sy),
        width: Math.round(900 * sx),
        height: Math.round(720 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
        clipPath: FLUID_BLOB_POLYGON,
        clipPathId: 'heroFluidBlobMask',
        imageMask: { type: 'blob', side: 'right' },
      },
    },
  ]
}

export function titleHeroLeftFadePreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Presentation\nTitle'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || heading.length > 15

  const titleStartY = isMultiLine ? 290 : 350
  const subtitleY = isMultiLine ? 570 : 530

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="160" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="leftFadeMaskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
        <stop offset="6%" stop-color="#FFFFFF" stop-opacity="0.04" />
        <stop offset="16%" stop-color="#FFFFFF" stop-opacity="0.32" />
        <stop offset="28%" stop-color="#FFFFFF" stop-opacity="0.80" />
        <stop offset="38%" stop-color="#FFFFFF" stop-opacity="1" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
      </linearGradient>
      <mask id="heroLeftFadeMask">
        <rect x="760" y="0" width="1160" height="1080" fill="url(#leftFadeMaskGrad)" />
      </mask>
      <linearGradient id="fadeSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="fadeHillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="fadeHillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>

    <!-- Clean canvas background -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Hero Image with left edge fade on the right half -->
    <g mask="url(#heroLeftFadeMask)">
      <!-- Sky background -->
      <rect x="760" y="0" width="1160" height="1080" fill="url(#fadeSkyGrad)" />

      <!-- Clouds matching reference image -->
      <g fill="#FFFFFF" opacity="0.95">
        <!-- Left cloud -->
        <ellipse cx="1060" cy="440" rx="140" ry="60" />
        <ellipse cx="1140" cy="440" rx="100" ry="50" />
        <ellipse cx="980" cy="450" rx="80" ry="42" />

        <!-- Right cloud -->
        <ellipse cx="1680" cy="330" rx="160" ry="70" />
        <ellipse cx="1780" cy="330" rx="120" ry="55" />
        <ellipse cx="1580" cy="340" rx="90" ry="48" />
      </g>

      <!-- Rolling green hills matching reference image -->
      <path d="M 760 700 C 1040 600, 1340 680, 1600 620 C 1760 580, 1860 610, 1920 600 L 1920 1080 L 760 1080 Z" fill="url(#fadeHillBackGrad)" />
      <path d="M 760 800 C 1020 710, 1280 780, 1560 720 C 1740 680, 1860 720, 1920 700 L 1920 1080 L 760 1080 Z" fill="url(#fadeHillFrontGrad)" />
    </g>

    <!-- Main Title (left half) -->
    <text
      x="160"
      y="${titleStartY}"
      text-anchor="start"
      fill="#0F172A"
      font-size="58"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline (left half) -->
    ${
      subtitle
        ? `<text
      x="160"
      y="${subtitleY}"
      text-anchor="start"
      fill="#64748B"
      font-size="26"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function buildTitleHeroLeftFadeCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Presentation\nTitle'
  const rawSubtitle = contentBySlotId.SUBTITLE || content.subtitle || content.subheading || 'Tagline or company name'
  const imageUrl =
    contentBySlotId.HERO_IMAGE__url ||
    contentBySlotId.HERO_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null

  const titleText = String(rawTitle).trim() || 'Presentation\nTitle'
  const subtitleText = String(rawSubtitle).trim() || 'Tagline or company name'

  const titleLines = titleText.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || titleText.length > 14

  // Safe vertical positioning so multi-line titles never overlap with the subtitle
  const titleY = isMultiLine ? Math.round(280 * sy) : Math.round(340 * sy)
  const titleH = isMultiLine ? Math.round(210 * sy) : Math.round(110 * sy)
  const subtitleY = isMultiLine ? Math.round(570 * sy) : Math.round(540 * sy)
  const subtitleH = Math.round(90 * sy)

  return [
    // 1. Hero Image bleeding full height on the right with smooth left edge fade
    {
      id: 'slot-HERO_IMAGE',
      slotId: 'HERO_IMAGE',
      type: 'image',
      role: 'image',
      layer: 2,
      placement: {
        x: Math.round(760 * sx),
        y: 0,
        width: Math.round(1160 * sx),
        height: canvasH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
        edgeFade: { side: 'left', width: 0.38 },
      },
    },
    // 2. Main Title on the left
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: titleY,
        width: Math.round(760 * sx),
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(56 * scale),
        fontWeight: 800,
        color: '#0F172A',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.15,
        wrap: 'pre-wrap',
      },
    },
    // 3. Subtitle on the left (clear margin below title start)
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: subtitleY,
        width: Math.round(760 * sx),
        height: subtitleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(26 * scale),
        fontWeight: 400,
        color: '#64748B',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        wrap: 'pre-wrap',
      },
    },
  ]
}

export function titleHeroRightOvalPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Title Hero\nRight Oval'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || heading.length > 15

  const titleStartY = isMultiLine ? 290 : 350
  const subtitleY = isMultiLine ? 570 : 530

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="160" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <clipPath id="ovalPreviewMask">
        <ellipse cx="1430" cy="540" rx="370" ry="440" />
      </clipPath>
      <linearGradient id="ovalSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="ovalHillBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="ovalHillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
      <radialGradient id="ovalOrbGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#EDE9FE" />
        <stop offset="35%" stop-color="#A78BFA" />
        <stop offset="85%" stop-color="#7C3AED" />
        <stop offset="100%" stop-color="#6D28D9" />
      </radialGradient>
      <filter id="ovalShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#4F46E5" flood-opacity="0.16" />
      </filter>
    </defs>

    <!-- Clean white canvas -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Top-left subtle soft corner blob -->
    <path d="M -60 -60 L 340 -60 C 320 80, 240 200, 130 240 C 20 270, -60 180, -60 -60 Z" fill="#EEF2FF" opacity="0.65" />

    <!-- Soft aura oval sitting behind hero image -->
    <ellipse cx="1430" cy="550" rx="395" ry="465" fill="#EEF2FF" opacity="0.75" />

    <!-- Concentric dashed accent ring -->
    <ellipse cx="1430" cy="540" rx="405" ry="475" fill="none" stroke="#DDD6FE" stroke-width="2" stroke-dasharray="8 6" opacity="0.70" />

    <!-- Floating accent droplets/orbs -->
    <circle cx="1030" cy="220" r="32" fill="url(#ovalOrbGrad)" opacity="0.85" />
    <circle cx="1840" cy="800" r="48" fill="#C7D2FE" opacity="0.75" />
    <circle cx="1810" cy="260" r="24" fill="#DDD6FE" opacity="0.90" />

    <!-- Main Standing Oval filled with Landscape Placeholder -->
    <g filter="url(#ovalShadow)">
      <g clip-path="url(#ovalPreviewMask)">
        <!-- Sky background -->
        <rect x="1060" y="100" width="740" height="880" fill="url(#ovalSkyGrad)" />

        <!-- Clouds -->
        <g fill="#FFFFFF" opacity="0.95">
          <ellipse cx="1320" cy="380" rx="90" ry="42" />
          <ellipse cx="1390" cy="380" rx="72" ry="36" />
          <ellipse cx="1250" cy="390" rx="55" ry="30" />
          <ellipse cx="1620" cy="340" rx="105" ry="48" />
          <ellipse cx="1690" cy="340" rx="80" ry="40" />
          <ellipse cx="1545" cy="348" rx="60" ry="34" />
        </g>

        <!-- Rolling green hills -->
        <path d="M 1060 680 C 1220 610, 1380 660, 1540 630 C 1680 600, 1750 630, 1800 620 L 1800 980 L 1060 980 Z" fill="url(#ovalHillBackGrad)" />
        <path d="M 1060 760 C 1200 700, 1360 740, 1520 700 C 1670 660, 1760 710, 1800 680 L 1800 980 L 1060 980 Z" fill="url(#ovalHillFrontGrad)" />
      </g>
    </g>

    <!-- Main Title (left half) -->
    <text
      x="160"
      y="${titleStartY}"
      text-anchor="start"
      fill="#0F172A"
      font-size="56"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline (left half) -->
    ${
      subtitle
        ? `<text
      x="160"
      y="${subtitleY}"
      text-anchor="start"
      fill="#64748B"
      font-size="26"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function buildTitleHeroRightOvalCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Title Hero\nRight Oval'
  const rawSubtitle = contentBySlotId.SUBTITLE || content.subtitle || content.subheading || 'Tagline or company name'
  const imageUrl =
    contentBySlotId.HERO_IMAGE__url ||
    contentBySlotId.HERO_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null

  const titleText = String(rawTitle).trim() || 'Title Hero\nRight Oval'
  const subtitleText = String(rawSubtitle).trim() || 'Tagline or company name'

  const titleLines = titleText.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || titleText.length > 14

  // Safe vertical positioning so multi-line titles never overlap with the subtitle
  const titleY = isMultiLine ? Math.round(280 * sy) : Math.round(340 * sy)
  const titleH = isMultiLine ? Math.round(210 * sy) : Math.round(110 * sy)
  const subtitleY = isMultiLine ? Math.round(570 * sy) : Math.round(540 * sy)
  const subtitleH = Math.round(90 * sy)

  const backgroundDecorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <!-- Top-left subtle soft corner blob -->
    <path d="M -60 -60 L 340 -60 C 320 80, 240 200, 130 240 C 20 270, -60 180, -60 -60 Z" fill="#EEF2FF" opacity="0.65" />

    <!-- Soft aura oval sitting behind hero image -->
    <ellipse cx="1430" cy="550" rx="395" ry="465" fill="#EEF2FF" opacity="0.75" />

    <!-- Concentric dashed accent ring -->
    <ellipse cx="1430" cy="540" rx="405" ry="475" fill="none" stroke="#DDD6FE" stroke-width="2" stroke-dasharray="8 6" opacity="0.70" />

    <!-- Floating accent droplets -->
    <circle cx="1030" cy="220" r="32" fill="#818CF8" opacity="0.80" />
    <circle cx="1840" cy="800" r="48" fill="#C7D2FE" opacity="0.75" />
    <circle cx="1810" cy="260" r="24" fill="#DDD6FE" opacity="0.90" />
  </svg>`

  return [
    // 1. Background Graphic with aura oval and concentric ring
    {
      id: 'slot-OVAL_GRAPHIC',
      slotId: 'OVAL_GRAPHIC',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: backgroundDecorSvg,
      },
    },
    // 2. Main Title on the left
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: titleY,
        width: Math.round(760 * sx),
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(56 * scale),
        fontWeight: 800,
        color: '#0F172A',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.15,
        wrap: 'pre-wrap',
      },
    },
    // 3. Subtitle on the left (clear 150px gap below title)
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: subtitleY,
        width: Math.round(760 * sx),
        height: subtitleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(26 * scale),
        fontWeight: 400,
        color: '#64748B',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        wrap: 'pre-wrap',
      },
    },
    // 4. Hero Image (Smooth standing oval frame on the right)
    {
      id: 'slot-HERO_IMAGE',
      slotId: 'HERO_IMAGE',
      type: 'image',
      role: 'image',
      layer: 6,
      placement: {
        x: Math.round(1060 * sx),
        y: Math.round(100 * sy),
        width: Math.round(740 * sx),
        height: Math.round(880 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
        borderRadius: 999,
        clipPath: 'ellipse(50% 50% at 50% 50%)',
        imageMask: { type: 'oval', side: 'right' },
      },
    },
  ]
}

export function titleHeroRightFadePreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Presentation\nTitle'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || heading.length > 15

  const titleStartY = isMultiLine ? 290 : 350
  const subtitleY = isMultiLine ? 570 : 530

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="1140" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="rightFadeMaskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
        <stop offset="52%" stop-color="#FFFFFF" stop-opacity="1" />
        <stop offset="68%" stop-color="#FFFFFF" stop-opacity="0.75" />
        <stop offset="80%" stop-color="#FFFFFF" stop-opacity="0.25" />
        <stop offset="92%" stop-color="#FFFFFF" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </linearGradient>
      <mask id="heroRightFadeMask">
        <rect x="0" y="0" width="1080" height="1080" fill="url(#rightFadeMaskGrad)" />
      </mask>
      <linearGradient id="fadeSkyGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="fadeHillBackGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="fadeHillFrontGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>

    <!-- Clean canvas background -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>

    <!-- Hero Image with right edge fade on the left half (mirror of left fade) -->
    <g mask="url(#heroRightFadeMask)">
      <!-- Sky background -->
      <rect x="0" y="0" width="1080" height="1080" fill="url(#fadeSkyGradRight)" />

      <!-- Clouds matching reference image, mirrored -->
      <g fill="#FFFFFF" opacity="0.95">
        <!-- Left clouds -->
        <ellipse cx="240" cy="330" rx="160" ry="70" />
        <ellipse cx="340" cy="330" rx="120" ry="55" />
        <ellipse cx="140" cy="340" rx="90" ry="48" />

        <!-- Right clouds -->
        <ellipse cx="660" cy="380" rx="130" ry="55" />
        <ellipse cx="730" cy="380" rx="90" ry="45" />
        <ellipse cx="590" cy="390" rx="70" ry="38" />
      </g>

      <!-- Rolling green hills matching reference image, mirrored -->
      <path d="M 0 600 C 60 610, 160 580, 320 620 C 580 680, 840 600, 1080 700 L 1080 1080 L 0 1080 Z" fill="url(#fadeHillBackGradRight)" />
      <path d="M 0 700 C 60 720, 180 680, 360 720 C 620 780, 860 710, 1080 800 L 1080 1080 L 0 1080 Z" fill="url(#fadeHillFrontGradRight)" />
    </g>

    <!-- Main Title (shifted right to clean white area) -->
    <text
      x="1140"
      y="${titleStartY}"
      text-anchor="start"
      fill="#0F172A"
      font-size="58"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline (shifted right to clean white area) -->
    ${
      subtitle
        ? `<text
      x="1140"
      y="${subtitleY}"
      text-anchor="start"
      fill="#64748B"
      font-size="26"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function buildTitleHeroRightFadeCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Presentation\nTitle'
  const rawSubtitle = contentBySlotId.SUBTITLE || content.subtitle || content.subheading || 'Tagline or company name'
  const imageUrl =
    contentBySlotId.HERO_IMAGE__url ||
    contentBySlotId.HERO_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null

  const titleText = String(rawTitle).trim() || 'Presentation\nTitle'
  const subtitleText = String(rawSubtitle).trim() || 'Tagline or company name'

  const titleLines = titleText.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || titleText.length > 14

  // Safe vertical positioning so multi-line titles never overlap with the subtitle
  const titleY = isMultiLine ? Math.round(280 * sy) : Math.round(340 * sy)
  const titleH = isMultiLine ? Math.round(210 * sy) : Math.round(110 * sy)
  const subtitleY = isMultiLine ? Math.round(570 * sy) : Math.round(540 * sy)
  const subtitleH = Math.round(90 * sy)

  return [
    // 1. Hero Image bleeding full height on the left with smooth right edge fade
    {
      id: 'slot-HERO_IMAGE',
      slotId: 'HERO_IMAGE',
      type: 'image',
      role: 'image',
      layer: 2,
      placement: {
        x: 0,
        y: 0,
        width: Math.round(1080 * sx),
        height: canvasH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
        edgeFade: { side: 'right', width: 0.38 },
      },
    },
    // 2. Main Title on the right (shifted to clean white area)
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(1140 * sx),
        y: titleY,
        width: Math.round(660 * sx),
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(56 * scale),
        fontWeight: 800,
        color: '#0F172A',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.15,
        wrap: 'pre-wrap',
      },
    },
    // 3. Subtitle on the right (shifted to clean white area, clear margin below title)
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(1140 * sx),
        y: subtitleY,
        width: Math.round(660 * sx),
        height: subtitleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(26 * scale),
        fontWeight: 400,
        color: '#64748B',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        wrap: 'pre-wrap',
      },
    },
  ]
}

export function buildTitleFullbleedScrimSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <radialGradient id="tfbVignette" cx="50%" cy="48%" r="72%">
        <stop offset="0%" stop-color="#020617" stop-opacity="0.18" />
        <stop offset="55%" stop-color="#020617" stop-opacity="0.34" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0.62" />
      </radialGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#tfbVignette)" />
    <rect x="908" y="612" width="104" height="3" rx="1.5" fill="#FFFFFF" fill-opacity="0.92" />
  </svg>`
}

export function titleFullbleedPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Presentation title'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(String(rawHeading || '').replace(/\s+/g, ' ').trim())
  const subtitle = escapeXml(rawSubtitle)
  const titleLines = heading.length > 24
    ? [heading.slice(0, heading.lastIndexOf(' ', 24) || 24).trim(), heading.slice(heading.lastIndexOf(' ', 24) || 24).trim()].filter(Boolean)
    : [heading]
  const titleTspans = titleLines
    .slice(0, 2)
    .map((line, idx) => `<tspan x="960" dy="${idx === 0 ? 0 : '1.12em'}">${line}</tspan>`)
    .join('')
  const isMulti = titleLines.length > 1
  const titleY = isMulti ? 470 : 520
  const subtitleY = isMulti ? 680 : 660

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="tfbEmptySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="tfbEmptyHillBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="tfbEmptyHillFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>

    <svg x="0" y="0" width="1920" height="1080" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill="url(#tfbEmptySky)" />
      <g fill="#FFFFFF" opacity="0.92">
        <ellipse cx="78" cy="48" rx="28" ry="14" />
        <ellipse cx="98" cy="48" rx="22" ry="12" />
        <ellipse cx="58" cy="50" rx="16" ry="10" />
        <ellipse cx="210" cy="36" rx="34" ry="16" />
        <ellipse cx="236" cy="36" rx="24" ry="13" />
        <ellipse cx="186" cy="38" rx="18" ry="11" />
      </g>
      <path d="M0 128 C40 108 78 118 112 126 C148 116 178 102 220 112 C252 120 280 128 320 118 L320 200 L0 200 Z" fill="url(#tfbEmptyHillBack)" />
      <path d="M0 152 C36 136 70 148 108 156 C150 144 190 130 236 142 C268 150 296 158 320 150 L320 200 L0 200 Z" fill="url(#tfbEmptyHillFront)" />
    </svg>

    ${buildTitleFullbleedScrimSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}

    <text
      x="960"
      y="${titleY}"
      text-anchor="middle"
      fill="#FFFFFF"
      font-size="64"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.03em"
    >${isMulti ? titleTspans : heading}</text>
    ${
      subtitle
        ? `<text
      x="960"
      y="${subtitleY}"
      text-anchor="middle"
      fill="#F1F5F9"
      font-size="24"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function buildTitleFullbleedOverlaySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none">
    <defs>
      <linearGradient id="tfoScrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020617" stop-opacity="0" />
        <stop offset="42%" stop-color="#020617" stop-opacity="0.08" />
        <stop offset="72%" stop-color="#020617" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0.86" />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#tfoScrim)" />
    <rect x="120" y="688" width="56" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.92" />
  </svg>`
}

export function titleFullbleedOverlayPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Title Fullbleed Overlay'
  const rawSubtitle = slots.SUBTITLE?.text || slots.SUBHEADING?.text || previewHints?.subheading || 'Tagline or company name'

  const heading = escapeXml(String(rawHeading || '').replace(/\s+/g, ' ').trim())
  const subtitle = escapeXml(rawSubtitle)
  const titleLines = heading.length > 26 ? [heading.slice(0, heading.lastIndexOf(' ', 26) || 26).trim(), heading.slice(heading.lastIndexOf(' ', 26) || 26).trim()].filter(Boolean) : [heading]
  const titleTspans = titleLines
    .slice(0, 2)
    .map((line, idx) => `<tspan x="120" dy="${idx === 0 ? 0 : '1.12em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="tfoEmptySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#B7D4E8" />
        <stop offset="55%" stop-color="#C5DCEB" />
        <stop offset="100%" stop-color="#D0E3EF" />
      </linearGradient>
      <linearGradient id="tfoEmptyHillBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8FBF8E" />
        <stop offset="100%" stop-color="#79AD78" />
      </linearGradient>
      <linearGradient id="tfoEmptyHillFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6FA56E" />
        <stop offset="100%" stop-color="#5E945D" />
      </linearGradient>
    </defs>

    <svg x="0" y="0" width="1920" height="1080" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill="url(#tfoEmptySky)" />
      <g fill="#FFFFFF" opacity="0.92">
        <ellipse cx="78" cy="48" rx="28" ry="14" />
        <ellipse cx="98" cy="48" rx="22" ry="12" />
        <ellipse cx="58" cy="50" rx="16" ry="10" />
        <ellipse cx="210" cy="36" rx="34" ry="16" />
        <ellipse cx="236" cy="36" rx="24" ry="13" />
        <ellipse cx="186" cy="38" rx="18" ry="11" />
      </g>
      <path d="M0 128 C40 108 78 118 112 126 C148 116 178 102 220 112 C252 120 280 128 320 118 L320 200 L0 200 Z" fill="url(#tfoEmptyHillBack)" />
      <path d="M0 152 C36 136 70 148 108 156 C150 144 190 130 236 142 C268 150 296 158 320 150 L320 200 L0 200 Z" fill="url(#tfoEmptyHillFront)" />
    </svg>

    ${buildTitleFullbleedOverlaySvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}

    <text
      x="120"
      y="780"
      text-anchor="start"
      fill="#FFFFFF"
      font-size="56"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.03em"
    >${titleLines.length > 1 ? titleTspans : heading}</text>
    ${
      subtitle
        ? `<text
      x="120"
      y="920"
      text-anchor="start"
      fill="#E2E8F0"
      font-size="24"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    >${subtitle}</text>`
        : ''
    }
  </svg>`
}

export function buildTitleFullbleedCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Presentation title'
  const rawSubtitle = contentBySlotId.SUBTITLE || content.subtitle || content.subheading || 'Tagline or company name'
  const imageUrl =
    contentBySlotId.BACKGROUND_IMAGE__url ||
    contentBySlotId.BACKGROUND_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null

  const titleText = String(rawTitle).trim() || 'Presentation title'
  const subtitleText = String(rawSubtitle).trim() || 'Tagline or company name'

  const titleLines = titleText.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || titleText.length > 22
  const titleY = isMultiLine ? Math.round(400 * sy) : Math.round(448 * sy)
  const titleH = isMultiLine ? Math.round(170 * sy) : Math.round(96 * sy)
  const subtitleY = isMultiLine ? Math.round(640 * sy) : Math.round(628 * sy)

  return [
    {
      id: 'slot-BACKGROUND_IMAGE',
      slotId: 'BACKGROUND_IMAGE',
      type: 'image',
      role: 'background',
      layer: 0,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
      },
    },
    {
      id: 'slot-OVERLAY_SCRIM',
      slotId: 'OVERLAY_SCRIM',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: buildTitleFullbleedScrimSvg(),
        preserveAspectRatio: 'none',
        colorMode: 'preserve',
      },
    },
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(180 * sx),
        y: titleY,
        width: Math.round(1560 * sx),
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(64 * scale),
        fontWeight: 800,
        color: '#FFFFFF',
        align: 'center',
        verticalAlign: 'flex-start',
        lineHeight: 1.12,
        wrap: 'pre-wrap',
        clipToSlot: true,
        maxLines: 2,
      },
    },
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(280 * sx),
        y: subtitleY,
        width: Math.round(1360 * sx),
        height: Math.round(80 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(24 * scale),
        fontWeight: 400,
        color: '#F1F5F9',
        align: 'center',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
        wrap: 'pre-wrap',
        clipToSlot: true,
        maxLines: 2,
      },
    },
  ]
}

export function buildTitleFullbleedOverlayCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Title Fullbleed\nOverlay'
  const rawSubtitle = contentBySlotId.SUBTITLE || content.subtitle || content.subheading || 'Tagline or company name'
  const imageUrl =
    contentBySlotId.BACKGROUND_IMAGE__url ||
    contentBySlotId.BACKGROUND_IMAGE_url ||
    content.imageUrl ||
    content.imageRef?.url ||
    null

  const titleText = String(rawTitle).trim() || 'Title Fullbleed Overlay'
  const subtitleText = String(rawSubtitle).trim() || 'Tagline or company name'

  const titleLines = titleText.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || titleText.length > 28
  const titleY = isMultiLine ? Math.round(680 * sy) : Math.round(720 * sy)
  const titleH = isMultiLine ? Math.round(150 * sy) : Math.round(90 * sy)
  const subtitleY = isMultiLine ? Math.round(860 * sy) : Math.round(840 * sy)

  return [
    {
      id: 'slot-BACKGROUND_IMAGE',
      slotId: 'BACKGROUND_IMAGE',
      type: 'image',
      role: 'background',
      layer: 0,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        ...(imageUrl ? { url: imageUrl, src: imageUrl } : {}),
        fit: 'cover',
        alt: '',
      },
    },
    {
      id: 'slot-OVERLAY_CARD',
      slotId: 'OVERLAY_CARD',
      type: 'graphic',
      role: 'decoration',
      layer: 2,
      placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
      content: {
        svg: buildTitleFullbleedOverlaySvg(),
        preserveAspectRatio: 'none',
        colorMode: 'preserve',
      },
    },
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: Math.round(120 * sx),
        y: titleY,
        width: Math.round(1480 * sx),
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(56 * scale),
        fontWeight: 800,
        color: '#FFFFFF',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.12,
        wrap: 'pre-wrap',
        clipToSlot: true,
        maxLines: 2,
      },
    },
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: Math.round(120 * sx),
        y: subtitleY,
        width: Math.round(1280 * sx),
        height: Math.round(80 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(24 * scale),
        fontWeight: 400,
        color: '#E2E8F0',
        align: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
        wrap: 'pre-wrap',
        clipToSlot: true,
        maxLines: 2,
      },
    },
  ]
}

export function isTitleWithLogoLayout(layoutId, schema = null) {
  const id = String(layoutId || schema?.layout_id || '').trim().toLowerCase()
  if (id === 'title_with_logo_v1' || id === 'title_with_logo_corner_v1' || id === 'title_with_logo_centered_v1') return true
  const previewMode = String(schema?.preview?.mode || '').toLowerCase()
  if (previewMode === 'title_with_logo') return true
  return false
}

export function titleWithLogoPreviewSvg(previewHints = {}, theme = {}) {
  const slots = previewHints?.slots || {}
  const rawHeading = slots.MAIN_TITLE?.text || slots.HEADING?.text || previewHints?.heading || 'Add your presentation title'
  const rawSubtitle =
    slots.SUBTITLE?.text ||
    slots.FOOTNOTE?.text ||
    slots.SUBHEADING?.text ||
    previewHints?.subheading ||
    'A comprehensive overview and strategic quarterly roadmap'
  const variant = String(previewHints?.slideVariant || previewHints?.variant || '').toLowerCase()
  const isCentered = variant === 'centered' || String(previewHints?.layout_id || '').includes('centered')

  const heading = escapeXml(rawHeading)
  const subtitle = escapeXml(rawSubtitle)

  const titleLines = heading.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || heading.length > 20

  const titleStartY = isCentered ? (isMultiLine ? 350 : 410) : (isMultiLine ? 310 : 370)
  const subtitleY = isCentered ? (isMultiLine ? 650 : 610) : (isMultiLine ? 630 : 590)

  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="${isCentered ? 960 : 160}" dy="${idx === 0 ? 0 : '1.18em'}">${line}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <!-- Subtle top-right ambient background glow -->
      <radialGradient id="titleLogoAmbient" cx="85%" cy="15%" r="65%">
        <stop offset="0%" stop-color="#EEF2FF" stop-opacity="0.8" />
        <stop offset="50%" stop-color="#F8FAFC" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <!-- Logo badge shadow -->
      <filter id="logoBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.06" />
      </filter>
    </defs>

    <!-- Clean white canvas with ambient glow -->
    <rect width="1920" height="1080" fill="#FFFFFF"/>
    <rect width="1920" height="1080" fill="url(#titleLogoAmbient)"/>

    <!-- Top Header: Logo Badge & Category Label -->
    ${
      isCentered
        ? `<!-- Centered Logo Badge -->
    <g transform="translate(850, 160)" filter="url(#logoBadgeShadow)">
      <rect x="0" y="0" width="220" height="60" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="14" y="12" width="36" height="36" rx="9" fill="#4F46E5" />
      <path d="M 32 18 L 38 30 L 32 42 L 26 30 Z" fill="#FFFFFF" opacity="0.95" />
      <circle cx="32" cy="30" r="3" fill="#C7D2FE" />
      <text x="64" y="36" fill="#1E293B" font-size="18" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letter-spacing="0.12em">LOGO</text>
    </g>`
        : `<!-- Left-aligned Logo Badge -->
    <g transform="translate(160, 120)" filter="url(#logoBadgeShadow)">
      <rect x="0" y="0" width="220" height="60" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="14" y="12" width="36" height="36" rx="9" fill="#4F46E5" />
      <path d="M 32 18 L 38 30 L 32 42 L 26 30 Z" fill="#FFFFFF" opacity="0.95" />
      <circle cx="32" cy="30" r="3" fill="#C7D2FE" />
      <text x="64" y="36" fill="#1E293B" font-size="18" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letter-spacing="0.12em">LOGO</text>
    </g>

    <!-- Top-Right Category Pill -->
    <g transform="translate(1560, 130)">
      <rect x="0" y="0" width="200" height="40" rx="20" fill="#F1F5F9" />
      <circle cx="20" cy="20" r="4" fill="#6366F1" />
      <text x="34" y="25" fill="#64748B" font-size="14" font-weight="700" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letter-spacing="0.06em">PRESENTATION</text>
    </g>`
    }

    <!-- Main Title -->
    <text
      x="${isCentered ? 960 : 160}"
      y="${titleStartY}"
      text-anchor="${isCentered ? 'middle' : 'start'}"
      fill="#0F172A"
      font-size="60"
      font-weight="800"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.025em"
    >${isMultiLine ? titleTspans : heading}</text>

    <!-- Subtitle / Tagline -->
    ${
      subtitle
        ? `<text
      x="${isCentered ? 960 : 160}"
      y="${subtitleY}"
      text-anchor="${isCentered ? 'middle' : 'start'}"
      fill="#64748B"
      font-size="26"
      font-weight="400"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      letter-spacing="-0.005em"
    >${subtitle}</text>`
        : ''
    }

    <!-- Bottom Executive Hairline Divider & Metadata -->
    <line x1="160" y1="920" x2="1760" y2="920" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="160" y="965" fill="#94A3B8" font-size="16" font-weight="500" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Executive Presentation</text>
    <text x="1760" y="965" text-anchor="end" fill="#94A3B8" font-size="16" font-weight="500" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Confidential · 2025</text>
  </svg>`
}

export function buildTitleWithLogoCanvasElements({ schema, options = {} }) {
  const canvasW = options.canvas?.width || 1920
  const canvasH = options.canvas?.height || 1080
  const sx = canvasW / 1920
  const sy = canvasH / 1080
  const scale = Math.min(sx, sy)

  const content = options.content || {}
  const contentBySlotId = options.contentBySlotId || {}
  const variant = String(schema?.variant || options.slideVariant || '').toLowerCase()
  const isCentered = variant === 'centered' || String(schema?.layout_id || '').includes('centered')

  const rawTitle = contentBySlotId.MAIN_TITLE || content.title || options.slideTitle || 'Add your presentation title'
  const rawSubtitle =
    contentBySlotId.SUBTITLE ||
    contentBySlotId.FOOTNOTE ||
    content.subtitle ||
    content.subheading ||
    'A comprehensive overview and strategic quarterly roadmap'
  const logoUrl =
    contentBySlotId.LOGO__url ||
    contentBySlotId.LOGO_url ||
    content.logoUrl ||
    content.imageUrl ||
    null

  const titleText = String(rawTitle).trim() || 'Add your presentation title'
  const subtitleText = String(rawSubtitle).trim() || 'A comprehensive overview and strategic quarterly roadmap'

  const titleLines = titleText.split(/\r?\n/).filter(Boolean)
  const isMultiLine = titleLines.length > 1 || titleText.length > 20

  const titleY = isCentered
    ? (isMultiLine ? Math.round(290 * sy) : Math.round(350 * sy))
    : (isMultiLine ? Math.round(260 * sy) : Math.round(320 * sy))
  const titleH = isMultiLine ? Math.round(200 * sy) : Math.round(110 * sy)

  const subtitleY = isCentered
    ? (isMultiLine ? Math.round(590 * sy) : Math.round(560 * sy))
    : (isMultiLine ? Math.round(570 * sy) : Math.round(540 * sy))
  const subtitleH = Math.round(90 * sy)

  const logoW = Math.round(240 * sx)
  const logoH = Math.round(62 * sy)
  const logoX = isCentered ? Math.round((canvasW - logoW) / 2) : Math.round(160 * sx)
  const logoY = isCentered ? Math.round(150 * sy) : Math.round(120 * sy)

  return [
    // 1. Logo Badge / Image Slot
    {
      id: 'slot-LOGO',
      slotId: 'LOGO',
      type: 'image',
      role: 'logo',
      layer: 5,
      placement: {
        x: logoX,
        y: logoY,
        width: logoW,
        height: logoH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        ...(logoUrl ? { url: logoUrl, src: logoUrl } : {}),
        fit: 'contain',
        alt: 'Company Logo',
      },
    },
    // 2. Main Title
    {
      id: 'slot-MAIN_TITLE',
      slotId: 'MAIN_TITLE',
      type: 'text',
      role: 'heading',
      layer: 10,
      placement: {
        x: isCentered ? Math.round(160 * sx) : Math.round(160 * sx),
        y: titleY,
        width: isCentered ? Math.round(1600 * sx) : Math.round(1400 * sx),
        height: titleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: titleText,
        fontSize: Math.round(60 * scale),
        fontWeight: 800,
        color: '#0F172A',
        align: isCentered ? 'center' : 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.14,
        wrap: 'pre-wrap',
      },
    },
    // 3. Subtitle / Footnote (Generous vertical separation so multi-line title never collides)
    {
      id: 'slot-SUBTITLE',
      slotId: 'SUBTITLE',
      type: 'text',
      role: 'subheading',
      layer: 10,
      placement: {
        x: isCentered ? Math.round(240 * sx) : Math.round(160 * sx),
        y: subtitleY,
        width: isCentered ? Math.round(1440 * sx) : Math.round(1200 * sx),
        height: subtitleH,
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: subtitleText,
        fontSize: Math.round(26 * scale),
        fontWeight: 400,
        color: '#64748B',
        align: isCentered ? 'center' : 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.45,
        wrap: 'pre-wrap',
      },
    },
    // 4. Subtle Executive Divider Line at the bottom
    {
      id: 'slot-DIVIDER',
      slotId: 'DIVIDER',
      type: 'shape',
      role: 'divider',
      layer: 2,
      placement: {
        x: Math.round(160 * sx),
        y: Math.round(920 * sy),
        width: Math.round(1600 * sx),
        height: Math.max(1, Math.round(2 * sy)),
        rotation: 0,
        opacity: 0.75,
      },
      content: {
        shape: 'rect',
        fill: '#E2E8F0',
      },
    },
    // 5. Metadata Footer
    {
      id: 'slot-FOOTNOTE',
      slotId: 'FOOTNOTE',
      type: 'text',
      role: 'caption',
      layer: 10,
      placement: {
        x: Math.round(160 * sx),
        y: Math.round(945 * sy),
        width: Math.round(1600 * sx),
        height: Math.round(40 * sy),
        rotation: 0,
        opacity: 1,
      },
      content: {
        text: 'Executive Presentation · Confidential',
        fontSize: Math.round(16 * scale),
        fontWeight: 500,
        color: '#94A3B8',
        align: isCentered ? 'center' : 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
      },
    },
  ]
}






