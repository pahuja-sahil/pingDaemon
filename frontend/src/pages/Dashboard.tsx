import { motion } from 'framer-motion';
import { Plus, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Layout from '../components/layout/Layout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's an overview of your website monitoring
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card hoverable className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Monitors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </Card>

          <Card hoverable className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Healthy
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </Card>

          <Card hoverable className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Issues
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </Card>

          <Card hoverable className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8">
            <EmptyState
              icon={<Activity className="w-full h-full" />}
              title="No monitors yet"
              description="Get started by adding your first website monitor. We'll check its availability and notify you of any issues."
              action={{
                label: 'Add Your First Monitor',
                onClick: () => {
                  // TODO: Navigate to add monitor page
                },
                variant: 'primary',
              }}
            />
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card hoverable clickable className="p-6">
              <div className="flex items-center">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Add Monitor
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor a new website or API endpoint
                  </p>
                </div>
              </div>
            </Card>

            <Card hoverable clickable className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    View All Monitors
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage all your monitoring endpoints
                  </p>
                </div>
              </div>
            </Card>

            <Card hoverable clickable className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    View Reports
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check uptime and performance reports
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;