import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/course_module_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/course-module-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 10;
const W = 1280;
const H = 720;
const C = assets.colors;
const F = assets.theme.fonts;

/** Outer canvas margin — 8% */
const SAFE = {
  x: Math.round(W * 0.08),
  y: Math.round(H * 0.08),
};
SAFE.w = W - SAFE.x * 2;
SAFE.h = H - SAFE.y * 2;
SAFE.maxX = SAFE.x + SAFE.w;
SAFE.maxY = SAFE.y + SAFE.h;

/** Inner content box — keeps text/cards away from avatar corners */
const CONTENT = {
  x: SAFE.x + 24,
  y: SAFE.y + 16,
  w: SAFE.w - 48,
  h: SAFE.h - 32,
};
CONTENT.maxX = CONTENT.x + CONTENT.w;
CONTENT.maxY = CONTENT.y + CONTENT.h;

const PRESENTER = { name: assets.presenter?.name || 'Instructor' };

const COPY = {
  coverBody:
    'A complete training module designed for professional instruction. Replace this copy with your course promise, audience, and what learners will be able to do after finishing this lesson.',
  coverBody2:
    'Use this slide to set expectations, highlight prerequisites, and preview the skills covered in the next several scenes.',
  overviewPanel:
    'This module helps participants understand a clear work process and apply it more confidently in everyday tasks. Learners will move from theory to practice with guided examples.',
  overviewPanel2:
    'By the end of this section, everyone should know the outcomes, the tools required, and how success will be measured.',
  frameworkSub:
    'Explore the main stages of this module. Each stage builds on the previous one so learners always know where they are in the journey.',
  conceptBody:
    'Introduce the first concept in plain language. Explain what it is, when learners use it, and why it matters for their daily work. Connect the idea to a real task they already perform.',
  conceptBody2:
    'Add a short example, a common mistake to avoid, and one sentence on how this concept supports the larger workflow taught in this module.',
  exampleBody:
    'Walk through a realistic scenario step by step. Show what good looks like, call out common mistakes, and explain how the process prevents rework and confusion across teams.',
  exampleBody2:
    'Invite learners to picture themselves in this situation and identify which step they would take first when applying the process on the job.',
};

const AVATAR_STYLE_LIGHT = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.white}`,
  boxShadow: '0 12px 32px rgba(17, 24, 39, 0.2)',
};

const AVATAR_STYLE_DARK = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.gold}`,
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
};

