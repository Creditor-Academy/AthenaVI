import { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowUp, ArrowRight, Paperclip, FileText, BookOpen, TrendingUp, AlignLeft, Palette, Check, Globe, Image as ImageIcon, Box, Ban, ChevronDown, Star, Building } from 'lucide-react'
import presentationService from '../../../services/presentationService'
import brandKitService from '../../../services/brandKitService'
import { isInsufficientCreditsError } from '../../../services/creditsService'
import { resolvePresentationWorkspaceContext } from '../../../utils/presentationContext'
import {
  PPT_AI_SLIDE_COUNTS,
  clampAiSlideCount,
  derivePresentationTitle,
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

import AIPptThemeModal from './AIPptThemeModal'
import AIPptImageModal from './AIPptImageModal'
import aiMascot from '../../../assets/slides_icons/ai_mascot.png'

const SUGGESTED_PROMPTS = [
  "Turn meeting notes into a presentation",
  "Summarize a research paper into key takeaways",
  "Research industry trends",
  "Create a strategy brief from planning notes"
]

const TONES = ['Professional', 'Creative', 'Academic', 'Persuasive', 'Casual']
const AUDIENCES = ['Investors', 'Customers', 'Internal Team', 'Students', 'General Public']
const PURPOSES = ['Persuade', 'Inform', 'Educate', 'Inspire', 'Report']

function makeTheme({ id, name, vibe, background, background_secondary, text_primary, text_secondary, primary, secondary, accent, border }) {
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
    // Legacy keys used by theme modal / cards
    outer: `linear-gradient(135deg, ${primary}, ${secondary})`,
    inner: background,
    title: text_primary,
    body: text_secondary,
  }
}

