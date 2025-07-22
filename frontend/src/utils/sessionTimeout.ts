import { useAuthStore } from '../stores/authStore';

export interface DecodedToken {
  exp: number;
  sub: string;
  [key: string]: any;
}

export function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function getTokenExpirationTime(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return decoded.exp * 1000; // Convert to milliseconds
}

export function getTimeUntilExpiration(token: string): number | null {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return null;
  
  return expirationTime - Date.now();
}

export function setupSessionTimeoutWarning(
  onWarning: () => void,
  onTimeout: () => void,
  warningMinutes = 5
) {
  const { token } = useAuthStore.getState();
  if (!token) return null;

  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (!timeUntilExpiration || timeUntilExpiration <= 0) {
    onTimeout();
    return null;
  }

  const warningTime = warningMinutes * 60 * 1000; // Convert to milliseconds
  const timeUntilWarning = timeUntilExpiration - warningTime;

  let warningTimeout: NodeJS.Timeout | null = null;
  let expirationTimeout: NodeJS.Timeout | null = null;

  // Set up warning timeout (5 minutes before expiration)
  if (timeUntilWarning > 0) {
    warningTimeout = setTimeout(() => {
      onWarning();
    }, timeUntilWarning);
  } else {
    // If we're already within warning period, show warning immediately
    onWarning();
  }

  // Set up expiration timeout
  expirationTimeout = setTimeout(() => {
    onTimeout();
  }, timeUntilExpiration);

  // Return cleanup function
  return () => {
    if (warningTimeout) clearTimeout(warningTimeout);
    if (expirationTimeout) clearTimeout(expirationTimeout);
  };
}