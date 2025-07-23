import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Monitor, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User,
  Palette,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    logout();
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Overview and stats',
    },
    {
      name: 'Monitors',
      href: '/monitors',
      icon: Monitor,
      description: 'Manage monitors',
    },
    {
      name: 'Add Monitor',
      href: '/monitors/add',
      icon: Plus,
      description: 'Create new monitor',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      description: 'Performance reports',
    },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  // Don't render sidebar on mobile - use bottom navigation instead
  if (isMobile) return null;

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    pingDaemon
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                >
                  <Monitor className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isCollapsed && (
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Collapsed toggle button - positioned at bottom right when collapsed */}
          {isCollapsed && (
            <button
              onClick={onToggle}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Theme Toggle Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <Palette className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`${isCollapsed ? 'relative' : ''}`}>
              <ThemeToggle />
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Theme Toggle
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group relative flex items-center px-3 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 flex-1"
                    >
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-80">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {/* User Avatar */}
              <div className="group relative">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                
                {/* User tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {user?.email?.split('@')[0]}
                </div>
              </div>
              
              {/* Logout Button */}
              <div className="group relative">
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
                </button>
                
                {/* Logout tooltip */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;