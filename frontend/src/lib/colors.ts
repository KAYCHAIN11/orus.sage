/**
 * ORUS SAGE - Color System
 * Design tokens for light & dark themes
 * Used by Tailwind config
 */

export const orusColors = {
  // Primary - ORUS Blue (Main brand color)
  primary: {
    50: '#F0F7FF',
    100: '#E0EFFE',
    200: '#C7E0FD',
    300: '#A4CCFC',
    400: '#7BA3F8',
    500: '#2E7BFF', // Main primary
    600: '#1E5FDF',
    700: '#174AB8',
    800: '#133A8F',
    900: '#0F2B6B',
  },

  // Secondary - ORUS Green (Growth & success)
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#00D26A', // Main secondary
    600: '#00A84D',
    700: '#008A3D',
    800: '#006B30',
    900: '#005224',
  },

  // Accent - ORUS Purple (Creativity & agents)
  accent: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main accent
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Neutral - Grays
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1A5',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },

  // Status Colors
  success: '#00D26A',
  error: '#EF4444',
  warning: '#FBBF24',
  info: '#3B82F6',

  // Chat specific
  userMessage: '#2E7BFF',
  aiMessage: '#F3F4F6',
  aiMessageDark: '#27272A',
};

// Light theme (default)
export const lightTheme = {
  background: orusColors.neutral,
  foreground: orusColors.neutral,
  card: orusColors.neutral,
  cardForeground: orusColors.neutral,
  primary: orusColors.primary,
  primaryForeground: orusColors.neutral,
  secondary: orusColors.secondary,
  secondaryForeground: orusColors.neutral,
  accent: orusColors.accent,
  accentForeground: orusColors.neutral,
  muted: orusColors.neutral,
  mutedForeground: orusColors.neutral,
  border: orusColors.neutral,
  input: orusColors.neutral,
};

// Dark theme
export const darkTheme = {
  background: orusColors.neutral,
  foreground: orusColors.neutral,
  card: orusColors.neutral,
  cardForeground: orusColors.neutral,
  primary: orusColors.primary,
  primaryForeground: orusColors.neutral,
  secondary: orusColors.secondary,
  secondaryForeground: orusColors.neutral,
  accent: orusColors.accent,
  accentForeground: orusColors.neutral,
  muted: orusColors.neutral,
  mutedForeground: orusColors.neutral,
  border: orusColors.neutral,
  input: orusColors.neutral,
};

export type ColorKey = keyof typeof orusColors;
export type ThemeType = 'light' | 'dark';
