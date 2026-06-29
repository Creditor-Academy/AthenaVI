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
const F = assets.theme?.fonts || {
  display: '"Outfit", "Segoe UI", system-ui, sans-serif',
  serif: '"Source Serif 4", Georgia, "Times New Roman", serif',
  sans: '"Inter", "Segoe UI", system-ui, sans-serif',
  accent: '"Source Serif 4", Georgia, serif'
};

const SAFE = {
  x: Math.round(W * 0.05),
  y: Math.round(H * 0.05),
};
SAFE.w = W - SAFE.x * 2;
SAFE.h = H - SAFE.y * 2;
SAFE.maxX = SAFE.x + SAFE.w;
SAFE.maxY = SAFE.y + SAFE.h;

const AVATAR_SIZE = { width: 180, height: 210 };
const AVATAR_POS = { x: SAFE.maxX - AVATAR_SIZE.width - 12, y: SAFE.maxY - AVATAR_SIZE.height - 12 };

function shouldFitToSafeArea(clip) {
  if (clip.isBackground) return false;
  if (clip.type === 'avatar') return true;
  if (clip.role === 'scrim' || clip.role === 'background') return false;
  if (clip.type === 'image') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    const isFullBleed = (x <= 4 && y <= 4 && w >= W * 0.9 && h >= H * 0.9);
    return !isFullBleed;
  }
  if (clip.type === 'shape') {
    const w = clip.size?.width ?? 0;
    const h = clip.size?.height ?? 0;
    const x = clip.position?.x ?? 0;
    const y = clip.position?.y ?? 0;
    const isFullBleed = (x <= 4 && y <= 4 && w >= W * 0.9 && h >= H * 0.9);
    return !isFullBleed;
  }
  if (clip.type === 'text') return true;
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
  const asset = assets.images.find((item) => item.id === assetId) || assets.icons.find((item) => item.id === assetId);
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
  const pad = Math.round(size * 0.18);
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
    placeholder: true,
    style: {
      borderRadius: '50%',
      border: `2px solid ${C.secondary}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
    }
  };
}

function entrance(type, delay = 0, duration = 0.7) {
  if (!type || type === 'none') return undefined;
  return [{ phase: 'entrance', type, duration, delay }];
}

function withAnim(clip, type, delay = 0, duration = 0.7) {
  const animations = entrance(type, delay, duration);
  if (!animations) return clip;
  return { ...clip, animations };
}

function finalizeScene(scene, bgId = 'bg-white') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  scene.background = { type: 'solid', value: bg?.value || '#ffffff' };
  enforceSafeArea(scene);
  if (!scene.clips.some((clip) => clip.type === 'avatar')) {
    scene.clips.push(avatarClip());
  }

  // Animate layers
  let textIdx = 0;
  let imgIdx = 0;
  scene.clips = scene.clips.map((clip) => {
    if (clip.animations?.length) return clip;
    if (clip.type === 'avatar') return withAnim(clip, 'slideLeft', 0.5, 0.7);
    if (clip.type === 'text') {
      if (clip.role === 'slide-title') return withAnim(clip, 'slideRight', 0.2, 0.8);
      return withAnim(clip, 'fadeIn', 0.3 + textIdx++ * 0.08, 0.6);
    }
    if (clip.type === 'image') {
      return withAnim(clip, 'zoomIn', 0.15 + imgIdx++ * 0.1, 0.8);
    }
    if (clip.type === 'shape') {
      if (clip.role === 'decoration') return withAnim(clip, 'fadeIn', 0.1, 0.9);
    }
    return clip;
  });

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
  // Overlapping angled panels
  shape('s_blue_main', 0, 420, 0, 860, 520, { backgroundColor: C.secondary, clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 72%)' }, 'decoration', 'pitch-blue-panel'),
  shape('s_blue_light', 1, 500, 40, 780, 380, { backgroundColor: C.pale, clipPath: 'polygon(8% 0%, 100% 0%, 100% 85%, 0% 100%)' }, 'decoration', 'pitch-light-panel'),
  shape('s_accent_line', 2, 73, 480, 140, 8, { backgroundColor: C.primary, borderRadius: '4px' }, 'decoration', 'pitch-accent-bar'),
  shape('s_circle_ring', 3, 930, 268, 210, 210, { backgroundColor: 'transparent', border: `8px solid ${C.navy}`, borderRadius: '50%' }, 'decoration', 'pitch-circle-ring'),
  image('img_hero', 4, 448, 0, 832, 463, 'pitch-cover-hero', { style: { borderRadius: '0', objectFit: 'cover' }, alt: 'Modern office corridor' }),
  image('img_circle', 5, 945, 283, 180, 180, 'pitch-cover-circle', { style: { borderRadius: '50%', objectFit: 'cover' }, alt: 'Team meeting' }),
  image('img_logo', 10, 73, 74, 220, 56, 'pitch-logo', { style: { objectFit: 'contain' }, alt: 'Company logo', role: 'logo' }),

  // Centered modern title text block using F.display
  text('t_free', 11, 73, 224, 400, 80, 'FREE', { fontSize: 66, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),
  text('t_company', 12, 73, 302, 450, 80, 'COMPANY', { fontSize: 66, fontWeight: '900', color: C.primary, fontFamily: F.display }, 'slide-title'),
  text('t_profile', 13, 73, 380, 400, 80, 'PROFILE', { fontSize: 66, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),
  text('t_sub', 14, 73, 514, 560, 44, 'PRESENTATION TEMPLATE', { fontSize: 24, fontWeight: '700', color: C.dark, fontFamily: F.sans, letterSpacing: '0.05em' }, 'section-title'),
  text('t_footer', 15, 73, 620, 400, 32, 'Create your presentation in minutes.', { fontSize: 15, fontWeight: '500', color: C.gray, fontFamily: F.sans }),
];

// ─── Slide 2: Introduction ────────────────────────────────────────────────
const scene02 = sceneBase('scene_02', 2, 'Introduction', 'TwoColumn', 'Mission, purpose, and service pillars with hero image.', 'Intro → Value', ['introduction', 'mission'], {
  content: { x: 73, y: 103, width: 500, height: 600 },
  image: { x: 585, y: 198, width: 686, height: 434 },
});
scene02.clips = [
  // Beautiful outline decorations
  shape('s_outline', 1, 580, 100, 640, 540, { backgroundColor: 'transparent', border: `2px solid ${C.primary}`, borderRadius: '24px' }),
  image('img_intro', 6, 600, 120, 600, 500, 'pitch-intro', { style: { borderRadius: '20px', objectFit: 'cover', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }, alt: 'Factory automation' }),

  text('t_title', 10, 73, 100, 500, 60, 'Introduction', { fontSize: 48, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),
  text('t_mission', 11, 73, 180, 500, 36, 'Our Mission and Purpose', { fontSize: 22, fontWeight: '800', color: C.primary, fontFamily: F.display }, 'section-header'),
  text('t_body', 12, 73, 230, 480, 110, 'We help companies streamline workflows, automate visual asset production, and scale communication channels globally using premium AI engines.', { fontSize: 16, color: C.dark, lineHeight: 1.6, fontFamily: F.sans }),

  // Service Pillars in nice cards
  shape('serve_card', 2, 73, 380, 230, 200, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  ...iconBadge('ico_serve', 8, 88, 396, 44, 'idea', C.primary),
  text('t_serve_h', 13, 88, 455, 200, 28, 'Who we Serve', { fontSize: 16, fontWeight: '800', color: C.dark, fontFamily: F.display }),
  text('t_serve_b', 14, 88, 490, 200, 78, 'Enterprises and educational leaders building global courses.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),

  shape('why_card', 2, 320, 380, 230, 200, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  ...iconBadge('ico_why', 8, 335, 396, 44, 'paper-plane', C.primary),
  text('t_why_h', 15, 335, 455, 200, 28, 'Why we Serve', { fontSize: 16, fontWeight: '800', color: C.dark, fontFamily: F.display }),
  text('t_why_b', 16, 335, 490, 200, 78, 'To replace expensive production loops with modern AI pipelines.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),
];

// ─── Slide 3: Value Proposition ───────────────────────────────────────────
const scene03 = sceneBase('scene_03', 3, 'Value Proposition', 'StatsHighlight', 'Pain point, solution, and key benefit stats.', 'Value → Services', ['value', 'stats'], {
  content: { x: 73, y: 103, width: 720, height: 540 },
  image: { x: 834, y: 138, width: 515, height: 515 },
});
scene03.clips = [
  // Right side block background
  shape('s_right', 0, 820, 0, 460, H, { backgroundColor: C.pale }),
  shape('s_diamond_bg', 1, 860, 150, 420, 420, { backgroundColor: C.navy, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', borderRadius: '8px' }),
  image('img_value', 6, 880, 170, 380, 380, 'pitch-value', { style: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', objectFit: 'cover' }, alt: 'Business meeting' }),

  text('t_title', 10, 73, 80, 600, 56, 'Value Proposition', { fontSize: 48, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),

  // Left Section - Pain Point
  ...iconBadge('ico_pain', 8, 73, 170, 48, 'target', C.navy),
  text('t_pain_h', 11, 135, 172, 200, 28, 'The Challenge', { fontSize: 18, fontWeight: '800', color: C.primary, fontFamily: F.display }),
  text('t_pain_b', 12, 73, 230, 680, 50, 'Manual video editing and presenter hiring costs brands $15k per course, slowing down deployment speeds.', { fontSize: 14, color: C.gray, lineHeight: 1.45, fontFamily: F.sans }),

  // Solution Card
  shape('sol_card', 2, 73, 300, 680, 130, { backgroundColor: '#f8fafc', borderRadius: '16px', border: `1px solid ${C.light}` }),
  ...iconBadge('ico_sol', 8, 93, 320, 48, 'solution', C.primary),
  text('t_sol_h', 13, 155, 322, 200, 28, 'Our AI Solution', { fontSize: 18, fontWeight: '800', color: C.primary, fontFamily: F.display }),
  text('t_sol_b', 14, 93, 380, 640, 50, 'Generative avatars compile presentation slides, script narrations, and translate to 120+ languages in minutes.', { fontSize: 14, color: C.gray, lineHeight: 1.45, fontFamily: F.sans }),

  // Benefits Metrics side-by-side
  shape('b1_bg', 2, 73, 460, 320, 190, { backgroundColor: C.white, border: `1px solid ${C.light}`, borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }),
  text('t_b1_l', 15, 93, 480, 200, 22, 'AVERAGE COST SAVED', { fontSize: 12, fontWeight: '800', color: C.secondary, letterSpacing: '0.05em', fontFamily: F.sans }),
  text('t_b1_v', 16, 93, 506, 280, 60, '82%', { fontSize: 52, fontWeight: '900', color: C.navy, fontFamily: F.display }),
  text('t_b1_d', 17, 93, 580, 280, 50, 'Cost reduction compared to film studios.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),

  shape('b2_bg', 2, 420, 460, 320, 190, { backgroundColor: C.white, border: `1px solid ${C.light}`, borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }),
  text('t_b2_l', 18, 440, 480, 200, 22, 'SPEED TO DEPLOY', { fontSize: 12, fontWeight: '800', color: C.secondary, letterSpacing: '0.05em', fontFamily: F.sans }),
  text('t_b2_v', 19, 440, 506, 280, 60, '10x', { fontSize: 52, fontWeight: '900', color: C.navy, fontFamily: F.display }),
  text('t_b2_d', 20, 440, 580, 280, 50, 'Accelerate module launch workflows.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),
];

// ─── Slide 4: Services ────────────────────────────────────────────────────
const scene04 = sceneBase('scene_04', 4, 'Services', 'ServiceGrid', 'Core offering with three service columns.', 'Services → USP', ['services', 'offering'], {
  header: { x: 73, y: 103, width: 844, height: 155 },
  grid: { x: 73, y: 410, width: 1200, height: 300 },
});
scene04.clips = [
  text('t_title', 10, 73, 60, 400, 52, 'Services', { fontSize: 48, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),
  text('t_sub', 11, 73, 118, 400, 36, 'THE CORE OFFERING', { fontSize: 14, fontWeight: '800', color: C.secondary, letterSpacing: '0.08em', fontFamily: F.sans }),
  text('t_body', 12, 73, 155, 500, 80, 'We provide complete production workflows for course modules, customer education campaigns, and corporate onboarding portals.', { fontSize: 15, color: C.gray, lineHeight: 1.5, fontFamily: F.sans }),
  image('img_services', 5, 620, 60, 620, 220, 'pitch-services', { style: { borderRadius: '24px', objectFit: 'cover' }, alt: 'Business team' }),

  // Service Columns Cards (Spaced: 73, 470, 867)
  // Column 1
  shape('svc_card_1', 2, 73, 300, 340, 340, { backgroundColor: C.white, border: `1px solid ${C.light}`, borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.02)' }),
  ...iconBadge('ico_svc1', 8, 93, 320, 48, 'rocket', C.navy),
  text('t_svc1_h', 13, 155, 332, 230, 28, 'Avatar Creation', { fontSize: 18, fontWeight: '850', color: C.dark, fontFamily: F.display }),
  text('t_svc1_b', 14, 93, 390, 300, 70, 'Generate hyper-realistic digital twin presenters based on human actors.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),
  ...iconBadge('chk1a', 7, 93, 480, 24, 'check', C.pale),
  text('t_chk1a', 20, 126, 482, 260, 24, 'Professional script synching', { fontSize: 13, color: C.dark, fontFamily: F.sans }),
  ...iconBadge('chk1b', 7, 93, 515, 24, 'check', C.pale),
  text('t_chk1b', 23, 126, 517, 260, 24, 'Custom gesture modules', { fontSize: 13, color: C.dark, fontFamily: F.sans }),

  // Column 2
  shape('svc_card_2', 2, 470, 300, 340, 340, { backgroundColor: C.white, border: `1px solid ${C.light}`, borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.02)' }),
  ...iconBadge('ico_svc2', 8, 490, 320, 48, 'trophy', C.navy),
  text('t_svc2_h', 16, 552, 332, 230, 28, 'Script Narration', { fontSize: 18, fontWeight: '850', color: C.dark, fontFamily: F.display }),
  text('t_svc2_b', 17, 490, 390, 300, 70, 'Inject high-fidelity speech synthesis matching local accents.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),
  ...iconBadge('chk2a', 7, 490, 480, 24, 'check', C.pale),
  text('t_chk2a', 21, 523, 482, 260, 24, '120+ languages supported', { fontSize: 13, color: C.dark, fontFamily: F.sans }),
  ...iconBadge('chk2b', 7, 490, 515, 24, 'check', C.pale),
  text('t_chk2b', 24, 523, 517, 260, 24, 'Voice cloning integrations', { fontSize: 13, color: C.dark, fontFamily: F.sans }),

  // Column 3
  shape('svc_card_3', 2, 867, 300, 340, 340, { backgroundColor: C.white, border: `1px solid ${C.light}`, borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.02)' }),
  ...iconBadge('ico_svc3', 8, 887, 320, 48, 'chart', C.navy),
  text('t_svc3_h', 19, 949, 332, 230, 28, 'Stitching Engine', { fontSize: 18, fontWeight: '850', color: C.dark, fontFamily: F.display }),
  text('t_svc3_b', 20, 887, 390, 300, 70, 'Stitch assets, slides, music, and subtitles into a single MP4.', { fontSize: 13, color: C.gray, lineHeight: 1.4, fontFamily: F.sans }),
  ...iconBadge('chk3a', 7, 887, 480, 24, 'check', C.pale),
  text('t_chk3a', 22, 920, 482, 260, 24, 'Remotion frame processing', { fontSize: 13, color: C.dark, fontFamily: F.sans }),
  ...iconBadge('chk3b', 7, 887, 515, 24, 'check', C.pale),
  text('t_chk3b', 25, 920, 517, 260, 24, 'Instant cloud caching rendering', { fontSize: 13, color: C.dark, fontFamily: F.sans }),
];

// ─── Slide 5: USP ─────────────────────────────────────────────────────────
const uspRows = [
  { y: 210, icon: 'shield-user', title: 'Enterprise-Grade Security', desc: 'Secure local datasets, asset encryption, and private workspaces.' },
  { y: 330, icon: 'team-dollar', title: 'Modular Resource Pricing', desc: 'Flexible user pricing based on exact render credits used.' },
  { y: 450, icon: 'lifebuoy', title: 'Dedicated Somatic Support', desc: '24/7 client managers to review workflows and optimize audio.' },
];
const scene05 = sceneBase('scene_05', 5, 'Unique Selling Point', 'ListRight', 'Three USP rows with icons and hero image.', 'USP → Milestones', ['usp'], {
  content: { x: 73, y: 103, width: 610, height: 540 },
  image: { x: 692, y: 87, width: 588, height: 634 },
});
scene05.clips = [
  // Angled background lines
  shape('s_tri1', 0, 620, 380, 120, 100, { backgroundColor: C.light, clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }),
  shape('s_tri2', 1, 640, 400, 100, 80, { backgroundColor: C.secondary, clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }),
  image('img_usp', 6, 692, 87, 588, 634, 'pitch-usp', { style: { clipPath: 'polygon(22% 0%, 100% 0%, 100% 100%, 0% 100%)', objectFit: 'cover' }, alt: 'Professionals at work' }),

  text('t_title', 10, 73, 100, 600, 56, 'Unique Selling Point', { fontSize: 48, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),

  // Render rows
  ...uspRows.flatMap((row, i) => {
    const isSpecial = i === 2; // highlight 3rd row nicely
    return [
      shape(`s_row${i}`, 2, 73, row.y - 12, 540, 100, isSpecial ? { backgroundColor: C.navy, borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' } : { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
      ...iconBadge(`ico_usp${i}`, 8, 93, row.y, 44, row.icon, isSpecial ? C.white : C.navy),
      text(`t_usp${i}_h`, 11 + i * 2, 155, row.y + 4, 380, 24, row.title, { fontSize: 16, fontWeight: '850', color: isSpecial ? C.white : C.dark, fontFamily: F.display }),
      text(`t_usp${i}_b`, 12 + i * 2, 155, row.y + 34, 440, 44, row.desc, { fontSize: 13, color: isSpecial ? C.light : C.gray, lineHeight: 1.4, fontFamily: F.sans }),
    ];
  }),
];

// ─── Slide 6: Key Milestones (Horizontal Timeline Stepper) ──────────────────
const scene06 = sceneBase('scene_06', 6, 'Key Milestones', 'Timeline', 'Four milestone columns in bar chart style.', 'Milestones → Contact', ['milestones', 'timeline'], {
  header: { x: 73, y: 103, width: 1134, height: 78 },
  timeline: { x: 73, y: 260, width: 1134, height: 420 },
});
scene06.clips = [
  text('t_title', 10, 73, 80, 600, 56, 'Key Milestones', { fontSize: 48, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),
  text('t_intro', 11, 73, 140, 600, 50, 'A progressive look at our product evolution and target growth milestones.', { fontSize: 16, color: C.gray, fontFamily: F.sans }),

  // Horizontal Stepper Line
  shape('timeline_base_line', 2, 100, 310, W - 200, 3, { backgroundColor: C.light }),
  shape('timeline_done_line', 2, 100, 310, W * 0.5 - 100, 3, { backgroundColor: C.secondary }),

  // Milestone 1 (Done)
  shape('node_1', 3, 160 - 10, 302, 20, 20, { backgroundColor: C.secondary, borderRadius: '50%', border: `4px solid ${C.white}` }),
  text('t_m1_idx', 4, 130, 250, 80, 24, 'Q1 2026', { fontSize: 14, fontWeight: '800', color: C.secondary, textAlign: 'center', fontFamily: F.sans }),
  shape('m1_card', 2, 70, 350, 200, 180, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  image('m1_ico', 4, 150, 365, 40, 40, 'signpost'),
  text('t_m1_lbl', 3, 80, 420, 180, 24, 'Phase 1 Init', { fontSize: 15, fontWeight: '800', color: C.dark, textAlign: 'center', fontFamily: F.display }),
  text('t_m1_desc', 3, 80, 450, 180, 60, 'Core engine rollout and team workspace creation.', { fontSize: 12, color: C.gray, textAlign: 'center', lineHeight: 1.4, fontFamily: F.sans }),

  // Milestone 2 (Done)
  shape('node_2', 3, 440 - 10, 302, 20, 20, { backgroundColor: C.secondary, borderRadius: '50%', border: `4px solid ${C.white}` }),
  text('t_m2_idx', 4, 410, 250, 80, 24, 'Q2 2026', { fontSize: 14, fontWeight: '800', color: C.secondary, textAlign: 'center', fontFamily: F.sans }),
  shape('m2_card', 2, 350, 350, 200, 180, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  image('m2_ico', 4, 430, 365, 40, 40, 'handshake'),
  text('t_m2_lbl', 3, 360, 420, 180, 24, 'Integration', { fontSize: 15, fontWeight: '800', color: C.dark, textAlign: 'center', fontFamily: F.display }),
  text('t_m2_desc', 3, 360, 450, 180, 60, 'HeyGen voice-sycn integration finalized.', { fontSize: 12, color: C.gray, textAlign: 'center', lineHeight: 1.4, fontFamily: F.sans }),

  // Milestone 3 (Active)
  shape('node_3', 3, 720 - 12, 300, 24, 24, { backgroundColor: C.white, borderRadius: '50%', border: `4px solid ${C.primary}` }),
  text('t_m3_idx', 4, 690, 250, 80, 24, 'Q3 2026', { fontSize: 14, fontWeight: '800', color: C.primary, textAlign: 'center', fontFamily: F.sans }),
  shape('m3_card', 2, 630, 350, 200, 180, { backgroundColor: C.white, borderRadius: '12px', border: `2px solid ${C.primary}`, boxShadow: '0 10px 20px rgba(30,64,175,0.05)' }),
  image('m3_ico', 4, 710, 365, 40, 40, 'target'),
  text('t_m3_lbl', 3, 640, 420, 180, 24, 'Global Rollout', { fontSize: 15, fontWeight: '800', color: C.primary, textAlign: 'center', fontFamily: F.display }),
  text('t_m3_desc', 3, 640, 450, 180, 60, 'Stitching pipeline scalability benchmarked.', { fontSize: 12, color: C.gray, textAlign: 'center', lineHeight: 1.4, fontFamily: F.sans }),

  // Milestone 4 (Pending)
  shape('node_4', 3, 1000 - 10, 302, 20, 20, { backgroundColor: C.white, borderRadius: '50%', border: `4px solid ${C.light}` }),
  text('t_m4_idx', 4, 970, 250, 80, 24, 'Q4 2026', { fontSize: 14, color: C.gray, textAlign: 'center', fontFamily: F.sans }),
  shape('m4_card', 2, 910, 350, 200, 180, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  image('m4_ico', 4, 990, 365, 40, 40, 'presentation'),
  text('t_m4_lbl', 3, 920, 420, 180, 24, 'Enterprise Hub', { fontSize: 15, color: C.gray, textAlign: 'center', fontFamily: F.display }),
  text('t_m4_desc', 3, 920, 450, 180, 60, 'Dedicated private cloud server configurations.', { fontSize: 12, color: C.gray, textAlign: 'center', lineHeight: 1.4, fontFamily: F.sans }),
];

// ─── Slide 7: Contact ─────────────────────────────────────────────────────
const scene07 = sceneBase('scene_07', 7, 'Contact', 'ContactSplit', 'Contact details with portrait image.', 'Contact → End', ['contact', 'cta'], {
  details: { x: 73, y: 101, width: 580, height: 550 },
  image: { x: 680, y: 136, width: 492, height: 584 },
});
scene07.clips = [
  shape('s_blue_block', 0, 900, 0, 380, 280, { backgroundColor: C.secondary }),
  text('t_title', 10, 73, 80, 500, 56, 'Let\'s Connect', { fontSize: 48, fontWeight: '900', color: C.dark, fontFamily: F.display }, 'slide-title'),

  // Image with custom border radius
  image('img_contact', 6, 680, 100, 490, 520, 'pitch-contact', { style: { borderRadius: '250px 30px 250px 30px', objectFit: 'cover', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }, alt: 'Support representative' }),

  text('t_loc_h', 11, 73, 170, 200, 28, 'Headquarters', { fontSize: 18, fontWeight: '800', color: C.primary, fontFamily: F.display }),
  text('t_loc_b', 12, 73, 205, 520, 60, '123 Anywhere St., Any City, ST 12345\nReach us directly below for customized plans.', { fontSize: 15, color: C.gray, lineHeight: 1.5, fontFamily: F.sans }),

  // Contact list rows
  shape('row_c1', 2, 73, 300, 520, 80, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  ...iconBadge('ico_phone', 8, 93, 315, 50, 'phone', C.navy),
  text('t_phone', 13, 160, 326, 280, 32, '+1 (212) 123-4567', { fontSize: 16, fontWeight: '700', color: C.dark, fontFamily: F.sans }),

  shape('row_c2', 2, 73, 400, 520, 80, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  ...iconBadge('ico_email', 8, 93, 415, 50, 'email', C.secondary),
  text('t_email', 14, 160, 426, 320, 32, 'support@athenavi.com', { fontSize: 16, fontWeight: '700', color: C.dark, fontFamily: F.sans }),

  shape('row_c3', 2, 73, 500, 520, 80, { backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${C.light}` }),
  ...iconBadge('ico_web', 8, 93, 515, 50, 'website', C.navy),
  text('t_web', 15, 160, 526, 320, 32, 'www.athenavi.com', { fontSize: 16, fontWeight: '700', color: C.dark, fontFamily: F.sans }),
];

