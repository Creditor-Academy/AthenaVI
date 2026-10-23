import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// ── 1. Design Editor Illustration (Cloud, Lightbulb, Pencil, Gear, Document) ─
function DesignEditorGraphic() {
  return (
    <svg viewBox="0 0 240 140" width="100%" height="130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Idea Cloud */}
      <path
        d="M62 92 C42 92 32 72 44 55 C40 38 56 24 74 30 C84 16 112 14 126 28 C140 16 170 20 178 38 C192 40 200 58 190 76 C200 90 188 108 168 108 C158 122 128 124 112 112 C98 125 68 116 62 92 Z"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="1.6"
      />

      {/* Document on Right */}
      <g transform="translate(138, 40) rotate(12)">
        <rect x="0" y="0" width="46" height="60" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
        <path d="M32 0 L46 14 L32 14 Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.8" />
        <line x1="8" y1="20" x2="38" y2="20" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="28" x2="34" y2="28" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="36" x2="38" y2="36" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="44" x2="26" y2="44" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Center Lightbulb */}
      <g transform="translate(96, 38)">
        <path
          d="M24 0 C10.7 0 0 10.7 0 24 C0 32.2 4.1 39.4 10.5 43.8 L10.5 51 C10.5 52.5 12 54 13.5 54 L34.5 54 C36 54 37.5 52.5 37.5 51 L37.5 43.8 C43.9 39.4 48 32.2 48 24 C48 10.7 37.3 0 24 0 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="1.8"
        />
        {/* Filament */}
        <path d="M18 24 C18 17 30 17 30 24" stroke="#cbd5e1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <line x1="24" y1="24" x2="24" y2="36" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
        {/* Base */}
        <line x1="15" y1="58" x2="33" y2="58" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 58 C17 62 31 62 31 58" fill="#1e293b" />
      </g>

      {/* Pencil on Left */}
      <g transform="translate(44, 62) rotate(-42)">
        <rect x="0" y="0" width="13" height="58" rx="2" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
        <path d="M0 0 L6.5 -13 L13 0 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
        <polygon points="4.5,-9 6.5,-13 8.5,-9" fill="#1e293b" />
        <rect x="0" y="46" width="13" height="12" fill="#2dd4bf" stroke="#1e293b" strokeWidth="1.8" />
      </g>

      {/* Turquoise Gear at Bottom Right */}
      <g transform="translate(138, 88)">
        <circle cx="16" cy="16" r="14" fill="#2dd4bf" stroke="#1e293b" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x="14"
            y="-2"
            width="4"
            height="5"
            rx="1"
            fill="#2dd4bf"
            stroke="#1e293b"
            strokeWidth="1.2"
            transform={`rotate(${angle} 16 16)`}
          />
        ))}
      </g>

      {/* Sparkles / small accents */}
      <path d="M46 44 C43 44 40 41 40 38 C40 41 37 44 34 44 C37 44 40 47 40 50 C40 47 43 44 46 44 Z" fill="#94a3b8" opacity="0.6" />
      <circle cx="140" cy="32" r="2" fill="#94a3b8" opacity="0.5" />
    </svg>
  )
}

// ── 2. Code Editor Graphic (Desktop Monitor, <HTML> Screen, Windows, Keyboard) ─
function CodeEditorGraphic() {
  return (
    <svg viewBox="0 0 240 140" width="100%" height="130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk Base Line */}
      <line x1="28" y1="126" x2="212" y2="126" stroke="#e2e8f0" strokeWidth="1.5" />

      {/* Monitor Stand */}
      <path d="M109 108 L105 122 L135 122 L131 108 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.8" />
      <rect x="96" y="122" width="48" height="4" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.8" />

      {/* Monitor Body */}
      <rect x="64" y="28" width="112" height="80" rx="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />

      {/* Purple Screen with <HTML> */}
      <rect x="70" y="34" width="100" height="68" rx="4" fill="#a5b4fc" />
      <text x="120" y="74" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif" fontSize="15" fontWeight="800" letterSpacing="0.6">
        &lt;HTML&gt;
      </text>

      {/* Code Window Top Left */}
      <g transform="translate(40, 18)">
        <rect x="0" y="0" width="46" height="34" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="0" y1="8" x2="46" y2="8" stroke="#1e293b" strokeWidth="1" />
        <circle cx="4" cy="4" r="1.5" fill="#ef4444" />
        <circle cx="8" cy="4" r="1.5" fill="#f59e0b" />
        <line x1="6" y1="14" x2="26" y2="14" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="19" x2="38" y2="19" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="24" x2="30" y2="24" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Code Tag Badge Top Right */}
      <g transform="translate(164, 34)">
        <rect x="0" y="0" width="26" height="18" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
        <text x="13" y="13" textAnchor="middle" fill="#6366f1" fontFamily="monospace" fontSize="9" fontWeight="700">
          &lt;/&gt;
        </text>
      </g>

      {/* Code Window Bottom Left */}
      <g transform="translate(32, 64)">
        <rect x="0" y="0" width="46" height="36" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="0" y1="8" x2="46" y2="8" stroke="#1e293b" strokeWidth="1" />
        <circle cx="4" cy="4" r="1.5" fill="#3b82f6" />
        <circle cx="8" cy="4" r="1.5" fill="#10b981" />
        <line x1="6" y1="14" x2="24" y2="14" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="19" x2="38" y2="19" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="24" x2="28" y2="24" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Desktop Keyboard */}
      <g transform="translate(78, 120)">
        <polygon points="10,0 68,0 76,16 2,16" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
        <line x1="16" y1="5" x2="64" y2="5" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="14" y1="10" x2="66" y2="10" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
      </g>

      {/* Mouse */}
      <g transform="translate(162, 122)">
        <ellipse cx="8" cy="9" rx="6" ry="8" fill="#ffffff" stroke="#1e293b" strokeWidth="1.6" />
        <line x1="8" y1="1" x2="8" y2="8" stroke="#1e293b" strokeWidth="1.2" />
      </g>
    </svg>
  )
}

