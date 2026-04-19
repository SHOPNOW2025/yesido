import React from 'react';
import { ShoppingCart, Plus, Flame } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useTranslation } from '../LanguageContext';
import { motion } from 'motion/react';
import { CountdownTimer } from './CountdownTimer';

import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { t, lang } = useTranslation();
  const isFlash = !!product.flashOffer;
  
  const currentPrice = isFlash ? product.flashOffer!.discountPrice : product.price;
  const originalPrice = isFlash ? product.price : (product.oldPrice || product.price);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl border ${isFlash ? 'border-brand-red ring-1 ring-brand-red/20' : 'border-gray-100'} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative`}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <img 
          src={product.image || (product.images && product.images[0])} 
          alt={t(product.name)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute top-3 flex flex-col gap-2 items-end ${lang === 'ar' ? 'right-3' : 'left-3'}`}>
          <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {t(product.category)}
          </span>
          {hasDiscount && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {lang === 'ar' ? `خصم ${discountPercentage}%` : `${discountPercentage}% OFF`}
            </span>
          )}
          {isFlash && (
            <div className="bg-white/90 backdrop-blur-sm border border-brand-red rounded-full px-2 py-1 flex items-center gap-1.5 shadow-sm">
              <Flame size={12} className="text-brand-red animate-pulse" />
              <CountdownTimer expiresAt={product.flashOffer!.expiresAt} />
            </div>
          )}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-orange-100 text-orange-600 text-[10px] font-black py-1 px-2 rounded-lg text-center backdrop-blur-sm border border-orange-200">
              {lang === 'ar' ? `بقي ${product.stock} فقط في المخزون!` : `Only ${product.stock} left in stock!`}
            </div>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-black px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest">
              {lang === 'ar' ? 'نفذ المخزون' : 'Sold Out'}
            </span>
          </div>
        )}
      </Link>
      
      <div className={`p-5 flex flex-col flex-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <Link to={`/product/${product.id}`} className="hover:text-brand-red transition-colors">
          <h3 className="text-gray-800 font-bold text-lg mb-1 line-clamp-1">{t(product.name)}</h3>
        </Link>
        <p className="text-gray-400 text-xs mb-3 font-mono">Yesido Accessory</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 leading-relaxed">
          {t(product.description)}
        </p>
        
        <div className={`mt-auto flex items-center justify-between ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex flex-col">
            <span className="text-brand-red font-bold text-xl">{currentPrice.toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
            {hasDiscount && (
              <span className="text-gray-400 text-xs line-through">{originalPrice.toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
            )}
          </div>
          
          <button 
            onClick={() => product.stock > 0 && addToCart(product)}
            disabled={product.stock === 0}
            className="bg-brand-red text-white p-3 rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand-red/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <div className="flex items-center gap-2 font-bold px-1">
               <Plus size={18} />
               <span>{lang === 'ar' ? 'أضف' : 'Add'}</span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
