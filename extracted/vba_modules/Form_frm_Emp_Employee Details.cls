' Module: Form_frm_Emp_Employee Details
' Type: Document Module


Private Sub cmdClose_Click()
DoCmd.Close acForm, Me.Form.Name
End Sub

Private Sub Command1144_Click()
DoCmd.OpenForm "frm_Abs_HolidayInputForm", acNormal, , , , acDialog, Me.EmployeeID
Me.Form.Refresh

End Sub

Private Sub Command1145_Click()
DoCmd.OpenForm "frm_YearCalendar", acNormal, , , , , Me.SecteurID & "_" & Me.EmployeeID
End Sub

Private Sub ContractGen_Click()
Dim strWordDoc  As String

    'Path to the word document of the Mail Merge
    
    
    '###-1 CHANGE THE FOLLOWING LINE TO POINT TO YOUR DOCUMENT!!
    
    strWordDoc = Me.ContractType.Value
    
    
    strWordDoc = CurrentProject.Path & "\Contrats Modèles\" & strWordDoc & ".docx"

    ' Call the code to merge the latest info
    startMerge strWordDoc
End Sub


'----------------------------------------------------
' Auto Mail Merge With VBA and Access (Early Binding)
'----------------------------------------------------
' NOTE: To use this code, you must reference
' The Microsoft Word 14.0 (or current version)
' Object Library by clicking menu Tools > References
' Check the box for:
' Microsoft Word 14.0 Object Library in Word 2010
' Microsoft Word 15.0 Object Library in Word 2013
' Click OK
'----------------------------------------------------
Function startMerge(strDocPath As String)
    Dim oWord           As Word.Application
    Dim oWdoc           As Word.Document
    Dim wdInputName     As String
    Dim wdOutputName    As String
    Dim outFileName     As String

    ' Set Template Path
    wdInputName = strDocPath            ' was CurrentProject.Path & "\mail_merge.docx"

    ' Create unique save filename with minutes and seconds to prevent overwrite
    outFileName = "Contract_" & Format(Now(), "yyyymmddmms")

    ' Output File Path w/outFileName
    wdOutputName = CurrentProject.Path & "\Contrats Employés\" & outFileName

            strsql = "SELECT * FROM tbl_Emp_Employees where EmployeeID = " & Me.EmployeeID      ' Change the table name or your query


    Set oWord = New Word.Application
    Set oWdoc = oWord.Documents.Open(wdInputName)





    ' Start mail merge

    '###-2 CHANGE THE SQLSTATEMENT AS NEEDED
    With oWdoc.MailMerge
        .MainDocumentType = wdFormLetters
        .OpenDataSource _
            Name:=CurrentProject.FullName, _
            ReadOnly:=True, _
            AddToRecentFiles:=False, _
            LinkToSource:=True, _
            Connection:="QUERY mailmerge", SQLStatement:=strsql                   ' Change the table name or your query
        .Destination = wdSendToNewDocument
       
    End With
    
     oWdoc.MailMerge.Execute Pause:=False

    ' Hide Word During Merge
    oWord.Visible = False

    ' Save file as PDF
    ' Uncomment the line below and comment out
    ' the line below "Save file as Word Document"
    '------------------------------------------------
    'oWord.ActiveDocument.SaveAs2 wdOutputName & ".pdf", 17

    ' Save file as Word Document
    ' ###-3 IF YOU DON'T WANT TO SAVE AS A NEW NAME, COMMENT OUT NEXT LINE
    oWord.ActiveDocument.SaveAs2 wdOutputName & ".docx", 16

    ' SHOW THE DOCUMENT
    oWord.Visible = True

    ' Close the template file
    If oWord.Documents(1).FullName = strDocPath Then
        oWord.Documents(1).Close savechanges:=False
    ElseIf oWord.Documents(2).FullName = strDocPath Then
        oWord.Documents(2).Close savechanges:=False
    Else
        MsgBox "Well, this should never happen! Only expected two documents to be open"
    End If

    ' Quit Word to Save Memory
    'oWord.Quit savechanges:=False

    ' Clean up memory
    '------------------------------------------------
    Set oWord = Nothing
    Set oWdoc = Nothing

