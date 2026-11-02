import { useRef } from 'react'
import { MdCardMembership, MdDelete, MdPhotoCamera, MdVerified } from 'react-icons/md'
import { initials } from '../profileUtils'

/**
 * Banner + overlapping avatar + stat row, after the ebook profile hero.
 * The banner is an accent gradient — the API has no cover-image field.
 */
export default function ProfileHero({
  loading,
  profile,
  planLabel,
  stats,
  imageBusy,
  onUploadImage,
  onRemoveImage,
}) {
  const fileInputRef = useRef(null)

  if (loading) {
    return (
      <header className="prf-hero" aria-busy="true">
        <div className="prf-hero-cover prf-skel" />
        <div className="prf-hero-bar">
          <div className="prf-avatar-wrap">
            <div className="prf-avatar prf-skel" />
          </div>
          <ul className="prf-hero-stats" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>
                <div className="prf-skel prf-skel-box" />
              </li>
            ))}
          </ul>
          <div className="prf-hero-identity">
            <div className="prf-skel prf-skel-line" style={{ width: '60%', height: 22, margin: '0 auto 8px' }} />
            <div className="prf-skel prf-skel-line" style={{ width: '45%', margin: '0 auto' }} />
          </div>
          <div className="prf-hero-tools" />
        </div>
      </header>
    )
  }

  const displayName = profile.name || 'Your name'

  return (
    <header className="prf-hero">
      <div className="prf-hero-cover" aria-hidden />

      <div className="prf-hero-bar">
        <div className="prf-avatar-wrap">
          <div className={`prf-avatar${imageBusy ? ' is-busy' : ''}`}>
            {imageBusy ? (
              <span className="prf-avatar-spinner" aria-label="Updating photo" />
            ) : profile.profileImage ? (
              <img src={profile.profileImage} alt="" />
            ) : (
              <span>{initials(profile.name, profile.email)}</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) onUploadImage(file)
            }}
          />
          <button
            type="button"
            className="prf-media-edit"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageBusy}
            aria-label="Change profile photo"
            title="Change profile photo"
          >
            <MdPhotoCamera aria-hidden />
          </button>
          {profile.profileImage && !imageBusy ? (
            <button
              type="button"
              className="prf-media-edit prf-media-edit--remove"
              onClick={onRemoveImage}
              aria-label="Remove profile photo"
              title="Remove profile photo"
            >
              <MdDelete aria-hidden />
            </button>
          ) : null}
        </div>

        <ul className="prf-hero-stats" aria-label="Account statistics">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <li key={stat.id}>
                <button
                  type="button"
                  className={`prf-metric is-${stat.id}`}
                  onClick={stat.onClick}
                  disabled={!stat.onClick}
                  title={stat.hint}
                >
                  <Icon aria-hidden />
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="prf-hero-identity">
          <h1 className="prf-name">{displayName}</h1>
          <p className="prf-email">
            {profile.email}
            {profile.email ? <MdVerified className="prf-verified" aria-label="Verified" /> : null}
          </p>
        </div>

        <div className="prf-hero-tools">
          <div className="prf-hero-chip" title={planLabel}>
            <MdCardMembership aria-hidden />
            <div>
              <span>Plan</span>
              <strong>{planLabel}</strong>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
