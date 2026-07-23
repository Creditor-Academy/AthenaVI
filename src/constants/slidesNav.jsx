import { Home, Presentation, Image, Settings, Sparkles, FileText, Wand2, ImagePlus } from 'lucide-react'

/**
 * Slides product sidebar — PPT & image tools with AI / builder children.
 */
export const slidesSidebarGroups = [
  {
    items: [{ id: 'home', label: 'Home', Icon: Home }],
  },
  {
    label: 'Create',
    items: [
      {
        id: 'ppt-generator',
        label: 'PPT Generator',
        Icon: Presentation,
        children: [
          { id: 'ppt-ai', label: 'AI PPT Generation', Icon: Sparkles },
          { id: 'ppt-builder', label: 'PPT Builder', Icon: FileText },
        ],
      },
      {
        id: 'image-generator',
        label: 'Image Generator',
        Icon: Image,
        children: [
          { id: 'image-ai', label: 'AI Image Generation', Icon: Wand2 },
          { id: 'image-editor', label: 'Image Editor', Icon: ImagePlus },
        ],
      },
    ],
  },
  {
    label: 'Account',
    items: [{ id: 'settings', label: 'Settings', Icon: Settings }],
  },
]

export const SLIDES_TOOL_CARDS = [
  {
    id: 'ppt-ai',
    title: 'AI PPT',
    subtitle: 'Generate decks from a prompt',
    accent: 'pink',
    parent: 'ppt-generator',
  },
  {
    id: 'ppt-builder',
    title: 'PPT Builder',
    subtitle: 'Build slides yourself',
    accent: 'lavender',
    parent: 'ppt-generator',
  },
  {
    id: 'image-ai',
    title: 'AI Image',
    subtitle: 'Create visuals with AI',
    accent: 'cyan',
    parent: 'image-generator',
  },
  {
    id: 'image-editor',
    title: 'Image Editor',
    subtitle: 'Edit & polish images',
    accent: 'orange',
    parent: 'image-generator',
  },
]

export function getSlidesParentForSection(sectionId) {
  for (const group of slidesSidebarGroups) {
    for (const item of group.items || []) {
      if (item.children?.some((child) => child.id === sectionId)) {
        return item.id
      }
    }
  }
  return null
}
