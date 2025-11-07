import React, { createContext, useState, useEffect, useMemo } from 'react';
import { languages, LanguageCode } from '../translations';


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
    backgroundImage: 'url("https://papers.company/wallpaper/papers.co-vy76-wave-color-purple-pattern-background-36-3840x2400-4k-wallpaper.jpg")'
  },
  Orange: { 
    name: 'Orange', 
    hue: 25, 
    saturation: '95%', 
    lightness: '55%',
    backgroundImage: 'url("https://img.freepik.com/free-vector/paper-style-smooth-background_23-2148980020.jpg?semt=ais_hybrid&w=740&q=80")'
  },
};

interface SettingsContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAccessibilityMode: boolean;
  setAccessibilityMode: (enabled: boolean) => void;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
  theme: 'Blue',
  setTheme: () => {},
  isAccessibilityMode: false,
  setAccessibilityMode: () => {},
  language: 'en',
  setLanguage: () => {},
});

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'Blue';
  });

  const [isAccessibilityMode, setAccessibilityMode] = useState<boolean>(() => {
    return localStorage.getItem('accessibilityMode') === 'true';
  });

  const [language, setLanguage] = useState<LanguageCode>(() => {
    const savedLang = localStorage.getItem('language') as LanguageCode;
    return savedLang && languages[savedLang] ? savedLang : 'en';
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

  useEffect(() => {
      document.documentElement.lang = language;
      localStorage.setItem('language', language);
  }, [language]);


  const value = useMemo(() => ({
    theme,
    setTheme,
    isAccessibilityMode,
    setAccessibilityMode,
    language,
    setLanguage,
  }), [theme, isAccessibilityMode, language]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};