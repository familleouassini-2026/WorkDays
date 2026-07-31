-- Query: qry_tst_TestCaseSteps
-- Type: SELECT

SELECT tbl_tst_TestCaseSteps.*, tbl_tst_TestCases.Sequence, tbl_tst_TestCases.[Test Objective], tbl_tst_TestCaseStepsPrintScreen.PrintScreen
FROM tbl_tst_TestCases RIGHT JOIN (tbl_tst_TestCaseStepsPrintScreen RIGHT JOIN tbl_tst_TestCaseSteps ON tbl_tst_TestCaseStepsPrintScreen.TestCaseStepPrintScreenID = tbl_tst_TestCaseSteps.TestCaseStepPrintScreenID) ON tbl_tst_TestCases.TestCaseID = tbl_tst_TestCaseSteps.TestCaseID
ORDER BY tbl_tst_TestCases.Sequence, tbl_tst_TestCaseSteps.Step;
