import React, { createContext, useState, useEffect, useMemo } from 'react';

export type Theme = 'Blue' | 'Green' | 'Purple' | 'Orange';

interface ThemeConfig {
  name: string;
  hue: number;
  saturation: string;
  lightness: string;
  backgroundImage: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  Blue: { 
    name: 'Blue', 
    hue: 217, 
    saturation: '91%', 
    lightness: '60%',
    backgroundImage: 'url("https://img.freepik.com/free-vector/monochrome-realistic-liquid-effect-background_474888-7310.jpg?w=740")'
  },
  Green: { 
    name: 'Green', 
    hue: 142, 
    saturation: '71%', 
    lightness: '45%',
    backgroundImage: 'url("https://img.freepik.com/free-vector/abstract-modern-background-paper-cut-background-vector-illustration_474888-6855.jpg?w=740")'
  },
  Purple: { 
    name: 'Purple', 
    hue: 262, 
    saturation: '85%', 
    lightness: '60%',
    backgroundImage: 'url("https://img.freepik.com/free-vector/abstract-paper-style-purple-background-design_1017-34757.jpg")'
  },
  Orange: { 
    name: 'Orange', 
    hue: 25, 
    saturation: '95%', 
    lightness: '55%',
    backgroundImage: 'url("https://img.freepik.com/free-vector/orange-fluid-background-frame_53876-99021.jpg")'
  },
};

interface SettingsContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAccessibilityMode: boolean;
  setAccessibilityMode: (enabled: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
  theme: 'Blue',
  setTheme: () => {},
  isAccessibilityMode: false,
  setAccessibilityMode: () => {},
});

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'Blue';
  });

  const [isAccessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    return localStorage.getItem('accessibilityMode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themes[theme];
    
    root.style.setProperty('--primary-hue', selectedTheme.hue.toString());
    root.style.setProperty('--primary-saturation', selectedTheme.saturation);
    root.style.setProperty('--primary-lightness', selectedTheme.lightness);
    root.style.setProperty('--background-image', selectedTheme.backgroundImage);

    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAccessibilityMode) {
      document.body.classList.add('accessibility-mode');
    } else {
      document.body.classList.remove('accessibility-mode');
    }
    localStorage.setItem('accessibilityMode', String(isAccessibilityMode));
  }, [isAccessibilityMode]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    isAccessibilityMode,
    setAccessibilityMode,
  }), [theme, isAccessibilityMode]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};