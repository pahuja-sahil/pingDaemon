export interface Monitor {
  id: string;
  url: string;
  interval: number;
  is_enabled: boolean;
  failure_threshold: number;
  current_status: 'healthy' | 'unhealthy' | 'unknown';
  previous_status: 'healthy' | 'unhealthy' | 'unknown';
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

export interface HealthCheckResult {
  is_healthy: boolean;
  status_code: number;
  response_time: number; // milliseconds
  error_message?: string;
}

export interface TaskStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: {
    job_id: string;
    job_url: string;
    check_result: HealthCheckResult;
    current_status: 'healthy' | 'unhealthy' | 'unknown';
    should_alert: boolean;
    health_log_id: string;
    skipped: boolean;
  };
  error?: string;
}