// API Configuration - Central place for all backend URLs
const API_CONFIG = {
  // Backend base URL - Change this when deploying to different environments
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
  // API Endpoints (matching your backend documentation)
  ENDPOINTS: {
    // Early Access (public, no auth)
    EARLY_ACCESS: {
      REQUEST: '/api/early-access/request',
    },

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

    // Video library (completed final renders / Remotion exports)
    VIDEO_LIBRARY: {
      USER: '/api/user/videos',
      WORKSPACE: (workspaceId) => `/api/workspaces/${workspaceId}/videos`,
    },

    // Workspace content tabs: Videos (VIDEO projects) / Presentations / Image Gen
    WORKSPACE_LIBRARY: (workspaceId) => `/api/workspaces/${workspaceId}/library`,

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
        DELETE_GROUP: (groupId) => `/api/heygen/avatars/${groupId}`,
        DELETE_LOOK: (lookId) => `/api/heygen/avatars/looks/${lookId}`,
      },
      VOICES: {
        LIST: '/api/heygen/voices',
        DESIGN: '/api/heygen/voices',
        CLONE: '/api/heygen/voices/clone',
        UPLOAD: '/api/heygen/voices/upload',
        SELECT: '/api/heygen/voices/select',
        PREVIEW: '/api/heygen/voices/preview-speech',
        STATUS: '/api/heygen/voices', // Path will be /api/heygen/voices/:voiceId
        DELETE: (voiceId) => `/api/heygen/voices/${voiceId}`,
      },
      VIDEOS: {
        CREATE: (workspaceId, projectId) => `/api/workspaces/${workspaceId}/projects/${projectId}/heygen/videos`
      }
    },

    // Project comments
    PROJECT_COMMENTS: {
      BASE: (workspaceId, projectId) =>
        `/api/workspaces/${workspaceId}/projects/${projectId}/comments`,
      ONE: (workspaceId, projectId, commentId) =>
        `/api/workspaces/${workspaceId}/projects/${projectId}/comments/${commentId}`,
      MENTIONABLE_USERS: (workspaceId, projectId) =>
        `/api/workspaces/${workspaceId}/projects/${projectId}/comments/mentionable-users`,
    },

    // Brand Kits (workspace branding)
    BRAND_KITS: {
      LIST: (workspaceId) => `/api/workspaces/${workspaceId}/brand-kits`,
      ONE: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}`,
      SET_DEFAULT: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/set-default`,
      HEALTH: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/health`,
      MEDIA: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/media`,
      MEDIA_ONE: (workspaceId, brandKitId, mediaId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/media/${mediaId}`,
      MEDIA_STREAM: (workspaceId, brandKitId, mediaId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/media/${mediaId}/stream`,
      SUGGEST_COLORS: (workspaceId) =>
        `/api/workspaces/${workspaceId}/brand-kits/suggest/colors`,
      SUGGEST_FONTS: (workspaceId) =>
        `/api/workspaces/${workspaceId}/brand-kits/suggest/fonts`,
      SUGGEST_VOICE: (workspaceId) =>
        `/api/workspaces/${workspaceId}/brand-kits/suggest/voice`,
      SUGGEST_IMAGE_STYLE: (workspaceId) =>
        `/api/workspaces/${workspaceId}/brand-kits/suggest/image-style`,
      SUGGEST_LOGO_VARIANTS: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/suggest/logo-variants`,
      GUIDELINES: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/guidelines`,
      GUIDELINES_PDF: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/guidelines/pdf`,
      GUIDELINES_GENERATE: (workspaceId, brandKitId) =>
        `/api/workspaces/${workspaceId}/brand-kits/${brandKitId}/guidelines/generate`,
    },

    // Image Gen (AI image studio)
    IMAGE_GEN: {
      MODELS: '/api/image-gen/models',
      FORMATS: '/api/image-gen/formats',
      STYLES: '/api/image-gen/styles',
      ESTIMATE: (workspaceId) => `/api/image-gen/workspaces/${workspaceId}/estimate`,
      CONTEXT: (workspaceId) => `/api/image-gen/workspaces/${workspaceId}/context`,
      CONTEXT_ONE: (workspaceId, contextId) =>
        `/api/image-gen/workspaces/${workspaceId}/context/${contextId}`,
      GENERATE: (workspaceId) => `/api/image-gen/workspaces/${workspaceId}/generate`,
      GENERATIONS: (workspaceId) => `/api/image-gen/workspaces/${workspaceId}/generations`,
      GENERATION: (workspaceId, generationId) =>
        `/api/image-gen/workspaces/${workspaceId}/generations/${generationId}`,
      REGENERATE: (workspaceId, generationId) =>
        `/api/image-gen/workspaces/${workspaceId}/generations/${generationId}/regenerate`,
      TWEAK: (workspaceId, generationId) =>
        `/api/image-gen/workspaces/${workspaceId}/generations/${generationId}/tweak`,
      DOWNLOAD: (workspaceId, generationId) =>
        `/api/image-gen/workspaces/${workspaceId}/generations/${generationId}/download`,
    },

    // Presentations (AI PPT / Canvas)
    PRESENTATIONS: {
      LIST: (workspaceId) => `/api/workspaces/${workspaceId}/presentations`,
      ONE: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}`,
      TEMPLATES: (workspaceId) => `/api/workspaces/${workspaceId}/presentation-templates`,
      DECK_PACKS: (workspaceId) => `/api/workspaces/${workspaceId}/presentation-deck-packs`,
      DECK_PACK: (workspaceId, packId) =>
        `/api/workspaces/${workspaceId}/presentation-deck-packs/${packId}`,
      TEMPLATE: (workspaceId, templateId) =>
        `/api/workspaces/${workspaceId}/presentation-templates/${templateId}`,
      THEMES: (workspaceId) => `/api/workspaces/${workspaceId}/presentation-themes`,
      ELEMENT_PRESETS: (workspaceId) => `/api/workspaces/${workspaceId}/presentation-elements`,
      STATUS: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/status`,
      CREDIT_ESTIMATE: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/credit-estimate`,
      OUTLINE: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/outline`,
      THEME: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/theme`,
      APPLY_BRAND_KIT: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/apply-brand-kit`,
      GENERATE: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/generate`,
      SLIDES: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides`,
      SLIDE: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}`,
      SLIDE_DUPLICATE: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/duplicate`,
      SLIDES_REORDER: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/reorder`,
      APPLY_LAYOUT: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/apply-layout`,
      CANVAS: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/canvas`,
      SLIDE_ELEMENTS: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/elements`,
      SLIDE_ELEMENT: (workspaceId, presentationId, slideId, elementId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/elements/${elementId}`,
      SLIDE_ELEMENTS_REORDER: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/elements/reorder`,
      SLIDE_MEDIA: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/media`,
      ATTACH_ASSET: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/attach-asset`,
      INSERT_STOCK: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/insert-stock`,
      REGENERATE: (workspaceId, presentationId, slideId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/slides/${slideId}/regenerate`,
      EXPORT: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/export`,
      EXPORT_STATUS: (workspaceId, presentationId, exportId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/export/${exportId}`,
      IMPORT: (workspaceId) => `/api/workspaces/${workspaceId}/presentations/import`,
      DUPLICATE: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/duplicate`,
      SHARE: (workspaceId, presentationId) =>
        `/api/workspaces/${workspaceId}/presentations/${presentationId}/share`,
    },
  },
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

import { triggerSessionExpired } from '../utils/apiError.js'

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

// Helper function to check fetch response status for auth expiration
export const checkAuthResponse = (response) => {
  if (response && response.status === 401) {
    triggerSessionExpired()
  }
  return response
}

export default API_CONFIG
