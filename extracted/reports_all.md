# WorkDays - Reports


---
## Report: `rptVacationRightTaken2WithParam`

**RecordSource:** `qryVacationRightTaken2WithParam`

### Controls (35)

| Name | Type | ControlSource |
|------|------|---------------|
| Auto_Date | TextBox | =Date() |
| Auto_Time | TextBox | =Time() |
| yearVacation | TextBox | yearVacation |
| EmployeeID | TextBox | EmployeeID |
| TimeType | ComboBox | TimeType |
| TotalDaysRightnz | TextBox | TotalDaysRightnz |
| TotalDaysTakennz | TextBox | TotalDaysTakennz |
| DiffInDaysnz | TextBox | DiffInDaysnz |
| TotalRightInTimeFormatnz | TextBox | TotalRightInTimeFormatnz |
| TotalTakenInTimeFormatnz | TextBox | TotalTakenInTimeFormatnz |
| DiffIntimeFormatnz | TextBox | DiffIntimeFormatnz |
| AbsenceCodeDesc | TextBox | AbsenceCodeDesc |
| Text66 | TextBox | ="Page " & [Page] & " of " & [Pages] |
| AccessTotalsyearVacation | TextBox | =Count(*) |
| EmptyCell46 | Type_127 |  |
| EmptyCell49 | Type_127 |  |
| EmptyCell52 | Type_127 |  |
| EmptyCell115 | Type_127 |  |
| EmptyCell123 | Type_127 |  |
| EmptyCell131 | Type_127 |  |
| EmptyCell139 | Type_127 |  |
| EmptyCell147 | Type_127 |  |
| EmptyCell165 | Type_127 |  |

---
## Report: `rpt_AbsenteeismPolicy`

**RecordSource:** `qry_rpt_AbsenteeismPolicy`

### Controls (19)

| Name | Type | ControlSource |
|------|------|---------------|
| txtYear | TextBox | =Date() & " - " & DateAdd("m",-6,Date()) |
| txtEmployeeName | TextBox | EmployeeName |
| txtAbsenceCodeDesc | TextBox | AbsenceCodeDesc |
| txtAbsenceCode | TextBox | AbsenceCode |
| Text21 | TextBox | ="(" & [txtAbsenceCode] & ")  " & [txtAbsenceCodeDesc] |
| txtAbsenceDate | TextBox | AbsenceDate |
| AttendanceReason | TextBox | AbsenceReason |
| Text15 | TextBox | AbsenceTime |
| Text9 | TextBox | Expires |

---
## Report: `rpt_YearAbsenceByQuarter`

**RecordSource:** `qry_rpt_YearAbsenceByMonth`

### Controls (21)

| Name | Type | ControlSource |
|------|------|---------------|
| txtEmployeeName | TextBox | EmployeeName |
| txtYear | TextBox | Year |
| txtGroupOnQuarter | TextBox | GroupOnMonth |
| Text21 | TextBox | MonthName |
| txtAbsenceCodeDesc | TextBox | AbsenceCodeDesc |
| txtAbsenceCode | TextBox | AbsenceCode |
| Text3 | TextBox | ="(" & [txtAbsenceCode] & ")  " & [txtAbsenceCodeDesc] |
| txtAbsenceDate | TextBox | AbsenceDate |
| AttendanceReason | TextBox | AbsenceReason |
| Text15 | TextBox | AbsenceTime |
| AccessTotalsEmployeeID | TextBox | =Sum([EmployeeID]) |
| Text6 | TextBox | ="Page " & [Page] & " of " & [Pages] |

---
## Report: `rpt_AbsencesForYear`

**RecordSource:** `qry_rpt_AbsencesForYear`

### Controls (16)

| Name | Type | ControlSource |
|------|------|---------------|
| txtEmployeeName | TextBox | EmployeeName |
| Text10 | TextBox | ="ALL ABSENCES FOR " & [txtYear] |
| txtYear | TextBox | Year |
| txtAbsenceCodeDesc | TextBox | AbsenceCodeDesc |
| txtAbsenceCode | TextBox | AbsenceCode |
| Text21 | TextBox | ="(" & [txtAbsenceCode] & ")  " & [txtAbsenceCodeDesc] |
| txtAbsenceDate | TextBox | AbsenceDate |
| AttendanceReason | TextBox | AbsenceReason |
| Text15 | TextBox | AbsenceTime |

---
## Report: `Phone Book`

**RecordSource:** `Contacts Extended`

### Controls (13)

