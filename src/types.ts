export interface Product {
  id: string;
  name: { ar: string; en: string };
  price: number;
  oldPrice?: number;
  images: string[];
  image: string; // Keep for compatibility
  category: { ar: string; en: string };
  description: { ar: string; en: string };
  stock: number;
  flashOffer?: {
    discountPrice: number;
    expiresAt: string; // ISO string
  };
}

export interface HeroContent {
  badge: { ar: string; en: string };
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  cta: { ar: string; en: string };
  image?: string;
}

export interface SiteContent {
  hero: HeroContent;
  navigationHeroes: {
    [key: string]: HeroContent;
  };
  footer: {
    about: { ar: string; en: string };
  };
}

export interface Category {
  id: string;
  name: { ar: string; en: string };
  icon: string; // Emoji or image URL
}

export interface CartItem extends Product {
  quantity: number;
}
