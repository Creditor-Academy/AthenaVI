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
    return savedTheme || 'default';
  });

  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('athenavi-mode');
    return savedMode || 'light';
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
  };

  const rollbackSettings = () => {
    const savedTheme = localStorage.getItem('athenavi-theme') || 'default';
    const savedMode = localStorage.getItem('athenavi-mode') || 'light';
    setTheme(savedTheme);
    setMode(savedMode);
  };

  const hasUnsavedChanges = () => {
    const savedTheme = localStorage.getItem('athenavi-theme') || 'default';
    const savedMode = localStorage.getItem('athenavi-mode') || 'light';
    return theme !== savedTheme || mode !== savedMode;
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
