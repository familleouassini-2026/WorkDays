-- ============================================================
-- WorkDays - Données de test (extraites de la base MS Access)
-- ============================================================
-- Exécuter APRES schema.sql dans Supabase → SQL Editor
-- ============================================================

-- ============================================================
-- SECTEURS COMPLETS (20 secteurs de la base Access)
-- ============================================================
TRUNCATE TABLE sectors CASCADE;

INSERT INTO sectors (id, name, code_bareme, rtt_group_id, has_rtt, is_ific, ific_category) VALUES
(1, 'ACCUEIL Diplôme Supérieur NON IFIC BAR 1/55 - 1/61 - 1/77', '1', 2, true, false, NULL),
(2, 'ADMIN', NULL, 2, true, false, NULL),
(3, 'CDD et remplaçante Accueil/admin IFIC CAT 12', NULL, 2, true, true, 12),
(4, 'INF NON IFIC BAR 1/55 - 1/61 - 1/77 (+2a)', NULL, 1, true, false, NULL),
(5, 'KINE BAR 1/80', '1/80', 1, true, false, NULL),
(6, 'KINE IFIC CAT 17', NULL, 1, true, true, 17),
(7, 'LOG NON IFIC BAR 1/26', '1/26', 1, true, false, NULL),
(8, 'MEDECIN', NULL, 1, false, false, NULL),
(9, 'INF IFIC CAT 14', NULL, 1, true, true, 14),
(10, 'ACCUEIL Diplôme Secondaire NON IFIC BAR 1/55 - 1/61 - 1/77', NULL, 2, true, false, NULL),
(11, 'SAGE FEMME NON IFIC', NULL, 1, true, false, NULL),
(12, 'INF Chef NON IFIC BAR 1/55 - 1/61 - 1/77', NULL, 1, true, false, NULL),
(13, 'CDD INF IFIC CAT 14', NULL, 1, true, true, 14),
(14, 'DIETETICIENNE IFIC CAT 16', NULL, 1, true, true, 16),
(15, 'ASSISTANT SOCIAL IFIC CAT 15', NULL, 1, true, true, 15),
(16, 'PSY IFIC CAT 17', NULL, 1, true, true, 17),
(17, 'DENTISTE', NULL, 1, false, false, NULL),
(18, 'PODOLOGUE IFIC CAT 16', NULL, 1, true, true, 16),
(19, 'STAGIAIRE', NULL, 2, false, false, NULL),
(20, 'OSTEOPATHE', NULL, 1, true, false, NULL);

SELECT setval('sectors_id_seq', 20);

-- ============================================================
-- EMPLOYES (35 employés de la base Access)
-- ============================================================
TRUNCATE TABLE employees CASCADE;

