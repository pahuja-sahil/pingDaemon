import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { setupSessionTimeoutWarning, isTokenExpired } from '../utils/sessionTimeout';

interface UseSessionTimeoutOptions {
  warningMinutes?: number;
  redirectOnTimeout?: boolean;
  showWarningToast?: boolean;
  showTimeoutToast?: boolean;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    warningMinutes = 5,
    redirectOnTimeout = true,
    showWarningToast = true,
    showTimeoutToast = true,
  } = options;

  const { token, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Only set up timeout if user is authenticated and has a token
    if (!isAuthenticated || !token) {
      return;
    }

    // Check if token is already expired
    if (isTokenExpired(token)) {
      handleTimeout();
      return;
    }

    // Set up session timeout monitoring
    cleanupRef.current = setupSessionTimeoutWarning(
      handleWarning,
      handleTimeout,
      warningMinutes
    );

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [token, isAuthenticated, warningMinutes]);

  const handleWarning = () => {
    if (showWarningToast) {
      toast.warning(
        `Your session will expire in ${warningMinutes} minutes. Please save your work.`,
        { duration: 10000 }
      );
    }
  };

  const handleTimeout = () => {
    if (showTimeoutToast) {
      toast.error('Your session has expired. Please sign in again.');
    }
    
    logout();
    
    if (redirectOnTimeout) {
      navigate('/', { replace: true });
    }
  };

  // Return methods to manually trigger actions
  return {
    handleWarning,
    handleTimeout,
  };
}