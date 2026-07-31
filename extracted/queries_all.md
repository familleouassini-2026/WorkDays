# WorkDays - All Queries (SQL)

**Extracted:** 2026-07-30 01:47:22


---
## Contacts Extended

**Type:** SELECT

```sql
SELECT IIf(IsNull([EmpLName]),IIf(IsNull([EmpFName]),"",[EmpFName]),IIf(IsNull([EmpFName]),[EmpLName],[EmpLName] & ", " & [EmpFName])) AS [File As], IIf(IsNull([EmpLName]),IIf(IsNull([EmpFName]),"",[EmpFName]),IIf(IsNull([EmpFName]),[EmpLName],[EmpFName] & " " & [EmpLName])) AS [Contact Name], tbl_Emp_Employees.*, DateSerial(Year([EmpDateOfHire])-1,Month([EmpDateOfHire]),Day([EmpDateOfHire])) AS OneYearBeforeHiring, Nz([GrantedSeniorityDate],[EmpDateOfHire]) AS DateSenioritySart, DateSerial(Year(Nz([DateSenioritySart],0)),Month(Nz([DateSenioritySart],0)),1) AS DateSenioritySartBMonth, DateSerial(Year(Date())-1,Month(Nz([DateSenioritySart],[DateSenioritySart])),1) AS DateOfSeniorityChangeLastYear, DateSerial(Year(Date()),Month(Nz([DateSenioritySart],[DateSenioritySart])),1) AS DateOfSeniorityChange, DateSerial(Year(Date()),Month(Nz([DateSenioritySart],[DateSenioritySart]))-1,15) AS DateOfSeniorityAlert, IIf([SectorialChanging]<>0,[DateOfSeniorityAlert],"") AS RealAlert, Round(DateDiff("m",[DateSenioritySart],[CurrentDate])/12,2) AS AcquiredSeniorityCurrent, Round(DateDiff("yyyy",[DateSenioritySart],DateSerial(Year(Date()),Month([DateSenioritySart]),Day([DateSenioritySart]))),2) AS AcquiredSeniorityThisYear, IIf([AcquiredSeniorityThisYear]-1<0,0,[AcquiredSeniorityThisYear]-1) AS AcquiredSeniorityLastYear, DateDiff("m",[GrantedSeniorityDate],[EmpDateOfHire])/12 AS GrantedSeniorityCal, CInt(Nz(DMax("Years","tbl_Seniority","Secteur =" & [tbl_Emp_Employees]![SecteurID]),0)) AS MaxSeniorityFromBareme, IIf([AcquiredSeniorityCurrent]>[MaxSeniorityFromBareme],[MaxSeniorityFromBareme],[AcquiredSeniorityCurrent]) AS TotalSeniorityAllowedCurrent, IIf([AcquiredSeniorityThisYear]>[MaxSeniorityFromBareme],[MaxSeniorityFromBareme],[AcquiredSeniorityThisYear]) AS TotalSeniorityAllowedThisYear, IIf(Nz([AcquiredSeniorityLastYear],0)>Nz([MaxSeniorityFromBareme],0),Nz([MaxSeniorityFromBareme],0),Nz([AcquiredSeniorityLastYear],0)) AS TotalSeniorityAllowedLastYear, DLookUp("Secteur","tbl_Sec_Secteurs","SecteurID =" & [secteurID]) AS SecteurName, DLookUp("NoRTT","tbl_Sec_Secteurs","SecteurID =" & [secteurID]) AS NoRTT, Nz(Round(DLookUp("CurrentSectorSalary","qry_Sec_indexCal","Secteur =" & [SecteurID] & " and  [Years] =" & Fix([TotalSeniorityAllowedCurrent])),2),0) AS SectorialSalaryCurrent, Nz(Round(DLookUp("CurrentSectorSalary","qry_Sec_indexCal","Secteur =" & [SecteurID] & " and  [Years] =" & Fix([TotalSeniorityAllowedThisYear])),2),0) AS SectorialSalaryThisYear, Nz(Round(DLookUp("CurrentSectorSalary","qry_Sec_indexCal","Secteur =" & [SecteurID] & " and  [Years] =" & Fix([TotalSeniorityAllowedLastYear])),2),0) AS SectorialSalaryLastYear, IIf([SectorialChanging]=0,"","Attention: augmentation de salaire cette année à notifier avant le: " & [RealAlert]) AS Remarque2, IIf([SectorialChanging]=0,"","Attention: augmentation de salaire cette année") AS Remarque, [SectorialSalaryThisYear]-[SectorialSalaryLastYear] AS SectorialChanging, Nz(DSum("IndexationNumber","tbl_Emp_Indexation","EmployeeID =" & [EmployeeID]),0) AS TotalEmployeeIncrease, Round(Nz(DSum("IndexationNumber","tbl_Emp_Indexation","EmployeeID =" & [EmployeeID]),0)+[SectorialSalaryLastYear],2) AS EmployeeSalaryLastYear, Round(Nz(DSum("IndexationNumber","tbl_Emp_Indexation","EmployeeID =" & [EmployeeID]),0)+[SectorialSalaryCurrent],2) AS EmployeeSalaryCurrent, Round(Nz(DSum("IndexationNumber","tbl_Emp_Indexation","EmployeeID =" & [EmployeeID]),0)+[SectorialSalaryThisYear],2) AS EmployeeSalaryThisYear, Date() AS CurrentDate, DateDiff("m",Nz([EmpDateOfBirth],0),[CurrentDate])/12 AS Agewithdecimals, Fix([Agewithdecimals]) AS Age, CInt(([Agewithdecimals]-[Age])*12) AS AgeMonthsPortion, Month(Nz([EmpDateOfBirth],0)) AS MOB, DateSerial(Year(Date()),Month(Nz([empdateofbirth],0)),Day(Nz([empdateofbirth],0))) AS ThisYearBirthday, IIf([ThisYearbirthday]<Date(),DateAdd("yyyy",1,[ThisYearbirthday]),[ThisYearbirthday]) AS NextBirthday, GetPercenttime([EmployeeID]) AS TimePercent
FROM tbl_Emp_Employees
ORDER BY IIf(IsNull([EmpLName]),IIf(IsNull([EmpFName]),"",[EmpFName]),IIf(IsNull([EmpFName]),[EmpLName],[EmpLName] & ", " & [EmpFName])), IIf(IsNull([EmpLName]),IIf(IsNull([EmpFName]),"",[EmpFName]),IIf(IsNull([EmpFName]),[EmpLName],[EmpFName] & " " & [EmpLName]));

```


