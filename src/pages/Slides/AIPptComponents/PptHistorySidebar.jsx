import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Loader2, Presentation, Search, SquarePen } from 'lucide-react'
import workspaceService from '../../../services/workspaceService'
import { normalizeLibraryItem } from '../../../utils/workspaceLibrary'
import './PptHistorySidebar.css'

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function groupByRecency(items) {
  const now = new Date()
  const today = startOfDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const week = new Date(today)
  week.setDate(week.getDate() - 7)
  const month = new Date(today)
  month.setDate(month.getDate() - 30)

  const groups = [
    { id: 'today', label: 'Today', items: [] },
    { id: 'yesterday', label: 'Yesterday', items: [] },
    { id: 'week', label: 'Previous 7 days', items: [] },
    { id: 'month', label: 'Previous 30 days', items: [] },
    { id: 'older', label: 'Older', items: [] },
  ]

  items.forEach((item) => {
    const stamp = new Date(item.updatedAt || 0)
    if (Number.isNaN(stamp.getTime()) || stamp >= today) groups[0].items.push(item)
    else if (stamp >= yesterday) groups[1].items.push(item)
    else if (stamp >= week) groups[2].items.push(item)
    else if (stamp >= month) groups[3].items.push(item)
    else groups[4].items.push(item)
  })

  return groups.filter((group) => group.items.length)
}

function statusLabel(item) {
  const raw = String(item.deckStatus || item.status || '').toUpperCase()
  if (raw === 'GENERATING') return 'Generating'
  if (raw === 'FAILED') return 'Failed'
  if (raw === 'READY') return null
  if (raw === 'DRAFT' || raw === 'OUTLINE') return 'Draft'
  return null
}

export default function PptHistorySidebar({
  activePresentationId = '',
  onOpenPresentation,
  onNewPresentation,
  onHome,
}) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }
    try {
      const workspaces = (await workspaceService.listWorkspaces()) || []
      const lists = await Promise.all(
        workspaces.map(async (ws) => {
          const workspaceId = ws.id || ws._id
          if (!workspaceId) return []

          let rows = []
          try {
            const library = await workspaceService.getLibrary(workspaceId, {
              category: 'presentation',
            })
            rows = library?.items || []
          } catch {
            const projects = await workspaceService
              .listProjects(workspaceId, { type: 'PRESENTATION' })
              .catch(() => [])
            rows = projects || []
          }

          return rows.map((row) => {
            const normalized = normalizeLibraryItem(
              { ...row, kind: 'presentation' },
              { workspaceId }
            )
            return {
              id: normalized.id,
              title: normalized.name || normalized.title || 'Untitled Presentation',
              workspaceId,
              workspaceName: ws.name || 'Workspace',
              folderId: normalized.folderId || null,
              updatedAt: normalized.lastModifiedAt || normalized.createdAt || null,
              deckStatus: normalized.deckStatus || normalized.status || null,
              slideCount: normalized.slideCount ?? null,
              themeId: normalized.themeId || null,
            }
          })
        })
      )

      const merged = lists
        .flat()
        .filter((item) => item.id)
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))

      setItems(merged)
    } catch (err) {
      console.error('[PptHistorySidebar] Failed to load presentations:', err)
      if (!silent) {
        setItems([])
        setError('Could not load presentation history.')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) => {
      const hay = `${item.title} ${item.workspaceName}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [items, query])

  const groups = useMemo(() => groupByRecency(filtered), [filtered])

  return (
    <aside className="aig-history-sidebar" aria-label="Presentation history">
      <div className="aig-history-expanded">
        <header className="aig-history-head">
          <div className="aig-history-brand">
            <button
              type="button"
              className="aig-history-back"
              onClick={onHome}
              aria-label="Back to home"
              title="Back to home"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="aig-history-kicker">History</p>
              <h2>Presentations</h2>
            </div>
          </div>
        </header>

        <button type="button" className="aig-history-new" onClick={onNewPresentation}>
          <SquarePen size={16} />
          New presentation
        </button>

        <label className="aig-history-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search history"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>

        <div className="aig-history-list" role="list">
          {loading && (
            <div className="aig-history-state">
              <Loader2 size={16} className="aig-history-spin" />
              Loading history…
            </div>
          )}

          {!loading && error && (
            <div className="aig-history-state aig-history-state--error">
              <p>{error}</p>
              <button type="button" onClick={loadHistory}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !filtered.length && (
            <div className="aig-history-state">
              {query.trim()
                ? 'No matching presentations.'
                : 'Your generated presentations will show up here.'}
            </div>
          )}

          {!loading &&
            !error &&
            groups.map((group) => (
              <section key={group.id} className="aig-history-group">
                <h3>{group.label}</h3>
                {group.items.map((item) => {
                  const status = statusLabel(item)
                  const isActive = String(item.id) === String(activePresentationId)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="listitem"
                      className={`aig-history-item ${isActive ? 'is-active' : ''}`}
                      onClick={() => onOpenPresentation?.(item)}
                      title={item.title}
                    >
                      <span className="aig-history-item-icon" aria-hidden="true">
                        <Presentation size={14} />
                      </span>
                      <span className="aig-history-item-copy">
                        <span className="aig-history-item-title">{item.title}</span>
                        <span className="aig-history-item-meta">
                          {item.workspaceName}
                          {item.slideCount != null ? ` · ${item.slideCount} slides` : ''}
                        </span>
                      </span>
                      {status && (
                        <span className={`aig-history-status is-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      )}
                    </button>
                  )
                })}
              </section>
            ))}
        </div>
      </div>
    </aside>
  )
}
