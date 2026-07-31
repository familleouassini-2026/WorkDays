' Module: mod_FillHolidays
' Type: Standard Module

Option Compare Database
Option Explicit

Public Sub FillHolidays(frm As Access.Form, TheYear As Integer, TheMonth As Integer)
'==================================================================================================
'//Fills the grid with the holidays from tbl_Holidays using qry_FillHolidays
'==================================================================================================
    Dim ctl As Access.Label
    Dim rs As DAO.Recordset
    Dim strsql As String
    Dim strMonth As String
    Dim IntMonth As Integer
    Dim intDay As Integer
    Dim HolidayDate As Date
    Dim FirstDayOfMonth As Date
    Dim intOffSet As Integer
    Dim dayname As Integer

    strsql = "Select * from qry_FillHolidays where year(HolidayDate ) = " & TheYear & " AND month(HolidayDate) = " & TheMonth
    Set rs = CurrentDb.OpenRecordset(strsql)

    Do While Not rs.EOF
        HolidayDate = rs!HolidayDate
        strMonth = Format(HolidayDate, "mmm")
        intDay = Day(HolidayDate)
        IntMonth = Month(HolidayDate)
        FirstDayOfMonth = getFirstOfMonth(TheYear, IntMonth)    'First of month
        intOffSet = getOffset(TheYear, IntMonth, vbSaturday)    'Offset to first label for month.
        Set ctl = frm.Controls("lbl" & intDay + intOffSet)
        
               dayname = Weekday(HolidayDate, vbSaturday)

        
        If dayname <= 2 Then
        
        
        ctl.BackColor = 65280 '16760576    'Colors the holidays backcolor bright Blue
        
        Else
        
        
        ctl.BackColor = 17919 '16760576    'Colors the holidays backcolor bright red
        
        End If
        
        rs.MoveNext
    Loop

End Sub


'==================================================================================================
'==================================================================================================
'// Below this point is used to fill tbl_Holidays with dates and holiday names quickly using the
'    immediate window. enter in the immediate window;
'                                                    Filltbl_Holidays 2013,2015
'==================================================================================================

Public Sub Filltbl_Holidays(StartYear As Integer, EndYear As Integer)

    Dim HolidayDate As Date
    Dim CurrentYear As Integer

    For CurrentYear = StartYear To EndYear
        'New Years
        HolidayDate = CDate("01/01/" & CurrentYear)
        InsertHoliday HolidayDate, "New Years"

        'ML King 3rd Monday of Jan
        '        HolidayDate = DayOfNthWeek(CurrentYear, 1, 3, vbMonday)
        '        InsertHoliday HolidayDate, "Martin Luther King Day"

        'Presidents Day  3rd Monday of Feb
        '        HolidayDate = DayOfNthWeek(CurrentYear, 2, 3, vbMonday)
        '        InsertHoliday HolidayDate, "Presidents Day"

        'Memorial Day    Last Monday of May
        HolidayDate = LastMondayInMonth(CurrentYear, 5)
        InsertHoliday HolidayDate, "Memorial Day"

        'Independance Day
        HolidayDate = CDate("07/04/" & CurrentYear)
        InsertHoliday HolidayDate, "Independence Day"

        'Labor Day   1st Monday of Sep
        HolidayDate = DayOfNthWeek(CurrentYear, 9, 1, vbMonday)
        InsertHoliday HolidayDate, "Labor Day"

        'Columbus Day    2nd Monday of Oct
        '        HolidayDate = DayOfNthWeek(CurrentYear, 10, 2, vbMonday)
        '        InsertHoliday HolidayDate, "Columbus Day"

        ' Veteranss Day
        ' Although originally scheduled for celebration on November 11,
        ' starting in 1971 Veterans Day was moved to the fourth Monday of October.
        ' In 1978 it was moved back to its original celebration on November 11.
        '        HolidayDate = CDate("11/11/" & CurrentYear)
        '        InsertHoliday HolidayDate, "Verterans Day"

        'Day Before Thanksgiving
        HolidayDate = DayOfNthWeek(CurrentYear, 11, 4, vbThursday)
        HolidayDate = HolidayDate - 1
        InsertHoliday HolidayDate, "Day Before Thanksgiving"

        'Thanksgiving Day  4th Thursday of Nov
        HolidayDate = DayOfNthWeek(CurrentYear, 11, 4, vbThursday)
        InsertHoliday HolidayDate, "Thanksgiving"

        'Christmas Eve
        HolidayDate = CDate("12/24/" & CurrentYear)
        InsertHoliday HolidayDate, "Christmas Eve"

        'CHRISTMAS
        HolidayDate = CDate("12/25/" & CurrentYear)
        InsertHoliday HolidayDate, "Christmas"
    Next CurrentYear
End Sub
Public Sub InsertHoliday(HolidayDate As Date, HolidayName As String)
    Dim strsql As String
    strsql = "Insert into tbl_Holidays (HolidayDate, HolidayName) values (#" & Format(HolidayDate, "mm/dd/yyyy") & "# , '" & HolidayName & "')"
    Debug.Print strsql
    CurrentDb.Execute strsql
End Sub

Public Function DayOfNthWeek(intYear As Integer, IntMonth As Integer, N As Integer, vbDayOfWeek As Integer) As Date
'Thanksgiving is the 4th thursday in November(11)
'dayOfNthWeek(theYear,11,4,vbThursday)
    DayOfNthWeek = DateSerial(intYear, IntMonth, (8 - Weekday(DateSerial(intYear, IntMonth, 1), _
                                                              (vbDayOfWeek + 1) Mod 8)) + ((N - 1) * 7))
End Function
Function LastMondayInMonth(intYear As Integer, IntMonth As Long) As Date
'Used for memorial day
    Dim LastDay As Date
    'define last day of the month of interest:
    LastDay = DateSerial(intYear, IntMonth + 1, 0)
    'use to get last monday:
    LastMondayInMonth = LastDay - Weekday(LastDay, vbMonday) + 1
End Function
