import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'healthy' | 'unhealthy' | 'unknown';
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, showPulse = true, size = 'md' }: StatusBadgeProps) => {
  const statusConfig = {
    healthy: {
      label: 'Healthy',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      pulseColor: 'bg-green-400',
    },
    unhealthy: {
      label: 'Down',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      pulseColor: 'bg-red-400',
    },
    unknown: {
      label: 'Unknown',
      icon: HelpCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      pulseColor: 'bg-gray-400',
    },
  };

  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-2',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.color} ${config.bgColor} ${config.borderColor}
        ${sizeStyles.container} ${sizeStyles.gap}
      `}
    >
      <div className="relative">
        <Icon className={sizeStyles.icon} />
        {showPulse && status !== 'unknown' && (
          <motion.div
            className={`absolute inset-0 rounded-full ${config.pulseColor} opacity-75`}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.75, 0, 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
      <span className="font-semibold">{config.label}</span>
    </motion.div>
  );
};

export default StatusBadge;