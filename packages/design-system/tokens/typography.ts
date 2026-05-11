// Design System - Typography Tokens
// Consistent text styling across all platforms

export const typography = {
  // Font Families
  fonts: {
    body: 'system-ui, -apple-system, sans-serif, "Apple Color Emoji"',
    heading: 'system-ui, -apple-system, sans-serif, "Apple Color Emoji"',
    mono: '"JetBrains Mono", monospace',
  },

  // Font Sizes (in px)
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font Weights
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
  },

  // Text Styles (semantic combinations)
  styles: {
    h1: {
      size: 48,
      weight: 700,
      lineHeight: 1.2,
    },
    h2: {
      size: 36,
      weight: 700,
      lineHeight: 1.3,
    },
    h3: {
      size: 30,
      weight: 600,
      lineHeight: 1.3,
    },
    h4: {
      size: 24,
      weight: 600,
      lineHeight: 1.4,
    },
    body: {
      size: 16,
      weight: 400,
      lineHeight: 1.5,
    },
    bodySm: {
      size: 14,
      weight: 400,
      lineHeight: 1.5,
    },
    caption: {
      size: 12,
      weight: 400,
      lineHeight: 1.5,
    },
    label: {
      size: 14,
      weight: 600,
      lineHeight: 1.4,
    },
  },
} as const;
