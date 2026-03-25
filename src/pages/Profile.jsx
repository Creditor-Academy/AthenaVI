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
  MdVerifiedUser
} from 'react-icons/md'
import userService from '../services/userService.js'

const Profile = ({ onBack }) => {
  const { user, isAuthenticated } = useAuth()
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
      font-family: 'Inter', sans-serif;
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
      color: #1e293b;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
    }

    .profile-sidebar-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 24px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
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
      border: 4px solid white;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .profile-avatar-large.loading-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      color: #64748b;
    }

    .avatar-loading-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(37, 99, 235, 0.3);
      border-top: 3px solid #2563eb;
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
      background: #2563eb;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .profile-avatar-edit:hover {
      transform: scale(1.1);
      background: #1d4ed8;
    }

    .profile-name-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }

    .profile-email-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .profile-stats-mini {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(226, 232, 240, 0.6);
      width: 100%;
    }

    .profile-stat-item {
      flex: 1;
    }

    .profile-stat-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }

    .profile-stat-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .profile-main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-detail-card {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
    }

    .profile-section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .profile-section-title svg {
      color: #2563eb;
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
      background: #f8fafc;
      border-color: #f1f5f9;
    }

    .profile-detail-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profile-detail-icon {
      width: 44px;
      height: 44px;
      background: #eff6ff;
      color: #2563eb;
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
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .profile-detail-value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }

    .profile-detail-edit-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .profile-detail-edit-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .profile-input-group {
      display: flex;
      gap: 12px;
      flex: 1;
    }

    .profile-edit-input {
      flex: 1;
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      outline: none;
      background: #f8fafc;
      transition: all 0.2s;
    }

    .profile-edit-input:focus {
      border-color: #2563eb;
      background: white;
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
      background: #2563eb;
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .profile-btn-save-new:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .profile-btn-cancel-new {
      background: #f1f5f9;
      color: #64748b;
    }

    .profile-btn-cancel-new:hover {
      background: #e2e8f0;
      color: #1e293b;
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
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .loading-pulse {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: #2563eb;
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
              <span className="profile-stat-value">Free</span>
              <span className="profile-stat-label">Plan</span>
            </div>
            <div className="profile-stat-item">
              <span className="profile-stat-value">12</span>
              <span className="profile-stat-label">Videos</span>
            </div>
          </div>
        </aside>

        <div className="profile-main-content">
          <section className="profile-detail-card">
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

