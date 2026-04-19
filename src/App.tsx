import { useState, useEffect } from 'react';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import { LanguageProvider, useTranslation } from './LanguageContext';
import { SiteProvider, useSite } from './SiteContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { LoginForm } from './components/LoginForm';
import { FlashOfferSection } from './components/FlashOfferSection';
import { AdminDashboard } from './components/AdminDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { CatalogView } from './components/CatalogView';
import { PRODUCTS } from './data';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Product, Category } from './types';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft, X } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: '1', ar: 'شواحن', en: 'Chargers', icon: '📱' },
  { id: '2', ar: 'كوابل', en: 'Cables', icon: '🔌' },
  { id: '3', ar: 'سماعات', en: 'Headphones', icon: '🎧' },
  { id: '4', ar: 'حوامل', en: 'Holders', icon: '🧲' },
  { id: '5', ar: 'ساعات', en: 'Watches', icon: '⌚' },
  { id: '6', ar: 'حماية', en: 'Protection', icon: '🛡️' }
];

function StoreLayout() {
  const [view, setView] = useState<'home' | 'catalog' | 'deals'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<'return' | 'privacy' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { lang, t } = useTranslation();
  const { content } = useSite();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const prods = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(prods.length > 0 ? prods : []);

        // Fetch Categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const cats = categoriesSnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            name: data.name, 
            icon: data.icon 
          } as Category;
        });
        setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: { ar: c.ar, en: c.en }, icon: c.icon })));
      } catch (err) {
        console.error("Firebase connection error:", err);
        // Fallback to defaults on error
        setProducts([]);
        setCategories(DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: { ar: c.ar, en: c.en }, icon: c.icon })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Custom event to switch to admin view
    window.addEventListener('show-admin', () => setShowAdmin(true));
    window.addEventListener('hide-admin', () => setShowAdmin(false));
  }, []);

  const openCatalog = (category?: string) => {
    setSelectedCategory(category || null);
    setView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeals = () => {
    setView('deals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showAdmin) {
    return (
      <>
        <Navbar 
          onCartOpen={() => setIsCartOpen(true)} 
          onLoginOpen={() => setIsLoginOpen(true)} 
          onLogoClick={goHome}
          onCatalogOpen={openCatalog}
          onDealsOpen={openDeals}
        />
        <AdminDashboard />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <LoginForm isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar 
        onCartOpen={() => setIsCartOpen(true)} 
        onLoginOpen={() => setIsLoginOpen(true)}
        onLogoClick={goHome}
        onCatalogOpen={openCatalog}
        onDealsOpen={openDeals}
      />

      {view === 'home' ? (
        <>
          <Hero onCatalogOpen={openCatalog} />

          {/* Categories Section */}
          <section className="py-12 bg-white">
             <div className="container mx-auto px-4">
                <div className={`flex items-center justify-between mb-10 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                   <button 
                     onClick={() => openCatalog()}
                     className="text-brand-red font-bold text-sm flex items-center gap-1 hover:underline"
                   >
                      <span>{lang === 'ar' ? 'عرض الكل' : 'View All'}</span>
                      <ChevronRight size={16} className={lang === 'ar' ? '' : 'rotate-180'} />
                   </button>
                   <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                      <span className="w-2 h-8 bg-brand-red rounded-full" />
                      {lang === 'ar' ? 'التصنيفات المميزة' : 'Featured Categories'}
                   </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {categories.map((cat) => (
                    <motion.div 
                      key={cat.id}
                      whileHover={{ y: -8 }}
                      onClick={() => openCatalog(t(cat.name))}
                      className="group cursor-pointer bg-gray-50 rounded-3xl p-6 text-center border border-gray-100 hover:border-brand-red/30 transition-all"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform overflow-hidden p-1">
                         {cat.icon.startsWith('http') ? (
                           <img src={cat.icon} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                         ) : (
                           <span className="text-3xl text-brand-red">{cat.icon}</span>
                         )}
                      </div>
                      <span className="font-bold text-gray-700">{t(cat.name)}</span>
                    </motion.div>
                  ))}
                </div>
             </div>
          </section>

          <FlashOfferSection />

          {/* Products Grid */}
          <section id="products" className="py-20 container mx-auto px-4 text-right">
            <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 ${lang === 'ar' ? '' : 'flex-row-reverse'}`}>
              <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h2 className="text-3xl font-black text-gray-800 mb-2">{lang === 'ar' ? 'منتجاتنا الرائجة' : 'Trending Products'}</h2>
                <p className="text-gray-400">{lang === 'ar' ? 'تحقق من أكثر المنتجات طلباً هذا الأسبوع' : 'Check out the most requested products this week'}</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => openCatalog()}
                  className="px-6 py-2 rounded-full border border-gray-200 text-sm font-bold hover:border-brand-red hover:text-brand-red transition-all"
                >
                  {lang === 'ar' ? 'الكل' : 'All'}
                </button>
                <button className="px-6 py-2 rounded-full border border-gray-100 text-sm font-bold hover:border-brand-red hover:text-brand-red transition-all">{lang === 'ar' ? 'جديد' : 'New'}</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </>
      ) : view === 'catalog' ? (
        <CatalogView 
          products={products} 
          categories={categories} 
          initialCategory={selectedCategory || undefined}
        />
      ) : (
        <CatalogView 
          products={products} 
          categories={categories} 
          showDealsOnly={true}
        />
      )}

      {/* Footer info */}
      <footer className="py-20 border-t border-gray-100 bg-white">
         <div className="container mx-auto px-4 text-center space-y-6">
            <img src="https://www.xmart.jo/cdn/shop/collections/yesido.webp?pad_color=fff&v=1735084174&width=350" alt="Footer Logo" className="h-14 mx-auto" />
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {t(content.footer.about)}
            </p>
            <div className="flex flex-wrap justify-center gap-6 py-4">
              <button 
                onClick={() => setActivePolicy('return')}
                className="text-gray-600 font-bold hover:text-brand-red transition-colors"
              >
                {lang === 'ar' ? 'سياسة الإرجاع' : 'Return Policy'}
              </button>
              <button 
                onClick={() => setActivePolicy('privacy')}
                className="text-gray-600 font-bold hover:text-brand-red transition-colors"
              >
                {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </button>
            </div>
            <div className="pt-10 border-t border-gray-100">
               <p className="text-gray-400 text-sm">
                 {lang === 'ar' ? '© 2024 متجر يسيدو الأصلي. جميع الحقوق محفوظة.' : '© 2024 Original Yesido Store. All rights reserved.'}
                </p>
            </div>
         </div>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      <LoginForm 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      {/* Floating Deals Button */}
      {view !== 'deals' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={openDeals}
          className="fixed bottom-10 left-6 z-[150] bg-brand-red text-white flex flex-col items-center justify-center p-4 rounded-3xl shadow-2xl shadow-brand-red/30 cursor-pointer animate-pulse-slow group"
        >
          <span className="text-2xl mb-1 group-hover:rotate-12 transition-transform">🔥</span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {lang === 'ar' ? 'العروض' : 'Deals'}
          </span>
          <div className="absolute -top-1 -right-1 bg-white text-brand-red text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
            %
          </div>
        </motion.button>
      )}

      {/* Policies Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActivePolicy(null)} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <button 
              onClick={() => setActivePolicy(null)}
              className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all`}
            >
              <X size={24} className="text-gray-500" />
            </button>
            <h3 className="text-3xl font-black text-gray-800 mb-8 border-b pb-4">
              {activePolicy === 'return' ? (lang === 'ar' ? 'سياسة الإرجاع' : 'Return Policy') : (lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy')}
            </h3>
            <div className={`text-gray-600 text-lg leading-relaxed whitespace-pre-wrap ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {activePolicy === 'return' ? t(content.footer.returnPolicy!) : t(content.footer.privacyPolicy!)}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SiteProvider>
          <CartProvider>
            <StoreLayout />
          </CartProvider>
        </SiteProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
