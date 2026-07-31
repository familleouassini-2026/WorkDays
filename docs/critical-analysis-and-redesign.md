# WorkDays — Critical Analysis & Web-Native Redesign

## Philosophy

The Access prototype is a **requirements discovery tool**, not a blueprint. 
We extract the *intent* and *business rules*, then redesign from scratch using:
- Modern UX patterns (not form-per-table thinking)
- Proper normalization and domain modeling
- Separation of concerns (not queries that embed UI references)
- Scalable, maintainable architecture
- Native web interactions (not desktop metaphors ported to a browser)

---

## Part 1: Critical Analysis of the Access Prototype

### 1.1 Data Model Issues

| Issue | Where | Impact | Fix |
|-------|-------|--------|-----|
| **No enforced foreign keys** | All tables | Data integrity at risk, orphaned records possible | Enforce at DB level + cascade rules |
| **Redundant tables** | `tbl_Holidays1` vs `tbl_Abs_Holidays` | Confusion, stale data | Single `holidays` table with year scope |
| **Pivot-style indexation** | `tbl_Index` (20 columns × 2 = 40 cols) | Rigid, can't add more indexes, violates 1NF | Normalize to rows: `(id, position, value, date)` |
| **Implicit relationships** | EmployeeID, SecteurID everywhere but no FK | No referential integrity | Proper FKs with ON DELETE rules |
| **Mixed concerns in Employees** | Contact info + HR data + seniority + banking in one table | Bloated, hard to permission | Split into logical groups (identity, contract, banking, assignment) |
| **Naming chaos** | `tbl_Emp_Employees`, `tbluBoughtVacation`, `tbl_Sec_Secteurs` | Developer confusion | Consistent, meaningful naming |
| **Absence time stored as Access Date** | `1899-12-30 08:00:00` for "8 hours" | Fragile, confusing | Store as INTEGER (minutes) |
| **No audit trail** | All tables | No history, no accountability | Audit log + soft deletes |
| **VacationRight uses EmployeeName (INTEGER)** | `tbl_VacationRight.EmployeeName` | Misleading column name | Rename to `employee_id`, type clarity |
| **Test tables mixed with production** | `tbl_tst_*` tables | Pollute the production schema | Separate entirely (or remove from prod) |
| **Settings in a table** | `Settings` table with 1 row | Inappropriate for app config | Environment variables / config file |
| **Contacts table (empty, unused)** | `Contacts` | Dead weight, Access template leftover | Remove |
| **Paste Errors table** | Debug/import artifact | Should never exist in production | Remove |
| **Rich HTML in data fields** | `AbsenceColorTag`, `RichTextFormat` | DB stores presentation logic | Store data only; presentation in frontend |

### 1.2 Query Design Issues

| Issue | Where | Impact | Fix |
|-------|-------|--------|-----|
| **Queries reference forms directly** | `forms!frm_YearCalendar!cboEmployee` in WHERE clauses | Tightly coupled to UI, can't reuse | Parameterized queries / API parameters |
| **VBA functions in SQL** | `Nz()`, `DProduct()`, `GetTimeSheetTotal()` | Not portable, not standard SQL | Implement in application service layer |
| **God query: Contacts Extended** | 40+ calculated fields in one query | Impossible to maintain, debug, or optimize | Break into focused views/services |
| **DLookup/DSum in queries** | Scattered everywhere | N+1 query pattern, terrible performance | JOINs and aggregations in proper SQL |
| **No pagination** | All queries return all data | Won't scale beyond 50 employees | Server-side pagination |
| **Date math in SQL** | `DateDiff`, `DateSerial`, `DateAdd` | Complex, error-prone, Access-specific | Application layer with proper date library |
| **Inline IIf logic** | Everywhere in Contacts Extended | Unreadable, unmaintainable | Computed fields in service layer or DB views |
| **UNION queries for RTT** | `xqryRTTCurrentYear_2` | Complex, fragile, references 3 nonexistent fields (KAge1, KDate1) | Redesign RTT calculation as a service |

### 1.3 VBA / Business Logic Issues

