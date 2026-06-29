import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/platform_tutorial_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/platform-tutorial-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 9;
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
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
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
  scene.background = { type: bgId.includes('gradient') ? 'gradient' : 'solid', value: bg?.value || '#F8FAFC' };
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
    tags: ['platform-tutorial', ...tags],
    clips: [],
  };
}

// ─── 01 · Step 1: Create Project ──────────────────────────────────────────────
const scene01 = sceneBase('tutorial_01', 1, 'Create Project', 'Cover', 'Tutorial Scene 1 - Create Project: Choose a template or start from blank.', 'Create Project → Choose Avatar', ['project'], {
  hero: { x: 680, y: 100, width: 500, height: 500 },
  title: { x: 64, y: 160, width: 600, height: 260 }
});
scene01.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line_1', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: `1px dashed ${C.line}` }),
  text('hdr_left_1', 2, SAFE.x, SAFE.y, 300, 24, 'STEP 1: GETTING STARTED', { fontFamily: F.sans, fontSize: 16, color: C.primary }),
  text('hdr_right_1', 2, SAFE.maxX - 100, SAFE.y, 100, 24, '01 / 04', { fontFamily: F.sans, fontSize: 16, color: C.grey, textAlign: 'right' }),

  // Main text content
  text('t_title_1', 3, SAFE.x, 160, 600, 100, 'Create Project', { fontFamily: F.sans, fontWeight: '800', fontSize: 60, color: C.dark }, 'slide-title'),
  text('t_sub_1', 3, SAFE.x, 280, 500, 160, 'First, start your project in Athena VI. Choose from our catalog of pre-designed templates to jumpstart your creation, or start from a blank canvas to build your vision from scratch.', { fontFamily: F.sans, fontSize: 18, color: C.grey, lineHeight: 1.6 }),

  // Accent circular badge
  shape('badge_circle_1', 3, 620, 450, 100, 100, { backgroundColor: C.primary, borderRadius: '50%', boxShadow: '0 8px 24px rgba(59,130,246,0.2)' }),
  image('badge_icon_1', 4, 645, 475, 50, 50, 'project', { style: { objectFit: 'contain' } }),

  // Hero mockup image
  image('img_hero_1', 4, 680, 100, 500, 500, 'tutorial-step1', {
    style: {
      borderRadius: '24px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }
  })
];

// ─── 02 · Step 2: Choose Avatar ──────────────────────────────────────────────
const scene02 = sceneBase('tutorial_02', 2, 'Choose Avatar', 'Tutorial', 'Tutorial Scene 2 - Choose Avatar: Select platform avatars or create your personal twin.', 'Choose Avatar → Write Script', ['avatar'], {
  hero: { x: 680, y: 100, width: 500, height: 500 },
  title: { x: 64, y: 160, width: 600, height: 260 }
});
scene02.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line_2', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: `1px dashed ${C.line}` }),
  text('hdr_left_2', 2, SAFE.x, SAFE.y, 300, 24, 'STEP 2: PRESENTATION LOOK', { fontFamily: F.sans, fontSize: 16, color: C.primary }),
  text('hdr_right_2', 2, SAFE.maxX - 100, SAFE.y, 100, 24, '02 / 04', { fontFamily: F.sans, fontSize: 16, color: C.grey, textAlign: 'right' }),

  // Main text content
  text('t_title_2', 3, SAFE.x, 160, 600, 100, 'Choose Avatar', { fontFamily: F.sans, fontWeight: '800', fontSize: 60, color: C.dark }, 'slide-title'),
  text('t_sub_2', 3, SAFE.x, 280, 500, 160, 'Next, pick your presenter. Choose one of our highly expressive platform avatars, or create your own personal Digital Twin from a short video clip for a truly custom appearance.', { fontFamily: F.sans, fontSize: 18, color: C.grey, lineHeight: 1.6 }),

  // Accent circular badge
  shape('badge_circle_2', 3, 620, 450, 100, 100, { backgroundColor: C.secondary, borderRadius: '50%', boxShadow: '0 8px 24px rgba(30,64,175,0.2)' }),
  image('badge_icon_2', 4, 645, 475, 50, 50, 'avatar', { style: { objectFit: 'contain' } }),

  // Hero mockup image
  image('img_hero_2', 4, 680, 100, 500, 500, 'tutorial-step2', {
    style: {
      borderRadius: '24px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }
  })
];

