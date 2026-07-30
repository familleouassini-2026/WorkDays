-- ============================================================
-- WorkDays - SETUP COMPLET (schema + données)
-- Exécuter ce fichier UNIQUE dans Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'HR_MANAGER', 'LEASING_MANAGER', 'SECTOR_MANAGER', 'EMPLOYEE');
CREATE TYPE contract_type AS ENUM ('CDI', 'CDD', 'INTERIM', 'STAGE', 'BENEVOLE');
CREATE TYPE title_type AS ENUM ('M', 'Mme', 'Mlle');
CREATE TYPE time_unit AS ENUM ('HOURS_MINUTES', 'DAYS');
CREATE TYPE absence_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE meeting_type AS ENUM ('CA', 'AG', 'ADHOC', 'CE');
CREATE TYPE leasing_type AS ENUM ('VOITURES', 'MOBILES', 'IMPRIMANTES');

-- ORGANISATION
CREATE TABLE organisations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  representative_id INTEGER,
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
  responsible_id INTEGER,
  organisation_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code_bareme VARCHAR(50),
  manager_id INTEGER,
  mission TEXT,
  rtt_group_id INTEGER REFERENCES rtt_groups(id),
  has_rtt BOOLEAN DEFAULT true,
  is_ific BOOLEAN DEFAULT false,
  ific_category INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- FK retardées
ALTER TABLE locations ADD CONSTRAINT fk_location_org FOREIGN KEY (organisation_id) REFERENCES organisations(id);
ALTER TABLE organisations ADD CONSTRAINT fk_org_rep FOREIGN KEY (representative_id) REFERENCES employees(id);
ALTER TABLE locations ADD CONSTRAINT fk_location_resp FOREIGN KEY (responsible_id) REFERENCES employees(id);
ALTER TABLE sectors ADD CONSTRAINT fk_sector_mgr FOREIGN KEY (manager_id) REFERENCES employees(id);

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

CREATE TABLE vacation_policies (
  id SERIAL PRIMARY KEY,
  min_years INTEGER NOT NULL,
  max_years INTEGER,
  weeks_entitled INTEGER NOT NULL,
  description VARCHAR(255)
);

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

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role DEFAULT 'EMPLOYEE',
  employee_id INTEGER UNIQUE REFERENCES employees(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- INDEX
CREATE INDEX idx_employees_sector ON employees(sector_id);
CREATE INDEX idx_employees_inactive ON employees(is_inactive);
CREATE INDEX idx_employees_name ON employees(last_name, first_name);
CREATE INDEX idx_year_calendar_employee ON year_calendar(employee_id);
CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);

-- RLS (permissif pour démarrer)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON employees FOR ALL USING (true);
CREATE POLICY "allow_all" ON sectors FOR ALL USING (true);
CREATE POLICY "allow_all" ON organisations FOR ALL USING (true);
CREATE POLICY "allow_all" ON absence_codes FOR ALL USING (true);
CREATE POLICY "allow_all" ON timesheets FOR ALL USING (true);

-- ============================================================
-- DONNEES
-- ============================================================

-- Organisation
INSERT INTO organisations (id, name, comite_paritaire, address, post_code, city, country, commune, telephone, full_time_hours)
VALUES (1, 'Maison Médicale de Forest ASBL', '330.01.54', 'rue du curé, 9', '1190', 'Bruxelles', 'Belgique', '1190', '02 376 16 82', 38);
SELECT setval('organisations_id_seq', 1);

-- Groupes RTT
INSERT INTO rtt_groups (id, name) VALUES (1, 'MKI'), (2, 'Admin');
SELECT setval('rtt_groups_id_seq', 2);

-- Sites
INSERT INTO locations (id, name, organisation_id) VALUES (1, 'Saint-Denis', 1), (2, 'Saint-Antoine', 1), (3, 'Britannique', 1);
SELECT setval('locations_id_seq', 3);

