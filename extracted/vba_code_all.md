# WorkDays - VBA Code Modules

**Extracted:** 2026-07-30 01:47:32


---
## Form_frm_CalendarInputBox (Document Module)

**Lines:** 29

```vba
Option Compare Database
Option Explicit

Private Sub cmdClose_Click()

    DoCmd.Close acForm, Me.Name

End Sub

Private Sub Form_Load()
    Dim selectedDate As String
    Dim empID As Long
    Dim strWhere As String
    Dim selectedyear As Integer
    Dim rs As DAO.Recordset
    If Me.OpenArgs & "" <> "" Then
        selectedDate = Split(Me.OpenArgs, ";")(0)
        empID = Split(Me.OpenArgs, ";")(1)
        selectedyear = Split(Me.OpenArgs, ";")(2)
        Me.txtEmployeeName = DLookup("EmpLName & ', ' & EmpFName", "tbl_Emp_Employees", "EmployeeID = " & empID)
        Me.txtEmployeeID = empID
        Me.txtAbsenceDate = CDate(selectedDate)
        Me.txtYear = selectedyear
    End If
End Sub




```


---
## Form_frm_YearCalendar (Document Module)

**Lines:** 327

```vba
Option Compare Database
Option Explicit

Public sFrmJan As Form_subFormMonth
Public sFrmFeb As Form_subFormMonth
Public sFrmMar As Form_subFormMonth
Public sFrmApr As Form_subFormMonth
Public sFrmMay As Form_subFormMonth
Public sFrmJun As Form_subFormMonth
Public sFrmJul As Form_subFormMonth
Public sFrmAug As Form_subFormMonth
Public sFrmSep As Form_subFormMonth
Public sFrmOct As Form_subFormMonth
Public sFrmNov As Form_subFormMonth
Public sFrmDec As Form_subFormMonth

Private Sub Form_Load()

'    DoCmd.ShowToolbar "Ribbon", acToolbarNo    'Hides the toolbar

    Set sFrmJan = Me.subFormJan.Form
    Set sFrmFeb = Me.SubFormFeb.Form
    Set sFrmMar = Me.subformMar.Form
    Set sFrmApr = Me.subFormApr.Form
    Set sFrmMay = Me.SubFormMay.Form
    Set sFrmJun = Me.SubFormJun.Form
    Set sFrmJul = Me.subFormJul.Form
    Set sFrmAug = Me.subFormAug.Form
    Set sFrmSep = Me.subFormSep.Form
    Set sFrmOct = Me.SubFormOct.Form
    Set sFrmNov = Me.subFormNov.Form
    Set sFrmDec = Me.subFormDec.Form

    '//Fills the subFomrMonths LblMonth with the appropiate month
  sFrmJan.LblMonth.Caption = "Janvier"
  sFrmFeb.LblMonth.Caption = "Février"
  sFrmMar.LblMonth.Caption = "Mars"
  sFrmApr.LblMonth.Caption = "Avril"
  sFrmMay.LblMonth.Caption = "Mai"
  sFrmJun.LblMonth.Caption = "Juin"
  sFrmJul.LblMonth.Caption = "Juillet"
  sFrmAug.LblMonth.Caption = "Août"
  sFrmSep.LblMonth.Caption = "Septembre"
  sFrmOct.LblMonth.Caption = "Octobre"
  sFrmNov.LblMonth.Caption = "Novembre"
  sFrmDec.LblMonth.Caption = "Décembre"

    FillCombo    'Fills cboYear combo box
    FillAllMonthLabels (Me.cboYear)    'Fills the subFormMonths days for the year based on cboYear
    FillAllHolidays Me.cboYear    'Fills the subFormMonths holidays for the year based on cboYear

    Me.cboSecteur.SetFocus    'Sets focus to combobox
    
    If IsNull(Me.OpenArgs) Then
    
    Else
    Dim criter As Variant
    criter = Split(Me.OpenArgs, "_")
    Me.cboSecteur.Value = CLng(criter(0))
    Me.cboEmployee.Enabled = True
    Me.cboEmployee.Value = CLng(criter(1))
    
    Call cboEmployee_AfterUpdate
    End If
    Me.frm_Abs_HolidayRightAndTaken.Form.Filter = "[yearVacation]= " & Me.cboYear
    Me.frm_Abs_HolidayRightAndTaken.Form.FilterOn = True
    
    DoCmd.Maximize

End Sub

Private Sub FillAllMonthLabels(TheYear As Integer)
'Used to fill in month labels
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmJan, TheYear, 1
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmFeb, TheYear, 2
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmMar, TheYear, 3
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmApr, TheYear, 4
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmMay, TheYear, 5
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmJun, TheYear, 6
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmJul, TheYear, 7
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmAug, TheYear, 8
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmSep, TheYear, 9
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmOct, TheYear, 10
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmNov, TheYear, 11
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmDec, TheYear, 12
End Sub

Public Sub FillAllMonthTextBoxes(TheYear As Integer, empID As Long)
'Used to fill in text boxes
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmJan, empID, TheYear, 1
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmFeb, empID, TheYear, 2
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmMar, empID, TheYear, 3
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmApr, empID, TheYear, 4
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmMay, empID, TheYear, 5
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmJun, empID, TheYear, 6
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmJul, empID, TheYear, 7
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmAug, empID, TheYear, 8
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmSep, empID, TheYear, 9
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmOct, empID, TheYear, 10
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmNov, empID, TheYear, 11
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmDec, empID, TheYear, 12
End Sub

Public Sub FillAllHolidays(TheYear As Integer)
'Used to fill in holidays
    FillHolidays sFrmJan, TheYear, 1
    FillHolidays sFrmFeb, TheYear, 2
    FillHolidays sFrmMar, TheYear, 3
    FillHolidays sFrmApr, TheYear, 4
    FillHolidays sFrmMay, TheYear, 5
    FillHolidays sFrmJun, TheYear, 6
    FillHolidays sFrmJul, TheYear, 7
    FillHolidays sFrmAug, TheYear, 8
    FillHolidays sFrmSep, TheYear, 9
    FillHolidays sFrmOct, TheYear, 10
    FillHolidays sFrmNov, TheYear, 11
    FillHolidays sFrmDec, TheYear, 12
End Sub

Private Sub FillCombo()
'**Purpose: Populate cboYear rowsource

    Dim intYearTemp As Integer
    Dim intCounter As Integer
    Dim intMaxYear As Integer
    Dim strYear As String

    'Extract open arguments and set variables
    'First year is 2112 & init variables
    intYearTemp = 2017
    intMaxYear = 5
    strYear = ""

    'Populate strYear
    For intCounter = 0 To 5
        strYear = strYear & intYearTemp + intCounter & ";"
    Next

    'Set cboYear's rowsource property
    Me![cboYear].RowSource = strYear

    'Set default values for fields
    Me![cboYear] = Year(Now)

    Me.cmdRptYearView.Caption = "Imprimer le calendrier d'absence pour " & Me.cboYear   'Added so the report button (cmdRptYearView) shows current year and text
    Me.cmdAbsenceForYear.Caption = "toutes les absences pour " & Me.cboYear   'Added so the report button (cmdAbsenceForYear) shows current year and text
    Me.cmdQtrRpt.Caption = Me.cboYear & " Raport Trimestriel d'absence"  'Added so the report button (cmdQtrRpt) shows current year and text
    Me.cmdAbsenteeismRpt.Caption = "Absenteeism Policy Rpt.... " & "(" & DLookup("[NumberOfIncidents]", "qry_NumberOfIncidents") & ")" & " Current Absences Reported Between " & Date & " - " & DateAdd("m", -6, Date)   'Added so the report button (cmdAbsenteeismRpt) shows current 6 months from/to and text

End Sub

Private Sub cboEmployee_AfterUpdate()

    FillAllMonthLabels CInt(cboYear.Value)
    FillAllHolidays CInt(cboYear.Value)
    Me.FillAllMonthTextBoxes CInt(Me.cboYear), Me.cboEmployee

    '   Displays the current employees years of service using module (mod_YearsOfService)
    Caption = "Années de service à nos jours - " & fElapsedTimeYMD([cboEmployee].[Column](2), Date)

    Me.cmdAbsenteeismRpt.Caption = "Absenteeism Policy Rpt.... " & "(" & DLookup("[NumberOfIncidents]", "qry_NumberOfIncidents") & ")" & " Current Absences Reported Between " & Date & " - " & DateAdd("m", -6, Date)   'Added so the report button (cmdAbsenteeismRpt) shows current 6 months from/to and text
       
    Me.Filter = "[EmployeeID]= " & Me.cboEmployee
        Me.FilterOn = True
End Sub

Private Sub cboSecteur_AfterUpdate()

    If IsNull(Me.cboEmployee) = True Then
        'Theres no data in cboEmployee
        Me.cboEmployee.Enabled = True
        Me.cboEmployee.Requery    'Just incase you went back and reselected another supervisor without selecting and employee
        Caption = "Gestion d'Abence"    'Clears years of service and displays tracker untill employee is selected
    Else
        'There is data in cboEmployee lets clear it
        Me.cboEmployee = Null
        Me.cboEmployee.Enabled = True
        Me.cboEmployee.Requery
        Caption = "Absentee Tracker"    'Clears years of service and displays tracker untill employee is selected
        'Clear all subForm Calendars using (mod_FillTextBoxes) (Public Sub clearSubFormTextBoxes)
        clearSubFormTextBoxes Me.subFormJan.Form
        clearSubFormTextBoxes Me.SubFormFeb.Form
        clearSubFormTextBoxes Me.subformMar.Form
        clearSubFormTextBoxes Me.subFormApr.Form
        clearSubFormTextBoxes Me.SubFormMay.Form
        clearSubFormTextBoxes Me.SubFormJun.Form
        clearSubFormTextBoxes Me.subFormJul.Form
        clearSubFormTextBoxes Me.subFormAug.Form
        clearSubFormTextBoxes Me.subFormSep.Form
        clearSubFormTextBoxes Me.SubFormOct.Form
        clearSubFormTextBoxes Me.subFormNov.Form
        clearSubFormTextBoxes Me.subFormDec.Form
    End If

End Sub

Private Sub cmdToday_Click()

'Set default values for fields
    Me![cboYear] = Format(Date, "yyyy")

    FillAllMonthLabels CInt(cboYear.Value)
    FillAllHolidays CInt(cboYear.Value)

    If Not IsNull(Me.cboEmployee) Then
        FillAllMonthTextBoxes CInt(cboYear.Value), Me.cboEmployee
    End If

    Me.[subFormVacPDSDSummary].Form.Requery    '============Added to requery subform and its data
    Me.cmdRptYearView.Caption = "Print Absence Calendar For " & Me.cboYear  '===========Added so the report button (cmdRptYearView) shows current year and text
    Me.cmdAbsenceForYear.Caption = "All Absences For " & Me.cboYear   'Added so the report button (cmdAbsenceForYear) shows current year and text
    Me.cmdQtrRpt.Caption = Me.cboYear & " Quarterly Absence Rpt"  '===========Added so the report button (cmdQtrRpt) shows current year and text

End Sub
Private Sub cboYear_Change()

    FillAllMonthLabels CInt(cboYear.Value)
    FillAllHolidays CInt(cboYear.Value)

    If Not IsNull(Me.cboEmployee) Then
        FillAllMonthTextBoxes CInt(cboYear.Value), Me.cboEmployee

    End If

'    Me.[subFormVacPDSDSummary].Form.Requery    '============Added to requery subform and its data
    Me.cmdRptYearView.Caption = "Print Absence Calendar For " & Me.cboYear  '===========Added so the report button (cmdRptYearView) shows current year and text
    Me.cmdAbsenceForYear.Caption = "All Absences For " & Me.cboYear   'Added so the report button (cmdAbsenceForYear) shows current year and text
    Me.cmdQtrRpt.Caption = Me.cboYear & " Quarterly Absence Rpt"  '===========Added so the report button (cmdQtrRpt) shows current year and text
    
    Me.frm_Abs_HolidayRightAndTaken.Form.Filter = "[yearVacation]= " & Me.cboYear
    Me.frm_Abs_HolidayRightAndTaken.Form.FilterOn = True

End Sub

'Private Sub Form_Close()
'
''Dont use in unload event.
'    DoCmd.ShowToolbar "Ribbon", acToolbarYes    ' Show the ribbon again
'    DoCmd.Quit
'
'End Sub

Private Sub cmdRptYearView_Click()

    If IsNull(Forms![frm_YearCalendar]![cboSecteur]) Then     'Added incase the grid is clicked on and a supervisor wasnt selected.
        MsgBox "You must select a supervisor before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboSecteur].SetFocus
        Forms![frm_YearCalendar]![cboSecteur].Dropdown

        Exit Sub
    End If

    If IsNull(Forms![frm_YearCalendar]![cboEmployee]) Then     'Added incase the grid is clicked on and an employee wasnt selected.
        MsgBox "You must select a employee before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboEmployee].SetFocus
        Forms![frm_YearCalendar]![cboEmployee].Dropdown

        Exit Sub
    End If

    'Print year calendar hidden
    On Error Resume Next
    DoCmd.OpenForm "rpt_YearView", acNormal, , , , acHidden
    DoCmd.RunCommand acCmdPrint
    DoCmd.Close acForm, "rpt_YearView"

End Sub

Private Sub cmdAbsenceForYear_Click()

    If IsNull(Forms![frm_YearCalendar]![cboSecteur]) Then     'Added incase the grid is clicked on and a supervisor wasnt selected.
        MsgBox "You must select a supervisor before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboSecteur].SetFocus
        Forms![frm_YearCalendar]![cboSecteur].Dropdown

        Exit Sub
    End If

    If IsNull(Forms![frm_YearCalendar]![cboEmployee]) Then     'Added incase the grid is clicked on and an employee wasnt selected.
        MsgBox "You must select a employee before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboEmployee].SetFocus
        Forms![frm_YearCalendar]![cboEmployee].Dropdown

        Exit Sub
    End If
    DoCmd.OpenReport "qryVacationTakenParam", acPreview
End Sub

Private Sub cmdQtrRpt_Click()

    If IsNull(Forms![frm_YearCalendar]![cboSecteur]) Then     'Added incase the grid is clicked on and a supervisor wasnt selected.
        MsgBox "You must select a supervisor before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboSecteur].SetFocus
        Forms![frm_YearCalendar]![cboSecteur].Dropdown

        Exit Sub
    End If

    If IsNull(Forms![frm_YearCalendar]![cboEmployee]) Then     'Added incase the grid is clicked on and an employee wasnt selected.
        MsgBox "You must select a employee before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboEmployee].SetFocus
        Forms![frm_YearCalendar]![cboEmployee].Dropdown

        Exit Sub
    End If
    DoCmd.OpenReport "rpt_YearAbsenceByQuarter", acPreview
End Sub

Private Sub cmdAbsenteeismRpt_Click()

    If IsNull(Forms![frm_YearCalendar]![cboSecteur]) Then     'Added incase the grid is clicked on and a supervisor wasnt selected.
        MsgBox "You must select a supervisor before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboSecteur].SetFocus
        Forms![frm_YearCalendar]![cboSecteur].Dropdown

        Exit Sub
    End If

    If IsNull(Forms![frm_YearCalendar]![cboEmployee]) Then     'Added incase the grid is clicked on and an employee wasnt selected.
        MsgBox "You must select a employee before entering data in the calendar!", vbExclamation, "Missing information"
        Forms![frm_YearCalendar]![cboEmployee].SetFocus
        Forms![frm_YearCalendar]![cboEmployee].Dropdown

        Exit Sub
    End If
    DoCmd.OpenReport "rpt_AbsenteeismPolicy", acPreview
End Sub
```


