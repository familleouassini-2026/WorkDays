-- Query: qry_Sec_indexCal
-- Type: SELECT

SELECT tbl_Seniority.*, DProduct("IndexationNumber","tbl_Cmn_Indexation") AS [Index], DProduct("IndexationNumber","tbl_Sec_Indexation","SecteurID =" & [tbl_Seniority]!Secteur) AS SIncrease, [SIncrease]*[Index] AS SectorIncrease, [SectorIncrease]*[BaseSalary] AS CurrentSectorSalary
FROM tbl_Index, tbl_Sec_Secteurs INNER JOIN tbl_Seniority ON tbl_Sec_Secteurs.SecteurID = tbl_Seniority.Secteur;
