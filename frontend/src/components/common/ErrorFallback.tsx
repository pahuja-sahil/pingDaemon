import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Card from './Card';

interface ErrorFallbackProps {
  error?: Error | null;
  resetError?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

const ErrorFallback = ({
  error,
  resetError,
  title = "Something went wrong",
  description = "An error occurred while loading this content. Please try again.",
  showHomeButton = true,
  showRetryButton = true,
}: ErrorFallbackProps) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const getErrorMessage = (error: Error | null | undefined) => {
    if (!error) return description;
    
    // Handle different types of errors
    if (error.message.includes('Network Error')) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    
    if (error.message.includes('401')) {
      return "Your session has expired. Please log in again.";
    }
    
    if (error.message.includes('403')) {
      return "You don't have permission to access this resource.";
    }
    
    if (error.message.includes('404')) {
      return "The requested resource could not be found.";
    }
    
    if (error.message.includes('500')) {
      return "Internal server error. Please try again later.";
    }
    
    return error.message || description;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-6"
        >
          {getErrorMessage(error)}
        </motion.p>

        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6 text-left"
          >
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technical Details
            </summary>
            <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto whitespace-pre-wrap">
              {error.stack || error.message}
            </pre>
          </motion.details>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 justify-center"
        >
          {showRetryButton && resetError && (
            <Button onClick={resetError} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {showHomeButton && (
            <Button onClick={handleGoHome} variant="primary">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ErrorFallback;