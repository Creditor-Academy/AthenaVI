import { fetchTemplateBundles } from './fetchTemplateBundles';
import { fetchTemplateAvatarLookSet } from './templateAvatarPreview';
import avatar1 from '../assets/Avatarr1.png';
import avatar2 from '../assets/Avatarr2.png';
import avatar3 from '../assets/Avatarr3.png';
import avatar4 from '../assets/Avatarr4.png';
import avatar5 from '../assets/Avatarr5.png';
import avatar6 from '../assets/Avatarr6.png';
import productVideo from '../assets/ProductVideo.mp4';
import technologyVideo from '../assets/Technology.mp4';
import personalAvatarVideo from '../assets/Personal Avatar.mp4';
import productDemoVideo from '../assets/Product.mp4';

const LOCAL_AVATAR_IMAGES = [
  { id: 'avatar-1', src: avatar1, alt: 'AI video presenter', kind: 'avatar', mediaType: 'image' },
  { id: 'avatar-2', src: avatar2, alt: 'Virtual instructor avatar', kind: 'avatar', mediaType: 'image' },
  { id: 'avatar-3', src: avatar3, alt: 'Training avatar', kind: 'avatar', mediaType: 'image' },
  { id: 'avatar-4', src: avatar4, alt: 'Corporate presenter', kind: 'avatar', mediaType: 'image' },
  { id: 'avatar-5', src: avatar5, alt: 'Course narrator', kind: 'avatar', mediaType: 'image' },
  { id: 'avatar-6', src: avatar6, alt: 'Digital twin presenter', kind: 'avatar', mediaType: 'image' },
];

const SHOWCASE_VIDEOS = [
  { id: 'showcase-vid-1', src: productVideo, alt: 'AI product video', kind: 'video', mediaType: 'video' },
  { id: 'showcase-vid-2', src: technologyVideo, alt: 'Technology showcase', kind: 'video', mediaType: 'video' },
  { id: 'showcase-vid-3', src: personalAvatarVideo, alt: 'Personal avatar demo', kind: 'video', mediaType: 'video' },
  { id: 'showcase-vid-4', src: productDemoVideo, alt: 'Product demo reel', kind: 'video', mediaType: 'video' },
];

// External demo videos (reliable mp4 previews) so the dome always has motion tiles.
const EXTERNAL_DEMO_VIDEOS = [
  {
    id: 'ext-vid-1',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-blue-liquid-ink-surface-43562-large.mp4',
    alt: 'Abstract liquid ink',
    kind: 'video',
    mediaType: 'video',
  },
  {
    id: 'ext-vid-2',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-network-graphics-of-plexus-lines-background-27415-large.mp4',
    alt: 'Network plexus lines',
    kind: 'video',
    mediaType: 'video',
  },
  {
    id: 'ext-vid-3',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-white-clouds-moving-slowly-in-the-sky-42526-large.mp4',
    alt: 'Clouds moving slowly',
    kind: 'video',
    mediaType: 'video',
  },
  // “Pixel/Pixabay” style stock clips (direct mp4 CDN links)
  {
    id: 'pixabay-vid-1',
    src: 'https://cdn.pixabay.com/video/2022/11/10/138505-769194263_large.mp4',
    alt: 'Abstract particles',
    kind: 'video',
    mediaType: 'video',
  },
  {
    id: 'pixabay-vid-2',
    src: 'https://cdn.pixabay.com/video/2020/07/24/45171-446270591_large.mp4',
    alt: 'Technology background',
    kind: 'video',
    mediaType: 'video',
  },
];

const assetLibraryCache = new Map();

const ICON_URL_PATTERN = /icons8\.com|iconify|placeholder|placehold\.co/i;
const EXCLUDED_ROLE_PATTERN = /icon|logo|decoration|badge|accent|pill|dot|line|orb|grid/i;

function bundleFileToAssetsFile(bundleFile) {
  const base = String(bundleFile || '').replace(/_template$/, '').replace(/_/g, '-');
  return `${base}-assets.json`;
}

