import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as FailedIcon,
  Pending as PendingIcon,
  HomeOutlined as HomeIcon
} from '@mui/icons-material';
import { transactionsAPI } from '../services/api';
import Layout from '../components/Layout';

// Define status color and icon mapping
const statusConfig: Record<string, { color: "success" | "error" | "warning" | "default", icon: JSX.Element }> = {
  success: { color: "success", icon: <SuccessIcon /> },
  failed: { color: "error", icon: <FailedIcon /> },
  pending: { color: "warning", icon: <PendingIcon /> },
  default: { color: "default", icon: <PendingIcon /> }
};

const TransactionStatus = () => {
  // Get the order ID from the URL params
  const { id: customOrderId } = useParams<{ id: string }>();
  
  // State variables
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction status on component mount
  useEffect(() => {
    const fetchTransactionStatus = async () => {
      try {
        if (!customOrderId) {
          setError('Order ID is required');
          setLoading(false);
          return;
        }

        console.log(`Fetching status for order ID: ${customOrderId}`);
        const response = await transactionsAPI.checkTransactionStatus(customOrderId);
        console.log('Transaction status response:', response);
        
        if (response && response.data) {
          setTransactionDetails(response.data);
        } else {
          setError('No transaction found for this order ID');
        }
      } catch (err: any) {
        console.error('Error fetching transaction status:', err);
        setError(err.message || 'Failed to fetch transaction status');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionStatus();
  }, [customOrderId]);

  // Format amount to display with currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status configuration based on transaction status
  const getStatusConfig = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    return statusConfig[lowerStatus] || statusConfig.default;
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Transaction Status
          </Typography>
          <Button
            component={Link}
            to="/check-status"
            startIcon={<HomeIcon />}
            variant="outlined"
          >
            Check Another
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : transactionDetails ? (
          <Paper sx={{ p: 4 }} elevation={2} className="bg-white dark:bg-gray-800">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Order ID: {transactionDetails.custom_order_id}
              </Typography>
              {transactionDetails.status && (
                <Chip
                  label={transactionDetails.status.toUpperCase()}
                  color={getStatusConfig(transactionDetails.status).color}
                  icon={getStatusConfig(transactionDetails.status).icon}
                  size="medium"
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {transactionDetails.transaction_amount ? formatAmount(transactionDetails.transaction_amount) : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Time
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {transactionDetails.payment_time ? formatDate(transactionDetails.payment_time) : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Mode
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {transactionDetails.payment_mode || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bank Reference
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {transactionDetails.bank_reference || 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {transactionDetails.payment_message && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {transactionDetails.payment_message}
              </Alert>
            )}

            {transactionDetails.error_message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {transactionDetails.error_message}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                component={Link}
                to="/check-status"
                variant="outlined"
              >
                Check Another Transaction
              </Button>
              
              {transactionDetails.status === 'pending' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Status
                </Button>
              )}
            </Box>
          </Paper>
        ) : (
          <Alert severity="info">
            No transaction information available for this order ID. Please check if the order ID is correct.
          </Alert>
        )}
      </Container>
    </Layout>
  );
};

export default TransactionStatus; 