# WorkDays - Feature Specifications

## Design Principles

1. **Task-oriented, not table-oriented** - Users think "I want to book absence for Marie next Thursday", not "I need to edit tbl_YearCalendar"
2. **Progressive disclosure** - Show what is needed now, reveal complexity on demand
3. **URL-addressable state** - Every view has a shareable URL (`/employees/28/absences?year=2024`)
4. **Real-time feedback** - No "refresh" buttons; data updates reactively
5. **Mobile-first** - HR managers check things on the go
6. **Role-based views** - Admin sees everything; employee sees their own data
7. **Configurable business rules** - Admin-editable policies, not hardcoded logic

---

## Information Architecture

```
WorkDays Web App
|
+-- Dashboard (role-aware)
|   +-- Employee: My leave balance, my calendar, pending requests
|   +-- Manager: Team absences today, pending approvals, alerts
|   +-- HR/Admin: Organization KPIs, salary alerts, compliance
|
+-- People
|   +-- Employee Directory (search, filter by sector/status)
|   +-- Employee Profile (tabbed: Personal, Contract, Salary, Leave, Assets)
|   +-- Org Chart / Sector Overview
|
+-- Absences & Leave
|   +-- Calendar View (team/individual, month/week/year)
|   +-- Book Absence (wizard: who -> when -> what type -> confirm)
|   +-- Leave Balances (by employee, by type, by year)
|   +-- Approval Queue (for managers)
|   +-- Holiday Management (public holidays config)
|
+-- Time & Schedule
|   +-- Timesheet Templates (weekly patterns per employee)
|   +-- Working Time Overview (% full-time, totals)
|   +-- RTT Entitlements (auto-calculated, configurable rules)
|
+-- Compensation
|   +-- Salary Scales (by sector x seniority)
|   +-- Indexation History (with simulation: "what if index = +2%?")
|   +-- Salary Alerts (upcoming increases, seniority changes)
|   +-- Current Salary Overview (per employee)
|
+-- Assets
|   +-- Fleet Management (vehicles, phones, printers)
|   +-- Asset Assignments (who has what, since when)
|
+-- Governance
|   +-- Meetings (with agenda, attendees, linked decisions)
|   +-- Decisions (searchable, linked to meetings/requests)
|   +-- Requests (workflow: submitted -> reviewed -> decided)
|   +-- Change Log (audit trail)
|
+-- Reports & Analytics
|   +-- Absence Reports (by employee, by type, by period)
|   +-- Absenteeism Policy Report (configurable window)
|   +-- Salary Projection Report
|   +-- Export Center (PDF, Excel, CSV)
|
+-- Settings (Admin only)
    +-- Organization Profile
    +-- Sectors & RTT Groups
    +-- Absence Codes & Policies
    +-- Vacation Entitlement Rules
    +-- Users & Roles
    +-- Notifications Configuration
```

---

## Feature: Calendar (Core)

### Replaces

Access: 12 subforms x 37 textboxes = 444 fixed textboxes filled by VBA loops

### Web Implementation

- Use FullCalendar (React) with day/week/month views
- Click a day: side panel opens (not a popup)
- Drag to select date range: absence booking wizard starts
- Color coding via CSS classes (absence code mapped to color from DB)
- Team overlay view: see multiple employees at once
- Responsive: works on tablet for quick check

### Views

| View | Description |
|------|-------------|
| Month | Standard calendar grid with absence indicators |
| Week | Detailed daily view with time slots |
| Year | Overview with monthly summaries (absence count per month) |
| Team | Multiple employees side-by-side for a given period |

---

## Feature: Employee Profile

### Replaces

Access: One massive form with 125 controls and 8 subforms

### Web Implementation

- Clean profile header: name, photo placeholder, sector, status badge
- Tabbed content: Overview | Contract | Leave & RTT | Salary | Assets | History
- Each tab loads on demand (not all at once)
- Direct actions: "Book absence", "Assign vehicle", "Update contract"

### Tabs

| Tab | Content |
|-----|---------|
| Overview | Key info summary, quick stats, recent activity |
| Contract | Employment details, dates, contract type, working hours |
| Leave & RTT | Balances, entitlements, absence history |
| Salary | Current salary breakdown, indexation history, scale position |
| Assets | Assigned vehicles, phones, printers |
| History | Audit log of all changes to this employee |

---

## Feature: Absence Booking

### Replaces

Access: Click grid cell, popup, fill fields, save (655-line form event handler)

### Web Implementation - Guided Workflow

1. **Select employee** (or self if employee role)
2. **Pick dates** (calendar picker with drag-to-select)
3. **Choose absence type** (dropdown filtered by available codes)
4. **Real-time balance display** as type is selected
5. **Add reason/notes** (optional)
6. **Conflict detection**: "This employee already has X on these dates"
7. **Review summary** - show duration in business days
8. **Submit** (with approval workflow if configured)

### Batch Mode

