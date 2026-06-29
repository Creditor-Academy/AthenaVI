import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/course_explanation_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/course-explanation-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 9;
const W = 1280;
const H = 720;
const C = assets.colors;
const F = assets.theme.fonts;

const SAFE = { x: Math.round(W * 0.08), y: Math.round(H * 0.08) };
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

const PRESENTER = { name: assets.presenter?.name || 'Instructor' };

const COPY = {
  coverSub: 'Lesson 01 · Clear explanation in under 2 minutes',
  coverBody:
    'A focused explainer that breaks one topic into simple ideas — what it is, how it works, and what to remember. Replace with your lesson hook.',
  objectivesIntro:
    'By the end of this lesson you will understand the core idea, follow the process step by step, and apply it with confidence.',
  coreIdea:
    'Every complex topic can be explained in plain language. Start with the big picture, then zoom into the details that matter most for your learners.',
  definition:
    '"Learning is the process of acquiring knowledge or skills through study, experience, or teaching — made clear one idea at a time."',
  definitionAttr: '— Core principle · Lesson 01',
  timelineIntro: 'Follow this four-step flow to explain any concept clearly — from input to real-world application.',
  examplesIntro: 'Three ways this idea shows up in practice. Swap images and labels for your subject matter.',
  statsIntro: 'Numbers help learners grasp impact quickly. Replace with metrics that matter for your topic.',
  outroBody:
    'You now have the essentials. Review the key points, try the next lesson, or download the companion resources.',
};

const IMG = {
  hero: { objectFit: 'cover', borderRadius: '22px', boxShadow: '0 22px 52px rgba(15,23,42,0.12)' },
  heroTall: { objectFit: 'cover', borderRadius: '22px 22px 22px 8px', boxShadow: '0 24px 56px rgba(15,23,42,0.14)' },
  heroDark: { objectFit: 'cover', borderRadius: '20px', boxShadow: '0 28px 60px rgba(0,0,0,0.28)' },
  thumb: { objectFit: 'cover', borderRadius: '14px' },
  portrait: { objectFit: 'cover', borderRadius: '50%' },
};

const AVATAR_STYLE_LIGHT = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.white}`,
  boxShadow: '0 12px 32px rgba(15,23,42,0.16)',
};

const AVATAR_STYLE_DARK = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.sky}`,
  boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
};

const TYPE = {
  org: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.sky },
  display: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 48, lineHeight: 1.06 },
  displayLight: { fontFamily: F.display, fontWeight: '700', color: C.cream, fontSize: 46, lineHeight: 1.08 },
  displaySerif: { fontFamily: F.serif, fontWeight: '600', color: C.ink, fontSize: 40, lineHeight: 1.12 },
  heading: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 32 },
  headingLight: { fontFamily: F.display, fontWeight: '700', color: C.cream, fontSize: 32 },
  subheading: { fontFamily: F.sans, fontWeight: '600', color: C.sky, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 12 },
  body: { fontFamily: F.sans, fontWeight: '400', color: C.muted, lineHeight: 1.75, fontSize: 17 },
  bodyOnDark: { fontFamily: F.sans, fontWeight: '400', color: C.skyLight, lineHeight: 1.7, fontSize: 16 },
  label: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted },
  stat: { fontFamily: F.display, fontWeight: '800', color: C.navy, fontSize: 36 },
  cardTitle: { fontFamily: F.display, fontWeight: '700', fontSize: 19, color: C.ink },
  cardBody: { fontFamily: F.sans, fontWeight: '400', fontSize: 14, color: C.muted, lineHeight: 1.6 },
  quote: { fontFamily: F.serif, fontWeight: '500', fontStyle: 'italic', color: C.ink, lineHeight: 1.5, fontSize: 26 },
};

const EDGE_DECOR = new Set(['ce-blob-sky', 'ce-slide-badge']);

const BACKGROUND_PRESETS = assets.backgrounds.map((bg) => ({
  id: bg.id,
  name: bg.name,
  type: bg.value.includes('gradient') ? 'gradient' : 'solid',
  value: bg.value,
}));

