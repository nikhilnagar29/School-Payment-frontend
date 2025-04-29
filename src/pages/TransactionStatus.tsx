import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';

interface TransactionDetails {
  custom_order_id: string;
  status: string;
  payment_time: string;
  payment_mode: string;
  transaction_amount: number;
  payment_message: string;
  error_message: string | null;
  bank_reference: string;
}

const TransactionStatus = () => {
  const { custom_order_id } = useParams<{ custom_order_id: string }>();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      if (!custom_order_id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await transactionsAPI.checkTransactionStatus(custom_order_id);
        setTransaction(response.data.transaction);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch transaction status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionStatus();
  }, [custom_order_id]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Fetching transaction status...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction Status
      </Typography>
      
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Box sx={{ mt: 2 }}>
            <Button 
              component={Link} 
              to="/transactions/check-status"
              variant="outlined"
              size="small"
            >
              Try Another ID
            </Button>
          </Box>
        </Alert>
      ) : !transaction ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Transaction not found or invalid Order ID.
          <Box sx={{ mt: 2 }}>
            <Button 
              component={Link} 
              to="/transactions/check-status"
              variant="outlined"
              size="small"
            >
              Try Another ID
            </Button>
          </Box>
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Order: {transaction.custom_order_id}
            </Typography>
            <Chip 
              label={transaction.status.toUpperCase()} 
              sx={{ 
                backgroundColor: getStatusColor(transaction.status),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Amount</Typography>
              <Typography variant="body1">₹{transaction.transaction_amount.toLocaleString()}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Payment Method</Typography>
              <Typography variant="body1">{transaction.payment_mode || 'N/A'}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Payment Time</Typography>
              <Typography variant="body1">{formatDate(transaction.payment_time)}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">Reference ID</Typography>
              <Typography variant="body1">{transaction.bank_reference || 'N/A'}</Typography>
            </Grid>
            
            {transaction.payment_message && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Payment Message</Typography>
                <Typography variant="body1">{transaction.payment_message}</Typography>
              </Grid>
            )}
            
            {transaction.error_message && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {transaction.error_message}
                </Alert>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              component={Link} 
              to="/transactions/check-status"
              variant="outlined"
            >
              Check Another Transaction
            </Button>
            
            <Button 
              component={Link} 
              to="/dashboard"
              variant="contained"
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default TransactionStatus; 