import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    hoverable = false,
    clickable = false,
    padding = 'md',
    className = '',
    ...props
  }, ref) => {
    const baseClasses = `
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
      shadow-sm transition-all duration-200
    `.trim().replace(/\s+/g, ' ');

    const hoverClasses = hoverable || clickable ? `
      hover:shadow-md hover:-translate-y-1
    ` : '';

    const clickableClasses = clickable ? 'cursor-pointer' : '';

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    const combinedClassName = `
      ${baseClasses} 
      ${hoverClasses} 
      ${clickableClasses} 
      ${paddingClasses[padding]} 
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const MotionComponent = hoverable || clickable ? motion.div : 'div';
    const motionProps = hoverable || clickable ? {
      whileHover: { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
      whileTap: clickable ? { scale: 0.98 } : undefined,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    } : {};

    return (
      <MotionComponent
        ref={ref}
        className={combinedClassName}
        {...motionProps}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </MotionComponent>
    );
  }
);

Card.displayName = 'Card';

export default Card;