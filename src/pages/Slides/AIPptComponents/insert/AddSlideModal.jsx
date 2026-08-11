import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiSearch, FiX, FiPlus } from 'react-icons/fi'
import LayoutPolishedPreview from '../../../../components/ppt/LayoutPolishedPreview'
import presentationService from '../../../../services/presentationService'
import { normalizeDeckPacks } from '../../../../utils/presentationHelpers'
import { resolveLayoutPreviewSchema } from '../../../../utils/layoutPreviewSchemas'
import themePetrol from '../../../../assets/Template_Image/theme_petrol.png'
import themeStardust from '../../../../assets/Template_Image/theme_stardust.png'
import themeChocolate from '../../../../assets/Template_Image/theme_chocolate.png'
import themeMoss from '../../../../assets/Template_Image/theme_moss.png'
import themeBlueSteel from '../../../../assets/Template_Image/theme_blue_steel.png'
import genTemp1 from '../../../../assets/Template_Image/gen_temp1.png'
import genTemp2 from '../../../../assets/Template_Image/gen_temp2.png'
import genTemp3 from '../../../../assets/Template_Image/gen_temp3.png'
import './AddSlideModal.css'

const SHOWCASE_TEMPLATES = [
  {
    id: 'showcase-industrial',
    name: 'Industrial Design Portfolio',
    type: 'Portfolio',
    img: genTemp1,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'title',
  },
  {
    id: 'showcase-lattice',
    name: 'Lattice',
    type: 'Modern',
    img: themeStardust,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'two-column',
  },
  {
    id: 'showcase-ai-native',
    name: 'AI-Native Pitch Deck',
    type: 'Pitch',
    img: genTemp2,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'title-bullets',
  },
  {
    id: 'showcase-editorial',
    name: 'Editorial',
    type: 'Creative',
    img: genTemp3,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'image-right',
  },
  {
    id: 'showcase-petrol',
    name: 'Petrol Corporate',
    type: 'Professional',
    img: themePetrol,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'title-bullets',
  },
  {
    id: 'showcase-moss',
    name: 'Moss & Mist',
    type: 'Nature',
    img: themeMoss,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'section',
  },
  {
    id: 'showcase-chocolate',
    name: 'Chocolate Warmth',
    type: 'Elegant',
    img: themeChocolate,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'quote',
  },
  {
    id: 'showcase-steel',
    name: 'Blue Steel Tech',
    type: 'Modern',
    img: themeBlueSteel,
    templateId: null,
    kind: 'showcase',
    seedLayoutId: 'stats',
  },
]

