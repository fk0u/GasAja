# Deployment Guide — GasAja!

This document covers how to deploy GasAja! to production hosting platforms.

---

## 1. Environment Variables Configuration

Ensure the following environment variables are set in your production dashboard:

```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
VITE_FIREBASE_DATABASE_URL=https://your-production-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_messaging_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_production_measurement_id
VITE_MAPBOX_TOKEN=your_production_mapbox_geocoding_token
```

---

## 2. Option A: Deploy to Firebase Hosting (Recommended)

Since GasAja! is built on the Firebase Ecosystem, Firebase Hosting is the fastest and most integrated option.

### Steps:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**:
   ```bash
   firebase login
   firebase init
   ```
   - Select **Hosting**.
   - Choose your existing Firebase Project.
   - Set public directory to **`dist`** (Vite builds into `dist`).
   - Configure as a **single-page app (SPA)**: **Yes** (very important for TanStack Router).
   - Set up automatic builds and deploys with GitHub: (Optional).

3. **Build & Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 3. Option B: Deploy to Netlify

Netlify is excellent for instant Git-based deployment.

### Configurations:

1. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
2. **SPA Routing**:
   To prevent 404 errors when reloading pages on TanStack Router, create a `_redirects` file in `public/` directory before building:
   ```text
   /*    /index.html   200
   ```

---

## 4. Option C: Deploy to Vercel

Vercel is popular for its high-performance edge network.

### Configurations:

1. **Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. **SPA Routing**:
   Create a `vercel.json` file in the root directory to handle rewrite rules:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
