import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (key: { ar: string; en: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('yesido-lang');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('yesido-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = (content: { ar: string; en: string }) => {
    return content[lang] || content['ar'];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir, t }}>
      <div dir={dir} className={lang === 'ar' ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
