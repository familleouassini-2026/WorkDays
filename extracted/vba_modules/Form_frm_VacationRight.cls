' Module: Form_frm_VacationRight
' Type: Document Module

Option Compare Database

Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Refresh
End Sub

Private Sub Form_AfterUpdate()
Me.Parent.Refresh
End Sub