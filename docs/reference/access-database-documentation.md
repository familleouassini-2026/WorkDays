# Database Documentation: WorkDays_v0.001 - 20241101.accdb

**Generated:** 2026-07-30 01:11:10
**File:** `f:\Bouchra version\WorkDays\WorkDays_v0.001 - 20241101.accdb`
**File Size:** 18.75 MB

---
## Overview

| Object Type | Count |
|-------------|-------|
| Tables | 33 |
| Queries/Views | 32 |
| Forms | 0 |
| Reports | 0 |
| Macros | 0 |
| Modules (VBA) | 0 |
| Relationships | 0 |

---
## Tables


### Table: `Contacts`

**Row Count:** 0

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | ID | COUNTER | 10 | No |  |  |
| 2 | Company | VARCHAR | 50 | Yes |  |  |
| 3 | Last Name | VARCHAR | 50 | Yes |  |  |
| 4 | First Name | VARCHAR | 50 | Yes |  |  |
| 5 | E-mail Address | VARCHAR | 50 | Yes |  |  |
| 6 | Job Title | VARCHAR | 50 | Yes |  |  |
| 7 | Business Phone | VARCHAR | 25 | Yes |  |  |
| 8 | Home Phone | VARCHAR | 25 | Yes |  |  |
| 9 | Mobile Phone | VARCHAR | 25 | Yes |  |  |
| 10 | Fax Number | VARCHAR | 25 | Yes |  |  |
| 11 | Address | VARCHAR | 255 | Yes |  |  |
| 12 | City | VARCHAR | 50 | Yes |  |  |
| 13 | State/Province | VARCHAR | 50 | Yes |  |  |
| 14 | ZIP/Postal Code | VARCHAR | 15 | Yes |  |  |
| 15 | Country/Region | VARCHAR | 50 | Yes |  |  |
| 16 | Web Page | LONGCHAR | 1073741823 | Yes |  |  |
| 17 | Notes | LONGCHAR | 1073741823 | Yes |  |  |
| 18 | Attachments | LONGCHAR | 1073741823 | Yes |  |  |
| 19 | Category | VARCHAR | 100 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| Attachments_C8680B9D2E0D47DB8B4B577A9405F01E | Yes | Attachments |
| PrimaryKey | Yes | ID |
| City | No | City |
| Company | No | Company |
| First Name | No | First Name |
| Last Name | No | Last Name |
| Postal Code | No | ZIP/Postal Code |
| State/Province | No | State/Province |

### Table: `Paste Errors`

**Row Count:** 2

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | F1 | DOUBLE | 53 | Yes |  |  |
| 2 | F2 | DOUBLE | 53 | Yes |  |  |
| 3 | F3 | VARCHAR | 255 | Yes |  |  |

#### Sample Data (first 2 rows)

| F1 | F2 | F3 |
| --- | --- | --- |
| 28.0 | 4250.09 | ACCUEIL Diplôme Secondaire NON IFIC BAR 1/55 - 1/61 - 1/77 |
| 28.0 | 4250.09 | ACCUEIL Diplôme Secondaire NON IFIC BAR 1/55 - 1/61 - 1/77 |

### Table: `Settings`

**Row Count:** 1

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | ID | COUNTER | 10 | No |  |  |
| 2 | ShowWelcome | BIT | 1 | No |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | ID |

#### Sample Data (first 1 rows)

| ID | ShowWelcome |
| --- | --- |
| 1 | True |

### Table: `tbl_Abs_AbsenceCodes`

**Row Count:** 22

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | AbsenceID | COUNTER | 10 | No |  |  |
| 2 | AbsenceCodeDesc | VARCHAR | 255 | Yes |  |  |
| 3 | AbsenceCode | VARCHAR | 255 | Yes |  |  |
| 4 | AbsenceColorCode | INTEGER | 10 | Yes |  |  |
| 5 | AbsenceTextColorCode | INTEGER | 10 | Yes |  |  |
| 6 | AbsenceColorTag | VARCHAR | 255 | Yes |  |  |
| 7 | TimeType | VARCHAR | 255 | Yes |  |  |
| 8 | RichTextFormat | LONGCHAR | 1073741823 | Yes |  |  |
| 9 | PlainTextFormat | LONGCHAR | 1073741823 | Yes |  |  |
| 10 | TimeThematic | BIT | 1 | No |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | AbsenceID |
| AbsenceID | No | AbsenceID |
| AbsenceTextColorCode | No | AbsenceTextColorCode |
| PayCode | No | AbsenceCodeDesc |
| tbluAbsenceCodesAbsenceCode | No | AbsenceCode |

#### Sample Data (first 5 rows)

| AbsenceID | AbsenceCodeDesc | AbsenceCode | AbsenceColorCode | AbsenceTextColorCode | AbsenceColorTag | TimeType | RichTextFormat | PlainTextFormat | TimeThematic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Réduction du temps de travail | RTT | 35653 | 16777215 | <font color=black style='BACKGROUND-COLOR:#0072BC'> | H/M | <div>&nbsp;</div>

<div><font color="#333333">&nbsp;</font></div> | NULL | False |
| 2 | Solde de congés Année N-1 | JP | 11829830 | 0 | <font color=black style='BACKGROUND-COLOR:#0072BC'> | H/M |  | NULL | False |
| 3 | Congés sans solde | CSS | 42495 | 0 | <font color=black style='BACKGROUND-COLOR:#FFA500'> | H/M |  | NULL | False |
| 4 | Petits chômages | PC | 9878221 | 0 | <font color=black style='BACKGROUND-COLOR:#CDBA96'> | Jours |  | NULL | False |
| 5 | Récup. J. férié 2021 (01/05; 15/08; 25/12) | JF | 16711680 | 16777215 | <font color=white style='BACKGROUND-COLOR:#0000FF'> | Jours |  | NULL | False |

### Table: `tbl_Abs_HolidaySelection`

**Row Count:** 44

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | HolidaySelectionID | COUNTER | 10 | No |  |  |
| 2 | StartDate | DATETIME | 19 | Yes |  |  |
| 3 | EndDate | DATETIME | 19 | Yes |  |  |
| 4 | NmbreDays | INTEGER | 10 | Yes |  |  |
| 5 | AbsenceID | INTEGER | 10 | Yes |  |  |
| 6 | AbsenceYear | INTEGER | 10 | Yes |  |  |
| 7 | EmployeeID | INTEGER | 10 | Yes |  |  |
| 8 | AbsenceTime | DATETIME | 19 | Yes |  |  |
| 9 | AbsenceReason | VARCHAR | 255 | Yes |  |  |
| 10 | DateCreated | DATETIME | 19 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | HolidaySelectionID |
| AbsenceID | No | AbsenceID |
| EmployeeID | No | EmployeeID |

#### Sample Data (first 5 rows)

