import { useState, useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import ThemeToggle from './ThemeToggle';
import { User, LogOut } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
}

const Layout = ({ children, showHeader = true, showSidebar = true }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on tablet screens
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const shouldShowSidebar = showSidebar && isAuthenticated;
  const shouldShowBottomNav = isAuthenticated && isMobile;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop/tablet */}
      {shouldShowSidebar && (
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}

      {/* Header for unauthenticated pages */}
      {showHeader && !isAuthenticated && <Header />}

      {/* Top bar for authenticated pages on mobile */}
      {isAuthenticated && isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 h-16">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                pingDaemon
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          ${showHeader && !isAuthenticated ? 'pt-0' : ''}
          ${isAuthenticated && isMobile ? 'pt-16 pb-20' : ''}
          ${shouldShowSidebar && !isMobile ? (sidebarCollapsed ? 'ml-20' : 'ml-70') : ''}
        `}
        style={{
          marginLeft: shouldShowSidebar && !isMobile ? (sidebarCollapsed ? '80px' : '280px') : '0'
        }}
      >
        {children}
      </motion.main>

      {/* Bottom Navigation for mobile */}
      {shouldShowBottomNav && <BottomNavigation />}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          className: 'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
        }}
        theme="light"
        richColors
      />
    </div>
  );
};

export default Layout;