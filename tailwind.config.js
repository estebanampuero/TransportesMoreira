/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          md:      'rgba(255,255,255,0.08)',
          lg:      'rgba(255,255,255,0.12)',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-dark':  'linear-gradient(180deg, #0b1121 0%, #0f172a 100%)',
        'orb-blue':  'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
        'orb-cyan':  'radial-gradient(circle, rgba(6,182,212,0.20) 0%, transparent 70%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.3)',
        'brand-glow': '0 0 40px rgba(59,130,246,0.3)',
        'cyan-glow':  '0 0 40px rgba(6,182,212,0.25)',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease-out forwards',
        'scroll':    'scroll 40s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':     'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scroll: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