---
## qry_ActiveInactiveEmployees

**Type:** SELECT

```sql
SELECT tbl_Emp_Employees.EmployeeID, [EmpFName] & ", " & [EmpLName] AS EmployeeName, tbl_Emp_Employees.SecteurID, tbl_Emp_Employees.IsInactive, tbl_Emp_Employees.EmpDateOfHire
FROM tbl_Emp_Employees
WHERE (((tbl_Emp_Employees.IsInactive)=False))
ORDER BY [EmpFName] & ", " & [EmpLName];

```


---
## qry_Alerts

**Type:** SELECT

```sql
SELECT tblAlerts.*, DateAdd("d",[AlertDuration],[AlertDate]) AS AlertEnd
FROM tblAlerts;

```


---
## qry_FillHolidays

**Type:** SELECT

```sql
SELECT tbl_Abs_Holidays.HolidayID, tbl_Abs_Holidays.HolidayDate
FROM tbl_Abs_Holidays;

```


---
## qry_FillTextBoxes

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.AbsenceDate, [EmpLName] & ", " & [EmpFName] AS EmployeeName, tbl_Abs_AbsenceCodes.AbsenceCode, tbl_Emp_Employees.EmployeeID, tbl_Abs_AbsenceCodes.AbsenceColorCode, tbl_Abs_AbsenceCodes.AbsenceTextColorCode, tbl_Abs_AbsenceCodes.AbsenceColorTag, tbl_YearCalendar.AbsenceTime, tbl_Abs_AbsenceCodes.TimeType, tbl_YearCalendar.AbsenceDays
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID;

```


---
## qry_MaxSeniorityPerSector

**Type:** SELECT

```sql
SELECT Max(Years) AS maxY, Secteur
FROM tbl_Seniority
GROUP BY Secteur;

```


---
## qry_NumberOfIncidents

**Type:** SELECT

```sql
SELECT Count([AbsenceDate]) AS NumberOfIncidents
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID
WHERE (((tbl_YearCalendar.EmployeeID)=[forms]![frm_YearCalendar]![cboEmployee]) AND ((tbl_YearCalendar.AbsenceDate) Between DateAdd("m",-6,Date()) And Date()) AND ((tbl_Abs_AbsenceCodes.AbsenceCode) Not In ("V","VFML","PD","FMLA","F","JD","ML","PC","SFML")));

