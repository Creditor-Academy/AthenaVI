import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/product_launch_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/product-launch-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 8;
const W = 1280;
const H = 720;
const C = assets.colors;
const F = assets.theme.fonts;

const SAFE = {
  x: Math.round(W * 0.05),
  y: Math.round(H * 0.05),
};
SAFE.w = W - SAFE.x * 2;
SAFE.h = H - SAFE.y * 2;
SAFE.maxX = SAFE.x + SAFE.w;
SAFE.maxY = SAFE.y + SAFE.h;

const PRESENTER = assets.presenter || {};
const PRESENTER_SRC = PRESENTER.previewSrc || 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800';

const AVATAR_STYLE_LIGHT = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: '3px solid #faf7f2',
  boxShadow: '0 10px 28px rgba(28, 25, 23, 0.2)',
};

const AVATAR_STYLE_DARK = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: '3px solid #c8e64a',
  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
};

const AVATAR_STYLE_EDITORIAL = {
  objectFit: 'cover',
  borderRadius: '16px',
  border: '3px solid #faf7f2',
  boxShadow: '0 12px 32px rgba(28, 25, 23, 0.22)',
};

/** Corner slots — avatars sit in margins and must not overlap slide content. */
const AVATAR_MARGIN = 20;

function avatarLayout(preset = 'bl-small') {
  const m = AVATAR_MARGIN;
  const layouts = {
    /** Bottom-left — clear when right side has images/text */
    'bl-small': {
      size: { width: 108, height: 130 },
      pos: { x: SAFE.x, y: H - 130 - m },
      style: AVATAR_STYLE_LIGHT,
    },
    'bl-mini': {
      size: { width: 92, height: 110 },
      pos: { x: SAFE.x, y: H - 110 - m },
      style: AVATAR_STYLE_LIGHT,
    },
    /** Bottom-right — clear when left side has content */
    'br-small': {
      size: { width: 108, height: 130 },
      pos: { x: W - 108 - m, y: H - 130 - m },
      style: AVATAR_STYLE_LIGHT,
    },
    'br-mini': {
      size: { width: 92, height: 110 },
      pos: { x: W - 92 - m, y: H - 110 - m },
      style: AVATAR_STYLE_LIGHT,
    },
    /** Cover: tuck left under headline, away from center card */
    cover: {
      size: { width: 96, height: 116 },
      pos: { x: SAFE.x, y: H - 116 - m },
      style: { ...AVATAR_STYLE_LIGHT, border: '2px solid rgba(255,255,255,0.9)' },
    },
    /** Dark CTA: small, bottom-right clear zone */
    dark: {
      size: { width: 100, height: 120 },
      pos: { x: W - 100 - m, y: H - 120 - m },
      style: AVATAR_STYLE_DARK,
    },
    /** Top-right — dense full-width layouts (feature grid) */
    'tr-mini': {
      size: { width: 88, height: 106 },
      pos: { x: W - 88 - m, y: SAFE.y + 44 },
      style: AVATAR_STYLE_LIGHT,
    },
  };
  return layouts[preset] || layouts['bl-small'];
}

const BACKGROUND_PRESETS = assets.backgrounds.map((bg) => ({
  id: bg.id,
  name: bg.name,
  type: bg.value.includes('gradient') ? 'gradient' : 'solid',
  value: bg.value,
}));

const TYPE = {
  brand: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.copper },
  display: { fontFamily: F.display, fontWeight: '700', color: C.ink },
  displayOnDark: { fontFamily: F.display, fontWeight: '700', color: C.cream },
  displayHero: { fontFamily: F.display, fontWeight: '700', color: C.cream, lineHeight: 0.92 },
  heading: { fontFamily: F.sans, fontWeight: '700', color: C.ink, letterSpacing: '0.06em' },
  headingOnDark: { fontFamily: F.sans, fontWeight: '700', color: C.cream, letterSpacing: '0.08em', textTransform: 'uppercase' },
  body: { fontFamily: F.sans, fontWeight: '400', color: C.stone, lineHeight: 1.65 },
  bodyOnDark: { fontFamily: F.sans, fontWeight: '400', color: C.muted, lineHeight: 1.65 },
  quote: { fontFamily: F.accent, fontWeight: '400', fontStyle: 'italic', color: C.ink, lineHeight: 1.55 },
  label: { fontFamily: F.sans, fontWeight: '600', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.copper },
  stat: { fontFamily: F.display, fontWeight: '700', color: C.ink },
  accent: { fontFamily: F.sans, fontWeight: '700', color: C.chartreuse },
};

