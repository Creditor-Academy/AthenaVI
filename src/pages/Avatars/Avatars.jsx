import { useState, useEffect } from 'react'
import { Search, Filter, Play, Video, ChevronRight, ChevronLeft, X, Info, Layers, ArrowLeft } from 'lucide-react'
import heygenService from '../../services/heygenService'
import AvatarPersona from './AvatarPersona'
import './Avatars.css'

// All avatars are fetched dynamically via HeyGen API

function Avatars({ onCreate }) {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [ownership, setOwnership] = useState('public')

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true)
        const responseData = await heygenService.getAvatarGroups({ ownership })

        // Find the array in the payload (HeyGen v3 uses avatar_looks, older uses avatars)
        let avatarList = []
        if (Array.isArray(responseData)) {
          avatarList = responseData
        } else if (responseData?.avatar_looks) {
          avatarList = responseData.avatar_looks
        } else if (responseData?.avatars) {
          avatarList = responseData.avatars
        } else if (responseData?.data?.avatar_groups) {
          avatarList = responseData.data.avatar_groups
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          avatarList = responseData.data
        }
        const mappedAvatars = avatarList.map((av, idx) => ({
          id: av.avatar_group_id || av.id || `group-${idx}`,
          name: av.name || av.group_name || 'AI Presenter',
          role: 'Virtual Presenter',
          description: 'High-fidelity Athena VI avatar. Perfect for professional video generation.',
          image: av.preview_image_url || av.thumbnail_url || av.normal_image_url || av.image_url || 'https://via.placeholder.com/300x400?text=Avatar',
          preview: av.preview_video_url || null,
          category: 'Professional',
          gender: 'Unknown',
          style: 'Modern Suite',
          rating: 4.9,
          rawLooks: av.avatar_looks || []
        }))

        if (mappedAvatars.length === 0) {
          console.warn('API returned empty avatars');
          setAvatars([]);
        } else {
          setAvatars(mappedAvatars);
        }
      } catch (error) {
        console.error('Failed to fetch avatars:', error)
        setAvatars([])
      } finally {
        setLoading(false)
      }
    }
    fetchAvatars()
  }, [ownership])

  const categories = ['All', 'Professional', 'Tech', 'Creative', 'Service', 'Academic', 'Lifestyle']

  const filteredAvatars = (avatars || []).filter(avatar => {
    if (!avatar) return false;
    const nameStr = avatar.name || '';
    const roleStr = avatar.role || '';
    const searchStr = (searchQuery || '').toLowerCase();

    const matchesSearch = nameStr.toLowerCase().includes(searchStr) ||
      roleStr.toLowerCase().includes(searchStr);
    const matchesCategory = filterCategory === 'All' || avatar.category === filterCategory;

    return matchesSearch && matchesCategory;
  })

  const currentIndex = avatars.findIndex(a => a.id === selectedAvatar?.id)

  const handleSelectPersona = (avatar) => {
    setSelectedAvatar(avatar)
  }

  const openAvatarDetails = (avatar) => {
    setSelectedAvatar(avatar)
  }

  const closeDetails = () => {
    setSelectedAvatar(null)
  }

  const handleCreateVideo = (avatar) => {
    console.log('Creating video from', avatar.name)
    if (onCreate) {
      onCreate()
    }
    closeDetails()
  }

  return (
    <div className={`avatars-workspace ${selectedAvatar ? 'details-active' : ''}`}>
      {/* Removed workspace-sidebar as requested by user - it felt 'weird' */}

      {/* Main Content Area */}
      <main className="workspace-main">
        {!selectedAvatar ? (
          <div className="grid-container">
            <header className="avatars-header">
              <div className="header-info">
                <h1>Avatars</h1>
                <p>Choose an avatar for your next video project.</p>
              </div>
              <div className="header-actions">
                <div className="ownership-segmented-control">
                  <button
                    className={`segmented-btn ${ownership === 'public' ? 'active' : ''}`}
                    onClick={() => setOwnership('public')}
                  >
                    Public Library
                  </button>
                  <button
                    className={`segmented-btn ${ownership === 'private' ? 'active' : ''}`}
                    onClick={() => setOwnership('private')}
                  >
                    My Custom Avatars
                  </button>
                </div>

                <div className="search-section">
                  <div className="search-bar">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search neural units..."
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
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                  Loading Athena VI Avatars...
                </div>
              ) : filteredAvatars.map(avatar => (
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
          <AvatarPersona
            selectedAvatar={selectedAvatar}
            closeDetails={closeDetails}
            onCreate={() => handleCreateVideo(selectedAvatar)}
          />
        )}
      </main>
    </div>
  )
}

export default Avatars
