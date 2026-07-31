-- Query: qry_ActiveInactiveEmployees
-- Type: SELECT

SELECT tbl_Emp_Employees.EmployeeID, [EmpFName] & ", " & [EmpLName] AS EmployeeName, tbl_Emp_Employees.SecteurID, tbl_Emp_Employees.IsInactive, tbl_Emp_Employees.EmpDateOfHire
FROM tbl_Emp_Employees
WHERE (((tbl_Emp_Employees.IsInactive)=False))
ORDER BY [EmpFName] & ", " & [EmpLName];
