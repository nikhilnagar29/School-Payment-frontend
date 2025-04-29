import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
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
  Box
} from '@mui/material';

const SchoolTransactions = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalRecords: 0
  });
  
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
      if (!schoolId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch transactions for this school with current filters
        const params: Record<string, any> = { 
          page: page + 1, // API uses 1-based pagination
          limit
        };
        
        if (status) {
          params.status = status;
        }
        
        const response = await transactionsAPI.getTransactionsBySchool(schoolId, params);
        setTransactions(response.data.transactions || []);
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalRecords: response.data.pagination?.totalRecords || 0
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load school transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [schoolId, page, limit, status]);

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
        School Transactions
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        School ID: {schoolId}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
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
                  <TableRow key={transaction._id || transaction.collect_id}>
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
          count={pagination.totalRecords}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default SchoolTransactions; 