# Orbi iPhone App

React Native application for iOS, maintaining Orbi's design language and functionality.

## Project Structure

```
iphone/
├── src/
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks (shared logic)
│   ├── services/          # API calls, storage
│   ├── context/           # State management (Reward, Profile)
│   └── navigation/        # App navigation
├── ios/                   # Native iOS code (Xcode project)
├── app.json
├── package.json
└── tsconfig.json
```

## Features

- Touch-optimized interface
- Native iOS integration
- Offline-first data persistence (AsyncStorage)
- Push notifications
- Gesture-based navigation
- Maintains Orbi's dark theme and animations

## Getting Started

```bash
cd apps/iphone
pnpm install

# iOS development
pnpm ios              # Run on simulator
pnpm ios:device       # Run on connected device

# Build for production
pnpm build:ios        # Build for App Store
```

## Requirements

- macOS (for building iOS apps)
- Xcode 14+
- Node.js 16+
- React Native CLI

## Shared Code

Reuses from web app:
- `useReward()` hook
- `useOrbiProfile()` context
- API client logic
- Business logic

## Design System

Uses shared design tokens from `packages/design-system/` with React Native-specific implementations.

See [Design System Docs](../../packages/design-system/README.md)
