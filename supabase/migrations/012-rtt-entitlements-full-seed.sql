-- Migration 012: Full RTT entitlements seed from Access tbl_RTT
-- Creates 2 new sectors + seeds all RTT data (237 rows, 10 sectors)
-- Source: Access DB tbl_RTT joined with tbl_Sec_Secteurs

-- 1. Create missing sectors
INSERT INTO sectors (id, name, code_bareme, rtt_group_id, has_rtt, is_ific, ific_category) VALUES
(21, 'MEDECIN IFIC CAT 20', NULL, 1, true, true, 20),
(22, 'MEDECIN REMP', NULL, 1, true, false, NULL)
ON CONFLICT (id) DO NOTHING;
SELECT setval('sectors_id_seq', 22);

-- 2. Clear existing RTT data
DELETE FROM rtt_entitlements;

-- 3. Secteur 10: ACCUEIL Diplôme Secondaire NON IFIC (âge 50-70, group Admin)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(10, 50, 38), (10, 51, 38), (10, 52, 76), (10, 53, 76), (10, 54, 76),
(10, 55, 152), (10, 56, 152), (10, 57, 152), (10, 58, 152), (10, 59, 152),
(10, 60, 152), (10, 61, 152), (10, 62, 152), (10, 63, 152), (10, 64, 152),
(10, 65, 152), (10, 66, 152), (10, 67, 152), (10, 68, 152), (10, 69, 152), (10, 70, 152);

-- 4. Secteur 1: ACCUEIL Diplôme Supérieur NON IFIC (âge 50-70, group Admin)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(1, 50, 38), (1, 51, 38), (1, 52, 76), (1, 53, 76), (1, 54, 76),
(1, 55, 152), (1, 56, 152), (1, 57, 152), (1, 58, 152), (1, 59, 152),
(1, 60, 152), (1, 61, 152), (1, 62, 152), (1, 63, 152), (1, 64, 152),
(1, 65, 152), (1, 66, 152), (1, 67, 152), (1, 68, 152), (1, 69, 152), (1, 70, 152);

-- 5. Secteur 2: ADMIN (âge 50-70, group Admin)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(2, 50, 38), (2, 51, 38), (2, 52, 76), (2, 53, 76), (2, 54, 76),
(2, 55, 152), (2, 56, 152), (2, 57, 152), (2, 58, 152), (2, 59, 152),
(2, 60, 152), (2, 61, 152), (2, 62, 152), (2, 63, 152), (2, 64, 152),
(2, 65, 152), (2, 66, 152), (2, 67, 152), (2, 68, 152), (2, 69, 152), (2, 70, 152);

-- 6. Secteur 3: CDD Accueil/admin IFIC CAT 12 (âge 50-70, group Admin)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(3, 50, 99), (3, 51, 99), (3, 52, 155), (3, 53, 155), (3, 54, 155),
(3, 55, 200), (3, 56, 200), (3, 57, 200), (3, 58, 200), (3, 59, 200),
(3, 60, 200), (3, 61, 200), (3, 62, 200), (3, 63, 200), (3, 64, 200),
(3, 65, 200), (3, 66, 200), (3, 67, 200), (3, 68, 200), (3, 69, 200), (3, 70, 200);

-- 7. Secteur 6: KINE IFIC CAT 17 (âge 45-70, group MKI)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(6, 45, 96), (6, 46, 96), (6, 47, 96), (6, 48, 96), (6, 49, 96),
(6, 50, 192), (6, 51, 192), (6, 52, 192), (6, 53, 192), (6, 54, 192),
(6, 55, 288), (6, 56, 288), (6, 57, 288), (6, 58, 288), (6, 59, 288),
(6, 60, 288), (6, 61, 288), (6, 62, 288), (6, 63, 288), (6, 64, 288),
(6, 65, 288), (6, 66, 288), (6, 67, 288), (6, 68, 288), (6, 69, 288), (6, 70, 288);

-- 8. Secteur 4: INF NON IFIC (âge 45-70, group MKI)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(4, 45, 96), (4, 46, 96), (4, 47, 96), (4, 48, 96), (4, 49, 96),
(4, 50, 192), (4, 51, 192), (4, 52, 192), (4, 53, 192), (4, 54, 192),
(4, 55, 288), (4, 56, 288), (4, 57, 288), (4, 58, 288), (4, 59, 288),
(4, 60, 288), (4, 61, 288), (4, 62, 288), (4, 63, 288), (4, 64, 288),
(4, 65, 288), (4, 66, 288), (4, 67, 288), (4, 68, 288), (4, 69, 288), (4, 70, 288);

-- 9. Secteur 5: KINE BAR 1/80 (âge 45-70, group MKI)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(5, 45, 96), (5, 46, 96), (5, 47, 96), (5, 48, 96), (5, 49, 96),
(5, 50, 192), (5, 51, 192), (5, 52, 192), (5, 53, 192), (5, 54, 192),
(5, 55, 288), (5, 56, 288), (5, 57, 288), (5, 58, 288), (5, 59, 288),
(5, 60, 288), (5, 61, 288), (5, 62, 288), (5, 63, 288), (5, 64, 288),
(5, 65, 288), (5, 66, 288), (5, 67, 288), (5, 68, 288), (5, 69, 288), (5, 70, 288);

-- 10. Secteur 8: MEDECIN (âge 45-70, group MKI)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(8, 45, 96), (8, 46, 96), (8, 47, 96), (8, 48, 96), (8, 49, 96),
(8, 50, 192), (8, 51, 192), (8, 52, 192), (8, 53, 192), (8, 54, 192),
(8, 55, 288), (8, 56, 288), (8, 57, 288), (8, 58, 288), (8, 59, 288),
(8, 60, 288), (8, 61, 288), (8, 62, 288), (8, 63, 288), (8, 64, 288),
(8, 65, 288), (8, 66, 288), (8, 67, 288), (8, 68, 288), (8, 69, 288), (8, 70, 288);

-- 11. Secteur 21: MEDECIN IFIC CAT 20 (NOUVEAU, âge 45-70, group MKI)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(21, 45, 96), (21, 46, 96), (21, 47, 96), (21, 48, 96), (21, 49, 96),
(21, 50, 192), (21, 51, 192), (21, 52, 192), (21, 53, 192), (21, 54, 192),
(21, 55, 288), (21, 56, 288), (21, 57, 288), (21, 58, 288), (21, 59, 288),
(21, 60, 288), (21, 61, 288), (21, 62, 288), (21, 63, 288), (21, 64, 288),
(21, 65, 288), (21, 66, 288), (21, 67, 288), (21, 68, 288), (21, 69, 288), (21, 70, 288);

-- 12. Secteur 22: MEDECIN REMP (NOUVEAU, âge 45-70, group MKI)
INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(22, 45, 96), (22, 46, 96), (22, 47, 96), (22, 48, 96), (22, 49, 96),
(22, 50, 192), (22, 51, 192), (22, 52, 192), (22, 53, 192), (22, 54, 192),
(22, 55, 288), (22, 56, 288), (22, 57, 288), (22, 58, 288), (22, 59, 288),
(22, 60, 288), (22, 61, 288), (22, 62, 288), (22, 63, 288), (22, 64, 288),
(22, 65, 288), (22, 66, 288), (22, 67, 288), (22, 68, 288), (22, 69, 288), (22, 70, 288);
