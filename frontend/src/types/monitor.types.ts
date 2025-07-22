export interface Monitor {
  id: string;
  url: string;
  interval: number;
  is_enabled: boolean;
  failure_threshold: number;
  current_status: 'healthy' | 'unhealthy' | 'unknown' | 'degraded';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMonitorRequest {
  url: string;
  interval: number;
  is_enabled: boolean;
  failure_threshold: number;
}

export interface UpdateMonitorRequest {
  url?: string;
  interval?: number;
  is_enabled?: boolean;
  failure_threshold?: number;
}

export interface CheckTaskResponse {
  success: boolean;
  task_id: string;
  job_id: string;
  scheduled_at: string;
  message: string;
}