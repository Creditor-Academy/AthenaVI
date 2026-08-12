import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { resolveLayoutMapping } from './layoutTypeMap.mjs'
import {
  layoutPreviewCanvasElements,
  neutralizeCanvasElements,
  videoSceneToCanvasElements,
} from '../../src/utils/videoTemplateToCanvasElements.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '../../public/templates')

const DEFAULT_INTENT = {
  title: 'Hook the audience with a strong opening statement',
  agenda: 'Signal structure with a crisp agenda',
  bullet_list: 'List the top 3–4 key points concisely',
  section_divider: 'Mark a clear chapter break',
  'image+text': 'Explain the idea with supporting visuals',
  comparison: 'Contrast two options side by side',
  grid: 'Show several related insights at a glance',
  chart: 'Make the trend or data easy to grasp',
  stat: 'Lead with credible traction metrics',
  timeline: 'Show progress or plan over time',
  team: 'Introduce the people behind the story',
  quote: 'Land a memorable line from a credible voice',
  closing: 'End with a clear call-to-action',
}

function clipContent(clips, id) {
  const clip = (clips || []).find((c) => c.id === id)
  return clip?.content != null ? String(clip.content).replace(/\n/g, ' ').trim() : ''
}

function getSlideTitle(scene) {
  const fromClip = (scene.clips || []).find((c) => c.role === 'slide-title')?.content
  if (fromClip) return String(fromClip).replace(/\n/g, ' ').trim()
  return scene.title || 'Slide'
}

function resolveAssetImage(assets, assetKey) {
  if (!assetKey || !assets?.images) return null
  const entry = assets.images.find((img) => img.id === assetKey)
  return entry?.src || entry?.thumb || null
}

function getHeroImageUrl(scene, assets) {
  const clips = scene.clips || []
  const hero = clips.find(
    (c) =>
      c.type === 'image'
      && (c.role === 'hero-image' || c.role === 'logo')
      && c.size?.width >= 200
  )
  if (hero?.assetKey) {
    const fromAssets = resolveAssetImage(assets, hero.assetKey)
    if (fromAssets && !fromAssets.includes('placehold.co')) return fromAssets
  }
  if (hero?.src && !hero.src.includes('placehold.co')) return hero.src
  return null
}

function extractNumberedPairs(clips, prefix) {
  const pairs = []
  for (let i = 1; i <= 8; i += 1) {
    const label = clipContent(clips, `${prefix}${i}_lbl`)
    const desc = clipContent(clips, `${prefix}${i}_desc`)
    if (!label && !desc) continue
    pairs.push({ label, desc })
  }
  return pairs
}

function extractTimelineSteps(clips) {
  const steps = []
  for (let i = 1; i <= 8; i += 1) {
    const number = clipContent(clips, `step_num_${i}`)
    const label = clipContent(clips, `step_lbl_${i}`)
    const desc = clipContent(clips, `step_desc_${i}`)
    if (!label && !desc) continue
    steps.push({ number, label, desc })
  }
  return steps
}

function extractChecklist(clips) {
  return (clips || [])
    .filter((c) => /^chk_\d+$/.test(c.id || '') && c.content)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map((c) => String(c.content).replace(/^✔\s*/, '').trim())
}

function extractCoverPlaceholder(scene, assets) {
  const clips = scene.clips || []
  const title = getSlideTitle(scene)
  const subtitle =
    clipContent(clips, 't_sub')
    || clipContent(clips, 'hdr_sub')
    || clipContent(clips, 'pillars_intro_txt')
  const footnote = clipContent(clips, 't_footer') || clipContent(clips, 't_routine_footer')
  const imageUrl = getHeroImageUrl(scene, assets)
  return {
    title,
    subtitle,
    footnote,
    ...(imageUrl ? { imageUrl, imagePrompt: 'Wellness cover photo with calm botanical mood' } : {}),
  }
}

function extractPillarsPlaceholder(scene, assets) {
  const clips = scene.clips || []
  const pairs = extractNumberedPairs(clips, 'p')
  const intro = clipContent(clips, 'pillars_intro_txt')
  const bullets = pairs.map((p) => (p.desc ? `${p.label}: ${p.desc}` : p.label)).filter(Boolean)
  return {
    title: getSlideTitle(scene),
    subtitle: intro,
    bullets: bullets.length ? bullets : pairs.map((p) => p.label).filter(Boolean),
    imageUrl: getHeroImageUrl(scene, assets),
  }
}

function extractTimelinePlaceholder(scene) {
  const clips = scene.clips || []
  const steps = extractTimelineSteps(clips)
  const footerDesc = clipContent(clips, 'step_footer_desc')
  return {
    title: getSlideTitle(scene),
    subtitle: clipContent(clips, 'step_footer_hdr') || 'Daily rituals',
    body: footerDesc,
    bullets: steps.map((s) => (s.desc ? `${s.label}: ${s.desc}` : s.label)).filter(Boolean),
    steps: steps.map((s) => ({
      label: s.number || s.label,
      title: s.label,
      body: s.desc,
    })),
  }
}

