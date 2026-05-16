import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import DeliverySlip from '../components/DeliverySlip';

const AdminDashboard = () => {
  const [product, setProduct] = useState({
    name: '', price: '', image_url: '', description: '', variety: '', colors: '', stock: 0
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('products')
      .insert([product]);

    if (!error) {
      alert("New Drop Live! 🚀");
      setProduct({ name: '', price: '', image_url: '', description: '', variety: '', colors: '', stock: 0 });
    } else {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-black uppercase italic mb-8">Admin <span className="text-Threadzs-orange">Control</span></h1>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Add New Product</h2>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required className="admin-input" placeholder="Product Name" onChange={e => setProduct({...product, name: e.target.value})} />
            <input required className="admin-input" placeholder="Price (₹)" type="number" onChange={e => setProduct({...product, price: e.target.value})} />
            <input required className="admin-input" placeholder="Image URL" onChange={e => setProduct({...product, image_url: e.target.value})} />
            <input className="admin-input" placeholder="Variety (e.g. Oversized)" onChange={e => setProduct({...product, variety: e.target.value})} />
            <input className="admin-input" placeholder="Colors (e.g. Orange, Black)" onChange={e => setProduct({...product, colors: e.target.value})} />
            <input className="admin-input" placeholder="Initial Stock" type="number" onChange={e => setProduct({...product, stock: e.target.value})} />
            <textarea className="md:col-span-2 admin-input" placeholder="Description" rows="4" onChange={e => setProduct({...product, description: e.target.value})} />
            
            <button className="md:col-span-2 bg-mams-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-mams-orange transition shadow-lg">
              Launch Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;