function isIconOrPlaceholderUrl(url) {
  if (!url || typeof url !== 'string') return true;
  if (ICON_URL_PATTERN.test(url)) return true;
  if (url.startsWith('data:image/svg')) return true;
  return false;
}

function isValidHttpUrl(url) {
  return typeof url === 'string' && (url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:'));
}

function isGradientBackground(value) {
  return typeof value === 'string' && value.includes('gradient(');
}

async function loadTemplateAssetLibrary(bundleFile) {
  if (assetLibraryCache.has(bundleFile)) return assetLibraryCache.get(bundleFile);

  const assetsFile = bundleFileToAssetsFile(bundleFile);
  const empty = { imageById: new Map(), iconIds: new Set() };
  try {
    const res = await fetch(`/templates/${assetsFile}`);
    if (!res.ok) {
      assetLibraryCache.set(bundleFile, empty);
      return empty;
    }
    const data = await res.json();
    const imageById = new Map();
    const iconIds = new Set((data.icons || []).map((item) => item.id).filter(Boolean));

    for (const img of data.images || []) {
      if (!img?.id || !img?.src || isIconOrPlaceholderUrl(img.src)) continue;
      if (img.role && EXCLUDED_ROLE_PATTERN.test(img.role)) continue;
      imageById.set(img.id, img.src);
    }

    if (data.presenter?.previewSrc && !isIconOrPlaceholderUrl(data.presenter.previewSrc)) {
      imageById.set('__presenter_preview__', data.presenter.previewSrc);
    }

    const library = { imageById, iconIds };
    assetLibraryCache.set(bundleFile, library);
    return library;
  } catch {
    assetLibraryCache.set(bundleFile, empty);
    return empty;
  }
}

function resolveClipMedia(clip, library) {
  if (!clip || clip.type === 'text' || clip.type === 'shape') return null;

  const role = String(clip.role || '');
  if (EXCLUDED_ROLE_PATTERN.test(role)) return null;

  if (clip.type === 'video' || clip.mediaType === 'video') {
    const src = clip.playbackUrl || clip.generatedVideoUrl || clip.src || clip.url;
    if (src && !isIconOrPlaceholderUrl(src)) {
      return { src, mediaType: 'video', alt: clip.alt || 'Video scene', area: 1e6 };
    }
  }

  if (clip.type === 'avatar') {
    const src = clip.src || clip.previewImage || clip.thumbnail || clip.poster;
    if (src && !isIconOrPlaceholderUrl(src)) {
      const w = clip.size?.width || 400;
      const h = clip.size?.height || 400;
      return { src, mediaType: 'image', kind: 'avatar', alt: 'AI Avatar', area: w * h };
    }
    return null;
  }

  if (clip.type === 'image') {
    let src = clip.src || clip.content?.src || clip.url;
    if (!src && clip.assetKey) {
      if (library.iconIds.has(clip.assetKey)) return null;
      src = library.imageById.get(clip.assetKey);
    }
    if (!src || !isValidHttpUrl(src) || isIconOrPlaceholderUrl(src)) return null;

    const w = Number(clip.size?.width) || 0;
    const h = Number(clip.size?.height) || 0;
    if (w > 0 && h > 0 && w < 220 && h < 220) return null;

    return {
      src,
      mediaType: 'image',
      alt: clip.alt || clip.assetKey || 'Scene image',
      area: w > 0 && h > 0 ? w * h : 500000,
    };
  }

  return null;
}

function extractSceneMedia(scene, bundle, library) {
  if (!scene) return null;

  const candidates = [];

  if (scene.backgroundImage && !isIconOrPlaceholderUrl(scene.backgroundImage)) {
    candidates.push({
      src: scene.backgroundImage,
      mediaType: 'image',
      alt: scene.title || bundle?.name,
      area: 900000,
    });
  }

  const bg = scene.background?.value;
  if (bg && isValidHttpUrl(bg) && !isGradientBackground(bg) && !isIconOrPlaceholderUrl(bg)) {
    candidates.push({
      src: bg,
      mediaType: 'image',
      alt: scene.title || bundle?.name,
      area: 850000,
    });
  }

  for (const clip of scene.clips || []) {
    const media = resolveClipMedia(clip, library);
    if (media) candidates.push(media);
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => (b.area || 0) - (a.area || 0));
  const best = candidates[0];

  return {
    id: `${bundle?.id || 'bundle'}-${scene.id}`,
    bundleId: bundle?.id,
    src: best.src,
    mediaType: best.mediaType || 'image',
    alt: scene.title || bundle?.name || 'Template scene',
    kind: best.kind === 'avatar' ? 'avatar' : best.mediaType === 'video' ? 'video' : 'scene',
  };
}

export async function bundlesToSceneDomeMedia(bundles = []) {
  const libraries = await Promise.all(
    bundles.map((bundle) => loadTemplateAssetLibrary(bundle.file))
  );

  return bundles.flatMap((bundle, index) => {
    const library = libraries[index];
    return (bundle.scenes || [])
      .map((scene) => extractSceneMedia(scene, bundle, library))
      .filter(Boolean);
  });
}

function interleaveMedia(...lists) {
  const out = [];
  const max = Math.max(...lists.map((list) => list.length), 0);
  for (let i = 0; i < max; i += 1) {
    for (const list of lists) {
      if (list[i]) out.push(list[i]);
    }
  }
  return out;
}

function uniqueBySrc(items = []) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const src = item?.src;
    if (!src) continue;
    const key = `${item.mediaType || 'image'}:${src}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * Load avatars, template scene media, and showcase videos for the dome gallery.
 */
export async function fetchDomeGalleryContent() {
  const [bundles, heygenLooks] = await Promise.all([
    fetchTemplateBundles(),
    fetchTemplateAvatarLookSet(8).catch(() => []),
  ]);

  const sceneMedia = await bundlesToSceneDomeMedia(bundles);

  const heygenAvatars = (heygenLooks || [])
    .filter((look) => look?.image && !isIconOrPlaceholderUrl(look.image))
    .map((look) => ({
      id: look.id,
      src: look.image,
      alt: look.name || 'AI Avatar',
      kind: 'avatar',
      mediaType: 'image',
    }));

  // If HeyGen returns only one avatar (often “Anna”), top it up with local avatars
  // so the dome always has variety.
  const avatars = uniqueBySrc(heygenAvatars).length >= 4
    ? uniqueBySrc(heygenAvatars)
    : uniqueBySrc([...heygenAvatars, ...LOCAL_AVATAR_IMAGES]);

  // If scene extraction yields nothing (over-filtered or templates not available), fall back
  // to bundle cover thumbnails so we still show real imagery instead of only avatars.
  const safeScenes = sceneMedia?.length
    ? sceneMedia
    : (bundles || [])
        .map((b) => b?.coverScene?.thumbnail || b?.thumb)
        .filter((src) => src && !isIconOrPlaceholderUrl(src))
        .map((src, i) => ({ id: `bundle-cover-${i}`, src, alt: 'Template preview', kind: 'scene', mediaType: 'image' }));

  const videos = uniqueBySrc([...SHOWCASE_VIDEOS, ...EXTERNAL_DEMO_VIDEOS]);

  const combined = interleaveMedia(avatars, safeScenes, videos);

  if (typeof window !== 'undefined') {
    // Helpful debug signal in devtools when content is unexpectedly empty.
    console.debug('[DomeGallery] content counts', {
      bundles: bundles?.length || 0,
      avatars: avatars.length,
      scenes: safeScenes.length,
      videos: videos.length,
      heygenLooks: heygenLooks?.length || 0,
    });
  }

  return uniqueBySrc(combined);
}

export default fetchDomeGalleryContent;
