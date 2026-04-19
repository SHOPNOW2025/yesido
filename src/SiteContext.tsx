import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent } from './types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SiteContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => Promise<void>;
  loading: boolean;
  activeHeroKey: string | null;
  setHeroKey: (key: string | null) => void;
}

const defaultContent: SiteContent = {
  hero: {
    badge: { ar: 'عرض الصيف 2024', en: 'Summer Offer 2024' },
    title: { ar: 'إكسسوارات Yesido الأصلية الموثوقة', en: 'Original Trusted Yesido Accessories' },
    subtitle: { ar: 'جودة لا تضاهى وتصميمات عصرية لحماية وتطوير هاتفك الذكي. اكتشف مجموعتنا الواسعة الآن.', en: 'Incomparable quality and modern designs to protect and evolve your smartphone. Discover our wide collection now.' },
    cta: { ar: 'تسوق الآن', en: 'Shop Now' },
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'
  },
  navigationHeroes: {},
  footer: {
    about: { ar: 'متجرك الإلكتروني الموثوق للإلكترونيات والتقنية في الأردن. نوفر أفضل الأسعار مع ضمان رسمي وتوصيل سريع لجميع أنحاء المملكة.', en: 'Your trusted online store for electronics and technology in Jordan. We provide the best prices with an official warranty and fast delivery nationwide.' }
  }
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [activeHeroKey, setActiveHeroKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'settings', 'website');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteContent;
          // Ensure navigationHeroes exists for old data
          setContent({
            ...defaultContent,
            ...data,
            navigationHeroes: data.navigationHeroes || {}
          });
        } else {
          // Initialize if not exists
          await setDoc(docRef, defaultContent);
        }
      } catch (error) {
        console.error('Error fetching site content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const updateContent = async (newContent: SiteContent) => {
    try {
      await setDoc(doc(db, 'settings', 'website'), newContent);
      setContent(newContent);
    } catch (error) {
      console.error('Error updating site content:', error);
      throw error;
    }
  };

  return (
    <SiteContext.Provider value={{ content, updateContent, loading, activeHeroKey, setHeroKey: setActiveHeroKey }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
};
