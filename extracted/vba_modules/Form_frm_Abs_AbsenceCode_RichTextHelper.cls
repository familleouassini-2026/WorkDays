' Module: Form_frm_Abs_AbsenceCode_RichTextHelper
' Type: Document Module

Option Compare Database



Private Sub Form_Load()
  'You can do this in design view, but in case you forget
  Me.txtBxInput.TextFormat = acTextFormatHTMLRichText
  Me.txtBxOutput.TextFormat = acTextFormatPlain
End Sub
Private Sub cmdGetCodes_Click()
  Me.txtBxOutput.Value = Me.txtBxInput.Value
  'Since you need to remove the double quotes
  Me.txtBxOutput.Value = Replace(Me.txtBxOutput.Value, """", "")
End Sub
Public Sub UseTags()
  Dim strOne As String
  Dim strTwo As String
  strOne = "Bold Text"
  strTwo = "Red Text"
  Me.txtBxInput.Value = "<strong>" & strOne & "</strong>" & " and "
  Me.txtBxInput.Value = Me.txtBxInput.Value & "<font color=#ED1C24>" & strTwo & "</font>"
  'need to surround with div
  Me.txtBxInput.Value = "<div>" & Me.txtBxInput.Value & "</div>"
  Me.txtBxOutput.Value = Me.txtBxInput.Value
End Sub
Private Sub cmdTest_Click()
 UseTags
End Sub
