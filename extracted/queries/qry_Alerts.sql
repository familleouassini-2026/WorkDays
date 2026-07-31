-- Query: qry_Alerts
-- Type: SELECT

SELECT tblAlerts.*, DateAdd("d",[AlertDuration],[AlertDate]) AS AlertEnd
FROM tblAlerts;
