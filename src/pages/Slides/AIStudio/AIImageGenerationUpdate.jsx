import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, Search, Image as ImageIcon,
  ChevronDown, Mic, Sparkles, X, Lightbulb,
  ListOrdered, Clock, Columns2, BarChart3, Network, List, RefreshCw, Hexagon, Library,
  Share2, Printer, CreditCard, Mail, Check
} from 'lucide-react';
import { FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import imageGenService from '../../../services/imageGenService.js';
import creditsService from '../../../services/creditsService.js';
import LogoImg from '../../../assets/herologo.png';
import geminiLogo from '../../../assets/google_gemini_logo.svg';
import chatgptLogo from '../../../assets/chatgpt_logo.svg';
import youtubeThumbPreview from '../../../assets/ai-img-gen/Youtube_thumbnail.png';
import instagramPostPreview from '../../../assets/ai-img-gen/Instagram_post.png';
import facebookPostPreview from '../../../assets/ai-img-gen/facebook_post.png';
import facebookCoverPreview from '../../../assets/ai-img-gen/Facebook_banner.png';
import youtubeBannerPreview from '../../../assets/ai-img-gen/Insta_landscape.png';
import twitterPostPreview from '../../../assets/ai-img-gen/X_Twitter_Post.png';
import linkedinBannerPreview from '../../../assets/ai-img-gen/Linkedin_Banner.png';

import OriginalAIImageStudio from './AIImageStudio.jsx';
import AIConversationalStudio from './AIConversationalStudio.jsx';
import WorkspaceImageLibrary from './WorkspaceImageLibrary.jsx';
import ImageGenStudioSettings from '../../../components/features/image-generation/ImageGenStudioSettings.jsx';
import ImageGenCreditsGate from '../../../components/features/image-generation/ImageGenCreditsGate.jsx';
import ImageGenContextAttach from '../../../components/features/image-generation/ImageGenContextAttach.jsx';
import MarkdownPromptInput from '../../../components/features/image-generation/MarkdownPromptInput.jsx';
import RecentChatMenu from './RecentChatMenu.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import '../../../components/features/image-generation/MarkdownPromptInput.css';
import { checkImageGenCredits } from '../../../utils/imageGenCreditsCheck.js';
import { defaultImageGenModelId, modelsForImageGenMode, isDraftQualityModel } from '../../../utils/imageGenDefaults.js';

import style3dImg from '../../../assets/slides_icons/style_3d.jpg';
import styleBauhausImg from '../../../assets/slides_icons/style_bauhaus.jpg';
import styleBoldPosterImg from '../../../assets/slides_icons/style_bold_poster.jpg';
import styleCinematicImg from '../../../assets/slides_icons/style_cinematic.jpg';
import styleFlatLineImg from '../../../assets/slides_icons/style_flat_line.jpg';
import styleGouacheImg from '../../../assets/slides_icons/style_gouache.jpg';
import styleIllustrationImg from '../../../assets/slides_icons/style_illustration.jpg';
import styleIsometricImg from '../../../assets/slides_icons/style_isometric.jpg';
import styleMeshImg from '../../../assets/slides_icons/style_mesh.jpg';
import styleModernArtImg from '../../../assets/slides_icons/style_modern_art.jpg';
import styleNeonGlowImg from '../../../assets/slides_icons/style_neon_glow.jpg';
import stylePhotoImg from '../../../assets/slides_icons/style_photo.jpg';
import styleSceneImg from '../../../assets/slides_icons/style_scene.jpg';
import styleSpotColorImg from '../../../assets/slides_icons/style_spot_color.jpg';
import styleStillLifeImg from '../../../assets/slides_icons/style_still_life.jpg';
import styleWatercolorImg from '../../../assets/slides_icons/style_watercolor.jpg';
import formatPortraitImg from '../../../assets/ai-img-gen/format-portrait.jpg';
import formatLandscapeImg from '../../../assets/ai-img-gen/format-landscape.jpg';
import formatSquareImg from '../../../assets/ai-img-gen/format-square.jpg';
import printA4Preview from '../../../assets/ai-img-gen/print-a4.jpg';
import printA3Preview from '../../../assets/ai-img-gen/print-a3.jpg';
import printA2Preview from '../../../assets/ai-img-gen/print-a2.jpg';
import printBusinessCardPreview from '../../../assets/ai-img-gen/print-business-card.jpg';
import printInvitationPreview from '../../../assets/ai-img-gen/print-invitation.jpg';

import layoutProcess from '../../../assets/layouts/layout_process_v2.jpg';
import layoutTimeline from '../../../assets/layouts/layout_timeline_v2.jpg';
import layoutComparison from '../../../assets/layouts/layout_comparison_v2.jpg';
import layoutStats from '../../../assets/layouts/layout_stats_v2.jpg';
import layoutHierarchy from '../../../assets/layouts/layout_hierarchy_v2.jpg';
import layoutList from '../../../assets/layouts/layout_list_v2.jpg';
import layoutCycle from '../../../assets/layouts/layout_cycle_v2.jpg';

const layoutImages = {
  process: layoutProcess,
  timeline: layoutTimeline,
  comparison: layoutComparison,
  stats: layoutStats,
  hierarchy: layoutHierarchy,
  list: layoutList,
  cycle: layoutCycle
};

const SOCIAL_DESTINATION_FALLBACK = [
  { id: 'youtube-thumbnail', name: 'YouTube thumbnail', platform: 'youtube', width: 1280, height: 720 },
  { id: 'instagram-post', name: 'Instagram post', platform: 'instagram', width: 1080, height: 1350 },
  { id: 'facebook-post', name: 'Facebook post', platform: 'facebook', width: 940, height: 788 },
  { id: 'facebook-cover', name: 'Facebook cover', platform: 'facebook', width: 851, height: 315 },
  { id: 'youtube-banner', name: 'YouTube banner', platform: 'youtube', width: 2560, height: 1440 },
  { id: 'twitter-post', name: 'X / Twitter post', platform: 'twitter', width: 1600, height: 900 },
  { id: 'linkedin-banner', name: 'LinkedIn banner', platform: 'linkedin', width: 1584, height: 396 },
];

const MODE_SWITCHES = [
  { id: 'image', label: 'Image', fullName: 'Images', Icon: ImageIcon },
  { id: 'infographic', label: 'Info', fullName: 'Infographics', Icon: BarChart3 },
  { id: 'social', label: 'Social', fullName: 'Social', Icon: Share2 },
  { id: 'printable', label: 'Print', fullName: 'Print', Icon: Printer },
];

function formatServesMode(format, mode) {
  const modes = Array.isArray(format?.modes) ? format.modes : [];
  if (modes.length) return modes.includes(mode);
  return false;
}

const SOCIAL_DESTINATION_IDS = SOCIAL_DESTINATION_FALLBACK.map((d) => d.id);

function socialDestinationsFrom(formats = []) {
  const fromApi = (Array.isArray(formats) ? formats : []).filter(
    (f) => formatServesMode(f, 'social') && SOCIAL_DESTINATION_IDS.includes(f.id)
  );
  const byId = new Map(fromApi.map((f) => [f.id, f]));
  return SOCIAL_DESTINATION_FALLBACK.map((fallback) => {
    const hit = byId.get(fallback.id);
    if (!hit) return fallback;
    return {
      ...fallback,
      ...hit,
      name: hit.name || fallback.name,
      platform: hit.platform || fallback.platform,
      width: hit.width || fallback.width,
      height: hit.height || fallback.height,
    };
  });
}

const PRINTABLE_FORMAT_FALLBACK = [
  {
    id: 'poster-a4-portrait',
    name: 'A4 poster',
    modes: ['printable'],
    print: { kind: 'poster', series: 'a4', orientation: 'portrait', widthMm: 210, heightMm: 297, dpi: 300 },
  },
  {
    id: 'poster-a4-landscape',
    name: 'A4 poster',
    modes: ['printable'],
    print: { kind: 'poster', series: 'a4', orientation: 'landscape', widthMm: 297, heightMm: 210, dpi: 300 },
  },
  {
    id: 'poster-a3-portrait',
    name: 'A3 poster',
    modes: ['printable'],
    print: { kind: 'poster', series: 'a3', orientation: 'portrait', widthMm: 297, heightMm: 420, dpi: 150 },
  },
  {
    id: 'poster-a3-landscape',
    name: 'A3 poster',
    modes: ['printable'],
    print: { kind: 'poster', series: 'a3', orientation: 'landscape', widthMm: 420, heightMm: 297, dpi: 150 },
  },
  {
    id: 'poster-a2-portrait',
    name: 'A2 poster',
    modes: ['printable'],
    print: { kind: 'poster', series: 'a2', orientation: 'portrait', widthMm: 420, heightMm: 594, dpi: 150 },
  },
  {
    id: 'poster-a2-landscape',
    name: 'A2 poster',
    modes: ['printable'],
    print: { kind: 'poster', series: 'a2', orientation: 'landscape', widthMm: 594, heightMm: 420, dpi: 150 },
  },
  {
    id: 'business-card',
    name: 'Business card',
    modes: ['printable'],
    print: { kind: 'business-card', orientation: 'landscape', widthIn: 3.5, heightIn: 2, widthMm: 89, heightMm: 51, dpi: 300 },
  },
  {
    id: 'invitation-a6-portrait',
    name: 'Invitation',
    modes: ['printable'],
    print: { kind: 'invitation', series: 'a6', orientation: 'portrait', widthMm: 105, heightMm: 148, dpi: 300 },
  },
];

const PRINT_GROUPS = [
  { id: 'a4', label: 'A4 poster', kind: 'poster', series: 'a4', hint: 'Headline ≤ 60 · 4 details · CTA ≤ 40' },
  { id: 'a3', label: 'A3 poster', kind: 'poster', series: 'a3', hint: 'Headline ≤ 60 · 4 details · CTA ≤ 40' },
  { id: 'a2', label: 'A2 poster', kind: 'poster', series: 'a2', hint: 'Headline ≤ 60 · 4 details · CTA ≤ 40' },
  { id: 'business-card', label: 'Business card', kind: 'business-card', formatId: 'business-card', hint: 'Name ≤ 40 · 4 contact lines' },
  { id: 'invitation', label: 'Invitation', kind: 'invitation', formatId: 'invitation-a6-portrait', hint: 'Headline ≤ 60 · 5 details · CTA ≤ 40' },
];

function printPreviewFor(group) {
  if (group?.kind === 'business-card') return printBusinessCardPreview;
  if (group?.kind === 'invitation') return printInvitationPreview;
  if (group?.id === 'a4') return printA4Preview;
  if (group?.id === 'a3') return printA3Preview;
  if (group?.id === 'a2') return printA2Preview;
  return printA4Preview;
}

function printablesFrom(formats = []) {
  const fromApi = formats.filter((f) => formatServesMode(f, 'printable') && f?.print);
  const base = fromApi.length ? fromApi : PRINTABLE_FORMAT_FALLBACK;
  const byId = new Map(base.map((f) => [f.id, f]));
  PRINTABLE_FORMAT_FALLBACK.forEach((fb) => {
    if (!byId.has(fb.id)) byId.set(fb.id, fb);
  });
  return [...byId.values()];
}

function printSizeLabel(print = {}) {
  if (print.widthIn && print.heightIn) return `${print.widthIn}×${print.heightIn} in`;
  if (print.widthMm && print.heightMm) return `${print.widthMm}×${print.heightMm} mm`;
  return '';
}

function printChipLabel(format) {
  if (!format) return '';
  const print = format.print || {};
  const kind = String(print.kind || '').replace(/_/g, '-');
  const series = print.series || String(format.id || '').split('-')[1];
  const group = PRINT_GROUPS.find((g) => {
    if (g.formatId) return g.formatId === format.id;
    return g.kind === kind && g.series === series;
  });
  return group?.label || String(format.name || format.id).replace(/\s*\([^)]*\)\s*$/, '');
}

