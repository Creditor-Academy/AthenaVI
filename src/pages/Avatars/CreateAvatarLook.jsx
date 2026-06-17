import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import heygenService from '../../services/heygenService';
import {
  buildPersonalAvatarLookPrompt,
  extractHeygenList,
  LOOK_MAX_WAIT_MS,
  LOOK_POLL_INTERVAL_MS,
  LOOK_TYPICAL_WAIT_LABEL,
  mapLookTile,
  parseAvatarCreateResponse,
} from '../../utils/heygenAvatars';
import './Avatars.css';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatElapsed(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function CreateAvatarLook({ context, onBack }) {
  const [lookName, setLookName] = useState('');
  const [lookPrompt, setLookPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [recentLooks, setRecentLooks] = useState([]);
  const [pendingLook, setPendingLook] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [processingPhase, setProcessingPhase] = useState('submitting');
  const pollAbortRef = useRef(false);

  const avatarGroupId = context?.groupId;
  const referenceImage = context?.previewImage || null;
  const avatarName = context?.name || 'Your avatar';

  const fetchLooksFromApi = useCallback(async () => {
    const res = await heygenService.getAvatarLooks({ group_id: avatarGroupId, limit: 50 });
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

    if (!referenceImage) {
      setError('Reference avatar image is not available yet. Open your avatar from My Avatars once its preview has loaded.');
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
    setPendingLook({
      id: null,
      name: savedName,
      image: referenceImage,
      processing: true,
    });

    try {
      const response = await heygenService.createAvatarLook({
        name: savedName,
        prompt: fullPrompt,
        avatarGroupId,
        avatarId: context?.lookId || undefined,
        referenceImageUrl: referenceImage,
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
      <div className="workspace-main">
        <div className="grid-container">
          <button type="button" className="back-btn-sleek" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Back to Avatars</span>
          </button>
          <p className="creation-error-inline">No avatar selected for look creation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-main">
      <div className="grid-container">
        <header className="avatars-header">
          <div className="header-info">
            <button type="button" className="back-btn-sleek" onClick={onBack} disabled={isProcessing}>
              <ArrowLeft size={18} />
              <span>Back to Avatars</span>
            </button>
            <h1>Create looks for {avatarName}</h1>
            <p>
              Describe a new outfit or scene. We use your reference avatar image and personal avatar id so the
              generated look stays the same person — typically ready in {LOOK_TYPICAL_WAIT_LABEL}.
            </p>
          </div>
        </header>

        <div className="creation-content-wrapper avatar-look-layout">
          <div className="creation-form-card standalone">
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
                <div className="avatar-look-reference">
                  <div className="avatar-look-reference__media">
                    {referenceImage ? (
                      <img src={referenceImage} alt={`${avatarName} reference`} />
                    ) : (
                      <div className="avatar-look-reference__placeholder">
                        <Sparkles size={28} />
                      </div>
                    )}
                    <span className="avatar-look-reference__tag">Reference avatar</span>
                  </div>
                  <div className="avatar-look-reference__copy">
                    <span className="avatar-look-context__badge">Personal avatar</span>
                    <strong>{avatarName}</strong>
                    <p>
                      New looks use this reference image plus your avatar group id. The prompt automatically
                      asks for the <strong>same person as the reference avatar</strong>.
                    </p>
                    <div className="avatar-look-reference__ids">
                      <span>Avatar id · {avatarGroupId}</span>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="section-label">Look name</label>
                  <div className="input-with-counter">
                    <input
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
                  <label className="section-label">Look description</label>
                  <textarea
                    placeholder="Describe outfit, lighting, and setting only — e.g. oatmeal sweater, bright café window seat, soft morning light…"
                    value={lookPrompt}
                    onChange={(e) => setLookPrompt(e.target.value)}
                  />
                  <p className="avatar-look-prompt-hint">
                    We append identity instructions so the result matches your reference avatar&apos;s face and likeness.
                  </p>
                </div>

                {error ? <p className="creation-error-inline">{error}</p> : null}
                {status && !isProcessing ? <p className="creation-success-inline">{status}</p> : null}

                <div className="creation-footer">
                  <button type="button" className="submit-creation-btn-premium" onClick={handleCreateLook}>
                    <Sparkles size={18} />
                    <span>Generate look</span>
                  </button>
                  <p className="cta-note">Uses your reference image + avatar id · usually {LOOK_TYPICAL_WAIT_LABEL}</p>
                </div>
              </div>
            )}
          </div>

          <aside className="avatar-look-sidebar">
            <div className="avatar-look-sidebar__head">
              <div>
                <h4>Your looks</h4>
                <p>{sidebarLooks.length ? `${sidebarLooks.length} saved to this avatar` : 'No looks yet'}</p>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="avatar-look-sidebar__empty">
                <Sparkles size={22} />
                <p>Your first look will show up here while it generates.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CreateAvatarLook;
