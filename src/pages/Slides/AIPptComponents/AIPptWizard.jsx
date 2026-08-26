import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, ArrowUp, ArrowRight, Paperclip, Check, Globe, Image as ImageIcon, Box, Ban, ChevronDown, Users, Target, Mic, ListPlus } from 'lucide-react'
import { MdDescription, MdMenuBook, MdInsights } from 'react-icons/md'
import { useAuth } from '../../../contexts/AuthContext'
import presentationService from '../../../services/presentationService'
import brandKitService from '../../../services/brandKitService'
import userService from '../../../services/userService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext'
import {
  PPT_AI_SLIDE_COUNTS,
  buildWizardThemeTokens,
  clampAiSlideCount,
  flattenPresentationPrompt,
  mapDensity,
  normalizeDeckPacks,
  normalizeOutlineSlides,
  extractPresentationId,
  toApiThemeId,
} from '../../../utils/presentationHelpers'

// Media
import mediaRealistic from '../../../assets/slides_icons/media_realistic.png'
import mediaAnime from '../../../assets/slides_icons/media_anime.png'
import mediaCartoon from '../../../assets/slides_icons/media_cartoon.png'
import mediaSketch from '../../../assets/slides_icons/media_sketch.png'
import mediaPainting from '../../../assets/Template_Image/gen_temp1.png'

// Templates
import temp1 from '../../../assets/Template_Image/gen_temp1.png'
import temp2 from '../../../assets/Template_Image/gen_temp2.png'
import temp3 from '../../../assets/Template_Image/gen_temp3.png'
import temp4 from '../../../assets/Template_Image/gen_temp4.png'

import AIPptVibeStep from './AIPptVibeStep'
import AIPptThemeModal from './AIPptThemeModal'
import AIPptImageModal from './AIPptImageModal'
import { usePptDaypart } from '../../../utils/pptDaypart'
import pptBgMorning from '../../../assets/ppt-bg/morning.png'
import pptBgAfternoon from '../../../assets/ppt-bg/afternoon.png'
import pptBgEvening from '../../../assets/ppt-bg/evening.png'
import pptBgNight from '../../../assets/ppt-bg/night.png'

import {
  WIZARD_TONES,
  WIZARD_AUDIENCES,
  WIZARD_PURPOSES,
} from '../../../constants/pptWizardOptions'
import {
  mergeRecentArtStyles,
  readRecentArtStyles,
  rememberArtStyle,
  writeRecentArtStyles,
  recentIdsFromPresentations,
} from '../../../utils/pptArtStyleRecents'

