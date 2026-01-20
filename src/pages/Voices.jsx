import { useState, useRef, useEffect } from 'react'
import { MdMoreVert, MdPlayArrow, MdClose, MdCheckCircle, MdShare, MdContentCopy, MdEdit, MdDelete } from 'react-icons/md'

const styles = `
.voices-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.voices-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.voices-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.new-voice-btn {
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-voice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.voices-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #334155;
  margin: 32px 0 16px 0;
}

.voices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.voice-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.voice-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.voice-language-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.voice-menu-btn {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
}

.voice-menu-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.voice-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.voice-updated {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.voice-info-box {
  background: #e0f2fe;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.voice-info-icon {
  color: #0284c7;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.voice-info-text {
  font-size: 14px;
  color: #0c4a6e;
  line-height: 1.5;
  margin: 0;
}

.voice-info-link {
  color: #0284c7;
  text-decoration: underline;
  cursor: pointer;
}

.voice-preview-btn {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;
  width: 100%;
  justify-content: center;
}

.voice-preview-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.empty-state-text {
  font-size: 15px;
  margin-bottom: 24px;
}

.voice-menu {
  position: absolute;
  top: 40px;
  right: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.voice-menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.voice-menu-item:hover {
  background: #f8fafc;
}

.voice-menu-item.delete {
  color: #ef4444;
}

.voice-menu-item.delete:hover {
  background: #fef2f2;
}

.voice-menu-item-icon {
  font-size: 20px;
  color: #64748b;
  flex-shrink: 0;
}

.voice-menu-item.delete .voice-menu-item-icon {
  color: #ef4444;
}

.language-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.language-dropdown {
  position: fixed;
  background: #1e293b;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 360px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1001;
  animation: fadeInUp 0.2s ease;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-dropdown::-webkit-scrollbar {
  width: 8px;
}

.language-dropdown::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.language-dropdown::-webkit-scrollbar-track {
  background: #0f172a;
}

.language-list {
  padding: 8px 0;
}

.language-item {
  padding: 10px 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.language-item:hover {
  background: #334155;
}

.language-item.selected {
  background: #3b82f6;
  color: #ffffff;
}

.language-link-wrapper {
  position: relative;
  display: inline;
}
`