| Issue | Where | Impact | Fix |
|-------|-------|--------|-----|
| **Calendar grid = 37 hardcoded textboxes** | `subFormMonth`, `mod_FillTextBoxes` | Rigid, fragile, Access-specific UI hack | Use a proper calendar component (react-big-calendar, FullCalendar) |
| **Color-coding via VBA at runtime** | `FillSubFormTextBoxes` | Mixes data + presentation | CSS classes mapped to absence codes |
| **RTT calculation scattered** | `Qry_RTTCalc` + `Form_frm_RTTCalc` | Hard to verify, impossible to unit test | Single `RTTCalculationService` with tests |
| **Salary indexation via DProduct** | `qry_Sec_indexCal` | Multiplicative index calculation is critical but hidden | Explicit `SalaryService.calculateCurrentSalary()` |
| **Seniority calculation** | `Contacts Extended` query + `mod_YearsOfService` | Split across 2 places, uses granted seniority + hire date | Single `SeniorityService` |
| **Holiday booking logic in form events** | `Form_frm_Abs_HolidayInputForm` (655 lines) | Untestable, tied to UI | `AbsenceBookingService` with validation rules |
| **Absenteeism policy = last 6 months** | `qry_rpt_AbsenteeismPolicy` | Business rule hidden in SQL | Configurable policy engine |
| **Email-as-PDF** | `mod_ShortcutMenuCommands` | Uses Outlook COM, Access-specific | Server-side PDF generation + email service |
| **Vacation weeks by years of service** | `qry_subFormVacPDSDSummary` (hardcoded IIf ladder) | `<=1 → 1 week, <=7 → 2, <=14 → 3, <=24 → 4, >=25 → 5` | Configurable `VacationEntitlementPolicy` table |
| **Date exclusion logic** | `DateAddWeekendHolidaysOut` (263 lines) | Business days calculation | Use a battle-tested library (date-fns-business-days) + holiday table |
| **No input validation at DB level** | Forms do validation in VBA | Bypass possible, inconsistent | API-level validation (Zod) + DB constraints |
| **Multi-value fields as delimited strings** | `DecisionTaker = "23;43;44"` | Can't query efficiently, no FK integrity | Junction table: `decision_attendees(decision_id, employee_id)` |

### 1.4 UX/Form Issues

| Issue | Where | Impact | Fix |
|-------|-------|--------|-----|
| **Calendar as 12×37 textbox grid** | Main form | Rigid, not responsive, no drag-select | Interactive calendar component with day/week/month views |
| **Navigation form = tab control** | `frm_1_NavigationForm` | Desktop pattern, doesn't translate to web | Proper sidebar navigation + routing |
| **Popup/Modal for everything** | CalendarInputBox, SecteurDetails, etc. | Disruptive, can't deep-link | Side panels / detail pages with URLs |
| **Subforms = master-detail pattern** | Employee Details has 8 subforms | Overwhelming single page | Tabbed layout or progressive disclosure |
| **No search/filter** | Employee list, absence list | Users scroll through all records | Full-text search, faceted filters |
| **Combo boxes for everything** | Sector, Employee, Absence Code | Limited to small lists | Searchable dropdowns with typeahead |
| **No bulk operations** | Holiday selection is one-by-one | Tedious for HR managers | Batch absence booking with date range picker |
| **No dashboard** | Opens straight to navigation | No overview, no alerts | KPI dashboard: pending requests, upcoming RTT alerts, leave balance overview |
| **Reports = Access print preview** | 9 reports | Not web-native | Interactive data tables with export (PDF/Excel) |
| **Right-click context menu** | `mod_ShortcutMenuCommands` | Desktop pattern | Action buttons, dropdown menus |

---

## Part 2: Web-Native Redesign

### 2.1 Core Design Principles

1. **Task-oriented, not table-oriented** — Users don't think "I need to edit tbl_YearCalendar". They think "I want to book absence for Marie next Thursday."
2. **Progressive disclosure** — Show what's needed now, reveal complexity on demand
3. **URL-addressable state** — Every view has a shareable URL (`/employees/28/absences?year=2024`)
4. **Real-time feedback** — No "refresh" buttons; data updates reactively
5. **Mobile-first** — HR managers check things on the go
6. **Role-based views** — Admin sees everything; employee sees their own data
7. **Configurable business rules** — Not hardcoded IIf ladders; admin-editable policies

### 2.2 Redesigned Information Architecture

