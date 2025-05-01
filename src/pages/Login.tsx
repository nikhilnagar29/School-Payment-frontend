import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import DarkModeToggle from '../components/DarkModeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login, isAuthenticated, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Monitor authentication state and redirect when authenticated
  useEffect(() => {
    if (isAuthenticated || loginSuccess) {
      console.log("Authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loginSuccess, navigate, from]);

  // Show auth context errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Input validation
      if (!email.trim() || !password.trim()) {
        throw new Error('Please fill in all fields');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Try using the auth context login first
      try {
        await login(email, password);
        setLoginSuccess(true);
        return; // Exit if login was successful
      } catch (authErr) {
        console.log("Auth context login failed, trying direct API call");
      }

      // Fallback to direct API call if auth context login fails
      console.log("Making direct API call to login");
      const response = await axios.post('/api/auth/login', { email, password });

      console.log("Login response:", response.data);

      // Check if response has the expected structure
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data securely
      localStorage.setItem('token', response.data.token);
      if(response.data.user){
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Clear sensitive data
      setEmail('');
      setPassword('');
      
      // Force navigation 
      setLoginSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle different types of errors
      if (err.response) {
        // Backend error response
        console.error("Backend error:", err.response.data);
        setError(err.response.data?.error || 'Login failed. Please check your credentials.');
      } else if (err.request) {
        // Network error
        console.error("Network error:", err.request);
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        // Client-side error
        console.error("Client error:", err.message);
        setError(err.message || 'An unexpected error occurred.');
      }
      
      // Clear password field on error
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const useDemoAccount = () => {
    setEmail('trustee4@kv.com');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Dark mode toggle in the top right */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 transition-colors duration-200">
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            className="text-gray-900 dark:text-gray-100 font-semibold"
          >
            School Payment & Dashboard
          </Typography>
          
          <Typography 
            component="h2" 
            variant="h6" 
            align="center" 
            className="mb-6 text-gray-800 dark:text-gray-200"
          >
            Login
          </Typography>
          
          {error && (
            <div className="mb-4">
              <Alert 
                severity="error" 
                className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
              >
                {error}
              </Alert>
            </div>
          )}
          
          {loginSuccess && (
            <div className="mb-4">
              <Alert 
                severity="success" 
                className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
              >
                Login successful! Redirecting...
              </Alert>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || loginSuccess}
              error={!!error && !email}
              helperText={!!error && !email ? 'Email is required' : ''}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || loginSuccess}
              error={!!error && !password}
              helperText={!!error && !password ? 'Password is required' : ''}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="mt-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-200"
              disabled={loading || loginSuccess}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            
            <Divider className="my-4 dark:border-gray-700">
              <Typography variant="body2" className="px-2 text-gray-500 dark:text-gray-400">
                OR
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={useDemoAccount}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
              disabled={loading || loginSuccess}
            >
              Use Demo Account
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link 
              to="/register" 
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm transition-colors duration-200"
            >
              Don't have an account? Register
            </Link>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} School Payment System</p>
            <p>All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 