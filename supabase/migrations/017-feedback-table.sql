-- ============================================================
-- User Feedback table for UAT phase
-- Stores feedback from testers, reviewed by developer
-- ============================================================

CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'suggestion',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all" ON user_feedback FOR ALL TO anon USING (true) WITH CHECK (true);
