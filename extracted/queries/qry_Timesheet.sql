-- Query: qry_Timesheet
-- Type: SELECT

SELECT tbl_TimeSheet.*, GetTimeSheetTotal([TimeSheetId]) AS TotalHours, GetFullTimeDiff([TimeSheetId]) AS DifflHours, GetTimePercentFullTime([TimeSheetId]) AS TimePercentFullTime
FROM tbl_TimeSheet
ORDER BY tbl_TimeSheet.Active;
