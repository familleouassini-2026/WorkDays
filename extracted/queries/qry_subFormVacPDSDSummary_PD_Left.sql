-- Query: qry_subFormVacPDSDSummary_PD_Left
-- Type: SELECT

SELECT tbl_YearCalendar.EmployeeID, Count(Nz([AbsenceDate],0)) AS SumOfPersonal
FROM tbluAbsenceCodes INNER JOIN tbl_YearCalendar ON tbluAbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
WHERE (((DatePart("yyyy",[AbsenceDate]))=([Forms]![frm_YearCalendar]![cboYear])) AND ((tbluAbsenceCodes.AbsenceCode)="PD"))
GROUP BY tbl_YearCalendar.EmployeeID;
