import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Book colors for mini book display
const bookColors = [
  'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
  'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
  'linear-gradient(135deg, #166534 0%, #14532d 100%)',
  'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)',
  'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
  'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
  'linear-gradient(135deg, #3730a3 0%, #312e81 100%)',
  'linear-gradient(135deg, #9f1239 0%, #881337 100%)',
];

function MiniBook({ title, index }) {
  const color = bookColors[index % bookColors.length];
  return (
    <div style={{
      width: '45px',
      height: '60px',
      background: color,
      borderRadius: '0 4px 4px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      flexShrink: 0
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '8px',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '0'
      }}></div>
    </div>
  );
}

function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, resetCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState(user?.shippingAddress || '');
  const [notes, setNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleQuantityChange = async (bookId, newQuantity) => {
    try {
      await updateQuantity(bookId, parseInt(newQuantity));
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await removeFromCart(bookId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!shippingAddress.trim()) {
      setCheckoutError('Please enter a shipping address');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const response = await ordersAPI.checkout({
        shippingAddress,
        notes,
        paymentMethod: 'CASH_ON_DELIVERY',
      });
      
      resetCart();
      
      navigate('/orders', { 
        state: { message: 'Order placed successfully! Payment will be collected on delivery.' }
      });
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '30px' }}>
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
        <div className="empty-state">
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart</p>
          <Link to="/books" className="btn btn-primary mt-20">Browse Books</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p className="text-muted">{cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="cart-grid">
        {/* Cart Items */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {cart.items.map((item, index) => (
              <div 
                key={item.id}
                className="cart-item"
                style={{
                  borderBottom: index < cart.items.length - 1 ? '1px solid var(--gray-100)' : 'none'
                }}
              >
                {/* Mini Book Visual */}
                <div className="mini-book">
                  <MiniBook title={item.bookTitle} index={index} />
                </div>
                
                {/* Book Info */}
                <div className="cart-item-info">
                  <Link 
                    to={`/books/${item.bookId}`}
                    style={{ 
                      fontFamily: "'Merriweather', Georgia, serif",
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      color: 'var(--primary-800)',
                      display: 'block',
                      marginBottom: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    {item.bookTitle}
                  </Link>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    by {item.bookAuthor}
                  </span>
                  <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: '4px' }} className="cart-item-mobile-price">
                    ${item.price.toFixed(2)} each
                  </div>
                </div>

                {/* Price - Hidden on mobile */}
                <div className="cart-item-price">
                  <div style={{ 
                    fontWeight: '600', 
                    color: 'var(--gray-800)',
                    fontSize: '0.9rem',
                    marginBottom: '2px'
                  }}>
                    ${item.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                    each
                  </div>
                </div>

                {/* Quantity */}
                <div className="cart-item-quantity">
                  <select
                    className="form-control"
                    style={{ 
                      width: '75px', 
                      padding: '8px 12px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.bookId, e.target.value)}
                  >
                    {[...Array(Math.min(item.availableStock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                {/* Line Total */}
                <div className="cart-item-total">
                  ${item.lineTotal.toFixed(2)}
                </div>

                {/* Remove Button */}
                <button 
                  className="btn btn-sm cart-item-remove"
                  onClick={() => handleRemove(item.bookId)}
                  style={{
                    background: 'transparent',
                    color: 'var(--gray-400)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--danger-100)';
                    e.currentTarget.style.color = 'var(--danger-500)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--gray-400)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <Link to="/books" className="btn btn-secondary mt-20" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card cart-summary">
            <h3 style={{ 
              fontFamily: "'Merriweather', Georgia, serif",
              fontSize: '1.25rem',
              marginBottom: '20px',
              color: 'var(--primary-800)'
            }}>
              Order Summary
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
                <span style={{ fontWeight: '600' }}>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--gray-600)' }}>Tax (8%)</span>
                <span style={{ fontWeight: '600' }}>${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--gray-600)' }}>Shipping</span>
                <span style={{ fontWeight: '600', color: cart.estimatedShipping > 0 ? 'inherit' : 'var(--success-600)' }}>
                  {cart.estimatedShipping > 0 
                    ? `$${cart.estimatedShipping.toFixed(2)}` 
                    : 'FREE'}
                </span>
              </div>
              {cart.subtotal < 50 && (
                <div style={{ 
                  background: 'var(--gray-50)', 
                  padding: '10px 12px', 
                  borderRadius: '8px',
                  marginTop: '10px'
                }}>
                  <small style={{ color: 'var(--gray-500)' }}>
                    Add ${(50 - cart.subtotal).toFixed(2)} more for free shipping
                  </small>
                </div>
              )}
            </div>
            
            <div style={{ 
              borderTop: '2px solid var(--gray-100)', 
              paddingTop: '15px',
              marginBottom: '25px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-800)' }}>Total</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: 'var(--success-600)',
                  fontFamily: "'Merriweather', Georgia, serif"
                }}>
                  ${cart.estimatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Shipping Address *</label>
                <textarea
                  className="form-control"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows="3"
                  placeholder="Enter your full shipping address"
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label>Order Notes (optional)</label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="Any special instructions"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Payment Method */}
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--success-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    💵
                  </div>
                  <div>
                    <strong style={{ color: 'var(--gray-800)', fontSize: '0.95rem' }}>
                      Cash on Delivery
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      Pay when your order arrives
                    </p>
                  </div>
                </div>
              </div>

              {checkoutError && (
                <div className="alert alert-error" style={{ marginBottom: '15px' }}>
                  {checkoutError}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%' }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
