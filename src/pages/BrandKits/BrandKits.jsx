import { useState, useRef, useEffect, useCallback } from 'react'
import brandKitService, { BrandKitPermissionError } from '../../services/brandKitService'
import { resolvePresentationWorkspaceContext } from '../../utils/presentationContext'
import {
  canWriteBrandKits,
  emptyBrandKitData,
  newColorId,
  validateBrandKitData,
} from '../../utils/brandKitHelpers'
import {
  extract4ColorsFromImage,
  ensureGoogleFontLoaded,
  formatFontWeightLabel,
  getFontRole,
  resolveRoleHex,
} from '../../components/features/brand-kits/utils/brandKitUtils'
import { FONT_PAIRINGS, FONT_ROLE_DEFAULTS } from '../../components/features/brand-kits/utils/brandKitConstants'
import { downloadBrandGuidelinePdf as generateGuidelinePdf } from '../../components/features/brand-kits/utils/downloadBrandGuidelinePdf'
import BrandKitsListView from '../../components/features/brand-kits/BrandKitsListView'
import BrandKitWizard from '../../components/features/brand-kits/BrandKitWizard'
import BrandKitEditor from '../../components/features/brand-kits/BrandKitEditor'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import '../Videos/Videos.css'
import './BrandKits.css'

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
    await generateGuidelinePdf({
      kitName,
      kitData,
      setGeneratingGuideline,
      setError,
    })
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
    setLogoFile(null)
    setLogoPreviewUrl(null)
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

  const updateFontRole = (role, patch) => {
    setKitData((prev) => {
      const nextRole = { ...prev.fonts?.[role], ...patch }
      const fonts = {
        ...prev.fonts,
        [role]: nextRole,
      }
      if (role === 'subheading') {
        fonts.tertiary = { ...prev.fonts?.tertiary, ...patch }
      }
      return { ...prev, fonts }
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
        heading: {
          ...FONT_ROLE_DEFAULTS.heading,
          ...prev.fonts?.heading,
          family: pair.heading,
          fontPairingId: pair.id,
        },
        subheading: {
          ...FONT_ROLE_DEFAULTS.subheading,
          ...prev.fonts?.subheading,
          family: pair.subheading,
          fontPairingId: pair.id,
        },
        body: {
          ...FONT_ROLE_DEFAULTS.body,
          ...prev.fonts?.body,
          family: pair.body,
          fontPairingId: pair.id,
        },
        tertiary: {
          ...FONT_ROLE_DEFAULTS.subheading,
          ...prev.fonts?.tertiary,
          family: pair.subheading,
          fontPairingId: pair.id,
        },
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
    const headingFont = getFontRole(kitData.fonts, 'heading')
    const subheadingFont = getFontRole(kitData.fonts, 'subheading')
    const bodyFont = getFontRole(kitData.fonts, 'body')
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
   - Heading:
     * Family: ${headingFont.family}
     * Weight: ${formatFontWeightLabel(headingFont.weight)}
     * Size: ${headingFont.size}
     * Line Height: ${headingFont.lineHeight}
   - Sub Heading:
     * Family: ${subheadingFont.family}
     * Weight: ${formatFontWeightLabel(subheadingFont.weight)}
     * Size: ${subheadingFont.size}
     * Line Height: ${subheadingFont.lineHeight}
   - Body:
     * Family: ${bodyFont.family}
     * Weight: ${formatFontWeightLabel(bodyFont.weight)}
     * Size: ${bodyFont.size}
     * Line Height: ${bodyFont.lineHeight}

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

  const closeEditor = () => setShowEditor(false)

  if (!loading && showEditor && isWizardMode) {
    return (
      <BrandKitWizard
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        closeEditor={closeEditor}
        error={error}
        wizardLogoInputRef={wizardLogoInputRef}
        handleWizardLogoSelected={handleWizardLogoSelected}
        kitName={kitName}
        setKitName={setKitName}
        slogan={slogan}
        setSlogan={setSlogan}
        logoPreviewUrl={logoPreviewUrl}
        setLogoFile={setLogoFile}
        setLogoPreviewUrl={setLogoPreviewUrl}
        kitData={kitData}
        setKitData={setKitData}
        canWrite={canWrite}
        triggerGenerateFromLogo={triggerGenerateFromLogo}
        generating={generating}
        copiedHex={copiedHex}
        handleCopyHex={handleCopyHex}
        updateColor={updateColor}
        addColor={addColor}
        removeColor={removeColor}
        triggerAutoGenerateTypography={triggerAutoGenerateTypography}
        logoFile={logoFile}
        handleSave={handleSave}
        saving={saving}
      />
    )
  }

  if (!loading && showEditor && !isWizardMode) {
    return (
      <BrandKitEditor
        canWrite={canWrite}
        closeEditor={closeEditor}
        downloadBrandGuideline={downloadBrandGuideline}
        handleSave={handleSave}
        saving={saving}
        kitName={kitName}
        setKitName={setKitName}
        editorTab={editorTab}
        setEditorTab={setEditorTab}
        error={error}
        fileInputRef={fileInputRef}
        handleFileSelected={handleFileSelected}
        kitData={kitData}
        setKitData={setKitData}
        kitMedia={kitMedia}
        mediaByKind={mediaByKind}
        logoPreviewUrl={logoPreviewUrl}
        copiedHex={copiedHex}
        handleCopyHex={handleCopyHex}
        updateColor={updateColor}
        addColor={addColor}
        removeColor={removeColor}
        triggerUpload={triggerUpload}
        handleDeleteMedia={handleDeleteMedia}
        uploading={uploading}
        generatingRole={generatingRole}
        setGeneratingRole={setGeneratingRole}
        generating={generating}
        setGenerating={setGenerating}
        workspaceId={workspaceId}
        editingKitId={editingKitId}
        triggerAutoGenerateTypography={triggerAutoGenerateTypography}
        updateFontRole={updateFontRole}
        downloadBrandGuidelinePdf={downloadBrandGuidelinePdf}
        generatingGuideline={generatingGuideline}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
        slideViewMode={slideViewMode}
        setSlideViewMode={setSlideViewMode}
        generateLogoVariants={generateLogoVariants}
      />
    )
  }

  return (
    <BrandKitsListView
      viewMode={viewMode}
      setViewMode={setViewMode}
      canWrite={canWrite}
      openCreate={openCreate}
      error={error}
      brandKits={brandKits}
      loading={loading}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      setMenuRef={setMenuRef}
      openEdit={openEdit}
      handleSetDefault={handleSetDefault}
      handleCopyId={handleCopyId}
      handleDelete={handleDelete}
    />
  )
}

export default BrandKits