| HolidaySelectionID | StartDate | EndDate | NmbreDays | AbsenceID | AbsenceYear | EmployeeID | AbsenceTime | AbsenceReason | DateCreated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 88 | 2021-05-13 00:00:00 | NULL | 1 | 5 | 2021 | 30 | 1899-12-30 00:00:00 |  | 2021-01-03 23:51:58 |
| 89 | 2021-11-01 00:00:00 | 2021-11-01 00:00:00 | 0 | 11 | 2021 | 30 | 1899-12-30 08:00:00 |  | 2021-01-03 23:54:11 |
| 91 | 2021-04-01 00:00:00 | 2021-04-15 00:00:00 | 0 | 11 | 2021 | 50 | 1899-12-30 00:00:00 |  | 2021-01-04 00:18:55 |
| 98 | 2021-01-25 00:00:00 | 2021-01-26 00:00:00 | 0 | 11 | 2021 | 59 | 1899-12-30 00:00:00 |  | 2021-01-17 20:50:54 |
| 99 | 2021-01-25 00:00:00 | 2021-01-26 00:00:00 | 0 | 11 | 2021 | 59 | 1899-12-30 00:00:00 |  | 2021-01-17 21:09:10 |

### Table: `tbl_Abs_Holidays`

**Row Count:** 10

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | HolidayID | COUNTER | 10 | No |  |  |
| 2 | HolidayDate | DATETIME | 19 | Yes |  |  |
| 3 | HolidayName | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | HolidayID |
| HolidayID | No | HolidayID |

#### Sample Data (first 5 rows)

| HolidayID | HolidayDate | HolidayName |
| --- | --- | --- |
| 35 | 2021-01-01 00:00:00 | Jour de l'An |
| 36 | 2021-04-05 00:00:00 | Lundi de Pâques |
| 37 | 2021-05-01 00:00:00 | Fête du Travail |
| 38 | 2021-05-13 00:00:00 | Ascension |
| 39 | 2021-05-24 00:00:00 | Lundi de Pentecôte |

### Table: `tbl_Cmn_Indexation`

**Row Count:** 0

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | IndexationID | COUNTER | 10 | No |  |  |
| 2 | IndexationNumber | DOUBLE | 53 | Yes |  |  |
| 3 | OrganizationID | INTEGER | 10 | Yes |  |  |
| 4 | IndexationDate | DATETIME | 19 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | IndexationID |
| IndexationID | No | IndexationID |

### Table: `tbl_Cmn_Leasing`

**Row Count:** 16

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | LeasingID | COUNTER | 10 | No |  |  |
| 2 | LeasingType | INTEGER | 10 | Yes |  |  |
| 3 | Matricule | VARCHAR | 255 | Yes |  |  |
| 4 | LeasingStart | DATETIME | 19 | Yes |  |  |
| 5 | LeasingEnd | DATETIME | 19 | Yes |  |  |
| 6 | Modèle | VARCHAR | 255 | Yes |  |  |
| 7 | Couleur | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| Matricule | Yes | Matricule |
| PrimaryKey | Yes | LeasingID |

#### Sample Data (first 5 rows)

| LeasingID | LeasingType | Matricule | LeasingStart | LeasingEnd | Modèle | Couleur |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 1SVA704 | NULL | NULL | NULL | NULL |
| 2 | 1 | 1GKQ959 | NULL | NULL | NULL | NULL |
| 3 | 1 | 1NHB989 | NULL | NULL | NULL | NULL |
| 4 | 1 | 1HUU063 | NULL | NULL | NULL | NULL |
| 5 | 1 | 1JTB567 | NULL | NULL | NULL | NULL |

### Table: `tbl_Cmn_LeasingTypes`

**Row Count:** 3

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | LeasingTypeID | COUNTER | 10 | No |  |  |
| 2 | LeasingType | VARCHAR | 255 | Yes |  |  |
| 3 | Description | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | LeasingTypeID |

#### Sample Data (first 3 rows)

| LeasingTypeID | LeasingType | Description |
| --- | --- | --- |
| 1 | Voitures | NULL |
| 2 | Mobiles | NULL |
| 3 | Imprimantes | NULL |

### Table: `tbl_Cmn_Organisation`

**Row Count:** 1

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | OrganisationID | COUNTER | 10 | No |  |  |
| 2 | OrganizationName | VARCHAR | 255 | Yes |  |  |
| 3 | Representative | INTEGER | 10 | Yes |  |  |
| 4 | VATNumber | VARCHAR | 255 | Yes |  |  |
| 5 | Registration | VARCHAR | 255 | Yes |  |  |
| 6 | CommitéPartitaire | VARCHAR | 255 | Yes |  |  |
| 7 | Address | VARCHAR | 255 | Yes |  |  |
| 8 | PostCode | VARCHAR | 255 | Yes |  |  |
| 9 | City | VARCHAR | 255 | Yes |  |  |
| 10 | Country | VARCHAR | 255 | Yes |  |  |
| 11 | Commune | VARCHAR | 255 | Yes |  |  |
| 12 | Logo | LONGCHAR | 1073741823 | Yes |  |  |
| 13 | Telephone | VARCHAR | 255 | Yes |  |  |
| 14 | Fax | VARCHAR | 255 | Yes |  |  |
| 15 | PleinTempsHeures | INTEGER | 10 | Yes |  |  |
| 16 | PleinTempsMinutes | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| Logo_EEAB9E8FB5984BD38E7AF4164BCFD263 | Yes | Logo |
| PrimaryKey | Yes | OrganisationID |
| PostCode | No | PostCode |

#### Sample Data (first 1 rows)

| OrganisationID | OrganizationName | Representative | VATNumber | Registration | CommitéPartitaire | Address | PostCode | City | Country | Commune | Logo | Telephone | Fax | PleinTempsHeures | PleinTempsMinutes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Maison Médicale de Forest ASBL | 44 | 222 445 824 60 | 04 17 613 209 | 330.01.54 | sise rue du curé, 9 | 1190 | Bruxelles | Belgique | 1190 | logo.jpg | 02 376 16 82 | NULL | 1 | 35 |

### Table: `tbl_Emp_Employee_Leasing`

**Row Count:** 16

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | EmployeeID | INTEGER | 10 | Yes |  |  |
| 2 | LeasingID | INTEGER | 10 | Yes |  |  |
| 3 | StartDate | DATETIME | 19 | Yes |  |  |
| 4 | EndDate | DATETIME | 19 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| LeasingID | No | LeasingID |
| tbl_Emp_Employeestbl_Employee_Leasing | No | EmployeeID |

#### Sample Data (first 5 rows)

| EmployeeID | LeasingID | StartDate | EndDate |
| --- | --- | --- | --- |
| 16 | 2 | 2016-03-07 00:00:00 | NULL |
| 35 | 3 | 2016-03-02 00:00:00 | NULL |
| 28 | 4 | NULL | NULL |
| 30 | 15 | 2016-03-02 00:00:00 | NULL |
| 50 | 1 | 2017-08-03 00:00:00 | NULL |

### Table: `tbl_Emp_Employees`

