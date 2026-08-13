import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiUpload, FiSearch, FiCamera, FiPackage } from 'react-icons/fi'
import InsertPanelShell from './InsertPanelShell'
import { RailBrandIcon } from './insertBrandIcons'
import stockService from '../../../../services/stockService'
import assetService from '../../../../services/assetService'
import brandKitService from '../../../../services/brandKitService'
import presentationService from '../../../../services/presentationService'
import {
  DOODLE_ICON_LIBRARY,
  ICON_CATEGORIES,
  PPT_MEDIA_INTEGRATIONS,
  PPT_MEDIA_LIBRARY_ITEMS,
  PPT_STOCK_TOPICS,
  pickRandomStockBrowseQuery,
} from '../../../../constants/pptInsertCatalog'

function stockImageUrl(item) {
  return (
    assetUrl(item) ||
    item?.thumbnailUrl ||
    item?.previewUrl ||
    item?.urls?.small ||
    item?.urls?.regular ||
    item?.urls?.thumb ||
    ''
  )
}

function stockPhotographerName(item) {
  if (!item) return ''
  if (item.photographer) return String(item.photographer).trim()
  if (item.author) return String(item.author).trim()
  if (item.creator) return String(item.creator).trim()
  if (item.user?.name) return String(item.user.name).trim()
  if (typeof item.user === 'string') return item.user.trim()
  if (item.attribution) {
    return String(item.attribution)
      .replace(/^photo\s+by\s+/i, '')
      .replace(/^by\s+/i, '')
      .trim()
  }
  return ''
}

