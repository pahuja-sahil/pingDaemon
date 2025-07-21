import { Clock } from 'lucide-react';
import { formatInterval } from '../../utils/formatters';

interface IntervalBadgeProps {
  interval: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const IntervalBadge = ({ interval, size = 'md', showIcon = true }: IntervalBadgeProps) => {
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  const sizeStyles = sizeConfig[size];

  return (
    <div className={`
      inline-flex items-center font-medium rounded-full
      bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300
      border border-blue-200 dark:border-blue-800
      ${sizeStyles.container} ${sizeStyles.gap}
    `}>
      {showIcon && (
        <Clock className={sizeStyles.icon} />
      )}
      <span className="font-semibold">{formatInterval(interval)}</span>
    </div>
  );
};

export default IntervalBadge;