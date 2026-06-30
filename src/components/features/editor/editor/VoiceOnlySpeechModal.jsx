import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  MdClose,
  MdRecordVoiceOver,
  MdPlayArrow,
  MdPause,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md'
import { Loader2 } from 'lucide-react'
import heygenService from '../../../../services/heygenService'
import { getSanitizedErrorMessage } from '../../../../utils/userFacingMessage'
import './VoiceOnlySpeechModal.css'

// Voice engines that are NOT compatible with the HeyGen TTS speech generation API.
// Voices using these engines will silently fail or throw "not supported" errors.
const UNSUPPORTED_TTS_ENGINES = ['STARFISH']

function isSupportedTtsVoice(rawVoice) {
  const engine = String(rawVoice?.voice_engine || rawVoice?.engine || rawVoice?.provider || '').toUpperCase()
  return engine === '' || !UNSUPPORTED_TTS_ENGINES.includes(engine)
}

const mapVoiceFromApi = (voice) => ({
  id: voice.voice_id || voice.voiceId || voice.id,
  name: voice.name || voice.voice_name || voice.display_name || 'AI Voice',
  gender: String(voice.gender || voice.sex || voice.voice_gender || '').trim() || 'Unknown',
  language:
    String(voice.language || voice.language_code || voice.language_name || voice.locale || '')
      .trim() || 'Unknown',
  previewUrl: voice.preview_audio_url || voice.preview_url || voice.preview_audio || null,
  engine: String(voice.voice_engine || voice.engine || voice.provider || '').toUpperCase() || null,
})

function normalizeGender(raw) {
  const v = String(raw || '').toLowerCase()
  if (v.startsWith('m')) return 'male'
  if (v.startsWith('f')) return 'female'
  return 'unknown'
}

