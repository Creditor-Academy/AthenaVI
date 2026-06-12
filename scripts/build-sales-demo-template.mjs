import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/sales_demo_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/sales-demo-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 10;
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

const PRESENTER = { name: assets.presenter?.name || 'Account Executive' };

const COPY = {
  coverSub: 'Discovery Follow-Up · Prepared after our conversation',
  coverBody:
    'A personalized recap of what we discussed, the challenges you shared, and the recommended path forward. Replace this with your prospect company name and meeting context.',
  recapThanks:
    'Thank you for taking the time to walk through your goals, current workflow, and what success looks like for your team. This short video summarizes our conversation so everyone stays aligned.',
  recapBody:
    'In the next few slides you will see the challenges we captured in your words, how our platform maps to each one, the parts of the demo that mattered most, and the concrete next steps we agreed to explore.',
  challengesBody:
    'During our call you highlighted friction in your current process — manual handoffs between teams, slow reporting cycles, and limited visibility for stakeholders who need a clear picture of pipeline health. These gaps create delays, rework, and missed opportunities every week.',
  challengesCaption:
    'The photos below reflect the day-to-day reality your team described: operational complexity on one side, and pressure to deliver accurate updates on the other.',
  solutionIntro:
    'Based on what you shared, we mapped three solution areas that directly address your priorities. Each one connects to a capability we demonstrated live and can be rolled out in phases.',
  solutionBullets:
    '• Unified workflow — one place to plan, execute, and report\n• Automated insights — dashboards that update without manual exports\n• Secure collaboration — shareable views for leadership and ops',
  demoIntro:
    'Here are the three parts of the demo that resonated most with your team. Swap the screenshots for your actual product views and tailor each caption to what you walked through on the call.',
  roiIntro:
    'Teams in similar situations typically see measurable impact within the first quarter — faster cycle times, fewer status meetings, and clearer ownership across handoffs.',
  quote:
    '"We finally have one source of truth for customer conversations and follow-up. Our reps send personalized recap videos instead of long email threads."',
  quoteAuthor: '— VP Sales, Enterprise SaaS',
  stepsIntro:
    'To keep momentum from our conversation, here is a simple mutual action plan. Adjust owners and dates to match what you committed to on the call.',
  ctaBody:
    'I am excited to continue the conversation and answer any questions from your broader team. Pick a time that works for you, or reply to this message and we will coordinate the next session.',
};

const AVATAR_STYLE_LIGHT = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.white}`,
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
};

const AVATAR_STYLE_DARK = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.cobalt}`,
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
};

function avatarLayout(preset = 'br-mini') {
  const pad = 12;
  const layouts = {
    cover: {
      size: { width: 92, height: 112 },
      pos: { x: SAFE.maxX - 92 - pad, y: SAFE.maxY - 112 - pad },
      style: { ...AVATAR_STYLE_LIGHT, border: `3px solid ${C.cobalt}` },
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
  org: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.cobalt },
  display: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 48 },
  displaySerif: { fontFamily: F.serif, fontWeight: '700', color: C.navy, lineHeight: 1.08, fontSize: 40 },
  heading: { fontFamily: F.display, fontWeight: '700', color: C.navy, letterSpacing: '0.02em', fontSize: 32 },
  subheading: { fontFamily: F.sans, fontWeight: '600', color: C.cobalt, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 13 },
  body: { fontFamily: F.sans, fontWeight: '400', color: C.slate, lineHeight: 1.78, fontSize: 18 },
  bodyOnDark: { fontFamily: F.sans, fontWeight: '400', color: C.ice, lineHeight: 1.7, fontSize: 17 },
  label: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted },
  stat: { fontFamily: F.display, fontWeight: '800', color: C.cobalt, fontSize: 44 },
  cardTitle: { fontFamily: F.display, fontWeight: '700', fontSize: 20, color: C.ink },
  cardBody: { fontFamily: F.sans, fontWeight: '400', fontSize: 15, color: C.slate, lineHeight: 1.65 },
  quote: { fontFamily: F.serif, fontWeight: '500', fontStyle: 'italic', color: C.navy, lineHeight: 1.45, fontSize: 22 },
};

const EDGE_DECOR = new Set([
  'sales-blob-beige',
  'sales-slide-badge',
  'sales-dot-grid',
  'sales-scrim',
]);

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
    if (clip.role === 'decoration' && clip.id?.startsWith('blob_')) return false;
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

function buildSceneBackground(bgId = 'bg-white') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  const value = bg?.value || C.white;
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

function fullBleedImage(id, assetId, colorFallback = C.white) {
  return image(id, 0, 0, 0, W, H, assetId, {
    role: 'background',
    isBackground: true,
    style: { objectFit: 'cover' },
    swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
  });
}

function scrim(id, layer, color = 'rgba(255,255,255,0.88)', role = 'scrim') {
  return shape(id, layer, 0, 0, W, H, { backgroundColor: color }, role, 'sales-scrim');
}

