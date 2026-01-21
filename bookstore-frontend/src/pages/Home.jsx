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
            <span className="book-spine-title">{book.title}</span>
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
                {book.quantity > 0 ? `In Stock (${book.quantity})` : 'Out of Stock'}
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
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover <span>Rare</span> & Timeless Books
          </h1>
          <p className="hero-subtitle">
            Welcome to Blackwood Rare Books — your gateway to extraordinary literary treasures. 
            Explore our curated collection of rare editions, collectibles, and timeless classics.
          </p>
          <div className="hero-buttons">
            <Link to="/books" className="btn btn-primary btn-lg">
              Browse Collection
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
              <span className="hero-stat-label">Books Available</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">{bookStats.categories}+</span>
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
            <h2 className="section-title">Featured Books</h2>
            <Link to="/books" className="btn btn-secondary">View All Books</Link>
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
          <h2 className="section-title mb-20">Quick Actions</h2>
          <div className="grid grid-3">
            <div className="feature-card">
              <span className="feature-card-icon">📖</span>
              <h3>Browse Books</h3>
              <p>Explore our collection of books across various categories and genres.</p>
              <Link to="/books" className="btn btn-primary">Browse Now</Link>
            </div>

            {!isAuthenticated() && (
              <>
                <div className="feature-card">
                  <span className="feature-card-icon">🔐</span>
                  <h3>Sign In</h3>
                  <p>Already have an account? Sign in to access your cart and orders.</p>
                  <Link to="/login" className="btn btn-primary">Sign In</Link>
                </div>

                <div className="feature-card">
                  <span className="feature-card-icon">📝</span>
                  <h3>Create Account</h3>
                  <p>New here? Create an account to start building your library.</p>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </div>
              </>
            )}

            {isAuthenticated() && user.role === 'CUSTOMER' && (
              <>
                <div className="feature-card">
                  <span className="feature-card-icon">🛒</span>
                  <h3>Shopping Cart</h3>
                  <p>View items in your cart and proceed to checkout.</p>
                  <Link to="/cart" className="btn btn-primary">View Cart</Link>
                </div>

                <div className="feature-card">
                  <span className="feature-card-icon">📦</span>
                  <h3>My Orders</h3>
                  <p>Track your order status and view your order history.</p>
                  <Link to="/orders" className="btn btn-primary">View Orders</Link>
                </div>
              </>
            )}

            {isAuthenticated() && (user.role === 'MANAGER' || user.role === 'ADMINISTRATOR') && (
              <>
                <div className="feature-card">
                  <span className="feature-card-icon">📦</span>
                  <h3>Inventory</h3>
                  <p>Manage book inventory, add new books, and update stock levels.</p>
                  <Link to="/inventory" className="btn btn-primary">Manage Inventory</Link>
                </div>

                <div className="feature-card">
                  <span className="feature-card-icon">📊</span>
                  <h3>Reports</h3>
                  <p>View detailed inventory and sales analytics reports.</p>
                  <Link to="/reports" className="btn btn-primary">View Reports</Link>
                </div>
              </>
            )}

            {isAuthenticated() && user.role === 'ADMINISTRATOR' && (
              <div className="feature-card">
                <span className="feature-card-icon">👥</span>
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
            We specialize in curating exceptional literary treasures from around the world.
            Whether you're a collector seeking a first edition or a reader looking for timeless classics,
            our carefully curated collection has something special for you.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Home;
