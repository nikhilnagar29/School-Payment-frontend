import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Typography,
  TextField,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  useMediaQuery
} from '@mui/material';
import DarkModeToggle from '../components/DarkModeToggle';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Dark mode state based on localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  
  // Update state if localStorage changes (e.g. from another component)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(currentMode);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
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
  
  const handleThemeChange = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update localStorage and add/remove dark class from html element
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Simulated success message
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="text-gray-900 dark:text-white font-semibold">
          Settings
        </Typography>
        <DarkModeToggle />
      </div>
      
      {saveSuccess && (
        <div className="mb-6">
          <Alert severity="success" className="bg-green-50 dark:bg-green-900 dark:text-green-100">
            Settings updated successfully!
          </Alert>
        </div>
      )}
      
      {error && (
        <div className="mb-6">
          <Alert severity="error" className="bg-red-50 dark:bg-red-900 dark:text-red-100">
            {error}
          </Alert>
        </div>
      )}
      
      {/* Profile Settings */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Profile Settings
        </h2>
        
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
          </div>
          
          <div>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled // Email changes typically require verification
              className="input"
              InputProps={{
                className: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              variant="contained"
              className="btn btn-primary"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
      
      {/* Password Change */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Change Password
        </h2>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              className="input"
              InputProps={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }}
              InputLabelProps={{
                className: "text-gray-600 dark:text-gray-400"
              }}
            />
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
            <div>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                className="input"
                InputProps={{
                  className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }}
                InputLabelProps={{
                  className: "text-gray-600 dark:text-gray-400"
                }}
              />
            </div>
            
            <div>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="input"
                InputProps={{
                  className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }}
                InputLabelProps={{
                  className: "text-gray-600 dark:text-gray-400"
                }}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              variant="contained"
              className="btn btn-primary"
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>
      
      {/* Appearance Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Appearance
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <FormControlLabel
              control={
                <Switch 
                  checked={darkMode} 
                  onChange={handleThemeChange} 
                  color="primary" 
                  className="text-primary-600 dark:text-primary-400"
                />
              }
              label="Dark Mode"
              className="text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Change the theme appearance between light and dark mode
            </p>
          </div>
          
          <div className="flex space-x-2 items-center">
            <span className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-800 border-2 border-primary-400' : 'bg-gray-200'} transition-colors duration-200`}></span>
            <span className={`h-8 w-8 rounded-full ${!darkMode ? 'bg-white border-2 border-primary-400 shadow-sm' : 'bg-gray-600'} transition-colors duration-200`}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;