import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';

// Page imports
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import SchoolTransactions from './pages/SchoolTransactions';
import CheckStatus from './pages/CheckStatus';
import TransactionStatus from './pages/TransactionStatus';
import CreatePayment from './pages/CreatePayment';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import TransactionDetail from './pages/TransactionDetail';

// Initialize dark mode
const initDarkMode = () => {
  // Check if dark mode is saved in localStorage
  const darkModeSaved = localStorage.getItem('darkMode');
  
  if (darkModeSaved === 'true') {
    document.documentElement.classList.add('dark');
  } else if (darkModeSaved === 'false') {
    document.documentElement.classList.remove('dark');
  } else {
    // If no preference is saved, use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      localStorage.setItem('darkMode', 'false');
    }
  }
};

// Listen for system theme changes
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // Only apply system preference if no user preference is saved
    if (localStorage.getItem('darkMode') === null) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      
      // Notify components of the change
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'darkMode',
        newValue: e.matches ? 'true' : 'false',
        storageArea: localStorage
      }));
    }
  };
  
  // Add listener for theme changes
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
};

// ScrollToTop component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  // Initialize dark mode on app load
  useEffect(() => {
    initDarkMode();
    
    // Set up system theme listener
    const cleanupListener = setupSystemThemeListener();
    
    // Listen for manual dark mode changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        if (e.newValue === 'true') {
          document.documentElement.classList.add('dark');
        } else if (e.newValue === 'false') {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      cleanupListener();
    };
  }, []);
  
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/schools" element={<SchoolTransactions />} />
              <Route path="/schools/:schoolId" element={<SchoolTransactions />} />
              <Route path="/transactions/check-status" element={<CheckStatus />} />
              <Route path="/transactions/status/:custom_order_id" element={<TransactionStatus />} />
              <Route path="/transactions/:transactionId" element={<TransactionDetail />} />
              <Route path="/payments/create" element={<CreatePayment />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </div>
    </HashRouter>
  );
}

export default App;
