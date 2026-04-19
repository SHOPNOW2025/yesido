import React from 'react';
import { useTranslation } from '../LanguageContext';
import { useSite } from '../SiteContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

import { Link } from 'react-router-dom';

interface HeroProps {
  onCatalogOpen: (category?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onCatalogOpen }) => {
  const { lang, t } = useTranslation();
  const { content, activeHeroKey } = useSite();

  const activeContent = (activeHeroKey && content.navigationHeroes?.[activeHeroKey] && (content.navigationHeroes[activeHeroKey].title?.ar || content.navigationHeroes[activeHeroKey].title?.en)) 
    ? content.navigationHeroes[activeHeroKey] 
    : content.hero;

  return (
    <div className="relative overflow-hidden bg-brand-dark min-h-[650px] flex items-center py-16 sm:py-0">
      {/* Background Glow/Image Layer */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeHeroKey || 'bg-default'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img 
            src={activeContent.image || "https://www.xmart.jo/cdn/shop/files/Yesido_Y38_Car_Charger_36W.jpg?v=1735084174"} 
            className="w-full h-full object-cover blur-3xl scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/20 via-brand-dark/60 to-brand-dark" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeHeroKey || 'default'}
            initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: lang === 'ar' ? -50 : 50 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className={`space-y-6 ${lang === 'ar' ? 'text-right order-2 lg:order-1' : 'text-left'}`}>
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block bg-brand-red text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-red/30"
              >
                {t(activeContent.badge)}
              </motion.span>
              <h1 className="text-4xl sm:text-7xl font-black text-white leading-[1.1]">
                {t(activeContent.title).split('Yesido').map((part, i) => (
                  <span key={i}>
                    {part}
                    {t(activeContent.title).includes('Yesido') && i === 0 && <span className="text-brand-red">Yesido</span>}
                  </span>
                ))}
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed max-w-xl">
                {t(activeContent.subtitle)}
              </p>
              <div className={`flex flex-wrap items-center gap-4 pt-6 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <Link 
                  to="/catalog"
                  className="bg-brand-red text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-2 hover:bg-white hover:text-brand-red transition-all shadow-2xl shadow-brand-red/40 hover:-translate-y-1"
                >
                  <span>{t(activeContent.cta)}</span>
                  {lang === 'ar' ? <ArrowLeft size={24} /> : <ChevronRight size={24} />}
                </Link>
                <Link 
                  to="/catalog"
                  className="border border-white/20 text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all font-sans"
                >
                  {lang === 'ar' ? 'عرض الكتالوج' : 'View Catalog'}
                </Link>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: 'spring' }}
              className={`hidden lg:block relative ${lang === 'ar' ? 'order-1 lg:order-2' : ''}`}
            >
              <div className="relative z-10 p-0 sm:p-12">
                 <img 
                  src={activeContent.image || "https://www.xmart.jo/cdn/shop/files/Yesido_Y38_Car_Charger_36W.jpg?v=1735084174"} 
                  alt="Hero Product" 
                  className="w-full h-auto drop-shadow-[0_0_80px_rgba(230,36,55,0.45)] rounded-[3rem] transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                 />
              </div>
              {/* Extra intense glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-brand-red/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
