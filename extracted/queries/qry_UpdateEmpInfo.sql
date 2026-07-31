-- Query: qry_UpdateEmpInfo
-- Type: SELECT

SELECT tbl_Emp_Employees.IsInactive, tbl_Emp_Employees.SecteurID, tbl_Emp_Employees.EmployeeID, tbl_Emp_Employees.EmpFName, tbl_Emp_Employees.EmpLName, tbl_Emp_Employees.EmpDateOfHire
FROM tbl_Emp_Employees
ORDER BY tbl_Emp_Employees.IsInactive DESC , tbl_Emp_Employees.SecteurID, tbl_Emp_Employees.EmpFName;
