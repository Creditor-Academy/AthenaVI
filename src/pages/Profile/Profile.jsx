import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdEdit,
  MdEmail,
  MdPhone,
  MdSave,
  MdClose,
  MdPerson,
  MdVerifiedUser,
  MdNotifications,
  MdVideoLibrary,
  MdGeneratingTokens,
  MdDelete,
  MdPhotoCamera,
  MdCardMembership
} from 'react-icons/md'
import userService from '../../services/userService.js'
import creditsService from '../../services/creditsService.js'
import storageService from '../../services/storageService.js'
import videoLibraryService from '../../services/videoLibraryService.js'
import workspaceService from '../../services/workspaceService.js'
import { formatBytes } from '../../utils/formatSize.js'
import {
  formatCreditTransactionTitle,
  formatCreditTransactionSubtitle,
  formatCreditTransactionType,
} from '../../utils/creditTransactions.js'
import LoadingDots from '../../components/ui/LoadingDots/LoadingDots.jsx'

function formatRelativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff) || diff < 0) return ''
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function mapCreditTxToActivity(tx) {
  const type = String(tx?.type || '').toLowerCase()
  const title = formatCreditTransactionTitle(tx)
  const subtitle =
    formatCreditTransactionSubtitle(tx) || formatCreditTransactionType(tx.type)

  let notifType = 'info'
  let icon = <MdGeneratingTokens />

  if (type === 'usage') {
    notifType = 'success'
    icon = <MdVideoLibrary />
  } else if (type === 'platform_grant' || type === 'refund') {
    notifType = 'success'
  } else if (type === 'platform_revoke') {
    notifType = 'warning'
  } else if (type === 'allocation' || type === 'deallocation') {
    icon = <MdCardMembership />
  }

  return {
    id: tx.id,
    title,
    desc: subtitle,
    time: formatRelativeTime(tx.createdAt),
    type: notifType,
    icon,
  }
}

