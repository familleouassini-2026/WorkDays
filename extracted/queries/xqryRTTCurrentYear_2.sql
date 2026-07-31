-- Query: xqryRTTCurrentYear_2
-- Type: UNION

SELECT [Contact Name], EmpDateOfBirth, SecteurName , Age, [AgeMonthsPortion], NextBirthday, KAge1 as KAge, Kdate1 as kdate, Kdate1Alert as KdateAlert, Year([Kdate1]) AS Expr,KAge1 as KAgeA,KAge2 as KAgeB,KAge3 as KAgeC, Kdate1 as kdateA,Kdate2 as kdateB, Kdate3 as kdateC

FROM [Contacts Extended]
WHERE Year([Kdate1]) = [Forms]![frm_1_NavigationForm]![NavigationSubform].[Form]![CurrentFilter]

UNION ALL

SELECT [Contact Name], EmpDateOfBirth, SecteurName , Age, [AgeMonthsPortion], NextBirthday, KAge2 as KAge, Kdate2 as kdate, Kdate2Alert as KdateAlert, Year([Kdate2]) AS Expr,KAge1 as KAgeA,KAge2 as KAgeB,KAge3 as KAgeC,Kdate1 as kdateA,Kdate2 as kdateB, Kdate3 as kdateC

FROM [Contacts Extended]
WHERE Year([Kdate2]) = [Forms]![frm_1_NavigationForm]![NavigationSubform].[Form]![CurrentFilter]

UNION ALL SELECT [Contact Name], EmpDateOfBirth, SecteurName , Age, [AgeMonthsPortion], NextBirthday, KAge3 as KAge, Kdate3 as kdate, Kdate3Alert as KdateAlert , Year([Kdate3]) AS Expr,KAge1 as KAgeA,KAge2 as KAgeB,KAge3 as KAgeC,Kdate1 as kdateA,Kdate2 as kdateB, Kdate3 as kdateBC

FROM [Contacts Extended]
WHERE Year([Kdate3]) = [Forms]![frm_1_NavigationForm]![NavigationSubform].[Form]![CurrentFilter];
