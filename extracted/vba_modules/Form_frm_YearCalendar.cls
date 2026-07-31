' Module: Form_frm_YearCalendar
' Type: Document Module

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