# WorkDays - Implementation Phases

## Overview

The implementation follows a phased approach, building from foundation to advanced features. Each phase delivers a working increment.

---

## Phase 1: Foundation + Core CRUD (Weeks 1-3)

**Status: Partially complete**

### Scope
- [x] Next.js 14 project setup with Tailwind CSS
- [x] Supabase integration (client + server)
- [x] Navigation layout (sidebar, header)
- [x] Dashboard page (placeholder KPIs)
- [x] Employee list page with data from Supabase
- [x] Employee detail page with tabs (`/employees/[id]`)
- [x] Add employee form (`/employees/new`)
- [x] Delete employee
- [ ] Employee edit form (`/employees/[id]/edit`)
- [ ] Auth (login, roles, session) via Supabase Auth
- [ ] Organisation CRUD (entity, locations, sectors, RTT groups)
- [ ] Absence codes management (admin)
- [ ] Holiday management (admin)

### Deliverable
Core CRUD for employees with authentication and role-based navigation.

---

## Phase 2: Absence Management (Weeks 4-6)

### Scope
- [ ] Calendar view (FullCalendar integration)
- [ ] Absence booking wizard (multi-step workflow)
- [ ] Leave balance calculation engine
- [ ] Business day calculation (skip weekends + public holidays)
- [ ] Vacation entitlement engine (configurable policy table)
- [ ] Conflict detection (double-booking prevention)
- [ ] Absence list with filters (year, type, employee)
- [x] Basic absence list page (read-only, already deployed)

### Deliverable
Full absence management with interactive calendar and balance tracking.

---

## Phase 3: Time & Salary (Weeks 7-9)

### Scope
- [ ] Timesheet templates (weekly hour patterns per employee)
- [ ] Working time percentage calculation
- [ ] Seniority calculation engine
- [ ] Salary scale management (admin-editable)
- [ ] Indexation engine (multiplicative product formula)
- [ ] Salary display per employee (breakdown card)
- [ ] Salary alerts (upcoming seniority increases, pending indexation)
- [ ] "What-if" indexation simulator

### Deliverable
Complete compensation module with transparent salary calculations.

---

## Phase 4: RTT & Advanced Features (Weeks 10-11)

### Scope
- [ ] RTT calculation engine (age-based, birthday-prorated)
- [ ] RTT alerts and entitlement view
- [ ] Bought vacation management
- [ ] Absenteeism policy report (6-month rolling window)
- [ ] Enhanced dashboard KPIs (role-aware)

### Deliverable
Full RTT management and policy compliance reporting.

---

## Phase 5: Governance & Reports (Weeks 12-13)

### Scope
- [ ] Meetings CRUD (agenda, attendees via junction table)
- [ ] Decisions CRUD (linked to meetings, searchable)
- [ ] Requests workflow (submitted -> reviewed -> decided)
- [ ] Change log / audit trail
- [ ] PDF report generation (absence reports, salary projections)
- [ ] Email notifications for approvals/alerts
- [ ] Export center (PDF, Excel, CSV)

### Deliverable
Governance module and comprehensive reporting capabilities.

---

## Phase 6: Assets & Polish (Weeks 14-15)

### Scope
- [ ] Leasing/fleet management (vehicles, phones, printers)
- [ ] Asset assignment tracking
- [ ] i18n support (FR primary, NL and EN secondary)
- [ ] Responsive design pass (mobile-first)
- [ ] GDPR compliance (data retention, export, erasure)
- [ ] Performance optimization
- [ ] User acceptance testing
- [ ] Production deployment hardening

### Deliverable
Complete application ready for production use.

---

## Priority Rationale

1. **Phase 1 first** - Cannot do anything without employees and auth
2. **Phase 2 second** - Absence management is the most-used daily feature
3. **Phase 3 third** - Salary is critical but less frequently accessed
4. **Phase 4 fourth** - RTT depends on salary/time infrastructure
5. **Phase 5 fifth** - Governance is important but independent of HR core
6. **Phase 6 last** - Polish and assets are additive, not blocking

## Duration Estimate

Total: approximately 15 weeks for full implementation.
Each phase is independently deployable and delivers user value.
