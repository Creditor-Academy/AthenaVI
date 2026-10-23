import { useState, useEffect, useMemo } from 'react'
import { Edit2, Check, LayoutTemplate, Plus, Lock } from 'lucide-react'
import { PPT_CAPS, formatOutlineContentType } from '../../../utils/presentationHelpers'
import { formatNarrativeRole } from '../../../constants/narrativeRoleLabels'
import {
  buildBlueprintThemeStyle,
  blueprintCardClassName,
  resolveBlueprintThemeLabel,
} from '../../../utils/blueprintThemeVars'

function layoutName(layoutId, choices) {
  if (!layoutId) return ''
  const hit = (choices || []).find((c) => c.layoutId === layoutId)
  return hit?.name || layoutId.replace(/_/g, ' ')
}

function layoutStatusCopy(slide) {
  if (slide.layoutLocked && slide.layoutId) {
    return {
      badge: 'locked',
      label: `Locked layout: ${layoutName(slide.layoutId)}`,
      hint: 'This slide will use the layout you chose.',
    }
  }

  const typeLabel = formatOutlineContentType(slide.suggestedContentType)
  if (typeLabel) {
    return {
      badge: 'auto',
      label: `Suggested type: ${typeLabel}`,
      hint: 'Final layout is chosen automatically after slide content is generated.',
    }
  }

  return {
    badge: 'auto',
    label: 'Layout chosen after content',
    hint: 'We pick the best existing layout once the slide copy is written.',
  }
}

function intentHint(slide) {
  const parts = []
  if (slide.purpose || slide.intent) {
    parts.push(formatOutlineContentType(slide.purpose || slide.intent))
  }
  if (Array.isArray(slide.contentTypeHints) && slide.contentTypeHints.length) {
    parts.push(slide.contentTypeHints.map((t) => formatOutlineContentType(t)).join(', '))
  }
  return parts.filter(Boolean).join(' · ')
}

function BlueprintThemeBar({ themeLabel, palette }) {
  if (!palette?.bg && !palette?.primary) return null
  return (
    <div className="aig-blueprint-theme-bar" aria-label={`Deck palette: ${themeLabel || 'Theme'}`}>
      <div className="aig-blueprint-theme-preview">
        <span style={{ background: palette.bg }} title="Background" />
        <span style={{ background: palette.primary }} title="Primary" />
        <span style={{ background: palette.secondary || palette.primary }} title="Secondary" />
        <span style={{ background: palette.accent || palette.secondary || palette.primary }} title="Accent" />
      </div>
      {themeLabel ? <span className="aig-blueprint-theme-name">Palette: {themeLabel}</span> : null}
    </div>
  )
}

