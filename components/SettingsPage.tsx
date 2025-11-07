import React, { useContext } from 'react';
import { SettingsContext, Theme, themes } from '../contexts/SettingsContext';

const SettingsPage: React.FC = () => {
  const { theme, setTheme, isAccessibilityMode, setAccessibilityMode } = useContext(SettingsContext);

  const handleAccessibilityToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessibilityMode(e.target.checked);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-600 mt-1">Customize your application experience.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-6">
        {/* Accessibility Settings */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Accessibility</h3>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
            <label htmlFor="accessibility-toggle" className="font-medium text-slate-600">
              Enable Accessibility Mode
              <p className="text-sm text-slate-500 font-normal">Increases font size for better readability.</p>
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
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Theme Color</h3>
          <div className="p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-4">Choose an accent color for the application.</p>
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
                    {themeOption.name}
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