function shouldFitToSafeArea(clip) {
  if (clip.isBackground) return false;
  if (clip.type === 'text') return true;
  if (clip.type === 'avatar') return false;
  if (clip.role === 'icon' || clip.role === 'logo') return true;
  if (clip.shapeKey === 'launch-icon-badge') return true;
  if (clip.type === 'image') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    const fullWidth = x <= 10 && w >= W * 0.9;
    const fullHeight = y <= 10 && h >= H * 0.85;
    return !(fullWidth || fullHeight);
  }
  if (clip.type === 'shape') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    if (w >= W * 0.9 && h >= H * 0.9) return false;
    if (w >= W * 0.55 || h >= H * 0.55) return false;
    if (clip.layer <= 2 && (w >= W * 0.45 || h >= H * 0.45)) return false;
    return w < 700 && h < 500;
  }
  return false;
}

function fitClipToSafeArea(clip) {
  if (!shouldFitToSafeArea(clip)) return clip;
  let x = clip.position?.x ?? 0;
  let y = clip.position?.y ?? 0;
  let w = clip.size?.width ?? 0;
  let h = clip.size?.height ?? 0;
  if (!w && !h) return clip;

  w = Math.min(w, SAFE.w);
  h = Math.min(h, SAFE.h);
  x = Math.max(SAFE.x, Math.min(x, SAFE.maxX - w));
  y = Math.max(SAFE.y, Math.min(y, SAFE.maxY - h));

  return {
    ...clip,
    position: { x: Math.round(x), y: Math.round(y) },
    size: { width: Math.round(w), height: Math.round(h) },
  };
}

