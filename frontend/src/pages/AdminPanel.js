import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Package, Tags, Plus, Edit3, Trash2, 
  X, AlertCircle, TrendingUp, DollarSign, Image as ImageIcon, 
  Upload, RefreshCw, ShoppingCart, Bell, CheckCircle, Clock, Search, Printer,
  Users, CreditCard, Box, Percent, Truck, BarChart2, Settings, ChevronRight, Mail, Phone, Award, Target, Download, Minus, Ticket, Gift, Calendar, MapPin, Navigation, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [printOrder, setPrintOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [promotions, setPromotions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [productForm, setProductForm] = useState({ name: '', price: '', category: '', image_url: '', description: '', stock: '', sizes: ['S', 'M', 'L', 'XL'] });
  const [categoryForm, setCategoryForm] = useState({ label: '', image_url: '', display_order: '' });
  const [promoForm, setPromoForm] = useState({ code: '', type: 'percentage', value: '', expiry_date: '', status: 'Active' });

  // --- NEW MULTI-IMAGE STATES ---
  const [existingUrls, setExistingUrls] = useState([]); 
  const [newFiles, setNewFiles] = useState([]); 

  // --- REAL-TIME GLOBAL SEARCH STATES ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false);

  // Global Search Filter Logic
  const searchResults = {
    products: globalSearch.length >= 2 ? products.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 4) : [],
    orders: globalSearch.length >= 2 ? orders.filter(o => o.customer_name.toLowerCase().includes(globalSearch.toLowerCase()) || o.id.toString().includes(globalSearch)).slice(0, 4) : []
  };
  const totalSearchResults = searchResults.products.length + searchResults.orders.length;

  const getSafeSizes = (sizesData) => {
    if (!sizesData) return [];
    if (Array.isArray(sizesData)) return sizesData;
    if (typeof sizesData === 'string') {
      return sizesData.replace(/[{}"[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const fetchData = async (showSyncEffect = false) => {
    if (showSyncEffect) setIsSyncing(true);
    else setLoading(true);

    try {
      const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: false }); 
      const { data: catData } = await supabase.from('brand_categories').select('*').order('id', { ascending: true }); 
      const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      const { data: promoData, error: promoError } = await supabase.from('promotions').select('*').order('id', { ascending: false });
      if (promoError) {
        setPromotions([{ id: 1, code: 'WELCOME10', type: 'percentage', value: 10, expiry_date: '2026-12-31', status: 'Active', uses: 45 }]);
      } else {
        setPromotions(promoData || []);
      }

      if (prodData) setProducts(prodData);
      if (catData) setCategories(catData);
      if (ordData) setOrders(ordData);
    } catch (err) {
      console.error("Database connection error:", err);
    }
    
    setLoading(false);
    setTimeout(() => setIsSyncing(false), 800); 
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = (e, isCategory = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isCategory) setCategoryForm({ ...categoryForm, image_url: reader.result });
      else setProductForm({ ...productForm, image_url: reader.result });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // --- NEW MULTI-IMAGE HANDLERS ---
  const handleMultiFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
  };

  const removeMultiFile = (index) => {
    if (index < existingUrls.length) {
      setExistingUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const newFileIndex = index - existingUrls.length;
      setNewFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }
  };

  const allPreviews = [
    ...existingUrls,
    ...newFiles.map(file => URL.createObjectURL(file))
  ];

  const handleSizeToggle = (size) => {
    setProductForm(prev => {
      const currentSizes = prev.sizes || [];
      const hasSize = currentSizes.includes(size);
      const updatedSizes = hasSize 
        ? currentSizes.filter(s => s !== size) 
        : [...currentSizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (existingUrls.length === 0 && newFiles.length === 0) {
      alert("Product must have at least one image!");
      return;
    }

    setUploadingImage(true);

    try {
      let uploadedUrls = [];

      // Upload new files to Supabase Storage
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Combine existing URLs with newly uploaded URLs
      const finalGallery = [...existingUrls, ...uploadedUrls];

      const payload = { 
        ...productForm, 
        price: Number(productForm.price), 
        stock: Number(productForm.stock),
        image_url: finalGallery[0], // Main cover image
        gallery_images: finalGallery // All images
      };

      if (editingItem) await supabase.from('products').update(payload).eq('id', editingItem.id);
      else await supabase.from('products').insert([payload]);
      
      setIsProductModalOpen(false); 
      setEditingItem(null); 
      setExistingUrls([]);
      setNewFiles([]);
      fetchData(true);
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving product: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product permanently?')) {
      await supabase.from('products').delete().eq('id', id); fetchData(true);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const payload = { ...categoryForm, display_order: Number(categoryForm.display_order) };
    if (editingItem) await supabase.from('brand_categories').update(payload).eq('id', editingItem.id);
    else await supabase.from('brand_categories').insert([payload]);
    setIsCategoryModalOpen(false); setEditingItem(null); fetchData(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      await supabase.from('brand_categories').delete().eq('id', id); fetchData(true);
    }
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    const payload = { ...promoForm, value: Number(promoForm.value || 0), code: promoForm.code.toUpperCase() };
    try {
      if (editingItem) await supabase.from('promotions').update(payload).eq('id', editingItem.id);
      else await supabase.from('promotions').insert([{ ...payload, uses: 0 }]);
    } catch (err) {}
    setIsPromoModalOpen(false); setEditingItem(null); fetchData(true);
  };

  const handleDeletePromo = async (id) => {
    if (window.confirm('Delete this promotion code?')) {
      try { await supabase.from('promotions').delete().eq('id', id); } catch(e){}
      fetchData(true);
    }
  };

  const handleQuickStockUpdate = async (id, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change);
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
    await supabase.from('products').update({ stock: newStock }).eq('id', id);
  };
  // 1. Add these new states near your other order states
const [orderMonthFilter, setOrderMonthFilter] = useState('all');
const [isPurging, setIsPurging] = useState(false);

// 2. New Logic to Filter Orders by Month
const filteredOrders = orders.filter(order => {
  if (orderMonthFilter === 'all') return true;
  const orderDate = new Date(order.created_at);
  const filterKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
  return filterKey === orderMonthFilter;
});

// 3. Database Purge Function (Clears orders older than 3 months)
const handlePurgeOldOrders = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const confirmPurge = window.confirm(
    `🚨 SUPABASE STORAGE WARNING: This will permanently delete all orders placed before ${threeMonthsAgo.toLocaleDateString()}. Are you sure?`
  );
const filteredOrders = orders.filter(order => {
  if (orderMonthFilter === 'all') return true;
  const orderDate = new Date(order.created_at);
  const filterKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
  return filterKey === orderMonthFilter;
});
const handlePurgeOldOrders = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const confirmPurge = window.confirm(
    `🚨 SUPABASE STORAGE WARNING: This will permanently delete all orders placed before ${threeMonthsAgo.toLocaleDateString()}. Are you sure?`
  );

  if (confirmPurge) {
    setIsPurging(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .lt('created_at', threeMonthsAgo.toISOString());

      if (error) throw error;
      
      alert("Database Optimized! Old order logs removed.");
      fetchData(true);
    } catch (err) {
      alert("Purge failed: " + err.message);
    } finally {
      setIsPurging(false);
    }
  }
};
  if (confirmPurge) {
    setIsPurging(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .lt('created_at', threeMonthsAgo.toISOString());

      if (error) throw error;
      
      alert("Database Optimized! Old order logs removed.");
      fetchData(true);
    } catch (err) {
      alert("Purge failed: " + err.message);
    } finally {
      setIsPurging(false);
    }
  }
};
  const updateOrderStatus = async (orderId, newStatus) => {
    const updatedOrders = orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order);
    setOrders(updatedOrders);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  };

  const handleRefund = (orderId) => {
    alert(`Direct UPI Payment: Please open your GPay/PhonePe app and manually refund the amount to the customer's UPI ID for Order: ${orderId}.`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  };

const printDeliverySlip = (order) => {
  const printWindow = window.open('', '_blank');
  const itemsArray = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  
  // We calculate the total paid by the customer
  const totalPaid = order.total_amount;
  
  // Since you want to hide shipping and add it to the product, 
  // if there's only 1 item, we show the total_amount as that item's price.
  // If there are multiple, we distribute the total proportionately.
  const itemCount = itemsArray.length;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>THREADZS - Packing Slip - ${order.id}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; max-width: 850px; margin: 0 auto; line-height: 1.5; }
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
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: #666; font-weight: 700; }
        .grand-total { border-top: 2px solid #111; padding-top: 15px; margin-top: 10px; font-size: 24px; font-weight: 900; font-style: italic; color: #ea580c; }
        
        .footer { margin-top: 80px; text-align: center; border-top: 1px solid #eee; padding-top: 30px; }
        .footer-text { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #ccc; }
        @media print { body { padding: 20px; } .payment-card { background: #111 !important; color: #fff !important; -webkit-print-color-adjust: exact; } }
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
          <p class="order-id">ID: #THZ-${(order.id).toString().split('-')[0]}</p>
          <div style="margin-top: 20px; font-size: 12px; font-weight: 900;">${new Date(order.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'})}</div>
        </div>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-label">Ship To</div>
          <div class="info-box">
            <div class="customer-name">${order.customer_name}</div>
            <div>${order.address}</div>
            <div style="margin-top: 8px; color: #111;">Ph: ${order.phone}</div>
          </div>
        </div>
        <div class="payment-card">
          <div class="info-label" style="color: #ea580c;">Payment Details</div>
          <div class="payment-row"><span class="payment-label">Method:</span> <span class="payment-val">Direct UPI</span></div>
          <div class="payment-row"><span class="payment-label">Status:</span> <span class="payment-val" style="color: #10b981;">VERIFIED</span></div>
          <div style="margin-top: 15px; font-size: 9px; color: #666; text-transform: uppercase;">Txn ID: ${order.payment_method.split(':').pop().trim()}</div>
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
          ${itemsArray.map((item, index) => {
            // Logic: If it's the last item, we make sure the total matches grand total exactly 
            // by putting the full remaining balance there (includes shipping hidden inside).
            const displayPrice = (index === itemCount - 1) 
              ? totalPaid 
              : (item.price * (item.quantity || item.qty || 1));

            return `
            <tr>
              <td>
                <div style="font-weight: 900; text-transform: uppercase;">${item.name}</div>
                <div style="font-size: 9px; color: #aaa; margin-top: 4px; text-transform: uppercase;">Premium Cotton Streetwear</div>
              </td>
              <td style="text-align: center; color: #111;">${item.size || '-'}</td>
              <td style="text-align: center; color: #111;">${item.quantity || item.qty || 1}</td>
              <td style="text-align: right; font-weight: 900;">₹${displayPrice}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-table">
          <div class="total-row grand-total" style="border-top: none; padding-top: 0; margin-top: 0;">
            <span style="font-size: 12px; font-style: normal; color: #999; text-transform: uppercase;">Total Paid</span>
            <span>₹${totalPaid}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">Thank you for joining the culture.</p>
        <p style="font-size: 8px; font-weight: 700; color: #ccc; margin-top: 10px;">@THREADZS_OFFICIAL</p>
      </div>
      
      <script>
        window.onload = function() { window.print(); window.close(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

  const totalSales = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalTransactions = orders.length;
  const savedFees = totalSales * 0.02; 
  
  // Replace the old line with this:
const newOrdersCount = filteredOrders.filter(o => o.status === 'New').length;
  const processingCount = filteredOrders.filter(o => o.status === 'Processing').length;
  const shippedCount = filteredOrders.filter(o => o.status === 'Shipped').length;
  const totalUnitsInStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  const getCustomerProfiles = () => {
    const customerMap = {};
    orders.forEach(order => {
      const email = order.email?.toLowerCase().trim();
      if (!email) return;
      if (!customerMap[email]) {
        customerMap[email] = { name: order.customer_name, email: email, phone: order.phone, totalOrders: 0, totalSpend: 0, lastOrderDate: order.created_at, segment: 'First-time' };
      }
      customerMap[email].totalOrders += 1;
      customerMap[email].totalSpend += Number(order.total_amount || 0);
      if (new Date(order.created_at) > new Date(customerMap[email].lastOrderDate)) customerMap[email].lastOrderDate = order.created_at;
    });
    return Object.values(customerMap).map(c => {
      if (c.totalSpend >= 5000) c.segment = 'VIP';
      else if (c.totalOrders > 1) c.segment = 'Repeat Customer';
      else c.segment = 'First-time';
      return c;
    }).sort((a, b) => b.totalSpend - a.totalSpend); 
  };
  const customerList = getCustomerProfiles();
  const avgOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;
  
  const getTopProducts = () => {
    const productSales = {};
    orders.forEach(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      items.forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = { name: item.name, qty: 0, revenue: 0 };
        const qty = item.quantity || item.qty || 1;
        productSales[item.name].qty += qty;
        productSales[item.name].revenue += (item.price * qty);
      });
    });
    return Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5); 
  };
  const topProducts = getTopProducts();
  const totalUnitsSold = topProducts.reduce((acc, curr) => acc + curr.qty, 0);

  const revenueByStatus = {
    Delivered: orders.filter(o => o.status === 'Delivered').reduce((a, b) => a + Number(b.total_amount), 0),
    Processing: orders.filter(o => ['New', 'Processing', 'Shipped'].includes(o.status)).reduce((a, b) => a + Number(b.total_amount), 0)
  };
  const deliveredPercentage = totalSales > 0 ? Math.round((revenueByStatus.Delivered / totalSales) * 100) : 0;
  const processingPercentage = totalSales > 0 ? Math.round((revenueByStatus.Processing / totalSales) * 100) : 0;

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-orange-600 bg-[#fcfaf8]">Loading Enterprise Modules...</div>;

  return (
    <div className="bg-[#f3f4f6] min-h-screen flex">
      
      <aside className="w-64 bg-gray-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-50 overflow-y-auto custom-scrollbar">
        <div className="p-8 flex justify-center border-b border-gray-800 cursor-pointer bg-black" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="THREADZS" className="h-12 object-contain invert brightness-0" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 mt-4">Core Overview</p>
          <SidebarBtn icon={<LayoutDashboard size={16}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarBtn icon={<BarChart2 size={16}/>} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          
          <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 mt-6">Sales & Customers</p>
  <div className="relative">
  <SidebarBtn 
    icon={<ShoppingCart size={16}/>} 
    label="Orders" 
    active={activeTab === 'orders'} 
    onClick={() => setActiveTab('orders')} 
  />
  {/* FIXED BADGE LOGIC */}
  {newOrdersCount > 0 && (
    <span className="absolute top-1/2 -translate-y-1/2 right-4 bg-orange-600 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900 shadow-lg animate-pulse">
      {newOrdersCount}
    </span>
  )}
</div>
          <SidebarBtn icon={<Users size={16}/>} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <SidebarBtn icon={<CreditCard size={16}/>} label="UPI Payments" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />

          <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 mt-6">Storefront</p>
          <SidebarBtn icon={<Package size={16}/>} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarBtn icon={<Tags size={16}/>} label="Categories" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <SidebarBtn icon={<Box size={16}/>} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />

          <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 mt-6">Operations</p>
          <SidebarBtn icon={<Percent size={16}/>} label="Promotions" active={activeTab === 'promotions'} onClick={() => setActiveTab('promotions')} />
          <SidebarBtn icon={<Truck size={16}/>} label="Shipping" active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} />
          <SidebarBtn icon={<Settings size={16}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* --- HEADER WITH REAL-TIME GLOBAL SEARCH --- */}
        <header className="bg-white h-16 px-8 flex items-center justify-between border-b border-gray-200 shadow-sm z-40 sticky top-0">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders, drops, customers..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setShowGlobalDropdown(true)}
              onBlur={() => setTimeout(() => setShowGlobalDropdown(false), 200)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-12 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:border-orange-500 focus:bg-white transition-all" 
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition">
                <X size={14}/>
              </button>
            )}

            {/* LIVE SEARCH DROPDOWN UI */}
            <AnimatePresence>
              {showGlobalDropdown && globalSearch.length >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                  className="absolute top-[120%] left-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50"
                >
                  {totalSearchResults > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      
                      {searchResults.orders.length > 0 && (
                        <div>
                          <p className="px-4 py-2 bg-gray-50 border-y border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">Orders & Customers</p>
                          {searchResults.orders.map(o => (
                            <div key={o.id} onClick={() => {setActiveTab('orders'); setGlobalSearch('');}} className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 flex justify-between items-center transition">
                              <div>
                                <p className="text-xs font-black text-gray-900">{o.customer_name}</p>
                                <p className="text-[9px] font-bold text-gray-500">#{o.id.toString().split('-')[0]}</p>
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${o.status === 'New' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>{o.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div>
                          <p className="px-4 py-2 bg-gray-50 border-y border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">Drops / Inventory</p>
                          {searchResults.products.map(p => (
                            <div key={p.id} onClick={() => {setActiveTab('products'); setGlobalSearch('');}} className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 flex items-center gap-3 transition">
                              <div className="w-8 h-10 bg-gray-100 rounded overflow-hidden">
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-900 truncate">{p.name}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Stock: {p.stock}</p>
                              </div>
                              <span className="text-xs font-black italic text-gray-900">₹{p.price}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      No matching records found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-orange-600 transition"><Bell size={20} />{newOrdersCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}</button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md">M</div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">

          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-6">Executive Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Sales" value={`₹${totalSales}`} icon={<DollarSign className="text-emerald-500"/>} bg="bg-emerald-50" />
                <StatCard title="Total Orders" value={orders.length} icon={<ShoppingCart className="text-blue-500"/>} bg="bg-blue-50" />
                <StatCard title="Total Units Available" value={totalUnitsInStock} icon={<Box className="text-purple-500"/>} bg="bg-purple-50" />
                <StatCard title="Stock Alerts" value={outOfStockCount + lowStockCount} icon={<AlertCircle className="text-rose-500"/>} bg="bg-rose-50" alert={(outOfStockCount + lowStockCount) > 0} />
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Shipping & Fulfillment</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage carriers, zones, and fulfillment queues</p>
                </div>
                <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                  <Download size={14}/> Export Manifest
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard title="Pending Fulfillment" value={processingCount} icon={<Box className="text-orange-500"/>} bg="bg-orange-50" alert={processingCount > 0} />
                <StatCard title="Parcels Shipped" value={shippedCount} icon={<Truck className="text-blue-500"/>} bg="bg-blue-50" />
                <StatCard title="Active Carriers" value="3" icon={<Navigation className="text-emerald-500"/>} bg="bg-emerald-50" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2"><Clock size={16} className="text-orange-500"/> Fulfillment Queue</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-700 px-2 py-1 rounded-md">{processingCount} Action Required</span>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-0">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                        <tr>
                          <th className="p-4 pl-6">Order & Destination</th>
                          <th className="p-4">Items to Pack</th>
                          <th className="p-4 text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.filter(o => o.status === 'Processing').length > 0 ? (
                          orders.filter(o => o.status === 'Processing').map(order => {
                            const itemsArray = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                            return (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                <td className="p-4 pl-6">
                                  <span className="text-xs font-black text-gray-900 block truncate w-40">#{(order.id).toString().split('-')[0]}</span>
                                  <span className="text-[10px] font-bold text-gray-500 block truncate w-48 mt-1 flex items-center gap-1"><MapPin size={10}/> {order.address.split(',')[0]}...</span>
                                </td>
                                <td className="p-4">
                                  <div className="text-[10px] font-bold text-gray-600 space-y-1">
                                    {itemsArray.map((i, idx) => (
                                      <div key={idx}>• {i.quantity || i.qty || 1}x {i.name} ({i.size})</div>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4 text-right pr-6">
                                  <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-md flex items-center gap-2 ml-auto">
                                    <Truck size={12}/> Mark Shipped
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan="3" className="p-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No orders pending fulfillment. You're all caught up!</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-100 pb-2">Carrier Integrations</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Truck size={16}/></div>
                          <span className="text-xs font-black text-gray-800">Blue Dart</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><Navigation size={16}/></div>
                          <span className="text-xs font-black text-gray-800">Delhivery</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</span>
                      </div>
                      <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-orange-500 hover:text-orange-600 transition flex items-center justify-center gap-2">
                        <Plus size={14}/> Add Carrier
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-100 pb-2">Shipping Rules</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Standard Delivery (All India)</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black italic text-gray-900">₹100.00</span>
                          <button className="text-[9px] font-black uppercase text-blue-600 hover:underline">Edit</button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Free Shipping Threshold</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black italic text-emerald-600">Over ₹2000.00</span>
                          <button className="text-[9px] font-black uppercase text-blue-600 hover:underline">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'promotions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Promotions & Discounts</h2>
                </div>
                <button onClick={() => { setIsPromoModalOpen(true); setEditingItem(null); setPromoForm({ code: '', type: 'percentage', value: '', expiry_date: '', status: 'Active' }); }} className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-gray-900 transition flex items-center gap-2 shadow-lg">
                  <Plus size={14}/> Create Campaign
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard title="Active Campaigns" value={promotions.filter(p => p.status === 'Active').length} icon={<Ticket className="text-blue-500"/>} bg="bg-blue-50" />
                <StatCard title="Total Codes Redeemed" value={promotions.reduce((acc, curr) => acc + (curr.uses || 0), 0)} icon={<Gift className="text-purple-500"/>} bg="bg-purple-50" />
                <StatCard title="Scheduled/Paused" value={promotions.filter(p => p.status !== 'Active').length} icon={<Calendar className="text-orange-500"/>} bg="bg-orange-50" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr><th className="p-4 pl-6">Coupon Code</th><th className="p-4">Discount Value</th><th className="p-4">Performance</th><th className="p-4">Status & Expiry</th><th className="p-4 text-right pr-6">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {promotions.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pl-6"><span className="text-sm font-black text-gray-900 block uppercase tracking-widest">{promo.code}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: #{promo.id}</span></td>
                        <td className="p-4"><span className="text-sm font-black italic text-emerald-600 block">{promo.type === 'percentage' ? `${promo.value}% OFF` : promo.type === 'fixed' ? `₹${promo.value} OFF` : 'Free Shipping'}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{promo.type.replace('_', ' ')}</span></td>
                        <td className="p-4"><span className="text-xs font-black text-gray-900 block">{promo.uses || 0} Uses</span></td>
                        <td className="p-4"><span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-1 ${promo.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{promo.status}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block flex items-center gap-1"><Clock size={10}/> Exp: {promo.expiry_date || 'No Expiry'}</span></td>
                        <td className="p-4 text-right pr-6"><div className="flex justify-end gap-2"><button onClick={() => { setEditingItem(promo); setPromoForm(promo); setIsPromoModalOpen(true); }} className="p-2 bg-gray-100 text-blue-600 rounded-md hover:bg-blue-50 transition"><Edit3 size={12}/></button><button onClick={() => handleDeletePromo(promo.id)} className="p-2 bg-gray-100 text-rose-600 rounded-md hover:bg-rose-50 transition"><Trash2 size={12}/></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Inventory & Stock</h2></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total SKUs" value={products.length} icon={<Package className="text-blue-500"/>} bg="bg-blue-50" />
                <StatCard title="Total Units Available" value={totalUnitsInStock} icon={<Box className="text-purple-500"/>} bg="bg-purple-50" />
                <StatCard title="Low Stock Alerts" value={lowStockCount} icon={<AlertCircle className="text-orange-500"/>} bg="bg-orange-50" alert={lowStockCount > 0} />
                <StatCard title="Out of Stock" value={outOfStockCount} icon={<AlertCircle className="text-rose-500"/>} bg="bg-rose-50" alert={outOfStockCount > 0} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr><th className="p-4 pl-6">Product Details</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4 text-right pr-6">Stock Adjustment</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pl-6 flex items-center gap-4"><div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"><img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /></div><div><span className="text-xs font-black text-gray-900 block uppercase">{product.name}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{product.price}</span></div></td>
                        <td className="p-4"><span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{product.category}</span></td>
                        <td className="p-4">{product.stock <= 0 ? <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1 bg-rose-100 text-rose-700"><AlertCircle size={10}/> Out of Stock</span> : product.stock <= 5 ? <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1 bg-orange-100 text-orange-700"><AlertCircle size={10}/> Low Stock</span> : <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1 bg-emerald-100 text-emerald-700"><CheckCircle size={10}/> In Stock</span>}</td>
                        <td className="p-4 text-right pr-6"><div className="flex items-center justify-end gap-3"><div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm"><button onClick={() => handleQuickStockUpdate(product.id, product.stock, -1)} disabled={product.stock <= 0} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition disabled:opacity-50"><Minus size={14} /></button><div className="w-12 text-center text-xs font-black text-gray-900">{product.stock}</div><button onClick={() => handleQuickStockUpdate(product.id, product.stock, 1)} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"><Plus size={14} /></button></div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">UPI Payment Logs</h2></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard title="Total Revenue (100% Net)" value={`₹${totalSales}`} icon={<TrendingUp className="text-emerald-500"/>} bg="bg-emerald-50" />
                <StatCard title="Total Transactions" value={totalTransactions} icon={<CheckCircle className="text-blue-500"/>} bg="bg-blue-50" />
                <StatCard title="Gateway Fees Avoided" value={`+ ₹${Math.round(savedFees)}`} icon={<DollarSign className="text-orange-500"/>} bg="bg-orange-50" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr><th className="p-4 pl-6">Date</th><th className="p-4">Transaction Ref</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right pr-6">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pl-6"><span className="text-[10px] font-bold text-gray-600">{formatDateTime(order.created_at)}</span></td>
                        <td className="p-4"><span className="text-xs font-black text-gray-900 block truncate w-40">{order.payment_method}</span></td>
                        <td className="p-4"><span className="text-xs font-black text-gray-900 block">{order.customer_name}</span></td>
                        <td className="p-4"><span className="text-sm font-black italic text-gray-900 block">₹{order.total_amount}</span></td>
                        <td className="p-4"><span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Verified</span></td>
                        <td className="p-4 text-right pr-6"><button onClick={() => handleRefund(order.id)} className="text-[9px] font-black uppercase border border-gray-200 px-3 py-1 rounded-md hover:bg-rose-50 hover:text-rose-600">Refund</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Store Analytics</h2></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Gross Merchandise" value={`₹${totalSales}`} icon={<BarChart2 className="text-blue-500"/>} bg="bg-blue-50" />
                <StatCard title="Avg Order Value" value={`₹${avgOrderValue}`} icon={<Target className="text-purple-500"/>} bg="bg-purple-50" />
                <StatCard title="Total Orders" value={orders.length} icon={<ShoppingCart className="text-emerald-500"/>} bg="bg-emerald-50" />
                <StatCard title="Total Units Sold" value={totalUnitsSold} icon={<Box className="text-orange-500"/>} bg="bg-orange-50" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2"><Award size={16} className="text-orange-500"/> Top Performing Drops</h3>
                  <div className="space-y-4">
                    {topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4"><span className="text-sm font-black text-gray-300 w-4">{idx + 1}</span><div><p className="text-xs font-black text-gray-900">{product.name}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.qty} units sold</p></div></div>
                        <span className="text-sm font-black italic text-gray-900">₹{product.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Revenue Pipeline</h3>
                  <div className="mb-6"><div className="flex justify-between items-end mb-2"><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Realized (Delivered)</p><p className="text-lg font-black italic text-gray-900">₹{revenueByStatus.Delivered}</p></div><span className="text-xs font-black text-gray-400">{deliveredPercentage}%</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${deliveredPercentage}%` }}></div></div></div>
                  <div><div className="flex justify-between items-end mb-2"><div><p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Pipeline (Processing)</p><p className="text-lg font-black italic text-gray-900">₹{revenueByStatus.Processing}</p></div><span className="text-xs font-black text-gray-400">{processingPercentage}%</span></div><div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: `${processingPercentage}%` }}></div></div></div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Customer Profiles & CRM</h2></div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr><th className="p-4 pl-6">Customer Info</th><th className="p-4">Contact Details</th><th className="p-4">Orders</th><th className="p-4">Lifetime Spend</th><th className="p-4 text-right pr-6">Segment</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerList.map((customer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pl-6 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs uppercase">{customer.name.charAt(0)}</div><div><span className="text-xs font-black text-gray-900 block">{customer.name}</span></div></td>
                        <td className="p-4"><span className="text-[10px] font-bold text-gray-600 block">{customer.email}</span></td>
                        <td className="p-4"><span className="text-xs font-black text-gray-900">{customer.totalOrders}</span></td>
                        <td className="p-4"><span className="text-sm font-black italic text-gray-900">₹{customer.totalSpend}</span></td>
                        <td className="p-4 text-right pr-6"><span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${customer.segment === 'VIP' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{customer.segment}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

         {activeTab === 'orders' && (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Order Management</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total {orders.length} orders in database</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* MONTHLY FILTER */}
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select 
            value={orderMonthFilter}
            onChange={(e) => setOrderMonthFilter(e.target.value)}
            className="bg-white border border-gray-200 pl-9 pr-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-orange-500 shadow-sm appearance-none"
          >
            <option value="all">All Time</option>
            {/* Generates last 6 months dynamically */}
            {[...Array(6)].map((_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
              return <option key={val} value={val}>{label}</option>;
            })}
          </select>
        </div>

        {/* REFRESH */}
        <button onClick={() => fetchData(true)} className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm">
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
        </button>

        {/* BULK PURGE BUTTON (Supabase Free Tier Helper) */}
        <button 
          onClick={handlePurgeOldOrders}
          disabled={isPurging}
          className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition flex items-center gap-2 shadow-sm"
        >
          <Trash2 size={14}/> {isPurging ? 'Clearing...' : 'Purge >3 Months'}
        </button>
      </div>
    </div>

    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <tr>
            <th className="p-6">Order Details</th>
            <th className="p-6">Customer</th>
            <th className="p-6">Amount</th>
            <th className="p-6">Status</th>
            <th className="p-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => {
             // ... keep your existing table row mapping logic here (const itemsArray = ...)
          }) : (
            <tr>
              <td colSpan="5" className="p-20 text-center">
                <div className="text-gray-300 mb-2"><Package size={48} className="mx-auto opacity-20"/></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">No orders found for this period</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </motion.div>
)}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div><h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Product Management</h2></div>
                <button onClick={() => { 
                  setIsProductModalOpen(true); 
                  setEditingItem(null); 
                  setProductForm({ name: '', price: '', category: categories[0]?.label || '', description: '', stock: '', sizes: ['S', 'M', 'L', 'XL'] }); 
                  setExistingUrls([]);
                  setNewFiles([]);
                }} className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-gray-900 transition flex items-center gap-2 shadow-lg"><Plus size={14}/> Add Drop</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col group">
                    <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <span className={`absolute top-2 left-2 text-[8px] font-black px-2 py-1 rounded-full uppercase shadow-sm ${p.stock > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'}`}>{p.stock > 0 ? p.stock : 'Out'}</span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-xs font-bold text-gray-800 uppercase mb-1 truncate">{p.name}</h3>
                      <span className="text-sm font-black text-gray-900 italic mb-3">₹{p.price}</span>
                      
                      <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                        {getSafeSizes(p.sizes).map(s => <span key={s} className="text-[8px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>)}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { 
                          setEditingItem(p); 
                          setProductForm({...p, sizes: getSafeSizes(p.sizes)}); 
                          const imgs = p.gallery_images && p.gallery_images.length > 0 ? p.gallery_images : [p.image_url];
                          setExistingUrls(imgs.filter(Boolean));
                          setNewFiles([]);
                          setIsProductModalOpen(true); 
                        }} className="py-2 bg-gray-100 text-gray-800 rounded-lg text-[9px] font-black uppercase transition hover:bg-blue-50 hover:text-blue-600"><Edit3 size={12} className="mx-auto"/></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="py-2 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase transition hover:bg-rose-600 hover:text-white"><Trash2 size={12} className="mx-auto"/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Categories</h2>
                <button onClick={() => { setIsCategoryModalOpen(true); setEditingItem(null); setCategoryForm({ label: '', image_url: '', display_order: categories.length + 1 }); }} className="bg-orange-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg"><Plus size={14} className="inline mr-1"/> Create</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center relative group bg-white shadow-sm">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-50 mb-3"><img src={c.image_url} className="w-full h-full object-cover"/></div>
                    <h3 className="text-xs font-black uppercase text-gray-900">{c.label}</h3>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem(c); setCategoryForm(c); setIsCategoryModalOpen(true); }} className="p-1.5 bg-gray-100 text-blue-600 rounded-md"><Edit3 size={10}/></button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 bg-gray-100 text-rose-600 rounded-md"><Trash2 size={10}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Settings & Admin</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configure store preferences, staff roles, and security</p>
                </div>
                <button onClick={() => alert("Settings Saved Successfully!")} className="bg-orange-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-gray-900 transition flex items-center shadow-lg">
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><Settings size={14}/> Store Information</h3>
                  <div className="space-y-5">
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Store Name</label><input type="text" defaultValue="THREADZS" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold outline-none transition-colors" /></div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Support Email</label><input type="email" defaultValue="support@threadzs.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold outline-none transition-colors" /></div>
                    <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Business Address</label><textarea defaultValue="12, South Masi Street, Madurai, TN - 625001" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold outline-none transition-colors min-h-[80px]" /></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><DollarSign size={14}/> Regional & Tax</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Store Currency</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold outline-none transition-colors">
                        <option>INR (₹) - Indian Rupee</option>
                        <option>USD ($) - US Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Timezone</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold outline-none transition-colors">
                        <option>Asia/Kolkata (IST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Tax Settings (GST)</label>
                      <input type="text" defaultValue="18% Standard Apparel Tax" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><Users size={14}/> Staff & Permissions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-black text-gray-900">Maddy (You)</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">maddy@threadzs.com</p>
                      </div>
                      <span className="bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">Super Admin</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-black text-gray-900">Sherin</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">sherin@threadzs.com</p>
                      </div>
                      <select className="text-[9px] font-black uppercase tracking-widest bg-transparent border-b border-gray-300 outline-none text-gray-700 cursor-pointer">
                        <option>Support</option>
                        <option>Fulfillment</option>
                        <option>Manager</option>
                      </select>
                    </div>
                    <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-orange-500 hover:text-orange-600 transition flex items-center justify-center gap-2">
                      <Plus size={14}/> Invite Staff Member
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><ShieldCheck size={14}/> Security & Integrations</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Two-Factor Auth (2FA)</p>
                        <p className="text-[9px] font-bold text-gray-500 mt-1">Require 2FA for all staff accounts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-600 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Direct UPI Mode</p>
                        <p className="text-[9px] font-bold text-gray-500 mt-1">Accept 0% fee payments</p>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Shiprocket API</p>
                        <p className="text-[9px] font-bold text-gray-500 mt-1">Automate AWB & Tracking</p>
                      </div>
                      <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Connect API</button>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button className="text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-900 flex items-center gap-1 transition">
                        <Download size={12}/> Download Activity Audit Log
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </main>
      </div>

      <AnimatePresence>
        {isPromoModalOpen && (
          <ModalOverlay close={() => setIsPromoModalOpen(false)} title={editingItem ? "Edit Campaign" : "New Promo Code"}>
            <form onSubmit={handleSavePromo} className="space-y-4">
              <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Coupon Code</label><input required type="text" placeholder="e.g., THREADZS10" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-black tracking-widest uppercase" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Discount Type</label><select required value={promoForm.type} onChange={e => setPromoForm({...promoForm, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option><option value="free_shipping">Free Shipping</option></select></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Value</label><input required={promoForm.type !== 'free_shipping'} disabled={promoForm.type === 'free_shipping'} type="number" placeholder={promoForm.type === 'percentage' ? '% Off' : '₹ Off'} value={promoForm.value} onChange={e => setPromoForm({...promoForm, value: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold disabled:opacity-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Expiry Date</label><input type="date" value={promoForm.expiry_date} onChange={e => setPromoForm({...promoForm, expiry_date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold text-gray-600" /></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Status</label><select required value={promoForm.status} onChange={e => setPromoForm({...promoForm, status: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold"><option value="Active">Active</option><option value="Paused">Paused</option></select></div>
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white py-3 mt-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition shadow-lg">Save Campaign</button>
            </form>
          </ModalOverlay>
        )}
        
        {isProductModalOpen && (
          <ModalOverlay close={() => setIsProductModalOpen(false)} title={editingItem ? "Edit Drop" : "New Drop"}>
             <form onSubmit={handleSaveProduct} className="space-y-4">
              <input required type="text" placeholder="Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-orange-500 font-bold" />
              
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold" />
                <input required type="number" placeholder="Stock" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold" />
              </div>
              
              <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold">
                <option value="" disabled>Select Category</option>{categories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
              </select>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-3 flex items-center gap-2">
                  Available Sizes <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px]">REQUIRED</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL', 'FREE SIZE'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        (productForm.sizes || []).includes(size)
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-white text-gray-400 border border-gray-200 hover:border-orange-400 hover:text-orange-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {(!productForm.sizes || productForm.sizes.length === 0) && (
                  <p className="text-[9px] text-rose-500 mt-2 font-bold uppercase tracking-widest">Please select at least one size.</p>
                )}
              </div>

              {/* --- NEW MULTI-IMAGE UPLOAD SECTION --- */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Product Images (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-3">
                  {allPreviews.map((url, index) => (
                    <div key={index} className="relative w-16 h-20 rounded-lg overflow-hidden shadow-sm border border-gray-200 group bg-white">
                      <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeMultiFile(index)}
                        className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X size={10} />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-orange-600 text-white text-[7px] font-black text-center py-0.5 uppercase tracking-widest">
                          Main
                        </div>
                      )}
                    </div>
                  ))}

                  <label className="w-16 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors bg-white">
                    <input type="file" multiple accept="image/*" onChange={handleMultiFileSelect} className="hidden" />
                    <Plus size={16} className="text-gray-400 mb-1" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-gray-400 text-center px-1">Add Photos</span>
                  </label>
                </div>
              </div>
              
              <textarea required placeholder="Description (HTML Supported)" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold min-h-[80px]" />
              
              <button type="submit" disabled={!productForm.sizes || productForm.sizes.length === 0 || uploadingImage} className="w-full bg-gray-900 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-orange-600 transition disabled:bg-gray-400">
                {uploadingImage ? 'Uploading & Saving...' : 'Save Product'}
              </button>
            </form>
          </ModalOverlay>
        )}

        {isCategoryModalOpen && (
          <ModalOverlay close={() => setIsCategoryModalOpen(false)} title={editingItem ? "Edit Category" : "New Category"}>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <input required type="text" placeholder="Category Label" value={categoryForm.label} onChange={e => setCategoryForm({...categoryForm, label: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold" />
              <input required type="number" placeholder="Display Order" value={categoryForm.display_order} onChange={e => setCategoryForm({...categoryForm, display_order: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 font-bold" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="w-full text-xs" />
              <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-orange-600 transition">Save Category</button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition font-bold text-[11px] uppercase tracking-widest ${active ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, icon, bg, alert }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
    <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p><p className={`text-xl font-black italic ${alert ? 'text-rose-600' : 'text-gray-900'}`}>{value}</p></div>
  </div>
);

const ModalOverlay = ({ children, close, title }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-100"><h3 className="text-sm font-black uppercase tracking-tight text-gray-900">{title}</h3><button onClick={close} className="p-1.5 text-gray-400 hover:text-rose-500 bg-gray-50 rounded-full"><X size={14}/></button></div>
      <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">{children}</div>
    </motion.div>
  </motion.div>
);

export default AdminPanel;