import { useState, useRef, useEffect, useCallback } from 'react'
import { MdWarning } from 'react-icons/md'
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
  LOGO_VARIANT_APPLY_ROLES,
  LOGO_WORDMARK_ROLES,
  logoRolesMatch,
  findLogoMedia,
  refreshEditorCredits,
  isDarkWordmarkRole,
} from '../../utils/brandKitHelpers'
import {
  finishTransparentMark,
  recolorOpaquePixels,
  loadLogoCanvasFromBlob,
  loadLogoCanvasFromUrl,
  canvasToPngFile,
  resolveWordmarkTypeSpec,
  resolveWordmarkTextColorsFromKit,
  composeWordmarkForRole,
} from '../../components/features/brand-kits/utils/composeLogoVariants'
import {
  ensureGoogleFontLoaded,
  resolveRoleHex,
} from '../../components/features/brand-kits/utils/brandKitUtils'
import { FONT_ROLE_DEFAULTS } from '../../components/features/brand-kits/utils/brandKitConstants'
import { downloadBrandGuidelinePdf as generateGuidelinePdf } from '../../components/features/brand-kits/utils/downloadBrandGuidelinePdf'
import BrandKitsListView from '../../components/features/brand-kits/BrandKitsListView'
import BrandKitWizard from '../../components/features/brand-kits/BrandKitWizard'
import BrandKitEditor from '../../components/features/brand-kits/BrandKitEditor'
import Toast from '../../components/ui/Toast/Toast'
import { sanitizeUserFacingMessage } from '../../utils/userFacingMessage'
import '../../components/ui/ConfirmDialog/ConfirmDialog.css'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import '../Videos/Videos.css'
import './BrandKits.css'

