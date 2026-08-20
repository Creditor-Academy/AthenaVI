/** Normalize library category ids from the workspace library API. */
export function normalizeLibraryCategoryId(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  if (raw === 'video' || raw === 'videos' || raw === 'avatar_video') return 'video'
  if (raw === 'presentation' || raw === 'presentations' || raw === 'ppt') return 'presentation'
  if (raw === 'image' || raw === 'images') return 'image'
  return raw || null
}

/** Resolve item kind from library fields or project type. */
export function resolveLibraryKind(item) {
  if (!item || typeof item !== 'object') return 'video'
  const fromKind = normalizeLibraryCategoryId(item.kind || item.category)
  if (fromKind === 'video' || fromKind === 'presentation' || fromKind === 'image') {
    return fromKind
  }
  const type = String(item.type || item.projectType || '').toUpperCase()
  if (type === 'PRESENTATION') return 'presentation'
  if (type === 'IMAGE' || type === 'IMAGE_GEN') return 'image'
  return 'video'
}

const DEFAULT_CATEGORIES = [
  { id: 'video', label: 'Videos', projectType: 'VIDEO', count: 0 },
  { id: 'presentation', label: 'Presentations', projectType: 'PRESENTATION', count: 0 },
  { id: 'image', label: 'Images', count: 0 },
]

export const ATHENA_AI_OWNER = 'Athena AI'

export function normalizeLibraryCategories(categories) {
  const byId = new Map()
  ;(Array.isArray(categories) ? categories : []).forEach((cat) => {
    const id = normalizeLibraryCategoryId(cat?.id || cat?.projectType)
    if (!id) return
    byId.set(id, {
      id,
      label: cat.label || DEFAULT_CATEGORIES.find((d) => d.id === id)?.label || id,
      projectType:
        cat.projectType ||
        (id === 'video' ? 'VIDEO' : id === 'presentation' ? 'PRESENTATION' : undefined),
      count: Number(cat.count) || 0,
    })
  })

  return DEFAULT_CATEGORIES.map((fallback) => byId.get(fallback.id) || { ...fallback })
}

/** UUID / CUID / Mongo ObjectId / bare hex ids that should not show as owner names. */
export function looksLikeId(value) {
  const text = String(value || '').trim()
  if (!text) return false
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    return true
  }
  if (/^[0-9a-f]{24}$/i.test(text)) return true
  if (/^c[a-z0-9]{24,}$/i.test(text)) return true
  if (/^[0-9a-f]{32}$/i.test(text)) return true
  return false
}

function toDisplayName(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim()
    if (!text || looksLikeId(text)) return ''
    return text
  }
  if (typeof value === 'object') {
    const text = String(
      value.name ||
        value.fullName ||
        value.displayName ||
        value.email ||
        value.username ||
        value.user?.name ||
        value.user?.email ||
        ''
    ).trim()
    if (!text || looksLikeId(text)) return ''
    return text
  }
  return ''
}

function resolveLibraryOwnerName(item, kind) {
  const fromPeople = toDisplayName(
    item.createdBy ?? item.owner ?? item.creator ?? item.triggeredBy ?? item.lastModifiedBy
  )
  if (fromPeople) return fromPeople

  // AI-generated rows often only carry a system/user id — show product name instead.
  if (kind === 'image' || kind === 'presentation') return ATHENA_AI_OWNER
  if (
    item.generatedByAi ||
    item.aiGenerated ||
    item.source === 'ai' ||
    item.source === 'image-gen'
  ) {
    return ATHENA_AI_OWNER
  }
  return ''
}

/**
 * Normalize a library list item for cards / routing.
 * Ensures `kind`, `category`, display name, and type fields are consistent.
 */