- "Book the same absence for multiple days" via drag selection
- "Book for multiple employees" (HR manager only)

---

## Feature: Salary & Indexation

### Replaces

Access: Hidden in a god-query (`Contacts Extended`) with DProduct

### Web Implementation

- Transparent salary card per employee: base + indexation + personal = total
- "What-if" simulator: "If we apply 2% index, show projected salaries"
- Alerts page: "These 5 employees will get a seniority increase next month"
- History timeline: salary evolution over years

### Displays

| Element | Description |
|---------|-------------|
| Salary card | Breakdown: base, indexed total, personal additions, final |
| Scale table | Full scale for the employee's sector with current position highlighted |
| Indexation history | Timeline of all applied indexations with dates and amounts |
| Simulation | Input a hypothetical index, see impact on all employees |

---

## Feature: Dashboard

### Replaces

Access: Does not exist (opens to a navigation form)

### Web Implementation by Role

**HR Manager view:**
- Who is absent today (with color indicators)
- Pending approval requests (action required)
- Upcoming salary alerts (seniority changes, indexation due)
- Leave balance warnings (employees running low)

**Employee view:**
- My leave balance (visual progress bars)
- My next planned absence
- Quick action: "Request absence"

**Admin view:**
- Organization KPIs (headcount, FTE, turnover)
- System health indicators
- Compliance status

---

## Feature: Services Architecture

### Business Logic Services (replacing VBA)

```
services/
+-- SeniorityService
|   +-- calculateCurrentSeniority(employee) -> { years, months, days }
|   +-- getEffectiveSeniorityDate(employee) -> Date
|   +-- getSalaryScalePosition(employee, sector) -> { years, capped }
|
+-- SalaryService
|   +-- getBaseSalary(sector, seniorityYears) -> amount
|   +-- getIndexedSalary(sector, seniorityYears) -> amount
|   +-- getEmployeeSalary(employee) -> { base, indexed, personalIncreases, total }
|   +-- simulateIndexation(sector, newIndex) -> ProjectedSalary[]
|
+-- RTTService
|   +-- calculateRTTEntitlement(employee, year) -> { hours, prorated }
|   +-- isEligible(employee) -> boolean
|   +-- getProration(employee, year) -> { firstPortion, secondPortion }
|
+-- AbsenceService
|   +-- getBalance(employee, absenceCode, year) -> { entitled, taken, remaining }
|   +-- bookAbsence(request) -> Result
|   +-- validateBooking(request) -> ValidationResult
|   +-- getBusinessDays(startDate, endDate, holidays) -> number
|
+-- VacationEntitlementService
|   +-- getWeeksEntitled(employee, year) -> number
|   +-- getHoursEntitled(employee, absenceCode, year) -> number
|   +-- applyBoughtVacation(employee, year) -> adjustment
|
+-- TimesheetService
|   +-- getWeeklyHours(employee) -> { total, perDay, fullTimePercent }
|   +-- getActiveTimesheet(employee) -> Timesheet
|
+-- CalendarService
|   +-- getMonthView(employee, year, month) -> DayCell[]
|   +-- getYearView(employee, year) -> MonthSummary[]
|   +-- getTeamView(sector, date) -> TeamAbsence[]
|   +-- getPublicHolidays(year) -> Holiday[]
|
+-- ReportService
    +-- generateAbsenceReport(employee, year) -> PDF
    +-- generateAbsenteeismPolicyReport(employee, months) -> PDF
    +-- generateSalaryProjection(sector) -> PDF
```

---

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access, entity/sector/user management |
| **HR Manager** | Employee management, absences, timesheets, salary, reports |
| **Sector Manager** | View/manage own sector employees, approve absences |
| **Employee** | View own data, request absences, view timesheet |

---

## What to Drop from Access

| Item | Reason |
|------|--------|
| `Contacts` table | Empty Access template leftover |
| `Paste Errors` table | Import debug artifact |
| `tbl_Holidays1` | Duplicate with US holidays |
| `tbl_tst_*` tables | Test documentation, not production data |
| `Settings` table | App config goes in env/config |
| HTML color tags in data | Presentation in DB is an anti-pattern |
| Grid of 37 textboxes | Replaced by FullCalendar |
| `DProduct`/`DLookup` in queries | Replaced by service layer |
| Form references in queries | Replaced by parameterized API |
| Semicolon-delimited ID lists | Replaced by junction tables |

## What to Keep from Access (Proven Rules)

| Item | Reason |
|------|--------|
| RTT calculation (age-based, prorated) | Core Belgian healthcare rule |
| Salary = base x product(indexations) | Correct formula |
| Vacation weeks by years of service | Valid policy (made configurable) |
| Absenteeism policy (6-month window) | Active business rule |
| Absence codes with time types | Fundamental domain concept |
| Seniority with granted date | Belgian labor law concept |
| Business day calculation | Needed for absence duration |
| Bought vacation concept | Part of Belgian vacation system |
