import { LayoutDashboard, Users, Building2, BarChart3, Video, HardDrive, Shield } from 'lucide-react'

export const adminPortalSidebarGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'overview', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'users', label: 'Users', Icon: Users },
      { id: 'workspaces', label: 'Workspaces', Icon: Building2 },
      { id: 'storage-requests', label: 'Storage Queue', Icon: HardDrive },
    ],
  },
  {
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Usage Reports', Icon: BarChart3 },
      { id: 'platform-actions', label: 'Platform Actions', Icon: Shield },
      { id: 'heygen', label: 'HeyGen Account', Icon: Video },
    ],
  },
]

export const adminPortalNavItems = adminPortalSidebarGroups.flatMap((g) => g.items)
