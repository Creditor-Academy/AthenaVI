import axios from 'axios'
import { buildUrl, getAuthHeaders } from '../config/api.js'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const response = await axios.post(buildUrl('/api/auth/refresh'), {})
        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        
        // Retry the original request
        error.config.headers.Authorization = `Bearer ${accessToken}`
        return api.request(error.config)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth Service Functions (matching your backend API)
export const authService = {
  // Generate OTP
  async generateOTP(email) {
    try {
      const response = await api.post('/api/auth/otp/generate', { email })
      return { success: true, data: response.data }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate OTP')
    }
  },

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await api.post('/api/auth/otp/resend', { email })
      return { success: true, data: response.data }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP')
    }
  },

  // Register with OTP
  async register(userData) {
    try {
      console.log('Making registration request to:', '/api/auth/register')
      console.log('Registration data:', userData)
      
      const response = await api.post('/api/auth/register', userData)
      
      console.log('Registration response:', response)
      console.log('Response data:', response.data)
      
      const { accessToken, user } = response.data.data
      
      // Store access token
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { success: true, user }
    } catch (error) {
      console.error('Registration service error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      throw new Error(errorMessage)
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials)
      const { accessToken, user } = response.data.data
      
      // Store access token
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { success: true, user }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // Google OAuth - Redirect to Google
  async googleLogin() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = buildUrl('/api/auth/google')
  },

  // Handle Google OAuth callback
  handleGoogleCallback() {
    // Extract access token from URL hash
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      // Clear the hash from URL
      window.location.hash = ''
      return { success: true }
    }
    
    return { success: false, error: 'No access token found' }
  },

  // Logout current device
  async logout() {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  },

  // Logout from all devices
  async logoutAll() {
    try {
      await api.post('/api/auth/logout-all')
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  },

  // Forgot Password - Send reset email
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forget-password', { email })
      return { success: true, data: response.data }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email')
    }
  },

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword
      })
      return { success: true, data: response.data }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password')
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export default authService
