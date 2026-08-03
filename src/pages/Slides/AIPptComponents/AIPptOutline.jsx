import { useState, useEffect } from 'react'
import { Edit2, Check, LayoutTemplate, Plus } from 'lucide-react'
import { PPT_CAPS } from '../../../utils/presentationHelpers'

export default function AIPptOutline({
  initialOutline,
  onGenerate,
  onBack,
  creditEstimate = null,
  isSubmitting = false,
}) {
  const [outline, setOutline] = useState(initialOutline)
  const [stepReady, setStepReady] = useState(false)

  useEffect(() => {
    setOutline(initialOutline)
  }, [initialOutline])

  useEffect(() => {
    const timer = setTimeout(() => setStepReady(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const toggleEditOutline = (id) => {
    setOutline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item))
    )
  }

  const updateOutlineTitle = (id, newTitle) => {
    setOutline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
    )
  }

  const handleAddSlide = () => {
    if (outline.length >= PPT_CAPS.AI_SLIDE_MAX) return
    setOutline((prev) => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        title: 'New slide topic',
        description: ['Add key points for this slide'],
        isEditing: true,
      },
    ])
  }

  const estimateLabel = (() => {
    if (!creditEstimate) return null
    const credits =
      creditEstimate.totalEstimatedCredits ??
      creditEstimate.estimatedCredits ??
      creditEstimate.credits ??
      creditEstimate.total ??
      creditEstimate.estimate
    if (credits == null) return null
    return `${credits} credits estimated`
  })()

  return (
    <>
      <main className="aig-main-fullscreen">
        <div className={`aig-step aig-step--4 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
          <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
            <h2 className="aig-step-title">The Blueprint</h2>
            <p className="aig-step-subtitle">
              Review your outline. Click edit to tweak any slide topics before we generate.
            </p>
            {estimateLabel && (
              <p className="aig-credit-estimate-hint">{estimateLabel}</p>
            )}
          </div>

          <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
            <div className="aig-outline-list">
              {outline.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="aig-outline-card aig-stagger-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="aig-outline-number">
                    <span>{idx + 1}</span>
                  </div>
                  <div className="aig-outline-content">
                    {slide.isEditing ? (
                      <input
                        className="aig-outline-input fade-in"
                        value={slide.title}
                        onChange={(e) => updateOutlineTitle(slide.id, e.target.value)}
                        autoFocus
                        onBlur={() => toggleEditOutline(slide.id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleEditOutline(slide.id)}
                      />
                    ) : (
                      <h4 className="aig-outline-topic fade-in">{slide.title}</h4>
                    )}

                    <ul className="aig-outline-bullets fade-in">
                      {Array.isArray(slide.description) ? (
                        slide.description.map((pt, i) => <li key={i}>{pt}</li>)
                      ) : (
                        <li>{slide.description}</li>
                      )}
                    </ul>
                  </div>
                  <button
                    className={`aig-outline-edit-btn ${slide.isEditing ? 'editing' : ''}`}
                    onClick={() => toggleEditOutline(slide.id)}
                    aria-label="Edit topic"
                  >
                    {slide.isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                  </button>
                </div>
              ))}

              <button
                className="aig-outline-add-btn aig-stagger-fade-in"
                style={{ animationDelay: `${outline.length * 0.05}s` }}
                onClick={handleAddSlide}
                disabled={outline.length >= PPT_CAPS.AI_SLIDE_MAX}
                type="button"
              >
                <Plus size={18} strokeWidth={2.5} /> Add slide
                {outline.length >= PPT_CAPS.AI_SLIDE_MAX ? ` (max ${PPT_CAPS.AI_SLIDE_MAX})` : ''}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={`aig-footer ${stepReady ? 'fade-in' : ''}`} style={{ opacity: stepReady ? 1 : 0 }}>
        <div className="aig-footer-content">
          <button className="aig-btn-secondary" onClick={onBack} disabled={isSubmitting}>
            Back
          </button>
          <button
            className={`aig-btn-primary ${isSubmitting ? 'loading' : ''}`}
            onClick={() => onGenerate(outline)}
            disabled={isSubmitting || outline.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="aig-spinner"></div>
                Starting…
              </>
            ) : (
              <>
                <LayoutTemplate size={18} /> Build Presentation
              </>
            )}
          </button>
        </div>
      </footer>
    </>
  )
}
