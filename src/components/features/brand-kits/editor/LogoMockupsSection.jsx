import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  MdAutoAwesome,
  MdInfoOutline,
  MdMoreVert,
  MdVisibility,
  MdRefresh,
  MdDownload,
  MdDelete,
  MdClose,
  MdCheck,
  MdPalette,
  MdFilterList,
} from 'react-icons/md'
import {
  Shirt,
  Package,
  Coffee,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Store,
  Monitor,
  CheckCircle2,
  Image as ImageIcon,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react'
import {
  MOCKUP_CATEGORY_LABELS,
  LOGO_VARIANT_CARDS,
  normalizeLogoRole,
  findLogoMedia,
} from '../../../../utils/brandKitHelpers'
import { BrandKitGeneratingFrame } from './BrandKitMorphModal'

import imgTshirt from '../../../../assets/brandkit/tshirt.jpg'
import imgHoodie from '../../../../assets/brandkit/hoddie.jpg'
import imgTote from '../../../../assets/brandkit/tot-bag.jpg'
import imgCup from '../../../../assets/brandkit/cup.jpg'
import imgBusinessCards from '../../../../assets/brandkit/business-cards.jpg'
import imgPhoneCase from '../../../../assets/brandkit/phone-case.jpg'
import imgSignBoard from '../../../../assets/brandkit/sign-board.jpg'
import imgCap from '../../../../assets/brandkit/cap.jpg'
import imgPackage from '../../../../assets/brandkit/package.jpg'
import imgLaptop from '../../../../assets/brandkit/laptop-led.jpg'

/** Local product photography for catalog cards / garment preview (by template id). */
const MOCKUP_PRODUCT_IMAGES = {
  tshirt: imgTshirt,
  hoodie: imgHoodie,
  totebag: imgTote,
  tote: imgTote,
  tote_bag: imgTote,
  mug: imgCup,
  cup: imgCup,
  business_card: imgBusinessCards,
  business_cards: imgBusinessCards,
  phone_case: imgPhoneCase,
  phonecase: imgPhoneCase,
  storefront_sign: imgSignBoard,
  sign_board: imgSignBoard,
  signboard: imgSignBoard,
  billboard: imgSignBoard,
  cap: imgCap,
  hat: imgCap,
  package: imgPackage,
  packaging: imgPackage,
  laptop: imgLaptop,
  laptop_led: imgLaptop,
  laptop_lid: imgLaptop,
  'laptop-lid': imgLaptop,
  'laptop-led': imgLaptop,
}

function getProductImage(templateId, iconType) {
  const id = String(templateId || '').toLowerCase()
  const icon = String(iconType || '').toLowerCase()
  return MOCKUP_PRODUCT_IMAGES[id] || MOCKUP_PRODUCT_IMAGES[icon] || null
}

const CANONICAL_LOGO_POSITIONS = ['center_chest', 'left_chest', 'full_front', 'center_back', 'full_back']
const LOGO_POSITION_ALIASES = {
  back_center: 'center_back',
  back: 'center_back',
  rear: 'center_back',
  rear_center: 'center_back',
  upper_back: 'center_back',
  back_full: 'full_back',
  full_rear: 'full_back',
  rear_full: 'full_back',
}

function canonicalizeLogoPosition(pos, fallback = 'center_chest') {
  const raw = String(pos || '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')
  if (!raw) return fallback
  const canonical = LOGO_POSITION_ALIASES[raw] || raw
  return CANONICAL_LOGO_POSITIONS.includes(canonical) ? canonical : fallback
}

function positionsMatch(a, b) {
  return canonicalizeLogoPosition(a) === canonicalizeLogoPosition(b)
}

function catalogAllowsPosition(positions, pos) {
  const canonical = canonicalizeLogoPosition(pos)
  if (!Array.isArray(positions) || positions.length === 0) {
    return CANONICAL_LOGO_POSITIONS.includes(canonical)
  }
  return positions.some((p) => canonicalizeLogoPosition(p) === canonical)
}

const LOGO_POSITION_LABELS = {
  center_chest: 'Center chest',
  left_chest: 'Left chest',
  full_front: 'Full front',
  center_back: 'Back',
  full_back: 'Full back',
  back_center: 'Back',
}

const PRESET_PRODUCT_COLORS = [
  { name: 'Pitch Black', hex: '#111111' },
  { name: 'Crisp White', hex: '#FFFFFF' },
  { name: 'Midnight Navy', hex: '#1E293B' },
  { name: 'Charcoal Grey', hex: '#334155' },
  { name: 'Athletic Grey', hex: '#94A3B8' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Warm Sand', hex: '#E2E8F0' },
  { name: 'Pastel Pink', hex: '#F472B6' },
]

const DEFAULT_MOCKUP_CATALOG = [
  {
    id: 'tshirt',
    label: 'Classic T-Shirt',
    category: 'apparel',
    description: 'Cotton crewneck t-shirt with customizable chest position and product color.',
    supportsItemColor: true,
    supportsLogoPosition: true,
    logoPositions: ['center_chest', 'left_chest', 'full_front', 'center_back', 'full_back'],
    defaultLogoPosition: 'center_chest',
    iconType: 'tshirt',
  },
  {
    id: 'hoodie',
    label: 'Heavyweight Hoodie',
    category: 'apparel',
    description: 'Fleece pullover hoodie with kangaroo pocket and front logo placement.',
    supportsItemColor: true,
    supportsLogoPosition: true,
    logoPositions: ['center_chest', 'left_chest', 'full_front', 'center_back', 'full_back'],
    defaultLogoPosition: 'center_chest',
    iconType: 'hoodie',
  },
  {
    id: 'totebag',
    label: 'Canvas Tote Bag',
    category: 'apparel',
    description: 'Heavyweight eco canvas shopping tote bag with center brand mark print.',
    supportsItemColor: true,
    supportsLogoPosition: false,
    iconType: 'totebag',
  },
  {
    id: 'mug',
    label: 'Ceramic Mug',
    category: 'desk',
    description: '11oz ceramic coffee mug with studio lighting backdrop.',
    supportsItemColor: true,
    supportsLogoPosition: false,
    iconType: 'mug',
  },
  {
    id: 'business_card',
    label: 'Business Card',
    category: 'desk',
    description: 'Tactile premium paper business cards mockup.',
    supportsItemColor: false,
    supportsLogoPosition: false,
    iconType: 'card',
  },
  {
    id: 'phone_case',
    label: 'Phone Case',
    category: 'digital',
    description: 'Matte protective phone case mockup.',
    supportsItemColor: true,
    supportsLogoPosition: false,
    iconType: 'phone',
  },
  {
    id: 'storefront_sign',
    label: 'Storefront Sign',
    category: 'signage',
    description: 'Modern exterior store facade building sign with LED backlighting.',
    supportsItemColor: false,
    supportsLogoPosition: false,
    iconType: 'store',
  },
  {
    id: 'cap',
    label: 'Brand Cap',
    category: 'apparel',
    description: 'Structured baseball cap with front panel brand mark.',
    supportsItemColor: true,
    supportsLogoPosition: false,
    iconType: 'cap',
  },
  {
    id: 'package',
    label: 'Product Package',
    category: 'packaging',
    description: 'Retail product packaging box with logo placement.',
    supportsItemColor: true,
    supportsLogoPosition: false,
    iconType: 'package',
  },
  {
    id: 'laptop',
    label: 'Laptop Lid',
    category: 'digital',
    description: 'Laptop lid skin mockup for brand marks on the outer cover.',
    supportsItemColor: true,
    supportsLogoPosition: false,
    iconType: 'laptop',
  },
  {
    id: 'billboard',
    label: 'Urban Billboard',
    category: 'signage',
    description: 'Large format outdoor billboard in city street setting.',
    supportsItemColor: false,
    supportsLogoPosition: false,
    iconType: 'billboard',
  },
]

function mockupLabel(templates, templateId, fallback) {
  const tpl = (templates || []).find((t) => t.id === templateId) || DEFAULT_MOCKUP_CATALOG.find((t) => t.id === templateId)
  return tpl?.label || fallback || templateId || 'Mockup'
}

function logoRoleLabel(role) {
  const normalized = normalizeLogoRole(role)
  const card = LOGO_VARIANT_CARDS.find((c) => c.role === normalized)
  if (card) return card.label
  if (!normalized) return 'Logo'
  return normalized
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeHex(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  const withHash = raw.startsWith('#') ? raw : `#${raw}`
  if (/^#([0-9a-fA-F]{3})$/.test(withHash)) {
    const short = withHash.slice(1)
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toUpperCase()
  }
  if (/^#([0-9a-fA-F]{6})$/.test(withHash)) return withHash.toUpperCase()
  return null
}

function isDarkHex(hex) {
  const full = normalizeHex(hex)
  if (!full) return true
  const num = Number.parseInt(full.slice(1), 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}

function MockupCardMenu({ open, canWrite, onPreview, onRegenerate, onDownload, onDelete }) {
  if (!open) return null
  return (
    <div className="bk-logo-card-menu bk-mockup-card-menu" role="menu">
      <button type="button" role="menuitem" onClick={onPreview}>
        <MdVisibility size={15} /> Preview
      </button>
      {canWrite && (
        <button type="button" role="menuitem" onClick={onRegenerate}>
          <MdRefresh size={15} /> Regenerate
        </button>
      )}
      <button type="button" role="menuitem" onClick={onDownload}>
        <MdDownload size={15} /> Download
      </button>
      {canWrite && (
        <button type="button" role="menuitem" className="is-danger" onClick={onDelete}>
          <MdDelete size={15} /> Delete
        </button>
      )}
    </div>
  )
}

function getRect(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function applyFlipTransform(el, from, to) {
  if (!el || !from || !to || !to.width || !to.height) return
  const dx = from.left - to.left
  const dy = from.top - to.top
  const sx = from.width / to.width
  const sy = from.height / to.height
  el.style.transformOrigin = 'top left'
  el.style.transition = 'none'
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
}

/** Product preview — prefer local brandkit photography, fall back to SVG. */
function ProductItemGraphic({ type, templateId, color = '#111111', label = 'Product' }) {
  const photo = getProductImage(templateId, type)
  if (photo) {
    return (
      <img
        src={photo}
        alt={label}
        className="bk-product-photo"
        draggable={false}
      />
    )
  }

  const isDark = isDarkHex(color)
  const strokeCol = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)'

  switch (type) {
    case 'hoodie':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <path
            d="M 28 28 C 34 20 66 20 72 28 L 92 42 L 82 54 L 74 48 L 74 88 L 26 88 L 26 48 L 18 54 L 8 42 Z"
            fill={color}
            stroke={strokeCol}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 36 24 C 40 14 60 14 64 24 C 58 30 42 30 36 24 Z" fill="rgba(0,0,0,0.15)" stroke={strokeCol} strokeWidth="1" />
          <path d="M 45 28 L 44 42 M 55 28 L 56 42" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 34 68 L 66 68 L 60 84 L 40 84 Z" fill="rgba(0,0,0,0.1)" stroke={strokeCol} strokeWidth="1" />
        </svg>
      )
    case 'totebag':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <path d="M 34 40 C 34 16 42 12 50 12 C 58 12 66 16 66 40" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="24" y="38" width="52" height="52" rx="4" fill={color} stroke={strokeCol} strokeWidth="1.5" />
          <path d="M 24 46 L 76 46" stroke={strokeCol} strokeWidth="1" />
        </svg>
      )
    case 'mug':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <path d="M 68 34 C 84 34 84 66 68 66" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="24" y="24" width="48" height="58" rx="6" fill={color} stroke={strokeCol} strokeWidth="1.5" />
          <ellipse cx="48" cy="24" rx="24" ry="4" fill="rgba(255,255,255,0.2)" stroke={strokeCol} strokeWidth="1" />
        </svg>
      )
    case 'card':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <rect x="14" y="28" width="72" height="44" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="22" y="36" width="24" height="6" rx="2" fill="#3B82F6" />
          <rect x="22" y="48" width="40" height="3" rx="1" fill="#94A3B8" />
          <rect x="22" y="54" width="28" height="3" rx="1" fill="#CBD5E1" />
        </svg>
      )
    case 'phone':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <rect x="30" y="16" width="40" height="68" rx="8" fill={color} stroke={strokeCol} strokeWidth="1.5" />
          <rect x="36" y="22" width="14" height="18" rx="3" fill="rgba(0,0,0,0.3)" stroke={strokeCol} strokeWidth="1" />
          <circle cx="43" cy="28" r="3" fill="#64748B" />
        </svg>
      )
    case 'store':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <rect x="12" y="20" width="76" height="60" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <rect x="20" y="32" width="60" height="36" rx="3" fill="#090D16" stroke="#3B82F6" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="8" fill="#3B82F6" opacity="0.6" />
        </svg>
      )
    case 'billboard':
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <rect x="10" y="18" width="80" height="48" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <path d="M 44 66 L 44 90 M 56 66 L 56 90" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'tshirt':
    default:
      return (
        <svg viewBox="0 0 100 100" className="bk-product-svg" fill="none">
          <path
            d="M 30 24 C 36 30 64 30 70 24 L 90 38 L 78 50 L 72 44 L 72 86 L 28 86 L 28 44 L 22 50 L 10 38 Z"
            fill={color}
            stroke={strokeCol}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 38 24 C 42 30 58 30 62 24" stroke={strokeCol} strokeWidth="1.2" fill="none" />
        </svg>
      )
  }
}