```
WorkDays Web App
│
├── Dashboard (role-aware)
│   ├── Employee: My leave balance, my calendar, pending requests
│   ├── Manager: Team absences today, pending approvals, alerts
│   └── HR/Admin: Organization KPIs, salary alerts, compliance
│
├── People
│   ├── Employee Directory (search, filter by sector/status)
│   ├── Employee Profile (tabbed: Personal, Contract, Salary, Leave, Assets)
│   └── Org Chart / Sector Overview
│
├── Absences & Leave
│   ├── Calendar View (team/individual, month/week/year)
│   ├── Book Absence (wizard: who → when → what type → confirm)
│   ├── Leave Balances (by employee, by type, by year)
│   ├── Approval Queue (for managers)
│   └── Holiday Management (public holidays config)
│
├── Time & Schedule
│   ├── Timesheet Templates (weekly patterns per employee)
│   ├── Working Time Overview (% full-time, totals)
│   └── RTT Entitlements (auto-calculated, configurable rules)
│
├── Compensation
│   ├── Salary Scales (by sector × seniority)
│   ├── Indexation History (with simulation: "what if index = +2%?")
│   ├── Salary Alerts (upcoming increases, seniority changes)
│   └── Current Salary Overview (per employee)
│
├── Assets
│   ├── Fleet Management (vehicles, phones, printers)
│   └── Asset Assignments (who has what, since when)
│
├── Governance
│   ├── Meetings (with agenda, attendees, linked decisions)
│   ├── Decisions (searchable, linked to meetings/requests)
│   ├── Requests (workflow: submitted → reviewed → decided)
│   └── Change Log (audit trail)
│
├── Reports & Analytics
│   ├── Absence Reports (by employee, by type, by period)
│   ├── Absenteeism Policy Report (configurable window)
│   ├── Salary Projection Report
│   └── Export Center (PDF, Excel, CSV)
│
└── Settings (Admin only)
    ├── Organization Profile
    ├── Sectors & RTT Groups
    ├── Absence Codes & Policies
    ├── Vacation Entitlement Rules
    ├── Users & Roles
    └── Notifications Configuration
```

### 2.3 Redesigned Data Model (Domain-Driven)

**Key changes from Access:**

#### A. Time storage
- **Access**: `1899-12-30 08:00:00` (a Date for "8 hours")
- **Web**: `480` (INTEGER, minutes) — unambiguous, easy math

#### B. Vacation entitlement rules
- **Access**: Hardcoded in SQL: `IIf([YearsOfService]<=1,1,IIf(...))`
- **Web**: Configurable table:

```
vacation_policies:
  id | min_years | max_years | weeks_entitled | description
  1  | 0         | 1         | 1              | "First year"
  2  | 1         | 7         | 2              | "1-7 years"
  3  | 7         | 14        | 3              | "7-14 years"
  4  | 14        | 24        | 4              | "14-24 years"
  5  | 25        | NULL      | 5              | "25+ years"
```

#### C. RTT rules
- **Access**: `tbl_RTT` (age threshold → hours per year per sector)
- **Web**: Keep similar structure but make it an admin-editable policy, not a raw table

#### D. Salary indexation
- **Access**: `DProduct("IndexationNumber", "tbl_Cmn_Indexation")` — product of all values
- **Web**: Explicit formula: `current_salary = base_salary × Π(all_indexations_since_start)`
  - Store indexation events chronologically
  - Calculate on demand, cache result
  - Show history with "effective from" dates

#### E. Multi-value fields
- **Access**: `Attendees = "23;43;44"` (semicolon-separated IDs)
- **Web**: Proper junction tables:
  ```
  meeting_attendees(meeting_id, employee_id, role)
  decision_makers(decision_id, employee_id)
  ```

#### F. Employee structure (split the blob)
**Access**: 32 columns in one table
**Web**: Logically grouped but still one table with sections in UI

Actually, for this size (~50 employees), keeping one `employees` table is fine. 
The complexity isn't in the data storage — it's in the *access patterns* and *computed fields*.
We just need clean column names and proper types.

### 2.4 Business Logic as Services (replacing VBA)

```
services/
├── SeniorityService
│   ├── calculateCurrentSeniority(employee) → { years, months, days }
│   ├── getEffectiveSeniorityDate(employee) → Date
│   └── getSalaryScalePosition(employee, sector) → { years, capped }
│
├── SalaryService
│   ├── getBaseSalary(sector, seniorityYears) → amount
│   ├── getIndexedSalary(sector, seniorityYears) → amount
│   ├── getEmployeeSalary(employee) → { base, indexed, personalIncreases, total }
│   ├── detectUpcomingSalaryChange(employee) → Alert | null
│   └── simulateIndexation(sector, newIndex) → ProjectedSalary[]
│
├── RTTService
│   ├── calculateRTTEntitlement(employee, year) → { hours, prorated }
│   ├── isEligible(employee) → boolean
│   └── getProration(employee, year) → { firstPortion, secondPortion }
│
├── AbsenceService
│   ├── getBalance(employee, absenceCode, year) → { entitled, taken, remaining }
│   ├── bookAbsence(request) → Result
│   ├── validateBooking(request) → ValidationResult
│   ├── getBusinessDays(startDate, endDate, holidays) → number
│   └── cancelAbsence(absenceId) → Result
│
├── VacationEntitlementService
│   ├── getWeeksEntitled(employee, year) → number
│   ├── getHoursEntitled(employee, absenceCode, year) → number
│   └── applyBoughtVacation(employee, year) → adjustment
│
├── TimesheetService
│   ├── getWeeklyHours(employee) → { total, perDay, fullTimePercent }
│   ├── getFullTimeDifference(employee) → hours
│   └── getActiveTimesheet(employee) → Timesheet
│
├── CalendarService
│   ├── getMonthView(employee, year, month) → DayCell[]
│   ├── getYearView(employee, year) → MonthSummary[]
│   ├── getTeamView(sector, date) → TeamAbsence[]
│   └── getPublicHolidays(year) → Holiday[]
│
├── NotificationService
│   ├── getSalaryAlerts() → Alert[]
│   ├── getRTTAlerts() → Alert[]
│   ├── getPendingApprovals(manager) → Request[]
│   └── getBirthdayAlerts() → Alert[]
│
└── ReportService
    ├── generateAbsenceReport(employee, year) → PDF
    ├── generateAbsenteeismPolicyReport(employee, months) → PDF
    ├── generateQuarterlyAbsenceReport(employee, year) → PDF
    └── generateSalaryProjection(sector) → PDF
```

