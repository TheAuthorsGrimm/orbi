// Design System - Animation Tokens
// Consistent motion and timing across all platforms

export const animations = {
  // Duration (in milliseconds)
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },

  // Easing Functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Predefined animations
  transitions: {
    // UI interactions
    quickFade: {
      duration: 150,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    smoothFade: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Scale/transform
    bounce: {
      duration: 300,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    
    // Slide
    slideIn: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Keyframe animations (for CSS)
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideInUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },

  // Spring animation presets (for Framer Motion style)
  spring: {
    gentle: { damping: 15, mass: 1, stiffness: 100 },
    default: { damping: 10, mass: 1, stiffness: 100 },
    wobbly: { damping: 5, mass: 1, stiffness: 100 },
    bouncy: { damping: 5, mass: 0.5, stiffness: 200 },
  },
} as const;