---
## mod_CalendarInputBox (Standard Module)

**Lines:** 133

```vba
Option Compare Database
Option Explicit

Public Function gridClick()
'==================================================================================================
'//This demoes a single function that fires when any of the forms grid text boxes are clicked which
'   brings up the form (frm_CalendarInputBox)so a absence can be entered.
'==================================================================================================
    Dim ctl As Access.Control
    Dim strMonth As String
    Dim intCol As String
    Dim IntMonth As Integer
    Dim intDay As Integer
    Dim frm As Access.Form
    Dim sFrm As Form_subFormMonth
    Dim intYear As Integer
    Dim selectedDate As Date
    Dim empID As Long
    Dim strWhere As String

    Set ctl = Screen.ActiveControl
    '//Set frm = ctl.Parent since using a subform
    Set sFrm = ctl.Parent
    Set frm = ctl.Parent.Parent
    intCol = CInt(Split(ctl.Tag, ";")(1))
    intYear = CInt(frm.cboYear.Value)
    IntMonth = getIntMonthFromString(sFrm.LblMonth.Caption)
    intDay = intCol - getOffset(intYear, IntMonth, vbSaturday)
    selectedDate = DateSerial(intYear, IntMonth, intDay)
    empID = Nz(frm.cboEmployee, 0)

    strWhere = "AbsenceDate = #" & Format(selectedDate, "mm/dd/yyyy") & "# AND EmployeeID = " & empID      'Added to us in DCount

    If IsNull(frm.[cboSecteur]) Then     'Added incase the grid is clicked on and a supervisor wasnt selected.
        MsgBox "Un secteur doit être sélectionné pour pouvoir entrer les données dans le calendrier!", vbExclamation, "Information manquante"
        frm.[cboSecteur].SetFocus
        frm.[cboSecteur].Dropdown
        Exit Function
    End If

    If IsNull(frm.[cboEmployee]) Then     'Added incase the grid is clicked on and an employee wasnt selected.
        MsgBox "Un employé doit être sélectionné pour pouvoir entrer les données dans le calendrier", vbExclamation, "Information manquante"
        frm.cboEmployee.SetFocus
        frm.cboEmployee.Dropdown
         Exit Function
    End If

    If DCount("*", "tbl_YearCalendar", strWhere) Then    'See if the date/employee exists
        'Date/Emp already exists open frm_CalendarInputBox to make changes
        DoCmd.OpenForm "frm_CalendarInputBox", , , , , acDialog, Format(selectedDate, "dd/mm/yyyy") & ";" & empID & ";" & intYear
    Else
        'Date/Emp doesnt exist open msgbox and ask if you want to create an absence
        Const cstrPrompt As String = "Aucun enregistrement n'est trouvé dans cette date.  Désiriez-vous créer une nouvelle absence?"
        If MsgBox(cstrPrompt, vbQuestion + vbYesNo) = vbYes Then
            'Yes I want to create an absence so open frm_CalendarInputBox
            DoCmd.OpenForm "frm_CalendarInputBox", , , , , acDialog, Format(selectedDate, "dd/mm/yyyy") & ";" & empID & ";" & intYear
            'Refill the text grid when frm_CalendarInputBox closes
            FillSubFormTextBoxes sFrm, empID, intYear, IntMonth
'            frm.[subFormVacPDSDSummary].Form.Requery    'Requery subform and its data
            frm.cmdAbsenteeismRpt.Caption = "Absenteeism Policy Rpt.... " & "(" & DLookup("[NumberOfIncidents]", "qry_NumberOfIncidents") & ")" & " Current Absences Reported Between " & Date & " - " & DateAdd("m", -6, Date)   'Added so the report button (cmdAbsenteeismRpt) shows current 6 months from/to and text
            sFrm.cmdSubFormTransButton.SetFocus    'Sets focus to hidden button so it doesnt show curser sitting in text box And/Or half colored because sub lost focus
        End If
           

        'Nope you canceled so lets get out of here and back to frm_YearCalendar
        sFrm.cmdSubFormTransButton.SetFocus 'Sets focus to hidden button so it doesnt show curser sitting in text box And/Or half colored because sub lost focus
        
        frm.Refresh
        Exit Function
    End If
   


  
    FillSubFormTextBoxes sFrm, empID, intYear, IntMonth
    frm.cmdAbsenteeismRpt.Caption = "règles d'absentéismes Rpt.... " & "(" & DLookup("[NumberOfIncidents]", "qry_NumberOfIncidents") & ")" & " Current Absences Reported Between " & Date & " - " & DateAdd("m", -6, Date)   'Added so the report button (cmdAbsenteeismRpt) shows current 6 months from/to and text
    sFrm.cmdSubFormTransButton.SetFocus    'Sets focus to hidden button so it doesnt show curser sitting in text box And/Or half colored because sub lost focus
'    frm.Requery
    frm.Refresh
End Function

Public Function getOffset(intYear As Integer, IntMonth As Integer, Optional DayOfWeekStartDate As Long = vbSunday) As Integer
'==================================================================================================
'If your calendar starts on Sunday and the first day of the month is on a Monday
'Then everything is shifted one day so label 2 is day one
'If the first day was Saturday then everything shifts 6 days. So label seven shows 1
'==================================================================================================
    Dim FirstOfMonth As Date
    FirstOfMonth = getFirstOfMonth(intYear, IntMonth)
    getOffset = Weekday(FirstOfMonth, DayOfWeekStartDate) - 1
End Function

Public Function getFirstOfMonth(intYear As Integer, IntMonth As Integer) As Date
    getFirstOfMonth = DateSerial(intYear, IntMonth, 1)
End Function

Public Function getDaysInMonth(FirstDayOfMonth As Date) As Integer
    getDaysInMonth = Day(DateAdd("m", 1, FirstDayOfMonth) - 1)   'Days in month.
End Function

Public Function getIntMonthFromString(strMonth As String) As Integer
'Assume Jan, Feb..Dec


Select Case strMonth
Case "Janvier"
strMonth = 1
Case "Février"
strMonth = 2
Case "Mars"
strMonth = 3
Case "Avril"
strMonth = 4
Case "Mai"
strMonth = 5
Case "Juin"
strMonth = 6
Case "Juillet"
strMonth = 7
Case "Août"
strMonth = 8
Case "Septembre"
strMonth = 9
Case "Octobre"
strMonth = 10
Case "Novembre"
strMonth = 11
Case "Décembre"
strMonth = 12
End Select

    getIntMonthFromString = Month("1/" & strMonth & "/2013")
End Function
```


---
## mod_FillHolidays (Standard Module)

**Lines:** 139

```vba
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

```


---
## mod_FillMonthLabels (Standard Module)

**Lines:** 43

```vba

Option Explicit

Public Sub FillSubFormMonthLabels(frm As Access.Form, TheYear As Integer, TheMonth As Integer)
'==================================================================================================
'//Fills the grids label(s) with the correct day and;
'  1) Hides day labels that dont have a date associated with them
'  2) Disable and locks text boxes without a date so data cant be entered
'==================================================================================================
    Dim ctl As Access.Label
    Dim ctlt As Access.TextBox    'Added to disable/lock text boxes without a date so data cant be entered
    Dim i As Integer
    Dim FirstDayOfMonth As Date   'First of month
    Dim DaysInMonth As Integer    'Days in month
    Dim intOffSet As Integer      'Offset to first label for month.
    Dim intDay As Integer         'Day under consideration.
    Dim ParentIsForm As Boolean
    Const ctlBackColor = 14211288    'Gray color thats used for Holiday shading/unshading
    'Need to know if the parent is a form or report because you can not do certain things with reports
    ParentIsForm = (TypeOf frm.Parent Is Access.Form)

    FirstDayOfMonth = getFirstOfMonth(TheYear, TheMonth)
    DaysInMonth = getDaysInMonth(FirstDayOfMonth)   'Days in month.
    intOffSet = getOffset(TheYear, TheMonth, vbSaturday)    'Offset to first label for month.
    ' Debug.Print DaysInMonth
    If ParentIsForm Then frm.cmdSubFormTransButton.SetFocus    'Sets focus to a transparent button in the subcalendar form
    For i = 1 To 37
        Set ctl = frm.Controls("lbl" & i)
        Set ctlt = frm.Controls("txt" & i)    'Added to disable/lock text boxes without a date so data cant be entered
        ctl.Caption = ""
        ctl.BackColor = ctlBackColor  'Resets the backcolor to Gray
        intDay = i - intOffSet        'Transforms label number to day in month
        If intDay > 0 And intDay <= DaysInMonth Then
            ctl.Caption = intDay  'Displays day number in correct label
            If ParentIsForm Then ctlt.Enabled = True
            'Added to enable textbox(s) that have a date associated with them
            ctl.Visible = True    'Added so the months labels that display a date show on the grid
        Else
            If ParentIsForm Then ctlt.Enabled = False    'Added to disable/lock text boxes without a date so data cant be entered
            ctl.Visible = False    'Added so months lables that don't display or have a date do not show on grid
        End If
    Next i
End Sub
```


---
## mod_YearsOfService (Standard Module)

**Lines:** 90

```vba
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


```


---
## mod_ShortcutMenuCommands (Standard Module)

**Lines:** 116

```vba
Option Compare Database
Option Explicit

Public Function PrintActiveRptFrm() As String
'==================================================================================================
'//Code works with right click for print dialog box for my reports.
'==================================================================================================
    Dim rptCur As Access.Report
    Set rptCur = Screen.ActiveReport

    On Error Resume Next
    DoCmd.SelectObject acReport, rptCur
    DoCmd.RunCommand acCmdPrint

    'Close the report
    CloseAllReports

End Function

Public Function EmailAsPDF()
'==================================================================================================
'//Code works with right click for my reports
'
'//Reference: Microsoft Outlook 12.0 Object Library
'==================================================================================================
    On Error GoTo Error_Handler
    Dim objOutlook As Outlook.Application
    Dim objEmail As Outlook.MailItem
    Dim strSubject As String
    Dim strMessageText As String
    Dim rptCur As Access.Report
    Dim AttachmentName As String
    Set rptCur = Screen.ActiveReport
    

    strSubject = "Absences Pour " & rptCur.EmpName
    
    
    strMessageText = "Ci-joint est le rapport d'absence de " & rptCur.EmpName & _
                   " pour " & rptCur.AbsenceMonthName & "."
    Set objOutlook = CreateObject("Outlook.application")
    Set objEmail = objOutlook.CreateItem(olMailItem)
    AttachmentName = SaveOpenReportAsPDF(rptCur.Name, rptCur.Caption)
    
    
    'Debug.Print AttachmentName
    With objEmail
    
        If IsNull(rptCur.mailAddress) Or rptCur.mailAddress = "" Then
        Else
        .To = rptCur.mailAddress
        End If
       
        
        .Subject = strSubject
        .Body = strMessageText
        .Attachments.Add AttachmentName
        .Display
    End With
    DeleteSavedReport AttachmentName    'Deletes the saved .pdf
    CloseAllReports    'Close Report
Exit_Here:
    Set objOutlook = Nothing
    Exit Function
Error_Handler:
    MsgBox Err & ": " & Err.Description
    CloseAllReports
    Resume Exit_Here
End Function

Public Function SaveOpenReportAsPDF(strReportName As String, strReportCaption As String) As String
'==================================================================================================
'Create report and save as an attachment to the current record
'==================================================================================================
    Dim myCurrentDir As String
    Dim myReportOutput As String
    Dim myMessage As String

    On Error GoTo ErrorHandler
    myCurrentDir = CurrentProject.Path & "\"
    myReportOutput = myCurrentDir & strReportCaption & ".pdf"
    If Dir(myReportOutput) <> "" Then    ' the file already exists--delete it first.
        VBA.SetAttr myReportOutput, vbNormal    ' remove any file attributes (e.g. read-only) that would block the kill command.
        VBA.Kill myReportOutput    ' delete the file.
    End If
    DoCmd.OutputTo acOutputReport, strReportName, acFormatPDF, myReportOutput, , , , acExportQualityPrint
    SaveOpenReportAsPDF = myReportOutput
    Exit Function
ErrorHandler:
    MsgBox Error$
End Function

Public Function DeleteSavedReport(FileName As String)
'==================================================================================================
'//Delete the saved .pdf, Filename is complete path and file name
'==================================================================================================
    On Error GoTo ErrorHandler
    If Dir(FileName) <> "" Then    ' the file already exists--delete it
        VBA.SetAttr FileName, vbNormal    ' remove any file attributes (e.g. read-only) that would block the kill command.
        VBA.Kill FileName    ' delete the file.
    End If
ErrorHandler:
    MsgBox Error$
End Function

Public Sub CloseAllReports()
'==================================================================================================
'//Code used to close the current report
'==================================================================================================
    Dim rpt As Access.Report
    For Each rpt In Application.Reports
        DoCmd.Close acReport, rpt.Name
    Next rpt
End Sub


```


---
## Report_rpt_AbsenteeismPolicy (Document Module)

**Lines:** 76

