' Module: Form_frm_1_NavigationForm
' Type: Document Module

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