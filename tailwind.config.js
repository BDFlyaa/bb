/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. 字体升级：这会自动替换 Vue 文件中 'font-sans' 的外观
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // 2. 颜色微调：增加饱和度和深邃感
      colors: {
        'ocean-dark': '#0B1221', 
        'ocean-deep': '#020617', // 主背景色
        'ocean-medium': '#1E293B',
        'ocean-light': '#334155',
        
        // 荧光绿系列，用于发光效果
        'sea-green': '#10B981', 
        'sea-green-light': '#34D399',
        'sea-green-dark': '#047857',
        
        'coral-red': '#EF4444',
        'wave-blue': '#3B82F6',
        'wave-blue-light': '#60A5FA',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // 深海微光背景
        'ocean-gradient': 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 60%)',
      },
      boxShadow: {
        // 光晕效果
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}