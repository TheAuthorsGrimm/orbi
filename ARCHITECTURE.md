# Orbi Multi-Platform Architecture

## Project Structure Overview

```
orbi/                              # Monorepo root
├── apps/
│   ├── web/                       # Web React app (existing)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── desktop/                   # Desktop app (Tauri/Electron - existing)
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── windows/                   # ✨ NEW - Windows Desktop (Electron)
│   │   ├── src/
│   │   │   ├── main/              # Electron main process
│   │   │   ├── renderer/          # React renderer
│   │   │   └── preload/           # IPC bridge
│   │   ├── public/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── iphone/                    # ✨ NEW - iOS App (React Native)
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   └── services/
│       ├── ios/                   # Native iOS code
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── types/                     # Shared TypeScript types
│   ├── ui/                        # UI components
│   ├── api-client/                # API client library
│   │
│   └── design-system/             # ✨ NEW - Centralized Design
│       ├── tokens/
│       │   ├── colors.ts          # Color palette
│       │   ├── typography.ts      # Font sizes, weights
│       │   ├── spacing.ts         # Padding, margins
│       │   ├── animations.ts      # Duration, easing
│       │   └── index.ts           # All exports
│       ├── components/            # Shared components
│       ├── package.json
│       └── README.md
│
├── backend/                       # Node/Express API
├── supabase/                      # Supabase functions
└── tests/                         # E2E tests
```

## Platform Strategy

### 🌐 **Web** (Already Running)
- Framework: React 18
- Build: Vite
- Port: 5177
- Features: Full dashboard, all features
- Deploy: Web server / Static hosting

### 🪟 **Windows Desktop** (In Progress)
- Framework: Electron + React (reuse web components)
- Build: Vite + Electron Builder
- Features: Native integrations, offline support, system tray
- Packaging: NSIS installer, portable EXE
- Deployment: Electron auto-updater

### 📱 **iPhone** (Planned)
- Framework: React Native
- Build: Xcode / CocoaPods
- Features: Touch-optimized UI, native notifications, offline sync
- Deployment: App Store
- Requirements: macOS + Xcode for builds

## Design System Usage

### Across All Platforms

```tsx
// Import tokens from shared design system
import { colors, spacing, typography, animations } from '@orbi/design-system';

// Web: Use with Tailwind CSS or CSS-in-JS
const buttonStyle = {
  backgroundColor: colors.brand.primary,
  padding: spacing.md,
  fontSize: typography.size.base,
};

// Windows: Same React, same tokens
// Just render to Electron window

// iPhone: React Native components
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
  },
});
```

## Shared Code Strategy

### ✅ Can Share
- Business logic (hooks, services)
- TypeScript types and interfaces
- API client functions
- Utility functions
- Design tokens
- Constants

### 🔄 Need Platform Adapters
- Components (platform-specific rendering)
- Navigation (web routing vs native navigation)
- State management (Context API same, but hooks may differ)
- Storage (LocalStorage vs AsyncStorage vs file system)

### ❌ Platform-Specific
- UI rendering (React, React Native, etc.)
- Native APIs (file system, notifications, etc.)
- Build configuration
- Entry points

## Next Steps

1. ✅ Create folder structure
2. ✅ Add package.json for each platform
3. ✅ Create design system tokens
4. ⏳ Set up Windows/Electron app
5. ⏳ Set up iPhone/React Native app
6. ⏳ Extract shared design components
7. ⏳ Share business logic across platforms

## Current Status

- **Web**: ✅ Running on localhost:5177
- **Design System**: ✅ Created with color, typography, spacing, animation tokens
- **Windows**: 📋 Structure ready, awaiting Electron setup
- **iPhone**: 📋 Structure ready, awaiting React Native setup
