import { MdAutoAwesome, MdArrowForward } from 'react-icons/md'
import { TypeSpecEditors } from '../TypeSpecEditors'
import { getFontRole } from '../utils/brandKitUtils'

export default function TypographyTab(props) {
  const {
    canWrite,
    kitData,
    triggerAutoGenerateTypography,
    updateFontRole,
  } = props

  return (
            <div className="editor-tab-content">
              {/* Subheader Title & Auto-Generate Action Button */}
              <div className="bk-type-header-row">
                <div className="bk-type-header-left">
                  <h2 className="bk-type-page-title">Typography System</h2>
                  <p className="bk-type-page-desc">
                    Define how your brand communicates through type across executive presentation decks and marketing surfaces.
                  </p>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    className="bk-extract-btn"
                    onClick={triggerAutoGenerateTypography}
                  >
                    <MdAutoAwesome size={16} />
                    Auto-Generate Font Pairing
                  </button>
                )}
              </div>

              {/* 12-Column Layout Grid */}
              <div className="bk-type-grid">
                {/* Left Column (Span 8) — 3 Typographic Specimen Cards */}
                <div className="bk-type-col-main">
                  {(() => {
                    const headingFont = getFontRole(kitData.fonts, 'heading')
                    const subheadingFont = getFontRole(kitData.fonts, 'subheading')
                    const bodyFont = getFontRole(kitData.fonts, 'body')
                    return (
                      <>
                  {/* 1. HEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">HEADING</span>
                    </div>

                    <TypeSpecEditors
                      role="heading"
                      font={headingFont}
                      canWrite={canWrite}
                      onPatch={(patch) => updateFontRole('heading', patch)}
                    />

                    <div className="bk-type-box-preview">
                      <h2
                        className="bk-type-preview-heading"
                        style={{
                          fontFamily: headingFont.family,
                          fontWeight: headingFont.weight,
                          fontSize: headingFont.size,
                          lineHeight: headingFont.lineHeight,
                        }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </h2>
                    </div>
                  </div>

                  {/* 2. SUBHEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">SUBHEADING</span>
                    </div>

                    <TypeSpecEditors
                      role="subheading"
                      font={subheadingFont}
                      canWrite={canWrite}
                      onPatch={(patch) => updateFontRole('subheading', patch)}
                    />

                    <div className="bk-type-box-preview">
                      <h3
                        className="bk-type-preview-subheading"
                        style={{
                          fontFamily: subheadingFont.family,
                          fontWeight: subheadingFont.weight,
                          fontSize: subheadingFont.size,
                          lineHeight: subheadingFont.lineHeight,
                        }}
                      >
                        A clean, modern sans-serif perfectly paired for clarity and contrast.
                      </h3>
                    </div>
                  </div>

                  {/* 3. BODY SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">BODY</span>
                    </div>

                    <TypeSpecEditors
                      role="body"
                      font={bodyFont}
                      canWrite={canWrite}
                      onPatch={(patch) => updateFontRole('body', patch)}
                    />

                    <div className="bk-type-box-preview">
                      <p
                        className="bk-type-preview-body"
                        style={{
                          fontFamily: bodyFont.family,
                          fontWeight: bodyFont.weight,
                          fontSize: bodyFont.size,
                          lineHeight: bodyFont.lineHeight,
                        }}
                      >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                      </p>
                    </div>
                  </div>
                      </>
                    )
                  })()}
                </div>

                {/* Right Column (Span 4) — "Typography in Action" Sticky Preview Card */}
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
                          style={{
                            fontFamily: getFontRole(kitData.fonts, 'heading').family,
                            fontWeight: getFontRole(kitData.fonts, 'heading').weight,
                            fontSize: getFontRole(kitData.fonts, 'heading').size,
                            lineHeight: getFontRole(kitData.fonts, 'heading').lineHeight,
                          }}
                        >
                          Designing for the Future of Work
                        </h4>
                        <p
                          className="bk-action-subheading"
                          style={{
                            fontFamily: getFontRole(kitData.fonts, 'subheading').family,
                            fontWeight: getFontRole(kitData.fonts, 'subheading').weight,
                            fontSize: getFontRole(kitData.fonts, 'subheading').size,
                            lineHeight: getFontRole(kitData.fonts, 'subheading').lineHeight,
                          }}
                        >
                          How minimal interfaces improve deep focus and productivity in modern enterprise software.
                        </p>
                        <p
                          className="bk-action-paragraph"
                          style={{
                            fontFamily: getFontRole(kitData.fonts, 'body').family,
                            fontWeight: getFontRole(kitData.fonts, 'body').weight,
                            fontSize: getFontRole(kitData.fonts, 'body').size,
                            lineHeight: getFontRole(kitData.fonts, 'body').lineHeight,
                          }}
                        >
                          The transition to asynchronous work has necessitated tools that don&apos;t just connect us, but help us manage our attention. By reducing visual noise and employing strict typographic hierarchies, we create environments that feel less like dashboards and more like quiet studios.
                        </p>
                      </div>
                      <button type="button" className="bk-action-btn">
                        Read Full Article <MdArrowForward size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  )
}
