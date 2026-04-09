import { useState } from 'react'
import { Search, Play, Video, ChevronRight, ChevronLeft, X, ArrowLeft, Pause } from 'lucide-react'
import './Avatars.css'

// Importing avatar assets
import pro1 from '../../assets/pro_avatar_1.png'
import pro2 from '../../assets/pro_avatar_2.png'
import pro3 from '../../assets/pro_avatar_3.png'
import pro4 from '../../assets/pro_avatar_4.png'
import jamesPro from '../../assets/james_pro.png'
import elenaPro from '../../assets/elena_pro.png'
import sophiePro from '../../assets/sophie_pro.png'
import sampleVideo from '../../assets/Personal Avatar.mp4'

const AVATARS_DATA = [
  {
    id: 'marcus-01',
    name: 'Marcus',
    role: 'Executive Presenter',
    description: 'A professional and authoritative persona, ideal for corporate presentations and formal reports.',
    image: pro1,
    preview: sampleVideo,
    category: 'Professional',
    gender: 'Male',
    style: 'Modern Suite',
    rating: 4.9
  },
  {
    id: 'sarah-02',
    name: 'Sarah',
    role: 'Tech Lead',
    description: 'Enthusiastic and clear-spoken, Sarah is perfect for software tutorials and engineering updates.',
    image: pro2,
    preview: sampleVideo,
    category: 'Tech',
    gender: 'Female',
    style: 'Casual Business',
    rating: 4.8
  },
  {
    id: 'alex-03',
    name: 'Alex',
    role: 'Creative Director',
    description: 'Vibrant and energetic, Alex brings a creative flair to your marketing videos and social content.',
    image: pro3,
    preview: sampleVideo,
    category: 'Creative',
    gender: 'Male',
    style: 'Creative Studio',
    rating: 4.7
  },
  {
    id: 'lisa-04',
    name: 'Lisa',
    role: 'Support Specialist',
    description: 'Calm and reassuring, Lisa excels in customer-facing help videos and onboarding guides.',
    image: pro4,
    preview: sampleVideo,
    category: 'Service',
    gender: 'Female',
    style: 'Casual',
    rating: 4.9
  },
  {
    id: 'james-05',
    name: 'James',
    role: 'Product Expert',
    description: 'A versatile speaker with a focus on product features and detailed explainer videos.',
    image: jamesPro,
    preview: sampleVideo,
    category: 'Professional',
    gender: 'Male',
    style: 'Formal',
    rating: 4.6
  },
  {
    id: 'elena-06',
    name: 'Elena',
    role: 'AI Researcher',
    description: 'Highly intelligent and articulate, Elena is the perfect fit for technical and scientific content.',
    image: elenaPro,
    preview: sampleVideo,
    category: 'Academic',
    gender: 'Female',
    style: 'Academic',
    rating: 4.8
  },
  {
    id: 'sophie-07',
    name: 'Sophie',
    role: 'Lifestyle Coach',
    description: 'Warm and inviting, Sophie is great for wellness, health, and personal development content.',
    image: sophiePro,
    preview: sampleVideo,
    category: 'Lifestyle',
    gender: 'Female',
    style: 'Relaxed',
    rating: 4.7
  }
]

function Avatars({ onCreate }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [isPreviewing, setIsPreviewing] = useState(false)

  const categories = ['All', 'Professional', 'Tech', 'Creative', 'Service', 'Academic', 'Lifestyle']

  const filteredAvatars = AVATARS_DATA.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          avatar.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'All' || avatar.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectPersona = (avatar) => {
    setSelectedAvatar(avatar)
    setIsPreviewing(false)
  }

  const openAvatarDetails = (avatar) => {
    setSelectedAvatar(avatar)
    setIsPreviewing(false)
  }

  const closeDetails = () => {
    setSelectedAvatar(null)
    setIsPreviewing(false)
  }

  const handleCreateVideo = (avatar) => {
    console.log('Creating video from', avatar.name)
    if (onCreate) {
      onCreate()
    }
    closeDetails()
  }

  const navigateAvatar = (dir) => {
    const idx = AVATARS_DATA.findIndex(a => a.id === selectedAvatar?.id)
    const next = idx + dir
    if (next >= 0 && next < AVATARS_DATA.length) {
      setSelectedAvatar(AVATARS_DATA[next])
      setIsPreviewing(false)
    }
  }

  return (
    <div className="avatars-workspace">
      <main className="workspace-main">
        {!selectedAvatar ? (
          <div className="grid-container">
            <header className="avatars-header">
              <div className="header-info">
                <h1>Avatars</h1>
                <p>Choose an avatar for your next video project.</p>
              </div>
              <div className="header-actions">
                <div className="search-section">
                  <div className="search-bar">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search avatars..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="filter-tabs">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      className={`filter-tab ${filterCategory === cat ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="avatars-grid">
              {filteredAvatars.map(avatar => (
                <div key={avatar.id} className="avatar-card" onClick={() => openAvatarDetails(avatar)}>
                  <div className="avatar-image-container">
                    <img src={avatar.image} alt={avatar.name} />
                    <div className="avatar-overlay">
                      <div className="workspace-action-badge">
                        <ChevronRight size={20} />
                        <span>View Persona</span>
                      </div>
                    </div>
                  </div>
                  <div className="avatar-info">
                    <h3>{avatar.name}</h3>
                    <p>{avatar.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="persona-view">
            {/* Main area */}
            <div className="pv-stage">
              {/* Centered media container - not stretched */}
              <div className="pv-media-wrap">
                <div className="pv-media" onClick={() => setIsPreviewing(!isPreviewing)}>
                  {!isPreviewing ? (
                    <img src={selectedAvatar.image} alt={selectedAvatar.name} />
                  ) : (
                    <video src={selectedAvatar.preview} autoPlay loop />
                  )}
                  <div className="pv-play-hover">
                    <div className="pv-play-btn">
                      {!isPreviewing ? <Play size={26} fill="currentColor" /> : <Pause size={22} />}
                    </div>
                  </div>
                </div>

                {/* Nav arrows on the media */}
                {AVATARS_DATA.findIndex(a => a.id === selectedAvatar?.id) > 0 && (
                  <button className="pv-arrow pv-arrow-left" onClick={() => navigateAvatar(-1)}>
                    <ChevronLeft size={20} />
                  </button>
                )}
                {AVATARS_DATA.findIndex(a => a.id === selectedAvatar?.id) < AVATARS_DATA.length - 1 && (
                  <button className="pv-arrow pv-arrow-right" onClick={() => navigateAvatar(1)}>
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* Text panel to the right */}
              <div className="pv-text">
                <span className="pv-category">{selectedAvatar.category}</span>
                <h1 className="pv-name">{selectedAvatar.name}</h1>
                <p className="pv-role">{selectedAvatar.role}</p>
                <p className="pv-desc">{selectedAvatar.description}</p>
                <button className="pv-cta" onClick={() => handleCreateVideo(selectedAvatar)}>
                  <Video size={17} />
                  Create Video
                </button>
              </div>
            </div>

            {/* Bottom bar: back + avatar switcher */}
            <div className="pv-bottombar">
              <button className="pv-back" onClick={closeDetails}>
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <div className="pv-thumbs">
                {AVATARS_DATA.map(avatar => (
                  <button 
                    key={avatar.id} 
                    className={`pv-thumb ${selectedAvatar?.id === avatar.id ? 'active' : ''}`}
                    onClick={() => handleSelectPersona(avatar)}
                  >
                    <img src={avatar.image} alt={avatar.name} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Avatars