function extractNutritionPlaceholder(scene, assets) {
  const clips = scene.clips || []
  const pairs = extractNumberedPairs(clips, 'g')
  const bullets = pairs.map((p) => (p.desc ? `${p.label}: ${p.desc}` : p.label)).filter(Boolean)
  return {
    title: getSlideTitle(scene).replace(/\s+/g, ' '),
    subtitle: clipContent(clips, 'nutri_hdr'),
    body: clipContent(clips, 'nutri_desc'),
    bullets,
    imageUrl: getHeroImageUrl(scene, assets),
    imagePrompt: 'Organic superfoods and healthy nutrition flat lay',
  }
}

function extractTrackerPlaceholder(scene, assets) {
  const clips = scene.clips || []
  const checklist = extractChecklist(clips)
  return {
    title: getSlideTitle(scene).replace(/\s+/g, ' '),
    subtitle: clipContent(clips, 'tracker_hdr'),
    body: clipContent(clips, 'tracker_desc'),
    bullets: checklist.length ? checklist : ['Daily wellness habit one', 'Daily wellness habit two'],
    imageUrl: getHeroImageUrl(scene, assets),
  }
}

function extractCtaPlaceholder(scene, assets) {
  const clips = scene.clips || []
  return {
    title: getSlideTitle(scene),
    subtitle: clipContent(clips, 'exercise_lbl') || clipContent(clips, 'exercise_desc'),
    body: clipContent(clips, 'exercise_desc'),
    cta: clipContent(clips, 'card_badge') || clipContent(clips, 'btn_txt') || 'Join now',
    contact: clipContent(clips, 'card_sub') || clipContent(clips, 'card_guarantee'),
    imageUrl: getHeroImageUrl(scene, assets),
  }
}

function extractPlaceholder(scene, layoutType, assets) {
  switch (layoutType) {
    case 'Cover':
      return extractCoverPlaceholder(scene, assets)
    case 'Pillars':
      return extractPillarsPlaceholder(scene, assets)
    case 'Timeline':
      return extractTimelinePlaceholder(scene)
    case 'Nutrition':
      return extractNutritionPlaceholder(scene, assets)
    case 'Tracker':
      return extractTrackerPlaceholder(scene, assets)
    case 'CTA':
    case 'Promo':
      return extractCtaPlaceholder(scene, assets)
    default: {
      const clips = scene.clips || []
      const bodyTexts = clips
        .filter((c) => c.type === 'text' && c.role === 'body-text' && c.content)
        .map((c) => String(c.content).trim())
      return {
        title: getSlideTitle(scene),
        subtitle: bodyTexts[0] || '',
        bullets: bodyTexts.slice(1, 5),
        imageUrl: getHeroImageUrl(scene, assets),
      }
    }
  }
}

function defaultGenerationHints(contentType) {
  switch (contentType) {
    case 'title':
    case 'image+text':
      return { maxTitleWords: 8, maxBodyWords: 40, imagePromptStyle: 'photo' }
    case 'agenda':
    case 'bullet_list':
    case 'timeline':
      return { maxTitleWords: 6, maxBodyWords: 60, itemCountMin: 3, itemCountMax: 5 }
    case 'closing':
      return { maxTitleWords: 6, maxBodyWords: 30 }
    default:
      return { maxTitleWords: 8, maxBodyWords: 50 }
  }
}

function defaultDesignTokens(contentType) {
  if (contentType === 'title' || contentType === 'closing' || contentType === 'section_divider') {
    return { backgroundStyle: 'gradient', accentPosition: 'bottom-bar', textContrast: 'high' }
  }
  if (contentType === 'image+text') {
    return { backgroundStyle: 'solid', accentPosition: 'none', imagePosition: 'left-half', textContrast: 'normal' }
  }
  return { backgroundStyle: 'solid', accentPosition: 'left-bar', textContrast: 'normal' }
}

function buildSlide(scene, order, manifestEntry, assets, aspectRatio = '16:9') {
  const overrides = manifestEntry.layoutOverrides || {}
  const { layoutId, contentType } = resolveLayoutMapping(scene.layoutType, overrides)
  const placeholder = extractPlaceholder(scene, scene.layoutType, assets)
  const imageUrl = placeholder.imageUrl || getHeroImageUrl(scene, assets)
  const elementsDoc = videoSceneToCanvasElements(scene, assets, aspectRatio)
  const {
    backgroundColor,
    backgroundGradientStart,
    backgroundGradientEnd,
    ...elements
  } = elementsDoc

  return {
    order,
    layout_id: layoutId,
    layoutType: scene.layoutType,
    contentType,
    intent: DEFAULT_INTENT[contentType] || 'Advance the narrative clearly on this slide',
    designTokens: defaultDesignTokens(contentType),
    generationHints: defaultGenerationHints(contentType),
    placeholder: {
      ...placeholder,
      ...(imageUrl ? { imageUrl } : {}),
    },
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(backgroundGradientStart ? { backgroundGradientStart } : {}),
    ...(backgroundGradientEnd ? { backgroundGradientEnd } : {}),
    elements,
    slidePreview: {
      order,
      title: getSlideTitle(scene),
      layoutId,
      contentType,
      previewImageUrl: imageUrl,
    },
  }
}

