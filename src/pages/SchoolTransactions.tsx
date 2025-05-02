import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import {
  Typography,
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
  Button
} from '@mui/material';
import DarkModeToggle from '../components/DarkModeToggle';

// List of available schools
const AVAILABLE_SCHOOLS = [
  { id: '65b0e6293e9f76a9694d84b4', name: 'School 1' },
  { id: '68118fcac26aadc91ae5192a', name: 'School 2' }
];

const SchoolTransactions = () => {
  const { schoolId = '65b0e6293e9f76a9694d84b4' } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [selectedSchool, setSelectedSchool] = useState(schoolId);
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
    const updatedParams: Record<string, string> = { page: page.toString(), limit: limit.toString(), status };
    
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
        // Fetch transactions for this school with current filters
        const params: Record<string, any> = { 
          page: page + 1, // API uses 1-based pagination
          limit
        };
        
        if (status) {
          params.status = status;
        }
        
        const response = await transactionsAPI.getTransactionsBySchool(selectedSchool, params);
        console.log('API Response:', response.data);
        
        // Handle the data format from the API
        const transactionsData = response.data?.data || [];
        setTransactions(transactionsData);
        
        // Handle pagination from the API response
        setPagination({
          currentPage: (response.data?.pagination?.page || 1) - 1, // Convert to 0-based for MUI
          totalPages: response.data?.pagination?.pages || 1,
          totalRecords: response.data?.pagination?.total || 0
        });
      } catch (err: any) {
        console.error("Error fetching school transactions:", err);
        setError(err.message || 'Failed to load school transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedSchool, page, limit, status]);

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

  // School change handler
  const handleSchoolChange = (event: SelectChangeEvent) => {
    const newSchoolId = event.target.value;
    setSelectedSchool(newSchoolId);
    navigate(`/schools/${newSchoolId}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
    <div className="p-4 m-[-10px] rounded-lg bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          className="text-gray-900 dark:text-gray-100 font-semibold"
        >
          School Transactions
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          className="text-gray-600 dark:text-gray-400 mb-8 p-2"
        >
          School ID: {schoolId}
        </Typography>
        
        {error && (
          <div className="mb-4">
            <Alert 
              severity="error" 
              className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
            >
              {error}
            </Alert>
          </div>
        )}
        
        {/* Filters */}
        <div className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" className="input">
                <InputLabel 
                  id="school-select-label" 
                  className="text-gray-600 dark:text-gray-400"
                >
                  School
                </InputLabel>
                <Select
                  labelId="school-select-label"
                  value={selectedSchool}
                  label="School"
                  onChange={handleSchoolChange}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  MenuProps={{
                    PaperProps: {
                      className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }
                  }}
                >
                  {AVAILABLE_SCHOOLS.map(school => (
                    <MenuItem 
                      key={school.id} 
                      value={school.id}
                      className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      
                    >
                      {school.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
                  className: "text-gray-600 dark:text-gray-200"
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                      sx: {
                        
                      }
                    }
                  }
                }}
              >
                <MenuItem 
                  value="" 
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  sx={{
                    '&.MuiMenuItem-root': {
                      backgroundColor: 'inherit', 
                      color: 'inherit',
                    }
                  }}
                >
                  All
                </MenuItem>
                <MenuItem 
                  value="success" 
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  sx={{
                    '&.MuiMenuItem-root': {
                      backgroundColor: 'inherit', 
                      color: 'inherit',
                    }
                  }}
                >
                  Success
                </MenuItem>
                <MenuItem 
                  value="pending" 
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  sx={{
                    '&.MuiMenuItem-root': {
                      backgroundColor: 'inherit', 
                      color: 'inherit',
                    }
                  }}
                >
                  Pending
                </MenuItem>
                <MenuItem 
                  value="failed" 
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  sx={{
                    '&.MuiMenuItem-root': {
                      backgroundColor: 'inherit', 
                      color: 'inherit',
                    }
                  }}
                >
                  Failed
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </div>
        
        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
          <TableContainer className="rounded-t-lg">
            <Table sx={{
              '& .MuiTableCell-root': {
                color: 'inherit',
                borderColor: 'inherit'
              },
              
              '& .MuiTableRow-root.Mui-selected': {
                backgroundColor: 'rgb(243 244 246 / 1)',
              }

            }}>
              <TableHead>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Order ID</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Student</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Amount</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Status</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Payment Mode</TableCell>
                  <TableCell className="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{
                '& .MuiTableRow-root:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  '@media (prefers-color-scheme: dark)': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }
                }
              }}>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8 border-b border-gray-200 dark:border-gray-700">
                      <CircularProgress size={30} className="text-primary-600 dark:text-primary-400" />
                      <Typography variant="body2" className="mt-2 text-gray-600 dark:text-gray-400">Loading transactions...</Typography>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8 border-b border-gray-200 dark:border-gray-700">
                      <Typography variant="body1" className="text-gray-800 dark:text-gray-200">No transactions found</Typography>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or select a different school
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow 
                      key={transaction._id}
                      hover
                      onClick={() => {
                        console.log("Navigating to transaction detail from SchoolTransactions:", transaction._id);
                        navigate(`/transactions/${transaction._id}`);
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 text-gray-800 dark:text-gray-200 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <TableCell className="border-b border-gray-200 dark:border-gray-700">{transaction.custom_order_id}</TableCell>
                      <TableCell className="border-b border-gray-200 dark:border-gray-700">{transaction.student_info?.names || 'N/A'}</TableCell>
                      <TableCell className="border-b border-gray-200 dark:border-gray-700">₹{transaction.order_amount?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="border-b border-gray-200 dark:border-gray-700">
                        <span className={`px-3 py-1 rounded inline-block font-medium ${getStatusClasses(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="border-b border-gray-200 dark:border-gray-700">{transaction.payment_mode || 'N/A'}</TableCell>
                      <TableCell className="border-b border-gray-200 dark:border-gray-700">{formatDate(transaction.payment_time)}</TableCell>
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
            className="text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700"
            sx={{
              color: 'inherit',
              '& .MuiToolbar-root': {
                color: 'inherit'
              },
              '& .MuiTablePagination-select': {
                color: 'inherit'
              },
              '& .MuiTablePagination-selectIcon': {
                color: 'inherit'
              },
              '& .MuiTablePagination-actions': {
                color: 'inherit'
              },
              '& .MuiIconButton-root': {
                color: 'inherit'
              },
              '& .MuiSelect-select': {
                backgroundColor: 'transparent !important'
              },
              '& .MuiSelect-icon': {
                color: 'inherit'
              },
              '& .MuiMenu-paper': {
                backgroundColor: 'var(--paper-background)',
                color: 'var(--text-primary)'
              },
              '& .MuiMenuItem-root': {
                color: 'inherit'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SchoolTransactions; 