function hexLuminance(hex) {
  const raw = String(hex || '').trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return 1
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : raw
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const toLin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

function appearanceFromBackground(background) {
  return hexLuminance(background) < 0.35 ? 'dark' : 'light'
}

function makeTheme({ id, name, vibe, background, background_secondary, text_primary, text_secondary, primary, secondary, accent, border, appearance }) {
  return {
    id,
    name,
    vibe,
    background,
    background_secondary,
    text_primary,
    text_secondary,
    primary,
    secondary,
    accent,
    border,
    appearance: appearance || appearanceFromBackground(background),
    // Legacy keys used by theme modal / cards
    outer: `linear-gradient(135deg, ${primary}, ${secondary})`,
    inner: background,
    title: text_primary,
    body: text_secondary,
  }
}

export const THEMES = [
  // —— Light (10) ——
  makeTheme({
    id: 'soft-sky',
    name: 'Soft Sky',
    vibe: 'airy / calm / light',
    appearance: 'light',
    background: '#F5FAFE', // Cloud White
    background_secondary: '#FFF8EE', // Warm Cream
    primary: '#5BA4D6', // Sky Blue
    secondary: '#9BB896', // Sage Green
    accent: '#7EB8DA', // Sky highlight
    text_primary: '#1E293B',
    text_secondary: '#8B939E', // Soft Gray
    border: '#D5DEE6',
  }),
  makeTheme({
    id: 'pastel-dream',
    name: 'Pastel Dream',
    vibe: 'pastel / soft / dreamy',
    appearance: 'light',
    background: '#FBF8FF', // Light Lilac base
    background_secondary: '#FFF9E6', // Pale Yellow
    primary: '#B8A0D8', // Lavender Mist
    secondary: '#9DD4C0', // Mint Green
    accent: '#F0B8A8', // Peachy Pink
    text_primary: '#3B3450',
    text_secondary: '#8A82A3',
    border: '#E6DFF5',
  }),
  makeTheme({
    id: 'minimalist',
    name: 'Minimalist',
    vibe: 'minimal / editorial / clean',
    appearance: 'light',
    background: '#FAFAF8', // Off White
    background_secondary: '#E8E4DC', // Soft Beige
    primary: '#5B7C99', // Steel Blue
    secondary: '#9CA3AF', // Cool Gray
    accent: '#374151', // Charcoal accent
    text_primary: '#1F2937',
    text_secondary: '#6B7280',
    border: '#D1D5DB',
  }),
  makeTheme({
    id: 'sunrise',
    name: 'Sunrise',
    vibe: 'warm / energetic / morning',
    appearance: 'light',
    background: '#FFFBF5', // Cream White
    background_secondary: '#F5E6D8', // Light Tan
    primary: '#F4847B', // Coral Pink
    secondary: '#F5C542', // Golden Yellow
    accent: '#F5A66E', // Pale Orange
    text_primary: '#3A1F14',
    text_secondary: '#8A6A55',
    border: '#F0D5C0',
  }),
  makeTheme({
    id: 'nature-fresh',
    name: 'Nature Fresh',
    vibe: 'nature / organic / fresh',
    appearance: 'light',
    background: '#FFFEF7', // Ivory White
    background_secondary: '#EEF5E8',
    primary: '#2D6A4F', // Forest Green
    secondary: '#95D5B2', // Leaf Lime
    accent: '#A67C52', // Earthy Brown
    text_primary: '#1A2E1F',
    text_secondary: '#6B7F6A', // Moss Gray
    border: '#D4E0D0',
  }),
  makeTheme({
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    vibe: 'cool / coastal / trust',
    appearance: 'light',
    background: '#F8FCFF', // Pearl White
    background_secondary: '#D4EEF0', // Aqua Mist
    primary: '#4A90A4', // Sea Blue
    secondary: '#5EC4B6', // Light Teal
    accent: '#E8D9C5', // Sand Beige
    text_primary: '#0D2B3A',
    text_secondary: '#5A7A84',
    border: '#C5E0E4',
  }),
  makeTheme({
    id: 'botanical',
    name: 'Botanical',
    vibe: 'garden / soft / natural',
    appearance: 'light',
    background: '#FBF6EE', // Vanilla Cream
    background_secondary: '#F0E8DC',
    primary: '#9CAF88', // Sage Green
    secondary: '#E8A0A0', // Blush Pink
    accent: '#C4785A', // Terracotta
    text_primary: '#2C2A26',
    text_secondary: '#6B7280', // Slate Gray
    border: '#DDD4C8',
  }),
  makeTheme({
    id: 'ethereal',
    name: 'Ethereal',
    vibe: 'soft / romantic / airy',
    appearance: 'light',
    background: '#F7F4F0', // Linen White
    background_secondary: '#EFE8E4',
    primary: '#C9A0A0', // Dusty Rose
    secondary: '#B8A0C0', // Mauve
    accent: '#A8D4D8', // Pale Cyan
    text_primary: '#3A322E',
    text_secondary: '#A89888', // Soft Taupe
    border: '#DDD4CE',
  }),
  makeTheme({
    id: 'urban-cool',
    name: 'Urban Cool',
    vibe: 'modern / cool / city',
    appearance: 'light',
    background: '#FFFFFF', // White
    background_secondary: '#E8F0F5', // Ice Blue
    primary: '#6B8CAE', // Slate Blue
    secondary: '#C0C5CC', // Silver Gray
    accent: '#2D3436', // Charcoal
    text_primary: '#1A1F24',
    text_secondary: '#64748B',
    border: '#D8DEE6',
  }),
  makeTheme({
    id: 'warm-embrace',
    name: 'Warm Embrace',
    vibe: 'cozy / warm / inviting',
    appearance: 'light',
    background: '#FFF8F0', // Cream
    background_secondary: '#F8E8DC',
    primary: '#F5A66E', // Apricot
    secondary: '#E8C547', // Honey Yellow
    accent: '#E8A8A0', // Blush
    text_primary: '#3B2415',
    text_secondary: '#8B5E3C', // Warm Brown
    border: '#E8D4C0',
  }),

  // —— Dark (10) ——
  makeTheme({
    id: 'deep-space',
    name: 'Deep Space',
    vibe: 'space / navy / dark',
    appearance: 'dark',
    background: '#0A0A0C', // Charcoal Black
    background_secondary: '#0F2744', // Navy
    primary: '#1E3A5F', // Midnight Blue
    secondary: '#C0C5CC', // Silver
    accent: '#8A94A0', // Steel Gray
    text_primary: '#F1F5F9',
    text_secondary: '#94A3B8',
    border: '#1E2A3A',
  }),
  makeTheme({
    id: 'modern-dark',
    name: 'Modern Dark',
    vibe: 'modern / slate / tech',
    appearance: 'dark',
    background: '#0A0A0A', // Deep Black
    background_secondary: '#1A2332', // Dark Slate
    primary: '#3B82F6', // Neon Blue
    secondary: '#D1D5DB', // Light Gray
    accent: '#60A5FA',
    text_primary: '#F8FAFC',
    text_secondary: '#9CA3AF',
    border: '#2A3340',
  }),
  makeTheme({
    id: 'tech-noir',
    name: 'Tech Noir',
    vibe: 'futuristic / neon / noir',
    appearance: 'dark',
    background: '#0D0D0F', // Carbon Black
    background_secondary: '#1A1D24', // Dark Steel
    primary: '#00D4FF', // Electric Blue
    secondary: '#A8B0BC', // Metallic Silver
    accent: '#7C3AED', // Deep Purple highlight
    text_primary: '#E8E8FF',
    text_secondary: '#8C8CB3',
    border: '#2A2D38',
  }),
  makeTheme({
    id: 'sunset-dark',
    name: 'Sunset Dark',
    vibe: 'warm / dusk / dramatic',
    appearance: 'dark',
    background: '#1A0F0A', // Dark Brown
    background_secondary: '#2A2A2A', // Dark Gray
    primary: '#E85D04', // Deep Orange
    secondary: '#D4AF37', // Gold Accent
    accent: '#9C4221', // Burnt Sienna
    text_primary: '#FFF7ED',
    text_secondary: '#C4A484',
    border: '#3A2A20',
  }),
  makeTheme({
    id: 'forest-night',
    name: 'Forest Night',
    vibe: 'forest / emerald / night',
    appearance: 'dark',
    background: '#050705', // Black
    background_secondary: '#0D2818', // Deep Green
    primary: '#10B981', // Emerald
    secondary: '#C9A84C', // Muted Gold
    accent: '#34D399',
    text_primary: '#ECFDF5',
    text_secondary: '#86A899',
    border: '#1A3024',
  }),
  makeTheme({
    id: 'ocean-deep',
    name: 'Ocean Deep',
    vibe: 'deep sea / navy / dark',
    appearance: 'dark',
    background: '#050A0C', // Black
    background_secondary: '#0A1628', // Navy Blue
    primary: '#0E3A4A', // Deep Sea
    secondary: '#B8C0C8', // Silver
    accent: '#14B8A6', // Dark Teal highlight
    text_primary: '#E0F2FE',
    text_secondary: '#7BA3B8',
    border: '#143040',
  }),
  makeTheme({
    id: 'luxe-dark',
    name: 'Luxe Dark',
    vibe: 'luxury / burgundy / gold',
    appearance: 'dark',
    background: '#0A0808', // Black
    background_secondary: '#1A1214', // Dark Charcoal
    primary: '#4A0E1F', // Deep Burgundy
    secondary: '#B8960F', // Dark Gold
    accent: '#7C3AED', // Rich Purple
    text_primary: '#F5EFE0',
    text_secondary: '#B8AF9A',
    border: '#3A2A2E',
  }),
  makeTheme({
    id: 'cosmic',
    name: 'Cosmic',
    vibe: 'cosmic / neon / purple',
    appearance: 'dark',
    background: '#050508', // Black
    background_secondary: '#1A0A2E', // Deep Purple
    primary: '#6366F1', // Dark Blue-violet
    secondary: '#22D3EE', // Neon Cyan
    accent: '#A78BFA',
    text_primary: '#F5F3FF',
    text_secondary: '#A5A0B8',
    border: '#2A1E40',
  }),
  makeTheme({
    id: 'elegant-dark',
    name: 'Elegant Dark',
    vibe: 'elegant / gold / charcoal',
    appearance: 'dark',
    background: '#0A0A0A', // Deep Black
    background_secondary: '#1C1C1E', // Charcoal
    primary: '#D4C4A0', // Soft Gold
    secondary: '#F5F5F5', // White accent
    accent: '#A89880', // Dark Taupe metal
    text_primary: '#FAFAF9',
    text_secondary: '#A8A29E',
    border: '#2A2A2C',
  }),
  makeTheme({
    id: 'industrial',
    name: 'Industrial',
    vibe: 'industrial / gunmetal / rust',
    appearance: 'dark',
    background: '#0C0C0E', // Deep Black
    background_secondary: '#1A1D20', // Dark Zinc
    primary: '#C45C26', // Rust Orange
    secondary: '#A8AEB4', // Silver Gray
    accent: '#2C333A', // Gunmetal
    text_primary: '#F1F5F9',
    text_secondary: '#94A3B8',
    border: '#2A3036',
  }),
]

const TEMPLATES = [
  { id: 'corp-pitch', name: 'Corporate Pitch', img: temp1 },
  { id: 'marketing', name: 'Marketing Campaign', img: temp2 },
  { id: 'social', name: 'Social Media', img: temp3 },
  { id: 'portfolio', name: 'Personal Portfolio', img: temp4 },
]

const IMAGE_STYLES = [
  { id: 'scene', name: 'Scene', img: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=200&auto=format&fit=crop', tags: ['Scenic'] },
  { id: 'photo', name: 'Photo', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200&auto=format&fit=crop', tags: ['Realistic'] },
  { id: 'still-life', name: 'Still life', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop', tags: ['Realistic'] },
  { id: 'spot-color', name: 'Spot Color', img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop', tags: ['Minimal'] },
  
  { id: 'illustration', name: 'Illustration', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop', tags: ['Playful'] },
  { id: 'flat-line', name: 'Flat Line Art', img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=200&auto=format&fit=crop', tags: ['Minimal'] },
  { id: 'modern-art', name: 'Modern Art', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=200&auto=format&fit=crop', tags: ['Abstract'] },
  
  { id: 'isometric', name: 'Isometric', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop', tags: ['Playful'] },
  { id: 'gouache', name: 'Gouache Paint', img: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=200&auto=format&fit=crop', tags: ['Scenic'] },
  { id: 'bold-poster', name: 'Bold Poster', img: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=200&auto=format&fit=crop', tags: ['Bold'] },
  
  { id: 'watercolor', name: 'Watercolor', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=200&auto=format&fit=crop', tags: ['Scenic'] },
  { id: 'bauhaus', name: 'Bauhaus', img: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=200&auto=format&fit=crop', tags: ['Bold', 'Minimal'] },
  
  { id: '3d', name: '3D', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop', tags: ['Playful'] },
  { id: 'neon-glow', name: 'Neon Glow', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop', tags: ['Bold'] },
  { id: 'cinematic', name: 'Cinematic', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop', tags: ['Realistic', 'Scenic'] },
  { id: 'mesh', name: 'Mesh', img: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=200&auto=format&fit=crop', tags: ['Abstract'] },
]

const IMAGE_SOURCES = [
  { id: 'ai', title: 'AI images', subtitle: 'Matched to each slide', icon: Sparkles, badge: '2 / image' },
  { id: 'web', title: 'Web images', subtitle: 'Search the open web', icon: Globe },
  { id: 'stock', title: 'Stock images', subtitle: 'Polished photography', icon: ImageIcon },
  { id: 'placeholders', title: 'Placeholders', subtitle: 'Fill in your own later', icon: Box },
  { id: 'none', title: 'No images', subtitle: 'Words and layout only', icon: Ban },
]

const SCREEN_SIZES = [
  { id: '16:9', name: 'Default', ratio: '16/9' },
  { id: '4:3', name: 'Traditional', ratio: '4/3' },
]

const TEXT_AMOUNTS = [
  { id: 'Minimal', name: 'Minimal', columns: 1, lines: 3, description: 'Headlines only. Fast and punchy.' },
  { id: 'Concise', name: 'Concise', columns: 1, lines: 4, description: 'Short copy that still tells the story.' },
  { id: 'Detailed', name: 'Detailed', columns: 2, lines: 3, description: 'Room for context, quotes, and proof.' },
  { id: 'Extensive', name: 'Extensive', columns: 3, lines: 4, description: 'A full narrative on every slide.' },
]

const SLIDE_COUNTS = PPT_AI_SLIDE_COUNTS

const ART_STYLE_FILTERS = ['Suggested', 'Photo', 'Illustration', 'Abstract']

const ART_STYLE_FILTER_TAGS = {
  Photo: ['Realistic', 'Scenic'],
  Illustration: ['Playful', 'Bold'],
  Abstract: ['Abstract', 'Minimal'],
}

function previewArtStyles(filter, recentIds = []) {
  const recents = recentIds
    .map((id) => IMAGE_STYLES.find((style) => style.id === id))
    .filter(Boolean)
  const tags = ART_STYLE_FILTER_TAGS[filter]
  if (!tags) {
    const rest = IMAGE_STYLES.filter((style) => !recents.some((item) => item.id === style.id))
    return [...recents, ...rest].slice(0, 4)
  }
  const matchingRecents = recents.filter((style) => style.tags?.some((tag) => tags.includes(tag)))
  const matchingRest = IMAGE_STYLES.filter(
    (style) =>
      style.tags?.some((tag) => tags.includes(tag)) &&
      !matchingRecents.some((item) => item.id === style.id)
  )
  return [...matchingRecents, ...matchingRest].slice(0, 4)
}

const PPT_DAY_BACKGROUNDS = {
  morning: pptBgMorning,
  afternoon: pptBgAfternoon,
  evening: pptBgEvening,
  night: pptBgNight,
}

const STARTER_IDEAS = [
  {
    id: 'notes',
    title: 'Turn meeting notes into a presentation',
    description: 'Messy notes in. A sharp, ready-to-present deck out.',
    prompt: 'Turn meeting notes into a presentation',
    Icon: MdDescription,
  },
  {
    id: 'research',
    title: 'Summarize a research paper into key takeaways',
    description: 'Keep the insight. Skip the 40 pages. Lead with the punch.',
    prompt: 'Summarize a research paper into key takeaways',
    Icon: MdMenuBook,
  },
  {
    id: 'trends',
    title: 'Research industry trends and market analysis',
    description: 'A market snapshot they can follow in one sitting.',
    prompt: 'Research industry trends and market analysis',
    Icon: MdInsights,
  },
]

const PPT_DAY_GREETINGS = {
  morning: {
    hello: 'The morning is yours',
    titleLead: "Let's make",
    titleAccent: "something they'll remember",
    subtitle: 'Pour an idea into the bar below. We’ll turn it into a presentation that shines.',
    placeholder: 'A pitch. A story. A spark — start typing…',
    committedTitleLead: 'Beautiful. Now',
    committedTitleAccent: 'give it a voice',
    committedSubtitle: 'Tune how it should feel — then we’ll bring every slide to life.',
  },
  afternoon: {
    hello: 'This hour belongs to you',
    titleLead: 'Turn this spark into',
    titleAccent: 'a standing ovation',
    subtitle: 'Type a thought. We’ll craft slides that steal the room.',
    placeholder: 'What’s the idea that deserves a beautiful deck?',
    committedTitleLead: 'It’s already glowing.',
    committedTitleAccent: 'Now shape the voice',
    committedSubtitle: 'Choose the tone, the room, the reason — then we’ll make it unforgettable.',
  },
  evening: {
    hello: 'The glow is with you',
    titleLead: 'Tonight, your story',
    titleAccent: 'takes the stage',
    subtitle: 'Drop a line below. We’ll dress it in slides they can’t look away from.',
    placeholder: 'Tell us the story you want them to feel…',
    committedTitleLead: 'The story is in.',
    committedTitleAccent: 'Now set the mood',
    committedSubtitle: 'Pick how it should sound — then we’ll light up the slides.',
  },
  night: {
    hello: 'The quiet is yours',
    titleLead: 'Build the deck',
    titleAccent: 'the morning will envy',
    subtitle: 'One prompt. A presentation that feels like magic.',
    placeholder: 'Whisper the idea. We’ll make it unforgettable…',
    committedTitleLead: 'The spark is caught.',
    committedTitleAccent: 'Now give it fire',
    committedSubtitle: 'Choose the voice — then we’ll build the deck while the world sleeps.',
  },
}

function firstNameFromProfile(user) {
  const fromName = String(user?.name || user?.fullName || user?.firstName || '').trim()
  let raw = fromName.split(/\s+/)[0]
  if (!raw && user?.email) raw = String(user.email).split('@')[0].split(/[._-]/)[0]
  if (!raw) return ''
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const PROMPT_PLACEHOLDERS = [
  'A pitch. A story. A spark — start typing…',
  'What’s the idea that deserves a beautiful deck?',
  'Tell us the story you want them to feel…',
]

function useTypedPlaceholder(phrases, enabled = true) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (!enabled || !phrases?.length) {
      setText('')
      return undefined
    }

    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let timer = 0

    const tick = () => {
      const phrase = phrases[phraseIndex]
      if (!deleting) {
        charIndex += 1
        setText(`${phrase.slice(0, charIndex)}|`)
        if (charIndex >= phrase.length) {
          deleting = true
          timer = window.setTimeout(tick, 1800)
          return
        }
        timer = window.setTimeout(tick, 38)
        return
      }

      charIndex -= 1
      setText(charIndex > 0 ? `${phrase.slice(0, charIndex)}|` : '|')
      if (charIndex <= 0) {
        deleting = false
        phraseIndex = (phraseIndex + 1) % phrases.length
        timer = window.setTimeout(tick, 320)
        return
      }
      timer = window.setTimeout(tick, 24)
    }

    timer = window.setTimeout(tick, 280)
    return () => window.clearTimeout(timer)
  }, [enabled, phrases])

  return text
}

const STYLE_OPTIONS = ['Abstract', 'Aesthetic', 'Black & White', 'Colorful', 'Craft & Notebook', 'Creative', 'Cute', 'Dark', 'Deluxe', 'Doodle', 'Duotone', 'Floral & Plants', 'Illustration', 'Interactive & Animated', 'Minimalist', 'Modern', 'Pattern', 'Professional', 'Simple', 'Vintage', 'Watercolor']
const COLOR_OPTIONS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Monochrome']
const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Marketing', 'E-commerce', 'Creative Agency']

export default function AIPptWizard({
  onComplete,
  onStepChange,
  initialWorkspaceId,
  initialFolderId,
}) {
  const { user } = useAuth()
  const recentsUserKey = user?.id || user?._id || user?.email || 'local'
  const [step, setStep] = useState(1)
  const promptDaypart = usePptDaypart()
  const dayGreeting = PPT_DAY_GREETINGS[promptDaypart] || PPT_DAY_GREETINGS.afternoon
  const firstName = firstNameFromProfile(user)

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])
  
  // Form Data
  const [prompt, setPrompt] = useState('')
  const typedPlaceholder = useTypedPlaceholder(PROMPT_PLACEHOLDERS, step === 1 && !prompt.trim())
  const [outline, setOutline] = useState('')
  const [tone, setTone] = useState('Professional')
  const [audience, setAudience] = useState('Internal Team')
  const [purpose, setPurpose] = useState('Inform')
  const [promptCommitted, setPromptCommitted] = useState(false)
  const heroTitleLead = promptCommitted ? dayGreeting.committedTitleLead : dayGreeting.titleLead
  const heroTitleAccent = promptCommitted ? dayGreeting.committedTitleAccent : dayGreeting.titleAccent
  const heroSubtitle = promptCommitted ? dayGreeting.committedSubtitle : dayGreeting.subtitle
  const [outlineOpen, setOutlineOpen] = useState(false)
  
  // Theme Filters (legacy config fields)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState([])
  
  const [baseTemplate, setBaseTemplate] = useState('corp-pitch')
  const [theme, setTheme] = useState('soft-sky')
  const [screenSize, setScreenSize] = useState('16:9')
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  const [slides, setSlides] = useState(10)
  const [textAmount, setTextAmount] = useState('Concise')
  
  const [imageSource, setImageSource] = useState('ai')
  const [mediaStyle, setMediaStyle] = useState('photo')
  const [recentArtStyleIds, setRecentArtStyleIds] = useState(() => readRecentArtStyles('local'))
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageStyleFilter, setImageStyleFilter] = useState('Suggested')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiThemes, setApiThemes] = useState([])
  const [deckPacks, setDeckPacks] = useState([])
  const [brandKits, setBrandKits] = useState([])
  const [selectedPackId, setSelectedPackId] = useState('')
  const [selectedBrandKitId, setSelectedBrandKitId] = useState('')
  const [themeMode, setThemeMode] = useState(null)
  const [workspaceHint, setWorkspaceHint] = useState(null)
  
  const outlineRef = useRef(null)
  const optionsPanelRef = useRef(null)
  const heroSectionRef = useRef(null)

  // Resolve workspace + load theme / pack / brand kit pickers once
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ctx = await resolvePresentationWorkspaceContext({
          preferredWorkspaceId: initialWorkspaceId,
          preferredFolderId: initialFolderId,
        })
        if (cancelled) return
        setWorkspaceHint(ctx)

        const [themesPayload, packsPayload, kits] = await Promise.all([
          presentationService.listThemes(ctx.workspaceId).catch(() => null),
          presentationService.listDeckPacks(ctx.workspaceId).catch(() => null),
          brandKitService.list(ctx.workspaceId).catch(() => []),
        ])

        const themes =
          themesPayload?.themes ||
          themesPayload?.items ||
          (Array.isArray(themesPayload) ? themesPayload : [])
        if (!cancelled && themes.length) setApiThemes(themes)

        const packs = normalizeDeckPacks(packsPayload)
        if (!cancelled) setDeckPacks(packs)

        if (!cancelled) {
          setBrandKits(kits || [])
        }
      } catch (err) {
        if (!cancelled) setApiError(err.message || 'Could not load workspace for presentations')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialWorkspaceId, initialFolderId])

  useEffect(() => {
    const fromAnon = recentsUserKey !== 'local' ? readRecentArtStyles('local') : []
    const local = mergeRecentArtStyles(readRecentArtStyles(recentsUserKey), fromAnon)
    writeRecentArtStyles(recentsUserKey, local)
    setRecentArtStyleIds(local)
    if (local[0]) setMediaStyle(local[0])
  }, [recentsUserKey])

  useEffect(() => {
    if (!workspaceHint?.workspaceId) return undefined
    let cancelled = false
    const knownIds = new Set(IMAGE_STYLES.map((style) => style.id))

    ;(async () => {
      const [remote, decks] = await Promise.all([
        userService.getPptSettings().catch(() => null),
        presentationService
          .listPresentations(workspaceHint.workspaceId, { take: 30 })
          .catch(() => null),
      ])
      if (cancelled) return

      const remoteIds = Array.isArray(remote?.recentArtStyles) ? remote.recentArtStyles : []
      const fromDecks = recentIdsFromPresentations(decks, knownIds)
      const merged = mergeRecentArtStyles(
        readRecentArtStyles(recentsUserKey),
        remoteIds,
        fromDecks
      )
      writeRecentArtStyles(recentsUserKey, merged)
      setRecentArtStyleIds(merged)
      setMediaStyle((current) =>
        merged.includes(current) ? current : merged[0] || current
      )
    })()

    return () => {
      cancelled = true
    }
  }, [workspaceHint?.workspaceId, recentsUserKey])

  const pickArtStyle = useCallback(
    (id) => {
      if (!id) return
      setMediaStyle(id)
      const next = rememberArtStyle(recentsUserKey, id)
      setRecentArtStyleIds(next)
      userService.updatePptSettings({ recentArtStyles: next }).catch(() => {})
    },
    [recentsUserKey]
  )

  const visibleArtStyles = useMemo(
    () => previewArtStyles(imageStyleFilter, recentArtStyleIds),
    [imageStyleFilter, recentArtStyleIds]
  )

  const vibeReady =
    (themeMode === 'brand' && Boolean(selectedBrandKitId)) ||
    (themeMode === 'palette' && Boolean(theme)) ||
    (themeMode === 'template' && Boolean(selectedPackId))

  const canGoNext = step !== 2 || vibeReady

  useEffect(() => {
    if (!selectedPackId) return
    const pack = deckPacks.find((p) => String(p.id) === String(selectedPackId))
    if (pack?.slideCount) {
      setSlides(clampAiSlideCount(pack.slideCount))
    }
  }, [selectedPackId, deckPacks])
  
  // Step entrance animation
  const [stepReady, setStepReady] = useState(false)
  
  useEffect(() => {
    if (step > 1) {
      setStepReady(false)
      const timer = setTimeout(() => setStepReady(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Auto-resize textarea
  useEffect(() => {
    if (outlineRef.current) {
      outlineRef.current.style.height = 'auto'
      outlineRef.current.style.height = outlineRef.current.scrollHeight + 'px'
    }
  }, [outline])

  const handleGenerateOutline = async () => {
    setIsGenerating(true)
    setApiError('')
    try {
      const slideCount = clampAiSlideCount(slides)
      const ctx =
        workspaceHint ||
        (await resolvePresentationWorkspaceContext({
          preferredWorkspaceId: initialWorkspaceId,
          preferredFolderId: initialFolderId,
        }))
      setWorkspaceHint(ctx)

      const userPrompt = prompt.trim()
      const packId = selectedPackId || null
      const brandKitId = selectedBrandKitId || null

      // Mutually exclusive with brand kit / pack — only send theme when those are unset
      const useCatalogTheme = !brandKitId && !packId
      const wizardThemeTokens = useCatalogTheme ? buildWizardThemeTokens(theme, THEMES) : null

      const created = await presentationService.createPresentation(ctx.workspaceId, {
        title: 'Untitled Presentation',
        folderId: ctx.folderId,
        ...(useCatalogTheme && wizardThemeTokens
          ? { themeId: theme, themeTokens: wizardThemeTokens }
          : {}),
        locale: 'en',
        aspectRatio: screenSize,
        createMode: packId ? 'pack' : 'blank',
        ...(packId ? { packId } : {}),
        ...(brandKitId ? { brandKitId } : {}),
      })

      const presentationId = extractPresentationId(created)
      if (!presentationId) {
        throw new Error('Presentation was created but no id was returned')
      }

      let creditEstimate = null
      try {
        creditEstimate = await presentationService.getCreditEstimate(
          ctx.workspaceId,
          presentationId,
          { slideCount }
        )
      } catch {
        // Estimate is optional — continue without blocking outline
      }

      const outlineSourcePrompt = flattenPresentationPrompt({
        prompt: userPrompt,
        outline,
        tone,
        audience,
        purpose,
        mediaStyle,
        textAmount,
        imageSource,
      })

      const outlinePayload = await presentationService.createOutline(
        ctx.workspaceId,
        presentationId,
        {
          source: 'prompt',
          prompt: outlineSourcePrompt,
          slideCount,
          density: mapDensity(textAmount),
          locale: 'en',
          voiceAndTone: tone,
          audience,
          purpose,
          imageType: imageSource,
          imageStyle: mediaStyle,
          imageStyleFilter,
          colorTheme: useCatalogTheme ? theme : undefined,
          optionalOutline: outline.trim() || undefined,
        }
      )

      const cards = normalizeOutlineSlides(outlinePayload)
      if (!cards.length) {
        throw new Error('Outline API returned no slides')
      }

      const persistedStyles = rememberArtStyle(recentsUserKey, mediaStyle)
      setRecentArtStyleIds(persistedStyles)
      userService.updatePptSettings({ recentArtStyles: persistedStyles }).catch(() => {})

      const aiDeckTitle =
        outlinePayload?.presentation?.title ||
        outlinePayload?.outline?.title ||
        outlinePayload?.data?.presentation?.title ||
        outlinePayload?.data?.outline?.title ||
        'Untitled Presentation'

      const config = {
        title: aiDeckTitle,
        prompt: userPrompt,
        outline,
        tone,
        audience,
        purpose,
        style: selectedStyle,
        color: selectedColor,
        industries: selectedIndustries,
        baseTemplate,
        theme,
        themeMode,
        backendThemeId: useCatalogTheme ? toApiThemeId(theme) : null,
        screenSize,
        slides: slideCount,
        textAmount,
        density: mapDensity(textAmount),
        locale: 'en',
        mediaStyle,
        imageSource,
        imageStyleFilter,
        packId,
        brandKitId,
        layoutChoices:
          outlinePayload?.outline?.layoutChoices ||
          outlinePayload?.data?.outline?.layoutChoices ||
          [],
        fontPairing:
          outlinePayload?.outline?.fontPairing ||
          outlinePayload?.data?.outline?.fontPairing ||
          null,
        availableOptions: {
          voiceAndTone: WIZARD_TONES,
          audiences: WIZARD_AUDIENCES,
          purposes: WIZARD_PURPOSES,
          styles: STYLE_OPTIONS,
          colors: COLOR_OPTIONS,
          industries: INDUSTRY_OPTIONS,
          colorThemes: THEMES.map((item) => ({
            id: item.id,
            name: item.name,
            vibe: item.vibe,
            background: item.background,
            backgroundSecondary: item.background_secondary,
            textPrimary: item.text_primary,
            textSecondary: item.text_secondary,
            primary: item.primary,
            secondary: item.secondary,
            accent: item.accent,
            border: item.border,
          })),
          canvasSizes: SCREEN_SIZES.map(({ id, name, ratio }) => ({ id, name, ratio })),
          baseTemplates: TEMPLATES.map(({ id, name }) => ({ id, name })),
          deckPacks: deckPacks.map(({ id, name, packId: schemaPackId }) => ({
            id,
            name,
            packId: schemaPackId,
          })),
          brandKits: brandKits.map(({ id, name, isDefault }) => ({ id, name, isDefault })),
          imageTypes: IMAGE_SOURCES.map(({ id, title }) => ({ id, name: title })),
          imageStyles: IMAGE_STYLES.map(({ id, name, tags }) => ({ id, name, tags })),
          imageStyleFilters: ['Suggested', 'Photo', 'Illustration', 'Abstract'],
          textContent: TEXT_AMOUNTS.map(({ id, name }) => ({ id, name })),
          slideCounts: SLIDE_COUNTS,
        },
      }

      onComplete(cards, config, {
        workspaceId: ctx.workspaceId,
        folderId: ctx.folderId,
        presentationId,
        creditEstimate,
      })
    } catch (error) {
      if (isInsufficientCreditsError(error)) {
        setApiError(error.message || 'Insufficient credits to create an outline.')
      } else {
        setApiError(error.message || 'Failed to generate outline.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return
    setPromptCommitted(true)
    if (outline.trim()) setOutlineOpen(true)
    // Scroll options into view after they mount
    requestAnimationFrame(() => {
      setTimeout(() => {
        optionsPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 80)
    })
  }

  const handleContinueFromOptions = () => {
    if (!prompt.trim()) return
    setStep(2)
  }

  const themePickerThemes = THEMES

  return (
    <>
      {apiError && (
        <div className="aig-flow-error" role="alert">
          {apiError}
          <button type="button" onClick={() => setApiError('')}>
            Dismiss
          </button>
        </div>
      )}
      <main className={`aig-main-fullscreen ${step === 1 && !promptCommitted ? 'aig-main-center' : ''}`}>
        
        {step === 1 && (
          <div
            ref={heroSectionRef}
            className={`aig-new-hero-section fade-in ${promptCommitted ? 'aig-new-hero-section--committed' : ''}`}
          >
            <div className={`aig-new-header aig-new-header--${promptDaypart}`}>
              <p className="aig-new-greeting">
                {dayGreeting.hello}
                {firstName ? (
                  <>
                    {', '}
                    <span className="aig-new-greeting-name">{firstName}</span>
                  </>
                ) : null}
              </p>
              <h1 className="aig-new-title">
                {heroTitleLead}{' '}
                <em>{heroTitleAccent}</em>
              </h1>
              <p className="aig-new-subtitle">{heroSubtitle}</p>
            </div>

            <div className="aig-create-stage aig-glass">
              <div className="aig-new-suggestions-grid">
                {STARTER_IDEAS.map(({ id, title, description, prompt: ideaPrompt, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className="aig-new-suggestion-card"
                    onClick={() => setPrompt(ideaPrompt)}
                  >
                    <div className="aig-suggestion-art">
                      <span className="aig-suggestion-tabs" aria-hidden="true" />
                      <div className={`aig-suggestion-scene aig-suggestion-scene--${id}`}>
                        <Icon className="aig-suggestion-glyph" />
                      </div>
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </button>
                ))}
              </div>

              <div
                className={`aig-new-prompt-container aig-new-prompt-container--${promptDaypart}`}
                style={{ backgroundImage: `url(${PPT_DAY_BACKGROUNDS[promptDaypart]})` }}
              >
                <div className="aig-new-input-row">
                  <button type="button" className="aig-attach-btn" aria-label="Attach file">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    className="aig-new-main-input"
                    placeholder={typedPlaceholder || 'Start typing…'}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handlePromptSubmit()
                      }
                    }}
                    autoFocus
                  />
                  <button 
                    type="button"
                    className={`aig-new-submit-btn ${prompt.trim() ? 'active' : ''}`}
                    onClick={handlePromptSubmit}
                    disabled={!prompt.trim()}
                    aria-label={promptCommitted ? 'Update prompt options' : 'Continue with prompt'}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {promptCommitted && (
              <section
                ref={optionsPanelRef}
                className="aig-prompt-options fade-in"
                aria-label="Presentation guidance"
              >
                <div className="aig-prompt-options-head">
                  <h2 className="aig-prompt-options-title">Shape your presentation</h2>
                  <p className="aig-prompt-options-sub">
                    Choose how the AI should write, who it’s for, and why — then continue.
                  </p>
                </div>

                <div className="aig-prompt-option-card">
                  <div className="aig-prompt-option-card-head">
                    <span className="aig-prompt-option-icon" aria-hidden>
                      <Mic size={18} />
                    </span>
                    <div>
                      <h3>Voice & Tone</h3>
                      <p>How should the deck sound?</p>
                    </div>
                  </div>
                  <div className="aig-pill-grid aig-pill-grid--wrap">
                    {WIZARD_TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`aig-pill-choice ${tone === t ? 'active' : ''}`}
                        onClick={() => setTone(t)}
                      >
                        {tone === t && <Check size={14} strokeWidth={3} />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aig-prompt-option-card">
                  <div className="aig-prompt-option-card-head">
                    <span className="aig-prompt-option-icon" aria-hidden>
                      <Users size={18} />
                    </span>
                    <div>
                      <h3>Audience</h3>
                      <p>Who will see this presentation?</p>
                    </div>
                  </div>
                  <div className="aig-pill-grid aig-pill-grid--wrap">
                    {WIZARD_AUDIENCES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={`aig-pill-choice ${audience === a ? 'active' : ''}`}
                        onClick={() => setAudience(a)}
                      >
                        {audience === a && <Check size={14} strokeWidth={3} />}
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aig-prompt-option-card">
                  <div className="aig-prompt-option-card-head">
                    <span className="aig-prompt-option-icon" aria-hidden>
                      <Target size={18} />
                    </span>
                    <div>
                      <h3>Purpose</h3>
                      <p>What should this presentation achieve?</p>
                    </div>
                  </div>
                  <div className="aig-pill-grid aig-pill-grid--wrap">
                    {WIZARD_PURPOSES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`aig-pill-choice ${purpose === p ? 'active' : ''}`}
                        onClick={() => setPurpose(p)}
                      >
                        {purpose === p && <Check size={14} strokeWidth={3} />}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aig-prompt-option-card aig-prompt-option-card--outline">
                  <button
                    type="button"
                    className="aig-prompt-outline-toggle"
                    onClick={() => setOutlineOpen((open) => !open)}
                    aria-expanded={outlineOpen}
                  >
                    <span className="aig-prompt-option-icon" aria-hidden>
                      <ListPlus size={18} />
                    </span>
                    <div className="aig-prompt-outline-toggle-copy">
                      <h3>Optional outline</h3>
                      <p>Add slide structure or notes to guide the AI</p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`aig-prompt-outline-chevron ${outlineOpen ? 'open' : ''}`}
                    />
                  </button>
                  {outlineOpen && (
                    <textarea
                      ref={outlineRef}
                      className="aig-new-outline-input aig-prompt-outline-textarea"
                      placeholder={'Slide 1 — Introduction\nSlide 2 — Problem\nSlide 3 — Solution'}
                      value={outline}
                      onChange={(e) => setOutline(e.target.value)}
                      rows={5}
                    />
                  )}
                </div>

                <div className="aig-prompt-options-actions">
                  <button
                    type="button"
                    className="aig-btn-primary aig-prompt-continue-btn"
                    onClick={handleContinueFromOptions}
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {step === 2 && (
            <AIPptVibeStep
            workspaceId={workspaceHint?.workspaceId}
            brandKits={brandKits}
            selectedBrandKitId={selectedBrandKitId}
            onSelectBrandKit={setSelectedBrandKitId}
            deckPacks={deckPacks}
            selectedPackId={selectedPackId}
            onSelectPack={setSelectedPackId}
            themes={THEMES}
            theme={theme}
            themeMode={themeMode}
            onSelectTheme={setTheme}
            onThemeModeChange={setThemeMode}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            screenSize={screenSize}
            onScreenSizeChange={setScreenSize}
            stepReady={stepReady}
          />
        )}

        {step === 3 && (
          <div className={`aig-step aig-step--3 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
            <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
              <h2 className="aig-step-title">The Details</h2>
              <p className="aig-step-subtitle">
                Fine-tune the content and media.
              </p>
            </div>

            <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
              <div className="aig-selection-section">
                <h3 className="aig-selection-label">Number of slides</h3>
                <div className="aig-pill-grid">
                  {SLIDE_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={`aig-pill ${slides === count ? 'active' : ''}`}
                      onClick={() => setSlides(count)}
                    >
                      {count} Slides
                    </button>
                  ))}
                </div>
              </div>

              <div className="aig-selection-section">
                <h3 className="aig-selection-label">Text content</h3>
                <div className="aig-text-amount-grid">
                  {TEXT_AMOUNTS.map((amount) => (
                    <button
                      key={amount.id}
                      type="button"
                      className={`aig-text-card ${textAmount === amount.id ? 'active' : ''}`}
                      onClick={() => setTextAmount(amount.id)}
                    >
                      <div className="aig-text-preview">
                        {Array.from({ length: amount.columns }).map((_, colIdx) => (
                          <div key={colIdx} className="aig-text-column">
                            {Array.from({ length: amount.lines }).map((_, lineIdx) => (
                              <div
                                key={lineIdx}
                                className={`aig-text-line ${lineIdx === amount.lines - 1 ? 'short' : ''}`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      <span className="aig-text-card-label">{amount.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="aig-selection-section">
                <h3 className="aig-selection-label">Image source</h3>
                <div className="aig-details-source-grid" role="listbox" aria-label="Image source">
                  {IMAGE_SOURCES.map((source) => {
                    const Icon = source.icon
                    const selected = imageSource === source.id
                    return (
                      <button
                        key={source.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`aig-details-source-tile aig-details-source-tile--${source.id} ${selected ? 'active' : ''}`}
                        onClick={() => setImageSource(source.id)}
                      >
                        {selected ? (
                          <span className="aig-details-source-check" aria-hidden="true">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        ) : null}
                        {source.badge ? (
                          <span className="aig-details-source-badge">{source.badge}</span>
                        ) : null}
                        <span className="aig-details-source-glyph" aria-hidden="true">
                          <Icon size={22} strokeWidth={2} />
                        </span>
                        <strong>{source.title}</strong>
                        <span className="aig-details-source-sub">{source.subtitle}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="aig-selection-section">
                <h3 className="aig-selection-label">Art style</h3>
                <div className="aig-details-filters">
                  {ART_STYLE_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={`filter-pill ${imageStyleFilter === filter ? 'active' : ''}`}
                      onClick={() => setImageStyleFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="aig-art-style-inline-grid">
                  {visibleArtStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      className={`aig-image-style-card ${mediaStyle === style.id ? 'active' : ''}`}
                      onClick={() => pickArtStyle(style.id)}
                    >
                      <div className="aig-image-card-img-wrapper">
                        <img src={style.img} alt="" />
                        {mediaStyle === style.id && (
                          <div className="aig-image-card-check-overlay">
                            <Check size={16} color="#ffffff" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className="aig-image-card-label">{style.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="aig-image-style-card"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <div className="aig-image-card-img-wrapper view-more-wrapper">
                      <div className="view-more-stack">
                        <img src={IMAGE_STYLES[5].img} className="stack-img-back" alt="" />
                        <img src={IMAGE_STYLES[6].img} className="stack-img-mid" alt="" />
                        <img src={IMAGE_STYLES[7].img} className="stack-img-front" alt="" />
                      </div>
                    </div>
                    <span className="aig-image-card-label">View more</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {step > 1 && stepReady && (
        <footer className="aig-footer fade-in">
          <div className="aig-footer-content">
            <button className="aig-btn-secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
            
            {step < 3 ? (
              <button 
                className="aig-btn-primary" 
                onClick={() => {
                  if (!canGoNext) return
                  setStep(step + 1)
                }}
                disabled={!canGoNext}
                title={
                  step === 2 && !vibeReady
                    ? 'Choose a Brand Kit, Palette, or Template to continue'
                    : undefined
                }
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                className="aig-btn-magic"
                onClick={handleGenerateOutline}
                disabled={isGenerating}
              >
                <Sparkles size={18} />
                Generate Magic
              </button>
            )}
          </div>
        </footer>
      )}

      {isGenerating &&
        createPortal(
          <div className="aig-designing-overlay" role="status" aria-live="polite" aria-busy="true">
            <div className="aig-designing-card">
              <div className="aig-spinner-large" aria-hidden="true" />
              <h2 className="aig-designing-title">Designing</h2>
              <p className="aig-designing-text">Crafting your outline and slide plan…</p>
            </div>
          </div>,
          document.body
        )}

      {/* THEME MODAL */}
      <AIPptThemeModal 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themes={themePickerThemes}
        initialTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* IMAGE MODAL */}
      <AIPptImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageStyles={IMAGE_STYLES}
        initialStyle={mediaStyle}
        onSelectStyle={pickArtStyle}
      />
    </>
  )
}
