# Contributing to GasAja!

We are absolutely thrilled that you want to code with us! GasAja! is a highly aesthetic and performant platform, and we maintain standard guidelines to keep our codebase clean, scalable, and professional.

---

## 1. Development Principles

- **Mobile First**: GasAja! is primarily visited on phones. Ensure that every modal, bento card, and animation feels beautiful on screens smaller than `640px`.
- **Performance Matters**: Leverage Zustand state caching and avoid wasteful Re-renders.
- **Rich Aesthetics**: Do not use generic colors (like pure `#ff0000`). Stick to our custom brand system (Neon Green, High-contrast Orange, Dark glass backgrounds).

---

## 2. Directory and File Conventions

Maintain the structured directory architecture at all times:

```
src/
├── routes/       ← File-based routes only
├── components/   ← UI components (layout, ui, feed)
├── hooks/        ← React custom hooks (useAuth, useNotificationCount)
├── lib/          ← Config and constant configurations
├── store/        ← Global Zustand stores
└── utils/        ← Utility functions
```

---

## 3. Git Workflow

We use a simple and clean branching strategy:

1. **Branch Naming**:
   - Features: `feature/nama-fitur`
   - Bugfixes: `bugfix/nama-bug`
   - Refactoring: `refactor/nama-refactor`
2. **Commit Messages**: Use descriptive, prefix-based commits:
   - `feat: tambah fitur polling lokasi`
   - `fix: betulkan modal date-picker di android`
   - `refactor: migrasi main.jsx ke tanstack router`

---

## 4. Code Style & Linting

We enforce strict linting to maintain clean formatting. Run these commands prior to sending a pull request:

```bash
# Check code style issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

Thank you for contributing to GasAja! Let's build the ultimate Gen Z hangout platform together! 🚀
