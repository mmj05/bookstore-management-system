import { useState, useEffect } from 'react';
import { booksAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [page]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        size: 12,
        keyword: searchKeyword || null,
        categoryId: selectedCategory || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        inStock: inStockOnly || null,
      };
      
      const response = await booksAPI.filter(params);
      setBooks(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error loading books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const handleAddToCart = async (bookId) => {
    try {
      await addToCart(bookId, 1);
      setMessage('Book added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to cart');
    }
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setPage(0);
    setTimeout(fetchBooks, 0);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Browse Books</h1>
        <p className="text-muted">Search and filter our collection</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search and Filter */}
      <div className="card mb-20">
        <form onSubmit={handleSearch}>
          <div className="search-bar">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, author, or ISBN..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
          
          <div className="filter-group">
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <input
              type="number"
              className="form-control"
              style={{ width: '120px' }}
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            
            <input
              type="number"
              className="form-control"
              style={{ width: '120px' }}
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In Stock Only
            </label>
            
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-4">
            {books.map(book => (
              <div key={book.id} className="book-card">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <p className="price">${book.price.toFixed(2)}</p>
                <p className="category">
                  {book.categories?.map(c => c.name).join(', ') || 'Uncategorized'}
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  {book.quantity > 0 ? (
                    <span className="text-success">In Stock ({book.quantity})</span>
                  ) : (
                    <span className="text-danger">Out of Stock</span>
                  )}
                </p>
                {book.isRare && (
                  <span className="badge badge-warning">Rare</span>
                )}
                <div className="mt-10">
                  {isAuthenticated() && isCustomer() && book.quantity > 0 && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(book.id)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-center gap-10 mt-20" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Books;
