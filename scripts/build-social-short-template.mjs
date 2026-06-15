import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/social_short_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/social-short-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

/** Snappy reel pacing — 7 × 8s ≈ 56s (trim scenes for shorter cuts). */
const DURATION = 8;
const W = 1280;
const H = 720;
const C = assets.colors;
const F = assets.theme.fonts;

const SAFE = {
  x: Math.round(W * 0.08),
  y: Math.round(H * 0.08),
};
SAFE.w = W - SAFE.x * 2;
SAFE.h = H - SAFE.y * 2;
SAFE.maxX = SAFE.x + SAFE.w;
SAFE.maxY = SAFE.y + SAFE.h;

const CONTENT = {
  x: SAFE.x + 24,
  y: SAFE.y + 16,
  w: SAFE.w - 48,
  h: SAFE.h - 32,
};
CONTENT.maxX = CONTENT.x + CONTENT.w;
CONTENT.maxY = CONTENT.y + CONTENT.h;

const PRESENTER = { name: assets.presenter?.name || 'Creator' };

const COPY = {
  hookLine: 'STOP\nSCROLLING',
  hookSub: '3 things that changed how we grow on social — in under a minute.',
  problemIntro: 'If you are still doing this, you are leaving reach on the table.',
  problemBullets: 'Posting without a hook\nNo clear CTA in the first 3 seconds\nRecycling the same layout every time',
  insightTitle: 'Here is what\nactually works',
  insightBody: 'Lead with motion, one idea per beat, and a single action at the end. Short-form content wins when every frame earns the next second of attention.',
  valueIntro: 'Steal this 3-part reel structure',
  proofStat: '3.2×',
  proofLabel: 'Higher save rate vs. landscape reposts',
  proofSub: 'Based on short-form tests across 12 campaigns',
  showTitle: 'Show the moment',
  showBody: 'Swap this clip for your product demo, testimonial, or before/after — keep it under 4 seconds of visual proof.',
  ctaTitle: 'Follow for\npart 2',
  ctaBody: 'Save this reel, share it with your team, and drop a comment if you want the full template pack.',
  ctaHandle: '@yourbrand',
  stepsIntro: 'Three quick actions to keep the series going — pick one and repeat it on your last frame.',
};

const AVATAR_STYLE_LIGHT = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.pink}`,
  boxShadow: `0 10px 28px ${C.glowPink}`,
};

const AVATAR_STYLE_DARK = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.cyan}`,
  boxShadow: `0 10px 28px ${C.glowCyan}`,
};

function avatarLayout(preset = 'br-mini') {
  const pad = 12;
  const layouts = {
    cover: {
      size: { width: 92, height: 112 },
      pos: { x: SAFE.maxX - 92 - pad, y: SAFE.maxY - 112 - pad },
      style: { ...AVATAR_STYLE_LIGHT, border: `3px solid ${C.cyan}` },
    },
    'br-mini': {
      size: { width: 88, height: 108 },
      pos: { x: SAFE.maxX - 88 - pad, y: SAFE.maxY - 108 - pad },
      style: AVATAR_STYLE_LIGHT,
    },
    'bl-mini': {
      size: { width: 88, height: 108 },
      pos: { x: SAFE.x + pad, y: SAFE.maxY - 108 - pad },
      style: AVATAR_STYLE_LIGHT,
    },
    'tr-mini': {
      size: { width: 84, height: 102 },
      pos: { x: SAFE.maxX - 84 - pad - 56, y: SAFE.y + pad },
      style: AVATAR_STYLE_LIGHT,
    },
    dark: {
      size: { width: 96, height: 116 },
      pos: { x: SAFE.maxX - 96 - pad, y: SAFE.maxY - 116 - pad },
      style: AVATAR_STYLE_DARK,
    },
  };
  return layouts[preset] || layouts['br-mini'];
}

const BACKGROUND_PRESETS = assets.backgrounds.map((bg) => ({
  id: bg.id,
  name: bg.name,
  type: bg.value.includes('gradient') ? 'gradient' : 'solid',
  value: bg.value,
}));

const TYPE = {
  eyebrow: { fontFamily: F.sans, fontWeight: '700', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.cyan },
  subheading: { fontFamily: F.sans, fontWeight: '700', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.pinkHot },
  display: { fontFamily: F.display, fontWeight: '800', color: C.ink, lineHeight: 0.95, fontSize: 56 },
  heading: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 32, lineHeight: 1.08 },
  body: { fontFamily: F.sans, fontWeight: '400', color: C.slate, lineHeight: 1.65, fontSize: 17 },
  bodyOnDark: { fontFamily: F.sans, fontWeight: '400', color: C.slate, lineHeight: 1.6, fontSize: 16 },
  label: { fontFamily: F.sans, fontWeight: '700', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted },
  stat: { fontFamily: F.display, fontWeight: '900', color: C.pink, fontSize: 96, lineHeight: 1 },
  cardTitle: { fontFamily: F.display, fontWeight: '700', fontSize: 20, color: C.inkDark },
  cardBody: { fontFamily: F.sans, fontWeight: '400', fontSize: 15, color: C.slate, lineHeight: 1.55 },
};

const EDGE_DECOR = new Set(['social-glow-orb', 'social-slide-badge', 'social-scrim', 'social-arc-line', 'social-anchor-bubble', 'social-dot-grid', 'social-navy-panel']);

function shouldFitToSafeArea(clip) {
  if (clip.isBackground) return false;
  if (clip.type === 'avatar') return false;
  if (clip.role === 'scrim' || clip.role === 'background') return false;
  if (clip.shapeKey && EDGE_DECOR.has(clip.shapeKey)) return false;
  if (clip.type === 'image') {
    const w = clip.size?.width ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    const h = clip.size?.height ?? 0;
    if (x <= 4 && y <= 4 && w >= W * 0.92 && h >= H * 0.92) return false;
    return true;
  }
  if (clip.type === 'shape') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    if (w >= W * 0.95 && h >= H * 0.95) return false;
    if (clip.id?.startsWith('glow_')) return false;
    return w < CONTENT.w && h < CONTENT.h;
  }
  if (clip.type === 'text') return true;
  if (clip.role === 'icon' || clip.role === 'logo') return true;
  return clip.type !== 'shape';
}

