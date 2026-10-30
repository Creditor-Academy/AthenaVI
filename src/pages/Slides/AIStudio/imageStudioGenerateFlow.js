/** Pure Image Studio generate → tweak flow. Used by AIImageStudio; mock the API in tests. */

export const TWEAK_INSTRUCTION_MAX = 16000

export const TWEAK_REJECTED_MESSAGE =
  'Couldn’t apply that change. Use Retry on this message. Your reference images stay on this chat.'
export const GENERATE_REJECTED_MESSAGE =
  'Couldn’t generate from that prompt. Edit it and try again here. Don’t upload the references again.'

/** True for a 400 or a bare "Validation error" with no detail. */
export function isRejectedRequest(err) {
  if (Number(err?.status) === 400) return true
  const msg = String(err?.data?.message || err?.message || '').trim()
  return msg === 'Validation error'
}

export function canStartGenerate({ workspaceId, folderId, prompt, isGenerating } = {}) {
  if (!workspaceId || isGenerating) return { ok: false }
  if (!folderId) {
    return {
      ok: false,
      error: 'Pick a folder first. Image chats are saved in a workspace folder.',
    }
  }
  if (!String(prompt || '').trim()) {
    return { ok: false, error: 'Add a prompt to generate.' }
  }
  return { ok: true }
}

export function canApplyTweak({
  workspaceId,
  activeGeneration,
  instruction,
  isGenerating,
  supportsEdit,
  maxLen = TWEAK_INSTRUCTION_MAX,
} = {}) {
  const text = String(instruction || '').trim()
  if (!workspaceId || !activeGeneration?.id || !text || isGenerating) return { ok: false }
  if (supportsEdit === false) {
    return {
      ok: false,
      error: 'This model does not support image tweaks. Try regenerating instead.',
    }
  }
  if (text.length > maxLen) {
    return {
      ok: false,
      error: `Tweak instruction is too long. Maximum ${maxLen} characters allowed.`,
    }
  }
  return { ok: true, instruction: text }
}

export function buildImageGenerateBody({
  mode = 'image',
  folderId,
  modelId,
  formatId,
  styleId,
  prompt,
  infoLayout,
  styleHint,
  contextId,
} = {}) {
  const body = {
    mode,
    folderId,
    modelId,
    formatId: formatId || (mode === 'infographic' ? 'landscape' : 'square'),
    style: styleId,
    styleId,
    prompt: String(prompt || '').trim(),
  }
  if (mode === 'infographic') {
    if (infoLayout && infoLayout !== 'auto') body.archetypeHint = infoLayout
    const hint = String(styleHint || '').trim()
    if (hint) body.styleHint = hint
  }
  if (contextId) body.contextId = contextId
  return body
}

/** Live attach id, else the id saved on the generation (or its raw API row). */
export function resolveContextId(liveContext, generation) {
  return (
    liveContext?.id ||
    generation?.contextId ||
    generation?.request?.contextId ||
    generation?.raw?.contextId ||
    generation?.raw?.request?.contextId ||
    null
  )
}

export function createPendingTurn({ id, kind, text }) {
  return {
    id,
    kind,
    text,
    status: 'pending',
    generation: null,
    error: null,
  }
}

export function nextThreadIdFromResult(data, fallback = null) {
  return data?.thread?.id || data?.actions?.threadId || data?.generation?.threadId || fallback || null
}

export function applyGenerationToThread(thread, turnId, data) {
  const gen = data?.generation
  if (!gen) return { thread, generation: null, threadId: nextThreadIdFromResult(data) }
  return {
    thread: (thread || []).map((t) =>
      t.id === turnId ? { ...t, status: 'done', generation: gen, error: null } : t
    ),
    generation: gen,
    threadId: nextThreadIdFromResult(data),
  }
}

/**
 * One Image Studio path: start generate, then apply a tweak. Vendors are never called —
 * inject `api.generate` / `api.tweak`.
 */
export async function runGenerateThenTweak({
  api,
  workspaceId,
  generateInput,
  tweakInstruction,
  ids = { generate: 'turn_generate', tweak: 'turn_tweak' },
} = {}) {
  const start = canStartGenerate({
    workspaceId,
    folderId: generateInput?.folderId,
    prompt: generateInput?.prompt,
    isGenerating: false,
  })
  if (!start.ok) throw new Error(start.error || 'Cannot start generate')

  const body = buildImageGenerateBody(generateInput)
  let thread = [createPendingTurn({ id: ids.generate, kind: 'generate', text: body.prompt })]
  const generateData = await api.generate(workspaceId, body)
  let applied = applyGenerationToThread(thread, ids.generate, generateData)
  if (!applied.generation) throw new Error('Generate returned no generation')
  thread = applied.thread

  const tweak = canApplyTweak({
    workspaceId,
    activeGeneration: applied.generation,
    instruction: tweakInstruction,
    isGenerating: false,
  })
  if (!tweak.ok) throw new Error(tweak.error || 'Cannot apply tweak')

  thread = [...thread, createPendingTurn({ id: ids.tweak, kind: 'tweak', text: tweak.instruction })]
  const tweakData = await api.tweak(workspaceId, applied.generation.id, tweak.instruction)
  applied = applyGenerationToThread(thread, ids.tweak, tweakData)
  if (!applied.generation) throw new Error('Tweak returned no generation')

  return {
    thread: applied.thread,
    generation: applied.generation,
    generateData,
    tweakData,
  }
}