-- Secteurs (20)
INSERT INTO sectors (id, name, code_bareme, rtt_group_id, has_rtt, is_ific, ific_category) VALUES
(1, 'ACCUEIL Diplôme Supérieur NON IFIC', '1', 2, true, false, NULL),
(2, 'ADMIN', NULL, 2, true, false, NULL),
(3, 'CDD Accueil/admin IFIC CAT 12', NULL, 2, true, true, 12),
(4, 'INF NON IFIC', NULL, 1, true, false, NULL),
(5, 'KINE BAR 1/80', '1/80', 1, true, false, NULL),
(6, 'KINE IFIC CAT 17', NULL, 1, true, true, 17),
(7, 'LOG NON IFIC BAR 1/26', '1/26', 1, true, false, NULL),
(8, 'MEDECIN', NULL, 1, false, false, NULL),
(9, 'INF IFIC CAT 14', NULL, 1, true, true, 14),
(10, 'ACCUEIL Diplôme Secondaire NON IFIC', NULL, 2, true, false, NULL),
(11, 'SAGE FEMME NON IFIC', NULL, 1, true, false, NULL),
(12, 'INF Chef NON IFIC', NULL, 1, true, false, NULL),
(13, 'CDD INF IFIC CAT 14', NULL, 1, true, true, 14),
(14, 'DIETETICIENNE IFIC CAT 16', NULL, 1, true, true, 16),
(15, 'ASSISTANT SOCIAL IFIC CAT 15', NULL, 1, true, true, 15),
(16, 'PSY IFIC CAT 17', NULL, 1, true, true, 17),
(17, 'DENTISTE', NULL, 1, false, false, NULL),
(18, 'PODOLOGUE IFIC CAT 16', NULL, 1, true, true, 16),
(19, 'STAGIAIRE', NULL, 2, false, false, NULL),
(20, 'OSTEOPATHE', NULL, 1, true, false, NULL);
SELECT setval('sectors_id_seq', 20);

