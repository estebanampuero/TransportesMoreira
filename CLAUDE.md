# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server (http://localhost:5173)
npm run build        # tsc type-check then Vite production build → dist/
npm run preview      # serve the built dist/ locally

firebase deploy                  # deploy hosting + Firestore rules + Storage rules + indexes
firebase deploy --only hosting   # deploy only the built site
firebase deploy --only firestore # deploy rules and indexes only
```

There are no test commands — no test suite exists in this project.

## Architecture

### Routes
`/` — public landing page (`Layout` → `Home`)  
`/admin` — password-protected internal panel (`Admin`)

`Layout` (in `App.tsx`) owns the `TruckDriverModal` open state and the floating WhatsApp button, so both are available site-wide without prop-drilling into sections.

### Public page (`Home.tsx`)
`HeroSection` renders eagerly. All other sections (`ServicesSection`, `Testimonials`, `ClientLeadForm`, `SEOSection`, `ContactSection`) are `lazy()`-imported and wrapped in `<Suspense>` for code splitting.

`ServicesSection` composes `Services` + `Fleet`. The `Fleet` component is fully dynamic — it subscribes via `onSnapshot` to Firestore `drivers` where `showInFleet === true` and renders those cards in real time.

### Admin panel (`src/pages/Admin.tsx`)
Auth is checked against `localStorage.getItem('tm_admin_auth') === '1'` with hardcoded credentials (`admin` / `moreira2025`). No Firebase Auth is used.

The dashboard has two tabs driven by real-time `onSnapshot` subscriptions:
- **ERP tab** — drivers list, admin Mapbox map (all drivers colour-coded), location update modal, GPS integration guide
- **CRM tab** — client leads pipeline (new → contacted → closed/lost)

Each driver has two independent visibility toggles:
- `isPublic` — shows the truck on the **live Mapbox map** in the admin panel (internal only, `LiveFleetMap` is admin-only)
- `showInFleet` — shows the truck card in the **"Flota moderna y certificada"** section on the public website

### Firebase services
Configured in `src/lib/firebase.ts`. Exports: `db` (Firestore), `storage` (Storage), `analytics`, and the `saveLead()` helper.

All env vars are `VITE_FIREBASE_*` — copy `.env.example` to `.env.local` to configure.

**Firestore collections:**

| Collection | Written by | Read by |
|---|---|---|
| `leads` | `ContactForm` (quick contact) | Admin only (via console) |
| `client_leads` | `ClientLeadForm` (detailed request + photos) | Admin CRM tab |
| `drivers` | `TruckDriverModal` (driver self-registration) | Admin ERP tab + public `Fleet` component |

`drivers` is publicly readable (needed for the fleet section). Updates are restricted to the fields: `location`, `lastLocationUpdate`, `status`, `isPublic`, `showInFleet`, `updatedAt`.

Composite index on `drivers`: `(isPublic ASC, status ASC)` — defined in `firestore.indexes.json`.

### Mapbox
Token is hardcoded inline in every component that uses a map (`LiveFleetMap.tsx`, `TruckDriverModal.tsx`, `Admin.tsx`). Each component manages its own `mapboxgl.Map` instance via `useRef`, initialises it in a `useEffect`, and calls `map.remove()` on cleanup. Markers are tracked in a `Map<string, mapboxgl.Marker>` ref and synced on every Firestore snapshot.

### Styling
Dark glassmorphism design. Base background `#0b1121`.

Utility classes are defined in `src/index.css` as **raw CSS inside `@layer components`** — not `@apply`. This is intentional: Tailwind v3 does not support arbitrary opacity values like `bg-white/5` inside `@apply` directives, which causes a Vite build error. Do not convert these back to `@apply`.

Key reusable classes: `.glass-card`, `.glass-card-hover`, `.btn-primary`, `.btn-glass`, `.btn-outline`, `.input-dark`, `.section-dark`, `.section-alt`, `.text-gradient`.

Custom Tailwind extensions are in `tailwind.config.js`: font families (`sans: Inter`, `display: Poppins`), `brand` colour palette, `glass` colours, shadow utilities (`shadow-glass`, `shadow-brand-glow`).

### Scroll animations
`useInView<T extends Element>()` in `src/hooks/useInView.ts` wraps `IntersectionObserver`. Returns `{ ref, inView }`. Pass the generic type matching the element type (`HTMLDivElement`, `HTMLElement`, `HTMLQuoteElement`, etc.) to satisfy TypeScript's `LegacyRef` constraints.

### Image/asset registry
All image URLs live in `src/lib/assets.ts`. Add new images there before referencing them in components. Placeholder images use `placehold.co` and must be replaced with real assets before launch.

### Build chunking
`vite.config.ts` splits output into manual chunks: `vendor` (react + react-dom), `firebase` (firebase SDK). The `mapbox-gl` bundle (~1.8 MB) is large by nature and accepted as-is.

## Deploy workflow

```bash
npm run build && firebase deploy
```

`firebase.json` targets `dist/` for hosting with a catch-all SPA rewrite (`** → /index.html`). Static assets get `Cache-Control: immutable, 1yr`; HTML/JSON files get `no-cache`.
