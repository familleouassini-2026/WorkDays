' Module: TimeFormat
' Type: Standard Module

Function dhCMinutes(dtmTime As Date) As Long
    ' Convert a date/time value to the number of
    ' minutes since midnight (that is, remove the date
    ' portion, and just work with the time part). The
    ' return value can be used to calculate sums of
    ' elapsed time.
    ' Convert from a fraction of a day to minutes.
    dhCMinutes = TimeValue(dtmTime) * 24 * 60
End Function


'Function dhCTimeStr(lngMinutes As Long) As String
'    ' Convert from a number of minutes to a string
'    ' that looks like a time value.
'    '
'    CTimeStr = Format(plngMinutes \ 60, "0") & _
'     GetTimeDelimiter() & Format(lngMinutes Mod 60, "00")
'End Function

'Private Function GetTimeDelimiter() As String
'    ' Retrieve the time delimiter from, believe it or not,
'    ' WIN.INI. This is the only reasonable solution
'    ' to this problem, even in this day and age!
'    Const conMaxSize = 10
'    Dim strBuffer As String
'    Dim intLen As Integer
'    strBuffer = Space(conMaxSize)
'    intLen = GetProfileString("intl", "sTime", "", strBuffer, _
'     conMaxSize)
'    GetTimeDelimiter = Left(strBuffer, intLen)
'End Function