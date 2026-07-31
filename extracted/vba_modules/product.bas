' Module: product
' Type: Standard Module

Option Compare Database
Public Function DProduct(Expr As String, Domain As String, Optional criteria) As Variant
    Dim SQL As String, Result As Double
    Dim cdb As DAO.Database, rst As DAO.Recordset
    On Error GoTo DProduct_Error
    Set cdb = CurrentDb
    SQL = "SELECT " & Expr & " AS Expr1 FROM [" & Domain & "]"
    If Not IsMissing(criteria) Then
        SQL = SQL & " WHERE " & criteria
    End If
    Set rst = cdb.OpenRecordset(SQL, dbOpenSnapshot)
    If rst.BOF And rst.EOF Then
        DProduct = 1
    Else
        Result = 1
        Do Until rst.EOF
            Result = Result * (1 + rst!Expr1)
            rst.MoveNext
        Loop
        
        
        
        DProduct = Result
    End If
    rst.Close
    Set rst = Nothing
    Set cdb = Nothing
    Exit Function

DProduct_Error:
    DProduct = Null
End Function