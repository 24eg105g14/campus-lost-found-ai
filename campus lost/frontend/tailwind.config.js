/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        electric: {
          blue: '#2563eb',
          'blue-light': '#38bdf8',
          red: '#fb7185',
          'red-strong': '#f43f5e',
          violet: '#818cf8',
        }
      },
      animation: {
        'electric-pulse': 'electricPulse 8s ease-in-out infinite',
        'electric-pulse-slow': 'electricPulse 12s ease-in-out infinite',
        'particle-drift': 'particleDrift 10s ease-in-out infinite',
        'particle-drift-slow': 'particleDrift 14s ease-in-out infinite',
        'glow-breathe': 'glowBreathe 6s ease-in-out infinite',
        'glow-breathe-slow': 'glowBreathe 8s ease-in-out infinite',
        'dash-travel': 'dashTravel 8s linear infinite',
        'dash-travel-reverse': 'dashTravel 10s linear infinite reverse',
        'energy-travel': 'energyTravel 6s ease-in-out infinite',
      },
      keyframes: {
        electricPulse: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(1px)' },
          '50%': { opacity: '0.8', filter: 'blur(0.5px)' },
        },
        particleDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '25%': { transform: 'translate(8px, -12px) scale(1.1)', opacity: '0.7' },
          '50%': { transform: 'translate(-5px, -8px) scale(0.9)', opacity: '0.4' },
          '75%': { transform: 'translate(12px, 5px) scale(1.05)', opacity: '0.6' },
          '100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
        },
        glowBreathe: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        dashTravel: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        energyTravel: {
          '0%': { offsetDistance: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { offsetDistance: '100%', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