```vba
Option Compare Database
Dim blnalternate As Boolean
Dim bool_nodata As Boolean

Private Sub GroupHeader1_Format(Cancel As Integer, FormatCount As Integer)
    If blnalternate Then
        Detail.BackColor = vbWhite
        GroupHeader1.BackColor = vbWhite
    Else
        Detail.BackColor = RGB(237, 247, 249)    '16777184
        GroupHeader1.BackColor = RGB(237, 247, 249)    '16777184
    End If
    blnalternate = Not (blnalternate)
End Sub

Private Sub Report_NoData(Cancel As Integer)
    bool_nodata = True
End Sub

Private Sub Report_Page()
    If bool_nodata = True Then
        MsgBox "You do not have any absences toward the absenteeism and tardiness program.", vbExclamation, "Message Alert"
        DoCmd.Close acReport, "rpt_AbsenteeismPolicy", acSaveNo
    End If
End Sub

Private Sub Report_Load()
    CreateReportShortcutMenu
End Sub

Private Sub CreateReportShortcutMenu()
'==================================================================================================
'//In the Report_Load Event enter CreateReportShortcutMenu then in the reports Property/Shortcut
'   Menu Bar enter the MenuName "vbaShortCutMenu"
'
'//The numbers are Ms Access Control numbers you can download and excel file from MS
'
'//Reference: Microsoft Office 12.0 Object Library
'==================================================================================================

    Dim MenuName As String
    Dim CB As CommandBar
    Dim CBB As CommandBarButton

    MenuName = "vbaShortCutMenu"

    On Error Resume Next
    Application.CommandBars(MenuName).Delete
    On Error GoTo 0

    'The below code creates the menu I named vbaShortCutMenu
    Set CB = Application.CommandBars.Add(MenuName, msoBarPopup, False, False)

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Print..."
    CBB.Tag = "Print..."
    CBB.OnAction = "=PrintActiveRptFrm()"  'Calls a module with EmailAsPDF()

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Send E-mail..."
    CBB.Tag = "Send E-mail..."
    CBB.OnAction = "=EmailAsPDF()"  'Calls a module with EmailAsPDF()

    'Adds the Close command.
    'Set CBB = CB.Controls.Add(msoControlButton, 923, , , True)
    'Starts a new group.
    'CBB.BeginGroup = True
    'Change the caption displayed for the control.
    'CBB.Caption = "Close Report"

    Set CB = Nothing
    Set CBB = Nothing

End Sub


```


---
## Report_rpt_YearAbsenceByQuarter (Document Module)

**Lines:** 76

```vba
Option Compare Database
Dim blnalternate As Boolean
Dim bool_nodata As Boolean

Private Sub GroupHeader1_Format(Cancel As Integer, FormatCount As Integer)
    If blnalternate Then
        Detail.BackColor = vbWhite
        GroupHeader1.BackColor = vbWhite
    Else
        Detail.BackColor = RGB(237, 247, 249)    '16777184
        GroupHeader1.BackColor = RGB(237, 247, 249)    '16777184
    End If
    blnalternate = Not (blnalternate)
End Sub

Private Sub Report_NoData(Cancel As Integer)
    bool_nodata = True
End Sub

Private Sub Report_Page()
    If bool_nodata = True Then
        MsgBox "You do not have any absences toward the absenteeism and tardiness program.", vbExclamation, "Message Alert"
        DoCmd.Close acReport, "rpt_YearAbsenceByQuarter", acSaveNo
    End If
End Sub

Private Sub Report_Load()
    CreateReportShortcutMenu
End Sub

Private Sub CreateReportShortcutMenu()
'==================================================================================================
'//In the Report_Load Event enter CreateReportShortcutMenu then in the reports Property/Shortcut
'   Menu Bar enter the MenuName "vbaShortCutMenu"
'
'//The numbers are Ms Access Control numbers you can download and excel file from MS
'
'//Reference: Microsoft Office 12.0 Object Library
'==================================================================================================

    Dim MenuName As String
    Dim CB As CommandBar
    Dim CBB As CommandBarButton

    MenuName = "vbaShortCutMenu"

    On Error Resume Next
    Application.CommandBars(MenuName).Delete
    On Error GoTo 0

    'The below code creates the menu I named vbaShortCutMenu
    Set CB = Application.CommandBars.Add(MenuName, msoBarPopup, False, False)

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Print..."
    CBB.Tag = "Print..."
    CBB.OnAction = "=PrintActiveRptFrm()"  'Calls a module with EmailAsPDF()

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Send E-mail..."
    CBB.Tag = "Send E-mail..."
    CBB.OnAction = "=EmailAsPDF()"  'Calls a module with EmailAsPDF()

    'Adds the Close command.
    'Set CBB = CB.Controls.Add(msoControlButton, 923, , , True)
    'Starts a new group.
    'CBB.BeginGroup = True
    'Change the caption displayed for the control.
    'CBB.Caption = "Close Report"

    Set CB = Nothing
    Set CBB = Nothing

End Sub


```


---
## Form_subFormVacPDSDSummary (Document Module)

**Lines:** 56

```vba
Option Compare Database
Option Explicit

Private Sub Form_Current()
'==================================================================================================
'//Code so the zeros shows red and bold
'==================================================================================================
'//Vacation Days
    If Me.txtVacHoursLeft = 0 Then
        Me.txtVacHoursLeft.ForeColor = vbRed
        Me.txtVacHoursLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtVacHoursLeft.FontBold = True
    ElseIf Me.txtVacHoursLeft < 0 Then
        Me.txtVacHoursLeft.ForeColor = vbWhite
        Me.txtVacHoursLeft.BackColor = vbRed
        Me.txtVacHoursLeft.FontBold = True
        MsgBox "Vacation Days Overdrawn", vbCritical
    Else
        Me.txtVacHoursLeft.ForeColor = vbBlack
        Me.txtVacHoursLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtVacHoursLeft.FontBold = False
    End If

    '//Personal Days
    If Me.txtPersonalDaysLeft = 0 Then
        Me.txtPersonalDaysLeft.ForeColor = vbRed
        Me.txtPersonalDaysLeft.BackColor = vbWhite
        Me.txtPersonalDaysLeft.FontBold = True
    ElseIf Me.txtPersonalDaysLeft < 0 Then
        Me.txtPersonalDaysLeft.ForeColor = vbWhite
        Me.txtPersonalDaysLeft.BackColor = vbRed
        Me.txtPersonalDaysLeft.FontBold = True
        MsgBox "Personal Days Overdrawn", vbCritical
    Else
        Me.txtPersonalDaysLeft.ForeColor = vbBlack
        Me.txtPersonalDaysLeft.BackColor = vbWhite
        Me.txtPersonalDaysLeft.FontBold = False
    End If

    '//Sick Days
    If Me.txtSickDaysLeft <= 0 Then
        Me.txtSickDaysLeft.ForeColor = vbRed
        Me.txtSickDaysLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtSickDaysLeft.FontBold = True
    ElseIf Me.txtSickDaysLeft < 0 Then
        Me.txtSickDaysLeft.ForeColor = vbWhite
        Me.txtSickDaysLeft.BackColor = vbRed
        Me.txtSickDaysLeft.FontBold = True
        MsgBox "Sick Days Overdrawn", vbCritical
    Else
        Me.txtSickDaysLeft.ForeColor = vbBlack
        Me.txtSickDaysLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtSickDaysLeft.FontBold = False
    End If

End Sub
```


---
## mod_FillTextBoxes (Standard Module)

**Lines:** 147

```vba
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

```


---
## Form_subFormCalendarInputBox (Document Module)

**Lines:** 201

```vba
Option Compare Database
Option Explicit

Public Function LimitRecords(frm As Access.Form, Optional RecLimit As Integer = 1)
'http://www.datagnostics.com/dtips/limitentries.html
' Limit the number of records in the form passed as
' to no more than the number specified by .
    With frm.RecordsetClone
        If .RecordCount <> 0 Then .MoveLast
        frm.AllowAdditions = (.RecordCount < RecLimit)
    End With

End Function

Private Sub cmdDeleteAbsence_Click()
'--------------------------------------------------------------------------------------------------
'  Deletes selected absence
'--------------------------------------------------------------------------------------------------
Dim parentID As Long
Dim strsql As String
DoCmd.SetWarnings False
    
    If IsNull(Me.txtAttendanceID) Then
            MsgBox "There is no absence to delete!", vbInformation, "No Absence"
      Exit Sub
    End If
        
     If MsgBox("Are you sure you want to delete this absence?" & vbCrLf _
                & "There is no way to recover these records if you say 'Yes'.", vbCritical + vbYesNo, "Confirm Deletion Of Absence") = vbYes Then
        
        
            If IsNull(Me.HolidaySelectionID) Then
                      DoCmd.RunCommand acCmdDeleteRecord
                      DoCmd.Close acForm, "frm_CalendarInputBox"
                  Else
                      parentID = Me.HolidaySelectionID
                      DoCmd.RunCommand acCmdDeleteRecord
                      strsql = "SELECT TOP 1 * FROM tbl_Abs_HolidaySelection where HolidaySelectionID = " & parentID
                    Call deleterecord(strsql)
            End If
        Else
    End If

DoCmd.SetWarnings True
                      DoCmd.Close acForm, "frm_CalendarInputBox"


End Sub

Private Sub cmdSpellCheck_Click()
'--------------------------------------------------------------------------------------------------
'  Spell checker for the AbsenceReason memo field
'--------------------------------------------------------------------------------------------------
    If IsNull(txtAbsenceReason) = True Then
        MsgBox "There is no data to spell check", vbInformation, "Spell Check"
        Exit Sub
    Else
        With Me!txtAbsenceReason
            Me.txtAbsenceReason.SetFocus
            If Len(.Value) > 0 Then
                DoCmd.SetWarnings False
                .SelStart = 1
                .SelLength = Len(.Value)
                DoCmd.RunCommand acCmdSpelling
                .SelLength = 0
                DoCmd.SetWarnings True
            End If
        End With
    End If
End Sub
Private Sub Form_BeforeUpdate(Cancel As Integer)
'--------------------------------------------------------------------------------------------------
'  Valadate data in subform before moving to next record or closing frm_CalendarInputBox
'--------------------------------------------------------------------------------------------------

    Dim ctl As Access.Control
    Dim strErrCtlName As String
    Dim strErrorMessage As String
    Dim strMsgName As String
    Dim lngErrCtlTabIndex As Long
    Dim blnNoValue As Boolean
'    Dim sdsd As String
    
    Select Case Me.TimeType.Value
    
    Case "H/M"
    Me.txtAbsenceTime.Tag = "Required"
     Me.txtAbsenceDays.Tag = ""
    Case "Jours"
    Me.txtAbsenceDays.Tag = "Required"
    Me.txtAbsenceTime.Tag = ""
    End Select
    
    
    

    lngErrCtlTabIndex = 99999999  'more than max #controls

    For Each ctl In Me.Controls
        With ctl
            Select Case .ControlType
            Case acTextBox, acComboBox, acListBox, acCheckBox
                If .Tag = "Required" Then
                    blnNoValue = False
                    If IsNull(.Value) Then
                        blnNoValue = True
                    Else
                        If .ControlType = acTextBox Then
                            If Len(.Value) = 0 Then
                                blnNoValue = True
                            End If
                        End If
                    End If

                    If blnNoValue Then

                        strMsgName = vbNullString
                        If .Controls.Count = 1 Then
                            strMsgName = .Controls(0).Caption
                            If Right$(strMsgName, 1) = ":" Then
                                strMsgName = Trim$(Left$(strMsgName, Len(strMsgName) - 1))
                            End If
                        End If
                        If Len(strMsgName) = 0 Then
                            strMsgName = .Name
                            Select Case Left$(strMsgName, 3)
                            Case "txt", "cbo", "lst", "chk"
                                strMsgName = Mid(strMsgName, 4)
                            End Select
                        End If

                        strErrorMessage = strErrorMessage & vbCr & _
                                        "   " & strMsgName

                        If .TabIndex < lngErrCtlTabIndex Then
                            strErrCtlName = .Name
                            lngErrCtlTabIndex = .TabIndex
                        End If

                    End If
                End If
            Case Else
                ' Ignore this control
            End Select
        End With
    Next ctl

    If Len(strErrorMessage) > 0 Then
        MsgBox "A moins que vous supprimez cet enregistrement les champs suivants sont requis:" & vbCr & _
               strErrorMessage, _
               vbInformation, "Champs requis sont vides"
        Me.Controls(strErrCtlName).SetFocus
        Cancel = True
    Else
'    sdsd = Me.txtAbsenceReason.Value

Select Case Me.TimeType

Case "H/M"

Me.HolidaySelectionID.Value = RecordSelectionGetID(Me.EmployeeID.Value, Me.AbsenceDate.Value, Me.AbsenceDate.Value, 0, Me.AbsenceID.Value, Me.yearVacation.Value, Me.AbsenceTime.Value, Me.txtAbsenceReason.Value)

Case "Jours"

Me.HolidaySelectionID.Value = RecordSelectionGetID(Me.EmployeeID.Value, Me.AbsenceDate.Value, Me.AbsenceDate.Value, Me.AbsenceDays.Value, Me.AbsenceID.Value, Me.yearVacation.Value, "", Me.txtAbsenceReason.Value)

End Select
        Cancel = False
    End If
End Sub

Private Sub Form_Current()
'--------------------------------------------------------------------------------------------------
'  Limit number of records you want to allow
'
'//http://www.datagnostics.com/dtips/limitentries.html
'--------------------------------------------------------------------------------------------------

'LimitRecords Me   ' Allows at most 1 record
'    LimitRecords Me, 2   ' Allow at most 2 records
LimitRecords Me, 3   ' Allow at most 3 records
'LimitRecords Me, 4   ' Allow at most 4 records
'LimitRecords Me, 5   ' Allow at most 5 records

End Sub

Private Sub txtAbsenceReason_Change()
'--------------------------------------------------------------------------------------------------
'  Limit the amount of text you can enter
'--------------------------------------------------------------------------------------------------
    Dim CharCount As Integer

    If Not IsNull(Len(txtAbsenceReason)) Then
        CharCount = Len(txtAbsenceReason.Text)
        If CharCount > 138 Then
            MsgBox "You've reached the a 138 charactor text limit", vbInformation, "Limit Reached"
            Me.txtAbsenceReason = Left(Me.txtAbsenceReason.Text, 138)
        End If
    End If
End Sub

```


---
## Form_rpt_YearView (Document Module)

**Lines:** 98

