# WorkDays - Business Rules

## Regulatory Context

- Comite paritaire: **330.01.54** (secteur soins de sante, Belgique)
- All rules derive from Belgian labor law and the organization's internal policies

---

## 1. RTT (Reduction du Temps de Travail)

### Entitlement

- RTT is based on **age** (not seniority)
- Each RTT group defines age thresholds and corresponding hours per year per sector
- Table `rtt_groups` stores configuration: `(age_threshold, hours_per_year, sector)`

### Proration by Birthday

- RTT entitlement is **prorated by date of birthday** within the calendar year
- If an employee turns the threshold age mid-year:
  - First portion (Jan 1 to birthday): previous entitlement rate
  - Second portion (birthday to Dec 31): new entitlement rate
- Adjusted by `% temps de travail` (working time percentage)

### Eligibility

- Employee must be active (`is_active = true`)
- Must belong to a sector linked to an RTT group

---

## 2. Salary Calculation

### Formula

```
current_salary = base_salary(sector, seniority_years)
                 x PRODUCT(all organization-level indexations)
                 x PRODUCT(all sector-level indexations)
                 + SUM(personal salary increases)
```

### Components

| Component | Source | Description |
|-----------|--------|-------------|
| Base salary | `seniority_scales` table | Looked up by sector + years of seniority |
| Organization indexations | `indexations` table (scope: org) | Multiplicative, applied chronologically |
| Sector indexations | `indexations` table (scope: sector) | Multiplicative, sector-specific |
| Personal increases | `personal_increases` table | Additive amounts granted individually |

### Indexation Events

- Stored chronologically with `effective_from` date
- Calculation: multiply all indexation values since employee start date
- Display history with effective dates for transparency

### Seniority Scale Position

- Look up salary scale by: `sector_id` + `capped_seniority_years`
- Seniority years capped at scale maximum (typically 25-30 years)

---

## 3. Vacation Entitlement

### Weeks by Years of Service

| Min Years | Max Years | Weeks Entitled | Description |
|-----------|-----------|----------------|-------------|
| 0 | 1 | 1 | First year |
| 1 | 7 | 2 | 1-7 years |
| 7 | 14 | 3 | 7-14 years |
| 14 | 24 | 4 | 14-24 years |
| 25 | NULL | 5 | 25+ years |

- Stored in `vacation_policies` table (admin-configurable, not hardcoded)
- Converted to hours based on employee's weekly working hours

### Hours Calculation

```
hours_entitled = weeks_entitled x weekly_hours
```

### Bought Vacation

- Employees can "buy" additional vacation (Belgian system: conge sans solde achete)
- Tracked in `bought_vacation` table per employee per year
- Adds to the total entitlement for balance calculations

---

## 4. Seniority Calculation

### Effective Seniority Date

```
effective_date = granted_seniority_date ?? date_of_hire
```

- `granted_seniority_date`: optional, used when seniority is recognized from previous employment
- If not set, falls back to `date_of_hire`

### Calculation

```
seniority = { years, months, days } from effective_date to today
```

- Used for: salary scale lookup, vacation entitlement, RTT eligibility

---

## 5. Absence Management

### Absence Codes

- 11 codes defined in `absence_codes` table
- Each code has a `time_type`: either `'H/M'` (hours/minutes) or `'Jours'` (days)
- Each code has a display color (hex) for calendar visualization

### Leave Balance

```
balance = entitled - taken + bought_vacation_adjustment
```

- Calculated per employee, per absence code, per year

### Booking Validation Rules

- Cannot book absence on weekends (unless specific code allows it)
- Cannot book absence on public holidays
- Cannot double-book (conflict detection: same employee, overlapping dates)
- Balance must be sufficient (warn if not, block if policy requires)

### Business Day Calculation

- Exclude weekends (Saturday, Sunday)
- Exclude public holidays (from `holidays` table for the relevant year)
- Used for: absence duration in days, return date calculation

---

## 6. Absenteeism Policy

### Rolling Window

- **6-month rolling window** (configurable)
- Counts total absence days (excluding vacation) in the last N months
- Used for HR monitoring and compliance reporting

### Threshold Alerts

- Configurable thresholds for warning and escalation
- Generates alerts for HR managers when employees exceed thresholds

---

## 7. Time & Working Hours

### Storage

- Time stored as **INTEGER (minutes)** - not Access-style date values
- Example: 8 hours = 480 minutes

### Full-Time Percentage

```
full_time_percent = (actual_weekly_hours / reference_weekly_hours) x 100
```

- Reference: typically 38h/week in Belgian healthcare sector

### Timesheet

- Weekly templates per employee (hours per day of week)
- Active timesheet = current working pattern
- Historical timesheets preserved for audit

---

## 8. Public Holidays (Belgium)

- 20 Belgian public holidays configured in `holidays` table
- Scoped by year
- Used in: business day calculation, absence booking validation, calendar display
