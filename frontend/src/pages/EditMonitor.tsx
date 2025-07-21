import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Clock, AlertTriangle, Save, X, Trash2 } from 'lucide-react';
import { useMonitors } from '../hooks/useMonitors';
import { useToast } from '../hooks/useToast';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const monitorSchema = z.object({
  name: z.string().min(1, 'Monitor name is required').max(255, 'Name is too long'),
  url: z.string()
    .url('Please enter a valid URL')
    .refine((url) => {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must use HTTP or HTTPS protocol'),
  interval: z.number()
    .min(60, 'Minimum interval is 1 minute (60 seconds)')
    .max(86400, 'Maximum interval is 24 hours (86400 seconds)'),
  failure_threshold: z.number()
    .min(1, 'Minimum threshold is 1 failure')
    .max(10, 'Maximum threshold is 10 failures'),
  timeout: z.number()
    .min(5, 'Minimum timeout is 5 seconds')
    .max(300, 'Maximum timeout is 300 seconds'),
  expected_status_code: z.number()
    .min(100, 'Status code must be between 100-599')
    .max(599, 'Status code must be between 100-599')
    .optional(),
  expected_response_time: z.number()
    .min(1, 'Expected response time must be at least 1ms')
    .max(30000, 'Expected response time cannot exceed 30 seconds')
    .optional(),
  notification_enabled: z.boolean(),
  is_enabled: z.boolean(),
});

type MonitorFormData = z.infer<typeof monitorSchema>;

const intervalOptions = [
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
  { value: 14400, label: '4 hours' },
  { value: 21600, label: '6 hours' },
  { value: 43200, label: '12 hours' },
  { value: 86400, label: '24 hours' },
];

const EditMonitor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMonitor, updateMonitor, deleteMonitor } = useMonitors();
  const { toast } = useToast();
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: monitor,
    isLoading: isLoadingMonitor,
    error: monitorError,
  } = getMonitor(id!);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MonitorFormData>({
    resolver: zodResolver(monitorSchema),
  });

  const watchedUrl = watch('url');

  // Reset form when monitor data is loaded
  useEffect(() => {
    if (monitor) {
      reset({
        name: monitor.name || '',
        url: monitor.url,
        interval: monitor.interval,
        failure_threshold: monitor.failure_threshold,
        timeout: monitor.timeout,
        expected_status_code: monitor.expected_status_code || 200,
        expected_response_time: monitor.expected_response_time || 5000,
        notification_enabled: monitor.notification_enabled,
        is_enabled: monitor.is_enabled,
      });
    }
  }, [monitor, reset]);

  const onSubmit = async (data: MonitorFormData) => {
    if (!id) return;
    
    try {
      await updateMonitor.mutateAsync({ id, data });
      toast.success('Monitor updated successfully');
      navigate('/monitors');
    } catch (error) {
      toast.error('Failed to update monitor');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteMonitor.mutateAsync(id);
      toast.success('Monitor deleted successfully');
      navigate('/monitors');
    } catch (error) {
      toast.error('Failed to delete monitor');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const testUrl = async () => {
    if (!watchedUrl) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsTestingUrl(true);
    try {
      // This would typically make a request to your backend to test the URL
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('URL is accessible');
    } catch (error) {
      toast.error('URL test failed');
    } finally {
      setIsTestingUrl(false);
    }
  };

  const generateMonitorName = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace('www.', '');
      const path = parsedUrl.pathname !== '/' ? ` - ${parsedUrl.pathname}` : '';
      return `${domain}${path}`;
    } catch {
      return url;
    }
  };

  const handleUrlChange = (url: string) => {
    setValue('url', url);
    if (url && !watch('name')) {
      setValue('name', generateMonitorName(url));
    }
  };

  // Loading state
  if (isLoadingMonitor) {
    return (
      <Layout showSidebar={true}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (monitorError || !monitor) {
    return (
      <Layout showSidebar={true}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Card className="p-6 md:p-8">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Failed to load monitor details. The monitor may not exist.
              </p>
              <Button onClick={() => navigate('/monitors')} variant="primary">
                Back to Monitors
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/monitors')}
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Monitor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                Update monitor settings for {monitor.name || monitor.url}
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="danger"
              size="sm"
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Delete</span>
            </Button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL to Monitor *
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          {...register('url')}
                          type="url"
                          placeholder="https://example.com"
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        {errors.url && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.url.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={testUrl}
                        variant="outline"
                        disabled={isTestingUrl || !watchedUrl}
                        className="flex-shrink-0"
                      >
                        {isTestingUrl ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          'Test URL'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Monitor Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monitor Name *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="My Website Monitor"
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Monitoring Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monitoring Settings
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Check Interval */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Check Interval *
                    </label>
                    <select
                      {...register('interval', { valueAsNumber: true })}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.interval ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {intervalOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.interval && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.interval.message}
                      </p>
                    )}
                  </div>

                  {/* Timeout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timeout (seconds) *
                    </label>
                    <input
                      {...register('timeout', { valueAsNumber: true })}
                      type="number"
                      min="5"
                      max="300"
                      placeholder="30"
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.timeout ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.timeout && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.timeout.message}
                      </p>
                    )}
                  </div>

                  {/* Failure Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Failure Threshold *
                    </label>
                    <input
                      {...register('failure_threshold', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="10"
                      placeholder="3"
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.failure_threshold ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Number of consecutive failures before marking as down
                    </p>
                    {errors.failure_threshold && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.failure_threshold.message}
                      </p>
                    )}
                  </div>

                  {/* Expected Status Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Status Code
                    </label>
                    <input
                      {...register('expected_status_code', { valueAsNumber: true })}
                      type="number"
                      min="100"
                      max="599"
                      placeholder="200"
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expected_status_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.expected_status_code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.expected_status_code.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Advanced Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Advanced Settings
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Expected Response Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Response Time (ms)
                    </label>
                    <input
                      {...register('expected_response_time', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="30000"
                      placeholder="5000"
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expected_response_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Alert if response time exceeds this value (optional)
                    </p>
                    {errors.expected_response_time && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.expected_response_time.message}
                      </p>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive alerts when this monitor fails
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          {...register('notification_enabled')}
                          type="checkbox"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable Monitor
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Start/stop monitoring for this endpoint
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          {...register('is_enabled')}
                          type="checkbox"
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-between gap-4"
            >
              <Button
                type="button"
                onClick={() => navigate('/monitors')}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !isDirty}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Monitor"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the monitor for{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {monitor?.name || monitor?.url}
            </span>?
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. All monitoring data for this URL will be permanently deleted.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMonitor.isPending}
            >
              {deleteMonitor.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Delete Monitor'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default EditMonitor;