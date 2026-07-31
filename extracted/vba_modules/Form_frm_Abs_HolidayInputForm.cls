' Module: Form_frm_Abs_HolidayInputForm
' Type: Document Module

Private Sub btnReset_Click()
Me.cmbAbsenceID.Value = ""
Me.txtSartDate.Value = ""
Me.txtEndDate.Value = ""
Me.txtNbreHeures.Value = ""
Me.txtNbreJours.Value = ""
Me.txtreason.Value = ""

Me.cmbAbsenceID.Enabled = True
Me.txtSartDate.Enabled = False
Me.txtEndDate.Enabled = False
Me.txtNbreHeures.Enabled = False
Me.txtNbreJours.Enabled = False
Me.txtreason.Enabled = False



End Sub
Private Sub btnValidation_Click()
   Dim strsql As String
   Dim intmsg As Integer
   Dim strmessage As String
   Dim strValidationMessage As String
   Dim strSelection As String
   Dim rcdSlction As Long
   Dim msg As Long
 
  strmessage = " Vous être sur le point d'insérer un ou plusieurs enregistrements." _
& vbNewLine & vbNewLine & _
"Appuyez sur OK pour continuer." & vbNewLine & _
"Appuyez sur Annuler pour revenir à l'étape précédentes"


  intmsg = MsgBox(strmessage, vbOKCancel + vbExclamation, "Enregistrement")
  
  
 If intmsg = 2 Then
 Exit Sub
 End If
  
  On Error GoTo Err_Handler
  
  
    If IsNull(Me.txtSartDate) Or Me.txtSartDate.Value = "" Or cmbEmployeeID.Value = "" Or IsNull(cmbEmployeeID) Or IsNull(cmbAbsenceID) Or cmbAbsenceID.Value = "" Or IsNull(cmbyear) Or cmbyear.Value = "" Then
    
   strValidationMessage = "La date de début, le nom de l'employé, l'année de congé et le code d'absence doivent être renseignés."
      
        GoTo Exit_Proc
        
    End If
    
    If Year(Me.txtSartDate.Value) <> cmbyear.Value Then
    
    strValidationMessage = "l'année de la date de début est inférieure à l'année de congé."
      
        GoTo Exit_Proc
    
    End If
    

Holidayslist = loadHolidaysIntoArray
strsql = "SELECT TOP 1 * FROM tbl_YearCalendar"



        Select Case strTimeType
        
        Case "Jours"
        
            If IsNull(txtNbreJours) Or txtNbreJours.Value = "" Then
               
               strValidationMessage = "Ce code d'absence requiert un nombre de jours supérieur ou égal à un."
               
                GoTo Exit_Proc
             Else
                
                ' we can start counting from here
                
            rcdSlction = RecordSelectionGetID(Me.cmbEmployeeID.Value, Me.txtSartDate.Value, "", _
            Me.txtNbreJours, Me.cmbAbsenceID, Me.cmbyear.Value, "", Me.txtreason.Value)
                
               Call holidaysCalcJour(rcdSlction, strsql, cmbyear.Value, Me.txtSartDate.Value, Me.cmbEmployeeID.Value, Me.cmbAbsenceID.Value, Me.txtNbreJours.Value, loadTimeSheetIntoArray(Me.cmbEmployeeID.Value), Holidayslist, Me.txtreason.Value)
            End If
                
        
        Case "H/M"
        
