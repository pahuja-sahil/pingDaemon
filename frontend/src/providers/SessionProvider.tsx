import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { setupSessionTimeoutWarning } from '../utils/sessionTimeout';

interface SessionContextType {
  // Context can be extended in the future if needed
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { token, isAuthenticated, logout } = useAuth();
  const cleanupRef = useRef<(() => void) | null>(null);
  const warningShownRef = useRef<boolean>(false);
  const lastToastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    // Only set up session timeout for authenticated users
    if (!isAuthenticated || !token) {
      // Clear any existing timeout and reset warning flag
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      warningShownRef.current = false;
      return;
    }

    // Clear any existing timeout
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Reset warning shown flag for new session
    warningShownRef.current = false;

    const handleWarning = () => {
      // Prevent duplicate warnings
      if (warningShownRef.current) {
        return;
      }

      warningShownRef.current = true;

      // Dismiss any existing session warning toast
      if (lastToastIdRef.current) {
        toast.dismiss(lastToastIdRef.current);
      }

      // Show warning toast with longer duration (20 seconds)
      lastToastIdRef.current = toast.warning(
        'Your session will expire in 5 minutes. Please save your work.',
        { 
          duration: 20000,
          id: 'session-warning' // Use consistent ID for deduplication
        }
      );
    };

    const handleTimeout = () => {
      // Dismiss any existing toasts
      if (lastToastIdRef.current) {
        toast.dismiss(lastToastIdRef.current);
      }

      // Show timeout notification
      toast.error('Your session has expired. Please login again.', {
        duration: 5000,
        id: 'session-expired'
      });

      // Logout the user
      logout();
    };

    // Set up session timeout monitoring with 5-minute warning
    cleanupRef.current = setupSessionTimeoutWarning(
      handleWarning,
      handleTimeout,
      5 // Warning 5 minutes before expiration
    );

    // Cleanup function
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      warningShownRef.current = false;
      if (lastToastIdRef.current) {
        toast.dismiss(lastToastIdRef.current);
        lastToastIdRef.current = null;
      }
    };
  }, [token, isAuthenticated, logout]);

  return (
    <SessionContext.Provider value={{}}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}