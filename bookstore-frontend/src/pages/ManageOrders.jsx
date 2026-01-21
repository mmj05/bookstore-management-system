import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response;
      if (statusFilter) {
        response = await ordersAPI.getByStatus(statusFilter, { page, size: 10 });
      } else {
        response = await ordersAPI.getAll({ page, size: 10 });
      }
      setOrders(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setNotes('');
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await ordersAPI.updateStatus(selectedOrder.id, {
        status: newStatus,
        trackingNumber: trackingNumber || null,
        notes: notes || null,
      });
      setMessage('Order status updated successfully');
      setShowUpdateModal(false);
      fetchOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating order');
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
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Order Management</h1>
        <p className="text-muted">View and manage customer orders</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card mb-20">
        <div className="manage-orders-filter">
          <label>Filter by Status:</label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><h3>No orders found</h3></div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="manage-orders-mobile-view">
              {orders.map(order => (
                <div key={order.id} className="manage-order-card">
                  <div className="manage-order-header">
                    <div>
                      <div className="manage-order-number">#{order.orderNumber}</div>
                      <div className="manage-order-customer">
                        {order.customerName}
                        <br />
                        <small className="text-muted">{order.customerEmail}</small>
                      </div>
                    </div>
                    <span className={getStatusBadge(order.status)}>{order.status}</span>
                  </div>
                  <div className="manage-order-details">
                    <div className="manage-order-row">
                      <span className="text-muted">Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="manage-order-row">
                      <span className="text-muted">Items:</span>
                      <span>{order.items?.length || 0}</span>
                    </div>
                    <div className="manage-order-row">
                      <span className="text-muted">Total:</span>
                      <strong style={{ color: 'var(--success-600)' }}>${order.total.toFixed(2)}</strong>
                    </div>
                  </div>
                  {getNextStatuses(order.status).length > 0 && (
                    <div className="manage-order-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openUpdateModal(order)}
                        style={{ width: '100%' }}
                      >
                        Update Status
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="manage-orders-table-view">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.orderNumber}</td>
                        <td>
                          {order.customerName}<br />
                          <small className="text-muted">{order.customerEmail}</small>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.items?.length || 0}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                        <td className="actions-column">
                          {getNextStatuses(order.status).length > 0 && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => openUpdateModal(order)}
                            >
                              Update Status
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >Previous</button>
                <span className="pagination-info">Page {page + 1} of {totalPages}</span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {showUpdateModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <h3 className="card-title">Update Order #{selectedOrder.orderNumber}</h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label>New Status</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value={selectedOrder.status}>{selectedOrder.status} (current)</option>
                  {getNextStatuses(selectedOrder.status).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              {newStatus === 'SHIPPED' && (
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  className="form-control"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Update</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageOrders;