function fitClipToSafeArea(clip) {
  if (!shouldFitToSafeArea(clip)) return clip;
  let x = clip.position?.x ?? 0;
  let y = clip.position?.y ?? 0;
  let w = clip.size?.width ?? 0;
  let h = clip.size?.height ?? 0;
  if (!w && !h) return clip;
  w = Math.min(w, CONTENT.w);
  h = Math.min(h, CONTENT.h);
  x = Math.max(CONTENT.x, Math.min(x, CONTENT.maxX - w));
  y = Math.max(CONTENT.y, Math.min(y, CONTENT.maxY - h));
  return {
    ...clip,
    position: { x: Math.round(x), y: Math.round(y) },
    size: { width: Math.round(w), height: Math.round(h) },
  };
}

function enforceSafeArea(scene) {
  scene.clips = scene.clips.map(fitClipToSafeArea);
  if (scene.zones?.avatar) {
    const zone = avatarLayout(scene._avatarPreset || 'br-mini');
    scene.zones.avatar = {
      ...scene.zones.avatar,
      x: zone.pos.x,
      y: zone.pos.y,
      width: zone.size.width,
      height: zone.size.height,
    };
  }
  return scene;
}

function buildSceneBackground(bgId = 'bg-void') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  const value = bg?.value || C.void;
  return {
    type: value.includes('gradient') ? 'gradient' : 'solid',
    value,
    editable: true,
    modes: ['solid', 'gradient', 'image'],
  };
}

function applyBackgroundConfig(scene) {
  scene.backgroundConfig = {
    editable: true,
    modes: ['solid', 'gradient', 'image'],
    presets: BACKGROUND_PRESETS,
    hint: 'Swap preset colors, custom swatches, or full-bleed photos. Delete a hero image to reveal the panel color behind it.',
  };
  return scene;
}

function shape(id, layer, x, y, w, h, style, role = 'decoration', shapeKey = null) {
  return {
    id, type: 'shape', role, shapeKey, editable: true, layer,
    position: { x, y }, size: { width: w, height: h },
    startTime: 0, endTime: DURATION, style,
  };
}

function text(id, layer, x, y, w, h, content, style, role = 'body-text') {
  return { id, type: 'text', role, editable: true, layer, position: { x, y }, size: { width: w, height: h }, startTime: 0, endTime: DURATION, content, style };
}

function optimizeImageUrl(url, maxWidth = 1080) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('pexels.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('auto', 'compress');
    u.searchParams.set('cs', 'tinysrgb');
    u.searchParams.set('w', String(maxWidth));
    return u.toString();
  } catch {
    return url;
  }
}

function image(id, layer, x, y, w, h, assetId, extra = {}) {
  const asset = assets.images.find((item) => item.id === assetId);
  const src = optimizeImageUrl(asset?.src);
  return {
    id, type: 'image', assetKey: assetId,
    role: extra.role || asset?.role || 'hero-image',
    editable: true, layer,
    position: { x, y }, size: { width: w, height: h },
    startTime: 0, endTime: DURATION,
    src, placeholder: true, alt: extra.alt || asset?.name || '', style: extra.style,
    ...(extra.isBackground ? { isBackground: true } : {}),
    ...(extra.swappableBackground ? { swappableBackground: extra.swappableBackground } : {}),
  };
}

function heroImage(id, layer, x, y, w, h, assetId, colorFallback, extra = {}) {
  const shapeStyle = {
    backgroundColor: colorFallback,
    borderRadius: extra.style?.borderRadius || '20px',
    ...(extra.style?.boxShadow ? { boxShadow: extra.style.boxShadow } : {}),
  };
  return [
    shape(`${id}_color`, layer, x, y, w, h, shapeStyle, 'hero-color-fallback', 'social-card-dark'),
    image(id, layer + 1, x, y, w, h, assetId, {
      ...extra,
      swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
    }),
  ];
}

function iconBadge(id, layer, x, y, size, iconAssetId, bg = C.ice, round = false) {
  const pad = Math.round(size * 0.2);
  const iconAsset = assets.icons.find((item) => item.id === iconAssetId);
  const isTransparent = bg === 'transparent';
  return [
    ...(isTransparent ? [] : [
      shape(`${id}_bg`, layer, x, y, size, size, {
        backgroundColor: bg,
        borderRadius: round ? '50%' : '14px',
        border: isTransparent ? 'none' : `1px solid rgba(15,23,42,0.08)`,
        boxShadow: isTransparent ? 'none' : '0 8px 20px rgba(15,23,42,0.1)',
      }, 'decoration', 'social-card-white'),
    ]),
    {
      id, type: 'image', assetKey: iconAssetId, role: 'icon', editable: true, layer: layer + 1,
      position: { x: x + pad, y: y + pad }, size: { width: size - pad * 2, height: size - pad * 2 },
      startTime: 0, endTime: DURATION,
      src: iconAsset?.src, placeholder: true, alt: iconAsset?.name || '',
      style: { objectFit: 'contain', backgroundColor: 'transparent' },
    },
  ];
}

function slideBadge(layer, num) {
  const size = 44;
  const x = CONTENT.maxX - size;
  const y = CONTENT.y + 4;
  return [
    shape(`slide_badge_${num}`, layer, x, y, size, size, { backgroundColor: C.panel, borderRadius: '50%', border: `2px solid ${C.pink}` }, 'decoration', 'social-slide-badge'),
    text(`slide_num_${num}`, layer + 1, x, y + 9, size, 26, num, { ...TYPE.stat, fontSize: 16, color: C.pinkHot, textAlign: 'center' }),
  ];
}

function neonGlow(id, layer, x, y, size, color) {
  return shape(id, layer, x, y, size, size, { background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, borderRadius: '50%' }, 'decoration', 'social-glow-orb');
}

/** Sales-Demo-style feature card — number badge, thumbnail, title, body */
function structureFeatureCard(id, layer, x, y, w, h, num, thumbAsset, title, body, accent, iconId) {
  const thumbH = 128;
  return [
    shape(`${id}_card`, layer, x, y, w, h, {
      backgroundColor: C.ice,
      borderRadius: '22px',
      boxShadow: '0 18px 44px rgba(15,23,42,0.14)',
      borderTop: `5px solid ${accent}`,
    }, 'decoration', 'social-card-white'),
    shape(`${id}_num`, layer + 1, x + 20, y + 18, 40, 40, { backgroundColor: accent, borderRadius: '12px' }),
    text(`${id}_numt`, layer + 2, x + 20, y + 26, 40, 28, num, { ...TYPE.stat, fontSize: 16, color: C.white, textAlign: 'center' }),
    ...heroImage(`${id}_thumb`, layer + 3, x + 16, y + 68, w - 32, thumbH, thumbAsset, C.panel, {
      style: { borderRadius: '14px', objectFit: 'cover' },
      alt: title,
    }),
    ...iconBadge(`${id}_ico`, layer + 5, x + w - 56, y + 76, 36, iconId, C.white),
    text(`${id}_title`, layer + 6, x + 20, y + 68 + thumbH + 14, w - 40, 40, title, { ...TYPE.cardTitle, fontSize: 19 }),
    text(`${id}_body`, layer + 7, x + 20, y + 68 + thumbH + 56, w - 40, h - thumbH - 88, body, { ...TYPE.cardBody, fontSize: 14 }),
  ];
}

