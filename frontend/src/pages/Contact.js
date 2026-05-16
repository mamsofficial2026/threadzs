import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf8] font-sans pb-20">
      
      {/* HERO SECTION */}
      <section className="relative bg-gray-900 text-white py-24 px-4 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-orange-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4 block">Here to Help</span>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">
            Hit <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Us Up</span>
          </h1>
          <p className="text-xs md:text-sm font-bold text-gray-400 max-w-lg mx-auto">
            Got a question about a drop, your order, or just want to talk streetwear? Hit our line below.
          </p>
        </motion.div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }} 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          
          {/* LEFT COLUMN: THE HQ */}
          <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-10 border-l-4 border-orange-600 pl-4">
              The HQ
            </h2>
            <div className="space-y-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-2">Flagship Store</h4>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed">
                    1/1A, shop no. 4, Eswaran Complex,<br/>Gate Lock Road, Madurai.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 shrink-0 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-2">Support Email</h4>
                  <p className="text-sm font-bold text-gray-500">mamsofficial2026@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: WHATSAPP & HOURS */}
          <div className="space-y-8">
            
            {/* WhatsApp CTA Card */}
            <div className="bg-gray-900 p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-start">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                  <MessageCircle size={26} />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Chat on WhatsApp</h3>
                <p className="text-xs font-bold text-gray-400 mb-8 leading-relaxed">
                  The fastest way to reach our crew. Hit us up for sizing info, order tracking, or returns.
                </p>
                <a 
                  href="https://wa.me/919043241335" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-400 hover:scale-105 transition-all shadow-xl"
                >
                  Message Us
                </a>
                <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-widest">+91 9043241335</p>
              </div>
            </div>

            {/* Support Hours Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Clock size={20} className="text-orange-600" />
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Support Hours</h3>
              </div>
              <ul className="space-y-4 text-xs font-bold text-gray-500">
                <li className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span>Mon - Fri</span><span className="text-gray-900">10:00 AM - 7:00 PM</span>
                </li>
                <li className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span>Saturday</span><span className="text-gray-900">10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Sunday</span><span className="text-gray-900">10:00 AM - 4:00 PM</span>
                </li>
              </ul>
            </div>

          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;