```


---
## qry_RequestDropDownlist

**Type:** SELECT

```sql
SELECT tbl_Log_Requests.RequestId, [RequestDate] & "|" & [RequestDescription] & "|" & [ContactName] AS Expr1, [EmpFName] & " " & [EmpLName] AS ContactName
FROM tbl_Emp_Employees RIGHT JOIN tbl_Log_Requests ON tbl_Emp_Employees.EmployeeID = tbl_Log_Requests.RequestorID
ORDER BY tbl_Emp_Employees.EmpFName, tbl_Emp_Employees.EmpLName, tbl_Log_Requests.RequestDate;

```


---
## qry_rpt_AbsencesForYear

**Type:** SELECT

```sql
SELECT [tbl_YearCalendar].EmployeeID, [tbl_YearCalendar].AbsenceDate, Year([AbsenceDate]) AS [Year], [EmpLName] & ", " & [EmpFName] AS EmployeeName, [tbl_Abs_AbsenceCodes].AbsenceCode, [tbl_Abs_AbsenceCodes].AbsenceCodeDesc, [tbl_YearCalendar].AbsenceReason, [tbl_YearCalendar].AbsenceTime
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID=[tbl_YearCalendar].AbsenceID) ON tbl_Emp_Employees.EmployeeID=[tbl_YearCalendar].EmployeeID
GROUP BY [tbl_YearCalendar].EmployeeID, [tbl_YearCalendar].AbsenceDate, [EmpLName] & ", " & [EmpFName], [tbl_Abs_AbsenceCodes].AbsenceCode, [tbl_Abs_AbsenceCodes].AbsenceCodeDesc, [tbl_YearCalendar].AbsenceReason, [tbl_YearCalendar].AbsenceTime
HAVING ((([tbl_YearCalendar].EmployeeID)=forms!frm_YearCalendar!cboEmployee) And ((Year([AbsenceDate]))=forms!frm_YearCalendar!cboYear))
ORDER BY [tbl_YearCalendar].AbsenceDate;

```


---
## qry_rpt_AbsenteeismPolicy

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, [EmpLName] & ", " & [EmpFName] AS EmployeeName, [tbl_Abs_AbsenceCodes].AbsenceCode, [tbl_Abs_AbsenceCodes].AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime, DateAdd("m",6,[AbsenceDate]) AS Expires
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON [tbl_Abs_AbsenceCodes].AbsenceID=tbl_YearCalendar.AbsenceID) ON [tbl_Emp_Employees].EmployeeID=tbl_YearCalendar.EmployeeID
GROUP BY tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, [EmpLName] & ", " & [EmpFName], [tbl_Abs_AbsenceCodes].AbsenceCode, [tbl_Abs_AbsenceCodes].AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime
HAVING (((tbl_YearCalendar.EmployeeID)=forms!frm_YearCalendar!cboEmployee) And ((tbl_YearCalendar.AbsenceDate) Between DateAdd("m",-6,Date()) And Date()) And (([tbl_Abs_AbsenceCodes].AbsenceCode) Not In ("V","VFML","PD","FMLA","F","JD","ML","PC","SFML")))
ORDER BY tbl_YearCalendar.AbsenceDate;

```


---
## qry_rpt_YearAbsenceByMonth

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, Year([AbsenceDate]) AS [Year], Month([AbsenceDate]) AS GroupOnMonth, MonthName([GroupOnMonth]) AS MonthName, [EmpLName] & ", " & [EmpFName] AS EmployeeName, tbl_Abs_AbsenceCodes.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID
GROUP BY tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceDate, Month([AbsenceDate]), [EmpLName] & ", " & [EmpFName], tbl_Abs_AbsenceCodes.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_YearCalendar.AbsenceReason, tbl_YearCalendar.AbsenceTime
HAVING (((tbl_YearCalendar.EmployeeID)=forms!frm_YearCalendar!cboEmployee) And ((Year([AbsenceDate]))=forms!frm_YearCalendar!cboYear))
ORDER BY tbl_YearCalendar.AbsenceDate;

```


---
## qry_RTT

**Type:** SELECT

```sql
SELECT tbl_RTT.*
FROM tbl_RTT;

