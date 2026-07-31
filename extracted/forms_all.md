# WorkDays - Forms Documentation

**Extracted:** 2026-07-30 01:47:46


---
## Form: `rpt_YearView`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT DISTINCT [qry_rpt_AbsencesForYear].EmployeeID, [qry_rpt_AbsencesForYear].EmployeeName, [qry_rpt_AbsencesForYear].Year FROM qry_rpt_AbsencesForYear;  |
| Caption | YearView |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 2 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 10920 |

### Controls (14 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| childCalendarMonth1 | Subform/Subreport |  |  |
| childCalendarMonth2 | Subform/Subreport |  |  |
| childCalendarMonth3 | Subform/Subreport |  |  |
| childCalendarMonth4 | Subform/Subreport |  |  |
| childCalendarMonth5 | Subform/Subreport |  |  |
| childCalendarMonth6 | Subform/Subreport |  |  |
| childCalendarMonth7 | Subform/Subreport |  |  |
| childCalendarMonth8 | Subform/Subreport |  |  |
| childCalendarMonth12 | Subform/Subreport |  |  |
| childCalendarMonth9 | Subform/Subreport |  |  |
| childCalendarMonth10 | Subform/Subreport |  |  |
| childCalendarMonth11 | Subform/Subreport |  |  |
| txtEmployeeName | TextBox | EmployeeName |  |
| txtYear | TextBox | Year |  |

### Form Events

- **OnLoad**: `[Event Procedure]`

### Subforms

  - **Subform `childCalendarMonth1`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth2`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth3`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth4`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth5`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth6`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth7`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth8`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth12`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth9`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth10`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``
  - **Subform `childCalendarMonth11`**: SourceObject=`rpt_YearViewCal`, LinkChild=``, LinkMaster=``

---
## Form: `subFormCalendarInputBox`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_YearCalendar.*, tbl_Abs_AbsenceCodes.TimeType FROM tbl_Abs_AbsenceCodes INNER JOIN tbl_YearCalendar ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_YearCalendar.AbsenceID;  |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 2 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 9943 |

### Controls (15 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| cboAbsenceCodeDesc | ComboBox | AbsenceID |  |
| txtAbsenceTime | TextBox | AbsenceTime |  |
| EmployeeID | TextBox | EmployeeID |  |
| AbsenceDate | TextBox | AbsenceDate |  |
| txtAbsenceReason | TextBox | AbsenceReason | OnChange |
| cmdSpellCheck | CommandButton |  | OnClick |
| cmdDeleteAbsence | CommandButton |  | OnClick |
| txtAttendanceID | TextBox | AttendanceID |  |
| txtAbsenceDays | TextBox | AbsenceDays |  |
| TimeType | TextBox | TimeType |  |
| HolidaySelectionID | TextBox | HolidaySelectionID |  |

### Form Events

- **OnCurrent**: `[Event Procedure]`
- **BeforeUpdate**: `[Event Procedure]`

---
## Form: `rpt_YearViewCal`

### Properties

| Property | Value |
|----------|-------|
| Caption |   |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 3420 |

### Controls (88 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txt25 | TextBox |  |  |
| txt24 | TextBox |  |  |
| txt37 | TextBox |  |  |
| txt36 | TextBox |  |  |
| txt35 | TextBox |  |  |
| txt34 | TextBox |  |  |
| txt33 | TextBox |  |  |
| txt32 | TextBox |  |  |
| txt31 | TextBox |  |  |
| txt30 | TextBox |  |  |
| txt29 | TextBox |  |  |
| txt28 | TextBox |  |  |
| txt27 | TextBox |  |  |
| txt26 | TextBox |  |  |
| txt23 | TextBox |  |  |
| txt22 | TextBox |  |  |
| txt21 | TextBox |  |  |
| txt20 | TextBox |  |  |
| txt19 | TextBox |  |  |
| txt18 | TextBox |  |  |
| txt17 | TextBox |  |  |
| txt16 | TextBox |  |  |
| txt15 | TextBox |  |  |
| txt14 | TextBox |  |  |
| txt13 | TextBox |  |  |
| txt12 | TextBox |  |  |
| txt11 | TextBox |  |  |
| txt10 | TextBox |  |  |
| txt9 | TextBox |  |  |
| txt8 | TextBox |  |  |
| txt7 | TextBox |  |  |
| txt6 | TextBox |  |  |
| txt5 | TextBox |  |  |
| txt4 | TextBox |  |  |
| txt3 | TextBox |  |  |
| txt2 | TextBox |  |  |
| txt1 | TextBox |  |  |
| Text2 | TextBox |  |  |
| Text3 | TextBox |  |  |
| Text4 | TextBox |  |  |
| Text5 | TextBox |  |  |
| Text6 | TextBox |  |  |
| cmdSubFormTransButton | CommandButton |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_CalendarInputBox`

### Properties

| Property | Value |
|----------|-------|
| Caption | Update Absence |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | True |
| Width | 10800 |

### Controls (7 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txtAbsenceDate | TextBox |  |  |
| txtEmployeeName | TextBox |  |  |
| cmdClose | CommandButton |  | OnClick |
| txtEmployeeID | TextBox |  |  |
| txtYear | TextBox |  |  |
| subFormCalendarInputBox | Subform/Subreport |  |  |
| Line14 | Type_102 |  |  |

### Form Events

- **OnLoad**: `[Event Procedure]`

### Subforms

  - **Subform `subFormCalendarInputBox`**: SourceObject=`subFormCalendarInputBox`, LinkChild=`EmployeeID;AbsenceDate;YearVacation`, LinkMaster=`txtEmployeeID;txtAbsenceDate;txtYear`

---
## Form: `frm_Sal_Seniority`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Seniority |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| OrderBy | [tbl_Seniority].Years, [Lookup_Secteur].[Secteur] |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 5598 |

### Controls (9 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| SeniorityID | TextBox | SeniorityID |  |
| Years | TextBox | Years |  |
| BaseSalary | TextBox | BaseSalary |  |
| Secteur | ComboBox | Secteur |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `subFormVacPDSDSummary`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | qry_subFormVacPDSDSummary |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | False |
| ScrollBars | 2 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 21840 |

### Controls (30 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txtVacHoursLeft | TextBox | VacHoursLeft |  |
| Employee ID | TextBox | EmployeeID |  |
| Label56 | TextBox |  |  |
| txtPersonalDaysLeft | TextBox | PersonalDaysLeft |  |
| Text62 | TextBox |  |  |
| Text63 | TextBox |  |  |
| Text64 | TextBox |  |  |
| Text66 | TextBox |  |  |
| Text67 | TextBox |  |  |
| Check68 | CheckBox | BoughtVac |  |
| Text71 | TextBox | YearsOfService |  |
| Text72 | TextBox |  |  |
| Text74 | TextBox | TotalVacHours |  |
| Text75 | TextBox | TotallPersonalDays |  |
| txtSickDaysLeft | TextBox | SickDaysLeft |  |
| Text81 | TextBox |  |  |
| Text82 | TextBox |  |  |
| Text83 | TextBox |  |  |
| Text84 | TextBox |  |  |
| Text85 | TextBox | TotalSickDays |  |

### Form Events

- **OnCurrent**: `[Event Procedure]`

---
## Form: `frm_YearCalendar`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Emp_Employees |
| Caption | Années de service à nos jours - 32 Years 9 Months |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | [EmployeeID]= 45 |
| ScrollBars | 3 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 20949 |

### Controls (28 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| cmdToday | CommandButton |  | OnClick |
| cboEmployee | ComboBox |  | AfterUpdate |
| cboSecteur | ComboBox |  | AfterUpdate |
| cboYear | ComboBox |  | OnChange |
| txtDOH | TextBox | =[cboEmployee].[column](2) |  |
| Image90 | Rectangle |  |  |
| cmdRptYearView | CommandButton |  | OnClick |
| cmdQtrRpt | CommandButton |  | OnClick |
| cmdAbsenteeismRpt | CommandButton |  | OnClick |
| cmdAbsenceForYear | CommandButton |  | OnClick |
| Line20 | Type_102 |  |  |
| subFormJan | Subform/Subreport |  |  |
| SubFormFeb | Subform/Subreport |  |  |
| subformMar | Subform/Subreport |  |  |
| subFormApr | Subform/Subreport |  |  |
| SubFormMay | Subform/Subreport |  |  |
| SubFormJun | Subform/Subreport |  |  |
| subFormDec | Subform/Subreport |  |  |
| subFormJul | Subform/Subreport |  |  |
| subFormAug | Subform/Subreport |  |  |
| subFormSep | Subform/Subreport |  |  |
| SubFormOct | Subform/Subreport |  |  |
| subFormNov | Subform/Subreport |  |  |
| frm_Abs_HolidayRightAndTaken | Subform/Subreport |  |  |

### Form Events

- **OnLoad**: `[Event Procedure]`

### Subforms

  - **Subform `subFormJan`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `SubFormFeb`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subformMar`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subFormApr`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `SubFormMay`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `SubFormJun`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subFormDec`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subFormJul`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subFormAug`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subFormSep`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `SubFormOct`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `subFormNov`**: SourceObject=`subFormMonth`, LinkChild=``, LinkMaster=``
  - **Subform `frm_Abs_HolidayRightAndTaken`**: SourceObject=`frm_Abs_HolidayRightAndTaken`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`

