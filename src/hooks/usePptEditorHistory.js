import { useCallback, useMemo, useRef, useState } from 'react'

const MAX_HISTORY = 100

function cloneSnapshot(snapshot) {
  if (!snapshot) return null
  try {
    return JSON.parse(JSON.stringify(snapshot))
  } catch {
    return snapshot
  }
}

function readFlags(pastRef, futureRef) {
  return {
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  }
}

/**
 * Client-side undo/redo for PPT slide state snapshots.
 * Snapshots are cloned so later canvas mutations cannot rewrite history.
 */
export function usePptEditorHistory() {
  const pastRef = useRef([])
  const futureRef = useRef([])
  const [{ canUndo, canRedo }, setFlags] = useState({ canUndo: false, canRedo: false })

  const syncFlags = () => setFlags(readFlags(pastRef, futureRef))

  const pushSnapshot = useCallback((snapshot) => {
    const cloned = cloneSnapshot(snapshot)
    if (!cloned) return
    pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), cloned]
    futureRef.current = []
    syncFlags()
  }, [])

  const undo = useCallback((currentSnapshot) => {
    if (!pastRef.current.length) return null
    const prev = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    const current = cloneSnapshot(currentSnapshot)
    if (current) {
      futureRef.current = [current, ...futureRef.current.slice(0, MAX_HISTORY - 1)]
    }
    syncFlags()
    return cloneSnapshot(prev)
  }, [])

  const redo = useCallback((currentSnapshot) => {
    if (!futureRef.current.length) return null
    const next = futureRef.current[0]
    futureRef.current = futureRef.current.slice(1)
    const current = cloneSnapshot(currentSnapshot)
    if (current) {
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), current]
    }
    syncFlags()
    return cloneSnapshot(next)
  }, [])

  const reset = useCallback(() => {
    pastRef.current = []
    futureRef.current = []
    syncFlags()
  }, [])

  return useMemo(
    () => ({
      pushSnapshot,
      undo,
      redo,
      canUndo,
      canRedo,
      reset,
    }),
    [pushSnapshot, undo, redo, canUndo, canRedo, reset]
  )
}
