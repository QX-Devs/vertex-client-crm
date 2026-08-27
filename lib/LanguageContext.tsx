'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, getNestedTranslation } from './i18n';

interface LanguageContextType {
  lang: Language;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  dir: 'rtl',
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('vertex_crm_lang') as Language | null;
    const initialLang: Language = savedLang === 'en' ? 'en' : 'ar';
    setLangState(initialLang);
    applyDomLanguage(initialLang);

    const handleCustomChange = (e: any) => {
      if (e.detail?.lang && (e.detail.lang === 'ar' || e.detail.lang === 'en')) {
        setLangState(e.detail.lang);
      }
    };

    window.addEventListener('languagechange', handleCustomChange);
    return () => window.removeEventListener('languagechange', handleCustomChange);
  }, []);

  const applyDomLanguage = (newLang: Language) => {
    const isRtl = newLang === 'ar';
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
      localStorage.setItem('vertex_crm_lang', newLang);
    }
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    applyDomLanguage(newLang);
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: newLang, dir: newLang === 'ar' ? 'rtl' : 'ltr' } }));
  };

  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
  };

  const t = (key: string): string => {
    const dictionary = translations[lang] || translations.ar;
    return getNestedTranslation(dictionary, key);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t, lang, dir } = useContext(LanguageContext);
  return { t, lang, dir };
}

export default LanguageContext;
