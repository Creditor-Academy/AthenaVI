import {
  LayoutDashboard,
  Users,
  RefreshCw,
  Video,
  Cloud,
  BarChart3,
} from 'lucide-react'

/** Grouped admin sidebar — same structure as mainDashboardSidebarGroups */
export const adminPortalSidebarGroups = [
  {
    items: [{ id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { id: 'users', label: 'Users', Icon: Users },
      { id: 'rendering', label: 'Rendering', Icon: RefreshCw },
      { id: 'content', label: 'Content', Icon: Video },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'platform', label: 'Platform', Icon: Cloud },
      { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
    ],
  },
]

export const adminPortalNavItems = adminPortalSidebarGroups.flatMap((g) => g.items)
