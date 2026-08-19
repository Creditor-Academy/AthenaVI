import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  FolderOpen,
  LayoutGrid,
  X,
} from 'lucide-react'
import { CREATE_OPTIONS } from '../../../constants/createOptions.js'
import workspaceService from '../../../services/workspaceService.js'
import ModalSelect from '../ModalSelect/ModalSelect.jsx'
import paintBucketImage from '../../../assets/home_quickcreate/paint_bucket.png'
import megaphoneImage from '../../../assets/home_quickcreate/megaphone.png'
import bowlingPinsImage from '../../../assets/home_quickcreate/bowling_pins.png'
import canvasToolsImage from '../../../assets/home_quickcreate/canvas_tools.png'
import './CreateLocationModal.css'

const OPTION_VISUALS = {
  'ppt-ai': {
    image: paintBucketImage,
    accent: 'pink',
    eyebrow: 'AI Presentation',
    subtitle: 'Choose where this deck should be saved. You’ll name the project on the next screen.',
    caption: 'Keep presentations organized in the right workspace from the start.',
  },
  'ppt-builder': {
    image: megaphoneImage,
    accent: 'lavender',
    eyebrow: 'Presentation Design',
    subtitle: 'Choose where this presentation should be saved. You’ll name it on the next screen.',
    caption: 'Your slides stay with the right team folder as you build.',
  },
  'image-ai': {
    image: bowlingPinsImage,
    accent: 'cyan',
    eyebrow: 'AI Image',
    subtitle: 'Choose where this image project should be saved. You’ll name it on the next screen.',
    caption: 'Generated visuals land in a clear, shared location.',
  },
  'image-editor': {
    image: canvasToolsImage,
    accent: 'orange',
    eyebrow: 'Canvas Editor',
    subtitle: 'Choose where this canvas project should be saved. You’ll name it on the next screen.',
    caption: 'Edited assets stay easy to find for you and your team.',
  },
}

function normalizeWorkspace(workspace) {
  return {
    ...workspace,
    id: workspace.id || workspace._id,
    name: workspace.name || workspace.title || 'Untitled Workspace',
  }
}

function normalizeFolder(folder) {
  return {
    ...folder,
    id: folder.id || folder._id,
    name: folder.name || 'Untitled Folder',
  }
}

