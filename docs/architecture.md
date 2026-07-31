# WorkDays - Web Application Architecture

## 1. Overview

WorkDays is an HR/Workforce management platform for a Belgian healthcare organization (Maison Médicale de Forest ASBL). It manages employees, absences/leave, timesheets, salary scales, organization structure, leasing assets, and governance (meetings/decisions/requests).

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + TypeScript | Component-based UI, large ecosystem, type safety |
| **UI Framework** | Vite + React Router | Fast dev server, modern bundling, SPA routing |
| **UI Components** | Shadcn/UI + Tailwind CSS | Professional look, accessible components, easy theming |
| **Backend** | Node.js + Express + TypeScript | Lightweight, flexible, strong TS support |
| **ORM** | Prisma | Type-safe DB access, auto-generated types, migrations |
| **Database** | PostgreSQL 16 | Robust relational DB, excellent for HR data with complex queries |
| **Authentication** | JWT + bcrypt | Stateless auth, role-based access control |
| **Validation** | Zod | Runtime validation aligned with TypeScript types |
| **API Style** | REST (JSON) | Simple, well-understood, good tooling |
| **Internationalization** | i18next | Multi-language support (FR primary, NL, EN) |
| **Calendar/Scheduling** | FullCalendar or react-big-calendar | Absence calendar visualization |
| **PDF/Reports** | @react-pdf/renderer | Generate HR reports (absence summaries, salary) |
| **Testing** | Vitest + React Testing Library + Supertest | Fast unit/integration/API testing |
| **Containerization** | Docker + Docker Compose | Consistent dev/prod environments |

---

## 3. Application Modules

Based on the Access prototype analysis, the application is organized into these functional modules:

```
┌─────────────────────────────────────────────────────────────┐
│                        WORKDAYS                               │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│  Organisation│  Employees   │   Absences   │   Timesheets    │
│  - Entity    │  - Profile   │   - Calendar │   - Weekly      │
│  - Sectors   │  - Contract  │   - Booking  │   - Templates   │
│  - Locations │  - Seniority │   - Rights   │   - Totals      │
│  - RTT Groups│  - Indexation│   - Codes    │                 │
├─────────────┼──────────────┼──────────────┼─────────────────┤
│   Salary     │   Leasing    │  Governance  │   Security      │
│  - Scales    │  - Vehicles  │  - Meetings  │  - Users/Roles  │
│  - Indexation│  - Phones    │  - Decisions │  - Permissions   │
│  - Seniority │  - Printers  │  - Requests  │  - Audit Log    │
│              │  - Assign    │  - Changes   │                 │
└─────────────┴──────────────┴──────────────┴─────────────────┘
```

---

## 4. Folder Structure