If IsNull(Me.txtEndDate) Or Me.txtEndDate.Value = "" Then
                
           strValidationMessage = "La date de fin doit être renseignée."

                GoTo Exit_Proc
                
                ElseIf Me.txtEndDate.Value < Me.txtSartDate.Value Then
                
           strValidationMessage = "La date de fin doit être supérieure à la date de début."
                
                GoTo Exit_Proc
                
                ElseIf Me.txtEndDate.Value = Me.txtSartDate.Value Then
                
                        If IsNull(Me.txtNbreHeures) Or Me.txtNbreHeures.Value = "" Then
                      
                        strValidationMessage = "Le nombre d'heure doit être renseigné si la date de début est égale à la date de fin"
 
                        GoTo Exit_Proc
                      
                         Else
                        
                   rcdSlction = RecordSelectionGetID(Me.cmbEmployeeID.Value, Me.txtSartDate.Value, txtEndDate.Value, _
                    0, Me.cmbAbsenceID, Me.cmbyear.Value, Me.txtNbreHeures.Value, Me.txtreason.Value)
                     
                        Call holidaysCalc_Sd_equal_Ed(rcdSlction, strsql, cmbyear.Value, txtSartDate.Value, Me.cmbEmployeeID.Value, Me.cmbAbsenceID.Value, txtEndDate.Value, loadTimeSheetIntoArray(Me.cmbEmployeeID.Value), Holidayslist, Me.txtNbreHeures.Value, Me.txtreason.Value)
                                               
                         End If
                         
                ElseIf Me.txtEndDate.Value > Me.txtSartDate.Value Then
                ' start counting from here taking the time sheet into consideration
                If IsNull(Me.txtNbreHeures) Or Me.txtNbreHeures.Value = "" Then
                
                   rcdSlction = RecordSelectionGetID(Me.cmbEmployeeID.Value, Me.txtSartDate.Value, Me.txtEndDate.Value, _
                   0, Me.cmbAbsenceID, Me.cmbyear.Value, "", Me.txtreason.Value)
                
                
                
               Call holidaysCalcTimeSheet(rcdSlction, strsql, cmbyear.Value, txtSartDate.Value, Me.cmbEmployeeID.Value, Me.cmbAbsenceID.Value, txtEndDate.Value, loadTimeSheetIntoArray(Me.cmbEmployeeID.Value), Holidayslist, Me.txtreason.Value)
                Else
                
                 strValidationMessage = "Le nombre d'heure ne doit pas être renseigné si la date de début est inférieure à la date de fin: " _
                        & vbNewLine & vbNewLine & " L'horaire de l'employé sélectionné sera pris en considération"
                      
                        GoTo Exit_Proc
                
                End If
                
Else
Exit Sub
End If
                
                
        End Select
        Me.Form.Requery
        Me.Form.Refresh
        
Exit Sub
        
Exit_Proc:

msg = MsgBox(strValidationMessage, vbCritical, "Validation")

Exit Sub

Err_Handler:
     MsgBox Err.Number & " " & Err.Description, vbCritical, "Processus de validation"


End Sub
Public Sub holidaysCalcTimeSheet(HldySlctnID As Long, strsql As String, yearholiday As Integer, SrtDte As Date, empID As Long, AbsID As Long, EndDte As Date, loadTimeSheetIntoArray As Variant, Holidayslist As Variant, Optional strAbsenceRea As String)


Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset
Dim dteDate As Date
Dim AbsenTime   As Date
Dim intDay As Integer


On Error GoTo tran_Err

    Set wksp = DBEngine.Workspaces(0) 'The current database
    wksp.BeginTrans 'Start the transaction buffer
Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)


dteDate = SrtDte


    ' Loop until to reach the enddate inclusive.


Do Until dteDate = EndDte + 1

If IsInHoliday(dteDate, Holidayslist) Then
   
