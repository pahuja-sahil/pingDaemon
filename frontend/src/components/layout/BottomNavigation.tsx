import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Monitor, Plus, BarChart3 } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Monitors',
      href: '/monitors',
      icon: Monitor,
    },
    {
      name: 'Add',
      href: '/monitors/add',
      icon: Plus,
      special: true, // Special styling for add button
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/monitors/add' && location.pathname === '/monitors/add') return true;
    if (path === '/monitors' && location.pathname === '/monitors') return true;
    if (path === '/reports' && location.pathname === '/reports') return true;
    return false;
  };

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-pb shadow-lg"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto px-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex flex-col items-center justify-center relative transition-all duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              {/* Special add button styling */}
              {item.special ? (
                <div className="flex flex-col items-center justify-center">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 mb-1
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium transition-all ${isActive ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-70'}`}>
                    {item.name}
                  </span>
                </div>
              ) : (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-xs mt-1 font-medium transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;