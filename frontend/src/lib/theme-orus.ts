/**
 * ORUS SAGE - Green & White Theme
 * Brand identity: Premium green + clean white
 */

export const orusGreenWhiteTheme = {
  // Primary - ORUS Green (Premium brand)
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#00D26A', // Main brand green
    600: '#00A84D',
    700: '#008A3D',
    800: '#006B30',
    900: '#005224',
  },

  // Secondary - White & Light Gray
  secondary: {
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
  },

  // Accent - Complementary to green (used sparingly)
  accent: {
    500: '#06B6D4', // Cyan - complements green
  },

  // Status colors (adjusted for green theme)
  success: '#00D26A', // ORUS Green
  error: '#DC2626',
  warning: '#EA8C55',
  info: '#0891B2',

  // Chat colors
  userMessage: '#00D26A', // Green bubble
  aiMessage: '#FFFFFF', // White bubble
  aiMessageBorder: '#E5E7EB',
};

// Light mode - Green & White
export const lightThemeGreenWhite = {
  background: orusGreenWhiteTheme.secondary, // Pure white
  foreground: orusGreenWhiteTheme.secondary, // Dark text
  card: orusGreenWhiteTheme.secondary, // Very light gray
  cardForeground: orusGreenWhiteTheme.secondary,
  primary: orusGreenWhiteTheme.primary, // ORUS Green
  primaryForeground: orusGreenWhiteTheme.secondary,
  secondary: orusGreenWhiteTheme.secondary,
  secondaryForeground: orusGreenWhiteTheme.secondary,
  accent: orusGreenWhiteTheme.accent,
  accentForeground: orusGreenWhiteTheme.secondary,
  muted: orusGreenWhiteTheme.secondary,
  mutedForeground: orusGreenWhiteTheme.secondary,
  border: orusGreenWhiteTheme.secondary,
  input: orusGreenWhiteTheme.secondary,
};

// Dark mode - Dark green variant (optional)
export const darkThemeGreenWhite = {
  background: orusGreenWhiteTheme.secondary, // Almost black
  foreground: orusGreenWhiteTheme.secondary, // White text
  card: orusGreenWhiteTheme.secondary, // Dark gray
  cardForeground: orusGreenWhiteTheme.secondary,
  primary: orusGreenWhiteTheme.primary, // Lighter green for dark mode
  primaryForeground: orusGreenWhiteTheme.secondary,
  secondary: orusGreenWhiteTheme.secondary,
  secondaryForeground: orusGreenWhiteTheme.secondary,
  accent: orusGreenWhiteTheme.accent,
  accentForeground: orusGreenWhiteTheme.secondary,
  muted: orusGreenWhiteTheme.secondary,
  mutedForeground: orusGreenWhiteTheme.secondary,
  border: orusGreenWhiteTheme.secondary,
  input: orusGreenWhiteTheme.secondary,
};
