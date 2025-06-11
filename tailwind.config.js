/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F7E6',
          100: '#C3EAC3',
          200: '#9CDC9C',
          300: '#74CE74',
          400: '#4DC24D',
          500: '#25B525', // Main Volt.AI green
          600: '#1FA31F',
          700: '#188E18',
          800: '#127912',
          900: '#0B640B',
        },
        secondary: {
          50: '#E8F9E8',
          100: '#C7EEC7',
          200: '#A2E3A2',
          300: '#7DD77D',
          400: '#58CC58',
          500: '#33C033', // Light green accent
          600: '#2EAD2E',
          700: '#289728',
          800: '#228222',
          900: '#1B6D1B',
        },
        accent: {
          50: '#F0FBF0',
          100: '#D9F5D9',
          200: '#BFEEBF',
          300: '#A5E7A5',
          400: '#8BE08B',
          500: '#71D971', // Lighter accent
          600: '#67C567',
          700: '#5BAE5B',
          800: '#4F974F',
          900: '#438043',
        },
        success: {
          500: '#22C55E',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};