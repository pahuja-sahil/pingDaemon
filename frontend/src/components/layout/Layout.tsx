import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showHeader && <Header />}
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${showHeader ? 'pt-0' : 'pt-16'}`}
      >
        {children}
      </motion.main>

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