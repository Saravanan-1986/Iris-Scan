import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6FD4',
          50: '#EBF3FC',
          100: '#D1E5F8',
          200: '#A3CBF1',
          300: '#75B1EA',
          400: '#4797E3',
          500: '#1A6FD4',
          600: '#1559AA',
          700: '#104380',
          800: '#0B2D55',
          900: '#05162A',
        },
        secondary: {
          DEFAULT: '#0FA878',
          50: '#E7F8F2',
          100: '#C3EFE0',
          200: '#87DFC1',
          300: '#4BCFA2',
          400: '#0FA878',
          500: '#0C8A63',
          600: '#0A6C4E',
          700: '#074E38',
          800: '#053023',
          900: '#02120D',
        },
        warning: {
          DEFAULT: '#E07B39',
          50: '#FDF1E8',
          100: '#F9DDC5',
          200: '#F3BB8A',
          300: '#ED9950',
          400: '#E07B39',
          500: '#C66222',
          600: '#9E4E1B',
          700: '#763A14',
          800: '#4E260D',
          900: '#261306',
        },
        danger: {
          DEFAULT: '#D64545',
          50: '#FCEAEA',
          100: '#F7CACA',
          200: '#EF9595',
          300: '#E76060',
          400: '#D64545',
          500: '#B13131',
          600: '#8B2626',
          700: '#651B1B',
          800: '#3F1111',
          900: '#190606',
        },
        neutral: {
          DEFAULT: '#6B7280',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        surface: {
          DEFAULT: '#F8F9FC',
          dark: '#1C1E26',
        },
        text: {
          primary: '#1A1A2E',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '13px',
        'sm': '14px',
        'base': '16px',
        'lg': '20px',
        'xl': '28px',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'glass': '0 4px 20px rgba(0,0,0,0.08)',
      },
      borderWidth: {
        'subtle': '0.5px',
      },
      borderColor: {
        subtle: '#E5E7EB',
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
};

export default config;