import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Sparkles, ImagePlus, X, ArrowRight, Wand2, RotateCcw, Edit3, Shuffle, ArrowUp, Download, Trash2, Heart, Clock, Settings2, Zap, Plus, Image as ImageIcon } from 'lucide-react'
import SelectMediaModal from '../../components/features/image-generation/SelectMediaModal'
import './AIImageStudio.css'

/* ── Constants ── */
const MODELS    = ['Auto', 'Nano Banana', 'Seedream', 'Flux', 'Ideogram', 'GPT Image', 'Stable Diffusion']
const STYLES    = ['Dynamic', 'Photorealistic', 'Cinematic', '3D Render', 'Anime', 'Watercolor', 'Minimal', 'Sketch']
const DIMS      = ['1:1', '16:9', '9:16', '4:5', '3:2', '2:3']
const QUALITIES = ['Standard', 'Premium', 'Ultra']
const VIS_TYPES = ['Photo', 'Illustration', 'Icon', 'Diagram', 'Infographic']
const COUNTS    = [1, 2, 4]

const CREDIT_COST = { Standard: 1, Premium: 3, Ultra: 5 }

/* Map dim ratio to picsum size string */
const DIM_SIZES = {
  '1:1':  '800/800',
  '16:9': '1280/720',
  '9:16': '720/1280',
  '4:5':  '800/1000',
  '3:2':  '900/600',
  '2:3':  '600/900',
}
const dimToSize = (d) => DIM_SIZES[d] || '800/800'

/* Map dim ratio to CSS aspect-ratio value */
const DIM_ASPECT = {
  '1:1':  '1 / 1',
  '16:9': '16 / 9',
  '9:16': '9 / 16',
  '4:5':  '4 / 5',
  '3:2':  '3 / 2',
  '2:3':  '2 / 3',
}
const dimToAspect = (d) => DIM_ASPECT[d] || '1 / 1'

const INSPIRATIONS = [
  { id: 1, seed: 'vintage-car',     prompt: 'A side profile view of a vintage red compact beetle parked in a golden sunflower field' },
  { id: 2, seed: 'portrait-woman',  prompt: 'A hyper-detailed studio photograph of woman with bold colorful makeup, high contrast' },
  { id: 3, seed: 'rowing-boat',     prompt: 'A cinematic photo of a blue wooden rowing boat floating on a misty lake at dawn' },
  { id: 4, seed: 'tokyo-night',     prompt: 'Dense neon-lit Tokyo alley at night, rain-soaked cobblestones, 35mm film grain' },
  { id: 5, seed: 'aurora-mtn',      prompt: 'Aurora borealis over snow-capped mountains, long exposure, photorealistic' },
  { id: 6, seed: 'coffee-marble',   prompt: 'Minimalist flat-lay of a white ceramic coffee cup on warm marble, morning light' },
]

const EXAMPLE_PROMPTS = [
  'A lone astronaut on a vast red Martian desert at golden hour, cinematic wide shot, volumetric dust, photorealistic, 8K',
  'Dense neon-lit Tokyo alley at 2am in heavy rain, cobblestones reflecting neon signs, 35mm film grain, cyberpunk',
  'Hyper-realistic portrait of an elderly Icelandic fisherman, weathered wrinkles, pale blue eyes, overcast coastal light',
  'Abstract macro photograph of deep navy and molten gold liquid swirls frozen mid-motion, luxury texture, fine art',
  'Futuristic matte black electric hypercar on a salt flat at dusk, ultra-low angle, dramatic storm clouds, CGI render',
  'Hidden waterfall deep inside a lush ancient jungle, sunlight through giant ferns, long exposure silk water effect',
  "Bird's-eye view of a lavender farm in Provence at peak bloom, golden hour, aerial drone photography",
  'A grand Victorian library at midnight, endless bookshelves, moonlight through stained glass, dark academia',
]

