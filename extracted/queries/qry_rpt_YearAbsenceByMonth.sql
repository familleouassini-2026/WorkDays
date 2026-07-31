-- Query: qry_rpt_YearAbsenceByMonth
-- Type: SELECT

SELECT tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, Year([AbsenceDate]) AS [Year], Month([AbsenceDate]) AS GroupOnMonth, MonthName([GroupOnMonth]) AS MonthName, [EmpLName] & ", " & [EmpFName] AS EmployeeName, tbl_Abs_AbsenceCodes.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID
GROUP BY tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, Month([AbsenceDate]), [EmpLName] & ", " & [EmpFName], tbl_Abs_AbsenceCodes.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime
HAVING (((tbl_YearCalendar.EmployeeID)=forms!frm_YearCalendar!cboEmployee) And ((Year([AbsenceDate]))=forms!frm_YearCalendar!cboYear))
ORDER BY tbl_YearCalendar.AbsenceDate;
