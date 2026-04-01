import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { MdPerson, MdLogout, MdArrowDropDown } from 'react-icons/md'
import './ProfileDropdown.css'

const ProfileDropdown = ({ onProfileClick, compact = false }) => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
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
    // Call the parent's profile click handler
    if (onProfileClick) {
      onProfileClick()
    }
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Navigate to landing page after logout
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
        className={`profile-avatar-btn ${compact ? 'profile-avatar-btn--compact' : ''}`}
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
        {!compact && (
          <MdArrowDropDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} aria-hidden />
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <button 
            className="dropdown-item profile-item"
            onClick={handleProfileClick}
          >
            <MdPerson size={18} />
            <span>Profile</span>
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
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
