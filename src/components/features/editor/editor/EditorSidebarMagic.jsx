import React, { useState, useEffect } from 'react';
import { 
  MdAutoAwesome, 
  MdChatBubbleOutline, 
  MdClosedCaption, 
  MdOutlineImageSearch, 
  MdVolumeUp, 
  MdPerson, 
  MdDashboard, 
  MdPalette,
  MdPlayArrow
} from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import { predefinedAvatars } from '../../../../constants/editorData';
import heygenService from '../../../../services/heygenService';

const POPULAR_VOICES = [
  { id: '21a66feb30cc4a799c235cf65db72023', name: 'Adam (US Male)', language: 'English' },
  { id: '2d2d9b6c00d44081b5dc001221b6894c', name: 'Sarah (US Female)', language: 'English' },
  { id: '1ba0091ee9374026be1e3895e6382103', name: 'Bella (US Female)', language: 'English' },
  { id: '0a861675c2e540bca1b5dc001221b689', name: 'Antony (UK Male)', language: 'English' }
];

const EditorSidebarMagic = ({ onGenerateStoryboard }) => {
  const [script, setScript] = useState('');
  const [avatarId, setAvatarId] = useState(predefinedAvatars[0]?.id || 'avatar1');
  const [voiceId, setVoiceId] = useState(POPULAR_VOICES[0].id);
  const [layout, setLayout] = useState('split-left');
  const [theme, setTheme] = useState('dark');
  
  const [voices, setVoices] = useState(POPULAR_VOICES);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Fetch neural voices from HeyGen service on load
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoadingVoices(true);
        const responseData = await heygenService.getVoices({ limit: 100, type: 'public' });
        let voiceList = [];
        const data = responseData?.data || responseData;
        
        if (Array.isArray(data)) {
          voiceList = data;
        } else if (data?.voices) {
          voiceList = data.voices;
        } else if (responseData?.voices) {
          voiceList = responseData.voices;
        }

        if (voiceList.length > 0) {
          const mappedVoices = voiceList.map(v => ({
            id: v.voice_id || v.id,
            name: v.name || v.display_name || 'AI Voice',
            gender: v.gender || 'unknown',
            language: v.language || v.language_name || 'English',
            previewUrl: v.preview_audio_url || v.preview_url || v.preview_audio
          }));
          setVoices(mappedVoices);
          
          // Select default English voice if available
          const defaultVoice = mappedVoices.find(v => 
            v.name.toLowerCase().includes('sarah') || 
            v.name.toLowerCase().includes('adam')
          ) || mappedVoices[0];
          setVoiceId(defaultVoice.id);
        }
      } catch (err) {
        console.warn('Failed to load live voices, using high-fidelity fallback list:', err);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, []);

  const playPreview = (e, voiceVal) => {
    e.preventDefault();
    e.stopPropagation();
    const voiceObj = voices.find(v => v.id === voiceVal);
    if (voiceObj && voiceObj.previewUrl) {
      const audio = new Audio(voiceObj.previewUrl);
      audio.play().catch(err => console.error('Audio playback failed:', err));
    } else {
      alert('Preview audio not available for this voice.');
    }
  };

  const handleGenerate = (mode) => {
    if (!script.trim()) {
      alert('Please enter or paste your video script first.');
      return;
    }

    if (!onGenerateStoryboard) {
      alert('Storyboard generator is not hooked up properly.');
      return;
    }

    // Split script into paragraphs by double newlines or single newlines with spacing
    const paragraphs = script
      .split(/\n\s*\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paragraphs.length === 0) {
      alert('Please add at least one paragraph block to generate scenes.');
      return;
    }

    const storyboardScenes = paragraphs.map((paraText, pIdx) => {
      // Calculate scene duration (approx 2.3 words/sec, min 6s)
      const words = paraText.split(/\s+/).filter(w => w.length > 0);
      const duration = Math.max(6.0, Math.ceil((words.length / 2.3) * 10) / 10);

      // Extract a concise highlight phrase or first sentence
      const sentences = paraText.split(/[.!?]\s+/);
      let headline = sentences[0]?.trim() || '';
      if (headline) {
        const punctuationChar = paraText.charAt(headline.length);
        if (['.', '!', '?'].includes(punctuationChar)) {
          headline += punctuationChar;
        }
      }
      
      // Limit size of card text
      if (headline.length > 85) {
        headline = headline.substring(0, 82) + '...';
      }

      // Avatar information mapping
      const selectedAvatarObj = predefinedAvatars.find(av => av.id === avatarId) || predefinedAvatars[0];
      const avatarImage = selectedAvatarObj.image;
      const avatarName = selectedAvatarObj.name;

      // Color scheme tokens
      const isLightTheme = theme === 'light';
      const textColor = isLightTheme ? '#0f172a' : '#ffffff';
      let bgValue = '#101828';
      if (theme === 'indigo') bgValue = '#1e1b4b';
      else if (theme === 'emerald') bgValue = '#022c22';
      else if (theme === 'light') bgValue = '#f8fafc';

      const clips = [];

      if (layout === 'split-left') {
        // Layout: Presenter Left, Text Right
        clips.push({
          id: `clip_image_${Date.now()}_${pIdx}_1`, type: 'image', role: 'background-image', src: '',
          startTime: 0, endTime: duration, position: { x: 120, y: 200 }, size: { width: 600, height: 600 },
          style: { backgroundColor: '#f0fdf4', borderRadius: '32px', border: '4px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }, layer: 1
        });
        clips.push({
          id: `clip_avatar_${Date.now()}_${pIdx}_2`, type: 'avatar', role: 'avatar', src: avatarImage,
          startTime: 0, endTime: duration, position: { x: 570, y: 650 }, size: { width: 200, height: 200 },
          style: { borderRadius: '50%', border: '8px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, layer: 2
        });
        clips.push({
          id: `clip_title_${Date.now()}_${pIdx}_3`, type: 'text', role: 'main-text', content: headline || 'SCALE YOUR BRAND WITH AI VIDEO',
          startTime: 0, endTime: duration, position: { x: 950, y: 250 }, size: { width: 700, height: 200 },
          style: { fontSize: 72, fontWeight: '900', color: textColor, textAlign: 'left', lineHeight: 1.1, textTransform: 'uppercase' }, layer: 3
        });
        clips.push({
          id: `clip_subtitle_${Date.now()}_${pIdx}_4`, type: 'text', role: 'subtitle-text', content: paraText || 'Generate professional marketing content in seconds.',
          startTime: 0.5, endTime: duration, position: { x: 950, y: 460 }, size: { width: 700, height: 100 },
          style: { fontSize: 32, fontWeight: '500', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }, layer: 4
        });
        clips.push({
          id: `clip_btn_bg_${Date.now()}_${pIdx}_5`, type: 'shape', role: 'decoration',
          startTime: 0, endTime: duration, position: { x: 950, y: 580 }, size: { width: 280, height: 80 },
          style: { backgroundColor: '#10b981', borderRadius: '40px' }, layer: 5
        });
        clips.push({
          id: `clip_btn_line_${Date.now()}_${pIdx}_6`, type: 'shape', role: 'decoration',
          startTime: 0, endTime: duration, position: { x: 1025, y: 615 }, size: { width: 130, height: 10 },
          style: { backgroundColor: '#ffffff', borderRadius: '5px' }, layer: 6
        });
      } else if (layout === 'split-right') {
        // Layout: Text Left, Presenter Right
        clips.push({
          id: `clip_title_${Date.now()}_${pIdx}_1`, type: 'text', role: 'main-text', content: headline || 'YOUR NEXT BIG IDEA STARTS HERE',
          startTime: 0, endTime: duration, position: { x: 120, y: 250 }, size: { width: 700, height: 200 },
          style: { fontSize: 72, fontWeight: '900', color: textColor, textAlign: 'left', lineHeight: 1.1, textTransform: 'uppercase' }, layer: 1
        });
        clips.push({
          id: `clip_subtitle_${Date.now()}_${pIdx}_2`, type: 'text', role: 'subtitle-text', content: paraText || 'The ultimate platform for AI video generation and professional layouts.',
          startTime: 0.5, endTime: duration, position: { x: 120, y: 460 }, size: { width: 700, height: 100 },
          style: { fontSize: 32, fontWeight: '500', color: '#64748b', textAlign: 'left', lineHeight: 1.4 }, layer: 2
        });
        clips.push({
          id: `clip_btn_bg_${Date.now()}_${pIdx}_3`, type: 'shape', role: 'decoration',
          startTime: 0, endTime: duration, position: { x: 120, y: 580 }, size: { width: 280, height: 80 },
          style: { backgroundColor: '#3b82f6', borderRadius: '40px' }, layer: 3
        });
        clips.push({
          id: `clip_btn_line_${Date.now()}_${pIdx}_4`, type: 'shape', role: 'decoration',
          startTime: 0, endTime: duration, position: { x: 195, y: 615 }, size: { width: 130, height: 10 },
          style: { backgroundColor: '#ffffff', borderRadius: '5px' }, layer: 4
        });
        clips.push({
          id: `clip_image_${Date.now()}_${pIdx}_5`, type: 'image', role: 'background-image', src: '',
          startTime: 0, endTime: duration, position: { x: 950, y: 200 }, size: { width: 600, height: 600 },
          style: { backgroundColor: '#eef2ff', borderRadius: '32px', border: '4px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }, layer: 5
        });
        clips.push({
          id: `clip_avatar_${Date.now()}_${pIdx}_6`, type: 'avatar', role: 'avatar', src: avatarImage,
          startTime: 0, endTime: duration, position: { x: 1400, y: 650 }, size: { width: 200, height: 200 },
          style: { borderRadius: '50%', border: '8px solid #ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, layer: 6
        });
      } else {
        // Centered
        clips.push({
          id: `clip_avatar_${Date.now()}_${pIdx}_1`,
          type: 'avatar',
          role: 'avatar',
          src: avatarImage,
          startTime: 0,
          endTime: duration,
          position: { x: 515, y: 350 },
          size: { width: 250, height: 330 },
          opacity: 1.0,
          layer: 1
        });
        clips.push({
          id: `clip_text_${Date.now()}_${pIdx}_2`,
          type: 'text',
          role: 'main-text',
          content: headline,
          startTime: 0.5,
          endTime: duration,
          position: { x: 140, y: 80 },
          size: { width: 1000, height: 220 },
          style: {
            fontSize: 42,
            fontWeight: '800',
            color: textColor,
            textAlign: 'center',
            width: '1000px',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          opacity: 1.0,
          layer: 2
        });
      }

      return {
        id: `scene_${Date.now()}_${pIdx}`,
        sceneId: `scene_${Date.now()}_${pIdx}`,
        name: `Scene ${pIdx + 1}`,
        title: `Scene ${pIdx + 1}`,
        duration: duration,
        background: { type: 'color', value: bgValue },
        avatar: avatarImage,
        avatarType: avatarId,
        avatarName: avatarName,
        voiceId: voiceId,
        script: paraText,
        clips: clips
      };
    });

    onGenerateStoryboard(storyboardScenes, mode);
  };

  return (
    <div className="tool-panel-content elements-ui" style={{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Premium Header area with Purple/Pink Gradient */}
      <div style={{
        padding: '24px 20px 16px',
        background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0) 100%)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
             AI Studio <MdAutoAwesome style={{ color: '#a855f7' }} size={16}/>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Create storyboard instantly from scripts</p>
        </div>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }} className="premium-scrollbar">
        {/* Step 1: Script Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <MdChatBubbleOutline size={16} /> Enter Video Script
          </label>
          <textarea
            className="premium-property-input"
            placeholder="Paste your video script here. We recommend separating your script with double newlines (paragraphs) to create multiple distinct scenes.&#10;&#10;e.g.&#10;Paragraph 1 is scene one.&#10;&#10;Paragraph 2 is scene two."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            style={{ 
              minHeight: '140px', 
              fontSize: '13px', 
              lineHeight: '1.5',
              padding: '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Step 2: Global Presenter Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <MdPerson size={16} /> Default Presenter
          </label>
          <select 
            className="premium-property-select"
            value={avatarId}
            onChange={(e) => setAvatarId(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          >
            {predefinedAvatars.map(av => (
              <option key={av.id} value={av.id}>
                {av.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Voice Selection */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              <MdVolumeUp size={16} /> Text-To-Speech Voice
            </label>
            <button 
              onClick={(e) => playPreview(e, voiceId)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(26, 115, 232, 0.06)'
              }}
            >
              <MdPlayArrow size={14} /> Listen
            </button>
          </div>
          
          <select 
            className="premium-property-select"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
            disabled={loadingVoices && voices.length === 0}
          >
            {loadingVoices && voices.length === 0 ? (
              <option>Loading neural voices...</option>
            ) : (
              voices.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.language})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Step 4: Layout Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <MdDashboard size={16} /> Layout Style
          </label>
          <select 
            className="premium-property-select"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          >
            <option value="split-left">Left Presenter, Right Text</option>
            <option value="split-right">Right Presenter, Left Text</option>
            <option value="centered">Centered Text, Bottom Presenter</option>
          </select>
        </div>

        {/* Step 5: Theme Preset Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <MdPalette size={16} /> Background Theme
          </label>
          <select 
            className="premium-property-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          >
            <option value="dark">Dark Slate (#101828)</option>
            <option value="indigo">Indigo Dream (#1e1b4b)</option>
            <option value="emerald">Emerald Forest (#022c22)</option>
            <option value="light">Minimal Light (#f8fafc)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn-primary w-100" 
            onClick={() => handleGenerate('replace')}
            style={{ 
              padding: '12px', 
              fontSize: '13px', 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', 
              border: 'none',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)'
            }}
          >
            <MdAutoAwesome style={{ marginRight: '6px' }} /> Build Storyboard (Overwrite)
          </button>
          
          <button 
            className="btn-secondary w-100" 
            onClick={() => handleGenerate('append')}
            style={{ 
              padding: '12px', 
              fontSize: '13px', 
              fontWeight: '600',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
          >
            Append to Timeline
          </button>
        </div>

        {/* Secondary AI Utilities - Kept as placeholders to enrich panel */}
        <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            More AI Utilities
          </h4>
          
          <div className="magic-card" style={{ marginBottom: '12px', opacity: 0.8 }}>
            <div className="magic-card-header">
              <MdClosedCaption size={18} />
              <h5>Auto-Captions</h5>
            </div>
            <p className="magic-desc">Automatically transcribe and sync subtitles based on the audio track.</p>
            <button className="btn-secondary magic-btn w-100" disabled style={{ fontSize: '12px', cursor: 'not-allowed' }}>
              Transcribe Track (Coming Soon)
            </button>
          </div>

          <div className="magic-card" style={{ opacity: 0.8 }}>
            <div className="magic-card-header">
              <MdOutlineImageSearch size={18} />
              <h5>AI Image Generator</h5>
            </div>
            <p className="magic-desc">Generate premium graphics and backgrounds using Text-To-Image.</p>
            <button className="btn-secondary magic-btn w-100" disabled style={{ fontSize: '12px', cursor: 'not-allowed' }}>
              Dream Image (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarMagic;
