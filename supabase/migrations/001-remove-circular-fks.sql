-- ============================================================
-- Migration 001: Supprimer les FK circulaires, créer entity_responsibilities
-- ============================================================

-- 1. Créer la table pivot
CREATE TABLE entity_responsibilities (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('sector', 'location', 'organisation')),
  entity_id INTEGER NOT NULL,
  responsibility VARCHAR(50) NOT NULL CHECK (responsibility IN ('manager', 'responsible', 'representative')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, responsibility) -- 1 responsable par entité+rôle (actif)
);

CREATE INDEX idx_entity_resp_employee ON entity_responsibilities(employee_id);
CREATE INDEX idx_entity_resp_entity ON entity_responsibilities(entity_type, entity_id);

-- 2. Migrer les données existantes (si non-null)
INSERT INTO entity_responsibilities (employee_id, entity_type, entity_id, responsibility)
SELECT manager_id, 'sector', id, 'manager' FROM sectors WHERE manager_id IS NOT NULL;

INSERT INTO entity_responsibilities (employee_id, entity_type, entity_id, responsibility)
SELECT responsible_id, 'location', id, 'responsible' FROM locations WHERE responsible_id IS NOT NULL;

INSERT INTO entity_responsibilities (employee_id, entity_type, entity_id, responsibility)
SELECT representative_id, 'organisation', id, 'representative' FROM organisations WHERE representative_id IS NOT NULL;

-- 3. Supprimer les FK et colonnes circulaires
ALTER TABLE sectors DROP CONSTRAINT IF EXISTS fk_sector_manager;
ALTER TABLE sectors DROP COLUMN IF EXISTS manager_id;

ALTER TABLE locations DROP CONSTRAINT IF EXISTS fk_location_responsible;
ALTER TABLE locations DROP COLUMN IF EXISTS responsible_id;

ALTER TABLE organisations DROP CONSTRAINT IF EXISTS fk_org_representative;
ALTER TABLE organisations DROP COLUMN IF EXISTS representative_id;

-- 4. RLS sur la nouvelle table
ALTER TABLE entity_responsibilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON entity_responsibilities FOR ALL USING (true);
CREATE POLICY "Allow anon read" ON entity_responsibilities FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON entity_responsibilities FOR ALL TO anon USING (true) WITH CHECK (true);
