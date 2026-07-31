' Module: Form_frm_CalendarInputBox
' Type: Document Module

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



