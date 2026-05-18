import { useState, useRef, useEffect } from 'react'
import { MdMoreVert, MdPlayArrow, MdCheckCircle, MdSearch, MdGraphicEq, MdEdit, MdDelete, MdShare, MdContentCopy, MdClose } from 'react-icons/md'
import { Loader2, AlertCircle } from 'lucide-react'
import heygenService from '../../services/heygenService'
import VoicesSkeleton from '../page-skeleton/VoicesSkeleton'
import './Voices.css'

function Voices({ onCreateVoice, onVoiceClick, initialFilter = 'public' }) {
  const [voices, setVoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState(initialFilter)
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  
  // Test Voice State
  const [selectedVoiceForTest, setSelectedVoiceForTest] = useState(null)
  const [speechText, setSpeechText] = useState('')
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  
  const menuRefs = useRef({})

  const fetchVoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await heygenService.getVoices({ type: filterType });
      
      let voiceList = [];
      if (Array.isArray(result)) {
        voiceList = result;
      } else if (result && Array.isArray(result.voices)) {
        voiceList = result.voices;
      } else if (result && result.data && Array.isArray(result.data.voices)) {
        voiceList = result.data.voices;
      } else if (result && result.data && Array.isArray(result.data)) {
        voiceList = result.data;
      } else if (result && Array.isArray(result.list)) {
        voiceList = result.list;
      }
      
      setVoices(voiceList);
    } catch (err) {
      console.error('Failed to fetch voices:', err);
      setError('Failed to sync with neural voice database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, [filterType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Polling logic for processing voices
  useEffect(() => {
    const processingVoices = voices.filter(v => v.status === 'processing');
    if (processingVoices.length === 0) return;

    const intervalId = setInterval(async () => {
      const results = await Promise.all(
        processingVoices.map(async (v) => {
          try {
            const id = v.voice_id || v.id;
            const updated = await heygenService.getVoiceStatus(id);
            return { id: v.id, status: updated.status };
          } catch (e) {
            return null;
          }
        })
      );

      const changes = results.filter(r => r && r.status !== 'processing');
      if (changes.length > 0) {
        setVoices(current => 
          current.map(v => {
            const change = changes.find(c => c.id === v.id);
            return change ? { ...v, status: change.status } : v;
          })
        );
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [voices]);

  const handleCreateVoice = () => {
    if (onCreateVoice) onCreateVoice();
  }

  const handleSpeechSynthesis = async () => {
    if (!speechText || !selectedVoiceForTest) return;
    setIsSynthesizing(true);
    try {
      const res = await heygenService.previewSpeech({
        text: speechText,
        voice_id: selectedVoiceForTest.voice_id || selectedVoiceForTest.id
      });
      if (res && res.preview_audio_url) {
        const audio = new Audio(res.preview_audio_url);
        audio.play();
      } else {
        alert('Synthesis complete, but no audio URL was returned.');
      }
    } catch (err) {
      console.error('Synthesis failed:', err);
      alert('Failed to generate speech preview.');
    } finally {
      setIsSynthesizing(false);
    }
  }

  const filteredVoices = voices.filter(v => 
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="voices-container">
      <header className="voices-header">
        <div className="voices-title-section">
          <h1 className="voices-title">Neural Voice Laboratory</h1>
          <button className="new-voice-btn" onClick={handleCreateVoice}>
            <MdPlayArrow size={20} />
            Initialize New Identity
          </button>
        </div>

        <div className="voices-controls">
          <div className="ownership-segmented-control">
            <button
              className={`segmented-btn ${filterType === 'public' ? 'active' : ''}`}
              onClick={() => setFilterType('public')}
            >
              Public Library
            </button>
            <button
              className={`segmented-btn ${filterType === 'private' ? 'active' : ''}`}
              onClick={() => setFilterType('private')}
            >
              My Custom Voices
            </button>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <MdSearch size={20} />
              <input
                type="text"
                placeholder="Search neural patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <VoicesSkeleton />
      ) : error ? (
        <div className="empty-state">
          <AlertCircle size={48} color="#ef4444" />
          <h3 className="empty-state-title">System Link Interrupted</h3>
          <p className="empty-state-text">{error}</p>
          <button className="new-voice-btn" onClick={fetchVoices}>Reconnect Database</button>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <MdGraphicEq size={64} style={{ opacity: 0.15, marginBottom: '20px' }} />
          </div>
          <h3 className="empty-state-title">No Neural Identities Found</h3>
          <p className="empty-state-text">
            {searchQuery 
              ? `Search for "${searchQuery}" yielded no matches.` 
              : filterType === 'private' 
                ? "Your custom neural vault is currently empty." 
                : "The global neural library is unreachable."}
          </p>
          {filterType === 'private' && !searchQuery && (
            <button className="new-voice-btn" onClick={handleCreateVoice}>Initialize First Clone</button>
          )}
        </div>
      ) : (
        <div className="voices-grid">
          {filteredVoices.map((voice) => {
            const vId = voice.voice_id || voice.id;
            return (
              <div 
                key={vId} 
                className="voice-card"
                onClick={() => onVoiceClick && onVoiceClick(voice)}
              >
                <div className="voice-card-header">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="voice-language-badge">
                      {voice.language || 'English'}
                    </span>
                    {voice.gender && (
                      <span className="voice-language-badge" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                        {voice.gender}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {voice.status && (
                      <div className={`voice-status-badge ${voice.status}`}>
                        {voice.status === 'processing' && <Loader2 size={10} className="spin-animation" style={{ marginRight: '6px' }} />}
                        {voice.status}
                      </div>
                    )}
                    
                    <div style={{ position: 'relative' }} ref={el => menuRefs.current[vId] = el}>
                      <button 
                        className="voice-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === vId ? null : vId);
                        }}
                      >
                        <MdMoreVert size={20} />
                      </button>
                      
                      {openMenuId === vId && (
                        <div className="voice-menu">
                          <button className="voice-menu-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
                            <MdShare className="voice-menu-item-icon" />
                            Share Pattern
                          </button>
                          <button className="voice-menu-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
                            <MdContentCopy className="voice-menu-item-icon" />
                            Copy Neural ID
                          </button>
                          <button className="voice-menu-item" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
                            <MdEdit className="voice-menu-item-icon" />
                            Rename
                          </button>
                          <button className="voice-menu-item delete" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}>
                            <MdDelete className="voice-menu-item-icon" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="voice-card-body">
                  <h3 className="voice-name">{voice.name}</h3>
                  <p className="voice-updated">
                    Neural optimization: <strong>Active</strong>
                  </p>
                </div>

                <div className="voice-info-box">
                  <div className="voice-info-icon">
                    <MdGraphicEq size={18} />
                  </div>
                  <p className="voice-info-text">
                    Optimized for <strong>Natural Flow</strong> and <strong>Semantic Depth</strong> in {voice.language || 'English'}.
                  </p>
                </div>

                <div className="voice-card-actions">
                  <button 
                    className="voice-action-btn voice-sample-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (voice.preview_audio_url) {
                        const audio = new Audio(voice.preview_audio_url);
                        audio.play();
                      }
                    }}
                  >
                    <MdPlayArrow size={18} />
                    Preview
                  </button>
                  <button 
                    className="voice-action-btn voice-test-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVoiceForTest(voice);
                    }}
                  >
                    <MdGraphicEq size={18} />
                    Test Voice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Synthesis Modal (Test Voice) */}
      {selectedVoiceForTest && (
        <div className="voice-modal-overlay" onClick={() => setSelectedVoiceForTest(null)}>
          <div className="voice-modal-card" onClick={e => e.stopPropagation()}>
            <header className="voice-modal-header">
              <div>
                <h3>Test Neural Voice</h3>
                <p>Generating preview for: <strong>{selectedVoiceForTest.name}</strong></p>
              </div>
              <button className="voice-modal-close" onClick={() => setSelectedVoiceForTest(null)}>
                <MdClose size={24} />
              </button>
            </header>
            
            <div className="voice-modal-body">
              <div className="input-group">
                <label>Input Speech Text</label>
                <textarea 
                  placeholder="Type a sentence to hear how this voice sounds..."
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  maxLength={500}
                />
                <span className="char-counter">{speechText.length}/500</span>
              </div>
              
              <button 
                className={`voice-modal-submit ${isSynthesizing ? 'loading' : ''}`}
                onClick={handleSpeechSynthesis}
                disabled={isSynthesizing || !speechText.trim()}
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 size={20} className="spin-animation" />
                    Synthesizing Neural Flow...
                  </>
                ) : (
                  <>
                    <MdGraphicEq size={20} />
                    Generate & Play Preview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Voices