```


---
## Qry_RTTCalc

**Type:** SELECT

```sql
SELECT [Contacts Extended].EmpDateOfBirth, GetTimePercentFullTime([ActiveTimesheet]) AS PercentWorkTime, GetActiveTimeSheetIdPerEmployee([EmployeeID]) AS ActiveTimesheet, [Contacts Extended].CurrentDate, [Contacts Extended].Agewithdecimals, [Contacts Extended].Age, IIf(Year(Now())-Year([EmpDateOfBirth])>=Nz(DMin("RTTStart","qry_RTT","SecteurID =" & [SecteurID]),0),True,False) AS IsRTTStarted, [Contacts Extended].AgeMonthsPortion, [Contacts Extended].ThisYearBirthday, Year(Now())-Year([EmpDateOfBirth]) AS YearsOldAtBithDayThisYear, [Contacts Extended].SecteurID, 12 AS MonthsInYear, Month([ThisYearBirthday])-1 AS FirstPortion, [MonthsInYear]-[FirstPortion] AS SecondPortion, [FirstPortion]/[MonthsInYear] AS [FirstPortion%], [SecondPortion]/[MonthsInYear] AS [SecondPortion%], [YearsOldAtBithDayThisYear]-1 AS IntYearsOldLastYear, Nz(DLookUp("HouresPerYear","qry_RTT","SecteurID =" & [SecteurID] & " and  RTTStart =" & [YearsOldAtBithDayThisYear]),0) AS HrPerYearThisYear, Round([TotalRTT]*[PercentWorkTime],2) AS TotalRTTBasedInWorkedTime, Round([RTTThisYear]+[RTTLastYear],2) AS TotalRTT, [SecondPortion%]*[HrPerYearThisYear] AS RTTThisYear, [FirstPortion%]*[HrPerYearLastYear] AS RTTLastYear, Nz(DMin("RTTStart","qry_RTT","SecteurID =" & [SecteurID]),0) AS MinRTTAge, Nz(DLookUp("HouresPerYear","qry_RTT","SecteurID =" & [SecteurID] & " and  RTTStart =" & [IntYearsOldLastYear]),0) AS HrPerYearLastYear, [Contacts Extended].[Contact Name], [Contacts Extended].SecteurName, [Contacts Extended].EmployeeID, [Contacts Extended].IsInactive, [Contacts Extended].NoRTT
FROM [Contacts Extended]
WHERE (((IIf(Year(Now())-Year([EmpDateOfBirth])>=Nz(DMin("RTTStart","qry_RTT","SecteurID =" & [SecteurID]),0),True,False))=-1) AND (([Contacts Extended].IsInactive)=False) AND (([Contacts Extended].NoRTT)="0"));

```


---
## qry_Sec_indexCal

**Type:** SELECT

```sql
SELECT tbl_Seniority.*, DProduct("IndexationNumber","tbl_Cmn_Indexation") AS [Index], DProduct("IndexationNumber","tbl_Sec_Indexation","SecteurID =" & [tbl_Seniority]!Secteur) AS SIncrease, [SIncrease]*[Index] AS SectorIncrease, [SectorIncrease]*[BaseSalary] AS CurrentSectorSalary
FROM tbl_Index, tbl_Sec_Secteurs INNER JOIN tbl_Seniority ON tbl_Sec_Secteurs.SecteurID = tbl_Seniority.Secteur;

