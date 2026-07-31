' Module: Module2
' Type: Standard Module

Option Compare Database

Function fCalculateAge(varDOB As Variant, Optional varAsOfThisDate As Variant) As Variant
'Purpose:   Return the Age in years.
'Arguments: varDOB = Date Of Birth
'varAsOfThisDate = the date to calculate the age at, or today if missing.
 
'The DateDiff() Function simply subtracts the Year parts of the Dates, without
'reference to the Month or Day. This means we need to subtract one if the person
'has not has their birthday this year. This can be handled by a Boolean Expression
'that returns either -1 or 0 depending on whether or not an individual's
'birthday occurred within the Year.
 
'Return:    Whole number of years.
Dim dteDOB As Date
Dim dteAsOf As Date
Dim dteBDay As Date     'Birthday in the year of calculation.
 
fCalculateAge = Null    'Initialize to Null
 
'Validate Parameters
If IsDate(varDOB) Then
  dteDOB = varDOB
 
  If Not IsDate(varAsOfThisDate) Then  'Date to calculate age from.
    dteAsOf = Date      'Use the Current Date
  Else
    dteAsOf = varAsOfThisDate       'Valid As Of Date
  End If
 
  If dteAsOf >= dteDOB Then      'Calculate only if it's after person was born.
    dteBDay = DateSerial(Year(dteAsOf), Month(dteDOB), Day(dteDOB))
      fCalculateAge = DateDiff("yyyy", dteDOB, dteAsOf) + (dteBDay > dteAsOf)
  End If
End If
End Function