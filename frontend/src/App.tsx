import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Monitors from './pages/Monitors';
import AddMonitor from './pages/AddMonitor';
import EditMonitor from './pages/EditMonitor';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <RouteHandler />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;