function infoCard(id, layer, x, y, w, h, barColor, title, body) {
  return [
    shape(`${id}_bg`, layer, x, y, w, h, { backgroundColor: C.ice, borderRadius: '16px', boxShadow: '0 14px 36px rgba(15,23,42,0.12)' }, 'decoration', 'social-card-white'),
    shape(`${id}_bar`, layer + 1, x, y + 14, 5, h - 28, { backgroundColor: barColor, borderRadius: '4px' }),
    text(`${id}_title`, layer + 2, x + 22, y + 18, w - 34, 32, title, { ...TYPE.cardTitle, fontSize: 18 }),
    text(`${id}_body`, layer + 3, x + 22, y + 52, w - 34, h - 68, body, { ...TYPE.cardBody, fontSize: 14 }),
  ];
}

function painColumn(id, layer, x, y, w, h, num, title, body, accent) {
  return [
    shape(`${id}_card`, layer, x, y, w, h, { backgroundColor: C.ice, borderRadius: '18px', boxShadow: '0 14px 36px rgba(15,23,42,0.12)' }, 'decoration', 'social-card-white'),
    shape(`${id}_num`, layer + 1, x + 20, y + 18, 40, 40, { backgroundColor: accent, borderRadius: '12px' }),
    text(`${id}_numt`, layer + 2, x + 20, y + 26, 40, 28, num, { ...TYPE.stat, fontSize: 15, color: C.white, textAlign: 'center' }),
    text(`${id}_title`, layer + 3, x + 20, y + 68, w - 40, 32, title, { ...TYPE.cardTitle, fontSize: 18, color: C.inkDark }),
    text(`${id}_body`, layer + 4, x + 20, y + 102, w - 40, h - 118, body, { ...TYPE.cardBody, fontSize: 14, color: C.slate }),
  ];
}

/** Decorative corner arcs — reference slide texture */
function cornerArcs(layer = 1) {
  return [
    shape('arc_tl', layer, -40, -40, 200, 200, { border: '2px solid rgba(255,255,255,0.12)', borderRadius: '50%', backgroundColor: 'transparent' }, 'decoration', 'social-arc-line'),
    shape('arc_bl', layer, -60, H - 140, 220, 220, { border: '2px solid rgba(255,255,255,0.08)', borderRadius: '50%', backgroundColor: 'transparent' }, 'decoration', 'social-arc-line'),
  ];
}

function dotGrid(layer = 2, startX = SAFE.x + 8, startY = SAFE.y + 8, rows = 3, cols = 5) {
  const clips = [];
  const dot = 7;
  const gap = 13;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      clips.push(shape(`dot_${row}_${col}_${startX}`, layer, startX + col * gap, startY + row * gap, dot, dot, {
        backgroundColor: 'rgba(34,211,238,0.4)',
        borderRadius: '50%',
        opacity: 0.55,
      }, 'decoration', 'social-dot-grid'));
    }
  }
  return clips;
}

function neonDots(layer = 2) {
  return [
    shape('dot_pink', layer, SAFE.maxX - 48, SAFE.y + 12, 18, 18, { backgroundColor: C.pink, borderRadius: '50%', opacity: 0.85 }),
    shape('dot_cyan', layer, SAFE.x + 56, SAFE.maxY - 28, 14, 14, { backgroundColor: C.cyan, borderRadius: '50%', opacity: 0.7 }),
    shape('dot_gold', layer, SAFE.maxX - 120, SAFE.maxY - 20, 12, 12, { backgroundColor: C.gold, borderRadius: '50%', opacity: 0.8 }),
  ];
}

/** Hero icon cluster for problem / hook scenes */
function hookIconCluster(id, layer, x, y, size = 148) {
  const inner = Math.round(size * 0.7);
  return [
    shape(`${id}_ring`, layer, x, y, size, size, {
      backgroundColor: C.ice,
      borderRadius: '50%',
      border: `5px solid ${C.pink}`,
      boxShadow: `0 16px 40px ${C.glowPink}`,
    }, 'decoration', 'social-card-white'),
    shape(`${id}_plate`, layer + 1, x + Math.round((size - inner) / 2), y + Math.round(size * 0.2), inner, Math.round(size * 0.36), {
      backgroundColor: C.gold,
      borderRadius: '14px',
    }),
    ...iconBadge(`${id}_ico`, layer + 2, x + Math.round(size * 0.3), y + Math.round(size * 0.24), Math.round(size * 0.4), 'alert', 'transparent'),
  ];
}

/** White pill title bar with icon — Overview-style */
function titlePill(id, layer, x, y, w, iconId, label, titleColor = C.inkDark) {
  const pillH = 72;
  const iconSize = 52;
  return [
    shape(`${id}_pill`, layer, x, y, w, pillH, {
      backgroundColor: C.ice,
      borderRadius: '100px',
      boxShadow: '0 14px 36px rgba(15,23,42,0.16)',
    }, 'decoration', 'social-title-pill'),
    ...iconBadge(`${id}_ico`, layer + 1, x + 10, y + 10, iconSize, iconId, C.white),
    text(`${id}_label`, layer + 2, x + iconSize + 22, y + 18, w - iconSize - 36, 40, label, {
      ...TYPE.heading,
      fontSize: 26,
      color: titleColor,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }),
  ];
}

