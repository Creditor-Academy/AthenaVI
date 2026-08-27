import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
  Download,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  ArrowUp,
  Maximize2,
  Plus,
  X,
  FileImage,
  FileText,
  Archive,
  MessageSquare,
  CreditCard,
  ArrowLeftRight,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  ListOrdered,
  GitBranch,
  BarChart3,
  RefreshCw,
  Clock,
  Columns2,
} from 'lucide-react'
import imageGenService, {
  ImageGenRateLimitError,
  ImageGenProviderError,
} from '../../../services/imageGenService.js'
import creditsService, { isInsufficientCreditsError } from '../../../services/creditsService.js'
import AllocateCreditsModal from '../../../components/features/workspace/workspace/AllocateCreditsModal.jsx'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import ImageGenContextAttach from '../../../components/features/image-generation/ImageGenContextAttach.jsx'
import MarkdownPromptInput from '../../../components/features/image-generation/MarkdownPromptInput.jsx'
import { highlightMarkdownSource } from '../../../utils/markdownPrompt.jsx'
import art1 from '../../../assets/ai-img-gen/art-1.jpg'
import art2 from '../../../assets/ai-img-gen/art-2.jpg'
import art3 from '../../../assets/ai-img-gen/art-3.jpg'
import art4 from '../../../assets/ai-img-gen/art-4.jpg'
import art5 from '../../../assets/ai-img-gen/art-5.jpg'
import art6 from '../../../assets/ai-img-gen/art-6.jpg'
import canvasAtmosphere from '../../../assets/ai-img-gen/canvas-atmosphere.png'
import formatSquarePreview from '../../../assets/ai-img-gen/format-square.jpg'
import formatLandscapePreview from '../../../assets/ai-img-gen/format-landscape.jpg'
import formatPortraitPreview from '../../../assets/ai-img-gen/format-portrait.jpg'
import infoBoardPreview from '../../../assets/ai-img-gen/info-board.jpg'
import linkedinBannerPreview from '../../../assets/ai-img-gen/Linkedin_Banner.png'
import linkedinPostPreview from '../../../assets/ai-img-gen/Linkedin_post.png'
import instagramPostPreview from '../../../assets/ai-img-gen/Instagram_post.png'
import facebookCoverPreview from '../../../assets/ai-img-gen/Facebook_banner.png'
import xPostPreview from '../../../assets/ai-img-gen/X_Twitter_Post.png'
import xHeaderPreview from '../../../assets/ai-img-gen/X_Twitter_Header.png'
import youtubeThumbnailPreview from '../../../assets/ai-img-gen/Youtube_thumbnail.png'
import instagramStoryPreview from '../../../assets/ai-img-gen/Instagram_Story.png'
import instagramLandscapePreview from '../../../assets/ai-img-gen/Insta_landscape.png'
import facebookPostPreview from '../../../assets/ai-img-gen/facebook_post.png'
import './AIImageStudio.css'

// Image Gen backend is Mode 1 (image) only. Infographic/social UI is parked below, not deleted.
const MODE_TABS = [
  {
    id: 'image',
    label: 'Image',
    blurb: 'General visuals — pick a square, landscape, or portrait canvas.',
  },
  {
    id: 'infographic',
    label: 'Infographic',
    blurb: 'Readable structured visuals — process, comparison, stats, and more.',
  },
]

const FALLBACK_ARCHETYPES = [
  { id: 'process', label: 'Process', description: 'Steps in a flow' },
  { id: 'timeline', label: 'Timeline', description: 'Events over time' },
  { id: 'comparison', label: 'Comparison', description: 'Side-by-side contrast' },
  { id: 'stats', label: 'Stats', description: 'Numbers and KPIs' },
  { id: 'hierarchy', label: 'Hierarchy', description: 'Tree / org chart' },
  { id: 'list', label: 'List', description: 'Ranked or grouped items' },
  { id: 'cycle', label: 'Cycle', description: 'Repeating loop' },
]

const AUTO_ARCHETYPE = { id: 'auto', label: 'Auto', description: 'Let the model pick a layout' }
const TWEAK_INSTRUCTION_MAX = 4000
const INFOGRAPHIC_PREFERRED_STYLES = ['flat_illustration', 'corporate', 'minimal']
const INFOGRAPHIC_IGNORED_STYLES = new Set([
  'cinematic',
  'photoreal',
  'watercolor',
  '3d_render',
  'neon',
])

function pickModelForMode(models = [], mode) {
  const available = models.filter((m) => !m.modes?.length || m.modes.includes(mode))
  const recommended = available.find((m) =>
    Array.isArray(m.recommendedForModes) ? m.recommendedForModes.includes(mode) : false
  )
  if (recommended) return recommended
  if (mode === 'infographic') {
    return available.find((m) => m.id === 'gpt-image-1-hd') || available[0] || models[0] || null
  }
  return available.find((m) => m.recommended) || available[0] || models[0] || null
}

function stylesForMode(styles = [], mode) {
  if (mode !== 'infographic') return styles
  const usable = styles.filter((s) => !INFOGRAPHIC_IGNORED_STYLES.has(s.id))
  const preferred = INFOGRAPHIC_PREFERRED_STYLES.map((id) =>
    usable.find((s) => s.id === id)
  ).filter(Boolean)
  const rest = usable.filter((s) => !INFOGRAPHIC_PREFERRED_STYLES.includes(s.id))
  return [...preferred, ...rest]
}

function pickInfographicStyleId(styles = [], currentId) {
  const offered = stylesForMode(styles, 'infographic')
  if (offered.some((s) => s.id === currentId)) return currentId
  return offered[0]?.id || currentId
}

function turnsFromSavedThread(saved) {
  const messages = Array.isArray(saved?.messages) ? saved.messages : []
  const turns = []
  for (let i = 0; i < messages.length; i += 1) {
    const msg = messages[i]
    if (msg.role !== 'user') continue
    const follow = messages[i + 1]
    const generation = follow?.generationId
      ? {
          id: follow.generationId,
          url: follow.url || follow.asset?.url || null,
          asset: follow.asset || null,
          threadId: saved.id,
          prompt: msg.content,
          mode: follow.mode || saved.mode,
          request: follow.request || null,
          infographicSpec: follow.infographicSpec || follow.request?.infographicSpec || null,
        }
      : null
    const kind =
      msg.type === 'tweak' ? 'tweak' : msg.type === 'regenerate' ? 'regenerate' : 'generate'
    turns.push({
      id: msg.id,
      kind,
      text: msg.content || '',
      status: generation?.url ? 'done' : follow?.generationId ? 'done' : 'error',
      generation,
      error: generation || follow?.generationId ? null : 'Image missing',
    })
  }
  return turns
}

function upsertChatList(list, thread) {
  if (!thread?.id) return list
  const rest = (list || []).filter((item) => item.id !== thread.id)
  return [thread, ...rest]
}

function chatTitle(item) {
  return String(item?.title || item?.head?.asset?.name || 'Untitled chat')
}

function chatThumb(item) {
  return item?.head?.url || item?.head?.asset?.url || ''
}

