-- Query: qry_NumberOfIncidents
-- Type: SELECT

SELECT Count([AbsenceDate]) AS NumberOfIncidents
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID
WHERE (((tbl_YearCalendar.EmployeeID)=[forms]![frm_YearCalendar]![cboEmployee]) AND ((tbl_YearCalendar.AbsenceDate) Between DateAdd("m",-6,Date()) And Date()) AND ((tbl_Abs_AbsenceCodes.AbsenceCode) Not In ("V","VFML","PD","FMLA","F","JD","ML","PC","SFML")));
