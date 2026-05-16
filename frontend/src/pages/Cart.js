import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowLeft, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('threadzs_cart')) || [];
    setCartItems(savedCart);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCart();

    // Listen for changes in other tabs or components
    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('storage', loadCart);
    
    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('threadzs_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cartItems];
    const item = newCart[index];
    const newQty = (item.quantity || 1) + delta;
    if (newQty >= 1) {
      item.quantity = newQty;
      updateCart(newCart);
    }
  };

  const removeItem = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    updateCart(newCart);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#fcfaf8] pb-20">
      <div className="pt-10 pb-6 text-center bg-white border-b border-gray-100 relative">
        <button onClick={() => navigate(-1)} className="absolute left-6 top-9 p-2 hover:bg-gray-50 rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Your Bag</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-xl font-black uppercase mb-2">Bag is Empty</h2>
            <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">Grab some fresh drops first</p>
            <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
              Go Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.size}`} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex gap-6 shadow-sm relative">
                  <button onClick={() => removeItem(index)} className="absolute top-5 right-5 text-gray-300 hover:text-rose-500 transition">
                    <Trash2 size={18} />
                  </button>
                  <div className="w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                    <img src={item.cart_image || item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <div>
                      <h3 className="text-sm font-black uppercase text-gray-900 pr-10">{item.name}</h3>
                      <p className="text-[10px] font-black text-orange-600 uppercase mt-1 tracking-widest">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black italic">₹{item.price}</span>
                      <div className="flex items-center gap-4 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <button onClick={() => updateQuantity(index, -1)} className="font-black text-lg hover:text-orange-600">-</button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)} className="font-black text-lg hover:text-orange-600">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-[380px]">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-28">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6">Summary</h3>
                <div className="space-y-4 text-xs font-bold text-gray-500 mb-6 pb-6 border-b border-gray-50">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-900">₹{subtotal}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? "text-emerald-600 uppercase" : "text-gray-900"}>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-black uppercase">Total</span>
                  <span className="text-2xl font-black italic text-orange-600">₹{total}</span>
                </div>
                <button onClick={() => navigate('/checkout', { state: { items: cartItems, total } })} className="w-full bg-gray-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all flex items-center justify-center gap-3">
                  Checkout Now <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;