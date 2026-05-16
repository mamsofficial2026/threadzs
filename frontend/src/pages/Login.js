import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// FIX: Added ArrowLeft to the imports here 👇
import { Phone, Lock, ArrowRight, ArrowLeft, User, AlertCircle, MessageSquare } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  
  // Views: 'login', 'signup', 'forgot_request', 'forgot_verify'
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    otp: '',
    newPassword: ''
  });

  // Ensure phone number has +91
  const getFormattedPhone = () => {
    let formattedPhone = formData.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }
    return formattedPhone;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const phoneToUse = getFormattedPhone();

    try {
      if (view === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          phone: phoneToUse,
          password: formData.password,
        });
        if (signInError) throw signInError;
        navigate('/');

      } else if (view === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          phone: phoneToUse,
          password: formData.password,
          options: { data: { full_name: formData.name } }
        });
        if (signUpError) throw signUpError;
        alert("Account created successfully! You are now logged in.");
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Forgot Password: Send OTP SMS
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const phoneToUse = getFormattedPhone();

    try {
      // Sends a 6-digit OTP to the phone
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneToUse });
      if (error) throw error;
      
      setView('forgot_verify'); // Move to OTP verification screen
    } catch (err) {
      setError("Failed to send OTP. Make sure your SMS provider (Twilio) is correctly configured in Supabase.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of Forgot Password: Verify OTP and Set New Password
  const handleForgotVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const phoneToUse = getFormattedPhone();

    try {
      // 1. Verify the 6-digit OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phoneToUse,
        token: formData.otp,
        type: 'sms'
      });
      if (verifyError) throw verifyError;

      // 2. User is now authenticated, update their password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      if (updateError) throw updateError;

      alert("Password updated successfully! Please login with your new password.");
      setView('login');
      setFormData({ ...formData, password: '', otp: '', newPassword: '' });

    } catch (err) {
      setError("Invalid OTP or error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100"
      >
        <div className="text-center mb-8 text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-3xl font-black italic tracking-tighter block leading-none">THREADZS</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-orange-600">
            {view === 'forgot_request' || view === 'forgot_verify' ? 'Password Recovery' : 'Authentication'}
          </span>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">{error}</p>
          </div>
        )}

        {/* --- LOGIN & SIGNUP FORM --- */}
        {(view === 'login' || view === 'signup') && (
          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence>
              {view === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="text" placeholder="Maddy" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Phone Number</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-2 text-gray-400 pointer-events-none">
                  <Phone size={16} />
                  <span className="text-xs font-bold border-r border-gray-300 pr-2">+91</span>
                </div>
                <input required type="tel" placeholder="9876543210" maxLength="10" pattern="[0-9]{10}" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-20 pr-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Password</label>
                {view === 'login' && (
                  <button type="button" onClick={() => { setView('forgot_request'); setError(null); }} className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#ea580c] hover:bg-gray-900 text-white py-4 mt-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl disabled:bg-gray-300 flex items-center justify-center gap-2">
              {loading ? 'Processing...' : view === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD: STEP 1 (Request OTP) --- */}
        {view === 'forgot_request' && (
          <form onSubmit={handleForgotRequest} className="space-y-5">
            <p className="text-xs font-bold text-gray-500 text-center mb-6">Enter your registered mobile number to receive a 6-digit OTP for password reset.</p>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Registered Phone</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-2 text-gray-400 pointer-events-none">
                  <Phone size={16} />
                  <span className="text-xs font-bold border-r border-gray-300 pr-2">+91</span>
                </div>
                <input required type="tel" placeholder="9876543210" maxLength="10" pattern="[0-9]{10}" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-20 pr-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-orange-600 text-white py-4 mt-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl disabled:bg-gray-300 flex items-center justify-center gap-2">
              {loading ? 'Sending SMS...' : 'Send OTP'} <MessageSquare size={16} />
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD: STEP 2 (Verify OTP & New Pass) --- */}
        {view === 'forgot_verify' && (
          <form onSubmit={handleForgotVerify} className="space-y-5">
            <p className="text-xs font-bold text-gray-500 text-center mb-6">Enter the 6-digit OTP sent to +91 {formData.phone}</p>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">6-Digit OTP</label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="text" maxLength="6" placeholder="123456" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition tracking-widest" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="password" placeholder="••••••••" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:bg-white focus:border-orange-500 outline-none transition" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-gray-900 text-white py-4 mt-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl disabled:bg-gray-300 flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : 'Set New Password'} <Lock size={16} />
            </button>
          </form>
        )}

        {/* --- BOTTOM NAVIGATION LINKS --- */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          {(view === 'forgot_request' || view === 'forgot_verify') ? (
            <button onClick={() => { setView('login'); setError(null); }} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition flex items-center justify-center gap-1 w-full">
              <ArrowLeft size={12}/> Back to Login
            </button>
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {view === 'login' ? "New to THREADZS?" : "Already have an account?"}
              <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); }} className="text-orange-600 font-black ml-2 hover:underline focus:outline-none">
                {view === 'login' ? "Sign Up" : "Log In"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
