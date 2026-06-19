import { useState, useEffect } from 'react'
import { Play, Video, X, Sparkles, ShieldCheck } from 'lucide-react'
import heygenService from '../../services/heygenService'
import AvatarConsentStep, { avatarNeedsConsentFlow } from '../../components/ui/AvatarConsentStep/AvatarConsentStep'
import {
  extractHeygenList,
  filterAvatarIvLooks,
  formatAvatarTypeLabel,
  getConsentUrlFromResponse,
  getLookId,
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

  // Fetch looks when a group is selected
  useEffect(() => {
    if (selectedAvatar) {
      if (selectedAvatar.rawLooks && selectedAvatar.rawLooks.length > 0) {
        const compatible = filterAvatarIvLooks(selectedAvatar.rawLooks);
        const mapped = compatible.map(look => ({
          id: getLookId(look),
          name: look.avatar_name || look.name || selectedAvatar.name,
          image: look.preview_image_url || look.thumbnail_url || look.image_url || selectedAvatar.image,
          preview: look.preview_video_url || selectedAvatar.preview,
          avatarType: look.avatar_type || look.avatarType,
        })).filter(look => look.id);
        setActiveLooks(mapped);
        setSelectedLook(mapped[0] || null);
        if (mapped.length === 0) {
          setDebugLooksInfo('No Avatar IV–compatible looks for this character.');
        }
      } else {
        // Fetch if not embedded
        const fetchLooks = async () => {
          setLoadingLooks(true);
          try {
            const res = await heygenService.getAvatarLooks({ group_id: selectedAvatar.id, limit: 20 });
            const lookList = extractHeygenList(res, ['avatar_looks', 'looks', 'avatars']);
            const compatible = filterAvatarIvLooks(lookList);
            
            if (!compatible.length) {
               setDebugLooksInfo('No Avatar IV–compatible looks for this character.');
            } else {
               setDebugLooksInfo('');
            }
            
            const mapped = compatible.map(look => ({
              id: getLookId(look),
              name: look.avatar_name || look.name || selectedAvatar.name,
              image: look.preview_image_url || look.thumbnail_url || look.image_url || selectedAvatar.image,
              preview: look.preview_video_url || selectedAvatar.preview,
              avatarType: look.avatar_type || look.avatarType,
            })).filter(look => look.id);
            setActiveLooks(mapped);
            if (mapped.length > 0) setSelectedLook(mapped[0]);
          } catch (e) {
            console.error(e);
            setDebugLooksInfo(`API Error: ${e.message}`);
            setActiveLooks([]);
          } finally {
            setLoadingLooks(false);
          }
        };
        fetchLooks();
      }
    }
  }, [selectedAvatar]);

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
    console.log('Creating video from', selectedLook?.name || selectedAvatar.name)
    if (onCreate) {
      onCreate()
    }
    closeDetails()
  }

  if (!selectedAvatar) return null;

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
              {activeLooks.map(look => (
                <div
                  key={look.id}
                  className={`filmstrip-item ${selectedLook?.id === look.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLook(look);
                    setIsPreviewing(false);
                  }}
                >
                  <img src={look.image} alt={look.name} />
                  {look.avatarType && (
                    <span className="filmstrip-type-badge">
                      {formatAvatarTypeLabel(look.avatarType)}
                    </span>
                  )}
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
              className="hero-video"
            />
            <button className="exit-preview-corner" onClick={(e) => { e.stopPropagation(); setIsPreviewing(false); }}>
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
                      onCompleteConsent(selectedAvatar);
                    } else {
                      setShowConsentPanel(true);
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

          <div className="hero-actions">
            {isPrivate && onCreateLooks ? (
              <button type="button" className="btn-action-secondary" onClick={handleCreateLook}>
                <Sparkles size={20} />
                <span>Create look</span>
              </button>
            ) : null}
            <button className="btn-action-primary" onClick={handleCreateVideo}>
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
