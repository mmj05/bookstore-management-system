import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Book card component that looks like a real book
function BookCard({ book, index, onAddToCart, isAuthenticated, isCustomer }) {
  const colorClass = `book-color-${(index % 10) + 1}`;
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(book.id);
  };

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
              {isAuthenticated && isCustomer && book.quantity > 0 && (
                <div className="book-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isbnSearch, setIsbnSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToCart } = useCart();

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        size: 15,
      };
      
      // Only add non-empty filter params
      // If ISBN is provided, use it as the keyword (ISBN search takes priority)
      if (isbnSearch) {
        params.keyword = isbnSearch;
      } else if (searchKeyword) {
        params.keyword = searchKeyword;
      }
      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (inStockOnly) params.inStock = true;
      
      const response = await booksAPI.filter(params);
      setBooks(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
      setTotalElements(response.data.data.totalElements);
    } catch (err) {
      setError('Error loading books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchKeyword, isbnSearch, selectedCategory, minPrice, maxPrice, inStockOnly]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch books whenever any filter changes (with debounce for text inputs)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBooks();
    }, 300); // 300ms debounce to avoid too many API calls while typing

    return () => clearTimeout(debounceTimer);
  }, [fetchBooks]);

  // Reset to first page when filters change (except for pagination)
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPage(0);
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setPage(0);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setPage(0);
  };

  const handleInStockChange = (checked) => {
    setInStockOnly(checked);
    setPage(0);
  };

  const handleSearchKeywordChange = (value) => {
    setSearchKeyword(value);
    setIsbnSearch(''); // Clear ISBN when using general search
    setPage(0);
  };

  const handleIsbnSearchChange = (value) => {
    setIsbnSearch(value);
    setSearchKeyword(''); // Clear general search when using ISBN
    setPage(0);
  };

  const handleAddToCart = async (bookId) => {
    try {
      await addToCart(bookId, 1);
      setMessage('Book added to cart!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding to cart');
      setTimeout(() => setError(''), 3000);
    }
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setIsbnSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setPage(0);
  };

  const hasActiveFilters = searchKeyword || isbnSearch || selectedCategory || minPrice || maxPrice || inStockOnly;

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      <div className="page-header">
        <h1>Browse Books</h1>
        <p className="text-muted">
          Discover {totalElements} books in our collection
        </p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search and Filter */}
      <div className="card mb-20">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or author..."
            value={searchKeyword}
            onChange={(e) => handleSearchKeywordChange(e.target.value)}
            style={{ margin: 0 }}
          />
          <span style={{ color: 'var(--gray-400)', fontWeight: '500', fontSize: '0.85rem' }}>OR</span>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by ISBN..."
              value={isbnSearch}
              onChange={(e) => handleIsbnSearchChange(e.target.value)}
              style={{ 
                margin: 0,
                paddingLeft: '40px'
              }}
            />
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)'
              }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>
        
        <div className="filter-group">
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input
            type="number"
            className="form-control"
            style={{ width: '130px' }}
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
          />
          
          <input
            type="number"
            className="form-control"
            style={{ width: '130px' }}
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
          />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => handleInStockChange(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-500)' }}
            />
            <span>In Stock Only</span>
          </label>
          
          {hasActiveFilters && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <button className="btn btn-primary mt-20" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="featured-books-grid">
            {books.map((book, index) => (
              <BookCard 
                key={book.id} 
                book={book} 
                index={index}
                onAddToCart={handleAddToCart}
                isAuthenticated={isAuthenticated()}
                isCustomer={isCustomer()}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-center gap-20 mt-40" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Previous
              </button>
              <span style={{ 
                padding: '10px 20px', 
                background: 'white', 
                borderRadius: '10px',
                fontWeight: '600',
                color: 'var(--gray-700)'
              }}>
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Books;
