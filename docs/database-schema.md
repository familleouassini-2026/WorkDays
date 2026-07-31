# WorkDays - Database Schema Design

## Overview

This document defines the normalized PostgreSQL schema for WorkDays, derived from the Access prototype's 33 tables. The schema enforces proper foreign keys, uses enums where appropriate, and follows PostgreSQL naming conventions (snake_case).

---

## Entity Relationship Diagram (Text)

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│ organisation │──1:N──│    locations       │       │    rtt_groups     │
└──────────────┘       └───────────────────┘       └──────────────────┘
                                                          │ 1:N
                                                          ▼
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│   users      │       │    sectors        │──N:1──│   rtt_groups      │
└──────────────┘       └───────────────────┘       └──────────────────┘
                              │ 1:N
                              ▼
┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│  seniority   │──N:1──│   employees       │──N:1──│   locations       │
│  _scales     │       └───────────────────┘       └──────────────────┘
└──────────────┘              │
                    ┌─────────┼──────────┬───────────────┐
                    │         │          │               │
                    ▼         ▼          ▼               ▼
          ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
          │timesheets│ │ vacation │ │ holiday  │ │  employee    │
          │          │ │ _rights  │ │_selections│ │  _leasing   │
          └──────────┘ └──────────┘ └──────────┘ └──────────────┘
                                         │               │
                                         ▼               ▼
                                   ┌──────────┐   ┌──────────┐
                                   │year_     │   │ leasing  │
                                   │calendar  │   │ _assets  │
                                   └──────────┘   └──────────┘

┌──────────────┐       ┌───────────────────┐       ┌──────────────────┐
│  meetings    │──1:N──│   decisions       │──N:1──│   requests        │
└──────────────┘       └───────────────────┘       └──────────────────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │   changes     │
                                                   └──────────────┘
```

---

## Enums

```sql
-- Contract types used in Belgian healthcare
CREATE TYPE contract_type AS ENUM (
  'CDI',        -- Contrat à Durée Indéterminée
  'CDD',        -- Contrat à Durée Déterminée
  'INTERIM',    -- Temporary/Agency
  'STAGE',      -- Internship
  'BENEVOLE'    -- Volunteer
);

-- Employee title
CREATE TYPE title_type AS ENUM ('M', 'Mme', 'Mlle');

-- Absence time unit
CREATE TYPE time_unit AS ENUM ('H/M', 'Jours');

-- Request/Change status
CREATE TYPE request_status AS ENUM (
  'En Attente',   -- Pending
  'Acceptée',     -- Accepted
  'Refusée',      -- Refused
  'En Cours',     -- In Progress
  'Terminé'       -- Completed
);

-- Meeting type
CREATE TYPE meeting_type AS ENUM ('CA', 'AG', 'AdHoc', 'CE');

-- User role
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'HR_MANAGER',
  'LEASING_MANAGER',
  'SECTOR_MANAGER',
  'EMPLOYEE'
);

-- Leasing asset types
CREATE TYPE leasing_type AS ENUM ('Voitures', 'Mobiles', 'Imprimantes');
```

---

## Tables

### Module: Authentication & Users

```sql
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'EMPLOYEE',
  employee_id     INTEGER REFERENCES employees(id),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Module: Organisation

