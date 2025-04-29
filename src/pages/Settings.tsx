import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would make an API call to update the user profile
    // For now, we'll just simulate success
    
    setSaveSuccess(true);
    setError(null);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    // In a real app, you would make an API call to change the password
    // For now, we'll just simulate success
    
    setSaveSuccess(true);
    setError(null);
    
    // Reset form fields and success message
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isDark = e.target.checked;
    setDarkMode(isDark);
    
    // In a real app with a theme provider, you would update the theme
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Simulated success message
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Profile Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        
        <Box component="form" onSubmit={handleProfileSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled // Email changes typically require verification
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Save Profile
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Password Change */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        
        <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Appearance Settings */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode} 
                onChange={handleThemeChange} 
                color="primary" 
              />
            }
            label="Dark Mode"
          />
          <Typography variant="body2" color="textSecondary">
            Change the theme appearance between light and dark mode
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;