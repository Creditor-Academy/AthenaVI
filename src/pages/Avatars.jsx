import { useState } from 'react'
import {
  MdAdd,
  MdPerson,
  MdFace,
  MdVideocam,
  MdMoreVert,
  MdEdit,
  MdDeleteOutline,
} from 'react-icons/md'

const styles = `
.avatars-container {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.avatars-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.avatars-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.create-avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-avatar-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.avatar-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.avatar-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.avatar-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #3b82f6;
  transition: all 0.2s ease;
}

.avatar-card:hover .avatar-icon {
  background: #3b82f6;
  color: #ffffff;
}

.avatar-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px;
}

.avatar-card-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.my-avatars-section {
  margin-top: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px;
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.my-avatar-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.my-avatar-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.avatar-preview {
  width: 100%;
  height: 160px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-preview-icon {
  font-size: 48px;
  color: #3b82f6;
}

.avatar-info {
  padding: 16px;
}

.avatar-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px;
}

.avatar-meta {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
}

.avatar-option {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-option:hover {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.avatar-option-icon {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
}

.avatar-option-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px;
}

.avatar-option-description {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover {
  background: #2563eb;
}
`

function Avatars() {
  const [showModal, setShowModal] = useState(false)
  const [cardMenu, setCardMenu] = useState(null)

  const myAvatars = [
    {
      id: 1,
      name: 'Professional Avatar',
      type: 'Studio Avatar',
      created: '2 days ago'
    },
    {
      id: 2,
      name: 'Casual Avatar',
      type: 'Personal Avatar', 
      created: '1 week ago'
    },
    {
      id: 3,
      name: 'Business Avatar',
      type: 'Avatar Builder',
      created: '2 weeks ago'
    }
  ]

  const avatarTypes = [
    {
      icon: <MdPerson />,
      title: 'Avatar Builder',
      description: 'Create custom avatars from scratch with our advanced builder tools'
    },
    {
      icon: <MdFace />,
      title: 'Personal Avatar',
      description: 'Upload and customize your own photos to create personalized avatars'
    },
    {
      icon: <MdVideocam />,
      title: 'Studio Avatar',
      description: 'Generate professional avatars using AI-powered studio tools'
    }
  ]

  return (
    <>
      <style>{styles}</style>
      <div className="avatars-container">
        <div className="avatars-header">
          <h1 className="avatars-title">Avatars</h1>
          <button 
            className="create-avatar-btn"
            onClick={() => setShowModal(true)}
          >
            <MdAdd /> Create Avatar
          </button>
        </div>

        <div className="avatar-types">
          {avatarTypes.map((type, index) => (
            <div key={index} className="avatar-card">
              <div className="avatar-icon">
                {type.icon}
              </div>
              <h3 className="avatar-card-title">{type.title}</h3>
              <p className="avatar-card-description">{type.description}</p>
            </div>
          ))}
        </div>

        <div className="my-avatars-section">
          <div className="section-header">
            <h2 className="section-title">My Avatars</h2>
          </div>
          
          <div className="avatars-grid">
            {myAvatars.map((avatar) => (
              <div key={avatar.id} className="my-avatar-card">
                <div className="avatar-preview">
                  <div className="avatar-preview-icon">
                    <MdPerson />
                  </div>
                  <div className="avatar-actions">
                    <button 
                      className="dot-btn"
                      onClick={() => setCardMenu(cardMenu === avatar.id ? null : avatar.id)}
                    >
                      <MdMoreVert />
                    </button>
                  </div>
                </div>
                <div className="avatar-info">
                  <h3 className="avatar-name">{avatar.name}</h3>
                  <p className="avatar-meta">{avatar.type} • Created {avatar.created}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Avatar Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Avatar</h2>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="avatar-option">
                <div className="avatar-option-icon">
                  <MdPerson />
                </div>
                <div className="avatar-option-text">
                  <h4 className="avatar-option-title">Avatar Builder</h4>
                  <p className="avatar-option-description">Create custom avatars from scratch</p>
                </div>
              </div>
              
              <div className="avatar-option">
                <div className="avatar-option-icon">
                  <MdFace />
                </div>
                <div className="avatar-option-text">
                  <h4 className="avatar-option-title">Personal Avatar</h4>
                  <p className="avatar-option-description">Upload your own photos</p>
                </div>
              </div>
              
              <div className="avatar-option">
                <div className="avatar-option-icon">
                  <MdVideocam />
                </div>
                <div className="avatar-option-text">
                  <h4 className="avatar-option-title">Studio Avatar</h4>
                  <p className="avatar-option-description">AI-powered studio tools</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  alert('Avatar creation coming soon!')
                  setShowModal(false)
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Avatars
