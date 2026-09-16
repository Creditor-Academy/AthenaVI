import { useCallback, useEffect, useRef, useState } from 'react'
import presentationService, {
  PresentationConflictError,
} from '../../../services/presentationService'
import { normalizePresenceCursor } from '../../../utils/pptShareSession'

const HEARTBEAT_MS = 12000
const leaveTokenKey = (presentationId) => `athenavi:ppt-present-leave-token:${presentationId}`

function readLeaveToken(presentationId) {
  if (!presentationId) return ''
  try {
    return sessionStorage.getItem(leaveTokenKey(presentationId)) || ''
  } catch {
    return ''
  }
}

function writeLeaveToken(presentationId, token) {
  if (!presentationId) return
  try {
    if (token) sessionStorage.setItem(leaveTokenKey(presentationId), token)
    else sessionStorage.removeItem(leaveTokenKey(presentationId))
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Member-side "who is presenting" lock + follow cursor for Present mode.
 * First member to send `presenting: true` wins (409 for everyone else — the
 * response names the current holder so the UI can show it instead of stealing
 * the cursor). Every heartbeat re-sends the caller's current intent, since the
 * backend defaults `presenting` to false and releases the lock when it's omitted.
 */
export default function usePresentationPresenter({
  workspaceId,
  presentationId,
  enabled = false,
  getSlideIndex,
}) {
  const [presenter, setPresenter] = useState(null)
  const [isPresenting, setIsPresenting] = useState(false)
  const [conflict, setConflict] = useState(null)

  const wantPresentingRef = useRef(false)
  const leaveTokenRef = useRef(readLeaveToken(presentationId))
  const getSlideIndexRef = useRef(getSlideIndex)
  useEffect(() => {
    getSlideIndexRef.current = getSlideIndex
  }, [getSlideIndex])

  const sendHeartbeat = useCallback(async () => {
    if (!workspaceId || !presentationId) return
    const slideIndex = Number(getSlideIndexRef.current?.()) || 0
    try {
      const data = await presentationService.heartbeatPresence(workspaceId, presentationId, {
        slideIndex,
        presenting: wantPresentingRef.current,
      })
      setConflict(null)
      setIsPresenting(wantPresentingRef.current)
      if (data?.leaveToken) {
        leaveTokenRef.current = data.leaveToken
        writeLeaveToken(presentationId, data.leaveToken)
      }
      setPresenter(normalizePresenceCursor(data?.presenter || null))
    } catch (err) {
      if (err instanceof PresentationConflictError) {
        wantPresentingRef.current = false
        setIsPresenting(false)
        const info = Array.isArray(err.data?.errors) ? err.data.errors[0] : null
        setConflict({
          presentingUserId: info?.presentingUserId || null,
          displayName: info?.displayName || err.data?.message || 'Someone else',
        })
      }
      // Other transient errors (network blips) just get retried on the next tick.
    }
  }, [workspaceId, presentationId])

  useEffect(() => {
    if (!enabled || !workspaceId || !presentationId) return undefined
    let cancelled = false
    let timer = null

    const tick = async () => {
      if (cancelled) return
      await sendHeartbeat()
      if (!cancelled) timer = window.setTimeout(tick, HEARTBEAT_MS)
    }
    tick()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [enabled, workspaceId, presentationId, sendHeartbeat])

  useEffect(() => {
    if (!enabled) return undefined
    const leave = () => {
      if (leaveTokenRef.current) {
        presentationService.leavePresence(workspaceId, presentationId, leaveTokenRef.current)
      }
    }
    window.addEventListener('pagehide', leave)
    window.addEventListener('beforeunload', leave)
    return () => {
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('beforeunload', leave)
      leave()
      wantPresentingRef.current = false
      setIsPresenting(false)
    }
  }, [enabled, workspaceId, presentationId])

  const startPresenting = useCallback(() => {
    wantPresentingRef.current = true
    setConflict(null)
    sendHeartbeat()
  }, [sendHeartbeat])

  const stopPresenting = useCallback(() => {
    wantPresentingRef.current = false
    setIsPresenting(false)
    sendHeartbeat()
  }, [sendHeartbeat])

  return { presenter, isPresenting, conflict, startPresenting, stopPresenting }
}
