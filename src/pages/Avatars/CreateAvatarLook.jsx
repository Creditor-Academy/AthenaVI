import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, Upload, Video, Wand2, ArrowRight, Palette } from 'lucide-react';
import { MdArrowBack } from 'react-icons/md';
import heygenService from '../../services/heygenService';
import {
  buildAvatarPresenterSeed,
  buildPersonalAvatarLookPrompt,
  extractHeygenList,
  LOOK_MAX_WAIT_MS,
  LOOK_POLL_INTERVAL_MS,
  LOOK_TYPICAL_WAIT_LABEL,
  mapLookTile,
  parseAvatarCreateResponse,
} from '../../utils/heygenAvatars';
import { HEYGEN_SOURCE_MAX_BYTES } from '../../utils/heygenAssetUpload';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';
import '../Videos/Videos.css';
import './Avatars.css';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REFERENCE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function formatElapsed(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function CreateAvatarLook({ context, onBack, onUseInVideo }) {
  const [lookName, setLookName] = useState('');
  const [lookPrompt, setLookPrompt] = useState('');
  const [referenceMode, setReferenceMode] = useState('preview');
  const [customFile, setCustomFile] = useState(null);
  const [customPreviewUrl, setCustomPreviewUrl] = useState(null);
  const [uploadedReferenceUrl, setUploadedReferenceUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [recentLooks, setRecentLooks] = useState([]);
  const [pendingLook, setPendingLook] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [processingPhase, setProcessingPhase] = useState('submitting');
  const pollAbortRef = useRef(false);
  const fileInputRef = useRef(null);

  const avatarGroupId = context?.groupId;
  const referenceImage = context?.previewImage || null;
  const avatarName = context?.name || 'Your avatar';
  const fromDigitalTwin = Boolean(context?.fromDigitalTwin);

  const displayReferenceImage =
    referenceMode === 'custom' && (customPreviewUrl || uploadedReferenceUrl)
      ? customPreviewUrl || uploadedReferenceUrl
      : referenceImage;

  const handleReferenceFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!REFERENCE_IMAGE_TYPES.includes(file.type)) {
      setError('Use a JPEG, PNG, or WebP image for the reference.');
      return;
    }
    if (file.size > HEYGEN_SOURCE_MAX_BYTES) {
      setError('Reference image is too large. Use a smaller file.');
      return;
    }

    setError('');
    setCustomFile(file);
    setUploadedReferenceUrl(null);
    setCustomPreviewUrl(URL.createObjectURL(file));
    setReferenceMode('custom');
  };

  const clearCustomReference = () => {
    setCustomFile(null);
    setUploadedReferenceUrl(null);
    if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl);
    setCustomPreviewUrl(null);
    setReferenceMode('preview');
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resolveReferenceImageUrl = async () => {
    if (referenceMode === 'preview') {
      if (!referenceImage) {
        throw new Error('Reference avatar image is not available yet. Open your avatar once its preview has loaded.');
      }
      return referenceImage;
    }

    if (uploadedReferenceUrl) return uploadedReferenceUrl;
    if (!customFile) {
      throw new Error('Upload a reference image or switch back to avatar preview.');
    }

    setUploadProgress(0);
    const result = await heygenService.uploadHeygenSourceFile(customFile, 'avatar', {
      onProgress: ({ percent }) => setUploadProgress(percent),
    });
    const url = result?.url || result?.file_url || result?.data?.url;
    if (!url) {
      throw new Error('Upload succeeded but no image URL was returned.');
    }
    setUploadedReferenceUrl(url);
    setUploadProgress(null);
    return url;
  };

  const handleUseLookInVideo = (look) => {
    if (!onUseInVideo || !look?.ready) return;
    const seed = buildAvatarPresenterSeed(
      {
        id: avatarGroupId,
        name: avatarName,
        image: referenceImage,
        previewImage: referenceImage,
      },
      look
    );
    onUseInVideo(seed);
  };

  const fetchLooksFromApi = useCallback(async () => {
    const res = await heygenService.getAvatarLooks({
      group_id: avatarGroupId,
      ownership: 'private',
      limit: 50,
    });
    const lookList = extractHeygenList(res, ['avatar_looks', 'looks', 'avatars']);
    return lookList
      .map((look) => mapLookTile(look, avatarName, referenceImage))
      .filter((look) => look.id);
  }, [avatarGroupId, avatarName, referenceImage]);

  useEffect(() => {
    if (!avatarGroupId) return undefined;
    let cancelled = false;

    fetchLooksFromApi()
      .then((looks) => {
        if (cancelled) return;
        setRecentLooks(looks);
      })
      .catch(() => {
        if (!cancelled) setRecentLooks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [avatarGroupId, fetchLooksFromApi]);

  useEffect(() => {
    pollAbortRef.current = false;
    return () => {
      pollAbortRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isProcessing) {
      setElapsedSec(0);
      return undefined;
    }
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isProcessing]);

  const pollUntilLookReady = async (lookId, savedName, knownIds) => {
    const started = Date.now();

    while (Date.now() - started < LOOK_MAX_WAIT_MS) {
      if (pollAbortRef.current) return null;

      setProcessingPhase('generating');
      setStatus('Generating your look…');

      const looks = await fetchLooksFromApi();
      setRecentLooks(looks);

      let match = lookId ? looks.find((look) => look.id === lookId) : null;
      if (!match) {
        match = looks.find((look) => !knownIds.has(look.id) && look.name === savedName);
      }
      if (!match && lookId) {
        match = looks.find((look) => look.id === lookId);
      }

      if (match?.ready && match.image) {
        return match;
      }

      if (match) {
        setProcessingPhase(match.ready ? 'finalizing' : 'generating');
        setPendingLook({
          id: match.id,
          name: match.name,
          image: match.image,
          processing: true,
        });
      }

      await sleep(LOOK_POLL_INTERVAL_MS);
    }

    return null;
  };

  const handleCreateLook = async () => {
    if (!avatarGroupId) {
      setError('Missing avatar id — go back and create your avatar again.');
      return;
    }

    if (!lookName.trim()) {
      setError('Give this look a name.');
      return;
    }

    if (!lookPrompt.trim()) {
      setError('Describe the outfit, setting, or style for this look.');
      return;
    }

    const savedName = lookName.trim();
    const fullPrompt = buildPersonalAvatarLookPrompt(lookPrompt, avatarName);
    const knownIds = new Set(recentLooks.map((look) => look.id));

    setIsProcessing(true);
    setError('');
    setProcessingPhase('submitting');
    setStatus('Submitting your look…');

    let resolvedReferenceUrl;
    try {
      resolvedReferenceUrl = await resolveReferenceImageUrl();
    } catch (uploadErr) {
      setError(uploadErr?.message || 'Failed to upload reference image');
      setIsProcessing(false);
      setUploadProgress(null);
      return;
    }

    setPendingLook({
      id: null,
      name: savedName,
      image: resolvedReferenceUrl,
      processing: true,
    });

    try {
      const response = await heygenService.createAvatarLook({
        name: savedName,
        prompt: fullPrompt,
        avatarGroupId,
        avatarId: context?.lookId || undefined,
        referenceImageUrl: resolvedReferenceUrl,
      });

      const created = parseAvatarCreateResponse(response, savedName);
      const newLookId = created.lookId;

      if (created.previewImage && created.lookId) {
        const optimistic = {
          id: created.lookId,
          name: savedName,
          image: created.previewImage,
          status: created.previewImage ? 'completed' : 'processing',
          ready: !!created.previewImage,
        };
        if (optimistic.ready) {
          setRecentLooks((prev) => [
            optimistic,
            ...prev.filter((look) => look.id !== optimistic.id),
          ]);
          setPendingLook(null);
          setStatus(`Look ready — added to your avatar.`);
          setLookName('');
          setLookPrompt('');
          setIsProcessing(false);
          return;
        }
        setPendingLook({ ...optimistic, processing: true });
      }

      setProcessingPhase('generating');
      setStatus('Generating preview…');

      const readyLook = await pollUntilLookReady(newLookId, savedName, knownIds);

      if (readyLook) {
        setRecentLooks((prev) => [
          readyLook,
          ...prev.filter((look) => look.id !== readyLook.id),
        ]);
        setPendingLook(null);
        setStatus('Look ready — you can use it in videos now.');
        setLookName('');
        setLookPrompt('');
      } else {
        const refreshed = await fetchLooksFromApi();
        setRecentLooks(refreshed);
        setPendingLook(null);
        setStatus(
          `Still processing after ${Math.round(LOOK_MAX_WAIT_MS / 60000)} minutes. Your look will appear in the sidebar when it finishes.`
        );
      }
    } catch (err) {
      setError(err?.message || 'Failed to create look');
      setStatus('');
      setPendingLook(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPct = Math.min(92, Math.round((elapsedSec / (LOOK_MAX_WAIT_MS / 1000)) * 100));
  const processingSteps = [
    { id: 'submitting', label: 'Submitted', detail: 'Reference image and avatar id sent' },
    { id: 'generating', label: 'Generating', detail: 'Matching your reference avatar' },
    { id: 'finalizing', label: 'Finalizing', detail: 'Preparing preview image' },
  ];
  const activeStepIndex =
    processingPhase === 'submitting' ? 0 : processingPhase === 'generating' ? 1 : 2;

  const sidebarLooks = pendingLook
    ? [pendingLook, ...recentLooks.filter((look) => look.id !== pendingLook.id)]
    : recentLooks;

  if (!avatarGroupId) {
    return (
      <div className="videos-page avatars-page create-avatar-page create-avatar-look-page">
        <div className="videos-shell">
          <header className="videos-page-header create-avatar-page-header">
            <div className="videos-title-section create-avatar-title-section">
              <div className="create-avatar-title-row">
                <button type="button" className="workspace-back-btn" onClick={onBack} aria-label="Back to Avatars">
                  <MdArrowBack size={20} />
                </button>
                <div>
                  <h1 className="videos-page-title">Create looks</h1>
                  <p className="videos-page-subtitle">No avatar selected for look creation.</p>
                </div>
              </div>
            </div>
          </header>
          <main className="videos-main create-avatar-main">
            <p className="creation-error-inline">No avatar selected for look creation.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-page avatars-page create-avatar-page create-avatar-look-page">
      <div className="videos-shell">
        <header className="videos-page-header create-avatar-page-header create-avatar-look-page__header">
          <div className="videos-title-section create-avatar-title-section">
            <div className="create-avatar-title-row">
              <button
                type="button"
                className="workspace-back-btn"
                onClick={onBack}
                disabled={isProcessing}
                aria-label="Back to Avatars"
              >
                <MdArrowBack size={20} />
              </button>
              <div>
                <p className="create-avatar-look-page__eyebrow">
                  <Palette size={14} />
                  <span>Avatar looks studio</span>
                </p>
                <h1 className="videos-page-title">Create looks for {avatarName}</h1>
                <p className="videos-page-subtitle">
                  Design outfits and scenes that keep the same person — your Digital Twin identity stays
                  locked while style changes.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="videos-main create-avatar-main">
          {fromDigitalTwin ? (
            <div className="avatar-look-welcome-banner" role="status">
              <div className="avatar-look-welcome-banner__icon">
                <Sparkles size={22} />
              </div>
              <div className="avatar-look-welcome-banner__copy">
                <strong>Your Digital Twin is ready — now define how {avatarName} appears on camera.</strong>
                <p>
                  Looks are the main way you&apos;ll use this avatar in videos. Generate a casual outfit, a
                  studio setup, or a branded scene — each look keeps the same face and voice.
                </p>
              </div>
              <Wand2 size={20} className="avatar-look-welcome-banner__accent" aria-hidden="true" />
            </div>
          ) : null}

          <div className="creation-content-wrapper avatar-look-layout avatar-look-workspace">
            <div className="creation-form-card standalone avatar-look-main-panel">
              {isProcessing ? (
              <div className="look-processing-panel">
                <div className="look-processing-panel__visual">
                  <div className="look-processing-panel__frame">
                    {pendingLook?.image ? (
                      <img src={pendingLook.image} alt={pendingLook.name} className="look-processing-panel__preview" />
                    ) : (
                      <div className="look-processing-panel__preview look-processing-panel__preview--empty">
                        <Sparkles size={32} />
                      </div>
                    )}
                    <div className="look-processing-panel__glow" aria-hidden="true" />
                    <div className="look-processing-panel__scan" aria-hidden="true" />
                  </div>
                  <span className="look-processing-panel__chip">
                    <Loader2 size={14} className="spin-animation" />
                    In progress
                  </span>
                </div>

                <div className="look-processing-panel__content">
                  <p className="look-processing-panel__eyebrow">Creating look</p>
                  <h3>{pendingLook?.name || 'Your new look'}</h3>
                  <p className="look-processing-panel__lead">
                    Generating a new style for <strong>{avatarName}</strong> using your reference avatar. The preview
                    will update here when it&apos;s ready.
                  </p>

                  <ol className="look-processing-steps" aria-label="Look generation progress">
                    {processingSteps.map((step, index) => {
                      const isDone = index < activeStepIndex;
                      const isActive = index === activeStepIndex;
                      return (
                        <li
                          key={step.id}
                          className={`look-processing-step${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}
                        >
                          <span className="look-processing-step__marker">
                            {isDone ? '✓' : index + 1}
                          </span>
                          <div className="look-processing-step__copy">
                            <strong>{step.label}</strong>
                            <span className="look-processing-step__detail">{step.detail}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="look-processing-progress">
                    <div className="look-processing-progress__track">
                      <div
                        className="look-processing-progress__fill"
                        style={{ width: `${Math.max(progressPct, isProcessing ? 8 : 0)}%` }}
                      />
                    </div>
                    <div className="look-processing-progress__meta">
                      <span>{formatElapsed(elapsedSec)} elapsed</span>
                      <span>Typical wait · {LOOK_TYPICAL_WAIT_LABEL}</span>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div className="form-body">
                  <section className="avatar-look-section">
                    <div className="avatar-look-section__head">
                      <span className="section-label">Reference image</span>
                      <div className="avatar-look-reference-mode">
                        <label className="avatar-look-reference-mode__option">
                          <input
                            type="radio"
                            name="referenceMode"
                            value="preview"
                            checked={referenceMode === 'preview'}
                            onChange={() => {
                              setReferenceMode('preview');
                              setError('');
                            }}
                          />
                          <span>Avatar preview</span>
                        </label>
                        <label className="avatar-look-reference-mode__option">
                          <input
                            type="radio"
                            name="referenceMode"
                            value="custom"
                            checked={referenceMode === 'custom'}
                            onChange={() => setReferenceMode('custom')}
                          />
                          <span>Custom upload</span>
                        </label>
                      </div>
                    </div>

                    <div className="avatar-look-reference">
                      <div className="avatar-look-reference__media">
                        {displayReferenceImage ? (
                          <img src={displayReferenceImage} alt={`${avatarName} reference`} />
                        ) : (
                          <div className="avatar-look-reference__placeholder">
                            <Sparkles size={28} />
                          </div>
                        )}
                        <span className="avatar-look-reference__tag">
                          {referenceMode === 'custom' ? 'Custom reference' : 'Reference avatar'}
                        </span>
                      </div>
                      <div className="avatar-look-reference__copy">
                        <span className="avatar-look-context__badge">Personal avatar</span>
                        <strong>{avatarName}</strong>
                        <p>
                          New looks use your reference image plus avatar group id. The prompt automatically
                          asks for the <strong>same person as the reference avatar</strong>.
                        </p>
                        {referenceMode === 'custom' ? (
                          <div className="avatar-look-reference-upload">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={REFERENCE_IMAGE_TYPES.join(',')}
                              className="avatar-look-reference-upload__input"
                              onChange={handleReferenceFileChange}
                            />
                            <button
                              type="button"
                              className="btn-action-secondary avatar-look-reference-upload__btn"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload size={16} />
                              <span>{customFile ? 'Change image' : 'Choose image'}</span>
                            </button>
                            {customFile ? (
                              <button
                                type="button"
                                className="avatar-look-reference-upload__clear"
                                onClick={clearCustomReference}
                              >
                                Use avatar preview instead
                              </button>
                            ) : null}
                            {uploadProgress != null ? (
                              <p className="avatar-look-reference-upload__progress">Uploading… {uploadProgress}%</p>
                            ) : null}
                            <p className="avatar-look-reference-upload__hint">JPEG, PNG, or WebP</p>
                          </div>
                        ) : null}
                        <div className="avatar-look-reference__ids">
                          <span>Avatar id · {avatarGroupId}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="avatar-look-section">
                    <span className="section-label">Look details</span>
                    <div className="input-group">
                      <label className="avatar-look-field-label" htmlFor="look-name">Look name</label>
                      <div className="input-with-counter">
                        <input
                          id="look-name"
                          type="text"
                          placeholder="e.g. Weekend coffee casual"
                          value={lookName}
                          maxLength={50}
                          onChange={(e) => setLookName(e.target.value)}
                        />
                        <span className="char-counter">{lookName.length}/50</span>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="avatar-look-field-label" htmlFor="look-description">Look description</label>
                      <textarea
                        id="look-description"
                        placeholder="Describe outfit, lighting, and setting only — e.g. oatmeal sweater, bright café window seat, soft morning light…"
                        value={lookPrompt}
                        onChange={(e) => setLookPrompt(e.target.value)}
                      />
                      <p className="avatar-look-prompt-hint">
                        We append identity instructions so the result matches your reference avatar&apos;s face and likeness.
                      </p>
                    </div>
                  </section>

                  <section className="avatar-look-section avatar-look-section--footer">
                    {error ? <p className="creation-error-inline">{error}</p> : null}
                    {status && !isProcessing ? <p className="creation-success-inline">{status}</p> : null}

                    <div className="creation-footer avatar-look-cta-footer">
                      <button type="button" className="submit-creation-btn-premium submit-creation-btn-premium--hero" onClick={handleCreateLook}>
                        <Sparkles size={18} />
                        <span>Generate look</span>
                        <ArrowRight size={16} className="creation-success-cta-arrow" />
                      </button>
                      <p className="cta-note">
                        Uses your reference image + avatar id · usually {LOOK_TYPICAL_WAIT_LABEL}
                      </p>
                    </div>
                  </section>
                </div>
              )}
            </div>

            <aside className="avatar-look-sidebar avatar-look-sidebar--premium">
            <div className="avatar-look-sidebar__head">
              <div>
                <p className="avatar-look-sidebar__eyebrow">Your library</p>
                <h4>Looks for {avatarName}</h4>
                <p>{sidebarLooks.length ? `${sidebarLooks.length} saved to this avatar` : 'No looks yet — your first style appears here'}</p>
              </div>
              {isProcessing ? (
                <span className="avatar-look-sidebar__live">
                  <span className="avatar-look-sidebar__live-dot" />
                  Live
                </span>
              ) : null}
            </div>

            {sidebarLooks.length > 0 ? (
              <div className="avatar-look-grid">
                {sidebarLooks.map((look) => (
                  <div
                    key={look.id || `pending-${look.name}`}
                    className={`avatar-look-tile${look.processing ? ' avatar-look-tile--processing' : ''}`}
                  >
                    <div className="avatar-look-tile__media">
                      {look.image ? (
                        <img src={look.image} alt={look.name} className={look.processing ? 'is-dimmed' : ''} />
                      ) : (
                        <div className="avatar-look-tile__skeleton" />
                      )}
                      {look.processing ? (
                        <div className="avatar-look-tile__overlay">
                          <Loader2 size={18} className="spin-animation" />
                          <span>Generating</span>
                        </div>
                      ) : null}
                    </div>
                    <span className="avatar-look-tile__label">{look.name}</span>
                    {look.ready && onUseInVideo ? (
                      <button
                        type="button"
                        className="avatar-look-tile__use-btn"
                        onClick={() => handleUseLookInVideo(look)}
                      >
                        <Video size={14} />
                        Use in video
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="avatar-look-sidebar__empty avatar-look-sidebar__empty--premium">
                <div className="avatar-look-sidebar__empty-icon">
                  <Wand2 size={24} />
                </div>
                <strong>Start your look library</strong>
                <p>Generate your first outfit or scene — previews appear here while they render.</p>
              </div>
            )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateAvatarLook;
