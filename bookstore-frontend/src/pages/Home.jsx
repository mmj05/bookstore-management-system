import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container">
      <div className="page-header text-center">
        <h1>Welcome to Bookstore Management System</h1>
        <p className="text-muted">Browse our collection of books, manage inventory, and more.</p>
      </div>

      {isAuthenticated() && (
        <div className="alert alert-info">
          Welcome back, {user.firstName}! You are logged in as {user.role}.
        </div>
      )}

      <div className="grid grid-3">
        <div className="card text-center">
          <h3 className="card-title">📖 Browse Books</h3>
          <p>Explore our collection of books across various categories.</p>
          <Link to="/books" className="btn btn-primary">Browse Now</Link>
        </div>

        {!isAuthenticated() && (
          <>
            <div className="card text-center">
              <h3 className="card-title">🔐 Login</h3>
              <p>Already have an account? Login to access your cart and orders.</p>
              <Link to="/login" className="btn btn-primary">Login</Link>
            </div>

            <div className="card text-center">
              <h3 className="card-title">📝 Register</h3>
              <p>New customer? Create an account to start shopping.</p>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          </>
        )}

        {isAuthenticated() && user.role === 'CUSTOMER' && (
          <>
            <div className="card text-center">
              <h3 className="card-title">🛒 Shopping Cart</h3>
              <p>View items in your cart and proceed to checkout.</p>
              <Link to="/cart" className="btn btn-primary">View Cart</Link>
            </div>

            <div className="card text-center">
              <h3 className="card-title">📦 My Orders</h3>
              <p>Track your order status and view order history.</p>
              <Link to="/orders" className="btn btn-primary">View Orders</Link>
            </div>
          </>
        )}

        {isAuthenticated() && (user.role === 'MANAGER' || user.role === 'ADMINISTRATOR') && (
          <>
            <div className="card text-center">
              <h3 className="card-title">📦 Inventory</h3>
              <p>Manage book inventory, add new books, and update stock.</p>
              <Link to="/inventory" className="btn btn-primary">Manage Inventory</Link>
            </div>

            <div className="card text-center">
              <h3 className="card-title">📊 Reports</h3>
              <p>View inventory and sales reports.</p>
              <Link to="/reports" className="btn btn-primary">View Reports</Link>
            </div>
          </>
        )}

        {isAuthenticated() && user.role === 'ADMINISTRATOR' && (
          <div className="card text-center">
            <h3 className="card-title">👥 User Management</h3>
            <p>Manage user accounts, roles, and permissions.</p>
            <Link to="/users" className="btn btn-primary">Manage Users</Link>
          </div>
        )}
      </div>

      <div className="card mt-20">
        <h3 className="card-title">About This System</h3>
        <p>
          The Bookstore Management System is a web-based solution designed to automate 
          inventory, sales, ordering, and user management processes for a bookstore.
        </p>
        <h4 className="mt-20">Features:</h4>
        <ul>
          <li>📚 Browse and search books by title, author, ISBN, or category</li>
          <li>🛒 Shopping cart with checkout (Cash on Delivery)</li>
          <li>📦 Order tracking and history</li>
          <li>📊 Inventory management and reports</li>
          <li>👥 User management with role-based access</li>
          <li>🔐 Secure authentication with account lockout</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;