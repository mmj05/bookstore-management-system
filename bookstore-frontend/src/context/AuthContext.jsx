import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, setAuthLogoutHandler } from '../services/api';

const AuthContext = createContext(null);

// Helper function to decode JWT and get expiration time
function getTokenExpiration(token) {
  try {
    // JWT is base64 encoded: header.payload.signature
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token) {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  // Add 10 second buffer to prevent edge cases
  return Date.now() >= expiration - 10000;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const logoutTimerRef = useRef(null);

  // Clear logout timer
  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Logout function
  const logout = useCallback((isSessionExpiry = false) => {
    clearLogoutTimer();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    
    if (isSessionExpiry) {
      setSessionExpired(true);
    }
  }, [clearLogoutTimer]);

  // Set up auto-logout timer based on token expiration
  const setupLogoutTimer = useCallback((token) => {
    clearLogoutTimer();
    
    const expiration = getTokenExpiration(token);
    if (!expiration) return;
    
    const timeUntilExpiry = expiration - Date.now();
    
    // Set timer to logout 30 seconds before actual expiry
    // This gives a buffer for any in-flight requests
    const logoutTime = Math.max(timeUntilExpiry - 30000, 0);
    
    if (logoutTime > 0) {
      logoutTimerRef.current = setTimeout(() => {
        console.log('Session expired - logging out automatically');
        logout(true);
      }, logoutTime);
    } else {
      // Token already expired or about to expire
      logout(true);
    }
  }, [clearLogoutTimer, logout]);

  // Register logout handler with API interceptor
  useEffect(() => {
    setAuthLogoutHandler(() => logout(true));
  }, [logout]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (storedUser && token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token is expired, clear everything
          console.log('Token expired on load - clearing session');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setSessionExpired(true);
        } else {
          // Token is valid, restore user and set up timer
          setUser(JSON.parse(storedUser));
          setupLogoutTimer(token);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Cleanup timer on unmount
    return () => clearLogoutTimer();
  }, [setupLogoutTimer, clearLogoutTimer]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { accessToken, refreshToken, user: userData } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setSessionExpired(false);
    
    // Set up auto-logout timer
    setupLogoutTimer(accessToken);
    
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { accessToken, refreshToken, user: userData } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setSessionExpired(false);
    
    // Set up auto-logout timer
    setupLogoutTimer(accessToken);
    
    return userData;
  };

  // Clear session expired message
  const clearSessionExpired = () => setSessionExpired(false);

  const isAuthenticated = () => !!user;
  
  const isAdmin = () => user?.role === 'ADMINISTRATOR';
  
  const isManager = () => user?.role === 'MANAGER' || user?.role === 'ADMINISTRATOR';
  
  const isCustomer = () => user?.role === 'CUSTOMER';

  const value = {
    user,
    loading,
    login,
    register,
    logout: () => logout(false),
    isAuthenticated,
    isAdmin,
    isManager,
    isCustomer,
    sessionExpired,
    clearSessionExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}