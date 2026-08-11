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
} from 'react-icons/md'
import { ChevronRight } from 'lucide-react'
import {
  formatFontRoleGuideline,
  getFontRole,
  resolveRoleHex,
  hexToHsl,
  hslToHex,
  hexToRgb,
} from './utils/brandKitUtils'

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
    logoFile,
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
                    />
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
                <button type="button" className="ghost-btn" onClick={() => setShowEditor(false)}>
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
                        <button
                          type="button"
                          className="bk-copy-hex-btn"
                          onClick={() => handleCopyHex(hex)}
                        >
                          <MdContentCopy size={14} />
                          {copiedHex === hex ? 'Copied!' : 'Copy HEX'}
                        </button>
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
                            <input
                              type="color"
                              value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#0F172A'}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { hex: e.target.value.toUpperCase() })}
                              className="bk-picker-inline"
                            />
                            <input
                              type="text"
                              value={color.hex}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { hex: e.target.value })}
                              className="bk-card-hex-val"
                            />
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

          {/* STEP 3: TYPOGRAPHY & AUTO-GENERATE */}
          {/* STEP 3: TYPOGRAPHY SYSTEM (MATCHING STITCH PROTOTYPE 4f899a683a294d32b7726bc1aeabc0ae) */}
          {wizardStep === 3 && (
            <div className="bk-wizard-body">
              <div className="bk-type-header-row">
                <div className="bk-type-header-left">
                  <h2 className="bk-wizard-title">Typography System</h2>
                  <p className="bk-wizard-desc">
                    Define heading, sub heading, and body font families or auto-generate harmonic font pairings.
                  </p>
                </div>
                <button
                  type="button"
                  className="bk-extract-btn"
                  onClick={triggerAutoGenerateTypography}
                >
                  <MdAutoAwesome size={16} />
                  Auto-Generate Font Pairing
                </button>
              </div>

              {/* 12-Column Layout Grid */}
              <div className="bk-type-grid" style={{ marginBottom: 24 }}>
                {/* Left Column (Span 8) — 3 Typographic Specimen Cards */}
                <div className="bk-type-col-main">
                  {/* 1. HEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">HEADING</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.heading?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                heading: { ...prev.fonts?.heading, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Playfair Display, Outfit"
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <h2
                        className="bk-type-preview-heading"
                        style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif' }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </h2>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">{kitData.fonts?.heading?.family || 'Playfair Display'}</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">700 (Bold)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">48px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">1.2</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. SUBHEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">SUBHEADING</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                subheading: { ...prev.fonts?.subheading, family: e.target.value },
                                tertiary: { ...prev.fonts?.tertiary, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Plus Jakarta Sans, Poppins"
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <h3
                        className="bk-type-preview-subheading"
                        style={{
                          fontFamily:
                            kitData.fonts?.subheading?.family ||
                            kitData.fonts?.tertiary?.family ||
                            'Plus Jakarta Sans, sans-serif',
                        }}
                      >
                        A clean, modern sans-serif perfectly paired for clarity and contrast.
                      </h3>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">
                          {kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}
                        </span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">600 (Semi-bold)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">20px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">28px</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. BODY SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">BODY</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.body?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                body: { ...prev.fonts?.body, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Inter, Roboto"
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <p
                        className="bk-type-preview-body"
                        style={{ fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif' }}
                      >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">{kitData.fonts?.body?.family || 'Inter'}</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">400 (Regular)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">16px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">24px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Span 4) — "Typography in Action" Preview */}
                <div className="bk-type-col-side">
                  <div className="bk-type-action-card">
                    <div className="bk-action-card-head">
                      <span>TYPOGRAPHY IN ACTION</span>
                    </div>
                    <div className="bk-action-card-body">
                      <div
                        className="bk-action-cover-img"
                        style={{
                          backgroundImage:
                            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')",
                        }}
                      />
                      <div className="bk-action-content">
                        <span className="bk-action-eyebrow">CASE STUDY</span>
                        <h4
                          className="bk-action-heading"
                          style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif' }}
                        >
                          Designing for the Future of Work
                        </h4>
                        <p
                          className="bk-action-subheading"
                          style={{
                            fontFamily:
                              kitData.fonts?.subheading?.family ||
                              kitData.fonts?.tertiary?.family ||
                              'Plus Jakarta Sans, sans-serif',
                          }}
                        >
                          How minimal interfaces improve deep focus and productivity in modern enterprise software.
                        </p>
                        <p
                          className="bk-action-paragraph"
                          style={{ fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif' }}
                        >
                          The transition to asynchronous work has necessitated tools that don&apos;t just connect us, but help us manage our attention.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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

          {/* STEP 4: REVIEW & CREATE */}
          {wizardStep === 4 && (
            <div className="bk-wizard-body">
              <h2 className="bk-wizard-title">Review & Finish Brand Kit</h2>
              <p className="bk-wizard-desc">Your brand kit specification is ready. Click finish to initialize the Studio.</p>

              <div className="bk-guideline-card" style={{ marginBottom: 24 }}>
                <div className="bk-guideline-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {logoPreviewUrl && (
                      <img src={logoPreviewUrl} alt="Brand Logo" style={{ height: 32, objectFit: 'contain' }} />
                    )}
                    <h3>{kitName || 'New Brand Kit'} Specification</h3>
                  </div>
                  <span className="bk-overview-chip">Ready to Create</span>
                </div>
                <div className="bk-guideline-grid">
                  <div className="bk-guideline-block">
                    <h5>Basics</h5>
                    <p>Name: <strong>{kitName}</strong><br />Tagline: <em>{slogan || 'N/A'}</em></p>
                  </div>
                  <div className="bk-guideline-block">
                    <h5>Color Cards ({kitData.colors?.length || 0})</h5>
                    <p>Base: <code>{resolveRoleHex(kitData, 'primary', '#2563EB')}</code></p>
                  </div>
                  <div className="bk-guideline-block">
                    <h5>Typography</h5>
                    <p>
                      Heading: <strong>{formatFontRoleGuideline(getFontRole(kitData.fonts, 'heading'))}</strong><br />
                      Sub Heading: <strong>{formatFontRoleGuideline(getFontRole(kitData.fonts, 'subheading'))}</strong><br />
                      Body: <strong>{formatFontRoleGuideline(getFontRole(kitData.fonts, 'body'))}</strong>
                    </p>
                  </div>
                  <div className="bk-guideline-block">
                    <h5>Voice & Tone</h5>
                    <p>Tone: <em>{kitData.voice?.tone || 'Professional'}</em></p>
                  </div>
                </div>
              </div>

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
  )
}