function printFormatForGroup(group, formats, orientation) {
  if (!group) return null;
  if (group.formatId) return formats.find((f) => f.id === group.formatId) || null;
  const prefix = group.kind === 'invitation' ? 'invitation' : 'poster';
  const id = `${prefix}-${group.series}-${orientation}`;
  return formats.find((f) => f.id === id) || null;
}

function printOrientsForGroup(group) {
  if (!group) return ['portrait', 'landscape'];
  if (group.kind === 'business-card') return ['landscape'];
  if (group.kind === 'invitation') return ['portrait'];
  return ['portrait', 'landscape'];
}

function printGroupForFormat(format) {
  if (!format) return null;
  const print = format.print || {};
  const kind = String(print.kind || '').replace(/_/g, '-');
  const series = print.series || String(format.id || '').split('-')[1];
  return PRINT_GROUPS.find((g) => {
    if (g.formatId) return g.formatId === format.id;
    return g.kind === kind && g.series === series;
  }) || null;
}

const SOCIAL_PREVIEW = {
  'youtube-thumbnail': youtubeThumbPreview,
  'instagram-post': instagramPostPreview,
  'facebook-post': facebookPostPreview,
  'facebook-cover': facebookCoverPreview,
  'youtube-banner': youtubeBannerPreview,
  'twitter-post': twitterPostPreview,
  'linkedin-banner': linkedinBannerPreview,
};

function socialPreviewShape(dest) {
  const id = dest.id || '';
  const ratio = Number(dest.width) / Math.max(Number(dest.height) || 1, 1);
  if (id.includes('instagram') || ratio < 0.85) return 'portrait';
  if (id.includes('cover') || id.includes('banner') || id.includes('linkedin') || ratio > 2.2) return 'banner';
  return 'landscape';
}
function resolveSocialPlatform(chat) {
  const direct = String(chat?.platform || chat?.head?.platform || '').toLowerCase();
  if (direct) return direct;
  const fid = String(chat?.formatId || chat?.head?.formatId || '').toLowerCase();
  if (fid.includes('instagram')) return 'instagram';
  if (fid.includes('facebook')) return 'facebook';
  if (fid.includes('linkedin')) return 'linkedin';
  if (fid.includes('twitter') || fid.startsWith('x-') || fid.includes('x-twitter')) return 'twitter';
  if (fid.includes('youtube')) return 'youtube';
  return '';
}

function SocialPlatformIcon({ platform, size = 16 }) {
  const key = String(platform || '').toLowerCase();
  const s = { width: size, height: size, flexShrink: 0 };
  if (key.includes('youtube')) return <FaYoutube style={{ ...s, color: '#FF0000' }} title="YouTube" />;
  if (key.includes('instagram')) return <FaInstagram style={{ ...s, color: '#E4405F' }} title="Instagram" />;
  if (key.includes('facebook')) return <FaFacebookF style={{ ...s, color: '#1877F2' }} title="Facebook" />;
  if (key.includes('linkedin')) return <FaLinkedinIn style={{ ...s, color: '#0A66C2' }} title="LinkedIn" />;
  if (key.includes('twitter') || key === 'x') return <FaXTwitter style={{ ...s, color: '#111827' }} title="X" />;
  return <Share2 size={size} />;
}

import './AIImageGenerationUpdate.css';
import InfographicAnimatedBackground from './InfographicAnimatedBackground.jsx';

