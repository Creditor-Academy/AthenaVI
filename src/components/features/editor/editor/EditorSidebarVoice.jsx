import React, { useState, useEffect } from 'react';
import { MdMic, MdSearch, MdPlayArrow, MdVolumeUp } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import heygenService from '../../../../services/heygenService';

// Voice engines unsupported by the HeyGen TTS speech generation endpoint.
const UNSUPPORTED_TTS_ENGINES = ['STARFISH']

function isSupportedTtsVoice(rawVoice) {
  const engine = String(rawVoice?.voice_engine || rawVoice?.engine || rawVoice?.provider || '').toUpperCase()
  return engine === '' || !UNSUPPORTED_TTS_ENGINES.includes(engine)
}

const EditorSidebarVoice = ({ activeScene, activeSceneId, updateScene }) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGender, setActiveGender] = useState('all');

  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true);
      try {
        const params = { limit: 100, type: 'public' };
        if (activeGender !== 'all') params.gender = activeGender;
        
        const responseData = await heygenService.getVoices(params);
        
        // Robust mapping to handle different API versions and response shapes
        let voiceList = [];
        const data = responseData?.data || responseData;
        
        if (Array.isArray(data)) {
          voiceList = data;
        } else if (data?.voices) {
          voiceList = data.voices;
        } else if (responseData?.voices) {
          voiceList = responseData.voices;
        }

        console.log(`Athena VI (Editor): Mapping ${voiceList.length} voices`, { raw: responseData });
        
        // Filter out engines not supported by TTS speech generation (e.g. STARFISH)
        const mappedVoices = voiceList.filter(isSupportedTtsVoice).map(v => ({
          id: v.voice_id || v.id,
          name: v.name || v.display_name || 'AI Voice',
          gender: v.gender || 'unknown',
          language: v.language || v.language_name || 'English',
          previewUrl: v.preview_audio_url || v.preview_url || v.preview_audio,
          engine: String(v.voice_engine || v.engine || v.provider || '').toUpperCase() || null,
          tags: v.tags || []
        }));
        
        setVoices(mappedVoices);
      } catch (err) {
        console.error('Failed to load voices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoices();
  }, [activeGender]);

  const filteredVoices = voices.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVoice = (voice) => {
    if (!activeSceneId) return;
    updateScene(activeSceneId, {
      voiceId: voice.id,
      voiceName: voice.name
    });
  };

  const playPreview = (e, url) => {
    e.stopPropagation();
    if (!url) return;
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="tool-panel-content elements-ui" style={{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Premium Header area */}
      <div style={{
        padding: '24px 20px 16px',
        background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.05) 0%, rgba(0,0,0,0) 100%)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
               AI Voices <MdVolumeUp style={{ color: '#9333ea' }} size={16}/>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Natural neural speech synthesis</p>
          </div>
        </div>

        {/* Sophisticated Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px 12px',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <MdSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search voices, languages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Gender Filter Chips */}
        <div className="elements-chips-scroll">
          {['all', 'male', 'female'].map(gender => (
            <button 
              key={gender}
              className={`elements-chip ${activeGender === gender ? 'active' : ''}`}
              onClick={() => setActiveGender(gender)}
              style={{
                background: activeGender === gender ? 'var(--primary)' : 'transparent',
                color: activeGender === gender ? 'white' : 'var(--text-muted)',
                borderColor: activeGender === gender ? 'var(--primary)' : 'var(--border-color)',
                textTransform: 'capitalize'
              }}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }} className="premium-scrollbar">
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 className="spinner" size={24} style={{ margin: '0 auto 12px' }} />
            <p>Loading neural voices...</p>
          </div>
        ) : (
          <div className="audio-list">
            {filteredVoices.map((voice) => {
              const isSelected = activeScene?.voiceId === voice.id;
              return (
                <div 
                  key={voice.id} 
                  className={`audio-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectVoice(voice)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(26, 115, 232, 0.05)' : 'var(--bg-card)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: voice.gender === 'male' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                      color: voice.gender === 'male' ? '#3b82f6' : '#ec4899',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {voice.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{voice.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{voice.language} • {voice.gender}</div>
                    </div>
                  </div>
                  <button 
                    className="play-preview-btn"
                    onClick={(e) => playPreview(e, voice.previewUrl)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1px solid var(--border-color)',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--primary)'
                    }}
                  >
                    <MdPlayArrow size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {filteredVoices.length === 0 && !loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No voices found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorSidebarVoice;
