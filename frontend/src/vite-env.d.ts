/// <reference types="vite/client" />

// Google Sign-In TypeScript declarations
interface GoogleUser {
  credential: string;
  select_by: string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleUser) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
    }) => void;
    prompt: (callback?: (notification: any) => void) => void;
    renderButton: (element: HTMLElement, config: any) => void;
  };
}

interface Window {
  google?: {
    accounts: GoogleAccounts;
  };
}
