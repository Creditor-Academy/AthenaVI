import { useEffect, useRef, useState } from 'react'
import publicPresentationService from '../../../services/publicPresentationService'
import presentationService, { PresentationRateLimitError } from '../../../services/presentationService'
import {
  extractPresencePayload,
  extractShareToken,
  getOrCreateViewerSessionId,
  mergePresenceViewers,
} from '../../../utils/pptShareSession'

const DEFAULT_INTERVAL_MS = 8000

function mergePresence(current, incoming) {
  if (!incoming) return current
  const rawCount =
    (current?.viewers || []).length + (incoming.viewers || []).length
  const viewers = mergePresenceViewers(current?.viewers, incoming.viewers)
  const collapsed = Math.max(0, rawCount - viewers.length)
  const reported = Math.max(
    Number(incoming.viewerCount) || 0,
    Number(current?.viewerCount) || 0
  )
  return {
    viewers,
    viewerCount: Math.max(viewers.length, reported - collapsed),
    contentUpdatedAt: incoming.contentUpdatedAt || current?.contentUpdatedAt || null,
    token: incoming.token || current?.token || '',
    url: incoming.url || current?.url || '',
  }
}

export default function usePptPresence({
  token,
  workspaceId,
  presentationId,
  slideIndex = 0,
  enabled = true,
  onShareToken,
}) {
  const [viewers, setViewers] = useState([])
  const [viewerCount, setViewerCount] = useState(0)
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const slideIndexRef = useRef(slideIndex)
  const renderedVersion = useRef(null)
  const onShareTokenRef = useRef(onShareToken)

  slideIndexRef.current = slideIndex
  onShareTokenRef.current = onShareToken

  useEffect(() => {
    if (!enabled) return undefined
    if (!token && !(workspaceId && presentationId)) return undefined

    const viewerSessionId = getOrCreateViewerSessionId()
    let cancelled = false
    let timer = null
    let delay = DEFAULT_INTERVAL_MS

    const beat = async () => {
      if (cancelled) return
      let next = { viewers: [], viewerCount: 0, contentUpdatedAt: null, token: '', url: '' }
      const index = Number.isFinite(Number(slideIndexRef.current)) ? Number(slideIndexRef.current) : 0

      if (token) {
        try {
          const putResult = await publicPresentationService.putPresence(token, {
            viewerSessionId,
            slideIndex: index,
          })
          next = mergePresence(next, extractPresencePayload(putResult.data || putResult))
          if (!next.viewers.length) {
            try {
              const listed = await publicPresentationService.getPresence(token)
              next = mergePresence(next, extractPresencePayload(listed.data || listed))
            } catch {
              /* GET presence is optional */
            }
          }
        } catch (err) {
          if (err instanceof PresentationRateLimitError) {
            delay = err.retryAfterMs || 20000
          }
        }
      }

      if (workspaceId && presentationId) {
        try {
          const listed = await presentationService.pollSharePresence(workspaceId, presentationId, {
            viewerSessionId,
            slideIndex: index,
          })
          next = mergePresence(next, extractPresencePayload(listed))
          const recovered = extractShareToken(next.token || next.url)
          if (recovered) onShareTokenRef.current?.(recovered)
        } catch (err) {
          if (err instanceof PresentationRateLimitError) {
            delay = err.retryAfterMs || 20000
          }
        }
      }

      if (!cancelled) {
        setViewers(next.viewers)
        setViewerCount(next.viewerCount)
        if (next.contentUpdatedAt && next.contentUpdatedAt !== renderedVersion.current) {
          renderedVersion.current = next.contentUpdatedAt
          setContentUpdatedAt(next.contentUpdatedAt)
        }
        delay = delay === DEFAULT_INTERVAL_MS ? DEFAULT_INTERVAL_MS : delay
      }

      if (!cancelled) {
        timer = window.setTimeout(() => {
          delay = DEFAULT_INTERVAL_MS
          beat()
        }, delay)
      }
    }

    beat()

    const leave = () => {
      if (token) publicPresentationService.leavePresence(token, viewerSessionId)
    }
    window.addEventListener('pagehide', leave)
    window.addEventListener('beforeunload', leave)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('beforeunload', leave)
    }
  }, [token, workspaceId, presentationId, enabled])

  return { viewers, viewerCount, contentUpdatedAt }
}
