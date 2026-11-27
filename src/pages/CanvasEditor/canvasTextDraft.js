import { contentWithSyncedText } from '../../utils/pptTextContent.js'

/**
 * The document's pages with the text being typed applied (CANVAS_FIX_PLAN_25NOV2026, C-1).
 *
 * A text box commits its text only when editing ends, so text typed and then refreshed or closed
 * was never saved. Saves (and the save made when the page closes) send the pages with the draft
 * applied. Returns `canvases` itself when there is nothing to apply.
 *
 * @param {object[]} canvases pages: [{ elements: [...] }, ...]
 * @param {{ elementId: string, text: string, runs?: object[] } | null} draft
 */
export function canvasesWithTextDraft(canvases, draft) {
  if (!draft || !Array.isArray(canvases)) return canvases
  let changed = false
  const next = canvases.map((page) => {
    const elements = Array.isArray(page?.elements) ? page.elements : null
    if (!elements || !elements.some((el) => el?.id === draft.elementId)) return page
    changed = true
    return {
      ...page,
      elements: elements.map((el) =>
        el?.id === draft.elementId
          ? { ...el, content: contentWithSyncedText(el.content, draft.text, draft.runs) }
          : el
      ),
    }
  })
  return changed ? next : canvases
}