**Row Count:** 35

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | EmployeeID | COUNTER | 10 | No |  |  |
| 2 | Title | VARCHAR | 255 | Yes |  |  |
| 3 | EmpFName | VARCHAR | 255 | Yes |  |  |
| 4 | EmpLName | VARCHAR | 255 | Yes |  |  |
| 5 | Job Title | VARCHAR | 50 | Yes |  |  |
| 6 | ContractType | VARCHAR | 255 | Yes |  |  |
| 7 | EmpDateOfHire | DATETIME | 19 | Yes |  |  |
| 8 | EmpEndDate | DATETIME | 19 | Yes |  |  |
| 9 | EmpDateOfBirth | DATETIME | 19 | Yes |  |  |
| 10 | IsInactive | BIT | 1 | No |  |  |
| 11 | IBAN | VARCHAR | 255 | Yes |  |  |
| 12 | BIC | VARCHAR | 255 | Yes |  |  |
| 13 | Nationality | VARCHAR | 255 | Yes |  |  |
| 14 | INAMI | VARCHAR | 255 | Yes |  |  |
| 15 | NationalRegistration | VARCHAR | 255 | Yes |  |  |
| 16 | SecteurID | INTEGER | 10 | Yes |  |  |
| 17 | E-mail Address | VARCHAR | 50 | Yes |  |  |
| 18 | Business Phone | VARCHAR | 25 | Yes |  |  |
| 19 | Home Phone | VARCHAR | 25 | Yes |  |  |
| 20 | Mobile Phone | VARCHAR | 25 | Yes |  |  |
| 21 | Fax Number | VARCHAR | 25 | Yes |  |  |
| 22 | Address | VARCHAR | 255 | Yes |  |  |
| 23 | City | VARCHAR | 50 | Yes |  |  |
| 24 | State/Province | VARCHAR | 50 | Yes |  |  |
| 25 | Postal Code | VARCHAR | 15 | Yes |  |  |
| 26 | Country/Region | VARCHAR | 50 | Yes |  |  |
| 27 | Notes | LONGCHAR | 1073741823 | Yes |  |  |
| 28 | Attachments | LONGCHAR | 1073741823 | Yes |  |  |
| 29 | GrantedSeniority | DOUBLE | 53 | Yes |  |  |
| 30 | LocationID | INTEGER | 10 | Yes |  |  |
| 31 | GrantedSeniorityDate | DATETIME | 19 | Yes |  |  |
| 32 | DistanceToHome | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| Attachments_2F2E94F8A49743BD8D61B5A58FB054BD | Yes | Attachments |
| PrimaryKey | Yes | EmployeeID |
| City | No | City |
| DepartmentID | No | SecteurID |
| EmpID | No | EmployeeID |
| State/Province | No | State/Province |
| tbluSupervisortbluEmployees | No | SecteurID |
| ZIP/Postal Code | No | Postal Code |

#### Sample Data (first 5 rows)

| EmployeeID | Title | EmpFName | EmpLName | Job Title | ContractType | EmpDateOfHire | EmpEndDate | EmpDateOfBirth | IsInactive | IBAN | BIC | Nationality | INAMI | NationalRegistration | SecteurID | E-mail Address | Business Phone | Home Phone | Mobile Phone | Fax Number | Address | City | State/Province | Postal Code | Country/Region | Notes | Attachments | GrantedSeniority | LocationID | GrantedSeniorityDate | DistanceToHome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | Mme | Lidia | BIOUCAS | NULL | Contrat CDI | 2016-05-17 00:00:00 | NULL | 1968-10-19 00:00:00 | False | NULL | NULL | NULL | NULL | NULL | 1 | NULL | NULL | NULL | 0476779284 | NULL | AVENUE DES Jardins 52/6 | NULL | Bruxelles | 1030 | NULL | NULL |  | 1.0 | 3 | 2015-05-17 00:00:00 | NULL |
| 16 | Mme | Fareda | BOULAICH | Accueillante | Contrat CDI | 2013-09-07 00:00:00 | NULL | 1974-12-16 00:00:00 | False | NULL | NULL | NULL | NULL | NULL | 1 | faredab@mmforest.be | NULL | NULL | 0476763338 | NULL | Allée des Novateurs 8 | NULL | Anderlecht | 1070 | NULL | NULL |  | 1.0 | 3 | 2012-09-07 00:00:00 | NULL |
| 18 | Mme | Chaimae | BOUZRATI | NULL | Contrat CDI | 2009-09-20 00:00:00 | NULL | 1988-10-19 00:00:00 | False | NULL | NULL | NULL | NULL | NULL | 1 | NULL | NULL | NULL | 0488046213 | NULL | Avenue Gatti de Gamond 200 | NULL | UCCLE | 1180 | NULL | NULL |  | 1.0 | 1 | 2008-09-20 00:00:00 | NULL |
| 23 | Mme | Deborah | CZAPNIK | Kinésithérapeute | Contrat CDI | 2003-01-01 00:00:00 | NULL | 1976-09-20 00:00:00 | False | NULL | NULL | NULL | NULL | NULL | 5 | deborahc@mmforest.be | NULL | NULL | 0477880008 | NULL | clos du Belloi 10 | NULL | Waterloo | 1410 | NULL | NULL |  | 4.0 | 1 | 1998-01-01 00:00:00 | NULL |
| 27 | Mme | Françoise | DELEM | NULL | NULL | 1984-11-08 00:00:00 | NULL | 1954-11-29 00:00:00 | False | NULL | NULL | NULL | NULL | NULL | 5 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |  | NULL | 1 | NULL | NULL |

### Table: `tbl_Emp_Indexation`

**Row Count:** 3

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | IndexationID | COUNTER | 10 | No |  |  |
| 2 | IndexationNumber | DOUBLE | 53 | Yes |  |  |
| 3 | EmployeeID | INTEGER | 10 | Yes |  |  |
| 4 | IndexationDate | DATETIME | 19 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | IndexationID |
| IndexationID | No | IndexationID |

#### Sample Data (first 3 rows)

| IndexationID | IndexationNumber | EmployeeID | IndexationDate |
| --- | --- | --- | --- |
| 48 | 986.27 | 30 | 2020-10-01 00:00:00 |
| 49 | 53.33 | 23 | 2018-06-01 00:00:00 |
| 50 | 1099.42 | 45 | 2020-01-01 00:00:00 |

### Table: `tbl_Holidays1`

**Row Count:** 24

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | HolidayID | COUNTER | 10 | No |  |  |
| 2 | HolidayDate | DATETIME | 19 | Yes |  |  |
| 3 | HolidayName | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | HolidayID |
| HolidayID | No | HolidayID |

#### Sample Data (first 5 rows)

| HolidayID | HolidayDate | HolidayName |
| --- | --- | --- |
| 1 | 2013-01-01 00:00:00 | New Years |
| 2 | 2013-05-27 00:00:00 | Memorial Day |
| 3 | 2013-07-04 00:00:00 | Independence Day |
| 4 | 2013-09-02 00:00:00 | Labor Day |
| 5 | 2013-11-28 00:00:00 | Thanksgiving |

### Table: `tbl_Index`

