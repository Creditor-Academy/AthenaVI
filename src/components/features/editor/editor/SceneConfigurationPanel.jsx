import { 
  MdMic, 
  MdTimer, 
  MdAutoAwesome, 
  MdFormatAlignLeft, 
  MdFormatAlignCenter, 
  MdFormatAlignRight,
  MdTextFields,
  MdGraphicEq,
  MdColorLens,
  MdAnimation,
  MdSettings,
  MdStyle,
  MdLayers,
  MdMonitor,
  MdDesignServices,
  MdPlayCircleFilled,
  MdTune
} from 'react-icons/md';
import projectTemplate from '../../../../constants/projectTemplate.json';

const SceneConfigurationPanel = ({ 
  activeScene, 
  activeSceneId, 
  updateScene, 
  bgMusic, 
  setBgMusic, 
  bgMusicVolume, 
  setBgMusicVolume,
  selectedLayerId,
  generateSceneVideo,
  setActiveTab,
  applyGlobalSetting
}) => {
  if (!activeScene) return null;

  const clips = activeScene.clips || [];
  const activeLayer = clips.find(l => l.id === selectedLayerId);
  const textClip = clips.find(c => c.type === 'text' || c.role === 'main-text');
  const headlineText = textClip ? textClip.content : (activeScene.titleText || '');
  const headlineFontSize = textClip?.style?.fontSize || activeScene.titleStyle?.fontSize || 48;
  
  const updateLayer = (updates) => {
      const newClips = clips.map(l => l.id === selectedLayerId ? { ...l, ...updates } : l);
      updateScene(activeSceneId, { clips: newClips });
  }

  if (activeLayer) {
    return (
      <div className="premium-properties-panel premium-scrollbar">
        <div className="panel-header">
          <MdTune className="header-icon" />
          <h3>Layer Properties</h3>
        </div>

        <div className="property-section accent-cyan">
          <div className="section-label">
            <span>Clip Role: <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>{activeLayer.role?.replace('-', ' ').toUpperCase() || 'GENERAL'}</span></span>
          </div>
          
          {/* CONTENT EDITING BASED ON ROLE */}
          {activeLayer.role === 'main-text' || activeLayer.type === 'text' ? (
            <div className="premium-row column" style={{ marginTop: '16px' }}>
              <div className="row-label">Text Content</div>
              <textarea 
                className="premium-textarea" 
                value={activeLayer.content || ''} 
                onChange={(e) => updateLayer({ content: e.target.value })}
                rows={3}
              />
            </div>
          ) : (activeLayer.role === 'avatar' || activeLayer.role === 'media') && (
            <div className="premium-row column" style={{ marginTop: '16px' }}>
              <div className="row-label">Asset URL</div>
              <input 
                type="text" 
                className="premium-input" 
                value={activeLayer.src || ''} 
                onChange={(e) => updateLayer({ src: e.target.value })}
                placeholder="https://..."
              />
              <button 
                className="premium-button-outline" 
                style={{ marginTop: '8px', width: '100%' }}
                onClick={() => alert('Asset library coming soon!')}
              >
                Change {activeLayer.role}
              </button>
            </div>
          )}

          <div className="section-label" style={{ marginTop: '20px' }}>
            <span>Visual Properties</span>
          </div>

          <div className="slider-group">
            <div className="row-label">Opacity</div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={activeLayer.opacity ?? 1} 
              onChange={(e) => updateLayer({ opacity: Number(e.target.value) })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{Math.round((activeLayer.opacity ?? 1) * 100)}%</span>
          </div>

          {activeLayer.type === 'text' && (
             <div className="premium-row column" style={{ marginTop: '16px' }}>
                <div className="row-label">Font Size</div>
                <div className="slider-group">
                    <input 
                      type="range" 
                      min="12" max="120" step="1" 
                      value={activeLayer.style?.fontSize || 32} 
                      onChange={(e) => updateLayer({ style: { ...activeLayer.style, fontSize: Number(e.target.value) } })} 
                      className="premium-slider slider-cyan" 
                    />
                    <span className="slider-value">{activeLayer.style?.fontSize || 32}px</span>
                </div>
             </div>
          )}

          <div className="section-label" style={{marginTop: '16px'}}>
            <span>Effects</span>
          </div>
          <div className="slider-group">
            <div className="row-label">Brightness</div>
            <input 
              type="range" 
              min="0" max="2" step="0.05" 
              value={activeLayer.effects?.brightness ?? 1} 
              onChange={(e) => updateLayer({ effects: { ...activeLayer.effects, brightness: Number(e.target.value) } })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{Math.round((activeLayer.effects?.brightness ?? 1) * 100)}%</span>
          </div>

          <div className="premium-row" style={{ marginTop: '16px', justifyContent: 'space-between' }}>
             <div className="row-label">Visibility</div>
             <input 
               type="checkbox" 
               checked={activeLayer.visible !== false} 
               onChange={(e) => updateLayer({ visible: e.target.checked })}
             />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-properties-panel premium-scrollbar">
      <div className="panel-header">
        <MdAutoAwesome className="header-icon" />
        <h3>Scene Settings</h3>
      </div>

      {/* SCENE COMPOSITION */}
      <div className="property-section accent-cyan">
        <div className="section-label">
            <MdMonitor style={{ color: '#0891b2' }} /> <span>Visual Composition</span>
        </div>
        
        <div className="premium-row column">
          <div className="row-label">Scene Layout</div>
          <select 
            className="premium-select" 
            value={activeScene.layout || 'split-right'}
            onChange={(e) => {
                const newLayout = e.target.value;
                const template = projectTemplate.project.scenes.find(t => t.id === newLayout);
                let newClips = clips;
                
                if (template) {
                    let templateClips = JSON.parse(JSON.stringify(template.clips));
                    
                    // Retain avatar
                    let existingAvatar = clips.find(c => c.role === 'avatar' || c.type === 'video');
                    if (existingAvatar) {
                        let avatarIndex = templateClips.findIndex(c => 
                            c.label?.toLowerCase().includes('avatar') || 
                            c.label?.toLowerCase().includes('media') || 
                            c.label?.toLowerCase().includes('center image') ||
                            (c.type === 'image' && !c.label?.toLowerCase().includes('logo'))
                        );
                        if (avatarIndex !== -1) {
                            templateClips[avatarIndex] = { ...templateClips[avatarIndex], src: existingAvatar.src, type: existingAvatar.type, role: 'avatar' };
                        }
                    }
                    
                    // Retain text
                    let existingText = clips.find(c => c.type === 'text' || c.role === 'main-text');
                    if (existingText) {
                        let textIndex = templateClips.findIndex(c => c.type === 'text');
                        if (textIndex !== -1) {
                            templateClips[textIndex].content = existingText.content;
                        }
                    }
                    newClips = templateClips;
                }
                
                updateScene(activeSceneId, { layout: newLayout, clips: newClips });
            }}
          >
            {projectTemplate.project.scenes.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <div className="premium-row">
            <div className="row-label">Background Blur</div>
            <div className="slider-group">
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={activeScene.bgBlur || 0}
                    onChange={(e) => updateScene(activeSceneId, { bgBlur: Number(e.target.value) })}
                    className="premium-slider slider-cyan"
                />
                <span className="slider-value">{activeScene.bgBlur || 0}px</span>
            </div>
        </div>
      </div>

      {/* CORE CONFIG */}
      <div className="property-section accent-blue">
        <div className="section-label">
            <MdTimer style={{ color: '#2563eb' }} /> <span>Timing & Playback</span>
        </div>
        
        <div className="premium-row">
          <div className="row-label">Duration</div>
          <div className="slider-group">
            <input
                type="range"
                min="1"
                max="60"
                step="0.5"
                value={activeScene.duration || 8}
                onChange={(e) => updateScene(activeSceneId, { duration: Number(e.target.value) })}
                className="premium-slider slider-blue"
            />
            <span className="slider-value">{(activeScene.duration || 8).toFixed(1)}s</span>
          </div>
        </div>

        <div className="premium-row">
          <div className="row-label">Entrance Speed</div>
          <select className="premium-select">
            <option>Normal (1.0x)</option>
            <option>Fast (1.5x)</option>
            <option>Slow (0.5x)</option>
          </select>
        </div>
      </div>

      {/* TEXT STYLING - EXPANDED */}
      <div className="property-section accent-indigo">
        <div className="section-label">
            <MdTextFields style={{ color: '#4f46e5' }} /> <span>Typography & Style</span>
        </div>
        
        <div className="premium-row column">
          <div className="row-label">Headline Text</div>
          <input
            type="text"
            className="premium-input"
            value={headlineText}
            onChange={(e) => {
                const val = e.target.value;
                if (textClip) {
                    const newClips = clips.map(c => c.id === textClip.id ? { ...c, content: val } : c);
                    updateScene(activeSceneId, { titleText: val, clips: newClips });
                } else {
                    updateScene(activeSceneId, { titleText: val });
                }
            }}
            placeholder="Main title..."
          />
        </div>

        <div className="premium-row column">
            <div className="row-label">Headline Settings</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                <div className="slider-group">
                    <MdStyle style={{ opacity: 0.5 }} />
                    <input
                        type="range"
                        min="20"
                        max="120"
                        value={headlineFontSize}
                        onChange={(e) => {
                            const newSize = Number(e.target.value);
                            if (textClip) {
                                const newClips = clips.map(c => c.id === textClip.id ? { ...c, style: { ...c.style, fontSize: newSize } } : c);
                                updateScene(activeSceneId, { clips: newClips, titleStyle: { ...activeScene.titleStyle, fontSize: newSize } });
                            } else {
                                updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, fontSize: newSize } });
                            }
                        }}
                        className="premium-slider slider-indigo"
                    />
                    <span className="slider-value">{activeScene.titleStyle?.fontSize || 48}px</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdColorLens style={{ opacity: 0.5, color: '#4f46e5' }} />
                    <input 
                        type="color" 
                        value={activeScene.titleStyle?.color || '#000000'}
                        onChange={(e) => updateScene(activeSceneId, { 
                            titleStyle: { ...activeScene.titleStyle, color: e.target.value } 
                        })}
                        style={{ border: 'none', background: 'none', width: '32px', height: '32px', padding: 0, cursor: 'pointer' }}
                    />
                </div>
            </div>
        </div>

        <div className="alignment-group">
            <button 
                className={`align-btn ${activeScene.titleStyle?.textAlign === 'left' ? 'active active-indigo' : ''}`}
                onClick={() => updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, textAlign: 'left' } })}
            >
                <MdFormatAlignLeft />
            </button>
            <button 
                className={`align-btn ${(!activeScene.titleStyle?.textAlign || activeScene.titleStyle?.textAlign === 'center') ? 'active active-indigo' : ''}`}
                onClick={() => updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, textAlign: 'center' } })}
            >
                <MdFormatAlignCenter />
            </button>
            <button 
                className={`align-btn ${activeScene.titleStyle?.textAlign === 'right' ? 'active active-indigo' : ''}`}
                onClick={() => updateScene(activeSceneId, { titleStyle: { ...activeScene.titleStyle, textAlign: 'right' } })}
            >
                <MdFormatAlignRight />
            </button>
        </div>
      </div>

      {/* VOICE SCRIPT - EXPANDED */}
      <div className="property-section accent-purple">
        <div className="section-label">
            <MdMic style={{ color: '#9333ea' }} /> <span>AI Voiceover & Script</span>
        </div>

        {/* Selected Avatar & Voice Status */}
        <div style={{ 
            background: 'linear-gradient(135deg, #f8f5ff 0%, #f3ebff 100%)', 
            borderRadius: '16px', 
            padding: '16px', 
            marginBottom: '20px',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.05), inset 0 2px 4px rgba(255,255,255,0.8)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(147, 51, 234, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                            width: '10px', height: '10px', borderRadius: '50%', 
                            background: activeScene.avatarType ? '#10b981' : '#ef4444',
                            boxShadow: activeScene.avatarType ? '0 0 8px #10b981' : '0 0 8px #ef4444'
                        }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                            Avatar <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>{activeScene.avatarName || activeScene.avatarType || <span style={{ color: '#ef4444' }}>None</span>}</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                            style={{ 
                                padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '6px',
                                background: 'white', color: '#9333ea', border: '1px solid #d8b4fe', cursor: 'pointer',
                                transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(147,51,234,0.1)'
                            }} 
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            onClick={() => setActiveTab && setActiveTab('avatar')}
                        >Change</button>
                        {activeScene.avatarType && (
                            <button 
                                style={{ 
                                    padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '6px',
                                    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)', color: 'white', border: 'none', cursor: 'pointer',
                                    transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(147,51,234,0.3)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 10px rgba(147,51,234,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(147,51,234,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                onClick={() => applyGlobalSetting && applyGlobalSetting('avatar')} title="Use this avatar in all scenes"
                            >Apply All</button>
                        )}
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                            width: '10px', height: '10px', borderRadius: '50%', 
                            background: activeScene.voiceId ? '#10b981' : '#ef4444',
                            boxShadow: activeScene.voiceId ? '0 0 8px #10b981' : '0 0 8px #ef4444'
                        }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                            Voice <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>{activeScene.voiceName || activeScene.voiceId || <span style={{ color: '#ef4444' }}>None</span>}</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                            style={{ 
                                padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '6px',
                                background: 'white', color: '#9333ea', border: '1px solid #d8b4fe', cursor: 'pointer',
                                transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(147,51,234,0.1)'
                            }} 
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            onClick={() => setActiveTab && setActiveTab('mic')}
                        >Change</button>
                        {activeScene.voiceId && (
                            <button 
                                style={{ 
                                    padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '6px',
                                    background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)', color: 'white', border: 'none', cursor: 'pointer',
                                    transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(147,51,234,0.3)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 10px rgba(147,51,234,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(147,51,234,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                onClick={() => applyGlobalSetting && applyGlobalSetting('voice')} title="Use this voice in all scenes"
                            >Apply All</button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <textarea
          className="premium-textarea"
          placeholder="Speak your words here..."
          value={activeScene.script || ''}
          onChange={(e) => updateScene(activeSceneId, { script: e.target.value })}
          rows={4}
        />
        
        <div className="premium-row">
            <div className="row-label">Voice Speed</div>
            <div className="slider-group">
                <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={activeScene.voiceSettings?.speed || 1} 
                    onChange={(e) => updateScene(activeSceneId, { 
                        voiceSettings: { 
                            ...(activeScene.voiceSettings || { pitch: 0, locale: 'en-US' }), 
                            speed: Number(e.target.value) 
                        } 
                    })}
                    className="premium-slider slider-purple" 
                />
                <span className="slider-value">{activeScene.voiceSettings?.speed || 1}x</span>
            </div>
        </div>
        <div className="text-hint">Total: {(activeScene.script || '').length} characters</div>
        
        {/* HeyGen Generation Button */}
        <div style={{ marginTop: '20px' }}>
            <button 
                className="premium-button-primary"
                style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    padding: '12px',
                    background: activeScene.heygenStatus === 'processing' ? 'var(--bg-surface)' : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                    cursor: activeScene.heygenStatus === 'processing' ? 'wait' : 'pointer',
                    opacity: (!activeScene.avatarType || !activeScene.voiceId || !activeScene.script) && activeScene.heygenStatus !== 'processing' ? 0.5 : 1
                }}
                onClick={() => generateSceneVideo(activeSceneId)}
                disabled={activeScene.heygenStatus === 'processing' || (!activeScene.avatarType || !activeScene.voiceId || !activeScene.script)}
            >
                {activeScene.heygenStatus === 'processing' ? (
                    <>
                        <div className="spinner-small" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <span>Generating Video...</span>
                    </>
                ) : activeScene.heygenStatus === 'completed' ? (
                    <>
                        <MdPlayCircleFilled size={20} />
                        <span>Regenerate Scene</span>
                    </>
                ) : (
                    <>
                        <MdAutoAwesome size={20} />
                        <span>Generate Scene Video</span>
                    </>
                )}
            </button>
            
            {activeScene.heygenStatus === 'processing' && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                    HeyGen is crafting your video. This may take a minute.
                </p>
            )}
            
            {activeScene.heygenStatus === 'completed' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <p style={{ fontSize: '11px', color: '#10b981', textAlign: 'center', margin: '0', fontWeight: '500' }}>
                        ✓ Video generated successfully
                    </p>
                    <button 
                        className="premium-button-outline"
                        style={{ width: '100%', padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => {
                            const url = activeScene.generatedVideoUrl || activeScene.clips?.find(c => c.role === 'avatar' || c.type === 'video')?.src;
                            if (url) {
                                window.dispatchEvent(new CustomEvent('open-generated-video', { detail: { url } }));
                            } else {
                                alert('Video URL not found. It might still be processing.');
                            }
                        }}
                    >
                        <MdMonitor size={16} /> View Generated Video
                    </button>
                </div>
            )}

            {activeScene.heygenStatus === 'failed' && (
                <p style={{ fontSize: '11px', color: 'var(--delete-red)', textAlign: 'center', marginTop: '8px' }}>
                    ⚠ Generation failed. Please try again.
                </p>
            )}
        </div>
      </div>

      {/* ANIMATION & TRANSITIONS */}
      <div className="property-section accent-pink">
        <div className="section-label">
            <MdAnimation style={{ color: '#db2777' }} /> <span>Motion & Transitions</span>
        </div>
        
        <div className="premium-row column">
          <div className="row-label">Transition Style</div>
          <select 
            className="premium-select" 
            value={activeScene.transition || 'fade'}
            onChange={(e) => updateScene(activeSceneId, { transition: e.target.value })}
          >
            <option value="fade">Dissolve (Fade)</option>
            <option value="slide">Slide Push</option>
            <option value="zoom">Warp Zoom</option>
            <option value="blur">Motion Blur</option>
            <option value="none">No Transition</option>
          </select>
        </div>

        <div className="premium-row">
            <div className="row-label">Motion Blur Strength</div>
            <input type="checkbox" defaultChecked />
        </div>
      </div>

      {/* AUDIO TRACK */}
      <div className="property-section accent-orange">
        <div className="section-label">
            <MdGraphicEq style={{ color: '#ea580c' }} /> <span>Audio Levels</span>
        </div>
        
        <div className="premium-row">
          <div className="row-label">Background Music</div>
          <div className="slider-group">
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bgMusicVolume}
                onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                className="premium-slider slider-orange"
            />
            <span className="slider-value">{Math.round(bgMusicVolume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SceneConfigurationPanel
