' Module: mdl_YearCalendarGeneration
' Type: Standard Module

Option Compare Database

Private Sub YearCalendarGeneration(AbsenceDate As Date, EmployeeID As Long, AbsenceID As Long, _
AbsenceTime As Date, AbsenceDays As Integer, AbsenceReason As String)

Dim wksp    As DAO.Workspace
Dim rs      As DAO.Recordset

    Set wksp = DBEngine.Workspaces(0) 'The current database

    wksp.BeginTrans 'Start the transaction buffer

    Set rs = CurrentDb.OpenRecordset("Table1", dbOpenDynaset)

    Do 'Begin your loop here

    With rs
        .AddNew
            !Field = "Sample Data"
        .Update
    End With

    Loop 'End it here

    wksp.CommitTrans 'Commit the transaction to dataset

End Sub