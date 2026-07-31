-- Query: qry_subFormVacPDSDSummary_Vac_Left
-- Type: SELECT

SELECT tbl_YearCalendar.EmployeeID, Sum(Nz([AbsenceTime],0)) AS SumOfVacation
FROM tbluAbsenceCodes INNER JOIN tbl_YearCalendar ON tbluAbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
WHERE (((DatePart("yyyy",[AbsenceDate]))=([Forms]![frm_YearCalendar]![cboYear])) AND ((tbluAbsenceCodes.AbsenceCode)="V" Or (tbluAbsenceCodes.AbsenceCode)="VFML"))
GROUP BY tbl_YearCalendar.EmployeeID;
