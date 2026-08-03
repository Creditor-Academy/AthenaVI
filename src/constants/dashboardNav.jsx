import {
  Home,
  Building2,
  Briefcase,
  Trash2,
  Library,
  BookOpen,
  User,
  Volume2,
  Palette,
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
    label: 'Work',
    items: [
      { id: 'workspace', label: 'Workspace', Icon: Building2 },
      { id: 'videos', label: 'My work', Icon: Briefcase }
    ]
  },
  {
    label: 'Assets',
    items: [
      { id: 'library', label: 'Library', Icon: Library },
      { id: 'avatars', label: 'Avatars', Icon: User },
      { id: 'voices', label: 'Voices', Icon: Volume2 },
      { id: 'brandkits', label: 'Brand Kit', Icon: Palette }
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
