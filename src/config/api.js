// API Configuration - Central place for all backend URLs
const API_CONFIG = {
  // Backend base URL - Change this when deploying to different environments
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000',
  
  // API Endpoints (matching your backend documentation)
  ENDPOINTS: {
    // Authentication
    AUTH: {
      // OTP
      GENERATE_OTP: '/api/auth/otp/generate',
      RESEND_OTP: '/api/auth/otp/resend',
      
      // Registration & Login
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      
      // Password Reset
      FORGET_PASSWORD: '/api/auth/forget-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      
      // Google OAuth
      GOOGLE_AUTH: '/api/auth/google',
      GOOGLE_CALLBACK: '/api/auth/google/callback',
      
      // Token Management
      REFRESH_TOKEN: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      LOGOUT_ALL: '/api/auth/logout-all'
    },
    
    // User Management
    USER: {
      GET_ALL: '/api/user/getall'
      // Note: No individual user profile endpoint mentioned in docs
    }
  },
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

// Helper function to build full URLs
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get auth headers (only access token)
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export default API_CONFIG