function avatarLayout(preset = 'br-mini') {
  const pad = 12;
  const layouts = {
    /** Cover — bottom-right, clear of title block */
    cover: {
      size: { width: 88, height: 108 },
      pos: { x: SAFE.maxX - 88 - pad, y: SAFE.maxY - 108 - pad },
      style: { ...AVATAR_STYLE_LIGHT, border: `3px solid ${C.gold}` },
    },
    'br-mini': {
      size: { width: 88, height: 108 },
      pos: { x: SAFE.maxX - 88 - pad, y: SAFE.maxY - 108 - pad },
      style: AVATAR_STYLE_LIGHT,
    },
    'br-small': {
      size: { width: 96, height: 116 },
      pos: { x: SAFE.maxX - 96 - pad, y: SAFE.maxY - 116 - pad },
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
      size: { width: 92, height: 112 },
      pos: { x: SAFE.maxX - 92 - pad, y: SAFE.maxY - 112 - pad },
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
  org: { fontFamily: F.sans, fontWeight: '600', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.sage },
  display: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 48 },
  displaySerif: { fontFamily: F.serif, fontWeight: '700', color: C.forest, lineHeight: 1.08, fontSize: 40 },
  heading: { fontFamily: F.display, fontWeight: '700', color: C.forest, letterSpacing: '0.04em', fontSize: 32 },
  subheading: { fontFamily: F.sans, fontWeight: '600', color: C.sage, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 14 },
  body: { fontFamily: F.sans, fontWeight: '400', color: C.slate, lineHeight: 1.75, fontSize: 17 },
  bodyOnDark: { fontFamily: F.sans, fontWeight: '400', color: C.cream, lineHeight: 1.7, fontSize: 17 },
  label: { fontFamily: F.sans, fontWeight: '600', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted },
  stat: { fontFamily: F.display, fontWeight: '800', color: C.forest, fontSize: 44 },
  cardTitle: { fontFamily: F.display, fontWeight: '700', fontSize: 20, color: C.ink },
  cardBody: { fontFamily: F.sans, fontWeight: '400', fontSize: 15, color: C.slate, lineHeight: 1.6 },
  accent: { fontFamily: F.accent, fontWeight: '500', fontStyle: 'italic', color: C.terracotta, fontSize: 18 },
};

const EDGE_DECOR = new Set([
  'course-arc-gold',
  'course-arc-terra',
  'course-organic-header',
  'course-scrim',
  'course-slide-badge',
]);

function shouldFitToSafeArea(clip) {
  if (clip.isBackground) return false;
  if (clip.type === 'avatar') return false;
  if (clip.role === 'scrim' || clip.role === 'background') return false;
  if (clip.shapeKey && EDGE_DECOR.has(clip.shapeKey)) return false;
  if (clip.type === 'image') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    if (x <= 4 && y <= 4 && w >= W * 0.92 && h >= H * 0.92) return false;
    return true;
  }
  if (clip.type === 'shape') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    if (w >= W * 0.95 && h >= H * 0.95) return false;
    if (clip.role === 'decoration' && clip.shapeKey?.startsWith('course-arc')) return false;
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

  const avatarPreset = clip._avatarReserved ? null : null;
  const maxW = CONTENT.w;
  const maxH = CONTENT.h;
  w = Math.min(w, maxW);
  h = Math.min(h, maxH);
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

function buildSceneBackground(bgId = 'bg-cream') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  const value = bg?.value || C.cream;
  const isGradient = value.includes('gradient');
  return {
    type: isGradient ? 'gradient' : 'solid',
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
    hint: 'Use preset colors, a custom swatch, or a full-bleed image. Delete a hero image to reveal the color panel behind it.',
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

function optimizeImageUrl(url, maxWidth = 1280) {
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

function fullBleedImage(id, assetId, colorFallback = C.cream) {
  return image(id, 0, 0, 0, W, H, assetId, {
    role: 'background',
    isBackground: true,
    style: { objectFit: 'cover' },
    swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
  });
}

function scrim(id, layer, color = C.overlayLight, role = 'scrim') {
  return shape(id, layer, 0, 0, W, H, { backgroundColor: color }, role, 'course-scrim');
}

function heroImage(id, layer, x, y, w, h, assetId, colorFallback, extra = {}) {
  const shapeStyle = {
    backgroundColor: colorFallback,
    borderRadius: extra.style?.borderRadius || '20px',
    ...(extra.style?.boxShadow ? { boxShadow: extra.style.boxShadow } : {}),
  };
  return [
    shape(`${id}_color`, layer, x, y, w, h, shapeStyle, 'hero-color-fallback', 'course-frame-round'),
    image(id, layer + 1, x, y, w, h, assetId, {
      ...extra,
      swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
    }),
  ];
}

function iconBadge(id, layer, x, y, size, iconAssetId, bg = C.white) {
  const pad = Math.round(size * 0.2);
  const iconAsset = assets.icons.find((item) => item.id === iconAssetId);
  return [
    shape(`${id}_bg`, layer, x, y, size, size, { backgroundColor: bg, borderRadius: '50%', boxShadow: '0 4px 14px rgba(17,24,39,0.1)' }, 'decoration', 'course-icon-badge'),
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
  const size = 48;
  const x = CONTENT.maxX - size;
  const y = CONTENT.maxY - size;
  return [
    shape(`slide_badge_${num}`, layer, x, y, size, size, { backgroundColor: C.forest, borderRadius: '50%', border: `3px solid ${C.gold}` }, 'decoration', 'course-slide-badge'),
    text(`slide_num_${num}`, layer + 1, x, y + 10, size, 28, num, { ...TYPE.stat, fontSize: 18, color: C.white, textAlign: 'center', fontFamily: F.display }),
  ];
}

function infoCard(id, layer, x, y, w, h, barColor, title, body) {
  return [
    shape(`${id}_bg`, layer, x, y, w, h, { backgroundColor: C.white, borderRadius: '16px', boxShadow: '0 14px 36px rgba(17,24,39,0.08)' }, 'decoration', 'course-card-white'),
    shape(`${id}_bar`, layer + 1, x, y + 14, 6, h - 28, { backgroundColor: barColor, borderRadius: '4px' }),
    text(`${id}_title`, layer + 2, x + 24, y + 18, w - 36, 36, title, { ...TYPE.cardTitle, fontSize: 21 }),
    text(`${id}_body`, layer + 3, x + 24, y + 58, w - 36, h - 76, body, { ...TYPE.cardBody, fontSize: 15 }),
  ];
}

function diamondTile(id, layer, cx, cy, size, color, iconId, num) {
  const half = Math.round(size / 2);
  return [
    shape(`${id}_tile`, layer, cx - half, cy - half, size, size, { backgroundColor: color, borderRadius: '14px', transform: 'rotate(45deg)' }, 'decoration', 'course-diamond'),
    ...iconBadge(`${id}_ico`, layer + 1, cx - 18, cy - 18, 36, iconId, 'transparent'),
    text(`${id}_num`, layer + 2, cx - 20, cy + half + 8, 40, 24, num, { ...TYPE.stat, fontSize: 14, color: C.ink, textAlign: 'center' }),
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

function finalizeScene(scene, bgId = 'bg-cream', avatarPreset = 'br-mini') {
  scene._avatarPreset = avatarPreset;
  scene.background = buildSceneBackground(bgId);
  applyBackgroundConfig(scene);
  enforceSafeArea(scene);
  delete scene._avatarPreset;
  if (!scene.clips.some((clip) => clip.type === 'avatar')) {
    scene.clips.push(avatarClip(60, avatarPreset));
  }
  return scene;
}

function sceneBase(id, slideIndex, title, layoutType, description, flow, tags, zones, bgId = 'bg-cream', avatarPreset = 'br-mini') {
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
    tags: ['course-module', 'training', ...tags],
    clips: [],
  };
}

// ─── Slide 1: Cover — circular hero + arcs (Training & Development ref) ───
const COVER_IMG = { x: SAFE.x, y: SAFE.y + 20, size: 360 };
const scene01 = sceneBase('cm_scene_01', 1, 'Module Cover', 'Cover', 'Full-bleed background with circular hero, gold arcs, and bold display typography.', 'Cover → Overview', ['cover', 'full-bleed'], {
  hero: { x: COVER_IMG.x, y: COVER_IMG.y, width: COVER_IMG.size, height: COVER_IMG.size },
  copy: { x: CONTENT.x + 400, y: CONTENT.y, width: CONTENT.w - 420, height: CONTENT.h },
}, 'bg-cream', 'cover');
const copyX = CONTENT.x + 400;
scene01.clips = [
  fullBleedImage('bg_cover', 'course-cover-bg', C.cream),
  scrim('scrim_cover', 1, 'rgba(249, 248, 246, 0.78)'),
  shape('arc_gold', 2, COVER_IMG.x - 30, COVER_IMG.y - 30, 420, 420, { backgroundColor: 'transparent', borderRadius: '50%', border: `14px solid ${C.gold}`, opacity: 0.95 }, 'decoration', 'course-arc-gold'),
  shape('arc_terra', 2, COVER_IMG.x - 50, COVER_IMG.y - 50, 460, 460, { backgroundColor: 'transparent', borderRadius: '50%', border: `10px solid ${C.terracotta}`, opacity: 0.85 }, 'decoration', 'course-arc-terra'),
  shape('ring_inner', 3, COVER_IMG.x + 8, COVER_IMG.y + 8, COVER_IMG.size - 16, COVER_IMG.size - 16, { backgroundColor: C.cream, borderRadius: '50%' }),
  ...heroImage('img_cover_hero', 4, COVER_IMG.x + 16, COVER_IMG.y + 16, COVER_IMG.size - 32, COVER_IMG.size - 32, 'course-hero-arch', C.sageLight, { style: { borderRadius: '50%', objectFit: 'cover' }, alt: 'Training hero' }),
  shape('dot_tl', 2, SAFE.x - 16, SAFE.y - 12, 28, 28, { backgroundColor: C.terracotta, borderRadius: '50%', opacity: 0.9 }),
  shape('dot_tr', 2, SAFE.maxX - 40, SAFE.y + 8, 20, 20, { backgroundColor: C.gold, borderRadius: '50%' }),
  shape('dot_bl', 2, SAFE.x + 48, SAFE.maxY - 36, 16, 16, { backgroundColor: C.sage, borderRadius: '50%' }),
  image('img_logo', 12, copyX, CONTENT.y, 200, 44, 'course-logo', { style: { objectFit: 'contain' }, alt: 'Academy logo', role: 'logo' }),
  text('t_title', 13, copyX, CONTENT.y + 56, CONTENT.maxX - copyX, 150, 'Training And\nDevelopment', { ...TYPE.display, fontSize: 58, lineHeight: 1.05, color: C.ink }),
  shape('pill_sub', 6, copyX, CONTENT.y + 220, 320, 48, { background: `linear-gradient(90deg, ${C.terracotta} 0%, ${C.gold} 100%)`, borderRadius: '100px' }, 'decoration', 'course-pill'),
  text('t_pill', 14, copyX + 20, CONTENT.y + 232, 280, 32, 'Presentation — Module 01', { fontFamily: F.sans, fontWeight: '600', fontSize: 16, color: C.white }),
  text('t_body', 15, copyX, CONTENT.y + 290, CONTENT.maxX - copyX - 16, 110, COPY.coverBody, { ...TYPE.body, fontSize: 17 }),
  text('t_body2', 16, copyX, CONTENT.y + 400, CONTENT.maxX - copyX - 16, 90, COPY.coverBody2, { ...TYPE.body, fontSize: 16, color: C.muted }),
  text('t_presented', 16, copyX, CONTENT.maxY - 72, 160, 22, 'Presented by', { ...TYPE.label, fontSize: 10 }),
  text('t_name', 17, copyX, CONTENT.maxY - 48, 280, 32, 'Your Instructor', { ...TYPE.subheading, fontSize: 18, color: C.terracotta, textTransform: 'none', letterSpacing: '0.02em' }),
  ...iconBadge('ico_globe', 10, CONTENT.maxX - 120, CONTENT.maxY - 52, 36, 'globe', C.warm),
  text('t_web', 18, CONTENT.maxX - 80, CONTENT.maxY - 48, 80, 28, 'yoursite.com', { ...TYPE.body, fontSize: 12, color: C.sage, fontWeight: '600' }),
];

// ─── Slide 2: Training Overview — image panel + objective cards ────────────
const scene02 = sceneBase('cm_scene_02', 2, 'Training Overview', 'Split', 'Warm background image with objectives grid and white info cards.', 'Overview → Framework', ['objectives', 'overview'], {
  text: { x: CONTENT.x + 420, y: CONTENT.y, width: CONTENT.w - 440, height: CONTENT.h },
}, 'bg-warm', 'tr-mini');
const gridX = CONTENT.x + 420;
const cardW = Math.floor((CONTENT.maxX - gridX - 16) / 2);
const cardH = 176;
scene02.clips = [
  fullBleedImage('bg_overview', 'course-soft-bg', C.warm),
  scrim('scrim_overview', 1, 'rgba(255, 244, 230, 0.9)'),
  shape('panel_img', 3, CONTENT.x, CONTENT.y, 380, CONTENT.h, { backgroundColor: C.white, borderRadius: '24px', boxShadow: '0 20px 50px rgba(17,24,39,0.1)' }),
  ...heroImage('img_overview', 4, CONTENT.x + 16, CONTENT.y + 16, 348, 260, 'course-classroom', C.sageLight, { style: { borderRadius: '18px', objectFit: 'cover' }, alt: 'Classroom' }),
  text('t_panel_title', 11, CONTENT.x + 28, CONTENT.y + 296, 324, 48, 'What You\'ll Learn', { ...TYPE.displaySerif, fontSize: 32, color: C.forest }),
  text('t_panel_body', 12, CONTENT.x + 28, CONTENT.y + 348, 324, 120, COPY.overviewPanel, { ...TYPE.body, fontSize: 16 }),
  text('t_panel_body2', 13, CONTENT.x + 28, CONTENT.y + 468, 324, 100, COPY.overviewPanel2, { ...TYPE.body, fontSize: 15, color: C.muted }),
  text('t_title', 14, gridX, CONTENT.y, CONTENT.maxX - gridX, 56, 'Training Overview', { ...TYPE.display, fontSize: 40, color: C.ink }),
  text('t_sub', 15, gridX, CONTENT.y + 56, CONTENT.maxX - gridX, 28, 'FOUR LEARNING OUTCOMES', { ...TYPE.subheading, fontSize: 13 }),
  ...infoCard('obj1', 5, gridX, CONTENT.y + 100, cardW, cardH, C.terracotta, 'Understand', 'Grasp the core ideas, vocabulary, and context before moving into hands-on practice.'),
  ...infoCard('obj2', 5, gridX + cardW + 16, CONTENT.y + 100, cardW, cardH, C.forest, 'Apply', 'Use the process in real tasks with confidence and consistent quality.'),
  ...infoCard('obj3', 5, gridX, CONTENT.y + 100 + cardH + 16, cardW, cardH, C.sage, 'Avoid Errors', 'Spot common mistakes early and know how to correct them quickly.'),
  ...infoCard('obj4', 5, gridX + cardW + 16, CONTENT.y + 100 + cardH + 16, cardW, cardH, C.gold, 'Build Confidence', 'Practice until each step feels natural and repeatable on the job.'),
  ...slideBadge(9, '02'),
];

// ─── Slide 3: Core Learning Framework — diamond graphic + cards ────────────
const scene03 = sceneBase('cm_scene_03', 3, 'Core Framework', 'Grid', 'Four-stage framework with diamond graphic and matching info cards.', 'Framework → Concept', ['framework', 'concepts'], {
  graphic: { x: CONTENT.x, y: CONTENT.y + 40, width: 400, height: 400 },
  grid: { x: CONTENT.x + 440, y: CONTENT.y, width: CONTENT.w - 460, height: CONTENT.h },
}, 'bg-cream', 'br-mini');
const gfxX = CONTENT.x + 60;
const gfxY = CONTENT.y + 100;
const tile = 120;
const gap = 28;
scene03.clips = [
  fullBleedImage('bg_framework', 'course-soft-bg', C.cream),
  scrim('scrim_fw', 1, 'rgba(249, 248, 246, 0.92)'),
  text('t_title', 10, CONTENT.x, CONTENT.y, 520, 52, 'Core Learning Framework', { ...TYPE.displaySerif, fontSize: 38, color: C.forest }),
  text('t_sub', 11, CONTENT.x, CONTENT.y + 52, 520, 72, COPY.frameworkSub, { ...TYPE.body, fontSize: 17 }),
  ...diamondTile('d1', 4, gfxX + tile / 2, gfxY + tile / 2, tile, C.forest, 'document', '01'),
  ...diamondTile('d2', 4, gfxX + tile + gap + tile / 2, gfxY + tile / 2, tile, C.sage, 'folder', '02'),
  ...diamondTile('d3', 4, gfxX + tile / 2, gfxY + tile + gap + tile / 2, tile, C.gold, 'monitor', '03'),
  ...diamondTile('d4', 4, gfxX + tile + gap + tile / 2, gfxY + tile + gap + tile / 2, tile, C.terracotta, 'steps', '04'),
  ...infoCard('fw1', 6, CONTENT.x + 440, CONTENT.y + 88, cardW, cardH, C.forest, 'Gather Input', 'Collect context, materials, and stakeholder needs before you begin the workflow.'),
  ...infoCard('fw2', 6, CONTENT.x + 440 + cardW + 16, CONTENT.y + 88, cardW, cardH, C.sage, 'Sort Information', 'Organize ideas into a clear sequence that everyone on the team can follow.'),
  ...infoCard('fw3', 6, CONTENT.x + 440, CONTENT.y + 88 + cardH + 16, cardW, cardH, C.gold, 'Apply Steps', 'Walk through the process with examples, checkpoints, and quality criteria.'),
  ...infoCard('fw4', 6, CONTENT.x + 440 + cardW + 16, CONTENT.y + 88 + cardH + 16, cardW, cardH, C.terracotta, 'Review Outcome', 'Confirm understanding, capture lessons learned, and define next actions.'),
  ...slideBadge(9, '03'),
];

// ─── Slide 4: Concept Deep Dive — organic header + full image ───────────────
const scene04 = sceneBase('cm_scene_04', 4, 'Concept 01', 'Split', 'Organic header panel with full-width hero image and lesson copy.', 'Concept → Process', ['concept', 'deep-dive'], {
  header: { x: CONTENT.x, y: CONTENT.y, width: 560, height: 160 },
  image: { x: CONTENT.x, y: CONTENT.y + 180, width: CONTENT.w, height: 280 },
}, 'bg-sage-mist', 'bl-mini');
scene04.clips = [
  fullBleedImage('bg_c1', 'course-nature', C.sageLight),
  scrim('scrim_c1', 1, 'rgba(238, 244, 240, 0.88)'),
  shape('organic_hdr', 2, CONTENT.x - 40, CONTENT.y - 20, 560, 180, { backgroundColor: C.forest, borderRadius: '0 0 55% 45% / 0 0 42% 38%' }, 'decoration', 'course-organic-header'),
  text('t_title', 11, CONTENT.x + 16, CONTENT.y + 24, 480, 88, 'Core Concept —\nDefine the Idea', { ...TYPE.display, fontSize: 38, color: C.white, lineHeight: 1.1 }),
  text('t_num', 12, CONTENT.maxX - 80, CONTENT.y + 28, 64, 48, '01', { ...TYPE.stat, fontSize: 44, color: C.gold }),
  ...heroImage('img_c1', 5, CONTENT.x, CONTENT.y + 176, CONTENT.w, 250, 'course-whiteboard', C.warm, { style: { borderRadius: '20px', objectFit: 'cover', boxShadow: '0 18px 44px rgba(17,24,39,0.12)' }, alt: 'Lesson visual' }),
  shape('copy_panel', 4, CONTENT.x, CONTENT.y + 440, CONTENT.w, 160, { backgroundColor: C.white, borderRadius: '16px', boxShadow: '0 10px 28px rgba(17,24,39,0.06)' }),
  text('t_body', 13, CONTENT.x + 24, CONTENT.y + 458, CONTENT.w - 48, 72, COPY.conceptBody, { ...TYPE.body, fontSize: 17 }),
  text('t_body2', 14, CONTENT.x + 24, CONTENT.y + 536, CONTENT.w - 48, 56, COPY.conceptBody2, { ...TYPE.body, fontSize: 16, color: C.muted }),
  ...slideBadge(9, '04'),
];

// ─── Slide 5: Process Steps — background image + frosted cards ─────────────
const stepW = Math.floor((CONTENT.w - 32) / 3);
const scene05 = sceneBase('cm_scene_05', 5, 'Process Steps', 'Grid', 'Three-step workflow on photographic background with elevated cards.', 'Process → Example', ['process', 'steps'], {
  grid: { x: CONTENT.x, y: CONTENT.y + 80, width: CONTENT.w, height: 400 },
}, 'bg-warm', 'br-mini');
const steps = [
  { title: 'Prepare', body: 'Gather inputs, tools, and context. Confirm roles and success criteria before work begins.', color: C.forest },
  { title: 'Execute', body: 'Follow the standard process step by step. Pause at checkpoints to verify quality.', color: C.terracotta },
  { title: 'Review', body: 'Check outcomes against expectations and capture lessons learned for the next cycle.', color: C.sage },
];
scene05.clips = [
  fullBleedImage('bg_steps', 'course-laptop', C.warm),
  scrim('scrim_steps', 1, 'rgba(255, 244, 230, 0.86)'),
  text('t_title', 10, CONTENT.x, CONTENT.y, CONTENT.w, 52, 'How To Apply It', { ...TYPE.displaySerif, fontSize: 40, color: C.forest }),
  text('t_sub', 11, CONTENT.x, CONTENT.y + 52, CONTENT.w, 48, 'A repeatable three-step process learners can use on the job every time this task appears.', { ...TYPE.body, fontSize: 17 }),
  ...steps.flatMap((step, i) => {
    const n = i + 1;
    const x = CONTENT.x + i * (stepW + 16);
    const y = CONTENT.y + 96;
    return [
      shape(`step${n}`, 3, x, y, stepW, 360, { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '20px', boxShadow: '0 16px 40px rgba(17,24,39,0.1)', borderTop: `5px solid ${step.color}` }, 'decoration', 'course-card-white'),
      shape(`num${n}`, 4, x + 24, y + 24, 44, 44, { backgroundColor: step.color, borderRadius: '50%' }),
      text(`numt${n}`, 12 + i * 3, x + 24, y + 32, 44, 28, String(n), { ...TYPE.stat, fontSize: 20, color: C.white, textAlign: 'center' }),
      ...iconBadge(`ico${n}`, 8, x + 24, y + 84, 40, 'steps', C.warm),
      text(`ht${n}`, 13 + i * 3, x + 24, y + 140, stepW - 48, 40, step.title, { ...TYPE.cardTitle, fontSize: 24 }),
      text(`bt${n}`, 14 + i * 3, x + 24, y + 188, stepW - 48, 160, step.body, { ...TYPE.cardBody, fontSize: 16 }),
    ];
  }),
  ...slideBadge(9, '05'),
];

// ─── Slide 6: Real-World Example — split with large image ──────────────────
const scene06 = sceneBase('cm_scene_06', 6, 'Example', 'Split', 'Practical scenario with large workshop image and callout quote.', 'Example → Recap', ['example', 'scenario'], {
  image: { x: CONTENT.x, y: CONTENT.y, width: 500, height: CONTENT.h },
  text: { x: CONTENT.x + 520, y: CONTENT.y, width: CONTENT.w - 520, height: CONTENT.h },
}, 'bg-blush', 'br-small');
scene06.clips = [
  fullBleedImage('bg_ex', 'course-workshop', C.blush),
  scrim('scrim_ex', 1, 'rgba(253, 240, 232, 0.82)'),
  shape('frame_l', 2, CONTENT.x, CONTENT.y, 500, CONTENT.h, { backgroundColor: C.white, borderRadius: '24px', boxShadow: '0 20px 50px rgba(17,24,39,0.1)' }),
  ...heroImage('img_ex', 4, CONTENT.x + 12, CONTENT.y + 12, 476, CONTENT.h - 24, 'course-workshop', C.warm, { style: { borderRadius: '18px', objectFit: 'cover' }, alt: 'Workshop example' }),
  text('t_label', 10, CONTENT.x + 520, CONTENT.y + 8, 200, 24, 'IN PRACTICE', { ...TYPE.subheading, fontSize: 11, color: C.terracotta }),
  text('t_title', 11, CONTENT.x + 520, CONTENT.y + 36, CONTENT.maxX - CONTENT.x - 520, 100, 'See It in Action', { ...TYPE.displaySerif, fontSize: 44, color: C.forest, lineHeight: 1.05 }),
  text('t_body', 12, CONTENT.x + 520, CONTENT.y + 148, CONTENT.maxX - CONTENT.x - 536, 100, COPY.exampleBody, { ...TYPE.body, fontSize: 17 }),
  text('t_body2', 13, CONTENT.x + 520, CONTENT.y + 256, CONTENT.maxX - CONTENT.x - 536, 80, COPY.exampleBody2, { ...TYPE.body, fontSize: 16, color: C.muted }),
  shape('callout', 3, CONTENT.x + 520, CONTENT.y + 340, CONTENT.maxX - CONTENT.x - 520, 120, { backgroundColor: C.white, borderRadius: '16px', borderLeft: `5px solid ${C.gold}`, boxShadow: '0 10px 28px rgba(17,24,39,0.06)' }),
  text('t_callout', 15, CONTENT.x + 544, CONTENT.y + 364, CONTENT.maxX - CONTENT.x - 560, 80, '"When teams follow this sequence, handoffs are clearer and errors drop significantly."', { ...TYPE.accent, fontSize: 17, fontStyle: 'italic', color: C.forest }),
  ...slideBadge(9, '06'),
];

// ─── Slide 7: Key Takeaways — full-bleed recap background ──────────────────
const tkW = Math.floor((CONTENT.w - 32) / 3);
const takeaways = [
  { icon: 'brain', title: 'Remember the why', body: 'Connect each step back to the learner outcome and the business result you are trying to achieve.', color: C.terracotta },
  { icon: 'target', title: 'Follow the process', body: 'Use the same sequence every time so quality stays predictable across the team.', color: C.forest },
  { icon: 'book', title: 'Practice early', body: 'Short exercises and real examples beat long theory when building lasting skills.', color: C.sage },
];
const scene07 = sceneBase('cm_scene_07', 7, 'Key Takeaways', 'Grid', 'Recap pillars on photographic background with frosted cards.', 'Recap → Quiz', ['recap', 'takeaways'], {
  grid: { x: CONTENT.x, y: CONTENT.y + 72, width: CONTENT.w, height: 400 },
}, 'bg-gradient-warm', 'bl-mini');
scene07.clips = [
  fullBleedImage('bg_recap', 'course-recap-bg', C.cream),
  scrim('scrim_recap', 1, 'rgba(249, 248, 246, 0.84)'),
  text('t_title', 10, CONTENT.x, CONTENT.y, CONTENT.w, 52, 'Key Takeaways', { ...TYPE.displaySerif, fontSize: 42, color: C.forest }),
  text('t_sub', 11, CONTENT.x, CONTENT.y + 48, CONTENT.w, 44, 'Three essential points to remember before moving on to the knowledge check and next module.', { ...TYPE.body, fontSize: 17 }),
  ...takeaways.flatMap((item, i) => {
    const n = i + 1;
    const x = CONTENT.x + i * (tkW + 16);
    const y = CONTENT.y + 88;
    return [
      shape(`tk${n}`, 3, x, y, tkW, 360, { backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: '20px', boxShadow: '0 16px 40px rgba(17,24,39,0.08)', borderTop: `4px solid ${item.color}` }, 'decoration', 'course-card-white'),
      ...iconBadge(`tkico${n}`, 8, x + 24, y + 24, 44, item.icon, C.warm),
      text(`tkt${n}`, 12 + i * 2, x + 24, y + 84, tkW - 48, 44, item.title, { ...TYPE.cardTitle, fontSize: 22 }),
      text(`tkb${n}`, 13 + i * 2, x + 24, y + 136, tkW - 48, 200, item.body, { ...TYPE.cardBody, fontSize: 16 }),
    ];
  }),
  ...slideBadge(9, '07'),
];

// ─── Slide 8: Knowledge Check — dark forest + CTA panel ────────────────────
const scene08 = sceneBase('cm_scene_08', 8, 'Knowledge Check', 'Promo', 'Quiz on dark forest background with next-module CTA.', 'Quiz → End', ['quiz', 'closing'], {
  cta: { x: CONTENT.x, y: CONTENT.y, width: CONTENT.w, height: CONTENT.h },
}, 'bg-gradient-forest', 'dark');
scene08.clips = [
  fullBleedImage('bg_quiz', 'course-classroom', C.forest),
  shape('bg_dark', 1, 0, 0, W, H, { background: `linear-gradient(160deg, rgba(27,48,34,0.92) 0%, rgba(11,20,16,0.96) 100%)` }),
  shape('glow', 2, 0, 0, W, 280, { background: `radial-gradient(ellipse at 75% 0%, rgba(232, 184, 74, 0.22) 0%, transparent 70%)` }),
  ...iconBadge('quiz_ico', 6, CONTENT.x, CONTENT.y, 48, 'quiz', C.panelDark),
  text('t_title', 10, CONTENT.x + 60, CONTENT.y + 4, 400, 44, 'Knowledge Check', { ...TYPE.displaySerif, fontSize: 32, color: C.white }),
  text('t_question', 11, CONTENT.x, CONTENT.y + 64, 620, 72, 'Which step comes first when applying this process in a real task?', { ...TYPE.bodyOnDark, fontSize: 20, fontWeight: '600', color: C.white }),
  ...['A  Prepare', 'B  Execute', 'C  Review'].flatMap((opt, i) => [
    shape(`opt${i}`, 4, CONTENT.x, CONTENT.y + 156 + i * 56, 300, 44, { backgroundColor: i === 0 ? C.terracotta : 'rgba(255,255,255,0.08)', borderRadius: '100px', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.18)' }),
    text(`optt${i}`, 14 + i, CONTENT.x + 20, CONTENT.y + 166 + i * 56, 260, 28, opt, { ...TYPE.bodyOnDark, fontSize: 14, fontWeight: '600', color: C.white }),
  ]),
  shape('cta_panel', 5, CONTENT.x + 660, CONTENT.y + 24, CONTENT.maxX - CONTENT.x - 660, CONTENT.h - 48, { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)' }),
  text('t_next_lbl', 16, CONTENT.x + 692, CONTENT.y + 56, 200, 24, 'UP NEXT', { ...TYPE.label, color: C.gold }),
  text('t_next_title', 17, CONTENT.x + 692, CONTENT.y + 88, CONTENT.maxX - CONTENT.x - 724, 100, 'Module 02:\nAdvanced Practice', { ...TYPE.display, fontSize: 30, color: C.white, lineHeight: 1.12, textTransform: 'none' }),
  text('t_next_body', 18, CONTENT.x + 692, CONTENT.y + 200, CONTENT.maxX - CONTENT.x - 724, 100, 'Continue with applied exercises and a final skills check.', { ...TYPE.bodyOnDark, fontSize: 14, color: 'rgba(249,248,246,0.85)' }),
  shape('cta_btn', 6, CONTENT.x + 692, CONTENT.y + 320, 240, 48, { background: `linear-gradient(90deg, ${C.terracotta} 0%, ${C.gold} 100%)`, borderRadius: '100px' }),
  text('t_btn', 19, CONTENT.x + 712, CONTENT.y + 332, 200, 28, 'CONTINUE', { ...TYPE.heading, fontSize: 13, color: C.white, letterSpacing: '0.16em' }),
  ...iconBadge('cert_ico', 8, CONTENT.x + 692, CONTENT.y + 388, 36, 'certificate', C.forest),
  text('t_cert', 20, CONTENT.x + 740, CONTENT.y + 396, 320, 24, 'Certificate on completion', { ...TYPE.bodyOnDark, fontSize: 12 }),
  ...slideBadge(9, '08'),
];

const SCENE_BG = [
  'bg-cream',
  'bg-warm',
  'bg-cream',
  'bg-sage-mist',
  'bg-warm',
  'bg-blush',
  'bg-gradient-warm',
  'bg-gradient-forest',
];

const SCENE_AVATAR = [
  'cover',
  'tr-mini',
  'br-mini',
  'bl-mini',
  'br-mini',
  'br-small',
  'bl-mini',
  'dark',
];

[scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08].forEach((scene, i) => {
  finalizeScene(scene, SCENE_BG[i], SCENE_AVATAR[i]);
});

const template = {
  category: 'Courses',
  template: {
    id: 'course-module-academic-forge',
    name: 'Course Module — Academic Forge Bundle',
    category: 'Courses',
    theme: assets.theme,
    presenter: PRESENTER,
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    colorPalette: C,
    typography: TYPE,
    backgroundPresets: BACKGROUND_PRESETS,
    description: 'Professional 8-slide training module with full-bleed backgrounds, forest and gold palette, Poppins and Source Serif typography, circular cover hero, framework cards, and knowledge-check closing.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