function heroImage(id, layer, x, y, w, h, assetId, colorFallback, extra = {}) {
  const shapeStyle = {
    backgroundColor: colorFallback,
    borderRadius: extra.style?.borderRadius || '20px',
    ...(extra.style?.boxShadow ? { boxShadow: extra.style.boxShadow } : {}),
  };
  return [
    shape(`${id}_color`, layer, x, y, w, h, shapeStyle, 'hero-color-fallback', 'sales-card-white'),
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
    shape(`${id}_bg`, layer, x, y, size, size, { backgroundColor: bg, borderRadius: '50%', boxShadow: '0 6px 18px rgba(15,23,42,0.12)' }, 'decoration', 'sales-card-white'),
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
    shape(`slide_badge_${num}`, layer, x, y, size, size, { backgroundColor: C.navy, borderRadius: '50%', border: `3px solid ${C.cobalt}` }, 'decoration', 'sales-slide-badge'),
    text(`slide_num_${num}`, layer + 1, x, y + 9, size, 26, num, { ...TYPE.stat, fontSize: 16, color: C.white, textAlign: 'center' }),
  ];
}

/** Reference-style hero icon — navy ring, amber plate, centered glyph */
function painIconCluster(id, layer, x, y, size = 152) {
  const inner = Math.round(size * 0.72);
  const plateH = Math.round(size * 0.38);
  const plateY = y + Math.round(size * 0.18);
  return [
    shape(`${id}_ring`, layer, x, y, size, size, { backgroundColor: C.ice, borderRadius: '50%', border: `5px solid ${C.navy}`, boxShadow: '0 14px 36px rgba(15,23,42,0.1)' }, 'decoration', 'sales-card-white'),
    shape(`${id}_plate`, layer + 1, x + Math.round((size - inner) / 2), plateY, inner, plateH, { backgroundColor: C.amber, borderRadius: '16px' }),
    shape(`${id}_visor`, layer + 2, x + Math.round((size - inner) / 2), plateY + plateH - 8, inner, Math.round(plateH * 0.55), { backgroundColor: C.navy, borderRadius: '0 0 14px 14px', opacity: 0.92 }),
    ...iconBadge(`${id}_ico`, layer + 3, x + Math.round(size * 0.28), y + Math.round(size * 0.22), Math.round(size * 0.44), 'target', 'transparent'),
  ];
}

function solutionRow(id, layer, x, y, w, title, body) {
  return [
    shape(`${id}_row`, layer, x, y, w, 72, { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }),
    ...iconBadge(`${id}_ico`, layer + 1, x + 14, y + 16, 40, 'check', C.cobalt),
    text(`${id}_title`, layer + 2, x + 64, y + 14, w - 76, 26, title, { ...TYPE.heading, fontSize: 16, color: C.white, textTransform: 'none', letterSpacing: '0' }),
    text(`${id}_body`, layer + 3, x + 64, y + 40, w - 76, 28, body, { ...TYPE.bodyOnDark, fontSize: 13, lineHeight: 1.5, color: 'rgba(241,245,249,0.82)' }),
  ];
}

function metaPill(id, layer, x, y, w, label, bg, color) {
  return [
    shape(`${id}_pill`, layer, x, y, w, 28, { backgroundColor: bg, borderRadius: '100px' }),
    text(`${id}_txt`, layer + 1, x + 10, y + 5, w - 20, 20, label, { ...TYPE.label, fontSize: 10, color, textTransform: 'none', letterSpacing: '0.04em', textAlign: 'center' }),
  ];
}

function actionStepRow(id, layer, x, y, w, step) {
  const rowH = 116;
  return [
    shape(`${id}_card`, layer, x, y, w, rowH, {
      backgroundColor: C.white,
      borderRadius: '16px',
      boxShadow: '0 12px 32px rgba(15,23,42,0.07)',
      border: `1px solid ${C.line}`,
      borderLeft: `5px solid ${step.color}`,
    }, 'decoration', 'sales-card-white'),
    shape(`${id}_num`, layer + 1, x + 18, y + 18, 44, 44, { backgroundColor: step.color, borderRadius: '12px' }),
    text(`${id}_numt`, layer + 2, x + 18, y + 26, 44, 28, step.num, { ...TYPE.stat, fontSize: 15, color: C.white, textAlign: 'center' }),
    ...iconBadge(`${id}_ico`, layer + 1, x + 74, y + 20, 40, step.icon, C.ice),
    text(`${id}_title`, layer + 3, x + 124, y + 18, w - 140, 30, step.title, { ...TYPE.cardTitle, fontSize: 20 }),
    text(`${id}_body`, layer + 4, x + 124, y + 48, w - 140, 52, step.body, { ...TYPE.cardBody, fontSize: 14, lineHeight: 1.55 }),
    ...metaPill(`${id}_own`, layer + 2, x + 124, y + 82, 108, step.owner, step.ownerBg, step.color),
    ...metaPill(`${id}_when`, layer + 2, x + 240, y + 82, 120, step.when, step.whenBg, step.color),
  ];
}

