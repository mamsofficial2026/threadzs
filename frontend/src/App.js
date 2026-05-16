import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ReactLenis } from '@studio-freight/react-lenis';

// Page Imports
import Home from './Home';
import AdminAddProduct from './pages/AdminAddProduct';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import CategoryPage from './pages/CategoryPage';
import Checkout from './pages/Checkout'; 
import Payment from './pages/Payment';
import About from './pages/About';
import Contact from './pages/Contact'; // <-- Ensure About is imported if you added it!
import Policies from './pages/Policies';

// Component Imports
import Footer from './components/Footer';
import Header from './components/Header'; // <-- 1. Import the new header.

// --- CONDITIONAL HEADER LOGIC ---
const ConditionalHeader = () => {
  const location = useLocation();
  // Added '/thz-admin-vault' to prevent layout leakage inside the panel
  const hideRoutes = ['/admin-portal', '/admin/add-product', '/login', '/thz-admin-vault'];
  if (hideRoutes.some(route => location.pathname.startsWith(route))) return null;
  return <Header />;
};

// --- CONDITIONAL FOOTER LOGIC ---
const ConditionalFooter = () => {
  const location = useLocation();
  // Added '/thz-admin-vault' here as well
  const hideRoutes = ['/admin-portal', '/admin/add-product', '/login', '/thz-admin-vault'];
  if (hideRoutes.some(route => location.pathname.startsWith(route))) return null;
  return <Footer />; 
};

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 0.8, smoothTouch: true }}>
      <Router>
        
        {/* <-- 2. ADDED CONDITIONAL HEADER HERE --> */}
        <ConditionalHeader />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} /> {/* Add Contact route similarly later */}
          <Route path="/admin/add-product" element={<AdminAddProduct />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-portal" element={<AdminPanel />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/bag" element={<Cart />} />
          <Route path="/category/:name" element={<CategoryPage />} /> 
          <Route path="/checkout" element={<Checkout />} /> 
          <Route path="/payment" element={<Payment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies" element={<Policies />} />
          
          {/* 🔐 THE HIDDEN LIVE SEPARATE ADMIN GATEWAY */}
          <Route path="/thz-admin-vault" element={<AdminPanel />} />
        </Routes>

        {/* <-- CONDITIONAL FOOTER --> */}
        <ConditionalFooter />

      </Router>
    </ReactLenis>
  );
}

export default App;