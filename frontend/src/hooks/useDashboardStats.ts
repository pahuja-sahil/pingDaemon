import { useMemo } from 'react';
import { useMonitors } from './useMonitors';

export interface DashboardStats {
  totalMonitors: number;
  healthyCount: number;
  unhealthyCount: number;
  unknownCount: number;
  avgResponseTime: string;
  uptimePercentage: string;
}

export interface ChartDataPoint {
  name: string;
  url: string;
  responseTime: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  uptime: number;
}

export const useDashboardStats = () => {
  const { monitors, isLoading, isError, error, refetch } = useMonitors();

  const stats: DashboardStats = useMemo(() => {
    if (!monitors || monitors.length === 0) {
      return {
        totalMonitors: 0,
        healthyCount: 0,
        unhealthyCount: 0,
        unknownCount: 0,
        avgResponseTime: '--',
        uptimePercentage: '--',
      };
    }

    const totalMonitors = monitors.length;
    const healthyCount = monitors.filter(m => m.current_status === 'healthy').length;
    const unhealthyCount = monitors.filter(m => m.current_status === 'unhealthy').length;
    const unknownCount = monitors.filter(m => m.current_status === 'unknown').length;
    
    // Calculate uptime percentage
    const uptimePercentage = totalMonitors > 0 
      ? ((healthyCount / totalMonitors) * 100).toFixed(1)
      : '0.0';

    return {
      totalMonitors,
      healthyCount,
      unhealthyCount,
      unknownCount,
      avgResponseTime: '--', // Will be updated when backend provides response time data
      uptimePercentage,
    };
  }, [monitors]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!monitors || monitors.length === 0) {
      return [];
    }

    return monitors.map((monitor) => {
      // Extract domain from URL for cleaner display
      const domain = monitor.url.replace(/^https?:\/\//, '').split('/')[0];
      
      return {
        name: domain,
        url: monitor.url,
        responseTime: Math.floor(Math.random() * 500) + 50, // Mock data for now
        status: monitor.current_status,
        uptime: monitor.current_status === 'healthy' ? 99.9 : 
                monitor.current_status === 'unhealthy' ? 85.2 : 95.0, // Mock uptime data
      };
    });
  }, [monitors]);

  const statusDistribution = useMemo(() => [
    { name: 'Healthy', value: stats.healthyCount, color: '#10b981' },
    { name: 'Issues', value: stats.unhealthyCount, color: '#ef4444' },
    { name: 'Unknown', value: stats.unknownCount, color: '#f59e0b' },
  ].filter(item => item.value > 0), [stats]);

  return {
    // Data
    stats,
    chartData,
    statusDistribution,
    monitors,
    
    // States
    isLoading,
    isError,
    error,
    
    // Actions
    refetch,
  };
};