### 2.5 UX Redesign Highlights

#### A. The Calendar (Core Feature)
**Access**: 12 subforms × 37 textboxes = 444 fixed textboxes filled by VBA loops
**Web**: 
- Use `react-big-calendar` or `FullCalendar`
- Click a day → side panel opens (not a popup)
- Drag to select date range → absence booking wizard starts
- Color coding via CSS classes (absence code → color mapping from DB)
- Team overlay view: see multiple employees at once
- Responsive: works on tablet for quick check

#### B. Employee Profile
**Access**: One massive form with 125 controls and 8 subforms
**Web**:
- Clean profile header (name, photo, sector, status badge)
- Tabbed content: Overview | Contract | Leave & RTT | Salary | Assets | History
- Each tab loads on demand (not all at once)
- Direct actions: "Book absence", "Assign vehicle", "Update contract"

#### C. Absence Booking
**Access**: Click grid cell → popup → fill fields → save
**Web**:
- Guided workflow: Select employee → Pick dates (calendar picker) → Choose type → Add reason → Review → Submit
- Real-time balance display as you pick type
- Conflict detection: "This employee already has X on these dates"
- Batch mode: "Book the same absence for multiple days" (drag to select)
- Approval workflow if required

#### D. Salary & Indexation
**Access**: Hidden in a god-query (`Contacts Extended`) with DProduct
**Web**:
- Transparent salary card per employee: base + indexation + personal = total
- "What-if" simulator: "If we apply 2% index, show projected salaries"
- Alerts page: "These 5 employees will get a seniority increase next month"
- History timeline: salary evolution over years

#### E. Dashboard
**Access**: Doesn't exist (opens to a navigation form)
**Web**:
- **HR Manager view**: 
  - Who's absent today (with color indicators)
  - Pending approval requests (action required)
  - Upcoming salary alerts
  - Leave balance warnings (employees running low)
- **Employee view**:
  - My leave balance (visual progress bars)
  - My next planned absence
  - Quick action: "Request absence"

### 2.6 What to DROP from the Access prototype

