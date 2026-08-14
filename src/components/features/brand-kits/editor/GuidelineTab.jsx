import { MdAutoAwesome, MdDownload, MdGridView, MdViewList, MdArrowBack, MdArrowForward, MdImage, MdPalette } from 'react-icons/md'
import { formatFontWeightLabel, getFontRole } from '../utils/brandKitUtils'
import { findLogoMedia } from '../../../../utils/brandKitHelpers'

export default function GuidelineTab(props) {
  const {
    canWrite,
    kitData,
    mediaByKind,
    downloadBrandGuidelinePdf,
    generatingGuideline,
    generateBrandGuidelines,
    guidelineLink,
    workspaceId,
    activeSlideIndex,
    setActiveSlideIndex,
    kitName,
    logoPreviewUrl,
  } = props

  const onGenerate = () => {
    if (typeof generateBrandGuidelines === 'function') {
      generateBrandGuidelines()
      return
    }
    downloadBrandGuidelinePdf?.()
  }

  return (
            <div className="editor-tab-content">
              <div className="bk-slides-studio-layout">
                {/* Header Row */}
                <div className="bk-slides-studio-header">
                  <div className="bk-type-header-left">
                    <h2 className="bk-type-page-title">Brand Guideline Presentation Deck</h2>
                    <p className="bk-type-page-desc">
                      Generate a 6-slide brand guideline deck via the Brand Kit API, then open or export it.
                      {guidelineLink?.presentationId
                        ? ` Linked deck: ${guidelineLink.name || guidelineLink.presentationId}`
                        : ''}
                    </p>
                  </div>
                  <div className="bk-slides-actions">
                    <button
                      type="button"
                      className={`bk-extract-btn ${generatingGuideline ? 'generating' : ''}`}
                      onClick={onGenerate}
                      disabled={generatingGuideline || !canWrite}
                    >
                      <MdAutoAwesome size={16} />
                      {generatingGuideline
                        ? 'Generating Deck…'
                        : guidelineLink?.presentationId
                          ? 'Regenerate Brand Guideline'
                          : 'Generate Brand Guideline'}
                    </button>
                    <button
                      type="button"
                      className="create-btn"
                      onClick={downloadBrandGuidelinePdf}
                      disabled={generatingGuideline}
                    >
                      <MdDownload size={16} />
                      Download Deck (.pdf)
                    </button>
                    {guidelineLink?.presentationId && workspaceId && (
                      <a
                        className="ghost-btn"
                        href={`/dashboard/editor?workspaceId=${encodeURIComponent(workspaceId)}&presentationId=${encodeURIComponent(guidelineLink.presentationId)}&title=${encodeURIComponent(guidelineLink.name || 'Brand Guidelines')}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        Open Deck
                      </a>
                    )}
                  </div>
                </div>

                {/* Main Studio Workspace: Left Viewer + Right 2-Col Thumbnails Sidebar */}
                <div className="bk-slides-workspace">
                  {/* Left Column: Outside Left Arrow + 4:3 Slide Viewer + Outside Right Arrow */}
                  <div className="bk-slides-viewer-container">
                    <div className="bk-slides-viewer-row">
                      {/* Outside Left Arrow */}
                      <button
                        type="button"
                        className="bk-slide-outside-arrow"
                        disabled={activeSlideIndex === 0}
                        onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                        title="Previous Slide"
                        aria-label="Previous Slide"
                      >
                        <MdArrowBack size={20} />
                      </button>

                      {/* 4:3 Slide Viewer Frame */}
                      <div className="bk-slide-viewer">
                        {/* Header Tag */}
                        <div className="bk-slide-header-tag">
                          <span className="bk-slide-tag-lbl">
                            {['01 / COVER', '02 / PALETTE', '03 / LOGOS', '04 / TYPOGRAPHY', '05 / IMAGERY', '06 / GOVERNANCE'][activeSlideIndex]}
                          </span>
                          <span className="bk-slide-tag-brand">{kitName || 'Brand Identity'}</span>
                        </div>

                        {/* Active Slide Body Content */}
                        <div className="bk-slide-body">
                          {/* SLIDE 1: COVER */}
                          {activeSlideIndex === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div className="bk-slide-cover-badge">
                                <MdPalette size={14} /> EXECUTIVE BRAND SPECIFICATION
                              </div>
                              <h1 className="bk-slide-cover-title">{kitName || 'Brand Kit'}</h1>
                              <p className="bk-slide-cover-desc">
                                Comprehensive identity design system, color palette specifications, typography hierarchy, and brand governance rules.
                              </p>
                            </div>
                          )}

                          {/* SLIDE 2: PALETTE */}
                          {activeSlideIndex === 1 && (
                            <div>
                              <h3 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Brand Color Palette
                              </h3>
                              <div className="bk-slide-color-grid">
                                {(kitData.colors || []).slice(0, 6).map((c, i) => (
                                  <div key={c.id || i} className="bk-slide-color-card">
                                    <div className="bk-slide-swatch-box" style={{ background: c.hex }} />
                                    <span className="bk-slide-color-name">{c.name}</span>
                                    <span className="bk-slide-color-hex">{c.hex}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="bk-slide-info-box">
                                <h4>Color Standards & Accessibility</h4>
                                <p>
                                  Primary brand colors drive core call-to-action surfaces. Ensure all foreground text achieves minimum WCAG AA contrast (4.5:1 ratio).
                                </p>
                              </div>
                            </div>
                          )}

                          {/* SLIDE 3: LOGO SYSTEM */}
                          {activeSlideIndex === 2 && (
                            <div>
                              <h3 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Logo Lockups & Clear Space Rules
                              </h3>
                              <div className="bk-slide-logo-grid">
                                {[
                                  { role: 'primary', label: 'Primary Mark' },
                                  { role: 'light', label: 'Light Mode' },
                                  { role: 'dark', label: 'Dark Mode' },
                                  { role: 'black', label: 'Black / Mono' },
                                  { role: 'white', label: 'White Reversed' },
                                  { role: 'with-name-adjacent', label: 'Horizontal Lockup' },
                                ].map(({ role, label }) => {
                                  const item = findLogoMedia(mediaByKind('logo'), role)
                                  const url =
                                    item?.url ||
                                    item?.src ||
                                    item?.presignedUrl ||
                                    (role === 'primary' ? logoPreviewUrl : null)
                                  return (
                                    <div key={role} className="bk-slide-logo-card">
                                      <span className="bk-slide-logo-title">{label}</span>
                                      <div className="bk-slide-logo-canvas">
                                        {url ? (
                                          <img src={url} alt={label} />
                                        ) : (
                                          <span style={{ fontSize: 11, color: '#64748B' }}>[ Mark Specimen ]</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* SLIDE 4: TYPOGRAPHY SYSTEM */}
                          {activeSlideIndex === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Typography System & Hierarchy
                              </h3>
                              {(() => {
                                const headingFont = getFontRole(kitData.fonts, 'heading')
                                const subheadingFont = getFontRole(kitData.fonts, 'subheading')
                                const bodyFont = getFontRole(kitData.fonts, 'body')
                                return (
                                  <>
                              <div className="bk-slide-info-box">
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.1em' }}>
                                  HEADING · {formatFontWeightLabel(headingFont.weight).toUpperCase()} · {headingFont.size} · LH {headingFont.lineHeight}
                                </span>
                                <h2
                                  style={{
                                    margin: 0,
                                    fontSize: headingFont.size,
                                    fontWeight: headingFont.weight,
                                    lineHeight: headingFont.lineHeight,
                                    color: '#FFFFFF',
                                    fontFamily: headingFont.family,
                                  }}
                                >
                                  {headingFont.family} Heading Title
                                </h2>
                              </div>
                              <div className="bk-slide-info-box">
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.1em' }}>
                                  SUBHEADING · {formatFontWeightLabel(subheadingFont.weight).toUpperCase()} · {subheadingFont.size} · LH {subheadingFont.lineHeight}
                                </span>
                                <h4
                                  style={{
                                    margin: 0,
                                    fontSize: subheadingFont.size,
                                    fontWeight: subheadingFont.weight,
                                    lineHeight: subheadingFont.lineHeight,
                                    color: '#CBD5E1',
                                    fontFamily: subheadingFont.family,
                                  }}
                                >
                                  {subheadingFont.family} Sub Heading Tagline
                                </h4>
                              </div>
                              <div className="bk-slide-info-box">
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.1em' }}>
                                  BODY · {formatFontWeightLabel(bodyFont.weight).toUpperCase()} · {bodyFont.size} · LH {bodyFont.lineHeight}
                                </span>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: bodyFont.size,
                                    fontWeight: bodyFont.weight,
                                    lineHeight: bodyFont.lineHeight,
                                    color: '#94A3B8',
                                    fontFamily: bodyFont.family,
                                  }}
                                >
                                  The quick brown fox jumps over the lazy dog. Executive deck layouts combine elegant display headings, distinct subheadings, and highly readable body typography.
                                </p>
                              </div>
                                  </>
                                )
                              })()}
                            </div>
                          )}

                          {/* SLIDE 5: IMAGERY & MOOD */}
                          {activeSlideIndex === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Imagery & Photography Style Brief
                              </h3>
                              <div className="bk-slide-info-box">
                                <h4>Visual Brief Statement</h4>
                                <p style={{ fontStyle: 'italic', fontSize: 14, color: '#E2E8F0' }}>
                                  &quot;{kitData.imageStyle || 'Clean product photography with studio lighting, brand-safe minimal aesthetics, and natural composition.'}&quot;
                                </p>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                <div className="bk-slide-info-box">
                                  <h4>Lighting Tone</h4>
                                  <p>Bright, natural daylight with soft studio fills.</p>
                                </div>
                                <div className="bk-slide-info-box">
                                  <h4>Composition</h4>
                                  <p>Uncluttered subject placement with spacious margins.</p>
                                </div>
                                <div className="bk-slide-info-box">
                                  <h4>Brand Accent</h4>
                                  <p>Natural integration of brand colors in environment.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SLIDE 6: GOVERNANCE */}
                          {activeSlideIndex === 5 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Brand Governance & Compliance
                              </h3>
                              <div className="bk-slide-info-box">
                                <h4>Compliance Guidelines</h4>
                                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <li>Always use approved SVG/PNG logo vectors from official brand kit repository.</li>
                                  <li>Do not alter hex codes, font family pairings, or aspect ratios.</li>
                                  <li>Target Voice Tone: <strong>{kitData.voice?.tone || 'Professional & Confident'}</strong></li>
                                  <li>Target Audience: <strong>{kitData.voice?.audience || 'General Enterprise Stakeholders'}</strong></li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="bk-slide-footer">
                          <span>{kitName || 'Brand Kit'} • Executive Guidelines</span>
                          <span>16:9 Widescreen • Slide {activeSlideIndex + 1} of 6</span>
                        </div>
                      </div>

                      {/* Outside Right Arrow */}
                      <button
                        type="button"
                        className="bk-slide-outside-arrow"
                        disabled={activeSlideIndex === 5}
                        onClick={() => setActiveSlideIndex((prev) => Math.min(5, prev + 1))}
                        title="Next Slide"
                        aria-label="Next Slide"
                      >
                        <MdArrowForward size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 2-Column Scene Navigator Sidebar */}
                  <div className="bk-slides-sidebar">
                    <div className="bk-sidebar-head">
                      <span>SLIDE SCENES</span>
                      <span className="bk-sidebar-count">0{activeSlideIndex + 1} / 06</span>
                    </div>

                    <div className="bk-sidebar-grid">
                      {[
                        '01 Cover',
                        '02 Colors',
                        '03 Logos',
                        '04 Typography',
                        '05 Imagery',
                        '06 Governance',
                      ].map((title, idx) => (
                        <div
                          key={idx}
                          className={`bk-sidebar-thumb ${activeSlideIndex === idx ? 'active' : ''}`}
                          onClick={() => setActiveSlideIndex(idx)}
                        >
                          <div className="bk-thumb-canvas">
                            <span className="bk-thumb-num">0{idx + 1}</span>
                          </div>
                          <span className="bk-thumb-title">{title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
  )
}
