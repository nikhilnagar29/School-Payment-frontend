import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      {/* Dark mode toggle in the top right */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="w-full max-w-md mx-auto text-center">
        {/* Error code */}
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
        
        {/* Title */}
        <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Using both Material UI and Tailwind classes */}
        <Button
          variant="contained"
          component={Link}
          to="/"
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-md"
        >
          Back to Dashboard
        </Button>
        
        {/* Pure Tailwind button alternative */}
        <Link to="/" className="mt-4 block">
          <button className="btn btn-primary">
            Return Home
          </button>
        </Link>
        
        {/* Card showing Tailwind components */}
        <div className="card mt-8">
          <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">
            Tailwind CSS is working!
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            This card is using the custom Tailwind components we defined.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 