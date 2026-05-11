# Orbi Design System

Centralized design tokens, components, and styling guidelines for all Orbi platforms (web, desktop, mobile).

## Purpose

Maintains visual consistency across:
- 🌐 Web (React)
- 🪟 Windows Desktop (Electron)
- 📱 iPhone (React Native)

## Structure

```
design-system/
├── tokens/
│   ├── colors.ts          # Color palette
│   ├── typography.ts      # Fonts, sizes, weights
│   ├── spacing.ts         # Padding, margins, gaps
│   ├── shadows.ts         # Elevation, shadows
│   ├── radius.ts          # Border radius values
│   ├── animations.ts      # Duration, easing, keyframes
│   └── index.ts           # Export all tokens
├── components/
│   ├── Button.tsx         # Cross-platform button
│   ├── Card.tsx
│   ├── Badge.tsx
│   └── ... other shared components
├── package.json
└── README.md
```

## Usage

### Web (React/Tailwind)

```tsx
import { colors, spacing, typography } from '@orbi/design-system';

export const Button = () => (
  <button style={{
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    fontSize: typography.size.base,
  }}>
    Click me
  </button>
);
```

### Windows (Electron/React)

Same as web - reuse components directly

### iPhone (React Native)

```tsx
import { colors, spacing } from '@orbi/design-system';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
  },
});
```

## Design Tokens

### Colors

- **Brand**: Primary (#5250F3), Secondary, Tertiary
- **Neutral**: Background (#0f0e2a), Surface, Text
- **Semantic**: Success, Warning, Error, Info
- **States**: Hover, Active, Disabled, Focus

### Typography

- **Font Families**: Inter (UI), JetBrains Mono (code)
- **Sizes**: xs, sm, base, lg, xl, 2xl, 3xl
- **Weights**: 300, 400, 500, 600, 700
- **Line Heights**: Tight, Normal, Relaxed

### Spacing

- **Scale**: 4px base unit
- **Values**: xs (4px), sm (8px), md (16px), lg (24px), xl (32px)

### Animations

- **Durations**: Fast (150ms), Normal (300ms), Slow (500ms)
- **Easing**: EaseInOut, EaseOut, Linear

## Adding New Tokens

1. Edit `/tokens/*.ts`
2. Update exports in `/tokens/index.ts`
3. Use across all platforms

## Component Guidelines

- **Platform Agnostic**: Write logic in pure TypeScript
- **Platform-Specific**: Render using platform APIs
- **Testing**: Include stories and tests
- **Documentation**: Document usage and props

## Installation

Add to your app's `package.json`:

```json
{
  "dependencies": {
    "@orbi/design-system": "workspace:*"
  }
}
```

## Contributing

When updating design:
1. Update tokens first
2. Test across all 3 platforms
3. Update component implementations
4. Document changes
