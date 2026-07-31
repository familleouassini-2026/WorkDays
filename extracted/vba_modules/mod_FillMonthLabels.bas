' Module: mod_FillMonthLabels
' Type: Standard Module


Option Explicit

Public Sub FillSubFormMonthLabels(frm As Access.Form, TheYear As Integer, TheMonth As Integer)
'==================================================================================================
'//Fills the grids label(s) with the correct day and;
'  1) Hides day labels that dont have a date associated with them
'  2) Disable and locks text boxes without a date so data cant be entered
'==================================================================================================
    Dim ctl As Access.Label
    Dim ctlt As Access.TextBox    'Added to disable/lock text boxes without a date so data cant be entered
    Dim i As Integer
    Dim FirstDayOfMonth As Date   'First of month
    Dim DaysInMonth As Integer    'Days in month
    Dim intOffSet As Integer      'Offset to first label for month.
    Dim intDay As Integer         'Day under consideration.
    Dim ParentIsForm As Boolean
    Const ctlBackColor = 14211288    'Gray color thats used for Holiday shading/unshading
    'Need to know if the parent is a form or report because you can not do certain things with reports
    ParentIsForm = (TypeOf frm.Parent Is Access.Form)

    FirstDayOfMonth = getFirstOfMonth(TheYear, TheMonth)
    DaysInMonth = getDaysInMonth(FirstDayOfMonth)   'Days in month.
    intOffSet = getOffset(TheYear, TheMonth, vbSaturday)    'Offset to first label for month.
    ' Debug.Print DaysInMonth
    If ParentIsForm Then frm.cmdSubFormTransButton.SetFocus    'Sets focus to a transparent button in the subcalendar form
    For i = 1 To 37
        Set ctl = frm.Controls("lbl" & i)
        Set ctlt = frm.Controls("txt" & i)    'Added to disable/lock text boxes without a date so data cant be entered
        ctl.Caption = ""
        ctl.BackColor = ctlBackColor  'Resets the backcolor to Gray
        intDay = i - intOffSet        'Transforms label number to day in month
        If intDay > 0 And intDay <= DaysInMonth Then
            ctl.Caption = intDay  'Displays day number in correct label
            If ParentIsForm Then ctlt.Enabled = True
            'Added to enable textbox(s) that have a date associated with them
            ctl.Visible = True    'Added so the months labels that display a date show on the grid
        Else
            If ParentIsForm Then ctlt.Enabled = False    'Added to disable/lock text boxes without a date so data cant be entered
            ctl.Visible = False    'Added so months lables that don't display or have a date do not show on grid
        End If
    Next i
End Sub