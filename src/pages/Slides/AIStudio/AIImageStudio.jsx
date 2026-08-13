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
  ArrowRight,
  ArrowUp,
  Maximize2,
  X,
  Home,
  Pencil,
  Zap,
} from 'lucide-react'
import imageGenService, {
  ImageGenRateLimitError,
  ImageGenProviderError,
} from '../../../services/imageGenService.js'
import creditsService, { isInsufficientCreditsError } from '../../../services/creditsService.js'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext.js'
import { isTeamWorkspaceType } from '../../../utils/creditTransactions.js'
import ImageGenContextAttach, {
  contextPreviewBadge,
} from '../../../components/features/image-generation/ImageGenContextAttach.jsx'
import './AIImageStudio.css'

const STEPS = [
  { id: 'prompt', label: 'Prompt', num: 1 },
  { id: 'canvas', label: 'Canvas', num: 2 },
  { id: 'options', label: 'Options', num: 3 },
  { id: 'review', label: 'Generate', num: 4 },
]

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

const EXAMPLE_PROMPTS = [
  'A lone astronaut on a vast red Martian desert at golden hour, cinematic wide shot, volumetric dust, photorealistic',
  'Dense neon-lit Tokyo alley at 2am in heavy rain, cobblestones reflecting neon signs, 35mm film grain',
  'Hyper-realistic portrait of an elderly Icelandic fisherman, weathered wrinkles, pale blue eyes, overcast coastal light',
  'Abstract macro of deep navy and molten gold liquid swirls frozen mid-motion, luxury texture',
  'Futuristic matte black electric hypercar on a salt flat at dusk, ultra-low angle, dramatic storm clouds',
  'Hidden waterfall deep inside a lush ancient jungle, sunlight through giant ferns, long exposure silk water',
]