Else

             intDay = DatePart("w", dteDate)
        
        
        Select Case intDay
                
                 Case vbMonday
                        AbsenTime = loadTimeSheetIntoArray(0)
                
                 Case vbTuesday
                        AbsenTime = loadTimeSheetIntoArray(1)
                
                 Case vbWednesday
                        AbsenTime = loadTimeSheetIntoArray(2)
                
                Case vbThursday
                        AbsenTime = loadTimeSheetIntoArray(3)
                
                Case vbFriday
                        AbsenTime = loadTimeSheetIntoArray(4)
                
                 Case vbSaturday
                        AbsenTime = loadTimeSheetIntoArray(5)
                
                 Case vbSunday
                        AbsenTime = loadTimeSheetIntoArray(6)
        End Select
        
             
           If IsNull(AbsenTime) Or AbsenTime = 0 Then
           
            Else
                If IsNull(strAbsenceRea) Or strAbsenceRea = "" Then
                AbsenceRea = "N/A"
                Else
                AbsenceRea = strAbsenceRea
                End If
        
                With rs
                .AddNew
                    !AbsenceDate = dteDate
                    !EmployeeID = empID
                    !AbsenceID = AbsID
                    !yearVacation = yearholiday
                    !AbsenceTime = CDate(Nz(AbsenTime, #12:00:00 AM#))
                    !AbsenceReason = AbsenceRea
                    !HolidaySelectionID = HldySlctnID
                    !DateCreated = Now()

                 .Update
                End With
          End If
        


End If

dteDate = dteDate + 1

Loop

wksp.CommitTrans
MsgBox ("L'enregistrement a été effectué avec succès")
Set wksp = Nothing
rs.Close
Set rs = Nothing


Call btnReset_Click

Exit Sub

tran_Err:
    
    wksp.Rollback
    Set wksp = Nothing
    rs.Close
    Set rs = Nothing

    MsgBox "L'enregistrement a échoué! Erreur: " & Err.Description



End Sub
Sub holidaysCalcJour(HldySlctnID As Long, strsql As String, yearholiday As Integer, SrtDte As Date, empID As Long, AbsID As Long, nbreJour As Integer, loadTimeSheetIntoArray, Holidayslist As Variant, Optional strAbsenceRea As String)

Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset
Dim dteDate As Date
Dim AbsenTime   As Date


On Error GoTo tran_Err

    Set wksp = DBEngine.Workspaces(0) 'The current database
    wksp.BeginTrans 'Start the transaction buffer
    
Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)

AbsenTime = 0
dteDate = SrtDte


    ' Loop until to reach the enddate inclusive.


i = 1

Do Until i = nbreJour + 1

intDay = DatePart("w", dteDate)
'Do Until dteDate = EndDte + 1


If IsInHoliday(dteDate, Holidayslist) Then
   
Else

             intDay = DatePart("w", dteDate)
        
         
        Select Case intDay
                
                 Case vbMonday
                        AbsenTime = loadTimeSheetIntoArray(0)
                
                 Case vbTuesday
                        AbsenTime = loadTimeSheetIntoArray(1)
                
                 Case vbWednesday
                        AbsenTime = loadTimeSheetIntoArray(2)
                
                Case vbThursday
                        AbsenTime = loadTimeSheetIntoArray(3)
                
                Case vbFriday
                        AbsenTime = loadTimeSheetIntoArray(4)
                
                 Case vbSaturday
                        AbsenTime = loadTimeSheetIntoArray(5)
                
                 Case vbSunday
                        AbsenTime = loadTimeSheetIntoArray(6)
        End Select
        
             
           If IsNull(AbsenTime) Or AbsenTime = 0 Then
            
   
            Else
                If IsNull(strAbsenceRea) Or strAbsenceRea = "" Then
                AbsenceRea = "N/A"
                Else
                AbsenceRea = strAbsenceRea
                End If
            
                With rs
                .AddNew
                    !AbsenceDate = dteDate
                    !EmployeeID = empID
                    !AbsenceID = AbsID
                    !yearVacation = yearholiday
                    !AbsenceDays = 1
                    !AbsenceReason = AbsenceRea
                    !HolidaySelectionID = HldySlctnID
                    !DateCreated = Now()
                 .Update
                End With
                
                i = i + 1
                
            End If
            
            
End If

dteDate = dteDate + 1
Loop


wksp.CommitTrans
MsgBox ("L'enregistrement a été effectué avec succès")
Set wksp = Nothing
rs.Close
Set rs = Nothing


Call btnReset_Click

Exit Sub

tran_Err:
    
    wksp.Rollback
    Set wksp = Nothing
    rs.Close
    Set rs = Nothing

    MsgBox "L'enregistrement a échoué! Erreur: " & Err.Description


End Sub
Sub holidaysCalc_Sd_equal_Ed(HldySlctnID As Long, strsql As String, yearholiday As Integer, SrtDte As Date, empID As Long, AbsID As Long, EndDte As Date, loadTimeSheetIntoArray As Variant, Holidayslist As Variant, AbsenTime As Date, Optional strAbsenceRea As String)

Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset
Dim dteDate As Date
Dim curentdateisholiday As Boolean
Dim strmessage As String
Dim AbsenTimeCheck As Date


On Error GoTo tran_Err

    Set wksp = DBEngine.Workspaces(0) 'The current database
    wksp.BeginTrans 'Start the transaction buffer

Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)



dteDate = SrtDte

curentdateisholiday = IsInHoliday(dteDate, Holidayslist)


If curentdateisholiday Then
msg = MsgBox("Le jour sélectionné est un jour de congé légal.", vbCritical + vbOKOnly, "Enregistrement non autorisé")
   Exit Sub
End If

        intDay = DatePart("w", dteDate)
        
        
        Select Case intDay
                
                 Case vbMonday
                        AbsenTimeCheck = loadTimeSheetIntoArray(0)
                
                 Case vbTuesday
                        AbsenTimeCheck = loadTimeSheetIntoArray(1)
                
                 Case vbWednesday
                        AbsenTimeCheck = loadTimeSheetIntoArray(2)
                
                Case vbThursday
                        AbsenTimeCheck = loadTimeSheetIntoArray(3)
                
                Case vbFriday
                        AbsenTimeCheck = loadTimeSheetIntoArray(4)
                
                 Case vbSaturday
                        AbsenTimeCheck = loadTimeSheetIntoArray(5)
                
                 Case vbSunday
                        AbsenTimeCheck = loadTimeSheetIntoArray(6)
        End Select
        
             
                If IsNull(AbsenTimeCheck) Or AbsenTimeCheck = 0 Or AbsenTimeCheck < AbsenTime Then
                
                strmessage = "Le nombre d'heure introduit est supérieur à la prestation journalière de l'employé sélectionné ou il est égale à 0!"
                
                msg = MsgBox(strmessage, vbExclamation, "Enregistrement non autorisé")
                
                Exit Sub
                End If
                
                If IsNull(strAbsenceRea) Or strAbsenceRea = "" Then
                AbsenceRea = "N/A"
                Else
                AbsenceRea = strAbsenceRea
                End If
        
                With rs
                .AddNew
                    !AbsenceDate = dteDate
                    !EmployeeID = empID
                    !AbsenceID = AbsID
                    !yearVacation = yearholiday
                    !AbsenceTime = AbsenTime
                    !AbsenceReason = AbsenceRea
                    !HolidaySelectionID = HldySlctnID
                    !DateCreated = Now()
                 .Update
                End With
                wksp.CommitTrans
                MsgBox ("L'enregistrement a été effectué avec succès")
                Set wksp = Nothing
                rs.Close
                Set rs = Nothing



