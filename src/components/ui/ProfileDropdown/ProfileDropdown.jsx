import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { MdPerson, MdLogout, MdArrowDropDown, MdWarning } from 'react-icons/md'
import { ShieldCheck } from 'lucide-react'
import './ProfileDropdown.css'

const ProfileDropdown = ({ onProfileClick, compact = false, isAdminPortal = false, onToggleSuperadmin }) => {
  const { user, logout, canAccessSuperadminPortal } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef(null)

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!showLogoutConfirm) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event) => {
      if (event.key === 'Escape' && !isLoggingOut) {
        setShowLogoutConfirm(false)
      }
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [showLogoutConfirm, isLoggingOut])

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick()
    }
    setIsOpen(false)
  }

  const openLogoutConfirm = () => {
    setIsOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      window.location.hash = '#/'
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
    }
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
            type="button"
            className="dropdown-item profile-item"
            onClick={handleProfileClick}
          >
            <MdPerson size={18} />
            <span>Profile</span>
          </button>

          {canAccessSuperadminPortal && (
            <div className="profile-dropdown-toggle-row">
              <div className="profile-dropdown-toggle-label">
                <ShieldCheck size={18} />
                <span>Superadmin</span>
              </div>
              <button
                type="button"
                className={`profile-switch-toggle ${isAdminPortal ? 'active' : ''}`}
                onClick={() => {
                  onToggleSuperadmin?.(!isAdminPortal)
                  setIsOpen(false)
                }}
                role="switch"
                aria-checked={isAdminPortal}
                aria-label="Toggle Superadmin mode"
                title={isAdminPortal ? 'Turn off Superadmin mode' : 'Turn on Superadmin mode'}
              >
                <span className="profile-switch-thumb" />
              </button>
            </div>
          )}

          <div className="dropdown-divider"></div>

          <button
            type="button"
            className="dropdown-item logout-item"
            onClick={openLogoutConfirm}
          >
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {showLogoutConfirm &&
        createPortal(
          <div
            className="logout-confirm-overlay"
            onClick={() => {
              if (!isLoggingOut) setShowLogoutConfirm(false)
            }}
          >
            <div
              className="logout-confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="logout-confirm-title"
              aria-describedby="logout-confirm-text"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="logout-confirm-icon-wrap" aria-hidden="true">
                <MdWarning size={28} />
              </div>
              <h3 id="logout-confirm-title">Log out?</h3>
              <p id="logout-confirm-text">
                Are you sure you want to log out of your account?
              </p>
              <div className="logout-confirm-actions">
                <button
                  type="button"
                  className="logout-confirm-btn logout-confirm-btn-cancel"
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={isLoggingOut}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="logout-confirm-btn logout-confirm-btn-confirm"
                  onClick={handleConfirmLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default ProfileDropdown