```


---
## qry_subFormVacPDSDSummary

**Type:** SELECT

```sql
SELECT [tbl_Emp_Employees].EmployeeID, [tbl_Emp_Employees].EmpDateOfHire, ([Forms]![frm_YearCalendar]![cboYear])-Year([EmpDateOfHire]) AS YearsOfService, tbluBoughtVacation.BoughtVac, IIf([YearsOfService]<=0,0,IIf([YearsOfService]<=1,1,IIf([YearsOfService]<=7,2,IIf([YearsOfService]<=14,3,IIf([YearsOfService]<=24,4,IIf([YearsOfService]>=25,5))))))+IIf([BoughtVac]=True,1,0) AS TotalVacWeeks, 40*Nz([TotalVacWeeks],0) AS TotalVacHours, Nz([SumOfVacation],0) AS TotalVacHoursUsed, [TotalVacHours]-Nz([SumOfVacation],0) AS VacHoursLeft, tbluBoughtVacation.BoughtYear, 3 AS TotallPersonalDays, 3-Nz([SumOfSick],0) AS PersonalDaysLeft, 3 AS TotalSickDays, 3-Nz([SumOfSick],0) AS SickDaysLeft
FROM (((tbl_Emp_Employees LEFT JOIN qry_subFormVacPDSDSummary_PSD_Left ON [tbl_Emp_Employees].EmployeeID=qry_subFormVacPDSDSummary_PSD_Left.EmployeeID) LEFT JOIN qry_subFormVacPDSDSummary_Vac_Left ON [tbl_Emp_Employees].EmployeeID=qry_subFormVacPDSDSummary_Vac_Left.EmployeeID) LEFT JOIN qry_subFormVacPDSDSummary_PD_Left ON [tbl_Emp_Employees].EmployeeID=qry_subFormVacPDSDSummary_PD_Left.EmployeeID) INNER JOIN tbluBoughtVacation ON [tbl_Emp_Employees].EmployeeID=tbluBoughtVacation.EmployeeID
WHERE (((Year([BoughtYear]))=([Forms]![frm_YearCalendar]![cboYear])))
GROUP BY [tbl_Emp_Employees].EmployeeID, [tbl_Emp_Employees].EmpDateOfHire, tbluBoughtVacation.BoughtVac, Nz([SumOfVacation],0), tbluBoughtVacation.BoughtYear, qry_subFormVacPDSDSummary_PD_Left.[SumOfSick], qry_subFormVacPDSDSummary_PSD_Left.SumOfSick;

```


---
## qry_subFormVacPDSDSummary_PD_Left

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.EmployeeID, Count(Nz([AbsenceDate],0)) AS SumOfPersonal
FROM tbluAbsenceCodes INNER JOIN tbl_YearCalendar ON tbluAbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
WHERE (((DatePart("yyyy",[AbsenceDate]))=([Forms]![frm_YearCalendar]![cboYear])) AND ((tbluAbsenceCodes.AbsenceCode)="PD"))
GROUP BY tbl_YearCalendar.EmployeeID;

```


---
## qry_subFormVacPDSDSummary_PSD_Left

**Type:** SELECT

```sql
SELECT [tbl_YearCalendar].EmployeeID, Count(Nz([AbsenceDate],0)) AS SumOfSick
FROM tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID=[tbl_YearCalendar].AbsenceID
WHERE (((DatePart("yyyy",[AbsenceDate]))=(Forms!frm_YearCalendar!cboYear)) And (([tbl_Abs_AbsenceCodes].AbsenceCode)="SD" Or ([tbl_Abs_AbsenceCodes].AbsenceCode)="SFML"))
GROUP BY [tbl_YearCalendar].EmployeeID;

```


---
## qry_subFormVacPDSDSummary_Vac_Left

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.EmployeeID, Sum(Nz([AbsenceTime],0)) AS SumOfVacation
FROM tbluAbsenceCodes INNER JOIN tbl_YearCalendar ON tbluAbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
WHERE (((DatePart("yyyy",[AbsenceDate]))=([Forms]![frm_YearCalendar]![cboYear])) AND ((tbluAbsenceCodes.AbsenceCode)="V" Or (tbluAbsenceCodes.AbsenceCode)="VFML"))
GROUP BY tbl_YearCalendar.EmployeeID;

```


---
## qry_Timesheet

**Type:** SELECT

```sql
SELECT tbl_TimeSheet.*, GetTimeSheetTotal([TimeSheetId]) AS TotalHours, GetFullTimeDiff([TimeSheetId]) AS DifflHours, GetTimePercentFullTime([TimeSheetId]) AS TimePercentFullTime
FROM tbl_TimeSheet
ORDER BY tbl_TimeSheet.Active;

```


---
## qry_tst_TestCaseSteps

**Type:** SELECT

```sql
SELECT tbl_tst_TestCaseSteps.*, tbl_tst_TestCases.Sequence, tbl_tst_TestCases.[Test Objective], tbl_tst_TestCaseStepsPrintScreen.PrintScreen
FROM tbl_tst_TestCases RIGHT JOIN (tbl_tst_TestCaseStepsPrintScreen RIGHT JOIN tbl_tst_TestCaseSteps ON tbl_tst_TestCaseStepsPrintScreen.TestCaseStepPrintScreenID = tbl_tst_TestCaseSteps.TestCaseStepPrintScreenID) ON tbl_tst_TestCases.TestCaseID = tbl_tst_TestCaseSteps.TestCaseID
ORDER BY tbl_tst_TestCases.Sequence, tbl_tst_TestCaseSteps.Step;

