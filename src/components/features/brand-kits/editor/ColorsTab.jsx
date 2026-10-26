import { MdAutoAwesome, MdAdd, MdContentCopy, MdClose, MdCheck, MdEdit } from 'react-icons/md'
import { hexToHsl, hexToRgb } from '../utils/brandKitUtils'
import { colorRoleLabels } from '../../../../utils/brandKitHelpers'
import ColorContrastPanel from '../ColorContrastPanel'

const ROLE_DESCRIPTIONS = {
  Primary: 'Main brand color for buttons, links, and highlights.',
  Secondary: 'Secondary brand tone for supporting UI and charts.',
  Accent: 'Accent tone for emphasis, surfaces, and charts.',
  Muted: 'Muted tone for captions and secondary text.',
  Background: 'Slide and page background in light mode.',
  Text: 'Heading and body text color in light mode.',
  'Dark Primary': 'Primary accent for dark theme buttons and highlights.',
  'Dark Background': 'Slide and page background in dark mode.',
  'Dark Text': 'Heading and body text color in dark mode.',
}

function roleInfo(colorRoles, colorId) {
  const labels = colorRoleLabels(colorRoles, colorId)
  return {
    tag: labels.length ? labels.join(' · ') : 'Supporting Tone',
    desc: ROLE_DESCRIPTIONS[labels[0]] || 'Supporting tone for charts, accents, and secondary UI.',
  }
}

export default function ColorsTab(props) {
  const {
    kitData,
    setKitData,
    canWrite,
    copiedHex,
    handleCopyHex,
    updateColor,
    addColor,
    removeColor,
    primaryColors,
    secondaryColors,
    colorsList,
    generating,
    triggerGenerateFromLogo,
  } = props

  return (
            <div className="editor-tab-content">
              <div className="bk-colors-header-row">
                <div className="bk-type-header-left">
                  <h2 className="bk-type-page-title">Brand Colors</h2>
                  <p className="bk-type-page-desc">
                    Build light and dark theme palettes, then expand with harmonic accents for presentations and marketing surfaces.
                  </p>
                </div>
                {canWrite && (
                  <div className="bk-colors-header-actions">
                    <button
                      type="button"
                      className={`bk-extract-btn ${generating ? 'generating' : ''}`}
                      onClick={triggerGenerateFromLogo}
                      disabled={generating}
                    >
                      <MdAutoAwesome size={16} />
                      {generating ? 'Suggesting…' : 'Suggest from Logo'}
                    </button>
                    <button type="button" className="create-btn" onClick={addColor}>
                      <MdAdd size={18} />
                      Add Color
                    </button>
                  </div>
                )}
              </div>

              <div className="bk-colors-main-col" style={{ width: '100%' }}>
                {/* [01] Primary Palette */}
                <section className="bk-color-section">
                  <div className="bk-section-head-line">
                    <span className="bk-sec-num">[01]</span>
                    <h3 className="bk-sec-title">Primary Theme Palette</h3>
                  </div>

                  <div className="bk-primary-swatches-grid">
                    {(primaryColors.length > 0 ? primaryColors : colorsList).map((color, index) => {
                      const hex = color.hex || '#0F172A'
                      const rgb = hexToRgb(hex)
                      const [h, s, l] = hexToHsl(hex)
                      const role = roleInfo(kitData?.colorRoles, color.id)

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
                            {canWrite && (
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
                                <span className="bk-card-role-tag">{role.tag}</span>
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
                            <p className="bk-card-desc">{role.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* [02] Secondary & Dark Mode Palette */}
                <section className="bk-color-section" style={{ marginTop: 28 }}>
                  <div className="bk-section-head-line">
                    <span className="bk-sec-num">[02]</span>
                    <h3 className="bk-sec-title">Dark Mode & Secondary Tones</h3>
                  </div>

                  {secondaryColors.length === 0 ? (
                    <div className="bk-secondary-empty">
                      <p>No dark / secondary tones yet. Add colors to extend the palette.</p>
                      {canWrite && (
                        <button type="button" className="ghost-btn" onClick={addColor}>
                          <MdAdd size={16} /> Add Color
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bk-primary-swatches-grid">
                      {secondaryColors.map((color, idx) => {
                        const actualIndex = idx + 2
                        const hex = color.hex || '#0F172A'
                        const rgb = hexToRgb(hex)
                        const [h, s, l] = hexToHsl(hex)
                        const role = roleInfo(kitData?.colorRoles, color.id)

                        return (
                          <div className="bk-color-card" key={color.id || actualIndex}>
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
                              {canWrite && colorsList.length > 2 && (
                                <button
                                  type="button"
                                  className="bk-card-delete-btn"
                                  onClick={() => removeColor(actualIndex)}
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
                                    onChange={(e) =>
                                      updateColor(actualIndex, { name: e.target.value })
                                    }
                                    placeholder="Color Name"
                                  />
                                  <span className="bk-card-role-tag">{role.tag}</span>
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
                                      onChange={(e) =>
                                        updateColor(actualIndex, {
                                          hex: e.target.value.toUpperCase(),
                                        })
                                      }
                                      className="bk-picker-inline"
                                      aria-label={`Edit ${color.name || 'color'}`}
                                    />
                                  </label>
                                  <input
                                    type="text"
                                    value={color.hex}
                                    disabled={!canWrite}
                                    onChange={(e) =>
                                      updateColor(actualIndex, { hex: e.target.value })
                                    }
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
                                    {copiedHex === hex ? (
                                      <MdCheck size={14} />
                                    ) : (
                                      <MdContentCopy size={14} />
                                    )}
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
                                  <span className="bk-tech-val">
                                    {h}°, {s}%, {l}%
                                  </span>
                                </div>
                              </div>
                              <p className="bk-card-desc">{role.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                <div style={{ marginTop: 28 }}>
                  <ColorContrastPanel kitData={kitData} setKitData={setKitData} canWrite={canWrite} />
                </div>
              </div>
            </div>
  )
}
