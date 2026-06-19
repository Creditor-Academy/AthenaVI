import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import heygenService from '../../../services/heygenService';
import {
  getAvatarConsentStatus,
  getAvatarTrainingStatus,
  getConsentUrlFromResponse,
  isConsentApproved,
  needsAvatarConsent,
} from '../../../utils/heygenAvatars';
import './AvatarConsentStep.css';

function buildQrImageUrl(url) {
  if (!url) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;
}

function AvatarConsentStep({
  groupId,
  avatarName = 'your avatar',
  consentUrl: initialConsentUrl = '',
  consentStatus: initialConsentStatus = null,
  onRefresh,
  onComplete,
  showQr = true,
}) {
  const [consentUrl, setConsentUrl] = useState(initialConsentUrl);
  const [consentStatus, setConsentStatus] = useState(initialConsentStatus);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [userName, setUserName] = useState(avatarName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  const approved = isConsentApproved({ consent_status: consentStatus, status: trainingStatus });

  const ensureConsentUrl = useCallback(async () => {
    if (consentUrl) return consentUrl;
    if (!groupId) return '';
    try {
      const res = await heygenService.getAvatarConsent(groupId);
      const url = getConsentUrlFromResponse(res);
      if (url) setConsentUrl(url);
      if (res?.avatar_group) {
        setConsentStatus(getAvatarConsentStatus(res.avatar_group));
        setTrainingStatus(getAvatarTrainingStatus(res.avatar_group));
      }
      return url || '';
    } catch (error) {
      console.error('Failed to fetch consent URL:', error);
      return '';
    }
  }, [consentUrl, groupId]);

  useEffect(() => {
    if (!groupId || initialConsentUrl) return;
    ensureConsentUrl();
  }, [groupId, initialConsentUrl, ensureConsentUrl]);

  const refreshStatus = useCallback(async () => {
    if (!groupId) return null;
    setIsRefreshing(true);
    try {
      const group = await heygenService.getAvatarGroup(groupId);
      if (group) {
        const nextConsent = getAvatarConsentStatus(group);
        const nextTraining = getAvatarTrainingStatus(group);
        setConsentStatus(nextConsent);
        setTrainingStatus(nextTraining);
        onRefresh?.(group);
        if (isConsentApproved(group)) {
          onComplete?.(group);
        }
        return group;
      }
    } catch (error) {
      console.error('Failed to refresh consent status:', error);
    } finally {
      setIsRefreshing(false);
    }
    return null;
  }, [groupId, onComplete, onRefresh]);

  const handleOpenPortal = async () => {
    const url = await ensureConsentUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    const url = await ensureConsentUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback('Link copied');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyFeedback('Could not copy link');
    }
  };

  const scriptText = (
    <>
      My name is{' '}
      {isEditingName ? (
        <span className="avatar-consent-script-name">
          <input
            type="text"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') setIsEditingName(false);
            }}
            autoFocus
          />
        </span>
      ) : (
        <span
          className="avatar-consent-script-name"
          onClick={() => setIsEditingName(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setIsEditingName(true);
          }}
        >
          {userName}
        </span>
      )}
      . I consent to HeyGen and Athena VI using footage of me to create and use my Digital Twin
      avatar. The passcode shown on the consent page must be read clearly:{' '}
      <span className="avatar-consent-script-passcode">— — — — — — —</span>.
    </>
  );

  return (
    <div className="avatar-consent-step">
      <h3 className="avatar-consent-step__title">
        Record your <span className="highlight">consent video</span>
      </h3>
      <p className="avatar-consent-step__intro">
        Digital Twin avatars require a short consent recording before training can finish. The person
        in the consent video must match the training footage.
      </p>

      <ul className="avatar-consent-instructions">
        <li>
          <CheckCircle2 size={16} />
          Keep the recording under 30 seconds with clear lighting and audio
        </li>
        <li>
          <CheckCircle2 size={16} />
          Read the consent script exactly as written on the portal
        </li>
        <li>
          <CheckCircle2 size={16} />
          Use webcam, upload a file, or scan the QR code on a phone
        </li>
      </ul>

      <div
        className={`avatar-consent-status ${approved ? 'approved' : ''}`}
        role="status"
      >
        {approved ? (
          <>
            <MdCheckCircle size={18} />
            Consent approved — your Digital Twin can finish processing.
          </>
        ) : (
          <>
            <Loader2 size={16} className="spin-animation" />
            Consent pending
            {trainingStatus === 'pending_consent' ? ' — required before use' : ''}
          </>
        )}
      </div>

      {!approved ? (
        <div className="avatar-consent-layout">
          <div className="avatar-consent-left">
            <div className="avatar-consent-checkbox-row">
              <button
                type="button"
                className={`avatar-consent-checkbox ${consentChecked ? 'checked' : ''}`}
                onClick={() => setConsentChecked((prev) => !prev)}
                aria-pressed={consentChecked}
                aria-label="Biometric consent"
              >
                {consentChecked ? <MdCheckCircle size={14} /> : null}
              </button>
              <p className="avatar-consent-checkbox-text">
                I consent to the collection and use of my likeness and biometric data for verifying
                my identity and creating my Digital Twin avatar, processed in accordance with the
                Privacy Policy.
              </p>
            </div>

            <div className="avatar-consent-actions">
              <button
                type="button"
                className="avatar-consent-btn avatar-consent-btn-primary"
                disabled={!consentChecked}
                onClick={handleOpenPortal}
              >
                <ExternalLink size={16} />
                Open consent portal
              </button>
              <button
                type="button"
                className="avatar-consent-btn avatar-consent-btn-secondary"
                disabled={!consentChecked}
                onClick={handleCopyLink}
              >
                <Copy size={16} />
                Copy link
              </button>
              <button
                type="button"
                className="avatar-consent-btn avatar-consent-btn-secondary"
                disabled={isRefreshing}
                onClick={refreshStatus}
              >
                {isRefreshing ? <Loader2 size={16} className="spin-animation" /> : <RefreshCw size={16} />}
                I&apos;ve completed consent
              </button>
            </div>
            {copyFeedback ? <span className="avatar-consent-copy-feedback">{copyFeedback}</span> : null}
          </div>

          <div className="avatar-consent-right">
            <h4 className="avatar-consent-section-title">Script preview</h4>
            <div className="avatar-consent-script">
              <p>{scriptText}</p>
            </div>
            {showQr && consentUrl ? (
              <div className="avatar-consent-qr">
                <img src={buildQrImageUrl(consentUrl)} alt="QR code for consent portal" />
                <p className="avatar-consent-qr-caption">Scan to record consent on your phone</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AvatarConsentModal({
  isOpen,
  groupId,
  avatarName,
  consentUrl,
  consentStatus,
  onClose,
  onComplete,
  onRefresh,
}) {
  if (!isOpen || !groupId) return null;

  return (
    <div
      className="avatar-consent-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="avatar-consent-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Complete avatar consent"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="avatar-consent-modal-header">
          <div />
          <button type="button" className="avatar-consent-modal-close" onClick={onClose} aria-label="Close">
            <MdClose size={22} />
          </button>
        </div>
        <AvatarConsentStep
          groupId={groupId}
          avatarName={avatarName}
          consentUrl={consentUrl}
          consentStatus={consentStatus}
          onComplete={(group) => {
            onComplete?.(group);
            onClose?.();
          }}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}

export function avatarNeedsConsentFlow(avatarOrGroup) {
  if (!avatarOrGroup) return false;
  return needsAvatarConsent({
    consent_status: avatarOrGroup.consentStatus ?? avatarOrGroup.consent_status,
    status: avatarOrGroup.trainingStatus ?? avatarOrGroup.status,
  });
}

export default AvatarConsentStep;
