import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
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
  student_info: {
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

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary[]>([]);
  const [totals, setTotals] = useState<SummaryTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') || '';
  
  // Update URL when filters change
  const updateFilters = (newFilters: Record<string, any>) => {
    const updatedParams = { page: page.toString(), limit: limit.toString(), status };
    
    // Update with new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        updatedParams[key] = value.toString();
      } else {
        delete updatedParams[key];
      }
    });
    
    setSearchParams(updatedParams);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch transactions with current filters
        const params: Record<string, any> = { 
          page: page + 1, // API uses 1-based pagination
          limit
        };
        
        if (status) {
          params.status = status;
        }
        
        const txResponse = await transactionsAPI.getAllTransactions(params);
        setTransactions(txResponse.data);
        
        // Fetch summary data
        const summaryResponse = await transactionsAPI.getTransactionSummary();
        setSummary(summaryResponse.data.summary);
        setTotals(summaryResponse.data.totals);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Summary
        </Typography>
        <Grid container spacing={3}>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {summary.map((item) => (
                <Grid item xs={12} sm={4} key={item.status}>
                  <Card sx={{ 
                    backgroundColor: 
                      item.status === 'success' ? '#e8f5e9' : 
                      item.status === 'pending' ? '#fff8e1' : '#ffebee' 
                  }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {item.status.toUpperCase()}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {item.count} Transactions
                      </Typography>
                      <Typography variant="body2">
                        Amount: ₹{item.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {item.percentage}% of total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              {totals && (
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: '#e3f2fd' }}>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        Total Transactions: {totals.totalTransactions}
                      </Typography>
                      <Typography variant="body2">
                        Total Amount: ₹{totals.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
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
      <Paper sx={{ p: 2, mb: 3 }}>
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
            >
              Create New Payment
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Mode</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.custom_order_id}</TableCell>
                    <TableCell>{transaction.student_info?.names || 'N/A'}</TableCell>
                    <TableCell>₹{transaction.order_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          backgroundColor: 
                            transaction.status === 'success' ? '#e8f5e9' : 
                            transaction.status === 'pending' ? '#fff8e1' : '#ffebee',
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={100} // Replace with actual count from API
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default Dashboard; 