/* ── Inline select chip ── */
function ChipSelect({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="aig-chip-select" onBlur={() => setOpen(false)}>
      <button
        type="button"
        className={`aig-chip ${value !== options[0] ? 'aig-chip--active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={label}
      >
        {value} <ChevronDown size={10} strokeWidth={2.5} />
      </button>
      {open && (
        <div className="aig-chip-menu">
          {options.map(o => (
            <button
              key={o}
              type="button"
              className={`aig-chip-opt ${value === o ? 'aig-chip-opt--on' : ''}`}
              onMouseDown={() => { onChange(o); setOpen(false) }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AIImageStudio({ onBack }) {
  const [step, setStep]       = useState('prompt')
  const [prompt, setPrompt]   = useState('')
  const [inspiring, setInspiring] = useState(false)

  // Settings — shared between prompt page and workspace bar
  const [model,      setModel]      = useState('Auto')
  const [style,      setStyle]      = useState('Dynamic')
  const [dim,        setDim]        = useState('1:1')
  const [quality,    setQuality]    = useState('Standard')
  const [count,      setCount]      = useState(1)
  const [visualType, setVisualType] = useState('Photo')

  // Workspace — sessions-based
  const [sessions,         setSessions]         = useState([])
  const [activeSessionId,  setActiveSessionId]  = useState(null)
  const [showEmpty,        setShowEmpty]        = useState(true)

  // Other workspace state
  const [workPrompt,  setWorkPrompt]  = useState('')
  const [showMedia,   setShowMedia]   = useState(false)
  const [refImages,   setRefImages]   = useState([])   // [{id, url, name}]
  const [favorites,   setFavorites]   = useState(new Set())

  const historyRef  = useRef(null)
  const textRef     = useRef(null)
  const workTextRef = useRef(null)

  // Derived: active session's generations
  const activeGenerations = sessions.find(s => s.id === activeSessionId)?.generations ?? []
  const isGenerating      = activeGenerations.some(g => g.status === 'generating')
  const creditCost        = CREDIT_COST[quality] * count

  // Auto-scroll when active session generations change
  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight
  }, [sessions, activeSessionId])

  const handleInspire = () => {
    const pool = EXAMPLE_PROMPTS.filter(p => p !== prompt)
    const next = pool[Math.floor(Math.random() * pool.length)]
    setInspiring(true)
    setPrompt('')
    let i = 0
    const iv = setInterval(() => {
      i++
      setPrompt(next.slice(0, i))
      if (textRef.current) {
        textRef.current.style.height = 'auto'
        textRef.current.style.height = textRef.current.scrollHeight + 'px'
      }
      if (i >= next.length) { clearInterval(iv); setInspiring(false) }
    }, 8)
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    const p   = prompt.trim()
    const sid = Date.now().toString()
    // create `count` generation entries
    const gens = Array.from({ length: count }, (_, i) => ({
      id: `${sid}_g${i}`,
      prompt: p,
      model,
      dim,
      status: 'generating',
      imageUrl: null,
    }))
    setSessions([{ id: sid, label: p.slice(0, 40), thumb: null, generations: gens }])
    setActiveSessionId(sid)
    setShowEmpty(false)
    setStep('workspace')
    gens.forEach((gen, i) => {
      setTimeout(() => {
        const url = `https://picsum.photos/seed/${encodeURIComponent(p + gen.id)}/${dimToSize(dim)}`
        setSessions(prev => prev.map(s => s.id === sid ? {
          ...s,
          thumb: s.thumb || url,
          generations: s.generations.map(g => g.id === gen.id ? { ...g, status: 'done', imageUrl: url } : g)
        } : s))
      }, 3500 + i * 400)
    })
  }

  const handleWorkspaceGenerate = () => {
    if (!workPrompt.trim() || isGenerating) return
    const p = workPrompt.trim()
    setWorkPrompt('')
    const gens = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}_g${i}`,
      prompt: p,
      model,
      dim,
      status: 'generating',
      imageUrl: null,
    }))

    if (!activeSessionId) {
      const sid = Date.now().toString()
      setSessions(prev => [...prev, { id: sid, label: p.slice(0, 40), thumb: null, generations: gens }])
      setActiveSessionId(sid)
      setShowEmpty(false)
      gens.forEach((gen, i) => {
        setTimeout(() => {
          const url = `https://picsum.photos/seed/${encodeURIComponent(p + gen.id)}/${dimToSize(dim)}`
          setSessions(prev => prev.map(s => s.id === sid ? {
            ...s,
            thumb: s.thumb || url,
            generations: s.generations.map(g => g.id === gen.id ? { ...g, status: 'done', imageUrl: url } : g)
          } : s))
        }, 3500 + i * 400)
      })
    } else {
      setSessions(prev => prev.map(s => s.id === activeSessionId
        ? { ...s, generations: [...s.generations, ...gens] } : s))
      gens.forEach((gen, i) => {
        setTimeout(() => {
          const url = `https://picsum.photos/seed/${encodeURIComponent(p + gen.id)}/${dimToSize(dim)}`
          setSessions(prev => prev.map(s => s.id === activeSessionId ? {
            ...s,
            thumb: s.thumb || url,
            generations: s.generations.map(g => g.id === gen.id ? { ...g, status: 'done', imageUrl: url } : g)
          } : s))
        }, 3500 + i * 400)
      })
    }
  }

  /* ══ PROMPT PAGE ══ */
  if (step === 'prompt') {
    return (
      <div className="aig-step-shell aig-step-shell--prompt">
        <nav className="aig-step-nav">
          <button type="button" className="aig-back-btn" onClick={onBack}>
            <ChevronLeft size={15} /> Home
          </button>
          <span className="aig-step-nav-title">AI Image Studio</span>
          <div className="aig-step-nav-right">
            <span className="aig-credits-badge">&#10022; 150 Credits</span>
          </div>
        </nav>

        <div className="aig-prompt-page">
          <div className="aig-prompt-split">

            {/* ── Left: Prompt + Settings ── */}
            <div className="aig-prompt-left">
              <div className="aig-prompt-heading">
                <span className="aig-prompt-eyebrow">Image Studio</span>
                <h1 className="aig-prompt-h1">What do you want to create?</h1>
                <p className="aig-prompt-sub">
                  Describe your image — tweak style and quality, then hit Generate.
                </p>
              </div>

              {/* Prompt Card */}
              <div className="aig-prompt-card">
                {/* Top row: label + inspire */}
                <div className="aig-prompt-card-top">
                  <label className="aig-prompt-label" htmlFor="aig-prompt-input">Your prompt</label>
                  <button
                    type="button"
                    className="aig-inspire-btn"
                    onClick={handleInspire}
                    disabled={inspiring}
                  >
                    <Wand2 size={13} strokeWidth={2} />
                    {inspiring ? 'Writing\u2026' : 'Inspire me'}
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  id="aig-prompt-input"
                  ref={textRef}
                  className="aig-prompt-textarea"
                  placeholder="A misty lake at dawn, lone rowboat, soft golden light, cinematic wide shot\u2026"
                  value={prompt}
                  rows={2}
                  onChange={e => {
                    setPrompt(e.target.value)
                    const el = textRef.current
                    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                  }}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt.trim()) handleGenerate()
                  }}
                />

                {/* Settings chips — Model, Style, Quality, Ratio */}
                <div className="aig-prompt-chips-row">
                  <ChipSelect value={model}   options={MODELS}    onChange={setModel}   label="Model"   />
                  <ChipSelect value={style}   options={STYLES}    onChange={setStyle}   label="Style"   />
                  <ChipSelect value={quality} options={QUALITIES} onChange={setQuality} label="Quality" />
                  <ChipSelect value={dim}     options={DIMS}      onChange={setDim}     label="Ratio"   />
                  <div className="aig-prompt-chips-sep" />
                  <button type="button" className="aig-chip" onClick={() => setShowMedia(true)} title="Add reference image">
                    <ImagePlus size={13} strokeWidth={1.75} />
                  </button>
                  <span className="aig-prompt-hint">&#8984;&#8629; to generate</span>
                </div>

                {/* Reference image thumbnails */}
                {refImages.length > 0 && (
                  <div className="aig-ref-thumbs">
                    {refImages.map(img => (
                      <div key={img.id} className="aig-ref-thumb">
                        <img src={img.url} alt={img.name} />
                        <button
                          type="button"
                          className="aig-ref-thumb-remove"
                          onClick={() => setRefImages(prev => prev.filter(r => r.id !== img.id))}
                          aria-label="Remove reference"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer: cost + generate */}
                <div className="aig-prompt-card-footer">
                  <span className="aig-prompt-cost-tag">
                    {creditCost} credit{creditCost !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    className={`aig-next-btn ${prompt.trim() ? 'aig-next-btn--ready' : ''}`}
                    disabled={!prompt.trim()}
                    onClick={handleGenerate}
                  >
                    Generate <Sparkles size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Quick-start pills */}
              <div className="aig-prompt-examples">
                <span className="aig-prompt-examples-label">Quick starts</span>
                <div className="aig-prompt-fan">
                  {INSPIRATIONS.slice(0, 3).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="aig-insp-pill"
                      onClick={() => {
                        setPrompt(item.prompt)
                        const el = textRef.current
                        if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                      }}
                    >
                      {item.prompt.split(',')[0].slice(0, 36)}{item.prompt.split(',')[0].length > 36 ? '\u2026' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Scrolling Gallery ── */}
            <div className="aig-prompt-right">
              <div className="aig-scroll-wrapper">
                <div className="aig-scroll-columns-container">
                  <div className="aig-scroll-column">
                    <div className="aig-scroll-track-up">
                      {[...INSPIRATIONS, ...INSPIRATIONS, ...INSPIRATIONS].map((item, idx) => (
                        <button key={`c1-${idx}`} type="button" className="aig-gallery-item"
                          onClick={() => {
                            setPrompt(item.prompt)
                            const el = textRef.current
                            if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                          }}>
                          <img src={`https://picsum.photos/seed/${item.seed}1/400/500`} alt="Inspiration" loading="lazy" />
                          <div className="aig-gallery-overlay"><p>{item.prompt.slice(0, 50)}\u2026</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="aig-scroll-column">
                    <div className="aig-scroll-track-down">
                      {[...INSPIRATIONS, ...INSPIRATIONS, ...INSPIRATIONS].reverse().map((item, idx) => (
                        <button key={`c2-${idx}`} type="button" className="aig-gallery-item"
                          onClick={() => {
                            setPrompt(item.prompt)
                            const el = textRef.current
                            if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                          }}>
                          <img src={`https://picsum.photos/seed/${item.seed}2/400/600`} alt="Inspiration" loading="lazy" />
                          <div className="aig-gallery-overlay"><p>{item.prompt.slice(0, 50)}\u2026</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="aig-scroll-column aig-scroll-column--extra">
                    <div className="aig-scroll-track-up" style={{ animationDuration: '100s' }}>
                      {[...INSPIRATIONS, ...INSPIRATIONS, ...INSPIRATIONS].map((item, idx) => (
                        <button key={`c3-${idx}`} type="button" className="aig-gallery-item"
                          onClick={() => {
                            setPrompt(item.prompt)
                            const el = textRef.current
                            if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
                          }}>
                          <img src={`https://picsum.photos/seed/${item.seed}3/400/450`} alt="Inspiration" loading="lazy" />
                          <div className="aig-gallery-overlay"><p>{item.prompt.slice(0, 50)}\u2026</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {showMedia && (
          <SelectMediaModal
            onClose={() => setShowMedia(false)}
            onConfirm={img => { setRefImages(prev => [...prev, img]) }}
          />
        )}
      </div>
    )
  }

  /* ══ WORKSPACE ══ */
  return (
    <div className="aig-step-shell aig-step-shell--workspace">

      {/* ── Top nav ── */}
      <nav className="aig-work-nav">
        <button type="button" className="aig-back-btn" onClick={() => setStep('prompt')}>
          <ChevronLeft size={15} /> New Image
        </button>
        <span className="aig-step-nav-title">AI Image Studio</span>
        <div className="aig-step-nav-right">
          <span className="aig-credits-badge">&#10022; 150 Credits</span>
        </div>
      </nav>

      {/* ── Body: sidebar + main ── */}
      <div className="aig-workspace-body">

        {/* ── Sessions Sidebar ── */}
        <aside className="aig-work-sidebar">
          <div className="aig-sb-sessions-head">
            <div className="aig-sb-brand">
              <div className="aig-sb-brand-icon">
                <Sparkles size={16} strokeWidth={1.75} />
              </div>
              <div className="aig-sb-brand-text">
                <span className="aig-sb-brand-title">Image Studio</span>
                <span className="aig-sb-brand-sub">AI Generation</span>
              </div>
            </div>
            <div className="aig-sb-sessions-label">Sessions</div>
          </div>

          {/* New Session button */}
          <button
            type="button"
            className="aig-sb-new-session"
            onClick={() => { setShowEmpty(true); setActiveSessionId(null); setWorkPrompt('') }}
          >
            <div className="aig-sb-new-icon"><Plus size={16} strokeWidth={2.5} /></div>
            <span>New Session</span>
          </button>

          {/* Session list */}
          <div className="aig-sb-session-list">
            {sessions.length === 0 && (
              <div className="aig-sb-no-sessions">No sessions yet. Start generating!</div>
            )}
            {[...sessions].reverse().map(s => (
              <button
                key={s.id}
                type="button"
                className={`aig-sb-session-item ${activeSessionId === s.id ? 'aig-sb-session-item--active' : ''}`}
                onClick={() => { setActiveSessionId(s.id); setShowEmpty(false) }}
              >
                <div className="aig-sb-session-thumb">
                  {s.thumb
                    ? <img src={s.thumb} alt={s.label} />
                    : <div className="aig-sb-session-thumb-placeholder"><ImageIcon size={14} /></div>
                  }
                </div>
                <div className="aig-sb-session-info">
                  <span className="aig-sb-session-label">
                    {s.label.length > 28 ? s.label.slice(0, 28) + '\u2026' : s.label}
                  </span>
                  <span className="aig-sb-session-count">
                    {s.generations.length} image{s.generations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main column: canvas + prompt bar ── */}
        <div className="aig-workspace-main">

          {/* Canvas area */}
          {showEmpty ? (
            <div className="aig-empty-canvas">
              <h2 className="aig-empty-canvas-title">What will you create today?</h2>

              {/* Inspiration image grid — 4 cards */}
              <div className="aig-empty-inspo-grid">
                {INSPIRATIONS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="aig-empty-inspo-card"
                    onClick={() => setWorkPrompt(item.prompt)}
                    title={item.prompt}
                  >
                    <img
                      src={`https://picsum.photos/seed/${item.seed}${idx}/400/500`}
                      alt={item.prompt}
                      loading="lazy"
                    />
                    <div className="aig-empty-inspo-overlay">
                      <p>{item.prompt.split(',')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="aig-workspace-scroll" ref={historyRef}>
              {activeGenerations.map(gen => (
                <div key={gen.id} className="aig-gen-row">
                  <div className="aig-gen-bubble">
                    <p className="aig-gen-bubble-text">{gen.prompt}</p>
                    <span className="aig-gen-bubble-chip">{gen.model}</span>
                  </div>
                  <div className="aig-gen-images">
                    {gen.status === 'generating' ? (
                      <div className="aig-skeleton-card" style={{ aspectRatio: dimToAspect(gen.dim || '1:1') }}>
                        <div className="aig-skeleton-shimmer" />
                        <div className="aig-skeleton-label">
                          <span className="aig-dot-pulse" />
                          Generating&hellip;
                        </div>
                      </div>
                    ) : (
                      <div className="aig-img-card" style={{ aspectRatio: dimToAspect(gen.dim || '1:1') }}>
                        <img src={gen.imageUrl} alt={gen.prompt} className="aig-img" />
                        <div className="aig-img-hover-bar">
                          <button type="button" className="aig-hover-btn"><Edit3 size={13} strokeWidth={1.75} /> Edit</button>
                          <button type="button" className="aig-hover-btn"><Shuffle size={13} strokeWidth={1.75} /> Vary</button>
                          <button type="button" className="aig-hover-btn"><ArrowUp size={13} strokeWidth={1.75} /> Upscale</button>
                          <a href={gen.imageUrl} download className="aig-hover-btn"><Download size={13} strokeWidth={1.75} /> Download</a>
                        </div>
                      </div>
                    )}
                  </div>
                  {gen.status === 'done' && (
                    <div className="aig-row-actions">
                      <button
                        type="button"
                        className="aig-row-btn"
                        onClick={() => {
                          const genId = Date.now().toString()
                          const p = gen.prompt
                          const retryGen = { id: genId, prompt: p, model: gen.model, dim: gen.dim || '1:1', status: 'generating', imageUrl: null }
                          setSessions(prev => prev.map(s => s.id === activeSessionId ? {
                            ...s,
                            generations: [...s.generations, retryGen]
                          } : s))
                          setTimeout(() => {
                            const url = `https://picsum.photos/seed/${encodeURIComponent(p + genId)}/${dimToSize(gen.dim || '1:1')}`
                            setSessions(prev => prev.map(s => s.id === activeSessionId ? {
                              ...s,
                              thumb: s.thumb || url,
                              generations: s.generations.map(g => g.id === genId ? { ...g, status: 'done', imageUrl: url } : g)
                            } : s))
                          }, 3500)
                        }}
                      >
                        <RotateCcw size={13} strokeWidth={1.75} /> Retry
                      </button>
                      <button type="button" className="aig-row-btn" onClick={() => setWorkPrompt(gen.prompt)}>
                        <Shuffle size={13} strokeWidth={1.75} /> Reuse
                      </button>
                      <a href={gen.imageUrl} download className="aig-row-btn">
                        <Download size={13} strokeWidth={1.75} /> Download
                      </a>
                      <button
                        type="button"
                        className="aig-row-btn aig-row-btn--danger"
                        onClick={() => setSessions(prev => prev.map(s => s.id === activeSessionId
                          ? { ...s, generations: s.generations.filter(g => g.id !== gen.id) }
                          : s
                        ))}
                      >
                        <Trash2 size={13} strokeWidth={1.75} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Bottom prompt bar ── */}
          <div className="aig-work-bar">
            <div className="aig-work-bar-inner">
              <textarea
                ref={workTextRef}
                className="aig-work-textarea"
                placeholder="Describe your next image\u2026"
                value={workPrompt}
                rows={2}
                onChange={e => setWorkPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleWorkspaceGenerate() } }}
              />
              <div className="aig-work-chips">
                <ChipSelect value={model}      options={MODELS}    onChange={setModel}      label="Model" />
                <ChipSelect value={style}      options={STYLES}    onChange={setStyle}      label="Style" />
                <ChipSelect value={quality}    options={QUALITIES} onChange={setQuality}    label="Quality" />
                <ChipSelect value={dim}        options={DIMS}      onChange={setDim}        label="Dimension" />
                <ChipSelect value={visualType} options={VIS_TYPES} onChange={setVisualType} label="Visual Type" />
                <button type="button" className="aig-chip" onClick={() => setShowMedia(true)} title="Reference image">
                  <ImagePlus size={13} strokeWidth={1.75} />
                </button>
                {/* Reference image thumbnails in bar */}
                {refImages.map(img => (
                  <div key={img.id} className="aig-ref-thumb">
                    <img src={img.url} alt={img.name} />
                    <button
                      type="button"
                      className="aig-ref-thumb-remove"
                      onClick={() => setRefImages(prev => prev.filter(r => r.id !== img.id))}
                      aria-label="Remove reference"
                    >
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                <div className="aig-work-spacer" />
                <span className="aig-work-cost">{creditCost} cr</span>
                <button
                  type="button"
                  className={`aig-send-btn ${workPrompt.trim() && !isGenerating ? 'aig-send-btn--ready' : ''}`}
                  onClick={handleWorkspaceGenerate}
                  disabled={!workPrompt.trim() || isGenerating}
                  aria-label="Generate"
                >
                  <Sparkles size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

        </div>{/* end aig-workspace-main */}
      </div>{/* end aig-workspace-body */}

      {showMedia && (
        <SelectMediaModal
          onClose={() => setShowMedia(false)}
          onConfirm={img => { setRefImages(prev => [...prev, img]); setShowMedia(false) }}
        />
      )}
    </div>
  )
}
