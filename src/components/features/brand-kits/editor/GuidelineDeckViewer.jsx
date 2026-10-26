import { useEffect, useMemo, useRef, useState } from 'react'
import { MdArrowBack, MdArrowForward, MdInfoOutline } from 'react-icons/md'
import { Loader2 } from 'lucide-react'
import CanvasElementsPreview from '../../../ppt/CanvasElementsPreview'
import brandKitService from '../../../../services/brandKitService'
import presentationService from '../../../../services/presentationService'
import { extractSlidesFromPresentation } from '../../../../utils/presentationHelpers'
import { enforceAppearancePalette } from '../../../../utils/themeAppearance'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureThemeFontsLoaded,
  themeFontFamilies,
} from '../../../../utils/googleFonts'
import { DEFAULT_GUIDELINE_TEMPLATE_ID, GUIDELINE_TEMPLATES } from '../utils/brandKitConstants'

// AIPptEditor's stage is max 900px wide; element fontSize/borderRadius are authored at that width.
const EDITOR_STAGE_WIDTH = 900

function deckTokensFrom(data) {
  return data?.deck?.themeTokens || data?.themeTokens || data?.presentation?.deck?.themeTokens || null
}

/**
 * Shows the real guideline deck when it was generated with the selected template,
 * otherwise a free server-built preview of that template (same builder as generate).
 */
export default function GuidelineDeckViewer({
  workspaceId,
  brandKitId,
  guidelineLink,
  templateId,
  generating,
  isDirty,
  activeSlideIndex,
  setActiveSlideIndex,
}) {
  const [slides, setSlides] = useState([])
  const [themeTokens, setThemeTokens] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const requestRef = useRef(0)

  const linkedTemplateId = guidelineLink?.templateId || DEFAULT_GUIDELINE_TEMPLATE_ID
  const showDeck = Boolean(
    guidelineLink?.presentationId && guidelineLink?.linked !== false && linkedTemplateId === templateId
  )
  const templateName = GUIDELINE_TEMPLATES.find((t) => t.id === templateId)?.name || 'Selected'

  useEffect(() => {
    if (!workspaceId || !brandKitId || generating) return undefined
    const requestId = ++requestRef.current
    let cancelled = false
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const data = showDeck
          ? await presentationService.getPresentation(workspaceId, guidelineLink.presentationId)
          : await brandKitService.previewGuidelines(workspaceId, brandKitId, templateId)
        if (cancelled || requestId !== requestRef.current) return
        setSlides(extractSlidesFromPresentation(data))
        setThemeTokens(deckTokensFrom(data))
      } catch (err) {
        if (cancelled || requestId !== requestRef.current) return
        setSlides([])
        setError(err?.message || 'Could not load the guideline slides.')
      } finally {
        if (!cancelled && requestId === requestRef.current) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [workspaceId, brandKitId, templateId, showDeck, guidelineLink, generating, reloadKey])

  const enforced = useMemo(
    () => (themeTokens?.palette ? enforceAppearancePalette(themeTokens) : themeTokens),
    [themeTokens]
  )
  const palette = enforced?.palette || null
  const themeVisual = useMemo(() => (palette ? { palette, body: palette.text } : null), [palette])

  useEffect(() => {
    if (!themeTokens) return
    ensureThemeFontsLoaded(themeTokens)
    ensureElementFontsLoaded(collectSlideFontFamilies(slides))
  }, [themeTokens, slides])

  const fontVars = useMemo(() => {
    const { headerFont, bodyFont } = themeFontFamilies(themeTokens)
    return {
      '--ppt-font-heading': `"${headerFont}", sans-serif`,
      '--ppt-font-body': `"${bodyFont}", sans-serif`,
    }
  }, [themeTokens])

  const count = slides.length
  const index = count ? Math.min(Math.max(activeSlideIndex || 0, 0), count - 1) : 0
  const current = slides[index] || null
  const fallbackBg = palette?.bg || '#FFFFFF'
  const goTo = (next) => setActiveSlideIndex(Math.max(0, Math.min(count - 1, next)))

  let status = null
  if (generating) status = 'Generating your deck…'
  else if (loading && !count) status = showDeck ? 'Loading your deck…' : `Building the ${templateName} preview…`

  return (
    <div className="bk-gv">
      <div className="bk-gv-head">
        <span className={`bk-gv-badge${showDeck ? ' is-deck' : ''}`}>
          {showDeck ? 'Generated deck' : 'Template preview'}
        </span>
        <span className="bk-gv-note">
          {showDeck
            ? 'Your saved deck, including any edits made in the slide editor.'
            : `${templateName} template built from the last saved version of this kit. Generate to create an editable deck.`}
        </span>
      </div>
      {isDirty && (
        <p className="bk-gv-dirty" role="status">
          <MdInfoOutline size={15} /> You have unsaved changes. Save the kit to include them in the preview and deck.
        </p>
      )}

      <div className="bk-gv-body">
        <div className="bk-gv-stage-col">
          <div
            className={`bk-gv-stage${loading && count ? ' is-loading' : ''}`}
            style={{ ...fontVars, background: fallbackBg }}
            aria-busy={loading || generating ? 'true' : undefined}
          >
            {status && (
              <div className="bk-gv-state">
                <Loader2 size={20} className="bk-gv-spin" /> {status}
              </div>
            )}
            {!status && error && (
              <div className="bk-gv-state is-error">
                <p>{error}</p>
                <button type="button" className="ghost-btn" onClick={() => setReloadKey((k) => k + 1)}>
                  Retry
                </button>
              </div>
            )}
            {!status && !error && current && (
              <CanvasElementsPreview
                slide={current}
                palette={palette}
                themeVisual={themeVisual}
                fallbackBg={fallbackBg}
                stageWidth={EDITOR_STAGE_WIDTH}
                fill
              />
            )}
          </div>
          <div className="bk-gv-nav">
            <button
              type="button"
              className="bk-slide-outside-arrow"
              disabled={!count || index === 0}
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
            >
              <MdArrowBack size={18} />
            </button>
            <span className="bk-gv-count">{count ? `${index + 1} / ${count}` : '–'}</span>
            <button
              type="button"
              className="bk-slide-outside-arrow"
              disabled={!count || index >= count - 1}
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
            >
              <MdArrowForward size={18} />
            </button>
          </div>
        </div>

        <div className="bk-gv-strip" role="list" aria-label="Slides">
          {slides.map((slide, i) => (
            <button
              key={slide.id || i}
              type="button"
              role="listitem"
              className={`bk-gv-thumb${i === index ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            >
              <span className="bk-gv-thumb-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="bk-gv-thumb-stage" style={{ ...fontVars, background: fallbackBg }}>
                <CanvasElementsPreview
                  slide={slide}
                  palette={palette}
                  themeVisual={themeVisual}
                  fallbackBg={fallbackBg}
                  stageWidth={EDITOR_STAGE_WIDTH}
                  fill
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
