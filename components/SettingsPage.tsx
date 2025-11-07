import React, { useContext } from 'react';
import { SettingsContext, Theme, themes } from '../contexts/SettingsContext';
import { languages, LanguageCode } from '../translations';
import { useTranslations } from '../hooks/useTranslations';

const SettingsPage: React.FC = () => {
  const { 
    theme, setTheme, 
    isAccessibilityMode, setAccessibilityMode,
    language, setLanguage,
  } = useContext(SettingsContext);
  const { t } = useTranslations();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode);
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {t('settings.title')}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
              {t('settings.subtitle')}
          </p>
      </div>

      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
        <h2 className="text-xl font-bold text-slate-800">{t('settings.language.title')}</h2>
        <div className="mt-4">
          <label htmlFor="language-select" className="block text-sm font-medium text-slate-700">
              {t('settings.language.selectLabel')}
          </label>
          <select 
            id="language-select" 
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            {(Object.keys(languages) as LanguageCode[]).map((code) => (
              <option key={code} value={code}>
                {languages[code]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
        <h2 className="text-xl font-bold text-slate-800">{t('settings.accessibility.title')}</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <label htmlFor="accessibility-toggle" className="font-medium text-slate-700">
               {t('settings.accessibility.enableLabel')}
            </label>
            <p className="text-sm text-slate-500" id="accessibility-description">
                {t('settings.accessibility.description')}
            </p>
          </div>
          <button
            type="button"
            id="accessibility-toggle"
            className={`${
              isAccessibilityMode ? 'bg-primary' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            role="switch"
            aria-checked={isAccessibilityMode}
            aria-describedby="accessibility-description"
            onClick={() => setAccessibilityMode(!isAccessibilityMode)}
          >
            <span
              className={`${
                isAccessibilityMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
      </div>

      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
        <h2 className="text-xl font-bold text-slate-800">{t('settings.theme.title')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('settings.theme.description')}</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(themes) as Theme[]).map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                theme === themeName ? 'border-primary shadow-md' : 'border-transparent hover:border-slate-300'
              }`}
            >
              <div
                className="w-full h-10 rounded-md"
                style={{ backgroundColor: `hsl(${themes[themeName].hue}, ${themes[themeName].saturation}, ${themes[themeName].lightness})`}}
              ></div>
              <p className={`mt-2 text-sm font-medium ${theme === themeName ? 'text-primary' : 'text-slate-700'}`}>
                {t(`settings.theme.${themeName.toLowerCase()}` as any, {}) || themeName}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
