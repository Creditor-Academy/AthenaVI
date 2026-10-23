import { getDeckLayoutSchema } from './deckLayoutRegistry.js'

/**
 * Given a layout schema and the actual content to render, determine the "Smart State".
 * If the layout supports multiple item counts (e.g., a 4-card layout that can gracefully render 3 cards),
 * this function returns the layoutId (or explicit schema) for that predefined state.
 */
export function resolveSmartLayoutState(schema, content, slideProfile = null) {
  if (!schema?.smartBehavior || !schema.smartBehavior.itemCount) {
    return schema
  }

  // Count the primary items the layout cares about based on its type
  let itemCount = 0
  const layoutType = String(schema.type || '').toLowerCase()

  if (layoutType === 'diagram' || layoutType === 'funnel') {
    const cells = content?.diagram?.cells || content?.cells || content?.steps || content?.funnel || []
    itemCount = cells.length
  } else if (layoutType === 'grid' || layoutType === 'cards' || layoutType === 'columns') {
    const cols = content?.columns || content?.items || content?.cards || []
    itemCount = cols.length
  } else if (layoutType === 'timeline') {
    const events = content?.timeline || content?.milestones || content?.events || []
    itemCount = events.length
  } else if (/team/i.test(schema.layout_id) || layoutType === 'team') {
    const members = content?.members || content?.team || content?.people || []
    itemCount = members.length
  } else if (/pricing/i.test(schema.layout_id)) {
    const plans = content?.plans || content?.columns || []
    itemCount = plans.length
  } else if (layoutType === 'gallery' || layoutType === 'images') {
    const imgs = content?.imageUrls || []
    itemCount = imgs.length
  } else if (layoutType === 'agenda') {
    const cols = content?.agenda?.columns || content?.columns || []
    itemCount = cols.length
  } else {
    // Fallback: look at general arrays if no specific type matched
    const lists = [content?.columns, content?.items, content?.steps]
    const activeList = lists.find(Array.isArray)
    itemCount = activeList ? activeList.length : 0
  }

  if (itemCount === 0) return schema

  const countsMap = schema.smartBehavior.itemCount
  
  // If the exact item count has a predefined state, use it
  if (countsMap[itemCount]) {
    return getSmartLayoutGeometry(schema, countsMap[itemCount])
  }

  // If no exact match, see if there is a fallback or flexible state
  // We prefer the closest supported state that is <= itemCount, 
  // relying on the Content Contract to truncate the rest.
  const supportedCounts = Object.keys(countsMap).map(Number).sort((a, b) => b - a)
  for (const count of supportedCounts) {
    if (itemCount >= count) {
      return getSmartLayoutGeometry(schema, countsMap[count])
    }
  }

  // If all supported counts are larger than itemCount (e.g. we have 2 items, layout supports 3, 4, 5),
  // we fallback to the minimum supported state and let the layout render empty slots (or we could reject it).
  const minCount = Math.min(...supportedCounts)
  if (minCount > 0 && countsMap[minCount]) {
    return getSmartLayoutGeometry(schema, countsMap[minCount])
  }

  return schema
}

/**
 * Retrieves the actual schema for a resolved smart state.
 * The stateId could be a string (referencing another layout ID in the registry) 
 * or an object containing the predefined slots for this state.
 */
export function getSmartLayoutGeometry(originalSchema, stateId) {
  if (!stateId) return originalSchema

  // If the state is just pointing to itself, return the original schema
  if (stateId === originalSchema.layout_id) {
    return originalSchema
  }

  // If the state is a string, it's likely a predefined layoutId registered elsewhere
  if (typeof stateId === 'string') {
    const predefinedSchema = getDeckLayoutSchema(stateId)
    if (predefinedSchema) {
      // Merge original schema properties (like smartBehavior) but use the predefined slots/region
      return {
        ...predefinedSchema,
        smartBehavior: originalSchema.smartBehavior // Carry over behavior config
      }
    }
    return originalSchema
  }

  // If the state is an inline object defining slots
  if (typeof stateId === 'object' && Array.isArray(stateId.slots)) {
    return {
      ...originalSchema,
      layout_id: `${originalSchema.layout_id}_smart`,
      slots: stateId.slots
    }
  }

  return originalSchema
}
