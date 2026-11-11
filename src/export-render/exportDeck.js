import { resolveStageElements } from '../utils/slideStageElements'
import { extractSlidesFromPresentation, resolveCanvasSize } from '../utils/presentationHelpers'
import { rethemeSlidesGraphicElements } from '../utils/rethemeGraphicElements'
import { resolveThemeVisual } from '../utils/pptThemeVisual'
import { themeFontFamilies } from '../utils/googleFonts'

/**
 * The elements the editor draws on a slide: after slide normalisation, re-theming, layout
 * finishing (custom chart layouts), and without the ones it doesn't paint (background
 * elements, ghost rings, stray scrims). Groups draw nothing themselves.
 */
export function stageElementsOf(slide, aspectRatio, palette) {
  const canvas = resolveCanvasSize(slide, aspectRatio)
  return { canvas, elements: resolveStageElements(slide, canvas, palette).filter((el) => el.type !== 'group') }
}

/**
 * A deck ready to draw with ExportSlide: slides (filtered to `slideIds`, deck order), the
 * elements drawn on each, theme colours and fonts.
 * @param {{ deck: object, slideIds?: string[], transparent?: boolean }} payload  `deck` is the
 *   saved deck (API shape) or `{ aspectRatio, themeTokens, theme, slides }` with editor slides.
 */
export function prepareDeck(payload) {
  const deck = payload?.deck || {}
  const aspectRatio = deck.aspectRatio || '16:9'
  const themeTokens = deck.themeTokens || null
  let slides = extractSlidesFromPresentation({ deck: { ...deck, aspectRatio } })
  slides = rethemeSlidesGraphicElements(slides, themeTokens)
  const wanted = Array.isArray(payload?.slideIds) && payload.slideIds.length ? new Set(payload.slideIds) : null
  if (wanted) slides = slides.filter((s) => wanted.has(s.id))
  const themeVisual = resolveThemeVisual(themeTokens?.wizardColorThemeId || deck.theme, themeTokens)
  const { headerFont, bodyFont } = themeFontFamilies(themeTokens)
  // Resolved once per job: layout finishing mints new element ids on every run, so the slides
  // drawn, measured and handed to the backend (stageSlides) must all share this one result.
  const palette = themeVisual?.palette || null
  const stages = Object.fromEntries(slides.map((slide) => [slide.id, stageElementsOf(slide, aspectRatio, palette)]))
  return {
    aspectRatio,
    slides,
    stages,
    themeTokens,
    fontCssUrl: deck.fontCssUrl || null,
    themeVisual,
    transparent: Boolean(payload?.transparent),
    fontVars: {
      '--ppt-font-heading': `"${headerFont}", sans-serif`,
      '--ppt-font-body': `"${bodyFont}", sans-serif`,
    },
  }
}

/** The deck object inside a getPresentation() response (it comes in a few wrappings). */
export function deckFromPresentation(data) {
  const deck = data?.deck || data?.presentation?.deck || data?.presentation || data || {}
  const slides = deck.slides || data?.slides || data?.presentation?.slides || []
  return {
    ...deck,
    aspectRatio: deck.aspectRatio || data?.aspectRatio || '16:9',
    themeTokens: deck.themeTokens || data?.themeTokens || null,
    theme: deck.theme || data?.theme || null,
    // The deck's font stylesheet (the one the editor loads; it has weights up to 800).
    fontCssUrl: deck.fontCssUrl || data?.fontCssUrl || null,
    slides,
  }
}
