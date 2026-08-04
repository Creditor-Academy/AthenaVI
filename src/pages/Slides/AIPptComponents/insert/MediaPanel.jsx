import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiUpload, FiSearch, FiCamera, FiPackage } from 'react-icons/fi'
import InsertPanelShell from './InsertPanelShell'
import { RailBrandIcon } from './insertBrandIcons'
import stockService from '../../../../services/stockService'
import assetService from '../../../../services/assetService'
import brandKitService from '../../../../services/brandKitService'
import {
  DOODLE_ICON_LIBRARY,
  ICON_CATEGORIES,
  PPT_MEDIA_INTEGRATIONS,
  PPT_MEDIA_LIBRARY_ITEMS,
  PPT_STICKER_PACKS,
  PPT_STOCK_TOPICS,
} from '../../../../constants/pptInsertCatalog'

function assetUrl(asset) {
  return (
    asset?.url ||
    asset?.cdnUrl ||
    asset?.src ||
    asset?.downloadUrl ||
    asset?.thumbnailUrl ||
    asset?.thumbUrl ||
    ''
  )
}

function isImageAsset(asset) {
  const type = String(asset?.mediaType || asset?.type || asset?.mimeType || '').toLowerCase()
  return type.includes('image') || type.includes('photo') || /\.(jpe?g|png|webp|gif)$/i.test(assetUrl(asset))
}

function isVideoAsset(asset) {
  const type = String(asset?.mediaType || asset?.type || asset?.mimeType || '').toLowerCase()
  return type.includes('video') || /\.mp4$/i.test(assetUrl(asset))
}