**Row Count:** 1

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | IndexationID | COUNTER | 10 | No |  |  |
| 2 | Index01 | DECIMAL | 18 | Yes |  |  |
| 3 | Index02 | DECIMAL | 18 | Yes |  |  |
| 4 | Index03 | DECIMAL | 18 | Yes |  |  |
| 5 | Index04 | DECIMAL | 18 | Yes |  |  |
| 6 | Index05 | DECIMAL | 18 | Yes |  |  |
| 7 | Index06 | DECIMAL | 18 | Yes |  |  |
| 8 | Index07 | DECIMAL | 18 | Yes |  |  |
| 9 | Index08 | DECIMAL | 18 | Yes |  |  |
| 10 | Index09 | DECIMAL | 18 | Yes |  |  |
| 11 | Index10 | DECIMAL | 18 | Yes |  |  |
| 12 | Index11 | DECIMAL | 18 | Yes |  |  |
| 13 | Index12 | DECIMAL | 18 | Yes |  |  |
| 14 | Index13 | DECIMAL | 18 | Yes |  |  |
| 15 | Index14 | DECIMAL | 18 | Yes |  |  |
| 16 | Index15 | DECIMAL | 18 | Yes |  |  |
| 17 | Index16 | DECIMAL | 18 | Yes |  |  |
| 18 | Index17 | DECIMAL | 18 | Yes |  |  |
| 19 | Index18 | DECIMAL | 18 | Yes |  |  |
| 20 | Index19 | DECIMAL | 18 | Yes |  |  |
| 21 | Index20 | DECIMAL | 18 | Yes |  |  |
| 22 | Index01Date | DATETIME | 19 | Yes |  |  |
| 23 | Index02Date | DATETIME | 19 | Yes |  |  |
| 24 | Index03Date | DATETIME | 19 | Yes |  |  |
| 25 | Index04Date | DATETIME | 19 | Yes |  |  |
| 26 | Index05Date | DATETIME | 19 | Yes |  |  |
| 27 | Index06Date | DATETIME | 19 | Yes |  |  |
| 28 | Index07Date | DATETIME | 19 | Yes |  |  |
| 29 | Index08Date | DATETIME | 19 | Yes |  |  |
| 30 | Index09Date | DATETIME | 19 | Yes |  |  |
| 31 | Index10Date | DATETIME | 19 | Yes |  |  |
| 32 | Index11Date | DATETIME | 19 | Yes |  |  |
| 33 | Index12Date | DATETIME | 19 | Yes |  |  |
| 34 | Index13Date | DATETIME | 19 | Yes |  |  |
| 35 | Index14Date | DATETIME | 19 | Yes |  |  |
| 36 | Index15Date | DATETIME | 19 | Yes |  |  |
| 37 | Index16Date | DATETIME | 19 | Yes |  |  |
| 38 | Index17Date | DATETIME | 19 | Yes |  |  |
| 39 | Index18Date | DATETIME | 19 | Yes |  |  |
| 40 | Index19Date | DATETIME | 19 | Yes |  |  |
| 41 | Index20Date | DATETIME | 19 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | IndexationID |
| IndexationID | No | IndexationID |

#### Sample Data (first 1 rows)

| IndexationID | Index01 | Index02 | Index03 | Index04 | Index05 | Index06 | Index07 | Index08 | Index09 | Index10 | Index11 | Index12 | Index13 | Index14 | Index15 | Index16 | Index17 | Index18 | Index19 | Index20 | Index01Date | Index02Date | Index03Date | Index04Date | Index05Date | Index06Date | Index07Date | Index08Date | Index09Date | Index10Date | Index11Date | Index12Date | Index13Date | Index14Date | Index15Date | Index16Date | Index17Date | Index18Date | Index19Date | Index20Date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 0.01000 | 0.02000 | 0.05000 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |

### Table: `tbl_Log_Change`

**Row Count:** 3

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | ChangeID | COUNTER | 10 | No |  |  |
| 2 | ChangeDescription | VARCHAR | 255 | Yes |  |  |
| 3 | Deadline | DATETIME | 19 | Yes |  |  |
| 4 | RequestID | INTEGER | 10 | Yes |  |  |
| 5 | DescisionID | INTEGER | 10 | Yes |  |  |
| 6 | Statut | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | ChangeID |
| ChangeID | No | ChangeID |
| DescisionID | No | DescisionID |
| RequestID | No | RequestID |
| RequeststblChangeLog | No | RequestID |

#### Sample Data (first 3 rows)

| ChangeID | ChangeDescription | Deadline | RequestID | DescisionID | Statut |
| --- | --- | --- | --- | --- | --- |
| 1 | Mise à jour de dossier de l'employeur XX | 2018-02-15 00:00:00 | 1 | 2 | En Cours |
| 2 | Enregistrement du l'employé XXX | NULL | NULL | 1 | Terminé |
| 3 | Ajouter des heures de récup pour heures supp | 2018-03-19 00:00:00 | 5 | NULL | En Cours |

### Table: `tbl_Log_Decision`

**Row Count:** 3

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | DecisionID | COUNTER | 10 | No |  |  |
| 2 | DecisionDescription | VARCHAR | 255 | Yes |  |  |
| 3 | DecisionDate | DATETIME | 19 | Yes |  |  |
| 4 | DecisionTaker | LONGCHAR | 1073741823 | Yes |  |  |
| 5 | MeetingID | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | DecisionID |
| TempField*0_34E41B3E774940408A2E561DE71822E9 | Yes | DecisionTaker |
| DecisionID | No | DecisionID |
| tblMeetingLogtblDecisionLog | No | MeetingID |

#### Sample Data (first 3 rows)

| DecisionID | DecisionDescription | DecisionDate | DecisionTaker | MeetingID |
| --- | --- | --- | --- | --- |
| 1 | Engagement d'un kiné | 2018-02-17 00:00:00 | 44 | NULL |
| 2 | Changement de contrat de XX CDD à CDI | NULL |  | 1 |
| 4 | On a décidé à cette date que les accueillantes non bachelières passeront du barème 1/43-1/55 à 1/55 ... | 2018-09-01 00:00:00 | 23;43;44 | 7 |

### Table: `tbl_Log_Meeting`

**Row Count:** 6

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | MeetingID | COUNTER | 10 | No |  |  |
| 2 | MeetingDate | DATETIME | 19 | Yes |  |  |
| 3 | MeetingDescription | VARCHAR | 255 | Yes |  |  |
| 4 | MeetingAgenda | LONGCHAR | 1073741823 | Yes |  |  |
| 5 | MeetingType | VARCHAR | 255 | Yes |  |  |
| 6 | Attendees | LONGCHAR | 1073741823 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| Attendees_9A8552B6FFBA4BD3BD4C7D07B9A7C808 | Yes | Attendees |
| PrimaryKey | Yes | MeetingID |
| MeetingID | No | MeetingID |

#### Sample Data (first 5 rows)

| MeetingID | MeetingDate | MeetingDescription | MeetingAgenda | MeetingType | Attendees |
| --- | --- | --- | --- | --- | --- |
| 1 | 2018-01-30 00:00:00 | NULL | <ol>
 <li>Engagement d'un kiné</li>
 <li>Licenciement de XX</li>
 <li>Pronlogation du contrat de ... | CA | 23;43;44 |
| 3 | 2018-02-13 00:00:00 | NULL | <ol>
 <li>Engagement d'un kiné</li>
 <li>Licenciement de XX</li>
 <li>Pronlogation du contrat de ... | CA | 43;44 |
| 4 | 2018-02-20 00:00:00 | NULL | <ol>
 <li>Engagement d'un kiné</li>
 <li>Licenciement de XX</li>
 <li>Pronlogation du contrat de ... | CA | 23;44 |
| 5 | 2018-02-27 00:00:00 | NULL | <ol>
 <li>Engagement d'un kiné</li>
 <li>Licenciement de XX</li>
 <li>Pronlogation du contrat de ... | CA | 23;43;44 |
| 6 | 2018-02-27 00:00:00 | NULL | NULL | AdHoc |  |

### Table: `tbl_Log_Requests`

