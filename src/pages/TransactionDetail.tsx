import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';

interface TransactionDetail {
  id: string;
  collect_id: string;
  school_id: string;
  gateway: string;
  student_info: {
    names: string;
    id: string;
    email: string;
  };
  order_amount: number;
  transaction_amount: number;
  status: string;
  custom_order_id: string;
  payment_mode: string;
  payment_time: string;
  payment_details?: string;
  bank_reference?: string;
  payment_message?: string;
  error_message?: string | null;
  payment_link?: string;
}

// Mock transaction data for development
const createMockTransactionDetail = (transactionId: string | undefined): TransactionDetail => {
  return {
    id: transactionId || "mock-transaction-id",
    collect_id: "mock-collect-id",
    school_id: "65b0e6293e9f76a9694d84b4",
    gateway: "GooglePay",
    student_info: {
      names: "Student Demo",
      id: "STU-001",
      email: "student@example.com"
    },
    order_amount: 30085,
    transaction_amount: 30085,
    status: "success",
    custom_order_id: "ORD-1745981387276-17",
    payment_mode: "NetBanking",
    payment_time: new Date().toISOString(),
    payment_details: "NetBanking transaction",
    bank_reference: "jzigopug5q",
    payment_message: "Payment successful",
    error_message: null,
    payment_link: "https://pay.example.com/ORD-1745981387276-17"
  };
};

const TransactionDetail = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      setLoading(true);
      setError(null);

      if (useMockData) {
        // Use mock data for development
        setTimeout(() => {
          setTransaction(createMockTransactionDetail(transactionId));
          setLoading(false);
        }, 800);
        return;
      }

      try {
        if (!transactionId) {
          throw new Error("Transaction ID is required");
        }

        const response = await transactionsAPI.getTransactionById(transactionId);
        console.log("Transaction detail response:", response.data);
        
        setTransaction(response.data);
      } catch (err: any) {
        console.error("Error fetching transaction details:", err);
        
        if (err.message === 'Network Error') {
          setError('Network error: Cannot connect to the backend server. Using mock data instead.');
          setUseMockData(true);
          setTransaction(createMockTransactionDetail(transactionId));
        } else {
          setError(`Error: ${err.response?.data?.error || err.message || 'Failed to load transaction details'}`);
          // Still show mock data in development
          if (process.env.NODE_ENV === 'development') {
            setTransaction(createMockTransactionDetail(transactionId));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [transactionId, useMockData]);

  // Toggle between real and mock data
  const handleToggleMockData = () => {
    setUseMockData(!useMockData);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return { bg: '#e8f5e9', text: '#1b5e20' };
      case 'pending':
        return { bg: '#fff8e1', text: '#f57f17' };
      case 'failed':
        return { bg: '#ffebee', text: '#c62828' };
      default:
        return { bg: '#f5f5f5', text: '#757575' };
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 2 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
        </Box>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map(item => (
              <Grid item xs={12} sm={6} key={item}>
                <Skeleton variant="text" width="50%" height={20} />
                <Skeleton variant="text" width="70%" height={30} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (error && !transaction) {
    return (
      <Container maxWidth="md">
        <Alert 
          severity="error" 
          sx={{ mt: 4 }}
          action={
            <Button color="inherit" size="small" onClick={handleToggleMockData}>
              {useMockData ? 'Try API' : 'Use Mock Data'}
            </Button>
          }
        >
          {error}
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            component={Link} 
            to="/transactions"
            variant="outlined"
          >
            Back to Transactions
          </Button>
        </Box>
      </Container>
    );
  }

  // Render no data state
  if (!transaction) {
    return (
      <Container maxWidth="md">
        <Alert severity="info" sx={{ mt: 4 }}>
          No transaction data found. The transaction may have been deleted or may not exist.
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            component={Link} 
            to="/transactions"
            variant="outlined"
          >
            Back to Transactions
          </Button>
        </Box>
      </Container>
    );
  }

  // Get status colors
  const statusColors = getStatusColor(transaction.status);

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 3, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transaction Details
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {transaction.custom_order_id}
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleToggleMockData}>
              {useMockData ? 'Try API' : 'Use Mock Data'}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Status Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={transaction.status.toUpperCase()}
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                py: 2.5,
                px: 1.5,
                backgroundColor: statusColors.bg,
                color: statusColors.text
              }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
            {formatCurrency(transaction.transaction_amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {formatDate(transaction.payment_time)}
          </Typography>
          
          {transaction.payment_message && (
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2,
                color: statusColors.text,
                fontWeight: 'medium'
              }}
            >
              {transaction.payment_message}
            </Typography>
          )}
          
          {transaction.error_message && (
            <Typography 
              variant="body2" 
              color="error" 
              sx={{ mt: 1 }}
            >
              {transaction.error_message}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Transaction ID</TableCell>
                <TableCell>{transaction.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell>{transaction.custom_order_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Gateway</TableCell>
                <TableCell>{transaction.gateway}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Mode</TableCell>
                <TableCell>{transaction.payment_mode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Bank Reference</TableCell>
                <TableCell>{transaction.bank_reference || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Details</TableCell>
                <TableCell>{transaction.payment_details || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>School ID</TableCell>
                <TableCell>{transaction.school_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Collection ID</TableCell>
                <TableCell>{transaction.collect_id}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Student Details */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Student Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Name</TableCell>
                <TableCell>{transaction.student_info?.names || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                <TableCell>{transaction.student_info?.id || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell>{transaction.student_info?.email || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Link */}
      {transaction.payment_link && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Payment Link
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {transaction.payment_link}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            component="a"
            href={transaction.payment_link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mt: 1 }}
          >
            Open Payment Link
          </Button>
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 5 }}>
        <Button 
          variant="outlined" 
          component={Link}
          to={`/school/${transaction.school_id}/transactions`}
        >
          School Transactions
        </Button>
        
        <Button 
          variant="contained" 
          component={Link}
          to="/transactions"
        >
          All Transactions
        </Button>
      </Box>
    </Container>
  );
};

export default TransactionDetail; 