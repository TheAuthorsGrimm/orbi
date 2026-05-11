// Design System - Spacing Tokens
// Consistent spacing scale across all platforms (4px base unit)

export const spacing = {
  // Base unit: 4px
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,

  // Aliases for common patterns
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  gap: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Common component spacing
  section: 32,        // Space between major sections
  component: 24,      // Space between components
  element: 16,        // Space between elements within component
  micro: 8,           // Small space for related items
} as const;
