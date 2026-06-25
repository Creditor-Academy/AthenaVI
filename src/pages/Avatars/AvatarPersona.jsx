import { useState, useEffect } from 'react'
import { MdArrowBack } from 'react-icons/md'
import { Sparkles, ShieldCheck, Trash2, Palette, Loader2 } from 'lucide-react'
import { getSanitizedErrorMessage } from '../../utils/userFacingMessage'
import heygenService from '../../services/heygenService'
import AvatarConsentStep, { avatarNeedsConsentFlow } from '../../components/ui/AvatarConsentStep/AvatarConsentStep'
import {
  fetchMappedGroupLooks,
  getConsentUrlFromResponse,
  mapLookTile,
} from '../../utils/heygenAvatars'
import { getAvatarDeleteMessage } from '../../utils/heygenDelete'
import AvatarPersonaLookCard from './AvatarPersonaLookCard'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import '../Videos/Videos.css'
import './Avatars.css'

function AvatarPersona({
  selectedAvatar,
  closeDetails,
  onCreateLooks,
  isPrivate,
  onCompleteConsent,
  onDeleteAvatar,
  onDeleteLook,
  onOpenConfirm,
}) {
  const [activeLooks, setActiveLooks] = useState([])
  const [selectedLook, setSelectedLook] = useState(null)
  const [loadingLooks, setLoadingLooks] = useState(false)
  const [looksError, setLooksError] = useState('')
  const [showConsentPanel, setShowConsentPanel] = useState(false)
  const [consentUrl, setConsentUrl] = useState('')

  const needsConsent = isPrivate && avatarNeedsConsentFlow(selectedAvatar)
  const canManageLooks = isPrivate && Boolean(onCreateLooks)
  const canDeleteLooks = isPrivate && Boolean(onDeleteLook)
  const lookCount = activeLooks.length
  const displayName = selectedLook?.name || selectedAvatar?.name || 'Avatar'

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
      setLooksError('')
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
            }
          })
          .filter((look) => look.id)

        setActiveLooks(mapped)
        const firstReady = mapped.find((look) => look.ready) || mapped[0] || null
        setSelectedLook(firstReady)

        if (mapped.length === 0) {
          setLooksError('No looks available for this avatar yet.')
        }
      } catch (e) {
        if (cancelled) return
        console.error(e)
        setLooksError(getSanitizedErrorMessage(e, 'Could not load looks'))
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

  const handleSelectLook = (look) => {
    setSelectedLook(look)
  }

  const handleCreateLook = () => {
    if (!onCreateLooks || !selectedAvatar?.id) return
    onCreateLooks({
      groupId: selectedAvatar.id,
      lookId: selectedLook?.id || activeLooks[0]?.id || null,
      name: selectedAvatar.name,
      previewImage: selectedLook?.image || selectedAvatar.image,
    })
  }

  const handleDeleteAvatar = () => {
    if (!isPrivate || !onDeleteAvatar || !onOpenConfirm) return
    onOpenConfirm(
      getAvatarDeleteMessage(selectedAvatar),
      async () => {
        await onDeleteAvatar(selectedAvatar)
      },
      {
        title: 'Delete avatar',
        confirmLabel: 'Delete avatar',
        variant: 'danger',
      }
    )
  }

  const handleDeleteLook = (look, event) => {
    event.stopPropagation()
    if (!canDeleteLooks || !onOpenConfirm || !look?.id) return
    const isLastLook = activeLooks.length <= 1
    onOpenConfirm(
      getAvatarDeleteMessage(selectedAvatar, { isLastLook }),
      async () => {
        const result = await onDeleteLook(selectedAvatar, look, { isLastLook })
        if (result?.cascadedGroupDelete) {
          closeDetails()
          return
        }
        const nextLooks = activeLooks.filter((item) => item.id !== look.id)
        setActiveLooks(nextLooks)
        setSelectedLook((prev) =>
          prev?.id !== look.id ? prev : nextLooks.find((item) => item.ready) || nextLooks[0] || null
        )
      },
      {
        title: 'Delete look',
        confirmLabel: isLastLook ? 'Delete avatar' : 'Delete look',
        variant: 'danger',
      }
    )
  }

  if (!selectedAvatar) return null

  return (
    <div className="videos-page avatars-page avatar-persona-page">
      <div className="videos-shell">
        <header className="videos-page-header avatar-persona-page__header">
          <div className="videos-title-section create-avatar-title-section">
            <div className="create-avatar-title-row">
              <button
                type="button"
                className="workspace-back-btn"
                onClick={closeDetails}
                aria-label="Back to Avatars"
              >
                <MdArrowBack size={20} />
              </button>
              <div>
                <p className="create-avatar-look-page__eyebrow">
                  <Sparkles size={14} />
                  <span>Avatar persona</span>
                </p>
                <h1 className="videos-page-title">{selectedAvatar.name}</h1>
                <p className="videos-page-subtitle">
                  {selectedAvatar.category || 'Avatar'}
                  {' · '}
                  {loadingLooks ? 'Loading looks…' : `${lookCount} look${lookCount === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
          </div>
          {isPrivate && onDeleteAvatar ? (
            <div className="videos-actions avatar-persona-page__header-actions">
              <button
                type="button"
                className="btn-action-danger avatar-persona-page__delete-btn"
                onClick={handleDeleteAvatar}
              >
                <Trash2 size={18} />
                <span>Delete avatar</span>
              </button>
            </div>
          ) : null}
        </header>

        <main className="videos-main avatar-persona-main">
          <div className="avatar-persona-layout">
            <section className="avatar-persona-preview" aria-label="Selected look">
              <div className="workspace-item-card avatar-persona-preview-card">
                <div className="avatar-persona-preview-card__header">
                  <div>
                    <h2 className="avatar-persona-preview-card__title">{displayName}</h2>
                    {selectedLook ? (
                      <p className="avatar-persona-preview-card__hint">Selected look</p>
                    ) : null}
                  </div>
                  {selectedAvatar.category ? (
                    <span className="avatar-persona-preview-card__badge">{selectedAvatar.category}</span>
                  ) : null}
                </div>

                <div className="avatar-persona-preview-card__media">
                  {needsConsent ? (
                    <div className="avatar-persona-preview-card__consent-overlay">
                      <ShieldCheck size={28} />
                      <p>Complete consent to use this Digital Twin</p>
                    </div>
                  ) : null}

                  <div className="avatar-persona-preview-card__image-wrap">
                    <img
                      src={selectedLook?.image || selectedAvatar.image}
                      alt={displayName}
                    />
                  </div>
                </div>
              </div>
            </section>

            <aside className="avatar-persona-sidebar">
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

              <section className="avatar-persona-looks-section" aria-labelledby="avatar-looks-heading">
                <div className="avatar-persona-looks-section__header">
                  <div>
                    <h2 id="avatar-looks-heading" className="videos-group__heading">
                      <Palette size={16} aria-hidden="true" />
                      Avatar looks
                    </h2>
                    <p className="avatar-persona-looks-section__subheading">
                      Manage looks — view, create, and delete styles for this avatar
                    </p>
                  </div>
                  {canManageLooks ? (
                    <button
                      type="button"
                      className="btn-secondary videos-create-btn avatar-persona-looks-section__create"
                      onClick={handleCreateLook}
                    >
                      <Sparkles size={16} />
                      <span>Create look</span>
                    </button>
                  ) : null}
                </div>

                {loadingLooks ? (
                  <div className="avatar-persona-looks-loading" role="status">
                    <Loader2 size={20} className="spin-animation" />
                    <span>Loading looks…</span>
                  </div>
                ) : looksError && lookCount === 0 ? (
                  <div className="videos-empty-state">
                    <div className="videos-empty-state__card">
                      <div className="videos-empty-state__icon-wrap">
                        <Palette size={24} />
                      </div>
                      <p className="videos-empty-state__eyebrow">Avatar looks</p>
                      <h3 className="videos-empty-state__title">No looks yet</h3>
                      <p className="videos-empty-state__description">{looksError}</p>
                    </div>
                  </div>
                ) : lookCount === 0 ? (
                  <div className="videos-empty-state">
                    <div className="videos-empty-state__card">
                      <div className="videos-empty-state__icon-wrap">
                        <Palette size={24} />
                      </div>
                      <p className="videos-empty-state__eyebrow">Avatar looks</p>
                      <h3 className="videos-empty-state__title">No looks available</h3>
                      <p className="videos-empty-state__description">
                        This avatar does not have any looks yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="avatar-persona-looks-section__count">
                      {lookCount} look{lookCount === 1 ? '' : 's'} — select one to view
                    </p>
                    <div className="avatar-persona-look-grid" role="list">
                      {activeLooks.map((look) => (
                        <AvatarPersonaLookCard
                          key={look.id}
                          look={look}
                          isSelected={selectedLook?.id === look.id}
                          canDelete={canDeleteLooks}
                          onSelect={handleSelectLook}
                          onDelete={handleDeleteLook}
                        />
                      ))}
                    </div>
                  </>
                )}
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AvatarPersona
