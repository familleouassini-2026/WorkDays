' Module: mod_CalendarInputBox
' Type: Standard Module

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