const BUILTIN_LAYOUTS = [
  {
    id: 'blank',
    name: 'Blank',
    category: 'Basic',
    preview: 'blank',
    seed: { title: 'Blank Slide', description: '', elements: [] },
  },
  {
    id: 'title',
    name: 'Title',
    category: 'Basic',
    preview: 'title',
    seed: {
      title: 'Slide title',
      description: 'Subtitle or supporting line',
      elements: [
        {
          id: 'layout-title',
          type: 'text',
          content: { text: 'Slide title', fontSize: 64, bold: true, align: 'center' },
          placement: { x: 160, y: 360, width: 1600, height: 140 },
        },
        {
          id: 'layout-sub',
          type: 'text',
          content: { text: 'Subtitle or supporting line', fontSize: 28, align: 'center' },
          placement: { x: 320, y: 520, width: 1280, height: 80 },
        },
      ],
    },
  },
  {
    id: 'title-bullets',
    name: 'Title + bullets',
    category: 'Basic',
    preview: 'bullets',
    seed: {
      title: 'Section title',
      description: ['Point one', 'Point two', 'Point three'],
      elements: [
        {
          id: 'layout-h',
          type: 'text',
          content: { text: 'Section title', fontSize: 48, bold: true },
          placement: { x: 120, y: 100, width: 1200, height: 100 },
        },
        {
          id: 'layout-b',
          type: 'text',
          content: {
            text: '• Point one\n• Point two\n• Point three',
            fontSize: 28,
          },
          placement: { x: 140, y: 260, width: 1400, height: 520 },
        },
      ],
    },
  },
  {
    id: 'two-column',
    name: 'Two columns',
    category: 'Basic',
    preview: 'two-col',
    seed: {
      title: 'Comparison',
      description: '',
      elements: [
        {
          id: 'layout-l',
          type: 'text',
          content: { text: 'Left column\n\nAdd details here.', fontSize: 28 },
          placement: { x: 120, y: 160, width: 780, height: 700 },
        },
        {
          id: 'layout-r',
          type: 'text',
          content: { text: 'Right column\n\nAdd details here.', fontSize: 28 },
          placement: { x: 1020, y: 160, width: 780, height: 700 },
        },
      ],
    },
  },
  {
    id: 'image-right',
    name: 'Text + image',
    category: 'Media',
    preview: 'image-right',
    seed: {
      title: 'Feature highlight',
      description: 'Describe the feature',
      elements: [
        {
          id: 'layout-copy',
          type: 'text',
          content: {
            text: 'Feature highlight\n\nDescribe the feature or story.',
            fontSize: 32,
            bold: true,
          },
          placement: { x: 100, y: 200, width: 820, height: 500 },
        },
        {
          id: 'layout-img',
          type: 'shape',
          content: { shape: 'rounded-rect', fill: '#E2E8F0' },
          placement: { x: 1000, y: 160, width: 780, height: 720 },
        },
      ],
    },
  },
  {
    id: 'quote',
    name: 'Quote',
    category: 'Basic',
    preview: 'quote',
    seed: {
      title: 'Quote',
      description: '',
      elements: [
        {
          id: 'layout-q',
          type: 'text',
          content: {
            text: '“A short quote that makes your point.”',
            fontSize: 44,
            italic: true,
            align: 'center',
          },
          placement: { x: 240, y: 360, width: 1440, height: 200 },
        },
      ],
    },
  },
  {
    id: 'stats',
    name: 'Big stat',
    category: 'Stats',
    preview: 'stats',
    seed: {
      title: '42%',
      description: 'Key metric',
      elements: [
        {
          id: 'layout-stat',
          type: 'text',
          content: { text: '42%', fontSize: 120, bold: true, align: 'center' },
          placement: { x: 360, y: 280, width: 1200, height: 220 },
        },
        {
          id: 'layout-stat-l',
          type: 'text',
          content: { text: 'Key metric label', fontSize: 28, align: 'center' },
          placement: { x: 360, y: 520, width: 1200, height: 80 },
        },
      ],
    },
  },
  {
    id: 'section',
    name: 'Section divider',
    category: 'Basic',
    preview: 'section',
    seed: {
      title: 'New section',
      description: '',
      elements: [
        {
          id: 'layout-sec',
          type: 'text',
          content: { text: 'New section', fontSize: 72, bold: true, align: 'center' },
          placement: { x: 200, y: 420, width: 1520, height: 160 },
        },
      ],
    },
  },
]

function layoutSeedById(id) {
  return BUILTIN_LAYOUTS.find((l) => l.id === id)?.seed || BUILTIN_LAYOUTS[0].seed
}

/**
 * Centered Gamma-style Templates / Layouts picker for Add slide.
 */