```


---
## qry_UpdateEmpInfo

**Type:** SELECT

```sql
SELECT tbl_Emp_Employees.IsInactive, tbl_Emp_Employees.SecteurID, tbl_Emp_Employees.EmployeeID, tbl_Emp_Employees.EmpFName, tbl_Emp_Employees.EmpLName, tbl_Emp_Employees.EmpDateOfHire
FROM tbl_Emp_Employees
ORDER BY tbl_Emp_Employees.IsInactive DESC , tbl_Emp_Employees.SecteurID, tbl_Emp_Employees.EmpFName;

```


---
## qry_UpdateEmpInfoBoughtVac

**Type:** SELECT

```sql
SELECT tbluBoughtVacation.EmployeeID, tbluBoughtVacation.BoughtYear, tbluBoughtVacation.BoughtVac
FROM tbluBoughtVacation;

```


---
## qryVacationRight

**Type:** SELECT

```sql
SELECT tbl_VacationRight.VacationYear, tbl_VacationRight.EmployeeName, tbl_VacationRight.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysRight, Sum(tbl_VacationRight.Days) AS TotalDays, Nz([TotalHoursRightInMinutes],0)+Nz([TotalMinutes],0) AS TotalHoursAndMinutesRight, Sum(Nz([Hours],0)*60) AS TotalHoursRightInMinutes, Sum(tbl_VacationRight.Minutes) AS TotalMinutes, Sum(tbl_VacationRight.hours) AS TotalHours, IIf([TimeType]="Jours","0000:00",Right("0000" & [TotalHours],4) & ":" & Right("00" & [TotalMinutes],2)) AS TotalRightInTimeFormat
FROM tbl_Abs_AbsenceCodes INNER JOIN tbl_VacationRight ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_VacationRight.AbsenceCode
GROUP BY tbl_VacationRight.VacationYear, tbl_VacationRight.EmployeeName, tbl_VacationRight.AbsenceCode, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, tbl_VacationRight.VacationYear, tbl_Abs_AbsenceCodes.TimeType, tbl_VacationRight.AbsenceCode
ORDER BY tbl_VacationRight.VacationYear DESC , tbl_Abs_AbsenceCodes.TimeType, tbl_VacationRight.AbsenceCode;

```


---
## qryVacationRightTaken

**Type:** SELECT

```sql
SELECT t.yearVacation, t.EmployeeID, t.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, qryVacationRight.TotalHoursAndMinutesRight, qryVacationTaken.TotalMinutesTaken, IIf([TotalTakenInTimeFormat]="000:00","",[TotalTakenInTimeFormat]) AS TotalTakenInTimeFormatnz, IIf([TotalRightInTimeFormat]="000:00","",[TotalRightInTimeFormat]) AS TotalRightInTimeFormatnz, [TotalHoursAndMinutesRight]-[TotalMinutesTaken] AS DiffinMinutes, qryVacationTaken.TotalDaysTaken, qryVacationRight.TotalDaysRight, [TotalDaysRight]-[TotalDaysTaken] AS DiffInDays, qryVacationTaken.AbsenceCode
FROM (((SELECT EmployeeID, AbsenceID, yearVacation  FROM tbl_YearCalendar    UNION ALL    SELECT Employeename, Absencecode, Vacationyear  FROM tbl_VacationRight   )  AS t LEFT JOIN tbl_Abs_AbsenceCodes ON t.AbsenceID = tbl_Abs_AbsenceCodes.AbsenceID) LEFT JOIN qryVacationRight ON (t.EmployeeID = qryVacationRight.EmployeeName) AND (t.AbsenceID = qryVacationRight.AbsenceCode) AND (t.yearVacation = qryVacationRight.VacationYear)) LEFT JOIN qryVacationTaken ON (t.EmployeeID = qryVacationTaken.EmployeeID) AND (t.AbsenceID = qryVacationTaken.AbsenceID) AND (t.yearVacation = qryVacationTaken.YearVacation)
GROUP BY t.yearVacation, t.EmployeeID, t.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, qryVacationRight.TotalHoursAndMinutesRight, qryVacationTaken.TotalMinutesTaken, IIf([TotalTakenInTimeFormat]="000:00","",[TotalTakenInTimeFormat]), IIf([TotalRightInTimeFormat]="000:00","",[TotalRightInTimeFormat]), [TotalHoursAndMinutesRight]-[TotalMinutesTaken], qryVacationTaken.TotalDaysTaken, qryVacationRight.TotalDaysRight, [TotalDaysRight]-[TotalDaysTaken], qryVacationTaken.AbsenceCode;