export function normalizeLibraryItem(item, { workspaceId } = {}) {
  if (!item || typeof item !== 'object') return item

  const kind = resolveLibraryKind(item)
  const id = item.id || item._id
  const name =
    item.name ||
    item.title ||
    (kind === 'image' ? truncatePrompt(item.prompt || item.revisedPrompt) : null) ||
    (kind === 'presentation'
      ? 'Untitled Presentation'
      : kind === 'image'
        ? 'Untitled Image'
        : 'Untitled Video')

  const createdAt =
    item.createdAt || item.created_at || item.dateCreated || item.created || null
  const lastModifiedAt =
    item.lastModifiedAt || item.updatedAt || item.modifiedAt || item.updated_at || createdAt || null

  const createdBy = resolveLibraryOwnerName(item, kind)
  const lastModifiedBy =
    toDisplayName(item.lastModifiedBy ?? item.updater ?? item.updatedBy) || createdBy

  const ownerFallback =
    kind === 'image' || kind === 'presentation' ? ATHENA_AI_OWNER : ''

  const base = {
    ...item,
    id,
    workspaceId: item.workspaceId || workspaceId || null,
    kind,
    category: kind,
    name: String(name || 'Untitled'),
    title: String(item.title || name || 'Untitled'),
    type:
      item.type ||
      item.projectType ||
      (kind === 'presentation' ? 'PRESENTATION' : kind === 'video' ? 'VIDEO' : item.type),
    projectType:
      item.projectType ||
      item.type ||
      (kind === 'presentation' ? 'PRESENTATION' : kind === 'video' ? 'VIDEO' : item.projectType),
    thumbnail: item.thumbnail || item.thumbnailUrl || item.url || null,
    thumbnailUrl: item.thumbnailUrl || item.thumbnail || item.url || null,
    createdAt,
    lastModifiedAt,
    lastEditedAt: lastModifiedAt,
    createdBy: createdBy || ownerFallback,
    lastModifiedBy: lastModifiedBy || ownerFallback,
    lastEditedBy: lastModifiedBy || ownerFallback,
    folderId: item.folderId || item.folder?.id || item.folder?._id || null,
    folder: item.folder || null,
    owner: item.owner && typeof item.owner === 'object' ? item.owner : item.owner,
  }

  if (kind === 'presentation') {
    return {
      ...base,
      deckStatus: item.deckStatus || null,
      slideCount: item.slideCount ?? item.slidesCount ?? null,
      aspectRatio: item.aspectRatio || null,
      partial: Boolean(item.partial),
      status: item.status || null,
    }
  }

  if (kind === 'image') {
    const head = item.head && typeof item.head === 'object' ? item.head : null
    const headUrl = head?.url || head?.asset?.url || item.url || item.thumbnail || item.thumbnailUrl || null
    const headGenerationId = head?.generationId || item.generationId || item.headGenerationId || null
    return {
      ...base,
      name: String(item.title || item.name || name || 'Untitled chat'),
      title: String(item.title || item.name || name || 'Untitled chat'),
      url: headUrl,
      thumbnail: headUrl,
      thumbnailUrl: headUrl,
      prompt: item.prompt || item.title || '',
      revisedPrompt: item.revisedPrompt || null,
      mode: item.mode || 'image',
      status: item.status || 'SUCCEEDED',
      downloadFormats: item.downloadFormats || null,
      assetId: item.assetId || item.asset?.id || head?.asset?.id || null,
      asset: item.asset || head?.asset || null,
      head,
      headGenerationId,
      generationId: headGenerationId,
      threadId: item.threadId || item.id,
      messageCount: item.messageCount ?? null,
      versionCount: item.versionCount ?? null,
    }
  }

  return {
    ...base,
    status: item.status || 'draft',
    storageBytes: item.storageBytes ?? item.sizeBytes ?? null,
  }
}

function truncatePrompt(text, max = 48) {
  const value = String(text || '').trim()
  if (!value) return ''
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

export const IMAGE_MODE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Image' },
  // PARKED until Image Gen Mode 2/3 returns:
  // { id: 'infographic', label: 'Infographic' },
  // { id: 'social', label: 'Social' },
]

export const LIBRARY_CATEGORY_ICONS = {
  video: 'video',
  presentation: 'presentation',
  image: 'image',
}
