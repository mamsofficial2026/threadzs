import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Package, LogOut, Clock, MapPin, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login', { state: { returnTo: '/profile' } });
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // --- THE ULTIMATE PHONE NUMBER FIX ---
      const userPhone = currentUser.phone || '';
      
      // Remove all non-numeric characters (like +, -, spaces)
      const cleanDigits = userPhone.replace(/\D/g, '');
      
      // Extract ONLY the last 10 digits (the core Indian phone number)
      const basePhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
      
      // Create every possible format to check against the database
      const phoneVariations = [
        basePhone,                // "9043241335" (Most likely format from Checkout)
        `+91${basePhone}`,        // "+919043241335"
        `91${basePhone}`,         // "919043241335" (Format shown in your screenshot)
        `0${basePhone}`,          // "09043241335"
        userPhone                 // Raw fallback
      ];

      // Remove any duplicate variations
      const uniquePhoneVariations = [...new Set(phoneVariations)];

      console.log("🔍 DEBUG: Searching orders for these variations:", uniquePhoneVariations);

      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .in('phone', uniquePhoneVariations)
        .order('created_at', { ascending: false });

      if (!error && orderData) {
        setOrders(orderData);
      } else if (error) {
        console.error("Supabase Error fetching orders:", error);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center font-black uppercase text-orange-600 tracking-widest text-xs">Loading Profile...</div>;
  }

  return (
    <div className="bg-[#fcfaf8] min-h-screen font-sans pb-32 lg:pb-10 selection:bg-orange-600 selection:text-white">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-center shadow-sm">
        <button onClick={() => navigate(-1)} className="absolute left-4 sm:left-6 p-2 text-gray-500 hover:text-gray-900 transition bg-gray-50 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <span className="text-lg font-black italic tracking-tighter text-gray-900">MY ACCOUNT</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12 flex flex-col gap-8">
        
        {/* PROFILE CARD */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-orange-600 to-rose-600 flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-lg shrink-0">
              {user?.user_metadata?.full_name?.charAt(0) || <User size={32} />}
            </div>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-1 md:mb-2">
                {user?.user_metadata?.full_name || 'Valued Customer'}
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                {user?.phone}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-6 py-3 rounded-xl md:rounded-full text-[10px] font-black uppercase tracking-widest transition shadow-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* ORDER HISTORY SECTION */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-orange-600" size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Order History</h3>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Package size={32} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">No Orders Yet</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Looks like you haven't dropped anything in your bag.</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                let itemsArray = [];
                try {
                  itemsArray = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                } catch (e) {
                  console.error("Error parsing order items for order ID:", order.id);
                }
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Order ID: #{String(order.id).split('-')[0]}</span>
                        <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5"><Clock size={12}/> {formatDateTime(order.created_at)}</span>
                      </div>
                      
                      <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
                        <span className="text-lg md:text-xl font-black italic text-orange-600 block mb-0 md:mb-2">₹{order.total_amount}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm
                          ${order.status === 'New' ? 'bg-amber-100 text-amber-700' : 
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                            order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-emerald-100 text-emerald-700'}`}
                        >
                          {order.status === 'New' && <AlertCircle size={10} />}
                          {order.status === 'Processing' && <Package size={10} />}
                          {order.status === 'Shipped' && <Truck size={10} />}
                          {order.status === 'Delivered' && <CheckCircle size={10} />}
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {itemsArray.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 md:gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="w-10 h-12 md:w-12 md:h-14 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                            {/* UPDATED: Checks item.cart_image first to fetch the correct active display drops */}
                            <img src={item.cart_image || item.image_url || item.img || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] md:text-xs font-black uppercase text-gray-900 truncate">{item.name}</h5>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Size: <span className="text-gray-900">{item.size || '-'}</span> | Qty: <span className="text-gray-900">{item.qty || item.quantity || 1}</span></p>
                          </div>
                          <span className="text-[11px] md:text-xs font-black italic text-gray-900 pr-1 md:pr-2">₹{item.price * (item.qty || item.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                        Delivering to: <span className="text-gray-800">{order.address}</span>
                      </p>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Profile;