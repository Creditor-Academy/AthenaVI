import { MdAutoAwesome } from 'react-icons/md'
import { TypeSpecEditors } from '../TypeSpecEditors'
import { getFontRole } from '../utils/brandKitUtils'
import { resolveFontRoleTextColors } from '../../../../utils/brandKitHelpers'

function TypeRolePreview({ font, sample, textColors }) {
  return (
    <div className="bk-wordmark-color-preview-row bk-type-role-preview-row">
      <div className="bk-wordmark-color-preview bk-wordmark-color-preview--light">
        <span className="bk-wordmark-preview-label">Light mode</span>
        <div
          className="bk-type-role-preview-copy"
          style={{
            fontFamily: font.family,
            fontWeight: font.weight,
            fontSize: font.size,
            lineHeight: font.lineHeight,
            color: textColors.light,
          }}
        >
          {sample}
        </div>
      </div>
      <div className="bk-wordmark-color-preview bk-wordmark-color-preview--dark">
        <span className="bk-wordmark-preview-label">Dark mode</span>
        <div
          className="bk-type-role-preview-copy"
          style={{
            fontFamily: font.family,
            fontWeight: font.weight,
            fontSize: font.size,
            lineHeight: font.lineHeight,
            color: textColors.dark,
          }}
        >
          {sample}
        </div>
      </div>
    </div>
  )
}

export default function TypographyTab(props) {
  const {
    canWrite,
    kitData,
    triggerAutoGenerateTypography,
    updateFontRole,
    applyFontPairing,
  } = props

  const colors = kitData?.colors || []
  const headingFont = getFontRole(kitData.fonts, 'heading')
  const subheadingFont = getFontRole(kitData.fonts, 'subheading')
  const bodyFont = getFontRole(kitData.fonts, 'body')
  const headingColors = resolveFontRoleTextColors(kitData, 'heading')
  const subheadingColors = resolveFontRoleTextColors(kitData, 'subheading')
  const bodyColors = resolveFontRoleTextColors(kitData, 'body')

  return (
    <div className="editor-tab-content">
      <div className="bk-type-header-row">
        <div className="bk-type-header-left">
          <h2 className="bk-type-page-title">Typography System</h2>
          <p className="bk-type-page-desc">
            Define font roles, sizes, and light/dark text colours for headings, subheadings, and
            body copy across your brand surfaces.
          </p>
        </div>
        {canWrite && (
          <button type="button" className="bk-extract-btn" onClick={triggerAutoGenerateTypography}>
            <MdAutoAwesome size={16} />
            Auto-Generate Font Pairing
          </button>
        )}
      </div>

      <div className="bk-type-grid">
        <div className="bk-type-col-main">
          <div className="bk-type-specimen-box">
            <div className="bk-type-box-head">
              <span className="bk-type-box-tag">HEADING</span>
            </div>

            <TypeSpecEditors
              role="heading"
              font={headingFont}
              colors={colors}
              canWrite={canWrite}
              showPairings
              onApplyPairing={applyFontPairing}
              onPatch={(patch) => updateFontRole('heading', patch)}
            />

            <TypeRolePreview
              font={headingFont}
              textColors={headingColors}
              sample="The quick brown fox jumps over the lazy dog"
            />
          </div>

          <div className="bk-type-specimen-box">
            <div className="bk-type-box-head">
              <span className="bk-type-box-tag">SUBHEADING</span>
            </div>

            <TypeSpecEditors
              role="subheading"
              font={subheadingFont}
              colors={colors}
              canWrite={canWrite}
              onPatch={(patch) => updateFontRole('subheading', patch)}
            />

            <TypeRolePreview
              font={subheadingFont}
              textColors={subheadingColors}
              sample="A clean, modern sans-serif perfectly paired for clarity and contrast."
            />
          </div>

          <div className="bk-type-specimen-box">
            <div className="bk-type-box-head">
              <span className="bk-type-box-tag">BODY</span>
            </div>

            <TypeSpecEditors
              role="body"
              font={bodyFont}
              colors={colors}
              canWrite={canWrite}
              onPatch={(patch) => updateFontRole('body', patch)}
            />

            <TypeRolePreview
              font={bodyFont}
              textColors={bodyColors}
              sample="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            />
          </div>
        </div>

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
                <span className="bk-action-eyebrow" style={{ color: subheadingColors.light }}>
                  CASE STUDY
                </span>
                <h4
                  className="bk-action-heading"
                  style={{
                    fontFamily: headingFont.family,
                    fontWeight: headingFont.weight,
                    fontSize: headingFont.size,
                    lineHeight: headingFont.lineHeight,
                    color: headingColors.light,
                  }}
                >
                  Designing for the Future of Work
                </h4>
                <p
                  className="bk-action-subheading"
                  style={{
                    fontFamily: subheadingFont.family,
                    fontWeight: subheadingFont.weight,
                    fontSize: subheadingFont.size,
                    lineHeight: subheadingFont.lineHeight,
                    color: subheadingColors.light,
                  }}
                >
                  How minimal interfaces improve deep focus and productivity in modern enterprise
                  software.
                </p>
                <p
                  className="bk-action-paragraph"
                  style={{
                    fontFamily: bodyFont.family,
                    fontWeight: bodyFont.weight,
                    fontSize: bodyFont.size,
                    lineHeight: bodyFont.lineHeight,
                    color: bodyColors.light,
                  }}
                >
                  The transition to asynchronous work has necessitated tools that don&apos;t just
                  connect us, but help us manage our attention. By reducing visual noise and
                  employing strict typographic hierarchies, we create environments that feel less like
                  dashboards and more like quiet studios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
