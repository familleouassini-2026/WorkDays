-- Query: qryVacationRightTaken2
-- Type: SELECT

SELECT qryVacationRightTaken.*, Abs([DiffinMinutes]) Mod 60 AS DiffinMinutesMinFraction, Fix(Abs([DiffinMinutes])/60) AS DiffinMinutesInHoursFraction, IIf([DiffinMinutes]<0,"-","") & Right("0000" & [DiffinMinutesInHoursFraction],4) & ":" & Right("00" & [DiffinMinutesMinFraction],2) AS DiffIntimeFormat, IIf([TimeType]="H/M","",[TotalDaysTaken]) AS TotalDaysTakennz, IIf([TimeType]="H/M","",[TotalDaysRight]) AS TotalDaysRightnz, IIf([TimeType]="H/M","",[DiffInDays]) AS DiffInDaysnz, IIf([TimeType]="Jours","",[DiffIntimeFormat]) AS DiffIntimeFormatnz
FROM qryVacationRightTaken;
