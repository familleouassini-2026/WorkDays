' Module: Form_rpt_YearView
' Type: Document Module

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