export default function AddSlideModal({
  open,
  onClose,
  workspaceId,
  disabled = false,
  onPick,
}) {
  const [tab, setTab] = useState('templates')
  const [query, setQuery] = useState('')
  const [remoteTemplates, setRemoteTemplates] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setTab('templates')
      return undefined
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !workspaceId) return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [templatesPayload, packsPayload] = await Promise.all([
          presentationService.listTemplates(workspaceId).catch(() => null),
          presentationService.listDeckPacks(workspaceId).catch(() => null),
        ])
        if (cancelled) return
        const list =
          templatesPayload?.templates ||
          templatesPayload?.items ||
          (Array.isArray(templatesPayload) ? templatesPayload : [])
        const packs = normalizeDeckPacks(packsPayload)
        const mapped = [
          ...list.map((t) => ({
            id: t.id || t.templateId,
            name: t.name || t.label || 'Template',
            type: t.contentType || t.variant || 'Template',
            img: t.previewUrl || t.thumbnailUrl || null,
            schema: t.schema || null,
            templateId: t.id || t.templateId,
            kind: 'template',
          })),
          ...packs.map((p) => ({
            id: `pack-${p.id}`,
            name: p.name,
            type: 'Deck pack',
            img: p.preview?.imageUrl || p.preview?.thumbnailUrl || null,
            templateId: p.id,
            kind: 'pack-slide',
          })),
        ]
        setRemoteTemplates(mapped)
      } catch {
        if (!cancelled) setRemoteTemplates([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, workspaceId])

  const galleryTemplates = useMemo(() => {
    // Prefer remote cards with images; always keep local showcase so the grid looks full
    const remoteWithArt = remoteTemplates.filter((t) => t.img)
    const remoteWithout = remoteTemplates.filter((t) => !t.img)
    const combined = [...remoteWithArt, ...SHOWCASE_TEMPLATES, ...remoteWithout]
    const seen = new Set()
    return combined.filter((t) => {
      const key = String(t.name || t.id).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [remoteTemplates])

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return galleryTemplates
    return galleryTemplates.filter(
      (t) => t.name.toLowerCase().includes(q) || String(t.type || '').toLowerCase().includes(q)
    )
  }, [galleryTemplates, query])

  const filteredLayouts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BUILTIN_LAYOUTS
    return BUILTIN_LAYOUTS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || String(l.category || '').toLowerCase().includes(q)
    )
  }, [query])

  if (!open) return null

  const pickTemplate = (t) => {
    if (t.kind === 'showcase' || !t.templateId) {
      onPick?.({
        source: 'layout',
        layoutId: t.seedLayoutId || 'title-bullets',
        seed: layoutSeedById(t.seedLayoutId || 'title-bullets'),
        name: t.name,
      })
      return
    }
    onPick?.({
      source: 'template',
      templateId: t.templateId || t.id,
      name: t.name,
    })
  }

  const modal = (
    <div className="ppt-add-slide-overlay" role="presentation" onClick={onClose}>
      <div
        className="ppt-add-slide-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Templates and Layouts"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ppt-add-slide-modal-head">
          <div className="ppt-add-slide-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'templates'}
              className={`ppt-add-slide-tab ${tab === 'templates' ? 'is-active' : ''}`}
              onClick={() => setTab('templates')}
            >
              Templates
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'layouts'}
              className={`ppt-add-slide-tab ${tab === 'layouts' ? 'is-active' : ''}`}
              onClick={() => setTab('layouts')}
            >
              Layouts
            </button>
          </div>
          <button type="button" className="ppt-add-slide-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="ppt-add-slide-search">
          <FiSearch size={16} aria-hidden />
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="ppt-add-slide-body">
          {tab === 'templates' && (
            <>
              <p className="ppt-add-slide-section-label">Pitch gallery templates</p>
              {loading && <div className="ppt-add-slide-loading">Loading templates…</div>}
              <div className="ppt-add-slide-grid">
                <button
                  type="button"
                  className="ppt-add-slide-card"
                  disabled={disabled}
                  onClick={() =>
                    onPick?.({
                      source: 'layout',
                      layoutId: 'blank',
                      seed: BUILTIN_LAYOUTS[0].seed,
                      name: 'Blank slide',
                    })
                  }
                >
                  <div className="ppt-add-slide-card-thumb ppt-add-slide-card-thumb--blank">
                    <FiPlus size={28} />
                  </div>
                  <div className="ppt-add-slide-card-name">Blank slide</div>
                </button>

                {filteredTemplates.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    className="ppt-add-slide-card"
                    disabled={disabled}
                    onClick={() => pickTemplate(t)}
                  >
                    <div
                      className={`ppt-add-slide-card-thumb ${!t.img && !t.schema?.slots?.length ? `ppt-add-slide-card-thumb--showcase-${idx % 6}` : ''}`}
                      style={t.img ? { backgroundImage: `url(${t.img})` } : undefined}
                    >
                      {!t.img && t.schema?.slots?.length > 0 ? (
                        <LayoutPolishedPreview schema={t.schema} fill />
                      ) : !t.img ? (
                        <span className="ppt-add-slide-card-fallback">{t.name}</span>
                      ) : null}
                    </div>
                    <div className="ppt-add-slide-card-name">{t.name}</div>
                    {t.type ? <div className="ppt-add-slide-card-meta">{t.type}</div> : null}
                  </button>
                ))}

                {!loading && !filteredTemplates.length && (
                  <div className="ppt-add-slide-empty">No templates match your search</div>
                )}
              </div>
            </>
          )}

          {tab === 'layouts' && (
            <>
              <p className="ppt-add-slide-section-label">Slide layouts</p>
              <div className="ppt-add-slide-grid ppt-add-slide-grid--layouts">
                {filteredLayouts.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    className="ppt-add-slide-card"
                    disabled={disabled}
                    onClick={() =>
                      onPick?.({
                        source: 'layout',
                        layoutId: layout.id,
                        seed: layout.seed,
                        name: layout.name,
                      })
                    }
                  >
                    <div className="ppt-add-slide-card-thumb ppt-add-slide-card-thumb--layout">
                      <LayoutPolishedPreview
                        schema={resolveLayoutPreviewSchema({ previewKind: layout.preview })}
                        fill
                      />
                    </div>
                    <div className="ppt-add-slide-card-name">{layout.name}</div>
                    <div className="ppt-add-slide-card-meta">{layout.category}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