const Profile = () => {
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
  const [personalCredits, setPersonalCredits] = useState(null)
  const [storageQuota, setStorageQuota] = useState(null)
  const [videosExported, setVideosExported] = useState(null)
  const [workspaceCount, setWorkspaceCount] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
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
      setStatsLoading(true)
      setImageLoading(true)
      setError('')

      const [
        userData,
        creditsResult,
        storageResult,
        videosResult,
        historyResult,
        workspaceList,
      ] = await Promise.all([
        userService.getUserProfile(),
        creditsService.getPersonalBalance().catch(() => null),
        storageService.getPersonalQuota().catch(() => null),
        videoLibraryService.listUserVideos({ take: 1, skip: 0, status: 'completed' }).catch(() => null),
        creditsService.getPersonalHistory({ page: 1, limit: 5 }).catch(() => null),
        workspaceService.listWorkspaces().catch(() => []),
      ])

      const newProfile = {
        name: userData?.name || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        profileImage: userData?.profileImage || null,
      }
      setProfile(newProfile)
      updateUser(newProfile)

      if (creditsResult) {
        setPersonalCredits(creditsResult.personalCredits)
      }
      if (storageResult) {
        setStorageQuota(storageResult)
      }
      if (videosResult) {
        setVideosExported(videosResult.pagination?.total ?? videosResult.videos?.length ?? 0)
      }
      if (historyResult?.transactions) {
        setRecentActivity(historyResult.transactions.map(mapCreditTxToActivity))
      } else {
        setRecentActivity([])
      }
      setWorkspaceCount(Array.isArray(workspaceList) ? workspaceList.length : 0)

      setImageLoading(false)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message)
      setImageLoading(false)
    } finally {
      setLoading(false)
      setStatsLoading(false)
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
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a JPEG, PNG, or WebP image file')
        return
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB')
        return
      }

      try {
        setLoading(true)
        setError('')
        setImageLoading(true)
        
        const result = await userService.uploadProfileImage(file)
        
        const newProfileImageUrl = result.data?.profile?.profileImage || result.profileImage
        
        if (newProfileImageUrl) {
          const updatedProfile = { ...profile, profileImage: newProfileImageUrl }
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
        setImageLoading(false)
      }
    }
  }

  const handleDeleteImage = async () => {
    try {
      setLoading(true)
      setError('')
      setImageLoading(true)
      
      await userService.deleteProfileImage()
      
      const updatedProfile = { ...profile, profileImage: null }
      setProfile(updatedProfile)
      updateUser(updatedProfile)
    } catch (err) {
      console.error('Error deleting profile image:', err)
      setError(err.message || 'Failed to remove profile image')
    } finally {
      setLoading(false)
      setImageLoading(false)
    }
  }

  const getUserInitial = () => {
    if (profile.name) {
      return profile.name.charAt(0).toUpperCase()
    }
    if (profile.email) {
      return profile.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const planLabel = storageQuota?.tier?.label || 'Your plan'
  const storagePercent = Math.min(100, Math.round(Number(storageQuota?.percentUsed) || 0))
  const storageUsedLabel = storageQuota
    ? `${formatBytes(storageQuota.usedBytes)} / ${formatBytes(storageQuota.limitBytes)}`
    : null

  const styles = `
    .profile-page {
      max-width: 1150px;
      margin: 0 auto;
      padding: 16px 24px 40px;
      font-family: var(--font-family, 'Inter', sans-serif);
      color: var(--text-main);
    }

    .profile-header-new {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .profile-header-new h1 {
      font-family: var(--font-family);
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
      letter-spacing: -0.03em;
    }

    .profile-header-desc {
      font-size: 14px;
      color: var(--text-muted);
      margin-top: 6px;
      margin-bottom: 0;
    }

    .profile-loader {
      display: flex;
      align-items: center;
    }

    .profile-hero-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 32px;
      display: flex;
      align-items: center;
      gap: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .profile-hero-card:hover {
      border-color: rgba(var(--primary-rgb), 0.25);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
    }

    .profile-hero-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%);
      z-index: 0;
      pointer-events: none;
    }

    .profile-hero-avatar-area {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }

    .profile-avatar-wrapper {
      position: relative;
    }

    .profile-avatar-large {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--bg-card);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
    }

    .profile-avatar-large.initials-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover, var(--primary)) 100%);
      color: white;
      font-size: 48px;
      font-weight: 800;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .profile-avatar-wrapper:hover .profile-avatar-large {
      transform: scale(1.03);
      border-color: var(--primary);
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
      border: 3px solid rgba(var(--primary-rgb), 0.2);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .profile-avatar-actions {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      background: var(--bg-card);
      padding: 4px 6px;
      border-radius: 20px;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--border-color);
      z-index: 2;
    }

    .profile-avatar-btn-small {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--bg-surface);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--border-color);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .profile-avatar-btn-small:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: scale(1.1);
    }

    .profile-avatar-btn-small.delete:hover {
      background: var(--delete-red, #ef4444);
      color: white;
      border-color: var(--delete-red, #ef4444);
    }

    .profile-hero-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      z-index: 1;
    }

    .profile-hero-name {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .profile-hero-email {
      font-size: 15px;
      color: var(--text-muted);
      margin: 0 0 6px 0;
      word-break: break-all;
    }

    .plan-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover, var(--primary)) 100%);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
      border: none;
      font-family: inherit;
    }

    .profile-layout-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 28px;
    }

    .profile-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .profile-card:hover {
      border-color: rgba(var(--primary-rgb), 0.25);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
    }

    .profile-section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      letter-spacing: -0.01em;
    }

    .profile-section-title svg {
      color: var(--primary);
    }

    .stat-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-title {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-main);
    }

    .stat-value {
      font-weight: 700;
      color: var(--text-main);
    }

    .progress-bar-bg {
      width: 100%;
      height: 8px;
      background: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light, var(--primary)) 100%);
      border-radius: 4px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .credits-count-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(var(--primary-rgb), 0.06);
      border: 1px dashed rgba(var(--primary-rgb), 0.25);
      padding: 16px;
      border-radius: 16px;
      margin-top: 24px;
    }

    .credits-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .credits-label svg {
      font-size: 18px;
      color: var(--primary);
    }

    .credits-value {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
    }

    .profile-detail-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-radius: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 12px;
    }

    .profile-detail-item:last-child {
      margin-bottom: 0;
    }

    .profile-detail-item:hover {
      background: var(--bg-card);
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
      transform: translateY(-2px);
    }

    .profile-detail-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      min-width: 0;
    }

    .profile-detail-icon {
      width: 44px;
      height: 44px;
      background: rgba(var(--primary-rgb), 0.08);
      color: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      transition: background 0.2s, color 0.2s;
    }

    .profile-detail-item:hover .profile-detail-icon {
      background: var(--primary);
      color: white;
    }

    .profile-detail-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .profile-detail-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .profile-detail-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      flex-shrink: 0;
      font-family: inherit;
    }

    .profile-detail-edit-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .profile-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .profile-input-row {
      display: flex;
      gap: 12px;
      width: 100%;
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
      font-family: inherit;
    }

    .profile-edit-input:focus {
      border-color: var(--primary);
      background: var(--bg-card);
      box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.15);
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
      font-family: inherit;
    }

    .profile-btn-save-new {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
    }

    .profile-btn-save-new:hover {
      background: var(--primary-hover, var(--primary));
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
      background: var(--bg-card);
      border-left: 4px solid var(--delete-red, #ef4444);
      color: var(--text-main);
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border-top: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      z-index: 1000;
    }

    .loading-pulse {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: var(--primary);
      border-radius: 50%;
      margin: 0 4px;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { transform: scale(0.8); opacity: 0.5; }
      to { transform: scale(1.2); opacity: 1; }
    }

    .notif-item-rich {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 12px;
    }

    .notif-item-rich:last-child {
      margin-bottom: 0;
    }

    .notif-item-rich:hover {
      background: var(--bg-card);
      border-color: rgba(var(--primary-rgb), 0.25);
      transform: translateX(4px);
    }

    .notif-icon-box {
      width: 44px;
      height: 44px;
      background: rgba(var(--primary-rgb), 0.08);
      color: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .notif-icon-box.success { background: rgba(16, 185, 129, 0.1); color: var(--success-green, #10b981); }
    .notif-icon-box.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning-amber, #f59e0b); }
    .notif-icon-box.info { background: rgba(var(--primary-rgb), 0.08); color: var(--primary); }

    .notif-main {
      flex: 1;
      min-width: 0;
    }

    .notif-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      gap: 8px;
    }

    .notif-title-text {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .notif-time-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .notif-body-text {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0;
    }

    @media (max-width: 850px) {
      .profile-hero-card {
        flex-direction: column;
        text-align: center;
        align-items: center;
        padding: 40px 24px;
      }
      .profile-hero-info {
        align-items: center;
      }
      .profile-layout-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  `

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
    >
      <style>{styles}</style>
      
      <header className="profile-header-new">
        <div>
          <h1>Profile Settings</h1>
          <p className="profile-header-desc">Manage your personal information, subscription plan, and workspace limits.</p>
        </div>
        {loading && (
          <div className="profile-loader">
            <div className="loading-pulse" />
            <div className="loading-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="loading-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </header>

      <div className="profile-hero-card">
        <div className="profile-hero-avatar-area">
          <div className="profile-avatar-wrapper">
            {profile.profileImage ? (
              imageLoading ? (
                <div className="profile-avatar-large loading-avatar">
                  <div className="avatar-loading-spinner"></div>
                </div>
              ) : (
                <img 
                  src={profile.profileImage}
                  alt="Profile" 
                  className="profile-avatar-large"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              )
            ) : (
              <div className="profile-avatar-large initials-avatar">
                {getUserInitial()}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div className="profile-avatar-actions">
              <button 
                className="profile-avatar-btn-small"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Profile Photo"
              >
                <MdPhotoCamera size={16} />
              </button>
              {profile.profileImage && (
                <button 
                  className="profile-avatar-btn-small delete"
                  onClick={handleDeleteImage}
                  title="Remove Profile Photo"
                >
                  <MdDelete size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-hero-info">
          <h2 className="profile-hero-name">{profile.name || 'Your Name'}</h2>
          <p className="profile-hero-email">{profile.email}</p>
          <div className="plan-badge">
            <MdCardMembership size={16} />
            <span>{planLabel}</span>
          </div>
          {workspaceCount != null && workspaceCount > 0 && (
            <p className="profile-hero-email" style={{ margin: 0, fontSize: '13px' }}>
              {workspaceCount} workspace{workspaceCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>

      <div className="profile-layout-grid">
        <section className="profile-card">
          <h3 className="profile-section-title">
            <MdVideoLibrary size={22} />
            Resource Usage
          </h3>
          
          <div className="stat-row">
            <div className="stat-header">
              <span className="stat-title">Storage Used</span>
              <span className="stat-value">
                {statsLoading ? (
                  <LoadingDots size="sm" />
                ) : storageUsedLabel ? (
                  storageUsedLabel
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: statsLoading ? '0%' : `${storagePercent}%` }}
              />
            </div>
          </div>

          <div className="stat-row">
            <div className="stat-header">
              <span className="stat-title">Videos Exported</span>
              <span className="stat-value">
                {statsLoading ? (
                  <LoadingDots size="sm" />
                ) : videosExported == null ? (
                  '—'
                ) : (
                  `${Number(videosExported).toLocaleString()} completed`
                )}
              </span>
            </div>
          </div>

          <div className="credits-count-container">
            <span className="credits-label">
              <MdGeneratingTokens />
              Personal Credits
            </span>
            <span className="credits-value">
              {statsLoading || personalCredits == null ? (
                <LoadingDots size="sm" />
              ) : (
                Number(personalCredits).toLocaleString()
              )}
            </span>
          </div>
        </section>

        <section className="profile-card">
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
            <MdVerifiedUser style={{ color: 'var(--success-green, #10b981)', flexShrink: 0 }} size={20} title="Verified" />
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-left">
              <div className="profile-detail-icon">
                <MdPerson />
              </div>
              {editing === 'name' ? (
                <div className="profile-input-wrapper">
                  <span className="profile-detail-label">Full Name</span>
                  <div className="profile-input-row">
                    <input
                      className="profile-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      placeholder="Enter your name"
                    />
                    <div className="profile-edit-actions">
                      <button 
                        className="profile-action-btn profile-btn-save-new" 
                        onClick={() => handleSave('name')}
                        title="Save"
                      >
                        <MdSave size={18} />
                      </button>
                      <button 
                        className="profile-action-btn profile-btn-cancel-new" 
                        onClick={handleCancel}
                        title="Cancel"
                      >
                        <MdClose size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Full Name</span>
                  <span className="profile-detail-value">{profile.name || 'Add your name'}</span>
                </div>
              )}
            </div>
            {editing !== 'name' && (
              <button 
                className="profile-detail-edit-btn"
                onClick={() => handleEdit('name', profile.name)}
                title="Edit Name"
              >
                <MdEdit size={16} />
              </button>
            )}
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-left">
              <div className="profile-detail-icon">
                <MdPhone />
              </div>
              {editing === 'phoneNumber' ? (
                <div className="profile-input-wrapper">
                  <span className="profile-detail-label">Phone Number</span>
                  <div className="profile-input-row">
                    <input
                      className="profile-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      placeholder="Enter phone number"
                    />
                    <div className="profile-edit-actions">
                      <button 
                        className="profile-action-btn profile-btn-save-new" 
                        onClick={() => handleSave('phoneNumber')}
                        title="Save"
                      >
                        <MdSave size={18} />
                      </button>
                      <button 
                        className="profile-action-btn profile-btn-cancel-new" 
                        onClick={handleCancel}
                        title="Cancel"
                      >
                        <MdClose size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Phone Number</span>
                  <span className="profile-detail-value">{profile.phoneNumber || 'Add phone number'}</span>
                </div>
              )}
            </div>
            {editing !== 'phoneNumber' && (
              <button 
                className="profile-detail-edit-btn"
                onClick={() => handleEdit('phoneNumber', profile.phoneNumber)}
                title="Edit Phone Number"
              >
                <MdEdit size={16} />
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="profile-card" style={{ marginTop: '28px' }}>
        <h3 className="profile-section-title">
          <MdNotifications size={22} />
          Recent Activity
        </h3>
        
        <div className="notifications-list-rich">
          {statsLoading ? (
            <p className="profile-header-desc" style={{ margin: 0, padding: '8px 0' }}>
              <LoadingDots size="sm" /> Loading activity…
            </p>
          ) : recentActivity.length === 0 ? (
            <p className="profile-header-desc" style={{ margin: 0, padding: '8px 0' }}>
              No recent credit or usage activity yet.
            </p>
          ) : (
            recentActivity.map((notif) => (
              <div key={notif.id} className="notif-item-rich">
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
            ))
          )}
        </div>
      </section>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-toast"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <MdClose size={20} style={{ cursor: 'pointer', marginRight: '4px', flexShrink: 0 }} onClick={() => setError('')} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Profile


