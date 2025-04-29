import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert
} from '@mui/material';

const CheckStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }
    
    // Navigate to the transaction status page with the entered order ID
    navigate(`/transactions/status/${orderId}`);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Check Transaction Status
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="body1" paragraph>
            Enter the order ID to check the transaction status.
          </Typography>
          
          <TextField
            fullWidth
            label="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Check Status
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CheckStatus; 