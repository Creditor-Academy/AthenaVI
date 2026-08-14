import { useEffect, useRef, useState } from 'react'
import { MdArrowForward, MdAdd, MdCheck, MdContentCopy, MdAutoAwesome } from 'react-icons/md'
import { formatFontWeightLabel, getFontRole } from '../utils/brandKitUtils'
import {
  findLogoMedia,
  normalizeLogoRole,
  resolveButtonStyle,
  LOGO_ROLES,
} from '../../../../utils/brandKitHelpers'

function contrastInk(hex) {
  const raw = String(hex || '#000000').replace('#', '')
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw
  const num = Number.parseInt(full, 16)
  if (!Number.isFinite(num)) return '#0f172a'
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.62 ? '#0f172a' : '#ffffff'
}

function missingLabel(id) {
  return String(id || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function missingTab(id) {
  if (id === 'logo_variants' || id === 'logos' || id === 'logo') return 'logos'
  if (id === 'photos' || id === 'graphics' || id === 'imagery') return 'imagery'
  if (id === 'fonts' || id === 'typography') return 'typography'
  if (id === 'guidelines' || id === 'guideline') return 'guideline'
  if (id === 'colors' || id === 'palette') return 'identity'
  if (id === 'buttons' || id === 'button') return 'buttons'
  if (id === 'voice') return 'overview'
  return null
}

export default function OverviewTab(props) {
  const {
    canWrite,
    kitData,
    setKitData,
    setEditorTab,
    copiedHex,
    handleCopyHex,
    triggerUpload,
    mediaByKind,
    generating,
    kitName,
    logoPreviewUrl,
    kitHealth,
    slogan,
    setSlogan,
    triggerSuggestVoice,
  } = props

  const missing = Array.isArray(kitHealth?.missing) ? kitHealth.missing : []
  const heading = getFontRole(kitData.fonts, 'heading')
  const subheading = getFontRole(kitData.fonts, 'subheading')
  const body = getFontRole(kitData.fonts, 'body')
  const MAX_COLORS_VISIBLE = 5
  const allColors = kitData.colors || []
  const colors = allColors.slice(0, MAX_COLORS_VISIBLE)
  const hiddenColorsCount = Math.max(0, allColors.length - MAX_COLORS_VISIBLE)
  const primaryFamily = heading.family || 'Outfit'
  const primaryHex = colors[0]?.hex || '#3B82F6'
  const logos = mediaByKind('logo')
  const primaryLogo = findLogoMedia(logos, 'primary')
  const logoSrc =
    primaryLogo?.url ||
    primaryLogo?.src ||
    primaryLogo?.presignedUrl ||
    logoPreviewUrl

  const orderedLogos = (() => {
    const list = Array.isArray(logos) ? [...logos] : []
    const rank = (role) => {
      const n = normalizeLogoRole(role)
      const i = LOGO_ROLES.indexOf(n)
      return i === -1 ? 99 : i
    }
    list.sort((a, b) => {
      const ra = rank(a.role || a.name)
      const rb = rank(b.role || b.name)
      if (ra !== rb) return ra - rb
      return String(a.role || '').localeCompare(String(b.role || ''))
    })
    // Prefer one tile per normalized role (first wins after sort)
    const seen = new Set()
    return list.filter((m) => {
      const key = normalizeLogoRole(m.role || m.name) || String(m.id || '')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return Boolean(m.url || m.src || m.presignedUrl)
    })
  })()

  const logoGridRef = useRef(null)
  const [logoSlots, setLogoSlots] = useState(4)
  useEffect(() => {
    const el = logoGridRef.current
    if (!el) return undefined
    const MIN_TILE = 68
    const GAP = 10
    const measure = () => {
      const w = el.clientWidth || 0
      const n = Math.max(1, Math.floor((w + GAP) / (MIN_TILE + GAP)))
      setLogoSlots(n)
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [orderedLogos.length])

  const needsMoreTile = orderedLogos.length > logoSlots
  const visibleLogoCount = needsMoreTile ? Math.max(0, logoSlots - 1) : orderedLogos.length
  const visibleLogos = orderedLogos.slice(0, visibleLogoCount)
  const hiddenLogoCount = Math.max(0, orderedLogos.length - visibleLogoCount)

  const logoNeedsDarkCanvas = (role) => {
    const r = normalizeLogoRole(role)
    return r === 'light' || r === 'white'
  }

  const formatOverviewLogoRole = (role) => {
    const r = normalizeLogoRole(role)
    if (r === 'with-name-below') return 'Name below'
    if (r === 'with-name-adjacent') return 'Name adjacent'
    return r || 'logo'
  }

  const healthScore = Math.max(0, Math.min(100, Number(kitHealth?.score) || 0))
  const displayName = kitName?.trim() || 'Brand Kit'
  const displayTagline = slogan?.trim() || kitData.meta?.tagline || ''
  const ringLen = 2 * Math.PI * 14

  return (
    <div className="editor-tab-content bk-ov">
      <div
        className="bk-ov-board"
        style={{ '--bk-ov-accent': primaryHex }}
      >
        <section className="bk-ov-hero" aria-label="Brand overview">
          <header className="bk-ov-hero-head">
            <div className="bk-ov-brand">
              <div className="bk-ov-logo-wrap">
                {logoSrc ? (
                  <img src={logoSrc} alt="" className="bk-ov-logo" />
                ) : (
                  <span className="bk-ov-logo-fallback" aria-hidden>
                    {(displayName[0] || 'B').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="bk-ov-brand-text">
                <p className="bk-ov-kicker">Typography &amp; Colors</p>
                <h3 className="bk-ov-name">{displayName}</h3>
                {displayTagline ? <p className="bk-ov-tagline">{displayTagline}</p> : null}
              </div>
            </div>

            <div className="bk-ov-health" title={kitHealth?.label || 'Brand health'}>
              <div className="bk-ov-health-ring" aria-hidden>
                <svg viewBox="0 0 36 36">
                  <circle className="bk-ov-ring-bg" cx="18" cy="18" r="14" />
                  <circle
                    className="bk-ov-ring-val"
                    cx="18"
                    cy="18"
                    r="14"
                    strokeDasharray={`${(healthScore / 100) * ringLen} ${ringLen}`}
                  />
                </svg>
                <span>{healthScore}</span>
              </div>
              <div className="bk-ov-health-copy">
                <strong>{kitHealth?.label || 'Needs work'}</strong>
                <span className="bk-ov-health-sub">
                  {missing.length
                    ? `${missing.length} item${missing.length === 1 ? '' : 's'} to complete`
                    : 'Kit looks solid'}
                </span>
                <button type="button" onClick={() => setEditorTab('guideline')}>
                  Open guidelines <MdArrowForward size={14} />
                </button>
              </div>
            </div>
          </header>

          <div className="bk-ov-hero-stage">
            <div
              className="bk-ov-hero-type"
              style={{ fontFamily: primaryFamily, color: primaryHex }}
            >
              <span className="bk-ov-family">{primaryFamily}</span>
              <span className="bk-ov-aa" aria-hidden>
                Aa
              </span>
            </div>

            <div className="bk-ov-scale" role="list">
              <button
                type="button"
                className="bk-ov-scale-item"
                role="listitem"
                onClick={() => setEditorTab('typography')}
              >
                <span className="bk-ov-scale-meta">
                  H1 · {heading.size} · {formatFontWeightLabel(heading.weight)}
                </span>
                <p
                  className="bk-ov-scale-h1"
                  style={{
                    fontFamily: heading.family,
                    fontWeight: heading.weight,
                    lineHeight: heading.lineHeight,
                  }}
                >
                  {displayName}
                </p>
              </button>
              <button
                type="button"
                className="bk-ov-scale-item"
                role="listitem"
                onClick={() => setEditorTab('typography')}
              >
                <span className="bk-ov-scale-meta">
                  H2 · {subheading.size} · {formatFontWeightLabel(subheading.weight)}
                </span>
                <p
                  className="bk-ov-scale-h2"
                  style={{
                    fontFamily: subheading.family,
                    fontWeight: subheading.weight,
                    lineHeight: subheading.lineHeight,
                  }}
                >
                  {displayTagline || 'Supporting headline'}
                </p>
              </button>
              <button
                type="button"
                className="bk-ov-scale-item"
                role="listitem"
                onClick={() => setEditorTab('typography')}
              >
                <span className="bk-ov-scale-meta">
                  Body · {body.size} · {formatFontWeightLabel(body.weight)}
                </span>
                <p
                  className="bk-ov-scale-body"
                  style={{
                    fontFamily: body.family,
                    fontWeight: body.weight,
                    lineHeight: body.lineHeight,
                  }}
                >
                  {kitData.voice?.tone
                    ? `Voice: ${kitData.voice.tone}`
                    : 'Body copy stays clear across decks and product UI.'}
                </p>
              </button>
            </div>
          </div>

          <div className="bk-ov-hero-buttons" aria-label="Button styles">
            <div className="bk-ov-hero-buttons-head">
              <span className="bk-ov-hero-buttons-label">Buttons</span>
              <button
                type="button"
                className="bk-ov-link-btn"
                onClick={() => setEditorTab('buttons')}
              >
                Edit <MdArrowForward size={14} />
              </button>
            </div>
            <div className="bk-ov-buttons-row">
              {['primary', 'secondary'].map((kind) => {
                const resolved = resolveButtonStyle(kitData, kind)
                return (
                  <button
                    key={kind}
                    type="button"
                    className="bk-button-style-preview"
                    style={resolved.css}
                    onClick={() => setEditorTab('buttons')}
                  >
                    {resolved.label}
                  </button>
                )
              })}
            </div>
          </div>

          {missing.length > 0 && (() => {
            const MAX_CHIPS_VISIBLE = 4
            const validMissing = missing.filter((id) => missingTab(id) !== null)
            const showMore = validMissing.length > MAX_CHIPS_VISIBLE
            const visibleChips = showMore ? validMissing.slice(0, MAX_CHIPS_VISIBLE) : validMissing
            const overflowCount = showMore ? validMissing.length - MAX_CHIPS_VISIBLE : 0
            return (
              <div className="bk-ov-missing">
                <span className="bk-ov-missing-label">Finish your kit</span>
                <div className="bk-ov-missing-chips">
                  {visibleChips.map((id) => {
                    const tab = missingTab(id)
                    return (
                      <button key={id} type="button" onClick={() => setEditorTab(tab)}>
                        {missingLabel(id)}
                      </button>
                    )
                  })}
                  {showMore && (
                    <button
                      type="button"
                      className="bk-ov-missing-chip--more"
                      onClick={() => setEditorTab('guideline')}
                      title={`${overflowCount} more items to complete`}
                    >
                      +{overflowCount}
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </section>

        <aside className="bk-ov-colors" aria-label="Color palette">
          <div className="bk-ov-panel-head">
            <div>
              <h4>Palette</h4>
              <p>{colors.length || 0} colors</p>
            </div>
            <button type="button" className="bk-ov-link-btn" onClick={() => setEditorTab('identity')}>
              Edit <MdArrowForward size={14} />
            </button>
          </div>

          <div className="bk-ov-color-stack">
            {(colors.length
              ? colors
              : [{ id: 'empty', name: 'Add colors', hex: '#E2E8F0' }]
            ).map((color, index) => {
              const hex = color.hex || '#94A3B8'
              const ink = contrastInk(hex)
              const sizes = ['lg', 'md', 'md', 'sm', 'sm']
              const sizeClass = sizes[Math.min(index, sizes.length - 1)]
              const isLight = ink === '#0f172a'
              const empty = color.id === 'empty'
              return (
                <button
                  type="button"
                  key={color.id || `${hex}-${index}`}
                  className={`bk-ov-swatch bk-ov-swatch--${sizeClass}${isLight ? ' is-light' : ''}`}
                  style={{ background: hex, color: ink }}
                  onClick={() => {
                    if (empty) {
                      setEditorTab('identity')
                      return
                    }
                    handleCopyHex(hex)
                  }}
                  title={empty ? 'Add colors' : 'Click to copy HEX'}
                >
                  <span className="bk-ov-swatch-name">{color.name || `Color ${index + 1}`}</span>
                  <span className="bk-ov-swatch-hex-row">
                    <span>{hex}</span>
                    {!empty &&
                      (copiedHex === hex ? <MdCheck size={14} /> : <MdContentCopy size={14} />)}
                  </span>
                </button>
              )
            })}
            {hiddenColorsCount > 0 && (
              <button
                type="button"
                className="bk-ov-swatch bk-ov-swatch--more"
                style={{ background: primaryHex, color: contrastInk(primaryHex) }}
                onClick={() => setEditorTab('identity')}
                title={`View ${hiddenColorsCount} more colors`}
              >
                <span className="bk-ov-swatch-name">+{hiddenColorsCount} more</span>
              </button>
            )}
          </div>
        </aside>

        <section className="bk-ov-logo-card">
          <div className="bk-ov-panel-head">
            <div>
              <h4>Logos</h4>
              <p>
                {orderedLogos.length
                  ? `${orderedLogos.length} mark${orderedLogos.length === 1 ? '' : 's'}`
                  : 'Upload brand marks'}
              </p>
            </div>
            <button type="button" className="bk-ov-link-btn" onClick={() => setEditorTab('logos')}>
              Logos <MdArrowForward size={14} />
            </button>
          </div>

          {orderedLogos.length ? (
            <div className="bk-ov-logo-grid" ref={logoGridRef}>
              {visibleLogos.map((logo) => {
                const role = normalizeLogoRole(logo.role || logo.name)
                const src = logo.url || logo.src || logo.presignedUrl
                const dark = logoNeedsDarkCanvas(role)
                return (
                  <button
                    key={logo.id || role}
                    type="button"
                    className={`bk-ov-logo-tile${dark ? ' is-dark' : ''}`}
                    onClick={() => setEditorTab('logos')}
                    title={formatOverviewLogoRole(role)}
                  >
                    <img src={src} alt={`${formatOverviewLogoRole(role)} logo`} />
                    <span className="bk-ov-logo-tile-role">{formatOverviewLogoRole(role)}</span>
                  </button>
                )
              })}
              {needsMoreTile && hiddenLogoCount > 0 && (
                <button
                  type="button"
                  className="bk-ov-logo-tile bk-ov-logo-tile--more"
                  onClick={() => setEditorTab('logos')}
                  title={`View ${hiddenLogoCount} more logos`}
                >
                  <strong>+{hiddenLogoCount}</strong>
                  <span>more</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bk-ov-logo-grid bk-ov-logo-grid--empty" ref={logoGridRef}>
              <button
                type="button"
                className="bk-ov-logo-tile bk-ov-logo-tile--add"
                disabled={!canWrite}
                onClick={() => triggerUpload('logo', 'primary')}
              >
                <MdAdd size={24} />
                <span>Upload logo</span>
              </button>
            </div>
          )}
        </section>

        <section className="bk-ov-voice-card">
          <div className="bk-ov-panel-head">
            <div>
              <h4>Brand Voice</h4>
              <p>Used in AI prompts and guideline decks</p>
            </div>
            {canWrite && (
              <button
                type="button"
                className={`bk-extract-btn bk-ov-suggest-btn ${generating ? 'generating' : ''}`}
                onClick={triggerSuggestVoice}
                disabled={generating || !kitName?.trim()}
              >
                <MdAutoAwesome size={16} />
                {generating ? 'Suggesting…' : 'Suggest'}
              </button>
            )}
          </div>

          <div className="bk-ov-voice-fields">
            <label className="bk-ov-field">
              <span>Tagline</span>
              <input
                type="text"
                value={slogan ?? kitData.meta?.tagline ?? ''}
                disabled={!canWrite}
                onChange={(e) => {
                  setSlogan?.(e.target.value)
                  setKitData((prev) => ({
                    ...prev,
                    meta: { ...prev.meta, tagline: e.target.value },
                  }))
                }}
                placeholder="Empowering Executive Decks"
              />
            </label>
            <div className="bk-ov-voice-split">
              <label className="bk-ov-field">
                <span>Tone</span>
                <input
                  type="text"
                  value={kitData.voice?.tone || ''}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setKitData((prev) => ({
                      ...prev,
                      voice: { ...prev.voice, tone: e.target.value },
                    }))
                  }
                  placeholder="Professional, confident"
                />
              </label>
              <label className="bk-ov-field">
                <span>Audience</span>
                <input
                  type="text"
                  value={kitData.voice?.audience || ''}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setKitData((prev) => ({
                      ...prev,
                      voice: { ...prev.voice, audience: e.target.value },
                    }))
                  }
                  placeholder="Enterprise buyers"
                />
              </label>
            </div>
            {kitData.imageStyle ? (
              <div className="bk-ov-image-style">
                <span>Image style</span>
                <p>{kitData.imageStyle}</p>
                <button type="button" onClick={() => setEditorTab('imagery')}>
                  Imagery <MdArrowForward size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
