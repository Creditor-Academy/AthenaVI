import { MdArrowForward, MdAdd, MdCheck, MdContentCopy } from 'react-icons/md'
import { formatFontWeightLabel, getFontRole } from '../utils/brandKitUtils'

export default function OverviewTab(props) {
  const {
    canWrite,
    kitData,
    setKitData,
    setEditorTab,
    copiedHex,
    handleCopyHex,
    updateColor,
    addColor,
    removeColor,
    primaryColors,
    secondaryColors,
    colorsList,
    triggerUpload,
    handleDeleteMedia,
    mediaByKind,
    uploading,
    generatingRole,
    generating,
    generateLogoVariants,
    triggerAutoGenerateTypography,
    updateFontRole,
    downloadBrandGuidelinePdf,
    generatingGuideline,
    activeSlideIndex,
    setActiveSlideIndex,
    slideViewMode,
    setSlideViewMode,
    kitName,
    kitMedia,
    logoPreviewUrl,
  } = props

  return (
            <div className="editor-tab-content">
              <div className="bk-bento-grid">
                {/* Brand Health Card (Span 4) */}
                <div className="bk-bento-card col-4">
                  <div className="bk-bento-card-head">
                    <h3 className="bk-bento-card-title">Brand Health</h3>
                    <button
                      type="button"
                      className="bk-circle-arrow-btn"
                      onClick={() => setEditorTab('guideline')}
                      title="View Guideline"
                    >
                      <MdArrowForward size={16} />
                    </button>
                  </div>
                  <div className="bk-bento-health-body">
                    <div className="bk-health-ring-box">
                      <svg className="bk-health-svg" viewBox="0 0 100 100">
                        <circle className="bk-ring-bg" cx="50" cy="50" r="42" strokeWidth="8" />
                        <circle
                          className="bk-ring-val"
                          cx="50"
                          cy="50"
                          r="42"
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset="21"
                        />
                      </svg>
                      <span className="bk-health-num">92<small>%</small></span>
                    </div>
                    <div className="bk-health-info">
                      <span className="bk-health-status">Excellent Consistency</span>
                      <span className="bk-health-desc">Across 1,204 active generative assets this month.</span>
                    </div>
                  </div>
                </div>

                {/* Primary Marks Card (Span 8) */}
                <div className="bk-bento-card col-8 bk-bento-logo-hero">
                  <div className="bk-bento-logo-left">
                    <div>
                      <h3 className="bk-bento-card-title">Primary Marks</h3>
                      <p className="bk-bento-desc">
                        The core visual identifier for the brand. Requires minimum clear space of 1.5x cap height.
                      </p>
                    </div>
                    <div className="bk-logo-formats">
                      <span className="bk-formats-label">FORMATS</span>
                      <div className="bk-formats-pills">
                        <span className="bk-format-chip">SVG</span>
                        <span className="bk-format-chip">PNG</span>
                        <span className="bk-format-chip">WEBP</span>
                      </div>
                    </div>
                  </div>
                  <div className="bk-bento-logo-right">
                    <div className="bk-bento-logo-canvas">
                      {mediaByKind('logo').length > 0 ? (
                        <img
                          src={mediaByKind('logo')[0].url || mediaByKind('logo')[0].src}
                          alt="Primary Brand Logo"
                          className="bk-bento-logo-img"
                        />
                      ) : logoPreviewUrl ? (
                        <img src={logoPreviewUrl} alt="Primary Brand Logo" className="bk-bento-logo-img" />
                      ) : (
                        <button
                          type="button"
                          className="bk-logo-upload-placeholder"
                          disabled={!canWrite}
                          onClick={() => triggerUpload('logo')}
                        >
                          <MdAdd size={32} color="var(--bk-accent)" />
                          <span>Upload Primary Mark</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Core Palette Card (Span 7) */}
                <div className="bk-bento-card col-7">
                  <div className="bk-bento-card-head">
                    <h3 className="bk-bento-card-title">Core Palette</h3>
                    <span className="bk-bento-tag">HEX / RGB / HSL</span>
                  </div>
                  <div className="bk-bento-swatch-grid">
                    {(kitData.colors || []).slice(0, 4).map((c, i) => (
                      <div
                        key={c.id || i}
                        className="bk-bento-swatch-item"
                        onClick={() => handleCopyHex(c.hex)}
                        title="Click to copy HEX"
                      >
                        <div className="bk-bento-swatch-box" style={{ background: c.hex }}>
                          <span className="bk-bento-copy-icon">
                            {copiedHex === c.hex ? <MdCheck size={14} /> : <MdContentCopy size={14} />}
                          </span>
                        </div>
                        <span className="bk-bento-swatch-name">{c.name}</span>
                        <span className="bk-bento-swatch-hex">{c.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography Card (Span 5) */}
                <div
                  className="bk-bento-card col-5 bk-bento-type-card"
                  onClick={() => setEditorTab('typography')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full Typography System"
                >
                  <div className="bk-bento-card-head">
                    <h3 className="bk-bento-card-title">Typography</h3>
                  </div>
                  <div className="bk-bento-type-rows">
                    <div className="bk-bento-type-item">
                      <span className="bk-type-role">HEADINGS</span>
                      <div className="bk-type-val-row">
                        <span
                          className="bk-type-font-name"
                          style={{ fontFamily: getFontRole(kitData.fonts, 'heading').family }}
                        >
                          {getFontRole(kitData.fonts, 'heading').family}
                        </span>
                        <span className="bk-type-weights">
                          {formatFontWeightLabel(getFontRole(kitData.fonts, 'heading').weight)} · {getFontRole(kitData.fonts, 'heading').size} · LH {getFontRole(kitData.fonts, 'heading').lineHeight}
                        </span>
                      </div>
                    </div>
                    <div className="bk-bento-type-item">
                      <span className="bk-type-role">SUB HEADINGS</span>
                      <div className="bk-type-val-row">
                        <span
                          className="bk-type-font-name"
                          style={{ fontFamily: getFontRole(kitData.fonts, 'subheading').family }}
                        >
                          {getFontRole(kitData.fonts, 'subheading').family}
                        </span>
                        <span className="bk-type-weights">
                          {formatFontWeightLabel(getFontRole(kitData.fonts, 'subheading').weight)} · {getFontRole(kitData.fonts, 'subheading').size} · LH {getFontRole(kitData.fonts, 'subheading').lineHeight}
                        </span>
                      </div>
                    </div>
                    <div className="bk-bento-type-item">
                      <span className="bk-type-role">BODY & UI</span>
                      <div className="bk-type-val-row">
                        <span
                          className="bk-type-font-name"
                          style={{ fontFamily: getFontRole(kitData.fonts, 'body').family }}
                        >
                          {getFontRole(kitData.fonts, 'body').family}
                        </span>
                        <span className="bk-type-weights">
                          {formatFontWeightLabel(getFontRole(kitData.fonts, 'body').weight)} · {getFontRole(kitData.fonts, 'body').size} · LH {getFontRole(kitData.fonts, 'body').lineHeight}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bk-bento-watermark">Aa</div>
                </div>
              </div>
            </div>
  )
}
