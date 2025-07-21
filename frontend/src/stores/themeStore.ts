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

// Helper function to update document theme
function updateDocumentTheme(isDark: boolean): void {
  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
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