const POSITION_OPTION_LABELS = {
  center_chest: 'Center chest',
  left_chest: 'Left chest',
  full_front: 'Full front',
  center_back: 'Back',
  full_back: 'Full back',
  back_center: 'Back',
}

const REAL_POSITION_MOCKUP_IMAGES = [
  { itemType: 'tshirt', position: 'center_chest', label: 'Center chest', url: '/mockups/tshirt_center_chest.jpg' },
  { itemType: 'tshirt', position: 'left_chest', label: 'Left chest', url: '/mockups/tshirt_left_chest.jpg' },
  { itemType: 'tshirt', position: 'full_front', label: 'Full front', url: '/mockups/tshirt_full_front.jpg' },
  { itemType: 'tshirt', position: 'center_back', label: 'Back', url: '/mockups/tshirt_back_center.jpg' },
  { itemType: 'hoodie', position: 'center_chest', label: 'Center chest', url: '/mockups/hoodie_center_chest.jpg' },
  { itemType: 'hoodie', position: 'left_chest', label: 'Left chest', url: '/mockups/hoodie_left_chest.jpg' },
  { itemType: 'hoodie', position: 'full_front', label: 'Full front', url: '/mockups/hoodie_full_front.jpg' },
  { itemType: 'hoodie', position: 'center_back', label: 'Back', url: '/mockups/hoodie_back_center.jpg' },
]

