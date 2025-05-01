import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  useTheme,
  useMediaQuery
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
  DarkMode as DarkModeIcon,
  ViewList as TransactionsIcon
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
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  // Close drawer when route changes on mobile
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

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

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    if (path.startsWith('/schools/') && location.pathname.startsWith('/schools/')) {
      return true;
    }
    if (path === location.pathname) {
      return true;
    }
    return false;
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
            className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              isActive('/dashboard') ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => isMobile && setMobileOpen(false)}
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
              className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                isActive(`/schools/${school._id || school.id}`) ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => isMobile && setMobileOpen(false)}
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
            className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              location.pathname === '/payments/create' ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => isMobile && setMobileOpen(false)}
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
            className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              location.pathname === '/transactions/check-status' ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => isMobile && setMobileOpen(false)}
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
        {/* <ListItem key="settings" disablePadding>
          <ListItemButton 
            component={Link} 
            to="/settings"
            className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              location.pathname === '/settings' ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <ListItemIcon className="min-w-10 text-primary-600 dark:text-primary-400">
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              className="text-gray-900 dark:text-gray-100"
            />
          </ListItemButton>
        </ListItem> */}
        
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }} className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
            className="text-gray-900 dark:text-white"
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            className="font-medium text-gray-900 dark:text-white flex-grow"
          >
            School Payment & Dashboard
          </Typography>
          
          <div className="flex items-center space-x-4">
            <Typography variant="body1" className="text-gray-800 dark:text-gray-200 mr-4 hidden md:block">
              {user?.name}
            </Typography>
            <DarkModeToggle />
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 } 
        }}
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
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          className="transition-all duration-200"
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
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
          className="transition-all duration-200"
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          padding: theme.spacing(3)
        }}
        className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col"
      >
        <Toolbar />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200 flex-grow my-6 mx-auto w-full max-w-7xl">
          {children}
        </div>
      </Box>
    </Box>
  );
};

export default Layout; 