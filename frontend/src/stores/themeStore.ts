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
          updateDocumentTheme(state.isDark);
        }
      },
    }
  )
);

function updateDocumentTheme(isDark: boolean): void {
  const root = document.documentElement;
  
  root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  setTimeout(() => {
    root.style.removeProperty('transition');
  }, 300);
}

if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme-store');
  if (!storedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    useThemeStore.getState().setTheme(prefersDark);
  }
}