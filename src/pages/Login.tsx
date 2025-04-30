import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert 
} from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check if token exists in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Effect to handle navigation after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Use a small delay to ensure state updates complete
      const navigationTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
      
      return () => clearTimeout(navigationTimer);
    }
  }, [isAuthenticated, navigate, from]);

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

      // Make API call to backend
      console.log("Making API call to:", `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`);
      const response = await authAPI.login(email, password);

      console.log("Login response:", response.data);

      // Check if response has the expected structure
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data securely
      await localStorage.setItem('token', response.data.token);
      if(response.data.user){
        await localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Clear sensitive data
      setEmail('');
      setPassword('');
      
      // Set authenticated state to trigger navigation effect
      setIsAuthenticated(true);
      
      console.log("Authentication successful, redirecting to:", from);
      
      // Direct navigation attempt (backup)
      navigate(from, { replace: true });
      
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

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            School Payment & Dashboard
          </Typography>
          <Typography component="h2" variant="h6" align="center" sx={{ mb: 3 }}>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            noValidate 
            sx={{ mt: 1 }}
            autoComplete="off"
          >
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
              disabled={loading}
              error={!!error && !email}
              helperText={!!error && !email ? 'Email is required' : ''}
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
              disabled={loading}
              error={!!error && !password}
              helperText={!!error && !password ? 'Password is required' : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link to="/register">
                <Typography variant="body2">
                  Don't have an account? Register
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 