---
## Form: `frm_Emp_Employee_Leasing`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_Emp_Employee_Leasing.* FROM tbl_Emp_Employees INNER JOIN tbl_Emp_Employee_Leasing ON tbl_Emp_Employees.EmployeeID = tbl_Emp_Employee_Leasing.EmployeeID ORDER BY tbl_Emp_Employees.EmpFName, tbl_Emp_Employees.EmpFName;  |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 7572 |

### Controls (8 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| LeasingID | ComboBox | LeasingID |  |
| StartDate | TextBox | StartDate |  |
| EndDate | TextBox | EndDate |  |
| Box15 | Line |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Cmn_Leasing`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Cmn_Leasing |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 15450 |

### Controls (14 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Matricule | TextBox | Matricule |  |
| LeasingStart | TextBox | LeasingStart |  |
| LeasingEnd | TextBox | LeasingEnd |  |
| Modèle | TextBox | Modèle |  |
| Couleur | TextBox | Couleur |  |
| Box26 | Line |  |  |
| LeasingType | ComboBox | LeasingType |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_UpdateEmpInfoBoughtVac`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | qry_UpdateEmpInfoBoughtVac |
| Caption |   |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | [EmployeeID]=3 |
| ScrollBars | 2 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | True |
| Width | 3015 |

### Controls (5 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txtEmployeeID | TextBox | EmployeeID |  |
| txtBoughtYear | TextBox | BoughtYear |  |
| chkBoughtVac | CheckBox | BoughtVac |  |

### Form Events

*No form-level event procedures*

---
## Form: `subFormMonth`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 3472 |

### Controls (88 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txt25 | TextBox |  |  |
| txt24 | TextBox |  |  |
| txt37 | TextBox |  |  |
| txt36 | TextBox |  |  |
| txt35 | TextBox |  |  |
| txt34 | TextBox |  |  |
| txt33 | TextBox |  |  |
| txt32 | TextBox |  |  |
| txt31 | TextBox |  |  |
| txt30 | TextBox |  |  |
| txt29 | TextBox |  |  |
| txt28 | TextBox |  |  |
| txt27 | TextBox |  |  |
| txt26 | TextBox |  |  |
| txt23 | TextBox |  |  |
| txt22 | TextBox |  |  |
| txt21 | TextBox |  |  |
| txt20 | TextBox |  |  |
| txt19 | TextBox |  |  |
| txt18 | TextBox |  |  |
| txt17 | TextBox |  |  |
| txt16 | TextBox |  |  |
| txt15 | TextBox |  |  |
| txt14 | TextBox |  |  |
| txt13 | TextBox |  |  |
| txt12 | TextBox |  |  |
| txt11 | TextBox |  |  |
| txt10 | TextBox |  |  |
| txt9 | TextBox |  |  |
| txt8 | TextBox |  |  |
| txt7 | TextBox |  |  |
| txt6 | TextBox |  |  |
| txt5 | TextBox |  |  |
| txt4 | TextBox |  |  |
| txt3 | TextBox |  |  |
| txt2 | TextBox |  |  |
| txt1 | TextBox |  |  |
| Text2 | TextBox |  |  |
| Text3 | TextBox |  |  |
| Text4 | TextBox |  |  |
| Text5 | TextBox |  |  |
| Text6 | TextBox |  |  |
| cmdSubFormTransButton | CommandButton |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `Welcome`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | Settings |
| Caption | Bienvenue |
| AllowAdditions | False |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 14160 |

