' Module: DateAddWeekendHolidaysOut
' Type: Standard Module

Option Compare Database

Public Function AddHolidayDays(StartDate As Date, empID As Long, AbseID As Long, AbsenceRea As String, Optional EndDate As Date, Optional AbsenceDays As Integer, Optional AbsenTime As Date)
' This function returns a date that is days away from StartDate, not
' including Saturday and Sunday.
' AddHolidayDays() Version 1.0.0
' Copyright © 2013 Extra Mile Data, www.extramiledata.com.
' For questions or issues, please contact support@extramiledata.com.
' Use (at your own risk) and modify freely as long as proper credit is given.

On Error GoTo Err_Handler

    Dim dteDate As Date
    Dim intDay As Integer
    Dim endDay As Date
'    Dim AbsenTime As Double

    ' If any of the arguments are Null or NumberDays is negative,
    ' then pass back a Null.
    
    
    If IsNull(StartDate) Then
        AddHolidayDays = Null
        GoTo Exit_Proc
    End If


strWhere = "[AbsenceID] =" & AbseID & ""
    
    ' Count the number of holidays.
    TimType = DLookup(Expr:="[TimeType]", _
        Domain:="tbluAbsenceCodes", _
        criteria:=strWhere)

        Select Case TimType
        
        Case "Jours"
        
            If IsNull(AbsenceDays) Then
                AddHolidayDays = Null
                GoTo Exit_Proc
                
                
                ' we can start counting from here
            End If
                
        
        Case "H/M"
        
                If IsNull(EndDate) Then
                AddHolidayDays = Null
                GoTo Exit_Proc
                End If
                
                If EndDate < StartDate Then
                AddHolidayDays = Null
                GoTo Exit_Proc
                End If
                
                If EndDate = StartDate Then
                
                         If IsNull(AbsenTime) Then AddHolidayDays = Null
                         GoTo Exit_Proc
                         Else
                        ' start counting from here with start date = enddate and absencetime is a value
                         End If
                
                
                If EndDate > StartDate Then
                ' start counting from here taking the time sheet into consideration
                
                End If
                
                
        End Select
           



loadTimeSheetIntoArray (empID)
     If StartDate = EndDate Then

    End If

    ' Initialize the days variable
    intDay = 0


dteDate = StartDate

    ' Loop until to reach the enddate inclusive.
         Do Until dteDate = EndDate + 1
      
        
        ' If it is a holiday day, go to the next week day.
       
        
         If IsInHoliday(dteDate, loadHolidaysIntoArray) Then
         dteDate = dteDate + 1
         End If
         
     
        intDay = DatePart("w", dteDate)



Select Case TimType

Case "H/M"

        Select Case intDay
        
        Case vbSaturday
                AbsenTime = loadTimeSheetIntoArray(0)
        
        Case vbSunday
                AbsenTime = loadTimeSheetIntoArray(1)
        
        Case vbMonday
                AbsenTime = loadTimeSheetIntoArray(2)
        
        Case vbTuesday
                AbsenTime = loadTimeSheetIntoArray(3)
        
        Case vbWednesday
                AbsenTime = loadTimeSheetIntoArray(4)
        
        Case vbThursday
                AbsenTime = loadTimeSheetIntoArray(5)
        
        Case vbFriday
                AbsenTime = loadTimeSheetIntoArray(6)
        End Select

Case "Jours"

        AbsenTime = AbsenceDays
End Select


        AbsenceDate = dteDate
        EmployeeID = empID
        AbsenceID = AbseID
        AbsenceReason = AbsenceRea
        
     ' Increment the date.
   dteDate = dteDate + 1
    Loop

    AddHolidayDays = dteDate

Exit_Proc:
    On Error Resume Next
    Exit Function

Err_Handler:
     MsgBox Err.Number & " " & Err.Description, vbCritical, _
        "AddHolidayDays()"
    AddHolidayDays = Null
    Resume Exit_Proc
End Function
Public Function Workdays(ByRef StartDate As Date, _
     ByRef EndDate As Date, _
     Optional ByRef strHolidays As String = "Holidays" _
     ) As Integer
    ' Returns the number of workdays between startDate
    ' and endDate inclusive.  Workdays excludes weekends and
    ' holidays. Optionally, pass this function the name of a table
    ' or query as the third argument. If you don't the default
    ' is "Holidays".
    On Error GoTo Workdays_Error
    Dim nWeekdays As Integer
    Dim nHolidays As Integer
    Dim strWhere As String
    
    ' DateValue returns the date part only.
    StartDate = DateValue(StartDate)
    EndDate = DateValue(EndDate)
    
    nWeekdays = Weekdays(StartDate, EndDate)
    If nWeekdays = -1 Then
        Workdays = -1
        GoTo Workdays_Exit
    End If
    
    strWhere = "[Holiday] >= #" & StartDate _
        & "# AND [Holiday] <= #" & EndDate & "#"
    
    ' Count the number of holidays.
    nHolidays = DCount(Expr:="[Holiday]", _
        Domain:=strHolidays, _
        criteria:=strWhere)
    
    Workdays = nWeekdays - nHolidays
    
Workdays_Exit:
    Exit Function
    
Workdays_Error:
    Workdays = -1
    MsgBox "Error " & Err.Number & ": " & Err.Description, _
        vbCritical, "Workdays"
    Resume Workdays_Exit
    
End Function
Public Function Weekdays(ByRef StartDate As Date, _
    ByRef EndDate As Date _
    ) As Integer
    ' Returns the number of weekdays in the period from startDate
    ' to endDate inclusive. Returns -1 if an error occurs.
    ' If your weekend days do not include Saturday and Sunday and
    ' do not total two per week in number, this function will
    ' require modification.
    On Error GoTo Weekdays_Error
    
    ' The number of weekend days per week.
    Const ncNumberOfWeekendDays As Integer = 2
    
    ' The number of days inclusive.
    Dim varDays As Variant
    
    ' The number of weekend days.
    Dim varWeekendDays As Variant
    
    ' Temporary storage for datetime.
    Dim dtmX As Date
    
    ' If the end date is earlier, swap the dates.
    If EndDate < StartDate Then
        dtmX = StartDate
        StartDate = EndDate
        EndDate = dtmX
    End If
    
    ' Calculate the number of days inclusive (+ 1 is to add back startDate).
    varDays = DateDiff(interval:="d", _
        date1:=StartDate, _
        date2:=EndDate) + 1
    
    ' Calculate the number of weekend days.
    varWeekendDays = (DateDiff(interval:="ww", _
        date1:=StartDate, _
        date2:=EndDate) _
        * ncNumberOfWeekendDays) _
        + IIf(DatePart(interval:="w", _
        Date:=StartDate) = vbSunday, 1, 0) _
        + IIf(DatePart(interval:="w", _
        Date:=EndDate) = vbSaturday, 1, 0)
    
    ' Calculate the number of weekdays.
    Weekdays = (varDays - varWeekendDays)
    
Weekdays_Exit:
    Exit Function
    
Weekdays_Error:
    Weekdays = -1
    MsgBox "Error " & Err.Number & ": " & Err.Description, _
        vbCritical, "Weekdays"
    Resume Weekdays_Exit
End Function