```vba
Option Compare Database
Option Explicit

Public sFrmJan As Form_rpt_YearViewCal
Public sFrmFeb As Form_rpt_YearViewCal
Public sFrmMar As Form_rpt_YearViewCal
Public sFrmApr As Form_rpt_YearViewCal
Public sFrmMay As Form_rpt_YearViewCal
Public sFrmJun As Form_rpt_YearViewCal
Public sFrmJul As Form_rpt_YearViewCal
Public sFrmAug As Form_rpt_YearViewCal
Public sFrmSep As Form_rpt_YearViewCal
Public sFrmOct As Form_rpt_YearViewCal
Public sFrmNov As Form_rpt_YearViewCal
Public sFrmDec As Form_rpt_YearViewCal

Private Sub Form_Load()

    Set sFrmJan = Me.childCalendarMonth1.Form
    Set sFrmFeb = Me.childCalendarMonth2.Form
    Set sFrmMar = Me.childCalendarMonth3.Form
    Set sFrmApr = Me.childCalendarMonth4.Form
    Set sFrmMay = Me.childCalendarMonth5.Form
    Set sFrmJun = Me.childCalendarMonth6.Form
    Set sFrmJul = Me.childCalendarMonth7.Form
    Set sFrmAug = Me.childCalendarMonth8.Form
    Set sFrmSep = Me.childCalendarMonth9.Form
    Set sFrmOct = Me.childCalendarMonth10.Form
    Set sFrmNov = Me.childCalendarMonth11.Form
    Set sFrmDec = Me.childCalendarMonth12.Form

    '//Fills the subFomrMonths LblMonth with the appropiate month
    sFrmJan.LblMonth.Caption = "Janvier" & "     (" & Me.txtEmployeeName & " - " & Me.txtYear & ")"
    sFrmFeb.LblMonth.Caption = "Février"
    sFrmMar.LblMonth.Caption = "Mars"
    sFrmApr.LblMonth.Caption = "Avril"
    sFrmMay.LblMonth.Caption = "Mai"
    sFrmJun.LblMonth.Caption = "Juin"
    sFrmJul.LblMonth.Caption = "Juillet"
    sFrmAug.LblMonth.Caption = "Août"
    sFrmSep.LblMonth.Caption = "Septembre"
    sFrmOct.LblMonth.Caption = "Octobre"
    sFrmNov.LblMonth.Caption = "Novembre"
    sFrmDec.LblMonth.Caption = "Décembre"

    FillAllMonthLabels (Me.Year)    'Fills the subFormMonths days for the year based on cboYear
    FillAllHolidays Me.Year   'Fills the subFormMonths holidays for the year based on cboYear
    Me.FillAllMonthTextBoxes Me.Year, Me.EmployeeID
End Sub


Private Sub FillAllMonthLabels(TheYear As Integer)
'Used to fill in month labels
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmJan, TheYear, 1
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmFeb, TheYear, 2
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmMar, TheYear, 3
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmApr, TheYear, 4
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmMay, TheYear, 5
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmJun, TheYear, 6
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmJul, TheYear, 7
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmAug, TheYear, 8
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmSep, TheYear, 9
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmOct, TheYear, 10
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmNov, TheYear, 11
    mod_FillMonthLabels.FillSubFormMonthLabels sFrmDec, TheYear, 12
End Sub

Public Sub FillAllMonthTextBoxes(TheYear As Integer, empID As Long)
'Used to fill in text boxes
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmJan, empID, TheYear, 1
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmFeb, empID, TheYear, 2
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmMar, empID, TheYear, 3
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmApr, empID, TheYear, 4
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmMay, empID, TheYear, 5
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmJun, empID, TheYear, 6
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmJul, empID, TheYear, 7
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmAug, empID, TheYear, 8
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmSep, empID, TheYear, 9
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmOct, empID, TheYear, 10
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmNov, empID, TheYear, 11
    mod_FillTextBoxes.FillSubFormTextBoxes sFrmDec, empID, TheYear, 12
End Sub

Public Sub FillAllHolidays(TheYear As Integer)
'Used to fill in holidays
    FillHolidays sFrmJan, TheYear, 1
    FillHolidays sFrmFeb, TheYear, 2
    FillHolidays sFrmMar, TheYear, 3
    FillHolidays sFrmApr, TheYear, 4
    FillHolidays sFrmMay, TheYear, 5
    FillHolidays sFrmJun, TheYear, 6
    FillHolidays sFrmJul, TheYear, 7
    FillHolidays sFrmAug, TheYear, 8
    FillHolidays sFrmSep, TheYear, 9
    FillHolidays sFrmOct, TheYear, 10
    FillHolidays sFrmNov, TheYear, 11
    FillHolidays sFrmDec, TheYear, 12
End Sub
```


---
## Form_rpt_YearViewCal (Document Module)

**Lines:** 1

```vba
Option Compare Database
```


---
## Form_subFormMonth (Document Module)

**Lines:** 1

```vba
Option Compare Database
```


---
## Report_rpt_AbsencesForYear (Document Module)

**Lines:** 75

```vba
Option Compare Database
Dim blnalternate As Boolean
Dim bool_nodata As Boolean

Private Sub GroupHeader1_Format(Cancel As Integer, FormatCount As Integer)
    If blnalternate Then
        Detail.BackColor = vbWhite
        GroupHeader1.BackColor = vbWhite
    Else
        Detail.BackColor = RGB(237, 247, 249)    '16777184
        GroupHeader1.BackColor = RGB(237, 247, 249)    '16777184
    End If
    blnalternate = Not (blnalternate)
End Sub

Private Sub Report_NoData(Cancel As Integer)
    bool_nodata = True
End Sub

Private Sub Report_Page()
    If bool_nodata = True Then
        MsgBox "You do not have any absences toward the absenteeism and tardiness program.", vbExclamation, "Message Alert"
        DoCmd.Close acReport, "rpt_AbsenteeismPolicy", acSaveNo
    End If
End Sub

Private Sub Report_Load()
    CreateReportShortcutMenu
End Sub

Private Sub CreateReportShortcutMenu()
'==================================================================================================
'//In the Report_Load Event enter CreateReportShortcutMenu then in the reports Property/Shortcut
'   Menu Bar enter the MenuName "vbaShortCutMenu"
'
'//The numbers are Ms Access Control numbers you can download and excel file from MS
'
'//Reference: Microsoft Office 12.0 Object Library
'==================================================================================================

    Dim MenuName As String
    Dim CB As CommandBar
    Dim CBB As CommandBarButton

    MenuName = "vbaShortCutMenu"

    On Error Resume Next
    Application.CommandBars(MenuName).Delete
    On Error GoTo 0

    'The below code creates the menu I named vbaShortCutMenu
    Set CB = Application.CommandBars.Add(MenuName, msoBarPopup, False, False)

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Print..."
    CBB.Tag = "Print..."
    CBB.OnAction = "=PrintActiveRptFrm()"  'Calls a module mod_ShortCutMenuCommands Public Function PrintActiveRptFrm()

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Send E-mail..."
    CBB.Tag = "Send E-mail..."
    CBB.OnAction = "=EmailAsPDF()"  'Calls a module mod_ShortCutMenuCommands Public Function EmailAsPDF()

    'Adds the Close command.
    'Set CBB = CB.Controls.Add(msoControlButton, 923, , , True)
    'Starts a new group.
    'CBB.BeginGroup = True
    'Change the caption displayed for the control.
    'CBB.Caption = "Close Report"

    Set CB = Nothing
    Set CBB = Nothing

End Sub

```


---
## Form_ximportantfrm_UpdateEmpInfo (Document Module)

**Lines:** 200

```vba
Option Compare Database
Option Explicit

Private Sub chkStatus_AfterUpdate()
'==================================================================================================
'//Warnings so it lets the user know that if checked then the employees name will no longer be visible
'     In menus, combo boxes ect. unless unchecked.
'==================================================================================================

    If chkStatus = True Then
        If MsgBox("Are you sure you wish to change employee status to INACTIVE?", vbQuestion + vbYesNo, "Set to Active?") = vbYes Then
            Me.Requery
        Else
            Me.chkStatus = False
            Me.Requery
        End If
    Else

        If chkStatus = False Then
            If MsgBox("Are you sure you want to change the employee status to ACTIVE?", vbQuestion + vbYesNo, "Set to InActive?") = vbYes Then
                Me.Requery
            Else
                Me.chkStatus = True
                Me.Requery
            End If
        End If
    End If
End Sub

Private Sub cmdAddNew_Click()
'==================================================================================================
'//Adds new employee info to the table tbluEmployees
'==================================================================================================
    Dim db As DAO.Database
    Dim rs As DAO.Recordset
    Dim strsql As String

    If IsNull(Me.cboNewSupervisorID) Then
        MsgBox "A Supervisor must be provided! ", vbCritical, "Entry Error"
        Me.cboNewSupervisorID.SetFocus
        Me.cboNewSupervisorID.Dropdown
        Exit Sub

    ElseIf IsNull(Me.txtNewEmpDateOfHire) Then
        MsgBox "A Supervisor must be provided! ", vbCritical, "Entry Error"
        Me.txtNewEmpDateOfHire.SetFocus
        Exit Sub

    ElseIf IsNull(Me.txtNewEmpFName) Then
        MsgBox "An Employees date of hire must be provided! ", vbCritical, "Entry Error"
        Me.txtNewEmpFName.SetFocus
        Exit Sub

    ElseIf IsNull(Me.txtNewEmpLName) Then
        MsgBox "An Employees last name must be provided! ", vbCritical, "Entry Error"
        Me.txtNewEmpLName.SetFocus
        Exit Sub

    Else

        Set db = CurrentDb
        Set rs = db.OpenRecordset("tbluEmployees", dbOpenDynaset)
        rs.AddNew
        rs!SupervisorID = Me.cboNewSupervisorID
        rs!EmpDateOfHire = Me.txtNewEmpDateOfHire
        rs!EmpFName = Me.txtNewEmpFName
        rs!EmpLName = Me.txtNewEmpLName


        rs.Update

        Me.cboNewSupervisorID = Null
        Me.txtNewEmpDateOfHire = Null
        Me.txtNewEmpFName = Null
        Me.txtNewEmpLName = Null
        Me.Requery
        Me.txtNewEmpDateOfHire.Enabled = False
        Me.txtNewEmpFName.Enabled = False
        Me.txtNewEmpLName.Enabled = False
        Me.cmdAddNew.Enabled = False

    End If
End Sub

Private Sub cmdBoughtVac_Click()
    Dim stLinkCriteria As String

    stLinkCriteria = "[EmployeeID]=" & Me![txtEmployeeID]
    DoCmd.OpenForm "frm_UpdateEmpInfoBoughtVac", , , stLinkCriteria

End Sub

Private Sub cmdDeleteEmployee_Click()
'==================================================================================================
'//Deletes the selected employee and all thier records
'==================================================================================================
    Dim strsql As String

    strsql = "DELETE * FROM tbluEmployees WHERE EmployeeID=" & Forms!frm_UpdateEmployeeInformation!txtEmployeeID


    If MsgBox("Are you sure you want to delete this employee and thier entire records?" & vbCrLf _
            & "There is no way to recover these records if you say 'Yes'.", vbCritical + vbYesNo, "Confirm Deletion Of Employee") = vbYes Then

        CurrentDb.Execute strsql    'Exicute the delete SQL
        Me.Requery    'Requery the list
    End If
End Sub

Private Sub Form_BeforeUpdate(Cancel As Integer)
'--------------------------------------------------------------------------------------------------
'//Valadate data before moving to next record or closing form.
'//Note: Controls you want checked use "Required" in its tag property
'--------------------------------------------------------------------------------------------------

    Dim ctl As Access.Control
    Dim strErrCtlName As String
    Dim strErrorMessage As String
    Dim strMsgName As String
    Dim lngErrCtlTabIndex As Long
    Dim blnNoValue As Boolean

    lngErrCtlTabIndex = 99999999  'more than max #controls

    For Each ctl In Me.Controls
        With ctl
            Select Case .ControlType
            Case acTextBox, acComboBox, acListBox, acCheckBox
                If .Tag = "Required" Then
                    blnNoValue = False
                    If IsNull(.Value) Then
                        blnNoValue = True
                    Else
                        If .ControlType = acTextBox Then
                            If Len(.Value) = 0 Then
                                blnNoValue = True
                            End If
                        End If
                    End If

                    If blnNoValue Then

                        strMsgName = vbNullString
                        If .Controls.Count = 1 Then
                            strMsgName = .Controls(0).Caption
                            If Right$(strMsgName, 1) = ":" Then
                                strMsgName = Trim$(Left$(strMsgName, Len(strMsgName) - 1))
                            End If
                        End If
                        If Len(strMsgName) = 0 Then
                            strMsgName = .Name
                            Select Case Left$(strMsgName, 3)
                            Case "txt", "cbo", "lst", "chk"
                                strMsgName = Mid(strMsgName, 4)
                            End Select
                        End If

                        strErrorMessage = strErrorMessage & vbCr & _
                                        "   " & strMsgName

                        If .TabIndex < lngErrCtlTabIndex Then
                            strErrCtlName = .Name
                            lngErrCtlTabIndex = .TabIndex
                        End If

                    End If
                End If
            Case Else
                ' Ignore this control
            End Select
        End With
    Next ctl

    If Len(strErrorMessage) > 0 Then
        MsgBox "Unless you delete this record the following fields are required:" & vbCr & _
               strErrorMessage, _
               vbInformation, "Required Fields Are Missing"
        Me.Controls(strErrCtlName).SetFocus
        Cancel = True
    Else
        Cancel = False
    End If
End Sub

Private Sub cboNewSupervisorID_AfterUpdate()
    Me.txtNewEmpDateOfHire.Enabled = True
End Sub

Private Sub txtNewEmpDateOfHire_AfterUpdate()
    Me.txtNewEmpFName.Enabled = True
End Sub

Private Sub txtNewEmpFName_AfterUpdate()
    Me.txtNewEmpLName.Enabled = True
End Sub

Private Sub txtNewEmpLName_AfterUpdate()
    Me.cmdAddNew.Enabled = True
End Sub

```


---
## Form_frm_Emp_Employee Details (Document Module)

**Lines:** 269

