import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, recordId, action, oldValues, newValues, performedBy, context } = body;

    if (!tableName || recordId === undefined || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const changedFields: string[] = [];
    if (action === "UPDATE" && oldValues && newValues) {
      for (const key of Object.keys(newValues)) {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changedFields.push(key);
        }
      }
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("audit_log").insert({
      table_name: tableName,
      record_id: recordId,
      action,
      old_values: oldValues || null,
      new_values: newValues || null,
      changed_fields: changedFields.length > 0 ? changedFields : null,
      performed_by: performedBy || "gestionnaire",
      performed_at: new Date().toISOString(),
      context: context || null,
    });

    if (error) {
      console.error("[API /audit] Insert failed:", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API /audit] Unexpected error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