**Row Count:** 4

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | RequestId | COUNTER | 10 | No |  |  |
| 2 | RequestorID | INTEGER | 10 | Yes |  |  |
| 3 | RequestDescription | VARCHAR | 255 | Yes |  |  |
| 4 | RequestDate | DATETIME | 19 | Yes |  |  |
| 5 | Deadline | DATETIME | 19 | Yes |  |  |
| 6 | Attachment | LONGCHAR | 1073741823 | Yes |  |  |
| 7 | Status | LONGCHAR | 1073741823 | Yes |  |  |
| 8 | Decision | INTEGER | 10 | Yes |  |  |
| 9 | Comment | LONGCHAR | 1073741823 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| Attachment_99999957C21A4BF59C7EA107EDE3037D | Yes | Attachment |
| PrimaryKey | Yes | RequestId |
| RequestId | No | RequestId |
| RequestorID | No | RequestorID |
| tblDecisionLogRequests | No | Decision |

#### Sample Data (first 4 rows)

| RequestId | RequestorID | RequestDescription | RequestDate | Deadline | Attachment | Status | Decision | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 44 | Récupération des heures supp | 2018-01-10 00:00:00 | 2018-02-28 00:00:00 |  | Acceptée | 1 |  |
| 2 | 32 | Demande de congé sans solde | 2018-02-15 00:00:00 | 2018-02-20 00:00:00 |  | Acceptée | NULL | NULL |
| 3 | 31 | Demande de congé suite à un mariage familale | 2018-02-07 00:00:00 | 2018-02-28 00:00:00 |  | Acceptée | NULL | NULL |
| 5 | 28 | Demande des heures supp | 2018-02-28 00:00:00 | 2018-03-05 00:00:00 |  | Acceptée | NULL | NULL |

### Table: `tbl_RTT`

**Row Count:** 237

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | RTTID | COUNTER | 10 | No |  |  |
| 2 | RTTStart | INTEGER | 10 | Yes |  |  |
| 3 | HouresPerYear | INTEGER | 10 | Yes |  |  |
| 4 | SecteurID | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | RTTID |
| NumbreHoures | No | HouresPerYear |
| SecteurID | No | SecteurID |

#### Sample Data (first 5 rows)

| RTTID | RTTStart | HouresPerYear | SecteurID |
| --- | --- | --- | --- |
| 272 | 50 | 38 | 1 |
| 273 | 51 | 38 | 1 |
| 274 | 52 | 76 | 1 |
| 275 | 53 | 76 | 1 |
| 276 | 54 | 76 | 1 |

### Table: `tbl_RTT_Groups`

**Row Count:** 2

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | RTTGroupID | COUNTER | 10 | No |  |  |
| 2 | RTTGroupName | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | RTTGroupID |

#### Sample Data (first 2 rows)

| RTTGroupID | RTTGroupName |
| --- | --- |
| 1 | MKI |
| 2 | Admin |

### Table: `tbl_Sec_Indexation`

**Row Count:** 2

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | IndexationID | COUNTER | 10 | No |  |  |
| 2 | IndexationNumber | DOUBLE | 53 | Yes |  |  |
| 3 | SecteurID | INTEGER | 10 | Yes |  |  |
| 4 | IndexationDate | DATETIME | 19 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | IndexationID |
| IndexationID | No | IndexationID |

#### Sample Data (first 2 rows)

| IndexationID | IndexationNumber | SecteurID | IndexationDate |
| --- | --- | --- | --- |
| 3 | 0.0125 | 9 | 2021-01-01 00:00:00 |
| 4 | 0.12 | 15 | 2020-03-01 00:00:00 |

### Table: `tbl_Sec_Secteurs`

**Row Count:** 20

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | SecteurID | COUNTER | 10 | No |  |  |
| 2 | Secteur | VARCHAR | 255 | Yes |  |  |
| 3 | CodeBarème | VARCHAR | 255 | Yes |  |  |
| 4 | Chef de secteur | INTEGER | 10 | Yes |  |  |
| 5 | Mission | LONGCHAR | 1073741823 | Yes |  |  |
| 6 | RTTGroupID | INTEGER | 10 | Yes |  |  |
| 7 | NoRTT | BIT | 1 | No |  |  |
| 8 | NON IFIC | BIT | 1 | No |  |  |
| 9 | IFIC Categorie | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | SecteurID |
| CodeBarème | No | CodeBarème |
| DepartmentID | No | SecteurID |
| GroupSecteurID | No | RTTGroupID |
| tbl_RTT_Groupstbl_Sec_Secteurs | No | RTTGroupID |
| tblSecteursSecteur | No | Secteur |

#### Sample Data (first 5 rows)

| SecteurID | Secteur | CodeBarème | Chef de secteur | Mission | RTTGroupID | NoRTT | NON IFIC | IFIC Categorie |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ACCUEIL Diplôme Supérieur NON IFIC BAR 1/55 - 1/61 - 1/77 | 1 | NULL | NULL | 2 | False | True | NULL |
| 2 | ADMIN | NULL | NULL | NULL | 2 | False | True | NULL |
| 3 | CDD et remplaçante Accueil/admin IFIC  CAT 12 | NULL | NULL | NULL | 2 | False | False | 12 |
| 4 | INF NON IFIC BAR 1/55 - 1/61 - 1/77 (+2a) | NULL | NULL | NULL | 1 | False | True | NULL |
| 5 | KINE BAR 1/80 | 1/80 | NULL | NULL | 1 | False | True | NULL |

### Table: `tbl_Seniority`

**Row Count:** 486

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | SeniorityID | COUNTER | 10 | No |  |  |
| 2 | Years | SMALLINT | 5 | Yes |  |  |
| 3 | BaseSalary | DOUBLE | 53 | Yes |  |  |
| 4 | Secteur | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | SeniorityID |
| UniqueBarème | Yes | Years, Secteur |
| tblSecteurstblSeniority | No | Secteur |

#### Sample Data (first 5 rows)

| SeniorityID | Years | BaseSalary | Secteur |
| --- | --- | --- | --- |
| 337 | 0 | 3443.7 | 5 |
| 338 | 1 | 3612.42 | 5 |
| 339 | 3 | 3763.55 | 5 |
| 340 | 5 | 3914.69 | 5 |
| 341 | 7 | 4065.82 | 5 |

### Table: `tbl_TimeSheet`

**Row Count:** 36

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | TimeSheetId | COUNTER | 10 | No |  |  |
| 2 | Active | BIT | 1 | No |  |  |
| 3 | EmployeeID | INTEGER | 10 | Yes |  |  |
| 4 | StartDate | DATETIME | 19 | Yes |  |  |
| 5 | EndDate | DATETIME | 19 | Yes |  |  |
| 6 | Monday | DATETIME | 19 | Yes |  |  |
| 7 | Tuesday | DATETIME | 19 | Yes |  |  |
| 8 | Wednesday | DATETIME | 19 | Yes |  |  |
| 9 | Thursday | DATETIME | 19 | Yes |  |  |
| 10 | Friday | DATETIME | 19 | Yes |  |  |
| 11 | Saturday | DATETIME | 19 | Yes |  |  |
| 12 | Sunday | DATETIME | 19 | Yes |  |  |
| 13 | Comment | VARCHAR | 255 | Yes |  |  |
| 14 | TimesheetCategory | INTEGER | 10 | Yes |  |  |
| 15 | FullTimeH | INTEGER | 10 | Yes |  |  |
| 16 | FullTimeM | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | TimeSheetId |
| tbl_Abs_AbsenceCodestbl_TimeSheet | No | TimesheetCategory |
| tblEmployeestblTimeSheet | No | EmployeeID |

