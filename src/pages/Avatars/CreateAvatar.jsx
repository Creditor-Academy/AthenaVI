import { useState, useRef } from 'react'
import { ArrowLeft, Video, Image, Terminal, Upload, Loader2, X, Users } from 'lucide-react'
import heygenService from '../../services/heygenService'
import './Avatars.css'

function CreateAvatar({ onBack }) {
  const [creationType, setCreationType] = useState('digital_twin')
  const [creationName, setCreationName] = useState('')
  const [creationPrompt, setCreationPrompt] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [creationStatus, setCreationStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearPreview = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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
        // Option A: JSON for prompts
        payload = {
          type: 'prompt',
          name: creationName,
          prompt: creationPrompt
        };
      } else {
        // Option B: Multipart for files
        payload = new FormData();
        payload.append('type', creationType);
        payload.append('name', creationName);
        payload.append('file', selectedFile);
        
        // Optional: reference_images can be added here as JSON string if needed
        // payload.append('reference_images', JSON.stringify([]));
      }

      setCreationStatus(`Creating ${creationType.replace('_', ' ')}...`);
      console.log('Athena VI: Initiating avatar creation...', creationType);
      
      const response = await heygenService.createAvatar(payload);
      
      // On success, if it's a digital_twin, we might need consent
      const groupId = response?.avatar_group_id || response?.data?.avatar_group_id || response?.id;
      
      if (groupId && (creationType === 'digital_twin' || creationType === 'photo')) {
        setCreationStatus('Verifying ownership...');
        try {
          const consentRes = await heygenService.getAvatarConsent(groupId, window.location.href);
          if (consentRes && (consentRes.consent_url || consentRes.url)) {
            const url = consentRes.consent_url || consentRes.url;
            setCreationStatus('Redirecting to consent portal...');
            // Give user a moment to read the status
            setTimeout(() => {
              window.open(url, '_blank');
              setIsCreating(false);
              onBack(true);
            }, 1500);
            return;
          }
        } catch (consentErr) {
          console.warn('Consent fetch failed or not required', consentErr);
          // If consent fails but creation succeeded, we still proceed
        }
      }

      setCreationStatus('Persona created successfully!');
      setTimeout(() => {
        setIsCreating(false);
        onBack(true);
      }, 2000);

    } catch (err) {
      console.error('Avatar creation failed:', err);
      setCreationStatus(`Error: ${err.message || 'Creation failed'}`);
      setTimeout(() => {
        setIsCreating(false);
        setCreationStatus('');
      }, 4000);
    }
  };

  return (
    <div className="workspace-main">
      <div className="grid-container">
        <header className="avatars-header">
          <div className="header-info">
            <button className="back-btn-sleek" onClick={() => onBack(false)}>
              <ArrowLeft size={18} />
              <span>Back to Avatars</span>
            </button>
            <h1>Create Your AI Persona</h1>
            <p>Choose your path and bring your virtual identity to life.</p>
          </div>
        </header>

        <div className="creation-content-wrapper">
          <div className="creation-form-card standalone">
            {isCreating ? (
              <div className="creation-loading">
                <Loader2 size={60} className="spin-animation" />
                <h3>{creationStatus}</h3>
                <p>We are orchestrating your digital persona. This won't take long.</p>
              </div>
            ) : (
              <div className="form-body">
                <div className="input-group">
                  <label className="section-label">Avatar Type</label>
                  <div className="type-selector-cards">
                    <button 
                      className={`type-card ${creationType === 'digital_twin' ? 'active' : ''}`}
                      onClick={() => setCreationType('digital_twin')}
                    >
                      <div className="type-card-icon"><Video size={20} /></div>
                      <div className="type-card-info">
                        <strong>Digital Twin</strong>
                        <p>Clones your real appearance from video</p>
                        <span className="type-badge">From Video</span>
                      </div>
                      <div className="type-card-radio"></div>
                    </button>

                    <button 
                      className={`type-card ${creationType === 'photo' ? 'active' : ''}`}
                      onClick={() => setCreationType('photo')}
                    >
                      <div className="type-card-icon"><Image size={20} /></div>
                      <div className="type-card-info">
                        <strong>Photo Avatar</strong>
                        <p>Animates a still image into a persona</p>
                        <span className="type-badge">From Image</span>
                      </div>
                      <div className="type-card-radio"></div>
                    </button>

                    <button 
                      className={`type-card ${creationType === 'prompt' ? 'active' : ''}`}
                      onClick={() => setCreationType('prompt')}
                    >
                      <div className="type-card-icon"><Terminal size={20} /></div>
                      <div className="type-card-info">
                        <strong>Prompt Based</strong>
                        <p>Generate a face entirely from text</p>
                        <span className="type-badge">AI Generated</span>
                      </div>
                      <div className="type-card-radio"></div>
                    </button>
                  </div>
                </div>

                <div className="form-main-inputs">
                    <div className="input-group">
                      <label className="section-label">Avatar Identity Name</label>
                      <div className="input-with-counter">
                        <input 
                          type="text" 
                          placeholder="e.g. Athena Executive Marcus" 
                          value={creationName}
                          maxLength={50}
                          onChange={(e) => setCreationName(e.target.value)}
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
                          onChange={(e) => setCreationPrompt(e.target.value)}
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
                        
                        <div className={`file-drop-zone-premium ${previewUrl ? 'has-preview' : ''}`} onClick={() => fileInputRef.current?.click()}>
                          {previewUrl ? (
                            <div className="preview-container">
                              <button className="clear-preview-btn" onClick={clearPreview}>
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
                                <p>2-5 minutes recommended</p>
                                <div className="format-pills">
                                  <span>.mp4</span>
                                  <span>.mov</span>
                                  <span>Max 2 GB</span>
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

                <div className="creation-footer">
                  <button className="submit-creation-btn-premium" onClick={handleCreateAvatar}>
                    <Terminal size={18} />
                    <span>Build My AI Avatar</span>
                  </button>
                  <p className="cta-note">Processing typically takes 5–10 minutes.</p>
                </div>
              </div>
            )}
          </div>
          
        </div>

        {showHelpModal && (
          <div className="creation-modal-overlay" onClick={() => setShowHelpModal(false)}>
            <div className="creation-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Guide to the Perfect Persona</h3>
                <button className="modal-close-btn" onClick={() => setShowHelpModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {creationType === 'digital_twin' ? (
                  <>
                    <div className="help-section">
                      <h4><Video size={18} /> Video Requirements</h4>
                      <ul>
                        <li><strong>Length:</strong> 2-5 minutes of continuous footage.</li>
                        <li><strong>Resolution:</strong> 1080p or 4K recommended.</li>
                        <li><strong>Format:</strong> .mp4 or .mov (Max 2GB).</li>
                      </ul>
                    </div>
                    <div className="help-section">
                      <h4><Users size={18} /> Best Practices</h4>
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
                      <h4><Image size={18} /> Image Requirements</h4>
                      <ul>
                        <li><strong>Resolution:</strong> 1080x1080 minimum recommended.</li>
                        <li><strong>Format:</strong> .png, .jpg, or .webp.</li>
                        <li><strong>Size:</strong> Max 10MB.</li>
                      </ul>
                    </div>
                    <div className="help-section">
                      <h4><Users size={18} /> Best Practices</h4>
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
              <button className="modal-action-btn" onClick={() => setShowHelpModal(false)}>
                Got it, let's build!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateAvatar
