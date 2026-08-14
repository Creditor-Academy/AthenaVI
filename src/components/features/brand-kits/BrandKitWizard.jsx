import {
  MdArrowBack,
  MdCheck,
  MdArrowForward,
  MdImage,
  MdAutoAwesome,
  MdContentCopy,
  MdClose,
  MdAdd,
  MdInfoOutline,
  MdEdit,
} from 'react-icons/md'
import { ChevronRight } from 'lucide-react'
import {
  formatFontWeightLabel,
  getFontRole,
  hexToHsl,
  hexToRgb,
  ensureGoogleFontLoaded,
} from './utils/brandKitUtils'
import { FONT_WEIGHT_OPTIONS, POPULAR_GOOGLE_FONTS } from './utils/brandKitConstants'

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

function patchFontRole(setKitData, role, patch) {
  setKitData((prev) => {
    const nextPatch = { ...patch }
    if (nextPatch.size != null && nextPatch.sizePx == null) {
      const n = Number.parseFloat(String(nextPatch.size).replace(/px$/i, ''))
      if (Number.isFinite(n)) nextPatch.sizePx = n
    }
    if (nextPatch.sizePx != null && nextPatch.size == null) {
      nextPatch.size = `${nextPatch.sizePx}px`
    }
    if (nextPatch.weight != null) {
      const w = Number(nextPatch.weight)
      if (Number.isFinite(w)) nextPatch.weight = w
    }
    if (nextPatch.lineHeight != null) {
      const lh = Number.parseFloat(String(nextPatch.lineHeight))
      if (Number.isFinite(lh)) nextPatch.lineHeight = lh
    }
    const nextRole = { ...prev.fonts?.[role], ...nextPatch }
    const fonts = { ...prev.fonts, [role]: nextRole }
    if (role === 'subheading') {
      fonts.tertiary = { ...prev.fonts?.tertiary, ...nextPatch }
    }
    return { ...prev, fonts }
  })
}

