import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MdAutoAwesome,
  MdAdd,
  MdMoreVert,
  MdUpload,
  MdRefresh,
  MdDownload,
  MdVisibility,
} from 'react-icons/md'
import {
  LOGO_VARIANT_CARDS,
  findLogoMedia,
} from '../../../../utils/brandKitHelpers'
import BrandKitMorphModal, {
  getElementRect,
  runMorphClose,
} from './BrandKitMorphModal'

function batchLoadingLabel(generatingRole) {
  if (generatingRole === 'preview') return 'Previewing logo variants…'
  if (generatingRole === 'apply') return 'Applying logo variants…'
  if (generatingRole === 'finish') return 'Cleaning backgrounds…'
  if (generatingRole === 'wordmarks') return 'Building wordmarks…'
  if (generatingRole) return `Generating ${generatingRole}…`
  return 'Generating logo variants…'
}

function LogoCardMenu({
  open,
  onPreview,
  onUpload,
  onRegenerate,
  onDownload,
  canWrite,
  hasMedia,
  canPreview,
}) {
  if (!open) return null
  return (
    <div className="bk-logo-card-menu" role="menu">
      {canPreview && (
        <button type="button" role="menuitem" onClick={onPreview} disabled={!hasMedia}>
          <MdVisibility size={15} /> Preview
        </button>
      )}
      {canWrite && (
        <button type="button" role="menuitem" onClick={onUpload}>
          <MdUpload size={15} /> Upload
        </button>
      )}
      {canWrite && (
        <button type="button" role="menuitem" onClick={onRegenerate} disabled={!canWrite}>
          <MdRefresh size={15} /> Regenerate
        </button>
      )}
      <button type="button" role="menuitem" onClick={onDownload} disabled={!hasMedia}>
        <MdDownload size={15} /> Download PNG
      </button>
    </div>
  )
}