/**
 * @param {object} manifestEntry
 * @param {{ templatesDir?: string }} [opts]
 */
export function convertPublicTemplateToDeckPack(manifestEntry, opts = {}) {
  const templatesDir = opts.templatesDir || TEMPLATES_DIR
  const templatePath = join(templatesDir, manifestEntry.templateFile)
  const assetsPath = join(templatesDir, manifestEntry.assetsFile)

  const templateJson = JSON.parse(readFileSync(templatePath, 'utf8'))
  const assets = JSON.parse(readFileSync(assetsPath, 'utf8'))

  const meta = templateJson.template || {}
  const aspectRatio = meta.aspectRatio || '16:9'
  const scenes = (templateJson.scenes || []).slice().sort(
    (a, b) => (a.slideIndex ?? 0) - (b.slideIndex ?? 0)
  )

  const builtSlides = scenes.map((scene, index) =>
    buildSlide(scene, index + 1, manifestEntry, assets, aspectRatio)
  )

  const layoutWhitelist = [...new Set(builtSlides.map((s) => s.layout_id))]
  const coverImage =
    builtSlides[0]?.slidePreview?.previewImageUrl
    || resolveAssetImage(assets, 'wellness-cover')

  const flowSummary = scenes.map((s) => s.title).filter(Boolean).join(' → ')

  const schema = {
    schemaVersion: 2,
    pack_id: manifestEntry.packId,
    themeId: manifestEntry.themeId || 'clean_light',
    aspectRatio: meta.aspectRatio || '16:9',
    meta: {
      name: manifestEntry.label || meta.name || manifestEntry.packId,
      description:
        meta.description
        || 'A progressive wellness presentation for hormone harmony and daily self-care.',
      useCase: manifestEntry.filterCategory || manifestEntry.category || 'Training',
      audience: 'Women seeking holistic wellness and self-care routines',
      tone: 'Warm, supportive, empowering',
      industry: ['health', 'wellness', 'education'],
    },
    narrative: {
      arc: 'awareness → pillars → daily rituals → nutrition → habits → community',
      summary:
        flowSummary
        || 'Guide viewers through wellness pillars, daily rituals, nutrition, habit tracking, and a calming call-to-action.',
    },
    slides: builtSlides.map(({ slidePreview, ...slide }) => slide),
    slidePreviews: builtSlides.map((s) => s.slidePreview),
    generationDefaults: {
      density: 'balanced',
      imageType: 'ai',
      imageStyle: 'photo',
      preferVisuals: true,
      layoutWhitelist,
      slideOrder: 'fixed',
      contentDistribution: {
        maxConsecutiveBulletSlides: 2,
        requireStatSlide: false,
        requireImageSlide: true,
      },
    },
    preview: {
      label: manifestEntry.label || meta.name,
      description: meta.description || '',
      tags: ['womens-wellness', 'wellness', manifestEntry.filterCategory?.toLowerCase() || 'training'],
      slideCount: builtSlides.length,
      imageUrl: coverImage,
    },
  }

  return {
    type: 'DECK_PACK',
    name: manifestEntry.label || meta.name,
    contentType: 'pack',
    variant: manifestEntry.packId,
    isActive: true,
    schema,
    requiredLayoutIds: layoutWhitelist,
    mediaHints: builtSlides.map((s) => ({
      slotHint: `slide:${s.order}`,
      url: s.slidePreview.previewImageUrl,
    })).filter((m) => m.url),
    previewUrl: coverImage,
  }
}

export function loadManifest(manifestPath) {
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

export function filterManifestPacks(manifest, onlyKeys = []) {
  const packs = manifest.packs || []
  if (!onlyKeys?.length) return packs
  const wanted = new Set(onlyKeys.map(String))
  return packs.filter((p) => wanted.has(p.key) || wanted.has(p.packId))
}

function humanLayoutName(layoutId) {
  return String(layoutId)
    .replace(/_v\d+$/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Build DECK_LAYOUT rows from pack slides — neutral structure (no brand colors / images). */
export function buildDeckLayoutsFromPack(manifestEntry, opts = {}) {
  const converted = convertPublicTemplateToDeckPack(manifestEntry, opts)
  const layoutLabels = manifestEntry.layoutLabels || {}

  return converted.schema.slides.map((slide) => {
    const canvasElements = layoutPreviewCanvasElements(slide.elements)
    const name =
      layoutLabels[slide.layoutType]
      || humanLayoutName(slide.layout_id)

    return {
      layoutId: slide.layout_id,
      name,
      contentType: slide.contentType || 'image+text',
      schema: {
        layout_id: slide.layout_id,
        content_type: slide.contentType,
        grid: '12-col',
        slots: [
          {
            id: 'CANVAS_STRUCTURE',
            region: 'cols 1-12, rows 1-11',
            role: 'background',
          },
        ],
        preview: {
          mode: 'canvas_elements',
          backgroundColor: canvasElements.backgroundColor || '#f8fafc',
          canvasElements,
        },
      },
    }
  })
}
