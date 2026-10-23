import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiSearch, FiStar, FiClock } from 'react-icons/fi'
import InsertPanelShell from './InsertPanelShell'
import graphicsService from '../../../../services/graphicsService'

const RECENT_KEY = 'ppt-graphics-recent-ids'
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'recent', label: 'Recent' },
  { id: 'blobs', label: 'Blobs' },
  { id: 'frames', label: 'Frames' },
  { id: 'dividers', label: 'Dividers' },
  { id: 'ornaments', label: 'Ornaments' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'icons', label: 'Icons' },
]

function readRecent() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(raw) ? raw.map(String) : []
  } catch {
    return []
  }
}

function pushRecent(id) {
  const next = [String(id), ...readRecent().filter((x) => x !== String(id))].slice(0, 24)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

export default function GraphicsPanel({ onInsert, disabled }) {
  const [activeId, setActiveId] = useState('all')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentIds, setRecentIds] = useState(() => readRecent())

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (activeId === 'recommended') {
        const data = await graphicsService.search({
          keywords: q ? [q] : ['accent', 'decor'],
          usage: 'editor',
          preferredType: 'decorative',
          maxCount: 24,
        })
        setItems(data.items || [])
      } else {
        const params = { q, limit: 60 }
        if (activeId !== 'all' && activeId !== 'recent') params.category = activeId
        const data = await graphicsService.list(params)
        setItems(data.items || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load graphics')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [activeId, q])

  useEffect(() => {
    if (activeId === 'recent') return
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load, activeId])

  const recentItems = useMemo(() => {
    if (activeId !== 'recent') return []
    const byId = new Map(items.map((i) => [i.id, i]))
    return recentIds.map((id) => byId.get(id)).filter(Boolean)
  }, [activeId, recentIds, items])

  useEffect(() => {
    if (activeId !== 'recent') return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await graphicsService.list({ limit: 80 })
        if (!cancelled) setItems(data.items || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [activeId])

  const rail = useMemo(
    () => [
      {
        label: 'Browse',
        items: CATEGORIES.map((c) => ({
          id: c.id,
          label: c.label,
          icon: c.id === 'recommended' ? <FiStar size={14} /> : c.id === 'recent' ? <FiClock size={14} /> : null,
        })),
      },
    ],
    []
  )

  const visible = activeId === 'recent' ? recentItems : items

  const insert = (g) => {
    pushRecent(g.id)
    setRecentIds(readRecent())
    onInsert?.({
      type: 'graphic',
      role: 'decoration',
      content: {
        assetId: g.id,
        src: g.fileUrl,
        url: g.fileUrl,
        previewUrl: g.previewUrl,
        s3Key: g.s3Key || undefined,
        colorMode: g.colorMode,
        colorOverrides: g.colorMode === 'recolorable' ? { primary: true } : undefined,
        alt: g.name,
        fit: 'contain',
      },
    })
  }

  return (
    <InsertPanelShell
      title="Graphics"
      rail={rail}
      activeRailId={activeId}
      onSelectRail={setActiveId}
      wide
      className="ppt-insert-panel--graphics"
    >
      <div className="ppt-insert-search-wrap">
        <FiSearch className="ppt-insert-search-icon" size={16} aria-hidden />
        <input
          className="ppt-insert-search ppt-insert-search--pill"
          type="search"
          placeholder="Search graphics…"
          value={q}
          disabled={disabled}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {error && <div className="ppt-insert-empty">{error}</div>}
      {loading ? (
        <div className="ppt-insert-empty">Loading…</div>
      ) : (
        <div className="ppt-media-grid ppt-media-grid--masonry ppt-graphics-grid">
          {visible.map((g) => {
            const iconish =
              String(g.type || '').toLowerCase() === 'icon' ||
              String(g.category || '').toLowerCase() === 'icons'
            return (
              <button
                key={g.id}
                type="button"
                className={`ppt-media-tile ppt-graphic-tile ${iconish ? 'ppt-graphic-tile--icon' : ''}`}
                disabled={disabled}
                title={g.name}
                onClick={() => insert(g)}
              >
                <span className={`ppt-graphic-tile-preview ${iconish ? 'ppt-graphic-tile-preview--icon' : ''}`}>
                  <img
                    src={g.previewUrl || g.fileUrl}
                    alt={g.name}
                    className={`ppt-graphic-tile-img ${iconish ? 'ppt-graphic-tile-img--icon' : ''}`}
                    loading="lazy"
                  />
                </span>
                <span className="ppt-graphic-tile-label">{g.name}</span>
              </button>
            )
          })}
          {!visible.length && <div className="ppt-insert-empty">No published graphics yet</div>}
        </div>
      )}
    </InsertPanelShell>
  )
}