export const THEMES = [
  makeTheme({ id: 'modern-professional', name: 'Modern Professional', vibe: 'corporate / clean', background: '#FFFFFF', background_secondary: '#F5F6F8', text_primary: '#1A1A1A', text_secondary: '#5C5F66', primary: '#1E3A8A', secondary: '#2563EB', accent: '#F59E0B', border: '#E2E4E9' }),
  makeTheme({ id: 'midnight-dark', name: 'Midnight Dark Mode', vibe: 'dark / tech', background: '#0F1115', background_secondary: '#1A1D23', text_primary: '#F5F5F7', text_secondary: '#A0A4AD', primary: '#6366F1', secondary: '#8B5CF6', accent: '#22D3EE', border: '#2A2D35' }),
  makeTheme({ id: 'humana-mint', name: 'Humana Mint', vibe: 'healthcare / wellness', background: '#FFFFFF', background_secondary: '#EAF7F0', text_primary: '#0B2E23', text_secondary: '#4C6B5F', primary: '#00A651', secondary: '#7FD8A6', accent: '#FFB800', border: '#D4EDE0' }),
  makeTheme({ id: 'luxury-gold', name: 'Luxury Gold & Black', vibe: 'premium / finance', background: '#0B0B0B', background_secondary: '#1C1C1C', text_primary: '#F5EFE0', text_secondary: '#B8AF9A', primary: '#D4AF37', secondary: '#8A6E2F', accent: '#FFFFFF', border: '#3A3A3A' }),
  makeTheme({ id: 'soft-blush', name: 'Soft Blush', vibe: 'feminine / soft / wellness', background: '#FFFBF8', background_secondary: '#FBEAE5', text_primary: '#4A2E2A', text_secondary: '#8B6A63', primary: '#E8A798', secondary: '#D98C9E', accent: '#F2C14E', border: '#F3DAD3' }),
  makeTheme({ id: 'playful-pop', name: 'Playful Pop', vibe: 'fun / gamified', background: '#FFFFFF', background_secondary: '#FFF6E0', text_primary: '#26221D', text_secondary: '#6B6259', primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFD93D', border: '#F0E4C6' }),
  makeTheme({ id: 'pastel-dream', name: 'Pastel Dream', vibe: 'pastel / soft UI', background: '#FDFBFF', background_secondary: '#F1EEFB', text_primary: '#3B3450', text_secondary: '#8A82A3', primary: '#B8A6E8', secondary: '#A6D8E8', accent: '#F7B6C2', border: '#E6DFF5' }),
  makeTheme({ id: 'cyberpunk-neon', name: 'Cyberpunk Neon', vibe: 'futuristic / neon', background: '#0A0A12', background_secondary: '#14141F', text_primary: '#E8E8FF', text_secondary: '#8C8CB3', primary: '#FF00FF', secondary: '#00FFF0', accent: '#FFEE00', border: '#2E2E45' }),
  makeTheme({ id: 'earthy-sage', name: 'Earthy Sage', vibe: 'nature / organic / calm', background: '#FAF8F3', background_secondary: '#EDE7DA', text_primary: '#2E332A', text_secondary: '#6B6F5E', primary: '#6B8E63', secondary: '#A9BA9D', accent: '#C97B4A', border: '#DDD6C4' }),
  makeTheme({ id: 'ocean-breeze', name: 'Ocean Breeze', vibe: 'cool / trust / SaaS', background: '#F7FCFF', background_secondary: '#E4F3FA', text_primary: '#0D2B3A', text_secondary: '#4E7484', primary: '#0EA5E9', secondary: '#0369A1', accent: '#F97316', border: '#CFE9F5' }),
  makeTheme({ id: 'sunset-warmth', name: 'Sunset Warmth', vibe: 'energetic / marketing', background: '#FFF9F5', background_secondary: '#FFE9DB', text_primary: '#3A1F14', text_secondary: '#8A5C46', primary: '#FF5E5B', secondary: '#FF9F1C', accent: '#FFD166', border: '#FBD8BF' }),
  makeTheme({ id: 'minimal-monochrome', name: 'Minimal Monochrome', vibe: 'minimal / editorial', background: '#FFFFFF', background_secondary: '#F2F2F2', text_primary: '#111111', text_secondary: '#555555', primary: '#000000', secondary: '#4D4D4D', accent: '#999999', border: '#DADADA' }),
  makeTheme({ id: 'edtech-vibrant', name: 'EdTech Vibrant', vibe: 'education / friendly professional', background: '#FFFFFF', background_secondary: '#EEF3FF', text_primary: '#131A2A', text_secondary: '#5B6478', primary: '#3B5BFF', secondary: '#7C93FF', accent: '#FFB020', border: '#DCE3FA' }),
  makeTheme({ id: 'finance-trust', name: 'Finance Trust', vibe: 'banking / fintech / serious', background: '#FFFFFF', background_secondary: '#F0F3F5', text_primary: '#131C2C', text_secondary: '#576372', primary: '#0B3D91', secondary: '#1A5CA8', accent: '#00B37E', border: '#D9E0E6' }),
  makeTheme({ id: 'startup-gradient', name: 'Startup Gradient', vibe: 'modern SaaS / pitch deck', background: '#FFFFFF', background_secondary: '#F5F0FF', text_primary: '#1A1523', text_secondary: '#6B6178', primary: '#7C3AED', secondary: '#EC4899', accent: '#22C55E', border: '#E9E1FA' }),
  makeTheme({ id: 'vintage-paper', name: 'Vintage Paper', vibe: 'retro / editorial / old-school', background: '#F7F1E3', background_secondary: '#EDE2C9', text_primary: '#3A2E1F', text_secondary: '#7A6A50', primary: '#A9432B', secondary: '#B58C3D', accent: '#4C6E4E', border: '#DDD0AC' }),
  makeTheme({ id: 'autumn-harvest', name: 'Autumn Harvest', vibe: 'warm / seasonal', background: '#FFF8F0', background_secondary: '#F5E3CB', text_primary: '#3B2415', text_secondary: '#7C5B3E', primary: '#C1440E', secondary: '#E09F3E', accent: '#9E2A2B', border: '#EBD3AB' }),
  makeTheme({ id: 'command-center', name: 'Command Center', vibe: 'futuristic / AI dashboard', background: '#0D0D12', background_secondary: '#17171F', text_primary: '#EDEDF2', text_secondary: '#8F8FA3', primary: '#4D4DFF', secondary: '#7A7AFF', accent: '#00FFC2', border: '#2A2A38' }),
  makeTheme({ id: 'corporate-teal', name: 'Soft Corporate Teal', vibe: 'calm professional / consulting', background: '#FFFFFF', background_secondary: '#EAF4F4', text_primary: '#132D2D', text_secondary: '#4E6E6E', primary: '#0F766E', secondary: '#14B8A6', accent: '#F59E0B', border: '#D6E9E8' }),
  makeTheme({ id: 'editorial-red', name: 'Bold Editorial Red', vibe: 'high-contrast / statement deck', background: '#FFFFFF', background_secondary: '#FBEAEA', text_primary: '#161616', text_secondary: '#5A5A5A', primary: '#D7263D', secondary: '#1B1B1B', accent: '#F4A259', border: '#E8D3D3' }),
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
  { id: 'ai', title: 'AI images', subtitle: '', icon: Sparkles, extra: '2 per image' },
  { id: 'web', title: 'Web images', subtitle: 'Search the web for relevant images', icon: Globe },
  { id: 'stock', title: 'Stock images', subtitle: 'High quality stock photography', icon: ImageIcon },
  { id: 'placeholders', title: 'Image placeholders', subtitle: 'Generate empty placeholders for your own images', icon: Box },
  { id: 'none', title: "Don't add images", subtitle: '', icon: Ban }
]

const SCREEN_SIZES = [
  { id: '16:9', name: 'Default', ratio: '16/9' },
  { id: '4:3', name: 'Traditional', ratio: '4/3' },
  { id: '9:16', name: 'Tall', ratio: '9/16' }
]

const TEXT_AMOUNTS = [
  { id: 'Minimal', name: 'Minimal', columns: 1, lines: 3 },
  { id: 'Concise', name: 'Concise', columns: 1, lines: 4 },
  { id: 'Detailed', name: 'Detailed', columns: 2, lines: 3 },
  { id: 'Extensive', name: 'Extensive', columns: 3, lines: 4 },
]

const SLIDE_COUNTS = PPT_AI_SLIDE_COUNTS

const STYLE_OPTIONS = ['Abstract', 'Aesthetic', 'Black & White', 'Colorful', 'Craft & Notebook', 'Creative', 'Cute', 'Dark', 'Deluxe', 'Doodle', 'Duotone', 'Floral & Plants', 'Illustration', 'Interactive & Animated', 'Minimalist', 'Modern', 'Pattern', 'Professional', 'Simple', 'Vintage', 'Watercolor']
const COLOR_OPTIONS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Monochrome']
const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Marketing', 'E-commerce', 'Creative Agency']

export default function AIPptWizard({
  onComplete,
  initialWorkspaceId,
  initialFolderId,
}) {
  const [step, setStep] = useState(1)
  
  // Form Data
  const [title, setTitle] = useState('')
  const [outline, setOutline] = useState('')
  const [tone, setTone] = useState('Professional')
  const [audience, setAudience] = useState('Internal Team')
  const [purpose, setPurpose] = useState('Inform')
  
  // Theme Filters
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState([])
  
  const [baseTemplate, setBaseTemplate] = useState('corp-pitch')
  const [theme, setTheme] = useState('modern-professional')
  const [screenSize, setScreenSize] = useState('16:9')
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  const [slides, setSlides] = useState(10)
  const [textAmount, setTextAmount] = useState('Concise')
  
  const [imageSource, setImageSource] = useState('ai')
  const [isImageSourceDropdownOpen, setIsImageSourceDropdownOpen] = useState(false)
  const [mediaStyle, setMediaStyle] = useState('photo')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageStyleFilter, setImageStyleFilter] = useState('Suggested')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiThemes, setApiThemes] = useState([])
  const [deckPacks, setDeckPacks] = useState([])
  const [brandKits, setBrandKits] = useState([])
  const [selectedPackId, setSelectedPackId] = useState('')
  const [selectedBrandKitId, setSelectedBrandKitId] = useState('')
  const [workspaceHint, setWorkspaceHint] = useState(null)
  
  const outlineRef = useRef(null)

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
          const defaultKit = (kits || []).find((k) => k.isDefault) || (kits || [])[0]
          if (defaultKit?.id) setSelectedBrandKitId(String(defaultKit.id))
        }
      } catch (err) {
        if (!cancelled) setApiError(err.message || 'Could not load workspace for presentations')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialWorkspaceId, initialFolderId])
  
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

      // Only send themeId when it exists in the backend catalog — unknown ids are rejected (400).
      const catalogThemeIds = apiThemes
        .map((t) => String(t.id || t.themeId || ''))
        .filter(Boolean)
      const candidateThemeId = toApiThemeId(theme)
      const themeId = catalogThemeIds.includes(candidateThemeId) ? candidateThemeId : undefined

      const deckTitle = derivePresentationTitle(title)
      const packId = selectedPackId || null
      const brandKitId = selectedBrandKitId || null

      const created = await presentationService.createPresentation(ctx.workspaceId, {
        title: deckTitle,
        folderId: ctx.folderId,
        ...(themeId ? { themeId } : {}),
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

      const prompt = flattenPresentationPrompt({
        title,
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
          prompt,
          slideCount,
          density: mapDensity(textAmount),
          locale: 'en',
        }
      )

      const cards = normalizeOutlineSlides(outlinePayload)
      if (!cards.length) {
        throw new Error('Outline API returned no slides')
      }

      const config = {
        title: deckTitle,
        prompt: title,
        outline,
        tone,
        audience,
        purpose,
        style: selectedStyle,
        color: selectedColor,
        industries: selectedIndustries,
        baseTemplate,
        theme,
        backendThemeId: themeId || null,
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
        availableOptions: {
          voiceAndTone: TONES,
          audiences: AUDIENCES,
          purposes: PURPOSES,
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
    if (title.trim()) setStep(2)
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
      <main className="aig-main-fullscreen">
        
        {step === 1 && (
          <div className="aig-new-hero-section fade-in">
            {/* AI Mascot — slides in from top-right on page open */}
            <img
              src={aiMascot}
              alt="AI Mascot"
              className="aig-mascot-slide"
              aria-hidden="true"
            />
            <div className="aig-new-header">
              <span className="aig-new-greeting">Hi Creator</span>
              <h1 className="aig-new-title">What would you like to create?</h1>
              <p className="aig-new-subtitle">Use one of the common prompts below or write your own idea</p>
            </div>
            
            {!title.trim() && (
              <div className="aig-new-suggestions-grid">
                <div className="aig-new-suggestion-card" onClick={() => setTitle('Turn meeting notes into a presentation')}>
                  <FileText className="aig-suggestion-icon" size={24} />
                  <p>Turn meeting notes into a presentation</p>
                </div>
                <div className="aig-new-suggestion-card" onClick={() => setTitle('Summarize a research paper into key takeaways')}>
                  <BookOpen className="aig-suggestion-icon" size={24} />
                  <p>Summarize a research paper into key takeaways</p>
                </div>
                <div className="aig-new-suggestion-card" onClick={() => setTitle('Research industry trends')}>
                  <TrendingUp className="aig-suggestion-icon" size={24} />
                  <p>Research industry trends and market analysis</p>
                </div>
              </div>
            )}

            <div className={`aig-new-prompt-container ${title.trim() ? 'expanded' : ''}`}>
              {title.trim() && (
                <div className="aig-new-prompt-expanded fade-in">
                  <textarea 
                    ref={outlineRef}
                    className="aig-new-outline-input"
                    placeholder="Add an outline or notes to guide the AI (optional)..."
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    rows={3}
                  />
                  <div className="aig-new-tone-selector">
                    <span>Voice & Tone:</span>
                    <div className="aig-pill-grid">
                      {TONES.map(t => (
                        <button 
                          key={t}
                          className={`aig-pill-small ${tone === t ? 'active' : ''}`}
                          onClick={() => setTone(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="aig-new-tone-selector" style={{ marginTop: '16px' }}>
                    <span>Audience:</span>
                    <div className="aig-pill-grid">
                      {AUDIENCES.map(a => (
                        <button 
                          key={a}
                          className={`aig-pill-small ${audience === a ? 'active' : ''}`}
                          onClick={() => setAudience(a)}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="aig-new-tone-selector" style={{ marginTop: '16px' }}>
                    <span>Purpose:</span>
                    <div className="aig-pill-grid">
                      {PURPOSES.map(p => (
                        <button 
                          key={p}
                          className={`aig-pill-small ${purpose === p ? 'active' : ''}`}
                          onClick={() => setPurpose(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="aig-new-input-row">
                <button className="aig-attach-btn"><Paperclip size={20} /></button>
                <input 
                  className="aig-new-main-input"
                  placeholder="Ask whatever you want..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                  autoFocus
                />
                <button 
                  className={`aig-new-submit-btn ${title.trim() ? 'active' : ''}`}
                  onClick={handlePromptSubmit}
                  disabled={!title.trim()}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`aig-step aig-step--2 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
            <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
              <h2 className="aig-step-title">The Vibe</h2>
              <p className="aig-step-subtitle">Select a base template and color theme.</p>
            </div>
            


            <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
            <div className="aig-selection-section">
              <div className="aig-theme-filters" style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="aig-filter-dropdown-container">
                  <button
                    type="button"
                    className="aig-pill-dropdown-btn"
                    onClick={() =>
                      setActiveFilterDropdown(activeFilterDropdown === 'brandKit' ? null : 'brandKit')
                    }
                  >
                    <span>
                      {selectedBrandKitId
                        ? brandKits.find((k) => String(k.id) === String(selectedBrandKitId))?.name ||
                          'Brand Kit'
                        : 'Brand Kit (optional)'}
                    </span>{' '}
                    <ChevronDown size={14} />
                  </button>
                  {activeFilterDropdown === 'brandKit' && (
                    <div className="aig-filter-dropdown-menu">
                      <div
                        className="aig-filter-dropdown-item"
                        onClick={() => {
                          setSelectedBrandKitId('')
                          setActiveFilterDropdown(null)
                        }}
                      >
                        None
                      </div>
                      {brandKits.map((kit) => (
                        <div
                          key={kit.id}
                          className="aig-filter-dropdown-item"
                          onClick={() => {
                            setSelectedBrandKitId(String(kit.id))
                            setActiveFilterDropdown(null)
                          }}
                        >
                          {kit.name}
                          {kit.isDefault ? ' · Default' : ''}
                        </div>
                      ))}
                      {!brandKits.length && (
                        <div className="aig-filter-dropdown-item" style={{ opacity: 0.6 }}>
                          No brand kits yet
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="aig-filter-dropdown-container">
                  <button
                    type="button"
                    className="aig-pill-dropdown-btn"
                    onClick={() =>
                      setActiveFilterDropdown(activeFilterDropdown === 'deckPack' ? null : 'deckPack')
                    }
                  >
                    <span>
                      {selectedPackId
                        ? deckPacks.find((p) => String(p.id) === String(selectedPackId))?.name ||
                          'Deck Pack'
                        : 'Deck Pack (optional)'}
                    </span>{' '}
                    <ChevronDown size={14} />
                  </button>
                  {activeFilterDropdown === 'deckPack' && (
                    <div className="aig-filter-dropdown-menu">
                      <div
                        className="aig-filter-dropdown-item"
                        onClick={() => {
                          setSelectedPackId('')
                          setActiveFilterDropdown(null)
                        }}
                      >
                        None
                      </div>
                      {deckPacks.map((pack) => (
                        <div
                          key={pack.id}
                          className="aig-filter-dropdown-item"
                          onClick={() => {
                            setSelectedPackId(String(pack.id))
                            setActiveFilterDropdown(null)
                          }}
                        >
                          {pack.name}
                          {pack.slideCount ? ` · ${pack.slideCount} slides` : ''}
                        </div>
                      ))}
                      {!deckPacks.length && (
                        <div className="aig-filter-dropdown-item" style={{ opacity: 0.6 }}>
                          No deck packs available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="aig-filter-dropdown-container">
                  <button 
                    className="aig-pill-dropdown-btn" 
                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'style' ? null : 'style')}
                  >
                    <span>{selectedStyle || 'Style'}</span> <ChevronDown size={14} />
                  </button>
                  {activeFilterDropdown === 'style' && (
                    <div className="aig-filter-dropdown-menu">
                      {STYLE_OPTIONS.map(opt => (
                        <div 
                          key={opt} 
                          className="aig-filter-dropdown-item" 
                          onClick={() => { setSelectedStyle(opt); setActiveFilterDropdown(null); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="aig-filter-dropdown-container">
                  <button 
                    className="aig-pill-dropdown-btn"
                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'color' ? null : 'color')}
                  >
                    <span>{selectedColor || 'Color'}</span> <Palette size={14} />
                  </button>
                  {activeFilterDropdown === 'color' && (
                    <div className="aig-filter-dropdown-menu">
                      {COLOR_OPTIONS.map(opt => (
                        <div 
                          key={opt} 
                          className="aig-filter-dropdown-item" 
                          onClick={() => { setSelectedColor(opt); setActiveFilterDropdown(null); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="aig-filter-dropdown-container">
                  <button 
                    className="aig-pill-dropdown-btn"
                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'industry' ? null : 'industry')}
                  >
                    <span>{selectedIndustries.length > 0 ? `${selectedIndustries.length} Selected` : 'Industry'}</span> <Building size={14} />
                  </button>
                  {activeFilterDropdown === 'industry' && (
                    <div className="aig-filter-dropdown-menu">
                      {INDUSTRY_OPTIONS.map(opt => (
                        <div 
                          key={opt} 
                          className="aig-filter-dropdown-item"
                          onClick={() => {
                            if (selectedIndustries.includes(opt)) {
                              setSelectedIndustries(selectedIndustries.filter(i => i !== opt))
                            } else {
                              setSelectedIndustries([...selectedIndustries, opt])
                            }
                          }}
                        >
                          <div className={`aig-filter-checkbox ${selectedIndustries.includes(opt) ? 'checked' : ''}`}>
                            {selectedIndustries.includes(opt) && <Check size={12} strokeWidth={3} />}
                          </div>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="aig-section-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 className="aig-selection-label" style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Color Themes</h3>
                <button className="aig-view-more-btn" onClick={() => setIsThemeModalOpen(true)}>
                  <Palette size={14} /> View more
                </button>
              </div>

              <div className="aig-new-theme-grid-5">
                {THEMES.slice(0, 5).map(t => (
                  <button
                    key={t.id}
                    className={`aig-new-theme-card-premium ${theme === t.id ? 'active' : ''}`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div className="aig-theme-card-header">
                       <span className="aig-theme-card-title">{t.name}</span>
                       {theme === t.id && (
                         <div className="aig-theme-card-check">
                           <Check size={14} strokeWidth={3} color="#2563eb" />
                         </div>
                       )}
                    </div>
                    
                    <div className="aig-theme-card-palette">
                      <div className="palette-color" style={{ background: t.primary }}></div>
                      <div className="palette-color" style={{ background: t.secondary }}></div>
                      <div className="palette-color" style={{ background: t.accent }}></div>
                      <div className="palette-color" style={{ background: t.background }}></div>
                    </div>
                    
                    <div
                      className="aig-theme-card-image-wrapper aig-theme-card-mock"
                      style={{ background: t.background, borderColor: t.border }}
                    >
                      <div className="aig-theme-mock-bar" style={{ background: t.primary }} />
                      <div className="aig-theme-mock-title" style={{ background: t.text_primary }} />
                      <div className="aig-theme-mock-line" style={{ background: t.text_secondary }} />
                      <div className="aig-theme-mock-line short" style={{ background: t.text_secondary }} />
                      <div className="aig-theme-mock-row">
                        <div className="aig-theme-mock-chip" style={{ background: t.background_secondary, borderColor: t.border }} />
                        <div className="aig-theme-mock-chip" style={{ background: t.secondary }} />
                        <div className="aig-theme-mock-chip" style={{ background: t.accent }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Screen Size</h3>
              <div className="aig-selection-grid">
                {SCREEN_SIZES.map(s => (
                  <button 
                    key={s.id}
                    className={`aig-aspect-card ${screenSize === s.id ? 'active' : ''}`}
                    onClick={() => setScreenSize(s.id)}
                  >
                    <div className="aig-aspect-preview">
                       <div className="aig-aspect-box" style={{ aspectRatio: s.ratio }}></div>
                    </div>
                    <div className="aig-aspect-info">
                       <strong>{s.name}</strong>
                       <span>{s.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-or-divider">
              <span>OR select a full template</span>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Base Template</h3>
              <div className="aig-selection-grid aig-template-grid">
                {TEMPLATES.map(tmp => (
                  <button
                    key={tmp.id}
                    className={`aig-template-card ${baseTemplate === tmp.id ? 'active' : ''}`}
                    onClick={() => setBaseTemplate(tmp.id)}
                  >
                    <div className="aig-template-img-wrapper">
                      <img src={tmp.img} alt={tmp.name} className="aig-template-img" />
                      {baseTemplate === tmp.id && (
                        <div className="aig-template-check">
                          <Check size={16} strokeWidth={3} color="#ffffff" />
                        </div>
                      )}
                    </div>
                    <span className="aig-card-label">{tmp.name}</span>
                  </button>
                ))}
              </div>
            </div>
            </div>
            
          </div>
        )}

        {step === 3 && (
          <div className={`aig-step aig-step--3 ${stepReady ? 'aig-step-revealed' : 'aig-step-intro'}`}>
            <div className={`aig-step-header ${stepReady ? 'aig-header-settled' : 'aig-header-centered'}`}>
              <h2 className="aig-step-title">The Details</h2>
              <p className="aig-step-subtitle">Fine-tune the content and media.</p>
            </div>
            
            <div className={`aig-step-body ${stepReady ? 'aig-body-visible' : 'aig-body-hidden'}`}>
            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Slide Count</h3>
              <div className="aig-pill-grid">
                {SLIDE_COUNTS.map(count => (
                  <button 
                    key={count}
                    className={`aig-pill ${slides === count ? 'active' : ''}`}
                    onClick={() => setSlides(count)}
                  >
                    {count} Slides
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <div className="aig-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
          
                <h3 className="aig-selection-label" style={{ margin: 0 }}>Text content</h3>
              </div>
              
              
              <div className="aig-text-amount-grid">
                {TEXT_AMOUNTS.map(t => (
                  <button 
                    key={t.id}
                    className={`aig-text-card ${textAmount === t.id ? 'active' : ''}`}
                    onClick={() => setTextAmount(t.id)}
                  >
                    <div className="aig-text-preview">
                      {Array.from({ length: t.columns }).map((_, colIdx) => (
                        <div key={colIdx} className="aig-text-column">
                          {Array.from({ length: t.lines }).map((_, lineIdx) => (
                            <div key={lineIdx} className={`aig-text-line ${lineIdx === t.lines - 1 ? 'short' : ''}`}></div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <span className="aig-text-card-label">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="aig-selection-section">
              <h3 className="aig-selection-label">Image source</h3>
              <div className="aig-image-source-container">
                <button 
                  className={`aig-image-source-dropdown ${isImageSourceDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsImageSourceDropdownOpen(!isImageSourceDropdownOpen)}
                >
                  {(() => {
                    const activeSrc = IMAGE_SOURCES.find(s => s.id === imageSource) || IMAGE_SOURCES[0]
                    const Icon = activeSrc.icon
                    return (
                      <>
                        <Icon size={18} style={{ color: '#0f172a' }} /> {activeSrc.title}
                        {activeSrc.extra && <span className="aig-image-source-extra">{activeSrc.extra}</span>}
                        <span className="aig-image-source-chevron"><ChevronDown size={16} /></span>
                      </>
                    )
                  })()}
                </button>
                
                {isImageSourceDropdownOpen && (
                  <>
                    <div className="aig-dropdown-overlay" onClick={() => setIsImageSourceDropdownOpen(false)}></div>
                    <div className="aig-image-source-menu fade-in">
                      {IMAGE_SOURCES.map(src => {
                        const Icon = src.icon
                        return (
                          <button 
                            key={src.id}
                            className={`aig-iso-option ${imageSource === src.id ? 'active' : ''}`}
                            onClick={() => {
                              setImageSource(src.id)
                              setIsImageSourceDropdownOpen(false)
                            }}
                          >
                            <div className="aig-iso-icon"><Icon size={18} /></div>
                            <div className="aig-iso-text">
                              <span className="aig-iso-title">{src.title}</span>
                              {src.subtitle && <span className="aig-iso-subtitle">{src.subtitle}</span>}
                            </div>
                            {imageSource === src.id && <Check size={16} className="aig-iso-check" />}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              <h3 className="aig-selection-label" style={{ marginTop: '24px' }}>Art style</h3>
              
              <div className="aig-theme-filters" style={{ marginBottom: '16px' }}>
                {['Suggested', 'Photo', 'Illustration', 'Abstract'].map(f => (
                  <button 
                    key={f}
                    className={`filter-pill ${imageStyleFilter === f ? 'active' : ''}`}
                    onClick={() => setImageStyleFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="aig-art-style-inline-grid">
                {IMAGE_STYLES.slice(0, 4).map(style => (
                  <button
                    key={style.id}
                    className={`aig-image-style-card ${mediaStyle === style.id ? 'active' : ''}`}
                    onClick={() => setMediaStyle(style.id)}
                  >
                    <div className="aig-image-card-img-wrapper">
                      <img src={style.img} alt={style.name} />
                      {mediaStyle === style.id && (
                        <div className="aig-image-card-check-overlay">
                          <Check size={16} color="#ffffff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="aig-image-card-label">{style.name}</span>
                  </button>
                ))}
                
                {/* View More Card */}
                <button className="aig-image-style-card" onClick={() => setIsImageModalOpen(true)}>
                  <div className="aig-image-card-img-wrapper view-more-wrapper">
                     <div className="view-more-stack">
                        <img src={IMAGE_STYLES[5].img} className="stack-img-back" />
                        <img src={IMAGE_STYLES[6].img} className="stack-img-mid" />
                        <img src={IMAGE_STYLES[7].img} className="stack-img-front" />
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
                onClick={() => setStep(step + 1)}
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                className={`aig-btn-magic ${isGenerating ? 'loading' : ''}`}
                onClick={handleGenerateOutline}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="aig-spinner"></div>
                    Designing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Magic
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
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
        onSelectStyle={setMediaStyle}
      />
    </>
  )
}
