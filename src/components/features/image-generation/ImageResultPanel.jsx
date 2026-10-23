import { useState } from 'react'
import {
  Download, Share2, Link, Maximize2, RefreshCw,
  Edit3, Layers, ArrowUp, Scissors, ChevronDown, Sparkles,
} from 'lucide-react'

const SUGGESTIONS = [
  '✨ Try making it cinematic',
  '✨ Add volumetric lighting',
  '✨ Increase realism',
  '✨ Add shallow depth of field',
]

const DOWNLOAD_FORMATS = ['PNG', 'JPEG', 'WEBP', 'High Resolution']

function ImageResultPanel({ result, prompt, onRegenerate, onEditPrompt }) {
  const [editablePrompt, setEditablePrompt] = useState(prompt)
  const [showDownload, setShowDownload] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const applysuggestion = (s) => {
    const clean = s.replace(/^✨\s*/, '')
    setEditablePrompt((p) => `${p.trimEnd()}, ${clean}`)
  }

  return (
    <div className="gen-result-panel">
      {/* Image info card */}
      <div className="gen-info-card">
        <div className="gen-info-row"><span>Model</span><strong>{result.model}</strong></div>
        <div className="gen-info-row"><span>Resolution</span><strong>{result.resolution}</strong></div>
        <div className="gen-info-row"><span>Created</span><strong>{result.created}</strong></div>
        <div className="gen-info-row"><span>Seed</span><strong>{result.seed}</strong></div>
        <div className="gen-info-row"><span>Aspect Ratio</span><strong>{result.aspectRatio}</strong></div>
      </div>

      {/* Action buttons */}
      <div className="gen-actions-grid">
        {/* Download with dropdown */}
        <div className="gen-action-dropdown-wrap">
          <button
            type="button"
            className="gen-action-btn gen-action-btn--primary"
            onClick={() => setShowDownload((o) => !o)}
          >
            <Download size={16} />
            Download
            <ChevronDown size={13} />
          </button>
          {showDownload && (
            <div className="gen-dropdown">
              {DOWNLOAD_FORMATS.map((f) => (
                <button key={f} type="button" className="gen-dropdown-item">{f}</button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="gen-action-btn">
          <Share2 size={15} /> Share
        </button>
        <button type="button" className="gen-action-btn">
          <Link size={15} /> Copy Link
        </button>
        <button type="button" className="gen-action-btn" onClick={() => setFullscreen(true)}>
          <Maximize2 size={15} /> Fullscreen
        </button>
        <button type="button" className="gen-action-btn" onClick={() => onRegenerate?.(editablePrompt)}>
          <RefreshCw size={15} /> Regenerate
        </button>
        <button type="button" className="gen-action-btn" onClick={() => onEditPrompt?.(editablePrompt)}>
          <Edit3 size={15} /> Edit Prompt
        </button>
        <button type="button" className="gen-action-btn">
          <Layers size={15} /> Variations
        </button>
        <button type="button" className="gen-action-btn">
          <ArrowUp size={15} /> Upscale
        </button>
        <button type="button" className="gen-action-btn">
          <Scissors size={15} /> Remove BG
        </button>
      </div>

      {/* Variations strip */}
      {result.variations?.length > 0 && (
        <div className="gen-variations">
          <p className="gen-variations-label">Variations</p>
          <div className="gen-variations-strip">
            {result.variations.map((v, i) => (
              <img key={i} src={v} alt={`Variation ${i + 1}`} className="gen-variation-thumb" />
            ))}
          </div>
        </div>
      )}

      {/* Editable prompt */}
      <div className="gen-prompt-edit">
        <label className="gen-prompt-edit-label" htmlFor="gen-edit-prompt">Prompt</label>
        <textarea
          id="gen-edit-prompt"
          className="gen-prompt-edit-input"
          value={editablePrompt}
          onChange={(e) => setEditablePrompt(e.target.value)}
          rows={3}
        />
        <button
          type="button"
          className="gen-regen-btn"
          onClick={() => onRegenerate?.(editablePrompt)}
        >
          <RefreshCw size={14} />
          Regenerate
        </button>
      </div>

      {/* AI Suggestions */}
      <div className="gen-suggestions">
        <p className="gen-suggestions-label">
          <Sparkles size={13} /> Suggested Improvements
        </p>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="gen-suggestion-pill"
            onClick={() => applysuggestion(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="gen-fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <img src={result.url} alt="Generated" className="gen-fullscreen-image" />
        </div>
      )}
    </div>
  )
}

export default ImageResultPanel
