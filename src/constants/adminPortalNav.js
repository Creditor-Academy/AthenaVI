import { Users, Building2, BarChart3, Video } from 'lucide-react'

export const adminPortalSidebarGroups = [
  {
    items: [
      { id: 'users', label: 'Users', Icon: Users },
      { id: 'workspaces', label: 'Workspaces', Icon: Building2 },
      { id: 'reports', label: 'Usage Reports', Icon: BarChart3 },
      { id: 'heygen', label: 'HeyGen Account', Icon: Video },
    ],
  },
]

export const adminPortalNavItems = adminPortalSidebarGroups.flatMap((g) => g.items)
