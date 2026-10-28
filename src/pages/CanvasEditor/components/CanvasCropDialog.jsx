import { useRef } from 'react'
import { useCanvasDialogFocus } from '../canvasDialogFocus'

/**
 * Focus trap around the shared image-crop modal.
 * The modal itself lives under src/pages/Slides/ and stays frozen.
 */
export default function CanvasCropDialog({ onClose, children }) {
  const rootRef = useRef(null)
  useCanvasDialogFocus(rootRef, { onEscape: onClose })
  return (
    <div ref={rootRef} className="canvas-crop-dialog-scope">
      {children}
    </div>
  )
}
