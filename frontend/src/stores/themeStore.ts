import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,

      toggle: () => {
        const newIsDark = !get().isDark;
        set({ isDark: newIsDark });
        updateDocumentTheme(newIsDark);
      },

      setTheme: (isDark: boolean) => {
        set({ isDark });
        updateDocumentTheme(isDark);
      },
    }),
    {
      name: 'theme-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme immediately when store is rehydrated
          updateDocumentTheme(state.isDark);
        }
      },
    }
  )
);

// Helper function to update document theme with smooth transition
function updateDocumentTheme(isDark: boolean): void {
  const root = document.documentElement;
  
  // Add transition class for smooth theme switching
  root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Remove transition after it completes to avoid affecting other animations
  setTimeout(() => {
    root.style.removeProperty('transition');
  }, 300);
}

// Initialize theme on first load
if (typeof window !== 'undefined') {
  // Check system preference if no stored preference exists
  const storedTheme = localStorage.getItem('theme-store');
  if (!storedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    useThemeStore.getState().setTheme(prefersDark);
  }
}