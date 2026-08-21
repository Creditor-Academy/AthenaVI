import { useState } from 'react'
import './PptPresenceAvatars.css'

const RING_COLORS = ['#7c3aed', '#1e3a5f', '#0f766e', '#b45309', '#be123c', '#2563eb']

const ANIMALS = [
  { emoji: '🦊', name: 'Fox' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🦁', name: 'Lion' },
  { emoji: '🐯', name: 'Tiger' },
  { emoji: '🐨', name: 'Koala' },
  { emoji: '🐸', name: 'Frog' },
  { emoji: '🦉', name: 'Owl' },
  { emoji: '🐧', name: 'Penguin' },
  { emoji: '🐰', name: 'Rabbit' },
  { emoji: '🐙', name: 'Octopus' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🐶', name: 'Dog' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🐵', name: 'Monkey' },
  { emoji: '🐻', name: 'Bear' },
  { emoji: '🐮', name: 'Cow' },
]

function hashSeed(value) {
  return String(value || '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function animalFor(viewer) {
  const seed =
    viewer.id ||
    viewer.viewerSessionId ||
    viewer.sessionId ||
    viewer.userId ||
    viewer.displayName ||
    'guest'
  return ANIMALS[hashSeed(seed) % ANIMALS.length]
}

function initialsFrom(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function avatarUrl(viewer) {
  return (
    viewer?.avatarUrl ||
    viewer?.avatar ||
    viewer?.profileImage ||
    viewer?.photoUrl ||
    viewer?.image ||
    viewer?.user?.profileImage ||
    viewer?.user?.avatarUrl ||
    ''
  )
}

export function isAnonymousViewer(viewer) {
  if (!viewer) return true
  if (viewer.isAnonymous || viewer.anonymous || viewer.guest || viewer.isGuest) return true
  if (viewer.kind === 'guest' || viewer.role === 'guest' || viewer.type === 'anonymous') return true
  const userId = viewer.userId || viewer.user?.id || viewer.user?._id
  const email = viewer.email || viewer.user?.email
  const photo = avatarUrl(viewer)
  const name = String(viewer.displayName || viewer.name || viewer.user?.name || '').trim()
  if (userId || email || photo) return false
  return !name || /anonymous/i.test(name)
}

export default function PptPresenceAvatars({
  viewers = [],
  viewerCount,
  selfViewer = null,
}) {
  const merged = []
  const seen = new Set()

  const push = (viewer) => {
    if (!viewer) return
    const key = String(
      viewer.id ||
        viewer.userId ||
        viewer.viewerSessionId ||
        viewer.sessionId ||
        viewer.email ||
        viewer.displayName ||
        merged.length
    )
    if (seen.has(key)) return
    seen.add(key)
    merged.push(viewer)
  }

  push(selfViewer)
  viewers.forEach(push)

  const total = Number.isFinite(Number(viewerCount))
    ? Math.max(Number(viewerCount), merged.length)
    : merged.length
  const overflow = Math.max(0, total - merged.length)
  if (!merged.length && overflow <= 0) return null

  return (
    <ul className="ppt-presence-avatars" aria-label={`${total} people in this presentation`}>
      {merged.slice(0, 8).map((viewer, index) => {
        const anonymous = isAnonymousViewer(viewer)
        const animal = anonymous ? animalFor(viewer) : null
        const name = anonymous
          ? `Anonymous · ${animal.name}`
          : viewer.displayName || viewer.name || viewer.user?.name || viewer.email || 'Viewer'
        const photo = anonymous ? '' : avatarUrl(viewer)
        const slide =
          viewer.slideIndex != null && Number.isFinite(Number(viewer.slideIndex))
            ? ` · Slide ${Number(viewer.slideIndex) + 1}`
            : ''
        return (
          <PresenceAvatar
            key={viewer.id || viewer.userId || viewer.viewerSessionId || `${name}-${index}`}
            name={name}
            photo={photo}
            animal={animal?.emoji}
            title={`${name}${slide}`}
            ring={RING_COLORS[index % RING_COLORS.length]}
            zIndex={20 - index}
          />
        )
      })}
      {overflow > 0 && (
        <li className="ppt-presence-more" title={`${overflow} more`} style={{ zIndex: 1 }}>
          +{overflow}
        </li>
      )}
    </ul>
  )
}

function PresenceAvatar({ name, photo, animal, title, ring, zIndex }) {
  const [failed, setFailed] = useState(false)
  const showPhoto = Boolean(photo) && !failed

  return (
    <li className="ppt-presence-avatar" title={title} style={{ zIndex, borderColor: ring }}>
      {showPhoto ? (
        <img src={photo} alt="" onError={() => setFailed(true)} referrerPolicy="no-referrer" />
      ) : animal ? (
        <span className="ppt-presence-animal" aria-hidden>
          {animal}
        </span>
      ) : (
        <span>{initialsFrom(name)}</span>
      )}
    </li>
  )
}
