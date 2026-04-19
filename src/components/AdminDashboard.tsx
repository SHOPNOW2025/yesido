import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useSite } from '../SiteContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { Product, SiteContent, Category } from '../types';
import { PRODUCTS } from '../data';
import { Plus, Edit, Trash2, Save, X, Globe, Layout, Package, Upload, Image as ImageIcon, Loader2, Flame } from 'lucide-react';
import { motion } from 'motion/react';

const IMGBB_API_KEY = 'a16fdd9aead1214d64e435c9b83a0c2e';

const NAV_LINKS = [
  { ar: 'الرئيسية', en: 'Home' },
  { ar: 'وصل حديثاً', en: 'New Arrivals' },
  { ar: 'إكسسوارات السيارات', en: 'Car Accessories' },
  { ar: 'الشواحن', en: 'Chargers' },
  { ar: 'السماعات', en: 'Headphones' }
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { content, updateContent } = useSite();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'site' | 'dynamicHeroes'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingHeroKey, setEditingHeroKey] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState<SiteContent>(content);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setSiteForm(content);
  }, [content]);

  const navLinks = NAV_LINKS;

  // Check if user is admin
  const isAdmin = user?.email === 'admin@yesido.com';

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const dbProds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // We want to show defaults only if they aren't "shadowed" or "deleted"
      // But for a better admin experience, we'll just show what's in Firestore if it's not empty, 
      // OR merge them if the admin is just starting.
      
      const productsMap = new Map<string, Product>();
      
      // Only add defaults if we have very few or no products in DB (initial state)
      if (dbProds.length === 0) {
        PRODUCTS.forEach(p => productsMap.set(p.id, p));
      }
      
      // DB products always win and override
      dbProds.forEach(p => productsMap.set(p.id, p));
      
      setProducts(Array.from(productsMap.values()));
    } catch (err) {
      console.error(err);
      setProducts(PRODUCTS);
    }
  };

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    setCategories(cats);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory?.id) {
        const { id, ...data } = editingCategory;
        await updateDoc(doc(db, 'categories', id), data as any);
      } else {
        await addDoc(collection(db, 'categories'), editingCategory);
      }
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا التصنيف؟')) {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'hero' | 'navHero' | 'category', navKey?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        const url = result.data.url;
        if (type === 'product') {
          setEditingProduct(prev => {
            const currentImages = prev?.images || [];
            const newImages = [...currentImages, url];
            return { 
              ...prev!, 
              images: newImages, 
              image: url // Set as main image for compatibility
            };
          });
        } else if (type === 'hero') {
          setSiteForm(prev => ({ ...prev, hero: { ...prev.hero, image: url } }));
        } else if (type === 'navHero' && navKey) {
          const current = siteForm.navigationHeroes?.[navKey] || { badge: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, cta: { ar: '', en: '' }, image: '' };
          setSiteForm(prev => ({
            ...prev,
            navigationHeroes: {
              ...prev.navigationHeroes,
              [navKey]: { ...current, image: url }
            }
          }));
        } else if (type === 'category' && editingCategory) {
          setEditingCategory(prev => ({ ...prev!, icon: url }));
        }
      } else {
        alert('فشل رفع الصورة');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct?.id) {
        const { id, ...data } = editingProduct;
        await setDoc(doc(db, 'products', id), data as any, { merge: true });
      } else {
        await addDoc(collection(db, 'products'), editingProduct);
      }
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert('حدث خطأ أثناء محاولة حذف المنتج');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveSite = async () => {
    setLoading(true);
    try {
      await updateContent(siteForm);
      alert('تم التحديث بنجاح');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-black text-gray-800">غير مصرح لك بالدخول</h1>
          <p className="text-gray-500">هذه المنطقة مخصصة للمسؤولين فقط</p>
          <a href="/" className="inline-block text-brand-red font-bold">العودة للرئيسية</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-800 mb-6 px-2">لوحة التحكم</h2>
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Package size={20} />
                  <span>المنتجات</span>
                </button>
                <button 
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'categories' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Layout size={20} />
                  <span>التصنيفات</span>
                </button>
                <button 
                  onClick={() => setActiveTab('site')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'site' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Layout size={20} />
                  <span>محتوى الموقع</span>
                </button>
                <button 
                  onClick={() => setActiveTab('dynamicHeroes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'dynamicHeroes' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Globe size={20} />
                  <span>تفاعلات الهيرو</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'products' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-800">إدارة المنتجات</h3>
                  <button 
                    onClick={() => setEditingProduct({ name: { ar: '', en: '' }, category: { ar: '', en: '' }, description: { ar: '', en: '' }, price: 0, image: '' })}
                    className="bg-brand-red text-white pr-4 pl-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all"
                  >
                    <Plus size={20} />
                    <span>إضافة منتج</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-4">
                      <img src={p.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-50" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 line-clamp-1">{p.name.ar}</h4>
                        <p className="text-brand-red font-bold">{p.price} د.أ</p>
                        <div className="flex items-center gap-2 mt-4">
                          <button onClick={() => setEditingProduct(p)} className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:text-brand-red transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'categories' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-800">إدارة التصنيفات</h3>
                  <button 
                    onClick={() => setEditingCategory({ name: { ar: '', en: '' }, icon: '' })}
                    className="bg-brand-red text-white pr-4 pl-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all"
                  >
                    <Plus size={20} />
                    <span>إضافة تصنيف</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(c => (
                    <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                        {c.icon.startsWith('http') ? <img src={c.icon} className="w-8 h-8 object-contain" /> : c.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{c.name.ar}</h4>
                        <p className="text-xs text-gray-400 font-mono">{c.name.en}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingCategory(c)} className="p-2 text-gray-400 hover:text-brand-red transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'site' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-800">تعديل محتوى الموقع</h3>
                  <button 
                    onClick={handleSaveSite}
                    disabled={loading}
                    className="bg-brand-red text-white pr-4 pl-6 py-3 rounded-2xl font-bold flex items-center gap-2"
                  >
                    <Save size={20} />
                    <span>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
                  {/* Hero Settings */}
                  <div className="space-y-4">
                    <h4 className="font-black text-gray-800 border-b pb-2">قسم الهيرو (Hero Section)</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">العنوان الرئيسي (عربي)</label>
                        <input value={siteForm.hero.title.ar} onChange={e => setSiteForm({...siteForm, hero: {...siteForm.hero, title: {...siteForm.hero.title, ar: e.target.value}}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">Main Title (EN)</label>
                        <input value={siteForm.hero.title.en} onChange={e => setSiteForm({...siteForm, hero: {...siteForm.hero, title: {...siteForm.hero.title, en: e.target.value}}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" dir="ltr" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400">صورة الهيرو (Main Hero Image)</label>
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-brand-red transition-all flex flex-col items-center justify-center gap-2 group">
                          {uploading ? (
                            <Loader2 className="animate-spin text-brand-red" size={24} />
                          ) : siteForm.hero.image ? (
                            <div className="flex items-center gap-3">
                              <img src={siteForm.hero.image} className="w-12 h-12 rounded-lg object-cover" />
                              <span className="text-sm font-bold text-gray-500 group-hover:text-brand-red">تغيير الصورة</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="text-gray-400 group-hover:text-brand-red" size={24} />
                              <span className="text-sm font-bold text-gray-400 group-hover:text-brand-red">اضغط لرفع صورة</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Footer Settings */}
                  <div className="space-y-4">
                    <h4 className="font-black text-gray-800 border-b pb-2">عن المتجر (Footer)</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">الوصف (عربي)</label>
                        <textarea value={siteForm.footer.about.ar} onChange={e => setSiteForm({...siteForm, footer: {...siteForm.footer, about: {...siteForm.footer.about, ar: e.target.value}}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all h-32" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400">About (EN)</label>
                        <textarea value={siteForm.footer.about.en} onChange={e => setSiteForm({...siteForm, footer: {...siteForm.footer, about: {...siteForm.footer.about, en: e.target.value}}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all h-32 text-left" dir="ltr" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-800">تخصيص الهيرو عند الوقوف بالمؤشر</h3>
                  <button 
                    onClick={handleSaveSite}
                    disabled={loading}
                    className="bg-brand-red text-white pr-4 pl-6 py-3 rounded-2xl font-bold flex items-center gap-2"
                  >
                    <Save size={20} />
                    <span>{loading ? 'جاري الحفظ...' : 'حفظ الكل'}</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {navLinks.map(link => {
                    const hero = siteForm.navigationHeroes?.[link.en] || { 
                      badge: { ar: '', en: '' }, 
                      title: { ar: '', en: '' }, 
                      subtitle: { ar: '', en: '' }, 
                      cta: { ar: '', en: '' },
                      image: ''
                    };
                    return (
                      <div key={link.en} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-bold text-gray-800">{link.ar} / {link.en}</h4>
                          <button 
                            onClick={() => setEditingHeroKey(link.en)}
                            className="text-brand-red font-bold text-sm hover:underline"
                          >
                            تعديل
                          </button>
                        </div>
                        {hero.title.ar ? (
                          <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-700">{hero.title.ar}</p>
                            {hero.image && <img src={hero.image} className="w-16 h-16 rounded-xl object-cover" />}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm italic">لم يتم إعداد هيرو مخصص بعد</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-6">{editingProduct.id ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">الاسم بالعربي</label>
                  <input required value={editingProduct.name?.ar} onChange={e => setEditingProduct({...editingProduct, name: {...editingProduct.name!, ar: e.target.value}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">Name in English</label>
                  <input required value={editingProduct.name?.en} onChange={e => setEditingProduct({...editingProduct, name: {...editingProduct.name!, en: e.target.value}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" dir="ltr" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">التصنيف</label>
                  <select 
                    required 
                    value={editingProduct.category?.en} 
                    onChange={e => {
                      const selectedCat = categories.find(c => c.name.en === e.target.value);
                      if (selectedCat) {
                        setEditingProduct({...editingProduct, category: selectedCat.name});
                      }
                    }} 
                    className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all appearance-none"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name.en}>{c.name.ar}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">المخزون (Stock)</label>
                  <input type="number" required value={editingProduct.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400">صور المنتج (يمكنك رفع أكثر من صورة)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {editingProduct.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border group">
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = editingProduct.images?.filter((_, i) => i !== idx) || [];
                          setEditingProduct({...editingProduct, images: newImages, image: newImages[0] || ''});
                        }}
                        className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-brand-red hover:bg-gray-100 transition-all">
                    {uploading ? <Loader2 className="animate-spin text-brand-red" /> : <Plus className="text-gray-400" />}
                    <span className="text-[10px] font-bold text-gray-400">إضافة صورة</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">السعر الأصلي (د.أ)</label>
                  <input type="number" step="0.01" required value={editingProduct.oldPrice || editingProduct.price} onChange={e => setEditingProduct({...editingProduct, oldPrice: parseFloat(e.target.value)})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">السعر بعد الخصم (د.أ)</label>
                  <input type="number" step="0.01" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">الوصف بالعربي</label>
                  <textarea required value={editingProduct.description?.ar} onChange={e => setEditingProduct({...editingProduct, description: {...editingProduct.description!, ar: e.target.value}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all h-24" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">Description (EN)</label>
                  <textarea required value={editingProduct.description?.en} onChange={e => setEditingProduct({...editingProduct, description: {...editingProduct.description!, en: e.target.value}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all h-24 text-left" dir="ltr" />
                </div>
              </div>

              {/* Flash Offer Settings */}
              <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
                    <Flame size={18} className="text-white" />
                  </div>
                  <h4 className="font-black text-brand-red">إعدادات العرض الناري (اختياري)</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400">سعر العرض الناري</label>
                    <input 
                      type="number" 
                      value={editingProduct.flashOffer?.discountPrice || ''} 
                      onChange={e => setEditingProduct({
                        ...editingProduct, 
                        flashOffer: { 
                          discountPrice: parseFloat(e.target.value), 
                          expiresAt: editingProduct.flashOffer?.expiresAt || new Date(Date.now() + 86400000).toISOString() 
                        }
                      })} 
                      className="w-full bg-white border border-red-100 rounded-xl p-3 outline-none focus:border-brand-red" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400">تاريخ انتهاء العرض</label>
                    <input 
                      type="datetime-local" 
                      value={editingProduct.flashOffer?.expiresAt ? new Date(editingProduct.flashOffer.expiresAt).toISOString().slice(0, 16) : ''} 
                      onChange={e => setEditingProduct({
                        ...editingProduct, 
                        flashOffer: { 
                          discountPrice: editingProduct.flashOffer?.discountPrice || editingProduct.price!, 
                          expiresAt: new Date(e.target.value).toISOString() 
                        }
                      })} 
                      className="w-full bg-white border border-red-100 rounded-xl p-3 outline-none focus:border-brand-red" 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-red-400">* إذا تركت السعر فارغاً، لن يظهر المنتج في قسم العروض النارية.</p>
              </div>

              <button disabled={loading || uploading} className="w-full bg-brand-red text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-xl shadow-brand-red/20 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                <span>{editingProduct.id ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto">
            <h3 className="text-2xl font-black mb-6">{editingCategory.id ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400">اسم التصنيف (بالعربي)</label>
                <input required value={editingCategory.name?.ar} onChange={e => setEditingCategory({...editingCategory, name: {...editingCategory.name!, ar: e.target.value}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400">Category Name (English)</label>
                <input required value={editingCategory.name?.en} onChange={e => setEditingCategory({...editingCategory, name: {...editingCategory.name!, en: e.target.value}})} className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400">أيوقنة أو صورة التصنيف</label>
                <div className="flex gap-4">
                  <input required value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} placeholder="📱 أو رابط صورة" className="flex-1 bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" />
                  <label className="cursor-pointer bg-gray-100 text-gray-500 p-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center">
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'category')} disabled={uploading} />
                  </label>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-brand-red text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-xl shadow-brand-red/20 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                <span>{editingCategory.id ? 'حفظ التعديلات' : 'إضافة'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Dynamic Hero Modal */}
      {editingHeroKey && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingHeroKey(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-6">تخصيص الهيرو لـ: {editingHeroKey}</h3>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">العنوان الرئيسي (عربي)</label>
                  <input 
                    value={siteForm.navigationHeroes?.[editingHeroKey]?.title.ar || ''} 
                    onChange={e => {
                      const current = siteForm.navigationHeroes?.[editingHeroKey] || { badge: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, cta: { ar: '', en: '' }, image: '' };
                      setSiteForm({
                        ...siteForm,
                        navigationHeroes: {
                          ...siteForm.navigationHeroes,
                          [editingHeroKey]: { ...current, title: { ...current.title, ar: e.target.value } }
                        }
                      });
                    }}
                    className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">Title (EN)</label>
                  <input 
                    value={siteForm.navigationHeroes?.[editingHeroKey]?.title.en || ''} 
                    onChange={e => {
                      const current = siteForm.navigationHeroes?.[editingHeroKey] || { badge: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, cta: { ar: '', en: '' }, image: '' };
                      setSiteForm({
                        ...siteForm,
                        navigationHeroes: {
                          ...siteForm.navigationHeroes,
                          [editingHeroKey]: { ...current, title: { ...current.title, en: e.target.value } }
                        }
                      });
                    }}
                    className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all" dir="ltr" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">الوصف (عربي)</label>
                  <textarea 
                    value={siteForm.navigationHeroes?.[editingHeroKey]?.subtitle.ar || ''} 
                    onChange={e => {
                      const current = siteForm.navigationHeroes?.[editingHeroKey] || { badge: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, cta: { ar: '', en: '' }, image: '' };
                      setSiteForm({
                        ...siteForm,
                        navigationHeroes: {
                          ...siteForm.navigationHeroes,
                          [editingHeroKey]: { ...current, subtitle: { ...current.subtitle, ar: e.target.value } }
                        }
                      });
                    }}
                    className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all h-24" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400">Subtitle (EN)</label>
                  <textarea 
                    value={siteForm.navigationHeroes?.[editingHeroKey]?.subtitle.en || ''} 
                    onChange={e => {
                      const current = siteForm.navigationHeroes?.[editingHeroKey] || { badge: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, cta: { ar: '', en: '' }, image: '' };
                      setSiteForm({
                        ...siteForm,
                        navigationHeroes: {
                          ...siteForm.navigationHeroes,
                          [editingHeroKey]: { ...current, subtitle: { ...current.subtitle, en: e.target.value } }
                        }
                      });
                    }}
                    className="w-full bg-gray-50 border rounded-2xl p-4 outline-none focus:border-brand-red transition-all h-24 text-left" dir="ltr" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400">صورة الهيرو التفاعلية</label>
                <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-brand-red transition-all flex flex-col items-center justify-center gap-3 group">
                  {uploading ? (
                    <Loader2 className="animate-spin text-brand-red" size={32} />
                  ) : siteForm.navigationHeroes?.[editingHeroKey]?.image ? (
                    <div className="text-center space-y-3">
                      <img src={siteForm.navigationHeroes[editingHeroKey].image} className="w-32 h-32 rounded-2xl object-cover mx-auto shadow-lg" />
                      <div className="flex items-center justify-center gap-2 text-brand-red font-bold">
                        <Upload size={18} />
                        <span>تغيير الصورة</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="text-gray-400 group-hover:text-brand-red" size={28} />
                      </div>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-brand-red">ارفع صورة لهذا القسم</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'navHero', editingHeroKey)} disabled={uploading} />
                </label>
              </div>

              <button 
                onClick={() => setEditingHeroKey(null)}
                className="w-full bg-black text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2"
              >
                <Save size={24} />
                <span>تأكيد التعديلات مؤقتاً</span>
              </button>
              <p className="text-xs text-center text-gray-400">تذكر الضغط على "حفظ الكل" في الشاشة السابقة لحفظ التغييرات نهائياً.</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