| Drop | Reason |
|------|--------|
| `Contacts` table | Empty Access template leftover |
| `Paste Errors` table | Import debug artifact |
| `tbl_Holidays1` | Duplicate with US holidays (prototype uses Belgian holidays) |
| `tbl_tst_*` (4 tables) | Test documentation, not production data (move to project docs) |
| `Settings` table | App config goes in env/config, not DB |
| HTML color tags in data (`AbsenceColorTag`) | Presentation in DB = anti-pattern. Store hex color, render in CSS |
| Rich text fields for simple data | Use plain text + markdown where needed |
| The "grid of 37 textboxes" pattern | Replace with proper calendar component |
| `DProduct`/`DLookup`/`DSum` in queries | Replace with proper JOINs and service layer |
| Form references in queries | Replace with parameterized API endpoints |
| Semicolon-delimited ID lists | Replace with junction tables |
| The `Nz()` pattern everywhere | Handle nulls properly in app layer (TypeScript's strict null checks) |

### 2.7 What to KEEP (proven business rules)

| Keep | Rationale |
|------|-----------|
| RTT calculation logic (age-based, prorated by birthday) | Core Belgian healthcare rule |
| Salary = base × product(indexations) | Correct formula, just needs clean implementation |
| Vacation weeks by years of service | Valid policy, make it configurable |
| Absenteeism policy (6-month rolling window) | Active business rule |
| Absence codes with time types (hours vs days) | Fundamental domain concept |
| Seniority with granted seniority date | Belgian labor law concept |
| Business day calculation (skip weekends + public holidays) | Needed for absence duration |
| Bought vacation concept | Part of the Belgian vacation system |

---

## Part 3: Revised Tech Decisions

### 3.1 Why NOT just port Access queries to PostgreSQL?

The `Contacts Extended` query alone has:
- 40+ calculated fields
- 15+ `DLookup`/`DSum`/`DProduct` calls (each = a subquery)
- References to form controls
- Nested `IIf` logic 6 levels deep

This would be a **N+1 nightmare** in PostgreSQL. Instead:
- **Base data**: Clean normalized tables
- **Computed data**: Application service layer (cached where needed)
- **Read models**: Pre-computed views for dashboards (materialized if needed)

### 3.2 Revised Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO-irrelevant but SSR for speed, server actions, excellent DX |
| **UI** | Shadcn/UI + Tailwind | Accessible, professional, customizable |
| **Calendar** | FullCalendar (React) | Most mature, handles all views, locale support |
| **State** | TanStack Query (React Query) | Server state management, caching, optimistic updates |
| **Backend** | Next.js API Routes + tRPC | End-to-end type safety, no API docs needed |
| **ORM** | Prisma | Type generation, migrations, excellent DX |
| **DB** | PostgreSQL 16 | Robust, excellent for this domain |
| **Auth** | NextAuth.js (Auth.js) | JWT + session, role-based, provider-flexible |
| **Validation** | Zod | Shared frontend/backend validation |
| **i18n** | next-intl | Built for Next.js, FR/NL/EN |
| **PDF** | @react-pdf/renderer or Puppeteer | Report generation |
| **Email** | Resend or Nodemailer | Notifications, report delivery |
| **Deploy** | Docker → VPS (Belgium/EU for GDPR) | Healthcare data stays in EU |

### 3.3 Why Next.js instead of separate React + Express?

For a 50-employee internal tool:
- **One codebase** instead of two
- **tRPC** gives you end-to-end types (change a DB field → see compile errors in UI)
- **Server components** for fast initial loads
- **Server actions** for mutations (no manual API calls for simple CRUD)
- **Simpler deployment** (one container)
- **Still separable** if you later need a mobile app (extract the tRPC router as a standalone API)

---

## Part 4: Implementation Priority

### Phase 1: Foundation + Core CRUD (Weeks 1-3)
- Auth (login, roles, session)
- Organisation CRUD (entity, locations, sectors, RTT groups)
- Employee CRUD (full profile with tabs)
- Absence codes management
- Holiday management

### Phase 2: Absence Management (Weeks 4-6)
- Calendar view (FullCalendar integration)
- Absence booking workflow
- Leave balance calculation engine
- Business day calculation (weekends + holidays exclusion)
- Vacation entitlement engine (configurable rules)

### Phase 3: Time & Salary (Weeks 7-9)
- Timesheet templates
- Working time percentage calculation
- Seniority calculation engine
- Salary scale management
- Indexation engine (multiplicative product)
- Salary alerts

### Phase 4: RTT & Advanced (Weeks 10-11)
- RTT calculation engine (age-based, prorated)
- RTT alerts and entitlement view
- Bought vacation management

### Phase 5: Governance & Reports (Weeks 12-13)
- Meetings, decisions, requests (with workflow)
- PDF report generation
- Email notifications
- Dashboard with KPIs

### Phase 6: Polish & Deploy (Weeks 14-15)
- i18n (FR primary, NL, EN)
- Responsive design pass
- GDPR compliance (data retention, export, erasure)
- Performance optimization
- User acceptance testing
- Production deployment

---

## Summary: Access → Web Mindset Shift

| Access Mindset | Web-Native Mindset |
|---------------|-------------------|
| One form per table | Task-oriented pages |
| Subforms for detail | Tabs, side panels, drill-down |
| Popup for input | Inline editing, wizards, slide-overs |
| VBA for logic | Service layer with unit tests |
| DLookup in queries | Proper JOINs or application-level computation |
| Form references in SQL | Parameterized API endpoints |
| Print preview | PDF generation + email delivery |
| Combo box for selection | Searchable typeahead, smart filters |
| 37 textboxes = calendar | FullCalendar with events |
| Refresh button | Real-time reactive updates |
| Single user | Multi-user with roles & permissions |
| Local file | Cloud-deployed, accessible anywhere |
| No audit trail | Every change tracked |
| Hardcoded rules | Admin-configurable policies |
