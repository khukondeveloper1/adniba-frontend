# AdNex Frontend

Production-ready SaaS frontend for the AdNex Ad Mediation Platform.

## Stack

- Next.js 14 (App Router) · TypeScript strict
- TailwindCSS · ShadCN Radix primitives
- TanStack Query v5 · React Hook Form · Zod
- Axios (two isolated instances: developer + admin)
- Sonner (toasts) · Recharts (analytics)

## Setup

```bash
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL to your backend URL

npm install
npm run dev
```

## Architecture

```
src/
├── app/
│   ├── (public)/          # Landing, docs, static pages — no auth
│   ├── (auth)/            # /login /register /forgot-password /reset-password
│   ├── (developer)/       # /dashboard/** — JWT protected
│   └── (admin)/           # /admin/login  /admin/dashboard/** — Admin JWT
├── components/
│   ├── ui/                # Button, Input, Dialog, Select, Switch, Tabs, Badge, Skeleton
│   ├── landing/           # Navbar, Footer, Hero, Networks, Features, SDK, API, CTA sections
│   ├── dashboard/         # DeveloperSidebar, AdminSidebar, StatCard, DashboardTopbar
│   └── apps/              # CreateAppDialog, ApiKeyDialog, NetworksTab, AdUnitsTab, AdSettingsTab, AnalyticsTab
├── hooks/
│   ├── use-developer-data.ts   # 20 TanStack Query hooks for developer API
│   ├── use-admin-data.ts       # 15 TanStack Query hooks for admin API
│   ├── use-public-data.ts      # Public endpoints
│   ├── use-developer-guard.ts  # Auth + guest guards
│   ├── use-admin-guard.ts
│   ├── use-api-error.ts        # Centralised error → toast/form mapping
│   └── use-copy-to-clipboard.ts
├── lib/
│   ├── axios/
│   │   ├── developer.ts   # JWT + refresh queue (401 → silent refresh → retry)
│   │   ├── admin.ts       # Same pattern, admin endpoints
│   │   └── public.ts      # No auth
│   ├── query-client.ts    # QueryClient config + queryKeys factory
│   ├── utils.ts           # cn, formatDate, extractApiError, parseForbiddenReason, maskApiKey
│   └── validations/       # Zod schemas per module
├── services/
│   ├── developer/         # auth, profile, apps, modules (networks/units/settings/analytics/limits)
│   ├── admin/             # auth, modules (apps/networks/users/limits/emails/analytics/docs/pages)
│   └── public/            # networks, pages, api-docs
├── types/                 # api.ts, auth.ts, app.ts, network.ts, admin.ts
└── constants/             # ad.ts, networks.ts, routes.ts
```

## Key Decisions

| Decision | Implementation |
|---|---|
| R1 — Ad Settings placement | Dropdown sourced from existing ad units, never free-text |
| R2 — Token refresh | Silent refresh queue: 401 → POST refresh → retry all queued; logout on failure |
| R3 — Dashboard stats | Derived from /auth/me + apps list; health from app_status+is_suspended+global_ad_enabled |
| R5 — Priority UX | Numeric input (Phase 1); drag-drop in Phase 2 |
| R6 — Create App | 2-step dialog: Play Store fetch → form pre-fill |
| R10 — Broadcast email | 2-step confirmation with active developer count |

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Developer login |
| `/register` | Developer register |
| `/dashboard` | Developer overview |
| `/dashboard/apps` | App management |
| `/dashboard/apps/[id]` | App detail hub (5 tabs) |
| `/dashboard/external-api` | API docs + endpoint explorer |
| `/dashboard/settings` | Profile, password, limit requests |
| `/admin/login` | Admin login (hidden URL) |
| `/admin/dashboard` | Admin overview |
| `/admin/dashboard/apps` | Suspend/unsuspend, rotate keys |
| `/admin/dashboard/developers` | Toggle status, set limits, send email |
| `/admin/dashboard/networks` | Global network CRUD |
| `/admin/dashboard/limit-requests` | Approve/reject queue |
| `/admin/dashboard/emails` | Logs + broadcast |
| `/admin/dashboard/analytics` | Per-app analytics |
| `/admin/dashboard/api-docs` | CMS for API documentation |
| `/admin/dashboard/pages` | CMS for static pages |
