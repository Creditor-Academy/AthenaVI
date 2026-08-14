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
} from 'lucide-react'
import imageGenService, {
  ImageGenRateLimitError,
  ImageGenProviderError,
} from '../../../services/imageGenService.js'
import creditsService, { isInsufficientCreditsError } from '../../../services/creditsService.js'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import ImageGenContextAttach from '../../../components/features/image-generation/ImageGenContextAttach.jsx'
import art1 from '../../../assets/ai-img-gen/art-1.jpg'
import art2 from '../../../assets/ai-img-gen/art-2.jpg'
import art3 from '../../../assets/ai-img-gen/art-3.jpg'
import art4 from '../../../assets/ai-img-gen/art-4.jpg'
import art5 from '../../../assets/ai-img-gen/art-5.jpg'
import art6 from '../../../assets/ai-img-gen/art-6.jpg'
import './AIImageStudio.css'

const MODE_TABS = [
  {
    id: 'image',
    label: 'Image',
    blurb: 'General visuals — pick a square, landscape, or portrait canvas.',
  },
  {
    id: 'infographic',
    label: 'Infographic',
    blurb: 'Structured diagrams — choose a layout, then fill sections on the next step.',
  },
  {
    id: 'social',
    label: 'Social',
    blurb: 'Platform creatives — exact pixel sizes for LinkedIn, Instagram, and more.',
  },
]

const INFOGRAPHIC_LAYOUTS = [
  { id: 'process', name: 'Process', desc: 'Steps in a flow' },
  { id: 'comparison', name: 'Comparison', desc: 'Side-by-side contrast' },
  { id: 'timeline', name: 'Timeline', desc: 'Events over time' },
  { id: 'stats', name: 'Stats', desc: 'Numbers & KPIs' },
  { id: 'hierarchy', name: 'Hierarchy', desc: 'Tree / org chart' },
  { id: 'funnel', name: 'Funnel', desc: 'Conversion stages' },
  { id: 'custom', name: 'Custom', desc: 'Freeform structure' },
]

const emptySection = () => ({ title: '', bullets: '' })

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

