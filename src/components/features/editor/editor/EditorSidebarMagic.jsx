import React from 'react';
import { MdAutoAwesome, MdChatBubbleOutline, MdClosedCaption, MdOutlineImageSearch } from 'react-icons/md';

const EditorSidebarMagic = () => {
  return (
    <div className="tool-panel-content">
      <div className="tool-section">
        <h4 className="tool-section-title">
          <MdAutoAwesome className="magic-icon" /> AI Studio
        </h4>
        <p className="magic-subtitle">Supercharge your video creation with AI.</p>

        <div className="magic-card">
          <div className="magic-card-header">
            <MdChatBubbleOutline size={18} />
            <h5>Script Generator</h5>
          </div>
          <textarea
            className="premium-property-input"
            placeholder="What is your video about? e.g. 'A 30 second intro about digital marketing...'"
            style={{ minHeight: '80px', marginBottom: '8px' }}
          />
          <button className="btn-primary magic-btn w-100" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none' }}>
            <MdAutoAwesome /> Generate Script
          </button>
        </div>

        <div className="magic-card">
          <div className="magic-card-header">
            <MdClosedCaption size={18} />
            <h5>Auto-Captions</h5>
          </div>
          <p className="magic-desc">Automatically transcribe and sync subtitles based on the audio track.</p>
          <button className="btn-secondary magic-btn w-100" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            Fetch Audio & Caption
          </button>
        </div>

        <div className="magic-card">
          <div className="magic-card-header">
            <MdOutlineImageSearch size={18} />
            <h5>AI Image Generator</h5>
          </div>
          <input
            className="premium-property-input"
            placeholder="Describe an image..."
            style={{ marginBottom: '8px' }}
          />
          <button className="btn-secondary magic-btn w-100" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#d8b4fe' }}>
            <MdAutoAwesome /> Dream Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarMagic;
