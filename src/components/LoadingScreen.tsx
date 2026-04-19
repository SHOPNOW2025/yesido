import React from 'react';
import { motion } from 'motion/react';

const LOGO_URL = "https://www.xmart.jo/cdn/shop/collections/yesido.webp?pad_color=fff&v=1735084174&width=350";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated outer ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-gray-100 border-t-brand-red rounded-full"
        />
        
        {/* Pulsing Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img 
            src={LOGO_URL} 
            alt="Loading..." 
            className="h-12 w-auto object-contain"
          />
        </motion.div>
      </div>
      
      {/* Loading Bar */}
      <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-brand-red"
        />
      </div>
    </div>
  );
};
