import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    disabled,
    fullWidth = false,
    className = '',
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2 rounded-lg font-medium
      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `.trim().replace(/\s+/g, ' ');

    const variantClasses = {
      primary: `
        bg-blue-600 hover:bg-blue-700 text-white 
        focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600
      `,
      secondary: `
        bg-gray-100 hover:bg-gray-200 text-gray-900 
        focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100
      `,
      danger: `
        bg-red-600 hover:bg-red-700 text-white 
        focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600
      `,
      ghost: `
        bg-transparent hover:bg-gray-100 text-gray-700 
        focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300
      `,
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const combinedClassName = `
      ${baseClasses} 
      ${variantClasses[variant]} 
      ${sizeClasses[size]} 
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <motion.button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...(props as Record<string, unknown>)}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;