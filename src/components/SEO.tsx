import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const { lang } = useTranslation();
  
  const siteTitle = lang === 'ar' ? 'يسيدو - متجر الإكسسوارات الأفضل' : 'Yesido - Best Accessories Store';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = lang === 'ar' 
    ? 'اكتشف أفضل إكسسوارات الهواتف من يسيدو في الأردن. شواحن، كوابل، سماعات، وحماية بأفضل الأسعار.' 
    : 'Discover the best phone accessories from Yesido in Jordan. Chargers, cables, headphones, and protection at the best prices.';
  
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};
