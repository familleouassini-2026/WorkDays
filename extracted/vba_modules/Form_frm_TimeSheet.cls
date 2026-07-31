' Module: Form_frm_TimeSheet
' Type: Document Module

Option Compare Database


Private Sub Form_AfterDelConfirm(Status As Integer)
Me.Parent.Requery
End Sub

Private Sub Form_AfterUpdate()

currentEmployee = Me.EmployeeID
Me.Refresh
Me.Parent.Requery

DoCmd.SearchForRecord , , acFirst, "[EmployeeID]=" & currentEmployee




End Sub
Private Sub Form_BeforeUpdate(Cancel As Integer)

Dim activeflag As Boolean
Dim CAT  As Integer
CAT = CountActiveTimesheet(Me.EmployeeID)


activeflagNewValue = Me.Check92.Value
activeflagOldValue = Me.Check92.OldValue



            If (CAT = 0 And (activeflagNewValue = False Or IsNull(activeflagNewValue))) Then
            msg = MsgBox("Un employé doit avoir un seul horaire actif, Il faut activer l'horaire encours avant l'enregistrement", vbCritical + vbOKOnly, "Aucun horaire n'est actif")
            Cancel = True
            Exit Sub
            End If




            If (CAT = 1 And activeflagNewValue = False And activeflagOldValue = True) Then
            msg = MsgBox("Un employé doit avoir un horaire actif, Il faut soit activer l'horaire encours avant l'enregistrement ou activer à autre horaire", vbExclamation + vbOKOnly, "Un horaire doit être actif")
            Cancel = False
            Exit Sub
            End If
            
            
            

            If (CAT = 1 And activeflagNewValue = True And (activeflagOldValue = False Or IsNull(activeflagOldValue))) Then
            msg = MsgBox("Un employé doit avoir un seul horaire actif, Il faut désactiver l'horaire encours avant l'enregistrement", vbCritical + vbOKOnly, "Un horaire est déjà actif")
            Cancel = True
            Exit Sub
            End If


End Sub

Function CountActiveTimesheet(Emplyee As Integer)
    Dim dbs As DAO.Database
    Dim rstRecords As DAO.Recordset
    Set dbs = CurrentDb
    Dim SQL As String
    Dim ActiveCount As Integer
    Dim ChangeInactiveFlag As Boolean
    
    SQL = "Select Active from tbl_TimeSheet where EmployeeID = " & Emplyee & " and Active = " & -1
    
    
    
    'Open a table-type Recordset
    Set rstRecords = dbs.OpenRecordset(SQL, dbOpenDynaset)
    
    
    If rstRecords.EOF Then
      CountActiveTimesheet = 0
   Else
      rstRecords.MoveLast
      CountActiveTimesheet = rstRecords.RecordCount
   End If

    
    rstRecords.Close
    dbs.Close
    Set dbs = Nothing
    Set rsTable = Nothing
    
    
    
End Function

