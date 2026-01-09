import { useState, useRef } from 'react'
import {
  MdEdit,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdLanguage,
  MdLock,
  MdNotifications,
  MdSecurity,
  MdPalette,
  MdSave,
  MdClose,
  MdCameraAlt,
  MdArrowBack,
  MdCheckCircle,
} from 'react-icons/md'

const styles = `
.profile-container {
  padding: 0;
  height: 100vh;
  overflow-y: auto;
  background: #f8fafc;
  position: relative;
}

.profile-back-btn {
  position: fixed;
  top: 96px;
  left: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}

.profile-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 48px 0;
  margin-bottom: 32px;
}

.profile-header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
  color: #ffffff;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.avatar-edit-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.profile-email {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 16px;
}

.profile-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
}

.meta-item svg {
  color: #94a3b8;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 48px;
}

.profile-tabs {
  display: flex;
  gap: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button.active {
  color: #3b82f6;
  background: #eff6ff;
}

.tab-button:hover:not(.active) {
  color: #334155;
  background: #f8fafc;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title svg {
  color: #64748b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 24px;
}

.info-value.editable {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.info-value.editable:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.info-value svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.info-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  background: #ffffff;
}

.info-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save {
  background: #3b82f6;
  color: #ffffff;
}

.btn-save:hover {
  background: #2563eb;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.setting-item:hover {
  background: #f8fafc;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.setting-description {
  font-size: 13px;
  color: #64748b;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: #3b82f6;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active::after {
  transform: translateX(20px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: auto;
}

.info-value.editable:hover .edit-icon {
  opacity: 1;
}

.btn-primary {
  padding: 10px 20px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .profile-header-content {
    padding: 0 24px;
  }
  
  .profile-content {
    padding: 0 24px 48px;
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-back-btn {
    top: 16px;
    left: 16px;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .profile-header {
    padding: 32px 0;
    margin-bottom: 24px;
  }
  
  .profile-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 0 16px;
  }
  
  .avatar-section {
    align-self: center;
  }
  
  .avatar-large {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }
  
  .avatar-edit-btn {
    width: 28px;
    height: 28px;
  }
  
  .avatar-edit-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .profile-info {
    width: 100%;
    text-align: center;
  }
  
  .profile-name {
    font-size: 24px;
  }
  
  .profile-email {
    font-size: 14px;
  }
  
  .profile-meta {
    justify-content: center;
    gap: 16px;
  }
  
  .meta-item {
    font-size: 13px;
  }
  
  .profile-content {
    padding: 0 16px 32px;
  }
  
  .profile-tabs {
    border-radius: 8px;
    padding: 2px;
    margin-bottom: 20px;
  }
  
  .tab-button {
    padding: 8px 12px;
    font-size: 13px;
    flex: 1;
    min-width: 0;
  }
  
  .section-card {
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .section-title {
    font-size: 15px;
    margin-bottom: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .info-item {
    gap: 6px;
  }
  
  .info-label {
    font-size: 12px;
  }
  
  .info-value {
    font-size: 14px;
  }
  
  .edit-input {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .toggle-switch {
    width: 44px;
    height: 24px;
  }
  
  .toggle-slider {
    width: 20px;
    height: 20px;
  }
  
  .toggle-switch input:checked + .toggle-slider {
    transform: translateX(20px);
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .security-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .security-actions .btn-primary,
  .security-actions .btn-secondary {
    width: 100%;
  }
  
  .edit-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-icon {
    width: 100%;
    height: 40px;
  }
  
  .info-input {
    font-size: 14px;
    padding: 10px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-info {
    width: 100%;
  }
  
  .setting-title {
    font-size: 14px;
  }
  
  .setting-description {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .profile-back-btn {
    top: 12px;
    left: 12px;
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .profile-back-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .profile-header {
    padding: 24px 0;
  }
  
  .profile-header-content {
    padding: 0 12px;
    gap: 16px;
  }
  
  .avatar-large {
    width: 70px;
    height: 70px;
    font-size: 28px;
  }
  
  .avatar-edit-btn {
    width: 24px;
    height: 24px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .profile-email {
    font-size: 13px;
  }
  
  .profile-meta {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .profile-content {
    padding: 0 12px 24px;
  }
  
  .section-card {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    padding: 8px 8px;
    font-size: 12px;
  }
}
`

const initialProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  company: 'Acme Corporation',
  role: 'Video Producer',
  joinDate: 'January 2023',
  language: 'English',
  timezone: 'PST (UTC-8)',
}

const initialSettings = {
  emailNotifications: true,
  pushNotifications: false,
  twoFactorAuth: false,
  darkMode: false,
  autoSave: true,
}

