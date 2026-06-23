import { useState, useRef } from 'react'
import { Mic, Terminal, Loader2, X, Music, CheckCircle } from 'lucide-react'
import { MdArrowBack, MdPlayArrow } from 'react-icons/md'
import heygenService from '../../services/heygenService'
import { getSanitizedErrorMessage } from '../../utils/userFacingMessage'
import '../../components/features/workspace/workspace/WorkspaceStyles.css'
import '../Videos/Videos.css'
import '../Avatars/Avatars.css'
import './Voices.css'

function CreateVoice({ onBack }) {
  const [creationType, setCreationType] = useState('clone') // 'clone' or 'semantic'
  const [creationName, setCreationName] = useState('')
  const [creationPrompt, setCreationPrompt] = useState('')
  const [designGender, setDesignGender] = useState('female')
  const [isCreating, setIsCreating] = useState(false)
  const [creationStatus, setCreationStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [suggestedVoices, setSuggestedVoices] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const timerRef = useRef(null)
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
    if (e) e.stopPropagation();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async (e) => {
    e.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = (e) => {
    if (e) e.stopPropagation();
    if (mediaRecorder) {
      mediaRecorder.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateVoice = async () => {
    if (creationType === 'clone') {
      if (!creationName || creationName.trim().length === 0) {
        alert('Please provide a name for your custom voice.');
        return;
      }

      if (!selectedFile) {
        alert('Please select an audio sample to clone.');
        return;
      }

      setIsCreating(true);
      setCreationStatus('Uploading audio sample...');

      try {
        await heygenService.cloneVoiceFromFile({
          voiceName: creationName,
          file: selectedFile,
          removeBackgroundNoise: true,
        });
        setCreationStatus('Voice cloned successfully!');
        setTimeout(() => {
          setIsCreating(false);
          onBack(true);
        }, 2000);
      } catch (err) {
        console.error('Clone voice failed:', err);
        setCreationStatus(`Error: ${getSanitizedErrorMessage(err, 'Cloning failed')}`);
        setTimeout(() => {
          setIsCreating(false);
          setCreationStatus('');
        }, 4000);
      }
    } else {
      if (!creationPrompt) {
        alert('Please provide a prompt to design the voice.');
        return;
      }

      setIsCreating(true);
      setCreationStatus('Synthesizing semantic voice...');

      try {
        const payload = { 
          prompt: creationPrompt,
          gender: designGender || undefined
        };
        const res = await heygenService.designVoice(payload);
        const voices = res.voices || res.data?.voices || [];
        setSuggestedVoices(voices);
        setIsCreating(false);
        setCreationStatus('');
      } catch (err) {
        console.error('Create voice failed:', err);
        setCreationStatus(`Error: ${getSanitizedErrorMessage(err, 'Creation failed')}`);
        setTimeout(() => {
          setIsCreating(false);
          setCreationStatus('');
        }, 4000);
      }
    }
  };

  return (
    <div className="videos-page voices-page create-voice-page">
      <div className="videos-shell">
        <header className="videos-page-header create-avatar-page-header">
          <div className="videos-title-section create-avatar-title-section">
            <div className="create-avatar-title-row">
              <button
                type="button"
                className="workspace-back-btn"
                onClick={() => onBack(false)}
                aria-label="Back to Voices"
              >
                <MdArrowBack size={20} />
              </button>
              <div>
                <h1 className="videos-page-title">Create Voice</h1>
                <p className="videos-page-subtitle">
                  Clone from audio or design a new voice from a text description.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="videos-main create-avatar-main">
          <div className="creation-content-wrapper">
            <div className="creation-form-card standalone">
            {isCreating ? (
              <div className="creation-loading">
                <Loader2 size={60} className="spin-animation" />
                <h3>{creationStatus}</h3>
                <p>We are orchestrating your neural voice model. This won't take long.</p>
              </div>
            ) : (
              <div className="form-body">
                <div className="input-group">
                  <label className="section-label">Creation Method</label>
                  <div className="type-selector-cards" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <button 
                      className={`type-card ${creationType === 'clone' ? 'active' : ''}`}
                      onClick={() => setCreationType('clone')}
                    >
                      <div className="type-card-icon"><Mic size={20} /></div>
                      <div className="type-card-info">
                        <strong>Voice Clone</strong>
                        <p>Replicate an existing voice from an audio sample</p>
                        <span className="type-badge">From Audio</span>
                      </div>
                      <div className="type-card-radio"></div>
                    </button>

                    <button 
                      className={`type-card ${creationType === 'semantic' ? 'active' : ''}`}
                      onClick={() => setCreationType('semantic')}
                    >
                      <div className="type-card-icon"><Terminal size={20} /></div>
                      <div className="type-card-info">
                        <strong>Semantic Generation</strong>
                        <p>Design a brand new voice entirely from text</p>
                        <span className="type-badge">AI Generated</span>
                      </div>
                      <div className="type-card-radio"></div>
                    </button>
                  </div>
                </div>

                <div className="form-main-inputs">
                  {creationType === 'clone' ? (
                    <>
                      <div className="input-group">
                        <label className="section-label">Voice Identity Name</label>
                        <div className="input-with-counter">
                          <input 
                            type="text" 
                            placeholder="e.g. Executive Clone" 
                            value={creationName}
                            maxLength={50}
                            onChange={(e) => setCreationName(e.target.value)}
                          />
                          <span className="char-counter">{creationName.length}/50</span>
                        </div>
                      </div>
                      <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <label className="section-label" style={{ margin: 0 }}>High Fidelity Audio Sample</label>
                          {!previewUrl && (
                            <button 
                              className={`record-btn-pill ${isRecording ? 'recording' : ''}`}
                              onClick={isRecording ? stopRecording : startRecording}
                            >
                              <div className="record-dot" />
                              <span>{isRecording ? `Stop (${formatTime(recordingTime)})` : 'Record Live'}</span>
                            </button>
                          )}
                        </div>
                        
                        <div 
                          className={`file-drop-zone-premium ${previewUrl ? 'has-preview' : ''} ${isRecording ? 'is-recording' : ''}`} 
                          onClick={() => !isRecording && fileInputRef.current?.click()}
                        >
                          {isRecording ? (
                            <div className="recording-state">
                              <div className="pulse-circle" />
                              <Mic size={40} className="recording-icon" />
                              <strong>Recording Audio...</strong>
                              <p>Speak clearly into your microphone</p>
                              <div className="recording-timer">{formatTime(recordingTime)}</div>
                              <button className="stop-recording-btn" onClick={stopRecording}>Stop Recording</button>
                            </div>
                          ) : previewUrl ? (
                            <div className="preview-container">
                              <button className="clear-preview-btn" onClick={clearPreview}>
                                <X size={16} />
                              </button>
                              <div className="preview-content-premium">
                                <div className="preview-icon-badge">
                                  <Music size={32} />
                                </div>
                                <div className="preview-text-info">
                                  <strong>Voice Sample Ready</strong>
                                  <p>{selectedFile?.name || 'recorded-voice.webm'}</p>
                                </div>
                                <audio 
                                  src={previewUrl} 
                                  controls 
                                  controlsList="nodownload"
                                  className="premium-audio-player" 
                                  onClick={e => e.stopPropagation()} 
                                />
                                <div className="ready-status">
                                  <CheckCircle size={14} />
                                  <span>Ready to Clone</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="upload-icon-circle">
                                <Mic size={28} />
                              </div>
                              <div className="drop-zone-text">
                                <strong>Click or drag to upload audio</strong>
                                <p>15-60 seconds of clean speech without background noise</p>
                                <div className="format-pills">
                                  <span>.mp3</span>
                                  <span>.wav</span>
                                  <span>Max 50 MB</span>
                                </div>
                              </div>
                            </>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="audio/*" 
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-group">
                        <label className="section-label">Voice Gender Profile</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button 
                            className={`type-card ${designGender === 'female' ? 'active' : ''}`}
                            onClick={() => setDesignGender('female')}
                            style={{ flex: 1, padding: '16px', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <strong>Female</strong>
                          </button>
                          <button 
                            className={`type-card ${designGender === 'male' ? 'active' : ''}`}
                            onClick={() => setDesignGender('male')}
                            style={{ flex: 1, padding: '16px', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <strong>Male</strong>
                          </button>
                          <button 
                            className={`type-card ${designGender === '' ? 'active' : ''}`}
                            onClick={() => setDesignGender('')}
                            style={{ flex: 1, padding: '16px', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <strong>Any</strong>
                          </button>
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="section-label">Semantic Description</label>
                        <textarea 
                          placeholder="e.g. A warm, confident narrator with a professional tone suitable for corporate presentations..." 
                          value={creationPrompt}
                          onChange={(e) => setCreationPrompt(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="creation-footer">
                  <button className="submit-creation-btn-premium" onClick={handleCreateVoice}>
                    <Terminal size={18} />
                    <span>{suggestedVoices.length > 0 ? 'Regenerate Suggestions' : 'Synthesize Neural Voice'}</span>
                  </button>
                  <p className="cta-note">Audio processing typically takes 1–3 minutes.</p>
                </div>

                {suggestedVoices.length > 0 && (
                  <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={20} style={{ color: 'var(--primary)' }} />
                      Suggested Matches
                    </h3>
                    <div className="voices-suggested-grid">
                      {suggestedVoices.map((voice) => (
                        <div key={voice.voice_id} className="voices-suggested-card">
                          <div className="voices-suggested-card__badges">
                            <span className="voices-suggested-badge">{voice.language}</span>
                            {voice.gender ? (
                              <span className="voices-suggested-badge">{voice.gender}</span>
                            ) : null}
                          </div>
                          <h4>{voice.name}</h4>
                          <div className="voices-suggested-actions">
                            <button
                              type="button"
                              className="voices-suggested-btn"
                              onClick={() => voice.preview_audio_url && new Audio(voice.preview_audio_url).play()}
                            >
                              <MdPlayArrow size={16} /> Preview
                            </button>
                            <button
                              type="button"
                              className="voices-suggested-btn voices-suggested-btn--primary"
                              onClick={async () => {
                                setCreationStatus('Finalizing selection...');
                                setIsCreating(true);
                                try {
                                  const vId = voice.voice_id || voice.id;
                                  if (!vId) {
                                    alert('Error: Could not identify the voice ID. Please try regenerating.');
                                    return;
                                  }
                                  console.log('Athena VI: Selecting voice...', vId, voice);
                                  await heygenService.selectVoice({
                                    ...voice,
                                    name: creationName || voice.name
                                  });
                                  setCreationStatus('Voice selected successfully!');
                                  setTimeout(() => {
                                    setIsCreating(false);
                                    onBack(true);
                                  }, 1500);
                                } catch (err) {
                                  console.error('Failed to select voice:', err);
                                  setCreationStatus(`Error: ${getSanitizedErrorMessage(err, 'Selection failed')}`);
                                  setTimeout(() => {
                                    setIsCreating(false);
                                    setCreationStatus('');
                                  }, 3000);
                                }
                              }}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}

export default CreateVoice
