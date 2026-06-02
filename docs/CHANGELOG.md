# Changelog — GasAja!

All notable changes to the GasAja! project are documented here.

---

## [1.0.0] — 2026-06-02

### Added
- **TanStack Router Integration**: Introduced file-based, type-safe router with clean guard mechanisms for all protected views.
- **Brand Identity & Premium Design System**: Set custom harmonized dark theme colors, bento-grid layouts, customized glassy styling, and smooth animations using Framer Motion.
- **Custom Hooks Extraction**: Extracted `useAuth` hook for root synchronization and `useNotificationCount` hook to easily share real-time badge updates.
- **Feed Card Extraction**: Refactored massive home feed components into individual modules (`PostCard`, `PlanCard`, and `TrendingPlanCard`) inside `@/components/feed/` folder.
- **Comprehensive Documentation Suite**: Added detailed project docs including `ARCHITECTURE.md`, `ROUTING.md`, `DEPLOYMENT.md`, and `API.md`.

### Fixed
- Fixed Tailwind v4 `@apply` issue with custom animations directly inside the root `index.css` file.
- Cleaned up boilerplate Vite CSS and removed legacy unused components.

### Removed
- Removed `react-router-dom` and the deprecated `App.jsx` and `App.css`.
- Deleted legacy page wrappers in the original `src/pages` folder.
