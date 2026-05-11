# Orbi Windows Desktop App

Electron-based desktop application for Windows, built with React and TypeScript.

## Project Structure

```
windows/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React app (shared with web)
│   ├── preload/           # IPC bridge between main and renderer
│   └── utils/             # Platform-specific utilities
├── public/                # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

- Desktop integration (system tray, window management)
- Offline support
- Native notifications
- Direct system access (file system, clipboard, etc.)
- Similar styling and feel to web version

## Getting Started

```bash
cd apps/windows
pnpm install
pnpm dev          # Start dev server with hot reload
pnpm build        # Build for distribution
pnpm package      # Create installer
```

## Build & Distribution

- Windows 10/11 support
- ASAR packaging
- Auto-update capability (via electron-updater)

## Design System

Uses shared design tokens from `packages/design-system/` for consistent styling across platforms.

See [Design System Docs](../../packages/design-system/README.md)
