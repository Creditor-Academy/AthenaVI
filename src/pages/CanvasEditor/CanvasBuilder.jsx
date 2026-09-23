import { useState } from 'react'
import CanvasEditor from './CanvasEditor'
import CanvasSizeModal from './CanvasSizeModal'
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
  const [size, setSize] = useState(() => (initialSize ? normalizeCanvasSize(initialSize) : null))

  // Reopening a saved canvas: its size comes from the stored document, not the picker.
  if (!size && !canvasId) {
    return (
      <div className="canvas-editor-page canvas-editor-page--create">
        <CanvasSizeModal
          confirmLabel="Create Canvas"
          title="Choose canvas size"
          subtitle="Pick a format or enter custom dimensions. You can change this later in the editor."
          eyebrow="Canvas Editor"
          onCancel={onBack}
          onCreate={(nextSize) => setSize(normalizeCanvasSize(nextSize))}
        />
      </div>
    )
  }

  return (
    <CanvasEditor
      onBack={onBack}
      initialSize={size}
      workspaceId={
        initialWorkspaceId || createContext?.workspaceId || createContext?.initialWorkspaceId || null
      }
      folderId={initialFolderId || createContext?.folderId || createContext?.initialFolderId || null}
      canvasId={canvasId}
      onCanvasCreated={onCanvasCreated}
    />
  )
}