// ── 3. Plain Text Editor Graphic (Laptop, Orange Header Accent, Lines) ────────
function PlainTextEditorGraphic() {
  return (
    <svg viewBox="0 0 240 140" width="100%" height="130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Laptop Screen / Lid */}
      <rect x="54" y="28" width="132" height="84" rx="8" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />

      {/* Laptop Inner Screen */}
      <rect x="60" y="34" width="120" height="72" rx="4" fill="#fafafa" stroke="#e2e8f0" strokeWidth="1" />

      {/* Browser Tab Header & Orange Accent */}
      <line x1="60" y1="44" x2="180" y2="44" stroke="#e2e8f0" strokeWidth="1" />
      <circle cx="68" cy="39" r="1.5" fill="#cbd5e1" />
      <circle cx="73" cy="39" r="1.5" fill="#cbd5e1" />
      <line x1="84" y1="39" x2="108" y2="39" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />

      {/* Document Text Lines */}
      <line x1="72" y1="58" x2="84" y2="58" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="72" y1="68" x2="150" y2="68" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="76" x2="130" y2="76" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="84" x2="106" y2="84" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />

      {/* Laptop Base */}
      <path d="M44 116 L42 122 C42 124 44 126 47 126 L193 126 C196 126 198 124 198 122 L196 116 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
      {/* Trackpad notch */}
      <rect x="106" y="116" width="28" height="3" rx="1.5" fill="#1e293b" />
    </svg>
  )
}

export default function CreateTemplateChooserModal({ onSelectMode, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="sa-broadcast-backdrop" onClick={onClose}>
      <div
        className="sa-broadcast-modal sa-broadcast-modal--lg"
        style={{ maxWidth: 840 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sa-editing-exp-header">
          <div>
            <h2 className="sa-editing-exp-title">
              Select your editing experience
            </h2>
            <p className="sa-editing-exp-subtitle">
              Choose to build using our visual drag-and-drop design editor or powerful code editor
            </p>
          </div>
          <button
            type="button"
            className="sa-broadcast-close-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Containers Grid */}
        <div className="sa-editing-exp-grid">
          {/* 1. Design editor */}
          <div
            className="sa-editing-exp-card"
            onClick={() => onSelectMode('design')}
          >
            <div>
              <h3 className="sa-editing-exp-card-title">Design editor</h3>
              <p className="sa-editing-exp-card-sub">Visual, drag & drop editing.</p>
            </div>

            <div className="sa-editing-exp-illustration">
              <DesignEditorGraphic />
            </div>

            <button
              type="button"
              className="sa-editing-exp-btn"
              onClick={(e) => {
                e.stopPropagation()
                onSelectMode('design')
              }}
            >
              Select
            </button>
          </div>

          {/* 2. Code Editor */}
          <div
            className="sa-editing-exp-card"
            onClick={() => onSelectMode('html')}
          >
            <div>
              <h3 className="sa-editing-exp-card-title">Code Editor</h3>
              <p className="sa-editing-exp-card-sub">Feature-rich HTML editing</p>
            </div>

            <div className="sa-editing-exp-illustration">
              <CodeEditorGraphic />
            </div>

            <button
              type="button"
              className="sa-editing-exp-btn"
              onClick={(e) => {
                e.stopPropagation()
                onSelectMode('html')
              }}
            >
              Select
            </button>
          </div>

          {/* 3. Plain text editor */}
          <div
            className="sa-editing-exp-card"
            onClick={() => onSelectMode('text')}
          >
            <div>
              <h3 className="sa-editing-exp-card-title">Plain text editor</h3>
              <p className="sa-editing-exp-card-sub">Basic, clean, no-frills text editing.</p>
            </div>

            <div className="sa-editing-exp-illustration">
              <PlainTextEditorGraphic />
            </div>

            <button
              type="button"
              className="sa-editing-exp-btn"
              onClick={(e) => {
                e.stopPropagation()
                onSelectMode('text')
              }}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
