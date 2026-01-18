import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'ADMINISTRATOR' || user.role === 'MANAGER') {
        navigate('/inventory');
      } else {
        navigate('/books');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="card">
          <h2 className="card-title text-center">Login</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-center mt-20">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>

          <div className="mt-20" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
              <strong>Test Accounts:</strong>
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
              Admin: admin@bookstore.com / Admin@123
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '5px' }}>
              Manager: manager@bookstore.com / Manager@123
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              Customer: customer@example.com / Customer@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
