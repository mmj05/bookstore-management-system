import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();

  // Clear session expired message when component unmounts or user starts typing
  useEffect(() => {
    return () => {
      if (sessionExpired) {
        clearSessionExpired();
      }
    };
  }, [sessionExpired, clearSessionExpired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    clearSessionExpired();
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
    <div style={{
      minHeight: 'calc(100vh - 130px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px 60px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Session Expired Alert */}
        {sessionExpired && (
          <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Your session has expired. Please sign in again to continue.
          </div>
        )}

        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(201, 160, 64, 0.3)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h1 style={{ 
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.6rem',
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Blackwood Rare Books
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <p className="text-center mt-20" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Create one</Link>
          </p>
        </div>

        {/* Test Accounts Info */}
        <div style={{ 
          marginTop: '24px',
          padding: '20px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)', 
              color: 'var(--text-inverse)', 
              padding: '4px 10px', 
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              DEMO
            </span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Test Accounts
            </span>
          </div>
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Admin:</span>
              <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', color: 'var(--gold)' }}>
                admin@bookstore.com / Admin@123
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Manager:</span>
              <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', color: 'var(--gold)' }}>
                manager@bookstore.com / Manager@123
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Customer:</span>
              <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', color: 'var(--gold)' }}>
                customer@example.com / Customer@123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
