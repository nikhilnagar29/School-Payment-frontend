import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Grid
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Layout from '../components/Layout';

const CheckStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!orderId.trim()) {
      setError('Please enter a valid Order ID');
      return;
    }
    
    // Clear error if any
    setError(null);
    
    // Navigate to transaction status page with the order ID
    navigate(`/transactions/status/${orderId.trim()}`);
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Check Transaction Status
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Enter your order ID to check the status of your transaction.
          </Typography>
        </Box>
        
        <Paper sx={{ p: 4, mb: 4 }} elevation={2} className="bg-white dark:bg-gray-800">
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Order ID"
                  placeholder="Enter your order ID"
                  variant="outlined"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  autoFocus
                  InputProps={{
                    className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }}
                  InputLabelProps={{
                    className: "text-gray-600 dark:text-gray-400"
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ height: '56px' }}
                  startIcon={<SearchIcon />}
                  className="bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600"
                >
                  Check Status
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 4 }} elevation={2} className="bg-white dark:bg-gray-800">
          <Typography variant="h6" gutterBottom>
            How to find your Order ID
          </Typography>
          <Typography variant="body2" paragraph>
            Your Order ID is a unique identifier for your transaction. You can find it in:
          </Typography>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>The confirmation email sent to you after payment</li>
            <li>Your payment receipt</li>
            <li>Your account transaction history</li>
          </ul>
          
        </Paper>
      </Container>
    </Layout>
  );
};

export default CheckStatus; 