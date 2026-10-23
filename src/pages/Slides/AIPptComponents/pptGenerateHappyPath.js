/**
 * PPT wizard → outline → generate → READY → editor slides.
 * Inject a mock `api`; do not call live OpenAI/Gemini.
 */
import {
  buildPresentationGenerationPayload,
  buildThemeTokensFromPromptSuggestion,
  buildWizardThemeTokens,
  extractPresentationId,
  extractSlidesFromPresentation,
  normalizeOutlineSlides,
  outlineCardsToApiPayload,
  PROMPT_SUGGESTED_THEME_ID,
  toApiThemeId,
} from '../../../utils/presentationHelpers.js'

export function readDeckStatus(status) {
  return String(
    status?.status || status?.deckStatus || status?.deck?.status || ''
  ).toUpperCase()
}

export async function submitPptWizard({
  api,
  workspaceId,
  folderId,
  prompt,
  slideCount = 5,
  extraCreate = {},
  extraOutline = {},
} = {}) {
  const created = await api.createPresentation(workspaceId, {
    title: 'Untitled Presentation',
    folderId,
    locale: 'en',
    createMode: 'blank',
    ...extraCreate,
  })
  const presentationId = extractPresentationId(created)
  if (!presentationId) {
    throw new Error('Presentation was created but no id was returned')
  }

  const outlinePayload = await api.createOutline(workspaceId, presentationId, {
    source: 'prompt',
    prompt,
    slideCount,
    locale: 'en',
    ...extraOutline,
  })
  const outlineCards = normalizeOutlineSlides(outlinePayload)
  if (!outlineCards.length) {
    throw new Error('Outline API returned no slides')
  }

  return { presentationId, outlineCards, outlinePayload, created }
}

export async function startPptGenerateFromOutline({ api, session, config = {}, finalOutline } = {}) {
  const workspaceId = session?.workspaceId
  const presentationId = session?.presentationId
  if (!workspaceId || !presentationId) {
    throw new Error('Missing presentation session. Go back and generate the outline again.')
  }

  await api.updateOutline(
    workspaceId,
    presentationId,
    outlineCardsToApiPayload(finalOutline, {
      title: config.title,
      density: config.textAmount,
      locale: config.locale || 'en',
    })
  )

  const paletteMode =
    config.themeMode === 'palette' ||
    (!config.themeMode && !config.brandKitId && !config.packId)

  if (paletteMode) {
    const usesPromptPalette =
      config.theme === PROMPT_SUGGESTED_THEME_ID &&
      config.promptPaletteSuggestion?.themeTokens &&
      !config.promptPaletteSuggestion.fallback
    const wizardThemeTokens = usesPromptPalette
      ? buildThemeTokensFromPromptSuggestion(config.promptPaletteSuggestion)
      : buildWizardThemeTokens(config.theme, config.availableOptions?.colorThemes)
    if (!wizardThemeTokens) {
      throw new Error(
        'Selected color theme could not be applied. Re-open The Vibe and pick a palette again.'
      )
    }
    await api.setTheme?.(workspaceId, presentationId, {
      themeId: toApiThemeId(config.theme) || undefined,
      themeTokens: wizardThemeTokens,
    })
  } else if (
    toApiThemeId(config.backendThemeId) &&
    config.backendThemeId !== toApiThemeId(PROMPT_SUGGESTED_THEME_ID)
  ) {
    await api.setTheme?.(workspaceId, presentationId, {
      themeId: toApiThemeId(config.backendThemeId),
    })
  }

  await api.startGenerate(
    workspaceId,
    presentationId,
    buildPresentationGenerationPayload(config, {
      finalOutline,
      overwriteManualEdits: false,
    })
  )
}

export async function pollPptUntilReady({
  getStatus,
  workspaceId,
  presentationId,
  intervalMs = 0,
  timeoutMs = 10_000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  onProgress,
} = {}) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const status = await getStatus(workspaceId, presentationId)
    onProgress?.(status)
    const deckStatus = readDeckStatus(status)
    if (deckStatus === 'READY') return status
    if (deckStatus === 'FAILED') {
      const err = new Error(status?.message || status?.error || 'Presentation generation failed')
      err.status = 'FAILED'
      err.data = status
      throw err
    }
    await sleep(intervalMs)
  }
  throw new Error('Timed out waiting for presentation generation')
}

export function editorSlidesFromPresentation(presentation) {
  return extractSlidesFromPresentation(presentation)
}

export async function runPptGenerateHappyPath({ api, wizard, sleep } = {}) {
  const submitted = await submitPptWizard({
    api,
    workspaceId: wizard.workspaceId,
    folderId: wizard.folderId,
    prompt: wizard.prompt,
    slideCount: wizard.slideCount,
    extraCreate: wizard.extraCreate,
    extraOutline: wizard.extraOutline,
  })

  const config = wizard.config || {
    title: submitted.outlinePayload?.presentation?.title || 'Untitled Presentation',
    prompt: wizard.prompt,
    slides: wizard.slideCount,
    locale: 'en',
    themeMode: 'template',
  }

  await startPptGenerateFromOutline({
    api,
    session: {
      workspaceId: wizard.workspaceId,
      presentationId: submitted.presentationId,
    },
    config,
    finalOutline: submitted.outlineCards,
  })

  const status = await pollPptUntilReady({
    getStatus: api.getStatus,
    workspaceId: wizard.workspaceId,
    presentationId: submitted.presentationId,
    intervalMs: 0,
    sleep: sleep || (async () => {}),
  })

  const presentation = await api.getPresentation(wizard.workspaceId, submitted.presentationId)
  const slides = editorSlidesFromPresentation(presentation)
  if (!slides.length) throw new Error('Editor received no slides')

  return {
    presentationId: submitted.presentationId,
    outlineCards: submitted.outlineCards,
    status,
    presentation,
    slides,
  }
}
