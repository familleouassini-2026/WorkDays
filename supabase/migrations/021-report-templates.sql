CREATE TABLE report_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies following the pattern from migrations 002-005
DROP POLICY IF EXISTS "Allow anon read" ON report_templates;
DROP POLICY IF EXISTS "Allow anon all" ON report_templates;
CREATE POLICY "Allow anon read" ON report_templates FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON report_templates FOR ALL TO anon USING (true) WITH CHECK (true);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION set_report_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_report_templates_updated_at();
