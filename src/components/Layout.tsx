import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Payments as PaymentsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import DarkModeToggle from './DarkModeToggle';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  
  // Listen for dark mode changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        setDarkMode(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Update localStorage and document class
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'darkMode',
      newValue: newDarkMode.toString(),
      storageArea: localStorage
    }));
  };

  const drawer = (
    <div className="h-full dark:bg-gray-800 transition-colors duration-200">
      <Toolbar className="dark:bg-gray-800">
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          className="font-medium text-gray-900 dark:text-white transition-colors duration-200"
        >
          School Payment
        </Typography>
      </Toolbar>
      <Divider className="dark:border-gray-700" />
      <List className="py-2">
        <ListItem key="dashboard" disablePadding>
          <ListItemButton 
            component={Link} 
            to="/dashboard"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem>
        
        {user?.schools?.length > 0 && user?.schools.map((school: any, index: number) => (
          <ListItem key={school._id || `school-${index}`} disablePadding>
            <ListItemButton 
              component={Link} 
              to={`/schools/${school || school.id}`}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText 
                primary={school.name || `School ${index + 1}`} 
                className="text-gray-900 dark:text-gray-100"
              />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem key="create-payment" disablePadding>
          <ListItemButton 
            component={Link} 
            to="/payments/create"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
              <PaymentsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Create Payment" 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem>

        <ListItem key="check-status" disablePadding>
          <ListItemButton 
            component={Link} 
            to="/transactions/check-status"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
              <SearchIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Check Status" 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider className="dark:border-gray-700" />
      <List className="py-2">
        <ListItem key="settings" disablePadding>
          <ListItemButton 
            component={Link} 
            to="/settings"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem key="dark-mode" disablePadding>
          <ListItemButton 
            onClick={toggleDarkMode}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
              {darkMode ? <LightModeIcon className="text-yellow-500" /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText 
              primary={darkMode ? "Light Mode" : "Dark Mode"} 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem key="logout" disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ListItemIcon className="min-w-10 text-red-600 dark:text-red-400">
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box className="flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 min-h-screen">
      <CssBaseline />
      <AppBar
        position="fixed"
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transition-colors duration-200"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar className="flex justify-between">
          <div className="flex items-center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2 text-gray-900 dark:text-white lg:hidden"
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              className="font-medium text-gray-900 dark:text-white"
            >
              School Payment & Dashboard
            </Typography>
          </div>
          
          <div className="flex items-center space-x-4">
            <Typography variant="body1" className="text-gray-800 dark:text-gray-200">
              {user?.name}
            </Typography>
            <DarkModeToggle />
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        className="w-full sm:w-60"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          classes={{
            paper: "dark:bg-gray-800 transition-colors duration-200"
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
          classes={{
            paper: "dark:bg-gray-800 transition-colors duration-200 border-r dark:border-gray-700"
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        className="flex-grow p-6 w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
        sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
          {children}
        </div>
      </Box>
    </Box>
  );
};

export default Layout; 