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
  MdBarChart,
  MdPalette,
  MdInfoOutline,
} from 'react-icons/md'
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

function BrandPreview({ kitName, kitData }) {
  const bg = resolveRoleHex(kitData, 'bg', '#0B1220')
  const text = resolveRoleHex(kitData, 'text', '#F8FAFC')
  const primary = resolveRoleHex(kitData, 'primary', '#3B82F6')
  const secondary = resolveRoleHex(kitData, 'secondary', primary)
  const accent = resolveRoleHex(kitData, 'accent', secondary)
  const muted = resolveRoleHex(kitData, 'muted', '#94A3B8')
  const colors = kitData?.colors || []

  return (
    <aside className="bk-preview-panel">
      <p className="bk-preview-label">Live preview</p>
      <div className="bk-preview-slide" style={{ background: bg, color: text }}>
        <div>
          <div className="bk-preview-slide-bar" style={{ background: primary }} />
          <h4 className="bk-preview-slide-title" style={{ color: text }}>
            {kitName?.trim() || 'Brand Kit'}
          </h4>
          <p className="bk-preview-slide-body" style={{ color: muted }}>
            {kitData?.voice?.tone
              ? `${kitData.voice.tone}${kitData.voice.audience ? ` · ${kitData.voice.audience}` : ''}`
              : 'Colors, type, and voice applied to your decks.'}
          </p>
        </div>
        <div className="bk-preview-slide-chips">
          <span style={{ background: primary }} />
          <span style={{ background: secondary }} />
          <span style={{ background: accent }} />
        </div>
      </div>

      <div className="bk-preview-swatches">
        {colors.slice(0, 6).map((c) => (
          <i key={c.id} style={{ background: c.hex }} title={c.name} />
        ))}
      </div>

      <div className="bk-preview-meta">
        <div className="bk-preview-meta-row">
          <span>Heading</span>
          <strong style={{ fontFamily: kitData?.fonts?.heading?.family || 'inherit' }}>
            {kitData?.fonts?.heading?.family || 'System'}
          </strong>
        </div>
        <div className="bk-preview-meta-row">
          <span>Body</span>
          <strong style={{ fontFamily: kitData?.fonts?.body?.family || 'inherit' }}>
            {kitData?.fonts?.body?.family || 'System'}
          </strong>
        </div>
        <div className="bk-preview-meta-row">
          <span>Colors</span>
          <strong>{colors.length}</strong>
        </div>
      </div>
    </aside>
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
  const [editingKitId, setEditingKitId] = useState(null)
  const [kitName, setKitName] = useState('New Brand Kit')
  const [kitData, setKitData] = useState(emptyBrandKitData())
  const [kitMedia, setKitMedia] = useState([])
  const [isDefault, setIsDefault] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoRole, setLogoRole] = useState('primary')
  const menuRefs = useRef({})
  const fileInputRef = useRef(null)
  const pendingUploadKind = useRef('logo')

  const canWrite = canWriteBrandKits(workspaceRole)

  const setMenuRef = useCallback((id, el) => {
    menuRefs.current[id] = el
  }, [])

  const loadKits = useCallback(async (wsId) => {
    const list = await brandKitService.list(wsId)
    setBrandKits(list)
  }, [])

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
    setKitName('New Brand Kit')
    setKitData(emptyBrandKitData())
    setKitMedia([])
    setIsDefault(brandKits.length === 0)
    setError('')
    setShowEditor(true)
  }

  const openEdit = async (kit) => {
    if (!workspaceId || !kit?.id) return
    setError('')
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

  const handleSave = async () => {
    if (!workspaceId || !canWrite) return
    const validationError = validateBrandKitData(kitData)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingKitId) {
        await brandKitService.update(workspaceId, editingKitId, {
          name: kitName.trim() || 'Untitled Brand Kit',
          data: kitData,
          isDefault,
        })
        if (isDefault) {
          try {
            await brandKitService.setDefault(workspaceId, editingKitId)
          } catch {
            // PATCH may already have set default
          }
        }
      } else {
        const created = await brandKitService.create(workspaceId, {
          name: kitName.trim() || 'Untitled Brand Kit',
          isDefault,
          data: kitData,
        })
        setEditingKitId(created.id)
        if (isDefault && created.id) {
          try {
            await brandKitService.setDefault(workspaceId, created.id)
          } catch {
            // ignore
          }
        }
      }
      await loadKits(workspaceId)
      setShowEditor(false)
      setEditingKitId(null)
    } catch (err) {
      setError(
        err instanceof BrandKitPermissionError
          ? 'Only workspace owners and admins can edit brand kits'
          : err.message || 'Failed to save brand kit'
      )
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

  const triggerUpload = (kind) => {
    if (!canWrite || !editingKitId) {
      setError('Save the brand kit first, then upload media')
      return
    }
    pendingUploadKind.current = kind
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
        role: kind === 'logo' ? logoRole : undefined,
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

  const mediaByKind = (kind) =>
    (kitMedia || []).filter((m) => String(m.kind || m.type || '').toLowerCase() === kind)

  const colorById = useMemo(() => {
    const map = {}
    ;(kitData.colors || []).forEach((c) => {
      map[c.id] = c.hex
    })
    return map
  }, [kitData.colors])

  if (loading) {
    return <BrandKitsSkeleton />
  }

  if (showEditor) {
    return (
      <div className="brandkits-page brandkit-editor">
        <div className="editor-header">
          <div className="editor-header-left">
            <button className="back-btn" type="button" onClick={() => setShowEditor(false)}>
              <MdArrowBack size={18} />
              Back
            </button>
            <div className="editor-title">
              <span className="editor-title-label">
                {editingKitId ? 'Edit brand kit' : 'New brand kit'}
              </span>
              <input
                type="text"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                placeholder="Brand Kit Name"
                disabled={!canWrite}
              />
            </div>
          </div>
          {canWrite && (
            <button className="save-btn" type="button" onClick={handleSave} disabled={saving}>
              <MdSave size={18} />
              {saving ? 'Saving…' : 'Save kit'}
            </button>
          )}
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

        <div className="editor-layout">
          <div className="editor-content">
            <section className="customize-card">
              <SectionHead
                icon={MdColorLens}
                title="Colors"
                hint="2–32 colors. Use #RGB or #RRGGBB. bg, text, and primary roles are required."
              />
              {(kitData.colors || []).map((color, index) => (
                <div className="color-row" key={color.id || index}>
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(color.hex) ? color.hex : '#64748B'}
                    disabled={!canWrite}
                    onChange={(e) => updateColor(index, { hex: e.target.value.toUpperCase() })}
                    aria-label={`${color.name} color`}
                  />
                  <input
                    className="hex-input"
                    value={color.hex}
                    disabled={!canWrite}
                    onChange={(e) => updateColor(index, { hex: e.target.value })}
                    aria-label="Hex"
                  />
                  <input
                    className="name-input"
                    value={color.name}
                    disabled={!canWrite}
                    onChange={(e) => updateColor(index, { name: e.target.value })}
                    placeholder="Name"
                  />
                  {canWrite && (
                    <button
                      type="button"
                      className="ghost-btn danger"
                      onClick={() => removeColor(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {canWrite && (
                <button type="button" className="ghost-btn" onClick={addColor}>
                  <MdAdd size={16} /> Add color
                </button>
              )}

              <h4 className="media-section-label">Color roles</h4>
              <div className="role-grid">
                {['bg', 'text', 'primary', 'secondary', 'accent', 'muted'].map((role) => (
                  <div className="bk-field" key={role}>
                    <label>
                      {colorById[kitData.colorRoles?.[role]] && (
                        <span
                          className="role-field-swatch"
                          style={{ background: colorById[kitData.colorRoles?.[role]] }}
                        />
                      )}
                      {role}
                      {['bg', 'text', 'primary'].includes(role) ? ' *' : ''}
                    </label>
                    <select
                      value={kitData.colorRoles?.[role] || ''}
                      disabled={!canWrite}
                      onChange={(e) =>
                        setKitData((prev) => ({
                          ...prev,
                          colorRoles: {
                            ...prev.colorRoles,
                            [role]: e.target.value || undefined,
                          },
                        }))
                      }
                    >
                      <option value="">—</option>
                      {(kitData.colors || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.hex})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <section className="customize-card">
              <SectionHead
                icon={MdTextFields}
                title="Fonts"
                hint="Optional font pairing id and family. Custom font file upload is not available in v1."
              />
              <div className="bk-field-row">
                {['heading', 'body', 'tertiary'].map((slot) => (
                  <div key={slot}>
                    <div className="bk-field">
                      <label>{slot} family</label>
                      <input
                        value={kitData.fonts?.[slot]?.family || ''}
                        disabled={!canWrite}
                        onChange={(e) =>
                          setKitData((prev) => ({
                            ...prev,
                            fonts: {
                              ...prev.fonts,
                              [slot]: {
                                ...prev.fonts?.[slot],
                                family: e.target.value || null,
                              },
                            },
                          }))
                        }
                        placeholder="e.g. Inter"
                        style={{
                          fontFamily: kitData.fonts?.[slot]?.family || undefined,
                        }}
                      />
                    </div>
                    <div className="bk-field" style={{ marginTop: 8 }}>
                      <label>{slot} pairing id</label>
                      <input
                        value={kitData.fonts?.[slot]?.fontPairingId || ''}
                        disabled={!canWrite}
                        onChange={(e) =>
                          setKitData((prev) => ({
                            ...prev,
                            fonts: {
                              ...prev.fonts,
                              [slot]: {
                                ...prev.fonts?.[slot],
                                fontPairingId: e.target.value || null,
                              },
                            },
                          }))
                        }
                        placeholder="e.g. inter_space"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="customize-card">
              <SectionHead
                icon={MdRecordVoiceOver}
                title="Voice"
                hint="Tone and audience guide AI copy when this kit is applied to presentations."
              />
              <div className="bk-field-row">
                <div className="bk-field">
                  <label>Tone</label>
                  <input
                    value={kitData.voice?.tone || ''}
                    disabled={!canWrite}
                    onChange={(e) =>
                      setKitData((prev) => ({
                        ...prev,
                        voice: { ...prev.voice, tone: e.target.value },
                      }))
                    }
                    placeholder="Professional, confident"
                  />
                </div>
                <div className="bk-field">
                  <label>Audience</label>
                  <input
                    value={kitData.voice?.audience || ''}
                    disabled={!canWrite}
                    onChange={(e) =>
                      setKitData((prev) => ({
                        ...prev,
                        voice: { ...prev.voice, audience: e.target.value },
                      }))
                    }
                    placeholder="Enterprise buyers"
                  />
                </div>
              </div>
              <div className="bk-field-row">
                <div className="bk-field">
                  <label>Dos (one per line)</label>
                  <textarea
                    value={listToLines(kitData.voice?.dos)}
                    disabled={!canWrite}
                    onChange={(e) =>
                      setKitData((prev) => ({
                        ...prev,
                        voice: { ...prev.voice, dos: linesToList(e.target.value) },
                      }))
                    }
                    placeholder="Use short sentences"
                  />
                </div>
                <div className="bk-field">
                  <label>Don&apos;ts (one per line)</label>
                  <textarea
                    value={listToLines(kitData.voice?.donts)}
                    disabled={!canWrite}
                    onChange={(e) =>
                      setKitData((prev) => ({
                        ...prev,
                        voice: { ...prev.voice, donts: linesToList(e.target.value) },
                      }))
                    }
                    placeholder="No slang"
                  />
                </div>
                <div className="bk-field">
                  <label>Vocabulary (one per line)</label>
                  <textarea
                    value={listToLines(kitData.voice?.vocabulary)}
                    disabled={!canWrite}
                    onChange={(e) =>
                      setKitData((prev) => ({
                        ...prev,
                        voice: { ...prev.voice, vocabulary: linesToList(e.target.value) },
                      }))
                    }
                    placeholder="Athena VI"
                  />
                </div>
              </div>
            </section>

            <section className="customize-card">
              <SectionHead
                icon={MdBarChart}
                title="Charts & image style"
                hint="Chart colors pick from your palette. Image style briefs AI visuals."
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
                  placeholder="clean product photography, brand-safe"
                />
              </div>
              <label className="bk-default-toggle">
                <input
                  type="checkbox"
                  checked={isDefault}
                  disabled={!canWrite}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Set as workspace default brand kit
              </label>
            </section>

            <section className="customize-card">
              <SectionHead
                icon={MdImage}
                title="Media"
                hint={
                  uploading
                    ? 'Uploading…'
                    : 'Save the kit first to upload. Logos, photos, and graphics — jpeg/png/webp/svg, max 50MB.'
                }
              />

              <div className="chip-row">
                {LOGO_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`role-chip ${logoRole === role ? 'active' : ''}`}
                    onClick={() => setLogoRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="upload-grid">
                <button
                  type="button"
                  className="upload-box"
                  disabled={!canWrite}
                  onClick={() => triggerUpload('logo')}
                >
                  <MdAdd size={28} color="#94a3b8" />
                  <span className="upload-label">Upload logo ({logoRole})</span>
                </button>
                <button
                  type="button"
                  className="upload-box"
                  disabled={!canWrite}
                  onClick={() => triggerUpload('photo')}
                >
                  <MdAdd size={28} color="#94a3b8" />
                  <span className="upload-label">Upload photo</span>
                </button>
                <button
                  type="button"
                  className="upload-box"
                  disabled={!canWrite}
                  onClick={() => triggerUpload('graphic')}
                >
                  <MdAdd size={28} color="#94a3b8" />
                  <span className="upload-label">Upload graphic</span>
                </button>
              </div>

              {['logo', 'photo', 'graphic'].map((kind) => {
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
                          <div
                            className="upload-box"
                            key={id}
                            style={{ cursor: 'default' }}
                          >
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
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          </div>

          <BrandPreview kitName={kitName} kitData={kitData} />
        </div>
      </div>
    )
  }

  return (
    <div className="brandkits-page">
      <div className="brandkits-header">
        <div className="brandkits-header-copy">
          <p className="brandkits-eyebrow">
            <MdPalette size={14} /> Workspace branding
          </p>
          <h1 className="brandkits-title">Brand Kits</h1>
          <p className="brandkits-subtitle">
            Define colors, fonts, voice, and logos once — then apply them across AI presentations
            and deck packs.
          </p>
        </div>
        <div className="brandkits-header-actions">
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
            <button type="button" className="create-btn" onClick={openCreate}>
              <MdAdd size={18} />
              Create Brand Kit
            </button>
          )}
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
          View only — ask an owner or admin to create or edit brand kits.
        </div>
      )}

      {brandKits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <MdPalette size={40} />
          </div>
          <h2 className="empty-title">No brand kits yet</h2>
          <p className="empty-description">
            Create a Brand Kit with colors, fonts, logos, and voice to keep every presentation
            on-brand.
          </p>
          {canWrite && (
            <button type="button" className="empty-create-btn" onClick={openCreate}>
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
  )
}

export default BrandKits
