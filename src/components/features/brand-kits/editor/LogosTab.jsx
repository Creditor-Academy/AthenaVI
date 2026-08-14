import { useEffect, useRef, useState } from 'react'
import {
  MdAutoAwesome,
  MdAdd,
  MdMoreVert,
  MdUpload,
  MdRefresh,
  MdDownload,
} from 'react-icons/md'
import {
  LOGO_VARIANT_CARDS,
  findLogoMedia,
} from '../../../../utils/brandKitHelpers'

function LogoCardMenu({ open, onUpload, onRegenerate, onDownload, canWrite, hasMedia }) {
  if (!open) return null
  return (
    <div className="bk-logo-card-menu" role="menu">
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
  } = props

  const [menuRole, setMenuRole] = useState(null)
  const menuAnchorRef = useRef(null)

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

  return (
    <div className="editor-tab-content">
      <div className="bk-logo-variants-intro">
        <div>
          <p className="bk-logo-variants-desc">
            Generate or upload each logo variant. Light, dark, monochrome, and wordmark lockups
            use your brand typography and name. Previews use a transparent checkerboard.
          </p>
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
            onClick={generateLogoVariants}
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
          const isBusy = generating && (generatingRole === role || generatingRole === 'apply')

          return (
            <div key={role} className={`bk-logo-variant-card ${isBusy ? 'is-busy' : ''}`}>
              <div
                className={`bk-logo-variant-canvas bk-logo-checkerboard ${
                  darkCanvas ? 'dark-canvas' : ''
                }`}
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
                    onUpload={() => {
                      setMenuRole(null)
                      triggerUpload('logo', role)
                    }}
                    onRegenerate={() => {
                      setMenuRole(null)
                      regenerateLogoRole?.(role)
                    }}
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
                  <img src={src} alt={label} className="bk-logo-variant-img" />
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

                {isBusy && (
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

              <div className={`bk-logo-variant-status ${hasUpload || hasFallback ? 'uploaded' : 'empty'}`}>
                {hasUpload ? '✓ Ready' : hasFallback ? 'Preview' : 'Missing'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