End Function




'' Auto Mail Merge With VBA and Access (Early Binding)
''----------------------------------------------------
'' NOTE: To use this code, you must reference
'' The Microsoft Word 14.0 (or current version)
'' Object Library by clicking menu Tools > References
'' Check the box for:
'' Microsoft Word 14.0 Object Library in Word 2010
'' Microsoft Word 15.0 Object Library in Word 2013
'' Click OK
''----------------------------------------------------
'Sub startMerge()
'    Dim oWord As Word.Application
'    Dim oWdoc As Word.Document
'    Dim wdInputName As String
'    Dim wdOutputName As String
'    Dim outFileName As String
'
'    ' Set Template Path
'    '------------------------------------------------
'    wdInputName = CurrentProject.Path & "\templates\mailmerge-template.docx"
'
'    ' Create unique save filename with minutes
'    ' and seconds to prevent overwrite
'    '------------------------------------------------
'    outFileName = "MailMergeFile_" & Format(Now(), "yyyymmddmms")
'
'    ' Output File Path w/outFileName
'    '------------------------------------------------
'    wdOutputName = CurrentProject.Path & "\completed\" & outFileName
'
'    Set oWord = New Word.Application
'    Set oWdoc = oWord.Documents.Open(wdInputName)
'
'    ' Start mail merge
'    '------------------------------------------------
'    With oWdoc.MailMerge
'        .MainDocumentType = wdFormLetters
'        .OpenDataSource _
'            Name:=CurrentProject.FullName, _
'            AddToRecentFiles:=False, _
'            LinkToSource:=True, _
'            Connection:="QUERY mailmerge", _
'            SQLStatement:="SELECT * FROM [mailmerge]"
'        .Destination = wdSendToNewDocument
'        .Execute Pause:=False
'    End With
'
'    ' Hide Word During Merge
'    '------------------------------------------------
'    oWord.Visible = False
'
'    ' Save file as PDF
'    ' Uncomment the line below and comment out
'    ' the line below "Save file as Word Document"
'    '------------------------------------------------
'    'oWord.ActiveDocument.SaveAs2 wdOutputName & ".pdf", 17
'
'    ' Save file as Word Document
'    '------------------------------------------------
'    oWord.ActiveDocument.SaveAs2 wdOutputName & ".docx", 16
'
'    ' Quit Word to Save Memory
'    '------------------------------------------------
'    oWord.Quit savechanges:=False
'
'    ' Clean up memory
'    '------------------------------------------------
'    Set oWord = Nothing
'    Set oWdoc = Nothing
'End Sub
Function fillwordfrom(Path As String)

Dim appword As Word.Application
Dim doc As Word.Document
'Dim Path As String

Select Case Secteur



Case "Admin"

Case "Medecin"
End Select

On Error Resume Next
Error.Clear
Set appword = GetObject(, "word.application")

If Err.Number <> 0 Then
Set appword = New Word.Application
appword.Visible = True
appword.Activate
End If
Set doc = appword.Documents.Open(Path)
Set doc = Nothing
Set appword = Nothing


End Function
Private Sub Form_Current()
Me.Refresh
End Sub

Private Sub Form_Open(Cancel As Integer)
DoCmd.Maximize
End Sub

Private Sub GrantedSeniorityDate_GotFocus()
Me.GrantedSeniorityDate.SpecialEffect = 2
Me.GrantedSeniorityDate.FontBold = False

End Sub
Private Sub GrantedSeniorityDate_lostFocus()
Me.GrantedSeniorityDate.SpecialEffect = 0
Me.GrantedSeniorityDate.FontBold = True
End Sub

'Private Sub Form_Load()
'Call Toggle1100_Click
'End Sub

Private Sub Toggle1100_Click()
    Dim ctl As Access.Control


For Each ctl In Me.Controls
If ctl.Tag = "SeniorityGroupDetails" Then
            Select Case ctl.ControlType
            Case acTextBox
            
            If Me.Toggle1100 = True Then
            ctl.Visible = True
            Else
            ctl.Visible = False
            End If
            End Select
End If
Next ctl


End Sub

