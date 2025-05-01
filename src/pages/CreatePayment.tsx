import { useState, useContext, useRef } from 'react';
import { paymentsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  CircularProgress,
  Grid,
  Link,
  IconButton,
  Tooltip,
  Snackbar,
  Box
} from '@mui/material';
import DarkModeToggle from '../components/DarkModeToggle';

const CreatePayment = () => {
  const { user } = useContext(AuthContext);
  const [paymentData, setPaymentData] = useState({
    student_info: {
      names: '',
      id: '',
      email: ''
    },
    school_id: '65b0e6293e9f76a9694d84b4', // Default school ID
    order_amount: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [collectRequestId, setCollectRequestId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
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
  
  // Copy payment link to clipboard
  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopySuccess(true);
    }
  };
  
  // Send payment link via email
  const handleSendEmail = () => {
    if (paymentLink && paymentData.student_info.email) {
      const subject = "Your Payment Link";
      const body = `Hello ${paymentData.student_info.names},\n\nHere is your payment link: ${paymentLink}\n\nThank you!`;
      window.open(`mailto:${paymentData.student_info.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  return (
    <div className="p-4  rounded-lg m-[-10px] dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      
      <div className="max-w-3xl mx-auto ">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          className="text-gray-900 dark:text-gray-100 font-semibold"
        >
          Create Payment Link
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
        
        <Snackbar
          open={copySuccess}
          autoHideDuration={3000}
          onClose={() => setCopySuccess(false)}
          message="Payment link copied to clipboard"
          ContentProps={{
            className: "bg-gray-800 dark:bg-gray-700 text-white"
          }}
        />
        
        {success && paymentLink && (
          <div className="mb-4">
            <Alert 
              severity="success" 
              className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
            >
              <Typography 
                variant="body1" 
                gutterBottom
                className="text-green-800 dark:text-green-100"
              >
                Payment link created successfully!
              </Typography>
              <Typography 
                variant="body2"
                className="text-green-700 dark:text-green-200"
              >
                Request ID: {collectRequestId}
              </Typography>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  variant="contained" 
                  color="primary" 
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800"
                >
                  Open Payment Link
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleCopyLink}
                  className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400"
                >
                  Copy Link
                </Button>
                
                {paymentData.student_info.email && (
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleSendEmail}
                    className="border-secondary-600 dark:border-secondary-400 text-secondary-600 dark:text-secondary-400"
                  >
                    Send via Email
                  </Button>
                )}
              </div>
            </Alert>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Typography 
              variant="h6" 
              gutterBottom
              className="text-gray-800 dark:text-gray-200 font-medium"
            >
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
                  className="input"
                  InputProps={{
                    className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-800 "
                  }}
                  InputLabelProps={{
                    className: "text-gray-600 dark:text-gray-300 "
                  }}
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
                  className="input"
                  InputProps={{
                    className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-800 "
                  }}
                  InputLabelProps={{
                    className: "text-gray-600 dark:text-gray-300 "
                  }}
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
                  helperText="Email is optional but required for sending the payment link"
                  className="input"
                  InputProps={{
                    className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-800 "
                  }}
                  InputLabelProps={{
                    className: "text-gray-600 dark:text-gray-300 "
                  }}
                  FormHelperTextProps={{
                    className: "text-gray-500 dark:text-gray-400"
                  }}
                />
              </Grid>
            </Grid>
            
            <div className="pt-4">
              <Typography 
                variant="h6" 
                gutterBottom 
                className="text-gray-800 dark:text-gray-200 font-medium"
              >
                Payment Details
              </Typography>
            </div>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled
                  fullWidth
                  label="School"
                  name="school_id"
                  value="School-1"
                  className="input"
                  InputProps={{
                    className: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 dark:border-gray-800 "
                  }}
                  InputLabelProps={{
                    className: "text-gray-600 dark:text-gray-300 "
                  }}
                />
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
                  className="input"
                  InputProps={{
                    className: "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-800 "
                  }}
                  InputLabelProps={{
                    className: "text-gray-600 dark:text-gray-300 "
                  }}
                />
              </Grid>
            </Grid>
            
            <div className="pt-4">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                fullWidth
                className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 py-3 text-white"
              >
                {loading ? <CircularProgress size={24} className="text-white" /> : 'Generate Payment Link'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePayment; 