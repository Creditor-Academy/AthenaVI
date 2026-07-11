/**
 * Shared HeyGen voice mapping and preview helpers.
 */

export const CLONE_PREVIEW_TOOLTIP =
  "Custom speech preview isn't available for cloned voices. Use the sample audio or pick a designed/catalog voice.";

export const SPEECH_PREVIEW_UNSUPPORTED_MESSAGE =
  "This voice doesn't support custom speech preview. Choose a Starfish-compatible voice from the catalog, or use it in avatar video.";

export const VOICE_PREVIEW_NOTICE_REASONS = {
  NO_SAMPLE: 'no_sample',
  NO_SPEECH_PREVIEW: 'no_speech_preview',
  CLONED: 'cloned',
};

export function getVoicePreviewUrlFromResponse(res) {
  if (!res) return null;
  return (
    res.preview_audio_url ||
    res.previewAudioUrl ||
    res.audio_url ||
    res.url ||
    null
  );
}

export function mapHeygenVoice(voice, extras = {}) {
  if (!voice) return null;
  return {
    id: voice.voice_id || voice.voiceId || voice.id,
    name: voice.name || voice.voice_name || voice.display_name || 'Voice',
    gender: voice.gender || voice.sex || voice.voice_gender || '',
    language:
      voice.language ||
      voice.language_code ||
      voice.language_name ||
      voice.locale ||
      'English',
    status: voice.status || null,
    previewUrl:
      voice.previewAudioUrl ||
      voice.preview_audio_url ||
      voice.preview_url ||
      voice.preview_audio ||
      null,
    supportsSpeechPreview:
      voice.supportsSpeechPreview ??
      voice.supports_speech_preview ??
      voice.supports_starfish_tts ??
      false,
    source: voice.source ?? null,
    engine:
      String(voice.voice_engine || voice.engine || voice.provider || '').toUpperCase() ||
      null,
    raw: voice,
    ...extras,
  };
}

export function extractHeygenVoiceList(result) {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.voices)) return result.voices;
  if (result?.data && Array.isArray(result.data.voices)) return result.data.voices;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result && Array.isArray(result.list)) return result.list;
  return [];
}

/** Prefer private/cloned voices first; dedupe by voice id. */
export function mergeHeygenVoiceLists(...lists) {
  const seen = new Set();
  const merged = [];

  for (const list of lists) {
    for (const voice of list || []) {
      const id = voice?.voice_id || voice?.voiceId || voice?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(voice);
    }
  }

  return merged;
}

/** Exclude voices that are still processing or failed cloning. */
export function isVoiceReadyForSelection(voice) {
  const status = String(voice?.status || '').toLowerCase();
  return status !== 'processing' && status !== 'failed';
}

export function isSpeechPreviewSupportedVoice(voice) {
  return voice?.supportsSpeechPreview === true;
}

export function isClonedVoice(voice) {
  const source = String(voice?.source || voice?.raw?.source || '').toLowerCase();
  return source === 'clone';
}

export function getVoicePreviewNoticeReason(voice) {
  if (isClonedVoice(voice)) return VOICE_PREVIEW_NOTICE_REASONS.CLONED;
  if (voice?.supportsSpeechPreview === false) return VOICE_PREVIEW_NOTICE_REASONS.NO_SPEECH_PREVIEW;
  return VOICE_PREVIEW_NOTICE_REASONS.NO_SAMPLE;
}

export function getVoicePreviewUnavailableMessage(voiceName, reason = VOICE_PREVIEW_NOTICE_REASONS.NO_SAMPLE) {
  switch (reason) {
    case VOICE_PREVIEW_NOTICE_REASONS.CLONED:
      return {
        title: 'Preview not available',
        description: voiceName
          ? `${voiceName} is a cloned voice with no playable sample. You can still use it for avatar video narration.`
          : 'This cloned voice has no playable sample. You can still use it for avatar video narration.',
      };
    case VOICE_PREVIEW_NOTICE_REASONS.NO_SPEECH_PREVIEW:
      return {
        title: 'Preview not available',
        description: SPEECH_PREVIEW_UNSUPPORTED_MESSAGE,
      };
    default:
      return {
        title: 'Preview not available',
        description: voiceName
          ? `We can't play a sample for ${voiceName} right now, but you can still select and use it in your project.`
          : "We can't play a sample right now, but you can still select and use this voice in your project.",
      };
  }
}

export function getVoicePreviewUnavailableShortCopy() {
  return {
    shortLabel: 'No preview for this voice',
    ariaLabel:
      'No preview available for this voice. You can still select and use it in your project.',
  };
}

/**
 * Resolve an audio URL for voice preview.
 *
 * @param {'sample'|'custom'} mode
 *   - sample: play fixed previewAudioUrl only (picker play buttons)
 *   - custom: preview-speech when supportsSpeechPreview + text; falls back to sample
 */
export async function resolveVoicePreviewAudioUrl(
  voice,
  { text, previewSpeechFn, isSpeechPreviewUnsupportedError, mode = 'sample' } = {}
) {
  if (!voice?.id) return null;

  const staticUrl = voice.previewUrl || null;

  if (mode === 'sample') {
    return staticUrl;
  }

  if (staticUrl && !text?.trim()) {
    return staticUrl;
  }

  if (!voice.supportsSpeechPreview) {
    return staticUrl;
  }

  if (text?.trim() && previewSpeechFn) {
    try {
      const res = await previewSpeechFn({
        text: text.trim(),
        voice_id: voice.id,
        input_type: 'text',
        speed: 1,
      });
      return getVoicePreviewUrlFromResponse(res) || staticUrl || null;
    } catch (err) {
      if (isSpeechPreviewUnsupportedError?.(err)) {
        return staticUrl || null;
      }
      throw err;
    }
  }

  return staticUrl;
}

export async function playAudioUrl(url) {
  if (!url) throw new Error('No preview audio available');
  const audio = new Audio(url);
  await audio.play();
  return audio;
}