export default function LogosTab(props) {
  const {
    canWrite,
    triggerUpload,
    mediaByKind,
    generatingRole,
    generating,
    generateLogoVariants,
    regenerateLogoRole,
    downloadLogoPng,
    logoPreviewUrl,
    setEditorTab,
  } = props

  const [menuRole, setMenuRole] = useState(null)
  const [modal, setModal] = useState(null)
  const menuAnchorRef = useRef(null)
  const cardRefs = useRef({})
  const modalPanelRef = useRef(null)
  const pendingBatchRef = useRef(false)
  const pendingRoleRef = useRef(null)

  useEffect(() => {
    if (!menuRole) return undefined
    const onDoc = (e) => {
      if (menuAnchorRef.current && !menuAnchorRef.current.contains(e.target)) {
        setMenuRole(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuRole])

  const logos = mediaByKind('logo')

  const resolveSrc = useCallback(
    (role) => {
      const item = findLogoMedia(logos, role)
      if (item) return item.url || item.src || item.presignedUrl || null
      if (role === 'primary') return logoPreviewUrl || null
      return null
    },
    [logos, logoPreviewUrl]
  )

  // When generation finishes, show the resulting logo in the open modal
  useEffect(() => {
    if (!modal || modal.phase !== 'loading') return
    if (generating) return

    if (pendingBatchRef.current && modal.id === 'batch') {
      pendingBatchRef.current = false
      const prefer = ['primary', 'light', 'dark', 'with-name-below']
      let url = null
      let targetId = 'primary'
      for (const role of prefer) {
        const src = resolveSrc(role)
        if (src) {
          url = src
          targetId = role
          break
        }
      }
      setModal((prev) =>
        prev
          ? {
              ...prev,
              id: targetId,
              label: LOGO_VARIANT_CARDS.find((c) => c.role === targetId)?.label || 'Logo variants',
              url,
              phase: 'ready',
              anim: 'idle',
              dark: LOGO_VARIANT_CARDS.find((c) => c.role === targetId)?.darkCanvas || false,
            }
          : prev
      )
      return
    }

    if (pendingRoleRef.current && modal.id === pendingRoleRef.current) {
      const role = pendingRoleRef.current
      pendingRoleRef.current = null
      const url = resolveSrc(role)
      setModal((prev) =>
        prev
          ? {
              ...prev,
              url,
              phase: 'ready',
              anim: 'idle',
            }
          : prev
      )
    }
  }, [generating, modal, resolveSrc, logos, logoPreviewUrl])

  // Keep loading label in sync during batch
  useEffect(() => {
    if (!modal || modal.id !== 'batch' || modal.phase !== 'loading') return
    setModal((prev) =>
      prev
        ? { ...prev, loadingLabel: batchLoadingLabel(generatingRole) }
        : prev
    )
  }, [generatingRole, modal?.id, modal?.phase])

  const openPreview = useCallback((role, label, url, dark) => {
    if (!url) return
    const origin = getElementRect(cardRefs.current[role])
    setMenuRole(null)
    setModal({
      id: role,
      label,
      url,
      phase: 'ready',
      anim: 'open',
      origin,
      dark: Boolean(dark),
    })
  }, [])

  const startBatchGenerate = useCallback(async () => {
    if (!canWrite || generating) return
    pendingBatchRef.current = true
    pendingRoleRef.current = null
    const origin = getElementRect(cardRefs.current.primary)
    setModal({
      id: 'batch',
      label: 'Logo variants',
      url: null,
      phase: 'loading',
      anim: origin ? 'open' : 'idle',
      origin,
      dark: false,
      loadingLabel: batchLoadingLabel('preview'),
    })
    try {
      await generateLogoVariants?.()
    } catch {
      pendingBatchRef.current = false
      setModal(null)
    }
  }, [canWrite, generating, generateLogoVariants])

  const startRegenerate = useCallback(
    async (role, label, dark) => {
      if (!canWrite || generating || !role) return
      pendingRoleRef.current = role
      pendingBatchRef.current = false
      const origin = getElementRect(cardRefs.current[role])
      setMenuRole(null)
      setModal({
        id: role,
        label,
        url: null,
        phase: 'loading',
        anim: origin ? 'open' : 'idle',
        origin,
        dark: Boolean(dark),
        loadingLabel: `Generating ${label}…`,
      })
      try {
        await regenerateLogoRole?.(role)
      } catch {
        pendingRoleRef.current = null
        setModal(null)
      }
    },
    [canWrite, generating, regenerateLogoRole]
  )

  const closeModal = useCallback(() => {
    setModal((current) => {
      if (!current || current.anim === 'closing') return current
      const panel = modalPanelRef.current
      const targetId = current.id === 'batch' ? 'primary' : current.id
      const target = getElementRect(cardRefs.current[targetId])
      runMorphClose(panel, target, () => setModal(null))
      return { ...current, anim: 'closing' }
    })
  }, [])

  // Mark open animation finished
  useEffect(() => {
    if (!modal || modal.anim !== 'open') return undefined
    const t = window.setTimeout(() => {
      setModal((prev) => (prev && prev.anim === 'open' ? { ...prev, anim: 'idle' } : prev))
    }, 420)
    return () => window.clearTimeout(t)
  }, [modal?.id, modal?.anim])

  return (
    <div className="editor-tab-content">
      <div className="bk-logo-variants-intro">
        <div>
          <p className="bk-logo-variants-desc">
            Generate or upload each logo variant. Light, dark, monochrome, and wordmark lockups
            (below / adjacent, including dark-mode versions) use your brand name and{' '}
            <strong>Heading</strong> typography from the Typography tab.
          </p>
          <button
            type="button"
            className="bk-logo-typography-link"
            onClick={() => setEditorTab?.('typography')}
          >
            Edit heading font &amp; wordmark text colours in Typography →
          </button>
          <div className="bk-dl-formats-row" style={{ marginTop: 8 }}>
            <span className="bk-dl-label">ACCEPTED FORMATS</span>
            <span className="bk-dl-badge">SVG</span>
            <span className="bk-dl-badge">PNG</span>
            <span className="bk-dl-badge">WEBP</span>
            <span className="bk-dl-badge">JPG</span>
          </div>
        </div>
        {canWrite && (
          <button
            type="button"
            className={`bk-extract-btn ${generating ? 'generating' : ''}`}
            onClick={startBatchGenerate}
            disabled={generating}
            title="Preview then apply logo variants (credits may apply on apply)"
          >
            <MdAutoAwesome size={16} />
            {generating
              ? generatingRole === 'preview'
                ? 'Previewing…'
                : generatingRole === 'apply'
                  ? 'Applying variants…'
                  : generatingRole === 'finish'
                    ? 'Removing backgrounds…'
                    : generatingRole === 'wordmarks'
                      ? 'Building wordmarks…'
                      : `Generating ${generatingRole || ''}…`
              : 'Generate Variants from Primary'}
          </button>
        )}
      </div>

      <div className="bk-logo-variant-grid">
        {LOGO_VARIANT_CARDS.map(({ role, label, desc, darkCanvas }) => {
          const item = findLogoMedia(logos, role)
          const fallbackSrc = role === 'primary' ? logoPreviewUrl : null
          const hasUpload = Boolean(item)
          const hasFallback = !hasUpload && !!fallbackSrc
          const src = hasUpload
            ? item.url || item.src || item.presignedUrl
            : fallbackSrc
          const isBusy =
            generating &&
            (generatingRole === role ||
              generatingRole === 'apply' ||
              generatingRole === 'finish' ||
              generatingRole === 'wordmarks' ||
              generatingRole === 'preview')
          const showCardBusy = isBusy && modal?.id !== role && modal?.id !== 'batch'

          return (
            <div key={role} className={`bk-logo-variant-card ${isBusy ? 'is-busy' : ''}`}>
              <div
                className={`bk-logo-variant-canvas bk-logo-checkerboard ${
                  darkCanvas ? 'dark-canvas' : ''
                }`}
                ref={(el) => {
                  cardRefs.current[role] = el
                }}
              >
                <div
                  className="bk-logo-card-menu-wrap"
                  ref={menuRole === role ? menuAnchorRef : null}
                >
                  <button
                    type="button"
                    className="bk-logo-card-menu-btn"
                    aria-label={`${label} options`}
                    aria-haspopup="menu"
                    aria-expanded={menuRole === role}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuRole((prev) => (prev === role ? null : role))
                    }}
                  >
                    <MdMoreVert size={18} />
                  </button>
                  <LogoCardMenu
                    open={menuRole === role}
                    canWrite={canWrite}
                    hasMedia={Boolean(src)}
                    canPreview={Boolean(src)}
                    onPreview={() => openPreview(role, label, src, darkCanvas)}
                    onUpload={() => {
                      setMenuRole(null)
                      triggerUpload('logo', role)
                    }}
                    onRegenerate={() => startRegenerate(role, label, darkCanvas)}
                    onDownload={() => {
                      setMenuRole(null)
                      if (item) downloadLogoPng?.(item, role)
                      else if (fallbackSrc) {
                        downloadLogoPng?.({ url: fallbackSrc, role }, role)
                      }
                    }}
                  />
                </div>

                {src ? (
                  <button
                    type="button"
                    className="bk-logo-variant-hit"
                    onClick={() => openPreview(role, label, src, darkCanvas)}
                    aria-label={`Preview ${label}`}
                  >
                    <img src={src} alt={label} className="bk-logo-variant-img" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bk-logo-variant-dropzone"
                    disabled={!canWrite}
                    onClick={() => triggerUpload('logo', role)}
                  >
                    <MdAdd size={26} />
                    <span>Upload</span>
                  </button>
                )}

                {showCardBusy && (
                  <div className="bk-logo-variant-busy">
                    <div className="bk-mockup-spinner" />
                  </div>
                )}
              </div>

              <div className="bk-logo-variant-footer">
                <div className="bk-logo-variant-label-col">
                  <span className="bk-logo-variant-name">{label}</span>
                  <span className="bk-logo-variant-desc">{desc}</span>
                </div>
              </div>

              <div
                className={`bk-logo-variant-status ${hasUpload || hasFallback ? 'uploaded' : 'empty'}`}
              >
                {hasUpload ? '✓ Ready' : hasFallback ? 'Preview' : 'Missing'}
              </div>
            </div>
          )
        })}
      </div>

      <BrandKitMorphModal
        modal={modal}
        panelRef={modalPanelRef}
        onClose={closeModal}
        onRetry={
          modal?.id && modal.id !== 'batch'
            ? () => {
                const card = LOGO_VARIANT_CARDS.find((c) => c.role === modal.id)
                startRegenerate(modal.id, card?.label || modal.label, card?.darkCanvas)
              }
            : () => startBatchGenerate()
        }
        loadingLabel={modal?.loadingLabel}
        imageClassName="bk-morph-logo-img"
        panelClassName="bk-morph-logo-panel"
      />
    </div>
  )
}
