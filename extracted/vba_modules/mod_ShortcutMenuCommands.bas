' Module: mod_ShortcutMenuCommands
' Type: Standard Module

Option Compare Database
Option Explicit

Public Function PrintActiveRptFrm() As String
'==================================================================================================
'//Code works with right click for print dialog box for my reports.
'==================================================================================================
    Dim rptCur As Access.Report
    Set rptCur = Screen.ActiveReport

    On Error Resume Next
    DoCmd.SelectObject acReport, rptCur
    DoCmd.RunCommand acCmdPrint

    'Close the report
    CloseAllReports

End Function

Public Function EmailAsPDF()
'==================================================================================================
'//Code works with right click for my reports
'
'//Reference: Microsoft Outlook 12.0 Object Library
'==================================================================================================
    On Error GoTo Error_Handler
    Dim objOutlook As Outlook.Application
    Dim objEmail As Outlook.MailItem
    Dim strSubject As String
    Dim strMessageText As String
    Dim rptCur As Access.Report
    Dim AttachmentName As String
    Set rptCur = Screen.ActiveReport
    

    strSubject = "Absences Pour " & rptCur.EmpName
    
    
    strMessageText = "Ci-joint est le rapport d'absence de " & rptCur.EmpName & _
                   " pour " & rptCur.AbsenceMonthName & "."
    Set objOutlook = CreateObject("Outlook.application")
    Set objEmail = objOutlook.CreateItem(olMailItem)
    AttachmentName = SaveOpenReportAsPDF(rptCur.Name, rptCur.Caption)
    
    
    'Debug.Print AttachmentName
    With objEmail
    
        If IsNull(rptCur.mailAddress) Or rptCur.mailAddress = "" Then
        Else
        .To = rptCur.mailAddress
        End If
       
        
        .Subject = strSubject
        .Body = strMessageText
        .Attachments.Add AttachmentName
        .Display
    End With
    DeleteSavedReport AttachmentName    'Deletes the saved .pdf
    CloseAllReports    'Close Report
Exit_Here:
    Set objOutlook = Nothing
    Exit Function
Error_Handler:
    MsgBox Err & ": " & Err.Description
    CloseAllReports
    Resume Exit_Here
End Function

Public Function SaveOpenReportAsPDF(strReportName As String, strReportCaption As String) As String
'==================================================================================================
'Create report and save as an attachment to the current record
'==================================================================================================
    Dim myCurrentDir As String
    Dim myReportOutput As String
    Dim myMessage As String

    On Error GoTo ErrorHandler
    myCurrentDir = CurrentProject.Path & "\"
    myReportOutput = myCurrentDir & strReportCaption & ".pdf"
    If Dir(myReportOutput) <> "" Then    ' the file already exists--delete it first.
        VBA.SetAttr myReportOutput, vbNormal    ' remove any file attributes (e.g. read-only) that would block the kill command.
        VBA.Kill myReportOutput    ' delete the file.
    End If
    DoCmd.OutputTo acOutputReport, strReportName, acFormatPDF, myReportOutput, , , , acExportQualityPrint
    SaveOpenReportAsPDF = myReportOutput
    Exit Function
ErrorHandler:
    MsgBox Error$
End Function

Public Function DeleteSavedReport(FileName As String)
'==================================================================================================
'//Delete the saved .pdf, Filename is complete path and file name
'==================================================================================================
    On Error GoTo ErrorHandler
    If Dir(FileName) <> "" Then    ' the file already exists--delete it
        VBA.SetAttr FileName, vbNormal    ' remove any file attributes (e.g. read-only) that would block the kill command.
        VBA.Kill FileName    ' delete the file.
    End If
ErrorHandler:
    MsgBox Error$
End Function

Public Sub CloseAllReports()
'==================================================================================================
'//Code used to close the current report
'==================================================================================================
    Dim rpt As Access.Report
    For Each rpt In Application.Reports
        DoCmd.Close acReport, rpt.Name
    Next rpt
End Sub

