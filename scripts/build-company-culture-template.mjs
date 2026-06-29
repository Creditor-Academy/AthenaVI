import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/company_culture_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/company-culture-assets.json');
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
      border: `2px solid ${C.white}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
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
  scene.background = { type: bgId.includes('gradient') ? 'gradient' : 'solid', value: bg?.value || '#ffffff' };
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
    tags: ['company-culture', ...tags],
    clips: [],
  };
}

// ─── 01 · Cover — Company Culture & Onboarding ──────────────────────────────
const scene01 = sceneBase('culture_01', 1, 'Company Culture', 'Cover', 'Elegant dark cover with forest green gradients, metadata labels, and asymmetrical curved team photo.', 'Cover → Values', ['cover', 'culture'], {
  hero: { x: 680, y: 100, width: 500, height: 500 },
  title: { x: 64, y: 160, width: 600, height: 260 }
});
scene01.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed rgba(255,255,255,0.2)' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'ONBOARDING GUIDE', { fontFamily: F.sans, fontSize: 16, color: C.secondary }),
  text('hdr_right', 2, SAFE.maxX - 100, SAFE.y, 100, 24, '2026', { fontFamily: F.sans, fontSize: 16, color: C.secondary, textAlign: 'right' }),

  // Main text content
  text('t_title', 3, SAFE.x, 160, 600, 260, 'Company Culture\n& Onboarding', { fontFamily: F.sans, fontWeight: '800', fontSize: 60, color: C.white, lineHeight: 1.15 }, 'slide-title'),
  text('t_sub', 3, SAFE.x, 450, 460, 150, 'Welcome to your journey. Learn about our mission, values, team, and benefits as we build the future together.', { fontFamily: F.sans, fontSize: 20, color: C.secondary, lineHeight: 1.6 }),

  // Accent circular badge on the image edge
  shape('badge_circle', 3, 620, 450, 120, 120, { backgroundColor: C.accent, borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }),
  image('badge_icon', 4, 650, 480, 60, 60, 'values', { style: { objectFit: 'contain' } }),

  // Right custom hero image (with asymmetric curve)
  image('img_hero', 4, 680, 100, 500, 500, 'culture-cover', {
    style: {
      borderRadius: '250px 30px 30px 250px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    }
  })
];

// ─── 02 · Mission & Values ──────────────────────────────────────────────────
const scene02 = sceneBase('culture_02', 2, 'Mission & Values', 'Values', 'Mint-tinted slide showcasing three card columns of core business behaviors.', 'Values → Structure', ['values', 'purpose'], {
  title: { x: 64, y: 90, width: 600, height: 80 },
  cards: { x: 64, y: 300, width: 1152, height: 320 }
});
scene02.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: `1px dashed ${C.line}` }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'OUR PURPOSE', { fontFamily: F.sans, fontSize: 16, color: C.gray }),

  // Title & description
  text('t_title', 2, SAFE.x, 90, 600, 80, 'MISSION & VALUES', { fontFamily: F.serif, fontWeight: '700', fontSize: 48, color: C.dark }, 'slide-title'),
  text('t_desc', 2, SAFE.x, 180, 1100, 80, 'We are committed to fostering an inclusive, collaborative, and forward-thinking environment where every individual has the power to grow and innovate.', { fontFamily: F.sans, fontSize: 22, color: C.gray, lineHeight: 1.6 }),

  // Value Card 1 (Integrity)
  shape('card_1', 3, SAFE.x, 300, 350, 320, { backgroundColor: C.white, borderRadius: '20px', border: `1px solid ${C.line}`, boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }),
  image('icon_1', 4, SAFE.x + 30, 330, 60, 60, 'values', { style: { objectFit: 'contain' } }),
  text('c_title_1', 4, SAFE.x + 30, 410, 290, 40, 'Integrity First', { fontFamily: F.sans, fontWeight: '700', fontSize: 24, color: C.dark }),
  text('c_body_1', 4, SAFE.x + 30, 460, 290, 140, 'We do the right thing, always. Transparency and honesty are the foundation of our work.', { fontFamily: F.sans, fontSize: 18, color: C.gray, lineHeight: 1.5 }),

  // Value Card 2 (Innovation)
  shape('card_2', 3, SAFE.x + 400, 300, 350, 320, { backgroundColor: C.white, borderRadius: '20px', border: `1px solid ${C.line}`, boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }),
  image('icon_2', 4, SAFE.x + 430, 330, 60, 60, 'growth', { style: { objectFit: 'contain' } }),
  text('c_title_2', 4, SAFE.x + 430, 410, 290, 40, 'Bold Innovation', { fontFamily: F.sans, fontWeight: '700', fontSize: 24, color: C.dark }),
  text('c_body_2', 4, SAFE.x + 430, 460, 290, 140, 'We challenge status quo, embrace change, and push the boundaries of what is possible.', { fontFamily: F.sans, fontSize: 18, color: C.gray, lineHeight: 1.5 }),

  // Value Card 3 (Collaboration)
  shape('card_3', 3, SAFE.x + 800, 300, 350, 320, { backgroundColor: C.white, borderRadius: '20px', border: `1px solid ${C.line}`, boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }),
  image('icon_3', 4, SAFE.x + 830, 330, 60, 60, 'team', { style: { objectFit: 'contain' } }),
  text('c_title_3', 4, SAFE.x + 830, 410, 290, 40, 'Stronger Together', { fontFamily: F.sans, fontWeight: '700', fontSize: 24, color: C.dark }),
  text('c_body_3', 4, SAFE.x + 830, 460, 290, 140, 'We support each other, value diverse perspectives, and win as a single united team.', { fontFamily: F.sans, fontSize: 18, color: C.gray, lineHeight: 1.5 })
];

// ─── 03 · Our Team & Structure ──────────────────────────────────────────────
const scene03 = sceneBase('culture_03', 3, 'Our Team', 'Team', 'Clean split grid layout presenting department columns with rounded profile images.', 'Structure → Onboarding', ['team', 'structure'], {
  title: { x: 64, y: 100, width: 400, height: 140 },
  teams: { x: 500, y: 100, width: 692, height: 520 }
});
scene03.clips = [
  // Left side title & intro
  text('t_title', 2, SAFE.x, 100, 400, 140, 'MEET THE\nTEAM', { fontFamily: F.sans, fontWeight: '800', fontSize: 52, color: C.dark, lineHeight: 1.15 }, 'slide-title'),
  text('t_subtext', 2, SAFE.x, 260, 380, 100, 'We believe in empowerment, clear alignment, and cross-functional support across all teams.', { fontFamily: F.sans, fontSize: 20, color: C.gray, lineHeight: 1.6 }),
  shape('divider', 1, SAFE.x, 380, 380, 1, { backgroundColor: C.line }),

  // Column 1 (Engineering)
  image('team_img_1', 3, 500, 100, 210, 320, 'culture-team', {
    style: {
      borderRadius: '100px 20px 20px 20px',
      objectFit: 'cover',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    }
  }),
  text('col_title_1', 3, 500, 440, 210, 30, 'Engineering & Tech', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark }),
  text('col_body_1', 3, 500, 480, 210, 140, 'Building robust platforms, scalable tools, and clean architectures.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.5 }),

  // Column 2 (Product)
  image('team_img_2', 3, 740, 100, 210, 320, 'culture-mission', {
    style: {
      borderRadius: '100px 20px 20px 20px',
      objectFit: 'cover',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    }
  }),
  text('col_title_2', 3, 740, 440, 210, 30, 'Product & Design', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark }),
  text('col_body_2', 3, 740, 480, 210, 140, 'Crafting seamless user flows, beautiful interfaces, and blueprints.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.5 }),

  // Column 3 (Marketing)
  image('team_img_3', 3, 980, 100, 210, 320, 'culture-timeline', {
    style: {
      borderRadius: '100px 20px 20px 20px',
      objectFit: 'cover',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
    }
  }),
  text('col_title_3', 3, 980, 440, 210, 30, 'Marketing & Growth', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark }),
  text('col_body_3', 3, 980, 480, 210, 140, 'Driving brand engagement, growth strategies, and supporting customers.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.5 })
];

// ─── 04 · Onboarding Timeline ───────────────────────────────────────────────
const scene04 = sceneBase('culture_04', 4, 'Onboarding Timeline', 'Timeline', 'Step-by-step horizontal milestone graph detail for the first quarter.', 'Onboarding → Perks', ['timeline', 'process'], {
  title: { x: 64, y: 90, width: 600, height: 60 },
  milestones: { x: 64, y: 230, width: 1152, height: 350 }
});
scene04.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: `1px dashed ${C.line}` }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'YOUR FIRST 90 DAYS', { fontFamily: F.sans, fontSize: 16, color: C.gray }),

  // Title
  text('t_title', 2, SAFE.x, 90, 600, 60, 'ONBOARDING TIMELINE', { fontFamily: F.serif, fontWeight: '700', fontSize: 44, color: C.dark }, 'slide-title'),

  // Horizontal line connecting timeline nodes
  shape('timeline_line', 1, SAFE.x + 30, 300, SAFE.w - 60, 4, { backgroundColor: C.primary }),

  // Milestone 1 (Day 1)
  shape('node_1', 2, SAFE.x + 100, 294, 16, 16, { backgroundColor: C.accent, borderRadius: '50%', border: `4px solid ${C.white}` }),
  text('m_title_1', 3, SAFE.x + 40, 230, 136, 30, 'Day 1', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark, textAlign: 'center' }),
  text('m_lbl_1', 3, SAFE.x + 10, 340, 196, 20, 'IT Setup & Welcome', { fontFamily: F.sans, fontWeight: '600', fontSize: 16, color: C.dark, textAlign: 'center' }),
  text('m_body_1', 3, SAFE.x + 10, 370, 196, 150, 'Configure your setup, connect accounts, and meet your manager.', { fontFamily: F.sans, fontSize: 14, color: C.gray, textAlign: 'center', lineHeight: 1.4 }),

  // Milestone 2 (Week 1)
  shape('node_2', 2, SAFE.x + 380, 294, 16, 16, { backgroundColor: C.accent, borderRadius: '50%', border: `4px solid ${C.white}` }),
  text('m_title_2', 3, SAFE.x + 320, 230, 136, 30, 'Week 1', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark, textAlign: 'center' }),
  text('m_lbl_2', 3, SAFE.x + 290, 340, 196, 20, 'Team Alignment', { fontFamily: F.sans, fontWeight: '600', fontSize: 16, color: C.dark, textAlign: 'center' }),
  text('m_body_2', 3, SAFE.x + 290, 370, 196, 150, 'Attend deep-dive roadmap reviews and align on immediate tasks.', { fontFamily: F.sans, fontSize: 14, color: C.gray, textAlign: 'center', lineHeight: 1.4 }),

  // Milestone 3 (Month 1)
  shape('node_3', 2, SAFE.x + 660, 294, 16, 16, { backgroundColor: C.accent, borderRadius: '50%', border: `4px solid ${C.white}` }),
  text('m_title_3', 3, SAFE.x + 600, 230, 136, 30, 'Month 1', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark, textAlign: 'center' }),
  text('m_lbl_3', 3, SAFE.x + 570, 340, 196, 20, 'First Milestone', { fontFamily: F.sans, fontWeight: '600', fontSize: 16, color: C.dark, textAlign: 'center' }),
  text('m_body_3', 3, SAFE.x + 570, 370, 196, 150, 'Take ownership of your first shipment, campaign, or code release.', { fontFamily: F.sans, fontSize: 14, color: C.gray, textAlign: 'center', lineHeight: 1.4 }),

  // Milestone 4 (Month 3)
  shape('node_4', 2, SAFE.x + 940, 294, 16, 16, { backgroundColor: C.accent, borderRadius: '50%', border: `4px solid ${C.white}` }),
  text('m_title_4', 3, SAFE.x + 880, 230, 136, 30, 'Month 3', { fontFamily: F.sans, fontWeight: '700', fontSize: 20, color: C.dark, textAlign: 'center' }),
  text('m_lbl_4', 3, SAFE.x + 850, 340, 196, 20, 'Full Autonomy', { fontFamily: F.sans, fontWeight: '600', fontSize: 16, color: C.dark, textAlign: 'center' }),
  text('m_body_4', 3, SAFE.x + 850, 370, 196, 150, 'Own core metrics, direct strategies, and guide incoming teammates.', { fontFamily: F.sans, fontSize: 14, color: C.gray, textAlign: 'center', lineHeight: 1.4 })
];

// ─── 05 · Benefits & Perks ──────────────────────────────────────────────────
const scene05 = sceneBase('culture_05', 5, 'Benefits & Perks', 'Perks', 'Split layout detailing flexible work dark panel on the left and mint detail boxes on the right.', 'Perks → Summary', ['perks', 'benefits'], {
  title: { x: 64, y: 100, width: 400, height: 150 },
  card_left: { x: 64, y: 350, width: 380, height: 290 },
  cards_right: { x: 500, y: 150, width: 650, height: 490 }
});
scene05.clips = [
  // Left side intro
  text('t_title', 2, SAFE.x, 100, 400, 150, 'BENEFITS\n& PERKS', { fontFamily: F.sans, fontWeight: '800', fontSize: 52, color: C.dark, lineHeight: 1.15 }, 'slide-title'),
  text('t_subtitle', 2, SAFE.x, 250, 380, 80, 'We take care of our people so we can grow together sustainably.', { fontFamily: F.sans, fontSize: 20, color: C.gray, lineHeight: 1.6 }),

  // Left Dark Hero Card (Flexible Work)
  shape('card_left', 2, SAFE.x, 350, 380, 290, { backgroundColor: C.dark, borderRadius: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }),
  image('left_img', 3, SAFE.x + 20, 370, 140, 250, 'culture-perks', {
    style: {
      borderRadius: '16px',
      objectFit: 'cover'
    }
  }),
  text('left_title', 3, SAFE.x + 180, 390, 180, 30, 'Flexible Work', { fontFamily: F.sans, fontWeight: '700', fontSize: 22, color: C.white }),
  text('left_body', 3, SAFE.x + 180, 430, 180, 190, 'Work from anywhere, anytime. We prioritize trust, outcomes, and clear communication over hours.', { fontFamily: F.sans, fontSize: 16, color: '#cccccc', lineHeight: 1.5 }),

  // Right Wellness Card (Top)
  shape('card_right_1', 2, 500, 150, 650, 210, { backgroundColor: C.light, borderRadius: '20px' }),
  image('right_icon_1', 3, 530, 180, 60, 60, 'wellness', { style: { objectFit: 'contain' } }),
  text('right_title_1', 3, 610, 170, 500, 30, 'Wellness & Health', { fontFamily: F.sans, fontWeight: '700', fontSize: 22, color: C.dark }),
  text('right_body_1', 3, 610, 210, 500, 110, 'Comprehensive premium medical plan, annual wellness stipends, and subsidized gym memberships.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.5 }),

  // Right Learning Card (Bottom)
  shape('card_right_2', 2, 500, 400, 650, 210, { backgroundColor: C.light, borderRadius: '20px' }),
  image('right_icon_2', 3, 530, 430, 60, 60, 'learning', { style: { objectFit: 'contain' } }),
  text('right_title_2', 3, 610, 420, 500, 30, 'Continuous Growth', { fontFamily: F.sans, fontWeight: '700', fontSize: 22, color: C.dark }),
  text('right_body_2', 3, 610, 460, 500, 110, 'Dedicated annual education budget, access to online learning platforms, and sponsored conference travel.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.5 })
];

// Finalize scenes
[scene01, scene02, scene03, scene04, scene05].forEach((scene, i) => {
  const bgId = (i === 0) ? 'bg-gradient-forest' : (i === 1) ? 'bg-gradient-light' : (i === 3) ? 'bg-tint' : 'bg-white';
  finalizeScene(scene, bgId);
});

const template = {
  category: 'Company',
  template: {
    id: 'company-culture',
    name: 'Company Culture & Onboarding',
    category: 'Company',
    theme: assets.theme,
    totalSlides: 5,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: 'A premium 5-slide orientation deck in a Mint & Forest theme, complete with department cards, milestone timelines, and split benefit tiles.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
