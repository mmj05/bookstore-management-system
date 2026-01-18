import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, isManager, isCustomer } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          📚 Bookstore
        </Link>
        
        <ul className="navbar-nav">
          <li><Link to="/books">Browse Books</Link></li>
          
          {isAuthenticated() && isCustomer() && (
            <>
              <li>
                <Link to="/cart">
                  Cart ({cartItemCount})
                </Link>
              </li>
              <li><Link to="/orders">My Orders</Link></li>
            </>
          )}
          
          {isAuthenticated() && isManager() && (
            <>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/manage-orders">Orders</Link></li>
              <li><Link to="/reports">Reports</Link></li>
            </>
          )}
          
          {isAuthenticated() && isAdmin() && (
            <li><Link to="/users">Users</Link></li>
          )}
          
          {isAuthenticated() ? (
            <>
              <li><Link to="/profile">Profile ({user.firstName})</Link></li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;