function enforceSafeArea(scene) {
  scene.clips = scene.clips.map(fitClipToSafeArea);
  if (scene.zones?.avatar) {
    const zone = avatarLayout(scene._avatarPreset || 'default');
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

function image(id, layer, x, y, w, h, assetId, extra = {}) {
  const asset = assets.images.find((item) => item.id === assetId);
  return {
    id, type: 'image', assetKey: assetId,
    role: extra.role || asset?.role || 'hero-image',
    editable: true, layer,
    position: { x, y }, size: { width: w, height: h },
    startTime: 0, endTime: DURATION,
    src: asset?.src, placeholder: true, alt: extra.alt || asset?.name || '', style: extra.style,
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

function scrim(id, layer, color = C.overlay) {
  return shape(id, layer, 0, 0, W, H, { backgroundColor: color }, 'scrim', 'launch-scrim');
}

function heroImage(id, layer, x, y, w, h, assetId, colorFallback, extra = {}) {
  const shapeStyle = {
    backgroundColor: colorFallback,
    borderRadius: extra.style?.borderRadius || '24px',
    ...(extra.style?.boxShadow ? { boxShadow: extra.style.boxShadow } : {}),
  };
  return [
    shape(`${id}_color`, layer, x, y, w, h, shapeStyle, 'hero-color-fallback', 'launch-frame-soft'),
    image(id, layer + 1, x, y, w, h, assetId, {
      ...extra,
      swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
    }),
  ];
}

function iconBadge(id, layer, x, y, size, iconAssetId, bg = C.warmWhite) {
  const pad = Math.round(size * 0.18);
  const iconAsset = assets.icons.find((item) => item.id === iconAssetId);
  return [
    shape(`${id}_bg`, layer, x, y, size, size, { backgroundColor: bg, borderRadius: '50%', border: `1px solid ${C.line}` }, 'decoration', 'launch-icon-badge'),
    {
      id, type: 'image', assetKey: iconAssetId, role: 'icon', editable: true, layer: layer + 1,
      position: { x: x + pad, y: y + pad }, size: { width: size - pad * 2, height: size - pad * 2 },
      startTime: 0, endTime: DURATION,
      src: iconAsset?.src, placeholder: true, alt: iconAsset?.name || '',
      style: { objectFit: 'contain', backgroundColor: 'transparent' },
    },
  ];
}

function avatarClip(layer = 60, preset = 'default') {
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

function finalizeScene(scene, bgId = 'bg-cream', avatarPreset = 'default') {
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

function sceneBase(id, slideIndex, title, layoutType, description, flow, tags, zones, bgId = 'bg-cream', avatarPreset = 'default') {
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
    tags: ['product-launch', 'editorial', ...tags],
    clips: [],
  };
}

// ─── Slide 1: Cover — full-bleed lifestyle + serif hero ─────────────────────
const scene01 = sceneBase('pl_scene_01', 1, 'Cover', 'Cover', 'Full-bleed cover image with editorial serif headline and cream content card.', 'Cover → Problem', ['cover', 'full-bleed'], {
  hero: { x: 0, y: 0, width: W, height: H },
  card: { x: 680, y: 200, width: 420, height: 300 },
}, 'bg-cream');
scene01.clips = [
  fullBleedImage('bg_cover', 'launch-cover-full', C.ink),
  scrim('scrim_cover', 1),
  text('t_brand', 10, 64, 48, 400, 24, 'YOUR BRAND · PRODUCT LAUNCH', { ...TYPE.brand, color: C.cream }),
  text('t_line', 11, 64, 76, 520, 2, '', { backgroundColor: C.cream, opacity: 0.35 }),
  text('t_product', 12, 64, 120, 620, 200, 'PRODUCT\nLAUNCH', { ...TYPE.displayHero, fontSize: 108, letterSpacing: '-0.02em' }),
  shape('card_bg', 8, 680, 200, 420, 300, { backgroundColor: C.cream, borderRadius: '4px', boxShadow: '0 24px 60px rgba(10, 10, 10, 0.22)' }, 'decoration', 'launch-cream-card'),
  text('t_card_body', 13, 720, 240, 340, 180, 'A refined launch story for your next release. Replace this copy with your product promise, audience, and launch date.', { ...TYPE.body, fontSize: 15, color: C.ink, lineHeight: 1.7 }),
  text('t_card_label', 14, 720, 440, 340, 28, 'AVAILABLE NOW', { ...TYPE.label, color: C.copper }),
  image('img_logo', 15, 720, 500, 180, 40, 'launch-logo', { style: { objectFit: 'contain' }, alt: 'Brand logo', role: 'logo' }),
];

// ─── Slide 2: The Problem — editorial vision layout ─────────────────────────
const scene02 = sceneBase('pl_scene_02', 2, 'The Problem', 'Split', 'Vision-style split with serif headline, rule lines, and portrait frame.', 'Problem → Comparison', ['problem', 'vision'], {
  text: { x: 64, y: 100, width: 520, height: 520 },
  image: { x: 700, y: 80, width: 520, height: 560 },
}, 'bg-cream');
scene02.clips = [
  shape('grid_hint', 0, 0, 0, W, H, { backgroundColor: C.cream }),
  shape('line_top', 1, 64, 88, 420, 1, { backgroundColor: C.line }, 'decoration', 'launch-line-h'),
  text('t_brand', 10, 64, 56, 300, 24, 'YOUR BRAND', { ...TYPE.brand, color: C.ink }),
  text('t_title', 11, 64, 140, 560, 140, 'The Problem\nWe Solve', { ...TYPE.display, fontSize: 64, lineHeight: 1.05 }),
  shape('line_mid', 12, 64, 300, 200, 1, { backgroundColor: C.line }, 'decoration', 'launch-line-h'),
  text('t_body', 13, 64, 330, 520, 140, 'Teams waste time on fragmented tools, slow launches, and messaging that never feels premium. Your product deserves a clearer story.', { ...TYPE.body, fontSize: 17, color: C.ink }),
  shape('accent_line', 14, 64, 500, 4, 100, { backgroundColor: C.copper, borderRadius: '2px' }, 'decoration', 'launch-line-accent'),
  text('t_caption', 15, 64, 520, 400, 28, 'Replace with your customer pain points.', { ...TYPE.label, color: C.stone }),
  shape('frame_shadow', 5, 688, 72, 536, 576, { backgroundColor: C.sand, borderRadius: '28px' }, 'decoration', 'launch-frame-round'),
  ...heroImage('img_portrait', 6, 700, 80, 512, 560, 'launch-portrait', C.sand, { style: { borderRadius: '28px', objectFit: 'cover' }, alt: 'Brand portrait' }),
];

// ─── Slide 3: Before & After — refined comparison ─────────────────────────────
const scene03 = sceneBase('pl_scene_03', 3, 'Before & After', 'Split', 'Elegant before/after frames with copper labels on warm background.', 'Comparison → Reveal', ['before-after', 'comparison'], {
  left: { x: 80, y: 160, width: 520, height: 420 },
  right: { x: 680, y: 160, width: 520, height: 420 },
}, 'bg-sand');
scene03.clips = [
  text('t_title', 10, 0, 56, W, 56, 'FROM CHAOS TO CLARITY', { ...TYPE.heading, fontSize: 14, textAlign: 'center', color: C.copper, letterSpacing: '0.24em' }),
  text('t_sub', 11, 200, 88, 880, 48, 'Before & After', { ...TYPE.display, fontSize: 52, textAlign: 'center' }),
  shape('frame_l', 2, 80, 160, 520, 420, { backgroundColor: C.warmWhite, borderRadius: '24px', boxShadow: '0 16px 40px rgba(28,25,23,0.08)' }, 'decoration', 'launch-frame-soft'),
  shape('frame_r', 2, 680, 160, 520, 420, { backgroundColor: C.warmWhite, borderRadius: '24px', boxShadow: '0 16px 40px rgba(28,25,23,0.08)' }, 'decoration', 'launch-frame-soft'),
  ...heroImage('img_before', 4, 100, 180, 480, 300, 'launch-before', C.sand, { style: { borderRadius: '18px', objectFit: 'cover' }, alt: 'Before' }),
  ...heroImage('img_after', 4, 700, 180, 480, 300, 'launch-after', C.sand, { style: { borderRadius: '18px', objectFit: 'cover' }, alt: 'After' }),
  shape('pill_before', 8, 120, 140, 110, 36, { backgroundColor: C.panelDark, borderRadius: '100px' }, 'decoration', 'launch-pill'),
  text('lbl_before', 12, 120, 146, 110, 28, 'BEFORE', { ...TYPE.label, fontSize: 11, color: C.cream, textAlign: 'center' }),
  shape('pill_after', 8, 720, 140, 100, 36, { backgroundColor: C.copper, borderRadius: '100px' }, 'decoration', 'launch-pill'),
  text('lbl_after', 13, 720, 146, 100, 28, 'AFTER', { ...TYPE.label, fontSize: 11, color: C.cream, textAlign: 'center' }),
  text('t_before', 14, 100, 500, 480, 64, 'Manual workflows, scattered assets, and inconsistent brand presentation.', { ...TYPE.body, fontSize: 15, textAlign: 'center' }),
  text('t_after', 15, 700, 500, 480, 64, 'One polished bundle, unified theme, and launch-ready scenes in minutes.', { ...TYPE.body, fontSize: 15, textAlign: 'center' }),
];

// ─── Slide 4: Product Reveal — asymmetric editorial grid ──────────────────────
const scene04 = sceneBase('pl_scene_04', 4, 'Product Reveal', 'Grid', 'Asymmetric grid with rounded image frames and dark copy panel.', 'Reveal → Features', ['reveal', 'product'], {
  images: { x: 640, y: 64, width: 600, height: 592 },
  copy: { x: 64, y: 420, width: 560, height: 220 },
}, 'bg-warm-white');
scene04.clips = [
  text('t_brand_row', 10, 64, 48, 800, 28, 'BRAND NAME    PRODUCT STORY    FLAVOR PROFILE', { ...TYPE.brand, fontSize: 10, color: C.ink, letterSpacing: '0.22em' }),
  shape('brand_line', 1, 64, 78, 1152, 1, { backgroundColor: C.line }, 'decoration', 'launch-line-h'),
  text('t_title', 11, 64, 110, 520, 160, 'PRODUCT\nREVEAL', { ...TYPE.display, fontSize: 72, lineHeight: 0.95 }),
  ...heroImage('img_h', 5, 660, 90, 520, 280, 'launch-detail-horizontal', C.sand, { style: { borderRadius: '24px', objectFit: 'cover' }, alt: 'Lifestyle shot' }),
  ...heroImage('img_v', 5, 920, 250, 300, 380, 'launch-detail-vertical', C.sand, { style: { borderRadius: '28px', objectFit: 'cover' }, alt: 'Product detail' }),
  shape('copy_panel', 6, 64, 420, 560, 220, { backgroundColor: C.panelDark, borderRadius: '24px' }, 'decoration', 'launch-dark-card'),
  text('t_copy', 12, 96, 450, 500, 160, 'This is where your product story lands. Describe the experience, the craft, and the outcome customers feel on day one.', { ...TYPE.bodyOnDark, fontSize: 16, color: C.cream }),
  shape('page_pill', 7, 64, 660, 100, 32, { backgroundColor: 'transparent', border: `1px solid ${C.ink}`, borderRadius: '100px' }),
  text('t_page', 13, 76, 666, 80, 24, '04', { ...TYPE.label, fontSize: 11, color: C.ink }),
];

// ─── Slide 5: Key Features — unified copper accent cards ────────────────────
const features = [
  { x: 64, num: '01', icon: 'lightbulb', title: 'Clarity', tone: C.copper },
  { x: 448, num: '02', icon: 'gears', title: 'Speed', tone: C.ink },
  { x: 832, num: '03', icon: 'diamond', title: 'Quality', tone: C.copper },
];
const scene05 = sceneBase('pl_scene_05', 5, 'Key Features', 'Grid', 'Three refined feature cards with serif numerals and copper accents.', 'Features → Benefits', ['features', 'grid'], {
  grid: { x: 64, y: 180, width: 1152, height: 440 },
}, 'bg-gradient-warm');
scene05.clips = [
  text('t_title', 10, 64, 72, 700, 72, 'What Makes It Different', { ...TYPE.display, fontSize: 48 }),
  text('t_sub', 11, 64, 140, 640, 40, 'Three pillars that stay consistent across your entire launch bundle.', { ...TYPE.body, fontSize: 16, color: C.ink }),
  ...features.flatMap((feat, i) => {
    const n = i + 1;
    return [
      shape(`card${n}`, 2, feat.x, 200, 340, 400, { backgroundColor: C.warmWhite, borderRadius: '20px', boxShadow: '0 12px 36px rgba(28,25,23,0.08)', border: `1px solid ${C.line}` }, 'decoration', 'launch-feature-card'),
      text(`num${n}`, 12 + i * 3, feat.x + 28, 220, 120, 72, feat.num, { ...TYPE.display, fontSize: 56, color: feat.tone }),
      ...iconBadge(`ico${n}`, 8, feat.x + 28, 300, 48, feat.icon, C.cream),
      text(`h${n}`, 13 + i * 3, feat.x + 28, 360, 280, 36, feat.title, { ...TYPE.heading, fontSize: 22, color: C.ink }),
      text(`b${n}`, 14 + i * 3, feat.x + 28, 404, 280, 160, 'Replace with a concise benefit statement that reinforces your product positioning.', { ...TYPE.body, fontSize: 14 }),
      shape(`bar${n}`, 3, feat.x + 28, 560, 120, 4, { backgroundColor: feat.tone, borderRadius: '2px' }),
    ];
  }),
];

// ─── Slide 6: Why Choose Us — minimal editorial benefits ────────────────────
const benefits = [
  { y: 200, title: 'Premium Presentation', body: 'Every scene shares the same palette, type, and spacing.' },
  { y: 310, title: 'Flexible Backgrounds', body: 'Swap full-bleed images for solid colors in one click.' },
  { y: 420, title: 'Launch-Ready Structure', body: 'Cover, problem, reveal, proof, and CTA already mapped.' },
];
const scene06 = sceneBase('pl_scene_06', 6, 'Why Choose Us', 'ListRight', 'Editorial benefit list with portrait frame and copper accents.', 'Benefits → Proof', ['why-us', 'benefits'], {
  list: { x: 64, y: 120, width: 620, height: 480 },
  image: { x: 760, y: 100, width: 460, height: 520 },
}, 'bg-stone-light');
scene06.clips = [
  text('t_title', 10, 64, 88, 560, 100, 'Why Choose\nThis Product', { ...TYPE.display, fontSize: 54, lineHeight: 1.02 }),
  shape('line_title', 1, 64, 200, 180, 1, { backgroundColor: C.line }, 'decoration', 'launch-line-h'),
  ...benefits.flatMap((item, i) => [
    shape(`row${i}`, 2, 64, item.y, 600, 88, { backgroundColor: i === 1 ? C.warmWhite : 'transparent', borderRadius: '12px', border: i === 1 ? `1px solid ${C.line}` : 'none' }),
    text(`bh${i}`, 11 + i * 2, 88, item.y + 14, 520, 28, item.title, { ...TYPE.heading, fontSize: 18, color: C.ink }),
    text(`bb${i}`, 12 + i * 2, 88, item.y + 44, 520, 40, item.body, { ...TYPE.body, fontSize: 14 }),
  ]),
  shape('frame_r', 4, 748, 88, 484, 544, { backgroundColor: C.sand, borderRadius: '28px' }),
  ...heroImage('img_why', 5, 760, 100, 460, 520, 'launch-hero-product', C.sand, { style: { borderRadius: '28px', objectFit: 'cover' }, alt: 'Product flat lay' }),
  shape('copper_tag', 8, 800, 140, 140, 36, { backgroundColor: C.copper, borderRadius: '100px' }),
  text('tag', 20, 812, 148, 116, 24, 'WHY US', { ...TYPE.label, fontSize: 10, color: C.cream, textAlign: 'center' }),
];

// ─── Slide 7: Social Proof — stats + serif quote ────────────────────────────
const stats = [
  { x: 100, value: '10K+', label: 'Early adopters' },
  { x: 430, value: '4.9', label: 'Average rating' },
  { x: 760, value: '98%', label: 'Would recommend' },
];
const scene07 = sceneBase('pl_scene_07', 7, 'Social Proof', 'StatsHighlight', 'Metrics row with editorial testimonial and team image.', 'Proof → CTA', ['social-proof', 'stats'], {
  stats: { x: 64, y: 160, width: 1152, height: 180 },
}, 'bg-cream');
scene07.clips = [
  text('t_title', 10, 64, 72, 500, 64, 'Trusted at Launch', { ...TYPE.display, fontSize: 48 }),
  text('t_sub', 11, 64, 132, 560, 32, 'Social proof that matches the same premium visual system.', { ...TYPE.body, fontSize: 15, color: C.ink }),
  ...stats.flatMap((stat, i) => [
    shape(`stat${i}`, 2, stat.x, 180, 280, 150, { backgroundColor: C.warmWhite, borderRadius: '18px', border: `1px solid ${C.line}` }),
    text(`sv${i}`, 12 + i * 2, stat.x + 24, 206, 232, 64, stat.value, { ...TYPE.stat, fontSize: 48, color: C.copper }),
    text(`sl${i}`, 13 + i * 2, stat.x + 24, 278, 232, 32, stat.label, { ...TYPE.label, fontSize: 11, color: C.stone, letterSpacing: '0.14em' }),
  ]),
  shape('quote_card', 3, 64, 380, 820, 200, { backgroundColor: C.warmWhite, borderRadius: '20px', borderLeft: `5px solid ${C.copper}` }),
  text('t_quote', 14, 100, 420, 740, 100, '"This bundle finally made our launch video feel as considered as the product itself — cohesive, polished, and fast to customize."', { ...TYPE.quote, fontSize: 24 }),
  text('t_author', 15, 100, 540, 400, 28, '— Customer Name, Company', { ...TYPE.body, fontSize: 14, fontWeight: '600', color: C.ink }),
  ...heroImage('img_team', 5, 920, 380, 300, 200, 'launch-team', C.sand, { style: { borderRadius: '20px', objectFit: 'cover' }, alt: 'Customer moment' }),
];

// ─── Slide 8: Launch CTA — dark closing slide ───────────────────────────────
const scene08 = sceneBase('pl_scene_08', 8, 'Launch CTA', 'Promo', 'Dark closing slide with accent typography and contact details.', 'CTA → End', ['cta', 'closing'], {
  hero: { x: 64, y: 120, width: 420, height: 480 },
  cta: { x: 520, y: 100, width: 700, height: 520 },
}, 'bg-dark');
scene08.clips = [
  shape('bg_dark', 0, 0, 0, W, H, { backgroundColor: C.dark }),
  shape('glow', 1, 0, 520, W, 200, { background: `radial-gradient(ellipse at 30% 0%, rgba(200, 230, 74, 0.18) 0%, transparent 70%)` }),
  ...heroImage('img_close', 4, 64, 140, 360, 420, 'launch-closing-product', C.panelDark, { style: { borderRadius: '24px', objectFit: 'cover' }, alt: 'Closing product shot' }),
  shape('accent_oval', 5, 120, 500, 260, 56, { backgroundColor: C.chartreuse, borderRadius: '100px', opacity: 0.9 }),
  text('t_thanks', 10, 520, 120, 700, 180, 'READY TO\nLAUNCH', { ...TYPE.displayOnDark, fontSize: 72, lineHeight: 0.95, color: C.cream }),
  text('t_thanks_accent', 11, 520, 290, 700, 60, 'WITH CONFIDENCE', { ...TYPE.headingOnDark, fontSize: 28, color: C.chartreuse }),
  shape('accent_rule', 12, 520, 370, 4, 88, { backgroundColor: C.chartreuse, borderRadius: '2px' }, 'decoration', 'launch-line-accent'),
  text('t_body', 13, 548, 390, 620, 100, 'Built for clarity, consistency, and a premium first impression — so your team can launch with purpose and move forward.', { ...TYPE.bodyOnDark, fontSize: 15, color: C.muted }),
  shape('cta_btn', 14, 520, 520, 280, 52, { backgroundColor: C.chartreuse, borderRadius: '100px' }),
  text('t_btn', 15, 548, 532, 240, 32, 'GET STARTED', { ...TYPE.heading, fontSize: 14, color: C.dark, letterSpacing: '0.16em' }),
  ...iconBadge('ico_web', 8, 520, 600, 40, 'website', C.panelDark),
  text('t_web', 16, 572, 606, 320, 28, 'www.yourproduct.com', { ...TYPE.bodyOnDark, fontSize: 14, color: C.cream }),
  ...iconBadge('ico_email', 8, 520, 650, 40, 'email', C.panelDark),
  text('t_email', 17, 572, 656, 320, 28, 'hello@yourproduct.com', { ...TYPE.bodyOnDark, fontSize: 14, color: C.cream }),
];

const SCENE_BG = [
  'bg-cream',
  'bg-cream',
  'bg-sand',
  'bg-warm-white',
  'bg-gradient-warm',
  'bg-stone-light',
  'bg-cream',
  'bg-dark',
];

/** Per-slide corner slot — avoids overlapping hero images, cards, and copy blocks */
const SCENE_AVATAR = [
  'cover',     // 1 Cover — left margin (card is center-right)
  'bl-small',  // 2 Problem — portrait on right
  'bl-mini',   // 3 Before/After — frames centered
  'br-mini',   // 4 Reveal — copy panel bottom-left
  'tr-mini',   // 5 Features — three full-width cards (top-right margin)
  'bl-small',  // 6 Why Us — image on right
  'bl-mini',   // 7 Social proof — stats + quote span width
  'dark',      // 8 CTA — product shot on left
];

[scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08].forEach((scene, i) => {
  finalizeScene(scene, SCENE_BG[i], SCENE_AVATAR[i]);
});

const template = {
  category: 'Company',
  template: {
    id: 'product-launch-editorial',
    name: 'Product Launch — Editorial Bundle',
    category: 'Company',
    theme: assets.theme,
    presenter: PRESENTER,
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    colorPalette: C,
    typography: TYPE,
    backgroundPresets: BACKGROUND_PRESETS,
    description: 'Premium 8-slide product launch bundle with a unified editorial theme: cream and ink palette, Playfair display type, full-bleed cover imagery, rounded frames, and a dark closing CTA.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
