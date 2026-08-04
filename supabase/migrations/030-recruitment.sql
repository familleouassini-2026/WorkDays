CREATE TABLE job_openings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  sector_id INTEGER REFERENCES sectors(id),
  location_id INTEGER REFERENCES locations(id),
  contract_type TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  job_opening_id INTEGER REFERENCES job_openings(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  nationality TEXT,
  national_registration TEXT,
  cv_base64 TEXT,
  cv_filename TEXT,
  motivation TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'shortlisted', 'interview', 'offered', 'hired', 'rejected')),
  interview_date TIMESTAMPTZ,
  interview_notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  employee_id INTEGER REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON job_openings TO anon;
GRANT ALL ON job_openings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE job_openings_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE job_openings_id_seq TO authenticated;
ALTER TABLE job_openings DISABLE ROW LEVEL SECURITY;

GRANT ALL ON candidates TO anon;
GRANT ALL ON candidates TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE candidates_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE candidates_id_seq TO authenticated;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