function infoCard(id, layer, x, y, w, h, barColor, title, body) {
  return [
    shape(`${id}_bg`, layer, x, y, w, h, { backgroundColor: C.white, borderRadius: '16px', boxShadow: '0 14px 36px rgba(15,23,42,0.08)' }, 'decoration', 'sales-card-white'),
    shape(`${id}_bar`, layer + 1, x, y + 14, 6, h - 28, { backgroundColor: barColor, borderRadius: '4px' }),
    text(`${id}_title`, layer + 2, x + 24, y + 18, w - 36, 36, title, { ...TYPE.cardTitle, fontSize: 21 }),
    text(`${id}_body`, layer + 3, x + 24, y + 58, w - 36, h - 76, body, { ...TYPE.cardBody }),
  ];
}

function organicBlobs(layer = 1) {
  return [
    shape('blob_tl', layer, -60, -40, 220, 200, { backgroundColor: C.beige, borderRadius: '55% 45% 60% 40% / 50% 55% 45% 50%', opacity: 0.95 }, 'decoration', 'sales-blob-beige'),
    shape('blob_br', layer, W - 180, H - 160, 240, 200, { backgroundColor: C.beigeWarm, borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%', opacity: 0.9 }, 'decoration', 'sales-blob-beige'),
    shape('blob_tr', layer, W - 120, -30, 160, 140, { backgroundColor: C.beige, borderRadius: '50%', opacity: 0.7 }, 'decoration', 'sales-blob-beige'),
  ];
}

function dotGrid(layer = 2, startX = SAFE.x, startY = SAFE.y, rows = 4, cols = 6) {
  const clips = [];
  const dot = 7;
  const gap = 13;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      clips.push(
        shape(
          `dot_${row}_${col}`,
          layer,
          startX + col * gap,
          startY + row * gap,
          dot,
          dot,
          { backgroundColor: C.cobaltLight, borderRadius: '50%', opacity: 0.55 },
          'decoration',
          'sales-dot-grid'
        )
      );
    }
  }
  return clips;
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

function finalizeScene(scene, bgId = 'bg-white', avatarPreset = 'br-mini') {
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

function sceneBase(id, slideIndex, title, layoutType, description, flow, tags, zones, bgId = 'bg-white', avatarPreset = 'br-mini') {
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
    tags: ['sales-demo', 'follow-up', ...tags],
    clips: [],
  };
}

// ─── Slide 1: Personal Cover ───────────────────────────────────────────────
const COVER_COPY_W = 560;
const coverImgX = CONTENT.x + COVER_COPY_W + 40;
const coverImgW = CONTENT.maxX - coverImgX;
const scene01 = sceneBase('sd_scene_01', 1, 'Personal Cover', 'Cover', 'Personalized follow-up cover with prospect name and rep details.', 'Cover → Recap', ['cover', 'personalized'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: COVER_COPY_W, height: CONTENT.h },
  image: { x: coverImgX, y: CONTENT.y, width: coverImgW, height: CONTENT.h },
}, 'bg-gradient-ice', 'cover');
scene01.clips = [
  shape('bg_base', 0, 0, 0, W, H, { background: `linear-gradient(135deg, ${C.white} 0%, ${C.ice} 60%, ${C.beige} 100%)` }),
  ...heroImage('img_cover', 2, coverImgX, CONTENT.y + 6, coverImgW, CONTENT.h - 12, 'sales-handshake', C.ice, {
    style: { borderRadius: '28px 12px 12px 28px', objectFit: 'cover', boxShadow: '0 22px 52px rgba(15,23,42,0.14)' },
    alt: 'Partnership moment',
  }),
  shape('cover_scrim', 3, coverImgX, CONTENT.y + 6, 72, CONTENT.h - 12, { background: `linear-gradient(90deg, rgba(248,250,252,0.95) 0%, transparent 100%)` }),
  shape('accent_bar', 1, CONTENT.x, CONTENT.y + 120, 6, 200, { backgroundColor: C.cobalt, borderRadius: '4px' }),
  image('img_logo', 10, CONTENT.x, CONTENT.y, 200, 44, 'sales-logo', { style: { objectFit: 'contain' }, alt: 'Your logo', role: 'logo' }),
  text('t_label', 11, CONTENT.x + 20, CONTENT.y + 56, 400, 24, 'SALES FOLLOW-UP', { ...TYPE.org }),
  text('t_company', 12, CONTENT.x + 20, CONTENT.y + 148, COVER_COPY_W - 40, 120, 'Follow-Up for\n[Prospect Company]', { ...TYPE.display, fontSize: 52, lineHeight: 1.05, color: C.navy }),
  text('t_sub', 13, CONTENT.x + 20, CONTENT.y + 280, COVER_COPY_W - 40, 32, COPY.coverSub, { ...TYPE.subheading, fontSize: 12, color: C.slate, textTransform: 'none', letterSpacing: '0.04em' }),
  text('t_body', 14, CONTENT.x + 20, CONTENT.y + 324, COVER_COPY_W - 40, 110, COPY.coverBody, { ...TYPE.body, fontSize: 16 }),
  shape('rep_card', 5, CONTENT.x + 20, CONTENT.maxY - 100, 340, 72, { backgroundColor: C.white, borderRadius: '14px', boxShadow: '0 10px 28px rgba(15,23,42,0.08)' }, 'decoration', 'sales-card-white'),
  text('t_rep_lbl', 15, CONTENT.x + 40, CONTENT.maxY - 88, 120, 20, 'PREPARED BY', { ...TYPE.label, fontSize: 10 }),
  text('t_rep_name', 16, CONTENT.x + 40, CONTENT.maxY - 64, 280, 32, 'Your Name · Account Executive', { ...TYPE.heading, fontSize: 16, color: C.ink, textTransform: 'none' }),
  ...slideBadge(9, '01'),
];

