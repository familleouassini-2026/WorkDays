-- Query: qry_subFormVacPDSDSummary_PSD_Left
-- Type: SELECT

SELECT [tbl_YearCalendar].EmployeeID, Count(Nz([AbsenceDate],0)) AS SumOfSick
FROM tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID=[tbl_YearCalendar].AbsenceID
WHERE (((DatePart("yyyy",[AbsenceDate]))=(Forms!frm_YearCalendar!cboYear)) And (([tbl_Abs_AbsenceCodes].AbsenceCode)="SD" Or ([tbl_Abs_AbsenceCodes].AbsenceCode)="SFML"))
GROUP BY [tbl_YearCalendar].EmployeeID;
