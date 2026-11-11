import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiDownload, FiLoader, FiX } from 'react-icons/fi'
import presentationService from '../../../services/presentationService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { PPT_EXPORT_FORMATS, resolveCanvasSize } from '../../../utils/presentationHelpers'
import { deckFromPresentation } from '../../../export-render/exportDeck'
import {
  DEFAULT_JPEG_QUALITY,
  IMAGE_SCALES,
  exportDownloadName,
  exportFileBase,
  exportOutputSummary,
  formatPageRange,
  getSlideTitle,
  imagePixelSize,
  loadExportPrefs,
  pageNumbersFromSlideIds,
  resolveExportSelection,
  saveExportPrefs,
  shouldCaptureInBrowser,
  slideImageFilename,
} from '../../../utils/export/slideSelection'
import { zipStoredFiles } from '../../../utils/export/zip'
import ExportSlidePicker from './ExportSlidePicker'
import './pptPanelUi.css'

/** The four file types, in Canva's order of use. `badge` is the label on the file icon. */
const FILE_TYPES = [
  { id: 'PPTX', name: 'PowerPoint', badge: 'PPTX', hint: 'Editable slides' },
  { id: 'PDF', name: 'PDF', badge: 'PDF', hint: 'Print and share' },
  { id: 'PNG', name: 'PNG', badge: 'PNG', hint: 'Best image quality' },
  { id: 'JPEG', name: 'JPG', badge: 'JPG', hint: 'Smaller image files' },
]

const STATUS_LABEL = {
  QUEUED: 'Queued — starting export…',
  RENDERING: 'Building your file — large decks can take a few minutes…',
  READY: 'Ready',
  FAILED: 'Failed',
}

/** A small file icon with the format on it (PPTX orange, PDF red, PNG blue, JPG green). */
function FileBadge({ format, size = 'md' }) {
  const type = FILE_TYPES.find((t) => t.id === format) || FILE_TYPES[0]
  return (
    <span className={`ppt-export-file ppt-export-file--${format.toLowerCase()} ppt-export-file--${size}`} aria-hidden>
      <span className="ppt-export-file-fold" />
      <span className="ppt-export-file-label">{type.badge}</span>
    </span>
  )
}

function triggerFileDownload(url, filename) {
  if (!url) return false
  try {
    const link = document.createElement('a')
    link.href = url
    if (filename) {
      link.download = filename
      link.setAttribute('download', filename)
    }
    link.rel = 'noopener noreferrer'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      try {
        document.body.removeChild(link)
      } catch {
        /* ignore */
      }
    }, 300)
    return true
  } catch (err) {
    console.warn('Failed to trigger download via anchor:', err)
  }

  try {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    setTimeout(() => {
      try {
        document.body.removeChild(iframe)
      } catch {
        /* ignore */
      }
    }, 60000)
    return true
  } catch (err) {
    console.warn('Failed to trigger download via iframe:', err)
  }

  return false
}

function newDownloadId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // RFC 4122 v4 from getRandomValues (older browsers).
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** A charge error the user has to act on (no credits, signed out); anything else falls back. */
function isBlockingChargeError(err) {
  const code = Number(err?.status)
  return isInsufficientCreditsError(err) || code === 401 || code === 403 || code === 404
}

