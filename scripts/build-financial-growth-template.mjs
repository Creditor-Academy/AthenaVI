import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/financial_growth_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/financial-growth-assets.json');
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
      border: `2px solid ${C.primary}`,
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

function finalizeScene(scene, bgId = 'bg-cream') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  scene.background = { type: bgId.includes('gradient') ? 'gradient' : 'solid', value: bg?.value || '#FAF9F6' };
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

function sceneBase(id, slideIndex, title, layoutType, description, flow, tags, zones) {
  return {
    id,
    slideIndex,
    title,
    layoutType,
    canvasSize: { width: W, height: H },
    avatarPosition: 'bottom-right',
    zones: {
      ...zones,
      avatar: zones.avatar || { x: AVATAR_POS.x, y: AVATAR_POS.y, width: AVATAR_SIZE.width, height: AVATAR_SIZE.height },
    },
    description,
    flow,
    duration: DURATION,
    tags: ['financial-growth', ...tags],
    clips: [],
  };
}

// ─── 01 · Cover Page ──────────────────────────────────────────────────────────
const scene01 = sceneBase('financial_01', 1, 'Online Course Cover', 'Cover', 'Presentation cover with wavy blobs, circular overlays, and central title.', 'Cover → Key Insights', ['cover'], {
  title: { x: 100, y: 240, width: 1080, height: 120 }
});
scene01.clips = [
  // Top-left overlapping circles
  shape('c_tl_1', 1, -40, -40, 180, 180, { backgroundColor: C.primary, borderRadius: '50%', opacity: 0.8 }),
  shape('c_tl_2', 1, 40, -40, 180, 180, { backgroundColor: '#D12E2E', borderRadius: '50%', opacity: 0.8 }),

  // Bottom-right overlapping circles
  shape('c_br_1', 1, W - 140, H - 140, 180, 180, { backgroundColor: C.primary, borderRadius: '50%', opacity: 0.8 }),
  shape('c_br_2', 1, W - 220, H - 140, 180, 180, { backgroundColor: '#D12E2E', borderRadius: '50%', opacity: 0.8 }),

  // Wavy blobs at top-right & bottom-left
  shape('blob_tr', 1, W - 180, -40, 220, 220, { backgroundColor: C.primary, borderRadius: '0 0 0 100%' }),
  shape('blob_bl', 1, -40, H - 180, 220, 220, { backgroundColor: C.primary, borderRadius: '0 100% 0 0' }),

  // Presentation Badge
  shape('badge_bg', 2, 380, 150, 520, 60, { backgroundColor: C.primary, borderRadius: '30px' }),
  text('badge_txt', 3, 380, 166, 520, 32, 'Presentation', { fontFamily: F.sans, fontWeight: '800', fontSize: 24, color: C.dark, textAlign: 'center' }),

  // Title
  text('t_title', 3, 100, 240, 1080, 120, 'ONLINE COURSE', { fontFamily: F.display, fontWeight: '900', fontSize: 82, color: C.dark, textAlign: 'center' }, 'slide-title'),

  // Horizontal divider with dot endings
  shape('div_line', 2, W / 2 - 250, 380, 500, 3, { backgroundColor: C.primary }),
  shape('div_dot_l', 3, W / 2 - 254, 377, 8, 8, { backgroundColor: C.primary, borderRadius: '50%' }),
  shape('div_dot_r', 3, W / 2 + 246, 377, 8, 8, { backgroundColor: C.primary, borderRadius: '50%' }),

  // Subtitle
  text('t_presenter', 2, 100, 410, 1080, 40, 'Presented by : Olivia Wilson', { fontFamily: F.sans, fontWeight: '700', fontSize: 24, color: C.dark, textAlign: 'center' }),
];

