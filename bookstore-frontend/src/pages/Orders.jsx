import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.data);
    } catch (err) {
      setError('Error loading orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await ordersAPI.cancel(orderId);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling order');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge badge-warning',
      PROCESSING: 'badge badge-info',
      SHIPPED: 'badge badge-info',
      DELIVERED: 'badge badge-success',
      CANCELLED: 'badge badge-danger',
    };
    return badges[status] || 'badge';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading orders...</div></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Orders</h1>
        <p className="text-muted">View your order history and track deliveries</p>
      </div>

      {location.state?.message && (
        <div className="alert alert-success">{location.state.message}</div>
      )}
      
      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Start shopping to place your first order</p>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex flex-between flex-center">
                <div>
                  <h3 className="card-title" style={{ marginBottom: '5px' }}>
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-muted" style={{ margin: 0 }}>
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={getStatusBadge(order.status)}>{order.status}</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <hr />

              <div className="flex flex-between flex-center">
                <div>
                  <p style={{ margin: '0 0 5px 0' }}>
                    <strong>Items:</strong> {order.items?.length || 0}
                  </p>
                  {order.trackingNumber && (
                    <p style={{ margin: 0 }}>
                      <strong>Tracking:</strong> {order.trackingNumber}
                    </p>
                  )}
                </div>
                <div className="flex gap-10">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                  </button>
                  {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-20" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
                  <h4>Order Items</h4>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.bookTitle}</strong>
                            <br />
                            <small className="text-muted">by {item.bookAuthor}</small>
                          </td>
                          <td>${item.priceAtPurchase.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>${item.lineTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid grid-2 mt-10">
                    <div>
                      <h4>Shipping Address</h4>
                      <p>{order.shippingAddress}</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}</p>
                      <p><strong>Tax:</strong> ${order.tax.toFixed(2)}</p>
                      <p><strong>Shipping:</strong> ${order.shippingCost.toFixed(2)}</p>
                      <p style={{ fontSize: '1.1rem' }}><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {order.shippedAt && (
                    <p className="mt-10"><strong>Shipped:</strong> {formatDate(order.shippedAt)}</p>
                  )}
                  {order.deliveredAt && (
                    <p><strong>Delivered:</strong> {formatDate(order.deliveredAt)}</p>
                  )}
                  {order.notes && (
                    <p><strong>Notes:</strong> {order.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