```vba

Private Sub cmdClose_Click()
DoCmd.Close acForm, Me.Form.Name
End Sub

Private Sub Command1144_Click()
DoCmd.OpenForm "frm_Abs_HolidayInputForm", acNormal, , , , acDialog, Me.EmployeeID
Me.Form.Refresh

End Sub

Private Sub Command1145_Click()
DoCmd.OpenForm "frm_YearCalendar", acNormal, , , , , Me.SecteurID & "_" & Me.EmployeeID
End Sub

Private Sub ContractGen_Click()
Dim strWordDoc  As String

    'Path to the word document of the Mail Merge
    
    
    '###-1 CHANGE THE FOLLOWING LINE TO POINT TO YOUR DOCUMENT!!
    
    strWordDoc = Me.ContractType.Value
    
    
    strWordDoc = CurrentProject.Path & "\Contrats Modèles\" & strWordDoc & ".docx"

    ' Call the code to merge the latest info
    startMerge strWordDoc
End Sub


'----------------------------------------------------
' Auto Mail Merge With VBA and Access (Early Binding)
'----------------------------------------------------
' NOTE: To use this code, you must reference
' The Microsoft Word 14.0 (or current version)
' Object Library by clicking menu Tools > References
' Check the box for:
' Microsoft Word 14.0 Object Library in Word 2010
' Microsoft Word 15.0 Object Library in Word 2013
' Click OK
'----------------------------------------------------
Function startMerge(strDocPath As String)
    Dim oWord           As Word.Application
    Dim oWdoc           As Word.Document
    Dim wdInputName     As String
    Dim wdOutputName    As String
    Dim outFileName     As String

    ' Set Template Path
    wdInputName = strDocPath            ' was CurrentProject.Path & "\mail_merge.docx"

    ' Create unique save filename with minutes and seconds to prevent overwrite
    outFileName = "Contract_" & Format(Now(), "yyyymmddmms")

    ' Output File Path w/outFileName
    wdOutputName = CurrentProject.Path & "\Contrats Employés\" & outFileName

            strsql = "SELECT * FROM tbl_Emp_Employees where EmployeeID = " & Me.EmployeeID      ' Change the table name or your query


    Set oWord = New Word.Application
    Set oWdoc = oWord.Documents.Open(wdInputName)





    ' Start mail merge

    '###-2 CHANGE THE SQLSTATEMENT AS NEEDED
    With oWdoc.MailMerge
        .MainDocumentType = wdFormLetters
        .OpenDataSource _
            Name:=CurrentProject.FullName, _
            ReadOnly:=True, _
            AddToRecentFiles:=False, _
            LinkToSource:=True, _
            Connection:="QUERY mailmerge", SQLStatement:=strsql                   ' Change the table name or your query
        .Destination = wdSendToNewDocument
       
    End With
    
     oWdoc.MailMerge.Execute Pause:=False

    ' Hide Word During Merge
    oWord.Visible = False

    ' Save file as PDF
    ' Uncomment the line below and comment out
    ' the line below "Save file as Word Document"
    '------------------------------------------------
    'oWord.ActiveDocument.SaveAs2 wdOutputName & ".pdf", 17

    ' Save file as Word Document
    ' ###-3 IF YOU DON'T WANT TO SAVE AS A NEW NAME, COMMENT OUT NEXT LINE
    oWord.ActiveDocument.SaveAs2 wdOutputName & ".docx", 16

    ' SHOW THE DOCUMENT
    oWord.Visible = True

    ' Close the template file
    If oWord.Documents(1).FullName = strDocPath Then
        oWord.Documents(1).Close savechanges:=False
    ElseIf oWord.Documents(2).FullName = strDocPath Then
        oWord.Documents(2).Close savechanges:=False
    Else
        MsgBox "Well, this should never happen! Only expected two documents to be open"
    End If

    ' Quit Word to Save Memory
    'oWord.Quit savechanges:=False

    ' Clean up memory
    '------------------------------------------------
    Set oWord = Nothing
    Set oWdoc = Nothing

End Function




'' Auto Mail Merge With VBA and Access (Early Binding)
''----------------------------------------------------
'' NOTE: To use this code, you must reference
'' The Microsoft Word 14.0 (or current version)
'' Object Library by clicking menu Tools > References
'' Check the box for:
'' Microsoft Word 14.0 Object Library in Word 2010
'' Microsoft Word 15.0 Object Library in Word 2013
'' Click OK
''----------------------------------------------------
'Sub startMerge()
'    Dim oWord As Word.Application
'    Dim oWdoc As Word.Document
'    Dim wdInputName As String
'    Dim wdOutputName As String
'    Dim outFileName As String
'
'    ' Set Template Path
'    '------------------------------------------------
'    wdInputName = CurrentProject.Path & "\templates\mailmerge-template.docx"
'
'    ' Create unique save filename with minutes
'    ' and seconds to prevent overwrite
'    '------------------------------------------------
'    outFileName = "MailMergeFile_" & Format(Now(), "yyyymmddmms")
'
'    ' Output File Path w/outFileName
'    '------------------------------------------------
'    wdOutputName = CurrentProject.Path & "\completed\" & outFileName
'
'    Set oWord = New Word.Application
'    Set oWdoc = oWord.Documents.Open(wdInputName)
'
'    ' Start mail merge
'    '------------------------------------------------
'    With oWdoc.MailMerge
'        .MainDocumentType = wdFormLetters
'        .OpenDataSource _
'            Name:=CurrentProject.FullName, _
'            AddToRecentFiles:=False, _
'            LinkToSource:=True, _
'            Connection:="QUERY mailmerge", _
'            SQLStatement:="SELECT * FROM [mailmerge]"
'        .Destination = wdSendToNewDocument
'        .Execute Pause:=False
'    End With
'
'    ' Hide Word During Merge
'    '------------------------------------------------
'    oWord.Visible = False
'
'    ' Save file as PDF
'    ' Uncomment the line below and comment out
'    ' the line below "Save file as Word Document"
'    '------------------------------------------------
'    'oWord.ActiveDocument.SaveAs2 wdOutputName & ".pdf", 17
'
'    ' Save file as Word Document
'    '------------------------------------------------
'    oWord.ActiveDocument.SaveAs2 wdOutputName & ".docx", 16
'
'    ' Quit Word to Save Memory
'    '------------------------------------------------
'    oWord.Quit savechanges:=False
'
'    ' Clean up memory
'    '------------------------------------------------
'    Set oWord = Nothing
'    Set oWdoc = Nothing
'End Sub
Function fillwordfrom(Path As String)

Dim appword As Word.Application
Dim doc As Word.Document
'Dim Path As String

Select Case Secteur



Case "Admin"

Case "Medecin"
End Select

On Error Resume Next
Error.Clear
Set appword = GetObject(, "word.application")

If Err.Number <> 0 Then
Set appword = New Word.Application
appword.Visible = True
appword.Activate
End If
Set doc = appword.Documents.Open(Path)
Set doc = Nothing
Set appword = Nothing


End Function
Private Sub Form_Current()
Me.Refresh
End Sub

Private Sub Form_Open(Cancel As Integer)
DoCmd.Maximize
End Sub

Private Sub GrantedSeniorityDate_GotFocus()
Me.GrantedSeniorityDate.SpecialEffect = 2
Me.GrantedSeniorityDate.FontBold = False

End Sub
Private Sub GrantedSeniorityDate_lostFocus()
Me.GrantedSeniorityDate.SpecialEffect = 0
Me.GrantedSeniorityDate.FontBold = True
End Sub

'Private Sub Form_Load()
'Call Toggle1100_Click
'End Sub

Private Sub Toggle1100_Click()
    Dim ctl As Access.Control


For Each ctl In Me.Controls
If ctl.Tag = "SeniorityGroupDetails" Then
            Select Case ctl.ControlType
            Case acTextBox
            
            If Me.Toggle1100 = True Then
            ctl.Visible = True
            Else
            ctl.Visible = False
            End If
            End Select
End If
Next ctl


End Sub


```


---
## Form_frm_Emp_Employee List (Document Module)

**Lines:** 354

```vba
Option Compare Database
Option Explicit

Private Function clearBox()
    [SearchBox] = Null
End Function

Private Sub LabelWizard_Click()
On Error GoTo ErrorHandler

    ' Code by Jeff Conrad
    ' This button launches the Label Report Wizard
    ' The second argument requires the name of a saved table or query name
    ' for the wizard to point to
    Application.Run "acwzmain.mlbl_Entry", "Contacts Extended"
    
ExitPoint:
    Exit Sub
    
ErrorHandler:
    'MsgBox "The following error has occurred:" _
    '& vbNewLine & "Error Number: " & Err.Number _
    '& vbNewLine & "Error Description: " & Err.Description _
    ', vbExclamation, "Unexpected Error"
    MsgBox "In order to launch the labels wizard you must click the Open button on the security notice." _
    & vbNewLine & "Error Number: " & Err.Number _
    & vbNewLine & "Error Description: " & Err.Description _
    , vbExclamation, "Unexpected Error"
    Resume ExitPoint
    
End Sub

'------------------------------------------------------------
' cmdAddFromOutlook_Click
'
'------------------------------------------------------------
Private Sub cmdAddFromOutlook_Click()
On Error GoTo cmdAddFromOutlook_Click_Err

    On Error Resume Next
    DoCmd.RunCommand acCmdAddFromOutlook


cmdAddFromOutlook_Click_Exit:
    Exit Sub

cmdAddFromOutlook_Click_Err:
    MsgBox Error$
    Resume cmdAddFromOutlook_Click_Exit

End Sub


'------------------------------------------------------------
' SearchGo_Click
'
'------------------------------------------------------------

'commented 20241101 by Hamid --- start


'Private Sub SearchGo_Click()
'On Error GoTo SearchGo_Click_Err
'
'    ' _AXL:<?xml version="1.0" encoding="UTF-16" standalone="no"?>
'    ' <UserInterfaceMacro For="cmdAddFromOutlook" xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements><Action Name="OnError"/><Action Name="RunMenuCommand"><A
'    ' _AXL:rgument Name="Command">AddContactFromOutlook</Argument></Action></Statements></UserInterfaceMacro>
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        ' Clear Filter when search box empty
'        DoCmd.ApplyFilter "", """""", ""
'        DoCmd.GoToControl "SearchBox"
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'        DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    End If
'    If (Eval("[CurrentProject].[IsTrusted] And ([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""")")) Then
'        SearchBox.Text = ""
'    End If
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        End
'    End If
'    If (VarType(Form!SearchBox) <> 8) Then
'        End
'    End If
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    If (Eval("([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""") And [SearchClear].[Visible]<>0")) Then
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        End
'    End If
'    ' Handle "'s in search
'    TempVars.Add "strSearch", Replace(Forms![Employee List]!SearchBox, """", """""")
'    ' Build the Filter
'    TempVars.Add "strFilter", "([EmpLName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([EmpFName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([E-mail Address] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Job Title] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Postal Code] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    DoCmd.ApplyFilter "", TempVars!strFilter, ""
'    TempVars.Remove "strFilter"
'    TempVars.Remove "strSearch"
'    DoCmd.SetProperty "SearchClear", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "-1"
'    DoCmd.GoToControl "SearchBox"
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'
'
'SearchGo_Click_Exit:
'    Exit Sub
'
'SearchGo_Click_Err:
'    MsgBox Error$
'    Resume SearchGo_Click_Exit
'
'
'
'End Sub


'
'
'
'
''------------------------------------------------------------
'' SearchGo_GotFocus
''
''------------------------------------------------------------
'Private Sub SearchGo_GotFocus()
'On Error GoTo SearchGo_GotFocus_Err
'
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        ' Clear Filter when search box empty
'        DoCmd.ApplyFilter "", """""", ""
'        DoCmd.GoToControl "SearchBox"
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'        DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    End If
'    If (Eval("[CurrentProject].[IsTrusted] And ([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""")")) Then
'        SearchBox.Text = ""
'    End If
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        End
'    End If
'    If (VarType(Form!SearchBox) <> 8) Then
'        End
'    End If
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    If (Eval("([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""") And [SearchClear].[Visible]<>0")) Then
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        End
'    End If
'    ' Handle "'s in search
'    TempVars.Add "strSearch", Replace(Forms![Employee List]!SearchBox, """", """""")
'    ' Build the Filter
'    TempVars.Add "strFilter", "([EmpLName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([EmpFName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([E-mail Address] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Job Title] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Postal Code] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    DoCmd.ApplyFilter "", TempVars!strFilter, ""
'    TempVars.Remove "strFilter"
'    TempVars.Remove "strSearch"
'    DoCmd.SetProperty "SearchClear", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "-1"
'    DoCmd.GoToControl "SearchBox"
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'
'
'SearchGo_GotFocus_Exit:
'    Exit Sub
'
'SearchGo_GotFocus_Err:
'    MsgBox Error$
'    Resume SearchGo_GotFocus_Exit
'
'End Sub
'
'
''------------------------------------------------------------
'' SearchClear_Click
''
''------------------------------------------------------------
'Private Sub SearchClear_Click()
'On Error GoTo SearchClear_Click_Err
'
'    ' Clear Filter
'    DoCmd.ApplyFilter "", """""", ""
'    DoCmd.GoToControl "SearchBox"
'    DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'    DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "0"
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    If (CurrentProject.IsTrusted) Then
'        SearchBox = ""
'    End If
'    Exit Sub
'
'
'SearchClear_Click_Exit:
'    Exit Sub
'
'SearchClear_Click_Err:
'    MsgBox Error$
'    Resume SearchClear_Click_Exit
'
'End Sub

'commented 20241101 by Hamid --- End


'------------------------------------------------------------
' cmdWelcome_Click
'
'------------------------------------------------------------
Private Sub cmdWelcome_Click()
On Error GoTo cmdWelcome_Click_Err

  DoCmd.OpenForm "Welcome", acNormal, "", "", , acNormal


cmdWelcome_Click_Exit:
    Exit Sub

cmdWelcome_Click_Err:
    MsgBox Error$
    Resume cmdWelcome_Click_Exit

End Sub


'------------------------------------------------------------
' cmdNew_Contact_Click
'
'------------------------------------------------------------
Private Sub cmdNew_Contact_Click()
On Error GoTo cmdNew_Contact_Click_Err

    DoCmd.OpenForm "frm_Emp_Employee Details", acNormal, "", "1=0", , acDialog
    On Error Resume Next
    DoCmd.Requery ""
    DoCmd.SearchForRecord , "", acFirst, "[EmployeeID]=" & Nz(DMax("[EmployeeID]", Form.RecordSource), 0)


cmdNew_Contact_Click_Exit:
    Exit Sub

cmdNew_Contact_Click_Err:
    MsgBox Error$
    Resume cmdNew_Contact_Click_Exit

End Sub



'
''------------------------------------------------------------
'' LabelWizard_MouseDown
''
''------------------------------------------------------------
'Private Sub LabelWizard_MouseDown(Button As Integer, Shift As Integer, X As Double, Y As Double)
'On Error GoTo LabelWizard_MouseDown_Err
'
'    ' _AXL:<?xml version="1.0" encoding="UTF-16" standalone="no"?>
'    ' <UserInterfaceMacro For="showHideColumns" xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements><Action Name="RunMenuCommand"><Argument Name="Command">Unh
'    ' _AXL:ideColumns</Argument></Action></Statements></UserInterfaceMacro>
'    If (Not CurrentProject.IsTrusted) Then
'        Beep
'        MsgBox "To use this functionality the database must be trusted." & Chr(13) & Chr(10) & "If you see the 'Security Warning' bar above, click 'Options' and then 'Enable this content.'", vbInformation, "Enable Trusted Mode"
'        Exit Sub
'    End If
'
'
'LabelWizard_MouseDown_Exit:
'    Exit Sub
'
'LabelWizard_MouseDown_Err:
'    MsgBox Error$
'    Resume LabelWizard_MouseDown_Exit
'
'End Sub


'------------------------------------------------------------
' Last_Name_DblClick
'
'------------------------------------------------------------
Private Sub Last_Name_DblClick(Cancel As Integer)

Call First_Name_DblClick(0)

End Sub


'------------------------------------------------------------
' First_Name_DblClick
'
'------------------------------------------------------------
Private Sub First_Name_DblClick(Cancel As Integer)
On Error GoTo First_Name_DblClick_Err

    On Error Resume Next
    If (Form.Dirty) Then
        DoCmd.RunCommand acCmdSaveRecord
    End If
    If (MacroError.Number <> 0) Then
        Beep
        MsgBox MacroError.Description, vbOKOnly, ""
        Exit Sub
    End If
    On Error GoTo 0
    If (IsNull(EmployeeID)) Then
        Exit Sub
    End If
    DoCmd.OpenForm "frm_Emp_Employee Details", acNormal, "", "[EmployeeID]=" & EmployeeID, , acDialog
    TempVars.Add "CurrentID", EmployeeID.Value
    DoCmd.Requery ""
    DoCmd.SearchForRecord , "", acFirst, "[EmployeeID]=" & TempVars!CurrentID
    TempVars.Remove "CurrentID"


First_Name_DblClick_Exit:
    Exit Sub

First_Name_DblClick_Err:
    MsgBox Error$
    Resume First_Name_DblClick_Exit

End Sub


'------------------------------------------------------------
' txtOpen_Click
'
'------------------------------------------------------------
Private Sub txtOpen_Click()

 On Error GoTo 0
    If (IsNull(EmployeeID)) Then
       Call cmdNew_Contact_Click
       
       Exit Sub
    End If

 First_Name_DblClick (0)

End Sub


```