### Controls (7 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| cmdConnectCommunity | CommandButton |  |  |
| Box69 | Line |  |  |
| iconCommunity | Rectangle |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Sec_SecteurDetails`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Sec_Secteurs |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | [SecteurID]=11 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 10155 |

### Controls (22 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Auto_Title0 | TextBox | Secteur |  |
| TabCtl0 | Type_123 |  |  |
| Page116 | WebBrowser |  |  |
| Secteur | TextBox | Secteur |  |
| Chef de secteur | ComboBox | Chef de secteur |  |
| NoRTT | CheckBox | NoRTT |  |
| Mission | TextBox | Mission |  |
| Page1 | WebBrowser |  |  |
| frm_Seniority | Subform/Subreport |  |  |
| Page2 | WebBrowser |  |  |
| SecteurID | TextBox | SecteurID |  |
| frm_Sec_Indexation | Subform/Subreport |  |  |
| Text824 | TextBox | =FormatPercent(DProduct("IndexationNumber","tbl_Sec_Indexation","SecteurID =" & [SecteurID]),2) |  |
| Page301 | WebBrowser |  |  |
| frm_Seniority_Calculated | Subform/Subreport |  |  |
| Page662 | WebBrowser |  |  |
| frm_RTT | Subform/Subreport |  |  |

### Form Events

*No form-level event procedures*

### Subforms

  - **Subform `frm_Seniority`**: SourceObject=`frm_Sal_Seniority`, LinkChild=`Secteur`, LinkMaster=`SecteurID`
  - **Subform `frm_Sec_Indexation`**: SourceObject=`frm_Sec_Indexation`, LinkChild=`SecteurID`, LinkMaster=`SecteurID`
  - **Subform `frm_Seniority_Calculated`**: SourceObject=`frm_Sal_Seniority_Calculated`, LinkChild=`Secteur`, LinkMaster=`SecteurID`
  - **Subform `frm_RTT`**: SourceObject=`frm_RTT`, LinkChild=`SecteurID`, LinkMaster=`SecteurID`

---
## Form: `Form1`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 5612 |

### Controls (2 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Text0 | TextBox |  |  |

### Form Events

- **OnLoad**: `[Event Procedure]`

---
## Form: `frm_Sec_Secteurs`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_Sec_Secteurs.* FROM tbl_Sec_Secteurs ORDER BY tbl_Sec_Secteurs.Secteur;  |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | ([frm_Sec_Secteurs].[NON IFIC]<>0) |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 16566 |

### Controls (17 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmptyCell177 | Type_127 |  |  |
| SecteurID | TextBox | SecteurID |  |
| Secteur | TextBox | Secteur |  |
| Text60 | TextBox | =IIf(IsNull([SecteurID]),"(New)","Open") | OnClick |
| NoRTT | CheckBox | NoRTT |  |
| RTTGroupID | ComboBox | RTTGroupID |  |
| IFIC | CheckBox | NON IFIC |  |
| EmptyCell180 | Type_127 |  |  |
| IFIC Categorie | TextBox | IFIC Categorie |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Log_Requests`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_Log_Requests.* FROM tbl_Log_Requests;  |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 18618 |

### Controls (22 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Image46 | Rectangle |  |  |
| RequestId | TextBox | RequestId |  |
| RequestDescription | TextBox | RequestDescription |  |
| Requestor | ComboBox | RequestorID |  |
| RequestDate | TextBox | RequestDate |  |
| Deadline | TextBox | Deadline |  |
| Attachment | NavigationControl | Attachment |  |
| Status | ComboBox | Status |  |
| Decision | ComboBox | Decision |  |
| Comment | TextBox | Comment |  |
| Box60 | Line |  |  |
| Box62 | Line |  |  |
| Box63 | Line |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_RTT`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | qry_RTT |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 5346 |

### Controls (9 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| RTTID | TextBox | RTTID |  |
| RTTStart | TextBox | RTTStart |  |
| HouresPerYear | TextBox | HouresPerYear |  |
| SecteurID | ComboBox | SecteurID |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_cmn_Locations`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_cmn_Locations |
| DefaultView | Datasheet |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 11592 |

### Controls (16 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| LocationID | TextBox | LocationID |  |
| LocationName | TextBox | LocationName |  |
| Address | TextBox | Address |  |
| PostCode | TextBox | PostCode |  |
| Commune | TextBox | Commune |  |
| Country | TextBox | Country |  |
| ResponsableID | ComboBox | ResponsableID |  |
| OrganisationID | ComboBox | OrganisationID |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_TimeSheet`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT qry_Timesheet.*, * FROM qry_Timesheet;  |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 22026 |

### Controls (36 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmployeeID | ComboBox | EmployeeID |  |
| Monday | TextBox | Monday |  |
| Tuesday | TextBox | Tuesday |  |
| Wednesday | TextBox | Wednesday |  |
| Thursday | TextBox | Thursday |  |
| Friday | TextBox | Friday |  |
| Saturday | TextBox | Saturday |  |
| Sunday | TextBox | Sunday |  |
| Check92 | CheckBox | Active |  |
| Box113 | Line |  |  |
| StartDate | TextBox | StartDate |  |
| EndDate | TextBox | EndDate |  |
| Comment | TextBox | Comment |  |
| FullTimeH | TextBox | FullTimeH |  |
| FullTimeM | TextBox | FullTimeM |  |
| DifflHours | TextBox | DifflHours |  |
| TotalHours | TextBox | TotalHours |  |
| TimesheetCategory | ComboBox | TimesheetCategory |  |
| Box295 | Line |  |  |

### Form Events

- **BeforeUpdate**: `[Event Procedure]`
- **AfterUpdate**: `[Event Procedure]`

---
## Form: `frm_Sal_Seniority_Calculated`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | qry_Sec_indexCal |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | False |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 9078 |

### Controls (17 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| SeniorityID | TextBox | SeniorityID |  |
| Years | TextBox | Years |  |
| BaseSalary | TextBox | BaseSalary |  |
| Secteur | ComboBox | Secteur |  |
| Index | TextBox | Index |  |
| SIncrease | TextBox | SIncrease |  |
| SectorIncrease | TextBox | SectorIncrease |  |
| CurrentSectorSalary | TextBox | CurrentSectorSalary |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Sec_SectorialSalaryChanging`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT * FROM [Contacts Extended] WHERE IsInactive=False AND SectorialChanging<>0;  |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | False |
| ScrollBars | 3 |
| RecordSelectors | False |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 13149 |

