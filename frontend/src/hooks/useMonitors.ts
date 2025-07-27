import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import monitorService from '../services/monitor.service';
import type { Monitor, CreateMonitorRequest, UpdateMonitorRequest } from '../types/monitor.types';

const QUERY_KEYS = {
  monitors: ['monitors'] as const,
  monitor: (id: string) => ['monitors', id] as const,
};

export const useMonitors = () => {
  const queryClient = useQueryClient();

  // Get all monitors
  const {
    data: monitors = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.monitors,
    queryFn: monitorService.getMonitors,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Create monitor mutation
  const createMonitorMutation = useMutation({
    mutationFn: (data: CreateMonitorRequest) => monitorService.createMonitor(data),
    onSuccess: (newMonitor) => {
      queryClient.setQueryData<Monitor[]>(QUERY_KEYS.monitors, (old = []) => [...old, newMonitor]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create monitor');
    },
  });

  // Update monitor mutation
  const updateMonitorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMonitorRequest }) =>
      monitorService.updateMonitor(id, data),
    onSuccess: (updatedMonitor) => {
      queryClient.setQueryData<Monitor[]>(QUERY_KEYS.monitors, (old = []) =>
        old.map((monitor) => (monitor.id === updatedMonitor.id ? updatedMonitor : monitor))
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitor(updatedMonitor.id) });
      toast.success('Monitor updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update monitor');
    },
  });

  // Delete monitor mutation
  const deleteMonitorMutation = useMutation({
    mutationFn: (id: string) => monitorService.deleteMonitor(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Monitor[]>(QUERY_KEYS.monitors, (old = []) =>
        old.filter((monitor) => monitor.id !== deletedId)
      );
      queryClient.removeQueries({ queryKey: QUERY_KEYS.monitor(deletedId) });
      toast.success('Monitor deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete monitor');
    },
  });

  // Toggle monitor mutation
  const toggleMonitorMutation = useMutation({
    mutationFn: (id: string) => monitorService.toggleMonitor(id),
    onSuccess: (updatedMonitor) => {
      queryClient.setQueryData<Monitor[]>(QUERY_KEYS.monitors, (old = []) =>
        old.map((monitor) => (monitor.id === updatedMonitor.id ? updatedMonitor : monitor))
      );
      toast.success(`Monitor ${updatedMonitor.is_enabled ? 'enabled' : 'disabled'}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle monitor');
    },
  });

  // Check monitor now mutation
  const checkMonitorNowMutation = useMutation({
    mutationFn: (id: string) => monitorService.checkMonitorNow(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Health check scheduled');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitors });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule health check');
    },
  });

  // Immediate health check mutation
  const immediateHealthCheckMutation = useMutation({
    mutationFn: (id: string) => monitorService.performImmediateHealthCheck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monitors });
    },
    onError: (error: Error) => {
      console.error('Health check failed:', error);
    },
  });

  return {
    // Data
    monitors,
    isLoading,
    isError,
    error,
    
    // Actions
    refetch,
    createMonitor: createMonitorMutation,
    updateMonitor: updateMonitorMutation,
    deleteMonitor: deleteMonitorMutation,
    toggleMonitor: toggleMonitorMutation,
    checkMonitor: checkMonitorNowMutation,
    immediateHealthCheck: immediateHealthCheckMutation.mutateAsync,
    getMonitor: useMonitor,
    
    // Mutation states
    isCreating: createMonitorMutation.isPending,
    isUpdating: updateMonitorMutation.isPending,
    isDeleting: deleteMonitorMutation.isPending,
    isToggling: toggleMonitorMutation.isPending,
    isChecking: checkMonitorNowMutation.isPending,
    isImmediateChecking: immediateHealthCheckMutation.isPending,
  };
};

// Hook for getting a single monitor
export const useMonitor = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.monitor(id),
    queryFn: () => monitorService.getMonitor(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};