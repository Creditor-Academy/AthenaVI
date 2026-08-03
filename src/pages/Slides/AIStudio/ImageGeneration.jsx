import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, Check, Loader2, Plus, ArrowUp,
  Download, Maximize2, RefreshCw, Edit3, Sparkles, ImageIcon,
} from 'lucide-react'
import './ImageGeneration.css'

const GEN_STEPS = [
  'Understanding prompt…',
  'Applying style parameters…',
  'Building composition…',
  'Rendering details…',
  'Finalizing image…',
]

const AI_RESPONSE = (prompt) =>
  `On it! I'll create "${prompt.length > 60 ? prompt.slice(0, 60) + '…' : prompt}" using your selected style and settings. Starting the render now.`

function ImageGeneration({ config, onBack }) {
  const [logLines, setLogLines]     = useState([])
  const [done, setDone]             = useState(false)
  const [nextPrompt, setNextPrompt] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const historyRef = useRef(null)
  const timerRef   = useRef(null)

  useEffect(() => {
    if (!config) return
    setLogLines([])
    setDone(false)
    setShowResponse(false)

    const respTimer = setTimeout(() => setShowResponse(true), 600)

    const DELAYS = [800, 900, 1000, 1100, 1200]
    let step = 0

    const tick = () => {
      setLogLines((prev) => [...prev, GEN_STEPS[step]])
      step += 1
      if (step < GEN_STEPS.length) {
        timerRef.current = setTimeout(tick, DELAYS[step])
      } else {
        setDone(true)
      }
    }

    timerRef.current = setTimeout(tick, DELAYS[0])
    return () => { clearTimeout(timerRef.current); clearTimeout(respTimer) }
  }, [config])

  useEffect(() => {
    if (historyRef.current)
      historyRef.current.scrollTop = historyRef.current.scrollHeight
  }, [logLines, done, showResponse])

  const resultUrl = `https://picsum.photos/seed/${encodeURIComponent(config?.prompt || 'athena')}/1600/900`
  const totalSecs = GEN_STEPS.length + 1

  return (
    <div className="igv-shell">

      {/* ══ LEFT PANEL ══ */}
      <aside className="igv-left">

        {/* Back button at top of left */}
        <div className="igv-left-header">
          <button type="button" className="igv-back-btn" onClick={onBack}>
            <ArrowLeft size={14} strokeWidth={2} />
            Back to Studio
          </button>
        </div>

        <div className="igv-history" ref={historyRef}>

          {/* User prompt bubble */}
          <div className="igv-prompt-bubble">
            <p className="igv-prompt-bubble-text">{config?.prompt}</p>
            <div className="igv-prompt-bubble-chips">
              {config?.settings?.model       && <span className="igv-chip">{config.settings.model}</span>}
              {config?.settings?.aspectRatio && <span className="igv-chip">{config.settings.aspectRatio}</span>}
              {config?.settings?.quality     && <span className="igv-chip">{config.settings.quality}</span>}
            </div>
          </div>

          {/* AI response */}
          {showResponse && (
            <div className="igv-ai-response">
              <p className="igv-ai-response-text">{AI_RESPONSE(config?.prompt || '')}</p>
            </div>
          )}

          {/* Log */}
          {logLines.length > 0 && (
            <div className="igv-log">
              {logLines.map((line, i) => (
                <div key={i} className="igv-log-row igv-log-row--done">
                  <span className="igv-log-icon"><Check size={12} strokeWidth={2.5} /></span>
                  {line}
                </div>
              ))}
              {!done && (
                <div className="igv-log-row igv-log-row--active">
                  <span className="igv-log-icon"><Loader2 size={12} className="igv-spinner" /></span>
                  Generating image…
                </div>
              )}
            </div>
          )}

          {done && <p className="igv-completed-line">&gt; Completed {totalSecs}s</p>}

          {done && (
            <div className="igv-quick-replies">
              <p className="igv-quick-replies-label">Type your feedback or choose one of these:</p>
              <div className="igv-quick-reply-row">
                <button type="button" className="igv-quick-reply-btn">Looks perfect!</button>
                <button type="button" className="igv-quick-reply-btn">Make some changes</button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom input */}
        <div className="igv-input-wrap">
          <div className="igv-input-bar">
            <textarea
              className="igv-input-textarea"
              placeholder="Enter your next prompt…"
              value={nextPrompt}
              onChange={(e) => setNextPrompt(e.target.value)}
              rows={1}
              disabled={!done}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && done && nextPrompt.trim()) e.preventDefault()
              }}
            />
            <div className="igv-input-footer">
              <button type="button" className="igv-input-icon" aria-label="Attach"><Plus size={15} strokeWidth={2} /></button>
              <button
                type="button"
                className={`igv-send-btn ${done && nextPrompt.trim() ? 'igv-send-btn--ready' : ''}`}
                disabled={!done || !nextPrompt.trim()}
                aria-label="Send"
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ RIGHT PANEL ══ */}
      <main className="igv-right">

        {/* Top navbar — action buttons only, no back button */}
        {done && (
          <div className="igv-navbar">
            <div className="igv-navbar-actions">
              <a href={resultUrl} download className="igv-nav-btn igv-nav-btn--primary">
                <Download size={13} /> Download
              </a>
              <button type="button" className="igv-nav-btn" onClick={() => setFullscreen(true)}>
                <Maximize2 size={13} /> Fullscreen
              </button>
              <button type="button" className="igv-nav-btn">
                <RefreshCw size={13} /> Regenerate
              </button>
              <button type="button" className="igv-nav-btn">
                <Edit3 size={13} /> Edit Prompt
              </button>
              <button type="button" className="igv-nav-btn">
                <Sparkles size={13} /> Variations
              </button>
            </div>
          </div>
        )}

        {/* Image — fills remaining space */}
        <div className="igv-image-area">
          {done ? (
            <img src={resultUrl} alt={config?.prompt} className="igv-preview-img" />
          ) : (
            <div className="igv-placeholder">
              <div className="igv-placeholder-icon">
                <ImageIcon size={32} strokeWidth={1.5} />
              </div>
              <p>Your image will appear here</p>
              <span>Hang tight! We're making something amazing for you</span>
              <div className="igv-skeleton-strip" />
            </div>
          )}
        </div>

        {/* Fullscreen overlay */}
        {fullscreen && (
          <div className="igv-fullscreen" onClick={() => setFullscreen(false)}>
            <img src={resultUrl} alt={config?.prompt} className="igv-fullscreen-img" />
          </div>
        )}
      </main>

    </div>
  )
}

export default ImageGeneration
