import { MdAutoAwesome, MdAdd, MdClose, MdArrowForward, MdPhotoLibrary, MdImage } from 'react-icons/md'
import LogoMockupsSection from './LogoMockupsSection'

export default function ImageryTab(props) {
  const {
    canWrite,
    kitData,
    setKitData,
    triggerUpload,
    handleDeleteMedia,
    mediaByKind,
    uploading,
    generating,
    triggerSuggestImageStyle,
    hasLogoOnKit,
    mockupTemplates,
    mockupBilling,
    mockupSaved,
    mockupLoading,
    mockupGeneratingId,
    mockupPreviews,
    loadMockups,
    generateMockup,
    saveMockup,
    deleteMockup,
    downloadMockupPng,
  } = props

  const colors = kitData.colors || []
  const chartIds = kitData.chartStyles?.colorIds || []
  const photos = mediaByKind('photo')
  const graphics = mediaByKind('graphic')
  const mediaCount = photos.length + graphics.length
  const mockupCount = (mockupSaved || []).length
  const chartColors = colors.filter((c) => chartIds.includes(c.id))

  return (
    <div className="editor-tab-content">
      <div className="bk-colors-header-row">
        <div className="bk-type-header-left">
          <h2 className="bk-type-page-title">Imagery System</h2>
          <p className="bk-type-page-desc">
            Generate logo mockups, set chart colors, and collect brand photos and graphics for
            decks and product surfaces.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            className={`bk-extract-btn ${generating ? 'generating' : ''}`}
            onClick={triggerSuggestImageStyle}
            disabled={generating || uploading}
          >
            <MdAutoAwesome size={16} />
            {generating ? 'Suggesting…' : 'Suggest Image Style'}
          </button>
        )}
      </div>

      <div className="bk-type-grid">
        <div className="bk-type-col-main">
          <LogoMockupsSection
            canWrite={canWrite}
            hasLogo={hasLogoOnKit}
            templates={mockupTemplates}
            billing={mockupBilling}
            savedMockups={mockupSaved}
            loading={mockupLoading}
            generatingTemplateId={mockupGeneratingId}
            previews={mockupPreviews}
            onGenerate={generateMockup}
            onSave={saveMockup}
            onLoad={loadMockups}
            onDelete={deleteMockup}
            onDownload={downloadMockupPng}
          />

          <div className="bk-type-specimen-box bk-imagery-section">
            <div className="bk-type-box-head">
              <div>
                <span className="bk-type-box-tag">Visual brief &amp; charts</span>
                <p className="bk-imagery-section-desc">
                  Chart colors pick from your palette. Image style briefs AI visual generators.
                </p>
              </div>
            </div>

            <div className="bk-imagery-brief-block">
              <span className="bk-tb-lbl">Chart colors</span>
              <div className="bk-btn-swatches bk-imagery-chart-swatches" role="listbox" aria-label="Chart colors">
                {colors.length ? (
                  colors.map((color) => {
                    const selected = chartIds.includes(color.id)
                    return (
                      <button
                        key={color.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`bk-btn-swatch${selected ? ' is-active' : ''}`}
                        style={{ background: color.hex || '#94A3B8' }}
                        disabled={!canWrite}
                        title={`${color.name || 'Color'} (${color.hex || ''})`}
                        onClick={() =>
                          setKitData((prev) => {
                            const ids = new Set(prev.chartStyles?.colorIds || [])
                            if (ids.has(color.id)) ids.delete(color.id)
                            else ids.add(color.id)
                            return {
                              ...prev,
                              chartStyles: { colorIds: [...ids] },
                            }
                          })
                        }
                      />
                    )
                  })
                ) : (
                  <p className="bk-imagery-empty-hint">Add colors in Brand Colors to pick chart accents.</p>
                )}
              </div>
              {chartColors.length > 0 && (
                <div className="bk-imagery-chart-strip" aria-hidden>
                  {chartColors.map((c) => (
                    <span key={c.id} style={{ background: c.hex }} />
                  ))}
                </div>
              )}
            </div>

            <label className="bk-imagery-style-field">
              <span className="bk-tb-lbl">Image style brief</span>
              <textarea
                value={kitData.imageStyle || ''}
                disabled={!canWrite}
                onChange={(e) => setKitData((prev) => ({ ...prev, imageStyle: e.target.value }))}
                placeholder="clean product photography, studio lighting, brand-safe"
                rows={4}
              />
            </label>
          </div>

          <div className="bk-type-specimen-box bk-imagery-section">
            <div className="bk-type-box-head">
              <div>
                <span className="bk-type-box-tag">Photos &amp; graphics</span>
                <p className="bk-imagery-section-desc">
                  Upload brand photography and supporting graphics used across kits and guidelines.
                </p>
              </div>
            </div>

            <div className="bk-imagery-upload-grid">
              <button
                type="button"
                className="bk-imagery-upload-tile"
                disabled={!canWrite}
                onClick={() => triggerUpload('photo')}
              >
                <MdAdd size={22} />
                <span>Upload photo</span>
              </button>
              <button
                type="button"
                className="bk-imagery-upload-tile"
                disabled={!canWrite}
                onClick={() => triggerUpload('graphic')}
              >
                <MdAdd size={22} />
                <span>Upload graphic</span>
              </button>
            </div>

            {['photo', 'graphic'].map((kind) => {
              const items = mediaByKind(kind)
              if (!items.length) return null
              return (
                <div key={kind} className="bk-imagery-media-block">
                  <div className="bk-type-box-head bk-imagery-subhead">
                    <span className="bk-type-box-tag">{kind}s</span>
                  </div>
                  <div className="bk-imagery-media-grid">
                    {items.map((item) => {
                      const id = item.id || item._id
                      const url = item.url || item.presignedUrl || item.src
                      return (
                        <div className="bk-imagery-media-card" key={id}>
                          {canWrite && (
                            <button
                              type="button"
                              className="bk-imagery-media-remove"
                              onClick={() => handleDeleteMedia(id)}
                              aria-label="Remove media"
                            >
                              <MdClose size={14} />
                            </button>
                          )}
                          {url ? (
                            <img src={url} alt={item.name || kind} />
                          ) : (
                            <div className="bk-imagery-media-fallback">
                              <MdImage size={22} />
                            </div>
                          )}
                          <span className="bk-imagery-media-label">
                            {item.role || item.name || kind}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bk-type-col-side">
          <div className="bk-type-action-card bk-imagery-action-card">
            <div className="bk-action-card-head">
              <span>IMAGERY IN ACTION</span>
            </div>
            <div className="bk-action-card-body">
              <div className="bk-btn-action-scene bk-btn-action-scene--light">
                <span className="bk-action-eyebrow">IMAGE STYLE</span>
                <p className="bk-imagery-action-brief">
                  {kitData.imageStyle?.trim() ||
                    'Add an image style brief to guide AI photography and product visuals.'}
                </p>
              </div>

              <div className="bk-btn-action-scene bk-btn-action-scene--dark">
                <span className="bk-action-eyebrow">CHART PALETTE</span>
                {chartColors.length ? (
                  <div className="bk-imagery-action-charts">
                    {chartColors.map((c) => (
                      <div key={c.id} className="bk-imagery-action-chart-swatch">
                        <span style={{ background: c.hex }} />
                        <em>{c.name || c.hex}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="bk-action-paragraph">Select chart colors from your palette.</p>
                )}
              </div>

              <div className="bk-imagery-action-stats">
                <div>
                  <strong>{mockupCount}</strong>
                  <span>Mockups</span>
                </div>
                <div>
                  <strong>{mediaCount}</strong>
                  <span>Assets</span>
                </div>
                <div>
                  <strong>{chartColors.length}</strong>
                  <span>Chart</span>
                </div>
              </div>

              <button type="button" className="bk-action-btn" disabled>
                <MdPhotoLibrary size={14} /> Brand imagery kit <MdArrowForward size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
