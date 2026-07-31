-- Query: qry_rpt_AbsenteeismPolicy
-- Type: SELECT

SELECT tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, [EmpLName] & ", " & [EmpFName] AS EmployeeName, [tbl_Abs_AbsenceCodes].AbsenceCode, [tbl_Abs_AbsenceCodes].AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime, DateAdd("m",6,[AbsenceDate]) AS Expires
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON [tbl_Abs_AbsenceCodes].AbsenceID=tbl_YearCalendar.AbsenceID) ON [tbl_Emp_Employees].EmployeeID=tbl_YearCalendar.EmployeeID
GROUP BY tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, [EmpLName] & ", " & [EmpFName], [tbl_Abs_AbsenceCodes].AbsenceCode, [tbl_Abs_AbsenceCodes].AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime
HAVING (((tbl_YearCalendar.EmployeeID)=forms!frm_YearCalendar!cboEmployee) And ((tbl_YearCalendar.AbsenceDate) Between DateAdd("m",-6,Date()) And Date()) And (([tbl_Abs_AbsenceCodes].AbsenceCode) Not In ("V","VFML","PD","FMLA","F","JD","ML","PC","SFML")))
ORDER BY tbl_YearCalendar.AbsenceDate;
