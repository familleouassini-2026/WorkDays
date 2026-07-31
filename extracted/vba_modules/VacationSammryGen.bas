' Module: VacationSammryGen
' Type: Standard Module

Public Function RecordSelectionGetID(empID As Long, SrtDte As String, EndDte As String, nbreJour As Integer, AbsID As Long, yearholiday As Integer, AbsenceTime As String, strAbsenceReason As String) As Long

Dim lastID As Integer
Dim rs As DAO.Recordset
strsql = "SELECT TOP 1 * FROM tbl_Abs_HolidaySelection"

Set rs = CurrentDb.OpenRecordset(strsql, dbOpenDynaset, dbAppendOnly, dbOptimistic)



 With rs
                .AddNew
                    !StartDate = SrtDte
                    !EndDate = EndDte
                    !NmbreDays = nbreJour
                    !AbsenceID = AbsID
                    !AbsenceYear = yearholiday
                    !EmployeeID = empID
                    
                    
                    If AbsenceTime = "" Then
                    !AbsenceTime = #12:00:00 AM#
                    Else
                    !AbsenceTime = AbsenceTime
                    End If
                    
                    
                    !AbsenceReason = strAbsenceReason
                    !DateCreated = Now()
                 .Update
                End With
                
                
RecordSelectionGetID = DMax("[HolidaySelectionID]", "tbl_Abs_HolidaySelection")

rs.Close
Set rs = Nothing
End Function

Sub deleterecord(strsql)

Dim rs As DAO.Recordset
On Error GoTo Error_Handler


Set rs = CurrentDb.OpenRecordset(strsql)

rs.Delete

Exit_Handler:
    Exit Sub

Error_Handler:
    Select Case Err.Number
        Case 3200   'related records prevent deletion
            MsgBox "Les autres enregistrements liés au même parent ne seront pas supprimés.", vbOKOnly, "Suppressions des enregistrement liés"
            Resume Exit_Handler
        Case Else
            MsgBox Err.Number & " - " & Err.Description
            Resume Exit_Handler
    End Select


End Sub