### Controls (42 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmployeeID | TextBox | EmployeeID |  |
| Contact Name | TextBox | Contact Name | OnDblClick |
| EmpDateOfHire | TextBox | EmpDateOfHire |  |
| AcquiredSeniority | TextBox | AcquiredSeniorityCurrent |  |
| GrantedSeniority | TextBox | GrantedSeniority |  |
| TotalSeniorityAllowed | TextBox | TotalSeniorityAllowedLastYear |  |
| TotalSeniorityAllowedNextYear | TextBox | TotalSeniorityAllowedThisYear |  |
| SectorialSalary | TextBox | SectorialSalaryCurrent |  |
| CurrentEmployeeSalary | TextBox | EmployeeSalaryLastYear |  |
| NextEmployeeSalary | TextBox | EmployeeSalaryThisYear |  |
| TotalEmployeeIncrease | TextBox | TotalEmployeeIncrease |  |
| SecteurName | TextBox | SecteurName |  |
| EmptyCell162 | Type_127 |  |  |
| MaxSeniorityFromBareme | TextBox | MaxSeniorityFromBareme |  |
| Remarque | TextBox | Remarque2 |  |
| txtDateOfSeniorityChange | TextBox | ="Situation le: " & [DateOfSeniorityChange] |  |
| EmptyCell266 | Type_127 |  |  |
| EmptyCell267 | Type_127 |  |  |
| EmptyCell268 | Type_127 |  |  |
| EmptyCell269 | Type_127 |  |  |
| EmptyCell275 | Type_127 |  |  |
| EmptyCell276 | Type_127 |  |  |
| EmptyCell277 | Type_127 |  |  |
| EmptyCell278 | Type_127 |  |  |
| EmptyCell281 | Type_127 |  |  |
| EmptyCell282 | Type_127 |  |  |
| EmptyCell283 | Type_127 |  |  |
| EmptyCell284 | Type_127 |  |  |
| EmptyCell286 | Type_127 |  |  |
| EmptyCell287 | Type_127 |  |  |
| EmptyCell288 | Type_127 |  |  |
| Text289 | TextBox | ="Situation le : " & [DateOfSeniorityChangeLastYear] |  |
| Command117 | CommandButton |  | OnClick |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Log_Decision`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Log_Decision |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 13674 |

### Controls (13 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmptyCell21 | Type_127 |  |  |
| DecisionID | TextBox | DecisionID |  |
| DecisionDescription | TextBox | DecisionDescription |  |
| DecisionDate | TextBox | DecisionDate |  |
| DecisionTaker | ComboBox | DecisionTaker |  |
| MeetingID | ComboBox | MeetingID |  |
| Box25 | Line |  |  |
| Box31 | Line |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_RTT_Groups`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_RTT_Groups |
| DefaultView | Datasheet |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 11676 |

### Controls (4 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| RTTGroupID | TextBox | RTTGroupID |  |
| RTTGroupName | TextBox | RTTGroupName |  |

### Form Events

*No form-level event procedures*

---
## Form: `tblYearCalendar`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_YearCalendar |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 21466 |

### Controls (22 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Auto_Logo0 | Rectangle |  |  |
| AttendanceID | TextBox | AttendanceID |  |
| YearVacation | TextBox | YearVacation |  |
| AbsenceDate | TextBox | AbsenceDate |  |
| EmployeeID | ComboBox | EmployeeID |  |
| AbsenceID | ComboBox | AbsenceID |  |
| AbsenceTime | TextBox | AbsenceTime |  |
| AbsenceDays | TextBox | AbsenceDays |  |
| AbsenceReason | TextBox | AbsenceReason |  |
| CreationDate | TextBox | DateCreated |  |
| HolidaySelectionID | TextBox | HolidaySelectionID |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Abs_AbsenceCodes`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Abs_AbsenceCodes |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 26118 |

### Controls (15 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| AbsenceCodeDesc | TextBox | AbsenceCodeDesc |  |
| AbsenceCode | TextBox | AbsenceCode |  |
| AbsenceTextColorCode | TextBox | AbsenceTextColorCode |  |
| AbsenceColorTag | TextBox | AbsenceColorTag |  |
| TimeType | ComboBox | TimeType |  |
| RichTextFormat | TextBox | RichTextFormat |  |
| TimeThematic | CheckBox | TimeThematic |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Abs_HolidaySelectionBatchs`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Abs_HolidaySelection |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | ([Lookup_AbsenceID].[AbsenceCode]="CA") |
| OrderBy | [tbl_Abs_HolidaySelection].[StartDate] DESC |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 11046 |

### Controls (21 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| HolidaySelectionID | TextBox | HolidaySelectionID |  |
| StartDate | TextBox | StartDate |  |
| EndDate | TextBox | EndDate |  |
| NmbreDays | TextBox | NmbreDays |  |
| AbsenceYear | TextBox | AbsenceYear |  |
| EmployeeID | TextBox | EmployeeID |  |
| AbsenceTime | TextBox | AbsenceTime |  |
| AbsenceReason | TextBox | AbsenceReason |  |
| AbsenceID | ComboBox | AbsenceID |  |
| DateCreated | TextBox | DateCreated |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `frm_Emp_Employee List`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | Contacts Extended |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | True |
| Filter | ([Contacts Extended].[TotalSeniorityAllowedThisYear]=15) |
| OrderBy | [Contacts Extended].[EmpFName], [Contacts Extended].[EmpLName], [Lookup_Group].[Secteur], [Contacts Extended].[Contact Name] |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 25374 |

### Controls (34 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Box336 | Line |  |  |
| cmdAddFromOutlook | CommandButton |  | OnClick |
| iconWelcome | Rectangle |  |  |
| cmdWelcome | CommandButton |  | OnClick |
| iconNewContact | Rectangle |  |  |
| cmdNewContact | CommandButton |  | OnClick |
| iconAddFromOutlook | Rectangle |  |  |
| Image462 | Rectangle |  |  |
| cboGoToContact | ComboBox |  | AfterUpdate, OnGotFocus |
| Last Name | TextBox | EmpLName | OnDblClick |
| First Name | TextBox | EmpFName | OnDblClick |
| Mobile Phone | TextBox | Mobile Phone |  |
| Notes | TextBox | Notes |  |
| EmployeeID | TextBox | EmployeeID |  |
| Group | ComboBox | SecteurID |  |
| txtOpen | TextBox | =IIf(IsNull([EmployeeID]),"(New)","Open") | OnClick |
| Attachments | NavigationControl | Attachments |  |
| NextBirthday | TextBox | NextBirthday |  |
| Box532 | Line |  |  |
| Remarque | TextBox | Remarque |  |
| IsInactive | CheckBox | IsInactive |  |
| TotalSeniorityAllowedThisYear | TextBox | TotalSeniorityAllowedThisYear |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Sec_Indexation`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Sec_Indexation |
| Caption | tbl_Emp_Indexation subform |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 5484 |

### Controls (9 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmployeeID | ComboBox | SecteurID |  |
| IndexationID | TextBox | IndexationID |  |
| IndexationNumber | TextBox | IndexationNumber |  |
| IndexationDate | TextBox | IndexationDate |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `frm_Abs_Holidays`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Abs_Holidays |
| DefaultView | Datasheet |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 11712 |

### Controls (6 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| HolidayID | TextBox | HolidayID |  |
| HolidayDate | TextBox | HolidayDate |  |
| HolidayName | TextBox | HolidayName |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Abs_HolidaySelectionDetails`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_YearCalendar |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 7938 |

