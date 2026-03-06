/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ============================================
      // COLORS (Sincronizadas com design-tokens.ts)
      // ============================================
      colors: {
        // PRIMARY - ORUS Green (Brand Color)
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22c55e', // Main ORUS Green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },

        // SECONDARY - ORUS Purple (Accent)
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8b5cf6', // Main Purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },

        // NEUTRAL - Gray Scale (Backgrounds & Text)
        neutral: {
          0: '#FFFFFF',
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
          950: '#09090B',
        },

        // STATUS COLORS
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',

        // SPECIAL - For specific use cases
        'orus-green': {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },

        // ============================================
        // ✨ AURORA COLORS - PREMIUM DESIGN SYSTEM ✨
        // ============================================
        aurora: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#9d5cff', // ✨ Main Aurora Purple
          600: '#8b3de9',
          700: '#7c2fe0',
          800: '#6d28d9',
          900: '#4c1d95',
        },

        // Cyan - Aqua Aurora
        cyan: {
          50: '#ecf9ff',
          100: '#d1f2ff',
          200: '#a6e7ff',
          300: '#68deff',
          400: '#06b6d4', // ✨ Main Cyan
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },

        // Violet - Purple Aurora
        violet: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8b5cf6', // ✨ Main Violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },

        // Emerald - Green Aurora
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // ✨ Main Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Rose - Pink Aurora
        rose: {
          50: '#fff5f7',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda29b',
          400: '#f87171',
          500: '#f43f5e', // ✨ Main Rose
          600: '#e11d48',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
      },

      // ============================================
      // TYPOGRAPHY
      // ============================================
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'monospace',
        ],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0' }],
        sm: ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75', letterSpacing: '0' }],
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }],
        '3xl': ['2rem', { lineHeight: '1.3', letterSpacing: '0' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '0' }],
      },

      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },

      lineHeight: {
        tight: '1.3',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },

      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
      },

      // ============================================
      // SPACING (Sincronizado com design-tokens.ts)
      // ============================================
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
        72: '288px',
        80: '320px',
        96: '384px',
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        none: '0px',
        sm: '4px',
        base: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },

      // ============================================
      // BOX SHADOW - AURORA PREMIUM GLOWS
      // ============================================
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

        // ✨ AURORA GLOW SHADOWS
        'glow-aurora': '0 0 20px rgba(157, 92, 255, 0.4), 0 0 40px rgba(157, 92, 255, 0.2)',
        'glow-aurora-lg': '0 0 30px rgba(157, 92, 255, 0.6), 0 0 60px rgba(157, 92, 255, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.4), 0 0 40px rgba(244, 63, 94, 0.2)',
      },

      // ============================================
      // ANIMATIONS (Para Framer Motion)
      // ============================================
      animation: {
        spin: 'spin 1s linear infinite',
        bounce: 'bounce 1s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
        slideLeft: 'slideLeft 0.5s ease-out',
        slideRight: 'slideRight 0.5s ease-out',
        scaleIn: 'scaleIn 0.5s ease-out',
        glow: 'glow 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(157, 92, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(157, 92, 255, 0.8)' },
        },
      },

      // ============================================
      // TRANSITIONS
      // ============================================
      transitionDuration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },

      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ============================================
      // Z-INDEX
      // ============================================
      zIndex: {
        hide: '-1',
        auto: 'auto',
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },

      // ============================================
      // GRADIENTS (Para Framer Motion + Tailwind)
      // ============================================
      backgroundImage: {
        'gradient-aurora': 'linear-gradient(135deg, #9d5cff 0%, #7a2fff 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        'gradient-violet': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-rose': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        'gradient-primary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      },

      // ============================================
      // BACKDROP BLUR
      // ============================================
      backdropBlur: {
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },

  plugins: [],
};