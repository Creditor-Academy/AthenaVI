import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/podcast_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/podcast-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

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

const PRESENTER = { name: assets.presenter?.name || 'Your Host' };

const COPY = {
  coverSub: 'Episode 01 · Recorded in Studio',
  coverBody:
    'A polished introduction to your show — who you are, what listeners can expect, and why this conversation matters. Replace with your episode hook.',
  listenIntro:
    'Great podcasts are built on presence, not production tricks. When hosts sound grounded and curious, audiences lean in — even through a screen or earbuds.',
  listenBody:
    'This episode explores the craft behind compelling audio: pacing, authenticity, and the small details that make a conversation feel alive.',
  connectIntro:
    'Podcasts create intimacy at scale. One voice in your ear can feel like a friend, a mentor, or a guide through ideas worth your time.',
  guestQuote:
    '"The shows I keep coming back to feel unscripted but intentional — like the host is thinking with me, not at me."',
  guestAuthor: '— Guest Name, Title & Company',
  segmentsIntro:
    'Three beats that structure this episode. Swap photos for your own studio shots, guest clips, or behind-the-scenes moments.',
  roadmapIntro:
    'Where the show is headed — live events, new formats, and collaborations that expand what listeners can expect.',
  sponsorBody:
    'A brief, honest mention of the partner who makes this episode possible. Keep the tone natural — your audience trusts recommendations that sound like you.',
  outroBody:
    'Thank you for listening. Subscribe wherever you get podcasts, leave a review, and share this episode with someone who would enjoy it.',
};

const IMG = {
  hero: {
    objectFit: 'cover',
    borderRadius: '22px',
    boxShadow: '0 22px 52px rgba(28,25,23,0.12)',
  },
  heroTall: {
    objectFit: 'cover',
    borderRadius: '22px 22px 22px 8px',
    boxShadow: '0 24px 56px rgba(28,25,23,0.14)',
  },
  heroDark: {
    objectFit: 'cover',
    borderRadius: '20px',
    boxShadow: '0 28px 60px rgba(0,0,0,0.32)',
  },
  thumb: {
    objectFit: 'cover',
    borderRadius: '14px',
  },
  portrait: {
    objectFit: 'cover',
    borderRadius: '50%',
  },
};