---
## modMapping (Standard Module)

**Lines:** 18

```vba
Option Compare Database
Option Explicit

Function OpenMap(Address, City, State, Zip, Country)

    Dim strAddress As String
    strAddress = Nz(Address)
    strAddress = strAddress & IIf(strAddress = "", "", ", ") & Nz(City)
    strAddress = strAddress & IIf(strAddress = "", "", ", ") & Nz(State)
    strAddress = strAddress & IIf(strAddress = "", "", ", ") & Nz(Zip)
    strAddress = strAddress & IIf(strAddress = "", "", ", ") & Nz(Country)
    
    If strAddress = "" Then
        MsgBox "There is no address to map."
    Else
        Application.FollowHyperlink "http://maps.live.com/default.aspx?where1=" & strAddress
    End If
End Function
```


---
## Module1 (Standard Module)

**Lines:** 167

```vba
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
```


---
## Form_frm_1_NavigationForm (Document Module)

**Lines:** 36

```vba
Option Compare Database

Private Sub cmd_Calendar_Click()
DoCmd.OpenForm ("frm_YearCalendar")

End Sub

Private Sub cmDecision_Click()
      tabtoselect = Me.Controls(ActiveControl.Name).Tag


Me.Controls(tabtoselect).SetFocus
End Sub


Private Sub Command855_Click()
DoCmd.OpenForm "frm_1_Organizing", acNormal, , , , acWindowNormal


End Sub

Private Sub Form_Load()
DoCmd.Maximize
End Sub

Private Sub NavigationButton625_Click()
DoCmd.OpenForm ("frm_Abs_HolidayInputForm")
End Sub

Private Sub NavigationButton630_Click()
DoCmd.OpenForm ("frm_YearCalendar")
End Sub

Private Sub NavigationButton942_Click()
DoCmd.OpenForm ("frm_Abs_AbsenceCodes")
End Sub
```


---
## Form_frm_Sec_Secteurs (Document Module)

**Lines:** 19

```vba
Option Compare Database

Private Sub Text60_Click()
    If Me.Form.Dirty = True Then
    DoCmd.Save
    End If
    
    
    If Not IsNull([SecteurID]) Then
    
    DoCmd.OpenForm "frm_Sec_SecteurDetails", acNormal, , "[SecteurID]=" & Nz([SecteurID], 0), , acDialog
    
    Else
    DoCmd.OpenForm "frm_Sec_SecteurDetails", acNormal, , , acFormAdd, acDialog
    
    End If
    
    
End Sub
```


---
## Form_frm_TimeSheet (Document Module)

**Lines:** 92

```vba
Option Compare Database


Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()

currentEmployee = Me.EmployeeID
Me.Refresh
Me.Parent.Requery

DoCmd.SearchForRecord , , acFirst, "[EmployeeID]=" & currentEmployee




End Sub
Private Sub Form_BeforeUpdate(Cancel As Integer)

Dim activeflag As Boolean
Dim CAT  As Integer
CAT = CountActiveTimesheet(Me.EmployeeID)


activeflagNewValue = Me.Check92.Value
activeflagOldValue = Me.Check92.OldValue



            If (CAT = 0 And (activeflagNewValue = False Or IsNull(activeflagNewValue))) Then
            msg = MsgBox("Un employé doit avoir un seul horaire actif, Il faut activer l'horaire encours avant l'enregistrement", vbCritical + vbOKOnly, "Aucun horaire n'est actif")
            Cancel = True
            Exit Sub
            End If




            If (CAT = 1 And activeflagNewValue = False And activeflagOldValue = True) Then
            msg = MsgBox("Un employé doit avoir un horaire actif, Il faut soit activer l'horaire encours avant l'enregistrement ou activer à autre horaire", vbExclamation + vbOKOnly, "Un horaire doit être actif")
            Cancel = False
            Exit Sub
            End If
            
            
            

            If (CAT = 1 And activeflagNewValue = True And (activeflagOldValue = False Or IsNull(activeflagOldValue))) Then
            msg = MsgBox("Un employé doit avoir un seul horaire actif, Il faut désactiver l'horaire encours avant l'enregistrement", vbCritical + vbOKOnly, "Un horaire est déjà actif")
            Cancel = True
            Exit Sub
            End If


End Sub

Function CountActiveTimesheet(Emplyee As Integer)
    Dim dbs As DAO.Database
    Dim rstRecords As DAO.Recordset
    Set dbs = CurrentDb
    Dim SQL As String
    Dim ActiveCount As Integer
    Dim ChangeInactiveFlag As Boolean
    
    SQL = "Select Active from tbl_TimeSheet where EmployeeID = " & Emplyee & " and Active = " & -1
    
    
    
    'Open a table-type Recordset
    Set rstRecords = dbs.OpenRecordset(SQL, dbOpenDynaset)
    
    
    If rstRecords.EOF Then
      CountActiveTimesheet = 0
   Else
      rstRecords.MoveLast
      CountActiveTimesheet = rstRecords.RecordCount
   End If

    
    rstRecords.Close
    dbs.Close
    Set dbs = Nothing
    Set rsTable = Nothing
    
    
    
End Function


```


---
## Form_frm_Sal_Seniority (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterUpdate()


Me.Form.Parent.Requery


End Sub
```


---
## TimeFormat (Standard Module)

**Lines:** 31

```vba
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
```


---
## basDateTimeStuff (Standard Module)

**Lines:** 152

```vba
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




```


---
## DateAddWeekendHolidaysOut (Standard Module)

**Lines:** 263

```vba
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


```


---
## mdl_YearCalendarGeneration (Standard Module)

**Lines:** 27

```vba
Option Compare Database

Private Sub YearCalendarGeneration(AbsenceDate As Date, EmployeeID As Long, AbsenceID As Long, _
AbsenceTime As Date, AbsenceDays As Integer, AbsenceReason As String)

Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset

    Set wksp = DBEngine.Workspaces(0) 'The current database

    wksp.BeginTrans 'Start the transaction buffer

    Set rs = CurrentDb.OpenRecordset("Table1", dbOpenDynaset)

    Do 'Begin your loop here

    With rs
        .AddNew
            !Field = "Sample Data"
        .Update
    End With

    Loop 'End it here

    wksp.CommitTrans 'Commit the transaction to dataset

End Sub
```


---
## FromTableToArray (Standard Module)

**Lines:** 98

```vba
Option Compare Database

Function loadHolidaysIntoArray() As Variant

Dim rstTableName As DAO.Recordset   'Your table
Dim myArray() As String             'Your dynamic array
Dim intArraySize As Integer         'The size of your array
Dim iCounter As Integer             'Index of the array

'Open your table

strsql = "select * from tbl_Abs_Holidays"

Set rstTableName = CurrentDb.OpenRecordset(strsql)

If Not rstTableName.EOF Then

rstTableName.MoveLast
rstTableName.MoveFirst   'Ensure we begin on the first row

    'The size of the array should be equal to the number of rows in the table
    intArraySize = rstTableName.RecordCount - 1
    iCounter = 0
    ReDim myArray(intArraySize) 'Need to size the array

    Do Until rstTableName.EOF

        myArray(iCounter) = rstTableName.Fields("HolidayDate")
        'Debug.Print "Item: "; iCounter & " " & myArray(iCounter)

        iCounter = iCounter + 1
        rstTableName.MoveNext
    Loop

End If


loadHolidaysIntoArray = myArray
'If IsObject(rstTableName) Then Set rstTableName = Nothing

End Function
'Function IsInHoliday(dateToBeFound As Date, arr As Variant) As Boolean
'  IsInArray = (UBound(VBA.Filter(arr, dateToBeFound)) > -1)
'End Function
 Function IsInHoliday(valToBeFound As Date, arr As Variant) As Boolean

On Error GoTo IsInArrayError: 'array is empty



For i = 0 To UBound(arr) - 1
currenti = arr(i)

    If currenti = valToBeFound Then
            IsInHoliday = True
            Exit Function
        End If
Next i


Exit Function
IsInArrayError:
On Error GoTo 0
IsInHoliday = False
End Function

Function loadTimeSheetIntoArray(empID As Long) As Variant

Dim rstTableName As DAO.Recordset   'Your table
Dim myArray(6) As String             'Your dynamic array
Dim intArraySize As Integer         'The size of your array
Dim iCounter As Integer             'Index of the array

'Open your table

sqlstring = "select top 1 * from tbl_TimeSheet where EmployeeID= " & empID & " and active=true order by StartDate Desc"

Set rstTableName = CurrentDb.OpenRecordset(sqlstring)
    With rstTableName
    
myArray(0) = Nz(.Fields("Monday"), 0)
myArray(1) = Nz(.Fields("Tuesday"), 0)
myArray(2) = Nz(.Fields("Wednesday"), 0)
myArray(3) = Nz(.Fields("Thursday"), 0)
myArray(4) = Nz(.Fields("Friday"), 0)
myArray(5) = Nz(.Fields("Saturday"), 0)
myArray(6) = Nz(.Fields("Sunday"), 0)
   
End With


loadTimeSheetIntoArray = myArray
'If IsObject(rstTableName) Then Set rstTableName = Nothing
rstTableName.Close
Set rstTableName = Nothing


End Function
```


---
## Form_frm_Abs_HolidayInputForm (Document Module)

**Lines:** 655

```vba
Private Sub btnReset_Click()
Me.cmbAbsenceID.Value = ""
Me.txtSartDate.Value = ""
Me.txtEndDate.Value = ""
Me.txtNbreHeures.Value = ""
Me.txtNbreJours.Value = ""
Me.txtreason.Value = ""

Me.cmbAbsenceID.Enabled = True
Me.txtSartDate.Enabled = False
Me.txtEndDate.Enabled = False
Me.txtNbreHeures.Enabled = False
Me.txtNbreJours.Enabled = False
Me.txtreason.Enabled = False



End Sub
Private Sub btnValidation_Click()
   Dim strsql As String
   Dim intmsg As Integer
   Dim strmessage As String
   Dim strValidationMessage As String
   Dim strSelection As String
   Dim rcdSlction As Long
   Dim msg As Long
 
  strmessage = " Vous être sur le point d'insérer un ou plusieurs enregistrements." _
& vbNewLine & vbNewLine & _
"Appuyez sur OK pour continuer." & vbNewLine & _
"Appuyez sur Annuler pour revenir à l'étape précédentes"


  intmsg = MsgBox(strmessage, vbOKCancel + vbExclamation, "Enregistrement")
  
  
 If intmsg = 2 Then
 Exit Sub
 End If
  
  On Error GoTo Err_Handler
  
  
    If IsNull(Me.txtSartDate) Or Me.txtSartDate.Value = "" Or cmbEmployeeID.Value = "" Or IsNull(cmbEmployeeID) Or IsNull(cmbAbsenceID) Or cmbAbsenceID.Value = "" Or IsNull(cmbyear) Or cmbyear.Value = "" Then
    
   strValidationMessage = "La date de début, le nom de l'employé, l'année de congé et le code d'absence doivent être renseignés."
      
        GoTo Exit_Proc
        
    End If
    
    If Year(Me.txtSartDate.Value) <> cmbyear.Value Then
    
    strValidationMessage = "l'année de la date de début est inférieure à l'année de congé."
      
        GoTo Exit_Proc
    
    End If
    

Holidayslist = loadHolidaysIntoArray
strsql = "SELECT TOP 1 * FROM tbl_YearCalendar"



        Select Case strTimeType
        
        Case "Jours"
        
            If IsNull(txtNbreJours) Or txtNbreJours.Value = "" Then
               
               strValidationMessage = "Ce code d'absence requiert un nombre de jours supérieur ou égal à un."
               
                GoTo Exit_Proc
             Else
                
                ' we can start counting from here
                
            rcdSlction = RecordSelectionGetID(Me.cmbEmployeeID.Value, Me.txtSartDate.Value, "", _
            Me.txtNbreJours, Me.cmbAbsenceID, Me.cmbyear.Value, "", Me.txtreason.Value)
                
               Call holidaysCalcJour(rcdSlction, strsql, cmbyear.Value, Me.txtSartDate.Value, Me.cmbEmployeeID.Value, Me.cmbAbsenceID.Value, Me.txtNbreJours.Value, loadTimeSheetIntoArray(Me.cmbEmployeeID.Value), Holidayslist, Me.txtreason.Value)
            End If
                
        
        Case "H/M"
        
