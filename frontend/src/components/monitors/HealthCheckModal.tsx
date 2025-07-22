import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  Activity, 
  AlertTriangle
} from 'lucide-react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
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
  const getStatusColor = (isHealthy?: boolean) => {
    if (isHealthy === undefined) return 'text-gray-500';
    return isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = (isHealthy?: boolean) => {
    if (isHealthy === undefined) return <Activity className="w-5 h-5" />;
    return isHealthy ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <XCircle className="w-5 h-5" />
    );
  };

  const getStatusText = (isHealthy?: boolean) => {
    if (isHealthy === undefined) return 'Unknown';
    return isHealthy ? 'Healthy' : 'Unhealthy';
  };

  const formatResponseTime = (responseTime?: number) => {
    if (responseTime === undefined) return 'N/A';
    
    if (responseTime < 1000) {
      return `${Math.round(responseTime)}ms`;
    } else {
      return `${(responseTime / 1000).toFixed(2)}s`;
    }
  };

  const getResponseTimeColor = (responseTime?: number) => {
    if (responseTime === undefined) return 'text-gray-500';
    
    if (responseTime < 500) return 'text-green-600 dark:text-green-400';
    if (responseTime < 1500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusCodeColor = (statusCode?: number) => {
    if (statusCode === undefined) return 'text-gray-500';
    
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 dark:text-green-400';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 dark:text-blue-400';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Health Check Results" size="lg">
      <div className="space-y-6 max-w-none">
        {/* URL Header */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {url}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Checking health status...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Health Check Failed
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={getStatusColor(result.is_healthy)}>
                  {getStatusIcon(result.is_healthy)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Overall Status
                  </h3>
                  <p className={`text-lg font-semibold ${getStatusColor(result.is_healthy)}`}>
                    {getStatusText(result.is_healthy)}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HTTP Status Code */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status Code
                  </span>
                </div>
                <p className={`text-xl font-bold ${getStatusCodeColor(result.status_code)}`}>
                  {result.status_code}
                </p>
              </div>

              {/* Response Time */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Response Time
                  </span>
                </div>
                <p className={`text-xl font-bold ${getResponseTimeColor(result.response_time)}`}>
                  {formatResponseTime(result.response_time)}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {result.error_message && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
                    Error Details
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {result.error_message}
                </p>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </Modal>
  );
};

export default HealthCheckModal;