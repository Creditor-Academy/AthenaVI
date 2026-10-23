import { useEffect, useMemo, useState } from 'react'
import CanvasEditor from './CanvasEditor'
import CanvasSizeModal from './CanvasSizeModal'
import CanvasNameModal from './CanvasNameModal'
import { defaultDesignName } from './canvasNameStep'
import workspaceService from '../../services/workspaceService'
import { normalizeCanvasSize } from '../../constants/canvasSizePresets'
import './CanvasEditor.css'

export default function CanvasBuilder({
  onBack,
  initialWorkspaceId,
  initialFolderId,
  initialCanvasId = null,
  createContext = null,
  initialSize = null,
  onCanvasCreated = null,
}) {
  const canvasId = initialCanvasId || createContext?.canvasId || null
  const workspaceId =
    initialWorkspaceId || createContext?.workspaceId || createContext?.initialWorkspaceId || null
  const folderId = initialFolderId || createContext?.folderId || createContext?.initialFolderId || null

  const [size, setSize] = useState(() => (initialSize ? normalizeCanvasSize(initialSize) : null))
  // New designs are named first (null = name step still pending); reopened ones keep their name.
  const [title, setTitle] = useState(null)

  const canCheckNames = Boolean(!canvasId && workspaceId && folderId)
  const [folderProjects, setFolderProjects] = useState([])
  const [namesLoading, setNamesLoading] = useState(canCheckNames)
  const [namesFailed, setNamesFailed] = useState(false)

  useEffect(() => {
    if (!canCheckNames) return undefined
    let cancelled = false
    workspaceService
      .listProjectsInFolder(workspaceId, folderId)
      .then((projects) => {
        if (!cancelled) setFolderProjects(projects || [])
      })
      .catch(() => {
        if (!cancelled) setNamesFailed(true)
      })
      .finally(() => {
        if (!cancelled) setNamesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [canCheckNames, workspaceId, folderId])

  const suggestedName = useMemo(() => defaultDesignName(folderProjects), [folderProjects])

  if (!canvasId && title === null) {
    return (
      <div className="canvas-editor-page canvas-editor-page--create">
        <CanvasNameModal
          initialName={suggestedName}
          projects={folderProjects}
          loading={namesLoading}
          loadFailed={namesFailed}
          onVerify={
            canCheckNames
              ? (name) => workspaceService.verifyProjectNameInFolder(workspaceId, folderId, name)
              : undefined
          }
          onCancel={onBack}
          onContinue={(name) => setTitle(name)}
        />
      </div>
    )
  }

  // Reopening a saved canvas: its size comes from the stored document, not the picker.
  if (!size && !canvasId) {
    return (
      <div className="canvas-editor-page canvas-editor-page--create">
        <CanvasSizeModal
          confirmLabel="Create Canvas"
          title="Choose canvas size"
          subtitle="Pick a format or enter custom dimensions. You can change this later in the editor."
          eyebrow="Canvas Editor"
          onCancel={() => setTitle(null)}
          onCreate={(nextSize) => setSize(normalizeCanvasSize(nextSize))}
        />
      </div>
    )
  }

  return (
    <CanvasEditor
      onBack={onBack}
      initialSize={size}
      {...(title ? { title } : {})}
      workspaceId={workspaceId}
      folderId={folderId}
      canvasId={canvasId}
      onCanvasCreated={onCanvasCreated}
    />
  )
}
