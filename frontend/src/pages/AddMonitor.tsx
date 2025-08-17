import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Clock, AlertTriangle, Save, X } from 'lucide-react';
import { useMonitors } from '../hooks/useMonitors';
import { useToast } from '../hooks/useToast';
import monitorService from '../services/monitor.service';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const monitorSchema = z.object({
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
    .refine((val) => [5, 10, 15, 30, 60].includes(val), 
      'Interval must be 5, 10, 15, 30, or 60 minutes'),
  failure_threshold: z.number()
    .min(1, 'Minimum threshold is 1 failure')
    .max(10, 'Maximum threshold is 10 failures'),
  is_enabled: z.boolean(),
});

type MonitorFormData = z.infer<typeof monitorSchema>;

const intervalOptions = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' },
];

const AddMonitor = () => {
  const navigate = useNavigate();
  const { createMonitor } = useMonitors();
  const { toast } = useToast();
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MonitorFormData>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      url: '',
      interval: 5,
      failure_threshold: 3,
      is_enabled: true,
    },
  });

  const watchedUrl = watch('url');

  const onSubmit = async (data: MonitorFormData) => {
    try {
      // Create the monitor - backend automatically schedules health check
      await createMonitor.mutateAsync(data);
      
      // Show success toast for monitor creation
      toast.success('Monitor created successfully! Initial health check scheduled.');
      
      navigate('/monitors');
    } catch (error) {
      console.error('Failed to create monitor:', error);
      toast.error('Failed to create monitor');
    }
  };

  const testUrl = async () => {
    if (!watchedUrl) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsTestingUrl(true);
    try {
      const result = await monitorService.testUrl(watchedUrl);
      
      if (result.is_accessible) {
        toast.success(`URL is accessible (${result.status_code}, ${result.response_time}ms)`);
      } else {
        toast.error(result.error_message || 'URL is not accessible');
      }
    } catch (error: any) {
      toast.error(error.message || 'URL test failed');
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setValue('url', url);
  };

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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Add Monitor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                Create a new website or API endpoint monitor
              </p>
            </div>
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

                <div className="space-y-6">
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

                </div>
              </Card>
            </motion.div>

            {/* Monitor Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monitor Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Monitor
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Start monitoring immediately after creation
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
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Monitor
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddMonitor;