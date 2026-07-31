' Module: Module1
' Type: Standard Module

Option Compare Database

Function GetTimeSheetTotal(TimeSheetId As Integer) '


'Dim EmployeeId As Integer
'EmployeeId = 16


 Dim db As DAO.Database, rs As DAO.Recordset
 Dim TotalHours As Long, totalminutes As Long
 Dim Days As Long, Hours As Long, Minutes As Long
 Dim interval As Variant, j As Integer

 Set db = DBEngine.Workspaces(0).Databases(0)
 Set rs = db.OpenRecordset("SELECT * FROM tbl_TimeSheet WHERE TimeSheetId=" & TimeSheetId & ";")
 interval = #12:00:00 AM#

If rs.EOF Then
  '  MsgBox "The Recordset is empty."
    Exit Function
End If


       interval = interval + Nz(rs!Monday, #12:00:00 AM#) + Nz(rs!Tuesday, #12:00:00 AM#) + Nz(rs!Wednesday, #12:00:00 AM#) + Nz(rs!Thursday, #12:00:00 AM#) + Nz(rs!Friday, #12:00:00 AM#) + Nz(rs!Saturday, #12:00:00 AM#) + Nz(rs!Sunday, #12:00:00 AM#)

 TotalHours = Int(CSng(interval * 24))
 totalminutes = Int(CSng(interval * 1440))
 Hours = TotalHours Mod 24
 Minutes = totalminutes Mod 60

 GetTimeSheetTotal = TotalHours & ":" & Right("0" & Minutes, 2)

 End Function
 
 Function GetFullTimeDiff(TimeSheetId)
 
 
 
 
 'Dim EmployeeId As Integer
'EmployeeId = 16


 Dim db As DAO.Database, rs As DAO.Recordset
 Dim TotalHours As Long, totalminutes As Long
 Dim Days As Long, Hours As Long, Minutes As Long
 Dim interval As Variant, j As Integer
 
 
 
 

 Set db = DBEngine.Workspaces(0).Databases(0)
 
 
 Set rs = db.OpenRecordset("SELECT * FROM tbl_TimeSheet WHERE TimeSheetId=" & TimeSheetId & " and Active =" & -1)
 interval = #12:00:00 AM#

If rs.EOF Then
  '  MsgBox "The Recordset is empty."
    Exit Function
End If





       interval = interval + Nz(rs!Monday, #12:00:00 AM#) + Nz(rs!Tuesday, #12:00:00 AM#) + Nz(rs!Wednesday, #12:00:00 AM#) + Nz(rs!Thursday, #12:00:00 AM#) + Nz(rs!Friday, #12:00:00 AM#) + Nz(rs!Saturday, #12:00:00 AM#) + Nz(rs!Sunday, #12:00:00 AM#)

 TotalHours = Int(CSng(interval * 24))
 totalminutes = Int(CSng(interval * 1440))
 Hours = TotalHours Mod 24
 Minutes = totalminutes Mod 60
 
 TotalFulltimeminutes = (Nz(rs!FullTimeH, 0) * 60 + Nz(rs!FullTimeM, 0))
 
 totalminutesdiff = TotalFulltimeminutes - totalminutes
 TotalHoursDiff = Int(CSng(totalminutesdiff / 60))
 MinutesDiff = totalminutesdiff Mod 60
 
 
 
 GetFullTimeDiff = TotalHoursDiff & ":" & Right("0" & MinutesDiff, 2)
 
 
  
 
 
 End Function
 Function GetTimePercentFullTime(TimeSheetId)
 
 'Dim EmployeeId As Integer
'EmployeeId = 16

If TimeSheetId = 0 Then
GetTimePercentFullTime = 0

Else


 Dim db As DAO.Database, rs As DAO.Recordset
 Dim TotalHours As Long, totalminutes As Long
 Dim Days As Long, Hours As Long, Minutes As Long
 Dim interval As Variant, j As Integer

 Set db = DBEngine.Workspaces(0).Databases(0)
 Set rs = db.OpenRecordset("SELECT * FROM tbl_TimeSheet WHERE TimeSheetId=" & TimeSheetId & " and Active =" & -1)
 interval = #12:00:00 AM#

If rs.EOF Then
  '  MsgBox "The Recordset is empty."
    Exit Function
End If


       interval = interval + Nz(rs!Monday, #12:00:00 AM#) + Nz(rs!Tuesday, #12:00:00 AM#) + Nz(rs!Wednesday, #12:00:00 AM#) + Nz(rs!Thursday, #12:00:00 AM#) + Nz(rs!Friday, #12:00:00 AM#) + Nz(rs!Saturday, #12:00:00 AM#) + Nz(rs!Sunday, #12:00:00 AM#)

 TotalHours = Int(CSng(interval * 24))
 totalminutes = Int(CSng(interval * 1440))
 Hours = TotalHours Mod 24
 Minutes = totalminutes Mod 60
 
 TotalFulltimeminutes = (Nz(rs!FullTimeH, 0) * 60 + Nz(rs!FullTimeM, 0))
 
' GetFullTimeDifference = TotalFulltimeminutes - totalminutes
 
 If TotalFulltimeminutes = 0 Then
 
 GetTimePercentFullTime = 0
 Else

 GetTimePercentFullTime = totalminutes / TotalFulltimeminutes
 
 End If
 
 End If
 
 
 End Function
  Function GetActiveTimeSheetIdPerEmployee(EmployeeID)
 
 Dim db As DAO.Database, rs As DAO.Recordset
 Dim TimeSheetId As Long, totalminutes As Long
 Dim Days As Long, Hours As Long, Minutes As Long
 Dim interval As Variant, j As Integer

 Set db = CurrentDb
 
 SQL = "SELECT TimeSheetId FROM tbl_TimeSheet WHERE EmployeeID=" & EmployeeID & " and Active =" & -1
 
 
 Set rs = db.OpenRecordset(SQL)
 If rs.EOF Then
 GetActiveTimeSheetIdPerEmployee = 0
 Else
 
 GetActiveTimeSheetIdPerEmployee = rs!TimeSheetId
 End If
 
 End Function

Function GetPercenttime(EmployeeID)

GetPercenttime = Round(GetTimePercentFullTime(GetActiveTimeSheetIdPerEmployee(EmployeeID)), 2)

End Function