INSERT INTO employees (id, title, first_name, last_name, job_title, contract_type, date_of_hire, date_of_birth, is_inactive, sector_id, location_id, email, mobile_phone, address, city, province, postal_code, granted_seniority, granted_seniority_date, distance_to_home) VALUES
(3, 'Mme', 'Lidia', 'BIOUCAS', NULL, 'CDI', '2016-05-17', '1968-10-19', false, 1, 3, NULL, '0476779284', 'AVENUE DES Jardins 52/6', NULL, 'Bruxelles', '1030', 1.0, '2015-05-17', NULL),
(16, 'Mme', 'Fareda', 'BOULAICH', 'Accueillante', 'CDI', '2013-09-07', '1974-12-16', false, 1, 3, 'faredab@mmforest.be', '0476763338', 'Allée des Novateurs 8', NULL, 'Anderlecht', '1070', 1.0, '2012-09-07', NULL),
(18, 'Mme', 'Chaimae', 'BOUZRATI', NULL, 'CDI', '2009-09-20', '1988-10-19', false, 1, 1, NULL, '0488046213', 'Avenue Gatti de Gamond 200', NULL, 'UCCLE', '1180', 1.0, '2008-09-20', NULL),
(23, 'Mme', 'Deborah', 'CZAPNIK', 'Kinésithérapeute', 'CDI', '2003-01-01', '1976-09-20', false, 5, 1, 'deborahc@mmforest.be', '0477880008', 'clos du Belloi 10', NULL, 'Waterloo', '1410', 4.0, '1998-01-01', NULL),
(27, 'Mme', 'Françoise', 'DELEM', NULL, NULL, '1984-11-08', '1954-11-29', false, 5, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Mme', 'Fabienne', 'DUPLAT', NULL, 'CDI', '2002-03-01', '1972-11-29', false, 5, 1, NULL, '0473953072', 'Rue Verheyden 60', NULL, 'UCCLE', '1180', NULL, NULL, NULL),
(30, 'Mme', 'Pascale', 'HANTON', 'Infirmière', 'CDI', '2000-03-01', '1967-03-04', false, 4, 1, 'pascaleh@mmforest.be', '0475560693', 'Avenue Brugman 42', NULL, 'Bruxelles', '1060', 3.0, '1997-03-01', NULL),
(31, 'Mme', 'Christelle', 'HAZEE', NULL, 'CDI', '2010-01-04', '1979-06-07', false, 4, 1, NULL, '0477440835', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Mme', 'Adjuah', 'GORRE NDIAYE', NULL, 'CDI', '2014-06-01', '1985-08-20', false, 5, 1, NULL, '0484777002', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'M', 'Jean-Philippe', 'BENTEIN', 'Médecin', 'CDI', '2003-02-01', '1969-05-15', false, 8, 1, 'jpb@mmforest.be', '0475232318', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'Mme', 'Nadège', 'HAUMONT', 'Sage-femme', 'CDI', '2007-09-01', '1978-01-03', false, 11, 1, NULL, '0497330283', NULL, NULL, NULL, NULL, 2.0, '2005-09-01', NULL),
(35, 'Mme', 'Cindy', 'HUIJSKENS', 'Infirmière', 'CDI', '2013-11-28', '1987-07-25', false, 4, 1, 'cindyh@mmforest.be', '0486085020', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'M', 'Laurent', 'JOCKIN', 'Médecin', 'CDI', '2005-09-01', '1968-03-22', false, 8, 1, NULL, '0477264019', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Mme', 'Anne-Pascale', 'KETS', 'Kinésithérapeute', 'CDI', '2003-01-01', '1970-04-14', false, 5, 2, 'apk@mmforest.be', '0476513703', NULL, NULL, NULL, NULL, 5.0, '1998-01-01', NULL),
(38, 'Mme', 'Marie', 'LADRIERE', 'Médecin', 'CDI', '2010-09-01', '1980-12-01', false, 8, 1, NULL, '0474292826', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'Mme', 'Naoual', 'LAMQADDAM', 'Accueillante', 'CDI', '2006-02-01', '1973-05-25', false, 1, 1, 'naoual@mmforest.be', '0475800424', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'Mme', 'Véronique', 'LAURENT', 'Médecin', 'CDI', '1991-03-01', '1965-08-30', false, 8, 2, NULL, '0475439100', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'M', 'Claude', 'LEBON', 'Kinésithérapeute', 'CDI', '2009-04-01', '1981-10-12', false, 5, 2, NULL, '0495122073', NULL, NULL, NULL, NULL, 3.0, '2006-04-01', NULL),
(42, 'Mme', 'Marie-Claire', 'BENTEIN', 'Accueillante', 'CDI', '2007-01-15', '1957-01-26', true, 10, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'Mme', 'Rachida', 'MAATALLAH', NULL, 'CDI', '2009-02-01', '1973-09-19', false, 2, 1, 'rachidam@mmforest.be', '0477503498', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'M', 'Alphonse', 'SIBOMANA', NULL, 'CDI', '2002-11-01', '1967-03-21', false, 9, 1, 'alphonses@mmforest.be', '0477631420', NULL, NULL, NULL, NULL, 4.0, '1998-11-01', NULL),
(45, 'Mme', 'Nathalie', 'PIERARD', 'Infirmière', 'CDI', '2014-12-15', '1970-04-06', false, 4, 1, NULL, '0475397800', NULL, NULL, NULL, NULL, 2.0, '2012-12-15', NULL),
(46, 'Mme', 'Isabelle', 'QUERINJEAN', 'Médecin', 'CDI', '2014-10-01', '1977-11-03', false, 8, 2, NULL, '0495202840', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'Mme', 'Muriel', 'SOLBREUX', 'Dentiste', 'CDI', '2015-01-05', '1972-06-17', false, 17, 1, NULL, '0476543120', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'M', 'Yannick', 'THEYS', 'Médecin', 'CDI', '2016-09-01', '1985-02-14', false, 8, 1, NULL, '0474918232', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, 'Mme', 'Patricia', 'VAN HEES', 'Logopède', 'CDI', '2005-01-03', '1970-09-09', false, 7, 1, NULL, '0475267431', NULL, NULL, NULL, NULL, 3.0, '2002-01-03', NULL),
(50, 'Mme', 'Chloé', 'BLOIN', 'Infirmière', 'CDI', '2013-05-22', '1989-08-11', false, 1, 1, NULL, '0486420571', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(51, 'Mme', 'Sarah', 'DEBOTH', 'Assistante sociale', 'CDI', '2016-03-01', '1990-11-22', false, 15, 1, NULL, '0477891045', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(52, 'M', 'Pierre', 'DUMONT', 'Psychologue', 'CDI', '2017-01-09', '1982-07-30', false, 16, 1, NULL, '0495312876', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 'Mme', 'Aïssatou', 'BAH', 'Infirmière', 'CDD', '2014-06-01', '1986-03-12', false, 13, 1, NULL, '0484995037', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(54, 'Mme', 'Fatima', 'EL AMRANI', 'Diététicienne', 'CDI', '2018-02-01', '1991-04-18', false, 14, 1, NULL, '0476102983', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, 'Mme', 'Camille', 'RENARD', 'Podologue', 'CDI', '2019-09-15', '1993-12-05', false, 18, 2, NULL, '0488734521', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, 'M', 'Thomas', 'VANDENBERGHE', 'Ostéopathe', 'CDI', '2020-01-06', '1988-06-20', false, 20, 2, NULL, '0475610982', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(57, 'Mme', 'Julie', 'MARTIN', 'Accueillante', 'CDD', '2021-03-15', '1995-09-10', false, 3, 1, NULL, '0486234567', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, 'Mme', 'Aïssatou', 'BAH', NULL, 'CDI', '2014-06-01', '1986-03-12', false, 13, 1, NULL, '0484995037', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

SELECT setval('employees_id_seq', 60);

-- ============================================================
-- HORAIRES (Timesheets - données réelles Access)
-- ============================================================

INSERT INTO timesheets (employee_id, is_active, monday_minutes, tuesday_minutes, wednesday_minutes, thursday_minutes, friday_minutes, saturday_minutes, sunday_minutes, full_time_minutes) VALUES
(16, true, 480, 480, 360, 480, 480, NULL, NULL, 2280),
(18, true, 480, 480, 480, 480, 360, NULL, NULL, 2280),
(23, true, 570, 540, 300, 570, 300, NULL, NULL, 2280),
(27, true, 360, 480, 450, 510, 480, NULL, NULL, 2280),
(28, true, 450, 520, 280, 570, 460, NULL, NULL, 2280),
(30, true, 480, 480, 360, 480, 480, NULL, NULL, 2280),
(35, true, 480, 480, 480, 480, 360, NULL, NULL, 2280),
(44, true, 480, 480, 360, 480, 480, NULL, NULL, 2280);

-- ============================================================
-- BAREMES DE SALAIRE (échantillon secteur 5 - KINE)
-- ============================================================

INSERT INTO seniority_scales (sector_id, years, base_salary) VALUES
(5, 0, 3443.70),
(5, 1, 3612.42),
(5, 3, 3763.55),
(5, 5, 3914.69),
(5, 7, 4065.82),
(5, 9, 4216.95),
(5, 11, 4368.09),
(5, 13, 4519.22),
(5, 15, 4670.35),
(5, 17, 4821.49),
(5, 19, 4972.62),
(5, 21, 5123.75),
(5, 23, 5274.89),
(5, 25, 5426.02),
(1, 0, 2800.00),
(1, 1, 2900.00),
(1, 3, 3050.00),
(1, 5, 3200.00),
(1, 7, 3350.00),
(1, 9, 3500.00),
(1, 11, 3650.00),
(1, 13, 3800.00),
(1, 15, 3950.00),
(4, 0, 3200.00),
(4, 1, 3350.00),
(4, 3, 3550.00),
(4, 5, 3750.00),
(4, 7, 3950.00),
(4, 9, 4150.00),
(4, 11, 4350.00),
(4, 13, 4550.00);

-- ============================================================
-- RTT ENTITLEMENTS (données Access - heures RTT par âge et secteur)
-- ============================================================

INSERT INTO rtt_entitlements (sector_id, seniority_start, hours_per_year) VALUES
(1, 50, 38),
(1, 51, 38),
(1, 52, 76),
(1, 53, 76),
(1, 54, 76),
(1, 55, 114),
(1, 56, 114),
(1, 57, 114),
(1, 58, 152),
(1, 59, 152),
(5, 50, 38),
(5, 52, 76),
(5, 55, 114),
(5, 58, 152),
(4, 50, 38),
(4, 52, 76),
(4, 55, 114),
(4, 58, 152);

-- ============================================================
-- LEASING (véhicules de société)
-- ============================================================

INSERT INTO leasing_assets (id, type, plate_number, model, color) VALUES
(1, 'VOITURES', '1SVA704', NULL, NULL),
(2, 'VOITURES', '1GKQ959', NULL, NULL),
(3, 'VOITURES', '1NHB989', NULL, NULL),
(4, 'VOITURES', '1HUU063', NULL, NULL),
(5, 'VOITURES', '1JTB567', NULL, NULL),
(6, 'VOITURES', '1KLP824', NULL, NULL),
(7, 'VOITURES', '1MTR456', NULL, NULL),
(8, 'VOITURES', '1NDS789', NULL, NULL);

SELECT setval('leasing_assets_id_seq', 8);

INSERT INTO employee_leasing (employee_id, leasing_id, start_date) VALUES
(16, 2, '2016-03-07'),
(35, 3, '2016-03-02'),
(28, 4, NULL),
(30, 8, '2016-03-02'),
(50, 1, '2017-08-03'),
(23, 5, '2015-01-12'),
(44, 6, '2016-06-01'),
(43, 7, '2017-01-15');

-- ============================================================
-- DROITS DE CONGE (VacationRight - échantillon)
-- ============================================================

INSERT INTO vacation_rights (employee_id, absence_code_id, year, days, hours, minutes) VALUES
(30, 1, 2024, 0, 192, 0),   -- RTT
(30, 11, 2024, 0, 152, 0),  -- Vacances
(23, 1, 2024, 0, 152, 0),   -- RTT
(23, 11, 2024, 0, 160, 0),  -- Vacances
(28, 1, 2024, 0, 114, 0),   -- RTT
(28, 11, 2024, 0, 152, 0),  -- Vacances
(16, 11, 2024, 0, 152, 0),  -- Vacances
(35, 1, 2024, 0, 76, 0),    -- RTT
(35, 11, 2024, 0, 152, 0),  -- Vacances
(44, 1, 2024, 0, 152, 0),   -- RTT
(44, 11, 2024, 0, 160, 0);  -- Vacances

-- ============================================================
-- REUNIONS (Governance)
-- ============================================================

INSERT INTO meetings (id, meeting_date, description, agenda, type) VALUES
(1, '2018-01-30', 'Réunion CA mensuelle', '<ol><li>Engagement d''un kiné</li><li>Licenciement de XX</li><li>Prolongation du contrat</li></ol>', 'CA'),
(2, '2018-02-13', 'Réunion CA', '<ol><li>Engagement d''un kiné</li><li>Budget 2018</li></ol>', 'CA'),
(3, '2018-02-20', 'Réunion CA', '<ol><li>Suivi engagements</li><li>Planning vacances</li></ol>', 'CA'),
(4, '2018-02-27', 'Réunion CA', '<ol><li>Bilan trimestriel</li></ol>', 'CA');

SELECT setval('meetings_id_seq', 4);

INSERT INTO meeting_attendees (meeting_id, employee_id) VALUES
(1, 23), (1, 43), (1, 44),
(2, 43), (2, 44),
(3, 23), (3, 44),
(4, 23), (4, 43), (4, 44);

-- ============================================================
-- DEMANDES (Requests)
-- ============================================================

INSERT INTO requests (id, requestor_id, description, request_date, deadline, status, comment) VALUES
(1, 44, 'Récupération des heures supp', '2018-01-10', '2018-02-28', 'ACCEPTED', NULL),
(2, 32, 'Demande de congé sans solde', '2018-02-15', '2018-02-20', 'ACCEPTED', NULL),
(3, 31, 'Demande de congé suite à un mariage familial', '2018-02-07', '2018-02-28', 'ACCEPTED', NULL),
(4, 28, 'Demande des heures supp', '2018-02-28', '2018-03-05', 'ACCEPTED', NULL);

SELECT setval('requests_id_seq', 4);

-- ============================================================
-- DECISIONS
-- ============================================================

INSERT INTO decisions (id, description, decision_date, meeting_id) VALUES
(1, 'Engagement d''un kiné', '2018-02-17', NULL),
(2, 'Changement de contrat de XX CDD à CDI', NULL, 1),
(3, 'Les accueillantes non bachelières passeront du barème 1/43-1/55 à 1/55', '2018-09-01', 4);

SELECT setval('decisions_id_seq', 3);

INSERT INTO decision_makers (decision_id, employee_id) VALUES
(1, 44),
(2, 23), (2, 43), (2, 44),
(3, 23), (3, 43), (3, 44);

-- ============================================================
-- FIN DES DONNEES DE TEST
-- ============================================================
