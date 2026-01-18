import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
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
      });
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
    return <div className="container"><div className="loading">Loading cart...</div></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart</p>
          <Link to="/books" className="btn btn-primary mt-20">Browse Books</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p className="text-muted">{cart.totalItems} items in your cart</p>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Cart Items */}
        <div>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.bookTitle}</strong>
                      <br />
                      <small className="text-muted">by {item.bookAuthor}</small>
                    </td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ width: '70px' }}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.bookId, e.target.value)}
                      >
                        {[...Array(Math.min(item.availableStock, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </td>
                    <td>${item.lineTotal.toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(item.bookId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card">
            <h3 className="card-title">Order Summary</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <div className="flex flex-between">
                <span>Subtotal:</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-between">
                <span>Tax (8%):</span>
                <span>${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex flex-between">
                <span>Shipping:</span>
                <span>
                  {cart.estimatedShipping > 0 
                    ? `$${cart.estimatedShipping.toFixed(2)}` 
                    : 'FREE'}
                </span>
              </div>
              {cart.subtotal < 50 && (
                <small className="text-muted">
                  Free shipping on orders over $50
                </small>
              )}
            </div>
            
            <hr />
            
            <div className="flex flex-between" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>${cart.estimatedTotal.toFixed(2)}</span>
            </div>

            <hr />

            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label>Shipping Address *</label>
                <textarea
                  className="form-control"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Order Notes (optional)</label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                />
              </div>

              <div className="alert alert-info">
                <strong>Payment Method:</strong> Cash on Delivery (COD)
                <br />
                <small>Payment will be collected when your order is delivered.</small>
              </div>

              {checkoutError && (
                <div className="alert alert-error">{checkoutError}</div>
              )}

              <button 
                type="submit" 
                className="btn btn-success" 
                style={{ width: '100%' }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