function avatarLayout(preset = 'br-mini') {
  const pad = 12;
  const layouts = {
    cover: {
      size: { width: 92, height: 112 },
      pos: { x: SAFE.maxX - 92 - pad, y: SAFE.maxY - 112 - pad },
      style: { ...AVATAR_STYLE_LIGHT, border: `3px solid ${C.sky}` },
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
    if (clip.id?.startsWith('blob_')) return false;
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

function buildSceneBackground(bgId = 'bg-cream') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  const value = bg?.value || C.cream;
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
    hint: 'Swap sky presets, custom swatches, or full-bleed photos. Delete a hero image to reveal the panel color behind it.',
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
  return {
    id, type: 'text', role, editable: true, layer,
    position: { x, y }, size: { width: w, height: h },
    startTime: 0, endTime: DURATION, content, style,
  };
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

function heroImage(id, layer, x, y, w, h, assetId, colorFallback, extra = {}) {
  return [
    shape(`${id}_fill`, layer, x, y, w, h, {
      backgroundColor: colorFallback,
      borderRadius: extra.style?.borderRadius || '22px',
      ...(extra.style?.boxShadow ? { boxShadow: extra.style.boxShadow } : {}),
    }, 'hero-color-fallback', 'ce-card'),
    image(id, layer + 1, x, y, w, h, assetId, {
      ...extra,
      swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
    }),
  ];
}

function iconBadge(id, layer, x, y, size, iconAssetId, bg = C.skyPale) {
  const pad = Math.round(size * 0.2);
  const iconAsset = assets.icons.find((item) => item.id === iconAssetId);
  return [
    shape(`${id}_bg`, layer, x, y, size, size, {
      backgroundColor: bg, borderRadius: '50%', boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
    }, 'decoration', 'ce-icon-badge'),
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
    shape(`slide_badge_${num}`, layer, x, y, size, size, {
      backgroundColor: C.navy, borderRadius: '50%', border: `2px solid ${C.sky}`,
    }, 'decoration', 'ce-slide-badge'),
    text(`slide_num_${num}`, layer + 1, x, y + 9, size, 26, num, {
      ...TYPE.stat, fontSize: 14, color: C.cream, textAlign: 'center',
    }),
  ];
}

function metaPill(id, layer, x, y, w, label, bg, color) {
  return [
    shape(`${id}_pill`, layer, x, y, w, 30, { backgroundColor: bg, borderRadius: '100px' }),
    text(`${id}_txt`, layer + 1, x + 12, y + 6, w - 24, 20, label, {
      ...TYPE.label, fontSize: 10, color, textTransform: 'none', letterSpacing: '0.04em', textAlign: 'center',
    }),
  ];
}

function infoCard(id, layer, x, y, w, h, barColor, title, body) {
  return [
    shape(`${id}_bg`, layer, x, y, w, h, {
      backgroundColor: C.white, borderRadius: '16px',
      boxShadow: '0 14px 36px rgba(15,23,42,0.07)', border: `1px solid ${C.line}`,
    }, 'decoration', 'ce-card'),
    shape(`${id}_bar`, layer + 1, x, y + 14, 5, h - 28, { backgroundColor: barColor, borderRadius: '4px' }),
    text(`${id}_title`, layer + 2, x + 22, y + 18, w - 34, 32, title, { ...TYPE.cardTitle }),
    text(`${id}_body`, layer + 3, x + 22, y + 54, w - 34, h - 70, body, { ...TYPE.cardBody }),
  ];
}

function objectiveRow(id, layer, x, y, w, label) {
  return checklistCard(id, layer, x, y, w, label);
}

function checklistCard(id, layer, x, y, w, label) {
  return [
    shape(`${id}_row`, layer, x, y, w, 62, {
      backgroundColor: C.white,
      borderRadius: '14px',
      boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      border: `1px solid ${C.line}`,
    }, 'decoration', 'ce-card'),
    shape(`${id}_check`, layer + 1, x + 14, y + 17, 28, 28, {
      backgroundColor: C.mintLight,
      borderRadius: '50%',
    }),
    text(`${id}_mark`, layer + 2, x + 22, y + 21, 16, 22, '✓', {
      fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.mint,
    }),
    text(`${id}_txt`, layer + 3, x + 54, y + 14, w - 68, 44, label, {
      ...TYPE.body, fontSize: 15, color: C.slate, lineHeight: 1.45, fontWeight: '500',
    }),
  ];
}

function stepColumn(id, layer, x, y, w, h, color, num, title, body, iconId) {
  return [
    shape(`${id}_card`, layer, x, y, w, h, {
      backgroundColor: C.white,
      borderRadius: '18px',
      border: `1px solid ${C.line}`,
      boxShadow: '0 14px 36px rgba(15,23,42,0.08)',
    }, 'decoration', 'ce-stat-tile'),
    shape(`${id}_accent`, layer + 1, x, y, w, 6, {
      backgroundColor: color,
      borderRadius: '18px 18px 0 0',
    }),
    shape(`${id}_num`, layer + 2, x + Math.round(w / 2) - 22, y + 22, 44, 44, {
      backgroundColor: color,
      borderRadius: '50%',
      boxShadow: '0 8px 20px rgba(15,23,42,0.15)',
    }),
    text(`${id}_numtxt`, layer + 3, x + Math.round(w / 2) - 22, y + 32, 44, 24, num, {
      ...TYPE.stat, fontSize: 16, color: C.white, textAlign: 'center',
    }),
    ...iconBadge(`${id}_ico`, layer + 4, x + Math.round(w / 2) - 18, y + 78, 36, iconId, C.skyPale),
    text(`${id}_title`, layer + 10, x + 16, y + 124, w - 32, 32, title, {
      ...TYPE.cardTitle, fontSize: 17, textAlign: 'center', color: C.ink,
    }),
    text(`${id}_body`, layer + 11, x + 16, y + 160, w - 32, 120, body, {
      ...TYPE.cardBody, fontSize: 13, textAlign: 'center', lineHeight: 1.55,
    }),
  ];
}

function exampleCard(id, layer, x, y, w, h, color, num, title, body, imgId) {
  const thumbH = 148;
  return [
    shape(`${id}_card`, layer, x, y, w, h, {
      backgroundColor: C.white,
      borderRadius: '18px',
      border: `1px solid ${C.line}`,
      boxShadow: '0 14px 36px rgba(15,23,42,0.08)',
    }, 'decoration', 'ce-stat-tile'),
    shape(`${id}_accent`, layer + 1, x, y, w, 6, {
      backgroundColor: color,
      borderRadius: '18px 18px 0 0',
    }),
    ...heroImage(`${id}_img`, layer + 2, x + 14, y + 18, w - 28, thumbH, imgId, C.skyPale, {
      style: { ...IMG.thumb },
      alt: title,
    }),
    shape(`${id}_num`, layer + 5, x + 18, y + thumbH + 28, 40, 40, {
      backgroundColor: color,
      borderRadius: '12px',
    }),
    text(`${id}_numtxt`, layer + 6, x + 18, y + thumbH + 36, 40, 24, num, {
      ...TYPE.stat, fontSize: 15, color: C.white, textAlign: 'center',
    }),
    text(`${id}_title`, layer + 11, x + 18, y + thumbH + 78, w - 36, 28, title, {
      ...TYPE.cardTitle, fontSize: 17,
    }),
    text(`${id}_body`, layer + 12, x + 18, y + thumbH + 110, w - 36, 72, body, {
      ...TYPE.cardBody, fontSize: 13, lineHeight: 1.55,
    }),
  ];
}

function organicBlobs(layer = 1) {
  return [
    shape('blob_tl', layer, -40, -20, 220, 200, {
      backgroundColor: C.skyLight, borderRadius: '55% 45% 60% 40% / 50% 55% 45% 50%', opacity: 0.65,
    }, 'decoration', 'ce-blob-sky'),
    shape('blob_br', layer, W - 180, H - 160, 240, 210, {
      backgroundColor: C.mintLight, borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%', opacity: 0.55,
    }, 'decoration', 'ce-blob-sky'),
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
    tags: ['course-explanation', 'training', ...tags],
    clips: [],
  };
}

// ─── 01 · Lesson Cover ─────────────────────────────────────────────────────
const COPY_W = 520;
const coverImgX = CONTENT.x + COPY_W + 36;
const coverImgW = CONTENT.maxX - coverImgX;
const scene01 = sceneBase('ce_scene_01', 1, 'Lesson Cover', 'Cover', 'Elegant lesson opener with sky gradient, hero visual, and instructor card.', 'Cover → Objectives', ['cover'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: COPY_W, height: CONTENT.h },
  image: { x: coverImgX, y: CONTENT.y, width: coverImgW, height: CONTENT.h },
}, 'bg-gradient-sky', 'cover');

scene01.clips = [
  shape('bg01', 0, 0, 0, W, H, {
    background: `linear-gradient(145deg, ${C.white} 0%, ${C.skyPale} 55%, ${C.skyLight} 100%)`,
  }),
  ...organicBlobs(1),
  shape('accent_bar', 1, CONTENT.x, CONTENT.y + 108, 5, 72, { backgroundColor: C.sky, borderRadius: '3px' }),
  image('img_logo', 10, CONTENT.x, CONTENT.y, 190, 42, 'ce-logo', {
    style: { objectFit: 'contain' }, alt: 'Academy logo', role: 'logo',
  }),
  text('t_label', 11, CONTENT.x + 16, CONTENT.y + 56, 280, 22, 'COURSE EXPLANATION', { ...TYPE.org }),
  text('t_title', 12, CONTENT.x, CONTENT.y + 108, COPY_W - 20, 130, 'Understanding\n[Your Topic]', { ...TYPE.display, fontSize: 50, color: C.navy }, 'slide-title'),
  text('t_sub', 13, CONTENT.x, CONTENT.y + 248, COPY_W - 24, 28, COPY.coverSub, { ...TYPE.subheading, textTransform: 'none', letterSpacing: '0.06em', color: C.slate }),
  text('t_body', 14, CONTENT.x, CONTENT.y + 288, COPY_W - 28, 120, COPY.coverBody, { ...TYPE.body, fontSize: 16 }),
  shape('host_card', 4, CONTENT.x, CONTENT.maxY - 92, 360, 76, {
    backgroundColor: C.white, borderRadius: '14px', boxShadow: '0 10px 28px rgba(15,23,42,0.07)', border: `1px solid ${C.line}`,
  }, 'decoration', 'ce-card'),
  ...iconBadge('ico_instructor', 8, CONTENT.x + 16, CONTENT.maxY - 78, 48, 'book', C.skyPale),
  text('t_host_lbl', 15, CONTENT.x + 76, CONTENT.maxY - 78, 100, 18, 'INSTRUCTOR', { ...TYPE.label, fontSize: 10 }),
  text('t_host', 16, CONTENT.x + 76, CONTENT.maxY - 56, 260, 28, PRESENTER.name, {
    ...TYPE.heading, fontSize: 17, textTransform: 'none', letterSpacing: '0', color: C.navy,
  }),
  ...heroImage('img_cover', 3, coverImgX, CONTENT.y + 8, coverImgW, CONTENT.h - 16, 'ce-cover', C.skyLight, {
    style: { ...IMG.heroTall, objectPosition: 'center 30%' },
    alt: 'Learning environment',
  }),
  ...slideBadge(9, '01'),
];

// ─── 02 · What You'll Learn — TwoColumn ────────────────────────────────────
const leftW = 400;
const rightX = CONTENT.x + leftW + 40;
const scene02 = sceneBase('ce_scene_02', 2, "What You'll Learn", 'TwoColumn', 'Instructor panel left, four learning objectives right with check icons.', 'Objectives → Core Idea', ['objectives'], {
  content: { x: CONTENT.x, y: CONTENT.y, width: leftW, height: CONTENT.h },
  list: { x: rightX, y: CONTENT.y, width: CONTENT.maxX - rightX, height: CONTENT.h },
}, 'bg-white', 'br-mini');

scene02.clips = [
  shape('bg02', 0, 0, 0, W, H, { backgroundColor: C.white }),
  ...organicBlobs(1),
  shape('panel_left', 2, CONTENT.x, CONTENT.y, leftW, CONTENT.h, {
    backgroundColor: C.skyPale, borderRadius: '24px', boxShadow: '0 18px 44px rgba(15,23,42,0.06)',
  }, 'decoration', 'ce-card'),
  ...heroImage('img_objectives', 4, CONTENT.x + 16, CONTENT.y + 16, leftW - 32, 220, 'ce-classroom', C.skyLight, {
    style: { ...IMG.thumb, borderRadius: '18px' },
    alt: 'Classroom',
  }),
  text('t_panel_title', 10, CONTENT.x + 28, CONTENT.y + 252, leftW - 56, 56, "What You'll\nLearn", { ...TYPE.displaySerif, fontSize: 34, color: C.navy }),
  text('t_panel_body', 11, CONTENT.x + 28, CONTENT.y + 320, leftW - 56, 120, COPY.objectivesIntro, { ...TYPE.body, fontSize: 15 }),
  text('t_label', 12, rightX, CONTENT.y + 8, 220, 22, 'LEARNING OUTCOMES', { ...TYPE.org }),
  text('t_title', 13, rightX, CONTENT.y + 36, CONTENT.maxX - rightX, 52, 'By the end of this lesson', { ...TYPE.display, fontSize: 36, color: C.ink }, 'slide-title'),
  ...objectiveRow('obj1', 5, rightX, CONTENT.y + 100, CONTENT.maxX - rightX, 'Understand the core idea in plain language'),
  ...objectiveRow('obj2', 5, rightX, CONTENT.y + 172, CONTENT.maxX - rightX, 'Follow a clear step-by-step breakdown'),
  ...objectiveRow('obj3', 5, rightX, CONTENT.y + 244, CONTENT.maxX - rightX, 'See real-world examples you can relate to'),
  ...objectiveRow('obj4', 5, rightX, CONTENT.y + 316, CONTENT.maxX - rightX, 'Remember the key takeaway and apply it'),
  shape('rule02', 3, rightX, CONTENT.y + 392, 88, 3, { backgroundColor: C.mint, borderRadius: '2px' }),
  ...metaPill('pill_lesson', 6, rightX, CONTENT.y + 408, 132, 'Lesson 01', C.navy, C.skyLight),
  ...slideBadge(9, '02'),
];

// ─── 03 · The Core Idea — Editorial ────────────────────────────────────────
const navyW = Math.round(CONTENT.w * 0.52);
const img03X = CONTENT.x + navyW - 48;
const img03W = CONTENT.maxX - img03X;
const scene03 = sceneBase('ce_scene_03', 3, 'The Core Idea', 'Editorial', 'Navy copy panel with overlapping concept diagram image.', 'Core Idea → Definition', ['concept', 'editorial'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: navyW, height: CONTENT.h },
  image: { x: img03X, y: CONTENT.y + 24, width: img03W, height: CONTENT.h - 48 },
}, 'bg-white', 'br-small');

scene03.clips = [
  shape('bg03', 0, 0, 0, W, H, { backgroundColor: C.white }),
  shape('navy_panel', 1, CONTENT.x - 12, CONTENT.y - 8, navyW + 24, CONTENT.h + 16, {
    backgroundColor: C.navy, borderRadius: '24px', boxShadow: '0 24px 56px rgba(15,39,68,0.2)',
  }, 'decoration', 'ce-navy-panel'),
  text('t_label', 10, CONTENT.x + 28, CONTENT.y + 28, 200, 22, 'THE CORE IDEA', { ...TYPE.org, color: C.mint }),
  text('t_title', 11, CONTENT.x + 28, CONTENT.y + 56, navyW - 56, 120, 'Explain It\nSimply', { ...TYPE.displayLight, fontSize: 44 }, 'slide-title'),
  text('t_body', 12, CONTENT.x + 28, CONTENT.y + 188, navyW - 64, 160, COPY.coreIdea, { ...TYPE.bodyOnDark, fontSize: 16 }),
  shape('sky_rule', 2, CONTENT.x + 28, CONTENT.y + 368, 64, 3, { backgroundColor: C.sky, borderRadius: '2px' }),
  ...metaPill('pill_concept', 5, CONTENT.x + 28, CONTENT.y + 388, 140, 'Concept 01', C.navyDeep, C.skyLight),
  ...heroImage('img_diagram', 4, img03X, CONTENT.y + 32, img03W, CONTENT.h - 64, 'ce-diagram', C.skyLight, {
    style: { ...IMG.heroDark },
    alt: 'Concept diagram',
  }),
  ...slideBadge(9, '03'),
];

// ─── 04 · Key Definition — Quote ───────────────────────────────────────────
const portraitSize = 260;
const quoteX = CONTENT.x + portraitSize + 48;
const scene04 = sceneBase('ce_scene_04', 4, 'Key Definition', 'Quote', 'Circular visual with elegant quote card for a memorable principle.', 'Definition → Process', ['definition', 'quote'], {
  portrait: { x: CONTENT.x, y: CONTENT.y + 56, width: portraitSize, height: portraitSize },
  quote: { x: quoteX, y: CONTENT.y + 32, width: CONTENT.maxX - quoteX, height: CONTENT.h - 64 },
}, 'bg-gradient-mint', 'tr-mini');

scene04.clips = [
  shape('bg04', 0, 0, 0, W, H, {
    background: `linear-gradient(160deg, ${C.mintLight} 0%, ${C.cream} 100%)`,
  }),
  ...organicBlobs(1),
  shape('ring_outer', 2, CONTENT.x + 12, CONTENT.y + 68, portraitSize - 24, portraitSize - 24, {
    backgroundColor: 'transparent', border: `3px solid ${C.sky}`, borderRadius: '50%',
  }),
  ...heroImage('img_def_ring', 4, CONTENT.x + 24, CONTENT.y + 80, portraitSize - 48, portraitSize - 48, 'ce-whiteboard', C.skyPale, {
    style: { ...IMG.portrait },
    alt: 'Definition visual',
  }),
  shape('quote_card', 3, quoteX, CONTENT.y + 40, CONTENT.maxX - quoteX, CONTENT.h - 80, {
    backgroundColor: C.white, borderRadius: '20px',
    boxShadow: '0 18px 44px rgba(15,23,42,0.08)', border: `1px solid ${C.line}`,
    borderLeft: `4px solid ${C.sky}`,
  }, 'decoration', 'ce-quote-bar'),
  ...iconBadge('ico_quote', 8, quoteX + 28, CONTENT.y + 64, 52, 'quote', C.skyPale),
  text('t_label', 10, quoteX + 92, CONTENT.y + 68, 180, 22, 'KEY DEFINITION', { ...TYPE.org }),
  text('t_quote', 11, quoteX + 28, CONTENT.y + 108, CONTENT.maxX - quoteX - 44, 200, COPY.definition, {
    ...TYPE.quote, fontSize: 22, lineHeight: 1.55, role: 'slide-title',
  }),
  text('t_attr', 12, quoteX + 28, CONTENT.y + 318, 360, 32, COPY.definitionAttr, {
    ...TYPE.heading, fontSize: 15, color: C.sky, textTransform: 'none', fontStyle: 'normal', fontFamily: F.sans,
  }),
  ...metaPill('pill_term', 6, quoteX + 28, CONTENT.y + 372, 148, 'Core principle', C.skyPale, C.navy),
  ...slideBadge(9, '04'),
];

// ─── 05 · How It Works — Timeline ──────────────────────────────────────────
const stepGap = 12;
const stepColW = Math.floor((CONTENT.w - stepGap * 3) / 4);
const stepRowY = CONTENT.y + 176;
const stepCardH = 352;
const stepItems = [
  { id: 'step1', color: C.sky, num: '01', title: 'Discover', body: 'Introduce the topic and why it matters to your learners.', icon: 'bulb' },
  { id: 'step2', color: C.indigo, num: '02', title: 'Break Down', body: 'Split the idea into clear, manageable parts.', icon: 'steps' },
  { id: 'step3', color: C.violet, num: '03', title: 'Demonstrate', body: 'Show examples and walk through each step aloud.', icon: 'brain' },
  { id: 'step4', color: C.navy, num: '04', title: 'Apply', body: 'Invite learners to use the idea in a real scenario.', icon: 'target' },
];
const scene05 = sceneBase('ce_scene_05', 5, 'How It Works', 'Timeline', 'Four equal step cards with icons, numbers, and descriptions.', 'Process → Examples', ['process', 'timeline'], {
  header: { x: CONTENT.x, y: CONTENT.y, width: CONTENT.w, height: 100 },
  timeline: { x: CONTENT.x, y: stepRowY, width: CONTENT.w, height: stepCardH },
}, 'bg-ice', 'bl-mini');

scene05.clips = [
  shape('bg05', 0, 0, 0, W, H, { backgroundColor: C.ice }),
  text('t_label', 10, CONTENT.x, CONTENT.y + 4, 200, 22, 'THE PROCESS', { ...TYPE.org }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 32, 520, 52, 'How It Works', { ...TYPE.display, fontSize: 40, color: C.navy }, 'slide-title'),
  text('t_intro', 12, CONTENT.x, CONTENT.y + 92, 760, 44, COPY.timelineIntro, { ...TYPE.body, fontSize: 15 }),
  shape('step_line', 1, CONTENT.x + stepColW / 2, stepRowY + 44, CONTENT.w - stepColW, 2, {
    backgroundColor: C.line, borderRadius: '2px',
  }),
  ...stepItems.flatMap((step, i) => {
    const x = CONTENT.x + i * (stepColW + stepGap);
    return stepColumn(step.id, 2, x, stepRowY, stepColW, stepCardH, step.color, step.num, step.title, step.body, step.icon);
  }),
  ...slideBadge(9, '05'),
];

// ─── 06 · Types & Examples — Grid ──────────────────────────────────────────
const gridGap = 12;
const gridCardW = Math.floor((CONTENT.w - gridGap * 2) / 3);
const gridCardH = 360;
const gridRowY = CONTENT.y + 156;
const examples = [
  { id: 'ex1', img: 'ce-example-a', title: 'In Practice', body: 'See how the concept appears in everyday work situations.', color: C.sky },
  { id: 'ex2', img: 'ce-example-b', title: 'Common Use', body: 'A typical scenario where learners apply this idea successfully.', color: C.mint },
  { id: 'ex3', img: 'ce-example-c', title: 'Advanced Case', body: 'A deeper example for learners ready to go further.', color: C.indigo },
];
const scene06 = sceneBase('ce_scene_06', 6, 'Types & Examples', 'Grid', 'Three example cards with photo thumbnails and accent bars.', 'Examples → Proof', ['examples', 'grid'], {
  grid: { x: CONTENT.x, y: gridRowY, width: CONTENT.w, height: gridCardH },
}, 'bg-white', 'br-mini');

scene06.clips = [
  shape('bg06', 0, 0, 0, W, H, { backgroundColor: C.white }),
  text('t_label', 10, CONTENT.x, CONTENT.y + 8, 200, 22, 'IN PRACTICE', { ...TYPE.org }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 36, 640, 52, 'Types & Examples', { ...TYPE.display, fontSize: 40, color: C.navy }, 'slide-title'),
  text('t_intro', 12, CONTENT.x, CONTENT.y + 96, 760, 44, COPY.examplesIntro, { ...TYPE.body, fontSize: 15 }),
  ...examples.flatMap((ex, i) => {
    const x = CONTENT.x + i * (gridCardW + gridGap);
    return exampleCard(ex.id, 2, x, gridRowY, gridCardW, gridCardH, ex.color, `0${i + 1}`, ex.title, ex.body, ex.img);
  }),
  ...slideBadge(9, '06'),
];

// ─── 07 · By the Numbers — StatsHighlight ──────────────────────────────────
const statGap = 16;
const statW = Math.floor((CONTENT.w - statGap * 2) / 3);
const statRowY = CONTENT.y + 156;
const statCardH = 296;
const stats = [
  { value: '85%', label: 'Faster learning', body: 'Learners grasp basics quicker with visual explainers.', color: C.sky },
  { value: '3×', label: 'Better recall', body: 'Structured lessons improve memory retention.', color: C.mint },
  { value: '10 min', label: 'To get started', body: 'Short explainers respect busy schedules.', color: C.indigo },
];
const scene07 = sceneBase('ce_scene_07', 7, 'By the Numbers', 'StatsHighlight', 'Three impact metrics with elevated stat cards.', 'Proof → Recap', ['stats', 'proof'], {
  stats: { x: CONTENT.x, y: CONTENT.y + 140, width: CONTENT.w, height: 380 },
}, 'bg-sky-pale', 'br-mini');

scene07.clips = [
  shape('bg07', 0, 0, 0, W, H, { backgroundColor: C.skyPale }),
  ...organicBlobs(1),
  text('t_label', 10, CONTENT.x, CONTENT.y + 8, 200, 22, 'WHY IT MATTERS', { ...TYPE.org }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 36, 520, 52, 'By the Numbers', { ...TYPE.display, fontSize: 40, color: C.navy }, 'slide-title'),
  text('t_intro', 12, CONTENT.x, CONTENT.y + 96, 720, 44, COPY.statsIntro, { ...TYPE.body, fontSize: 15 }),
  ...stats.flatMap((stat, i) => {
    const x = CONTENT.x + i * (statW + statGap);
    const y = statRowY;
    return [
      shape(`stat${i}_card`, 2, x, y, statW, statCardH, {
        backgroundColor: C.white,
        borderRadius: '20px',
        boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
        border: `1px solid ${C.line}`,
      }, 'decoration', 'ce-stat-tile'),
      shape(`stat${i}_top`, 3, x, y, statW, 8, {
        backgroundColor: stat.color,
        borderRadius: '20px 20px 0 0',
      }),
      text(`stat${i}_v`, 13 + i * 2, x + 24, y + 36, statW - 48, 72, stat.value, {
        ...TYPE.stat, fontSize: 46, color: stat.color,
      }),
      text(`stat${i}_l`, 14 + i * 2, x + 24, y + 112, statW - 48, 32, stat.label, {
        ...TYPE.cardTitle, fontSize: 18, color: C.ink,
      }),
      text(`stat${i}_b`, 15 + i * 2, x + 24, y + 150, statW - 48, 110, stat.body, {
        ...TYPE.cardBody, fontSize: 14, lineHeight: 1.55,
      }),
    ];
  }),
  ...slideBadge(9, '07'),
];

// ─── 08 · Recap & Next Step — Outro ────────────────────────────────────────
const scene08 = sceneBase('ce_scene_08', 8, 'Recap & Next Step', 'Outro', 'Navy closing with takeaways, CTA card, and resource links.', 'Recap → End', ['outro', 'recap'], {
  content: { x: CONTENT.x, y: CONTENT.y, width: CONTENT.w, height: CONTENT.h },
}, 'bg-gradient-navy', 'cover');

scene08.clips = [
  shape('bg08', 0, 0, 0, W, H, {
    background: `linear-gradient(165deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
  }),
  shape('accent_strip', 1, 0, H - 6, W, 6, { backgroundColor: C.mint }),
  image('img_logo08', 5, CONTENT.x, CONTENT.y + 16, 180, 40, 'ce-logo', {
    style: { objectFit: 'contain', filter: 'brightness(1.2)' }, alt: 'Academy logo', role: 'logo',
  }),
  text('t_thanks', 10, CONTENT.x, CONTENT.y + 72, 560, 68, 'Key Takeaways', {
    ...TYPE.displayLight, fontSize: 44,
  }, 'slide-title'),
  text('t_b1', 11, CONTENT.x, CONTENT.y + 152, 520, 28, '• Remember the core idea in one sentence', { ...TYPE.bodyOnDark, fontSize: 16 }),
  text('t_b2', 12, CONTENT.x, CONTENT.y + 188, 520, 28, '• Follow the four-step process when explaining', { ...TYPE.bodyOnDark, fontSize: 16 }),
  text('t_b3', 13, CONTENT.x, CONTENT.y + 224, 520, 28, '• Apply the concept with a real example today', { ...TYPE.bodyOnDark, fontSize: 16 }),
  text('t_body', 14, CONTENT.x, CONTENT.y + 268, 540, 56, COPY.outroBody, { ...TYPE.bodyOnDark, fontSize: 15, color: C.skyLight }),
  shape('cta_card', 4, CONTENT.x + 580, CONTENT.y + 48, 380, 320, {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '22px', border: '1px solid rgba(219,234,254,0.25)',
    boxShadow: '0 22px 52px rgba(0,0,0,0.2)',
  }, 'decoration', 'ce-card-dark'),
  ...iconBadge('ico_play', 8, CONTENT.x + 608, CONTENT.y + 76, 52, 'play', C.navyDeep),
  text('t_cta_h', 15, CONTENT.x + 672, CONTENT.y + 80, 260, 32, 'Continue Learning', {
    ...TYPE.headingLight, fontSize: 20, textTransform: 'none', fontFamily: F.sans,
  }),
  text('t_cta_b', 16, CONTENT.x + 608, CONTENT.y + 128, 324, 72, 'Move to the next lesson or download the companion worksheet.', {
    ...TYPE.bodyOnDark, fontSize: 14, color: C.skyLight,
  }),
  shape('cta_btn', 5, CONTENT.x + 608, CONTENT.y + 220, 300, 48, {
    backgroundColor: C.mint, borderRadius: '100px',
  }),
  text('t_cta_btn', 17, CONTENT.x + 628, CONTENT.y + 232, 260, 24, 'Start next lesson', {
    ...TYPE.label, fontSize: 12, color: C.navyDeep, textTransform: 'none', textAlign: 'center',
  }),
  ...metaPill('pill_res', 6, CONTENT.x + 608, CONTENT.y + 292, 140, 'Resources', 'rgba(255,255,255,0.12)', C.cream),
  ...metaPill('pill_quiz', 6, CONTENT.x + 760, CONTENT.y + 292, 140, 'Quick quiz', 'rgba(255,255,255,0.12)', C.cream),
  text('t_social', 18, CONTENT.x, CONTENT.y + 400, 600, 48, 'academy.com  ·  @youracademy  ·  Lesson 01 complete', {
    ...TYPE.bodyOnDark, fontSize: 14, color: 'rgba(219,234,254,0.75)',
  }),
  ...slideBadge(9, '08'),
];

const SCENE_BG = [
  'bg-gradient-sky',
  'bg-white',
  'bg-white',
  'bg-gradient-mint',
  'bg-ice',
  'bg-white',
  'bg-sky-pale',
  'bg-gradient-navy',
];

const SCENE_AVATAR = [
  'cover',
  'br-mini',
  'br-small',
  'tr-mini',
  'bl-mini',
  'br-mini',
  'br-mini',
  'cover',
];

const scenes = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08];
scenes.forEach((scene, i) => {
  finalizeScene(scene, SCENE_BG[i], SCENE_AVATAR[i]);
});

const template = {
  category: 'Courses',
  template: {
    id: 'course-explanation-clear-classroom',
    name: 'Course Explanation — Clear Classroom Bundle',
    category: 'Courses',
    theme: assets.theme,
    presenter: PRESENTER,
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    typography: TYPE,
    backgroundPresets: BACKGROUND_PRESETS,
    description: 'Polished 8-scene explainer bundle: sky gradients, navy editorial panels, definition quote, process timeline, example grid, stat proof, and recap outro — ideal for teaching one topic clearly.',
  },
  scenes,
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
