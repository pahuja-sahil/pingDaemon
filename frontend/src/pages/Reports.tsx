import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Globe, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useReportsData } from '../hooks/useReportsData';
import { useThemeStore } from '../stores/themeStore';
import Card from '../components/common/Card';
import Layout from '../components/layout/Layout';
import Spinner from '../components/common/Spinner';

const Reports = () => {
  console.log('🚨 REPORTS COMPONENT RENDERING - Updated version with real data hooks');
  const { stats, isLoading: dashboardLoading } = useDashboardStats();
  const { 
    uptimeHistory, 
    responseTimeHistory, 
    incidentsByDay, 
    metrics, 
    isLoading: reportsLoading, 
    isError: reportsError 
  } = useReportsData();
  const { isDark } = useThemeStore();

  const isLoading = dashboardLoading || reportsLoading;

  const ReportCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    trend, 
    trendValue, 
    color 
  }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    color: string;
  }) => (
    <Card hoverable className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : trend === 'down'
            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          <span>{trendValue}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout showSidebar={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Performance Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Detailed insights and analytics for your monitored endpoints
          </p>
        </motion.div>

        {isLoading ? (
          <Card className="p-8 flex items-center justify-center">
            <Spinner size="lg" />
          </Card>
        ) : reportsError ? (
          <Card className="p-8 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Unable to Load Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                There was an error loading your reports data. Please try again.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <ReportCard
                icon={Target}
                title="Average Uptime"
                value={metrics.avgUptime}
                subtitle="Last 30 days"
                trend="neutral"
                trendValue="--"
                color="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              />
              <ReportCard
                icon={Zap}
                title="Avg Response Time"
                value={metrics.avgResponseTime}
                subtitle="Last 30 days"
                trend="neutral"
                trendValue="--"
                color="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              />
              <ReportCard
                icon={AlertTriangle}
                title="Total Incidents"
                value={metrics.totalIncidents}
                subtitle="Last 30 days"
                trend="neutral"
                trendValue="--"
                color="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              />
              <ReportCard
                icon={Activity}
                title="Checks Performed"
                value={metrics.checksPerformed.toLocaleString()}
                subtitle="Last 30 days"
                trend="neutral"
                trendValue="--"
                color="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
              />
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Uptime History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Uptime History
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={uptimeHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        domain={[95, 100]}
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                        label={{ value: 'Uptime %', angle: -90, position: 'insideLeft' }}
                      />
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
                        formatter={(value) => [`${value}%`, 'Uptime']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="uptime" 
                        stroke="#10b981" 
                        fill="#10b981"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Response Time Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Response Time Trends
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responseTimeHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="time" 
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
                        formatter={(value) => [`${value}ms`, 'Response Time']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>

            {/* Incidents by Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <Calendar className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Incidents This Week
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentsByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-gray-600 dark:text-gray-400"
                      label={{ value: 'Incidents', angle: -90, position: 'insideLeft' }}
                    />
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
                      formatter={(value) => [`${value}`, 'Incidents']}
                    />
                    <Bar 
                      dataKey="incidents" 
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monitor Summary
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {stats.totalMonitors || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Monitors
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      24/7
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Monitoring Coverage
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      5min
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Check Frequency
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;