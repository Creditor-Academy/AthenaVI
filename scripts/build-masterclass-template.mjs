import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/masterclass_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/masterclass-assets.json');
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
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
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

function finalizeScene(scene, bgId = 'bg-dark') {
  const bg = assets.backgrounds.find((item) => item.id === bgId);
  scene.background = { type: bgId.includes('gradient') ? 'gradient' : 'solid', value: bg?.value || '#121214' };
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
    tags: ['masterclass', ...tags],
    clips: [],
  };
}

// ─── 01 · Cover — Masterclass Promo ──────────────────────────────────────────
const scene01 = sceneBase('masterclass_01', 1, 'Masterclass Promo', 'Cover', 'Elegant dark cover with serif title, gold badges, and asymmetric instructor photo.', 'Cover → About Me', ['cover', 'masterclass'], {
  hero: { x: 680, y: 100, width: 500, height: 500 },
  title: { x: 64, y: 180, width: 620, height: 200 }
});
scene01.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed rgba(255,255,255,0.1)' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'ONLINE MASTERCLASS', { fontFamily: F.sans, fontSize: 14, color: C.primary, fontWeight: '700', letterSpacing: '0.08em' }),
  text('hdr_right', 2, SAFE.maxX - 100, SAFE.y, 100, 24, 'VOL. 01', { fontFamily: F.sans, fontSize: 14, color: C.gray, textAlign: 'right' }),

  // Main text content
  text('t_badge', 2, SAFE.x, 140, 400, 30, 'CREATIVE DIRECTION', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.accent, letterSpacing: '0.1em' }),
  text('t_title', 3, SAFE.x, 180, 620, 200, 'Creative Direction\n& Visual Strategy', { fontFamily: F.serif, fontWeight: '700', fontSize: 52, color: C.white, lineHeight: 1.2 }, 'slide-title'),
  text('t_instructor', 2, SAFE.x, 400, 500, 30, 'WITH INSTRUCTOR SARAH JENKINS', { fontFamily: F.sans, fontWeight: '700', fontSize: 15, color: C.primary, letterSpacing: '0.05em' }),
  text('t_sub', 3, SAFE.x, 440, 500, 130, 'Learn the core methodologies behind designing iconic visual systems and directing high-end creative campaigns.', { fontFamily: F.sans, fontSize: 18, color: C.gray, lineHeight: 1.6 }),

  // Accent circular badge on the image edge
  shape('badge_circle', 3, 620, 450, 110, 110, { backgroundColor: C.primary, borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }),
  text('badge_text', 4, 620, 492, 110, 30, 'ENROLL', { fontFamily: F.sans, color: C.dark, textAlign: 'center', fontSize: 14, fontWeight: '800', letterSpacing: '0.05em' }),

  // Right custom hero image (with asymmetric curve)
  image('img_hero', 4, 680, 100, 500, 500, 'masterclass-host', {
    style: {
      borderRadius: '250px 30px 250px 30px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    }
  })
];

