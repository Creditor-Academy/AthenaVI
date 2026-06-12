import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/pitch_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/pitch-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 8;
const W = 1280;
const H = 720;
const C = assets.colors;

/** Matches CanvasGuidesOverlay safe zone (5% inset). */
const SAFE = {
  x: Math.round(W * 0.05),
  y: Math.round(H * 0.05),
};
SAFE.w = W - SAFE.x * 2;
SAFE.h = H - SAFE.y * 2;
SAFE.maxX = SAFE.x + SAFE.w;
SAFE.maxY = SAFE.y + SAFE.h;

const AVATAR_SIZE = { width: 200, height: 240 };
const AVATAR_POS = { x: SAFE.maxX - AVATAR_SIZE.width, y: SAFE.maxY - AVATAR_SIZE.height };

function shouldFitToSafeArea(clip) {
  if (clip.type === 'text') return true;
  if (clip.type === 'avatar') return true;
  if (clip.role === 'icon' || clip.role === 'logo') return true;
  if (clip.shapeKey === 'pitch-icon-badge') return true;
  if (clip.type === 'image') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    const fullWidth = x <= 10 && w >= W * 0.9;
    const fullHeight = y <= 10 && h >= H * 0.85;
    const edgeBanner = y >= H - 100 && w >= W * 0.9;
    return !(fullWidth || fullHeight || edgeBanner);
  }
  if (clip.type === 'shape') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
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
    scene.zones.avatar = {
      ...scene.zones.avatar,
      x: AVATAR_POS.x,
      y: AVATAR_POS.y,
      width: AVATAR_SIZE.width,
      height: AVATAR_SIZE.height,
    };
  }
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
  };
}

function iconBadge(id, layer, x, y, size, iconAssetId, bg = C.navy) {
  const pad = Math.round(size * 0.15);
  const iconAsset = assets.icons.find((item) => item.id === iconAssetId);
  return [
    shape(`${id}_bg`, layer, x, y, size, size, { backgroundColor: bg, borderRadius: '50%' }, 'decoration', 'pitch-icon-badge'),
    {
      id, type: 'image', assetKey: iconAssetId, role: 'icon', editable: true, layer: layer + 1,
      position: { x: x + pad, y: y + pad }, size: { width: size - pad * 2, height: size - pad * 2 },
      startTime: 0, endTime: DURATION,
      src: iconAsset?.src, placeholder: true, alt: iconAsset?.name || '',
      style: { objectFit: 'contain', borderRadius: '0', backgroundColor: 'transparent' },
    },
  ];
}

function avatarClip(layer = 60) {
  return {
    id: 'avatar_presenter',
    type: 'avatar',
    role: 'avatar',
    editable: true,
    layer,
    position: { ...AVATAR_POS },
    size: { ...AVATAR_SIZE },
    startTime: 0,
    endTime: DURATION,
  };
}

function finalizeScene(scene, bgId = 'bg-white') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  scene.background = { type: 'solid', value: bg?.value || '#ffffff' };
  enforceSafeArea(scene);
  if (!scene.clips.some((clip) => clip.type === 'avatar')) {
    scene.clips.push(avatarClip());
  }
  return scene;
}

function sceneBase(id, slideIndex, title, layoutType, description, flow, tags, zones, bgId = 'bg-white') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  return {
    id,
    slideIndex,
    title,
    layoutType,
    canvasSize: { width: W, height: H },
    avatarPosition: 'bottom-right',
    background: { type: 'solid', value: bg?.value || '#ffffff' },
    zones: {
      ...zones,
      avatar: zones.avatar || { x: AVATAR_POS.x, y: AVATAR_POS.y, width: AVATAR_SIZE.width, height: AVATAR_SIZE.height },
    },
    description,
    flow,
    duration: DURATION,
    tags: ['pitch', ...tags],
    clips: [],
  };
}

