import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Monitor validation schemas
export const createMonitorSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url);
          return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
          return false;
        }
      },
      'URL must use HTTP or HTTPS protocol'
    ),
  interval: z
    .number()
    .int('Interval must be a whole number')
    .min(5, 'Minimum interval is 5 minutes')
    .max(60, 'Maximum interval is 60 minutes')
    .refine(
      (interval) => [5, 10, 15, 30, 60].includes(interval),
      'Interval must be 5, 10, 15, 30, or 60 minutes'
    ),
  failure_threshold: z
    .number()
    .int('Failure threshold must be a whole number')
    .min(1, 'Minimum failure threshold is 1')
    .max(10, 'Maximum failure threshold is 10'),
  is_enabled: z.boolean(),
});

export const updateMonitorSchema = createMonitorSchema.partial();

// Search validation schemas
export const searchSchema = z.object({
  query: z
    .string()
    .min(0)
    .max(100, 'Search query is too long'),
});

// URL validation helper
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[^a-zA-Z\d]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  return { score, feedback };
};

// Type exports for use with react-hook-form
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateMonitorFormData = z.infer<typeof createMonitorSchema>;
export type UpdateMonitorFormData = z.infer<typeof updateMonitorSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;