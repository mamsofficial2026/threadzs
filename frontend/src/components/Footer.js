import React from 'react';
import { MapPin, Phone, Mail, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  // Scroll to Top Function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#f2ede7] text-gray-800 pt-16 pb-8 font-sans border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUMN 1: Brand Info */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-3xl font-black italic tracking-tighter text-gray-900 leading-none">THREADZS</span>
              <span className="text-[9px] font-bold text-orange-600 tracking-widest mt-1 uppercase">Wear Beyond Ordinary</span>
            </div>
            <p className="text-xs font-bold text-gray-500 leading-relaxed pr-4">
              We are committed to providing you a secure & delightful shopping experience with premium streetwear apparel at the best price!
            </p>
            <div className="space-y-3 mt-2">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-700 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-gray-600 leading-relaxed">1/1A, Eswaran complex gate lock road <br/>Madurai, TN - 625009</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-700 shrink-0" />
                <span className="text-xs font-bold text-gray-600">+91 9043241335</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-700 shrink-0" />
                <span className="text-xs font-bold text-gray-600">mamsofficial2026@gmail.com</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Quick Links */}
          {/* COLUMN 2: Quick Links */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => navigate('/about')} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">About Us</button>
              </li>
              <li>
                <button onClick={() => navigate('/policies', { state: { activeTab: 'terms' } })} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">Terms & Conditions</button>
              </li>
              <li>
                <button onClick={() => navigate('/policies', { state: { activeTab: 'privacy' } })} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => navigate('/policies', { state: { activeTab: 'shipping' } })} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">Shipping Policy</button>
              </li>
              <li>
                <button onClick={() => navigate('/policies', { state: { activeTab: 'refund' } })} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">Refund & Cancellation</button>
              </li>
            </ul>
          </div>
          {/* COLUMN 3: Our Categories */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6">Our Categories</h4>
            <ul className="space-y-4">
              {['Crew Neck', 'V-Neck', 'Polo Shirt', 'Oversized Tees', 'Hoodies', 'Accessories'].map((category) => (
                <li key={category}>
                  <button onClick={() => navigate(`/category/${category}`)} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: Main Menu */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-6">Main Menu</h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop All Drops', path: '/' },
                { name: 'My Account', path: '/profile' },
                { name: 'Shopping Bag', path: '/bag' },
                { name: 'Contact Us', path: '/' }
              ].map((link) => (
                <li key={link.name}>
                  <button onClick={() => navigate(link.path)} className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-wider text-left">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR: Copyright & Scroll to Top */}
        <div className="border-t border-gray-300 pt-8 flex items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            © {new Date().getFullYear()} THREADZS. All rights reserved.
          </p>
          
          {/* Black Circle Up Arrow Button */}
          <button 
            onClick={scrollToTop}
            className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg shrink-0"
          >
            <ChevronUp size={20} />
          </button>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;