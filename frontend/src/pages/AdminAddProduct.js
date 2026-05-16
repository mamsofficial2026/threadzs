import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Upload, X, Plus } from 'lucide-react';

const AdminAddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((files) => files.filter((_, index) => index !== indexToRemove));
    setPreviewUrls((urls) => urls.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert("Please select at least one image!");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const uploadedImageUrls = [];

      for (const file of selectedFiles) {
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

        uploadedImageUrls.push(publicUrlData.publicUrl);
      }

      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            stock: parseInt(formData.stock),
            description: formData.description,
            image_url: uploadedImageUrls[0], 
            gallery_images: uploadedImageUrls 
          }
        ]);

      if (dbError) throw dbError;

      setSuccess(true);
      setFormData({ name: '', price: '', category: '', stock: '', description: '' });
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Error adding product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white shadow-xl rounded-[2rem] my-10 border border-gray-100 font-sans">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-8 border-l-4 border-orange-600 pl-4">
        Add New Drop
      </h2>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center">
          Product Added Successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
            Product Images (Select Multiple)
          </label>
          
          <div className="flex flex-wrap gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-32 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-orange-600 text-white text-[8px] font-black text-center py-1 uppercase tracking-widest">
                    Main Image
                  </div>
                )}
              </div>
            ))}

            <label className="w-24 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              <Plus size={24} className="text-gray-400 mb-2" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center px-2">Add Photos</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Product Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Category</label>
            <input required type="text" placeholder="e.g. Crew Neck" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Price (₹)</label>
            <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Stock Quantity</label>
            <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
            Description (Supports HTML like &lt;br&gt; or &lt;ul&gt;)
          </label>
          <textarea required rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-orange-600 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl disabled:bg-gray-300 flex items-center justify-center gap-2">
          {loading ? 'Uploading Images & Saving...' : 'Publish Product'} <Upload size={16} />
        </button>

      </form>
    </div>
  );
};

export default AdminAddProduct;