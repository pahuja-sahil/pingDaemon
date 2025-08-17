import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import Modal from '../common/Modal';
import type { HealthCheckResult } from '../../types/monitor.types';

interface HealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  result?: HealthCheckResult;
  isLoading?: boolean;
  error?: string;
}

const HealthCheckModal = ({ 
  isOpen, 
  onClose, 
  url, 
  result, 
  isLoading, 
  error 
}: HealthCheckModalProps) => {
  const getStatusConfig = (isHealthy?: boolean) => {
    if (isHealthy === undefined) {
      return {
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        icon: Activity,
        text: 'Unknown',
        borderColor: 'border-gray-200 dark:border-gray-600'
      };
    }
    
    return isHealthy ? {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: CheckCircle2,
      text: 'Healthy',
      borderColor: 'border-green-200 dark:border-green-800'
    } : {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: XCircle,
      text: 'Unhealthy',
      borderColor: 'border-red-200 dark:border-red-800'
    };
  };

  const formatResponseTime = (responseTime?: number) => {
    if (responseTime === undefined) return 'N/A';
    
    if (responseTime < 1000) {
      return `${Math.round(responseTime)}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(2)}s`;
    }
  };

  const getResponseTimeConfig = (responseTime?: number) => {
    if (responseTime === undefined) {
      return {
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        icon: Minus,
        label: 'Unknown'
      };
    }
    
    if (responseTime < 500) {
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        icon: TrendingUp,
        label: 'Excellent'
      };
    } else if (responseTime < 1500) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        icon: TrendingUp,
        label: 'Good'
      };
    } else {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        icon: TrendingDown,
        label: 'Slow'
      };
    }
  };

  const getStatusCodeConfig = (statusCode?: number) => {
    if (statusCode === undefined) {
      return {
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-800'
      };
    }
    
    if (statusCode >= 200 && statusCode < 300) {
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      };
    } else if (statusCode >= 300 && statusCode < 400) {
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      };
    } else if (statusCode >= 400 && statusCode < 500) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
      };
    } else {
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      };
    }
  };

  const statusConfig = getStatusConfig(result?.is_healthy);
  const responseTimeConfig = getResponseTimeConfig(result?.response_time);
  const statusCodeConfig = getStatusCodeConfig(result?.status_code);
  const StatusIcon = statusConfig.icon;
  const ResponseTimeIcon = responseTimeConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Health Check Results" size="lg">
      <div className="space-y-6">
        {/* URL Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {url}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Target endpoint
            </p>
          </div>
        </motion.div>

        {/* Content Area - Single AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="relative">
                {/* Outer Ring */}
                <motion.div
                  className="w-20 h-20 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner Spinner */}
                <motion.div
                  className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Checking Health Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we test your endpoint...
                </p>
              </motion.div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Health Check Failed
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Overall Status */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className={`p-6 rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${statusConfig.bgColor} rounded-full flex items-center justify-center border-2 ${statusConfig.borderColor}`}>
                    <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Overall Status
                    </h3>
                    <p className={`text-2xl font-bold ${statusConfig.color}`}>
                      {statusConfig.text}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HTTP Status Code */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  className={`p-5 rounded-xl border ${statusCodeConfig.bgColor} border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status Code
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${statusCodeConfig.color} mb-1`}>
                    {result.status_code || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    HTTP Response
                  </p>
                </motion.div>

                {/* Response Time */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  className={`p-5 rounded-xl border ${responseTimeConfig.bgColor} border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Response Time
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${responseTimeConfig.color}`}>
                      {formatResponseTime(result.response_time)}
                    </p>
                    <ResponseTimeIcon className={`w-5 h-5 ${responseTimeConfig.color} mb-1`} />
                  </div>
                  <p className={`text-xs font-medium ${responseTimeConfig.color}`}>
                    {responseTimeConfig.label}
                  </p>
                </motion.div>
              </div>

              {/* Error Message */}
              {result.error_message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                  className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                        Error Details
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                        {result.error_message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {result.is_healthy && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                  className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Your endpoint is responding normally and all checks passed.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default HealthCheckModal;