/** Large white anchor card — SWOT speech-bubble style */
function anchorBubble(id, layer, x, y, w, h, title, subtitle = '') {
  return [
    shape(`${id}_bubble`, layer, x, y, w, h, {
      backgroundColor: C.ice,
      borderRadius: '36px 36px 36px 14px',
      boxShadow: '0 22px 52px rgba(15,23,42,0.2)',
    }, 'decoration', 'social-anchor-bubble'),
    ...iconBadge(`${id}_spark`, layer + 1, x + 24, y + 20, 36, 'sparkles', C.white),
    text(`${id}_title`, layer + 2, x + 24, y + 72, w - 48, h - (subtitle ? 120 : 96), title, {
      ...TYPE.display,
      fontSize: 38,
      color: C.inkDark,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
    }),
    ...(subtitle ? [text(`${id}_sub`, layer + 3, x + 24, y + h - 52, w - 48, 36, subtitle, { ...TYPE.body, fontSize: 14, color: C.muted })] : []),
    shape(`${id}_edit_bg`, layer + 1, x + w - 60, y + h - 60, 44, 44, { backgroundColor: C.violet, borderRadius: '14px', boxShadow: '0 8px 20px rgba(139,92,246,0.35)' }),
    ...iconBadge(`${id}_edit`, layer + 2, x + w - 60, y + h - 60, 44, 'edit', 'transparent'),
  ];
}

/** Vertical framework row — SWOT letter + title + body */
function frameworkRow(id, layer, x, y, w, letter, title, body, accent = C.pink) {
  const rowH = 108;
  return [
    text(`${id}_letter`, layer, x, y + 4, 48, 44, letter, { ...TYPE.stat, fontSize: 36, color: C.white }),
    text(`${id}_title`, layer + 1, x + 52, y, w - 60, 28, title, { ...TYPE.heading, fontSize: 20, color: C.white, textTransform: 'none', letterSpacing: '0' }),
    text(`${id}_body`, layer + 2, x + 52, y + 32, w - 60, 68, body, { ...TYPE.bodyOnDark, fontSize: 14, lineHeight: 1.55, color: 'rgba(241,245,249,0.82)' }),
    shape(`${id}_rule`, layer, x + 52, y + rowH - 8, w - 60, 1, { backgroundColor: C.lineLight }),
  ];
}

function metaPill(id, layer, x, y, w, h, label, bg, color) {
  const pillH = h || 28;
  return [
    shape(`${id}_pill`, layer, x, y, w, pillH, { backgroundColor: bg, borderRadius: '100px' }),
    text(`${id}_txt`, layer + 1, x + 8, y + Math.round((pillH - 20) / 2), w - 16, 20, label, { ...TYPE.label, fontSize: 10, color, textTransform: 'none', letterSpacing: '0.06em', textAlign: 'center' }),
  ];
}

/** Sales-Demo-style action row — white card, number, icon, meta tag */
function actionStepRow(id, layer, x, y, w, step) {
  const rowH = 108;
  return [
    shape(`${id}_card`, layer, x, y, w, rowH, {
      backgroundColor: C.ice,
      borderRadius: '16px',
      boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
      border: '1px solid rgba(15,23,42,0.06)',
      borderLeft: `5px solid ${step.color}`,
    }, 'decoration', 'social-card-white'),
    shape(`${id}_num`, layer + 1, x + 18, y + 18, 40, 40, { backgroundColor: step.color, borderRadius: '12px' }),
    text(`${id}_numt`, layer + 2, x + 18, y + 26, 40, 28, step.num, { ...TYPE.stat, fontSize: 15, color: C.white, textAlign: 'center' }),
    ...iconBadge(`${id}_ico`, layer + 1, x + 72, y + 20, 40, step.icon, C.white),
    text(`${id}_title`, layer + 3, x + 122, y + 18, w - 134, 28, step.title, { ...TYPE.cardTitle, fontSize: 18 }),
    text(`${id}_body`, layer + 4, x + 122, y + 46, w - 134, 40, step.body, { ...TYPE.cardBody, fontSize: 13, lineHeight: 1.5 }),
    ...metaPill(`${id}_tag`, layer + 2, x + 122, y + 72, 108, 28, step.tag, step.tagBg, step.color),
  ];
}

function brandFooter(layer, x, y) {
  return [
    image('brand_logo', layer, x, y, 120, 32, 'social-logo', { style: { objectFit: 'contain' }, alt: 'Brand', role: 'logo' }),
    text('brand_name', layer + 1, x + 132, y + 6, 200, 24, 'Your Brand', { ...TYPE.label, fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'none', letterSpacing: '0.04em' }),
  ];
}

function avatarClip(layer = 60, preset = 'br-mini') {
  const layout = avatarLayout(preset);
  return {
    id: 'avatar_presenter',
    type: 'avatar',
    role: 'avatar',
    editable: true,
    layer,
    position: { ...layout.pos },
    size: { ...layout.size },
    startTime: 0,
    endTime: DURATION,
    placeholder: true,
    style: { ...layout.style },
  };
}

function finalizeScene(scene, bgId = 'bg-void', avatarPreset = 'br-mini') {
  scene._avatarPreset = avatarPreset;
  scene.background = buildSceneBackground(bgId);
  scene.canvasSize = { width: W, height: H };
  applyBackgroundConfig(scene);
  enforceSafeArea(scene);
  delete scene._avatarPreset;
  if (!scene.clips.some((clip) => clip.type === 'avatar')) {
    scene.clips.push(avatarClip(60, avatarPreset));
  }
  return scene;
}

function sceneBase(id, slideIndex, title, layoutType, description, flow, tags, zones, bgId = 'bg-void', avatarPreset = 'br-mini') {
  const avatarZone = avatarLayout(avatarPreset);
  return {
    id,
    slideIndex,
    title,
    layoutType,
    canvasSize: { width: W, height: H },
    avatarPosition: 'bottom-right',
    presenter: PRESENTER,
    background: buildSceneBackground(bgId),
    zones: {
      ...zones,
      avatar: zones.avatar || {
        x: avatarZone.pos.x,
        y: avatarZone.pos.y,
        width: avatarZone.size.width,
        height: avatarZone.size.height,
      },
    },
    description,
    flow,
    duration: DURATION,
    tags: ['social-short', 'reel', 'short-form', ...tags],
    clips: [],
  };
}

