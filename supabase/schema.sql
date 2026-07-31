-- ============================================================
-- WorkDays - Schema SQL pour Supabase
-- Gestion RH - Maison Médicale de Forest (Belgique)
-- ============================================================
-- Coller ce SQL dans Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'HR_MANAGER', 'LEASING_MANAGER', 'SECTOR_MANAGER', 'EMPLOYEE');
CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'INTERIM', 'STAGE', 'BENEVOLE');
CREATE TYPE title_type AS ENUM ('M', 'Mme', 'Mlle');
CREATE TYPE time_unit AS ENUM ('HOURS_MINUTES', 'DAYS');
CREATE TYPE absence_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE meeting_type AS ENUM ('CA', 'AG', 'ADHOC', 'CE');
CREATE TYPE leasing_type AS ENUM ('VOITURES', 'MOBILES', 'IMPRIMANTES');

-- ============================================================
-- ORGANISATION
-- ============================================================

CREATE TABLE organisations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  vat_number VARCHAR(50),
  registration VARCHAR(50),
  comite_paritaire VARCHAR(50),
  address VARCHAR(255),
  post_code VARCHAR(10),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Belgique',
  commune VARCHAR(100),
  logo_url VARCHAR(500),
  telephone VARCHAR(25),
  fax VARCHAR(25),
  full_time_hours INTEGER DEFAULT 38,
  full_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rtt_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  post_code VARCHAR(10),
  commune VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Belgique',
  organisation_id INTEGER NOT NULL REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code_bareme VARCHAR(50),
  mission TEXT,
  rtt_group_id INTEGER REFERENCES rtt_groups(id),
  has_rtt BOOLEAN DEFAULT true,
  is_ific BOOLEAN DEFAULT false,
  ific_category INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  title title_type,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(100),
  contract_type contract_type,
  date_of_hire DATE,
  end_date DATE,
  date_of_birth DATE,
  is_inactive BOOLEAN DEFAULT false,
  iban VARCHAR(34),
  bic VARCHAR(11),
  nationality VARCHAR(100),
  inami_number VARCHAR(50),
  national_registration VARCHAR(50),
  sector_id INTEGER REFERENCES sectors(id),
  location_id INTEGER REFERENCES locations(id),
  email VARCHAR(255),
  business_phone VARCHAR(25),
  home_phone VARCHAR(25),
  mobile_phone VARCHAR(25),
  address VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(15),
  country VARCHAR(100),
  granted_seniority DECIMAL(5,2),
  granted_seniority_date DATE,
  distance_to_home INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENTITY RESPONSIBILITIES (remplace les FK circulaires)
-- ============================================================

CREATE TABLE entity_responsibilities (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('sector', 'location', 'organisation')),
  entity_id INTEGER NOT NULL,
  responsibility VARCHAR(50) NOT NULL CHECK (responsibility IN ('manager', 'responsible', 'representative')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, responsibility)
);

CREATE INDEX idx_entity_resp_employee ON entity_responsibilities(employee_id);
CREATE INDEX idx_entity_resp_entity ON entity_responsibilities(entity_type, entity_id);

-- ============================================================
-- USERS (Auth)
-- ============================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE, -- Lié à auth.users de Supabase
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role DEFAULT 'EMPLOYEE',
  employee_id INTEGER UNIQUE REFERENCES employees(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ABSENCES & CONGES
-- ============================================================

CREATE TABLE absence_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  color_hex VARCHAR(7),
  text_color_hex VARCHAR(7),
  time_unit time_unit DEFAULT 'HOURS_MINUTES',
  is_time_thematic BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM holiday_date)::INTEGER) STORED
);

CREATE TABLE vacation_rights (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  absence_code_id INTEGER NOT NULL REFERENCES absence_codes(id),
  year INTEGER NOT NULL,
  days INTEGER DEFAULT 0,
  hours INTEGER DEFAULT 0,
  minutes INTEGER DEFAULT 0,
  UNIQUE(employee_id, absence_code_id, year)
);