function chatWhen(item) {
  const raw = item?.updatedAt || item?.createdAt
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const IMAGE_INSPIRE = [
  {
    kind: 'image',
    styleId: 'cinematic',
    formatId: 'landscape',
    prompt:
      'A tiny paper boat drifting down a rain-swollen city gutter at night, neon pharmacy signs trembling in the water, shot from street level',
  },
  {
    kind: 'image',
    styleId: 'photoreal',
    formatId: 'portrait',
    prompt:
      'An elderly beekeeper in morning fog, veil dotted with dew, golden hives receding into a lavender field, quiet overcast light',
  },
  {
    kind: 'image',
    styleId: 'flat_illustration',
    formatId: 'square',
    prompt:
      'A cutaway of a cozy subway car at 7am: commuters as simple shapes, steam from coffee cups, one empty seat glowing like a secret',
  },
  {
    kind: 'image',
    styleId: '3d_render',
    formatId: 'square',
    prompt:
      'A polished 3D still life: a cracked porcelain moon used as a soup bowl, chopsticks resting on the rim, soft studio lighting',
  },
  {
    kind: 'image',
    styleId: 'watercolor',
    formatId: 'landscape',
    prompt:
      'A hidden waterfall inside a greenhouse, ferns bleeding into pigment, sunlight as pale gold washes on wet paper',
  },
  {
    kind: 'image',
    styleId: 'corporate',
    formatId: 'landscape',
    prompt:
      'A sunlit workshop table: sketches, a laptop, a clay prototype, one plant, calm navy and oak — a brand-safe hero for a product studio',
  },
  {
    kind: 'image',
    styleId: 'playful',
    formatId: 'square',
    prompt:
      'A city bus that is secretly a giant loaf of bread, passengers peeking from sesame-seed windows, cheerful morning light',
  },
  {
    kind: 'image',
    styleId: 'dark_moody',
    formatId: 'portrait',
    prompt:
      'A violin maker’s hands in a pool of lamplight, maple dust hanging in the dark, the rest of the workshop swallowed in shadow',
  },
  {
    kind: 'image',
    styleId: 'minimal',
    formatId: 'square',
    prompt:
      'A single red telephone booth stuffed with wildflowers on an empty gray street, huge negative space, two-color restraint',
  },
  {
    kind: 'image',
    styleId: 'neon',
    formatId: 'portrait',
    prompt:
      'A deserted laundromat at 2am, washers pulsing cyan and magenta, one dryer door ajar like a portal, rain on the glass',
  },
]

const INFOGRAPHIC_INSPIRE = [
  {
    kind: 'infographic',
    layout: 'process',
    styleId: 'corporate',
    formatId: 'portrait',
    prompt:
      'A witty how-it-works diagram: how a thunderstorm is born. Light artboard, navy accents, every step fully on canvas, no clipping.',
    title: 'How a thunderstorm is born',
    sections: [
      { title: 'Warm air rises', bullets: 'Sun heats the ground\nMoist air lifts' },
      { title: 'Clouds stack', bullets: 'Vapor cools into droplets\nThe tower grows taller' },
      { title: 'Charge builds', bullets: 'Ice and droplets collide\nThe cloud becomes a battery' },
      { title: 'The sky answers', bullets: 'Lightning equalizes the charge\nRain and thunder follow' },
    ],
  },
  {
    kind: 'infographic',
    layout: 'comparison',
    styleId: 'minimal',
    formatId: 'landscape',
    prompt:
      'A clean side-by-side comparison: handwritten letter vs a text message. Restrained palette, matching labels, nothing cut off.',
    title: 'Letter vs text',
    sections: [
      { title: 'Handwritten letter', bullets: 'Slow on purpose\nKeeps the folds and the wait\nYou reread the handwriting' },
      { title: 'Text message', bullets: 'Instant and disposable\nRead in a lock-screen glance\nEasy to send, easy to forget' },
    ],
  },
  {
    kind: 'infographic',
    layout: 'timeline',
    styleId: 'flat_illustration',
    formatId: 'landscape',
    prompt:
      'A playful timeline of a banana’s life, from green bunch to the last brown spot. All dates visible, light background.',
    title: 'The secret life of a banana',
    sections: [
      { title: 'Day 0', bullets: 'Green, stubborn, not ready' },
      { title: 'Day 3', bullets: 'Yellow, peak lunchbox fame' },
      { title: 'Day 6', bullets: 'Spots appear — banana-bread rumors start' },
      { title: 'Day 9', bullets: 'Fully committed to bread' },
    ],
  },
  {
    kind: 'infographic',
    layout: 'stats',
    styleId: 'corporate',
    formatId: 'square',
    prompt:
      'A KPI board for “60 seconds on a busy train platform.” Big readable numbers, muted navy and gray, no neon.',
    title: '60 seconds on the platform',
    sections: [
      { title: '12', bullets: 'Trains announced' },
      { title: '84', bullets: 'Coffee lids pressed shut' },
      { title: '3', bullets: 'People who almost miss it' },
      { title: '1', bullets: 'Stranger who holds the door' },
    ],
  },
  {
    kind: 'infographic',
    layout: 'hierarchy',
    styleId: 'playful',
    formatId: 'portrait',
    prompt:
      'An org chart for the government of a houseplant. Cute but readable. Every role on canvas with padding.',
    title: 'Government of a houseplant',
    sections: [
      { title: 'The plant', bullets: 'Supreme leader\nRequires water and compliments' },
      { title: 'Sunbeam', bullets: 'Minister of energy' },
      { title: 'Watering can', bullets: 'Treasury of hydration' },
      { title: 'The cat', bullets: 'Chaos department\nUnpaid intern' },
    ],
  },
  {
    kind: 'infographic',
    layout: 'funnel',
    styleId: 'corporate',
    formatId: 'portrait',
    prompt:
      'A conversion funnel: how a joke becomes a catchphrase. Wide to narrow, last stage fully visible, calm colors.',
    title: 'How a joke becomes a catchphrase',
    sections: [
      { title: 'The mutter', bullets: 'Said once, almost to yourself' },
      { title: 'The table laugh', bullets: 'Friends repeat it that night' },
      { title: 'The group chat', bullets: 'It grows a life of its own' },
      { title: 'The catchphrase', bullets: 'Now it shows up in unrelated meetings' },
    ],
  },
  {
    kind: 'infographic',
    layout: 'custom',
    styleId: 'minimal',
    formatId: 'square',
    prompt:
      'Anatomy of a perfect grilled cheese: labeled parts, generous margins, two-color palette, nothing overlapping the edge.',
    title: 'Anatomy of a grilled cheese',
    sections: [
      { title: 'The bread', bullets: 'Crisp edges, soft middle' },
      { title: 'The butter', bullets: 'Gold, not grease' },
      { title: 'The cheese', bullets: 'Stretches, never floods' },
      { title: 'The wait', bullets: 'Thirty seconds of patience' },
    ],
  },
]

const SOCIAL_INSPIRE = [
  {
    kind: 'social',
    formatId: 'linkedin_banner',
    styleId: 'corporate',
    prompt:
      'Ultra-wide LinkedIn banner for a quiet design studio. Full-bleed oak and navy. Leave the left side calm for a profile photo. Headline on the right.',
    headline: 'Make work feel like craft',
    subheadline: 'Less noise. Better making.',
  },
  {
    kind: 'social',
    formatId: 'linkedin_post',
    styleId: 'corporate',
    prompt:
      'A LinkedIn feed graphic: sunlit desk, one open notebook, no clutter. Large centered type, professional, full-bleed.',
    headline: 'The 4-hour onboarding',
    subheadline: 'that used to take 4 weeks',
  },
  {
    kind: 'social',
    formatId: 'instagram_post',
    styleId: 'cinematic',
    prompt:
      'A square Instagram still: espresso and a film camera on a marble ledge at golden hour. Bold type inside the margins.',
    headline: 'Monday, but make it slow',
    subheadline: 'Stay for the light',
  },
  {
    kind: 'social',
    formatId: 'instagram_story',
    styleId: 'neon',
    prompt:
      'A 9:16 night-market story. Keep the headline in the middle third, away from the top and bottom UI. Full-bleed, no empty bars.',
    headline: 'Tonight’s special just dropped',
    subheadline: 'Last tray at 11',
  },
  {
    kind: 'social',
    formatId: 'instagram_landscape',
    styleId: 'cinematic',
    prompt:
      'Wide Instagram landscape of a coastline road at dusk, headlights like a thread of gold. Centered type, full-bleed.',
    headline: 'Golden hour is a strategy',
    subheadline: 'Go where the light is',
  },
  {
    kind: 'social',
    formatId: 'facebook_post',
    styleId: 'photoreal',
    prompt:
      'A Facebook post image of a neighborhood bakery window at opening time. Big high-contrast headline that still reads small.',
    headline: 'Open before the city is',
    subheadline: 'Bread, butter, and a quiet table',
  },
  {
    kind: 'social',
    formatId: 'facebook_cover',
    styleId: 'minimal',
    prompt:
      'A panoramic Facebook cover: linen, ceramic, and morning window light across the full width. Keep lower-left quieter. Center-band type.',
    headline: 'A calmer kind of busy',
    subheadline: 'Studio notes, weekly',
  },
  {
    kind: 'social',
    formatId: 'x_post',
    styleId: 'dark_moody',
    prompt:
      'A 16:9 X post: rain on a taxi window, city bokeh, strong center focus. Headline fully on canvas.',
    headline: 'Stop waiting on the weather',
    subheadline: 'Make the scene anyway',
  },
  {
    kind: 'social',
    formatId: 'x_header',
    styleId: 'cinematic',
    prompt:
      'A 3:1 X header of fog over a harbor. Full width, no empty sides. Leave the lower center clear for an avatar.',
    headline: 'Built for the long take',
    subheadline: 'Stories, frames, and quiet ambition',
  },
  {
    kind: 'social',
    formatId: 'youtube_thumbnail',
    styleId: 'playful',
    prompt:
      'A YouTube thumbnail with huge readable type, high contrast, one surprising object (a toaster wearing headphones). No tiny details.',
    headline: 'I TESTED 100 TOASTERS',
    subheadline: 'So you don’t have to',
  },
]

const ALL_INSPIRE = [...IMAGE_INSPIRE, ...INFOGRAPHIC_INSPIRE]
void SOCIAL_INSPIRE

const PROMPT_ARTWORK = [
  {
    src: art1,
    className: 'aig-float-art aig-float-art--1',
    style: { '--dur': '34s', '--dx': '3%', '--dy': '-4%', '--dr': '2deg' },
  },
  {
    src: art2,
    className: 'aig-float-art aig-float-art--2',
    style: { '--dur': '44s', '--dx': '-4%', '--dy': '5%', '--dr': '-3deg', '--delay': '-6s' },
  },
  {
    src: art3,
    className: 'aig-float-art aig-float-art--3',
    style: { '--dur': '38s', '--dx': '5%', '--dy': '4%', '--dr': '3deg', '--delay': '-14s' },
  },
  {
    src: art4,
    className: 'aig-float-art aig-float-art--4',
    style: { '--dur': '29s', '--dx': '-3%', '--dy': '-5%', '--dr': '-2deg', '--delay': '-9s' },
  },
  {
    src: art5,
    className: 'aig-float-art aig-float-art--5',
    style: { '--dur': '50s', '--dx': '4%', '--dy': '6%', '--dr': '4deg', '--delay': '-20s' },
  },
  {
    src: art6,
    className: 'aig-float-art aig-float-art--6',
    style: { '--dur': '41s', '--dx': '-5%', '--dy': '-3%', '--dr': '2deg', '--delay': '-3s' },
  },
]

/** Visual previews for catalog style ids from GET /api/image-gen/styles */
const STYLE_PREVIEW_BY_ID = {
  cinematic:
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=320&auto=format&fit=crop',
  photoreal:
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=320&auto=format&fit=crop',
  flat_illustration:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=320&auto=format&fit=crop',
  '3d_render':
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=320&auto=format&fit=crop',
  watercolor:
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=320&auto=format&fit=crop',
  corporate:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=320&auto=format&fit=crop',
  playful:
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=320&auto=format&fit=crop',
  dark_moody:
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=320&auto=format&fit=crop',
  minimal:
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=320&auto=format&fit=crop',
  neon:
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=320&auto=format&fit=crop',
}

const GEN_STATUS_LINES = [
  'Understanding your prompt…',
  'Composing the frame…',
  'Rendering details…',
  'Polishing the final image…',
]

const DOWNLOAD_FORMATS = [
  { id: 'png', label: 'PNG', hint: 'Best quality', Icon: FileImage },
  { id: 'jpg', label: 'JPG', hint: 'Smaller file', Icon: FileImage },
  { id: 'pdf', label: 'PDF', hint: 'One page', Icon: FileText },
]

const INFOGRAPHIC_STATUS_LINES = [
  'Planning layout and labels…',
  'Drawing the infographic…',
  'Checking on-canvas text…',
  'Polishing numbering and headings…',
]

const PROMPT_PREVIEW_CHARS = 140

function previewPrompt(text = '') {
  const clean = String(text || '').trim()
  if (clean.length <= PROMPT_PREVIEW_CHARS) {
    return { preview: clean, truncated: false }
  }
  return {
    preview: `${clean.slice(0, PROMPT_PREVIEW_CHARS).trimEnd()}…`,
    truncated: true,
  }
}

const stepMotion = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)' },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
}

function formatAspect(w, h) {
  if (!w || !h) return ''
  const g = (a, b) => (b ? g(b, a % b) : a)
  const d = g(w, h) || 1
  return `${w / d}:${h / d}`
}

function collectApiErrorDetails(err) {
  const payload = err?.data && typeof err.data === 'object' ? err.data : {}
  const raw = []
    .concat(payload.errors, payload.data?.errors, err?.errors)
    .filter((item) => item != null && item !== '')
  const texts = raw.map((item) => {
    if (typeof item === 'string') return item.trim()
    if (typeof item?.message === 'string') return item.message.trim()
    return ''
  })
  return texts.filter((text) => text && text !== 'Validation error')
}

function friendlyError(err) {
  if (isInsufficientCreditsError(err)) {
    return 'Not enough credits for this generation. Top up or pick a lighter model.'
  }
  if (err instanceof ImageGenRateLimitError) {
    return err.message || 'Too many requests — wait a moment and try again.'
  }
  if (err instanceof ImageGenProviderError) {
    return err.message || 'The image provider is unavailable right now.'
  }
  const details = collectApiErrorDetails(err)
  if (details.length) return details.join(' · ')
  if (err?.message && err.message !== 'Validation error') return err.message
  if (err?.status === 400) {
    return 'Couldn’t structure this as an infographic. Try a clearer prompt with steps, a comparison, or stats, then generate again.'
  }
  return 'Something went wrong. Please try again.'
}

function getFriendlyModelName(model) {
  const nameMap = {
    'gpt-image-1': 'Standard Quality',
    'gpt-image-1-hd': 'High Quality (HD)',
    'dall-e-3': 'DALL-E 3 (Legacy)',
  }
  return nameMap[model.id] || model.name
}

function LayoutSchematic({ layoutId, size = 'thumb' }) {
  const id = layoutId || 'process'
  return (
    <div className={`aig-sch aig-sch--${id} aig-sch--${size}`} aria-hidden>
      {id === 'process' && (
        <>
          <span className="aig-sch-spine" />
          {['1', '2', '3', '4'].map((n) => (
            <span key={n} className="aig-sch-row">
              <em>{n}</em>
              <i />
            </span>
          ))}
        </>
      )}
      {id === 'comparison' && (
        <>
          <span className="aig-sch-col">
            <b />
            <i />
            <i />
          </span>
          <span className="aig-sch-vs">vs</span>
          <span className="aig-sch-col">
            <b />
            <i />
            <i />
          </span>
        </>
      )}
      {id === 'timeline' && (
        <>
          <span className="aig-sch-line" />
          {['', '', '', ''].map((_, i) => (
            <span key={i} className="aig-sch-tick">
              <em />
              <i />
            </span>
          ))}
        </>
      )}
      {id === 'stats' && (
        <>
          <span className="aig-sch-kpi">
            <b />
            <i />
          </span>
          <span className="aig-sch-kpi">
            <b />
            <i />
          </span>
          <span className="aig-sch-kpi">
            <b />
            <i />
          </span>
          <span className="aig-sch-kpi">
            <b />
            <i />
          </span>
        </>
      )}
      {id === 'hierarchy' && (
        <>
          <span className="aig-sch-root" />
          <span className="aig-sch-fork" />
          <span className="aig-sch-kids">
            <i />
            <i />
            <i />
          </span>
        </>
      )}
      {id === 'list' && (
        <>
          <span className="aig-sch-row">
            <em>1</em>
            <i />
          </span>
          <span className="aig-sch-row">
            <em>2</em>
            <i />
          </span>
          <span className="aig-sch-row">
            <em>3</em>
            <i />
          </span>
        </>
      )}
      {id === 'cycle' && (
        <>
          <span className="aig-sch-cycle" />
          <span className="aig-sch-cycle-dot" />
          <span className="aig-sch-cycle-dot" />
          <span className="aig-sch-cycle-dot" />
        </>
      )}
      {(id === 'auto' || id === 'custom' || id === 'funnel') && (
        <>
          <span className="aig-sch-hero" />
          <span className="aig-sch-mosaic">
            <i />
            <i />
            <i />
          </span>
        </>
      )}
    </div>
  )
}

