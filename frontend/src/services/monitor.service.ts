import api from './api';
import type { Monitor, CreateMonitorRequest, UpdateMonitorRequest, CheckTaskResponse } from '../types/monitor.types';

class MonitorService {
  async getMonitors(): Promise<Monitor[]> {
    const response = await api.get<Monitor[]>('/jobs');
    return response.data;
  }

  async getMonitor(id: string): Promise<Monitor> {
    const response = await api.get<Monitor>(`/jobs/${id}`);
    return response.data;
  }

  async createMonitor(data: CreateMonitorRequest): Promise<Monitor> {
    const response = await api.post<Monitor>('/jobs', data);
    return response.data;
  }

  async updateMonitor(id: string, data: UpdateMonitorRequest): Promise<Monitor> {
    const response = await api.put<Monitor>(`/jobs/${id}`, data);
    return response.data;
  }

  async deleteMonitor(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  }

  async toggleMonitor(id: string): Promise<Monitor> {
    const monitor = await this.getMonitor(id);
    const updatedData: UpdateMonitorRequest = {
      is_enabled: !monitor.is_enabled,
    };
    return await this.updateMonitor(id, updatedData);
  }

  async checkMonitorNow(id: string): Promise<CheckTaskResponse> {
    const response = await api.post<CheckTaskResponse>(`/jobs/${id}/check`);
    return response.data;
  }

  async getMonitorsPaginated(page: number = 1, limit: number = 10): Promise<{
    monitors: Monitor[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get<Monitor[]>(`/jobs?page=${page}&limit=${limit}`);
    const monitors = response.data;
    
    // For now, return all monitors since backend doesn't support pagination yet
    return {
      monitors,
      total: monitors.length,
      page: 1,
      pages: 1,
    };
  }

  async searchMonitors(query: string): Promise<Monitor[]> {
    const monitors = await this.getMonitors();
    return monitors.filter(monitor => 
      monitor.url.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const monitorService = new MonitorService();
export default monitorService;