```


---
## qryVacationRightTaken2

**Type:** SELECT

```sql
SELECT qryVacationRightTaken.*, Abs([DiffinMinutes]) Mod 60 AS DiffinMinutesMinFraction, Fix(Abs([DiffinMinutes])/60) AS DiffinMinutesInHoursFraction, IIf([DiffinMinutes]<0,"-","") & Right("0000" & [DiffinMinutesInHoursFraction],4) & ":" & Right("00" & [DiffinMinutesMinFraction],2) AS DiffIntimeFormat, IIf([TimeType]="H/M","",[TotalDaysTaken]) AS TotalDaysTakennz, IIf([TimeType]="H/M","",[TotalDaysRight]) AS TotalDaysRightnz, IIf([TimeType]="H/M","",[DiffInDays]) AS DiffInDaysnz, IIf([TimeType]="Jours","",[DiffIntimeFormat]) AS DiffIntimeFormatnz
FROM qryVacationRightTaken;

```


---
## qryVacationRightTaken2WithParam

**Type:** SELECT

```sql
SELECT qryVacationRightTaken.*, Abs([DiffinMinutes]) Mod 60 AS DiffinMinutesMinFraction, Fix(Abs([DiffinMinutes])/60) AS DiffinMinutesInHoursFraction, IIf([DiffinMinutes]<0,"-","") & Right("000" & [DiffinMinutesInHoursFraction],3) & ":" & Right("00" & [DiffinMinutesMinFraction],2) AS DiffIntimeFormat, IIf([TimeType]="H/M","",[TotalDaysTaken]) AS TotalDaysTakennz, IIf([TimeType]="H/M","",[TotalDaysRight]) AS TotalDaysRightnz, IIf([TimeType]="H/M","",[DiffInDays]) AS DiffInDaysnz, IIf([TimeType]="Jours","",[DiffIntimeFormat]) AS DiffIntimeFormatnz, qryVacationRightTaken.AbsenceCode
FROM qryVacationRightTaken;

```


---
## qryVacationTaken

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysTaken, Fix(Nz([SumOfAbsenceTime]*1440,0)) AS TotalMinutesTaken, (#12/30/1899#) AS [interval], Sum(tbl_YearCalendar.AbsenceDays) AS Totaldays, Sum(tbl_YearCalendar.AbsenceTime) AS SumOfAbsenceTime, [TotalMinutesTaken]/60 AS TotalHours, Fix([TotalHours]) AS TotalHoursFix, ([TotalHours]-[TotalHoursfix])*60 AS minutes, Fix([minutes]) AS minutesfixe, IIf([TimeType]="Jours","000:00",Right("0000" & [TotalHoursfix],4) & ":" & Right("0" & [minutesfixe],2)) AS TotalTakenInTimeFormat, tbl_Abs_AbsenceCodes.AbsenceCode
FROM tbl_Abs_AbsenceCodes RIGHT JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
GROUP BY tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, tbl_Abs_AbsenceCodes.AbsenceCode;

```


