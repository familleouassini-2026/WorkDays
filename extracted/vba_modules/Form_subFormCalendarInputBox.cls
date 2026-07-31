' Module: Form_subFormCalendarInputBox
' Type: Document Module

Option Compare Database
Option Explicit

Public Function LimitRecords(frm As Access.Form, Optional RecLimit As Integer = 1)
'http://www.datagnostics.com/dtips/limitentries.html
' Limit the number of records in the form passed as
' to no more than the number specified by .
    With frm.RecordsetClone
        If .RecordCount <> 0 Then .MoveLast
        frm.AllowAdditions = (.RecordCount < RecLimit)
    End With

End Function

Private Sub cmdDeleteAbsence_Click()
'--------------------------------------------------------------------------------------------------
'  Deletes selected absence
'--------------------------------------------------------------------------------------------------
Dim parentID As Long
Dim strsql As String
DoCmd.SetWarnings False
    
    If IsNull(Me.txtAttendanceID) Then
            MsgBox "There is no absence to delete!", vbInformation, "No Absence"
      Exit Sub
    End If
        
     If MsgBox("Are you sure you want to delete this absence?" & vbCrLf _
                & "There is no way to recover these records if you say 'Yes'.", vbCritical + vbYesNo, "Confirm Deletion Of Absence") = vbYes Then
        
        
            If IsNull(Me.HolidaySelectionID) Then
                      DoCmd.RunCommand acCmdDeleteRecord
                      DoCmd.Close acForm, "frm_CalendarInputBox"
                  Else
                      parentID = Me.HolidaySelectionID
                      DoCmd.RunCommand acCmdDeleteRecord
                      strsql = "SELECT TOP 1 * FROM tbl_Abs_HolidaySelection where HolidaySelectionID = " & parentID
                    Call deleterecord(strsql)
            End If
        Else
    End If

DoCmd.SetWarnings True
                      DoCmd.Close acForm, "frm_CalendarInputBox"


End Sub

Private Sub cmdSpellCheck_Click()
'--------------------------------------------------------------------------------------------------
'  Spell checker for the AbsenceReason memo field
'--------------------------------------------------------------------------------------------------
    If IsNull(txtAbsenceReason) = True Then
        MsgBox "There is no data to spell check", vbInformation, "Spell Check"
        Exit Sub
    Else
        With Me!txtAbsenceReason
            Me.txtAbsenceReason.SetFocus
            If Len(.Value) > 0 Then
                DoCmd.SetWarnings False
                .SelStart = 1
                .SelLength = Len(.Value)
                DoCmd.RunCommand acCmdSpelling
                .SelLength = 0
                DoCmd.SetWarnings True
            End If
        End With
    End If
End Sub
Private Sub Form_BeforeUpdate(Cancel As Integer)
'--------------------------------------------------------------------------------------------------
'  Valadate data in subform before moving to next record or closing frm_CalendarInputBox
'--------------------------------------------------------------------------------------------------

    Dim ctl As Access.Control
    Dim strErrCtlName As String
    Dim strErrorMessage As String
    Dim strMsgName As String
    Dim lngErrCtlTabIndex As Long
    Dim blnNoValue As Boolean
'    Dim sdsd As String
    
    Select Case Me.TimeType.Value
    
    Case "H/M"
    Me.txtAbsenceTime.Tag = "Required"
     Me.txtAbsenceDays.Tag = ""
    Case "Jours"
    Me.txtAbsenceDays.Tag = "Required"
    Me.txtAbsenceTime.Tag = ""
    End Select
    
    
    

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
        MsgBox "A moins que vous supprimez cet enregistrement les champs suivants sont requis:" & vbCr & _
               strErrorMessage, _
               vbInformation, "Champs requis sont vides"
        Me.Controls(strErrCtlName).SetFocus
        Cancel = True
    Else
'    sdsd = Me.txtAbsenceReason.Value

Select Case Me.TimeType

Case "H/M"

Me.HolidaySelectionID.Value = RecordSelectionGetID(Me.EmployeeID.Value, Me.AbsenceDate.Value, Me.AbsenceDate.Value, 0, Me.AbsenceID.Value, Me.yearVacation.Value, Me.AbsenceTime.Value, Me.txtAbsenceReason.Value)

Case "Jours"

Me.HolidaySelectionID.Value = RecordSelectionGetID(Me.EmployeeID.Value, Me.AbsenceDate.Value, Me.AbsenceDate.Value, Me.AbsenceDays.Value, Me.AbsenceID.Value, Me.yearVacation.Value, "", Me.txtAbsenceReason.Value)

End Select
        Cancel = False
    End If
End Sub

Private Sub Form_Current()
'--------------------------------------------------------------------------------------------------
'  Limit number of records you want to allow
'
'//http://www.datagnostics.com/dtips/limitentries.html
'--------------------------------------------------------------------------------------------------

'LimitRecords Me   ' Allows at most 1 record
'    LimitRecords Me, 2   ' Allow at most 2 records
LimitRecords Me, 3   ' Allow at most 3 records
'LimitRecords Me, 4   ' Allow at most 4 records
'LimitRecords Me, 5   ' Allow at most 5 records

End Sub

Private Sub txtAbsenceReason_Change()
'--------------------------------------------------------------------------------------------------
'  Limit the amount of text you can enter
'--------------------------------------------------------------------------------------------------
    Dim CharCount As Integer

    If Not IsNull(Len(txtAbsenceReason)) Then
        CharCount = Len(txtAbsenceReason.Text)
        If CharCount > 138 Then
            MsgBox "You've reached the a 138 charactor text limit", vbInformation, "Limit Reached"
            Me.txtAbsenceReason = Left(Me.txtAbsenceReason.Text, 138)
        End If
    End If
End Sub