const RANDOM_PROMPTS = [
  "A square brand poster for an artisanal coffee shop. One ceramic cup of latte with a clear fern latte-art pattern, sitting on pale oak, warm beige and mocha palette. Soft window light from the left, shallow depth of field, a few coffee beans scattered, no people. Clean empty space at the top for a short shop name. Photoreal, quiet, premium, not a collage.",
  "Cinematic night photo inside a small futuristic cafe. A single cup of coffee on a brushed-metal table, steam rising, rain on the window behind it. Neon pink and cyan light only, reflections on the wet table, one empty stool, no readable signs. Shot on a 35mm lens, moody, sharp subject, dark background.",
  "A wide fantasy landscape of three floating islands linked by glowing vines. Waterfalls drop from the islands into a starry sky. Purple and deep blue twilight, soft fog in the valleys, one tiny lantern on the nearest island so the scale is clear. Detailed 3D illustration, no text, no characters in the foreground.",
  "Pop-art illustration of a cream vintage sports car on a coastal highway at sunset. Bold flat shapes, thick black outlines, colors limited to bright yellow, deep teal, and crimson. Ocean on the right, sun low on the horizon, car large in the frame, graphic and clean, not photoreal.",
  "Macro photograph of one dewdrop on a bright green fern in a misty forest. The drop clearly reflects tall trees. Soft morning light, dark blurred background, extremely sharp leaf veins, natural colors, no insects, no text.",
  "Isometric 3D view of a small lo-fi music studio. Analog synthesizer, a short stack of vinyl, sheet music on the desk, warm lamp, a gray cat asleep on a vintage rug. Cozy evening light, wooden floor, cables neatly visible, no people, no readable album titles.",
  "Fashion photo of one model standing in a rain-soaked Tokyo alley at night. Black coat, neon signs reflected in puddles, wet pavement, shallow depth of field, cinematic teal and amber grade. Model looking slightly off camera, full outfit visible, no logos, no extra people.",
  "Editorial food photo of a sliced citrus tart on a marble counter. Overhead three-quarter angle, linen napkin, one fork, scattered zest, bright natural daylight, airy white background. Sharp texture on the crust, appetizing, no text, no hands.",
];

const RANDOM_INFOGRAPHIC_PROMPTS = [
  "A high-level business workflow infographic comparing Q3 revenue vs Q4 projections, using a clean corporate blue color palette.",
  "A modern technology stack timeline showing the evolution from Web 1.0 to Web 3.0, with isometric icons and a dark mode aesthetic.",
  "An educational hierarchy chart breaking down the layers of a neural network model, styled in a sleek, scientific medical visualization style.",
  "A playful, colorful step-by-step process guide for planting an indoor garden, with soft pastel backgrounds and organic shapes.",
  "A professional statistical breakdown of global renewable energy usage, featuring bold typography, large numbers, and minimalist graphs.",
  "A side-by-side product comparison chart showing the features of a smart home ecosystem, using translucent glassmorphism containers and neon accents.",
];

const INFOGRAPHIC_PROMPTS_BY_LAYOUT = {
  process: [
    "A 5-step onboarding infographic for a SaaS product, left to right. Steps labeled Sign up, Connect data, Invite team, Set goals, Go live. Each step is a numbered rounded card with one simple icon, a short one-line description under the title, and an arrow to the next card. White background, navy and sky blue, lots of margin, flat vector, no photos, no tiny unreadable text.",
    "A manufacturing process infographic from raw material to finished product, four stages: Source, Shape, Assemble, Ship. Isometric machines, muted steel and amber palette, a short label under each stage, a thin arrow between stages. Clean poster layout, one title at the top, no photographs.",
  ],
  timeline: [
    "A horizontal timeline infographic from 2018 to 2026 with five milestones: Launch, First customers, Series A, New product, Global rollout. Thin navy line, gold dots, a year and a two-word label on each milestone, white background, corporate and spacious, no photos.",
    "A company-history timeline with five eras on one horizontal line. Each era has a year, a short title, and one small archival-style icon. Cream background, charcoal text, clear spacing so every label is readable.",
  ],
  comparison: [
    "A two-column comparison infographic, Plan A versus Plan B, for remote work. Equal columns, cool blue on the left and warm orange on the right. Five rows: cost, flexibility, tools, support, best for. Each row has a short phrase and a simple check or minus icon. Title at the top, white background, no photos.",
    "A split before-and-after infographic of one city block. Left side labeled Before: gray street, few trees. Right side labeled After: bike lane, trees, benches. Same camera angle on both halves, clean vector buildings, a short caption under each half, no tiny street text.",
  ],
  stats: [
    "A dark dashboard infographic with four large KPI cards: Revenue, Users, Retention, Support time. Each card has one big number, a one-word label, and a thin bar underneath. Teal accents on charcoal, aligned grid, no photos, no paragraphs.",
    "An energy-mix infographic with one donut chart and three horizontal bars for Solar, Wind, and Other. Big readable percentages, teal and charcoal, white background, a short title, plenty of empty margin.",
  ],
  hierarchy: [
    "A top-down org chart for a product team. One card at the top labeled Product lead, then three cards: Design, Engineering, Research, then two smaller cards under Engineering. Rounded cards, short role titles only, soft gray connectors, white background.",
    "A four-layer pyramid infographic of skills: Fundamentals, Practice, Projects, Expert. Widest layer at the bottom, a short label centered in each layer, pastel blue to deep indigo, educational and simple, no extra icons crowding the labels.",
  ],
  list: [
    "A vertical list infographic of 6 weekend packing tips. Numbered rows 1 to 6, each with a small travel icon, a short title, and one short line of advice. Airy white layout, navy text, even spacing, no photos.",
    "A ranked list infographic of 7 workplace benefits, numbers 1 to 7 down the page. Each row has a simple icon, a benefit name, and a five-word description. Mint and navy, lots of space, poster-clear type.",
  ],
  cycle: [
    "A circular 4-stage design-sprint infographic around an empty center. Stages labeled Understand, Sketch, Decide, Test, with a curved arrow from each to the next. One isometric icon per stage, lavender and slate, white background, labels outside the circle so they stay readable.",
    "A six-segment improvement cycle: Plan, Do, Check, Learn, Adjust, Repeat. Equal slices, a short label in each slice, arrows showing the loop, clean line icons, light gray background, no paragraphs.",
  ],
};

const RANDOM_SOCIAL_PROMPTS = [
  "A bold social post announcing a summer product drop, bright sunlight, lifestyle photography, room for a short headline.",
  "A clean promotional graphic for a Monday motivation quote, soft gradient, generous empty space for overlay text.",
  "A cinematic still of friends at a rooftop cafe at golden hour, shallow depth of field, ready for a social caption.",
];

const SOCIAL_PROMPTS_BY_DESTINATION = {
  'youtube-thumbnail': [
    "YouTube thumbnail, 16:9. A creator on the right third, eyes wide, looking at a glowing laptop. Face large and sharp, dark background, one strong pink rim light. The entire left half is empty dark space for a 4-word title. High contrast, no tiny text, no logos, no clutter.",
    "YouTube thumbnail for a cooking video. Close-up skillet with a tall flame, chef’s face in the lower right, surprised expression. Dark kitchen so a bold title can sit across the top. Saturated food colors, sharp, not a collage.",
  ],
  'instagram-post': [
    "Vertical Instagram post. Skincare flat-lay on warm travertine: one bottle, one dropper, a linen cloth. Soft side daylight, calm beige palette. Leave a clear empty band across the bottom third for a product name. No faces, no logos, no busy pattern.",
    "Vertical Instagram photo of one vintage camera on a linen table, film grain, muted sage and cream. Camera sharp, background soft. Empty space above the camera for a short headline. Natural light, no extra props.",
  ],
  'facebook-post': [
    "Facebook post photo of a weekend night market. String lights overhead, one food stall in the center, warm amber light, a few people softly out of focus. Leave a clean strip along the bottom for one promo line. Inviting, not crowded, no readable shop signs.",
    "Facebook post photo of a bright new office on opening morning. One person at a plant-filled desk, large windows, friendly daylight. Subject on the right, open wall on the left for a short event line. No logos.",
  ],
  'facebook-cover': [
    "Extra-wide Facebook cover of a coastal road at dusk. The road and car sit on the right. The left third is open sky and sea so a logo can sit there. Cinematic, quiet, no text in the image, no crowded foreground.",
    "Extra-wide Facebook cover of a sunlit co-working loft. People blurred in the background, plants and wood in the middle. Keep the upper-left area simple and bright for a brand name. Natural light, no signage.",
  ],
  'youtube-banner': [
    "Very wide YouTube channel banner. A creator studio: camera and softbox on the far left, shelves on the far right. The center third is a clean wall with even light so a channel name can sit there. Cinematic, no text, no faces cut off at the edges.",
    "Very wide YouTube banner made of a smooth gradient mesh in deep blue and warm amber. No objects in the center safe area. Subtle texture only at the far left and right edges. No text, no logos.",
  ],
  'twitter-post': [
    "Landscape X post. One new product, a matte black speaker, on a dark desk, single neon accent light from the left. Product large and centered, empty lower third for a one-line hook. Sharp, premium, no extra gadgets, no text.",
    "Landscape X post of a city skyline at blue hour, shot straight on, crisp buildings, one warm window cluster as the focal point. Empty darker band along the bottom for overlay text. News-photo clarity, no captions baked in.",
  ],
  'linkedin-banner': [
    "Extra-wide LinkedIn banner of a calm concrete-and-glass office interior in daylight. Furniture sits on the right. The left third is a plain bright wall for a name and title. Professional, quiet, no people in the foreground, no text.",
    "Extra-wide LinkedIn cover of geometric glass panels in navy and white. Simple, corporate, large empty area on the left for a name. No photos of people, no small patterns, no words in the image.",
  ],
};

