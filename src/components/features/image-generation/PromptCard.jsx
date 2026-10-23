import { useRef, useState } from 'react'
import { Wand2, X, ChevronDown, Sparkles, Layers, Star, ImageIcon } from 'lucide-react'
import StyleReferenceModal from './StyleReferenceModal'

const MODELS    = ['Nano Banana', 'Seedream', 'Flux', 'Ideogram', 'GPT Image', 'Stable Diffusion']
const RATIOS    = ['1:1', '16:9', '9:16', '4:5', '3:2']
const QUALITIES = ['Standard', 'Premium', 'Ultra']

const EXAMPLE_PROMPTS = [
  'A lone astronaut standing on a red Martian desert at golden hour, cinematic wide shot, volumetric dust, photorealistic',
  'Minimalist flat-lay of a white ceramic coffee cup on a marble surface, soft morning light, product photography',
  'Dense neon-lit Tokyo alley at night, rain-soaked cobblestones reflecting light, 35mm film grain, cyberpunk',
  'Hyper-realistic close-up portrait of an elderly fisherman, deep wrinkles, piercing blue eyes, overcast coastal light',
  'Abstract fluid art, deep navy and gold liquid swirls, macro lens, high contrast, luxury texture',
  'Cozy reading nook by a frost-covered window, warm lamp glow, stack of books, autumn leaves outside',
  'Futuristic electric sports car on an empty desert highway at dusk, low angle, motion blur, dramatic sky',
  'Lush tropical waterfall hidden in a jungle, emerald green mist, long exposure, ultra detailed foliage',
]

function Select({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="igp-select" onBlur={() => setOpen(false)}>
      <button
        type="button"
        className="igp-select-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
        <ChevronDown size={12} strokeWidth={2} />
      </button>
      {open && (
        <div className="igp-select-menu" role="listbox">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={value === o}
              className={`igp-select-option ${value === o ? 'igp-select-option--on' : ''}`}
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

function PromptCard({ onGenerate, loading }) {
  const [prompt, setPrompt]               = useState('')
  const [references, setReferences]       = useState([])
  const [model, setModel]                 = useState('Nano Banana')
  const [ratio, setRatio]                 = useState('1:1')
  const [quality, setQuality]             = useState('Standard')
  const [enhance, setEnhance]             = useState(true)
  const [inspiring, setInspiring]         = useState(false)
  const [showModal, setShowModal]         = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const fileRef = useRef(null)

  const handleInspire = () => {
    const pool = EXAMPLE_PROMPTS.filter((p) => p !== prompt)
    const next = pool[Math.floor(Math.random() * pool.length)]
    setInspiring(true)
    setPrompt('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setPrompt(next.slice(0, i))
      if (i >= next.length) { clearInterval(interval); setInspiring(false) }
    }, 18)
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    onGenerate?.({ prompt: prompt.trim(), references, settings: { model, aspectRatio: ratio, quality, enhance, style: selectedStyle } })
  }

  const handleApplyStyle = (style) => { setSelectedStyle(style); setShowModal(false) }
  const handleApplyRefs  = (newRefs) => { setReferences(newRefs); setShowModal(false) }

  return (
    <div className="igp-wrap">

      {/* Card — position:relative so the panel anchors to its top edge */}
      <div className="igp-card">

        {/* Panel floats upward from inside the card */}
        {showModal && (
          <div className="srm-panel-anchor">
            <StyleReferenceModal
              onClose={() => setShowModal(false)}
              onApplyStyle={handleApplyStyle}
              onApplyRefs={handleApplyRefs}
              selectedStyleId={selectedStyle?.id}
              existingRefs={references}
            />
          </div>
        )}

        {/* Style chip + textarea */}
        <div className="igp-input-row">
          {selectedStyle && (
            <span className="igp-style-chip">
              <Star size={11} strokeWidth={2} />
              {selectedStyle.label}
              <button
                type="button"
                className="igp-style-chip-remove"
                onClick={() => setSelectedStyle(null)}
                aria-label="Remove style"
              >
                <X size={9} />
              </button>
            </span>
          )}
          <textarea
            className="igp-textarea"
            placeholder="Describe the image you want to create…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            aria-label="Image prompt"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate() }}
          />
        </div>

        <div className="igp-divider" />

        {/* Toolbar */}
        <div className="igp-bar">
          <div className="igp-bar-left">

            <button
              type="button"
              className={`igp-icon-btn ${(selectedStyle || references.length > 0) ? 'igp-icon-btn--active' : ''}`}
              onClick={() => setShowModal((o) => !o)}
              aria-label="Style & References"
              title="Style & References"
            >
              <Layers size={15} strokeWidth={1.75} />
            </button>

            <div className="igp-bar-sep" />

            <Select value={model}   options={MODELS}    onChange={setModel}   label="Model" />
            <Select value={ratio}   options={RATIOS}    onChange={setRatio}   label="Aspect ratio" />
            <Select value={quality} options={QUALITIES} onChange={setQuality} label="Quality" />

            <div className="igp-bar-sep" />

            {references.length > 0 && (
              <button
                type="button"
                className="igp-ref-badge"
                onClick={() => setShowModal(true)}
                aria-label={`${references.length} reference image${references.length > 1 ? 's' : ''}`}
              >
                <ImageIcon size={13} strokeWidth={1.75} />
                References
                <span className="igp-ref-badge-count">{references.length}</span>
              </button>
            )}

            {references.length > 0 && <div className="igp-bar-sep" />}

            <button
              type="button"
              role="switch"
              aria-checked={enhance}
              className={`igp-enhance-btn ${enhance ? 'igp-enhance-btn--on' : ''}`}
              onClick={() => setEnhance((e) => !e)}
              title="AI prompt enhancement"
            >
              <Sparkles size={13} strokeWidth={1.75} />
              <span>Enhance</span>
            </button>
          </div>

          <div className="igp-bar-right">
            <button
              type="button"
              className={`igp-inspire-inline-btn ${inspiring ? 'igp-inspire-inline-btn--active' : ''}`}
              onClick={handleInspire}
              disabled={inspiring}
              aria-label="Inspire me"
            >
              <Sparkles size={13} strokeWidth={1.75} />
              {inspiring ? 'Writing…' : 'Inspire me'}
            </button>

            <button
              type="button"
              className="igp-generate-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              aria-label="Generate image"
            >
              <Wand2 size={14} strokeWidth={2} />
              Generate
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default PromptCard
