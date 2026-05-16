import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Smartphone, Truck } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '', // Important for shipping calculation
    pincode: '',
    paymentMethod: 'Direct UPI (QR Code)' 
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const passedItems = location.state?.items;
    
    if (passedItems && passedItems.length > 0) {
      setCheckoutItems(passedItems);
      localStorage.setItem('threadzs_cart', JSON.stringify(passedItems)); 
    } else {
      const cartItems = JSON.parse(localStorage.getItem('threadzs_cart')) || []; 
      setCheckoutItems(cartItems);
    }
  }, [location.state]);

  // --- SHIPPING LOGIC ---
  useEffect(() => {
    if (!formData.state) {
      setShippingCost(0);
    } else if (formData.state.toLowerCase() === 'tamil nadu') {
      setShippingCost(49);
    } else {
      setShippingCost(79);
    }
  }, [formData.state]);

  const subtotal = checkoutItems.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
  const grandTotal = subtotal + (checkoutItems.length > 0 ? shippingCost : 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    navigate('/payment', { 
      state: { 
        total: grandTotal,
        subtotal: subtotal,
        shipping: shippingCost,
        customerDetails: formData,
        items: checkoutItems
      } 
    });
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fcfaf8] font-black uppercase tracking-widest text-gray-900">
        No items to checkout. 
        <button onClick={() => navigate('/')} className="text-orange-600 mt-4 border-b-2 border-orange-600 pb-1">Return to Store</button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfaf8] min-h-screen pb-20 font-sans">
      <header className="bg-white border-b border-gray-100 py-6 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-orange-600 transition p-2 rounded-full hover:bg-gray-50">
              <ArrowLeft size={20}/>
            </button>
            <h1 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <Lock size={16} className="text-emerald-500" /> Secure Checkout
            </h1>
          </div>
          <span className="text-xl font-black italic text-gray-900">₹{grandTotal}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT: SHIPPING FORM */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">Shipping Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <input required name="firstName" placeholder="First Name" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all" />
                <input required name="lastName" placeholder="Last Name" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all" />
              </div>

              <input required name="email" type="email" placeholder="Email Address" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all" />
              <input required name="phone" type="tel" maxLength="10" placeholder="Mobile Number" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all" />
              <input required name="address" placeholder="Flat, House no, Building, Area" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all" />

              <div className="grid grid-cols-2 gap-4">
                <select required name="state" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all">
                  <option value="">Select State</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Other">Other India</option>
                </select>
                <input required name="pincode" placeholder="Pincode" maxLength="6" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl text-sm font-bold focus:border-orange-500 outline-none transition-all" />
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-500 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase">Payment Method</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Direct UPI via QR Code</p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full border-4 border-orange-500 bg-white"></div>
            </div>

            <button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl bg-gray-900 hover:bg-orange-600 text-white flex items-center justify-center gap-3 active:scale-95">
              Proceed to Pay ₹{grandTotal}
            </button>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:pl-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 h-fit sticky top-32 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8 border-b border-gray-50 pb-4">Order Summary</h3>
              
              <div className="space-y-5 mb-8">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative shrink-0">
                      <img src={item.cart_image || item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.quantity || 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-black uppercase text-gray-800 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">SIZE: {item.size}</p>
                    </div>
                    <span className="text-xs font-black italic">₹{item.price * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 pt-6 border-t border-gray-50">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-900">₹{subtotal}</span></div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><Truck size={14}/> Shipping</span>
                  <span className={shippingCost > 0 ? "text-orange-600" : "text-gray-300 italic"}>
                    {shippingCost > 0 ? `₹${shippingCost}` : "Select State"}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Amount</span>
                <span className="text-3xl font-black italic text-orange-600 tracking-tighter">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;