#### Sample Data (first 5 rows)

| TimeSheetId | Active | EmployeeID | StartDate | EndDate | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday | Comment | TimesheetCategory | FullTimeH | FullTimeM |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | True | 16 | NULL | NULL | 1899-12-30 08:00:00 | 1899-12-30 08:00:00 | 1899-12-30 06:00:00 | 1899-12-30 08:00:00 | 1899-12-30 08:00:00 | NULL | NULL | NULL | NULL | 38 | NULL |
| 29 | True | 18 | NULL | NULL | 1899-12-30 08:00:00 | 1899-12-30 08:00:00 | 1899-12-30 08:00:00 | 1899-12-30 08:00:00 | 1899-12-30 06:00:00 | NULL | NULL | NULL | NULL | 38 | NULL |
| 30 | True | 23 | NULL | NULL | 1899-12-30 09:30:00 | 1899-12-30 09:00:00 | 1899-12-30 05:00:00 | 1899-12-30 09:30:00 | 1899-12-30 05:00:00 | NULL | NULL | NULL | NULL | 38 | NULL |
| 31 | True | 27 | NULL | NULL | 1899-12-30 06:00:00 | 1899-12-30 08:00:00 | 1899-12-30 07:30:00 | 1899-12-30 08:30:00 | 1899-12-30 08:00:00 | NULL | NULL | NULL | NULL | 38 | NULL |
| 32 | True | 28 | NULL | NULL | 1899-12-30 07:30:00 | 1899-12-30 08:40:00 | 1899-12-30 04:40:00 | 1899-12-30 09:30:00 | 1899-12-30 07:40:00 | NULL | NULL | NULL | NULL | 38 | NULL |

### Table: `tbl_VacationRight`

**Row Count:** 122

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | ID | COUNTER | 10 | No |  |  |
| 2 | EmployeeName | INTEGER | 10 | Yes |  |  |
| 3 | AbsenceCode | INTEGER | 10 | Yes |  |  |
| 4 | VacationYear | INTEGER | 10 | Yes |  |  |
| 5 | Days | INTEGER | 10 | Yes |  |  |
| 6 | Hours | INTEGER | 10 | Yes |  |  |
| 7 | Minutes | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | ID |
| UniqueKey | Yes | EmployeeName, AbsenceCode, VacationYear |
| AbsenceCode | No | AbsenceCode |
| tbluAbsenceCodestblVacationRight | No | AbsenceCode |

#### Sample Data (first 5 rows)

| ID | EmployeeName | AbsenceCode | VacationYear | Days | Hours | Minutes |
| --- | --- | --- | --- | --- | --- | --- |
| 19 | 30 | 1 | 2021 | NULL | 192 | NULL |
| 20 | 30 | 11 | 2021 | NULL | 152 | NULL |
| 22 | 30 | 21 | 2021 | NULL | 30 | 24 |
| 23 | 30 | 5 | 2021 | 3 | NULL | NULL |
| 24 | 35 | 11 | 2021 | NULL | 121 | 36 |

### Table: `tbl_YearCalendar`

**Row Count:** 203

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | AttendanceID | COUNTER | 10 | No |  |  |
| 2 | YearVacation | INTEGER | 10 | Yes |  |  |
| 3 | AbsenceDate | DATETIME | 19 | Yes |  |  |
| 4 | EmployeeID | INTEGER | 10 | Yes |  |  |
| 5 | AbsenceID | INTEGER | 10 | Yes |  |  |
| 6 | AbsenceTime | DATETIME | 19 | Yes |  |  |
| 7 | AbsenceDays | INTEGER | 10 | Yes |  |  |
| 8 | AbsenceReason | LONGCHAR | 1073741823 | Yes |  |  |
| 9 | DateCreated | DATETIME | 19 | Yes |  |  |
| 10 | HolidaySelectionID | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | AttendanceID |
| UniqueKey | Yes | AbsenceDate, EmployeeID, AbsenceID, YearVacation |
| AbID | No | AttendanceID |
| AbsenceID | No | AbsenceID |
| EmployeeID | No | EmployeeID |
| tbl_Abs_HolidaySelectiontbl_YearCalendar | No | HolidaySelectionID |
| tbluAbsenceCodestbl_YearCalendar | No | AbsenceID |
| tbluEmployeestbl_YearCalendar | No | EmployeeID |

#### Sample Data (first 5 rows)

| AttendanceID | YearVacation | AbsenceDate | EmployeeID | AbsenceID | AbsenceTime | AbsenceDays | AbsenceReason | DateCreated | HolidaySelectionID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 122 | 2021 | 2021-05-14 00:00:00 | 30 | 5 | NULL | 1 | N/A | 2021-01-03 23:51:58 | 88 |
| 133 | 2021 | 2021-04-01 00:00:00 | 50 | 11 | 1899-12-30 08:00:00 | NULL | N/A | 2021-01-04 00:18:55 | 91 |
| 134 | 2021 | 2021-04-02 00:00:00 | 50 | 11 | 1899-12-30 08:00:00 | NULL | N/A | 2021-01-04 00:18:55 | 91 |
| 135 | 2021 | 2021-04-06 00:00:00 | 50 | 11 | 1899-12-30 08:00:00 | NULL | N/A | 2021-01-04 00:18:55 | 91 |
| 136 | 2021 | 2021-04-07 00:00:00 | 50 | 11 | 1899-12-30 06:00:00 | NULL | N/A | 2021-01-04 00:18:55 | 91 |

### Table: `tbl_cmn_Locations`

**Row Count:** 3

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | LocationID | COUNTER | 10 | No |  |  |
| 2 | LocationName | VARCHAR | 255 | Yes |  |  |
| 3 | Address | VARCHAR | 255 | Yes |  |  |
| 4 | PostCode | VARCHAR | 255 | Yes |  |  |
| 5 | Commune | VARCHAR | 255 | Yes |  |  |
| 6 | Country | VARCHAR | 255 | Yes |  |  |
| 7 | ResponsableID | INTEGER | 10 | Yes |  |  |
| 8 | OrganisationID | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | LocationID |
| OrganisationID | No | OrganisationID |
| PostCode | No | PostCode |

#### Sample Data (first 3 rows)

| LocationID | LocationName | Address | PostCode | Commune | Country | ResponsableID | OrganisationID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Saint-Denis | NULL | NULL | NULL | NULL | NULL | 1 |
| 2 | Saint-Antoine | NULL | NULL | NULL | NULL | NULL | 1 |
| 3 | Britannique | NULL | NULL | NULL | NULL | NULL | 1 |

### Table: `tbl_tst_TestCaseSteps`

**Row Count:** 167

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | TestCaseStepID | COUNTER | 10 | No |  |  |
| 2 | Description | LONGCHAR | 1073741823 | Yes |  |  |
| 3 | Expected Result | LONGCHAR | 1073741823 | Yes |  |  |
| 4 | TestCaseID | INTEGER | 10 | Yes |  |  |
| 5 | Step | INTEGER | 10 | Yes |  |  |
| 6 | TestCaseStepPrintScreenID | INTEGER | 10 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | TestCaseStepID |
| TestCaseID | No | TestCaseID |

