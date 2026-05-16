import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, selectedSize) => {
    // Check if the exact t-shirt with that size is already in cart
    const existingItem = cart.find(item => item.id === product.id && item.size === selectedSize);
    
    if (existingItem) {
      setCart(cart.map(item => 
        (item.id === product.id && item.size === selectedSize) 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
      ));
    } else {
      setCart([...cart, { ...product, size: selectedSize, quantity: 1 }]);
    }
  };

 const removeFromCart = (productId, size) => {
  setCart(prevCart => {
    // 1. Find the item we want to decrease
    const existingItem = prevCart.find(item => item.id === productId && item.size === size);

    // 2. If quantity is more than 1, just subtract 1
    if (existingItem && existingItem.quantity > 1) {
      return prevCart.map(item =>
        (item.id === productId && item.size === size)
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    }

    // 3. If quantity is 1, remove the whole row
    return prevCart.filter(item => !(item.id === productId && item.size === size));
  });
};

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);