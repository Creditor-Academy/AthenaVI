const STORAGE_KEY = 'athena.ppt.editorSession'

/**
 * Persist / restore the PPT editor session across refresh.
 * URL: /dashboard/editor?workspaceId=&presentationId=
 */

export function readPresentationEditorQuery(
  search = typeof window !== 'undefined' ? window.location.search : ''
) {
  try {
    const params = new URLSearchParams(search || '')
    const workspaceId = params.get('workspaceId') || params.get('ws') || null
    const presentationId = params.get('presentationId') || params.get('pid') || null
    if (!workspaceId || !presentationId) return null
    return {
      workspaceId,
      presentationId,
      title: params.get('title') || 'Untitled Presentation',
    }
  } catch {
    return null
  }
}

export function loadPresentationEditorSession() {
  if (typeof window === 'undefined') return null
  const fromUrl = readPresentationEditorQuery()
  if (fromUrl?.workspaceId && fromUrl?.presentationId) {
    return {
      outline: [],
      config: {
        title: fromUrl.title || 'Untitled Presentation',
        workspaceId: fromUrl.workspaceId,
        presentationId: fromUrl.presentationId,
      },
      workspaceId: fromUrl.workspaceId,
      presentationId: fromUrl.presentationId,
      folderId: null,
    }
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.workspaceId || !parsed?.presentationId) return null
    return {
      outline: parsed.outline || [],
      config: {
        ...(parsed.config || {}),
        title: parsed.config?.title || parsed.title || 'Untitled Presentation',
        workspaceId: parsed.workspaceId,
        presentationId: parsed.presentationId,
      },
      workspaceId: parsed.workspaceId,
      presentationId: parsed.presentationId,
      folderId: parsed.folderId || null,
    }
  } catch {
    return null
  }
}

export function savePresentationEditorSession(data) {
  if (typeof window === 'undefined') return
  const workspaceId = data?.workspaceId || data?.config?.workspaceId
  const presentationId = data?.presentationId || data?.config?.presentationId
  if (!workspaceId || !presentationId) return

  const payload = {
    outline: data.outline || [],
    config: data.config || {},
    workspaceId,
    presentationId,
    folderId: data.folderId || null,
    title: data.config?.title || data.title || 'Untitled Presentation',
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota
  }

  syncPresentationEditorUrl(payload)
}

export function clearPresentationEditorSession() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function syncPresentationEditorUrl({
  workspaceId,
  presentationId,
  title,
} = {}) {
  if (typeof window === 'undefined') return
  if (!workspaceId || !presentationId) return

  const params = new URLSearchParams()
  params.set('workspaceId', workspaceId)
  params.set('presentationId', presentationId)
  if (title) params.set('title', String(title).slice(0, 120))

  const nextPath = `/dashboard/editor?${params.toString()}`
  const current = `${window.location.pathname}${window.location.search}`
  const hash = (window.location.hash || '').replace(/^#/, '')
  const currentClient = hash.startsWith('/')
    ? `${hash.split('?')[0]}${hash.includes('?') ? `?${hash.split('?')[1]}` : ''}`
    : current

  if (current === nextPath || currentClient.startsWith('/dashboard/editor')) {
    window.history.replaceState(
      { ...(window.history.state || {}), section: 'editor' },
      '',
      nextPath
    )
    return
  }

  window.history.replaceState(
    { ...(window.history.state || {}), section: 'editor' },
    '',
    nextPath
  )
}
