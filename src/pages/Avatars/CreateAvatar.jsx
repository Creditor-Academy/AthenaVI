import { useState, useRef } from 'react'
import { ArrowLeft, Video, Image, Terminal, Upload, Loader2, X } from 'lucide-react'
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
    <div className="create-avatar-page">
      <div className="grid-container">
        <header className="create-avatar-header">
          <button className="back-btn-sleek" onClick={() => onBack(false)}>
            <ArrowLeft size={18} />
            <span>Back to Avatars</span>
          </button>
          <h1>Create Your AI Persona</h1>
          <p>Choose your path and bring your virtual identity to life.</p>
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
                <div className="type-selector">
                  <button 
                    className={`type-btn ${creationType === 'digital_twin' ? 'active' : ''}`}
                    onClick={() => setCreationType('digital_twin')}
                  >
                    <Video size={18} />
                    <div className="type-label">
                        <strong>Digital Twin</strong>
                        <span>From Video</span>
                    </div>
                  </button>
                  <button 
                    className={`type-btn ${creationType === 'photo' ? 'active' : ''}`}
                    onClick={() => setCreationType('photo')}
                  >
                    <Image size={18} />
                    <div className="type-label">
                        <strong>Photo Avatar</strong>
                        <span>From Image</span>
                    </div>
                  </button>
                  <button 
                    className={`type-btn ${creationType === 'prompt' ? 'active' : ''}`}
                    onClick={() => setCreationType('prompt')}
                  >
                    <Terminal size={18} />
                    <div className="type-label">
                        <strong>Prompt Based</strong>
                        <span>AI Generated</span>
                    </div>
                  </button>
                </div>

                <div className="form-main-inputs">
                    <div className="input-group">
                      <label>Avatar Identity Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Athena Executive Marcus" 
                        value={creationName}
                        onChange={(e) => setCreationName(e.target.value)}
                      />
                    </div>

                    {creationType === 'prompt' ? (
                      <div className="input-group">
                        <label>AI Personality / Description</label>
                        <textarea 
                          placeholder="Describe the appearance, ethnicity, age, and professional style of the avatar you want to generate..." 
                          value={creationPrompt}
                          onChange={(e) => setCreationPrompt(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="input-group">
                        <label>{creationType === 'digital_twin' ? 'High Fidelity Video Input' : 'Portrait Image Input'}</label>
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
                              <Upload size={32} />
                              <div className="drop-zone-text">
                                <strong>Click or drag to upload</strong>
                                <span>{creationType === 'digital_twin' ? 'Supports .mp4, .mov (2-5 mins recommended)' : 'Supports .png, .jpg, .webp'}</span>
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

                <button className="submit-creation-btn-premium" onClick={handleCreateAvatar}>
                  Build My AI Avatar
                </button>
              </div>
            )}
          </div>
          
          <div className="creation-guide">
            <h3>Pro Creation Tips</h3>
            <div className="guide-item">
              <div className="guide-number">01</div>
              <div className="guide-text">
                <strong>Lighting is Key</strong>
                <p>Ensure your face is well-lit and avoid shadows for the best realism.</p>
              </div>
            </div>
            <div className="guide-item">
              <div className="guide-number Snapshot">02</div>
              <div className="guide-text">
                <strong>Neutral Background</strong>
                <p>A clean, solid background helps our AI isolate your movements perfectly.</p>
              </div>
            </div>
            <div className="guide-item">
              <div className="guide-number">03</div>
              <div className="guide-text">
                <strong>Natural Speech</strong>
                <p>Speak clearly and maintain eye contact with the camera if creating a Digital Twin.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAvatar
