import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { useThemeStore } from './stores/themeStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Monitors from './pages/Monitors';
import AddMonitor from './pages/AddMonitor';
import EditMonitor from './pages/EditMonitor';

// Create a client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Handle axios errors
        const axiosError = error as { response?: { status?: number } };
        // Don't retry on 401/403 authentication errors
        if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
          return false;
        }
        // Don't retry on 404 errors
        if (axiosError?.response?.status === 404) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Background refetch every 5 minutes for critical data
      refetchInterval: 5 * 60 * 1000,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // Handle axios errors
        const axiosError = error as { response?: { status?: number } };
        // Don't retry mutations on client errors (4xx)
        if (axiosError?.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          return false;
        }
        // Retry mutations up to 2 times for server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Route wrapper to handle landing page logic
const RouteHandler = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/landing" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Landing />} 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} 
      />
      <Route 
        path="/reset-password" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />} 
      />
      
      {/* Root route - show landing page for unauthenticated users, dashboard for authenticated */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Dashboard /> : <Landing />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Monitor Routes */}
      <Route 
        path="/monitors" 
        element={
          <ProtectedRoute>
            <Monitors />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/monitors/add" 
        element={
          <ProtectedRoute>
            <AddMonitor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/monitors/:id/edit" 
        element={
          <ProtectedRoute>
            <EditMonitor />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const { isDark } = useThemeStore();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary>
            <div className="min-h-screen">
              <RouteHandler />
            </div>
          </ErrorBoundary>
        </Router>
        
        {/* Global Toast Notifications */}
        <Toaster
          position="bottom-right"
          expand
          visibleToasts={4}
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
              color: isDark ? 'rgb(243 244 246)' : 'rgb(17 24 39)',
              border: `1px solid ${isDark ? 'rgb(75 85 99)' : 'rgb(229 231 235)'}`,
              boxShadow: isDark 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            className: `${isDark ? 'dark' : ''} font-medium`,
          }}
          theme={isDark ? 'dark' : 'light'}
          richColors
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;