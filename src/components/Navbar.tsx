import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, LogOut, Globe } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../LanguageContext';
import { useSite } from '../SiteContext';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onCartOpen: () => void;
  onLoginOpen: () => void;
}

const LOGO_URL = "https://www.xmart.jo/cdn/shop/collections/yesido.webp?pad_color=fff&v=1735084174&width=350";

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen, onLoginOpen }) => {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { lang, setLang, t } = useTranslation();
  const { setHeroKey } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  const navLinks = [
    { ar: 'الرئيسية', en: 'Home' },
    { ar: 'وصل حديثاً', en: 'New Arrivals' },
    { ar: 'إكسسوارات السيارات', en: 'Car Accessories' },
    { ar: 'الشواحن', en: 'Chargers' },
    { ar: 'السماعات', en: 'Headphones' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between h-20 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Logo */}
          <div className={`flex items-center gap-4 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <button 
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <a 
              href="/" 
              className="flex items-center"
              onMouseEnter={() => setHeroKey(null)}
            >
              <img src={LOGO_URL} alt="Yesido Logo" className="h-12 w-auto object-contain" />
            </a>
          </div>

          {/* Desktop Nav */}
          <div className={`hidden lg:flex items-center gap-8 text-sm font-medium text-gray-700 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            {navLinks.map(link => (
              <a 
                key={link.en} 
                href="#" 
                onMouseEnter={() => setHeroKey(link.en)}
                onMouseLeave={() => setHeroKey(null)}
                className="hover:text-brand-red transition-colors py-4 px-2"
              >
                {t(link)}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-2 sm:gap-4 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`hidden sm:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100 group focus-within:border-brand-red transition-all ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search...'} 
                className={`bg-transparent border-none outline-none text-sm w-40 lg:w-48 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              />
              <Search size={18} className="text-gray-400 group-focus-within:text-brand-red" />
            </div>

            {/* Language Switcher */}
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all font-bold text-xs"
            >
              <Globe size={18} className="text-brand-red" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            
            {user ? (
              <div className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <span 
                  onClick={() => {
                    if (user.email === 'admin@yesido.com') window.dispatchEvent(new CustomEvent('show-admin'));
                  }}
                  className={`hidden md:inline text-xs font-bold text-gray-500 cursor-pointer hover:text-brand-red`}
                >
                  {user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-brand-red transition-colors"
                  title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginOpen}
                className="p-2 text-gray-700 hover:text-brand-red transition-colors"
                title={lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
              >
                <User size={24} />
              </button>
            )}
            
            <button 
              onClick={onCartOpen}
              className="relative p-2 text-gray-700 hover:text-brand-red transition-colors"
            >
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 bg-brand-red text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div 
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 h-full w-[280px] bg-white z-[60] shadow-2xl p-6 ${lang === 'ar' ? 'right-0' : 'left-0'}`}
            >
              <div className={`flex justify-between items-center mb-8 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <img src={LOGO_URL} alt="Logo" className="h-10 opacity-70" />
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className={`flex flex-col gap-6 text-lg font-medium ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {navLinks.map(link => (
                  <a key={link.en} href="#" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-red">{t(link)}</a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
