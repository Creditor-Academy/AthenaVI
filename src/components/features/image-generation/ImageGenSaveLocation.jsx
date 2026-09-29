import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Info } from 'lucide-react'
import workspaceService from '../../../services/workspaceService.js'
import './ImageGenSaveLocation.css'

function nid(item) {
  return item?.id || item?._id || ''
}

function nname(item, fallback) {
  return item?.name || item?.title || fallback
}

function MiniPick({ label, valueLabel, options, value, disabled, open, onToggle, onPick, empty = 'None' }) {
  return (
    <div className={`igsl-pick ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="igsl-pick-btn"
        disabled={disabled}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="igsl-pick-label">{label}</span>
        <span className="igsl-pick-value">{valueLabel || empty}</span>
        <ChevronDown size={12} className="igsl-pick-chevron" />
      </button>
      {open && (
        <ul className="igsl-menu" role="listbox">
          {options.length === 0 && <li className="igsl-menu-empty">{empty}</li>}
          {options.map((opt) => {
            const on = String(opt.id) === String(value)
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={`igsl-menu-item ${on ? 'is-on' : ''}`}
                  onClick={() => onPick(opt.id)}
                >
                  <span>{opt.name}</span>
                  {on && <Check size={12} strokeWidth={2.5} />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function ImageGenSaveLocation({
  workspaceId,
  folderId,
  onChange,
  variant = 'sidebar',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [folders, setFolders] = useState([])
  const [loadingWs, setLoadingWs] = useState(false)
  const [loadingFld, setLoadingFld] = useState(false)
  const rootRef = useRef(null)

  const wsOpts = workspaces.map((w) => ({ id: w.id, name: nname(w, 'Workspace') }))
  const fldOpts = folders.map((f) => ({ id: f.id, name: nname(f, 'Folder') }))
  const wsLabel = wsOpts.find((w) => String(w.id) === String(workspaceId))?.name
  const fldLabel = fldOpts.find((f) => String(f.id) === String(folderId))?.name

  useEffect(() => {
    let active = true
    async function loadWorkspaces() {
      setLoadingWs(true)
      try {
        const list = ((await workspaceService.listWorkspaces()) || []).map((w) => ({
          ...w,
          id: nid(w),
        }))
        if (!active) return
        setWorkspaces(list)
        if (!workspaceId && list[0]?.id) {
          onChange?.({ workspaceId: list[0].id, folderId: folderId || '' })
        }
      } catch (err) {
        console.error('[ImageGenSaveLocation] workspaces', err)
        if (active) setWorkspaces([])
      } finally {
        if (active) setLoadingWs(false)
      }
    }
    loadWorkspaces()
    return () => { active = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!workspaceId) {
      setFolders([])
      return undefined
    }
    let active = true
    async function loadFolders() {
      setLoadingFld(true)
      try {
        const list = ((await workspaceService.listFolders(workspaceId)) || []).map((f) => ({
          ...f,
          id: nid(f),
        }))
        if (!active) return
        setFolders(list)
        const still = list.find((f) => String(f.id) === String(folderId))
        const nextFolder = still?.id || list[0]?.id || ''
        if (nextFolder && String(nextFolder) !== String(folderId || '')) {
          onChange?.({ workspaceId, folderId: nextFolder })
        }
      } catch (err) {
        console.error('[ImageGenSaveLocation] folders', err)
        if (active) setFolders([])
      } finally {
        if (active) setLoadingFld(false)
      }
    }
    loadFolders()
    return () => { active = false }
  }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false)
        setMenu(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const pickWorkspace = (id) => {
    setMenu(null)
    if (!id || String(id) === String(workspaceId)) return
    onChange?.({ workspaceId: id, folderId: '' })
  }

  const pickFolder = (id) => {
    setMenu(null)
    if (!id || String(id) === String(folderId)) return
    onChange?.({ workspaceId, folderId: id })
  }

  const fields = (
    <>
      <MiniPick
        label="Workspace"
        valueLabel={loadingWs ? 'Loading…' : wsLabel}
        options={wsOpts}
        value={workspaceId}
        disabled={disabled || loadingWs}
        open={menu === 'ws'}
        onToggle={() => setMenu((m) => (m === 'ws' ? null : 'ws'))}
        onPick={pickWorkspace}
        empty="No workspaces"
      />
      <MiniPick
        label="Folder"
        valueLabel={loadingFld ? 'Loading…' : fldLabel}
        options={fldOpts}
        value={folderId}
        disabled={disabled || !workspaceId || loadingFld}
        open={menu === 'fld'}
        onToggle={() => setMenu((m) => (m === 'fld' ? null : 'fld'))}
        onPick={pickFolder}
        empty="No folders"
      />
    </>
  )

  return (
    <div className={`igsl igsl--info ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="igsl-info-btn"
        disabled={disabled}
        onClick={() => {
          setOpen((v) => !v)
          setMenu(null)
        }}
        aria-expanded={open}
        aria-label="Save location"
        title={
          [wsLabel, fldLabel].filter(Boolean).join(' · ') || 'Choose where images are saved'
        }
      >
        <Info size={16} strokeWidth={2} />
      </button>
      {open && (
        <div className="igsl-popover">
          <p className="igsl-popover-title">Save to</p>
          {fields}
        </div>
      )}
    </div>
  )
}