export default function AIPptOutline({
  initialOutline,
  layoutChoices = [],
  fontPairing = null,
  onGenerate,
  onBack,
  creditEstimate = null,
  isSubmitting = false,
  colorThemeId = null,
  colorThemes = [],
}) {
  const [outline, setOutline] = useState(initialOutline)
  const [stepReady, setStepReady] = useState(false)

  const blueprintTheme = useMemo(
    () => buildBlueprintThemeStyle(colorThemeId, colorThemes),
    [colorThemeId, colorThemes]
  )
  const themeLabel = useMemo(
    () => resolveBlueprintThemeLabel(colorThemeId, colorThemes),
    [colorThemeId, colorThemes]
  )

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

  const updateOutlineField = (id, patch) => {
    setOutline((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const handleAddSlide = () => {
    if (outline.length >= PPT_CAPS.AI_SLIDE_MAX) return
    setOutline((prev) => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        title: 'New slide topic',
        description: ['Add key points for this slide'],
        summary: 'Add key points for this slide',
        layoutId: null,
        layoutLocked: false,
        layoutWhy: '',
        suggestedContentType: 'bullet_list',
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

  const fontLabel =
    fontPairing?.heading && fontPairing?.body
      ? `${fontPairing.heading} + ${fontPairing.body}`
      : null

  return (
    <>
      <main className="aig-main-fullscreen">
        <div className={`aig-step aig-step--4 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
          <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
            <h2 className="aig-step-title">The Blueprint</h2>
            <p className="aig-step-subtitle">
              Review each slide&apos;s story and intent. Layouts are picked automatically after content is
              generated — lock one only if you want a specific template.
            </p>
            <BlueprintThemeBar themeLabel={themeLabel} palette={blueprintTheme.palette} />
            {fontLabel && <p className="aig-credit-estimate-hint">Type: {fontLabel}</p>}
            {estimateLabel && <p className="aig-credit-estimate-hint">{estimateLabel}</p>}
          </div>

          <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
            <div
              className="aig-outline-list"
              style={blueprintTheme.style}
              data-blueprint-appearance={blueprintTheme.appearance}
            >
              {outline.map((slide, idx) => {
                const layoutStatus = layoutStatusCopy(slide)
                const hint = intentHint(slide)
                const roleMeta = formatNarrativeRole(slide.narrativeRole)
                const typeLabel = formatOutlineContentType(slide.suggestedContentType)

                return (
                  <div
                    key={slide.id}
                    className={`${blueprintCardClassName(blueprintTheme.appearance)} aig-stagger-fade-in`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="aig-outline-number">
                      <span>{idx + 1}</span>
                    </div>
                    <div className="aig-outline-content">
                      {!slide.isEditing && (roleMeta.label || typeLabel) ? (
                        <div className="aig-outline-meta-row">
                          {roleMeta.label ? (
                            <span
                              className={`aig-outline-role-chip aig-outline-role-chip--${roleMeta.group}`}
                            >
                              {roleMeta.label}
                            </span>
                          ) : null}
                          {typeLabel ? (
                            <span className="aig-outline-type-chip">{typeLabel}</span>
                          ) : null}
                        </div>
                      ) : null}

                      {slide.isEditing ? (
                        <input
                          className="aig-outline-input fade-in"
                          value={slide.title}
                          onChange={(e) => updateOutlineField(slide.id, { title: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        <h4 className="aig-outline-topic fade-in">{slide.title}</h4>
                      )}

                      {slide.isEditing ? (
                        <textarea
                          className="aig-outline-desc-input fade-in"
                          value={
                            Array.isArray(slide.description)
                              ? slide.description.join('\n')
                              : slide.summary || slide.description || ''
                          }
                          onChange={(e) =>
                            updateOutlineField(slide.id, {
                              description: e.target.value.split('\n').filter(Boolean),
                              summary: e.target.value,
                              contentIntent: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      ) : (
                        <ul className="aig-outline-bullets fade-in">
                          {Array.isArray(slide.description) ? (
                            slide.description.map((pt, i) => <li key={i}>{pt}</li>)
                          ) : (
                            <li>{slide.description}</li>
                          )}
                        </ul>
                      )}

                      {hint && !slide.isEditing && (
                        <p className="aig-outline-intent-hint">{hint}</p>
                      )}

                      <div className="aig-outline-layout-row">
                        {slide.isEditing && layoutChoices.length > 0 ? (
                          <>
                            <label className="aig-outline-layout-label" htmlFor={`layout-${slide.id}`}>
                              Layout preference
                            </label>
                            <select
                              id={`layout-${slide.id}`}
                              className="aig-outline-layout-select"
                              value={slide.layoutLocked && slide.layoutId ? slide.layoutId : ''}
                              onChange={(e) => {
                                const nextId = e.target.value
                                if (!nextId) {
                                  updateOutlineField(slide.id, {
                                    layoutId: null,
                                    layoutLocked: false,
                                    layoutWhy: '',
                                  })
                                  return
                                }
                                const hit = layoutChoices.find((c) => c.layoutId === nextId)
                                updateOutlineField(slide.id, {
                                  layoutId: nextId,
                                  layoutLocked: true,
                                  suggestedContentType: hit?.contentType || slide.suggestedContentType,
                                  layoutWhy: 'Locked in Blueprint',
                                })
                              }}
                            >
                              <option value="">Auto — pick best layout after content</option>
                              {layoutChoices.map((choice) => (
                                <option key={choice.layoutId} value={choice.layoutId}>
                                  Lock: {choice.name} ({choice.contentType})
                                </option>
                              ))}
                            </select>
                            <p className="aig-outline-layout-help">
                              Leave on Auto for smart layout selection. Choose a layout only when you want to
                              force that template.
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="aig-outline-layout-status">
                              <span
                                className={`aig-outline-layout-badge aig-outline-layout-badge--${layoutStatus.badge}`}
                              >
                                {layoutStatus.badge === 'locked' ? (
                                  <>
                                    <Lock size={12} /> Locked
                                  </>
                                ) : (
                                  'Auto'
                                )}
                              </span>
                              <p className="aig-outline-layout-meta">{layoutStatus.label}</p>
                            </div>
                            <p className="aig-outline-layout-help">{layoutStatus.hint}</p>
                            {slide.layoutWhy && slide.layoutLocked ? (
                              <p className="aig-outline-layout-why">{slide.layoutWhy}</p>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      className={`aig-outline-edit-btn ${slide.isEditing ? 'editing' : ''}`}
                      onClick={() => toggleEditOutline(slide.id)}
                      aria-label="Edit topic"
                    >
                      {slide.isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                    </button>
                  </div>
                )
              })}

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
