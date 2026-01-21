import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Book colors for the display
const bookColors = [
  'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
  'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
  'linear-gradient(135deg, #166534 0%, #14532d 100%)',
  'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)',
  'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
  'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
  'linear-gradient(135deg, #3730a3 0%, #312e81 100%)',
  'linear-gradient(135deg, #9f1239 0%, #881337 100%)',
  'linear-gradient(135deg, #92400e 0%, #78350f 100%)',
  'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
];

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToCart } = useCart();

  // Get a consistent color based on book ID
  const bookColor = book ? bookColors[book.id % bookColors.length] : bookColors[0];

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await booksAPI.getById(id);
      setBook(response.data.data);
    } catch (err) {
      setError('Error loading book details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(book.id, quantity);
      setMessage('Book added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to cart');
    }
  };

  const getConditionLabel = (condition) => {
    const labels = {
      NEW: 'New',
      LIKE_NEW: 'Like New',
      VERY_GOOD: 'Very Good',
      GOOD: 'Good',
      ACCEPTABLE: 'Acceptable',
      POOR: 'Poor'
    };
    return labels[condition] || condition;
  };

  const getConditionColor = (condition) => {
    const colors = {
      NEW: '#10b981',
      LIKE_NEW: '#10b981',
      VERY_GOOD: '#3b82f6',
      GOOD: '#f59e0b',
      ACCEPTABLE: '#f97316',
      POOR: '#ef4444'
    };
    return colors[condition] || '#64748b';
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '90px' }}>
        <div className="loading">Loading book details...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container" style={{ paddingTop: '90px' }}>
        <div className="alert alert-error">{error || 'Book not found'}</div>
        <Link to="/books" className="btn btn-secondary">← Back to Books</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '90px', paddingBottom: '60px' }}>
      <div className="mb-20">
        <Link to="/books" className="btn btn-secondary btn-sm">← Back to Books</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ padding: '40px' }}>
        <div className="book-detail-grid">
          {/* Book Display - Looks like a real book */}
          <div className="book-detail-visual">
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: 'rotateY(-10deg)',
              transition: 'transform 0.4s ease'
            }}>
              {/* Book Spine */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '40px',
                height: '100%',
                background: bookColor,
                transform: 'rotateY(90deg) translateZ(20px) translateX(-20px)',
                transformOrigin: 'left center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '15px 8px',
                boxShadow: 'inset -3px 0 8px rgba(0, 0, 0, 0.3)'
              }}>
                <span style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontFamily: "'Merriweather', Georgia, serif",
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxHeight: '85%',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  {book.title}
                </span>
              </div>

              {/* Book Cover */}
              <div style={{
                position: 'absolute',
                left: '40px',
                top: 0,
                width: 'calc(100% - 40px)',
                height: '100%',
                background: bookColor,
                borderRadius: '0 12px 12px 0',
                padding: '35px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
                overflow: 'hidden'
              }}>
                {/* Decorative top bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}></div>
                
                {/* Decorative bottom bar */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '8px',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}></div>

                {/* Badge */}
                {book.isRare && (
                  <span style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: 'var(--accent-500)',
                    color: 'white',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                  }}>
                    Rare
                  </span>
                )}

                <div>
                  <h1 style={{
                    fontFamily: "'Merriweather', Georgia, serif",
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    lineHeight: '1.3',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    marginBottom: '12px'
                  }}>
                    {book.title}
                  </h1>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontStyle: 'italic',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                  }}>
                    by {book.author}
                  </p>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingTop: '20px',
                  marginTop: 'auto'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'white',
                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                  }}>
                    ${book.price.toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: '8px'
                  }}>
                    {book.categories?.map(c => c.name).join(' • ') || 'Uncategorized'}
                  </div>
                </div>
              </div>

              {/* Book Pages Effect */}
              <div style={{
                position: 'absolute',
                right: 0,
                top: '4px',
                width: '12px',
                height: 'calc(100% - 8px)',
                background: 'linear-gradient(to right, #f5f5f5 0%, #e0e0e0 10%, #f5f5f5 30%, #e0e0e0 50%, #f5f5f5 70%, #e0e0e0 90%, #f5f5f5 100%)',
                borderRadius: '0 3px 3px 0',
                transform: 'rotateY(90deg) translateZ(6px)',
                transformOrigin: 'left center'
              }}></div>
            </div>
          </div>

          {/* Book Details */}
          <div className="book-detail-info">
            <h1 style={{ marginBottom: '10px', color: 'var(--primary-800)', fontSize: '2rem' }}>
              {book.title}
            </h1>
            <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '25px' }}>
              by {book.author}
            </p>

            <div style={{ marginBottom: '25px' }}>
              {book.quantity > 0 ? (
                <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '10px 18px' }}>
                  ✓ In Stock ({book.quantity} available)
                </span>
              ) : (
                <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '10px 18px' }}>
                  ✕ Out of Stock
                </span>
              )}
              {book.isRare && (
                <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '10px 18px', marginLeft: '10px' }}>
                  ★ Rare Book
                </span>
              )}
            </div>

            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: 'var(--success-600)', 
              marginBottom: '30px',
              fontFamily: "'Merriweather', Georgia, serif"
            }}>
              ${book.price.toFixed(2)}
            </div>

            {/* Book Information */}
            <div style={{ 
              background: 'var(--gray-50)', 
              borderRadius: '12px', 
              padding: '20px',
              marginBottom: '25px'
            }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--gray-700)' }}>
                Book Details
              </h3>
              <div className="book-info-grid">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block' }}>ISBN</span>
                  <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{book.isbn}</span>
                </div>
                {book.publisher && (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block' }}>Publisher</span>
                    <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{book.publisher}</span>
                  </div>
                )}
                {book.publicationYear && (
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block' }}>Year</span>
                    <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{book.publicationYear}</span>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block' }}>Condition</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: getConditionColor(book.bookCondition)
                  }}>
                    {getConditionLabel(book.bookCondition)}
                  </span>
                </div>
              </div>
              {book.categories && book.categories.length > 0 && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--gray-200)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block', marginBottom: '8px' }}>
                    Categories
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {book.categories.map(cat => (
                      <span key={cat.id} className="badge badge-info">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            {isAuthenticated() && isCustomer() && book.quantity > 0 && (
              <div className="book-add-to-cart" style={{ marginBottom: '25px' }}>
                <label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Quantity:</label>
                <select
                  className="form-control"
                  style={{ width: '100px' }}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[...Array(Math.min(book.quantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                >
                  Add to Cart
                </button>
              </div>
            )}

            {!isAuthenticated() && (
              <div className="alert alert-info">
                <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to add items to your cart.
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {book.description && (
          <div style={{ 
            marginTop: '40px', 
            paddingTop: '30px', 
            borderTop: '2px solid var(--gray-100)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              color: 'var(--primary-800)', 
              marginBottom: '15px',
              fontFamily: "'Merriweather', Georgia, serif"
            }}>
              About This Book
            </h3>
            <p style={{ 
              lineHeight: '1.9', 
              color: 'var(--gray-600)', 
              fontSize: '1.05rem',
              maxWidth: '800px'
            }}>
              {book.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
