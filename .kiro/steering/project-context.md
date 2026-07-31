# WorkDays - Project Context

## What is WorkDays?

WorkDays is a web-based HR management application for the **Maison Medicale de Forest ASBL** (Belgium). It manages employees, absences/leave, timesheets, salary scales, organization structure, leasing assets, and governance (meetings/decisions/requests).

## Origin

The application is being rebuilt from an MS Access prototype (`WorkDays_v0.001 - 20241101.accdb`) into a modern web application. The Access prototype served as requirements discovery - we extract the intent and business rules, then redesign from scratch using modern patterns.

## Organization Context

- Belgian healthcare organization (comite paritaire 330.01.54, secteur soins de sante)
- ~33 active employees across 20 sectors
- 11 absence codes with specific time types
- UI language: French (Belgian HR context)
- Regulatory: Belgian labor law applies (RTT, seniority, vacation entitlement)

## Current State (Deployed Modules)

- **Dashboard**: KPI placeholders
- **Personnel**: list, add (`/employees/new`), detail with tabs (`/employees/[id]`), delete
- **Absences**: list filtered by year/type/name, grouped by month, color-coded
- **Horaires**: active timesheets table with hours/day and % full-time
- **Placeholder pages**: Remuneration, Actifs, Gouvernance, Rapports, Parametres

## Supabase Instance

- URL: `https://jqfaclixnraugzmcrylp.supabase.co`
- 26 tables deployed, RLS temporarily disabled
- Real data: 33 employees, 20 sectors, 11 absence codes, schedules, salary scales

## Modules to Develop (by priority)

1. Employee edit (`/employees/[id]/edit`)
2. Absences: interactive calendar, booking wizard, leave balances
3. Remuneration: indexed salary display and calculation
4. RTT: age-based calculation with prorated entitlement
5. Supabase Auth (login, roles)
6. Governance: meetings/decisions/requests CRUD
7. PDF reports
8. Dynamic dashboard with KPIs
