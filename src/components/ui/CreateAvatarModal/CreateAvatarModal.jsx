import { useEffect, useRef, useState } from 'react';
import { Terminal, Upload, X, CheckCircle2, CheckCircle, ArrowRight, Wand2, Loader2 } from 'lucide-react';
import { MdClose } from 'react-icons/md';
import heygenService from '../../../services/heygenService';
import creditsService, { isInsufficientCreditsError } from '../../../services/creditsService';
import {
  AVATAR_TRAINING_MAX_WAIT_MS,
  AVATAR_TRAINING_POLL_INTERVAL_MS,
  AVATAR_TRAINING_TYPICAL_LABEL,
  getConsentUrlFromResponse,
  isAvatarReadyForLooks,
  isConsentApproved,
  parseAvatarCreateResponse,
} from '../../../utils/heygenAvatars';
import { WORKSPACE_ASSET_MAX_BYTES } from '../../../utils/heygenAssetUpload';
import {
  extractCreditsUsed,
  formatCreditsPlain,
  hasEnoughCreditsForAvatar,
  resolveAvatarCreateCreditCost,
} from '../../../utils/creditTransactions';
import { getSanitizedErrorMessage } from '../../../utils/userFacingMessage';
import AvatarConsentStep from '../AvatarConsentStep/AvatarConsentStep';
import DigitalTwinVideoInput from './DigitalTwinVideoInput';
import DigitalTwinProgressPanel from './DigitalTwinProgressPanel';
import '../AvatarConsentStep/AvatarConsentStep.css';
import '../../../pages/Avatars/Avatars.css';
import './CreateAvatarModal.css';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DIGITAL_TWIN_STEPS = [
  { number: 1, label: 'Training video' },
  { number: 2, label: 'Consent video' },
  { number: 3, label: 'Ready' },
];

function getDigitalTwinActiveStep(phase) {
  if (phase === 'ready') return 3;
  if (phase === 'training') return 3;
  if (phase === 'consent') return 2;
  return 1;
}

