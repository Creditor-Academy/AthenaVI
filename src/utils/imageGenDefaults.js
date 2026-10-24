export function defaultImageGenModelId(mode, catalogs = {}) {
  const fromApi = catalogs?.defaults?.[mode]?.modelId
  if (fromApi) return fromApi
  if (mode === 'image') return 'gpt-image-1-hd'
  return 'gemini-3-pro-image'
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
  'gpt-image-1-hd': 'GPT Image 2.5 HD',
  'gpt-image-1': 'GPT Image 2.5',
  'dall-e-3': 'DALL·E 3 (Legacy)',
}

export function formatModelDisplayName(modelOrId, fallback = 'GPT Image 2.5 HD') {
  if (!modelOrId) return fallback
  const id = typeof modelOrId === 'string' ? modelOrId : modelOrId?.id
  if (id === 'gpt-image-1-hd') return 'GPT Image 2.5 HD'
  if (id === 'gpt-image-1') return 'GPT Image 2.5'
  if (id === 'dall-e-3') return 'DALL·E 3 (Legacy)'
  if (typeof modelOrId === 'object' && modelOrId?.name) {
    if (modelOrId.name === 'GPT Image HD') return 'GPT Image 2.5 HD'
    if (modelOrId.name === 'GPT Image') return 'GPT Image 2.5'
    if (modelOrId.name === 'DALL·E 3' || modelOrId.name === 'DALL-E 3' || modelOrId.name?.toLowerCase().includes('legacy')) return 'DALL·E 3 (Legacy)'
    return modelOrId.name
  }
  return id || fallback
}