const ALL_INSPIRE = [...IMAGE_INSPIRE, ...INFOGRAPHIC_INSPIRE, ...SOCIAL_INSPIRE]

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
  return err?.message || 'Something went wrong. Please try again.'
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
      {id === 'funnel' && (
        <>
          <span className="aig-sch-band" />
          <span className="aig-sch-band" />
          <span className="aig-sch-band" />
          <span className="aig-sch-band" />
        </>
      )}
      {id === 'custom' && (
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

function LayoutCard({ layout, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`aig-layout-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(layout.id)}
      aria-pressed={selected}
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
        <strong>{layout.name}</strong>
        <span>{layout.desc}</span>
      </div>
    </button>
  )
}

function FormatCard({ format, selected, onSelect }) {
  const ratio = format.width / Math.max(format.height, 1)
  const stage = 72
  let previewW = stage
  let previewH = stage / ratio
  if (previewH > stage) {
    previewH = stage
    previewW = stage * ratio
  }
  previewW = Math.max(22, Math.round(previewW))
  previewH = Math.max(22, Math.round(previewH))

  const aspect = formatAspect(format.width, format.height)

  return (
    <button
      type="button"
      className={`aig-format-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(format)}
      aria-pressed={selected}
    >
      <div className="aig-format-stage" aria-hidden>
        <div
          className="aig-format-preview"
          style={{ width: previewW, height: previewH }}
        >
          <span className="aig-format-preview-grid" />
          <span className="aig-format-preview-shine" />
        </div>
        {selected && (
          <span className="aig-format-check">
            <Check size={12} strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="aig-format-meta">
        <strong>{format.name}</strong>
        <div className="aig-format-meta-row">
          {aspect ? <span className="aig-format-aspect">{aspect}</span> : null}
          <span className="aig-format-size">
            {format.width}×{format.height}
          </span>
        </div>
      </div>
    </button>
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

function CanvasPreview({ format, mode, infoLayoutId, infoLayoutName }) {
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

  const ratio = format.width / Math.max(format.height, 1)
  const maxW = 340
  const maxH = 380
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }

  const modeLabel = MODE_TABS.find((t) => t.id === mode)?.label || mode
  const aspectLabel = formatAspect(format.width, format.height) || format.name
  const showLayoutVision = mode === 'infographic' && infoLayoutId

  return (
    <div className="aig-canvas-preview">
      <div className="aig-canvas-preview-shell">
        <div className="aig-canvas-preview-ruler aig-canvas-preview-ruler--top" aria-hidden>
          <span>{format.width}px</span>
        </div>
        <div className="aig-canvas-preview-body">
          <div className="aig-canvas-preview-ruler aig-canvas-preview-ruler--side" aria-hidden>
            <span>{format.height}px</span>
          </div>
          <motion.div
            className={`aig-canvas-preview-frame aig-canvas-preview-frame--${mode}${showLayoutVision ? ' has-vision' : ''}`}
            initial={false}
            animate={{ width: w, height: h }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 28,
              mass: 0.9,
            }}
          >
            {!showLayoutVision && (
              <>
                <span className="aig-canvas-preview-grid" aria-hidden />
                <span className="aig-canvas-preview-orb aig-canvas-preview-orb--a" aria-hidden />
                <span className="aig-canvas-preview-orb aig-canvas-preview-orb--b" aria-hidden />
                <span className="aig-canvas-preview-orb aig-canvas-preview-orb--c" aria-hidden />
              </>
            )}
            <span className="aig-canvas-corner aig-canvas-corner--tl" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--tr" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--bl" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--br" aria-hidden />

            {showLayoutVision ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={infoLayoutId}
                  className="aig-canvas-preview-vision"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                >
                  <LayoutSchematic layoutId={infoLayoutId} size="stage" />
                  <p>{infoLayoutName} layout</p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <span className="aig-canvas-preview-badge">
                {modeLabel}
                <em>{aspectLabel}</em>
              </span>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="aig-canvas-preview-meta"
        key={`meta-${format.id}-${infoLayoutId || mode}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <strong>
          {showLayoutVision ? `${infoLayoutName} on ${format.name}` : format.name}
        </strong>
        <span>
          {format.width} × {format.height} px
          {showLayoutVision
            ? ' · structure preview — not the final graphic'
            : ''}
        </span>
      </motion.div>
    </div>
  )
}

export default function AIImageStudio({ onBack, createContext = null }) {
  const [step, setStep] = useState('prompt')
  const [prompt, setPrompt] = useState('')
  const [inspiring, setInspiring] = useState(false)
  const [headline, setHeadline] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [mode, setMode] = useState('image')
  const [infoLayout, setInfoLayout] = useState('process')
  const [infoTitle, setInfoTitle] = useState('')
  const [infoSections, setInfoSections] = useState([emptySection(), emptySection(), emptySection()])

  const [workspaceId, setWorkspaceId] = useState(createContext?.workspaceId || null)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [models, setModels] = useState([])
  const [formats, setFormats] = useState([])
  const [styles, setStyles] = useState([])

  const [formatId, setFormatId] = useState('square')
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
  const [busyAction, setBusyAction] = useState('')
  const [fullscreenSrc, setFullscreenSrc] = useState(null)
  const [promptModalText, setPromptModalText] = useState(null)
  const [imageContext, setImageContext] = useState(null)

  const textRef = useRef(null)
  const genAbortRef = useRef(null)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const inspireTimerRef = useRef(null)

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
    () => formats.filter((f) => f.category === 'generic'),
    [formats]
  )
  const socialFormats = useMemo(
    () => formats.filter((f) => f.category === 'social'),
    [formats]
  )
  const formatsForMode = mode === 'social' ? socialFormats : genericFormats
  const selectedInfoLayout = useMemo(
    () => INFOGRAPHIC_LAYOUTS.find((l) => l.id === infoLayout) || INFOGRAPHIC_LAYOUTS[0],
    [infoLayout]
  )
  const filledInfoSections = useMemo(
    () =>
      infoSections
        .map((s) => ({
          title: s.title.trim(),
          bullets: String(s.bullets || '')
            .split('\n')
            .map((b) => b.trim())
            .filter(Boolean),
        }))
        .filter((s) => s.title || s.bullets.length),
    [infoSections]
  )

  const switchMode = (nextMode) => {
    setMode(nextMode)
    if (nextMode === 'social') {
      const current = formats.find((f) => f.id === formatId)
      if (!current || current.category !== 'social') {
        setFormatId(socialFormats[0]?.id || 'instagram_post')
      }
    } else {
      const current = formats.find((f) => f.id === formatId)
      if (!current || current.category !== 'generic') {
        setFormatId(genericFormats[0]?.id || 'square')
      }
    }
  }

  const refreshCredits = useCallback(async (wsId) => {
    if (!wsId) return
    try {
      const bal = await creditsService.getWorkspaceBalance(wsId)
      const value = isTeamWorkspaceType(bal.workspaceType)
        ? bal.workspaceCredits
        : bal.personalCredits
      setCreditBalance(Number.isFinite(value) ? value : bal.personalCredits)
    } catch {
      try {
        const personal = await creditsService.getPersonalBalance()
        setCreditBalance(personal.personalCredits)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const loadHistory = useCallback(async (wsId) => {
    if (!wsId) return
    try {
      const list = await imageGenService.listGenerations(wsId, { take: 50 })
      setGenerations(list)
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
        const ctx = await resolvePresentationWorkspaceContext({
          preferredWorkspaceId: createContext?.workspaceId || null,
          preferredFolderId: createContext?.folderId || null,
        })
        if (cancelled) return
        setWorkspaceId(ctx.workspaceId)

        const catalogs = await imageGenService.getCatalogs()
        if (cancelled) return
        setModels(catalogs.models)
        setFormats(catalogs.formats)
        setStyles(catalogs.styles)

        const defaultModel =
          catalogs.models.find((m) => m.recommended) || catalogs.models[0]
        if (defaultModel) setModelId(defaultModel.id)
        if (catalogs.formats.some((f) => f.id === 'square')) setFormatId('square')
        else if (catalogs.formats[0]) setFormatId(catalogs.formats[0].id)
        if (catalogs.styles.some((s) => s.id === 'cinematic')) setStyleId('cinematic')
        else if (catalogs.styles[0]) setStyleId(catalogs.styles[0].id)

        await Promise.all([
          refreshCredits(ctx.workspaceId),
          loadHistory(ctx.workspaceId),
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
      setModelId(modelsForMode[0].id)
    }
  }, [modelsForMode, modelId])

  useEffect(() => {
    if (!isGenerating) {
      setGenStatusIdx(0)
      return undefined
    }
    const id = setInterval(() => {
      setGenStatusIdx((i) => (i + 1) % GEN_STATUS_LINES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [isGenerating])

  useEffect(() => {
    if (step !== 'workspace') return
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [thread, isGenerating, step])

  const handleInspire = () => {
    const bank =
      step === 'options' || step === 'canvas'
        ? mode === 'infographic'
          ? INFOGRAPHIC_INSPIRE
          : mode === 'social'
            ? SOCIAL_INSPIRE
            : IMAGE_INSPIRE
        : ALL_INSPIRE

    const pool = bank.filter((item) => item.prompt !== prompt)
    const next = pool[Math.floor(Math.random() * pool.length)] || bank[0]
    if (!next) return

    if (next.kind === 'infographic') {
      switchMode('infographic')
      if (next.layout) setInfoLayout(next.layout)
      if (next.title) setInfoTitle(next.title)
      if (next.sections?.length) {
        setInfoSections(
          next.sections.map((s) => ({
            title: s.title || '',
            bullets: s.bullets || '',
          }))
        )
      }
      setFormatId(next.formatId || 'portrait')
      if (next.styleId) setStyleId(next.styleId)
    } else if (next.kind === 'social') {
      switchMode('social')
      setHeadline(next.headline || '')
      setSubheadline(next.subheadline || '')
      setFormatId(next.formatId || 'instagram_post')
      if (next.styleId) setStyleId(next.styleId)
    } else {
      switchMode('image')
      setFormatId(next.formatId || 'square')
      if (next.styleId) setStyleId(next.styleId)
    }

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
      modelId,
      formatId: selectedFormat?.id,
      styleId,
      prompt: prompt.trim() || undefined,
      name: `athena-${Date.now()}.png`,
    }
    if (imageContext?.id) body.contextId = imageContext.id
    if (mode === 'social') {
      if (headline.trim()) body.headline = headline.trim()
      if (subheadline.trim()) body.subheadline = subheadline.trim()
    }
    if (mode === 'infographic') {
      body.infographic = {
        layout: infoLayout,
        title: infoTitle.trim() || undefined,
        sections: filledInfoSections.map((s) => ({
          title: s.title || undefined,
          bullets: s.bullets.length ? s.bullets : undefined,
        })),
      }
    }
    return body
  }

  const applyResult = (data, turnId) => {
    const gen = data?.generation
    if (!gen) return
    setActiveGeneration(gen)
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

  const failTurn = (turnId, message) => {
    if (!turnId) return
    setThread((prev) =>
      prev.map((t) => (t.id === turnId ? { ...t, status: 'error', error: message } : t))
    )
  }

  const runGenerate = async () => {
    const hasPrompt = Boolean(prompt.trim())
    const hasSections = mode === 'infographic' && filledInfoSections.length > 0
    if (!workspaceId || isGenerating) return
    if (!hasPrompt && !hasSections) {
      setActionError('Add a prompt or at least one infographic section.')
      return
    }
    const turnId = `turn_${Date.now()}`
    setActionError('')
    setIsGenerating(true)
    setStep('workspace')
    setActiveGeneration(null)
    setThread([
      {
        id: turnId,
        kind: 'generate',
        text: prompt.trim() || infoTitle.trim() || 'Generate image',
        status: 'pending',
        generation: null,
        error: null,
      },
    ])
    try {
      const data = await imageGenService.generate(workspaceId, buildGenerateBody())
      applyResult(data, turnId)
    } catch (err) {
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
        buildGenerateBody()
      )
      applyResult(data, turnId)
    } catch (err) {
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
    if (selectedModel?.supportsEdit === false) {
      setActionError('This model does not support image tweaks. Try regenerating instead.')
      return
    }
    if (instruction.length > 2000) {
      setActionError('Tweak instruction is too long. Maximum 2000 characters allowed.')
      return
    }
    const turnId = `turn_${Date.now()}`
    setChatInput('')
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
      const data = await imageGenService.tweak(workspaceId, activeGeneration.id, instruction)
      applyResult(data, turnId)
    } catch (err) {
      const msg = friendlyError(err)
      setActionError(msg)
      failTurn(turnId, msg)
    } finally {
      setIsGenerating(false)
      setBusyAction('')
    }
  }

  const runDownload = async (format, generationId = activeGeneration?.id) => {
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

  const navBack = () => {
    if (step === 'prompt') {
      if (thread.length) setStep('workspace')
      else onBack?.()
    } else if (step === 'canvas') setStep('prompt')
    else if (step === 'options') setStep('canvas')
    else if (step === 'workspace') setStep('options')
  }

  const startNewCreation = () => {
    setStep('prompt')
  }

  const focusTweakInput = () => {
    const el = chatInputRef.current
    if (!el || isGenerating) return
    el.focus()
    el.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const pendingTurn = thread.find((t) => t.status === 'pending') || null
  const selectedTurn =
    thread.find((t) => t.generation?.id === activeGeneration?.id) || null
  const heroTurn = pendingTurn || selectedTurn || thread[thread.length - 1] || null

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
            title: 'Creating your image',
            sub: GEN_STATUS_LINES[genStatusIdx],
          }
    : heroTurn?.status === 'error'
      ? {
          title: 'That one didn’t land',
          sub: 'Try a tweak, or generate a new version.',
        }
      : {
          title: 'Your image is ready',
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
    selectedStyle?.name,
    selectedFormat?.name,
    selectedModel ? getFriendlyModelName(selectedModel) : null,
    estimateAc != null ? `${estimateAc} AC` : null,
  ].filter(Boolean)

  const shellClass = `aig-shell aig-shell--${step}`

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
      <button type="button" className="aig-float-back" onClick={navBack} aria-label="Back">
        <ChevronLeft size={18} strokeWidth={2.25} />
        <span>{step === 'prompt' ? (thread.length ? 'Session' : 'Home') : 'Back'}</span>
      </button>

      <div className="aig-float-credits" aria-label="Credits balance">
        <Sparkles size={13} strokeWidth={2.25} />
        <span>{creditBalance == null ? '—' : Math.round(creditBalance).toLocaleString()} AC</span>
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
                <h1 className="aig-prompt-title">What do you want to create?</h1>

                <ImageGenContextAttach
                  workspaceId={workspaceId}
                  context={imageContext}
                  onContextChange={setImageContext}
                  compact
                >
                  {({ thumbs, trigger }) => (
                    <form
                      className="aig-prompt-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (prompt.trim()) setStep('canvas')
                      }}
                    >
                      <div
                        className={`aig-prompt-card aig-glow-ring ${inspiring ? 'is-inspiring' : ''}`}
                      >
                        {thumbs}
                        <div className="aig-prompt-composer">
                          <div className="aig-prompt-field">
                            {trigger}
                            <textarea
                              ref={textRef}
                              className="aig-prompt-input"
                              rows={1}
                              placeholder="A rainy laundromat, a how-storms-work diagram, a YouTube thumbnail…"
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
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
                    </form>
                  )}
                </ImageGenContextAttach>

                <p className="aig-prompt-hint">
                  Press <kbd>Enter</kbd> to continue
                  <span className="aig-prompt-hint-extra">
                    <span className="aig-prompt-hint-sep" aria-hidden="true">
                      ·
                    </span>
                    Inspire cycles images, infographics, and social ideas
                  </span>
                </p>
              </div>
            </motion.section>
          )}

          {/* ── CANVAS ── */}
          {step === 'canvas' && (
            <motion.section key="canvas" className="aig-page aig-page--canvas" {...stepMotion}>
              <div className="aig-canvas-split">
                <div className="aig-canvas-picker">
                  <header className="aig-canvas-picker-head">
                    <h2>Choose canvas</h2>
                    <p>Pick a mode, then a size. Preview updates on the right.</p>
                  </header>

                  <div className="aig-tabs aig-tabs--modes" role="tablist" aria-label="Generation mode">
                    {MODE_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={mode === tab.id}
                        className={mode === tab.id ? 'is-on' : ''}
                        onClick={() => switchMode(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="aig-format-grid">
                    {formatsForMode.map((f) => (
                      <FormatCard
                        key={f.id}
                        format={f}
                        selected={formatId === f.id}
                        onSelect={(fmt) => setFormatId(fmt.id)}
                      />
                    ))}
                  </div>

                  {mode === 'infographic' && (
                    <div className="aig-layout-block">
                      <h3>Layout</h3>
                      <div className="aig-layout-grid">
                        {INFOGRAPHIC_LAYOUTS.map((layout) => (
                          <LayoutCard
                            key={layout.id}
                            layout={layout}
                            selected={infoLayout === layout.id}
                            onSelect={setInfoLayout}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="aig-canvas-actions">
                    <button
                      type="button"
                      className="aig-btn aig-btn--primary aig-btn--lg"
                      disabled={!selectedFormat}
                      onClick={() => setStep('options')}
                    >
                      Continue
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <aside className="aig-canvas-stage">
                  <CanvasPreview
                    format={selectedFormat}
                    mode={mode}
                    infoLayoutId={mode === 'infographic' ? infoLayout : null}
                    infoLayoutName={selectedInfoLayout?.name}
                  />
                </aside>
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
                      {MODE_TABS.find((t) => t.id === mode)?.label || mode} canvas
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
                  {modelsForMode.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`aig-model-card ${modelId === m.id ? 'is-selected' : ''}`}
                      onClick={() => setModelId(m.id)}
                    >
                      <div className="aig-model-top">
                        <strong>{getFriendlyModelName(m)}</strong>
                        {m.recommended && <span className="aig-badge">Recommended</span>}
                      </div>
                      <p>{m.description}</p>
                      <span className="aig-model-cost">~{m.creditEstimate ?? '—'} AC</span>
                    </button>
                  ))}
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
                    {styles.map((s) => {
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
                <div className="aig-opt-block aig-opt-block--info">
                  <div className="aig-opt-block-head">
                    <h3>Infographic content</h3>
                    <button
                      type="button"
                      className="aig-inspire"
                      onClick={handleInspire}
                      disabled={inspiring}
                    >
                      <Wand2 size={14} strokeWidth={2.1} />
                      <span>{inspiring ? 'Writing…' : 'Inspire'}</span>
                    </button>
                  </div>
                  <label className="aig-field-full">
                    Title
                    <input
                      type="text"
                      value={infoTitle}
                      onChange={(e) => setInfoTitle(e.target.value)}
                      placeholder="Onboarding"
                      maxLength={200}
                    />
                  </label>
                  <div className="aig-sections">
                    {infoSections.map((section, idx) => (
                      <div key={idx} className="aig-section-card">
                        <div className="aig-section-head">
                          <strong>Section {idx + 1}</strong>
                          {infoSections.length > 1 && (
                            <button
                              type="button"
                              className="aig-link"
                              onClick={() =>
                                setInfoSections((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            setInfoSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, title: e.target.value } : s))
                            )
                          }
                          placeholder="Section title"
                          maxLength={200}
                        />
                        <textarea
                          value={section.bullets}
                          onChange={(e) =>
                            setInfoSections((prev) =>
                              prev.map((s, i) =>
                                i === idx ? { ...s, bullets: e.target.value } : s
                              )
                            )
                          }
                          placeholder="One bullet per line"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                  {infoSections.length < 12 && (
                    <button
                      type="button"
                      className="aig-btn aig-btn--ghost"
                      onClick={() => setInfoSections((prev) => [...prev, emptySection()])}
                    >
                      Add section
                    </button>
                  )}
                </div>
              )}

              {mode === 'social' && (
                <div className="aig-opt-block aig-opt-block--social">
                  <div className="aig-opt-block-head">
                    <h3>Optional text overlay</h3>
                    <button
                      type="button"
                      className="aig-inspire"
                      onClick={handleInspire}
                      disabled={inspiring}
                    >
                      <Wand2 size={14} strokeWidth={2.1} />
                      <span>{inspiring ? 'Writing…' : 'Inspire'}</span>
                    </button>
                  </div>
                  <p className="aig-opt-hint">
                    Add headline and subheadline for better on-canvas text. Keep copy short for readability.
                  </p>
                  <div className="aig-field-row">
                    <label>
                      Headline
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Create faster"
                        maxLength={80}
                      />
                    </label>
                    <label>
                      Subheadline
                      <input
                        type="text"
                        value={subheadline}
                        onChange={(e) => setSubheadline(e.target.value)}
                        placeholder="AI instructor studio"
                        maxLength={120}
                      />
                    </label>
                  </div>
                  {selectedFormat?.safeZone && (
                    <div className="aig-safe-zone-tip">
                      <span className="aig-safe-zone-label">Safe zone:</span>
                      <span className="aig-safe-zone-text">{selectedFormat.safeZone}</span>
                    </div>
                  )}
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
                  disabled={
                    isGenerating ||
                    (!prompt.trim() &&
                      !(mode === 'infographic' && filledInfoSections.length > 0))
                  }
                  onClick={runGenerate}
                >
                  <Sparkles size={16} />
                  Generate {mode === 'infographic' ? 'infographic' : 'image'}
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
                  <button
                    type="button"
                    className="aig-work-new"
                    onClick={startNewCreation}
                  >
                    <Plus size={15} strokeWidth={2.4} />
                    <span>New creation</span>
                  </button>
                  <div className="aig-work-heading">
                    <h1>{workspaceHeading.title}</h1>
                    {workspaceHeading.sub ? <p>{workspaceHeading.sub}</p> : null}
                  </div>
                  <div className="aig-work-credits" aria-label="Credits balance">
                    <Sparkles size={13} strokeWidth={2.25} />
                    <span>
                      {creditBalance == null
                        ? '—'
                        : Math.round(creditBalance).toLocaleString()}{' '}
                      AC
                    </span>
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
                            <p className="aig-work-meta-prompt">{heroPromptText}</p>
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
                            className="aig-cta-btn"
                            disabled={isGenerating || !activeGeneration}
                            onClick={focusTweakInput}
                          >
                            <Wand2 size={15} />
                            Tweak
                          </button>
                          <div className="aig-download-wrap aig-cta-download">
                            <button
                              type="button"
                              className="aig-cta-btn aig-cta-btn--primary"
                              disabled={!heroTurn?.generation}
                              onClick={() =>
                                setDownloadMenuFor((id) =>
                                  id === heroTurn?.generation?.id ? null : heroTurn.generation.id
                                )
                              }
                            >
                              <Download size={15} />
                              Download
                            </button>
                            {heroTurn?.generation && downloadMenuFor === heroTurn.generation.id && (
                              <div className="aig-download-menu aig-download-menu--cta">
                                {['png', 'jpg', 'pdf'].map((fmt) => (
                                  <button
                                    key={fmt}
                                    type="button"
                                    onClick={() => runDownload(fmt, heroTurn.generation.id)}
                                    disabled={busyAction.startsWith(
                                      `dl-${heroTurn.generation.id}-`
                                    )}
                                  >
                                    {busyAction === `dl-${heroTurn.generation.id}-${fmt}`
                                      ? 'Saving…'
                                      : fmt.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="aig-chat-dock">
                          {actionError && !isGenerating && (
                            <div className="aig-error-banner aig-error-banner--dock">
                              {actionError}
                            </div>
                          )}
                          <div className="aig-chat-bar">
                            <textarea
                              ref={chatInputRef}
                              className="aig-chat-input"
                              rows={2}
                              placeholder={
                                isGenerating
                                  ? 'Hang tight — your image is generating…'
                                  : activeGeneration
                                    ? 'Describe a change and press Enter…'
                                    : 'Generate an image first, then tweak here…'
                              }
                              value={chatInput}
                              disabled={isGenerating || !activeGeneration}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  submitChat()
                                }
                              }}
                              maxLength={2000}
                            />
                            <div className="aig-chat-counter">
                              <span
                                className={chatInput.length > 1900 ? 'aig-chat-counter--warn' : ''}
                              >
                                {chatInput.length}/2000
                              </span>
                            </div>
                            <button
                              type="button"
                              className="aig-chat-send"
                              disabled={isGenerating || !activeGeneration || !chatInput.trim()}
                              onClick={submitChat}
                              aria-label="Send tweak"
                            >
                              <ArrowUp size={18} strokeWidth={2.5} />
                            </button>
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
                            <span>Couldn’t generate</span>
                            {heroTurn.error && <em>{heroTurn.error}</em>}
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
                              <button
                                key={turn.id}
                                id={`aig-turn-${turn.id}`}
                                type="button"
                                className={`aig-version-item ${heroTurn?.id === turn.id ? 'is-active' : ''}`}
                                onClick={() => selectTurn(turn)}
                              >
                                <div className="aig-version-thumb">
                                  {turn.generation?.url ? (
                                    <img src={turn.generation.url} alt="" />
                                  ) : turn.status === 'pending' ? (
                                    <Loader2 size={14} className="aig-spin" />
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
                                        ? 'Fail'
                                        : turn.kind === 'tweak'
                                          ? 'Tweak'
                                          : turn.kind === 'regenerate'
                                            ? 'Regen'
                                            : 'Original'}
                                  </span>
                                </div>
                              </button>
                            ))}
                            <div ref={chatEndRef} />
                          </div>
                        </aside>
                      </div>
                    </div>
              </div>

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
                      <div className="aig-modal-prompt-body">{promptModalText}</div>
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
    </div>
  )
}
