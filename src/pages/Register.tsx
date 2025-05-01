import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Box
} from '@mui/material';
import DarkModeToggle from '../components/DarkModeToggle';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    school_id: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, role: e.target.value });
  };

  const handleSchoolChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      school_id: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        school_id: formData.school_id
      };
      
      await authAPI.register(userData);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock school data (would be fetched from API in a real implementation)
  const schoolOptions = [
    { id: 'school_1', name: 'School 1' },
    { id: 'school_2', name: 'School 2' },
    { id: 'school_3', name: 'School 3' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Dark mode toggle in the top right */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 transition-colors duration-200">
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            className="text-gray-900 dark:text-gray-100 font-semibold"
          >
            School Payment & Dashboard
          </Typography>
          
          <Typography 
            component="h2" 
            variant="h6" 
            align="center" 
            className="mb-6 text-gray-800 dark:text-gray-200"
          >
            Register
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
          
          {success && (
            <div className="mb-4">
              <Alert 
                severity="success" 
                className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
              >
                Registration successful! Redirecting to login...
              </Alert>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
            
            <FormControl fullWidth margin="normal" className="input">
              <InputLabel 
                id="role-label"
                className="text-gray-600 dark:text-gray-400"
              >
                Role
              </InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={formData.role}
                label="Role"
                onChange={handleRoleChange}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <MenuItem value="admin" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Admin</MenuItem>
                <MenuItem value="trustee" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Trustee</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" className="input">
              <InputLabel 
                id="schools-label"
                className="text-gray-600 dark:text-gray-400"
              >
                Schools
              </InputLabel>
              <Select
                labelId="schools-label"
                id="schools"
                multiple
                value={formData.school_id}
                onChange={handleSchoolChange}
                label="Schools"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                renderValue={(selected) => (
                  <Box className="flex flex-wrap gap-1">
                    {selected.map((value) => {
                      const school = schoolOptions.find(s => s.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={school?.name || value} 
                          className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {schoolOptions.map((school) => (
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="mt-6 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-200"
              disabled={loading || success}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            
            <div className="mt-4 text-center">
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm transition-colors duration-200"
              >
                Already have an account? Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 