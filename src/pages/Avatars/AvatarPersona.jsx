import { useState, useEffect } from 'react'
import { Video, X, Sparkles, ShieldCheck } from 'lucide-react'
import { getSanitizedErrorMessage } from '../../utils/userFacingMessage'
import heygenService from '../../services/heygenService'
import AvatarConsentStep, { avatarNeedsConsentFlow } from '../../components/ui/AvatarConsentStep/AvatarConsentStep'
import {
  buildAvatarPresenterSeed,
  canUseAvatarInVideo,
  fetchMappedGroupLooks,
  formatAvatarTypeLabel,
  getAvatarVideoBlockReason,
  getConsentUrlFromResponse,
  mapLookTile,
} from '../../utils/heygenAvatars'

function AvatarPersona({ selectedAvatar, closeDetails, onCreate, onCreateLooks, isPrivate, onCompleteConsent }) {
  const [activeLooks, setActiveLooks] = useState([])
  const [selectedLook, setSelectedLook] = useState(null)
  const [loadingLooks, setLoadingLooks] = useState(false)
  const [debugLooksInfo, setDebugLooksInfo] = useState('')
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [showConsentPanel, setShowConsentPanel] = useState(false)
  const [consentUrl, setConsentUrl] = useState('')

  const needsConsent = isPrivate && avatarNeedsConsentFlow(selectedAvatar)
  const videoBlockReason = getAvatarVideoBlockReason(selectedAvatar, selectedLook)
  const canStartVideo = canUseAvatarInVideo(selectedAvatar, selectedLook)

  useEffect(() => {
    if (!needsConsent || !selectedAvatar?.id) {
      setConsentUrl('')
      return undefined
    }

    let cancelled = false
    heygenService
      .getAvatarConsent(selectedAvatar.id)
      .then((res) => {
        if (!cancelled) setConsentUrl(getConsentUrlFromResponse(res) || '')
      })
      .catch(() => {
        if (!cancelled) setConsentUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [needsConsent, selectedAvatar?.id])

  useEffect(() => {
    if (!selectedAvatar?.id) return undefined

    let cancelled = false

    const fetchLooks = async () => {
      setLoadingLooks(true)
      setDebugLooksInfo('')
      try {
        const { mappedLooks } = await fetchMappedGroupLooks(heygenService, selectedAvatar, {
          ownership: isPrivate ? 'private' : 'public',
          limit: 20,
        })

        if (cancelled) return

        const mapped = mappedLooks
          .map((look) => {
            const tile = mapLookTile(look, look.name || selectedAvatar.name, look.image || selectedAvatar.image)
            return {
              ...look,
              ...tile,
              preview: look.preview_video_url || selectedAvatar.preview,
            }
          })
          .filter((look) => look.id)

        setActiveLooks(mapped)
        const firstReady = mapped.find((look) => look.ready) || mapped[0] || null
        setSelectedLook(firstReady)

        if (mapped.length === 0) {
          setDebugLooksInfo('No supported looks for this character — try creating a look.')
        }
      } catch (e) {
        if (cancelled) return
        console.error(e)
        setDebugLooksInfo(`API Error: ${getSanitizedErrorMessage(e, 'Request failed')}`)
        setActiveLooks([])
        setSelectedLook(null)
      } finally {
        if (!cancelled) setLoadingLooks(false)
      }
    }

    fetchLooks()
    return () => {
      cancelled = true
    }
  }, [selectedAvatar, isPrivate])

  const handleCreateLook = () => {
    if (!onCreateLooks || !selectedAvatar?.id) return
    onCreateLooks({
      groupId: selectedAvatar.id,
      lookId: selectedLook?.id || activeLooks[0]?.id || null,
      name: selectedAvatar.name,
      previewImage: selectedLook?.image || selectedAvatar.image,
    })
  }

  const handleCreateVideo = () => {
    if (!canStartVideo || !onCreate) return
    const presenterSeed = buildAvatarPresenterSeed(selectedAvatar, selectedLook)
    onCreate({ presenterSeed })
    closeDetails()
  }

  if (!selectedAvatar) return null

  return (
    <div className="hero-showcase-wrapper">
      <div className="hero-top-nav">
        <button className="back-to-library-btn" onClick={closeDetails}>
          <X size={18} /> Close Persona
        </button>
      </div>

      <div className="hero-showcase-card">
        <div className="hero-visual">
          <div className="persona-filmstrip">
            {loadingLooks ? (
              <div style={{ color: 'white', fontSize: '12px', padding: '10px' }}>Loading looks...</div>
            ) : activeLooks.length > 0 ? (
              <div style={{ display: 'flex', gap: '12px' }}>
                {activeLooks.map((look) => (
                  <div
                    key={look.id}
                    className={`filmstrip-item ${selectedLook?.id === look.id ? 'active' : ''}${look.ready ? '' : ' filmstrip-item--pending'}`}
                    onClick={() => {
                      setSelectedLook(look)
                      setIsPreviewing(false)
                    }}
                    title={look.ready ? look.name : `${look.name} (processing)`}
                  >
                    <img src={look.image} alt={look.name} />
                    {look.avatarType ? (
                      <span className="filmstrip-type-badge">
                        {formatAvatarTypeLabel(look.avatarType)}
                      </span>
                    ) : null}
                    {!look.ready ? (
                      <span className="filmstrip-status-badge">Processing</span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#ff8a8a', fontSize: '11px', padding: '4px', maxWidth: '300px', textAlign: 'center' }}>
                {debugLooksInfo || 'No sub-looks available'}
              </div>
            )}
          </div>

          {!isPreviewing ? (
            <div className="hero-still" onClick={() => setIsPreviewing(true)}>
              <img src={selectedLook?.image || selectedAvatar.image} alt={selectedLook?.name || selectedAvatar.name} />
            </div>
          ) : (
            <div className="hero-motion">
              <video
                src={selectedLook?.preview || selectedAvatar.preview}
                autoPlay
                loop
                muted
                playsInline
                className="hero-video"
              />
              <button className="exit-preview-corner" onClick={(e) => { e.stopPropagation(); setIsPreviewing(false) }}>
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="hero-details">
          <div className="hero-glass-pan">
            <div className="hero-top-meta">Unit {selectedLook?.id || selectedAvatar.id} // v4.2</div>
            <h1 className="hero-title">{selectedLook?.name || selectedAvatar.name}</h1>
            <div className="hero-badge">{selectedAvatar.category} Model</div>

            <p className="hero-bio">{selectedAvatar.description}</p>

            {needsConsent ? (
              <div className="avatars-persona-consent">
                <div className="avatars-persona-consent__header">
                  <ShieldCheck size={18} />
                  <span>Consent required before this Digital Twin can be used</span>
                </div>
                {showConsentPanel ? (
                  <AvatarConsentStep
                    groupId={selectedAvatar.id}
                    avatarName={selectedAvatar.name}
                    consentUrl={consentUrl}
                    consentStatus={selectedAvatar.consentStatus}
                    onComplete={() => setShowConsentPanel(false)}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn-action-secondary avatars-persona-consent__btn"
                    onClick={() => {
                      if (onCompleteConsent) {
                        onCompleteConsent(selectedAvatar)
                      } else {
                        setShowConsentPanel(true)
                      }
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>Complete consent</span>
                  </button>
                )}
              </div>
            ) : null}

            <div className="hero-specs">
              <div className="spec-tile">
                <label>Oral Expression</label>
                <span>{selectedAvatar.style}</span>
              </div>
              <div className="spec-tile">
                <label>Quality Score</label>
                <span>{selectedAvatar.rating} Index</span>
              </div>
              <div className="spec-tile">
                <label>Integration</label>
                <span>Athena Ready</span>
              </div>
            </div>

            {!canStartVideo && videoBlockReason && !needsConsent ? (
              <p className="avatars-persona-video-hint" role="status">
                {videoBlockReason}
              </p>
            ) : null}

            <div className="hero-actions">
              {isPrivate && onCreateLooks ? (
                <button type="button" className="btn-action-secondary" onClick={handleCreateLook}>
                  <Sparkles size={20} />
                  <span>Create look</span>
                </button>
              ) : null}
              <button
                type="button"
                className="btn-action-primary"
                onClick={handleCreateVideo}
                disabled={!canStartVideo}
                title={!canStartVideo ? videoBlockReason || 'Not ready for video' : undefined}
              >
                <Video size={22} />
                <span>Start Video with this Avatar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarPersona
