import { useDragResize } from '../../../../hooks/useDragResize'

/**
 * Draggable separator to resize adjacent panels.
 * @param {'x' | 'y'} axis
 * @param {(delta: number) => void} onResize
 * @param {() => void} [onResizeEnd]
 * @param {'start' | 'end' | 'top' | 'bottom'} edge - visual placement
 */
const PanelResizeHandle = ({ axis, onResize, onResizeEnd, edge = 'start', className = '' }) => {
  const { onPointerDown } = useDragResize({
    axis,
    onDelta: onResize,
    onDragEnd: onResizeEnd,
  })

  return (
    <div
      role="separator"
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      aria-label={axis === 'x' ? 'Resize sidebar width' : 'Resize timeline height'}
      className={`panel-resize-handle panel-resize-handle--${axis} panel-resize-handle--${edge} ${className}`.trim()}
      onPointerDown={onPointerDown}
    />
  )
}

export default PanelResizeHandle