function pickRandom(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return list[Math.floor(Math.random() * list.length)];
}

function pickInspirePrompt(mode, layoutId, formatId, platform) {
  if (mode === 'infographic') {
    const keyed = layoutId ? INFOGRAPHIC_PROMPTS_BY_LAYOUT[String(layoutId).toLowerCase()] : null;
    if (keyed?.length) return pickRandom(keyed);
    return pickRandom(RANDOM_INFOGRAPHIC_PROMPTS);
  }
  if (mode === 'social') {
    const byId = formatId ? SOCIAL_PROMPTS_BY_DESTINATION[formatId] : null;
    if (byId?.length) return pickRandom(byId);
    const plat = String(platform || '').toLowerCase();
    const byPlat =
      plat.includes('youtube') ? SOCIAL_PROMPTS_BY_DESTINATION['youtube-thumbnail']
      : plat.includes('instagram') ? SOCIAL_PROMPTS_BY_DESTINATION['instagram-post']
      : plat.includes('facebook') ? SOCIAL_PROMPTS_BY_DESTINATION['facebook-post']
      : plat.includes('linkedin') ? SOCIAL_PROMPTS_BY_DESTINATION['linkedin-banner']
      : plat.includes('twitter') || plat === 'x' ? SOCIAL_PROMPTS_BY_DESTINATION['twitter-post']
      : null;
    if (byPlat?.length) return pickRandom(byPlat);
    return pickRandom(RANDOM_SOCIAL_PROMPTS);
  }
  if (mode === 'printable') {
    const id = String(formatId || '');
    if (id.includes('business-card')) {
      return pickRandom([
        'Front of a business card for Maya Chen, Product Designer at Athena VI. Show the name large, the role under it, then maya@athenavi.com, +91 98765 43210, athenavi.com, Bengaluru. Cream paper, one thin navy rule, lots of margin, real readable type, no fake logos, no photo.',
        'Front of a business card for Dr. Arjun Mehta, Cardiology, Fortis Heart Clinic. Name large, specialty under it, then 080 2222 1100 and reception@fortisheart.in. White card, deep green accent, quiet and medical, every word readable, no clip art.',
      ]);
    }
    if (id.includes('invitation')) {
      return pickRandom([
        'Wedding invitation card for Priya and Rohan’s reception. Centered serif type, names largest, then 18 October 2026, 7:00 PM, The Leela Palace Bengaluru, RSVP +91 99887 76655. Ivory paper, a thin floral border, generous margins, every line readable.',
        'Dinner invitation for the Athena Learning Summit. Title at the top, then 14 November 2026, 8:00 PM, Bengaluru International Centre, RSVP events@athenavi.com. Navy text on warm white, one gold line, formal and spacious, no photos.',
      ]);
    }
    if (id.includes('poster')) {
      return pickRandom([
        'A portrait event poster for the Athena Learning Summit. Huge title, then 14–15 November 2026, Bengaluru International Centre, and Register at athenavi.com/summit near the bottom. Deep blue background, one gold accent, large readable type, no stock photos of crowds.',
        'A recruitment poster for Athena VI internships. Headline, then apply by 30 October 2026, careers@athenavi.com, walk-in 10 AM–4 PM. White poster, bold black type, one blue block behind the headline, clear hierarchy, no tiny paragraphs.',
      ]);
    }
    return pickRandom([
      'Poster for a weekend pottery workshop, 22 November 2026, 11 AM–4 PM, Indiranagar Studio, tickets claylab.in/weekend.',
      'Invitation to a product launch evening, 5 December 2026, 6:30 PM, UB City gallery. RSVP hello@athenavi.com.',
    ]);
  }
  return pickRandom(RANDOM_PROMPTS);
}

const TOPICS = [
  'Modern Product Launch',
  'Futuristic Cyberpunk City',
  'Minimalist Bauhaus Poster',
  'Isometric 3D Workspace',
  'Surreal Nature Landscape',
  'Vibrant Pop Art Portrait',
  'Cinematic Sci-Fi Concept'
];

const INFOGRAPHIC_TOPICS = ['Presentations', 'Reports', 'Dashboards', 'Timelines', 'Workflows', 'Mind Maps'];

const SOCIAL_TOPICS = ['YouTube thumbnail', 'Instagram post', 'Facebook cover', 'LinkedIn banner', 'X post'];