```sql
CREATE TABLE organisations (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  representative_id   INTEGER,  -- FK to employees, added after employees table
  vat_number          VARCHAR(50),
  registration        VARCHAR(50),
  comite_paritaire    VARCHAR(50),      -- e.g., "330.01.54"
  address             VARCHAR(255),
  post_code           VARCHAR(10),
  city                VARCHAR(100),
  country             VARCHAR(100) DEFAULT 'Belgique',
  commune             VARCHAR(100),
  logo_url            VARCHAR(500),
  telephone           VARCHAR(25),
  fax                 VARCHAR(25),
  full_time_hours     INTEGER DEFAULT 38,  -- Weekly full-time hours
  full_time_minutes   INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  address           VARCHAR(255),
  post_code         VARCHAR(10),
  commune           VARCHAR(100),
  country           VARCHAR(100) DEFAULT 'Belgique',
  responsible_id    INTEGER,  -- FK to employees
  organisation_id   INTEGER NOT NULL REFERENCES organisations(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rtt_groups (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL UNIQUE  -- e.g., "MKI", "Admin"
);

CREATE TABLE sectors (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  code_bareme     VARCHAR(50),            -- Salary scale code
  manager_id      INTEGER,                -- FK to employees
  mission         TEXT,
  rtt_group_id    INTEGER REFERENCES rtt_groups(id),
  has_rtt         BOOLEAN NOT NULL DEFAULT true,  -- Inverse of NoRTT
  is_ific         BOOLEAN NOT NULL DEFAULT false, -- IFIC salary system
  ific_category   INTEGER,                -- IFIC category number
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Module: Employees

```sql
CREATE TABLE employees (
  id                      SERIAL PRIMARY KEY,
  title                   title_type,
  first_name              VARCHAR(100) NOT NULL,
  last_name               VARCHAR(100) NOT NULL,
  job_title               VARCHAR(100),
  contract_type           contract_type,
  date_of_hire            DATE,
  end_date                DATE,
  date_of_birth           DATE,
  is_inactive             BOOLEAN NOT NULL DEFAULT false,
  
  -- Banking
  iban                    VARCHAR(34),
  bic                     VARCHAR(11),
  
  -- Identity
  nationality             VARCHAR(100),
  inami_number            VARCHAR(50),       -- Belgian healthcare provider number
  national_registration   VARCHAR(50),       -- Numéro de registre national
  
  -- Work assignment
  sector_id               INTEGER REFERENCES sectors(id),
  location_id             INTEGER REFERENCES locations(id),
  
  -- Contact
  email                   VARCHAR(255),
  business_phone          VARCHAR(25),
  home_phone              VARCHAR(25),
  mobile_phone            VARCHAR(25),
  fax_number              VARCHAR(25),
  
  -- Address
  address                 VARCHAR(255),
  city                    VARCHAR(100),
  province                VARCHAR(100),
  postal_code             VARCHAR(15),
  country                 VARCHAR(100),
  
  -- Seniority
  granted_seniority       DECIMAL(5,2),      -- Years of granted seniority
  granted_seniority_date  DATE,
  distance_to_home        INTEGER,           -- km for transport allowance
  
  -- Notes
  notes                   TEXT,
  
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add deferred FK for organisation representative
ALTER TABLE organisations 
  ADD CONSTRAINT fk_org_representative 
  FOREIGN KEY (representative_id) REFERENCES employees(id);

ALTER TABLE locations 
  ADD CONSTRAINT fk_location_responsible 
  FOREIGN KEY (responsible_id) REFERENCES employees(id);

ALTER TABLE sectors 
  ADD CONSTRAINT fk_sector_manager 
  FOREIGN KEY (manager_id) REFERENCES employees(id);

-- Indexation per employee (salary increases)
CREATE TABLE employee_indexations (
  id                SERIAL PRIMARY KEY,
  employee_id       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  indexation_value  DECIMAL(10,4) NOT NULL,
  indexation_date   DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bought vacation tracking (whether employee purchased extra vacation days per year)
CREATE TABLE employee_bought_vacation (
  id            SERIAL PRIMARY KEY,
  employee_id   INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  bought        BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(employee_id, year)
);
```

---

### Module: Absences & Leave

```sql
CREATE TABLE absence_codes (
  id                  SERIAL PRIMARY KEY,
  code                VARCHAR(20) NOT NULL UNIQUE,       -- e.g., "RTT", "JP", "CSS"
  description         VARCHAR(255) NOT NULL,             -- e.g., "Réduction du temps de travail"
  color_hex           VARCHAR(7),                        -- Background color, e.g., "#0072BC"
  text_color_hex      VARCHAR(7),                        -- Text color, e.g., "#FFFFFF"
  time_unit           time_unit NOT NULL DEFAULT 'H/M',  -- Hours/Minutes or Days
  is_time_thematic    BOOLEAN NOT NULL DEFAULT false,
  sort_order          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public holidays
CREATE TABLE holidays (
  id            SERIAL PRIMARY KEY,
  holiday_date  DATE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  year          INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM holiday_date)) STORED,
  UNIQUE(holiday_date)
);

-- Vacation rights (entitlements per employee per absence type per year)
CREATE TABLE vacation_rights (
  id              SERIAL PRIMARY KEY,
  employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  absence_code_id INTEGER NOT NULL REFERENCES absence_codes(id),
  year            INTEGER NOT NULL,
  days            INTEGER DEFAULT 0,
  hours           INTEGER DEFAULT 0,
  minutes         INTEGER DEFAULT 0,
  UNIQUE(employee_id, absence_code_id, year)
);

-- Holiday selections (absence requests/bookings)
CREATE TABLE holiday_selections (
  id              SERIAL PRIMARY KEY,
  employee_id     INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  absence_code_id INTEGER NOT NULL REFERENCES absence_codes(id),
  start_date      DATE NOT NULL,
  end_date        DATE,
  num_days        INTEGER DEFAULT 0,
  absence_year    INTEGER NOT NULL,
  absence_time    TIME,               -- Hours for partial day absences
  reason          TEXT,
  status          request_status DEFAULT 'En Attente',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Year calendar (individual day records for absence tracking)
CREATE TABLE year_calendar (
  id                    SERIAL PRIMARY KEY,
  year                  INTEGER NOT NULL,
  absence_date          DATE NOT NULL,
  employee_id           INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  absence_code_id       INTEGER NOT NULL REFERENCES absence_codes(id),
  absence_time          TIME,            -- Duration for hour-based absences
  absence_days          INTEGER,         -- For day-based absences
  reason                TEXT,
  holiday_selection_id  INTEGER REFERENCES holiday_selections(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(absence_date, employee_id, absence_code_id, year)
);

CREATE INDEX idx_year_calendar_employee ON year_calendar(employee_id);
CREATE INDEX idx_year_calendar_date ON year_calendar(absence_date);
CREATE INDEX idx_year_calendar_year ON year_calendar(year);
```

---

### Module: Timesheets

```sql
CREATE TABLE timesheets (
  id                  SERIAL PRIMARY KEY,
  employee_id         INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  start_date          DATE,
  end_date            DATE,
  monday              TIME,       -- Hours worked on Monday
  tuesday             TIME,       -- Hours worked on Tuesday
  wednesday           TIME,       -- Hours worked on Wednesday
  thursday            TIME,       -- Hours worked on Thursday
  friday              TIME,       -- Hours worked on Friday
  saturday            TIME,       -- Hours worked on Saturday
  sunday              TIME,       -- Hours worked on Sunday
  full_time_hours     INTEGER DEFAULT 38,
  full_time_minutes   INTEGER DEFAULT 0,
  comment             VARCHAR(255),
  category_id         INTEGER REFERENCES absence_codes(id),  -- Timesheet category
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
```

---

### Module: Salary & Seniority

```sql
-- Salary scales by sector and years of seniority
CREATE TABLE seniority_scales (
  id            SERIAL PRIMARY KEY,
  sector_id     INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  years         INTEGER NOT NULL,         -- Years of seniority
  base_salary   DECIMAL(10,2) NOT NULL,   -- Monthly base salary
  UNIQUE(sector_id, years)
);

-- RTT hours entitlement (based on seniority start and sector)
CREATE TABLE rtt_entitlements (
  id              SERIAL PRIMARY KEY,
  sector_id       INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  seniority_start INTEGER NOT NULL,       -- Starting seniority threshold
  hours_per_year  INTEGER NOT NULL,       -- RTT hours granted per year
  UNIQUE(sector_id, seniority_start)
);

-- Organisation-level indexation history
CREATE TABLE organisation_indexations (
  id                SERIAL PRIMARY KEY,
  organisation_id   INTEGER NOT NULL REFERENCES organisations(id),
  indexation_value  DECIMAL(10,6) NOT NULL,
  indexation_date   DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sector-level indexation
CREATE TABLE sector_indexations (
  id                SERIAL PRIMARY KEY,
  sector_id         INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  indexation_value  DECIMAL(10,6) NOT NULL,
  indexation_date   DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- General index table (pivot-style index values, for Belgian salary indexation)
CREATE TABLE salary_index (
  id          SERIAL PRIMARY KEY,
  index_num   INTEGER NOT NULL,       -- Index position (1-20)
  value       DECIMAL(10,5),
  apply_date  DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Module: Leasing

```sql
CREATE TABLE leasing_assets (
  id            SERIAL PRIMARY KEY,
  type          leasing_type NOT NULL,
  plate_number  VARCHAR(20) UNIQUE,     -- For vehicles: license plate
  model         VARCHAR(255),
  color         VARCHAR(100),
  start_date    DATE,
  end_date      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employee_leasing (
  id            SERIAL PRIMARY KEY,
  employee_id   INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leasing_id    INTEGER NOT NULL REFERENCES leasing_assets(id) ON DELETE CASCADE,
  start_date    DATE,
  end_date      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employee_leasing_emp ON employee_leasing(employee_id);
```

---

### Module: Governance

```sql
CREATE TABLE meetings (
  id            SERIAL PRIMARY KEY,
  meeting_date  DATE NOT NULL,
  description   VARCHAR(255),
  agenda        TEXT,                  -- Rich text / HTML
  meeting_type  meeting_type NOT NULL,
  attendees     INTEGER[],            -- Array of employee IDs
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE requests (
  id              SERIAL PRIMARY KEY,
  requestor_id    INTEGER NOT NULL REFERENCES employees(id),
  description     VARCHAR(255) NOT NULL,
  request_date    DATE NOT NULL,
  deadline        DATE,
  status          request_status DEFAULT 'En Attente',
  comment         TEXT,
  attachment_url  VARCHAR(500),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE decisions (
  id              SERIAL PRIMARY KEY,
  description     VARCHAR(255) NOT NULL,
  decision_date   DATE,
  decision_takers INTEGER[],          -- Array of employee IDs who made the decision
  meeting_id      INTEGER REFERENCES meetings(id) ON DELETE SET NULL,
  request_id      INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE changes (
  id              SERIAL PRIMARY KEY,
  description     VARCHAR(255) NOT NULL,
  deadline        DATE,
  request_id      INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  decision_id     INTEGER REFERENCES decisions(id) ON DELETE SET NULL,
  status          request_status DEFAULT 'En Cours',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Module: Audit

```sql
CREATE TABLE audit_log (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  action        VARCHAR(50) NOT NULL,     -- CREATE, UPDATE, DELETE
  entity_type   VARCHAR(100) NOT NULL,    -- Table/model name
  entity_id     INTEGER,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);
```

---

## Migration from Access

### Table Mapping (Access → PostgreSQL)

| Access Table | PostgreSQL Table | Notes |
|-------------|-----------------|-------|
| `tbl_Cmn_Organisation` | `organisations` | Cleaned column names |
| `tbl_cmn_Locations` | `locations` | Added proper FK |
| `tbl_RTT_Groups` | `rtt_groups` | Simplified |
| `tbl_Sec_Secteurs` | `sectors` | Normalized boolean flags |
| `tbl_Emp_Employees` | `employees` | Major cleanup, proper types |
| `tbl_Emp_Indexation` | `employee_indexations` | Proper FK |
| `tbluBoughtVacation` | `employee_bought_vacation` | Proper FK + unique constraint |
| `tbl_Abs_AbsenceCodes` | `absence_codes` | Colors stored as hex |
| `tbl_Abs_Holidays` | `holidays` | Added generated year column |
| `tbl_VacationRight` | `vacation_rights` | Proper FKs + unique constraint |
| `tbl_Abs_HolidaySelection` | `holiday_selections` | Added status field |
| `tbl_YearCalendar` | `year_calendar` | Proper FKs + composite unique |
| `tbl_TimeSheet` | `timesheets` | Simplified structure |
| `tbl_Seniority` | `seniority_scales` | Renamed, proper FK |
| `tbl_RTT` | `rtt_entitlements` | Renamed for clarity |
| `tbl_Index` | `salary_index` | Normalized from pivot to rows |
| `tbl_Cmn_Indexation` | `organisation_indexations` | Split by scope |
| `tbl_Sec_Indexation` | `sector_indexations` | Split by scope |
| `tbl_Cmn_Leasing` + `tbl_Cmn_LeasingTypes` | `leasing_assets` | Merged, enum for type |
| `tbl_Emp_Employee_Leasing` | `employee_leasing` | Proper FKs |
| `tbl_Log_Meeting` | `meetings` | PostgreSQL array for attendees |
| `tbl_Log_Requests` | `requests` | Proper enum status |
| `tbl_Log_Decision` | `decisions` | Linked to meetings + requests |
| `tbl_Log_Change` | `changes` | Linked to requests + decisions |
| `Contacts` | *Removed* | Merged into employees |
| `Settings` | *Moved to env/config* | Application config |
| `Paste Errors` | *Removed* | Dev artifact |
| `tbl_Holidays1` | *Removed* | Duplicate of holidays |
| `tbl_tst_*` (4 tables) | *Removed* | Test documentation, not app data |

### Key Improvements Over Access

1. **Proper Foreign Keys** — All relationships enforced at DB level
2. **Enums** — Type-safe values for status, roles, contract types
3. **Timestamps** — `created_at`/`updated_at` on all mutable tables
4. **Audit Trail** — Dedicated audit log with JSONB diff tracking
5. **Indexes** — Strategic indexes for common query patterns
6. **Normalization** — Eliminated pivot-style `tbl_Index` table, split indexation by scope
7. **Unique Constraints** — Prevent duplicate data (vacation rights, seniority scales)
8. **Generated Columns** — Auto-computed year from holiday date
9. **Cascading Deletes** — Proper cleanup when parent records are removed
10. **Security** — Separate users table with hashed passwords and roles
