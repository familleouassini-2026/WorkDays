-- Query: qry_RequestDropDownlist
-- Type: SELECT

SELECT tbl_Log_Requests.RequestId, [RequestDate] & "|" & [RequestDescription] & "|" & [ContactName] AS Expr1, [EmpFName] & " " & [EmpLName] AS ContactName
FROM tbl_Emp_Employees RIGHT JOIN tbl_Log_Requests ON tbl_Emp_Employees.EmployeeID = tbl_Log_Requests.RequestorID
ORDER BY tbl_Emp_Employees.EmpFName, tbl_Emp_Employees.EmpLName, tbl_Log_Requests.RequestDate;
