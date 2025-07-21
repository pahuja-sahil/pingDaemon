import { type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
}

const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '',
  ...props 
}: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const containerClassName = `
    flex items-center justify-center gap-3 ${className}
  `.trim();

  return (
    <div className={containerClassName} {...props}>
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60"
            strokeDashoffset="20"
            fill="none"
            className="opacity-25"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="15"
            strokeDashoffset="15"
            fill="none"
          />
        </svg>
      </motion.div>
      
      {text && (
        <span className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Spinner;