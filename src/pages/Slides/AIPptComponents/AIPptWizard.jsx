import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, ArrowUp, ArrowRight, Paperclip, Check, Globe, Image as ImageIcon, Box, Ban, ChevronDown, Users, Target, Mic, ListPlus } from 'lucide-react'
import { MdDescription, MdMenuBook, MdInsights } from 'react-icons/md'
import { useAuth } from '../../../contexts/AuthContext'
import presentationService from '../../../services/presentationService'
import userService from '../../../services/userService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext'
import {
  listBrandKitsUsableInWorkspace,
  ensureBrandKitInWorkspace,
} from '../../../utils/brandKitWorkspace'
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

import styleScene from '../../../assets/slides_icons/style_scene.jpg'
import stylePhoto from '../../../assets/slides_icons/style_photo.jpg'
import styleStillLife from '../../../assets/slides_icons/style_still_life.jpg'
import styleSpotColor from '../../../assets/slides_icons/style_spot_color.jpg'
import styleIllustration from '../../../assets/slides_icons/style_illustration.jpg'
import styleFlatLine from '../../../assets/slides_icons/style_flat_line.jpg'
import styleModernArt from '../../../assets/slides_icons/style_modern_art.jpg'
import styleIsometric from '../../../assets/slides_icons/style_isometric.jpg'
import styleGouache from '../../../assets/slides_icons/style_gouache.jpg'
import styleBoldPoster from '../../../assets/slides_icons/style_bold_poster.jpg'
import styleWatercolor from '../../../assets/slides_icons/style_watercolor.jpg'
import styleBauhaus from '../../../assets/slides_icons/style_bauhaus.jpg'
import style3d from '../../../assets/slides_icons/style_3d.jpg'
import styleNeonGlow from '../../../assets/slides_icons/style_neon_glow.jpg'
import styleCinematic from '../../../assets/slides_icons/style_cinematic.jpg'
import styleMesh from '../../../assets/slides_icons/style_mesh.jpg'

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
import { THEMES } from '../../../constants/pptWizardThemes'

const TEMPLATES = [
  { id: 'corp-pitch', name: 'Corporate Pitch', img: temp1 },
  { id: 'marketing', name: 'Marketing Campaign', img: temp2 },
  { id: 'social', name: 'Social Media', img: temp3 },
  { id: 'portfolio', name: 'Personal Portfolio', img: temp4 },
]

const IMAGE_STYLES = [
  { id: 'scene', name: 'Scene', img: styleScene, tags: ['Scenic'] },
  { id: 'photo', name: 'Photo', img: stylePhoto, tags: ['Realistic'] },
  { id: 'still-life', name: 'Still life', img: styleStillLife, tags: ['Realistic'] },
  { id: 'spot-color', name: 'Spot Color', img: styleSpotColor, tags: ['Minimal'] },
  
  { id: 'illustration', name: 'Illustration', img: styleIllustration, tags: ['Playful'] },
  { id: 'flat-line', name: 'Flat Line Art', img: styleFlatLine, tags: ['Minimal'] },
  { id: 'modern-art', name: 'Modern Art', img: styleModernArt, tags: ['Abstract'] },
  
  { id: 'isometric', name: 'Isometric', img: styleIsometric, tags: ['Playful'] },
  { id: 'gouache', name: 'Gouache Paint', img: styleGouache, tags: ['Scenic'] },
  { id: 'bold-poster', name: 'Bold Poster', img: styleBoldPoster, tags: ['Bold'] },
  
  { id: 'watercolor', name: 'Watercolor', img: styleWatercolor, tags: ['Scenic'] },
  { id: 'bauhaus', name: 'Bauhaus', img: styleBauhaus, tags: ['Bold', 'Minimal'] },
  
  { id: '3d', name: '3D', img: style3d, tags: ['Playful'] },
  { id: 'neon-glow', name: 'Neon Glow', img: styleNeonGlow, tags: ['Bold'] },
  { id: 'cinematic', name: 'Cinematic', img: styleCinematic, tags: ['Realistic', 'Scenic'] },
  { id: 'mesh', name: 'Mesh', img: styleMesh, tags: ['Abstract'] },
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
  const [selectedBrandKitWorkspaceId, setSelectedBrandKitWorkspaceId] = useState('')
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
          listBrandKitsUsableInWorkspace(ctx.workspaceId).catch((err) => {
            if (import.meta.env?.DEV) {
              console.warn('[AIPptWizard] brand kits load failed', err)
            }
            return []
          }),
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

  // Refresh brand kits when user opens the vibe step
  useEffect(() => {
    if (step !== 2 || !workspaceHint?.workspaceId) return undefined
    let cancelled = false
    listBrandKitsUsableInWorkspace(workspaceHint.workspaceId)
      .then((kits) => {
        if (!cancelled) setBrandKits(kits || [])
      })
      .catch((err) => {
        if (import.meta.env?.DEV) {
          console.warn('[AIPptWizard] brand kits refresh failed', err)
        }
      })
    return () => {
      cancelled = true
    }
  }, [step, workspaceHint?.workspaceId])

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

  const handleSelectBrandKit = useCallback((id, kitWorkspaceId = null) => {
    setSelectedBrandKitId(id ? String(id) : '')
    setSelectedBrandKitWorkspaceId(id && kitWorkspaceId ? String(kitWorkspaceId) : '')
  }, [])

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
      let brandKitId = selectedBrandKitId || null
      const selectedKit = brandKitId
        ? brandKits.find((kit) => String(kit.id) === String(brandKitId))
        : null
      const sourceKitWorkspaceId =
        selectedBrandKitWorkspaceId || selectedKit?.workspaceId || null

      // Brand kits are workspace-scoped. Keep the deck in the presentation
      // workspace; clone the kit into it when the pick came from personal/elsewhere.
      if (brandKitId) {
        brandKitId = await ensureBrandKitInWorkspace(
          ctx.workspaceId,
          brandKitId,
          sourceKitWorkspaceId
        )
      }

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
            onSelectBrandKit={handleSelectBrandKit}
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