function CreateLocationModal({
  isOpen,
  onClose,
  optionId,
  initialWorkspaceId = '',
  initialFolderId = '',
  onConfirm,
}) {
  const option = useMemo(
    () => CREATE_OPTIONS.find((item) => item.id === optionId) || null,
    [optionId]
  )
  const visual = OPTION_VISUALS[optionId] || {
    image: megaphoneImage,
    accent: 'lavender',
    eyebrow: 'New project',
    subtitle: 'Pick the workspace and folder for this project. You’ll name it on the next screen.',
    caption: 'Save into a workspace folder so your team can find it later.',
  }
  const OptionIcon = option?.icon || LayoutGrid

  const [workspaceOptions, setWorkspaceOptions] = useState([])
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState('')
  const [folderOptions, setFolderOptions] = useState([])
  const [folderLoading, setFolderLoading] = useState(false)
  const [folderId, setFolderId] = useState('')
  const [error, setError] = useState('')
  const [openSelect, setOpenSelect] = useState(null)

  const [showInlineWorkspaceCreate, setShowInlineWorkspaceCreate] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)

  const [showInlineFolderCreate, setShowInlineFolderCreate] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)

  const selectedWorkspace = workspaceOptions.find((ws) => String(ws.id) === String(workspaceId))
  const selectedFolder = folderOptions.find((folder) => String(folder.id) === String(folderId))
  const canConfirm =
    Boolean(workspaceId) &&
    Boolean(folderId) &&
    !workspaceLoading &&
    !folderLoading &&
    !creatingWorkspace &&
    !creatingFolder

  const loadWorkspaces = useCallback(async () => {
    setWorkspaceLoading(true)
    setError('')
    try {
      const fetched = await workspaceService.listWorkspaces()
      const normalized = (fetched || []).map(normalizeWorkspace)
      setWorkspaceOptions(normalized)

      const preferred =
        normalized.find((ws) => String(ws.id) === String(initialWorkspaceId)) ||
        normalized[0] ||
        null

      setWorkspaceId(preferred?.id || '')
    } catch (err) {
      console.error('[CreateLocationModal] Failed to load workspaces:', err)
      setWorkspaceOptions([])
      setWorkspaceId('')
      setError('Could not load workspaces. Please try again.')
    } finally {
      setWorkspaceLoading(false)
    }
  }, [initialWorkspaceId])

  const loadFolders = useCallback(
    async (nextWorkspaceId) => {
      if (!nextWorkspaceId) {
        setFolderOptions([])
        setFolderId('')
        return
      }

      setFolderLoading(true)
      setError('')
      try {
        const folders = await workspaceService.listFolders(nextWorkspaceId)
        const normalized = (folders || []).map(normalizeFolder)
        setFolderOptions(normalized)

        const preferred =
          normalized.find((folder) => String(folder.id) === String(initialFolderId)) ||
          normalized[0] ||
          null

        setFolderId(preferred?.id || '')
      } catch (err) {
        console.error('[CreateLocationModal] Failed to load folders:', err)
        setFolderOptions([])
        setFolderId('')
        setError('Could not load folders for this workspace.')
      } finally {
        setFolderLoading(false)
      }
    },
    [initialFolderId]
  )

  useEffect(() => {
    if (!isOpen) return undefined

    setError('')
    setOpenSelect(null)
    setShowInlineWorkspaceCreate(false)
    setShowInlineFolderCreate(false)
    setNewWorkspaceName('')
    setNewFolderName('')
    setCreatingWorkspace(false)
    setCreatingFolder(false)
    loadWorkspaces()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, optionId, loadWorkspaces, onClose])

  useEffect(() => {
    if (!isOpen) return
    loadFolders(workspaceId)
  }, [isOpen, workspaceId, loadFolders])

  if (!isOpen) return null

  const handleCreateWorkspaceInline = async () => {
    const trimmedName = newWorkspaceName.trim()
    if (!trimmedName || creatingWorkspace) return

    setCreatingWorkspace(true)
    setError('')
    try {
      const created = await workspaceService.createWorkspace(trimmedName)
      const normalized = normalizeWorkspace({ ...created, userRole: 'OWNER' })

      setWorkspaceOptions((prev) => {
        if (prev.some((workspace) => String(workspace.id) === String(normalized.id))) return prev
        return [...prev, normalized]
      })
      setWorkspaceId(normalized.id)
      setFolderOptions([])
      setFolderId('')
      setShowInlineWorkspaceCreate(false)
      setShowInlineFolderCreate(true)
      setNewWorkspaceName('')

      window.dispatchEvent(new CustomEvent('workspace:created', { detail: { workspace: normalized } }))
    } catch (err) {
      console.error('[CreateLocationModal] Failed to create workspace:', err)
      setError(err?.message || 'Failed to create workspace. Please try again.')
    } finally {
      setCreatingWorkspace(false)
    }
  }

  const handleCreateFolderInline = async () => {
    const trimmedName = newFolderName.trim()
    if (!trimmedName || !workspaceId || creatingFolder) return

    setCreatingFolder(true)
    setError('')
    try {
      const created = await workspaceService.createFolder(workspaceId, trimmedName)
      const normalizedFolder = normalizeFolder({ ...created, name: created.name || trimmedName })

      setFolderOptions((prev) => {
        if (prev.some((folder) => String(folder.id) === String(normalizedFolder.id))) return prev
        return [...prev, normalizedFolder]
      })
      setFolderId(normalizedFolder.id)
      setShowInlineFolderCreate(false)
      setNewFolderName('')

      window.dispatchEvent(
        new CustomEvent('workspace:folder-created', {
          detail: { workspaceId, folder: normalizedFolder },
        })
      )
    } catch (err) {
      console.error('[CreateLocationModal] Failed to create folder:', err)
      setError(err?.message || 'Failed to create folder. Please try again.')
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleConfirm = () => {
    if (!canConfirm || !optionId) return
    onConfirm?.({
      optionId,
      workspaceId,
      folderId,
    })
  }

  return (
    <div className="create-location-modal-overlay" onClick={onClose}>
      <div
        className={`create-location-modal-container accent-${visual.accent}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-location-modal-title"
      >
        <button
          type="button"
          className="create-location-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="create-location-modal-body">
          <div className="create-location-modal-content">
            <div className="create-location-modal-heading">
              <p className="create-location-modal-eyebrow">{visual.eyebrow}</p>
              <h3 id="create-location-modal-title">Choose Workspace</h3>
              <p className="create-location-modal-subtitle">{visual.subtitle}</p>

              {option?.title && (
                <div className={`create-location-modal-pill accent-${visual.accent}`}>
                  <span className="create-location-modal-pill-icon" aria-hidden="true">
                    <OptionIcon size={14} />
                  </span>
                  <span>{option.title}</span>
                </div>
              )}
            </div>

            <div className="create-location-modal-fields">
              <ModalSelect
                id="create-location-workspace"
                label="Workspace"
                helper="Where should this project live?"
                icon={LayoutGrid}
                value={workspaceId}
                options={workspaceOptions}
                placeholder="Select a workspace"
                emptyLabel="No workspaces available"
                loading={workspaceLoading}
                disabled={workspaceLoading}
                open={openSelect === 'workspace'}
                onOpenChange={(next) => setOpenSelect(next ? 'workspace' : null)}
                onChange={(id) => {
                  setWorkspaceId(id)
                  setFolderId('')
                  setShowInlineWorkspaceCreate(false)
                  setShowInlineFolderCreate(false)
                  setOpenSelect('folder')
                }}
                createActionLabel="+ Create New Workspace"
                onCreateAction={() => {
                  setShowInlineWorkspaceCreate(true)
                  setShowInlineFolderCreate(false)
                  setOpenSelect(null)
                }}
              />

              {showInlineWorkspaceCreate && (
                <div className="create-location-inline-row">
                  <input
                    className="create-location-inline-input"
                    type="text"
                    placeholder="New workspace name"
                    value={newWorkspaceName}
                    onChange={(event) => setNewWorkspaceName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleCreateWorkspaceInline()
                      }
                    }}
                    autoFocus
                    disabled={creatingWorkspace}
                  />
                  <button
                    type="button"
                    className="create-location-btn create-location-btn-primary"
                    onClick={handleCreateWorkspaceInline}
                    disabled={creatingWorkspace || !newWorkspaceName.trim()}
                  >
                    {creatingWorkspace ? 'Creating…' : 'Create'}
                  </button>
                </div>
              )}

              <ModalSelect
                id="create-location-folder"
                label="Folder"
                helper="Pick a folder inside that workspace"
                icon={FolderOpen}
                value={folderId}
                options={folderOptions}
                placeholder={workspaceId ? 'Select a folder' : 'Select a workspace first'}
                emptyLabel="No folders in this workspace"
                loading={folderLoading}
                disabled={!workspaceId || folderLoading}
                open={openSelect === 'folder'}
                onOpenChange={(next) => setOpenSelect(next ? 'folder' : null)}
                onChange={(id) => {
                  setFolderId(id)
                  setShowInlineFolderCreate(false)
                  setOpenSelect(null)
                }}
                createActionLabel={workspaceId ? '+ Create New Folder' : ''}
                onCreateAction={() => {
                  setShowInlineFolderCreate(true)
                  setOpenSelect(null)
                }}
              />

              {showInlineFolderCreate && (
                <div className="create-location-inline-row">
                  <input
                    className="create-location-inline-input"
                    type="text"
                    placeholder="New folder name"
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleCreateFolderInline()
                      }
                    }}
                    autoFocus
                    disabled={creatingFolder || !workspaceId}
                  />
                  <button
                    type="button"
                    className="create-location-btn create-location-btn-primary"
                    onClick={handleCreateFolderInline}
                    disabled={creatingFolder || !workspaceId || !newFolderName.trim()}
                  >
                    {creatingFolder ? 'Creating…' : 'Create'}
                  </button>
                </div>
              )}
            </div>

            <div
              className={`create-location-path ${selectedWorkspace && selectedFolder ? 'is-ready' : ''}`}
              aria-live="polite"
            >
              <span className="create-location-path-label">Saving to</span>
              <div className="create-location-path-trail">
                <span className="create-location-path-chip">
                  <LayoutGrid size={13} aria-hidden="true" />
                  {selectedWorkspace?.name || 'Workspace'}
                </span>
                <span className="create-location-path-sep" aria-hidden="true">
                  /
                </span>
                <span className="create-location-path-chip">
                  <FolderOpen size={13} aria-hidden="true" />
                  {selectedFolder?.name || 'Folder'}
                </span>
              </div>
            </div>

            {error && <p className="create-location-modal-error">{error}</p>}

            <div className="create-location-modal-actions">
              <button
                type="button"
                className="create-location-btn create-location-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="create-location-btn create-location-btn-primary"
                onClick={handleConfirm}
                disabled={!canConfirm}
              >
                Continue
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className={`create-location-modal-visual accent-${visual.accent}`} aria-hidden="true">
            <div className="create-location-modal-visual-orb create-location-modal-visual-orb--1" />
            <div className="create-location-modal-visual-orb create-location-modal-visual-orb--2" />
            <div className="create-location-modal-visual-frame">
              <img src={visual.image} alt="" className="create-location-modal-visual-image" />
            </div>
            <div className="create-location-modal-visual-copy">
              <p className="create-location-modal-visual-title">Organized from the start</p>
              <p className="create-location-modal-visual-caption">{visual.caption}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CreateLocationModal