#### Sample Data (first 5 rows)

| TestCaseStepID | Description | Expected Result | TestCaseID | Step | TestCaseStepPrintScreenID |
| --- | --- | --- | --- | --- | --- |
| 6 | On the main menu, go to General | <div>Submenu is displayed:</div>

<div>Entities</div>

<div>Leasings</div>

<div><font color=b... | 28 | 10 | 23 |
| 7 | Click on the Entity submenu | <div>Entity Web Page is displayed with available Entities</div> | 28 | 20 | 22 |
| 8 | Select New | Data entry form is displayed | 28 | 25 | 29 |
| 9 | Fill in the following fields:<br>
Entity Name<br>
Representative Name<br>
VATNumber<br>
Registra... | Fields are filled in | 28 | 30 | NULL |
| 10 | Click Save to save the record | The Entity is created | 28 | 40 | NULL |

### Table: `tbl_tst_TestCaseStepsPrintScreen`

**Row Count:** 28

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | TestCaseStepPrintScreenID | COUNTER | 10 | No |  |  |
| 2 | PrintScreenName | VARCHAR | 255 | Yes |  |  |
| 3 | PrintScreen | LONGCHAR | 1073741823 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | TestCaseStepPrintScreenID |
| PrintScreen_3332A5E29D8F40CC8713875D3F5A54B1 | Yes | PrintScreen |

#### Sample Data (first 5 rows)

| TestCaseStepPrintScreenID | PrintScreenName | PrintScreen |
| --- | --- | --- |
| 1 | Entity Sites | Entity Sites.png |
| 2 | Entity Indexation | Entity Indexation.png |
| 3 | Sector Details RTT | Sector Details RTT.png |
| 4 | Sector Details Salary Increase Calculated | Sector Details Salary Increase Calculated.png |
| 5 | Sector Details Salary Increase | Sector Details Salary Increase.png |

### Table: `tbl_tst_TestCases`

**Row Count:** 27

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | TestCaseID | COUNTER | 10 | No |  |  |
| 2 | Dependency | VARCHAR | 255 | Yes |  |  |
| 3 | Test Objective | LONGCHAR | 1073741823 | Yes |  |  |
| 4 | Priority | VARCHAR | 255 | Yes |  |  |
| 5 | UseCaseID | INTEGER | 10 | Yes |  |  |
| 6 | Sequence | INTEGER | 10 | Yes |  |  |
| 7 | Precondition | LONGCHAR | 1073741823 | Yes |  |  |
| 8 | Role | VARCHAR | 255 | Yes |  |  |
| 9 | Postcondition | LONGCHAR | 1073741823 | Yes |  |  |
| 10 | Comment | LONGCHAR | 1073741823 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | TestCaseID |
| UseCaseID | No | UseCaseID |

#### Sample Data (first 5 rows)

| TestCaseID | Dependency | Test Objective | Priority | UseCaseID | Sequence | Precondition | Role | Postcondition | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | NULL | Create a new site | 0 | 2 | 2010 | Connect with role of Administrator | Admin | The Site is created |  |
| 3 | NULL | Create new leasing Type | 0 | 3 | 2020 | Connect with role Leasing Manager | Leasing Manager | The leasing Type is created |  |
| 4 | NULL | Create new leasing Asset | 0 | 4 | 2030 | Connect with role Leasing Manager | Leasing Manager | The new Asset is created |  |
| 5 | NULL | <div>Create new RTT Group</div> | 0 | 5 | 2040 | Connect with role of Administrator | Admin | The sector group is created |  |
| 6 | NULL | Create new sector | 0 | 6 | 2050 | Connect with role of Administrator | Admin | The sector is created |  |

### Table: `tbl_tst_UseCases`

**Row Count:** 27

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | UseCaseID | COUNTER | 10 | No |  |  |
| 2 | Type | VARCHAR | 255 | Yes |  |  |
| 3 | Seq | INTEGER | 10 | Yes |  |  |
| 4 | Description | VARCHAR | 255 | Yes |  |  |
| 5 | Release | VARCHAR | 255 | Yes |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | UseCaseID |

#### Sample Data (first 5 rows)

| UseCaseID | Type | Seq | Description | Release |
| --- | --- | --- | --- | --- |
| 1 | cmn | 1100 | Create new Entity | 1.0.0 |
| 2 | cmn | 1200 | Create a new site | 1.0.0 |
| 3 | cmn | 1400 | Create new leasing Type | 1.0.0 |
| 4 | cmn | 1425 | Create new leasing Asset | 1.0.0 |
| 5 | sec | 1450 | Create new RTT Group | 1.0.0 |

### Table: `tbluBoughtVacation`

**Row Count:** 48

#### Columns

| # | Column Name | Type | Size | Nullable | PK | Default |
|---|-------------|------|------|----------|-----|---------|
| 1 | BVacID | COUNTER | 10 | No |  |  |
| 2 | EmployeeID | INTEGER | 10 | Yes |  |  |
| 3 | BoughtYear | DATETIME | 19 | Yes |  |  |
| 4 | BoughtVac | BIT | 1 | No |  |  |

#### Indexes

| Index Name | Unique | Columns |
|------------|--------|---------|
| PrimaryKey | Yes | BVacID |
| BVacID | No | BVacID |
| EmployeeID | No | EmployeeID |
| tbluEmployeestbluBoughtVacation | No | EmployeeID |

#### Sample Data (first 5 rows)

| BVacID | EmployeeID | BoughtYear | BoughtVac |
| --- | --- | --- | --- |
| 1 | 16 | 2013-01-01 00:00:00 | True |
| 2 | 16 | 2014-01-01 00:00:00 | True |
| 3 | 16 | 2015-01-01 00:00:00 | True |
| 4 | 16 | 2016-01-01 00:00:00 | True |
| 5 | 16 | 2017-01-01 00:00:00 | True |

---
## Queries / Views


### Query: `Contacts Extended`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `Qry_RTTCalc`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `Query1`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `Query2`

**Output Columns:** Expr1

### Query: `Requête1`

**Output Columns:** TimeSheetId

**Sample Output (1 rows):**

| TimeSheetId |
| --- |
| 47 |

### Query: `qryVacationRight`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qryVacationRightTaken`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qryVacationRightTaken2`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qryVacationRightTaken2WithParam`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qryVacationTaken`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qryVacationTakenParam`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qry_ActiveInactiveEmployees`

**Output Columns:** EmployeeID, EmployeeName, SecteurID, IsInactive, EmpDateOfHire

**Sample Output (3 rows):**

| EmployeeID | EmployeeName | SecteurID | IsInactive | EmpDateOfHire |
| --- | --- | --- | --- | --- |
| 32 | Adjuah, GORRE NDIAYE | 5 | False | 2014-06-01 00:00:00 |
| 59 | Aïssatou, BAH | 13 | False | 2014-06-01 00:00:00 |
| 44 | Alphonse, SIBOMANA | 9 | False | 2002-11-01 00:00:00 |

### Query: `qry_Alerts`

*Error: ('42S02', "[42S02] [Microsoft][ODBC Microsoft Access Driver] The Microsoft Access database engine cannot find the input table or query 'tblAlerts'. Make sure it exists and that its name is spelled correctly. (-1305) (SQLExecDirectW)")*

