-- Query: qryVacationTaken
-- Type: SELECT

SELECT tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysTaken, Fix(Nz([SumOfAbsenceTime]*1440,0)) AS TotalMinutesTaken, (#12/30/1899#) AS [interval], Sum(tbl_YearCalendar.AbsenceDays) AS Totaldays, Sum(tbl_YearCalendar.AbsenceTime) AS SumOfAbsenceTime, [TotalMinutesTaken]/60 AS TotalHours, Fix([TotalHours]) AS TotalHoursFix, ([TotalHours]-[TotalHoursfix])*60 AS minutes, Fix([minutes]) AS minutesfixe, IIf([TimeType]="Jours","000:00",Right("0000" & [TotalHoursfix],4) & ":" & Right("0" & [minutesfixe],2)) AS TotalTakenInTimeFormat, tbl_Abs_AbsenceCodes.AbsenceCode
FROM tbl_Abs_AbsenceCodes RIGHT JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
GROUP BY tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, tbl_Abs_AbsenceCodes.AbsenceCode;
