/**
 * Para Landscape Image Bottom Layout
 * 
 * Structure:
 * - Eyebrow text at top
 * - Main heading
 * - Body paragraph
 * - Wide landscape image at bottom with rounded corners
 */

export function isParaLandscapeImageBottomLayout(layoutId, schema) {
  const id = String(layoutId || schema?.layout_id || schema?.variant || '').trim()
  return id === 'para_landscape_image_bottom' || id === 'para_landscape_bottom' || id === 'para_landscape_image_bottom_v1'
}

/**
 * Geometry definitions on a 1920×1080 canvas
 */
export function paraLandscapeImageBottomGeom(canvasW = 1920, canvasH = 1080) {
  const sx = canvasW / 1920
  const sy = canvasH / 1080

  const contentX = Math.round(80 * sx)
  const contentW = Math.round(1760 * sx)

  // Eyebrow at top with line - extra wide to fit full "OUR APPROACH"
  const eyebrowY = Math.round(80 * sy)
  const eyebrowW = Math.round(320 * sx)
  const eyebrowH = Math.round(28 * sy)

  const lineX = Math.round(contentX + 330 * sx)
  const lineY = Math.round(eyebrowY + 12 * sy)
  const lineW = Math.round(80 * sx)
  const lineH = Math.max(3, Math.round(3 * sy))

  // Heading - large and bold
  const headingY = Math.round(130 * sy)
  const headingH = Math.round(80 * sy)

  // Body paragraph - moved down more to avoid overlap
  const bodyY = Math.round(260 * sy)
  const bodyW = Math.round(1400 * sx)
  const bodyH = Math.round(70 * sy)

  // Landscape image at bottom - smaller height, moved down more
  const imgX = Math.round(80 * sx)
  const imgY = Math.round(400 * sy)
  const imgW = Math.round(1760 * sx)
  const imgH = Math.round(560 * sy)

  // Decorative circles on right
  const circle1 = { cx: Math.round(1800 * sx), cy: Math.round(100 * sy), r: Math.round(40 * sx) }
  const circle2 = { cx: Math.round(1750 * sx), cy: Math.round(80 * sy), r: Math.round(25 * sx) }

  return {
    canvasW,
    canvasH,
    sx,
    sy,
    contentX,
    contentW,
    eyebrow: { x: contentX, y: eyebrowY, w: eyebrowW, h: eyebrowH },
    eyebrowLine: { x: lineX, y: lineY, w: lineW, h: lineH },
    heading: { x: contentX, y: headingY, w: contentW, h: headingH },
    body: { x: contentX, y: bodyY, w: bodyW, h: bodyH },
    image: { x: imgX, y: imgY, w: imgW, h: imgH },
    circle1,
    circle2,
  }
}

/**
 * Decorative SVG (eyebrow accent line + decorative circles)
 */
