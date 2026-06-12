import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService.js'

const ThemeContext = createContext();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const hexToRgbString = (hex) => {
  const normalized = (hex || '').replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  if (!/^[0-9A-Fa-f]{6}$/.test(safe)) return '37, 99, 235';

  const red = parseInt(safe.slice(0, 2), 16);
  const green = parseInt(safe.slice(2, 4), 16);
  const blue = parseInt(safe.slice(4, 6), 16);
  return `${red}, ${green}, ${blue}`;
};

const shiftHex = (hex, amount) => {
  const normalized = (hex || '').replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  if (!/^[0-9A-Fa-f]{6}$/.test(safe)) return '#2563eb';

  const red = clamp(parseInt(safe.slice(0, 2), 16) + amount, 0, 255);
  const green = clamp(parseInt(safe.slice(2, 4), 16) + amount, 0, 255);
  const blue = clamp(parseInt(safe.slice(4, 6), 16) + amount, 0, 255);

  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

const getContrastColor = (hex) => {
  const normalized = (hex || '').replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  if (!/^[0-9A-Fa-f]{6}$/.test(safe)) return '#ffffff';

  const red = parseInt(safe.slice(0, 2), 16);
  const green = parseInt(safe.slice(2, 4), 16);
  const blue = parseInt(safe.slice(4, 6), 16);

  const yiq = ((red * 299) + (green * 587) + (blue * 114)) / 1000;
  return yiq >= 128 ? '#0f172a' : '#ffffff';
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // We keep track of the "saved" state and the "current" active state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('athenavi-theme');
    if (savedTheme === 'default') return 'original';
    return savedTheme || 'sapphire';
  });
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('athenavi-mode');
    return savedMode || 'light';
  });

  const [customPrimary, setCustomPrimary] = useState(() => {
    return localStorage.getItem('athenavi-custom-primary') || '#2563eb';
  });

  const [savedSettings, setSavedSettings] = useState(() => {
    let st = localStorage.getItem('athenavi-theme') || 'sapphire';
    if (st === 'default') st = 'original';
    const sm = localStorage.getItem('athenavi-mode') || 'light';
    const sp = localStorage.getItem('athenavi-custom-primary') || '#2563eb';
    return { theme: st, mode: sm, customPrimary: sp };
  });

  // On mount: try to load server-saved appearance settings for authenticated users
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // no authenticated user

    let mounted = true;
    (async () => {
      try {
        const appearance = await userService.getAppearanceSettings();
        if (!mounted || !appearance) return;

        // API returns field names: interfaceMode, themePalette, customAccentColor
        let serverTheme = appearance.themePalette || appearance.theme || null;
        if (serverTheme === 'default') serverTheme = 'original';
        const serverMode = appearance.interfaceMode || null;
        const serverCustom = appearance.customAccentColor || appearance.customPrimary || null;

        if (serverTheme) setTheme(serverTheme);
        if (serverMode) setMode(serverMode);
        if (serverCustom) setCustomPrimary(serverCustom);

        // Update saved settings snapshot
        setSavedSettings({
          theme: serverTheme || savedSettings.theme,
          mode: serverMode || savedSettings.mode,
          customPrimary: serverCustom || savedSettings.customPrimary
        });
      } catch (err) {
        console.warn('Could not load server appearance settings, falling back to local:', err.message || err);
      }
    })();

    return () => { mounted = false };
  }, []);

  // These are for the "applied but not yet saved" or preview state
  // Actually, to make it "visible once we click", we'll just update these
  // and have the useEffect react to them.
  // The user wants to "Apply" to permanently save.

  useEffect(() => {
    // Apply changes to the DOM instantly
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.className = `theme-${theme} mode-${mode}`;

    if (theme === 'custom') {
      document.documentElement.style.setProperty('--primary', customPrimary);
      document.documentElement.style.setProperty('--primary-rgb', hexToRgbString(customPrimary));
      document.documentElement.style.setProperty('--primary-hover', shiftHex(customPrimary, -18));
      document.documentElement.style.setProperty('--primary-light', shiftHex(customPrimary, 36));
      document.documentElement.style.setProperty('--primary-dark', shiftHex(customPrimary, -42));
      document.documentElement.style.setProperty('--primary-contrast', getContrastColor(customPrimary));
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-rgb');
      document.documentElement.style.removeProperty('--primary-hover');
      document.documentElement.style.removeProperty('--primary-light');
      document.documentElement.style.removeProperty('--primary-dark');
      document.documentElement.style.removeProperty('--primary-contrast');
    }
    
    // We don't save to localStorage here if we want an explicit "Apply" button
    // But the user said "Theme should be visible once we click"
  }, [theme, mode, customPrimary]);

  const saveSettings = () => {
    // Save locally first
    localStorage.setItem('athenavi-theme', theme);
    localStorage.setItem('athenavi-mode', mode);
    localStorage.setItem('athenavi-custom-primary', customPrimary);
    setSavedSettings({ theme, mode, customPrimary });

    // If user is authenticated, persist to server as well (best-effort)
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    (async () => {
      try {
        const patch = {
          interfaceMode: mode,
          themePalette: theme,
          customAccentColor: customPrimary
        };
        const updated = await userService.updateAppearanceSettings(patch);
        // Update local snapshot to reflect server-merged result
        if (updated) {
          let mergedTheme = updated.themePalette || updated.theme || theme;
          if (mergedTheme === 'default') mergedTheme = 'original';
          const mergedMode = updated.interfaceMode || updated.mode || mode;
          const mergedCustom = updated.customAccentColor || updated.customPrimary || customPrimary;
          localStorage.setItem('athenavi-theme', mergedTheme);
          localStorage.setItem('athenavi-mode', mergedMode);
          localStorage.setItem('athenavi-custom-primary', mergedCustom);
          setSavedSettings({ theme: mergedTheme, mode: mergedMode, customPrimary: mergedCustom });
        }
      } catch (err) {
        console.warn('Failed to persist appearance settings to server:', err.message || err);
      }
    })();
  };

  const rollbackSettings = () => {
    setTheme(savedSettings.theme);
    setMode(savedSettings.mode);
    setCustomPrimary(savedSettings.customPrimary);
  };

  const hasUnsavedChanges = () => {
    return (
      theme !== savedSettings.theme ||
      mode !== savedSettings.mode ||
      customPrimary !== savedSettings.customPrimary
    );
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, mode, setTheme, setMode,
      customPrimary, setCustomPrimary,
      saveSettings, rollbackSettings,
      hasUnsavedChanges
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
