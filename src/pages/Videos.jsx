import { useMemo, useState } from 'react'
import {
  MdLabel,
  MdPushPin,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDeleteOutline,
  MdPlayCircleFilled,
} from 'react-icons/md'

const thumbnailUrl =
  'https://media.istockphoto.com/id/1480023591/video/creating-a-female-video-game-character.jpg?s=640x640&k=20&c=S1LW6oZZDQYgsqp4GRL0bj9wE1oRIaBfQSV-UQXv2II='

function Videos() {
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [labelFilter, setLabelFilter] = useState('all')
  const [labelMenuOpen, setLabelMenuOpen] = useState(false)
  const [cardMenu, setCardMenu] = useState(null)

  const videos = useMemo(
    () => [
      {
        id: 'v1',
        title: 'Sustainable Work',
        status: 'draft',
        updated: '23h ago',
        duration: '01:50',
        label: 'Marketing',
        pinned: false,
      },
      {
        id: 'v2',
        title: 'Untitled',
        status: 'draft',
        updated: 'yesterday',
        duration: '—',
        label: 'Internal',
        pinned: true,
      },
      {
        id: 'v3',
        title: 'Holiday Greeting',
        status: 'draft',
        updated: '5d ago',
        duration: '01:50',
        label: 'Sales',
        pinned: false,
      },
      {
        id: 'v4',
        title: 'Client Update',
        status: 'draft',
        updated: '5d ago',
        duration: '—',
        label: 'Marketing',
        pinned: false,
      },
      {
        id: 'v5',
        title: 'Product Walkthrough',
        status: 'draft',
        updated: '2d ago',
        duration: '03:12',
        label: 'Product',
        pinned: true,
      },
      {
        id: 'v6',
        title: 'Welcome Series',
        status: 'draft',
        updated: '1d ago',
        duration: '02:04',
        label: 'Internal',
        pinned: false,
      },
    ],
    []
  )

  const labelOptions = ['Marketing', 'Sales', 'Product', 'Internal']
  const [videoState, setVideoState] = useState(videos)

  const togglePin = (id) => {
    setVideoState((prev) =>
      prev.map((v) => (v.id === id ? { ...v, pinned: !v.pinned } : v))
    )
  }

  const cycleLabel = (id) => {
    setVideoState((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v
        const currentIndex = labelOptions.indexOf(v.label)
        const next = labelOptions[(currentIndex + 1) % labelOptions.length]
        return { ...v, label: next }
      })
    )
  }

  const deleteVideo = (id) => {
    setVideoState((prev) => prev.filter((v) => v.id !== id))
  }

  const filteredVideos = useMemo(() => {
    return videoState.filter((v) => {
      if (showPinnedOnly && !v.pinned) return false
      if (labelFilter !== 'all' && v.label !== labelFilter) return false
      return true
    })
  }, [videoState, showPinnedOnly, labelFilter])

  return (
    <>
      <div className="section-header">
        <div>
          <h2 className="section-title">Videos</h2>
          <p className="card-meta" style={{ marginTop: 4 }}>
            Browse and manage your creations. No folders—use labels and pins to stay organized.
          </p>
        </div>
        <div className="section-actions">
          <button
            className={`pill ${labelFilter !== 'all' ? 'active' : ''}`}
            onClick={() => setLabelMenuOpen((v) => !v)}
          >
            <MdLabel /> {labelFilter === 'all' ? 'Labels: All' : `Label: ${labelFilter}`}
          </button>
          {labelMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 44,
                right: 0,
                display: 'grid',
                gap: 6,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 10,
                boxShadow: '0 10px 24px rgba(15,23,42,0.1)',
                zIndex: 6,
              }}
            >
              <button
                className={`pill ${labelFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setLabelFilter('all')
                  setLabelMenuOpen(false)
                }}
              >
                All labels
              </button>
              {labelOptions.map((l) => (
                <button
                  key={l}
                  className={`pill ${labelFilter === l ? 'active' : ''}`}
                  onClick={() => {
                    setLabelFilter(l)
                    setLabelMenuOpen(false)
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          <button
            className={`pill ${showPinnedOnly ? 'active' : ''}`}
            onClick={() => setShowPinnedOnly((v) => !v)}
          >
            <MdPushPin /> {showPinnedOnly ? 'Pinned only' : 'Show pinned'}
          </button>
          <button className="pill">
            <MdFilterList /> Filters
          </button>
        </div>
      </div>

      <div className="video-grid">
        {filteredVideos.map((video) => (
          <div className="video-card" key={video.id}>
            <button
              className="dot-btn"
              aria-label="Video actions"
              onClick={() => setCardMenu((m) => (m === video.id ? null : video.id))}
            >
              <MdMoreVert />
            </button>
            {cardMenu === video.id && (
              <div className="card-menu">
                <button
                  onClick={() => {
                    togglePin(video.id)
                    setCardMenu(null)
                  }}
                >
                  <MdPushPin color={video.pinned ? '#0f3f9e' : undefined} />
                  {video.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => {
                    cycleLabel(video.id)
                    setCardMenu(null)
                  }}
                >
                  <MdLabel /> Change label
                </button>
                <button
                  onClick={() => {
                    setCardMenu(null)
                    alert('Edit coming soon.')
                  }}
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={() => {
                    deleteVideo(video.id)
                    setCardMenu(null)
                  }}
                >
                  <MdDeleteOutline /> Delete
                </button>
              </div>
            )}
            <div className="thumb" style={{ backgroundImage: `url('${thumbnailUrl}')` }}>
              <div className="badge">DRAFT</div>
            </div>
            <div className="video-body">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-meta">Edited {video.updated}</p>
              <div className="video-footer">
                <span className="label primary">
                  <MdPlayCircleFilled /> {video.duration === '—' ? 'Preview' : video.duration}
                </span>
                <span className="label">
                  <MdLabel /> {video.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Videos

