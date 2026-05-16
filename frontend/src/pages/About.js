// src/pages/About.js
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cultureImg from '../assets/about-culture.jpg';
const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf8] font-sans pb-20">
      
      {/* HERO SECTION */}
      <section className="relative bg-gray-900 text-white py-32 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-6 block">The Threadzs Story</span>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 leading-none">
            Wear Beyond <span className="text-orange-500 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Ordinary</span>
          </h1>
          <p className="text-sm md:text-base font-bold text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Born in Madurai, built for the culture. We are not just an apparel brand; we are a movement redefining premium streetwear with uncompromising quality and unapologetic aesthetics.
          </p>
        </motion.div>
      </section>

      {/* MISSION & VISION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="aspect-square md:aspect-[4/5] bg-gray-200 rounded-[2rem] overflow-hidden relative shadow-xl"
          >
            {/* Placeholder for an aesthetic brand image */}
     <img 
  src={cultureImg} 
  alt="Streetwear Culture" 
  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <h3 className="absolute bottom-8 left-8 text-3xl font-black italic uppercase text-white tracking-tighter">
              Authentic.<br/>Raw.<br/>Premium.
            </h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-6">
              Our <span className="text-orange-600">Mission</span>
            </h2>
            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
              We noticed a gap in the market: streetwear was either too expensive or lacked genuine quality. THREADZS was created to bridge that gap. We source the finest heavy-weight cotton, obsess over the stitching details, and design drops that speak to the modern trailblazer.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1">Premium Fabric</h4>
                  <p className="text-[11px] font-bold text-gray-500 leading-relaxed">No compromises. We use high-GSM fabrics that fall perfectly and last through hundreds of washes.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1">Exclusive Drops</h4>
                  <p className="text-[11px] font-bold text-gray-500 leading-relaxed">We don't mass produce. Every collection is a limited drop to ensure your style remains unique.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-900 mb-12">
            The THREADZS Standard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={32} />, title: "Quality Assured", text: "Every single piece is hand-checked for stitching, print quality, and fabric integrity before it leaves our fulfillment center." },
              { icon: <Users size={32} />, title: "Community First", text: "We listen to our crew. Your feedback drives our next drops, our sizing improvements, and our brand evolution." },
              { icon: <Zap size={32} />, title: "Fast Dispatch", text: "We hate waiting as much as you do. Our streamlined fulfillment ensures your gear ships out within 48 hours." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }}
                className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-orange-500 hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-900 mx-auto mb-6 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 mb-6">
          Ready to join the crew?
        </h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10">
          Explore our latest drops before they sell out.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-900 hover:scale-105 transition-all shadow-xl"
        >
          Shop All Drops <ArrowRight size={16} />
        </button>
      </section>

    </div>
  );
};

export default About;