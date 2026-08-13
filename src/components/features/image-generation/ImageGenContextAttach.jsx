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

function isDocFile(file) {
  if (!file) return false
  const mime = String(file.type || '').toLowerCase()
  const name = String(file.name || '')
  if (
    mime === 'application/pdf' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'text/markdown' ||
    mime === 'text/plain' ||
    mime === 'text/x-markdown'
  ) {
    return true
  }
  return /\.(pdf|docx|md|txt)$/i.test(name)
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
  compact = false,
  children,
}) {
  const imageFileRef = useRef(null)
  const docFileRef = useRef(null)
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
  const [dragOver, setDragOver] = useState(null)
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
    setDragOver(null)
  }

  const markDirty = () => {
    if (context?.id) setDirtyAfterAttach(true)
  }

  const addFiles = (fileList, kind = 'any') => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    setError('')
    const next = []
    for (const file of incoming) {
      const image = isImageFile(file)
      const doc = isDocFile(file)
      if (kind === 'image' && !image) {
        setError('That folder is for images only — PNG, JPG, or WebP.')
        continue
      }
      if (kind === 'doc' && !doc) {
        setError('That folder is for briefs — PDF, Word, Markdown, or TXT.')
        continue
      }
      if (!isAllowedFile(file)) {
        setError('Unsupported file. Images: PNG, JPG, WebP. Briefs: PDF, Word, MD, TXT.')
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
        Array.isArray(created?.warnings) && created.warnings.length ? created.warnings[0] : ''
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

  const plusButton = (
    <button
      type="button"
      className={`igc-plus ${compact ? 'igc-plus--compact' : ''} ${modalOpen ? 'is-on' : ''} ${isReady ? 'is-ready' : ''}`}
      disabled={disabled}
      aria-label="Attach brief or references"
      title="Attach brief & images"
      onClick={() => openModal(isReady ? 'brief' : 'add')}
    >
      <Plus size={18} strokeWidth={2.25} />
    </button>
  )

  const triggerNode = compact ? (
    plusButton
  ) : (
    <div className={`igc-bar ${isReady ? 'igc-bar--ready' : ''}`}>
      <div className="igc-bar-row">
        {plusButton}

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
          aria-label="Add references"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="igc-modal-head">
            <div>
              <h3>Add references</h3>
              <p>Images set the look. A brief is optional — it sets the story.</p>
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
              Review
              {isReady && <span className="igc-tab-dot" />}
            </button>
          </div>

          <div className="igc-modal-body">
            <AnimatePresence mode="wait">
              {(tab === 'add' || tab === 'library') && (
                <motion.div
                  key={tab === 'library' ? 'library' : 'add'}
                  className={`igc-modal-pane ${attaching && tab !== 'library' ? 'is-busy' : ''}`}
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
                      <section className="igc-section">
                        <div className="igc-section-head">
                          <ImageIcon size={15} />
                          <div>
                            <strong>Style images</strong>
                            <span>Photos or art the model should match</span>
                          </div>
                        </div>
                        <div
                          className={`igc-dropzone ${dragOver === 'image' ? 'is-over' : ''}`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setDragOver('image')
                          }}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={(e) => {
                            e.preventDefault()
                            setDragOver(null)
                            addFiles(e.dataTransfer.files, 'image')
                          }}
                        >
                          <button
                            type="button"
                            className="igc-dropzone-main igc-dropzone-main--sm"
                            disabled={disabled || slotsLeft <= 0 || attaching}
                            onClick={() => imageFileRef.current?.click()}
                          >
                            <Upload size={18} strokeWidth={1.75} />
                            <strong>Drop images or browse</strong>
                            <span>PNG, JPG, WebP · up to 20 MB</span>
                          </button>
                          <button
                            type="button"
                            className="igc-lib-btn"
                            disabled={disabled || slotsLeft <= 0 || attaching}
                            onClick={openLibrary}
                          >
                            <FolderOpen size={15} />
                            Choose from library
                          </button>
                        </div>
                        <input
                          ref={imageFileRef}
                          type="file"
                          multiple
                          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                          hidden
                          onChange={(e) => {
                            addFiles(e.target.files, 'image')
                            e.target.value = ''
                          }}
                        />
                        {(pendingFiles.some(isImageFile) || pendingAssets.length > 0) && (
                          <div className="igc-pick-grid">
                            {pendingFiles.map((file, idx) => {
                              if (!isImageFile(file)) return null
                              const preview = filePreviewUrls[idx]
                              return (
                                <div key={`f-${file.name}-${idx}`} className="igc-pick">
                                  <button
                                    type="button"
                                    className="igc-pick-open"
                                    onClick={() =>
                                      preview &&
                                      setExpandedThumb({
                                        id: `file-${file.name}-${idx}`,
                                        src: preview,
                                        name: file.name || 'Image',
                                      })
                                    }
                                  >
                                    {preview ? (
                                      <img src={preview} alt="" />
                                    ) : (
                                      <ImageIcon size={18} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    className="igc-pick-remove"
                                    aria-label={`Remove ${file.name}`}
                                    disabled={disabled || attaching}
                                    onClick={() => removePendingFile(idx)}
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              )
                            })}
                            {pendingAssets.map((asset) => (
                              <div key={`a-${asset.id}`} className="igc-pick">
                                <button
                                  type="button"
                                  className="igc-pick-open"
                                  onClick={() =>
                                    asset.url &&
                                    setExpandedThumb({
                                      id: `asset-${asset.id}`,
                                      src: asset.url,
                                      name: asset.name || 'Library image',
                                    })
                                  }
                                >
                                  {asset.url ? (
                                    <img src={asset.url} alt="" />
                                  ) : (
                                    <ImageIcon size={18} />
                                  )}
                                </button>
                                  <button
                                    type="button"
                                    className="igc-pick-remove"
                                    aria-label={`Remove ${asset.name}`}
                                    disabled={disabled || attaching}
                                    onClick={() => removePendingAsset(asset.id)}
                                  >
                                    <X size={11} />
                                  </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      <section className="igc-section">
                        <div className="igc-section-head">
                          <FileText size={15} />
                          <div>
                            <strong>Brief</strong>
                            <span>Optional — PDF, Word, Markdown, or a short note</span>
                          </div>
                        </div>
                        <div
                          className={`igc-dropzone ${dragOver === 'doc' ? 'is-over' : ''}`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setDragOver('doc')
                          }}
                          onDragLeave={() => setDragOver(null)}
                          onDrop={(e) => {
                            e.preventDefault()
                            setDragOver(null)
                            addFiles(e.dataTransfer.files, 'doc')
                          }}
                        >
                          <button
                            type="button"
                            className="igc-dropzone-main igc-dropzone-main--sm"
                            disabled={disabled || slotsLeft <= 0 || attaching}
                            onClick={() => docFileRef.current?.click()}
                          >
                            <Upload size={18} strokeWidth={1.75} />
                            <strong>Drop a document or browse</strong>
                            <span>PDF, DOCX, MD, TXT · up to 20 MB</span>
                          </button>
                        </div>
                        <input
                          ref={docFileRef}
                          type="file"
                          multiple
                          accept=".pdf,.docx,.md,.txt,application/pdf,text/plain,text/markdown"
                          hidden
                          onChange={(e) => {
                            addFiles(e.target.files, 'doc')
                            e.target.value = ''
                          }}
                        />
                        {pendingFiles.some(isDocFile) && (
                          <ul className="igc-doc-list">
                            {pendingFiles.map((file, idx) => {
                              if (!isDocFile(file)) return null
                              return (
                                <li key={`d-${file.name}-${idx}`} className="igc-doc-row">
                                  <FileText size={14} />
                                  <em>{file.name}</em>
                                  <button
                                    type="button"
                                    aria-label={`Remove ${file.name}`}
                                    disabled={disabled || attaching}
                                    onClick={() => removePendingFile(idx)}
                                  >
                                    <X size={12} />
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                        <label className="igc-notes-label">
                          Or type a note
                          <textarea
                            className="igc-tray-notes"
                            rows={3}
                            placeholder="e.g. Premium SaaS look, blue and teal, lots of space…"
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
                      </section>

                      <div className="igc-modal-pane-foot">
                        <span className="igc-tray-slots">
                          {slotsLeft} of {MAX_CONTEXT_ITEMS} left · attaching is free
                        </span>
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
                              Update
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Use these
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
                        Add style images and an optional brief, then tap Use these to see what the
                        AI understood.
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

                      {composerThumbs.length > 0 && !(context.previews?.images || []).length && (
                        <div className="igc-preview-block">
                          <strong>
                            <ImageIcon size={12} />
                            Look
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
                            Brief
                          </strong>
                          <p className="igc-preview-lede">What we read from your images</p>
                          <ul className="igc-brief-list">
                            {(context.previews.images || []).map((img, i) => {
                              const thumb =
                                composerThumbs.find((t) => t.name === img.name) ||
                                composerThumbs[i]
                              return (
                                <li key={`img-${img.name}-${i}`} className="igc-brief-row">
                                  {thumb?.src ? (
                                    <button
                                      type="button"
                                      className="igc-brief-thumb"
                                      onClick={() => setExpandedThumb(thumb)}
                                      aria-label={`Expand ${img.name || 'image'}`}
                                    >
                                      <img src={thumb.src} alt="" />
                                    </button>
                                  ) : (
                                    <span className="igc-brief-thumb igc-brief-thumb--empty">
                                      <ImageIcon size={16} />
                                    </span>
                                  )}
                                  <p>{img.summary || 'No style notes for this image.'}</p>
                                </li>
                              )
                            })}
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
