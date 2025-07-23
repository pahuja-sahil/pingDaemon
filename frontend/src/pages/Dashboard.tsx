import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Activity, Clock, CheckCircle, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useThemeStore } from '../stores/themeStore';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Layout from '../components/layout/Layout';
import Spinner from '../components/common/Spinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, chartData, statusDistribution, isLoading } = useDashboardStats();
  const { isDark } = useThemeStore();

  const StatCard = ({ icon: Icon, title, value, color }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: string;
  }) => (
    <Card hoverable className="p-4 md:p-6">
      <div className="flex items-center">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="ml-3 md:ml-4 min-w-0">
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
            Here's an overview of your website monitoring
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8"
        >
          <StatCard
            icon={Activity}
            title="Total Monitors"
            value={isLoading ? '...' : stats.totalMonitors}
            color="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={CheckCircle}
            title="Healthy"
            value={isLoading ? '...' : stats.healthyCount}
            color="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={AlertTriangle}
            title="Issues"
            value={isLoading ? '...' : stats.unhealthyCount}
            color="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          />
          <StatCard
            icon={Clock}
            title="Uptime"
            value={isLoading ? '--' : `${stats.uptimePercentage}%`}
            color="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {isLoading ? (
            <Card className="p-6 md:p-8 flex items-center justify-center">
              <Spinner size="lg" />
            </Card>
          ) : stats.totalMonitors === 0 ? (
            <Card className="p-6 md:p-8">
              <EmptyState
                icon={<Activity className="w-full h-full" />}
                title="No monitors yet"
                description="Get started by adding your first website monitor. We'll check its availability and notify you of any issues."
                action={{
                  label: 'Add Your First Monitor',
                  onClick: () => {
                    window.location.href = '/monitors/add';
                  },
                  variant: 'primary',
                }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Response Time Chart */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Response Times
                  </h3>
                </div>
                <div className="sm:hidden">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }}
                        className="text-gray-600 dark:text-gray-400"
                        hide
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        className="text-gray-600 dark:text-gray-400"
                        width={35}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--tooltip-bg)',
                          border: '1px solid var(--tooltip-border)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [`${value}ms`, 'Response Time']}
                        labelFormatter={(label) => `Website: ${label}`}
                      />
                      <Bar 
                        dataKey="responseTime" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-gray-600 dark:text-gray-400"
                      label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}ms`, 'Response Time']}
                      labelFormatter={(label) => `Website: ${label}`}
                    />
                    <Bar 
                      dataKey="responseTime" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Status Distribution Chart */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Monitor Status
                  </h3>
                </div>
                <div className="sm:hidden">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        borderRadius: '8px'
                      }}
                      labelStyle={{
                        color: isDark ? '#f1f5f9' : '#111827'
                      }}
                      itemStyle={{
                        color: isDark ? '#f1f5f9' : '#111827'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 md:mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/monitors/add">
              <Card hoverable clickable className="p-4 md:p-6">
                <div className="flex items-center">
                  <Plus className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="ml-3 md:ml-4 min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                      Add Monitor
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monitor a new website or API endpoint
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/monitors">
              <Card hoverable clickable className="p-4 md:p-6">
                <div className="flex items-center">
                  <Activity className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div className="ml-3 md:ml-4 min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                      View All Monitors
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage all your monitoring endpoints
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/reports">
              <Card hoverable clickable className="p-4 md:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="ml-3 md:ml-4 min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
                      View Reports
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Check uptime and performance reports
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;