// ─── Slide 2: Thanks & Recap ─────────────────────────────────────────────
const scene02 = sceneBase('sd_scene_02', 2, 'Thanks & Recap', 'Split', 'Thank-you message with meeting recap and supporting photo.', 'Recap → Challenges', ['recap', 'thanks'], {
  image: { x: CONTENT.x, y: CONTENT.y, width: 460, height: CONTENT.h },
  text: { x: CONTENT.x + 480, y: CONTENT.y, width: CONTENT.w - 500, height: CONTENT.h },
}, 'bg-cream', 'br-mini');
scene02.clips = [
  shape('bg02', 0, 0, 0, W, H, { backgroundColor: C.cream }),
  ...organicBlobs(1),
  shape('panel_l', 2, CONTENT.x, CONTENT.y, 460, CONTENT.h, { backgroundColor: C.white, borderRadius: '24px', boxShadow: '0 18px 44px rgba(15,23,42,0.08)' }),
  ...heroImage('img_meeting', 4, CONTENT.x + 12, CONTENT.y + 12, 436, CONTENT.h - 24, 'sales-meeting', C.ice, { style: { borderRadius: '18px', objectFit: 'cover' }, alt: 'Meeting' }),
  text('t_label', 10, CONTENT.x + 480, CONTENT.y + 8, 200, 24, 'MEETING RECAP', { ...TYPE.subheading, fontSize: 11, color: C.cobalt }),
  text('t_title', 11, CONTENT.x + 480, CONTENT.y + 40, CONTENT.maxX - CONTENT.x - 480, 100, 'Thanks for\nYour Time Today', { ...TYPE.displaySerif, fontSize: 44, lineHeight: 1.08 }),
  text('t_body', 12, CONTENT.x + 480, CONTENT.y + 156, CONTENT.maxX - CONTENT.x - 496, 120, COPY.recapThanks, { ...TYPE.body, fontSize: 16 }),
  text('t_body2', 13, CONTENT.x + 480, CONTENT.y + 284, CONTENT.maxX - CONTENT.x - 496, 140, COPY.recapBody, { ...TYPE.body, fontSize: 15, color: C.muted }),
  shape('rule', 3, CONTENT.x + 480, CONTENT.y + 440, 120, 4, { backgroundColor: C.cobalt, borderRadius: '2px' }),
  ...iconBadge('ico_handshake', 8, CONTENT.x + 480, CONTENT.maxY - 72, 40, 'handshake', C.ice),
  text('t_foot', 14, CONTENT.x + 532, CONTENT.maxY - 64, 300, 28, 'Personalized for your team', { ...TYPE.label, fontSize: 11, color: C.slate, textTransform: 'none' }),
  ...slideBadge(9, '02'),
];

// ─── Slide 3: Your Challenges (reference layout) ─────────────────────────
const painIconX = CONTENT.x + 12;
const painIconY = CONTENT.y + 52;
const painCopyX = CONTENT.x + 184;
const imgW = Math.floor((CONTENT.w - 20) / 2);
const imgH = 248;
const imgY = CONTENT.y + 278;
const scene03 = sceneBase('sd_scene_03', 3, 'Your Challenges', 'Split', 'Icon + narrative top, dual photo strip bottom — inspired by problem-statement decks.', 'Challenges → Solution', ['challenges', 'pain-points'], {
  icon: { x: painIconX, y: painIconY, width: 152, height: 152 },
  copy: { x: painCopyX, y: CONTENT.y + 48, width: CONTENT.w - 196, height: 220 },
  images: { x: CONTENT.x, y: imgY, width: CONTENT.w, height: imgH },
}, 'bg-white', 'bl-mini');
scene03.clips = [
  shape('bg03', 0, 0, 0, W, H, { backgroundColor: C.white }),
  ...organicBlobs(1),
  ...dotGrid(2, SAFE.x + 12, SAFE.y + 12, 3, 5),
  ...painIconCluster('pain', 4, painIconX, painIconY, 152),
  text('t_eyebrow', 11, painCopyX, CONTENT.y + 56, 400, 22, 'WHAT WE HEARD ON THE CALL', { ...TYPE.subheading, fontSize: 11, color: C.cobalt }),
  text('t_title', 11, painCopyX, CONTENT.y + 82, CONTENT.maxX - painCopyX - 8, 56, 'Your Challenges', { ...TYPE.display, fontSize: 44, color: C.ink }),
  text('t_body', 12, painCopyX, CONTENT.y + 148, CONTENT.maxX - painCopyX - 16, 112, COPY.challengesBody, { ...TYPE.body }),
  text('t_cap', 13, painCopyX, CONTENT.y + 268, CONTENT.maxX - painCopyX - 16, 40, COPY.challengesCaption, { ...TYPE.body, fontSize: 15, color: C.muted }),
  ...heroImage('img_ch_a', 7, CONTENT.x, imgY, imgW, imgH, 'sales-challenge-a', C.beige, { style: { borderRadius: '22px', objectFit: 'cover', boxShadow: '0 14px 36px rgba(15,23,42,0.12)' }, alt: 'Challenge context' }),
  ...heroImage('img_ch_b', 7, CONTENT.x + imgW + 20, imgY, imgW, imgH, 'sales-challenge-b', C.beige, { style: { borderRadius: '22px', objectFit: 'cover', boxShadow: '0 14px 36px rgba(15,23,42,0.12)' }, alt: 'Team workflow' }),
  ...slideBadge(9, '03'),
];

