import { MdMic, MdPhotoLibrary } from 'react-icons/md'

const SceneConfigurationPanel = ({ 
  activeScene, 
  activeSceneId, 
  updateScene, 
  bgMusic, 
  setBgMusic, 
  bgMusicVolume, 
  setBgMusicVolume 
}) => {
  return (
    <div className="properties-panel">
      {/* General Properties */}
      <div className="property-group">
        <h3 className="property-title">Scene Configuration</h3>
        <div className="property-row">
          <label className="property-label">Duration (seconds)</label>
          <input
            className="property-input"
            type="number"
            value={activeScene?.duration || 8}
            onChange={(e) => updateScene(activeSceneId, { duration: Number(e.target.value) })}
          />
        </div>
        <div className="property-row">
          <label className="property-label">Transition</label>
          <select className="property-input" defaultValue="fade">
            <option value="none">None (Cut)</option>
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
          </select>
        </div>
      </div>

      <div className="property-group">
        <h3 className="property-title">
          <MdMic style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Voiceover Script
        </h3>
        <textarea
          className="script-input"
          placeholder="What will the AI say?"
          value={activeScene?.script || ''}
          onChange={(e) => updateScene(activeSceneId, { script: e.target.value })}
          rows={4}
        />
      </div>

      <div className="property-group">
        <h3 className="property-title">
          <MdPhotoLibrary style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Text Styling
        </h3>
        <div className="property-row">
          <label className="property-label">Title Text</label>
          <input
            type="text"
            className="property-input"
            value={activeScene?.titleText || ''}
            onChange={(e) => updateScene(activeSceneId, { titleText: e.target.value })}
            placeholder="Enter title text..."
          />
        </div>
        <div className="property-row">
          <label className="property-label">Subtitle Text</label>
          <input
            type="text"
            className="property-input"
            value={activeScene?.subtitleText || ''}
            onChange={(e) => updateScene(activeSceneId, { subtitleText: e.target.value })}
            placeholder="Enter subtitle text..."
          />
        </div>
      </div>

      <div className="property-group">
        <h3 className="property-title">
          <MdPhotoLibrary style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Background Music
        </h3>
        <div className="property-row">
          <label className="property-label">Select Audio</label>
          <select
            className="property-input"
            value={bgMusic}
            onChange={(e) => setBgMusic(e.target.value)}
          >
            <option value="">None</option>
            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">Acoustic Guitar</option>
            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3">Upbeat Tech</option>
            <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">Ambient Corporate</option>
          </select>
        </div>
        <div className="property-row">
          <label className="property-label">Volume: {Math.round(bgMusicVolume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={bgMusicVolume}
            onChange={(e) => setBgMusicVolume(Number(e.target.value))}
            className="property-input"
          />
        </div>
      </div>
    </div>
  )
}

export default SceneConfigurationPanel
