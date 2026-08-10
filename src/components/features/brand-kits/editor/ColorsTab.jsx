import { MdAutoAwesome, MdAdd, MdContentCopy, MdClose, MdCheck } from 'react-icons/md'
import { hexToHsl, hslToHex, hexToRgb } from '../utils/brandKitUtils'

export default function ColorsTab(props) {
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
                      className="bk-extract-btn"
                      onClick={() => {
                        const base = primaryColors[0]?.hex || '#2563EB'
                        const [h, s, l] = hexToHsl(base)
                        const gen = [
                          hslToHex(h + 60, s, l),
                          hslToHex(h + 180, s, l),
                          hslToHex(h + 240, s, l),
                        ]

                        setKitData((prev) => ({
                          ...prev,
                          colors: [
                            ...(prev.colors || []),
                            ...gen.map((hex, i) => ({
                              id: `c_gen_${Date.now()}_${i}`,
                              name: `Harmonic Accent ${i + 1}`,
                              hex,
                            })),
                          ].slice(0, 32),
                        }))
                      }}
                    >
                      <MdAutoAwesome size={16} />
                      Generate Palette
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
                      const roleName = index === 0 ? 'Primary Color (Light Mode)' : 'Background Color (Light Mode)'

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
                                <span className="bk-card-role-tag">{roleName}</span>
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
                            <p className="bk-card-desc">
                              {index === 0
                                ? 'Primary accent color for Light Theme buttons and navigational elements.'
                                : 'Light, crisp background surface tone for Light Theme.'}
                            </p>
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

                  <div className="bk-secondary-swatches-grid">
                    {secondaryColors.map((color, idx) => {
                      const actualIndex = idx + 2
                      const hex = color.hex
                      return (
                        <div
                          key={color.id || idx}
                          className="bk-secondary-card"
                          onClick={() => handleCopyHex(hex)}
                          title="Click to copy HEX"
                        >
                          <div
                            className="bk-sec-swatch-box"
                            style={{ background: hex }}
                          >
                            <span className="bk-sec-copy-icon">
                              {copiedHex === hex ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                            </span>
                          </div>
                          <input
                            type="text"
                            className="bk-sec-name-input"
                            value={color.name}
                            disabled={!canWrite}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateColor(actualIndex, { name: e.target.value })}
                          />
                          <span className="bk-sec-hex-val">{hex}</span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>
            </div>
  )
}
