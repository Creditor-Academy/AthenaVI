import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

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

  const [savedSettings, setSavedSettings] = useState(() => {
    const st = localStorage.getItem('athenavi-theme') || 'sapphire';
    const sm = localStorage.getItem('athenavi-mode') || 'light';
    return { theme: st, mode: sm };
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
    
    // We don't save to localStorage here if we want an explicit "Apply" button
    // But the user said "Theme should be visible once we click"
  }, [theme, mode]);

  const saveSettings = () => {
    localStorage.setItem('athenavi-theme', theme);
    localStorage.setItem('athenavi-mode', mode);
    setSavedSettings({ theme, mode });
  };

  const rollbackSettings = () => {
    setTheme(savedSettings.theme);
    setMode(savedSettings.mode);
  };

  const hasUnsavedChanges = () => {
    return theme !== savedSettings.theme || mode !== savedSettings.mode;
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, mode, setTheme, setMode,
      saveSettings, rollbackSettings,
      hasUnsavedChanges
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
