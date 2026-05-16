import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShoppingBag, ChevronRight, ChevronLeft, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from './supabaseClient'; // Ensure this path is correct based on your setup

// --- COMPONENTS ---
const CategoryStory = ({ label, img, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.15 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    onClick={onClick}
    className="flex flex-col items-center gap-4 cursor-pointer min-w-[120px] group relative z-10"
  >
    <div className="p-1 rounded-full border-2 border-orange-500 shadow-xl group-hover:shadow-orange-600/40 transition-all duration-300">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-gray-200">
        <img src={img} alt={label} draggable="false" className="w-full h-full object-cover opacity-100" />
      </div>
    </div>
    <span className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-orange-500 transition-colors duration-300 text-center whitespace-nowrap px-2">
      {label}
    </span>
  </motion.div>
);

const ProductSection = ({ id, categoryName, title, products, bgColor = "bg-white" }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const isInView = useInView(scrollContainerRef, { once: true, margin: "-50px" });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    let scrollInterval;
    if (!isDragging && !isHovered && products.length > 0) {
      scrollInterval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: 332, behavior: 'smooth' });
          }
        }
      }, 3000); 
    }
    return () => clearInterval(scrollInterval);
  }, [isDragging, isHovered, products.length]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleExploreAll = () => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  return (
    <section id={id} className={`${bgColor} py-28 transition-colors duration-500 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 border-l-4 border-orange-600 pl-6">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
              {title.split(' ')[0]} <span className="text-orange-600">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-[0.3em]">Wear Beyond Ordinary</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex gap-2">
              <button onClick={() => scroll(-350)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll(350)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm"><ChevronRight size={18} /></button>
            </div>
            <button onClick={handleExploreAll} className="flex items-center gap-2 text-xs font-black uppercase border-b-2 border-black pb-1 hover:text-orange-600 hover:border-orange-600 transition-all group cursor-pointer">
              Explore All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)}
          className={`flex overflow-x-auto gap-8 pb-10 snap-x snap-mandatory no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.length > 0 ? (
            products.map((p, index) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 30 }} 
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.08 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }} 
                onClick={() => { if (!isDragging) navigate(`/product/${p.id}`); }} 
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 w-[280px] md:w-[300px] shrink-0 snap-start flex-none cursor-pointer"
              >
                <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden pointer-events-none">
                  <img src={p.image_url} alt={p.name} draggable="false" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full flex items-center gap-2 shadow-xl">
                      <Eye size={16} className="text-orange-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">View Details</span>
                    </div>
                  </div>
                  {p.stock <= 0 && (
                    <div className="absolute top-5 right-5">
                      <span className="bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Out of Stock</span>
                    </div>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="absolute top-5 right-5">
                      <span className="bg-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Low Stock</span>
                    </span>
                  )}
                </div>
                <div className="p-8 text-center pointer-events-none">
                  <h3 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-tight h-10 line-clamp-2">{p.name}</h3>
                  <div className="pointer-events-auto mt-2">
                    <span className="text-2xl font-black text-gray-900 italic">₹{p.price}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="w-full py-20 text-center text-gray-300 font-black uppercase tracking-[0.4em]">No Drops Found in this Category</div>
          )}
        </div>
      </div>
    </section>
  );
};

// --- MAIN HOME PAGE ---
const Home = () => {
  const [products, setProducts] = useState([]);
  const [siteCategories, setSiteCategories] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on load
    const fetchBrandData = async () => {
      // Fetch Categories
      const { data: catData } = await supabase.from('brand_categories').select('*').order('display_order', { ascending: true });
      if (catData) setSiteCategories(catData);

      // Fetch Products
      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) setProducts(prodData);
    };
    fetchBrandData();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#fcfaf8] min-h-screen">
      
      {/* HERO BANNER */}
      <div className="relative h-[80vh] bg-gray-900 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2000" 
            alt="Streetwear Hero" 
            className="w-full h-full object-cover object-top" 
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full inline-block mb-6 shadow-xl"
          >
            🔥 SUMMER SALE IS LIVE
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter text-white mb-6 leading-[0.9]"
          >
            WEAR BEYOND<br/>ORDINARY
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
            className="text-sm md:text-base font-bold text-gray-300 uppercase tracking-widest max-w-2xl mx-auto mb-10"
          >
            SUMMER '26 DROP IS LIVE. GRAB THE FRESHEST TEES BEFORE THEY SELL OUT.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
            onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="bg-white text-gray-900 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 mx-auto shadow-2xl hover:scale-105"
          >
            SHOP THE DROP <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>

      {/* CATEGORY STORY BUBBLES */}
      <section className="bg-[#4a1d33] pt-12 pb-16 relative overflow-visible">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar"> 
          <div className="flex justify-center gap-20 min-w-max py-4">
            {siteCategories.map((cat) => (
              <CategoryStory 
                key={cat.id} 
                label={cat.label} 
                img={cat.image_url} 
                onClick={() => scrollToSection(cat.label.toLowerCase().replace(/\s/g, '-'))} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC PRODUCT SECTIONS */}
      <main id="shop-section" className="overflow-hidden">
        {siteCategories.map((cat, index) => (
          <ProductSection 
            key={cat.id}
            id={cat.label.toLowerCase().replace(/\s/g, '-')}
            categoryName={cat.label} 
            title={`${cat.label} Essentials`}
            products={products.filter(p => p.category === cat.label)} 
            bgColor={index % 2 === 0 ? "bg-white" : "bg-[#f9f6f2]"}
          />
        ))}
      </main>

    </div>
  );
};

export default Home;