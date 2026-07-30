import { Video, Sparkles, Presentation, Wand2, ImagePlus } from 'lucide-react'

export const CREATE_OPTIONS = [
  {
    id: 'avatar-video',
    icon: Video,
    accent: 'blue',
    title: 'Create Avatar Video',
    description: 'Turn a script into a presenter-led video',
  },
  {
    id: 'ppt-ai',
    icon: Sparkles,
    accent: 'pink',
    title: 'Generate AI Presentation',
    description: 'Create a full slide deck from a prompt using AI',
  },
  {
    id: 'ppt-builder',
    icon: Presentation,
    accent: 'lavender',
    title: 'Create Presentation',
    description: 'Build slide-by-slide manually in the editor',
  },
  {
    id: 'image-ai',
    icon: Wand2,
    accent: 'cyan',
    title: 'AI Image Generator',
    description: 'Generate high-quality visuals from text',
  },
  {
    id: 'image-editor',
    icon: ImagePlus,
    accent: 'orange',
    title: 'Canvas Editor',
    description: 'Edit, crop, and polish your visual assets',
  },
]