export function renderParaLandscapeDecorSvg(g, palette = {}) {
  const { canvasW: W, canvasH: H, eyebrowLine, circle1, circle2 } = g
  const accent = palette.accent || palette.primary || '#8B5CF6'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!-- Eyebrow accent line -->
  <rect x="${eyebrowLine.x}" y="${eyebrowLine.y}" width="${eyebrowLine.w}" height="${eyebrowLine.h}" rx="${eyebrowLine.h / 2}" fill="${accent}" opacity="0.85"/>
  
  <!-- Decorative circles on right -->
  <circle cx="${circle1.cx}" cy="${circle1.cy}" r="${circle1.r}" fill="${accent}" opacity="0.15"/>
  <circle cx="${circle2.cx}" cy="${circle2.cy}" r="${circle2.r}" fill="${accent}" opacity="0.25"/>
</svg>`
}

/**
 * Enhanced landscape image placeholder with detailed scenery
 */
const landscapeImagePlaceholderSvg = (w, h) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="plibSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#A5D8FF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#D0EBFF;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="plibHillGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#8CE99A;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#69DB7C;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="plibHillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#51CF66;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#37B24D;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="plibHillGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#2F9E44;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#2B8A3E;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Sky -->
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#plibSkyGrad)"/>
    
    <!-- Large fluffy clouds -->
    <g opacity="0.95">
      <ellipse cx="${w * 0.15}" cy="${h * 0.22}" rx="${w * 0.14}" ry="${h * 0.14}" fill="white"/>
      <ellipse cx="${w * 0.21}" cy="${h * 0.2}" rx="${w * 0.11}" ry="${h * 0.11}" fill="white"/>
      <ellipse cx="${w * 0.18}" cy="${h * 0.26}" rx="${w * 0.09}" ry="${h * 0.09}" fill="white"/>
      <ellipse cx="${w * 0.12}" cy="${h * 0.25}" rx="${w * 0.08}" ry="${h * 0.08}" fill="white"/>
    </g>
    <g opacity="0.9">
      <ellipse cx="${w * 0.78}" cy="${h * 0.18}" rx="${w * 0.12}" ry="${h * 0.12}" fill="white"/>
      <ellipse cx="${w * 0.83}" cy="${h * 0.16}" rx="${w * 0.1}" ry="${h * 0.1}" fill="white"/>
      <ellipse cx="${w * 0.8}" cy="${h * 0.22}" rx="${w * 0.08}" ry="${h * 0.08}" fill="white"/>
    </g>
    
    <!-- Background trees/bushes (left side) -->
    <ellipse cx="${w * 0.08}" cy="${h * 0.58}" rx="${w * 0.04}" ry="${h * 0.12}" fill="#40C057" opacity="0.6"/>
    <ellipse cx="${w * 0.12}" cy="${h * 0.6}" rx="${w * 0.035}" ry="${h * 0.1}" fill="#2F9E44" opacity="0.7"/>
    
    <!-- Background trees/bushes (right side) -->
    <ellipse cx="${w * 0.92}" cy="${h * 0.6}" rx="${w * 0.045}" ry="${h * 0.13}" fill="#40C057" opacity="0.6"/>
    <ellipse cx="${w * 0.88}" cy="${h * 0.62}" rx="${w * 0.04}" ry="${h * 0.11}" fill="#2F9E44" opacity="0.7"/>
    
    <!-- Distant hills -->
    <path d="M0 ${h * 0.52} Q${w * 0.15} ${h * 0.42} ${w * 0.3} ${h * 0.48} Q${w * 0.5} ${h * 0.44} ${w * 0.7} ${h * 0.5} Q${w * 0.85} ${h * 0.46} ${w} ${h * 0.52} L${w} ${h} L0 ${h} Z" fill="url(#plibHillGrad1)" opacity="0.7"/>
    
    <!-- Mid hills -->
    <path d="M0 ${h * 0.62} Q${w * 0.2} ${h * 0.52} ${w * 0.4} ${h * 0.58} Q${w * 0.6} ${h * 0.54} ${w * 0.8} ${h * 0.6} Q${w * 0.9} ${h * 0.57} ${w} ${h * 0.63} L${w} ${h} L0 ${h} Z" fill="url(#plibHillGrad2)"/>
    
    <!-- Foreground hills -->
    <path d="M0 ${h * 0.73} Q${w * 0.25} ${h * 0.65} ${w * 0.5} ${h * 0.7} Q${w * 0.75} ${h * 0.66} ${w} ${h * 0.74} L${w} ${h} L0 ${h} Z" fill="url(#plibHillGrad3)"/>
    
    <!-- Foreground vegetation (left) -->
    <g opacity="0.8">
      <!-- Left plant cluster -->
      <path d="M${w * 0.04} ${h} Q${w * 0.035} ${h * 0.88} ${w * 0.045} ${h * 0.82} Q${w * 0.05} ${h * 0.88} ${w * 0.06} ${h}" fill="#2B8A3E"/>
      <path d="M${w * 0.06} ${h} Q${w * 0.055} ${h * 0.9} ${w * 0.065} ${h * 0.85} Q${w * 0.07} ${h * 0.9} ${w * 0.08} ${h}" fill="#2F9E44"/>
      <ellipse cx="${w * 0.055}" cy="${h * 0.85}" rx="${w * 0.025}" ry="${h * 0.06}" fill="#37B24D"/>
    </g>
    
    <!-- Foreground vegetation (right) -->
    <g opacity="0.8">
      <!-- Right plant cluster -->
      <path d="M${w * 0.92} ${h} Q${w * 0.915} ${h * 0.86} ${w * 0.925} ${h * 0.8} Q${w * 0.93} ${h * 0.86} ${w * 0.94} ${h}" fill="#2B8A3E"/>
      <path d="M${w * 0.94} ${h} Q${w * 0.935} ${h * 0.88} ${w * 0.945} ${h * 0.83} Q${w * 0.95} ${h * 0.88} ${w * 0.96} ${h}" fill="#2F9E44"/>
      <ellipse cx="${w * 0.935}" cy="${h * 0.83}" rx="${w * 0.03}" ry="${h * 0.07}" fill="#37B24D"/>
      <ellipse cx="${w * 0.955}" cy="${h * 0.86}" rx="${w * 0.025}" ry="${h * 0.06}" fill="#40C057"/>
    </g>
  </svg>`
}

/**
 * Layout entry point
 */