### Controls (17 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| AttendanceID | TextBox | AttendanceID |  |
| AbsenceDate | TextBox | AbsenceDate |  |
| EmployeeID | ComboBox | EmployeeID |  |
| AbsenceID | ComboBox | AbsenceID |  |
| AbsenceTime | TextBox | AbsenceTime |  |
| AbsenceDays | TextBox | AbsenceDays |  |
| HolidaySelectionID | TextBox | HolidaySelectionID |  |
| YearVacation | TextBox | YearVacation |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `frm_Emp_Employee Details`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | Contacts Extended |
| Caption | Détail Employé |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | [EmployeeID]=32 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 13224 |

### Controls (125 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Box239 | Line |  |  |
| cmdSaveAsOutlookContact | CommandButton |  | OnClick |
| cmdEmail | CommandButton |  | OnClick |
| cboGoToContact | ComboBox |  | AfterUpdate, OnGotFocus |
| Auto_Title0 | TextBox | =Nz([Contact Name],"Untitled") |  |
| cmdClose | CommandButton |  | OnClick |
| iconSaveAndNew | Rectangle |  |  |
| cmdSaveandNew | CommandButton |  | OnClick |
| iconEmail | Rectangle |  |  |
| Image268 | Rectangle |  |  |
| Text1103 | TextBox | Remarque2 |  |
| ContractGen | CommandButton |  | OnClick |
| Command1144 | CommandButton |  | OnClick |
| Command1145 | CommandButton |  | OnClick |
| tabContacts | Type_123 |  |  |
| General_Page | WebBrowser |  |  |
| Attachments | NavigationControl | Attachments |  |
| Title | ComboBox | Title |  |
| First Name | TextBox | EmpFName |  |
| Last Name | TextBox | EmpLName |  |
| Job Title | ComboBox | Job Title | AfterUpdate |
| ContractType | ComboBox | ContractType |  |
| E-mail Address | TextBox | E-mail Address | OnDblClick |
| Text698 | TextBox | EmpDateOfBirth |  |
| Group | ComboBox | SecteurID |  |
| EmptyCell330 | Type_127 |  |  |
| cmdMap | CommandButton |  |  |
| Address | TextBox | Address |  |
| City | TextBox | City |  |
| State/Province | TextBox | State/Province |  |
| ZIP/Postal Code | TextBox | Postal Code |  |
| Country/Region | TextBox | Country/Region |  |
| DistanceToHome | TextBox | DistanceToHome |  |
| Business Phone | TextBox | Business Phone |  |
| Home Phone | TextBox | Home Phone |  |
| Mobile Phone | TextBox | Mobile Phone |  |
| Text692 | TextBox | EmpDateOfHire |  |
| EmpEndDate | TextBox | EmpEndDate |  |
| LocationID | ComboBox | LocationID |  |
| cmdAddRemove | CommandButton |  | OnClick |
| Notes | TextBox | Notes |  |
| Page341 | WebBrowser |  |  |
| tblTimeSheet subform1 | Subform/Subreport |  |  |
| Page349 | WebBrowser |  |  |
| Text388 | TextBox | TotalSeniorityAllowedCurrent |  |
| txtDateOfSeniorityChange | TextBox | ="Situation le : " & [DateOfSeniorityChange] |  |
| TotalSeniorityAllowedNextYear | TextBox | TotalSeniorityAllowedThisYear |  |
| Toggle1100 | Attachment |  | OnClick |
| EmpDateOfHire | TextBox | EmpDateOfHire |  |
| GrantedSeniorityDate | TextBox | GrantedSeniorityDate | OnGotFocus, OnLostFocus |
| GrantedSeniority | TextBox | GrantedSeniorityCal |  |
| Text1061 | TextBox | ="Situation le : " & [DateOfSeniorityChangeLastYear] |  |
| TotalSeniorityAllowedLastYear | TextBox | TotalSeniorityAllowedLastYear |  |
| AcquiredSeniority | TextBox | AcquiredSeniorityCurrent |  |
| MaxSeniorityAllowed | TextBox | MaxSeniorityFromBareme |  |
| TotalSeniorityAllowed | TextBox | TotalSeniorityAllowedCurrent |  |
| Page348 | WebBrowser |  |  |
| Text1044 | TextBox | ="Situation le : " & [DateOfSeniorityChangeLastYear] |  |
| Text1036 | TextBox | ="Situation le : " & [DateOfSeniorityChange] |  |
| txtEmployeeSalaryLastYear | TextBox | EmployeeSalaryLastYear |  |
| txtEmployeeSalaryCurrent | TextBox | EmployeeSalaryCurrent |  |
| txtEmployeeSalaryThisYear | TextBox | EmployeeSalaryThisYear |  |
| Text1042 | TextBox | SectorialChanging |  |
| Text1152 | TextBox | =[txtTimePercent]*[txtEmployeeSalaryLastYear] |  |
| Text1153 | TextBox | =[txtTimePercent]*[txtEmployeeSalaryCurrent] |  |
| Text1154 | TextBox | =[txtTimePercent]*[txtEmployeeSalaryThisYear] |  |
| Text777 | TextBox | Remarque2 |  |
| EmployeeSalarayIncreaselabel | TextBox | ="Cummule des augmentations individuel: " & [TotalEmployeeIncrease] |  |
| txtTimePercent | TextBox | TimePercent |  |
| EmptyCell1169 | Type_127 |  |  |
| Page346 | WebBrowser |  |  |
| Text824 | TextBox | [TotalEmployeeIncrease] |  |
| frm_Emp_Indexation | Subform/Subreport |  |  |
| EmptyCell872 | Type_127 |  |  |
| Page538 | WebBrowser |  |  |
| frm_RTTCalc | Subform/Subreport |  |  |
| Page1112 | WebBrowser |  |  |
| frm_Emp_Employee_Leasing | Subform/Subreport |  |  |
| Page1139 | WebBrowser |  |  |
| frm_VacationRight | Subform/Subreport |  |  |
| Page1113 | WebBrowser |  |  |
| frm_Log_Requests | Subform/Subreport |  |  |
| Page1141 | WebBrowser |  |  |
| frm_HolidaySelection | Subform/Subreport |  |  |
| frmYearCalendarDetail | Subform/Subreport |  |  |
| txtHolidaySelectionID | TextBox | =[frm_HolidaySelection].[Form]![HolidaySelectionID] |  |
| Page796 | WebBrowser |  |  |
| frm_qryVacationRightAndTaken | Subform/Subreport |  |  |

### Form Events

- **OnOpen**: `[Event Procedure]`
- **OnCurrent**: `[Event Procedure]`

