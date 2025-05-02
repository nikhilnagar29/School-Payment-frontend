import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsAPI, isDevelopment } from '../services/api';
import Layout from '../components/Layout';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Button,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon
} from '@mui/icons-material';

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
  gateway?: string;
  bank_reference?: string;
  student_info?: {
    names: string;
    id: string;
    email: string;
  };
}

// Create sample mock transactions
const createMockTransactions = (): Transaction[] => {
  const statuses = ['success', 'pending', 'failed'];
  const paymentModes = ['UPI', 'NetBanking', 'Card', 'Wallet'];
  const mockTransactions: Transaction[] = [];
  
  // Create 20 mock transactions
  for (let i = 1; i <= 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const schoolId = i % 2 === 0 ? "65b0e6293e9f76a9694d84b4" : "65b0e6293e9f76a9694d84b5";
    
    mockTransactions.push({
      _id: `mock-tx-${i}`,
      collect_id: `mock-col-${i}`,
      school_id: schoolId,
      status,
      order_amount: amount,
      transaction_amount: status === 'success' ? amount : 0,
      payment_mode: paymentMode,
      payment_time: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      custom_order_id: `MOCK-ORDER-${i.toString().padStart(3, '0')}`,
      student_info: {
        names: `Student ${i}`,
        id: `STU-${i.toString().padStart(3, '0')}`,
        email: `student${i}@example.com`
      }
    });
  }
  
  return mockTransactions;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false); // Start with mock data by default

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('payment_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Toggle between real and mock data
  const handleToggleMockData = () => {
    setUseMockData(!useMockData);
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  // Fetch data when component mounts or when useMockData changes
  useEffect(() => {
    fetchData();
  }, [useMockData]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    if (useMockData) {
      // Use mock data
      try {
        console.log("Using mock data for transactions");
        
        // Generate mock transactions
        const mockData = createMockTransactions();
        setTransactions(mockData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err: any) {
        console.error('Error creating mock data:', err);
        setError('Failed to create mock data');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Try to fetch real data from API
    try {
      console.log("Fetching all transactions");
      
      const response = await transactionsAPI.getAllTransactions({
        page: 1,
        limit: 100 // Get more data for client-side filtering
      });
      
      console.log("API Response:", response.data);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data.data)) {
        // New format with data array
        setTransactions(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array format
        setTransactions(response.data);
      } else if (response.data && Array.isArray(response.data.transactions)) {
        // Old format with transactions array
        setTransactions(response.data.transactions);
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Unexpected data format received from API");
        setTransactions([]);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      
      if (err.message === 'Network Error') {
        setError('Network error: Cannot connect to the backend server. Using mock data instead.');
        
        // Automatically switch to mock data
        setUseMockData(true);
        const mockData = createMockTransactions();
        setTransactions(mockData);
      } else {
        setError(`API error: ${err.message || 'Failed to load transactions'}`);
        
        // Still show some mock data
        const mockData = createMockTransactions();
        setTransactions(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting whenever relevant states change
  useEffect(() => {
    let result = [...transactions];
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(tx => tx.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx.custom_order_id && tx.custom_order_id.toLowerCase().includes(term)) ||
        (tx.student_info?.names && tx.student_info.names.toLowerCase().includes(term)) ||
        (tx.student_info?.id && tx.student_info.id.toLowerCase().includes(term)) ||
        (tx.payment_mode && tx.payment_mode.toLowerCase().includes(term)) ||
        (tx.school_id && tx.school_id.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Handle different sort fields
      switch (sortBy) {
        case 'amount':
          valueA = a.order_amount || 0;
          valueB = b.order_amount || 0;
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        case 'student_name':
          valueA = a.student_info?.names || '';
          valueB = b.student_info?.names || '';
          break;
        case 'payment_mode':
          valueA = a.payment_mode || '';
          valueB = b.payment_mode || '';
          break;
        case 'school_id':
          valueA = a.school_id || '';
          valueB = b.school_id || '';
          break;
        case 'payment_time':
        default:
          valueA = new Date(a.payment_time || 0).getTime();
          valueB = new Date(b.payment_time || 0).getTime();
      }
      
      // Apply direction
      const comparison = sortDirection === 'asc' ? 1 : -1;
      if (valueA < valueB) return -1 * comparison;
      if (valueA > valueB) return 1 * comparison;
      return 0;
    });
    
    setFilteredTransactions(result);
  }, [transactions, searchTerm, statusFilter, sortBy, sortDirection]);

  // Handle pagination
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filters
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle sorting
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleSortDirectionChange = () => {
    setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
  };

  // Get current page of data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  };

  // Navigate to transaction detail
  const handleViewTransaction = (transactionId: string) => {
    console.log("Navigating to transaction detail with ID:", transactionId);
    if (!transactionId) {
      console.error("Cannot navigate to transaction detail: Missing transaction ID");
      return;
    }
    navigate(`/transactions/${transactionId}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return amount !== undefined ? `₹${amount.toLocaleString()}` : 'N/A';
  };

  // Get status color classes
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
    <div >
      <div className="w-ful ">
        <Box className="flex justify-between items-center mb-6">
          <Typography 
            variant="h4" 
            component="h1" 
            className="text-gray-900 dark:text-gray-100 font-semibold"
          >
            All Transactions
          </Typography>
          
          <Box className="flex items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              className="text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400"
              size="small"
            >
              Refresh
            </Button>
            
            {isDevelopment() && (
              <FormControlLabel
                control={
                  <Switch
                    checked={!useMockData}
                    onChange={handleToggleMockData}
                    color="primary"
                    size="small"
                    className="ml-2"
                  />
                }
                label={
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                    {useMockData ? "Mock Data" : "API Data"}
                  </Typography>
                }
                className="mb-0"
              />
            )}
          </Box>
        </Box>
        
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            className="bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleToggleMockData}
                className="text-yellow-800 dark:text-yellow-100"
              >
                {useMockData ? 'Try API' : 'Use Mock Data'}
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Filters and Search */}
        <Paper 
          elevation={2} 
          className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-200"
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Order ID, Student, School, etc."
                InputProps={{
                  className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }}
                InputLabelProps={{
                  className: "text-gray-600 dark:text-gray-400"
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel className="text-gray-600 dark:text-gray-400">Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  label="Status"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  MenuProps={{
                    PaperProps: {
                      className: "bg-white dark:bg-gray-800"
                    }
                  }}
                >
                  <MenuItem 
                    value=""
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    All
                  </MenuItem>
                  <MenuItem 
                    value="success"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Success
                  </MenuItem>
                  <MenuItem 
                    value="pending"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Pending
                  </MenuItem>
                  <MenuItem 
                    value="failed"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Failed
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={8}>
                  <FormControl fullWidth size="small">
                    <InputLabel className="text-gray-600 dark:text-gray-400">Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={handleSortChange}
                      label="Sort By"
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      MenuProps={{
                        PaperProps: {
                          className: "bg-white dark:bg-gray-800"
                        }
                      }}
                    >
                      <MenuItem 
                        value="payment_time"
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Date
                      </MenuItem>
                      <MenuItem 
                        value="amount"
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Amount
                      </MenuItem>
                      <MenuItem 
                        value="status"
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Status
                      </MenuItem>
                      <MenuItem 
                        value="student_name"
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Student Name
                      </MenuItem>
                      <MenuItem 
                        value="payment_mode"
                        className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Payment Mode
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <Button 
                    variant="outlined" 
                    onClick={handleSortDirectionChange}
                    fullWidth
                    className="h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    startIcon={sortDirection === 'asc' ? <AscIcon /> : <DescIcon />}
                  >
                    {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <Box className="flex justify-end">
                <Chip 
                  label={`${filteredTransactions.length} items`} 
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Transactions Table */}
        <Paper elevation={2} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-colors duration-200">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">Order ID</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">Student</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">School ID</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">Amount</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">Status</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">Payment Mode</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300 font-medium">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-10 text-center">
                      <CircularProgress size={36} className="text-primary-600 dark:text-primary-400" />
                      <Typography variant="body2" className="mt-2 text-gray-600 dark:text-gray-400">
                        Loading transactions...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-10 text-center">
                      <Typography variant="body1" className="text-gray-900 dark:text-gray-100">
                        No transactions found
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  getCurrentPageData().map((transaction) => (
                    <TableRow 
                      key={transaction._id} 
                      hover
                      className="cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                      onClick={() => handleViewTransaction(transaction._id)}
                    >
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {transaction.custom_order_id}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        <div>{transaction.student_info?.names || 'N/A'}</div>
                        {transaction.student_info?.id && (
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                            ID: {transaction.student_info.id}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {transaction.school_id}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {formatAmount(transaction.order_amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status.toUpperCase()}
                          size="small"
                          className={`${getStatusClasses(transaction.status)} px-2 py-1 font-medium`}
                        />
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {transaction.payment_mode || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-100">
                        {formatDate(transaction.payment_time)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
          />
        </Paper>
      </div>
    </div>
  );
};

export default Transactions;