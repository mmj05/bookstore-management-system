import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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

  if (loading) {
    return <div className="container"><div className="loading">Loading book details...</div></div>;
  }

  if (error || !book) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'Book not found'}</div>
        <Link to="/books" className="btn btn-secondary">Back to Books</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-20">
        <Link to="/books" className="btn btn-secondary btn-sm">← Back to Books</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <div className="grid grid-2" style={{ gridTemplateColumns: '300px 1fr', gap: '30px' }}>
          {/* Book Image */}
          <div>
            {book.imageUrl ? (
              <img 
                src={book.imageUrl} 
                alt={book.title}
                style={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                maxWidth: '300px',
                height: '400px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '4rem'
              }}>
                📚
              </div>
            )}
          </div>

          {/* Book Details */}
          <div>
            <h1 style={{ marginBottom: '10px', color: '#1e3a5f' }}>{book.title}</h1>
            <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
              by {book.author}
            </p>

            {book.isRare && (
              <span className="badge badge-warning" style={{ marginBottom: '15px', display: 'inline-block' }}>
                Rare Book
              </span>
            )}

            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '20px' }}>
              ${book.price.toFixed(2)}
            </div>

            <div style={{ marginBottom: '20px' }}>
              {book.quantity > 0 ? (
                <span className="badge badge-success" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                  In Stock ({book.quantity} available)
                </span>
              ) : (
                <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Book Information Table */}
            <table className="table" style={{ marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', width: '150px' }}>ISBN</td>
                  <td>{book.isbn}</td>
                </tr>
                {book.publisher && (
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Publisher</td>
                    <td>{book.publisher}</td>
                  </tr>
                )}
                {book.publicationYear && (
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Publication Year</td>
                    <td>{book.publicationYear}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Condition</td>
                  <td>{getConditionLabel(book.bookCondition)}</td>
                </tr>
                {book.categories && book.categories.length > 0 && (
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Categories</td>
                    <td>
                      {book.categories.map(cat => (
                        <span key={cat.id} className="badge badge-info" style={{ marginRight: '5px' }}>
                          {cat.name}
                        </span>
                      ))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Add to Cart Section */}
            {isAuthenticated() && isCustomer() && book.quantity > 0 && (
              <div className="flex gap-10" style={{ alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Quantity:</label>
                <select
                  className="form-control"
                  style={{ width: '80px' }}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[...Array(Math.min(book.quantity, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            )}

            {!isAuthenticated() && (
              <div className="alert alert-info">
                <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to add items to your cart.
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {book.description && (
          <div style={{ marginTop: '30px' }}>
            <h3 className="card-title">Description</h3>
            <p style={{ lineHeight: '1.8', color: '#555' }}>{book.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;