/** Logo position picker — left hero preview + right 2×2 options for the selected surface. */
function InteractiveGarmentPresentation({
  templateId = 'tshirt',
  selectedPosition = 'center_chest',
  onSelectPosition,
  canWrite = true,
}) {
  const garmentKey = String(templateId || 'tshirt').toLowerCase() === 'hoodie' ? 'hoodie' : 'tshirt'
  const garmentLabel = garmentKey === 'hoodie' ? 'Hoodie' : 'T-shirt'

  const options = useMemo(
    () => REAL_POSITION_MOCKUP_IMAGES.filter((m) => m.itemType === garmentKey),
    [garmentKey]
  )
  const selectedCanonical = canonicalizeLogoPosition(selectedPosition)

  const activePhoto =
    options.find((m) => positionsMatch(m.position, selectedCanonical)) || options[0] || null

  return (
    <div className="bk-pos-layout">
      <div className="bk-pos-hero">
        {activePhoto ? (
          <img
            src={activePhoto.url}
            alt={`${garmentLabel} · ${activePhoto.label}`}
            className="bk-pos-hero-img"
          />
        ) : null}
        <div className="bk-pos-hero-meta">
          <span className="bk-pos-hero-eyebrow">{garmentLabel}</span>
          <strong className="bk-pos-hero-title">
            {POSITION_OPTION_LABELS[selectedCanonical] || activePhoto?.label || 'Logo position'}
          </strong>
        </div>
      </div>

      <div className="bk-pos-options" role="listbox" aria-label={`${garmentLabel} logo positions`}>
        {options.map((mockup) => {
          const active = positionsMatch(selectedCanonical, mockup.position)
          return (
            <button
              key={mockup.position}
              type="button"
              role="option"
              aria-selected={active}
              className={`bk-pos-option${active ? ' is-active' : ''}`}
              disabled={!canWrite}
              onClick={() => onSelectPosition?.(canonicalizeLogoPosition(mockup.position))}
            >
              <span className="bk-pos-option-media">
                <img src={mockup.url} alt="" />
                {active ? (
                  <span className="bk-pos-option-check" aria-hidden>
                    <Check size={12} />
                  </span>
                ) : null}
              </span>
              <span className="bk-pos-option-label">
                {POSITION_OPTION_LABELS[mockup.position] || mockup.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function LogoMockupsSection({
  canWrite,
  hasLogo,
  templates = [],
  billing = null,
  savedMockups = [],
  loading = false,
  generatingTemplateId = null,
  previews = {},
  colors = [],
  logos = [],
  onGenerate,
  onLoad,
  onDelete,
  onDownload,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('tshirt')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [itemColor, setItemColor] = useState('#111111')
  const [customHexDraft, setCustomHexDraft] = useState('')
  const [logoRole, setLogoRole] = useState('primary')
  const [logoPosition, setLogoPosition] = useState('center_chest')
  const [menuKey, setMenuKey] = useState(null)
  const [modal, setModal] = useState(null)
  const menuAnchorRef = useRef(null)
  const cardRefs = useRef({})
  const modalPanelRef = useRef(null)
  const modalOpenedForGen = useRef(null)

  useEffect(() => {
    onLoad?.()
  }, [onLoad])

  useEffect(() => {
    if (!menuKey) return undefined
    const onDoc = (e) => {
      if (menuAnchorRef.current && !menuAnchorRef.current.contains(e.target)) {
        setMenuKey(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuKey])

  // Combine server templates with default fallback catalog
  const catalogList = useMemo(() => {
    if (templates && templates.length > 0) {
      return templates.map((tpl) => {
        const fallback = DEFAULT_MOCKUP_CATALOG.find((d) => d.id === tpl.id)
        return {
          ...fallback,
          ...tpl,
          iconType: fallback?.iconType || tpl.category || 'tshirt',
        }
      })
    }
    return DEFAULT_MOCKUP_CATALOG
  }, [templates])

  const filteredCatalog = useMemo(() => {
    if (categoryFilter === 'all') return catalogList
    return catalogList.filter((item) => (item.category || '').toLowerCase() === categoryFilter.toLowerCase())
  }, [catalogList, categoryFilter])

  const selectedTemplate = useMemo(
    () => catalogList.find((t) => t.id === selectedTemplateId) || catalogList[0] || null,
    [catalogList, selectedTemplateId]
  )

  // Extract available logo options with image URLs
  const logoCards = useMemo(() => {
    const list = []
    const processedRoles = new Set()

    for (const card of LOGO_VARIANT_CARDS) {
      const media = findLogoMedia(logos, card.role)
      const url = media?.url || media?.presignedUrl || media?.src || null
      list.push({
        role: card.role,
        label: card.label,
        desc: card.desc,
        darkCanvas: card.darkCanvas,
        url,
        hasMedia: Boolean(url),
      })
      processedRoles.add(card.role)
    }

    for (const item of logos || []) {
      const role = normalizeLogoRole(item.role || item.name)
      if (role && !processedRoles.has(role)) {
        const url = item.url || item.presignedUrl || item.src || null
        list.push({
          role,
          label: logoRoleLabel(role),
          desc: item.name || '',
          darkCanvas: role.includes('white') || role.includes('dark'),
          url,
          hasMedia: Boolean(url),
        })
        processedRoles.add(role)
      }
    }

    return list
  }, [logos])

  const selectedLogoCard = useMemo(
    () => logoCards.find((l) => l.role === logoRole) || logoCards[0] || null,
    [logoCards, logoRole]
  )

  useEffect(() => {
    if (!selectedTemplate) {
      setLogoPosition(null)
      return
    }
    if (selectedTemplate.supportsLogoPosition) {
      const positions = selectedTemplate.logoPositions || CANONICAL_LOGO_POSITIONS
      const fallback = canonicalizeLogoPosition(
        selectedTemplate.defaultLogoPosition || positions[0] || 'center_chest'
      )
      setLogoPosition((prev) =>
        prev && catalogAllowsPosition(positions, prev) ? canonicalizeLogoPosition(prev) : fallback
      )
    } else {
      setLogoPosition(null)
    }
  }, [selectedTemplate])

  const freeRemaining = billing?.freeRemaining ?? null
  const freeLimit = billing?.freeLimit ?? null
  const costLabel = freeRemaining == null ? null : freeRemaining > 0 ? 'Free' : '4 AC'

  const generatedItems = useMemo(() => {
    const map = new Map()

    for (const item of savedMockups || []) {
      const templateId = String(item.role || item.templateId || item.name || item.id || '')
      if (!templateId) continue
      map.set(templateId, {
        ...item,
        templateId,
        url: item.url || item.presignedUrl || item.src,
        mediaId: item.id || item._id || item.mediaId,
      })
    }

    for (const [templateId, preview] of Object.entries(previews || {})) {
      if (!preview?.url) continue
      const existing = map.get(templateId) || {}
      map.set(templateId, {
        ...existing,
        ...preview,
        templateId,
        url: preview.url,
        mediaId: preview.mediaId || existing.mediaId || existing.id || existing._id,
        role: templateId,
      })
    }

    return [...map.values()].filter((item) => item.url)
  }, [savedMockups, previews])

  const buildGenerateOptions = useCallback(
    (templateId) => {
      const tpl = catalogList.find((t) => t.id === templateId)
      const options = {
        save: true,
        logoRole: logoRole || tpl?.defaultLogoRole || 'primary',
      }
      if (itemColor) options.itemColor = itemColor
      if (tpl?.supportsLogoPosition) {
        const positions = tpl.logoPositions || CANONICAL_LOGO_POSITIONS
        const selected = canonicalizeLogoPosition(logoPosition)
        const pos = catalogAllowsPosition(positions, selected)
          ? selected
          : canonicalizeLogoPosition(tpl.defaultLogoPosition || positions[0] || 'center_chest')
        options.logoPosition = pos
      }
      return options
    },
    [catalogList, logoRole, itemColor, logoPosition]
  )

  useEffect(() => {
    if (!modal || modal.phase !== 'loading') return
    const tid = modal.templateId
    if (generatingTemplateId === tid) return
    if (generatingTemplateId) return
    const item = generatedItems.find((g) => String(g.templateId) === String(tid))
    const url = item?.url
    if (url) {
      setModal((prev) => (prev ? { ...prev, url, phase: 'ready', anim: 'idle' } : prev))
      modalOpenedForGen.current = null
    } else if (modalOpenedForGen.current === tid && !generatingTemplateId) {
      setModal((prev) =>
        prev && prev.templateId === tid ? { ...prev, phase: 'ready', url: prev.url || null } : prev
      )
      modalOpenedForGen.current = null
    }
  }, [modal, generatingTemplateId, generatedItems])

  const openFromCard = useCallback((templateId, label, url) => {
    const card = cardRefs.current[templateId]
    const origin = getRect(card)
    setModal({
      templateId,
      label,
      url,
      phase: 'ready',
      anim: 'open',
      origin,
    })
  }, [])

  const startGenerate = useCallback(
    async (templateId) => {
      if (!templateId || !canWrite || !hasLogo || generatingTemplateId) return
      const label = mockupLabel(catalogList, templateId)
      const card = cardRefs.current[templateId]
      const origin = getRect(card)
      modalOpenedForGen.current = templateId
      setMenuKey(null)
      setModal({
        templateId,
        label,
        url: null,
        phase: 'loading',
        anim: origin ? 'open' : 'idle',
        origin,
      })
      try {
        await onGenerate?.(templateId, buildGenerateOptions(templateId))
      } catch {
        modalOpenedForGen.current = null
        setModal(null)
      }
    },
    [
      canWrite,
      hasLogo,
      generatingTemplateId,
      catalogList,
      onGenerate,
      buildGenerateOptions,
    ]
  )

  const closeModal = useCallback(() => {
    setModal((current) => {
      if (!current || current.anim === 'closing') return current
      const panel = modalPanelRef.current
      const card = cardRefs.current[current.templateId]
      const from = getRect(panel)
      const to = getRect(card)

      if (panel && from && to && to.width > 2 && (current.url || current.phase === 'ready')) {
        requestAnimationFrame(() => {
          panel.style.transformOrigin = 'top left'
          panel.style.transition =
            'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease'
          panel.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${Math.max(0.01, to.width / from.width)}, ${Math.max(0.01, to.height / from.height)})`
          panel.style.opacity = '0.25'
          const backdrop = panel.parentElement
          if (backdrop) {
            backdrop.style.transition = 'opacity 0.38s ease'
            backdrop.style.opacity = '0'
          }
          window.setTimeout(() => setModal(null), 400)
        })
        return { ...current, anim: 'closing' }
      }

      if (panel) {
        panel.style.transition = 'transform 0.28s ease, opacity 0.28s ease'
        panel.style.transform = 'scale(0.92)'
        panel.style.opacity = '0'
        const backdrop = panel.parentElement
        if (backdrop) {
          backdrop.style.transition = 'opacity 0.28s ease'
          backdrop.style.opacity = '0'
        }
        window.setTimeout(() => setModal(null), 300)
        return { ...current, anim: 'closing' }
      }
      return null
    })
  }, [])

  useEffect(() => {
    if (!modal || modal.anim !== 'open') return undefined
    const panel = modalPanelRef.current
    if (!panel) return undefined
    const origin = modal.origin

    if (origin && origin.width > 2) {
      const to = getRect(panel)
      applyFlipTransform(panel, origin, to)
      void panel.offsetWidth
      panel.style.transition =
        'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease'
      panel.style.transform = 'none'
      panel.style.opacity = '1'
    } else {
      panel.style.opacity = '0'
      panel.style.transform = 'scale(0.94)'
      void panel.offsetWidth
      panel.style.transition = 'transform 0.32s ease, opacity 0.32s ease'
      panel.style.transform = 'none'
      panel.style.opacity = '1'
    }

    const t = window.setTimeout(() => {
      setModal((prev) => (prev && prev.anim === 'open' ? { ...prev, anim: 'idle' } : prev))
    }, 420)
    return () => window.clearTimeout(t)
  }, [modal?.templateId, modal?.anim])

  useEffect(() => {
    if (!modal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && modal.anim !== 'closing') closeModal()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [modal, closeModal])

  const isBusy = Boolean(generatingTemplateId)
  const canGenerate = canWrite && hasLogo && selectedTemplateId && !isBusy
  const closeMenu = () => setMenuKey(null)
  const showColorPicker = Boolean(selectedTemplate) && selectedTemplate.supportsItemColor !== false
  const showPosition = selectedTemplate?.supportsLogoPosition === true

  const applyCustomHex = () => {
    const hex = normalizeHex(customHexDraft)
    if (!hex) return
    setItemColor(hex)
    setCustomHexDraft(hex)
  }

  const modalNode =
    modal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`bk-mockup-morph-backdrop${modal.anim === 'closing' ? ' is-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={modal.label}
            onClick={() => {
              if (modal.anim !== 'closing') closeModal()
            }}
          >
            <button
              type="button"
              className="bk-mockup-morph-close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation()
                closeModal()
              }}
            >
              <MdClose size={20} />
            </button>
            <div
              className="bk-mockup-morph-panel"
              ref={modalPanelRef}
              onClick={(e) => e.stopPropagation()}
            >
              {modal.phase === 'loading' ||
              (!modal.url && generatingTemplateId === modal.templateId) ? (
                <BrandKitGeneratingFrame
                  label={
                    generatingTemplateId === modal.templateId
                      ? 'Creating your mockup…'
                      : 'Preparing…'
                  }
                />
              ) : modal.url ? (
                <img src={modal.url} alt={modal.label} className="bk-mockup-morph-image" />
              ) : (
                <div className="bk-mockup-morph-empty">
                  <p>Generation finished, but no image was returned. Try again.</p>
                  <button
                    type="button"
                    className="bk-extract-btn"
                    onClick={() => startGenerate(modal.templateId)}
                  >
                    <MdRefresh size={16} /> Retry
                  </button>
                </div>
              )}
              {!(
                modal.phase === 'loading' ||
                (!modal.url && generatingTemplateId === modal.templateId)
              ) ? (
                <p className="bk-mockup-morph-caption">{modal.label}</p>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className="bk-type-specimen-box bk-imagery-section">
      <div className="bk-type-box-head">
        <div>
          <span className="bk-type-box-tag">Logo Studio &amp; Mockups</span>
          <p className="bk-imagery-section-desc">
            Place your brand logo on merchandise, apparel, and product surfaces with real-time color and position control.
          </p>
        </div>
        <div className="bk-mockup-header-meta">
          {freeRemaining != null && freeLimit != null && (
            <span className="bk-mockup-free-badge">
              {freeRemaining} of {freeLimit} free
            </span>
          )}
          {!hasLogo && (
            <span className="bk-mockup-need-logo">
              <MdInfoOutline size={14} /> Upload a logo first
            </span>
          )}
        </div>
      </div>

      <div className="bk-mockup-create-bar bk-mockup-studio-bar">
        <div className="bk-mockup-create-copy">
          <h3 className="bk-mockup-create-title">Create your brand logo on</h3>
          <p className="bk-mockup-create-sub">
            Choose an item square card, pick a product color, adjust position, and choose your logo mark.
          </p>
        </div>

        {/* 1. Item Square Cards Selection ("Create it on:") */}
        <div className="bk-mockup-section-block">
          <div className="bk-mockup-block-head">
            <span className="bk-tb-lbl">1. Create it on: Select Surface</span>
            <div className="bk-category-filters">
              {['all', 'apparel', 'desk', 'packaging', 'signage', 'digital'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`bk-cat-chip ${categoryFilter === cat ? 'is-active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bk-square-item-grid">
            {filteredCatalog.map((item) => {
              const selected = selectedTemplateId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`bk-square-item-card ${selected ? 'is-selected' : ''}`}
                  disabled={!canWrite}
                  onClick={() => setSelectedTemplateId(item.id)}
                >
                  <div className="bk-item-card-preview">
                    <ProductItemGraphic
                      type={item.iconType}
                      templateId={item.id}
                      color={itemColor || '#111111'}
                      label={item.label}
                    />
                    {selected && (
                      <span className="bk-item-selected-badge">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <div className="bk-item-card-info">
                    <span className="bk-item-card-name">{item.label}</span>
                    <span className="bk-item-card-cat">
                      {MOCKUP_CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Product Colour Selection */}
        {showColorPicker && (
          <div className="bk-mockup-section-block">
            <span className="bk-tb-lbl">2. Product Colour</span>
            <div className="bk-product-color-palette">
              <div className="bk-btn-swatches" role="listbox" aria-label="Product colour">
                {/* Default button */}
                <button
                  type="button"
                  role="option"
                  aria-selected={!itemColor}
                  className={`bk-btn-swatch bk-btn-swatch--empty ${!itemColor ? 'is-active' : ''}`}
                  disabled={!canWrite}
                  title="Use catalog default color"
                  onClick={() => {
                    setItemColor(null)
                    setCustomHexDraft('')
                  }}
                >
                  Catalog
                </button>

                {/* Preset Garment Colors */}
                {PRESET_PRODUCT_COLORS.map((c) => {
                  const active = itemColor === c.hex
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`bk-btn-swatch ${active ? 'is-active' : ''}`}
                      style={{ background: c.hex }}
                      disabled={!canWrite}
                      title={`${c.name} (${c.hex})`}
                      onClick={() => {
                        setItemColor(c.hex)
                        setCustomHexDraft(c.hex)
                      }}
                    />
                  )
                })}

                {/* Brand Colors from Kit */}
                {(colors || []).map((color) => {
                  const hex = normalizeHex(color.hex)
                  if (!hex) return null
                  const active = itemColor === hex
                  return (
                    <button
                      key={color.id || hex}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`bk-btn-swatch bk-btn-swatch--brand ${active ? 'is-active' : ''}`}
                      style={{ background: hex }}
                      disabled={!canWrite}
                      title={`Brand: ${color.name || 'Color'} (${hex})`}
                      onClick={() => {
                        setItemColor(hex)
                        setCustomHexDraft(hex)
                      }}
                    />
                  )
                })}
              </div>

              {/* Custom Hex Picker Input */}
              <div className="bk-mockup-hex-row">
                <input
                  type="color"
                  className="bk-color-picker-native"
                  value={itemColor || '#111111'}
                  onChange={(e) => {
                    setItemColor(e.target.value)
                    setCustomHexDraft(e.target.value.toUpperCase())
                  }}
                  disabled={!canWrite}
                />
                <input
                  type="text"
                  className="bk-mockup-hex-input"
                  value={customHexDraft}
                  disabled={!canWrite}
                  placeholder="#111111"
                  aria-label="Custom product colour hex"
                  maxLength={7}
                  onChange={(e) => setCustomHexDraft(e.target.value)}
                  onBlur={applyCustomHex}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      applyCustomHex()
                    }
                  }}
                />
                <span className="bk-mockup-hex-hint">Custom product hex</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Logo Position Garment Presentation (for tshirt and hoodie) */}
        {showPosition && (
          <div className="bk-mockup-section-block">
            <span className="bk-tb-lbl">3. Logo Position (Interactive Garment Preview)</span>
            <InteractiveGarmentPresentation
              templateId={selectedTemplate?.id || selectedTemplateId || 'tshirt'}
              selectedPosition={logoPosition || 'center_chest'}
              onSelectPosition={(pos) => setLogoPosition(canonicalizeLogoPosition(pos))}
              canWrite={canWrite}
            />
          </div>
        )}

        {/* 4. Logo Selection Visual Cards */}
        <div className="bk-mockup-section-block">
          <span className="bk-tb-lbl">4. Choose Brand Logo</span>
          <div className="bk-logo-selection-grid">
            {logoCards.map((logo) => {
              const selected = logoRole === logo.role
              return (
                <button
                  key={logo.role}
                  type="button"
                  className={`bk-logo-select-card ${selected ? 'is-selected' : ''}`}
                  disabled={!canWrite}
                  onClick={() => setLogoRole(logo.role)}
                >
                  <div className={`bk-logo-select-canvas ${logo.darkCanvas ? 'is-dark' : 'is-light'}`}>
                    {logo.url ? (
                      <img src={logo.url} alt={logo.label} />
                    ) : (
                      <div className="bk-logo-fallback-mark">
                        <ImageIcon size={22} />
                        <span>{logo.label}</span>
                      </div>
                    )}
                    {selected && (
                      <span className="bk-logo-check-badge">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </div>
                  <div className="bk-logo-select-info">
                    <span className="bk-logo-select-name">{logo.label}</span>
                    <span className="bk-logo-select-desc">{logo.desc || logo.role}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="bk-mockup-footer-action">
          <button
            type="button"
            className="bk-extract-btn bk-mockup-generate-btn-lg"
            disabled={!canGenerate}
            onClick={() => startGenerate(selectedTemplateId)}
          >
            <MdAutoAwesome size={18} />
            {isBusy && generatingTemplateId === selectedTemplateId
              ? 'Generating Studio Mockup…'
              : costLabel
                ? `Generate Mockup (${costLabel})`
                : 'Generate Studio Mockup'}
          </button>
          {selectedTemplate && (
            <p className="bk-mockup-selected-hint">
              Generating <strong>{selectedTemplate.label}</strong>
              {' · '}
              <strong>{logoRoleLabel(logoRole)}</strong>
              {showPosition ? (
                <>
                  {' · '}
                  <strong>
                    {POSITION_OPTION_LABELS[canonicalizeLogoPosition(logoPosition)] ||
                      canonicalizeLogoPosition(logoPosition)}
                  </strong>
                </>
              ) : null}
            </p>
          )}
        </div>
      </div>

      {/* Results Section */}
      {generatedItems.length > 0 && (
        <div className="bk-mockup-results">
          <div className="bk-type-box-head bk-imagery-subhead">
            <span className="bk-type-box-tag">Generated mockups</span>
            <span className="bk-mockup-results-count">{generatedItems.length}</span>
          </div>

          <div className="bk-mockup-results-grid">
            {generatedItems.map((item) => {
              const templateId = String(item.templateId || item.role || '')
              const key = templateId || item.mediaId || item.id
              const label = mockupLabel(catalogList, templateId, item.name || item.role)
              const url = item.url || item.presignedUrl || item.src
              const busy = generatingTemplateId === templateId
              const menuOpen = menuKey === key
              const metaBits = [
                item.logoRoleUsed ? logoRoleLabel(item.logoRoleUsed) : null,
                item.itemColorUsed || null,
                item.logoPositionUsed
                  ? LOGO_POSITION_LABELS[item.logoPositionUsed] || item.logoPositionUsed
                  : null,
              ].filter(Boolean)

              return (
                <article key={key} className={`bk-mockup-result-card ${busy ? 'is-busy' : ''}`}>
                  <div
                    className="bk-mockup-result-preview"
                    ref={(el) => {
                      if (templateId) cardRefs.current[templateId] = el
                    }}
                  >
                    <button
                      type="button"
                      className="bk-mockup-result-hit"
                      onClick={() => openFromCard(templateId, label, url)}
                      aria-label={`Preview ${label}`}
                    >
                      <img src={url} alt={`${label} mockup`} />
                    </button>
                    {busy && modal?.templateId !== templateId && (
                      <div className="bk-mockup-card-loading" aria-live="polite">
                        <div className="bk-mockup-spinner" />
                        <span>Regenerating…</span>
                      </div>
                    )}

                    <div
                      className="bk-logo-card-menu-wrap bk-mockup-result-menu"
                      ref={menuOpen ? menuAnchorRef : null}
                    >
                      <button
                        type="button"
                        className="bk-logo-card-menu-btn"
                        aria-label={`${label} options`}
                        aria-expanded={menuOpen}
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuKey(menuOpen ? null : key)
                        }}
                      >
                        <MdMoreVert size={18} />
                      </button>
                      <MockupCardMenu
                        open={menuOpen}
                        canWrite={canWrite}
                        onPreview={() => {
                          closeMenu()
                          openFromCard(templateId, label, url)
                        }}
                        onRegenerate={() => {
                          closeMenu()
                          startGenerate(templateId)
                        }}
                        onDownload={() => {
                          closeMenu()
                          onDownload?.(item, label)
                        }}
                        onDelete={() => {
                          closeMenu()
                          onDelete?.(item)
                        }}
                      />
                    </div>
                  </div>
                  <div className="bk-mockup-result-meta">
                    <strong>{label}</strong>
                    {metaBits.length ? (
                      <span className="bk-mockup-result-meta-sub">{metaBits.join(' · ')}</span>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !generatedItems.length && (
        <p className="bk-mockup-empty">
          No mockups generated yet. Select a surface card above and click Generate Studio Mockup.
        </p>
      )}

      {modalNode}
    </div>
  )
}
