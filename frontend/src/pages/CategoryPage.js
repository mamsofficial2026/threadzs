import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { ShoppingBag, SlidersHorizontal, X, ChevronDown, Heart } from 'lucide-react';

const CheckCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Category = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // 🔥 FIX: Automatically grabs the URL parameter regardless of what you named it in App.js
  const activeCategory = params.categoryName || params.id || params.category || Object.values(params)[0] || '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mobile Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter States
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(5000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!activeCategory) return; // Prevent running if category is blank
      
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', `%${activeCategory}%`);

      if (!error && data) {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    };

    fetchCategoryProducts();
  }, [activeCategory]); // Reruns if the category changes

  useEffect(() => {
    let result = [...products];

    if (inStockOnly) result = result.filter(p => p.stock > 0);
    result = result.filter(p => p.price <= priceRange);
    
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'price_low_high') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_high_low') result.sort((a, b) => b.price - a.price);

    setFilteredProducts(result);
  }, [products, inStockOnly, priceRange, selectedSizes, sortBy]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-orange-600 border-orange-600' : 'border-gray-300 group-hover:border-orange-500'}`}>
            {inStockOnly && <CheckCircle size={12} className="text-white" />}
          </div>
          <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          <span className="text-sm font-bold text-gray-700 uppercase">In Stock Only</span>
        </label>
      </div>

      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Price</h4>
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
          <span>₹0</span>
          <span>₹{priceRange}</span>
        </div>
        <input type="range" min="0" max="5000" step="100" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full accent-orange-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
      </div>

      <div>
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Size</h4>
        <div className="space-y-3">
          {sizes.map(size => (
            <label key={size} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSizes.includes(size) ? 'bg-orange-600 border-orange-600' : 'border-gray-300 group-hover:border-orange-500'}`}>
                {selectedSizes.includes(size) && <CheckCircle size={12} className="text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={selectedSizes.includes(size)} onChange={() => toggleSize(size)} />
              <span className="text-sm font-bold text-gray-700 uppercase">{size}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfaf8] font-sans">
      
      {/* HEADER */}
      <header className="px-4 sm:px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition flex items-center"
        >
          &lt; HOME / {decodeURIComponent(activeCategory).toUpperCase()}
        </button>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md cursor-pointer" onClick={() => navigate('/profile')}>
            M
          </div>
          <button className="relative text-gray-900 hover:text-orange-600 transition" onClick={() => navigate('/bag')}>
            <ShoppingBag size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row gap-8">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0">
          <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-6 pb-4 border-b border-gray-200">Filters</h3>
          <FilterContent />
        </aside>

        {/* MAIN PRODUCT AREA */}
        <div className="flex-1">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">
              {decodeURIComponent(activeCategory)}
            </h1>
            
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {filteredProducts.length} Results
              </span>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-900 py-2 pl-4 pr-8 rounded-full outline-none cursor-pointer"
                  >
                    <option value="newest">Newest first</option>
                    <option value="price_low_high">Price: Low to High</option>
                    <option value="price_high_low">Price: High to Low</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* MOBILE FILTER BUTTON */}
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-black uppercase text-orange-600">Loading Drops...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="group bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-100 flex flex-col">
                  <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 text-center flex flex-col grow justify-between">
                    <h3 className="text-xs font-bold text-gray-800 uppercase mb-2 line-clamp-2">{p.name}</h3>
                    <span className="text-lg font-black italic text-gray-900">₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-xs font-black uppercase text-gray-400">No drops found in this category.</div>
          )}
        </div>
      </main>

      {/* MOBILE FILTER BOTTOM SHEET */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[2rem] z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <FilterContent />
              </div>

              <div className="p-6 border-t border-gray-100 bg-white shrink-0 pb-8">
                <button onClick={() => setIsFilterOpen(false)} className="w-full bg-orange-600 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg">
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Category;