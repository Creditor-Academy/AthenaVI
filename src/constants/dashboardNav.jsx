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
  LayoutDashboard,
  Settings
} from 'lucide-react'

/**
 * Grouped sidebar nav (fixed column).
 */
export const dashboardSidebarGroups = [
  {
    items: [{ id: 'home', label: 'Home', Icon: Home }]
  },
  {
    label: 'Videos',
    items: [
      { id: 'team-workspace', label: 'Workspace', Icon: Building2 },
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
      { id: 'admin-portal', label: 'Admin Portal', Icon: LayoutDashboard },
      { id: 'settings', label: 'Settings', Icon: Settings }
    ]
  }
]
