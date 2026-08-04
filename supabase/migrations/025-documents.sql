CREATE TABLE employee_documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_base64 TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