-- Employés (35)
INSERT INTO employees (id, title, first_name, last_name, job_title, contract_type, date_of_hire, date_of_birth, is_inactive, sector_id, location_id, email, mobile_phone, address, province, postal_code, granted_seniority, granted_seniority_date) VALUES
(3, 'Mme', 'Lidia', 'BIOUCAS', NULL, 'CDI', '2016-05-17', '1968-10-19', false, 1, 3, NULL, '0476779284', 'AVENUE DES Jardins 52/6', 'Bruxelles', '1030', 1.0, '2015-05-17'),
(16, 'Mme', 'Fareda', 'BOULAICH', 'Accueillante', 'CDI', '2013-09-07', '1974-12-16', false, 1, 3, 'faredab@mmforest.be', '0476763338', 'Allée des Novateurs 8', 'Anderlecht', '1070', 1.0, '2012-09-07'),
(18, 'Mme', 'Chaimae', 'BOUZRATI', NULL, 'CDI', '2009-09-20', '1988-10-19', false, 1, 1, NULL, '0488046213', 'Avenue Gatti de Gamond 200', 'UCCLE', '1180', 1.0, '2008-09-20'),
(23, 'Mme', 'Deborah', 'CZAPNIK', 'Kinésithérapeute', 'CDI', '2003-01-01', '1976-09-20', false, 5, 1, 'deborahc@mmforest.be', '0477880008', 'clos du Belloi 10', 'Waterloo', '1410', 4.0, '1998-01-01'),
(27, 'Mme', 'Françoise', 'DELEM', NULL, NULL, '1984-11-08', '1954-11-29', false, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Mme', 'Fabienne', 'DUPLAT', NULL, 'CDI', '2002-03-01', '1972-11-29', false, 5, 1, NULL, '0473953072', 'Rue Verheyden 60', 'UCCLE', '1180', NULL, NULL),
(30, 'Mme', 'Pascale', 'HANTON', 'Infirmière', 'CDI', '2000-03-01', '1967-03-04', false, 4, 1, 'pascaleh@mmforest.be', '0475560693', 'Avenue Brugman 42', 'Bruxelles', '1060', 3.0, '1997-03-01'),
(31, 'Mme', 'Christelle', 'HAZEE', NULL, 'CDI', '2010-01-04', '1979-06-07', false, 4, 1, NULL, '0477440835', NULL, NULL, NULL, NULL, NULL),
(32, 'Mme', 'Adjuah', 'GORRE NDIAYE', NULL, 'CDI', '2014-06-01', '1985-08-20', false, 5, 1, NULL, '0484777002', NULL, NULL, NULL, NULL, NULL),
(33, 'M', 'Jean-Philippe', 'BENTEIN', 'Médecin', 'CDI', '2003-02-01', '1969-05-15', false, 8, 1, 'jpb@mmforest.be', '0475232318', NULL, NULL, NULL, NULL, NULL),
(34, 'Mme', 'Nadège', 'HAUMONT', 'Sage-femme', 'CDI', '2007-09-01', '1978-01-03', false, 11, 1, NULL, '0497330283', NULL, NULL, NULL, 2.0, '2005-09-01'),
(35, 'Mme', 'Cindy', 'HUIJSKENS', 'Infirmière', 'CDI', '2013-11-28', '1987-07-25', false, 4, 1, 'cindyh@mmforest.be', '0486085020', NULL, NULL, NULL, NULL, NULL),
(36, 'M', 'Laurent', 'JOCKIN', 'Médecin', 'CDI', '2005-09-01', '1968-03-22', false, 8, 1, NULL, '0477264019', NULL, NULL, NULL, NULL, NULL),
(37, 'Mme', 'Anne-Pascale', 'KETS', 'Kinésithérapeute', 'CDI', '2003-01-01', '1970-04-14', false, 5, 2, 'apk@mmforest.be', '0476513703', NULL, NULL, NULL, 5.0, '1998-01-01'),
(38, 'Mme', 'Marie', 'LADRIERE', 'Médecin', 'CDI', '2010-09-01', '1980-12-01', false, 8, 1, NULL, '0474292826', NULL, NULL, NULL, NULL, NULL),
(39, 'Mme', 'Naoual', 'LAMQADDAM', 'Accueillante', 'CDI', '2006-02-01', '1973-05-25', false, 1, 1, 'naoual@mmforest.be', '0475800424', NULL, NULL, NULL, NULL, NULL),
(40, 'Mme', 'Véronique', 'LAURENT', 'Médecin', 'CDI', '1991-03-01', '1965-08-30', false, 8, 2, NULL, '0475439100', NULL, NULL, NULL, NULL, NULL),
(41, 'M', 'Claude', 'LEBON', 'Kinésithérapeute', 'CDI', '2009-04-01', '1981-10-12', false, 5, 2, NULL, '0495122073', NULL, NULL, NULL, 3.0, '2006-04-01'),
(42, 'Mme', 'Marie-Claire', 'BENTEIN', 'Accueillante', 'CDI', '2007-01-15', '1957-01-26', true, 10, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'Mme', 'Rachida', 'MAATALLAH', NULL, 'CDI', '2009-02-01', '1973-09-19', false, 2, 1, 'rachidam@mmforest.be', '0477503498', NULL, NULL, NULL, NULL, NULL),
(44, 'M', 'Alphonse', 'SIBOMANA', NULL, 'CDI', '2002-11-01', '1967-03-21', false, 9, 1, 'alphonses@mmforest.be', '0477631420', NULL, NULL, NULL, 4.0, '1998-11-01'),
(45, 'Mme', 'Nathalie', 'PIERARD', 'Infirmière', 'CDI', '2014-12-15', '1970-04-06', false, 4, 1, NULL, '0475397800', NULL, NULL, NULL, 2.0, '2012-12-15'),
(46, 'Mme', 'Isabelle', 'QUERINJEAN', 'Médecin', 'CDI', '2014-10-01', '1977-11-03', false, 8, 2, NULL, '0495202840', NULL, NULL, NULL, NULL, NULL),
(47, 'Mme', 'Muriel', 'SOLBREUX', 'Dentiste', 'CDI', '2015-01-05', '1972-06-17', false, 17, 1, NULL, '0476543120', NULL, NULL, NULL, NULL, NULL),
(48, 'M', 'Yannick', 'THEYS', 'Médecin', 'CDI', '2016-09-01', '1985-02-14', false, 8, 1, NULL, '0474918232', NULL, NULL, NULL, NULL, NULL),
(49, 'Mme', 'Patricia', 'VAN HEES', 'Logopède', 'CDI', '2005-01-03', '1970-09-09', false, 7, 1, NULL, '0475267431', NULL, NULL, NULL, 3.0, '2002-01-03'),
(50, 'Mme', 'Chloé', 'BLOIN', 'Infirmière', 'CDI', '2013-05-22', '1989-08-11', false, 1, 1, NULL, '0486420571', NULL, NULL, NULL, NULL, NULL),
(51, 'Mme', 'Sarah', 'DEBOTH', 'Assistante sociale', 'CDI', '2016-03-01', '1990-11-22', false, 15, 1, NULL, '0477891045', NULL, NULL, NULL, NULL, NULL),
(52, 'M', 'Pierre', 'DUMONT', 'Psychologue', 'CDI', '2017-01-09', '1982-07-30', false, 16, 1, NULL, '0495312876', NULL, NULL, NULL, NULL, NULL),
(53, 'Mme', 'Aïssatou', 'BAH', 'Infirmière', 'CDD', '2014-06-01', '1986-03-12', false, 13, 1, NULL, '0484995037', NULL, NULL, NULL, NULL, NULL),
(54, 'Mme', 'Fatima', 'EL AMRANI', 'Diététicienne', 'CDI', '2018-02-01', '1991-04-18', false, 14, 1, NULL, '0476102983', NULL, NULL, NULL, NULL, NULL),
(55, 'Mme', 'Camille', 'RENARD', 'Podologue', 'CDI', '2019-09-15', '1993-12-05', false, 18, 2, NULL, '0488734521', NULL, NULL, NULL, NULL, NULL),
(56, 'M', 'Thomas', 'VANDENBERGHE', 'Ostéopathe', 'CDI', '2020-01-06', '1988-06-20', false, 20, 2, NULL, '0475610982', NULL, NULL, NULL, NULL, NULL),
(57, 'Mme', 'Julie', 'MARTIN', 'Accueillante', 'CDD', '2021-03-15', '1995-09-10', false, 3, 1, NULL, '0486234567', NULL, NULL, NULL, NULL, NULL);
SELECT setval('employees_id_seq', 60);

-- Codes d'absence
INSERT INTO absence_codes (id, code, description, color_hex, text_color_hex, time_unit) VALUES
(1, 'RTT', 'Réduction du temps de travail', '#0072BC', '#FFFFFF', 'HOURS_MINUTES'),
(2, 'JP', 'Solde de congés Année N-1', '#B4A6DE', '#000000', 'HOURS_MINUTES'),
(3, 'CSS', 'Congés sans solde', '#FFA500', '#000000', 'HOURS_MINUTES'),
(4, 'PC', 'Petits chômages', '#96BACD', '#000000', 'DAYS'),
(5, 'JF', 'Récup. jour férié', '#0000FF', '#FFFFFF', 'DAYS'),
(6, 'MA', 'Maladie', '#FF0000', '#FFFFFF', 'HOURS_MINUTES'),
(7, 'MAT', 'Maternité', '#FF69B4', '#000000', 'DAYS'),
(8, 'AT', 'Accident de travail', '#8B0000', '#FFFFFF', 'DAYS'),
(9, 'F', 'Formation', '#228B22', '#FFFFFF', 'HOURS_MINUTES'),
(10, 'HS', 'Heures supplémentaires', '#FFD700', '#000000', 'HOURS_MINUTES'),
(11, 'V', 'Vacances annuelles', '#00CED1', '#000000', 'HOURS_MINUTES');
SELECT setval('absence_codes_id_seq', 11);

-- Jours fériés belges
INSERT INTO holidays (holiday_date, name) VALUES
('2024-01-01', 'Jour de l''An'), ('2024-04-01', 'Lundi de Pâques'),
('2024-05-01', 'Fête du Travail'), ('2024-05-09', 'Ascension'),
('2024-05-20', 'Lundi de Pentecôte'), ('2024-07-21', 'Fête nationale'),
('2024-08-15', 'Assomption'), ('2024-11-01', 'Toussaint'),
('2024-11-11', 'Armistice'), ('2024-12-25', 'Noël'),
('2025-01-01', 'Jour de l''An'), ('2025-04-21', 'Lundi de Pâques'),
('2025-05-01', 'Fête du Travail'), ('2025-05-29', 'Ascension'),
('2025-06-09', 'Lundi de Pentecôte'), ('2025-07-21', 'Fête nationale'),
('2025-08-15', 'Assomption'), ('2025-11-01', 'Toussaint'),
('2025-11-11', 'Armistice'), ('2025-12-25', 'Noël');

-- Politique de congés
INSERT INTO vacation_policies (min_years, max_years, weeks_entitled, description) VALUES
(0, 1, 1, 'Première année'), (1, 7, 2, '1 à 7 ans'),
(7, 14, 3, '7 à 14 ans'), (14, 24, 4, '14 à 24 ans'),
(25, NULL, 5, '25 ans et plus');

-- Horaires
INSERT INTO timesheets (employee_id, is_active, monday_minutes, tuesday_minutes, wednesday_minutes, thursday_minutes, friday_minutes, full_time_minutes) VALUES
(16, true, 480, 480, 360, 480, 480, 2280),
(18, true, 480, 480, 480, 480, 360, 2280),
(23, true, 570, 540, 300, 570, 300, 2280),
(28, true, 450, 520, 280, 570, 460, 2280),
(30, true, 480, 480, 360, 480, 480, 2280),
(35, true, 480, 480, 480, 480, 360, 2280),
(44, true, 480, 480, 360, 480, 480, 2280);

-- Barèmes (KINE + ACCUEIL + INF)
INSERT INTO seniority_scales (sector_id, years, base_salary) VALUES
(5, 0, 3443.70), (5, 1, 3612.42), (5, 3, 3763.55), (5, 5, 3914.69),
(5, 7, 4065.82), (5, 9, 4216.95), (5, 11, 4368.09), (5, 13, 4519.22),
(5, 15, 4670.35), (5, 17, 4821.49), (5, 19, 4972.62), (5, 21, 5123.75),
(1, 0, 2800.00), (1, 1, 2900.00), (1, 3, 3050.00), (1, 5, 3200.00),
(1, 7, 3350.00), (1, 9, 3500.00), (1, 11, 3650.00),
(4, 0, 3200.00), (4, 1, 3350.00), (4, 3, 3550.00), (4, 5, 3750.00),
(4, 7, 3950.00), (4, 9, 4150.00), (4, 11, 4350.00);

-- Véhicules
INSERT INTO leasing_assets (id, type, plate_number) VALUES
(1, 'VOITURES', '1SVA704'), (2, 'VOITURES', '1GKQ959'),
(3, 'VOITURES', '1NHB989'), (4, 'VOITURES', '1HUU063'),
(5, 'VOITURES', '1JTB567'), (6, 'VOITURES', '1KLP824');
SELECT setval('leasing_assets_id_seq', 6);

INSERT INTO employee_leasing (employee_id, leasing_id, start_date) VALUES
(16, 2, '2016-03-07'), (35, 3, '2016-03-02'),
(28, 4, NULL), (30, 5, '2016-03-02'),
(50, 1, '2017-08-03'), (23, 6, '2015-01-12');

-- FIN
