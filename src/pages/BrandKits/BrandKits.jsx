import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  MdAdd,
  MdMoreVert,
  MdDelete,
  MdContentCopy,
  MdStar,
  MdStarBorder,
  MdArrowBack,
  MdSave,
  MdGridView,
  MdViewList,
  MdClose,
  MdColorLens,
  MdTextFields,
  MdRecordVoiceOver,
  MdImage,
  MdPalette,
  MdInfoOutline,
  MdAutoAwesome,
  MdDashboard,
  MdMenuBook,
  MdPhotoLibrary,
  MdCategory,
  MdDownload,
  MdCheck,
  MdArrowForward,
} from 'react-icons/md'
import { ChevronRight } from 'lucide-react'
import brandKitService, { BrandKitPermissionError } from '../../services/brandKitService'
import { resolvePresentationWorkspaceContext } from '../../utils/presentationContext'
import {
  canWriteBrandKits,
  emptyBrandKitData,
  formatRelativeTime,
  LOGO_ROLES,
  newColorId,
  validateBrandKitData,
} from '../../utils/brandKitHelpers'
import BrandKitsSkeleton from '../page-skeleton/BrandKitsSkeleton'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import '../Videos/Videos.css'
import './BrandKits.css'

function listToLines(arr) {
  return (arr || []).join('\n')
}

function linesToList(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function resolveRoleHex(data, role, fallback = '#94A3B8') {
  const id = data?.colorRoles?.[role]
  const match = (data?.colors || []).find((c) => c.id === id)
  return match?.hex || fallback
}

function hexToRgb(hex) {
  let c = String(hex || '#000000').replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16) || 0
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r}, ${g}, ${b}`
}

function hexToHsl(hex) {
  let c = String(hex || '#000000').replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16) || 0
  let r = ((num >> 16) & 255) / 255
  let g = ((num >> 8) & 255) / 255
  let b = (num & 255) / 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase()
}

function extract4ColorsFromImage(imageSrc, callback, workspaceId, brandKitId, mediaId) {
  const defaultPalette = [
    { name: 'Primary (Light Mode)', hex: '#2563EB', role: 'primary' },
    { name: 'Background (Light Mode)', hex: '#F8FAFC', role: 'bg' },
    { name: 'Primary (Dark Mode)', hex: '#60A5FA', role: 'accent' },
    { name: 'Background (Dark Mode)', hex: '#0F172A', role: 'text' },
  ]

  if (!imageSrc) {
    callback(defaultPalette)
    return
  }

  const runExtraction = (srcToUse, isTemp = false) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = srcToUse
    img.onerror = () => {
      if (isTemp && srcToUse) URL.revokeObjectURL(srcToUse)
      callback(defaultPalette)
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 80
        canvas.height = 80
        ctx.drawImage(img, 0, 0, 80, 80)
        const data = ctx.getImageData(0, 0, 80, 80).data

        const hueBuckets = new Array(36).fill(null).map(() => ({
          totalSat: 0,
          totalLit: 0,
          count: 0,
        }))

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255
          const g = data[i + 1] / 255
          const b = data[i + 2] / 255
          const a = data[i + 3]

          if (a < 128) continue
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const d = max - min
          const l = (max + min) / 2

          if (l > 0.9 || l < 0.1) continue
          if (d < 0.08) continue

          const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          let h = 0
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          else if (max === g) h = ((b - r) / d + 2) / 6
          else h = ((r - g) / d + 4) / 6

          const hDeg = Math.round(h * 360)
          const bucketIdx = Math.floor(hDeg / 10) % 36

          const weight = s * (1 - Math.abs(l - 0.5) * 1.5)
          hueBuckets[bucketIdx].totalSat += weight
          hueBuckets[bucketIdx].totalLit += l
          hueBuckets[bucketIdx].count += 1
        }

        let bestBucket = hueBuckets[0]
        let bestIdx = 0
        hueBuckets.forEach((bucket, idx) => {
          if (bucket.totalSat > bestBucket.totalSat) {
            bestBucket = bucket
            bestIdx = idx
          }
        })

        let brandH = bestIdx * 10 + 5
        let brandS =
          bestBucket.count > 0
            ? Math.round((bestBucket.totalSat / bestBucket.count) * 100 * 1.5)
            : 70
        brandS = Math.max(50, Math.min(90, brandS))

        const lightPrimaryHex = hslToHex(brandH, brandS, 44)
        const lightBgHex = hslToHex(brandH, 18, 96)
        const darkPrimaryHex = hslToHex(brandH, Math.min(brandS + 10, 95), 66)
        const darkBgHex = hslToHex(brandH, 20, 8)

        if (isTemp && srcToUse) URL.revokeObjectURL(srcToUse)

        callback([
          { name: 'Primary (Light Mode)', hex: lightPrimaryHex, role: 'primary' },
          { name: 'Background (Light Mode)', hex: lightBgHex, role: 'bg' },
          { name: 'Primary (Dark Mode)', hex: darkPrimaryHex, role: 'accent' },
          { name: 'Background (Dark Mode)', hex: darkBgHex, role: 'text' },
        ])
      } catch {
        if (isTemp && srcToUse) URL.revokeObjectURL(srcToUse)
        callback(defaultPalette)
      }
    }
  }

  if (imageSrc.startsWith('blob:') || imageSrc.startsWith('data:')) {
    runExtraction(imageSrc, false)
  } else if (workspaceId && brandKitId && mediaId) {
    brandKitService
      .fetchMediaBlob(workspaceId, brandKitId, mediaId)
      .then((blob) => {
        const tempBlobUrl = URL.createObjectURL(blob)
        runExtraction(tempBlobUrl, true)
      })
      .catch(() => runExtraction(imageSrc, false))
  } else {
    runExtraction(imageSrc, false)
  }
}

const FONT_PAIRINGS = [
  { heading: 'Playfair Display', subheading: 'Plus Jakarta Sans', body: 'Inter', id: 'playfair_jakarta_inter' },
  { heading: 'Outfit', subheading: 'Space Grotesk', body: 'Roboto', id: 'outfit_space_roboto' },
  { heading: 'Montserrat', subheading: 'Poppins', body: 'Open Sans', id: 'montserrat_poppins_opensans' },
  { heading: 'Syne', subheading: 'Cabinet Grotesk', body: 'Plus Jakarta Sans', id: 'syne_cabinet_jakarta' },
]

const POPULAR_GOOGLE_FONTS = [
  'Playfair Display',
  'Inter',
  'Plus Jakarta Sans',
  'Outfit',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Poppins',
  'Syne',
  'Space Grotesk',
  'Lora',
  'Merriweather',
  'DM Sans',
  'Cinzel',
  'Cormorant Garamond',
  'Oswald',
  'Raleway',
  'Ubuntu',
]

function ensureGoogleFontLoaded(fontFamily) {
  if (!fontFamily) return
  const cleanName = String(fontFamily).trim().replace(/['"]/g, '')
  if (!cleanName || ['sans-serif', 'serif', 'monospace', 'system-ui'].includes(cleanName.toLowerCase())) return
  const id = `google-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
  document.head.appendChild(link)
}

function SectionHead({ icon, title, hint }) {
  const Icon = icon
  return (
    <div className="customize-card-head">
      <div className="customize-icon" aria-hidden>
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div>
        <h3 className="customize-title">{title}</h3>
        {hint ? <p className="customize-hint">{hint}</p> : null}
      </div>
    </div>
  )
}