If IsNull(Me.txtEndDate) Or Me.txtEndDate.Value = "" Then
                
           strValidationMessage = "La date de fin doit être renseignée."

                GoTo Exit_Proc
                
                ElseIf Me.txtEndDate.Value < Me.txtSartDate.Value Then
                
           strValidationMessage = "La date de fin doit être supérieure à la date de début."
                
                GoTo Exit_Proc
                
                ElseIf Me.txtEndDate.Value = Me.txtSartDate.Value Then
                
                        If IsNull(Me.txtNbreHeures) Or Me.txtNbreHeures.Value = "" Then
                      
                        strValidationMessage = "Le nombre d'heure doit être renseigné si la date de début est égale à la date de fin"
 
                        GoTo Exit_Proc
                      
                         Else
                        
                   rcdSlction = RecordSelectionGetID(Me.cmbEmployeeID.Value, Me.txtSartDate.Value, txtEndDate.Value, _
                    0, Me.cmbAbsenceID, Me.cmbyear.Value, Me.txtNbreHeures.Value, Me.txtreason.Value)
                     
                        Call holidaysCalc_Sd_equal_Ed(rcdSlction, strsql, cmbyear.Value, txtSartDate.Value, Me.cmbEmployeeID.Value, Me.cmbAbsenceID.Value, txtEndDate.Value, loadTimeSheetIntoArray(Me.cmbEmployeeID.Value), Holidayslist, Me.txtNbreHeures.Value, Me.txtreason.Value)
                                               
                         End If
                         
                ElseIf Me.txtEndDate.Value > Me.txtSartDate.Value Then
                ' start counting from here taking the time sheet into consideration
                If IsNull(Me.txtNbreHeures) Or Me.txtNbreHeures.Value = "" Then
                
                   rcdSlction = RecordSelectionGetID(Me.cmbEmployeeID.Value, Me.txtSartDate.Value, Me.txtEndDate.Value, _
                   0, Me.cmbAbsenceID, Me.cmbyear.Value, "", Me.txtreason.Value)
                
                
                
               Call holidaysCalcTimeSheet(rcdSlction, strsql, cmbyear.Value, txtSartDate.Value, Me.cmbEmployeeID.Value, Me.cmbAbsenceID.Value, txtEndDate.Value, loadTimeSheetIntoArray(Me.cmbEmployeeID.Value), Holidayslist, Me.txtreason.Value)
                Else
                
                 strValidationMessage = "Le nombre d'heure ne doit pas être renseigné si la date de début est inférieure à la date de fin: " _
                        & vbNewLine & vbNewLine & " L'horaire de l'employé sélectionné sera pris en considération"
                      
                        GoTo Exit_Proc
                
                End If
                
Else
Exit Sub
End If
                
                
        End Select
        Me.Form.Requery
        Me.Form.Refresh
        
Exit Sub
        
Exit_Proc:

msg = MsgBox(strValidationMessage, vbCritical, "Validation")

Exit Sub

Err_Handler:
     MsgBox Err.Number & " " & Err.Description, vbCritical, "Processus de validation"


End Sub
Public Sub holidaysCalcTimeSheet(HldySlctnID As Long, strsql As String, yearholiday As Integer, SrtDte As Date, empID As Long, AbsID As Long, EndDte As Date, loadTimeSheetIntoArray As Variant, Holidayslist As Variant, Optional strAbsenceRea As String)


Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset
Dim dteDate As Date
Dim AbsenTime   As Date
Dim intDay As Integer


On Error GoTo tran_Err

    Set wksp = DBEngine.Workspaces(0) 'The current database
    wksp.BeginTrans 'Start the transaction buffer
Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)


dteDate = SrtDte


    ' Loop until to reach the enddate inclusive.


Do Until dteDate = EndDte + 1

If IsInHoliday(dteDate, Holidayslist) Then
   
Else

             intDay = DatePart("w", dteDate)
        
        
        Select Case intDay
                
                 Case vbMonday
                        AbsenTime = loadTimeSheetIntoArray(0)
                
                 Case vbTuesday
                        AbsenTime = loadTimeSheetIntoArray(1)
                
                 Case vbWednesday
                        AbsenTime = loadTimeSheetIntoArray(2)
                
                Case vbThursday
                        AbsenTime = loadTimeSheetIntoArray(3)
                
                Case vbFriday
                        AbsenTime = loadTimeSheetIntoArray(4)
                
                 Case vbSaturday
                        AbsenTime = loadTimeSheetIntoArray(5)
                
                 Case vbSunday
                        AbsenTime = loadTimeSheetIntoArray(6)
        End Select
        
             
           If IsNull(AbsenTime) Or AbsenTime = 0 Then
           
            Else
                If IsNull(strAbsenceRea) Or strAbsenceRea = "" Then
                AbsenceRea = "N/A"
                Else
                AbsenceRea = strAbsenceRea
                End If
        
                With rs
                .AddNew
                    !AbsenceDate = dteDate
                    !EmployeeID = empID
                    !AbsenceID = AbsID
                    !yearVacation = yearholiday
                    !AbsenceTime = CDate(Nz(AbsenTime, #12:00:00 AM#))
                    !AbsenceReason = AbsenceRea
                    !HolidaySelectionID = HldySlctnID
                    !DateCreated = Now()

                 .Update
                End With
          End If
        


End If

dteDate = dteDate + 1

Loop

wksp.CommitTrans
MsgBox ("L'enregistrement a été effectué avec succès")
Set wksp = Nothing
rs.Close
Set rs = Nothing


Call btnReset_Click

Exit Sub

tran_Err:
    
    wksp.Rollback
    Set wksp = Nothing
    rs.Close
    Set rs = Nothing

    MsgBox "L'enregistrement a échoué! Erreur: " & Err.Description



End Sub
Sub holidaysCalcJour(HldySlctnID As Long, strsql As String, yearholiday As Integer, SrtDte As Date, empID As Long, AbsID As Long, nbreJour As Integer, loadTimeSheetIntoArray, Holidayslist As Variant, Optional strAbsenceRea As String)

Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset
Dim dteDate As Date
Dim AbsenTime   As Date


On Error GoTo tran_Err

    Set wksp = DBEngine.Workspaces(0) 'The current database
    wksp.BeginTrans 'Start the transaction buffer
    
Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)

AbsenTime = 0
dteDate = SrtDte


    ' Loop until to reach the enddate inclusive.


i = 1

Do Until i = nbreJour + 1

intDay = DatePart("w", dteDate)
'Do Until dteDate = EndDte + 1


If IsInHoliday(dteDate, Holidayslist) Then
   
Else

             intDay = DatePart("w", dteDate)
        
         
        Select Case intDay
                
                 Case vbMonday
                        AbsenTime = loadTimeSheetIntoArray(0)
                
                 Case vbTuesday
                        AbsenTime = loadTimeSheetIntoArray(1)
                
                 Case vbWednesday
                        AbsenTime = loadTimeSheetIntoArray(2)
                
                Case vbThursday
                        AbsenTime = loadTimeSheetIntoArray(3)
                
                Case vbFriday
                        AbsenTime = loadTimeSheetIntoArray(4)
                
                 Case vbSaturday
                        AbsenTime = loadTimeSheetIntoArray(5)
                
                 Case vbSunday
                        AbsenTime = loadTimeSheetIntoArray(6)
        End Select
        
             
           If IsNull(AbsenTime) Or AbsenTime = 0 Then
            
   
            Else
                If IsNull(strAbsenceRea) Or strAbsenceRea = "" Then
                AbsenceRea = "N/A"
                Else
                AbsenceRea = strAbsenceRea
                End If
            
                With rs
                .AddNew
                    !AbsenceDate = dteDate
                    !EmployeeID = empID
                    !AbsenceID = AbsID
                    !yearVacation = yearholiday
                    !AbsenceDays = 1
                    !AbsenceReason = AbsenceRea
                    !HolidaySelectionID = HldySlctnID
                    !DateCreated = Now()
                 .Update
                End With
                
                i = i + 1
                
            End If
            
            
End If

dteDate = dteDate + 1
Loop


wksp.CommitTrans
MsgBox ("L'enregistrement a été effectué avec succès")
Set wksp = Nothing
rs.Close
Set rs = Nothing


Call btnReset_Click

Exit Sub

tran_Err:
    
    wksp.Rollback
    Set wksp = Nothing
    rs.Close
    Set rs = Nothing

    MsgBox "L'enregistrement a échoué! Erreur: " & Err.Description


End Sub
Sub holidaysCalc_Sd_equal_Ed(HldySlctnID As Long, strsql As String, yearholiday As Integer, SrtDte As Date, empID As Long, AbsID As Long, EndDte As Date, loadTimeSheetIntoArray As Variant, Holidayslist As Variant, AbsenTime As Date, Optional strAbsenceRea As String)

Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset
Dim dteDate As Date
Dim curentdateisholiday As Boolean
Dim strmessage As String
Dim AbsenTimeCheck As Date


On Error GoTo tran_Err

    Set wksp = DBEngine.Workspaces(0) 'The current database
    wksp.BeginTrans 'Start the transaction buffer

Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)



dteDate = SrtDte

curentdateisholiday = IsInHoliday(dteDate, Holidayslist)


If curentdateisholiday Then
msg = MsgBox("Le jour sélectionné est un jour de congé légal.", vbCritical + vbOKOnly, "Enregistrement non autorisé")
   Exit Sub
End If

        intDay = DatePart("w", dteDate)
        
        
        Select Case intDay
                
                 Case vbMonday
                        AbsenTimeCheck = loadTimeSheetIntoArray(0)
                
                 Case vbTuesday
                        AbsenTimeCheck = loadTimeSheetIntoArray(1)
                
                 Case vbWednesday
                        AbsenTimeCheck = loadTimeSheetIntoArray(2)
                
                Case vbThursday
                        AbsenTimeCheck = loadTimeSheetIntoArray(3)
                
                Case vbFriday
                        AbsenTimeCheck = loadTimeSheetIntoArray(4)
                
                 Case vbSaturday
                        AbsenTimeCheck = loadTimeSheetIntoArray(5)
                
                 Case vbSunday
                        AbsenTimeCheck = loadTimeSheetIntoArray(6)
        End Select
        
             
                If IsNull(AbsenTimeCheck) Or AbsenTimeCheck = 0 Or AbsenTimeCheck < AbsenTime Then
                
                strmessage = "Le nombre d'heure introduit est supérieur à la prestation journalière de l'employé sélectionné ou il est égale à 0!"
                
                msg = MsgBox(strmessage, vbExclamation, "Enregistrement non autorisé")
                
                Exit Sub
                End If
                
                If IsNull(strAbsenceRea) Or strAbsenceRea = "" Then
                AbsenceRea = "N/A"
                Else
                AbsenceRea = strAbsenceRea
                End If
        
                With rs
                .AddNew
                    !AbsenceDate = dteDate
                    !EmployeeID = empID
                    !AbsenceID = AbsID
                    !yearVacation = yearholiday
                    !AbsenceTime = AbsenTime
                    !AbsenceReason = AbsenceRea
                    !HolidaySelectionID = HldySlctnID
                    !DateCreated = Now()
                 .Update
                End With
                wksp.CommitTrans
                MsgBox ("L'enregistrement a été effectué avec succès")
                Set wksp = Nothing
                rs.Close
                Set rs = Nothing



Call btnReset_Click

Exit Sub

tran_Err:
    
    wksp.Rollback
    Set wksp = Nothing
    rs.Close

    Set rs = Nothing

    MsgBox "L'enregistrement a échoué! Erreur: " & Err.Description

End Sub

Private Sub cmbAbsenceID_AfterUpdate()


Me.Form.Requery
Me.Form.Refresh
If IsNull(Me.cmbAbsenceID) Or Me.cmbAbsenceID = isNothing Then
Call btnReset_Click
Else

Me.cmbAbsenceID.Enabled = False

Me.txtSartDate.Enabled = True

Me.txtreason.Enabled = True


Select Case strTimeType

Case "Jours"

'Me.Notes.Caption = "Introduire le nombre de jours pour cette catégorie; la date de fin n'est pas requise."
Me.txtNbreJours.Enabled = True
Me.txtEndDate.Enabled = False
txtNbreHeures.Enabled = False
Case "H/M"

Me.txtEndDate.Enabled = True
txtNbreHeures.Enabled = True
Me.txtNbreJours.Enabled = False

'Me.Notes.Caption = "Le nombre d'heures est requis uniquement si la date de début est égale à la date de fin."

End Select
End If
End Sub
Function strTimeType() As String
strWhere = "[AbsenceID] =" & Me.cmbAbsenceID & ""
    
    ' Count the number of holidays.
    strTimeType = DLookup(Expr:="[TimeType]", _
        Domain:="tbl_Abs_AbsenceCodes", _
        criteria:=strWhere)
        
        
End Function

Private Sub cmbEmployeeID_AfterUpdate()
Me.Form.Requery
Me.Form.Refresh
End Sub
Private Sub Form_Load()
Call btnReset_Click

If IsNull(Me.OpenArgs) Then

Else
Me.cmbEmployeeID = Me.OpenArgs
Me.Refresh
End If
End Sub
Private Sub txtNbreJours_BeforeUpdate(Cancel As Integer)
If txtNbreJours - CInt(txtNbreJours) <> 0 Then
Cancel = True
msg = MsgBox("Introduire un nombre entier sans décimale!")
End If
End Sub
Private Sub txtSartDate_AfterUpdate()
autoupdatefields
End Sub
Private Sub txtSartDate_Change()
'Me.txtEndDate.Value = txtSartDate.Value
End Sub
Private Sub autoupdatefields()

Dim rsTimeSheet As Recordset



Me.txtEndDate.Value = txtSartDate.Value

If IsNull(txtSartDate) Or txtSartDate.Value = "" Then
txtNbreHeures.Value = ""
Exit Sub
End If


Set rsTimeSheet = getrsTimeSheet(Me.cmbEmployeeID.Value)

rsTimeSheet.MoveFirst
Select Case strTimeType
Case "H/M"

sweekNumber = Weekday(txtSartDate, vbMonday)



Select Case sweekNumber

Case 1

txtNbreHeures.Value = rsTimeSheet.Fields("Monday")

Case 2
txtNbreHeures.Value = rsTimeSheet.Fields("Tuesday")

Case 3
txtNbreHeures.Value = rsTimeSheet.Fields("Wednesday")

Case 4

txtNbreHeures.Value = rsTimeSheet.Fields("Thursday")

Case 5

txtNbreHeures.Value = rsTimeSheet.Fields("Friday")



End Select










 
    'change 2016, 11, 4 for your year, month, day values

End Select




End Sub
Function getrsTimeSheet(EmployeeID) As Recordset

Dim db As DAO.Database, rs As DAO.Recordset
 
 

 Set db = CurrentDb
 
 SQL = "SELECT * FROM tbl_TimeSheet WHERE EmployeeID=" & EmployeeID & " and Active =" & -1
 
 Set rs = db.OpenRecordset(SQL)
 If rs.EOF Then
 Set getrsTimeSheet = Nothing
 Else
     Set getrsTimeSheet = rs
 End If



End Function


```


---
## Form_frm_1_Organizing (Document Module)

**Lines:** 17

```vba
Option Compare Database

Private Sub Command65_Click()
DoCmd.OpenForm "frm_Log_Change"
End Sub

Private Sub Command66_Click()
DoCmd.OpenForm "frm_Log_Decision"
End Sub

Private Sub Command67_Click()
DoCmd.OpenForm "frm_Log_Requests"
End Sub

Private Sub Command69_Click()
DoCmd.OpenForm "frm_Log_Meeting"
End Sub
```


---
## product (Standard Module)

**Lines:** 32

```vba
Option Compare Database
Public Function DProduct(Expr As String, Domain As String, Optional criteria) As Variant
    Dim SQL As String, Result As Double
    Dim cdb As DAO.Database, rst As DAO.Recordset
    On Error GoTo DProduct_Error
    Set cdb = CurrentDb
    SQL = "SELECT " & Expr & " AS Expr1 FROM [" & Domain & "]"
    If Not IsMissing(criteria) Then
        SQL = SQL & " WHERE " & criteria
    End If
    Set rst = cdb.OpenRecordset(SQL, dbOpenSnapshot)
    If rst.BOF And rst.EOF Then
        DProduct = 1
    Else
        Result = 1
        Do Until rst.EOF
            Result = Result * (1 + rst!Expr1)
            rst.MoveNext
        Loop
        
        
        
        DProduct = Result
    End If
    rst.Close
    Set rst = Nothing
    Set cdb = Nothing
    Exit Function

