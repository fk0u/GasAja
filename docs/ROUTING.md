# TanStack Router Guide

GasAja! uses **TanStack Router** for file-based, type-safe, and highly performant routing. This document describes the structure, authentication guard mechanisms, route definitions, and navigation helpers.

---

## Route Structure

We use file-based routing. All route files are located in `src/routes/`. The structure is mapped as follows:

```
src/routes/
├── __root.jsx             ← Root layout (Sidebar, BottomBar, Toast, ErrorBoundary)
├── _auth.jsx              ← Auth guard layout route
├── _auth/
│   ├── index.jsx          ← Home Feed (/)
│   ├── explore.jsx        ← Explore Page (/explore)
│   ├── notifications.jsx  ← Notifications Page (/notifications)
│   ├── profile.jsx        ← My Profile (/profile)
│   ├── settings.jsx       ← Settings (/settings)
│   ├── create-plan.jsx    ← Create Plan Wizard (/create-plan)
│   ├── create-post.jsx    ← Create Post Page (/create-post)
│   ├── create-story.jsx   ← Create Story Page (/create-story)
│   ├── plan.$id.jsx       ← Plan Detail (legacy /plan/:id)
│   ├── $username.jsx      ← User Profile (/:username)
│   └── $username.$slug.jsx ← Plan detail via slug (/:username/:slug)
├── login.jsx              ← Login (/login) — Unauthenticated access
└── $.jsx                  ← 404 Splat Route (catch-all)
```

---

## The Auth Guard Layout Route (`_auth.jsx`)

All protected routes are placed under the `_auth` folder. The layout route `_auth.jsx` implements the guard logic. It intercepts navigation and redirects unauthorized users back to `/login`:

```jsx
import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';

const AuthLayout = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
```

---

## Root Layout (`__root.jsx`)

The `__root.jsx` serves as the entry layout. It coordinates:
1. **Auth Listener Initialization**: Calls `useAuth()` to listen to Firebase auth changes.
2. **Global Components**: Renders `<Sidebar />` and `<BottomBar />` only if the user is logged in.
3. **Overlays**: Houses the `<ToastContainer />` for notifications.
4. **Resiliency**: Wrapped in a top-level `<ErrorBoundary />` to catch unhandled errors.

---

## Route Parameters and Dynamics

### 1. Dynamic Plan Route (`/:username/:slug`)
This route displays a specific plan. Because it needs the `slug` and `username`, we fetch parameters cleanly:

```javascript
import { useParams } from '@tanstack/react-router';

const { username, slug } = useParams({ strict: false });
```

### 2. Splat Route (`$.jsx`)
This route handles all undefined paths and displays a premium 404 screen.

---

## Navigation Helpers

Use `@tanstack/react-router` standard hooks and components to preserve state and trigger correct routing:

### Using `<Link>`
```jsx
import { Link } from '@tanstack/react-router';

// Regular Link
<Link to="/explore">Explore</Link>

// Parameterized Link
<Link to="/$username" params={{ username: 'budi_gas' }}>Profile</Link>
```

### Using `useNavigate`
```javascript
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();

// Basic Navigate
navigate({ to: '/' });

// Parameterized Navigate
navigate({ to: '/$username', params: { username: 'budi_gas' } });
```
