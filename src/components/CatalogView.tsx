import React, { useState, useMemo } from 'react';
import { useTranslation } from '../LanguageContext';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, Grid, List, ChevronDown } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  showDealsOnly?: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ products, categories, initialCategory, showDealsOnly = false }) => {
  const { lang, t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [onlyDeals, setOnlyDeals] = useState(showDealsOnly);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const isOnSale = p.oldPrice && p.oldPrice > p.price || p.flashOffer;
        if (onlyDeals && !isOnSale) return false;
        
        const matchesCategory = !selectedCategory || p.category.ar === selectedCategory || p.category.en === selectedCategory;
        const matchesSearch = !searchQuery || 
          p.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.name.en.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0; // Default to natural order (newest)
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="container mx-auto px-4">
        {/* Header & Search */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-6 mb-12 ${lang === 'ar' ? '' : 'md:flex-row-reverse'}`}>
          <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <h1 className="text-4xl font-black text-gray-800 mb-2">{lang === 'ar' ? 'جميع المنتجات' : 'All Products'}</h1>
            <p className="text-gray-500">{lang === 'ar' ? `نعرض ${filteredProducts.length} منتجاً متاحاً` : `Showing ${filteredProducts.length} available products`}</p>
          </div>

          <div className={`flex gap-3 w-full md:w-auto ${lang === 'ar' ? '' : 'flex-row-reverse'}`}>
            <div className="relative flex-1 md:w-80">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث في المتجر...' : 'Search in store...'}
                className={`w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all ${lang === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`}
              />
              <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${lang === 'ar' ? 'right-4' : 'left-4'}`} size={20} />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-white border border-gray-200 p-4 rounded-2xl text-gray-600 hover:text-brand-red transition-all"
            >
              <Filter size={24} />
            </button>
          </div>
        </div>

        <div className={`flex flex-col lg:flex-row gap-8 ${lang === 'ar' ? '' : 'lg:flex-row-reverse'}`}>
          {/* Desktop Filters */}
          <aside className={`hidden lg:block w-72 space-y-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <div>
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                <Filter size={20} className="text-brand-red" />
                {lang === 'ar' ? 'التصنيفات' : 'Categories'}
              </h3>
              
              {/* Deals Toggle */}
              <button 
                onClick={() => setOnlyDeals(!onlyDeals)}
                className={`w-full mb-6 flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${onlyDeals ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-brand-red/30'}`}
              >
                <span className="font-black text-sm">{lang === 'ar' ? 'عروض حصرية 🎁' : 'Exclusive Deals 🎁'}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${onlyDeals ? 'bg-white/30' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${lang === 'ar' ? (onlyDeals ? 'left-1' : 'right-1') : (onlyDeals ? 'right-1' : 'left-1')}`} />
                </div>
              </button>

              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-right py-3 px-4 rounded-xl font-bold transition-all ${!selectedCategory ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  {lang === 'ar' ? 'الكل' : 'All'}
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(t(cat.name))}
                    className={`w-full text-right py-3 px-4 rounded-xl font-bold transition-all ${selectedCategory === t(cat.name) ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  >
                    {t(cat.name)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-800 mb-6">{lang === 'ar' ? 'ترتيب حسب' : 'Sort By'}</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red"
              >
                <option value="newest">{lang === 'ar' ? 'الأحدث' : 'Newest'}</option>
                <option value="price-low">{lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                <option value="price-high">{lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
              </select>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {filteredProducts.map(p => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-gray-200 shadow-sm"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Search size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">{lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</h3>
                  <p className="text-gray-500">{lang === 'ar' ? 'جرب البحث عن شيء آخر أو تغيير التصنيف' : 'Try searching for something else or change categories'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white z-[110] rounded-t-[3rem] p-8 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-500" />
                </button>
                <h3 className="text-2xl font-black text-gray-800">{lang === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
              </div>
              
              <div className="space-y-8 overflow-y-auto max-h-[calc(80vh-150px)] pb-10">
                <div>
                  <h4 className="text-lg font-bold mb-4">{lang === 'ar' ? 'التصنيفات' : 'Categories'}</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => { setSelectedCategory(null); setShowFilters(false); }}
                      className={`px-4 py-2 rounded-xl font-bold border transition-all ${!selectedCategory ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-100'}`}
                    >
                      {lang === 'ar' ? 'الكل' : 'All'}
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategory(t(cat.name)); setShowFilters(false); }}
                        className={`px-4 py-2 rounded-xl font-bold border transition-all ${selectedCategory === t(cat.name) ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-gray-600 border-gray-100'}`}
                      >
                        {t(cat.name)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-4">{lang === 'ar' ? 'الترتيب' : 'Sorting'}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['newest', 'price-low', 'price-high'].map((opt) => (
                      <button 
                        key={opt}
                        onClick={() => { setSortBy(opt as any); setShowFilters(false); }}
                        className={`text-right py-4 px-6 rounded-2xl font-bold border ${sortBy === opt ? 'bg-brand-red/5 border-brand-red text-brand-red' : 'border-gray-100 text-gray-600'}`}
                      >
                        {opt === 'newest' ? (lang === 'ar' ? 'الأحدث' : 'Newest') : 
                         opt === 'price-low' ? (lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High') : 
                         (lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