const SUGGESTION_PILLS = [
  'Soft daylight photography',
  'Editorial illustration',
  'Minimal, lots of empty space',
  'Warm film grain',
  'Bold graphic poster',
  'Cinematic wide shot',
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

function StepProgress({ current, onJump }) {
  const idx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="aig-progress" aria-label="Setup progress">
      {STEPS.map((s, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <button
            key={s.id}
            type="button"
            className={`aig-progress-step ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
            onClick={() => done && onJump?.(s.id)}
            disabled={!done}
          >
            <span className="aig-progress-dot">
              {done ? <Check size={11} strokeWidth={3} /> : s.num}
            </span>
            <span className="aig-progress-label">{s.label}</span>
            {i < STEPS.length - 1 && <span className="aig-progress-line" />}
          </button>
        )
      })}
    </div>
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

function GeneratingFrame({ format, label = 'Creating…' }) {
  const ratio = format?.width && format?.height ? format.width / format.height : 1
  const maxW = 420
  const maxH = 420
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }

  return (
    <div className="aig-gen-frame" style={{ width: w, height: h, maxWidth: '100%' }}>
      <div className="aig-gen-frame-blobs" aria-hidden>
        <span className="aig-blob aig-blob--a" />
        <span className="aig-blob aig-blob--b" />
        <span className="aig-blob aig-blob--c" />
        <span className="aig-blob aig-blob--d" />
      </div>
      <div className="aig-gen-frame-shimmer" aria-hidden />
      <div className="aig-gen-frame-label">
        <Sparkles size={16} />
        <span>{label}</span>
      </div>
    </div>
  )
}

function CanvasPreview({ format, mode, prompt, infoLayoutName }) {
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
  const snippet = (prompt || '').trim().slice(0, 120)
  const aspectLabel = formatAspect(format.width, format.height) || format.name

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
            className={`aig-canvas-preview-frame aig-canvas-preview-frame--${mode}`}
            initial={false}
            animate={{ width: w, height: h }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 28,
              mass: 0.9,
            }}
          >
            <span className="aig-canvas-preview-grid" aria-hidden />
            <span className="aig-canvas-preview-orb aig-canvas-preview-orb--a" aria-hidden />
            <span className="aig-canvas-preview-orb aig-canvas-preview-orb--b" aria-hidden />
            <span className="aig-canvas-preview-orb aig-canvas-preview-orb--c" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--tl" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--tr" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--bl" aria-hidden />
            <span className="aig-canvas-corner aig-canvas-corner--br" aria-hidden />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${format.id}-${mode}`}
                className="aig-canvas-preview-copy"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.22 }}
              >
                <span className="aig-canvas-preview-badge">
                  <Sparkles size={12} strokeWidth={2.25} />
                  {modeLabel}
                  <em>{aspectLabel}</em>
                </span>
                <p className="aig-canvas-preview-title">
                  {snippet || format.name}
                  {snippet.length >= 120 ? '…' : ''}
                </p>
                {!snippet && (
                  <span className="aig-canvas-preview-hint">Your prompt will preview here</span>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="aig-canvas-preview-meta"
        key={`meta-${format.id}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <strong>{format.name}</strong>
        <span>
          {format.width} × {format.height} px
          {mode === 'infographic' && infoLayoutName ? ` · ${infoLayoutName}` : ''}
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
  const [activeContext, setActiveContext] = useState(null)

  const textRef = useRef(null)
  const genAbortRef = useRef(null)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)

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
    const pool = EXAMPLE_PROMPTS.filter((p) => p !== prompt)
    const next = pool[Math.floor(Math.random() * pool.length)] || EXAMPLE_PROMPTS[0]
    setInspiring(true)
    setPrompt('')
    let i = 0
    const iv = setInterval(() => {
      i += 1
      setPrompt(next.slice(0, i))
      if (i >= next.length) {
        clearInterval(iv)
        setInspiring(false)
      }
    }, 10)
  }

  const appendPill = (pill) => {
    setPrompt((prev) => {
      const next = prev.trim() ? `${prev.trim()}, ${pill.toLowerCase()}` : pill
      return next
    })
  }

  const buildGenerateBody = ({ includeContext = true } = {}) => {
    const body = {
      mode,
      modelId,
      formatId: selectedFormat?.id,
      styleId,
      prompt: prompt.trim() || undefined,
      name: `athena-${Date.now()}.png`,
    }
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
    if (includeContext && activeContext?.id) {
      body.contextId = activeContext.id
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
            ? {
                ...t,
                status: 'done',
                generation: gen,
                error: null,
                contextBadge: contextPreviewBadge(gen) || t.contextBadge || null,
              }
            : t
        )
      )
    }
    if (gen.contextId || data?.generation?.contextId) {
      setActiveContext((prev) =>
        prev?.id && (prev.id === gen.contextId || prev.id === data?.generation?.contextId)
          ? { ...prev, pinnedAt: prev.pinnedAt || new Date().toISOString() }
          : prev
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
        contextBadge: activeContext?.id
          ? contextPreviewBadge({
              contextId: activeContext.id,
              contextPreview: {
                documentCount: activeContext.previews?.documents?.length || 0,
                imageCount:
                  (activeContext.previews?.images?.length || 0) +
                  (activeContext.previews?.assetRefs?.length || 0),
              },
            })
          : null,
      },
    ])
    try {
      const data = await imageGenService.generate(workspaceId, buildGenerateBody())
      applyResult(data, turnId)
    } catch (err) {
      const msg = friendlyError(err)
      const expired =
        err?.status === 400 &&
        /context has expired|context unavailable|expired/i.test(String(err?.message || ''))
      const missing =
        err?.status === 404 && /context/i.test(String(err?.message || 'context'))
      setActionError(
        expired || missing
          ? 'Context unavailable — please re-attach your brief, then generate again.'
          : msg
      )
      failTurn(turnId, expired || missing ? 'Context unavailable — please re-attach.' : msg)
      if (expired || missing) {
        setActiveContext(null)
        setStep('prompt')
      }
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
        text: 'Regenerate with same settings',
        status: 'pending',
        generation: null,
        error: null,
        contextBadge: contextPreviewBadge(fromGeneration),
      },
    ])
    try {
      // Omit contextId so the backend inherits the parent brief/snapshot
      const data = await imageGenService.regenerate(
        workspaceId,
        fromGeneration.id,
        buildGenerateBody({ includeContext: false })
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

  const retryFailedTurn = async (turn) => {
    if (!turn || isGenerating) return
    if (turn.kind === 'regenerate') {
      const parent =
        activeGeneration ||
        [...thread].reverse().find((t) => t.id !== turn.id && t.generation?.id)?.generation
      if (parent?.id) {
        await runRegenerate(parent)
        return
      }
    }
    if (turn.kind === 'tweak') {
      const parent =
        activeGeneration ||
        [...thread].reverse().find((t) => t.id !== turn.id && t.generation?.id)?.generation
      const instruction = String(turn.text || '').trim()
      if (parent?.id && instruction) {
        setActiveGeneration(parent)
        setChatInput(instruction)
        // submit after state flush via direct call path
        if (!workspaceId || isGenerating) return
        if (selectedModel?.supportsEdit === false) {
          setActionError('This model does not support image tweaks. Try regenerating instead.')
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
          const data = await imageGenService.tweak(workspaceId, parent.id, instruction)
          applyResult(data, turnId)
        } catch (err) {
          const msg = friendlyError(err)
          setActionError(msg)
          failTurn(turnId, msg)
        } finally {
          setIsGenerating(false)
          setBusyAction('')
        }
        return
      }
    }
    await runGenerate()
  }

  const navBack = () => {
    if (step === 'prompt') onBack?.()
    else if (step === 'canvas') setStep('prompt')
    else if (step === 'options') setStep('canvas')
    else if (step === 'review') setStep('options')
    else if (step === 'workspace') setStep(prompt.trim() ? 'review' : 'prompt')
  }

  const showSetupProgress = step === 'prompt' || step === 'canvas' || step === 'options' || step === 'review'
  const shellClass = `aig-shell aig-shell--${step}`

  if (catalogLoading) {
    return (
      <div className="aig-shell aig-shell--loading">
        <div className="aig-loading-backdrop" aria-hidden>
          <span className="aig-loading-glow aig-loading-glow--a" />
          <span className="aig-loading-glow aig-loading-glow--b" />
        </div>
        <div className="aig-loading-card">
          <div className="aig-loading-mark" aria-hidden>
            <span className="aig-loading-ring" />
            <Sparkles size={22} strokeWidth={2.1} />
          </div>
          <div className="aig-loading-copy">
            <h2>Image Studio</h2>
            <p>Preparing models, formats, and styles…</p>
          </div>
          <div className="aig-loading-bar" aria-hidden>
            <span />
          </div>
        </div>
      </div>
    )
  }

  if (catalogError && !formats.length) {
    return (
      <div className="aig-shell aig-shell--loading">
        <div className="aig-loading-backdrop" aria-hidden>
          <span className="aig-loading-glow aig-loading-glow--a" />
        </div>
        <div className="aig-loading-card aig-loading-card--error">
          <div className="aig-loading-mark aig-loading-mark--error" aria-hidden>
            <AlertCircle size={22} strokeWidth={2.1} />
          </div>
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
        <span>{step === 'prompt' ? 'Home' : 'Back'}</span>
      </button>

      <div className="aig-float-credits" aria-label="Credits balance">
        <Sparkles size={13} strokeWidth={2.25} />
        <span>{creditBalance == null ? '—' : Math.round(creditBalance).toLocaleString()} AC</span>
      </div>

      {showSetupProgress && (
        <div className="aig-float-progress">
          <StepProgress current={step} onJump={setStep} />
        </div>
      )}

      <div className="aig-body">
        <AnimatePresence mode="wait">
          {/* ── PROMPT ── */}
          {step === 'prompt' && (
            <motion.section key="prompt" className="aig-page aig-page--prompt" {...stepMotion}>
              <div className="aig-prompt-atmosphere" aria-hidden>
                <span className="aig-prompt-atmosphere-base" />
                <span className="aig-prompt-atmosphere-wash" />
                <span className="aig-prompt-atmosphere-orb aig-prompt-atmosphere-orb--a" />
                <span className="aig-prompt-atmosphere-orb aig-prompt-atmosphere-orb--b" />
                <span className="aig-prompt-atmosphere-orb aig-prompt-atmosphere-orb--c" />
                <span className="aig-prompt-atmosphere-beam" />
                <span className="aig-prompt-atmosphere-dots" />
                <span className="aig-prompt-atmosphere-grain" />
                <span className="aig-prompt-atmosphere-vignette" />
              </div>
              <div className="aig-prompt-stage">
                <div className="aig-prompt-hero">
                  <motion.span
                    className="aig-eyebrow"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    Image Studio
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.45 }}
                  >
                    What should we create?
                  </motion.h1>
                  <motion.p
                    className="aig-lede"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.22 }}
                  >
                    Write a clear prompt. Next you’ll pick canvas, model, and style.
                  </motion.p>
                </div>

                <motion.div
                  className="aig-prompt-card"
                  initial={{ opacity: 0, y: 20, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.42 }}
                >
                  <ImageGenContextAttach
                    workspaceId={workspaceId}
                    context={activeContext}
                    onContextChange={setActiveContext}
                    disabled={isGenerating}
                  >
                    {({ thumbs, trigger }) => (
                      <>
                        {thumbs}
                        <textarea
                          ref={textRef}
                          className="aig-textarea"
                          placeholder="A quiet coastal lighthouse at golden hour, deep blue sea, soft editorial light…"
                          value={prompt}
                          rows={3}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim()) {
                              setStep('canvas')
                            }
                          }}
                          autoFocus
                        />
                        <div className="aig-prompt-toolbar aig-prompt-toolbar--composer">
                          <div className="aig-prompt-composer-row">
                            {trigger}
                            <div className="aig-prompt-toolbar-end">
                              <button
                                type="button"
                                className="aig-inspire"
                                onClick={handleInspire}
                                disabled={inspiring}
                              >
                                <Wand2 size={14} />
                                {inspiring ? 'Writing…' : 'Inspire me'}
                              </button>
                              <button
                                type="button"
                                className="aig-btn aig-btn--primary aig-btn--lg"
                                disabled={!prompt.trim()}
                                onClick={() => setStep('canvas')}
                              >
                                Continue
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </ImageGenContextAttach>
                </motion.div>

                <div className="aig-pills">
                  {SUGGESTION_PILLS.map((pill, i) => (
                    <motion.button
                      key={pill}
                      type="button"
                      className="aig-pill"
                      onClick={() => appendPill(pill)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + i * 0.04 }}
                    >
                      {pill}
                    </motion.button>
                  ))}
                </div>
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
                          <button
                            key={layout.id}
                            type="button"
                            className={`aig-layout-card ${infoLayout === layout.id ? 'is-selected' : ''}`}
                            onClick={() => setInfoLayout(layout.id)}
                          >
                            <strong>{layout.name}</strong>
                            <span>{layout.desc}</span>
                          </button>
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
                    prompt={prompt}
                    infoLayoutName={selectedInfoLayout?.name}
                  />
                </aside>
              </div>
            </motion.section>
          )}

          {/* ── OPTIONS ── */}
          {step === 'options' && (
            <motion.section key="options" className="aig-page aig-page--options" {...stepMotion}>
              <header className="aig-page-head">
                <h2>Model & style</h2>
                <p>
                  Mode: <strong>{MODE_TABS.find((t) => t.id === mode)?.label || mode}</strong>
                  {estimateAc != null && (
                    <>
                      {' '}
                      · ~<strong>{estimateAc} AC</strong> on success
                    </>
                  )}
                </p>
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
                      <span className="aig-model-cost">
                        ~{m.creditEstimate ?? '—'} AC
                        {mode !== 'image' && modelId === m.id && estimateAc != null
                          ? ` → ${estimateAc} with ${mode}`
                          : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="aig-opt-block">
                <h3>Style</h3>
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

              {mode === 'infographic' && (
                <div className="aig-opt-block aig-opt-block--info">
                  <h3>Infographic content</h3>
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
                  <h3>Optional text overlay</h3>
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

              <div className="aig-page-footer">
                <button type="button" className="aig-btn aig-btn--ghost" onClick={() => setStep('canvas')}>
                  Back
                </button>
                <button
                  type="button"
                  className="aig-btn aig-btn--primary aig-btn--lg"
                  onClick={() => setStep('review')}
                >
                  Review
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.section>
          )}

          {/* ── REVIEW ── */}
          {step === 'review' && (
            <motion.section key="review" className="aig-page aig-page--review" {...stepMotion}>
              <div className="aig-review-layout">
                <div className="aig-review-main">
                  <header className="aig-review-head">
                    <h2>Ready to generate</h2>
                    <p>Confirm the brief, then send it to the studio. Usually under a minute.</p>
                  </header>

                  <div className="aig-review-prompt-panel">
                    <div className="aig-review-prompt-top">
                      <span className="aig-review-label">Your prompt</span>
                      <button
                        type="button"
                        className="aig-review-edit"
                        onClick={() => setStep('prompt')}
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                    <p className="aig-review-prompt-body">
                      {prompt.trim() ||
                        (mode === 'infographic'
                          ? 'Infographic will use your section content.'
                          : 'No prompt yet.')}
                    </p>
                    {(headline || subheadline) && (
                      <div className="aig-review-prompt-extra">
                        {[headline, subheadline].filter(Boolean).join(' — ')}
                      </div>
                    )}
                  </div>

                  <div className="aig-review-context">
                    <div className="aig-review-prompt-top">
                      <span className="aig-review-label">Reference brief</span>
                      <button
                        type="button"
                        className="aig-review-edit"
                        onClick={() => setStep('prompt')}
                      >
                        <Pencil size={13} />
                        {activeContext?.id ? 'Edit' : 'Add'}
                      </button>
                    </div>
                    {activeContext?.id ? (
                      <div className="aig-review-context-ready">
                        <span className="aig-context-badge">
                          {contextPreviewBadge({
                            contextId: activeContext.id,
                            contextPreview: {
                              documentCount: activeContext.previews?.documents?.length || 0,
                              imageCount:
                                (activeContext.previews?.images?.length || 0) +
                                (activeContext.previews?.assetRefs?.length || 0),
                            },
                          })}
                        </span>
                        <p>
                          Brief ready — the model will use your attached docs and style references.
                        </p>
                      </div>
                    ) : (
                      <p className="aig-review-context-empty">
                        Optional. Attach a PDF brief or moodboard on the prompt step for closer
                        matches. Context is free.
                      </p>
                    )}
                  </div>

                  <div className="aig-review-tiles">
                    <p className="aig-review-tiles-label">Settings</p>
                    <div className="aig-review-tile-grid">
                      <button
                        type="button"
                        className="aig-review-tile"
                        onClick={() => setStep('canvas')}
                      >
                        <span>Mode</span>
                        <strong>{MODE_TABS.find((t) => t.id === mode)?.label || mode}</strong>
                      </button>
                      <button
                        type="button"
                        className="aig-review-tile"
                        onClick={() => setStep('canvas')}
                      >
                        <span>Canvas</span>
                        <strong>
                          {selectedFormat?.name}
                          {selectedFormat
                            ? ` · ${formatAspect(selectedFormat.width, selectedFormat.height)}`
                            : ''}
                        </strong>
                      </button>
                      {mode === 'infographic' && (
                        <button
                          type="button"
                          className="aig-review-tile"
                          onClick={() => setStep('canvas')}
                        >
                          <span>Layout</span>
                          <strong>{selectedInfoLayout?.name || '—'}</strong>
                        </button>
                      )}
                      <button
                        type="button"
                        className="aig-review-tile"
                        onClick={() => setStep('options')}
                      >
                        <span>Model</span>
                        <strong>{selectedModel ? getFriendlyModelName(selectedModel) : '—'}</strong>
                      </button>
                      <button
                        type="button"
                        className="aig-review-tile aig-review-tile--style"
                        onClick={() => setStep('options')}
                      >
                        <span>Style</span>
                        <strong>
                          {STYLE_PREVIEW_BY_ID[styleId] && (
                            <img src={STYLE_PREVIEW_BY_ID[styleId]} alt="" />
                          )}
                          {selectedStyle?.name || '—'}
                        </strong>
                      </button>
                      {mode === 'infographic' &&
                        (infoTitle || filledInfoSections.length > 0) && (
                          <button
                            type="button"
                            className="aig-review-tile"
                            onClick={() => setStep('options')}
                          >
                            <span>Sections</span>
                            <strong>
                              {infoTitle ? `${infoTitle} · ` : ''}
                              {filledInfoSections.length} filled
                            </strong>
                          </button>
                        )}
                    </div>
                    <p className="aig-review-tiles-hint">Tap any setting to change it</p>
                  </div>

                  {actionError && step === 'review' && (
                    <p className="aig-error-banner">{actionError}</p>
                  )}

                  <div className="aig-review-back-row">
                    <button
                      type="button"
                      className="aig-btn aig-btn--ghost"
                      onClick={() => setStep('options')}
                    >
                      Back
                    </button>
                  </div>
                </div>

                <aside className="aig-review-side">
                  <div className="aig-review-stage">
                    <div
                      className="aig-review-stage-frame"
                      style={{
                        aspectRatio: selectedFormat
                          ? `${selectedFormat.width} / ${selectedFormat.height}`
                          : '1 / 1',
                      }}
                    >
                      {STYLE_PREVIEW_BY_ID[styleId] ? (
                        <img
                          src={STYLE_PREVIEW_BY_ID[styleId]}
                          alt=""
                          className="aig-review-stage-img"
                        />
                      ) : (
                        <div className="aig-review-stage-fallback" />
                      )}
                      <div className="aig-review-stage-veil" />
                      <div className="aig-review-stage-meta">
                        <span>{selectedFormat?.name || 'Canvas'}</span>
                        {selectedFormat && (
                          <span>
                            {selectedFormat.width}×{selectedFormat.height}
                          </span>
                        )}
                      </div>
                    </div>

                    {estimateAc != null && (
                      <div className="aig-review-cost-pill">
                        <Zap size={13} />
                        ~{estimateAc} AC on success
                      </div>
                    )}

                    <button
                      type="button"
                      className="aig-btn aig-btn--generate aig-review-generate"
                      disabled={
                        isGenerating ||
                        (!prompt.trim() &&
                          !(mode === 'infographic' && filledInfoSections.length > 0))
                      }
                      onClick={runGenerate}
                    >
                      <Sparkles size={18} />
                      Generate {mode === 'infographic' ? 'infographic' : 'image'}
                      {estimateAc != null && <em>{estimateAc} AC</em>}
                    </button>
                  </div>
                </aside>
              </div>
            </motion.section>
          )}

          {/* ── WORKSPACE ── */}
          {step === 'workspace' && (
            <motion.section key="workspace" className="aig-page aig-page--workspace" {...stepMotion}>
              <div className="aig-work">
                <aside className="aig-work-sidebar">
                  <div className="aig-work-sidebar-brand">
                    <Sparkles size={16} />
                    <div>
                      <strong>Image Studio</strong>
                      <span>Session</span>
                    </div>
                  </div>

                  <div className="aig-work-sidebar-block">
                    <h4>Settings</h4>
                    <div className="aig-chip-row">
                      <span className="aig-mini-chip aig-mini-chip--accent">
                        {MODE_TABS.find((t) => t.id === mode)?.label || 'Image'}
                      </span>
                      {selectedModel && <span className="aig-mini-chip">{selectedModel.name}</span>}
                      {selectedFormat && <span className="aig-mini-chip">{selectedFormat.name}</span>}
                      {selectedStyle && <span className="aig-mini-chip">{selectedStyle.name}</span>}
                      {activeContext?.id && (
                        <span className="aig-mini-chip aig-mini-chip--accent">Brief attached</span>
                      )}
                    </div>
                  </div>

                  <div className="aig-work-sidebar-block aig-work-sidebar-versions">
                    <h4>Versions</h4>
                    <div className="aig-version-list">
                      {thread.length === 0 && (
                        <p className="aig-version-empty">No generations yet</p>
                      )}
                      {[...thread].reverse().map((turn, idx) => (
                        <button
                          key={turn.id}
                          type="button"
                          className={`aig-version-item ${
                            turn.generation?.id === activeGeneration?.id ? 'is-active' : ''
                          }`}
                          onClick={() => {
                            if (turn.generation) setActiveGeneration(turn.generation)
                            document
                              .getElementById(`aig-turn-${turn.id}`)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }}
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
                            <strong>
                              {turn.kind === 'tweak'
                                ? 'Tweak'
                                : turn.kind === 'regenerate'
                                  ? 'Regen'
                                  : `V${thread.length - idx}`}
                            </strong>
                            <span>{turn.text.slice(0, 42)}{turn.text.length > 42 ? '…' : ''}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="aig-work-sidebar-actions">
                    <button
                      type="button"
                      className="aig-btn aig-btn--primary aig-btn--block"
                      onClick={() => onBack?.()}
                    >
                      <Home size={15} strokeWidth={2.25} />
                      Home
                    </button>
                  </div>
                </aside>

                <div className="aig-work-main">
                  <div className="aig-chat-scroll">
                    {thread.map((turn) => (
                      <motion.article
                        key={turn.id}
                        id={`aig-turn-${turn.id}`}
                        className="aig-chat-turn"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="aig-chat-prompt">
                          <span className="aig-chat-prompt-label">
                            {turn.kind === 'tweak'
                              ? 'Tweak'
                              : turn.kind === 'regenerate'
                                ? 'Regenerate'
                                : 'Prompt'}
                          </span>
                          {(() => {
                            const { preview, truncated } = previewPrompt(turn.text)
                            return (
                              <>
                                <p className="aig-chat-prompt-text">{preview}</p>
                                {truncated && (
                                  <button
                                    type="button"
                                    className="aig-show-more"
                                    onClick={() => setPromptModalText(turn.text)}
                                  >
                                    Show more
                                  </button>
                                )}
                              </>
                            )
                          })()}
                          {(turn.contextBadge ||
                            contextPreviewBadge(turn.generation)) && (
                            <span className="aig-context-badge aig-context-badge--chat">
                              {turn.contextBadge || contextPreviewBadge(turn.generation)}
                            </span>
                          )}
                          {turn.status === 'pending' && (
                            <div className="aig-chat-status">
                              <Loader2 size={12} className="aig-spin" />
                              {GEN_STATUS_LINES[genStatusIdx]}
                            </div>
                          )}
                          {turn.status === 'error' && turn.error && (
                            <p className="aig-chat-error">{turn.error}</p>
                          )}
                        </div>

                        <div className="aig-chat-media">
                          {turn.status === 'pending' && (
                            <GeneratingFrame
                              format={selectedFormat}
                              label={
                                turn.kind === 'tweak'
                                  ? 'Applying tweak…'
                                  : 'Creating your image…'
                              }
                            />
                          )}
                          {turn.status === 'done' && turn.generation?.url && (
                            <div className="aig-img-wrap">
                              <motion.img
                                src={turn.generation.url}
                                alt={turn.text}
                                className="aig-chat-img"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => setFullscreenSrc(turn.generation.url)}
                              />
                              <div className="aig-img-actions">
                                <button
                                  type="button"
                                  className="aig-img-action"
                                  title="Regenerate"
                                  disabled={isGenerating}
                                  onClick={() => runRegenerate(turn.generation)}
                                >
                                  <RotateCcw size={14} />
                                  <span>Regenerate</span>
                                </button>
                                <div className="aig-download-wrap">
                                  <button
                                    type="button"
                                    className="aig-img-action"
                                    title="Download"
                                    onClick={() =>
                                      setDownloadMenuFor((id) =>
                                        id === turn.generation.id ? null : turn.generation.id
                                      )
                                    }
                                  >
                                    <Download size={14} />
                                    <span>Download</span>
                                  </button>
                                  {downloadMenuFor === turn.generation.id && (
                                    <div className="aig-download-menu aig-download-menu--img">
                                      {['png', 'jpg', 'pdf'].map((fmt) => (
                                        <button
                                          key={fmt}
                                          type="button"
                                          onClick={() => runDownload(fmt, turn.generation.id)}
                                          disabled={busyAction.startsWith(
                                            `dl-${turn.generation.id}-`
                                          )}
                                        >
                                          {busyAction === `dl-${turn.generation.id}-${fmt}`
                                            ? 'Saving…'
                                            : fmt.toUpperCase()}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="aig-img-action"
                                  title="Fullscreen"
                                  onClick={() => setFullscreenSrc(turn.generation.url)}
                                >
                                  <Maximize2 size={14} />
                                  <span>View</span>
                                </button>
                              </div>
                            </div>
                          )}
                          {turn.status === 'error' && (
                            <div className="aig-chat-media-fail">
                              <AlertCircle size={20} />
                              <span>Couldn’t generate</span>
                              <button
                                type="button"
                                className="aig-retry-btn"
                                disabled={isGenerating}
                                onClick={() => retryFailedTurn(turn)}
                              >
                                <RotateCcw size={13} />
                                Try again
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.article>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="aig-chat-dock">
                    {actionError && !isGenerating && (
                      <div className="aig-error-banner aig-error-banner--dock">{actionError}</div>
                    )}
                    <p className="aig-tweak-note">
                      Tweak adjusts this image only; it doesn’t re-read your brief.
                    </p>
                    <div className="aig-chat-bar">
                      <textarea
                        ref={chatInputRef}
                        className="aig-chat-input"
                        rows={1}
                        placeholder={
                          activeGeneration
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
                        <span className={chatInput.length > 1900 ? 'aig-chat-counter--warn' : ''}>
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
