' Module: Form_frm_Emp_Employee List
' Type: Document Module

Option Compare Database
Option Explicit

Private Function clearBox()
    [SearchBox] = Null
End Function

Private Sub LabelWizard_Click()
On Error GoTo ErrorHandler

    ' Code by Jeff Conrad
    ' This button launches the Label Report Wizard
    ' The second argument requires the name of a saved table or query name
    ' for the wizard to point to
    Application.Run "acwzmain.mlbl_Entry", "Contacts Extended"
    
ExitPoint:
    Exit Sub
    
ErrorHandler:
    'MsgBox "The following error has occurred:" _
    '& vbNewLine & "Error Number: " & Err.Number _
    '& vbNewLine & "Error Description: " & Err.Description _
    ', vbExclamation, "Unexpected Error"
    MsgBox "In order to launch the labels wizard you must click the Open button on the security notice." _
    & vbNewLine & "Error Number: " & Err.Number _
    & vbNewLine & "Error Description: " & Err.Description _
    , vbExclamation, "Unexpected Error"
    Resume ExitPoint
    
End Sub

'------------------------------------------------------------
' cmdAddFromOutlook_Click
'
'------------------------------------------------------------
Private Sub cmdAddFromOutlook_Click()
On Error GoTo cmdAddFromOutlook_Click_Err

    On Error Resume Next
    DoCmd.RunCommand acCmdAddFromOutlook


cmdAddFromOutlook_Click_Exit:
    Exit Sub

cmdAddFromOutlook_Click_Err:
    MsgBox Error$
    Resume cmdAddFromOutlook_Click_Exit

End Sub


'------------------------------------------------------------
' SearchGo_Click
'
'------------------------------------------------------------

'commented 20241101 by Hamid --- start