function DigitalTwinStepIndicator({ activeStep }) {
  return (
    <nav className="create-avatar-steps" aria-label="Digital Twin creation progress">
      {DIGITAL_TWIN_STEPS.map((step) => {
        const isCompleted = step.number < activeStep;
        const isActive = step.number === activeStep;

        return (
          <div
            key={step.number}
            className={`create-avatar-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <span className="create-avatar-step-number">
              {isCompleted ? <CheckCircle size={14} /> : step.number}
            </span>
            <span className="create-avatar-step-label">{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function CreateAvatarModal({ isOpen, typeOption, onClose, onCreateLooks, onCompleted }) {
  const creationType = typeOption?.id || 'digital_twin';
  const [creationName, setCreationName] = useState('');
  const [creationPrompt, setCreationPrompt] = useState('');
  const [creationPhase, setCreationPhase] = useState('form');
  const [creationStatus, setCreationStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(null);
  const [consentStep, setConsentStep] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [creditEstimate, setCreditEstimate] = useState(null);
  const [personalCredits, setPersonalCredits] = useState(null);
  const [creditsInfoLoading, setCreditsInfoLoading] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(null);
  const fileInputRef = useRef(null);
  const pollAbortRef = useRef(false);
  const wasOpenRef = useRef(false);
  const openTypeRef = useRef(null);

  const isBusy = creationPhase !== 'form' && creationPhase !== 'ready' && creationPhase !== 'consent';

  const resetCreationState = () => {
    setCreationName('');
    setCreationPrompt('');
    setCreationPhase('form');
    setCreationStatus('');
    setPreviewUrl(null);
    setSelectedFile(null);
    setShowHelpModal(false);
    setCreationSuccess(null);
    setConsentStep(null);
    setUploadProgress(null);
    setCreditEstimate(null);
    setPersonalCredits(null);
    setCreditsUsed(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (!isOpen) {
      pollAbortRef.current = true;
      wasOpenRef.current = false;
      openTypeRef.current = null;
      return undefined;
    }

    pollAbortRef.current = false;

    const typeKey = typeOption?.id || creationType;
    const isFreshOpen = !wasOpenRef.current;
    const isNewType = openTypeRef.current != null && openTypeRef.current !== typeKey;

    if (isFreshOpen || isNewType) {
      resetCreationState();
      openTypeRef.current = typeKey;
    }

    wasOpenRef.current = true;

    return () => {
      pollAbortRef.current = true;
    };
  }, [isOpen, typeOption?.id, creationType]);

  useEffect(() => {
    if (!isOpen) {
      setCreditEstimate(null);
      setPersonalCredits(null);
      setCreditsInfoLoading(false);
      return undefined;
    }

    let cancelled = false;
    setCreditsInfoLoading(true);

    Promise.all([
      creditsService.getPersonalEstimate({ feature: 'avatar_create' }),
      creditsService.getPersonalBalance(),
    ])
      .then(([estimate, balance]) => {
        if (cancelled) return;
        setCreditEstimate(estimate);
        setPersonalCredits(balance?.personalCredits ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setCreditEstimate(null);
          setPersonalCredits(null);
        }
      })
      .finally(() => {
        if (!cancelled) setCreditsInfoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, creationType]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && creationPhase === 'form') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, creationPhase, onClose]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearPreview = (event) => {
    event?.stopPropagation?.();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoReady = ({ file, previewUrl: url }) => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const mergeAvatarMeta = (base, group) => {
    if (!group) return base;
    const parsed = parseAvatarCreateResponse({ avatar_group: group }, base.name || creationName);
    return {
      ...base,
      ...parsed,
      previewImage: parsed.previewImage || base.previewImage || null,
    };
  };

  const resolveAvatarCreditsUsed = async (response, requiredCredits) => {
    const fromResponse = extractCreditsUsed(response);
    if (fromResponse) return fromResponse;
    try {
      const recent = await creditsService.resolveRecentUsageCredits(null, { withinMs: 180000 });
      if (recent) return recent;
    } catch {
      // fall through to estimate
    }
    return requiredCredits;
  };

  const attachCreditsUsed = (meta, used) => ({
    ...meta,
    creditsUsed: used ?? creditsUsed ?? null,
  });

  const waitForAvatarTraining = async (meta, usedCredits = creditsUsed) => {
    const groupId = meta.groupId;
    if (!groupId) {
      setCreationSuccess(attachCreditsUsed({ ...meta, fromDigitalTwin: creationType === 'digital_twin' }, usedCredits));
      setCreationPhase('ready');
      setCreationStatus('');
      return;
    }

    setCreationPhase('training');
    setCreationStatus('Building your Digital Twin…');

    const started = Date.now();
    let latest = meta;

    while (Date.now() - started < AVATAR_TRAINING_MAX_WAIT_MS) {
      if (pollAbortRef.current) return;

      try {
        const group = await heygenService.getAvatarGroup(groupId);
        if (group) {
          latest = mergeAvatarMeta(latest, group);
          if (isAvatarReadyForLooks(group)) {
            setCreationSuccess(attachCreditsUsed({ ...latest, fromDigitalTwin: creationType === 'digital_twin' }, usedCredits));
            setCreationPhase('ready');
            setCreationStatus('');
            return;
          }
          const training = String(group?.status ?? group?.training_status ?? '').toLowerCase();
          if (training === 'processing' || training === 'training') {
            setCreationStatus('Training your Digital Twin — almost there…');
          }
        }
      } catch (pollErr) {
        console.warn('Avatar training poll failed', pollErr);
      }

      await sleep(AVATAR_TRAINING_POLL_INTERVAL_MS);
    }

    setCreationSuccess(attachCreditsUsed({
      ...latest,
      fromDigitalTwin: creationType === 'digital_twin',
      trainingTimedOut: true,
    }, usedCredits));
    setCreationPhase('ready');
    setCreationStatus('');
  };

  const finishWithSuccess = async (response, consentMeta = null, usedCredits = creditsUsed) => {
    const created = parseAvatarCreateResponse(response, creationName);
    if (!created.groupId) {
      setCreationStatus('Persona created, but we could not read the avatar id. Check My Avatars.');
      setTimeout(() => {
        setCreationPhase('form');
        onCompleted?.(true);
        onClose?.();
      }, 2500);
      return;
    }

    const merged = {
      ...created,
      consentUrl: consentMeta?.consentUrl ?? created.consentUrl ?? null,
      consentStatus: consentMeta?.consentStatus ?? created.consentStatus ?? null,
      trainingStatus: consentMeta?.trainingStatus ?? created.trainingStatus ?? null,
    };

    if (creationType === 'digital_twin' && !isConsentApproved(merged)) {
      setConsentStep(merged);
      setCreationPhase('consent');
      setCreationStatus('');
      return;
    }

    if (creationType === 'digital_twin') {
      await waitForAvatarTraining(merged, usedCredits);
      return;
    }

    setCreationSuccess(attachCreditsUsed(merged, usedCredits));
    setCreationPhase('ready');
    setCreationStatus('');
  };

  const handleConsentComplete = async () => {
    if (!consentStep) return;
    const approved = { ...consentStep, consentStatus: 'approved' };
    setConsentStep(null);
    await waitForAvatarTraining(approved);
  };

  const handleCreateAvatar = async () => {
    if (!creationName) {
      alert('Please provide a name for your avatar.');
      return;
    }

    if (creationType === 'prompt' && !creationPrompt) {
      alert('Please provide a prompt for your avatar.');
      return;
    }

    if (creationType !== 'prompt' && !selectedFile) {
      alert('Please select a file (image or video) for your avatar.');
      return;
    }

    if (
      creationType !== 'prompt' &&
      selectedFile.size > WORKSPACE_ASSET_MAX_BYTES &&
      !(await heygenService.isHeygenUploadRouteAvailable('avatar'))
    ) {
      setCreationStatus(heygenService.formatLargeUploadBlockedMessage(selectedFile.size));
      return;
    }

    const requiredCredits = resolveAvatarCreateCreditCost(creditEstimate);
    if (!hasEnoughCreditsForAvatar(personalCredits, requiredCredits)) {
      return;
    }

    setCreationPhase(creationType === 'digital_twin' ? 'uploading' : 'creating');
    setCreationStatus('Preparing asset upload...');
    setUploadProgress(null);

    try {
      let response;

      if (creationType === 'prompt') {
        response = await heygenService.createAvatar({
          type: 'prompt',
          name: creationName,
          prompt: creationPrompt,
        });
      } else {
        setCreationStatus('Uploading training file...');
        response = await heygenService.createAvatarFromFile({
          type: creationType,
          name: creationName,
          file: selectedFile,
          onUploadProgress: ({ percent }) => {
            setUploadProgress(percent);
            setCreationStatus(`Uploading training file… ${percent}%`);
          },
        });
      }

      setCreationPhase('creating');
      setUploadProgress(100);
      setCreationStatus(`Creating ${creationType.replace('_', ' ')}...`);

      const usedCredits = await resolveAvatarCreditsUsed(response, requiredCredits);
      setCreditsUsed(usedCredits);

      const created = parseAvatarCreateResponse(response, creationName);
      const groupId = created.groupId;

      if (groupId && creationType === 'digital_twin') {
        setCreationStatus('Setting up consent verification...');
        try {
          const consentRes = await heygenService.getAvatarConsent(groupId);
          const url = getConsentUrlFromResponse(consentRes);
          const group = consentRes?.avatar_group ?? consentRes?.avatarGroup;
          await finishWithSuccess(response, {
            consentUrl: url,
            consentStatus: group?.consent_status ?? created.consentStatus ?? 'pending',
            trainingStatus: group?.status ?? created.trainingStatus ?? 'pending_consent',
          }, usedCredits);
          return;
        } catch (consentErr) {
          console.warn('Consent fetch failed or not required', consentErr);
          await finishWithSuccess(response, {
            consentStatus: created.consentStatus ?? 'pending',
            trainingStatus: created.trainingStatus ?? 'pending_consent',
          }, usedCredits);
          return;
        }
      }

      setCreationStatus('Persona created successfully!');
      await finishWithSuccess(response, null, usedCredits);
    } catch (err) {
      console.error('Avatar creation failed:', err);
      const requiredCredits = resolveAvatarCreateCreditCost(creditEstimate);
      const fallback = isInsufficientCreditsError(err)
        ? `You need at least ${formatCreditsPlain(requiredCredits)} credits to create this avatar.`
        : 'Creation failed';
      setCreationStatus(`Error: ${getSanitizedErrorMessage(err, fallback)}`);
      setTimeout(() => {
        setCreationPhase('form');
        setCreationStatus('');
        setUploadProgress(null);
      }, 4000);
    }
  };

  const requiredCredits = resolveAvatarCreateCreditCost(creditEstimate);
  const insufficientCredits =
    personalCredits != null && !hasEnoughCreditsForAvatar(personalCredits, requiredCredits);
  const displayCreditsUsed = creationSuccess?.creditsUsed ?? creditsUsed;

  if (!isOpen || !typeOption) return null;

  const isDigitalTwin = creationType === 'digital_twin';
  const digitalTwinActiveStep = getDigitalTwinActiveStep(creationPhase);
  const displayName = creationSuccess?.name || creationName;

  const handleOverlayClick = () => {
    if (creationPhase === 'form') onClose?.();
  };

  const handleRequestClose = () => {
    if (isBusy || creationPhase === 'training') return;
    onClose?.();
  };

  const handleCreateLooksClick = () => {
    if (!onCreateLooks || !creationSuccess) return;
    onCreateLooks({ ...creationSuccess, fromDigitalTwin: isDigitalTwin });
  };

  return (
    <>
      <div className="create-avatar-modal-overlay" role="presentation" onClick={handleOverlayClick}>
        <div
          className={`create-avatar-modal ${isDigitalTwin ? 'create-avatar-modal--wide' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={`Create ${typeOption.title}`}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="create-avatar-modal-header">
            <div className="create-avatar-modal-header__copy">
              <h2>{typeOption.title}</h2>
              <p>{typeOption.description}</p>
            </div>
            <button
              type="button"
              className="create-avatar-modal-close"
              onClick={handleRequestClose}
              disabled={isBusy || creationPhase === 'training'}
              aria-label="Close"
            >
              <MdClose size={20} />
            </button>
          </header>

          {isDigitalTwin ? (
            <DigitalTwinStepIndicator activeStep={digitalTwinActiveStep} />
          ) : null}

          <div className="create-avatar-modal-body">
            {creationPhase === 'ready' && creationSuccess ? (
              <div className="creation-success-panel creation-success-panel--premium">
                <div className="creation-success-panel__glow" aria-hidden="true" />
                <div className="creation-success-icon creation-success-icon--premium">
                  <CheckCircle2 size={56} />
                </div>
                <p className="creation-success-panel__eyebrow">
                  {isDigitalTwin ? 'Digital Twin ready' : 'Avatar ready'}
                </p>
                <h3>{displayName} is live</h3>
                <p className="creation-success-panel__lead">
                  {creationSuccess.trainingTimedOut
                    ? `Training is still finishing in the background (${AVATAR_TRAINING_TYPICAL_LABEL}). You can start creating looks now — previews update when training completes.`
                    : 'Your likeness is trained and consent is approved. The next step is creating looks — outfits and scenes that keep the same person.'}
                </p>
                {displayCreditsUsed != null ? (
                  <p className="creation-success-credits-used" role="status">
                    <span className="creation-success-credits-used__label">Credits used</span>
                    <strong>{formatCreditsPlain(displayCreditsUsed)}</strong>
                  </p>
                ) : null}
                {creationSuccess.previewImage ? (
                  <div className="creation-success-preview-wrap">
                    <img
                      src={creationSuccess.previewImage}
                      alt={displayName}
                      className="creation-success-preview creation-success-preview--hero"
                    />
                  </div>
                ) : null}
                <div className="creation-success-actions creation-success-actions--premium">
                  {onCreateLooks ? (
                    <button
                      type="button"
                      className="submit-creation-btn-premium submit-creation-btn-premium--hero"
                      onClick={handleCreateLooksClick}
                    >
                      <Wand2 size={20} />
                      <span>Create looks for {displayName}</span>
                      <ArrowRight size={18} className="creation-success-cta-arrow" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="creation-secondary-btn"
                    onClick={() => {
                      onCompleted?.(true);
                      onClose?.();
                    }}
                  >
                    Back to My Avatars
                  </button>
                </div>
              </div>
            ) : creationPhase === 'consent' && consentStep ? (
              <>
                <p className="create-avatar-step-hint">
                  Step 2 of 3 — Record or upload your consent video. The person in the consent video
                  must match your training footage.
                </p>
                {displayCreditsUsed != null ? (
                  <p className="create-avatar-credits-charged" role="status">
                    {formatCreditsPlain(displayCreditsUsed)} credits used for this avatar creation.
                  </p>
                ) : null}
                <AvatarConsentStep
                  groupId={consentStep.groupId}
                  avatarName={consentStep.name || creationName}
                  consentUrl={consentStep.consentUrl}
                  consentStatus={consentStep.consentStatus}
                  onComplete={handleConsentComplete}
                />
              </>
            ) : isBusy ? (
              isDigitalTwin ? (
                <DigitalTwinProgressPanel
                  phase={creationPhase}
                  status={creationStatus}
                  uploadProgress={uploadProgress}
                />
              ) : (
                <div className="creation-loading">
                  <Loader2 size={60} className="spin-animation" />
                  <h3>{creationStatus}</h3>
                  <p>We are orchestrating your digital persona. This won&apos;t take long.</p>
                </div>
              )
            ) : (
              <div className="form-main-inputs">
                {insufficientCredits ? (
                  <div className="create-avatar-credits-warning" role="alert">
                    <strong>Not enough credits</strong>
                    <p>
                      You need at least <strong>{formatCreditsPlain(requiredCredits)} credits</strong> to
                      create this avatar.
                      {personalCredits != null ? (
                        <> Your balance is <strong>{formatCreditsPlain(personalCredits)}</strong>.</>
                      ) : null}
                      {' '}Add credits in Billing before continuing.
                    </p>
                  </div>
                ) : null}
                {isDigitalTwin ? (
                  <p className="create-avatar-step-hint create-avatar-step-hint--compact">
                    Step 1 — Record or upload training footage (2–5 min). Consent video is next.
                  </p>
                ) : null}
                <div className="input-group">
                  <label className="section-label">Avatar Identity Name</label>
                  <div className="input-with-counter">
                    <input
                      type="text"
                      placeholder="e.g. Athena Executive Marcus"
                      value={creationName}
                      maxLength={50}
                      onChange={(event) => setCreationName(event.target.value)}
                    />
                    <span className="char-counter">{creationName.length}/50</span>
                  </div>
                </div>

                {creationType === 'prompt' ? (
                  <div className="input-group">
                    <label className="section-label">AI Personality / Description</label>
                    <textarea
                      placeholder="Describe the appearance, ethnicity, age, and professional style of the avatar you want to generate..."
                      value={creationPrompt}
                      onChange={(event) => setCreationPrompt(event.target.value)}
                    />
                  </div>
                ) : creationType === 'digital_twin' ? (
                  <div className="input-group">
                    <label className="section-label">Training video</label>
                    <DigitalTwinVideoInput
                      speakerName={creationName}
                      previewUrl={previewUrl}
                      onVideoReady={handleVideoReady}
                      onClear={clearPreview}
                    />
                  </div>
                ) : (
                  <div className="input-group">
                    <div className="label-with-help">
                      <label className="section-label">Portrait Image Input</label>
                      <button type="button" className="context-help-link" onClick={() => setShowHelpModal(true)}>
                        What makes a good photo?
                      </button>
                    </div>

                    <div
                      className={`file-drop-zone-premium ${previewUrl ? 'has-preview' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <div className="preview-container">
                          <button type="button" className="clear-preview-btn" onClick={clearPreview}>
                            <X size={16} />
                          </button>
                          <img src={previewUrl} className="file-preview-media" alt="Preview" />
                          <div className="preview-overlay">
                            <Upload size={20} />
                            <span>Change File</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon-circle">
                            <Upload size={28} />
                          </div>
                          <div className="drop-zone-text">
                            <strong>Click or drag to upload</strong>
                            <p>Portrait photo</p>
                            <div className="format-pills">
                              <span>.jpg</span>
                              <span>.png</span>
                              <span>Max 10 MB</span>
                            </div>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {creationPhase === 'form' ? (
            <footer className="create-avatar-modal-footer">
              <p className="create-avatar-modal-footer__note">
                {creditsInfoLoading
                  ? 'Loading credit requirements… '
                  : `Minimum ${formatCreditsPlain(requiredCredits)} credits required${
                      personalCredits != null
                        ? ` · Your balance: ${formatCreditsPlain(personalCredits)}`
                        : ''
                    }. `}
                {isDigitalTwin
                  ? `Training takes ${AVATAR_TRAINING_TYPICAL_LABEL} after consent is approved.`
                  : 'Processing typically takes 5–10 minutes.'}
              </p>
              <button
                type="button"
                className="create-avatar-modal-btn create-avatar-modal-btn-primary"
                onClick={handleCreateAvatar}
                disabled={insufficientCredits || creditsInfoLoading}
              >
                <Terminal size={18} />
                <span>{isDigitalTwin ? 'Upload & continue to consent' : 'Build My AI Avatar'}</span>
              </button>
            </footer>
          ) : null}
        </div>
      </div>

      {showHelpModal ? (
        <div className="creation-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="creation-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Guide to the Perfect Persona</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowHelpModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {creationType === 'digital_twin' ? (
                <>
                  <div className="help-section">
                    <h4>Video Requirements</h4>
                    <ul>
                      <li><strong>Length:</strong> 2-5 minutes of continuous footage.</li>
                      <li><strong>Resolution:</strong> 1080p or 4K recommended.</li>
                      <li><strong>Format:</strong> .mp4, .mov, or .webm (max 900 MB).</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="help-section">
                    <h4>Image Requirements</h4>
                    <ul>
                      <li><strong>Resolution:</strong> 1080x1080 minimum recommended.</li>
                      <li><strong>Format:</strong> .png, .jpg, or .webp.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            <button type="button" className="modal-action-btn" onClick={() => setShowHelpModal(false)}>
              Got it, let&apos;s build!
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CreateAvatarModal;
