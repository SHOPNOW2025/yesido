import React from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { PRODUCTS } from '../data';
import { useTranslation } from '../LanguageContext';
import { motion } from 'motion/react';

export const FlashOfferSection: React.FC = () => {
  const { lang, t } = useTranslation();
  const flashProducts = PRODUCTS.filter(p => !!p.flashOffer);

  if (flashProducts.length === 0) return null;

  return (
    <section className="py-20 bg-brand-dark overflow-hidden">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row items-center justify-between mb-12 gap-6 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`flex items-center gap-4 ${lang === 'ar' ? 'text-right' : 'text-left flex-row-reverse'}`}>
             <div className="w-16 h-16 bg-brand-red rounded-3xl flex items-center justify-center shadow-xl shadow-brand-red/20 rotate-12">
                <Flame size={32} className="text-white animate-pulse" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-white mb-1">
                  {lang === 'ar' ? 'عروض نارية 🔥' : 'Flash Offers 🔥'}
                </h2>
                <p className="text-gray-400">
                  {lang === 'ar' ? 'أسعار لا تتكرر، تنتهي خلال وقت قصير جداً!' : 'Unbeatable prices, ending very soon!'}
                </p>
             </div>
          </div>
          <button className={`text-brand-red font-bold flex items-center gap-2 hover:bg-brand-red hover:text-white px-6 py-2 rounded-full transition-all border border-brand-red ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
             <span>{lang === 'ar' ? 'عرض كل العروض' : 'View All Offers'}</span>
             {lang === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {flashProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          <div className="hidden lg:flex bg-white/5 border border-white/10 rounded-3xl flex-col items-center justify-center p-8 text-center space-y-4">
             <div className="text-4xl">⏳</div>
             <h3 className="text-xl font-bold text-white">
               {lang === 'ar' ? 'عروض أكثر في الطريق' : 'More offers coming'}
             </h3>
             <p className="text-gray-500 text-sm">
               {lang === 'ar' ? 'ترقبوا الدفعة القادمة من العروض الحصرية بعد قليل' : 'Stay tuned for the next batch of exclusive offers soon'}
             </p>
          </div>
        </div>
      </div>
    </section>
  );
};