const AVATAR_STYLE_LIGHT = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.white}`,
  boxShadow: '0 12px 32px rgba(28,25,23,0.16)',
};

const AVATAR_STYLE_DARK = {
  objectFit: 'cover',
  borderRadius: '50%',
  border: `3px solid ${C.champagne}`,
  boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
};

const TYPE = {
  org: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.copper },
  display: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 48, lineHeight: 1.06 },
  displayLight: { fontFamily: F.display, fontWeight: '700', color: C.cream, fontSize: 46, lineHeight: 1.08 },
  displaySerif: { fontFamily: F.serif, fontWeight: '600', color: C.ink, fontSize: 40, lineHeight: 1.12 },
  heading: { fontFamily: F.display, fontWeight: '700', color: C.ink, fontSize: 32 },
  headingLight: { fontFamily: F.display, fontWeight: '700', color: C.cream, fontSize: 32 },
  subheading: { fontFamily: F.sans, fontWeight: '600', color: C.copper, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 12 },
  body: { fontFamily: F.sans, fontWeight: '400', color: C.muted, lineHeight: 1.75, fontSize: 17 },
  bodyOnDark: { fontFamily: F.sans, fontWeight: '400', color: C.champagneLight, lineHeight: 1.7, fontSize: 16 },
  label: { fontFamily: F.sans, fontWeight: '600', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted },
  stat: { fontFamily: F.display, fontWeight: '800', color: C.copper, fontSize: 36 },
  cardTitle: { fontFamily: F.display, fontWeight: '700', fontSize: 19, color: C.ink },
  cardBody: { fontFamily: F.sans, fontWeight: '400', fontSize: 14, color: C.muted, lineHeight: 1.6 },
  quote: { fontFamily: F.serif, fontWeight: '500', fontStyle: 'italic', color: C.ink, lineHeight: 1.5, fontSize: 24 },
};

const EDGE_DECOR = new Set(['podcast-blob-warm', 'podcast-slide-badge']);

const BACKGROUND_PRESETS = assets.backgrounds.map((bg) => ({
  id: bg.id,
  name: bg.name,
  type: bg.value.includes('gradient') ? 'gradient' : 'solid',
  value: bg.value,
}));

function entrance(type, delay = 0, duration = 0.7) {
  if (!type || type === 'none') return undefined;
  return [{ phase: 'entrance', type, duration, delay }];
}

function withAnim(clip, type, delay = 0, duration = 0.7) {
  const animations = entrance(type, delay, duration);
  if (!animations) return clip;
  return { ...clip, animations };
}

function avatarLayout(preset = 'br-mini') {
  const pad = 12;
  const layouts = {
    cover: {
      size: { width: 92, height: 112 },
      pos: { x: SAFE.maxX - 92 - pad, y: SAFE.maxY - 112 - pad },
      style: { ...AVATAR_STYLE_LIGHT, border: `3px solid ${C.champagne}` },
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
    hint: 'Swap linen presets, custom swatches, or full-bleed photos. Delete a hero image to reveal the panel color behind it.',
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
    }, 'hero-color-fallback', 'podcast-card'),
    image(id, layer + 1, x, y, w, h, assetId, {
      ...extra,
      swappableBackground: { enabled: true, defaultMode: 'image', colorValue: colorFallback },
    }),
  ];
}

function iconBadge(id, layer, x, y, size, iconAssetId, bg = C.linen) {
  const pad = Math.round(size * 0.2);
  const iconAsset = assets.icons.find((item) => item.id === iconAssetId);
  return [
    shape(`${id}_bg`, layer, x, y, size, size, {
      backgroundColor: bg, borderRadius: '50%', boxShadow: '0 6px 18px rgba(28,25,23,0.08)',
    }, 'decoration', 'podcast-icon-badge'),
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
      backgroundColor: C.espresso, borderRadius: '50%', border: `2px solid ${C.champagne}`,
    }, 'decoration', 'podcast-slide-badge'),
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
      boxShadow: '0 14px 36px rgba(28,25,23,0.07)', border: `1px solid ${C.line}`,
    }, 'decoration', 'podcast-card'),
    shape(`${id}_bar`, layer + 1, x, y + 14, 5, h - 28, { backgroundColor: barColor, borderRadius: '4px' }),
    text(`${id}_title`, layer + 2, x + 22, y + 18, w - 34, 32, title, { ...TYPE.cardTitle }),
    text(`${id}_body`, layer + 3, x + 22, y + 54, w - 34, h - 70, body, { ...TYPE.cardBody }),
  ];
}

function organicBlobs(layer = 1) {
  return [
    shape('blob_tl', layer, -50, -30, 200, 180, {
      backgroundColor: C.sand, borderRadius: '55% 45% 60% 40% / 50% 55% 45% 50%', opacity: 0.7,
    }, 'decoration', 'podcast-blob-warm'),
    shape('blob_br', layer, W - 170, H - 150, 220, 190, {
      backgroundColor: C.wheat, borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%', opacity: 0.65,
    }, 'decoration', 'podcast-blob-warm'),
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

function ensureAllClipsAnimated(scene) {
  let decorIdx = 0;
  let textIdx = 0;
  scene.clips = scene.clips.map((clip) => {
    if (clip.animations?.length) return clip;
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    const isFullBleed = (w >= W * 0.88 && h >= H * 0.82) || (x <= 8 && y <= 8 && w >= W * 0.9);

    if (clip.type === 'avatar') return withAnim(clip, 'slideLeft', 0.48, 0.75);
    if (clip.isBackground || (clip.type === 'shape' && isFullBleed)) return withAnim(clip, 'fadeIn', 0, 1.1);
    if (clip.type === 'image') {
      if (clip.role === 'icon') return withAnim(clip, 'pop', 0.18 + decorIdx++ * 0.05, 0.55);
      if (clip.role === 'logo') return withAnim(clip, 'zoomIn', 0.22, 0.7);
      if (w >= 480 || h >= 300) return withAnim(clip, 'kenBurns', 0.04, 7.5);
      return withAnim(clip, 'zoomIn', 0.14 + decorIdx++ * 0.06, 0.85);
    }
    if (clip.type === 'text') {
      if (clip.role === 'slide-title') return withAnim(clip, 'slideRight', 0.22 + textIdx++ * 0.08, 0.85);
      if (clip.role === 'section-title') return withAnim(clip, 'ascend', 0.28 + textIdx++ * 0.06, 0.75);
      if (clip.content?.startsWith('"')) return withAnim(clip, 'wordFade', 0.32, 1.1);
      return withAnim(clip, 'fadeIn', 0.34 + textIdx++ * 0.05, 0.65);
    }
    if (clip.type === 'shape') {
      if (clip.role === 'scrim') return withAnim(clip, 'fadeIn', 0, 0.9);
      if (clip.id?.startsWith('blob_')) return withAnim(clip, 'fadeIn', 0.06 + decorIdx++ * 0.04, 0.8);
      if (w >= 400) return withAnim(clip, 'slideUp', 0.12 + decorIdx++ * 0.05, 0.8);
      return withAnim(clip, 'fadeIn', 0.14 + decorIdx++ * 0.04, 0.7);
    }
    return clip;
  });
  return scene;
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
  ensureAllClipsAnimated(scene);
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
    tags: ['podcast', ...tags],
    clips: [],
  };
}

// ─── 01 · Cover — linen split (copy left, hero right) ───────────────────────
const COPY_W = 520;
const coverImgX = CONTENT.x + COPY_W + 36;
const coverImgW = CONTENT.maxX - coverImgX;
const scene01 = sceneBase('podcast_01', 1, 'Welcome to the Show', 'Cover', 'Elegant cover with show title, hook, and studio portrait.', 'Cover → Listen', ['cover'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: COPY_W, height: CONTENT.h },
  image: { x: coverImgX, y: CONTENT.y, width: coverImgW, height: CONTENT.h },
}, 'bg-gradient-linen', 'cover');

scene01.clips = [
  shape('bg01', 0, 0, 0, W, H, {
    background: `linear-gradient(145deg, ${C.white} 0%, ${C.cream} 55%, ${C.linen} 100%)`,
  }),
  ...organicBlobs(1),
  shape('accent_bar', 1, CONTENT.x, CONTENT.y + 108, 5, 72, { backgroundColor: C.copper, borderRadius: '3px' }),
  image('img_logo', 10, CONTENT.x, CONTENT.y, 190, 42, 'podcast-logo', {
    style: { objectFit: 'contain' }, alt: 'Show logo', role: 'logo',
  }),
  text('t_label', 11, CONTENT.x + 16, CONTENT.y + 56, 280, 22, 'PODCAST EPISODE', { ...TYPE.org }),
  text('t_title', 12, CONTENT.x, CONTENT.y + 108, COPY_W - 20, 130, 'Welcome to\nThe Show', { ...TYPE.display, fontSize: 50 }, 'slide-title'),
  text('t_sub', 13, CONTENT.x, CONTENT.y + 248, COPY_W - 24, 28, COPY.coverSub, { ...TYPE.subheading, textTransform: 'none', letterSpacing: '0.06em', color: C.slate }),
  text('t_body', 14, CONTENT.x, CONTENT.y + 288, COPY_W - 28, 120, COPY.coverBody, { ...TYPE.body, fontSize: 16 }),
  shape('host_card', 4, CONTENT.x, CONTENT.maxY - 92, 340, 76, {
    backgroundColor: C.white, borderRadius: '14px', boxShadow: '0 10px 28px rgba(28,25,23,0.07)', border: `1px solid ${C.line}`,
  }, 'decoration', 'podcast-card'),
  ...iconBadge('ico_host', 8, CONTENT.x + 16, CONTENT.maxY - 78, 48, 'mic', C.linen),
  text('t_host_lbl', 15, CONTENT.x + 76, CONTENT.maxY - 78, 100, 18, 'HOSTED BY', { ...TYPE.label, fontSize: 10 }),
  text('t_host', 16, CONTENT.x + 76, CONTENT.maxY - 56, 240, 28, PRESENTER.name, {
    ...TYPE.heading, fontSize: 17, textTransform: 'none', letterSpacing: '0',
  }),
  ...heroImage('img_cover', 3, coverImgX, CONTENT.y + 8, coverImgW, CONTENT.h - 16, 'podcast-cover', C.sand, {
    style: { ...IMG.heroTall, objectPosition: 'center 30%' },
    alt: 'Podcast studio',
  }),
  ...slideBadge(9, '01'),
];

// ─── 02 · The Art of Listening — white panel + copy ────────────────────────
const panelW = 480;
const scene02 = sceneBase('podcast_02', 2, 'The Art of Listening', 'Split', 'Photo panel left, narrative copy right.', 'Listen → Connect', ['story'], {
  image: { x: CONTENT.x, y: CONTENT.y, width: panelW, height: CONTENT.h },
  text: { x: CONTENT.x + panelW + 40, y: CONTENT.y, width: CONTENT.maxX - CONTENT.x - panelW - 40, height: CONTENT.h },
}, 'bg-cream', 'br-mini');

scene02.clips = [
  shape('bg02', 0, 0, 0, W, H, { backgroundColor: C.cream }),
  ...organicBlobs(1),
  shape('photo_panel', 2, CONTENT.x, CONTENT.y, panelW, CONTENT.h, {
    backgroundColor: C.white, borderRadius: '24px', boxShadow: '0 18px 44px rgba(28,25,23,0.08)',
  }, 'decoration', 'podcast-card'),
  ...heroImage('img_studio', 4, CONTENT.x + 14, CONTENT.y + 14, panelW - 28, CONTENT.h - 28, 'podcast-studio', C.linen, {
    style: { ...IMG.hero, borderRadius: '18px' },
    alt: 'Recording studio',
  }),
  text('t_label', 10, CONTENT.x + panelW + 40, CONTENT.y + 12, 220, 22, 'CHAPTER ONE', { ...TYPE.org }),
  text('t_title', 11, CONTENT.x + panelW + 40, CONTENT.y + 44, CONTENT.maxX - CONTENT.x - panelW - 48, 110, 'The Art of\nListening', { ...TYPE.displaySerif, fontSize: 42 }, 'slide-title'),
  text('t_intro', 12, CONTENT.x + panelW + 40, CONTENT.y + 168, CONTENT.maxX - CONTENT.x - panelW - 52, 100, COPY.listenIntro, { ...TYPE.body, fontSize: 16 }),
  text('t_body', 13, CONTENT.x + panelW + 40, CONTENT.y + 280, CONTENT.maxX - CONTENT.x - panelW - 52, 140, COPY.listenBody, { ...TYPE.body, fontSize: 15, color: C.slate }),
  shape('rule02', 3, CONTENT.x + panelW + 40, CONTENT.y + 440, 88, 3, { backgroundColor: C.champagne, borderRadius: '2px' }),
  ...iconBadge('ico_wave', 8, CONTENT.x + panelW + 40, CONTENT.maxY - 68, 44, 'wave', C.linen),
  text('t_foot', 14, CONTENT.x + panelW + 92, CONTENT.maxY - 62, 280, 24, 'Crafted for curious listeners', {
    ...TYPE.label, fontSize: 11, textTransform: 'none', color: C.muted,
  }),
  ...slideBadge(9, '02'),
];

// ─── 03 · Why Podcasts Connect — navy editorial ──────────────────────────────
const navyW = Math.round(CONTENT.w * 0.52);
const img03X = CONTENT.x + navyW - 48;
const img03W = CONTENT.maxX - img03X;
const scene03 = sceneBase('podcast_03', 3, 'Why Podcasts Connect', 'Editorial', 'Navy copy panel with overlapping hero image.', 'Connect → Guest', ['editorial'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: navyW, height: CONTENT.h },
  image: { x: img03X, y: CONTENT.y + 24, width: img03W, height: CONTENT.h - 48 },
}, 'bg-white', 'br-small');

scene03.clips = [
  shape('bg03', 0, 0, 0, W, H, { backgroundColor: C.white }),
  shape('navy_panel', 1, CONTENT.x - 12, CONTENT.y - 8, navyW + 24, CONTENT.h + 16, {
    backgroundColor: C.navy, borderRadius: '24px', boxShadow: '0 24px 56px rgba(28,25,23,0.18)',
  }, 'decoration', 'podcast-navy-panel'),
  text('t_label', 10, CONTENT.x + 28, CONTENT.y + 28, 200, 22, 'THE IDEA', { ...TYPE.org, color: C.champagne }),
  text('t_title', 11, CONTENT.x + 28, CONTENT.y + 56, navyW - 56, 120, 'Why Podcasts\nConnect', { ...TYPE.displayLight, fontSize: 44 }, 'slide-title'),
  text('t_body', 12, CONTENT.x + 28, CONTENT.y + 188, navyW - 64, 160, COPY.connectIntro, { ...TYPE.bodyOnDark, fontSize: 16 }),
  shape('champagne_rule', 2, CONTENT.x + 28, CONTENT.y + 368, 64, 3, { backgroundColor: C.champagne, borderRadius: '2px' }),
  ...metaPill('pill_ep03', 5, CONTENT.x + 28, CONTENT.y + 388, 120, 'Ep. 01', C.espresso, C.champagneLight),
  ...heroImage('img_headphones', 4, img03X, CONTENT.y + 32, img03W, CONTENT.h - 64, 'podcast-headphones', C.sand, {
    style: { ...IMG.heroDark },
    alt: 'Headphones detail',
  }),
  ...slideBadge(9, '03'),
];

// ─── 04 · Guest Spotlight — portrait + quote card ───────────────────────────
const portraitSize = 280;
const quoteX = CONTENT.x + portraitSize + 48;
const scene04 = sceneBase('podcast_04', 4, 'Guest Spotlight', 'Quote', 'Circular guest portrait with elegant quote card.', 'Guest → Segments', ['guest', 'quote'], {
  portrait: { x: CONTENT.x, y: CONTENT.y + 48, width: portraitSize, height: portraitSize },
  quote: { x: quoteX, y: CONTENT.y + 32, width: CONTENT.maxX - quoteX, height: CONTENT.h - 64 },
}, 'bg-gradient-warm', 'tr-mini');

scene04.clips = [
  shape('bg04', 0, 0, 0, W, H, {
    background: `linear-gradient(160deg, ${C.linen} 0%, ${C.cream} 100%)`,
  }),
  ...organicBlobs(1),
  shape('ring_outer', 2, CONTENT.x + 8, CONTENT.y + 56, portraitSize - 16, portraitSize - 16, {
    backgroundColor: 'transparent', border: `3px solid ${C.champagne}`, borderRadius: '50%',
  }),
  ...heroImage('img_guest_ring', 4, CONTENT.x + 20, CONTENT.y + 68, portraitSize - 40, portraitSize - 40, 'podcast-guest', C.wheat, {
    style: { ...IMG.portrait },
    alt: 'Guest portrait',
  }),
  shape('quote_card', 3, quoteX, CONTENT.y + 40, CONTENT.maxX - quoteX, CONTENT.h - 80, {
    backgroundColor: C.white, borderRadius: '20px',
    boxShadow: '0 18px 44px rgba(28,25,23,0.08)', border: `1px solid ${C.line}`,
    borderLeft: `4px solid ${C.copper}`,
  }, 'decoration', 'podcast-quote-bar'),
  ...iconBadge('ico_quote', 8, quoteX + 28, CONTENT.y + 64, 52, 'quote', C.linen),
  text('t_label', 10, quoteX + 92, CONTENT.y + 68, 180, 22, 'GUEST INSIGHT', { ...TYPE.org }),
  text('t_quote', 11, quoteX + 28, CONTENT.y + 128, CONTENT.maxX - quoteX - 44, 180, COPY.guestQuote, {
    ...TYPE.quote, fontSize: 26, role: 'slide-title',
  }),
  text('t_attr', 12, quoteX + 28, CONTENT.y + 324, 360, 32, COPY.guestAuthor, {
    ...TYPE.heading, fontSize: 15, color: C.copper, textTransform: 'none', fontStyle: 'normal', fontFamily: F.sans,
  }),
  ...metaPill('pill_guest', 6, quoteX + 28, CONTENT.y + 372, 148, 'Featured guest', C.linen, C.slate),
  ...slideBadge(9, '04'),
];

// ─── 05 · Episode Segments — three feature cards ───────────────────────────
const cardW = Math.floor((CONTENT.w - 32) / 3);
const segments = [
  { id: 'seg1', img: 'podcast-mic', title: 'Cold Open', body: 'Set the tone in the first sixty seconds — hook, context, and a reason to stay.', color: C.copper },
  { id: 'seg2', img: 'podcast-interview', title: 'Main Conversation', body: 'The heart of the episode where ideas unfold naturally between host and guest.', color: C.champagne },
  { id: 'seg3', img: 'podcast-audience', title: 'Closing Beat', body: 'Land the takeaway, tease what is next, and invite listeners to engage.', color: C.sage },
];
const scene05 = sceneBase('podcast_05', 5, 'Episode Segments', 'Grid', 'Three segment cards with clean photo thumbs.', 'Segments → Roadmap', ['segments'], {
  grid: { x: CONTENT.x, y: CONTENT.y + 148, width: CONTENT.w, height: 360 },
}, 'bg-white', 'bl-mini');

scene05.clips = [
  shape('bg05', 0, 0, 0, W, H, { backgroundColor: C.white }),
  text('t_label', 10, CONTENT.x, CONTENT.y + 8, 200, 22, 'STRUCTURE', { ...TYPE.org }),
  text('t_title', 11, CONTENT.x, CONTENT.y + 36, 640, 52, 'Episode Segments', { ...TYPE.display, fontSize: 40 }, 'slide-title'),
  text('t_intro', 12, CONTENT.x, CONTENT.y + 96, 760, 44, COPY.segmentsIntro, { ...TYPE.body, fontSize: 15 }),
  ...segments.flatMap((seg, i) => {
    const x = CONTENT.x + i * (cardW + 16);
    const y = CONTENT.y + 160;
    return [
      shape(`${seg.id}_card`, 2, x, y, cardW, 352, {
        backgroundColor: C.cream, borderRadius: '18px', border: `1px solid ${C.line}`,
        boxShadow: '0 12px 32px rgba(28,25,23,0.05)',
      }, 'decoration', 'podcast-stat-tile'),
      shape(`${seg.id}_accent`, 2, x, y, cardW, 5, { backgroundColor: seg.color, borderRadius: '18px 18px 0 0' }),
      ...heroImage(`${seg.id}_img`, 4, x + 16, y + 20, cardW - 32, 168, seg.img, C.linen, {
        style: { ...IMG.thumb },
        alt: seg.title,
      }),
      text(`${seg.id}_num`, 13 + i, x + 20, y + 204, 48, 36, `0${i + 1}`, { ...TYPE.stat, fontSize: 28, color: seg.color }),
      text(`${seg.id}_title`, 14 + i, x + 20, y + 244, cardW - 40, 28, seg.title, { ...TYPE.cardTitle }),
      text(`${seg.id}_body`, 15 + i, x + 20, y + 276, cardW - 40, 64, seg.body, { ...TYPE.cardBody, fontSize: 13 }),
    ];
  }),
  ...slideBadge(9, '05'),
];

// ─── 06 · The Road Ahead — portrait + goal cards ─────────────────────────────
const roadImgW = 360;
const roadCopyX = CONTENT.x + roadImgW + 44;
const goalW = Math.floor((CONTENT.maxX - roadCopyX - 8) / 3) - 10;
const scene06 = sceneBase('podcast_06', 6, 'The Road Ahead', 'Editorial', 'Portrait with three milestone cards.', 'Roadmap → Partner', ['roadmap'], {
  image: { x: CONTENT.x, y: CONTENT.y + 16, width: roadImgW, height: CONTENT.h - 32 },
  content: { x: roadCopyX, y: CONTENT.y, width: CONTENT.maxX - roadCopyX, height: CONTENT.h },
}, 'bg-linen', 'br-mini');

scene06.clips = [
  shape('bg06', 0, 0, 0, W, H, { backgroundColor: C.linen }),
  ...organicBlobs(1),
  ...heroImage('img_host_road', 3, CONTENT.x, CONTENT.y + 20, roadImgW, CONTENT.h - 40, 'podcast-host', C.sand, {
    style: { ...IMG.hero, borderRadius: '20px 20px 20px 6px' },
    alt: 'Host portrait',
  }),
  text('t_label', 10, roadCopyX, CONTENT.y + 12, 180, 22, 'WHAT IS NEXT', { ...TYPE.org }),
  text('t_title', 11, roadCopyX, CONTENT.y + 40, CONTENT.maxX - roadCopyX, 100, 'The Road\nAhead', { ...TYPE.displaySerif, fontSize: 38 }, 'slide-title'),
  text('t_intro', 12, roadCopyX, CONTENT.y + 152, CONTENT.maxX - roadCopyX - 8, 72, COPY.roadmapIntro, { ...TYPE.body, fontSize: 15 }),
  ...infoCard('goal_a', 4, roadCopyX, CONTENT.y + 240, goalW, 132, C.copper, 'Live Events', 'Record in front of audiences and build community in person.'),
  ...infoCard('goal_b', 4, roadCopyX + goalW + 12, CONTENT.y + 240, goalW, 132, C.champagne, 'New Formats', 'Video clips, newsletters, and bonus episodes for subscribers.'),
  ...infoCard('goal_c', 4, roadCopyX + (goalW + 12) * 2, CONTENT.y + 240, goalW, 132, C.sage, 'Collabs', 'Cross-promote with aligned shows and expert guests.'),
  ...slideBadge(9, '06'),
];

// ─── 07 · Partner Message — refined sponsor split ───────────────────────────
const sponsorCopyW = 580;
const ctaX = CONTENT.x + sponsorCopyW + 32;
const scene07 = sceneBase('podcast_07', 7, 'Partner Message', 'Promo', 'Clean sponsor copy with navy CTA card — no loud gradients.', 'Partner → Outro', ['sponsor'], {
  copy: { x: CONTENT.x, y: CONTENT.y, width: sponsorCopyW, height: CONTENT.h },
  cta: { x: ctaX, y: CONTENT.y + 16, width: CONTENT.maxX - ctaX, height: CONTENT.h - 32 },
}, 'bg-cream', 'dark');

scene07.clips = [
  shape('bg07', 0, 0, 0, W, H, { backgroundColor: C.cream }),
  image('img_logo07', 10, CONTENT.x, CONTENT.y + 8, 170, 38, 'podcast-logo', {
    style: { objectFit: 'contain' }, alt: 'Show logo', role: 'logo',
  }),
  text('t_label', 11, CONTENT.x, CONTENT.y + 56, 160, 22, 'PARTNER', { ...TYPE.org }),
  text('t_title', 12, CONTENT.x, CONTENT.y + 84, sponsorCopyW - 24, 72, 'This Episode Is\nBrought To You By', { ...TYPE.displaySerif, fontSize: 36 }, 'slide-title'),
  text('t_body', 13, CONTENT.x, CONTENT.y + 168, sponsorCopyW - 32, 150, COPY.sponsorBody, { ...TYPE.body, fontSize: 15 }),
  ...iconBadge('ico_star07', 8, CONTENT.x, CONTENT.maxY - 72, 44, 'star', C.linen),
  text('t_trust', 14, CONTENT.x + 56, CONTENT.maxY - 66, 320, 24, 'Trusted recommendations only', {
    ...TYPE.label, fontSize: 11, textTransform: 'none',
  }),
  shape('cta_card', 2, ctaX, CONTENT.y + 20, CONTENT.maxX - ctaX, CONTENT.h - 40, {
    backgroundColor: C.navy, borderRadius: '22px', boxShadow: '0 22px 52px rgba(28,25,23,0.2)',
  }, 'decoration', 'podcast-card-dark'),
  ...heroImage('img_cta', 4, ctaX + 20, CONTENT.y + 40, CONTENT.maxX - ctaX - 40, 140, 'podcast-desk', C.espresso, {
    style: { ...IMG.thumb, borderRadius: '14px' },
    alt: 'Producer desk',
  }),
  text('t_code', 15, ctaX + 28, CONTENT.y + 200, CONTENT.maxX - ctaX - 56, 64, 'Use code\nSTUDIO20', {
    ...TYPE.displayLight, fontSize: 28, textAlign: 'center', lineHeight: 1.25,
  }),
  text('t_link', 16, ctaX + 28, CONTENT.y + 276, CONTENT.maxX - ctaX - 56, 28, 'partner.com/show', {
    ...TYPE.bodyOnDark, fontSize: 14, textAlign: 'center', color: C.champagneLight,
  }),
  shape('cta_btn', 5, ctaX + 36, CONTENT.y + 320, CONTENT.maxX - ctaX - 72, 44, {
    backgroundColor: C.champagne, borderRadius: '100px',
  }),
  text('t_cta', 17, ctaX + 56, CONTENT.y + 330, CONTENT.maxX - ctaX - 112, 24, 'Claim offer', {
    ...TYPE.label, fontSize: 11, color: C.espresso, textTransform: 'none', textAlign: 'center',
  }),
  ...slideBadge(9, '07'),
];

// ─── 08 · Thank You — navy outro ───────────────────────────────────────────
const scene08 = sceneBase('podcast_08', 8, 'Thank You for Listening', 'Outro', 'Refined closing with subscribe pills and social links.', 'Outro → End', ['outro'], {
  content: { x: CONTENT.x, y: CONTENT.y, width: CONTENT.w, height: CONTENT.h },
}, 'bg-gradient-navy', 'cover');

scene08.clips = [
  shape('bg08', 0, 0, 0, W, H, {
    background: `linear-gradient(165deg, ${C.espresso} 0%, ${C.navy} 100%)`,
  }),
  shape('accent_strip', 1, 0, H - 6, W, 6, { backgroundColor: C.champagne }),
  image('img_logo08', 5, CONTENT.x, CONTENT.y + 16, 180, 40, 'podcast-logo', {
    style: { objectFit: 'contain', filter: 'brightness(1.1)' }, alt: 'Show logo', role: 'logo',
  }),
  text('t_thanks', 10, CONTENT.x, CONTENT.y + 80, 720, 68, 'Thank You for Listening', {
    ...TYPE.displayLight, fontSize: 46,
  }, 'slide-title'),
  text('t_body', 11, CONTENT.x, CONTENT.y + 160, 680, 56, COPY.outroBody, { ...TYPE.bodyOnDark, fontSize: 17 }),
  text('t_next', 12, CONTENT.x, CONTENT.y + 232, 480, 32, 'Next up: [Episode Title]', {
    ...TYPE.headingLight, fontSize: 19, color: C.champagne, textTransform: 'none', fontFamily: F.sans, fontWeight: '600',
  }),
  ...metaPill('pill_spotify', 6, CONTENT.x, CONTENT.y + 288, 118, 'Spotify', 'rgba(255,255,255,0.1)', C.cream),
  ...metaPill('pill_apple', 6, CONTENT.x + 130, CONTENT.y + 288, 118, 'Apple', 'rgba(255,255,255,0.1)', C.cream),
  ...metaPill('pill_youtube', 6, CONTENT.x + 260, CONTENT.y + 288, 118, 'YouTube', 'rgba(255,255,255,0.1)', C.cream),
  text('t_social', 13, CONTENT.x, CONTENT.y + 336, 600, 48, '@yourshow  ·  yourshow.com  ·  New episodes weekly', {
    ...TYPE.bodyOnDark, fontSize: 14, color: 'rgba(232,213,192,0.75)',
  }),
  shape('follow_card', 4, CONTENT.x, CONTENT.y + 400, 440, 88, {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '16px', border: '1px solid rgba(232,213,192,0.2)',
  }),
  ...iconBadge('ico_podcast08', 8, CONTENT.x + 20, CONTENT.y + 418, 52, 'podcast', C.espresso),
  text('t_follow', 14, CONTENT.x + 84, CONTENT.y + 422, 330, 26, 'Follow for bonus clips & BTS', {
    ...TYPE.headingLight, fontSize: 16, textTransform: 'none', fontFamily: F.sans,
  }),
  text('t_follow_sub', 15, CONTENT.x + 84, CONTENT.y + 450, 330, 22, 'Subscribe on your favorite platform', {
    ...TYPE.label, fontSize: 11, color: C.champagneLight, textTransform: 'none',
  }),
  ...slideBadge(9, '08'),
];

const SCENE_BG = [
  'bg-gradient-linen',
  'bg-cream',
  'bg-white',
  'bg-gradient-warm',
  'bg-white',
  'bg-linen',
  'bg-cream',
  'bg-gradient-navy',
];

const SCENE_AVATAR = [
  'cover',
  'br-mini',
  'br-small',
  'tr-mini',
  'bl-mini',
  'br-mini',
  'dark',
  'cover',
];

const scenes = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08];
scenes.forEach((scene, i) => {
  finalizeScene(scene, SCENE_BG[i], SCENE_AVATAR[i]);
});

const template = {
  category: 'Podcast',
  template: {
    id: 'podcast-champagne-studio',
    name: 'Podcast — Champagne Studio',
    category: 'Podcast',
    theme: assets.theme,
    presenter: PRESENTER,
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: 'Editorial 8-scene podcast bundle: warm linen covers, navy editorial panels, refined typography, clean photo framing, and entrance animations on every layer.',
  },
  scenes,
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);

let missing = 0;
for (const scene of scenes) {
  for (const clip of scene.clips) {
    if (!clip.animations?.length) {
      missing += 1;
      console.warn(`Missing animation: ${scene.id} / ${clip.id}`);
    }
  }
}
console.log(missing === 0 ? 'All clips have entrance animations.' : `${missing} clips missing animations.`);
