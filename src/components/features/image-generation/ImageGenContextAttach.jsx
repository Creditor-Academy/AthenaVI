import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Upload,
  X,
} from 'lucide-react'
import assetService from '../../../services/assetService.js'
import imageGenService, {
  ImageGenContextPinnedError,
  ImageGenRateLimitError,
  ImageGenProviderError,
} from '../../../services/imageGenService.js'
import { isInsufficientCreditsError } from '../../../services/creditsService.js'
import './ImageGenContextAttach.css'

const MAX_CONTEXT_ITEMS = 5
const MAX_FILE_BYTES = 20 * 1024 * 1024
const ACCEPTED_EXT = /\.(pdf|docx|md|txt|png|jpe?g|webp)$/i
const ACCEPTED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
  'text/x-markdown',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])

function isAllowedFile(file) {
  if (!file) return false
  const name = String(file.name || '')
  const mime = String(file.type || '').toLowerCase()
  if (ACCEPTED_MIME.has(mime)) return true
  if (!mime && ACCEPTED_EXT.test(name)) return true
  return ACCEPTED_EXT.test(name)
}

function isImageFile(file) {
  if (!file) return false
  return /^image\//.test(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name || '')
}

function formatContextBadge(preview) {
  if (!preview) return null
  const docs = Number(preview.documentCount) || 0
  const images = Number(preview.imageCount) || 0
  if (!docs && !images) return 'Brief'
  const parts = ['Brief']
  if (docs) parts.push(`${docs} doc${docs === 1 ? '' : 's'}`)
  if (images) parts.push(`${images} ref${images === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

export function contextPreviewBadge(generation) {
  const preview =
    generation?.contextPreview ||
    generation?.request?.contextPreview ||
    (generation?.contextId ? { documentCount: 0, imageCount: 0 } : null)
  return formatContextBadge(preview)
}

function friendlyContextError(err) {
  if (isInsufficientCreditsError(err)) return 'Not enough credits for this action.'
  if (err instanceof ImageGenRateLimitError) {
    return err.message || 'Image generation context rate limit exceeded. Try again later.'
  }
  if (err instanceof ImageGenProviderError) {
    return err.message || 'Couldn’t process the brief right now. Try again.'
  }
  if (err instanceof ImageGenContextPinnedError) return err.message
  if (err?.status === 404) return 'Context unavailable — please re-attach.'
  return err?.message || 'Couldn’t attach context. Please try again.'
}

/**
 * Prompt-bar + opens a two-pane modal: Add (upload) · Brief (what AI understood).
 * Pass a children render prop to place thumbs above the textarea (ChatGPT-style).
 */
export default function ImageGenContextAttach({
  workspaceId,
  context,
  onContextChange,
  disabled = false,
  children,
}) {
  const fileRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab] = useState('add') // add | brief | library
  const [pendingFiles, setPendingFiles] = useState([])
  const [pendingAssets, setPendingAssets] = useState([])
  const [inlineText, setInlineText] = useState('')
  const [attaching, setAttaching] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dirtyAfterAttach, setDirtyAfterAttach] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [libraryItems, setLibraryItems] = useState([])
  const [libraryError, setLibraryError] = useState('')
  const [expandedThumb, setExpandedThumb] = useState(null)

  const pendingCount = pendingFiles.length + pendingAssets.length
  const slotsLeft = Math.max(0, MAX_CONTEXT_ITEMS - pendingCount)
  const hasPending = pendingCount > 0 || Boolean(String(inlineText || '').trim())
  const isReady = Boolean(context?.id) && !dirtyAfterAttach

  const readyLabel = useMemo(() => {
    if (!context?.id) return null
    return formatContextBadge({
      documentCount: context.previews?.documents?.length || 0,
      imageCount:
        (context.previews?.images?.length || 0) + (context.previews?.assetRefs?.length || 0),
    })
  }, [context])

  const filePreviewUrls = useMemo(() => {
    return pendingFiles.map((file) => (isImageFile(file) ? URL.createObjectURL(file) : null))
  }, [pendingFiles])

  useEffect(() => {
    return () => {
      filePreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [filePreviewUrls])

  const composerThumbs = useMemo(() => {
    const thumbs = []
    pendingFiles.forEach((file, idx) => {
      if (!isImageFile(file)) return
      thumbs.push({
        id: `file-${file.name}-${idx}`,
        src: filePreviewUrls[idx],
        name: file.name || 'Image',
        kind: 'file',
        index: idx,
      })
    })
    pendingAssets.forEach((asset) => {
      if (!asset?.url) return
      thumbs.push({
        id: `asset-${asset.id}`,
        src: asset.url,
        name: asset.name || 'Library image',
        kind: 'asset',
        assetId: asset.id,
      })
    })
    return thumbs.filter((t) => t.src)
  }, [pendingFiles, pendingAssets, filePreviewUrls])

  const pendingDocCount = pendingFiles.filter((f) => !isImageFile(f)).length

  useEffect(() => {
    if (!context?.id) return
    if (context.previews?.inlineText && !inlineText) {
      setInlineText(context.previews.inlineText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.id])

  useEffect(() => {
    if (!expandedThumb) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setExpandedThumb(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expandedThumb])

  const openModal = (nextTab = 'add') => {
    if (disabled) return
    setError('')
    setNotice('')
    setTab(nextTab)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setTab('add')
    setDragOver(false)
  }

  const markDirty = () => {
    if (context?.id) setDirtyAfterAttach(true)
  }

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    setError('')
    const next = []
    for (const file of incoming) {
      if (!isAllowedFile(file)) {
        setError('Unsupported type. Use PDF, DOCX, MD, TXT, PNG, JPG, or WebP.')
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`“${file.name}” is over 20 MB.`)
        continue
      }
      next.push(file)
    }
    if (!next.length) return
    setPendingFiles((prev) => {
      const room = Math.max(0, MAX_CONTEXT_ITEMS - (prev.length + pendingAssets.length))
      if (room <= 0) {
        setError('Too many context files or assets (max 5).')
        return prev
      }
      if (next.length > room) setError('Too many context files or assets (max 5).')
      markDirty()
      return [...prev, ...next.slice(0, room)]
    })
  }

  const removePendingFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    markDirty()
    setError('')
  }

  const removePendingAsset = (assetId) => {
    setPendingAssets((prev) => prev.filter((a) => a.id !== assetId))
    markDirty()
    setError('')
  }

  const removeThumb = (thumb) => {
    if (thumb.kind === 'file') removePendingFile(thumb.index)
    else if (thumb.kind === 'asset') removePendingAsset(thumb.assetId)
  }

  const openLibrary = async () => {
    if (!workspaceId || disabled) return
    setTab('library')
    setLibraryError('')
    setLibraryLoading(true)
    try {
      const list = await assetService.listAssets(workspaceId, { take: 100 })
      const images = (list || [])
        .map((a) => assetService.normalizeAsset(a))
        .filter((a) => a && assetService.inferMediaType(a) === 'image')
      setLibraryItems(images)
    } catch (err) {
      setLibraryError(err?.message || 'Couldn’t load library images.')
      setLibraryItems([])
    } finally {
      setLibraryLoading(false)
    }
  }

  const toggleLibraryAsset = (asset) => {
    if (!asset?.id) return
    setPendingAssets((prev) => {
      const exists = prev.some((a) => a.id === asset.id)
      if (exists) {
        markDirty()
        return prev.filter((a) => a.id !== asset.id)
      }
      if (prev.length + pendingFiles.length >= MAX_CONTEXT_ITEMS) {
        setError('Too many context files or assets (max 5).')
        return prev
      }
      markDirty()
      setError('')
      return [...prev, asset]
    })
  }

  const handleAttach = async () => {
    if (!workspaceId || attaching || disabled) return
    if (!hasPending) {
      setError('Add a file, library image, or pasted note first.')
      return
    }
    setAttaching(true)
    setError('')
    setNotice('')
    try {
      if (context?.id && !context.pinnedAt) {
        try {
          await imageGenService.deleteContext(workspaceId, context.id)
        } catch {
          /* replace still ok */
        }
      }
      const created = await imageGenService.createContext(workspaceId, {
        files: pendingFiles,
        inlineText,
        assetIds: pendingAssets.map((a) => a.id),
      })
      onContextChange?.(created)
      setDirtyAfterAttach(false)
      setTab('brief')
      setNotice(
        Array.isArray(created?.warnings) && created.warnings.length
          ? created.warnings[0]
          : 'Brief ready — review what the AI understood.'
      )
    } catch (err) {
      setError(friendlyContextError(err))
    } finally {
      setAttaching(false)
    }
  }

  const handleClear = async () => {
    if (clearing || disabled) return
    setClearing(true)
    setError('')
    setNotice('')
    try {
      if (context?.id && !context.pinnedAt) {
        try {
          await imageGenService.deleteContext(workspaceId, context.id)
        } catch (err) {
          if (err instanceof ImageGenContextPinnedError) {
            onContextChange?.(null)
            setPendingFiles([])
            setPendingAssets([])
            setInlineText('')
            setDirtyAfterAttach(false)
            setNotice('Brief was used for a generation — cleared locally.')
            setTab('add')
            return
          }
          if (err?.status !== 404) throw err
        }
      } else if (context?.pinnedAt) {
        onContextChange?.(null)
        setPendingFiles([])
        setPendingAssets([])
        setInlineText('')
        setDirtyAfterAttach(false)
        setNotice('Brief was used for a generation — cleared locally.')
        setTab('add')
        return
      }
      onContextChange?.(null)
      setPendingFiles([])
      setPendingAssets([])
      setInlineText('')
      setDirtyAfterAttach(false)
      setTab('add')
    } catch (err) {
      setError(friendlyContextError(err))
    } finally {
      setClearing(false)
    }
  }

  const thumbsNode =
    composerThumbs.length > 0 ? (
      <div className="igc-thumbs" aria-label="Attached images">
        {composerThumbs.map((thumb) => (
          <div key={thumb.id} className="igc-thumb">
            <button
              type="button"
              className="igc-thumb-open"
              disabled={disabled}
              onClick={() => setExpandedThumb(thumb)}
              aria-label={`Expand ${thumb.name}`}
              title="Click to expand"
            >
              <img src={thumb.src} alt={thumb.name} />
            </button>
            <button
              type="button"
              className="igc-thumb-remove"
              disabled={disabled || attaching || clearing}
              onClick={() => removeThumb(thumb)}
              aria-label={`Remove ${thumb.name}`}
              title="Remove"
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    ) : null

  const triggerNode = (
    <div className={`igc-bar ${isReady ? 'igc-bar--ready' : ''}`}>
      <div className="igc-bar-row">
        <button
          type="button"
          className={`igc-plus ${modalOpen ? 'is-on' : ''}`}
          disabled={disabled}
          aria-label="Attach brief or references"
          title="Attach brief & images"
          onClick={() => openModal(isReady ? 'brief' : 'add')}
        >
          <Plus size={18} strokeWidth={2.25} />
        </button>

        <div className="igc-chip-scroll">
          {isReady && readyLabel ? (
            <button
              type="button"
              className="igc-ready-chip"
              disabled={disabled}
              onClick={() => openModal('brief')}
            >
              <Paperclip size={12} />
              <span>
                {composerThumbs.length > 0 && pendingDocCount === 0
                  ? `${composerThumbs.length} ref${composerThumbs.length === 1 ? '' : 's'}`
                  : readyLabel}
              </span>
            </button>
          ) : dirtyAfterAttach ? (
            <button
              type="button"
              className="igc-dirty-chip"
              disabled={disabled}
              onClick={() => openModal('add')}
            >
              <AlertTriangle size={11} />
              Re-attach to update
            </button>
          ) : composerThumbs.length > 0 || pendingDocCount > 0 ? (
            <button
              type="button"
              className="igc-hint-btn"
              disabled={disabled}
              onClick={() => openModal('add')}
            >
              {composerThumbs.length > 0
                ? `${composerThumbs.length} image${composerThumbs.length === 1 ? '' : 's'} · Attach`
                : `${pendingDocCount} file${pendingDocCount === 1 ? '' : 's'} · Attach`}
            </button>
          ) : (
            <button
              type="button"
              className="igc-hint-btn"
              disabled={disabled}
              onClick={() => openModal('add')}
            >
              Brief & refs
            </button>
          )}
        </div>

        {(context || hasPending) && (
          <button
            type="button"
            className="igc-clear-inline"
            disabled={disabled || attaching || clearing}
            onClick={handleClear}
            aria-label="Clear context"
            title="Clear"
          >
            {clearing ? <Loader2 size={13} className="igc-spin" /> : <X size={14} />}
          </button>
        )}
      </div>

      {notice && !modalOpen && <p className="igc-notice">{notice}</p>}
    </div>
  )

  const lightboxNode =
    expandedThumb &&
    createPortal(
      <div
        className="igc-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={expandedThumb.name}
        onClick={() => setExpandedThumb(null)}
      >
        <button
          type="button"
          className="igc-lightbox-close"
          onClick={() => setExpandedThumb(null)}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <img
          src={expandedThumb.src}
          alt={expandedThumb.name}
          className="igc-lightbox-img"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="igc-lightbox-caption">{expandedThumb.name}</p>
      </div>,
      document.body
    )

  const modalNode =
    modalOpen &&
    createPortal(
      <div className="igc-modal-backdrop" onClick={closeModal} role="presentation">
        <motion.div
          className="igc-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Reference brief and images"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="igc-modal-head">
            <div>
              <h3>Reference brief & images</h3>
              <p>Free to attach · generation still uses credits</p>
            </div>
            <button type="button" onClick={closeModal} aria-label="Close">
              <X size={16} />
            </button>
          </header>

          <div className="igc-modal-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'add' || tab === 'library'}
              className={tab === 'add' || tab === 'library' ? 'is-on' : ''}
              onClick={() => setTab('add')}
            >
              Add
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'brief'}
              className={tab === 'brief' ? 'is-on' : ''}
              onClick={() => setTab('brief')}
            >
              Brief
              {isReady && <span className="igc-tab-dot" />}
            </button>
          </div>

          <div className="igc-modal-body">
            <AnimatePresence mode="wait">
              {(tab === 'add' || tab === 'library') && (
                <motion.div
                  key={tab === 'library' ? 'library' : 'add'}
                  className="igc-modal-pane"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {tab === 'library' ? (
                    <>
                      <div className="igc-lib-toolbar">
                        <button
                          type="button"
                          className="igc-linkish"
                          onClick={() => setTab('add')}
                        >
                          ← Back to Add
                        </button>
                        <span>
                          {pendingCount}/{MAX_CONTEXT_ITEMS} selected
                        </span>
                      </div>
                      {libraryLoading && (
                        <div className="igc-lib-empty">
                          <Loader2 size={18} className="igc-spin" />
                          Loading images…
                        </div>
                      )}
                      {!libraryLoading && libraryError && (
                        <div className="igc-lib-empty">{libraryError}</div>
                      )}
                      {!libraryLoading && !libraryError && libraryItems.length === 0 && (
                        <div className="igc-lib-empty">No image assets in this workspace yet.</div>
                      )}
                      {!libraryLoading && !libraryError && libraryItems.length > 0 && (
                        <div className="igc-lib-grid">
                          {libraryItems.map((asset) => {
                            const selected = pendingAssets.some((a) => a.id === asset.id)
                            return (
                              <button
                                key={asset.id}
                                type="button"
                                className={`igc-lib-item ${selected ? 'is-selected' : ''}`}
                                onClick={() => toggleLibraryAsset(asset)}
                              >
                                {asset.url ? (
                                  <img src={asset.url} alt={asset.name || ''} />
                                ) : (
                                  <span className="igc-lib-fallback">
                                    <ImageIcon size={20} />
                                  </span>
                                )}
                                {selected && (
                                  <span className="igc-lib-check">
                                    <Check size={12} strokeWidth={3} />
                                  </span>
                                )}
                                <span className="igc-lib-name">{asset.name || 'Image'}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                      <div className="igc-modal-pane-foot">
                        <button
                          type="button"
                          className="igc-attach-btn"
                          onClick={() => setTab('add')}
                        >
                          Done
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`igc-dropzone ${dragOver ? 'is-over' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragOver(true)
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOver(false)
                          addFiles(e.dataTransfer.files)
                        }}
                      >
                        <button
                          type="button"
                          className="igc-dropzone-main"
                          disabled={disabled || slotsLeft <= 0}
                          onClick={() => fileRef.current?.click()}
                        >
                          <Upload size={22} strokeWidth={1.75} />
                          <strong>Drop files or browse</strong>
                          <span>PDF, DOCX, MD, TXT, PNG, JPG, WebP · max 20 MB</span>
                        </button>
                        <button
                          type="button"
                          className="igc-library-link"
                          disabled={disabled || slotsLeft <= 0}
                          onClick={openLibrary}
                        >
                          <FolderOpen size={14} />
                          Or pick from workspace library
                        </button>
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.md,.txt,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp,text/plain,text/markdown"
                        hidden
                        onChange={(e) => {
                          addFiles(e.target.files)
                          e.target.value = ''
                        }}
                      />

                      {(pendingFiles.length > 0 || pendingAssets.length > 0) && (
                        <div className="igc-chips">
                          {pendingFiles.map((file, idx) => {
                            const image = isImageFile(file)
                            const preview = filePreviewUrls[idx]
                            return (
                              <span
                                key={`f-${file.name}-${idx}`}
                                className={`igc-mini-chip ${image ? 'igc-mini-chip--image' : ''}`}
                              >
                                {image && preview ? (
                                  <button
                                    type="button"
                                    className="igc-mini-thumb"
                                    onClick={() =>
                                      setExpandedThumb({
                                        id: `file-${file.name}-${idx}`,
                                        src: preview,
                                        name: file.name || 'Image',
                                      })
                                    }
                                    aria-label={`Expand ${file.name}`}
                                  >
                                    <img src={preview} alt="" />
                                  </button>
                                ) : image ? (
                                  <ImageIcon size={11} />
                                ) : (
                                  <FileText size={11} />
                                )}
                                <em>{file.name}</em>
                                <button
                                  type="button"
                                  aria-label={`Remove ${file.name}`}
                                  disabled={disabled}
                                  onClick={() => removePendingFile(idx)}
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            )
                          })}
                          {pendingAssets.map((asset) => (
                            <span
                              key={`a-${asset.id}`}
                              className="igc-mini-chip igc-mini-chip--image"
                            >
                              {asset.url ? (
                                <button
                                  type="button"
                                  className="igc-mini-thumb"
                                  onClick={() =>
                                    setExpandedThumb({
                                      id: `asset-${asset.id}`,
                                      src: asset.url,
                                      name: asset.name || 'Library image',
                                    })
                                  }
                                  aria-label={`Expand ${asset.name || 'image'}`}
                                >
                                  <img src={asset.url} alt="" />
                                </button>
                              ) : (
                                <ImageIcon size={11} />
                              )}
                              <em>{asset.name || 'Library'}</em>
                              <button
                                type="button"
                                aria-label={`Remove ${asset.name}`}
                                disabled={disabled}
                                onClick={() => removePendingAsset(asset.id)}
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <label className="igc-notes-label">
                        Pasted notes
                        <textarea
                          className="igc-tray-notes"
                          rows={3}
                          placeholder="Premium minimal SaaS look, blue + teal…"
                          value={inlineText}
                          disabled={disabled || attaching}
                          maxLength={8000}
                          onChange={(e) => {
                            setInlineText(e.target.value)
                            markDirty()
                            setError('')
                          }}
                        />
                      </label>

                      <div className="igc-modal-pane-foot">
                        <span className="igc-tray-slots">{slotsLeft} slots left · Free</span>
                        <button
                          type="button"
                          className="igc-attach-btn"
                          disabled={disabled || attaching || !hasPending}
                          onClick={handleAttach}
                        >
                          {attaching ? (
                            <>
                              <Loader2 size={14} className="igc-spin" />
                              Reading…
                            </>
                          ) : dirtyAfterAttach ? (
                            <>
                              <Paperclip size={14} />
                              Re-attach
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Attach
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {tab === 'brief' && (
                <motion.div
                  key="brief"
                  className="igc-modal-pane"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {!isReady && (
                    <div className="igc-brief-empty">
                      <Paperclip size={22} strokeWidth={1.6} />
                      <strong>Nothing attached yet</strong>
                      <p>
                        Add a PDF/MD brief or style references on the Add tab, then Attach to see
                        what the AI understood.
                      </p>
                      <button
                        type="button"
                        className="igc-attach-btn"
                        onClick={() => setTab('add')}
                      >
                        Go to Add
                      </button>
                    </div>
                  )}

                  {isReady && context && (
                    <div className="igc-brief-ready">
                      <div className="igc-brief-badge-row">
                        <span className="igc-ready-chip igc-ready-chip--static">
                          <Paperclip size={12} />
                          {readyLabel}
                        </span>
                        <button
                          type="button"
                          className="igc-linkish"
                          onClick={() => {
                            setDirtyAfterAttach(true)
                            setTab('add')
                          }}
                        >
                          Replace
                        </button>
                      </div>

                      {composerThumbs.length > 0 && (
                        <div className="igc-preview-block">
                          <strong>
                            <ImageIcon size={12} />
                            References
                          </strong>
                          <div className="igc-thumbs igc-thumbs--modal">
                            {composerThumbs.map((thumb) => (
                              <div key={thumb.id} className="igc-thumb">
                                <button
                                  type="button"
                                  className="igc-thumb-open"
                                  onClick={() => setExpandedThumb(thumb)}
                                  aria-label={`Expand ${thumb.name}`}
                                >
                                  <img src={thumb.src} alt={thumb.name} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {context.previews?.inlineText && (
                        <div className="igc-preview-block">
                          <strong>Notes</strong>
                          <p>{context.previews.inlineText}</p>
                        </div>
                      )}

                      {(context.previews?.documents || []).map((doc, i) => (
                        <div key={`doc-${doc.name}-${i}`} className="igc-preview-block">
                          <strong>
                            <FileText size={12} />
                            {doc.name || 'Document'}
                            {doc.truncated && <em className="igc-trunc">Truncated</em>}
                          </strong>
                          <p>{doc.excerpt || 'No document text extracted.'}</p>
                        </div>
                      ))}

                      {(context.previews?.images || []).length > 0 && (
                        <div className="igc-preview-block">
                          <strong>
                            <ImageIcon size={12} />
                            Style notes from your references
                          </strong>
                          <ul className="igc-image-summaries">
                            {context.previews.images.map((img, i) => (
                              <li key={`img-${img.name}-${i}`}>
                                <span>{img.name}</span>
                                <p>{img.summary}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(context.previews?.assetRefs || []).length > 0 &&
                        composerThumbs.length === 0 && (
                          <div className="igc-preview-block">
                            <strong>Library references</strong>
                            <div className="igc-asset-refs">
                              {context.previews.assetRefs.map((ref) => (
                                <span key={ref.assetId} className="igc-asset-ref">
                                  {ref.name || 'Image'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {(context.warnings || []).map((w, i) => (
                        <div key={`warn-${i}`} className="igc-warn">
                          <AlertTriangle size={12} />
                          {w}
                        </div>
                      ))}

                      <div className="igc-modal-pane-foot">
                        <button type="button" className="igc-attach-btn" onClick={closeModal}>
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="igc-error">{error}</p>}
            {notice && tab === 'brief' && !error && <p className="igc-notice">{notice}</p>}
          </div>
        </motion.div>
      </div>,
      document.body
    )

  const portals = (
    <>
      {lightboxNode}
      {modalNode}
    </>
  )

  if (typeof children === 'function') {
    return (
      <>
        {children({ thumbs: thumbsNode, trigger: triggerNode })}
        {portals}
      </>
    )
  }

  return (
    <>
      {thumbsNode}
      {triggerNode}
      {portals}
    </>
  )
}
