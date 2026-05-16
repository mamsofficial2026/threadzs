import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, Copy, Smartphone, 
  ShieldCheck, RefreshCw, Lock, Check, QrCode, Download
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import DeliverySlip from '../components/DeliverySlip';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { total: grandTotal = 0, customerDetails = {}, items: checkoutItems = [] } = location.state || {};
  
  const orderId = "THZ-" + Math.floor(1000 + Math.random() * 9000);
  
  const myUpiId = "madhavanpuppy16@oksbi";
  const merchantName = "THREADZS";

  const upiDeepLink = `upi://pay?pa=${myUpiId}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal}&cu=INR`;
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`;

  const [paymentStatus, setPaymentStatus] = useState('selection'); 
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(myUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    if (utrNumber.length < 12) {
      alert("Please enter a valid 12-digit UTR / Reference Number.");
      return;
    }

    setPaymentStatus('processing');

    try {
      const currentName = String(customerDetails?.firstName || 'Customer').trim();
      const notificationMessage = `THREADZS NEW ORDER - Drop Sold! Name: ${currentName} paid INR ${grandTotal}. UTR: ${utrNumber}`;

      const orderPayload = {
        customer_name: `${customerDetails.firstName || ''} ${customerDetails.lastName || ''}`.trim(),
        email: customerDetails.email || '',
        phone: customerDetails.phone || '',
        address: `${customerDetails.address || ''}, PIN: ${customerDetails.pincode || ''}`,
        total_amount: grandTotal,
        payment_method: `Direct UPI (UTR: ${utrNumber})`,
        status: 'New', 
        items: checkoutItems
      };

      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) throw error;

      // --- 🚨 ROBUST COMPATIBILITY NOTIFICATION BLOCK 🚨 ---
      try {
        await fetch('https://ntfy.sh/threadzs_orders_madurai', {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          body: notificationMessage
        });
        console.log("Ping sent to ntfy!");
      } catch (notifyError) {
        console.error("Push alert failed:", notifyError);
      }
      // --------------------------------------------------

      localStorage.removeItem('threadzs_cart'); 
      setPaymentStatus('success');

    } catch (error) {
      console.error("Order Failed to Save:", error);
      alert("Error saving order. Please check your internet connection and try again.");
      setPaymentStatus('selection');
    }
  };

  // --- DYNAMIC BILL GENERATION & DOWNLOAD LOGIC ---
  const handleDownloadBill = () => {
    const itemsArray = checkoutItems;
    const txnId = utrNumber || "N/A";
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>THREADZS_Bill_${orderId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; max-width: 850px; margin: 0 auto; line-height: 1.5; background-color: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #111; padding-bottom: 30px; margin-bottom: 40px; }
          .brand-logo { font-size: 38px; font-weight: 900; font-style: italic; letter-spacing: -2px; text-transform: uppercase; margin: 0; }
          .tagline { font-size: 10px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: #ea580c; margin-top: 5px; }
          .doc-title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; }
          .order-id { font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; margin-top: 5px; }
          .info-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin-bottom: 50px; }
          .info-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #ea580c; margin-bottom: 12px; }
          .info-box { font-size: 14px; font-weight: 700; color: #444; }
          .customer-name { font-size: 18px; font-weight: 900; color: #111; text-transform: uppercase; margin-bottom: 5px; }
          .payment-card { background: #111; color: #fff; padding: 25px; border-radius: 20px; }
          .payment-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; }
          .payment-val { font-weight: 900; color: #fff; }
          .payment-label { color: #888; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { padding: 15px 10px; border-bottom: 2px solid #f0f0f0; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; letter-spacing: 1px; }
          td { padding: 20px 10px; border-bottom: 1px solid #f9f9f9; font-size: 13px; font-weight: 700; }
          .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
          .total-table { width: 250px; }
          .grand-total { border-top: 2px solid #111; padding-top: 15px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 24px; font-weight: 900; font-style: italic; color: #ea580c; }
          .footer { margin-top: 80px; text-align: center; border-top: 1px solid #eee; padding-top: 30px; }
          .footer-text { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="brand-logo">THREADZS</h1>
            <p class="tagline">Wear Beyond Ordinary</p>
            <div style="margin-top: 20px; font-size: 10px; color: #777; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              1/1A, Shop No: 4, Eswaran Complex,<br/>Gate Lock Road, Madurai - 625009
            </div>
          </div>
          <div style="text-align: right;">
            <h2 class="doc-title">Packing Slip</h2>
            <p class="order-id">ID: #${orderId}</p>
            <div style="margin-top: 20px; font-size: 12px; font-weight: 900;">${dateStr}</div>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-label">Ship To</div>
            <div class="info-box">
              <div class="customer-name">${customerDetails.firstName || ''} ${customerDetails.lastName || ''}</div>
              <div>${customerDetails.address || ''}</div>
              <div>${customerDetails.city || ''}, ${customerDetails.state || ''} - ${customerDetails.pincode || ''}</div>
              <div style="margin-top: 8px; color: #111;">Ph: ${customerDetails.phone || ''}</div>
            </div>
          </div>
          <div class="payment-card">
            <div class="info-label" style="color: #ea580c;">Payment Details</div>
            <div class="payment-row"><span class="payment-label">Method:</span> <span class="payment-val">Direct UPI</span></div>
            <div class="payment-row"><span class="payment-label">Status:</span> <span class="payment-val" style="color: #10b981;">VERIFIED</span></div>
            <div style="margin-top: 15px; font-size: 9px; color: #666; text-transform: uppercase;">UTR/Txn ID: ${txnId}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Size</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsArray.map(item => `
              <tr>
                <td>
                  <div style="font-weight: 900; text-transform: uppercase;">${item.name}</div>
                  <div style="font-size: 9px; color: #aaa; margin-top: 4px; text-transform: uppercase;">Premium Cotton Streetwear</div>
                </td>
                <td style="text-align: center; color: #111;">${item.size || '-'}</td>
                <td style="text-align: center; color: #111;">${item.quantity || item.qty || 1}</td>
                <td style="text-align: right; font-weight: 900;">₹${item.price * (item.quantity || item.qty || 1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-table">
            <div class="grand-total">
              <span style="font-size: 12px; font-style: normal; color: #999; text-transform: uppercase;">Total Paid</span>
              <span>₹${grandTotal}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p class="footer-text">Thank you for joining the culture.</p>
          <p style="font-size: 8px; font-weight: 700; color: #ccc; margin-top: 10px;">@THREADZS_OFFICIAL</p>
        </div>
      </body>
      </html>
    `;

    const fileBlob = new Blob([htmlTemplate], { type: 'text/html' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(fileBlob);
    downloadLink.download = `Invoice_${orderId}.html`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#fcfaf8] py-12 px-4 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Order Secured</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Your interactive bill is ready for download</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[800px] shadow-2xl rounded-3xl overflow-hidden bg-white mb-10"
        >
          <DeliverySlip order={{
            id: orderId,
            customerName: `${customerDetails.firstName || ''} ${customerDetails.lastName || ''}`.trim(),
            address: customerDetails.address,
            cityStatePin: `${customerDetails.city || ''} ${customerDetails.state || ''} - ${customerDetails.pincode || ''}`,
            phone: customerDetails.phone,
            itemName: checkoutItems[0]?.name || "Premium Drop",
            size: checkoutItems[0]?.size || "M",
            qty: checkoutItems[0]?.quantity || 1,
            price: grandTotal
          }} />
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]">
          <button 
            onClick={handleDownloadBill} 
            className="flex-1 py-4 rounded-xl bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-xl active:scale-95"
          >
            <Download size={16}/> Download Bill
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="flex-1 py-4 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-[#fcfaf8] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <RefreshCw size={40} className="animate-spin text-orange-600 mb-6" />
          <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-2">Verifying UTR...</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center max-w-xs">
            Please do not press back. Securing your order...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfaf8] min-h-screen font-sans selection:bg-orange-600 selection:text-white pb-32 lg:pb-10">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-center shadow-sm">
        <button onClick={() => navigate(-1)} className="absolute left-4 sm:left-6 p-2 text-gray-500 hover:text-gray-900 transition rounded-full"><ArrowLeft size={20} /></button>
        <span className="text-lg font-black italic tracking-tighter text-gray-900 flex items-center gap-2"><Lock size={16} className="text-emerald-500"/> SECURE PAYMENT</span>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-2">Direct UPI Transfer</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Pay instantly via any UPI App. 100% Secure & Zero Fees.</p>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
            <a 
              href={upiDeepLink}
              className="w-full max-w-sm bg-gray-900 text-white py-5 rounded-2xl text-sm font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl hover:bg-orange-600 transition-all mb-8 active:scale-95"
            >
              <Smartphone size={20} />
              Open GPay / PhonePe
            </a>

            <div className="w-full max-w-sm space-y-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2">
                <span className="w-10 h-px bg-gray-200"></span> OR SCAN QR CODE <span className="w-10 h-px bg-gray-200"></span>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm relative group">
                  <img src={dynamicQrCodeUrl} alt="Scan to Pay" className="w-full h-full object-contain mix-blend-multiply" />
                  <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 flex items-center gap-2"><QrCode size={14}/> Scan to Pay ₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between mt-4">
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">UPI ID</p>
                  <p className="text-xs font-black text-gray-900 truncate pr-2">{myUpiId}</p>
                </div>
                <button 
                  type="button"
                  onClick={handleCopyUpi}
                  className="bg-white border border-gray-200 p-2.5 rounded-lg text-gray-600 hover:text-orange-600 hover:border-orange-600 transition shadow-sm shrink-0"
                >
                  {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[380px] shrink-0 space-y-6 w-full">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-4">Payment Summary</h3>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 block">Amount to Pay</span>
              <span className="text-3xl font-black italic text-orange-600">₹{grandTotal}</span>
            </div>

            <form onSubmit={handleVerifyPayment} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-900 block mb-2">Enter UTR / Ref Number <span className="text-rose-500">*</span></label>
                <input 
                  required
                  type="text" 
                  maxLength="12"
                  placeholder="e.g. 312345678901"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-300" 
                />
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-2">12-digit number found in your UPI app after payment.</p>
              </div>

              <button 
                type="submit"
                disabled={utrNumber.length < 12}
                className="w-full bg-[#ea580c] hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 mt-4"
              >
                Verify Payment <CheckCircle size={16}/>
              </button>
            </form>

            <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-center gap-2 mt-6 border border-emerald-100">
              <ShieldCheck size={14} className="text-emerald-500"/>
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700">100% Safe Direct Transfer</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;