### Query: `qry_FillHolidays`

**Output Columns:** HolidayID, HolidayDate

**Sample Output (3 rows):**

| HolidayID | HolidayDate |
| --- | --- |
| 35 | 2021-01-01 00:00:00 |
| 36 | 2021-04-05 00:00:00 |
| 37 | 2021-05-01 00:00:00 |

### Query: `qry_FillTextBoxes`

**Output Columns:** AbsenceDate, EmployeeName, AbsenceCode, EmployeeID, AbsenceColorCode, AbsenceTextColorCode, AbsenceColorTag, AbsenceTime, TimeType, AbsenceDays

**Sample Output (3 rows):**

| AbsenceDate | EmployeeName | AbsenceCode | EmployeeID | AbsenceColorCode | AbsenceTextColorCode | AbsenceColorTag | AbsenceTime | TimeType | AbsenceDays |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2021-01-20 00:00:00 | DUPLAT, Fabienne | RTT | 28 | 35653 | 16777215 | <font color=black style='BACKGROUND-COLOR:#0072BC'> | 1899-12-30 04:40:00 | H/M | NULL |
| 2021-01-25 00:00:00 | DUPLAT, Fabienne | RTT | 28 | 35653 | 16777215 | <font color=black style='BACKGROUND-COLOR:#0072BC'> | 1899-12-30 07:30:00 | H/M | NULL |
| 2021-02-09 00:00:00 | DUPLAT, Fabienne | RTT | 28 | 35653 | 16777215 | <font color=black style='BACKGROUND-COLOR:#0072BC'> | 1899-12-30 05:40:00 | H/M | NULL |

### Query: `qry_MaxSeniorityPerSector`

**Output Columns:** maxY, Secteur

**Sample Output (3 rows):**

| maxY | Secteur |
| --- | --- |
| 45 | 1 |
| 45 | 3 |
| 25 | 4 |

### Query: `qry_NumberOfIncidents`

*Error: ('07002', '[07002] [Microsoft][ODBC Microsoft Access Driver] Too few parameters. Expected 1. (-3010) (SQLExecDirectW)')*

### Query: `qry_RTT`

**Output Columns:** RTTID, RTTStart, HouresPerYear, SecteurID

**Sample Output (3 rows):**

| RTTID | RTTStart | HouresPerYear | SecteurID |
| --- | --- | --- | --- |
| 272 | 50 | 38 | 1 |
| 273 | 51 | 38 | 1 |
| 274 | 52 | 76 | 1 |

### Query: `qry_RequestDropDownlist`

**Output Columns:** RequestId, Expr1, ContactName

**Sample Output (3 rows):**

| RequestId | Expr1 | ContactName |
| --- | --- | --- |
| 2 | 15/02/2018|Demande de congé sans solde|Adjuah GORRE NDIAYE | Adjuah GORRE NDIAYE |
| 1 | 10/01/2018|Récupération des heures supp|Alphonse SIBOMANA | Alphonse SIBOMANA |
| 5 | 28/02/2018|Demande des heures supp|Fabienne DUPLAT | Fabienne DUPLAT |

### Query: `qry_Sec_indexCal`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'DProduct' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qry_Timesheet`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'GetTimeSheetTotal' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qry_UpdateEmpInfo`

**Output Columns:** IsInactive, SecteurID, EmployeeID, EmpFName, EmpLName, EmpDateOfHire

**Sample Output (3 rows):**

| IsInactive | SecteurID | EmployeeID | EmpFName | EmpLName | EmpDateOfHire |
| --- | --- | --- | --- | --- | --- |
| False | 1 | 18 | Chaimae | BOUZRATI | 2009-09-20 00:00:00 |
| False | 1 | 50 | Chloé | BLOIN | 2013-05-22 00:00:00 |
| False | 1 | 35 | Cindy | HUIJSKENS | 2013-11-28 00:00:00 |

### Query: `qry_UpdateEmpInfoBoughtVac`

**Output Columns:** EmployeeID, BoughtYear, BoughtVac

**Sample Output (3 rows):**

| EmployeeID | BoughtYear | BoughtVac |
| --- | --- | --- |
| 16 | 2013-01-01 00:00:00 | True |
| 16 | 2014-01-01 00:00:00 | True |
| 16 | 2015-01-01 00:00:00 | True |

### Query: `qry_rpt_AbsencesForYear`

*Error: ('07002', '[07002] [Microsoft][ODBC Microsoft Access Driver] Too few parameters. Expected 2. (-3010) (SQLExecDirectW)')*

### Query: `qry_rpt_AbsenteeismPolicy`

*Error: ('07002', '[07002] [Microsoft][ODBC Microsoft Access Driver] Too few parameters. Expected 1. (-3010) (SQLExecDirectW)')*

### Query: `qry_rpt_YearAbsenceByMonth`

*Error: ('07002', '[07002] [Microsoft][ODBC Microsoft Access Driver] Too few parameters. Expected 2. (-3010) (SQLExecDirectW)')*

### Query: `qry_subFormVacPDSDSummary`

*Error: ('42S02', "[42S02] [Microsoft][ODBC Microsoft Access Driver] The Microsoft Access database engine cannot find the input table or query 'tbluAbsenceCodes'. Make sure it exists and that its name is spelled correctly. (-1305) (SQLExecDirectW)")*

### Query: `qry_subFormVacPDSDSummary_PD_Left`

*Error: ('42S02', "[42S02] [Microsoft][ODBC Microsoft Access Driver] The Microsoft Access database engine cannot find the input table or query 'tbluAbsenceCodes'. Make sure it exists and that its name is spelled correctly. (-1305) (SQLExecDirectW)")*

### Query: `qry_subFormVacPDSDSummary_PSD_Left`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*

### Query: `qry_subFormVacPDSDSummary_Vac_Left`

*Error: ('42S02', "[42S02] [Microsoft][ODBC Microsoft Access Driver] The Microsoft Access database engine cannot find the input table or query 'tbluAbsenceCodes'. Make sure it exists and that its name is spelled correctly. (-1305) (SQLExecDirectW)")*

### Query: `qry_tst_TestCaseSteps`

**Output Columns:** TestCaseStepID, Description, Expected Result, TestCaseID, Step, TestCaseStepPrintScreenID, Sequence, Test Objective, PrintScreen

**Sample Output (3 rows):**

| TestCaseStepID | Description | Expected Result | TestCaseID | Step | TestCaseStepPrintScreenID | Sequence | Test Objective | PrintScreen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 | On the main menu, go to General | <div>Submenu is displayed:</div>

<div>Entities</div>

<div>Leasings</div>

<div><font color=b... | 28 | 10 | 23 | 2000 | Create new Entity | Main Menu.png |
| 7 | Click on the Entity submenu | <div>Entity Web Page is displayed with available Entities</div> | 28 | 20 | 22 | 2000 | Create new Entity | Entity General Info .png |
| 8 | Select New | Data entry form is displayed | 28 | 25 | 29 | 2000 | Create new Entity | Entity General Info Entry Mode.png |

### Query: `xqryRTTCurrentYear_2`

*Error: ('42000', "[42000] [Microsoft][ODBC Microsoft Access Driver] Undefined function 'Nz' in expression. (-3102) (SQLExecDirectW)")*