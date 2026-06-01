import React, { useEffect } from 'react';
import { MdPalette, MdLightMode, MdDarkMode, MdCheckCircle } from 'react-icons/md';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  getAccentDisabledReason,
  isAccentAllowedForMode
} from '../../../../utils/accentColorUtils.js';

const QUICK_SWATCHES = ['#2563eb', '#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#111827'];
const FALLBACK_ACCENT = '#2563eb';

const ThemePage = () => {
  const {
    theme,
    setTheme,
    mode,
    setMode,
    customPrimary,
    setCustomPrimary,
    saveSettings,
    rollbackSettings,
    hasUnsavedChanges
  } = useTheme();

  const themes = [
    { id: 'original', name: 'Original', color: '#6366f1', secondary: '#a855f7', desc: 'Indigo-Violet' },
    { id: 'sapphire', name: 'Sapphire', color: '#2563eb', secondary: '#3b82f6', desc: 'Corporate Blue' },
    { id: 'ocean', name: 'Ocean', color: '#0ea5e9', secondary: '#5eead4', desc: 'Sky & Water' },
    { id: 'forest', name: 'Forest', color: '#22c55e', secondary: '#eab308', desc: 'Nature' },
    { id: 'sunset', name: 'Sunset', color: '#f43f5e', secondary: '#f97316', desc: 'Warm Sun' },
    { id: 'custom', name: 'Custom', color: customPrimary, secondary: customPrimary, desc: 'Your Accent' }
  ];

  const modes = [
    { id: 'light', name: 'Light', icon: <MdLightMode />, desc: 'Classic bright look' },
    { id: 'dark', name: 'Dark', icon: <MdDarkMode />, desc: 'Easy on the eyes' }
  ];

  const firstAllowedSwatch =
    QUICK_SWATCHES.find((swatch) => isAccentAllowedForMode(swatch, mode)) || FALLBACK_ACCENT;

  const customAccentBlocked = theme === 'custom' && !isAccentAllowedForMode(customPrimary, mode);

  useEffect(() => {
    if (theme !== 'custom' || isAccentAllowedForMode(customPrimary, mode)) return;
    setCustomPrimary(firstAllowedSwatch);
  }, [mode, theme, customPrimary, firstAllowedSwatch, setCustomPrimary]);

  const handleCustomAccentChange = (hex) => {
    if (!isAccentAllowedForMode(hex, mode)) return;
    setCustomPrimary(hex);
    setTheme('custom');
  };

  return (
    <div className="settings-section">
      <header className="settings-section-header">
        <h3>Appearance</h3>
        <p>Tailor your workspace aesthetics for maximum productivity and comfort. Selected changes reflect instantly.</p>
      </header>

      <div className="settings-flow">
        <div className="appearance-block">
          <header className="block-header">
            <div>
              <h4>Interface Mode</h4>
              <p>Switch between light and dark modes to suit your environment.</p>
            </div>
          </header>

          <div className="mode-selection-square-grid">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
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
              </button>
            ))}
          </div>
        </div>

        <div className="appearance-divider" />

        <div className="appearance-block">
          <header className="block-header">
            <div>
              <h4>Theme Palette</h4>
              <p>Choose a preset or create a custom brand color like Canva style quick accent editing.</p>
            </div>
          </header>

          <div className="theme-selection-square-grid">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-card-square ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <span className="theme-swatch-pill" style={{ background: `linear-gradient(135deg, ${t.color} 0%, ${t.secondary} 100%)` }} />
                <div className="theme-card-info">
                  <span className="theme-card-name">{t.name}</span>
                  <span className="theme-card-desc">{t.desc}</span>
                </div>
                {theme === t.id && <MdCheckCircle className="theme-square-check" />}
              </button>
            ))}
          </div>

          <div className="custom-color-panel">
            <div className="custom-color-header">
              <h5>Custom Accent</h5>
              <p>Pick an exact brand color for buttons, highlights, and links.</p>
              <p className="custom-color-mode-hint">
                {mode === 'light'
                  ? 'Light accent colors are disabled in Light mode so buttons and links stay readable.'
                  : 'Dark accent colors are disabled in Dark mode so buttons and links stay readable.'}
              </p>
            </div>

            <div className="custom-color-controls">
              <label
                className={`custom-color-picker ${customAccentBlocked ? 'custom-color-picker--blocked' : ''}`}
                htmlFor="settings-custom-accent"
              >
                <input
                  id="settings-custom-accent"
                  type="color"
                  value={customAccentBlocked ? firstAllowedSwatch : customPrimary}
                  onChange={(event) => handleCustomAccentChange(event.target.value)}
                />
                <span
                  className="custom-color-preview"
                  style={{ backgroundColor: customAccentBlocked ? firstAllowedSwatch : customPrimary }}
                />
                <span>{(customAccentBlocked ? firstAllowedSwatch : customPrimary).toUpperCase()}</span>
              </label>

              <div className="custom-color-swatches">
                {QUICK_SWATCHES.map((swatch) => {
                  const disabled = !isAccentAllowedForMode(swatch, mode);
                  const disabledReason = getAccentDisabledReason(swatch, mode);

                  return (
                    <button
                      key={swatch}
                      type="button"
                      disabled={disabled}
                      className={`custom-swatch ${customPrimary.toLowerCase() === swatch.toLowerCase() ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                      style={{ backgroundColor: swatch }}
                      onClick={() => handleCustomAccentChange(swatch)}
                      aria-label={disabled ? disabledReason : `Use accent ${swatch}`}
                      title={disabled ? disabledReason : `Use accent ${swatch}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {hasUnsavedChanges() && (
          <div className="appearance-apply-banner">
            <div className="banner-context">
              <div className="banner-icon-ring">
                <MdPalette />
              </div>
              <div className="banner-text-group">
                <h5>Unsaved Changes</h5>
                <p>Save to keep these settings as your default appearance.</p>
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
  );
};

export default ThemePage;
