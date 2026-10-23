import {
  SiUnsplash,
  SiYoutube,
  SiVimeo,
  SiPexels,
  SiPixabay,
  SiLoom,
  SiGiphy,
  SiGooglesheets,
  SiGoogleanalytics,
} from 'react-icons/si'
import {
  FiImage,
  FiVideo,
  FiGrid,
  FiSmile,
  FiBriefcase,
  FiLink,
  FiEdit3,
  FiFileText,
  FiBarChart2,
  FiTriangle,
  FiMinus,
  FiArrowRight,
  FiGitBranch,
  FiMessageCircle,
  FiTag,
  FiSmartphone,
} from 'react-icons/fi'
import { MdStickyNote2 } from 'react-icons/md'

/**
 * Filled brand / functional icons only — no chip background.
 */
export const BRAND_ICON_META = {
  unsplash: { Icon: SiUnsplash, color: '#111111' },
  pexels: { Icon: SiPexels, color: '#05A081' },
  pixabay: { Icon: SiPixabay, color: '#2EC66D' },
  giphy: { Icon: SiGiphy, color: '#7C3AED' },
  youtube: { Icon: SiYoutube, color: '#FF0000' },
  vimeo: { Icon: SiVimeo, color: '#1AB7EA' },
  loom: { Icon: SiLoom, color: '#625DF5' },
  'google-sheets': { Icon: SiGooglesheets, color: '#0F9D58' },
  'google-analytics': { Icon: SiGoogleanalytics, color: '#F9AB00' },
  icons: { Icon: FiGrid, color: '#0D9488' },
  stickers: { Icon: FiSmile, color: '#7C3AED' },
  'brand-photos': { Icon: FiBriefcase, color: '#4F46E5' },
  'library-images': { Icon: FiImage, color: '#0F766E' },
  'library-videos': { Icon: FiVideo, color: '#4338CA' },
  graphy: { Icon: FiVideo, color: '#8B5CF6' },
  notion: { Icon: FiFileText, color: '#111111' },
  monday: { Icon: FiGrid, color: '#FF3D57' },
  typeform: { Icon: FiEdit3, color: '#262627' },
  hubspot: { Icon: FiBriefcase, color: '#FF7A59' },
  'any-link': { Icon: FiLink, color: '#64748B' },
  manual: { Icon: FiEdit3, color: '#6366F1' },
  csv: { Icon: FiFileText, color: '#059669' },
  essential: { Icon: FiTriangle, color: '#6366F1' },
  lines: { Icon: FiMinus, color: '#64748B' },
  arrows: { Icon: FiArrowRight, color: '#0284C7' },
  flowchart: { Icon: FiGitBranch, color: '#16A34A' },
  speech: { Icon: FiMessageCircle, color: '#D97706' },
  sticky: { Icon: MdStickyNote2, color: '#CA8A04' },
  buttons: { Icon: FiTag, color: '#DB2777' },
  devices: { Icon: FiSmartphone, color: '#0F172A' },
  charts: { Icon: FiBarChart2, color: '#7C3AED' },
}

export function RailBrandIcon({ id, size = 16, className = '' }) {
  const meta = BRAND_ICON_META[id] || { Icon: FiGrid, color: '#64748B' }
  const Icon = meta.Icon
  return (
    <span
      className={`ppt-rail-icon-only ${className}`.trim()}
      style={{ color: meta.color }}
      aria-hidden
    >
      <Icon size={size} />
    </span>
  )
}
