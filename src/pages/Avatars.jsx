import { useState } from 'react'
import {
  MdCheckCircle,
  MdPlayCircleFilled,
  MdVideocam,
  MdMic,
  MdSearch,
  MdFilterList,
  MdClose
} from 'react-icons/md'
import './Avatars.css'

function Avatars() {
  const [selectedId, setSelectedId] = useState(1)
  const [filter, setFilter] = useState('All')
  const [isPreviewing, setIsPreviewing] = useState(false)

  const avatars = [
    { 
      id: 1, 
      name: 'Amelia', 
      role: 'Global Presenter', 
      tags: ['Professional', 'Studio'], 
      thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      voice: 'Amelia (US)',
      description: 'A professional and friendly instructor perfect for corporate training and educational walkthroughs. Amelia provides clear articulation and a warm tone.'
    },
    { 
      id: 2, 
      name: 'James', 
      role: 'Executive Instructor', 
      tags: ['Corporate', 'Male'], 
      thumb: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      voice: 'James (UK)',
      description: 'James delivers a confident and authoritative performance, making him ideal for executive communications and high-level strategy presentations.'
    },
    { 
      id: 3, 
      name: 'Sophia', 
      role: 'Lifestyle Coach', 
      tags: ['Casual', 'Modern'], 
      thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      voice: 'Sophia (US)',
      description: 'Sophia brings a modern and relatable energy to her presentations. She is perfect for lifestyle, tech tutorials, and brand storytelling.'
    },
    { 
      id: 4, 
      name: 'Ethan', 
      role: 'Tech Evangelist', 
      tags: ['Modern', 'Male'], 
      thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      voice: 'Ethan (US)',
      description: 'Ethan is enthusiastic and knowledgeable. His dynamic presentation style works great for product reveals and software demos.'
    },
    { 
      id: 5, 
      name: 'Olivia', 
      role: 'Marketing Lead', 
      tags: ['Creative', 'Studio'], 
      thumb: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400',
      voice: 'Olivia (AU)',
      description: 'With a creative flair and natural warmth, Olivia is excellent for marketing campaigns and community engagement videos.'
    },
    { 
      id: 6, 
      name: 'Daniel', 
      role: 'Support Specialist', 
      tags: ['Professional', 'Male'], 
      thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      voice: 'Daniel (CA)',
      description: 'Daniel provides a reassuring and helpful presence, ideal for customer support guides and step-by-step documentation.'
    },
  ]

  const activeAvatar = avatars.find(a => a.id === selectedId) || avatars[0]

  const filters = ['All', 'Professional', 'Casual', 'Studio', 'Modern']

  return (
    <div className="avatars-showcase">
      <div className="avatars-list-container">
        <div className="showcase-header">
          <h1>AI Instructors</h1>
          <div className="search-wrapper-premium">
             <MdSearch className="search-icon" />
             <input placeholder="Search instructors..." />
          </div>
        </div>

        <div className="avatars-filters">
          {filters.map(f => (
            <button 
              key={f} 
              className={`filter-pill-premium ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="avatar-grid">
          {avatars.filter(a => filter === 'All' || a.tags.includes(filter)).map(avatar => (
            <div 
              key={avatar.id} 
              className={`avatar-showcase-card ${selectedId === avatar.id ? 'active' : ''}`}
              onClick={() => setSelectedId(avatar.id)}
            >
              <div className="avatar-showcase-thumb">
                <img src={avatar.thumb} alt={avatar.name} />
                {selectedId === avatar.id && (
                  <div className="selection-check">
                    <MdCheckCircle />
                  </div>
                )}
              </div>
              <div className="avatar-card-info">
                <h3>{avatar.name}</h3>
                <p>{avatar.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="avatar-details-pane">
        <div className="preview-stage">
          <div className="main-preview-canvas">
            <img src={activeAvatar.thumb} alt={activeAvatar.name} />
            <div className="canvas-overlay-ui">
              <MdVideocam /> Live Preview Active
            </div>
          </div>
        </div>

        <div className="details-content">
          <div className="details-main-info">
            <div className="details-header-info">
              <h2>{activeAvatar.name}</h2>
              <div className="details-tags">
                {activeAvatar.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>

            <p className="details-description">
              {activeAvatar.description}
            </p>

            <div className="voice-preview-section">
              <div className="details-section-label">Voice Persona</div>
              <div className="voice-info-display">
                <div className="voice-icon">
                  <MdMic />
                </div>
                <div className="voice-details-text">
                  <span className="voice-details-name">{activeAvatar.voice}</span>
                  <span className="voice-details-meta">Natural Narration • Pro Grade</span>
                </div>
              </div>
            </div>
          </div>

          <div className="details-actions">
            <button className="btn-primary btn-full">
              <MdVideocam /> Create Video with {activeAvatar.name}
            </button>
            <button 
              className="btn-secondary btn-full" 
              onClick={() => setIsPreviewing(true)}
            >
              <MdPlayCircleFilled /> Preview Sample
            </button>
          </div>
        </div>
      </aside>

      {isPreviewing && (
        <div className="preview-modal-overlay" onClick={() => setIsPreviewing(false)}>
          <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={() => setIsPreviewing(false)}><MdClose /></button>
            <div className="preview-video-container">
              <img src={activeAvatar.thumb} alt="Preview" className="preview-placeholder" />
              <div className="preview-play-icon">
                <MdPlayCircleFilled />
              </div>
              <div className="preview-overlay-info">
                <h3>{activeAvatar.name} Preview</h3>
                <p>Generating high-fidelity sample...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Avatars
