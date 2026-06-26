import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/templates/womens_wellness_template.json');
const ASSETS_PATH = join(__dirname, '../public/templates/womens-wellness-assets.json');
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));

const DURATION = 8;
const W = 1280;
const H = 720;
const C = assets.colors;
const F = assets.theme?.fonts || {
  display: '"Outfit", "DM Sans", system-ui, sans-serif',
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
  scene.background = { type: bgId.includes('gradient') ? 'gradient' : 'solid', value: bg?.value || '#FFF5F5' };
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
    tags: ['womens-wellness', ...tags],
    clips: [],
  };
}

// ─── 01 · Cover Page ──────────────────────────────────────────────────────────
const scene01 = sceneBase('wellness_01', 1, 'Wellness Cover', 'Cover', 'Serif title cover page with soft pink botanical and line overlays.', 'Cover → Wellness Pillars', ['cover'], {
  title: { x: 80, y: 220, width: 650, height: 160 }
});
scene01.clips = [
  // Decorative botanical line shapes & meditation cycles/orbits in background
  shape('orbit_1', 1, 660, 180, 240, 240, { border: '1px solid rgba(244,114,182,0.25)', borderRadius: '50%', backgroundColor: 'rgba(253,164,175,0.05)' }),
  shape('orbit_2', 1, 720, 120, 360, 360, { border: '2.5px solid rgba(244,114,182,0.12)', borderRadius: '50%', backgroundColor: 'rgba(253,164,175,0.02)' }),
  shape('orbit_3', 1, 600, 60, 480, 480, { border: '1px dashed rgba(244,114,182,0.18)', borderRadius: '50%' }),

  // Accent wave/polygon left panel
  shape('bg_wave_cover', 1, 0, 0, 460, H, { backgroundColor: 'rgba(253, 164, 175, 0.12)', borderRadius: '0 100% 100% 0 / 0 100% 100% 0' }),

  // Company logo
  image('img_logo', 10, 80, 60, 180, 36, 'wellness-logo'),

  // Header date text
  text('header_date', 3, 1000, 60, 200, 30, 'August 2026', { fontFamily: F.sans, fontSize: 14, color: C.grey, textAlign: 'right' }),

  // Section Label
  text('hdr_sub', 2, 80, 160, 400, 30, 'HOLISTIC SELF-CARE', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.secondary, letterSpacing: '0.12em' }),

  // Main title (aligned with reference layout colors)
  text('t_title', 3, 80, 220, 650, 160, "WOMEN'S WELLNESS", { fontFamily: F.serif, fontWeight: '700', fontSize: 62, color: C.secondary, lineHeight: 1.25 }, 'slide-title'),

  // Subtitle
  text('t_sub', 2, 80, 410, 580, 100, 'A progressive guide to hormone alignment, mindful nourishment, and reclaiming daily peace.', { fontFamily: F.sans, fontSize: 18, color: C.dark, lineHeight: 1.6 }),

  // Footer text
  text('t_footer', 3, 80, 580, 500, 30, 'Self-Care Routine for Busy Women', { fontFamily: F.sans, fontSize: 14, color: C.grey }),

  // Image outline frame (shifted to create shadow depth)
  shape('arch_outline', 2, 745, 125, 430, 475, { border: `2px solid ${C.secondary}`, borderRadius: '215px 215px 0 0', backgroundColor: 'transparent' }),

  // Image card on the right
  image('img_cover', 3, 760, 140, 400, 460, 'wellness-cover', { style: { borderRadius: '200px 200px 0 0', objectFit: 'cover', boxShadow: '0 20px 40px rgba(244,114,182,0.15)' } })
];