// ─── Slide 4: Our Solution ───────────────────────────────────────────────
const scene04 = sceneBase('sd_scene_04', 4, 'Our Solution', 'Split', 'Navy solution panel with mapped bullets and product visual.', 'Solution → Demo', ['solution', 'mapping'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: 500, height: CONTENT.h },
  image: { x: CONTENT.x + 520, y: CONTENT.y, width: CONTENT.w - 520, height: CONTENT.h },
}, 'bg-ice', 'br-small');
scene04.clips = [
  shape('bg04', 0, 0, 0, W, H, { backgroundColor: C.ice }),
  shape('panel_navy', 2, CONTENT.x, CONTENT.y, 500, CONTENT.h, { backgroundColor: C.navy, borderRadius: '24px', boxShadow: '0 20px 50px rgba(15,23,42,0.2)' }, 'decoration', 'sales-navy-panel'),
  text('t_label', 10, CONTENT.x + 32, CONTENT.y + 28, 200, 24, 'OUR RESPONSE', { ...TYPE.label, color: C.cobaltLight }),
  text('t_title', 11, CONTENT.x + 32, CONTENT.y + 56, 436, 100, 'How We Address\nYour Priorities', { ...TYPE.display, fontSize: 38, color: C.white, lineHeight: 1.1 }),
  text('t_intro', 12, CONTENT.x + 32, CONTENT.y + 168, 436, 64, COPY.solutionIntro, { ...TYPE.bodyOnDark, fontSize: 15, color: 'rgba(241,245,249,0.9)' }),
  ...solutionRow('sol0', 3, CONTENT.x + 32, CONTENT.y + 248, 436, 'Unified workflow', 'One place to plan, execute, and report — no more spreadsheet sprawl.'),
  ...solutionRow('sol1', 3, CONTENT.x + 32, CONTENT.y + 332, 436, 'Automated insights', 'Dashboards that update without manual exports or status meetings.'),
  ...solutionRow('sol2', 3, CONTENT.x + 32, CONTENT.y + 416, 436, 'Secure collaboration', 'Shareable views for leadership, ops, and customer-facing teams.'),
  shape('cobalt_tag', 4, CONTENT.x + 32, CONTENT.maxY - 72, 140, 36, { backgroundColor: C.cobalt, borderRadius: '100px' }),
  text('t_tag', 14, CONTENT.x + 48, CONTENT.maxY - 64, 108, 24, 'MAPPED LIVE', { ...TYPE.label, fontSize: 10, color: C.white, textAlign: 'center' }),
  ...heroImage('img_solution', 5, CONTENT.x + 520, CONTENT.y, CONTENT.w - 520, CONTENT.h, 'sales-dashboard', C.panelDark, { style: { borderRadius: '24px', objectFit: 'cover', boxShadow: '0 18px 44px rgba(15,23,42,0.15)' }, alt: 'Solution dashboard' }),
  ...slideBadge(9, '04'),
];

// ─── Slide 5: Demo Highlights ────────────────────────────────────────────
const featW = Math.floor((CONTENT.w - 32) / 3);
const features = [
  { asset: 'sales-feature-a', title: 'Workflow Hub', body: 'The unified workspace view we opened first — where your team plans, tracks, and shares updates without switching tools.', color: C.cobalt },
  { asset: 'sales-feature-b', title: 'Live Analytics', body: 'The reporting panel that updates automatically so leadership sees progress without waiting for manual exports.', color: C.mint },
  { asset: 'sales-feature-c', title: 'Team Handoffs', body: 'The collaboration view that keeps marketing, sales, and success aligned on every active opportunity.', color: C.amber },
];
const scene05 = sceneBase('sd_scene_05', 5, 'Demo Highlights', 'Grid', 'Three demo moments with screenshot frames and captions.', 'Demo → Proof', ['demo', 'features'], {
  grid: { x: CONTENT.x, y: CONTENT.y + 80, width: CONTENT.w, height: 400 },
}, 'bg-beige', 'tr-mini');
scene05.clips = [
  shape('bg05', 0, 0, 0, W, H, { backgroundColor: C.beige }),
  ...organicBlobs(1),
  text('t_title', 10, CONTENT.x, CONTENT.y, CONTENT.w, 52, 'What We Showed You', { ...TYPE.displaySerif, fontSize: 40, color: C.navy }),
  text('t_sub', 11, CONTENT.x, CONTENT.y + 52, CONTENT.w, 48, COPY.demoIntro, { ...TYPE.body, fontSize: 16 }),
  ...features.flatMap((feat, i) => {
    const n = i + 1;
    const x = CONTENT.x + i * (featW + 16);
    const y = CONTENT.y + 112;
    return [
      shape(`feat${n}`, 3, x, y, featW, 380, { backgroundColor: C.white, borderRadius: '20px', boxShadow: '0 16px 40px rgba(15,23,42,0.08)', borderTop: `4px solid ${feat.color}` }, 'decoration', 'sales-card-white'),
      shape(`num${n}`, 4, x + 20, y + 20, 36, 36, { backgroundColor: feat.color, borderRadius: '50%' }),
      text(`numt${n}`, 12 + i * 4, x + 20, y + 28, 36, 24, `0${n}`, { ...TYPE.stat, fontSize: 16, color: C.white, textAlign: 'center' }),
      ...heroImage(`img_feat${n}`, 5, x + 16, y + 68, featW - 32, 140, feat.asset, C.ice, { style: { borderRadius: '14px', objectFit: 'cover' }, alt: feat.title }),
      text(`ht${n}`, 13 + i * 4, x + 20, y + 224, featW - 40, 36, feat.title, { ...TYPE.cardTitle, fontSize: 20 }),
      text(`bt${n}`, 14 + i * 4, x + 20, y + 264, featW - 40, 100, feat.body, { ...TYPE.cardBody, fontSize: 14 }),
    ];
  }),
  ...slideBadge(9, '05'),
];

