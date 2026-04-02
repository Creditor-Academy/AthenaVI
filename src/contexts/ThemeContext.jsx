import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const st = localStorage.getItem('athenavi-theme') || 'sapphire';
    const sm = localStorage.getItem('athenavi-mode') || 'light';
    const sp = localStorage.getItem('athenavi-custom-primary') || '#2563eb';
    return { theme: st, mode: sm, customPrimary: sp };
  });

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
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-rgb');
      document.documentElement.style.removeProperty('--primary-hover');
      document.documentElement.style.removeProperty('--primary-light');
      document.documentElement.style.removeProperty('--primary-dark');
    }
    
    // We don't save to localStorage here if we want an explicit "Apply" button
    // But the user said "Theme should be visible once we click"
  }, [theme, mode, customPrimary]);

  const saveSettings = () => {
    localStorage.setItem('athenavi-theme', theme);
    localStorage.setItem('athenavi-mode', mode);
    localStorage.setItem('athenavi-custom-primary', customPrimary);
    setSavedSettings({ theme, mode, customPrimary });
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
