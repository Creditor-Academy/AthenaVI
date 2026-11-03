/**
 * App-wide record of file uploads in progress, shown by <UploadProgressHost /> so every page
 * that uploads media (Library, video editor, slides, canvas, avatars…) shows the same progress.
 * assetService.uploadAsset reports here; callers with their own progress UI pass `track: false`.
 */

const DONE_LINGER_MS = 2500
const ERROR_LINGER_MS = 12000

let uploads = []
const listeners = new Set()
let counter = 0

function emit() {
  for (const listener of listeners) listener()
}

function set(next) {
  uploads = next
  syncLeaveGuard()
  emit()
}

function patch(id, changes) {
  set(uploads.map((u) => (u.id === id ? { ...u, ...changes } : u)))
}

function removeLater(id, delay) {
  setTimeout(() => set(uploads.filter((u) => u.id !== id)), delay)
}

/** Leaving the page cancels uploads in flight — ask first while any are running. */
function onBeforeUnload(event) {
  event.preventDefault()
  event.returnValue = ''
  return ''
}
let guarding = false
function syncLeaveGuard() {
  if (typeof window === 'undefined') return
  const active = uploads.some((u) => u.status === 'uploading')
  if (active && !guarding) window.addEventListener('beforeunload', onBeforeUnload)
  if (!active && guarding) window.removeEventListener('beforeunload', onBeforeUnload)
  guarding = active
}

export function mediaKindOf(file) {
  const type = String(file?.type || '').toLowerCase()
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  return 'image'
}

export function startTrackedUpload(file) {
  counter += 1
  const id = `upload-${Date.now()}-${counter}`
  set([
    ...uploads,
    {
      id,
      name: file?.name || 'File',
      size: Number(file?.size) || 0,
      kind: mediaKindOf(file),
      progress: 0,
      status: 'uploading',
      error: '',
    },
  ])
  return id
}

export function setTrackedProgress(id, progress) {
  const value = Math.max(0, Math.min(1, Number(progress) || 0))
  const current = uploads.find((u) => u.id === id)
  if (!current || current.status !== 'uploading') return
  // Re-render at most once per whole percent.
  if (Math.round(current.progress * 100) === Math.round(value * 100)) return
  patch(id, { progress: value })
}

export function finishTrackedUpload(id, { note = '' } = {}) {
  patch(id, { progress: 1, status: 'done', note })
  removeLater(id, note ? ERROR_LINGER_MS : DONE_LINGER_MS)
}

export function failTrackedUpload(id, message) {
  patch(id, { status: 'error', error: message || 'Upload failed' })
  removeLater(id, ERROR_LINGER_MS)
}

export function dismissTrackedUpload(id) {
  set(uploads.filter((u) => u.id !== id))
}

export function getTrackedUploads() {
  return uploads
}

export function subscribeToUploads(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
