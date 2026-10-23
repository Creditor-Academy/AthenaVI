/**
 * DeckLayout metadata registry over existing catalog schemas.
 * Does not change pack preview behavior in deckLayoutRegistry.js.
 */

import ALL_LAYOUT_CATALOGS from './deckLayoutCatalogs.js'
import { toDeckLayout } from './toDeckLayout.js'
import { validateDeckLayout, validateDeckLayoutCollection } from './validateDeckLayout.js'

function templatesFromCatalog() {
  return Object.entries(ALL_LAYOUT_CATALOGS).map(([id, schema]) => ({
    name: schema?.layout_id || id,
    contentType: schema?.content_type,
    variant: id,
    schema,
  }))
}

export function listDeckLayouts(options = {}) {
  return templatesFromCatalog().map((template) => toDeckLayout(template, options))
}

export function getDeckLayout(layoutId, options = {}) {
  const id = String(layoutId || '').trim()
  const schema = ALL_LAYOUT_CATALOGS[id]
  if (!schema) return null
  return toDeckLayout(
    {
      name: schema.layout_id || id,
      contentType: schema.content_type,
      variant: id,
      schema,
    },
    options
  )
}

export function getDeckLayoutElements(layoutId) {
  const layout = getDeckLayout(layoutId, { includeElements: true })
  return layout?.elements || []
}

export function validateRegistry(options = {}) {
  return validateDeckLayoutCollection(listDeckLayouts(options))
}

export { toDeckLayout, validateDeckLayout, validateDeckLayoutCollection }
