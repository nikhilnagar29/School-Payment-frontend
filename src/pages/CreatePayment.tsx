import { useState, useContext } from 'react';
import { paymentsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  MenuItem,
  CircularProgress,
  Grid,
  Link
} from '@mui/material';

const CreatePayment = () => {
  const { user } = useContext(AuthContext);
  const [paymentData, setPaymentData] = useState({
    student_info: {
      names: '',
      id: '',
      email: ''
    },
    school_id: '',
    order_amount: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [collectRequestId, setCollectRequestId] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('student_info.')) {
      const field = name.split('.')[1];
      setPaymentData({
        ...paymentData,
        student_info: {
          ...paymentData.student_info,
          [field]: value
        }
      });
    } else {
      setPaymentData({
        ...paymentData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.student_info.names || !paymentData.school_id || !paymentData.order_amount) {
      setError('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setPaymentLink(null);
    
    try {
      const formData = {
        ...paymentData,
        order_amount: parseFloat(paymentData.order_amount)
      };
      
      const response = await paymentsAPI.createPayment(formData);
      
      setSuccess(true);
      setPaymentLink(response.data.payment_link);
      setCollectRequestId(response.data.collect_request_id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Mock school data (would be fetched from API in a real implementation)
  const schoolOptions = user?.schools || [
    { _id: 'school_1', name: 'School 1' },
    { _id: 'school_2', name: 'School 2' },
    { _id: 'school_3', name: 'School 3' }
  ];

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Create Payment Link
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {success && paymentLink && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Payment link created successfully!
          </Typography>
          <Typography variant="body2">
            Request ID: {collectRequestId}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Payment Link
            </Button>
          </Box>
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" gutterBottom>
            Student Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Student Name"
                name="student_info.names"
                value={paymentData.student_info.names}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Student ID"
                name="student_info.id"
                value={paymentData.student_info.id}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Email"
                name="student_info.email"
                type="email"
                value={paymentData.student_info.email}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Payment Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="School"
                name="school_id"
                value={paymentData.school_id}
                onChange={handleChange as any}
              >
                {schoolOptions.map((school: any) => (
                  <MenuItem key={school._id} value={school._id}>
                    {school.name || `School ${school._id}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Amount (₹)"
                name="order_amount"
                type="number"
                inputProps={{ min: 1 }}
                value={paymentData.order_amount}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Payment Link'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePayment; 