import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    fullWidth = true,
    className = '',
    ...props
  }, ref) => {
    const containerClassName = fullWidth ? 'w-full' : '';

    const inputClasses = `
      block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200
      placeholder-gray-400 dark:placeholder-gray-500
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      ${startIcon ? 'pl-10' : ''}
      ${endIcon || error ? 'pr-10' : ''}
      ${error 
        ? `border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500
           dark:border-red-600 dark:text-red-100 dark:focus:border-red-500`
        : `border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500
           dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 
           dark:focus:border-blue-400 dark:focus:ring-blue-400`
      }
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={containerClassName}>
        {label && (
          <label 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 dark:text-gray-500">
                {startIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            className={`${inputClasses} ${className}`}
            {...props}
          />
          
          {(endIcon || error) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <div className="text-gray-400 dark:text-gray-500">
                  {endIcon}
                </div>
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;