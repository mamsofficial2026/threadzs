import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, UserIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        {/* Left: Search */}
        <div className="flex-1">
          <MagnifyingGlassIcon className={`h-6 w-6 cursor-pointer ${isScrolled ? 'text-black' : 'text-white'}`} />
        </div>

        {/* Center: Branding */}
        <Link to="/" className={`text-4xl font-black italic tracking-tighter uppercase transition-colors ${isScrolled ? 'text-black' : 'text-white'}`}>
          MAM'S <span className="text-mams-orange">STUDIO</span>
        </Link>

        {/* Right: Icons */}
        <div className={`flex-1 flex justify-end gap-8 items-center ${isScrolled ? 'text-black' : 'text-white'}`}>
          <UserIcon className="h-6 w-6 cursor-pointer hover:text-mams-orange transition" />
          <HeartIcon className="h-6 w-6 cursor-pointer hover:text-mams-orange transition" />
          <div className="relative group cursor-pointer">
            <ShoppingBagIcon className="h-7 w-7 group-hover:text-mams-orange transition" />
            <span className="absolute -top-1 -right-1 bg-mams-orange text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">0</span>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;