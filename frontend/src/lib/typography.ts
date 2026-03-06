/**
 * ORUS SAGE - Typography System
 * Font sizes, weights, line heights
 */

export const fonts = {
  primary: 'Inter, sans-serif', // Main font
  mono: 'Fira Code, monospace', // Code font
};

export const typography = {
  // Display - Extra large headings
  display: {
    lg: {
      fontSize: '3.75rem', // 60px
      lineHeight: '1.1',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    md: {
      fontSize: '3rem', // 48px
      lineHeight: '1.2',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    sm: {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.3',
      fontWeight: 700,
    },
  },

  // Heading - Large headings
  heading: {
    lg: {
      fontSize: '2rem', // 32px
      lineHeight: '1.3',
      fontWeight: 700,
    },
    md: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.4',
      fontWeight: 700,
    },
    sm: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4',
      fontWeight: 600,
    },
    xs: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.5',
      fontWeight: 600,
    },
  },

  // Body - Main text
  body: {
    lg: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.75',
      fontWeight: 400,
    },
    md: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      fontWeight: 400,
    },
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.6',
      fontWeight: 400,
    },
  },

  // Small - Labels, captions
  small: {
    md: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: 500,
    },
    sm: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: 500,
      letterSpacing: '0.025em',
    },
  },

  // Mono - Code
  mono: {
    md: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.6',
      fontWeight: 400,
      fontFamily: fonts.mono,
    },
    sm: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: 400,
      fontFamily: fonts.mono,
    },
  },
};

export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};
