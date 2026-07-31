' Module: FromTableToArray
' Type: Standard Module

Option Compare Database

Function loadHolidaysIntoArray() As Variant

Dim rstTableName As DAO.Recordset   'Your table
Dim myArray() As String             'Your dynamic array
Dim intArraySize As Integer         'The size of your array
Dim iCounter As Integer             'Index of the array

'Open your table

strsql = "select * from tbl_Abs_Holidays"

Set rstTableName = CurrentDb.OpenRecordset(strsql)

If Not rstTableName.EOF Then

rstTableName.MoveLast
rstTableName.MoveFirst   'Ensure we begin on the first row

    'The size of the array should be equal to the number of rows in the table
    intArraySize = rstTableName.RecordCount - 1
    iCounter = 0
    ReDim myArray(intArraySize) 'Need to size the array

    Do Until rstTableName.EOF

        myArray(iCounter) = rstTableName.Fields("HolidayDate")
        'Debug.Print "Item: "; iCounter & " " & myArray(iCounter)

        iCounter = iCounter + 1
        rstTableName.MoveNext
    Loop

End If


loadHolidaysIntoArray = myArray
'If IsObject(rstTableName) Then Set rstTableName = Nothing

End Function
'Function IsInHoliday(dateToBeFound As Date, arr As Variant) As Boolean
'  IsInArray = (UBound(VBA.Filter(arr, dateToBeFound)) > -1)
'End Function
 Function IsInHoliday(valToBeFound As Date, arr As Variant) As Boolean

On Error GoTo IsInArrayError: 'array is empty



For i = 0 To UBound(arr) - 1
currenti = arr(i)

    If currenti = valToBeFound Then
            IsInHoliday = True
            Exit Function
        End If
Next i


Exit Function
IsInArrayError:
On Error GoTo 0
IsInHoliday = False
End Function

Function loadTimeSheetIntoArray(empID As Long) As Variant

Dim rstTableName As DAO.Recordset   'Your table
Dim myArray(6) As String             'Your dynamic array
Dim intArraySize As Integer         'The size of your array
Dim iCounter As Integer             'Index of the array

'Open your table

sqlstring = "select top 1 * from tbl_TimeSheet where EmployeeID= " & empID & " and active=true order by StartDate Desc"

Set rstTableName = CurrentDb.OpenRecordset(sqlstring)
    With rstTableName
    
myArray(0) = Nz(.Fields("Monday"), 0)
myArray(1) = Nz(.Fields("Tuesday"), 0)
myArray(2) = Nz(.Fields("Wednesday"), 0)
myArray(3) = Nz(.Fields("Thursday"), 0)
myArray(4) = Nz(.Fields("Friday"), 0)
myArray(5) = Nz(.Fields("Saturday"), 0)
myArray(6) = Nz(.Fields("Sunday"), 0)
   
End With


loadTimeSheetIntoArray = myArray
'If IsObject(rstTableName) Then Set rstTableName = Nothing
rstTableName.Close
Set rstTableName = Nothing


End Function