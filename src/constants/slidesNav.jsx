import { Home, Presentation, Image, Settings } from 'lucide-react'

/**
 * Slides product sidebar — PPT & image generation tools.
 */
export const slidesSidebarGroups = [
  {
    items: [{ id: 'home', label: 'Home', Icon: Home }],
  },
  {
    label: 'Create',
    items: [
      { id: 'ppt-generator', label: 'PPT Generator', Icon: Presentation },
      { id: 'image-generator', label: 'Image Generator', Icon: Image },
    ],
  },
  {
    label: 'Account',
    items: [{ id: 'settings', label: 'Settings', Icon: Settings }],
  },
]
