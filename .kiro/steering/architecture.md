# WorkDays - Architecture Decisions

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR for speed, server actions, excellent DX, single codebase |
| **UI** | Tailwind CSS | Utility-first, no CSS modules, fast iteration |
| **Calendar** | FullCalendar (React) | Most mature, handles all views, locale support |
| **State** | TanStack Query (React Query) | Server state management, caching, optimistic updates |
| **Backend** | Next.js API Routes + Supabase | End-to-end type safety, minimal boilerplate |
| **DB** | Supabase (PostgreSQL hosted) | Managed PostgreSQL, real-time subscriptions, auth built-in |
| **Auth** | Supabase Auth | JWT + session, role-based (ADMIN, HR_MANAGER, SECTOR_MANAGER, EMPLOYEE) |
| **Validation** | Zod | Runtime validation aligned with TypeScript types |
| **Deploy** | Vercel (auto-deploy from GitHub) | Zero-config Next.js hosting, automatic previews |

## Key Architectural Decisions

### Single codebase (Next.js) over separate React + Express

For a 50-employee internal tool:
- One codebase instead of two
- Server components for fast initial loads
- Server actions for mutations (no manual API calls for simple CRUD)
- Simpler deployment (one container/serverless)
- Still separable if a mobile app is needed later

### Supabase over self-managed PostgreSQL

- Managed hosting (no ops overhead)
- Built-in auth with roles
- Real-time subscriptions for reactive UI
- Dashboard for quick DB inspection
- RLS for row-level security (to be enabled after development stabilizes)

### Application-layer computation over complex SQL

The Access prototype used god-queries with 40+ calculated fields. Instead:
- Base data: clean normalized tables
- Computed data: application service layer (TypeScript, testable)
- Read models: pre-computed views for dashboards if needed

## Folder Structure (Active)

```
workdays/
├── src/
│   └── app/                    # Next.js App Router pages
│       ├── (app)/              # Authenticated layout group
│       │   ├── dashboard/
│       │   ├── employees/
│       │   ├── absences/
│       │   ├── horaires/
│       │   ├── remuneration/
│       │   ├── actifs/
│       │   ├── gouvernance/
│       │   ├── rapports/
│       │   └── parametres/
│       ├── layout.tsx
│       └── page.tsx
├── src/components/             # Shared React components
│   ├── ui/                     # Base UI primitives
│   └── layout/                 # App shell (sidebar, header)
├── src/lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   └── utils/                  # Shared utilities
├── supabase/
│   ├── schema.sql              # Full DB schema
│   └── migrations/             # Incremental migrations
├── .kiro/
│   ├── steering/               # Architecture, conventions, context
│   └── specs/                  # Business rules, feature specs, phases
├── docs/                       # Reference documentation
│   └── reference/              # Historical/detailed docs
└── extracted/                  # Raw Access prototype exports
```

## Deployment Architecture

```
GitHub (code) ──push──> Vercel (hosting)
                              |
                              | API calls (NEXT_PUBLIC_SUPABASE_URL)
                              v
                         Supabase (DB + Auth)
```

- Every `git push` to main triggers automatic redeployment on Vercel
- Environment variables configured in Vercel dashboard
- Supabase project: `jqfaclixnraugzmcrylp`

## Security Considerations

- HTTPS everywhere (handled by Vercel + Supabase)
- GDPR compliance: data retention policies, right to erasure (healthcare/HR data)
- Role-based access: Admin, HR Manager, Sector Manager, Employee
- Audit logging for data mutations (planned)
- RLS to be enabled once development stabilizes
