import { useCallback, useEffect, useRef, useState } from 'react'
import AIPptEditor from '../AIPptComponents/AIPptEditor'
import publicPresentationService, {
  PresentationShareUnavailableError,
} from '../../../services/publicPresentationService'
import { PresentationRateLimitError } from '../../../services/presentationService'
import { extractShareToken } from '../../../utils/pptShareSession'
import { getPublicPresentationToken } from '../../../utils/authRouting'
import { extractSlidesFromPresentation } from '../../../utils/presentationHelpers'
import '../AIPptComponents/pptPanelUi.css'

function setNoReferrerMeta() {
  let meta = document.querySelector('meta[name="referrer"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'referrer')
    document.head.appendChild(meta)
  }
  const previous = meta.getAttribute('content')
  meta.setAttribute('content', 'no-referrer')
  return () => {
    if (previous) meta.setAttribute('content', previous)
    else meta.remove()
  }
}

export default function PublicPresentation() {
  const token = extractShareToken(getPublicPresentationToken()) || getPublicPresentationToken()
  const [deck, setDeck] = useState(null)
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const etagRef = useRef('')
  const loadedRef = useRef(false)

  useEffect(() => {
    document.title = 'Shared presentation'
    return setNoReferrerMeta()
  }, [])

  const loadDeck = useCallback(
    async ({ withSession = false } = {}) => {
      if (!token) {
        setError("This link isn’t available")
        setLoading(false)
        return
      }
      try {
        const result = await publicPresentationService.getDeck(token, { etag: etagRef.current })
        if (!result.notModified && result.data) {
          setDeck(result.data)
          loadedRef.current = true
          if (result.etag) etagRef.current = result.etag
        }
        if (withSession) {
          try {
            const sessionResult = await publicPresentationService.getSession(token)
            setSession(sessionResult.data || null)
          } catch {
            /* session is optional — still show the deck */
          }
        }
        setError('')
      } catch (err) {
        if (loadedRef.current) return
        if (err instanceof PresentationShareUnavailableError) {
          setError("This link isn’t available")
          setDeck(null)
        } else if (err instanceof PresentationRateLimitError) {
          setError(err.message || 'Too many requests. Please wait and try again.')
        } else {
          setError(err.message || "This link isn’t available")
        }
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  useEffect(() => {
    loadDeck({ withSession: true })
  }, [loadDeck])

  const handleContentUpdated = useCallback(() => {
    loadDeck()
  }, [loadDeck])

  const handleOpenInEditor = () => {
    const workspaceId = session?.workspaceId || deck?.workspaceId || deck?.workspace?.id
    const presentationId =
      session?.presentationId || deck?.presentationId || deck?.id || deck?.presentation?.id
    if (!workspaceId || !presentationId) return
    window.location.assign(
      `/dashboard/editor?workspaceId=${encodeURIComponent(workspaceId)}&presentationId=${encodeURIComponent(presentationId)}`
    )
  }

  if (loading) {
    return (
      <div className="aig-editor-container fade-in" style={{ placeItems: 'center', display: 'grid' }}>
        <div className="aig-spinner" />
        <p>Loading presentation…</p>
      </div>
    )
  }

  if (error && !deck) {
    return (
      <div className="aig-editor-container fade-in" style={{ placeItems: 'center', display: 'grid', padding: 32 }}>
        <h1 className="ppt-editor-modal-title" style={{ marginBottom: 8 }}>
          This link isn’t available
        </h1>
        <p className="ppt-editor-modal-lead" style={{ textAlign: 'center', maxWidth: 420 }}>
          It may have been turned off, reset, or expired. Ask the owner for a new link.
        </p>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="aig-editor-container fade-in" style={{ placeItems: 'center', display: 'grid', padding: 32 }}>
        <h1 className="ppt-editor-modal-title" style={{ marginBottom: 8 }}>
          This link isn’t available
        </h1>
      </div>
    )
  }

  return (
    <AIPptEditor
      viewOnly
      outline={extractSlidesFromPresentation(deck)}
      initialDeck={deck}
      presenceToken={token}
      workspaceId={session?.workspaceId || deck?.workspaceId}
      presentationId={session?.presentationId || deck?.presentationId || deck?.id}
      canOpenInEditor={Boolean(session?.canOpenInEditor)}
      onOpenInEditor={handleOpenInEditor}
      onContentUpdated={handleContentUpdated}
      onBack={() => window.location.assign('/')}
      generatingBanner="Updating… newer slides will appear as they finish"
    />
  )
}
