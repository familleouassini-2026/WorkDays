-- Query: qry_FillTextBoxes
-- Type: SELECT

SELECT tbl_YearCalendar.AbsenceDate, [EmpLName] & ", " & [EmpFName] AS EmployeeName, tbl_Abs_AbsenceCodes.AbsenceCode, tbl_Emp_Employees.EmployeeID, tbl_Abs_AbsenceCodes.AbsenceColorCode, tbl_Abs_AbsenceCodes.AbsenceTextColorCode, tbl_Abs_AbsenceCodes.AbsenceColorTag, tbl_YearCalendar.AbsenceTime, tbl_Abs_AbsenceCodes.TimeType, tbl_YearCalendar.AbsenceDays
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID;
