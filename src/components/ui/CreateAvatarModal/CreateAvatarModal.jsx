import { useEffect, useRef, useState } from 'react';
import { Video, Image, Terminal, Upload, Loader2, X, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { MdClose } from 'react-icons/md';
import heygenService from '../../../services/heygenService';
import { parseAvatarCreateResponse } from '../../../utils/heygenAvatars';
import '../../../pages/Avatars/Avatars.css';
import './CreateAvatarModal.css';

function CreateAvatarModal({ isOpen, typeOption, onClose, onCreateLooks, onCompleted }) {
  const creationType = typeOption?.id || 'digital_twin';
  const [creationName, setCreationName] = useState('');
  const [creationPrompt, setCreationPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    setCreationName('');
    setCreationPrompt('');
    setIsCreating(false);
    setCreationStatus('');
    setPreviewUrl(null);
    setSelectedFile(null);
    setShowHelpModal(false);
    setCreationSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    return undefined;
  }, [isOpen, creationType]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isCreating) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCreating, onClose]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearPreview = (event) => {
    event.stopPropagation();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const finishWithSuccess = (response) => {
    const created = parseAvatarCreateResponse(response, creationName);
    if (!created.groupId) {
      setCreationStatus('Persona created, but we could not read the avatar id. Check My Avatars.');
      setTimeout(() => {
        setIsCreating(false);
        onCompleted?.(true);
        onClose?.();
      }, 2500);
      return;
    }
    setCreationSuccess(created);
    setIsCreating(false);
    setCreationStatus('');
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

    setIsCreating(true);
    setCreationStatus('Preparing asset upload...');

    try {
      let payload;

      if (creationType === 'prompt') {
        payload = {
          type: 'prompt',
          name: creationName,
          prompt: creationPrompt,
        };
      } else {
        payload = new FormData();
        payload.append('type', creationType);
        payload.append('name', creationName);
        payload.append('file', selectedFile);
      }

      setCreationStatus(`Creating ${creationType.replace('_', ' ')}...`);

      const response = await heygenService.createAvatar(payload);
      const created = parseAvatarCreateResponse(response, creationName);
      const groupId = created.groupId;

      if (groupId && (creationType === 'digital_twin' || creationType === 'photo')) {
        setCreationStatus('Verifying ownership...');
        try {
          const consentRes = await heygenService.getAvatarConsent(groupId, window.location.href);
          if (consentRes && (consentRes.consent_url || consentRes.url)) {
            const url = consentRes.consent_url || consentRes.url;
            setCreationStatus('Complete consent in the new tab, then create looks here.');
            window.open(url, '_blank');
            finishWithSuccess(response);
            return;
          }
        } catch (consentErr) {
          console.warn('Consent fetch failed or not required', consentErr);
        }
      }

      setCreationStatus('Persona created successfully!');
      finishWithSuccess(response);
    } catch (err) {
      console.error('Avatar creation failed:', err);
      setCreationStatus(`Error: ${err.message || 'Creation failed'}`);
      setTimeout(() => {
        setIsCreating(false);
        setCreationStatus('');
      }, 4000);
    }
  };

  if (!isOpen || !typeOption) return null;

  const handleOverlayClick = () => {
    if (!isCreating) onClose?.();
  };

  return (
    <>
      <div className="create-avatar-modal-overlay" role="presentation" onClick={handleOverlayClick}>
        <div
          className="create-avatar-modal"
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
              onClick={onClose}
              disabled={isCreating}
              aria-label="Close"
            >
              <MdClose size={20} />
            </button>
          </header>

          <div className="create-avatar-modal-body">
            {creationSuccess ? (
              <div className="creation-success-panel">
                <div className="creation-success-icon">
                  <CheckCircle2 size={52} />
                </div>
                <h3>{creationSuccess.name || creationName} is ready</h3>
                <p>
                  Your avatar was created. Generate additional outfits and styles as looks —
                  we&apos;ll use avatar id <code>{creationSuccess.groupId}</code> so they stay on your character.
                </p>
                {creationSuccess.previewImage ? (
                  <img
                    src={creationSuccess.previewImage}
                    alt={creationSuccess.name}
                    className="creation-success-preview"
                  />
                ) : null}
                <div className="creation-success-actions">
                  {onCreateLooks ? (
                    <button
                      type="button"
                      className="submit-creation-btn-premium"
                      onClick={() => onCreateLooks(creationSuccess)}
                    >
                      <Sparkles size={18} />
                      <span>Create looks</span>
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
            ) : isCreating ? (
              <div className="creation-loading">
                <Loader2 size={60} className="spin-animation" />
                <h3>{creationStatus}</h3>
                <p>We are orchestrating your digital persona. This won&apos;t take long.</p>
              </div>
            ) : (
              <div className="form-main-inputs">
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
                ) : (
                  <div className="input-group">
                    <div className="label-with-help">
                      <label className="section-label">
                        {creationType === 'digital_twin' ? 'High Fidelity Video Input' : 'Portrait Image Input'}
                      </label>
                      <button type="button" className="context-help-link" onClick={() => setShowHelpModal(true)}>
                        {creationType === 'digital_twin' ? 'What makes a good video?' : 'What makes a good photo?'}
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
                          {creationType === 'digital_twin' ? (
                            <video src={previewUrl} className="file-preview-media" autoPlay muted loop />
                          ) : (
                            <img src={previewUrl} className="file-preview-media" alt="Preview" />
                          )}
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
                            <p>{creationType === 'digital_twin' ? '2-5 minutes recommended' : 'Portrait photo'}</p>
                            <div className="format-pills">
                              {creationType === 'digital_twin' ? (
                                <>
                                  <span>.mp4</span>
                                  <span>.mov</span>
                                  <span>Max 2 GB</span>
                                </>
                              ) : (
                                <>
                                  <span>.jpg</span>
                                  <span>.png</span>
                                  <span>Max 10 MB</span>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept={creationType === 'digital_twin' ? 'video/*' : 'image/*'}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!creationSuccess && !isCreating ? (
            <footer className="create-avatar-modal-footer">
              <p className="create-avatar-modal-footer__note">Processing typically takes 5–10 minutes.</p>
              <button
                type="button"
                className="create-avatar-modal-btn create-avatar-modal-btn-primary"
                onClick={handleCreateAvatar}
              >
                <Terminal size={18} />
                <span>Build My AI Avatar</span>
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
                    <h4>
                      <Video size={18} /> Video Requirements
                    </h4>
                    <ul>
                      <li>
                        <strong>Length:</strong> 2-5 minutes of continuous footage.
                      </li>
                      <li>
                        <strong>Resolution:</strong> 1080p or 4K recommended.
                      </li>
                      <li>
                        <strong>Format:</strong> .mp4 or .mov (Max 2GB).
                      </li>
                    </ul>
                  </div>
                  <div className="help-section">
                    <h4>
                      <Users size={18} /> Best Practices
                    </h4>
                    <ul>
                      <li>Speak naturally about any topic to capture mouth movements.</li>
                      <li>Keep your head relatively still but use natural hand gestures.</li>
                      <li>Maintain a steady gaze towards the camera lens.</li>
                      <li>Ensure there are no other people or distracting objects in frame.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="help-section">
                    <h4>
                      <Image size={18} /> Image Requirements
                    </h4>
                    <ul>
                      <li>
                        <strong>Resolution:</strong> 1080x1080 minimum recommended.
                      </li>
                      <li>
                        <strong>Format:</strong> .png, .jpg, or .webp.
                      </li>
                      <li>
                        <strong>Size:</strong> Max 10MB.
                      </li>
                    </ul>
                  </div>
                  <div className="help-section">
                    <h4>
                      <Users size={18} /> Best Practices
                    </h4>
                    <ul>
                      <li>Ensure good, even lighting across the face (no harsh shadows).</li>
                      <li>Look directly at the camera lens.</li>
                      <li>Maintain a neutral expression with a closed mouth.</li>
                      <li>Use a solid or very clean background.</li>
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
