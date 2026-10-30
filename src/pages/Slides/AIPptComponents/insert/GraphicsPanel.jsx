import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Storage blocked or full: Recent just won't remember this pick.
  }
}

export default function GraphicsPanel({ onInsert, disabled }) {
  const [activeId, setActiveId] = useState('all')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentIds, setRecentIds] = useState(() => readRecent())

  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const request = (requestRef.current += 1)
    setLoading(true)
    setError('')
    try {
      if (activeId === 'recommended') {
        // The ranked search returns at most 8 (the API rejects a larger maxCount).
        const data = await graphicsService.search({
          keywords: q ? [q] : ['accent', 'decor'],
          usage: 'editor',
          preferredType: 'decorative',
          maxCount: 8,
        })
        let found = data.items || []
        if (!found.length) {
          // Nothing ranked for this query: show the catalogue instead of an empty tab.
          found = (await graphicsService.list({ q, limit: 24 })).items || []
        }
        if (request === requestRef.current) setItems(found)
      } else {
        const params = { q, limit: 60 }
        if (activeId !== 'all' && activeId !== 'recent') params.category = activeId
        const data = await graphicsService.list(params)
        if (request === requestRef.current) setItems(data.items || [])
      }
    } catch (err) {
      if (request !== requestRef.current) return
      setError(err.message || 'Failed to load graphics')
      setItems([])
    } finally {
      if (request === requestRef.current) setLoading(false)
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
    const needle = q.trim().toLowerCase()
    return recentIds
      .map((id) => byId.get(id))
      .filter((g) => g && (!needle || String(g.name || '').toLowerCase().includes(needle)))
  }, [activeId, recentIds, items, q])

  useEffect(() => {
    if (activeId !== 'recent') return undefined
    let cancelled = false
    requestRef.current += 1 // drop any catalogue request still in flight
    setError('')
    if (!recentIds.length) {
      setItems([])
      setLoading(false)
      return undefined
    }
    setLoading(true)
    // Load each saved graphic by id so older ones still show, and skip any that were removed.
    Promise.allSettled(recentIds.map((id) => graphicsService.get(id)))
      .then((results) => {
        if (cancelled) return
        setItems(results.filter((r) => r.status === 'fulfilled' && r.value?.graphic).map((r) => r.value.graphic))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // Reloads when the tab opens, not on every pick (a pick would reorder the list under the cursor).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {!visible.length && !error && (
            <div className="ppt-insert-empty">
              {activeId === 'recent' ? 'Graphics you add will show up here.' : 'No published graphics yet'}
            </div>
          )}
        </div>
      )}
    </InsertPanelShell>
  )
}