// ─── 02 · About Me / Bio ────────────────────────────────────────────────────
const scene02 = sceneBase('masterclass_02', 2, 'Instructor Bio', 'Bio', 'Spacious biography overview splitting text paragraphs and wide office view card.', 'About Me → Syllabus', ['bio', 'profile'], {
  title: { x: 64, y: 90, width: 600, height: 60 },
  bio_desc: { x: 64, y: 160, width: 600, height: 180 }
});
scene02.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed rgba(255,255,255,0.1)' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'ABOUT YOUR INSTRUCTOR', { fontFamily: F.sans, fontSize: 14, color: C.gray, letterSpacing: '0.05em' }),

  // Top elegant quotes and titles
  text('t_title', 2, SAFE.x, 90, 600, 60, 'MEET SARAH JENKINS', { fontFamily: F.sans, fontWeight: '800', fontSize: 24, color: C.primary, letterSpacing: '0.05em' }, 'slide-title'),
  text('t_bio_serif', 2, SAFE.x, 150, 600, 180, 'A multi-disciplinary creative director with 12+ years of experience leading visual campaigns.', { fontFamily: F.serif, fontWeight: '600', fontSize: 28, color: C.white, lineHeight: 1.35 }),

  // Sub columns text content
  text('t_col1', 3, SAFE.x, 350, 280, 240, 'For over a decade, Sarah has led design teams, directed cinematic campaigns, and engineered creative identity systems for global clients. This course packages those methodologies.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.6 }),
  text('t_col2', 3, SAFE.x + 320, 350, 280, 240, 'She believes that strategy is the container for design. In this masterclass, she shares actionable tools, client decks, and key presentation principles.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.6 }),

  // Right Side Team Photo
  image('img_bio', 4, 680, 120, 500, 480, 'masterclass-bio', {
    style: {
      borderRadius: '24px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
    }
  })
];

// ─── 03 · Syllabus / Course Roadmap ─────────────────────────────────────────
const scene03 = sceneBase('masterclass_03', 3, 'Course Syllabus', 'Syllabus', '2x2 grid representing curriculum chapters with index highlights.', 'Syllabus → Outcomes', ['syllabus', 'chapters'], {
  title: { x: 64, y: 90, width: 600, height: 60 },
  grid: { x: 64, y: 170, width: 1152, height: 450 }
});
scene03.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed rgba(255,255,255,0.1)' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'CURRICULUM OVERVIEW', { fontFamily: F.sans, fontSize: 14, color: C.gray, letterSpacing: '0.05em' }),

  // Title
  text('t_title', 2, SAFE.x, 90, 600, 60, 'COURSE SYLLABUS', { fontFamily: F.serif, fontWeight: '700', fontSize: 36, color: C.white }, 'slide-title'),

  // Chapter 1 card
  shape('c1_bg', 2, SAFE.x, 170, 550, 190, { backgroundColor: C.light, borderRadius: '16px', border: `1px solid ${C.line}` }),
  text('c1_idx', 3, SAFE.x + 24, 194, 60, 40, '01', { fontFamily: F.serif, fontWeight: '700', fontSize: 32, color: C.primary }),
  text('c1_lbl', 3, SAFE.x + 90, 198, 430, 30, 'Foundations of Design Direction', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('c1_desc', 3, SAFE.x + 90, 238, 430, 90, 'Setting strategic scope, crafting creative briefs, and align visual goals with target consumer expectations.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 }),

  // Chapter 2 card
  shape('c2_bg', 2, SAFE.x + 600, 170, 550, 190, { backgroundColor: C.light, borderRadius: '16px', border: `1px solid ${C.line}` }),
  text('c2_idx', 3, SAFE.x + 624, 194, 60, 40, '02', { fontFamily: F.serif, fontWeight: '700', fontSize: 32, color: C.primary }),
  text('c2_lbl', 3, SAFE.x + 690, 198, 430, 30, 'Visual Moodboarding & Curation', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('c2_desc', 3, SAFE.x + 690, 238, 430, 90, 'Translating keywords to concepts, aggregating inspiration, and filtering styles down into coherent palettes.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 }),

  // Chapter 3 card
  shape('c3_bg', 2, SAFE.x, 390, 550, 190, { backgroundColor: C.light, borderRadius: '16px', border: `1px solid ${C.line}` }),
  text('c3_idx', 3, SAFE.x + 24, 414, 60, 40, '03', { fontFamily: F.serif, fontWeight: '700', fontSize: 32, color: C.primary }),
  text('c3_lbl', 3, SAFE.x + 90, 418, 430, 30, 'Structuring the Visual Language', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('c3_desc', 3, SAFE.x + 90, 458, 430, 90, 'Designing unified typographic hierarchies, asset libraries, logo variations, and style guides.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 }),

  // Chapter 4 card
  shape('c4_bg', 2, SAFE.x + 600, 390, 550, 190, { backgroundColor: C.light, borderRadius: '16px', border: `1px solid ${C.line}` }),
  text('c4_idx', 3, SAFE.x + 624, 414, 60, 40, '04', { fontFamily: F.serif, fontWeight: '700', fontSize: 32, color: C.primary }),
  text('c4_lbl', 3, SAFE.x + 690, 418, 430, 30, 'Client Pitching & Presenting', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('c4_desc', 3, SAFE.x + 690, 458, 430, 90, 'Formulating compelling decks, presenting layouts logically, and steering client reviews to active approval.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 })
];

// ─── 04 · What You'll Learn (Core Outcomes) ──────────────────────────────────
const scene04 = sceneBase('masterclass_04', 4, 'Core Outcomes', 'Outcomes', 'Highlighting three key skills with text icons next to a portrait placeholder.', 'Outcomes → CTA', ['outcomes', 'skills'], {
  title: { x: 64, y: 90, width: 600, height: 60 },
  list: { x: 680, y: 170, width: 480, height: 420 }
});
scene04.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed rgba(255,255,255,0.1)' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'KEY LEARNING OUTCOMES', { fontFamily: F.sans, fontSize: 14, color: C.gray, letterSpacing: '0.05em' }),

  // Title
  text('t_title', 2, SAFE.x, 90, 600, 60, 'SKILLS YOU WILL ACQUIRE', { fontFamily: F.serif, fontWeight: '700', fontSize: 36, color: C.white }, 'slide-title'),

  // Left Image
  image('img_outcomes', 2, SAFE.x, 170, 560, 420, 'masterclass-outcomes', { style: { borderRadius: '24px', objectFit: 'cover' } }),

  // Outcome 1
  shape('ico_bg_1', 3, 670, 180, 52, 52, { backgroundColor: C.light, borderRadius: '50%' }),
  image('ico_1', 4, 681, 191, 30, 30, 'values', { style: { objectFit: 'contain' } }),
  text('out_lbl_1', 3, 740, 178, 400, 26, 'Define Brand Systems', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('out_body_1', 3, 740, 208, 400, 60, 'Construct scalable and modular brand guides that clients can deploy with ease.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 }),

  // Outcome 2
  shape('ico_bg_2', 3, 670, 310, 52, 52, { backgroundColor: C.light, borderRadius: '50%' }),
  image('ico_2', 4, 681, 321, 30, 30, 'growth', { style: { objectFit: 'contain' } }),
  text('out_lbl_2', 3, 740, 308, 400, 26, 'Structure High-Rate Pitching', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('out_body_2', 3, 740, 338, 400, 60, 'Structure pitch strategies that explain the business value of your aesthetics.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 }),

  // Outcome 3
  shape('ico_bg_3', 3, 670, 440, 52, 52, { backgroundColor: C.light, borderRadius: '50%' }),
  image('ico_3', 4, 681, 451, 30, 30, 'team', { style: { objectFit: 'contain' } }),
  text('out_lbl_3', 3, 740, 438, 400, 26, 'Lead Creative Strategy', { fontFamily: F.sans, fontWeight: '700', fontSize: 18, color: C.white }),
  text('out_body_3', 3, 740, 468, 400, 60, 'Direct designers, developers, and photographers toward unified creative visions.', { fontFamily: F.sans, fontSize: 14, color: C.gray, lineHeight: 1.5 })
];

// ─── 05 · Call to Action (CTA - Enroll Now) ──────────────────────────────────
const scene05 = sceneBase('masterclass_05', 5, 'Start Learning', 'CTA', 'Centered masterclass enrollment card with outlines and a gold button CTA.', 'CTA → End', ['cta', 'enroll'], {
  title: { x: 64, y: 90, width: 600, height: 60 },
  card: { x: 240, y: 160, width: 800, height: 440 }
});
scene05.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed rgba(255,255,255,0.1)' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'JOIN THE MASTERCLASS', { fontFamily: F.sans, fontSize: 14, color: C.gray, letterSpacing: '0.05em' }),

  // Title
  text('t_title', 2, SAFE.x, 90, 600, 60, 'START TODAY', { fontFamily: F.sans, fontWeight: '800', fontSize: 24, color: C.primary, letterSpacing: '0.05em' }, 'slide-title'),

  // Central Card
  shape('card_bg', 2, 240, 160, 800, 440, { backgroundColor: C.light, borderRadius: '24px', border: `1px solid ${C.line}`, boxShadow: '0 20px 48px rgba(0,0,0,0.4)' }),

  // Badge
  text('card_badge', 3, 240, 210, 800, 24, 'LIMITED ENROLLMENTS AVAILABLE', { fontFamily: F.sans, fontWeight: '850', fontSize: 12, color: C.accent, letterSpacing: '0.12em', textAlign: 'center' }),

  // Headline
  text('card_h1', 3, 290, 250, 700, 50, 'Unlock Sarah Jenkins Masterclass', { fontFamily: F.serif, fontWeight: '700', fontSize: 36, color: C.white, textAlign: 'center' }),

  // Subtext
  text('card_sub', 3, 300, 320, 680, 80, 'Gain instant lifetime access to 40+ high-definition lessons, downloadable visual templates, and access to our private Discord creative network.', { fontFamily: F.sans, fontSize: 16, color: C.gray, lineHeight: 1.6, textAlign: 'center' }),

  // CTA button
  shape('btn_bg', 3, 540, 440, 200, 50, { backgroundColor: C.primary, borderRadius: '8px', cursor: 'pointer' }),
  text('btn_lbl', 4, 540, 454, 200, 30, 'ENROLL NOW', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.dark, textAlign: 'center', letterSpacing: '0.05em' }),

  // Guarantee footer subtext
  text('card_guarantee', 3, 240, 514, 800, 20, '14-Day Money Back Guarantee', { fontFamily: F.sans, fontSize: 13, color: C.gray, textAlign: 'center' })
];

// Finalize scenes
[scene01, scene02, scene03, scene04, scene05].forEach((scene) => {
  finalizeScene(scene, 'bg-dark');
});

const template = {
  category: 'Courses',
  template: {
    id: 'masterclass-intro',
    name: 'Masterclass Introduction',
    category: 'Courses',
    theme: assets.theme,
    totalSlides: 5,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: 'An elegant dark-themed 5-slide introductory course presentation package, complete with chapters grid, biography panel, and CTA enroll card.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
