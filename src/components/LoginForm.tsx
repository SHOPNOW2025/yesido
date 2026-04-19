import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: Full name would typically be added to profile or a users collection
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-10 mt-4">
            <h2 className="text-3xl font-black text-gray-800 mb-2">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </h2>
            <p className="text-gray-400 text-sm">مرحباً بك في عالم منتجات Yesido الأصلية</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs text-right animate-pulse">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase mr-1">الاسم الكامل</label>
                <div className="relative">
                  <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ادخل اسمك الكامل"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm text-right font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm text-right font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase mr-1">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-4 focus:border-brand-red focus:bg-white outline-none transition-all text-sm text-right font-medium"
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-left">
                <a href="#" className="text-xs font-bold text-brand-red hover:underline">نسيت كلمة المرور؟</a>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-red/20 hover:bg-brand-dark transition-all active:scale-95 mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {isLogin ? 'دخول' : 'تسجيل'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-400">
              {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            </span>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-red font-bold hover:underline"
            >
              {isLogin ? 'سجل الآن' : 'سجل دخولك'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
