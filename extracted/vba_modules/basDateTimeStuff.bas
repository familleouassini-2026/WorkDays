' Module: basDateTimeStuff
' Type: Standard Module

' basDateTimeStuff
Option Compare Database
Option Explicit

Public Function WeekStart(intStartDay As Integer, Optional varDate As Variant)

    ' Returns 'week starting' date for any date
    
    ' Arguments:
    ' 1. intStartDay - weekday on which week starts, 1-7 (Sun - Sat)
    ' 2. vardate - optional date value for which week starting
    '   date to be returned.  Defaults to current date
    
    If IsMissing(varDate) Then varDate = VBA.Date
    
    If Not IsNull(varDate) Then
        WeekStart = DateValue(varDate) - Weekday(varDate, intStartDay) + 1
    End If
    
End Function

Public Function TimeToString(dtmTime As Date, _
    Optional blnShowdays As Boolean = False) As String
    
    Dim lngDays As Long
    Dim strDays As String
    Dim strHours As String

    ' get whole days
    lngDays = Int(dtmTime)
    strDays = CStr(lngDays)
    ' get hours
    strHours = Format(dtmTime, "hh")
    
    If blnShowdays Then
        TimeToString = lngDays & ":" & strHours & Format(dtmTime, ":nn:ss")
    Else
        TimeToString = Format((Val(strDays) * 24) + Val(strHours), "00") & _
            Format(dtmTime, ":nn:ss")
    End If

End Function

Public Function TimeElapsed(dtmTime As Date, strMinSec As String, _
            Optional blnShowdays As Boolean = False) As String

    ' Returns a date/time value as a duration
    ' in hours etc or days:hours etc if optional
    ' blnShowDays argument is True.
    ' Time format is determined by strMinSec argument,
    ' e.g. "nn" to show hours:minutes,
    ' "nn:ss" to show hours:minutes:seconds,
    ' "" to show hours only
    ' Call the fucntion, in a query for example, like this:
    ' SELECT EmployeeID,
    ' TimeElapsed(SUM(TimeDurationAsDate(TimeStart, TimeEnd)), "nn") As TotalTime
    ' FROM TimeLog
    ' GROUP BY EmployeeID;
    
    Dim lngDays As Long
    Dim strDays As String
    Dim strHours As String
    
    ' get whole days
    lngDays = Int(dtmTime)
    strDays = CStr(lngDays)
    ' get hours
    strHours = Format(dtmTime, "hh")
    
    If blnShowdays Then
        TimeElapsed = lngDays & ":" & strHours & Format(dtmTime, ":" & strMinSec)
    Else
        TimeElapsed = Format((Val(strDays) * 24) + Val(strHours), "#,##0") & _
            Format(dtmTime, ":" & strMinSec)
    End If
    
    ' remove trailing colon if necessary
    If Right(TimeElapsed, 1) = ":" Then
        TimeElapsed = Left(TimeElapsed, Len(TimeElapsed) - 1)
    End If
    
End Function



Public Function TimeDurationAsDate(dtmFrom As Date, dtmTo As Date) As Date
            
    ' Returns duration between two date/time values
    ' as a date/time value
    
    ' If 'time values' only passed into function and
    ' 'from' time if later than 'to' time, assumed that
    ' this relates to a 'shift' spanning midnight and one day
    ' is therefore subtracted from the 'from' time

    ' subtract one day from 'from' time if later than 'to' time
    If dtmTo < dtmFrom Then
        If Int(dtmFrom) + Int(dtmTo) = 0 Then
            dtmFrom = dtmFrom - 1
        End If
    End If
    
    ' get duration as date time data type
    TimeDurationAsDate = dtmTo - dtmFrom
    
End Function

Public Function TimeDuration(dtmFrom As Date, dtmTo As Date, _
            Optional blnShowdays As Boolean = False) As String
            
    ' Returns duration between two date/time values
    ' in format hh:nn:ss, or d:hh:nn:ss if optional
    ' blnShowDays argument is True.
    
    ' If 'time values' only passed into function and
    ' 'from' time is later than or equal to 'to' time, assumed that
    ' this relates to a 'shift' spanning midnight and one day
    ' is therefore subtracted from 'from' time

    Dim dtmTime As Date
    Dim lngDays As Long
    Dim strDays As String
    Dim strHours As String
    
    ' subtract one day from 'from' time if later than or same as 'to' time
    If dtmTo <= dtmFrom Then
        If Int(dtmFrom) + Int(dtmTo) = 0 Then
            dtmFrom = dtmFrom - 1
        End If
    End If
    
    ' get duration as date time data type
    dtmTime = dtmTo - dtmFrom
    
    ' get whole days
    lngDays = Int(dtmTime)
    strDays = CStr(lngDays)
    ' get hours
    strHours = Format(dtmTime, "hh")
    
    If blnShowdays Then
        TimeDuration = lngDays & ":" & strHours & Format(dtmTime, ":nn:ss")
    Else
        TimeDuration = Format((Val(strDays) * 24) + Val(strHours), "#,##0") & _
            Format(dtmTime, ":nn:ss")
    End If
    
End Function