function KitCard({
  kit,
  viewMode,
  canWrite,
  menuOpen,
  setMenuOpen,
  setMenuRef,
  onEdit,
  onSetDefault,
  onCopyId,
  onDelete,
  index,
}) {
  const colors = kit.data?.colors || []
  const ribbonColors =
    colors.length > 0
      ? colors.slice(0, 5)
      : [
          { id: 'f1', hex: '#CBD5E1' },
          { id: 'f2', hex: '#94A3B8' },
          { id: 'f3', hex: '#64748B' },
        ]

  return (
    <div
      className="brandkit-card"
      onClick={() => onEdit(kit)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(kit)
        }
      }}
      role="button"
      tabIndex={0}
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <div className="brandkit-ribbon" aria-hidden>
        {ribbonColors.map((c) => (
          <span key={c.id} style={{ background: c.hex }} />
        ))}
      </div>

      <div className="brandkit-card-body">
        <div className="brandkit-info">
          {viewMode === 'grid' && (
            <div className="brandkit-swatches">
              {ribbonColors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  className="brandkit-swatch"
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3 className="brandkit-name">{kit.name}</h3>
            <div className="brandkit-meta">
              {kit.isDefault && (
                <span className="default-badge">
                  <MdStar size={12} /> Default
                </span>
              )}
              <span className="brandkit-date">
                {kit.mediaCount || 0} media
                {kit.updatedAt ? ` · ${formatRelativeTime(kit.updatedAt)}` : ''}
              </span>
            </div>
          </div>
        </div>

        {canWrite && (
          <div
            className="brandkit-menu-wrap"
            ref={(el) => setMenuRef?.(kit.id, el)}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="brandkit-menu-btn"
              aria-label="Kit actions"
              onClick={() => setMenuOpen(menuOpen === kit.id ? null : kit.id)}
            >
              <MdMoreVert size={20} />
            </button>
            {menuOpen === kit.id && (
              <div className="brandkit-menu">
                <button type="button" className="menu-item" onClick={() => onSetDefault(kit.id)}>
                  {kit.isDefault ? (
                    <MdStarBorder className="menu-icon" />
                  ) : (
                    <MdStar className="menu-icon" />
                  )}
                  {kit.isDefault ? 'Default kit' : 'Set as default'}
                </button>
                <button type="button" className="menu-item" onClick={() => onCopyId(kit.id)}>
                  <MdContentCopy className="menu-icon" />
                  Copy ID
                </button>
                <button type="button" className="menu-item delete" onClick={() => onDelete(kit.id)}>
                  <MdDelete className="menu-icon" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BrandKits() {
  const [workspaceId, setWorkspaceId] = useState(null)
  const [workspaceRole, setWorkspaceRole] = useState('MEMBER')
  const [brandKits, setBrandKits] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [showEditor, setShowEditor] = useState(false)
  const [isWizardMode, setIsWizardMode] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [slogan, setSlogan] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null)
  const [pairingIndex, setPairingIndex] = useState(0)
  const [editorTab, setEditorTab] = useState('overview')
  const [editingKitId, setEditingKitId] = useState(null)
  const [kitName, setKitName] = useState('')
  const [kitData, setKitData] = useState(emptyBrandKitData())
  const [kitMedia, setKitMedia] = useState([])
  const [isDefault, setIsDefault] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoRole, setLogoRole] = useState('primary')
  const [copiedHex, setCopiedHex] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generatingRole, setGeneratingRole] = useState(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [slideViewMode, setSlideViewMode] = useState('deck')
  const [generatingGuideline, setGeneratingGuideline] = useState(false)
  const menuRefs = useRef({})
  const fileInputRef = useRef(null)
  const wizardLogoInputRef = useRef(null)
  const pendingUploadKind = useRef('logo')

  const canWrite = canWriteBrandKits(workspaceRole)

  const downloadBrandGuidelinePdf = useCallback(async () => {
    try {
      setGeneratingGuideline(true)
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [960, 540], // 16:9 Widescreen Aspect Ratio PDF Presentation!
      })

      const name = kitName || 'Brand Kit'
      const colors = kitData.colors || []
      const headingFont = kitData.fonts?.heading?.family || 'Playfair Display'
      const subheadingFont = kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'
      const bodyFont = kitData.fonts?.body?.family || 'Inter'

      // SLIDE 1: COVER SLIDE
      doc.setFillColor(15, 23, 42) // #0F172A Dark Slate
      doc.rect(0, 0, 960, 540, 'F')

      doc.setFillColor(37, 99, 235) // Primary Blue Accent Bar
      doc.rect(70, 160, 8, 220, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('BRAND IDENTITY & DESIGN SYSTEM', 95, 185)

      doc.setFontSize(44)
      doc.text(name, 95, 240)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(16)
      doc.setTextColor(148, 163, 184)
      doc.text('Executive Brand Guidelines & Presentation Specification Deck', 95, 278)

      doc.setFontSize(12)
      doc.text(`Generated: ${new Date().toLocaleDateString()}  •  Aspect Ratio: 16:9 Widescreen  •  v1.0 Deck`, 95, 470)
      doc.text('Page 1 of 6', 850, 470)

      // SLIDE 2: COLOR PALETTE
      doc.addPage([960, 540], 'l')
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('02 / COLOR PALETTE', 70, 55)

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(28)
      doc.text('Harmonic Brand Color System', 70, 90)

      const swatchWidth = 120
      const swatchHeight = 110
      colors.slice(0, 6).forEach((c, idx) => {
        const x = 70 + idx * 135
        const y = 125
        let hex = c.hex || '#94A3B8'

        try {
          let clean = hex.replace('#', '')
          if (clean.length === 3) clean = clean.split('').map((x) => x + x).join('')
          const num = parseInt(clean, 16) || 0
          doc.setFillColor((num >> 16) & 255, (num >> 8) & 255, num & 255)
          doc.rect(x, y, swatchWidth, swatchHeight, 'F')
        } catch {
          doc.setFillColor(148, 163, 184)
          doc.rect(x, y, swatchWidth, swatchHeight, 'F')
        }

        doc.setTextColor(15, 23, 42)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(c.name || `Color ${idx + 1}`, x, y + swatchHeight + 20)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(100, 116, 139)
        doc.text(hex, x, y + swatchHeight + 36)
      })

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 325, 820, 140, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(70, 325, 820, 140, 'D')

      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('Color Usage & Accessibility Standards', 95, 355)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(71, 85, 105)
      doc.text('• Primary brand colors must be used for key CTA elements, header highlights, and focal graphics.', 95, 380)
      doc.text('• Secondary palette colors should provide contrast for secondary buttons, tags, and data visualization.', 95, 400)
      doc.text('• Ensure all text combinations meet WCAG AA contrast ratio standards (4.5:1 minimum).', 95, 420)

      doc.setTextColor(100, 116, 139)
      doc.text('Page 2 of 6', 850, 495)

      // SLIDE 3: LOGO SYSTEM
      doc.addPage([960, 540], 'l')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('03 / LOGO SYSTEM', 70, 55)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.text('Logo Lockups & Clear Space Rules', 70, 90)

      const logoCards = [
        { title: 'Primary Mark', desc: 'Main logo for light/neutral backgrounds' },
        { title: 'Light Mode', desc: 'Optimised for white backgrounds' },
        { title: 'Dark Mode', desc: 'Optimised for dark backgrounds' },
        { title: 'Monochrome', desc: 'Single-color black/white version' },
      ]
      logoCards.forEach((lc, idx) => {
        const col = idx % 2
        const row = Math.floor(idx / 2)
        const x = 70 + col * 420
        const y = 120 + row * 170

        doc.setFillColor(30, 41, 59)
        doc.rect(x, y, 400, 150, 'F')
        doc.setDrawColor(51, 65, 85)
        doc.rect(x, y, 400, 150, 'D')

        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(lc.title, x + 20, y + 30)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(148, 163, 184)
        doc.text(lc.desc, x + 20, y + 50)

        doc.setFillColor(51, 65, 85)
        doc.rect(x + 20, y + 68, 360, 64, 'F')
        doc.setTextColor(203, 213, 225)
        doc.text(`[ ${name} Logo Specimen ]`, x + 125, y + 106)
      })

      doc.setTextColor(148, 163, 184)
      doc.text('Page 3 of 6', 850, 495)

      // SLIDE 4: TYPOGRAPHY SYSTEM
      doc.addPage([960, 540], 'l')
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('04 / TYPOGRAPHY SYSTEM', 70, 55)

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(28)
      doc.text('Typographic Hierarchy & Specimens', 70, 90)

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 120, 820, 95, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(70, 120, 820, 95, 'D')

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.text(`HEADING FONT  •  ${headingFont.toUpperCase()}  •  700 BOLD`, 90, 142)
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('The quick brown fox jumps over the lazy dog', 90, 180)

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 230, 820, 90, 'F')
      doc.rect(70, 230, 820, 90, 'D')

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.text(`SUBHEADING FONT  •  ${subheadingFont.toUpperCase()}  •  600 SEMI-BOLD`, 90, 252)
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('A clean, modern sans-serif perfectly paired for clarity and contrast.', 90, 285)

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 335, 820, 120, 'F')
      doc.rect(70, 335, 820, 120, 'D')

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.text(`BODY FONT  •  ${bodyFont.toUpperCase()}  •  400 REGULAR`, 90, 357)
      doc.setTextColor(71, 85, 105)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et', 90, 382)
      doc.text('dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip', 90, 402)
      doc.text('ex ea commodo consequat. Executive deck layouts combine display headings with readable body type.', 90, 422)

      doc.setTextColor(100, 116, 139)
      doc.text('Page 4 of 6', 850, 495)

      // SLIDE 5: IMAGERY & MOOD
      doc.addPage([960, 540], 'l')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('05 / IMAGERY & MOOD', 70, 55)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.text('Visual Style & Photography Guidelines', 70, 90)

      doc.setFillColor(30, 41, 59)
      doc.rect(70, 120, 820, 110, 'F')
      doc.setDrawColor(51, 65, 85)
      doc.rect(70, 120, 820, 110, 'D')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Image Brief & Visual Philosophy', 95, 150)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(148, 163, 184)
      doc.text(`"${kitData.imageStyle || 'Clean product photography with natural lighting, studio quality, brand-safe minimalist aesthetics.'}"`, 95, 180)

      doc.setTextColor(148, 163, 184)
      doc.text('Page 5 of 6', 850, 495)

      // SLIDE 6: GOVERNANCE
      doc.addPage([960, 540], 'l')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 960, 8, 'F')

      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('06 / GOVERNANCE & CLOSING', 70, 55)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(30)
      doc.text('Brand Compliance & Contact', 70, 95)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(14)
      doc.setTextColor(148, 163, 184)
      doc.text('These brand guidelines ensure consistent application across all internal and external communication.', 70, 128)

      doc.setFillColor(30, 41, 59)
      doc.rect(70, 155, 820, 270, 'F')
      doc.setDrawColor(51, 65, 85)
      doc.rect(70, 155, 820, 270, 'D')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Brand Governance Checklist', 100, 190)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(203, 213, 225)
      doc.text('1. Always verify logo files are exported from official brand kit vectors.', 100, 225)
      doc.text('2. Do not modify color hex codes or typography pairings without brand team approval.', 100, 250)
      doc.text('3. Use designated slide templates for external presentation decks.', 100, 275)
      doc.text(`4. Voice Tone Target: ${kitData.voice?.tone || 'Professional & Confident'}.`, 100, 300)
      doc.text(`5. Target Audience: ${kitData.voice?.audience || 'General Enterprise Stakeholders'}.`, 100, 325)

      doc.setTextColor(148, 163, 184)
      doc.setFontSize(11)
      doc.text(`© ${new Date().getFullYear()} ${name}. All rights reserved.`, 70, 495)
      doc.text('Page 6 of 6', 850, 495)

      doc.save(`${name.replace(/\s+/g, '_')}_Brand_Guidelines.pdf`)
    } catch (err) {
      console.error('Error generating PDF guideline:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingGuideline(false)
    }
  }, [kitName, kitData])

  const setMenuRef = useCallback((id, el) => {
    menuRefs.current[id] = el
  }, [])

  const loadKits = useCallback(async (wsId) => {
    const list = await brandKitService.list(wsId)
    setBrandKits(list)
  }, [])

  useEffect(() => {
    if (kitData.fonts?.heading?.family) ensureGoogleFontLoaded(kitData.fonts.heading.family)
    if (kitData.fonts?.subheading?.family) ensureGoogleFontLoaded(kitData.fonts.subheading.family)
    if (kitData.fonts?.tertiary?.family) ensureGoogleFontLoaded(kitData.fonts.tertiary.family)
    if (kitData.fonts?.body?.family) ensureGoogleFontLoaded(kitData.fonts.body.family)
  }, [
    kitData.fonts?.heading?.family,
    kitData.fonts?.subheading?.family,
    kitData.fonts?.tertiary?.family,
    kitData.fonts?.body?.family,
  ])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const ctx = await resolvePresentationWorkspaceContext()
        if (cancelled) return
        setWorkspaceId(ctx.workspaceId)
        setWorkspaceRole(ctx.workspace?.role || 'MEMBER')
        await loadKits(ctx.workspaceId)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load brand kits')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadKits])

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((itemId) => {
        if (menuRefs.current[itemId] && !menuRefs.current[itemId].contains(event.target)) {
          setMenuOpen(null)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openCreate = () => {
    if (!canWrite) return
    setEditingKitId(null)
    setKitName('')
    setSlogan('')
    setLogoFile(null)
    setLogoPreviewUrl(null)
    setKitData(emptyBrandKitData())
    setKitMedia([])
    setIsDefault(brandKits.length === 0)
    setError('')
    setIsWizardMode(true)
    setWizardStep(1)
    setShowEditor(true)
  }

  const openEdit = async (kit) => {
    if (!workspaceId || !kit?.id) return
    setError('')
    setIsWizardMode(false)
    setEditorTab('overview')
    setShowEditor(true)
    setEditingKitId(kit.id)
    setKitName(kit.name)
    try {
      const detail = await brandKitService.get(workspaceId, kit.id)
      setKitName(detail.name)
      setKitData(detail.data || emptyBrandKitData())
      setKitMedia(detail.media || [])
      setIsDefault(Boolean(detail.isDefault))
    } catch (err) {
      setError(err.message || 'Failed to load brand kit')
    }
  }

  const handleSave = async (redirect = true) => {
    if (!workspaceId || !canWrite) return null
    const finalName = kitName.trim() || 'My Brand Kit'
    const validationError = validateBrandKitData(kitData)
    if (validationError) {
      setError(validationError)
      return null
    }
    setSaving(true)
    setError('')
    try {
      let targetKitId = editingKitId
      if (editingKitId) {
        await brandKitService.update(workspaceId, editingKitId, {
          name: finalName,
          data: kitData,
          isDefault,
        })
        if (isDefault) {
          try {
            await brandKitService.setDefault(workspaceId, editingKitId)
          } catch {
            // ignore
          }
        }
      } else {
        const created = await brandKitService.create(workspaceId, {
          name: finalName,
          isDefault,
          data: kitData,
        })
        targetKitId = created.id
        setEditingKitId(created.id)
        if (isDefault && created.id) {
          try {
            await brandKitService.setDefault(workspaceId, created.id)
          } catch {
            // ignore
          }
        }
      }

      if (logoFile && targetKitId) {
        try {
          await brandKitService.uploadMedia(workspaceId, targetKitId, {
            file: logoFile,
            kind: 'logo',
            role: 'main',
            name: logoFile.name || 'Primary Logo',
          })
          const detail = await brandKitService.get(workspaceId, targetKitId)
          setKitMedia(detail.media || [])
        } catch {
          // ignore logo upload error
        }
      }

      await loadKits(workspaceId)
      if (redirect) {
        setIsWizardMode(false)
        setEditorTab('overview')
      }
      return targetKitId
    } catch (err) {
      setError(
        err instanceof BrandKitPermissionError
          ? 'Only workspace owners and admins can edit brand kits'
          : err.message || 'Failed to save brand kit'
      )
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (kitId) => {
    if (!canWrite || !workspaceId) return
    if (
      !window.confirm(
        'Delete this brand kit and its media? Existing decks keep their snapshotted theme.'
      )
    ) {
      return
    }
    setError('')
    try {
      await brandKitService.remove(workspaceId, kitId)
      await loadKits(workspaceId)
      if (editingKitId === kitId) {
        setShowEditor(false)
        setEditingKitId(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete brand kit')
    }
    setMenuOpen(null)
  }

  const handleSetDefault = async (kitId) => {
    if (!canWrite || !workspaceId) return
    setError('')
    try {
      await brandKitService.setDefault(workspaceId, kitId)
      await loadKits(workspaceId)
    } catch (err) {
      setError(err.message || 'Failed to set default')
    }
    setMenuOpen(null)
  }

  const handleCopyId = (kitId) => {
    navigator.clipboard.writeText(kitId)
    setMenuOpen(null)
  }

  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1800)
  }

  const updateColor = (index, patch) => {
    setKitData((prev) => {
      const colors = [...(prev.colors || [])]
      colors[index] = { ...colors[index], ...patch }
      return { ...prev, colors }
    })
  }

  const addColor = () => {
    setKitData((prev) => {
      const colors = prev.colors || []
      if (colors.length >= 32) return prev
      const id = newColorId(colors)
      return {
        ...prev,
        colors: [...colors, { id, name: `Color ${colors.length + 1}`, hex: '#64748B' }],
      }
    })
  }

  const removeColor = (index) => {
    setKitData((prev) => {
      const colors = [...(prev.colors || [])]
      if (colors.length <= 2) return prev
      const removed = colors[index]
      colors.splice(index, 1)
      const roles = { ...prev.colorRoles }
      const fallback = colors[0]?.id
      Object.keys(roles).forEach((key) => {
        if (roles[key] === removed.id) roles[key] = fallback
      })
      return {
        ...prev,
        colors,
        colorRoles: roles,
        chartStyles: {
          colorIds: (prev.chartStyles?.colorIds || []).filter((id) => id !== removed.id),
        },
      }
    })
  }

  const handleWizardLogoSelected = (file) => {
    if (!file) return
    setLogoFile(file)
    const previewUrl = URL.createObjectURL(file)
    setLogoPreviewUrl(previewUrl)
  }

  const triggerGenerateFromLogo = () => {
    if (!logoPreviewUrl) {
      setError('Please upload a brand logo in Step 1 first to generate colors.')
      return
    }
    extract4ColorsFromImage(logoPreviewUrl, (fourExtracted) => {
      const newColors = fourExtracted.map((item, i) => ({
        id: `c_logo_${Date.now()}_${i}`,
        name: item.name,
        hex: item.hex,
      }))
      const roles = {
        primary: newColors[0]?.id,
        bg: newColors[1]?.id,
        accent: newColors[2]?.id,
        text: newColors[3]?.id,
      }
      setKitData((prev) => ({
        ...prev,
        colors: newColors,
        colorRoles: roles,
      }))
    })
  }

  const triggerAutoGenerateTypography = () => {
    const nextIdx = (pairingIndex + 1) % FONT_PAIRINGS.length
    setPairingIndex(nextIdx)
    const pair = FONT_PAIRINGS[nextIdx]
    setKitData((prev) => ({
      ...prev,
      fonts: {
        heading: { family: pair.heading, fontPairingId: pair.id },
        subheading: { family: pair.subheading, fontPairingId: pair.id },
        body: { family: pair.body, fontPairingId: pair.id },
      },
    }))
  }

  const pendingUploadRole = useRef('primary')

  const triggerUpload = (kind, role) => {
    if (!canWrite || !editingKitId) {
      setError('Save the brand kit first, then upload media')
      return
    }
    pendingUploadKind.current = kind
    if (role) pendingUploadRole.current = role
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !workspaceId || !editingKitId) return

    setUploading(true)
    setError('')
    try {
      const kind = pendingUploadKind.current
      await brandKitService.uploadMedia(workspaceId, editingKitId, {
        file,
        kind,
        role: kind === 'logo' ? pendingUploadRole.current : undefined,
        name: file.name,
      })
      const detail = await brandKitService.get(workspaceId, editingKitId)
      setKitMedia(detail.media || [])
      await loadKits(workspaceId)
    } catch (err) {
      setError(err.message || 'Media upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId) => {
    if (!canWrite || !workspaceId || !editingKitId) return
    setError('')
    try {
      await brandKitService.deleteMedia(workspaceId, editingKitId, mediaId)
      setKitMedia((prev) => prev.filter((m) => (m.id || m._id) !== mediaId))
      await loadKits(workspaceId)
    } catch (err) {
      setError(err.message || 'Failed to remove media')
    }
  }

  // ── Canvas-based logo variant generator ─────────────────────
  const generateLogoVariants = async () => {
    if (!canWrite || !editingKitId) {
      setError('Save the brand kit first before generating variants.')
      return
    }
    // Resolve primary logo source
    const mainUploaded = (kitMedia || []).filter(
      (m) => String(m.kind || m.type || '').toLowerCase() === 'logo' &&
             ((m.role || '') === 'primary' || (m.role || '') === 'main')
    )
    const mainSrc = mainUploaded[0]
      ? (mainUploaded[0].url || mainUploaded[0].src || mainUploaded[0].presignedUrl)
      : logoPreviewUrl

    if (!mainSrc) {
      setError('Upload or choose a Primary Logo first to generate variants.')
      return
    }

    setGenerating(true)
    setError('')

    const mainMediaId = mainUploaded[0]?.id || mainUploaded[0]?._id

    // Helper: load image via Blob to avoid CORS tainted-canvas with S3 presigned URLs.
    // Fetching as Blob → objectURL gives us a same-origin URL that canvas can read freely.
    const loadImage = async (src, mediaId) => {
      let blobUrl = null
      let isTempBlob = false

      if (src && (src.startsWith('blob:') || src.startsWith('data:'))) {
        blobUrl = src
      } else if (workspaceId && editingKitId && mediaId) {
        try {
          const blob = await brandKitService.fetchMediaBlob(workspaceId, editingKitId, mediaId)
          blobUrl = URL.createObjectURL(blob)
          isTempBlob = true
        } catch {
          // fallback
        }
      }

      if (!blobUrl && src) {
        try {
          const res = await fetch(src, { credentials: 'omit' })
          if (res.ok) {
            const blob = await res.blob()
            blobUrl = URL.createObjectURL(blob)
            isTempBlob = true
          }
        } catch {
          blobUrl = src
        }
      }

      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || 512
          canvas.height = img.naturalHeight || 512
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          if (isTempBlob && blobUrl) URL.revokeObjectURL(blobUrl)
          resolve({ canvas, ctx, img })
        }
        img.onerror = (e) => {
          if (isTempBlob && blobUrl) URL.revokeObjectURL(blobUrl)
          reject(e)
        }
        img.src = blobUrl
      })
    }

    // Helper: canvas → File blob
    const canvasToFile = (canvas, filename) =>
      new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(new File([blob], filename, { type: 'image/png' })), 'image/png')
      })

    // Pixel transform helpers
    const applyTransform = (imageData, transformFn) => {
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 10) continue // skip fully transparent
        const [r, g, b] = transformFn(d[i], d[i + 1], d[i + 2])
        d[i] = r; d[i + 1] = g; d[i + 2] = b
      }
      return imageData
    }

    // Variants to generate: [role, label, pixelTransformFn]
    const variants = [
      [
        'light-mode',
        'logo_light_mode.png',
        // Lighten very dark pixels so they're visible on white
        (r, g, b) => {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          if (lum < 40) return [Math.min(r + 40, 200), Math.min(g + 40, 200), Math.min(b + 40, 200)]
          return [r, g, b]
        },
      ],
      [
        'dark-mode',
        'logo_dark_mode.png',
        // Lighten all pixels so they pop on dark backgrounds
        (r, g, b) => {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          const boost = lum < 128 ? 80 : 30
          return [Math.min(r + boost, 255), Math.min(g + boost, 255), Math.min(b + boost, 255)]
        },
      ],
      [
        'black',
        'logo_black.png',
        () => [0, 0, 0], // every opaque pixel → pure black
      ],
      [
        'white',
        'logo_white.png',
        () => [255, 255, 255], // every opaque pixel → pure white
      ],
    ]

    try {
      const { canvas: srcCanvas } = await loadImage(mainSrc, mainMediaId)
      const w = srcCanvas.width
      const h = srcCanvas.height

      for (const [role, filename, transformFn] of variants) {
        setGeneratingRole(role)
        const outCanvas = document.createElement('canvas')
        outCanvas.width = w
        outCanvas.height = h
        const outCtx = outCanvas.getContext('2d')
        outCtx.drawImage(srcCanvas, 0, 0)
        const imageData = outCtx.getImageData(0, 0, w, h)
        applyTransform(imageData, transformFn)
        outCtx.putImageData(imageData, 0, 0)

        const file = await canvasToFile(outCanvas, filename)
        await brandKitService.uploadMedia(workspaceId, editingKitId, {
          file,
          kind: 'logo',
          role,
          name: filename,
        })
      }

      // Refresh media list
      const detail = await brandKitService.get(workspaceId, editingKitId)
      setKitMedia(detail.media || [])
    } catch (err) {
      setError(err.message || 'Variant generation failed')
    } finally {
      setGenerating(false)
      setGeneratingRole(null)
    }
  }
  // ─────────────────────────────────────────────────────────────

  const mediaByKind = (kind) =>
    (kitMedia || []).filter((m) => String(m.kind || m.type || '').toLowerCase() === kind)

  const downloadBrandGuideline = () => {
    const name = kitName.trim() || 'Brand Kit'
    const content = `====================================================
BRAND GUIDELINES SPECIFICATION: ${name.toUpperCase()}
====================================================

1. BRAND BASICS
   - Name: ${name}
   - Tagline / Slogan: ${slogan || 'N/A'}
   - Tone: ${kitData.voice?.tone || 'Professional & Confident'}
   - Target Audience: ${kitData.voice?.audience || 'General Stakeholders'}

2. BRAND COLOR PALETTE (LIGHT & DARK MODES)
   - Primary Light: ${resolveRoleHex(kitData, 'primary', '#2563EB')}
   - Background Light: ${resolveRoleHex(kitData, 'bg', '#F8FAFC')}
   - Primary Dark: ${resolveRoleHex(kitData, 'accent', '#38BDF8')}
   - Background Dark: ${resolveRoleHex(kitData, 'text', '#0F172A')}
   - All Swatches:
${(kitData.colors || []).map((c) => `     * ${c.name}: ${c.hex}`).join('\n')}

3. TYPOGRAPHY SYSTEM
   - Heading Font: ${kitData.fonts?.heading?.family || 'Playfair Display'}
   - Sub Heading Font: ${kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}
   - Body Font: ${kitData.fonts?.body?.family || 'Inter'}

4. VOICE & RULES
   - Dos:
${(kitData.voice?.dos?.length ? kitData.voice.dos : ['Use short, clear sentences.']).map((d) => `     * ${d}`).join('\n')}
   - Don'ts:
${(kitData.voice?.donts?.length ? kitData.voice.donts : ['Avoid informal jargon.']).map((d) => `     * ${d}`).join('\n')}

5. LOGO USAGE GUIDELINES
   - Minimum Clear Space: 1.5x logo height around all brand marks.
   - Do not distort or stretch primary brand marks.

Generated by Athena Brand OS
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_brand_guidelines.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <BrandKitsSkeleton />
  }

  // STEP-BY-STEP CREATION WIZARD FOR NEW BRAND KITS
  if (showEditor && isWizardMode) {
    const closeEditor = () => setShowEditor(false)

    return (
      <div className="videos-page brandkits-page brandkit-editor">
        <div className="videos-shell">
          <header className="videos-page-header">
            <div className="videos-title-section">
              <div className="workspace-header-title">
                <button
                  type="button"
                  className="workspace-back-btn"
                  onClick={closeEditor}
                  title="Back to Brand Kits"
                  aria-label="Back to Brand Kits"
                >
                  <MdArrowBack size={20} />
                </button>
                <div>
                  <h1 className="videos-page-title">Brand Kits</h1>
                  <p className="videos-page-subtitle">Create Brand Kit — Step {wizardStep} of 4</p>
                </div>
              </div>
            </div>
          </header>

          <div className="workspace-breadcrumbs">
            <div className="workspace-breadcrumbs__trail">
              <span
                className="breadcrumb-link"
                onClick={closeEditor}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    closeEditor()
                  }
                }}
                role="link"
                tabIndex={0}
              >
                Brand Kits
              </span>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span>Create Brand Kit</span>
            </div>
          </div>

        {error && (
          <div className="bk-error-banner" role="alert">
            <MdInfoOutline size={18} />
            <span>{error}</span>
          </div>
        )}

        <input
          ref={wizardLogoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleWizardLogoSelected(f)
          }}
        />

        <div className="bk-wizard-container">
          {/* Stepper Indicator */}
          <div className="bk-wizard-stepper">
            <div className={`bk-wizard-step-item ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
              <div className="bk-wizard-step-number">{wizardStep > 1 ? <MdCheck size={14} /> : '1'}</div>
              <span>Brand Basics & Logo</span>
            </div>
            <div className={`bk-wizard-step-item ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
              <div className="bk-wizard-step-number">{wizardStep > 2 ? <MdCheck size={14} /> : '2'}</div>
              <span>Colors</span>
            </div>
            <div className={`bk-wizard-step-item ${wizardStep === 3 ? 'active' : wizardStep > 3 ? 'completed' : ''}`}>
              <div className="bk-wizard-step-number">{wizardStep > 3 ? <MdCheck size={14} /> : '3'}</div>
              <span>Typography</span>
            </div>
            <div className={`bk-wizard-step-item ${wizardStep === 4 ? 'active' : ''}`}>
              <div className="bk-wizard-step-number">4</div>
              <span>Review Guidelines</span>
            </div>
          </div>

          {/* STEP 1: BASICS & LOGO UPLOAD */}
          {wizardStep === 1 && (
            <div className="bk-wizard-body">
              <h2 className="bk-wizard-title">Let&apos;s start with the basics</h2>
              <p className="bk-wizard-desc">Enter your brand name, tagline, and upload your primary brand logo.</p>

              <div className="bk-wizard-grid-step1">
                <div className="bk-wizard-fields-col">
                  <div className="bk-field" style={{ marginBottom: 16 }}>
                    <label>Brand Name *</label>
                    <input
                      type="text"
                      value={kitName}
                      onChange={(e) => setKitName(e.target.value)}
                      placeholder="e.g. Athena AI, AcroCorp"
                      className="bk-wizard-input"
                    />
                  </div>

                  <div className="bk-field" style={{ marginBottom: 16 }}>
                    <label>Slogan / Tagline</label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="e.g. Empowering Executive Decks"
                      className="bk-wizard-input"
                    />
                  </div>

                  <div className="bk-field">
                    <label>Tone of Voice</label>
                    <input
                      type="text"
                      value={kitData.voice?.tone || ''}
                      onChange={(e) =>
                        setKitData((prev) => ({
                          ...prev,
                          voice: { ...prev.voice, tone: e.target.value },
                        }))
                      }
                      placeholder="e.g. Professional, Confident, Visionary"
                      className="bk-wizard-input"
                    />
                  </div>
                </div>

                <div className="bk-wizard-logo-col">
                  <label className="bk-field-lbl">Brand Logo (Primary Mark)</label>
                  {logoPreviewUrl ? (
                    <div className="bk-wizard-logo-preview-box">
                      <img src={logoPreviewUrl} alt="Uploaded Brand Logo" className="bk-wizard-logo-img" />
                      <button
                        type="button"
                        className="ghost-btn danger"
                        style={{ marginTop: 12, padding: '4px 10px', fontSize: 12 }}
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreviewUrl(null)
                        }}
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="bk-wizard-logo-dropzone"
                      onClick={() => wizardLogoInputRef.current?.click()}
                    >
                      <MdImage size={38} color="var(--bk-accent)" />
                      <span className="bk-dropzone-title">Upload Brand Logo</span>
                      <span className="bk-dropzone-sub">SVG, PNG, JPG, or WebP</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setShowEditor(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="create-btn"
                  disabled={!kitName.trim()}
                  onClick={() => setWizardStep(2)}
                >
                  Next: Colors <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BRAND COLORS (Cards with Generate from Logo option) */}
          {wizardStep === 2 && (
            <div className="bk-wizard-body">
              <div className="bk-colors-wizard-header">
                <div>
                  <h2 className="bk-wizard-title">Brand Colors</h2>
                  <p className="bk-wizard-desc">Customize Light & Dark mode color cards or click generate to extract 4 theme colors from your logo.</p>
                </div>
                {logoPreviewUrl && (
                  <button
                    type="button"
                    className="bk-extract-btn"
                    onClick={triggerGenerateFromLogo}
                  >
                    <MdAutoAwesome size={16} />
                    Generate from Logo
                  </button>
                )}
              </div>

              <div className="bk-primary-swatches-grid" style={{ marginBottom: 20 }}>
                {(kitData.colors || []).map((color, index) => {
                  const hex = color.hex || '#0F172A'
                  const rgb = hexToRgb(hex)
                  const [h, s, l] = hexToHsl(hex)

                  return (
                    <div className="bk-color-card" key={color.id || index}>
                      <div className="bk-card-swatch-block" style={{ background: hex }}>
                        <button
                          type="button"
                          className="bk-copy-hex-btn"
                          onClick={() => handleCopyHex(hex)}
                        >
                          <MdContentCopy size={14} />
                          {copiedHex === hex ? 'Copied!' : 'Copy HEX'}
                        </button>
                        {canWrite && (kitData.colors || []).length > 2 && (
                          <button
                            type="button"
                            className="bk-card-delete-btn"
                            onClick={() => removeColor(index)}
                            title="Remove color"
                          >
                            <MdClose size={16} />
                          </button>
                        )}
                      </div>
                      <div className="bk-card-body">
                        <div className="bk-card-title-row">
                          <div>
                            <input
                              type="text"
                              className="bk-card-color-name"
                              value={color.name}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { name: e.target.value })}
                              placeholder="Color Name"
                            />
                            <span className="bk-card-role-tag">{index < 2 ? 'LIGHT MODE' : 'DARK MODE'}</span>
                          </div>
                          <div className="bk-card-hex-box">
                            <input
                              type="color"
                              value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#0F172A'}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { hex: e.target.value.toUpperCase() })}
                              className="bk-picker-inline"
                            />
                            <input
                              type="text"
                              value={color.hex}
                              disabled={!canWrite}
                              onChange={(e) => updateColor(index, { hex: e.target.value })}
                              className="bk-card-hex-val"
                            />
                          </div>
                        </div>

                        <div className="bk-card-tech-grid">
                          <div>
                            <span className="bk-tech-lbl">RGB</span>
                            <span className="bk-tech-val">{rgb}</span>
                          </div>
                          <div>
                            <span className="bk-tech-lbl">HSL</span>
                            <span className="bk-tech-val">{h}°, {s}%, {l}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginBottom: 20 }}>
                <button type="button" className="ghost-btn" onClick={addColor}>
                  <MdAdd size={16} /> Add Color
                </button>
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setWizardStep(1)}>
                  <MdArrowBack size={16} /> Back
                </button>
                <button type="button" className="create-btn" onClick={() => setWizardStep(3)}>
                  Next: Typography <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TYPOGRAPHY & AUTO-GENERATE */}
          {/* STEP 3: TYPOGRAPHY SYSTEM (MATCHING STITCH PROTOTYPE 4f899a683a294d32b7726bc1aeabc0ae) */}
          {wizardStep === 3 && (
            <div className="bk-wizard-body">
              <div className="bk-type-header-row">
                <div className="bk-type-header-left">
                  <h2 className="bk-wizard-title">Typography System</h2>
                  <p className="bk-wizard-desc">
                    Define heading, sub heading, and body font families or auto-generate harmonic font pairings.
                  </p>
                </div>
                <button
                  type="button"
                  className="bk-extract-btn"
                  onClick={triggerAutoGenerateTypography}
                >
                  <MdAutoAwesome size={16} />
                  Auto-Generate Font Pairing
                </button>
              </div>

              {/* 12-Column Layout Grid */}
              <div className="bk-type-grid" style={{ marginBottom: 24 }}>
                {/* Left Column (Span 8) — 3 Typographic Specimen Cards */}
                <div className="bk-type-col-main">
                  {/* 1. HEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">HEADING</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.heading?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                heading: { ...prev.fonts?.heading, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Playfair Display, Outfit"
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <h2
                        className="bk-type-preview-heading"
                        style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif' }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </h2>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">{kitData.fonts?.heading?.family || 'Playfair Display'}</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">700 (Bold)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">48px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">1.2</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. SUBHEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">SUBHEADING</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                subheading: { ...prev.fonts?.subheading, family: e.target.value },
                                tertiary: { ...prev.fonts?.tertiary, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Plus Jakarta Sans, Poppins"
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <h3
                        className="bk-type-preview-subheading"
                        style={{
                          fontFamily:
                            kitData.fonts?.subheading?.family ||
                            kitData.fonts?.tertiary?.family ||
                            'Plus Jakarta Sans, sans-serif',
                        }}
                      >
                        A clean, modern sans-serif perfectly paired for clarity and contrast.
                      </h3>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">
                          {kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}
                        </span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">600 (Semi-bold)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">20px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">28px</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. BODY SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">BODY</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.body?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                body: { ...prev.fonts?.body, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="e.g. Inter, Roboto"
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <p
                        className="bk-type-preview-body"
                        style={{ fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif' }}
                      >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">{kitData.fonts?.body?.family || 'Inter'}</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">400 (Regular)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">16px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">24px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Span 4) — "Typography in Action" Preview */}
                <div className="bk-type-col-side">
                  <div className="bk-type-action-card">
                    <div className="bk-action-card-head">
                      <span>TYPOGRAPHY IN ACTION</span>
                    </div>
                    <div className="bk-action-card-body">
                      <div
                        className="bk-action-cover-img"
                        style={{
                          backgroundImage:
                            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')",
                        }}
                      />
                      <div className="bk-action-content">
                        <span className="bk-action-eyebrow">CASE STUDY</span>
                        <h4
                          className="bk-action-heading"
                          style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif' }}
                        >
                          Designing for the Future of Work
                        </h4>
                        <p
                          className="bk-action-subheading"
                          style={{
                            fontFamily:
                              kitData.fonts?.subheading?.family ||
                              kitData.fonts?.tertiary?.family ||
                              'Plus Jakarta Sans, sans-serif',
                          }}
                        >
                          How minimal interfaces improve deep focus and productivity in modern enterprise software.
                        </p>
                        <p
                          className="bk-action-paragraph"
                          style={{ fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif' }}
                        >
                          The transition to asynchronous work has necessitated tools that don&apos;t just connect us, but help us manage our attention.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setWizardStep(2)}>
                  <MdArrowBack size={16} /> Back
                </button>
                <button type="button" className="create-btn" onClick={() => setWizardStep(4)}>
                  Next: Review Guidelines <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CREATE */}
          {wizardStep === 4 && (
            <div className="bk-wizard-body">
              <h2 className="bk-wizard-title">Review & Finish Brand Kit</h2>
              <p className="bk-wizard-desc">Your brand kit specification is ready. Click finish to initialize the Studio.</p>

              <div className="bk-guideline-card" style={{ marginBottom: 24 }}>
                <div className="bk-guideline-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {logoPreviewUrl && (
                      <img src={logoPreviewUrl} alt="Brand Logo" style={{ height: 32, objectFit: 'contain' }} />
                    )}
                    <h3>{kitName || 'New Brand Kit'} Specification</h3>
                  </div>
                  <span className="bk-overview-chip">Ready to Create</span>
                </div>
                <div className="bk-guideline-grid">
                  <div className="bk-guideline-block">
                    <h5>Basics</h5>
                    <p>Name: <strong>{kitName}</strong><br />Tagline: <em>{slogan || 'N/A'}</em></p>
                  </div>
                  <div className="bk-guideline-block">
                    <h5>Color Cards ({kitData.colors?.length || 0})</h5>
                    <p>Base: <code>{resolveRoleHex(kitData, 'primary', '#2563EB')}</code></p>
                  </div>
                  <div className="bk-guideline-block">
                    <h5>Typography</h5>
                    <p>
                      Heading: <strong>{kitData.fonts?.heading?.family || 'Playfair Display'}</strong><br />
                      Sub Heading: <strong>{kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}</strong><br />
                      Body: <strong>{kitData.fonts?.body?.family || 'Inter'}</strong>
                    </p>
                  </div>
                  <div className="bk-guideline-block">
                    <h5>Voice & Tone</h5>
                    <p>Tone: <em>{kitData.voice?.tone || 'Professional'}</em></p>
                  </div>
                </div>
              </div>

              <div className="bk-wizard-actions">
                <button type="button" className="ghost-btn" onClick={() => setWizardStep(3)}>
                  <MdArrowBack size={16} /> Back
                </button>
                <button
                  type="button"
                  className="create-btn"
                  onClick={async () => {
                    await handleSave(true)
                  }}
                  disabled={saving}
                >
                  <MdCheck size={18} />
                  {saving ? 'Creating…' : 'Create & Open Studio'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    )
  }

  // FULL SECTIONISED BRAND KIT STUDIO WITH TOP HORIZONTAL TABS & EDITORIAL BENTO OVERVIEW
  if (showEditor && !isWizardMode) {
    const editorNavItems = [
      { id: 'overview', label: 'Overview', icon: MdDashboard },
      { id: 'identity', label: 'Brand Colors', icon: MdPalette },
      { id: 'logos', label: 'Logos', icon: MdCategory },
      { id: 'typography', label: 'Typography', icon: MdTextFields },
      { id: 'imagery', label: 'Imagery', icon: MdPhotoLibrary },
      { id: 'guideline', label: 'Brand Guideline', icon: MdMenuBook },
    ]

    const colorsList = kitData.colors || []
    const primaryColors = colorsList.slice(0, 2)
    const secondaryColors = colorsList.slice(2)
    const closeEditor = () => setShowEditor(false)

    return (
      <div className="videos-page brandkits-page brandkit-editor">
        <div className="videos-shell">
          <header className="videos-page-header">
            <div className="videos-title-section">
              <div className="workspace-header-title">
                <button
                  type="button"
                  className="workspace-back-btn"
                  onClick={closeEditor}
                  title="Back to Brand Kits"
                  aria-label="Back to Brand Kits"
                >
                  <MdArrowBack size={20} />
                </button>
                <h1 className="videos-page-title">Brand Kits</h1>
              </div>
            </div>
            <div className="videos-actions">
              <button
                type="button"
                className="btn-secondary videos-create-btn"
                onClick={downloadBrandGuideline}
                title="Download Brand Guideline specification"
              >
                <MdDownload size={18} />
                Download Guideline
              </button>
              {canWrite && (
                <button
                  type="button"
                  className="btn-primary videos-create-btn"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  <MdSave size={18} />
                  {saving ? 'Saving…' : 'Save kit'}
                </button>
              )}
            </div>
          </header>

          <div className="workspace-breadcrumbs">
            <div className="workspace-breadcrumbs__trail">
              <span
                className="breadcrumb-link"
                onClick={closeEditor}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    closeEditor()
                  }
                }}
                role="link"
                tabIndex={0}
              >
                Brand Kits
              </span>
              <ChevronRight size={14} className="breadcrumb-separator" />
              {canWrite ? (
                <input
                  type="text"
                  className="brandkits-breadcrumb-name"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="Brand Kit Name"
                  aria-label="Brand kit name"
                />
              ) : (
                <span className="brandkits-breadcrumb-current">{kitName || 'Brand Kit'}</span>
              )}
            </div>
          </div>

        {/* Workspace-style section tabs */}
        <div className="workspace-root-tabs-wrapper" role="tablist" aria-label="Brand kit sections">
          <div className="workspace-root-tabs">
            {editorNavItems.map((item) => {
              const Icon = item.icon
              const isActive = editorTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`workspace-root-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setEditorTab(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="bk-error-banner" role="alert">
            <MdInfoOutline size={18} />
            <span>{error}</span>
          </div>
        )}
        {!canWrite && (
          <div className="bk-info-banner">
            <MdInfoOutline size={16} />
            You can view this brand kit. Only owners and admins can edit.
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />

        {/* Studio Content Panel */}
        <div className="editor-studio-panel">
          {/* OVERVIEW TAB - EDITORIAL BENTO GRID MATCHING STITCH PROTOTYPE */}
          {editorTab === 'overview' && (
            <div className="editor-tab-content">
              <div className="bk-bento-grid">
                {/* Brand Health Card (Span 4) */}
                <div className="bk-bento-card col-4">
                  <div className="bk-bento-card-head">
                    <h3 className="bk-bento-card-title">Brand Health</h3>
                    <button
                      type="button"
                      className="bk-circle-arrow-btn"
                      onClick={() => setEditorTab('guideline')}
                      title="View Guideline"
                    >
                      <MdArrowForward size={16} />
                    </button>
                  </div>
                  <div className="bk-bento-health-body">
                    <div className="bk-health-ring-box">
                      <svg className="bk-health-svg" viewBox="0 0 100 100">
                        <circle className="bk-ring-bg" cx="50" cy="50" r="42" strokeWidth="8" />
                        <circle
                          className="bk-ring-val"
                          cx="50"
                          cy="50"
                          r="42"
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset="21"
                        />
                      </svg>
                      <span className="bk-health-num">92<small>%</small></span>
                    </div>
                    <div className="bk-health-info">
                      <span className="bk-health-status">Excellent Consistency</span>
                      <span className="bk-health-desc">Across 1,204 active generative assets this month.</span>
                    </div>
                  </div>
                </div>

                {/* Primary Marks Card (Span 8) */}
                <div className="bk-bento-card col-8 bk-bento-logo-hero">
                  <div className="bk-bento-logo-left">
                    <div>
                      <h3 className="bk-bento-card-title">Primary Marks</h3>
                      <p className="bk-bento-desc">
                        The core visual identifier for the brand. Requires minimum clear space of 1.5x cap height.
                      </p>
                    </div>
                    <div className="bk-logo-formats">
                      <span className="bk-formats-label">FORMATS</span>
                      <div className="bk-formats-pills">
                        <span className="bk-format-chip">SVG</span>
                        <span className="bk-format-chip">PNG</span>
                        <span className="bk-format-chip">WEBP</span>
                      </div>
                    </div>
                  </div>
                  <div className="bk-bento-logo-right">
                    <div className="bk-bento-logo-canvas">
                      {mediaByKind('logo').length > 0 ? (
                        <img
                          src={mediaByKind('logo')[0].url || mediaByKind('logo')[0].src}
                          alt="Primary Brand Logo"
                          className="bk-bento-logo-img"
                        />
                      ) : logoPreviewUrl ? (
                        <img src={logoPreviewUrl} alt="Primary Brand Logo" className="bk-bento-logo-img" />
                      ) : (
                        <button
                          type="button"
                          className="bk-logo-upload-placeholder"
                          disabled={!canWrite}
                          onClick={() => triggerUpload('logo')}
                        >
                          <MdAdd size={32} color="var(--bk-accent)" />
                          <span>Upload Primary Mark</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Core Palette Card (Span 7) */}
                <div className="bk-bento-card col-7">
                  <div className="bk-bento-card-head">
                    <h3 className="bk-bento-card-title">Core Palette</h3>
                    <span className="bk-bento-tag">HEX / RGB / HSL</span>
                  </div>
                  <div className="bk-bento-swatch-grid">
                    {(kitData.colors || []).slice(0, 4).map((c, i) => (
                      <div
                        key={c.id || i}
                        className="bk-bento-swatch-item"
                        onClick={() => handleCopyHex(c.hex)}
                        title="Click to copy HEX"
                      >
                        <div className="bk-bento-swatch-box" style={{ background: c.hex }}>
                          <span className="bk-bento-copy-icon">
                            {copiedHex === c.hex ? <MdCheck size={14} /> : <MdContentCopy size={14} />}
                          </span>
                        </div>
                        <span className="bk-bento-swatch-name">{c.name}</span>
                        <span className="bk-bento-swatch-hex">{c.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography Card (Span 5) */}
                <div
                  className="bk-bento-card col-5 bk-bento-type-card"
                  onClick={() => setEditorTab('typography')}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full Typography System"
                >
                  <div className="bk-bento-card-head">
                    <h3 className="bk-bento-card-title">Typography</h3>
                  </div>
                  <div className="bk-bento-type-rows">
                    <div className="bk-bento-type-item">
                      <span className="bk-type-role">HEADINGS</span>
                      <div className="bk-type-val-row">
                        <span
                          className="bk-type-font-name"
                          style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display' }}
                        >
                          {kitData.fonts?.heading?.family || 'Playfair Display'}
                        </span>
                        <span className="bk-type-weights">Bold, SemiBold</span>
                      </div>
                    </div>
                    <div className="bk-bento-type-item">
                      <span className="bk-type-role">SUB HEADINGS</span>
                      <div className="bk-type-val-row">
                        <span
                          className="bk-type-font-name"
                          style={{ fontFamily: kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans' }}
                        >
                          {kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}
                        </span>
                        <span className="bk-type-weights">Medium, SemiBold</span>
                      </div>
                    </div>
                    <div className="bk-bento-type-item">
                      <span className="bk-type-role">BODY & UI</span>
                      <div className="bk-type-val-row">
                        <span
                          className="bk-type-font-name"
                          style={{ fontFamily: kitData.fonts?.body?.family || 'Inter' }}
                        >
                          {kitData.fonts?.body?.family || 'Inter'}
                        </span>
                        <span className="bk-type-weights">Regular, Medium</span>
                      </div>
                    </div>
                  </div>
                  <div className="bk-bento-watermark">Aa</div>
                </div>
              </div>
            </div>
          )}

          {/* BRAND COLORS TAB */}
          {editorTab === 'identity' && (
            <div className="editor-tab-content">
              <div className="bk-tab-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 20 }}>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    const base = primaryColors[0]?.hex || '#2563EB'
                    const [h, s, l] = hexToHsl(base)
                    const gen = [
                      hslToHex(h + 60, s, l),
                      hslToHex(h + 180, s, l),
                      hslToHex(h + 240, s, l),
                    ]

                    setKitData((prev) => ({
                      ...prev,
                      colors: [
                        ...(prev.colors || []),
                        ...gen.map((hex, i) => ({
                          id: `c_gen_${Date.now()}_${i}`,
                          name: `Harmonic Accent ${i + 1}`,
                          hex,
                        })),
                      ].slice(0, 32),
                    }))
                  }}
                >
                  <MdAutoAwesome size={18} />
                  Generate Palette
                </button>
                {canWrite && (
                  <button type="button" className="create-btn" onClick={addColor}>
                    <MdAdd size={18} />
                    Add Color
                  </button>
                )}
              </div>

              <div className="bk-colors-main-col" style={{ width: '100%' }}>
                {/* [01] Primary Palette */}
                <section className="bk-color-section">
                  <div className="bk-section-head-line">
                    <span className="bk-sec-num">[01]</span>
                    <h3 className="bk-sec-title">Primary Theme Palette</h3>
                  </div>

                  <div className="bk-primary-swatches-grid">
                    {(primaryColors.length > 0 ? primaryColors : colorsList).map((color, index) => {
                      const hex = color.hex || '#0F172A'
                      const rgb = hexToRgb(hex)
                      const [h, s, l] = hexToHsl(hex)
                      const roleName = index === 0 ? 'Primary Color (Light Mode)' : 'Background Color (Light Mode)'

                      return (
                        <div className="bk-color-card" key={color.id || index}>
                          <div className="bk-card-swatch-block" style={{ background: hex }}>
                            <button
                              type="button"
                              className="bk-copy-hex-btn"
                              onClick={() => handleCopyHex(hex)}
                            >
                              <MdContentCopy size={14} />
                              {copiedHex === hex ? 'Copied!' : 'Copy HEX'}
                            </button>
                            {canWrite && (
                              <button
                                type="button"
                                className="bk-card-delete-btn"
                                onClick={() => removeColor(index)}
                                title="Remove color"
                              >
                                <MdClose size={16} />
                              </button>
                            )}
                          </div>
                          <div className="bk-card-body">
                            <div className="bk-card-title-row">
                              <div>
                                <input
                                  type="text"
                                  className="bk-card-color-name"
                                  value={color.name}
                                  disabled={!canWrite}
                                  onChange={(e) => updateColor(index, { name: e.target.value })}
                                  placeholder="Color Name"
                                />
                                <span className="bk-card-role-tag">{roleName}</span>
                              </div>
                              <div className="bk-card-hex-box">
                                <input
                                  type="color"
                                  value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#0F172A'}
                                  disabled={!canWrite}
                                  onChange={(e) => updateColor(index, { hex: e.target.value.toUpperCase() })}
                                  className="bk-picker-inline"
                                />
                                <input
                                  type="text"
                                  value={color.hex}
                                  disabled={!canWrite}
                                  onChange={(e) => updateColor(index, { hex: e.target.value })}
                                  className="bk-card-hex-val"
                                />
                              </div>
                            </div>

                            <div className="bk-card-tech-grid">
                              <div>
                                <span className="bk-tech-lbl">RGB</span>
                                <span className="bk-tech-val">{rgb}</span>
                              </div>
                              <div>
                                <span className="bk-tech-lbl">HSL</span>
                                <span className="bk-tech-val">{h}°, {s}%, {l}%</span>
                              </div>
                            </div>
                            <p className="bk-card-desc">
                              {index === 0
                                ? 'Primary accent color for Light Theme buttons and navigational elements.'
                                : 'Light, crisp background surface tone for Light Theme.'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* [02] Secondary & Dark Mode Palette */}
                <section className="bk-color-section" style={{ marginTop: 28 }}>
                  <div className="bk-section-head-line">
                    <span className="bk-sec-num">[02]</span>
                    <h3 className="bk-sec-title">Dark Mode & Secondary Tones</h3>
                  </div>

                  <div className="bk-secondary-swatches-grid">
                    {secondaryColors.map((color, idx) => {
                      const actualIndex = idx + 2
                      const hex = color.hex
                      return (
                        <div
                          key={color.id || idx}
                          className="bk-secondary-card"
                          onClick={() => handleCopyHex(hex)}
                          title="Click to copy HEX"
                        >
                          <div
                            className="bk-sec-swatch-box"
                            style={{ background: hex }}
                          >
                            <span className="bk-sec-copy-icon">
                              {copiedHex === hex ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                            </span>
                          </div>
                          <input
                            type="text"
                            className="bk-sec-name-input"
                            value={color.name}
                            disabled={!canWrite}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateColor(actualIndex, { name: e.target.value })}
                          />
                          <span className="bk-sec-hex-val">{hex}</span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* LOGOS TAB */}
          {editorTab === 'logos' && (
            <div className="editor-tab-content">
              <div className="bk-logo-variants-intro">
                <div>
                  <p className="bk-logo-variants-desc">
                    Upload each logo variant below. Each version is optimised for different contexts — light and dark themes, monochrome printing, horizontal lockups, and more.
                  </p>
                  <div className="bk-dl-formats-row" style={{ marginTop: 8 }}>
                    <span className="bk-dl-label">ACCEPTED FORMATS</span>
                    <span className="bk-dl-badge">SVG</span>
                    <span className="bk-dl-badge">PNG</span>
                    <span className="bk-dl-badge">WEBP</span>
                    <span className="bk-dl-badge">JPG</span>
                  </div>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    className={`bk-extract-btn ${generating ? 'generating' : ''}`}
                    onClick={generateLogoVariants}
                    disabled={generating}
                    title="Auto-generates Light Mode, Dark Mode, Black, and White variants from your Primary Logo using canvas pixel processing"
                  >
                    <MdAutoAwesome size={16} />
                    {generating ? `Generating ${generatingRole || ''}…` : 'Generate Variants from Primary'}
                  </button>
                )}
              </div>

              <div className="bk-logo-variant-grid">
                {[
                  {
                    role: 'primary',
                    label: 'Primary Logo',
                    desc: 'Primary brand mark for general use on neutral backgrounds.',
                    bg: 'var(--bk-page)',
                  },
                  {
                    role: 'light-mode',
                    label: 'Light Mode',
                    desc: 'Optimised for use on light / white backgrounds.',
                    bg: '#F8FAFC',
                  },
                  {
                    role: 'dark-mode',
                    label: 'Dark Mode',
                    desc: 'Optimised for use on dark / black backgrounds.',
                    bg: '#0F172A',
                  },
                  {
                    role: 'with-name-below',
                    label: 'With Name Below',
                    desc: 'Mark stacked above the brand wordmark.',
                    bg: 'var(--bk-page)',
                  },
                  {
                    role: 'with-name-adjacent',
                    label: 'With Name Adjacent',
                    desc: 'Mark and wordmark side-by-side (horizontal lockup).',
                    bg: 'var(--bk-page)',
                  },
                  {
                    role: 'black',
                    label: 'Black / Monochrome',
                    desc: 'Single-colour black version for light backgrounds and print.',
                    bg: '#F1F5F9',
                  },
                  {
                    role: 'white',
                    label: 'White / Reversed',
                    desc: 'Single-colour white version for dark backgrounds and overlays.',
                    bg: '#1E293B',
                  },
                ].map(({ role, label, desc, bg }) => {
                  // For the 'primary' card also accept legacy role='main'
                  const uploaded = mediaByKind('logo').filter(
                    (m) => (m.role || '') === role || (role === 'primary' && (m.role || '') === 'main')
                  )
                  // Fallback: show wizard logo preview if no server-uploaded file yet
                  const fallbackSrc = role === 'primary' ? logoPreviewUrl : null
                  const hasUpload = uploaded.length > 0
                  const hasFallback = !hasUpload && !!fallbackSrc

                  return (
                    <div key={role} className="bk-logo-variant-card">
                      {/* Preview canvas */}
                      <div
                        className={`bk-logo-variant-canvas ${role === 'dark-mode' || role === 'white' ? 'dark-canvas' : ''}`}
                        style={{ background: bg }}
                      >
                        {hasUpload || hasFallback ? (
                          <>
                            <img
                              src={
                                hasUpload
                                  ? (uploaded[0].url || uploaded[0].src || uploaded[0].presignedUrl)
                                  : fallbackSrc
                              }
                              alt={label}
                              className="bk-logo-variant-img"
                            />
                            {canWrite && (
                              <button
                                type="button"
                                className="bk-logo-variant-remove"
                                onClick={() => handleDeleteMedia(uploaded[0].id || uploaded[0]._id)}
                                aria-label={`Remove ${label}`}
                              >
                                <MdClose size={14} />
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            className="bk-logo-variant-dropzone"
                            disabled={!canWrite}
                            onClick={() => triggerUpload('logo', role)}
                          >
                            <MdAdd size={26} />
                            <span>Upload</span>
                          </button>
                        )}
                      </div>

                      {/* Label row */}
                      <div className="bk-logo-variant-footer">
                        <div className="bk-logo-variant-label-col">
                          <span className="bk-logo-variant-name">{label}</span>
                          <span className="bk-logo-variant-desc">{desc}</span>
                        </div>
                        {hasUpload && canWrite && (
                          <button
                            type="button"
                            className="bk-logo-variant-replace-btn"
                            onClick={() => triggerUpload('logo', role)}
                            title={`Replace ${label}`}
                          >
                            Replace
                          </button>
                        )}
                      </div>

                      {/* Status chip */}
                      <div className={`bk-logo-variant-status ${hasUpload ? 'uploaded' : 'empty'}`}>
                        {hasUpload ? '✓ Uploaded' : 'Missing'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TYPOGRAPHY TAB — MATCHING STITCH PROTOTYPE 4f899a683a294d32b7726bc1aeabc0ae */}
          {editorTab === 'typography' && (
            <div className="editor-tab-content">
              {/* Subheader Title & Auto-Generate Action Button */}
              <div className="bk-type-header-row">
                <div className="bk-type-header-left">
                  <h2 className="bk-type-page-title">Typography System</h2>
                  <p className="bk-type-page-desc">
                    Define how your brand communicates through type across executive presentation decks and marketing surfaces.
                  </p>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    className="bk-extract-btn"
                    onClick={triggerAutoGenerateTypography}
                  >
                    <MdAutoAwesome size={16} />
                    Auto-Generate Font Pairing
                  </button>
                )}
              </div>

              {/* 12-Column Layout Grid */}
              <div className="bk-type-grid">
                {/* Left Column (Span 8) — 3 Typographic Specimen Cards */}
                <div className="bk-type-col-main">
                  {/* 1. HEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">HEADING</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <select
                          className="bk-type-inline-select"
                          value={kitData.fonts?.heading?.family || 'Playfair Display'}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                heading: { ...prev.fonts?.heading, family: e.target.value },
                              },
                            }))
                          }
                          disabled={!canWrite}
                        >
                          {POPULAR_GOOGLE_FONTS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.heading?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                heading: { ...prev.fonts?.heading, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="Or type custom font"
                          disabled={!canWrite}
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <h2
                        className="bk-type-preview-heading"
                        style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif' }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </h2>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">{kitData.fonts?.heading?.family || 'Playfair Display'}</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">700 (Bold)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">48px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">1.2</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. SUBHEADING SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">SUBHEADING</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <select
                          className="bk-type-inline-select"
                          value={kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                subheading: { ...prev.fonts?.subheading, family: e.target.value },
                                tertiary: { ...prev.fonts?.tertiary, family: e.target.value },
                              },
                            }))
                          }
                          disabled={!canWrite}
                        >
                          {POPULAR_GOOGLE_FONTS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                subheading: { ...prev.fonts?.subheading, family: e.target.value },
                                tertiary: { ...prev.fonts?.tertiary, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="Or type custom font"
                          disabled={!canWrite}
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <h3
                        className="bk-type-preview-subheading"
                        style={{
                          fontFamily:
                            kitData.fonts?.subheading?.family ||
                            kitData.fonts?.tertiary?.family ||
                            'Plus Jakarta Sans, sans-serif',
                        }}
                      >
                        A clean, modern sans-serif perfectly paired for clarity and contrast.
                      </h3>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">
                          {kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'}
                        </span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">600 (Semi-bold)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">20px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">28px</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. BODY SPECIMEN CARD */}
                  <div className="bk-type-specimen-box">
                    <div className="bk-type-box-head">
                      <span className="bk-type-box-tag">BODY</span>
                      <div className="bk-type-box-input-wrap">
                        <label className="bk-type-input-lbl">FONT FAMILY</label>
                        <select
                          className="bk-type-inline-select"
                          value={kitData.fonts?.body?.family || 'Inter'}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                body: { ...prev.fonts?.body, family: e.target.value },
                              },
                            }))
                          }
                          disabled={!canWrite}
                        >
                          {POPULAR_GOOGLE_FONTS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="bk-type-inline-input"
                          value={kitData.fonts?.body?.family || ''}
                          onChange={(e) =>
                            setKitData((prev) => ({
                              ...prev,
                              fonts: {
                                ...prev.fonts,
                                body: { ...prev.fonts?.body, family: e.target.value },
                              },
                            }))
                          }
                          placeholder="Or type custom font"
                          disabled={!canWrite}
                        />
                      </div>
                    </div>

                    <div className="bk-type-box-preview">
                      <p
                        className="bk-type-preview-body"
                        style={{ fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif' }}
                      >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                      </p>
                    </div>

                    <div className="bk-type-box-badges">
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">FAMILY</span>
                        <span className="bk-tb-val">{kitData.fonts?.body?.family || 'Inter'}</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">WEIGHT</span>
                        <span className="bk-tb-val">400 (Regular)</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">SIZE</span>
                        <span className="bk-tb-val">16px</span>
                      </div>
                      <div className="bk-type-badge">
                        <span className="bk-tb-lbl">LINE HEIGHT</span>
                        <span className="bk-tb-val">24px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Span 4) — "Typography in Action" Sticky Preview Card */}
                <div className="bk-type-col-side">
                  <div className="bk-type-action-card">
                    <div className="bk-action-card-head">
                      <span>TYPOGRAPHY IN ACTION</span>
                    </div>
                    <div className="bk-action-card-body">
                      <div
                        className="bk-action-cover-img"
                        style={{
                          backgroundImage:
                            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')",
                        }}
                      />
                      <div className="bk-action-content">
                        <span className="bk-action-eyebrow">CASE STUDY</span>
                        <h4
                          className="bk-action-heading"
                          style={{ fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif' }}
                        >
                          Designing for the Future of Work
                        </h4>
                        <p
                          className="bk-action-subheading"
                          style={{
                            fontFamily:
                              kitData.fonts?.subheading?.family ||
                              kitData.fonts?.tertiary?.family ||
                              'Plus Jakarta Sans, sans-serif',
                          }}
                        >
                          How minimal interfaces improve deep focus and productivity in modern enterprise software.
                        </p>
                        <p
                          className="bk-action-paragraph"
                          style={{ fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif' }}
                        >
                          The transition to asynchronous work has necessitated tools that don&apos;t just connect us, but help us manage our attention. By reducing visual noise and employing strict typographic hierarchies, we create environments that feel less like dashboards and more like quiet studios.
                        </p>
                      </div>
                      <button type="button" className="bk-action-btn">
                        Read Full Article <MdArrowForward size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IMAGERY TAB */}
          {editorTab === 'imagery' && (
            <div className="editor-tab-content">
              <div className="bk-colors-main-col" style={{ width: '100%' }}>
                <section className="customize-card">
                  <SectionHead
                    icon={MdPhotoLibrary}
                    title="AI Visual Brief & Charts"
                    hint="Chart colors pick from your palette. Image style briefs AI visual generators."
                  />
                  <div className="bk-field">
                    <label>Chart colors</label>
                    <div className="chip-row">
                      {(kitData.colors || []).map((c) => {
                        const selected = (kitData.chartStyles?.colorIds || []).includes(c.id)
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className={`role-chip with-swatch ${selected ? 'active' : ''}`}
                            disabled={!canWrite}
                            onClick={() =>
                              setKitData((prev) => {
                                const ids = new Set(prev.chartStyles?.colorIds || [])
                                if (ids.has(c.id)) ids.delete(c.id)
                                else ids.add(c.id)
                                return {
                                  ...prev,
                                  chartStyles: { colorIds: [...ids] },
                                }
                              })
                            }
                          >
                            <span
                              className="role-field-swatch"
                              style={{ background: c.hex, marginRight: 0 }}
                            />
                            {c.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="bk-field">
                    <label>Image style brief</label>
                    <textarea
                      value={kitData.imageStyle || ''}
                      disabled={!canWrite}
                      onChange={(e) => setKitData((prev) => ({ ...prev, imageStyle: e.target.value }))}
                      placeholder="clean product photography, studio lighting, brand-safe"
                    />
                  </div>

                  <h4 className="media-section-label">Photos & Graphics Upload</h4>
                  <div className="upload-grid">
                    <button
                      type="button"
                      className="upload-box"
                      disabled={!canWrite}
                      onClick={() => triggerUpload('photo')}
                    >
                      <MdAdd size={28} color="var(--bk-accent)" />
                      <span className="upload-label">Upload photo</span>
                    </button>
                    <button
                      type="button"
                      className="upload-box"
                      disabled={!canWrite}
                      onClick={() => triggerUpload('graphic')}
                    >
                      <MdAdd size={28} color="var(--bk-accent)" />
                      <span className="upload-label">Upload graphic</span>
                    </button>
                  </div>

                  {['photo', 'graphic'].map((kind) => {
                    const items = mediaByKind(kind)
                    if (!items.length) return null
                    return (
                      <div key={kind}>
                        <div className="media-section-label">{kind}s</div>
                        <div className="upload-grid">
                          {items.map((item) => {
                            const id = item.id || item._id
                            const url = item.url || item.presignedUrl || item.src
                            return (
                              <div className="upload-box" key={id} style={{ cursor: 'default' }}>
                                {canWrite && (
                                  <button
                                    type="button"
                                    className="media-remove"
                                    onClick={() => handleDeleteMedia(id)}
                                    aria-label="Remove media"
                                  >
                                    <MdClose size={14} />
                                  </button>
                                )}
                                {url ? <img src={url} alt={item.name || kind} /> : null}
                                <span className="upload-label">{item.role || item.name || kind}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </section>
              </div>
            </div>
          )}

          {/* BRAND GUIDELINE PRESENTATION STUDIO (LEFT VIEWER + RIGHT 2-COL SCENE GRID) */}
          {editorTab === 'guideline' && (
            <div className="editor-tab-content">
              <div className="bk-slides-studio-layout">
                {/* Header Row */}
                <div className="bk-slides-studio-header">
                  <div className="bk-type-header-left">
                    <h2 className="bk-type-page-title">Brand Guideline Presentation Deck</h2>
                    <p className="bk-type-page-desc">
                      Executive 16:9 widescreen presentation deck with navigation arrows and a 2-column slide scene navigator.
                    </p>
                  </div>
                  <div className="bk-slides-actions">
                    <button
                      type="button"
                      className={`bk-extract-btn ${generatingGuideline ? 'generating' : ''}`}
                      onClick={downloadBrandGuidelinePdf}
                      disabled={generatingGuideline}
                    >
                      <MdAutoAwesome size={16} />
                      {generatingGuideline ? 'Generating Deck…' : 'Generate Brand Guideline'}
                    </button>
                    <button
                      type="button"
                      className="create-btn"
                      onClick={downloadBrandGuidelinePdf}
                      disabled={generatingGuideline}
                    >
                      <MdDownload size={16} />
                      Download Deck (.pdf)
                    </button>
                  </div>
                </div>

                {/* Main Studio Workspace: Left Viewer + Right 2-Col Thumbnails Sidebar */}
                <div className="bk-slides-workspace">
                  {/* Left Column: Outside Left Arrow + 4:3 Slide Viewer + Outside Right Arrow */}
                  <div className="bk-slides-viewer-container">
                    <div className="bk-slides-viewer-row">
                      {/* Outside Left Arrow */}
                      <button
                        type="button"
                        className="bk-slide-outside-arrow"
                        disabled={activeSlideIndex === 0}
                        onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                        title="Previous Slide"
                        aria-label="Previous Slide"
                      >
                        <MdArrowBack size={20} />
                      </button>

                      {/* 4:3 Slide Viewer Frame */}
                      <div className="bk-slide-viewer">
                        {/* Header Tag */}
                        <div className="bk-slide-header-tag">
                          <span className="bk-slide-tag-lbl">
                            {['01 / COVER', '02 / PALETTE', '03 / LOGOS', '04 / TYPOGRAPHY', '05 / IMAGERY', '06 / GOVERNANCE'][activeSlideIndex]}
                          </span>
                          <span className="bk-slide-tag-brand">{kitName || 'Brand Identity'}</span>
                        </div>

                        {/* Active Slide Body Content */}
                        <div className="bk-slide-body">
                          {/* SLIDE 1: COVER */}
                          {activeSlideIndex === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div className="bk-slide-cover-badge">
                                <MdPalette size={14} /> EXECUTIVE BRAND SPECIFICATION
                              </div>
                              <h1 className="bk-slide-cover-title">{kitName || 'Brand Kit'}</h1>
                              <p className="bk-slide-cover-desc">
                                Comprehensive identity design system, color palette specifications, typography hierarchy, and brand governance rules.
                              </p>
                            </div>
                          )}

                          {/* SLIDE 2: PALETTE */}
                          {activeSlideIndex === 1 && (
                            <div>
                              <h3 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Brand Color Palette
                              </h3>
                              <div className="bk-slide-color-grid">
                                {(kitData.colors || []).slice(0, 6).map((c, i) => (
                                  <div key={c.id || i} className="bk-slide-color-card">
                                    <div className="bk-slide-swatch-box" style={{ background: c.hex }} />
                                    <span className="bk-slide-color-name">{c.name}</span>
                                    <span className="bk-slide-color-hex">{c.hex}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="bk-slide-info-box">
                                <h4>Color Standards & Accessibility</h4>
                                <p>
                                  Primary brand colors drive core call-to-action surfaces. Ensure all foreground text achieves minimum WCAG AA contrast (4.5:1 ratio).
                                </p>
                              </div>
                            </div>
                          )}

                          {/* SLIDE 3: LOGO SYSTEM */}
                          {activeSlideIndex === 2 && (
                            <div>
                              <h3 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Logo Lockups & Clear Space Rules
                              </h3>
                              <div className="bk-slide-logo-grid">
                                {[
                                  { role: 'primary', label: 'Primary Mark' },
                                  { role: 'light-mode', label: 'Light Mode' },
                                  { role: 'dark-mode', label: 'Dark Mode' },
                                  { role: 'black', label: 'Black / Mono' },
                                  { role: 'white', label: 'White Reversed' },
                                  { role: 'with-name-adjacent', label: 'Horizontal Lockup' },
                                ].map(({ role, label }) => {
                                  const item = mediaByKind('logo').find(
                                    (m) => (m.role || '') === role || (role === 'primary' && (m.role || '') === 'main')
                                  )
                                  const url = item?.url || item?.src || item?.presignedUrl || (role === 'primary' ? logoPreviewUrl : null)
                                  return (
                                    <div key={role} className="bk-slide-logo-card">
                                      <span className="bk-slide-logo-title">{label}</span>
                                      <div className="bk-slide-logo-canvas">
                                        {url ? (
                                          <img src={url} alt={label} />
                                        ) : (
                                          <span style={{ fontSize: 11, color: '#64748B' }}>[ Mark Specimen ]</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* SLIDE 4: TYPOGRAPHY SYSTEM */}
                          {activeSlideIndex === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Typography System & Hierarchy
                              </h3>
                              <div className="bk-slide-info-box">
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.1em' }}>
                                  HEADING FONT • 700 BOLD
                                </span>
                                <h2
                                  style={{
                                    margin: 0,
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: '#FFFFFF',
                                    fontFamily: kitData.fonts?.heading?.family || 'Playfair Display, serif',
                                  }}
                                >
                                  {kitData.fonts?.heading?.family || 'Playfair Display'} Heading Title
                                </h2>
                              </div>
                              <div className="bk-slide-info-box">
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.1em' }}>
                                  SUBHEADING FONT • 600 SEMI-BOLD
                                </span>
                                <h4
                                  style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: '#CBD5E1',
                                    fontFamily:
                                      kitData.fonts?.subheading?.family ||
                                      kitData.fonts?.tertiary?.family ||
                                      'Plus Jakarta Sans, sans-serif',
                                  }}
                                >
                                  {kitData.fonts?.subheading?.family || kitData.fonts?.tertiary?.family || 'Plus Jakarta Sans'} Sub Heading Tagline
                                </h4>
                              </div>
                              <div className="bk-slide-info-box">
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.1em' }}>
                                  BODY FONT • 400 REGULAR
                                </span>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    color: '#94A3B8',
                                    fontFamily: kitData.fonts?.body?.family || 'Inter, sans-serif',
                                  }}
                                >
                                  The quick brown fox jumps over the lazy dog. Executive deck layouts combine elegant display headings, distinct subheadings, and highly readable body typography.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* SLIDE 5: IMAGERY & MOOD */}
                          {activeSlideIndex === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Imagery & Photography Style Brief
                              </h3>
                              <div className="bk-slide-info-box">
                                <h4>Visual Brief Statement</h4>
                                <p style={{ fontStyle: 'italic', fontSize: 14, color: '#E2E8F0' }}>
                                  &quot;{kitData.imageStyle || 'Clean product photography with studio lighting, brand-safe minimal aesthetics, and natural composition.'}&quot;
                                </p>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                <div className="bk-slide-info-box">
                                  <h4>Lighting Tone</h4>
                                  <p>Bright, natural daylight with soft studio fills.</p>
                                </div>
                                <div className="bk-slide-info-box">
                                  <h4>Composition</h4>
                                  <p>Uncluttered subject placement with spacious margins.</p>
                                </div>
                                <div className="bk-slide-info-box">
                                  <h4>Brand Accent</h4>
                                  <p>Natural integration of brand colors in environment.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SLIDE 6: GOVERNANCE */}
                          {activeSlideIndex === 5 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>
                                Brand Governance & Compliance
                              </h3>
                              <div className="bk-slide-info-box">
                                <h4>Compliance Guidelines</h4>
                                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <li>Always use approved SVG/PNG logo vectors from official brand kit repository.</li>
                                  <li>Do not alter hex codes, font family pairings, or aspect ratios.</li>
                                  <li>Target Voice Tone: <strong>{kitData.voice?.tone || 'Professional & Confident'}</strong></li>
                                  <li>Target Audience: <strong>{kitData.voice?.audience || 'General Enterprise Stakeholders'}</strong></li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="bk-slide-footer">
                          <span>{kitName || 'Brand Kit'} • Executive Guidelines</span>
                          <span>16:9 Widescreen • Slide {activeSlideIndex + 1} of 6</span>
                        </div>
                      </div>

                      {/* Outside Right Arrow */}
                      <button
                        type="button"
                        className="bk-slide-outside-arrow"
                        disabled={activeSlideIndex === 5}
                        onClick={() => setActiveSlideIndex((prev) => Math.min(5, prev + 1))}
                        title="Next Slide"
                        aria-label="Next Slide"
                      >
                        <MdArrowForward size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 2-Column Scene Navigator Sidebar */}
                  <div className="bk-slides-sidebar">
                    <div className="bk-sidebar-head">
                      <span>SLIDE SCENES</span>
                      <span className="bk-sidebar-count">0{activeSlideIndex + 1} / 06</span>
                    </div>

                    <div className="bk-sidebar-grid">
                      {[
                        '01 Cover',
                        '02 Colors',
                        '03 Logos',
                        '04 Typography',
                        '05 Imagery',
                        '06 Governance',
                      ].map((title, idx) => (
                        <div
                          key={idx}
                          className={`bk-sidebar-thumb ${activeSlideIndex === idx ? 'active' : ''}`}
                          onClick={() => setActiveSlideIndex(idx)}
                        >
                          <div className="bk-thumb-canvas">
                            <span className="bk-thumb-num">0{idx + 1}</span>
                          </div>
                          <span className="bk-thumb-title">{title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    )
  }

  return (
    <div className="videos-page brandkits-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">Brand Kits</h1>
            <p className="videos-page-subtitle">
              Define colors, fonts, voice, and logos once — then apply them across AI presentations
              and deck packs.
            </p>
          </div>
          <div className="videos-actions">
            <div className="view-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-pressed={viewMode === 'list'}
              >
                <MdViewList size={18} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <MdGridView size={18} />
              </button>
            </div>
            {canWrite && (
              <button type="button" className="btn-primary videos-create-btn" onClick={openCreate}>
                <MdAdd size={18} />
                Create Brand Kit
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="bk-error-banner" role="alert">
            <MdInfoOutline size={18} />
            <span>{error}</span>
          </div>
        )}
        {!canWrite && (
          <div className="bk-info-banner">
            <MdInfoOutline size={16} />
            View only — ask an owner or admin to create or edit brand kits.
          </div>
        )}

        {/* Main Content List / Grid Area */}
        <div className="brandkits-main-grid">
          <div className="brandkits-content-col" style={{ width: '100%' }}>
            {brandKits.length === 0 ? (
              <div className="bk-empty-card">
                <div className="bk-empty-icon-badge">
                  <MdPalette size={38} />
                </div>
                <h2 className="bk-empty-title">No brand kits yet</h2>
                <p className="bk-empty-desc">
                  Create a Brand Kit with colors, fonts, logos, and voice to keep every presentation
                  on-brand.
                </p>
                {canWrite && (
                  <button type="button" className="bk-empty-create-btn" onClick={openCreate}>
                    <MdAdd size={18} />
                    Create Brand Kit
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="section-label">
                  {brandKits.length} brand kit{brandKits.length === 1 ? '' : 's'}
                </p>
                <div className={viewMode === 'grid' ? 'brandkits-grid' : 'brandkits-list'}>
                {brandKits.map((kit, index) => (
                  <KitCard
                    key={kit.id}
                    kit={kit}
                    index={index}
                    viewMode={viewMode}
                    canWrite={canWrite}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    setMenuRef={setMenuRef}
                    onEdit={openEdit}
                    onSetDefault={handleSetDefault}
                    onCopyId={handleCopyId}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandKits
