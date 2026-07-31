' Module: Form_frm_Sec_Secteurs
' Type: Document Module

Option Compare Database

Private Sub Text60_Click()
    If Me.Form.Dirty = True Then
    DoCmd.Save
    End If
    
    
    If Not IsNull([SecteurID]) Then
    
    DoCmd.OpenForm "frm_Sec_SecteurDetails", acNormal, , "[SecteurID]=" & Nz([SecteurID], 0), , acDialog
    
    Else
    DoCmd.OpenForm "frm_Sec_SecteurDetails", acNormal, , , acFormAdd, acDialog
    
    End If
    
    
End Sub