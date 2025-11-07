import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { translations, LanguageCode } from '../translations';

const getNestedTranslation = (language: LanguageCode, key: string): string | undefined => {
    const keyParts = key.split('.');
    let result: any = translations[language];
    for (const part of keyParts) {
        if (result === undefined) return undefined;
        result = result[part];
    }
    return result;
}


export const useTranslations = () => {
  const { language } = useContext(SettingsContext);
  
  const t = (key: string, replacements: Record<string, string> = {}): string => {
    let translation = getNestedTranslation(language, key);

    // Fallback to English if the translation is not found in the current language
    if (translation === undefined && language !== 'en') {
        translation = getNestedTranslation('en', key);
    }
    
    // Fallback to the key itself if no translation is found at all
    if (translation === undefined) {
        return key;
    }

    // Handle replacements
    for (const placeholder in replacements) {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    }

    return translation;
  };

  return { t };
};
