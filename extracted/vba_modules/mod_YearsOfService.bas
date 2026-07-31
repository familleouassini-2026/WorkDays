' Module: mod_YearsOfService
' Type: Standard Module

Option Compare Database

Public Function fElapsedTimeYMD(varStartDate As Variant, varEndDate) As String
    Dim dtToday As Date
    Dim intStartYear As Integer, intStartMonth As Integer, intStartDay As Integer
    Dim intEndYear As Integer, intEndMonth As Integer, intEndDay As Integer
    Dim intTmpYear As Integer, intTmpMonth As Integer, intTmpDay As Integer
    Dim strYear As String, strMonth As String, strDay As String
    Dim sngLeap As Single

    If Not IsDate(varStartDate) Or Not IsDate(varEndDate) Then Exit Function

    dtToday = Date
    intStartYear = Year(varStartDate)
    intStartMonth = Month(varStartDate)
    intStartDay = Day(varStartDate)
    intEndYear = Year(varEndDate)
    intEndMonth = Month(varEndDate)
    intEndDay = Day(varEndDate)

    If intStartDay > intEndDay Then
        Select Case intEndMonth
        Case Is = 1
            intEndDay = intEndDay + 31
            intEndMonth = 12
            intEndYear = intEndYear - 1
        Case Is = 2    ' Check for Leap Year
            If varStartDate = DateSerial(intEndYear, 2, 29) Then
                intEndDay = intEndDay + 29
                intEndMonth = intEndMonth - 1
            Else
                intEndDay = intEndDay + 28
                intEndMonth = intEndMonth - 1
            End If
        Case Is = 4, 6, 9, 11
            intEndDay = intEndDay + 30
            intEndMonth = intEndMonth - 1
        Case Is = 3, 5, 7, 8, 10, 12
            intEndDay = intEndDay + 31
            intEndMonth = intEndMonth - 1
        End Select
    End If

    If intStartMonth > intEndMonth Then
        Select Case intEndMonth
        Case Is = 1
            intEndMonth = 13
            intEndYear = intEndYear - 1
        Case Else
            intEndMonth = intEndMonth + 12
            intEndYear = intEndYear - 1
        End Select
    End If

    intTmpYear = intEndYear - intStartYear
    intTmpMonth = intEndMonth - intStartMonth
    intTmpDay = intEndDay - intStartDay

    Select Case intTmpYear
    Case Is = 0
        strYear = ""
    Case Is = 1
        strYear = Trim(Str(intTmpYear)) & " Year"
    Case Else
        strYear = Trim(Str(intTmpYear)) & " Years"
    End Select

    Select Case intTmpMonth
    Case Is = 0
        strMonth = ""
    Case Is = 1
        strMonth = Trim(Str(intTmpMonth)) & " Month"
    Case Else
        strMonth = Trim(Str(intTmpMonth)) & " Months"
    End Select

    Select Case intTmpDay
    Case Is = 0
        strDay = ""
    Case Is = 1
        strDay = Trim(Str(intTmpDay)) & " Day"
    Case Else
        strDay = Trim(Str(intTmpDay)) & " Days"
    End Select

    fElapsedTimeYMD = Trim(strYear & " " & strMonth & " " & strDay)

End Function

