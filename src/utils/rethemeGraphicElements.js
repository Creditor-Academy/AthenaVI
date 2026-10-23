import { isThemedColorMode } from './graphicTheme.js'

/**
 * Strip baked hex fills so render-time theme resolution applies after brand kit / theme change.
 */
export function rethemeGraphicElementsInDoc(elementsDoc, themeTokens = {}) {
  if (!elementsDoc || !Array.isArray(elementsDoc.elements)) return elementsDoc
  const palette = themeTokens?.palette || themeTokens || {}
  const colorRoles = themeTokens?.colorRoles || palette?.colorRoles || null

  const elements = elementsDoc.elements.map((el) => {
    if (el.type !== 'graphic' && el.type !== 'shape') return el
    const c = el.content && typeof el.content === 'object' ? { ...el.content } : {}
    const themed =
      isThemedColorMode(c.colorMode) ||
      c.fillColorRole ||
      (c.sequenceIndex != null && c.sequenceIndex >= 0) ||
      (c.fill && typeof c.fill === 'object' && c.fill.colorRole)

    if (!themed) return el

    if (c.fill && typeof c.fill === 'string') delete c.fill
    if (colorRoles) c.colorRoles = colorRoles
    if (el.type === 'shape' && c.fill && typeof c.fill === 'object' && c.fill.colorRole) {
      return { ...el, content: c }
    }
    return { ...el, content: c }
  })

  return { ...elementsDoc, elements }
}

export function rethemeSlidesGraphicElements(slides = [], themeTokens = {}) {
  if (!Array.isArray(slides)) return slides
  return slides.map((slide) => {
    if (!slide?.elements) return slide
    return {
      ...slide,
      elements: rethemeGraphicElementsInDoc(slide.elements, themeTokens),
    }
  })
}
