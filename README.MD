# Immoplus Admin — Back-office

Administration dashboard for the [Immoplus](https://api.immoplus.ci) real estate platform (Côte d'Ivoire). Built with **React 18**, **Refine.dev v4**, and **Ant Design v5**.

> Full technical reference: [`docs/TECHNICAL_DOCUMENTATION.md`](docs/TECHNICAL_DOCUMENTATION.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Admin Framework | Refine.dev v4 |
| Component Library | Ant Design v5 |
| Routing | React Router v6 |
| HTTP Client | Axios (with auto token-refresh interceptor) |
| Real-time | Socket.io Client v4 |
| Charts | Recharts |
| Maps | Mapbox GL / MapLibre GL + react-map-gl |
| Internationalization | i18next (French primary, English fallback) |
| Exports | XLSX + jsPDF |
| CSS | TailwindCSS |
| Build Tool | Vite |

---

## Getting Started

### Prerequisites

- Node.js **≥ 20** (Node 23 is used in production on Netlify)
- A `.env` file in the project root (copy from `.env.example`)

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://api.immoplus.ci` | Backend API base URL |
| `VITE_PROJECT_ID` | `xntn5Z-AEaHwy-gkPtSa` | Refine devtools project ID |

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Start with Refine DevTools panel
npm run debug
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server (Vite) |
| `npm run debug` | Dev server + Refine DevTools |
| `npm run build` | Production build → `dist/` |
| `npm run start` | Preview the production build |

---

## User Roles

Three roles can access the back-office (all others are rejected at login):

| Role | Access | Default page |
|---|---|---|
| `admin` | Full access — all 18 resources | `/demandes-visites` |
| `financier` | Finance only: payments, transfers, withdrawal requests | `/withdrawal-requests` |
| `commercial` | All except finance, banners, and configs | `/demandes-visites` |

---

## Modules (Resources)

| Module | Path | Description |
|---|---|---|
| Statistics | `/statistics` | Dashboard charts |
| Feed | `/feed` | Video feed (active + legacy) + upload |
| Alerts | `/alerts` | User property search alerts |
| Demandes Pro Particulier | `/demandes-pro-particulier` | Pro individual account requests |
| Demandes de Visites | `/demandes-visites` | Property visit requests |
| Résidences | `/residences` | Residential properties |
| Réservations | `/reservations` | Booking management with live countdown |
| Biens Immobiliers | `/biens-immobiliers` | Real estate listings |
| Meubles | `/furnitures` | Furniture items |
| Utilisateurs | `/users` | User management + wallet operations + export |
| Demandes de Retraits | `/withdrawal-requests` | Withdrawal requests |
| Transferts | `/transfers` | Financial transfers |
| Paiements | `/payments` | Payment management |
| Préférences Utilisateurs | `/user-preferences` | User preference records |
| Bannières | `/banners` | In-app banners with drag-and-drop ordering |
| Configurations | `/configs` | Application configuration |

---

## Folder Structure

```
src/
├── App.tsx                  # Refine provider tree + resource registry
├── AppRoutes.tsx            # All route definitions
├── components/              # Shared components (filters, forms, layout, notifications)
├── configs/                 # App config, map config, role-permission mapping
├── contexts/                # Theme (color-mode) + notification context (WS + polling)
├── core/domain/             # Pure TypeScript models and enums (DDD)
├── hooks/                   # Custom hooks (WebSocket notifications, filters)
├── lib/
│   ├── helpers/             # Stateless utility functions (auth, currency, string, URL…)
│   ├── providers/           # Refine adapter implementations (auth, data, access control)
│   ├── services/            # Service implementations (authService)
│   └── ts-utilities/        # Generic TS utilities (arrays, dates, enums, currency…)
├── pages/                   # Feature pages — one folder per resource
└── styles/                  # Global CSS
```

---

## Working on a Feature

1. **Checkout `dev` and pull the latest changes:**
   ```bash
   git checkout dev && git pull
   ```

2. **Create a new branch** following the conventional commits prefix:
   - `feat/` — new feature
   - `fix/` — bug fix
   - `refactor/` — refactoring
   - `chore/` — maintenance
   - `docs/` — documentation

   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Scaffold a new resource page** with Plop:
   ```bash
   npx plop page:all <resource-group> <resource-name>
   ```
   Example: `npx plop page:all residences residence`  
   The generators singularize names automatically and create all CRUD pages under `src/pages/`.

4. **Register the resource** in `src/App.tsx` (add to the `resources` array) and add routes in `src/AppRoutes.tsx`.

5. **Open a Pull Request** to `dev`. Notify the team for review.

See the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec for commit message format.

---

## Deployment

### Netlify (primary)

Configured via `netlify.toml`. Any push triggers `npm run build` and deploys `dist/`.

### Docker / Nginx

```bash
# Build and start the container
docker-compose up --build
```

The Dockerfile builds a static Nginx container serving the pre-built `dist/` on port **3000**. Set `VITE_API_URL` in your `.env` before building.

---

## Useful Resources

| Resource | URL |
|---|---|
| API Base URL | https://api.immoplus.ci |
| Swagger Docs | https://api-v2.immoplus.ci/swagger |
| Swagger JSON | https://api-v2.immoplus.ci/swagger/json |
| App Preview | https://pro-immoplus.netlify.app |
| Refine.dev Docs | https://refine.dev/docs |

---

## License

MIT