// ─── Slide 6: ROI & Proof ────────────────────────────────────────────────
const stats = [
  { x: CONTENT.x, value: '40%', label: 'Faster follow-up cycles', color: C.cobalt },
  { x: CONTENT.x + 280, value: '$120K', label: 'Avg. annual savings', color: C.mint },
  { x: CONTENT.x + 560, value: '98%', label: 'Rep satisfaction', color: C.amber },
];
const scene06 = sceneBase('sd_scene_06', 6, 'ROI & Proof', 'StatsHighlight', 'Impact metrics with customer quote and proof image.', 'Proof → Next Steps', ['roi', 'social-proof'], {
  stats: { x: CONTENT.x, y: CONTENT.y + 72, width: CONTENT.w, height: 160 },
}, 'bg-white', 'bl-mini');
scene06.clips = [
  shape('bg06', 0, 0, 0, W, H, { backgroundColor: C.white }),
  text('t_title', 10, CONTENT.x, CONTENT.y, 560, 52, 'Results Teams Like Yours See', { ...TYPE.display, fontSize: 40, color: C.navy }),
  text('t_sub', 11, CONTENT.x, CONTENT.y + 52, CONTENT.w, 44, COPY.roiIntro, { ...TYPE.body, fontSize: 16 }),
  ...stats.flatMap((stat, i) => [
    shape(`stat${i}`, 2, stat.x, CONTENT.y + 88, 260, 148, { backgroundColor: C.white, borderRadius: '16px', boxShadow: '0 12px 32px rgba(15,23,42,0.08)', border: `1px solid ${C.line}` }, 'decoration', 'sales-stat-tile'),
    shape(`stat_accent${i}`, 3, stat.x, CONTENT.y + 88, 260, 5, { backgroundColor: stat.color, borderRadius: '16px 16px 0 0' }),
    text(`sv${i}`, 12 + i * 2, stat.x + 24, CONTENT.y + 112, 212, 56, stat.value, { ...TYPE.stat, fontSize: 44, color: stat.color }),
    text(`sl${i}`, 13 + i * 2, stat.x + 24, CONTENT.y + 180, 212, 44, stat.label, { ...TYPE.label, fontSize: 11, color: C.slate, letterSpacing: '0.06em', textTransform: 'none' }),
  ]),
  shape('quote_card', 3, CONTENT.x, CONTENT.y + 260, 720, 172, { backgroundColor: C.white, borderRadius: '16px', borderLeft: `5px solid ${C.cobalt}`, boxShadow: '0 12px 32px rgba(15,23,42,0.08)' }, 'decoration', 'sales-quote-bar'),
  text('t_quote', 14, CONTENT.x + 28, CONTENT.y + 284, 680, 96, COPY.quote, { ...TYPE.quote, fontSize: 21 }),
  text('t_author', 15, CONTENT.x + 28, CONTENT.y + 392, 400, 28, COPY.quoteAuthor, { ...TYPE.body, fontSize: 14, fontWeight: '600', color: C.ink, fontStyle: 'normal' }),
  ...heroImage('img_proof', 5, CONTENT.x + 740, CONTENT.y + 260, CONTENT.maxX - CONTENT.x - 740, 172, 'sales-testimonial', C.ice, { style: { borderRadius: '16px', objectFit: 'cover' }, alt: 'Customer moment' }),
  ...slideBadge(9, '06'),
];

