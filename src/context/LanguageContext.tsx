import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LocalizedString } from '../types/index.ts';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, bn: string) => string;
  l: (localized?: LocalizedString | null, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('portfolio_lang');
    return saved === 'bn' ? 'bn' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('portfolio_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = (en: string, bn: string): string => {
    return language === 'bn' ? (bn || en) : en;
  };

  const l = (localized?: LocalizedString | null, fallback = ''): string => {
    if (!localized) return fallback;
    const primary = localized[language];
    if (primary && primary.trim().length > 0) return primary;
    const secondary = language === 'en' ? localized.bn : localized.en;
    if (secondary && secondary.trim().length > 0) return secondary;
    return fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, l }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
