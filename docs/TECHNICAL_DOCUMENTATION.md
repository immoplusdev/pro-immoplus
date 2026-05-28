# Immoplus Admin — Technical Documentation

> Generated: 2026-05-28

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Architecture](#4-architecture)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Data Provider & API Conventions](#6-data-provider--api-conventions)
7. [Resources (Modules)](#7-resources-modules)
8. [Domain Models](#8-domain-models)
9. [Real-time Notification System](#9-real-time-notification-system)
10. [Key Features In Depth](#10-key-features-in-depth)
11. [Routing](#11-routing)
12. [Internationalization](#12-internationalization)
13. [Utility Libraries](#13-utility-libraries)
14. [Configuration](#14-configuration)
15. [Build, Deployment & Infrastructure](#15-build-deployment--infrastructure)
16. [Environment Variables](#16-environment-variables)
17. [Developer Tooling](#17-developer-tooling)

---

## 1. Project Overview

**admin-immoplus** is the back-office administration dashboard for the Immoplus real estate platform (operating in Côte d'Ivoire, hence FCFA currency). It is a React single-page application built on the [Refine.dev](https://refine.dev) framework, providing CRUD management of the full platform: real estate listings, reservations, payments, wallets, users, media feeds, banners, and more.

The API it consumes is hosted at `https://api.immoplus.ci` (configurable).

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | ^18 |
| Language | TypeScript | ^4.7 |
| Admin Framework | Refine.dev Core | ^4.46 |
| Component Library | Ant Design | ^5 |
| Routing | React Router v6 | ^6.8 |
| HTTP Client | Axios | ^1.6 |
| Real-time | Socket.io Client | ^4.8 |
| Charts | Recharts | ^3.8 |
| Maps | Mapbox GL / MapLibre GL | ^3.5 / ^4.5 |
| Map React Binding | react-map-gl | ^7.1 |
| Internationalization | i18next + react-i18next | ^20 / ^11 |
| CSS Utility | TailwindCSS | ^3.4 |
| Export | XLSX + jsPDF + jspdf-autotable | ^0.18 / ^4.2 / ^5.0 |
| State (server) | TanStack Query (via Refine) | — |
| Dependency Injection | TSyringe | ^4.8 |
| Build Tool | Vite | ^7 |
| Path Aliases | vite-tsconfig-paths | ^4.3 |
| Carousel | Swiper | ^12 |
| Code Generation | Plop | ^3.1 |

---

## 3. Directory Structure

```
admin-immoplus/
├── public/
│   ├── images/                # Static assets (logo)
│   └── locales/               # i18n JSON translation files
│       ├── fr/common.json
│       └── en/common.json
├── src/
│   ├── App.tsx                # Root: Refine provider tree & resource registry
│   ├── AppRoutes.tsx          # All React Router route definitions
│   ├── i18n.ts               # i18next initialisation
│   ├── index.tsx             # Entry point
│   ├── vite-env.d.ts
│   │
│   ├── components/            # Shared / cross-feature components
│   │   ├── app-icon/
│   │   ├── auth/              # RoleBasedRedirect
│   │   ├── categories/        # CategoryPaymentTypeListItem
│   │   ├── filters/           # FilterContainer, SearchInput, DateCreatedFilter, …
│   │   ├── form/              # DragAndDropImageUploader, LocationPicker
│   │   ├── layout/            # Header, CustomSider
│   │   ├── notifications/     # ToastManager
│   │   └── index.ts
│   │
│   ├── configs/
│   │   ├── app.config.ts      # API_URL, PROJECT_ID, isDev
│   │   ├── form.config.ts
│   │   ├── layout.config.ts
│   │   ├── map.config.ts
│   │   └── role-permissions.config.ts  # Role → resource mapping
│   │
│   ├── contexts/
│   │   ├── color-mode/        # Dark/light theme context
│   │   └── notification-context.tsx   # Notification state (WS + polling)
│   │
│   ├── core/
│   │   └── domain/            # Pure TypeScript domain models / enums
│   │       ├── auth/
│   │       ├── demande-visite/
│   │       ├── demandes-pro-particulier/
│   │       ├── logging/
│   │       ├── map/
│   │       ├── payments/
│   │       ├── reservations/
│   │       ├── residences/
│   │       ├── shared/
│   │       ├── transfers/
│   │       ├── user-preferences/
│   │       ├── users/
│   │       └── wallet/
│   │
│   ├── hooks/
│   │   ├── use-filter.hook.ts
│   │   └── useAdminNotificationsSocket.ts   # WebSocket hook
│   │
│   ├── lib/
│   │   ├── audio-service.ts
│   │   ├── helpers/           # auth, currency, form, HTTP exception, routing, string, URL helpers
│   │   ├── providers/         # Refine provider implementations
│   │   │   ├── access-control.provider.ts
│   │   │   ├── auth.provider.ts
│   │   │   ├── data.provider.ts
│   │   │   ├── local-storage.provider.ts
│   │   │   └── utils/         # axios instance, filter/sort/search serializers
│   │   ├── services/
│   │   │   ├── auth/          # authService implementation
│   │   │   └── logging/       # logger service
│   │   └── ts-utilities/      # Type-safe utility functions
│   │       ├── arrays/
│   │       ├── common/
│   │       ├── currency/
│   │       ├── dates/
│   │       ├── enums/
│   │       ├── objects/
│   │       ├── strings/
│   │       └── types/
│   │
│   ├── pages/                 # Feature pages (one folder per resource)
│   │   ├── alerts/
│   │   ├── auth/login/
│   │   ├── banners/
│   │   ├── biens-immobiliers/
│   │   ├── configs/
│   │   ├── demandes-pro-particulier/
│   │   ├── demandes-visites/
│   │   ├── feed/
│   │   ├── furnitures/
│   │   ├── payments/
│   │   ├── reservations/
│   │   ├── residences/
│   │   ├── statistics/
│   │   ├── transfers/
│   │   ├── user-preferences/
│   │   ├── users/
│   │   └── withdrawal-request/
│   │
│   └── styles/index.css       # Global CSS
│
├── docs/
│   └── banner-dashboard-spec.md
├── plop-templates/            # Code generation templates
├── plopfile.cjs               # Plop generator config
├── Dockerfile
├── docker-compose.yml
├── netlify.toml
├── nginx.conf
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 4. Architecture

### 4.1 Application Bootstrap

The entry point is `src/index.tsx`, which renders `<App />` wrapped in the i18n provider.

`App.tsx` composes the full provider tree:

```
BrowserRouter
  └── RefineKbarProvider
        └── ColorModeContextProvider
              └── AntdApp
                    └── Refine (core framework)
                          ├── dataProvider    ← custom REST adapter
                          ├── authProvider    ← JWT + localStorage
                          ├── accessControlProvider ← role-based
                          ├── i18nProvider    ← i18next
                          └── NotificationProvider ← WS + polling toasts
                                └── AppRoutes
                                └── ToastManager
```

### 4.2 Refine Framework Integration

Refine.dev provides:
- Declarative **resource registry** (name, list/create/edit/show paths, meta)
- **Data hooks** (`useList`, `useOne`, `useCreate`, `useUpdate`, `useDelete`)
- **Auth hooks** (`useLogin`, `useLogout`, `useGetIdentity`, `useIsAuthenticated`)
- **Access control** (`useCanAccess`, auto-hiding unauthorized buttons)
- **Ant Design integration** (`@refinedev/antd`) with ready-made `List`, `Edit`, `Show`, `Create` layout components
- **Router integration** via `@refinedev/react-router-v6`

### 4.3 Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `core/domain/` | Pure TS models, enums, interfaces — no framework dependencies |
| `lib/providers/` | Refine adapter implementations (data, auth, access control) |
| `lib/services/` | API service implementations (authService) |
| `lib/helpers/` | Side-effect-free helper functions |
| `lib/ts-utilities/` | Generic TypeScript utilities (arrays, dates, enums, …) |
| `contexts/` | React Context for cross-cutting concerns (theme, notifications) |
| `hooks/` | Custom hooks that encapsulate side effects |
| `components/` | Shared presentational and composite components |
| `pages/` | Feature modules — one folder per resource, each containing list/show/edit/create pages and local components |
| `configs/` | Constant configuration objects and permission tables |

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

1. User submits credentials on `/login` page.
2. `authService.login()` POSTs to `/auth/login` with body `{ username, password, source: "admin_app" }`.
3. Server returns `{ accessToken, refreshToken, expires, user }`.
4. **Role guard**: only `admin`, `financier`, `commercial` roles are accepted. Any other role throws and returns an error.
5. Tokens + role are stored in `localStorage` under key `admin_app_storage`.
6. The access token is attached to all subsequent Axios requests via `Authorization: Bearer <token>`.
7. On logout, `admin_app_storage` is removed and the user is redirected to `/login`.

### 5.2 Token Refresh

The Axios instance (`src/lib/providers/utils/axios.ts`) has a response interceptor:
- On any `401` response (except from `/auth/refresh-token` and `/auth/login` endpoints):
  - If a refresh is already in progress, the request is queued.
  - Otherwise, `authService.refreshToken()` is called against `/auth/refresh-token`.
  - On success, the queue is flushed and the original request is retried.
  - On failure, all queued requests are rejected and the user is redirected to `/login`.

### 5.3 Role-Based Access Control

Roles and their permitted resources are declared in `src/configs/role-permissions.config.ts`:

| Role | Resources | Default Redirect |
|---|---|---|
| `admin` | All 17 resources | `/demandes-visites` |
| `financier` | `withdrawal-requests`, `transfers`, `payments` | `/withdrawal-requests` |
| `commercial` | All except `withdrawal-requests`, `transfers`, `payments`, `configs`, `banners` | `/demandes-visites` |

The `AccessControlProvider` reads the role from localStorage and calls `canAccessResource(role, resource)`. Unauthorized buttons are hidden automatically by Refine.

The `RoleBasedRedirect` component (used at the `/` index route) reads the role and performs the appropriate redirect on initial load.

### 5.4 Session Storage Schema

Key: `admin_app_storage` (localStorage)

```ts
{
  access_token: string;
  refresh_token: string;
  expires: number;
  expires_at: number;
  role: "admin" | "financier" | "commercial";
}
```

---

## 6. Data Provider & API Conventions

### 6.1 Standard Patterns

The custom data provider (`src/lib/providers/data.provider.ts`) maps Refine operations to REST API calls:

| Refine Method | HTTP | URL Pattern |
|---|---|---|
| `getList` | GET | `/{resource}?_page=N&_pageSize=N&_search=Q&_order_by=F&_order_dir=asc\|desc&_where=[…]` |
| `getOne` | GET | `/{resource}/{id}` |
| `getMany` | GET | `/{resource}?_where=[{_field:id,_op:in,_val:[…]}]` |
| `create` | POST | `/{resource}` |
| `update` | PATCH | `/{resource}/{id}` |
| `deleteOne` | DELETE | `/{resource}/{id}` |

**Filter serialization**: Filters are serialized as `_where=[{_field, _op, _val}]` query strings via `serializeWhereParameterToQueryFiltersString`.

**Response envelope**: The API returns `{ data: [...], totalCount: N }` for lists and `{ data: {...} }` for single records.

### 6.2 Special URL Overrides

Some resources require non-standard endpoints:

| Resource | Operation | URL |
|---|---|---|
| `withdrawal-requests` | list / getOne / update / delete | `/wallet/withdrawal-request[/:id]` |
| `transfers` | list | `/transfers/all` |
| `transfers` | create / getOne / update / delete | `/transfers[/:id]` |
| `feed-legacy` | list | `/feed/legacy` (uses `page`/`limit` not `_page`/`_pageSize`) |
| `feed` | getOne | `/feed/videos/{id}` |
| `feed` | create | `/feed/videos/upload` |
| `wallet-transactions` | list | `/wallet/admin/wallet-transactions/{meta.ownerId}` |

### 6.3 Data Normalization

`withdrawal-requests` amounts are stored as strings in the API; the data provider coerces `amount` and `amountWithFees` to integers via `parseInt` on every list/getOne/update response.

### 6.4 Feed vs. Feed-Legacy Pagination

- **Feed** (active): uses `count` field for total.
- **Feed-legacy**: uses `total` field; pagination params are `page`/`limit`.
- **All others**: use `totalCount` field.

### 6.5 Alert & Feed-Legacy Status Filtering

For `alerts` and `feed-legacy`, any filter on `status` is extracted from the `_where` array and passed as a direct `?status=` query param instead.

---

## 7. Resources (Modules)

Each resource is registered in `App.tsx` and has corresponding route definitions in `AppRoutes.tsx`. The page folder follows the convention `src/pages/{resource-name}/`.

### Resource List

| Resource Name | Label | Operations | Page Location |
|---|---|---|---|
| `statistics` | Statistiques | list | `pages/statistics/` |
| `feed` | Feed | list, show | `pages/feed/` |
| `alerts` | Alertes | list, show | `pages/alerts/` |
| `demandes-pro-particulier` | Demandes Pro Particulier | list, show | `pages/demandes-pro-particulier/` |
| `demandes-visites` | Demandes de visites | list, edit, show | `pages/demandes-visites/` |
| `residences` | Résidences | list, edit, show | `pages/residences/` |
| `reservations` | Réservations | list, edit, show | `pages/reservations/` |
| `biens-immobiliers` | Biens immobiliers | list, edit, show | `pages/biens-immobiliers/` |
| `furnitures` | Meubles | list, edit, show | `pages/furnitures/` |
| `users` | Utilisateurs | list, create, edit, show | `pages/users/` |
| `wallet-transactions` | — | list | (within users) |
| `wallets` | — | list, edit, show | (within users) |
| `withdrawal-requests` | Demandes de retraits | list, create, edit, show | `pages/withdrawal-request/` |
| `transfers` | Transferts | list, create, edit, show | `pages/transfers/` |
| `payments` | Paiements | list, edit | `pages/payments/` |
| `user-preferences` | Préférences utilisateurs | list | `pages/user-preferences/` |
| `banners` | Bannières | list, create, edit | `pages/banners/` |
| `configs` | Configurations | list/edit | `pages/configs/` |

### Per-Resource Sub-Routes (Filtered Views)

Many resources expose multiple filtered list pages as sub-routes:

| Resource | Sub-route | Filter |
|---|---|---|
| `residences` | `/en-validation` | `en_attente_validation` |
| `residences` | `/validé` | `valide` |
| `reservations` | `/en-validation` | pending |
| `reservations` | `/valide-termine` | validated/done |
| `reservations` | `/echoue-annule` | failed/cancelled |
| `biens-immobiliers` | `/en-validation` | pending |
| `biens-immobiliers` | `/validé` | validated |
| `biens-immobiliers` | `/disponible` | available |
| `biens-immobiliers` | `/non-disponible` | unavailable |
| `demandes-visites` | `/en-validation` | pending |
| `demandes-visites` | `/validé` | validated |
| `alerts` | `/en-attente` | pending |
| `alerts` | `/propositions` | proposals |
| `alerts` | `/clôturées` | closed |
| `demandes-pro-particulier` | `/en-attente` | pending |
| `demandes-pro-particulier` | `/approuvées` | approved |
| `demandes-pro-particulier` | `/rejetées` | rejected |
| `payments` | `/factures` | invoices |
| `payments` | `/retraits` | withdrawal requests |
| `users` | `/admin` | admins |
| `users` | `/pro-entreprise` | pro enterprise |
| `users` | `/pro-particulier` | pro individual |
| `users` | `/customer` | customers |
| `users` | `/financier` | finance team |
| `users` | `/commercial` | sales team |
| `users` | `/utilisateurs-valides` | verified users |
| `users` | `/utilisateurs-non-valides` | unverified users |
| `feed` | `/list` | active feed |
| `feed` | `/legacy` | legacy feed |
| `feed` | `/videos/upload` | upload index |
| `feed` | `/videos/upload/promo` | promo upload |
| `feed` | `/videos/upload/with-property` | property-linked upload |

---

## 8. Domain Models

### User (`src/core/domain/users/user.model.ts`)

```ts
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  language?: string;
  avatar?: string;
  phoneNumber: string;
  country?: string;
  state?: string;
  city?: string;
  commune?: string;
  address?: string;
  address2?: string;
  currency?: string;
  additionalData?: UserData;
  identityVerified: boolean;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  compteProValide: boolean;
  authLoginAttempts: number;
  status: UserStatus;  // "Active" | "Blocked"
  createdAt?: Date;
  updatedAt?: Date;
}
```

**UserRole enum**: `customer`, `admin`, `pro_entreprise`, `pro_particulier`, `financier`, `commercial`

### Residence

**StatusValidationResidence**: `valide`, `en_attente_validation`, `rejete`

**TypeResidence**: `appartement`, `maison`, `villa`

### Reservation

**StatusValidationReservation**: `valide`, `en attente validation`, `rejete`, `terminee`, `en_cours`

### Demande de Visite

**StatusDemandeVisite**: `rejete`, `valide`, `en_cours`, `en_cours_validation_user`, `en_cours_validation_admin`

**TypeDemandeVisite**: `express`, `normal`

### Payment (`src/core/domain/payments/payment.model.ts`)

```ts
interface Payment {
  id: string;
  amount: number;
  amountNoFees: number;
  customer: string;
  paymentType: PaymentType;
  collection: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  itemId: string;
  hub2PaymentId?: string;
  hub2Exception?: string;
  hub2NextAction?: Record<string, any>;
  hub2Token?: string;
  hub2Metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

Hub2 fields indicate integration with the Hub2 payment gateway.

### Transfer (`src/core/domain/transfers/transfer.model.ts`)

```ts
interface Transfer {
  id: string;
  amount: number;
  currency: string;
  fees?: number;
  customer?: string;
  itemType: TransferItemType;
  itemId: string;
  transfetStatus: TransferStatus;
  transferType: TransferType;
  country: string;
  accountNumber?: string;
  bank?: Record<string, any>;
  recipientName?: string;
  transferProvider?: PaymentMethod;  // Hub2, mobile money, etc.
  hub2TransferId?: string;
  hub2Exception?: string;
  hub2Metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Banner

```ts
interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta2_label: string | null;
  icon: string;
  bg_color: string;
  type: "promo" | "notification";
  audience: "buyer" | "seller" | "all";
  order: number;
  active: boolean;
  dismissible: boolean;
  created_at: string;
}
```

---

## 9. Real-time Notification System

The notification system (`src/contexts/notification-context.tsx`) is composed of two sources:

### 9.1 WebSocket (primary)

**Hook**: `useAdminNotificationsSocket` (`src/hooks/useAdminNotificationsSocket.ts`)

- Connects to `${API_URL}/admin-notifications` Socket.io namespace.
- Authentication: passes `access_token` in socket auth option.
- Auto-reconnect: 2s initial delay, max 30s, infinite attempts, transports `["websocket", "polling"]`.
- On `io server disconnect` (server kicked), sets `connectionError = "notifications_unavailable"`.
- When a connection error appears, the `NotificationProvider` attempts a token refresh and reconnects.

**Monitored events**:

| Socket Event | Internal Type | Resource Link |
|---|---|---|
| `admin:nouvelle_reservation` | `nouvelle_reservation` | `/reservations/edit/{id}` |
| `admin:nouvelle_demande_visite` | `nouvelle_demande_visite` | `/demandes-visites/edit/{id}` |
| `admin:nouvelle_residence` | `nouvelle_residence` | `/residences/edit/{id}` |
| `admin:nouveau_bien_immobilier` | `nouveau_bien_immobilier` | `/biens-immobiliers/edit/{id}` |
| `admin:nouvelle_demande_pro` | `nouvelle_demande_pro` | `/demandes-pro-particulier/show/{id}` |

### 9.2 Polling Fallback (secondary)

Every 20 seconds, the provider polls `GET /reservations` (last 50, descending by `createdAt`, filtered to `statusFacture=non_paye` and relevant `statusReservation`). State transitions detected:

| Transition | Notification Type |
|---|---|
| New reservation in `EnAttenteReponseProprietaire` | `warning` |
| New reservation in `EnAttentePaiementClient` | `warning` |
| Status change to `EnAttentePaiementClient` | `success` |
| Invoice status `non_paye` → `paye` | `success` (payment received) |
| Status change to `ProprietaireSansReponse` or `ClientSansReponse` | `urgent` |
| Any reservation within 3 minutes of deadline | `urgent` (timer warning) |

### 9.3 Notification Storage

- Stored in `localStorage` under key `immoplus_notifications` (max 50 entries).
- Notifications older than 24 hours are automatically marked as read on load.
- Deduplication key: `{reservationId}:{type}:{title}` prevents repeated toasts on page reload.
- Toast auto-dismiss: 10,000ms for `warning`/`success`; WS notifications dismiss after 5,000ms; `urgent` notifications never auto-dismiss.

### 9.4 Notification Shape

```ts
interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'success';
  title: string;
  description: string;
  createdAt: number;        // timestamp
  read: boolean;
  reservationId?: string;
  isTimerWarning?: boolean;
  wsType?: WsNotificationType;
  resourceLink?: string;    // navigation target
}
```

---

## 10. Key Features In Depth

### 10.1 Banner Management (`/banners`)

Full CRUD for in-app banners displayed in client and pro mobile apps.

- **List view**: sortable table with drag-and-drop reordering (HTML5 drag events). Dropping a row calls `PATCH /banners/{id}` for every item in the reordered list in parallel.
- **Active toggle**: inline Switch; optimistic update with rollback on API error.
- **Preview modal**: renders a `BannerPreview` component showing how the banner looks in-app.
- **Filters**: by audience (buyer/seller/all), type (promo/notification), and active status.
- Audience values: `buyer` (client app), `seller` (pro app), `all` (both).

### 10.2 User Export (`/users` → ExportUsersButton)

Exports the full user list with current table filters applied, in three formats:

- **Excel (.xlsx)**: column widths auto-sized.
- **CSV**: UTF-8 BOM prefix for correct Excel rendering of accented French characters.
- **PDF**: landscape A4, branded header, alternating row colors, using jsPDF + jspdf-autotable.

**Batch fetch strategy**: Fetches page 1 to get the real `totalCount` and the actual page size returned by the API, then fetches remaining pages in batches of 5 concurrent requests. This handles the case where the API enforces a smaller page size than requested (e.g., returns 10 items even when 100 are requested).

### 10.3 Video Feed (`/feed`)

Three sub-sections:

| Section | Path | Description |
|---|---|---|
| Active Feed | `/feed/list` | Current video feed; items fetched from `/feed` |
| Legacy Feed | `/feed/legacy` | Older video feed; uses `page`/`limit` pagination |
| Upload | `/feed/videos/upload` | Upload hub with three modes: standard, promo, with-property link |

### 10.4 Statistics Dashboard (`/statistics`)

Multiple Recharts-based charts loaded separately:

- `StatistiquesTotaux` — overall totals
- `StatistiquesReservations` — reservation volume
- `StatistiquesReservationsParStatut` — reservations by status
- `StatistiquesBiensImmobiliers` — property listings
- `StatistiquesResidences` — residence stats
- `StatistiquesFinance` — financial aggregates
- `StatistiquesVisites` — visit requests
- `StatistiquesVisitesParType` — visits by type (express/normal)

### 10.5 Map / Location Picker

The `LocationPicker` component (`src/components/form/map/location-picker.tsx`) uses `react-map-gl` backed by either Mapbox GL or MapLibre GL. Configuration via `src/configs/map.config.ts`.

### 10.6 Reservation Countdown

`ReservationCountdown` component (`src/pages/reservations/components/reservation-countdown.tsx`) displays a live countdown for reservations that are awaiting confirmation. The `NotificationContext` uses its helpers (`getTempsRestant`, `isRelevantStatus`) to fire urgent notifications when fewer than 3 minutes remain.

### 10.7 Wallet Operations

From the user detail page (`/users/show/:id`), admins can perform wallet operations via dedicated form components:

- **WalletCreditForm**: credit a user's wallet
- **WalletDebitForm**: debit a user's wallet
- **WalletTransferForm**: transfer between users
- **WalletReleaseFundsForm**: release held/escrow funds
- **ListTransactionsTable**: transaction history for a specific user (fetched from `/wallet/admin/wallet-transactions/{userId}`)

---

## 11. Routing

All routes are defined in `src/AppRoutes.tsx`. The top-level route wraps everything in:
- `<Authenticated>` — redirects to `<LoginPage />` if unauthenticated
- `<ThemedLayoutV2>` — the sidebar + header shell

The index route (`/`) renders `<RoleBasedRedirect />` which immediately redirects based on role.

**404 handling**: A catch-all `path="*"` renders `<ErrorComponent />` from `@refinedev/antd`.

---

## 12. Internationalization

- **Framework**: i18next with `react-i18next`
- **Supported languages**: French (`fr`, primary/fallback), English (`en`)
- **Language detection**: browser-based via `i18next-browser-languagedetector`
- **Translation files**: loaded lazily from `/locales/{lang}/{ns}.json` (XHR backend)
- **Namespace**: single namespace `common`
- **Usage**: `useTranslate()` hook from `@refinedev/core` (wraps i18next `t()`)

---

## 13. Utility Libraries

Located in `src/lib/ts-utilities/`:

### Arrays
| Utility | Purpose |
|---|---|
| `paginate` | Client-side pagination helper |
| `getDictionaryValues` | Extract values from a Record |
| `enumerableFromListEqual` | Check enumerable equality |
| `isAllEqual` | Check if all array items are equal |

### Common
| Utility | Purpose |
|---|---|
| `asType` | TypeScript type assertion helper |
| `castItem` / `castObject` | Runtime casts |
| `createInstanceOf` | Factory helper |
| `duplicateObject` | Deep clone |
| `mergeObjects` | Object merge |
| `readOnlyFormField` | Ant Design read-only form field wrapper |

### Currency
| Utility | Purpose |
|---|---|
| `toLocalCurrency` | Format number as FCFA string |

### Dates
| Utility | Purpose |
|---|---|
| `dateCompare` | Compare two dates |
| `dateMonthPeriod` | Get start/end of month |
| `dateOperation` | Date arithmetic |

### Enums
| Utility | Purpose |
|---|---|
| `enumToList` | Convert enum to `{label, value}[]` for Select inputs |
| `StatusBiensImmobiliers` | Enum for property status labels |
| `StatusFacture` | Enum for invoice status labels |
| `StatusReservation` | Enum for reservation status labels |
| `UsersEnum` | Enum helpers for user roles |

### Helpers (`src/lib/helpers/`)
| Helper | Purpose |
|---|---|
| `auth.helper` | Auth-related utilities |
| `currency.helper` | Currency formatting |
| `form.helper` | Form utilities |
| `http-exception.helper` | Map HTTP errors to messages |
| `routing.helper` | Route construction |
| `string.helper` | String manipulation |
| `url.helper` | `normalizeStringArray`, `serializeWhereParameterToQueryFiltersString` |

---

## 14. Configuration

### `src/configs/app.config.ts`

```ts
export const isDev = import.meta.env.MODE === "development";
export const ROUTE_PREFIX = "/backoffice";
export const PROJECT_NAME = "Immoplus";
export const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || "xntn5Z-AEaHwy-gkPtSa";
export const API_URL = import.meta.env.VITE_API_URL || "https://api.immoplus.ci";
```

### `src/configs/role-permissions.config.ts`

Exports:
- `rolePermissions`: `Record<UserRole, { resources: string[], defaultRedirect: string }>`
- `canAccessResource(role, resource)`: boolean
- `getDefaultRedirect(role)`: string
- `getAllowedResources(role)`: string[]

### `tailwind.config.js`

Scans all `src/**/*.tsx` files; used primarily for utility classes in custom components.

### `tsconfig.json`

Path alias `@/*` maps to `src/*` (resolved by `vite-tsconfig-paths`).

---

## 15. Build, Deployment & Infrastructure

### Local Development

```bash
npm run dev         # Vite dev server
npm run debug       # Vite dev + Refine devtools panel
```

### Production Build

```bash
npm run build       # vite build --mode production → dist/
```

### Netlify (Primary Deployment)

- Config: `netlify.toml`
- Build command: `npm run build`
- Publish directory: `dist/`
- Node version: 23
- SPA redirect: `public/_redirects` ensures all paths redirect to `index.html`

### Docker / Nginx (Alternative Deployment)

```
Dockerfile:
  FROM nginx:latest
  COPY nginx.conf → /etc/nginx/conf.d/default.conf
  COPY ./web/* → /usr/share/nginx/html
  EXPOSE 3000
```

`docker-compose.yml` available for local container testing.

---

## 16. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `https://api.immoplus.ci` | Backend API base URL |
| `VITE_PROJECT_ID` | `xntn5Z-AEaHwy-gkPtSa` | Refine devtools project ID |

A `.env.example` file is provided in the repository root.

---

## 17. Developer Tooling

### Plop (Code Generator)

```bash
npm run refine   # runs vite (alias)
```

`plopfile.cjs` + `plop-templates/` provide scaffolding templates for new pages/components. Run with:

```bash
npx plop
```

### Refine DevTools

```bash
npm run debug    # starts Refine devtools alongside the dev server
```

Provides a browser panel for inspecting queries, mutations, and resource state.

### ESLint

Config: `.eslintrc.cjs`  
Plugins: `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

### TypeScript

Strict mode is not explicitly set; target is ES2020 via default Vite config. Path aliases via `vite-tsconfig-paths`.
