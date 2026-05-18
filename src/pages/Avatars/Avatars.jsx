import { useState, useEffect, useRef } from 'react'
import { Search, ChevronRight, Plus, Users } from 'lucide-react'
import heygenService from '../../services/heygenService'
import AvatarPersona from './AvatarPersona'
import AvatarsSkeleton from '../page-skeleton/AvatarsSkeleton'
import './Avatars.css'

// All avatars are fetched dynamically via HeyGen API

function Avatars({ onCreate, onCreateAvatar }) {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [ownership, setOwnership] = useState('public')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true)
        const responseData = await heygenService.getAvatarGroups({ ownership })

        // Comprehensive mapping to handle different API versions and response shapes
        let avatarList = [];
        const data = responseData?.data || responseData;
        
        if (Array.isArray(data)) {
          avatarList = data;
        } else if (data?.avatar_groups) {
          avatarList = data.avatar_groups;
        } else if (data?.avatar_looks) {
          avatarList = data.avatar_looks;
        } else if (data?.avatars) {
          avatarList = data.avatars;
        } else if (responseData?.avatar_looks) {
          avatarList = responseData.avatar_looks;
        } else if (responseData?.avatar_groups) {
          avatarList = responseData.avatar_groups;
        }
        
        console.log(`Athena VI: Mapping ${avatarList.length} avatars for ownership: ${ownership}`, { raw: responseData });

        const mappedAvatars = avatarList.map((av, idx) => ({
          id: av.avatar_group_id || av.id || `group-${idx}`,
          name: av.name || av.group_name || 'AI Presenter',
          role: av.role || 'Virtual Presenter',
          description: av.description || 'High-fidelity Athena VI avatar.',
          image: av.preview_image_url || av.thumbnail_url || av.normal_image_url || av.image_url || 'https://via.placeholder.com/300x400?text=Avatar',
          preview: av.preview_video_url || null,
          category: av.category || (ownership === 'public' ? 'Professional' : 'All'),
          gender: av.gender || 'Unknown',
          style: av.style || 'Modern',
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

  const filteredAvatars = (avatars || []).filter(avatar => {
    if (!avatar) return false;
    const nameStr = avatar.name || '';
    const roleStr = avatar.role || '';
    const searchStr = (searchQuery || '').toLowerCase();

    const matchesSearch = nameStr.toLowerCase().includes(searchStr) ||
      roleStr.toLowerCase().includes(searchStr);

    return matchesSearch;
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
          loading ? (
            <AvatarsSkeleton />
          ) : (
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
                    My Avatars
                  </button>
                  <button
                    className={`segmented-btn ${ownership === 'workspace' ? 'active' : ''}`}
                    onClick={() => setOwnership('workspace')}
                  >
                    Team Shared
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
              </div>
            </header>

            <div className="avatars-grid">
              {ownership === 'private' && (
                <div className="avatar-card creation-card" onClick={() => onCreateAvatar && onCreateAvatar()}>
                  <div className="open-creation-btn">
                    <div className="creation-icon-wrapper">
                      <Plus size={32} />
                    </div>
                    <span>Create New Custom Avatar</span>
                  </div>
                </div>
              )}
              
              {filteredAvatars.map(avatar => (
                <div key={avatar.id} className="avatar-card" onClick={() => openAvatarDetails(avatar)}>
                  <div className="avatar-image-container">
                    <img src={avatar.image} alt={avatar.name} />
                    <div className="avatar-overlay">
                      {/* Overlay now only for hover effect */}
                    </div>
                  </div>
                  <div className="avatar-info">
                    <div className="avatar-info-content">
                      <h3>{avatar.name}</h3>
                      <p>{avatar.role}</p>
                    </div>
                    <div className="workspace-action-badge">
                      <span>View Persona</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAvatars.length === 0 && !loading && ownership === 'workspace' && (
              <div className="empty-state-container">
                <div className="empty-state-visual">
                  <Users size={64} />
                </div>
                <h2>Your Team Library is Empty</h2>
                <p>Start collaborating by creating and sharing avatars with your workspace members.</p>
              </div>
            )}
          </div>
          )
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
