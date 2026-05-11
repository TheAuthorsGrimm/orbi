// Design System Tokens - Main Export
// Centralized design tokens for all platforms

export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { animations } from './animations';

// Re-export all together for convenience
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

export const tokens = {
  colors,
  typography,
  spacing,
  animations,
} as const;
