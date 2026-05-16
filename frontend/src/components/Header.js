// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; 

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- SEARCH STATES ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All Drops', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' }
  ];

  // Close search and mobile menu on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Real-time Supabase Search Logic
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .ilike('name', `%${searchQuery}%`)
        .limit(6);

      if (!error && data) {
        setSearchResults(data);
      }
      setIsSearching(false);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 font-sans shadow-sm relative">
      
      {/* TIER 1: Top Contact & Info Bar */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 border-b border-gray-50 bg-[#fcfaf8]">
        <div className="flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <span className="flex items-center gap-2"><Phone size={12} className="text-orange-600"/> +91 9043241335</span>
          <span className="flex items-center gap-2"><Mail size={12} className="text-orange-600"/> mamsofficial2026@gmail.com</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600">
          Free standard shipping on all orders over ₹999!
        </div>
      </div>

      {/* TIER 2: Main Logo & Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-900 p-2 -ml-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex-1 md:flex-none flex justify-center md:justify-start cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-gray-900 leading-none">THREADZS</span>
            </div>
          </div>

          <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-orange-600 transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5 justify-end shrink-0">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              className={`transition hidden sm:block ${isSearchOpen ? 'text-orange-600' : 'text-gray-900 hover:text-orange-600'}`}
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <button onClick={() => navigate('/profile')} className="text-gray-900 hover:text-orange-600 transition"><User size={20} /></button>
            <button className="text-gray-900 hover:text-orange-600 transition hidden sm:block"><Heart size={20} /></button>
            <button onClick={() => navigate('/bag')} className="text-gray-900 hover:text-orange-600 transition relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm">2</span>
            </button>
          </div>

        </div>
      </div>

      {/* --- GLOBAL SEARCH DROPDOWN --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for tees, collections, or drops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-12 pr-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>

              {/* Search Results Area */}
              <div className="max-w-5xl mx-auto mt-8">
                {isSearching ? (
                  <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 animate-pulse py-10">
                    Locating Drops...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-6">
                    {searchResults.map((product) => (
                      <div 
                        key={product.id} 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                      >
                        <div className="w-16 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</h4>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{product.category}</p>
                          <p className="text-sm font-black italic text-gray-900 mt-1">₹{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 py-10">
                    No drops found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-2xl h-screen z-40">
          <nav className="flex flex-col px-6 py-8 gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest text-gray-900 border-b border-gray-50 pb-4">
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;