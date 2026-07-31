' Module: mod_FillTextBoxes
' Type: Standard Module

Option Compare Database
Option Explicit

Public Sub FillSubFormTextBoxes(frm As Access.Form, empID As Long, TheYear As Integer, TheMonth As Integer)
'==================================================================================================
'//Fills the grids textbox(s) with data and color on the correct date an absence was entered on.
'==================================================================================================
    Dim ctl As Access.TextBox
    Dim rs As DAO.Recordset
    Dim rsDay As DAO.Recordset
    Dim strsql As String
    Dim intDay As Integer
    Dim FirstDayOfMonth As Date
    Dim intOffSet As Integer
    Dim strCodes As String

    Dim AbsenceDate As Date   'Field in tbl_YearCalendar
    Dim AbsenceCode As String   'Field in tbluAbsenceCodes
    Dim AbsenceColorCode As String   'Field in tbluAbsenceCodes - Added to color textbox(s)
    Dim AbsenceTextColorCode As String   'Field in tbluAbsenceCodes - Added to color textbox(s)text
    Dim AbsenceColorTag As String    'Field in tbluAbsenceCodes - Added to color textbox(s)text and backgrounds for multi absences on the same day
    Dim AbsenceTime As String  'Field in tbl_YearCalendar - Added to show hours missed on single absences
Dim TmTp As String
    On Error GoTo errlbl:
    strsql = "Select distinct AbsenceDate from qry_FillTextBoxes where EmployeeID = " & empID    'Query that finds the absence Year() by employeeID
    strsql = strsql & " AND year(AbsenceDate) = " & TheYear & " AND Month(AbsenceDate) = " & TheMonth
    'Debug.Print strSql
    Set rs = CurrentDb.OpenRecordset(strsql)

    clearSubFormTextBoxes frm    'Uses(clearTextBoxes)Sub to clear the textbox grid on the frm as (frm_YearCalendar)

    'Loop the days with absences for that month
    Do While Not rs.EOF
        AbsenceDate = rs!AbsenceDate
        strsql = "Select * from qry_FillTextBoxes where EmployeeID = " & empID    'Query that finds the absence Year() by employeeID
        strsql = strsql & " AND absenceDate = #" & Format(rs!AbsenceDate, "mm/dd/yyyy") & "#"
        Set rsDay = CurrentDb.OpenRecordset(strsql, dbOpenDynaset)

        'Debug.Print strSql

        rsDay.MoveLast
        rsDay.MoveFirst
        If rsDay.RecordCount > 1 Then
            AbsenceColorCode = 16777215    'White background
            AbsenceTextColorCode = 1    'Black text
            Do While Not rsDay.EOF
                AbsenceCode = rsDay!AbsenceCode
                AbsenceColorTag = rsDay!AbsenceColorTag    'The html tag stored in tbluAbsenceCodes
                If strCodes = "" Then
                    'Pad your string
                    AbsenceCode = PadString(AbsenceCode, 6)
                    AbsenceCode = AbsenceColorTag & AbsenceCode & "</font>"
                    strCodes = AbsenceCode
                Else
                    AbsenceCode = PadString(AbsenceCode, 6)
                    'Here is the location for the Break
                    AbsenceCode = "<br>" & AbsenceColorTag & AbsenceCode & "</font>"    'Changed From AbsenceCode = AbsenceColorTag & "<br>" & AbsenceCode & "</font>"
                    strCodes = strCodes & AbsenceCode
                End If
                rsDay.MoveNext
            Loop
            strCodes = "<div>" & strCodes & "</div>"
            'Debug.Print strCodes
        Else
            AbsenceCode = rsDay!AbsenceCode
            strCodes = AbsenceCode
            AbsenceTextColorCode = rsDay!AbsenceTextColorCode
            AbsenceColorCode = rsDay!AbsenceColorCode
            TmTp = rsDay!TimeType
            Select Case TmTp
            Case "Jours"
            
            AbsenceTime = rsDay!AbsenceDays
            
           Case "H/M"
            
            AbsenceTime = rsDay!AbsenceTime
            
            End Select
            
            
            rsDay.MoveNext
        End If
        intDay = Day(AbsenceDate)
        FirstDayOfMonth = getFirstOfMonth(TheYear, TheMonth)    'First of month
        intOffSet = getOffset(TheYear, TheMonth, vbSaturday)    'Offset to first label for month.
        Set ctl = frm.Controls("txt" & intDay + intOffSet)
        'change the alignment if it has more than one code
        If rsDay.RecordCount > 1 Then
            ctl.TextAlign = 1
        Else
            ctl.TextAlign = 2
        End If
        
        Select Case TmTp
          Case "H/M"
        strCodes = "=" & Chr(34) & strCodes & Chr(13) & Chr(10) & Format(AbsenceTime, "hh:mm") & Chr(34)
        Case "Jours"
        strCodes = "=" & Chr(34) & strCodes & Chr(13) & Chr(10) & Format(AbsenceTime, "General Number") & Chr(34)
        End Select
                
        
        ctl.ControlSource = strCodes
        'REMOVED ctl.Value = strCodes & vbCrLf & Format(AbsenceTime, "0.00")   'Displays the text or absencecode in the textbox to whats indicated in tbluAbsenceCodes and Time taken from tbl_YearCalendar
        ctl.BackColor = AbsenceColorCode    'Changes the texbox(s) backcolor to whats indicated in tbluAbsenceCodes
        ctl.ForeColor = AbsenceTextColorCode    'Changes the texbox(s) text to whats indicated in tbluAbsenceCodes
        strCodes = ""
        rs.MoveNext
    Loop
    Exit Sub
errlbl:
    ' Debug.Print "Form is Nothing = " & frm Is Nothing
    Debug.Print Err.Number & " " & Err.Description & " in Fill textboxes"

End Sub

Public Function PadString(strText As String, TotalLength As Integer) As String
    Dim textlength As Integer
    Dim spacesToPad As Integer
    Dim frontPad As Integer
    Dim backPad As Integer
    textlength = Len(strText)
    'since the string is centered in the box need to pad half to front and half to back
    If textlength < TotalLength Then
        spacesToPad = TotalLength - textlength
        frontPad = spacesToPad \ 2
        backPad = spacesToPad - frontPad
        strText = Space(frontPad) & strText & Space(backPad)
        PadString = strText
    End If
End Function

Public Sub clearSubFormTextBoxes(frm As Access.Form)
'==================================================================================================
'//Clears the grids textbox(s) of thier absences and reverts thier colors back to white
'==================================================================================================
    Dim ctl As Access.Control
    Dim i As Integer
    Const ctlBackColor = vbWhite    'Resets the grids textbox(s) back to a white back color
    On Error Resume Next
    For i = 1 To 37
        Set ctl = frm.Controls("txt" & i)
        ctl.ControlSource = ""    'Removed ctl.Value = ""
        ctl.BackColor = ctlBackColor    'Resets the grids textbox(s) backcolor
    Next i
End Sub
