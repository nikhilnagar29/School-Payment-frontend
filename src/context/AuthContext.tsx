import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const initialContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  error: null,
  clearError: () => {}
};

export const AuthContext = createContext<AuthContextType>(initialContext);

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any auth errors
  const clearError = () => setError(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        try {
          // Set the auth token header
          const token = localStorage.getItem('token');
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }

          // Try to get user data from local storage first
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            } catch (parseErr) {
              console.error("Error parsing stored user data:", parseErr);
            }
          }
          
          // Try to get user data from API (in background)
          try {
            // Get current user data
            const res = await axios.get('/api/auth/me');
            setUser(res.data.data);
            setIsAuthenticated(true);
          } catch (apiErr) {
            console.warn("Could not verify user with API, using cached data");
          }
        } catch (err) {
          console.error("Auth check error:", err);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setError('Authentication failed. Please login again.');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Try with mock data first (for development)
      if (process.env.NODE_ENV === 'development' && email === 'test@example.com') {
        console.log("Using mock login for development");
        const mockUser = { name: 'Test User', email: 'test@example.com', id: '123' };
        localStorage.setItem('token', 'mock-token-123');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        return;
      }
      
      // Make the API call
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response from server');
      }
      
      const { token } = res.data;
      
      // Save token and set headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Save user data if available
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        // Try to get user data
        try {
          const userRes = await axios.get('/api/auth/me');
          setUser(userRes.data.data);
          localStorage.setItem('user', JSON.stringify(userRes.data.data));
        } catch (userErr) {
          console.error("Could not fetch user data after login:", userErr);
        }
      }
      
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      throw new Error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout, 
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 