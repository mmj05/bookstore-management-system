import { useState, useEffect } from 'react';
import { reportsAPI, booksAPI } from '../services/api';

function Reports() {
  const [inventoryReport, setInventoryReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [outOfStockBooks, setOutOfStockBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [invRes, salesRes, lowStockRes, outStockRes] = await Promise.all([
        reportsAPI.getInventoryReport(),
        reportsAPI.getSalesReport(),
        booksAPI.getLowStock(5),
        booksAPI.getOutOfStock(),
      ]);
      
      setInventoryReport(invRes.data.data);
      setSalesReport(salesRes.data.data);
      setLowStockBooks(lowStockRes.data.data);
      setOutOfStockBooks(outStockRes.data.data);
    } catch (err) {
      setError('Error loading reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading reports...</div></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Reports</h1>
        <p className="text-muted">Inventory and sales analytics</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tab Navigation */}
      <div className="card mb-20">
        <div className="flex gap-10">
          <button 
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Report
          </button>
          <button 
            className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales Report
          </button>
          <button 
            className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stock')}
          >
            Stock Alerts
          </button>
        </div>
      </div>

      {/* Inventory Report */}
      {activeTab === 'inventory' && inventoryReport && (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-4">
            <div className="card text-center">
              <h4 className="text-muted">Total Books</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a5f' }}>
                {inventoryReport.totalBooks}
              </p>
            </div>
            <div className="card text-center">
              <h4 className="text-muted">Inventory Value</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                ${parseFloat(inventoryReport.totalInventoryValue).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="card text-center">
              <h4 className="text-muted">Low Stock</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {inventoryReport.lowStockBooks}
              </p>
              <small className="text-muted">Less than 5 units</small>
            </div>
            <div className="card text-center">
              <h4 className="text-muted">Out of Stock</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                {inventoryReport.outOfStockBooks}
              </p>
              <small className="text-muted">0 units available</small>
            </div>
          </div>

          {/* Books by Category */}
          <div className="card mt-20">
            <h3 className="card-title">Books by Category</h3>
            <p className="text-muted mb-20">Inventory breakdown showing quantities per category</p>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Number of Books</th>
                  <th>Percentage of Total</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.booksByCategory && 
                  Object.entries(inventoryReport.booksByCategory).map(([category, count]) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>{count}</td>
                      <td>
                        {inventoryReport.totalBooks > 0 
                          ? ((count / inventoryReport.totalBooks) * 100).toFixed(1) + '%'
                          : '0%'
                        }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Inventory Valuation Summary */}
          <div className="card mt-20">
            <h3 className="card-title">Inventory Valuation Summary</h3>
            <div className="grid grid-3">
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 className="text-muted">Total Inventory Value</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                  ${parseFloat(inventoryReport.totalInventoryValue || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 className="text-muted">Total Book Count</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a5f' }}>
                  {inventoryReport.totalBooks} titles
                </p>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 className="text-muted">Avg. Value per Title</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  ${inventoryReport.totalBooks > 0 
                    ? (parseFloat(inventoryReport.totalInventoryValue) / inventoryReport.totalBooks).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Report */}
      {activeTab === 'sales' && salesReport && (
        <div>
          <div className="grid grid-3">
            <div className="card text-center">
              <h4 className="text-muted">Total Revenue</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                ${parseFloat(salesReport.totalRevenue || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
            <div className="card text-center">
              <h4 className="text-muted">Total Orders</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e3a5f' }}>
                {salesReport.totalOrders}
              </p>
            </div>
            <div className="card text-center">
              <h4 className="text-muted">Completed Orders</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                {salesReport.ordersByStatus?.DELIVERED || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-2 mt-20">
            <div className="card">
              <h3 className="card-title">Orders by Status</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.ordersByStatus && 
                    Object.entries(salesReport.ordersByStatus).map(([status, count]) => (
                      <tr key={status}>
                        <td>
                          <span className={`badge badge-${getStatusBadgeColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td>{count}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="card-title">Best Selling Books</h3>
              {salesReport.bestSellingBooks && salesReport.bestSellingBooks.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Book</th>
                      <th>Units Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.bestSellingBooks.map((book, index) => (
                      <tr key={index}>
                        <td>
                          <span style={{ 
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: index < 3 ? '#f59e0b' : '#e5e7eb',
                            color: index < 3 ? 'white' : '#666',
                            textAlign: 'center',
                            lineHeight: '24px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                          }}>
                            {index + 1}
                          </span>
                        </td>
                        <td>{book.title}</td>
                        <td>{book.totalSold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No sales data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {activeTab === 'stock' && (
        <div>
          {/* Alert Summary Cards */}
          <div className="grid grid-2 mb-20">
            <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div className="flex flex-between flex-center">
                <div>
                  <h4 className="text-danger">Out of Stock Alert</h4>
                  <p className="text-muted">Books that need immediate reordering</p>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                  {outOfStockBooks.length}
                </div>
              </div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="flex flex-between flex-center">
                <div>
                  <h4 style={{ color: '#f59e0b' }}>Low Stock Warning</h4>
                  <p className="text-muted">Books with less than 5 units remaining</p>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {lowStockBooks.length}
                </div>
              </div>
            </div>
          </div>

          {/* Out of Stock Books */}
          <div className="card">
            <h3 className="card-title text-danger">⚠️ Out of Stock ({outOfStockBooks.length})</h3>
            {outOfStockBooks.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStockBooks.map(book => (
                    <tr key={book.id}>
                      <td>
                        <strong>{book.title}</strong>
                        {book.isRare && <span className="badge badge-warning" style={{ marginLeft: '5px' }}>Rare</span>}
                      </td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>${book.price.toFixed(2)}</td>
                      <td>
                        <span className="badge badge-danger">OUT OF STOCK</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center" style={{ padding: '30px' }}>
                <span style={{ fontSize: '2rem' }}>✅</span>
                <p className="text-success mt-10">All books are in stock!</p>
              </div>
            )}
          </div>

          {/* Low Stock Books */}
          <div className="card mt-20">
            <h3 className="card-title" style={{ color: '#f59e0b' }}>
              ⚠️ Low Stock Warning - Less than 5 units ({lowStockBooks.length})
            </h3>
            {lowStockBooks.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Current Quantity</th>
                    <th>Price</th>
                    <th>Alert Level</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockBooks.map(book => (
                    <tr key={book.id}>
                      <td>
                        <strong>{book.title}</strong>
                        {book.isRare && <span className="badge badge-warning" style={{ marginLeft: '5px' }}>Rare</span>}
                      </td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>
                        <span className={`badge ${book.quantity <= 2 ? 'badge-danger' : 'badge-warning'}`}>
                          {book.quantity} units
                        </span>
                      </td>
                      <td>${book.price.toFixed(2)}</td>
                      <td>
                        {book.quantity <= 2 ? (
                          <span style={{ color: '#dc2626', fontWeight: 'bold' }}>CRITICAL</span>
                        ) : (
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>WARNING</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center" style={{ padding: '30px' }}>
                <span style={{ fontSize: '2rem' }}>✅</span>
                <p className="text-success mt-10">All books have healthy stock levels!</p>
              </div>
            )}
          </div>

          {/* Reorder Recommendations */}
          {(outOfStockBooks.length > 0 || lowStockBooks.length > 0) && (
            <div className="card mt-20" style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b' }}>
              <h3 className="card-title" style={{ color: '#92400e' }}>📋 Reorder Recommendations</h3>
              <p style={{ color: '#92400e' }}>
                Based on current stock levels, we recommend reordering the following:
              </p>
              <ul style={{ color: '#92400e', paddingLeft: '20px' }}>
                {outOfStockBooks.length > 0 && (
                  <li><strong>{outOfStockBooks.length} out-of-stock items</strong> need immediate reordering</li>
                )}
                {lowStockBooks.length > 0 && (
                  <li><strong>{lowStockBooks.length} low-stock items</strong> should be reordered soon</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function for status badge colors
function getStatusBadgeColor(status) {
  const colors = {
    PENDING: 'warning',
    PROCESSING: 'info',
    SHIPPED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger'
  };
  return colors[status] || 'secondary';
}

export default Reports;