-- ============================================================
-- Migration 004: Governance RLS policies
-- ============================================================
-- Enables RLS on all governance tables and grants anon access
-- (to be restricted by role-based policies later when auth is implemented)
-- ============================================================

-- Enable RLS on governance tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_makers ENABLE ROW LEVEL SECURITY;
ALTER TABLE changes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MEETINGS
-- ============================================================

CREATE POLICY "Allow anon read meetings"
  ON meetings FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert meetings"
  ON meetings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update meetings"
  ON meetings FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete meetings"
  ON meetings FOR DELETE TO anon USING (true);

-- ============================================================
-- MEETING ATTENDEES
-- ============================================================

CREATE POLICY "Allow anon read meeting_attendees"
  ON meeting_attendees FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert meeting_attendees"
  ON meeting_attendees FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon delete meeting_attendees"
  ON meeting_attendees FOR DELETE TO anon USING (true);

-- ============================================================
-- REQUESTS
-- ============================================================

CREATE POLICY "Allow anon read requests"
  ON requests FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert requests"
  ON requests FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update requests"
  ON requests FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete requests"
  ON requests FOR DELETE TO anon USING (true);

-- ============================================================
-- DECISIONS
-- ============================================================

CREATE POLICY "Allow anon read decisions"
  ON decisions FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert decisions"
  ON decisions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update decisions"
  ON decisions FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete decisions"
  ON decisions FOR DELETE TO anon USING (true);

-- ============================================================
-- DECISION MAKERS
-- ============================================================

CREATE POLICY "Allow anon read decision_makers"
  ON decision_makers FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert decision_makers"
  ON decision_makers FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon delete decision_makers"
  ON decision_makers FOR DELETE TO anon USING (true);

-- ============================================================
-- CHANGES (audit/changelog)
-- ============================================================

CREATE POLICY "Allow anon read changes"
  ON changes FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert changes"
  ON changes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update changes"
  ON changes FOR UPDATE TO anon USING (true);