function Voices({ onCreateVoice, onVoiceClick }) {
  const [voices, setVoices] = useState([
    {
      id: 1,
      name: 'Michael Johnson',
      language: 'EN',
      updated: '10 June',
      hasMultiLanguage: true
    }
  ])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingVoiceId, setEditingVoiceId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(null)
  const menuRefs = useRef({})
  const languageLinkRefs = useRef({})

  const languages = [
    'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Assamese', 'Azerbaijani',
    'Basque', 'Bengali', 'Bosnian', 'Bulgarian', 'Burmese', 'Catalan', 'Chinese',
    'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Filipino',
    'Finnish', 'French', 'Galician', 'Georgian', 'German', 'Greek', 'Gujarati',
    'Hebrew', 'Hindi', 'Hungarian', 'Icelandic', 'Indonesian', 'Irish', 'Italian',
    'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Korean', 'Lao',
    'Latvian', 'Lithuanian', 'Macedonian', 'Malay', 'Malayalam', 'Maltese',
    'Marathi', 'Mongolian', 'Nepali', 'Norwegian', 'Odia', 'Pashto', 'Persian',
    'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian', 'Serbian', 'Sinhala',
    'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish',
    'Tamil', 'Telugu', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Uzbek',
    'Vietnamese', 'Welsh', 'Zulu'
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((voiceId) => {
        if (menuRefs.current[voiceId] && !menuRefs.current[voiceId].contains(event.target)) {
          setOpenMenuId(null)
        }
      })
      Object.keys(languageLinkRefs.current).forEach((voiceId) => {
        if (languageLinkRefs.current[voiceId] && !languageLinkRefs.current[voiceId].contains(event.target)) {
          setShowLanguageDropdown(false)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreateVoice = () => {
    if (onCreateVoice) {
      onCreateVoice()
    }
  }

  const handleVoiceClick = (voice) => {
    if (onVoiceClick && !openMenuId) {
      onVoiceClick(voice)
    }
  }

  const toggleMenu = (e, voiceId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === voiceId ? null : voiceId)
  }

  const handleShare = (e, voice) => {
    e.stopPropagation()
    setOpenMenuId(null)
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: `Voice: ${voice.name}`,
        text: `Check out this voice: ${voice.name}`,
      }).catch(() => {})
    } else {
      // Fallback: copy to clipboard
      const shareText = `Voice: ${voice.name} (ID: ${voice.id})`
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Voice information copied to clipboard!')
      })
    }
  }

  const handleCopyID = (e, voice) => {
    e.stopPropagation()
    setOpenMenuId(null)
    navigator.clipboard.writeText(voice.id.toString()).then(() => {
      alert('Voice ID copied to clipboard!')
    })
  }

  const handleRename = (e, voice) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setEditingVoiceId(voice.id)
    setEditingName(voice.name)
  }

  const handleDelete = (e, voice) => {
    e.stopPropagation()
    setOpenMenuId(null)
    if (window.confirm(`Are you sure you want to delete "${voice.name}"?`)) {
      setVoices(voices.filter(v => v.id !== voice.id))
    }
  }

  const handleNameSave = (voiceId) => {
    setVoices(voices.map(v => 
      v.id === voiceId ? { ...v, name: editingName } : v
    ))
    setEditingVoiceId(null)
    setEditingName('')
  }

  const handleNameCancel = () => {
    setEditingVoiceId(null)
    setEditingName('')
  }

  const handleLanguageLinkClick = (e, voiceId) => {
    e.stopPropagation()
    setShowLanguageDropdown(showLanguageDropdown === voiceId ? null : voiceId)
  }

  const handleLanguageSelect = (language) => {
    setShowLanguageDropdown(false)
    // Handle language selection
    console.log('Selected language:', language)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="voices-container">
        <div className="voices-header">
          <h1 className="voices-title">Voices</h1>
          <button className="new-voice-btn" onClick={handleCreateVoice}>
            + New voice
          </button>
        </div>

        <h2 className="voices-section-title">My voices</h2>

        {voices.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No voices yet</p>
            <p className="empty-state-text">Create your first voice to get started</p>
            <button className="new-voice-btn" onClick={handleCreateVoice}>
              + New voice
            </button>
          </div>
        ) : (
          <div className="voices-grid">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="voice-card"
                onClick={() => handleVoiceClick(voice)}
              >
                <div className="voice-card-header">
                  <span className="voice-language-badge">{voice.language}</span>
                  <div style={{ position: 'relative' }} ref={el => menuRefs.current[voice.id] = el}>
                    <button
                      className="voice-menu-btn"
                      onClick={(e) => toggleMenu(e, voice.id)}
                    >
                      <MdMoreVert />
                    </button>
                    {openMenuId === voice.id && (
                      <div className="voice-menu">
                        <button
                          className="voice-menu-item"
                          onClick={(e) => handleShare(e, voice)}
                        >
                          <MdShare className="voice-menu-item-icon" />
                          Share
                        </button>
                        <button
                          className="voice-menu-item"
                          onClick={(e) => handleCopyID(e, voice)}
                        >
                          <MdContentCopy className="voice-menu-item-icon" />
                          Copy ID
                        </button>
                        <button
                          className="voice-menu-item"
                          onClick={(e) => handleRename(e, voice)}
                        >
                          <MdEdit className="voice-menu-item-icon" />
                          Rename
                        </button>
                        <button
                          className="voice-menu-item delete"
                          onClick={(e) => handleDelete(e, voice)}
                        >
                          <MdDelete className="voice-menu-item-icon" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {editingVoiceId === voice.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleNameSave(voice.id)
                          } else if (e.key === 'Escape') {
                            handleNameCancel()
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#1e293b',
                          border: '2px solid #3b82f6',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          outline: 'none',
                          flex: 1
                        }}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNameSave(voice.id)
                        }}
                        style={{
                          padding: '4px 12px',
                          background: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNameCancel()
                        }}
                        style={{
                          padding: '4px 12px',
                          background: '#e5e7eb',
                          color: '#334155',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h3 className="voice-name">{voice.name}</h3>
                  )}
                  <p className="voice-updated">Updated on {voice.updated}</p>
                </div>
                {voice.hasMultiLanguage && (
                  <div className="voice-info-box" ref={el => languageLinkRefs.current[voice.id] = el}>
                    <MdCheckCircle className="voice-info-icon" />
                    <p className="voice-info-text">
                      You'll be able to use your voice with{' '}
                      <span 
                        className="voice-info-link"
                        onClick={(e) => handleLanguageLinkClick(e, voice.id)}
                      >
                        multiple languages
                      </span>.
                    </p>
                    {showLanguageDropdown === voice.id && (
                      <>
                        <div 
                          className="language-dropdown-overlay"
                          onClick={() => setShowLanguageDropdown(false)}
                        />
                        <div 
                          className="language-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="language-list">
                            {languages.map((language, index) => (
                              <button
                                key={index}
                                className="language-item"
                                onClick={() => handleLanguageSelect(language)}
                              >
                                {language}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button
                  className="voice-preview-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Preview functionality
                  }}
                >
                  <MdPlayArrow />
                  Preview
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Voices

