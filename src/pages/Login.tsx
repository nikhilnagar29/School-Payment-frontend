import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';

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
          
          {loginSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Login successful! Redirecting...
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
              disabled={loading || loginSuccess}
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
              disabled={loading || loginSuccess}
              error={!!error && !password}
              helperText={!!error && !password ? 'Password is required' : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || loginSuccess || !email || !password}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : loginSuccess ? (
                'Signed In'
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>or</Divider>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Demo Account:</strong><br />
                Email: trustee4@kv.com<br />
                Password: password
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={useDemoAccount} 
                sx={{ mt: 1 }}
                fullWidth
              >
                Use Demo Account
              </Button>
            </Alert>
            
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