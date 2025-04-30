import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsAPI, isDevelopment } from '../services/api';
import {
  Container,
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
  FormControlLabel
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
  const [useMockData, setUseMockData] = useState(true); // Start with mock data by default

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

  // Fetch data when component mounts or when useMockData changes
  useEffect(() => {
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
    
    fetchData();
  }, [useMockData]);

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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        All Transactions
      </Typography>
      
      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleToggleMockData}>
              {useMockData ? 'Try API' : 'Use Mock Data'}
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {isDevelopment() && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={!useMockData}
                onChange={handleToggleMockData}
                color="primary"
              />
            }
            label={useMockData ? "Using Mock Data" : "Using API Data"}
          />
        </Box>
      )}
      
      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Order ID, Student, School, etc."
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                  >
                    <MenuItem value="payment_time">Date</MenuItem>
                    <MenuItem value="amount">Amount</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="student_name">Student Name</MenuItem>
                    <MenuItem value="payment_mode">Payment Mode</MenuItem>
                    <MenuItem value="school_id">School</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <Button 
                  variant="outlined" 
                  onClick={handleSortDirectionChange}
                  fullWidth
                >
                  {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="textSecondary">
              Total: {filteredTransactions.length} transactions
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>School ID</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Payment Mode</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading transactions...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1">No transactions found</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Try adjusting your search or filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((transaction) => (
                  <TableRow 
                    key={transaction._id} 
                    hover
                    sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                    onClick={() => handleViewTransaction(transaction._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{transaction.custom_order_id}</TableCell>
                    <TableCell>
                      <div>{transaction.student_info?.names || 'N/A'}</div>
                      {transaction.student_info?.id && (
                        <Typography variant="caption" color="textSecondary">
                          ID: {transaction.student_info.id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{transaction.school_id}</TableCell>
                    <TableCell>{formatAmount(transaction.order_amount)}</TableCell>
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
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default Transactions; 