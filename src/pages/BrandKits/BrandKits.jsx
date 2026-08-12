import { useState, useRef, useEffect, useCallback } from 'react'
import brandKitService, { BrandKitPermissionError } from '../../services/brandKitService'
import { InsufficientCreditsError } from '../../services/creditsService'
import presentationService from '../../services/presentationService'
import { resolvePresentationWorkspaceContext } from '../../utils/presentationContext'
import {
  canWriteBrandKits,
  emptyBrandKitData,
  newColorId,
  normalizeBrandKitData,
  reconcileColorRoles,
  validateBrandKitData,
} from '../../utils/brandKitHelpers'
import {
  ensureGoogleFontLoaded,
  formatFontWeightLabel,
  getFontRole,
  resolveRoleHex,
} from '../../components/features/brand-kits/utils/brandKitUtils'
import { FONT_ROLE_DEFAULTS } from '../../components/features/brand-kits/utils/brandKitConstants'
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
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('brandKitsViewMode')
      return saved === 'list' || saved === 'grid' ? saved : 'grid'
    } catch {
      return 'grid'
    }
  })
  const [showEditor, setShowEditor] = useState(false)
  const [isWizardMode, setIsWizardMode] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [slogan, setSlogan] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null)
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
  const [copiedHex, setCopiedHex] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generatingRole, setGeneratingRole] = useState(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [slideViewMode, setSlideViewMode] = useState('deck')
  const [generatingGuideline, setGeneratingGuideline] = useState(false)
  const [kitHealth, setKitHealth] = useState(null)
  const [guidelineLink, setGuidelineLink] = useState(null)
  const [folderId, setFolderId] = useState(null)
  const menuRefs = useRef({})
  const fileInputRef = useRef(null)
  const wizardLogoInputRef = useRef(null)
  const pendingUploadKind = useRef('logo')
  const pendingUploadRole = useRef('primary')

  const canWrite = canWriteBrandKits(workspaceRole)

  const handleApiError = useCallback((err, fallback) => {
    if (err instanceof BrandKitPermissionError) {
      setError('Only workspace owners and admins can edit brand kits')
      return
    }
    if (err instanceof InsufficientCreditsError) {
      setError(err.message || 'Insufficient credits for this brand kit action')
      return
    }
    setError(err?.message || fallback || 'Brand kit request failed')
  }, [])

  const refreshHealth = useCallback(
    async (wsId, kitId) => {
      if (!wsId || !kitId) {
        setKitHealth(null)
        return
      }
      try {
        const health = await brandKitService.getHealth(wsId, kitId)
        setKitHealth(health)
      } catch {
        setKitHealth(null)
      }
    },
    []
  )

  const refreshGuidelines = useCallback(async (wsId, kitId) => {
    if (!wsId || !kitId) {
      setGuidelineLink(null)
      return
    }
    try {
      const link = await brandKitService.getGuidelines(wsId, kitId)
      setGuidelineLink(link)
    } catch {
      setGuidelineLink(null)
    }
  }, [])

  const downloadBrandGuidelinePdf = useCallback(async () => {
    const presentationId =
      guidelineLink?.presentationId ||
      kitHealth?.guidelineProjectId ||
      kitData?.meta?.guidelineProjectId ||
      null

    if (workspaceId && presentationId) {
      setGeneratingGuideline(true)
      setError('')
      try {
        const started = await presentationService.startExport(workspaceId, presentationId, {
          format: 'PDF',
        })
        const exportId =
          started?.exportId || started?.id || started?.export?.id || started?._id
        if (!exportId) throw new Error('Export started but no export id was returned')
        const ready = await presentationService.pollExportUntilReady(
          workspaceId,
          presentationId,
          exportId
        )
        const url = ready?.presignedUrl || ready?.url || ready?.downloadUrl
        if (!url) throw new Error('Export finished but no download link was returned')
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      } catch (err) {
        handleApiError(err, 'Failed to export brand guideline deck')
        // Fall through to local PDF snapshot
      } finally {
        setGeneratingGuideline(false)
      }
    }

    await generateGuidelinePdf({
      kitName,
      kitData,
      setGeneratingGuideline,
      setError,
    })
  }, [
    guidelineLink,
    kitHealth,
    kitData,
    kitName,
    workspaceId,
    handleApiError,
  ])

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
        setFolderId(ctx.folderId || null)
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
    setKitHealth(null)
    setGuidelineLink(null)
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
      const data = detail.data || emptyBrandKitData()
      setKitName(detail.name)
      setKitData(data)
      setSlogan(data.meta?.tagline || '')
      setKitMedia(detail.media || [])
      setIsDefault(Boolean(detail.isDefault))
      await Promise.all([
        refreshHealth(workspaceId, kit.id),
        refreshGuidelines(workspaceId, kit.id),
      ])
    } catch (err) {
      handleApiError(err, 'Failed to load brand kit')
    }
  }

  const handleSave = async (redirect = true) => {
    if (!workspaceId || !canWrite) return null
    const finalName = kitName.trim() || 'My Brand Kit'
    const dataWithMeta = normalizeBrandKitData({
      ...kitData,
      meta: {
        ...(kitData.meta || {}),
        tagline: slogan || kitData.meta?.tagline || '',
      },
    })
    const validationError = validateBrandKitData(dataWithMeta)
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
          data: dataWithMeta,
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
          data: dataWithMeta,
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
            role: 'primary',
            name: logoFile.name || 'Primary Logo',
          })
          const detail = await brandKitService.get(workspaceId, targetKitId)
          setKitMedia(detail.media || [])
          setKitData(detail.data || dataWithMeta)
        } catch (uploadErr) {
          handleApiError(uploadErr, 'Logo upload failed after save')
        }
      } else {
        setKitData(dataWithMeta)
      }

      await loadKits(workspaceId)
      if (targetKitId) {
        await refreshHealth(workspaceId, targetKitId)
      }
      if (redirect) {
        setIsWizardMode(false)
        setEditorTab('overview')
      }
      return targetKitId
    } catch (err) {
      handleApiError(err, 'Failed to save brand kit')
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
      const nextPatch = { ...patch }
      if (nextPatch.size != null && nextPatch.sizePx == null) {
        const n = Number.parseFloat(String(nextPatch.size).replace(/px$/i, ''))
        if (Number.isFinite(n)) nextPatch.sizePx = n
      }
      if (nextPatch.sizePx != null && nextPatch.size == null) {
        nextPatch.size = `${nextPatch.sizePx}px`
      }
      if (nextPatch.weight != null) {
        const w = Number(nextPatch.weight)
        if (Number.isFinite(w)) nextPatch.weight = w
      }
      const nextRole = { ...prev.fonts?.[role], ...nextPatch }
      const fonts = {
        ...prev.fonts,
        [role]: nextRole,
      }
      if (role === 'subheading') {
        fonts.tertiary = { ...prev.fonts?.tertiary, ...nextPatch }
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
      return {
        ...prev,
        colors,
        colorRoles: reconcileColorRoles(colors, prev.colorRoles),
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

  const triggerGenerateFromLogo = async () => {
    if (!workspaceId) {
      setError('Workspace is required to suggest colors.')
      return
    }
    if (!logoFile && !logoPreviewUrl && !editingKitId) {
      setError('Please upload a brand logo first to generate colors.')
      return
    }

    setGenerating(true)
    setError('')
    try {
      const primaryLogo = (kitMedia || []).find(
        (m) =>
          String(m.kind || '').toLowerCase() === 'logo' &&
          ['primary', 'main', ''].includes(String(m.role || ''))
      )
      const suggestion = await brandKitService.suggestColors(workspaceId, {
        file: logoFile || undefined,
        tone: kitData.voice?.tone || undefined,
        tagline: slogan || kitData.meta?.tagline || undefined,
        brandKitId: editingKitId || undefined,
        mediaId: !logoFile && primaryLogo ? primaryLogo.id || primaryLogo._id : undefined,
      })

      const colors = Array.isArray(suggestion?.colors) ? suggestion.colors : []
      if (!colors.length) {
        throw new Error('No color suggestion returned')
      }

      setKitData((prev) =>
        normalizeBrandKitData({
          ...prev,
          colors,
          colorRoles: {
            ...prev.colorRoles,
            ...(suggestion.colorRoles || {}),
          },
        })
      )
    } catch (err) {
      handleApiError(err, 'Failed to suggest colors')
    } finally {
      setGenerating(false)
    }
  }

  const triggerAutoGenerateTypography = async () => {
    if (!workspaceId) {
      setError('Workspace is required to suggest fonts.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const primaryHex = resolveRoleHex(kitData, 'primary') || kitData.colors?.[0]?.hex
      const suggestion = await brandKitService.suggestFonts(workspaceId, {
        tone: kitData.voice?.tone || undefined,
        primaryHex: primaryHex || undefined,
        brandKitId: editingKitId || undefined,
      })
      const fonts = suggestion?.fonts
      if (!fonts?.heading && !fonts?.body) {
        throw new Error('No font suggestion returned')
      }
      setKitData((prev) =>
        normalizeBrandKitData({
          ...prev,
          fonts: {
            heading: { ...FONT_ROLE_DEFAULTS.heading, ...prev.fonts?.heading, ...fonts.heading },
            subheading: {
              ...FONT_ROLE_DEFAULTS.subheading,
              ...prev.fonts?.subheading,
              ...fonts.subheading,
            },
            body: { ...FONT_ROLE_DEFAULTS.body, ...prev.fonts?.body, ...fonts.body },
          },
        })
      )
    } catch (err) {
      handleApiError(err, 'Failed to suggest fonts')
    } finally {
      setGenerating(false)
    }
  }

  const triggerSuggestVoice = async () => {
    if (!workspaceId) return
    const name = kitName.trim() || 'Brand Kit'
    setGenerating(true)
    setError('')
    try {
      const suggestion = await brandKitService.suggestVoice(workspaceId, {
        name,
        tagline: slogan || kitData.meta?.tagline || undefined,
        tone: kitData.voice?.tone || undefined,
        brandKitId: editingKitId || undefined,
      })
      if (!suggestion?.voice) throw new Error('No voice suggestion returned')
      setKitData((prev) =>
        normalizeBrandKitData({
          ...prev,
          voice: { ...prev.voice, ...suggestion.voice },
        })
      )
    } catch (err) {
      handleApiError(err, 'Failed to suggest voice')
    } finally {
      setGenerating(false)
    }
  }

  const triggerSuggestImageStyle = async () => {
    if (!workspaceId) return
    setGenerating(true)
    setError('')
    try {
      const suggestion = await brandKitService.suggestImageStyle(workspaceId, {
        tone: kitData.voice?.tone || undefined,
        colors: kitData.colors,
        colorRoles: kitData.colorRoles,
        brandKitId: editingKitId || undefined,
      })
      setKitData((prev) =>
        normalizeBrandKitData({
          ...prev,
          imageStyle: suggestion?.imageStyle || prev.imageStyle,
          chartStyles: suggestion?.chartStyles || prev.chartStyles,
        })
      )
    } catch (err) {
      handleApiError(err, 'Failed to suggest image style')
    } finally {
      setGenerating(false)
    }
  }

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
      await refreshHealth(workspaceId, editingKitId)
    } catch (err) {
      handleApiError(err, 'Media upload failed')
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
      await refreshHealth(workspaceId, editingKitId)
    } catch (err) {
      handleApiError(err, 'Failed to remove media')
    }
  }

  const generateLogoVariants = async () => {
    if (!canWrite || !editingKitId) {
      setError('Save the brand kit first before generating variants.')
      return
    }
    const hasPrimary = (kitMedia || []).some(
      (m) =>
        String(m.kind || '').toLowerCase() === 'logo' &&
        ['primary', 'main'].includes(String(m.role || ''))
    )
    if (!hasPrimary && !logoPreviewUrl) {
      setError('Upload a Primary Logo first to generate variants.')
      return
    }

    setGenerating(true)
    setError('')
    try {
      // Free preview pass (optional UX feedback)
      setGeneratingRole('preview')
      await brandKitService.suggestLogoVariants(workspaceId, editingKitId, {})

      // Paid apply for core roles from handoff
      setGeneratingRole('apply')
      const applyRoles = ['light', 'dark', 'black', 'white', 'light-mode', 'dark-mode']
      await brandKitService.suggestLogoVariants(workspaceId, editingKitId, { applyRoles })

      const detail = await brandKitService.get(workspaceId, editingKitId)
      setKitMedia(detail.media || [])
      await refreshHealth(workspaceId, editingKitId)
    } catch (err) {
      handleApiError(err, 'Logo variant generation failed')
    } finally {
      setGenerating(false)
      setGeneratingRole(null)
    }
  }

  const generateBrandGuidelines = async () => {
    if (!canWrite || !editingKitId) {
      setError('Save the brand kit first before generating guidelines.')
      return
    }
    let targetFolderId = folderId
    if (!targetFolderId) {
      try {
        const ctx = await resolvePresentationWorkspaceContext({
          preferredWorkspaceId: workspaceId,
        })
        targetFolderId = ctx.folderId
        setFolderId(ctx.folderId)
      } catch (err) {
        handleApiError(err, 'Could not resolve a folder for guidelines')
        return
      }
    }

    setGeneratingGuideline(true)
    setError('')
    try {
      const guideline = await brandKitService.generateGuidelines(workspaceId, editingKitId, {
        folderId: targetFolderId,
      })
      setGuidelineLink(guideline)
      const detail = await brandKitService.get(workspaceId, editingKitId)
      if (detail?.data) setKitData(detail.data)
      await refreshHealth(workspaceId, editingKitId)
      await refreshGuidelines(workspaceId, editingKitId)
    } catch (err) {
      handleApiError(err, 'Failed to generate brand guidelines')
    } finally {
      setGeneratingGuideline(false)
    }
  }

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
   - Text Light: ${resolveRoleHex(kitData, 'text', '#0F172A')}
   - Primary Dark: ${resolveRoleHex(kitData, 'primaryDark', '#60A5FA')}
   - Background Dark: ${resolveRoleHex(kitData, 'bgDark', '#0F172A')}
   - Text Dark: ${resolveRoleHex(kitData, 'textDark', '#F8FAFC')}
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

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode)
    try {
      localStorage.setItem('brandKitsViewMode', mode)
    } catch {
      // ignore storage failures
    }
  }, [])

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
        triggerSuggestVoice={triggerSuggestVoice}
        triggerSuggestImageStyle={triggerSuggestImageStyle}
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
        generateBrandGuidelines={generateBrandGuidelines}
        guidelineLink={guidelineLink}
        kitHealth={kitHealth}
        slogan={slogan}
        setSlogan={setSlogan}
        triggerSuggestVoice={triggerSuggestVoice}
        triggerSuggestImageStyle={triggerSuggestImageStyle}
        triggerGenerateFromLogo={triggerGenerateFromLogo}
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
      setViewMode={handleViewModeChange}
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
