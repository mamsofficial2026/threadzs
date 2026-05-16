import React, { useState } from 'react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in as Admin:", email);
    // Logic for Supabase Auth goes here later
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Threadzs-dark p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-Threadzs-orange">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-Threadzs-orange rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">M</div>
          <h2 className="text-3xl font-black text-Threadzs-dark uppercase">Admin Access</h2>
          <p className="text-gray-500 font-medium">Authorized personnel only</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Admin Email</label>
            <input 
              type="email" 
              className="w-full p-4 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-Threadzs-orange transition"
              placeholder="admin@threadzs.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-Threadzs-orange transition"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-Threadzs-orange text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition shadow-lg">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;