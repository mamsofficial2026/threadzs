const DeliverySlip = ({ order }) => {
  return (
    <div className="max-w-[800px] mx-auto bg-white p-10 font-sans text-gray-900 border border-gray-200 shadow-2xl my-10">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b-4 border-gray-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">THREADZS</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Wear Beyond Ordinary</p>
          <div className="mt-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            <p>1/1A, Shop No: 4, Eswaran Complex,</p>
            <p>Gate Lock Road, Madurai - 625009</p>
            <p>TN, India</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Packing Slip</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Order ID: #THZ-{order.id || '8821'}</p>
          
          <div className="bg-gray-50 p-4 rounded-xl inline-block text-left border border-gray-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Date</p>
            <p className="text-xs font-black">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* CUSTOMER & PAYMENT INFO */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 mb-4">Ship To</h3>
          <div className="text-sm font-bold leading-relaxed">
            <p className="text-lg font-black uppercase mb-1">{order.customerName || 'Maddy Madhavan'}</p>
            <p className="text-gray-600">{order.address || '1/1A, Shop No: 4, Eswaran Complex'}</p>
            <p className="text-gray-600">{order.cityStatePin || 'Madurai, TN - 625009'}</p>
            <p className="mt-2 text-gray-900">Ph: {order.phone || '+91 9043241335'}</p>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/20 blur-3xl rounded-full"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4 relative z-10">Payment & Status</h3>
          <div className="text-xs space-y-3 relative z-10">
            <div className="flex justify-between">
              <span className="text-gray-400">Method:</span>
              <span className="font-black">Direct UPI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="font-black">904324133516</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
              <span className="text-gray-400">Status:</span>
              <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Delivered</span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="mb-12">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Item Description</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Size</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Qty</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold">
            <tr className="border-b border-gray-50">
              <td className="py-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-100">
                   {/* Replace with real product thumbnail */}
                   <div className="w-full h-full bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-black uppercase tracking-tight">{order.itemName || 'Midnight Neko Oversized'}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Premium 240 GSM Cotton</p>
                </div>
              </td>
              <td className="py-6 text-center text-gray-900">{order.size || 'XL'}</td>
              <td className="py-6 text-center text-gray-900">{order.qty || '1'}</td>
              <td className="py-6 text-right font-black">₹{order.price || '2099'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TOTAL SECTION */}
      <div className="flex justify-end pt-6">
        <div className="w-full max-w-[240px] space-y-3">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
            <span>Subtotal</span>
            <span>₹2099</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
            <span>Shipping</span>
            <span className="text-emerald-600 font-black">FREE</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
            <span className="text-sm font-black uppercase tracking-tighter">Grand Total</span>
            <span className="text-2xl font-black italic text-orange-600 tracking-tighter">₹2148</span>
          </div>
        </div>
      </div>

      {/* FOOTER MESSAGE */}
      <div className="mt-20 pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Thank you for joining the culture.</p>
        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Tag us in your fits @THREADZS_OFFICIAL</p>
      </div>
    </div>
  );
};

export default DeliverySlip;