export default function VoiceOnlySpeechModal({
  isOpen,
  onClose,
  initialScript = '',
  initialVoiceId = '',
  initialSpeed = 1,
  initialLocale = 'en-US',
  onGenerate,
}) {
  const [step, setStep] = useState('voice') // 'voice' | 'script'
  const [voices, setVoices] = useState([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [voiceSearch, setVoiceSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all') // all|male|female
  const [languageFilter, setLanguageFilter] = useState('all') // all|<lang>
  const [selectedVoiceId, setSelectedVoiceId] = useState(initialVoiceId || '')
  const [script, setScript] = useState(initialScript || '')
  const [speed, setSpeed] = useState(initialSpeed)
  const [locale, setLocale] = useState(initialLocale)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const previewAudioRef = useRef(null)
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null)
  const [previewLoadingVoiceId, setPreviewLoadingVoiceId] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setError('')
    setSubmitting(false)
    setStep('voice')
    setScript(initialScript || '')
    setSpeed(initialSpeed)
    setLocale(initialLocale)
    // If voices are already loaded (cached from a prior open), validate the initial
    // voice id immediately — if it was a STARFISH/unsupported voice it won't be in
    // the filtered list, so clear it and force the user to pick a supported one.
    if (voices.length > 0) {
      const isKnownSupported = voices.some((v) => v.id === initialVoiceId)
      setSelectedVoiceId(isKnownSupported ? (initialVoiceId || '') : '')
    } else {
      setSelectedVoiceId(initialVoiceId || '')
    }
  }, [isOpen, initialVoiceId, initialScript, initialSpeed, initialLocale])

  useEffect(() => {
    if (!isOpen) return
    if (voices.length) return
    let cancelled = false
    const load = async () => {
      setLoadingVoices(true)
      try {
        const responseData = await heygenService.getVoices({ type: 'public', limit: 100 })
        const list =
          responseData?.data?.voices ||
          responseData?.voices ||
          responseData?.data ||
          (Array.isArray(responseData) ? responseData : [])
        // Filter raw list first to drop unsupported TTS engines (e.g. STARFISH),
        // then map to our display shape.
        const supported = (Array.isArray(list) ? list : []).filter(isSupportedTtsVoice)
        const mapped = supported.map(mapVoiceFromApi).filter((v) => v.id)
        if (!cancelled) {
          setVoices(mapped)
          // If the pre-selected voice (from the scene) is a STARFISH/unsupported voice it
          // won't exist in the filtered list — clear it so the user must pick a valid one.
          setSelectedVoiceId((prev) => {
            if (!prev) return prev
            const exists = mapped.some((v) => v.id === prev)
            if (!exists) {
              return ''
            }
            return prev
          })
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load voices. Check your connection.')
      } finally {
        if (!cancelled) setLoadingVoices(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isOpen, voices.length])

  const languageOptions = useMemo(() => {
    const set = new Set()
    voices.forEach((v) => {
      if (v.language && v.language !== 'Unknown') set.add(v.language)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [voices])

  const filteredVoices = useMemo(() => {
    const q = voiceSearch.trim().toLowerCase()
    return voices.filter((v) => {
      const matchesSearch = !q || v.name.toLowerCase().includes(q)
      const g = normalizeGender(v.gender)
      const matchesGender =
        genderFilter === 'all' ? true : genderFilter === g
      const matchesLang =
        languageFilter === 'all' ? true : v.language === languageFilter
      return matchesSearch && matchesGender && matchesLang
    })
  }, [voices, voiceSearch, genderFilter, languageFilter])

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current = null
    }
    setPreviewingVoiceId(null)
    setPreviewLoadingVoiceId(null)
  }

  const playPreview = async (voice) => {
    if (!voice?.id) return
    if (previewingVoiceId === voice.id) {
      stopPreview()
      return
    }

    stopPreview()
    setPreviewLoadingVoiceId(voice.id)
    try {
      let audioUrl = voice.previewUrl
      if (!audioUrl) {
        const res = await heygenService.previewSpeech({
          text: 'Hello! This is a quick preview of how this voice sounds.',
          voice_id: voice.id,
        })
        audioUrl = res?.preview_audio_url || res?.audio_url || res?.url
      }
      if (!audioUrl) throw new Error('Preview not available')
      const audio = new Audio(audioUrl)
      previewAudioRef.current = audio
      audio.onended = () => {
        setPreviewingVoiceId(null)
        previewAudioRef.current = null
      }
      await audio.play()
      setPreviewingVoiceId(voice.id)
    } catch (err) {
      setError('Could not play voice preview.')
      stopPreview()
    } finally {
      setPreviewLoadingVoiceId(null)
    }
  }

  const handleClose = () => {
    stopPreview()
    onClose?.()
  }

  const handleGenerate = async () => {
    setError('')
    const trimmed = script.trim()
    if (!selectedVoiceId) {
      setError('Select a voice first.')
      return
    }
    // Guard: reject voices from unsupported TTS engines (e.g. STARFISH) that may have
    // been stored on the scene from an earlier avatar-creation step.
    const resolvedVoice = voices.find((v) => v.id === selectedVoiceId)
    const isUnsupported =
      resolvedVoice
        ? UNSUPPORTED_TTS_ENGINES.includes(resolvedVoice.engine)
        : false
    if (isUnsupported) {
      setError('This voice is not supported for speech generation. Please select a different voice.')
      setStep('voice')
      setSelectedVoiceId('')
      return
    }
    if (!trimmed) {
      setError('Write a script first.')
      return
    }
    setSubmitting(true)
    try {
      await onGenerate?.({
        voiceId: selectedVoiceId,
        script: trimmed,
        speed,
        locale,
        inputType: 'text',
      })
      handleClose()
    } catch (err) {
      setError(getSanitizedErrorMessage(err, 'Speech generation failed.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId)
  const canContinue = !!selectedVoiceId

  return (
    <div
      className="vos-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className="vos-modal"
      >
        <div
          className="vos-head"
        >
          <div style={{ minWidth: 0 }}>
            <div className="vos-title">
              <MdRecordVoiceOver size={18} />
              Voice-only narration
            </div>
            <div className="vos-subtitle">
              {step === 'voice'
                ? 'Pick a voice for narration (no avatar).'
                : 'Write the script and generate MP3 narration for this scene.'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="vos-close"
            aria-label="Close"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="vos-content">
          <div className="vos-stepbar">
            <div style={{ minWidth: 0 }}>
              <div className="vos-stepbar-title">{step === 'voice' ? 'Step 1: Choose voice' : 'Step 2: Write script'}</div>
              <div className="vos-stepbar-subtitle">
                {step === 'voice'
                  ? 'Filter voices and pick one to continue.'
                  : 'Generate a narration MP3 for this scene.'}
              </div>
            </div>
            <div className="vos-step-pills" aria-hidden={submitting}>
              <button
                type="button"
                className={`vos-step ${step === 'voice' ? 'active' : ''}`}
                onClick={() => setStep('voice')}
                disabled={submitting}
              >
                1. Voice
              </button>
              <button
                type="button"
                className={`vos-step ${step === 'script' ? 'active' : ''}`}
                onClick={() => canContinue && setStep('script')}
                disabled={!canContinue || submitting}
              >
                2. Script
              </button>
            </div>
          </div>

          {step === 'voice' ? (
            <div className="vos-step1-grid">
              <div className="vos-list-pane">
                <div className="vos-list-scroll premium-scrollbar">
                  {loadingVoices ? (
                    <div style={{ padding: 14, color: 'var(--text-muted)', fontSize: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Loader2 size={16} className="qc-spinner" />
                      Loading voices…
                    </div>
                  ) : (
                    <>
                      {filteredVoices.map((voice) => {
                        const selected = voice.id === selectedVoiceId
                        const previewing = previewingVoiceId === voice.id
                        const loadingPreview = previewLoadingVoiceId === voice.id
                        return (
                          <div
                            key={voice.id}
                            className={`vos-voice-row ${selected ? 'vos-voice-row--selected' : ''}`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedVoiceId(voice.id)}
                              className="vos-voice-pick"
                            >
                              <div className="vos-voice-name">{voice.name}</div>
                              <div className="vos-voice-meta">
                                {voice.gender} · {voice.language}
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => playPreview(voice)}
                              disabled={loadingPreview}
                              className={`vos-preview-btn ${previewing ? 'vos-preview-btn--playing' : ''}`}
                              aria-label={previewing ? `Stop preview for ${voice.name}` : `Preview ${voice.name}`}
                            >
                              {loadingPreview ? (
                                <Loader2 size={16} />
                              ) : previewing ? (
                                <MdPause size={18} />
                              ) : (
                                <MdPlayArrow size={18} />
                              )}
                            </button>
                          </div>
                        )
                      })}
                      {!loadingVoices && filteredVoices.length === 0 && (
                        <div className="vos-empty">
                          No voices match your filters.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="vos-side-pane">
                <div className="vos-filters">
                  <input
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                    placeholder="Search voices..."
                    className="vos-input"
                  />
                  <select
                    className="vos-input"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    aria-label="Filter by gender"
                  >
                    <option value="all">Gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                  <select
                    className="vos-input"
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    aria-label="Filter by language"
                  >
                    <option value="all">Language</option>
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vos-right-card">
                  <div className="vos-label">Selected voice</div>
                  <div className="vos-value">{selectedVoice?.name || 'Not selected'}</div>
                  <div className="vos-hint">
                    {selectedVoice
                      ? `${selectedVoice.gender} · ${selectedVoice.language}`
                      : 'Pick a voice from the list to continue.'}
                  </div>

                  {error ? <div className="vos-error" style={{ marginTop: 10 }}>{error}</div> : null}
                </div>

                <div className="vos-footer">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="vos-btn vos-btn--ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedVoiceId) {
                        setError('Select a voice first.')
                        return
                      }
                      setError('')
                      setStep('script')
                    }}
                    disabled={!canContinue || submitting}
                    className="vos-btn vos-btn--primary"
                  >
                    Continue <MdChevronRight size={18} style={{ marginLeft: 6, verticalAlign: -4 }} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="vos-script-full" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="vos-fields">
              <div className="vos-field">
                <div className="vos-label">Voice</div>
                <div className="vos-value">{selectedVoice?.name || 'Not selected'}</div>
              </div>
              <div className="vos-field vos-field--tight">
                <div className="vos-label">Speed</div>
                <input
                  type="number"
                  value={speed}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="vos-input"
                />
              </div>
              <div className="vos-field vos-field--tight" style={{ flexBasis: 160 }}>
                <div className="vos-label">Locale</div>
                <input
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  placeholder="en-US"
                  className="vos-input"
                />
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div className="vos-label" style={{ marginBottom: 0 }}>
                  Script
                </div>
                <div className="vos-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                  {script.length} / 5000
                </div>
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                maxLength={5000}
                placeholder="Write narration for this scene..."
                className="vos-textarea premium-scrollbar"
              />
            </div>

            {error ? (
              <div className="vos-error">{error}</div>
            ) : null}

            <div className="vos-footer">
              <button
                type="button"
                onClick={() => setStep('voice')}
                disabled={submitting}
                className="vos-btn vos-btn--ghost"
              >
                <MdChevronLeft size={18} style={{ marginRight: 6, verticalAlign: -4 }} />
                Back
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="vos-btn vos-btn--ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={submitting || !selectedVoiceId || !script.trim()}
                className="vos-btn vos-btn--primary"
              >
                {submitting ? 'Generating…' : 'Generate narration'}
              </button>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

