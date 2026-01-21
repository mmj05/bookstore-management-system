import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import ManageOrders from './pages/ManageOrders';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Profile from './pages/Profile';

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <div>
      <Navbar />
      <main style={{ paddingBottom: '40px' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          
          {/* Customer routes */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Orders />
              </ProtectedRoute>
            } 
          />
          
          {/* Manager/Admin routes */}
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMINISTRATOR']}>
                <Inventory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-orders" 
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMINISTRATOR']}>
                <ManageOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMINISTRATOR']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin only routes */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          {/* Authenticated user routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;