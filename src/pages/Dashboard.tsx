import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsAPI, isDevelopment } from '../services/api';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';

interface Transaction {
  _id: string;
  collect_id: string;
  school_id: string;
  status: string;
  order_amount: number;
  transaction_amount: number;
  payment_mode: string;
  payment_time: string;
  custom_order_id: string;
  student_info?: {
    names: string;
    id: string;
    email: string;
  };
}

interface TransactionSummary {
  status: string;
  count: number;
  totalAmount: number;
  percentage: string;
}

interface SummaryTotals {
  totalTransactions: number;
  totalAmount: number;
  successRate: string;
}

interface ApiResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
}

// Add interface for the new API response format
interface ApiSummaryResponse {
  stats: {
    success: { count: number; amount: number };
    pending: { count: number; amount: number };
    failed: { count: number; amount: number };
    [key: string]: { count: number; amount: number };
  };
  totals: {
    transactions: number;
    amount: number;
  };
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary[]>([]);
  const [totals, setTotals] = useState<SummaryTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  
  // Pagination and filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || '';
  
  // Update URL when filters change
  const updateFilters = (newFilters: Record<string, any>) => {
    const updatedParams: Record<string, string> = { 
      page: page.toString(), 
      limit: limit.toString()
    };
    
    if (status) {
      updatedParams.status = status;
    }
    
    // Update with new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updatedParams[key] = value.toString();
      } else {
        delete updatedParams[key];
      }
    });
    
    setSearchParams(updatedParams);
  };

  // Calculate summary data from transactions
  const calculateSummary = (data: Transaction[] | ApiSummaryResponse) => {
    // Check if data is in the new API format with stats and totals
    if (data && 'stats' in data && 'totals' in data) {
      const apiData = data as ApiSummaryResponse;
      const summaryData: TransactionSummary[] = [];
      
      // Convert API stats to our summary format
      Object.entries(apiData.stats).forEach(([status, statData]) => {
        const percentage = apiData.totals.transactions > 0
          ? ((statData.count / apiData.totals.transactions) * 100).toFixed(2)
          : '0.00';
          
        summaryData.push({
          status,
          count: statData.count,
          totalAmount: statData.amount,
          percentage
        });
      });
      
      // Calculate success rate
      const successCount = apiData.stats.success?.count || 0;
      const successRate = apiData.totals.transactions > 0
        ? ((successCount / apiData.totals.transactions) * 100).toFixed(2)
        : '0.00';
        
      return {
        summary: summaryData,
        totals: {
          totalTransactions: apiData.totals.transactions,
          totalAmount: apiData.totals.amount,
          successRate
        }
      };
    }
    
    // Handle array of transactions (old format)
    const transactions = Array.isArray(data) ? data : [];
    const statusGroups: Record<string, { count: number; amount: number }> = {};
    let total = 0;
    let totalAmount = 0;
    
    // Group by status
    transactions.forEach(tx => {
      if (!statusGroups[tx.status]) {
        statusGroups[tx.status] = { count: 0, amount: 0 };
      }
      statusGroups[tx.status].count += 1;
      statusGroups[tx.status].amount += tx.transaction_amount || 0;
      total += 1;
      totalAmount += tx.transaction_amount || 0;
    });
    
    // Convert to summary format
    const summaryData: TransactionSummary[] = Object.entries(statusGroups).map(([status, data]) => ({
      status,
      count: data.count,
      totalAmount: data.amount,
      percentage: total > 0 ? ((data.count / total) * 100).toFixed(2) : '0.00'
    }));
    
    // Add success rate calculation
    const successCount = statusGroups['success']?.count || 0;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(2) : '0.00';
    
    return {
      summary: summaryData,
      totals: {
        totalTransactions: total,
        totalAmount,
        successRate
      }
    };
  };

  // Toggle between real and mock data (for development)
  const toggleMockData = () => {
    setUseMockData(!useMockData);
    // Refetch data with the new setting
    fetchData(page, limit, status, !useMockData);
  };

  // Unified fetch data function
  const fetchData = async (currentPage: number, pageLimit: number, statusFilter: string, useMock: boolean = useMockData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch transactions with current filters
      const params: Record<string, any> = { 
        page: currentPage + 1, // API uses 1-based pagination
        limit: pageLimit
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      let txResponse, summaryResponse;
      
      if (useMock) {
        // Use mock data
        txResponse = await transactionsAPI.getMockTransactions(params);
        summaryResponse = await transactionsAPI.getMockSummary();
      } else {
        // Fetch transactions and summary in parallel for efficiency
        [txResponse, summaryResponse] = await Promise.all([
          transactionsAPI.getAllTransactions(params),
          transactionsAPI.getTransactionSummary()
        ]);
      }
      
      // Process transaction data
      if (txResponse.data) {
        if (txResponse.data.transactions) {
          setTransactions(txResponse.data.transactions);
          setTotalCount(txResponse.data.pagination?.totalRecords || 0);
        } else if (txResponse.data.data && Array.isArray(txResponse.data.data)) {
          // Handle new API format with data array
          setTransactions(txResponse.data.data);
          setTotalCount(txResponse.data.pagination?.total || txResponse.data.data.length || 0);
        } else if (Array.isArray(txResponse.data)) {
          setTransactions(txResponse.data);
          setTotalCount(txResponse.data.length || 0);
        }
      }
      
      // Process summary data
      if (summaryResponse.data) {
        // Use formatSummaryResponse from transactionsAPI if it's in the new format with stats
        if (summaryResponse.data.stats) {
          const formatted = transactionsAPI.formatSummaryResponse(summaryResponse.data);
          setSummary(formatted.summary);
          setTotals(formatted.totals);
        } else if (summaryResponse.data.summary) {
          // Handle old format
          setSummary(summaryResponse.data.summary);
          setTotals(summaryResponse.data.totals);
        } else {
          // Calculate summary from transactions if format isn't recognized
          const calculatedData = calculateSummary(txResponse.data.transactions || txResponse.data.data || txResponse.data || []);
          setSummary(calculatedData.summary);
          setTotals(calculatedData.totals);
        }
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
      
      if (isDevelopment() && !useMock) {
        console.log('Switching to mock data after error');
        try {
          setUseMockData(true);
          const mockTxResponse = await transactionsAPI.getMockTransactions({ page: currentPage + 1, limit: pageLimit, status: statusFilter });
          const mockSummaryResponse = await transactionsAPI.getMockSummary();
          
          if (mockTxResponse.data && mockTxResponse.data.transactions) {
            setTransactions(mockTxResponse.data.transactions || []);
            setTotalCount(mockTxResponse.data.pagination?.totalRecords || 0);
          }
          
          // Process mock summary data safely
          if (mockSummaryResponse.data) {
            const formatted = transactionsAPI.formatSummaryResponse(mockSummaryResponse.data);
            setSummary(formatted.summary);
            setTotals(formatted.totals);
          }
          
          setError('Using mock data because API request failed. Connect your backend to see real data.');
        } catch (mockErr) {
          console.error('Mock data fallback failed:', mockErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchData(page, limit, status);
  }, [page, limit, status]);

  // Pagination handlers
  const handleChangePage = (_: any, newPage: number) => {
    updateFilters({ page: newPage });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ page: 0, limit: parseInt(event.target.value, 10) });
  };

  // Status filter handler
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ status: event.target.value, page: 0 });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '#e8f5e9';
      case 'pending':
        return '#fff8e1';
      case 'failed':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  // Safe number formatter to prevent errors with undefined
  const formatNumber = (num?: number) => {
    return num !== undefined ? num.toLocaleString() : '0';
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert 
          severity={useMockData ? "info" : "error"} 
          sx={{ mb: 2 }}
          action={
            isDevelopment() && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={toggleMockData}
              >
                {useMockData ? 'Try API' : 'Use Mock Data'}
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}
      
      {isDevelopment() && !error && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={toggleMockData}
          >
            {useMockData ? 'Using Mock Data' : 'Using API Data'}
          </Button>
        </Box>
      )}
      
      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Summary
        </Typography>
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Grid>
          ) : (
            <>
              {summary.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No transaction data available.</Alert>
                </Grid>
              ) : (
                summary.map((item) => (
                  <Grid item xs={12} sm={4} key={item.status}>
                    <Card sx={{ 
                      backgroundColor: getStatusColor(item.status),
                      boxShadow: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3
                      }
                    }}>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          {item.status.toUpperCase()}
                        </Typography>
                        <Typography variant="h5" component="div">
                          {item.count} Transactions
                        </Typography>
                        <Typography variant="body2">
                          Amount: ₹{formatNumber(item.totalAmount)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.percentage}% of total
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
              
              {totals && (
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: '#e3f2fd', boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        Total Transactions: {totals.totalTransactions}
                      </Typography>
                      <Typography variant="body1">
                        Total Amount: ₹{formatNumber(totals.totalAmount)}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        Success Rate: {totals.successRate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Status"
              value={status}
              onChange={handleStatusChange}
              fullWidth
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              color="primary"
              component="a"
              href="/payments/create"
              startIcon={<span>+</span>}
              sx={{ textTransform: 'none' }}
            >
              Create New Payment
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transactions Table */}
      <Paper sx={{ boxShadow: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Payment Mode</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading transactions...</Typography>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1">No transactions found</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Try adjusting your filters or create a new payment
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow 
                    key={transaction._id || transaction.collect_id} 
                    hover
                    sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                  >
                    <TableCell>{transaction.custom_order_id}</TableCell>
                    <TableCell>{transaction.student_info?.names || 'N/A'}</TableCell>
                    <TableCell>₹{formatNumber(transaction.order_amount)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          backgroundColor: getStatusColor(transaction.status),
                          fontWeight: 'medium'
                        }}
                      >
                        {transaction.status.toUpperCase()}
                      </Box>
                    </TableCell>
                    <TableCell>{transaction.payment_mode || 'N/A'}</TableCell>
                    <TableCell>{formatDate(transaction.payment_time)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows:"
        />
      </Paper>
    </Container>
  );
};

export default Dashboard; 