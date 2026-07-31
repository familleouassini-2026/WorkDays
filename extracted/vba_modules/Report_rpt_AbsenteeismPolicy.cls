' Module: Report_rpt_AbsenteeismPolicy
' Type: Document Module

Option Compare Database
Dim blnalternate As Boolean
Dim bool_nodata As Boolean

Private Sub GroupHeader1_Format(Cancel As Integer, FormatCount As Integer)
    If blnalternate Then
        Detail.BackColor = vbWhite
        GroupHeader1.BackColor = vbWhite
    Else
        Detail.BackColor = RGB(237, 247, 249)    '16777184
        GroupHeader1.BackColor = RGB(237, 247, 249)    '16777184
    End If
    blnalternate = Not (blnalternate)
End Sub

Private Sub Report_NoData(Cancel As Integer)
    bool_nodata = True
End Sub

Private Sub Report_Page()
    If bool_nodata = True Then
        MsgBox "You do not have any absences toward the absenteeism and tardiness program.", vbExclamation, "Message Alert"
        DoCmd.Close acReport, "rpt_AbsenteeismPolicy", acSaveNo
    End If
End Sub

Private Sub Report_Load()
    CreateReportShortcutMenu
End Sub

Private Sub CreateReportShortcutMenu()
'==================================================================================================
'//In the Report_Load Event enter CreateReportShortcutMenu then in the reports Property/Shortcut
'   Menu Bar enter the MenuName "vbaShortCutMenu"
'
'//The numbers are Ms Access Control numbers you can download and excel file from MS
'
'//Reference: Microsoft Office 12.0 Object Library
'==================================================================================================

    Dim MenuName As String
    Dim CB As CommandBar
    Dim CBB As CommandBarButton

    MenuName = "vbaShortCutMenu"

    On Error Resume Next
    Application.CommandBars(MenuName).Delete
    On Error GoTo 0

    'The below code creates the menu I named vbaShortCutMenu
    Set CB = Application.CommandBars.Add(MenuName, msoBarPopup, False, False)

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Print..."
    CBB.Tag = "Print..."
    CBB.OnAction = "=PrintActiveRptFrm()"  'Calls a module with EmailAsPDF()

    Set CBB = CB.Controls.Add(msoControlButton, , , , True)
    CBB.Caption = "Send E-mail..."
    CBB.Tag = "Send E-mail..."
    CBB.OnAction = "=EmailAsPDF()"  'Calls a module with EmailAsPDF()

    'Adds the Close command.
    'Set CBB = CB.Controls.Add(msoControlButton, 923, , , True)
    'Starts a new group.
    'CBB.BeginGroup = True
    'Change the caption displayed for the control.
    'CBB.Caption = "Close Report"

    Set CB = Nothing
    Set CBB = Nothing

End Sub