// ─── 02 · Key Insights ────────────────────────────────────────────────────────
const scene02 = sceneBase('financial_02', 2, 'Key Insights', 'Insights', 'Hexagon vertical stack detailing findings, simplifying data, and opportunity mapping.', 'Key Insights → Opportunity Mapping', ['insights'], {
  title: { x: 64, y: 220, width: 320, height: 60 }
});
scene02.clips = [
  // Left Column
  text('t_title', 2, SAFE.x, 220, 320, 60, 'Key Insights', { fontFamily: F.display, fontWeight: '800', fontSize: 44, color: C.dark }, 'slide-title'),
  text('t_desc', 3, SAFE.x, 300, 320, 200, 'A structured analysis of market statistics, credit mechanisms, and growth fields configured for direct action.', { fontFamily: F.sans, fontSize: 16, color: C.grey, lineHeight: 1.6 }),

  // Hexagon 1 (Top, Blue)
  shape('hex_bg_1', 2, 480, 100, 180, 160, { backgroundColor: C.secondary, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  shape('hex_c_1', 3, 558, 120, 24, 24, { backgroundColor: C.white, borderRadius: '50%' }),
  text('hex_num_1', 4, 558, 124, 24, 20, '01', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.secondary, textAlign: 'center' }),
  image('hex_ico_1', 4, 535, 155, 70, 70, 'card'),

  // Hexagon 2 (Middle, Yellow)
  shape('hex_bg_2', 2, 560, 240, 180, 160, { backgroundColor: C.primary, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  shape('hex_c_2', 3, 638, 260, 24, 24, { backgroundColor: C.white, borderRadius: '50%' }),
  text('hex_num_2', 4, 638, 264, 24, 20, '02', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.primary, textAlign: 'center' }),
  image('hex_ico_2', 4, 615, 295, 70, 70, 'folder'),

  // Hexagon 3 (Bottom, Orange)
  shape('hex_bg_3', 2, 480, 380, 180, 160, { backgroundColor: C.accent, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  shape('hex_c_3', 3, 558, 400, 24, 24, { backgroundColor: C.white, borderRadius: '50%' }),
  text('hex_num_3', 4, 558, 404, 24, 20, '03', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.accent, textAlign: 'center' }),
  image('hex_ico_3', 4, 535, 455, 70, 70, 'globe'),

  // Right column insights
  // Row 1
  shape('row_line_1', 2, 780, 140, 4, 40, { backgroundColor: C.secondary }),
  text('row_lbl_1', 3, 800, 132, 380, 24, 'Important Findings', { fontFamily: F.sans, fontWeight: '800', fontSize: 18, color: C.dark }),
  text('row_desc_1', 3, 800, 160, 380, 50, 'Analyzing transaction pipelines and securing payment routes.', { fontFamily: F.sans, fontSize: 14, color: C.grey }),

  // Row 2
  shape('row_line_2', 2, 780, 280, 4, 40, { backgroundColor: C.primary }),
  text('row_lbl_2', 3, 800, 272, 380, 24, 'Simplifying Information', { fontFamily: F.sans, fontWeight: '800', fontSize: 18, color: C.dark }),
  text('row_desc_2', 3, 800, 300, 380, 50, 'Grouping complex folders into secure, visual dashboards.', { fontFamily: F.sans, fontSize: 14, color: C.grey }),

  // Row 3
  shape('row_line_3', 2, 780, 420, 4, 40, { backgroundColor: C.accent }),
  text('row_lbl_3', 3, 800, 412, 380, 24, 'Identifying Opportunities', { fontFamily: F.sans, fontWeight: '800', fontSize: 18, color: C.dark }),
  text('row_desc_3', 3, 800, 440, 380, 50, 'Unlocking global markets and expanding target audience profiles.', { fontFamily: F.sans, fontSize: 14, color: C.grey }),
];

// ─── 03 · Opportunity Mapping ───────────────────────────────────────────────
const scene03 = sceneBase('financial_03', 3, 'Opportunity Mapping', 'Map', 'Circular workspace center surrounded by 4 rounded business nodes.', 'Opportunity Mapping → Work Plan', ['map'], {
  title: { x: 100, y: 60, width: 1080, height: 60 }
});
scene03.clips = [
  // Corner doodles
  shape('doodle_tl', 1, 30, 30, 60, 60, { borderLeft: '3px solid #111827', borderTop: '3px solid #111827', borderRadius: '50% 0 0 0' }),
  shape('doodle_br', 1, W - 90, H - 90, 60, 60, { borderRight: '3px solid #111827', borderBottom: '3px solid #111827', borderRadius: '0 0 50% 0' }),
  shape('doodle_bl', 1, 30, H - 90, 40, 40, { borderLeft: '3px solid #111827', borderBottom: '3px solid #111827', borderRadius: '0 0 0 50%' }),

  // Title
  text('t_title', 2, 100, 60, 1080, 60, 'Opportunity Mapping', { fontFamily: F.display, fontWeight: '900', fontSize: 48, color: C.dark, textAlign: 'center' }, 'slide-title'),

  // Central circle avatar
  shape('avatar_outer', 2, W / 2 - 130, H / 2 - 120, 260, 260, { backgroundColor: C.white, border: `1px solid ${C.line}`, borderRadius: '50%', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }),
  image('avatar_inner', 3, W / 2 - 100, H / 2 - 90, 200, 200, 'person-laptop', { style: { borderRadius: '50%', objectFit: 'cover' } }),

  // Quadrant 1 (Top-Left, Orange)
  shape('quad_1', 2, W / 2 - 340, H / 2 - 110, 240, 100, { backgroundColor: C.primary, borderRadius: '50px 0 0 50px' }),
  shape('quad_b_1', 3, W / 2 - 310, H / 2 - 80, 40, 40, { backgroundColor: C.white, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  text('quad_num_1', 4, W / 2 - 310, H / 2 - 70, 40, 20, '01', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.primary, textAlign: 'center' }),
  image('quad_ico_1', 4, W / 2 - 240, H / 2 - 90, 60, 60, 'network'),
  // Label outside
  text('quad_lbl_1', 3, W / 2 - 500, H / 2 - 130, 160, 24, 'Market Expansion', { fontFamily: F.sans, fontWeight: '800', fontSize: 16, color: C.dark, textAlign: 'right' }),
  text('quad_desc_1', 3, W / 2 - 500, H / 2 - 102, 160, 70, 'Entering new segments or geographical areas.', { fontFamily: F.sans, fontSize: 12, color: C.grey, textAlign: 'right' }),

  // Quadrant 2 (Bottom-Left, Green)
  shape('quad_2', 2, W / 2 - 340, H / 2 + 20, 240, 100, { backgroundColor: C.green, borderRadius: '50px 0 0 50px' }),
  shape('quad_b_2', 3, W / 2 - 310, H / 2 + 50, 40, 40, { backgroundColor: C.white, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  text('quad_num_2', 4, W / 2 - 310, H / 2 + 60, 40, 20, '02', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.green, textAlign: 'center' }),
  image('quad_ico_2', 4, W / 2 - 240, H / 2 + 40, 60, 60, 'rocket'),
  // Label outside
  text('quad_lbl_2', 3, W / 2 - 500, H / 2 + 40, 160, 24, 'Product Innovation', { fontFamily: F.sans, fontWeight: '800', fontSize: 16, color: C.dark, textAlign: 'right' }),
  text('quad_desc_2', 3, W / 2 - 500, H / 2 + 68, 160, 70, 'Developing new features or improving existing offerings.', { fontFamily: F.sans, fontSize: 12, color: C.grey, textAlign: 'right' }),

  // Quadrant 3 (Bottom-Right, Yellow)
  shape('quad_3', 2, W / 2 + 100, H / 2 + 20, 240, 100, { backgroundColor: C.primary, borderRadius: '0 50px 50px 0' }),
  shape('quad_b_3', 3, W / 2 + 270, H / 2 + 50, 40, 40, { backgroundColor: C.white, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  text('quad_num_3', 4, W / 2 + 270, H / 2 + 60, 40, 20, '03', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.primary, textAlign: 'center' }),
  image('quad_ico_3', 4, W / 2 + 180, H / 2 + 40, 60, 60, 'monitor'),
  // Label outside
  text('quad_lbl_3', 3, W / 2 + 340, H / 2 + 40, 160, 24, 'Digitalization', { fontFamily: F.sans, fontWeight: '800', fontSize: 16, color: C.dark }),
  text('quad_desc_3', 3, W / 2 + 340, H / 2 + 68, 160, 70, 'Collaborations that strengthen capabilities or reach.', { fontFamily: F.sans, fontSize: 12, color: C.grey }),

  // Quadrant 4 (Top-Right, Pink)
  shape('quad_4', 2, W / 2 + 100, H / 2 - 110, 240, 100, { backgroundColor: C.pink, borderRadius: '0 50px 50px 0' }),
  shape('quad_b_4', 3, W / 2 + 270, H / 2 - 80, 40, 40, { backgroundColor: C.white, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }),
  text('quad_num_4', 4, W / 2 + 270, H / 2 - 70, 40, 20, '04', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.pink, textAlign: 'center' }),
  image('quad_ico_4', 4, W / 2 + 180, H / 2 - 90, 60, 60, 'handshake'),
  // Label outside
  text('quad_lbl_4', 3, W / 2 + 340, H / 2 - 130, 160, 24, 'Partnership', { fontFamily: F.sans, fontWeight: '800', fontSize: 16, color: C.dark }),
  text('quad_desc_4', 3, W / 2 + 340, H / 2 - 102, 160, 70, 'Adopting technology to improve efficiency.', { fontFamily: F.sans, fontSize: 12, color: C.grey }),
];

// ─── 04 · Work Plan ──────────────────────────────────────────────────────────
const scene04 = sceneBase('financial_04', 4, 'Work Plan', 'Timeline', 'Split layout detailing left handwritten work plan and right vertical checklist.', 'Work Plan → End', ['timeline', 'plan'], {
  title: { x: 80, y: 180, width: 400, height: 60 }
});
scene04.clips = [
  // Swirl backdrops on left
  shape('swirl_1', 1, -40, -40, 120, 120, { border: '2px solid rgba(139,90,43,0.15)', borderRadius: '50%' }),
  shape('swirl_2', 1, 20, 150, 180, 180, { border: '2px solid rgba(139,90,43,0.1)', borderRadius: '50% 40% 60% 50%' }),
  shape('swirl_3', 1, W * 0.25, H - 80, 200, 200, { border: '2px solid rgba(139,90,43,0.1)', borderRadius: '40% 60% 50% 50%' }),

  // Left Column Content
  text('t_title', 2, 80, 180, 400, 60, 'WORK PLAN', { fontFamily: F.serif, fontWeight: '800', fontSize: 52, color: '#5C3E21' }, 'slide-title'),
  text('t_desc', 3, 80, 260, 500, 380, 'A progressive roadmap detailing execution milestones. We align structural opportunities with market networks, optimizing resources step-by-step for sustainable scalability.', { fontFamily: F.sans, fontSize: 17, color: '#5C3E21', lineHeight: 1.6 }),

  // Right yellow column backdrop
  shape('right_panel', 1, W * 0.55, 0, W * 0.45, H, { backgroundColor: C.primary }),

  // Vertical timeline line
  shape('timeline_line', 2, W * 0.65, 60, 2, H - 120, { backgroundColor: '#5C3E21' }),

  // Step 1
  shape('step_dot_1', 3, W * 0.65 - 6, 140, 14, 14, { backgroundColor: '#5C3E21', borderRadius: '50%' }),
  text('step_lbl_1', 3, W * 0.68, 125, 60, 40, '01', { fontFamily: F.sans, fontWeight: '800', fontSize: 32, color: '#5C3E21' }),
  text('step_desc_1', 3, W * 0.68, 175, 320, 80, 'Analyzing transaction pipelines and securing payment routes.', { fontFamily: F.sans, fontSize: 14, color: '#5C3E21', lineHeight: 1.4 }),

  // Step 2
  shape('step_dot_2', 3, W * 0.65 - 6, 290, 14, 14, { backgroundColor: '#5C3E21', borderRadius: '50%' }),
  text('step_lbl_2', 3, W * 0.68, 275, 60, 40, '02', { fontFamily: F.sans, fontWeight: '800', fontSize: 32, color: '#5C3E21' }),
  text('step_desc_2', 3, W * 0.68, 325, 320, 80, 'Grouping complex folders into secure, visual dashboards.', { fontFamily: F.sans, fontSize: 14, color: '#5C3E21', lineHeight: 1.4 }),

  // Step 3
  shape('step_dot_3', 3, W * 0.65 - 6, 440, 14, 14, { backgroundColor: '#5C3E21', borderRadius: '50%' }),
  text('step_lbl_3', 3, W * 0.68, 425, 60, 40, '03', { fontFamily: F.sans, fontWeight: '800', fontSize: 32, color: '#5C3E21' }),
  text('step_desc_3', 3, W * 0.68, 475, 320, 80, 'Unlocking global markets and expanding target audience profiles.', { fontFamily: F.sans, fontSize: 14, color: '#5C3E21', lineHeight: 1.4 }),
];

// Finalize scenes
[scene01, scene02, scene03, scene04].forEach((scene) => {
  finalizeScene(scene, 'bg-cream');
});

const template = {
  category: 'Courses',
  template: {
    id: 'financial-growth',
    name: 'Financial Growth',
    category: 'Courses',
    theme: assets.theme,
    totalSlides: 4,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: 'A 4-slide business roadmap template detailing opportunity mapping, key insights, and progression workflows.',
  },
  scenes: [scene01, scene02, scene03, scene04],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
