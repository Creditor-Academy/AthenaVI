import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService.js'

// Create Auth Context
const AuthContext = createContext()

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          let userData = authService.getStoredUser()
          
          // If id is missing (due to previous bug), fetch profile to get it
          if (userData && !userData.id) {
            // Try to recover id from _id first
            if (userData._id) {
              userData = { ...userData, id: userData._id }
              localStorage.setItem('user', JSON.stringify(userData))
              console.log('Recovered user id from _id:', userData.id)
            } else if (userData.userId) {
              userData = { ...userData, id: userData.userId }
              localStorage.setItem('user', JSON.stringify(userData))
              console.log('Recovered user id from userId:', userData.id)
            } else {
              console.log('User ID missing from stored data, fetching profile...')
              try {
                // Import userService dynamically to avoid circular dependencies if any
                const { default: userService } = await import('../services/userService.js')
                const profile = await userService.getUserProfile()
                const profileId = profile?.id || profile?._id || profile?.userId
                if (profile && profileId) {
                  userData = { ...userData, ...profile, id: profileId }
                  localStorage.setItem('user', JSON.stringify(userData))
                }
              } catch (profileError) {
                console.error('Failed to fetch profile for ID recovery:', profileError)
              }
            }
          }
          
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid tokens - use the same keys as authService
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    setLoading(true)
    try {
      const { user: userData } = await authService.login(credentials)
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    setLoading(true)
    try {
      const { user: newUser } = await authService.register(userData)
      setUser(newUser)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Generate OTP function
  const generateOTP = async (email) => {
    setLoading(true)
    try {
      const result = await authService.generateOTP(email)
      return { success: true, data: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP function
  const resendOTP = async (email) => {
    setLoading(true)
    try {
      const result = await authService.resendOTP(email)
      return { success: true, data: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password function
  const forgotPassword = async (email) => {
    setLoading(true)
    try {
      const result = await authService.forgotPassword(email)
      return { success: true, data: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Reset Password function
  const resetPassword = async (token, newPassword) => {
    setLoading(true)
    try {
      const result = await authService.resetPassword(token, newPassword)
      return { success: true, data: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Google login function
  const googleLogin = async (googleToken) => {
    setLoading(true)
    try {
      const { user: userData } = await authService.googleLogin(googleToken)
      setUser(userData)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      // Still logout locally even if backend call fails
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Update user data
  const updateUser = (newUserData) => {
    setUser(newUserData)
    localStorage.setItem('user', JSON.stringify(newUserData))
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    generateOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    googleLogin,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