// ─── Slide 1: Cover ─────────────────────────────────────────────────────────
const scene01 = sceneBase('scene_01', 1, 'Cover', 'Cover', 'Company profile cover with hero image, logo, and title.', 'Cover → Intro', ['cover', 'title', 'branding'], {
  hero: { x: 448, y: 0, width: 832, height: 463 },
  logo: { x: 73, y: 74, width: 182, height: 74 },
  title: { x: 73, y: 244, width: 601, height: 430 },
});
scene01.clips = [
  shape('s_blue_main', 0, 420, 0, 860, 520, { backgroundColor: C.secondary, clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 72%)' }, 'decoration', 'pitch-blue-panel'),
  shape('s_blue_light', 1, 500, 40, 780, 380, { backgroundColor: C.pale, clipPath: 'polygon(8% 0%, 100% 0%, 100% 85%, 0% 100%)' }, 'decoration', 'pitch-light-panel'),
  shape('s_accent_line', 2, 73, 418, 140, 8, { backgroundColor: C.primary, borderRadius: '4px' }, 'decoration', 'pitch-accent-bar'),
  shape('s_circle_ring', 3, 930, 268, 210, 210, { backgroundColor: 'transparent', border: `8px solid ${C.navy}`, borderRadius: '50%' }, 'decoration', 'pitch-circle-ring'),
  image('img_hero', 4, 448, 0, 832, 463, 'pitch-cover-hero', { style: { borderRadius: '0', objectFit: 'cover' }, alt: 'Modern office corridor' }),
  image('img_circle', 5, 945, 283, 180, 180, 'pitch-cover-circle', { style: { borderRadius: '50%', objectFit: 'cover' }, alt: 'Team meeting' }),
  image('img_logo', 10, 73, 74, 220, 56, 'pitch-logo', { style: { objectFit: 'contain' }, alt: 'Company logo', role: 'logo' }),
  text('t_free', 11, 73, 244, 200, 80, 'FREE', { fontSize: 66, fontWeight: '800', color: C.dark, fontFamily: 'Segoe UI' }, 'slide-title'),
  text('t_company', 12, 73, 318, 400, 80, 'COMPANY', { fontSize: 66, fontWeight: '800', color: C.primary, fontFamily: 'Segoe UI' }, 'slide-title'),
  text('t_profile', 13, 73, 392, 350, 80, 'PROFILE', { fontSize: 66, fontWeight: '800', color: C.dark, fontFamily: 'Segoe UI' }, 'slide-title'),
  text('t_sub', 14, 73, 560, 560, 44, 'PRESENTATION TEMPLATE', { fontSize: 28, fontWeight: '400', color: C.dark, fontFamily: 'Segoe UI' }, 'section-title'),
  text('t_footer', 15, 150, 620, 200, 32, 'Edit Text Here', { fontSize: 14, fontWeight: '400', color: C.gray, fontFamily: 'Segoe UI' }, 'placeholder'),
];

// ─── Slide 2: Introduction ────────────────────────────────────────────────
const scene02 = sceneBase('scene_02', 2, 'Introduction', 'TwoColumn', 'Mission, purpose, and service pillars with hero image.', 'Intro → Value', ['introduction', 'mission'], {
  content: { x: 73, y: 103, width: 500, height: 600 },
  image: { x: 585, y: 198, width: 686, height: 434 },
});
scene02.clips = [
  shape('s_panel', 0, 560, 120, 700, 500, { backgroundColor: C.pale, borderRadius: '12px' }),
  shape('s_outline', 1, 540, 100, 740, 540, { backgroundColor: 'transparent', border: `3px solid ${C.navy}`, borderRadius: '12px' }),
  shape('s_trap', 2, 520, 480, 400, 180, { backgroundColor: C.light, clipPath: 'polygon(0% 30%, 100% 0%, 100% 100%, 0% 100%)' }),
  text('t_title', 10, 73, 100, 500, 60, 'Introduction', { fontSize: 48, fontWeight: '800', color: C.dark, fontFamily: 'Segoe UI' }, 'slide-title'),
  text('t_mission', 11, 73, 360, 500, 36, 'Mission and Purpose', { fontSize: 24, fontWeight: '700', color: C.primary, fontFamily: 'Segoe UI' }, 'section-header'),
  text('t_body', 12, 73, 405, 480, 90, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text. Insert your sample text here.', { fontSize: 16, fontWeight: '400', color: C.dark, lineHeight: 1.5, fontFamily: 'Segoe UI' }),
  ...iconBadge('ico_serve', 8, 73, 510, 64, 'idea', C.white),
  text('t_serve_h', 13, 140, 512, 200, 28, 'Who we Serve', { fontSize: 18, fontWeight: '700', color: C.dark }),
  text('t_serve_b', 14, 73, 548, 240, 70, 'This is a sample text. Insert your desired text here. You can add text.', { fontSize: 14, fontWeight: '400', color: C.gray, lineHeight: 1.4 }),
  ...iconBadge('ico_why', 8, 340, 510, 64, 'paper-plane', C.white),
  text('t_why_h', 15, 408, 512, 200, 28, 'Why we Serve', { fontSize: 18, fontWeight: '700', color: C.dark }),
  text('t_why_b', 16, 340, 548, 240, 70, 'This is a sample text. Insert your desired text here. You can add text.', { fontSize: 14, fontWeight: '400', color: C.gray, lineHeight: 1.4 }),
  image('img_intro', 6, 585, 198, 686, 434, 'pitch-intro', { style: { borderRadius: '16px', objectFit: 'cover' }, alt: 'Factory automation' }),
];

// ─── Slide 3: Value Proposition ───────────────────────────────────────────
const scene03 = sceneBase('scene_03', 3, 'Value Proposition', 'StatsHighlight', 'Pain point, solution, and key benefit stats.', 'Value → Services', ['value', 'stats'], {
  content: { x: 73, y: 103, width: 720, height: 540 },
  image: { x: 834, y: 138, width: 515, height: 515 },
});
scene03.clips = [
  shape('s_right', 0, 820, 0, 460, H, { backgroundColor: C.pale }),
  shape('s_diamond_bg', 1, 860, 150, 420, 420, { backgroundColor: C.navy, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', borderRadius: '8px' }),
  text('t_title', 10, 73, 100, 600, 56, 'Value Proposition', { fontSize: 48, fontWeight: '800', color: C.dark, fontFamily: 'Segoe UI' }, 'slide-title'),
  ...iconBadge('ico_pain', 8, 73, 200, 60, 'target', C.white),
  text('t_pain_h', 11, 140, 202, 200, 28, 'Pain Point', { fontSize: 20, fontWeight: '700', color: C.primary }),
  text('t_pain_b', 12, 73, 238, 520, 70, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text. Insert your sample text here.', { fontSize: 14, color: C.gray, lineHeight: 1.45 }),
  ...iconBadge('ico_sol', 8, 73, 320, 60, 'solution', C.white),
  text('t_sol_h', 13, 140, 322, 200, 28, 'Our Solution', { fontSize: 20, fontWeight: '700', color: C.primary }),
  text('t_sol_b', 14, 73, 358, 520, 70, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text. Insert your sample text here.', { fontSize: 14, color: C.gray, lineHeight: 1.45 }),
  shape('s_divider', 9, 73, 450, 560, 2, { backgroundColor: C.light }),
  text('t_b1_l', 15, 73, 470, 160, 22, 'Key Benefit 1', { fontSize: 14, fontWeight: '600', color: C.dark }),
  text('t_b1_v', 16, 73, 495, 260, 72, '$300M', { fontSize: 56, fontWeight: '800', color: C.navy }),
  text('t_b1_d', 17, 73, 570, 280, 60, 'This is a sample text. Insert your desired text here. You can add sample text.', { fontSize: 13, color: C.gray, lineHeight: 1.4 }),
  text('t_b2_l', 18, 380, 470, 160, 22, 'Key Benefit 2', { fontSize: 14, fontWeight: '600', color: C.dark }),
  text('t_b2_v', 19, 380, 495, 260, 72, '5.6M', { fontSize: 56, fontWeight: '800', color: C.navy }),
  text('t_b2_d', 20, 380, 570, 280, 60, 'This is a sample text. Insert your desired text here. You can add sample text.', { fontSize: 13, color: C.gray, lineHeight: 1.4 }),
  image('img_value', 6, 880, 168, 380, 380, 'pitch-value', { style: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', objectFit: 'cover' }, alt: 'Business meeting' }),
];

// ─── Slide 4: Services ────────────────────────────────────────────────────
const serviceCols = [
  { x: 73, icon: 'arrow-growth', bg: C.navy },
  { x: 430, icon: 'arrow-growth', bg: C.secondary },
  { x: 787, icon: 'arrow-growth', bg: C.secondary },
];
const scene04 = sceneBase('scene_04', 4, 'Services', 'ServiceGrid', 'Core offering with three service columns.', 'Services → USP', ['services', 'offering'], {
  header: { x: 73, y: 103, width: 844, height: 155 },
  grid: { x: 73, y: 410, width: 1200, height: 300 },
});
scene04.clips = [
  text('t_title', 10, 73, 90, 400, 52, 'Services', { fontSize: 48, fontWeight: '800', color: C.dark }, 'slide-title'),
  text('t_sub', 11, 73, 148, 400, 36, 'The Core Offering', { fontSize: 28, fontWeight: '400', color: C.dark }),
  text('t_body', 12, 73, 255, 540, 100, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text. Insert your desired text here. You can add sample text. This is a sample text.', { fontSize: 15, color: C.gray, lineHeight: 1.5 }),
  image('img_services', 5, 640, 90, 600, 320, 'pitch-services', { style: { clipPath: 'polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%)', borderRadius: '0 0 24px 0', objectFit: 'cover' }, alt: 'Business team' }),
  ...serviceCols.flatMap((col, i) => {
    const n = i + 1;
    return [
      ...iconBadge(`ico_svc${n}`, 8, col.x, 400, 56, col.icon, col.bg),
      text(`t_svc${n}_h`, 13 + i * 3, col.x + 68, 402, 200, 28, `Service ${n}`, { fontSize: 18, fontWeight: '700', color: C.dark }),
      text(`t_svc${n}_b`, 14 + i * 3, col.x, 440, 300, 60, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text.', { fontSize: 13, color: C.gray, lineHeight: 1.4 }),
      ...iconBadge(`chk${n}a`, 7, col.x, 510, 28, 'check', C.light),
      text(`t_chk${n}a`, 20 + i, col.x + 36, 508, 260, 24, 'This is a sample text.', { fontSize: 14, color: C.dark }),
      ...iconBadge(`chk${n}b`, 7, col.x, 545, 28, 'check', C.light),
      text(`t_chk${n}b`, 23 + i, col.x + 36, 543, 260, 24, 'You can add sample text.', { fontSize: 14, color: C.dark }),
    ];
  }),
];

// ─── Slide 5: USP ─────────────────────────────────────────────────────────
const uspRows = [
  { y: 200, icon: 'shield-user', highlight: false },
  { y: 310, icon: 'team-dollar', highlight: false },
  { y: 420, icon: 'lifebuoy', highlight: true },
];
const scene05 = sceneBase('scene_05', 5, 'Unique Selling Point', 'ListRight', 'Three USP rows with icons and hero image.', 'USP → Milestones', ['usp'], {
  content: { x: 73, y: 103, width: 610, height: 540 },
  image: { x: 692, y: 87, width: 588, height: 634 },
});
scene05.clips = [
  shape('s_tri1', 0, 620, 380, 120, 100, { backgroundColor: C.light, clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }),
  shape('s_tri2', 1, 640, 400, 100, 80, { backgroundColor: C.secondary, clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }),
  text('t_title', 10, 73, 100, 600, 56, 'Unique Selling Point', { fontSize: 48, fontWeight: '800', color: C.dark }, 'slide-title'),
  ...uspRows.flatMap((row, i) => {
    const items = [
      shape(`s_row${i}`, 2, 60, row.y - 10, 560, 88, row.highlight ? { backgroundColor: C.navy, borderRadius: '4px' } : { backgroundColor: 'transparent' }),
      ...iconBadge(`ico_usp${i}`, 8, 73, row.y, 60, row.icon, C.white),
      text(`t_usp${i}_h`, 11 + i * 2, 140, row.y + 4, 300, 28, 'Edit Text Here', { fontSize: 20, fontWeight: '700', color: row.highlight ? C.white : C.dark }),
      text(`t_usp${i}_b`, 12 + i * 2, 140, row.y + 34, 460, 44, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text.', { fontSize: 14, color: row.highlight ? C.light : C.gray, lineHeight: 1.4 }),
    ];
    return items;
  }),
  image('img_usp', 6, 692, 87, 588, 634, 'pitch-usp', { style: { clipPath: 'polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)', objectFit: 'cover' }, alt: 'Professionals at work' }),
];

// ─── Slide 6: Milestones ──────────────────────────────────────────────────
const milestones = [
  { x: 80, h: 260, color: '#f1f5f9', textColor: C.dark, icon: 'signpost', label: 'Milestone 1' },
  { x: 340, h: 360, color: C.secondary, textColor: C.white, icon: 'handshake', label: 'Milestone 2' },
  { x: 600, h: 300, color: C.primary, textColor: C.white, icon: 'target', label: 'Milestone 3' },
  { x: 860, h: 400, color: C.navy, textColor: C.white, icon: 'presentation', label: 'Milestone 4' },
];
const scene06 = sceneBase('scene_06', 6, 'Key Milestones', 'Timeline', 'Four milestone columns in bar chart style.', 'Milestones → Contact', ['milestones', 'timeline'], {
  header: { x: 73, y: 103, width: 1134, height: 78 },
  timeline: { x: 73, y: 260, width: 1134, height: 420 },
});
scene06.clips = [
  text('t_title', 10, 73, 100, 400, 56, 'Key Milestones', { fontSize: 48, fontWeight: '800', color: C.dark }, 'slide-title'),
  text('t_intro', 11, 500, 110, 700, 60, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text. Insert your desired text here.', { fontSize: 15, color: C.gray, lineHeight: 1.45 }),
  ...milestones.flatMap((m, i) => {
    const barY = H - 80 - m.h;
    return [
      shape(`bar${i}`, 1, m.x, barY, 200, m.h, { backgroundColor: m.color, borderRadius: '8px 8px 0 0' }),
      ...iconBadge(`ico_ms${i}`, 9, m.x + 70, barY - 40, 68, m.icon, C.white),
      text(`t_ms${i}_h`, 12 + i * 2, m.x + 10, barY + 24, 180, 28, m.label, { fontSize: 18, fontWeight: '700', color: m.textColor, textAlign: 'center' }),
      text(`t_ms${i}_b`, 13 + i * 2, m.x + 10, barY + 58, 180, 100, 'This is a sample text. Insert your desired text here. You can add sample text. This is a sample text.', { fontSize: 13, color: m.textColor, textAlign: 'center', lineHeight: 1.4 }),
    ];
  }),
];

// ─── Slide 7: Contact ─────────────────────────────────────────────────────
const scene07 = sceneBase('scene_07', 7, 'Contact', 'ContactSplit', 'Contact details with portrait image.', 'Contact → End', ['contact', 'cta'], {
  details: { x: 73, y: 101, width: 580, height: 550 },
  image: { x: 680, y: 136, width: 492, height: 584 },
});
scene07.clips = [
  shape('s_blue_block', 0, 900, 0, 380, 280, { backgroundColor: C.secondary }),
  text('t_title', 10, 73, 100, 500, 56, 'Edit Text Here', { fontSize: 48, fontWeight: '800', color: C.dark }, 'slide-title'),
  text('t_loc_h', 11, 73, 200, 200, 28, 'Location', { fontSize: 20, fontWeight: '700', color: C.dark }),
  text('t_loc_b', 12, 73, 232, 400, 60, '123 Anywhere St., Any City, ST 12345\nThis is a sample text. Edit text here.', { fontSize: 15, color: C.gray, lineHeight: 1.5 }),
  ...iconBadge('ico_phone', 8, 73, 330, 56, 'phone', C.navy),
  text('t_phone', 13, 135, 338, 280, 32, '+1 (212) 123-4567', { fontSize: 16, color: C.dark }),
  ...iconBadge('ico_email', 8, 73, 395, 56, 'email', C.secondary),
  text('t_email', 14, 135, 403, 320, 32, 'Enter your email address here', { fontSize: 16, color: C.dark }),
  ...iconBadge('ico_web', 8, 73, 460, 56, 'website', C.navy),
  text('t_web', 15, 135, 468, 320, 32, 'Enter your website here', { fontSize: 16, color: C.dark }),
  image('img_contact', 6, 680, 136, 492, 584, 'pitch-contact', { style: { borderRadius: '16px', objectFit: 'cover' }, alt: 'Support representative' }),
];

// ─── Slide 8: Promotional ─────────────────────────────────────────────────
const scene08 = sceneBase('scene_08', 8, 'Promotional', 'Promo', 'Promotional slide with coupon and CTA.', 'Promo → End', ['promo', 'discount', 'cta'], {
  content: { x: 73, y: 192, width: 900, height: 600 },
  cta: { x: 900, y: 192, width: 300, height: 600 },
});
scene08.clips = [
  shape('s_cta_bg', 0, 640, 80, 600, 560, { backgroundColor: C.pale, borderRadius: '16px' }),
  image('img_logo', 5, 720, 100, 320, 56, 'pitch-logo', { style: { objectFit: 'contain' }, alt: 'Logo', role: 'logo' }),
  text('t_discount', 10, 680, 170, 520, 36, 'Get 15% discount from regular price', { fontSize: 18, fontWeight: '600', color: C.dark, textAlign: 'center' }),
  text('t_coupon', 11, 700, 220, 480, 80, 'Coupon Code:\nFREEBUNDLE15', { fontSize: 20, fontWeight: '700', color: C.primary, textAlign: 'center', lineHeight: 1.4 }),
  text('t_apply', 12, 700, 340, 480, 32, 'Apply this coupon code during sign up', { fontSize: 15, color: C.gray, textAlign: 'center' }),
  text('t_subscribe', 13, 700, 470, 480, 48, 'SUBSCRIBE NOW', { fontSize: 24, fontWeight: '800', color: C.dark, textAlign: 'center' }),
  text('t_visit', 14, 720, 560, 440, 32, 'Visit slidemodel.com', { fontSize: 16, color: C.primary, textAlign: 'center' }),
  text('t_feat_h', 15, 73, 440, 560, 36, 'Download PowerPoint templates and save hours of work.', { fontSize: 18, fontWeight: '600', color: C.dark }),
  text('t_feat_b', 16, 73, 480, 400, 100, 'Easy to use\nFully customizable\nCutting edge designs', { fontSize: 16, color: C.gray, lineHeight: 1.6 }),
  image('img_shot', 6, 100, 100, 480, 280, 'pitch-promo-shot', { style: { borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }, alt: 'Product screenshot' }),
  image('img_banner', 4, 0, 640, W, 80, 'pitch-promo-banner', { style: { objectFit: 'cover' }, alt: 'Footer banner' }),
];

[scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08].forEach((scene) => finalizeScene(scene));

const template = {
  category: 'Pitch',
  template: {
    id: 'company-profile-pitch',
    name: 'Company Profile Pitch Template',
    category: 'Pitch',
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    colorPalette: C,
    description: 'Professional 8-slide company profile pitch deck: cover, introduction, value proposition, services, USP, milestones, contact, and promo.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
