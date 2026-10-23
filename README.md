# Fixer — web app

The customer, technician and admin web app for [fixerng.app](https://fixerng.app):
FixBot diagnosis, paid support calls (voice, video, remote), device pickup and
repair across Abuja, DIY articles and videos. React 19 + Vite, deployed on
Vercel; the Android app wraps the same build with Capacitor.

Backend: [fixer-backend](https://github.com/Dayveed14/fixer-backend).

## Run it locally

```bash
npm ci
cp .env.example .env.local      # point VITE_API_BASE_URL at your backend
npm run dev                     # http://localhost:5173
```

The backend only accepts browser requests from the origins in its CORS
list (`http://localhost:5173` for development), so keep the dev port at 5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | All unit, component and SEO tests (Vitest + Testing Library) |
| `npm run build` | Regenerates `public/sitemap.xml`, then builds to `dist/` |
| `npm run preview` | Serves the production build locally |

## Environment variables

See `.env.example`. All are read at build time:

| Variable | Needed | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Backend URL (falls back to the production API) |
| `VITE_PAYSTACK_PUBLIC_KEY` | yes | Paystack public key for checkout |
| `VITE_API_TIMEOUT_MS` | no | Default request timeout (30 s) |
| `VITE_MESHCENTRAL_WEB_URL` | no | MeshCentral console for remote sessions |

## How the code is organised

```
src/
  api/            One HTTP client (client.js) + a module per area
                  (auth, bookings, payments, shipments, pricing, technician, diagnosis)
  components/     Public pages (Home, Blog, Help…) and shared pieces
    components/   Home page sections — Hero.jsx is the "workbench" banner + FixBot modal
    account/      Settings page + change password, shared by all three dashboards
    fixbot/       FixBot mascot (pure SVG/CSS)
    decor/        Circuit/blueprint artwork
  dashboard/      Customer, technician and admin dashboards and their pages
  config/seo.js   Site URL, default title/description (one place to change the domain)
  styles/tech.css Shared "workbench" accents (circuit traces, blueprint grid)
  utils/          Schedule rules, shipment statuses, notification links, row links
scripts/          Sitemap generator (+ its tests)
```

**API client** (`src/api/client.js`): every request goes through it. It sends
the session cookie, adds the `X-Fixer-Client: web` header the backend requires
on state-changing requests (CSRF protection), applies timeouts, turns every
failure into an `ApiError` with a readable `message`, and sends the user to
`/login` when the session ends.

**Sessions:** the backend keeps the session in an httpOnly cookie; the app only
keeps the display copy of the user (name, role) in `localStorage`. Changing the
password in Settings signs the account out everywhere else.

## Dashboards

| Role | Home | Highlights |
| --- | --- | --- |
| Customer | `/dashboard` | Appointments, pickups & repair approvals (pay quote), devices, FixBot |
| Technician | `/techniciandashboard` | Assigned jobs, appointments (call / Meet / remote), repairs to report |
| Admin | `/admindashboard` | Tickets, bookings, shipments & quotes, payments & alerts, pricing engine, content |

Every stat card, table row and quick action links to the page behind it
(covered by `src/dashboard/dashboards.test.jsx`).

## SEO

- Each public page sets its title, description and canonical URL with `<SEO path="…">`.
- `npm run build` regenerates `public/sitemap.xml` from the static pages plus
  every **published** article (`/userarticle/<slug>`) and video
  (`/uservideo/<slug>`) — the same slug URLs the canonical tags use. If the API
  is unreachable the build still succeeds with the static pages only.
- `public/robots.txt` blocks dashboards, checkout and auth pages.
- `scripts/seo.test.mjs` checks the sitemap, routes, canonicals and robots.txt
  agree with each other.

## Deploying

Vercel builds on every push to `main` (`npm run build`, output `dist/`,
`vercel.json` rewrites all paths to `index.html`). GitHub Actions runs the tests
and a production build on every push and pull request (`.github/workflows/ci.yml`).

**Rolling back:** Vercel → Project → Deployments → pick the last good
deployment → *Promote to Production* (instant, no rebuild). If the backend was
rolled back too, make sure the two versions match — see the backend's
`docs/OPERATIONS.md`.

## Android

`android/` is the Capacitor project (`capacitor.config.json`, app id
`app.fixerng`). After a web build: `npx cap sync android`, then open
`android/` in Android Studio.
