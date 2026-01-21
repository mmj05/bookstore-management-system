import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';

// Book card component that looks like a real book
function BookCard({ book, index }) {
  const colorClass = `book-color-${(index % 10) + 1}`;
  
  return (
    <Link to={`/books/${book.id}`} style={{ textDecoration: 'none' }}>
      <div className={`book-card ${colorClass}`}>
        <div className="book-card-inner">
          <div className="book-spine">
            <span className="book-spine-title">{book.title.split(' ')[0]}</span>
          </div>
          <div className="book-cover">
            <div className="book-pages"></div>
            <div>
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">by {book.author}</p>
            </div>
            <div className="book-meta">
              <div className="book-price">${book.price.toFixed(2)}</div>
              <div className="book-category">
                {book.categories?.map(c => c.name).join(', ') || 'Uncategorized'}
              </div>
              <span className={`book-stock ${book.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {book.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Home() {
  const { isAuthenticated, user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookStats, setBookStats] = useState({ total: 0, categories: 0 });

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      const response = await booksAPI.filter({ page: 0, size: 10, inStock: true });
      setFeaturedBooks(response.data.data.content);
      setBookStats({
        total: response.data.data.totalElements,
        categories: new Set(response.data.data.content.flatMap(b => b.categories?.map(c => c.name) || [])).size
      });
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section - Cinematic Style */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            ✦ Est. 2026 — Purveyors of Fine Literature
          </div>
          <h1 className="hero-title">
            <span>Discover</span>
            <span className="gold-text">Extraordinary</span>
            <span>Books</span>
          </h1>
          <p className="hero-subtitle">
            Welcome to Blackwood Rare Books — your gateway to extraordinary literary treasures. 
            Explore our curated collection of rare editions, collectibles, and timeless classics.
          </p>
          <div className="hero-buttons">
            <Link to="/books" className="btn btn-primary btn-lg">
              Browse Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            {!isAuthenticated() && (
              <Link to="/register" className="btn btn-outline btn-lg">
                Create Account
              </Link>
            )}
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">{bookStats.total}+</span>
              <span className="hero-stat-label">Rare Books</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">6+</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">24/7</span>
              <span className="hero-stat-label">Online Access</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Welcome Message for Logged In Users */}
        {isAuthenticated() && (
          <div className="welcome-message">
            <span className="welcome-message-icon">👋</span>
            <div className="welcome-message-content">
              <h3>Welcome back, {user.firstName}!</h3>
              <p>You are logged in as {user.role.toLowerCase().replace('_', ' ')}. Ready to explore?</p>
            </div>
          </div>
        )}

        {/* Featured Books Section */}
        <section className="featured-books">
          <div className="section-header">
            <h2 className="section-title">Featured Collection</h2>
            <Link to="/books" className="btn btn-outline">
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="loading">Loading featured books...</div>
          ) : featuredBooks.length > 0 ? (
            <div className="featured-books-grid">
              {featuredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No books available yet</h3>
              <p>Check back soon for our collection!</p>
            </div>
          )}
        </section>

        {/* Quick Actions Section */}
        <section className="mt-40">
          <div className="section-header">
            <h2 className="section-title">Why Choose Blackwood</h2>
          </div>
          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-card-icon">📖</div>
              <h3>Curated Collection</h3>
              <p>Every book is hand-selected by our expert curators for authenticity and condition.</p>
              <Link to="/books" className="btn btn-primary">Browse Now</Link>
            </div>

            {!isAuthenticated() && (
              <>
                <div className="feature-card">
                  <div className="feature-card-icon">🔐</div>
                  <h3>Secure Account</h3>
                  <p>Already have an account? Sign in to access your cart and track orders.</p>
                  <Link to="/login" className="btn btn-primary">Sign In</Link>
                </div>

                <div className="feature-card">
                  <div className="feature-card-icon">✨</div>
                  <h3>Join Us</h3>
                  <p>Create an account to start building your personal library collection.</p>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </div>
              </>
            )}

            {isAuthenticated() && user.role === 'CUSTOMER' && (
              <>
                <div className="feature-card">
                  <div className="feature-card-icon">🛒</div>
                  <h3>Shopping Cart</h3>
                  <p>View items in your cart and proceed to secure checkout.</p>
                  <Link to="/cart" className="btn btn-primary">View Cart</Link>
                </div>

                <div className="feature-card">
                  <div className="feature-card-icon">📦</div>
                  <h3>My Orders</h3>
                  <p>Track your order status and view complete order history.</p>
                  <Link to="/orders" className="btn btn-primary">View Orders</Link>
                </div>
              </>
            )}

            {isAuthenticated() && (user.role === 'MANAGER' || user.role === 'ADMINISTRATOR') && (
              <>
                <div className="feature-card">
                  <div className="feature-card-icon">📦</div>
                  <h3>Inventory</h3>
                  <p>Manage book inventory, add new titles, and update stock levels.</p>
                  <Link to="/inventory" className="btn btn-primary">Manage Inventory</Link>
                </div>

                <div className="feature-card">
                  <div className="feature-card-icon">📊</div>
                  <h3>Reports</h3>
                  <p>View detailed inventory analytics and sales reports.</p>
                  <Link to="/reports" className="btn btn-primary">View Reports</Link>
                </div>
              </>
            )}

            {isAuthenticated() && user.role === 'ADMINISTRATOR' && (
              <div className="feature-card">
                <div className="feature-card-icon">👥</div>
                <h3>User Management</h3>
                <p>Manage user accounts, roles, and access permissions.</p>
                <Link to="/users" className="btn btn-primary">Manage Users</Link>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <h3>About Blackwood Rare Books</h3>
          <p>
            Blackwood Rare Books is your premier destination for rare, collectible, and hard-to-find books.
            Since 1892, we have been curating exceptional literary treasures from around the world.
            Whether you're a collector seeking a first edition or a reader looking for timeless classics,
            our carefully curated collection has something special for you.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