export default function MediaPanel({
  workspaceId,
  brandKits = [],
  onInsert,
  disabled,
}) {
  const [activeId, setActiveId] = useState('unsplash')
  const [query, setQuery] = useState(PPT_STOCK_TOPICS[0]?.query || 'business')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [iconCategory, setIconCategory] = useState('all')
  const [expandedPack, setExpandedPack] = useState(null)
  const fileRef = useRef(null)

  const active = useMemo(
    () =>
      [...PPT_MEDIA_LIBRARY_ITEMS, ...PPT_MEDIA_INTEGRATIONS].find((i) => i.id === activeId) ||
      PPT_MEDIA_INTEGRATIONS[0],
    [activeId]
  )

  const rail = useMemo(
    () => [
      {
        label: 'Library',
        items: PPT_MEDIA_LIBRARY_ITEMS.map((i) => ({
          id: i.id,
          label: i.label,
          icon: <RailBrandIcon id={i.id} />,
        })),
      },
      {
        label: 'Integrations',
        items: PPT_MEDIA_INTEGRATIONS.map((i) => ({
          id: i.id,
          label: i.label,
          icon: <RailBrandIcon id={i.id} />,
        })),
      },
    ],
    []
  )

  const loadLibrary = useCallback(async () => {
    if (!workspaceId) {
      setItems([])
      setError('Save to a workspace to browse uploaded media')
      return
    }
    setLoading(true)
    setError('')
    try {
      const assets = await assetService.listAssets(workspaceId, { take: 60 })
      const filtered =
        active.kind === 'library-videos'
          ? assets.filter(isVideoAsset)
          : assets.filter(isImageAsset)
      setItems(filtered)
    } catch (err) {
      setError(err.message || 'Failed to load library')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId, active.kind])

  const loadStock = useCallback(
    async (searchQuery) => {
      setLoading(true)
      setError('')
      try {
        const result = await stockService.search({
          q: searchQuery || query || 'business',
          type: active.stockType || 'photo',
          provider: active.provider || 'unsplash',
          page: 1,
          perPage: 24,
        })
        const list =
          result?.items ||
          result?.results ||
          result?.photos ||
          (Array.isArray(result) ? result : [])
        setItems(list)
      } catch (err) {
        setError(err.message || 'Stock search failed')
        setItems([])
      } finally {
        setLoading(false)
      }
    },
    [active.provider, active.stockType, query]
  )

  const loadBrandPhotos = useCallback(async () => {
    if (!workspaceId || !brandKits.length) {
      setItems([])
      setError(brandKits.length ? '' : 'No brand kits in this workspace')
      return
    }
    setLoading(true)
    setError('')
    try {
      const kits = await Promise.all(
        brandKits.slice(0, 5).map((k) => brandKitService.get(workspaceId, k.id).catch(() => null))
      )
      const photos = []
      kits.filter(Boolean).forEach((kit) => {
        const media = kit.media || []
        media
          .filter((m) => !String(m.kind || '').toLowerCase().includes('logo'))
          .forEach((m) => {
            const url = m.url || m.src || m.cdnUrl
            if (url && !photos.some((p) => p.url === url)) {
              photos.push({
                id: m.id || m._id || url,
                url,
                name: m.name || 'Brand asset',
                kitName: kit.name,
              })
            }
          })
      })
      setItems(photos)
    } catch (err) {
      setError(err.message || 'Failed to load brand photos')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId, brandKits])

  useEffect(() => {
    if (active.kind === 'library-images' || active.kind === 'library-videos') {
      loadLibrary()
    } else if (active.kind === 'stock') {
      loadStock(PPT_STOCK_TOPICS[0]?.query || 'business')
    } else if (active.kind === 'brand-photos') {
      loadBrandPhotos()
    } else {
      setItems([])
      setError('')
      setLoading(false)
    }
    // Only re-run when the active rail changes — not on every query keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, active.kind])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !workspaceId) {
      setError(workspaceId ? 'No file selected' : 'Workspace required to upload')
      return
    }
    setLoading(true)
    setError('')
    try {
      const asset = await assetService.uploadAsset(workspaceId, file)
      const url = assetUrl(asset)
      if (!url) throw new Error('Upload succeeded but no URL returned')
      onInsert({
        type: isVideoAsset(asset) ? 'image' : 'image',
        content: {
          url,
          src: url,
          alt: asset.name || file.name,
          fit: 'cover',
          assetId: asset.id || asset._id,
        },
      })
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const insertStock = async (item) => {
    if (!workspaceId) {
      const url = item.url || item.src || item.thumbnailUrl || item.previewUrl
      if (!url) return
      onInsert({
        type: 'image',
        content: { url, src: url, alt: item.alt || item.description || '', fit: 'cover' },
      })
      return
    }
    setLoading(true)
    try {
      const provider = item.provider || active.provider
      const externalId = item.externalId || item.id || item._id
      const asset = await stockService.importStock(workspaceId, {
        provider,
        externalId,
        mediaType: item.mediaType || 'photo',
        name: item.description || item.alt || undefined,
      })
      const url = assetUrl(asset) || item.url || item.thumbnailUrl
      onInsert({
        type: 'image',
        content: {
          url,
          src: url,
          alt: item.alt || item.description || '',
          fit: 'cover',
          assetId: asset?.id || asset?._id,
          provider,
        },
      })
    } catch (err) {
      const url = item.url || item.src || item.thumbnailUrl || item.previewUrl
      if (url) {
        onInsert({
          type: 'image',
          content: { url, src: url, alt: item.alt || '', fit: 'cover' },
        })
      } else {
        setError(err.message || 'Failed to import stock image')
      }
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <button
      type="button"
      className="ppt-insert-upload-btn"
      disabled={disabled || !workspaceId}
      onClick={() => fileRef.current?.click()}
    >
      <FiUpload size={16} /> Upload media
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4"
        hidden
        onChange={handleUpload}
      />
    </button>
  )

  const filteredIcons =
    iconCategory === 'all'
      ? DOODLE_ICON_LIBRARY
      : DOODLE_ICON_LIBRARY.filter((i) => i.category === iconCategory)

  const stickerPacks = expandedPack
    ? PPT_STICKER_PACKS.filter((p) => p.id === expandedPack)
    : PPT_STICKER_PACKS

  const showSearch =
    active.kind === 'stock' || active.kind === 'icons' || active.kind === 'stickers'

  return (
    <InsertPanelShell
      title="Media"
      rail={rail}
      activeRailId={activeId}
      onSelectRail={setActiveId}
      footer={footer}
      wide
    >
      {showSearch && (
        <div className="ppt-insert-search-wrap">
          <FiSearch className="ppt-insert-search-icon" size={16} aria-hidden />
          <input
            className="ppt-insert-search ppt-insert-search--pill"
            type="search"
            placeholder={
              active.kind === 'icons'
                ? 'Search icons…'
                : active.kind === 'stickers'
                  ? 'Search stickers…'
                  : `Search ${active.label}`
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && active.kind === 'stock') loadStock(query)
            }}
          />
          {active.kind === 'stock' && (
            <button
              type="button"
              className="ppt-insert-search-go"
              disabled={loading}
              onClick={() => loadStock(query)}
            >
              Search
            </button>
          )}
        </div>
      )}

      {active.kind === 'stock' && (
        <div className="ppt-topic-chip-row">
          {PPT_STOCK_TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`ppt-topic-chip ${query === t.query ? 'is-active' : ''}`}
              style={t.image ? { backgroundImage: `url(${t.image})` } : undefined}
              onClick={() => {
                setQuery(t.query)
                loadStock(t.query)
              }}
            >
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {error && <div className="ppt-insert-error">{error}</div>}
      {loading && (
        <div className="ppt-insert-loading">
          <span className="ppt-insert-spinner" aria-hidden />
          Loading…
        </div>
      )}

      {active.kind === 'icons' && (
        <>
          <div className="ppt-insert-chip-row">
            {ICON_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`ppt-insert-chip ${iconCategory === c.id ? 'is-active' : ''}`}
                onClick={() => setIconCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="ppt-media-grid">
            {filteredIcons
              .filter((icon) =>
                !query.trim()
                  ? true
                  : icon.name.toLowerCase().includes(query.trim().toLowerCase())
              )
              .map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className="ppt-media-tile"
                  disabled={disabled}
                  title={icon.name}
                  onClick={() =>
                    onInsert({
                      type: 'icon',
                      content: { url: icon.src, src: icon.src, alt: icon.name, fit: 'contain' },
                    })
                  }
                >
                  <img src={icon.src} alt={icon.name} />
                </button>
              ))}
          </div>
        </>
      )}

      {active.kind === 'stickers' && (
        <div className="ppt-sticker-packs">
          {expandedPack && (
            <button type="button" className="ppt-insert-link" onClick={() => setExpandedPack(null)}>
              ← All packs
            </button>
          )}
          {stickerPacks.map((pack) => (
            <div key={pack.id} className="ppt-insert-section">
              <div className="ppt-insert-section-head">
                <span>{pack.label}</span>
                {!expandedPack && (
                  <button type="button" className="ppt-insert-link" onClick={() => setExpandedPack(pack.id)}>
                    More ›
                  </button>
                )}
              </div>
              <div className="ppt-media-grid">
                {(expandedPack ? pack.items : pack.items.slice(0, 6))
                  .filter((s) =>
                    !query.trim()
                      ? true
                      : s.label.toLowerCase().includes(query.trim().toLowerCase()) ||
                        pack.label.toLowerCase().includes(query.trim().toLowerCase())
                  )
                  .map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      className="ppt-media-tile"
                      disabled={disabled}
                      title={sticker.label}
                      onClick={() =>
                        onInsert({
                          type: 'icon',
                          content: {
                            url: sticker.src,
                            src: sticker.src,
                            alt: sticker.label,
                            fit: 'contain',
                          },
                        })
                      }
                    >
                      <img src={sticker.src} alt={sticker.label} />
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(active.kind === 'stock' ||
        active.kind === 'library-images' ||
        active.kind === 'library-videos' ||
        active.kind === 'brand-photos') &&
        !loading && (
          <div className="ppt-media-grid ppt-media-grid--masonry">
            {items.map((item, idx) => {
              const url =
                assetUrl(item) ||
                item.thumbnailUrl ||
                item.previewUrl ||
                item.urls?.small ||
                item.urls?.regular ||
                item.urls?.thumb ||
                ''
              const key = item.id || item._id || item.externalId || url || idx
              const aspect =
                item.width && item.height
                  ? `${item.width} / ${item.height}`
                  : item.aspectRatio || undefined
              return (
                <button
                  key={key}
                  type="button"
                  className="ppt-media-tile ppt-media-tile--masonry"
                  disabled={disabled || !url}
                  style={aspect ? { aspectRatio: aspect } : undefined}
                  onClick={() => {
                    if (active.kind === 'stock') insertStock(item)
                    else
                      onInsert({
                        type: 'image',
                        content: {
                          url,
                          src: url,
                          alt: item.name || item.alt || '',
                          fit: 'cover',
                          assetId: item.id || item._id,
                        },
                      })
                  }}
                >
                  {url ? (
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      onLoad={(e) => {
                        // Let natural image size drive masonry height
                        e.currentTarget.parentElement?.classList.add('is-loaded')
                      }}
                    />
                  ) : (
                    <FiCamera size={22} />
                  )}
                </button>
              )
            })}
            {!items.length && !error && (
              <div className="ppt-insert-empty ppt-insert-empty--block">
                <FiPackage size={28} />
                <span>No media found</span>
              </div>
            )}
          </div>
        )}
    </InsertPanelShell>
  )
}
