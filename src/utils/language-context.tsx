import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Translations } from './translations';

type Language = 'uz' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    try {
      // Загружаем сохранённый язык из localStorage
      const savedLanguage = localStorage.getItem('bententrade-language') as Language;
      if (savedLanguage && (savedLanguage === 'uz' || savedLanguage === 'ru')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      // Если localStorage недоступен, используем русский по умолчанию
      setLanguage('ru');
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('bententrade-language', lang);
    } catch (error) {
      // Игнорируем ошибки localStorage
      console.warn('Could not save language preference:', error);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}