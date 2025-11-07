import React, { useContext } from 'react';
import { SettingsContext, Theme, themes } from '../contexts/SettingsContext';
import { useTranslations } from '../hooks/useTranslations';
import { languages, LanguageCode } from '../translations';

const SettingsPage: React.FC = () => {
  const { theme, setTheme, isAccessibilityMode, setAccessibilityMode, language, setLanguage } = useContext(SettingsContext);
  const { t } = useTranslations();

  const handleAccessibilityToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessibilityMode(e.target.checked);
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">{t('settings.title')}</h2>
        <p className="text-slate-600 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-6">
        {/* Language Settings */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('settings.language.title')}</h3>
          <div className="bg-slate-50 p-4 rounded-lg">
             <label htmlFor="language-select" className="block text-sm font-medium text-slate-600 mb-2">{t('settings.language.selectLabel')}</label>
             <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="w-full p-2 text-slate-600 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
             >
                {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                ))}
             </select>
          </div>
        </div>
      
        {/* Accessibility Settings */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('settings.accessibility.title')}</h3>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
            <label htmlFor="accessibility-toggle" className="font-medium text-slate-600">
              {t('settings.accessibility.enableLabel')}
              <p className="text-sm text-slate-500 font-normal">{t('settings.accessibility.description')}</p>
            </label>
            <div className="relative inline-block w-12 h-6">
                 <input
                    type="checkbox"
                    id="accessibility-toggle"
                    checked={isAccessibilityMode}
                    onChange={handleAccessibilityToggle}
                    className="absolute w-0 h-0 opacity-0"
                 />
                 <span
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                        isAccessibilityMode ? 'bg-primary' : 'bg-slate-300'
                    }`}
                    style={{backgroundColor: isAccessibilityMode ? 'var(--primary-color)' : ''}}
                 ></span>
                 <span
                    className={`absolute content-[''] h-5 w-5 left-0.5 top-0.5 bg-white rounded-full transition-transform ${
                        isAccessibilityMode ? 'transform translate-x-6' : ''
                    }`}
                 ></span>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('settings.theme.title')}</h3>
          <div className="p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-4">{t('settings.theme.description')}</p>
            <div className="flex justify-center gap-4">
              {Object.values(themes).map((themeOption) => (
                <div key={themeOption.name} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setTheme(themeOption.name as Theme)}
                    className={`w-12 h-12 rounded-full transition-all duration-200 ${
                      theme === themeOption.name ? 'ring-4 ring-offset-2' : ''
                    }`}
                    style={{ 
                        backgroundColor: `hsl(${themeOption.hue}, ${themeOption.saturation}, ${themeOption.lightness})`,
                        borderColor: `hsl(${themeOption.hue}, ${themeOption.saturation}, ${themeOption.lightness})`
                    }}
                    aria-label={`Select ${themeOption.name} theme`}
                  />
                  <span className={`text-sm font-medium ${theme === themeOption.name ? 'text-primary' : 'text-slate-500'}`} style={{color: theme === themeOption.name ? 'var(--primary-color)' : ''}}>
                    {t(`settings.theme.${themeOption.name.toLowerCase()}` as any)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;