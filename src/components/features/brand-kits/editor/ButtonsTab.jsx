import ButtonStylesSection from './ButtonStylesSection'
import { resolveButtonStyle } from '../../../../utils/brandKitHelpers'
import { getFontRole } from '../utils/brandKitUtils'

export default function ButtonsTab({ canWrite, kitData, setKitData }) {
  const primary = resolveButtonStyle(kitData, 'primary')
  const secondary = resolveButtonStyle(kitData, 'secondary')
  const heading = getFontRole(kitData.fonts, 'heading')
  const body = getFontRole(kitData.fonts, 'body')

  return (
    <div className="editor-tab-content">
      <div className="bk-colors-header-row">
        <div className="bk-type-header-left">
          <h2 className="bk-type-page-title">Button System</h2>
          <p className="bk-type-page-desc">
            Shape primary and secondary CTAs for decks, product UI, and brand guidelines. Colors
            pull from your palette and save with the kit.
          </p>
        </div>
      </div>

      <div className="bk-type-grid">
        <div className="bk-type-col-main">
          <ButtonStylesSection canWrite={canWrite} kitData={kitData} setKitData={setKitData} />
        </div>

        <div className="bk-type-col-side">
          <div className="bk-type-action-card bk-btn-action-card">
            <div className="bk-action-card-head">
              <span>BUTTONS IN ACTION</span>
            </div>
            <div className="bk-action-card-body">
              <div className="bk-btn-action-scene bk-btn-action-scene--light">
                <span className="bk-action-eyebrow">LIGHT SURFACE</span>
                <h4
                  className="bk-action-heading"
                  style={{
                    fontFamily: heading.family,
                    fontWeight: heading.weight,
                    fontSize: 'clamp(18px, 2vw, 22px)',
                    lineHeight: heading.lineHeight,
                  }}
                >
                  Ready to launch?
                </h4>
                <p
                  className="bk-action-paragraph"
                  style={{
                    fontFamily: body.family,
                    fontWeight: body.weight,
                    fontSize: '13px',
                    lineHeight: body.lineHeight,
                  }}
                >
                  Preview how CTAs read on light product surfaces and presentation slides.
                </p>
                <div className="bk-btn-action-row">
                  <button type="button" className="bk-button-style-preview" style={primary.css}>
                    {primary.label}
                  </button>
                  <button type="button" className="bk-button-style-preview" style={secondary.css}>
                    {secondary.label}
                  </button>
                </div>
              </div>

              <div className="bk-btn-action-scene bk-btn-action-scene--dark">
                <span className="bk-action-eyebrow">DARK SURFACE</span>
                <h4 className="bk-action-heading">Continue editing</h4>
                <p className="bk-action-paragraph">
                  Same styles on dark UI — check contrast and border treatment live.
                </p>
                <div className="bk-btn-action-row">
                  <button type="button" className="bk-button-style-preview" style={primary.css}>
                    {primary.label}
                  </button>
                  <button type="button" className="bk-button-style-preview" style={secondary.css}>
                    {secondary.label}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
