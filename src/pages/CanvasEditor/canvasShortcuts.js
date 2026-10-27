/**
 * Shortcuts the canvas keyboard handler already implements.
 * The "?" popover renders this list; keep it in step with CanvasEditor.jsx.
 */
export const CANVAS_SHORTCUTS = [
  { keys: '?', label: 'Show or hide these shortcuts' },
  { keys: 'Ctrl/Cmd + Z', label: 'Undo' },
  { keys: 'Ctrl/Cmd + Shift + Z, Ctrl/Cmd + Y', label: 'Redo' },
  { keys: 'Ctrl/Cmd + K', label: 'Quick menu' },
  { keys: 'Ctrl/Cmd + = or +', label: 'Zoom in' },
  { keys: 'Ctrl/Cmd + -', label: 'Zoom out' },
  { keys: 'Escape', label: 'End text edit, or clear the selection' },
  { keys: 'Ctrl/Cmd + C', label: 'Copy' },
  { keys: 'Ctrl/Cmd + X', label: 'Cut' },
  { keys: 'Ctrl/Cmd + V', label: 'Paste' },
  { keys: 'Ctrl/Cmd + D', label: 'Duplicate' },
  { keys: 'Ctrl/Cmd + A', label: 'Select all' },
  { keys: 'Ctrl/Cmd + G', label: 'Group' },
  { keys: 'Ctrl/Cmd + Shift + G', label: 'Ungroup' },
  { keys: 'Ctrl/Cmd + L', label: 'Lock or unlock' },
  { keys: 'Delete, Backspace', label: 'Delete' },
  { keys: 'Arrow keys', label: 'Nudge 1 px (Shift for 10 px)' },
  { keys: ']', label: 'Bring forward' },
  { keys: 'Ctrl/Cmd + Shift + ]', label: 'Bring to front' },
  { keys: '[', label: 'Send backward' },
  { keys: 'Ctrl/Cmd + Shift + [', label: 'Send to back' },
]

/** "?" / Shift+/ when no modifier other than Shift is held. */
export function isShortcutHelpKey(event) {
  if (!event || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return false
  return event.key === '?' || (event.shiftKey && event.key === '/')
}
