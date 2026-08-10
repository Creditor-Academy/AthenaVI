import { useCallback, useRef, useState } from 'react'

const MAX_HISTORY = 50

function readFlags(pastRef, futureRef) {
  return {
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  }
}

/**
 * Client-side undo/redo for PPT slide state snapshots.
 */
export function usePptEditorHistory() {
  const pastRef = useRef([])
  const futureRef = useRef([])
  const [{ canUndo, canRedo }, setFlags] = useState({ canUndo: false, canRedo: false })

  const syncFlags = () => setFlags(readFlags(pastRef, futureRef))

  const pushSnapshot = useCallback((snapshot) => {
    pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), snapshot]
    futureRef.current = []
    syncFlags()
  }, [])

  const undo = useCallback((currentSnapshot) => {
    if (!pastRef.current.length) return null
    const prev = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    futureRef.current = [currentSnapshot, ...futureRef.current]
    syncFlags()
    return prev
  }, [])

  const redo = useCallback((currentSnapshot) => {
    if (!futureRef.current.length) return null
    const next = futureRef.current[0]
    futureRef.current = futureRef.current.slice(1)
    pastRef.current = [...pastRef.current, currentSnapshot]
    syncFlags()
    return next
  }, [])

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: () => {
      pastRef.current = []
      futureRef.current = []
      syncFlags()
    },
  }
}