const PRINT_TOPICS = ['A4 poster', 'A3 poster', 'business card', 'invitation', 'A2 poster'];
export default function AIImageGenerationUpdate({ onBack, onOpenBilling, onNavigateLibrary, createContext }) {
  const [saveWorkspaceId, setSaveWorkspaceId] = useState(
    createContext?.workspaceId || createContext?.config?.workspaceId || '',
  );
  const [saveFolderId, setSaveFolderId] = useState(
    createContext?.folderId || createContext?.config?.folderId || '',
  );
  const [catalogs, setCatalogs] = useState({ models: [], formats: [], styles: [], archetypes: [] });
  const [activeMode, setActiveMode] = useState('image');
  const [printOrientation, setPrintOrientation] = useState('portrait');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [credits, setCredits] = useState(0);
  const [recentChats, setRecentChats] = useState([]);
  const [recentQuery, setRecentQuery] = useState('');
  const [recentMenuId, setRecentMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const chatboxRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [imageContext, setImageContext] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setPrompt((prev) => prev ? prev + ' ' + transcript : transcript);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return alert('Speech recognition not supported in this browser.');
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
        setIsComposerExpanded(false);
      }
      if (!event.target.closest('.custom-dropdown')) {
        setShowFormatDropdown(false);
        setShowModelDropdown(false);
        setShowStyleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [launchStudio, setLaunchStudio] = useState(false);
  const [creditsGate, setCreditsGate] = useState(null);
  const [creditsBusy, setCreditsBusy] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState('blue');
  const [backgroundMode, setBackgroundMode] = useState('dark');

  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [fadeTopic, setFadeTopic] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeTopic(false);
      setTimeout(() => {
        setTopicIndex(prev => (prev + 1) % TOPICS.length);
        setFadeTopic(true);
      }, 500); // 500ms fade duration
    }, 4000); // Change every 4s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const cats = await imageGenService.getCatalogs();
        setCatalogs(cats);
        const imageFormats = (cats.formats || []).filter((f) => formatServesMode(f, 'image'));
        const defaultFormat = imageFormats.find((f) => f.id === 'square') || imageFormats[0] || cats.formats[0];
        setSelectedModel(defaultImageGenModelId('image', cats));
        if (defaultFormat?.id) setSelectedFormat(defaultFormat.id);
      } catch(e) {
        console.error("Failed to load catalogs", e);
      }
    }
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [prompt]);

  const handleInspire = async () => {
    if (isTyping) return;
    const layoutId = activeMode === 'infographic' ? selectedStyle : '';
    const destId = activeMode === 'social' || activeMode === 'printable' ? selectedFormat : '';
    const dest = activeMode === 'social'
      ? socialDestinationsFrom(catalogs.formats).find((f) => f.id === selectedFormat)
      : null;
    const random = pickInspirePrompt(activeMode, layoutId, destId, dest?.platform);
    if (!random) return;
    setIsTyping(true);
    setPrompt('');
    let currentText = '';
    
    for (let i = 0; i < random.length; i++) {
      currentText += random[i];
      setPrompt(currentText);
      await new Promise(r => setTimeout(r, 20));
    }
    setIsTyping(false);
  };

  useEffect(() => {
    const nextWs = createContext?.workspaceId || createContext?.config?.workspaceId || '';
    const nextFld = createContext?.folderId || createContext?.config?.folderId || '';
    if (nextWs) setSaveWorkspaceId(nextWs);
    if (nextFld) setSaveFolderId(nextFld);
  }, [createContext?.workspaceId, createContext?.folderId, createContext?.config?.workspaceId, createContext?.config?.folderId]);

  const handleSaveLocationChange = ({ workspaceId, folderId }) => {
    setSaveWorkspaceId(workspaceId || '');
    setSaveFolderId(folderId || '');
  };

  const tryLaunchStudio = async () => {
    if (!prompt.trim() || creditsBusy || imageContext?.attaching) return;
    if ((activeMode === 'social' || activeMode === 'printable') && !selectedFormat) return;
    const wsId = saveWorkspaceId || createContext?.workspaceId || createContext?.config?.workspaceId;
    if (!wsId) {
      setLaunchStudio(true);
      return;
    }
    setCreditsBusy(true);
    try {
      const check = await checkImageGenCredits(wsId, {
        modelId: selectedModel,
        mode: activeMode,
      });
      if (!check.ok) {
        setCreditsGate({
          workspaceId: wsId,
          needed: check.needed,
          pool: check.pool,
          personal: check.personal,
          isTeam: check.isTeam,
        });
        return;
      }
      setLaunchStudio(true);
    } catch {
      setLaunchStudio(true);
    } finally {
      setCreditsBusy(false);
    }
  };

  const loadRecentChats = useCallback(async () => {
    try {
      const balance = saveWorkspaceId
        ? await creditsService.getWorkspaceBalance(saveWorkspaceId)
        : await creditsService.getPersonalBalance();
      setCredits(balance.workspaceCredits || balance.personalCredits || balance.credits || 0);

      if (!saveWorkspaceId) {
        setRecentChats([]);
        return;
      }
      const history = await imageGenService.listThreads(saveWorkspaceId, {
        folderId: saveFolderId || undefined,
        take: 100,
      });
        setRecentChats(history || []);
    } catch (e) {
        console.error("Failed to load user session", e);
      }
  }, [saveWorkspaceId, saveFolderId]);

  useEffect(() => {
    if (launchStudio || activeThreadId) return undefined;
    loadRecentChats();
  }, [launchStudio, activeThreadId, loadRecentChats]);

  useEffect(() => {
    if (!recentMenuId) return undefined;
    const close = (e) => {
      if (e.target.closest('.recent-chat-menu-wrap') || e.target.closest('.recent-chat-menu')) return;
      setRecentMenuId(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [recentMenuId]);

  const shareRecentChat = (chat) => {
    const genId = chat.headGenerationId || chat.head?.id;
    const link = genId ? `${window.location.origin}/share/${genId}` : window.location.href;
    navigator.clipboard.writeText(link).catch(() => {});
  };

  const commitRecentRename = async (chat) => {
    const label = chat.title || chat.prompt || chat.name || 'Untitled chat';
    const next = renameDraft.trim();
    setRenamingId(null);
    setRecentMenuId(null);
    if (!saveWorkspaceId || !chat?.id || !next || next === label) return;
    try {
      await imageGenService.renameThread(saveWorkspaceId, chat.id, next);
      setRecentChats((rows) => rows.map((row) => (row.id === chat.id ? { ...row, title: next } : row)));
    } catch (err) {
      console.error('Rename chat failed', err);
    }
  };

  const deleteRecentChat = (chat) => {
    setRecentMenuId(null);
    if (!saveWorkspaceId || !chat?.id) return;
    setConfirmDialog({
      title: 'Delete chat?',
      message: 'This chat will be removed from Recents. Images may still stay in Library.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await imageGenService.deleteThread(saveWorkspaceId, chat.id);
          setRecentChats((rows) => rows.filter((row) => row.id !== chat.id));
        } catch (err) {
          console.error('Delete chat failed', err);
        }
      },
    });
  };

  const getStyleImage = (styleId) => {
    switch(styleId) {
      case '3d': 
      case '3d_render': return style3dImg;
      case 'bauhaus': return styleBauhausImg;
      case 'bold-poster': 
      case 'bold_poster': return styleBoldPosterImg;
      case 'cinematic': return styleCinematicImg;
      case 'flat-line': 
      case 'flat_line': return styleFlatLineImg;
      case 'gouache': return styleGouacheImg;
      case 'illustration': 
      case 'flat_illustration': return styleIllustrationImg;
      case 'isometric': return styleIsometricImg;
      case 'mesh': return styleMeshImg;
      case 'modern-art': 
      case 'modern_art': return styleModernArtImg;
      case 'neon-glow': 
      case 'neon_glow':
      case 'neon': return styleNeonGlowImg;
      case 'photo': 
      case 'photoreal': return stylePhotoImg;
      case 'scene': return styleSceneImg;
      case 'spot-color': 
      case 'spot_color': return styleSpotColorImg;
      case 'still-life': 
      case 'still_life': return styleStillLifeImg;
      case 'watercolor': return styleWatercolorImg;
      default: return `https://picsum.photos/seed/${styleId}/400/300`;
    }
  };

  const getArchetypeIcon = (archId) => {
    switch (archId) {
      case 'process': return <ListOrdered size={24} className="arch-icon" />;
      case 'timeline': return <Clock size={24} className="arch-icon" />;
      case 'comparison': return <Columns2 size={24} className="arch-icon" />;
      case 'stats': return <BarChart3 size={24} className="arch-icon" />;
      case 'hierarchy': return <Network size={24} className="arch-icon" />;
      case 'list': return <List size={24} className="arch-icon" />;
      case 'cycle': return <RefreshCw size={24} className="arch-icon" />;
      default: return <Hexagon size={24} className="arch-icon" />;
    }
  };

  const getModelIcon = (modelId) => {
    const model = catalogs.models?.find(m => m.id === modelId) || {};
    const modelName = model.name || '';
    const isNano = String(modelName).toLowerCase().includes('nano') || String(modelId).toLowerCase().includes('nano');
    const isGemini = String(modelId).includes('google') || String(modelId).includes('gemini');
    const isDalle = String(modelId).includes('dall-e') || String(modelId).includes('openai') || String(modelId).includes('gpt');
    
    // Nano Banana gets the original Gemini wordmark (with text)
    if (isNano) {
      return <img src={geminiLogo} alt="Nano Banana" style={{ width: 48, height: 16, objectFit: 'contain' }} />;
    }
    // Standard Gemini gets the icon (without text)
    if (isGemini) {
      // We don't have the icon version locally, so crop the wordmark SVG using object-position
      return <div style={{ width: 14, height: 14, overflow: 'hidden', display: 'inline-block' }}><img src={geminiLogo} alt="Gemini" style={{ height: 14, objectFit: 'cover', objectPosition: 'left' }} /></div>;
    }
    if (isDalle) {
      return <img src={chatgptLogo} alt="OpenAI" style={{ width: 14, height: 14, objectFit: 'contain' }} />;
    }
    return <Sparkles size={14} color="var(--text-secondary, #a0a0a0)"/>;
  };

  const renderFormatIcon = (formatObj) => {
    if (!formatObj) return null;
    const w = formatObj.width || 1024;
    const h = formatObj.height || 1024;
    const maxDim = 14;
    const isWider = w > h;
    const rw = isWider ? maxDim : (w/h) * maxDim;
    const rh = isWider ? (h/w) * maxDim : maxDim;
    return (
      <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: rw, height: rh, border: '2px solid currentColor', borderRadius: 2, opacity: 0.7 }} />
      </div>
    );
  };

  const selectedModelObj = catalogs.models.find(m => m.id === selectedModel);

  const switchStudioMode = (next) => {
    if (!next) return;
    setActiveMode(next);
    setSelectedStyle(null);
    setIsComposerExpanded(false);
    setShowFormatDropdown(false);
    setSelectedModel(defaultImageGenModelId(next, catalogs));
    if (next === 'social' || next === 'printable') {
      setSelectedFormat('');
      return;
    }
    const pool = catalogs.formats.filter((f) => formatServesMode(f, next));
    const fallbackId = next === 'infographic' ? 'landscape' : 'square';
    const nextFormat = pool.find((f) => f.id === fallbackId) || pool[0];
    if (nextFormat?.id) setSelectedFormat(nextFormat.id);
  };

  const startChatFromLibrary = async ({ mode, images }) => {
    const localImages = (images || [])
      .map((img) => ({ name: img.name || 'Library image', src: img.src }))
      .filter((img) => img.src);
    switchStudioMode(mode);
    setActiveThreadId(null);
    setLaunchStudio(false);
    setPrompt('');
    if (!localImages.length) {
      setImageContext(null);
      return;
    }
    setImageContext({ localImages, attaching: true });
    const assetIds = (images || []).map((img) => img.assetId).filter(Boolean).slice(0, 5);
    if (saveWorkspaceId && assetIds.length) {
      try {
        const created = await imageGenService.createContext(saveWorkspaceId, { assetIds });
        setImageContext({ ...created, localImages, attaching: false });
        return;
      } catch (err) {
        console.error('Could not attach library images', err);
      }
    }
    setImageContext({ localImages, attaching: false });
  };

  const socialDestinations = socialDestinationsFrom(catalogs.formats);
  const selectedSocial = socialDestinations.find((d) => d.id === selectedFormat);
  const GENERIC_FORMAT_IDS = ['square', 'landscape', 'portrait', 'landscape-16-9', 'portrait-9-16'];
  const aspectFormats = catalogs.formats.filter((f) =>
    formatServesMode(f, activeMode === 'infographic' ? 'infographic' : 'image')
  );
  const sizeOptions = aspectFormats.length
    ? aspectFormats
    : catalogs.formats.filter((f) => GENERIC_FORMAT_IDS.includes(f.id));
  const printFormats = printablesFrom(catalogs.formats);
  const selectedPrint = printFormats.find((f) => f.id === selectedFormat);
  const needsSizePick = activeMode === 'social' || activeMode === 'printable';
  const canGenerate = Boolean(prompt.trim()) && !creditsBusy && !imageContext?.attaching && (!needsSizePick || Boolean(selectedFormat));

  useEffect(() => {
    if (selectedFormat === 'invitation-a6-landscape') {
      setSelectedFormat('invitation-a6-portrait');
    }
  }, [selectedFormat]);

  const selectedPrintGroup = printGroupForFormat(selectedPrint);
  const printOrientOptions = printOrientsForGroup(selectedPrintGroup);

  const applyPrintOrientation = (next) => {
    if (!printOrientOptions.includes(next)) return;
    setPrintOrientation(next);
    setShowFormatDropdown(false);
    setShowModelDropdown(false);
    const group = selectedPrintGroup;
    if (!group) return;
    const fmt = printFormatForGroup(group, printFormats, next);
    if (fmt?.id) setSelectedFormat(fmt.id);
  };

  const selectPrintGroup = (group) => {
    const orients = printOrientsForGroup(group);
    const nextOrient = orients.includes(printOrientation) ? printOrientation : orients[0];
    setPrintOrientation(nextOrient);
    const fmt = printFormatForGroup(group, printFormats, nextOrient);
    if (fmt?.id) setSelectedFormat(fmt.id);
  };

  if (launchStudio || activeThreadId) {
    return (
      <AIConversationalStudio 
        onBack={() => {
          setLaunchStudio(false);
          setActiveThreadId(null);
        }}
        onNewChat={() => {
          setLaunchStudio(false);
          setActiveThreadId(null);
          setPrompt('');
        }}
        onOpenLibrary={() => {
          setLaunchStudio(false);
          setActiveThreadId(null);
          setActiveMode('library');
        }}
        onStartChatFromLibrary={startChatFromLibrary}
        onSelectThread={(id) => {
          setActiveThreadId(id);
          setLaunchStudio(true);
        }}
        onOpenBilling={onOpenBilling}
        createContext={{
          ...createContext,
          workspaceId: saveWorkspaceId,
          folderId: saveFolderId,
          threadId: activeThreadId
        }}
        onLocationChange={handleSaveLocationChange}
        initialPrompt={prompt}
        activeMode={activeMode}
        selectedModel={selectedModel}
        selectedFormat={selectedFormat}
        selectedStyle={selectedStyle}
        activeThreadId={activeThreadId}
        key={activeThreadId || 'new-studio'}
        initialContext={imageContext}
      />
    );
  }

  return (
    <div className="ai-gen-container">
      {/* Sidebar */}
      <aside className="ai-gen-sidebar">
        
        <div className="mode-toggle">
          {MODE_SWITCHES.map(({ id, label, fullName, Icon, disabled }) => (
            <button
              key={id}
              type="button"
              className={activeMode === id ? 'active' : ''}
              disabled={disabled}
              aria-label={fullName}
              title={fullName}
              onClick={() => switchStudioMode(id)}
            >
              <Icon size={15} strokeWidth={2} />
              <span className="mode-toggle-label">{label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-actions">
           <div className="search-bar">
             <Search size={16}/> 
             <input
               type="search"
               placeholder="Search chats"
               value={recentQuery}
               onChange={(e) => setRecentQuery(e.target.value)}
             />
           </div>
        </div>

        <nav className="sidebar-nav">
           <a href="#" className={activeMode === 'library' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveMode('library'); }}><Library size={18}/> Library</a>
        </nav>

        <div className="sidebar-recent">
           <h3>
             <Clock size={14} /> Recent
             <button
               type="button"
               className="recent-refresh-btn"
               title="Refresh recents"
               onClick={loadRecentChats}
             >
               <RefreshCw size={12} />
             </button>
           </h3>
           <ul>
             {recentChats.filter((chat) => {
               const q = recentQuery.trim().toLowerCase();
               if (!q) return true;
               const label = `${chat.title || ''} ${chat.prompt || ''} ${chat.name || ''}`.toLowerCase();
               return label.includes(q);
             }).map((chat, idx) => {
               const chatMode = String(chat.mode || chat.head?.mode || '').toLowerCase();
               const platform = resolveSocialPlatform(chat);
               const isInfographic = chatMode === 'infographic';
               const isSocial = chatMode === 'social' || Boolean(platform);
               const isPrint = chatMode === 'printable';
               const label = chat.title || chat.prompt || chat.name || 'Untitled chat';
               return (
                 <li key={chat.id || idx} onClick={() => renamingId !== chat.id && setActiveThreadId(chat.id)} title={isInfographic ? 'Infographic' : isSocial ? 'Social' : isPrint ? 'Print' : 'Image'}>
                   <span className="recent-chat-icon" aria-hidden>
                     {isSocial ? (
                       <SocialPlatformIcon platform={platform} size={15} />
                     ) : isInfographic ? (
                       <BarChart3 size={15} />
                     ) : isPrint ? (
                       <Printer size={15} />
                     ) : (
                       <ImageIcon size={15} />
                     )}
                   </span>
                   {renamingId === chat.id ? (
                     <input
                       className="recent-chat-rename-input"
                       value={renameDraft}
                       autoFocus
                       onClick={(e) => e.stopPropagation()}
                       onChange={(e) => setRenameDraft(e.target.value)}
                       onBlur={() => commitRecentRename(chat)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') commitRecentRename(chat);
                         if (e.key === 'Escape') setRenamingId(null);
                       }}
                     />
                   ) : (
                     <span className="recent-chat-title">{label}</span>
                   )}
                   {renamingId === chat.id ? (
                     <button
                       type="button"
                       className="recent-chat-more recent-chat-rename-ok"
                       title="Save name"
                       aria-label="Save name"
                       onMouseDown={(e) => e.preventDefault()}
                       onClick={(e) => {
                         e.stopPropagation();
                         commitRecentRename(chat);
                       }}
                     >
                       <Check size={16} />
                     </button>
                   ) : (
                   <RecentChatMenu
                     open={recentMenuId === chat.id}
                     onToggle={() => setRecentMenuId((id) => (id === chat.id ? null : chat.id))}
                     onShare={() => {
                       setRecentMenuId(null);
                       shareRecentChat(chat);
                     }}
                     onRename={() => {
                       setRecentMenuId(null);
                       setRenameDraft(label);
                       setRenamingId(chat.id);
                     }}
                     onDelete={() => deleteRecentChat(chat)}
                   />
                   )}
               </li>
               );
             })}
             {recentChats.length === 0 && <li className="recent-chat-empty" style={{color: 'var(--text-secondary, #6b7280)', cursor: 'default'}}>No recent chats</li>}
             {recentChats.length > 0 && recentQuery.trim() && !recentChats.some((chat) => `${chat.title || ''} ${chat.prompt || ''} ${chat.name || ''}`.toLowerCase().includes(recentQuery.trim().toLowerCase())) && (
               <li className="recent-chat-empty" style={{color: 'var(--text-secondary, #6b7280)', cursor: 'default'}}>No matching chats</li>
             )}
           </ul>
        </div>

        <div className="sidebar-footer">
           <button
             className="new-chat-btn"
             onClick={() => {
               setActiveThreadId(null);
               setLaunchStudio(false);
               setPrompt('');
               setImageContext(null);
               if (activeMode === 'library') switchStudioMode('image');
             }}
           >
             <Plus size={16}/> New chat
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`ai-gen-main${activeMode === 'infographic' && isComposerExpanded ? ' composer-open' : ''}`} style={{ position: 'relative' }}>
        {activeMode !== 'library' && (
        <div className="ai-gen-save-corner">
          <ImageGenStudioSettings
            workspaceId={saveWorkspaceId}
            folderId={saveFolderId}
            onChange={handleSaveLocationChange}
            onCreditsChanged={loadRecentChats}
          />
        </div>
        )}
        {activeMode === 'library' ? (
          <WorkspaceImageLibrary 
            workspaceId={saveWorkspaceId || createContext?.workspaceId || createContext?.config?.workspaceId}
            onImageClick={(threadId) => {
              if (threadId) {
                setActiveThreadId(threadId);
                setActiveMode('image');
              }
            }}
            onStartChat={startChatFromLibrary}
          />
        ) : (
          <>
        {activeMode === 'infographic' && (
          <div className="infographic-bg-wrapper">
            <InfographicAnimatedBackground theme="blue" mode="light" />
          </div>
        )}

        <header 
          className="main-header" 
          style={{ 
            position: 'relative', 
            zIndex: 1, 
            ...(activeMode === 'infographic' && {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flex: 1,
              width: '100%',
              paddingBottom: '40px'
            })
          }}
        >
          {activeMode === 'image' ? (
            <>
              <h1>
                Create visuals for{' '}
                <span className={`topic-dynamic ${fadeTopic ? 'fade-in' : 'fade-out'}`}>{TOPICS[topicIndex % TOPICS.length]}</span>
              </h1>
              <p>Try a template or describe a visual in chat. Create with Athena AI.</p>
            </>
          ) : activeMode === 'social' ? (
            <>
              <h1>
                Create a{' '}
                <span className={`topic-dynamic ${fadeTopic ? 'fade-in' : 'fade-out'}`}>
                  {SOCIAL_TOPICS[topicIndex % SOCIAL_TOPICS.length]}
                </span>
              </h1>
              <p>Pick a destination first — YouTube, Instagram, Facebook, X, or LinkedIn. Then describe the post.</p>
            </>
          ) : activeMode === 'printable' ? (
            <>
              <h1>
                Create a{' '}
                <span className={`topic-dynamic ${fadeTopic ? 'fade-in' : 'fade-out'}`}>
                  {PRINT_TOPICS[topicIndex % PRINT_TOPICS.length]}
                </span>
              </h1>
              <p>Pick a print size first. Include every date, venue, name, phone, email and URL you want printed.</p>
            </>
          ) : (
            <>
              <h1>
                Create infographic for{' '}
                <span className={`topic-dynamic ${fadeTopic ? 'fade-in' : 'fade-out'}`}>{INFOGRAPHIC_TOPICS[topicIndex % INFOGRAPHIC_TOPICS.length]}</span>
              </h1>
              <p>Describe your data and let Athena structure the perfect visual layout.</p>
            </>
          )}
        </header>

        {activeMode === 'printable' && (
          <section className="styles-grid-container social-destinations print-sizes" style={{ position: 'relative', zIndex: 1 }}>
            <div className="styles-grid-title">Choose a print size</div>
            <div className="social-dest-grid print-size-grid">
              {PRINT_GROUPS.map((group) => {
                const labelOrient = printOrientsForGroup(group)[0];
                const fmt = printFormatForGroup(group, printFormats, labelOrient);
                if (!fmt) return null;
                const print = fmt.print || {};
                const previewSrc = printPreviewFor(group);
                const selected = selectedPrintGroup?.id === group.id;
                return (
                  <button
                    type="button"
                    key={group.id}
                    data-shape={group.kind === 'poster' || labelOrient === 'landscape' ? 'banner' : 'portrait'}
                    className={`social-dest-card print-size-card ${selected ? 'selected' : ''}`}
                    onClick={() => selectPrintGroup(group)}
                  >
                    <span className="social-dest-preview print-size-preview">
                      <img src={previewSrc} alt="" />
                      <span className="social-dest-badge">
                        {print.kind === 'business-card' ? <CreditCard size={14} /> : print.kind === 'invitation' ? <Mail size={14} /> : <Printer size={14} />}
                      </span>
                    </span>
                    <span className="social-dest-name">{group.label}</span>
                    <span className="social-dest-size">{printSizeLabel(print)} · {print.dpi} DPI</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {activeMode === 'social' && (
          <section className="styles-grid-container social-destinations" style={{ position: 'relative', zIndex: 1 }}>
            <div className="styles-grid-title">Choose a destination</div>
            <div className="social-dest-grid">
              {socialDestinations.map((dest) => (
                <button
                  type="button"
                  key={dest.id}
                  data-shape={socialPreviewShape(dest)}
                  className={`social-dest-card ${selectedFormat === dest.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFormat(dest.id)}
                >
                  <span className="social-dest-preview">
                    <img src={SOCIAL_PREVIEW[dest.id] || dest.previewUrl} alt="" />
                    <span className="social-dest-badge">
                      <SocialPlatformIcon platform={dest.platform} size={14} />
                    </span>
                  </span>
                  <span className="social-dest-name">{dest.name}</span>
                  <span className="social-dest-size">{dest.width}×{dest.height}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {activeMode === 'image' && (
          <section className="styles-grid-container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="styles-grid-title">Choose a style</div>
            <div className="styles-grid">
              {catalogs.styles.map(style => (
                <div 
                  className={`style-card ${selectedStyle === style.id ? 'selected' : ''}`} 
                  key={style.id} 
                  onClick={() => setSelectedStyle(style.id)}
                  style={{ backgroundImage: `url(${getStyleImage(style.id)})` }}
                >
                  <div className="style-card-overlay">
                    <span>{style.label || style.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="chatbox-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '24px' }}>
          <div className="bg-wave-graphic full-screen-wave">
            <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,138.7C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className={`chatbox-container ${isComposerExpanded ? 'expanded' : ''}`} ref={chatboxRef}>
            
            {activeMode === 'infographic' && isComposerExpanded && (
              <div className="composer-expanded-area">
                <div className="composer-expanded-title">Choose an infographic layout</div>
                <div className="archetype-grid-expanded">
                  {catalogs.archetypes.map(arch => (
                    <div 
                      className={`archetype-expanded-card ${selectedStyle === arch.id ? 'active' : ''}`} 
                      key={arch.id}
                      onClick={() => {
                        setSelectedStyle(arch.id);
                        // Do not auto-collapse to allow user to type prompt immediately
                        if(textareaRef.current) textareaRef.current.focus();
                      }}
                    >
                      <div className="arch-card-image">
                        <img src={layoutImages[arch.id]} alt={arch.label} />
                      </div>
                      <div className="arch-card-info">
                        <div className="arch-card-title">{arch.label || arch.id}</div>
                      </div>
                      {selectedStyle === arch.id && <div className="arch-card-check">✓</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeMode === 'infographic' && selectedStyle && (
              <div className="selected-layout-chip-container">
                <div className="selected-layout-chip">
                  <span>Layout: <strong>{catalogs.archetypes.find(a => a.id === selectedStyle)?.label}</strong></span>
                  <button className="clear-chip-btn" onClick={() => setSelectedStyle('')}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {activeMode === 'social' && selectedSocial && (
              <div className="selected-layout-chip-container">
                <div className="selected-layout-chip">
                  <span>
                    Destination: <strong>{selectedSocial.name}</strong>
                  </span>
                  <button className="clear-chip-btn" onClick={() => setSelectedFormat('')}>
                    <X size={12} />
                   </button>
                 </div>
               </div>
             )}

            {activeMode === 'printable' && selectedPrint && (
              <div className="selected-layout-chip-container">
                <div className="selected-layout-chip">
                  <span>
                    Size: <strong>{printChipLabel(selectedPrint)}</strong>
                  </span>
                  <button className="clear-chip-btn" onClick={() => setSelectedFormat('')}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <ImageGenContextAttach
              workspaceId={saveWorkspaceId}
              context={imageContext}
              onContextChange={setImageContext}
              compact
              plusMenu
            >
              {({ thumbs, trigger, composerBind, isDragOver, error: contextError }) => (
                <>
                  {thumbs}
                  {contextError && (
                    <p className="chatbox-context-error">{contextError}</p>
                  )}
                  <div
                    className={`chatbox-input${isDragOver ? ' is-file-over' : ''}`}
                    {...composerBind}
                  >
                    {trigger}
                    <MarkdownPromptInput
                  ref={textareaRef}
                      className="chatbox-md-input"
                      placeholder={
                        activeMode === 'printable'
                          ? 'Include every date, venue, name, phone, email and URL you want printed.'
                          : activeMode === 'social'
                            ? 'Describe the post...'
                            : activeMode === 'image'
                              ? 'Describe your visual...'
                              : 'Describe your infographic...'
                      }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                      onPaste={composerBind.onPaste}
                  onFocus={() => {
                    if (activeMode === 'infographic') setIsComposerExpanded(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                      e.preventDefault();
                          tryLaunchStudio();
                    }
                  }}
                      aria-label="Describe what you want to create"
                />
                <button className="mic-btn" onClick={toggleMic} style={{ color: isListening ? '#ef4444' : '' }}><Mic size={20}/></button>
                <button className="inspire-btn" title="Inspire Me" onClick={handleInspire} disabled={isTyping} style={{ opacity: isTyping ? 0.5 : 1 }}>
                  <Lightbulb size={20}/>
                </button>
             </div>
                </>
              )}
            </ImageGenContextAttach>
             
             <div className="chatbox-footer">
                <div className="chatbox-selectors" style={{ overflow: 'visible', flexWrap: 'wrap' }}>
                  
                  <div className="custom-dropdown">
                    <button className="dropdown-trigger" onClick={() => {
                      setShowModelDropdown(!showModelDropdown);
                      setShowFormatDropdown(false);
                    }}>
                      {getModelIcon(selectedModel)}
                      <span>{selectedModelObj?.name || selectedModel || "GPT Image"}</span>
                      <ChevronDown size={14}/>
                    </button>
                    {showModelDropdown && (
                      <div className="model-modal">
                        <div className="model-modal-content">
                        {(() => {
                          const buckets = new Map();
                          modelsForImageGenMode(catalogs.models, activeMode).forEach((m) => {
                            const key = m.provider || (String(m.id).includes('gemini') ? 'gemini' : 'openai');
                            if (!buckets.has(key)) buckets.set(key, []);
                            buckets.get(key).push(m);
                          });
                          const groups = [];
                          ['openai', 'gemini'].forEach((key) => {
                            if (buckets.has(key)) groups.push({ id: key, label: key === 'openai' ? 'OpenAI' : 'Google', models: buckets.get(key) });
                          });
                          return groups.map(g => (
                            <div key={g.id} className="model-group">
                              <div className="model-group-title">{g.label}</div>
                              {g.models.map(m => (
                                <div 
                                  key={m.id} 
                                  className={`model-card ${selectedModel === m.id ? 'active' : ''}`}
                                  onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false); }}
                                >
                                  <div className="model-card-top">
                                    <div className="model-name">
                                      {getModelIcon(m.id)} {m.name || m.id}
                                    </div>
                                    {m.recommended && activeMode === 'image' && <span className="recommended-badge">Recommended</span>}
                                    {isDraftQualityModel(m) && <span className="recommended-badge">Draft quality</span>}
                                  </div>
                                  <div className="model-desc">{m.description || "High performance AI image generation model."}</div>
                                  <div className="model-meta">
                                    {m.maxImageSize && <span>{m.maxImageSize} • </span>}
                                    <span>{m.quality === 'high' ? 'High quality' : 'Medium quality'}</span>
                                    {selectedModel === m.id && <span className="selected-text">✓ Selected</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {activeMode === 'printable' && (
                  <div className="custom-dropdown">
                    <button
                      className="dropdown-trigger"
                      onClick={() => {
                        setShowFormatDropdown(!showFormatDropdown);
                        setShowModelDropdown(false);
                      }}
                      aria-label="Print orientation"
                    >
                      {renderFormatIcon({
                        width: printOrientation === 'landscape' ? 16 : 9,
                        height: printOrientation === 'landscape' ? 9 : 16,
                      })}
                      <span>{printOrientation === 'landscape' ? 'Landscape' : 'Portrait'}</span>
                      <ChevronDown size={14}/>
                    </button>
                    {showFormatDropdown && (
                      <div className="model-modal" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                        <div className="model-modal-content">
                          <div className="model-group-title">Orientation</div>
                          {printOrientOptions.map((orient) => (
                            <div
                              key={orient}
                              className={`model-card ${printOrientation === orient ? 'active' : ''}`}
                              onClick={() => applyPrintOrientation(orient)}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                              {renderFormatIcon({
                                width: orient === 'landscape' ? 16 : 9,
                                height: orient === 'landscape' ? 9 : 16,
                              })}
                              <span>{orient === 'landscape' ? 'Landscape' : 'Portrait'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  {activeMode !== 'social' && activeMode !== 'printable' && (
                  <div className="custom-dropdown">
                    <button className="dropdown-trigger" onClick={() => setShowFormatDropdown(!showFormatDropdown)}>
                      {(() => {
                        const selFormat = sizeOptions.find(f => f.id === selectedFormat) || catalogs.formats.find(f => f.id === selectedFormat);
                        if (!selFormat) return <span>Size</span>;
                        return (
                          <>
                            {renderFormatIcon(selFormat)}
                            <span>{selFormat.name || selFormat.id}</span>
                            <ChevronDown size={14}/>
                          </>
                        );
                      })()}
                    </button>
                    {showFormatDropdown && (
                      <div className="model-modal" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                        <div className="model-modal-content">
                          <div className="model-group-title">Aspect Ratio</div>
                          {sizeOptions.map(f => (
                            <div 
                              key={f.id} 
                              className={`model-card ${selectedFormat === f.id ? 'active' : ''}`}
                              onClick={() => { setSelectedFormat(f.id); setShowFormatDropdown(false); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                            >
                              {renderFormatIcon(f)}
                              <span>{f.name || f.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                </div>
                <span
                  className={`generate-btn-wrap${needsSizePick && !selectedFormat ? ' needs-destination' : ''}`}
                  data-tip={
                    activeMode === 'printable' && !selectedFormat
                      ? 'Select a print size first'
                      : activeMode === 'social' && !selectedFormat
                        ? 'Select a destination first'
                        : undefined
                  }
                >
                <button 
                  className="generate-btn" 
                  onClick={tryLaunchStudio}
                  disabled={!canGenerate}
                  style={{ background: 'var(--primary, #2563eb)', color: '#ffffff', opacity: canGenerate ? 1 : 0.45 }}
                >
                  <Sparkles size={16}/> Generate
                </button>
                </span>
             </div>
          </div>
        </section>
          </>
        )}
      </main>
      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
      <ImageGenCreditsGate
        open={Boolean(creditsGate)}
        workspaceId={creditsGate?.workspaceId}
        needed={creditsGate?.needed}
        pool={creditsGate?.pool}
        personal={creditsGate?.personal}
        isTeam={creditsGate?.isTeam}
        onClose={() => setCreditsGate(null)}
        onBuy={onOpenBilling}
        onReady={() => {
          setCreditsGate(null);
          setLaunchStudio(true);
        }}
      />
    </div>
  )
}
