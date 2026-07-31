-- Query: qry_MaxSeniorityPerSector
-- Type: SELECT

SELECT Max(Years) AS maxY, Secteur
FROM tbl_Seniority
GROUP BY Secteur;