// ─── 1: Hook — Overview-style split ────────────────────────────────────────
const HOOK_COPY_W = 520;
const hookImgX = CONTENT.x + HOOK_COPY_W + 40;
const hookImgW = CONTENT.maxX - hookImgX;
const scene01 = sceneBase('ss_scene_01', 1, 'Scroll-Stopping Hook', 'Cover', 'Professional overview split — title pill left, hero visual right.', 'Hook → Problem', ['hook', 'opener'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: HOOK_COPY_W, height: CONTENT.h },
  image: { x: hookImgX, y: CONTENT.y, width: hookImgW, height: CONTENT.h },
}, 'bg-gradient-navy', 'cover');
scene01.clips = [
  shape('bg01', 0, 0, 0, W, H, { background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 55%, #312E81 100%)` }),
  ...cornerArcs(1),
  ...dotGrid(2, SAFE.x + 10, SAFE.y + 10, 3, 4),
  ...neonDots(2),
  neonGlow('glow_tl', 2, -20, -30, 200, C.glowPink),
  neonGlow('glow_br', 2, W - 160, H - 180, 180, C.glowCyan),
  shape('accent_bar', 3, CONTENT.x, CONTENT.y + 100, 6, 180, { background: `linear-gradient(180deg, ${C.pink} 0%, ${C.cyan} 100%)`, borderRadius: '4px' }),
  image('img_logo', 10, CONTENT.x + 20, CONTENT.y + 8, 160, 40, 'social-logo', { style: { objectFit: 'contain' }, alt: 'Brand', role: 'logo' }),
  text('t_label', 11, CONTENT.x + 20, CONTENT.y + 56, 320, 22, 'SHORT-FORM SERIES', { ...TYPE.subheading, color: C.cyan }),
  ...titlePill('hook_pill', 8, CONTENT.x + 20, CONTENT.y + 84, 320, 'bolt', 'HOOK'),
  text('t_hook', 12, CONTENT.x + 20, CONTENT.y + 176, HOOK_COPY_W - 36, 120, COPY.hookLine, { ...TYPE.display, fontSize: 50, color: C.white, lineHeight: 1.02, letterSpacing: '-0.03em' }),
  text('t_body', 13, CONTENT.x + 20, CONTENT.y + 304, HOOK_COPY_W - 36, 100, COPY.hookSub, { ...TYPE.bodyOnDark, fontSize: 16, lineHeight: 1.65, color: 'rgba(241,245,249,0.88)' }),
  ...metaPill('watch_pill', 5, CONTENT.x + 20, CONTENT.y + 416, 200, 32, 'WATCH THIS', C.pink, C.white),
  shape('creator_card', 4, CONTENT.x + 20, CONTENT.maxY - 88, 300, 72, { backgroundColor: C.ice, borderRadius: '16px', boxShadow: '0 12px 32px rgba(15,23,42,0.14)' }, 'decoration', 'social-card-white'),
  text('t_creator_lbl', 14, CONTENT.x + 40, CONTENT.maxY - 76, 120, 18, 'HOSTED BY', { ...TYPE.label, fontSize: 10, color: C.muted }),
  text('t_creator', 15, CONTENT.x + 40, CONTENT.maxY - 56, 240, 28, 'Your Creator Name', { ...TYPE.heading, fontSize: 15, color: C.inkDark, textTransform: 'none' }),
  shape('img_frame', 3, hookImgX - 8, CONTENT.y - 4, hookImgW + 16, CONTENT.h + 8, {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '28px',
    border: `1px solid ${C.lineLight}`,
  }),
  ...heroImage('img_hook', 4, hookImgX, CONTENT.y + 4, hookImgW, CONTENT.h - 8, 'social-creator', C.navyMid, {
    style: { borderRadius: '24px', objectFit: 'cover', boxShadow: '0 24px 56px rgba(0,0,0,0.35)' },
    alt: 'Creator moment',
  }),
  shape('hook_scrim', 5, hookImgX, CONTENT.y + 4, 80, CONTENT.h - 8, { background: `linear-gradient(90deg, ${C.navy} 0%, transparent 100%)` }),
  ...iconBadge('float_heart', 7, hookImgX + hookImgW - 52, CONTENT.y + CONTENT.h - 68, 40, 'heart', C.pink, true),
  ...slideBadge(9, '01'),
];

// ─── 2: Problem — SWOT-style anchor + framework list ─────────────────────────
const BUBBLE_W = 400;
const BUBBLE_H = 340;
const LIST_X = CONTENT.x + BUBBLE_W + 48;
const LIST_W = CONTENT.maxX - LIST_X;
const frameworkPains = [
  { letter: 'P', title: 'Pattern interrupt missing', body: 'Posting without a hook in the first second loses the scroll before your message lands.' },
  { letter: 'W', title: 'Weak opening CTA', body: 'No clear action in the opening beats — viewers bounce before the payoff arrives.' },
  { letter: 'R', title: 'Repetitive layouts', body: 'Recycling one template every time makes your feed feel predictable and easy to skip.' },
];
const scene02 = sceneBase('ss_scene_02', 2, 'The Problem', 'Split', 'Anchor bubble left, framework pain list right — SWOT-style.', 'Problem → Insight', ['problem', 'pain'], {
  anchor: { x: CONTENT.x, y: CONTENT.y + 40, width: BUBBLE_W, height: BUBBLE_H },
  list: { x: LIST_X, y: CONTENT.y + 24, width: LIST_W, height: CONTENT.h - 24 },
}, 'bg-gradient-navy', 'br-mini');
scene02.clips = [
  shape('bg02', 0, 0, 0, W, H, { background: `linear-gradient(165deg, ${C.navy} 0%, ${C.navyMid} 100%)` }),
  ...cornerArcs(1),
  ...neonDots(2),
  neonGlow('glow02', 2, CONTENT.maxX - 120, CONTENT.y, 140, C.glowPink),
  ...hookIconCluster('pain_icon', 4, CONTENT.x + 8, CONTENT.y + 56, 140),
  ...anchorBubble('prob_bubble', 5, CONTENT.x + 168, CONTENT.y + 40, BUBBLE_W - 160, BUBBLE_H, 'CONTENT\nGAPS', 'Sound familiar?'),
  shape('list_panel', 3, LIST_X, CONTENT.y + 24, LIST_W, CONTENT.h - 40, {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '24px',
    border: `1px solid ${C.lineLight}`,
  }, 'decoration', 'social-navy-panel'),
  text('t_eye', 10, LIST_X + 24, CONTENT.y + 44, 200, 22, 'PAIN POINTS', { ...TYPE.subheading, color: C.pinkHot }),
  text('t_intro', 11, LIST_X + 24, CONTENT.y + 72, LIST_W - 48, 44, COPY.problemIntro, { ...TYPE.bodyOnDark, fontSize: 15, color: 'rgba(241,245,249,0.8)' }),
  ...frameworkPains.flatMap((row, i) => frameworkRow(`fw${i}`, 6, LIST_X + 24, CONTENT.y + 128 + i * 108, LIST_W - 48, row.letter, row.title, row.body)),
  ...slideBadge(9, '02'),
];

// ─── 3: Insight — Overview pill + dashboard visual ─────────────────────────
const INSIGHT_COPY_W = 500;
const insightImgX = CONTENT.x + INSIGHT_COPY_W + 36;
const insightImgW = CONTENT.maxX - insightImgX;
const scene03 = sceneBase('ss_scene_03', 3, 'The Insight', 'Split', 'Title pill and copy left, analytics visual right.', 'Insight → Value', ['insight', 'tip'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: INSIGHT_COPY_W, height: CONTENT.h },
  image: { x: insightImgX, y: CONTENT.y, width: insightImgW, height: CONTENT.h },
}, 'bg-gradient-navy', 'bl-mini');
scene03.clips = [
  shape('bg03', 0, 0, 0, W, H, { background: `linear-gradient(155deg, ${C.navyMid} 0%, ${C.navy} 70%)` }),
  ...cornerArcs(1),
  ...neonDots(2),
  neonGlow('glow03', 2, insightImgX - 40, CONTENT.y + 80, 180, C.glowCyan),
  ...titlePill('insight_pill', 8, CONTENT.x, CONTENT.y + 20, 320, 'fire', 'INSIGHT'),
  text('t_title', 11, CONTENT.x, CONTENT.y + 112, INSIGHT_COPY_W - 20, 100, COPY.insightTitle, { ...TYPE.heading, fontSize: 36, color: C.white, lineHeight: 1.1 }),
  text('t_body', 12, CONTENT.x, CONTENT.y + 224, INSIGHT_COPY_W - 20, 160, COPY.insightBody, { ...TYPE.bodyOnDark, fontSize: 16, lineHeight: 1.7, color: 'rgba(241,245,249,0.88)' }),
  shape('rule03', 4, CONTENT.x, CONTENT.y + 400, 80, 4, { background: `linear-gradient(90deg, ${C.pink} 0%, ${C.cyan} 100%)`, borderRadius: '2px' }),
  text('t_cap', 13, CONTENT.x, CONTENT.y + 416, INSIGHT_COPY_W - 20, 40, 'One idea per scene · One action at the end', { ...TYPE.label, fontSize: 11, color: C.cyan, textTransform: 'none', letterSpacing: '0.05em' }),
  shape('img_frame03', 3, insightImgX - 6, CONTENT.y - 4, insightImgW + 12, CONTENT.h + 8, { borderRadius: '24px', border: `1px solid ${C.lineLight}`, backgroundColor: 'rgba(255,255,255,0.04)' }),
  ...heroImage('img_insight', 5, insightImgX, CONTENT.y + 4, insightImgW, CONTENT.h - 8, 'social-dashboard', C.navyMid, {
    style: { borderRadius: '20px', objectFit: 'cover', boxShadow: '0 20px 48px rgba(0,0,0,0.3)' },
    alt: 'Analytics dashboard',
  }),
  ...iconBadge('ico_chart', 7, insightImgX + 20, CONTENT.y + 20, 40, 'chart', C.violet),
  ...slideBadge(9, '03'),
];

// ─── 4: Value — full-width feature cards (Sales Demo style) ────────────────
const structureSteps = [
  { num: '01', thumb: 'social-step-hook', icon: 'bolt', title: 'Hook in 1 second', body: 'Open with motion, a question, or a bold claim — skip the logo intro.', color: C.pink },
  { num: '02', thumb: 'social-step-cut', icon: 'target', title: 'One idea per cut', body: 'Each scene earns the next beat. Trim anything that does not move the story.', color: C.cyan },
  { num: '03', thumb: 'social-step-cta', icon: 'share', title: 'End with one action', body: 'Follow, save, comment, or click — one CTA repeated on the last frame.', color: C.violet },
];
const featW = Math.floor((CONTENT.w - 32) / 3);
const featH = 400;
const featY = CONTENT.y + 108;
const scene04 = sceneBase('ss_scene_04', 4, 'Value Stack', 'Grid', 'Three feature cards with thumbnails — polished reel structure.', 'Value → Proof', ['value', 'tips'], {
  grid: { x: CONTENT.x, y: featY, width: CONTENT.w, height: featH },
}, 'bg-gradient-navy', 'br-mini');
scene04.clips = [
  shape('bg04', 0, 0, 0, W, H, { background: `linear-gradient(150deg, ${C.navy} 0%, #312E81 50%, ${C.navyMid} 100%)` }),
  ...cornerArcs(1),
  ...dotGrid(2, CONTENT.maxX - 90, CONTENT.y + 8, 2, 4),
  ...neonDots(2),
  neonGlow('glow04', 2, CONTENT.x + 200, CONTENT.y + 40, 180, C.glowGold),
  text('t_eye', 10, CONTENT.x, CONTENT.y + 8, 240, 22, 'REEL STRUCTURE', { ...TYPE.subheading, color: C.pinkHot }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 36, CONTENT.w, 52, COPY.valueIntro, { ...TYPE.display, fontSize: 38, color: C.white, lineHeight: 1.08 }),
  text('t_sub', 12, CONTENT.x, CONTENT.y + 88, 640, 28, 'Three beats that keep viewers watching to the end.', { ...TYPE.bodyOnDark, fontSize: 15, color: 'rgba(241,245,249,0.75)' }),
  ...structureSteps.flatMap((step, i) => structureFeatureCard(
    `val${i}`, 3, CONTENT.x + i * (featW + 16), featY, featW, featH,
    step.num, step.thumb, step.title, step.body, step.color, step.icon,
  )),
  ...slideBadge(9, '04'),
];

// ─── 5: Proof — title pill + white stat card + lifestyle visual ─────────────
const PROOF_STAT_W = 480;
const proofImgX = CONTENT.x + PROOF_STAT_W + 36;
const proofImgW = CONTENT.maxX - proofImgX;
const scene05 = sceneBase('ss_scene_05', 5, 'Social Proof', 'StatsHighlight', 'Overview pill, elevated stat card, results visual.', 'Proof → Show', ['proof', 'stats'], {
  stat: { x: CONTENT.x, y: CONTENT.y + 56, width: PROOF_STAT_W, height: CONTENT.h - 72 },
  image: { x: proofImgX, y: CONTENT.y + 56, width: proofImgW, height: CONTENT.h - 72 },
}, 'bg-gradient-navy', 'br-mini');
scene05.clips = [
  shape('bg05', 0, 0, 0, W, H, { background: `linear-gradient(160deg, ${C.navyMid} 0%, ${C.navy} 100%)` }),
  ...cornerArcs(1),
  ...dotGrid(2, SAFE.x + 8, SAFE.maxY - 50, 2, 4),
  neonGlow('glow05', 2, CONTENT.x, CONTENT.y + 40, 200, C.glowCyan),
  ...titlePill('proof_pill', 8, CONTENT.x, CONTENT.y + 12, 280, 'chart', 'PROOF'),
  shape('stat_card', 3, CONTENT.x, CONTENT.y + 100, PROOF_STAT_W, CONTENT.h - 116, {
    backgroundColor: C.ice,
    borderRadius: '24px',
    boxShadow: '0 20px 48px rgba(15,23,42,0.18)',
  }, 'decoration', 'social-card-white'),
  shape('stat_bar', 4, CONTENT.x, CONTENT.y + 100, PROOF_STAT_W, 6, { background: `linear-gradient(90deg, ${C.pink} 0%, ${C.cyan} 100%)`, borderRadius: '24px 24px 0 0' }),
  text('t_stat', 11, CONTENT.x + 24, CONTENT.y + 180, PROOF_STAT_W - 48, 88, COPY.proofStat, { ...TYPE.stat, fontSize: 88, color: C.violet }),
  text('t_label', 12, CONTENT.x + 32, CONTENT.y + 276, PROOF_STAT_W - 64, 56, COPY.proofLabel, { ...TYPE.heading, fontSize: 20, color: C.inkDark, lineHeight: 1.2 }),
  text('t_sub', 13, CONTENT.x + 32, CONTENT.y + 340, PROOF_STAT_W - 64, 44, COPY.proofSub, { ...TYPE.body, fontSize: 14, color: C.muted }),
  ...heroImage('img_proof', 5, proofImgX, CONTENT.y + 100, proofImgW, CONTENT.h - 116, 'social-lifestyle', C.navyMid, {
    style: { borderRadius: '24px', objectFit: 'cover', boxShadow: '0 22px 52px rgba(0,0,0,0.28)' },
    alt: 'Results moment',
  }),
  ...metaPill('proof_tag', 6, proofImgX + 20, CONTENT.y + CONTENT.h - 52, 140, 28, 'VERIFIED', C.gold, C.navy),
  ...slideBadge(9, '05'),
];

// ─── 6: Show — laptop demo left, title pill panel right ────────────────────
const SHOW_IMG_W = 600;
const showCopyX = CONTENT.x + SHOW_IMG_W + 40;
const showCopyW = CONTENT.maxX - showCopyX;
const scene06 = sceneBase('ss_scene_06', 6, 'Show the Proof', 'Split', 'Laptop workspace left, elevated copy panel right.', 'Show → CTA', ['demo', 'visual'], {
  image: { x: CONTENT.x, y: CONTENT.y, width: SHOW_IMG_W, height: CONTENT.h },
  copy: { x: showCopyX, y: CONTENT.y, width: showCopyW, height: CONTENT.h },
}, 'bg-gradient-navy', 'bl-mini');
scene06.clips = [
  shape('bg06', 0, 0, 0, W, H, { background: `linear-gradient(155deg, ${C.navy} 0%, ${C.navyMid} 100%)` }),
  ...cornerArcs(1),
  shape('img_frame06', 2, CONTENT.x - 6, CONTENT.y - 4, SHOW_IMG_W + 12, CONTENT.h + 8, { borderRadius: '26px', border: `1px solid ${C.lineLight}` }),
  ...heroImage('img_show', 4, CONTENT.x, CONTENT.y + 4, SHOW_IMG_W, CONTENT.h - 8, 'social-laptop', C.navyMid, {
    style: { borderRadius: '22px', objectFit: 'cover', boxShadow: '0 22px 52px rgba(0,0,0,0.32)' },
    alt: 'Product demo on laptop',
  }),
  shape('play_overlay', 5, CONTENT.x + SHOW_IMG_W / 2 - 36, CONTENT.y + CONTENT.h / 2 - 36, 72, 72, {
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.9)',
  }),
  ...iconBadge('ico_play', 6, CONTENT.x + SHOW_IMG_W / 2 - 22, CONTENT.y + CONTENT.h / 2 - 22, 44, 'play', 'transparent'),
  shape('copy_panel06', 3, showCopyX, CONTENT.y + 8, showCopyW, CONTENT.h - 16, {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '24px',
    border: `1px solid ${C.lineLight}`,
  }),
  ...titlePill('show_pill', 8, showCopyX + 20, CONTENT.y + 32, showCopyW - 40, 'clipboard', 'VISUAL PROOF'),
  text('t_title', 11, showCopyX + 24, CONTENT.y + 124, showCopyW - 48, 52, COPY.showTitle, { ...TYPE.heading, fontSize: 30, color: C.white }),
  text('t_body', 12, showCopyX + 24, CONTENT.y + 184, showCopyW - 48, 140, COPY.showBody, { ...TYPE.bodyOnDark, fontSize: 15, lineHeight: 1.65, color: 'rgba(241,245,249,0.88)' }),
  ...metaPill('show_cta', 6, showCopyX + 24, CONTENT.y + 340, 180, 32, 'SEE IT WORK', C.pink, C.white),
  text('t_play', 14, showCopyX + 24, CONTENT.y + 388, showCopyW - 48, 28, 'Replace with your clip or screen recording', { ...TYPE.body, fontSize: 13, color: C.slate }),
  ...slideBadge(9, '06'),
];

