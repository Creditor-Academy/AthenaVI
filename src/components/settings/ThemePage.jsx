import React from 'react';
import { MdPalette, MdLightMode, MdDarkMode, MdCheckCircle } from 'react-icons/md';
import { useTheme } from '../../contexts/ThemeContext';

const ThemePage = () => {
  const { theme, setTheme, mode, setMode, saveSettings, rollbackSettings, hasUnsavedChanges } = useTheme();

  const themes = [
    { id: 'default', name: 'Original', color: '#6366f1', secondary: '#a855f7', desc: 'Indigo-Violet' },
    { id: 'sapphire', name: 'Sapphire', color: '#2563eb', secondary: '#3b82f6', desc: 'Corporate Blue' },
    { id: 'ocean', name: 'Ocean', color: '#0ea5e9', secondary: '#5eead4', desc: 'Sky & Water' },
    { id: 'forest', name: 'Forest', color: '#22c55e', secondary: '#eab308', desc: 'Nature' },
    { id: 'sunset', name: 'Sunset', color: '#f43f5e', secondary: '#f97316', desc: 'Warm Sun' }
  ];

  const modes = [
    { id: 'light', name: 'Light', icon: <MdLightMode />, desc: 'Classic bright look' },
    { id: 'dark', name: 'Dark', icon: <MdDarkMode />, desc: 'Easy on the eyes' }
  ];

  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Appearance</h3>
        <p>Tailor your workspace aesthetics for maximum productivity and comfort. Selected changes reflect instantly.</p>
      </header>

      <div className="settings-card appearance-master-card">
        <div className="settings-group">
          {/* Interface Mode Selection */}
          <div className="appearance-block">
            <header className="block-header">
              <div>
                <h4>Interface Mode</h4>
                <p>Switch between light and dark modes or follow your system.</p>
              </div>
            </header>
            
            <div className="mode-selection-square-grid">
              {modes.map(m => (
                <div 
                  key={m.id}
                  className={`mode-card-square ${mode === m.id ? 'active' : ''}`}
                  onClick={() => setMode(m.id)}
                >
                  <div className={`mode-preview-box preview-${m.id}`}>
                    <div className="preview-sidebar" />
                    <div className="preview-main">
                      <div className="preview-header" />
                      <div className="preview-content">
                        <div className="preview-line" />
                        <div className="preview-line-short" />
                      </div>
                    </div>
                  </div>
                  <div className="mode-card-info">
                    <div className="mode-card-title">
                      {m.icon} <span>{m.name}</span>
                    </div>
                    <span className="mode-card-desc">{m.desc}</span>
                  </div>
                  {mode === m.id && <MdCheckCircle className="mode-square-check" />}
                </div>
              ))}
            </div>
          </div>

          <div className="appearance-divider" />

          {/* Theme Selection */}
          <div className="appearance-block">
            <header className="block-header">
              <div>
                <h4>Theme Palette</h4>
                <p>Accent colors used for buttons, links, and high-focus elements.</p>
              </div>
            </header>

            <div className="theme-selection-square-grid">
              {themes.map(t => (
                <div 
                  key={t.id}
                  className={`theme-card-square ${theme === t.id ? 'active' : ''}`}
                  onClick={() => setTheme(t.id)}
                >
                  <div className={`mode-preview-box theme-preview-${t.id}`}>
                    <div className="preview-sidebar">
                      <div className="preview-nav-item active" style={{ backgroundColor: t.color, opacity: 0.2 }} />
                      <div className="preview-nav-item" />
                      <div className="preview-nav-item" />
                    </div>
                    <div className="preview-main">
                      <div className="preview-header">
                         <div className="preview-btn-mini" style={{ backgroundColor: t.color }} />
                      </div>
                      <div className="preview-content">
                        <div className="preview-line" />
                        <div className="preview-line-short" style={{ backgroundColor: t.color, opacity: 0.4 }} />
                      </div>
                    </div>
                  </div>
                  <div className="theme-card-info">
                    <span className="theme-card-name">{t.name}</span>
                    <span className="theme-card-desc">{t.desc}</span>
                  </div>
                  {theme === t.id && <MdCheckCircle className="theme-square-check" />}
                </div>
              ))}
            </div>
          </div>

          {/* Apply Banner */}
          {hasUnsavedChanges() && (
            <div className="appearance-apply-banner">
              <div className="banner-context">
                <div className="banner-icon-ring">
                  <MdPalette />
                </div>
                <div className="banner-text-group">
                  <h5>Unsaved Changes</h5>
                  <p>Apply these changes to save them as your preference.</p>
                </div>
              </div>
              <div className="banner-actions">
                <button className="btn-secondary-flat" onClick={rollbackSettings}>Discard</button>
                <button className="btn-primary-apply" onClick={saveSettings}>Apply Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemePage;
