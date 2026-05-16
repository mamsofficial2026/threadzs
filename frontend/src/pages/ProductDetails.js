import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { ArrowLeft, ShoppingBag, Heart, Star, Check } from 'lucide-react';

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 py-5">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex justify-between items-center w-full text-left font-black uppercase tracking-widest text-xs text-gray-900 group"
      >
        {title}
        <span className="text-gray-400 font-normal text-xl leading-none group-hover:text-orange-600 transition-colors">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="pt-4 text-[11px] font-bold text-gray-500 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState('');
  const [gallery, setGallery] = useState([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0); 

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data);
        const allImages = data.gallery_images && data.gallery_images.length > 0 
          ? data.gallery_images 
          : [data.image_url];
        setGallery(allImages);
        setSelectedImage(allImages[0]);

        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .ilike('category', `%${data.category}%`)
          .neq('id', id)
          .limit(4);

        if (relatedData) setRelatedProducts(relatedData);
      }
      setLoading(false);
    };
    fetchProductDetails();
  }, [id]);

  // SILENT ADD TO BAG LOGIC
  const handleAddToBag = () => {
    setIsAdding(true);
    
    // 1. Get current cart
    const existingCart = JSON.parse(localStorage.getItem('threadzs_cart')) || [];
    
    // 2. Add logic
    const existingItemIndex = existingCart.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        ...product,
        cart_image: selectedImage || product.image_url, 
        size: selectedSize,
        quantity: 1
      });
    }

    // 3. Save
    localStorage.setItem('threadzs_cart', JSON.stringify(existingCart));

    // 4. Update Header Bag Counter (Global Event)
    window.dispatchEvent(new Event('cartUpdated'));

    // 5. Visual feedback without moving page
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(true);
      // Success checkmark stays for 2 seconds then goes back to "Add to Bag"
      setTimeout(() => setShowSuccess(false), 2000);
    }, 600);
  };

  if (loading) return <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center font-black uppercase tracking-widest text-orange-600 text-xs">Loading Drop...</div>;
  if (!product) return <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-xs">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-[#fcfaf8] font-sans pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm h-16 px-4 sm:px-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition rounded-full hover:bg-gray-50 flex items-center gap-2">
          <ArrowLeft size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">Back</span>
        </button>
        <span className="text-lg font-black italic tracking-tighter text-gray-900">THREADZS</span>
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/profile')}>M</div>
          <button className="relative text-gray-900 hover:text-orange-600 transition" onClick={() => navigate('/bag')}><ShoppingBag size={20} /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
          {/* IMAGE SECTION */}
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-1/2 shrink-0">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 shrink-0 order-2 md:order-1 no-scrollbar pb-2 md:pb-0 h-auto md:max-h-[600px]" style={{ scrollbarWidth: 'none' }}>
              {gallery.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(img)} className={`rounded-xl overflow-hidden shrink-0 w-16 h-20 md:w-full md:h-24 transition-all duration-300 border-2 ${selectedImage === img ? 'border-orange-600 opacity-100 shadow-md' : 'border-transparent opacity-50 hover:opacity-100 bg-gray-50'}`}>
                  <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 order-1 md:order-2 bg-gray-50 rounded-[2rem] overflow-hidden aspect-[3/4] md:h-[600px] relative shadow-sm border border-gray-100 group">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white shadow-md transition"><Heart size={18} /></button>
              {product.stock <= 0 && <div className="absolute top-4 left-4 bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Sold Out</div>}
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="flex-1 flex flex-col pt-4 lg:pt-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-none mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-black italic text-orange-600">₹{product.price}</span>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 tracking-widest bg-gray-50 px-3 py-1 rounded-full"><Star size={12} className="text-amber-400 fill-amber-400" /> 4.9 (120 Reviews)</div>
            </div>

            <div className="mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-4">Select Size</h4>
              <div className="flex flex-wrap gap-3">
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs font-black transition-all ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-110' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>{size}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {product.stock > 0 ? (
                <>
                  {/* ADD TO BAG: Now stays on page and shows a success state */}
                  <button 
                    onClick={handleAddToBag} 
                    disabled={isAdding} 
                    className={`flex-1 font-black uppercase tracking-widest text-xs py-4 px-8 rounded-full transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
                      showSuccess ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isAdding ? 'Processing...' : showSuccess ? <><Check size={16}/> Added to Bag</> : 'Add to Bag'}
                  </button>

                  <button onClick={() => navigate('/checkout', { state: { items: [{ ...product, quantity: 1, size: selectedSize }], total: product.price } })} className="relative overflow-hidden flex-1 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] hover:-translate-y-1 transition-all duration-300 group flex items-center justify-center gap-2">
                    <span className="relative z-10 flex items-center gap-2">Buy It Now <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-125 transition-transform duration-300"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg></span>
                  </button>
                </>
              ) : (
                <button disabled className="w-full bg-gray-200 text-gray-500 font-black uppercase tracking-widest text-xs py-4 px-8 rounded-full cursor-not-allowed">Out of Stock</button>
              )}
            </div>

            {/* ACCORDIONS */}
            <div className="mt-8 pt-2 border-t border-gray-100">
              <AccordionItem title="Description" defaultOpen={true}>
                {product.description ? <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: product.description }} /> : "Premium quality apparel crafted for the perfect fit."}
              </AccordionItem>
              <AccordionItem title="Shipping Policy"><p>Orders are dispatched within 2-3 business days. Free shipping over ₹999.</p></AccordionItem>
              <AccordionItem title="Return Policies"><p>7-day hassle-free exchange policy for sizing issues.</p></AccordionItem>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase mb-8 border-l-4 border-orange-600 pl-4">Explore More</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 flex flex-col">
                  <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden"><img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="p-4 md:p-6 text-center flex flex-col grow justify-between"><h3 className="text-[11px] md:text-sm font-bold text-gray-800 uppercase mb-2 leading-tight line-clamp-2">{p.name}</h3><span className="text-lg font-black italic text-orange-600">₹{p.price}</span></div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Product;