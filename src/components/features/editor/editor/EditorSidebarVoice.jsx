import React from 'react';
import { MdMic } from 'react-icons/md';
import { predefinedAudios } from '../../../../constants/editorData';

const EditorSidebarVoice = () => {
  return (
    <div className="tool-panel-content">
      <div className="tool-section">
        <h4 className="tool-section-title">AI Voices</h4>
        <div className="voice-tabs">
          <button className="voice-tab active">SULTAN</button>
          <button className="voice-tab">MODERN</button>
        </div>
        <div className="audio-list">
          {[
            { id: 'v1', name: 'James', type: 'Professional', gender: 'Male' },
            { id: 'v2', name: 'Sarah', type: 'Natural', gender: 'Female' },
            { id: 'v3', name: 'Michael', type: 'Deep', gender: 'Male' },
            { id: 'v4', name: 'Emma', type: 'Friendly', gender: 'Female' }
          ].map((voice) => (
            <div key={voice.id} className="audio-item">
              <div className="audio-info">
                <div className="voice-avatar">
                  {voice.name[0]}
                </div>
                <div className="voice-details">
                  <span className="voice-name">{voice.name}</span>
                  <span className="voice-meta">{voice.type} • {voice.gender}</span>
                </div>
              </div>
              <button className="play-preview-btn">▶</button>
            </div>
          ))}
        </div>
      </div>

      <div className="tool-section" style={{ marginTop: '24px' }}>
        <h4 className="tool-section-title">Background Music</h4>
        <div className="audio-list">
          {predefinedAudios.map((audio) => (
            <div
              key={audio.id}
              className="audio-item"
              onClick={() => alert(`Applied ${audio.name}`)}
            >
              <div className="audio-info">
                <MdMic size={20} color="var(--primary)" />
                <span>{audio.name}</span>
              </div>
              <span className="audio-duration">
                {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarVoice;