CREATE TABLE holiday_selections (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  absence_code_id INTEGER NOT NULL REFERENCES absence_codes(id),
  start_date DATE NOT NULL,
  end_date DATE,
  num_days INTEGER DEFAULT 0,
  absence_year INTEGER NOT NULL,
  absence_minutes INTEGER DEFAULT 0,
  reason TEXT,
  status absence_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE year_calendar (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  absence_date DATE NOT NULL,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  absence_code_id INTEGER NOT NULL REFERENCES absence_codes(id),
  absence_minutes INTEGER,
  absence_days INTEGER,
  reason TEXT,
  holiday_selection_id INTEGER REFERENCES holiday_selections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(absence_date, employee_id, absence_code_id, year)
);

-- ============================================================
-- HORAIRES (TIMESHEETS)
-- ============================================================

CREATE TABLE timesheets (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  monday_minutes INTEGER,
  tuesday_minutes INTEGER,
  wednesday_minutes INTEGER,
  thursday_minutes INTEGER,
  friday_minutes INTEGER,
  saturday_minutes INTEGER,
  sunday_minutes INTEGER,
  full_time_minutes INTEGER DEFAULT 2280,
  comment VARCHAR(255),
  category_id INTEGER REFERENCES absence_codes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SALAIRES & ANCIENNETE
-- ============================================================

CREATE TABLE seniority_scales (
  id SERIAL PRIMARY KEY,
  sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  years INTEGER NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  UNIQUE(sector_id, years)
);

CREATE TABLE rtt_entitlements (
  id SERIAL PRIMARY KEY,
  sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  seniority_start INTEGER NOT NULL,
  hours_per_year INTEGER NOT NULL,
  UNIQUE(sector_id, seniority_start)
);

CREATE TABLE organisation_indexations (
  id SERIAL PRIMARY KEY,
  organisation_id INTEGER NOT NULL REFERENCES organisations(id),
  indexation_value DECIMAL(10,6) NOT NULL,
  indexation_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sector_indexations (
  id SERIAL PRIMARY KEY,
  sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
  indexation_value DECIMAL(10,6) NOT NULL,
  indexation_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_indexations (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  indexation_value DECIMAL(10,4) NOT NULL,
  indexation_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_bought_vacations (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  bought BOOLEAN DEFAULT false,
  UNIQUE(employee_id, year)
);

-- Politique de congés configurable (remplace le IIf en cascade dans Access)
CREATE TABLE vacation_policies (
  id SERIAL PRIMARY KEY,
  min_years INTEGER NOT NULL,
  max_years INTEGER,
  weeks_entitled INTEGER NOT NULL,
  description VARCHAR(255)
);

-- ============================================================
-- LEASING (ACTIFS)
-- ============================================================

CREATE TABLE leasing_assets (
  id SERIAL PRIMARY KEY,
  type leasing_type NOT NULL,
  plate_number VARCHAR(20) UNIQUE,
  model VARCHAR(255),
  color VARCHAR(100),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_leasing (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leasing_id INTEGER NOT NULL REFERENCES leasing_assets(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOUVERNANCE
-- ============================================================

CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  meeting_date DATE NOT NULL,
  description VARCHAR(255),
  agenda TEXT,
  type meeting_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meeting_attendees (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  UNIQUE(meeting_id, employee_id)
);

CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  requestor_id INTEGER NOT NULL REFERENCES employees(id),
  description VARCHAR(255) NOT NULL,
  request_date DATE NOT NULL,
  deadline DATE,
  status request_status DEFAULT 'PENDING',
  comment TEXT,
  attachment_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decisions (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  decision_date DATE,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE SET NULL,
  request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decision_makers (
  id SERIAL PRIMARY KEY,
  decision_id INTEGER NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  UNIQUE(decision_id, employee_id)
);

CREATE TABLE changes (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  deadline DATE,
  request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  decision_id INTEGER REFERENCES decisions(id) ON DELETE SET NULL,
  status request_status DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEX POUR PERFORMANCE
-- ============================================================

CREATE INDEX idx_employees_sector ON employees(sector_id);
CREATE INDEX idx_employees_inactive ON employees(is_inactive);
CREATE INDEX idx_employees_name ON employees(last_name, first_name);
CREATE INDEX idx_year_calendar_employee ON year_calendar(employee_id);
CREATE INDEX idx_year_calendar_date ON year_calendar(absence_date);
CREATE INDEX idx_year_calendar_year ON year_calendar(year);
CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_holiday_selections_employee ON holiday_selections(employee_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Activé par défaut sur Supabase
-- ============================================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_responsibilities ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour commencer (à restreindre plus tard par rôle)
CREATE POLICY "Allow all for authenticated" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON organisations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON sectors FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON locations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON absence_codes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON holidays FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON timesheets FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON year_calendar FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON vacation_rights FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON holiday_selections FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON entity_responsibilities FOR ALL USING (true);

-- Politiques anon (l'app utilise la clé anon sans auth)
CREATE POLICY "Allow anon read" ON employees FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON employees FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON organisations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON organisations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON sectors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON sectors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON locations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON locations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON absence_codes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON absence_codes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON holidays FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON holidays FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON timesheets FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON timesheets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON year_calendar FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON year_calendar FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON vacation_rights FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON vacation_rights FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON holiday_selections FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON holiday_selections FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON entity_responsibilities FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON entity_responsibilities FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- DONNEES INITIALES
-- ============================================================

-- Organisation
INSERT INTO organisations (name, comite_paritaire, address, post_code, city, country, commune, telephone, full_time_hours)
VALUES ('Maison Médicale de Forest ASBL', '330.01.54', 'rue du curé, 9', '1190', 'Bruxelles', 'Belgique', '1190', '02 376 16 82', 38);

-- Groupes RTT
INSERT INTO rtt_groups (name) VALUES ('MKI'), ('Admin');

-- Sites
INSERT INTO locations (name, organisation_id) VALUES 
  ('Saint-Denis', 1),
  ('Saint-Antoine', 1),
  ('Britannique', 1);

-- Secteurs
INSERT INTO sectors (name, rtt_group_id, has_rtt, is_ific) VALUES
  ('ACCUEIL Diplôme Supérieur NON IFIC', 2, true, false),
  ('ADMIN', 2, true, false),
  ('CDD et remplaçante Accueil/admin IFIC CAT 12', 2, true, true),
  ('INF NON IFIC', 1, true, false),
  ('KINE', 1, true, false);

-- Codes d''absence
INSERT INTO absence_codes (code, description, color_hex, text_color_hex, time_unit) VALUES
  ('RTT', 'Réduction du temps de travail', '#0072BC', '#FFFFFF', 'HOURS_MINUTES'),
  ('JP', 'Solde de congés Année N-1', '#B4A6DE', '#000000', 'HOURS_MINUTES'),
  ('CSS', 'Congés sans solde', '#FFA500', '#000000', 'HOURS_MINUTES'),
  ('PC', 'Petits chômages', '#96BACD', '#000000', 'DAYS'),
  ('JF', 'Récup. jour férié', '#0000FF', '#FFFFFF', 'DAYS'),
  ('MA', 'Maladie', '#FF0000', '#FFFFFF', 'HOURS_MINUTES'),
  ('MAT', 'Maternité', '#FF69B4', '#000000', 'DAYS'),
  ('AT', 'Accident de travail', '#8B0000', '#FFFFFF', 'DAYS'),
  ('F', 'Formation', '#228B22', '#FFFFFF', 'HOURS_MINUTES'),
  ('HS', 'Heures supplémentaires', '#FFD700', '#000000', 'HOURS_MINUTES'),
  ('V', 'Vacances annuelles', '#00CED1', '#000000', 'HOURS_MINUTES');

-- Jours fériés belges 2024-2025
INSERT INTO holidays (holiday_date, name) VALUES
  ('2024-01-01', 'Jour de l''An'),
  ('2024-04-01', 'Lundi de Pâques'),
  ('2024-05-01', 'Fête du Travail'),
  ('2024-05-09', 'Ascension'),
  ('2024-05-20', 'Lundi de Pentecôte'),
  ('2024-07-21', 'Fête nationale'),
  ('2024-08-15', 'Assomption'),
  ('2024-11-01', 'Toussaint'),
  ('2024-11-11', 'Armistice'),
  ('2024-12-25', 'Noël'),
  ('2025-01-01', 'Jour de l''An'),
  ('2025-04-21', 'Lundi de Pâques'),
  ('2025-05-01', 'Fête du Travail'),
  ('2025-05-29', 'Ascension'),
  ('2025-06-09', 'Lundi de Pentecôte'),
  ('2025-07-21', 'Fête nationale'),
  ('2025-08-15', 'Assomption'),
  ('2025-11-01', 'Toussaint'),
  ('2025-11-11', 'Armistice'),
  ('2025-12-25', 'Noël');

-- Politique de congés (remplace le IIf en cascade d''Access)
INSERT INTO vacation_policies (min_years, max_years, weeks_entitled, description) VALUES
  (0, 1, 1, 'Première année'),
  (1, 7, 2, '1 à 7 ans'),
  (7, 14, 3, '7 à 14 ans'),
  (14, 24, 4, '14 à 24 ans'),
  (25, NULL, 5, '25 ans et plus');

-- ============================================================
-- FIN DU SCHEMA
-- ============================================================
