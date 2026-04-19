import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Send, Loader2, MapPin } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../LanguageContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const GOVERNORATES = [
  { ar: 'عمان', en: 'Amman', cost: 3 },
  { ar: 'الزرقاء', en: 'Zarqa', cost: 5 },
  { ar: 'إربد', en: 'Irbid', cost: 5 },
  { ar: 'البلقاء', en: 'Balqa', cost: 5 },
  { ar: 'مأدبا', en: 'Madaba', cost: 5 },
  { ar: 'المفرق', en: 'Mafraq', cost: 5 },
  { ar: 'جرش', en: 'Jerash', cost: 5 },
  { ar: 'عجلون', en: 'Ajloun', cost: 5 },
  { ar: 'الكرك', en: 'Karak', cost: 5 },
  { ar: 'الطفيلة', en: 'Tafilah', cost: 5 },
  { ar: 'معان', en: 'Ma\'an', cost: 5 },
  { ar: 'العقبة', en: 'Aqaba', cost: 5 },
];

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGov, setSelectedGov] = useState<string>('');

  const shippingInfo = GOVERNORATES.find(g => g.en === selectedGov || g.ar === selectedGov);
  const shippingCost = shippingInfo ? shippingInfo.cost : 0;
  const finalTotal = totalPrice + shippingCost;

  const handleWhatsAppCheckout = async () => {
    if (!selectedGov) {
      alert(lang === 'ar' ? "يرجى اختيار المحافظة لتحديد تكلفة التوصيل" : "Please select a governorate to determine shipping cost");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      
      // Save to Firestore
      const orderData = {
        orderNumber,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: finalTotal,
        shippingCost,
        governorate: selectedGov,
        customer: user ? {
          uid: user.uid,
          email: user.email,
        } : 'guest',
        createdAt: serverTimestamp(),
        status: 'pending'
      };

      await addDoc(collection(db, 'orders'), orderData);

      const phoneNumber = "962770000000"; // Replace with real store number
      
      let message = `*طلب جديد من متجر Yesido*\n`;
      message += `*رقم الطلب:* #${orderNumber}\n`;
      if (user?.email) message += `*العميل:* ${user.email}\n`;
      message += `*المحافظة:* ${selectedGov}\n`;
      message += `\n*المنتجات:*\n`;
      
      cart.forEach((item, index) => {
        message += `${index + 1}. ${t(item.name)} (x${item.quantity}) - ${item.price * item.quantity} د.أ\n`;
      });
      
      message += `\n*مجموع المنتجات:* ${totalPrice.toFixed(2)} د.أ\n`;
      message += `*تكلفة التوصيل:* ${shippingCost.toFixed(2)} د.أ\n`;
      message += `*المجموع الكلي:* ${finalTotal.toFixed(2)} د.أ\n`;
      message += `\nيرجى تأكيد هذا الطلب.`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      clearCart();
      onClose();
    } catch (error) {
      console.error("Order submission failed:", error);
      alert(lang === 'ar' ? "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى." : "Error processing order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 h-full w-full max-w-[450px] bg-white z-[70] shadow-2xl flex flex-col ${lang === 'ar' ? 'right-0' : 'left-0'}`}
          >
            {/* Header */}
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`flex items-center gap-3 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <h2 className="text-xl font-bold text-gray-800">{lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}</h2>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">
                  {cart.length} {lang === 'ar' ? 'منتجات' : 'Products'}
                </span>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <Trash2 size={40} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">{lang === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}</p>
                    <p className="text-sm text-gray-400">{lang === 'ar' ? 'ابدأ بتصفح المنتجات وأضف ما يعجبك' : 'Discover products and add what you love'}</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-6 py-3 bg-brand-red text-white rounded-full font-bold text-sm"
                  >
                    {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className={`flex gap-4 group ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={item.image} alt={t(item.name)} className="w-full h-full object-cover" />
                        </div>
                        <div className={`flex-1 flex flex-col justify-between ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div className={`flex justify-between gap-2 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2">{t(item.name)}</h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className={`flex items-center justify-between mt-2 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-brand-red"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-brand-red"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-bold text-brand-red">{(item.price * item.quantity).toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Selection */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                      <MapPin size={18} className="text-brand-red" />
                      <h4 className="font-bold text-gray-800">{lang === 'ar' ? 'معلومات التوصيل' : 'Shipping Information'}</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-bold px-1">{lang === 'ar' ? 'اختر المحافظة' : 'Select Governorate'}</label>
                      <select 
                        value={selectedGov}
                        onChange={(e) => setSelectedGov(e.target.value)}
                        className={`w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-brand-red transition-all appearance-none font-bold text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                      >
                        <option value="">{lang === 'ar' ? '-- اختر من هنا --' : '-- Select here --'}</option>
                        {GOVERNORATES.map(g => (
                          <option key={g.en} value={lang === 'ar' ? g.ar : g.en}>
                            {lang === 'ar' ? g.ar : g.en} ({g.cost} {lang === 'ar' ? 'د.أ' : 'JOD'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="space-y-2">
                  <div className={`flex items-center justify-between text-sm ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="text-gray-400">{lang === 'ar' ? 'مجموع المنتجات:' : 'Subtotal:'}</span>
                    <span className="font-bold text-gray-700">{totalPrice.toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="text-gray-400">{lang === 'ar' ? 'تكلفة التوصيل:' : 'Shipping Cost:'}</span>
                    <span className="font-bold text-gray-700">{shippingCost.toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
                  </div>
                  <div className={`flex items-center justify-between text-lg pt-2 border-t border-gray-200 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <span className="text-gray-500 font-black">{lang === 'ar' ? 'المجموع الكلي:' : 'Order Total:'}</span>
                    <span className="text-2xl font-black text-brand-red">{finalTotal.toFixed(2)} {lang === 'ar' ? 'د.أ' : 'JOD'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleWhatsAppCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                    <span>{isSubmitting ? (lang === 'ar' ? 'جاري معالجة الطلب...' : 'Processing...') : (lang === 'ar' ? 'إرسال الطلب عبر واتساب' : 'Checkout via WhatsApp')}</span>
                  </button>
                  <p className="text-[10px] text-center text-gray-400 italic">
                    {lang === 'ar' ? '* التوصيل لمحفظة عمان 3 دنانير وباقي المحافظات 5 دنانير.' : '* Shipping to Amman is 3 JOD, other governorates 5 JOD.'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
