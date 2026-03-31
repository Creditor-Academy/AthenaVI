import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdEdit,
  MdEmail,
  MdPhone,
  MdSave,
  MdClose,
  MdArrowBack,
  MdPerson,
  MdUpload,
  MdVerifiedUser,
  MdNotifications,
  MdVideoLibrary,
  MdGeneratingTokens,
  MdSecurity
} from 'react-icons/md'
import userService from '../services/userService.js'

const Profile = ({ onBack }) => {
  const { user, isAuthenticated, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profileImage: null
  })
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Load user profile on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile()
    } else {
      setError('User not authenticated')
    }
  }, [isAuthenticated])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setImageLoading(true)
      setError('')
      
      const userData = await userService.getUserProfile()
       
      const newProfile = {
        name: userData?.name || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        profileImage: userData?.profileImage || null
      }
      setProfile(newProfile)
      updateUser(newProfile)
      setImageLoading(false)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message)
      setImageLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (field, value) => {
    setEditing(field)
    setEditValue(value)
  }

  const handleSave = async (field) => {
    try {
      setLoading(true)
      setError('')
      
      const updatedProfile = { ...profile, [field]: editValue }
      await userService.updateUserProfile(updatedProfile)
      
      setProfile(updatedProfile)
      updateUser(updatedProfile)
      setEditing(null)
      setEditValue('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type - match backend allowed types
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a JPEG, PNG, or WebP image file')
        return
      }
      
      // Validate file size - match backend 2MB limit
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB')
        return
      }

      try {
        setLoading(true)
        setError('')
        
        const result = await userService.uploadProfileImage(file)
        console.log('Upload result:', result)
        console.log('Upload result data:', result.data)
        console.log('Upload result profile:', result.data?.profile)
        console.log('Upload result profileImage:', result.data?.profile?.profileImage)
        
        // Extract the new profile image URL from the response
        const newProfileImageUrl = result.data?.profile?.profileImage || result.profileImage
        console.log('New profile image URL:', newProfileImageUrl)
        
        if (newProfileImageUrl) {
          const updatedProfile = { ...profile, profileImage: newProfileImageUrl }
          console.log('Updating profile with:', updatedProfile)
          setProfile(updatedProfile)
          updateUser(updatedProfile)
        } else {
          console.error('No profile image URL found in response')
          setError('Profile image uploaded but URL not found in response')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const styles = `
    .profile-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      font-family: var(--font-family, 'Inter', sans-serif);
      color: var(--text-main);
    }

    .profile-header-new {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .profile-header-new h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
    }

    .profile-sidebar-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .profile-avatar-wrapper {
      position: relative;
      margin-bottom: 24px;
    }

    .profile-avatar-large {
      width: 120px;
      height: 120px;
      border-radius: 40px;
      object-fit: cover;
      border: 4px solid var(--bg-card);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }

    .profile-avatar-large.loading-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-surface);
      color: var(--text-muted);
    }

    .avatar-loading-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(37, 99, 235, 0.3);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .profile-avatar-edit {
      position: absolute;
      bottom: -8px;
      right: -8px;
      background: var(--primary);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 3px solid var(--bg-card);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .profile-avatar-edit:hover {
      transform: scale(1.1);
      background: var(--primary-hover, #1d4ed8);
    }

    .profile-name-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 4px 0;
    }

    .profile-email-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }

    .profile-stats-mini {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      width: 100%;
    }

    .profile-stat-item {
      flex: 1;
    }

    .profile-stat-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .profile-stat-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .profile-main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-detail-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .profile-section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .profile-section-title svg {
      color: var(--primary);
    }

    .profile-detail-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-radius: 16px;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .profile-detail-item:hover {
      background: var(--bg-surface);
      border-color: var(--border-color);
    }

    .profile-detail-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profile-detail-icon {
      width: 44px;
      height: 44px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .profile-detail-info {
      display: flex;
      flex-direction: column;
    }

    .profile-detail-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .profile-detail-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
    }

    .profile-detail-edit-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--bg-surface);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--border-color);
      transition: all 0.2s;
    }

    .profile-detail-edit-btn:hover {
      background: var(--bg-main);
      color: var(--text-main);
    }

    .profile-input-group {
      display: flex;
      gap: 12px;
      flex: 1;
    }

    .profile-edit-input {
      flex: 1;
      padding: 10px 16px;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      outline: none;
      background: var(--bg-surface);
      transition: all 0.2s;
    }

    .profile-edit-input:focus {
      border-color: var(--primary);
      background: var(--bg-card);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    }

    .profile-edit-actions {
      display: flex;
      gap: 8px;
    }

    .profile-action-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .profile-btn-save-new {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .profile-btn-save-new:hover {
      background: var(--primary-hover, #1d4ed8);
      transform: translateY(-2px);
    }

    .profile-btn-cancel-new {
      background: var(--bg-surface);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
    }

    .profile-btn-cancel-new:hover {
      background: var(--bg-main);
      color: var(--text-main);
    }

    .error-toast {
      position: fixed;
      bottom: 40px;
      right: 40px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 16px 24px;
      border-radius: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 1000;
    }

    .loading-pulse {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: var(--primary);
      border-radius: 50%;
      margin: 0 4px;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(0.8); opacity: 0.5; }
      to { transform: scale(1.2); opacity: 1; }
    }

    @media (max-width: 850px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      .profile-sidebar-card {
        padding: 40px 24px;
      }
    }

    .profile-section-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      margin-bottom: 24px;
    }

    .notif-item-rich {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: 20px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      margin-bottom: 8px;
    }

    .notif-item-rich:hover {
      background: var(--bg-surface);
      border-color: var(--border-color);
      transform: translateX(4px);
    }

    .notif-icon-box {
      width: 48px;
      height: 48px;
      background: rgba(3, 105, 161, 0.1);
      color: #0ea5e9;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .notif-icon-box.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .notif-icon-box.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .notif-icon-box.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

    .notif-main {
      flex: 1;
    }

    .notif-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .notif-title-text {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .notif-time-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .notif-body-text {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0;
    }
  `

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <style>{styles}</style>
      
      <div className="profile-header-new">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack}
            className="profile-detail-edit-btn"
            style={{ width: '40px', height: '40px' }}
          >
            <MdArrowBack size={20} />
          </button>
          <h1>Profile Settings</h1>
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="loading-pulse" />
            <div className="loading-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="loading-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      <div className="profile-grid">
        <aside className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            {imageLoading ? (
              <div className="profile-avatar-large loading-avatar">
                <div className="avatar-loading-spinner"></div>
              </div>
            ) : (
              <img 
                src={profile.profileImage || 'https://ui-avatars.com/api/?name=' + (profile.name || 'User') + '&background=2563eb&color=fff&size=200'}
                alt="Profile" 
                className="profile-avatar-large"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <motion.button 
              className="profile-avatar-edit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <MdUpload size={18} />
            </motion.button>
          </div>
          <h2 className="profile-name-title">{profile.name || 'Your Name'}</h2>
          <p className="profile-email-subtitle">{profile.email}</p>
          
          <div className="profile-stats-mini">
            <div className="profile-stat-item">
              <span className="profile-stat-label">Current Plan</span>
              <span className="profile-stat-value" style={{ color: 'var(--primary)' }}>Pro Elite</span>
            </div>
          </div>
          <div className="profile-stats-mini" style={{ marginTop: '12px', borderTop: 'none', paddingTop: 0 }}>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Videos Created</span>
              <span className="profile-stat-value">48 / 100</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-label">Credits</span>
              <span className="profile-stat-value">1,240</span>
            </div>
          </div>
        </aside>

        <div className="profile-main-content">
          <section className="profile-section-card">
            <h3 className="profile-section-title">
              <MdPerson size={22} />
              Personal Details
            </h3>
            
            <div className="profile-detail-item">
              <div className="profile-detail-left">
                <div className="profile-detail-icon">
                  <MdEmail />
                </div>
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Email Address</span>
                  <span className="profile-detail-value">{profile.email}</span>
                </div>
              </div>
              <MdVerifiedUser style={{ color: '#10b981' }} size={20} title="Verified" />
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-left" style={{ flex: 1 }}>
                <div className="profile-detail-icon">
                  <MdPerson />
                </div>
                {editing === 'name' ? (
                  <div className="profile-input-group">
                    <input
                      className="profile-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      placeholder="Enter your name"
                    />
                    <div className="profile-edit-actions">
                      <button className="profile-action-btn profile-btn-save-new" onClick={() => handleSave('name')}>
                        <MdSave size={18} />
                      </button>
                      <button className="profile-action-btn profile-btn-cancel-new" onClick={handleCancel}>
                        <MdClose size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-detail-info">
                    <span className="profile-detail-label">Full Name</span>
                    <span className="profile-detail-value">{profile.name || 'Add your name'}</span>
                  </div>
                )}
              </div>
              {!editing && (
                <button 
                  className="profile-detail-edit-btn"
                  onClick={() => handleEdit('name', profile.name)}
                >
                  <MdEdit size={16} />
                </button>
              )}
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-left" style={{ flex: 1 }}>
                <div className="profile-detail-icon">
                  <MdPhone />
                </div>
                {editing === 'phoneNumber' ? (
                  <div className="profile-input-group">
                    <input
                      className="profile-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      placeholder="Enter phone number"
                    />
                    <div className="profile-edit-actions">
                      <button className="profile-action-btn profile-btn-save-new" onClick={() => handleSave('phoneNumber')}>
                        <MdSave size={18} />
                      </button>
                      <button className="profile-action-btn profile-btn-cancel-new" onClick={handleCancel}>
                        <MdClose size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-detail-info">
                    <span className="profile-detail-label">Phone Number</span>
                    <span className="profile-detail-value">{profile.phoneNumber || 'Add phone number'}</span>
                  </div>
                )}
              </div>
              {!editing && (
                <button 
                  className="profile-detail-edit-btn"
                  onClick={() => handleEdit('phoneNumber', profile.phoneNumber)}
                >
                  <MdEdit size={16} />
                </button>
              )}
            </div>
          </section>

          <section className="profile-section-card">
            <h3 className="profile-section-title">
              <MdNotifications size={22} />
              Recent Notifications
            </h3>
            
            <div className="notifications-list-rich">
              {[
                { title: 'Video Exported', desc: 'Your video "Product Demo Alpha" is now available for download.', time: '2 hours ago', type: 'success', icon: <MdVideoLibrary /> },
                { title: 'Credits Refilled', desc: 'Your monthly credit balance has been renewed successfully.', time: '1 day ago', type: 'info', icon: <MdGeneratingTokens /> },
                { title: 'Security Alert', desc: 'Your password was successfully updated.', time: '3 days ago', type: 'warning', icon: <MdSecurity /> }
              ].map((notif, idx) => (
                <div key={idx} className="notif-item-rich">
                  <div className={`notif-icon-box ${notif.type}`}>
                    {notif.icon}
                  </div>
                  <div className="notif-main">
                    <div className="notif-header-row">
                      <span className="notif-title-text">{notif.title}</span>
                      <span className="notif-time-tag">{notif.time}</span>
                    </div>
                    <p className="notif-body-text">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-toast"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <MdClose size={20} style={{ cursor: 'pointer' }} onClick={() => setError('')} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Profile

