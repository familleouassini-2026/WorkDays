-- ============================================================
-- Audit Log table — tracks ALL changes to sensitive tables
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  performed_by TEXT DEFAULT 'gestionnaire',
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  context TEXT
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_date ON audit_log(performed_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all" ON audit_log FOR ALL TO anon USING (true) WITH CHECK (true);
