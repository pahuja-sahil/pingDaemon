/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          background: '#ffffff',
          foreground: '#f9fafb',
          card: '#ffffff',
          'card-hover': '#f3f4f6',
          'text-primary': '#111827',
          'text-secondary': '#6b7280',
          primary: '#3b82f6',
          'primary-hover': '#2563eb',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          border: '#e5e7eb',
        },
        dark: {
          background: '#0f172a',
          foreground: '#1e293b',
          card: '#1e293b',
          'card-hover': '#334155',
          'text-primary': '#f1f5f9',
          'text-secondary': '#94a3b8',
          primary: '#60a5fa',
          'primary-hover': '#3b82f6',
          success: '#34d399',
          danger: '#f87171',
          warning: '#fbbf24',
          border: '#334155',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

