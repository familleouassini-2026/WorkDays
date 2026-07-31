' Module: Form_frm_Abs_HolidaySelectionDetails
' Type: Document Module

Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Requery
End Sub