| Name | Type | ControlSource |
|------|------|---------------|
| Text24 | TextBox | ="Page " & [Page] & " of " & [Pages] |
| Text25 | TextBox | =Date() |
| Text16 | TextBox | SecteurName |
| Contact Name | TextBox | Contact Name |
| Home Phone | TextBox | Home Phone |
| Business Phone | TextBox | Business Phone |
| Mobile Phone | TextBox | Mobile Phone |

---
## Report: `Directory`

**RecordSource:** `SELECT [Contacts Extended].* FROM [Contacts Extended]; `

### Controls (19)

| Name | Type | ControlSource |
|------|------|---------------|
| Text24 | TextBox | ="Page " & [Page] & " of " & [Pages] |
| Text25 | TextBox | =Date() |
| Contact Name | TextBox | Contact Name |
| Company | TextBox | Company |
| Job Title | TextBox | Job Title |
| E-mail Address | TextBox | E-mail Address |
| Business Phone | TextBox | Business Phone |
| Home Phone | TextBox | Home Phone |
| Mobile Phone | TextBox | Mobile Phone |
| Address | TextBox | Address |
| Command36 | CommandButton |  |
| Command35 | CommandButton |  |
| Text33 | TextBox | =IIf(IsNull([City]),"",[City] & ", ") & IIf(IsNull([State/Province]),"",[State/Province]) & IIf(IsNull([ZIP/Postal Code]),""," " & [Zip/Postal Code]) & IIf(IsNull([Country/Region]),""," " & [Country/Region]) |
| CocanAddress | TextBox | =Nz([Address] & ", ","") & Nz([City] & ", ","") & Nz([State/Province] & ", ","") & Nz([ZIP/Postal Code],"") & Nz(", " & [Country/Region],"") |
| Line26 | Type_102 |  |

---
## Report: `rpt_YearAbsenceByMonth`

**RecordSource:** `qry_rpt_YearAbsenceByMonth`

### Controls (21)

| Name | Type | ControlSource |
|------|------|---------------|
| txtEmployeeName | TextBox | EmployeeName |
| txtYear | TextBox | Year |
| txtGroupOnQuarter | TextBox | GroupOnMonth |
| Text21 | TextBox | MonthName |
| txtAbsenceCodeDesc | TextBox | AbsenceCodeDesc |
| txtAbsenceCode | TextBox | AbsenceCode |
| Text3 | TextBox | ="(" & [txtAbsenceCode] & ")  " & [txtAbsenceCodeDesc] |
| txtAbsenceDate | TextBox | AbsenceDate |
| AttendanceReason | TextBox | AbsenceReason |
| Text15 | TextBox | AbsenceTime |
| AccessTotalsEmployeeID | TextBox | =Sum([EmployeeID]) |
| Text6 | TextBox | ="Page " & [Page] & " of " & [Pages] |

---
## Report: `rpt_Contrat`

**RecordSource:** ``

### Controls (2)

| Name | Type | ControlSource |
|------|------|---------------|
| OLEUnbound0 | TabControl |  |

---
## Report: `qryVacationTakenParam`

**RecordSource:** `qryVacationTakenParam`

### Controls (28)

| Name | Type | ControlSource |
|------|------|---------------|
| Auto_Date | TextBox | =Date() |
| Auto_Time | TextBox | =Time() |
| Text760 | TextBox | ="ABSENCES PAR MOIS POUR L'ANNEE: " & [YearVacation] |
| EmployeeID | ComboBox | EmployeeID |
| EmpName | TextBox | EmpName |
| mailAddress | TextBox | E-mail Address |
| YearVacation | TextBox | YearVacation |
| AbsenceMonthName | TextBox | AbsenceMonthName |
| AbsenceCodeDesc | TextBox | AbsenceCodeDesc |
| TimeType | ComboBox | TimeType |
| Text532 | TextBox | =[AbsenceCodeDesc] & " (" & [TimeType] & ")" |
| TotalTakenInTimeFormat | TextBox | TotalTakenInTimeFormat |
| TotalMinutesTaken | TextBox | TotalMinutesTaken |
| Totaldays | TextBox | Totaldays |
| TotalHours | TextBox | TotalHours |
| Text551 | TextBox | =Round([TotalHours],2) |
| Text519 | TextBox | =Round(Sum([TotalHours]),2) |
| Text522 | TextBox | =Sum([Totaldays]) |
| Text523 | TextBox | =Sum([TotalMinutesTaken]) |
| Text801 | TextBox | ="Total " & [AbsenceMonthName] |
| Text66 | TextBox | ="Page " & [Page] & " of " & [Pages] |
| AccessTotalsYearVacation | TextBox | =Count(*) |