function serializeBrandKitDraft({ kitName, slogan, isDefault, logoFile, kitData }) {
  return JSON.stringify({
    kitName: String(kitName || '').trim(),
    slogan: String(slogan || ''),
    isDefault: Boolean(isDefault),
    hasPendingLogo: Boolean(logoFile),
    data: normalizeBrandKitData({
      ...(kitData || emptyBrandKitData()),
      meta: {
        ...((kitData && kitData.meta) || {}),
        tagline: slogan || kitData?.meta?.tagline || '',
      },
    }),
  })
}

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
  const [mockupTemplates, setMockupTemplates] = useState([])
  const [mockupBilling, setMockupBilling] = useState(null)
  const [mockupSaved, setMockupSaved] = useState([])
  const [mockupLoading, setMockupLoading] = useState(false)
  const [mockupGeneratingId, setMockupGeneratingId] = useState(null)
  const [mockupPreviews, setMockupPreviews] = useState({})
  const [toast, setToast] = useState(null)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const menuRefs = useRef({})
  const fileInputRef = useRef(null)
  const wizardLogoInputRef = useRef(null)
  const pendingUploadKind = useRef('logo')
  const pendingUploadRole = useRef('primary')
  const savedSnapshotRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  const canWrite = canWriteBrandKits(workspaceRole)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message: sanitizeUserFacingMessage(message), type })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2800)
  }, [])

  const captureCleanSnapshot = useCallback((draft) => {
    savedSnapshotRef.current = serializeBrandKitDraft(draft)
    setIsDirty(false)
  }, [])

  const handleApiError = useCallback((err, fallback) => {
    if (err instanceof BrandKitPermissionError) {
      setError('Only workspace owners and admins can edit brand kits')
      return
    }
    if (err instanceof InsufficientCreditsError) {
      setError(err.message || 'Insufficient credits for this brand kit action')
      return
    }
    if (err?.status === 429) {
      setError(err.message || 'Rate limit reached. Try again later.')
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

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!showEditor || !savedSnapshotRef.current) {
      setIsDirty(false)
      return
    }
    const current = serializeBrandKitDraft({
      kitName,
      slogan,
      isDefault,
      logoFile,
      kitData,
    })
    setIsDirty(current !== savedSnapshotRef.current)
  }, [showEditor, kitName, slogan, isDefault, logoFile, kitData])

  useEffect(() => {
    if (!showEditor || !isDirty) return undefined
    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [showEditor, isDirty])

  const openCreate = () => {
    if (!canWrite) return
    setEditingKitId(null)
    setKitName('')
    setSlogan('')
    setLogoFile(null)
    setLogoPreviewUrl(null)
    const empty = emptyBrandKitData()
    setKitData(empty)
    setKitMedia([])
    setKitHealth(null)
    setGuidelineLink(null)
    const defaultFlag = brandKits.length === 0
    setIsDefault(defaultFlag)
    setError('')
    setIsWizardMode(true)
    setWizardStep(1)
    setLeaveModalOpen(false)
    setShowEditor(true)
    captureCleanSnapshot({
      kitName: '',
      slogan: '',
      isDefault: defaultFlag,
      logoFile: null,
      kitData: empty,
    })
  }

  const openEdit = async (kit) => {
    if (!workspaceId || !kit?.id) return
    setError('')
    setIsWizardMode(false)
    setEditorTab('overview')
    setLogoFile(null)
    setLogoPreviewUrl(null)
    setMockupTemplates([])
    setMockupBilling(null)
    setMockupSaved([])
    setMockupPreviews({})
    setMockupGeneratingId(null)
    setLeaveModalOpen(false)
    setShowEditor(true)
    setEditingKitId(kit.id)
    setKitName(kit.name)
    try {
      const detail = await brandKitService.get(workspaceId, kit.id)
      const data = detail.data || emptyBrandKitData()
      const name = detail.name || kit.name || ''
      const tagline = data.meta?.tagline || ''
      const defaultFlag = Boolean(detail.isDefault)
      setKitName(name)
      setKitData(data)
      setSlogan(tagline)
      setKitMedia(detail.media || [])
      setIsDefault(defaultFlag)
      captureCleanSnapshot({
        kitName: name,
        slogan: tagline,
        isDefault: defaultFlag,
        logoFile: null,
        kitData: data,
      })
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
    const creating = !editingKitId
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

      let nextData = dataWithMeta
      let nextLogoFile = logoFile
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
          nextData = detail.data || dataWithMeta
          setKitData(nextData)
          setLogoFile(null)
          nextLogoFile = null
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
      captureCleanSnapshot({
        kitName: finalName,
        slogan: slogan || dataWithMeta.meta?.tagline || '',
        isDefault,
        logoFile: nextLogoFile,
        kitData: nextData,
      })
      showToast(
        creating ? 'Brand kit created successfully' : 'Brand kit saved successfully',
        'success'
      )
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

  const loadMediaCanvas = useCallback(
    async (mediaItem, fallbackUrl) => {
      const mediaId = mediaItem?.id || mediaItem?._id
      if (mediaId && workspaceId && editingKitId) {
        try {
          const blob = await brandKitService.fetchMediaBlob(workspaceId, editingKitId, mediaId)
          return loadLogoCanvasFromBlob(blob)
        } catch {
          // fall through to URL
        }
      }
      const url = mediaItem?.url || mediaItem?.presignedUrl || mediaItem?.src || fallbackUrl
      if (!url) throw new Error('No logo source available')
      try {
        const res = await fetch(url)
        if (res.ok) {
          const blob = await res.blob()
          return loadLogoCanvasFromBlob(blob)
        }
      } catch {
        // last resort: direct image load (may fail CORS for canvas ops)
      }
      return loadLogoCanvasFromUrl(url)
    },
    [workspaceId, editingKitId]
  )

  const uploadFinishedLogo = useCallback(
    async (canvas, role) => {
      const file = await canvasToPngFile(canvas, `${role}.png`)
      await brandKitService.uploadMedia(workspaceId, editingKitId, {
        file,
        kind: 'logo',
        role,
        name: `${role}.png`,
      })
    },
    [workspaceId, editingKitId]
  )

  const finishAiLogoRoles = useCallback(
    async (mediaList) => {
      for (const role of LOGO_VARIANT_APPLY_ROLES) {
        const item = findLogoMedia(mediaList, role)
        if (!item) continue
        setGeneratingRole(role)
        let canvas = await loadMediaCanvas(item)
        canvas = finishTransparentMark(canvas)
        if (role === 'black') canvas = recolorOpaquePixels(canvas, '#000000')
        if (role === 'white') canvas = recolorOpaquePixels(canvas, '#FFFFFF')
        await uploadFinishedLogo(canvas, role)
      }
    },
    [loadMediaCanvas, uploadFinishedLogo]
  )

  const composeAndUploadWordmarks = useCallback(
    async (mediaList) => {
      const primary =
        findLogoMedia(mediaList, 'primary') || findLogoMedia(mediaList, 'light')
      if (!primary && !logoPreviewUrl) {
        throw new Error('Primary logo required to build wordmark lockups')
      }
      const { fontFamily, fontWeight } = resolveWordmarkTypeSpec(kitData)
      const textColors = resolveWordmarkTextColorsFromKit(kitData)
      let lightMarkCanvas = await loadMediaCanvas(primary, logoPreviewUrl)
      lightMarkCanvas = finishTransparentMark(lightMarkCanvas)

      const darkMarkSource =
        findLogoMedia(mediaList, 'white') ||
        findLogoMedia(mediaList, 'dark') ||
        primary
      let darkMarkCanvas = await loadMediaCanvas(darkMarkSource, logoPreviewUrl)
      darkMarkCanvas = finishTransparentMark(darkMarkCanvas)
      if (!findLogoMedia(mediaList, 'white') && !findLogoMedia(mediaList, 'dark')) {
        darkMarkCanvas = recolorOpaquePixels(darkMarkCanvas, '#FFFFFF')
      }

      for (const role of LOGO_WORDMARK_ROLES) {
        setGeneratingRole(role)
        const markCanvas = isDarkWordmarkRole(role) ? darkMarkCanvas : lightMarkCanvas
        const composed = await composeWordmarkForRole({
          role,
          markCanvas,
          name: kitName,
          fontFamily,
          fontWeight,
          textColors,
        })
        await uploadFinishedLogo(composed, role)
      }
    },
    [kitData, kitName, loadMediaCanvas, logoPreviewUrl, uploadFinishedLogo]
  )

  const generateLogoVariants = async () => {
    if (!canWrite || !editingKitId) {
      setError('Save the brand kit first before generating variants.')
      return
    }
    const hasPrimary = (kitMedia || []).some(
      (m) =>
        String(m.kind || '').toLowerCase() === 'logo' && logoRolesMatch(m.role, 'primary')
    )
    if (!hasPrimary && !logoPreviewUrl) {
      setError('Upload a Primary Logo first to generate variants.')
      return
    }

    setGenerating(true)
    setError('')
    try {
      setGeneratingRole('preview')
      await brandKitService.suggestLogoVariants(workspaceId, editingKitId, {})

      setGeneratingRole('apply')
      await brandKitService.suggestLogoVariants(workspaceId, editingKitId, {
        applyRoles: LOGO_VARIANT_APPLY_ROLES,
      })

      let detail = await brandKitService.get(workspaceId, editingKitId)
      let media = detail.media || []

      // Strip AI plate backgrounds + normalize mono variants
      setGeneratingRole('finish')
      await finishAiLogoRoles(media)
      detail = await brandKitService.get(workspaceId, editingKitId)
      media = detail.media || []

      // Compose balanced wordmarks from the primary mark + kit typography
      setGeneratingRole('wordmarks')
      await composeAndUploadWordmarks(media)

      detail = await brandKitService.get(workspaceId, editingKitId)
      setKitMedia(detail.media || [])
      await refreshHealth(workspaceId, editingKitId)
      refreshEditorCredits()
    } catch (err) {
      handleApiError(err, 'Logo variant generation failed')
    } finally {
      setGenerating(false)
      setGeneratingRole(null)
    }
  }

  const regenerateLogoRole = async (role) => {
    if (!canWrite || !editingKitId || !role) return
    const hasPrimary = (kitMedia || []).some(
      (m) =>
        String(m.kind || '').toLowerCase() === 'logo' && logoRolesMatch(m.role, 'primary')
    )
    if (!hasPrimary && !logoPreviewUrl) {
      setError('Upload a Primary Logo first to regenerate variants.')
      return
    }

    setGenerating(true)
    setGeneratingRole(role)
    setError('')
    try {
      if (LOGO_WORDMARK_ROLES.includes(role)) {
        const primary =
          findLogoMedia(kitMedia, 'primary') || findLogoMedia(kitMedia, 'light')
        if (!primary && !logoPreviewUrl) {
          throw new Error('Primary logo required to build wordmark lockups')
        }
        const { fontFamily, fontWeight } = resolveWordmarkTypeSpec(kitData)
        const textColors = resolveWordmarkTextColorsFromKit(kitData)
        let markCanvas = await loadMediaCanvas(primary, logoPreviewUrl)
        markCanvas = finishTransparentMark(markCanvas)
        if (isDarkWordmarkRole(role)) {
          const darkMarkSource =
            findLogoMedia(kitMedia, 'white') ||
            findLogoMedia(kitMedia, 'dark') ||
            primary
          markCanvas = await loadMediaCanvas(darkMarkSource, logoPreviewUrl)
          markCanvas = finishTransparentMark(markCanvas)
          if (!findLogoMedia(kitMedia, 'white') && !findLogoMedia(kitMedia, 'dark')) {
            markCanvas = recolorOpaquePixels(markCanvas, '#FFFFFF')
          }
        }
        const composed = await composeWordmarkForRole({
          role,
          markCanvas,
          name: kitName,
          fontFamily,
          fontWeight,
          textColors,
        })
        await uploadFinishedLogo(composed, role)
      } else if (LOGO_VARIANT_APPLY_ROLES.includes(role)) {
        await brandKitService.suggestLogoVariants(workspaceId, editingKitId, {
          applyRoles: [role],
        })
        const detail = await brandKitService.get(workspaceId, editingKitId)
        const item = findLogoMedia(detail.media || [], role)
        if (item) {
          let canvas = await loadMediaCanvas(item)
          canvas = finishTransparentMark(canvas)
          if (role === 'black') canvas = recolorOpaquePixels(canvas, '#000000')
          if (role === 'white') canvas = recolorOpaquePixels(canvas, '#FFFFFF')
          await uploadFinishedLogo(canvas, role)
        }
      } else {
        // primary / unknown — re-upload finished primary if possible
        const item = findLogoMedia(kitMedia, role)
        if (item || logoPreviewUrl) {
          let canvas = await loadMediaCanvas(item, logoPreviewUrl)
          canvas = finishTransparentMark(canvas)
          await uploadFinishedLogo(canvas, role === 'primary' ? 'primary' : role)
        }
      }

      const detail = await brandKitService.get(workspaceId, editingKitId)
      setKitMedia(detail.media || [])
      await refreshHealth(workspaceId, editingKitId)
      refreshEditorCredits()
    } catch (err) {
      handleApiError(err, `Failed to regenerate ${role} logo`)
    } finally {
      setGenerating(false)
      setGeneratingRole(null)
    }
  }

  const downloadLogoPng = async (mediaItem, roleLabel) => {
    if (!workspaceId || !editingKitId || !mediaItem) return
    const mediaId = mediaItem.id || mediaItem._id
    const safeName = String(kitName || 'brand-kit')
      .replace(/[^\w-]+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
    const rolePart = String(roleLabel || mediaItem.role || 'logo')
      .replace(/[^\w-]+/g, '-')
      .toLowerCase()
    const filename = `${safeName}-${rolePart}.png`

    try {
      let blob = null
      if (mediaId) {
        try {
          blob = await brandKitService.fetchMediaBlob(workspaceId, editingKitId, mediaId)
        } catch {
          blob = null
        }
      }
      if (!blob) {
        const url = mediaItem.url || mediaItem.presignedUrl || mediaItem.src
        if (!url) throw new Error('No logo URL available')
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to download logo')
        blob = await res.blob()
      }
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      handleApiError(err, 'Failed to download logo PNG')
    }
  }

  const hasLogoOnKit = useCallback(() => {
    return (kitMedia || []).some((m) => String(m.kind || m.type || '').toLowerCase() === 'logo')
  }, [kitMedia])

  const loadMockups = useCallback(async () => {
    if (!workspaceId || !editingKitId) return
    setMockupLoading(true)
    try {
      const [catalog, listed] = await Promise.all([
        brandKitService.listMockupCatalog(workspaceId, editingKitId),
        brandKitService.listMockups(workspaceId, editingKitId).catch(() => null),
      ])
      setMockupTemplates(catalog.templates || [])
      if (catalog.billing) setMockupBilling(catalog.billing)
      if (listed) {
        setMockupSaved(listed.mockups || [])
        if (listed.billing) setMockupBilling(listed.billing)
      } else {
        const detail = await brandKitService.get(workspaceId, editingKitId).catch(() => null)
        const media = detail?.media || []
        setMockupSaved(
          media.filter((m) => String(m.kind || m.type || '').toLowerCase() === 'mockup')
        )
      }
    } catch (err) {
      handleApiError(err, 'Failed to load logo mockups')
    } finally {
      setMockupLoading(false)
    }
  }, [workspaceId, editingKitId, handleApiError])

  const generateMockup = useCallback(
    async (templateId, options = {}) => {
      const opts =
        typeof options === 'boolean' ? { save: options } : options || {}
      const {
        save = true,
        itemColor,
        logoRole = 'primary',
        logoPosition,
      } = opts

      if (!canWrite || !workspaceId || !editingKitId || !templateId) return
      if (mockupGeneratingId) return
      if (!hasLogoOnKit()) {
        setError('Upload a logo to this brand kit before generating mockups.')
        return
      }

      setMockupGeneratingId(templateId)
      setError('')
      try {
        const result = await brandKitService.generateMockup(workspaceId, editingKitId, {
          templateId,
          save: save !== false,
          itemColor: itemColor || undefined,
          logoRole: logoRole || 'primary',
          logoPosition: logoPosition || undefined,
        })
        const mockup = result.mockup || {}
        if (result.billing) setMockupBilling(result.billing)
        const previewPayload = {
          url: mockup.url,
          saved: Boolean(mockup.saved),
          mediaId: mockup.mediaId,
          templateId: mockup.templateId || templateId,
          logoRoleUsed: mockup.logoRoleUsed,
          itemColorUsed: mockup.itemColorUsed ?? null,
          logoPositionUsed: mockup.logoPositionUsed ?? null,
        }
        setMockupPreviews((prev) => ({
          ...prev,
          [templateId]: previewPayload,
        }))
        if (result.billing?.charged) refreshEditorCredits()
        if (mockup.saved) {
          const detail = await brandKitService.get(workspaceId, editingKitId)
          setKitMedia(detail.media || [])
          const listed = await brandKitService.listMockups(workspaceId, editingKitId).catch(() => null)
          if (listed?.mockups) setMockupSaved(listed.mockups)
          else {
            setMockupSaved(
              (detail.media || []).filter(
                (m) => String(m.kind || m.type || '').toLowerCase() === 'mockup'
              )
            )
          }
          await refreshHealth(workspaceId, editingKitId)
          setMockupPreviews((prev) => ({
            ...prev,
            [templateId]: {
              ...previewPayload,
              saved: true,
              mediaId: mockup.mediaId,
            },
          }))
        }
      } catch (err) {
        handleApiError(err, 'Mockup generation failed')
        throw err
      } finally {
        setMockupGeneratingId(null)
      }
    },
    [
      canWrite,
      workspaceId,
      editingKitId,
      mockupGeneratingId,
      hasLogoOnKit,
      handleApiError,
      refreshHealth,
    ]
  )

  const saveMockup = useCallback(
    async (templateId, options = {}) => {
      await generateMockup(templateId, { ...options, save: true })
    },
    [generateMockup]
  )

  const deleteMockup = useCallback(
    async (item) => {
      if (!canWrite || !item) return
      const mediaId = item.mediaId || item.id || item._id
      const templateId = String(item.templateId || item.role || '')
      try {
        if (mediaId) {
          await brandKitService.deleteMedia(workspaceId, editingKitId, mediaId)
          setKitMedia((prev) =>
            prev.filter((m) => String(m.id || m._id) !== String(mediaId))
          )
        }
        if (templateId) {
          setMockupPreviews((prev) => {
            const next = { ...prev }
            delete next[templateId]
            return next
          })
        }
        setMockupSaved((prev) =>
          (prev || []).filter((m) => {
            const id = m.id || m._id || m.mediaId
            const role = String(m.role || m.templateId || '')
            if (mediaId && String(id) === String(mediaId)) return false
            if (templateId && role === templateId) return false
            return true
          })
        )
        await loadMockups()
        if (editingKitId) await refreshHealth(workspaceId, editingKitId)
      } catch (err) {
        handleApiError(err, 'Failed to delete mockup')
      }
    },
    [
      canWrite,
      workspaceId,
      editingKitId,
      loadMockups,
      refreshHealth,
      handleApiError,
    ]
  )

  const downloadMockupPng = useCallback(
    async (item, label) => {
      await downloadLogoPng(item, label || item?.templateId || 'mockup')
    },
    [downloadLogoPng]
  )

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
      refreshEditorCredits()
    } catch (err) {
      handleApiError(err, 'Failed to generate brand guidelines')
    } finally {
      setGeneratingGuideline(false)
    }
  }

  const downloadBrandGuideline = useCallback(async () => {
    if (!workspaceId || !editingKitId) {
      await generateGuidelinePdf({
        kitName,
        kitData,
        kitMedia,
        setGeneratingGuideline,
        setError,
      })
      return
    }

    setGeneratingGuideline(true)
    setError('')
    try {
      await brandKitService.downloadGuidelinePdfAndSave(workspaceId, editingKitId)
    } catch (err) {
      console.error('Guideline PDF download failed, falling back to local PDF', err)
      try {
        await generateGuidelinePdf({
          kitName,
          kitData,
          kitMedia,
          setGeneratingGuideline,
          setError,
        })
      } catch (fallbackErr) {
        handleApiError(fallbackErr || err, 'Failed to download brand guideline PDF')
      }
    } finally {
      setGeneratingGuideline(false)
    }
  }, [workspaceId, editingKitId, kitName, kitData, kitMedia, handleApiError])

  const mediaByKind = (kind) =>
    (kitMedia || []).filter((m) => String(m.kind || m.type || '').toLowerCase() === kind)

  const closeEditor = useCallback(() => {
    setLeaveModalOpen(false)
    setShowEditor(false)
    setIsDirty(false)
    savedSnapshotRef.current = null
    setMockupTemplates([])
    setMockupBilling(null)
    setMockupSaved([])
    setMockupPreviews({})
    setMockupGeneratingId(null)
  }, [])

  const requestCloseEditor = useCallback(() => {
    if (isDirty && canWrite) {
      setLeaveModalOpen(true)
      return
    }
    closeEditor()
  }, [isDirty, canWrite, closeEditor])

  const handleDiscardChanges = useCallback(() => {
    setLeaveModalOpen(false)
    closeEditor()
  }, [closeEditor])

  const handleSaveAndLeave = useCallback(async () => {
    const id = await handleSave(false)
    if (id) {
      setLeaveModalOpen(false)
      closeEditor()
    }
  }, [handleSave, closeEditor])

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode)
    try {
      localStorage.setItem('brandKitsViewMode', mode)
    } catch {
      // ignore storage failures
    }
  }, [])

  const brandKitOverlays = (
    <>
      <Toast toast={toast} />
      {leaveModalOpen ? (
        <div
          className="confirm-dialog-overlay"
          onClick={() => setLeaveModalOpen(false)}
          role="presentation"
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bk-unsaved-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-dialog-icon-wrap">
              <MdWarning className="confirm-dialog-icon" aria-hidden="true" />
            </div>
            <h3 id="bk-unsaved-title" className="confirm-dialog-title">
              Unsaved changes
            </h3>
            <p className="confirm-dialog-message">
              You have unsaved changes to this brand kit. Save them before leaving, or discard
              them.
            </p>
            <div className="confirm-dialog-actions">
              <button type="button" className="btn-secondary" onClick={handleDiscardChanges}>
                Discard
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveAndLeave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )

  if (!loading && showEditor && isWizardMode) {
    return (
      <>
        {brandKitOverlays}
        <BrandKitWizard
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
        closeEditor={requestCloseEditor}
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
      </>
    )
  }

  if (!loading && showEditor && !isWizardMode) {
    return (
      <>
        {brandKitOverlays}
        <BrandKitEditor
        canWrite={canWrite}
        closeEditor={requestCloseEditor}
        downloadBrandGuideline={downloadBrandGuideline}
        generatingGuideline={generatingGuideline}
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
        regenerateLogoRole={regenerateLogoRole}
        downloadLogoPng={downloadLogoPng}
        hasLogoOnKit={hasLogoOnKit()}
        mockupTemplates={mockupTemplates}
        mockupBilling={mockupBilling}
        mockupSaved={mockupSaved}
        mockupLoading={mockupLoading}
        mockupGeneratingId={mockupGeneratingId}
        mockupPreviews={mockupPreviews}
        loadMockups={loadMockups}
        generateMockup={generateMockup}
        saveMockup={saveMockup}
        deleteMockup={deleteMockup}
        downloadMockupPng={downloadMockupPng}
      />
      </>
    )
  }

  return (
    <>
      {brandKitOverlays}
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
    </>
  )
}

export default BrandKits