export function layoutParaLandscapeImageBottom(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements

  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const g = paraLandscapeImageBottomGeom(canvasW, canvasH)

  const accent = palette.accent || palette.primary || '#8B5CF6'
  const textDark = '#1E293B'
  const textMuted = '#64748B'

  let headingEl = null
  let bodyEl = null
  let eyebrowEl = null
  let imageEl = null
  const otherEls = []

  elements.forEach((el) => {
    const slotId = String(el.slotId || '').toUpperCase()
    const role = String(el.role || '').toLowerCase()

    if (slotId === 'HEADING' || role === 'heading' || role === 'title') {
      headingEl = el
    } else if (slotId === 'BODY' || role === 'body' || role === 'paragraph') {
      bodyEl = el
    } else if (slotId === 'EYEBROW' || slotId === 'TRACKER' || slotId === 'CATEGORY' || role === 'subheading') {
      eyebrowEl = el
    } else if (slotId === 'IMAGE' || slotId === 'LANDSCAPE_IMAGE' || role === 'image') {
      imageEl = el
    } else if (slotId !== 'DECOR' && !String(el.id || '').includes('decor')) {
      otherEls.push(el)
    }
  })

  const out = []

  // 1. Decorative SVG layer (eyebrow line)
  out.push({
    id: 'shp-para-landscape-decor',
    type: 'graphic',
    layer: 1,
    role: 'decoration',
    slotId: 'DECOR',
    placement: { x: 0, y: 0, width: canvasW, height: canvasH, rotation: 0, opacity: 1 },
    content: {
      svg: renderParaLandscapeDecorSvg(g, palette),
      colorMode: 'preserve',
    },
  })

  // 2. Eyebrow Text Element - visible with accent color
  const eyebrowText = eyebrowEl?.content?.text || 'OUR APPROACH'
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
      fontSize: 14,
      fontWeight: 700,
      bold: true,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      align: 'left',
      verticalAlign: 'center',
      color: accent,
      colorRole: 'accent',
      wrap: 'nowrap',
      clipToSlot: true,
    },
  })

  // 3. Heading - large, bold, dark
  const headingText = headingEl?.content?.text || 'Describe this slide'
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
      fontSize: 60,
      fontWeight: 800,
      bold: true,
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 1.15,
      color: '#1E293B',
      wrap: 'normal',
      clipToSlot: true,
    },
  })

  // 4. Body paragraph - lighter, more subtle
  const bodyText =
    bodyEl?.content?.text ||
    'We help teams turn complex ideas into clear narratives that drive decisions and build momentum across the organization.'
  out.push({
    ...(bodyEl || {}),
    id: bodyEl?.id || 'slot-BODY',
    slotId: 'BODY',
    type: 'text',
    role: 'body',
    layer: 10,
    placement: {
      x: g.body.x,
      y: g.body.y,
      width: g.body.w,
      height: g.body.h,
      rotation: 0,
      opacity: 1,
    },
    content: {
      ...(bodyEl?.content || {}),
      text: bodyText,
      fontSize: 18,
      fontWeight: 400,
      align: 'left',
      verticalAlign: 'top',
      lineHeight: 1.5,
      color: '#9CA3AF',
      wrap: 'normal',
      clipToSlot: true,
    },
  })

  // 5. Landscape image at bottom - larger, more prominent
  const existingImgContent = imageEl?.content || {}
  const hasImage = !!(existingImgContent.url || existingImgContent.src)
  out.push({
    ...(imageEl || {}),
    id: imageEl?.id || 'slot-LANDSCAPE_IMAGE',
    slotId: 'LANDSCAPE_IMAGE',
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
      borderRadius: 20,
      ...(hasImage ? {} : {
        placeholderSvg: landscapeImagePlaceholderSvg(g.image.w, g.image.h),
      }),
    },
  })

  otherEls.forEach((el) => out.push(el))

  return out
}

/**
 * Preview SVG for template catalog
 */
export function paraLandscapeImageBottomPreviewSvg(previewHints = {}, theme = {}) {
  const accent = theme.accent || '#8B5CF6'
  const g = paraLandscapeImageBottomGeom(1920, 1080)
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <rect width="1920" height="1080" fill="#F8F9FC"/>
    
    <!-- Decorative elements -->
    <rect x="${g.eyebrowLine.x}" y="${g.eyebrowLine.y}" width="${g.eyebrowLine.w}" height="${g.eyebrowLine.h}" rx="${g.eyebrowLine.h / 2}" fill="${accent}" opacity="0.85"/>
    <circle cx="${g.circle1.cx}" cy="${g.circle1.cy}" r="${g.circle1.r}" fill="${accent}" opacity="0.15"/>
    <circle cx="${g.circle2.cx}" cy="${g.circle2.cy}" r="${g.circle2.r}" fill="${accent}" opacity="0.25"/>
    
    <!-- Eyebrow text -->
    <text x="80" y="98" fill="${accent}" font-size="14" font-weight="700" font-family="system-ui, sans-serif" letter-spacing="0.15em">OUR APPROACH</text>
    
    <!-- Heading - large and bold -->
    <text x="80" y="180" fill="#1E293B" font-size="60" font-weight="800" font-family="system-ui, sans-serif" letter-spacing="-0.01em">Describe this slide</text>
    
    <!-- Body text - lighter color, moved down more -->
    <text x="80" y="280" fill="#9CA3AF" font-size="18" font-weight="400" font-family="system-ui, sans-serif" line-height="1.5">
      <tspan x="80" dy="0">We help teams turn complex ideas into clear narratives that drive</tspan>
      <tspan x="80" dy="27">decisions and build momentum across the organization.</tspan>
    </text>
    
    <!-- Landscape image placeholder with rounded corners - smaller height -->
    <defs>
      <clipPath id="plibRoundedRect">
        <rect x="80" y="400" width="1760" height="560" rx="20" ry="20"/>
      </clipPath>
    </defs>
    <g clip-path="url(#plibRoundedRect)">
      ${landscapeImagePlaceholderSvg(1760, 560).replace(/^<svg[^>]*>/i, '').replace(/<\/svg>$/i, '')}
    </g>
  </svg>`
}
