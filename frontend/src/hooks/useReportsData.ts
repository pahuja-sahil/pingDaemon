import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// Types matching backend schema
export interface UptimeHistoryItem {
  date: string;
  uptime: number;
}

export interface ResponseTimeItem {
  time: string;
  responseTime: number;
}

export interface IncidentItem {
  day: string;
  incidents: number;
}

export interface PerformanceMetrics {
  avgUptime: string;
  avgResponseTime: string;
  totalIncidents: number;
  checksPerformed: number;
}

export interface ReportsData {
  uptimeHistory: UptimeHistoryItem[];
  responseTimeHistory: ResponseTimeItem[];
  incidentsByDay: IncidentItem[];
  metrics: PerformanceMetrics;
}

// API functions
const fetchReportsData = async (): Promise<ReportsData> => {
  console.log('🔍 Fetching reports data from /reports/');
  const response = await api.get('/reports/');
  console.log('📊 Reports data received:', response.data);
  return response.data;
};

const fetchUptimeHistory = async (days: number = 7): Promise<UptimeHistoryItem[]> => {
  const response = await api.get(`/reports/uptime-history?days=${days}`);
  return response.data;
};

const fetchResponseTimes = async (hours: number = 24): Promise<ResponseTimeItem[]> => {
  const response = await api.get(`/reports/response-times?hours=${hours}`);
  return response.data;
};

const fetchIncidents = async (): Promise<IncidentItem[]> => {
  const response = await api.get('/reports/incidents');
  return response.data;
};

const fetchMetrics = async (): Promise<PerformanceMetrics> => {
  const response = await api.get('/reports/metrics');
  return response.data;
};

// Main hook - fetches all reports data in one call (most efficient)
export const useReportsData = () => {
  const {
    data: reportsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReportsData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const hookReturn = {
    // Data
    uptimeHistory: reportsData?.uptimeHistory || [],
    responseTimeHistory: reportsData?.responseTimeHistory || [],
    incidentsByDay: reportsData?.incidentsByDay || [],
    metrics: reportsData?.metrics || {
      avgUptime: '0.0%',
      avgResponseTime: '0ms',
      totalIncidents: 0,
      checksPerformed: 0,
    },
    
    // States
    isLoading,
    isError,
    error,
    
    // Actions
    refetch,
  };
  
  console.log('🎯 useReportsData returning:', {
    uptimeHistoryLength: hookReturn.uptimeHistory.length,
    responseTimeHistoryLength: hookReturn.responseTimeHistory.length,
    incidentsByDayLength: hookReturn.incidentsByDay.length,
    metrics: hookReturn.metrics,
    isLoading: hookReturn.isLoading,
    isError: hookReturn.isError
  });
  
  return hookReturn;
};

// Individual hooks if needed for specific endpoints
export const useUptimeHistory = (days: number = 7) => {
  return useQuery({
    queryKey: ['reports', 'uptime-history', days],
    queryFn: () => fetchUptimeHistory(days),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useResponseTimes = (hours: number = 24) => {
  return useQuery({
    queryKey: ['reports', 'response-times', hours],
    queryFn: () => fetchResponseTimes(hours),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useIncidents = () => {
  return useQuery({
    queryKey: ['reports', 'incidents'],
    queryFn: fetchIncidents,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useMetrics = () => {
  return useQuery({
    queryKey: ['reports', 'metrics'],
    queryFn: fetchMetrics,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};