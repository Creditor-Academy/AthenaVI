import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/business_proposal_new_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/business-proposal-new-assets.json');
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
    tags: ['business-proposal', ...tags],
    clips: [],
  };
}

// ─── 01 · Cover — Business Proposal ─────────────────────────────────────────
const scene01 = sceneBase('proposal_01', 1, 'Business Proposal', 'Cover', 'Minimalist cover layout with asymmetrical curved hero image and metadata.', 'Cover → Agenda', ['cover', 'branding'], {
  hero: { x: 580, y: 76, width: 636, height: 608 },
  title: { x: 64, y: 220, width: 540, height: 170 }
});
scene01.clips = [
  // Header Dotted Line & Labels
  shape('dashed_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { borderBottom: '1px dashed #cccccc' }),
  text('hdr_left', 2, SAFE.x, SAFE.y, 300, 24, 'Presentation Template', { fontFamily: F.sans, fontSize: 16, color: C.gray }),
  text('hdr_right', 2, SAFE.maxX - 100, SAFE.y, 100, 24, '2026', { fontFamily: F.sans, fontSize: 16, color: C.gray, textAlign: 'right' }),

  // Main text content
  text('t_title', 3, SAFE.x, 220, 540, 170, 'Business\nProposal', { fontFamily: F.sans, fontWeight: '800', fontSize: 76, color: C.dark, lineHeight: 1.15 }, 'slide-title'),
  text('t_sub', 3, SAFE.x, 410, 420, 160, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla tempus magna eu felis pretium, blandit pharetra massa hendrerit. Sed eu tortor vel neque consectetur interdum ac eu nibh. Pellentesque ut varius neque.', { fontFamily: F.sans, fontSize: 20, color: C.gray, lineHeight: 1.6 }),

  // Left Inset watch image
  image('img_inset', 4, 300, 440, 220, 200, 'proposal-watch-inset', { style: { borderRadius: '22px', objectFit: 'cover' } }),

  // Right custom hero image (with asymmetric curve)
  image('img_hero', 4, 580, 76, 636, 608, 'proposal-watch-hero', {
    style: {
      borderRadius: '140px 22px 22px 22px',
      objectFit: 'cover',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
    }
  })
];

// ─── 02 · Agenda Overview ──────────────────────────────────────────────────
const agendaItems = [
  'Problem',
  'Solution',
  'Key Metrics',
  'Unique Value Position',
  'SWOT',
  'Unfair Advantage',
  'Marketing Channels',
  'Consumer Segment'
];
const scene02 = sceneBase('proposal_02', 2, 'Agenda Overview', 'Agenda', 'Linen editorial list showing index bullets and arrow prompt.', 'Agenda → Target', ['agenda', 'index'], {
  title: { x: 64, y: 200, width: 400, height: 130 },
  list: { x: 680, y: 150, width: 400, height: 440 }
});
scene02.clips = [
  // Left Sidebar pearls overlay
  image('img_pearls', 1, -40, 0, 260, H, 'proposal-pearls', { style: { objectFit: 'contain', opacity: 0.65 } }),

  // Left Title
  text('t_title', 2, 180, 220, 400, 130, 'AGENDA\nOVERVIEW', { fontFamily: F.sans, fontWeight: '800', fontSize: 56, color: C.dark, lineHeight: 1.15 }, 'slide-title'),

  // Header tag
  text('hdr_logo', 2, SAFE.maxX - 300, SAFE.y, 300, 24, 'Warner & Spencer', { fontFamily: F.sans, fontSize: 16, color: C.gray, textAlign: 'right' }),

  // Arrow separator
  text('t_arrow', 2, 480, 270, 120, 32, '—————→', { fontFamily: F.sans, fontWeight: '800', fontSize: 32, color: C.primary }),

  // Checklist items
  ...agendaItems.flatMap((item, i) => {
    const y = 120 + i * 62;
    return [
      shape(`bullet_${i}`, 3, 660, y + 12, 12, 12, { backgroundColor: C.primary, borderRadius: '50%' }),
      text(`item_${i}`, 3, 685, y, 400, 32, item, { fontFamily: F.sans, fontWeight: '600', fontSize: 24, color: C.dark })
    ];
  })
];

// ─── 03 · Target Audience (Pie Chart) ───────────────────────────────────────
const scene03 = sceneBase('proposal_03', 3, 'Target Audience', 'Chart', 'Monochrome pie chart with item percentage callouts.', 'Target → Who I Am', ['audience', 'analytics'], {
  title: { x: 64, y: 200, width: 400, height: 130 },
  chart: { x: 760, y: 200, width: 320, height: 320 }
});
scene03.clips = [
  // Header Line & Labels
  shape('hdr_line', 1, SAFE.x, SAFE.y + 24, SAFE.w, 1, { backgroundColor: C.line }),
  text('t_hdr_left', 2, SAFE.x, SAFE.y, 200, 24, 'STUDIO NAME', { fontFamily: F.sans, fontSize: 16, color: C.gray }),
  text('t_hdr_mid', 2, W / 2 - 150, SAFE.y, 300, 24, 'STRATEGY APPROACH', { fontFamily: F.sans, fontSize: 16, color: C.gray, textAlign: 'center' }),
  text('t_hdr_right', 2, SAFE.maxX - 100, SAFE.y, 100, 24, 'PAGE 1', { fontFamily: F.sans, fontSize: 16, color: C.gray, textAlign: 'right' }),

  // Footer Line & Labels
  shape('ftr_line', 1, SAFE.x, SAFE.maxY - 24, SAFE.w, 1, { backgroundColor: C.line }),
  text('t_ftr_left', 2, SAFE.x, SAFE.maxY - 12, 100, 24, 'YEAR', { fontFamily: F.sans, fontSize: 16, color: C.gray }),
  text('t_ftr_mid', 2, W / 2 - 100, SAFE.maxY - 12, 200, 24, 'CONFIDENTIAL', { fontFamily: F.sans, fontSize: 16, color: C.gray, textAlign: 'center' }),
  text('t_ftr_right', 2, SAFE.maxX - 200, SAFE.maxY - 12, 200, 24, 'STUDIO NAME', { fontFamily: F.sans, fontSize: 16, color: C.gray, textAlign: 'right' }),

  // Left Content
  text('t_title', 2, SAFE.x, 200, 400, 130, 'TARGET\nAUDIENCE', { fontFamily: F.serif, fontWeight: '600', fontSize: 56, color: C.dark, lineHeight: 1.15 }, 'slide-title'),
  text('t_body', 2, SAFE.x, 380, 460, 200, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.', { fontFamily: F.sans, fontSize: 22, color: C.gray, lineHeight: 1.6 }),

  // Dynamic Pie Chart using CSS conic-gradient (Item 1: 62.5%, Item 2: 25%, Item 3: 12.5%)
  shape('pie_chart', 3, 760, 200, 320, 320, {
    borderRadius: '50%',
    background: 'conic-gradient(#1c1917 0% 12.5%, #707070 12.5% 37.5%, #cccccc 37.5% 100%)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
  }),

  // Labels pointing to sections
  text('lbl_item3', 4, 700, 160, 100, 44, 'Item 3\n12.5%', { fontFamily: F.sans, fontSize: 20, color: C.dark, textAlign: 'right', fontWeight: '600' }),
  text('lbl_item2', 4, 640, 430, 100, 44, 'Item 2\n25%', { fontFamily: F.sans, fontSize: 20, color: C.dark, textAlign: 'right', fontWeight: '600' }),
  text('lbl_item1', 4, 1100, 330, 100, 44, 'Item 1\n62.5%', { fontFamily: F.sans, fontSize: 20, color: C.dark, fontWeight: '600' })
];

// ─── 04 · Who I Am ──────────────────────────────────────────────────────────
const scene04 = sceneBase('proposal_04', 4, 'Who I Am', 'Profile', 'Abstract profiles matching talking bubbles and background stripes.', 'Who I Am → Needs', ['profile', 'about'], {
  image_left: { x: 64, y: 100, width: 460, height: 330 },
  card_right_top: { x: 620, y: 100, width: 420, height: 300 },
  card_right_bottom: { x: 480, y: 440, width: 400, height: 220 }
});
scene04.clips = [
  // Stripes Top-Right
  shape('stripe_blue', 1, 1120, -40, 30, 300, { backgroundColor: '#3b82f6', borderRadius: '15px', transform: 'rotate(-45deg)' }),
  shape('stripe_ochre', 1, 1150, -40, 30, 300, { backgroundColor: '#e07a5f', borderRadius: '15px', transform: 'rotate(-45deg)' }),
  shape('stripe_orange', 1, 1180, -40, 30, 300, { backgroundColor: '#f48c06', borderRadius: '15px', transform: 'rotate(-45deg)' }),

  // Purple Squiggle Bottom-Left
  shape('squiggle_purple', 1, -20, 520, 180, 180, { border: '4px solid #9d4edd', borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%' }),

  // Businessman image with diagonal curve cut
  image('img_presenter', 2, SAFE.x, 100, 460, 330, 'proposal-pointing', { style: { borderRadius: '100px 100px 0 100px', objectFit: 'cover' } }),

  // Bottom left title (Moved slightly higher and bounded to prevent overlap with env badge)
  text('t_title', 2, SAFE.x, 470, 260, 80, 'Who I Am', { fontFamily: F.sans, fontWeight: '800', fontSize: 52, color: C.dark }, 'slide-title'),

  // Bottom left envelope icon container (Shifted right to avoid text overlap)
  shape('env_card', 3, 340, 510, 110, 110, { backgroundColor: C.white, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }),
  image('env_icon', 4, 355, 525, 80, 80, 'solution', { style: { objectFit: 'contain' } }),

  // Talking bubbles card (Orange)
  shape('talk_card', 2, 620, 100, 420, 300, { backgroundColor: C.primary, borderRadius: '80px 24px 24px 80px' }),
  image('talk_img', 3, 635, 115, 390, 270, 'proposal-meeting', { style: { borderRadius: '68px 18px 18px 68px', objectFit: 'cover' } }),

  // Charcoal textual details card (Title and description text frames resized to prevent overflow clipping)
  shape('details_card', 2, 480, 440, 400, 220, { backgroundColor: C.dark, borderRadius: '20px' }),
  text('card_title', 3, 504, 460, 352, 40, "Build Today's Identity Purposefully", { fontFamily: F.sans, fontWeight: '700', fontSize: 22, color: C.white }),
  text('card_body', 3, 504, 510, 352, 130, "Today's identity reflects accumulated experiences, refined values, and clearer direction, forming a more intentional and grounded personal brand, built through consistent purposeful actions.", { fontFamily: F.sans, fontSize: 16, color: '#cccccc', lineHeight: 1.6 }),

  // Small pointer icon / social tag
  shape('social_btn', 3, 920, 570, 36, 36, { backgroundColor: C.dark, borderRadius: '50%' }),
  text('social_arrow', 4, 920, 575, 36, 24, '→', { fontFamily: F.sans, color: C.white, textAlign: 'center', fontSize: 18, fontWeight: '800' }),
  text('social_tag', 3, 965, 576, 200, 24, '@reallygreatsite', { fontFamily: F.sans, fontWeight: '600', fontSize: 16, color: C.dark })
];

// ─── 05 · Target Audience Details ───────────────────────────────────────────
const scene05 = sceneBase('proposal_05', 5, 'Customer Profile', 'CustomerDetails', 'Profile metrics matching customer needs cards.', 'Needs → End', ['needs', 'summary'], {
  title: { x: 64, y: 120, width: 400, height: 180 },
  card_profile: { x: 520, y: 80, width: 560, height: 340 },
  card_needs: { x: 64, y: 490, width: 640, height: 160 }
});
scene05.clips = [
  // Thin elegant title
  text('t_title', 2, SAFE.x, 120, 400, 180, 'Target\nAudience', { fontFamily: F.sans, fontWeight: '300', fontSize: 72, color: C.dark, lineHeight: 1.15 }, 'slide-title'),

  // Customer Profile dark card
  shape('profile_card', 2, 520, 80, 560, 340, { backgroundColor: C.dark, borderRadius: '24px' }),
  text('p_title', 3, 550, 110, 260, 30, 'Customer Profile', { fontFamily: F.sans, fontWeight: '600', fontSize: 28, color: C.white }),
  text('p_body', 3, 550, 160, 260, 240, "Age: 18–35 Years Old\n\nLifestyle: Active, trend-aware, digital-savvy\n\nInterests: Fashion, lifestyle, social media, creativity", { fontFamily: F.sans, fontSize: 20, color: '#cccccc', lineHeight: 1.6 }),

  // Portrait group photo overlapping card
  image('img_team', 4, 730, 160, 310, 310, 'proposal-team', { style: { borderRadius: '20px', objectFit: 'cover', boxShadow: '0 15px 35px rgba(0,0,0,0.15)' } }),

  // Customer Needs bottom wide card
  shape('needs_card', 2, SAFE.x, 490, 640, 160, { backgroundColor: C.dark, borderRadius: '24px' }),
  text('n_title', 3, SAFE.x + 30, 514, 580, 30, 'Customer Needs', { fontFamily: F.sans, fontWeight: '600', fontSize: 26, color: C.white }),
  text('n_col1', 3, SAFE.x + 30, 564, 170, 60, 'Quality products', { fontFamily: F.sans, fontSize: 20, color: '#cccccc', fontWeight: '500' }),
  text('n_col2', 3, SAFE.x + 220, 564, 170, 60, 'Relatable branding', { fontFamily: F.sans, fontSize: 20, color: '#cccccc', fontWeight: '500' }),
  text('n_col3', 3, SAFE.x + 410, 564, 170, 60, 'Engaging online experience', { fontFamily: F.sans, fontSize: 20, color: '#cccccc', fontWeight: '500' })
];

// Finalize scenes
[scene01, scene02, scene03, scene04, scene05].forEach((scene, i) => {
  const bgId = (i === 1) ? 'bg-linen' : (i === 4) ? 'bg-gradient-sage' : 'bg-white';
  finalizeScene(scene, bgId);
});

const template = {
  category: 'Company',
  template: {
    id: 'business-proposal-new',
    name: 'Business Proposal',
    category: 'Company',
    theme: assets.theme,
    totalSlides: 5,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: 'High-end 5-slide Business Proposal presentation mimicking custom mockups with dynamic pie charts, asymmetrical watch covers, and text layout columns.',
  },
  scenes: [scene01, scene02, scene03, scene04, scene05],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