// ─── Slide 7: Next Steps (split — action rows + momentum panel) ───────────
const STEPS_LEFT_W = 588;
const MAP_PANEL_X = CONTENT.x + STEPS_LEFT_W + 24;
const MAP_PANEL_W = CONTENT.maxX - MAP_PANEL_X;
const steps = [
  {
    num: '01',
    icon: 'video',
    title: 'Share this recap',
    body: 'Forward the video to stakeholders who were not on the call so everyone hears the same story.',
    owner: 'Your team',
    when: 'This week',
    color: C.cobalt,
    ownerBg: 'rgba(37,99,235,0.12)',
    whenBg: 'rgba(37,99,235,0.08)',
  },
  {
    num: '02',
    icon: 'calendar',
    title: 'Technical deep dive',
    body: 'Schedule a session with our solutions engineer to validate integrations and security requirements.',
    owner: 'Joint session',
    when: 'Next 7 days',
    color: C.mint,
    ownerBg: 'rgba(16,185,129,0.14)',
    whenBg: 'rgba(16,185,129,0.08)',
  },
  {
    num: '03',
    icon: 'document',
    title: 'Proposal & timeline',
    body: 'We will send a scoped proposal with phased rollout options aligned to your fiscal calendar.',
    owner: 'Our team',
    when: 'Within 5 days',
    color: C.amber,
    ownerBg: 'rgba(245,158,11,0.16)',
    whenBg: 'rgba(245,158,11,0.1)',
  },
];
const mapChecks = [
  'Align stakeholders on the recap',
  'Validate technical fit together',
  'Review proposal and rollout plan',
];
const scene07 = sceneBase('sd_scene_07', 7, 'Next Steps', 'Split', 'Mutual action plan with owners, timelines, and momentum summary.', 'Next Steps → CTA', ['next-steps', 'map'], {
  steps: { x: CONTENT.x, y: CONTENT.y + 88, width: STEPS_LEFT_W, height: CONTENT.h - 88 },
  panel: { x: MAP_PANEL_X, y: CONTENT.y + 88, width: MAP_PANEL_W, height: CONTENT.h - 88 },
}, 'bg-gradient-ice', 'br-mini');
scene07.clips = [
  shape('bg07', 0, 0, 0, W, H, { background: `linear-gradient(145deg, ${C.white} 0%, ${C.ice} 55%, ${C.beige} 100%)` }),
  ...organicBlobs(1),
  text('t_label', 10, CONTENT.x, CONTENT.y + 4, 220, 22, 'MUTUAL ACTION PLAN', { ...TYPE.subheading, fontSize: 11, color: C.cobalt }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 28, STEPS_LEFT_W, 52, 'Recommended Next Steps', { ...TYPE.display, fontSize: 40, color: C.navy, lineHeight: 1.05 }),
  text('t_sub', 12, CONTENT.x, CONTENT.y + 84, STEPS_LEFT_W, 44, COPY.stepsIntro, { ...TYPE.body, fontSize: 15, lineHeight: 1.55 }),
  ...steps.flatMap((step, i) => actionStepRow(`step${i}`, 3, CONTENT.x, CONTENT.y + 140 + i * 128, STEPS_LEFT_W, step)),
  shape('map_panel', 2, MAP_PANEL_X, CONTENT.y + 88, MAP_PANEL_W, CONTENT.h - 96, { backgroundColor: C.navy, borderRadius: '22px', boxShadow: '0 22px 52px rgba(15,23,42,0.22)' }, 'decoration', 'sales-navy-panel'),
  shape('map_glow', 3, MAP_PANEL_X, CONTENT.y + 88, MAP_PANEL_W, 120, { background: `radial-gradient(ellipse at 90% 0%, rgba(37,99,235,0.35) 0%, transparent 70%)`, borderRadius: '22px 22px 0 0' }),
  ...iconBadge('map_ico', 6, MAP_PANEL_X + 24, CONTENT.y + 112, 44, 'handshake', C.panelDark),
  text('t_map_lbl', 13, MAP_PANEL_X + 80, CONTENT.y + 118, MAP_PANEL_W - 96, 22, 'KEEP MOMENTUM', { ...TYPE.label, fontSize: 10, color: C.cobaltLight }),
  text('t_map_title', 14, MAP_PANEL_X + 24, CONTENT.y + 148, MAP_PANEL_W - 48, 72, '3 commitments\nto move forward', { ...TYPE.display, fontSize: 28, color: C.white, lineHeight: 1.12 }),
  ...mapChecks.flatMap((line, i) => [
    ...iconBadge(`chk${i}`, 7, MAP_PANEL_X + 24, CONTENT.y + 236 + i * 44, 28, 'check', C.cobalt),
    text(`chkt${i}`, 15 + i, MAP_PANEL_X + 60, CONTENT.y + 240 + i * 44, MAP_PANEL_W - 84, 32, line, { ...TYPE.bodyOnDark, fontSize: 14, lineHeight: 1.4, color: 'rgba(241,245,249,0.92)' }),
  ]),
  ...heroImage('img_map', 5, MAP_PANEL_X + 24, CONTENT.y + 372, MAP_PANEL_W - 48, 112, 'sales-handshake', C.panelDark, { style: { borderRadius: '14px', objectFit: 'cover', opacity: 0.92 }, alt: 'Partnership' }),
  shape('map_pill', 6, MAP_PANEL_X + 24, CONTENT.y + 496, MAP_PANEL_W - 48, 36, { backgroundColor: C.amber, borderRadius: '100px' }),
  text('t_map_pill', 16, MAP_PANEL_X + 36, CONTENT.y + 504, MAP_PANEL_W - 72, 24, 'TARGET CLOSE · 2 WEEKS', { ...TYPE.label, fontSize: 10, color: C.navy, textAlign: 'center', letterSpacing: '0.12em' }),
  ...slideBadge(9, '07'),
];