// ─── 02 · Wellness Pillars (Image 2 style) ──────────────────────────────────
const scene02 = sceneBase('wellness_02', 2, 'Core Wellness Pillars', 'Pillars', 'Left vertical image with right title, intro box, and 3 column pillars.', 'Pillars → Daily Rituals', ['pillars'], {
  title: { x: 480, y: 100, width: 500, height: 50 }
});
scene02.clips = [
  // Left vertical image
  image('img_pillars', 2, 64, 100, 360, 480, 'wellness-yoga', { style: { borderRadius: '24px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' } }),

  // Main Title on right
  text('t_title', 2, 480, 100, 500, 50, 'CORE WELLNESS PILLARS', { fontFamily: F.serif, fontWeight: '700', fontSize: 32, color: C.dark }, 'slide-title'),

  // Pillars intro card
  shape('pillars_intro_box', 2, 480, 160, 500, 90, { border: `1px solid ${C.line}`, borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.5)' }),
  text('pillars_intro_txt', 3, 495, 175, 470, 60, 'Holistic self-care is built upon three foundational pillars that support your nervous system, somatic balance, and emotional alignment.', { fontFamily: F.sans, fontSize: 13, color: C.grey, lineHeight: 1.45 }),

  // Pillar 1 (Mind)
  shape('p1_bg', 2, 480, 275, 150, 305, { backgroundColor: C.white, borderRadius: '12px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }),
  image('p1_icon', 3, 535, 290, 40, 40, 'brain'),
  text('p1_lbl', 3, 485, 345, 140, 24, 'Nourished Mind', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.dark, textAlign: 'center' }),
  text('p1_desc', 3, 485, 375, 140, 190, 'Calming stress loops, box-breathing, and digital boundaries.', { fontFamily: F.sans, fontSize: 11, color: C.grey, textAlign: 'center', lineHeight: 1.4 }),

  // Pillar 2 (Body)
  shape('p2_bg', 2, 655, 275, 150, 305, { backgroundColor: C.white, borderRadius: '12px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }),
  image('p2_icon', 3, 710, 290, 40, 40, 'flower'),
  text('p2_lbl', 3, 660, 345, 140, 24, 'Somatic Body', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.dark, textAlign: 'center' }),
  text('p2_desc', 3, 660, 375, 140, 190, 'Gentle yoga, walks, and biological cycle workout syncing.', { fontFamily: F.sans, fontSize: 11, color: C.grey, textAlign: 'center', lineHeight: 1.4 }),

  // Pillar 3 (Spirit)
  shape('p3_bg', 2, 830, 275, 150, 305, { backgroundColor: C.white, borderRadius: '12px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }),
  image('p3_icon', 4, 885, 290, 40, 40, 'heart'),
  text('p3_lbl', 3, 835, 345, 140, 24, 'Alignment', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.dark, textAlign: 'center' }),
  text('p3_desc', 3, 835, 375, 140, 190, 'Community connections, journals, and self-compassion.', { fontFamily: F.sans, fontSize: 11, color: C.grey, textAlign: 'center', lineHeight: 1.4 }),
];

// ─── 03 · Daily Rituals (Image 1 style) ──────────────────────────────────────
const scene03 = sceneBase('wellness_03', 3, 'Daily Rituals', 'Timeline', 'Horizontal connecting timeline charting four daily rituals matching reference flow.', 'Daily Rituals → Nutrition Grid', ['rituals'], {
  title: { x: 80, y: 110, width: 600, height: 60 }
});
scene03.clips = [
  // Company logo & header date
  image('img_logo', 10, 80, 60, 180, 36, 'wellness-logo'),
  text('header_date', 3, 1000, 60, 200, 30, 'August 2026', { fontFamily: F.sans, fontSize: 14, color: C.grey, textAlign: 'right' }),

  // Main Title
  text('t_title', 2, 80, 110, 600, 60, 'DAILY WELLNESS RITUALS', { fontFamily: F.serif, fontWeight: '700', fontSize: 48, color: C.dark }, 'slide-title'),

  // Horizontal timeline connector line
  shape('timeline_line', 2, 80, 230, 800, 3, { backgroundColor: C.secondary }),

  // Step 1: Wake
  shape('step_node_1', 3, 85, 215, 30, 30, { backgroundColor: C.secondary, border: `4px solid ${C.white}`, borderRadius: '50%' }),
  text('step_num_1', 4, 85, 220, 30, 20, '01', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.white, textAlign: 'center' }),
  text('step_lbl_1', 3, 60, 280, 180, 24, 'Hydration First', { fontFamily: F.sans, fontWeight: '800', fontSize: 15, color: C.dark }),
  text('step_desc_1', 3, 60, 310, 180, 90, 'Drink 500ml warm water with fresh lemon to wake the stomach.', { fontFamily: F.sans, fontSize: 12, color: C.grey, lineHeight: 1.4 }),

  // Step 2: Move
  shape('step_node_2', 3, 305, 215, 30, 30, { backgroundColor: C.secondary, border: `4px solid ${C.white}`, borderRadius: '50%' }),
  text('step_num_2', 4, 305, 220, 30, 20, '02', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.white, textAlign: 'center' }),
  text('step_lbl_2', 3, 280, 280, 180, 24, 'Light Somatics', { fontFamily: F.sans, fontWeight: '800', fontSize: 15, color: C.dark }),
  text('step_desc_2', 3, 280, 310, 180, 90, '15 minutes of gentle stretching or yoga to release tension.', { fontFamily: F.sans, fontSize: 12, color: C.grey, lineHeight: 1.4 }),

  // Step 3: Nourish
  shape('step_node_3', 3, 525, 215, 30, 30, { backgroundColor: C.secondary, border: `4px solid ${C.white}`, borderRadius: '50%' }),
  text('step_num_3', 4, 525, 220, 30, 20, '03', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.white, textAlign: 'center' }),
  text('step_lbl_3', 3, 500, 280, 180, 24, 'Whole Foods', { fontFamily: F.sans, fontWeight: '800', fontSize: 15, color: C.dark }),
  text('step_desc_3', 3, 500, 310, 180, 90, 'High-protein breakfast with organic fats to fuel energy.', { fontFamily: F.sans, fontSize: 12, color: C.grey, lineHeight: 1.4 }),

  // Step 4: Mindful
  shape('step_node_4', 3, 745, 215, 30, 30, { backgroundColor: C.secondary, border: `4px solid ${C.white}`, borderRadius: '50%' }),
  text('step_num_4', 4, 745, 220, 30, 20, '04', { fontFamily: F.sans, fontWeight: '800', fontSize: 11, color: C.white, textAlign: 'center' }),
  text('step_lbl_4', 3, 720, 280, 180, 24, 'Quiet Planning', { fontFamily: F.sans, fontWeight: '800', fontSize: 15, color: C.dark }),
  text('step_desc_4', 3, 720, 310, 180, 90, 'Journaling top goals before scanning workspace alerts.', { fontFamily: F.sans, fontSize: 12, color: C.grey, lineHeight: 1.4 }),

  // Bottom-left subtitle section
  text('step_footer_hdr', 3, 80, 440, 500, 30, 'Time to Recharge', { fontFamily: F.serif, fontWeight: '700', fontSize: 24, color: C.dark }),
  text('step_footer_desc', 3, 80, 480, 600, 120, 'Establish a calming rhythm that aligns your nervous system and supports natural biological flow. These routines lay a solid foundation for optimal energy.', { fontFamily: F.sans, fontSize: 14, color: C.grey, lineHeight: 1.6 }),

  // Bottom footer labels
  text('t_routine_footer', 3, 80, 650, 400, 30, 'Self-Care Routine for Busy Women', { fontFamily: F.sans, fontSize: 13, color: C.grey }),

  // Page index block
  shape('page_num_bg', 3, 1160, 630, 60, 40, { backgroundColor: C.secondary, borderRadius: '4px 0 0 4px' }),
  text('page_num_txt', 4, 1160, 640, 60, 24, '03', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.white, textAlign: 'center' }),
];