### Subforms

  - **Subform `tblTimeSheet subform1`**: SourceObject=`frm_TimeSheet`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`
  - **Subform `frm_Emp_Indexation`**: SourceObject=`frm_Emp_Indexation`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`
  - **Subform `frm_RTTCalc`**: SourceObject=`frm_RTTCalc`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`
  - **Subform `frm_Emp_Employee_Leasing`**: SourceObject=`frm_Emp_Employee_Leasing`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`
  - **Subform `frm_VacationRight`**: SourceObject=`frm_VacationRight`, LinkChild=`EmployeeName`, LinkMaster=`EmployeeID`
  - **Subform `frm_Log_Requests`**: SourceObject=`frm_Log_Requests`, LinkChild=`RequestorID`, LinkMaster=`EmployeeID`
  - **Subform `frm_HolidaySelection`**: SourceObject=`frm_Abs_HolidaySelectionBatchs`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`
  - **Subform `frmYearCalendarDetail`**: SourceObject=`frm_Abs_HolidaySelectionDetails`, LinkChild=`HolidaySelectionID`, LinkMaster=`txtHolidaySelectionID`
  - **Subform `frm_qryVacationRightAndTaken`**: SourceObject=`frm_Abs_HolidayRightAndTaken`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`

---
## Form: `xfrm_Employees`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 4497 |

### Controls (1 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Image11 | Rectangle |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_VacationRight`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_VacationRight.*, tbl_Abs_AbsenceCodes.TimeType FROM tbl_Abs_AbsenceCodes INNER JOIN tbl_VacationRight ON tbl_Abs_AbsenceCodes.AbsenceID = tbl_VacationRight.AbsenceCode;  |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| OrderBy | [frm_VacationRight].[VacationYear] |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 11958 |

### Controls (18 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| ID | TextBox | ID |  |
| EmployeeName | ComboBox | EmployeeName |  |
| AbsenceCode | ComboBox | AbsenceCode |  |
| VacationYear | TextBox | VacationYear |  |
| Days | TextBox | Days |  |
| Hours | TextBox | Hours |  |
| Minutes | TextBox | Minutes |  |
| Box24 | Line |  |  |
| TimeType | TextBox | TimeType |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `ximportantfrm_UpdateEmpInfo`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | qry_UpdateEmpInfo |
| Caption |   |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 10035 |

### Controls (27 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Box68 | Line |  |  |
| Line1 | Type_102 |  |  |
| txtNewEmpFName | TextBox |  | AfterUpdate |
| cmdAddNew | CommandButton |  | OnClick |
| txtNewEmpLName | TextBox |  | AfterUpdate |
| cboNewSupervisorID | ComboBox |  | AfterUpdate |
| txtNewEmpDateOfHire | TextBox |  | AfterUpdate |
| txtEmployeeID | TextBox | EmployeeID |  |
| txtEmpFName | TextBox | EmpFName |  |
| chkStatus | CheckBox | IsInactive | AfterUpdate |
| Label43 | TextBox |  |  |
| txtEmpLName | TextBox | EmpLName |  |
| cboSupervisorID | ComboBox | SecteurID |  |
| txtEmpDateOfHire | TextBox | EmpDateOfHire |  |
| cmdDeleteEmployee | CommandButton |  | OnClick |
| cmdBoughtVac | CommandButton |  | OnClick |

### Form Events

- **BeforeUpdate**: `[Event Procedure]`

---
## Form: `frm_Abs_HolidayRightAndTaken`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | qryVacationRightTaken2 |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | False |
| Filter | [yearVacation]= 2021 |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 12558 |

### Controls (22 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| ID | TextBox | AbsenceID |  |
| EmployeeID | ComboBox | EmployeeID |  |
| VacationYear | TextBox | yearVacation |  |
| Days | TextBox | TotalDaysRightnz |  |
| Hours | TextBox | TotalRightInTimeFormatnz |  |
| TotalDaysTaken | TextBox | TotalDaysTakennz |  |
| RemaininghoursString | TextBox | DiffIntimeFormatnz |  |
| Remainingdays | TextBox | DiffInDaysnz |  |
| TotaInTimeFormat2 | TextBox | TotalTakenInTimeFormatnz |  |
| AbsenceCode | TextBox | AbsenceCodeDesc |  |
| TimeType | TextBox | TimeType |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Abs_HolidayInputForm`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 16440 |

### Controls (20 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txtSartDate | TextBox |  | AfterUpdate, OnChange |
| txtEndDate | TextBox |  |  |
| txtNbreJours | TextBox |  | BeforeUpdate |
| txtNbreHeures | TextBox |  |  |
| cmbAbsenceID | ComboBox |  | AfterUpdate |
| cmbEmployeeID | ComboBox |  | AfterUpdate |
| txtreason | TextBox |  |  |
| btnReset | CommandButton |  | OnClick |
| btnValidation | CommandButton |  | OnClick |
| cmbyear | ComboBox |  |  |
| frm_SimpleViewTimeSheet | Subform/Subreport |  |  |
| qryVacationRightParam subform | Subform/Subreport |  |  |

### Form Events

- **OnLoad**: `[Event Procedure]`

### Subforms

  - **Subform `frm_SimpleViewTimeSheet`**: SourceObject=`frm_SimpleViewTimeSheet`, LinkChild=`EmployeeID`, LinkMaster=`cmbEmployeeID`
  - **Subform `qryVacationRightParam subform`**: SourceObject=`frm_Abs_HolidayRightAndTaken`, LinkChild=`EmployeeID`, LinkMaster=`cmbEmployeeID`

---
## Form: `tbl_cmn_Locations subform`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_cmn_Locations |
| Caption | tbl_cmn_Locations subform |
| DefaultView | Datasheet |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 9225 |

### Controls (16 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| LocationID | TextBox | LocationID |  |
| LocationName | TextBox | LocationName |  |
| Address | TextBox | Address |  |
| PostCode | TextBox | PostCode |  |
| Commune | TextBox | Commune |  |
| Country | TextBox | Country |  |
| ResponsableID | ComboBox | ResponsableID |  |
| OrganisationID | ComboBox | OrganisationID |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Index`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Index |
| Caption | frmIndex |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 2 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 9846 |

