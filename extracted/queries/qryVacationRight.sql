-- Query: qryVacationRight
-- Type: SELECT

SELECT tbl_VacationRight.VacationYear, tbl_VacationRight.EmployeeName, tbl_VacationRight.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysRight, Sum(tbl_VacationRight.Days) AS TotalDays, Nz([TotalHoursRightInMinutes],0)+Nz([TotalMinutes],0) AS TotalHoursAndMinutesRight, Sum(Nz([Hours],0)*60) AS TotalHoursRightInMinutes, Sum(tbl_VacationRight.Minutes) AS TotalMinutes, Sum(tbl_VacationRight.hours) AS TotalHours, IIf([TimeType]="Jours","0000:00",Right("0000" & [TotalHours],4) & ":" & Right("00" & [TotalMinutes],2)) AS TotalRightInTimeFormat
FROM tbl_Abs_AbsenceCodes INNER JOIN tbl_VacationRight ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_VacationRight.AbsenceCode
GROUP BY tbl_VacationRight.VacationYear, tbl_VacationRight.EmployeeName, tbl_VacationRight.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, tbl_VacationRight.VacationYear, tbl_Abs_AbsenceCodes.TimeType, tbl_VacationRight.AbsenceCode
ORDER BY tbl_VacationRight.VacationYear DESC , tbl_Abs_AbsenceCodes.TimeType, tbl_VacationRight.AbsenceCode;
