import { createClient } from "@/lib/supabase/client";

export async function auditLog(params: {
  tableName: string;
  recordId: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  performedBy?: string;
  context?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const changedFields: string[] = [];

    if (params.action === "UPDATE" && params.oldValues && params.newValues) {
      for (const key of Object.keys(params.newValues)) {
        if (JSON.stringify(params.oldValues[key]) !== JSON.stringify(params.newValues[key])) {
          changedFields.push(key);
        }
      }
    }

    const { error } = await supabase.from("audit_log").insert({
      table_name: params.tableName,
      record_id: params.recordId,
      action: params.action,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      changed_fields: changedFields.length > 0 ? changedFields : null,
      performed_by: params.performedBy || "gestionnaire",
      performed_at: new Date().toISOString(),
      context: params.context || null,
    });

    if (error) {
      console.error("[auditLog] Insert failed:", error.message, error.details, error.hint);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[auditLog] Unexpected error:", err);
    return { success: false, error: String(err) };
  }
}
