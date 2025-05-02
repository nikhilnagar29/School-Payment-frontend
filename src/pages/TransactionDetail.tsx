import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import {
  Typography,
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
import DarkModeToggle from '../components/DarkModeToggle';

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
  const { id } = useParams<{ id: string }>();
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
          setTransaction(createMockTransactionDetail(id));
          setLoading(false);
        }, 800);
        return;
      }

      try {
        if (!id || id === ':id' || id === 'undefined') {
          setError("Transaction ID is missing or invalid");
          console.error("Transaction ID is missing or invalid:", id);
          return;
        }

        console.log("Fetching transaction with ID:", id);
        const response = await transactionsAPI.getTransactionById(id);
        console.log("Transaction detail response:", response.data);
        
        setTransaction(response.data);
      } catch (err: any) {
        console.error("Error fetching transaction details:", err);
        
        if (err.message === 'Network Error') {
          setError('Network error: Cannot connect to the backend server. Using mock data instead.');
          setUseMockData(true);
          setTransaction(createMockTransactionDetail(id));
        } else {
          setError(`Error: ${err.response?.data?.error || err.message || 'Failed to load transaction details'}`);
          // Still show mock data in development
          if (process.env.NODE_ENV === 'development') {
            setTransaction(createMockTransactionDetail(id));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [id, useMockData]);

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

  // Get status color for dark and light modes
  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return { 
          bg: 'bg-green-100 dark:bg-green-800',
          text: 'text-green-800 dark:text-green-100'
        };
      case 'pending':
        return { 
          bg: 'bg-yellow-100 dark:bg-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-100'
        };
      case 'failed':
        return { 
          bg: 'bg-red-100 dark:bg-red-800',
          text: 'text-red-800 dark:text-red-100'
        };
      default:
        return { 
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-800 dark:text-gray-300'
        };
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-4 m-[-10px] rounded-lg bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        
        <div className="max-w-3xl mx-auto mt-8 mb-4">
          <Skeleton 
            variant="text" 
            width="60%" 
            height={40} 
            className="bg-gray-200 dark:bg-gray-700" 
          />
          <Skeleton 
            variant="text" 
            width="40%" 
            height={30} 
            className="mb-4 bg-gray-200 dark:bg-gray-700" 
          />
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map(item => (
                <Grid item xs={12} sm={6} key={item}>
                  <Skeleton 
                    variant="text" 
                    width="50%" 
                    height={20} 
                    className="bg-gray-200 dark:bg-gray-700" 
                  />
                  <Skeleton 
                    variant="text" 
                    width="70%" 
                    height={30} 
                    className="bg-gray-200 dark:bg-gray-700" 
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !transaction) {
    return (
      <div className="p-4 m-[-10px] rounded-lg bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        
        <div className="max-w-3xl mx-auto mt-8">
          <Alert 
            severity="error" 
            className="mt-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleToggleMockData}
                className="text-inherit"
              >
                {useMockData ? 'Try API' : 'Use Mock Data'}
              </Button>
            }
          >
            {error}
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button 
              component={Link} 
              to="/transactions"
              variant="outlined"
              className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
            >
              Back to Transactions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render no data state
  if (!transaction) {
    return (
      <div className="p-4 m-[-10px] rounded-lg bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>
        
        <div className="max-w-3xl mx-auto mt-8">
          <Alert severity="info" className="mt-4 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100">
            No transaction data found. The transaction may have been deleted or may not exist.
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button 
              component={Link} 
              to="/transactions"
              variant="outlined"
              className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
            >
              Back to Transactions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get status colors
  const statusColors = getStatusColors(transaction.status);

  return (
    <div className="p-4 m-[-10px] rounded-lg bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 mt-8">
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            className="text-gray-900 dark:text-gray-100 font-semibold"
          >
            Transaction Details
          </Typography>
          <Typography 
            variant="subtitle1" 
            className="text-gray-600 dark:text-gray-400"
          >
            {transaction.custom_order_id}
          </Typography>
        </div>

        {error && (
          <div className="mb-6">
            <Alert 
              severity="warning" 
              className="bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-100"
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleToggleMockData}
                  className="text-inherit"
                >
                  {useMockData ? 'Try API' : 'Use Mock Data'}
                </Button>
              }
            >
              {error}
            </Alert>
          </div>
        )}

        {/* Status Card */}
        <Card className="mb-6 rounded-lg shadow-md bg-white dark:bg-gray-800 transition-colors duration-200">
          <CardContent className="text-center py-6">
            <div className="mb-4">
              <Chip 
                label={transaction.status.toUpperCase()}
                className={`text-base font-bold py-2.5 px-3 ${statusColors.bg} ${statusColors.text}`}
              />
            </div>
            <Typography 
              variant="h5" 
              className="font-medium text-gray-900 dark:text-gray-100"
            >
              {formatCurrency(transaction.transaction_amount)}
            </Typography>
            <Typography 
              variant="body2" 
              className="mt-2 text-gray-500 dark:text-gray-400"
            >
              {formatDate(transaction.payment_time)}
            </Typography>
            
            {transaction.payment_message && (
              <Typography 
                variant="body1" 
                className={`mt-4 font-medium ${statusColors.text}`}
              >
                {transaction.payment_message}
              </Typography>
            )}
            
            {transaction.error_message && (
              <Typography 
                variant="body2" 
                className="mt-2 text-red-600 dark:text-red-400"
              >
                {transaction.error_message}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
          <Typography 
            variant="h6" 
            gutterBottom
            className="text-gray-800 dark:text-gray-200"
          >
            Transaction Information
          </Typography>
          <Divider className="mb-4 bg-gray-200 dark:bg-gray-700" />
          
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold w-2/5 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Transaction ID</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.id}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Order ID</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.custom_order_id}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Payment Gateway</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.gateway}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Payment Mode</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.payment_mode}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Bank Reference</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.bank_reference || 'N/A'}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Payment Details</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.payment_details || 'N/A'}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">School ID</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.school_id}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Collection ID</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.collect_id}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Student Details */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
          <Typography 
            variant="h6" 
            gutterBottom
            className="text-gray-800 dark:text-gray-200"
          >
            Student Information
          </Typography>
          <Divider className="mb-4 bg-gray-200 dark:bg-gray-700" />
          
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold w-2/5 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Name</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.student_info?.names || 'N/A'}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Student ID</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.student_info?.id || 'N/A'}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableCell className="font-bold text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">Email</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{transaction.student_info?.email || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Payment Link */}
        {transaction.payment_link && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
            <Typography 
              variant="h6" 
              gutterBottom
              className="text-gray-800 dark:text-gray-200"
            >
              Payment Link
            </Typography>
            <Divider className="mb-4 bg-gray-200 dark:bg-gray-700" />
            
            <div className="mt-4 mb-2">
              <div className='text-wrap'>
                <Typography 
                  variant="body2" 
                  className='text-wrap text-gray-700 dark:text-gray-300'
                  sx={{ wordBreak: 'break-all' }}
                >
                  {transaction.payment_link.substring(0, 75)}...
                </Typography>
              </div>
            </div>
            
            <Button 
              variant="outlined" 
              component="a"
              href={transaction.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
            >
              Open Payment Link
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8 mb-10">
          <Button 
            variant="outlined" 
            component={Link}
            to={`/school/${transaction.school_id}/transactions`}
            className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
          >
            School Transactions
          </Button>
          
          <Button 
            variant="contained" 
            component={Link}
            to="/transactions"
            className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
          >
            All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail; 