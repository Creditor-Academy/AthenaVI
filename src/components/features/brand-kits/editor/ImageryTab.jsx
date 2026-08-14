import {
  MdPhotoLibrary,
  MdAutoAwesome,
  MdAdd,
  MdClose,
} from 'react-icons/md'
import { SectionHead } from '../SectionHead'
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
  } = props

  return (
    <div className="editor-tab-content">
      <div className="bk-colors-main-col" style={{ width: '100%' }}>
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
        />

        <section className="customize-card">
          <div className="bk-type-header-row" style={{ marginBottom: 16 }}>
            <SectionHead
              icon={MdPhotoLibrary}
              title="AI Visual Brief & Charts"
              hint="Chart colors pick from your palette. Image style briefs AI visual generators."
            />
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
          <div className="bk-field">
            <label>Chart colors</label>
            <div className="chip-row">
              {(kitData.colors || []).map((c) => {
                const selected = (kitData.chartStyles?.colorIds || []).includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`role-chip with-swatch ${selected ? 'active' : ''}`}
                    disabled={!canWrite}
                    onClick={() =>
                      setKitData((prev) => {
                        const ids = new Set(prev.chartStyles?.colorIds || [])
                        if (ids.has(c.id)) ids.delete(c.id)
                        else ids.add(c.id)
                        return {
                          ...prev,
                          chartStyles: { colorIds: [...ids] },
                        }
                      })
                    }
                  >
                    <span
                      className="role-field-swatch"
                      style={{ background: c.hex, marginRight: 0 }}
                    />
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="bk-field">
            <label>Image style brief</label>
            <textarea
              value={kitData.imageStyle || ''}
              disabled={!canWrite}
              onChange={(e) => setKitData((prev) => ({ ...prev, imageStyle: e.target.value }))}
              placeholder="clean product photography, studio lighting, brand-safe"
            />
          </div>

          <h4 className="media-section-label">Photos & Graphics Upload</h4>
          <div className="upload-grid">
            <button
              type="button"
              className="upload-box"
              disabled={!canWrite}
              onClick={() => triggerUpload('photo')}
            >
              <MdAdd size={28} color="var(--bk-accent)" />
              <span className="upload-label">Upload photo</span>
            </button>
            <button
              type="button"
              className="upload-box"
              disabled={!canWrite}
              onClick={() => triggerUpload('graphic')}
            >
              <MdAdd size={28} color="var(--bk-accent)" />
              <span className="upload-label">Upload graphic</span>
            </button>
          </div>

          {['photo', 'graphic'].map((kind) => {
            const items = mediaByKind(kind)
            if (!items.length) return null
            return (
              <div key={kind}>
                <div className="media-section-label">{kind}s</div>
                <div className="upload-grid">
                  {items.map((item) => {
                    const id = item.id || item._id
                    const url = item.url || item.presignedUrl || item.src
                    return (
                      <div className="upload-box" key={id} style={{ cursor: 'default' }}>
                        {canWrite && (
                          <button
                            type="button"
                            className="media-remove"
                            onClick={() => handleDeleteMedia(id)}
                            aria-label="Remove media"
                          >
                            <MdClose size={14} />
                          </button>
                        )}
                        {url ? <img src={url} alt={item.name || kind} /> : null}
                        <span className="upload-label">{item.role || item.name || kind}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}
