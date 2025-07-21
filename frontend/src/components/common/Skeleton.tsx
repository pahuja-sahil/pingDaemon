import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
  isLoading?: boolean;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

const Skeleton = ({ 
  className = '', 
  children,
  isLoading = true,
  width,
  height,
  lines = 1,
  animate = true,
}: SkeletonProps) => {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  const baseClasses = "bg-gray-200 dark:bg-gray-700 rounded-md";
  const animationClasses = animate ? "animate-pulse" : "";
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
  };

  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            initial={animate ? { opacity: 0.3 } : false}
            animate={animate ? { 
              opacity: [0.3, 0.7, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
              }
            } : false}
            className={`${baseClasses} ${animationClasses}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%', // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0.3 } : false}
      animate={animate ? { 
        opacity: [0.3, 0.7, 0.3],
        transition: {
          duration: 1.5,
          repeat: Infinity,
        }
      } : false}
      className={`${baseClasses} ${animationClasses} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonText = ({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) => (
  <Skeleton lines={lines} className={className} />
);

export const SkeletonCard = ({ 
  className = '' 
}: { 
  className?: string; 
}) => (
  <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="flex items-start space-x-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
    <div className="mt-6 flex space-x-3">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  </div>
);

export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) => (
  <div className={`space-y-4 ${className}`}>
    {/* Table header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} className="h-4 flex-1" />
      ))}
    </div>
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ 
  items = 3, 
  className = '' 
}: { 
  items?: number; 
  className?: string; 
}) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export default Skeleton;