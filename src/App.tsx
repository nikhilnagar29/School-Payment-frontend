import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/schools/:schoolId" element={<SchoolTransactions />} />
            <Route path="/transactions/check-status" element={<CheckStatus />} />
            <Route path="/transactions/status/:custom_order_id" element={<TransactionStatus />} />
            <Route path="/payments/create" element={<CreatePayment />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
