/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ocean-dark': '#0B1120',
        'ocean-deep': '#0F172A',
        'ocean-medium': '#1E293B',
        'ocean-light': '#334155',
        'sea-green': '#10B981',
        'sea-green-light': '#34D399',
        'sea-green-dark': '#059669',
        'coral-red': '#EF4444',
        'wave-blue': '#3B82F6',
        'wave-blue-light': '#60A5FA',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/assets/hero-pattern.svg')", // 假设后续会加
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}