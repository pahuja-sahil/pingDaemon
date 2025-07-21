export interface Monitor {
  id: string;
  name?: string;
  url: string;
  interval: number;
  is_enabled: boolean;
  failure_threshold: number;
  timeout: number;
  expected_status_code?: number;
  expected_response_time?: number;
  notification_enabled: boolean;
  current_status: 'healthy' | 'unhealthy' | 'unknown' | 'degraded';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMonitorRequest {
  name?: string;
  url: string;
  interval: number;
  is_enabled: boolean;
  failure_threshold: number;
  timeout: number;
  expected_status_code?: number;
  expected_response_time?: number;
  notification_enabled: boolean;
}

export interface UpdateMonitorRequest {
  name?: string;
  url?: string;
  interval?: number;
  is_enabled?: boolean;
  failure_threshold?: number;
  timeout?: number;
  expected_status_code?: number;
  expected_response_time?: number;
  notification_enabled?: boolean;
}

export interface CheckTaskResponse {
  success: boolean;
  task_id: string;
  job_id: string;
  scheduled_at: string;
  message: string;
}