' Module: Form_subFormVacPDSDSummary
' Type: Document Module

Option Compare Database
Option Explicit

Private Sub Form_Current()
'==================================================================================================
'//Code so the zeros shows red and bold
'==================================================================================================
'//Vacation Days
    If Me.txtVacHoursLeft = 0 Then
        Me.txtVacHoursLeft.ForeColor = vbRed
        Me.txtVacHoursLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtVacHoursLeft.FontBold = True
    ElseIf Me.txtVacHoursLeft < 0 Then
        Me.txtVacHoursLeft.ForeColor = vbWhite
        Me.txtVacHoursLeft.BackColor = vbRed
        Me.txtVacHoursLeft.FontBold = True
        MsgBox "Vacation Days Overdrawn", vbCritical
    Else
        Me.txtVacHoursLeft.ForeColor = vbBlack
        Me.txtVacHoursLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtVacHoursLeft.FontBold = False
    End If

    '//Personal Days
    If Me.txtPersonalDaysLeft = 0 Then
        Me.txtPersonalDaysLeft.ForeColor = vbRed
        Me.txtPersonalDaysLeft.BackColor = vbWhite
        Me.txtPersonalDaysLeft.FontBold = True
    ElseIf Me.txtPersonalDaysLeft < 0 Then
        Me.txtPersonalDaysLeft.ForeColor = vbWhite
        Me.txtPersonalDaysLeft.BackColor = vbRed
        Me.txtPersonalDaysLeft.FontBold = True
        MsgBox "Personal Days Overdrawn", vbCritical
    Else
        Me.txtPersonalDaysLeft.ForeColor = vbBlack
        Me.txtPersonalDaysLeft.BackColor = vbWhite
        Me.txtPersonalDaysLeft.FontBold = False
    End If

    '//Sick Days
    If Me.txtSickDaysLeft <= 0 Then
        Me.txtSickDaysLeft.ForeColor = vbRed
        Me.txtSickDaysLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtSickDaysLeft.FontBold = True
    ElseIf Me.txtSickDaysLeft < 0 Then
        Me.txtSickDaysLeft.ForeColor = vbWhite
        Me.txtSickDaysLeft.BackColor = vbRed
        Me.txtSickDaysLeft.FontBold = True
        MsgBox "Sick Days Overdrawn", vbCritical
    Else
        Me.txtSickDaysLeft.ForeColor = vbBlack
        Me.txtSickDaysLeft.BackColor = RGB(236, 236, 236)    'Or VB Color 15527148
        Me.txtSickDaysLeft.FontBold = False
    End If

End Sub