function stockPhotographerLink(item) {
  return (
    item?.photographerUrl ||
    item?.authorUrl ||
    item?.user?.links?.html ||
    item?.user?.portfolio_url ||
    item?.links?.html ||
    ''
  )
}

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
  presentationId,
  slideId,
  targetElementId = null,
  brandKits = [],
  onInsert,
  onMediaAttached,
  disabled,
}) {
  const canUseSlideMedia = Boolean(workspaceId && presentationId && slideId)
  const [activeId, setActiveId] = useState('unsplash')
  const [query, setQuery] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [iconCategory, setIconCategory] = useState('all')
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
        const q = String(searchQuery || query || pickRandomStockBrowseQuery()).trim()
        const result = await stockService.search({
          q,
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
      setSelectedTopicId(null)
      setQuery('')
      loadStock(pickRandomStockBrowseQuery())
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
      if (canUseSlideMedia) {
        const result = await presentationService.uploadSlideMedia(
          workspaceId,
          presentationId,
          slideId,
          file,
          { elementId: targetElementId || undefined }
        )
        if (onMediaAttached) {
          await onMediaAttached(result)
        } else {
          onInsert({ type: 'image', presetId: 'image' })
        }
        return
      }

      const asset = await assetService.uploadAsset(workspaceId, file)
      const url = assetUrl(asset)
      if (!url) throw new Error('Upload succeeded but no URL returned')
      onInsert({
        type: 'image',
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

  const attachLibraryAsset = async (item) => {
    const assetId = item.id || item._id
    const url = assetUrl(item)
    if (canUseSlideMedia && assetId) {
      setLoading(true)
      setError('')
      try {
        const result = await presentationService.attachSlideAsset(
          workspaceId,
          presentationId,
          slideId,
          { assetId, elementId: targetElementId || undefined }
        )
        if (onMediaAttached) await onMediaAttached(result)
        else onInsert({ type: 'image', presetId: 'image' })
      } catch (err) {
        if (url) {
          onInsert({
            type: 'image',
            content: {
              url,
              src: url,
              alt: item.name || item.alt || '',
              fit: 'cover',
              assetId,
            },
          })
        } else {
          setError(err.message || 'Failed to attach asset')
        }
      } finally {
        setLoading(false)
      }
      return
    }

    if (!url) return
    onInsert({
      type: 'image',
      content: {
        url,
        src: url,
        alt: item.name || item.alt || '',
        fit: 'cover',
        assetId,
      },
    })
  }

  const insertStock = async (item) => {
    const provider = item.provider || active.provider
    const externalId = item.externalId || item.id || item._id
    const previewUrl = item.url || item.src || item.thumbnailUrl || item.previewUrl

    if (canUseSlideMedia && (externalId || item.query)) {
      setLoading(true)
      setError('')
      try {
        const body = externalId
          ? {
              provider,
              externalId,
              ...(targetElementId ? { elementId: targetElementId } : {}),
            }
          : {
              query: item.query || query || 'business',
              ...(targetElementId ? { elementId: targetElementId } : {}),
            }
        const result = await presentationService.insertStockOntoSlide(
          workspaceId,
          presentationId,
          slideId,
          body
        )
        if (onMediaAttached) await onMediaAttached(result)
        else onInsert({ type: 'image', presetId: 'image' })
        return
      } catch (err) {
        // Fall through to legacy import / local insert
        if (!workspaceId && previewUrl) {
          onInsert({
            type: 'image',
            content: {
              url: previewUrl,
              src: previewUrl,
              alt: item.alt || item.description || '',
              fit: 'cover',
            },
          })
          setLoading(false)
          return
        }
        setError(err.message || 'Stock insert failed — trying workspace import…')
      }
    }

    if (!workspaceId) {
      if (!previewUrl) return
      onInsert({
        type: 'image',
        content: {
          url: previewUrl,
          src: previewUrl,
          alt: item.alt || item.description || '',
          fit: 'cover',
        },
      })
      return
    }

    setLoading(true)
    try {
      const asset = await stockService.importStock(workspaceId, {
        provider,
        externalId,
        mediaType: item.mediaType || 'photo',
        name: item.description || item.alt || undefined,
      })
      const url = assetUrl(asset) || previewUrl
      if (canUseSlideMedia && (asset?.id || asset?._id)) {
        const result = await presentationService.attachSlideAsset(
          workspaceId,
          presentationId,
          slideId,
          { assetId: asset.id || asset._id, elementId: targetElementId || undefined }
        )
        if (onMediaAttached) await onMediaAttached(result)
        else
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
        return
      }
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
      if (previewUrl) {
        onInsert({
          type: 'image',
          content: { url: previewUrl, src: previewUrl, alt: item.alt || '', fit: 'cover' },
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

  const showSearch = active.kind === 'stock' || active.kind === 'icons'

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
              active.kind === 'icons' ? 'Search icons…' : `Search ${active.label}`
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && active.kind === 'stock') {
                setSelectedTopicId(null)
                loadStock(query)
              }
            }}
          />
          {active.kind === 'stock' && (
            <button
              type="button"
              className="ppt-insert-search-go"
              disabled={loading}
              onClick={() => {
                setSelectedTopicId(null)
                loadStock(query)
              }}
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
              className={`ppt-topic-chip ${selectedTopicId === t.id ? 'is-active' : ''}`}
              style={t.image ? { backgroundImage: `url(${t.image})` } : undefined}
              onClick={() => {
                setSelectedTopicId(t.id)
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

      {(active.kind === 'stock' ||
        active.kind === 'library-images' ||
        active.kind === 'library-videos' ||
        active.kind === 'brand-photos') &&
        !loading && (
          <div className="ppt-media-grid ppt-media-grid--masonry">
            {items.map((item, idx) => {
              const url = stockImageUrl(item)
              const key = item.id || item._id || item.externalId || url || idx
              const aspect =
                item.width && item.height
                  ? `${item.width} / ${item.height}`
                  : item.aspectRatio || undefined
              const photographer = active.kind === 'stock' ? stockPhotographerName(item) : ''
              const photographerLink = stockPhotographerLink(item)
              return (
                <div key={key} className="ppt-media-card ppt-media-card--masonry">
                  <button
                    type="button"
                    className="ppt-media-tile ppt-media-tile--masonry"
                    disabled={disabled || !url}
                    style={aspect ? { aspectRatio: aspect } : undefined}
                    onClick={() => {
                      if (active.kind === 'stock') insertStock(item)
                      else if (
                        active.kind === 'library-images' ||
                        active.kind === 'library-videos'
                      ) {
                        attachLibraryAsset(item)
                      } else {
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
                      }
                    }}
                  >
                    {url ? (
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        onLoad={(e) => {
                          e.currentTarget.parentElement?.classList.add('is-loaded')
                        }}
                      />
                    ) : (
                      <FiCamera size={22} />
                    )}
                  </button>
                  {photographer ? (
                    <p className="ppt-media-attribution">
                      by{' '}
                      {photographerLink ? (
                        <a
                          href={photographerLink}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {photographer}
                        </a>
                      ) : (
                        <span>{photographer}</span>
                      )}
                    </p>
                  ) : null}
                </div>
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
