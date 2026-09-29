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
