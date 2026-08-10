import { MdAutoAwesome, MdAdd, MdClose, MdImage } from 'react-icons/md'
import { LOGO_ROLES } from '../../../../utils/brandKitHelpers'

export default function LogosTab(props) {
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
              <div className="bk-logo-variants-intro">
                <div>
                  <p className="bk-logo-variants-desc">
                    Upload each logo variant below. Each version is optimised for different contexts — light and dark themes, monochrome printing, horizontal lockups, and more.
                  </p>
                  <div className="bk-dl-formats-row" style={{ marginTop: 8 }}>
                    <span className="bk-dl-label">ACCEPTED FORMATS</span>
                    <span className="bk-dl-badge">SVG</span>
                    <span className="bk-dl-badge">PNG</span>
                    <span className="bk-dl-badge">WEBP</span>
                    <span className="bk-dl-badge">JPG</span>
                  </div>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    className={`bk-extract-btn ${generating ? 'generating' : ''}`}
                    onClick={generateLogoVariants}
                    disabled={generating}
                    title="Auto-generates Light Mode, Dark Mode, Black, and White variants from your Primary Logo using canvas pixel processing"
                  >
                    <MdAutoAwesome size={16} />
                    {generating ? `Generating ${generatingRole || ''}…` : 'Generate Variants from Primary'}
                  </button>
                )}
              </div>

              <div className="bk-logo-variant-grid">
                {[
                  {
                    role: 'primary',
                    label: 'Primary Logo',
                    desc: 'Primary brand mark for general use on neutral backgrounds.',
                    bg: 'var(--bk-page)',
                  },
                  {
                    role: 'light-mode',
                    label: 'Light Mode',
                    desc: 'Optimised for use on light / white backgrounds.',
                    bg: '#F8FAFC',
                  },
                  {
                    role: 'dark-mode',
                    label: 'Dark Mode',
                    desc: 'Optimised for use on dark / black backgrounds.',
                    bg: '#0F172A',
                  },
                  {
                    role: 'with-name-below',
                    label: 'With Name Below',
                    desc: 'Mark stacked above the brand wordmark.',
                    bg: 'var(--bk-page)',
                  },
                  {
                    role: 'with-name-adjacent',
                    label: 'With Name Adjacent',
                    desc: 'Mark and wordmark side-by-side (horizontal lockup).',
                    bg: 'var(--bk-page)',
                  },
                  {
                    role: 'black',
                    label: 'Black / Monochrome',
                    desc: 'Single-colour black version for light backgrounds and print.',
                    bg: '#F1F5F9',
                  },
                  {
                    role: 'white',
                    label: 'White / Reversed',
                    desc: 'Single-colour white version for dark backgrounds and overlays.',
                    bg: '#1E293B',
                  },
                ].map(({ role, label, desc, bg }) => {
                  // For the 'primary' card also accept legacy role='main'
                  const uploaded = mediaByKind('logo').filter(
                    (m) => (m.role || '') === role || (role === 'primary' && (m.role || '') === 'main')
                  )
                  // Fallback: show wizard logo preview if no server-uploaded file yet
                  const fallbackSrc = role === 'primary' ? logoPreviewUrl : null
                  const hasUpload = uploaded.length > 0
                  const hasFallback = !hasUpload && !!fallbackSrc

                  return (
                    <div key={role} className="bk-logo-variant-card">
                      {/* Preview canvas */}
                      <div
                        className={`bk-logo-variant-canvas ${role === 'dark-mode' || role === 'white' ? 'dark-canvas' : ''}`}
                        style={{ background: bg }}
                      >
                        {hasUpload || hasFallback ? (
                          <>
                            <img
                              src={
                                hasUpload
                                  ? (uploaded[0].url || uploaded[0].src || uploaded[0].presignedUrl)
                                  : fallbackSrc
                              }
                              alt={label}
                              className="bk-logo-variant-img"
                            />
                            {canWrite && (
                              <button
                                type="button"
                                className="bk-logo-variant-remove"
                                onClick={() => handleDeleteMedia(uploaded[0].id || uploaded[0]._id)}
                                aria-label={`Remove ${label}`}
                              >
                                <MdClose size={14} />
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            className="bk-logo-variant-dropzone"
                            disabled={!canWrite}
                            onClick={() => triggerUpload('logo', role)}
                          >
                            <MdAdd size={26} />
                            <span>Upload</span>
                          </button>
                        )}
                      </div>

                      {/* Label row */}
                      <div className="bk-logo-variant-footer">
                        <div className="bk-logo-variant-label-col">
                          <span className="bk-logo-variant-name">{label}</span>
                          <span className="bk-logo-variant-desc">{desc}</span>
                        </div>
                        {hasUpload && canWrite && (
                          <button
                            type="button"
                            className="bk-logo-variant-replace-btn"
                            onClick={() => triggerUpload('logo', role)}
                            title={`Replace ${label}`}
                          >
                            Replace
                          </button>
                        )}
                      </div>

                      {/* Status chip */}
                      <div className={`bk-logo-variant-status ${hasUpload ? 'uploaded' : 'empty'}`}>
                        {hasUpload ? '✓ Uploaded' : 'Missing'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
  )
}