Call btnReset_Click

Exit Sub

tran_Err:
    
    wksp.Rollback
    Set wksp = Nothing
    rs.Close

    Set rs = Nothing

    MsgBox "L'enregistrement a échoué! Erreur: " & Err.Description

End Sub

Private Sub cmbAbsenceID_AfterUpdate()


Me.Form.Requery
Me.Form.Refresh
If IsNull(Me.cmbAbsenceID) Or Me.cmbAbsenceID = isNothing Then
Call btnReset_Click
Else

Me.cmbAbsenceID.Enabled = False

Me.txtSartDate.Enabled = True

Me.txtreason.Enabled = True


Select Case strTimeType

Case "Jours"

'Me.Notes.Caption = "Introduire le nombre de jours pour cette catégorie; la date de fin n'est pas requise."
Me.txtNbreJours.Enabled = True
Me.txtEndDate.Enabled = False
txtNbreHeures.Enabled = False
Case "H/M"

Me.txtEndDate.Enabled = True
txtNbreHeures.Enabled = True
Me.txtNbreJours.Enabled = False

'Me.Notes.Caption = "Le nombre d'heures est requis uniquement si la date de début est égale à la date de fin."

End Select
End If
End Sub
Function strTimeType() As String
strWhere = "[AbsenceID] =" & Me.cmbAbsenceID & ""
    
    ' Count the number of holidays.
    strTimeType = DLookup(Expr:="[TimeType]", _
        Domain:="tbl_Abs_AbsenceCodes", _
        criteria:=strWhere)
        
        
End Function

Private Sub cmbEmployeeID_AfterUpdate()
Me.Form.Requery
Me.Form.Refresh
End Sub
Private Sub Form_Load()
Call btnReset_Click

If IsNull(Me.OpenArgs) Then

Else
Me.cmbEmployeeID = Me.OpenArgs
Me.Refresh
End If
End Sub
Private Sub txtNbreJours_BeforeUpdate(Cancel As Integer)
If txtNbreJours - CInt(txtNbreJours) <> 0 Then
Cancel = True
msg = MsgBox("Introduire un nombre entier sans décimale!")
End If
End Sub
Private Sub txtSartDate_AfterUpdate()
autoupdatefields
End Sub
Private Sub txtSartDate_Change()
'Me.txtEndDate.Value = txtSartDate.Value
End Sub
Private Sub autoupdatefields()

Dim rsTimeSheet As Recordset



Me.txtEndDate.Value = txtSartDate.Value

If IsNull(txtSartDate) Or txtSartDate.Value = "" Then
txtNbreHeures.Value = ""
Exit Sub
End If


Set rsTimeSheet = getrsTimeSheet(Me.cmbEmployeeID.Value)

rsTimeSheet.MoveFirst
Select Case strTimeType
Case "H/M"

sweekNumber = Weekday(txtSartDate, vbMonday)



Select Case sweekNumber

Case 1

txtNbreHeures.Value = rsTimeSheet.Fields("Monday")

Case 2
txtNbreHeures.Value = rsTimeSheet.Fields("Tuesday")

Case 3
txtNbreHeures.Value = rsTimeSheet.Fields("Wednesday")

Case 4

txtNbreHeures.Value = rsTimeSheet.Fields("Thursday")

Case 5

txtNbreHeures.Value = rsTimeSheet.Fields("Friday")



End Select










 
    'change 2016, 11, 4 for your year, month, day values

End Select




End Sub
Function getrsTimeSheet(EmployeeID) As Recordset

Dim db As DAO.Database, rs As DAO.Recordset
 
 

 Set db = CurrentDb
 
 SQL = "SELECT * FROM tbl_TimeSheet WHERE EmployeeID=" & EmployeeID & " and Active =" & -1
 
 Set rs = db.OpenRecordset(SQL)
 If rs.EOF Then
 Set getrsTimeSheet = Nothing
 Else
     Set getrsTimeSheet = rs
 End If



End Function

