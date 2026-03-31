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
} from 'react-icons/md'

const SceneConfigurationPanel = ({ 
  activeScene, 
  activeSceneId, 
  updateScene, 
  bgMusic, 
  setBgMusic, 
  bgMusicVolume, 
  setBgMusicVolume,
  selectedLayerId
}) => {
  if (!activeScene) return null;

  const clips = activeScene.clips || [];
  const activeLayer = clips.find(l => l.id === selectedLayerId);
  
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
            <span>Opacity</span>
          </div>
          <div className="slider-group">
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={activeLayer.opacity ?? 1} 
              onChange={(e) => updateLayer({ opacity: Number(e.target.value) })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{Math.round((activeLayer.opacity ?? 1) * 100)}%</span>
          </div>

          <div className="section-label" style={{marginTop: '16px'}}>
            <span>Brightness</span>
          </div>
          <div className="slider-group">
            <input 
              type="range" 
              min="0" max="2" step="0.05" 
              value={activeLayer.effects?.brightness ?? 1} 
              onChange={(e) => updateLayer({ effects: { ...activeLayer.effects, brightness: Number(e.target.value) } })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{Math.round((activeLayer.effects?.brightness ?? 1) * 100)}%</span>
          </div>

          <div className="section-label" style={{marginTop: '16px'}}>
            <span>Contrast</span>
          </div>
          <div className="slider-group">
            <input 
              type="range" 
              min="0" max="2" step="0.05" 
              value={activeLayer.effects?.contrast ?? 1} 
              onChange={(e) => updateLayer({ effects: { ...activeLayer.effects, contrast: Number(e.target.value) } })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{Math.round((activeLayer.effects?.contrast ?? 1) * 100)}%</span>
          </div>

          <div className="section-label" style={{marginTop: '16px'}}>
            <span>Saturation</span>
          </div>
          <div className="slider-group">
            <input 
              type="range" 
              min="0" max="2" step="0.05" 
              value={activeLayer.effects?.saturation ?? 1} 
              onChange={(e) => updateLayer({ effects: { ...activeLayer.effects, saturation: Number(e.target.value) } })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{Math.round((activeLayer.effects?.saturation ?? 1) * 100)}%</span>
          </div>

          <div className="section-label" style={{marginTop: '16px'}}>
            <span>Blur</span>
          </div>
          <div className="slider-group">
            <input 
              type="range" 
              min="0" max="20" step="1" 
              value={activeLayer.effects?.blur ?? 0} 
              onChange={(e) => updateLayer({ effects: { ...activeLayer.effects, blur: Number(e.target.value) } })} 
              className="premium-slider slider-cyan" 
            />
            <span className="slider-value">{activeLayer.effects?.blur ?? 0}px</span>
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
            onChange={(e) => updateScene(activeSceneId, { layout: e.target.value })}
          >
            <option value="split-right">Split Right (Avatar Right)</option>
            <option value="split-left">Split Left (Avatar Left)</option>
            <option value="centered">Centered Overlay</option>
            <option value="full-avatar">Focus Avatar</option>
            <option value="full-content">Focus Content</option>
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
            value={activeScene.titleText || ''}
            onChange={(e) => updateScene(activeSceneId, { titleText: e.target.value })}
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
                        value={activeScene.titleStyle?.fontSize || 48}
                        onChange={(e) => updateScene(activeSceneId, { 
                            titleStyle: { ...activeScene.titleStyle, fontSize: Number(e.target.value) } 
                        })}
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
                <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="premium-slider slider-purple" />
                <span className="slider-value">1.1x</span>
            </div>
        </div>
        <div className="text-hint">Total: {(activeScene.script || '').length} characters</div>
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