// ─── 7: CTA — action rows left + navy momentum panel (Sales Demo style) ───
const STEPS_LEFT_W = 588;
const MAP_PANEL_X = CONTENT.x + STEPS_LEFT_W + 24;
const MAP_PANEL_W = CONTENT.maxX - MAP_PANEL_X;
const ctaSteps = [
  {
    num: '01',
    icon: 'heart',
    title: 'Follow for part 2',
    body: 'Tap follow so the next drop lands in your feed — no searching required.',
    tag: 'NOW',
    color: C.pink,
    tagBg: 'rgba(236,72,153,0.12)',
  },
  {
    num: '02',
    icon: 'share',
    title: 'Save & share',
    body: 'Bookmark this reel and send it to one teammate who needs the playbook.',
    tag: 'TODAY',
    color: C.cyan,
    tagBg: 'rgba(34,211,238,0.14)',
  },
  {
    num: '03',
    icon: 'clipboard',
    title: 'Comment to unlock',
    body: 'Drop a comment if you want the full template pack — we reply with the link.',
    tag: 'PART 2',
    color: C.violet,
    tagBg: 'rgba(139,92,246,0.14)',
  },
];
const momentumChecks = [
  'Follow before the next episode drops',
  'Save the structure for your next post',
  'Comment if you want the template pack',
];
const scene07 = sceneBase('ss_scene_07', 7, 'Follow & CTA', 'Split', 'Action rows left, navy momentum panel right — no duplicate CTAs.', 'CTA → End', ['cta', 'closing'], {
  steps: { x: CONTENT.x, y: CONTENT.y + 80, width: STEPS_LEFT_W, height: CONTENT.h - 80 },
  panel: { x: MAP_PANEL_X, y: CONTENT.y + 80, width: MAP_PANEL_W, height: CONTENT.h - 80 },
}, 'bg-gradient-light', 'br-mini');
scene07.clips = [
  shape('bg07', 0, 0, 0, W, H, { background: `linear-gradient(145deg, ${C.ice} 0%, #EEF2FF 55%, #FDF2F8 100%)` }),
  neonGlow('glow07', 1, MAP_PANEL_X - 40, CONTENT.y + 40, 200, C.glowPink),
  text('t_label', 10, CONTENT.x, CONTENT.y + 4, 240, 22, 'YOUR NEXT ACTIONS', { ...TYPE.subheading, color: C.pink }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 28, STEPS_LEFT_W, 52, 'Keep the Momentum', { ...TYPE.display, fontSize: 38, color: C.navy, lineHeight: 1.05 }),
  text('t_sub', 12, CONTENT.x, CONTENT.y + 80, STEPS_LEFT_W, 40, COPY.stepsIntro, { ...TYPE.body, fontSize: 15, lineHeight: 1.55, color: C.slate }),
  ...ctaSteps.flatMap((step, i) => actionStepRow(`step${i}`, 3, CONTENT.x, CONTENT.y + 128 + i * 114, STEPS_LEFT_W, step)),
  shape('map_panel', 2, MAP_PANEL_X, CONTENT.y + 80, MAP_PANEL_W, CONTENT.h - 88, {
    backgroundColor: C.navy,
    borderRadius: '22px',
    boxShadow: '0 22px 52px rgba(15,23,42,0.22)',
  }, 'decoration', 'social-navy-panel'),
  shape('map_glow', 3, MAP_PANEL_X, CONTENT.y + 80, MAP_PANEL_W, 120, {
    background: `radial-gradient(ellipse at 90% 0%, ${C.glowPink} 0%, transparent 70%)`,
    borderRadius: '22px 22px 0 0',
  }),
  ...iconBadge('map_ico', 6, MAP_PANEL_X + 24, CONTENT.y + 104, 44, 'heart', C.violet),
  text('t_map_lbl', 13, MAP_PANEL_X + 80, CONTENT.y + 110, MAP_PANEL_W - 96, 22, 'STAY IN THE LOOP', { ...TYPE.label, fontSize: 10, color: C.cyan }),
  text('t_map_title', 14, MAP_PANEL_X + 24, CONTENT.y + 140, MAP_PANEL_W - 48, 72, '3 ways to\nstay connected', { ...TYPE.display, fontSize: 28, color: C.white, lineHeight: 1.12 }),
  ...momentumChecks.flatMap((line, i) => [
    ...iconBadge(`chk${i}`, 7, MAP_PANEL_X + 24, CONTENT.y + 228 + i * 44, 28, 'check', C.violet),
    text(`chkt${i}`, 15 + i, MAP_PANEL_X + 60, CONTENT.y + 232 + i * 44, MAP_PANEL_W - 84, 32, line, {
      ...TYPE.bodyOnDark,
      fontSize: 14,
      lineHeight: 1.4,
      color: 'rgba(241,245,249,0.92)',
    }),
  ]),
  ...heroImage('img_map', 5, MAP_PANEL_X + 24, CONTENT.y + 360, MAP_PANEL_W - 48, 112, 'social-team', C.navyMid, {
    style: { borderRadius: '14px', objectFit: 'cover', opacity: 0.92 },
    alt: 'Community',
  }),
  shape('map_pill', 6, MAP_PANEL_X + 24, CONTENT.y + 484, MAP_PANEL_W - 48, 36, { backgroundColor: C.gold, borderRadius: '100px' }),
  text('t_map_pill', 16, MAP_PANEL_X + 36, CONTENT.y + 492, MAP_PANEL_W - 72, 24, COPY.ctaHandle.toUpperCase(), {
    ...TYPE.label,
    fontSize: 10,
    color: C.navy,
    textAlign: 'center',
    letterSpacing: '0.12em',
  }),
  image('img_logo', 8, CONTENT.x, CONTENT.maxY - 44, 120, 32, 'social-logo', { style: { objectFit: 'contain' }, alt: 'Brand', role: 'logo' }),
  text('t_handle', 17, CONTENT.x + 132, CONTENT.maxY - 36, 200, 24, COPY.ctaHandle, { ...TYPE.body, fontSize: 14, fontWeight: '600', color: C.slate }),
  ...slideBadge(9, '07'),
];

const SCENE_BG = [
  'bg-gradient-navy',
  'bg-gradient-navy',
  'bg-gradient-navy',
  'bg-gradient-navy',
  'bg-gradient-navy',
  'bg-gradient-navy',
  'bg-gradient-light',
];

const SCENE_AVATAR = [
  'cover',
  'br-mini',
  'bl-mini',
  'br-mini',
  'br-mini',
  'bl-mini',
  'br-mini',
];

[scene01, scene02, scene03, scene04, scene05, scene06, scene07].forEach((scene, i) => {
  finalizeScene(scene, SCENE_BG[i], SCENE_AVATAR[i]);
});

const template = {
  category: 'Social Short',
  template: {
    id: 'social-short-neon-pulse',
    name: 'Social Short — Neon Pulse Pro',
    category: 'Social Short',
    theme: assets.theme,
    presenter: PRESENTER,
    totalSlides: 7,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    targetDuration: { min: 15, max: 60 },
    colorPalette: C,
    description: 'Polished 16:9 short-form bundle with feature cards, title pills, framework panels, and Sales Demo–quality layouts.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06, scene07],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes, ${W}x${H})`);
