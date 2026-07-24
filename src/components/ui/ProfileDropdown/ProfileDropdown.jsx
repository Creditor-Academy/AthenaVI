import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { MdPerson, MdNotifications, MdLogout, MdArrowDropDown } from 'react-icons/md'
import './ProfileDropdown.css'

const ProfileDropdown = ({ onProfileClick, onNotificationClick, notificationCount = 0 }) => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const firstName = user?.name
    ? user.name.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'User'

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick()
    setIsOpen(false)
  }

  const handleNotificationsClick = () => {
    if (onNotificationClick) onNotificationClick()
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.hash = '#/'
    } catch (error) {
      console.error('Logout error:', error)
    }
    setIsOpen(false)
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        type="button"
        className="profile-capsule-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Profile menu"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="" />
          ) : (
            getUserInitial()
          )}
        </div>
        <span className="profile-name">{firstName}</span>
        <MdArrowDropDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} aria-hidden />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <button 
            type="button"
            className="dropdown-item profile-item"
            onClick={handleProfileClick}
          >
            <MdPerson size={18} />
            <span>View Profile</span>
          </button>
          
          <button 
            type="button"
            className="dropdown-item notif-item"
            onClick={handleNotificationsClick}
          >
            <span className="dropdown-item-icon-wrap">
              <MdNotifications size={18} />
              {notificationCount > 0 && (
                <span className="dropdown-item-badge">{notificationCount > 9 ? '9+' : notificationCount}</span>
              )}
            </span>
            <span>Notifications</span>
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
            type="button"
            className="dropdown-item logout-item"
            onClick={handleLogout}
          >
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
