-- Migration 007: Seed holidays for Belgium 2026-2027
-- Table 'holidays' already exists (created in initial schema)
-- This seeds the official Belgian public holidays

INSERT INTO holidays (holiday_date, name, year) VALUES
-- 2026
('2026-01-01', 'Nouvel An', 2026),
('2026-04-05', 'Lundi de Paques', 2026),
('2026-05-01', 'Fete du Travail', 2026),
('2026-05-14', 'Ascension', 2026),
('2026-05-25', 'Lundi de Pentecote', 2026),
('2026-07-21', 'Fete nationale', 2026),
('2026-08-15', 'Assomption', 2026),
('2026-11-01', 'Toussaint', 2026),
('2026-11-11', 'Armistice', 2026),
('2026-12-25', 'Noel', 2026),
-- 2027
('2027-01-01', 'Nouvel An', 2027),
('2027-03-29', 'Lundi de Paques', 2027),
('2027-05-01', 'Fete du Travail', 2027),
('2027-05-06', 'Ascension', 2027),
('2027-05-17', 'Lundi de Pentecote', 2027),
('2027-07-21', 'Fete nationale', 2027),
('2027-08-15', 'Assomption', 2027),
('2027-11-01', 'Toussaint', 2027),
('2027-11-11', 'Armistice', 2027),
('2027-12-25', 'Noel', 2027)
ON CONFLICT DO NOTHING;
