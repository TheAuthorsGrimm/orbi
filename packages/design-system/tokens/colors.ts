// Design System - Color Tokens
// Used across web, desktop, and mobile platforms

export const colors = {
  // Brand Colors
  brand: {
    primary: '#5250F3',      // Main brand purple
    secondary: '#8B5CF6',    // Lighter purple
    tertiary: '#A78BFA',     // Even lighter purple
  },

  // Neutral / Background
  neutral: {
    900: '#0f0e2a',          // Darkest - main background
    800: '#1a1935',
    700: '#252140',
    600: '#3a354c',
    500: '#4a4563',
    400: '#5f5a7a',
    300: '#7a778a',
    200: '#a8a5b8',
    100: '#d4d2e0',
    50: '#e8e7f0',
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',      // Green - success
    warning: '#f59e0b',      // Amber - warning
    error: '#ef4444',        // Red - error
    info: '#3b82f6',         // Blue - info
  },

  // State Colors
  state: {
    hover: 'rgba(82, 80, 243, 0.1)',     // Brand primary with opacity
    active: 'rgba(82, 80, 243, 0.2)',
    disabled: 'rgba(82, 80, 243, 0.3)',
    focus: 'rgba(82, 80, 243, 0.4)',
  },

  // Aliases
  bg: {
    primary: '#0f0e2a',
    secondary: '#1a1935',
    tertiary: '#252140',
  },

  text: {
    primary: '#ffffff',
    secondary: '#d4d2e0',
    tertiary: '#a8a5b8',
  },

  border: '#3a354c',
} as const;