### Controls (68 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| IndexationID | TextBox | IndexationID |  |
| Index01 | TextBox | Index01 |  |
| Index02 | TextBox | Index02 |  |
| Index03 | TextBox | Index03 |  |
| Index04 | TextBox | Index04 |  |
| Index05 | TextBox | Index05 |  |
| Index06 | TextBox | Index06 |  |
| Index07 | TextBox | Index07 |  |
| Index08 | TextBox | Index08 |  |
| Index09 | TextBox | Index09 |  |
| Index10 | TextBox | Index10 |  |
| Index11 | TextBox | Index11 |  |
| Index12 | TextBox | Index12 |  |
| Index13 | TextBox | Index13 |  |
| Index14 | TextBox | Index14 |  |
| Index15 | TextBox | Index15 |  |
| Index16 | TextBox | Index16 |  |
| Index17 | TextBox | Index17 |  |
| Index18 | TextBox | Index18 |  |
| Index19 | TextBox | Index19 |  |
| Index20 | TextBox | Index20 |  |
| Index01Date | TextBox | Index01Date |  |
| EmptyCell114 | Type_127 |  |  |
| Index02Date | TextBox | Index02Date |  |
| Index03Date | TextBox | Index03Date |  |
| Index04Date | TextBox | Index04Date |  |
| Index05Date | TextBox | Index05Date |  |
| Index06Date | TextBox | Index06Date |  |
| Index07Date | TextBox | Index07Date |  |
| Index08Date | TextBox | Index08Date |  |
| Index09Date | TextBox | Index09Date |  |
| Index10Date | TextBox | Index10Date |  |
| Index11Date | TextBox | Index11Date |  |
| Index12Date | TextBox | Index12Date |  |
| Index13Date | TextBox | Index13Date |  |
| Index14Date | TextBox | Index14Date |  |
| Index15Date | TextBox | Index15Date |  |
| Index16Date | TextBox | Index16Date |  |
| Index17Date | TextBox | Index17Date |  |
| Index18Date | TextBox | Index18Date |  |
| Index19Date | TextBox | Index19Date |  |
| Index20Date | TextBox | Index20Date |  |
| EmptyCell284 | Type_127 |  |  |
| EmptyCell305 | Type_127 |  |  |
| Text325 | TextBox | =(Nz([Index01],0)+1)*(Nz([Index02],0)+1)*(Nz([Index03],0)+1)*(Nz([Index04],0)+1)*(Nz([Index05],0)+1)*(Nz([Index06],0)+1)*(Nz([Index07],0)+1)*(Nz([Index08],0)+1)*(Nz([Index09],0)+1)*(Nz([Index10],0)+1)*(Nz([Index11],0)+1)*(Nz([Index12],0)+1)*(Nz([Index13],0)+1)*(Nz([Index14],0)+1)*(Nz([Index15],0)+1)*(Nz([Index16],0)+1)*(Nz([Index17],0)+1)*(Nz([Index18],0)+1)*(Nz([Index19],0)+1)*(Nz([Index20],0)+1) |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_1_NavigationForm`

### Properties

| Property | Value |
|----------|-------|
| Caption | Work Days |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | True |
| Modal | False |
| Width | 15894 |

### Controls (35 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| NavigationControl0 | Type_129 |  |  |
| NavigationButton901 | Type_130 |  |  |
| NavigationButton637 | Type_130 |  |  |
| NavigationButton26 | Type_130 |  |  |
| NavigationButton44 | Type_130 |  |  |
| NavigationButton366 | Type_130 |  |  |
| NavigationButton606 | Type_130 |  |  |
| NavigationButton1 | Type_130 |  |  |
| NavigationSubform | Subform/Subreport |  |  |
| NavigationControl5 | Type_129 |  |  |
| NavigationButton121 | Type_130 |  |  |
| NavigationButton116 | Type_130 |  |  |
| cmDecision_Nav | Type_130 |  |  |
| NavigationButton139 | Type_130 |  |  |
| NavigationButton245 | Type_130 |  |  |
| NavigationButton258 | Type_130 |  |  |
| NavigationButton934 | Type_130 |  |  |
| NavigationButton748 | Type_130 |  |  |
| NavigationButton954 | Type_130 |  |  |
| NavigationButton908 | Type_130 |  |  |
| NavigationButton881 | Type_130 |  |  |
| NavigationButton956 | Type_130 |  |  |
| NavigationButton947 | Type_130 |  |  |
| NavigationButton658 | Type_130 |  |  |
| NavigationButton904 | Type_130 |  |  |
| NavigationButton625 | Type_130 |  | OnClick |
| NavigationButton958 | Type_130 |  |  |
| NavigationButton630 | Type_130 |  | OnClick |
| NavigationButton944 | Type_130 |  |  |
| NavigationButton8 | Type_130 |  |  |
| frm_Employees | Subform/Subreport |  |  |
| EmptyCell88 | Type_127 |  |  |
| EmptyCell89 | Type_127 |  |  |
| Command854 | CommandButton |  |  |

### Form Events

- **OnLoad**: `[Event Procedure]`

### Subforms

  - **Subform `NavigationSubform`**: SourceObject=`frm_1_Organizing`, LinkChild=``, LinkMaster=``

---
## Form: `frm_Abs_HolidaySelectionMain`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Emp_Employees |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| Filter | EmployeeID=45 |
| ScrollBars | 3 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 11674 |

### Controls (11 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmployeeID | TextBox | EmployeeID |  |
| txtHolidaySelectionID | TextBox | =[frm_HolidaySelection].[Form]![HolidaySelectionID] |  |
| Contact Name | TextBox | =[EmpFname] & " " & [EmpLName] |  |
| Command40 | CommandButton |  | OnClick |
| Command41 | CommandButton |  | OnClick |
| Command42 | CommandButton |  | OnClick |
| Command43 | CommandButton |  | OnClick |
| frm_HolidaySelection | Subform/Subreport |  |  |
| frmYearCalendarDetail | Subform/Subreport |  |  |

### Form Events

- **OnCurrent**: `[Event Procedure]`

### Subforms

  - **Subform `frm_HolidaySelection`**: SourceObject=`frm_Abs_HolidaySelectionBatchs`, LinkChild=`EmployeeID`, LinkMaster=`EmployeeID`
  - **Subform `frmYearCalendarDetail`**: SourceObject=`frm_Abs_HolidaySelectionDetails`, LinkChild=`HolidaySelectionID`, LinkMaster=`txtHolidaySelectionID`

---
## Form: `frm_Cmn_Organisation`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Cmn_Organisation |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | False |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 15225 |

### Controls (41 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| TabCtl37 | Type_123 |  |  |
| Page38 | WebBrowser |  |  |
| OrganizationName | TextBox | OrganizationName |  |
| Representative | ComboBox | Representative |  |
| VATNumber | TextBox | VATNumber |  |
| Registration | TextBox | Registration |  |
| CommitéPartitaire | TextBox | CommitéPartitaire |  |
| PleinTempsHeures | TextBox | PleinTempsHeures |  |
| PleinTempsMinutes | TextBox | PleinTempsMinutes |  |
| Business Phone | TextBox | Telephone |  |
| Home Phone | TextBox | Fax |  |
| Address | TextBox | Address |  |
| PostCode | TextBox | PostCode |  |
| City | TextBox | City |  |
| Country | TextBox | Country |  |
| Commune | TextBox | Commune |  |
| Logo | NavigationControl | Logo |  |
| OrganisationID | TextBox | OrganisationID |  |
| Page39 | WebBrowser |  |  |
| tbl_Emp_Indexation subform | Subform/Subreport |  |  |
| Text824 | TextBox | =FormatPercent(DProduct("IndexationNumber","tbl_Cmn_Indexation","OrganizationID =" & [OrganisationID]),2) |  |
| Sites | WebBrowser |  |  |
| tbl_cmn_Locations subform | Subform/Subreport |  |  |

### Form Events

*No form-level event procedures*

### Subforms

  - **Subform `tbl_Emp_Indexation subform`**: SourceObject=`frm_Cmn_Indexation`, LinkChild=`OrganizationID`, LinkMaster=`OrganisationID`
  - **Subform `tbl_cmn_Locations subform`**: SourceObject=`tbl_cmn_Locations subform`, LinkChild=`OrganisationID`, LinkMaster=`OrganisationID`

---
## Form: `frm_Log_Change`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Log_Change |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 13110 |

### Controls (16 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| ChangeID | TextBox | ChangeID |  |
| ChangeDescription | TextBox | ChangeDescription |  |
| Deadline | TextBox | Deadline |  |
| RequestID | ComboBox | DescisionID |  |
| DescisionID | ComboBox | DescisionID |  |
| Statut | ComboBox | Statut |  |
| Box25 | Line |  |  |
| Box26 | Line |  |  |
| Box27 | Line |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Log_Meeting`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Log_Meeting |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 15822 |