---
## qryVacationTakenParam

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysTaken, Val(Nz([SumOfAbsenceTime]*1440,0)) AS TotalMinutesTaken, (#12/30/1899#) AS [interval], Sum(tbl_YearCalendar.AbsenceDays) AS Totaldays, Sum(tbl_YearCalendar.AbsenceTime) AS SumOfAbsenceTime, [SumOfAbsenceTime]*24 AS TotalHours, Fix([SumOfAbsenceTime]*24) AS TotalHoursFix, (Nz([SumOfAbsenceTime]*1440,0)) Mod 60 AS minutes, IIf([TimeType]="Jours","000:00",Right("0000" & [TotalHoursFix],4) & ":" & Right("0" & [minutes],2)) AS TotalTakenInTimeFormat, tbl_Abs_AbsenceCodes.AbsenceCode, Month([AbsenceDate]) AS AbsenceMonth, MonthName(Month([AbsenceDate])) AS AbsenceMonthName, [EmpLName] & " " & [EmpFName] AS EmpName, tbl_Emp_Employees.[E-mail Address]
FROM tbl_Emp_Employees INNER JOIN (tbl_Abs_AbsenceCodes RIGHT JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID) ON tbl_Emp_Employees.EmployeeID = tbl_YearCalendar.EmployeeID
GROUP BY tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, tbl_Abs_AbsenceCodes.AbsenceCode, Month([AbsenceDate]), MonthName(Month([AbsenceDate])), [EmpLName] & " " & [EmpFName], tbl_Emp_Employees.[E-mail Address]
HAVING (((tbl_YearCalendar.YearVacation)=forms!frm_YearCalendar!cboYear) And ((tbl_YearCalendar.EmployeeID)=forms!frm_YearCalendar!cboEmployee));

```


---
## Query1

**Type:** SELECT

```sql
SELECT tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType, IIf([TimeType]="H/M",0,Nz(Round([totaldays],2),0)) AS TotalDaysTaken, Fix([SumOfAbsenceTime]*1440) AS TotalMinutesTaken, (#12/30/1899#) AS [interval], Sum(tbl_YearCalendar.AbsenceDays) AS Totaldays, Sum(tbl_YearCalendar.AbsenceTime) AS SumOfAbsenceTime, [SumOfAbsenceTime]*24 AS TotalHours, Fix([SumOfAbsenceTime]*24) AS TotalHoursFix, [totalminutestaken] Mod 60 AS minutes, IIf([TimeType]="Jours","",[TotalHoursFix] & ":" & Right("0" & [minutes],2)) AS TotalTakenInTimeFormat
FROM tbl_Abs_AbsenceCodes RIGHT JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID
GROUP BY tbl_YearCalendar.YearVacation, tbl_YearCalendar.EmployeeID, tbl_YearCalendar.AbsenceID, tbl_Abs_AbsenceCodes.AbsenceCodeDesc, tbl_Abs_AbsenceCodes.TimeType
HAVING (((tbl_YearCalendar.EmployeeID)=45));

```


---
## Query2

**Type:** SELECT

```sql
SELECT tbl_Emp_Indexation.IndexationNumber AS Expr1
FROM tbl_Emp_Indexation
WHERE (((tbl_Emp_Indexation.EmployeeID)=3));

```


---
## Requête1

**Type:** SELECT

```sql
SELECT TimeSheetId
FROM tbl_TimeSheet
WHERE EmployeeID=43 and Active =true;

```


---
## xqryRTTCurrentYear_2

**Type:** UNION

```sql
SELECT [Contact Name], EmpDateOfBirth, SecteurName , Age, [AgeMonthsPortion], NextBirthday, KAge1 as KAge, Kdate1 as kdate, Kdate1Alert as KdateAlert, Year([Kdate1]) AS Expr,KAge1 as KAgeA,KAge2 as KAgeB,KAge3 as KAgeC, Kdate1 as kdateA,Kdate2 as kdateB, Kdate3 as kdateC

FROM [Contacts Extended]
WHERE Year([Kdate1]) = [Forms]![frm_1_NavigationForm]![NavigationSubform].[Form]![CurrentFilter]

UNION ALL

SELECT [Contact Name], EmpDateOfBirth, SecteurName , Age, [AgeMonthsPortion], NextBirthday, KAge2 as KAge, Kdate2 as kdate, Kdate2Alert as KdateAlert, Year([Kdate2]) AS Expr,KAge1 as KAgeA,KAge2 as KAgeB,KAge3 as KAgeC,Kdate1 as kdateA,Kdate2 as kdateB, Kdate3 as kdateC

FROM [Contacts Extended]
WHERE Year([Kdate2]) = [Forms]![frm_1_NavigationForm]![NavigationSubform].[Form]![CurrentFilter]

UNION ALL SELECT [Contact Name], EmpDateOfBirth, SecteurName , Age, [AgeMonthsPortion], NextBirthday, KAge3 as KAge, Kdate3 as kdate, Kdate3Alert as KdateAlert , Year([Kdate3]) AS Expr,KAge1 as KAgeA,KAge2 as KAgeB,KAge3 as KAgeC,Kdate1 as kdateA,Kdate2 as kdateB, Kdate3 as kdateBC

FROM [Contacts Extended]
WHERE Year([Kdate3]) = [Forms]![frm_1_NavigationForm]![NavigationSubform].[Form]![CurrentFilter];

```
