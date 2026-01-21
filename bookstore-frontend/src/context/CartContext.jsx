import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isCustomer } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated() || !isCustomer()) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated()]);

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const response = await cartAPI.addItem(bookId, quantity);
      setCart(response.data.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    try {
      const response = await cartAPI.updateQuantity(bookId, quantity);
      setCart(response.data.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      const response = await cartAPI.removeItem(bookId);
      setCart(response.data.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
    } catch (error) {
      // Cart may already be cleared (e.g., after checkout), that's okay
      console.log('Cart clear API call failed, cart may already be empty');
    }
    // Always reset local state
    setCart({ items: [], totalItems: 0, subtotal: 0, estimatedTax: 0, estimatedShipping: 0, estimatedTotal: 0 });
  };

  // Reset cart state locally without API call (used after checkout)
  const resetCart = () => {
    setCart({ items: [], totalItems: 0, subtotal: 0, estimatedTax: 0, estimatedShipping: 0, estimatedTotal: 0 });
  };

  const cartItemCount = cart?.totalItems || 0;

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    resetCart,
    cartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}