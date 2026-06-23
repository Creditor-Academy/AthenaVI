// API Configuration - Central place for all backend URLs
const API_CONFIG = {
  // Backend base URL - Change this when deploying to different environments
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
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
      PROFILE: '/api/user/profile',
      CAPABILITIES: '/api/user/capabilities',
      GET_ALL: '/api/user/getall',
      // user settings endpoints are under /api/user/settings
      USER_SETTINGS: {
        APPEARANCE: '/api/user/settings/appearance',
        NOTIFICATIONS: '/api/user/settings/notifications'
      },
      INBOX: {
        LIST: '/api/user/inbox',
        UNREAD_COUNT: '/api/user/inbox/unread-count',
        ONE: (notificationId) => `/api/user/inbox/${notificationId}`,
        MARK_READ: (notificationId) => `/api/user/inbox/${notificationId}/read`,
        MARK_BULK_READ: '/api/user/inbox/read',
        MARK_ALL_READ: '/api/user/inbox/read-all',
      }
    },
    
    // Storage API
    STORAGE: {
      ME: '/api/user/storage',
      ME_HISTORY: '/api/user/storage/history',
      REQUEST: '/api/user/storage/request',
      REQUESTS: '/api/user/storage/requests',
      WORKSPACE: (workspaceId) => `/api/workspaces/${workspaceId}/storage`,
    },

    // Assets API
    ASSETS: {
      LIST: (workspaceId) => `/api/assets/${workspaceId}`,
      UPLOAD: (workspaceId) => `/api/assets/${workspaceId}/upload`,
      RENAME: (workspaceId, assetId) => `/api/assets/${workspaceId}/${assetId}/rename`,
      DELETE: (workspaceId, assetId) => `/api/assets/${workspaceId}/${assetId}`,
    },

    // Video library (completed final renders)
    VIDEO_LIBRARY: {
      USER: '/api/user/videos',
      WORKSPACE: (workspaceId) => `/api/workspaces/${workspaceId}/videos`,
    },

    // Credits API
    CREDITS: {
      ME: '/api/credits/me',
      ME_HISTORY: '/api/credits/me/history',
      ME_ESTIMATE: '/api/credits/me/estimate',
      WORKSPACE: (workspaceId) => `/api/credits/${workspaceId}`,
      WORKSPACE_HISTORY: (workspaceId) => `/api/credits/${workspaceId}/history`,
      MY_HISTORY: (workspaceId) => `/api/credits/${workspaceId}/my-history`,
      USAGE_BY_MEMBER: (workspaceId) => `/api/credits/${workspaceId}/usage-by-member`,
      ESTIMATE: (workspaceId) => `/api/credits/${workspaceId}/estimate`,
      ALLOCATE: (workspaceId) => `/api/credits/${workspaceId}/allocate`,
      DEALLOCATE: (workspaceId) => `/api/credits/${workspaceId}/deallocate`,
    },

    // HeyGen API
    HEYGEN: {
      AVATARS: {
        GROUPS: '/api/heygen/avatars/groups',
        LOOKS: '/api/heygen/avatars/looks',
        CREATE: '/api/heygen/avatars',
        UPLOAD: '/api/heygen/avatars/upload',
      },
      VOICES: {
        LIST: '/api/heygen/voices',
        DESIGN: '/api/heygen/voices',
        CLONE: '/api/heygen/voices/clone',
        UPLOAD: '/api/heygen/voices/upload',
        SELECT: '/api/heygen/voices/select',
        PREVIEW: '/api/heygen/voices/preview-speech',
        STATUS: '/api/heygen/voices' // Path will be /api/heygen/voices/:voiceId
      },
      VIDEOS: {
        CREATE: (workspaceId, projectId) => `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos`
      }
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
