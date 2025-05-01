import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { transactionsAPI, isDevelopment } from '../services/api';
import {
  Typography,
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
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent
} from '@mui/material';
import DarkModeToggle from '../components/DarkModeToggle';

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
  const navigate = useNavigate();
  
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

  // Handle navigation to transaction details
  const handleRowClick = (transaction: Transaction) => {
    if (transaction._id) {
      navigate(`/transactions/${transaction._id}`);
    } else if (transaction.collect_id) {
      // Use collect_id as fallback if _id is not available
      navigate(`/transactions/${transaction.collect_id}`);
    } else {
      console.error('Transaction ID not found:', transaction);
      // Show a small error message if needed
    }
  };

  return (
    <div className="p-4 m-[-10px] rounded-lg bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      
      <div className="max-w-7xl mx-auto">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          className="text-gray-900 dark:text-gray-100 font-semibold"
        >
          Dashboard
        </Typography>
        
        {error && (
          <div className="mb-4">
            <Alert 
              severity={useMockData ? "info" : "error"} 
              className={`mb-4 ${useMockData ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100' : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100'}`}
              action={
                isDevelopment() && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={toggleMockData}
                    className="text-inherit"
                  >
                    {useMockData ? 'Try API' : 'Use Mock Data'}
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          </div>
        )}
        
        {isDevelopment() && !error && (
          <div className="mb-4 flex justify-end">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={toggleMockData}
              className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
            >
              {useMockData ? 'Using Mock Data' : 'Using API Data'}
            </Button>
          </div>
        )}
        
        {/* Summary Cards */}
        <div className="mb-8">
          <Typography 
            variant="h6" 
            gutterBottom
            className="text-gray-800 dark:text-gray-200"
          >
            Transaction Summary
          </Typography>
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12} className="flex justify-center py-8">
                <CircularProgress className="text-primary-600 dark:text-primary-400" />
              </Grid>
            ) : (
              <>
                {summary.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100">
                      No transaction data available.
                    </Alert>
                  </Grid>
                ) : (
                  summary.map((item) => {
                    // Transform status colors for dark mode
                    const statusColorClasses = {
                      success: 'bg-green-100 dark:bg-green-800',
                      pending: 'bg-yellow-100 dark:bg-yellow-800',
                      failed: 'bg-red-100 dark:bg-red-800',
                    };
                    
                    const colorClass = statusColorClasses[item.status.toLowerCase() as keyof typeof statusColorClasses] || 'bg-gray-100 dark:bg-gray-800';
                    
                    return (
                      <Grid item xs={12} sm={4} key={item.status}>
                        <Card className={`${colorClass} shadow hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]`}>
                          <CardContent className={`${colorClass}`}>
                            <Typography 
                              className="text-gray-700 dark:text-gray-300" 
                              gutterBottom
                            >
                              {item.status.toUpperCase()}
                            </Typography>
                            <Typography 
                              variant="h5" 
                              component="div"
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {item.count} Transactions
                            </Typography>
                            <Typography 
                              variant="body2"
                              className="text-gray-600 dark:text-gray-400"
                            >
                              Amount: ₹{formatNumber(item.totalAmount)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              className="text-gray-800 dark:text-gray-200"
                            >
                              {item.percentage}% of total
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })
                )}
                
                {totals && (
                  <Grid item xs={12}>
                    <Card className="bg-blue-100 dark:bg-blue-700 shadow">
                      <CardContent className='bg-blue-100 dark:bg-blue-700'>
                        <Typography 
                          variant="h6" 
                          component="div"
                          className="text-blue-900 dark:text-blue-100"
                        >
                          Total Transactions: {totals.totalTransactions}
                        </Typography>
                        <Typography 
                          variant="body1"
                          className="text-blue-800 dark:text-blue-200"
                        >
                          Total Amount: ₹{formatNumber(totals.totalAmount)}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          className="text-blue-900 dark:text-blue-100"
                        >
                          Success Rate: {totals.successRate}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </div>
        
        {/* Filters */}
        <div className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
          <Grid container spacing={2} alignItems="center" >
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={handleStatusChange}
                fullWidth
                size="small"
                className="input dark:bg-gray-700"
                InputProps={{
                  className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }}
                InputLabelProps={{
                  className: "text-gray-600 dark:text-gray-200 "
                }}
              >
                <MenuItem value="all" className="text-gray-900 dark:text-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">All</MenuItem>
                <MenuItem value="success" className="text-gray-900 dark:text-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Success</MenuItem>
                <MenuItem value="pending" className="text-gray-900 dark:text-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Pending</MenuItem>
                <MenuItem value="failed" className="text-gray-900 dark:text-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Failed</MenuItem>
              </TextField>
            </Grid>
            
          </Grid>
        </div>
        
        {/* Transactions Table */}
        <div className="bg-white  dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
          <TableContainer className='rounded-lg'>
            <Table
            sx={{
              '& .MuiTableCell-root': {
                color: 'inherit',
                borderColor: 'inherit'
              },
              
              
            }}
            >
              <TableHead>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">Order ID</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">Student</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">Amount</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">Status</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">Payment Mode</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className='bg-gray-50 dark:bg-gray-800'>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8">
                      <CircularProgress size={30} className="text-primary-600 dark:text-primary-400" />
                      <Typography variant="body2" className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</Typography>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8">
                      <Typography variant="body1" className="text-gray-800 dark:text-gray-200">No transactions found</Typography>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or create a new payment
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
                    // Transform status colors for dark mode
                    const getStatusClasses = (status: string) => {
                      switch (status.toLowerCase()) {
                        case 'success':
                          return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100';
                        case 'pending':
                          return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100';
                        case 'failed':
                          return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100';
                        default:
                          return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
                      }
                    };
                    
                    return (
                      <TableRow 
                        key={transaction._id || transaction.collect_id} 
                        hover
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 text-gray-800 dark:text-gray-200 transition-all duration-200 transform hover:scale-[1.02]"
                        onClick={() => handleRowClick(transaction)}
                      >
                        <TableCell className="border-b  border-gray-200 text-gray-800 dark:text-gray-200 dark:border-gray-700">{transaction.custom_order_id.substring(0, 10)}...</TableCell>
                        <TableCell className="border-b border-gray-200 text-gray-800 dark:text-gray-200 dark:border-gray-700">{transaction.student_info?.names || 'N/A'}</TableCell>
                        <TableCell className="border-b border-gray-200 text-gray-800 dark:text-gray-200 dark:border-gray-700">₹{formatNumber(transaction.order_amount)}</TableCell>
                        <TableCell className="border-b border-gray-200 text-gray-800 dark:text-gray-200 dark:border-gray-700">
                          <span className={`px-3 py-1 rounded inline-block font-medium ${getStatusClasses(transaction.status)}`}>
                            {transaction.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="border-b border-gray-200 text-gray-800 dark:text-gray-200 dark:border-gray-700">{transaction.payment_mode || 'N/A'}</TableCell>
                        <TableCell className="border-b border-gray-200 text-gray-800 dark:text-gray-200 dark:border-gray-700">{formatDate(transaction.payment_time)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <div className='flex justify-end border-gray-200 dark:text-gray-200 dark:border-gray-400'>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={limit}
              page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows:"
            className="text-gray-800  border-t border-gray-200 dark:text-gray-200 dark:border-gray-400"
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;