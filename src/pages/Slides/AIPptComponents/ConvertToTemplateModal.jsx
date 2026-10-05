import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiFileText, FiLoader, FiX } from 'react-icons/fi'
import superadminService, { SuperadminApiError } from '../../../services/superadminService'
import './pptPanelUi.css'

function formatPublishError(err) {
  if (err instanceof SuperadminApiError) {
    const details = (err.errors || []).filter(Boolean).map(String)
    if (details.length) {
      const joined = details.join(' ')
      if (joined && joined !== 'Validation error') return joined
    }
    return err.message || 'Publish failed'
  }
  return err?.message || 'Publish failed'
}

function suggestPackId(name) {
  const base = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120)
  return base ? `${base}_v1` : 'deck_pack_v1'
}

export default function ConvertToTemplateModal({
  presentationId,
  defaultName = 'Untitled Presentation',
  defaultThemeId = '',
  slideCount = 0,
  onBeforePublish,
  onClose,
  onPublished,
}) {
  const [name, setName] = useState(defaultName)
  const [packId, setPackId] = useState(() => suggestPackId(defaultName))
  const [packIdTouched, setPackIdTouched] = useState(false)
  const [themeId, setThemeId] = useState(() => {
    const t = String(defaultThemeId || '').trim()
    return /^[a-zA-Z0-9_-]{1,64}$/.test(t) ? t : ''
  })
  const [isActive, setIsActive] = useState(true)
  const [phase, setPhase] = useState('form')
  const [error, setError] = useState('')
  const [createdTemplate, setCreatedTemplate] = useState(null)

  const busy = phase === 'working'

  useEffect(() => {
    if (packIdTouched) return
    setPackId(suggestPackId(name))
  }, [name, packIdTouched])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  const canPublish = useMemo(
    () => Boolean(presentationId && name.trim() && packId.trim() && slideCount > 0),
    [presentationId, name, packId, slideCount]
  )

  const runPublish = useCallback(async () => {
    if (!canPublish) {
      setError(
        !presentationId
          ? 'Save the presentation before converting to a template.'
          : slideCount < 1
            ? 'Add at least one slide before publishing a template.'
            : 'Template name and pack ID are required.'
      )
      return
    }

    setPhase('working')
    setError('')

    try {
      await onBeforePublish?.()
      const result = await superadminService.publishPresentationAsPack(presentationId, {
        name: name.trim(),
        packId: packId.trim(),
        themeId: /^[a-zA-Z0-9_-]{1,64}$/.test(themeId.trim()) ? themeId.trim() : undefined,
        variant: 'canvas',
        isActive,
      })
      const template = result?.template ?? result?.data?.template ?? result
      setCreatedTemplate(template)
      setPhase('done')
      onPublished?.(template)
    } catch (err) {
      setPhase('form')
      setError(formatPublishError(err))
    }
  }, [
    canPublish,
    presentationId,
    slideCount,
    onBeforePublish,
    name,
    packId,
    themeId,
    isActive,
    onPublished,
  ])

  return (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose?.()}
    >
      <div
        className="ppt-editor-modal"
        role="dialog"
        aria-labelledby="ppt-convert-template-title"
      >
        <header className="ppt-editor-modal-head">
          <div className="ppt-editor-modal-head-text">
            <span className="ppt-editor-modal-kicker">Superadmin</span>
            <h3 id="ppt-convert-template-title" className="ppt-editor-modal-title">
              Convert to template
            </h3>
          </div>
          <button
            type="button"
            className="ppt-editor-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </header>

        {phase === 'done' ? (
          <>
            <div className="ppt-editor-modal-alert ppt-editor-modal-alert--success">
              <FiCheckCircle size={16} />
              <span>
                Published as a platform <strong>DECK_PACK</strong> template
                {createdTemplate?.name ? `: ${createdTemplate.name}` : ''}. Manage it in Admin
                Portal → Templates.
              </span>
            </div>
            <footer className="ppt-editor-modal-foot">
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                onClick={onClose}
              >
                Done
              </button>
            </footer>
          </>
        ) : (
          <>
            <p className="ppt-editor-modal-lead">
              Publish this deck&apos;s canvas slides as a reusable deck pack template. Slide images
              and layouts are copied to the system catalog ({slideCount} slide
              {slideCount === 1 ? '' : 's'}).
            </p>

            {error ? (
              <div className="ppt-editor-modal-alert ppt-editor-modal-alert--error" role="alert">
                {error}
              </div>
            ) : null}

            <label className="ppt-editor-modal-field-label" htmlFor="ppt-template-name">
              Template name
            </label>
            <input
              id="ppt-template-name"
              type="text"
              className="ppt-editor-modal-link-input"
              style={{ width: '100%', marginBottom: 16 }}
              value={name}
              disabled={busy}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
            />

            <label className="ppt-editor-modal-field-label" htmlFor="ppt-template-pack-id">
              Pack ID
            </label>
            <input
              id="ppt-template-pack-id"
              type="text"
              className="ppt-editor-modal-link-input"
              style={{ width: '100%', marginBottom: 16 }}
              value={packId}
              disabled={busy}
              onChange={(e) => {
                setPackIdTouched(true)
                setPackId(e.target.value)
              }}
              maxLength={128}
              spellCheck={false}
            />

            <label className="ppt-editor-modal-field-label" htmlFor="ppt-template-theme-id">
              Theme ID <span style={{ fontWeight: 500, textTransform: 'none' }}>(optional)</span>
            </label>
            <input
              id="ppt-template-theme-id"
              type="text"
              className="ppt-editor-modal-link-input"
              style={{ width: '100%', marginBottom: 16 }}
              value={themeId}
              disabled={busy}
              onChange={(e) => setThemeId(e.target.value)}
              maxLength={64}
              spellCheck={false}
            />

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                color: '#334155',
                marginBottom: 20,
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                disabled={busy}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active in template gallery
            </label>

            <footer className="ppt-editor-modal-foot">
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                disabled={busy || !canPublish}
                onClick={() => void runPublish()}
              >
                {busy ? <FiLoader className="ppt-spin" size={16} /> : <FiFileText size={16} />}
                {busy ? 'Publishing…' : 'Publish template'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
