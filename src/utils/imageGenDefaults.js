export function defaultImageGenModelId(mode, catalogs = {}) {
  return 'gpt-image-1-hd'
}

export function modelsForImageGenMode(models = [], mode = 'image') {
  const list = Array.isArray(models) ? models : []
  const filtered = list.filter((m) => !m?.modes?.length || m.modes.includes(mode))
  return filtered.length ? filtered : list
}

export function isDraftQualityModel(model) {
  const id = String(model?.id || '')
  return id.includes('flash-lite') || String(model?.maxImageSize || '').toUpperCase() === '1K'
}

export const OVERRIDDEN_MODEL_NAMES = {
  'gpt-image-1-hd': 'Pro',
  'gpt-image-1': 'Standard',
  'dall-e-3': 'Classic',
}

export function formatModelDisplayName(modelOrId, fallback = 'Pro') {
  if (!modelOrId) return fallback
  const id = typeof modelOrId === 'string' ? modelOrId : modelOrId?.id
  if (id === 'gpt-image-1-hd') return 'Pro'
  if (id === 'gpt-image-1') return 'Standard'
  if (id === 'dall-e-3') return 'Classic'
  if (typeof modelOrId === 'object' && modelOrId?.name) {
    if (modelOrId.name === 'GPT Image HD' || modelOrId.name === 'GPT Image 2.5 HD') return 'Pro'
    if (modelOrId.name === 'GPT Image' || modelOrId.name === 'GPT Image 2.5') return 'Standard'
    if (modelOrId.name === 'DALL·E 3' || modelOrId.name === 'DALL-E 3' || modelOrId.name?.toLowerCase().includes('legacy')) return 'Classic'
    return modelOrId.name
  }
  return id || fallback
}
