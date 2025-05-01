import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from './Layout';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // If authentication is still being checked, show loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login with the return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected route inside the layout
  return (
    <Layout>

      <Outlet />

    </Layout>
  );
};

export default ProtectedRoute;