const LAYOUT_ACCENT = {
  auto: 'sky',
  process: 'indigo',
  timeline: 'cyan',
  comparison: 'violet',
  stats: 'blue',
  hierarchy: 'slate',
  list: 'teal',
  cycle: 'sky',
}

function LayoutCard({ layout, selected, onSelect }) {
  const accent = LAYOUT_ACCENT[layout.id] || 'sky'
  return (
    <motion.button
      type="button"
      className={`aig-layout-card aig-layout-card--${accent} ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(layout.id)}
      aria-pressed={selected}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <div className="aig-layout-thumb">
        <LayoutSchematic layoutId={layout.id} size="thumb" />
        {selected && (
          <span className="aig-layout-check">
            <Check size={11} strokeWidth={2.6} />
          </span>
        )}
      </div>
      <div className="aig-layout-copy">
        <strong>{layout.label || layout.name}</strong>
        <span>{layout.description || layout.desc}</span>
      </div>
    </motion.button>
  )
}

const CANVAS_MOCK_IMAGES = [art1, art2, art3, art4, art5, art6]

const SOCIAL_FORMAT_PREVIEWS = {
  linkedin_banner: linkedinBannerPreview,
  linkedin_post: linkedinPostPreview,
  instagram_post: instagramPostPreview,
  instagram_story: instagramStoryPreview,
  instagram_landscape: instagramLandscapePreview,
  facebook_post: facebookPostPreview,
  facebook_cover: facebookCoverPreview,
  x_post: xPostPreview,
  x_header: xHeaderPreview,
  youtube_thumbnail: youtubeThumbnailPreview,
}

const FORMAT_PREVIEWS = {
  square: formatSquarePreview,
  landscape: formatLandscapePreview,
  portrait: formatPortraitPreview,
}

function formatPreviewSrc(formatId) {
  const s = String(formatId || 'canvas')
  if (FORMAT_PREVIEWS[s]) return FORMAT_PREVIEWS[s]
  if (SOCIAL_FORMAT_PREVIEWS[s]) return SOCIAL_FORMAT_PREVIEWS[s]
  let h = 0
  for (let i = 0; i < s.length; i += 1) h += s.charCodeAt(i) * (i + 3)
  return CANVAS_MOCK_IMAGES[h % CANVAS_MOCK_IMAGES.length]
}

function canvasWashTone(id) {
  const s = String(id || '').toLowerCase()
  if (s.includes('portrait') || s.includes('story')) return 'mist'
  if (s.includes('square') || s.includes('post')) return 'ice'
  return 'deep'
}

function CanvasSmoke({ tone = 'deep' }) {
  return (
    <span className={`aig-canvas-smoke aig-canvas-smoke--${tone}`} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  )
}

function formatMockupKind(format) {
  const id = String(format?.id || '')
  const ratio = (format?.width || 1) / Math.max(format?.height || 1, 1)
  if (id.includes('story') || ratio < 0.7) return 'phone'
  if (ratio >= 2.2) return 'banner'
  if (ratio >= 1.2) return 'landscape'
  return 'square'
}

function CanvasMockup({ format, src, size = 'card' }) {
  const kind = formatMockupKind(format)
  return (
    <div className={`aig-mockup aig-mockup--${kind} aig-mockup--${size}`} aria-hidden>
      <img src={src} alt="" />
    </div>
  )
}

const CANVAS_SHOWCASE = {
  square: {
    kicker: 'Square canvas',
    headline: 'Balanced frames for posts, stills, and product shots.',
  },
  landscape: {
    kicker: 'Landscape canvas',
    headline: 'Wide scenes for headers, slides, and cinematic stills.',
  },
  portrait: {
    kicker: 'Portrait canvas',
    headline: 'Tall frames for stories, posters, and full-body shots.',
  },
}

function formatPillIcon(format) {
  const kind = formatMockupKind(format)
  if (kind === 'phone') return RectangleVertical
  if (kind === 'banner' || kind === 'landscape') return RectangleHorizontal
  return Square
}

function layoutPillIcon(layoutId) {
  const id = String(layoutId || '')
  if (id === 'timeline') return Clock
  if (id === 'comparison') return Columns2
  if (id === 'stats') return BarChart3
  if (id === 'hierarchy') return GitBranch
  if (id === 'list') return ListOrdered
  if (id === 'cycle') return RefreshCw
  if (id === 'process') return ListOrdered
  return Sparkles
}

function formatShowcaseCopy(format) {
  const id = String(format?.id || '')
  return (
    CANVAS_SHOWCASE[id] || {
      kicker: format?.name || 'Canvas',
      headline: `${format?.width} × ${format?.height} — pick this size for your generation.`,
    }
  )
}

function canvasCardSize(format, role) {
  const ratio = (format?.width || 1) / Math.max(format?.height || 1, 1)
  const isHero = role === 'hero'
  const maxW = isHero ? 520 : 200
  const maxH = isHero ? 390 : 250
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  const radius = ratio < 0.75 ? (isHero ? 36 : 22) : ratio > 1.35 ? (isHero ? 22 : 14) : isHero ? 28 : 18
  return {
    width: Math.round(w),
    height: Math.round(h),
    borderRadius: radius,
  }
}

function CanvasPeek({ item, format, onSelect, infographic }) {
  const size = canvasCardSize(format, 'peek')
  const label = item.label || item.name
  return (
    <button
      type="button"
      className={`aig-canvas-peek${infographic ? ' aig-canvas-peek--board' : ''}`}
      style={size}
      onClick={() => onSelect(item.id)}
      aria-label={`Select ${label}`}
    >
      {infographic ? (
        <span className="aig-canvas-peek-board">
          <LayoutSchematic layoutId={item.id} size="thumb" />
        </span>
      ) : (
        <CanvasSmoke tone={canvasWashTone(item.id)} />
      )}
    </button>
  )
}

function CanvasCarousel({ items, selectedId, onSelect, mode = 'image', format }) {
  const list = items?.length ? items : []
  const activeIndex = Math.max(0, list.findIndex((item) => item.id === selectedId))
  const active = list[activeIndex]
  const prev = list.length > 1 ? list[(activeIndex - 1 + list.length) % list.length] : null
  const next = list.length > 1 ? list[(activeIndex + 1) % list.length] : null
  const nextDistinct = next && next.id !== prev?.id ? next : null
  const infographic = mode === 'infographic'
  const cardFormat = infographic ? format : active || format

  if (!active || !cardFormat) {
    return (
      <div className="aig-canvas-preview aig-canvas-preview--empty">
        <div className="aig-canvas-empty-art">
          <Maximize2 size={22} strokeWidth={1.75} />
        </div>
        <p>Select a canvas</p>
        <span>Preview will appear here</span>
      </div>
    )
  }

  const hero = canvasCardSize(cardFormat, 'hero')
  const copy = formatShowcaseCopy(cardFormat)
  const kind = infographic ? 'board' : formatMockupKind(cardFormat)
  const label = active.label || active.name
  const headline = infographic ? active.description || label : copy.headline
  const badge = infographic
    ? `${activeIndex + 1} · ${label}`
    : `${activeIndex + 1} · ${label}`

  return (
    <div className="aig-canvas-showcase">
      <div className="aig-canvas-showcase-row">
        {prev ? (
          <CanvasPeek item={prev} format={cardFormat} onSelect={onSelect} infographic={infographic} />
        ) : (
          <span />
        )}
        <motion.div
          className={`aig-canvas-hero aig-canvas-hero--${kind}`}
          initial={false}
          animate={{
            width: hero.width,
            height: hero.height,
            borderRadius: hero.borderRadius,
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {infographic ? (
              <motion.div
                key={active.id}
                className="aig-canvas-hero-board"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <LayoutSchematic layoutId={active.id} size="stage" />
              </motion.div>
            ) : (
              <motion.div
                key={active.id}
                className="aig-canvas-hero-fill"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <CanvasSmoke tone={canvasWashTone(active.id)} />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="aig-canvas-slide-shade" aria-hidden />
          <span className="aig-canvas-slide-live">
            <i />
            Preview
          </span>
          <div className="aig-canvas-slide-copy">
            <span className="aig-canvas-slide-badge">{badge}</span>
            <p className="aig-canvas-slide-headline">{headline}</p>
          </div>
        </motion.div>
        {nextDistinct ? (
          <CanvasPeek
            item={nextDistinct}
            format={cardFormat}
            onSelect={onSelect}
            infographic={infographic}
          />
        ) : (
          <span />
        )}
      </div>
      <p className="aig-canvas-hero-meta">
        <strong>
          {infographic ? `${label} · ${cardFormat.name}` : cardFormat.name}
        </strong>
        <span>
          {cardFormat.width} × {cardFormat.height} px
        </span>
      </p>
    </div>
  )
}

function GeneratingFrame({ format, label = 'Creating…', size = 'default' }) {
  const ratio = format?.width && format?.height ? format.width / format.height : 1
  const isHero = size === 'hero'
  const maxW = isHero ? 720 : 420
  const maxH = isHero ? 560 : 420
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }

  return (
    <div
      className={`aig-gen-frame ${isHero ? 'aig-gen-frame--hero' : ''}`}
      style={
        isHero
          ? { '--aig-ratio': String(ratio) }
          : { width: w, height: h, maxWidth: '100%' }
      }
    >
      <div className="aig-gen-frame-wash" aria-hidden />
      <div className="aig-gen-frame-grid" aria-hidden />
      <div className="aig-gen-frame-center">
        <span className="aig-gen-frame-mark" aria-hidden>
          <span className="aig-gen-frame-ring" />
          <Sparkles size={isHero ? 22 : 16} strokeWidth={2} />
        </span>
        <span>{label}</span>
      </div>
    </div>
  )
}

function canvasStageSize(format) {
  const ratio = (format?.width || 1) / Math.max(format?.height || 1, 1)
  const maxW = 260
  const maxH = 300
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  return { w: Math.round(w), h: Math.round(h) }
}

function CanvasPreview({ format, mode, infoLayoutId, infoLayoutName }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  if (!format) {
    return (
      <div className="aig-canvas-preview aig-canvas-preview--empty">
        <div className="aig-canvas-empty-art">
          <Maximize2 size={22} strokeWidth={1.75} />
        </div>
        <p>Select a canvas</p>
        <span>Preview will appear here</span>
      </div>
    )
  }

  const isInfographic = mode === 'infographic'
  const previewSrc = isInfographic ? infoBoardPreview : formatPreviewSrc(format.id)
  const kind = isInfographic ? 'board' : formatMockupKind(format)
  const { w, h } = canvasStageSize(format)
  const radius = kind === 'phone' ? 28 : kind === 'banner' ? 12 : 18

  const onMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - box.left) / box.width - 0.5
    const py = (event.clientY - box.top) / box.height - 0.5
    setTilt({ x: py * -10, y: px * 12 })
  }

  return (
    <div className="aig-canvas-preview">
      <div
        className="aig-canvas-preview-well"
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <motion.div
          className={`aig-mockup aig-mockup--${kind} aig-mockup--stage`}
          initial={false}
          animate={{
            width: w,
            height: h,
            borderRadius: radius,
            rotateX: tilt.x,
            rotateY: tilt.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 28,
            mass: 0.9,
          }}
        >
          <img src={previewSrc} alt="" className="aig-canvas-preview-photo" />
          {isInfographic ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={infoLayoutId || 'layout'}
                className="aig-canvas-preview-board"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22 }}
              >
                <LayoutSchematic layoutId={infoLayoutId || 'auto'} size="stage" />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </motion.div>
      </div>
      <motion.div
        className="aig-canvas-preview-meta"
        key={`meta-${format.id}-${infoLayoutId || mode}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <strong>
          {isInfographic && infoLayoutName
            ? `${infoLayoutName} · ${format.name}`
            : format.name}
        </strong>
        <span>
          {format.width} × {format.height} px
        </span>
      </motion.div>
    </div>
  )
}

const THREAD_REFS_KEY = 'athena.vi.imageGen.threadRefs.v1'

function threadRefsKey(workspaceId, threadId) {
  return `${workspaceId || 'ws'}:${threadId || 'draft'}`
}

function loadThreadRefsStore() {
  try {
    const raw = sessionStorage.getItem(THREAD_REFS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveThreadRefsStore(store) {
  try {
    sessionStorage.setItem(THREAD_REFS_KEY, JSON.stringify(store))
  } catch {
    /* quota — thumbs stay in memory for this session */
  }
}

function readThreadRefs(workspaceId, threadId) {
  const row = loadThreadRefsStore()[threadRefsKey(workspaceId, threadId)]
  if (!row?.id && !row?.localImages?.length) return null
  return {
    id: row.id || null,
    localImages: Array.isArray(row.localImages) ? row.localImages : [],
    previews: row.previews || undefined,
  }
}

function writeThreadRefs(workspaceId, threadId, ctx) {
  const store = loadThreadRefsStore()
  const key = threadRefsKey(workspaceId, threadId)
  if (!ctx?.id && !ctx?.localImages?.length) {
    delete store[key]
  } else {
    store[key] = {
      id: ctx.id || null,
      localImages: ctx.localImages || [],
      previews: ctx.previews || null,
    }
  }
  saveThreadRefsStore(store)
}

function localImagesFromContext(ctx) {
  const fromApi = (ctx?.previews?.images || [])
    .map((img) => ({
      name: img?.name || 'Reference',
      src: img?.url || img?.src || '',
    }))
    .filter((img) => img.src)
  if (fromApi.length) return fromApi
  return Array.isArray(ctx?.localImages) ? ctx.localImages.filter((img) => img?.src) : []
}

function revokeContextBlobs(ctx) {
  for (const img of ctx?.localImages || []) {
    if (typeof img?.src === 'string' && img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src)
    }
  }
}

export default function AIImageStudio({ onBack, createContext = null, onOpenBilling = null }) {
  const [step, setStep] = useState('prompt')
  const [prompt, setPrompt] = useState('')
  const [inspiring, setInspiring] = useState(false)
  const [mode, setMode] = useState('image')
  const [infoLayout, setInfoLayout] = useState('auto')
  const [styleHint, setStyleHint] = useState('')
  const [editMode, setEditMode] = useState('auto')
  const [specOpen, setSpecOpen] = useState(false)

  const [workspaceId, setWorkspaceId] = useState(createContext?.workspaceId || null)
  const [folderId, setFolderId] = useState(createContext?.folderId || null)
  const [workspaceMeta, setWorkspaceMeta] = useState(null)
  const [personalCredits, setPersonalCredits] = useState(0)
  const [isTeamPool, setIsTeamPool] = useState(false)
  const [creditsGate, setCreditsGate] = useState(null)
  const [allocateOpen, setAllocateOpen] = useState(false)
  const [savedChats, setSavedChats] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [chatsOpen, setChatsOpen] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [models, setModels] = useState([])
  const [formats, setFormats] = useState([])
  const [styles, setStyles] = useState([])
  const [archetypes, setArchetypes] = useState(FALLBACK_ARCHETYPES)

  const [formatId, setFormatId] = useState('square')
  const [canvasPicked, setCanvasPicked] = useState(false)
  const [modelId, setModelId] = useState('gpt-image-1')
  const [styleId, setStyleId] = useState('cinematic')
  const [estimateAc, setEstimateAc] = useState(null)
  const [creditBalance, setCreditBalance] = useState(null)

  const [generations, setGenerations] = useState([])
  const [thread, setThread] = useState([])
  const [activeGeneration, setActiveGeneration] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStatusIdx, setGenStatusIdx] = useState(0)
  const [actionError, setActionError] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [downloadMenuFor, setDownloadMenuFor] = useState(null)
  const [downloadTargetId, setDownloadTargetId] = useState(null)
  const [busyAction, setBusyAction] = useState('')
  const [fullscreenSrc, setFullscreenSrc] = useState(null)
  const [promptModalText, setPromptModalText] = useState(null)
  const [imageContext, setImageContextState] = useState(null)
  const setImageContext = useCallback((next) => {
    setImageContextState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      if (resolved !== prev) revokeContextBlobs(prev)
      return resolved
    })
  }, [])
  const handleContextChange = useCallback(
    (ctx) => {
      const next = ctx
        ? { ...ctx, localImages: localImagesFromContext(ctx) }
        : null
      setImageContext(next)
      writeThreadRefs(workspaceId, activeThreadId || 'draft', next)
    },
    [workspaceId, activeThreadId, setImageContext]
  )

  useEffect(() => {
    return () => revokeContextBlobs(imageContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const textRef = useRef(null)
  const genAbortRef = useRef(null)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const inspireTimerRef = useRef(null)
  const lastGoodGenRef = useRef(null)

  const resizePromptField = useCallback(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, 148)
    el.style.height = `${Math.max(next, 28)}px`
    el.classList.toggle('is-tall', next > 44)
  }, [])

  useEffect(() => {
    resizePromptField()
  }, [prompt, step, resizePromptField])

  const selectedFormat = useMemo(
    () => formats.find((f) => f.id === formatId) || formats[0] || null,
    [formats, formatId]
  )
  const selectedModel = useMemo(
    () => models.find((m) => m.id === modelId) || models[0] || null,
    [models, modelId]
  )
  const selectedStyle = useMemo(
    () => styles.find((s) => s.id === styleId) || styles[0] || null,
    [styles, styleId]
  )

  const modelsForMode = useMemo(
    () => models.filter((m) => !m.modes?.length || m.modes.includes(mode)).filter((m) => m.id !== 'dall-e-3'),
    [models, mode]
  )
  const genericFormats = useMemo(
    () => formats.filter((f) => f.category === 'generic' || ['square', 'landscape', 'portrait'].includes(f.id)),
    [formats]
  )
  // PARKED social formats:
  // const socialFormats = useMemo(
  //   () => formats.filter((f) => f.category === 'social'),
  //   [formats]
  // )
  const formatsForMode = genericFormats
  const stylesForCurrentMode = useMemo(
    () => stylesForMode(styles, mode),
    [styles, mode]
  )
  const archetypeOptions = useMemo(() => {
    const fromApi = (archetypes || []).map((a) => ({
      id: a.id,
      label: a.label || a.name,
      description: a.description || a.desc || '',
    }))
    const list = fromApi.length ? fromApi : FALLBACK_ARCHETYPES
    return [AUTO_ARCHETYPE, ...list]
  }, [archetypes])
  const selectedInfoLayout = useMemo(
    () => archetypeOptions.find((l) => l.id === infoLayout) || AUTO_ARCHETYPE,
    [archetypeOptions, infoLayout]
  )

  const threadModeLocked = Boolean(activeThreadId && thread.length)

  const switchMode = (nextMode) => {
    if (threadModeLocked) return
    if (nextMode !== 'image' && nextMode !== 'infographic') return
    setMode(nextMode)
    if (nextMode === 'infographic') {
      setFormatId('landscape')
      const hd = pickModelForMode(models, 'infographic')
      if (hd?.id) setModelId(hd.id)
      setStyleId(pickInfographicStyleId(styles, styleId))
    } else {
      const current = formats.find((f) => f.id === formatId)
      if (!current || !['square', 'landscape', 'portrait'].includes(current.id)) {
        setFormatId(genericFormats[0]?.id || 'square')
      }
      const rec = pickModelForMode(models, 'image')
      if (rec?.id) setModelId(rec.id)
    }
  }

  const refreshCredits = useCallback(async (wsId) => {
    if (!wsId) return null
    try {
      const bal = await creditsService.getWorkspaceBalance(wsId)
      const isTeam = isTeamWorkspaceType(bal.workspaceType)
      const pool = isTeam ? bal.workspaceCredits : bal.personalCredits
      const personal = Number(bal.personalCredits) || 0
      setIsTeamPool(isTeam)
      setPersonalCredits(personal)
      setCreditBalance(Number.isFinite(pool) ? pool : personal)
      return {
        isTeam,
        pool: Number.isFinite(pool) ? Number(pool) : personal,
        personal,
      }
    } catch {
      try {
        const personalBal = await creditsService.getPersonalBalance()
        const personal = Number(personalBal.personalCredits) || 0
        setPersonalCredits(personal)
        setCreditBalance(personal)
        return { isTeam: false, pool: personal, personal }
      } catch {
        return null
      }
    }
  }, [])

  const openedThreadRef = useRef(null)

  const loadHistory = useCallback(async (wsId, nextFolderId) => {
    if (!wsId) return
    try {
      const list = await imageGenService.listThreads(wsId, {
        folderId: nextFolderId,
        take: 50,
      })
      setSavedChats(list)
    } catch {
      /* history optional on first load */
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCatalogLoading(true)
      setCatalogError('')
      try {
        const preferredWorkspaceId = createContext?.workspaceId || null
        const preferredFolderId = createContext?.folderId || null
        const ctx = await resolvePresentationWorkspaceContext(
          preferredWorkspaceId
            ? { preferredWorkspaceId, preferredFolderId }
            : {}
        )
        if (cancelled) return
        setWorkspaceId(ctx.workspaceId)
        setFolderId(ctx.folderId)
        setWorkspaceMeta(ctx.workspace || { id: ctx.workspaceId, name: 'Workspace' })

        const catalogs = await imageGenService.getCatalogs()
        if (cancelled) return
        setModels(catalogs.models)
        setFormats(catalogs.formats)
        setStyles(catalogs.styles)
        if (catalogs.archetypes?.length) setArchetypes(catalogs.archetypes)

        const defaultModel = pickModelForMode(catalogs.models, 'image')
        if (defaultModel) setModelId(defaultModel.id)
        if (catalogs.formats.some((f) => f.id === 'square')) setFormatId('square')
        else if (catalogs.formats[0]) setFormatId(catalogs.formats[0].id)
        if (catalogs.styles.some((s) => s.id === 'cinematic')) setStyleId('cinematic')
        else if (catalogs.styles[0]) setStyleId(catalogs.styles[0].id)

        await Promise.all([
          refreshCredits(ctx.workspaceId),
          loadHistory(ctx.workspaceId, ctx.folderId),
        ])
      } catch (err) {
        if (!cancelled) setCatalogError(friendlyError(err))
      } finally {
        if (!cancelled) setCatalogLoading(false)
      }
    })()
    return () => {
      cancelled = true
      genAbortRef.current?.abort?.()
    }
  }, [createContext?.workspaceId, createContext?.folderId, refreshCredits, loadHistory])

  useEffect(() => {
    if (!workspaceId || !modelId) return
    let cancelled = false
    ;(async () => {
      try {
        const est = await imageGenService.estimate(workspaceId, {
          modelId,
          mode,
          tweak: false,
        })
        if (!cancelled) setEstimateAc(est?.athenaCredits ?? null)
      } catch {
        if (!cancelled) setEstimateAc(selectedModel?.creditEstimate ?? null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [workspaceId, modelId, mode, selectedModel?.creditEstimate])

  useEffect(() => {
    if (!modelsForMode.length) return
    if (!modelsForMode.some((m) => m.id === modelId)) {
      const rec = pickModelForMode(models, mode)
      setModelId(rec?.id || modelsForMode[0].id)
    }
  }, [modelsForMode, modelId, models, mode])

  useEffect(() => {
    if (!isGenerating) {
      setGenStatusIdx(0)
      return undefined
    }
    const lines = mode === 'infographic' ? INFOGRAPHIC_STATUS_LINES : GEN_STATUS_LINES
    const id = setInterval(() => {
      setGenStatusIdx((i) => (i + 1) % lines.length)
    }, 2200)
    return () => clearInterval(id)
  }, [isGenerating, mode])

  useEffect(() => {
    if (step !== 'workspace') return
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [thread, isGenerating, step])

  const handleInspire = () => {
    const bank = mode === 'infographic' ? INFOGRAPHIC_INSPIRE : IMAGE_INSPIRE
    const pool = bank.filter((item) => item.prompt !== prompt)
    const next = pool[Math.floor(Math.random() * pool.length)] || bank[0]
    if (!next) return

    if (next.kind === 'infographic') {
      switchMode('infographic')
      if (next.layout) setInfoLayout(next.layout)
    } else {
      switchMode('image')
    }
    setFormatId(
      ['square', 'landscape', 'portrait'].includes(next.formatId)
        ? next.formatId
        : mode === 'infographic'
          ? 'landscape'
          : 'square'
    )
    if (next.styleId) setStyleId(next.styleId)
    void ALL_INSPIRE

    if (inspireTimerRef.current) clearInterval(inspireTimerRef.current)
    setInspiring(true)
    setPrompt('')
    let i = 0
    inspireTimerRef.current = setInterval(() => {
      i += 1
      const typed = next.prompt.slice(0, i)
      setPrompt(typed)
      const el = textRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(typed.length, typed.length)
      }
      if (i >= next.prompt.length) {
        clearInterval(inspireTimerRef.current)
        inspireTimerRef.current = null
        setInspiring(false)
      }
    }, 8)
  }

  useEffect(
    () => () => {
      if (inspireTimerRef.current) clearInterval(inspireTimerRef.current)
    },
    []
  )

  const buildGenerateBody = () => {
    const body = {
      mode,
      folderId,
      modelId,
      formatId: selectedFormat?.id || (mode === 'infographic' ? 'landscape' : 'square'),
      style: styleId,
      styleId,
      prompt: prompt.trim(),
    }
    if (mode === 'infographic') {
      if (infoLayout && infoLayout !== 'auto') body.archetypeHint = infoLayout
      const hint = styleHint.trim()
      if (hint) body.styleHint = hint
    }
    if (imageContext?.id) body.contextId = imageContext.id
    return body
  }

  const buildRegenerateBody = () => {
    const full = buildGenerateBody()
    const { folderId: _folderId, ...rest } = full
    return rest
  }

  const applyResult = (data, turnId) => {
    const gen = data?.generation
    if (!gen) return
    const nextThreadId = data?.thread?.id || data?.actions?.threadId || gen.threadId || activeThreadId
    if (nextThreadId) {
      const draft = readThreadRefs(workspaceId, 'draft')
      if (draft?.id || draft?.localImages?.length) {
        writeThreadRefs(workspaceId, nextThreadId, draft)
        writeThreadRefs(workspaceId, 'draft', null)
      }
      setActiveThreadId(nextThreadId)
    }
    if (data?.thread) setSavedChats((prev) => upsertChatList(prev, data.thread))
    setActiveGeneration(gen)
    lastGoodGenRef.current = gen
    setGenerations((prev) => {
      const rest = prev.filter((g) => g.id !== gen.id)
      return [gen, ...rest]
    })
    if (turnId) {
      setThread((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? { ...t, status: 'done', generation: gen, error: null }
            : t
        )
      )
    }
    refreshCredits(workspaceId)
  }

  const openCreditsGate = (snapshot, needed) => {
    setCreditsGate({
      needed: Number(needed) || 6,
      pool: Number(snapshot?.pool) || 0,
      personal: Number(snapshot?.personal) || 0,
      isTeam: Boolean(snapshot?.isTeam),
    })
  }

  const assertCreditsForGenerate = async () => {
    const needed = Number(estimateAc) > 0 ? Number(estimateAc) : 6
    const snapshot = await refreshCredits(workspaceId)
    if (!snapshot) return true
    if (snapshot.pool >= needed) return true
    openCreditsGate(snapshot, needed)
    return false
  }

  const failTurn = (turnId, message, extra = {}) => {
    if (!turnId) return
    setThread((prev) =>
      prev.map((t) =>
        t.id === turnId
          ? { ...t, status: 'error', error: message, errorKind: extra.errorKind || t.errorKind || null }
          : t
      )
    )
  }

  const lastSuccessfulGeneration = () =>
    lastGoodGenRef.current ||
    [...thread].reverse().find((t) => t.status === 'done' && t.generation?.id)?.generation ||
    activeGeneration ||
    null

  const retryFailedTurn = async (turn) => {
    if (!workspaceId || !turn?.id || isGenerating) return
    const parent = lastSuccessfulGeneration()
    if (!parent?.id) return
    const canCharge = await assertCreditsForGenerate()
    if (!canCharge) return

    setActionError('')
    setBusyAction(turn.kind === 'tweak' ? 'tweak' : 'regenerate')
    setIsGenerating(true)
    setThread((prev) =>
      prev.map((t) =>
        t.id === turn.id ? { ...t, status: 'pending', error: null, errorKind: null } : t
      )
    )
    try {
      let data
      if (turn.kind === 'tweak') {
        const instruction = String(turn.text || '').trim()
        if (!instruction) throw new Error('Nothing to retry.')
        data = activeThreadId
          ? await imageGenService.sendThreadMessage(workspaceId, activeThreadId, instruction, {
              editMode: mode === 'infographic' && editMode !== 'auto' ? editMode : undefined,
              mode,
            })
          : await imageGenService.tweak(workspaceId, parent.id, instruction, {
              editMode: mode === 'infographic' && editMode !== 'auto' ? editMode : undefined,
              mode,
            })
      } else {
        data = await imageGenService.regenerate(workspaceId, parent.id, buildRegenerateBody())
      }
      applyResult(data, turn.id)
    } catch (err) {
      if (isInsufficientCreditsError(err)) {
        const snapshot = await refreshCredits(workspaceId)
        openCreditsGate(snapshot, estimateAc)
        failTurn(turn.id, 'Not enough credits.', { errorKind: 'credits' })
        return
      }
      failTurn(turn.id, friendlyError(err))
    } finally {
      setIsGenerating(false)
      setBusyAction('')
    }
  }

  const openSavedThread = useCallback(
    async (threadId) => {
      if (!workspaceId || !threadId || isGenerating) return
      setActionError('')
      try {
        const saved = await imageGenService.getThread(workspaceId, threadId)
        const turns = turnsFromSavedThread(saved)
        setActiveThreadId(saved.id)
        setSavedChats((prev) => upsertChatList(prev, saved))
        setThread(turns)
        const last = [...turns].reverse().find((t) => t.generation?.url) || turns[turns.length - 1]
        setActiveGeneration(last?.generation || null)
        const stored = readThreadRefs(workspaceId, saved.id)
        let nextContext = stored
        const contextId = saved.contextId || stored?.id
        if (contextId) {
          try {
            const live = await imageGenService.getContext(workspaceId, contextId)
            const apiImages = localImagesFromContext(live)
            nextContext = {
              ...live,
              localImages: apiImages.length ? apiImages : stored?.localImages || [],
            }
          } catch {
            /* keep stored thumbs if GET fails or context expired */
          }
        }
        setImageContext(nextContext)
        const savedMode = saved.mode === 'infographic' ? 'infographic' : 'image'
        setMode(savedMode)
        if (saved.archetype) setInfoLayout(saved.archetype)
        if (saved.modelId) setModelId(saved.modelId)
        if (saved.formatId) setFormatId(saved.formatId)
        if (saved.styleId) setStyleId(saved.styleId)
        setEditMode('auto')
        const firstPrompt = turns.find((t) => t.kind === 'generate')?.text
        if (firstPrompt) setPrompt(firstPrompt)
        setStep('workspace')
        setChatsOpen(false)
      } catch (err) {
        setActionError(friendlyError(err))
      }
    },
    [workspaceId, isGenerating, setImageContext]
  )

  const runGenerate = async () => {
    const hasPrompt = Boolean(prompt.trim())
    if (!workspaceId || isGenerating) return
    if (!folderId) {
      setActionError('Pick a folder first. Image chats are saved in a workspace folder.')
      return
    }
    if (!hasPrompt) {
      setActionError('Add a prompt to generate.')
      return
    }
    const canCharge = await assertCreditsForGenerate()
    if (!canCharge) return
    const turnId = `turn_${Date.now()}`
    setActionError('')
    setIsGenerating(true)
    setChatsOpen(false)
    setStep('workspace')
    setActiveGeneration(null)
    setActiveThreadId(null)
    setThread([
      {
        id: turnId,
        kind: 'generate',
        text: prompt.trim() || (mode === 'infographic' ? 'Generate infographic' : 'Generate image'),
        status: 'pending',
        generation: null,
        error: null,
      },
    ])
    try {
      const data = await imageGenService.generate(workspaceId, buildGenerateBody())
      applyResult(data, turnId)
    } catch (err) {
      if (isInsufficientCreditsError(err)) {
        setStep('options')
        setThread([])
        setActiveGeneration(null)
        const snapshot = await refreshCredits(workspaceId)
        openCreditsGate(snapshot, estimateAc)
        return
      }
      const msg = friendlyError(err)
      setActionError(msg)
      failTurn(turnId, msg)
    } finally {
      setIsGenerating(false)
    }
  }

  const runRegenerate = async (fromGeneration = activeGeneration) => {
    if (!workspaceId || !fromGeneration?.id || isGenerating) return
    const turnId = `turn_${Date.now()}`
    setActiveGeneration(fromGeneration)
    setActionError('')
    setBusyAction('regenerate')
    setIsGenerating(true)
    setThread((prev) => [
      ...prev,
      {
        id: turnId,
        kind: 'regenerate',
        text: prompt.trim() || 'Same prompt, new take',
        status: 'pending',
        generation: null,
        error: null,
      },
    ])
    try {
      const data = await imageGenService.regenerate(
        workspaceId,
        fromGeneration.id,
        buildRegenerateBody()
      )
      applyResult(data, turnId)
    } catch (err) {
      if (isInsufficientCreditsError(err)) {
        const snapshot = await refreshCredits(workspaceId)
        openCreditsGate(snapshot, estimateAc)
        failTurn(turnId, 'Not enough credits for this generation.', { errorKind: 'credits' })
        return
      }
      const msg = friendlyError(err)
      setActionError(msg)
      failTurn(turnId, msg)
    } finally {
      setIsGenerating(false)
      setBusyAction('')
    }
  }

  const submitChat = async () => {
    const instruction = chatInput.trim()
    if (!workspaceId || !activeGeneration?.id || !instruction || isGenerating) return
    if (mode !== 'infographic' && selectedModel?.supportsEdit === false) {
      setActionError('This model does not support image tweaks. Try regenerating instead.')
      return
    }
    if (instruction.length > TWEAK_INSTRUCTION_MAX) {
      setActionError(`Tweak instruction is too long. Maximum ${TWEAK_INSTRUCTION_MAX} characters allowed.`)
      return
    }
    const turnId = `turn_${Date.now()}`
    setChatInput('')
    if (chatInputRef.current) chatInputRef.current.style.height = ''
    setActionError('')
    setBusyAction('tweak')
    setIsGenerating(true)
    setThread((prev) => [
      ...prev,
      {
        id: turnId,
        kind: 'tweak',
        text: instruction,
        status: 'pending',
        generation: null,
        error: null,
      },
    ])
    try {
      const data = activeThreadId
        ? await imageGenService.sendThreadMessage(workspaceId, activeThreadId, instruction, {
            fromGenerationId: activeGeneration.id,
            editMode: mode === 'infographic' && editMode !== 'auto' ? editMode : undefined,
            mode,
          })
        : await imageGenService.tweak(workspaceId, activeGeneration.id, instruction, {
            editMode: mode === 'infographic' && editMode !== 'auto' ? editMode : undefined,
            mode,
          })
      applyResult(data, turnId)
    } catch (err) {
      if (isInsufficientCreditsError(err)) {
        const snapshot = await refreshCredits(workspaceId)
        openCreditsGate(snapshot, estimateAc)
        failTurn(turnId, 'Not enough credits for this tweak.', { errorKind: 'credits' })
        return
      }
      const msg = friendlyError(err)
      setActionError(msg)
      failTurn(turnId, msg)
    } finally {
      setIsGenerating(false)
      setBusyAction('')
    }
  }

  const runDownload = async (format, generationId = downloadTargetId || activeGeneration?.id) => {
    if (!workspaceId || !generationId) return
    setBusyAction(`dl-${generationId}-${format}`)
    setActionError('')
    try {
      await imageGenService.downloadAndSave(workspaceId, generationId, format)
      setDownloadMenuFor(null)
    } catch (err) {
      setActionError(friendlyError(err))
    } finally {
      setBusyAction('')
    }
  }

  const openDownloadModal = (generationId) => {
    if (!generationId) return
    setDownloadTargetId(generationId)
    setDownloadMenuFor(generationId)
  }

  const runDownloadZip = async () => {
    if (!workspaceId || readyTurns.length < 2) return
    setBusyAction('dl-zip')
    setActionError('')
    try {
      await imageGenService.downloadAllAsZip(
        workspaceId,
        readyTurns.map((turn, idx) => ({
          generationId: turn.generation.id,
          name: `${String(idx + 1).padStart(2, '0')}-${versionTitle(turn, idx)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}.png`,
        })),
        'png'
      )
      setDownloadMenuFor(null)
    } catch (err) {
      setActionError(friendlyError(err))
    } finally {
      setBusyAction('')
    }
  }

  const navBack = () => {
    if (step === 'prompt') {
      if (thread.length) setStep('workspace')
      else onBack?.()
    } else if (step === 'canvas') setStep('prompt')
    else if (step === 'options') setStep('canvas')
    else if (step === 'workspace') setStep('options')
  }

  const startNewCreation = () => {
    setActiveThreadId(null)
    setThread([])
    setActiveGeneration(null)
    setChatInput('')
    setActionError('')
    setPrompt('')
    setImageContext(null)
    setChatsOpen(false)
    setStep('prompt')
  }

  const pendingTurn = thread.find((t) => t.status === 'pending') || null
  const selectedTurn =
    thread.find((t) => t.generation?.id === activeGeneration?.id) || null
  const heroTurn = pendingTurn || selectedTurn || thread[thread.length - 1] || null
  const statusLines = mode === 'infographic' ? INFOGRAPHIC_STATUS_LINES : GEN_STATUS_LINES
  const readyTurns = thread.filter((t) => t.status === 'done' && t.generation?.url)
  const downloadTargetTurn =
    readyTurns.find((t) => t.generation?.id === downloadTargetId) ||
    readyTurns.find((t) => t.generation?.id === heroTurn?.generation?.id) ||
    readyTurns[readyTurns.length - 1] ||
    null

  const workspaceHeading = pendingTurn
    ? pendingTurn.kind === 'tweak'
      ? {
          title: 'Applying your tweak',
          sub: 'The next version will land here in a moment.',
        }
      : pendingTurn.kind === 'regenerate'
        ? {
            title: 'A fresh take is on the way',
            sub: 'Same prompt and settings, new interpretation.',
          }
        : {
            title: mode === 'infographic' ? 'Creating your infographic' : 'Creating your image',
            sub: statusLines[genStatusIdx % statusLines.length],
          }
    : heroTurn?.status === 'error'
      ? {
          title: 'That one didn’t land',
          sub: 'Retry this version after you add credits.',
        }
      : {
          title: mode === 'infographic' ? 'Your infographic is ready' : 'Your image is ready',
          sub: '',
        }

  const sourcePrompt =
    thread.find((t) => t.kind !== 'tweak' && t.kind !== 'regenerate')?.text || prompt

  const heroPromptText =
    heroTurn?.kind === 'tweak' ? heroTurn.text : sourcePrompt || heroTurn?.text || ''

  const selectTurn = (turn) => {
    if (turn?.generation) setActiveGeneration(turn.generation)
    document
      .getElementById(`aig-turn-${turn.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const versionTitle = (turn, index) => {
    const n = `v${index + 1}`
    if (turn.kind === 'tweak') return `${n} Tweak`
    if (turn.kind === 'regenerate') return `${n} Regen`
    return `${n} Original`
  }

  const heroMetaBits = [
    mode === 'infographic' ? 'Infographic' : 'Image',
    mode === 'infographic' && selectedInfoLayout?.label ? selectedInfoLayout.label : null,
    selectedStyle?.name,
    selectedFormat?.name,
    selectedModel ? getFriendlyModelName(selectedModel) : null,
    estimateAc != null ? `${estimateAc} AC` : null,
  ].filter(Boolean)

  const infographicSpec =
    heroTurn?.generation?.infographicSpec ||
    heroTurn?.generation?.request?.infographicSpec ||
    null
  const pixelEdited = Boolean(heroTurn?.generation?.request?.pixelEdited)
  const genWarnings = [].concat(heroTurn?.generation?.request?.warnings || []).filter(Boolean)

  const shellClass = `aig-shell aig-shell--${step}`

  useEffect(() => {
    const openId = createContext?.threadId
    if (catalogLoading || !workspaceId || !openId) return
    if (openedThreadRef.current === openId) return
    openedThreadRef.current = openId
    openSavedThread(openId)
  }, [catalogLoading, workspaceId, createContext?.threadId, openSavedThread])

  if (catalogLoading) {
    return (
      <div className="aig-shell aig-shell--loading">
        <div className="aig-loading">
          <span className="aig-loading-orb" aria-hidden>
            <span className="aig-loading-ring" />
            <Sparkles size={15} strokeWidth={2} />
          </span>
          <div className="aig-loading-copy">
            <h2>Image Studio</h2>
            <p>Preparing your workspace</p>
          </div>
          <span className="aig-loading-pulse" aria-hidden />
        </div>
      </div>
    )
  }

  if (catalogError && !formats.length) {
    return (
      <div className="aig-shell aig-shell--loading">
        <div className="aig-loading aig-loading--error">
          <span className="aig-loading-orb" aria-hidden>
            <AlertCircle size={16} strokeWidth={2} />
          </span>
          <div className="aig-loading-copy">
            <h2>Couldn’t open Image Studio</h2>
            <p>{catalogError}</p>
          </div>
          <button type="button" className="aig-btn aig-btn--primary" onClick={onBack}>
            Back home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={shellClass}>
      <div className="aig-main">
      <div className="aig-float-nav">
        <button type="button" className="aig-float-back" onClick={navBack} aria-label="Back">
          <ChevronLeft size={18} strokeWidth={2.25} />
          <span>{step === 'prompt' ? (thread.length ? 'Session' : 'Home') : 'Back'}</span>
        </button>
      </div>

      <div className="aig-float-end">
        <button
          type="button"
          className={`aig-float-chats${chatsOpen ? ' is-open' : ''}`}
          onClick={() => setChatsOpen((v) => !v)}
          aria-expanded={chatsOpen}
          aria-controls="aig-chats-drawer"
        >
          <MessageSquare size={15} strokeWidth={2.2} />
          <span>Chats</span>
          {savedChats.length > 0 && <em>{savedChats.length}</em>}
        </button>
        <div className="aig-float-credits" aria-label="Credits balance">
          <Sparkles size={13} strokeWidth={2.25} />
          <span>{creditBalance == null ? '—' : Math.round(creditBalance).toLocaleString()} AC</span>
        </div>
      </div>

      <div className="aig-body">
        <AnimatePresence mode="wait">
          {/* ── PROMPT ── */}
          {step === 'prompt' && (
            <motion.section key="prompt" className="aig-page aig-page--prompt" {...stepMotion}>
              <div className="aig-prompt-blobs" aria-hidden="true">
                <div className="aig-blob aig-blob--indigo" />
                <div className="aig-blob aig-blob--cyan" />
                <div className="aig-blob aig-blob--cobalt" />
              </div>

              <div className="aig-prompt-art" aria-hidden="true">
                {PROMPT_ARTWORK.map((art) => (
                  <img
                    key={art.className}
                    src={art.src}
                    alt=""
                    className={art.className}
                    style={art.style}
                  />
                ))}
              </div>

              <div className="aig-prompt-dots" aria-hidden="true" />

              <div className="aig-prompt-stage">
                <div className="aig-prompt-spotlight" aria-hidden="true" />
                <nav className="aig-tabs aig-tabs--prompt" aria-label="Studio mode">
                  {MODE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={mode === tab.id ? 'is-on' : ''}
                      aria-pressed={mode === tab.id}
                      disabled={threadModeLocked}
                      onClick={() => switchMode(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
                <h1 className="aig-prompt-title">
                  {mode === 'infographic' ? 'What should this infographic explain?' : 'What do you want to create?'}
                </h1>

                <ImageGenContextAttach
                  workspaceId={workspaceId}
                  context={imageContext}
                  onContextChange={handleContextChange}
                  compact
                >
                  {({ thumbs, trigger, composerBind, isDragOver, error: contextError }) => (
                    <form
                      className="aig-prompt-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (prompt.trim()) setStep('canvas')
                      }}
                    >
                      <div
                        className={`aig-prompt-card aig-glow-ring ${inspiring ? 'is-inspiring' : ''}${
                          isDragOver ? ' is-file-over' : ''
                        }`}
                        {...composerBind}
                      >
                        {thumbs}
                        <div className="aig-prompt-composer">
                          <div className="aig-prompt-field">
                            {trigger}
                            <MarkdownPromptInput
                              ref={textRef}
                              rows={1}
                              placeholder={
                                mode === 'infographic'
                                  ? 'Compare two plans, map a 5-step process, or show quarterly stats…'
                                  : 'A rainy laundromat at 2am, cyan washers, one dryer ajar…'
                              }
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              onPaste={composerBind.onPaste}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  if (prompt.trim()) setStep('canvas')
                                }
                              }}
                              aria-label="Describe the image you want to create"
                              autoFocus
                            />
                          </div>
                          <div className="aig-prompt-actions">
                            <button
                              type="button"
                              className="aig-inspire"
                              onClick={handleInspire}
                              disabled={inspiring}
                              aria-label="Inspire me with a prompt"
                            >
                              <Wand2 size={14} strokeWidth={2.1} />
                              <span>{inspiring ? 'Writing…' : 'Inspire'}</span>
                            </button>
                            <button
                              type="submit"
                              className="aig-prompt-go"
                              disabled={!prompt.trim()}
                              aria-label="Continue"
                            >
                              <Sparkles size={17} strokeWidth={2.1} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {contextError && (
                        <p className="aig-prompt-drop-error" role="alert">
                          {contextError}
                        </p>
                      )}
                    </form>
                  )}
                </ImageGenContextAttach>

                <p className="aig-prompt-hint">
                  Press <kbd>Enter</kbd> to continue
                  <span className="aig-prompt-hint-extra">
                    <span className="aig-prompt-hint-sep" aria-hidden="true">
                      ·
                    </span>
                    Inspire suggests a scene for this canvas
                  </span>
                </p>
              </div>
            </motion.section>
          )}

          {/* ── CANVAS ── */}
          {step === 'canvas' && (
            <motion.section key="canvas" className="aig-page aig-page--canvas" {...stepMotion}>
              <div className="aig-canvas-atmosphere" aria-hidden>
                <img src={canvasAtmosphere} alt="" />
                <span className="aig-canvas-mesh" />
                <span className="aig-canvas-orb aig-canvas-orb--a" />
                <span className="aig-canvas-orb aig-canvas-orb--b" />
                <span className="aig-canvas-orb aig-canvas-orb--c" />
              </div>
              <div className="aig-canvas-board">
                <div className={`aig-canvas-split${mode === 'infographic' ? ' is-info' : ''}`}>
                  <div className="aig-canvas-picker">
                    <header className="aig-canvas-picker-head">
                      <div className="aig-canvas-step">
                        <span>1</span>
                        {mode === 'infographic' ? 'Canvas & layout' : 'Choose Canvas'}
                      </div>
                      <h2>
                        {mode === 'infographic' ? 'Choose canvas & layout' : 'Choose your canvas'}
                      </h2>
                      <p>
                        {mode === 'infographic'
                          ? 'Pick a size, then a structure. Auto is fine if you are not sure.'
                          : 'Pick a format that fits your creative vision'}
                      </p>
                    </header>

                    <nav className="aig-choose-mode" aria-label="Studio mode">
                      {MODE_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          className={mode === tab.id ? 'is-on' : ''}
                          aria-pressed={mode === tab.id}
                          disabled={threadModeLocked}
                          onClick={() => switchMode(tab.id)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>

                    {mode === 'infographic' ? (
                      <div className="aig-choose-sizes" role="listbox" aria-label="Canvas size">
                        {formatsForMode.map((fmt) => {
                          const SizeIcon = formatPillIcon(fmt)
                          return (
                            <button
                              key={fmt.id}
                              type="button"
                              className={formatId === fmt.id ? 'is-on' : ''}
                              aria-pressed={formatId === fmt.id}
                              onClick={() => setFormatId(fmt.id)}
                            >
                              <SizeIcon size={13} strokeWidth={2.2} />
                              {fmt.name}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="aig-canvas-size-block">
                        <nav className="aig-canvas-pills" aria-label="Canvas sizes">
                          {formatsForMode.map((f) => {
                            const Icon = formatPillIcon(f)
                            const on = formatId === f.id
                            return (
                              <button
                                key={f.id}
                                type="button"
                                className={`aig-canvas-pill ${on ? 'is-on' : ''}`}
                                onClick={() => setFormatId(f.id)}
                                aria-pressed={on}
                              >
                                <Icon size={16} strokeWidth={2.1} />
                                <span>{f.name}</span>
                              </button>
                            )
                          })}
                        </nav>
                      </div>
                    )}

                    {mode === 'infographic' ? (
                      <>
                        <p className="aig-choose-kicker">Structure</p>
                        <div className="aig-choose-grid" role="listbox" aria-label="Structures">
                          {archetypeOptions.map((item) => {
                            const on = item.id === infoLayout
                            return (
                              <button
                                key={item.id}
                                type="button"
                                className={`aig-choose-opt aig-choose-sq${on ? ' is-on' : ''}`}
                                aria-pressed={on}
                                onClick={() => setInfoLayout(item.id)}
                              >
                                <span className="aig-choose-sq-art" aria-hidden>
                                  <LayoutSchematic layoutId={item.id} size="thumb" />
                                </span>
                                <strong>{item.label}</strong>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    ) : null}

                    <div className="aig-canvas-actions">
                      <button
                        type="button"
                        className="aig-btn aig-btn--primary aig-btn--lg aig-btn--canvas-continue"
                        disabled={!selectedFormat}
                        onClick={() => setStep('options')}
                      >
                        Continue to Editor
                      </button>
                    </div>
                  </div>

                  <aside className="aig-canvas-stage">
                    <CanvasCarousel
                      items={
                        mode === 'infographic'
                          ? archetypeOptions.map((a) => ({
                              id: a.id,
                              label: a.label,
                              description: a.description,
                            }))
                          : formatsForMode
                      }
                      selectedId={mode === 'infographic' ? infoLayout : formatId}
                      onSelect={(id) => {
                        if (mode === 'infographic') setInfoLayout(id)
                        else setFormatId(id)
                      }}
                      mode={mode}
                      format={selectedFormat}
                    />
                  </aside>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── OPTIONS ── */}
          {step === 'options' && (
            <motion.section key="options" className="aig-page aig-page--options" {...stepMotion}>
              <div className="aig-options-panel">
                <header className="aig-options-head">
                  <div>
                    <h2>Model & style</h2>
                    <p>
                      {MODE_TABS.find((t) => t.id === mode)?.label || 'Image'} canvas
                      {mode === 'infographic' ? ' · HD default · ~2 min' : ''}
                    </p>
                  </div>
                  {estimateAc != null && (
                    <div className="aig-options-cost">
                      <Sparkles size={13} strokeWidth={2.25} />
                      ~{estimateAc} AC
                    </div>
                  )}
                </header>

              <div className="aig-opt-block">
                <h3>Model</h3>
                <div className="aig-model-grid">
                  {modelsForMode.map((m) => {
                    const recommended =
                      mode === 'infographic'
                        ? m.id === 'gpt-image-1-hd' || Boolean(m.recommended)
                        : Boolean(m.recommended)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`aig-model-card ${modelId === m.id ? 'is-selected' : ''}`}
                        onClick={() => setModelId(m.id)}
                      >
                        <div className="aig-model-top">
                          <strong>{getFriendlyModelName(m)}</strong>
                          {recommended && <span className="aig-badge">Recommended</span>}
                        </div>
                        <p>{m.description}</p>
                        <span className="aig-model-cost">~{m.creditEstimate ?? '—'} AC</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="aig-opt-block aig-opt-block--styles">
                <h3>Style</h3>
                <div className="aig-options-styles">
                  <div className="aig-style-hero">
                    {STYLE_PREVIEW_BY_ID[styleId] ? (
                      <img src={STYLE_PREVIEW_BY_ID[styleId]} alt="" />
                    ) : (
                      <span className="aig-style-card-fallback" />
                    )}
                    <div className="aig-style-hero-copy">
                      <span>Selected look</span>
                      <strong>{selectedStyle?.name || 'Style'}</strong>
                    </div>
                  </div>
                  <div className="aig-style-grid">
                    {stylesForCurrentMode.map((s) => {
                      const selected = styleId === s.id
                      const preview = STYLE_PREVIEW_BY_ID[s.id]
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`aig-style-card ${selected ? 'is-selected' : ''}`}
                          onClick={() => setStyleId(s.id)}
                        >
                          <div className="aig-style-card-thumb">
                            {preview ? (
                              <img src={preview} alt="" loading="lazy" />
                            ) : (
                              <span className="aig-style-card-fallback" aria-hidden />
                            )}
                            {selected && (
                              <div className="aig-style-card-check">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <span className="aig-style-card-label">{s.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {mode === 'infographic' && (
                <div className="aig-opt-block">
                  <h3>Style hint</h3>
                  <p className="aig-opt-hint">Optional. Merged with the chip above — e.g. minimal, black and white.</p>
                  <input
                    className="aig-style-hint"
                    type="text"
                    value={styleHint}
                    onChange={(e) => setStyleHint(e.target.value)}
                    placeholder="minimal, navy accents, lots of whitespace"
                    maxLength={300}
                  />
                </div>
              )}

              {actionError && step === 'options' && (
                <p className="aig-error-banner">{actionError}</p>
              )}

              <div className="aig-page-footer aig-page-footer--options">
                <button type="button" className="aig-btn aig-btn--ghost" onClick={() => setStep('canvas')}>
                  Back
                </button>
                <button
                  type="button"
                  className="aig-btn aig-btn--generate"
                  disabled={isGenerating || !prompt.trim()}
                  onClick={runGenerate}
                >
                  <Sparkles size={16} />
                  {mode === 'infographic' ? 'Generate infographic' : 'Generate image'}
                  {estimateAc != null && <em>{estimateAc} AC</em>}
                </button>
              </div>
              </div>
            </motion.section>
          )}

          {/* ── WORKSPACE ── */}
          {step === 'workspace' && (
            <motion.section key="workspace" className="aig-page aig-page--workspace" {...stepMotion}>
              <div className="aig-work">
                <header className="aig-work-top">
                  <div className="aig-work-top-actions">
                    <button
                      type="button"
                      className="aig-work-new"
                      onClick={startNewCreation}
                    >
                      <Plus size={15} strokeWidth={2.4} />
                      <span>New creation</span>
                    </button>
                  </div>
                  <div className="aig-work-heading">
                    <h1>{workspaceHeading.title}</h1>
                    {workspaceHeading.sub ? <p>{workspaceHeading.sub}</p> : null}
                  </div>
                  <div className="aig-work-end">
                    <button
                      type="button"
                      className={`aig-work-chats${chatsOpen ? ' is-open' : ''}`}
                      onClick={() => setChatsOpen((v) => !v)}
                      aria-expanded={chatsOpen}
                    >
                      <MessageSquare size={15} strokeWidth={2.2} />
                      <span>Chats</span>
                      {savedChats.length > 0 && <em>{savedChats.length}</em>}
                    </button>
                    <div className="aig-work-credits" aria-label="Credits balance">
                      <Sparkles size={13} strokeWidth={2.25} />
                      <span>
                        {creditBalance == null
                          ? '—'
                          : Math.round(creditBalance).toLocaleString()}{' '}
                        AC
                      </span>
                    </div>
                  </div>
                </header>

                    <div className="aig-work-board">
                      <section className="aig-work-info" aria-label="Prompt details">
                        {heroTurn && (
                          <div className="aig-work-meta">
                            <div className="aig-work-meta-top">
                              <span className="aig-work-meta-kicker">
                                {versionTitle(
                                  heroTurn,
                                  Math.max(0, thread.findIndex((t) => t.id === heroTurn.id))
                                )}
                              </span>
                              {heroMetaBits.map((bit) => (
                                <span key={bit} className="aig-work-chip">
                                  {bit}
                                </span>
                              ))}
                            </div>
                            <h2 className="aig-work-info-title">Prompt</h2>
                            {imageContext?.localImages?.length > 0 && (
                              <div className="aig-work-refs" aria-label="Uploaded references">
                                {imageContext.localImages.map((img, i) => (
                                  <button
                                    key={`${img.name || 'ref'}-${i}`}
                                    type="button"
                                    className="aig-work-ref"
                                    onClick={() => img.src && setFullscreenSrc(img.src)}
                                    title={img.name || 'Reference'}
                                  >
                                    <img src={img.src} alt={img.name || 'Reference'} />
                                  </button>
                                ))}
                              </div>
                            )}
                            <p className="aig-work-meta-prompt">{heroPromptText}</p>
                            {genWarnings.length > 0 && (
                              <p className="aig-chat-warn">
                                Dense sections were simplified: {genWarnings.join(' · ')}
                              </p>
                            )}
                            {pixelEdited && (
                              <p className="aig-chat-warn">
                                This hop was pixel-edited. For text or structure changes, prefer a spec edit or regenerate from spec.
                              </p>
                            )}
                            {mode === 'infographic' && infographicSpec && (
                              <details
                                className="aig-spec-panel"
                                open={specOpen}
                                onToggle={(e) => setSpecOpen(e.currentTarget.open)}
                              >
                                <summary>Infographic spec</summary>
                                <pre>{JSON.stringify(infographicSpec, null, 2)}</pre>
                              </details>
                            )}
                            {heroTurn.status === 'error' && heroTurn.error && (
                              <p className="aig-chat-error">{heroTurn.error}</p>
                            )}
                          </div>
                        )}

                        <div className="aig-work-cta">
                          <button
                            type="button"
                            className="aig-cta-btn"
                            disabled={isGenerating || !heroTurn?.generation}
                            onClick={() => runRegenerate(heroTurn?.generation)}
                          >
                            <RotateCcw size={15} />
                            Regenerate
                          </button>
                          <button
                            type="button"
                            className="aig-cta-btn aig-cta-btn--primary"
                            disabled={!heroTurn?.generation}
                            onClick={() => openDownloadModal(heroTurn.generation.id)}
                          >
                            <Download size={15} />
                            Download
                          </button>
                        </div>

                          <div className="aig-chat-dock">
                          {actionError && !isGenerating && (
                            <div className="aig-error-banner aig-error-banner--dock">
                              {actionError}
                            </div>
                          )}
                          <label className="aig-chat-label" htmlFor="aig-tweak-input">
                            {mode === 'infographic' ? 'Iterate' : 'Tweak'}
                          </label>
                          {mode === 'infographic' && (
                            <div className="aig-edit-mode" role="group" aria-label="Edit path">
                              {[
                                { id: 'auto', label: 'Auto' },
                                { id: 'spec', label: 'Content' },
                                { id: 'pixel', label: 'Look' },
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  className={editMode === opt.id ? 'is-on' : ''}
                                  onClick={() => setEditMode(opt.id)}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="aig-chat-bar">
                            <textarea
                              id="aig-tweak-input"
                              ref={chatInputRef}
                              className="aig-chat-input"
                              rows={1}
                              placeholder={
                                isGenerating
                                  ? 'Generating…'
                                  : activeGeneration
                                    ? mode === 'infographic'
                                      ? 'Swap steps, rewrite a label, or darken the background…'
                                      : 'Describe a change…'
                                    : 'Generate first, then tweak'
                              }
                              value={chatInput}
                              disabled={isGenerating || !activeGeneration}
                              onChange={(e) => setChatInput(e.target.value)}
                              onInput={(e) => {
                                const el = e.currentTarget
                                el.style.height = '0px'
                                el.style.height = `${Math.min(el.scrollHeight, 72)}px`
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  submitChat()
                                }
                              }}
                              maxLength={TWEAK_INSTRUCTION_MAX}
                            />
                            <div className="aig-chat-tools">
                              {chatInput.length > 0 && (
                                <span
                                  className={`aig-chat-counter${
                                    chatInput.length > TWEAK_INSTRUCTION_MAX - 200
                                      ? ' aig-chat-counter--warn'
                                      : ''
                                  }`}
                                >
                                  {chatInput.length}
                                </span>
                              )}
                              <button
                                type="button"
                                className="aig-chat-send"
                                disabled={isGenerating || !activeGeneration || !chatInput.trim()}
                                onClick={submitChat}
                                aria-label="Send tweak"
                              >
                                <ArrowUp size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </section>

                      <div className="aig-work-stage">
                        <div className="aig-work-hero">
                        {!heroTurn && (
                          <div className="aig-chat-media-fail">
                            <Sparkles size={20} />
                            <span>Your image will appear here</span>
                          </div>
                        )}

                        {heroTurn?.status === 'pending' && (
                          <GeneratingFrame
                            format={selectedFormat}
                            size="hero"
                            label={
                              heroTurn.kind === 'tweak'
                                ? 'Applying tweak…'
                                : heroTurn.kind === 'regenerate'
                                  ? 'Regenerating…'
                                  : mode === 'infographic'
                                    ? 'Creating your infographic…'
                                    : 'Creating your image…'
                            }
                          />
                        )}

                        {heroTurn?.status === 'done' && heroTurn.generation?.url && (
                          <button
                            type="button"
                            className="aig-hero-open"
                            onClick={() => setFullscreenSrc(heroTurn.generation.url)}
                            aria-label="View fullscreen"
                          >
                            <span className="aig-hero-frame">
                              <motion.img
                                key={heroTurn.generation.id}
                                src={heroTurn.generation.url}
                                alt={heroPromptText || heroTurn.text}
                                className="aig-hero-img"
                                initial={{ opacity: 0, scale: 0.985 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                              />
                              <span className="aig-hero-zoom" aria-hidden="true">
                                <Maximize2 size={14} strokeWidth={2.2} />
                              </span>
                            </span>
                          </button>
                        )}

                        {heroTurn?.status === 'error' && (
                          <div className="aig-chat-media-fail">
                            <AlertCircle size={22} />
                            <span>
                              {heroTurn.errorKind === 'credits'
                                ? 'Out of workspace credits'
                                : 'Couldn’t generate'}
                            </span>
                            {heroTurn.error && <em>{heroTurn.error}</em>}
                            <button
                              type="button"
                              className="aig-retry-btn"
                              disabled={isGenerating}
                              onClick={() => retryFailedTurn(heroTurn)}
                            >
                              <RotateCcw size={14} />
                              Retry
                            </button>
                          </div>
                        )}
                        </div>

                        <aside className="aig-work-versions" aria-label="Version history">
                          <div className="aig-work-versions-head">
                            <h2>Versions</h2>
                            <span>{thread.length}</span>
                          </div>
                          <div className="aig-version-list">
                            {thread.length === 0 && (
                              <p className="aig-version-empty">No versions yet</p>
                            )}
                            {thread.map((turn, idx) => (
                              <div
                                key={turn.id}
                                id={`aig-turn-${turn.id}`}
                                className={`aig-version-item ${heroTurn?.id === turn.id ? 'is-active' : ''} ${turn.status === 'error' ? 'is-fail' : ''}`}
                              >
                                <div
                                  className="aig-version-thumb"
                                  onClick={() => selectTurn(turn)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') selectTurn(turn)
                                  }}
                                >
                                  {turn.generation?.url ? (
                                    <img src={turn.generation.url} alt="" />
                                  ) : turn.status === 'pending' ? (
                                    <Loader2 size={14} className="aig-spin" />
                                  ) : turn.status === 'error' ? (
                                    <button
                                      type="button"
                                      className="aig-version-retry"
                                      disabled={isGenerating}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        retryFailedTurn(turn)
                                      }}
                                    >
                                      <RotateCcw size={13} />
                                      Retry
                                    </button>
                                  ) : (
                                    <AlertCircle size={14} />
                                  )}
                                </div>
                                <div className="aig-version-meta">
                                  <strong>{`v${idx + 1}`}</strong>
                                  <span>
                                    {turn.status === 'pending'
                                      ? '…'
                                      : turn.status === 'error'
                                        ? 'Retry'
                                        : turn.kind === 'tweak'
                                          ? 'Tweak'
                                          : turn.kind === 'regenerate'
                                            ? 'Regen'
                                            : 'Original'}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>
                        </aside>
                      </div>
                    </div>
              </div>

              {downloadMenuFor &&
                downloadTargetTurn?.generation &&
                createPortal(
                  <div
                    className="aig-modal-backdrop"
                    onClick={() => !busyAction.startsWith('dl-') && setDownloadMenuFor(null)}
                  >
                    <motion.div
                      className="aig-modal aig-modal--download"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="aig-download-title"
                    >
                      <div className="aig-dl-top">
                        <div>
                          <p className="aig-dl-kicker">Export</p>
                          <h3 id="aig-download-title">Save image</h3>
                        </div>
                        <button
                          type="button"
                          className="aig-dl-close"
                          onClick={() => setDownloadMenuFor(null)}
                          aria-label="Close"
                          disabled={busyAction.startsWith('dl-')}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="aig-dl-preview">
                        <img
                          src={downloadTargetTurn.generation.url}
                          alt=""
                        />
                      </div>

                      {readyTurns.length > 1 && (
                        <div className="aig-dl-versions" role="listbox" aria-label="Version to download">
                          {readyTurns.map((turn, idx) => {
                            const gen = turn.generation
                            const selected = gen.id === downloadTargetTurn.generation.id
                            return (
                              <button
                                key={gen.id}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className={`aig-dl-version ${selected ? 'is-on' : ''}`}
                                onClick={() => setDownloadTargetId(gen.id)}
                              >
                                <img src={gen.url} alt="" />
                                <span>{versionTitle(turn, idx)}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <div className="aig-dl-formats" role="group" aria-label="File format">
                        {DOWNLOAD_FORMATS.map(({ id: fmt, label, hint, Icon }) => (
                          <button
                            key={fmt}
                            type="button"
                            className="aig-dl-format"
                            onClick={() =>
                              runDownload(fmt, downloadTargetTurn.generation.id)
                            }
                            disabled={busyAction.startsWith('dl-')}
                          >
                            <Icon size={16} strokeWidth={2} />
                            <span>
                              <strong>{label}</strong>
                              <em>{hint}</em>
                            </span>
                            {busyAction ===
                            `dl-${downloadTargetTurn.generation.id}-${fmt}` ? (
                              <Loader2 size={14} className="aig-spin" />
                            ) : null}
                          </button>
                        ))}
                      </div>

                      {readyTurns.length > 1 && (
                        <button
                          type="button"
                          className="aig-dl-zip"
                          onClick={runDownloadZip}
                          disabled={busyAction.startsWith('dl-')}
                        >
                          {busyAction === 'dl-zip' ? (
                            <Loader2 size={14} className="aig-spin" />
                          ) : (
                            <Archive size={14} strokeWidth={2.1} />
                          )}
                          <span>
                            {busyAction === 'dl-zip'
                              ? 'Zipping…'
                              : `Download all ${readyTurns.length} as ZIP`}
                          </span>
                        </button>
                      )}
                    </motion.div>
                  </div>,
                  document.body
                )}

              {fullscreenSrc &&
                createPortal(
                  <div
                    className="aig-fullscreen"
                    onClick={() => setFullscreenSrc(null)}
                    role="dialog"
                    aria-modal="true"
                  >
                    <button
                      type="button"
                      className="aig-fullscreen-close"
                      onClick={() => setFullscreenSrc(null)}
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                    <img
                      src={fullscreenSrc}
                      alt="Fullscreen preview"
                      className="aig-fullscreen-img"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>,
                  document.body
                )}

              {promptModalText &&
                createPortal(
                  <div
                    className="aig-modal-backdrop"
                    onClick={() => setPromptModalText(null)}
                  >
                    <motion.div
                      className="aig-modal aig-modal--prompt"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                    >
                      <div className="aig-modal-head">
                        <h3>Full prompt</h3>
                        <button
                          type="button"
                          onClick={() => setPromptModalText(null)}
                          aria-label="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="aig-modal-prompt-body aig-md-preview">
                        {highlightMarkdownSource(promptModalText)}
                      </div>
                      <div className="aig-modal-actions">
                        <button
                          type="button"
                          className="aig-btn aig-btn--primary"
                          onClick={() => setPromptModalText(null)}
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </div>,
                  document.body
                )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {chatsOpen && (
        <div className="aig-chats-backdrop" onClick={() => setChatsOpen(false)} />
      )}
      <aside
        id="aig-chats-drawer"
        className={`aig-chats${chatsOpen ? ' is-open' : ''}`}
        aria-label="Image chats"
        aria-hidden={!chatsOpen}
      >
        <div className="aig-chats-hero">
          <div className="aig-chats-hero-copy">
            <span className="aig-chats-kicker">Image studio</span>
            <strong className="aig-chats-brand">Your chats</strong>
            <p>
              {savedChats.length
                ? `${savedChats.length} conversation${savedChats.length === 1 ? '' : 's'} in this folder`
                : 'Start a conversation and it will live here'}
            </p>
          </div>
          <button
            type="button"
            className="aig-chats-icon-btn"
            onClick={() => setChatsOpen(false)}
            aria-label="Close chats"
          >
            <X size={16} />
          </button>
        </div>
        <button type="button" className="aig-chats-new" onClick={startNewCreation}>
          <Plus size={15} strokeWidth={2.4} />
          <span>New chat</span>
        </button>
        <div className="aig-chats-list">
          {savedChats.length === 0 && (
            <div className="aig-chats-empty">
              <span className="aig-chats-empty-orb" aria-hidden>
                <Sparkles size={18} />
              </span>
              <strong>Nothing here yet</strong>
              <p>Generate an image and this becomes your history.</p>
            </div>
          )}
          {savedChats.map((chat) => {
            const active = chat.id === activeThreadId
            const thumb = chatThumb(chat)
            return (
              <button
                key={chat.id}
                type="button"
                className={`aig-chats-item${active ? ' is-active' : ''}${thumb ? '' : ' is-blank'}`}
                onClick={() => openSavedThread(chat.id)}
                title={chatTitle(chat)}
              >
                <span className="aig-chats-thumb">
                  {thumb ? <img src={thumb} alt="" /> : <Sparkles size={16} />}
                </span>
                <span className="aig-chats-copy">
                  <strong>{chatTitle(chat)}</strong>
                  <em>
                    {[
                      chatWhen(chat),
                      chat.mode === 'infographic' ? 'Infographic' : null,
                      chat.archetype || null,
                      chat.versionCount
                        ? `${chat.versionCount} version${chat.versionCount === 1 ? '' : 's'}`
                        : chat.messageCount
                          ? `${chat.messageCount} messages`
                          : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </em>
                </span>
              </button>
            )
          })}
        </div>
      </aside>
      </div>

      {creditsGate &&
        !allocateOpen &&
        createPortal(
          <div className="aig-modal-backdrop" onClick={() => setCreditsGate(null)}>
            <motion.div
              className="aig-credits-sheet"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="aig-credits-title"
            >
              <button
                type="button"
                className="aig-credits-sheet-close"
                onClick={() => setCreditsGate(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <span className="aig-credits-sheet-kicker">Workspace pool</span>
              <h3 id="aig-credits-title">This workspace is out of AC</h3>
              <p>
                Generation costs <strong>{creditsGate.needed} AC</strong>. Move some from your
                personal balance, or buy more.
              </p>
              <div className="aig-credits-sheet-pills">
                <span>
                  Needs <strong>{creditsGate.needed}</strong>
                </span>
                <span>
                  Workspace <strong>{Math.max(0, Math.round(creditsGate.pool)).toLocaleString()}</strong>
                </span>
                <span>
                  Personal <strong>{Math.max(0, Math.round(creditsGate.personal)).toLocaleString()}</strong>
                </span>
              </div>
              <div className="aig-credits-sheet-actions">
                {creditsGate.isTeam && creditsGate.personal > 0 && (
                  <button
                    type="button"
                    className="aig-credits-sheet-btn aig-credits-sheet-btn--ghost"
                    onClick={() => setAllocateOpen(true)}
                  >
                    <ArrowLeftRight size={16} />
                    Transfer into workspace
                  </button>
                )}
                <button
                  type="button"
                  className="aig-credits-sheet-btn aig-credits-sheet-btn--fill"
                  onClick={() => {
                    setCreditsGate(null)
                    if (onOpenBilling) onOpenBilling()
                    else onBack?.()
                  }}
                >
                  <CreditCard size={16} />
                  Buy credits
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}

      <AllocateCreditsModal
        isOpen={allocateOpen}
        workspace={workspaceMeta}
        onClose={() => setAllocateOpen(false)}
        onSuccess={async () => {
          setAllocateOpen(false)
          setCreditsGate(null)
          await refreshCredits(workspaceId)
        }}
      />
    </div>
  )
}
