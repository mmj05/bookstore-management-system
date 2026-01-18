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
            </div>
            <div className="card text-center">
              <h4 className="text-muted">Out of Stock</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                {inventoryReport.outOfStockBooks}
              </p>
            </div>
          </div>

          <div className="card mt-20">
            <h3 className="card-title">Books by Category</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Number of Books</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.booksByCategory && 
                  Object.entries(inventoryReport.booksByCategory).map(([category, count]) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>{count}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
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
                        <td>{status}</td>
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
                      <th>Book</th>
                      <th>Units Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.bestSellingBooks.map((book, index) => (
                      <tr key={index}>
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
          <div className="card">
            <h3 className="card-title text-danger">Out of Stock ({outOfStockBooks.length})</h3>
            {outOfStockBooks.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStockBooks.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>${book.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-success">All books are in stock!</p>
            )}
          </div>

          <div className="card mt-20">
            <h3 className="card-title" style={{ color: '#f59e0b' }}>
              Low Stock - Less than 5 units ({lowStockBooks.length})
            </h3>
            {lowStockBooks.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockBooks.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td><span className="badge badge-warning">{book.quantity}</span></td>
                      <td>${book.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-success">All books have healthy stock levels!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