### Controls (15 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmptyCell22 | Type_127 |  |  |
| MeetingID | TextBox | MeetingID |  |
| MeetingDate | TextBox | MeetingDate |  |
| MeetingAgenda | TextBox | MeetingAgenda |  |
| MeetingType | ComboBox | MeetingType |  |
| Attendees | ComboBox | Attendees |  |
| Box31 | Line |  |  |
| Box32 | Line |  |  |
| MeetingDescription | TextBox | MeetingDescription |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_1_Organizing`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 4324 |

### Controls (5 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Image7 | Rectangle |  |  |
| Command65 | CommandButton |  | OnClick |
| Command66 | CommandButton |  | OnClick |
| Command67 | CommandButton |  | OnClick |
| Command69 | CommandButton |  | OnClick |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Emp_Indexation`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_Emp_Indexation.* FROM tbl_Emp_Indexation;  |
| Caption | tbl_Emp_Indexation subform |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 4644 |

### Controls (9 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmployeeID | ComboBox | EmployeeID |  |
| IndexationID | TextBox | IndexationID |  |
| IndexationNumber | TextBox | IndexationNumber |  |
| IndexationDate | TextBox | IndexationDate |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `frm_Cmn_Indexation`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | tbl_Cmn_Indexation |
| Caption | tbl_Emp_Indexation subform |
| DefaultView | Continuous Forms |
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 5090 |

### Controls (9 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmployeeID | ComboBox | OrganizationID |  |
| IndexationID | TextBox | IndexationID |  |
| IndexationNumber | TextBox | IndexationNumber |  |
| IndexationDate | TextBox | IndexationDate |  |

### Form Events

- **AfterUpdate**: `[Event Procedure]`

---
## Form: `frm_RTTCalc`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | Qry_RTTCalc |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | False |
| ScrollBars | 3 |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 12470 |

### Controls (28 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| EmpDateOfBirth | TextBox | EmpDateOfBirth |  |
| ThisYearBirthday | TextBox | ThisYearBirthday |  |
| YearsOldAtBithDayThisYear | TextBox | YearsOldAtBithDayThisYear |  |
| Contact_Name | TextBox | Contact Name |  |
| Text110 | TextBox | Age |  |
| SecteurID | TextBox | SecteurName |  |
| txtMOB | TextBox | ="et " & [AgeMonthsPortion] & " mois" |  |
| HrPerYearLastYear | TextBox | HrPerYearLastYear |  |
| HrPerYearThisYear | TextBox | HrPerYearThisYear |  |
| EmptyCell306 | Type_127 |  |  |
| EmptyCell345 | Type_127 |  |  |
| RTTThisYear | TextBox | RTTThisYear |  |
| RTTLastYear | TextBox | RTTLastYear |  |
| Text364 | TextBox | TotalRTT |  |
| Command117 | CommandButton |  | OnClick |
| TotalRTTBasedInWorkedTime | TextBox | TotalRTTBasedInWorkedTime |  |
| EmptyCell375 | Type_127 |  |  |

### Form Events

*No form-level event procedures*

---
## Form: `frm_Abs_AbsenceCode_RichTextHelper`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 8640 |

### Controls (6 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| txtBxInput | TextBox |  |  |
| cmdGetCodes | CommandButton |  | OnClick |
| txtBxOutput | TextBox |  |  |
| cmdTest | CommandButton |  | OnClick |

### Form Events

- **OnLoad**: `[Event Procedure]`

---
## Form: `frm_Cmn_Leasings`

### Properties

| Property | Value |
|----------|-------|
| AllowAdditions | True |
| AllowDeletions | True |
| AllowEdits | True |
| ScrollBars | 3 |
| RecordSelectors | True |
| NavigationButtons | True |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 16992 |

### Controls (5 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| TabCtl0 | Type_123 |  |  |
| Leasing Types | WebBrowser |  |  |
| tbl_Cmn_LeasingTypes | Subform/Subreport |  |  |
| Leasing Assets | WebBrowser |  |  |
| frm_Cmn_Leasing | Subform/Subreport |  |  |

### Form Events

*No form-level event procedures*

### Subforms

  - **Subform `tbl_Cmn_LeasingTypes`**: SourceObject=`Table.tbl_Cmn_LeasingTypes`, LinkChild=``, LinkMaster=``
  - **Subform `frm_Cmn_Leasing`**: SourceObject=`frm_Cmn_Leasing`, LinkChild=``, LinkMaster=``

---
## Form: `frm_SimpleViewTimeSheet`

### Properties

| Property | Value |
|----------|-------|
| RecordSource | SELECT tbl_TimeSheet.* FROM tbl_TimeSheet WHERE (((tbl_TimeSheet.Active)=True));  |
| DefaultView | Continuous Forms |
| AllowAdditions | False |
| AllowDeletions | False |
| AllowEdits | False |
| RecordSelectors | False |
| NavigationButtons | False |
| DataEntry | False |
| PopUp | False |
| Modal | False |
| Width | 4836 |

### Controls (12 total)

| Name | Type | ControlSource | Events |
|------|------|---------------|--------|
| Monday | TextBox | Monday |  |
| Tuesday | TextBox | Tuesday |  |
| Wednesday | TextBox | Wednesday |  |
| Thursday | TextBox | Thursday |  |
| Friday | TextBox | Friday |  |
| EmployeeID | ComboBox | EmployeeID |  |

### Form Events

*No form-level event procedures*