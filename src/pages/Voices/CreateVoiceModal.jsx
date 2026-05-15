import React, { useState, useRef } from 'react';
import { MdClose, MdMic, MdAutoAwesome, MdGraphicEq, MdPlayArrow, MdUploadFile } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import heygenService from '../../services/heygenService';

const CreateVoiceModal = ({ isOpen, onClose, onVoiceCreated }) => {
  const [activeTab, setActiveTab] = useState('design'); // design | clone
  const [loading, setLoading] = useState(false);
  
  // Create Voice (Semantic) State
  const [designPrompt, setDesignPrompt] = useState('');
  const [designGender, setDesignGender] = useState(''); // 'male' | 'female' | ''
  const [suggestedVoices, setSuggestedVoices] = useState([]);
  
  const suggestedPrompts = [
    { label: 'Professional Narrator', text: 'A warm, professional female narrator with a clear and confident tone.' },
    { label: 'Energetic Host', text: 'An energetic and friendly male host with an upbeat, engaging personality.' },
    { label: 'Calm Meditation', text: 'A soft, soothing female voice perfect for mindfulness and meditation.' },
    { label: 'Deep Authority', text: 'A deep, authoritative male voice with a commanding presence.' }
  ];
  
  // Clone Voice State
  const [cloneName, setCloneName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDesignVoice = async () => {
    if (!designPrompt) return;
    setLoading(true);
    try {
      const payload = { 
        prompt: designPrompt,
        gender: designGender || undefined
      };
      const res = await heygenService.designVoice(payload);
      const voices = res.voices || res.data?.voices || [];
      setSuggestedVoices(voices);
    } catch (err) {
      console.error('Create voice failed:', err);
      alert('Failed to find matching voices.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneVoice = async () => {
    if (!cloneName || !audioFile) return;
    setLoading(true);
    try {
      const base64Data = await convertFileToBase64(audioFile);
      const base64Content = base64Data.split(',')[1];
      
      const payload = {
        voice_name: cloneName,
        audio: {
          type: 'base64',
          data: base64Content,
          media_type: audioFile.type
        }
      };
      
      const res = await heygenService.cloneVoice(payload);
      alert('Voice cloning initiated! This may take a few minutes.');
      if (onVoiceCreated) onVoiceCreated(res);
      onClose();
    } catch (err) {
      console.error('Clone voice failed:', err);
      alert('Failed to initiate cloning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-access-modal-overlay" onClick={onClose}>
      <div className="quick-access-modal create-voice-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
        <div className="modal-header-sleek">
          <div>
            <h4 style={{ margin: 0, fontSize: '18px' }}>Neural Voice Laboratory</h4>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Generate or replicate perfect neural patterns</p>
          </div>
          <button className="close-mini-btn" onClick={onClose}><MdClose size={20} /></button>
        </div>

        <div className="modal-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 24px' }}>
          <button 
            className={`modal-tab ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => setActiveTab('design')}
            style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: activeTab === 'design' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'design' ? '2px solid var(--primary)' : 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Create Voice
          </button>
          <button 
            className={`modal-tab ${activeTab === 'clone' ? 'active' : ''}`}
            onClick={() => setActiveTab('clone')}
            style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: activeTab === 'clone' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'clone' ? '2px solid var(--primary)' : 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clone Voice
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {activeTab === 'design' && (
            <div className="tab-content">
              <div className="input-group">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Voice Characteristics</label>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setDesignGender('female')}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: designGender === 'female' ? 'var(--primary)' : 'var(--bg-surface)',
                      color: designGender === 'female' ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                    }}
                  >
                    Female
                  </button>
                  <button 
                    onClick={() => setDesignGender('male')}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: designGender === 'male' ? 'var(--primary)' : 'var(--bg-surface)',
                      color: designGender === 'male' ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                    }}
                  >
                    Male
                  </button>
                  <button 
                    onClick={() => setDesignGender('')}
                    style={{ 
                      flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', 
                      background: designGender === '' ? 'var(--primary)' : 'var(--bg-surface)',
                      color: designGender === '' ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600'
                    }}
                  >
                    Any
                  </button>
                </div>

                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Describe the voice</label>
                <textarea 
                  placeholder="e.g. A warm, confident female narrator with a professional tone..."
                  value={designPrompt}
                  onChange={(e) => setDesignPrompt(e.target.value)}
                  style={{ width: '100%', minHeight: '100px', padding: '16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', resize: 'none', outline: 'none' }}
                />

                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {suggestedPrompts.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setDesignPrompt(p.text);
                        if (p.text.toLowerCase().includes('female')) setDesignGender('female');
                        if (p.text.toLowerCase().includes('male')) setDesignGender('male');
                      }}
                      style={{ 
                        padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', 
                        background: 'rgba(var(--primary-rgb), 0.05)', color: 'var(--primary)',
                        fontSize: '12px', cursor: 'pointer', fontWeight: '500'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="submit-creation-btn-premium" style={{ marginTop: '24px' }} onClick={handleDesignVoice} disabled={loading || !designPrompt}>
                {loading ? <Loader2 className="spin-animation" size={18} /> : <><MdAutoAwesome size={18} /> Generate Suggested Voices</>}
              </button>

              {suggestedVoices.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h5 style={{ fontSize: '14px', marginBottom: '12px' }}>Suggested Matches:</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {suggestedVoices.map(voice => (
                      <div key={voice.voice_id} className="voice-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{voice.name}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{voice.gender} • {voice.language}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="voice-preview-btn" 
                            style={{ width: 'auto', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }} 
                            onClick={() => voice.preview_audio_url && new Audio(voice.preview_audio_url).play()}
                          >
                            <MdPlayArrow /> Preview
                          </button>
                          <button 
                            className="submit-creation-btn-premium" 
                            style={{ padding: '8px 16px', fontSize: '13px', marginTop: 0 }}
                            onClick={() => {
                              if (onVoiceCreated) onVoiceCreated(voice);
                              onClose();
                            }}
                          >
                            Select Voice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'clone' && (
            <div className="tab-content">
              <div className="input-group">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Custom Voice Name</label>
                <input 
                  type="text"
                  placeholder="e.g. CEO Clone"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginBottom: '16px', outline: 'none' }}
                />
                
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Sample Audio (15-60 seconds)</label>
                <div 
                  className="audio-drop-zone"
                  onClick={() => fileInputRef.current.click()}
                  style={{ padding: '32px', border: '2px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" hidden />
                  <MdMic size={40} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontWeight: '600' }}>{audioFile ? audioFile.name : 'Click to upload audio sample'}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>MP3 or WAV preferred</p>
                </div>
                {audioPreview && (
                  <audio controls src={audioPreview} style={{ width: '100%', marginTop: '16px', height: '32px' }} />
                )}
              </div>
              <button className="submit-creation-btn-premium" style={{ marginTop: '24px' }} onClick={handleCloneVoice} disabled={loading || !cloneName || !audioFile}>
                {loading ? <Loader2 className="spin-animation" size={18} /> : <><MdMic size={18} /> Replicate Voice Pattern</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateVoiceModal;