function Profile({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(initialProfile)
  const [settings, setSettings] = useState(initialSettings)
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleEdit = (field, value) => {
    setEditing(field)
    setEditValue(value)
  }

  const handleSave = (field) => {
    setProfile((prev) => ({ ...prev, [field]: editValue }))
    setEditing(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <style>{styles}</style>
      <div className="profile-container">
        {onBack && (
          <button className="profile-back-btn" onClick={onBack}>
            <MdArrowBack size={18} />
            Back
          </button>
        )}

        <div className="profile-header">
          <div className="profile-header-content">
            <div className="avatar-section">
              <div className="avatar-large" style={profileImage ? {
                backgroundImage: `url(${profileImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}>
                {!profileImage && profile.name.charAt(0).toUpperCase()}
              </div>
              <button 
                className="avatar-edit-btn" 
                aria-label="Edit avatar"
                onClick={handleAvatarClick}
              >
                <MdCameraAlt size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{profile.name}</h1>
              <p className="profile-email">{profile.email}</p>
              <div className="profile-meta">
                <div className="meta-item">
                  <MdBusiness size={18} />
                  <span>{profile.company}</span>
                </div>
                <div className="meta-item">
                  <MdLocationOn size={18} />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Info
            </button>
            <button
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {/* Overview Tab */}
          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">24</div>
                <p className="stat-label">Videos Created</p>
              </div>
              <div className="stat-card">
                <div className="stat-value">8</div>
                <p className="stat-label">Avatars</p>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <p className="stat-label">Voices</p>
              </div>
              <div className="stat-card">
                <div className="stat-value">156</div>
                <p className="stat-label">Total Views</p>
              </div>
            </div>

            <div className="section-card">
              <h2 className="section-title">
                <MdCheckCircle /> Account Status
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Account Type</div>
                  <div className="info-value">Professional</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Subscription</div>
                  <div className="info-value">Active</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Storage Used</div>
                  <div className="info-value">2.4 GB / 100 GB</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">{profile.joinDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info Tab */}
          <div className={`tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
            <div className="section-card">
              <h2 className="section-title">
                <MdEdit /> Personal Information
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Full Name</div>
                  {editing === 'name' ? (
                    <>
                      <input
                        type="text"
                        className="info-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btn-icon btn-save" onClick={() => handleSave('name')}>
                          <MdSave size={18} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={handleCancel}>
                          <MdClose size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="info-value editable"
                      onClick={() => handleEdit('name', profile.name)}
                    >
                      {profile.name}
                      <MdEdit size={16} className="edit-icon" />
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">Email</div>
                  {editing === 'email' ? (
                    <>
                      <input
                        type="email"
                        className="info-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btn-icon btn-save" onClick={() => handleSave('email')}>
                          <MdSave size={18} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={handleCancel}>
                          <MdClose size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="info-value editable"
                      onClick={() => handleEdit('email', profile.email)}
                    >
                      <MdEmail size={18} />
                      {profile.email}
                      <MdEdit size={16} className="edit-icon" />
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">Phone</div>
                  {editing === 'phone' ? (
                    <>
                      <input
                        type="tel"
                        className="info-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btn-icon btn-save" onClick={() => handleSave('phone')}>
                          <MdSave size={18} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={handleCancel}>
                          <MdClose size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="info-value editable"
                      onClick={() => handleEdit('phone', profile.phone)}
                    >
                      <MdPhone size={18} />
                      {profile.phone}
                      <MdEdit size={16} className="edit-icon" />
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">Location</div>
                  {editing === 'location' ? (
                    <>
                      <input
                        type="text"
                        className="info-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btn-icon btn-save" onClick={() => handleSave('location')}>
                          <MdSave size={18} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={handleCancel}>
                          <MdClose size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="info-value editable"
                      onClick={() => handleEdit('location', profile.location)}
                    >
                      <MdLocationOn size={18} />
                      {profile.location}
                      <MdEdit size={16} className="edit-icon" />
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">Company</div>
                  {editing === 'company' ? (
                    <>
                      <input
                        type="text"
                        className="info-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button className="btn-icon btn-save" onClick={() => handleSave('company')}>
                          <MdSave size={18} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={handleCancel}>
                          <MdClose size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="info-value editable"
                      onClick={() => handleEdit('company', profile.company)}
                    >
                      <MdBusiness size={18} />
                      {profile.company}
                      <MdEdit size={16} className="edit-icon" />
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <div className="info-label">Language</div>
                  <div className="info-value">
                    <MdLanguage size={18} />
                    {profile.language}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Tab */}
          <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="section-card">
              <h2 className="section-title">
                <MdNotifications /> Notifications
              </h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Email Notifications</div>
                    <div className="setting-description">Receive email updates about your account</div>
                  </div>
                  <div
                    className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                    onClick={() => toggleSetting('emailNotifications')}
                  />
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Push Notifications</div>
                    <div className="setting-description">Get notified about important updates</div>
                  </div>
                  <div
                    className={`toggle-switch ${settings.pushNotifications ? 'active' : ''}`}
                    onClick={() => toggleSetting('pushNotifications')}
                  />
                </div>
              </div>
            </div>

            <div className="section-card">
              <h2 className="section-title">
                <MdPalette /> Preferences
              </h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Dark Mode</div>
                    <div className="setting-description">Switch to dark theme</div>
                  </div>
                  <div
                    className={`toggle-switch ${settings.darkMode ? 'active' : ''}`}
                    onClick={() => toggleSetting('darkMode')}
                  />
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Auto-save</div>
                    <div className="setting-description">Automatically save your work</div>
                  </div>
                  <div
                    className={`toggle-switch ${settings.autoSave ? 'active' : ''}`}
                    onClick={() => toggleSetting('autoSave')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Tab */}
          <div className={`tab-content ${activeTab === 'security' ? 'active' : ''}`}>
            <div className="section-card">
              <h2 className="section-title">
                <MdSecurity /> Security Settings
              </h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Two-Factor Authentication</div>
                    <div className="setting-description">Add an extra layer of security to your account</div>
                  </div>
                  <div
                    className={`toggle-switch ${settings.twoFactorAuth ? 'active' : ''}`}
                    onClick={() => toggleSetting('twoFactorAuth')}
                  />
                </div>
              </div>
            </div>

            <div className="section-card">
              <h2 className="section-title">
                <MdLock /> Password
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Current Password</div>
                  <input type="password" className="info-input" placeholder="Enter current password" />
                </div>
                <div className="info-item">
                  <div className="info-label">New Password</div>
                  <input type="password" className="info-input" placeholder="Enter new password" />
                </div>
                <div className="info-item">
                  <div className="info-label">Confirm New Password</div>
                  <input type="password" className="info-input" placeholder="Confirm new password" />
                </div>
              </div>
              <button className="btn-primary">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
