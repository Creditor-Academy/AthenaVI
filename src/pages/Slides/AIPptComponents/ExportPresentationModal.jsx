import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiImage,
  FiLayers,
  FiLoader,
  FiX,
} from 'react-icons/fi'
import presentationService from '../../../services/presentationService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { PPT_EXPORT_FORMATS, resolveCanvasSize } from '../../../utils/presentationHelpers'
import { deckFromPresentation } from '../../../export-render/exportDeck'
import {
  DEFAULT_JPEG_QUALITY,
  IMAGE_SCALES,
  exportFileBase,
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

const GROUPS = [
  { id: 'file', label: 'File', formats: ['PPTX', 'PDF'] },
  { id: 'images', label: 'Images', formats: ['PNG', 'JPEG'] },
]

const EXPORT_META = {
  PPTX: {
    label: 'PowerPoint',
    ext: 'PPTX',
    desc: 'Keep editing in PowerPoint or Google Slides.',
    detail: 'One editable .pptx with the slides you choose.',
    preview: 'pptx',
    cta: 'Export PPTX',
  },
  PDF: {
    label: 'PDF',
    ext: 'PDF',
    desc: 'Print-ready and easy to share.',
    detail: 'A single document that opens anywhere.',
    preview: 'pdf',
    cta: 'Export PDF',
  },
  PNG: {
    label: 'PNG',
    ext: 'PNG',
    desc: 'Crisp images, one file per slide.',
    detail: 'One image per slide (several slides come as a .zip). Can be transparent.',
    preview: 'png',
    cta: 'Export PNG',
  },
  JPEG: {
    label: 'JPEG',
    ext: 'JPEG',
    desc: 'Smaller images for web and email.',
    detail: 'Smaller files, one per slide (several slides come as a .zip).',
    preview: 'jpeg',
    cta: 'Export JPEG',
  },
}

function groupForFormat(format) {
  return GROUPS.find((g) => g.formats.includes(format))?.id || 'file'
}

function ExportPreview({ kind }) {
  return (
    <div className={`ppt-export-preview ppt-export-preview--${kind}`} aria-hidden>
      {kind === 'pdf' ? (
        <>
          <span className="ppt-export-sheet ppt-export-sheet--back" />
          <span className="ppt-export-sheet">
            <i />
            <i />
            <i />
          </span>
        </>
      ) : null}
      {kind === 'pptx' ? (
        <span className="ppt-export-deck">
          <span className="ppt-export-deck-bar">
            <b />
            <b />
            <b />
          </span>
          <span className="ppt-export-deck-stage">
            <i />
            <i />
          </span>
        </span>
      ) : null}
      {kind === 'png' || kind === 'jpeg' ? (
        <span className={`ppt-export-photo ${kind === 'jpeg' ? 'is-soft' : ''}`}>
          <span className="ppt-export-photo-sky" />
          <span className="ppt-export-photo-hill" />
        </span>
      ) : null}
    </div>
  )
}

const EXPORT_STATUS_LABEL = {
  QUEUED: 'Queued — starting export…',
  RENDERING: 'Building file — this can take a few minutes for large decks…',
  READY: 'Ready',
  FAILED: 'Failed',
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

const SCOPE_TABS = [
  { id: 'all', label: 'All slides' },
  { id: 'current', label: 'Current slide' },
  { id: 'custom', label: 'Select pages' },
]

/**
 * @param {object} props
 * @param {object[]} [props.slides]  the editor's slides (fresher than the saved deck); loaded
 *   from the API when missing (My Work)
 * @param {string} [props.currentSlideId]  enables "Current slide"
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
  const [group, setGroup] = useState(() => groupForFormat(prefs.format || 'PPTX'))
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loadedDeck, setLoadedDeck] = useState(null)
  const objectUrlRef = useRef(null)
  const unmountedRef = useRef(false)

  // My Work passes no slides: read the saved deck for the slide list and thumbnails.
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
      // Slides still loading: only "All slides" can be resolved.
      return scope === 'all'
        ? { slideIds: null, count: totalSlides, error: null }
        : { slideIds: null, count: 0, error: 'Loading slides…' }
    }
    return resolveExportSelection({ scope, slides: deckSlides, currentSlideId, selectedIds })
  }, [scope, deckSlides, currentSlideId, selectedIds, totalSlides])

  const currentSlideIndex = useMemo(() => {
    if (!currentSlideId || !deckSlides.length) return 0
    const idx = deckSlides.findIndex((s) => s.id === currentSlideId)
    return idx >= 0 ? idx : 0
  }, [currentSlideId, deckSlides])

  const currentSlideTitle = useMemo(() => {
    if (!deckSlides.length) return 'Slide 1'
    return getSlideTitle(deckSlides[currentSlideIndex], currentSlideIndex)
  }, [deckSlides, currentSlideIndex])

  const pagesSummary = useMemo(() => {
    if (!deckSlides.length) {
      return {
        title: 'Loading slides…',
        detail: '',
        singlePageNum: 1,
      }
    }
    if (scope === 'all') {
      return {
        title: `All pages (1–${totalSlides})`,
        detail: `All ${totalSlides} slides will be exported`,
        singlePageNum: 1,
      }
    }
    if (scope === 'current') {
      return {
        title: `Current page (Page ${currentSlideIndex + 1})`,
        detail: currentSlideTitle,
        singlePageNum: currentSlideIndex + 1,
      }
    }
    const count = selection.count
    if (count === 0) {
      return {
        title: 'No pages selected',
        detail: 'Click to select pages to export',
        singlePageNum: 1,
      }
    }
    if (count === 1) {
      const singleId = selection.slideIds?.[0]
      const idx = deckSlides.findIndex((s) => s.id === singleId)
      const pageNum = idx >= 0 ? idx + 1 : 1
      const titleText = getSlideTitle(deckSlides[idx >= 0 ? idx : 0], idx >= 0 ? idx : 0)
      return {
        title: `Page ${pageNum}`,
        detail: titleText,
        singlePageNum: pageNum,
      }
    }
    const pageNums = pageNumbersFromSlideIds(deckSlides, selection.slideIds || selectedIds)
    const rangeText = formatPageRange(pageNums, totalSlides)
    return {
      title: `${count} pages selected`,
      detail: rangeText ? `Pages: ${rangeText}` : `${count} of ${totalSlides} slides`,
      singlePageNum: pageNums[0] || 1,
    }
  }, [deckSlides, scope, totalSlides, currentSlideIndex, currentSlideTitle, selection.count, selection.slideIds, selectedIds])

  const formats = useMemo(() => {
    const allowed = new Set(PPT_EXPORT_FORMATS)
    return (GROUPS.find((g) => g.id === group)?.formats || []).filter((fmt) => allowed.has(fmt))
  }, [group])

  const meta = EXPORT_META[selected] || EXPORT_META.PDF
  const busy = phase === 'working'
  const isImage = selected === 'PNG' || selected === 'JPEG'
  const pixels = imagePixelSize(canvas, scale)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  const selectGroup = (nextGroup) => {
    if (busy) return
    setGroup(nextGroup)
    const nextFormats = GROUPS.find((g) => g.id === nextGroup)?.formats || []
    if (!nextFormats.includes(selected)) setSelected(nextFormats[0] || 'PPTX')
  }

  const chooseScope = (next) => {
    if (busy) return
    setScope(next)
    if (next === 'custom') {
      setPickerOpen(true)
      if (!selectedIds.some((id) => deckSlides.some((s) => s.id === id))) {
        setSelectedIds(currentSlideId ? [currentSlideId] : deckSlides.map((s) => s.id))
      }
    } else {
      setPickerOpen(false)
    }
  }

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
        setStatusText(EXPORT_STATUS_LABEL[st] || `${selected}: ${st.toLowerCase()}…`)
      },
    })
    const url = ready?.presignedUrl || ready?.url || ready?.downloadUrl
    if (!url) throw new Error('Export finished but no download link was returned')

    // The server's file decides the extension: PNG / JPEG of several slides is a .zip.
    const serverExt = String(ready?.filename || ready?.s3Key || '').match(/\.([a-z0-9]{2,5})$/i)?.[1]
    const resolvedExt = String(serverExt || selected || 'pptx').toLowerCase()
    const ext = resolvedExt === 'jpeg' ? 'jpg' : resolvedExt
    const baseName = exportFileBase(String(title || ready?.filename || 'Presentation').replace(/\.[a-z0-9]{2,5}$/i, ''))
    let filename =
      ready?.filename && !ready.filename.toLowerCase().startsWith('untitled') ? ready.filename : `${baseName}.${ext}`
    if (isImage && selection.count === 1 && totalSlides > 1 && !filename.endsWith('.zip')) {
      const pos = pagesSummary.singlePageNum || 1
      filename = slideImageFilename(title, pos, ext)
    }
    return { url, filename }
  }, [
    workspaceId,
    presentationId,
    selected,
    selection.slideIds,
    selection.count,
    pptxTarget,
    isImage,
    scale,
    quality,
    transparent,
    exportTimeoutMs,
    title,
    totalSlides,
    pagesSummary.singlePageNum,
  ])

  /**
   * Slide images made in this browser by the export renderer: no server job. Throws
   * BlockedImageError (or any other error) when the server should do it instead.
   */
  const exportInBrowser = useCallback(async () => {
    setStatusText('Getting your slides ready…')
    const data = await presentationService.getPresentation(workspaceId, presentationId)
    const deck = deckFromPresentation(data)
    const { captureSlidesInBrowser } = await import('../../../export-render/browserSlideCapture')
    const format = selected === 'JPEG' ? 'jpeg' : 'png'
    const total = selection.count || sortedSlides(deck.slides).length
    setProgress({ done: 0, total })
    setStatusText(`Drawing slide 1 of ${total}…`)
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
        if (done < all) setStatusText(`Drawing slide ${done + 1} of ${all}…`)
      },
    })

    // Same fee as a server export, once per download.
    setStatusText('Finishing up…')
    await presentationService.chargeBrowserExport(workspaceId, presentationId, {
      format: selected,
      slideIds: images.map((img) => img.slideId),
      downloadId: newDownloadId(),
    })

    const ext = format === 'jpeg' ? 'jpg' : 'png'
    let blob
    let filename
    if (images.length === 1) {
      blob = images[0].blob
      const pos = images[0].position || pagesSummary.singlePageNum || 1
      filename = totalSlides > 1 ? slideImageFilename(title, pos, ext) : `${exportFileBase(title)}.${ext}`
    } else {
      const files = await Promise.all(
        images.map(async (img) => ({
          name: slideImageFilename(title, img.position, ext),
          bytes: new Uint8Array(await img.blob.arrayBuffer()),
        }))
      )
      blob = new Blob([zipStoredFiles(files)], { type: 'application/zip' })
      filename = `${exportFileBase(title)}.zip`
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = URL.createObjectURL(blob)
    return { url: objectUrlRef.current, filename }
  }, [
    workspaceId,
    presentationId,
    selected,
    selection.slideIds,
    selection.count,
    scale,
    quality,
    transparent,
    title,
    totalSlides,
    pagesSummary.singlePageNum,
  ])

  const runExport = useCallback(async () => {
    if (!workspaceId || !presentationId) {
      setError('Save the presentation before exporting.')
      return
    }
    if (selection.error) {
      setError(selection.error)
      return
    }
    saveExportPrefs(presentationId, {
      format: selected,
      pptxTarget,
      scope,
      selectedIds,
      scale,
      quality,
      transparent,
    })
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
          // A picture the browser can't read (or anything else): the server draws the same slides.
          console.warn('Export: browser images failed, exporting on the server', browserErr)
          setProgress(null)
          setStatusText(
            browserErr?.name === 'BlockedImageError'
              ? "Some pictures can't be drawn in your browser, so the server is making the images…"
              : `Preparing ${selected}…`
          )
        }
      }
      if (!result) {
        if (!isImage) setStatusText(`Preparing ${selected}…`)
        result = await exportOnServer()
      }
      if (unmountedRef.current) return

      setDownloadUrl(result.url)
      setDownloadFilename(result.filename)
      setStatusText(`${meta.label} is ready`)
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
    meta.label,
  ])

  const canExport = Boolean(workspaceId && presentationId)
  const selectionLabel =
    selection.count > 0 ? `${selection.count} slide${selection.count === 1 ? '' : 's'}` : null
  const scopeTabs = SCOPE_TABS.filter((tab) => tab.id !== 'current' || currentSlideId)

  // Rendered on <body> so the editor's own layout (transforms, overflow) can't clip or shift it.
  const modal = (
    <div
      className="ppt-editor-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose?.()}
    >
      <div
        className={`ppt-editor-modal ppt-export-modal ${(scope === 'custom' || pickerOpen) && phase === 'pick' ? 'is-picking' : ''}`}
        role="dialog"
        aria-labelledby="ppt-export-title"
      >
        <header className="ppt-export-head">
          <div className="ppt-export-head-main">
            <span className="ppt-export-head-icon" aria-hidden>
              <FiDownload size={18} />
            </span>
            <div className="ppt-export-head-text">
              <h3 id="ppt-export-title">Export</h3>
              <p>{title}</p>
            </div>
          </div>
          <button
            type="button"
            className="ppt-editor-modal-close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </header>

        {error ? (
          <div className="ppt-editor-modal-alert ppt-editor-modal-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        {phase === 'done' ? (
          <div className="ppt-export-done">
            <ExportPreview kind={meta.preview} />
            <div>
              <strong>
                <FiCheckCircle size={16} /> {statusText}
              </strong>
              <p>Your download should start automatically. If it didn't, click Download below.</p>
            </div>
          </div>
        ) : busy ? (
          <div className="ppt-export-working" role="status">
            <ExportPreview kind={meta.preview} />
            <div>
              <strong>Preparing {meta.label}</strong>
              <p>{statusText}</p>
              {progress && progress.total > 0 ? (
                <span
                  className="ppt-export-bar is-determinate"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={progress.total}
                  aria-valuenow={progress.done}
                  aria-label={`Slide ${progress.done} of ${progress.total}`}
                >
                  <i style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                </span>
              ) : (
                <span className="ppt-export-bar" />
              )}
            </div>
          </div>
        ) : (
          <div className="ppt-export-body">
            <div className="ppt-export-tabs" role="tablist" aria-label="Export type">
              {GROUPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={group === item.id}
                  className={`ppt-export-tab ${group === item.id ? 'is-active' : ''}`}
                  disabled={!canExport}
                  onClick={() => selectGroup(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="ppt-export-stage">
              <ExportPreview kind={meta.preview} />
              <div className="ppt-export-stage-copy">
                <span className="ppt-export-stage-kicker">{meta.ext}</span>
                <strong>{meta.label}</strong>
                <p>{meta.detail}</p>
              </div>
            </div>

            <div className="ppt-export-choices" role="listbox" aria-label="Format">
              {formats.map((fmt) => {
                const item = EXPORT_META[fmt]
                const active = selected === fmt
                return (
                  <button
                    key={fmt}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`ppt-export-choice ${active ? 'is-active' : ''}`}
                    disabled={!canExport}
                    onClick={() => {
                      setSelected(fmt)
                      setGroup(groupForFormat(fmt))
                    }}
                  >
                    <span className={`ppt-export-radio ${active ? 'is-on' : ''}`} aria-hidden>
                      {active ? <FiCheck size={12} /> : null}
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <em>{item.desc}</em>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="ppt-export-target">
              <span className="ppt-export-target-label" id="ppt-export-scope-label">
                Select pages
                {selectionLabel ? <span className="ppt-export-target-value">{selectionLabel}</span> : null}
              </span>
              <div
                className={`ppt-export-tabs ppt-export-tabs--${scopeTabs.length}`}
                role="radiogroup"
                aria-labelledby="ppt-export-scope-label"
              >
                {scopeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="radio"
                    aria-checked={scope === tab.id}
                    className={`ppt-export-tab ${scope === tab.id ? 'is-active' : ''}`}
                    disabled={!canExport}
                    onClick={() => chooseScope(tab.id)}
                  >
                    {tab.id === 'all' && totalSlides ? `${tab.label} (${totalSlides})` : tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`ppt-export-pages-trigger ${pickerOpen ? 'is-open' : ''}`}
                onClick={() => setPickerOpen((prev) => !prev)}
                aria-expanded={pickerOpen}
                disabled={!canExport}
              >
                <span className="ppt-export-pages-trigger-main">
                  <FiLayers className="ppt-export-pages-icon" size={16} />
                  <span className="ppt-export-pages-text">
                    <strong>{pagesSummary.title}</strong>
                    <em>{pagesSummary.detail}</em>
                  </span>
                </span>
                <span className="ppt-export-pages-toggle">
                  {pickerOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </span>
              </button>

              {pickerOpen ? (
                <ExportSlidePicker
                  deck={pickerDeck}
                  selectedIds={
                    scope === 'custom'
                      ? selectedIds
                      : scope === 'current'
                        ? [currentSlideId].filter(Boolean)
                        : deckSlides.map((s) => s.id)
                  }
                  onChange={(newIds) => {
                    setSelectedIds(newIds)
                    if (scope !== 'custom') setScope('custom')
                  }}
                  disabled={!canExport}
                  onDone={() => setPickerOpen(false)}
                />
              ) : null}

              <div className="ppt-export-download-mode-banner">
                {isImage ? (
                  selection.count === 1 ? (
                    <>
                      <FiImage size={18} className="ppt-export-mode-icon" />
                      <div className="ppt-export-mode-text">
                        <strong>Single image download</strong>
                        <p>
                          Page {pagesSummary.singlePageNum} will download directly as a single{' '}
                          <code>.{selected === 'JPEG' ? 'jpg' : 'png'}</code> image ({pixels.width} × {pixels.height} px).
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiLayers size={18} className="ppt-export-mode-icon" />
                      <div className="ppt-export-mode-text">
                        <strong>ZIP archive download</strong>
                        <p>
                          {selection.count} pages will download as separate{' '}
                          <code>.{selected === 'JPEG' ? 'jpg' : 'png'}</code> images packaged in a <code>.zip</code> file.
                        </p>
                      </div>
                    </>
                  )
                ) : selected === 'PDF' ? (
                  <>
                    <FiLayers size={18} className="ppt-export-mode-icon" />
                    <div className="ppt-export-mode-text">
                      <strong>Single PDF document</strong>
                      <p>
                        {selection.count} {selection.count === 1 ? 'page' : 'pages'} will be combined into a single PDF document.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <FiLayers size={18} className="ppt-export-mode-icon" />
                    <div className="ppt-export-mode-text">
                      <strong>PowerPoint presentation</strong>
                      <p>
                        {selection.count} {selection.count === 1 ? 'slide' : 'slides'} will be exported into an editable PowerPoint deck.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {selected === 'PPTX' ? (
              <div className="ppt-export-target">
                <span className="ppt-export-target-label" id="ppt-export-target-label">
                  Made for
                </span>
                <div className="ppt-export-tabs" role="radiogroup" aria-labelledby="ppt-export-target-label">
                  {[
                    { id: 'powerpoint', label: 'PowerPoint' },
                    { id: 'google-slides', label: 'Google Slides' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={pptxTarget === item.id}
                      className={`ppt-export-tab ${pptxTarget === item.id ? 'is-active' : ''}`}
                      disabled={!canExport}
                      onClick={() => setPptxTarget(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="ppt-export-target-hint">
                  {pptxTarget === 'google-slides'
                    ? 'Gradients and glow are kept as pictures, which Google Slides shows correctly.'
                    : 'Gradients, glow and text effects stay editable in PowerPoint.'}
                </p>
              </div>
            ) : null}

            {isImage ? (
              <div className="ppt-export-target">
                <span className="ppt-export-target-label" id="ppt-export-size-label">
                  Size
                  <span className="ppt-export-target-value">
                    {pixels.width} × {pixels.height} px
                  </span>
                </span>
                <div className="ppt-export-tabs ppt-export-tabs--3" role="radiogroup" aria-labelledby="ppt-export-size-label">
                  {IMAGE_SCALES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={scale === s}
                      className={`ppt-export-tab ${scale === s ? 'is-active' : ''}`}
                      disabled={!canExport}
                      onClick={() => setScale(s)}
                    >
                      {s}×
                    </button>
                  ))}
                </div>

                {selected === 'JPEG' ? (
                  <label className="ppt-export-range">
                    <span className="ppt-export-target-label">
                      Quality
                      <span className="ppt-export-target-value">{quality}</span>
                    </span>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      step={1}
                      value={quality}
                      disabled={!canExport}
                      onChange={(e) => setQuality(Number(e.target.value))}
                    />
                  </label>
                ) : (
                  <label className="ppt-export-check">
                    <input
                      type="checkbox"
                      checked={transparent}
                      disabled={!canExport}
                      onChange={(e) => setTransparent(e.target.checked)}
                    />
                    <span>
                      <strong>Transparent background</strong>
                      <em>Leaves the slide background out.</em>
                    </span>
                  </label>
                )}
              </div>
            ) : null}
          </div>
        )}

        {!canExport ? (
          <p className="ppt-export-hint">Save this presentation before exporting.</p>
        ) : null}

        <footer className="ppt-export-foot">
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
                  <FiDownload size={16} /> {selection.count > 0 ? `${meta.cta} (${selection.count})` : meta.cta}
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  )

  return typeof document === 'undefined' ? modal : createPortal(modal, document.body)
}
