' Module: Form_ximportantfrm_UpdateEmpInfo
' Type: Document Module

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
