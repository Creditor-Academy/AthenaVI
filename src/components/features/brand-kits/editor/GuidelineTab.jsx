import { useState } from 'react'
import { MdAutoAwesome, MdDownload, MdCheck } from 'react-icons/md'
import { DEFAULT_GUIDELINE_TEMPLATE_ID, GUIDELINE_TEMPLATES } from '../utils/brandKitConstants'
import GuidelineDeckViewer from './GuidelineDeckViewer'

function roleHex(kitData, role, fallback) {
  const id = kitData?.colorRoles?.[role]
  return (kitData?.colors || []).find((c) => c.id === id)?.hex || fallback
}

/** Tiny CSS mock of a template's content slide, tinted with the kit's own colors. */
function TemplateThumb({ templateId, kitData }) {
  const dark = templateId === 'midnight'
  const bg = dark ? roleHex(kitData, 'bgDark', '#0B1120') : roleHex(kitData, 'bg', '#F8FAFC')
  const ink = dark ? roleHex(kitData, 'textDark', '#F8FAFC') : roleHex(kitData, 'text', '#0F172A')
  const primary = roleHex(kitData, 'primary', '#2563EB')
  const card = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  return (
    <div className={`bk-tpl-thumb bk-tpl-thumb--${templateId}`} style={{ background: bg, color: ink }} aria-hidden="true">
      {templateId === 'corporate' && <span className="bk-tpl-rail" style={{ background: primary }} />}
      {templateId !== 'corporate' && (
        <span className={`bk-tpl-marker${dark ? ' is-pill' : ''}`} style={{ background: primary }} />
      )}
      <span className="bk-tpl-title" style={{ background: ink }} />
      <span className="bk-tpl-cards">
        {[0, 1, 2].map((i) => (
          <span key={i} className="bk-tpl-card" style={templateId === 'minimal' ? undefined : { background: card }}>
            <span className="bk-tpl-line" style={{ background: primary }} />
            <span className="bk-tpl-line is-body" style={{ background: ink }} />
          </span>
        ))}
      </span>
      {templateId === 'corporate' && <span className="bk-tpl-footer" style={{ background: card }} />}
    </div>
  )
}

export default function GuidelineTab(props) {
  const {
    canWrite,
    kitData,
    downloadBrandGuidelinePdf,
    generatingGuideline,
    generateBrandGuidelines,
    guidelineLink,
    workspaceId,
    editingKitId,
    isDirty,
    activeSlideIndex,
    setActiveSlideIndex,
  } = props

  const [templateId, setTemplateId] = useState(
    () =>
      guidelineLink?.templateId ||
      kitData?.meta?.guidelineTemplateId ||
      DEFAULT_GUIDELINE_TEMPLATE_ID
  )

  const selectTemplate = (id) => {
    setTemplateId(id)
    setActiveSlideIndex(0)
  }

  const onGenerate = () => {
    if (typeof generateBrandGuidelines === 'function') {
      generateBrandGuidelines(templateId)
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
                      Pick a template, generate an 8-slide brand guideline deck, then open or export it.
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

                <div className="bk-tpl-picker" role="radiogroup" aria-label="Guideline deck template">
                  {GUIDELINE_TEMPLATES.map((tpl) => {
                    const selected = tpl.id === templateId
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`bk-tpl-option${selected ? ' is-selected' : ''}`}
                        onClick={() => selectTemplate(tpl.id)}
                        disabled={generatingGuideline}
                      >
                        <TemplateThumb templateId={tpl.id} kitData={kitData} />
                        <span className="bk-tpl-meta">
                          <span className="bk-tpl-name">
                            {tpl.name}
                            {selected && <MdCheck size={14} />}
                          </span>
                          <span className="bk-tpl-desc">{tpl.description}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                {editingKitId ? (
                  <GuidelineDeckViewer
                    workspaceId={workspaceId}
                    brandKitId={editingKitId}
                    guidelineLink={guidelineLink}
                    templateId={templateId}
                    generating={generatingGuideline}
                    isDirty={isDirty}
                    kitData={kitData}
                    activeSlideIndex={activeSlideIndex}
                    setActiveSlideIndex={setActiveSlideIndex}
                  />
                ) : (
                  <p className="bk-gv-note">Save the brand kit to preview its guideline deck.</p>
                )}
              </div>
            </div>
  )
}
