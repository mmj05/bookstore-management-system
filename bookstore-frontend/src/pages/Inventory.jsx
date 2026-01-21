import { useState, useEffect } from 'react';
import { booksAPI, categoriesAPI } from '../services/api';

function Inventory() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Book form
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    description: '',
    publisher: '',
    publicationYear: '',
    price: '',
    quantity: '',
    bookCondition: 'NEW',
    isRare: false,
    categoryIds: [],
  });
  
  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [page]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (searchKeyword) {
        const response = await booksAPI.search(searchKeyword, params);
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } else {
        const response = await booksAPI.getAll(params);
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (err) {
      setError('Error loading books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  // Book CRUD
  const openAddBook = () => {
    setEditingBook(null);
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      description: '',
      publisher: '',
      publicationYear: '',
      price: '',
      quantity: '',
      bookCondition: 'NEW',
      isRare: false,
      categoryIds: [],
    });
    setShowBookModal(true);
  };

  const openEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      description: book.description || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      price: book.price,
      quantity: book.quantity,
      bookCondition: book.bookCondition || 'NEW',
      isRare: book.isRare || false,
      categoryIds: book.categories?.map(c => c.id) || [],
    });
    setShowBookModal(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = {
        ...bookForm,
        price: parseFloat(bookForm.price),
        quantity: parseInt(bookForm.quantity),
        publicationYear: bookForm.publicationYear ? parseInt(bookForm.publicationYear) : null,
      };

      if (editingBook) {
        await booksAPI.update(editingBook.id, data);
        setMessage('Book updated successfully');
      } else {
        await booksAPI.create(data);
        setMessage('Book added successfully');
      }
      
      setShowBookModal(false);
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await booksAPI.delete(id);
      setMessage('Book deleted successfully');
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting book');
    }
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    try {
      await booksAPI.updateQuantity(id, parseInt(newQuantity));
      fetchBooks();
    } catch (err) {
      setError('Error updating quantity');
    }
  };

  // Category CRUD
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setShowCategoryModal(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, categoryForm);
        setMessage('Category updated successfully');
      } else {
        await categoriesAPI.create(categoryForm);
        setMessage('Category added successfully');
      }
      
      setShowCategoryModal(false);
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoriesAPI.delete(id);
      setMessage('Category deleted successfully');
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <div className="container inventory-page">
      <div className="page-header inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted">Manage books and categories</p>
        </div>
        <div className="inventory-actions">
          <button className="btn btn-primary" onClick={openAddBook}>+ Add Book</button>
          <button className="btn btn-secondary" onClick={openAddCategory}>+ Add Category</button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search */}
      <div className="card mb-20">
        <form onSubmit={handleSearch} className="search-bar inventory-search">
          <input
            type="text"
            className="form-control"
            placeholder="Search books by title, author, or ISBN..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {/* Books Table */}
      <div className="card">
        <h3 className="card-title">Books ({books.length})</h3>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="inventory-mobile-view">
              {books.map(book => (
                <div key={book.id} className="inventory-card">
                  <div className="inventory-card-header">
                    <div className="inventory-card-title">
                      {book.title}
                      {book.isRare && <span className="badge badge-warning">Rare</span>}
                    </div>
                    <div className="inventory-card-price">${book.price.toFixed(2)}</div>
                  </div>
                  <div className="inventory-card-details">
                    <div className="inventory-card-row">
                      <span className="inventory-card-label">Author:</span>
                      <span>{book.author}</span>
                    </div>
                    <div className="inventory-card-row">
                      <span className="inventory-card-label">ISBN:</span>
                      <span>{book.isbn}</span>
                    </div>
                    <div className="inventory-card-row">
                      <span className="inventory-card-label">Condition:</span>
                      <span>{book.bookCondition}</span>
                    </div>
                    <div className="inventory-card-row">
                      <span className="inventory-card-label">Categories:</span>
                      <span>{book.categories?.map(c => c.name).join(', ') || '-'}</span>
                    </div>
                    <div className="inventory-card-row">
                      <span className="inventory-card-label">Quantity:</span>
                      <input
                        type="number"
                        className="form-control quantity-input"
                        value={book.quantity}
                        min="0"
                        onChange={(e) => handleUpdateQuantity(book.id, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="inventory-card-actions">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditBook(book)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="table-responsive">
              <table className="table inventory-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Condition</th>
                    <th>Categories</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td data-label="Title">
                        <div className="title-cell">
                          {book.title}
                          {book.isRare && <span className="badge badge-warning">Rare</span>}
                        </div>
                      </td>
                      <td data-label="Author">{book.author}</td>
                      <td data-label="ISBN">{book.isbn}</td>
                      <td data-label="Price">${book.price.toFixed(2)}</td>
                      <td data-label="Quantity">
                        <input
                          type="number"
                          className="form-control quantity-input"
                          value={book.quantity}
                          min="0"
                          onChange={(e) => handleUpdateQuantity(book.id, e.target.value)}
                        />
                      </td>
                      <td data-label="Condition">{book.bookCondition}</td>
                      <td data-label="Categories">
                        {book.categories?.map(c => c.name).join(', ') || '-'}
                      </td>
                      <td data-label="Actions" className="actions-column">
                        <div className="action-buttons">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditBook(book)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <span className="pagination-info">Page {page + 1} of {totalPages}</span>
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

      {/* Categories Section */}
      <div className="card mt-20">
        <h3 className="card-title">Categories ({categories.length})</h3>
        
        {/* Mobile Card View for Categories */}
        <div className="inventory-mobile-view">
          {categories.map(cat => (
            <div key={cat.id} className="inventory-card category-card">
              <div className="inventory-card-header">
                <div className="inventory-card-title">{cat.name}</div>
                <div className="inventory-card-count">{cat.bookCount} books</div>
              </div>
              {cat.description && (
                <div className="inventory-card-description">{cat.description}</div>
              )}
              <div className="inventory-card-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditCategory(cat)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View for Categories */}
        <div className="table-responsive">
          <table className="table inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Books</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td data-label="Name">{cat.name}</td>
                  <td data-label="Description">{cat.description || '-'}</td>
                  <td data-label="Books">{cat.bookCount}</td>
                  <td data-label="Actions" className="actions-column">
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditCategory(cat)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <h3 className="card-title">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleBookSubmit}>
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>ISBN *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Publisher</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={bookForm.description}
                  onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={bookForm.price}
                    onChange={(e) => setBookForm({...bookForm, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookForm.quantity}
                    onChange={(e) => setBookForm({...bookForm, quantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Publication Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookForm.publicationYear}
                    onChange={(e) => setBookForm({...bookForm, publicationYear: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select
                    className="form-control"
                    value={bookForm.bookCondition}
                    onChange={(e) => setBookForm({...bookForm, bookCondition: e.target.value})}
                  >
                    <option value="NEW">New</option>
                    <option value="LIKE_NEW">Like New</option>
                    <option value="VERY_GOOD">Very Good</option>
                    <option value="GOOD">Good</option>
                    <option value="ACCEPTABLE">Acceptable</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Categories</label>
                <select
                  multiple
                  className="form-control"
                  value={bookForm.categoryIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                    setBookForm({...bookForm, categoryIds: selected});
                  }}
                  style={{ height: '100px' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={bookForm.isRare}
                    onChange={(e) => setBookForm({...bookForm, isRare: e.target.checked})}
                  /> Mark as Rare Book
                </label>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBookModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <h3 className="card-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
