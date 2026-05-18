/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'surface-0': '#0D1117',
        'surface-1': '#161B27',
        'surface-2': '#1E2537',
        'surface-light-0': '#F4F6FA',
        'surface-light-1': '#EEF2FB',
        'surface-light-2': '#FFFFFF',
        primary: {
          DEFAULT: '#3B8CE8',
          dark: '#3B8CE8',
          light: '#1A65C0',
          hover: '#2563EB',
          subtle: 'rgba(59,140,232,0.12)',
        },
        blueprint: {
          DEFAULT: '#7DD3FC',
          grid: 'rgba(59,140,232,0.06)',
          border: 'rgba(59,140,232,0.2)',
        },
        status: {
          paid: '#10B981',
          'paid-bg': 'rgba(16,185,129,0.12)',
          pending: '#F59E0B',
          'pending-bg': 'rgba(245,158,11,0.12)',
          overdue: '#EF4444',
          'overdue-bg': 'rgba(239,68,68,0.12)',
          active: '#3B8CE8',
          'active-bg': 'rgba(59,140,232,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.02em' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.06em' }],
        'mono-num': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        badge: '4px',
        input: '8px',
        card: '12px',
        modal: '16px',
      },
      spacing: {
        '4.5': '18px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        professional: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms ease-out',
        'slide-up': 'slide-up 400ms ease-in-out',
      },
    },
  },
  plugins: [],
}

module.exports = config
