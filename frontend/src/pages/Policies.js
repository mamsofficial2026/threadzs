import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, RefreshCcw, FileText, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Policies = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('terms');

  // Auto-select tab based on URL state (if navigated from Footer)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={16} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <ShieldCheck size={16} /> },
    { id: 'shipping', label: 'Shipping Policy', icon: <Truck size={16} /> },
    { id: 'refund', label: 'Refund & Cancellation', icon: <RefreshCcw size={16} /> },
  ];

  const content = {
    terms: (
      <div className="space-y-6 text-sm text-gray-600 font-bold leading-relaxed">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Terms & Conditions</h2>
        <p>Welcome to THREADZS. By accessing our website and purchasing our premium streetwear drops, you agree to be bound by these Terms & Conditions.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">1. General Conditions</h3>
        <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">2. Limited Drops & Inventory</h3>
        <p>THREADZS operates on a limited-drop model. Products are available while supplies last. We do not guarantee restocks on previous collections. Prices for our products are subject to change without notice.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">3. Accuracy of Information</h3>
        <p>We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
      </div>
    ),
    privacy: (
      <div className="space-y-6 text-sm text-gray-600 font-bold leading-relaxed">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Privacy Policy</h2>
        <p>At THREADZS, we take your privacy seriously. This policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">1. Personal Information We Collect</h3>
        <p>When you make a purchase, we collect certain information from you, including your name, billing address, shipping address, payment information (including UPI IDs/Cards), email address, and phone number.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">2. How We Use Your Information</h3>
        <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">3. Data Security</h3>
        <p>Your data is stored securely. We do not sell or rent your personal information to third parties. Payment processing is handled by secure, encrypted third-party gateways.</p>
      </div>
    ),
    shipping: (
      <div className="space-y-6 text-sm text-gray-600 font-bold leading-relaxed">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Shipping Policy</h2>
        <p>We know you want your gear fast. Here is how we handle fulfillment and shipping from our Madurai HQ.</p>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 my-6">
          <ul className="space-y-3">
            <li className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-900">Standard Shipping (All India)</span>
              <span className="text-orange-600 font-black">₹100.00</span>
            </li>
            <li className="flex justify-between items-center pt-2">
              <span className="text-gray-900">Orders Over ₹999</span>
              <span className="text-emerald-600 font-black uppercase tracking-widest">Free Shipping</span>
            </li>
          </ul>
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">1. Dispatch Time</h3>
        <p>All orders are processed and dispatched within 24-48 business hours. You will receive a tracking link via email/WhatsApp once your order is handed over to our delivery partners (Blue Dart / Delhivery).</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">2. Delivery Timeframes</h3>
        <p>Tamil Nadu & South India: 2-4 Business Days<br/>Rest of India: 4-7 Business Days</p>
      </div>
    ),
    refund: (
      <div className="space-y-6 text-sm text-gray-600 font-bold leading-relaxed">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-6">Refund & Cancellation</h2>
        <p>Our priority is ensuring you are hyped about your THREADZS apparel. Please review our strict return and exchange guidelines below.</p>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 my-6 text-rose-800">
          <p className="font-black uppercase tracking-widest text-[10px] mb-2">Important Notice</p>
          <p className="text-xs">An unboxing video is <strong>MANDATORY</strong> to claim any refunds for damaged or missing products. No video, no refund.</p>
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">1. Size Exchanges</h3>
        <p>We offer a 7-day exchange policy for sizing issues. The garment must be unworn, unwashed, and have all original tags attached. Reverse pickup charges (₹100) will be borne by the customer.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">2. Refunds</h3>
        <p>We do not offer "change of mind" refunds. Refunds are only processed if a defective or incorrect item was delivered. Once verified, refunds will be credited to your original payment method (or UPI) within 5-7 business days.</p>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mt-8 mb-3">3. Cancellations</h3>
        <p>Orders can only be cancelled within 12 hours of placement. Once an order is processed and shipped, it cannot be cancelled.</p>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] font-sans pb-20">
      
      {/* HEADER */}
      <section className="bg-gray-900 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">
          Legal & <span className="text-orange-500">Policies</span>
        </h1>
        <p className="text-xs font-bold text-gray-400 max-w-lg mx-auto uppercase tracking-widest">
          Everything you need to know about shopping with THREADZS.
        </p>
      </section>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          
          {/* SIDEBAR TABS */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-28 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-lg scale-105 origin-left' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-3">{tab.icon} {tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={16} />}
                </button>
              ))}

              <div className="mt-10 p-6 bg-white border border-gray-100 rounded-2xl text-center shadow-sm hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Need Help?</p>
                <p className="text-xs font-bold text-gray-600 mb-4">Contact our Madurai HQ for further assistance.</p>
                <a href="mailto:mamsofficial2026@gmail.com" className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline block">
                  mamsofficial2026@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* POLICY CONTENT */}
          <div className="flex-1 min-w-0 bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {content[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Policies;