// ─── Slide 8: Promotional ─────────────────────────────────────────────────
const scene08 = sceneBase('scene_08', 8, 'Promotional', 'Promo', 'Promotional slide with coupon and CTA.', 'Promo → End', ['promo', 'discount', 'cta'], {
  content: { x: 73, y: 192, width: 900, height: 600 },
  cta: { x: 900, y: 192, width: 300, height: 600 },
});
scene08.clips = [
  // Right card container
  shape('s_cta_bg', 2, 680, 80, 520, 540, { backgroundColor: '#f8fafc', borderRadius: '24px', border: `1px solid ${C.light}`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }),
  image('img_logo', 5, 780, 120, 320, 56, 'pitch-logo', { style: { objectFit: 'contain' }, alt: 'Logo', role: 'logo' }),

  // Coupon box
  shape('coupon_box', 2, 740, 210, 400, 110, { backgroundColor: C.pale, border: `2px dashed ${C.secondary}`, borderRadius: '12px' }),
  text('t_discount', 10, 750, 222, 380, 36, 'Get 15% Discount Now', { fontSize: 16, fontWeight: '800', color: C.navy, textAlign: 'center', fontFamily: F.sans }),
  text('t_coupon', 11, 750, 260, 380, 40, 'FREEBUNDLE15', { fontSize: 26, fontWeight: '900', color: C.primary, textAlign: 'center', fontFamily: F.display, letterSpacing: '0.05em' }),

  text('t_apply', 12, 700, 345, 480, 32, 'Enter code during checkout registration.', { fontSize: 14, color: C.gray, textAlign: 'center', fontFamily: F.sans }),

  // CTA button
  shape('btn_bg', 3, 840, 410, 200, 50, { backgroundColor: C.primary, borderRadius: '8px', cursor: 'pointer' }),
  text('btn_lbl', 4, 840, 424, 200, 30, 'SUBSCRIBE NOW', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.white, textAlign: 'center' }),

  text('t_visit', 14, 720, 530, 440, 32, 'Visit www.athenavi.com', { fontSize: 15, fontWeight: '700', color: C.secondary, textAlign: 'center', fontFamily: F.sans }),

  // Left Content Column
  text('t_feat_h', 15, 73, 440, 540, 36, 'Deploy interactive, scalable video courses.', { fontSize: 22, fontWeight: '800', color: C.dark, fontFamily: F.display }),
  text('t_feat_b', 16, 73, 490, 540, 100, '✔ Dynamic actor avatars matching scripts\n✔ 120+ localized languages and accent clones\n✔ Complete video rendering templates library', { fontSize: 16, color: C.gray, lineHeight: 1.8, fontFamily: F.sans }),
  image('img_shot', 6, 73, 100, 540, 300, 'pitch-promo-shot', { style: { borderRadius: '16px', objectFit: 'cover', border: `1px solid ${C.light}` }, alt: 'Product screenshot' }),
  image('img_banner', 4, 0, 640, W, 80, 'pitch-promo-banner', { style: { objectFit: 'cover' }, alt: 'Footer banner' }),
];

[scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08].forEach((scene) => finalizeScene(scene));

const template = {
  category: 'Company',
  template: {
    id: 'company-profile-pitch',
    name: 'Company Profile Pitch Template',
    category: 'Company',
    totalSlides: 8,
    canvasSize: { width: W, height: H },
    colorPalette: C,
    description: 'Professional 8-slide company profile pitch deck: cover, introduction, value proposition, services, USP, milestones, contact, and promo.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
