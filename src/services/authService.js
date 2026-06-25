import axios from 'axios'
import API_CONFIG, { buildUrl } from '../config/api.js'
import { getOAuthAccessTokenFromUrl } from '../utils/authRouting.js'
import {
  shouldSkipTokenRefresh,
  getApiError,
  isEmailAlreadyRegisteredMessage,
} from '../utils/apiError.js'

const SIGNUP_PRECHECK_OTP = 100000

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // Include cookies (refreshToken) on requests to the API
  withCredentials: true
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

// Response interceptor to handle token refresh (skip login/register/OTP — show errors in-form)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !shouldSkipTokenRefresh(error)) {
      try {
        const response = await api.post('/api/auth/refresh', {})
        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        window.dispatchEvent(new CustomEvent('auth:token-refreshed'))

        error.config.headers.Authorization = `Bearer ${accessToken}`
        return api.request(error.config)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    }
    return Promise.reject(error)
  }
)

// Auth Service Functions (matching your backend API)
export const authService = {
  /**
   * Register checks email before OTP. A dummy OTP surfaces 409 for existing emails
   * without sending mail (current backend OTP generate always returns 200).
   */
  async precheckSignupEmail({ name, email, password }) {
    try {
      await api.post('/api/auth/register', {
        name: name.trim(),
        email,
        password,
        otp: SIGNUP_PRECHECK_OTP,
      })
      return { available: true, otpAlreadySent: false }
    } catch (error) {
      const status = error.response?.status
      const message = error.response?.data?.message || ''

      if (status === 409 || isEmailAlreadyRegisteredMessage(message)) {
        const err = getApiError(error, 'Email already registered')
        err.emailExists = true
        throw err
      }

      if (status === 410) {
        return { available: true, otpAlreadySent: false }
      }

      if (status === 400 && String(message).toLowerCase().includes('otp')) {
        return { available: true, otpAlreadySent: true }
      }

      throw getApiError(error, 'Unable to verify email')
    }
  },

  async generateOTP(email) {
    try {
      const response = await api.post('/api/auth/otp/generate', { email })
      return { success: true, data: response.data }
    } catch (error) {
      const err = getApiError(error, 'Failed to generate OTP')
      if (
        error.response?.status === 409 ||
        isEmailAlreadyRegisteredMessage(err.message)
      ) {
        err.emailExists = true
      }
      throw err
    }
  },

  async resendOTP(email) {
    try {
      const response = await api.post('/api/auth/otp/resend', { email })
      return { success: true, data: response.data }
    } catch (error) {
      throw getApiError(error, 'Failed to resend OTP')
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData)
      const { accessToken, user } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

      return { success: true, user }
    } catch (error) {
      throw getApiError(error, 'Registration failed')
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials)
      const { accessToken, user } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

      return { success: true, user }
    } catch (error) {
      throw getApiError(error, 'Login failed')
    }
  },

  async googleLogin() {
    window.location.href = buildUrl('/api/auth/google')
  },

  handleGoogleCallback() {
    const accessToken = getOAuthAccessTokenFromUrl()

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      window.location.hash = ''
      return { success: true }
    }

    return { success: false, error: 'No access token found' }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  },

  async logoutAll() {
    try {
      await api.post('/api/auth/logout-all')
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forget-password', { email })
      return { success: true, data: response.data }
    } catch (error) {
      throw getApiError(error, 'Failed to send reset email')
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword
      })
      return { success: true, data: response.data }
    } catch (error) {
      throw getApiError(error, 'Failed to reset password')
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  getStoredUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export default authService