export default function BrandKitWizard(props) {
  const {
    wizardStep,
    setWizardStep,
    closeEditor,
    error,
    wizardLogoInputRef,
    handleWizardLogoSelected,
    kitName,
    setKitName,
    slogan,
    setSlogan,
    logoPreviewUrl,
    setLogoFile,
    setLogoPreviewUrl,
    kitData,
    setKitData,
    canWrite,
    triggerGenerateFromLogo,
    generating,
    copiedHex,
    handleCopyHex,
    updateColor,
    addColor,
    removeColor,
    triggerAutoGenerateTypography,
    triggerSuggestVoice,
    triggerSuggestImageStyle,
    handleSave,
    saving,
  } = props

  return (
      <div className="videos-page brandkits-page brandkit-editor">
        <div className="videos-shell">
          <header className="videos-page-header">
            <div className="videos-title-section">
              <div className="workspace-header-title">
                <button
                  type="button"
                  className="workspace-back-btn"
                  onClick={closeEditor}
                  title="Back to Brand Kits"
                  aria-label="Back to Brand Kits"
                >
                  <MdArrowBack size={20} />
                </button>
                <div>
                  <h1 className="videos-page-title">Brand Kits</h1>
                  <p className="videos-page-subtitle">Create Brand Kit — Step {wizardStep} of 4</p>
                </div>
              </div>
            </div>
          </header>

          <div className="workspace-breadcrumbs">
            <div className="workspace-breadcrumbs__trail">
              <span
                className="breadcrumb-link"
                onClick={closeEditor}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    closeEditor()
                  }
                }}
                role="link"
                tabIndex={0}
              >
                Brand Kits
              </span>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span>Create Brand Kit</span>
            </div>
          </div>

        {error && (
          <div className="bk-error-banner" role="alert">
            <MdInfoOutline size={18} />
            <span>{error}</span>
          </div>
        )}

        <input
          ref={wizardLogoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleWizardLogoSelected(f)
          }}
        />

        <div className="bk-wizard-scroll">
        <div className="bk-wizard-container">
          {/* Stepper Indicator */}
          <div className="bk-wizard-stepper">
            <div className={`bk-wizard-step-item ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
              <div className="bk-wizard-step-number">{wizardStep > 1 ? <MdCheck size={14} /> : '1'}</div>
              <span>Brand Basics & Logo</span>
            </div>
            <div className={`bk-wizard-step-item ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
              <div className="bk-wizard-step-number">{wizardStep > 2 ? <MdCheck size={14} /> : '2'}</div>
              <span>Colors</span>
            </div>
            <div className={`bk-wizard-step-item ${wizardStep === 3 ? 'active' : wizardStep > 3 ? 'completed' : ''}`}>
              <div className="bk-wizard-step-number">{wizardStep > 3 ? <MdCheck size={14} /> : '3'}</div>
              <span>Typography</span>
            </div>
            <div className={`bk-wizard-step-item ${wizardStep === 4 ? 'active' : ''}`}>
              <div className="bk-wizard-step-number">4</div>
              <span>Review Guidelines</span>
            </div>
          </div>

          {/* STEP 1: BASICS & LOGO UPLOAD */}
          {wizardStep === 1 && (
            <div className="bk-wizard-body">
              <h2 className="bk-wizard-title">Let&apos;s start with the basics</h2>
              <p className="bk-wizard-desc">Enter your brand name, tagline, and upload your primary brand logo.</p>

              <div className="bk-wizard-grid-step1">
                <div className="bk-wizard-fields-col">
                  <div className="bk-field" style={{ marginBottom: 16 }}>
                    <label>Brand Name *</label>
                    <input
                      type="text"
                      value={kitName}
                      onChange={(e) => setKitName(e.target.value)}
                      placeholder="e.g. Athena AI, AcroCorp"
                      className="bk-wizard-input"
                    />
                  </div>

                  <div className="bk-field" style={{ marginBottom: 16 }}>
                    <label>Slogan / Tagline</label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="e.g. Empowering Executive Decks"
                      className="bk-wizard-input"
                    />
                  </div>

                  <div className="bk-field">
                    <label>Tone of Voice</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={kitData.voice?.tone || ''}
                        onChange={(e) =>
                          setKitData((prev) => ({
                            ...prev,
                            voice: { ...prev.voice, tone: e.target.value },
                          }))
                        }
                        placeholder="e.g. Professional, Confident, Visionary"
                        className="bk-wizard-input"
                        style={{ flex: 1 }}
                      />
                      {canWrite && (
                        <button
                          type="button"
                          className={`bk-extract-btn ${generating ? 'generating' : ''}`}
                          onClick={triggerSuggestVoice}
                          disabled={generating || !kitName.trim()}
                          title={!kitName.trim() ? 'Enter a brand name first' : 'Suggest voice from brand name'}
                        >
                          <MdAutoAwesome size={16} />
                          Suggest
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bk-wizard-logo-col">
                  <label className="bk-field-lbl">Brand Logo (Primary Mark)</label>
                  {logoPreviewUrl ? (
                    <div className="bk-wizard-logo-preview-box">
                      <img src={logoPreviewUrl} alt="Uploaded Brand Logo" className="bk-wizard-logo-img" />
                      <button
                        type="button"
                        className="ghost-btn danger"
                        style={{ marginTop: 12, padding: '4px 10px', fontSize: 12 }}
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreviewUrl(null)
                        }}
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="bk-wizard-logo-dropzone"
                      onClick={() => wizardLogoInputRef.current?.click()}
                    >
                      <MdImage size={38} color="var(--bk-accent)" />
                      <span className="bk-dropzone-title">Upload Brand Logo</span>
                      <span className="bk-dropzone-sub">SVG, PNG, JPG, or WebP</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={closeEditor}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="create-btn"
                  disabled={!kitName.trim()}
                  onClick={() => setWizardStep(2)}
                >
                  Next: Colors <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BRAND COLORS (Cards with Generate from Logo option) */}
          {wizardStep === 2 && (
            <div className="bk-wizard-body">
              <div className="bk-colors-wizard-header">
                <div>
                  <h2 className="bk-wizard-title">Brand Colors</h2>
                  <p className="bk-wizard-desc">Customize Light & Dark mode color cards or click generate to extract 4 theme colors from your logo.</p>
                </div>
                {logoPreviewUrl && (
                  <button
                    type="button"
                    className="bk-extract-btn"
                    onClick={triggerGenerateFromLogo}
                  >
                    <MdAutoAwesome size={16} />
                    Generate from Logo
                  </button>
                )}
              </div>

              <div className="bk-primary-swatches-grid" style={{ marginBottom: 20 }}>
                {(kitData.colors || []).map((color, index) => {
                  const hex = color.hex || '#0F172A'
                  const rgb = hexToRgb(hex)
                  const [h, s, l] = hexToHsl(hex)

                  return (
                    <div className="bk-color-card" key={color.id || index}>
                      <div className="bk-card-swatch-block" style={{ background: hex }}>
                        {canWrite && (
                          <button
                            type="button"
                            className="bk-edit-color-btn"
                            onClick={(e) => {
                              e.currentTarget
                                .closest('.bk-color-card')
                                ?.querySelector('input[type="color"]')
                                ?.click()
                            }}
                          >
                            <MdEdit size={14} />
                            Edit
                          </button>
                        )}
                        {canWrite && (kitData.colors || []).length > 2 && (
                          <button
                            type="button"
                            className="bk-card-delete-btn"
                            onClick={() => removeColor(index)}
                            title="Remove color"
                          >
                            <MdClose size={16} />
                          </button>
                        )}
                      </div>
                      <div className="bk-card-body">
                        <div className="bk-card-title-row">
                          <div>
                            <input
                              type="text"
                              className="bk-card-color-name"
                              value={color.name}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { name: e.target.value })}
                              placeholder="Color Name"
                            />
                            <span className="bk-card-role-tag">{index < 2 ? 'LIGHT MODE' : 'DARK MODE'}</span>
                          </div>
                          <div className="bk-card-hex-box">
                            <label
                              className={`bk-hex-swatch-circle${!canWrite ? ' is-disabled' : ''}`}
                              style={{ background: hex }}
                              title={canWrite ? 'Edit color' : undefined}
                            >
                              <input
                                type="color"
                                value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#0F172A'}
                                disabled={!canWrite}
                                onChange={(e) => updateColor(index, { hex: e.target.value.toUpperCase() })}
                                className="bk-picker-inline"
                                aria-label={`Edit ${color.name || 'color'}`}
                              />
                            </label>
                            <input
                              type="text"
                              value={color.hex}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { hex: e.target.value })}
                              className="bk-card-hex-val"
                              aria-label={`${color.name || 'Color'} hex`}
                            />
                            <button
                              type="button"
                              className={`bk-hex-copy-btn${copiedHex === hex ? ' is-copied' : ''}`}
                              onClick={() => handleCopyHex(hex)}
                              title={copiedHex === hex ? 'Copied' : 'Copy HEX'}
                              aria-label={copiedHex === hex ? 'Copied' : 'Copy HEX'}
                            >
                              {copiedHex === hex ? <MdCheck size={14} /> : <MdContentCopy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="bk-card-tech-grid">
                          <div>
                            <span className="bk-tech-lbl">RGB</span>
                            <span className="bk-tech-val">{rgb}</span>
                          </div>
                          <div>
                            <span className="bk-tech-lbl">HSL</span>
                            <span className="bk-tech-val">{h}°, {s}%, {l}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginBottom: 20 }}>
                <button type="button" className="ghost-btn" onClick={addColor}>
                  <MdAdd size={16} /> Add Color
                </button>
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setWizardStep(1)}>
                  <MdArrowBack size={16} /> Back
                </button>
                <button type="button" className="create-btn" onClick={() => setWizardStep(3)}>
                  Next: Typography <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TYPOGRAPHY — full controls, no preview panel */}
          {wizardStep === 3 && (
            <div className="bk-wizard-body">
              <div className="bk-wiz-type-header">
                <div>
                  <h2 className="bk-wizard-title">Typography</h2>
                  <p className="bk-wizard-desc">
                    Set family, weight, size, and line height for heading, subheading, and body.
                  </p>
                </div>
                <button
                  type="button"
                  className="bk-extract-btn"
                  onClick={triggerAutoGenerateTypography}
                  disabled={generating}
                >
                  <MdAutoAwesome size={16} />
                  {generating ? 'Suggesting…' : 'Suggest Pairing'}
                </button>
              </div>

              <div className="bk-wiz-type-list bk-wiz-type-list--full">
                {[
                  {
                    role: 'heading',
                    label: 'Heading',
                    hint: 'Titles & slide headlines',
                    sample: 'The quick brown fox',
                  },
                  {
                    role: 'subheading',
                    label: 'Subheading',
                    hint: 'Section titles & captions',
                    sample: 'Clean hierarchy for clarity',
                  },
                  {
                    role: 'body',
                    label: 'Body',
                    hint: 'Paragraphs & UI copy',
                    sample: 'Readable text for decks and product surfaces.',
                  },
                ].map(({ role, label, hint, sample }) => {
                  const font = getFontRole(kitData.fonts, role)
                  const familyOptions = POPULAR_GOOGLE_FONTS.includes(font.family)
                    ? POPULAR_GOOGLE_FONTS
                    : [font.family, ...POPULAR_GOOGLE_FONTS].filter(Boolean)
                  const weightValue = String(font.weight || '400')

                  return (
                    <div className="bk-wiz-type-row bk-wiz-type-row--editable" key={role}>
                      <div className="bk-wiz-type-meta">
                        <span className="bk-wiz-type-label">{label}</span>
                        <span className="bk-wiz-type-hint">{hint}</span>
                      </div>

                      <div className="bk-wiz-type-controls bk-wiz-type-controls--grid">
                        <label className="bk-wiz-type-field">
                          <span>Font family</span>
                          <select
                            value={font.family || ''}
                            disabled={!canWrite}
                            onChange={(e) => {
                              const family = e.target.value
                              ensureGoogleFontLoaded(family)
                              patchFontRole(setKitData, role, { family })
                            }}
                          >
                            {familyOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="bk-wiz-type-field">
                          <span>Weight</span>
                          <select
                            value={
                              FONT_WEIGHT_OPTIONS.some((o) => o.value === weightValue)
                                ? weightValue
                                : weightValue
                            }
                            disabled={!canWrite}
                            onChange={(e) =>
                              patchFontRole(setKitData, role, { weight: e.target.value })
                            }
                          >
                            {!FONT_WEIGHT_OPTIONS.some((o) => o.value === weightValue) && (
                              <option value={weightValue}>
                                {formatFontWeightLabel(weightValue) || weightValue}
                              </option>
                            )}
                            {FONT_WEIGHT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="bk-wiz-type-field bk-wiz-type-field--sm">
                          <span>Size</span>
                          <input
                            type="text"
                            value={font.size || ''}
                            disabled={!canWrite}
                            placeholder="40px"
                            onChange={(e) =>
                              patchFontRole(setKitData, role, { size: e.target.value })
                            }
                          />
                        </label>

                        <label className="bk-wiz-type-field bk-wiz-type-field--sm">
                          <span>Line height</span>
                          <input
                            type="text"
                            value={font.lineHeight ?? ''}
                            disabled={!canWrite}
                            placeholder="1.2"
                            onChange={(e) =>
                              patchFontRole(setKitData, role, { lineHeight: e.target.value })
                            }
                          />
                        </label>
                      </div>

                      <div
                        className={`bk-wiz-type-sample bk-wiz-type-sample--${role}`}
                        style={{
                          fontFamily: font.family,
                          fontWeight: font.weight,
                          fontSize: font.size,
                          lineHeight: font.lineHeight,
                        }}
                      >
                        {sample}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setWizardStep(2)}>
                  <MdArrowBack size={16} /> Back
                </button>
                <button type="button" className="create-btn" onClick={() => setWizardStep(4)}>
                  Next: Review Guidelines <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW — colorful typography + colors overview */}
          {wizardStep === 4 && (
            <div className="bk-wizard-body">
              <div className="bk-wiz-review-header">
                <div>
                  <h2 className="bk-wizard-title">Review Guidelines</h2>
                  <p className="bk-wizard-desc">
                    A quick brand overview before you create the kit.
                  </p>
                </div>
                <div className="bk-wiz-review-header-actions">
                  {canWrite && (
                    <>
                      <button
                        type="button"
                        className={`bk-extract-btn ${generating ? 'generating' : ''}`}
                        onClick={triggerSuggestVoice}
                        disabled={generating || !kitName.trim()}
                      >
                        <MdAutoAwesome size={16} />
                        Suggest Voice
                      </button>
                      <button
                        type="button"
                        className={`bk-extract-btn ${generating ? 'generating' : ''}`}
                        onClick={triggerSuggestImageStyle}
                        disabled={generating}
                      >
                        <MdAutoAwesome size={16} />
                        Suggest Image Style
                      </button>
                    </>
                  )}
                </div>
              </div>

              {(() => {
                const heading = getFontRole(kitData.fonts, 'heading')
                const subheading = getFontRole(kitData.fonts, 'subheading')
                const body = getFontRole(kitData.fonts, 'body')
                const primaryFamily = heading.family || 'Outfit'
                const colors = kitData.colors || []
                const primaryHex = colors[0]?.hex || '#3B82F6'

                return (
                  <div className="bk-wiz-review-board">
                    <section className="bk-wiz-review-type">
                      <div className="bk-wiz-review-type-top">
                        <div className="bk-wiz-review-brand">
                          {logoPreviewUrl ? (
                            <img src={logoPreviewUrl} alt="" className="bk-wiz-review-logo" />
                          ) : null}
                          <div>
                            <p className="bk-wiz-review-kicker">Typography &amp; Colors</p>
                            <h3 className="bk-wiz-review-name">{kitName.trim() || 'Brand Kit'}</h3>
                            {slogan ? <p className="bk-wiz-review-tagline">{slogan}</p> : null}
                          </div>
                        </div>

                        <div
                          className="bk-wiz-review-hero-type"
                          style={{ fontFamily: primaryFamily, color: primaryHex }}
                        >
                          <span className="bk-wiz-review-family">{primaryFamily}</span>
                          <span className="bk-wiz-review-aa" aria-hidden>
                            Aa
                          </span>
                        </div>
                      </div>

                      <div className="bk-wiz-review-scale">
                        <div className="bk-wiz-review-scale-item">
                          <span className="bk-wiz-review-scale-meta">
                            H1 · {heading.size} · {formatFontWeightLabel(heading.weight)}
                          </span>
                          <p
                            style={{
                              fontFamily: heading.family,
                              fontWeight: heading.weight,
                              fontSize: Math.min(Number(heading.sizePx) || 40, 46),
                              lineHeight: heading.lineHeight,
                            }}
                          >
                            {kitName.trim() || 'Brand title'}
                          </p>
                        </div>
                        <div className="bk-wiz-review-scale-item">
                          <span className="bk-wiz-review-scale-meta">
                            H2 · {subheading.size} · {formatFontWeightLabel(subheading.weight)}
                          </span>
                          <p
                            style={{
                              fontFamily: subheading.family,
                              fontWeight: subheading.weight,
                              fontSize: Math.min(Number(subheading.sizePx) || 20, 22),
                              lineHeight: subheading.lineHeight,
                            }}
                          >
                            {slogan.trim() || 'Supporting headline'}
                          </p>
                        </div>
                        <div className="bk-wiz-review-scale-item">
                          <span className="bk-wiz-review-scale-meta">
                            Body · {body.size} · {formatFontWeightLabel(body.weight)}
                          </span>
                          <p
                            style={{
                              fontFamily: body.family,
                              fontWeight: body.weight,
                              fontSize: Math.min(Number(body.sizePx) || 14, 16),
                              lineHeight: body.lineHeight,
                            }}
                          >
                            {kitData.voice?.tone
                              ? `Voice: ${kitData.voice.tone}`
                              : 'Body copy stays clear across decks and product UI.'}
                          </p>
                        </div>
                      </div>
                    </section>

                    <aside className="bk-wiz-review-colors">
                      {colors.map((color, index) => {
                        const hex = color.hex || '#94A3B8'
                        const ink = contrastInk(hex)
                        const sizes = ['lg', 'md', 'md', 'sm', 'sm', 'sm']
                        const sizeClass = sizes[Math.min(index, sizes.length - 1)]
                        const isLight = ink === '#0f172a'
                        return (
                          <div
                            key={color.id || `${hex}-${index}`}
                            className={`bk-wiz-review-swatch bk-wiz-review-swatch--${sizeClass}${isLight ? ' is-light' : ''}`}
                            style={{ background: hex, color: ink }}
                          >
                            <span className="bk-wiz-review-swatch-name">
                              {color.name || `Color ${index + 1}`}
                            </span>
                            <span className="bk-wiz-review-swatch-hex">{hex}</span>
                          </div>
                        )
                      })}
                    </aside>

                    <div className="bk-wiz-review-extras">
                      <div className="bk-wiz-review-extra-card">
                        <span className="bk-wiz-review-extra-label">Voice</span>
                        <p>{kitData.voice?.tone || 'Not set'}</p>
                        <p className="bk-wiz-review-extra-muted">
                          {kitData.voice?.audience || 'Audience not set'}
                        </p>
                      </div>
                      <div className="bk-wiz-review-extra-card bk-wiz-review-extra-card--wide">
                        <span className="bk-wiz-review-extra-label">Image style</span>
                        <p>{kitData.imageStyle || 'Not set yet — suggest one above'}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setWizardStep(3)}>
                  <MdArrowBack size={16} /> Back
                </button>
                <button
                  type="button"
                  className="create-btn"
                  onClick={async () => {
                    await handleSave(true)
                  }}
                  disabled={saving}
                >
                  <MdCheck size={18} />
                  {saving ? 'Creating…' : 'Create & Open Studio'}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      </div>
  )
}
