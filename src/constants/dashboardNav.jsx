import {
  Home,
  Building2,
  Video,
  Trash2,
  Library,
  Palette,
  BookOpen,
  User,
  Volume2,
  Settings
} from 'lucide-react'

/**
 * Main platform sidebar — admin portal is reached via topbar toggle (superadmins only).
 */
export const mainDashboardSidebarGroups = [
  {
    items: [{ id: 'home', label: 'Home', Icon: Home }]
  },
  {
    label: 'Videos',
    items: [
      { id: 'workspace', label: 'Workspace', Icon: Building2 },
      { id: 'videos', label: 'My videos', Icon: Video },
      { id: 'trash', label: 'Trash', Icon: Trash2 }
    ]
  },
  {
    label: 'Assets',
    items: [
      { id: 'library', label: 'Library', Icon: Library },
      { id: 'brandkits', label: 'Brand Kits', Icon: Palette },
      { id: 'avatars', label: 'Avatars', Icon: User },
      { id: 'voices', label: 'Voices', Icon: Volume2 }
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'settings', label: 'Settings', Icon: Settings }
    ]
  }
]

/** @deprecated Use mainDashboardSidebarGroups */
export const dashboardSidebarGroups = mainDashboardSidebarGroups
