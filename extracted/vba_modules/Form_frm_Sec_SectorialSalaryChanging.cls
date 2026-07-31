' Module: Form_frm_Sec_SectorialSalaryChanging
' Type: Document Module

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