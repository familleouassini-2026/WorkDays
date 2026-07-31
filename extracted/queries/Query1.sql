-- Query: Query1
-- Type: SELECT

SELECT tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysTaken, Fix([SumOfAbsenceTime]*1440) AS TotalMinutesTaken, (#12/30/1899#) AS [interval], Sum(tbl_YearCalendar.AbsenceDays) AS Totaldays, Sum(tbl_YearCalendar.AbsenceTime) AS SumOfAbsenceTime, [SumOfAbsenceTime]*24 AS TotalHours, Fix([SumOfAbsenceTime]*24) AS TotalHoursFix, [totalminutestaken] Mod 60 AS minutes, IIf([TimeType]="Jours","",[TotalHoursFix] & ":" & Right("0" & [minutes],2)) AS TotalTakenInTimeFormat
FROM tbl_Abs_AbsenceCodes RIGHT JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
GROUP BY tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType
HAVING (((tbl_YearCalendar.EmployeeID)=45));
