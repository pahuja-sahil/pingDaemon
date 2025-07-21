export const APP_CONFIG = {
  name: 'pingDaemon',
  version: '1.0.0',
  description: 'Monitor your websites and APIs with ease',
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
};

export const MONITOR_CONFIG = {
  intervals: [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ],
  failureThresholds: [
    { value: 1, label: '1 failure' },
    { value: 2, label: '2 failures' },
    { value: 3, label: '3 failures' },
    { value: 5, label: '5 failures' },
    { value: 10, label: '10 failures' },
  ],
  statusColors: {
    healthy: 'text-green-600 dark:text-green-400',
    unhealthy: 'text-red-600 dark:text-red-400',
    unknown: 'text-gray-600 dark:text-gray-400',
    degraded: 'text-yellow-600 dark:text-yellow-400',
  },
  statusBadgeColors: {
    healthy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    unhealthy: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  },
};

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/',
  monitors: '/monitors',
  addMonitor: '/monitors/add',
  editMonitor: (id: string) => `/monitors/${id}/edit`,
} as const;

export const LOCAL_STORAGE_KEYS = {
  theme: 'theme-store',
  auth: 'auth-store',
} as const;

export const QUERY_KEYS = {
  monitors: ['monitors'] as const,
  monitor: (id: string) => ['monitors', id] as const,
  user: ['user'] as const,
} as const;