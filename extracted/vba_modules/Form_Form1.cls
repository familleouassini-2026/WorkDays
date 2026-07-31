' Module: Form_Form1
' Type: Document Module

Option Compare Database

Private Sub Form_Load()
Me.Text0.Value = DProduct("IndexationNumber", "tblIndexation")
End Sub