// ─── Slide 8: Book the Call ──────────────────────────────────────────────
const scene08 = sceneBase('sd_scene_08', 8, 'Book the Call', 'Promo', 'Dark closing slide with scheduling CTA and contact details.', 'CTA → End', ['cta', 'closing'], {
  cta: { x: CONTENT.x, y: CONTENT.y, width: CONTENT.w, height: CONTENT.h },
}, 'bg-gradient-navy', 'dark');
scene08.clips = [
  shape('bg_dark', 0, 0, 0, W, H, { background: `linear-gradient(160deg, ${C.navy} 0%, ${C.panelDark} 100%)` }),
  shape('glow', 1, 0, 0, W, 260, { background: `radial-gradient(ellipse at 80% 0%, rgba(37, 99, 235, 0.28) 0%, transparent 70%)` }),
  ...iconBadge('ico_cal', 5, CONTENT.x, CONTENT.y + 8, 48, 'calendar', C.panelDark),
  text('t_title', 10, CONTENT.x + 60, CONTENT.y + 12, 600, 108, "Let's Keep the\nMomentum Going", { ...TYPE.displaySerif, fontSize: 48, color: C.white, lineHeight: 1.06 }),
  text('t_body', 11, CONTENT.x, CONTENT.y + 128, 640, 100, COPY.ctaBody, { ...TYPE.bodyOnDark, fontSize: 16, color: 'rgba(241,245,249,0.88)' }),
  shape('cta_btn', 6, CONTENT.x, CONTENT.y + 248, 280, 52, { backgroundColor: C.cobalt, borderRadius: '100px', boxShadow: '0 8px 24px rgba(37,99,235,0.45)' }),
  text('t_btn', 12, CONTENT.x + 24, CONTENT.y + 262, 232, 28, 'SCHEDULE A CALL', { ...TYPE.heading, fontSize: 13, color: C.white, letterSpacing: '0.14em', textAlign: 'center' }),
  ...iconBadge('ico_email', 7, CONTENT.x, CONTENT.y + 328, 36, 'email', C.panelDark),
  text('t_email', 13, CONTENT.x + 48, CONTENT.y + 334, 360, 28, 'you@company.com', { ...TYPE.bodyOnDark, fontSize: 14 }),
  ...iconBadge('ico_phone', 7, CONTENT.x, CONTENT.y + 376, 36, 'phone', C.panelDark),
  text('t_phone', 14, CONTENT.x + 48, CONTENT.y + 382, 360, 28, '+1 (555) 123-4567', { ...TYPE.bodyOnDark, fontSize: 14 }),
  shape('cta_panel', 4, CONTENT.x + 680, CONTENT.y + 24, CONTENT.maxX - CONTENT.x - 680, CONTENT.h - 48, { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)' }),
  ...heroImage('img_close', 5, CONTENT.x + 696, CONTENT.y + 40, CONTENT.maxX - CONTENT.x - 712, 200, 'sales-handshake', C.panelDark, { style: { borderRadius: '18px', objectFit: 'cover' }, alt: 'Partnership' }),
  text('t_panel', 15, CONTENT.x + 720, CONTENT.y + 260, CONTENT.maxX - CONTENT.x - 736, 80, 'Reply to this video with questions — I will respond within one business day.', { ...TYPE.bodyOnDark, fontSize: 14, color: 'rgba(241,245,249,0.85)' }),
  shape('amber_pill', 6, CONTENT.x + 720, CONTENT.y + 360, 200, 36, { backgroundColor: C.amber, borderRadius: '100px' }),
  text('t_pill', 16, CONTENT.x + 736, CONTENT.y + 368, 168, 24, 'BOOK NEXT MEETING', { ...TYPE.label, fontSize: 10, color: C.navy, textAlign: 'center' }),
  ...slideBadge(9, '08'),
];

const SCENE_BG = [
  'bg-gradient-ice',
  'bg-cream',
  'bg-white',
  'bg-ice',
  'bg-beige',
  'bg-white',
  'bg-gradient-ice',
  'bg-gradient-navy',
];

const SCENE_AVATAR = [
  'cover',
  'br-mini',
  'bl-mini',
  'br-small',
  'tr-mini',
  'bl-mini',
  'br-mini',
  'dark',
];

[scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08].forEach((scene, i) => {
  finalizeScene(scene, SCENE_BG[i], SCENE_AVATAR[i]);
});

const template = {
  category: 'Sales Demo',
  template: {
    id: 'sales-demo-deal-room',
    name: 'Sales Demo — Deal Room Bundle',
    category: 'Sales Demo',
    theme: assets.theme,
    presenter: PRESENTER,
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    colorPalette: C,
    description: 'Personalized 8-scene sales follow-up: cover, recap, challenges, solution, demo highlights, ROI proof, next steps, and booking CTA.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