// ─── 03 · Step 3: Write Script & Voice ──────────────────────────────────────
const scene03 = sceneBase('tutorial_03', 3, 'Write Script & Voice', 'Tutorial', 'Tutorial Scene 3 - Write Script & Voice: Select voice and write narration script.', 'Write Script → Generate Video', ['voice', 'script'], {
  hero: { x: 680, y: 100, width: 500, height: 500 },
  title: { x: 64, y: 160, width: 600, height: 260 }
});
scene03.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line_3', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: `1px dashed ${C.line}` }),
  text('hdr_left_3', 2, SAFE.x, SAFE.y, 300, 24, 'STEP 3: AUDIO & SPEECH', { fontFamily: F.sans, fontSize: 16, color: C.primary }),
  text('hdr_right_3', 2, SAFE.maxX - 100, SAFE.y, 100, 24, '03 / 04', { fontFamily: F.sans, fontSize: 16, color: C.grey, textAlign: 'right' }),

  // Main text content
  text('t_title_3', 3, SAFE.x, 160, 600, 100, 'Write Script', { fontFamily: F.sans, fontWeight: '800', fontSize: 60, color: C.dark }, 'slide-title'),
  text('t_sub_3', 3, SAFE.x, 280, 500, 160, 'Now, choose a voice and write your script. Select from dozens of natural-sounding voices, type or paste your narration for each scene, and the avatar will speak it automatically.', { fontFamily: F.sans, fontSize: 18, color: C.grey, lineHeight: 1.6 }),

  // Accent circular badge
  shape('badge_circle_3', 3, 620, 450, 100, 100, { backgroundColor: C.accent, borderRadius: '50%', boxShadow: '0 8px 24px rgba(16,185,129,0.2)' }),
  image('badge_icon_3', 4, 645, 475, 50, 50, 'script', { style: { objectFit: 'contain' } }),

  // Hero mockup image
  image('img_hero_3', 4, 680, 100, 500, 500, 'tutorial-step3', {
    style: {
      borderRadius: '24px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }
  })
];

// ─── 04 · Step 4: Generate Video ─────────────────────────────────────────────
const scene04 = sceneBase('tutorial_04', 4, 'Generate Video', 'CTA', 'Tutorial Scene 4 - Generate Video: Render in HD and download.', 'Generate Video → End', ['generate', 'download'], {
  hero: { x: 680, y: 100, width: 500, height: 500 },
  title: { x: 64, y: 160, width: 600, height: 260 }
});
scene04.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line_4', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: `1px dashed ${C.line}` }),
  text('hdr_left_4', 2, SAFE.x, SAFE.y, 300, 24, 'STEP 4: RENDER & SHARE', { fontFamily: F.sans, fontSize: 16, color: C.primary }),
  text('hdr_right_4', 2, SAFE.maxX - 100, SAFE.y, 100, 24, '04 / 04', { fontFamily: F.sans, fontSize: 16, color: C.grey, textAlign: 'right' }),

  // Main text content
  text('t_title_4', 3, SAFE.x, 160, 600, 100, 'Generate Video', { fontFamily: F.sans, fontWeight: '800', fontSize: 60, color: C.dark }, 'slide-title'),
  text('t_sub_4', 3, SAFE.x, 280, 500, 160, 'Finally, click Generate. Athena VI processes your scenes and layers into a seamless HD video, ready to download and share with your audience instantly.', { fontFamily: F.sans, fontSize: 18, color: C.grey, lineHeight: 1.6 }),

  // Accent circular badge
  shape('badge_circle_4', 3, 620, 450, 100, 100, { backgroundColor: C.primary, borderRadius: '50%', boxShadow: '0 8px 24px rgba(59,130,246,0.2)' }),
  image('badge_icon_4', 4, 645, 475, 50, 50, 'generate', { style: { objectFit: 'contain' } }),

  // Hero mockup image
  image('img_hero_4', 4, 680, 100, 500, 500, 'tutorial-step4', {
    style: {
      borderRadius: '24px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }
  })
];

// Finalize scenes
[scene01, scene02, scene03, scene04].forEach((scene, i) => {
  finalizeScene(scene, i % 2 === 0 ? 'bg-gradient-blue' : 'bg-cream');
});

const template = {
  category: 'Courses',
  template: {
    id: 'platform-tutorial',
    name: "AI Video Creation Guide",
    category: 'Courses',
    theme: assets.theme,
    totalSlides: 4,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: "Learn how to build AI videos step-by-step with this 4-slide tutorial presentation template.",
  },
  scenes: [scene01, scene02, scene03, scene04],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
