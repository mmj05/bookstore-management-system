import axios from 'axios';

// API Base URL Configuration
// Option 1: Use environment variable (recommended for flexibility)
// Option 2: Hardcode your Render URL after deployment
// 
// For local development with local backend: '/api' (uses Vite proxy)
// For connecting to Render: 'https://bookstore-api-xxxx.onrender.com/api'

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
};

// Books API
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (keyword, params) => api.get('/books/search', { params: { keyword, ...params } }),
  getByCategory: (categoryId, params) => api.get(`/books/category/${categoryId}`, { params }),
  filter: (params) => api.get('/books/filter', { params }),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  updateQuantity: (id, quantity) => api.patch(`/books/${id}/quantity`, null, { params: { quantity } }),
  delete: (id) => api.delete(`/books/${id}`),
  getLowStock: (threshold = 5) => api.get('/books/low-stock', { params: { threshold } }),
  getOutOfStock: () => api.get('/books/out-of-stock'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (bookId, quantity) => api.post('/cart/items', { bookId, quantity }),
  updateQuantity: (bookId, quantity) => api.put(`/cart/items/${bookId}`, null, { params: { quantity } }),
  removeItem: (bookId) => api.delete(`/cart/items/${bookId}`),
  clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  checkout: (data) => api.post('/orders/checkout', data),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  // Manager endpoints
  getAll: (params) => api.get('/orders/all', { params }),
  getByStatus: (status, params) => api.get(`/orders/status/${status}`, { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Users API (Admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  search: (query) => api.get('/users/search', { params: { query } }),
  create: (data) => api.post('/users', data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, null, { params: { role } }),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  unlock: (id) => api.post(`/users/${id}/unlock`),
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', null, { params: data }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/users/me/change-password', null, { params: { currentPassword, newPassword } }),
};

// Reports API (Manager/Admin)
export const reportsAPI = {
  getInventoryReport: () => api.get('/reports/inventory'),
  getSalesReport: (startDate, endDate) => 
    api.get('/reports/sales', { params: { startDate, endDate } }),
  getDailySalesReport: () => api.get('/reports/sales/daily'),
};

export default api;