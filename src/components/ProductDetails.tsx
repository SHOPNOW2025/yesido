import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '../types';
import { useTranslation } from '../LanguageContext';
import { useCart } from '../CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Flame } from 'lucide-react';
import { SEO } from './SEO';
import { LoadingScreen } from './LoadingScreen';
import { CountdownTimer } from './CountdownTimer';

export const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const { t, lang } = useTranslation();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          setActiveImage(data.image || (data.images && data.images[0]));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading) return <LoadingScreen />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{lang === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}</h2>
        <Link to="/" className="text-brand-red font-bold hover:underline">{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Link>
      </div>
    </div>
  );

  const isFlash = !!product.flashOffer;
  const currentPrice = isFlash ? product.flashOffer!.discountPrice : product.price;
  const originalPrice = isFlash ? product.price : (product.oldPrice || product.price);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  
  const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={t(product.name)}
        description={t(product.metaDescription || product.description)}
        image={activeImage}
      />
      
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/" 
          className={`flex items-center gap-2 text-gray-500 hover:text-brand-red transition-colors mb-8 font-bold ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}
        >
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          <span>{lang === 'ar' ? 'العودة للمتجر' : 'Back to Store'}</span>
        </Link>

        <div className={`grid lg:grid-cols-2 gap-16 ${lang === 'ar' ? '' : 'lg:flex-row-reverse'}`}>
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              layoutId={`product-image-${product.id}`}
              className="aspect-square bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 flex items-center justify-center p-8"
            >
              <img src={activeImage} alt={t(product.name)} className="max-w-full max-h-full object-contain" />
            </motion.div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-24 rounded-2xl border-2 transition-all flex-shrink-0 p-2 bg-gray-50 ${activeImage === img ? 'border-brand-red' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`space-y-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <span className="bg-brand-red/10 text-brand-red text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  {t(product.category)}
                </span>
                {product.stock > 0 && (
                  <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {lang === 'ar' ? 'متوفر في المخزون' : 'In Stock'}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 leading-tight">{t(product.name)}</h1>
              {isFlash && (
                <div className={`inline-flex items-center gap-3 bg-red-50 text-brand-red px-6 py-3 rounded-2xl border border-red-100 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <Flame size={20} className="animate-pulse" />
                  <span className="font-black">{lang === 'ar' ? 'عرض ناري ينتهي في:' : 'Flash Deal expires in:'}</span>
                  <CountdownTimer expiresAt={product.flashOffer!.expiresAt} />
                </div>
              )}
            </div>

            <div className={`flex items-baseline gap-4 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-5xl font-black text-brand-red">{currentPrice.toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-gray-300 line-through font-bold">{originalPrice.toFixed(2)} د.أ</span>
                  <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-lg">
                    {lang === 'ar' ? `وفّر ${discountPercentage}%` : `Save ${discountPercentage}%`}
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-wrap">
              {t(product.description)}
            </p>

            <div className="space-y-6 pt-6">
              <button 
                onClick={() => product.stock > 0 && addToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-brand-red text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-brand-red/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:grayscale disabled:opacity-50"
              >
                <ShoppingCart size={24} />
                <span>{lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
              </button>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <ShieldCheck className="text-brand-red" />, label: lang === 'ar' ? 'ضمان أصلي' : 'Original Warranty' },
                  { icon: <Truck className="text-brand-red" />, label: lang === 'ar' ? 'توصيل سريع' : 'Fast Delivery' },
                  { icon: <RefreshCcw className="text-brand-red" />, label: lang === 'ar' ? 'إرجاع سهل' : 'Easy Returns' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4 text-center space-y-2 border border-gray-100/50">
                    <div className="flex justify-center">{item.icon}</div>
                    <span className="text-[10px] font-black text-gray-500 block">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