function sortedSlides(slides) {
  return [...(slides || [])].filter((s) => s?.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Export dialog: file type, its options, which pages, then Download. It keeps one size in every
 * state (choosing, picking pages, working, done), so it never jumps.
 * @param {object} props
 * @param {object[]} [props.slides]  the editor's slides (fresher than the saved deck); loaded
 *   from the API when missing (My Work)
 * @param {string} [props.currentSlideId]  enables "Current page"
 * @param {string} [props.aspectRatio]
 * @param {object} [props.themeTokens]
 * @param {string} [props.theme]
 */
export default function ExportPresentationModal({
  workspaceId,
  presentationId,
  title = 'Presentation',
  slideCount = null,
  slides: slidesProp = null,
  currentSlideId = null,
  aspectRatio: aspectProp = null,
  themeTokens: themeTokensProp = null,
  theme: themeProp = null,
  onBeforeExport,
  onClose,
}) {
  // The last choices made for this deck.
  const [prefs] = useState(() => loadExportPrefs(presentationId))
  const [selected, setSelected] = useState(() => prefs.format || 'PPTX')
  // PPTX only: the app the file is made for. Google Slides can't show gradients or glow, so
  // for it those are exported as pictures.
  const [pptxTarget, setPptxTarget] = useState(() => prefs.pptxTarget || 'powerpoint')
  const [scope, setScope] = useState(() =>
    prefs.scope === 'current' && !currentSlideId ? 'all' : prefs.scope || 'all'
  )
  const [selectedIds, setSelectedIds] = useState(() => prefs.selectedIds || [])
  const [scale, setScale] = useState(() => prefs.scale || 1)
  const [quality, setQuality] = useState(() => prefs.quality || DEFAULT_JPEG_QUALITY)
  const [transparent, setTransparent] = useState(() => Boolean(prefs.transparent))
  const [phase, setPhase] = useState('pick')
  const [statusText, setStatusText] = useState('')
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [downloadFilename, setDownloadFilename] = useState('')
  const [loadedDeck, setLoadedDeck] = useState(null)
  const objectUrlRef = useRef(null)
  const unmountedRef = useRef(false)
  const pagesRef = useRef(null)
  const revealPagesRef = useRef(false)

  // My Work passes no slides: read the saved deck for the page list and thumbnails.
  useEffect(() => {
    if (slidesProp || !workspaceId || !presentationId) return undefined
    let cancelled = false
    presentationService
      .getPresentation(workspaceId, presentationId)
      .then((data) => {
        if (!cancelled) setLoadedDeck(deckFromPresentation(data))
      })
      .catch((err) => {
        if (!cancelled) console.warn('Export: could not load slides', err)
      })
    return () => {
      cancelled = true
    }
  }, [slidesProp, workspaceId, presentationId])

  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const pickerDeck = useMemo(() => {
    if (slidesProp) {
      return { aspectRatio: aspectProp || '16:9', themeTokens: themeTokensProp, theme: themeProp, slides: slidesProp }
    }
    return loadedDeck
  }, [slidesProp, aspectProp, themeTokensProp, themeProp, loadedDeck])

  const deckSlides = useMemo(() => sortedSlides(pickerDeck?.slides), [pickerDeck])
  const totalSlides = deckSlides.length || Number(slideCount) || 0
  const canvas = useMemo(
    () => resolveCanvasSize(deckSlides[0] || null, pickerDeck?.aspectRatio || aspectProp || '16:9'),
    [deckSlides, pickerDeck, aspectProp]
  )

  const selection = useMemo(() => {
    if (!deckSlides.length) {
      // Slides still loading: only "All pages" can be resolved.
      return scope === 'all'
        ? { slideIds: null, count: totalSlides, error: null }
        : { slideIds: null, count: 0, error: 'Loading pages…' }
    }
    return resolveExportSelection({ scope, slides: deckSlides, currentSlideId, selectedIds })
  }, [scope, deckSlides, currentSlideId, selectedIds, totalSlides])

  const currentIndex = useMemo(() => {
    const idx = deckSlides.findIndex((s) => s.id === currentSlideId)
    return idx >= 0 ? idx : 0
  }, [currentSlideId, deckSlides])

  /** "Pages 1–3, 5" / "Page 2 · Title" under the page choice. */
  const pagesLine = useMemo(() => {
    if (!deckSlides.length) return totalSlides ? `${totalSlides} pages` : 'Loading pages…'
    if (scope === 'all') return `Pages 1–${totalSlides}`
    if (scope === 'current') return `Page ${currentIndex + 1} · ${getSlideTitle(deckSlides[currentIndex], currentIndex)}`
    if (!selection.count) return 'No pages chosen yet'
    const nums = pageNumbersFromSlideIds(deckSlides, selection.slideIds || deckSlides.map((s) => s.id))
    if (nums.length === 1) return `Page ${nums[0]} · ${getSlideTitle(deckSlides[nums[0] - 1], nums[0] - 1)}`
    const range = formatPageRange(nums, totalSlides)
    return nums.length === totalSlides ? `Pages 1–${totalSlides}` : `Pages ${range}`
  }, [deckSlides, scope, totalSlides, currentIndex, selection.count, selection.slideIds])

  const busy = phase === 'working'
  const isImage = selected === 'PNG' || selected === 'JPEG'
  const pixels = imagePixelSize(canvas, scale)
  const typeInfo = FILE_TYPES.find((t) => t.id === selected) || FILE_TYPES[0]
  const fileTypes = FILE_TYPES.filter((t) => PPT_EXPORT_FORMATS.includes(t.id))

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  const chooseScope = (next) => {
    if (busy) return
    setScope(next)
    if (next === 'custom' && scope !== 'custom') revealPagesRef.current = true
    // Opening the picker with nothing ticked: start from the current page (or every page).
    if (next === 'custom' && !selectedIds.some((id) => deckSlides.some((s) => s.id === id))) {
      setSelectedIds(currentSlideId ? [currentSlideId] : deckSlides.map((s) => s.id))
    }
  }

  // "Choose pages" opens the page list below the options: bring it into view.
  useEffect(() => {
    if (scope !== 'custom' || !revealPagesRef.current) return
    revealPagesRef.current = false
    pagesRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
  }, [scope])

  const exportTimeoutMs = useMemo(() => {
    const count = selection.count > 0 ? selection.count : 12
    const perSlideMs = selected === 'PPTX' ? 90_000 : 120_000
    return Math.min(45 * 60 * 1000, Math.max(10 * 60 * 1000, count * perSlideMs))
  }, [selection.count, selected])

  /** Files the server built: start the job, wait for it, return the link. */
  const exportOnServer = useCallback(async () => {
    const started = await presentationService.startExport(workspaceId, presentationId, {
      format: selected,
      slideIds: selection.slideIds,
      ...(selected === 'PPTX' ? { pptxTarget } : {}),
      ...(isImage ? { scale, quality, transparent } : {}),
    })
    const exportId = started?.exportId || started?.id || started?.export?.id || started?._id
    if (!exportId) throw new Error('Export started but no export id was returned')

    const ready = await presentationService.pollExportUntilReady(workspaceId, presentationId, exportId, {
      timeoutMs: exportTimeoutMs,
      onProgress: (s) => {
        const st = String(s?.status || s?.exportStatus || 'PROCESSING').toUpperCase()
        setStatusText(STATUS_LABEL[st] || `${selected}: ${st.toLowerCase()}…`)
      },
    })
    const url = ready?.presignedUrl || ready?.url || ready?.downloadUrl
    if (!url) throw new Error('Export finished but no download link was returned')

    // The server's file decides the extension: PNG / JPEG of several slides is a .zip.
    const serverExt = String(ready?.filename || ready?.s3Key || '').match(/\.([a-z0-9]{2,5})$/i)?.[1]
    const ext = String(serverExt || '').toLowerCase().replace('jpeg', 'jpg')
    const filename = ext ? `${exportFileBase(title)}.${ext}` : exportDownloadName(title, selected, selection.count)
    return { url, filename }
  }, [workspaceId, presentationId, selected, selection.slideIds, selection.count, pptxTarget, isImage, scale, quality, transparent, exportTimeoutMs, title])

  /**
   * Slide images made in this browser by the export renderer: no server job. Throws
   * BlockedImageError (or any other error) when the server should do it instead.
   */
  const exportInBrowser = useCallback(async () => {
    setStatusText('Getting your pages ready…')
    const data = await presentationService.getPresentation(workspaceId, presentationId)
    const deck = deckFromPresentation(data)
    const { captureSlidesInBrowser } = await import('../../../export-render/browserSlideCapture')
    const format = selected === 'JPEG' ? 'jpeg' : 'png'
    const total = selection.count || sortedSlides(deck.slides).length
    setProgress({ done: 0, total })
    setStatusText(`Drawing page 1 of ${total}…`)
    const images = await captureSlidesInBrowser({
      deck,
      slideIds: selection.slideIds,
      format,
      scale,
      quality,
      transparent,
      isCancelled: () => unmountedRef.current,
      onProgress: ({ done, total: all }) => {
        setProgress({ done, total: all })
        if (done < all) setStatusText(`Drawing page ${done + 1} of ${all}…`)
      },
    })

    // Same fee as a server export, once per download.
    setStatusText('Finishing up…')
    await presentationService.chargeBrowserExport(workspaceId, presentationId, {
      format: selected,
      slideIds: images.map((img) => img.slideId),
      downloadId: newDownloadId(),
    })

    // Canva's names: one page is "<Deck>.png"; several are "<Deck>.zip" holding "1.png", "3.png"…
    const ext = format === 'jpeg' ? 'jpg' : 'png'
    let blob
    if (images.length === 1) {
      blob = images[0].blob
    } else {
      const files = await Promise.all(
        images.map(async (img) => ({
          name: slideImageFilename(title, img.position, ext),
          bytes: new Uint8Array(await img.blob.arrayBuffer()),
        }))
      )
      blob = new Blob([zipStoredFiles(files)], { type: 'application/zip' })
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = URL.createObjectURL(blob)
    return { url: objectUrlRef.current, filename: exportDownloadName(title, selected, images.length) }
  }, [workspaceId, presentationId, selected, selection.slideIds, selection.count, scale, quality, transparent, title])

  const runExport = useCallback(async () => {
    if (!workspaceId || !presentationId) {
      setError('Save the presentation before exporting.')
      return
    }
    if (selection.error) {
      setError(selection.error)
      return
    }
    saveExportPrefs(presentationId, { format: selected, pptxTarget, scope, selectedIds, scale, quality, transparent })
    setPhase('working')
    setError('')
    setDownloadUrl('')
    setProgress(null)

    try {
      if (onBeforeExport) {
        // The export is built from the saved deck: save the latest edits first.
        setStatusText('Saving your latest changes…')
        try {
          await onBeforeExport()
        } catch (saveErr) {
          const wrapped = new Error(
            `Your latest changes couldn't be saved, so the export didn't start. ${
              saveErr?.message || 'Check your connection and try again.'
            }`
          )
          wrapped.status = saveErr?.status
          throw wrapped
        }
      }

      let result = null
      if (isImage && shouldCaptureInBrowser({ count: selection.count, scale })) {
        try {
          result = await exportInBrowser()
        } catch (browserErr) {
          if (isBlockingChargeError(browserErr) || unmountedRef.current) throw browserErr
          // A picture the browser can't read (or anything else): the server draws the same pages.
          console.warn('Export: browser images failed, exporting on the server', browserErr)
          setProgress(null)
          setStatusText(
            browserErr?.name === 'BlockedImageError'
              ? "Some pictures can't be drawn in your browser, so our server is making the images…"
              : `Preparing your ${typeInfo.name}…`
          )
        }
      }
      if (!result) {
        if (!isImage) setStatusText(`Preparing your ${typeInfo.name}…`)
        result = await exportOnServer()
      }
      if (unmountedRef.current) return

      setDownloadUrl(result.url)
      setDownloadFilename(result.filename)
      setStatusText('Your download is ready')
      setProgress(null)
      setPhase('done')
      triggerFileDownload(result.url, result.filename)
    } catch (err) {
      if (unmountedRef.current) return
      setPhase('pick')
      setProgress(null)
      if (isInsufficientCreditsError(err)) {
        setError(err.message || 'Insufficient credits to export')
      } else if (err?.status === 401) {
        // Only reached when the session could not be renewed (the sign-in prompt is showing).
        setError('Your session has expired. Sign in again, then export.')
      } else {
        setError(err.message || 'Export failed. Try again in a moment.')
      }
      setStatusText('')
    }
  }, [
    workspaceId,
    presentationId,
    selection.error,
    selection.count,
    selected,
    pptxTarget,
    scope,
    selectedIds,
    scale,
    quality,
    transparent,
    onBeforeExport,
    isImage,
    exportInBrowser,
    exportOnServer,
    typeInfo.name,
  ])

  const canExport = Boolean(workspaceId && presentationId)
  const scopes = [
    { id: 'all', label: totalSlides ? `All pages (${totalSlides})` : 'All pages' },
    ...(currentSlideId ? [{ id: 'current', label: 'Current page' }] : []),
    { id: 'custom', label: 'Choose pages' },
  ]
  const outputLine = exportOutputSummary({ format: selected, count: selection.count, pixels: isImage ? pixels : null })
  const percent = progress?.total ? Math.round((progress.done / progress.total) * 100) : null

  // Rendered on <body> so the editor's own layout (transforms, overflow) can't clip or shift it.
  const modal = (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose?.()}
    >
      <div className="ppt-editor-modal ppt-export-modal" role="dialog" aria-modal="true" aria-labelledby="ppt-export-title">
        <header className="ppt-export-head">
          <div className="ppt-export-head-text">
            <h3 id="ppt-export-title">Download</h3>
            <p title={title}>{title}</p>
          </div>
          <button type="button" className="ppt-export-close" onClick={onClose} disabled={busy} aria-label="Close">
            <FiX size={18} />
          </button>
        </header>

        {error ? (
          <div className="ppt-export-alert" role="alert">
            {error}
          </div>
        ) : null}

        {phase === 'pick' ? (
          <div className="ppt-export-body">
            <section className="ppt-export-section" aria-labelledby="ppt-export-type-label">
              <h4 id="ppt-export-type-label">File type</h4>
              <div className="ppt-export-types" role="radiogroup" aria-labelledby="ppt-export-type-label">
                {fileTypes.map((type) => {
                  const active = selected === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`ppt-export-type ${active ? 'is-active' : ''}`}
                      disabled={!canExport}
                      onClick={() => setSelected(type.id)}
                    >
                      <FileBadge format={type.id} />
                      <span className="ppt-export-type-text">
                        <strong>{type.name}</strong>
                        <em>{type.hint}</em>
                      </span>
                      {active ? (
                        <span className="ppt-export-type-tick" aria-hidden>
                          <FiCheck size={11} strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </section>

            {selected === 'PPTX' ? (
              <section className="ppt-export-section" aria-labelledby="ppt-export-target-label">
                <h4 id="ppt-export-target-label">Made for</h4>
                <div className="ppt-export-segment" role="radiogroup" aria-labelledby="ppt-export-target-label">
                  {[
                    { id: 'powerpoint', label: 'PowerPoint' },
                    { id: 'google-slides', label: 'Google Slides' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={pptxTarget === item.id}
                      className={pptxTarget === item.id ? 'is-active' : ''}
                      disabled={!canExport}
                      onClick={() => setPptxTarget(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="ppt-export-note">
                  {pptxTarget === 'google-slides'
                    ? 'Gradients and glow are kept as pictures, which Google Slides shows correctly.'
                    : 'Text, shapes, charts and tables stay editable. Fonts are included.'}
                </p>
              </section>
            ) : null}

            {selected === 'PDF' ? (
              <section className="ppt-export-section">
                <h4>PDF</h4>
                <p className="ppt-export-note">One page per slide. Text stays sharp and searchable, and links keep working.</p>
              </section>
            ) : null}

            {isImage ? (
              <section className="ppt-export-section" aria-labelledby="ppt-export-size-label">
                <h4 id="ppt-export-size-label">Size</h4>
                <div className="ppt-export-segment ppt-export-segment--sizes" role="radiogroup" aria-labelledby="ppt-export-size-label">
                  {IMAGE_SCALES.map((s) => {
                    const px = imagePixelSize(canvas, s)
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={scale === s}
                        className={scale === s ? 'is-active' : ''}
                        disabled={!canExport}
                        onClick={() => setScale(s)}
                      >
                        <strong>{s}×</strong>
                        <em>
                          {px.width} × {px.height}
                        </em>
                      </button>
                    )
                  })}
                </div>

                {selected === 'JPEG' ? (
                  <label className="ppt-export-slider">
                    <span className="ppt-export-slider-head">
                      Quality
                      <output>{quality}</output>
                    </span>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      step={1}
                      value={quality}
                      disabled={!canExport}
                      style={{ '--fill': `${((quality - 60) / 40) * 100}%` }}
                      onChange={(e) => setQuality(Number(e.target.value))}
                    />
                    <span className="ppt-export-slider-ends">
                      <span>Smaller file</span>
                      <span>Best quality</span>
                    </span>
                  </label>
                ) : (
                  <label className="ppt-export-switch-row">
                    <span>
                      <strong>Transparent background</strong>
                      <em>Leave the slide background out</em>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={transparent}
                      disabled={!canExport}
                      onChange={(e) => setTransparent(e.target.checked)}
                    />
                    <span className="ppt-export-switch" aria-hidden />
                  </label>
                )}
              </section>
            ) : null}

            <section ref={pagesRef} className="ppt-export-section ppt-export-section--pages" aria-labelledby="ppt-export-pages-label">
              <h4 id="ppt-export-pages-label">
                Pages
                <span>{pagesLine}</span>
              </h4>
              <div
                className={`ppt-export-segment ppt-export-segment--${scopes.length}`}
                role="radiogroup"
                aria-labelledby="ppt-export-pages-label"
              >
                {scopes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={scope === item.id}
                    className={scope === item.id ? 'is-active' : ''}
                    disabled={!canExport}
                    onClick={() => chooseScope(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {scope === 'custom' ? (
                <ExportSlidePicker deck={pickerDeck} selectedIds={selectedIds} onChange={setSelectedIds} disabled={!canExport} />
              ) : null}
            </section>
          </div>
        ) : (
          <div className="ppt-export-status" role="status">
            <div className="ppt-export-status-icon">
              <FileBadge format={selected} size="lg" />
              {phase === 'done' ? (
                <span className="ppt-export-status-done" aria-hidden>
                  <FiCheck size={14} strokeWidth={3} />
                </span>
              ) : null}
            </div>
            {phase === 'done' ? (
              <>
                <strong>{statusText}</strong>
                <p className="ppt-export-status-file">{downloadFilename}</p>
                <p>Your download should start by itself. If it didn&apos;t, click Download again.</p>
              </>
            ) : (
              <>
                <strong>Preparing your {typeInfo.name}</strong>
                <p>{statusText}</p>
                {percent != null ? (
                  <span
                    className="ppt-export-bar is-determinate"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={progress.total}
                    aria-valuenow={progress.done}
                    aria-label={`Page ${progress.done} of ${progress.total}`}
                  >
                    <i style={{ width: `${percent}%` }} />
                  </span>
                ) : (
                  <span className="ppt-export-bar" />
                )}
              </>
            )}
          </div>
        )}

        <footer className="ppt-export-foot">
          <p className="ppt-export-summary">
            {!canExport ? 'Save this presentation before exporting.' : phase === 'pick' ? outputLine : ''}
          </p>
          <div className="ppt-export-actions">
            <button
              type="button"
              className="ppt-editor-modal-btn ppt-editor-modal-btn--ghost"
              onClick={onClose}
              disabled={busy}
            >
              {phase === 'done' ? 'Close' : 'Cancel'}
            </button>
            {phase === 'done' && downloadUrl ? (
              <a
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                href={downloadUrl}
                download={downloadFilename || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault()
                  triggerFileDownload(downloadUrl, downloadFilename)
                }}
              >
                <FiDownload size={16} /> Download
              </a>
            ) : (
              <button
                type="button"
                className="ppt-editor-modal-btn ppt-editor-modal-btn--primary"
                disabled={!canExport || busy || Boolean(selection.error)}
                title={selection.error || undefined}
                onClick={runExport}
              >
                {busy ? (
                  <>
                    <FiLoader className="ppt-export-spinner" size={16} /> Exporting…
                  </>
                ) : (
                  <>
                    <FiDownload size={16} /> Download
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )

  return typeof document === 'undefined' ? modal : createPortal(modal, document.body)
}