// ─── 04 · Nutrition Grid (Image 3 style) ─────────────────────────────────────
const scene04 = sceneBase('wellness_04', 4, 'Nutrition Grid', 'Nutrition', 'Left layout title with right 2x2 grid card panels matching reference flow.', 'Nutrition Grid → Habits Tracker', ['nutrition'], {
  title: { x: 80, y: 150, width: 320, height: 220 }
});
scene04.clips = [
  // Background wave & grid decoration
  shape('bg_wave_grid', 1, 0, 0, 420, H, { backgroundColor: 'rgba(253, 164, 175, 0.15)', borderRadius: '0 80% 80% 0 / 0 100% 100% 0' }),

  // Company logo
  image('img_logo', 10, 80, 60, 180, 36, 'wellness-logo'),

  // Left Title
  text('t_title', 2, 80, 150, 320, 220, "SUPERFOODS\n& NUTRITION", { fontFamily: F.serif, fontWeight: '700', fontSize: 36, color: C.secondary, lineHeight: 1.25 }, 'slide-title'),

  // Left side paragraphs
  text('nutri_hdr', 3, 80, 370, 320, 24, 'Essential hormone nourishers', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.secondary, letterSpacing: '0.05em' }),
  text('nutri_desc', 3, 80, 400, 320, 180, 'Cruciferous greens, organic fats, and clean hydration support stable hormones and constant daily energy.', { fontFamily: F.sans, fontSize: 14, color: C.grey, lineHeight: 1.5 }),

  // Grid item 1 (Healthy Fats)
  shape('g1_bg', 2, 450, 100, 260, 240, { backgroundColor: C.white, borderRadius: '8px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }),
  image('g1_img', 3, 450, 100, 260, 140, 'wellness-nutrition', { style: { borderRadius: '8px 8px 0 0', objectFit: 'cover' } }),
  text('g1_lbl', 3, 465, 255, 230, 24, 'Healthy Fats', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.secondary }),
  text('g1_desc', 3, 465, 280, 230, 50, 'Avocados, extra-virgin olive oil, and cold-pressed seeds supply stable lipids.', { fontFamily: F.sans, fontSize: 11, color: C.grey, lineHeight: 1.35 }),

  // Grid item 2 (Adaptogens)
  shape('g2_bg', 2, 740, 100, 260, 240, { backgroundColor: C.white, borderRadius: '8px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }),
  image('g2_img', 3, 740, 100, 260, 140, 'wellness-cover', { style: { borderRadius: '8px 8px 0 0', objectFit: 'cover' } }),
  text('g2_lbl', 3, 755, 255, 230, 24, 'Adaptogens', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.secondary }),
  text('g2_desc', 3, 755, 280, 230, 50, 'Ashwagandha and reishi extract target high cortisol spikes.', { fontFamily: F.sans, fontSize: 11, color: C.grey, lineHeight: 1.35 }),

  // Grid item 3 (Organic Greens)
  shape('g3_bg', 2, 450, 365, 260, 240, { backgroundColor: C.white, borderRadius: '8px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }),
  image('g3_img', 3, 450, 365, 260, 140, 'wellness-yoga', { style: { borderRadius: '8px 8px 0 0', objectFit: 'cover' } }),
  text('g3_lbl', 3, 465, 520, 230, 24, 'Organic Greens', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.secondary }),
  text('g3_desc', 3, 465, 545, 230, 50, 'Cruciferous vegetables support cellular recovery and liver health.', { fontFamily: F.sans, fontSize: 11, color: C.grey, lineHeight: 1.35 }),

  // Grid item 4 (Hydration)
  shape('g4_bg', 2, 740, 365, 260, 240, { backgroundColor: C.white, borderRadius: '8px', border: `1px solid ${C.line}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }),
  image('g4_img', 3, 740, 365, 260, 140, 'wellness-tracker', { style: { borderRadius: '8px 8px 0 0', objectFit: 'cover' } }),
  text('g4_lbl', 3, 755, 520, 230, 24, 'Hydration', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.secondary }),
  text('g4_desc', 3, 755, 545, 230, 50, 'Infusing trace minerals and electrolytes resets water delivery.', { fontFamily: F.sans, fontSize: 11, color: C.grey, lineHeight: 1.35 }),

  // Bottom footer labels
  text('t_nutri_footer', 3, 80, 650, 400, 30, 'Women Presentation', { fontFamily: F.sans, fontSize: 13, color: C.grey }),

  // Page index block
  shape('page_num_bg', 3, 1160, 630, 60, 40, { backgroundColor: C.secondary, borderRadius: '4px 0 0 4px' }),
  text('page_num_txt', 4, 1160, 640, 60, 24, '04', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.white, textAlign: 'center' }),
];

// ─── 05 · Habits Tracker (Image 4 style) ─────────────────────────────────────
const scene05 = sceneBase('wellness_05', 5, 'Self-Care Habits', 'Tracker', 'Left layout title with two large checklist cards on right and check badge.', 'Habits Tracker → Breathing Exercises & CTA', ['tracker'], {
  title: { x: 80, y: 150, width: 320, height: 220 }
});
scene05.clips = [
  // Background wave & grid decoration
  shape('bg_wave_tracker', 1, 0, 0, 420, H, { backgroundColor: 'rgba(253, 164, 175, 0.15)', borderRadius: '0 80% 80% 0 / 0 100% 100% 0' }),

  // Company logo
  image('img_logo', 10, 80, 60, 180, 36, 'wellness-logo'),

  // Left Title
  text('t_title', 2, 80, 150, 320, 220, "DAILY WELLNESS\nHABITS", { fontFamily: F.serif, fontWeight: '700', fontSize: 36, color: C.secondary, lineHeight: 1.25 }, 'slide-title'),

  // Left descriptions
  text('tracker_hdr', 3, 80, 370, 320, 24, 'Consistency Tracker', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.secondary, letterSpacing: '0.05em' }),
  text('tracker_desc', 3, 80, 400, 320, 180, 'Consistency is key to biological recovery. Checking off these self-care rituals daily builds lasting neuroplasticity.', { fontFamily: F.sans, fontSize: 14, color: C.grey, lineHeight: 1.5 }),

  // Top Card panel (checklists)
  shape('card_top', 2, 500, 100, 480, 205, { backgroundColor: C.secondary, borderRadius: '16px' }),
  text('t_top_lbl', 3, 520, 115, 440, 24, 'VITAL CHECKLIST', { fontFamily: F.sans, fontWeight: '850', fontSize: 13, color: C.white, letterSpacing: '0.08em' }),
  text('chk_1', 3, 520, 145, 440, 24, '✔ Slept 8 hours last night', { fontFamily: F.sans, fontSize: 14, color: C.white }),
  text('chk_2', 3, 520, 175, 440, 24, '✔ Drank 2.5 liters of clean water', { fontFamily: F.sans, fontSize: 14, color: C.white }),
  text('chk_3', 3, 520, 205, 440, 24, '✔ Took adaptogen mineral supplements', { fontFamily: F.sans, fontSize: 14, color: C.white }),

  // Bottom Card panel (checklists)
  shape('card_bottom', 2, 500, 355, 480, 205, { backgroundColor: C.secondary, borderRadius: '16px' }),
  text('t_bot_lbl', 3, 520, 370, 440, 24, 'MINDFULNESS & MOTION', { fontFamily: F.sans, fontWeight: '850', fontSize: 13, color: C.white, letterSpacing: '0.08em' }),
  text('chk_4', 3, 520, 405, 440, 24, '✔ Finished 15 min somatic stretch', { fontFamily: F.sans, fontSize: 14, color: C.white }),
  text('chk_5', 3, 520, 435, 440, 24, '✔ Completed 10 min quiet reflection', { fontFamily: F.sans, fontSize: 14, color: C.white }),
  text('chk_6', 3, 520, 465, 440, 24, '✔ Aligned daily workflow speed', { fontFamily: F.sans, fontSize: 14, color: C.white }),

  // Mid circle checkmark badge (replacing "VS" element)
  shape('mid_circle_bg', 4, 715, 305, 50, 50, { backgroundColor: C.white, border: `3px solid ${C.secondary}`, borderRadius: '50%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }),
  image('mid_chk', 5, 727, 317, 26, 26, 'check'),

  // Bottom footer labels
  text('t_tracker_footer', 3, 80, 650, 400, 30, 'Women Presentation', { fontFamily: F.sans, fontSize: 13, color: C.grey }),

  // Page index block
  shape('page_num_bg', 3, 1160, 630, 60, 40, { backgroundColor: C.secondary, borderRadius: '4px 0 0 4px' }),
  text('page_num_txt', 4, 1160, 640, 60, 24, '05', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.white, textAlign: 'center' }),
];

// ─── 06 · Breathing Exercises & CTA (Image 5 style) ──────────────────────────
const scene06 = sceneBase('wellness_06', 6, 'Calm & CTA', 'CTA', 'Left title & image with right exercise block and solid pink CTA bottom card.', 'CTA → End', ['cta', 'breathing'], {
  title: { x: 80, y: 110, width: 500, height: 60 }
});
scene06.clips = [
  // Company logo
  image('img_logo', 10, 80, 60, 180, 36, 'wellness-logo'),

  // Left Title
  text('t_title', 2, 80, 110, 500, 60, 'BREATHE IN, LET GO', { fontFamily: F.serif, fontWeight: '700', fontSize: 36, color: C.dark }, 'slide-title'),

  // Left-bottom illustration image
  image('img_calm', 2, 64, 190, 420, 390, 'wellness-yoga', { style: { borderRadius: '24px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' } }),

  // Right-side top exercise technique blocks
  text('exercise_lbl', 3, 520, 110, 480, 30, '4-7-8 CALMING TECHNIQUE', { fontFamily: F.sans, fontWeight: '850', fontSize: 13, color: C.secondary, letterSpacing: '0.08em' }),
  text('exercise_desc', 3, 520, 140, 480, 140, '01. Inhale (4s): Breathe in quietly through the nose.\n02. Hold (7s): Hold your breath, relaxing the shoulders.\n03. Exhale (8s): Exhale completely making a whoosh sound.', { fontFamily: F.sans, fontSize: 14, color: C.grey, lineHeight: 1.6 }),

  // Right-side bottom solid CTA card
  shape('cta_card', 2, 520, 290, 480, 290, { backgroundColor: C.secondary, borderRadius: '16px', boxShadow: '0 12px 32px rgba(244,114,182,0.25)' }),
  text('card_badge', 3, 550, 320, 420, 30, 'JOIN WELLNESS CIRCLE', { fontFamily: F.sans, fontWeight: '850', fontSize: 18, color: C.white, letterSpacing: '0.08em' }),
  text('card_sub', 3, 550, 365, 420, 90, 'Sync with our community for daily breathing cues, self-care routines, and hormone-alignment support guides.', { fontFamily: F.sans, fontSize: 14, color: C.white, lineHeight: 1.5 }),

  // Button inside the CTA card
  shape('btn_bg', 3, 550, 490, 180, 46, { backgroundColor: C.white, borderRadius: '8px', cursor: 'pointer' }),
  text('btn_lbl', 4, 550, 503, 180, 24, 'JOIN CIRCLE', { fontFamily: F.sans, fontWeight: '800', fontSize: 13, color: C.secondary, textAlign: 'center', letterSpacing: '0.05em' }),

  // Footer guarantee subtext
  text('card_guarantee', 3, 760, 504, 210, 20, '100% Free Community', { fontFamily: F.sans, fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'right' }),

  // Page index block
  shape('page_num_bg', 3, 1160, 630, 60, 40, { backgroundColor: C.secondary, borderRadius: '4px 0 0 4px' }),
  text('page_num_txt', 4, 1160, 640, 60, 24, '06', { fontFamily: F.sans, fontWeight: '800', fontSize: 14, color: C.white, textAlign: 'center' }),
];

// Finalize scenes
[scene01, scene02, scene03, scene04, scene05, scene06].forEach((scene, i) => {
  // Use solid backgrounds, with Slide 3 getting gradient to match "Night Routine"
  finalizeScene(scene, i === 2 ? 'bg-gradient-rose' : 'bg-cream');
});

const template = {
  category: 'Courses',
  template: {
    id: 'womens-wellness',
    name: "Women's Wellness",
    category: 'Courses',
    theme: assets.theme,
    totalSlides: 6,
    canvasSize: { width: W, height: H },
    aspectRatio: '16:9',
    colorPalette: C,
    description: "A beautiful 6-slide pink-themed hormone harmony and wellness self-care tracker presentation bundle.",
  },
  scenes: [scene01, scene02, scene03, scene04, scene05, scene06],
};

writeFileSync(OUT, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT} (${template.scenes.length} scenes)`);
