import { useCallback } from 'react';
import { HUB_FEATURES, PRODUCT_OPTIONS } from './productOptions';
import './ProductChooser.css';

/* ═══════════════════════════════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════════════════════════════ */

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

/* Tool Circular Icons */
const TOOL_ICONS = {
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  presentation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  slides: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  poster: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="12" y2="14" />
    </svg>
  ),
  canvas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   Workspace Card
   ═══════════════════════════════════════════════════════════════════════════ */

function WorkspaceCard({ option, onSelect }) {
  return (
    <div
      className="hub-workspace-card"
      onClick={() => onSelect(option)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(option);
        }
      }}
      aria-label={`Open ${option.title}`}
    >
      <img className="hub-workspace-card__image" src={option.image} alt="" loading="lazy" />
      <div className="hub-workspace-card__scrim" aria-hidden />
      <div className="hub-workspace-card__arrow"><ArrowUpRight /></div>
      <div className="hub-workspace-card__content">
        <span className="hub-workspace-card__badge">{option.badge}</span>
        <h3 className="hub-workspace-card__title">{option.title}</h3>
        <p className="hub-workspace-card__desc">{option.description}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ProductChooser Page Component
   ═══════════════════════════════════════════════════════════════════════════ */

function ProductChooser({ onSelect }) {
  /* ── Feature Navigation ───────────────────────────────────────────────── */
  const handleFeatureClick = useCallback((feature) => {
    const productId = feature.category === 'Video Studio' ? 'studio' : 'slides';
    const product = PRODUCT_OPTIONS.find((p) => p.id === productId);
    if (product) {
      if (window.location.pathname !== feature.route) {
        window.history.pushState(
          { view: product.view, section: feature.section },
          '',
          feature.route
        );
      }
      onSelect?.(product);
    }
  }, [onSelect]);

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="hub-page">
      {/* ── 1. HERO TITLE & SUBTITLE ──────────────────────────────────────── */}
      <section className="hub-hero">
        <div className="hub-hero-content">
          <h1 className="hub-title">Your creative workspace</h1>
          <p className="hub-subtitle">
            Everything you need to create — AI videos, avatars, presentations,
            posters, and more — all in one place.
          </p>

          {/* Quick Feature Shortcuts Toolbar Row */}
          <div className="hub-tools-bar">
            {HUB_FEATURES.map((feature) => (
              <button
                key={`tool-${feature.id}`}
                type="button"
                className="hub-tool-btn"
                onClick={() => handleFeatureClick(feature)}
                title={feature.title}
              >
                <div
                  className="hub-tool-icon"
                  style={{ background: feature.gradient[0] }}
                >
                  {TOOL_ICONS[feature.icon] || TOOL_ICONS.sparkles}
                </div>
                <span className="hub-tool-label">{feature.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. WORKSPACES CARDS ───────────────────────────────────────────── */}
      <section className="hub-section">
        <div className="hub-section-header">
          <h2 className="hub-section-title">Workspaces</h2>
        </div>
        <div className="hub-workspace-grid">
          {PRODUCT_OPTIONS.map((option) => (
            <WorkspaceCard key={option.id} option={option} onSelect={onSelect} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductChooser;