DProduct_Error:
    DProduct = Null
End Function
```


---
## Form_Form1 (Document Module)

**Lines:** 5

```vba
Option Compare Database

Private Sub Form_Load()
Me.Text0.Value = DProduct("IndexationNumber", "tblIndexation")
End Sub
```


---
## Form_frm_Emp_Indexation (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Requery
End Sub
```


---
## Form_frm_Sec_Indexation (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Requery
End Sub
```


---
## Form_frm_Cmn_Indexation (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Requery
End Sub
```


---
## Module2 (Standard Module)

**Lines:** 36

```vba
Option Compare Database

Function fCalculateAge(varDOB As Variant, Optional varAsOfThisDate As Variant) As Variant
'Purpose:   Return the Age in years.
'Arguments: varDOB = Date Of Birth
'varAsOfThisDate = the date to calculate the age at, or today if missing.
 
'The DateDiff() Function simply subtracts the Year parts of the Dates, without
'reference to the Month or Day. This means we need to subtract one if the person
'has not has their birthday this year. This can be handled by a Boolean Expression
'that returns either -1 or 0 depending on whether or not an individual's
'birthday occurred within the Year.
 
'Return:    Whole number of years.
Dim dteDOB As Date
Dim dteAsOf As Date
Dim dteBDay As Date     'Birthday in the year of calculation.
 
fCalculateAge = Null    'Initialize to Null
 
'Validate Parameters
If IsDate(varDOB) Then
  dteDOB = varDOB
 
  If Not IsDate(varAsOfThisDate) Then  'Date to calculate age from.
    dteAsOf = Date      'Use the Current Date
  Else
    dteAsOf = varAsOfThisDate       'Valid As Of Date
  End If
 
  If dteAsOf >= dteDOB Then      'Calculate only if it's after person was born.
    dteBDay = DateSerial(Year(dteAsOf), Month(dteDOB), Day(dteDOB))
      fCalculateAge = DateDiff("yyyy", dteDOB, dteAsOf) + (dteBDay > dteAsOf)
  End If
End If
End Function
```


---
## Form_frm_Sec_SectorialSalaryChanging (Document Module)

**Lines:** 64

```vba
Option Compare Database

Private Sub Command117_Click()
On Error GoTo First_Name_DblClick_Err

    On Error Resume Next
    If (Form.Dirty) Then
        DoCmd.RunCommand acCmdSaveRecord
    End If
    If (MacroError.Number <> 0) Then
        Beep
        MsgBox MacroError.Description, vbOKOnly, ""
        Exit Sub
    End If
    On Error GoTo 0
    If (IsNull(EmployeeID)) Then
        Exit Sub
    End If
    DoCmd.OpenForm "frm_Emp_Employee Details", acNormal, "", "[EmployeeID]=" & EmployeeID, , acDialog
    TempVars.Add "CurrentID", EmployeeID.Value
    DoCmd.Requery ""
    DoCmd.SearchForRecord , "", acFirst, "[EmployeeID]=" & TempVars!CurrentID
    TempVars.Remove "CurrentID"


First_Name_DblClick_Exit:
    Exit Sub

First_Name_DblClick_Err:
    MsgBox Error$
    Resume First_Name_DblClick_Exit
End Sub

Private Sub Contact_Name_DblClick(Cancel As Integer)

On Error GoTo First_Name_DblClick_Err

    On Error Resume Next
    If (Form.Dirty) Then
        DoCmd.RunCommand acCmdSaveRecord
    End If
    If (MacroError.Number <> 0) Then
        Beep
        MsgBox MacroError.Description, vbOKOnly, ""
        Exit Sub
    End If
    On Error GoTo 0
    If (IsNull(EmployeeID)) Then
        Exit Sub
    End If
    DoCmd.OpenForm "frm_Emp_Employee Details", acNormal, "", "[EmployeeID]=" & EmployeeID, , acDialog
    TempVars.Add "CurrentID", EmployeeID.Value
    DoCmd.Requery ""
    DoCmd.SearchForRecord , "", acFirst, "[EmployeeID]=" & TempVars!CurrentID
    TempVars.Remove "CurrentID"


First_Name_DblClick_Exit:
    Exit Sub

First_Name_DblClick_Err:
    MsgBox Error$
    Resume First_Name_DblClick_Exit
End Sub
```


---
## Form_frm_RTTCalc (Document Module)

**Lines:** 31

```vba
Option Compare Database
Private Sub Command117_Click()
On Error GoTo First_Name_DblClick_Err

    On Error Resume Next
    If (Form.Dirty) Then
        DoCmd.RunCommand acCmdSaveRecord
    End If
    If (MacroError.Number <> 0) Then
        Beep
        MsgBox MacroError.Description, vbOKOnly, ""
        Exit Sub
    End If
    On Error GoTo 0
    If (IsNull(EmployeeID)) Then
        Exit Sub
    End If
    DoCmd.OpenForm "frm_Emp_Employee Details", acNormal, "", "[EmployeeID]=" & EmployeeID, , acDialog
    TempVars.Add "CurrentID", EmployeeID.Value
    DoCmd.Requery ""
    DoCmd.SearchForRecord , "", acFirst, "[EmployeeID]=" & TempVars!CurrentID
    TempVars.Remove "CurrentID"


First_Name_DblClick_Exit:
    Exit Sub

First_Name_DblClick_Err:
    MsgBox Error$
    Resume First_Name_DblClick_Exit
End Sub
```


---
## Form_frm_Abs_AbsenceCode_RichTextHelper (Document Module)

**Lines:** 29

```vba
Option Compare Database



Private Sub Form_Load()
  'You can do this in design view, but in case you forget
  Me.txtBxInput.TextFormat = acTextFormatHTMLRichText
  Me.txtBxOutput.TextFormat = acTextFormatPlain
End Sub
Private Sub cmdGetCodes_Click()
  Me.txtBxOutput.Value = Me.txtBxInput.Value
  'Since you need to remove the double quotes
  Me.txtBxOutput.Value = Replace(Me.txtBxOutput.Value, """", "")
End Sub
Public Sub UseTags()
  Dim strOne As String
  Dim strTwo As String
  strOne = "Bold Text"
  strTwo = "Red Text"
  Me.txtBxInput.Value = "<strong>" & strOne & "</strong>" & " and "
  Me.txtBxInput.Value = Me.txtBxInput.Value & "<font color=#ED1C24>" & strTwo & "</font>"
  'need to surround with div
  Me.txtBxInput.Value = "<div>" & Me.txtBxInput.Value & "</div>"
  Me.txtBxOutput.Value = Me.txtBxInput.Value
End Sub
Private Sub cmdTest_Click()
 UseTags
End Sub

```


---
## VacationSammryGen (Standard Module)

**Lines:** 64

```vba
Public Function RecordSelectionGetID(empID As Long, SrtDte As String, EndDte As String, nbreJour As Integer, AbsID As Long, yearholiday As Integer, AbsenceTime As String, strAbsenceReason As String) As Long

Dim lastID As Integer
Dim rs As DAO.Recordset
strsql = "SELECT TOP 1 * FROM tbl_Abs_HolidaySelection"

Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)



 With rs
                .AddNew
                    !StartDate = SrtDte
                    !EndDate = EndDte
                    !NmbreDays = nbreJour
                    !AbsenceID = AbsID
                    !AbsenceYear = yearholiday
                    !EmployeeID = empID
                    
                    
                    If AbsenceTime = "" Then
                    !AbsenceTime = #12:00:00 AM#
                    Else
                    !AbsenceTime = AbsenceTime
                    End If
                    
                    
                    !AbsenceReason = strAbsenceReason
                    !DateCreated = Now()
                 .Update
                End With
                
                
RecordSelectionGetID = DMax("[HolidaySelectionID]", "tbl_Abs_HolidaySelection")

rs.Close
Set rs = Nothing
End Function

Sub deleterecord(strsql)

Dim rs As DAO.Recordset
On Error GoTo Error_Handler


Set rs = CurrentDb.OpenRecordset(strsql)

rs.Delete

Exit_Handler:
    Exit Sub

Error_Handler:
    Select Case Err.Number
        Case 3200   'related records prevent deletion
            MsgBox "Les autres enregistrements liés au même parent ne seront pas supprimés.", vbOKOnly, "Suppressions des enregistrement liés"
            Resume Exit_Handler
        Case Else
            MsgBox Err.Number & " - " & Err.Description
            Resume Exit_Handler
    End Select


End Sub
```


---
## Form_frm_Abs_HolidayRightAndTaken (Document Module)

**Lines:** 5

```vba
Option Compare Database

Private Sub Form_Current()
Me.Requery
End Sub
```


---
## Form_frm_VacationRight (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Refresh
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Refresh
End Sub
```


---
## Form_frm_Abs_HolidaySelectionMain (Document Module)

**Lines:** 4

```vba
Option Compare Database
Private Sub Form_Current()
'Me.Parent.Requery
End Sub
```


---
## Form_frm_Abs_HolidaySelectionDetails (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Requery
End Sub
```


---
## Form_frm_Abs_HolidaySelectionBatchs (Document Module)

**Lines:** 9

```vba
Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Requery
End Sub
```


---
## Form_frm_Abs_AbsenceCodes (Document Module)

**Lines:** 1

```vba
Option Compare Database
```


---
## Report_rpt_YearAbsenceByMonth (Document Module)

**Lines:** 76

```vba
Option Compare Database
Dim blnalternate As Boolean
Dim bool_nodata As Boolean

Private Sub GroupHeader1_Format(Cancel As Integer, FormatCount As Integer)
    If blnalternate Then
        Detail.BackColor = vbWhite
        GroupHeader1.BackColor = vbWhite
    Else
        Detail.BackColor = RGB(237, 247, 249)    '16777184
        GroupHeader1.BackColor = RGB(237, 247, 249)    '16777184
    End If
    blnalternate = Not (blnalternate)
End Sub

Private Sub Report_NoData(Cancel As Integer)
    bool_nodata = True
End Sub

Private Sub Report_Page()
    If bool_nodata = True Then
        MsgBox "You do not have any absences toward the absenteeism and tardiness program.", vbExclamation, "Message Alert"
        DoCmd.Close acReport, "rpt_YearAbsenceByQuarter", acSaveNo
    End If
End Sub

Private Sub Report_Load()
    CreateReportShortcutMenu
End Sub

Private Sub CreateReportShortcutMenu()
'==================================================================================================
'//In the Report_Load Event enter CreateReportShortcutMenu then in the reports Property/Shortcut
'   Menu Bar enter the MenuName "vbaShortCutMenu"
'
'//The numbers are Ms Access Control numbers you can download and excel file from MS
'
'//Reference: Microsoft Office 12.0 Object Library
'==================================================================================================

    Dim MenuName As String
    Dim CB As CommandBar
    Dim CBB As CommandBarButton

    MenuName = "vbaShortCutMenu"

    On Error Resume Next
    Application.CommandBars(MenuName).Delete
    On Error GoTo 0

    'The below code creates the menu I named vbaShortCutMenu
    Set CB = Application.CommandBars.Add(MenuName, msoBarPopup, False, False)

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Print..."
    CBB.Tag = "Print..."
    CBB.OnAction = "=PrintActiveRptFrm()"  'Calls a module with EmailAsPDF()

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Send E-mail..."
    CBB.Tag = "Send E-mail..."
    CBB.OnAction = "=EmailAsPDF()"  'Calls a module with EmailAsPDF()

    'Adds the Close command.
    'Set CBB = CB.Controls.Add(msoControlButton, 923, , , True)
    'Starts a new group.
    'CBB.BeginGroup = True
    'Change the caption displayed for the control.
    'CBB.Caption = "Close Report"

    Set CB = Nothing
    Set CBB = Nothing

End Sub


```


---
## Report_qryVacationTakenParam (Document Module)

**Lines:** 74

```vba
Option Compare Database
Dim blnalternate As Boolean
Dim bool_nodata As Boolean

Private Sub GroupHeader1_Format(Cancel As Integer, FormatCount As Integer)
    If blnalternate Then
        Detail.BackColor = vbWhite
        GroupHeader1.BackColor = vbWhite
    Else
'        Detail.BackColor = RGB(237, 247, 249)    '16777184
'        GroupHeader1.BackColor = RGB(237, 247, 249)    '16777184
    End If
    blnalternate = Not (blnalternate)
End Sub

Private Sub Report_NoData(Cancel As Integer)
    bool_nodata = True
End Sub

Private Sub Report_Page()
    If bool_nodata = True Then
        MsgBox "Aucune donnée n'est trouvée.", vbExclamation, "Message Alert"
        DoCmd.Close acReport, "rpt_AbsenteeismPolicy", acSaveNo
    End If
End Sub
Private Sub Report_Load()
    CreateReportShortcutMenu
End Sub
Private Sub CreateReportShortcutMenu()
'==================================================================================================
'//In the Report_Load Event enter CreateReportShortcutMenu then in the reports Property/Shortcut
'   Menu Bar enter the MenuName "vbaShortCutMenu"
'
'//The numbers are Ms Access Control numbers you can download and excel file from MS
'
'//Reference: Microsoft Office 12.0 Object Library
'==================================================================================================

    Dim MenuName As String
    Dim CB As CommandBar
    Dim CBB As CommandBarButton

    MenuName = "vbaShortCutMenu"

    On Error Resume Next
    Application.CommandBars(MenuName).Delete
    On Error GoTo 0

    'The below code creates the menu I named vbaShortCutMenu
    Set CB = Application.CommandBars.Add(MenuName, msoBarPopup, False, False)

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Print..."
    CBB.Tag = "Print..."
    CBB.OnAction = "=PrintActiveRptFrm()"  'Calls a module mod_ShortCutMenuCommands Public Function PrintActiveRptFrm()

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Send E-mail..."
    CBB.Tag = "Send E-mail..."
    CBB.OnAction = "=EmailAsPDF()"  'Calls a module mod_ShortCutMenuCommands Public Function EmailAsPDF()

    'Adds the Close command.
    'Set CBB = CB.Controls.Add(msoControlButton, 923, , , True)
    'Starts a new group.
    'CBB.BeginGroup = True
    'Change the caption displayed for the control.
    'CBB.Caption = "Close Report"

    Set CB = Nothing
    Set CBB = Nothing

End Sub


```
