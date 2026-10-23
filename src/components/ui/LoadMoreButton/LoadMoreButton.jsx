import React from 'react'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'
import './LoadMoreButton.css'

export default function LoadMoreButton({
  onClick,
  loading = false,
  disabled = false,
  remainingCount = null,
  label = 'Load more',
  loadingLabel = 'Loading…',
  className = '',
}) {
  return (
    <div className={`ui-load-more-wrapper ${className}`.trim()}>
      <button
        type="button"
        className={`ui-load-more-btn ${loading ? 'is-loading' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
        aria-label={loading ? loadingLabel : label}
      >
        <span className="ui-load-more-bg-glow" aria-hidden />
        <span className="ui-load-more-content">
          {loading ? (
            <>
              <Loader2 size={16} className="ui-load-more-spinner" />
              <span className="ui-load-more-text">{loadingLabel}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="ui-load-more-sparkle" />
              <span className="ui-load-more-text">{label}</span>
              {remainingCount !== null && remainingCount > 0 ? (
                <span className="ui-load-more-badge">+{remainingCount}</span>
              ) : null}
              <ChevronDown size={16} className="ui-load-more-chevron" />
            </>
          )}
        </span>
      </button>
    </div>
  )
}
