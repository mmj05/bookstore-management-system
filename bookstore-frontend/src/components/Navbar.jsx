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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Blackwood Rare Books
        </Link>
        
        <ul className="navbar-nav">
          <li><Link to="/books">Browse Books</Link></li>
          
          {isAuthenticated() && isCustomer() && (
            <>
              <li>
                <Link to="/cart" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: cartItemCount > 0 ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  borderRadius: '8px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Cart
                  {cartItemCount > 0 && (
                    <span style={{
                      background: 'var(--accent-500)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '2px'
                    }}>
                      {cartItemCount}
                    </span>
                  )}
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
              <li>
                <Link to="/profile" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                  {user.firstName}
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Sign In
                </Link>
              </li>
              <li>
                <Link 
                  to="/register"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