```
workdays/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── index.ts                 # Entry point
│       ├── app.ts                   # Express app setup
│       ├── config/
│       │   ├── database.ts
│       │   ├── auth.ts
│       │   └── env.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   ├── validation.middleware.ts
│       │   └── logger.middleware.ts
│       ├── modules/
│       │   ├── organisation/
│       │   │   ├── organisation.controller.ts
│       │   │   ├── organisation.service.ts
│       │   │   ├── organisation.routes.ts
│       │   │   ├── organisation.schema.ts    # Zod validation
│       │   │   └── organisation.types.ts
│       │   ├── employees/
│       │   │   ├── employees.controller.ts
│       │   │   ├── employees.service.ts
│       │   │   ├── employees.routes.ts
│       │   │   ├── employees.schema.ts
│       │   │   └── employees.types.ts
│       │   ├── absences/
│       │   │   ├── absences.controller.ts
│       │   │   ├── absences.service.ts
│       │   │   ├── absences.routes.ts
│       │   │   ├── absences.schema.ts
│       │   │   └── absences.types.ts
│       │   ├── timesheets/
│       │   │   ├── timesheets.controller.ts
│       │   │   ├── timesheets.service.ts
│       │   │   ├── timesheets.routes.ts
│       │   │   ├── timesheets.schema.ts
│       │   │   └── timesheets.types.ts
│       │   ├── salary/
│       │   │   ├── salary.controller.ts
│       │   │   ├── salary.service.ts
│       │   │   ├── salary.routes.ts
│       │   │   ├── salary.schema.ts
│       │   │   └── salary.types.ts
│       │   ├── leasing/
│       │   │   ├── leasing.controller.ts
│       │   │   ├── leasing.service.ts
│       │   │   ├── leasing.routes.ts
│       │   │   ├── leasing.schema.ts
│       │   │   └── leasing.types.ts
│       │   ├── governance/
│       │   │   ├── governance.controller.ts
│       │   │   ├── governance.service.ts
│       │   │   ├── governance.routes.ts
│       │   │   ├── governance.schema.ts
│       │   │   └── governance.types.ts
│       │   └── auth/
│       │       ├── auth.controller.ts
│       │       ├── auth.service.ts
│       │       ├── auth.routes.ts
│       │       ├── auth.schema.ts
│       │       └── auth.types.ts
│       ├── shared/
│       │   ├── utils/
│       │   │   ├── date.utils.ts
│       │   │   ├── rtt.calculator.ts     # RTT business logic
│       │   │   ├── salary.calculator.ts  # Salary/indexation logic
│       │   │   └── vacation.calculator.ts
│       │   └── types/
│       │       └── common.types.ts
│       └── tests/
│           ├── setup.ts
│           └── ...
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ui/                   # shadcn components
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   ├── MainLayout.tsx
│       │   │   └── Breadcrumb.tsx
│       │   └── shared/
│       │       ├── DataTable.tsx
│       │       ├── FormField.tsx
│       │       ├── ConfirmDialog.tsx
│       │       └── LoadingSpinner.tsx
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── organisation/
│       │   ├── employees/
│       │   ├── absences/
│       │   ├── timesheets/
│       │   ├── salary/
│       │   ├── leasing/
│       │   ├── governance/
│       │   └── auth/
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useApi.ts
│       │   └── useDebounce.ts
│       ├── services/
│       │   ├── api.ts               # Axios instance
│       │   ├── employees.api.ts
│       │   ├── absences.api.ts
│       │   └── ...
│       ├── store/                    # Zustand or React Context
│       │   ├── auth.store.ts
│       │   └── app.store.ts
│       ├── i18n/
│       │   ├── fr.json
│       │   ├── nl.json
│       │   └── en.json
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           ├── dates.ts
│           └── formatters.ts
│
└── docs/
    ├── architecture.md              # This file
    ├── database-schema.md
    ├── api-reference.md
    └── deployment.md
```

---

## 5. Deployment Strategy

### Development
- Docker Compose with PostgreSQL, backend (hot reload), frontend (Vite dev server)
- Environment variables via `.env` file

### Production Options
| Option | Description |
|--------|-------------|
| **Self-hosted (recommended for healthcare)** | Docker containers on a VPS (Hetzner, OVH Belgium) |
| **Cloud PaaS** | Railway, Render, or Fly.io for quick deployment |
| **Enterprise** | Azure/AWS with managed PostgreSQL |

### Security Considerations (Healthcare/HR data)
- HTTPS everywhere (Let's Encrypt via Caddy/Traefik)
- Database encrypted at rest
- GDPR compliance: data retention policies, right to erasure
- Role-based access: Admin, HR Manager, Sector Manager, Employee
- Audit logging for all data mutations
- Session timeout and password policies

---

## 6. User Roles (derived from test cases)

| Role | Access |
|------|--------|
| **Admin** | Full system access, entity/sector/user management |
| **HR Manager** | Employee management, absences, timesheets, salary, reports |
| **Leasing Manager** | Vehicle/asset management and assignment |
| **Sector Manager** | View/manage own sector employees, approve absences |
| **Employee** | View own data, request absences, view timesheet |

---

## 7. Key Business Logic to Reimplement

These Access VBA functions need web equivalents:

| Access Function | Web Implementation |
|----------------|-------------------|
| `Nz()` | `value ?? defaultValue` (nullish coalescing) |
| `DProduct()` | Custom aggregate calculation in SQL or service layer |
| `GetTimeSheetTotal()` | `timesheets.service.ts` — sum weekly hours |
| RTT Calculation | `rtt.calculator.ts` — based on seniority and sector |
| Salary Indexation | `salary.calculator.ts` — apply index to base salary |
| Vacation Rights | `vacation.calculator.ts` — entitlement minus taken |

---

## 8. Phase Plan

| Phase | Scope | Duration |
|-------|-------|----------|
| **Phase 1** | Auth, Organisation, Employees (core) | 3-4 weeks |
| **Phase 2** | Absences, Calendar, Vacation Rights | 3-4 weeks |
| **Phase 3** | Timesheets, Salary, RTT | 2-3 weeks |
| **Phase 4** | Leasing, Governance, Reports | 2-3 weeks |
| **Phase 5** | Polish, i18n, GDPR, deployment | 2 weeks |