'Private Sub SearchGo_Click()
'On Error GoTo SearchGo_Click_Err
'
'    ' _AXL:<?xml version="1.0" encoding="UTF-16" standalone="no"?>
'    ' <UserInterfaceMacro For="cmdAddFromOutlook" xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements><Action Name="OnError"/><Action Name="RunMenuCommand"><A
'    ' _AXL:rgument Name="Command">AddContactFromOutlook</Argument></Action></Statements></UserInterfaceMacro>
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        ' Clear Filter when search box empty
'        DoCmd.ApplyFilter "", """""", ""
'        DoCmd.GoToControl "SearchBox"
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'        DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    End If
'    If (Eval("[CurrentProject].[IsTrusted] And ([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""")")) Then
'        SearchBox.Text = ""
'    End If
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        End
'    End If
'    If (VarType(Form!SearchBox) <> 8) Then
'        End
'    End If
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    If (Eval("([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""") And [SearchClear].[Visible]<>0")) Then
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        End
'    End If
'    ' Handle "'s in search
'    TempVars.Add "strSearch", Replace(Forms![Employee List]!SearchBox, """", """""")
'    ' Build the Filter
'    TempVars.Add "strFilter", "([EmpLName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([EmpFName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([E-mail Address] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Job Title] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Postal Code] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    DoCmd.ApplyFilter "", TempVars!strFilter, ""
'    TempVars.Remove "strFilter"
'    TempVars.Remove "strSearch"
'    DoCmd.SetProperty "SearchClear", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "-1"
'    DoCmd.GoToControl "SearchBox"
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'
'
'SearchGo_Click_Exit:
'    Exit Sub
'
'SearchGo_Click_Err:
'    MsgBox Error$
'    Resume SearchGo_Click_Exit
'
'
'
'End Sub


'
'
'
'
''------------------------------------------------------------
'' SearchGo_GotFocus
''
''------------------------------------------------------------
'Private Sub SearchGo_GotFocus()
'On Error GoTo SearchGo_GotFocus_Err
'
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        ' Clear Filter when search box empty
'        DoCmd.ApplyFilter "", """""", ""
'        DoCmd.GoToControl "SearchBox"
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "0"
'        DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'        DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    End If
'    If (Eval("[CurrentProject].[IsTrusted] And ([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""")")) Then
'        SearchBox.Text = ""
'    End If
'    If (Eval("[Form]![SearchBox] Is Null Or [Form]![SearchBox]=""""")) Then
'        End
'    End If
'    If (VarType(Form!SearchBox) <> 8) Then
'        End
'    End If
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    If (Eval("([Form]![SearchBox] Is Null Or [Form]![SearchBox]="""") And [SearchClear].[Visible]<>0")) Then
'        DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'        End
'    End If
'    ' Handle "'s in search
'    TempVars.Add "strSearch", Replace(Forms![Employee List]!SearchBox, """", """""")
'    ' Build the Filter
'    TempVars.Add "strFilter", "([EmpLName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([EmpFName] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([E-mail Address] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Job Title] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    TempVars.Add "strFilter", TempVars!strFilter & " OR ([Postal Code] Like "" * " & [TempVars]![strSearch] & " * "" )"
'    DoCmd.ApplyFilter "", TempVars!strFilter, ""
'    TempVars.Remove "strFilter"
'    TempVars.Remove "strSearch"
'    DoCmd.SetProperty "SearchClear", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "-1"
'    DoCmd.GoToControl "SearchBox"
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'
'
'SearchGo_GotFocus_Exit:
'    Exit Sub
'
'SearchGo_GotFocus_Err:
'    MsgBox Error$
'    Resume SearchGo_GotFocus_Exit
'
'End Sub
'
'
''------------------------------------------------------------
'' SearchClear_Click
''
''------------------------------------------------------------
'Private Sub SearchClear_Click()
'On Error GoTo SearchClear_Click_Err
'
'    ' Clear Filter
'    DoCmd.ApplyFilter "", """""", ""
'    DoCmd.GoToControl "SearchBox"
'    DoCmd.SetProperty "SearchClear", acPropertyVisible, "0"
'    DoCmd.SetProperty "iconSearchClear", acPropertyVisible, "0"
'    DoCmd.SetProperty "SearchGo", acPropertyVisible, "-1"
'    DoCmd.SetProperty "iconSearchGo", acPropertyVisible, "-1"
'    If (CurrentProject.IsTrusted) Then
'        SearchBox = ""
'    End If
'    Exit Sub
'
'
'SearchClear_Click_Exit:
'    Exit Sub
'
'SearchClear_Click_Err:
'    MsgBox Error$
'    Resume SearchClear_Click_Exit
'
'End Sub

'commented 20241101 by Hamid --- End


'------------------------------------------------------------
' cmdWelcome_Click
'
'------------------------------------------------------------
Private Sub cmdWelcome_Click()
On Error GoTo cmdWelcome_Click_Err

  DoCmd.OpenForm "Welcome", acNormal, "", "", , acNormal


cmdWelcome_Click_Exit:
    Exit Sub

cmdWelcome_Click_Err:
    MsgBox Error$
    Resume cmdWelcome_Click_Exit

End Sub


'------------------------------------------------------------
' cmdNew_Contact_Click
'
'------------------------------------------------------------
Private Sub cmdNew_Contact_Click()
On Error GoTo cmdNew_Contact_Click_Err

    DoCmd.OpenForm "frm_Emp_Employee Details", acNormal, "", "1=0", , acDialog
    On Error Resume Next
    DoCmd.Requery ""
    DoCmd.SearchForRecord , "", acFirst, "[EmployeeID]=" & Nz(DMax("[EmployeeID]", Form.RecordSource), 0)


cmdNew_Contact_Click_Exit:
    Exit Sub

cmdNew_Contact_Click_Err:
    MsgBox Error$
    Resume cmdNew_Contact_Click_Exit

End Sub



'
''------------------------------------------------------------
'' LabelWizard_MouseDown
''
''------------------------------------------------------------
'Private Sub LabelWizard_MouseDown(Button As Integer, Shift As Integer, X As Double, Y As Double)
'On Error GoTo LabelWizard_MouseDown_Err
'
'    ' _AXL:<?xml version="1.0" encoding="UTF-16" standalone="no"?>
'    ' <UserInterfaceMacro For="showHideColumns" xmlns="http://schemas.microsoft.com/office/accessservices/2009/11/application"><Statements><Action Name="RunMenuCommand"><Argument Name="Command">Unh
'    ' _AXL:ideColumns</Argument></Action></Statements></UserInterfaceMacro>
'    If (Not CurrentProject.IsTrusted) Then
'        Beep
'        MsgBox "To use this functionality the database must be trusted." & Chr(13) & Chr(10) & "If you see the 'Security Warning' bar above, click 'Options' and then 'Enable this content.'", vbInformation, "Enable Trusted Mode"
'        Exit Sub
'    End If
'
'
'LabelWizard_MouseDown_Exit:
'    Exit Sub
'
'LabelWizard_MouseDown_Err:
'    MsgBox Error$
'    Resume LabelWizard_MouseDown_Exit
'
'End Sub


'------------------------------------------------------------
' Last_Name_DblClick
'
'------------------------------------------------------------
Private Sub Last_Name_DblClick(Cancel As Integer)

Call First_Name_DblClick(0)

End Sub


'------------------------------------------------------------
' First_Name_DblClick
'
'------------------------------------------------------------
Private Sub First_Name_DblClick(Cancel As Integer)
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


'------------------------------------------------------------
' txtOpen_Click
'
'------------------------------------------------------------
Private Sub txtOpen_Click()

 On Error GoTo 0
    If (IsNull(EmployeeID)) Then
       Call cmdNew_Contact_Click
       
       Exit Sub
    End If

 First_Name_DblClick (0)

End Sub

